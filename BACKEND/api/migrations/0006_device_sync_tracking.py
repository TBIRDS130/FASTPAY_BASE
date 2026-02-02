# Generated migration for adding sync tracking fields to Device model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_firebasesynclog'),
    ]

    operations = [
        migrations.AddField(
            model_name='device',
            name='last_sync_at',
            field=models.DateTimeField(blank=True, db_index=True, help_text='Last successful sync timestamp from Firebase', null=True),
        ),
        migrations.AddField(
            model_name='device',
            name='last_hard_sync_at',
            field=models.DateTimeField(blank=True, db_index=True, help_text='Last successful hard sync timestamp (complete data sync)', null=True),
        ),
        migrations.AddField(
            model_name='device',
            name='sync_status',
            field=models.CharField(
                choices=[
                    ('never_synced', 'Never Synced'),
                    ('syncing', 'Syncing'),
                    ('synced', 'Synced'),
                    ('sync_failed', 'Sync Failed'),
                    ('out_of_sync', 'Out of Sync'),
                ],
                db_index=True,
                default='never_synced',
                help_text='Current sync status of the device',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='device',
            name='sync_error_message',
            field=models.TextField(blank=True, help_text='Last sync error message (if any)', null=True),
        ),
        migrations.AddField(
            model_name='device',
            name='messages_last_synced_at',
            field=models.DateTimeField(blank=True, help_text='Last time messages were synced', null=True),
        ),
        migrations.AddField(
            model_name='device',
            name='notifications_last_synced_at',
            field=models.DateTimeField(blank=True, help_text='Last time notifications were synced', null=True),
        ),
        migrations.AddField(
            model_name='device',
            name='contacts_last_synced_at',
            field=models.DateTimeField(blank=True, help_text='Last time contacts were synced', null=True),
        ),
        migrations.AddField(
            model_name='device',
            name='sync_metadata',
            field=models.JSONField(blank=True, default=dict, help_text='Additional sync metadata (counts, stats, etc.)'),
        ),
        migrations.AddIndex(
            model_name='device',
            index=models.Index(fields=['last_sync_at'], name='api_device_last_sy_idx'),
        ),
        migrations.AddIndex(
            model_name='device',
            index=models.Index(fields=['last_hard_sync_at'], name='api_device_last_ha_idx'),
        ),
        migrations.AddIndex(
            model_name='device',
            index=models.Index(fields=['sync_status'], name='api_device_sync_st_idx'),
        ),
    ]
