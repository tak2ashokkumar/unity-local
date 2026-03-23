import { Routes } from "@angular/router";
import { UnitySetupCredentialsCrudComponent } from "./unity-setup-credentials-crud/unity-setup-credentials-crud.component";
import { UnitySetupCredentialsComponent } from "./unity-setup-credentials.component";

export const UNITY_SETUP_CREDENTIALS_ROUTES: Routes = [
    {
        path: 'credentials',
        component: UnitySetupCredentialsComponent,
        data: {
            breadcrumb: {
                title: 'Credentials'
            }
        }
    },
    {
        path: 'credentials/add',
        component: UnitySetupCredentialsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Credentials'
            }
        }
    },
    {
        path: 'credentials/:credentialId/edit',
        component: UnitySetupCredentialsCrudComponent,
        data: {
            breadcrumb: {
                title: 'Credentials'
            }
        }
    }
]