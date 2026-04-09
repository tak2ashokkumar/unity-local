# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#
# All Rights Reserved.

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.utils.crypto import get_random_string


class BaseULDBUserManager(models.Manager):
    @classmethod
    def normalize_email(cls, email):
        """
        Normalize the address by lowercasing the domain part of the email
        address.
        """
        email = email or ''
        try:
            email_name, domain_part = email.strip().rsplit('@', 1)
        except ValueError:
            pass
        else:
            email = '@'.join([email_name, domain_part.lower()])
        return email

    def make_random_password(self, length=10,
                             allowed_chars='abcdefghjkmnpqrstuvwxyz'
                                           'ABCDEFGHJKLMNPQRSTUVWXYZ'
                                           '23456789'):
        """
        Generates a random password with the given length and given
        allowed_chars. Note that the default value of allowed_chars does not
        have "I" or "O" or letters and digits that look similar -- just to
        avoid confusion.
        """
        return get_random_string(length, allowed_chars)

    def get_by_natural_key(self, username):
        return self.get(**{self.model.USERNAME_FIELD: username})


class ULDBUserManager(BaseULDBUserManager):
    def _create_user(self, user_id, password, org_id, **extra_fields):
        """
        Creates and saves a User with the given username, email and password.
        """
        now = timezone.now()
        if not user_id:
            raise ValueError('The given user Id must be set')
        email = self.normalize_email(user_id)
        user = self.model(
            user_id=user_id,
            org_id=org_id,
            is_active=True,
            last_login=now,
            **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, user_id, password, org_id, **extra_fields):
        return self._create_user(user_id, password, org_id, **extra_fields)

    def create_superuser(self, user_id, password, org_id, **extra_fields):
        return self._create_user(user_id, password, org_id, **extra_fields)


class ULDBPermissionManager(models.Manager):
    """
    Manager class which supports get_by_natural_key().
    """

    def get_by_natural_key(self, name, app_label, model):
        return self.get(
            name=name,
            content_type=ContentType.objects.get_by_natural_key(app_label,
                                                                model)
        )
