"""
BlackSMS Utility Module

This module provides functions to send SMS and WhatsApp messages via BlackSMS.in API.

Environment Variables Required:
- BLACKSMS_API_KEY: Your BlackSMS API key
- BLACKSMS_SENDER_ID: Your BlackSMS sender ID

Response Format:
- Success: {'status': 1, 'message': 'OTP Sent', 'variables_values': '123456'}
- Failure: {'status': 0, 'message': 'Error message', 'variables_values': '123456'}

Important Notes:
- Phone numbers should NOT include country code (e.g., use '9876543210' not '+919876543210')
- If OTP is missing or not 4 or 6 digits, uses MMHHSS format of current time
- Response includes the OTP used in variables_values

API Endpoints:

1) POST /api/blacksms/sms/
   Body: { "numbers": "9876543210", "variables_values": "123456" }

2) POST /api/blacksms/whatsapp/
   Body: { "numbers": "9876543210", "variables_values": "123456" }

Usage Examples:

1. Send Text SMS with custom OTP:
   from api.blacksms import send_text_sms
   result = send_text_sms('9876543210', '123456')
   if result['status'] == 1:
       print("SMS sent!")

2. Send Text SMS with auto-generated HHMMSS OTP:
   result = send_text_sms('9876543210')
   if result['status'] == 1:
       print(f"OTP sent: {result['data']}")

3. Send WhatsApp Message:
   from api.blacksms import send_whatsapp_sms
   result = send_whatsapp_sms('9876543210', '123456')
   if result['status'] == 1:
       print("WhatsApp sent!")

4. Send OTP (convenience function):
   from api.blacksms import send_otp
   # With custom OTP
   result = send_otp('9876543210', '123456', method='sms')
   # With auto-generated HHMMSS OTP
   result = send_otp('9876543210', method='whatsapp')
"""
