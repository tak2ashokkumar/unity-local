import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';

export interface AlertsTabData extends TabData {
    deviceType: string
    deviceName: string;
}

export const tabItems: AlertsTabData[] = [
    {
        name: 'Switches',
        url: '/unityview/alerts/switches',
        icon: 'fa-sitemap',
        deviceType: DeviceMapping.SWITCHES,
        deviceName: 'Switches'
    },
    {
        name: 'Firewalls',
        url: '/unityview/alerts/firewalls',
        icon: 'fa-fire',
        deviceType: DeviceMapping.FIREWALL,
        deviceName: 'Firewalls'
    },
    {
        name: 'Load Balancers',
        url: '/unityview/alerts/loadbalancers',
        icon: 'fa-balance-scale',
        deviceType: DeviceMapping.LOAD_BALANCER,
        deviceName: 'Load Balancers'
    },
    {
        name: 'Hypervisors',
        url: '/unityview/alerts/hypervisors',
        icon: 'fa-server',
        deviceType: DeviceMapping.HYPERVISOR,
        deviceName: 'Hypervisors'
    },
    {
        name: 'Bare Metal Servers',
        url: '/unityview/alerts/baremetalservers',
        icon: 'fa-laptop',
        deviceType: DeviceMapping.BARE_METAL_SERVER,
        deviceName: 'BM Servers'
    },
    {
        name: 'Mac Mini',
        url: '/unityview/alerts/macdevices',
        icon: 'fab fa-apple',
        deviceType: DeviceMapping.MAC_MINI,
        deviceName: 'Mac Minis'
    },
    {
        name: 'Virtual Machines',
        url: '/unityview/alerts/vms',
        icon: 'fa-object-group',
        deviceType: DeviceMapping.VIRTUAL_MACHINE,
        deviceName: 'Virtual Machines'
    },
    {
        name: 'Storage',
        url: '/unityview/alerts/storage',
        icon: 'fas fa-hdd',
        deviceType: DeviceMapping.STORAGE_DEVICES,
        deviceName: 'Storage'
    },
    {
        name: 'PDUs',
        url: '/unityview/alerts/pdus',
        icon: 'fa-plug',
        deviceType: DeviceMapping.PDU,
        deviceName: 'PDUs'
    },
    {
        name: 'All Alerts',
        url: '/unityview/alerts/all',
        icon: 'fa-tasks',
        deviceType: 'all',
        deviceName: 'Alerts'
    },
];

export const zabbixAlertsTabItems: AlertsTabData[] = [
    {
        name: 'Alerts',
        url: '/unityview/alerts/allalerts',
        icon: 'fas fa-bell',
        deviceType: 'all',
        deviceName: 'Alerts'
    },
    {
        name: 'History',
        url: '/unityview/alerts/history',
        icon: 'fas fa-history',
        deviceType: 'all',
        deviceName: 'History'
    },
    {
        name: 'Graphs',
        url: '/unityview/alerts/graphs',
        icon: 'fas fa-chart-line',
        deviceType: 'all',
        deviceName: 'Graphs'
    },
];