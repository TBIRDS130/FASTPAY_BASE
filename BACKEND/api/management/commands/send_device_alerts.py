import os
from datetime import datetime, timezone as dt_timezone
from django.core.management.base import BaseCommand
from api.models import Device
from api.telegram_service import send_telegram_alert


class Command(BaseCommand):
    help = "Send Telegram alerts for offline devices, low battery, and sync failures."

    def handle(self, *args, **options):
        offline_minutes = int(os.environ.get("DEVICE_OFFLINE_MINUTES", "10"))
        low_battery_threshold = int(os.environ.get("DEVICE_LOW_BATTERY_THRESHOLD", "20"))

        now_ms = int(datetime.now(dt_timezone.utc).timestamp() * 1000)
        offline_cutoff = now_ms - (offline_minutes * 60 * 1000)

        offline_devices = Device.objects.filter(last_seen__isnull=False, last_seen__lt=offline_cutoff)
        for device in offline_devices:
            send_telegram_alert(
                f"Device offline: {device.device_id} last_seen={device.last_seen}",
                bot_name="alerts",
                throttle_key=f"device_offline:{device.device_id}",
            )

        low_battery_devices = Device.objects.filter(battery_percentage__isnull=False, battery_percentage__lte=low_battery_threshold)
        for device in low_battery_devices:
            send_telegram_alert(
                f"Low battery: {device.device_id} battery={device.battery_percentage}%",
                bot_name="alerts",
                throttle_key=f"low_battery:{device.device_id}",
            )

        sync_failed_devices = Device.objects.filter(sync_status__in=['sync_failed', 'out_of_sync'])
        for device in sync_failed_devices:
            send_telegram_alert(
                f"Sync issue: {device.device_id} status={device.sync_status} error={device.sync_error_message or 'n/a'}",
                bot_name="alerts",
                throttle_key=f"sync_issue:{device.device_id}",
            )
