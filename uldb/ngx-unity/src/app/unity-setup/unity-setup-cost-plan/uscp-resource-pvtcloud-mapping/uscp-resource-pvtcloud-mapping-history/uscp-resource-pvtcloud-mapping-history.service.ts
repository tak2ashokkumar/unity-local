import { formatNumber } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UscpResourcePvtcloudMappingHistoryService {



  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getHistoryRecords(uuid: string): Observable<ResourceMappingHistoryItem> {
    return this.http.get<ResourceMappingHistoryItem>(`/customer/resources/private_cloud_resources/private_cloud_plan_history/?uuid=${uuid}`);
  }

  convertToViewData(data: ResourceMappingHistoryItem[]): ResourceMappingHistoryItemViewData[] {
    let viewData: ResourceMappingHistoryItemViewData[] = [];
    data.map(a => {
      let ud: ResourceMappingHistoryItemViewData = new ResourceMappingHistoryItemViewData();
      ud.uuid = a.uuid;
      ud.mappingName = a.private_cloud.name;
      ud.cloudType = a.private_cloud.platform_type;
      ud.createdOn = a.created_date ? moment(a.created_date).format('DD-MMM-YYYY h:mm A') : null;
      ud.modifiedOn = a.modified_date ? moment(a.modified_date).format('DD-MMM-YYYY h:mm A') : null;
      ud.assignedAt = a.modified_date ? moment(a.modified_date).format('DD-MMM-YYYY h:mm A') : null;
      ud.removedAt = a.removed_at ? moment(a.removed_at).format('DD-MMM-YYYY h:mm A') : null;
      ud.createdBy = a.created_user;
      // ud.unitViceCost = formatNumber(Number(a.unit_vice_cost), 'en-US', '1.0-0');
      // ud.costUnit = a.price_unit;
      // ud.costTooltip = `${a.unit_vice_cost}/${a.price_unit}`;

      // ud.modifiedBy = a.modified_user;
      ud.isMaster = a.is_master;
      viewData.push(ud);
    });
    return viewData;
  }
}

export class ResourceMappingHistoryItemViewData {
  constructor() { }
  uuid: string;
  mappingName: string;
  cloudType: string;
  createdOn: string;
  createdBy: string;
  costTooltip: string;
  costUnit: string;
  unitViceCost: string;
  modifiedOn: string;
  assignedAt: string;
  removedAt: string;
  isMaster: boolean;
}



export interface ResourceMappingHistoryItem {
  id: number;
  uuid: string;
  customer: number;
  private_cloud: Private_cloud;
  resource: number;
  is_active: boolean;
  assigned_at: string;
  removed_at: null;
  created_date: string;
  modified_date: string;
  created_user: string;
  modified_user: string;
  cpu_size: number;
  memory_size: number;
  memory_unit: string;
  storage_size: number;
  storage_unit: string;
  number_of_disk: number;
  is_master: boolean;
  resource_mapping_uuid: string;
}
export interface Private_cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
  colocation_cloud: Colocation_cloud;
}
export interface Colocation_cloud {
  id: number;
  uuid: string;
  name: string;
}
