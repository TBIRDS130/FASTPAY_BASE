# Test Factories Documentation

This directory contains test factories and fixtures for the FastPay Backend API tests.

## Overview

Test factories use [factory_boy](https://factoryboy.readthedocs.io/) to create test data in a clean, maintainable way. This eliminates repetitive test setup code and makes tests more readable.

## Available Factories

### DeviceFactory
Creates test Device instances.

```python
from api.tests.factories import DeviceFactory

# Create a device with default values
device = DeviceFactory()

# Create with custom attributes
device = DeviceFactory(name="My Device", is_active=True, battery_percentage=85)

# Create multiple devices
devices = DeviceFactory.create_batch(5)
```

### BankCardFactory
Creates test BankCard instances.

```python
from api.tests.factories import BankCardFactory, DeviceFactory

# Create bank card (automatically creates associated device)
bank_card = BankCardFactory()

# Create bank card for existing device
device = DeviceFactory()
bank_card = BankCardFactory(device=device, status='active')
```

### MessageFactory
Creates test Message instances.

```python
from api.tests.factories import MessageFactory, DeviceFactory

device = DeviceFactory()
message = MessageFactory(device=device, message_type='received')
messages = MessageFactory.create_batch(10, device=device)
```

### NotificationFactory
Creates test Notification instances.

```python
from api.tests.factories import NotificationFactory

notification = NotificationFactory()
notifications = NotificationFactory.create_batch(15, device=device)
```

### ContactFactory
Creates test Contact instances.

```python
from api.tests.factories import ContactFactory

contact = ContactFactory()
contacts = ContactFactory.create_batch(20, device=device)
```

### GmailAccountFactory
Creates test GmailAccount instances.

```python
from api.tests.factories import GmailAccountFactory

account = GmailAccountFactory()
expired_account = GmailAccountFactory(
    token_expires_at=timezone.now() - timedelta(hours=1)
)
```

### DashUserFactory
Creates test DashUser instances.

```python
from api.tests.factories import DashUserFactory

user = DashUserFactory()
admin = DashUserFactory(access_level=0)
otp_user = DashUserFactory(access_level=1)
```

### Other Factories
- `BankCardTemplateFactory` - Bank card templates
- `BankFactory` - Bank instances
- `CommandLogFactory` - Command execution logs
- `AutoReplyLogFactory` - Auto-reply logs

## Pytest Fixtures

The `conftest.py` file provides reusable pytest fixtures:

### Basic Fixtures
- `api_client` - Django test client
- `device` - Test device
- `active_device` - Active test device
- `inactive_device` - Inactive test device

### User Fixtures
- `dash_user` - Test dashboard user
- `admin_user` - Admin user (access_level=0)
- `otp_user` - OTP-only user (access_level=1)

### Gmail Fixtures
- `gmail_account` - Test Gmail account
- `expired_gmail_account` - Expired Gmail account

### Device Data Fixtures
- `device_with_bank_card` - Device with bank card
- `device_with_messages` - Device with messages
- `device_with_notifications` - Device with notifications
- `device_with_contacts` - Device with contacts
- `complete_device_setup` - Device with all related data

### Usage Example

```python
import pytest

def test_device_api(api_client, device):
    """Test using fixtures"""
    response = api_client.get(f'/api/devices/{device.device_id}/')
    assert response.status_code == 200

def test_complete_setup(complete_device_setup):
    """Test using complete setup fixture"""
    setup = complete_device_setup
    assert setup['device'].is_active
    assert len(setup['messages']) == 10
    assert len(setup['notifications']) == 15
    assert len(setup['contacts']) == 20
```

## Migration Guide

### Before (Manual Setup)
```python
def setUp(self):
    self.device = Device.objects.create(
        device_id='test_device_12345',
        name='Test Device',
        code='TESTCODE123',
        is_active=True,
        battery_percentage=85,
        last_seen=int(time.time() * 1000),
        # ... many more fields
    )
```

### After (Using Factories)
```python
def setUp(self):
    self.device = DeviceFactory(
        name='Test Device',
        code='TESTCODE123',
        is_active=True,
        battery_percentage=85
    )
```

## Best Practices

1. **Use factories for test data creation** - Don't manually create models in tests
2. **Override only necessary fields** - Let factories handle defaults
3. **Use fixtures for common setups** - Reuse complex setups via fixtures
4. **Create batches for bulk data** - Use `create_batch()` for multiple instances
5. **Keep factories simple** - Factories should create valid, realistic data

## Installation

Factories require `factory-boy`:

```bash
pip install factory-boy
```

Or install all test dependencies:

```bash
pip install -r requirements.txt
```

## Examples

See `test_factories_example.py` for complete examples of using factories in tests.
