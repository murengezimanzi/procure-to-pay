from django.contrib import admin
from .models import PurchaseRequest, ApprovalStep

class ApprovalStepInline(admin.TabularInline):
    """
    Allows viewing and editing Approval Steps directly within 
    the Purchase Request detail page.
    """
    model = ApprovalStep
    extra = 0
    readonly_fields = ('reviewed_at',)
    can_delete = False

@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    readonly_fields = ('ai_metadata', 'receipt_validation_data', 'purchase_order_doc')
    
    inlines = [ApprovalStepInline]
    
    actions = ['reset_to_pending']

    @admin.action(description='Reset selected requests to PENDING')
    def reset_to_pending(self, request, queryset):
        """Helper action for testing workflow"""
        queryset.update(status=PurchaseRequest.Status.PENDING)

@admin.register(ApprovalStep)
class ApprovalStepAdmin(admin.ModelAdmin):
    """
    Separate view for approval steps if needed for debugging.
    """
    list_display = ('request', 'level', 'approver', 'status', 'reviewed_at')
    list_filter = ('status', 'level')