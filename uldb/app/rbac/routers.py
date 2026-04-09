from rest_framework import routers

from app.rbac.views import (
    ModuleViewSet,
    RBACPermissionViewSet,
    RBACEntityGroupViewSet,
    RBACEntityGroupFastViewSet,
    RBACEntityObjectViewSet,
    RBACPermissionSetViewSet,
    RBACRoleViewSet,
    RBACUserGroupViewSet
)

router = routers.DefaultRouter()
router.register("permission_modules", ModuleViewSet, base_name="permission_modules")
router.register("permissions", RBACPermissionViewSet, base_name="permissions")
router.register("entity_groups", RBACEntityGroupViewSet, base_name="entity_groups")
router.register("entity_groups_fast", RBACEntityGroupFastViewSet, base_name="entity_groups_fast")
router.register("entity_group_objects", RBACEntityObjectViewSet, base_name="entity_group_objects")
router.register("permission_sets", RBACPermissionSetViewSet, base_name="permission_sets")
router.register("roles", RBACRoleViewSet, base_name="roles")
router.register("user_groups", RBACUserGroupViewSet, base_name="user_groups")
