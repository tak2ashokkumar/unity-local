import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEVICE_DISCOVERY_SUMMMARY } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoverySummary } from '../unity-setup-device-discovery.type';

@Injectable()
export class DeviceDiscoverySummaryService {

  constructor(private http: HttpClient) { }

  getSummary() {
    return this.http.get<DeviceDiscoverySummary>(DEVICE_DISCOVERY_SUMMMARY());
  }

  convertToViewdata(data: DeviceDiscoverySummary): DeviceDiscoverySummaryServiceViewdata {
    let viewData = new DeviceDiscoverySummaryServiceViewdata();
    viewData.firewalls = data.firewall;
    viewData.servers = data.server;
    viewData.lbs = data.loadbalancer;
    viewData.switches = data.network;
    viewData.storage = data.storage;
    viewData.hypervisors = data.hypervisor;
    viewData.pdus = data.power;
    viewData.mac = data.mac;
    return viewData;
  }
}

export class DeviceDiscoverySummaryServiceViewdata {
  firewalls: number;
  servers: number;
  lbs: number;
  switches: number;
  storage: number;
  mac: number;
  pdus: number;
  hypervisors: number;
}