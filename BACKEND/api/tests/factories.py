"""
Test factories for FastPay Backend models
Uses factory_boy to create test fixtures

Usage:
    from api.tests.factories import DeviceFactory, MessageFactory
    
    # Create a device
    device = DeviceFactory()
    
    # Create with custom attributes
    device = DeviceFactory(name="Custom Device", is_active=True)
    
    # Create multiple
    devices = DeviceFactory.create_batch(5)
"""
import factory
from factory import fuzzy
from django.utils import timezone
from datetime import timedelta
import time

from api.models import (
    Device, Message, Notification, Contact,
    BankCard, BankCardTemplate, Bank,
    GmailAccount, CommandLog, AutoReplyLog,
    DashUser
)


class DeviceFactory(factory.django.DjangoModelFactory):
    """Factory for Device model"""
    
    class Meta:
        model = Device
        django_get_or_create = ('device_id',)
    
    device_id = factory.Sequence(lambda n: f"device_{n:06d}")
    name = factory.Faker('name')
    model = factory.Faker('word')
    phone = factory.Faker('phone_number')
    code = factory.Sequence(lambda n: f"CODE{n:04d}")
    is_active = True
    last_seen = factory.LazyFunction(lambda: int(time.time() * 1000))
    battery_percentage = fuzzy.FuzzyInteger(0, 100)
    current_phone = factory.Faker('phone_number')
    current_identifier = factory.Sequence(lambda n: f"identifier_{n}")
    time = factory.LazyFunction(lambda: int(time.time() * 1000))
    bankcard = "BANKCARD"
    system_info = factory.Dict({
        'buildInfo': {
            'model': factory.Faker('word'),
            'manufacturer': factory.Faker('company'),
        },
        'batteryInfo': {
            'level': fuzzy.FuzzyInteger(0, 100),
        }
    })
    sync_status = 'synced'
    last_sync_at = factory.LazyFunction(timezone.now)


class BankCardTemplateFactory(factory.django.DjangoModelFactory):
    """Factory for BankCardTemplate model"""
    
    class Meta:
        model = BankCardTemplate
        django_get_or_create = ('template_code',)
    
    template_code = factory.Sequence(lambda n: f"TMP{n:02d}.{n+1:02d}")
    template_name = factory.Faker('company')
    bank_name = factory.Faker('company')
    card_type = fuzzy.FuzzyChoice(['credit', 'debit', 'prepaid'])
    default_fields = factory.Dict({})
    description = factory.Faker('text', max_nb_chars=200)
    is_active = True


class BankFactory(factory.django.DjangoModelFactory):
    """Factory for Bank model"""
    
    class Meta:
        model = Bank
        django_get_or_create = ('code',)
    
    name = factory.Faker('company')
    code = factory.Sequence(lambda n: f"BANK{n:03d}")
    ifsc_code = factory.Sequence(lambda n: f"IFSC{n:06d}")
    country = factory.Faker('country')
    is_active = True


class BankCardFactory(factory.django.DjangoModelFactory):
    """Factory for BankCard model"""
    
    class Meta:
        model = BankCard
    
    device = factory.SubFactory(DeviceFactory)
    template = factory.SubFactory(BankCardTemplateFactory)
    card_number = factory.Faker('credit_card_number')
    card_holder_name = factory.Faker('name')
    bank_name = factory.Faker('company')
    bank_code = factory.Sequence(lambda n: f"BC{n:03d}")
    card_type = fuzzy.FuzzyChoice(['credit', 'debit', 'prepaid'])
    expiry_date = factory.Faker('date', pattern='%m/%y')
    cvv = factory.Faker('numerify', text='###')
    account_name = factory.Faker('company')
    account_number = factory.Faker('numerify', text='##########')
    ifsc_code = factory.Sequence(lambda n: f"IFSC{n:06d}")
    branch_name = factory.Faker('city')
    balance = fuzzy.FuzzyDecimal(0, 1000000, 2)
    currency = fuzzy.FuzzyChoice(['USD', 'INR', 'EUR'])
    status = fuzzy.FuzzyChoice(['active', 'inactive', 'blocked'])
    mobile_number = factory.Faker('phone_number')
    email = factory.Faker('email')
    email_password = factory.Faker('password')
    kyc_name = factory.Faker('name')
    kyc_address = factory.Faker('address')
    kyc_dob = factory.Faker('date_of_birth', minimum_age=18, maximum_age=80)
    kyc_aadhar = factory.Faker('numerify', text='############')
    kyc_pan = factory.Faker('bothify', text='?????####?')
    additional_info = factory.Dict({})


class DashUserFactory(factory.django.DjangoModelFactory):
    """Factory for DashUser model"""
    
    class Meta:
        model = DashUser
        django_get_or_create = ('email',)
    
    email = factory.Sequence(lambda n: f"user{n}@fastpay.com")
    password = factory.Faker('password')
    full_name = factory.Faker('name')
    access_level = 0  # Admin by default
    status = 'active'


class GmailAccountFactory(factory.django.DjangoModelFactory):
    """Factory for GmailAccount model"""
    
    class Meta:
        model = GmailAccount
        django_get_or_create = ('user_email',)
    
    user_email = factory.Sequence(lambda n: f"user{n}@fastpay.com")
    gmail_email = factory.Faker('email')
    access_token = factory.Faker('uuid4')
    refresh_token = factory.Faker('uuid4')
    token_expires_at = factory.LazyFunction(lambda: timezone.now() + timedelta(hours=1))
    scopes = ['gmail.readonly', 'gmail.modify']
    is_active = True
    last_sync_at = factory.LazyFunction(timezone.now)


class MessageFactory(factory.django.DjangoModelFactory):
    """Factory for Message model"""
    
    class Meta:
        model = Message
    
    device = factory.SubFactory(DeviceFactory)
    message_type = fuzzy.FuzzyChoice(['received', 'sent'])
    phone = factory.Faker('phone_number')
    body = factory.Faker('text', max_nb_chars=160)
    timestamp = factory.LazyFunction(lambda: int(time.time() * 1000))
    read = False


class NotificationFactory(factory.django.DjangoModelFactory):
    """Factory for Notification model"""
    
    class Meta:
        model = Notification
    
    device = factory.SubFactory(DeviceFactory)
    package_name = factory.Faker('word')
    title = factory.Faker('sentence', nb_words=4)
    text = factory.Faker('text', max_nb_chars=200)
    timestamp = factory.LazyFunction(lambda: int(time.time() * 1000))


class ContactFactory(factory.django.DjangoModelFactory):
    """Factory for Contact model"""
    
    class Meta:
        model = Contact
        django_get_or_create = ('device', 'phone_number')
    
    device = factory.SubFactory(DeviceFactory)
    contact_id = factory.Sequence(lambda n: f"contact_{n}")
    name = factory.Faker('name')
    display_name = factory.Faker('first_name')
    phone_number = factory.Faker('phone_number')
    phones = factory.List([
        factory.Dict({
            'number': factory.Faker('phone_number'),
            'type': fuzzy.FuzzyChoice(['mobile', 'home', 'work'])
        })
    ])
    emails = factory.List([
        factory.Dict({
            'address': factory.Faker('email'),
            'type': fuzzy.FuzzyChoice(['home', 'work'])
        })
    ])
    is_starred = False
    times_contacted = fuzzy.FuzzyInteger(0, 100)
    last_contacted = factory.LazyFunction(lambda: int(time.time() * 1000))


class CommandLogFactory(factory.django.DjangoModelFactory):
    """Factory for CommandLog model"""
    
    class Meta:
        model = CommandLog
    
    device = factory.SubFactory(DeviceFactory)
    command = fuzzy.FuzzyChoice(['sendSms', 'updateApk', 'reset', 'fetchSms'])
    value = factory.Faker('json', data={'to': factory.Faker('phone_number'), 'message': 'Test'})
    status = fuzzy.FuzzyChoice(['executed', 'failed', 'pending'])
    received_at = factory.LazyFunction(lambda: int(time.time() * 1000))
    executed_at = factory.LazyFunction(lambda: int(time.time() * 1000) + 1000)
    error_message = factory.LazyAttribute(lambda obj: None if obj.status == 'executed' else 'Test error')


class AutoReplyLogFactory(factory.django.DjangoModelFactory):
    """Factory for AutoReplyLog model"""
    
    class Meta:
        model = AutoReplyLog
    
    device = factory.SubFactory(DeviceFactory)
    sender = factory.Faker('phone_number')
    reply_message = factory.Faker('text', max_nb_chars=160)
    original_timestamp = factory.LazyFunction(lambda: int(time.time() * 1000))
    replied_at = factory.LazyFunction(lambda: int(time.time() * 1000) + 5000)
