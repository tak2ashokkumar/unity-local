# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from app.rbac.utils import RBACModelManager


class RBACQuerySetMixin(models.QuerySet):
    """
        This Queryset Mixin is used for getting the objects allowed for the request user.
    """
    def for_user(self, user):
        if not user or not user.is_authenticated:  # User is not authenticated so no access is granted
            return self.none()
        model = self.model
        if model not in RBACModelManager.rbac_models:  # Access Granted for all Model Objects since it is not tracked
            return self.all()
        content_type = model.get_content_type()
        modules = RBACModelManager.model_module_map[model]
        groups_qs = user.rbac_roles.all_active().filter(
            permissions__rbac_permissions__module__name__in=modules,
            permissions__entity_groups__content_types=content_type
        ).distinct()
        if not groups_qs.exists():  # User has no group so full access is granted
            return self.all()
        all_selection_groups_qs = groups_qs.filter(
            permissions__entity_groups__entity_selection="all"
        )
        if all_selection_groups_qs.exists():  # Access Granted for all Model Objects
            return self.all()
        allowed_ids = groups_qs.filter(
            permissions__entity_groups__rbac_model_group_objects__content_type=content_type
        ).values_list(
            "permissions__entity_groups__rbac_model_group_objects__object_id",
            flat=True
        ).distinct()
        return self.filter(pk__in=allowed_ids)


class RBACManager(models.Manager):

    def get_queryset(self):
        return RBACQuerySetMixin(self.model, using=self._db)

    def for_user(self, user):
        return self.get_queryset().for_user(user)


class ModuleManager(models.Manager):

    def msp_modules(self):
        return self.filter(is_msp=True)

    def stp_modules(self):
        return self.filter(is_msp=False)


class RBACPermissionManager(models.Manager):

    def msp_permissions(self):
        return self.filter(module__is_msp=True)

    def stp_permissions(self):
        return self.filter(module__is_msp=False)


class RBACEntityGroupManager(models.Manager):

    def active(self):
        return self.filter(is_active=True)

    def not_active(self):
        return self.filter(is_active=False)


class RBACEntityObjectManager(models.Manager):

    def active(self):
        return self.filter(group__is_active=True)

    def not_active(self):
        return self.filter(group__is_active=False)


class RBACPermissionSetManager(models.Manager):

    def active(self):
        return self.filter(is_active=True)

    def default(self):
        return self.filter(is_default=True)

    def not_active(self):
        return self.filter(is_active=False)

    def not_default(self):
        return self.filter(is_default=False)


class RBACRoleManager(models.Manager):

    def active(self):
        return self.filter(is_active=True)

    def all_active(self):
        return self.filter(
            is_active=True,
            permissions__is_active=True,
            permissions__entity_groups__is_active=True
        )

    def all_not_active(self):
        return self.filter(
            is_active=False,
            permissions__is_active=False,
            permissions__entity_groups__is_active=False
        )

    def default(self):
        return self.filter(is_default=True)

    def not_active(self):
        return self.filter(is_active=False)

    def not_default(self):
        return self.filter(is_default=False)


class RBACUserGroupManager(models.Manager):

    def active(self):
        return self.filter(is_active=True)

    def not_active(self):
        return self.filter(is_active=False)
