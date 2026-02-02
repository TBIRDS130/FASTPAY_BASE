from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_activitylog'),
    ]

    operations = [
        migrations.CreateModel(
            name='CaptureItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source', models.CharField(choices=[('extension', 'Extension'), ('dashboard', 'Dashboard'), ('mobile', 'Mobile')], db_index=True, default='extension', max_length=20)),
                ('user_email', models.EmailField(blank=True, db_index=True, max_length=254, null=True)),
                ('title', models.CharField(blank=True, max_length=255)),
                ('content', models.TextField()),
                ('source_url', models.URLField(blank=True, max_length=1000)),
                ('raw_data', models.JSONField(blank=True, default=dict)),
                ('status', models.CharField(choices=[('new', 'New'), ('processed', 'Processed'), ('failed', 'Failed')], db_index=True, default='new', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('device', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='captures', to='api.device')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='captureitem',
            index=models.Index(fields=['source', '-created_at'], name='api_captur_source_7c82a4_idx'),
        ),
        migrations.AddIndex(
            model_name='captureitem',
            index=models.Index(fields=['user_email', '-created_at'], name='api_captur_user_e_50f9a2_idx'),
        ),
        migrations.AddIndex(
            model_name='captureitem',
            index=models.Index(fields=['status', '-created_at'], name='api_captur_status_12d87e_idx'),
        ),
    ]
