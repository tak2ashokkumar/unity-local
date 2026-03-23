import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { VmMigrationService } from '../vm-migration.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject, interval } from 'rxjs';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil, tap, switchMap, takeWhile } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { OpenstackVmMigrationService, OpenstackMigrationViewData } from './openstack-vm-migration.service';
import { OpenStackMigrationType } from '../../vm-migration.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { FormGroup } from '@angular/forms';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'openstack-vm-migration',
  templateUrl: './openstack-vm-migration.component.html',
  styleUrls: ['./openstack-vm-migration.component.scss'],
  providers: [OpenstackVmMigrationService]
})
export class OpenstackVmMigrationComponent implements OnInit, OnDestroy {
  @Input() cloud: PrivateCLoudFast;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  viewData: any[] = [];
  count: number;
  vmId: string;
  awsRegions: any[] = [];
  awsBuckets: any[] = [];
  awsAccounts: any[] = [];
  poll: boolean = false;
  syncInProgress: boolean = false;

  @ViewChild('migrate') migrate: ElementRef;
  migrateModalRef: BsModalRef;
  migrateFormErrors: any;
  migrateValidationMessages: any;
  migrateForm: FormGroup;

  constructor(private vmMigrationService: VmMigrationService,
    private osService: OpenstackVmMigrationService,
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
    this.vmMigrationService.getVMMigrationsFromDB<OpenStackMigrationType>(this.currentCriteria, this.cloud.platform_type)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
        this.spinnerService.stop('main');
        this.count = data.count;
        this.viewData = this.osService.convertToViewData(data.results);
      }, err => {
        this.spinnerService.stop('main');
        this.notificationService.error(new Notification('Unable to fetch VMs. Please contact Administrator.'))
      });
  }

  vmMigrateStart(data: OpenstackMigrationViewData) {
    this.vmId = data.instanceId;
    if (data.powerStatus == "Up") {
      this.notificationService.error(new Notification("Please power off " + data.name + " to initiate VM migration."));
    } else {
      this.migrateVM();
    }
  }

  migrateVM() {
    this.migrateFormErrors = this.osService.resetMigrationFormErrors();
    this.migrateValidationMessages = this.osService.validationMessagesMigration;
    this.migrateForm = this.osService.createMigrationForm();
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

  confirmMigrate() {
    if (this.migrateForm.invalid) {
      this.migrateFormErrors = this.utilService.validateForm(this.migrateForm, this.migrateValidationMessages, this.migrateFormErrors);
      this.migrateForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.migrateFormErrors = this.utilService.validateForm(this.migrateForm, this.migrateValidationMessages, this.migrateFormErrors); });
    } else {
      this.migrateModalRef.hide();
      this.spinnerService.start('main');
      const migratedata = this.migrateForm.getRawValue();
      this.osService.confirmMigrate(Object.assign({
        cloud_uuid: this.cloud.uuid, target_type: 'AWS', vm_id: this.vmId,
        account: { aws_account_list: migratedata.aws_account.id, aws_bucket_list: migratedata.bucket, aws_region_list: migratedata.region },
      })).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('VM migration initiated successfully. Process will take a while.'));
      }, (err: HttpErrorResponse) => {
        console.log("error for vcenter validation", err);
        this.notificationService.error(new Notification(err.error));
        this.spinnerService.stop('main');
      });
    }
  }

  GET_AWS_ACCOUNTS() {
    this.vmMigrationService.getAWSAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.awsAccounts = result.results;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification(err.error));
    });
  }
}
