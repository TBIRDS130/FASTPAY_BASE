from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_add_notification_extra'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashuser',
            name='theme_mode',
            field=models.CharField(
                choices=[('white', 'White'), ('dark', 'Dark')],
                default='white',
                help_text='Dashboard theme mode preference (white or dark)',
                max_length=10,
            ),
        ),
    ]
