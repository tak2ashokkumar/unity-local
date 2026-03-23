import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoundedTabDataType } from 'src/app/shared/unity-rounded-tab/unity-rounded-tab.component';
import { ManageScheduleService, ManageScheduleViewData } from './manage-schedule.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ManageReportSummaryCountDataType } from '../manage-reports/manage-reports.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'manage-schedule',
  templateUrl: './manage-schedule.component.html',
  styleUrls: ['./manage-schedule.component.scss'],
  providers: [ManageScheduleService]
})
export class ManageScheduleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  tabItems: RoundedTabDataType[] = [
    { name: 'Manage Report', url: '/reports/manage/new-reports' },
    { name: 'Manage Schedule', url: '/reports/manage/schedules' }
  ];

  @ViewChild("mainCard", { static: true }) mainCard: ElementRef;
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('multiconfirm') multiconfirm: ElementRef;

  modalRef: BsModalRef;

  currentCriteria: SearchCriteria;
  scheduleReportSummaryData: ManageReportSummaryCountDataType;
  feature: string;
  viewData: ManageScheduleViewData[] = [];
  sheduleId: string;
  selectedScheduleIds: string[];
  selectedAll: boolean = false;
  isSelected: boolean = false;
  constructor(private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleSvc: ManageScheduleService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
  }

  ngOnInit(): void {
    if (this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE)) {
      this.selectFeautre(this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE));
    } else {
      this.selectFeautre('Cloud Inventory');
    }
    this.getManageSchedulesCount();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSchedules();
  }

  getManageSchedulesCount() {
    this.spinner.start('main');
    this.scheduleSvc.getManageSchedulesCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleReportSummaryData = res.schedules;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching schedule summary!! Please try again.'));
    });
  }

  selectFeautre(feature: string) {
    this.feature = feature;
    this.storageService.put('feature', this.feature , StorageType.SESSIONSTORAGE);
    this.getSchedules();
    this.selectedScheduleIds = [];
    this.selectedAll = false;
    this.isSelected = false;
  }

  getSchedules() {
    this.spinner.start('main');
    this.scheduleSvc.getSchedules(this.feature, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.scheduleSvc.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching schedule!! Please try again.'));
    });
  }

  goToCreate() {
    this.router.navigate([this.feature, 'create'], { relativeTo: this.route });
  }

  goToEdit(view: ManageScheduleViewData) {
    this.router.navigate([this.feature, view.uuid, 'update'], { relativeTo: this.route });
  }

  deleteSchedule(view: ManageScheduleViewData) {
    this.sheduleId = view.uuid;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.scheduleSvc.delete(this.sheduleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSchedules();
      this.getManageSchedulesCount();
      this.spinner.stop('main');
      this.notification.success(new Notification('Schedule Deleted successfully'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Schedule could not be Deleted'));
    });
  }

  selectAll() {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }
    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.viewData.forEach(view => {
        view.isSelected = true;
        this.selectedScheduleIds.push(view.uuid);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedScheduleIds = [];
    }
  }

  select(view: ManageScheduleViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedScheduleIds.splice(this.selectedScheduleIds.indexOf(view.uuid), 1);
    } else {
      this.selectedScheduleIds.push(view.uuid);
    }
    this.selectedAll = this.selectedScheduleIds.length == this.viewData.length;
  }

  multipleDelete() {
    this.modalRef = this.modalService.show(this.multiconfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.scheduleSvc.multipleScheduleDelete(this.selectedScheduleIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSchedules();
      this.getManageSchedulesCount();
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedScheduleIds = [];
      this.selectedAll = false;
      this.notification.success(new Notification('Schedule Deleted successfully'));
      this.spinner.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedScheduleIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Schedule could not be Deleted'));
      this.spinner.stop('main');
    });
  }

}