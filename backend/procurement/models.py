from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class PurchaseRequest(models.Model):
    """
    Represents a procurement request initiated by a staff member.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending Approval')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    title = models.CharField(max_length=255)
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    
    # Relationships
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='requests'
    )
    
    # Documents
    proforma_file = models.FileField(upload_to='proformas/')
    purchase_order_doc = models.FileField(upload_to='pos/', null=True, blank=True)
    receipt_file = models.FileField(upload_to='receipts/', null=True, blank=True)
    
    # AI Data Storage
    ai_metadata = models.JSONField(default=dict, blank=True)
    receipt_validation_data = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"


class ApprovalStep(models.Model):
    """
    Represents a specific step in the approval chain (e.g., Level 1 vs Level 2).
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    request = models.ForeignKey(
        PurchaseRequest, 
        on_delete=models.CASCADE, 
        related_name='approval_steps'
    )
    level = models.IntegerField(help_text="1 for Level 1, 2 for Level 2")
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    comments = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['level']
        unique_together = ['request', 'level']