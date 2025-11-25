from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from core.models import User
from .models import PurchaseRequest, ApprovalStep

class ProcurementWorkflowTests(TestCase):
    def setUp(self):
        """
        Prepare the test environment:
        1. Create users for each role (Staff, L1, L2, Finance).
        2. Create a dummy file for uploads.
        """
        self.client = APIClient()

        # 1. Create Users
        self.staff = User.objects.create_user(
            username='alice', password='password', role=User.Role.STAFF
        )
        self.approver_l1 = User.objects.create_user(
            username='bob', password='password', role=User.Role.APPROVER_L1
        )
        self.approver_l2 = User.objects.create_user(
            username='charlie', password='password', role=User.Role.APPROVER_L2
        )
        
        # 2. Create a Mock PDF File
        self.proforma = SimpleUploadedFile(
            "quote.pdf", b"dummy_content", content_type="application/pdf"
        )

    def test_1_create_request_with_ai(self):
        """
        Test that Staff can create a request and AI metadata is generated.
        """
        self.client.force_authenticate(user=self.staff)
        
        data = {
            "title": "MacBook Pro",
            "description": "For development",
            "amount": 2000.00,
            "proforma_file": self.proforma
        }
        
        # Send POST request (Multipart)
        response = self.client.post('/api/requests/', data, format='multipart')
        
        # 1. Check API Status
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Check Database
        req = PurchaseRequest.objects.get(title="MacBook Pro")
        self.assertEqual(req.status, 'PENDING')
        
        # 3. Verify AI Extraction (Mock AI should have run)
        self.assertIsNotNone(req.ai_metadata)
        self.assertIn('vendor_name', req.ai_metadata) # Check if AI found a vendor

    def test_2_staff_visibility_permission(self):
        """
        Test that Staff can ONLY see their own requests.
        """
        # Create a request by Bob (Approver)
        PurchaseRequest.objects.create(
            title="Bob's Secret Request", amount=100, created_by=self.approver_l1, 
            status="PENDING", proforma_file=self.proforma
        )
        # Create a request by Alice (Staff)
        PurchaseRequest.objects.create(
            title="Alice's Request", amount=100, created_by=self.staff, 
            status="PENDING", proforma_file=self.proforma
        )

        # Login as Alice
        self.client.force_authenticate(user=self.staff)
        response = self.client.get('/api/requests/')

        # Alice should see 1 request, not 2
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Alice's Request")

    def test_3_full_approval_workflow(self):
        """
        Test the full chain: Pending -> L1 Approve -> L2 Approve -> PDF Generated
        """
        # --- STEP 1: Create Request ---
        req = PurchaseRequest.objects.create(
            title="Workflow Test", amount=5000, created_by=self.staff, 
            status="PENDING", proforma_file=self.proforma
        )
        # Manually create steps (Service layer usually does this, but we test Views/Logic here)
        ApprovalStep.objects.create(request=req, level=1, status="PENDING")
        ApprovalStep.objects.create(request=req, level=2, status="PENDING")

        # --- STEP 2: L1 Approves ---
        self.client.force_authenticate(user=self.approver_l1)
        response_l1 = self.client.patch(
            f'/api/requests/{req.id}/review/', 
            {'action': 'approve', 'comment': 'Looks good L1'}, 
            format='json'
        )
        self.assertEqual(response_l1.status_code, status.HTTP_200_OK)
        
        # Reload from DB
        step1 = ApprovalStep.objects.get(request=req, level=1)
        self.assertEqual(step1.status, 'APPROVED')

        # --- STEP 3: L2 Approves (Triggers PDF) ---
        self.client.force_authenticate(user=self.approver_l2)
        response_l2 = self.client.patch(
            f'/api/requests/{req.id}/review/', 
            {'action': 'approve', 'comment': 'Final Approval L2'}, 
            format='json'
        )
        self.assertEqual(response_l2.status_code, status.HTTP_200_OK)

        # Reload Request from DB
        req.refresh_from_db()
        
        # CHECK: Is Status APPROVED?
        self.assertEqual(req.status, 'APPROVED')
        
        # CHECK: Was PDF Generated?
        self.assertTrue(bool(req.purchase_order_doc), "PDF should be generated after L2 approval")

    def test_4_rejection_stops_workflow(self):
        """
        Test that rejection immediately updates global status.
        """
        req = PurchaseRequest.objects.create(
            title="Bad Request", amount=5000, created_by=self.staff, 
            status="PENDING", proforma_file=self.proforma
        )
        ApprovalStep.objects.create(request=req, level=1, status="PENDING")

        # L1 Rejects
        self.client.force_authenticate(user=self.approver_l1)
        response = self.client.patch(
            f'/api/requests/{req.id}/review/', 
            {'action': 'reject', 'comment': 'Too expensive'}, 
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(req.status, 'REJECTED')