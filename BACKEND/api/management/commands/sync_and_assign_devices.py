"""
Management command to sync all devices from Firebase (device/{deviceId}/) and assign them to admin@fastpay.com.

This command:
1. Syncs all devices from Firebase using the device/{deviceId}/ path structure
2. Assigns all synced devices to admin@fastpay.com (creates user if needed)

Usage:
    python manage.py sync_and_assign_devices
    python manage.py sync_and_assign_devices --email admin@fastpay.com
    python manage.py sync_and_assign_devices --dry-run
"""
import time
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from api.models import Device, DashUser, FirebaseSyncLog
from api.utils import hard_sync_all_devices_from_firebase, get_or_create_admin_user


class Command(BaseCommand):
    help = 'Sync all devices from Firebase (device/{deviceId}/) and assign to admin@fastpay.com'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@fastpay.com',
            help='Dashboard user email to assign devices to (default: admin@fastpay.com)',
        )
        parser.add_argument(
            '--update-existing',
            action='store_true',
            default=True,
            help='Update existing records in Django (default: True)',
        )
        parser.add_argument(
            '--no-update-existing',
            action='store_false',
            dest='update_existing',
            help='Skip updating existing records (only create new)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Dry run mode - show what would be done without making changes',
        )

    def handle(self, *args, **options):
        email = options['email']
        update_existing = options.get('update_existing', True)
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Step 1: Get or create admin user
        self.stdout.write(f'\nStep 1: Getting or creating admin user: {email}')
        try:
            if dry_run:
                try:
                    user = DashUser.objects.get(email=email)
                    self.stdout.write(self.style.SUCCESS(f'  [dry-run] User {email} exists'))
                except DashUser.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'  [dry-run] User {email} would be created'))
                    user = None
            else:
                user = get_or_create_admin_user() if email == 'admin@fastpay.com' else DashUser.objects.get_or_create(
                    email=email,
                    defaults={
                        'password': 'admin123',
                        'access_level': 0,
                        'status': 'active',
                        'full_name': 'Admin',
                    }
                )[0]
                self.stdout.write(self.style.SUCCESS(f'  ✓ User {email} ready'))
        except Exception as e:
            raise CommandError(f'Error getting/creating user {email}: {str(e)}')
        
        if not user and not dry_run:
            raise CommandError(f'Could not get or create user {email}')
        
        # Step 2: Sync all devices from Firebase
        self.stdout.write(f'\nStep 2: Syncing all devices from Firebase (device/{{deviceId}}/)')
        self.stdout.write('  Using primary path: device/{deviceId}/')
        
        # Create sync log
        sync_log = None
        if not dry_run:
            sync_log = FirebaseSyncLog.objects.create(
                sync_type='sync_and_assign_devices',
                status='running',
                started_at=timezone.now(),
                additional_info={
                    'admin_email': email,
                    'update_existing': update_existing,
                    'dry_run': dry_run,
                }
            )
        
        try:
            if not dry_run:
                start_time = time.time()
                result = hard_sync_all_devices_from_firebase(update_existing=update_existing)
                duration = time.time() - start_time
                
                # Update sync log
                if sync_log:
                    sync_log.devices_processed = result['total_devices_processed']
                    sync_log.devices_succeeded = result['devices_synced']
                    sync_log.devices_failed = result['devices_failed']
                    sync_log.messages_fetched = sum(dr.get('messages_fetched', 0) for dr in result['device_results'])
                    sync_log.messages_created = result['total_messages_created'] + result['total_messages_updated']
                    sync_log.messages_skipped = sum(dr.get('messages_skipped', 0) for dr in result['device_results'])
                    sync_log.error_message = '; '.join(result['errors']) if result['errors'] else None
                    sync_log.error_details = {
                        'errors': result['errors'],
                        'device_results': result['device_results']
                    }
                    sync_log.completed_at = timezone.now()
                    sync_log.duration_seconds = duration
                    
                    # Determine status
                    if result['devices_failed'] == 0:
                        sync_log.status = 'completed'
                    elif result['devices_synced'] > 0:
                        sync_log.status = 'partial'
                    else:
                        sync_log.status = 'failed'
                    
                    sync_log.additional_info.update({
                        'total_notifications_created': result.get('total_notifications_created', 0),
                        'total_notifications_updated': result.get('total_notifications_updated', 0),
                        'total_contacts_created': result.get('total_contacts_created', 0),
                        'total_contacts_updated': result.get('total_contacts_updated', 0),
                    })
                    sync_log.save()
                
                # Print sync results
                self.stdout.write(self.style.SUCCESS(f'\n  ✓ Sync completed:'))
                self.stdout.write(f'    Total devices processed: {result["total_devices_processed"]}')
                self.stdout.write(f'    Devices synced: {result["devices_synced"]}')
                self.stdout.write(f'    Devices failed: {result["devices_failed"]}')
                self.stdout.write(f'    Messages created/updated: {result["total_messages_created"] + result["total_messages_updated"]}')
                self.stdout.write(f'    Notifications created/updated: {result["total_notifications_created"] + result["total_notifications_updated"]}')
                self.stdout.write(f'    Contacts created/updated: {result["total_contacts_created"] + result["total_contacts_updated"]}')
                if result['errors']:
                    self.stdout.write(self.style.ERROR(f'    Errors: {len(result["errors"])}'))
                self.stdout.write(f'    Duration: {duration:.2f} seconds')
            else:
                device_count = Device.objects.count()
                self.stdout.write(f'  [dry-run] Would sync {device_count} devices from Firebase')
                self.stdout.write(f'  [dry-run] Would update existing: {update_existing}')
                result = {'devices_synced': device_count, 'total_devices_processed': device_count}
                
        except Exception as e:
            error_msg = f'Error syncing devices from Firebase: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            if sync_log:
                sync_log.status = 'failed'
                sync_log.error_message = error_msg
                sync_log.error_details = {'exception': str(e)}
                sync_log.completed_at = timezone.now()
                sync_log.save()
            raise CommandError(error_msg)
        
        # Step 3: Assign all devices to admin user
        self.stdout.write(f'\nStep 3: Assigning all devices to {email}')
        
        try:
            devices = Device.objects.all()
            device_count = devices.count()
            
            if device_count == 0:
                self.stdout.write(self.style.WARNING('  No devices found. Nothing to assign.'))
                return
            
            if dry_run:
                self.stdout.write(self.style.SUCCESS(f'  [dry-run] Would assign {device_count} device(s) to {email}'))
                for d in devices[:5]:
                    self.stdout.write(f'    [dry-run] {d.device_id} ({d.name or "no name"})')
                if device_count > 5:
                    self.stdout.write(f'    ... and {device_count - 5} more')
            else:
                # Assign all devices to admin user
                assigned_count = 0
                for device in devices:
                    # Use .add() for ManyToMany - this won't duplicate if already assigned
                    device.assigned_to.add(user)
                    assigned_count += 1
                
                self.stdout.write(self.style.SUCCESS(f'  ✓ Assigned {assigned_count} device(s) to {email}'))
                
                # Summary
                self.stdout.write(self.style.SUCCESS(f'\n✅ Complete!'))
                self.stdout.write(f'  Devices synced from Firebase: {result.get("devices_synced", 0)}')
                self.stdout.write(f'  Devices assigned to {email}: {assigned_count}')
                
        except Exception as e:
            error_msg = f'Error assigning devices to {email}: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            raise CommandError(error_msg)
