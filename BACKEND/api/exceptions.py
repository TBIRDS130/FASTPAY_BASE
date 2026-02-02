"""
Custom exception handler to ensure all API errors return JSON
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures all errors return JSON
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, it means Django handled it (likely returned HTML)
    # Create a JSON response instead
    if response is None:
        return Response(
            {
                "success": False,
                "error": str(exc) if exc else "An error occurred"
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Ensure response is JSON
    if hasattr(response, 'data'):
        # Already a DRF response, ensure it's JSON
        return response
    
    # If somehow we get a non-JSON response, convert it
    return Response(
        {
            "success": False,
            "error": "An error occurred"
        },
        status=response.status_code if hasattr(response, 'status_code') else status.HTTP_400_BAD_REQUEST
    )
