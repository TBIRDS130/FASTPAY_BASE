# FastPay Bank Card Templates Documentation

This document provides comprehensive documentation for the bank card template system in FastPay, including template creation, management, validation, and usage.

## 📋 Table of Contents

- [Overview](#overview)
- [Template Structure](#template-structure)
- [Template Management](#template-management)
- [Field Validation](#field-validation)
- [Template Operations](#template-operations)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## Overview

The FastPay bank card template system provides a flexible framework for creating and managing bank card information templates. Templates define the structure, validation rules, and formatting for different types of bank cards used in the system.

### Key Features

- **Template Creation**: Create custom templates for different banks and card types
- **Field Validation**: Comprehensive validation rules for card fields
- **Template Duplication**: Easy template copying and versioning
- **Preview Generation**: Generate sample data from templates
- **Real-time Validation**: Validate field data against template rules
- **Template Management**: CRUD operations with version control

### Template Types

| Card Type | Description | Common Use Cases |
|-----------|-------------|------------------|
| **Credit** | Credit card templates | Credit card applications, verification |
| **Debit** | Debit card templates | Bank account linking, direct debit |
| **Prepaid** | Prepaid card templates | Gift cards, prepaid accounts |

---

## Template Structure

### Template Model

```python
class BankCardTemplate(models.Model):
    template_code = models.CharField(max_length=50, unique=True)
    template_name = models.CharField(max_length=200)
    bank_name = models.CharField(max_length=200, blank=True)
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    description = models.TextField(blank=True)
    field_schema = models.JSONField(default=dict)
    validation_rules = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Field Schema

The `field_schema` defines the structure and properties of template fields:

```json
{
  "account_number": {
    "type": "string",
    "required": true,
    "min_length": 10,
    "max_length": 20,
    "label": "Account Number",
    "placeholder": "Enter account number",
    "help_text": "10-20 digit account number",
    "pattern": "^[0-9]{10,20}$"
  },
  "routing_number": {
    "type": "string",
    "required": true,
    "min_length": 9,
    "max_length": 9,
    "label": "Routing Number",
    "placeholder": "9-digit routing number",
    "help_text": "9-digit bank routing number"
  },
  "card_holder": {
    "type": "string",
    "required": true,
    "max_length": 100,
    "label": "Card Holder Name",
    "placeholder": "Name as it appears on card"
  },
  "expiry_date": {
    "type": "date",
    "required": true,
    "label": "Expiry Date",
    "help_text": "MM/YY format"
  },
  "cvv": {
    "type": "string",
    "required": true,
    "min_length": 3,
    "max_length": 4,
    "label": "CVV",
    "help_text": "3-4 digit security code"
  }
}
```

### Validation Rules

The `validation_rules` define validation logic for template fields:

```json
{
  "account_number": {
    "type": "string",
    "required": true,
    "pattern": "^[0-9]{10,20}$",
    "luhn_check": true,
    "blacklist": ["0000000000", "1111111111"]
  },
  "routing_number": {
    "type": "string",
    "required": true,
    "pattern": "^[0-9]{9}$",
    "checksum_validation": true
  },
  "card_holder": {
    "type": "string",
    "required": true,
    "min_length": 2,
    "max_length": 100,
    "no_numbers": true
  },
  "expiry_date": {
    "type": "date",
    "required": true,
    "future_date_only": true,
    "min_years": 1,
    "max_years": 10
  },
  "cvv": {
    "type": "string",
    "required": true,
    "pattern": "^[0-9]{3,4}$"
  }
}
```

---

## Template Management

### Creating Templates

#### Basic Template Creation

```python
# Create a simple debit card template
template = BankCardTemplate.objects.create(
    template_code="BANK.DEBIT",
    template_name="Bank Debit Card",
    bank_name="Example Bank",
    card_type="debit",
    description="Standard debit card template",
    field_schema={
        "account_number": {
            "type": "string",
            "required": True,
            "min_length": 10,
            "max_length": 20,
            "label": "Account Number"
        },
        "routing_number": {
            "type": "string",
            "required": True,
            "min_length": 9,
            "max_length": 9,
            "label": "Routing Number"
        }
    },
    validation_rules={
        "account_number": {
            "type": "string",
            "required": True,
            "pattern": "^[0-9]{10,20}$"
        }
    }
)
```

#### Advanced Template with Custom Validation

```python
# Create an advanced credit card template
template = BankCardTemplate.objects.create(
    template_code="BANK.CREDIT",
    template_name="Bank Credit Card",
    bank_name="Example Bank",
    card_type="credit",
    field_schema={
        "card_number": {
            "type": "string",
            "required": True,
            "min_length": 16,
            "max_length": 16,
            "label": "Card Number",
            "pattern": "^[0-9]{16}$"
        },
        "card_holder": {
            "type": "string",
            "required": True,
            "max_length": 100,
            "label": "Card Holder Name"
        },
        "expiry_date": {
            "type": "date",
            "required": True,
            "label": "Expiry Date",
            "format": "MM/YY"
        },
        "cvv": {
            "type": "string",
            "required": True,
            "min_length": 3,
            "max_length": 4,
            "label": "CVV"
        },
        "credit_limit": {
            "type": "decimal",
            "required": False,
            "min_value": 1000,
            "max_value": 100000,
            "label": "Credit Limit"
        }
    },
    validation_rules={
        "card_number": {
            "type": "string",
            "required": True,
            "luhn_check": True,
            "pattern": "^[0-9]{16}$"
        },
        "expiry_date": {
            "type": "date",
            "required": True,
            "future_date_only": True,
            "min_years": 1
        },
        "cvv": {
            "type": "string",
            "required": True,
            "pattern": "^[0-9]{3,4}$"
        }
    }
)
```

### Template Versioning

Templates support automatic versioning when duplicated:

```python
# Duplicate template with version increment
original_template = BankCardTemplate.objects.get(template_code="BANK.DEBIT")
duplicated_template = original_template.duplicate()

# Result: template_code becomes "BANK.DEBIT_v2"
# Version tracking maintained in template metadata
```

### Template Status Management

```python
# Activate/deactivate templates
template.is_active = True   # Enable template
template.is_active = False  # Disable template

# Set default template
template.is_default = True

# Get active templates
active_templates = BankCardTemplate.objects.filter(is_active=True)

# Get default template
default_template = BankCardTemplate.objects.filter(is_default=True).first()
```

---

## Field Validation

### Validation Engine

The template system includes a comprehensive validation engine:

```python
class TemplateValidator:
    def __init__(self, template):
        self.template = template
        self.validation_rules = template.validation_rules
    
    def validate_field(self, field_name, value):
        """Validate a single field against template rules"""
        rules = self.validation_rules.get(field_name, {})
        
        # Type validation
        if not self._validate_type(value, rules.get('type')):
            return False, f"Invalid type for {field_name}"
        
        # Required validation
        if rules.get('required') and not value:
            return False, f"{field_name} is required"
        
        # Pattern validation
        pattern = rules.get('pattern')
        if pattern and not re.match(pattern, str(value)):
            return False, f"{field_name} format is invalid"
        
        # Length validation
        if 'min_length' in rules and len(str(value)) < rules['min_length']:
            return False, f"{field_name} is too short"
        
        if 'max_length' in rules and len(str(value)) > rules['max_length']:
            return False, f"{field_name} is too long"
        
        # Custom validations
        return self._custom_validations(field_name, value, rules)
    
    def _custom_validations(self, field_name, value, rules):
        """Apply custom validation rules"""
        
        # Luhn algorithm for card numbers
        if rules.get('luhn_check'):
            if not self._luhn_check(str(value)):
                return False, f"{field_name} failed Luhn check"
        
        # Future date validation
        if rules.get('future_date_only'):
            if not self._is_future_date(value):
                return False, f"{field_name} must be a future date"
        
        # No numbers validation for names
        if rules.get('no_numbers'):
            if re.search(r'\d', str(value)):
                return False, f"{field_name} cannot contain numbers"
        
        return True, ""
```

### Built-in Validators

#### Luhn Algorithm (Card Numbers)

```python
def _luhn_check(card_number):
    """Validate card number using Luhn algorithm"""
    def digits_of(n):
        return [int(d) for d in str(n)]
    
    digits = digits_of(card_number)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    checksum = 0
    checksum += sum(odd_digits)
    
    for d in even_digits:
        checksum += sum(digits_of(d*2))
    
    return checksum % 10 == 0
```

#### Routing Number Checksum

```python
def _routing_number_checksum(routing_number):
    """Validate US routing number checksum"""
    routing_number = str(routing_number).zfill(9)
    
    weights = [3, 7, 1, 3, 7, 1, 3, 7, 1]
    checksum = 0
    
    for i, digit in enumerate(routing_number):
        checksum += int(digit) * weights[i]
    
    return checksum % 10 == 0
```

#### Date Validation

```python
def _validate_expiry_date(expiry_date):
    """Validate card expiry date"""
    try:
        if isinstance(expiry_date, str):
            # Parse MM/YY format
            month, year = map(int, expiry_date.split('/'))
            year += 2000 if year < 100 else 0
        else:
            # Handle date object
            month = expiry_date.month
            year = expiry_date.year
        
        # Check if date is in future
        current_date = datetime.now()
        expiry = datetime(year, month, 1)
        
        if expiry < current_date:
            return False, "Card has expired"
        
        return True, ""
    
    except (ValueError, AttributeError):
        return False, "Invalid date format"
```

---

## Template Operations

### Preview Generation

Generate sample data from templates for testing and demonstration:

```python
def generate_preview(template):
    """Generate preview data from template"""
    preview = {}
    
    for field_name, field_config in template.field_schema.items():
        field_type = field_config.get('type', 'string')
        
        if field_type == 'string':
            preview[field_name] = _generate_string_preview(field_config)
        elif field_type == 'number':
            preview[field_name] = _generate_number_preview(field_config)
        elif field_type == 'date':
            preview[field_name] = _generate_date_preview(field_config)
        elif field_type == 'decimal':
            preview[field_name] = _generate_decimal_preview(field_config)
        else:
            preview[field_name] = f"Sample {field_name}"
    
    return preview

def _generate_string_preview(field_config):
    """Generate sample string data"""
    field_name = field_config.get('label', '').lower()
    
    if 'account' in field_name:
        return "1234567890123456"
    elif 'card' in field_name and 'number' in field_name:
        return "4532015112830366"  # Valid Luhn number
    elif 'routing' in field_name:
        return "123456789"
    elif 'holder' in field_name:
        return "JOHN DOE"
    elif 'cvv' in field_name:
        return "123"
    else:
        return f"Sample {field_config.get('label', 'text')}"
```

### Template Validation

Validate complete data against template:

```python
def validate_template_data(template, data):
    """Validate complete data object against template"""
    errors = {}
    warnings = {}
    
    # Check required fields
    for field_name, field_config in template.field_schema.items():
        if field_config.get('required') and field_name not in data:
            errors[field_name] = f"{field_name} is required"
    
    # Validate each field
    for field_name, value in data.items():
        if field_name in template.field_schema:
            is_valid, message = template.validate_field(field_name, value)
            if not is_valid:
                errors[field_name] = message
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }
```

### Template Export/Import

```python
def export_template(template):
    """Export template to portable format"""
    return {
        'template_code': template.template_code,
        'template_name': template.template_name,
        'bank_name': template.bank_name,
        'card_type': template.card_type,
        'description': template.description,
        'field_schema': template.field_schema,
        'validation_rules': template.validation_rules,
        'version': template.version,
        'exported_at': timezone.now().isoformat()
    }

def import_template(template_data, overwrite=False):
    """Import template from portable format"""
    template_code = template_data['template_code']
    
    if not overwrite and BankCardTemplate.objects.filter(template_code=template_code).exists():
        raise ValueError(f"Template {template_code} already exists")
    
    template = BankCardTemplate.objects.update_or_create(
        template_code=template_code,
        defaults={
            'template_name': template_data['template_name'],
            'bank_name': template_data.get('bank_name', ''),
            'card_type': template_data['card_type'],
            'description': template_data.get('description', ''),
            'field_schema': template_data['field_schema'],
            'validation_rules': template_data['validation_rules']
        }
    )
    
    return template
```

---

## API Endpoints

### List Templates

**Endpoint**: `GET /api/bank-card-templates/`

**Query Parameters**:
- `is_active` (boolean): Filter by active status
- `card_type` (string): Filter by card type
- `bank_name` (string): Filter by bank name

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_code": "AXIS.DEBIT",
      "template_name": "Axis Bank Debit Card",
      "bank_name": "Axis Bank",
      "card_type": "debit",
      "is_active": true,
      "is_default": false,
      "field_schema": {...},
      "validation_rules": {...}
    }
  ]
}
```

### Create Template

**Endpoint**: `POST /api/bank-card-templates/`

**Request Body**:
```json
{
  "template_code": "ICICI.CREDIT",
  "template_name": "ICICI Bank Credit Card",
  "bank_name": "ICICI Bank",
  "card_type": "credit",
  "field_schema": {
    "card_number": {
      "type": "string",
      "required": true,
      "min_length": 16,
      "max_length": 16
    }
  },
  "validation_rules": {
    "card_number": {
      "type": "string",
      "required": true,
      "luhn_check": true
    }
  }
}
```

### Update Template

**Endpoint**: `PUT /api/bank-card-templates/{template_id}/`

### Delete Template

**Endpoint**: `DELETE /api/bank-card-templates/{template_id}/`

### Duplicate Template

**Endpoint**: `POST /api/bank-card-templates/{template_id}/duplicate/`

**Response**:
```json
{
  "success": true,
  "data": {
    "template_code": "ICICI.CREDIT_v2",
    "template_name": "ICICI Bank Credit Card (Copy)",
    "version": 2
  }
}
```

### Generate Preview

**Endpoint**: `POST /api/bank-card-templates/{template_id}/preview/`

**Response**:
```json
{
  "success": true,
  "data": {
    "preview": {
      "card_number": "4532015112830366",
      "card_holder": "JOHN DOE",
      "expiry_date": "12/25",
      "cvv": "123"
    }
  }
}
```

### Validate Fields

**Endpoint**: `POST /api/bank-card-templates/{template_id}/validate_fields/`

**Request Body**:
```json
{
  "fields": {
    "card_number": "4532015112830366",
    "card_holder": "JOHN DOE",
    "expiry_date": "12/25",
    "cvv": "123"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "validation": {
      "valid": true,
      "errors": {},
      "warnings": []
    }
  }
}
```

---

## Usage Examples

### Frontend Integration

```javascript
// Template management component
import { useState, useEffect } from 'react';

function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Fetch templates
  useEffect(() => {
    fetch('/api/bank-card-templates/')
      .then(response => response.json())
      .then(data => setTemplates(data.data));
  }, []);
  
  // Create template
  const createTemplate = async (templateData) => {
    const response = await fetch('/api/bank-card-templates/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(templateData)
    });
    
    return response.json();
  };
  
  // Validate fields
  const validateFields = async (templateId, fields) => {
    const response = await fetch(`/api/bank-card-templates/${templateId}/validate_fields/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ fields })
    });
    
    return response.json();
  };
  
  return (
    <div>
      {/* Template management UI */}
    </div>
  );
}
```

### Backend Usage

```python
# Template service class
class TemplateService:
    @staticmethod
    def get_template_by_code(template_code):
        """Get template by code"""
        try:
            return BankCardTemplate.objects.get(template_code=template_code, is_active=True)
        except BankCardTemplate.DoesNotExist:
            raise ValueError(f"Template {template_code} not found")
    
    @staticmethod
    def validate_card_data(template_code, card_data):
        """Validate card data against template"""
        template = TemplateService.get_template_by_code(template_code)
        validator = TemplateValidator(template)
        
        return validator.validate_data(card_data)
    
    @staticmethod
    def create_card_from_template(template_code, card_data):
        """Create card record from template data"""
        template = TemplateService.get_template_by_code(template_code)
        
        # Validate data
        validation_result = TemplateService.validate_card_data(template_code, card_data)
        if not validation_result['valid']:
            raise ValueError(f"Validation failed: {validation_result['errors']}")
        
        # Create card record
        card = BankCard.objects.create(
            template=template,
            **card_data
        )
        
        return card

# Usage example
try:
    card = TemplateService.create_card_from_template(
        "AXIS.DEBIT",
        {
            "account_number": "1234567890123456",
            "routing_number": "123456789",
            "card_holder": "JOHN DOE"
        }
    )
except ValueError as e:
    print(f"Error: {e}")
```

---

## Best Practices

### Template Design

1. **Consistent Naming**: Use consistent naming conventions for template codes
2. **Clear Labels**: Provide clear, user-friendly field labels
3. **Comprehensive Validation**: Include all necessary validation rules
4. **Help Text**: Add helpful descriptions for complex fields
5. **Version Control**: Use versioning for template updates

### Validation Rules

1. **Type Safety**: Always specify field types
2. **Required Fields**: Mark essential fields as required
3. **Pattern Matching**: Use regex patterns for format validation
4. **Range Validation**: Set appropriate min/max values
5. **Custom Validation**: Implement business-specific validation logic

### Performance

1. **Caching**: Cache frequently accessed templates
2. **Validation Optimization**: Optimize validation for performance
3. **Database Indexing**: Add indexes for template queries
4. **Batch Operations**: Use batch operations for multiple validations

### Security

1. **Input Sanitization**: Sanitize all user inputs
2. **Data Encryption**: Encrypt sensitive card data
3. **Access Control**: Implement proper access controls
4. **Audit Logging**: Log all template operations

---

## Testing

### Unit Tests

```python
class BankCardTemplateTest(TestCase):
    def setUp(self):
        self.template = BankCardTemplate.objects.create(
            template_code="TEST.DEBIT",
            template_name="Test Debit Card",
            card_type="debit",
            field_schema={
                "account_number": {
                    "type": "string",
                    "required": True,
                    "min_length": 10,
                    "max_length": 20
                }
            },
            validation_rules={
                "account_number": {
                    "type": "string",
                    "required": True,
                    "pattern": "^[0-9]{10,20}$"
                }
            }
        )
    
    def test_template_creation(self):
        """Test template creation"""
        self.assertEqual(self.template.template_code, "TEST.DEBIT")
        self.assertTrue(self.template.is_active)
    
    def test_field_validation(self):
        """Test field validation"""
        validator = TemplateValidator(self.template)
        
        # Valid data
        is_valid, message = validator.validate_field("account_number", "1234567890123456")
        self.assertTrue(is_valid)
        
        # Invalid data
        is_valid, message = validator.validate_field("account_number", "abc")
        self.assertFalse(is_valid)
    
    def test_template_duplication(self):
        """Test template duplication"""
        duplicated = self.template.duplicate()
        self.assertEqual(duplicated.template_code, "TEST.DEBIT_v2")
        self.assertEqual(duplicated.version, 2)
```

### Integration Tests

```python
class TemplateAPITest(TestCase):
    def test_create_template_api(self):
        """Test template creation via API"""
        response = self.client.post('/api/bank-card-templates/', {
            'template_code': 'API.TEST',
            'template_name': 'API Test Template',
            'card_type': 'debit',
            'field_schema': {
                'account_number': {
                    'type': 'string',
                    'required': True
                }
            }
        })
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_validate_fields_api(self):
        """Test field validation via API"""
        response = self.client.post(f'/api/bank-card-templates/{self.template.id}/validate_fields/', {
            'fields': {
                'account_number': '1234567890123456'
            }
        })
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['data']['validation']['valid'])
```

---

## API Changelog

### Version 2.0.0 (Latest)

#### Added
- Template duplication with version tracking
- Preview generation for templates
- Real-time field validation
- Enhanced validation rules (Luhn, checksums)
- Template export/import functionality

#### Enhanced
- Validation engine with custom validators
- Error handling and user feedback
- Performance optimizations
- Security improvements

#### Fixed
- Template validation bugs
- Field type handling
- Version control issues

---

*This bank card templates documentation serves as the comprehensive reference for the FastPay template system. Keep this document updated with any template system changes.*
