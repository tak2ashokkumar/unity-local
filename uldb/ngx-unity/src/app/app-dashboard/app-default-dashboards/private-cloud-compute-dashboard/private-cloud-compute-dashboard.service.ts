import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnyMxRecord } from 'dns';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { executiveSummaryData, PRIVATE_CLOUD_AUTO_REMEDIATION_SUMMARY_ENDPOINT, PRIVATE_CLOUD_CAPACITY_GROWTH_ENDPOINT, PRIVATE_CLOUD_CLUSTER_CAPACITY_TREND_ENDPOINT, PRIVATE_CLOUD_CLUSTER_COMPONENT_SUMMARY_ENDPOINT, PRIVATE_CLOUD_CLUSTER_METRICS_ENDPOINT, PRIVATE_CLOUD_DASHBOARD_HEADER_ENDPOINT, PRIVATE_CLOUD_EXECUTIVE_SUMMARY_ENDPOINT, PRIVATE_CLOUD_FILTERS_ENDPOINT, PRIVATE_CLOUD_GEO_DISTRIBUTION_ENDPOINT, PRIVATE_CLOUD_HYPERVISOR_HEALTH_ENVIRONMENT_ENDPOINT, PRIVATE_CLOUD_HYPERVISOR_VERSION_COMPLIANCE_CHARTS_ENDPOINT, PRIVATE_CLOUD_HYPERVISOR_VERSION_COMPLIANCE_ENDPOINT, PRIVATE_CLOUD_IDLE_DEVICES_ENDPOINT, PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT, PRIVATE_CLOUD_INFRASTRUCTURE_HEALTH_STATUS_ENDPOINT, PRIVATE_CLOUD_NETWORK_INTERFACES_ENDPOINT, PRIVATE_CLOUD_NEWLY_PROVISIONED_VMS_CHARTS_ENDPOINT, PRIVATE_CLOUD_NEWLY_PROVISIONED_VMS_ENDPOINT, PRIVATE_CLOUD_ORPHANED_DEVICES_DETAILED_ENDPOINT, PRIVATE_CLOUD_PERFORMANCE_HOTSPOTS_CHARTS_ENDPOINT, PRIVATE_CLOUD_PERFORMANCE_HOTSPOTS_ENDPOINT, PRIVATE_CLOUD_PERFORMANCE_WORKLOAD_INSIGHTS_ENDPOINT, PRIVATE_CLOUD_RECENT_ALERT_ENDPOINT, PRIVATE_CLOUD_STORAGE_DATASTORES_ENDPOINT, PRIVATE_CLOUD_TIME_RANGE_DEFAULT, PRIVATE_CLOUD_TIME_RANGE_PARAM_MAP, PRIVATE_CLOUD_TOP_CLUSTERS_BY_VM_COUNT_ENDPOINT, PRIVATE_CLOUD_TOP_CLUSTERS_ENDPOINT, PRIVATE_CLOUD_VM_BACKUP_STATUS_CHARTS_ENDPOINT, PRIVATE_CLOUD_VM_BACKUP_STATUS_ENDPOINT, PRIVATE_CLOUD_VM_PROVISIONING_SUMMARY_ENDPOINT, VmDensityPerHostChartColors } from './private-cloud-compute-dashboard.const';
import { AlertsSeverityItem, AutoRemediationActionItem, AutoRemediationSummaryResponse, CapacityAndGrowthDataType, CapacityTrendAndForecastItem, CloudTypeDistributionItem, ClusterCapacityTrendResponse, ClusterCapacityUtilTrendData, ClusterComponentSummaryResponse, ClusterMetricsResponse, EnvironmentCriticalityItem, ExecutiveSummaryAllocPreviewItem, ExecutiveSummaryDiscoveryCard, ExecutiveSummaryItem, ExecutiveSummaryWidgetType, FiltersCriteriaType, HypervisorHealthEnvironmentItem, HypervisorHealthEnvironmentResponse, HypervisorVersionComplianceChartsResponse, HypervisorVersionComplianceResponse, IdleDevices, IdleDurationDistributionItem, labelAndValueType, NetworkInterfaceItem, NetworkInterfacesResponse, NewlyProvisionedVmItem, NewlyProvisionedVmsChartResponse, NewlyProvisionedVmsResponse, OrphanedCategory, OrphanedDevice, OrphanedResourcesResponse, PerformanceHotspots, PerformanceHotspotsChartsResponse, PerformanceWorkloadDataType, PowerActivityStateItem, PrivateCloudAlertSideCard, PrivateCloudAlertTrendBarGroup, PrivateCloudAlertTrendLegendItem, PrivateCloudGeoDistributionCell, PrivateCloudGeoDistributionResponse, PrivateCloudGeoDistributionViewData, PrivateCloudInventoryCardViewData, PrivateCloudInventoryProviderResources, PrivateCloudInventoryResourceViewData, PrivateCloudInventoryResponse, PrivateCloudStatusTone, PrivateCloudTicketDonutItem, PrivateCloudUtilization, PrivateCloudUtilizationRow, PrivateCloudUtilizationViewRow, ProvisioningStatus, RecentAlerts, RecentAlertsItem, ResourceAllocationItem, StorageDatastoreItem, StorageDatastoresResponse, TopClustersByVmCountResponse, Top10ClustersByVMsData, TopHeaderDataType, TopHostUtilizationItem, VmBackupRepositoryCapacityItem, VmBackupStatusChartsResponse, VmBackupStatusItem, VmBackupStatusResponse, VmCountByOSTypeItem, VmProvisioningSummaryResponse, VmWorkloadInsightItem, } from './private-cloud-compute-dashboard.type';

const PRIVATE_CLOUD_FILTER_SAMPLE = {
  platforms: [
    { value: 'VMware', label: 'VMware vCenter' },
    { value: 'Nutanix', label: 'Nutanix' },
    { value: 'Hyper-V', label: 'Hyper-V' }
  ],
  datacenters: [
    { value: 'DC1', label: 'DC1' },
    { value: 'DC2', label: 'DC2' }
  ],
  environments: [
    { value: 'Production', label: 'Production' },
    { value: 'Development', label: 'Development' },
    { value: 'Test', label: 'Test' }
  ],
  accounts: [
    { value: 'account-prod', label: 'Production Account' },
    { value: 'account-dev', label: 'Development Account' }
  ],
  deviceTypes: [
    { value: 'Virtual Machine', label: 'Virtual Machine' },
    { value: 'Hypervisor', label: 'Hypervisor' }
  ],
  eventClouds: [
    { value: 'VMware', label: 'VMware' },
    { value: 'Nutanix', label: 'Nutanix' }
  ],
  eventDatacenters: [
    { value: 'DC1', label: 'DC1' },
    { value: 'DC2', label: 'DC2' }
  ],
  timeRanges: []
};

const EXECUTIVE_SUMMARY_SAMPLE: ExecutiveSummaryWidgetType = {
  ...executiveSummaryData,
  kpiRow: {
    poweredOn: 144,
    poweredOff: 128,
    idleVMs: 4,
    orphanedDevices: 0
  },
  discoveryCards: [
    { title: 'VMs', discovered: 272, up: 144, down: 128, unknown: 0 },
    { title: 'Physical Hosts', discovered: 12, up: 10, down: 2, unknown: 0 },
    { title: 'Clusters', discovered: 10, up: 10, down: 0, unknown: 0 }
  ],
  executiveSummary: {
    ...executiveSummaryData.executiveSummary,
    totalVMs: 272,
    physicalHosts: 12,
    clusters: 10,
    poweredOnVMs: 144,
    poweredOffVMs: 128,
    idleVMs: 4,
    orphanedVMs: 0
  },
  cloudTypeDistribution: [
    { type: 'United Private Cloud vCenter', percentage: 50.3, count: 137 },
    { type: 'Nutanix', percentage: 32.9, count: 90 },
    { type: 'Hyperv', percentage: 16.8, count: 45 }
  ],
  vmCountByOSType: [
    { os: 'Linux', percentage: 38, count: 103 },
    { os: 'Windows', percentage: 17, count: 46 },
    { os: 'Other/Unknown', percentage: 45, count: 123 }
  ],
  environmentCriticality: [
    { environment: 'Production', count: 88, percentage: 32.4 },
    { environment: 'Development', count: 34, percentage: 12.5 },
    { environment: 'Test', count: 16, percentage: 5.9 },
    { environment: 'Untagged', count: 134, percentage: 49.3 }
  ],
  alertsSeverity: {
    critical: 15,
    warning: 230,
    info: 0,
    total: 245
  },
  powerActivityState: [
    { state: 'Powered On', count: 144 },
    { state: 'Powered Off', count: 128 }
  ],
  resourceAllocation: {
    vcpu: { unit: 'cores', totalCapacity: 607, used: 224 },
    vram: { unit: 'GB', totalCapacity: 2784.1, used: 491.7 },
    labels: ['vCPU (cores)', 'vRAM (GB)'],
    totalCapacity: [607, 2784.1],
    used: [224, 491.7]
  },
  allocPreview: [
    { platform: 'United Private Cloud vCenter', platformGroup: 'VMware', compute: 78.0, memory: 75.0, storage: 56.0 },
    { platform: 'Nutanix', platformGroup: 'Nutanix', compute: 64.0, memory: 65.0, storage: 58.0 },
    { platform: 'Hyperv', platformGroup: 'Hyper-V', compute: 67.0, memory: 77.0, storage: 71.0 }
  ]
};

const PRIVATE_CLOUD_INVENTORY_SAMPLE: PrivateCloudInventoryResponse = {
  vmware: {
    baremetal: 2,
    clusters: 8,
    database: 5,
    datastores: 21,
    distributed_switches: 6,
    firewall: 1,
    hypervisor: 12,
    networks: 18,
    port_groups: 26,
    storage: 1,
    vm: 226,
    total_resources: 326
  },
  nutanix: {
    clusters: 1,
    disks: 7,
    hosts: 1,
    storage_containers: 3,
    storage_pools: 1,
    virtual_disks: 11,
    vm: 3,
    total_resources: 27
  },
  hyperv: {
    hypervisor: 1,
    vm: 76,
    total_resources: 77
  },
  proxmox: {
    total_resources: 0
  },
  openstack: {
    total_resources: 0
  },
  vcloud: {
    vm: 8,
    total_resources: 8
  },
  custom: {
    switch: 1,
    vm: 11,
    total_resources: 12
  },
  total_resources: 450
};

const PRIVATE_CLOUD_GEO_DISTRIBUTION_COLORS = ['#ff7f1a', '#56bf45', '#087bd3', '#3db779', '#f5a31a', '#e94851'];


const CAPACITY_GROWTH_SAMPLE: CapacityAndGrowthDataType = {
  topHostUtilization: [
    {
      usedCapacity: 4073.06,
      utilizationPercentage: 65.07,
      hostName: 'ul-sv1-unity-lab-esx01.unitedlayer.com',
      utilizationStatus: 'Optimal',
      totalCapacity: 6259.1
    },
    {
      usedCapacity: 4433.37,
      utilizationPercentage: 55.49,
      hostName: 'ul-sv1-unity-lab-esx02.unitedlayer.com',
      utilizationStatus: 'Optimal',
      totalCapacity: 7990.0
    }
  ],
  top5HostsByVmDensity: [
    { host: 'ul-sv1-unity-lab-esx02.unitedlayer.com', platform: 'VMware', cluster: 'UNITY-LAB-CL', vms: 131 },
    { host: 'ul-sv1-unity-lab-esx01.unitedlayer.com', platform: 'VMware', cluster: 'UNITY-LAB-CL', vms: 95 },
    { host: 'UL-SC1UG302-HV4', platform: 'Hyper-V', cluster: 'hyperV', vms: 62 },
    { host: 'UL-SC1UG302-HV5', platform: 'Hyper-V', cluster: 'hyperV', vms: 14 },
    { host: 'NTNX-83323128-A', platform: 'Nutanix', cluster: 'UL-Nutanix-Test', vms: 3 }
  ],
  capacityTrendAndForecast: [
    { count: 89, isForecast: false, month: 'Oct 2025' },
    { count: 89, isForecast: false, month: 'Nov 2025' },
    { count: 91, isForecast: false, month: 'Dec 2025' },
    { count: 91, isForecast: false, month: 'Jan 2026' },
    { count: 91, isForecast: false, month: 'Feb 2026' },
    { count: 146, isForecast: false, month: 'Mar 2026' },
    { count: 146, isForecast: false, month: 'Apr 2026' },
    { count: 161, isForecast: false, month: 'May 2026' },
    { count: 233, isForecast: false, month: 'Jun 2026' },
    { count: 235, isForecast: false, month: 'Jul 2026' },
    { count: 235, isForecast: false, month: 'Aug 2026' },
    { count: 317, isForecast: false, month: 'Sep 2026' },
    { count: 361, isForecast: true, month: 'Oct 2026' },
    { count: 405, isForecast: true, month: 'Nov 2026' },
    { count: 449, isForecast: true, month: 'Dec 2026' },
    { count: 493, isForecast: true, month: 'Jan 2027' },
    { count: 538, isForecast: true, month: 'Feb 2027' },
    { count: 582, isForecast: true, month: 'Mar 2027' }
  ],
  provisioningStatus: {
    provisioned: 82,
    decommissioned: 0
  }
};

const HYPERVISOR_HEALTH_ENVIRONMENT_SAMPLE: HypervisorHealthEnvironmentResponse = {
  count: 9,
  page: 1,
  pageSize: 10,
  results: [
    {
      name: '172.17.65.79',
      status: 'Healthy',
      vendor: 'Dell EMC',
      mfr: 'VMware',
      hv: 'ESXi',
      model: 'PowerEdge R750',
      os: 'ESXi 8.0.2',
      cpus: 2,
      cores: 32,
      mem: '256 GB',
      storage: '194.3 TB',
      cpuU: { cap: '52.8 GHz', used: '22.8 GHz', avail: '30.0 GHz', pct: 43.3 },
      memU: { cap: '256.0 GB', used: '180.0 GB', avail: '76.0 GB', pct: 70.3 },
      storU: { cap: '194.3 TB', used: '131.6 TB', avail: '62.7 TB', pct: 67.7 },
      fan: 'Healthy',
      psu: 'Healthy',
      temp: 38.0,
      hw: 'Healthy'
    },
    {
      name: '172.17.65.83',
      status: 'Critical',
      vendor: 'Dell EMC',
      mfr: 'VMware',
      hv: 'ESXi',
      model: 'PowerEdge R750',
      os: 'ESXi 8.0.2',
      cpus: 2,
      cores: 32,
      mem: '512 GB',
      storage: '194.3 TB',
      cpuU: { cap: '52.8 GHz', used: '46.3 GHz', avail: '6.5 GHz', pct: 87.7 },
      memU: { cap: '512.0 GB', used: '485.4 GB', avail: '26.6 GB', pct: 94.8 },
      storU: { cap: '194.3 TB', used: '181.1 TB', avail: '13.2 TB', pct: 93.2 },
      fan: 'Critical',
      psu: 'Warning',
      temp: 52.5,
      hw: 'Critical'
    },
    {
      name: '172.17.65.80',
      status: 'Healthy',
      vendor: 'VMware',
      mfr: 'Dell',
      hv: 'ESXi',
      model: 'PowerEdge R750',
      os: 'ESXi 8.0.2',
      cpus: 2,
      cores: 32,
      mem: '256 GB',
      storage: '194.3 TB',
      cpuU: { cap: '52.7 GHz', used: '18.5 GHz', avail: '34.2 GHz', pct: 35.1 },
      memU: { cap: '255.9 GB', used: '180 GB', avail: '75.9 GB', pct: 70.3 },
      storU: { cap: '194.3 TB', used: '72 TB', avail: '122.3 TB', pct: 37.1 },
      fan: 'Healthy',
      psu: 'Healthy',
      temp: 41,
      hw: 'Healthy'
    },
    {
      name: '172.17.65.81',
      status: 'Healthy',
      vendor: 'VMware',
      mfr: 'Dell',
      hv: 'ESXi',
      model: 'PowerEdge R740',
      os: 'ESXi 7.0',
      cpus: 2,
      cores: 24,
      mem: '192 GB',
      storage: '96 TB',
      cpuU: { cap: '39.5 GHz', used: '15.2 GHz', avail: '24.3 GHz', pct: 38.5 },
      memU: { cap: '191.9 GB', used: '142 GB', avail: '49.9 GB', pct: 74 },
      storU: { cap: '96 TB', used: '61 TB', avail: '35 TB', pct: 63.5 },
      fan: 'Healthy',
      psu: 'Healthy',
      temp: 39,
      hw: 'Healthy'
    },
    {
      name: '172.17.65.82',
      status: 'Warning',
      vendor: 'VMware',
      mfr: 'HPE',
      hv: 'ESXi',
      model: 'ProLiant DL380 Gen11',
      os: 'ESXi 8.0.2',
      cpus: 2,
      cores: 32,
      mem: '512 GB',
      storage: '194.3 TB',
      cpuU: { cap: '52.7 GHz', used: '38.7 GHz', avail: '14 GHz', pct: 73.4 },
      memU: { cap: '511.8 GB', used: '421 GB', avail: '90.8 GB', pct: 82.3 },
      storU: { cap: '194.3 TB', used: '156 TB', avail: '38.3 TB', pct: 80.3 },
      fan: 'Warning',
      psu: 'Healthy',
      temp: 48,
      hw: 'Warning'
    },
    {
      name: '172.17.65.84',
      status: 'Healthy',
      vendor: 'Nutanix',
      mfr: 'Quanta',
      hv: 'AHV',
      model: 'QuantaGrid D52BQ-2U',
      os: 'AHV 2024.1',
      cpus: 2,
      cores: 32,
      mem: '512 GB',
      storage: '80 TB',
      cpuU: { cap: '52.7 GHz', used: '21.4 GHz', avail: '31.3 GHz', pct: 40.6 },
      memU: { cap: '511.8 GB', used: '298 GB', avail: '213.8 GB', pct: 58.2 },
      storU: { cap: '80 TB', used: '52 TB', avail: '28 TB', pct: 65 },
      fan: 'Healthy',
      psu: 'Healthy',
      temp: 35,
      hw: 'Healthy'
    },
    {
      name: '172.17.65.85',
      status: 'Healthy',
      vendor: 'Nutanix',
      mfr: 'Quanta',
      hv: 'AHV',
      model: 'QuantaGrid D52BQ-2U',
      os: 'AHV 2024.1',
      cpus: 2,
      cores: 32,
      mem: '512 GB',
      storage: '80 TB',
      cpuU: { cap: '52.7 GHz', used: '19.8 GHz', avail: '32.9 GHz', pct: 37.6 },
      memU: { cap: '511.8 GB', used: '276 GB', avail: '235.8 GB', pct: 53.9 },
      storU: { cap: '80 TB', used: '48 TB', avail: '32 TB', pct: 60 },
      fan: 'Healthy',
      psu: 'Healthy',
      temp: 37,
      hw: 'Healthy'
    }
  ]
};

const STORAGE_DATASTORES_SAMPLE: StorageDatastoresResponse = {
  count: 24,
  next: 'sample-next-page',
  previous: null,
  results: [
    { name: 'LocalDS_ESXI01', platform: 'VMware', accountName: 'Vmwaretesting', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 4.0, status: 'Healthy', vmCount: null, hostCount: null },
    { name: 'LocalDS_ESXI02', platform: 'VMware', accountName: 'Vmwaretesting', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 37.0, status: 'Healthy', vmCount: null, hostCount: null },
    { name: 'LAB-ESX02-DS', platform: 'VMware', accountName: 'Vmwaretesting', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 99.0, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'LAB-ESX01-DS', platform: 'VMware', accountName: 'Vmwaretesting', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 80.0, status: 'Warning', vmCount: null, hostCount: null },
    { name: 'LocalDS_ESXI02', platform: 'VMware', accountName: 'VmwareNewPass', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 37.0, status: 'Healthy', vmCount: null, hostCount: null },
    { name: 'LAB-ESX02-DS', platform: 'VMware', accountName: 'VmwareNewPass', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 99.0, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'LAB-ESX01-DS', platform: 'VMware', accountName: 'VmwareNewPass', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 80.0, status: 'Warning', vmCount: null, hostCount: null },
    { name: 'LocalDS_ESXI01', platform: 'VMware', accountName: 'VmwareNewPass', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 4.0, status: 'Healthy', vmCount: null, hostCount: null },
    { name: 'LAB-ESX02-DS', platform: 'VMware', accountName: 'Vmware_New', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 95.0, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'LocalDS_ESXI01', platform: 'VMware', accountName: 'Vmware_New', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 4.0, status: 'Healthy', vmCount: null, hostCount: null }
  ],
  topByUsage: [
    { name: 'SelfServiceContainer', platform: 'Nutanix', accountName: 'Nutanix', type: 'Container', datacenter: 'DC1', capacityGb: 3.9, usedGb: 1200.0, percentUsed: 30769.2, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'default-container-39150495798959', platform: 'Nutanix', accountName: 'Nutanix', type: 'Container', datacenter: 'DC1', capacityGb: 4.0, usedGb: 61.3, percentUsed: 1532.5, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'NutanixManagementShare', platform: 'Nutanix', accountName: 'Nutanix', type: 'Container', datacenter: 'DC1', capacityGb: 3.9, usedGb: 7.9, percentUsed: 202.6, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'LAB-ESX02-DS', platform: 'VMware', accountName: 'Vmwaretesting', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 99.0, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'LAB-ESX02-DS', platform: 'VMware', accountName: 'VmwareNewPass', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 99.0, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'LAB-ESX02-DS', platform: 'VMware', accountName: 'Vmware_New', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 95.0, status: 'Critical', vmCount: null, hostCount: null },
    { name: 'datastore1 (4)', platform: 'VMware', accountName: '1.DemoVcenter - GlobalVCS-Lab', type: 'VMFS 6', datacenter: 'DC1', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 84.0, status: 'Warning', vmCount: null, hostCount: null },
    { name: 'LAB-ESX01-DS', platform: 'VMware', accountName: 'Vmwaretesting', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 80.0, status: 'Warning', vmCount: null, hostCount: null },
    { name: 'LAB-ESX01-DS', platform: 'VMware', accountName: 'VmwareNewPass', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 80.0, status: 'Warning', vmCount: null, hostCount: null },
    { name: 'LAB-ESX01-DS', platform: 'VMware', accountName: 'Vmware_New', type: 'VMFS 6', datacenter: 'DC3', capacityGb: 2048.0, usedGb: 1100.0, percentUsed: 73.0, status: 'Healthy', vmCount: null, hostCount: null }
  ],
  statusBreakdown: {
    Critical: 6,
    Warning: 3,
    Healthy: 15
  }
};

const NETWORK_INTERFACES_SAMPLE: NetworkInterfacesResponse = {
  count: 44,
  next: 'sample-next-page',
  previous: null,
  results: [
    { port: 'DVS', platform: 'VMware', vlan: '218', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmwaretesting', vmCount: 69, id: 630, portGroup: 'VM-Net-VLAN218' },
    { port: 'DVS', platform: 'VMware', vlan: '0', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmwaretesting', vmCount: 12, id: 631, portGroup: 'DPortGroup' },
    { port: 'DVS', platform: 'VMware', vlan: '101', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmwaretesting', vmCount: 12, id: 641, portGroup: 'DSwitch-01-DVUplinks-24' },
    { port: 'DVS', platform: 'VMware', vlan: '218', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'VmwareNewPass', vmCount: 69, id: 642, portGroup: 'VM-Net-VLAN218' },
    { port: 'DVS', platform: 'VMware', vlan: '101', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'VmwareNewPass', vmCount: 12, id: 643, portGroup: 'DSwitch-01-DVUplinks-24' },
    { port: 'DVS', platform: 'VMware', vlan: '0', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'VmwareNewPass', vmCount: 12, id: 644, portGroup: 'DPortGroup' },
    { port: 'DVS', platform: 'VMware', vlan: '218', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmware_New', vmCount: 64, id: 636, portGroup: 'VM-Net-VLAN218' },
    { port: 'DVS', platform: 'VMware', vlan: '0', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmware_New', vmCount: 12, id: 637, portGroup: 'DPortGroup' },
    { port: 'DVS', platform: 'VMware', vlan: '101', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmware_New', vmCount: 12, id: 640, portGroup: 'DSwitch-01-DVUplinks-24' },
    { port: 'DVS', platform: 'VMware', vlan: '0', nicTeamStatus: 'Healthy', datacenter: 'DC1', accountName: '1.DemoVcenter - GlobalVCS-Lab', vmCount: 12, id: 1, portGroup: 'test-ext' }
  ],
  vmCountPerPortGroup: [
    { port: 'DVS', platform: 'VMware', vlan: '218', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmwaretesting', vmCount: 69, id: 630, portGroup: 'VM-Net-VLAN218' },
    { port: 'DVS', platform: 'VMware', vlan: '218', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'VmwareNewPass', vmCount: 69, id: 642, portGroup: 'VM-Net-VLAN218' },
    { port: 'DVS', platform: 'VMware', vlan: '218', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmware_New', vmCount: 64, id: 636, portGroup: 'VM-Net-VLAN218' },
    { port: 'Standard Network', platform: 'VMware', vlan: 'None', nicTeamStatus: 'Healthy', datacenter: 'DC1', accountName: '1.DemoVcenter - GlobalVCS-Lab', vmCount: 51, id: 1, portGroup: 'VM Network' },
    { port: 'Standard Network', platform: 'VMware', vlan: 'None', nicTeamStatus: 'Healthy', datacenter: 'DC1', accountName: '1.DemoVcenter - GlobalVCS-Lab', vmCount: 21, id: 2, portGroup: 'U-D-T' },
    { port: 'DVS', platform: 'VMware', vlan: '0', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmwaretesting', vmCount: 12, id: 631, portGroup: 'DPortGroup' },
    { port: 'DVS', platform: 'VMware', vlan: '101', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmwaretesting', vmCount: 12, id: 641, portGroup: 'DSwitch-01-DVUplinks-24' },
    { port: 'DVS', platform: 'VMware', vlan: '101', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'VmwareNewPass', vmCount: 12, id: 643, portGroup: 'DSwitch-01-DVUplinks-24' },
    { port: 'DVS', platform: 'VMware', vlan: '0', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'VmwareNewPass', vmCount: 12, id: 644, portGroup: 'DPortGroup' },
    { port: 'DVS', platform: 'VMware', vlan: '0', nicTeamStatus: 'Healthy', datacenter: 'DC3', accountName: 'Vmware_New', vmCount: 12, id: 637, portGroup: 'DPortGroup' }
  ],
  statusBreakdown: {
    Healthy: 44,
    Warning: 0,
    Critical: 0
  },
  typeBreakdown: {
    DVS: 39,
    'Standard Network': 5
  },
  totalVmsAttached: 256
};

const PERFORMANCE_HOTSPOTS_SAMPLE: PerformanceHotspots = {
  count: 8,
  next: null,
  previous: null,
  results: [
    {
      name: '02.unity-lab-lnx-vm11',
      uuid: '34da8778-d4d4-402c-9a99-76b753ca949e',
      os: 'Ubuntu Linux (64-bit)',
      cpuUtilization: { current: 11.6, sparkline: [39.43, 8.0, 12.09, 14.26, 9.21, 8.43, 8.7] },
      memoryUtilization: { current: 38.8, sparkline: [36.66, 34.45, 40.93, 41.55, 44.25, 35.33, 37.97] },
      storageUtilization: { capacity: 0, used: 0, free: 0, percentage: 0 },
      uptime: '120d',
      networkSpeed: { displayValue: '0.0 B/s', value: 0.0, percentage: 0.0 },
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    }
  ],
  topUtilization: [
    {
      name: '02.unity-lab-lnx-vm11',
      cpuUtilization: { current: 6.9, sparkline: [7.08, 40.6, 8.05, 12.25, 14.2, 8.95, 8.2] },
      memoryUtilization: { current: 37.4, sparkline: [32.58, 36.87, 36.9, 39.84, 41.29, 42.67, 36.9] },
      storageUtilization: { capacity: 0, used: 0, free: 0, percentage: 0 },
      networkSpeed: { displayValue: '0.0 B/s', percentage: 0, value: 0 },
      uptime: '116d',
      uuid: '34da8778-d4d4-402c-9a99-76b753ca949e',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    },
    {
      name: '04.unity-lab-Win-vm1',
      cpuUtilization: { current: 6.21, sparkline: [7.65, 7.87, 8.03, 6.53, 6.74, 6.9, 7.09] },
      memoryUtilization: { current: 58.69, sparkline: [57.49, 58.16, 58.87, 59.07, 57.92, 57.92, 58.53] },
      storageUtilization: { capacity: 59, used: 15, free: 43, percentage: 26 },
      networkSpeed: { displayValue: '24.56 KB/s', percentage: 0, value: 25152 },
      uptime: '220d',
      uuid: 'c1b6dc93-0372-4ff9-9b69-49bfa55f80cb',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    },
    {
      name: '12.UL-WIN2019-VM03',
      cpuUtilization: { current: 5.59, sparkline: [13.13, 14.58, 11.67, 6.59, 6.81, 6.69, 6.64] },
      memoryUtilization: { current: 55.95, sparkline: [51.86, 52.14, 53.33, 55.02, 55.28, 55.51, 55.71] },
      storageUtilization: { capacity: 39, used: 10, free: 28, percentage: 27 },
      networkSpeed: { displayValue: '17.92 KB/s', percentage: 0, value: 18352 },
      uptime: '220d',
      uuid: '1bee87d9-d4c8-4116-8760-53365abb4088',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    },
    {
      name: '03.unity-lab-lnx-ubuntu-vm3',
      cpuUtilization: { current: 5.12, sparkline: [7.48, 9.34, 5.68, 6.07, 5.66, 5.69, 6.22] },
      memoryUtilization: { current: 89.64, sparkline: [73.45, 73.17, 73.14, 77.7, 73.34, 72.79, 86.28] },
      storageUtilization: { capacity: 95, used: 78, free: 17, percentage: 81 },
      networkSpeed: { displayValue: '100.63 KB/s', percentage: 0, value: 103048 },
      uptime: '176d',
      uuid: 'd6945ffb-523a-4465-8ba5-a2feb7460c05',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    },
    {
      name: '10.UL-WIN2019-VM01',
      cpuUtilization: { current: 0, sparkline: [16.28, 19.7, 15.17, null, null, null, null] },
      memoryUtilization: { current: 0, sparkline: [49.9, 50.1, 50.42, null, null, null, null] },
      storageUtilization: { capacity: 0, used: 0, free: 0, percentage: 0 },
      networkSpeed: { displayValue: '0.0 B/s', percentage: 0, value: 0 },
      uptime: 'N/A',
      uuid: 'a5476b88-9251-499b-bdf0-755800e0e405',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    },
    {
      name: '01.unity-lab-lnx-vm1',
      cpuUtilization: { current: 0, sparkline: [] },
      memoryUtilization: { current: 0, sparkline: [] },
      storageUtilization: { capacity: 0, used: 0, free: 0, percentage: 0 },
      networkSpeed: { displayValue: '0.0 B/s', percentage: 0, value: 0 },
      uptime: 'N/A',
      uuid: '1b7a133f-519f-4011-96db-c3dc9ac21eaf',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    },
    {
      name: '05.unity-lab-Win-vm3',
      cpuUtilization: { current: 0, sparkline: [] },
      memoryUtilization: { current: 0, sparkline: [] },
      storageUtilization: { capacity: 0, used: 0, free: 0, percentage: 0 },
      networkSpeed: { displayValue: '0.0 B/s', percentage: 0, value: 0 },
      uptime: 'N/A',
      uuid: '26dd9f1d-32d4-4d71-bb52-d0dd276f10cc',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    },
    {
      name: '11.UL-WIN2019-VM02',
      cpuUtilization: { current: 0, sparkline: [] },
      memoryUtilization: { current: 0, sparkline: [] },
      storageUtilization: { capacity: 0, used: 0, free: 0, percentage: 0 },
      networkSpeed: { displayValue: '0.0 B/s', percentage: 0, value: 0 },
      uptime: 'N/A',
      uuid: 'cf9e7204-b09a-4823-9bf4-dea2dcefb828',
      deviceType: 'Virtual Machine',
      vmSubType: 'Vmware'
    }
  ]
};

const PERFORMANCE_HOTSPOTS_CHART_SAMPLE: PerformanceHotspotsChartsResponse = {
  topCpuVsMemory: [
    {
      name: '02.unity-lab-lnx-vm11',
      uuid: '34da8778-d4d4-402c-9a99-76b753ca949e',
      cpuUtilization: 11.6,
      memoryUtilization: 38.8
    },
    {
      name: '03.unity-lab-lnx-ubuntu-vm3',
      uuid: 'd6945ffb-523a-4465-8ba5-a2feb7460c05',
      cpuUtilization: 7.7,
      memoryUtilization: 91.08
    }
  ],
  topStorageUtilization: [
    {
      name: '03.unity-lab-lnx-ubuntu-vm3',
      uuid: 'd6945ffb-523a-4465-8ba5-a2feb7460c05',
      capacity: 95,
      used: 77,
      percentage: 80
    },
    {
      name: '12.UL-WIN2019-VM03',
      uuid: '1bee87d9-d4c8-4116-8760-53365abb4088',
      capacity: 39,
      used: 10,
      percentage: 27
    }
  ]
};

const PERFORMANCE_WORKLOAD_SAMPLE: PerformanceWorkloadDataType = {
  count: 278,
  results: [
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '01.unity-lab-lnx-vm1', accountName: 'Vmwaretesting', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: '1b7a133f-519f-4011-96db-c3dc9ac21eaf' },
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '01.unity-lab-lnx-vm1', accountName: 'VmwareNewPass', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: '8867a29d-beb1-4998-85ca-83e172010128' },
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '01.unity-lab-lnx-vm1', accountName: 'Vmware_New', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: 'd3545508-d052-4b42-9245-174e1d6e5478' },
    { status: 'Warning', platform: 'VMware', cpuReadyPct: 0, name: '02.unity-lab-lnx-vm11', accountName: 'Vmware_New', diskThroughputKbps: 46572590974.51, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 135.05, uuid: '34da8778-d4d4-402c-9a99-76b753ca949e' },
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '02.unity-lab-lnx-vm11', accountName: 'Vmwaretesting', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: '34beceab-aecf-4f28-a7ec-e32318b1d1e5' },
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '02.unity-lab-lnx-vm11', accountName: 'VmwareNewPass', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: '35ce1d7b-91e1-4e4f-b136-3f3a749fdf54' },
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '03.unity-lab-lnx-ubuntu-vm3', accountName: 'Vmwaretesting', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: '95190ff0-ffe7-4b02-9556-6c9ddda3462b' },
    { status: 'Critical', platform: 'VMware', cpuReadyPct: 0, name: '03.unity-lab-lnx-ubuntu-vm3', accountName: 'Vmware_New', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 1124.7, uuid: 'd6945ffb-523a-4465-8ba5-a2feb7460c05' },
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '03.unity-lab-lnx-ubuntu-vm3', accountName: 'VmwareNewPass', diskThroughputKbps: 0, osType: 'Ubuntu Linux (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: 'b9c6af82-f407-4433-b369-5e13ac0fdc71' },
    { status: 'Healthy', platform: 'VMware', cpuReadyPct: 0, name: '04.unity-lab-Win-vm1', accountName: 'Vmwaretesting', diskThroughputKbps: 0, osType: 'Microsoft Windows Server 2016 or later (64-bit)', platformGroup: 'VMware', memorySwapMb: 0, uuid: 'b73804a5-d5b5-4b69-82c8-f1794d1470de' }
  ],
  diskThroughputTop10: [
    { platformGroup: 'VMware', name: '02.unity-lab-lnx-vm11', value: 46572590974.51, uuid: '34da8778-d4d4-402c-9a99-76b753ca949e' },
    { platformGroup: 'VMware', name: 'unity-lab-lnx-upc-ztc', value: 92, uuid: '8fd64659-6c75-4ff4-9e09-7b7c0dce404d' },
    { platformGroup: 'VMware', name: 'WebServer01', value: 50, uuid: 'e0d12e29-f532-488f-8b1b-64daa291b4c3' },
    { platformGroup: 'VMware', name: 'Netpicker-offsite-poc', value: 31, uuid: '397b5db0-6acd-495a-a500-db15c9bfdfec' },
    { platformGroup: 'VMware', name: 'TestVM456', value: 30, uuid: 'f434b1af-20ff-4d14-9f45-248eea0bcdf6' },
    { platformGroup: 'VMware', name: '01.unity-lab-lnx-vm1', value: 0, uuid: '1b7a133f-519f-4011-96db-c3dc9ac21eaf' },
    { platformGroup: 'VMware', name: '01.unity-lab-lnx-vm1', value: 0, uuid: '8867a29d-beb1-4998-85ca-83e172010128' },
    { platformGroup: 'VMware', name: '01.unity-lab-lnx-vm1', value: 0, uuid: 'd3545508-d052-4b42-9245-174e1d6e5478' },
    { platformGroup: 'VMware', name: '02.unity-lab-lnx-vm11', value: 0, uuid: '34beceab-aecf-4f28-a7ec-e32318b1d1e5' },
    { platformGroup: 'VMware', name: '02.unity-lab-lnx-vm11', value: 0, uuid: '35ce1d7b-91e1-4e4f-b136-3f3a749fdf54' }
  ],
  cpuReadyVsSwap: [
    { platform: 'VMware', platformGroup: 'VMware', name: '02.unity-lab-lnx-vm11', memorySwapMb: 135.05, cpuReadyPct: 0 },
    { platform: 'VMware', platformGroup: 'VMware', name: 'unity-lab-lnx-upc-ztc', memorySwapMb: 0, cpuReadyPct: 1.33 },
    { platform: 'VMware', platformGroup: 'VMware', name: 'WebServer01', memorySwapMb: 0, cpuReadyPct: 0.14 },
    { platform: 'VMware', platformGroup: 'VMware', name: 'Netpicker-offsite-poc', memorySwapMb: 0, cpuReadyPct: 0.13 },
    { platform: 'VMware', platformGroup: 'VMware', name: 'TestVM456', memorySwapMb: 0, cpuReadyPct: 0.11 },
    { platform: 'VMware', platformGroup: 'VMware', name: '01.unity-lab-lnx-vm1', memorySwapMb: 0, cpuReadyPct: 0 },
    { platform: 'VMware', platformGroup: 'VMware', name: '01.unity-lab-lnx-vm1', memorySwapMb: 0, cpuReadyPct: 0 },
    { platform: 'VMware', platformGroup: 'VMware', name: '01.unity-lab-lnx-vm1', memorySwapMb: 0, cpuReadyPct: 0 },
    { platform: 'VMware', platformGroup: 'VMware', name: '02.unity-lab-lnx-vm11', memorySwapMb: 0, cpuReadyPct: 0 },
    { platform: 'VMware', platformGroup: 'VMware', name: '02.unity-lab-lnx-vm11', memorySwapMb: 0, cpuReadyPct: 0 }
  ],
  statusBreakdown: { Healthy: 276, Warning: 1, Critical: 1 }
};

const NEWLY_PROVISIONED_VMS_SAMPLE: NewlyProvisionedVmsResponse = {
  count: 278,
  next: 'sample-next-page',
  previous: null,
  results: [
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:43.358323+00:00', id: 41071, stage: 'NA', provisioned: '2026-09-25T10:03:43.361275+00:00', uuid: '5f5ad504-488d-4141-9c05-a338ab1854cd', name: 'unity-lab-lnx-ztc', platform: 'VMware', state: 'up', cloudAcct: 'VmwareNewPass', os: 'Ubuntu Linux (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:43.282306+00:00', id: 41070, stage: 'NA', provisioned: '2026-09-25T10:03:43.285367+00:00', uuid: '61d6388b-e5cd-45fd-8e7b-1095214efb78', name: 'unity-lab-lnx-vm5', platform: 'VMware', state: 'down', cloudAcct: 'VmwareNewPass', os: 'Ubuntu Linux (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:43.201566+00:00', id: 41069, stage: 'NA', provisioned: '2026-09-25T10:03:43.205191+00:00', uuid: 'b30bc278-14ef-4982-9418-94f0cc90dce2', name: 'UL-UNITY-LAB-VC', platform: 'VMware', state: 'up', cloudAcct: 'VmwareNewPass', os: 'VMware Photon OS (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:43.122118+00:00', id: 41068, stage: 'NA', provisioned: '2026-09-25T10:03:43.125479+00:00', uuid: 'c36f7cff-7ab6-48e6-bd32-6955a30de442', name: 'unity-lab-lnx-ubuntu-vm1', platform: 'VMware', state: 'down', cloudAcct: 'VmwareNewPass', os: 'Ubuntu Linux (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:43.045950+00:00', id: 41067, stage: 'NA', provisioned: '2026-09-25T10:03:43.048917+00:00', uuid: '060158d1-df6b-4e73-8786-d805c74e9f5f', name: 'unity-lab-lnx-vm6', platform: 'VMware', state: 'down', cloudAcct: 'VmwareNewPass', os: 'Ubuntu Linux (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:42.892527+00:00', id: 41065, stage: 'NA', provisioned: '2026-09-25T10:03:42.895412+00:00', uuid: '2f1bff94-ee94-4086-83e6-910561717091', name: 'unity-lab-lnx-vm7', platform: 'VMware', state: 'down', cloudAcct: 'VmwareNewPass', os: 'Ubuntu Linux (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:42.581911+00:00', id: 41061, stage: 'NA', provisioned: '2026-09-25T10:03:42.584839+00:00', uuid: '851d66d7-abf7-4f68-9278-c9b4f0a26738', name: '06.unity-lab-Win-vm4', platform: 'VMware', state: 'up', cloudAcct: 'VmwareNewPass', os: 'Microsoft Windows Server 2016 or later (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:42.482940+00:00', id: 41060, stage: 'NA', provisioned: '2026-09-25T10:03:42.485833+00:00', uuid: 'a386d4d1-1887-4bfc-999b-7390e35d1440', name: '04.unity-lab-Win-vm1', platform: 'VMware', state: 'up', cloudAcct: 'VmwareNewPass', os: 'Microsoft Windows Server 2016 or later (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:42.403290+00:00', id: 41059, stage: 'NA', provisioned: '2026-09-25T10:03:42.406463+00:00', uuid: '6c9f623d-9cb1-48da-a860-fe5494d9b28a', name: 'unity-lab-k8-SNode1', platform: 'VMware', state: 'down', cloudAcct: 'VmwareNewPass', os: 'Ubuntu Linux (64-bit)' },
    { status: 'NA', lastDiscovered: '2026-09-25T10:03:42.329596+00:00', id: 41058, stage: 'NA', provisioned: '2026-09-25T10:03:42.332562+00:00', uuid: 'ba1c07de-5ffe-4ef4-91cc-53391162b6f0', name: 'unity-lab-lnx-debian-vm2', platform: 'VMware', state: 'down', cloudAcct: 'VmwareNewPass', os: 'Debian GNU/Linux 10 (64-bit)' }
  ]
};

const NEWLY_PROVISIONED_VMS_CHART_SAMPLE: NewlyProvisionedVmsChartResponse = {
  count: 64,
  vmStateBreakdown: { down: 37, up: 27 },
  cloudAccountDistribution: [
    { platformGroup: 'VMware', value: 60, label: 'VmwareNewPass' },
    { platformGroup: 'VMware', value: 4, label: 'Vmwaretesting' }
  ],
  timeline: [
    { date: 'Sep 25', state: 'up', label: 'Netpicker-offsite-poc' },
    { date: 'Sep 25', state: 'up', label: 'WebServer01' },
    { date: 'Sep 25', state: 'up', label: 'TestVM456' },
    { date: 'Sep 25', state: 'up', label: 'unity-lab-lnx-upc-ztc' },
    { date: 'Sep 25', state: 'up', label: 'Netpicker-offsite-poc' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-ubuntu-vm5' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-rocky-vm2' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-ubuntu-vm7' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-centos-vm3' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm12' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-suse-vm2' },
    { date: 'Sep 25', state: 'up', label: '02.unity-lab-lnx-vm11' },
    { date: 'Sep 25', state: 'up', label: 'ul-demolab-f5-test-01' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-Win-vm12' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-Win-vm2' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm14' },
    { date: 'Sep 25', state: 'down', label: 'UL-WIN2022-VM01' },
    { date: 'Sep 25', state: 'down', label: 'UL-WIN11-VM02' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-centos-vm1' },
    { date: 'Sep 25', state: 'up', label: 'WebServer01' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm13' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-suse-vm1' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-ubuntu-vm4' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-centos-vm2' },
    { date: 'Sep 25', state: 'up', label: '03.unity-lab-lnx-ubuntu-vm3' },
    { date: 'Sep 25', state: 'up', label: '12.UL-WIN2019-VM03' },
    { date: 'Sep 25', state: 'up', label: 'unity-lab-Win-vm11' },
    { date: 'Sep 25', state: 'up', label: '08.unity-lab-lnx-rocky-vm1' },
    { date: 'Sep 25', state: 'down', label: 'UL-WIN11-VM01' },
    { date: 'Sep 25', state: 'up', label: '10.UL-WIN2019-VM01' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-Win-vm13' },
    { date: 'Sep 25', state: 'up', label: '07.Unity-VM-Veeam01' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-ubuntu-vm6' },
    { date: 'Sep 25', state: 'up', label: '11.UL-WIN2019-VM02' },
    { date: 'Sep 25', state: 'down', label: 'UL-WIN2022-VM02' },
    { date: 'Sep 25', state: 'down', label: 'ul-test-log-metrics01_Clone_replica' },
    { date: 'Sep 25', state: 'down', label: 'alpha-collector-MTPdemo1_New01' },
    { date: 'Sep 25', state: 'up', label: 'ul-demolab-f5-test-02' },
    { date: 'Sep 25', state: 'up', label: 'TestVM456' },
    { date: 'Sep 25', state: 'up', label: 'unity-lab-lnx-upc-ztc' },
    { date: 'Sep 25', state: 'up', label: 'ul-BankOfAnthos-app01' },
    { date: 'Sep 25', state: 'up', label: 'ul-easy-trade-app01' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-debian-vm3' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm9' },
    { date: 'Sep 25', state: 'up', label: 'unity-lab-lnx-alpha-ztc' },
    { date: 'Sep 25', state: 'up', label: '05.unity-lab-Win-vm3' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-debian-vm1' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-k8-SNode2' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-k8-Master' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-Win-vm5' },
    { date: 'Sep 25', state: 'up', label: '01.unity-lab-lnx-vm1' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm8' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm4' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm10' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-debian-vm2' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-k8-SNode1' },
    { date: 'Sep 25', state: 'up', label: '04.unity-lab-Win-vm1' },
    { date: 'Sep 25', state: 'up', label: '06.unity-lab-Win-vm4' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm7' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm6' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-ubuntu-vm1' },
    { date: 'Sep 25', state: 'up', label: 'UL-UNITY-LAB-VC' },
    { date: 'Sep 25', state: 'down', label: 'unity-lab-lnx-vm5' },
    { date: 'Sep 25', state: 'up', label: 'unity-lab-lnx-ztc' }
  ]
};

const RECENT_ALERTS_SAMPLE: RecentAlerts = {
  count: 5,
  recentAlerts: [
    { id: 3727825, uuid: '3727825', severity: 'Warning', description: 'Linux by SSH - Complete: Memory utilization warning on ul-easy-trade-app01', deviceName: 'ul-easy-trade-app01', duration: '1m ago', source: 'Zabbix', acknowledged: 'No', status: 'Open' },
    { id: 3727214, uuid: '3727214', severity: 'Critical', description: 'No WinRM data from 05.unity-lab-Win-vm3-UnityOne-CIS-COE for 15m', deviceName: '05.unity-lab-Win-vm3', duration: '1h ago', source: 'WinRM', acknowledged: 'No', status: 'Open' },
    { id: 3727205, uuid: '3727205', severity: 'Warning', description: 'High CPU utilization (> 90%) for 10m on 11.UL-WIN2019-VM02', deviceName: '11.UL-WIN2019-VM02', duration: '1h ago', source: 'Zabbix', acknowledged: 'Yes', status: 'Open' },
    { id: 3727204, uuid: '3727204', severity: 'Information', description: "Service restarted: 'W32Time' on 12.UL-WIN2019-VM03", deviceName: '12.UL-WIN2019-VM03', duration: '1h ago', source: 'Zabbix', acknowledged: 'Yes', status: 'Open' },
    { id: 3727193, uuid: '3727193', severity: 'Warning', description: 'Disk space low (< 15% free) on /dev/sda1 on 04.unity-lab-Win-vm1', deviceName: '04.unity-lab-Win-vm1', duration: '1h ago', source: 'Zabbix', acknowledged: 'No', status: 'Open' }
  ],
  alertSummary: {
    critical: 18,
    warning: 31,
    information: 8592,
    total: 8641
  },
  severityDistribution: {
    critical: 18,
    warning: 31,
    information: 8592,
    total: 8641
  },
  topDevicesByAlertFrequency: [
    { deviceName: 'ul-easy-trade-app01', count: 42 },
    { deviceName: '05.unity-lab-Win-vm3', count: 31 },
    { deviceName: '11.UL-WIN2019-VM02', count: 28 },
    { deviceName: '12.UL-WIN2019-VM03', count: 19 },
    { deviceName: '04.unity-lab-Win-vm1', count: 15 }
  ]
};

const AUTO_REMEDIATION_SUMMARY_SAMPLE: AutoRemediationSummaryResponse = {
  autoRemediations: 226,
  totalRuns: 226,
  successfulRuns: 208,
  failedRuns: 18,
  runningRuns: 0,
  runbookSuccessPct: 92.0,
  runbookFailurePct: 8.0,
  avgDurationMinutes: 5.8,
  avgMttr: '5.8m',
  topAutoRemediationActions: [
    { name: 'Restart Service', count: 86 },
    { name: 'vMotion Rebalance', count: 58 },
    { name: 'Revoke Firewall Rule', count: 42 },
    { name: 'Snapshot Cleanup', count: 26 },
    { name: 'Disk Resize', count: 14 }
  ],
  configuredCount: 12
};

const VM_PROVISIONING_SUMMARY_SAMPLE: VmProvisioningSummaryResponse = {
  vmsProvisioned: 22,
  reachableCount: 19,
  unreachableCount: 3,
  reachableRatePct: 86.4,
  unreachableRatePct: 13.6,
  avgProvisioningTime: '4.6m',
  reachability: {
    reachable: 19,
    unreachable: 3,
    reachablePct: 86.4,
    unreachablePct: 13.6
  },
  provisioningTrend: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    provisioned: [4, 6, 5, 7],
    decommissioned: [0, 1, 1, 1],
    totalProvisioned: 22,
    totalDecommissioned: 3
  },
  vmsByCloudAccount: [
    { label: 'Global Dev Lab', value: 6, platformGroup: 'VMware' },
    { label: 'Shared Services', value: 3, platformGroup: 'Nutanix' },
    { label: 'DR Ops', value: 1, platformGroup: 'Hyper-V' }
  ]
};

const ORPHANED_DEVICES_SAMPLE: OrphanedResourcesResponse = {
  count: 40,
  next: 'sample-next-page',
  previous: 'sample-previous-page',
  results: [
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-debian-vm3', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Debian GNU/Linux 10 (64-bit)', id: 40519, uuid: '0325654d-f0d5-4ed5-8d04-1d5d1b7628fb', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-rocky-vm2', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Red Hat Enterprise Linux 8 (64-bit)', id: 40515, uuid: '55d64a26-921b-4e14-9e4c-2c27cfd94e08', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-suse-vm1', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'SUSE Linux Enterprise 15 (64-bit)', id: 40496, uuid: '05761929-e79c-47fd-9e86-db7a46054793', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-suse-vm2', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'SUSE Linux Enterprise 15 (64-bit)', id: 40507, uuid: 'd237e051-2e8e-4c83-a04d-c0e81156f52d', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-ubuntu-vm1', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Ubuntu Linux (64-bit)', id: 40548, uuid: '3667baad-3631-41c6-b126-1651373d2e5a', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-ubuntu-vm4', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Ubuntu Linux (64-bit)', id: 40494, uuid: '0592d0c6-fc77-49e6-9e36-829626c6444d', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-ubuntu-vm5', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Ubuntu Linux (64-bit)', id: 40516, uuid: '9d48f3c3-5fe4-4a5b-8ae3-05a3b227c8b9', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-ubuntu-vm6', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Ubuntu Linux (64-bit)', id: 40495, uuid: '53baa333-0914-490c-b84f-5831e55016a0', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-ubuntu-vm7', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Ubuntu Linux (64-bit)', id: 40513, uuid: '8a252d3f-38d6-4d19-82a2-57d918af38c9', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' },
    { lifecycleStage: 'Retired', lifecycleStatus: 'In Use', status: 'Retired', name: 'unity-lab-lnx-vm10', stillMonitored: false, lastSeen: '25 Sep 2026 09:59', osType: 'Ubuntu Linux (64-bit)', id: 40534, uuid: '4ad6c556-aa85-43fa-896b-6752b6bf445a', datacenter: 'DC3', daysSinceStageChange: 2, accountName: 'Vmwaretesting', platform: 'VMware' }
  ],
  chartData: {
    byLifecycleStage: { Retired: 40, Disposed: 0, Deleted: 0, Donated: 0 },
    byOsType: { Linux: 32, Windows: 8 },
    byDaysSinceStageChange: [
      { label: '0-30d', count: 39 },
      { label: '30-90d', count: 1 },
      { label: '90d+', count: 0 }
    ],
    byDatacenter: [
      { label: 'DC3', count: 40 }
    ]
  }
};

const VM_BACKUP_STATUS_SAMPLE: VmBackupStatusResponse = {
  count: 1247,
  next: '.../vm_backup_status/?page=2',
  previous: null,
  results: [
    {
      id: 41349,
      uuid: '10c7e03d-7d2c-4b33-86ba-66c4a23fc955',
      vmName: 'sdxdcwWIN19LOGSHIPPINGVM2Jaisy',
      osType: 'Windows',
      platform: 'VMware',
      accountName: 'SDX Lab - VCenter',
      jobName: 'sdxdcwWIN19LOGSHIPPINGVM2Jaisy_BkpJob',
      status: 'Success',
      lastBackupTime: '2026-08-12T12:31:02.045058+00:00',
      ageBucket: '> 7 days',
      restorePoints: 101,
      oldestRestorePoint: 49,
      backupSizeGb: 0.0,
      repository: 'PureFlashBlade'
    }
  ]
};

const VM_BACKUP_STATUS_CHART_SAMPLE: VmBackupStatusChartsResponse = {
  protectedVsUnprotected: { protected: 124, unprotected: 1123, total: 1247 },
  backupAgeDistribution: {
    '< 24 hrs': 0,
    '1-3 days': 0,
    '4-7 days': 0,
    '> 7 days': 124,
    Unprotected: 1123
  },
  repositoryCapacity: [
    { repository: 'PureFlashBlade', capacityGb: null, usedGb: 0.0, usedPct: null },
    { repository: 'PureFlashBlade153', capacityGb: null, usedGb: 0.0, usedPct: null }
  ],
  jobSuccessRateTrend: {
    labels: ['Aug 30', 'Sep 04', 'Sep 09', 'Sep 14', 'Sep 19', 'Sep 24'],
    successRate: [0, 0, 0, 0, 0, 0]
  },
  restorePointSprawl: [
    { vmName: 'sdxdcwWIN19LOGSHIPPINGVM2Jaisy', oldestDays: 49 },
    { vmName: 'sdxdclOracleFPPServer', oldestDays: 49 }
  ]
};

const HYPERVISOR_VERSION_COMPLIANCE_SAMPLE: HypervisorVersionComplianceResponse = {
  count: 10,
  next: null,
  previous: null,
  results: [
    { id: 201, uuid: 'a1b2c3d4-1111-4222-8333-abcdef123456', host: 'ul-sv1-unit-01', platform: 'VMware', platformGroup: 'VMware', accountName: 'UnityOne-CorpIT', currentVersion: 'ESXi 7.0 U2', latestVersion: 'ESXi 8.0 U3', versionGap: 'N-3', compliance: 'Non-Compliant' },
    { id: 202, uuid: 'b2c3d4e5-2222-4333-9444-bcdef2345678', host: 'ul-sv1-unit-02', platform: 'VMware', platformGroup: 'VMware', accountName: 'UnityOne-CorpIT', currentVersion: 'ESXi 8.0 U2', latestVersion: 'ESXi 8.0 U3', versionGap: 'N-1', compliance: 'Compliant' },
    { id: 203, uuid: 'c3d4e5f6-3333-4444-a555-cdef34567890', host: 'ul-sv1-unit-03', platform: 'Nutanix', platformGroup: 'Nutanix', accountName: 'UnityOne-DevOps', currentVersion: 'AHV 20230302', latestVersion: 'AHV 20230302', versionGap: 'N', compliance: 'Compliant' },
    { id: 204, uuid: 'd4e5f6a7-4444-4555-b666-def456789012', host: 'ul-sv1-unit-04', platform: 'Microsoft Hyper-V', platformGroup: 'Hyper-V', accountName: 'UnityOne-SharedSvcs', currentVersion: 'Server 2019', latestVersion: 'Server 2022', versionGap: 'N-1', compliance: 'Warning' },
    { id: 205, uuid: 'e5f6a7b8-5555-4666-c777-ef5678901234', host: 'ul-sv1-unit-05', platform: 'Nutanix', platformGroup: 'Nutanix', accountName: 'UnityOne-DevOps', currentVersion: 'AHV 20220304', latestVersion: 'AHV 20230302', versionGap: 'N-2', compliance: 'Warning' },
    { id: 206, uuid: 'f6a7b8c9-6666-4777-d888-f67890123456', host: 'ul-sv1-unit-06', platform: 'VMware', platformGroup: 'VMware', accountName: 'UnityOne-CorpIT', currentVersion: 'ESXi 8.0 U3', latestVersion: 'ESXi 8.0 U3', versionGap: 'N', compliance: 'Compliant' },
    { id: 207, uuid: 'a7b8c9d0-7777-4888-e999-078901234567', host: 'ul-sv1-unit-07', platform: 'Nutanix', platformGroup: 'Nutanix', accountName: 'UnityOne-DevOps', currentVersion: 'AHV 20230302', latestVersion: 'AHV 20230302', versionGap: 'N', compliance: 'Compliant' },
    { id: 208, uuid: 'b8c9d0e1-8888-4999-f000-189012345678', host: 'ul-sv1-unit-08', platform: 'VMware', platformGroup: 'VMware', accountName: 'UnityOne-CorpIT', currentVersion: 'ESXi 7.0 U3', latestVersion: 'ESXi 8.0 U3', versionGap: 'N-2', compliance: 'Warning' },
    { id: 209, uuid: 'c9d0e1f2-9999-4aaa-b111-290123456789', host: 'ul-sv1-unit-09', platform: 'Microsoft Hyper-V', platformGroup: 'Hyper-V', accountName: 'UnityOne-SharedSvcs', currentVersion: 'Server 2022', latestVersion: 'Server 2022', versionGap: 'N', compliance: 'Compliant' },
    { id: 210, uuid: 'd0e1f2a3-aaaa-4bbb-c222-301234567890', host: 'ul-sv1-unit-10', platform: 'Nutanix', platformGroup: 'Nutanix', accountName: 'UnityOne-DevOps', currentVersion: 'AHV 20220304', latestVersion: 'AHV 20230302', versionGap: 'N-2', compliance: 'Warning' }
  ]
};

const HYPERVISOR_VERSION_COMPLIANCE_CHART_SAMPLE: HypervisorVersionComplianceChartsResponse = {
  totalHosts: 10,
  complianceBreakdown: {
    Compliant: 5,
    Warning: 4,
    'Non-Compliant': 1
  },
  byPlatform: [
    { platformGroup: 'VMware', total: 4, compliant: 2, warning: 1, nonCompliant: 1 },
    { platformGroup: 'Nutanix', total: 4, compliant: 2, warning: 2, nonCompliant: 0 },
    { platformGroup: 'Hyper-V', total: 2, compliant: 1, warning: 1, nonCompliant: 0 }
  ]
};

@Injectable()
export class PrivateCloudComputeDashboardService {

  constructor(
    private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }

  private convertFiltersToParams(criteria?: FiltersCriteriaType): HttpParams {
    let params: HttpParams = new HttpParams();
    params = this.appendMultiValueParam(params, 'platform', criteria?.platforms);
    params = this.appendMultiValueParam(params, 'datacenter', criteria?.datacenters);
    params = this.appendMultiValueParam(params, 'environment', criteria?.environments);
    params = this.appendMultiValueParam(params, 'account', criteria?.accounts);
    if (criteria?.timeRange) {
      // Map the dropdown period to the exact backend value where they differ (e.g. last_24_hours -> last_24_hrs).
      params = params.set('time_range', PRIVATE_CLOUD_TIME_RANGE_PARAM_MAP[criteria.timeRange] || criteria.timeRange);
    }
    if (criteria?.startDate) {
      params = params.set('start_datetime', criteria.startDate);
    }
    if (criteria?.endDate) {
      params = params.set('end_datetime', criteria.endDate);
    }
    return params;
  }

  private appendMultiValueParam(params: HttpParams, key: string, values?: string[]): HttpParams {
    (values || []).forEach(value => {
      if (value && value !== 'All') {
        params = params.append(key, value);
      }
    });
    return params;
  }

  getHeaderInfo(): Observable<TopHeaderDataType> {
    return this.http.get<TopHeaderDataType>(PRIVATE_CLOUD_DASHBOARD_HEADER_ENDPOINT);
  }

  getFilterDropdowns(): Observable<any> {
    return this.http.get<any>(PRIVATE_CLOUD_FILTERS_ENDPOINT);
  }

  buildFilterForm(
    platforms: string[] = [],
    datacenters: string[] = [],
    environments: string[] = [],
    accounts: string[] = []
  ): FormGroup {
    return this.builder.group({
      platforms: [platforms],
      datacenters: [datacenters],
      environments: [environments],
      accounts: [accounts],
      // Global Time Range - patched by the component's dropdown; read via getRawValue() by every widget.
      timeRange: [PRIVATE_CLOUD_TIME_RANGE_DEFAULT],
      startDate: [''],
      endDate: ['']
    });
  }

  //Executive summary widget
  getExecutiveSummaryWidgetData(filters: FiltersCriteriaType): Observable<ExecutiveSummaryWidgetType> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<ExecutiveSummaryWidgetType>(PRIVATE_CLOUD_EXECUTIVE_SUMMARY_ENDPOINT, { params });
  }

  getPrivateCloudInventoryData(filters: FiltersCriteriaType): Observable<PrivateCloudInventoryResponse> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<PrivateCloudInventoryResponse>(PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT, { params });
  }

  getPrivateCloudGeoDistributionData(filters: FiltersCriteriaType): Observable<PrivateCloudGeoDistributionResponse> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<PrivateCloudGeoDistributionResponse>(PRIVATE_CLOUD_GEO_DISTRIBUTION_ENDPOINT, { params });
  }

  convertToPrivateCloudInventoryViewData(data: PrivateCloudInventoryResponse): PrivateCloudInventoryCardViewData[] {
    const inventoryData = data as { [key: string]: PrivateCloudInventoryProviderResources | number };

    return this.getPrivateCloudInventoryProviderKeys(data)
      .map(key => this.convertToPrivateCloudInventoryCard(key, inventoryData[key] as PrivateCloudInventoryProviderResources))
      .filter((card): card is PrivateCloudInventoryCardViewData => !!card);
  }

  getPrivateCloudInventoryTotalResources(data: PrivateCloudInventoryResponse): number {
    const inventoryData = data as { [key: string]: PrivateCloudInventoryProviderResources | number };
    const computedTotal = this.getPrivateCloudInventoryProviderKeys(data)
      .reduce((total, key) => total + ((inventoryData[key] as PrivateCloudInventoryProviderResources)?.total_resources || 0), 0);

    return computedTotal || data?.total_resources || 0;
  }

  private getPrivateCloudInventoryProviderKeys(data: PrivateCloudInventoryResponse): string[] {
    const inventoryData = data as { [key: string]: PrivateCloudInventoryProviderResources | number };

    return Object.keys(data || {})
      .filter(key => key !== 'total_resources' && typeof inventoryData[key] === 'object');
  }

  private convertToPrivateCloudInventoryCard(
    key: string,
    resources: PrivateCloudInventoryProviderResources
  ): PrivateCloudInventoryCardViewData | null {
    if (!resources || !this.hasPrivateCloudInventoryResources(resources)) {
      return null;
    }

    return {
      key,
      title: this.getPrivateCloudInventoryProviderTitle(key),
      accentClass: this.getPrivateCloudInventoryAccentClass(key),
      totalResources: resources.total_resources || 0,
      resources: this.convertToPrivateCloudInventoryResources(resources)
    };
  }

  private convertToPrivateCloudInventoryResources(
    resources: PrivateCloudInventoryProviderResources
  ): PrivateCloudInventoryResourceViewData[] {
    return Object.keys(resources || {})
      .filter(key => key !== 'total_resources')
      .map(key => ({
        key,
        label: this.getPrivateCloudInventoryResourceLabel(key),
        count: resources[key] || 0
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private hasPrivateCloudInventoryResources(resources: PrivateCloudInventoryProviderResources): boolean {
    return Object.keys(resources || {})
      .filter(key => key !== 'total_resources')
      .some(key => Number(resources[key] || 0) > 0);
  }

  private getPrivateCloudInventoryProviderTitle(key: string): string {
    const titles: { [key: string]: string } = {
      vmware: 'VMware',
      nutanix: 'Nutanix',
      hyperv: 'Microsoft Hyper-V',
      proxmox: 'Proxmox',
      openstack: 'OpenStack',
      vcloud: 'vCloud',
      custom: 'Custom'
    };

    return titles[key] || this.getPrivateCloudInventoryResourceLabel(key);
  }

  private getPrivateCloudInventoryResourceLabel(key: string): string {
    const labels: { [key: string]: string } = {
      baremetal: 'Baremetal',
      clusters: 'Clusters',
      custom: 'Custom',
      database: 'Database',
      datastores: 'Datastores',
      disks: 'Disks',
      distributed_switches: 'Distributed Switches',
      firewall: 'Firewall',
      hosts: 'Physical Hosts',
      hypervisor: 'Hypervisor',
      load_balancer: 'Load Balancer',
      mac_device: 'Mac Device',
      networks: 'Networks',
      port_groups: 'Port Groups / VLANs',
      servers: 'Servers',
      storage: 'Storage',
      storage_containers: 'Storage Containers',
      storage_pools: 'Storage Pools',
      switch: 'Switch',
      virtual_disks: 'Virtual Disks',
      vm: 'VMs'
    };

    return labels[key] || key.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }

  private getPrivateCloudInventoryAccentClass(key: string): string {
    const accentClasses: { [key: string]: string } = {
      vmware: 'private-cloud-inventory-card--vmware',
      nutanix: 'private-cloud-inventory-card--nutanix',
      hyperv: 'private-cloud-inventory-card--hyperv',
      proxmox: 'private-cloud-inventory-card--proxmox',
      openstack: 'private-cloud-inventory-card--openstack',
      vcloud: 'private-cloud-inventory-card--vcloud',
      custom: 'private-cloud-inventory-card--custom'
    };

    return accentClasses[key] || 'private-cloud-inventory-card--custom';
  }

  convertToPrivateCloudGeoDistributionViewData(
    data: PrivateCloudGeoDistributionResponse
  ): PrivateCloudGeoDistributionViewData {
    const cells = this.convertToPrivateCloudGeoDistributionCells(data?.private_clouds || []);

    return {
      totalPrivateClouds: data?.total_private_clouds || cells.length,
      totalDatacenters: data?.total_datacenters || this.getUniqueDatacenterCount(cells),
      totalResources: data?.total_resources || cells.reduce((total, cell) => total + cell.totalResources, 0),
      totalAlerts: data?.total_alerts || cells.reduce((total, cell) => total + cell.totalAlerts, 0),
      platforms: this.convertToPrivateCloudGeoPlatformOptions(cells),
      cells
    };
  }

  convertToPrivateCloudGeoDistributionChartData(cells: PrivateCloudGeoDistributionCell[]): UnityChartDetails | null {
    if (!(cells || []).length) {
      return null;
    }

    const view = new UnityChartDetails();
    view.options = this.getPrivateCloudGeoDistributionOptions(cells);
    return view;
  }

  private convertToPrivateCloudGeoDistributionCells(items: any[]): PrivateCloudGeoDistributionCell[] {
    const normalizedItems = (items || [])
      .map(item => {
        const summary = item?.resources?.summary || {};
        const totalResources = Number(
          summary.total
          ?? item?.total_resources
          ?? this.getPrivateCloudGeoFlatResourceTotal(item)
          ?? 0
        );

        return {
          item,
          totalResources,
          platform: this.normalizePrivateCloudGeoPlatform(item?.platform_type)
        };
      })
      .filter(item => item.totalResources > 0)
      .sort((a, b) => b.totalResources - a.totalResources);

    const layout = this.getPrivateCloudGeoTreemapCells(
      normalizedItems.map(item => item.totalResources || 1),
      { x: 0, y: 0, width: 100, height: 100 }
    );

    return normalizedItems.map((entry, index) => {
      const item = entry.item;
      const summary = item?.resources?.summary || {};
      const alerts = item?.alert_segregation || {};
      const datacenterName = typeof item?.datacenter === 'string'
        ? item.datacenter
        : item?.datacenter?.name;
      const datacenterCity = typeof item?.datacenter === 'string'
        ? (item?.location || item.datacenter).split(',')[0]
        : item?.datacenter?.city;
      const deviceResources = this.getPrivateCloudGeoDeviceResources(item, summary);

      return {
        name: datacenterCity || datacenterName || item?.name || 'Unknown',
        cloudName: item?.name || datacenterCity || datacenterName || 'Unknown',
        datacenter: datacenterName || 'N/A',
        platform: entry.platform,
        platformLabel: this.getPrivateCloudGeoPlatformLabel(item?.platform_type, entry.platform),
        color: this.getPrivateCloudGeoPlatformColor(entry.platform, index),
        value: [layout[index].x, layout[index].y, layout[index].width, layout[index].height],
        totalResources: entry.totalResources,
        totalAlerts: Number(item?.total_alerts || 0),
        critical: Number(alerts.critical || 0),
        warning: Number(alerts.warning || 0),
        info: Number(alerts.info || 0),
        vm: Number(summary.vm ?? item?.vms ?? 0),
        network: Number(summary.network || 0),
        hypervisor: Number(summary.hypervisor ?? item?.hypervisors ?? 0),
        baremetalServer: Number(summary.baremetal_server ?? item?.baremetal ?? 0),
        firewall: Number(item?.firewalls || 0),
        loadBalancer: Number(item?.load_balancers || 0),
        storage: Number(item?.storage || 0),
        deviceResources
      };
    });
  }

  private convertToPrivateCloudGeoPlatformOptions(cells: PrivateCloudGeoDistributionCell[]): labelAndValueType[] {
    const platforms = Array.from(new Set((cells || []).map(cell => cell.platform)));

    return [
      { label: 'All Selected', value: 'all' },
      ...platforms.map(platform => ({
        label: this.getPrivateCloudInventoryProviderTitle(platform),
        value: platform
      }))
    ];
  }

  private getUniqueDatacenterCount(cells: PrivateCloudGeoDistributionCell[]): number {
    return Array.from(new Set((cells || []).map(cell => cell.datacenter))).length;
  }

  private getPrivateCloudGeoDistributionOptions(cells: PrivateCloudGeoDistributionCell[]): EChartsOption {
    return {
      animation: false,
      tooltip: {
        show: true,
        trigger: 'item',
        confine: true,
        backgroundColor: '#202938',
        borderWidth: 0,
        padding: 0,
        textStyle: { color: '#ffffff' },
        extraCssText: 'box-shadow: 0 6px 18px rgba(28, 45, 65, 0.28); border-radius: 6px;',
        formatter: (info: any) => this.getPrivateCloudGeoDistributionTooltip(info.data)
      },
      grid: { top: 0, right: 0, bottom: 0, left: 0 },
      xAxis: { type: 'value', min: 0, max: 100, show: false },
      yAxis: { type: 'value', min: 0, max: 100, inverse: true, show: false },
      series: [{
        type: 'custom',
        coordinateSystem: 'cartesian2d',
        clip: false,
        renderItem: (params: any, api: any) => {
          const cell = cells[params.dataIndex];
          const start = api.coord([cell.value[0], cell.value[1]]);
          const end = api.coord([cell.value[0] + cell.value[2], cell.value[1] + cell.value[3]]);
          const width = end[0] - start[0];
          const height = end[1] - start[1];
          const centerX = start[0] + width / 2;
          const centerY = start[1] + height / 2;
          const labelWidth = Math.max(width - 12, 18);
          const platformResourceLabel = this.getPrivateCloudGeoTruncatedLabel(`${cell.platformLabel} Resources`, labelWidth);
          const valueFontSize = Math.max(14, Math.min(26, Math.round(height * 0.28)));
          const showPlatformResourceLabel = height > 62 && width > 42 && !!platformResourceLabel;

          const children: any[] = [{
            type: 'rect',
            shape: { x: start[0], y: start[1], width, height },
            style: { fill: cell.color, opacity: cell.dimmed ? 0.28 : 1, stroke: '#ffffff', lineWidth: 2 }
          }];

          if (width > 70 && height > 30) {
            children.push({
              type: 'text',
              silent: true,
              style: {
                text: cell.cloudName || cell.name,
                x: start[0] + 10,
                y: start[1] + 10,
                fill: '#ffffff',
                opacity: cell.dimmed ? 0.45 : 1,
                font: '600 11px Arial',
                textAlign: 'left',
                textVerticalAlign: 'top',
                overflow: 'truncate',
                width: Math.max(width - 20, 24)
              }
            });
          }

          children.push({
            type: 'text',
            silent: true,
            style: {
              text: this.formatNumber(cell.totalResources),
              x: centerX,
              y: showPlatformResourceLabel ? centerY - Math.max(8, valueFontSize * 0.35) : centerY,
              fill: '#ffffff',
              opacity: cell.dimmed ? 0.45 : 1,
              font: `700 ${valueFontSize}px Arial`,
              textAlign: 'center',
              textVerticalAlign: 'middle'
            }
          });

          if (showPlatformResourceLabel) {
            children.push({
              type: 'text',
              silent: true,
              style: {
                text: platformResourceLabel,
                x: centerX,
                y: centerY + Math.max(13, valueFontSize * 0.65),
                fill: '#ffffff',
                opacity: cell.dimmed ? 0.45 : 1,
                font: '400 11px Arial',
                textAlign: 'center',
                textVerticalAlign: 'middle',
                overflow: 'truncate',
                width: labelWidth
              }
            });
          }

          return { type: 'group', children };
        },
        data: cells
      }]
    };
  }

  private getPrivateCloudGeoTruncatedLabel(label: string, width: number): string {
    const text = label || '';
    const maxCharacters = Math.max(Math.floor(width / 6), 1);

    if (text.length <= maxCharacters) {
      return text;
    }

    return maxCharacters <= 3 ? text.slice(0, maxCharacters) : `${text.slice(0, maxCharacters - 3)}...`;
  }

  private getPrivateCloudGeoDistributionTooltip(cell: PrivateCloudGeoDistributionCell): string {
    if (!cell) {
      return '';
    }

    const row = (label: string, value: number | string, color = '#ffffff') => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:22px;height:26px;">
        <span style="color:#d4d9df;">${label}</span>
        <span style="font-weight:700;color:${color};">${value}</span>
      </div>`;

    return `<div style="min-width:224px;padding:11px 12px;font:12px/1.4 Arial;color:#ffffff;">
      <div style="display:flex;align-items:center;gap:7px;font-weight:700;font-size:13px;margin-bottom:8px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${cell.color};display:inline-block;"></span>${cell.name} DC - ${cell.platformLabel}
      </div>
      ${row('Platform Type', cell.platformLabel)}
      ${row('Datacenter', cell.datacenter)}
      <div style="border-top:1px solid #4b5563;margin:7px 0;"></div>
      ${row('Total Resources', this.formatNumber(cell.totalResources))}
      <div style="border-top:1px solid #4b5563;margin:7px 0;"></div>
      ${(cell.deviceResources || []).map(item => row(item.label, this.formatNumber(item.value))).join('')}
    </div>`;
  }

  private getPrivateCloudGeoDeviceResources(item: any, summary: any): Array<{ label: string; value: number }> {
    return [
      { label: 'VMs', value: Number(summary.vm ?? item?.vms ?? 0) },
      { label: 'Hypervisors', value: Number(summary.hypervisor ?? item?.hypervisors ?? 0) },
      { label: 'Baremetal Servers', value: Number(summary.baremetal_server ?? item?.baremetal ?? 0) },
      { label: 'Firewalls', value: Number(item?.firewalls || 0) },
      { label: 'Load Balancers', value: Number(item?.load_balancers || 0) },
      { label: 'Storage', value: Number(item?.storage || 0) },
      { label: 'Switches', value: Number(item?.switches || 0) },
      { label: 'Databases', value: Number(item?.databases || 0) },
      { label: 'Mac Devices', value: Number(item?.mac_devices || 0) },
      { label: 'Custom Devices', value: Number(item?.custom_devices || 0) },
      { label: 'Clusters', value: Number(item?.clusters || 0) },
      { label: 'Datastores', value: Number(item?.datastores || 0) },
      { label: 'Networks', value: Number(summary.network ?? item?.networks ?? 0) },
      { label: 'Distributed Switches', value: Number(item?.distributed_switches || 0) },
      { label: 'Port Groups', value: Number(item?.port_groups || 0) }
    ].filter(resource => resource.value > 0);
  }

  private getPrivateCloudGeoFlatResourceTotal(item: any): number {
    return Number(item?.vms || 0)
      + Number(item?.hypervisors || 0)
      + Number(item?.baremetal || 0)
      + Number(item?.firewalls || 0)
      + Number(item?.load_balancers || 0)
      + Number(item?.storage || 0)
      + Number(item?.switches || 0)
      + Number(item?.databases || 0)
      + Number(item?.mac_devices || 0)
      + Number(item?.custom_devices || 0)
      + Number(item?.clusters || 0)
      + Number(item?.datastores || 0)
      + Number(item?.networks || 0)
      + Number(item?.distributed_switches || 0)
      + Number(item?.port_groups || 0);
  }

  private normalizePrivateCloudGeoPlatform(platformType: string): string {
    const platform = String(platformType || 'custom').toLowerCase();

    if (platform.includes('hyper')) {
      return 'hyperv';
    }

    if (platform.includes('nutanix')) {
      return 'nutanix';
    }

    if (platform.includes('vcloud')) {
      return 'vcloud';
    }

    if (platform.includes('vmware') || platform.includes('vcenter') || platform.includes('esxi')) {
      return 'vmware';
    }

    return platform.includes('custom') ? 'custom' : platform;
  }

  private getPrivateCloudGeoPlatformLabel(platformType: string, platform: string): string {
    const labels: { [key: string]: string } = {
      vmware: 'VMware',
      nutanix: 'Nutanix',
      hyperv: 'Microsoft Hyper-V',
      vcloud: 'vCloud Director',
      custom: 'Custom'
    };

    return labels[platform] || platformType || this.getPrivateCloudInventoryProviderTitle(platform);
  }

  private getPrivateCloudGeoPlatformColor(platform: string, index: number): string {
    const colors: { [platform: string]: string } = {
      vmware: '#ff7f1a',
      nutanix: '#56bf45',
      hyperv: '#087bd3',
      proxmox: '#3db779',
      openstack: '#f5a31a',
      vcloud: '#6f5df6',
      custom: '#6c757d'
    };

    return colors[platform] || PRIVATE_CLOUD_GEO_DISTRIBUTION_COLORS[index % PRIVATE_CLOUD_GEO_DISTRIBUTION_COLORS.length];
  }

  private getPrivateCloudGeoTreemapCells(
    weights: number[],
    bounds: { x: number; y: number; width: number; height: number }
  ): Array<{ x: number; y: number; width: number; height: number }> {
    const cells: Array<{ x: number; y: number; width: number; height: number }> = new Array(weights.length);
    let remainingWeight = (weights || []).reduce((sum, weight) => sum + weight, 0);
    let free = { ...bounds };
    let index = 0;

    while (index < weights.length && remainingWeight > 0) {
      const area = free.width * free.height;
      const weight = weights[index];

      if (free.width >= free.height) {
        const width = (weight / remainingWeight) * free.width;
        cells[index] = { x: free.x, y: free.y, width, height: free.height };
        free = { x: free.x + width, y: free.y, width: free.width - width, height: free.height };
      } else {
        const height = (weight / remainingWeight) * free.height;
        cells[index] = { x: free.x, y: free.y, width: free.width, height };
        free = { x: free.x, y: free.y + height, width: free.width, height: free.height - height };
      }

      remainingWeight -= weight;
      index++;
    }

    return cells.map(cell => cell || { x: 0, y: 0, width: 0, height: 0 });
  }

  private formatNumber(value: number): string {
    return Number(value || 0).toLocaleString('en-US');
  }

  convertExecutiveSummaryViewData(
    data?: ExecutiveSummaryItem,
    kpiRow?: ExecutiveSummaryWidgetType['kpiRow'],
    discoveryCards?: ExecutiveSummaryDiscoveryCard[]
  ): ExecutiveSummaryViewData {
    let summaryData = new ExecutiveSummaryViewData();
    const findCard = (title: string) => (discoveryCards || []).find(card => card.title === title);

    summaryData.totalVMs = data?.totalVMs || findCard('VMs')?.discovered || 0;
    summaryData.physicalHosts = data?.physicalHosts || findCard('Physical Hosts')?.discovered || 0;
    summaryData.clusters = data?.clusters || findCard('Clusters')?.discovered || 0;
    summaryData.poweredOn = kpiRow?.poweredOn || data?.poweredOnVMs || 0;
    summaryData.poweredOff = kpiRow?.poweredOff || data?.poweredOffVMs || 0;
    summaryData.idleVMs = kpiRow?.idleVMs || data?.idleVMs || 0;
    summaryData.orphanedVMs = kpiRow?.orphanedDevices || data?.orphanedVMs || 0;

    return summaryData;
  }

  convertExecutiveSummaryDiscoveryCards(data: ExecutiveSummaryWidgetType): ExecutiveSummaryDiscoveryCardViewData[] {
    return (data?.discoveryCards || []).map(card => ({
      ...card,
      monitored: (card.up || 0) + (card.down || 0),
      titleLabel: card.title === 'VMs' ? 'VMs' : card.title,
      singularLabel: card.title === 'VMs' ? 'VMs' : card.title
    }));
  }

  convertToCloudTypeChartData(data: CloudTypeDistributionItem[]) {
    const filteredData = (data || []).filter(item => (Number(item?.percentage) || 0) > 0 || (Number(item?.count) || 0) > 0);
    if (!filteredData.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    const colors = [
      '#ff7f1a',
      '#56bf45',
      '#087bd3',
      '#f0a52b',
      '#ef4444',
      '#14b8a6',
      '#f97316',
      '#6366f1',
      '#84cc16',
      '#ec4899',
      '#06b6d4',
      '#eab308',
      '#22c55e',
      '#a855f7',
      '#f43f5e',
      '#0ea5e9',
      '#f59e0b',
      '#10b981',
      '#8b5cf6',
      '#d946ef',
      '#2dd4bf',
      '#fb7185',
      '#4f46e5',
      '#65a30d',
      '#0891b2'
    ];
    view.options = {
      ...view.options,
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1f2937',
        borderColor: '#1f2937',
        borderWidth: 0,
        padding: [8, 12],
        textStyle: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600
        },
        extraCssText: 'box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22); border-radius: 4px;',
        formatter: (params: any) => {
          const percentage = Number(params.value || 0).toFixed(2);
          return `${params.name}: ${params.data.count} (${percentage}%)`;
        }
      },
      legend: {
        show: true,
        type: 'scroll',
        bottom: 2,
        left: 'center',
        icon: 'circle',
        itemWidth: 11,
        itemHeight: 11,
        itemGap: 12,
        selectedMode: false,
        pageIconSize: 10,
        pageTextStyle: { color: '#999' },
        textStyle: {
          color: '#8a8a8a',
          fontSize: 12
        },
        formatter: (name: string) => {
          const item = filteredData.find(d => this.getCloudTypeDisplayName(d.type) === name);
          return item ? `${name} ${item.percentage}%` : name;
        }
      },
      series: [
        {
          name: 'Cloud Type',
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '42%'],
          label: {
            show: true,
            position: 'outside',
            color: '#6b7280',
            fontSize: 11,
            formatter: (params: any) => `${params.data.count}`
          },
          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              color: '#b7c1cc',
              width: 1
            }
          },
          data: filteredData.map((item, index) => ({
            value: item.percentage,
            name: this.getCloudTypeDisplayName(item.type),
            count: item.count,
            color: colors[index % colors.length],
            itemStyle: {
              color: colors[index % colors.length]
            }
          })),
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            focus: 'self',
            itemStyle: {
              shadowBlur: 12,
              shadowColor: 'rgba(0, 0, 0, 0.18)'
            }
          }
        }
      ]
    };

    return view;
  }

  private getCloudTypeDisplayName(type: string): string {
    if ((type || '').toLowerCase().includes('vcenter') || (type || '').toLowerCase().includes('vmware')) {
      return 'VMware';
    }
    if ((type || '').toLowerCase() === 'hyperv') {
      return 'Hyper-V';
    }

    return type;
  }
  convertToPowerActivityChartData(data: PowerActivityStateItem[]) {
    if (!data || !data.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const formattedData = data.map(item => {
      const isOn = item.state === 'Powered On';
      return {
        ...item,
        label: isOn ? 'On' : 'Off',
        color: isOn
          ? '#6aa11f'
          : '#e44c4c'
      };
    });
    view.options = {
      ...view.options,
      animation: false,
      grid: {
        left: 45,
        right: 10,
        top: 12,
        bottom: 28
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = formattedData[params.dataIndex];
          return `
          ${item.state}<br/>
          Count: ${item.count}
        `;
        }
      },
      legend: {
        show: false
      },
      xAxis: {
        type: 'category',
        data: formattedData.map(d => d.label),
        axisLine: {
          lineStyle: {
            color: '#9ca3af'
          }
        },
        axisTick: {
          show: true
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitNumber: 4,
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 58,
          data: formattedData.map(item => ({
            value: item.count,
            color: item.color,
            itemStyle: {
              color: item.color,
              borderRadius: [6, 6, 0, 0]
            }
          }))
        }
      ]
    };
    return view;
  }

  convertToResourceAllocationChartData(data: ResourceAllocationItem) {
    const labels = data?.labels?.length
      ? data.labels
      : [`vCPU (${data?.vcpu?.unit || 'cores'})`, `vRAM (${data?.vram?.unit || 'GB'})`];
    const totalCapacity = data?.totalCapacity?.length
      ? data.totalCapacity
      : [data?.vcpu?.totalCapacity || 0, data?.vram?.totalCapacity || 0];
    const used = data?.used?.length
      ? data.used
      : [data?.vcpu?.used || 0, data?.vram?.used || 0];
    if (!labels.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options = {
      ...view.options,
      animation: false,
      color: ['#2f6fed', '#40b374'],
      grid: {
        left: 48,
        right: 22,
        top: 18,
        bottom: 36
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any[]) => {
          const title = params && params.length ? params[0].axisValue : '';
          const rows = (params || []).map(item => `${item.marker} ${item.seriesName}: ${item.value}`);
          return [title, ...rows].join('<br/>');
        }
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 24,
        textStyle: {
          color: '#2d3742',
          fontSize: 12
        },
        data: ['Total Capacity', 'Used']
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: {
          lineStyle: {
            color: '#d8dde5'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitNumber: 5,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#e7ebf0'
          }
        }
      },
      series: [
        {
          name: 'Total Capacity',
          type: 'bar',
          barWidth: 32,
          data: totalCapacity,
          itemStyle: {
            color: '#2f6fed',
            borderRadius: [3, 3, 0, 0]
          }
        },
        {
          name: 'Used',
          type: 'bar',
          barWidth: 32,
          data: used,
          itemStyle: {
            color: '#40b374',
            borderRadius: [3, 3, 0, 0]
          }
        }
      ]
    };
    return view;
  }

  convertToAllocationPreviewChartData(data: ExecutiveSummaryAllocPreviewItem[]) {
    const rows = data || [];
    if (!rows.length) {
      return;
    }

    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options = {
      ...view.options,
      animation: false,
      color: ['#3472e8', '#7857e8', '#17a2b8'],
      grid: {
        left: 42,
        right: 18,
        top: 28,
        bottom: 48
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#1f2937',
        borderColor: '#1f2937',
        borderWidth: 0,
        padding: [10, 12],
        textStyle: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600
        },
        extraCssText: 'box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22); border-radius: 4px;',
        formatter: (params: any[]) => {
          const title = params && params.length ? params[0].axisValue : '';
          const rowsHtml = (params || []).map(item => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:8px;">
              <span style="display:flex;align-items:center;">
                <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${item.color};margin-right:8px;"></span>
                ${item.seriesName}
              </span>
              <span>${item.value}</span>
            </div>
          `).join('');

          return `<div style="min-width:120px;text-align:left;">
            <div style="text-align:center;margin-bottom:2px;">${title}</div>
            ${rowsHtml}
          </div>`;
        }
      },
      legend: {
        bottom: 6,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 18,
        textStyle: { color: '#2d3742', fontSize: 12 },
        data: ['Compute', 'Memory', 'Storage']
      },
      xAxis: {
        type: 'category',
        data: rows.map(row => row.platformGroup || row.platform),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#d8dde5' } },
        axisLabel: { color: '#2d3742', fontSize: 12, fontWeight: 600 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitNumber: 5,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#6b7280', fontSize: 11 },
        splitLine: { show: true, lineStyle: { color: '#e7ebf0' } }
      },
      series: [
        {
          name: 'Compute',
          type: 'bar',
          barWidth: 20,
          data: rows.map(row => row.compute),
          itemStyle: { color: '#3472e8', borderRadius: [3, 3, 0, 0] },
          emphasis: {
            focus: 'series',
            itemStyle: { shadowBlur: 8, shadowColor: 'rgba(52, 114, 232, 0.35)' }
          }
        },
        {
          name: 'Memory',
          type: 'bar',
          barWidth: 20,
          data: rows.map(row => row.memory),
          itemStyle: { color: '#7857e8', borderRadius: [3, 3, 0, 0] },
          emphasis: {
            focus: 'series',
            itemStyle: { shadowBlur: 8, shadowColor: 'rgba(120, 87, 232, 0.35)' }
          }
        },
        {
          name: 'Storage',
          type: 'bar',
          barWidth: 20,
          data: rows.map(row => row.storage),
          itemStyle: { color: '#17a2b8', borderRadius: [3, 3, 0, 0] },
          emphasis: {
            focus: 'series',
            itemStyle: { shadowBlur: 8, shadowColor: 'rgba(23, 162, 184, 0.35)' }
          }
        }
      ]
    };

    return view;
  }

  convertToVmCountByOSTypeChartData(data: VmCountByOSTypeItem[]) {
    const filteredData = (data || []).filter(item => (Number(item?.percentage) || 0) > 0 || (Number(item?.count) || 0) > 0);
    if (!filteredData.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    const colors = [
      '#3472e8',
      '#6f5df6',
      '#c9cfd6',
      '#e54b4b',
      '#3a8dde',
      '#8b7cf6',
      '#14b8a6',
      '#f97316',
      '#84cc16',
      '#ec4899',
      '#06b6d4',
      '#eab308',
      '#22c55e',
      '#a855f7',
      '#f43f5e',
      '#0ea5e9',
      '#f59e0b',
      '#10b981',
      '#8b5cf6',
      '#d946ef',
      '#2dd4bf',
      '#fb7185',
      '#4f46e5',
      '#65a30d',
      '#5b4bb7',
      '#0891b2',
      '#ef4444',
      '#7c3aed',
      '#16a34a',
      '#dc2626'
    ];
    const getColor = (index: number) => colors[index] || `hsl(${(index * 137.508) % 360}, 70%, 48%)`;

    view.options = {
      ...view.options,
      animation: false,

      tooltip: {
        show: true,
        trigger: 'item',
        backgroundColor: '#1f2937',
        borderColor: '#1f2937',
        borderWidth: 0,
        padding: [8, 12],
        textStyle: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600
        },
        extraCssText: 'box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22); border-radius: 4px;',
        formatter: (params: any) => {
          const percentage = Number(params.value || 0).toFixed(2);
          return `${params.name}: ${params.data.count} (${percentage}%)`;
        }
      },

      legend: {
        bottom: 4,
        left: 'center',
        icon: 'circle',
        itemWidth: 11,
        itemHeight: 11,
        itemGap: 12,
        textStyle: {
          color: '#8a8a8a',
          fontSize: 13
        },
        formatter: (name: string) => {
          const item = filteredData.find(d => d.os === name);
          return item ? `${name} ${item.percentage}%` : name;
        }
      },

      series: [
        {
          name: 'OS Type',
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '42%'],
          bottom: 18,
          label: {
            show: true,
            position: 'outside',
            color: '#6b7280',
            fontSize: 11,
            formatter: (params: any) => `${params.data.count}`
          },
          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              color: '#b7c1cc',
              width: 1
            }
          },

          data: filteredData.map((item, index) => ({
            value: item.percentage,
            name: item.os,
            count: item.count,
            color: getColor(index),
            itemStyle: {
              color: getColor(index)
            }
          })),

          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            focus: 'self',
            itemStyle: {
              shadowBlur: 12,
              shadowColor: 'rgba(0, 0, 0, 0.18)'
            }
          }
        }
      ]
    }
    view.options = this.chartConfigSvc.applyScrollableLegend(view.options);
    return view;
  }

  convertToEnvironmentAndCriticalityChartData(data: EnvironmentCriticalityItem[]) {
    if (!data || !data.length) { return; }

    let view: UnityChartDetails = new UnityChartDetails();

    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const colors = ['#e54b4b', '#f5a623', '#2f80d1', '#5c8f1f'];

    view.options = {
      ...view.options,
      animation: false,

      grid: {
        left: 96,
        right: 38,
        top: 2,
        bottom: 2,
        containLabel: false
      },

      xAxis: {
        type: 'value',
        max: 100,
        show: false
      },

      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(d => d.environment),

        axisLine: { show: false },
        axisTick: { show: false },

        axisLabel: {
          color: '#8a8a8a',
          fontSize: 11,
          margin: 12
        }
      },

      tooltip: {
        show: true,
        trigger: 'item',
        backgroundColor: '#1f2937',
        borderColor: '#1f2937',
        borderWidth: 0,
        padding: [8, 12],
        textStyle: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600
        },
        extraCssText: 'box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22); border-radius: 4px;',
        formatter: (params: any) => {
          const item = data[params.dataIndex];

          return `${item.environment}: ${item.count} (${item.percentage}%)`;
        }
      },

      series: [
        // background gray bars
        {
          type: 'bar',
          barWidth: 7,
          barGap: '-100%',
          silent: true,
          z: 1,

          data: data.map(() => 100),

          itemStyle: {
            color: '#ececec',
            borderRadius: 20
          }
        },

        // actual colored bars
        {
          type: 'bar',
          barWidth: 7,
          z: 2,

          data: data.map((item, index) => ({
            value: item.percentage,

            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: 20
            }
          })),

          label: {
            show: true,
            position: 'right',
            distance: 10,

            color: '#555',
            fontSize: 11,

            formatter: (params: any) => {
              const item = data[params.dataIndex];

              return item.count > 0
                ? item.count.toLocaleString()
                : '';
            }
          },
          emphasis: {
            focus: 'self',
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.18)'
            }
          }
        }
      ]
    };

    view.options = this.chartConfigSvc.applyScrollableLegend(view.options);
    return view;
  }

  convertToAlertSeverityViewData(data: AlertsSeverityItem) {
    let view = new AlertSeverityData();
    view.critical = data.critical ? data.critical : 0;
    view.warning = data.warning ? data.warning : 0;
    view.info = data.info ? data.info : 0;
    return view;
  }

  //Capacity & Growth widget


  getCapacityGrowthWidgetData(filters: FiltersCriteriaType): Observable<CapacityAndGrowthDataType> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<CapacityAndGrowthDataType>(PRIVATE_CLOUD_CAPACITY_GROWTH_ENDPOINT, { params });
  }

  getHypervisorHealthEnvironmentTableData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = ''
  ): Observable<HypervisorHealthEnvironmentResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', this.getVmBackupStatusOrderingParam(ordering))
      .set('search', search || '');
    return this.http.get<HypervisorHealthEnvironmentResponse>(PRIVATE_CLOUD_HYPERVISOR_HEALTH_ENVIRONMENT_ENDPOINT, { params });
  }

  getInfrastructureHealthStatusChartData(filters: FiltersCriteriaType): Observable<HypervisorHealthEnvironmentResponse> {
    const params = this.convertFiltersToParams(filters).set('page_size', '0');
    return this.http.get<any>(PRIVATE_CLOUD_INFRASTRUCTURE_HEALTH_STATUS_ENDPOINT, { params })
      .pipe(map(response => this.normalizeInfrastructureHealthStatusChartResponse(response)));
  }

  private normalizeInfrastructureHealthStatusChartResponse(response: any): HypervisorHealthEnvironmentResponse {
    if (Array.isArray(response?.results)) {
      return response as HypervisorHealthEnvironmentResponse;
    }

    const rowMap: { [deviceName: string]: HypervisorHealthEnvironmentItem } = {};
    const getRow = (item: any): HypervisorHealthEnvironmentItem => {
      const name = item?.deviceName || item?.shortName || 'N/A';
      if (!rowMap[name]) {
        rowMap[name] = {
          name,
          status: item?.status || 'Unknown',
          vendor: '',
          mfr: '',
          hv: '',
          model: '',
          os: '',
          cpuU: { cap: null, used: null, avail: null, pct: null },
          memU: { cap: null, used: null, avail: null, pct: null },
          storU: { cap: null, used: null, avail: null, pct: null },
          fan: 'Unknown',
          psu: 'Unknown',
          temp: null,
          hw: item?.status || 'Unknown'
        };
      }
      return rowMap[name];
    };

    (response?.hotspotTemperatureTop10?.data || []).forEach(item => {
      const row = getRow(item);
      row.temp = typeof item?.temperature === 'number' ? item.temperature : null;
      row.hw = item?.status || row.hw;
    });

    (response?.fanHealthByDevice?.data || []).forEach(item => {
      const row = getRow(item);
      row.fan = item?.status || 'Unknown';
      row.fanTotal = typeof item?.total === 'number' ? item.total : null;
      row.fanUp = typeof item?.up === 'number' ? item.up : null;
      row.fanWarn = typeof item?.warn === 'number' ? item.warn : null;
      row.fanOff = typeof item?.off === 'number' ? item.off : null;
      row.fanHasSensor = !!item?.hasSensor;
    });

    (response?.top10HostsByCpuUsage?.data || []).forEach(item => {
      const row = getRow(item);
      row.cpuU = { cap: null, used: null, avail: null, pct: typeof item?.usage === 'number' ? item.usage : null };
      row.cpuStatus = item?.status || row.cpuStatus;
    });

    (response?.top10HostsByMemoryUsage?.data || []).forEach(item => {
      const row = getRow(item);
      row.memU = { cap: null, used: null, avail: null, pct: typeof item?.usage === 'number' ? item.usage : null };
      row.memStatus = item?.status || row.memStatus;
    });

    (response?.top10HostsByStorageUsage?.data || []).forEach(item => {
      const row = getRow(item);
      row.storU = { cap: null, used: null, avail: null, pct: typeof item?.usage === 'number' ? item.usage : null };
      row.storStatus = item?.status || row.storStatus;
    });

    return {
      count: Object.keys(rowMap).length,
      temperatureThresholds: response?.hotspotTemperatureTop10?.thresholds,
      powerSupplyStatusDistribution: response?.powerSupplyStatusDistribution,
      results: Object.keys(rowMap).map(key => rowMap[key])
    };
  }

  getStorageDatastoresTableData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = ''
  ): Observable<StorageDatastoresResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', this.getStorageDatastoresOrderingParam(ordering))
      .set('search', search || '');
    return this.http.get<StorageDatastoresResponse>(PRIVATE_CLOUD_STORAGE_DATASTORES_ENDPOINT, { params })
      .pipe(map(res => this.normalizeStorageDatastoresResponse(res)));
  }

  getStorageDatastoresChartData(filters: FiltersCriteriaType): Observable<StorageDatastoresResponse> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<StorageDatastoresResponse>(PRIVATE_CLOUD_STORAGE_DATASTORES_ENDPOINT, { params })
      .pipe(map(res => this.normalizeStorageDatastoresResponse(res)));
  }

  private getStorageDatastoresOrderingParam(ordering: string): string {
    const isDesc = (ordering || '').charAt(0) === '-';
    const key = isDesc ? ordering.substring(1) : ordering;
    const backendKeys: { [key: string]: string } = {
      name: 'datastore',
      percentUsed: 'usedPct'
    };
    const backendKey = backendKeys[key] || key;

    return backendKey ? `${isDesc ? '-' : ''}${backendKey}` : '';
  }

  private normalizeStorageDatastoresResponse(data: StorageDatastoresResponse): StorageDatastoresResponse {
    const response = data as StorageDatastoresResponse & { topDatastoresByUsed?: StorageDatastoreItem[] };

    return {
      ...response,
      results: (response?.results || []).map(row => this.normalizeStorageDatastoreItem(row)),
      topByUsage: (response?.topByUsage || response?.topDatastoresByUsed || [])
        .map(row => this.normalizeStorageDatastoreItem(row))
    };
  }

  private normalizeStorageDatastoreItem(row: StorageDatastoreItem): StorageDatastoreItem {
    const item = row as StorageDatastoreItem & { datastore?: string; usedPct?: number };

    return {
      ...item,
      name: item.name || item.datastore || '',
      percentUsed: item.percentUsed ?? item.usedPct ?? 0
    };
  }

  convertToStorageDatastoresChart(rows: StorageDatastoreItem[]): EChartsOption {
    const data = [...(rows || [])].slice(0, 10);
    if (!data.length) {
      return null;
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          const dataItem = item?.data || {};
          return `${item?.marker || ''}${dataItem.name || item?.axisValue || ''}: ${dataItem.value || 0}`;
        }
      },
      grid: { top: 30, right: 28, bottom: 42, left: 50 },
      xAxis: {
        type: 'category',
        data: data.map(row => this.truncateChartLabel(row.name || '')),
        axisLabel: { interval: 0, rotate: 0 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100
      },
      series: [{
        name: '%Used',
        type: 'bar',
        barMaxWidth: 34,
        data: data.map(row => ({
          value: row.percentUsed || 0,
          itemStyle: { color: this.getStorageStatusColor(row.status) }
        }))
      }]
    };
  }

  getNetworkInterfacesTableData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = ''
  ): Observable<NetworkInterfacesResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', this.getNetworkInterfacesOrderingParam(ordering))
      .set('search', search || '');
    return this.http.get<NetworkInterfacesResponse>(PRIVATE_CLOUD_NETWORK_INTERFACES_ENDPOINT, { params })
      .pipe(map(res => this.normalizeNetworkInterfacesResponse(res)));
  }

  getNetworkInterfacesChartData(filters: FiltersCriteriaType): Observable<NetworkInterfacesResponse> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<NetworkInterfacesResponse>(PRIVATE_CLOUD_NETWORK_INTERFACES_ENDPOINT, { params })
      .pipe(map(res => this.normalizeNetworkInterfacesResponse(res)));
  }

  private getNetworkInterfacesOrderingParam(ordering: string): string {
    if (!ordering) {
      return '';
    }

    const isDesc = ordering.charAt(0) === '-';
    const key = isDesc ? ordering.substring(1) : ordering;
    const backendKeys: { [key: string]: string } = {
      name: 'portGroup',
      type: 'port',
      vlanId: 'vlan',
      portGroup: 'portGroup',
      port: 'port',
      vlan: 'vlan',
      status: 'nicTeamStatus',
      rawStatus: 'nicTeamStatus'
    };
    const mappedKey = backendKeys[key] || key;

    return isDesc ? `-${mappedKey}` : mappedKey;
  }

  private normalizeNetworkInterfacesResponse(data: NetworkInterfacesResponse): NetworkInterfacesResponse {
    const response = data || ({} as NetworkInterfacesResponse);
    const topRows = response.topByVmCount || response.vmCountPerPortGroup || [];

    return {
      ...response,
      results: (response.results || []).map(row => this.normalizeNetworkInterfaceItem(row)),
      topByVmCount: topRows.map(row => this.normalizeNetworkInterfaceItem(row))
    };
  }

  private normalizeNetworkInterfaceItem(row: NetworkInterfaceItem): NetworkInterfaceItem {
    const item = row || ({} as NetworkInterfaceItem);

    return {
      ...item,
      portGroup: item.portGroup || item.name || '',
      name: item.name || item.portGroup || '',
      port: item.port || item.type || '',
      type: item.type || item.port || '',
      vlan: item.vlan !== undefined ? item.vlan : item.vlanId,
      vlanId: item.vlanId !== undefined ? item.vlanId : this.parseNetworkVlanId(item.vlan),
      portCount: item.portCount !== undefined ? item.portCount : null,
      status: item.status || item.nicTeamStatus || 'Healthy',
      rawStatus: item.rawStatus || item.nicTeamStatus || 'Healthy'
    };
  }

  private parseNetworkVlanId(vlan: string | number | null | undefined): number | null {
    if (vlan === null || vlan === undefined || vlan === '' || String(vlan).toLowerCase() === 'none') {
      return null;
    }

    const value = Number(vlan);
    return Number.isNaN(value) ? null : value;
  }

  getClusterMetricsData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = '',
    platform = '',
    cluster = '',
    accountName = ''
  ): Observable<ClusterMetricsResponse> {
    let params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', ordering || '')
      .set('search', search || '');

    if (platform) {
      params = params.set('platform', platform);
    }
    if (cluster) {
      params = params.set('cluster', cluster);
    }
    if (accountName) {
      params = params.set('accountName', accountName);
    }

    return this.http.get<ClusterMetricsResponse>(PRIVATE_CLOUD_CLUSTER_METRICS_ENDPOINT, { params });
  }

  getTopClustersByVmCountChartData(filters: FiltersCriteriaType): Observable<TopClustersByVmCountResponse> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<TopClustersByVmCountResponse>(PRIVATE_CLOUD_TOP_CLUSTERS_BY_VM_COUNT_ENDPOINT, { params });
  }

  getClusterCapacityTrendChartData(filters: FiltersCriteriaType, cluster = 'all'): Observable<ClusterCapacityTrendResponse> {
    const params = this.convertFiltersToParams(filters).set('cluster', cluster || 'all');
    return this.http.get<ClusterCapacityTrendResponse>(PRIVATE_CLOUD_CLUSTER_CAPACITY_TREND_ENDPOINT, { params });
  }

  getClusterComponentSummaryChartData(
    filters: FiltersCriteriaType,
    platform = 'all',
    cluster = 'all'
  ): Observable<ClusterComponentSummaryResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('platform', platform || 'all')
      .set('cluster', cluster || 'all');
    return this.http.get<ClusterComponentSummaryResponse>(PRIVATE_CLOUD_CLUSTER_COMPONENT_SUMMARY_ENDPOINT, { params });
  }

  convertToTopClustersByVmCountChart(rows: TopClustersByVmCountResponse): EChartsOption {
    const data = [...(rows?.topClustersByVMCount || [])];
    const colorMap = this.getClusterPlatformColorMap();
    if (!data.length) {
      return null;
    }

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1f2937',
        borderWidth: 0,
        textStyle: { color: '#ffffff' },
        formatter: (params: any) => `${params.name}<br/>VM Count: <b>${params.value}</b>`
      },
      grid: { top: 24, right: 45, bottom: 28, left: 120 },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#edf0f3' } }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(row => row.name),
        axisTick: { show: false },
        axisLabel: { color: '#6b7280' }
      },
      series: [{
        type: 'bar',
        barMaxWidth: 18,
        label: { show: true, position: 'right', color: '#111827', fontWeight: 700 },
        data: data.map(row => ({
          value: row.vmCount || 0,
          itemStyle: { color: colorMap[row.platform] || '#6c757d' }
        }))
      }]
    };
  }

  convertToClusterCapacityTrendChart(data: ClusterCapacityTrendResponse): EChartsOption {
    if (!(data?.cpuUtilizationTrend || []).length && !(data?.memoryUtilizationTrend || []).length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 35, right: 25, bottom: 32, left: 42 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data?.labels || [],
        axisTick: { show: false },
        axisLabel: { color: '#6b7280' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#edf0f3' } }
      },
      series: [
        {
          name: 'CPU %',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data?.cpuUtilizationTrend || [],
          lineStyle: { color: '#3472e8', width: 3 },
          itemStyle: { color: '#3472e8' },
          areaStyle: { color: 'rgba(52, 114, 232, 0.14)' }
        },
        {
          name: 'Memory %',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data?.memoryUtilizationTrend || [],
          lineStyle: { color: '#6b58e8', width: 3 },
          itemStyle: { color: '#6b58e8' }
        }
      ]
    };
  }

  convertToClusterComponentSummaryChart(data: ClusterComponentSummaryResponse): EChartsOption {
    const colors = ['#ec5790', '#3472e8', '#6b58e8', '#ff8317', '#f4c430', '#16a3b6', '#27ae60', '#c7ccd3', '#5448d9', '#86c440', '#e31a8b'];
    const components = data?.components || [];
    if (!components.length) {
      return null;
    }

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1f2937',
        borderWidth: 0,
        textStyle: { color: '#ffffff' },
        formatter: (params: any) => `${params.name}: <b>${params.value}</b>`
      },
      series: [{
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        data: components.map((item, index) => ({
          name: item.label,
          value: item.value || 0,
          itemStyle: { color: colors[index % colors.length] }
        }))
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: String(data?.total || 0),
          fill: '#111827',
          font: '700 16px Arial'
        }
      }]
    };
  }

  getClusterComponentLegendItems(data: ClusterComponentSummaryResponse): Array<{ label: string; value: number; color: string }> {
    const colors = ['#ec5790', '#3472e8', '#6b58e8', '#ff8317', '#f4c430', '#16a3b6', '#27ae60', '#c7ccd3', '#5448d9', '#86c440', '#e31a8b'];
    return (data?.components || []).map((item, index) => ({
      label: item.label,
      value: item.value || 0,
      color: colors[index % colors.length]
    }));
  }

  getClusterPlatformLegendItems(): Array<{ label: string; color: string }> {
    const colorMap = this.getClusterPlatformColorMap();
    return Object.keys(colorMap).map(platform => ({ label: platform, color: colorMap[platform] }));
  }

  private getClusterPlatformColorMap(): { [platform: string]: string } {
    return {
      VMware: '#ff8317',
      Nutanix: '#58bd45',
      'Microsoft Hyper-V': '#087bd3'
    };
  }

  convertToNetworkInterfacesChart(rows: NetworkInterfaceItem[]): EChartsOption {
    const colors = ['#3472e8', '#3fb374', '#e94851', '#6b58e8', '#3fb374', '#3472e8', '#3fb374', '#e94851', '#6b58e8', '#3fb374'];
    const data = [...(rows || [])].slice(0, 10);
    if (!data.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 30, right: 28, bottom: 78, left: 50 },
      xAxis: {
        type: 'category',
        data: data.map(row => this.getPortGroupChartLabel(row.name || '')),
        axisLabel: { interval: 0, rotate: 35 }
      },
      yAxis: {
        type: 'value',
        min: 0
      },
      series: [{
        name: 'VM Count',
        type: 'bar',
        barMaxWidth: 34,
        data: data.map((row, index) => ({
          value: row.vmCount || 0,
          itemStyle: { color: colors[index % colors.length] }
        }))
      }]
    };
  }

  convertToHypervisorHealthCharts(rows: HypervisorHealthEnvironmentItem[], powerSupplyStatusDistribution?: { data?: Array<{ name?: string; label?: string; normal?: number | null; warning?: number | null; unknown?: number | null; up?: number | null; warn?: number | null; off?: number | null }> }, temperatureThresholds?: { warning?: number | null; critical?: number | null; unit?: string }): Array<{ title: string; info: string; options: EChartsOption; legend: Array<{ label: string; color: string }> }> {
    const utilizationLegend = [
      { label: 'Healthy (<50%)', color: '#2caf6f' },
      { label: 'Elevated (50%-85%)', color: '#f5a31a' },
      { label: 'Critical (>85%)', color: '#e94851' }
    ];
    const temperatureUnit = temperatureThresholds?.unit || '°C';
    const warningThreshold = typeof temperatureThresholds?.warning === 'number' ? temperatureThresholds.warning : null;
    const criticalThreshold = typeof temperatureThresholds?.critical === 'number' ? temperatureThresholds.critical : null;
    const warningText = warningThreshold !== null && criticalThreshold !== null
      ? `Warning (${warningThreshold}${temperatureUnit}-${criticalThreshold - 1}${temperatureUnit})`
      : 'Warning';
    const criticalText = criticalThreshold !== null ? `Critical (>=${criticalThreshold}${temperatureUnit})` : 'Critical';
    const healthyText = warningThreshold !== null ? `Healthy (<${warningThreshold}${temperatureUnit})` : 'Healthy';

    return [
      {
        title: 'Top 10 Devices by HotSpot Temperature',
        info: 'Highest hotspot temperature reported per device, ranked hottest first. Devices without a temperature sensor are excluded.',
        options: this.createHypervisorTemperatureChart(rows, temperatureThresholds),
        legend: [
          { label: criticalText, color: '#e94851' },
          { label: warningText, color: '#f5a31a' },
          { label: healthyText, color: '#2caf6f' }
        ]
      },
      {
        title: 'Fan Health by Device',
        info: 'Count of fans reporting healthy per device, against the fans fitted to that chassis. A shortfall means one or more fans are off or degraded.',
        options: this.createHypervisorFanChart(rows),
        legend: [
          { label: 'Off', color: '#e94851' },
          { label: 'Warning', color: '#f5a31a' },
          { label: 'Up', color: '#2caf6f' }
        ]
      },
      {
        title: 'Power Supply Status Distribution',
        info: 'Status of each redundant power supply position across all discovered hosts. Unknown covers hosts with no sensor agent reporting PSU state.',
        options: this.createHypervisorPowerSupplyChart(rows, powerSupplyStatusDistribution),
        legend: [
          { label: 'Normal', color: '#2caf6f' },
          { label: 'Warning', color: '#f5a31a' },
          { label: 'Unknown', color: '#a9b4bf' }
        ]
      },
      {
        title: 'Top 10 Hosts by CPU Usage',
        info: 'Hosts ranked by CPU utilization, highest first (Top 10, or all hosts if fewer than 10 are discovered). Green - Healthy (<50%); Orange - Elevated (50-85%); Red - Critical (>85%); risk of CPU contention for hosted VMs.',
        options: this.createHypervisorUtilizationChart(rows, 'cpuU'),
        legend: utilizationLegend
      },
      {
        title: 'Top 10 Hosts by Memory Usage',
        info: 'Hosts ranked by memory utilization, highest first (Top 10, or all hosts if fewer than 10 are discovered). Green - Healthy (<50%); Orange - Elevated (50-85%); Red - Critical (>85%): high risk of memory pressure on hosted VMs.',
        options: this.createHypervisorUtilizationChart(rows, 'memU'),
        legend: utilizationLegend
      },
      {
        title: 'Top 10 Hosts by Storage Usage',
        info: 'Hosts ranked by datastore/storage utilization, highest first (Top 10, or all hosts if fewer than 10 are discovered). Green - Healthy (<50%); Orange - Elevated (50-85%); Red - Critical (>85%): datastore nearing full.',
        options: this.createHypervisorUtilizationChart(rows, 'storU'),
        legend: utilizationLegend
      }
    ];
  }

  private createHypervisorUtilizationChart(rows: HypervisorHealthEnvironmentItem[], key: 'cpuU' | 'memU' | 'storU'): EChartsOption {
    const data = [...(rows || [])]
      .sort((first, second) => (second[key]?.pct || 0) - (first[key]?.pct || 0))
      .slice(0, 10);
    if (!data.length || !data.some(row => typeof row[key]?.pct === 'number')) {
      return null;
    }

    return this.createHypervisorHorizontalBarChart(
      data.map(row => row.name),
      data.map(row => row[key]?.pct || 0),
      100,
      [],
      (_value, index) => {
        const status = key === 'cpuU' ? data[index]?.cpuStatus : key === 'memU' ? data[index]?.memStatus : data[index]?.storStatus;
        return this.getHypervisorStatusColor(status);
      }
    );
  }

  private createHypervisorTemperatureChart(rows: HypervisorHealthEnvironmentItem[], thresholds?: { warning?: number | null; critical?: number | null; unit?: string }): EChartsOption {
    const data = [...(rows || [])]
      .sort((first, second) => (typeof second.temp === 'number' ? second.temp : -1) - (typeof first.temp === 'number' ? first.temp : -1))
      .slice(0, 10);
    const values = data.map(row => row.temp);
    if (!data.length || !values.some(value => typeof value === 'number')) {
      return null;
    }
    const warningThreshold = typeof thresholds?.warning === 'number' ? thresholds.warning : null;
    const criticalThreshold = typeof thresholds?.critical === 'number' ? thresholds.critical : null;
    const unit = thresholds?.unit || '°C';
    const maxValue = Math.max(...values.filter((value): value is number => typeof value === 'number'), warningThreshold || 0, criticalThreshold || 0);
    const xAxisMax = Math.max(60, Math.ceil(maxValue / 10) * 10);
    const thresholdGraphics: any[] = [
      warningThreshold !== null ? {
        type: 'text',
        left: `${Math.max(0, Math.min(100, (warningThreshold / xAxisMax) * 100 - 8))}%`,
        top: 24,
        style: {
          text: `${warningThreshold}${unit} Warning`,
          fill: '#f5a31a',
          fontSize: 10,
          align: 'right'
        }
      } : null,
      criticalThreshold !== null ? {
        type: 'text',
        left: `${Math.max(0, Math.min(100, (criticalThreshold / xAxisMax) * 100 + 2))}%`,
        top: 24,
        style: {
          text: `${criticalThreshold}${unit} Critical`,
          fill: '#e94851',
          fontSize: 10,
          align: 'left'
        }
      } : null
    ].filter(Boolean);
    const markLineData: any[] = [
      warningThreshold !== null ? {
        name: `${warningThreshold}${unit} Warning`,
        xAxis: warningThreshold,
        lineStyle: { color: '#f5a31a' },
        label: { color: '#f5a31a' }
      } : null,
      criticalThreshold !== null ? {
        name: `${criticalThreshold}${unit} Critical`,
        xAxis: criticalThreshold,
        lineStyle: { color: '#e94851' },
        label: { color: '#e94851' }
      } : null
    ].filter(Boolean);

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 38, right: 36, bottom: 34, left: 95 },
      graphic: thresholdGraphics,
      xAxis: {
        type: 'value',
        min: 0,
        max: xAxisMax,
        name: `Temp (${unit})`,
        nameLocation: 'middle',
        nameGap: 24,
        splitLine: { lineStyle: { color: '#edf1f5' } }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(row => row.name),
        axisLabel: {
          formatter: (value: string) => this.truncateChartLabel(value)
        },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 12,
          showBackground: true,
          backgroundStyle: { color: '#e9eef4' },
          data: values.map((value, index) => ({
            value: typeof value === 'number' ? value : 0,
            label: {
              show: true,
              position: 'right',
              formatter: typeof value === 'number' ? `${value} ${unit}` : 'No sensor',
              color: '#17212f',
              fontWeight: 600
            },
            itemStyle: { color: typeof value === 'number' ? this.getHypervisorStatusColor(data[index]?.hw) : '#e9eef4' }
          })),
          markLine: markLineData.length ? {
            symbol: 'none',
            label: {
              show: false,
              fontSize: 10
            },
            lineStyle: {
              type: 'dashed',
              width: 1
            },
            data: markLineData
          } : undefined
        },
        {
          type: 'scatter',
          symbolSize: 8,
          data: values
            .map((value, index) => typeof value === 'number' ? [value, index] : null)
            .filter(Boolean),
          itemStyle: {
            color: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1
          },
          tooltip: { show: false },
          z: 3
        }
      ]
    };
  }

  private createHypervisorFanChart(rows: HypervisorHealthEnvironmentItem[]): EChartsOption {
    const data = (rows || [])
      .filter(row => typeof row.fanTotal === 'number')
      .slice(0, 10);
    const names = data.map(row => row.name);
    const up = data.map(row => row.fanUp || 0);
    const warning = data.map(row => row.fanWarn || 0);
    const off = data.map(row => row.fanOff || 0);
    const totals = data.map(row => row.fanTotal || 0);
    const max = Math.max(...totals, 0);
    if (!names.length || !max) {
      return null;
    }

    return this.createHypervisorStackedBarChart(names, [
      { name: 'Up', data: up, color: '#2caf6f' },
      { name: 'Warning', data: warning, color: '#f5a31a' },
      { name: 'Off', data: off, color: '#e94851' }
    ], max, (index: number) => `${up[index] + warning[index] + off[index]}/${totals[index]}`);
  }

  private createHypervisorPowerSupplyChart(rows: HypervisorHealthEnvironmentItem[], powerSupplyStatusDistribution?: { data?: Array<{ name?: string; label?: string; normal?: number | null; warning?: number | null; unknown?: number | null; up?: number | null; warn?: number | null; off?: number | null }> }): EChartsOption {
    if (powerSupplyStatusDistribution) {
      const data = powerSupplyStatusDistribution.data || [];
      if (!data.length) {
        return null;
      }
      return {
        tooltip: { trigger: 'axis' },
        grid: { top: 18, right: 24, bottom: 52, left: 38 },
        xAxis: {
          type: 'category',
          data: data.map((item, index) => item.name || item.label || `Power Supply ${index + 1}`),
          axisLabel: { interval: 0, rotate: 25 }
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Normal',
            type: 'bar',
            stack: 'psu',
            data: data.map(item => item.normal ?? item.up ?? 0),
            itemStyle: { color: '#2caf6f' },
            label: this.getHypervisorStackedBarLabel()
          },
          {
            name: 'Warning',
            type: 'bar',
            stack: 'psu',
            data: data.map(item => item.warning ?? item.warn ?? 0),
            itemStyle: { color: '#f5a31a' },
            label: this.getHypervisorStackedBarLabel()
          },
          {
            name: 'Unknown',
            type: 'bar',
            stack: 'psu',
            data: data.map(item => item.unknown ?? item.off ?? 0),
            itemStyle: { color: '#a9b4bf' },
            label: this.getHypervisorStackedBarLabel()
          }
        ]
      };
    }

    return null;
  }

  private createHypervisorHorizontalBarChart(names: string[], values: number[], max = 100, markLines: Array<{ name: string; xAxis: number; color: string }> = [], colorResolver?: (value: number, index: number) => string): EChartsOption {
    return {
      tooltip: { trigger: 'axis' },
      grid: { top: markLines.length ? 30 : 12, right: 42, bottom: 24, left: 95 },
      xAxis: { type: 'value', min: 0, max },
      yAxis: {
        type: 'category',
        inverse: true,
        data: names,
        axisLabel: {
          formatter: (value: string) => this.truncateChartLabel(value)
        }
      },
      series: [{
        type: 'bar',
        barMaxWidth: 14,
        data: values.map((value, index) => ({
          value,
          label: this.getHypervisorHorizontalBarLabel(value),
          itemStyle: { color: colorResolver ? colorResolver(value, index) : this.getHypervisorStatusColor('Healthy') }
        })),
        markLine: markLines.length ? {
          symbol: 'none',
          label: {
            show: true,
            formatter: '{b}',
            position: 'end',
            fontSize: 10
          },
          lineStyle: {
            type: 'dashed',
            width: 1
          },
          data: markLines.map(line => ({
            name: line.name,
            xAxis: line.xAxis,
            lineStyle: { color: line.color },
            label: { color: line.color }
          }))
        } : undefined
      }]
    };
  }

  private getHypervisorHorizontalBarLabel(value: number) {
    return {
      show: true,
      position: 'right' as const,
      color: '#000000',
      fontWeight: 700,
      formatter: `${value}`
    };
  }

  private createHypervisorStackedBarChart(
    names: string[],
    series: Array<{ name: string; data: number[]; color: string }>,
    max: number,
    endLabelFormatter?: (index: number) => string
  ): EChartsOption {
    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 12, right: 28, bottom: 24, left: 95 },
      xAxis: { type: 'value', min: 0, max },
      yAxis: {
        type: 'category',
        inverse: true,
        data: names,
        axisLabel: {
          formatter: (value: string) => this.truncateChartLabel(value)
        }
      },
      series: [
        ...series.map(item => ({
          name: item.name,
          type: 'bar' as const,
          stack: 'total',
          barMaxWidth: 14,
          data: item.data,
          itemStyle: { color: item.color },
          label: endLabelFormatter ? undefined : this.getHypervisorStackedBarLabel()
        })),
        ...(endLabelFormatter ? [{
          type: 'scatter' as const,
          symbolSize: 0,
          data: names.map((name, index) => [max, index]),
          label: {
            show: true,
            position: 'right' as const,
            color: '#000000',
            fontWeight: 700,
            formatter: (params: any) => endLabelFormatter(params.dataIndex)
          },
          tooltip: { show: false },
          z: 3
        }] : [])
      ]
    };
  }

  private getHypervisorStackedBarLabel() {
    return {
      show: true,
      position: 'inside' as const,
      color: '#ffffff',
      fontWeight: 700,
      formatter: (params: any) => Number(params.value || 0) ? `${params.value}` : ''
    };
  }

  private getHypervisorStatusColor(status = ''): string {
    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus === 'critical' || normalizedStatus === 'down' || normalizedStatus === 'off') {
      return '#e94851';
    }
    if (normalizedStatus === 'warning' || normalizedStatus === 'elevated' || normalizedStatus === 'degraded') {
      return '#f5a31a';
    }
    if (normalizedStatus === 'unknown') {
      return '#a9b4bf';
    }
    return '#2caf6f';
  }

  private truncateChartLabel(label: string): string {
    if (!label || label.length <= 12) {
      return label || '';
    }

    return `${label.slice(0, 10)}...`;
  }

  private getPortGroupChartLabel(label: string): string {
    return (label || '')
      .replace(/^VLAN-/, '')
      .replace(/^VSwitch-/, '')
      .replace(/^dvs-/, '');
  }

  private getStorageStatusColor(status: string): string {
    const normalizedStatus = (status || '').toLowerCase();

    if (normalizedStatus === 'critical') {
      return '#e94851';
    }
    if (normalizedStatus === 'warning') {
      return '#f5a31a';
    }
    return '#2caf6f';
  }

  private getPlatformColor(platform: string): string {
    const normalizedPlatform = (platform || '').toLowerCase();

    if (normalizedPlatform === 'vmware') {
      return '#f58220';
    }
    if (normalizedPlatform === 'nutanix') {
      return '#56bf45';
    }
    if (normalizedPlatform.indexOf('hyper') > -1) {
      return '#087bd3';
    }
    return '#6f5df6';
  }

  convertToVmDensityHostViewData(data: TopHostUtilizationItem[]): VmDensityHost {

    const view = new VmDensityHost();
    view.desnityHostRows = (data || []).map(item => {
      const row = new DesityHostRows();
      row.hostName = item.hostName || item.host || item.ip || 'N/A';
      row.utilizationPct = item.utilizationPercentage ?? item.pct ?? 0;
      row.totalStorageGB = item.totalCapacity ?? 0;
      row.usedStorageGB = item.usedCapacity ?? 0;
      row.category = item.utilizationStatus || 'N/A';
      return row;
    });

    return view;
  }


  convertToVmCapacityChartData(data: CapacityTrendAndForecastItem[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const actualData = data.filter(d => !d.isForecast);
    const forecastData = data.filter(d => d.isForecast);
    const months = actualData.map(d => d.month);
    // Merge forecast with nulls before it (to start from last actual point)
    const forecastSeries = [
      ...Array(actualData.length - 1).fill(null),
      actualData[actualData.length - 1].count, // connect point
      ...forecastData.map(d => d.count)
    ];

    view.options = {
      ...view.options,
      animation: false,
      grid: {
        left: 44,
        right: 16,
        top: 14,
        bottom: 58
      },
      // title: {
      //   text: 'VM Capacity Trend & Growth Forecast',
      //   left: 'center',
      //   top: 10,
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 500,
      //     color: '#333'
      //   }
      // },

      tooltip: {
        trigger: 'axis'
      },

      legend: {
        show: false
      },

      xAxis: {
        type: 'category',
        data: [
          ...actualData.map(d => d.month),
          ...forecastData.map(d => d.month)
        ],
        axisLine: { lineStyle: { color: '#d1d5db' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#8a8a8a',
          rotate: 35,
          interval: 0
        }
      },

      yAxis: {
        type: 'value',
        min: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8a8a8a' },
        splitLine: {
          lineStyle: { color: '#f1f2f4' }
        }
      },

      series: [
        // Actual Line
        {
          name: 'Actual',
          type: 'line',
          smooth: true,
          data: actualData.map(d => d.count),
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#3a8dde',
            width: 3
          },
          itemStyle: {
            color: '#3a8dde'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(58,141,222,0.35)' // top (strong)
              },
              {
                offset: 1,
                color: 'rgba(58,141,222,0.05)' // bottom (fade out)
              }
            ])
          }
        },

        // Forecast Line (dotted)
        {
          name: 'Forecast',
          type: 'line',
          smooth: true,
          data: forecastSeries,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#e76f51',
            width: 3,
            type: 'dashed'
          },
          itemStyle: {
            color: '#e76f51'
          }
        }
      ]
    };

    return view;
  }

  convertToVmProvisioningViewData(data: ProvisioningStatus) {
    let view = new VMProvisioningViewData();
    view.provisionedCount = data.provisioned ? data.provisioned : 0;
    view.decommissionedCount = data.decommissioned ? data.decommissioned : 0;
    return view;
  }

  convertToVmProvisioningChartData(data: ProvisioningStatus) {
    if (!data) { return; }
    const provisioned = data.provisioned || 0;
    const decommissioned = data.decommissioned || 0;
    if (!provisioned && !decommissioned) { return; }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options = {
      ...view.options,
      animation: false,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}<br/>Count: ${params.value}`
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'VM Provisioning Status',
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '50%'],
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: [
            {
              name: 'Provisioned',
              value: provisioned,
              itemStyle: { color: '#40b374' }
            },
            {
              name: 'Decommissioned',
              value: decommissioned,
              itemStyle: { color: '#ef4b55' }
            }
          ],
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          }
        }
      ]
    };
    return view;
  }

  //Top 10 clusters


  getTop10ClustersByVMsWidgetData(filters: FiltersCriteriaType): Observable<Top10ClustersByVMsData> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<Top10ClustersByVMsData>(PRIVATE_CLOUD_TOP_CLUSTERS_ENDPOINT, { params });
  }


  convertToTop10ClustersByVMCountViewData(data: Top10ClustersByVMsData): Top10ClustersByVMCountViewData {

    const view = new Top10ClustersByVMCountViewData();

    view.clusterList = (data?.topClustersByVMCount || []).map(item => ({
      host: item.clusterName || 'N/A',
      value: item.vmCount ?? 0
    }));

    return view;
  }

  convertToTop10ClustersByVMsChartData(data: any) {
    // data = Top10ClustersByVMCount;
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const maxValue = Math.max(...data.map(x => x.value));
    const barColors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
      '#ec4899',
      '#6366f1'
    ];


    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>VM Count: ${params.value}`;
        }
      },

      xAxis: {
        type: 'category',
        data: data.map(item => item.host),
        axisLine: {
          lineStyle: { color: '#d1d5db' }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#8a8a8a',
          fontSize: 11,
          interval: 0,
          rotate: 45,
          margin: 14,
          formatter: (value: string) => {
            return value.length > 8
              ? value.substring(0, 8) + '...'
              : value;
          }
        }
      },

      yAxis: {
        type: 'value',
        min: 0,
        max: Math.ceil(maxValue * 1.2),
        interval: Math.ceil((maxValue * 1.2) / 4),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8a8a8a',
          fontSize: 12
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f1f2f4'
          }
        }
      },

      series: [
        {
          name: 'VM Count',
          type: 'bar',
          barWidth: 20,
          barCategoryGap: '30%',
          data: data.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: barColors[index % barColors.length]
            }
          }))
        }
      ]
    };
    return view;
  }

  // Cluster capacity
  getClusterCapacityUtilTrendWidgetData(filters: FiltersCriteriaType): Observable<ClusterCapacityUtilTrendData> {
    const params = this.convertFiltersToParams(filters);
    return this.http.get<ClusterCapacityUtilTrendData>(PRIVATE_CLOUD_CLUSTER_CAPACITY_TREND_ENDPOINT, { params });
  }


  convertToClusterCapacityUtilTrendViewData(data: ClusterCapacityUtilTrendData): ClusterCapacityUtilTrendViewData[] {

    if (!data || !data.months || !data.cpuUtilizationTrend || !data.memoryUtilizationTrend) {
      return [];
    }

    return data.months.map((month, index) => ({
      month,
      actual: data.cpuUtilizationTrend[index] || 0,
      forecast: data.memoryUtilizationTrend[index] || 0
    }));
  }

  convertToClusterCapacityUtilTrendChartData(data: ClusterCapacityUtilTrendViewData[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const months = data.map(d => d.month);
    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: {
          lineStyle: { color: '#d1d5db' }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#8a8a8a',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#8a8a8a'
        },
        splitLine: {
          lineStyle: {
            color: '#f1f2f4'
          }
        }
      },

      series: [
        {
          name: 'CPU %',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: data.map(d => d.actual),
          lineStyle: {
            color: '#3a8dde',
            width: 3
          }
        },
        {
          name: 'Memory %',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: data.map(d => d.forecast),
          lineStyle: {
            color: '#6f5df6',
            width: 3
          }
        }
      ]
    };

    return view;
  }

  //Performance Hotspot widget
  /*

  
  * -----Start----- Performance Hotspots Widget Related -------------------
  */
  getUtilizationRows(filters?: any, page = 1, pageSize = 10, ordering = '', search = ''): Observable<PerformanceHotspots> {
    let params = this.convertFiltersToParams(filters);
    params = params
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('search', search || '');
    if (ordering) {
      params = params.set('ordering', ordering);
    }
    return this.http.get<PerformanceHotspots>(PRIVATE_CLOUD_PERFORMANCE_HOTSPOTS_ENDPOINT, { params });
  }

  getUtilizationChartData(filters?: any): Observable<PerformanceHotspotsChartsResponse> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<PerformanceHotspotsChartsResponse>(PRIVATE_CLOUD_PERFORMANCE_HOTSPOTS_CHARTS_ENDPOINT, { params });
  }

  convertToUtilizationCpuMemoryChartOptions(data: PerformanceHotspotsChartsResponse): EChartsOption {
    const rows = data?.topCpuVsMemory || [];
    if (!rows.length || !rows.some(row => typeof row.cpuUtilization === 'number' || typeof row.memoryUtilization === 'number')) {
      return null;
    }

    return {
      color: ['#2f6fed', '#e94851'],
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [];
          const dataIndex = items[0]?.dataIndex || 0;
          const row = rows[dataIndex];
          const lines = [`<strong>${row?.name || items[0]?.axisValue || ''}</strong>`];
          items.forEach(item => lines.push(`${item.marker}${item.seriesName}: ${item.value}`));
          return lines.join('<br/>');
        }
      },
      grid: { top: 35, right: 10, bottom: 105, left: 40 },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        data: ['CPU %', 'Memory %']
      },
      xAxis: {
        type: 'category',
        data: rows.map(row => row.name),
        axisLabel: {
          interval: 0,
          rotate: 35,
          overflow: 'truncate',
          width: 70,
          color: '#61708a',
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: '#e6ecf2' } },
        axisLabel: { color: '#61708a', fontSize: 10 }
      },
      series: [
        {
          name: 'CPU %',
          type: 'bar',
          barMaxWidth: 18,
          data: rows.map(row => row.cpuUtilization ?? 0)
        },
        {
          name: 'Memory %',
          type: 'bar',
          barMaxWidth: 18,
          data: rows.map(row => row.memoryUtilization ?? 0)
        }
      ]
    };
  }

  convertToUtilizationStorageChartOptions(data: PerformanceHotspotsChartsResponse): EChartsOption {
    const rows = data?.topStorageUtilization || [];
    if (!rows.length || !rows.some(row => typeof row.percentage === 'number')) {
      return null;
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          const row = rows[item?.dataIndex || 0];
          return `<strong>${row?.name || item?.axisValue || ''}</strong><br/>${item?.marker || ''}Storage % Used: ${row?.percentage ?? 0}<br/>Capacity: ${row?.capacity ?? 0} GB<br/>Used: ${row?.used ?? 0} GB`;
        }
      },
      grid: { top: 35, right: 10, bottom: 70, left: 40 },
      xAxis: {
        type: 'category',
        data: rows.map(row => row.name),
        axisLabel: {
          interval: 0,
          rotate: 35,
          overflow: 'truncate',
          width: 70,
          color: '#61708a',
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: '#e6ecf2' } },
        axisLabel: { color: '#61708a', fontSize: 10 }
      },
      series: [
        {
          name: 'Storage % Used',
          type: 'bar',
          barMaxWidth: 22,
          data: rows.map(row => ({
            value: row.percentage ?? 0,
            itemStyle: {
              color: this.getProgressClass(row.percentage ?? 0) === 'success'
                ? '#3db779'
                : this.getProgressClass(row.percentage ?? 0) === 'warning'
                  ? '#f5a31a'
                  : '#e94851'
            }
          }))
        }
      ]
    };
  }

  convertToUtilizationViewData(data: PerformanceHotspots): PrivateCloudUtilization {
    const view = new PrivateCloudUtilization();

    const rows = this.transformToUtilizationRows(data);

    view.utilRow = (rows || []).map(row =>
      this.convertToUtilizationViewRow(row)
    );

    return view;
  }


  transformToUtilizationRows(input: PerformanceHotspots): PrivateCloudUtilizationRow[] {
    return (input?.results || input?.topUtilization || []).map(item => ({
      name: item.name,

      cpuSeries: this.normalizeSparkline(item.cpuUtilization?.sparkline),
      cpuStatus: item.cpuUtilization?.current ?? 0,
      cpuTone: this.getProgressClass(item.cpuUtilization?.current ?? 0),

      memorySeries: this.normalizeSparkline(item.memoryUtilization?.sparkline),
      memoryStatus: item.memoryUtilization?.current ?? 0,
      memoryTone: this.getProgressClass(item.memoryUtilization?.current ?? 0),

      storage: {
        capacity: `${item.storageUtilization?.capacity ?? 0}GB`,
        used: `${item.storageUtilization?.used ?? 0}GB`,
        free: `${item.storageUtilization?.free ?? 0}%`,
        percent: item.storageUtilization?.percentage ?? 0,
        tone: this.getProgressClass(item.storageUtilization?.percentage ?? 0)
      },

      networkSpeed: {
        value: item.networkSpeed?.displayValue ?? item.diskIops?.displayValue ?? '0',
        label: this.formatNetworkSpeedLabel(item.networkSpeed?.displayValue ?? item.diskIops?.displayValue ?? '0'),
        percent: item.networkSpeed?.percentage ?? item.diskIops?.percentage ?? 0,
        tone: this.getProgressClass(item.networkSpeed?.percentage ?? item.diskIops?.percentage ?? 0)
      },

      upTime: item.uptime || 'N/A',
      uuid: item.uuid,
      deviceType: item.deviceType,
      vmSubType: item.deviceType === 'Virtual Machine' ? item.vmSubType : undefined
    }));
  }

  private normalizeSparkline(values?: Array<number | null | undefined>): number[] {
    return (values || []).map(value => typeof value === 'number' && !Number.isNaN(value) ? value : 0);
  }

  private formatNetworkSpeedLabel(value: string): string {
    return String(value || '0').trim().replace(/\s+/g, '\u00A0');
  }

  getProgressClass(value: number): PrivateCloudStatusTone {
    return value < 65
      ? 'success'
      : value < 85
        ? 'warning'
        : 'danger';
  }

  private convertToUtilizationViewRow(row: PrivateCloudUtilizationRow): PrivateCloudUtilizationViewRow {
    return {
      ...row,
      cpuChartOptions: this.getSparklineOptions(row.cpuSeries, '#5d8df5', 'rgba(93, 141, 245, 0.28)'),
      memoryChartOptions: this.getSparklineOptions(row.memorySeries, '#6aa544', 'rgba(106, 165, 68, 0.28)')
    };
  }

  private getSparklineOptions(data: number[], lineColor: string, areaColor: string): EChartsOption {
    const values = (data || []).filter(value => typeof value === 'number' && !Number.isNaN(value));
    const minValue = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 100;
    const range = maxValue - minValue;
    const padding = range > 0 ? range * 0.2 : Math.max(Math.abs(maxValue || 1) * 0.2, 0.5);

    return {
      animation: false,
      grid: { top: 2, right: 1, bottom: 2, left: 1 },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: data.map((_, index) => index)
      },
      yAxis: {
        type: 'value',
        show: false,
        min: minValue - padding,
        max: maxValue + padding
      },
      series: [
        {
          type: 'line',
          data: data,
          symbol: 'none',
          smooth: false,
          lineStyle: {
            width: 1.5,
            color: lineColor
          },
          areaStyle: {
            color: areaColor
          }
        }
      ]
    };
  }

  //Idle Devices

  getIdleDevicesData(filters?: any, page = 1, pageSize = 10): Observable<IdleDevices> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize));
    return this.http.get<IdleDevices>(PRIVATE_CLOUD_IDLE_DEVICES_ENDPOINT, { params });

  }

  convertToDeviceIdleViewData(data: IdleDevices): IdleDevicesViewData {
    const view = new IdleDevicesViewData();
    const rows = this.transformToIdleDevicesRows(data);

    view.devicesRow = rows || [];

    // const rows;
    return view;
  }

  transformToIdleDevicesRows(input: IdleDevices): DevicesRowViewData[] {

    return (input?.results || []).map(item => ({

      deviceName: item.deviceName,
      resourceType: item.deviceType || item.resourceType || item.device || 'N/A',
      networkIO: item.networkIO,
      idleDuration: item.idleDuration,
      uuid: item.uuid,
      deviceType: item.deviceType,
      vmSubType: item.deviceType === 'Virtual Machine' ? item.vmSubType : undefined,
      status: item.status,

      avgCpu: {
        used: `${item.avgCpu?.used ?? 0}%`,
        free: `${item.avgCpu?.free ?? 0}%`,
        percent: +(100 - (item.avgCpu?.free ?? 0)).toFixed(2),
        tone: this.getProgressClass(100 - (item.avgCpu?.free ?? 0))
      },

      avgMem: {
        used: `${item.avgMem?.used ?? 0}%`,
        free: `${item.avgMem?.free ?? 0}%`,
        percent: +(100 - (item.avgMem?.free ?? 0)).toFixed(2),
        tone: this.getProgressClass(100 - (item.avgMem?.free ?? 0))
      }

    }));
  }

  convertToIdleDevicesDistributionViewData(data: IdleDurationDistributionItem[]): IdleDevicesDistribution {
    const view = new IdleDevicesDistribution();
    view.distributionRow = (data || []).map(item => {
      const row = new DistributionRowData();
      row.duration = item.duration || 'N/A';
      row.percent = item.count || 0;
      return row;
    });

    return view;
  }

  convertToIdleDurationDistributionChartData(
    data: DistributionRowData[]
  ) {
    const filteredData = data || [];
    if (!filteredData.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    const colors = ['#18c06b', '#ff9800', '#d63b3b', '#f4a1a8'];

    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
          ${params.name}<br/>
          ${params.value}%
        `;
        }
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'pie',
          roseType: 'radius',
          clockwise: true,
          radius: ['42%', '64%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: true,
          padAngle: 0,

          label: {
            show: true,
            position: 'outside',
            color: '#6b7280',
            fontSize: 11,
            formatter: (params: any) => `${params.name} (${params.value})`
          },

          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              color: '#b7c1cc',
              width: 1
            }
          },

          data: filteredData.map((item, index) => ({
            value: item.percent,
            name: item.duration,
            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: 0,
              borderWidth: 0
            }
          })),

          itemStyle: {
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 0
          }
        }
      ]
    };

    return view;
  }

  /*
   * ******End ****** Performance Hotspots Widget Related ********************
   */

  //Performance / Workload widget
  getPerformanceWorkloadWidgetData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = ''
  ): Observable<PerformanceWorkloadDataType> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', this.getVmBackupStatusOrderingParam(ordering))
      .set('search', search || '');
    return this.http.get<PerformanceWorkloadDataType>(PRIVATE_CLOUD_PERFORMANCE_WORKLOAD_INSIGHTS_ENDPOINT, { params });
  }

  getPerformanceWorkloadChartData(filters: FiltersCriteriaType): Observable<PerformanceWorkloadDataType> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<PerformanceWorkloadDataType>(PRIVATE_CLOUD_PERFORMANCE_WORKLOAD_INSIGHTS_ENDPOINT, { params });
  }

  convertToVmWorkloadDiskThroughputChart(data: PerformanceWorkloadDataType): EChartsOption {
    const rows = data?.diskThroughputTop10 || [];
    if (!rows.length || !rows.some(row => typeof row.value === 'number')) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 26, right: 20, bottom: 58, left: 56 },
      xAxis: {
        type: 'category',
        data: rows.map(row => this.truncateChartLabel(row.name)),
        axisLabel: { interval: 0, rotate: 35 }
      },
      yAxis: { type: 'value' },
      series: [{
        name: 'Throughput',
        type: 'bar',
        barMaxWidth: 28,
        data: rows.map(row => ({
          value: row.value ?? 0,
          itemStyle: { color: (row.value ?? 0) > 1000 ? '#e94851' : '#3fb374' }
        }))
      }]
    };
  }

  convertToVmWorkloadCpuReadySwapChart(data: PerformanceWorkloadDataType): EChartsOption {
    const rows = data?.cpuReadyVsSwap || [];
    if (!rows.length) {
      return null;
    }
    const colors: { [platform: string]: string } = {
      VMware: '#f58220',
      Nutanix: '#56bf45',
      'Hyper-V': '#087bd3'
    };

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const row = params?.data?.row;
          const cpuReady = row?.cpuReadyPct ?? params?.value?.[0] ?? 0;
          const memorySwap = row?.memorySwapMb ?? params?.value?.[1] ?? 0;
          return [
            `<strong>${params?.name || row?.name || 'N/A'}</strong>`,
            row?.platform ? `Platform: ${row.platform}` : '',
            `CPU Ready %: ${cpuReady}`,
            `Memory Swap (MB): ${memorySwap}`
          ].filter(Boolean).join('<br/>');
        }
      },
      grid: { top: 26, right: 20, bottom: 42, left: 56 },
      xAxis: { type: 'value', name: 'CPU Ready %', nameLocation: 'middle', nameGap: 26 },
      yAxis: { type: 'value', name: 'Swap (MB)', nameLocation: 'middle', nameGap: 38 },
      series: [{
        type: 'scatter',
        symbolSize: 14,
        data: rows.map(row => ({
          name: row.name,
          value: [row.cpuReadyPct, row.memorySwapMb],
          row,
          itemStyle: { color: colors[row.platformGroup] || '#6f5df6' }
        }))
      }]
    };
  }

  convertToVmWorkloadStatusChart(data: PerformanceWorkloadDataType): EChartsOption {
    const statusBreakdown = data?.statusBreakdown || { Healthy: 0, Warning: 0, Critical: 0 };
    const total = statusBreakdown.Healthy + statusBreakdown.Warning + statusBreakdown.Critical;
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { name: 'Healthy', value: statusBreakdown.Healthy, itemStyle: { color: '#3fb374' } },
          { name: 'Warning', value: statusBreakdown.Warning, itemStyle: { color: '#f5a31a' } },
          { name: 'Critical', value: statusBreakdown.Critical, itemStyle: { color: '#e94851' } }
        ],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${total} VMs`,
          fill: '#1f2933',
          fontSize: 16,
          fontWeight: 700,
          align: 'center'
        }
      }]
    };

  }

  getNewlyProvisionedVmsData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = ''
  ): Observable<NewlyProvisionedVmsResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', this.getNewlyProvisionedVmsOrderingParam(ordering))
      .set('search', search || '');
    return this.http.get<NewlyProvisionedVmsResponse>(PRIVATE_CLOUD_NEWLY_PROVISIONED_VMS_ENDPOINT, { params })
      .pipe(map(res => this.normalizeNewlyProvisionedVmsResponse(res)));
  }

  private getNewlyProvisionedVmsOrderingParam(ordering: string): string {
    if (!ordering) {
      return '';
    }

    const isDesc = ordering.charAt(0) === '-';
    const key = isDesc ? ordering.substring(1) : ordering;
    const backendKeys: { [key: string]: string } = {
      vm_state: 'state',
      os_name: 'os',
      cloud_type: 'platform',
      cloud_account_name: 'cloudAcct',
      provisioned_date: 'provisioned',
      last_discovered_date: 'lastDiscovered',
      life_cycle_stage: 'stage'
    };
    const mappedKey = backendKeys[key] || key;

    return isDesc ? `-${mappedKey}` : mappedKey;
  }

  private normalizeNewlyProvisionedVmsResponse(data: NewlyProvisionedVmsResponse): NewlyProvisionedVmsResponse {
    const response = data || ({} as NewlyProvisionedVmsResponse);

    return {
      ...response,
      results: (response.results || []).map(row => this.normalizeNewlyProvisionedVmItem(row))
    };
  }

  private normalizeNewlyProvisionedVmItem(row: NewlyProvisionedVmItem): NewlyProvisionedVmItem {
    const item = row || ({} as NewlyProvisionedVmItem);

    return {
      ...item,
      vm_state: item.vm_state || item.state || '',
      os_name: item.os_name || item.os || '',
      cloud_type: item.cloud_type || item.platform || '',
      cloud_account_name: item.cloud_account_name || item.cloudAcct || '',
      provisioned_date: item.provisioned_date || item.provisioned || '',
      last_discovered_date: item.last_discovered_date || item.lastDiscovered || '',
      life_cycle_stage: item.life_cycle_stage || item.stage || 'NA',
      life_cycle_stage_status: item.life_cycle_stage_status || item.status || 'NA'
    };
  }

  getNewlyProvisionedVmsChartData(filters: FiltersCriteriaType): Observable<NewlyProvisionedVmsChartResponse> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<NewlyProvisionedVmsChartResponse>(PRIVATE_CLOUD_NEWLY_PROVISIONED_VMS_CHARTS_ENDPOINT, { params });
  }

  convertToNewlyProvisionedVmStateChart(data: NewlyProvisionedVmsChartResponse): EChartsOption {
    const breakdown = data?.vmStateBreakdown || { up: 0, down: 0 };
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { name: 'Up', value: breakdown.up, itemStyle: { color: '#3fb374' } },
          { name: 'Down', value: breakdown.down, itemStyle: { color: '#e94851' } }
        ],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: { text: `${data?.count || 0}`, fill: '#1f2933', fontSize: 16, fontWeight: 700, align: 'center' }
      }]
    };
  }

  convertToNewlyProvisionedCloudAccountChart(data: NewlyProvisionedVmsChartResponse): EChartsOption {
    const rows = data?.cloudAccountDistribution || [];
    if (!rows.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 26, right: 22, bottom: 40, left: 44 },
      xAxis: { type: 'category', data: rows.map(row => row.label), axisLabel: { interval: 0 } },
      yAxis: { type: 'value', min: 0 },
      series: [{
        type: 'bar',
        barMaxWidth: 34,
        data: rows.map(row => ({
          value: row.value,
          itemStyle: { color: this.getPlatformColor(row.platformGroup) }
        }))
      }]
    };
  }

  convertToNewlyProvisionedTimelineChart(data: NewlyProvisionedVmsChartResponse): EChartsOption {
    const rows = data?.timeline || [];
    if (!rows.length) {
      return null;
    }
    const dateLabels = rows.map(row => {
      const parsedDate = moment(row.date);
      return parsedDate.isValid() ? parsedDate.format('MMM DD') : row.date;
    });
    const uniqueDateLabels = Array.from(new Set(dateLabels));
    const yAxis: EChartsOption['yAxis'] = {
      type: 'category',
      data: rows.map(row => row.label),
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: '#edf1f5' }
      }
    };

    if (uniqueDateLabels.length <= 1) {
      const dateLabel = uniqueDateLabels[0] || '';

      return {
        tooltip: { trigger: 'item', formatter: (params: any) => params?.data?.name || '' },
        grid: { top: 26, right: 22, bottom: 40, left: 44 },
        xAxis: {
          type: 'category',
          data: [dateLabel],
          axisLabel: { rotate: 45, hideOverlap: false, fontSize: 10 },
          splitLine: {
            show: true,
            interval: 0,
            lineStyle: { color: '#edf1f5' }
          }
        },
        yAxis,
        series: [{
          type: 'scatter',
          symbolSize: 8,
          data: rows.map((row, index) => ({
            name: row.label,
            value: [dateLabel, index],
            itemStyle: { color: row.state === 'up' ? '#3fb374' : '#e94851' },
            label: { show: false }
          }))
        }]
      };
    }

    const timestamps = rows.map(row => moment(row.date).valueOf()).filter(value => !isNaN(value));
    const minTimestamp = timestamps.length ? Math.min(...timestamps) : null;
    const maxTimestamp = timestamps.length ? Math.max(...timestamps) : null;
    const timestampRange = minTimestamp !== null && maxTimestamp !== null ? maxTimestamp - minTimestamp : 0;
    const timestampPadding = Math.max(timestampRange * 0.1, 60 * 1000);

    return {
      tooltip: { trigger: 'item', formatter: (params: any) => params?.data?.name || '' },
      grid: { top: 26, right: 24, bottom: 72, left: 12, containLabel: true },
      xAxis: {
        type: 'time',
        min: minTimestamp !== null ? minTimestamp - timestampPadding : null,
        max: maxTimestamp !== null ? maxTimestamp + timestampPadding : null,
        axisLabel: {
          rotate: 45,
          hideOverlap: false,
          fontSize: 10,
          formatter: (value: number) => timestampRange < 24 * 60 * 60 * 1000
            ? moment(value).format('MMM DD HH:mm:ss')
            : moment(value).format('MMM DD')
        },
        splitLine: {
          show: true,
          interval: 0,
          lineStyle: { color: '#edf1f5' }
        }
      },
      yAxis,
      series: [{
        type: 'scatter',
        symbolSize: 8,
        data: rows.map((row, index) => ({
          name: row.label,
          value: [moment(row.date).valueOf(), index],
          itemStyle: { color: row.state === 'up' ? '#3fb374' : '#e94851' },
          label: { show: false }
        }))
      }]
    };
  }

  getVmBackupStatusData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = ''
  ): Observable<VmBackupStatusResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', ordering || '')
      .set('search', search || '');
    return this.http.get<VmBackupStatusResponse>(PRIVATE_CLOUD_VM_BACKUP_STATUS_ENDPOINT, { params })
      .pipe(map(res => this.normalizeVmBackupStatusResponse(res)));
  }

  private getVmBackupStatusOrderingParam(ordering: string): string {
    if (!ordering) {
      return '';
    }

    const isDesc = ordering.charAt(0) === '-';
    const key = isDesc ? ordering.substring(1) : ordering;
    const backendKeys: { [key: string]: string } = {
      name: 'vmName',
      backupJob: 'jobName',
      lastBackupStatus: 'status',
      oldestRestorePointDays: 'oldestRestorePoint'
    };
    const mappedKey = backendKeys[key] || key;

    return isDesc ? `-${mappedKey}` : mappedKey;
  }

  getVmBackupStatusChartData(filters: FiltersCriteriaType): Observable<VmBackupStatusChartsResponse> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<VmBackupStatusChartsResponse>(PRIVATE_CLOUD_VM_BACKUP_STATUS_CHARTS_ENDPOINT, { params })
      .pipe(map(res => this.normalizeVmBackupChartsResponse(res)));
  }

  private normalizeVmBackupStatusResponse(data: VmBackupStatusResponse): VmBackupStatusResponse {
    const response = data || ({} as VmBackupStatusResponse);

    return {
      ...response,
      results: (response.results || []).map(row => this.normalizeVmBackupStatusItem(row))
    };
  }

  private normalizeVmBackupStatusItem(row: VmBackupStatusItem): VmBackupStatusItem {
    const item = row || ({} as VmBackupStatusItem);

    return {
      ...item,
      uuid: item.uuid || String(item.id || ''),
      name: item.name || item.vmName || '',
      backupJob: item.backupJob || item.jobName || null,
      lastBackupStatus: item.lastBackupStatus || item.status || '',
      oldestRestorePointDays: item.oldestRestorePointDays ?? item.oldestRestorePoint ?? null
    };
  }

  private normalizeVmBackupChartsResponse(data: VmBackupStatusChartsResponse): VmBackupStatusChartsResponse {
    const response = data || ({} as VmBackupStatusChartsResponse);

    return {
      ...response,
      totalVms: response.totalVms || response.protectedVsUnprotected?.total || 0,
      backupAgeDistribution: this.normalizeBackupAgeDistribution(response.backupAgeDistribution),
      repositoryCapacity: (response.repositoryCapacity || []).map(row => ({
        ...row,
        name: row.name || row.repository || '',
        totalGb: row.totalGb ?? row.capacityGb ?? 0,
        usedPercentage: row.usedPercentage ?? row.usedPct ?? 0
      })),
      jobSuccessRateTrend: this.normalizeBackupSuccessTrend(response.jobSuccessRateTrend),
      restorePointSprawlTop10: (response.restorePointSprawlTop10 || response.restorePointSprawl || []).map(row => ({
        ...row,
        name: row.name || row.vmName || '',
        oldestRestorePointDays: row.oldestRestorePointDays ?? row.oldestDays ?? 0
      }))
    };
  }

  private normalizeBackupAgeDistribution(
    data: Array<{ label: string; count: number }> | { [key: string]: number }
  ): Array<{ label: string; count: number }> {
    if (Array.isArray(data)) {
      return data;
    }

    return Object.keys(data || {}).map(label => ({ label, count: data[label] || 0 }));
  }

  private normalizeBackupSuccessTrend(
    data: Array<{ date: string; rate: number }> | { labels: string[]; successRate: number[] }
  ): Array<{ date: string; rate: number }> {
    if (Array.isArray(data)) {
      return data;
    }

    return (data?.labels || []).map((label, index) => ({
      date: label,
      rate: (data?.successRate || [])[index] || 0
    }));
  }

  convertToVmBackupProtectedChart(data: VmBackupStatusChartsResponse): EChartsOption {
    const breakdown = data?.protectedVsUnprotected || { protected: 0, unprotected: 0 };
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { name: 'Protected', value: breakdown.protected, itemStyle: { color: '#3fb374' } },
          { name: 'Unprotected', value: breakdown.unprotected, itemStyle: { color: '#e94851' } }
        ],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${breakdown.protected}/${data?.totalVms || 0}`,
          fill: '#1f2933',
          fontSize: 16,
          fontWeight: 700,
          align: 'center'
        }
      }]
    };
  }

  convertToVmBackupAgeDistributionChart(data: VmBackupStatusChartsResponse): EChartsOption {
    const rows = this.normalizeBackupAgeDistribution(data?.backupAgeDistribution || []);
    if (!rows.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 26, right: 20, bottom: 34, left: 42 },
      xAxis: { type: 'category', data: rows.map(row => row.label), axisTick: { show: false } },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf1f5' } } },
      series: [{
        type: 'bar',
        barMaxWidth: 32,
        data: rows.map(row => ({
          value: row.count,
          itemStyle: { color: this.getBackupAgeColor(row.label) }
        }))
      }]
    };
  }

  convertToVmBackupJobSuccessTrendChart(data: VmBackupStatusChartsResponse): EChartsOption {
    const rows = this.normalizeBackupSuccessTrend(data?.jobSuccessRateTrend || []);
    if (!rows.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 24, bottom: 38, left: 44 },
      xAxis: {
        type: 'category',
        data: rows.map(row => row.date),
        axisTick: { show: false }
      },
      yAxis: { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: '#dcefe5' } } },
      series: [{
        name: 'Success Rate',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        areaStyle: { color: 'rgba(63, 179, 116, 0.14)' },
        lineStyle: { color: '#2caf6f', width: 2 },
        itemStyle: { color: '#2caf6f', borderColor: '#ffffff', borderWidth: 1 },
        data: rows.map(row => row.rate)
      }]
    };
  }

  convertToVmBackupRestorePointChart(data: VmBackupStatusChartsResponse): EChartsOption {
    const rows = data?.restorePointSprawlTop10 || data?.restorePointSprawl || [];
    if (!rows.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 20, bottom: 58, left: 44 },
      xAxis: {
        type: 'category',
        data: rows.map(row => this.truncateChartLabel(row.name || row.vmName || '')),
        axisLabel: { interval: 0, rotate: 35 }
      },
      yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#edf1f5' } } },
      series: [{
        type: 'bar',
        barMaxWidth: 30,
        data: rows.map(row => ({
          value: row.oldestRestorePointDays ?? row.oldestDays ?? 0,
          itemStyle: { color: this.getRestorePointAgeColor(row.oldestRestorePointDays ?? row.oldestDays ?? 0) }
        }))
      }]
    };
  }

  convertToVmBackupRepositoryCapacity(data: VmBackupStatusChartsResponse): VmBackupRepositoryCapacityItem[] {
    return data?.repositoryCapacity || [];
  }

  private getBackupAgeColor(label: string): string {
    if (label === '0-24h' || label === '< 24 hrs') {
      return '#3fb374';
    }
    if (label === '24-72h' || label === '1-3 days') {
      return '#3472e8';
    }
    if (label === 'Stale' || label === '4-7 days' || label === '> 7 days') {
      return '#f5a31a';
    }
    if (label === 'Unprotected') {
      return '#e94851';
    }

    return '#a9b4bf';
  }

  private getRestorePointAgeColor(days: number): string {
    if (days >= 60) {
      return '#e94851';
    }
    if (days >= 21) {
      return '#f5a31a';
    }

    return '#3fb374';
  }

  getHypervisorVersionComplianceData(
    filters: FiltersCriteriaType,
    page = 1,
    pageSize = 10,
    ordering = '',
    search = ''
  ): Observable<HypervisorVersionComplianceResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', ordering || '')
      .set('search', search || '');
    return this.http.get<HypervisorVersionComplianceResponse>(PRIVATE_CLOUD_HYPERVISOR_VERSION_COMPLIANCE_ENDPOINT, { params });
  }

  getHypervisorVersionComplianceChartData(filters: FiltersCriteriaType): Observable<HypervisorVersionComplianceChartsResponse> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<HypervisorVersionComplianceChartsResponse>(PRIVATE_CLOUD_HYPERVISOR_VERSION_COMPLIANCE_CHARTS_ENDPOINT, { params });
  }

  convertToHypervisorVersionGapChart(data: HypervisorVersionComplianceChartsResponse): EChartsOption {
    const breakdown = data?.complianceBreakdown || { Compliant: 0, Warning: 0, 'Non-Compliant': 0 };
    const warningCount = breakdown.Warning || 0;
    const nonCompliantCount = breakdown['Non-Compliant'] || 0;
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { name: 'N (Compliant)', value: breakdown.Compliant || 0, itemStyle: { color: '#3fb374' } },
          { name: 'N-1 (Warning)', value: Math.min(warningCount, 2), itemStyle: { color: '#f5a31a' } },
          { name: 'N-2 or older', value: nonCompliantCount + Math.max(warningCount - 2, 0), itemStyle: { color: '#e94851' } }
        ],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${data?.totalHosts || 0} hosts`,
          fill: '#1f2933',
          fontSize: 16,
          fontWeight: 700,
          align: 'center'
        }
      }]
    };
  }

  convertToHypervisorPlatformHostCountChart(data: HypervisorVersionComplianceChartsResponse): EChartsOption {
    const rows = data?.byPlatform || [];
    if (!rows.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 28, right: 20, bottom: 40, left: 42 },
      xAxis: { type: 'category', data: rows.map(row => row.platformGroup), axisTick: { show: false } },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf1f5' } } },
      series: [{
        type: 'bar',
        barMaxWidth: 34,
        data: rows.map(row => ({
          value: row.total,
          itemStyle: { color: this.getPlatformColor(row.platformGroup) }
        }))
      }]
    };
  }

  createProgressBarChart(title: string, data: any[], maxValue?: number): EChartsOption {
    if (!(data || []).some(item => typeof item?.value === 'number')) {
      return null;
    }

    const max = maxValue || Math.max(...data.map(d => d.value ?? 0));
    const visualMax = max > 0 ? max * 1.05 : 1;

    const gridHeight = Math.min(Math.max(data.length * 22, 28), 212);

    const longestNameLength = Math.max(...data.map(d => (d?.name || '').length), 0);

    // Keep label area small so bars get more space
    const labelWidth = Math.min(Math.max(longestNameLength * 6, 65), 90);

    const getColor = (value: number) => {
      const percent = (value / max) * 100;

      if (percent > 80) return '#e54b4b';     // red
      if (percent > 50) return '#f5a623';     // orange
      if (percent > 20) return '#2f80d1';     // blue
      return '#5c8f1f';                       // green
    };

    return {
      grid: {
        left: labelWidth,
        right: 36,
        top: 8,
        bottom: 6,
        height: gridHeight,
        containLabel: false
      },

      xAxis: {
        type: 'value',
        max: visualMax,
        show: false
      },

      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          interval: 0,
          color: '#6b7280',
          fontSize: 12,
          width: labelWidth - 8,
          align: 'right',
          overflow: 'truncate',
          margin: 8
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value}`
      },

      series: [
        {
          name: 'Background',
          type: 'bar',
          barWidth: 8,
          barGap: '-100%',
          barCategoryGap: '34%',
          silent: true,
          data: data.map(() => visualMax),
          itemStyle: {
            color: '#f3f4f6',
            borderRadius: 10
          },
          z: 1
        },
        {
          name: title,
          type: 'bar',
          barWidth: 8,
          barCategoryGap: '34%',
          data: data.map(item => ({
            value: item.value,
            itemStyle: {
              color: getColor(item.value),
              borderRadius: 10
            }
          })),
          label: {
            show: true,
            position: 'right',
            distance: 6,
            color: '#333',
            fontSize: 12,
            formatter: (params: any) => params.value
          },
          z: 2
        }
      ]
    };
  }

  convertTodiskLatencyChartData(data: any) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = this.createProgressBarChart('Top 10 - Disk Read/Write Throughput', data);

    return view;
  }

  convertToCpuReadyChartData(data: any) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = this.createProgressBarChart('Top 10 - CPU Ready VMs (%)', data);

    return view;
  }

  convertToSwapBalloonMemoryChartData(data: any) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = this.createProgressBarChart('Top 10 - Swap / Balloon Memory (GB)', data);

    return view;
  }

  // Alert Trends
  /*
     * -----Start----- Alert & Events View Widget Related -------------------
     */
  getRecentAlerts(filters?: FiltersCriteriaType, page = 1, pageSize = 10, ordering = '', search = ''): Observable<RecentAlerts> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', ordering || '')
      .set('search', search || '');
    return this.http.get<RecentAlerts>(PRIVATE_CLOUD_RECENT_ALERT_ENDPOINT, { params });
  }

  getRecentAlertsChartData(filters?: FiltersCriteriaType): Observable<RecentAlerts> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<RecentAlerts>(PRIVATE_CLOUD_RECENT_ALERT_ENDPOINT, { params });
  }

  convertToAlertSummaryView(data: RecentAlerts): RecentAlertSummaryViewData {
    const view = new RecentAlertSummaryViewData();
    view.total = data?.alertSummary.total ?? 0;
    view.information = data?.alertSummary.information ?? 0;
    view.critical = data?.alertSummary.critical ?? 0;
    view.warning = data?.alertSummary.warning ?? 0;
    return view;
  }


  convertToTopCriticalAlertsViewData(data: RecentAlertsItem[]): TopCriticalAlertsViewData {
    const view = new TopCriticalAlertsViewData();

    view.alertList = (data || []).map(item => {
      const v = new TopCriticalAlertsList();

      v.id = item?.id ?? 0;
      v.deviceName = item?.deviceName || 'N/A';
      v.severity = item?.severity || 'N/A';

      v.description = item?.description
        ? item.description.replace(/(?:\r\n|\r|\n)/g, '<br>')
        : '';

      v.source = item?.source || 'N/A';
      v.acknowledged = item?.acknowledged || 'N/A';
      v.duration = item?.duration || 'N/A';
      v.uuid = item?.uuid

      return v;
    });

    return view;
  }

  convertToRecentAlertSeverityDistributionChart(data: RecentAlerts): EChartsOption {
    const distribution = data?.severityDistribution || data?.alertSummary || { critical: 0, warning: 0, information: 0, total: 0 };
    const total = distribution.total || distribution.critical + distribution.warning + distribution.information;
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { name: 'Critical', value: distribution.critical || 0, itemStyle: { color: '#e94851' } },
          { name: 'Warning', value: distribution.warning || 0, itemStyle: { color: '#f5a31a' } },
          { name: 'Info', value: distribution.information || 0, itemStyle: { color: '#3472e8' } }
        ],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${total.toLocaleString('en-US')}`,
          fill: '#1f2933',
          fontSize: 16,
          fontWeight: 700,
          align: 'center'
        }
      }]
    };
  }

  convertToRecentAlertTopDevicesChart(data: RecentAlerts): EChartsOption {
    const rows = data?.topDevicesByAlertFrequency || [];
    if (!rows.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 28, right: 20, bottom: 58, left: 42 },
      xAxis: {
        type: 'category',
        data: rows.map(row => this.truncateChartLabel(row.deviceName)),
        axisLabel: { interval: 0, rotate: 35 }
      },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf1f5' } } },
      series: [{
        type: 'bar',
        barMaxWidth: 32,
        data: rows.map((row, index) => ({
          name: row.deviceName,
          value: row.count,
          itemStyle: { color: this.getRecentAlertDeviceColor(index) }
        }))
      }]
    };
  }

  private getRecentAlertDeviceColor(index: number): string {
    const colors = ['#e94851', '#f5a31a', '#3472e8', '#6d5df5', '#3fb374', '#15a5b8', '#f58220', '#8bc34a', '#9aa8b5', '#d9278f'];
    return colors[index % colors.length];
  }

  getAutoRemediationSummary(filters?: FiltersCriteriaType): Observable<AutoRemediationSummaryResponse> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<AutoRemediationSummaryResponse>(PRIVATE_CLOUD_AUTO_REMEDIATION_SUMMARY_ENDPOINT, { params });
  }

  convertToAutoRemediationRunbookChart(data: AutoRemediationSummaryResponse): EChartsOption {
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['62%', '82%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { name: 'Successful', value: data?.successfulRuns || 0, itemStyle: { color: '#3fb374' } },
          { name: 'Failed', value: data?.failedRuns || 0, itemStyle: { color: '#e94851' } }
        ],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }]
    };
  }

  convertToAutoRemediationActionsChart(actions: AutoRemediationActionItem[]): EChartsOption {
    const rows = actions || [];
    if (!rows.length) {
      return null;
    }
    const max = Math.max(...rows.map(row => row.count), 1);
    const truncateActionName = (name: string) => {
      const label = name || 'N/A';
      return label.length > 22 ? `${label.substring(0, 22)}...` : label;
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const point = Array.isArray(params) ? params.find(item => item?.seriesIndex === 1) || params[0] : params;
          return `${point?.name || 'N/A'}<br/>Count: ${point?.value || 0}`;
        }
      },
      grid: { top: 18, right: 42, bottom: 8, left: 172 },
      xAxis: { type: 'value', max, show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map(row => row.name),
        axisLabel: { formatter: (value: string) => truncateActionName(value) },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [
        {
          type: 'bar',
          barWidth: 14,
          barGap: '-100%',
          silent: true,
          data: rows.map(() => max),
          itemStyle: { color: '#edf0f3', borderRadius: 3 },
          z: 1
        },
        {
          type: 'bar',
          barWidth: 14,
          data: rows.map((row, index) => ({
            value: row.count,
            label: { show: true, position: 'right', formatter: `${row.count}`, color: '#5f6f86', fontWeight: 700 },
            itemStyle: { color: this.getAutoRemediationActionColor(index), borderRadius: 3 }
          })),
          z: 2
        }
      ]
    };
  }

  private getAutoRemediationActionColor(index: number): string {
    const colors = ['#3472e8', '#6f5be8', '#f5a31a', '#3fb374', '#15a4b8', '#e94851', '#8bc34a', '#e91e8f'];
    return colors[index % colors.length];
  }

  getVmProvisioningSummary(filters?: FiltersCriteriaType): Observable<VmProvisioningSummaryResponse> {
    const params = this.convertFiltersToParams(filters);

    return this.http.get<VmProvisioningSummaryResponse>(PRIVATE_CLOUD_VM_PROVISIONING_SUMMARY_ENDPOINT, { params });
  }

  convertToVmProvisioningReachabilitySummaryChart(data: VmProvisioningSummaryResponse): EChartsOption {
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['62%', '82%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { name: 'Reachable', value: data?.reachableCount || 0, itemStyle: { color: '#3fb374' } },
          { name: 'Unreachable', value: data?.unreachableCount || 0, itemStyle: { color: '#e94851' } }
        ],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }]
    };
  }

  convertToVmProvisioningTrendSummaryChart(data: VmProvisioningSummaryResponse): EChartsOption {
    const trend = data?.provisioningTrend;
    if (!(trend?.provisioned || []).length && !(trend?.decommissioned || []).length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 14, right: 12, bottom: 24, left: 32 },
      xAxis: {
        type: 'category',
        data: trend?.labels || [],
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: '#edf0f3' } }
      },
      series: [
        {
          name: 'Provisioned',
          type: 'bar',
          barWidth: 22,
          data: trend?.provisioned || [],
          itemStyle: { color: '#3fb374', borderRadius: [3, 3, 0, 0] }
        },
        {
          name: 'Decommissioned',
          type: 'bar',
          barWidth: 22,
          data: trend?.decommissioned || [],
          itemStyle: { color: '#e94851', borderRadius: [3, 3, 0, 0] }
        }
      ]
    };
  }

  convertToVmProvisioningCloudAccountSummaryChart(data: VmProvisioningSummaryResponse): EChartsOption {
    const rows = data?.vmsByCloudAccount || [];
    if (!rows.length) {
      return null;
    }
    const max = Math.max(...rows.map(row => row.value), 1);

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 8, right: 34, bottom: 8, left: 120 },
      xAxis: { type: 'value', max, show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map(row => row.label),
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [
        {
          type: 'bar',
          barWidth: 18,
          barGap: '-100%',
          silent: true,
          data: rows.map(() => max),
          itemStyle: { color: '#edf0f3', borderRadius: 3 },
          z: 1
        },
        {
          type: 'bar',
          barWidth: 18,
          data: rows.map(row => ({
            value: row.value,
            label: { show: true, position: 'right', formatter: `${row.value}`, color: '#5f6f86', fontWeight: 700 },
            itemStyle: { color: this.getPlatformColor(row.platformGroup), borderRadius: 3 }
          })),
          z: 2
        }
      ]
    };
  }

  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */


  //Orphaned Devcies

  getOrphanedDeviceData(filters: FiltersCriteriaType, page = 1, pageSize = 10, ordering = '', search = ''): Observable<OrphanedResourcesResponse> {
    const params = this.convertFiltersToParams(filters)
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('ordering', ordering || '')
      .set('search', search || '');
    return this.http.get<OrphanedResourcesResponse>(PRIVATE_CLOUD_ORPHANED_DEVICES_DETAILED_ENDPOINT, { params });
  }

  convertToOrphanedLifecycleStageChart(data: OrphanedResourcesResponse): EChartsOption {
    const stageData = data?.chartData?.byLifecycleStage || {};
    const rows = Object.keys(stageData).map(key => ({ name: key, value: stageData[key] }));

    return this.createOrphanedDonutChart(rows, `${data?.count || 0} devices`, ['#6d5df5', '#3472e8', '#e94851', '#f5a31a']);
  }

  convertToOrphanedOsTypeChart(data: OrphanedResourcesResponse): EChartsOption {
    const osData = data?.chartData?.byOsType || {};
    const rows = Object.keys(osData).map(key => ({ name: key, value: osData[key] }));

    return this.createOrphanedDonutChart(rows, `${data?.count || 0} devices`, ['#3fb374', '#3472e8']);
  }

  convertToOrphanedDaysChart(data: OrphanedResourcesResponse): EChartsOption {
    const rows = data?.chartData?.byDaysSinceStageChange || [];

    return this.createOrphanedBarChart(rows.map(row => row.label), rows.map(row => row.count), ['#3fb374', '#f5a31a', '#e94851']);
  }

  convertToOrphanedDatacenterChart(data: OrphanedResourcesResponse): EChartsOption {
    const rows = data?.chartData?.byDatacenter || [];

    return this.createOrphanedBarChart(rows.map(row => row.label), rows.map(row => row.count), ['#3472e8', '#3fb374']);
  }

  private createOrphanedDonutChart(rows: Array<{ name: string; value: number }>, centerText: string, colors: string[]): EChartsOption {
    if (!rows?.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: rows.map((row, index) => ({
          name: row.name,
          value: row.value,
          itemStyle: { color: colors[index % colors.length] }
        })),
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: { text: centerText, fill: '#1f2933', fontSize: 16, fontWeight: 700, align: 'center' }
      }]
    };
  }

  private createOrphanedBarChart(labels: string[], values: number[], colors: string[]): EChartsOption {
    if (!labels?.length) {
      return null;
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 28, right: 18, bottom: 34, left: 44 },
      xAxis: { type: 'category', data: labels, axisLabel: { interval: 0 } },
      yAxis: { type: 'value', min: 0 },
      series: [{
        type: 'bar',
        barMaxWidth: 34,
        data: values.map((value, index) => ({
          value,
          itemStyle: { color: colors[index % colors.length] }
        }))
      }]
    };
  }

  convertToOrphanedDeviceListView(data: OrphanedResourcesResponse): OrphanedDeviceView {
    const viewData = new OrphanedDeviceView();

    viewData.orphanList = (data?.results || []).map((item: OrphanedDevice) => {
      return {
        name: item.name,
        status: item.status,
        lastSeen: item.lastSeen,
        uuid: item.uuid,
        device: item.device,
        datacenter: item.datacenter,
        monitoring: item.monitoring,
        os: item.os,
        vmSubType: item.vmSubType,
        lifecycleStage: item.lifecycleStage,
        lifecycleStatus: item.lifecycleStatus,
      } as OrphanedDeviceList;
    });

    return viewData;
  }


  convertToOrphanedByCategoryChartData(data: OrphanedCategory[]) {
    const filteredData = data || [];
    if (!filteredData.length) { return; }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    view.options = {
      ...view.options,

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
                    ${params.name}<br/>
                    Count: ${params.data.count}<br/>
                    ${params.data.percentage}%
                `;
        }
      },

      legend: {
        show: false,
        bottom: 5,
        left: 15,
        right: 15,
        orient: 'vertical',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 18,
        textStyle: {
          color: '#555',
          fontSize: 14
        },
        formatter: (name: string) => {
          const item = filteredData.find(d => d.category === name);
          if (!item) {
            return name;
          }
          const left = item.category.padEnd(22, ' ');
          const right = `${item.count} (${item.percentage}%)`;

          return `${left}${right}`;
        }
      },
      series: [
        {
          name: 'Orphaned By Category',
          type: 'pie',
          roseType: 'radius',
          clockwise: false,
          radius: ['42%', '64%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: true,
          padAngle: 0,
          label: {
            show: true,
            position: 'outside',
            color: '#4b5563',
            fontSize: 14,
            formatter: (params: any) => `${params.data.count}`
          },
          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              width: 1
            }
          },
          data: filteredData.map((item, index) => ({
            value: item.count,
            name: item.category,

            count: item.count,
            percentage: item.percentage,

            itemStyle: {
              color: chartColors[index],
              borderColor: 'transparent',
              borderWidth: 0,
              borderRadius: 0
            }
          })),

          itemStyle: {
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 0
          },

          emphasis: {
            scale: false
          }
        }
      ]
    };

    return view;
  }
}

export class ExecutiveSummaryViewData {
  totalVMs: number;
  physicalHosts: number;
  clusters: number;
  poweredOn: number;
  poweredOff: number;
  orphanedVMs: number;
  idleVMs: number;

}

export class ExecutiveSummaryDiscoveryCardViewData implements ExecutiveSummaryDiscoveryCard {
  title: string;
  discovered: number;
  up: number;
  down: number;
  unknown: number;
  monitored: number;
  titleLabel: string;
  singularLabel: string;
}

export class ExecutiveSummaryWidgetData {
  executiveSummaryLoader: string = 'executiveSummaryLoader';
  cloudTypeLoader: string = 'CloudTypeLoader';
  powerActivityLoader: string = 'PowerActivityLoader';
  resourceAllocationLoader: string = 'ResourceAllocationLoader';
  vmCountByOSTypeLoader: string = 'VMCountByOSTypeLoader';
  environmentAndCriticalityLoader: string = 'EnvironmentAndCriticalityLoader';
  cloudTypeChartData: UnityChartDetails;
  powerActivityChartData: UnityChartDetails;
  resourceAllocationChartData: UnityChartDetails;
  vmCountByOSTypeChartData: UnityChartDetails;
  // environmentAndCriticalityViewData: EnvironmentAndCriticalityData;
  environmentAndCriticalityChartData: UnityChartDetails;
  alertSeverityViewData: AlertSeverityData;
}


export class AlertSeverityData {
  critical: number;
  warning: number;
  info: number;
}

export class CapacityAndGrowthInsightsWidgetData {
  vmDensityLoader: string = 'VMDensityPerHostLoader';
  vmCapacityLoader: string = 'vmCapacityTrendAndGrowthLoader';
  vmDensityChartData: UnityChartDetails;
  vmCapacityChartData: UnityChartDetails;
  vmProvisioningChartData: UnityChartDetails;
  vmProvisioningViewData: VMProvisioningViewData;
}

class VMProvisioningViewData {
  provisionedCount: number;
  decommissionedCount: number;
}

export class Top10ClustersByVMsWidgetData {
  loader: string = 'Top10ClustersByVMsCountLoader';
  chartData: UnityChartDetails;
}

export class ClusterCapacityUtilTrendWidgetData {
  loader: string = 'ClusterCapacityUtilTrendCountLoader';
  chartData: UnityChartDetails;
}

export class PerformanceHotspotWidgetData {
  loader: string = 'PerformanceHotspotLoader';
  tableData: any;
}

export class DiskLatencyWidgetData {
  loader: string = 'DiskLatencyLoader';
  chartData: UnityChartDetails;
}

export class CpuReadyWidgetData {
  loader: string = 'CpuReadyLoader';
  chartData: UnityChartDetails;
}

export class SwapBalloonMemoryWidgetData {
  loader: string = 'SwapBalloonMemoryLoader';
  chartData: UnityChartDetails;
}

export class TicketPriorityOptionsWidgetData {
  loader: string = 'TicketPriorityLoader'
  chartData: EChartsOption;
}

export class TicketStatusOptionsWidgetData {
  loader: string = 'TicketStatusLoader'
  chartData: EChartsOption;

}

export class TicketsItemViewData {
  loader: string = 'ITSMTicketListLoader';
  ticketList: TicketsList[];
}

export class TicketsList {
  ticketId: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
}


export class RiskOptimizationViewData {
  overUtilHosts: string;
  overUtilHostsPercent: string;
  underUtilHosts: string;
  underUtilHostsPercent: string;
  idleVms: string;
  idleVmsMsg: string;
  capacityAlerts: string;
  capacityAlertsMsg: string;
}

export class RiskOptimizationWidgetData {
  loader: string = 'CapacityRiskLoader';
  chartData: UnityChartDetails;
}

export class AutoRemediationExecSummaryWidgetData {
  loader: string = 'AutoRemediationExecSummaryLoader'
  chartData: UnityChartDetails;
  totalRuns: number;
  avgDuration: number;
}

export class TopAutoRemediationActionWidgetData {
  loader: string = 'TopAutoRemediationActionWidgetData'
  chartData: UnityChartDetails;
}

export class RecentAlertSummaryViewData {
  loader: string = 'publicCloudAlertSummaryLoader'
  total: number;
  information: number;
  critical: number;
  warning: number;
}

export class TopCriticalAlertsViewData {
  loader: string = 'publicCloudCriticalAlertsLoader';
  alertList: TopCriticalAlertsList[] = [];
}

export class TopCriticalAlertsList {
  uuid: string;
  status: string;
  deviceName: string;
  severity: string;
  source: string;
  duration: string;
  acknowledged: string;
  id: number;
  description: string;
}

export class OrphanedDeviceView {
  loader: string = 'OrphanedDeviceListLoader';
  orphanList: OrphanedDeviceList[] = [];
}

export class OrphanedDeviceList {
  name: string;
  status: string;
  uuid: string;
  device: string
  vmSubType?: string;
  lifecycleStage?: string;
  lifecycleStatus?: string;
  lastSeen: string;
  datacenter: string;
  monitoring: OrphanedDevice['monitoring'];
  os: OrphanedDevice['os'];
}

export class OrphanedDeviceWidgetView {
  loader: string = 'OrphanedDeviceWidgetLoader';
  chartData: UnityChartDetails;

}


const priorityConfig = [
  { key: 'High', name: '2 - High', color: '#ff5b63' },
  { key: 'Low', name: '4 - Low', color: '#6979ff' },
  { key: 'Moderate', name: '3 - Moderate', color: '#9bf04d' },
  { key: 'Critical', name: '1 - Critical', color: '#ff66d0' },
  { key: 'Planning', name: '5 - Planning', color: '#63d6c5' }
];

const statusConfig = [
  { key: 'Closed with ST Self heal', color: '#696cff' },
  { key: 'New', color: '#7bd88f' },
  { key: 'Closed', color: '#ff5fb8' },
  { key: 'Open', color: '#5bb9ff' },
  { key: 'Root Cause Analysis', color: '#ffd166' },
  { key: 'Schedule', color: '#b36bff' },
  { key: 'Authorize', color: '#7ee2a8' },
  { key: 'Implement', color: '#ff9f43' },
  { key: 'Resolved', color: '#8bd450' },
  { key: 'In Progress', color: '#4b7bec' },
  { key: 'On Hold', color: '#9aa6b2' }
];

export const EVENT_CHART_SECTIONS = [
  {
    name: 'Raw Events',
    sourceKey: 'rawEvents',
    keys: ['critical', 'warning', 'informative']
  },
  {
    name: 'Noise Reduction',
    sourceKey: 'noiseReduction',
    keys: ['dedupeEvents', 'suppressedEvents', 'correlated']
  },
  {
    name: 'First Response',
    sourceKey: 'firstResponse',
    keys: ['autoCloned', 'ticketCreated', 'autoClosed']
  }
];

export const SUMMARY_CHART_CONFIG = [
  {
    name: 'Raw Events',
    key: 'rawEvents',
    color: '#ff8f8f'
  },
  {
    name: 'Alerts',
    key: 'alerts',
    color: '#ffbf69'
  },
  {
    name: 'Conditions',
    key: 'conditions',
    color: '#9ed0ff'
  }
];

export interface PublicCloudTicketFilterCriteria {
  state: string;
  ticket_type: string;
  search: string;
  priority: string;
  dateRange: string;
  start_date: string;
  end_date: string;
  page: number;
  page_size: number;
}

export class Top10ClustersByVMCountViewData {
  loader: string = 'top10ClustersByVMCountLoader';
  clusterList: Top10ClustersByVMCountItemViewData[] = [];
}

export class Top10ClustersByVMCountItemViewData {
  host: string;
  value: number;
}

export class ClusterCapacityUtilTrendViewData {
  month: string;
  actual: number;
  forecast: number;
}

export const chartColors = [
  '#6677ee',
  '#6fc98c',
  '#f5aa4b',
  '#1fc7ea',
  '#9b87f5'
];

export class IdleDevicesViewData {
  loader: string = 'IdleDevicesLoader';
  devicesRow: DevicesRowViewData[];
}

export class DevicesRowViewData {
  deviceName: string;
  resourceType: string;
  avgCpu: AvgCpu;
  uuid: string;
  deviceType: string;
  vmSubType?: string;
  avgMem: AvgMem;
  networkIO: string;
  idleDuration: string;
  status: string;
}

export class AvgCpu {
  used: string;
  free: string;
  percent: number;
  tone: PrivateCloudStatusTone;
}
export class AvgMem {
  used: string;
  free: string;
  percent: number;
  tone: PrivateCloudStatusTone;
}

export class IdleDevicesDistribution {
  loader: string = 'IdleDevicesDistributionLoader';
  distributionRow: DistributionRowData[];
  chartData: UnityChartDetails;

}

export class DistributionRowData {
  duration: string;
  percent: number;
}

export class VmDensityHost {
  loader: string = 'VmDensityHostLoader';
  desnityHostRows: DesityHostRows[];
}

export class DesityHostRows {
  hostName: string;
  utilizationPct: number;
  totalStorageGB: number;
  usedStorageGB: number;
  category: string;
}
