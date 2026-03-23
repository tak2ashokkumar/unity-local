import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GET_DASHBOARD_DOCKERS_CONTROLLERS } from 'src/app/shared/api-endpoint.const';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DashboardDockersControllers } from './dashboard-dockers-controller.type';

@Injectable()
export class DashboardDockersControllerService {

  constructor(private http: HttpClient) { }

  getDockersControllers(): Observable<DashboardDockersControllers[]> {
    return this.http.get<DashboardDockersControllers[]>(GET_DASHBOARD_DOCKERS_CONTROLLERS())
  }

  getDrilldownLink(cloudType: string, cloudId: string, controllerId: string) {
    switch (cloudType) {
      case PlatFormMapping.AWS: return `/unitycloud/publiccloud/aws/overview/${cloudId}/us-east-1/containercontrollers/docker/${controllerId}/dockernodes`;
      case PlatFormMapping.AZURE: return `/unitycloud/publiccloud/azure/dashboard/${cloudId}/resourcegroups/Kubernetes/overview/containercontrollers/docker/${controllerId}/dockernodes`;
      case PlatFormMapping.GCP: return `/unitycloud/publiccloud/gcp/overview/${cloudId}/us-east1/containercontrollers/docker/${controllerId}/dockernodes`;
      case PlatFormMapping.VMWARE:
      case PlatFormMapping.VMWARE_TYPE:
      case PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
      case PlatFormMapping.OPENSTACKClOUD:
      case PlatFormMapping.VCLOUD:
      case PlatFormMapping.CUSTOM: return `/unitycloud/pccloud/${cloudId}/containercontrollers/docker/${controllerId}/dockernodes`;
      default: console.log('cloud type not listed for : ', cloudType);
    }
  }

  convertToViewData(controllers: DashboardDockersControllers[]): DashboardDockersControllersViewData {
    let viewData: DashboardDockersControllersViewData = new DashboardDockersControllersViewData();
    viewData.isAvailable = controllers.length > 0;
    controllers.map(controller => {
      let a: DashboardDockerControllersView = new DashboardDockerControllersView();
      a.controllerId = controller.uuid;
      a.name = controller.name;
      a.cloudId = controller.cloud.id ? controller.cloud.id : controller.cloud.uuid;
      a.cloudUUID = controller.cloud.uuid;
      a.cloudName = controller.cloud.name;
      a.platformType = controller.cloud.platform_type;
      a.loaderName = `${controller.name}${controller.uuid}`;
      a.drillDownLink = this.getDrilldownLink(a.platformType, a.cloudId, a.controllerId);
      controller.is_native ? viewData.nativeDockers.push(a) : viewData.dockerSwarms.push(a);
    });
    return viewData;
  }
}

export class DashboardDockersControllersViewData {
  constructor() { }
  dockerSwarms: DashboardDockerControllersView[] = [];
  nativeDockers: DashboardDockerControllersView[] = [];
  isAvailable: boolean = false;
}

export class DashboardDockerControllersView {
  controllerId: string;
  name: string;
  cloudId: string;
  cloudUUID: string;
  cloudName: string;
  platformType: string;
  loaderName: string;
  drillDownLink: string;
  constructor() { }
}