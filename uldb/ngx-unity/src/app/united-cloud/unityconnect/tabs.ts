import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';

export interface AlertsTabData extends TabData {
    deviceType: string
    deviceName: string;
}

export const UnitedConnectTabItems: TabData[] = [
    {
        name: 'Network Connection',
        url: '/unitycloud/connect/bandwidth',
        icon: 'fas fa-ethernet',
    },
    {
        name: 'Bandwidth Billing',
        url: '/unitycloud/connect/billinginfo',
        icon: 'fas fa-file-invoice-dollar',
    },
    {
        name: 'Buy Connection',
        url: '/unitycloud/connect/vxc',
        icon: 'fas fa-credit-card',
    }
];

export const zabbixUnitedConnectTabItems: TabData[] = [
    {
        name: 'Network Connection',
        url: '/unitycloud/connect/network',
        icon: 'fas fa-ethernet',
    },
    {
        name: 'Bandwidth Billing',
        url: '/unitycloud/connect/billing',
        icon: 'fas fa-file-invoice-dollar',
    },
    {
        name: 'Buy Connection',
        url: '/unitycloud/connect/vxc',
        icon: 'fas fa-credit-card',
    }
];