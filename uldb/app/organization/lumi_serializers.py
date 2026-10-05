# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import unicode_literals

from django.db import transaction
from django.utils.encoding import force_text
from rest_framework import serializers

from app.organization.models import Organization, LumiOrganizationUserRole
from app.user2.models import PasswordTooShort, User


LUMI_SERVICE_USER = 'lumi-service'


def _audit_user(serializer):
    request = serializer.context.get('request')
    user = getattr(request, 'user', None)
    return getattr(user, 'email', None) or LUMI_SERVICE_USER


class LumiOrganizationSerializer(serializers.ModelSerializer):
    # Override unique model fields because create() deliberately implements an
    # idempotent upsert by email.
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=128)
    email = serializers.EmailField(required=True)

    region = serializers.ChoiceField(
        choices=Organization.REGIONS,
        required=False,
    )

    class Meta:
        model = Organization
        fields = (
            'id', 'uuid', 'name', 'company', 'email', 'domain', 'phone',
            'address1', 'address2', 'city', 'state', 'postal_code', 'country',
            'region', 'organization_type', 'customer_type', 'is_active',
            'is_lumi_org',
        )
        read_only_fields = ('id', 'uuid', 'is_lumi_org')

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        name = attrs.get('name')
        if name:
            collision = Organization.objects.filter(name=name)
            email = attrs.get('email')
            if email:
                collision = collision.exclude(email__iexact=email)
            if self.instance is not None:
                collision = collision.exclude(pk=self.instance.pk)
            if collision.exists():
                raise serializers.ValidationError(
                    {'name': 'An Organisation with this name already exists.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        email = validated_data.pop('email')
        audit_user = _audit_user(self)

        instance = Organization.objects.filter(
            email__iexact=email
        ).first()

        if instance is not None:
            if not instance.is_lumi_org:
                raise serializers.ValidationError({
                    'email': (
                        'This email belongs to an existing non-Lumi '
                        'UnityOne Organisation.'
                    )
                })

            # Genuine idempotent update of an existing Lumi Organisation.
            for key, value in validated_data.items():
                setattr(instance, key, value)

            instance.email = email
            instance.is_lumi_org = True
            instance.modified_user = audit_user
            instance.save()
            return instance

        # Defaults apply only when creating a new Organisation.
        validated_data['is_lumi_org'] = True
        validated_data['created_user'] = audit_user
        validated_data['modified_user'] = audit_user
        validated_data.setdefault('is_active', True)
        validated_data.setdefault('organization_type', 'EXTERNAL')
        validated_data.setdefault('customer_type', 'EXT')
        validated_data.setdefault('region', Organization.US_REGION)

        return Organization.objects.create(
            email=email,
            **validated_data
        )

    @transaction.atomic
    def update(self, instance, validated_data):
        validated_data.pop('id', None)
        email = validated_data.get('email')
        if email and Organization.objects.filter(email__iexact=email).exclude(
                pk=instance.pk).exists():
            raise serializers.ValidationError(
                {'email': 'This email belongs to another Organisation.'})
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.is_lumi_org = True
        instance.modified_user = _audit_user(self)
        instance.save()
        return instance


class LumiOrganizationUserSerializer(serializers.ModelSerializer):
    # This endpoint also supports idempotent create by email, so do not attach
    # ModelSerializer's UniqueValidator to the field.
    email = serializers.EmailField(required=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        source='org',
        queryset=Organization.objects.filter(is_lumi_org=True, is_active=True),
    )
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(
        write_only=True, required=False, min_length=10,
    )
    lumi_role = serializers.ChoiceField(
        choices=LumiOrganizationUserRole.ROLE_CHOICES,
        write_only=True,
    )
    organization_name = serializers.CharField(
        source='org.name', read_only=True,
    )
    org = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'uuid', 'email', 'name', 'password', 'organization_id',
            'organization_name', 'org', 'lumi_role', 'is_active',
        )
        read_only_fields = ('id', 'uuid')

    def get_org(self, obj):
        return {'id': obj.org_id, 'name': obj.org.name}

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        email = attrs.get('email')
        if email and self.instance is not None and User.objects.filter(
                email__iexact=email).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError(
                {'email': 'A user with this email already exists.'})
        if (email and self.instance is None and attrs.get('password')
                and User.objects.filter(email__iexact=email).exists()):
            raise serializers.ValidationError({
                'password': "Use PATCH to change an existing user's password."
            })
        return attrs

    @staticmethod
    def _set_name(user, name):
        first_name, separator, last_name = name.strip().partition(' ')
        user.first_name = first_name
        user.last_name = last_name if separator else ''

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop('lumi_role')
        name = validated_data.pop('name')
        password = validated_data.pop('password', None)
        org = validated_data.pop('org')
        email = validated_data.pop('email')

        user = User.objects.filter(email__iexact=email).first()
        is_new_user = user is None

        if user is not None:
            belongs_to_lumi_org = (
                user.org_id
                and Organization.objects.filter(
                    pk=user.org_id,
                    is_lumi_org=True,
                ).exists()
            )

            if not belongs_to_lumi_org:
                raise serializers.ValidationError({
                    'email': 'This email belongs to an existing UnityOne user.'
                })

            if user.org_id != org.id:
                raise serializers.ValidationError({
                    'email': (
                        'This user belongs to a different Lumi Organisation. '
                        'Use an explicit update to move the user.'
                    )
                })

            if password:
                raise serializers.ValidationError({
                    'password': (
                        "Use PATCH to change an existing user's password."
                    )
                })
        else:
            if not password:
                raise serializers.ValidationError({
                    'password': (
                        'Password is required for a new UnityOne user.'
                    )
                })

            user = User(email=email, org=org)

        user.email = email
        user.org = org
        self._set_name(user, name)
        user.is_active = validated_data.get(
            'is_active', True if is_new_user else user.is_active)
        user.is_customer_admin = role == 'estate_owner'

        if password:
            try:
                user.set_password(password)
            except PasswordTooShort as exc:
                raise serializers.ValidationError({
                    'password': force_text(exc)
                })

        user.save()

        LumiOrganizationUserRole.objects.update_or_create(
            user=user,
            defaults={
                'organization': org,
                'role': role,
            },
        )

        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        current_role = LumiOrganizationUserRole.objects.filter(
            user=instance).first()
        role = validated_data.pop(
            'lumi_role', current_role.role if current_role else None)
        if role is None:
            raise serializers.ValidationError(
                {'lumi_role': 'This field is required.'})

        name = validated_data.pop('name', None)
        password = validated_data.pop('password', None)
        org = validated_data.pop('org', instance.org)
        instance.email = validated_data.pop('email', instance.email)
        instance.org = org
        if name is not None:
            self._set_name(instance, name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_customer_admin = role == 'estate_owner'
        if password:
            try:
                instance.set_password(password)
            except PasswordTooShort as exc:
                raise serializers.ValidationError({'password': force_text(exc)})
        instance.save()
        LumiOrganizationUserRole.objects.update_or_create(
            user=instance,
            defaults={'organization': org, 'role': role},
        )
        return instance

    def to_representation(self, instance):
        data = super(
            LumiOrganizationUserSerializer,
            self,
        ).to_representation(instance)

        role = LumiOrganizationUserRole.objects.filter(
            user=instance
        ).first()

        data['name'] = instance.get_full_name() or instance.email
        data['lumi_role'] = role.role if role else None
        return data
