import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GET_DASHBOARD_KUBERNETES_CONTROLLERS } from 'src/app/shared/api-endpoint.const';
import { DashboardKubernetesControllers } from './dashboard-kuberneters-controllers.type';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class DashboardKubernetesControllersService {

  constructor(private http: HttpClient) { }

  getKubernetesControllers(): Observable<DashboardKubernetesControllers[]> {
    return this.http.get<DashboardKubernetesControllers[]>(GET_DASHBOARD_KUBERNETES_CONTROLLERS())
  }

  getDrilldownLink(cloudType: string, cloudId: string, controllerId: string) {
    switch (cloudType) {
      case PlatFormMapping.AWS: return `/unitycloud/publiccloud/aws/overview/${cloudId}/us-east-1/containercontrollers/kubernetes/${controllerId}/pods`;
      case PlatFormMapping.AZURE: return `/unitycloud/publiccloud/azure/dashboard/${cloudId}/resourcegroups/Kubernetes/overview/containercontrollers/kubernetes/${controllerId}/pods`;
      case PlatFormMapping.GCP: return `/unitycloud/publiccloud/gcp/overview/${cloudId}/us-east1/containercontrollers/kubernetes/${controllerId}/pods`;
      case PlatFormMapping.VMWARE:
      case PlatFormMapping.VMWARE_TYPE:
      case PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
      case PlatFormMapping.OPENSTACKClOUD:
      case PlatFormMapping.VCLOUD:
      case PlatFormMapping.CUSTOM: return `/unitycloud/pccloud/${cloudId}/containercontrollers/kubernetes/${controllerId}/pods`;
      default: console.log('cloud type not listed for : ', cloudType);
    }
  }

  convertToViewData(controllers: DashboardKubernetesControllers[]): DashboardKubernetesControllersViewData[] {
    let viewData: DashboardKubernetesControllersViewData[] = [];

    controllers.map(controller => {
      let a: DashboardKubernetesControllersViewData = new DashboardKubernetesControllersViewData();
      a.controllerId = controller.uuid;
      a.name = controller.name;
      a.cloudId = controller.cloud.id ? controller.cloud.id : controller.cloud.uuid;
      a.cloudUUID = controller.cloud.uuid;
      a.cloudName = controller.cloud.name;
      a.platformType = controller.cloud.platform_type;
      a.loaderName = `${controller.name}${controller.uuid}`;
      a.drillDownLink = this.getDrilldownLink(a.platformType, a.cloudId, a.controllerId);
      viewData.push(a);
    })

    return viewData;
  }
}
export class DashboardKubernetesControllersViewData {
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
