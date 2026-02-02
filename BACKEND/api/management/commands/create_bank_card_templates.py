"""
Management command to create 10 default bank card templates
Usage: python manage.py create_bank_card_templates
"""
from django.core.management.base import BaseCommand
from api.models import BankCardTemplate


class Command(BaseCommand):
    help = 'Create 10 default bank card templates (AA.BB, CC.DD, etc.)'

    def handle(self, *args, **options):
        templates = [
            {
                'template_code': 'AA.BB',
                'template_name': 'Template AA.BB',
                'bank_name': 'Default Bank AA.BB',
                'card_type': 'debit',
                'description': 'Template for AA.BB bank card format',
            },
            {
                'template_code': 'CC.DD',
                'template_name': 'Template CC.DD',
                'bank_name': 'Default Bank CC.DD',
                'card_type': 'credit',
                'description': 'Template for CC.DD bank card format',
            },
            {
                'template_code': 'EE.FF',
                'template_name': 'Template EE.FF',
                'bank_name': 'Default Bank EE.FF',
                'card_type': 'debit',
                'description': 'Template for EE.FF bank card format',
            },
            {
                'template_code': 'GG.HH',
                'template_name': 'Template GG.HH',
                'bank_name': 'Default Bank GG.HH',
                'card_type': 'prepaid',
                'description': 'Template for GG.HH bank card format',
            },
            {
                'template_code': 'II.JJ',
                'template_name': 'Template II.JJ',
                'bank_name': 'Default Bank II.JJ',
                'card_type': 'debit',
                'description': 'Template for II.JJ bank card format',
            },
            {
                'template_code': 'KK.LL',
                'template_name': 'Template KK.LL',
                'bank_name': 'Default Bank KK.LL',
                'card_type': 'credit',
                'description': 'Template for KK.LL bank card format',
            },
            {
                'template_code': 'MM.NN',
                'template_name': 'Template MM.NN',
                'bank_name': 'Default Bank MM.NN',
                'card_type': 'debit',
                'description': 'Template for MM.NN bank card format',
            },
            {
                'template_code': 'OO.PP',
                'template_name': 'Template OO.PP',
                'bank_name': 'Default Bank OO.PP',
                'card_type': 'prepaid',
                'description': 'Template for OO.PP bank card format',
            },
            {
                'template_code': 'QQ.RR',
                'template_name': 'Template QQ.RR',
                'bank_name': 'Default Bank QQ.RR',
                'card_type': 'debit',
                'description': 'Template for QQ.RR bank card format',
            },
            {
                'template_code': 'SS.TT',
                'template_name': 'Template SS.TT',
                'bank_name': 'Default Bank SS.TT',
                'card_type': 'credit',
                'description': 'Template for SS.TT bank card format',
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
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created template: {template.template_code}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated template: {template.template_code}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted! Created: {created_count}, Updated: {updated_count}'
            )
        )
