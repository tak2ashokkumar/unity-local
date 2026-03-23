import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ForecastHistoryService, HistoryViewData } from './forecast-history.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'forecast-history',
  templateUrl: './forecast-history.component.html',
  styleUrls: ['./forecast-history.component.scss'],
  providers: [ForecastHistoryService]
})
export class ForecastHistoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  viewData: HistoryViewData[] = [];
  device: any;
  selectedViewIndex: number;
  hoveredIndex: number = -1;
  tooltipDirection: 'top' | 'bottom' = 'top';

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  isTooltipVisible = false;
  @ViewChild('tooltipRef', { static: false }) tooltipElementRef: ElementRef;


  constructor(private historySvc: ForecastHistoryService,
    private route: ActivatedRoute,
    private router: Router,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private storage: StorageService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.device = this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getEvents();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  refreshData() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    // this.getHistoryData();
    this.getEvents();
  }

  onSearched(event: string) {
    this.currentCriteria.searchQuery = event;
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
    this.historySvc.getEvents(this.currentCriteria, this.device.deviceId, this.device.itemId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.count = res.count;
      this.viewData = this.historySvc.convertDetailsToViewdata(res.results);
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching events'))
    });
  }

  acknowledge(index: number) {
    this.selectedViewIndex = index;
    this.acknowledgeForm = this.historySvc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.historySvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.historySvc.acknowledgeFormValidationMessages;
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
      this.historySvc.onAcknowledge(this.viewData[selectedIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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
    this.acknowledgeFormErrors = this.historySvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.historySvc.acknowledgeFormValidationMessages;
  }

  disable(view: HistoryViewData) {
    if (view.isStatusResolved || !view.isSourceUnity) {
      return;
    }
    this.spinner.start('main');
    this.historySvc.disable(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents();
      this.notification.success(new Notification('Disabled Trigger successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Disable Trigger. Please try again.'));
    });
  }

  resolve(view: HistoryViewData) {
    if (view.isStatusResolved) {
      return;
    }
    this.spinner.start('main');
    this.historySvc.resolve(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents();
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve event. Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
