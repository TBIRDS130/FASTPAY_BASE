"""
Management command to fix old data: add BankCard + email for devices that don't have one.

Run after deploy or migrations when devices exist without bank cards.

Usage:
  python manage.py fix_old_data
  python manage.py fix_old_data --dry-run
  python manage.py fix_old_data --link-mail   # also link unlinked GmailAccounts to new cards

Deploy example:
  python manage.py migrate
  python manage.py create_bank_card_templates   # if templates missing
  python manage.py fix_old_data                 # add bank cards + email for old devices
"""
from django.core.management.base import BaseCommand
from api.models import Device, BankCard, BankCardTemplate, GmailAccount


class Command(BaseCommand):
    help = 'Fix old data: add BankCard and email for devices missing a bank card'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )
        parser.add_argument(
            '--link-mail',
            action='store_true',
            help='Link unlinked GmailAccounts to new bank cards (round-robin)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        link_mail = options['link_mail']

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN – no changes will be saved'))

        # Devices that don't have a BankCard
        devices_with_card_ids = BankCard.objects.values_list('device_id', flat=True)
        devices_without_card = list(Device.objects.exclude(pk__in=devices_with_card_ids))

        if not devices_without_card:
            self.stdout.write(self.style.SUCCESS('No devices missing bank cards. Nothing to fix.'))
            return

        self.stdout.write(f'Found {len(devices_without_card)} device(s) without bank cards')

        # Default template (first active) or None
        template = BankCardTemplate.objects.filter(is_active=True).first()
        if not template:
            self.stdout.write(self.style.WARNING('No active BankCardTemplate. Creating cards with defaults only.'))

        # Unlinked GmailAccounts (not used by any BankCard) for --link-mail
        linked_gmail_ids = set(
            BankCard.objects.exclude(email_account=None).values_list('email_account_id', flat=True)
        )
        unlinked_gmails = [
            g for g in GmailAccount.objects.filter(is_active=True)
            if g.id not in linked_gmail_ids
        ]

        created = 0
        linked = 0
        gmail_index = 0

        for device in devices_without_card:
            if dry_run:
                self.stdout.write(f'  [dry-run] Would add BankCard for device {device.device_id} ({device.name or "no name"})')
                created += 1
                continue

            # Pick GmailAccount for --link-mail (round-robin)
            email_account = None
            if link_mail and unlinked_gmails and gmail_index < len(unlinked_gmails):
                email_account = unlinked_gmails[gmail_index]
                gmail_index += 1
                linked += 1

            bank_name = (template.bank_name if template else 'Default Bank') or 'Default Bank'
            template_code = template.template_code if template else 'FIXED'
            did = device.device_id or ''
            card_holder_name = device.name or f'Device {(did[:12] or "unknown")}'
            card_number = (did.replace('-', '').replace('_', '') + '0000')[-4:] or '0000'
            email = None
            if email_account:
                email = email_account.gmail_email

            if not email:
                email = f'device.{(did[:16] or "unknown")}@fastpay.local'

            BankCard.objects.create(
                device=device,
                template=template,
                email_account=email_account,
                card_number=card_number,
                card_holder_name=card_holder_name,
                bank_name=bank_name,
                bank_code=template_code,
                card_type=template.card_type if template else 'debit',
                status='active',
                email=email,
                mobile_number=device.phone or device.current_phone,
            )
            created += 1
            self.stdout.write(f'  Created BankCard for device {device.device_id} (email={email})')

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'[dry-run] Would create {created} bank card(s)'))
            if link_mail and unlinked_gmails:
                self.stdout.write(self.style.SUCCESS(f'[dry-run] Would link up to {min(created, len(unlinked_gmails))} GmailAccount(s)'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Created {created} bank card(s) for devices'))
            if link_mail and linked:
                self.stdout.write(self.style.SUCCESS(f'Linked {linked} GmailAccount(s) to new bank cards'))
