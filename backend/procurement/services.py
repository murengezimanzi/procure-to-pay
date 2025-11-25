from django.db import transaction
from .models import PurchaseRequest, ApprovalStep
from core.models import User
from .utils.ai_processor import DocumentProcessor 

class WorkflowEngine:
    @staticmethod
    def create_request(validated_data, user, proforma_file):
        with transaction.atomic():
            # 1. Run AI Extraction
            ai_data = DocumentProcessor.extract_proforma_data(proforma_file)
            validated_data.pop('proforma_file', None) 

            # 2. Create the Request with AI data
            req = PurchaseRequest.objects.create(
                **validated_data,
                proforma_file=proforma_file,
                created_by=user,
                status=PurchaseRequest.Status.PENDING,
                ai_metadata=ai_data
            )

            # 3. Create Approval Steps
            ApprovalStep.objects.create(request=req, level=1, status=ApprovalStep.Status.PENDING)
            ApprovalStep.objects.create(request=req, level=2, status=ApprovalStep.Status.PENDING)

            return req

    @staticmethod
    def process_approval(step, user, action, comment):
        with transaction.atomic():
            step.approver = user
            step.comments = comment
            step.status = ApprovalStep.Status.APPROVED if action == 'approve' else ApprovalStep.Status.REJECTED
            step.save()

            request = step.request

            if action == 'reject':
                request.status = PurchaseRequest.Status.REJECTED
                request.save()
                return request

            if action == 'approve':
                if step.level == 1:
                    # Logic for moving to level 2 (handled by UI usually showing pending L2)
                    pass 
                elif step.level == 2:
                    # Final Approval - GENERATE PO
                    request.status = PurchaseRequest.Status.APPROVED
                    
                    # Generate PDF
                    pdf_name, pdf_file = DocumentProcessor.generate_purchase_order_doc(request)
                    request.purchase_order_doc.save(pdf_name, pdf_file)
                    
                    request.save()
                    
            return request

    @staticmethod
    def submit_receipt(request, receipt_file):
        # 1. Save Receipt
        request.receipt_file = receipt_file
        
        # 2. Run Validation Logic
        validation_result = DocumentProcessor.validate_receipt(receipt_file, request.amount)
        
        # Store result in metadata
        if request.ai_metadata:
            request.ai_metadata['receipt_validation'] = validation_result
        else:
            request.ai_metadata = {'receipt_validation': validation_result}

        request.status = PurchaseRequest.Status.COMPLETED
        request.save()
        return request