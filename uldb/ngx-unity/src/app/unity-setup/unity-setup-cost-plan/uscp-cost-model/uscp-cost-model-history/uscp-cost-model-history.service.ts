import { formatNumber } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { CostModelHistoryItem } from '../uscp-cost-model.type';

@Injectable()
export class UscpCostModelHistoryService {


  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getHistoryRecords(uuid: string): Observable<CostModelHistoryItem> {
    return this.http.get<CostModelHistoryItem>(` /customer/cost_plan/private_cost_plan/cost_plan_history/?uuid=${uuid}`);
  }

  convertToViewData(data: CostModelHistoryItem[]): CostModelHistoryItemViewData[] {
    let viewData: CostModelHistoryItemViewData[] = [];
    data.map(a => {
      let ud: CostModelHistoryItemViewData = new CostModelHistoryItemViewData();
      ud.uuid = a.uuid;
      ud.planName = a.plan_name;
      ud.planType = a.plan_type;
      ud.priceUnit = a.price_unit;
      ud.priceAllocation = a.price_allocation;
      ud.createdOn = a.created_date ? moment(a.created_date).format('DD-MMM-YYYY h:mm A') : null;
      // ud.modifiedOn = a.modified_date ? moment(a.modified_date).format('DD-MMM-YYYY h:mm A') : null;
      ud.createdBy = a.created_user;
      ud.unitViceCost = formatNumber(Number(a.unit_cost_price), 'en-US', '1.0-2');
      ud.costUnit = a.price_unit;
      ud.costTooltip = `${a.unit_cost_price}/${a.price_unit}`;

      // ud.modifiedBy = a.modified_user;
      ud.isMaster = a.is_master;
      viewData.push(ud);
    });
    return viewData;
  }
}

export class CostModelHistoryItemViewData {
  constructor() { }
  uuid: string;
  planName: string;
  priceUnit: string;
  planType: string;
  createdOn: string;
  createdBy: string;
  costTooltip: string;
  priceAllocation
  costUnit: string;
  unitViceCost: string;
  isMaster: boolean;
}
