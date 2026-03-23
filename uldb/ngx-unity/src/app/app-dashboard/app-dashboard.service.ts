import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomDateRangeType } from '../shared/SharedEntityTypes/unity-utils.type';
import { AppDashboardListType } from './app-dashboard.type';

@Injectable()
export class AppDashboardService {

  constructor(private http: HttpClient,) { }

  getDashboardList(): Observable<AppDashboardListType[]> {
    return this.http.get<AppDashboardListType[]>('/customer/persona/dashboards/?page_size=0').pipe(
      map((res: AppDashboardListType[]) => {
        res = res.filter(d => d.status == 'published');
        return res.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      })
    );
  }
}

// Filter Form Constants
export const refreshIntervals: Array<{ value: string, label: string, valueInSecs: number }> = [
  { value: '5m', label: '5 minutes', valueInSecs: 300 },
  { value: '10m', label: '10 minutes', valueInSecs: 600 },
  { value: '15m', label: '15 minutes', valueInSecs: 900 },
  { value: '20m', label: '20 minutes', valueInSecs: 1200 },
  { value: '25m', label: '25 minutes', valueInSecs: 1500 },
  { value: '30m', label: '30 minutes', valueInSecs: 1800 },
]

export const customDateRangeOptions: CustomDateRangeType[] = [
  { label: 'Last 24 hours', value: 'last_24_hours', valueAsFrequency: 'daily' },
  { label: 'Last 7 days', value: 'last_7_days', valueAsFrequency: 'weekly' },
  { label: 'Last 30 days', value: 'last_30_days', valueAsFrequency: 'monthly' },
]

//Widget Form Constants
export class AppDashboardWidgetCategoryOptions {
  label: string;
  value: string;
  dataurl?: string
  chart_type?: string
  group_by?: AppDashboardWidgetCategoryOptions[];
}
export const widgetCategories: AppDashboardWidgetCategoryOptions[] = [
  {
    label: 'Host Availability', value: 'host_availability', group_by: [
      { label: 'Device Type', value: 'device_type' },
      { label: 'Datacenter', value: 'datacenter' },
      { label: 'Cloud', value: 'cloud_type' },
      { label: 'Status', value: 'status' },
      { label: 'Tags', value: 'tags' }
    ]
  },
  {
    label: 'Private Cloud', value: 'private_cloud', dataurl: '/customer/custom_widget/widget/get_cloud_details/',
    group_by: [
      { label: 'Locations', value: 'locations' },
      { label: 'Tags', value: 'tags' }
    ],
  },
  {
    label: 'Public Cloud', value: 'public_cloud', dataurl: '/customer/custom_widget/widget/get_cloud_details/',
    group_by: [
      { label: 'Cloud', value: 'cloud_type' },
      { label: 'Regions', value: 'regions' },
      { label: 'Resource Types', value: 'resource_types' },
      { label: 'Tags', value: 'tags' }
    ],
  },
  {
    label: 'Infra Summary', value: 'infra_summary', group_by: [
      { label: 'Device Type', value: 'device_type' },
      { label: 'Datacenter', value: 'datacenter' },
      { label: 'Cloud', value: 'cloud_type' },
      { label: 'Tags', value: 'tags' }
    ]
  },
  {
    label: 'Cloud Cost', value: 'cloud_cost', group_by: [
      { label: 'Cloud', value: 'cloud_type' },
      { label: 'Account Name', value: 'account_name' },
      { label: 'Regions', value: 'regions' },
      { label: 'Service', value: 'service' },
      // { 'name': 'Resource Types', 'value': 'resource_types' }
    ]
  },
  {
    label: 'Alerts', value: 'alerts', group_by: [
      { label: 'Alert Source', value: 'alert_source' },
      { label: 'Severity', value: 'severity' },
      { label: 'Device Type', value: 'device_type' },
      { label: 'Datacenter', value: 'datacenter' },
      { label: 'Cloud', value: 'cloud_type' },
      { label: 'Status', value: 'status' }
    ]
  },
  {
    label: 'Sustainability', value: 'sustainability', group_by: [
      { label: 'Device Type', value: 'device_type' },
      { label: 'Datacenter', value: 'datacenter' },
      // { label: 'Status', 'value': 'status' },
      { label: 'Cloud', value: 'cloud_type' },
      { label: 'Tags', value: 'tags' }
    ]
  },
  { label: 'Monitoring', value: 'monitoring', },
  {
    label: 'Device by OS', value: 'device_by_os', group_by: [
      { label: 'OS Type', value: 'os_type' },
      { label: 'OS Version', value: 'os_version' },
    ]
  },
]

export const CustomDropdownOptions = [
  { label: 'Last 24 Hours', value: 'last_24_hours' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 60 Days', value: 'last_60_days' },
  { label: 'Last 90 Days', value: 'last_90_days' },
];

export const deviceTypes: Array<{ name: string, displayName: string }> = [
  {
    name: "switch",
    displayName: "Switch"
  },
  {
    name: "firewall",
    displayName: "Firewall"
  },
  {
    name: "load_balancer",
    displayName: "Load Balancer"
  },
  {
    name: "storage",
    displayName: "Storage"
  },
  {
    name: "hypervisor",
    displayName: "Hypervisor"
  },
  {
    name: "baremetal",
    displayName: "BareMetal"
  },
  {
    name: "mac_device",
    displayName: "Mac Device"
  },
  {
    name: "custom",
    displayName: "Custom"
  },
  {
    name: "open_stack",
    displayName: "Openstack"
  },
  {
    name: "virtual_machine",
    displayName: "Custom VM"
  },
  {
    name: "proxmox",
    displayName: "Proxmox"
  },
  {
    name: "nutanix",
    displayName: "Nutanix"
  },
  {
    name: "hyperv",
    displayName: "HyperV"
  },
  {
    name: "vmware",
    displayName: "VMware"
  }
];
