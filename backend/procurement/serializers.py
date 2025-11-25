from rest_framework import serializers
from .models import PurchaseRequest, ApprovalStep
from core.models import User

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class ApprovalStepSerializer(serializers.ModelSerializer):
    approver_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ApprovalStep
        fields = ['id', 'level', 'status', 'approver_name', 'comments']

    def get_approver_name(self, obj):
        if obj.approver:
            return obj.approver.username
        return None

class PurchaseRequestSerializer(serializers.ModelSerializer):
    created_by = SimpleUserSerializer(read_only=True)
    approval_steps = ApprovalStepSerializer(many=True, read_only=True)
    status = serializers.CharField(read_only=True)
    
    class Meta:
        model = PurchaseRequest
        fields = [
            'id', 'title', 'amount', 'description', 
            'proforma_file', 'purchase_order_doc', 
            'status', 'created_at', 'created_by', 
            'approval_steps', 'ai_metadata'
        ]

    def create(self, validated_data):
        return super().create(validated_data)