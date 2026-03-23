import { Injectable } from '@angular/core';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CABINETS_BY_DATACENTER_ID, GET_CABINETS } from 'src/app/shared/api-endpoint.const';
import { tap } from 'rxjs/operators';
import { DataCenterCabinet } from 'src/app/united-cloud/shared/entities/datacenter-cabinet.type';

@Injectable()
export class DeviceDiscoveryCabinetsService {

  constructor(private tableService: TableApiServiceService) { }

  getCabinets(criteria: SearchCriteria): Observable<DataCenterCabinet[]> {
    return this.tableService.getData<DataCenterCabinet[]>(GET_CABINETS(), criteria);
  }

  convertToViewData(cabinets: DataCenterCabinet[]): DeviceDiscCabinetViewData[] {
    let viewData: DeviceDiscCabinetViewData[] = [];
    cabinets.forEach((cabinet: DataCenterCabinet) => {
      let data = new DeviceDiscCabinetViewData();
      data.cabinetId = cabinet.uuid;
      data.name = cabinet.name;
      data.available_size = cabinet.available_size;
      data.capacity = cabinet.size;
      data.model = cabinet.model;
      data.datacenter = cabinet.colocloud_set.length ? cabinet.colocloud_set.getFirst().name : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }
}

export class DeviceDiscCabinetViewData {
  cabinetId: string;
  name: string;
  available_size: string;
  capacity: number;
  model: string;
  datacenter: string;
  constructor() { }
}