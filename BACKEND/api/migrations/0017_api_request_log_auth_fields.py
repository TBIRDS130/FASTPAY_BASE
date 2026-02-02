from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0016_api_request_log_source_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="apirequestlog",
            name="auth_type",
            field=models.CharField(blank=True, db_index=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name="apirequestlog",
            name="token_user",
            field=models.CharField(blank=True, db_index=True, max_length=255, null=True),
        ),
    ]
