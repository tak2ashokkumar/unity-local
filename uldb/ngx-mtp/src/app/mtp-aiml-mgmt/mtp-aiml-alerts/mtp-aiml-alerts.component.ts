import { Component, OnDestroy, OnInit } from '@angular/core';
import { AIMLAlertsCountByDeviceTypeViewData, AIMLAlertsViewdata, MtpAimlAlertsService } from './mtp-aiml-alerts.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AIMLAlertsSummary } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { FormGroup } from '@angular/forms';
import { MtpAimlAlertDetailsService } from '../mtp-aiml-alert-details/mtp-aiml-alert-details.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MtpAimlMgmtService } from '../mtp-aiml-mgmt.service';

@Component({
  selector: 'mtp-aiml-alerts',
  templateUrl: './mtp-aiml-alerts.component.html',
  styleUrls: ['./mtp-aiml-alerts.component.scss'],
  providers: [MtpAimlAlertsService]
})
export class MtpAimlAlertsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  tenants: string[] = [];

  summaryViewData: AIMLAlertsSummary;
  viewData: AIMLAlertsViewdata[] = [];
  alertsCountByDeviceType: AIMLAlertsCountByDeviceTypeViewData = new AIMLAlertsCountByDeviceTypeViewData();
  count: number;
  isSuppressed: boolean = false;
  filterForm: FormGroup;
  severityDonutStyle: SafeStyle = '';
  statsDonutStyle: SafeStyle = '';
  constructor(private alertSvc: MtpAimlAlertsService,
    private alertDetailSvc: MtpAimlAlertDetailsService,
    private aimlSvc: MtpAimlMgmtService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
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
    this.getAlertSummary();
    this.buildFilterForm();
    if (this.isSuppressed) {
      this.getSuppressedAlerts();
    } else {
      this.getAlerts();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.currentCriteria.pageNo = 1;
    this.getAlertSummary();
    this.buildFilterForm();
    if (this.isSuppressed) {
      this.getSuppressedAlerts();
    } else {
      this.getAlerts();
    }
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAlerts();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAlerts();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    if (this.isSuppressed) {
      this.getSuppressedAlerts();
    } else {
      this.getAlerts();
    }
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    if (this.isSuppressed) {
      this.getSuppressedAlerts();
    } else {
      this.getAlerts();
    }
  }

  getAlertSummary() {
    this.alertSvc.getAlertsSummary(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryViewData = res;
      let critical = (360 / this.summaryViewData.total.alert_count) * this.summaryViewData.total.critical;
      let warning = (360 / this.summaryViewData.total.alert_count) * this.summaryViewData.total.warning;
      let info = (360 / this.summaryViewData.total.alert_count) * this.summaryViewData.total.information;
      const gradient = `conic-gradient(#cc0000 0deg ${critical}deg, #ff8800 ${critical}deg ${warning}deg, #378ad8 ${warning}deg ${info}deg)`;
      this.severityDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${gradient}`);
      this.getAlertsCount();
    }, err => {
      this.notification.error(new Notification('Error whlie getting alert summary'))
    });
  }

  getAlertsCount() {
    this.alertSvc.getAlertsCountByDeviceType(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsCountByDeviceType = this.alertSvc.convertToAlertsCountViewdata(res);
      let compute = (360 / this.summaryViewData.total.event_count) * this.alertsCountByDeviceType.compute;
      let network = (360 / this.summaryViewData.total.event_count) * this.alertsCountByDeviceType.network;
      let storage = (360 / this.summaryViewData.total.event_count) * this.alertsCountByDeviceType.storage;
      let others = (360 / this.summaryViewData.total.event_count) * this.alertsCountByDeviceType.others;

      const gradient = `conic-gradient(#cc0000 0deg ${compute}deg, #ff8800 ${compute}deg ${network}deg, #378ad8 ${network}deg ${storage}deg, #ff8800 ${storage}deg ${others}deg)`;
      this.statsDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${gradient}`);
    }, err => {
      this.notification.error(new Notification('Error whlie fetching event summary'))
    });
  }

  buildFilterForm() {
    this.filterForm = this.alertSvc.buildFilterForm();
  }

  getAlerts() {
    this.viewData = [];
    this.spinner.start('main');
    this.alertSvc.getAlerts(this.tenants, this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.alertSvc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  manageAlerts() {
    this.currentCriteria.pageNo = 1;
    this.buildFilterForm();
    this.isSuppressed = !this.isSuppressed;
    if (this.isSuppressed) {
      this.getSuppressedAlerts();
    } else {
      this.getAlerts();
    }
  }

  getSuppressedAlerts(isStartSpinnerNotRequired?: boolean) {
    this.viewData = [];
    if (!isStartSpinnerNotRequired) {
      this.spinner.start('main');
    }
    this.alertSvc.getSuppressedAlerts(this.tenants, this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.alertSvc.convertToSuppressedAlertsViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      // this.notification.error(new Notification('Error whlie getting alerts'))
      this.spinner.stop('main');
    });
  }

  viewAlertDetails(index: number) {
    this.alertDetailSvc.showAlertDetails(this.viewData[index].uuid);
  }

  filterAlerts() {
    this.currentCriteria.pageNo = 1;
    if (this.isSuppressed) {
      this.getSuppressedAlerts();
    } else {
      this.getAlerts();
    }
  }

  resolveAlert(view: AIMLAlertsViewdata) {
    if (view.isStatusResolved || view.resolveInProgress) {
      return;
    }
    view.resolveInProgress = true;
    this.alertSvc.resolveAlert(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      view.resolveInProgress = false;
      if (this.viewData.some(a => a.uuid === view.uuid)) {
        this.getAlerts();
      }
      this.notification.success(new Notification(`Request to resolve Alert ID: ${view.id} processed successfully`));
    }, (err: HttpErrorResponse) => {
      view.resolveInProgress = false;
      this.spinner.stop('main');
      this.notification.error(new Notification(`Request to resolve Alert ID: ${view.id} failed. Please try again.`));
    });
  }

  disable(view: AIMLAlertsViewdata) {
    if (view.isStatusResolved || !view.isSourceUnity) {
      return;
    }
    this.spinner.start('main');
    this.alertSvc.disable(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSuppressedAlerts(true);
      this.notification.success(new Notification('Disabled Trigger successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Disable Trigger. Please try again.'));
    });
  }

  resolveSuppressed(view: AIMLAlertsViewdata) {
    if (view.isStatusResolved) {
      return;
    }
    this.spinner.start('main');
    this.alertSvc.resolveSuppressed(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSuppressedAlerts(true);
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve Event. Please try again.'));
    });
  }
}
