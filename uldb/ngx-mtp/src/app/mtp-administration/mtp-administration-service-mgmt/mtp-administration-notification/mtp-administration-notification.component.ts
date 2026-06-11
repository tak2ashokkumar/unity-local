import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertNotificationSettingsViewData, MtpAdministrationNotificationService, eventOptions, severityOptions, statusOptions, ticketTypeOptions } from './mtp-administration-notification.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { CRMTenantDataType } from './mtp-administration-notification-event-crud/mtp-administration-notification-event-crud.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'mtp-administration-snotification',
  templateUrl: './mtp-administration-notification.component.html',
  styleUrls: ['./mtp-administration-notification.component.scss'],
  providers: [MtpAdministrationNotificationService]
})
export class MtpAdministrationNotificationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  viewData: AlertNotificationSettingsViewData[] = [];
  selectedViewIndex: number;
  instance: MTPTicketInstance;

  severityOptions = severityOptions;
  ticketOptions = ticketTypeOptions;
  statusOptions = statusOptions;
  eventOptions = eventOptions;

  eventsList: string[];
  tenantList: string[];
  tenants: CRMTenantDataType[] = [];

  eventSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
  };

  tenantSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
  };

  eventSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Event',
  };

  tenantSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Tenant',
  };

  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;
  constructor(private svc: MtpAdministrationNotificationService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ ticket_type: '', severity: '', status: '' }], multiValueParam: { event: [], tenant: [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getInstance();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ ticket_type: '', severity: '', status: '' }], multiValueParam: { event: [], tenant: [] } };
    this.getEvents();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getEvents();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  getEvents() {
    this.svc.getEvents(this.currentCriteria, this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, err => {
      this.viewData = [];
      this.spinner.stop('main');
    });
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  showEvents(view: AlertNotificationSettingsViewData) {
    this.eventsList = view.eventsList;
  }

  showTenants(view: AlertNotificationSettingsViewData) {
    this.tenantList = view.tenantNameList;
  }

  toggleStatus(viewId: string, status: boolean) {
    this.spinner.start('main');
    this.svc.toggleStatus(viewId, status, this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getEvents();
      this.spinner.stop('main');
      this.notification.success(new Notification('Status successfully set.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to set status. Please try again.'));
    })
  }

  goToCustomizeEmail(view: AlertNotificationSettingsViewData) {
    this.router.navigate([view.eventId, 'email'], { relativeTo: this.route })
  }

  addEvent() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editEvent(index: number) {
    this.router.navigate([this.viewData[index].eventId], { relativeTo: this.route });
  }

  getInstance() {
    this.spinner.start('main');
    this.svc.getInstance().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.instance = res.getFirst();
      }
      this.getTenants();
      this.getEvents();
      this.spinner.stop('main');
    }, err => {
      this.instance = null;
      this.spinner.stop('main');
    });
  }

  getTenants() {
    this.spinner.start('main');
    this.svc.getCRMTenants(this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.length) {
        this.tenants = res;
      } else {
        this.tenants = [];
      }
      this.spinner.stop('main');
    }, err => {
      this.tenants = [];
      this.spinner.stop('main');
    });
  }

  deleteEvent(index: number) {
    this.selectedViewIndex = index;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.svc.deleteEvent(this.viewData[this.selectedViewIndex].eventId, this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getEvents();
      this.modalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Event deleted Successfully.'));
    }, (err: HttpErrorResponse) => {
      this.modalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Event. Please try again.'));
    })
  }

}
