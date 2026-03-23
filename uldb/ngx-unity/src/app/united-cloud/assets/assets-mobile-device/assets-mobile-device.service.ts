import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DEVICE_LIST_BY_DEVICE_TYPE, DOWNLOAD_MOBILE_DEVICES_REPORT, GET_MOBILE_DEVICES_REPORT } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { MobileDevice } from '../../shared/entities/mobile-device-crud.type';

@Injectable()
export class AssetsMobileDeviceService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService) { }

  getMobiles(criteria: SearchCriteria): Observable<PaginatedResult<MobileDevice>> {
    return this.tableService.getData<PaginatedResult<MobileDevice>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MOBILE_DEVICE), criteria);
  }

  getAllMobile(criteria: SearchCriteria): Observable<MobileDevice[]> {
    return this.tableService.getData<MobileDevice[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MOBILE_DEVICE), criteria);
  }

  converToViewData(devices: MobileDevice[]): MobileViewData[] {
    let viewData: MobileViewData[] = [];
    devices.map((device) => {
      let a: MobileViewData = new MobileViewData();
      a.id = device.uuid;
      a.name = device.name;
      a.deviceType = device.device_type;
      a.ipAddress = device.ip_address ? device.ip_address : 'N/A';
      a.platform = device.platform;
      a.model = device.model;
      a.deviceTagged = device.device_tagged ? device.device_tagged.name : 'N/A';
      a.serialNumber = device.serial_number ? device.serial_number : 'N/A';
      a.tags = device.tags;
      viewData.push(a);
    });
    return viewData;
  }

  downloadDevicesReport() {
    return this.http.get<{ data: string }>(DOWNLOAD_MOBILE_DEVICES_REPORT());
  }

  getDevicesReport(fileName: string): string {
    return GET_MOBILE_DEVICES_REPORT(fileName);
  }
}

export class MobileViewData {
  id: string;
  name: string;
  ipAddress: string = 'N/A';
  deviceType: string;
  platform: string;
  model: string;
  deviceTagged: string;
  serialNumber: string;
  tags: string[];
  constructor() { }
}
