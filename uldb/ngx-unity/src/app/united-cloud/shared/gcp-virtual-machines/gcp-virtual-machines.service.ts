import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GET_GCP_VMS, TOGGLE_POWER_BY_DEVICE_TYPE, ADD_GCP_VMS, GET_GCP_VMS_METADATA, GET_GCP_VMS_MACHINE_TYPE, SYNC_GCP_VMS_WITH_ACCOUNT_AND_REGION, SYNC_ALL_GCP_VMS } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NoWhitespaceValidator, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';

@Injectable()
export class GcpVirtualMachinesService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService,
    private tableService: TableApiServiceService) { }

  getGCPVms(criteria: SearchCriteria): Observable<PaginatedResult<GCPVirtualMachine>> {
    return this.tableService.getData<PaginatedResult<GCPVirtualMachine>>(GET_GCP_VMS(), criteria);
  }

  updateIconStatus(data: GCPVirtualMachineViewData, instanceState: string) {
    if (instanceState === 'RUNNING') {

      data.powerTooltipMessage = 'Power Off';
      data.powerStatusOn = true;
    } else {
      data.powerTooltipMessage = 'Power On';
      data.powerStatusOn = false;
    }
    data.isPowerIconEnabled = true;
    data.powerStatusIcon = 'fa-power-off';
    return data;
  }

  convertToViewData(accounts: GCPVirtualMachine[]): GCPVirtualMachineViewData[] {
    let viewData: GCPVirtualMachineViewData[] = [];
    accounts.map(account => {
      let data = new GCPVirtualMachineViewData();
      data.name = account.name;
      data.status = account.status === 'RUNNING' ? 'Up' : 'Down';
      data.zone = account.zone;
      data.uuid = account.uuid;
      data.accountName = account.account.name;
      data.instanceId = account.instance_id;
      data.cpuPlatform = account.cpu_platform;
      data.operatingSystem = account.operating_system;
      data.internalIp = account.internal_ip;
      data.externalIp = account.external_ip;
      data.tags = Object.keys(account.tags).length === 0 ? null : account.tags;;
      data = this.updateIconStatus(data, account.status);
      viewData.push(data);
    });
    return viewData;
  }

  resetAddAccountFormErrors() {
    return {
      'name': '',
      'zone': '',
      'image': '',
      'machine_type': ''
    };
  }

  addAccountValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'zone': {
      'required': 'Zone is required'
    },
    'image': {
      'required': 'Image is required'
    },
    'machine_type': {
      'required': 'Machine Type is required'
    }
  }

  createAddAccountForm(): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'zone': ['', [Validators.required]],
      'image': ['', [Validators.required]],
      'machine_type': ['', [Validators.required]]
    });
  }

  addAccount(instanceId: string, data: { name: string, zone: string, image: string, machine_type: string }) {
    return this.http.post<CeleryTask>(ADD_GCP_VMS(instanceId), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  createTaskAndPoll(accountId: string, region: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>((accountId && region) ? SYNC_GCP_VMS_WITH_ACCOUNT_AND_REGION(accountId, region) : SYNC_ALL_GCP_VMS())
      .pipe(switchMap(res => {
        let interval = 1;
        let attempts = 50;
        if (!(accountId && region)) {
          interval = 3;
          attempts = 100;
        }
        return this.appService.pollForTask(res.task_id, interval, attempts).pipe(take(1))
      }), take(1));
  }

  getToggleInput(view: GCPVirtualMachineViewData): PowerToggleInput {
    return {
      confirmTitle: 'Google Cloud Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.uuid,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.GCP_VIRTUAL_MACHINE, userName: ''
    };
  }

  togglePowerStatus(input: PowerToggleInput): Observable<CeleryTask> {
    return this.http.get<CeleryTask>(TOGGLE_POWER_BY_DEVICE_TYPE(DeviceMapping.GCP_VIRTUAL_MACHINE, input.deviceId, input.currentPowerStatus));
  }

  getGCPVmMetadata(accountId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(GET_GCP_VMS_METADATA(accountId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  getMachineTypes(accountId: string, zone: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(GET_GCP_VMS_MACHINE_TYPE(accountId, zone))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  createTagsForm(tags: string[]): FormGroup {
    return this.builder.group({
      'tags': [tags],
    });
  }

  resetTagFormErrors() {
    return {
      'key': '',
      'value': ''
    }
  }

  tagValidationMessages = {
    'key': {
      'required': 'Key is required'
    },
    'value': {
      'required': 'Value is required'
    },
  }

  buildTagForm(obj?: { key: string, value: string }): FormGroup {
    return this.builder.group({
      'key': [obj ? obj.key : '', [Validators.required, NoWhitespaceValidator]],
      'value': [obj ? obj.value : '', [Validators.required, NoWhitespaceValidator]]
    })
  }

  updateTags(accountId: string, view: GCPVirtualMachineViewData, tags: { [key: string]: string }) {
    let obj: any = {};
    obj.tags = tags;
    return this.http.post<CeleryTask>(`UPDATE_AZURE_VM_TAGS(accountId)`, obj)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }
}

export class GCPVirtualMachineViewData {
  constructor() { }
  instanceId: string;
  uuid: string;
  name: string;
  status: string;
  zone: string;
  operatingSystem: string;
  cpuPlatform: string;
  machineType: string;
  internalIp: string[];
  externalIp: any;
  managementIp: any;
  powerStatusOn: boolean;
  accountName: string;
  powerTooltipMessage: string;
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin';
  isPowerIconEnabled: boolean;
  tags: any;
}

export interface GCPImageType {
  status: string;
  kind: string;
  sourceType: string;
  rawDisk: RawDisk;
  deprecated: Deprecated;
  labelFingerprint: string;
  description: string;
  archiveSizeBytes: string;
  diskSizeGb: string;
  creationTimestamp: string;
  id: string;
  selfLink: string;
  name: string;
}
interface RawDisk {
  containerType: string;
  source: string;
}
interface Deprecated {
  deleted: string;
  deprecated: string;
  state: string;
  obsolete: string;
  replacement: string;
}


export interface GCPMachineType {
  guestCpus: number;
  imageSpaceGb: number;
  kind: string;
  description: string;
  zone: string;
  maximumPersistentDisksSizeGb: string;
  maximumPersistentDisks: number;
  memoryMb: number;
  isSharedCpu: boolean;
  creationTimestamp: string;
  id: string;
  selfLink: string;
  name: string;
}
