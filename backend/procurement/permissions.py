from rest_framework import permissions
from core.models import User

class IsStaffOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == User.Role.STAFF

class IsApprover(permissions.BasePermission):
    """
    Allows access only to Level 1 or Level 2 approvers.
    """
    def has_object_permission(self, request, view, obj):
        return request.user.role in [User.Role.APPROVER_L1, User.Role.APPROVER_L2]

class IsFinance(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.FINANCE