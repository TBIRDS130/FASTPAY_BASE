import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from api.models import BankCardTemplate, DashUser
from unittest.mock import patch

class BankCardTemplateEnhancedTest(TestCase):
    """Test cases for enhanced bank card template functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        self.user = DashUser.objects.create_user(
            email='test@example.com',
            password='testpass123',
            access_level=0
        )
        self.client.force_login(self.user)
        
        # Create test template
        self.template = BankCardTemplate.objects.create(
            template_code='TEST.TPL',
            template_name='Test Template',
            bank_name='Test Bank',
            card_type='debit',
            field_schema={
                'account_number': {
                    'type': 'string',
                    'required': True,
                    'min_length': 10,
                    'max_length': 20
                },
                'routing_number': {
                    'type': 'string',
                    'required': True,
                    'min_length': 9,
                    'max_length': 9
                }
            },
            validation_rules={
                'account_number': {
                    'type': 'string',
                    'required': True,
                    'min_length': 10,
                    'max_length': 20
                }
            }
        )
    
    def test_template_preview_generation(self):
        """Test template preview generation"""
        response = self.client.post(f'/api/bank-card-templates/{self.template.id}/preview/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        self.assertIn('preview', data)
        self.assertIn('account_number', data['preview'])
        self.assertIn('routing_number', data['preview'])
        
        # Check preview data format
        self.assertIsInstance(data['preview']['account_number'], str)
        self.assertIsInstance(data['preview']['routing_number'], str)
    
    def test_template_field_validation_success(self):
        """Test successful field validation"""
        valid_data = {
            'account_number': '1234567890123456',
            'routing_number': '123456789'
        }
        
        response = self.client.post(
            f'/api/bank-card-templates/{self.template.id}/validate_fields/',
            {'fields': valid_data}
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        self.assertTrue(data['validation']['valid'])
        self.assertEqual(len(data['validation']['errors']), 0)
    
    def test_template_field_validation_failure(self):
        """Test field validation failure"""
        invalid_data = {
            'account_number': '123',  # Too short
            'routing_number': 'abc'    # Invalid format
        }
        
        response = self.client.post(
            f'/api/bank-card-templates/{self.template.id}/validate_fields/',
            {'fields': invalid_data}
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        self.assertFalse(data['validation']['valid'])
        self.assertGreater(len(data['validation']['errors']), 0)
        self.assertIn('account_number', data['validation']['errors'])
        self.assertIn('routing_number', data['validation']['errors'])
    
    def test_template_duplication(self):
        """Test template duplication functionality"""
        response = self.client.post(f'/api/bank-card-templates/{self.template.id}/duplicate/')
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        
        # Check duplicated template properties
        self.assertIn('template_code', data)
        self.assertTrue(data['template_code'].startswith('TEST.TPL_v'))
        self.assertIn('Copy', data['template_name'])
        self.assertEqual(data['version'], 2)  # Original version + 1
