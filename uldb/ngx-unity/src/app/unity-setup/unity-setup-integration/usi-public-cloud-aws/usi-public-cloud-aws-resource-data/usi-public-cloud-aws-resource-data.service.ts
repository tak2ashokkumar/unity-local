import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiPublicCloudAwsResourceDataService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getResourceData(instanceId: string, resourceId: string): Observable<any> {
    return this.http.get<any>(`/customer/integration/aws/accounts/${instanceId}/resources/${resourceId}/`);
  }

  convertToViewData(d: any): AWSAccountResourceDetailsViewData {
    if (!d) {
      return;
    }

    let a = new AWSAccountResourceDetailsViewData();
    a.name = d.resourceName ? d.resourceName : 'NA';

    a.resourceType = d.resourceType;
    a.resourceCreationTime = d.resourceCreationTime;
    a.region = d.awsRegion;
    a.availabilityZone = d.availabilityZone;
    if (d.configuration && Object.keys(d.configuration).length) {
      d.configuration = JSON.parse(d.configuration);
      d.configuration.configurationItemCaptureTime = d.configurationItemCaptureTime;
      d.configuration.configurationItemStatus = d.configurationItemStatus;
      a.configuration = this.utilSvc.parseUnKnownObj(d.configuration);
    }

    let supplementaryConfigKeys = d.supplementaryConfiguration ? Object.keys(d.supplementaryConfiguration) : [];
    if (supplementaryConfigKeys.length) {
      a.supplementaryConfiguration = this.utilSvc.parseUnKnownObj(d.supplementaryConfiguration);
    }
    return a;
  }
}


export class AWSAccountResourceDetailsViewData {
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

export class AWSAccountResourcePropertiesViewData {
  attributes: { [key: string]: any } = [];
  objects: any[] = [];
  lists: any[] = [];
}
