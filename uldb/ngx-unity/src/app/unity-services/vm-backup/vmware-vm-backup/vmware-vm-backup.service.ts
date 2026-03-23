import { Injectable } from '@angular/core';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { VMwareMigrationType } from '../../vm-migration.type';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { VMWARE_AUTH_CHECK, VMWARE_VM_MIGRATE, VMWARE_VM_AWS_BACKUP, VMWARE_VM_BACKUP_HISTORY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { Observable } from 'rxjs';

@Injectable()
export class VmwareVmBackupService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,) { }

  checkVMWareCredentials(data: any) {
    return this.http.post(VMWARE_AUTH_CHECK(), data);
  }

  confirmVmwareBackup(data: any) {
    return this.http.post(VMWARE_VM_AWS_BACKUP(), data);
  }

  vmwareBackupHistory(backupId: number): Observable<VMwareBackupHistory> {
    return this.http.get<VMwareBackupHistory>(VMWARE_VM_BACKUP_HISTORY(backupId));
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

  convertToViewData(data: VMwareMigrationType[]): VMWareBackupViewData[] {
    let viewData: VMWareBackupViewData[] = [];
    data.map(s => {
      let a: VMWareBackupViewData = new VMWareBackupViewData();
      a.name = s.name
      a.osName = s.os_name;
      a.instanceId = s.instance_id;
      a.hostName = s.host_name;
      a.id = s.id;
      a.diskCapacity = s.disk_space;
      a.state = s.state === 'poweredOn' ? 'Up' : 'Down';
      a.datacenter = s.datacenter;
      a.guestMemory = s.guest_memory;
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


export class VMWareBackupViewData {
  name: string;
  uuid: string;
  id: number;
  osName: string;
  hostName: string;
  diskCapacity: string;
  state: string;
  instanceId: string;
  datacenter: string;
  guestMemory: string;
  backupDate: string;
  backupStatus: string;
  backupEnabled: boolean;
  backupToAwsTooltipMessage: string;
  backupToAzureTooltipMessage: string;

  constructor() { }
}