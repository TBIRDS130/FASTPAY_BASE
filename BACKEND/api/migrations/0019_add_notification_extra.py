from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_update_dashuser_role_labels'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='extra',
            field=models.JSONField(blank=True, default=dict, help_text='Additional notification fields'),
        ),
    ]
