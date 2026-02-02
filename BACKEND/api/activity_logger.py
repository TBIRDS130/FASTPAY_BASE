"""
Activity Logger Utility
Logs user activities for audit purposes
"""
from django.utils import timezone
from .models import ActivityLog


def log_activity(
    user_email: str,
    activity_type: str,
    description: str = None,
    ip_address: str = None,
    user_agent: str = None,
    metadata: dict = None
):
    """
    Log a user activity
    
    Args:
        user_email: Email of the user performing the activity
        activity_type: Type of activity (must be one of ActivityLog.ACTIVITY_TYPES)
        description: Optional description of the activity
        ip_address: Optional IP address
        user_agent: Optional user agent string
        metadata: Optional additional metadata as dict
    """
    try:
        ActivityLog.objects.create(
            user_email=user_email,
            activity_type=activity_type,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {}
        )
    except Exception as e:
        # Don't fail the main operation if logging fails
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to log activity: {e}")


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Extract user agent from request"""
    return request.META.get('HTTP_USER_AGENT', '')
