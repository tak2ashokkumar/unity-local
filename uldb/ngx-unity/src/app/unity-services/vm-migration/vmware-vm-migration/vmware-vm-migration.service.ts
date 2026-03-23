import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VMWARE_AUTH_CHECK, VMWARE_VM_MIGRATE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { VMwareMigrationType } from '../../vm-migration.type';

@Injectable()
export class VmwareVmMigrationService {

  constructor(
    private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  checkVMWareCredentials(data: any) {
    return this.http.post(VMWARE_AUTH_CHECK(), data);
  }

  confirmMigrate(data: any) {
    // return this.http.post<CeleryTask>(VMWARE_VM_MIGRATE(), data)
    //   .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
    return this.http.post(VMWARE_VM_MIGRATE(), data);
  }


  resetFormErrors() {
    return {
      'username': '',
      'password': '',
    };
  }

  validationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
  }

  createForm(): FormGroup {
    return this.builder.group({
      'username': ['', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetMigrationFormErrors() {
    return {
      'aws_account': '',
      'region': '',
      'bucket': ''
    };
  }

  validationMessagesMigration = {
    'aws_account': {
      'required': 'This field is required'
    },
    'region': {
      'required': 'This field  is required'
    },
    'bucket': {
      'required': 'This field  is required'
    },
  }

  createMigrationForm(): FormGroup {
    return this.builder.group({
      'aws_account': ['', [Validators.required, NoWhitespaceValidator]],
      'region': ['', [Validators.required, NoWhitespaceValidator]],
      'bucket': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  convertToViewData(data: VMwareMigrationType[]): VMWareMigrationViewData[] {
    let viewData: VMWareMigrationViewData[] = [];
    data.map(s => {
      let a: VMWareMigrationViewData = new VMWareMigrationViewData();
      a.name = s.name;
      a.uuid = s.uuid;
      a.instanceId = s.instance_id;
      a.osName = s.os_name;
      a.hostName = s.host_name;
      a.diskCapacity = s.disk_space;
      a.state = s.state === 'poweredOn' ? 'Up' : 'Down';
      a.datacenter = s.datacenter;
      a.guestMemory = s.guest_memory;
      a.migrationDate = s.migration_date ? this.utilSvc.toUnityOneDateFormat(s.migration_date) : 'N/A';
      a.migrationStatus = s.migration_status ? s.migration_status : 'N/A';

      viewData.push(a);
    });
    return viewData;
  }
}


export class VMWareMigrationViewData {
  name: string;
  uuid: string;
  osName: string;
  hostName: string;
  diskCapacity: string;
  state: string;
  datacenter: string;
  guestMemory: string;
  migrationDate: string;
  instanceId: string;
  migrationStatus: string;

  constructor() { }
}