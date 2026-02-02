"""
Management command to add 4 test bank card templates
Usage: python manage.py add_test_templates
"""
from django.core.management.base import BaseCommand
from api.models import BankCardTemplate


class Command(BaseCommand):
    help = 'Add 4 test bank card templates'

    def handle(self, *args, **options):
        templates = [
            {
                'template_code': 'TEST.001',
                'template_name': 'Test Template 001 - Premium Credit',
                'bank_name': 'Test Premium Bank',
                'card_type': 'credit',
                'description': 'Test template for premium credit cards with high limits',
                'default_fields': {
                    'balance': 50000,
                    'currency': 'INR',
                    'status': 'active',
                },
            },
            {
                'template_code': 'TEST.002',
                'template_name': 'Test Template 002 - Standard Debit',
                'bank_name': 'Test Standard Bank',
                'card_type': 'debit',
                'description': 'Test template for standard debit cards',
                'default_fields': {
                    'balance': 10000,
                    'currency': 'INR',
                    'status': 'active',
                },
            },
            {
                'template_code': 'TEST.003',
                'template_name': 'Test Template 003 - Prepaid Card',
                'bank_name': 'Test Prepaid Bank',
                'card_type': 'prepaid',
                'description': 'Test template for prepaid cards with limited balance',
                'default_fields': {
                    'balance': 5000,
                    'currency': 'INR',
                    'status': 'active',
                },
            },
            {
                'template_code': 'TEST.004',
                'template_name': 'Test Template 004 - Business Credit',
                'bank_name': 'Test Business Bank',
                'card_type': 'credit',
                'description': 'Test template for business credit cards with corporate features',
                'default_fields': {
                    'balance': 100000,
                    'currency': 'INR',
                    'status': 'active',
                    'account_name': 'Test Business Account',
                },
            },
        ]

        created_count = 0
        updated_count = 0

        for template_data in templates:
            template, created = BankCardTemplate.objects.update_or_create(
                template_code=template_data['template_code'],
                defaults={
                    'template_name': template_data['template_name'],
                    'bank_name': template_data['bank_name'],
                    'card_type': template_data['card_type'],
                    'description': template_data['description'],
                    'default_fields': template_data.get('default_fields', {}),
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created template: {template.template_code} - {template.template_name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated template: {template.template_code} - {template.template_name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{"="*50}\n'
                f'Completed! Created: {created_count}, Updated: {updated_count}\n'
                f'{"="*50}'
            )
        )
