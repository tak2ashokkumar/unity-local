import { Routes } from "@angular/router";
import { MtpAdministrationGroupComponent } from "./mtp-administration-group.component";
import { MtpAdministrationGroupCrudComponent } from "./mtp-administration-group-crud/mtp-administration-group-crud.component";

export const MTP_ADMINISTRATION_GROUPS_ROUTES: Routes = [
    {
        path: 'groups',
        component: MtpAdministrationGroupComponent
    },
    {
        path: 'groups/create',
        component: MtpAdministrationGroupCrudComponent
    },
    {
        path: 'groups/:groupId/edit',
        component: MtpAdministrationGroupCrudComponent
    }
];