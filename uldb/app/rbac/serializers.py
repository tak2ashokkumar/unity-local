from collections import OrderedDict

from django.db.models import Q
from rest_framework import serializers

from app.rbac.models import (
    Module,
    RBACPermission,
    RBACEntityGroup,
    RBACEntityObject,
    RBACPermissionSet,
    RBACRole,
    RBACUserGroup,
)
from app.rbac.utils import RBACModelManager


class ModuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Module
        fields = (
            "id",
            "name",
            "is_msp"
        )

    def __init__(self, *args, **kwargs):
        super(ModuleSerializer, self).__init__(*args, **kwargs)
        self.request = self.context["request"]
        self.customer = self.context["customer"]


class RBACPermissionSerializer(serializers.ModelSerializer):
    module = serializers.SerializerMethodField()

    class Meta:
        model = RBACPermission
        fields = (
            "id",
            "name",
            "module"
        )

    def __init__(self, *args, **kwargs):
        super(RBACPermissionSerializer, self).__init__(*args, **kwargs)
        self.request = self.context.get("request")
        self.customer = self.context.get("customer")

    def get_module(self, instance):
        module = instance.module
        if module:
            return OrderedDict([
                ("id", module.id),
                ("name", module.name),
                ("is_msp", module.is_msp)
            ])
        return None


class RBACEntityGroupSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    group_objects = serializers.SerializerMethodField()
    module_models = serializers.SerializerMethodField()

    class Meta:
        model = RBACEntityGroup
        fields = (
            "id",
            "uuid",
            "name",
            "description",
            "module_models",
            "entity_selection",
            "is_active",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "group_objects"
        )

    def __init__(self, *args, **kwargs):
        super(RBACEntityGroupSerializer, self).__init__(*args, **kwargs)
        self.request = self.context["request"]
        self.customer = self.context["customer"]

    def get_created_by_name(self, instance):
        if instance.created_by:
            return instance.created_by.get_full_name()
        return None

    def get_group_objects(self, instance):
        if instance.entity_selection.lower() == "custom":
            group_objects = []
            entity_objects = instance.rbac_model_group_objects.all()
            for entity_object in entity_objects:
                if not entity_object.model_object:
                    continue
                model_object_dict = OrderedDict([
                    ("id", entity_object.model_object.id),
                    ("uuid", entity_object.model_object.uuid),
                    ("name", entity_object.model_object.name),
                    ("entity", entity_object.model_object._meta.model._meta.verbose_name),
                    ("content_type_id", entity_object.content_type.id)
                ])
                group_objects.append(model_object_dict)
            return group_objects
        return None

    def get_module_models(self, instance):
        modules_model_data = []
        for ct in instance.content_types.all():
            if ct.model_class() is None or ct.model_class() not in RBACModelManager.rbac_models:
                continue
            modules_model_data.append(OrderedDict([
                ("content_type_id", ct.id),
                ("name", ct.model_class()._meta.verbose_name),
                ("app_label", ct.app_label),
                ("model", ct.model)
            ]))
        return modules_model_data

    def validate(self, data):
        name = data.get("name")
        instance_id = self.instance.id if self.instance else None
        if RBACEntityGroup.objects.filter(name=name, customer=self.customer).exclude(id=instance_id).exists():
            raise serializers.ValidationError({"name": "Group Name Already Exists."})
        return data

    def save(self, *args, **kwargs):
        return super(RBACEntityGroupSerializer, self).save(
            customer=self.customer,
            created_by=self.request.user,
            *args,
            **kwargs
        )


class RBACEntityGroupFastSerializer(serializers.ModelSerializer):

    class Meta:
        model = RBACEntityGroup
        fields = (
            "id",
            "uuid",
            "name",
            "is_active"
        )

    def __init__(self, *args, **kwargs):
        super(RBACEntityGroupFastSerializer, self).__init__(*args, **kwargs)
        self.request = self.context["request"]
        self.customer = self.context["customer"]


class RBACEntityObjectSerializer(serializers.ModelSerializer):
    entity = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    object_uuid = serializers.SerializerMethodField()

    class Meta:
        model = RBACEntityObject
        fields = (
            "id",
            "entity",
            "group",
            "name",
            "object_uuid"
        )

    def __init__(self, *args, **kwargs):
        super(RBACEntityObjectSerializer, self).__init__(*args, **kwargs)
        self.request = self.context.get("request")
        self.customer = self.context.get("customer")

    def get_entity(self, instance):
        return instance.model_object._meta.model._meta.verbose_name if instance.model_object else None

    def get_group(self, instance):
        return instance.group.uuid if instance.group else None

    def get_name(self, instance):
        return instance.model_object.name if instance.model_object else None

    def get_object_uuid(self, instance):
        return instance.model_object.uuid if instance.model_object else None


class RBACPermissionSetSerializer(serializers.ModelSerializer):
    active_entity_groups = serializers.SerializerMethodField()
    applicable_entity_groups = serializers.SerializerMethodField()
    applicable_roles = serializers.SerializerMethodField()
    applicable_user_groups = serializers.SerializerMethodField()
    applicable_users = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    entity_groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    rbac_permissions = serializers.SerializerMethodField()

    class Meta:
        model = RBACPermissionSet
        fields = (
            "id",
            "uuid",
            "name",
            "description",
            "entity_groups",
            "permissions",
            "rbac_permissions",
            "active_entity_groups",
            "applicable_entity_groups",
            "applicable_roles",
            "applicable_user_groups",
            "applicable_users",
            "is_active",
            "is_default",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name"
        )

    def __init__(self, *args, **kwargs):
        super(RBACPermissionSetSerializer, self).__init__(*args, **kwargs)
        self.request = self.context["request"]
        self.customer = self.context["customer"]

    def get_active_entity_groups(self, instance):
        return instance.entity_groups.active().values("id", "uuid", "name")

    def get_applicable_entity_groups(self, instance):
        return instance.entity_groups.all().values("id", "uuid", "name")

    def get_applicable_roles(self, instance):
        return instance.get_roles_with_permission()

    def get_applicable_user_groups(self, instance):
        return instance.get_user_groups_with_permission(self.customer)

    def get_applicable_users(self, instance):
        return instance.get_users_with_permission(self.customer)

    def get_created_by_name(self, instance):
        if instance.created_by:
            return instance.created_by.get_full_name()
        return "Unity"

    def get_entity_groups(self, instance):
        return instance.entity_groups.all().values_list("uuid", flat=True)

    def get_permissions(self, instance):
        return instance.rbac_permissions.all().values("id", "name", "module", "module__name")

    def get_rbac_permissions(self, instance):
        permissions = instance.rbac_permissions.all().values("id", "name", "module__name")
        result = OrderedDict()
        for permission in permissions:
            module_name = permission["module__name"]
            if module_name not in result:
                result[module_name] = []
            result[module_name].append(permission["name"])
        return [{"module_name": module, "permission_names": names} for module, names in result.items()]

    def add_or_update_permissions(self, instance, permission_data):
        permissions = []
        for module_data in permission_data:
            module_name = module_data["module_name"]
            permission_names = module_data["permission_names"]
            permission_qs = RBACPermission.objects.filter(
                name__in=permission_names,
                module__name=module_name
            )
            if not permission_qs.exists():
                continue
            permissions.extend(permission_qs)
        instance.rbac_permissions.set(permissions)

    def validate(self, data):
        name = data.get("name")
        instance_id = self.instance.id if self.instance else None
        if RBACPermissionSet.objects.filter(name=name, customer=self.customer).exclude(id=instance_id).exists():
            raise serializers.ValidationError({"name": "Permission Set Name Already Exists."})
        return data

    def save(self, *args, **kwargs):
        return super(RBACPermissionSetSerializer, self).save(
            customer=self.customer,
            created_by=self.request.user,
            *args,
            **kwargs
        )


class RBACRoleSerializer(serializers.ModelSerializer):
    active_permissions = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    applicable_permissions = serializers.SerializerMethodField()
    user_groups = serializers.SerializerMethodField()
    applicable_user_groups = serializers.SerializerMethodField()
    users = serializers.SerializerMethodField()

    class Meta:
        model = RBACRole
        fields = (
            "id",
            "uuid",
            "name",
            "description",
            "permissions",
            "applicable_permissions",
            "active_permissions",
            "user_groups",
            "applicable_user_groups",
            "users",
            "is_active",
            "is_default",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name"
        )

    def __init__(self, *args, **kwargs):
        super(RBACRoleSerializer, self).__init__(*args, **kwargs)
        self.request = self.context["request"]
        self.customer = self.context["customer"]

    def get_active_permissions(self, instance):
        return instance.permissions.active().values("id", "uuid", "name")

    def get_created_by_name(self, instance):
        if instance.created_by:
            return instance.created_by.get_full_name()
        return "Unity"

    def get_permissions(self, instance):
        return instance.permissions.all().values_list("uuid", flat=True)

    def get_applicable_permissions(self, instance):
        return instance.permissions.all().values("id", "uuid", "name")

    def get_user_groups(self, instance):
        return RBACUserGroup.objects.filter(
            rbac_roles=instance,
            customer=self.customer
        ).distinct().values_list("uuid", flat=True)

    def get_applicable_user_groups(self, instance):
        return instance.get_rbac_user_groups_with_role(self.customer)

    def get_users(self, instance):
        return instance.get_rbac_users_with_role(self.customer, self.request.user)

    def validate(self, data):
        name = data.get("name")
        instance_id = self.instance.id if self.instance else None
        if RBACRole.objects.filter(name=name, customer=self.customer).exclude(id=instance_id).exists():
            raise serializers.ValidationError({"name": "Role Name Already Exists."})
        return data

    def save(self, *args, **kwargs):
        return super(RBACRoleSerializer, self).save(
            customer=self.customer,
            created_by=self.request.user,
            *args,
            **kwargs
        )


class RBACUserGroupSerializer(serializers.ModelSerializer):
    applicable_permission_sets = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    rbac_roles = serializers.SerializerMethodField()
    applicable_rbac_roles = serializers.SerializerMethodField()
    rbac_users = serializers.SerializerMethodField()

    class Meta:
        model = RBACUserGroup
        fields = (
            "id",
            "uuid",
            "name",
            "description",
            "rbac_users",
            "rbac_roles",
            "applicable_rbac_roles",
            "applicable_permission_sets",
            "is_active",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name"
        )

    def __init__(self, *args, **kwargs):
        super(RBACUserGroupSerializer, self).__init__(*args, **kwargs)
        self.request = self.context["request"]
        self.customer = self.context["customer"]

    def get_applicable_permission_sets(self, instance):
        return instance.get_permission_sets_with_user_group(self.customer)

    def get_created_by_name(self, instance):
        return instance.created_by.get_full_name()

    def get_rbac_roles(self, instance):
        return instance.rbac_roles.all().values_list("uuid", flat=True)

    def get_applicable_rbac_roles(self, instance):
        return instance.rbac_roles.all().values("id", "uuid", "name")

    def get_rbac_users(self, instance):
        return instance.rbac_users.all().values_list("email", flat=True)

    def validate(self, data):
        name = data.get("name")
        instance_id = self.instance.id if self.instance else None
        if RBACUserGroup.objects.filter(name=name, customer=self.customer).exclude(id=instance_id).exists():
            raise serializers.ValidationError({"name": "Group Name Already Exists."})
        return data

    def save(self, *args, **kwargs):
        return super(RBACUserGroupSerializer, self).save(
            customer=self.customer,
            created_by=self.request.user,
            *args,
            **kwargs
        )


class RBACObjectPermissionSerializerMixin(serializers.Serializer):
    applicable_module_permissions = serializers.SerializerMethodField()

    def get_applicable_module_permissions(self, instance):
        model_class = instance._meta.model
        if model_class not in RBACModelManager.rbac_models:
            return []
        content_type = RBACModelManager.get_content_type_for_model(model_class)
        request_user = self.context["request"].user
        modules = RBACModelManager.model_module_map[model_class]
        base_qs = RBACPermissionSet.objects.active().filter(
            rbac_role_permissions__in=request_user.rbac_roles.all_active(),
            rbac_permissions__module__name__in=modules,
            entity_groups__customer=request_user.org,
        ).select_related("customer").prefetch_related(
            "rbac_permissions",
            "entity_groups__rbac_model_group_objects",
        ).distinct()
        custom_sets = base_qs.filter(
            entity_groups__entity_selection="custom",
            entity_groups__rbac_model_group_objects__content_type=content_type,
            entity_groups__rbac_model_group_objects__object_id=instance.id,
        )
        if custom_sets.exists():
            permission_sets = custom_sets
        else:
            permission_sets = base_qs.filter(
                entity_groups__entity_selection="all",
                entity_groups__content_types=content_type,
            )
        permission_names = RBACPermission.objects.filter(
            rbac_permission_set_permissions__in=permission_sets
        ).values_list("name", flat=True).distinct()
        permissions = RBACPermission.objects.stp_permissions().filter(
            name__in=permission_names
        ).order_by("name").values_list("module__name", "name").distinct()
        module_permissions = OrderedDict()
        for module_name, perm_name in permissions:
            module_permissions.setdefault(module_name, []).append(perm_name)
        return [
            {"module_name": module, "permission_names": sorted(names)}
            for module, names in sorted(module_permissions.items(), key=lambda x: x[0])
        ]
