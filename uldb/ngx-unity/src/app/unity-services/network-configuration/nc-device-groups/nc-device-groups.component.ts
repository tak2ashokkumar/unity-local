import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NcDeviceGroupsService, NCMDeviceGroupsViewData } from './nc-device-groups.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'nc-device-groups',
  templateUrl: './nc-device-groups.component.html',
  styleUrls: ['./nc-device-groups.component.scss'],
  providers: [NcDeviceGroupsService]
})
export class NcDeviceGroupsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;

  count: number = 0;
  ncmDeviceGroupsViewData: NCMDeviceGroupsViewData[] = [];
  selectedNCMDeviceGroupView: NCMDeviceGroupsViewData;
  deviceTypesList: string[];
  devicesList: string[];

  @ViewChild('scheduleHistory') scheduleHistory: ElementRef;
  scheduleHistoryRef: BsModalRef;
  scheduleHistoryCurrentCriteria: SearchCriteria;

  scheduleHistoryCount: number = 0;
  scheduleHistoryViewData = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: NcDeviceGroupsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
    this.scheduleHistoryCurrentCriteria = { sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getNCMDeviceGroups();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getNCMDeviceGroups();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getNCMDeviceGroups();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getNCMDeviceGroups();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getNCMDeviceGroups();
  }

  onSearchedScheduleHistory(event: string) {
    this.spinner.start('main');
    this.scheduleHistoryCurrentCriteria.searchQuery = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChangeScheduleHistory(pageNo: number) {
    if (this.scheduleHistoryCurrentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
      this.getScheduleHistory();
    }
  }

  pageSizeChangeScheduleHistory(pageSize: number) {
    this.spinner.start('main');
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  getNCMDeviceGroups() {
    this.svc.getNCMDeviceGroups(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.ncmDeviceGroupsViewData = this.svc.convertToNCMDeviceGroupsViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Get Device groups. Please try again'));
    })
  }

  showDeviceTypes(view: NCMDeviceGroupsViewData) {
    this.deviceTypesList = view.deviceTypesList;
  }

  showDevices(view: NCMDeviceGroupsViewData) {
    this.devicesList = view.devicesList;
  }

  goToAddDeviceGroup() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  syncNow(view: NCMDeviceGroupsViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.deviceGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.spinner.start('main');
      this.getNCMDeviceGroups();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  viewScheduleHistory(view: NCMDeviceGroupsViewData) {
    this.spinner.start('main');
    this.selectedNCMDeviceGroupView = view;
    this.scheduleHistoryViewData = [];
    this.scheduleHistoryCurrentCriteria = { sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getScheduleHistory();
    this.scheduleHistoryRef = this.modalService.show(this.scheduleHistory, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  getScheduleHistory() {
    this.svc.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.selectedNCMDeviceGroupView.deviceGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.scheduleHistoryCount = data.count;
      this.scheduleHistoryViewData = this.svc.convertToScheduleHistoryViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error while getting Schedule history. Please try again!!'));
    })
  }

  goToEditDeviceGroup(view: NCMDeviceGroupsViewData) {
    this.router.navigate([view.deviceGroupId, 'edit'], { relativeTo: this.route });
  }

  deleteDeviceGroup(view: NCMDeviceGroupsViewData) {
    this.selectedNCMDeviceGroupView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteDeviceGroup() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deleteDeviceGroup(this.selectedNCMDeviceGroupView.deviceGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getNCMDeviceGroups();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Device group. Please try again later.'));
    })
  }

}
