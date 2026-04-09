# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db import models

from app.common.func import generate_uuid
from app.organization.models import Organization
from app.rbac.managers import (
    ModuleManager,
    RBACPermissionManager,
    RBACEntityGroupManager,
    RBACEntityObjectManager,
    RBACPermissionSetManager,
    RBACRoleManager,
    RBACUserGroupManager
)
from app.rbac.utils import RBACModelManager
from app.user2.models import User


class Module(models.Model):
    """
        Stores Unity Modules. Created from Management Command.
    """
    name = models.CharField(max_length=128, db_index=True)
    is_msp = models.BooleanField(default=False, db_index=True)
    objects = ModuleManager()

    class Meta:
        verbose_name = "RBAC Module"

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name


class RBACPermission(models.Model):
    """
        Stores Unity Module Access Permissions (view / manage / etc..). Created from Management Command.
    """
    name = models.CharField(max_length=128, db_index=True)
    module = models.ForeignKey(Module, blank=True, null=True, on_delete=models.CASCADE, related_name="rbac_permission_modules")
    objects = RBACPermissionManager()

    class Meta:
        verbose_name = "RBAC Permission"

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name


class RBACEntityGroup(models.Model):
    """
        Stores Model Groups for RBAC Objects.
    """
    ENTITY_SELECTION_CHOICES = (
        ("all", "All"),
        ("custom", "Custom")
    )
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    description = models.TextField(max_length=512, blank=True, null=True)
    content_types = models.ManyToManyField(ContentType, blank=True, related_name="rbac_object_group_content_types")
    entity_selection = models.CharField(max_length=16, choices=ENTITY_SELECTION_CHOICES, default="all", db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, blank=True, null=True, on_delete=models.SET_NULL, related_name="rbac_object_group_created_by"
    )
    customer = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="rbac_object_groups")
    objects = RBACEntityGroupManager()

    class Meta:
        verbose_name = "RBAC Entity Group"

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name

    @property
    def organization_id(self):
        return self.customer.id

    @property
    def org_name(self):
        return self.customer.name

    def add_content_types(self, module_models):
        content_types = []
        for module_model in module_models:
            model_content_type = ContentType.objects.get_for_id(module_model["content_type_id"])
            if model_content_type:
                content_types.append(model_content_type)
        self.content_types.set(content_types)

    def add_or_update_module_model_objects(self, model_objects):
        entity_object_ids = []
        for model_object in model_objects:
            model_content_type_id = model_object.get("content_type_id")
            object_id = model_object.get("id")
            if not model_content_type_id or not object_id:
                continue
            content_type = ContentType.objects.get_for_id(model_content_type_id)
            if content_type is None or content_type.model_class() not in RBACModelManager.rbac_models:
                continue
            entity_object_instance, created = RBACEntityObject.objects.update_or_create(
                object_id=object_id,
                group=self,
                content_type=content_type,
                defaults={}
            )
            entity_object_ids.append(entity_object_instance.id)
        entity_objects = self.rbac_model_group_objects.all().exclude(id__in=entity_object_ids)
        entity_objects.delete()

    def update_content_types(self, module_models):
        self.content_types.clear()
        self.add_content_types(module_models)


class RBACEntityObject(models.Model):
    """
        Stores Objects for which the permission needs to be applied for the Model Group.
    """
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(blank=True, null=True, db_index=True)
    model_object = GenericForeignKey("content_type", "object_id")
    group = models.ForeignKey(RBACEntityGroup, on_delete=models.CASCADE, related_name="rbac_model_group_objects")
    objects = RBACEntityObjectManager()

    class Meta:
        verbose_name = "RBAC Entity Object"

    def __repr__(self):
        return "{} - {}".format(self.group.name, getattr(self.model_object, "id", None))

    def __str__(self):
        return "{} - {}".format(self.group.name, getattr(self.model_object, "id", None))

    @property
    def organization_id(self):
        return self.group.organization_id

    @property
    def org_name(self):
        return self.group.org_name


class RBACPermissionSet(models.Model):
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    description = models.CharField(max_length=256, blank=True, null=True)
    rbac_permissions = models.ManyToManyField(RBACPermission, blank=True, related_name="rbac_permission_set_permissions")
    entity_groups = models.ManyToManyField(RBACEntityGroup, blank=True, related_name="rbac_permission_set_entity_groups")
    is_active = models.BooleanField(default=True, db_index=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, blank=True, null=True, on_delete=models.SET_NULL, related_name="permission_set_created_by"
    )
    customer = models.ForeignKey(Organization, blank=True, null=True, on_delete=models.CASCADE, related_name="rbac_permissions_sets")
    objects = RBACPermissionSetManager()

    class Meta:
        verbose_name = "RBAC Permission Set"

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name

    @property
    def organization_id(self):
        if self.customer:
            return self.customer.id
        return None

    def add_or_update_entity_groups(self, entity_groups_uuids):
        entity_groups = RBACEntityGroup.objects.filter(uuid__in=entity_groups_uuids)
        self.entity_groups.clear()
        self.entity_groups.set(entity_groups)

    def add_or_update_permissions(self, permission_ids):
        permissions = RBACPermission.objects.filter(id__in=permission_ids)
        self.rbac_permissions.clear()
        self.rbac_permissions.set(permissions)

    def get_roles_with_permission(self):
        return self.rbac_role_permissions.values("id", "uuid", "name").distinct()

    def get_users_with_permission(self, customer):
        return User.objects.filter(
            rbac_roles__permissions=self,
            org=customer
        ).distinct().values("id", "uuid", "email")

    def get_user_groups_with_permission(self, customer):
        return RBACUserGroup.objects.filter(
            rbac_roles__permissions=self,
            customer=customer
        ).distinct().values("id", "uuid", "name")


class RBACRole(models.Model):
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    description = models.CharField(max_length=256, blank=True, null=True)
    permissions = models.ManyToManyField(RBACPermissionSet, blank=True, related_name="rbac_role_permissions")
    is_active = models.BooleanField(default=True, db_index=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="rbac_role_created_by"
    )
    customer = models.ForeignKey(Organization, blank=True, null=True, on_delete=models.CASCADE, related_name="rbac_roles")
    objects = RBACRoleManager()

    class Meta:
        verbose_name = "RBAC Role"

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name

    @property
    def organization_id(self):
        if self.customer:
            return self.customer.id
        return None

    def add_or_update_permissions(self, permission_uuids):
        permissions = RBACPermissionSet.objects.filter(uuid__in=permission_uuids)
        self.permissions.clear()
        self.permissions.set(permissions)

    def add_users(self, user_emails):
        users = User.objects.filter(email__in=user_emails)
        self.user_rbac_roles.add(*users)

    def add_user_groups(self, group_uuids):
        user_groups = RBACUserGroup.objects.filter(uuid__in=group_uuids)
        self.rbac_user_group_roles.set(user_groups)
        for group in user_groups:
            for user in group.rbac_users.all():
                user.rbac_roles.add(self)

    def update_users(self, user_emails):
        current_user_ids = set(User.objects.filter(rbac_roles=self).values_list("id", flat=True))
        new_user_ids = set(User.objects.filter(email__in=user_emails).values_list("id", flat=True))
        to_remove = current_user_ids - new_user_ids
        to_add = new_user_ids - current_user_ids
        if to_remove:
            self.user_rbac_roles.remove(*User.objects.filter(id__in=to_remove))
        if to_add:
            self.user_rbac_roles.add(*User.objects.filter(id__in=to_add))

    def update_user_groups(self, group_uuids):
        current_user_groups = set(self.rbac_user_group_roles.all())
        new_user_groups = set(RBACUserGroup.objects.filter(uuid__in=group_uuids))
        for user_group in current_user_groups - new_user_groups:
            self.rbac_user_group_roles.remove(user_group)
            for user in user_group.rbac_users.all():
                user.rbac_roles.remove(self)
        for user_group in new_user_groups - current_user_groups:
            self.rbac_user_group_roles.add(user_group)
            for user in user_group.rbac_users.all():
                user.rbac_roles.add(self)

    def get_rbac_users_with_role(self, customer, user):
        filters = {"rbac_roles": self}
        if customer.organization_type == "DEMO":
            filters["id"] = user.id
        else:
            filters["org"] = customer
        return User.objects.filter(**filters).distinct().values_list("email", flat=True)

    def get_rbac_user_groups_with_role(self, customer):
        return RBACUserGroup.objects.filter(
            rbac_roles=self,
            customer=customer
        ).distinct().values("id", "uuid", "name")


class RBACUserGroup(models.Model):
    uuid = models.UUIDField(default=generate_uuid, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    description = models.CharField(max_length=256, blank=True, null=True)
    rbac_users = models.ManyToManyField(User, blank=True, related_name="rbac_user_group_users")
    rbac_roles = models.ManyToManyField("rbac.RBACRole", blank=True, related_name="rbac_user_group_roles")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="rbac_user_group_created_by"
    )
    customer = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="rbac_user_groups")
    objects = RBACUserGroupManager()

    class Meta:
        verbose_name = "RBAC User Group"

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name

    @property
    def organization_id(self):
        return self.customer.id

    def add_or_update_group_roles(self, role_uuids):
        roles = RBACRole.objects.filter(uuid__in=role_uuids)
        self.rbac_roles.clear()
        self.rbac_roles.set(roles)

    def update_users(self):
        users = User.objects.filter(
            org=self.customer,
            rbac_user_group_users__isnull=True
        )
        users.update(group_inclusion="none")

    def add_group_users(self, user_emails):
        users = User.objects.filter(email__in=user_emails)
        no_group_users = users.filter(group_inclusion="none")
        no_group_users.update(group_inclusion="include")
        self.rbac_users.set(users)

    def update_group_users(self, user_emails):
        self.rbac_users.clear()
        self.add_group_users(user_emails)
        self.update_users()

    def add_user_roles(self, role_uuids, user_emails):
        roles = RBACRole.objects.filter(uuid__in=role_uuids)
        users = User.objects.filter(email__in=user_emails)
        for user in users:
            user.rbac_roles.add(*roles)

    def update_user_roles(self, role_uuids, user_emails):
        new_roles = RBACRole.objects.filter(uuid__in=role_uuids)
        new_users = User.objects.filter(email__in=user_emails)
        new_role_uuids = set(role_uuids)
        existing_users = set(new_users.values_list("email", flat=True))
        for user in new_users:
            current_roles = set(user.rbac_roles.values_list("uuid", flat=True))
            roles_to_add = new_role_uuids - current_roles
            roles_to_remove = current_roles - new_role_uuids
            user.rbac_roles.add(*new_roles.filter(uuid__in=roles_to_add))
            user.rbac_roles.remove(*new_roles.filter(uuid__in=roles_to_remove))
        users_to_remove = User.objects.exclude(email__in=existing_users)
        for user in users_to_remove:
            user.rbac_roles.remove(*new_roles)

    def get_permission_sets_with_user_group(self, customer):
        return RBACPermissionSet.objects.filter(
            rbac_role_permissions__rbac_user_group_roles=self,
            customer=customer
        ).distinct().values("id", "uuid", "name")
