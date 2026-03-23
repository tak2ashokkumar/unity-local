import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { BUCostCenterApplications, BULicenceCostCenter, BusinessUnits } from '../../../business-services.type';

@Injectable({
  providedIn: 'root'
})
export class ServiceTopologyService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,) { }

  getBusinessUnits(): Observable<BusinessUnits[]> {
    const params: HttpParams = new HttpParams().set('page_size', 0)
    return this.http.get<BusinessUnits[]>(`/apm/topology/business_unit/`, { params: params });
  }

  getLisenceCostCenters(buId: string): Observable<BULicenceCostCenter[]> {
    const params: HttpParams = new HttpParams().set('business_id', buId)
    return this.http.get<BULicenceCostCenter[]>(`/apm/topology/business_unit/`, { params: params });
  }

  getApplications(buId: string, costCenterIds: number[]): Observable<BUCostCenterApplications[]> {
    let params: HttpParams = new HttpParams().set('business_id', buId);
    costCenterIds.forEach(id => {
      params = params.append('license_id', id.toString());
    });
    return this.http.get<BUCostCenterApplications[]>('/apm/topology/business_unit/', { params: params });
  }

  buildForm(buId: string) {
    return this.builder.group({
      'businessUnit': [{ value: buId, disabled: true }],
      'licenseCostCenter': ['all'],
      'application': ['all'],
    });
  }

  buildNodeStatusFilterForm() {
    return this.builder.group({
      'nodeStatus': ['all']
    });
  }

  getSummaryDetails(selectedBU?: string, selectedApp?: string) {
    if (selectedBU == 'all') {
      return this.http.get<any>(`/apm/topology/app_service_topology_details/`);
    } else {
      if (selectedApp) {
        return this.http.get<any>(`/apm/topology/app_service_topology_details/?layer=${selectedApp}`);
      }
    }
  }
}

export class UnityTopologyViewType {
  constructor() { }
  view: string;
  viewToRender: string;
  node?: string;
  nodeId?: string;
  showCompleteTopology: boolean;
}

export const viewTypes: UnityTopologyViewType[] = [
  { viewToRender: 'Datacenter', view: 'colocloud', node: "org", showCompleteTopology: false },
  { viewToRender: 'Private Cloud', view: 'private_cloud', node: "org", showCompleteTopology: false },
  { viewToRender: 'Public Cloud', view: 'public_cloud', node: "account", showCompleteTopology: false },
];