import json
from django.test import TestCase, Client
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch, MagicMock
from api.models import GmailAccount, DashUser
from api.gmail_service import GmailServiceError

class GmailOAuthEnhancedTest(TestCase):
    """Test cases for enhanced Gmail OAuth functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        self.user_email = 'test@example.com'
        self.gmail_email = 'test@gmail.com'
        
    @patch('api.views_legacy._dashboard_redirect', return_value=None)
    @patch('api.views_legacy.verify_signed_state')
    @patch('api.views_legacy.exchange_code_for_tokens')
    @patch('requests.get')
    def test_gmail_callback_success_with_logging(self, mock_requests_get, mock_exchange_tokens, mock_verify_state, mock_redirect):
        """Test successful Gmail OAuth callback with enhanced logging"""
        mock_verify_state.return_value = ('test_state', self.user_email, None, None)
        mock_exchange_tokens.return_value = {
            'access_token': 'new_access_token',
            'refresh_token': 'new_refresh_token',
            'expires_in': 3600,
            'scope': 'gmail.readonly gmail.modify'
        }
        
        # Mock profile request
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.json.return_value = {'email': self.gmail_email}
        mock_requests_get.return_value = mock_response
        
        response = self.client.get('/api/gmail/callback/', {
            'code': 'test_code',
            'state': f'test_state:{self.user_email}'
        })
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(data['gmail_email'], self.gmail_email)
        
        # Verify account was created
        account = GmailAccount.objects.get(user_email=self.user_email)
        self.assertEqual(account.gmail_email, self.gmail_email)
        self.assertTrue(account.is_active)
    
    @patch('api.views_legacy.log_activity')
    def test_gmail_callback_network_error_logging(self, mock_log_activity):
        """Test network error logging in Gmail callback"""
        with patch('requests.get', side_effect=Exception('Network error')):
            response = self.client.get('/api/gmail/callback/', {
                'code': 'test_code',
                'state': f'test_state:{self.user_email}'
            })
        
        self.assertEqual(response.status_code, 500)
        mock_log_activity.assert_called_with(
            None,  # request object
            'gmail_oauth_network_error', 
            'Network error during token exchange: Network error'
        )
    
    @patch('api.views_legacy.log_activity')
    def test_gmail_callback_state_verification_error(self, mock_log_activity):
        """Test state verification error logging"""
        with patch('api.views_legacy.verify_signed_state', side_effect=GmailServiceError('Invalid state')):
            response = self.client.get('/api/gmail/callback/', {
                'code': 'test_code',
                'state': 'invalid_state'
            })
        
        self.assertEqual(response.status_code, 400)
        mock_log_activity.assert_called_with(
            None,
            'gmail_oauth_error', 
            'State verification failed: Invalid state'
        )
