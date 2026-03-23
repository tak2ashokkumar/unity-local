import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EXPORT_COST_COMPARATOR_DATA_TO_EXCEL, SEND_COST_COMPARATOR_DATA_BY_EMAIL } from 'src/app/shared/api-endpoint.const';
import { Observable } from 'rxjs';
import { InstanceComparator } from '../cost-calculator.service';

@Injectable()
export class CostComparatorService {

  constructor(private http: HttpClient) { }

  getExportToUrlParams(instances: InstanceComparator[]): HttpParams {
    let params = new HttpParams();
    params = params.append('count', instances.length.toString());
    for (const instance of instances) {
      params = params.append('instanceCount', instance.instanceCount.toString());
      params = params.append('vCPURange', instance.cpuMinRange.toString() +
        ' to ' + instance.cpuMaxRange.toString());
      params = params.append('RAMRange', instance.ramMinRange.toString() +
        ' to ' + instance.ramMaxRange.toString());
      params = params.append('storageCount', instance.storageCount.toString());
      params = params.append('term', instance.commitment.displayText.toString());
      if (instance.aws) {
        params = params.append('awsTotalBill', instance.aws.totalBill.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + 
          + " " + instance.aws.instanceName + instance.aws.storage);
      }
      if (instance.azure) {
        params = params.append('azureTotalBill', instance.azure.totalBill.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + 
          + " " + instance.azure.instanceName + instance.azure.storage);
      }
      if (instance.g3_cloud) {
        params = params.append('g3_cloudTotalBill', instance.g3_cloud.totalBill.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + 
          + " " + instance.g3_cloud.instanceName + instance.g3_cloud.storage);
      }
      if (instance.gcp) {
        params = params.append('gcpTotalBill', instance.gcp.totalBill.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + 
          + " " + instance.gcp.instanceName + instance.gcp.storage);
      }
    }
    return params;
  }

  exportToExcel(instances: InstanceComparator[]): string {
    return EXPORT_COST_COMPARATOR_DATA_TO_EXCEL(this.getExportToUrlParams(instances));
  }

  sendEmail(instances: InstanceComparator[]): Observable<string>{
    return this.http.post<string>(SEND_COST_COMPARATOR_DATA_BY_EMAIL(), instances);
  }
}
