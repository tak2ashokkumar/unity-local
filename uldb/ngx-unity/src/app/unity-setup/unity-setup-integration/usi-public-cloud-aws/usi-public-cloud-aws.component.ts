import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AwsAccountScheduleHistoryViewData, AWSAccountViewData, UsiPublicCloudAwsService } from './usi-public-cloud-aws.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { Subject } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup } from '@angular/forms';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'usi-public-cloud-aws',
  templateUrl: './usi-public-cloud-aws.component.html',
  styleUrls: ['./usi-public-cloud-aws.component.scss'],
  providers: [UsiPublicCloudAwsService]
})
export class UsiPublicCloudAwsComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = [{
    name: 'Aws',
    url: '/setup/integration/aws/instances'
  }];

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: AWSAccountViewData[] = [];
  selectedView: AWSAccountViewData;
  count: number;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('accessKey') accessKey: ElementRef;
  accessKeyModalRef: BsModalRef;

  accessKeyFormErrors: any;
  accessKeyValidationMessages: any;
  accessKeyForm: FormGroup;

  modalRef: BsModalRef;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: AwsAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: AWSAccountViewData;

  constructor(private svc: UsiPublicCloudAwsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getInstances();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearchedScheduleHistory(event: string) {
    this.scheduleHistoryCurrentCriteria.searchValue = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChangeScheduleHistory(pageNo: number) {
    this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
    this.getScheduleHistory();
  }

  pageSizeChangeScheduleHistory(pageSize: number) {
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  getInstances() {
    this.svc.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  changeAPIKeys(view: AWSAccountViewData) {
    this.selectedView = view;
    this.accessKeyForm = this.svc.createAccessKeyForm(view);
    this.accessKeyFormErrors = this.svc.resetAccessKeyFormErrors();
    this.accessKeyValidationMessages = this.svc.accessKeyValidationMessages;
    this.accessKeyModalRef = this.modalService.show(this.accessKey, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  updateAPIKeys() {
    if (this.accessKeyForm.invalid) {
      this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors);
      this.accessKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.accessKeyForm.getRawValue();
      this.svc.updateAPIKeys(this.selectedView.uuid, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getInstances();
        this.accessKeyModalRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('API Keys updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.accessKeyFormErrors.error = err.error;
        this.spinner.stop('main');
      });
    }
  }

  deleteInstance(view: AWSAccountViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteModalRef.hide();
    this.svc.deleteInstance(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Instance deleted successfully.'));
    }, err => {
      this.notification.error(new Notification('Failed to delete Instance!! Please try again.'));
    });
  }

  loadResources(view: AWSAccountViewData) {
    this.router.navigate(['aws', 'instances', view.uuid, 'resources'], { relativeTo: this.route.parent });
  }

  add() {
    this.router.navigate(['aws/instances/add'], { relativeTo: this.route.parent });
  }

  edit(view: AWSAccountViewData) {
    this.router.navigate(['aws', 'instances', view.uuid, 'edit'], { relativeTo: this.route.parent });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  syncNow(view: AWSAccountViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getInstances();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  getScheduleHistory(view?: AWSAccountViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.svc.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count; 
      this.scheduleHistory = this.svc.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if(view) {
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }
}
