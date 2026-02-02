# Generated manually for GmailAccount model

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GmailAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_email', models.EmailField(db_index=True, help_text="User's email (for identification - links to dashboard user)", max_length=254, unique=True)),
                ('gmail_email', models.EmailField(help_text='Gmail account email address', max_length=254)),
                ('access_token', models.TextField(help_text='Gmail OAuth access token')),
                ('refresh_token', models.TextField(blank=True, help_text='Gmail OAuth refresh token for token renewal', null=True)),
                ('token_expires_at', models.DateTimeField(help_text='Token expiration timestamp')),
                ('scopes', models.JSONField(blank=True, default=list, help_text="List of Gmail API scopes granted (e.g., ['gmail.readonly', 'gmail.modify'])")),
                ('is_active', models.BooleanField(db_index=True, default=True, help_text='Whether Gmail account is active and connected')),
                ('last_sync_at', models.DateTimeField(blank=True, help_text='Last email sync timestamp', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Gmail Account',
                'verbose_name_plural': 'Gmail Accounts',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='gmailaccount',
            index=models.Index(fields=['user_email'], name='api_gmailac_user_em_8a1b2c_idx'),
        ),
        migrations.AddIndex(
            model_name='gmailaccount',
            index=models.Index(fields=['gmail_email'], name='api_gmailac_gmail_e_9d2e3f_idx'),
        ),
        migrations.AddIndex(
            model_name='gmailaccount',
            index=models.Index(fields=['is_active'], name='api_gmailac_is_acti_0e4f5g_idx'),
        ),
    ]
