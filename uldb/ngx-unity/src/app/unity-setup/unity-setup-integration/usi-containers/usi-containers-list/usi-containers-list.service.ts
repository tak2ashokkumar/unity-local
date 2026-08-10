import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { DELETE_CONTAINER_CONTROLLER, EDIT_CONTAINER_CONTROLLER, GET_DOCKER_CONTROLLERS, KUBERNETES_ACCOUNTS, KUBERNETES_ACCOUNT_BY_ID, KUBERNETES_DISCOVER_RESOURCES, KUBERNETES_SYNC_RESOURCES } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CONTROLLER_TYPE_MAPPING, ContainerControllerType } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsiContainersListService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilService: AppUtilityService) { }

  getControllers(criteria: SearchCriteria, controllerType: CONTROLLER_TYPE_MAPPING): Observable<any> {
    // Kubernetes reads customer/kubernetes/accounts; Docker reads its own customer/docker/account.
    let url = controllerType == CONTROLLER_TYPE_MAPPING.KUBERNETES ? KUBERNETES_ACCOUNTS() : GET_DOCKER_CONTROLLERS();
    return this.tableService.getData<any>(url, criteria);
  }

  deleteController(controllerId: string, controllerType: CONTROLLER_TYPE_MAPPING): Observable<any> {
    if (controllerType == CONTROLLER_TYPE_MAPPING.KUBERNETES) {
      return this.http.delete(KUBERNETES_ACCOUNT_BY_ID(controllerId));
    }
    return this.http.delete(DELETE_CONTAINER_CONTROLLER(controllerId, controllerType));
  }

  // Account-less discovery. Fired best-effort when the Kubernetes list loads so resources are
  // fresh before the user drills in. Not a celery task - answers synchronously.
  discoverResources(): Observable<any> {
    return this.http.get(KUBERNETES_DISCOVER_RESOURCES());
  }

  syncResources(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_RESOURCES(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  updateDockerCredentials(controllerId: string, data: FormData): Observable<any> {
    return this.http.put(EDIT_CONTAINER_CONTROLLER(controllerId, CONTROLLER_TYPE_MAPPING.DOCKER), data);
  }

  buildDockerCredentialForm(): FormGroup {
    return this.builder.group({});
  }

  resetDockerCredentialErrors() {
    return { 'cert': '', 'key': '', 'ca': '' };
  }

  toDockerCredentialFormData(attachmentValue: any): FormData {
    const formData = new FormData();
    for (const key of Object.keys(attachmentValue)) {
      const value = attachmentValue[key];
      if (key.includes('unity-cert')) {
        formData.append('cert', this.appService.convertToBinary(value));
      } else if (key.includes('unity-key')) {
        formData.append('key', this.appService.convertToBinary(value));
      } else if (key.includes('unity-ca')) {
        formData.append('ca', this.appService.convertToBinary(value));
      }
    }
    return formData;
  }

  convertToViewdata(controllers: ContainerControllerType[], controllerType: CONTROLLER_TYPE_MAPPING): UsiContainersListViewdata[] {
    let viewData: UsiContainersListViewdata[] = [];
    (controllers || []).map(item => {
      let a = new UsiContainersListViewdata();
      a.controllerId = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.controllerType = item.controller_type ? item.controller_type : controllerType;
      a.displayType = item.display_type ? item.display_type : (controllerType == CONTROLLER_TYPE_MAPPING.DOCKER ? 'Docker' : 'Kubernetes');
      a.hostname = item.hostname ? item.hostname : 'N/A';
      if (item.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(item.status);
      }
      viewData.push(a);
    });
    return viewData;
  }
}

export class UsiContainersListViewdata {
  controllerId: string;
  name: string;
  controllerType: CONTROLLER_TYPE_MAPPING;
  displayType: string;
  hostname: string;
  deviceStatus: any;
  syncInProgress: boolean = false;
}
