from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import PurchaseRequest, ApprovalStep
from .serializers import PurchaseRequestSerializer
from .services import WorkflowEngine
from core.models import User

class PurchaseRequestViewSet(viewsets.ModelViewSet):
    """
    Main ViewSet for handling Purchase Requests.
    Supports creating, listing, approving, rejecting, and receipt submission.
    """
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        """
        Role-Based Data Filtering:
        - Staff: See only their own requests.
        - Approvers: See ALL requests relevant to their level (Pending OR History).
        - Finance: See all APPROVED requests.
        """
    
        if getattr(self, 'swagger_fake_view', False):
            return PurchaseRequest.objects.none()

        user = self.request.user
        
        # 2. Safety check for anonymous users
        if not user.is_authenticated:
            return PurchaseRequest.objects.none()

        # 3. Role-Based Filtering
        if user.role == User.Role.STAFF:
            return PurchaseRequest.objects.filter(created_by=user)
        
        elif user.role == User.Role.APPROVER_L1:
            # L1 sees any request that HAS a level 1 step.
            return PurchaseRequest.objects.filter(approval_steps__level=1)
            
        elif user.role == User.Role.APPROVER_L2:
            # L2 sees requests where L1 is already Approved AND an L2 step exists.
            return PurchaseRequest.objects.filter(
                approval_steps__level=1,
                approval_steps__status=ApprovalStep.Status.APPROVED
            ).filter(
                approval_steps__level=2
            )
            
        elif user.role == User.Role.FINANCE:
            # Finance sees everything that has been fully approved
            return PurchaseRequest.objects.filter(status=PurchaseRequest.Status.APPROVED)
            
        # Default: See nothing
        return PurchaseRequest.objects.none()

    def create(self, request, *args, **kwargs):
        """Override create to use WorkflowEngine service."""
        if request.user.role != User.Role.STAFF:
            return Response(
                {"detail": "Only staff can create requests."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        proforma = request.FILES.get('proforma_file')
        if not proforma:
            return Response(
                {"detail": "Proforma file is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Call the Service Layer
            req = WorkflowEngine.create_request(
                serializer.validated_data, 
                request.user, 
                proforma
            )
            return Response(
                PurchaseRequestSerializer(req).data, 
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], url_path='review')
    def review_request(self, request, pk=None):
        """
        Endpoint for Approvers to Approve or Reject.
        Body: { "action": "approve" | "reject", "comment": "..." }
        """
        obj = self.get_object()
        action_type = request.data.get('action')
        comment = request.data.get('comment', '')

        if action_type not in ['approve', 'reject']:
            return Response(
                {"detail": "Invalid action. Use 'approve' or 'reject'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine approval level based on User Role
        if request.user.role == User.Role.APPROVER_L1:
            required_level = 1
        elif request.user.role == User.Role.APPROVER_L2:
            required_level = 2
        else:
            return Response(
                {"detail": "You are not an authorized approver."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Find the specific approval step for this user level
            step = obj.approval_steps.get(level=required_level)
            
            # Call Service Layer to handle logic (DB updates, PDF generation)
            WorkflowEngine.process_approval(step, request.user, action_type, comment)
            
            return Response({"detail": f"Request {action_type}ed successfully."})
            
        except ApprovalStep.DoesNotExist:
            return Response(
                {"detail": "This request is not at your approval level."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='submit-receipt')
    def submit_receipt(self, request, pk=None):
        """Endpoint for Staff to upload receipt after approval."""
        obj = self.get_object()
        
        if obj.status != PurchaseRequest.Status.APPROVED:
            return Response(
                {"detail": "Request must be approved before submitting receipt."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        receipt = request.FILES.get('receipt_file')
        if not receipt:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Call Service Layer
        updated_req = WorkflowEngine.submit_receipt(obj, receipt)
        
        return Response(PurchaseRequestSerializer(updated_req).data)