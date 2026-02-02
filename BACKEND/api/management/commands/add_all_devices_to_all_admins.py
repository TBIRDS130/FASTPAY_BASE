"""
Management command to assign all devices to all users with access_level = 0 (Full Admin).

Usage:
  python manage.py add_all_devices_to_all_admins
  python manage.py add_all_devices_to_all_admins --dry-run
"""
from django.core.management.base import BaseCommand
from api.models import Device, DashUser


class Command(BaseCommand):
    help = 'Assign all devices to all users with access_level = 0 (Full Admin)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN – no changes will be saved'))

        # Get all admin users (access_level = 0)
        admin_users = DashUser.objects.filter(access_level=0, status='active')
        admin_count = admin_users.count()

        if admin_count == 0:
            self.stdout.write(self.style.WARNING('No active admin users (access_level=0) found.'))
            return

        # Get all devices
        devices = Device.objects.all()
        device_count = devices.count()

        if device_count == 0:
            self.stdout.write(self.style.WARNING('No devices found. Nothing to assign.'))
            return

        self.stdout.write(f'\nFound {admin_count} admin user(s) and {device_count} device(s)')
        self.stdout.write('=' * 60)

        if dry_run:
            self.stdout.write(self.style.WARNING('\n[DRY RUN] Would perform the following:'))
            for user in admin_users:
                self.stdout.write(f'\n  User: {user.email}')
                self.stdout.write(f'    Would assign {device_count} device(s)')
                if device_count <= 5:
                    for device in devices:
                        self.stdout.write(f'      - {device.device_id} ({device.name or "no name"})')
                else:
                    for device in devices[:5]:
                        self.stdout.write(f'      - {device.device_id} ({device.name or "no name"})')
                    self.stdout.write(f'      ... and {device_count - 5} more')
            return

        # Assign devices to each admin user
        total_assignments = 0
        for user in admin_users:
            self.stdout.write(f'\nProcessing user: {user.email}')
            
            # Count existing assignments
            existing_count = user.assigned_devices.count()
            
            # Add all devices (ManyToMany - duplicates are ignored)
            added_count = 0
            for device in devices:
                # Check if already assigned
                if not user.assigned_devices.filter(id=device.id).exists():
                    user.assigned_devices.add(device)
                    added_count += 1
            
            total_assignments += added_count
            self.stdout.write(
                self.style.SUCCESS(
                    f'  ✅ Assigned {added_count} new device(s) '
                    f'(already had {existing_count}, now has {user.assigned_devices.count()})'
                )
            )

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Completed! Assigned devices to {admin_count} admin user(s)'
            )
        )
        self.stdout.write(f'   Total new assignments: {total_assignments}')
