import random
import time
import io
from typing import Dict, Any
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.core.files.base import ContentFile
from datetime import date

class DocumentProcessor:
    """
    Service class for AI Simulation and PDF Generation.
    """

    @staticmethod
    def extract_proforma_data(file_obj) -> Dict[str, Any]:
        """Simulates parsing a Proforma PDF/Image."""
        time.sleep(1)
        return {
            "vendor_name": "Tech Corp Solutions",
            "invoice_number": f"INV-{random.randint(1000, 9999)}",
            "items": [
                {"description": "Server Rack", "quantity": 1, "price": 1200.00},
                {"description": "Cables", "quantity": 50, "price": 10.00}
            ],
            "extracted_total": 1700.00,
            "confidence_score": 0.98
        }

    @staticmethod
    def validate_receipt(receipt_file, purchase_order_amount) -> Dict[str, Any]:
        """Compares uploaded receipt against the system's PO data."""
        is_match = random.choice([True, True, False]) 
        
        if is_match:
            return {
                "status": "MATCH",
                "message": "Receipt matches Purchase Order perfectly.",
                "discrepancies": []
            }
        else:
            return {
                "status": "MISMATCH",
                "message": "Discrepancy detected in total amount.",
                "discrepancies": ["Receipt total differs from PO total."]
            }

    @staticmethod
    def generate_purchase_order_doc(request_instance):
        """
        Generates a REAL PDF file using ReportLab.
        Returns: (filename, ContentFile)
        """
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 750, "PURCHASE ORDER")
        
        p.setFont("Helvetica", 10)
        p.drawString(50, 730, f"PO Number: PO-{request_instance.id:05d}")
        p.drawString(50, 715, f"Date: {date.today()}")
        p.drawString(50, 700, f"Vendor: {request_instance.ai_metadata.get('vendor_name', 'Unknown Vendor')}")
        
        p.line(50, 680, 550, 680)
        
        # Body
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, 650, "Item Description")
        p.drawString(450, 650, "Amount")
        
        p.setFont("Helvetica", 12)
        p.drawString(50, 625, request_instance.title)
        p.drawString(450, 625, f"${request_instance.amount}")
        
        # Footer
        p.line(50, 600, 550, 600)
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(50, 580, "Authorized by: Finance Dept")
        p.drawString(50, 565, "Generated automatically by P2P System")
        # -------------------------
        
        p.showPage()
        p.save()
        filename = f"PO_{request_instance.id}_{int(time.time())}.pdf"
        return filename, ContentFile(buffer.getvalue())