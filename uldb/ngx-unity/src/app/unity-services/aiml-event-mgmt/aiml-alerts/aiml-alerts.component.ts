import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AimlAlertDetailsService } from '../../../shared/aiml-alert-details/aiml-alert-details.service';
import { AIMLAlertsViewdata, AimlAlertsService } from './aiml-alerts.service';
import { AIMLAlertsSummary } from './aiml-alerts.type';
import { cloneDeep as _clone } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';
import { AimlEventDetailsService } from 'src/app/shared/aiml-event-details/aiml-event-details.service';

@Component({
  selector: 'aiml-alerts',
  templateUrl: './aiml-alerts.component.html',
  styleUrls: ['./aiml-alerts.component.scss'],
  providers: [AimlAlertsService]
})
export class AimlAlertsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  summaryViewData: AIMLAlertsSummary;
  count: number;
  viewData: AIMLAlertsViewdata[] = [];
  selectedViewIndex: number;
  hoveredIndex: number = -1;
  tooltipDirection: 'top' | 'bottom' = 'top';

  isSuppressed: boolean = false;
  filterForm: FormGroup;
  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  @ViewChild('tooltipRef', { static: false }) tooltipElementRef: ElementRef;

  constructor(private alertSvc: AimlAlertsService,
    private alertDetailSvc: AimlAlertDetailsService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private eventDetailService: AimlEventDetailsService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.getAlertSummary();
    this.buildFilterForm();
    if (this.isSuppressed) {
      this.getSuppressedEvents();
    } else {
      this.getAlerts();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.currentCriteria.pageNo = 1;
    this.getAlertSummary();
    this.buildFilterForm();
    if (this.isSuppressed) {
      this.getSuppressedEvents();
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
      this.getSuppressedEvents();
    } else {
      this.getAlerts();
    }
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    if (this.isSuppressed) {
      this.getSuppressedEvents();
    } else {
      this.getAlerts();
    }
  }

  getAlertSummary() {
    this.alertSvc.getAlertsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryViewData = res;
    }, err => {
      this.notification.error(new Notification('Error whlie getting alert summary'))
    });
  }

  buildFilterForm() {
    this.filterForm = this.alertSvc.buildFilterForm();
  }

  getAlerts() {
    this.viewData = [];
    this.spinner.start('main');
    this.alertSvc.getAlerts(this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.alertSvc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error whlie getting alerts'))
      this.spinner.stop('main');
    });
  }

  manageAlerts() {
    this.currentCriteria.pageNo = 1;
    this.buildFilterForm();
    this.isSuppressed = !this.isSuppressed;
    if (this.isSuppressed) {
      this.getSuppressedEvents();
    } else {
      this.getAlerts();
    }
  }

  getSuppressedEvents(isStartSpinnerNotRequired?: boolean) {
    this.viewData = [];
    if (!isStartSpinnerNotRequired) {
      this.spinner.start('main');
    }
    this.alertSvc.getSuppressedEvents(this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.alertSvc.convertToSuppressedEventsViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error whlie getting Suppressed Events'));
      this.spinner.stop('main');
    });
  }

  acknowledge(index: number) {
    this.selectedViewIndex = index;
    this.acknowledgeForm = this.alertSvc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.alertSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.alertSvc.acknowledgeFormValidationMessages;
    this.handleAcknowledgementFormSubscriptions();
  }

  handleAcknowledgementFormSubscriptions() {
    this.acknowledgeForm.get('ack_comment').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value && value.length > 512) {
        this.acknowledgeForm.get('ack_comment').setValue(value.slice(0, 512), { emitEvent: false });
      }
    });
  }

  onMouseEnterTooltip(i: number, element: HTMLElement) {
    this.hoveredIndex = i;
    setTimeout(() => {
      const tooltip = this.tooltipElementRef?.nativeElement;
      if (tooltip) {
        const tooltipHeight = tooltip.getBoundingClientRect();
        if (tooltipHeight.height > 150) {
          this.tooltipDirection = 'bottom';
        } else {
          this.tooltipDirection = 'top';
        }
      }
    }, 0);
  }

  onAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      });
    } else {
      let obj = Object.assign({}, this.acknowledgeForm.getRawValue());
      let selectedIndex = _clone(this.selectedViewIndex);
      this.onCloseAcknowledge();
      this.viewData[selectedIndex].isAcknowledged = true;
      this.alertSvc.onAcknowledge(this.viewData[selectedIndex].uuid, obj, this.isSuppressed).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData[selectedIndex].isAcknowledged = res.is_acknowledged;
        this.viewData[selectedIndex].acknowledgedTime = res.acknowledged_time;
        this.viewData[selectedIndex].acknowledgedComment = res.acknowledged_comment;
        this.viewData[selectedIndex].acknowledgedBy = res.acknowledged_by;
        this.viewData[selectedIndex].acknowledgedTooltipMsg = `Ack by: ${res.acknowledged_by}<br>` + `Ack Msg: ${res.acknowledged_comment}<br>` + `Ack at: ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.viewData[selectedIndex].isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an events'));
      });
    }
  }

  onCloseAcknowledge() {
    this.selectedViewIndex = null;
    let element: HTMLElement = document.getElementById('count') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.alertSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.alertSvc.acknowledgeFormValidationMessages;
  }

  viewAlertDetails(index: number) {
    this.alertDetailSvc.showAlertDetails(this.viewData[index].uuid);
  }

  viewEventDetails(index: number) {
    this.eventDetailService.showEventDetails(this.viewData[index].uuid);
  }

  filterEvents() {
    this.currentCriteria.pageNo = 1;
    if (this.isSuppressed) {
      this.getSuppressedEvents();
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
      this.getSuppressedEvents(true);
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
      this.getSuppressedEvents(true);
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve Event. Please try again.'));
    });
  }
}
