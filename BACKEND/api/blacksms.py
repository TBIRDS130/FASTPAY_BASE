"""
BlackSMS utility for sending SMS and WhatsApp messages
Uses BlackSMS.in API for text SMS and WhatsApp messaging

================================================================================
QUICK START EXAMPLES - DON'T FORGET!
================================================================================

# 1. Import the functions
from api.blacksms import send_text_sms, send_whatsapp_sms, send_otp

# 2. Send Text SMS with custom OTP
result = send_text_sms('9876543210', '123456')
if result['status'] == 1:
    print("✓ SMS sent! Message:", result['message'])
else:
    print("✗ Failed:", result['message'])

# 3. Send Text SMS with auto-generated HHMMSS OTP (current time)
result = send_text_sms('9876543210')  # No OTP = uses HHMMSS format
if result['status'] == 1:
    print("✓ SMS sent with auto OTP!")

# 4. Send WhatsApp with custom OTP
result = send_whatsapp_sms('9876543210', '123456')
if result['status'] == 1:
    print("✓ WhatsApp sent!")

# 5. Send WhatsApp with auto HHMMSS OTP
result = send_whatsapp_sms('9876543210')  # Auto HHMMSS
if result['status'] == 1:
    print("✓ WhatsApp sent with auto OTP!")

# 6. Convenience function - Send OTP via SMS
result = send_otp('9876543210', '123456', method='sms')

# 7. Convenience function - Send OTP via WhatsApp with auto HHMMSS
result = send_otp('9876543210', method='whatsapp')  # Auto HHMMSS

# 8. Send to multiple numbers (comma-separated)
result = send_text_sms('9876543210,9876543211,9876543212', '123456')

================================================================================
IMPORTANT NOTES:
================================================================================
- Phone numbers: NO country code needed! Use '9876543210' NOT '+919876543210'
- Response format: {'status': 1 or 0, 'message': str, 'data': dict}
- OTP: If not provided, automatically uses HHMMSS format (e.g., "143025")
- Environment variables required: BLACKSMS_API_KEY, BLACKSMS_SENDER_ID
================================================================================
"""
import os
import logging
import requests
from datetime import datetime
from typing import Dict, Optional, Any
from django.conf import settings

logger = logging.getLogger(__name__)

# BlackSMS API Configuration
BLACKSMS_API_KEY = os.environ.get('BLACKSMS_API_KEY', '')
BLACKSMS_SENDER_ID = os.environ.get('BLACKSMS_SENDER_ID', '')
BLACKSMS_SMS_URL = 'https://blacksms.in/sms'
BLACKSMS_WHATSAPP_URL = 'https://blacksms.in/wasms'


def _generate_hhmmss_otp() -> str:
    """
    Generate OTP in HHMMSS format from current time
    
    Returns:
        String in HHMMSS format (e.g., "143025" for 2:30:25 PM)
    """
    now = datetime.now()
    return now.strftime('%H%M%S')


def send_text_sms(
    numbers: str,
    variables_values: Optional[str] = None,
    sender_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send text SMS via BlackSMS API
    
    Args:
        numbers: Recipient's mobile number (without country code, e.g., '9876543210')
                 Can be comma-separated for multiple recipients
        variables_values: Optional OTP value. If not provided, uses HHMMSS format of current time
        sender_id: Optional sender ID (defaults to BLACKSMS_SENDER_ID from env)
    
    Returns:
        Dictionary with response data matching BlackSMS API format:
        {
            'status': 1 or 0,
            'message': str,
            'data': dict (full API response)
        }
    
    Examples:
        # Example 1: Send SMS with custom OTP
        result = send_text_sms('9876543210', '123456')
        if result['status'] == 1:
            print("✓ SMS sent! OTP: 123456")
        else:
            print("✗ Failed:", result['message'])
        
        # Example 2: Send SMS with auto-generated HHMMSS OTP
        result = send_text_sms('9876543210')  # No OTP = uses current time HHMMSS
        if result['status'] == 1:
            print(f"✓ SMS sent! Auto OTP: {result['data']}")
        
        # Example 3: Send to multiple numbers
        result = send_text_sms('9876543210,9876543211', '123456')
        
        # Example 4: Check response
        result = send_text_sms('9876543210', '123456')
        print(f"Status: {result['status']}")  # 1 = success, 0 = failure
        print(f"Message: {result['message']}")  # "OTP Sent" or error message
        print(f"Full response: {result['data']}")  # Complete API response
    """
    if not BLACKSMS_API_KEY:
        logger.error("BLACKSMS_API_KEY not configured in environment variables")
        return {
            'status': 0,
            'message': 'BlackSMS API key not configured',
            'data': None
        }
    
    sender = sender_id or BLACKSMS_SENDER_ID
    if not sender:
        logger.error("BLACKSMS_SENDER_ID not configured in environment variables")
        return {
            'status': 0,
            'message': 'BlackSMS sender ID not configured',
            'data': None
        }
    
    # Use provided OTP or generate HHMMSS format
    otp_value = variables_values if variables_values else _generate_hhmmss_otp()
    
    headers = {
        'Authorization': BLACKSMS_API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'sender_id': sender,
        'variables_values': otp_value,
        'numbers': numbers
    }
    
    try:
        response = requests.post(
            BLACKSMS_SMS_URL,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        response.raise_for_status()
        response_data = response.json()
        
        # Check API response format: status 1 = success, 0 = failure
        api_status = response_data.get('status', 0)
        api_message = response_data.get('message', 'Unknown response')
        
        if api_status == 1:
            logger.info(f"Text SMS sent successfully to {numbers}, OTP: {otp_value}")
            return {
                'status': 1,
                'message': api_message,
                'data': response_data
            }
        else:
            logger.error(f"BlackSMS API returned error: {api_message}")
            return {
                'status': 0,
                'message': api_message,
                'data': response_data
            }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send text SMS to {numbers}: {str(e)}")
        return {
            'status': 0,
            'message': f'Failed to send SMS: {str(e)}',
            'data': None
        }
    except Exception as e:
        logger.error(f"Unexpected error sending text SMS: {str(e)}")
        return {
            'status': 0,
            'message': f'Unexpected error: {str(e)}',
            'data': None
        }


def send_whatsapp_sms(
    numbers: str,
    variables_values: Optional[str] = None,
    sender_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send WhatsApp message via BlackSMS API
    
    Args:
        numbers: Recipient's mobile number (without country code, e.g., '9876543210')
                 Can be comma-separated for multiple recipients
        variables_values: Optional OTP value. If not provided, uses HHMMSS format of current time
        sender_id: Optional sender ID (defaults to BLACKSMS_SENDER_ID from env)
    
    Returns:
        Dictionary with response data matching BlackSMS API format:
        {
            'status': 1 or 0,
            'message': str,
            'data': dict (full API response)
        }
    
    Examples:
        # Example 1: Send WhatsApp with custom OTP
        result = send_whatsapp_sms('9876543210', '123456')
        if result['status'] == 1:
            print("✓ WhatsApp sent! OTP: 123456")
        else:
            print("✗ Failed:", result['message'])
        
        # Example 2: Send WhatsApp with auto-generated HHMMSS OTP
        result = send_whatsapp_sms('9876543210')  # No OTP = uses current time HHMMSS
        if result['status'] == 1:
            print(f"✓ WhatsApp sent! Auto OTP: {result['data']}")
        
        # Example 3: Send to multiple numbers
        result = send_whatsapp_sms('9876543210,9876543211', '123456')
        
        # Example 4: Check response
        result = send_whatsapp_sms('9876543210', '123456')
        print(f"Status: {result['status']}")  # 1 = success, 0 = failure
        print(f"Message: {result['message']}")  # "OTP Sent" or error message
        print(f"Full response: {result['data']}")  # Complete API response
    """
    if not BLACKSMS_API_KEY:
        logger.error("BLACKSMS_API_KEY not configured in environment variables")
        return {
            'status': 0,
            'message': 'BlackSMS API key not configured',
            'data': None
        }
    
    sender = sender_id or BLACKSMS_SENDER_ID
    if not sender:
        logger.error("BLACKSMS_SENDER_ID not configured in environment variables")
        return {
            'status': 0,
            'message': 'BlackSMS sender ID not configured',
            'data': None
        }
    
    # Use provided OTP or generate HHMMSS format
    otp_value = variables_values if variables_values else _generate_hhmmss_otp()
    
    headers = {
        'Authorization': BLACKSMS_API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'sender_id': sender,
        'variables_values': otp_value,
        'numbers': numbers
    }
    
    try:
        response = requests.post(
            BLACKSMS_WHATSAPP_URL,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        response.raise_for_status()
        response_data = response.json()
        
        # Check API response format: status 1 = success, 0 = failure
        api_status = response_data.get('status', 0)
        api_message = response_data.get('message', 'Unknown response')
        
        if api_status == 1:
            logger.info(f"WhatsApp message sent successfully to {numbers}, OTP: {otp_value}")
            return {
                'status': 1,
                'message': api_message,
                'data': response_data
            }
        else:
            logger.error(f"BlackSMS API returned error: {api_message}")
            return {
                'status': 0,
                'message': api_message,
                'data': response_data
            }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send WhatsApp message to {numbers}: {str(e)}")
        return {
            'status': 0,
            'message': f'Failed to send WhatsApp message: {str(e)}',
            'data': None
        }
    except Exception as e:
        logger.error(f"Unexpected error sending WhatsApp message: {str(e)}")
        return {
            'status': 0,
            'message': f'Unexpected error: {str(e)}',
            'data': None
        }


def send_otp(
    phone_number: str,
    otp_code: Optional[str] = None,
    method: str = 'sms'
) -> Dict[str, Any]:
    """
    Convenience function to send OTP via SMS or WhatsApp
    
    Args:
        phone_number: Recipient's phone number (without country code, e.g., '9876543210')
        otp_code: Optional OTP code. If not provided, uses HHMMSS format of current time
        method: 'sms' for text SMS or 'whatsapp' for WhatsApp (default: 'sms')
    
    Returns:
        Dictionary with response data matching BlackSMS API format:
        {
            'status': 1 or 0,
            'message': str,
            'data': dict
        }
    
    Examples:
        # Example 1: Send OTP via SMS with custom code
        result = send_otp('9876543210', '123456', method='sms')
        if result['status'] == 1:
            print("✓ OTP sent via SMS!")
        
        # Example 2: Send OTP via WhatsApp with custom code
        result = send_otp('9876543210', '123456', method='whatsapp')
        if result['status'] == 1:
            print("✓ OTP sent via WhatsApp!")
        
        # Example 3: Send OTP via SMS with auto-generated HHMMSS
        result = send_otp('9876543210', method='sms')  # Auto HHMMSS
        if result['status'] == 1:
            print(f"✓ Auto OTP sent: {result['data']}")
        
        # Example 4: Send OTP via WhatsApp with auto-generated HHMMSS
        result = send_otp('9876543210', method='whatsapp')  # Auto HHMMSS
        if result['status'] == 1:
            print(f"✓ Auto OTP sent via WhatsApp!")
        
        # Example 5: Handle response
        result = send_otp('9876543210', '123456', method='sms')
        if result['status'] == 1:
            print(f"Success: {result['message']}")
        else:
            print(f"Error: {result['message']}")
    """
    if method.lower() == 'whatsapp':
        return send_whatsapp_sms(phone_number, otp_code)
    else:
        return send_text_sms(phone_number, otp_code)
