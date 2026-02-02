from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_api_request_log_auth_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dashuser',
            name='access_level',
            field=models.IntegerField(choices=[(0, 'ADMIN'), (1, 'OTP'), (2, 'REDPAY')], db_index=True, default=1, help_text='Access level: 0 = ADMIN, 1 = OTP, 2 = REDPAY'),
        ),
    ]
