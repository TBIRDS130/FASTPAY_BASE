"""
Management command to set up dashboard admin and sync all devices
Usage: python manage.py setup_dashboard --email admin@fastpay.com --password adminpass
"""
from django.core.management.base import BaseCommand
from api.models import DashUser, Device
from api.utils import hard_sync_all_devices_from_firebase
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Create dashboard admin user and sync all devices from Firebase'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@fastpay.com', help='Admin email')
        parser.add_argument('--password', type=str, default='admin123', help='Admin password')
        parser.add_argument('--full-name', type=str, default='System Administrator', help='Admin full name')
        parser.add_argument('--skip-sync', action='store_true', help='Skip device synchronization')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        full_name = options['full_name']
        skip_sync = options['skip_sync']

        self.stdout.write(self.style.SUCCESS(f'--- Setting up Dashboard for {email} ---'))

        # 1. Create or update admin user
        user, created = DashUser.objects.update_or_create(
            email=email,
            defaults={
                'password': password,
                'access_level': 0,  # Full Admin
                'status': 'active',
                'full_name': full_name
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created new admin user: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ Updated existing admin user: {email}'))

        # 2. Sync devices from Firebase
        if not skip_sync:
            self.stdout.write(self.style.NOTICE('\n--- Discovering and syncing all devices from Firebase ---'))
            try:
                results = hard_sync_all_devices_from_firebase(update_existing=True)
                
                self.stdout.write(self.style.SUCCESS(f"✅ Sync completed:"))
                self.stdout.write(f"  - Total devices processed: {results.get('total_devices_processed', 0)}")
                self.stdout.write(f"  - Devices successfully synced: {results.get('devices_synced', 0)}")
                self.stdout.write(f"  - Devices failed: {results.get('devices_failed', 0)}")
                self.stdout.write(f"  - Messages created: {results.get('total_messages_created', 0)}")
                self.stdout.write(f"  - Notifications created: {results.get('total_notifications_created', 0)}")
                
                if results.get('errors'):
                    self.stdout.write(self.style.WARNING(f"\n⚠ Sync encountered {len(results['errors'])} errors (check logs for details)"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Device sync failed: {str(e)}"))
        else:
            self.stdout.write(self.style.NOTICE('Skipping device synchronization as requested.'))

        self.stdout.write(self.style.SUCCESS('\n🚀 Setup complete! Dashboard is ready.'))
