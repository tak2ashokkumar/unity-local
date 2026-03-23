import { Routes } from "@angular/router";
import { SdwansComponent } from "./sdwans.component";
import { SdwansDetailsComponent } from "./sdwans-details/sdwans-details.component";
import { SdwansZabbixComponent } from "./sdwans-zabbix/sdwans-zabbix.component";
import { ZABBIX_SDWAN_ACCOUNT_ROUTES } from "./sdwans-zabbix/sdwans-zabbix-routing.const";
import { ZABBIX_SDWAN_DEVICES_ROUTES } from "./sdwans-details/sdwan-details-zabbix/sdwan-details-zabbix-routing.const";
import { SdwanDetailsZabbixComponent } from "./sdwans-details/sdwan-details-zabbix/sdwan-details-zabbix.component";
import { UsioSdwanCrudComponent } from "src/app/unity-setup/unity-setup-integration/usi-others/usio-sdwan/usio-sdwan-crud/usio-sdwan-crud.component";

export const SDWAN_ROUTES: Routes = [
  {
    path: 'sdwans',
    component: SdwansComponent,
    data: {
      breadcrumb: {
        title: 'Sdwans',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'sdwans/:sdwanId/details',
    component: SdwansDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Sdwan Devices',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'sdwans/:sdwanId/edit',
    component: UsioSdwanCrudComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'sdwans/:deviceid/zbx',
    component: SdwansZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 1
      }
    },
    children: ZABBIX_SDWAN_ACCOUNT_ROUTES
  },
  {
    path: 'sdwans/:sdwanId/details/:deviceid/zbx',
    component: SdwanDetailsZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Sdwan Devices',
        stepbackCount: 0
      }
    },
    children: ZABBIX_SDWAN_DEVICES_ROUTES
  },
]