import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, CUSTOM_ATTRIBUTES_FAST_BY_DEVICE_TYPE, DEVICES_FAST_BY_DEVICE_TYPE, GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID, GET_CPU_MEMORY_STORAGE_DATA, GET_PORTS_BY_DEVICE_TYPE_AND_DEVICEID, GET_PORT_GRAPH_BY_DEVICE_TYPE_DEVICEID, PRIVATE_CLOUD_FAST_BY_DC_ID, ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID, ZABBIX_DEVICE_EVENTS_BY_DEVICE_TYPE_AND_DEVICE_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AlertResponse, Alerts } from 'src/app/shared/SharedEntityTypes/alert-response.type';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { ServerCpuMemoryStorage } from './entities/server-cpu-memory-storage.type';
import { SwitchZabbixMonitoringAlerts } from './switches/switches-zabbix/switch-zabbix-monitoring.type';
import { DeviceCustomAttribute } from 'src/app/shared/SharedEntityTypes/device-custom-attributes.type';
import { ZabbixMonitoringEvents } from './entities/zabbix-events.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class UnitedCloudSharedService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getPortsByDeviceTypeAndDeviceId(deviceType: DeviceMapping, deviceId: string): Observable<PortResponse> {
    return this.http.get(GET_PORTS_BY_DEVICE_TYPE_AND_DEVICEID(deviceType, deviceId)).pipe(map((res: { ports: PortResponse }) => res.ports));
  }

  getPortGraphByDeviceTypeDeviceIdAndPortId(deviceType: DeviceMapping, deviceId: string, portId: string): Observable<Map<string, PortGraph>> {
    const params = new HttpParams().set('port_id', portId);
    return this.http.get<PortGraph>(GET_PORT_GRAPH_BY_DEVICE_TYPE_DEVICEID(deviceType, deviceId), { params: params }).pipe(
      map((res: any) => {
        return new Map<string, PortGraph>().set(portId, res);
      })
    );;
  }

  getAlertsByDeviceTypeAndDeviceId(deviceType: DeviceMapping, deviceId: string): Observable<Alerts> {
    return this.http.get(GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID(deviceType, deviceId)).pipe(map((res: AlertResponse) => res.alerts));
  }

  getAlertsCountByDeviceTypeDeviceIdAndAlertType(deviceType: DeviceMapping, deviceId: string, params?: HttpParams): Observable<Map<string, string>> {
    return this.http.get(GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID(deviceType, deviceId), { params: params })
      .pipe(
        map((res: AlertResponse) => {
          return new Map<string, string>().set(deviceId, res.count);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(deviceId, 'N/A'));
        })
      );
  }

  getZabbixAlertsByDeviceTypeAndDeviceId(deviceType: DeviceMapping, deviceId: string): Observable<SwitchZabbixMonitoringAlerts[]> {
    return this.http.get<SwitchZabbixMonitoringAlerts[]>(ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID(deviceType, deviceId));
  }

  getZabbixAlertsCountByDeviceTypeDeviceId(deviceType: DeviceMapping, deviceId: string, params?: HttpParams): Observable<Map<string, string>> {
    return this.http.get<SwitchZabbixMonitoringAlerts[]>(ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID(deviceType, deviceId), { params: params })
      .pipe(
        map(res => {
          return new Map<string, string>().set(deviceId, `${res.length}`);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(deviceId, 'N/A'));
        })
      );
  }

  getZabbixEventsByDeviceTypeAndDeviceId(deviceType: DeviceMapping, deviceId: string, currentCriteria: SearchCriteria): Observable<PaginatedResult<ZabbixMonitoringEvents>> {
    return this.tableService.getData<PaginatedResult<ZabbixMonitoringEvents>>(ZABBIX_DEVICE_EVENTS_BY_DEVICE_TYPE_AND_DEVICE_ID(deviceType, deviceId), currentCriteria);
  }

  getZabbiEventsCountByDeviceTypeDeviceId(deviceType: DeviceMapping, deviceId: string, params?: HttpParams): Observable<Map<string, string>> {
    return this.http.get<PaginatedResult<ZabbixMonitoringEvents>>(ZABBIX_DEVICE_EVENTS_BY_DEVICE_TYPE_AND_DEVICE_ID(deviceType, deviceId), { params: params })
      .pipe(
        map(res => {
          return new Map<string, string>().set(deviceId, `${res.count}`);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(deviceId, 'N/A'));
        })
      );
  }

  getCpuMemoryStorageData(deviceId: string, deviceType: DeviceMapping): Observable<ServerCpuMemoryStorage> {
    return this.http.get<ServerCpuMemoryStorage>(GET_CPU_MEMORY_STORAGE_DATA(deviceId, deviceType));
  }

  getCloudNameForEndpoint(platFormType?: string) {
    let cloudNameForEndpoint = '';
    if (platFormType) {
      switch (platFormType.trim().replace(/\s+/g, '').toLowerCase()) {
        case 'vmware':
        case 'vmwarevcenter':
          cloudNameForEndpoint = 'vcenter';
          break;
        case 'unitedprivatecloudvcenter':
          cloudNameForEndpoint = 'unity-vcenter';
          break;
        default: cloudNameForEndpoint = '';
      }
    } else {
      cloudNameForEndpoint = '';
    }
    return cloudNameForEndpoint;
  }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateCloudsByDC(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getCustomAttributes(deviceType: DeviceMapping): Observable<DeviceCustomAttribute[]> {
    return this.http.get<DeviceCustomAttribute[]>(CUSTOM_ATTRIBUTES_FAST_BY_DEVICE_TYPE(this.utilSvc.getDeviceAPIMappingByDeviceMapping(deviceType)));
  }
}