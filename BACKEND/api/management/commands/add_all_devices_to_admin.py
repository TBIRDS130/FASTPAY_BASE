"""
Management command to assign all devices to admin@fastpay.com (or another DashUser).

Usage:
  python manage.py add_all_devices_to_admin
  python manage.py add_all_devices_to_admin --email admin@fastpay.com
  python manage.py add_all_devices_to_admin --dry-run
"""
from django.core.management.base import BaseCommand
from api.models import Device, DashUser


class Command(BaseCommand):
    help = 'Assign all devices to admin@fastpay.com (or specified DashUser)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@fastpay.com',
            help='Dashboard user email to assign devices to (default: admin@fastpay.com)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        email = options['email']
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN – no changes will be saved'))

        try:
            user = DashUser.objects.get(email=email)
        except DashUser.DoesNotExist:
            if dry_run:
                self.stdout.write(self.style.WARNING(f'[dry-run] User {email} does not exist. Would create it first.'))
                user = None
            else:
                user = DashUser.objects.create(
                    email=email,
                    password='admin123',
                    access_level=0,
                    status='active',
                    full_name='Admin',
                )
                self.stdout.write(self.style.SUCCESS(f'Created DashUser: {email}'))

        if user is None:
            count = Device.objects.count()
            if dry_run:
                self.stdout.write(self.style.SUCCESS(f'[dry-run] Would assign {count} device(s) to {email}'))
            return

        devices = Device.objects.all()
        count = devices.count()
        if count == 0:
            self.stdout.write(self.style.WARNING('No devices found. Nothing to assign.'))
            return

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'[dry-run] Would assign {count} device(s) to {email}'))
            for d in devices[:5]:
                self.stdout.write(f'  [dry-run] {d.device_id} ({d.name or "no name"})')
            if count > 5:
                self.stdout.write(f'  ... and {count - 5} more')
            return

        # ManyToMany: Use .add() instead of .update()
        count = 0
        for device in devices:
            device.assigned_to.add(user)
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Assigned {count} device(s) to {email}'))
