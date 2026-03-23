import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PureStorage, StorageDeviceStorageDataProperties } from './usis-pure.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { GET_STORAGE_DATA_BRIEF } from 'src/app/shared/api-endpoint.const';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map } from 'rxjs/operators';

@Injectable()
export class UsisPureService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService) { }

  getPureStorageDevices(criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>(`customer/pure_storage/`, criteria)
  }

  convertToviewData(data: PureStorage[]): PureStorageViewData[] {
    let viewData: PureStorageViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    data.forEach(ps => {
      let view: PureStorageViewData = new PureStorageViewData();
      view.deviceId = ps.uuid;
      view.name = ps.name;
      view.os = ps.os.full_name;
      view.ip = ps.ip_address;
      view.monitoring = ps.monitoring;
      view.updatedAt = ps.updated_at ? datePipe.transform(ps.updated_at.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      // if (ps.status) {
      //   view.deviceStatus = this.utilService.getDeviceStatus(s.status);
      // }
      if (ps.is_cluster) {
        view.isCluster = true;
        view.detailIconEnabled = true;
        view.detailsTooltipMessage = 'View Details';
      } else if (ps.is_purity) {
        view.hasPureOs = true;
        view.detailIconEnabled = true;
        view.detailsTooltipMessage = 'View Details';
      } else {
        view.isCluster = false;
        view.detailIconEnabled = false;
        view.detailsTooltipMessage = 'Device is neither of Cluster type nor has Pure OS.';
      }
      viewData.push(view);
    })
    return viewData;
  }

  getStorageData(device: PureStorageViewData) {
    let url = `customer/pure_storage/${device.deviceId}/monitoring/get_storage_data_brief/`;
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: StorageDeviceStorageDataProperties) => {
          device.storage = this.getStorageUnits(res);
          return device;
        })
      );
  }

  private getStorageUnits(storageTracks: StorageDeviceStorageDataProperties) {
    let a: StorageUnits = new StorageUnits();
    if (storageTracks) {
      a.capacity = storageTracks.capacity;
      a.used = storageTracks.used;
      a.free = storageTracks.free;
      a.usedPercentage = storageTracks.used_perc;
      a.freePercentage = 100 - storageTracks.used_perc;
      a.usedBarColor = a.usedPercentage < 65 ? 'bg-success' : a.usedPercentage >= 65 && a.usedPercentage < 85 ? 'bg-warning' : 'bg-danger';
    }
    return a;
  }
}

export class PureStorageViewData {
  constructor() { }
  deviceId: string;
  name: string;
  os: string;
  ip: string;
  updatedAt: string;
  storage: StorageUnits;
  monitoring: DeviceMonitoringType;
  deviceStatus: string;
  get storageSpinner() {
    return this.storage ? false : true;
  }

  get showNA() {
    return this.storage && !this.storage.capacity ? true : false;
  }

  get showGraph() {
    return this.storage && this.storage.capacity ? true : false;
  }

  isCluster: boolean;
  hasPureOs: boolean;

  detailIconEnabled: boolean;
  detailsTooltipMessage: string;
}

export class StorageUnits {
  capacity: string;
  used: string;
  free: string;
  usedPercentage: number;
  freePercentage: number;
  usedBarColor: string;
  storageUnits: string;
  constructor() { }
}
