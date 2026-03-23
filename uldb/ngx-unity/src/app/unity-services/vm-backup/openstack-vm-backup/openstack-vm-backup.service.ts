import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { OPENSTACK_VM_AWS_BACKUP, OPENSTACK_VM_BACKUP_HISTORY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { OpenStackMigrationType } from '../../vm-migration.type';

@Injectable()
export class OpenstackVmBackupService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,) { }

  confirmVmwareBackup(data: any) {
    return this.http.post(OPENSTACK_VM_AWS_BACKUP(), data);
  }

  osBackupHistory(backupId: number): Observable<OpenStackBackupHistory> {
    return this.http.get<OpenStackBackupHistory>(OPENSTACK_VM_BACKUP_HISTORY(backupId));
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

  resetAWSBackupFormErrors() {
    return {
      'aws_account': '',
      'region': '',
      'bucket': ''
    };
  }

  validationMessagesAWSBackup = {
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

  createAWSBackupForm(): FormGroup {
    return this.builder.group({
      'aws_account': ['', [Validators.required, NoWhitespaceValidator]],
      'region': ['', [Validators.required, NoWhitespaceValidator]],
      'bucket': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  createAzureBackupForm(): FormGroup {
    return this.builder.group({
      'azure_account': ['', [Validators.required, NoWhitespaceValidator]],
      'resource_group': ['', [Validators.required, NoWhitespaceValidator]],
      'storage_account': ['', [Validators.required, NoWhitespaceValidator]],
      'container': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetAzureBackupFormErrors() {
    return {
      'azure_account': '',
      'resource_group': '',
      'storage_account': '',
      'container': ''
    };
  }

  validationMessagesAzureBackup = {
    'azure_account': {
      'required': 'This field is required'
    },
    'resource_group': {
      'required': 'This field  is required'
    },
    'storage_account': {
      'required': 'This field  is required'
    },
    'container': {
      'required': 'This field  is required'
    },
  }

  convertToViewData(data: OpenStackMigrationType[]): OpenstackBackupViewData[] {
    let viewData: OpenstackBackupViewData[] = [];
    data.map(s => {
      let a: OpenstackBackupViewData = new OpenstackBackupViewData();
      a.name = s.name
      a.id = s.id;
      a.vcpus = s.vcpu ? s.vcpu.toString() : 'N/A';
      a.memory = s.memory ? s.memory.toString() : 'N/A';
      a.instanceId = s.instance_id;
      a.osName = s.operating_system ? s.operating_system : 'N/A';
      a.powerStatus = s.last_known_state === 'ACTIVE' ? 'Up' : 'Down';
      a.disk = s.disk ? s.disk.toString() : 'N/A';
      a.ip = s.ip_address ? s.ip_address : 'N/A';
      a.backupDate = s.backup_date ? this.utilSvc.toUnityOneDateFormat(s.backup_date) : 'N/A';
      a.backupStatus = s.backup_status ? s.backup_status : 'N/A';

      a.backupEnabled = ((s.backup_status == null) || (s.backup_status == 'Backup to Azure Complete') ||
        (s.backup_status == 'Backup to Amazon S3 Complete') || (s.backup_status == 'Operation Failed'));

      a.backupToAwsTooltipMessage = a.backupEnabled ? 'Backup to AWS' : '';
      a.backupToAzureTooltipMessage = a.backupEnabled ? 'Backup to Azure' : '';

      viewData.push(a);
    });
    return viewData;
  }
}

export class OpenstackBackupViewData {
  name: string;
  id: number;
  vcpus: string;
  memory: string;
  disk: string;
  osName: string;
  ip: string;
  instanceId: string;
  powerStatus: string;
  backupStatus: string;
  backupDate: string;
  backupEnabled: boolean;
  backupToAwsTooltipMessage: string;
  backupToAzureTooltipMessage: string;

  constructor() { }
}