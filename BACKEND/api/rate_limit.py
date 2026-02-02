"""
Rate Limiting Utility
Simple in-memory rate limiting for sensitive endpoints
"""
from django.core.cache import cache
from django.http import JsonResponse
from functools import wraps
import time


def rate_limit(max_requests=5, window_seconds=3600, key_func=None):
    """
    Rate limiting decorator
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        key_func: Function to generate rate limit key from request (default: uses IP)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate rate limit key
            if key_func:
                key = key_func(request)
            else:
                # Default: use IP address
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip = x_forwarded_for.split(',')[0]
                else:
                    ip = request.META.get('REMOTE_ADDR', 'unknown')
                key = f"rate_limit:{view_func.__name__}:{ip}"
            
            # Check rate limit
            current = cache.get(key, 0)
            
            if current >= max_requests:
                return JsonResponse(
                    {
                        "success": False,
                        "error": f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds // 60} minutes."
                    },
                    status=429
                )
            
            # Increment counter
            cache.set(key, current + 1, window_seconds)
            
            # Call the view
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def get_email_rate_limit_key(request):
    """Generate rate limit key based on email from request"""
    try:
        email = request.data.get('email', '').strip()
        if not email:
            body_data = __import__('json').loads(request.body.decode('utf-8'))
            email = body_data.get('email', '').strip()
        return f"rate_limit:email:{email}"
    except:
        # Fallback to IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        return f"rate_limit:ip:{ip}"
