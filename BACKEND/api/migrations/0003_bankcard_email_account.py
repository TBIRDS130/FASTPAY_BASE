# Generated migration for adding email_account to BankCard
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_gmailaccount'),
    ]

    operations = [
        migrations.AddField(
            model_name='bankcard',
            name='email_account',
            field=models.OneToOneField(
                blank=True,
                db_index=True,
                help_text='Linked Gmail account for this bank card',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='bank_card',
                to='api.gmailaccount'
            ),
        ),
        migrations.AddIndex(
            model_name='bankcard',
            index=models.Index(fields=['email_account'], name='api_bankcar_email_a_idx'),
        ),
    ]
