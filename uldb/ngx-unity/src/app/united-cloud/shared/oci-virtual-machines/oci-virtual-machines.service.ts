import { Injectable } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';
import { HttpClient } from '@angular/common/http';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { Observable } from 'rxjs';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { switchMap, take } from 'rxjs/operators';
import { SYNC_OCI_VMS_BY_ACCOUNT_ID, OCI_VMS_BY_VM_ID, OCI_VMS_ACTION_BY_VM_ID, OCI_COMPARTMENTS_BY_ACCOUNT_ID, OCI_AVAILABLILITY_DOMAIN_BY_ACCOUNT_ID, OCI_SHAPE_BY_ACCOUNT_ID, OCI_SUBNET_BY_ACCOUNT_ID, OCI_IMAGE_BY_ACCOUNT_ID, OCI_VMS_CREATE, OCI_VMS_TERMINATE_BY_VM_ID, OCI_REGIONS_BY_ACCOUNT_ID, GET_OCI_VMS, SYNC_ALL_OCI_VMS } from 'src/app/shared/api-endpoint.const';
import { OCIVMStates, OCIVmType, OCICompartmentType, OCIAvailabilityDomainType, OCIShapeType, OCISubnetType, OCIImageType, OCIRegionType } from './oci-vm-type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceStatusMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class OciVirtualMachinesService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  createTaskAndPoll(accountId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>((accountId) ? SYNC_OCI_VMS_BY_ACCOUNT_ID(accountId) : SYNC_ALL_OCI_VMS())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1))), take(1));
  }

  getVms(criteria: SearchCriteria): Observable<PaginatedResult<OCIVmType>> {
    return this.tableService.getData<PaginatedResult<OCIVmType>>(GET_OCI_VMS(), criteria);
  }

  getVmById(uuid: string) {
    return this.http.get<OCIVmType>(OCI_VMS_BY_VM_ID(uuid));
  }

  getCompartments(uuid: string) {
    return this.http.get<OCICompartmentType[]>(OCI_COMPARTMENTS_BY_ACCOUNT_ID(uuid));
  }

  getAvailabiltyDomain(uuid: string, compartmentId: string) {
    return this.http.get<OCIAvailabilityDomainType[]>(OCI_AVAILABLILITY_DOMAIN_BY_ACCOUNT_ID(uuid, compartmentId));
  }

  getShape(uuid: string, compartmentId: string) {
    return this.http.get<OCIShapeType[]>(OCI_SHAPE_BY_ACCOUNT_ID(uuid, compartmentId));
  }

  getSubnet(uuid: string, compartmentId: string) {
    return this.http.get<OCISubnetType[]>(OCI_SUBNET_BY_ACCOUNT_ID(uuid, compartmentId));
  }

  getImages(uuid: string, compartmentId: string, shape: string) {
    return this.http.get<OCIImageType[]>(OCI_IMAGE_BY_ACCOUNT_ID(uuid, compartmentId, shape));
  }

  getSubscribedRegions(uuid: string) {
    return this.http.get<OCIRegionType[]>(OCI_REGIONS_BY_ACCOUNT_ID(uuid));
  }

  convertVMtoViewdata(vm: OCIVmType) {
    let a = new OCIVMViewData();
    a.name = vm.name;
    a.uuid = vm.uuid;
    a.imageName = vm.shape ? vm.shape : 'N/A';
    a.ipAddress = vm.ip_address ? vm.ip_address : 'N/A';
    a.region = vm.region;
    a.availabilityDomain = vm.availability_zone ? vm.availability_zone : '';
    a.state = vm.status;
    a.account = vm.account;
    a.accountName = vm.account_name;
    a.tags = Object.keys(vm.tags).length === 0 ? null : vm.tags;
    return a;
  }

  converToViewData(vms: OCIVmType[]): OCIVMViewData[] {
    let viewData: OCIVMViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  powerToggle(vmUUID: string, data: { account: string, action: string }): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(OCI_VMS_ACTION_BY_VM_ID(vmUUID), data);
  }

  vmTerminate(vmUUID: string, data: { account: string }): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(OCI_VMS_TERMINATE_BY_VM_ID(vmUUID), data);
  }

  resetVmCreateFormErrors() {
    return {
      'name': '',
      'compartment_id': '',
      'availability_domain': '',
      'shape': '',
      'subnet_id': '',
      'image_id': '',
      'region': ''
    };
  }

  vmCreateValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'region': {
      'required': 'Region is required'
    },
    'compartment_id': {
      'required': 'Compartment is required'
    },
    'availability_domain': {
      'required': 'Availability domain is required'
    },
    'shape': {
      'required': 'Shape is required'
    },
    'subnet_id': {
      'required': 'Subnet is required'
    },
    'image_id': {
      'required': 'Image is required'
    }
  }

  createVMForm(uuid: string): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'account': [uuid],
      'region': ['', [Validators.required]],
      'compartment_id': ['', [Validators.required]],
      'availability_domain': [{ value: '', disabled: true }, [Validators.required]],
      'subnet_id': [{ value: '', disabled: true }, [Validators.required]],
      'shape': [{ value: '', disabled: true }, [Validators.required]],
      'image_id': [{ value: '', disabled: true }, [Validators.required]]
    });
  }

  createVM(data: OCIVMCreateFormData): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(OCI_VMS_CREATE(), data);
  }

  buildTagForm(obj?: { key: string, value: string }): FormGroup {
    return this.builder.group({
      'key': [obj ? obj.key : '', [Validators.required, NoWhitespaceValidator]],
      'value': [obj ? obj.value : '', [Validators.required, NoWhitespaceValidator]]
    })
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

  updateTags(instanceId: string, tags: { [key: string]: string }) {
    let obj: any = {};
    obj.tags = tags;
    return this.http.post(`/customer/oci/instances/${instanceId}/associate_tag/`, obj);
  }

}

export class OCIVMCreateFormData {
  constructor() { }
  account: string;
  name: string;
  region: string;
  compartment_id: string;
  availability_domain: string;
  shape: string;
  subnet_id: string;
  image_id: string;
}

export class OCIVMViewData {
  uuid: string;
  name: string;
  imageName: string;
  ipAddress: string;
  region: string;
  createdDate: string;
  availabilityDomain: string;
  instanceId: string;
  compartmentId: string;
  account: number;
  accountName: string;
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin' = 'fa-power-off';
  powerTooltipMessage: string;
  tags: any;

  private _state: OCIVMStates;
  get state() {
    return this._state;
  }
  set state(state: OCIVMStates) {
    this._state = state;
    this.powerStatus = this._state.toString();
  }

  private _powerStatus: string;
  private _powerOnInProgress: boolean = false;
  private _powerOffInProgress: boolean = false;

  set powerOnInProgress(b: boolean) {
    this._powerOnInProgress = b;
  }
  set powerOffInProgress(b: boolean) {
    this._powerOffInProgress = b;
  }
  set powerStatus(status: string) {
    this._powerStatus = status;
  }
  get powerStatus() {
    if (this._powerStatus == OCIVMStates.RUNNING) {
      return 'Up';
    } else if (this._powerStatus == OCIVMStates.STOPPED) {
      return 'Down';
    } else if (this.powerInProgress) {
      return null;
    } else {
      return this.state;
    }
  }
  get powerStatusOn() {
    return this.powerStatus == 'Up';
  }
  private get powerInProgress() {
    return this._powerOnInProgress || this._powerOffInProgress || this.state == OCIVMStates.STOPPING || this.state == OCIVMStates.STARTING;
  }
  setPowerInProgress() {
    if (this.powerStatusOn) {
      this._powerOffInProgress = true;
      this._powerOnInProgress = false;
    } else {
      this._powerOnInProgress = true;
      this._powerOffInProgress = false;
    }
    this.powerStatus = null;
  }
  get powerIconMsg() {
    if (this.state == OCIVMStates.RUNNING) {
      return 'Stop'
    } else if (this.state == OCIVMStates.STOPPED) {
      return 'Start';
    } else {
      return this.state;
    }
  }
  get powerIcon() {
    return this.powerInProgress ? 'fa fa-spinner fa-spin' : 'fa-power-off';
  }
  get powerIconEnabled() {
    return this.state == OCIVMStates.RUNNING || this.state == OCIVMStates.STOPPED;
  }

  private _terminateInProgress: boolean = false;
  private set terminateInProgress(b: boolean) {
    this._terminateInProgress = b;
  }
  private get terminateInProgress() {
    return this._terminateInProgress || this.state == OCIVMStates.TERMINATING;
  }
  setTerminateInProgress() {
    this._terminateInProgress = true;
  }
  get terminateIconMsg() {
    return this.terminateInProgress ? this.state : 'Terminate';
  }
  get terminateIcon() {
    return this.terminateInProgress ? 'fa fa-spinner fa-spin' : 'fa-ban';
  }
  get terminateIconEnabled() {
    return this.state == OCIVMStates.RUNNING || this.state == OCIVMStates.STOPPED;
  }
  constructor() { }
}

export enum OCI_VM_ACTIONS {
  STOP = 'Stop',
  START = 'Start',
  TERMINATE = 'Terminate'
}
