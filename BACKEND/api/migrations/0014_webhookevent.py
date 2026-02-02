from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_captureitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='WebhookEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(db_index=True, max_length=50)),
                ('path', models.CharField(db_index=True, max_length=255)),
                ('client_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('headers', models.JSONField(blank=True, default=dict)),
                ('payload', models.JSONField(blank=True, default=dict)),
                ('received_at', models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={
                'ordering': ['-received_at'],
                'verbose_name': 'Webhook Event',
                'verbose_name_plural': 'Webhook Events',
            },
        ),
        migrations.AddIndex(
            model_name='webhookevent',
            index=models.Index(fields=['event_type', '-received_at'], name='api_webhoo_event_t_15f9a2_idx'),
        ),
        migrations.AddIndex(
            model_name='webhookevent',
            index=models.Index(fields=['path', '-received_at'], name='api_webhoo_path_8ab03c_idx'),
        ),
    ]
