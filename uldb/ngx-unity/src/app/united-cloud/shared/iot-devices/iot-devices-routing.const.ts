import { Routes } from "@angular/router";
import { IotDevicesComponent } from "./iot-devices.component";
import { IotDevicesZabbixComponent } from "./iot-devices-zabbix/iot-devices-zabbix.component";
import { ZABBIX_IOT_DEVICE_ROUTES } from "./iot-devices-zabbix/iot-devices-zabbix-routing.const";

export const IOT_DEVICE_ROUTES: Routes = [
    {
        path: 'iot-devices',
        component: IotDevicesComponent,
        data: {
            breadcrumb: {
                title: 'IOT Devices',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'iot-devices/:deviceid/zbx',
        component: IotDevicesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'IOT Devices',
                stepbackCount: 0
            }
        },
        children: ZABBIX_IOT_DEVICE_ROUTES
    },
]