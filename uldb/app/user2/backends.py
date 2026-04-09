from __future__ import unicode_literals

from django.contrib.auth import authenticate, get_user_model, backends

import logging
import itertools

import app.session

from app.session.models import ULUserSession
from .models import *

logger = logging.getLogger(__name__)  # logger from settings.py


class RoleModelBackend(backends.ModelBackend):
    """
    Extension to ModelBackend which supports roles instead of direct permissions.

    Overrides:
        _get_user_permissions
        _get_group_permissions

    """

    def _get_user_permissions(self, user_obj):
        perms = set()
        for role in user_obj.user_roles:
            perms.update(role.permissions.all())
        return perms

    def _get_group_permissions(self, user_obj):
        perms = set()
        for group in user_obj.groups:
            for role in group.roles:
                perms.update(role.permissions.all())
        return perms


class ULAuthenticationBackend(object):
    """
    Authenticates against settings.AUTH_USER_MODEL.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        try:
            user = UserModel._default_manager.get_by_natural_key(username)
            if user.check_password(password):
                logger.info('User %s logged in.' % username)
                return user
            else:
                logger.error('User %s failed to authenticate.' % username)
                return None
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a non-existing user (#20760).
            UserModel().diff_password(password)

    def _get_user_session(self, user_obj):
        """
        Returns a user session for the specified user.
        """
        # @formatter:off
        if (hasattr(user_obj, '_user_session') and
                isinstance(user_obj._user_session, app.session.models.ULUserSession) and
                user_obj._user_session.user == user_obj):
            # the session belongs to request.user
            return user_obj._user_session
        # @formatter:on
        else:
            user_session, created = ULUserSession.objects.get_or_create(
                user=user_obj, backend_session=True)
            if created:
                logger.debug(
                    "Created User backend session for user %s." %
                    user_obj.id)
            logger.info(
                "Using User backend session for user %s." %
                user_obj.id)
            return user_session

    def get_all_permissions(self, user_obj, perm=None, obj=None):

        if user_obj.is_anonymous() or obj is not None:
            return set()

        if not hasattr(user_obj, '_perm_cache'):
            logger.debug('Building permission cache for user %s' % user_obj.pk)
            # session = self._get_user_session(user_obj)
            if user_obj.is_superuser:
                perms = user_obj.user_roles.all()
            else:
                perms = user_obj.user_roles.select_related(
                    'ULDBUserRolePermissions'
                ).values_list(
                    'id',
                    'name',
                    'permissions',
                )
            # perms = Permission.objects.filter(user=user_obj.pk).select_related(
            #     'ULDBUserRolePermissions'
            # ).values_list(
            #     'permission__id',
            #     'permission__name',
            #     'permission__content_type_id__model',
            # )
            user_obj._perm_cache = set(
                itertools.imap(
                    lambda x: '%s.%s' %
                              (x[1], x[2]), perms))
        else:
            logger.debug('Using permission cache for user %s' % user_obj.pk)
        return user_obj._perm_cache

    def has_perm(self, user_obj, perm, obj=None):
        logger.info('check user permission')
        if not user_obj.is_active:
            return False
        per = perm.split('.')
        permission = perm in self.get_all_permissions(user_obj, perm, obj)
        if permission:
            logger.info(
                'User %s has access to %s %s' %
                (user_obj.pk, per[0], per[1]))
        else:
            logger.error(
                'User %s doesn\'t have to %s %s' %
                (user_obj.pk, per[0], per[1]))
        return permission

    #        return perm in self.get_all_permissions(user_obj, perm, obj)

    def has_module_perms(self, user_obj, app_label):
        """
        Returns True if user_obj has any permissions in the given app_label.
        """
        if not user_obj.is_active:
            return False
        for perm in self.get_all_permissions(user_obj):
            if perm[:perm.index('.')] == app_label:
                return True
        return False

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel._default_manager.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None


class ULRemoteUserAuthenticationBackend(ULAuthenticationBackend):
    """
    This backend is to be used in conjunction with the ``RemoteUserMiddleware``
    found in the middleware module of this package, and is used when the server
    is handling authentication outside of Django.

    By default, the ``authenticate`` method creates ``User`` objects for
    usernames that don't already exist in the database.  Subclasses can disable
    this behavior by setting the ``create_unknown_user`` attribute to
    ``False``.
    """

    # Create a User object if not already in the database?
    create_unknown_user = True

    def authenticate(self, remote_user):
        """
        The username passed as ``remote_user`` is considered trusted.  This
        method simply returns the ``User`` object with the given username,
        creating a new ``User`` object if ``create_unknown_user`` is ``True``.

        Returns None if ``create_unknown_user`` is ``False`` and a ``User``
        object with the given username is not found in the database.
        """
        if not remote_user:
            return
        user = None
        username = self.clean_username(remote_user)

        UserModel = get_user_model()

        # Note that this could be accomplished in one try-except clause, but
        # instead we use get_or_create when creating unknown users since it has
        # built-in safeguards for multiple threads.
        if self.create_unknown_user:
            user, created = UserModel.objects.get_or_create(**{
                UserModel.USERNAME_FIELD: username
            })
            if created:
                user = self.configure_user(user)
        else:
            try:
                user = UserModel.objects.get_by_natural_key(username)
            except UserModel.DoesNotExist:
                pass
        return user

    def clean_username(self, username):
        """
        Performs any cleaning on the "username" prior to using it to get or
        create the user object.  Returns the cleaned username.

        By default, returns the username unchanged.
        """
        return username

    def configure_user(self, user):
        """
        Configures a user after creation and returns the updated user.

        By default, returns the user unmodified.
        """
        return user
