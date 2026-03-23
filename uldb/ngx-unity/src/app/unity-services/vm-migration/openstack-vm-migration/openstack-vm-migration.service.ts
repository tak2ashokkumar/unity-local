import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OPENSTACK_VM_MIGRATE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { OpenStackMigrationType } from '../../vm-migration.type';

@Injectable()
export class OpenstackVmMigrationService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

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

  confirmMigrate(data: any) {
    return this.http.post(OPENSTACK_VM_MIGRATE(), data)
    // .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  convertToViewData(data: OpenStackMigrationType[]): OpenstackMigrationViewData[] {
    let viewData: OpenstackMigrationViewData[] = [];
    data.map(s => {
      let a: OpenstackMigrationViewData = new OpenstackMigrationViewData();
      a.name = s.name;
      a.uuid = s.uuid;
      a.instanceId = s.instance_id;
      a.vcpus = s.vcpu ? s.vcpu.toString() : 'N/A';
      a.memory = s.memory ? s.memory.toString() : 'N/A';
      a.osName = s.operating_system ? s.operating_system : 'N/A';
      a.disk = s.disk ? s.disk.toString() : 'N/A';
      a.ip = s.ip_address ? s.ip_address : 'N/A';
      a.powerStatus = s.last_known_state === 'ACTIVE' ? 'Up' : 'Down';
      a.migrationDate = s.migration_date ? this.utilSvc.toUnityOneDateFormat(s.migration_date) : 'N/A';
      a.migrationStatus = s.migration_status ? s.migration_status : 'N/A';

      viewData.push(a);
    });
    return viewData;
  }
}

export class OpenstackMigrationViewData {
  name: string;
  vcpus: string;
  memory: string;
  disk: string;
  osName: string;
  ip: string;
  instanceId: string;
  uuid: string;
  powerStatus: string;
  migrationStatus: string;
  migrationDate: string;
  constructor() { }
}