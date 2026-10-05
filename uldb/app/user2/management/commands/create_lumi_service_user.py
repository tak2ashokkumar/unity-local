# -*- coding: utf-8 -*-
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from app.organization.models import Organization
from app.user2.models import User
from rest_framework.authtoken.models import Token


class Command(BaseCommand):

    help = 'Create the lumi-service user and DRF token used by Lumi to authenticate against ULDB.'

    def handle(self, *args, **options):
        org, org_created = Organization.objects.get_or_create(
            name='LumiAdminOrg',
            defaults={
                'organization_type': 'INTERNAL',
                'customer_type': 'UL',
                'region': Organization.US_REGION,
                'is_active': True,
            }
        )

        if org_created:
            self.stdout.write(self.style.SUCCESS(
                'Created org: %s (id=%s)' % (org.name, org.id)
            ))
        else:
            self.stdout.write('Using existing org: %s (id=%s)' % (org.name, org.id))

        user, created = User.objects.get_or_create(
            email='lumi-service@unityone.ai',
            defaults={
                'org': org,
                'first_name': 'Lumi',
                'last_name': 'Service',
                'is_active': True,
                'is_staff': False,
                'is_customer_admin': False,
            }
        )
        # Service account — no password login, token auth only.
        user.password = make_password(None)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(
                'Created lumi-service user (id=%s)' % user.id
            ))
        else:
            self.stdout.write('lumi-service user already exists (id=%s)' % user.id)

        token, token_created = Token.objects.get_or_create(user=user)
        if token_created:
            self.stdout.write(self.style.SUCCESS('Generated new token.'))
        else:
            self.stdout.write('Token already exists.')

        self.stdout.write('')
        self.stdout.write(self.style.WARNING(
            'Copy this value into LUMI_UNITYONE_SERVICE_TOKEN in Lumi\'s .env:'
        ))
        self.stdout.write(self.style.SUCCESS(token.key))
