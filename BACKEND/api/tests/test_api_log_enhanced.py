import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from api.models import ApiRequestLog, DashUser
from unittest.mock import patch

class ApiRequestLogEnhancedTest(TestCase):
    """Test cases for enhanced API request log functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        self.user = DashUser.objects.create_user(
            email='test@example.com',
            password='testpass123',
            access_level=0
        )
        self.client.force_login(self.user)
        
        # Create test log entries
        ApiRequestLog.objects.create(
            method='GET',
            path='/api/devices/',
            status_code=200,
            user_identifier='test@example.com',
            response_time_ms=150
        )
        ApiRequestLog.objects.create(
            method='POST',
            path='/api/messages/',
            status_code=400,
            user_identifier='other@example.com',
            response_time_ms=200
        )
    
    def test_api_log_user_filtering(self):
        """Test API log filtering by user identifier"""
        response = self.client.get('/api/api-request-logs/?user_identifier=test@example.com')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        # Should only return logs for test@example.com
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['user_identifier'], 'test@example.com')
    
    def test_api_log_method_filtering(self):
        """Test API log filtering by HTTP method"""
        response = self.client.get('/api/api-request-logs/?method=GET')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        # Should only return GET requests
        for log in data['results']:
            self.assertEqual(log['method'], 'GET')
    
    def test_api_log_status_code_filtering(self):
        """Test API log filtering by status code"""
        response = self.client.get('/api/api-request-logs/?status_code=400')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        # Should only return 400 status codes
        for log in data['results']:
            self.assertEqual(log['status_code'], 400)
    
    def test_api_log_path_filtering(self):
        """Test API log filtering by path content"""
        response = self.client.get('/api/api-request-logs/?path_contains=devices')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        # Should only return logs containing 'devices' in path
        for log in data['results']:
            self.assertIn('devices', log['path'])
    
    def test_api_log_increased_limit(self):
        """Test API log with increased limit (50 entries)"""
        # Create 60 test log entries
        for i in range(60):
            ApiRequestLog.objects.create(
                method='GET',
                path=f'/api/test/{i}/',
                status_code=200,
                user_identifier='test@example.com',
                response_time_ms=100
            )
        
        response = self.client.get('/api/api-request-logs/?limit=50')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        # Should return maximum 50 entries
        self.assertEqual(len(data['results']), 50)
