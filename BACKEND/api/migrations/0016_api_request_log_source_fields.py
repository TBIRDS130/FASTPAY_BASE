from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0015_rename_api_captur_source_7c82a4_idx_api_capture_source_56d0d0_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="apirequestlog",
            name="host",
            field=models.CharField(blank=True, db_index=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="apirequestlog",
            name="origin",
            field=models.CharField(blank=True, db_index=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="apirequestlog",
            name="referer",
            field=models.CharField(blank=True, max_length=1024, null=True),
        ),
        migrations.AddField(
            model_name="apirequestlog",
            name="user_agent",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="apirequestlog",
            name="x_forwarded_for",
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]
