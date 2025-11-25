from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom User model extending AbstractUser to include Role-Based Access Control (RBAC).
    
    Attributes:
        role (str): The functional role of the user in the workflow.
    """
    
    class Role(models.TextChoices):
        STAFF = 'STAFF', _('Staff Member')
        APPROVER_L1 = 'L1', _('Approver Level 1')
        APPROVER_L2 = 'L2', _('Approver Level 2')
        FINANCE = 'FINANCE', _('Finance Team')

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STAFF,
        help_text=_("Designates the user's role in the procurement workflow.")
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"