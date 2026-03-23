import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiPublicCloudGcpResourceDataService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getResourceData(instanceId: string, resourceId: string): Observable<any> {
    return this.http.get<any>(`/customer/integration/gcp/accounts/${instanceId}/resources/${resourceId}/`);
    // return of({
    //   "status": "running",
    //   "description": "",
    //   "icon_path": "gcp.svg",
    //   "labels": {
    //     "goog-k8s-cluster-location": "us-central1-a",
    //     "goog-gke-node": "",
    //     "goog-gke-volume": "",
    //     "goog-k8s-cluster-name": "traffic-director-cluster",
    //     "goog-fleet-project": "1089443386270",
    //     "goog-k8s-node-pool-name": "default-pool"
    //   },
    //   "configuration": {
    //     "relationships": "None",
    //     "ancestors": "None",
    //     "display_name": "gke-traffic-director-clu-default-pool-e6fef2e2-wn24",
    //     "name": "//compute.googleapis.com/projects/istio-258306/zones/us-central1-a/disks/gke-traffic-director-clu-default-pool-e6fef2e2-wn24",
    //     "network_tags": "[]",
    //     "labels": {
    //       "goog-k8s-cluster-location": "us-central1-a",
    //       "goog-gke-node": "",
    //       "goog-gke-volume": "",
    //       "goog-k8s-cluster-name": "traffic-director-cluster",
    //       "goog-fleet-project": "1089443386270",
    //       "goog-k8s-node-pool-name": "default-pool"
    //     },
    //     "location": "us-central1-a",
    //     "additional_attributes": {
    //       "type": "pd-standard",
    //       "users": "values {\n  string_value: \"https://www.googleapis.com/compute/v1/projects/istio-258306/zones/us-central1-a/instances/gke-traffic-director-clu-default-pool-e6fef2e2-wn24\"\n}\n",
    //       "sizeGb": 100
    //     },
    //     "asset_type": "compute.googleapis.com/Disk",
    //     "description": ""
    //   },
    //   "asset_type": "compute.googleapis.com/Disk",
    //   "relationships": null,
    //   "display_name": "gke-traffic-director-clu-default-pool-e6fef2e2-wn24",
    //   "name": "//compute.googleapis.com/projects/istio-258306/zones/us-central1-a/disks/gke-traffic-director-clu-default-pool-e6fef2e2-wn24",
    //   "service": "Compute",
    //   "resourceType": "Disk",
    //   "region": "us-central1-a",
    //   "location": "us-central1-a",
    //   "accountID": "gcp test"
    // })

  }

  convertToViewData(d: any): GCPAccountResourceDetailsViewData {
    if (!d) {
      return;
    }

    let a = new GCPAccountResourceDetailsViewData();
    a.name = d.display_name ? d.display_name : 'NA';
    a.accountID = d.accountID ? d.accountID : 'NA';
    a.assetType = d.asset_type ? d.asset_type : 'NA';
    a.region = d.region ? d.region : 'NA';
    a.location = d.location ? d.location : 'NA';
    a.status = d.status ? d.status : 'NA';
    a.service = d.service ? d.service : 'NA';
    a.displayName = d.name ? d.name : 'NA';
    a.resourceType = d.resourceType ? d.resourceType : 'NA';
    a.creationTimestamp = d.creationTimestamp ? d.creationTimestamp : 'NA';
    a.kind = d.kind ? d.kind : 'NA';
    if (d.labels && Object.keys(d.labels).length) {
      a.labels = this.utilSvc.parseUnKnownObj(d.labels);
    }

    if (d.configuration && Object.keys(d.configuration).length) {
      a.configuration = this.utilSvc.parseUnKnownObj(d.configuration);
    }
    return a;
  }
}


export class GCPAccountResourceDetailsViewData {
  constructor() { }
  status: string;
  icon_path: string;
  configuration: any;
  labels: any;
  creationTimestamp: string;
  id: string;
  kind: string;
  name: string;
  service: string;
  resourceType: string;
  region: string;
  location: string;
  type: any;
  selfLink: string;
  accountID: string;
  licenses: string[];
  users: string[];
  attrs: any;
  assetType: string;
  displayName: string;

}

export class GCPAccountResourcePropertiesViewData {
  attributes: { [key: string]: any } = [];
  objects: any[] = [];
  lists: any[] = [];
}
