import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NETWORK_DASHBOARD_FILTERS_RESPONSE, NETWORK_OVERVIEW } from './network-dashboard.const';
import { NetworkDashboardFiltersResponse, NetworkOverview } from './network-dashboard.type';

@Injectable()
export class NetworkDashboardService {

  constructor() { }

  getFilterOptions(): Observable<NetworkDashboardFiltersResponse> {
    return of(NETWORK_DASHBOARD_FILTERS_RESPONSE);
  }

  getNetworkOverview(): Observable<NetworkOverview> {
    return of(NETWORK_OVERVIEW);
  }

  convertToNetworkOverviewViewData(data: NetworkOverview): NetworkOverviewViewData {
    let view: NetworkOverviewViewData = new NetworkOverviewViewData();
    view.deviceAvailability = new DeviceAvailabilityViewData();
    view.deviceAvailability.percentage = data.device_availability?.percentage;
    view.deviceAvailability.online = data.device_availability?.online;
    view.deviceAvailability.total = data.device_availability?.total;
    view.discoveredDevices = data.discovered_devices;
    view.monitoredDevices = data.monitored_devices;
    view.deviceTypes = [];

    if (data.device_types && data.device_types.length) {
      data.device_types.forEach(item => {
        let deviceTypeView: DeviceTypesItemViewData = new DeviceTypesItemViewData();
        deviceTypeView.type = item.type;
        deviceTypeView.count = item.count;
        deviceTypeView.normal = item.normal;
        deviceTypeView.normalIconClass = 'fas fa-long-arrow-alt-up text-success'
        deviceTypeView.critical = item.critical;
        deviceTypeView.criticalIconClass = 'fas fa-long-arrow-alt-down text-danger'
        deviceTypeView.unknown = item.unknown;
        deviceTypeView.unknownIconClass = 'fas fa-exclamation-circle text-muted'
        view.deviceTypes.push(deviceTypeView);
      });
    }

    return view;
  }
}

export class NetworkOverviewViewData {
  deviceAvailability: DeviceAvailabilityViewData;
  discoveredDevices: number;
  monitoredDevices: number;
  deviceTypes: DeviceTypesItemViewData[];
}

export class DeviceAvailabilityViewData {
  percentage: number;
  online: number;
  total: number;
}

export class DeviceTypesItemViewData {
  type: string;
  count: number;
  normal: number;
  normalIconClass: string;
  critical: number;
  criticalIconClass: string;
  unknown: number;
  unknownIconClass: string;
}
