import { Routes } from "@angular/router";
import { MtpAdministrationUsersComponent } from "./mtp-administration-users.component";
import { MtpAdministrationUsersCrudComponent } from "./mtp-administration-users-crud/mtp-administration-users-crud.component";
import { MtpAdministrationUsersImportComponent } from "./mtp-administration-users-import/mtp-administration-users-import.component";

export const MTP_ADMINISTRATION_USERS_ROUTES: Routes = [
    {
        path: 'users',
        component: MtpAdministrationUsersComponent
    },
    {
        path: 'users/create',
        component: MtpAdministrationUsersCrudComponent
    },
    {
        path: 'users/:userId/edit',
        component: MtpAdministrationUsersCrudComponent
    },
    {
        path: 'users/import',
        component: MtpAdministrationUsersImportComponent
    }
];