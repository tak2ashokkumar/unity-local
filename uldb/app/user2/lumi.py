# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import unicode_literals

import hashlib
import logging

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.utils.text import slugify
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from app.organization.models import Organization
from app.user2.models import PasswordTooShort, User

try:
    text_type = unicode
except NameError:
    text_type = str


logger = logging.getLogger(__name__)
SERVICE_USER = 'lumi-service'


def _clean_string(value):
    if value is None:
        return ''
    if not isinstance(value, text_type):
        value = text_type(value)
    return value.strip()


def _password_string(value):
    if value is None:
        return ''
    if not isinstance(value, text_type):
        value = text_type(value)
    return value


def _email_domain(email):
    parts = email.split('@', 1)
    if len(parts) != 2:
        return ''
    return parts[1][:128]


def _hash_fragment(value):
    if isinstance(value, text_type):
        value = value.encode('utf-8')
    return hashlib.sha256(value).hexdigest()[:8]


def _org_name_for_email(email):
    local_part = email.split('@', 1)[0]
    base = slugify(local_part) or 'user'
    digest = _hash_fragment(email)
    return 'lumi-%s-%s' % (base[:114], digest)


def _split_name(display_name, email):
    name = _clean_string(display_name) or email.split('@', 1)[0]
    pieces = name.split(None, 1)
    first_name = pieces[0][:100]
    last_name = pieces[1][:100] if len(pieces) > 1 else ''
    return first_name, last_name


def _token_response(user, created, organization_created=False):
    token, _ = Token.objects.get_or_create(user=user)
    org = user.org
    return {
        'token': token.key,
        'user_id': user.id,
        'user_uuid': str(user.uuid) if user.uuid else None,
        'org_id': org.id,
        'organization': {
            'id': org.id,
            'name': org.name,
            'slug': org.slug,
        },
        'created': created,
        'organization_created': organization_created,
    }


def _mark_lumi_org(org, domain):
    changed = False
    if not org.is_lumi_org:
        org.is_lumi_org = True
        changed = True
    if domain and not org.domain:
        org.domain = domain
        changed = True
    if not org.company:
        org.company = org.name
        changed = True
    if changed:
        org.modified_user = SERVICE_USER
        org.save()


class LumiProvisionView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        email = _clean_string(request.data.get('username') or request.data.get('email')).lower()
        password = _password_string(request.data.get('password'))
        display_name = _clean_string(request.data.get('name'))
        logger.info(
            'lumi_provision_request service_user=%s email_domain=%s',
            request.user.email,
            _email_domain(email) if email else '',
        )

        if not email or not password:
            return Response(
                {'detail': 'username/email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {'detail': 'username/email must be a valid email address.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for attempt in range(2):
            try:
                response = self._provision(email, password, display_name)
                logger.info(
                    'lumi_provision_done email_domain=%s status=%s attempt=%d',
                    _email_domain(email),
                    response.status_code,
                    attempt,
                )
                return response
            except IntegrityError:
                logger.warning(
                    'lumi_provision_integrity_conflict email_domain=%s attempt=%d',
                    _email_domain(email),
                    attempt,
                )
                existing = User.objects.select_related('org').filter(email__iexact=email).first()
                if existing:
                    logger.info(
                        'lumi_provision_resolved_existing email_domain=%s',
                        _email_domain(email),
                    )
                    return Response(_token_response(existing, created=False), status=status.HTTP_200_OK)
                if attempt == 0:
                    continue
                logger.exception('lumi_provision_unrecoverable_conflict email=%s', email)
                return Response(
                    {'detail': 'Could not provision Lumi user.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            except PasswordTooShort as exc:
                logger.warning('lumi_provision_password_too_short email_domain=%s', _email_domain(email))
                return Response(
                    {'detail': text_type(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

    def _provision(self, email, password, display_name):
        existing = User.objects.select_related('org').filter(email__iexact=email).first()
        if existing:
            logger.info('lumi_provision_existing_user email_domain=%s user_id=%s', _email_domain(email), existing.id)
            return Response(_token_response(existing, created=False), status=status.HTTP_200_OK)

        org_name = _org_name_for_email(email)
        domain = _email_domain(email)
        first_name, last_name = _split_name(display_name, email)

        logger.info('lumi_provision_creating_user email_domain=%s org_name=%s', domain, org_name)

        with transaction.atomic():
            org, organization_created = Organization.objects.get_or_create(
                name=org_name,
                defaults={
                    'is_active': True,
                    'organization_type': 'EXTERNAL',
                    'customer_type': 'EXT',
                    'region': Organization.US_REGION,
                    'domain': domain,
                    'company': display_name or org_name,
                    'is_lumi_org': True,
                    'created_user': SERVICE_USER,
                    'modified_user': SERVICE_USER,
                },
            )
            if not organization_created:
                _mark_lumi_org(org, domain)

            logger.info(
                'lumi_provision_org org_id=%s org_created=%s domain=%s',
                org.id,
                organization_created,
                domain,
            )

            user = User(
                email=email,
                org=org,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
                is_customer_admin=True,
            )
            user.set_password(password)
            user.save()
            logger.info('lumi_provision_user_created user_id=%s org_id=%s', user.id, org.id)
            return Response(
                _token_response(user, created=True, organization_created=organization_created),
                status=status.HTTP_201_CREATED,
            )
