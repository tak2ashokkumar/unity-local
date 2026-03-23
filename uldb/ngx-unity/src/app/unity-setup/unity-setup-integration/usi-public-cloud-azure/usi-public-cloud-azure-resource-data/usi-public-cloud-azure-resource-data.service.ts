import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiPublicCloudAzureResourceDataService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getResourceData(instanceId: string, resourceId: string): Observable<any> {
    return this.http.get<any>(`/customer/integration/azure/accounts/${instanceId}/resources/${resourceId}/`);
  }

  convertToViewData(d: any): AzureAccountResourceDetailsViewData {
    if (!d || !d.name) {
      return;
    }

    if (d.resources) {
      delete (d.resources);
    }
    d.ipAddress = d.ipAddress ? d.ipAddress : 'NA';

    let a = new AzureAccountResourceDetailsViewData();
    a.name = d.name;
    a.attrs = this.utilSvc.parseUnKnownObj(d);
    return a;
  }
}

export class AzureAccountResourceDetailsViewData {
  constructor() { }
  name: string;
  attrs: any;
}

export class AzureAccountResourcePropertiesViewData {
  attributes: { [key: string]: any } = [];
  objects: any[] = [];
  lists: any[] = [];
}