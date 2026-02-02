"""
Pytest configuration and fixtures for FastPay Backend tests
"""
import pytest
from django.test import Client
from django.contrib.auth import get_user_model

from api.tests.factories import (
    DeviceFactory,
    BankCardFactory,
    DashUserFactory,
    GmailAccountFactory,
    MessageFactory,
    NotificationFactory,
    ContactFactory,
)


@pytest.fixture
def api_client():
    """Django test client for API testing"""
    return Client()


@pytest.fixture
def device():
    """Create a test device"""
    return DeviceFactory()


@pytest.fixture
def active_device():
    """Create an active test device"""
    return DeviceFactory(is_active=True)


@pytest.fixture
def inactive_device():
    """Create an inactive test device"""
    return DeviceFactory(is_active=False)


@pytest.fixture
def device_with_bank_card():
    """Create a device with an associated bank card"""
    device = DeviceFactory()
    bank_card = BankCardFactory(device=device, status='active')
    return device, bank_card


@pytest.fixture
def dash_user():
    """Create a test dashboard user"""
    return DashUserFactory()


@pytest.fixture
def admin_user():
    """Create an admin dashboard user"""
    return DashUserFactory(access_level=0, status='active')


@pytest.fixture
def otp_user():
    """Create an OTP-only dashboard user"""
    return DashUserFactory(access_level=1, status='active')


@pytest.fixture
def gmail_account():
    """Create a test Gmail account"""
    return GmailAccountFactory()


@pytest.fixture
def expired_gmail_account():
    """Create an expired Gmail account"""
    from django.utils import timezone
    from datetime import timedelta
    return GmailAccountFactory(
        token_expires_at=timezone.now() - timedelta(hours=1)
    )


@pytest.fixture
def device_with_messages():
    """Create a device with multiple messages"""
    device = DeviceFactory()
    messages = MessageFactory.create_batch(10, device=device)
    return device, messages


@pytest.fixture
def device_with_notifications():
    """Create a device with multiple notifications"""
    device = DeviceFactory()
    notifications = NotificationFactory.create_batch(15, device=device)
    return device, notifications


@pytest.fixture
def device_with_contacts():
    """Create a device with multiple contacts"""
    device = DeviceFactory()
    contacts = ContactFactory.create_batch(20, device=device)
    return device, contacts


@pytest.fixture
def complete_device_setup():
    """Create a complete device setup with all related data"""
    device = DeviceFactory(is_active=True)
    bank_card = BankCardFactory(device=device, status='active')
    messages = MessageFactory.create_batch(10, device=device)
    notifications = NotificationFactory.create_batch(15, device=device)
    contacts = ContactFactory.create_batch(20, device=device)
    
    return {
        'device': device,
        'bank_card': bank_card,
        'messages': messages,
        'notifications': notifications,
        'contacts': contacts,
    }
