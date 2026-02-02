"""
Django management command for hard sync: Sync complete Firebase data device-wise and update Django.

This command performs a comprehensive sync of all device data from Firebase:
- Device information (name, code, isActive, systemInfo, etc.)
- Messages
- Notifications
- Contacts

Usage:
    python manage.py hard_sync_firebase [--device-id DEVICE_ID] [--update-existing] [--dry-run]
    
Examples:
    # Hard sync all devices
    python manage.py hard_sync_firebase
    
    # Hard sync specific device
    python manage.py hard_sync_firebase --device-id abc123
    
    # Skip updating existing records (only create new)
    python manage.py hard_sync_firebase --no-update-existing
    
    # Dry run (don't modify database)
    python manage.py hard_sync_firebase --dry-run
"""
import time
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from api.models import Device, FirebaseSyncLog
from api.utils import hard_sync_device_from_firebase, hard_sync_all_devices_from_firebase


class Command(BaseCommand):
    help = 'Hard sync: Sync complete Firebase data device-wise and update Django'

    def add_arguments(self, parser):
        parser.add_argument(
            '--device-id',
            type=str,
            help='Device ID to sync (if not provided, syncs all devices)',
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
        device_id = options.get('device_id')
        update_existing = options.get('update_existing', True)
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Create sync log
        sync_log = FirebaseSyncLog.objects.create(
            sync_type='hard_sync_single_device' if device_id else 'hard_sync_all_devices',
            status='running',
            started_at=timezone.now(),
            additional_info={
                'device_id': device_id,
                'update_existing': update_existing,
                'dry_run': dry_run,
            }
        )
        
        if device_id:
            # Hard sync single device
            try:
                self.stdout.write(f'Hard syncing device: {device_id}')
                
                if not dry_run:
                    start_time = time.time()
                    result = hard_sync_device_from_firebase(device_id, update_existing=update_existing)
                    duration = time.time() - start_time
                    
                    # Update sync log
                    sync_log.device = Device.objects.filter(device_id=device_id).first()
                    sync_log.devices_processed = 1
                    sync_log.devices_succeeded = 1 if not result['errors'] else 0
                    sync_log.devices_failed = 1 if result['errors'] else 0
                    sync_log.messages_fetched = result['messages_fetched']
                    sync_log.messages_created = result['messages_created'] + result['messages_updated']
                    sync_log.messages_skipped = result['messages_skipped']
                    sync_log.error_message = '; '.join(result['errors']) if result['errors'] else None
                    sync_log.error_details = {'errors': result['errors']} if result['errors'] else {}
                    sync_log.completed_at = timezone.now()
                    sync_log.duration_seconds = duration
                    sync_log.status = 'completed' if not result['errors'] else 'failed'
                    sync_log.additional_info.update({
                        'device_created': result.get('device_created', False),
                        'device_updated': result.get('device_updated', False),
                        'notifications_fetched': result.get('notifications_fetched', 0),
                        'notifications_created': result.get('notifications_created', 0),
                        'notifications_updated': result.get('notifications_updated', 0),
                        'contacts_fetched': result.get('contacts_fetched', 0),
                        'contacts_created': result.get('contacts_created', 0),
                        'contacts_updated': result.get('contacts_updated', 0),
                    })
                    sync_log.save()
                    
                    # Print results
                    self.stdout.write(self.style.SUCCESS(f'\nHard sync completed for device {device_id}:'))
                    self.stdout.write(f'  Device: {"Created" if result["device_created"] else "Updated" if result["device_updated"] else "No change"}')
                    self.stdout.write(f'  Messages fetched: {result["messages_fetched"]}')
                    self.stdout.write(f'  Messages created: {result["messages_created"]}')
                    self.stdout.write(f'  Messages updated: {result["messages_updated"]}')
                    self.stdout.write(f'  Messages skipped: {result["messages_skipped"]}')
                    self.stdout.write(f'  Notifications fetched: {result["notifications_fetched"]}')
                    self.stdout.write(f'  Notifications created: {result["notifications_created"]}')
                    self.stdout.write(f'  Notifications updated: {result["notifications_updated"]}')
                    self.stdout.write(f'  Notifications skipped: {result["notifications_skipped"]}')
                    self.stdout.write(f'  Contacts fetched: {result["contacts_fetched"]}')
                    self.stdout.write(f'  Contacts created: {result["contacts_created"]}')
                    self.stdout.write(f'  Contacts updated: {result["contacts_updated"]}')
                    self.stdout.write(f'  Contacts skipped: {result["contacts_skipped"]}')
                    if result['errors']:
                        self.stdout.write(self.style.ERROR(f'  Errors: {"; ".join(result["errors"])}'))
                    self.stdout.write(f'  Duration: {duration:.2f} seconds')
                else:
                    self.stdout.write(f'  Would hard sync device: {device_id}')
                    self.stdout.write(f'  Would update existing: {update_existing}')
                    sync_log.status = 'completed'
                    sync_log.completed_at = timezone.now()
                    sync_log.save()
                    
            except Exception as e:
                error_msg = f'Error hard syncing device {device_id}: {str(e)}'
                self.stdout.write(self.style.ERROR(error_msg))
                sync_log.status = 'failed'
                sync_log.error_message = error_msg
                sync_log.error_details = {'exception': str(e)}
                sync_log.completed_at = timezone.now()
                sync_log.save()
                raise CommandError(error_msg)
        else:
            # Hard sync all devices
            self.stdout.write('Hard syncing all devices...')
            
            if not dry_run:
                start_time = time.time()
                result = hard_sync_all_devices_from_firebase(update_existing=update_existing)
                duration = time.time() - start_time
                
                # Update sync log
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
                
                # Print results
                self.stdout.write(self.style.SUCCESS(f'\nHard sync completed for all devices:'))
                self.stdout.write(f'  Total devices processed: {result["total_devices_processed"]}')
                self.stdout.write(f'  Devices synced: {result["devices_synced"]}')
                self.stdout.write(f'  Devices failed: {result["devices_failed"]}')
                self.stdout.write(f'  Total messages created: {result["total_messages_created"]}')
                self.stdout.write(f'  Total messages updated: {result["total_messages_updated"]}')
                self.stdout.write(f'  Total notifications created: {result["total_notifications_created"]}')
                self.stdout.write(f'  Total notifications updated: {result["total_notifications_updated"]}')
                self.stdout.write(f'  Total contacts created: {result["total_contacts_created"]}')
                self.stdout.write(f'  Total contacts updated: {result["total_contacts_updated"]}')
                if result['errors']:
                    self.stdout.write(self.style.ERROR(f'  Errors: {len(result["errors"])}'))
                    for error in result['errors'][:5]:  # Show first 5 errors
                        self.stdout.write(self.style.ERROR(f'    - {error}'))
                    if len(result['errors']) > 5:
                        self.stdout.write(self.style.ERROR(f'    ... and {len(result["errors"]) - 5} more'))
                self.stdout.write(f'  Duration: {duration:.2f} seconds')
            else:
                device_count = Device.objects.count()
                self.stdout.write(f'  Would hard sync {device_count} devices')
                self.stdout.write(f'  Would update existing: {update_existing}')
                sync_log.devices_processed = device_count
                sync_log.status = 'completed'
                sync_log.completed_at = timezone.now()
                sync_log.save()
