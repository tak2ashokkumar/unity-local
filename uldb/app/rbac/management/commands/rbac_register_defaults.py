from django.core.management.base import BaseCommand
from app.rbac.config import defaults
from app.rbac.models import Module, RBACPermission, RBACPermissionSet, RBACRole


class Command(BaseCommand):
    help = "Register All Module, Permissions Sets and default RBAC Roles (Administrator, Dashboard and Global Read_Only)"

    def handle(self, *args, **options):
        # Create/Update Module and Module Permissions
        module_ids = []
        permission_ids = []
        for module_name, permissions in defaults.modules_permissions.items():
            module, created = Module.objects.update_or_create(name=module_name)
            module_ids.append(module.id)
            for perm_name in permissions:
                permission, created = RBACPermission.objects.update_or_create(name=perm_name, module=module)
                permission_ids.append(permission.id)
        to_delete_modules = Module.objects.all().exclude(id__in=module_ids)
        to_delete_permissions = RBACPermission.objects.all().exclude(id__in=permission_ids)
        to_delete_modules.delete()
        to_delete_permissions.delete()

        # Create/Update Default Permission Sets
        # Administrator
        all_permissions = RBACPermission.objects.filter(module__is_msp=False)
        admin_permission_set, created = RBACPermissionSet.objects.update_or_create(
            name="Administrator Permission Set",
            defaults=defaults.set_default_data.get("Administrator Permission Set")
        )
        admin_permission_set.rbac_permissions.set(all_permissions)

        # Dashboard
        dashboard_module = Module.objects.get(name="Dashboard")
        dashboard_permissions = RBACPermission.objects.filter(module=dashboard_module)
        dashboard_permission_set, created = RBACPermissionSet.objects.update_or_create(
            name="Dashboard Permission Set",
            defaults=defaults.set_default_data.get("Dashboard Permission Set")
        )
        dashboard_permission_set.rbac_permissions.set(dashboard_permissions)

        # Global Read-Only
        view_permissions = RBACPermission.objects.filter(name__icontains="View")
        cost_calculator_permission = RBACPermission.objects.get(name="Cost Calculator")
        readonly_permission_set, created = RBACPermissionSet.objects.update_or_create(
            name="Global Read-Only Permission Set",
            defaults=defaults.set_default_data.get("Global Read-Only Permission Set")
        )
        readonly_permission_set.rbac_permissions.set(view_permissions)
        readonly_permission_set.rbac_permissions.add(cost_calculator_permission)

        # Create/Update Default RBAC Roles
        # Administrator
        administrator_role, created = RBACRole.objects.update_or_create(
            name="Administrator",
            defaults=defaults.set_default_data.get("Administrator")
        )
        administrator_role.permissions.add(admin_permission_set)

        # Dashboard
        dashboard_user_role, created = RBACRole.objects.update_or_create(
            name="Dashboard user",
            defaults=defaults.set_default_data.get("Dashboard user")
        )
        dashboard_user_role.permissions.add(dashboard_permission_set)

        # Global Read-Only
        global_read_only_role, created = RBACRole.objects.update_or_create(
            name="Global Read-Only",
            defaults=defaults.set_default_data.get("Global Read-Only")
        )
        global_read_only_role.permissions.add(readonly_permission_set)
