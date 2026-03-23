import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DATACENTER_DELETE_COST_PLANNER, DATACENTER_GET_COST_PLANNER, DEVICES_FAST_BY_DEVICE_TYPE, EDIT_COST_PLANNER } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DatacenterCostPlannerDataType } from './dc-cost-analysis-cost-planner.type';

@Injectable()
export class DcCostAnalysisCostPlannerService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,) { }

  getDataCenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ), { params: new HttpParams().set('page_size', 0) })
  }

  getCostPlanners(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<DatacenterCostPlannerDataType>>(DATACENTER_GET_COST_PLANNER(), criteria);
  }

  convertToViewData(data: DatacenterCostPlannerDataType[]): CostPlannerViewData[] {
    let viewData: CostPlannerViewData[] = [];
    data.map(a => {
      let pd: CostPlannerViewData = new CostPlannerViewData();
      pd.id = a.id;
      pd.uuid = a.uuid;
      pd.name = a.name;
      pd.description = a.description;
      pd.datacenters = a.datacenter.map(dc => dc.id);
      pd.startDate = a.contract_start_date ? this.utilSvc.toUnityOneDateFormat(a.contract_start_date, 'MMM DD, y') : null;
      pd.endDate = a.contract_end_date ? this.utilSvc.toUnityOneDateFormat(a.contract_end_date, 'MMM DD, y') : null;
      pd.annualEscalation = a.annual_escalation;
      pd.dcForm = this.buildForm(_clone(pd.datacenters));
      pd.dcFormErrors = this.dcFormErrors;
      pd.dcFormValidationMessages = this.dcFormValidationMessages;
      viewData.push(pd);
    });
    return viewData;
  }

  buildForm(dcs: number[]) {
    return this.builder.group({
      'datacenter': [dcs, [Validators.required]]
    })
  }

  dcFormErrors() {
    let formErrors = {
      'datacenter': ''
    }
    return formErrors;
  }

  dcFormValidationMessages = {
    'datacenter': 'Datacenter is required'
  }

  updateDatacenterForPlanner(uuid: string, formData: number[]) {
    return this.http.patch(EDIT_COST_PLANNER(uuid), formData);
  }

  deleteCostPlanner(uuid: string) {
    return this.http.delete(DATACENTER_DELETE_COST_PLANNER(uuid));
  }
}

export class CostPlannerViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
  description: string;
  datacenters: number[];
  startDate: string;
  endDate: string;
  annualEscalation: number;
  dcForm: FormGroup;
  dcFormErrors: any;
  dcFormValidationMessages: any;
}

export class DatacenterViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
}