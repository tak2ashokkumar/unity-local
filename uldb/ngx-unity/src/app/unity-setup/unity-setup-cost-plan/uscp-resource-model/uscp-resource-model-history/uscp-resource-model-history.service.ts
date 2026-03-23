import { Injectable } from '@angular/core';
import { ReourceHistoryItem, ResourcePlanDataType } from '../uscp-resource-model.type';
import { Observable } from 'rxjs';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { HttpClient } from '@angular/common/http';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import moment from 'moment';
import { formatNumber } from '@angular/common';

@Injectable()
export class UscpResourceModelHistoryService {


  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getHistoryRecords(uuid: string): Observable<ResourcePlanDataType> {
    return this.http.get<ResourcePlanDataType>(`customer/resources/resource_plan/resource_plan_history?uuid=${uuid}`);
  }

  convertToViewData(data: ReourceHistoryItem[]): ReourceHistoryItemViewData[] {
    let viewData: ReourceHistoryItemViewData[] = [];
    data.map(a => {
      let ud: ReourceHistoryItemViewData = new ReourceHistoryItemViewData();
      ud.uuid = a.uuid;
      ud.resourceName = a.resource_name;
      ud.cloudType = a.cloud_type;
      ud.createdOn = a.created_date ? moment(a.created_date).format('DD-MMM-YYYY h:mm A') : null;
      // ud.modifiedOn = a.modified_date ? moment(a.modified_date).format('DD-MMM-YYYY h:mm A') : null;
      ud.createdBy = a.created_user;
      ud.unitViceCost = formatNumber(Number(a.unit_vice_cost), 'en-US', '1.0-2');
      ud.costUnit = a.price_unit;
      ud.costTooltip = `${a.unit_vice_cost}/${a.price_unit}`;
      // ud.modifiedBy = a.modified_user;
      ud.isMaster = a.is_master;
      viewData.push(ud);
    });
    return viewData;
  }
}

export class ReourceHistoryItemViewData {
  constructor() { }
  uuid: string;
  resourceName: string;
  cloudType: string;
  createdOn: string;
  createdBy: string;
  costTooltip: string;
  costUnit: string;
  unitViceCost: string;
  isMaster: boolean;
}


