import { Component, OnDestroy, OnInit } from '@angular/core';
import { AIMLEventsCountByDeviceTypeViewData, AIMLEventsViewData, EventsFilterFormData, MtpAimlEventsService } from './mtp-aiml-events.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormGroup } from '@angular/forms';
import { MTPEventsSummary } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { UnityDeviceType } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MtpAimlEventDetailsService } from '../../shared/mtp-aiml-event-details/mtp-aiml-event-details.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { cloneDeep as _clone } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';
import { MtpAimlMgmtService } from '../mtp-aiml-mgmt.service';

@Component({
  selector: 'mtp-aiml-events',
  templateUrl: './mtp-aiml-events.component.html',
  styleUrls: ['./mtp-aiml-events.component.scss'],
  providers: [MtpAimlEventsService]
})
export class MtpAimlEventsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  tenants: string[] = [];
  filterForm: FormGroup;
  filterFormData: EventsFilterFormData;

  summaryViewData: MTPEventsSummary;
  viewData: AIMLEventsViewData[] = [];
  count: number;
  eventsCountByDeviceType: AIMLEventsCountByDeviceTypeViewData = new AIMLEventsCountByDeviceTypeViewData();

  deviceTypes: Array<UnityDeviceType> = [];
  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'type',
    keyToSelect: 'key',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  severityDonutStyle: SafeStyle = '';
  statsDonutStyle: SafeStyle = '';
  constructor(private eventSvc: MtpAimlEventsService,
    private eventDetailService: MtpAimlEventDetailsService,
    private aimlSvc: MtpAimlMgmtService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,
    private sanitizer: DomSanitizer) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.aimlSvc.filterChangeAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(filterData => {
      this.tenants = filterData.tenants;
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getEventSummary();
    this.getDropDownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getEventSummary();
    this.getDropDownData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  onSearched(event: string) {
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

  getEventSummary() {
    this.eventSvc.getEventSummary(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryViewData = res;
      let critical = (360 / this.summaryViewData.total.event_count) * this.summaryViewData.total.critical;
      let warning = (360 / this.summaryViewData.total.event_count) * this.summaryViewData.total.warning;
      let info = (360 / this.summaryViewData.total.event_count) * this.summaryViewData.total.information;
      const gradient = `conic-gradient(#cc0000 0deg ${critical}deg, #ff8800 ${critical}deg ${warning}deg, #378ad8 ${warning}deg ${info}deg)`;
      this.severityDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${gradient}`);
      this.getEventsCount();
    }, err => {
      this.notification.error(new Notification('Error whlie fetching event summary'))
    });
  }

  getEventsCount() {
    this.eventSvc.getEventsCount(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.eventsCountByDeviceType = this.eventSvc.convertToEventsCountByDeviceTypeViewdata(res);
      let compute = (360 / this.summaryViewData.total.event_count) * this.eventsCountByDeviceType.compute;
      let network = (360 / this.summaryViewData.total.event_count) * this.eventsCountByDeviceType.network;
      let storage = (360 / this.summaryViewData.total.event_count) * this.eventsCountByDeviceType.storage;
      let others = (360 / this.summaryViewData.total.event_count) * this.eventsCountByDeviceType.others;

      const gradient = `conic-gradient(#cc0000 0deg ${compute}deg, #ff8800 ${compute}deg ${network}deg, #378ad8 ${network}deg ${storage}deg, #ff8800 ${storage}deg ${others}deg)`;
      this.statsDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${gradient}`);
    }, err => {
      this.notification.error(new Notification('Error whlie fetching event summary'))
    });
  }

  getDropDownData() {
    this.eventSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceTypes = _clone(res[0]);
      this.buildFilterForm();
    }, err => {
      this.deviceTypes = [];
      this.buildFilterForm();
      this.notification.error(new Notification('Error while fetching filter data!!'));
    });
  }

  buildFilterForm() {
    this.filterForm = this.eventSvc.buildFilterForm();
    this.getEvents();
  }

  getEvents() {
    this.eventSvc.getEvents(this.tenants, this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.count = res.count;
      this.viewData = this.eventSvc.convertDetailsToViewdata(res.results);
    }, err => {
      this.spinner.stop('main');
    });
  }

  viewEventDetails(eventId: string) {
    this.eventDetailService.showEventDetails(eventId);
  }

  filterEvents() {
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  disable(view: AIMLEventsViewData) {
    if (view.isStatusResolved || !view.isSourceUnity) {
      return;
    }
    this.spinner.start('main');
    this.eventSvc.disable(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents();
      this.notification.success(new Notification('Disabled Trigger successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Disable Trigger. Please try again.'));
    });
  }

  resolve(view: AIMLEventsViewData) {
    if (view.isStatusResolved) {
      return;
    }
    this.spinner.start('main');
    this.eventSvc.resolve(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents();
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve event. Please try again.'));
    });
  }
}
