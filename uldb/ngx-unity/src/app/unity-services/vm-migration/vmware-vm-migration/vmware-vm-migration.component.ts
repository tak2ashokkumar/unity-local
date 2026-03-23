import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject, interval } from 'rxjs';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil, tap, switchMap, takeWhile } from 'rxjs/operators';
import { VMwareMigrationType } from '../../vm-migration.type';
import { VmwareVmMigrationService, VMWareMigrationViewData } from './vmware-vm-migration.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VmMigrationService } from '../vm-migration.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'vmware-vm-migration',
  templateUrl: './vmware-vm-migration.component.html',
  styleUrls: ['./vmware-vm-migration.component.scss'],
  providers: [VmwareVmMigrationService]
})
export class VmwareVmMigrationComponent implements OnInit, OnDestroy {
  @Input() cloud: PrivateCLoudFast;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  authData: any;
  vmId: string;
  viewData: VMWareMigrationViewData[] = [];
  count: number = 0;
  awsRegions: any[] = [];
  awsBuckets: any[] = [];
  awsAccounts: any[] = [];
  poll: boolean = false;
  syncInProgress: boolean = false;

  @ViewChild('auth') auth: ElementRef;
  authModalRef: BsModalRef;
  authFormErrors: any;
  authValidationMessages: any;
  authForm: FormGroup;

  @ViewChild('migrate') migrate: ElementRef;
  migrateModalRef: BsModalRef;
  migrateFormErrors: any;
  migrateValidationMessages: any;
  migrateForm: FormGroup;

  constructor(private vmMigrationService: VmMigrationService,
    private vmwareMigrationService: VmwareVmMigrationService,
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
    this.vmMigrationService.getVMMigrations(this.cloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
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
    this.vmMigrationService.getVMMigrationsFromDB<VMwareMigrationType>(this.currentCriteria, this.cloud.platform_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.count = data.count;
      this.viewData = this.vmwareMigrationService.convertToViewData(data.results);
    }, err => {
      this.notificationService.error(new Notification('Unable to fetch VMs. Please contact Administrator.'))
    }, () => { });
  }

  vmMigrateStart(data: VMWareMigrationViewData) {
    this.vmId = data.instanceId;
    if (data.state == "Up") {
      this.notificationService.error(new Notification("Please power off " + data.name + " to initiate VM migration."));
    } else {
      this.checkCredentials();
    }
  }

  checkCredentials() {
    this.authFormErrors = this.vmwareMigrationService.resetFormErrors();
    this.authValidationMessages = this.vmwareMigrationService.validationMessages;
    this.authForm = this.vmwareMigrationService.createForm();
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
      this.vmwareMigrationService.checkVMWareCredentials(Object.assign({
        vcenter_username: this.authData.username, vcenter_password: this.authData.password,
        cloud_uuid: this.cloud.uuid, vm_id: this.vmId
      })).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.migrateVM();
        this.spinnerService.stop('main');
      }, (err: HttpErrorResponse) => {
        this.notificationService.error(new Notification(err.error));
        this.spinnerService.stop('main');
      });
    }
  }

  migrateVM() {
    this.migrateFormErrors = this.vmwareMigrationService.resetMigrationFormErrors();
    this.migrateValidationMessages = this.vmwareMigrationService.validationMessagesMigration;
    this.migrateForm = this.vmwareMigrationService.createMigrationForm();
    this.migrateForm.get('aws_account').valueChanges.subscribe((val: AWSAccount) => {
      this.awsRegions = val.region;
    });
    this.migrateForm.get('region').valueChanges.subscribe((val: string) => {
      this.getAWSBuckets();
    });
    this.migrateModalRef = this.modalService.show(this.migrate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  getAWSBuckets() {
    const awsdata = this.migrateForm.getRawValue();
    this.vmMigrationService.getAWSBuckets(awsdata.aws_account.id, awsdata.region).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsBuckets = res.Buckets;
    }, (err: HttpErrorResponse) => {
      this.awsBuckets = [];
    });
  }

  GET_AWS_ACCOUNTS() {
    this.vmMigrationService.getAWSAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.awsAccounts = result.results;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification(err.error));
    });
  }

  confirmMigrate() {
    if (this.migrateForm.invalid) {
      this.migrateFormErrors = this.utilService.validateForm(this.migrateForm, this.migrateValidationMessages, this.migrateFormErrors);
      this.migrateForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.migrateFormErrors = this.utilService.validateForm(this.migrateForm, this.migrateValidationMessages, this.migrateFormErrors); });
    } else {
      this.migrateModalRef.hide();
      this.spinnerService.start('main');
      const migratedata = this.migrateForm.getRawValue();
      this.vmwareMigrationService.confirmMigrate(Object.assign({
        vcenter_username: this.authData.username, vcenter_password: this.authData.password,
        cloud_uuid: this.cloud.uuid, target_type: 'AWS', vm_id: this.vmId,
        account: { aws_account_list: migratedata.aws_account.id, aws_bucket_list: migratedata.bucket, aws_region_list: migratedata.region },
      })).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('VM migration initiated successfully. Process will take a while.'));
      }, (err: HttpErrorResponse) => {
        console.log("error while migrating virtual machine:", err);
        this.notificationService.error(new Notification(err.error));
        this.spinnerService.stop('main');
      });
    }
  }
}
