"""
Django management command to set up Django admin theme matching the dashboard.

This command creates a theme that matches the FastPay dashboard's "dark-premium" theme:
- Primary Color: #00ff88 (neon green)
- Accent Color: #6366f1 (indigo)
- Dark theme with modern glassmorphism feel
"""

from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = 'Set up Django admin theme to match FastPay dashboard theme'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update existing theme',
        )

    def handle(self, *args, **options):
        try:
            from admin_interface.models import Theme
        except ImportError:
            self.stdout.write(
                self.style.ERROR(
                    'django-admin-interface is not installed. '
                    'Please install it first: pip install django-admin-interface'
                )
            )
            return

        force = options['force']

        # Dashboard theme colors (matching dark-premium theme)
        theme_config = {
            'name': 'FastPay Dashboard Theme',
            'active': True,
            # Primary color: #00ff88 (neon green) - HSL: 150 100% 50%
            'primary_color': '#00ff88',
            # Secondary/Accent color: #6366f1 (indigo) - HSL: 238 87% 64%
            'secondary_color': '#6366f1',
            # Title color: White for dark theme
            'title_color': '#ffffff',
            # Text color: Light gray
            'text_color': '#e5e7eb',
            # Link color: Primary green
            'link_color': '#00ff88',
            # Link hover: Lighter green
            'link_hover_color': '#00ffaa',
            # Header background: Dark (matching dashboard)
            'header_background_color': '#0a0a0a',
            # Header text: White
            'header_text_color': '#ffffff',
            # Header link: Primary green
            'header_link_color': '#00ff88',
            # Header link hover: Lighter green
            'header_link_hover_color': '#00ffaa',
            # Environment name (optional)
            'environment_name': 'FastPay',
            # Environment color: Accent indigo
            'environment_color': '#6366f1',
            # Show icons
            'show_icons': True,
            # Foldable apps
            'foldable_apps': True,
            # Foldable models
            'foldable_models': True,
            # Show breadcrumbs
            'show_breadcrumbs': True,
            # List filter sidebar
            'list_filter_sidebar': True,
            # Related modal
            'related_modal': True,
            'related_modal_active': True,
            'related_modal_backdrop': True,
            'related_modal_close_button': True,
        }

        with transaction.atomic():
            # Check if theme already exists
            existing_theme = Theme.objects.filter(name=theme_config['name']).first()

            if existing_theme and not force:
                self.stdout.write(
                    self.style.WARNING(
                        f'Theme "{theme_config["name"]}" already exists. '
                        'Use --force to update it.'
                    )
                )
                return

            if existing_theme and force:
                # Update existing theme
                for key, value in theme_config.items():
                    setattr(existing_theme, key, value)
                existing_theme.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated theme "{theme_config["name"]}"'
                    )
                )
            else:
                # Deactivate all existing themes
                Theme.objects.filter(active=True).update(active=False)

                # Create new theme
                theme = Theme.objects.create(**theme_config)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created theme "{theme_config["name"]}" and set it as active'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                '\n✅ Django admin theme configured to match FastPay dashboard!\n'
                'Theme colors:'
                f'\n  Primary: {theme_config["primary_color"]} (neon green)'
                f'\n  Accent: {theme_config["secondary_color"]} (indigo)'
                f'\n  Header: {theme_config["header_background_color"]} (dark)'
                '\n\nVisit /admin/ to see the new theme.'
            )
        )
