import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppDiscoveryMonitoringEventsViewdata, ApplicationDiscoveryEventsService } from './application-discovery-events.service';
import { Subject } from 'rxjs';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'application-discovery-events',
  templateUrl: './application-discovery-events.component.html',
  styleUrls: ['./application-discovery-events.component.scss'],
  providers: [ApplicationDiscoveryEventsService]
})
export class ApplicationDiscoveryEventsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  device: DeviceTabData;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: AppDiscoveryMonitoringEventsViewdata[] = [];
  selectedViewIndex: number;

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;
  onPrivateCloudAllDevices: boolean = false;
  isSpinnerLoading: boolean = false;

  constructor(private svc: ApplicationDiscoveryEventsService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,
    // private cloudSharedService: UnitedCloudSharedService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private router: Router) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.deviceId }]
    };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
    setTimeout(() => {
      this.getEvents();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  refreshData() {
    this.getEvents();
  }

  onSearched(event: string) {
    this.currentCriteria.searchQuery = event;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getEvents();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  getEvents(skipSpinnerStart?: boolean) {
    if (!skipSpinnerStart) {
      this.spinner.start('main');
    }
    this.isSpinnerLoading = true;
    this.svc.getAppDiscoveryEventsByUuid(this.device.uuid, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertEventDetailsToViewdata(res.results);
      this.spinner.stop('main');
      this.isSpinnerLoading = false;
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch APM events. Please try again later.'));
    });
  }

  acknowledge(index: number) {
    this.selectedViewIndex = index;
    this.acknowledgeForm = this.svc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
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
      this.svc.onAcknowledge(this.viewData[selectedIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData[selectedIndex].isAcknowledged = res.is_acknowledged;
        this.viewData[selectedIndex].acknowledgedTime = res.acknowledged_time;
        this.viewData[selectedIndex].acknowledgedComment = res.acknowledged_comment;
        this.viewData[selectedIndex].acknowledgedBy = res.acknowledged_by;
        this.viewData[selectedIndex].acknowledgedTooltipMsg = `Acknowledged by ${res.acknowledged_by} at ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.viewData[selectedIndex].isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an event'));
      });
    }
  }

  onCloseAcknowledge() {
    this.selectedViewIndex = null;
    let element: HTMLElement = document.getElementById('count') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
  }

  disable(view: AppDiscoveryMonitoringEventsViewdata) {
    if (view.isStatusResolved || !view.isSourceUnity) {
      return;
    }
    this.spinner.start('main');
    this.svc.disable(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents(true);
      this.notification.success(new Notification('Disabled APM Event successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Disable APM Event. Please try again.'));
    });
  }

  resolve(view: AppDiscoveryMonitoringEventsViewdata) {
    if (view.isStatusResolved) {
      return;
    }
    this.spinner.start('main');
    this.svc.resolve(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents(true);
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve event. Please try again.'));
    });
  }
}
