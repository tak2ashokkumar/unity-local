import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdvancedDeviceDiscoverySummary } from '../../advanced-device-discovery.type';
import { GET_ADVANCED_DISCOVERY_SUMMMARY } from 'src/app/shared/api-endpoint.const';
import { AdvancedDeviceDiscoveryService } from '../../advanced-device-discovery.service';

@Injectable({
  providedIn: 'root'
})
export class AdvancedDiscoverySummaryViewService {

  constructor(private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getDeviceSummary() {
    return this.http.get<AdvancedDeviceDiscoverySummary>(GET_ADVANCED_DISCOVERY_SUMMMARY(this.discoveryService.getSelectedDiscoveryId()));
  }

  convertToViewdata(data: AdvancedDeviceDiscoverySummary): DeviceDiscoverySummaryViewdata {
    let viewData = new DeviceDiscoverySummaryViewdata();
    viewData.firewalls = data.firewall ? data.firewall : 0;
    viewData.servers = data.server ? data.server : 0;
    viewData.lbs = data.loadbalancer ? data.loadbalancer : 0;
    viewData.switches = data.switch ? data.switch : 0;
    viewData.storage = data.storage ? data.storage : 0;
    viewData.hypervisors = data.hypervisor ? data.hypervisor : 0;
    viewData.pdus = data.pdu ? data.pdu : 0;
    viewData.mac = data.mac ? data.mac : 0;
    return viewData;
  }
}

export class DeviceDiscoverySummaryViewdata {
  constructor() { }
  firewalls: number = 0;
  servers: number = 0;
  lbs: number = 0;
  switches: number = 0;
  storage: number = 0;
  mac: number = 0;
  pdus: number = 0;
  hypervisors: number = 0;
}
