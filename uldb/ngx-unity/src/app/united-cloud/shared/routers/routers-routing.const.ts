import { Routes } from '@angular/router';
import { ConsoleAccessComponent } from 'src/app/shared/console-access/console-access.component';
import { DeviceTabComponent } from '../device-tab/device-tab.component';
import { WebAccessComponent } from '../web-access/web-access.component';
import { OBSERVIUM_SWITCH_ROUTES } from '../switches/switches-observium/switches-obs-routing.const';
import { ZABBIX_SWITCH_ROUTES } from '../switches/switches-zabbix/switches-zabbix-routing.const';
import { SwitchesZabbixComponent } from '../switches/switches-zabbix/switches-zabbix.component';
import { RoutersComponent } from './routers.component';

export const ROUTER_ROUTES: Routes = [
  {
    path: 'routers',
    component: RoutersComponent,
    data: {
      deviceType: 'router',
      breadcrumb: { title: 'Routers', stepbackCount: 0 }
    }
  },
  { path: 'routers/:deviceId/webaccess', component: WebAccessComponent },
  { path: 'routers/:deviceId/console', component: ConsoleAccessComponent },
  {
    path: 'routers/:deviceid/obs',
    component: DeviceTabComponent,
    data: { breadcrumb: { title: 'Routers', stepbackCount: 2 } },
    children: OBSERVIUM_SWITCH_ROUTES
  },
  {
    path: 'routers/:deviceid/zbx',
    component: SwitchesZabbixComponent,
    data: { breadcrumb: { title: 'Routers', stepbackCount: 2 } },
    children: ZABBIX_SWITCH_ROUTES
  }
];
