# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#
# All Rights Reserved.

from __future__ import absolute_import
from __future__ import unicode_literals

import os
import logging
import random
import json

from datetime import timedelta, datetime
from channels import Group
from collections import OrderedDict

from django.utils import timezone
from django.contrib.auth.models import update_last_login
from django.contrib.auth.hashers import *
from django.utils.encoding import python_2_unicode_compatible
from django.core.mail import send_mail
from django.core.validators import validate_comma_separated_integer_list
from django.conf import settings
from os.path import join as pjoin
from django.contrib.postgres.fields import JSONField, ArrayField
from django.core.validators import RegexValidator

from integ.ldap_user.models import LDAPConfig
from integ.salesforce.models import SalesforceMixin
from integ.salesforce.sftools import casesafeid
from app.common.models import *
from app.Utils.utility import generate_uuid
from .manager import *
# from .signals import user_logged_in
from django.contrib.auth.signals import user_logged_in, user_logged_out

logger = logging.getLogger(__name__)  # logger from settings.py

from django.contrib import auth
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import (
    AbstractBaseUser,
    AbstractUser,
    BaseUserManager,
    Permission,
    _user_get_all_permissions,
    _user_has_module_perms,
    _user_has_perm
)
from django.http import HttpResponse

MIN_PASSWORD_LENGTH = 8


class PasswordTooShort(RuntimeError):
    """
    Thrown if the password length is less than the required
    length.
    """


def _update_last_login(sender, request, user, **kwargs):
    """
    A signal receiver which updates the last_login date for
    the user logging in.
    """
    from libraries.auditlog.models import LogEntry
    User.objects.filter(id=user.id).update(
        last_login=timezone.now()
    )

    changes = {
        'last_login': [timezone.now().strftime('%Y-%m-%d %H:%M:%S'), 0]
    }

    LogEntry.objects.log_create(
        user,
        remote_addr=request.META.get('REMOTE_ADDR'),
        action=LogEntry.Action.LOGIN,
        changes=json.dumps(changes),
    )


def set_proxy_cookie(sender, request, user, **kwargs):
    cookie_path = getattr(settings, 'PROXY_COOKIE_PATH', None)
    if cookie_path:
        _session_key = request.session._session_key
        logger.debug("Session Cookie : {}".format(_session_key))
        if _session_key:
            cookie_file = pjoin(cookie_path, request.session._session_key)
            open(cookie_file, "w")


def remove_proxy_cookie(sender, request, user, **kwargs):
    cookie_path = getattr(settings, 'PROXY_COOKIE_PATH', None)
    if cookie_path:
        cookie_file = pjoin(cookie_path, request.session._session_key)
        if os.path.exists(cookie_file):
            os.remove(cookie_file)


user_logged_in.disconnect(update_last_login)
user_logged_in.connect(_update_last_login)

user_logged_in.connect(set_proxy_cookie)
user_logged_out.connect(remove_proxy_cookie)


@python_2_unicode_compatible
class AccessType(models.Model):
    """
    Serves as a global role of sorts.  This is for access types such as:

        Billing
        Notifications
        Portal Access
        (etc.)
    """
    name = models.CharField(_('name'), max_length=80, unique=True)
    description = models.CharField(_('description'), max_length=512, null=True, blank=True)

    def __str__(self):
        return self.name

    def __repr__(self):
        return u'%s' % self.name


@python_2_unicode_compatible
class Role(models.Model):
    """
    Container model for permissions.  A role contains many permissions.  Permissions are not
    exclusive to a single role, however, necessitating the use of a ManyToMany relationship.
    """
    uuid = models.UUIDField(verbose_name='UUID', default=generate_uuid)
    name = models.CharField(_('name'), max_length=80, unique=True)
    permissions = models.ManyToManyField(Permission,
                                         verbose_name=_('permissions'),
                                         blank=True,
                                         related_name="roles",
                                         related_query_name="role")
    role_type = models.CharField(max_length=10, default='Tenant')

    class Meta:
        verbose_name = _('role')
        verbose_name_plural = _('roles')

    def __str__(self):
        return self.name

    def __repr__(self):
        return u'%s' % self.name

    def natural_key(self):
        return (self.name,)


class OrganizationGroupManager(models.Manager):
    """
    The manager for the auth's Group model.
    """
    use_in_migrations = True

    def get_by_natural_key(self, organization, name):
        return self.get(organization=organization, name=name)


@python_2_unicode_compatible
class OrganizationGroup(models.Model):
    """
    Re-write of django.contrib.auth's Group to use Roles instead of Permissions.

    Named group for simplicity.
    """
    name = models.CharField(_('name'), max_length=80)
    organization = models.ForeignKey('organization.Organization',
                                     on_delete=models.CASCADE,
                                     related_name='org_groups')
    roles = models.ManyToManyField(Role, verbose_name=_('roles'), blank=True)
    uuid = models.UUIDField(null=True, blank=True, verbose_name='UUID', default=generate_uuid)

    objects = OrganizationGroupManager()

    class Meta:
        verbose_name = _('group')
        verbose_name_plural = _('groups')
        unique_together = (('organization', 'name'),)

    def __str__(self):
        return self.name

    def __repr__(self):
        return u'%s' % self.name

    def natural_key(self):
        return (self.organization, self.name)


class UserCarrierList(models.Model):
    """ Carrier List Table """
    carrier_name = models.CharField(max_length=256)
    sms_list = ArrayField(models.CharField(max_length=255, blank=True, null=True))

    def __repr__(self):
        return u'%s' % self.carrier_name

    class Meta:
        db_table = 'usercarrierlist'

    def __unicode__(self):
        return self.carrier_name


class RBACMixin(models.Model):
    """
    Sort of like PermissionsMixin from django.contrib.auth, but uses Roles instead of Permissions.
    """
    is_superuser = models.BooleanField(_('superuser status'), default=False,
                                       help_text=_('Designates that this user has all permissions without '
                                                   'explicitly assigning them.'))
    groups = models.ManyToManyField(OrganizationGroup, verbose_name=_('groups'),
                                    blank=True, help_text=_('The groups this user belongs to. A user will '
                                                            'get all permissions granted to each of '
                                                            'their groups.'),
                                    related_name="users", related_query_name="user")
    user_roles = models.ManyToManyField(Role,
                                        verbose_name=_('user permissions'), blank=True,
                                        help_text=_('Specific permissions for this user.'),
                                        related_name="users", related_query_name="user")

    class Meta:
        abstract = True

    def get_group_permissions(self, obj=None):
        """
        Returns a list of permission strings that this user has through their
        groups. This method queries all available auth backends. If an object
        is passed in, only permissions matching this object are returned.
        """
        permissions = set()
        for backend in auth.get_backends():
            if hasattr(backend, "get_group_permissions"):
                permissions.update(backend.get_group_permissions(self, obj))
        return permissions

    def get_all_permissions(self, obj=None):
        return _user_get_all_permissions(self, obj)

    def has_perm(self, perm, obj=None):
        """
        Returns True if the user has the specified permission. This method
        queries all available auth backends, but returns immediately if any
        backend returns True. Thus, a user who has permission from a single
        auth backend is assumed to have permission in general. If an object is
        provided, permissions for this specific object are checked.
        """

        # Active superusers have all permissions.
        if self.is_active and self.is_superuser:
            return True

        # Otherwise we need to check the backends.
        return _user_has_perm(self, perm, obj)

    def has_perms(self, perm_list, obj=None):
        """
        Returns True if the user has each of the specified permissions. If
        object is passed, it checks if the user has all required perms for this
        object.
        """
        for perm in perm_list:
            if not self.has_perm(perm, obj):
                return False
        return True

    def has_module_perms(self, app_label):
        """
        Returns True if the user has any permissions in the given app label.
        Uses pretty much the same logic as has_perm, above.
        """
        # Active superusers have all permissions.
        if self.is_active and self.is_superuser:
            return True

        return _user_has_module_perms(self, app_label)


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password,
                     is_staff, is_superuser, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        now = timezone.now()
        if not email:
            raise ValueError('An email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email,
                          is_staff=is_staff, is_active=True,
                          is_superuser=is_superuser,
                          date_joined=now, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username=None, email=None, password=None, **extra_fields):
        return self._create_user(email, password, False, False,
                                 **extra_fields)

    def create_superuser(self, username, email, password, **extra_fields):
        return self._create_user(email, password, True, True,
                                 **extra_fields)

    def active(self):
        return self.filter(is_active=True)


class CustomUser(AbstractBaseUser):
    """
    This model class reproduces much of the AbstractUser from django.contrib.auth.
    This is mostly with the intention of extending the class to support role-based
    permissions.
    """
    #  Boilerplate from AbstractUser
    first_name = models.CharField(_('first name'), max_length=100, blank=True)
    last_name = models.CharField(_('last name'), max_length=100, blank=True)
    is_staff = models.BooleanField(_('staff status'), default=False,
                                   help_text=_('Designates whether the user can log into this admin '
                                               'site.'))
    is_customer_admin = models.BooleanField(_('customer admin role'), default=False,
                                            help_text=_('This defines special customer privileges'))
    is_active = models.BooleanField(_('active'), default=True,
                                    help_text=_('Designates whether this user should be treated as '
                                                'active. Unselect this instead of deleting accounts.'))
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    objects = CustomUserManager()

    timezone = models.CharField(_('timezone'), max_length=30, blank=True, default='US/Pacific')
    is_terminated = models.BooleanField(_('terminated'), default=False)
    phone_regex = RegexValidator(regex=r'^(\d{10})$',
                                 message="Phone number must be of 10 digits.")
    phone_number = models.CharField(validators=[phone_regex],
                                    max_length=10, blank=True, null=True)
    user_type = models.CharField(max_length=10, default="Tenant")

    class Meta:
        abstract = True

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """
        Returns the short name for the user.
        """
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """
        Sends an email to this User.
        """
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def diff_password(self, raw_password):
        # Run the default password hasher once to reduce the timing
        # difference between an existing and a non-existing user (#20760).
        self.password = make_password(raw_password)

    def set_password(self, raw_password):
        min = getattr(settings, 'MIN_PASSWORD_LENGTH', MIN_PASSWORD_LENGTH)
        if len(raw_password) < min:
            raise PasswordTooShort(_("Password must be at least %s characters long." % min))
        self.password = make_password(raw_password)


class User(CustomUser, RBACMixin, SalesforceMixin):
    """
    User model class for the ULDB application.  This class will use the User's
    email address as the identifying field, rather than the "username" (not present).

    Gets "groups" from RBACMixin.
    """
    email = models.EmailField(_("email address"), unique=True)
    org = models.ForeignKey("organization.Organization",
                            related_name="users")
    access_types = models.ManyToManyField(AccessType,
                                          related_name="users")
    salesforce_id = models.CharField(max_length=128, blank=True, null=True)
    uuid = models.UUIDField(null=True, blank=True, verbose_name="UUID", default=generate_uuid)
    welcome_page = models.BooleanField(default=True)

    ticket_group = models.CharField(validators=[validate_comma_separated_integer_list], max_length=200, null=True)

    # agreement_email_sent = models.BooleanField(default=False)
    eula_version = models.FloatField(default=0)

    trial_account = models.BooleanField(default=False)
    trial_account_end_date = models.DateTimeField(null=True)
    carrier = models.ForeignKey(UserCarrierList, related_name="users", null=True, blank=True)
    azure_id = models.CharField(max_length=128, blank=True, null=True)
    group_inclusion = models.CharField(max_length=128, blank=True, null=True)
    rbac_roles = models.ManyToManyField("rbac.RBACRole", blank=True, related_name="user_rbac_roles")
    ldap_user_id = models.CharField(max_length=128, blank=True, null=True)
    ldap_account = models.ForeignKey(LDAPConfig, null=True, blank=True)
    default_dashboard = models.ForeignKey('custom_widget.Dashboard', on_delete=models.SET_NULL, null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["org"]

    def __repr__(self):
        return u"%s" % self.email

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        # swappable = "AUTH_USER_MODEL"

    def save(self, *args, **kwargs):
        if not self.salesforce_id:
            self.salesforce_id = None
        else:
            self.salesforce_id = casesafeid(self.salesforce_id)
        super(User, self).save(*args, **kwargs)

    @property
    def is_uladmin(self):
        """
        Returns true if part of the privileged organization, defined in
        settings.py.
        """
        admin_org_name = getattr(settings, "ADMIN_ORGANIZATION", None)
        if admin_org_name is not None:
            return self.org.name == admin_org_name
        if self.org.msp_client:
            return True
        return False

    @property
    def is_ldap_user(self):
        if self.ldap_account and self.ldap_user_id:
            return True
        return False

    @property
    def is_mtp_user(self):
        """
        Returns true if part of the MTP organization.
        """
        return self.org.msp_client

    @property
    def organization_id(self):
        return self.org.id

    def get_available_groups(self):
        # pylint: disable=
        return self.org.org_groups

    def get_permission_sets(self):
        from app.rbac.models import RBACPermissionSet
        active_rbac_roles = self.rbac_roles.filter(is_active=True)
        rbac_permission_sets = RBACPermissionSet.objects.filter(
            rbac_role_permissions__in=active_rbac_roles,
            is_active=True
        ).distinct().order_by("name").values("id", "uuid", "name")
        return rbac_permission_sets

    def get_module_permissions(self):
        from app.rbac.models import RBACPermission, RBACPermissionSet
        active_rbac_roles = self.rbac_roles.filter(is_active=True)
        rbac_permission_sets = RBACPermissionSet.objects.filter(
            rbac_role_permissions__in=active_rbac_roles,
            is_active=True
        ).distinct().order_by("name")
        permissions = RBACPermission.objects.filter(
            rbac_permission_set_permissions__in=rbac_permission_sets,
            module__is_msp=False,
        ).order_by("name").values_list("module__name", "name").distinct()
        module_permissions = OrderedDict()
        for module_name, perm_name in permissions:
            module_permissions.setdefault(module_name, []).append(perm_name)
        return [
            {"module_name": module, "permission_names": sorted(names)}
            for module, names in sorted(module_permissions.items(), key=lambda x: x[0])
        ]

    def get_rbac_user_groups(self):
        from app.rbac.models import RBACUserGroup
        user_groups = RBACUserGroup.objects.filter(rbac_users=self, is_active=True).order_by("name").values("id", "uuid", "name")
        return user_groups


def set_default_password():
    raise NotImplementedError()


class ULDBUserInvitationManager(models.Manager):
    def expire_old(self):
        now = timezone.now()
        self.get_queryset().filter(expires_at__lt=now).update(pending=False)


class ULDBUserInvitation(TimestampedModel):
    """
    Relationship between the one-time-use invitation token and User object.

    Used to validate the token sent in an invitation URL.
    """
    # fields
    token = models.CharField(max_length=128)
    pending = models.BooleanField(default=True)
    expires_at = models.DateTimeField()

    # relationships
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='invitations')

    objects = ULDBUserInvitationManager()

    def __unicode__(self):
        return self.user.email

    def __repr__(self):
        return u'%s' % self.user.email

    def save(self, *args, **kwargs):
        r = random.SystemRandom()
        self.token = format(r.getrandbits(256), 'x')
        self.expires_at = timezone.now() + timedelta(days=7)
        super(ULDBUserInvitation, self).save(*args, **kwargs)


class DemoTrialRequestToken(TimestampedModel):
    """
    Relationship between the one-time-use invitation token and User object.

    Used to validate the token sent in an invitation URL.
    """
    # fields
    token = models.CharField(max_length=128)
    pending = models.BooleanField(default=True)
    expires_at = models.DateTimeField()

    # relationships
    ACCOUNT_TYPE = (
        ('DEMO', 'DEMO'),
        ('TRIAL', 'TRIAL')
    )
    account_type = models.CharField(
        max_length=64,
        choices=ACCOUNT_TYPE,
        default="DEMO",
    )
    requestor_email = models.EmailField()
    user_data = JSONField()

    objects = ULDBUserInvitationManager()

    def __unicode__(self):
        return self.token

    def __repr__(self):
        return u'%s' % self.token

    def save(self, expiration_days=7, *args, **kwargs):
        r = random.SystemRandom()
        self.token = format(r.getrandbits(256), 'x')
        self.expires_at = timezone.now() + timedelta(days=expiration_days)
        super(DemoTrialRequestToken, self).save(*args, **kwargs)


class AccessList(models.Model):
    """ Access List Table """
    access_type = models.CharField(max_length=128)
    description = models.CharField(max_length=256)

    def __repr__(self):
        return u'%s' % self.access_type

    class Meta:
        db_table = 'accesslist'

    def __unicode__(self):
        return self.access_type
