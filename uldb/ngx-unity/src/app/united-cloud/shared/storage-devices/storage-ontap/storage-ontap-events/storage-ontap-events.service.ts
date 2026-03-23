import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class StorageOntapEventsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getEvents(clusterId: string, itemName: string, criteria: SearchCriteria): Observable<OntapItemEvents[]> {
    // let params: HttpParams = this.tableService.getWithParam(criteria);
    // params = params.append('item_name', itemName);
    return this.http.get<OntapItemEvents[]>(`customer/storagedevices/${clusterId}/monitoring/events/?item_name=${itemName}`);
  }

  convertDetailsToViewdata(events: OntapItemEvents[]): OntapItemEventsViewData[] {
    let viewdata: OntapItemEventsViewData[] = [];
    events.forEach(event => {
      let view = new OntapItemEventsViewData();
      view.id = event.id;
      view.uuid = event.uuid;
      view.deviceName = event.device_name;
      view.description = event.description;
      view.eventDatetime = event.event_datetime ? this.utilSvc.toUnityOneDateFormat(event.event_datetime) : 'N/A';
      view.severity = event.severity;
      if (event.severity == 'Critical') {
        view.severityClass = 'text-danger';
        view.severityIcon = 'fa-exclamation-circle text-danger';
      } else if (event.severity == 'Warning') {
        view.severityClass = 'text-warning';
        view.severityIcon = 'fa-exclamation-circle text-warning';
      } else {
        view.severityClass = 'text-primary';
        view.severityIcon = 'fa-info-circle text-primary';
      }
      view.isAcknowledged = event.is_acknowledged ? 'Yes' : 'No';

      view.status = event.status;
      if (event.status == 'Resolved') {
        view.statusTextColor = 'text-success';
      } else {
        view.statusTextColor = 'text-danger';
      }
      view.source = event.source;
      view.duration = event.duration;

      view.deviceType = this.getDeviceTypeDisplayNames(event.device_type);
      view.deviceMapping = this.getDeviceMappingByDeviceType(event.device_type);
      view.managementIp = event.management_ip ? event.management_ip : 'NA';
      view.recoveredTime = event.recovered_time ? this.utilSvc.toUnityOneDateFormat(event.recovered_time) : 'NA';
      viewdata.push(view);
    });
    return viewdata;
  }

  getDeviceTypeDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'bms': return 'Bare Metal';
      case 'storage': return 'Storage';
      case 'database': return 'Database';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      case 'pdu': return 'PDU';
      case 'vm': return 'VM';
      default: return 'N/A';
    }
  }

  getDeviceMappingByDeviceType(devicetype: string): DeviceMapping {
    switch (devicetype) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'hypervisor': return DeviceMapping.HYPERVISOR;
      case 'bms': return DeviceMapping.BARE_METAL_SERVER;
      case 'storage': return DeviceMapping.STORAGE_DEVICES;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'database': return DeviceMapping.DB_SERVER;
      case 'custom': return DeviceMapping.OTHER_DEVICES;
      case 'pdu': return DeviceMapping.PDU;
      case 'vm': return DeviceMapping.VIRTUAL_MACHINE;
      default: return DeviceMapping.OTHER_DEVICES;
    }
  }
}



export interface OntapItemEvents {
  id: number;
  uuid: string;
  device_name: string;
  device_type: string;
  management_ip: string;
  description: string;
  event_datetime: string;
  severity: string;
  status: string;
  is_acknowledged: boolean;
  source: string;
  recovered_time: string;
  duration: string;
}

export class OntapItemEventsViewData {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  deviceMapping: DeviceMapping;
  managementIp: string;
  description: string;
  eventDatetime: string;
  severity: string;
  status: string;
  isAcknowledged: string;
  source: string;
  recoveredTime: string;
  duration: string;
  dedupedCount: number;

  severityClass: string;
  severityIcon: string;
  statusTextColor: string;
}
