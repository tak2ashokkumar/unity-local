import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CREATE_VCENTER_SNAPSHOT, DELETE_ALL_VCENTER_SNAPSHOT, DELETE_VCENTER_SNAPSHOT, GET_VCENTER_SNAPSHOT, REVERT_VCENTER_SNAPSHOT } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';

@Injectable()
export class VmsVmwareSnapshotsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getSnapShots(uuid: string) {
    return this.http.get<CeleryTask>(GET_VCENTER_SNAPSHOT(uuid));
  }

  convertToViewdata(snapshots: VmsVmwareSnapshotType[]) {
    let viewData: VmsVmwareSnapshotViewdata[] = [];
    snapshots.forEach(s => {
      let data = new VmsVmwareSnapshotViewdata();
      data.name = s.Name;
      data.description = s.Description;
      data.createTime = s.CreateTime;
      data.createTime = s.CreateTime ? this.utilSvc.toUnityOneDateFormat(s.CreateTime) : 'N/A';
      data.state = s.State;
      data.active = s.active;
      viewData.push(data);
    });
    return viewData;
  }

  buildForm() {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'description': ['', [NoWhitespaceValidator]],
      'memory': [{ value: true, disabled: false }, [Validators.required]],
      'quiesce': [{ value: false, disabled: true }, [Validators.required]],
    });
  }

  resetSnapshotFormErrors() {
    return {
      'name': '',
      'description': '',
      'memory': '',
      'quiesce': ''
    }
  }

  snapshotFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    }
  }

  createSnapshot(uuid: string, data: VmsVmwareSnapshotType) {
    return this.http.post<CeleryTask>(CREATE_VCENTER_SNAPSHOT(uuid), data);
  }

  deleteSnapshot(uuid: string, view: VmsVmwareSnapshotViewdata) {
    return this.http.post<CeleryTask>(DELETE_VCENTER_SNAPSHOT(uuid), { snapshot: view.name });
  }

  deleteAllSnapshots(uuid: string) {
    return this.http.post<CeleryTask>(DELETE_ALL_VCENTER_SNAPSHOT(uuid), {});
  }

  revertSnapshot(uuid: string, view: VmsVmwareSnapshotViewdata) {
    return this.http.post<CeleryTask>(REVERT_VCENTER_SNAPSHOT(uuid), { snapshot: view.name });
  }
}
export class VmsVmwareSnapshotViewdata {
  constructor() { }
  isCollapsed: boolean = true;
  name: string;
  description: string;
  state: string;
  createTime: string;
  active: boolean;
}

export interface VmsVmwareSnapshotType {
  State: string;
  CreateTime: string;
  Name: string;
  Description: string;
  active: boolean;
}