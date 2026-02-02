"""
Email Verification System
Handles email verification tokens for password reset and email changes
"""
import secrets
from django.core.cache import cache
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def generate_verification_token(email: str, purpose: str = 'general') -> str:
    """
    Generate a secure verification token
    
    Args:
        email: User email address
        purpose: Purpose of verification (e.g., 'password_reset', 'email_change')
    
    Returns:
        Verification token string
    """
    # Generate random token
    token = secrets.token_urlsafe(32)
    
    # Create key for cache
    key = f"email_verification:{purpose}:{email}:{token}"
    
    # Store in cache with 1 hour expiration
    cache.set(key, {
        'email': email,
        'purpose': purpose,
        'created_at': timezone.now().isoformat()
    }, 3600)  # 1 hour
    
    return token


def verify_token(token: str, email: str, purpose: str = 'general') -> bool:
    """
    Verify an email verification token
    
    Args:
        token: Verification token
        email: User email address
        purpose: Purpose of verification
    
    Returns:
        True if token is valid, False otherwise
    """
    key = f"email_verification:{purpose}:{email}:{token}"
    data = cache.get(key)
    
    if not data:
        return False
    
    # Verify email and purpose match
    if data.get('email') != email or data.get('purpose') != purpose:
        return False
    
    # Token is valid, delete it (one-time use)
    cache.delete(key)
    return True


def send_verification_email(email: str, token: str, purpose: str = 'password_reset'):
    """
    Send verification email using Django's email backend
    
    Args:
        email: Recipient email
        token: Verification token
        purpose: Purpose of verification
    """
    # Get email configuration from settings
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@fastpay.com')
    site_url = getattr(settings, 'SITE_URL', 'https://fastpay.com')
    
    # Build verification URL
    verification_url = f"{site_url}/verify-email?token={token}&email={email}&purpose={purpose}"
    
    # Determine email subject and template based on purpose
    if purpose == 'password_reset':
        subject = 'FastPay - Password Reset Verification'
        template_name = 'email/password_reset.html'
        context = {
            'email': email,
            'verification_url': verification_url,
            'token': token,
            'purpose': purpose,
        }
    elif purpose == 'email_change':
        subject = 'FastPay - Email Change Verification'
        template_name = 'email/email_change.html'
        context = {
            'email': email,
            'verification_url': verification_url,
            'token': token,
            'purpose': purpose,
        }
    else:
        subject = 'FastPay - Email Verification'
        template_name = 'email/verification.html'
        context = {
            'email': email,
            'verification_url': verification_url,
            'token': token,
            'purpose': purpose,
        }
    
    # Try to render HTML template, fallback to plain text
    try:
        html_message = render_to_string(template_name, context)
        plain_message = strip_tags(html_message)
    except:
        # Fallback to simple text email if template doesn't exist
        html_message = None
        if purpose == 'password_reset':
            plain_message = f"""
FastPay Password Reset

Click the following link to reset your password:
{verification_url}

Or use this verification code: {token}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
"""
        else:
            plain_message = f"""
FastPay Email Verification

Click the following link to verify your email:
{verification_url}

Or use this verification code: {token}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
"""
    
    # Send email
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=from_email,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        # Log error but don't fail the operation
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send verification email to {email}: {str(e)}")
        # In development, print to console
        if settings.DEBUG:
            print(f"[EMAIL VERIFICATION] Failed to send email to {email}: {str(e)}")
            print(f"[EMAIL VERIFICATION] Verification URL: {verification_url}")
            print(f"[EMAIL VERIFICATION] Token: {token}")
        return False
