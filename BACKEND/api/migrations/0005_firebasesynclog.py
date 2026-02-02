# Generated migration for FirebaseSyncLog model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_device_model_and_systeminfo'),
    ]

    operations = [
        migrations.CreateModel(
            name='FirebaseSyncLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sync_type', models.CharField(db_index=True, help_text="Type of sync: 'all_devices', 'single_device', 'messages', etc.", max_length=50)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('running', 'Running'), ('completed', 'Completed'), ('failed', 'Failed'), ('partial', 'Partial Success')], db_index=True, default='pending', help_text='Sync status', max_length=20)),
                ('devices_processed', models.IntegerField(default=0, help_text='Number of devices processed')),
                ('devices_succeeded', models.IntegerField(default=0, help_text='Number of devices successfully synced')),
                ('devices_failed', models.IntegerField(default=0, help_text='Number of devices that failed')),
                ('messages_fetched', models.IntegerField(default=0, help_text='Total messages fetched from Firebase')),
                ('messages_created', models.IntegerField(default=0, help_text='Total messages created in Django')),
                ('messages_skipped', models.IntegerField(default=0, help_text='Total messages skipped (already exist)')),
                ('messages_deleted_from_firebase', models.IntegerField(default=0, help_text='Total messages deleted from Firebase during cleanup')),
                ('error_message', models.TextField(blank=True, help_text='Error message if sync failed', null=True)),
                ('error_details', models.JSONField(blank=True, default=dict, help_text='Detailed error information')),
                ('started_at', models.DateTimeField(blank=True, help_text='Sync start timestamp', null=True)),
                ('completed_at', models.DateTimeField(blank=True, help_text='Sync completion timestamp', null=True)),
                ('duration_seconds', models.FloatField(blank=True, help_text='Sync duration in seconds', null=True)),
                ('additional_info', models.JSONField(blank=True, default=dict, help_text='Additional sync information')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('device', models.ForeignKey(blank=True, help_text='Device being synced (null for all-devices sync)', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sync_logs', to='api.device')),
            ],
            options={
                'verbose_name': 'Firebase Sync Log',
                'verbose_name_plural': 'Firebase Sync Logs',
                'ordering': ['-started_at', '-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='firebasesynclog',
            index=models.Index(fields=['sync_type'], name='api_firebas_sync_ty_idx'),
        ),
        migrations.AddIndex(
            model_name='firebasesynclog',
            index=models.Index(fields=['status'], name='api_firebas_status_idx'),
        ),
        migrations.AddIndex(
            model_name='firebasesynclog',
            index=models.Index(fields=['device'], name='api_firebas_device__idx'),
        ),
        migrations.AddIndex(
            model_name='firebasesynclog',
            index=models.Index(fields=['started_at'], name='api_firebas_started_idx'),
        ),
    ]
