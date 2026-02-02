# Generated migration for adding model and system_info fields to Device
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_bankcard_email_account'),
    ]

    operations = [
        migrations.AddField(
            model_name='device',
            name='model',
            field=models.CharField(blank=True, help_text='Device model (Brand + Model, e.g., \'Samsung Galaxy S21\')', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='device',
            name='system_info',
            field=models.JSONField(blank=True, default=dict, help_text='System information matching Firebase structure (buildInfo, displayInfo, storageInfo, memoryInfo, batteryInfo, networkInfo, phoneSimInfo, systemSettings, runtimeInfo, deviceFeatures, powerManagement, bootInfo, performanceMetrics, permissionStatus)'),
        ),
    ]
