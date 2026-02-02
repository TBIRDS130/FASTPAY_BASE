"""
Django management command to sync messages from Firebase to Django
and clean Firebase to keep only the latest 100 messages per device.

Usage:
    python manage.py sync_firebase_messages [--device-id DEVICE_ID] [--keep-latest N] [--dry-run]
    
Examples:
    # Sync all devices
    python manage.py sync_firebase_messages
    
    # Sync specific device
    python manage.py sync_firebase_messages --device-id abc123
    
    # Keep only 50 latest messages in Firebase
    python manage.py sync_firebase_messages --keep-latest 50
    
    # Dry run (don't modify database or Firebase)
    python manage.py sync_firebase_messages --dry-run
"""
import time
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from api.models import Device, FirebaseSyncLog
from api.utils import sync_messages_from_firebase, sync_all_devices_from_firebase


class Command(BaseCommand):
    help = 'Sync messages from Firebase to Django and clean Firebase (keep only latest N messages)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--device-id',
            type=str,
            help='Device ID to sync (if not provided, syncs all devices)',
        )
        parser.add_argument(
            '--keep-latest',
            type=int,
            default=100,
            help='Number of latest messages to keep in Firebase after sync (default: 100)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Dry run mode - show what would be done without making changes',
        )

    def handle(self, *args, **options):
        device_id = options.get('device_id')
        keep_latest = options.get('keep_latest', 100)
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Create sync log
        sync_log = FirebaseSyncLog.objects.create(
            sync_type='single_device' if device_id else 'all_devices',
            status='running',
            started_at=timezone.now(),
            additional_info={
                'device_id': device_id,
                'keep_latest': keep_latest,
                'dry_run': dry_run,
            }
        )
        
        if device_id:
            # Sync single device
            try:
                device = Device.objects.get(device_id=device_id)
                sync_log.device = device
                sync_log.save()
                
                self.stdout.write(f'Syncing device: {device_id}')
                
                if not dry_run:
                    start_time = time.time()
                    result = sync_messages_from_firebase(device_id, keep_latest=keep_latest)
                    duration = time.time() - start_time
                    
                    # Update sync log
                    sync_log.devices_processed = 1
                    sync_log.devices_succeeded = 1 if not result['errors'] else 0
                    sync_log.devices_failed = 1 if result['errors'] else 0
                    sync_log.messages_fetched = result['messages_fetched']
                    sync_log.messages_created = result['messages_created']
                    sync_log.messages_skipped = result['messages_skipped']
                    sync_log.messages_deleted_from_firebase = result['messages_fetched'] - keep_latest if result['messages_fetched'] > keep_latest else 0
                    sync_log.error_message = '; '.join(result['errors']) if result['errors'] else None
                    sync_log.error_details = {'errors': result['errors']} if result['errors'] else {}
                    sync_log.completed_at = timezone.now()
                    sync_log.duration_seconds = duration
                    sync_log.status = 'completed' if not result['errors'] else 'failed'
                    sync_log.save()
                    
                    # Print results
                    self.stdout.write(self.style.SUCCESS(f'\nSync completed for device {device_id}:'))
                    self.stdout.write(f'  Messages fetched: {result["messages_fetched"]}')
                    self.stdout.write(f'  Messages created: {result["messages_created"]}')
                    self.stdout.write(f'  Messages skipped: {result["messages_skipped"]}')
                    self.stdout.write(f'  Firebase cleaned: {result["firebase_cleaned"]}')
                    if result['errors']:
                        self.stdout.write(self.style.ERROR(f'  Errors: {"; ".join(result["errors"])}'))
                    self.stdout.write(f'  Duration: {duration:.2f} seconds')
                else:
                    self.stdout.write(f'  Would sync device: {device_id}')
                    self.stdout.write(f'  Would keep latest: {keep_latest} messages')
                    sync_log.status = 'completed'
                    sync_log.completed_at = timezone.now()
                    sync_log.save()
                    
            except Device.DoesNotExist:
                error_msg = f'Device {device_id} not found'
                self.stdout.write(self.style.ERROR(error_msg))
                sync_log.status = 'failed'
                sync_log.error_message = error_msg
                sync_log.completed_at = timezone.now()
                sync_log.save()
                raise CommandError(error_msg)
            except Exception as e:
                error_msg = f'Error syncing device {device_id}: {str(e)}'
                self.stdout.write(self.style.ERROR(error_msg))
                sync_log.status = 'failed'
                sync_log.error_message = error_msg
                sync_log.error_details = {'exception': str(e)}
                sync_log.completed_at = timezone.now()
                sync_log.save()
                raise CommandError(error_msg)
        else:
            # Sync all devices
            self.stdout.write('Syncing all devices...')
            
            if not dry_run:
                start_time = time.time()
                result = sync_all_devices_from_firebase(keep_latest=keep_latest)
                duration = time.time() - start_time
                
                # Update sync log
                sync_log.devices_processed = result['total_devices']
                sync_log.devices_succeeded = result['devices_synced']
                sync_log.devices_failed = result['devices_failed']
                sync_log.messages_fetched = sum(dr['messages_fetched'] for dr in result['device_results'])
                sync_log.messages_created = result['total_messages_created']
                sync_log.messages_skipped = result['total_messages_skipped']
                sync_log.messages_deleted_from_firebase = sum(
                    max(0, dr['messages_fetched'] - keep_latest) 
                    for dr in result['device_results'] 
                    if dr['messages_fetched'] > keep_latest
                )
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
                
                sync_log.save()
                
                # Print results
                self.stdout.write(self.style.SUCCESS(f'\nSync completed for all devices:'))
                self.stdout.write(f'  Total devices: {result["total_devices"]}')
                self.stdout.write(f'  Devices synced: {result["devices_synced"]}')
                self.stdout.write(f'  Devices failed: {result["devices_failed"]}')
                self.stdout.write(f'  Total messages created: {result["total_messages_created"]}')
                self.stdout.write(f'  Total messages skipped: {result["total_messages_skipped"]}')
                if result['errors']:
                    self.stdout.write(self.style.ERROR(f'  Errors: {len(result["errors"])}'))
                    for error in result['errors'][:5]:  # Show first 5 errors
                        self.stdout.write(self.style.ERROR(f'    - {error}'))
                    if len(result['errors']) > 5:
                        self.stdout.write(self.style.ERROR(f'    ... and {len(result["errors"]) - 5} more'))
                self.stdout.write(f'  Duration: {duration:.2f} seconds')
            else:
                device_count = Device.objects.count()
                self.stdout.write(f'  Would sync {device_count} devices')
                self.stdout.write(f'  Would keep latest: {keep_latest} messages per device')
                sync_log.devices_processed = device_count
                sync_log.status = 'completed'
                sync_log.completed_at = timezone.now()
                sync_log.save()
