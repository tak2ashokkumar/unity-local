import { Routes } from "@angular/router";
import { UsumUsersComponent } from "./usum-users/usum-users.component";
import { UsumUsersCrudComponent } from "./usum-users/usum-users-crud/usum-users-crud.component";
import { UsumPermissionSetsComponent } from "./usum-permission-sets/usum-permission-sets.component";
import { UsumPermissionSetsCrudComponent } from "./usum-permission-sets/usum-permission-sets-crud/usum-permission-sets-crud.component";
import { UsumRolesCrudComponent } from "./usum-roles/usum-roles-crud/usum-roles-crud.component";
import { UsumRolesComponent } from "./usum-roles/usum-roles.component";
import { UsumUserGroupsComponent } from "./usum-user-groups/usum-user-groups.component";
import { UsumUserGroupsCrudComponent } from "./usum-user-groups/usum-user-groups-crud/usum-user-groups-crud.component";
import { UsumImportUsersComponent } from "./usum-import-users/usum-import-users.component";
import { UsumEntityGroupComponent } from "./usum-entity-group/usum-entity-group.component";
import { UsumEntityGroupCrudComponent } from "./usum-entity-group/usum-entity-group-crud/usum-entity-group-crud.component";

export const UNITY_SETUP_USER_MGMT_ROUTES: Routes = [
    {
        path: 'users',
        component: UsumUsersComponent,
        data: {
            breadcrumb: {
                title: 'Users',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'users/import-users',
        component: UsumImportUsersComponent,
        data: {
            breadcrumb: {
                title: 'Users'
            }
        }
    },
    {
        path: 'users/create',
        component: UsumUsersCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'users/:userId/edit',
        component: UsumUsersCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'user-groups',
        component: UsumUserGroupsComponent,
        data: {
            breadcrumb: {
                title: 'User Groups',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'user-groups/create',
        component: UsumUserGroupsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'user-groups/:userGroupId/edit',
        component: UsumUserGroupsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'roles',
        component: UsumRolesComponent,
        data: {
            breadcrumb: {
                title: 'Roles',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'roles/create',
        component: UsumRolesCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'roles/:roleId/edit',
        component: UsumRolesCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'permission-sets',
        component: UsumPermissionSetsComponent,
        data: {
            breadcrumb: {
                title: 'Permission Sets',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'permission-sets/create',
        component: UsumPermissionSetsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'permission-sets/:permissionSetId/edit',
        component: UsumPermissionSetsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    },

    {
        path: 'entity-group',
        component: UsumEntityGroupComponent,
        data: {
            breadcrumb: {
                title: 'Entity Group',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'entity-group/create',
        component: UsumEntityGroupCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'entity-group/:groupId/edit',
        component: UsumEntityGroupCrudComponent,
        data: {
            breadcrumb: {
                title: 'Edit',
                stepbackCount: 0
            }
        }
    }
]
