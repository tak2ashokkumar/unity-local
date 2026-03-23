import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { VmBackupService } from '../vm-backup.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject, interval } from 'rxjs';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil, tap, switchMap, takeWhile } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VMwareMigrationType } from '../../vm-migration.type';
import { VmwareVmBackupService, VMWareBackupViewData } from './vmware-vm-backup.service';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'vmware-vm-backup',
  templateUrl: './vmware-vm-backup.component.html',
  styleUrls: ['./vmware-vm-backup.component.scss'],
  providers: [VmwareVmBackupService]
})
export class VmwareVmBackupComponent implements OnInit, OnDestroy {
  @Input() cloud: PrivateCLoudFast;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  authData: any;
  vmId: string;
  backupType: string;
  viewData: any[] = [];
  count: number = 0;
  awsRegions: any[] = [];
  awsBuckets: any[] = [];
  awsAccounts: AWSAccount[] = [];
  backuphistory: any[] = [];
  azureAccounts: AzureAccount[] = [];
  resourceGroups: AzureResourceGroup[] = [];
  storageAccounts: AzureStorageAccount[] = [];
  containers: AzureContainer[] = [];
  poll: boolean = false;
  syncInProgress: boolean = false;

  @ViewChild('auth') auth: ElementRef;
  authModalRef: BsModalRef;
  authFormErrors: any;
  authValidationMessages: any;
  authForm: FormGroup;

  @ViewChild('awsbackup') awsbackup: ElementRef;
  backupAWSModalRef: BsModalRef;
  backupAWSFormErrors: any;
  backupAWSValidationMessages: any;
  backupAWSForm: FormGroup;

  @ViewChild('azurebackup') azurebackup: ElementRef;
  backupAzureModalRef: BsModalRef;
  backupAzureFormErrors: any;
  backupAzureValidationMessages: any;
  backupAzureForm: FormGroup;

  @ViewChild('backupHistory') vmwarebackupHistory: ElementRef;
  backupHistoryModalRef: BsModalRef;

  constructor(private backupService: VmBackupService,
    private vmwareService: VmwareVmBackupService,
    private spinnerService: AppSpinnerService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private termService: FloatingTerminalService) {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ cloud_id: '' }]
    }
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getMigrationVMsControllers()
      });
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getMigrationVMsControllers();
    this.GET_AWS_ACCOUNTS();
    this.getAzureAccounts();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getVMsFromDB();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVMsFromDB();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVMsFromDB();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVMsFromDB();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMigrationVMsControllers();
  }

  getMigrationVMsControllers() {
    if (this.syncInProgress) {
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.backupService.getVMMigrations(this.cloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      if (status.result.data) {
        this.getVMsFromDB();
      } else {
        this.notificationService.error(new Notification(status.result.message));
      }
      this.syncInProgress = false;
      this.subscribeToTerminal();
      this.spinnerService.stop('main');
    }, err => {
      this.syncInProgress = false;
      this.subscribeToTerminal();
      this.spinnerService.stop('main');
    });
  }

  getVMsFromDB() {
    this.currentCriteria.params[0].cloud_id = this.cloud.uuid;
    this.backupService.getVMMigrationsFromDB<VMwareMigrationType>(this.currentCriteria, this.cloud.platform_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.count = data.count;
      this.spinnerService.stop('main');
      this.viewData = this.vmwareService.convertToViewData(data.results);
    }, err => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Unable to fetch VMs. Please contact Administrator.'))
    });
  }

  // Common Validation for VMware
  backupVmware(data: VMWareBackupViewData, backup_type: string) {
    this.backupType = backup_type;
    this.vmId = data.instanceId;
    if (data.state == "Up") {
      this.notificationService.error(new Notification("Please power off " + data.name + " to initiate VM backup."));
    } else {
      this.checkCredentials();
    }
  }

  checkCredentials() {
    this.authFormErrors = this.vmwareService.resetFormErrors();
    this.authValidationMessages = this.vmwareService.validationMessages;
    this.authForm = this.vmwareService.createForm();
    this.authModalRef = this.modalService.show(this.auth, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  submitCredentials() {
    if (this.authForm.invalid) {
      this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors);
      this.authForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors); });
    } else {
      this.authModalRef.hide();
      this.spinnerService.start('main');
      this.authData = this.authForm.getRawValue();
      this.vmwareService.checkVMWareCredentials(Object.assign({
        vcenter_username: this.authData.username, vcenter_password: this.authData.password,
        cloud_uuid: this.cloud.uuid, vm_id: this.vmId
      })).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        if (this.backupType == "AWS") {
          this.awsBackupVM();
        }
        else {
          this.azureBackupVM();
        }
        this.spinnerService.stop('main');
      }, (err: HttpErrorResponse) => {
        this.notificationService.error(new Notification(err.error));
        this.spinnerService.stop('main');
      });
    }
  }
  // End of Common Validation for VMware
  // Start of VMware AWS backup
  getAWSBuckets() {
    const awsdata = this.backupAWSForm.getRawValue();
    this.backupService.getAWSBuckets(awsdata.aws_account.id, awsdata.region).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsBuckets = res.Buckets;
    }, (err: HttpErrorResponse) => {
      this.awsBuckets = [];
    });
  }

  GET_AWS_ACCOUNTS() {
    this.backupService.getAWSAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.awsAccounts = result.results;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification(err.error));
    });
  }

  awsBackupVM() {
    this.backupAWSFormErrors = this.vmwareService.resetAWSBackupFormErrors();
    this.backupAWSValidationMessages = this.vmwareService.validationMessagesAWSBackup;
    this.backupAWSForm = this.vmwareService.createAWSBackupForm();
    this.backupAWSForm.get('aws_account').valueChanges.subscribe((val: AWSAccount) => {
      this.awsRegions = val.region;
    });
    this.backupAWSForm.get('region').valueChanges.subscribe((val: string) => {
      this.getAWSBuckets();
    });
    this.backupAWSModalRef = this.modalService.show(this.awsbackup, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAWSBackup() {
    if (this.backupAWSForm.invalid) {
      this.backupAWSFormErrors = this.utilService.validateForm(this.backupAWSForm,
        this.backupAWSValidationMessages, this.backupAWSFormErrors);
      this.backupAWSForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.backupAWSFormErrors = this.utilService.validateForm(this.backupAWSForm,
            this.backupAWSValidationMessages, this.backupAWSFormErrors);
        });
    } else {
      this.backupAWSModalRef.hide();
      this.spinnerService.start('main');
      const migratedata = this.backupAWSForm.getRawValue();
      this.vmwareService.confirmVmwareBackup(Object.assign({
        vcenter_username: this.authData.username, vcenter_password: this.authData.password,
        cloud_uuid: this.cloud.uuid, target_type: 'AWS', vm_id: this.vmId,
        account: { aws_account_list: migratedata.aws_account.id, aws_bucket_list: migratedata.bucket, aws_region_list: migratedata.region },
      })).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('VM backup initiated successfully. Process will take a while.'));
      }, (err: HttpErrorResponse) => {
        console.log("Error while migrating virtual machine:", err);
        this.notificationService.error(new Notification(err.error));
        this.spinnerService.stop('main');
      });
    }
  }
  // End of VMware AWS backup
  // Start of VMware backup to Azure
  getAzureAccounts() {
    this.backupService.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.azureAccounts = result.results;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification(err.error));
    });
  }

  getAzureResourceGroups(azure_account: number) {
    this.backupService.getAzureResourceGroup(azure_account).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      console.log("getAzureResourceGroups: ", result);
      this.resourceGroups = result;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification(err.error));
    });
  }

  getAzureStorageAccounts(azure_account: number, resource: string) {
    this.backupService.getAzureStorageAccount(azure_account, resource).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      console.log("getAzureStorageAccounts: ", result);
      this.storageAccounts = result;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification(err.error));
    });
  }

  getAzureContainers(azure_account: number, resource: string, storage: string) {
    this.backupService.getAzureContainer(azure_account, resource, storage).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      console.log("getAzureContainers: ", result);
      this.containers = result;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification(err.error));
    });
  }

  azureBackupVM() {
    this.backupAzureFormErrors = this.vmwareService.resetAzureBackupFormErrors();
    this.backupAzureValidationMessages = this.vmwareService.validationMessagesAzureBackup;
    this.backupAzureForm = this.vmwareService.createAzureBackupForm();
    this.backupAzureForm.get('azure_account').valueChanges.subscribe((val: number) => {
      this.getAzureResourceGroups(val);
    });
    this.backupAzureForm.get('resource_group').valueChanges.subscribe((val: string) => {
      this.getAzureStorageAccounts(this.backupAzureForm.controls.azure_account.value, val);
    });
    this.backupAzureForm.get('storage_account').valueChanges.subscribe((val: string) => {
      this.getAzureContainers(this.backupAzureForm.controls.azure_account.value,
        this.backupAzureForm.controls.resource_group.value, val);
    });
    this.backupAzureModalRef = this.modalService.show(this.azurebackup, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAzureBackup() {
    if (this.backupAzureForm.invalid) {
      this.backupAzureFormErrors = this.utilService.validateForm(this.backupAzureForm,
        this.backupAzureValidationMessages, this.backupAzureFormErrors);
      this.backupAzureForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.backupAzureFormErrors = this.utilService.validateForm(this.backupAzureForm,
            this.backupAzureValidationMessages, this.backupAzureFormErrors);
        });
    } else {
      this.backupAzureModalRef.hide();
      this.spinnerService.start('main');
      const azuredata = this.backupAzureForm.getRawValue();
      this.vmwareService.confirmVmwareBackup(Object.assign({
        vcenter_username: this.authData.username, vcenter_password: this.authData.password,
        cloud_uuid: this.cloud.uuid, target_type: 'Azure', vm_id: this.vmId,
        account: {
          azure_account_list: azuredata.azure_account, azure_resource_list: azuredata.resource_group,
          azure_storage_list: azuredata.storage_account, azure_container_list: azuredata.container
        },
      })).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('VM backup initiated successfully. Process will take a while.'));
      }, (err: HttpErrorResponse) => {
        console.log("Error while migrating virtual machine:", err);
        this.notificationService.error(new Notification(err.error));
        this.spinnerService.stop('main');
      });
    }
  }
  // End of VMware backup to Azure
  // Start of backup history
  backUpHistory(data: VMWareBackupViewData) {
    this.vmwareService.vmwareBackupHistory(data.id).subscribe(status => {
      this.backuphistory = status.vmware_backup_list;
      this.backupHistoryModalRef = this.modalService.show(this.vmwarebackupHistory, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
      this.notificationService.error(new Notification(err.error));
    });
  }
  // End of backup History
}
