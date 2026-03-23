import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiPublicCloudOracleResourceDataService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getResourceData(instanceId: string, resourceId: string): Observable<any> {
    return this.http.get<any>(`/customer/integration/oci/accounts/${instanceId}/resources/${resourceId}/`);
  }

  convertToViewData(d: any): OracleAccountResourceDetailsViewData {
    if (!d) {
      return;
    }

    let a = new OracleAccountResourceDetailsViewData();
    a.name = d.name ? d.name : 'NA';

    a.resourceType = d.resource_type;
    a.resourceCreationTime = d.time_created;
    a.region = d.region;
    // a.availabilityZone = d.availabilityZone;
    if (d.configuration && Object.keys(d.configuration).length) {
      // d.configuration = JSON.parse(d.configuration);
      a.configuration = this.utilSvc.parseUnKnownObj(d.configuration);
    }
    return a;
  }
}

export class OracleAccountResourceDetailsViewData {
  constructor() { }
  name: string;

  resourceType: string;
  resourceCreationTime: string;
  region: string;
  availabilityZone: string;

  configuration: any;
  configurationItemCaptureTime: string;
  configurationItemStatus: string;

  supplementaryConfiguration: any;

  attrs: any;
}
