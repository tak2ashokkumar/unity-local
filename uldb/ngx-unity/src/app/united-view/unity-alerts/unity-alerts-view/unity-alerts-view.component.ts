import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { EMPTY, Subject, from, interval, timer } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { ALERT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { RoundedTabDataType } from 'src/app/shared/unity-rounded-tab/unity-rounded-tab.component';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnityViewGroupByAlert } from '../unity-alerts.type';
import { UnityAlertChartDataView, UnityAlertSummaryType, UnityAlertsSummaryViewdata, UnityAlertsViewService, UnityAlertsViewdata, UnityAlertsWSClient, alertGroupTypes } from './unity-alerts-view.service';

@Component({
  selector: 'unity-alerts-view',
  templateUrl: './unity-alerts-view.component.html',
  styleUrls: ['./unity-alerts-view.component.scss'],
  providers: [UnityAlertsViewService]
})
export class UnityAlertsViewComponent implements OnInit, OnDestroy {
  tabItems: RoundedTabDataType[] = [{ name: 'Alerts', url: '/unityview/alerts/correlation/alerts' },
  { name: 'Events', url: '/unityview/alerts/correlation/events' }]

  barColor: string = 'bg-primary';
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();

  alerts: UnityViewGroupByAlert;
  viewData: UnityAlertsViewdata[] = [];
  count: number = 0;
  summary: UnityAlertsSummaryViewdata = new UnityAlertsSummaryViewdata();
  alertChartData: UnityAlertChartDataView;
  selectedAlert: UnityAlertsViewdata;

  wsClient: UnityAlertsWSClient;
  isSockectError: boolean = false;

  @ViewChild('acknowledgeRef') acknowledgeRef: ElementRef;
  acknowledgeModalRef: BsModalRef;
  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  @ViewChild('changeSeverityRef') changeSeverityRef: ElementRef;
  changeSeverityModalRef: BsModalRef;
  changeSeverityForm: FormGroup;
  changeSeverityFormErrors: any;
  changeSeverityFormValidationMessages: any;

  @ViewChild('closeProblemRef') closeProblemRef: ElementRef;
  closeProblemModalRef: BsModalRef;
  closeProblemForm: FormGroup;
  closeProblemFormErrors: any;
  closeProblemFormValidationMessages: any;

  @ViewChild('bulkActionRef') bulkActionRef: ElementRef;
  bulkActionModalRef: BsModalRef;
  bulkActionForm: FormGroup;
  bulkActionFormErrors: any;
  bulkActionFormValidationMessages: any;

  nonFieldErr: string;
  poll: boolean = false;
  alertGroupTypes: Array<{ name: string, key: string, mapping: string }> = alertGroupTypes;
  selectedAlertsView: { name: string, key: string, mapping: string } = alertGroupTypes[0];
  filterDeviceType: DeviceMapping;
  selectedIds: Set<number> = new Set<number>();
  constructor(private alertService: UnityAlertsViewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private appService: AppLevelService,
    private utilService: AppUtilityService,
    private user: UserInfoService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private storageService: StorageService, ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };
    this.filterDeviceType = this.storageService.getByKey('alert-device-type', StorageType.SESSIONSTORAGE);
    if (this.filterDeviceType) {
      this.currentCriteria.params = [{ 'device_type': this.filterDeviceType }];
    }
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getAlertSummary();
        this.manageAlertView(this.selectedAlertsView);
      });
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start('main');
      this.getAlertSummary();
      this.manageAlertView(this.selectedAlertsView);
    }, 0);
    this.wsClient = new UnityAlertsWSClient({ org_id: `${this.user.userOrgId}` });
    timer(1000).pipe(takeUntil(this.ngUnsubscribe)).subscribe(n => {
      this.connectToSocket();
      this.subscribeToEvent();
    });
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.storageService.removeByKey('alert-device-type', StorageType.SESSIONSTORAGE);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.wsClient.close();
  }

  removeFilterDeviceType() {
    this.currentCriteria.params = [{ 'device_type': null }];
    this.filterDeviceType = null;
    if (this.currentCriteria.groupBy) {
      this.getGroupByAlerts();
    } else {
      this.getDefaultAlerts();
    }
  }

  connectToSocket() {
    this.wsClient.connect();
  }

  subscribeToEvent() {
    this.wsClient.onOpen.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.isSockectError = false;
    });
    this.wsClient.onMessage.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.currentCriteria.pageNo = 1;
        this.getAlertSummary();
        this.manageAlertView(this.selectedAlertsView);
      }
    });
    this.wsClient.onClose.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    });
    this.wsClient.onError.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.isSockectError = true;
      this.alertService.sendErrorEmail().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    });
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.manageAlertView(this.selectedAlertsView);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.manageAlertView(this.selectedAlertsView);
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.manageAlertView(this.selectedAlertsView);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.manageAlertView(this.selectedAlertsView);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.isSockectError = false;
    this.currentCriteria.pageNo = pageNo;
    this.currentCriteria.groupBy = null;
    this.selectedAlertsView = alertGroupTypes[0];
    this.getAlertSummary();
    this.manageAlertView(this.selectedAlertsView);
  }

  getAlertSummary() {
    this.alertService.getAlertSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: UnityAlertSummaryType) => {
      this.summary = this.alertService.convertToSummaryViewdata(data);
      this.alertChartData = this.alertService.convertToAlertChartData(this.summary);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  manageAlertView(view: { name: string, key: string, mapping: string }) {
    this.selectedAlertsView = view;
    switch (view.key) {
      case 'trigger_id':
      case 'device_name':
      case 'severity':
        this.currentCriteria.groupBy = view.key;
        this.getGroupByAlerts();
        break;
      default:
        delete this.currentCriteria.groupBy;
        this.getDefaultAlerts();
        break
    }
  }

  showPagination() {
    return !this.selectedAlertsView.key && this.viewData.length && this.count > 100;
  }

  getDefaultAlerts() {
    this.spinner.start('unity-alerts-view');
    this.alertService.getAlerts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.alertService.convertToViewdata(res.results);
      this.updateAlertData();
      this.spinner.stop('unity-alerts-view');
    }, err => {
      this.spinner.stop('unity-alerts-view');
    });
  }

  updateAlertData() {
    from(this.viewData).pipe(
      mergeMap(alert => {
        let timeDiffinMins = moment().diff(new Date(alert.alertTime), 'minutes');
        if (timeDiffinMins < 10) {
          alert.isRecentAlert = true;
          setTimeout(() => {
            alert.isRecentAlert = false;
          }, 600000 - timeDiffinMins * 60000);
        }
        return EMPTY;
      }),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getGroupByAlerts() {
    this.alerts = null;
    this.spinner.start('unity-alerts-view');
    this.alertService.getGroupByAlerts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alerts = _clone(res);
      this.viewData = this.alertService.convertToGroupByViewData(res, this.selectedAlertsView.mapping);
      this.updateAlertData();
      this.count = _clone(this.viewData.length);
      this.spinner.stop('unity-alerts-view');
    }, err => {
      this.spinner.stop('unity-alerts-view');
    });
  }

  manageRecords(index: number, view: UnityAlertsViewdata) {
    if (!view.isGrouped) {
      return;
    }
    view.isGroupOpen = !view.isGroupOpen;
    let [first, ...rest] = this.alerts[view[this.selectedAlertsView.mapping]];
    if (view.isGroupOpen) {
      let a = rest.map((a, i) => {
        let alert = this.alertService.convertToViewObj(_clone(a));
        alert.isSelected = this.selectedIds.has(alert.id);
        alert.isGrouped = false;
        alert.isSubMember = true;
        return alert;
      })
      this.viewData.splice((index + 1), 0, ...a);
    } else {
      this.viewData.splice((index + 1), rest.length);
    }
    this.count = _clone(this.viewData.length);
    this.updateAlertData();
  }

  selectRecords(index: number, view: UnityAlertsViewdata) {
    if (!view.isRecentlyResolved) {
      view.isSelected = !view.isSelected;
      if (view.isSelected) {
        this.selectedIds.add(view.id);
      } else {
        this.selectedIds.delete(view.id);
      }
    }
    if (!view.isGrouped) {
      return;
    }
    let [first, ...rest] = this.alerts[view[this.selectedAlertsView.mapping]];
    rest.filter(a => a.status != 'RESOLVED').map((a, i) => {
      if (view.isSelected) {
        this.selectedIds.add(a.id);
      } else {
        this.selectedIds.delete(a.id);
      }
    });
    if (view.isGroupOpen) {
      for (let i = index + 1; i <= index + rest.length; i++) {
        if (!this.viewData[i].isRecentlyResolved) {
          this.viewData[i].isSelected = this.selectedIds.has(this.viewData[i].id);
        }
      }
    }
  }

  bulkAction() {
    if (!this.selectedIds.size) {
      return;
    }
    this.bulkActionForm = this.alertService.buildBulkActionForm(this.selectedIds);
    this.bulkActionFormErrors = this.alertService.resetBulkActionFormErrors();
    this.bulkActionFormValidationMessages = this.alertService.bulkActionFormValidationMessages;
    this.bulkActionForm.get('action').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'change_severity') {
        this.bulkActionForm.addControl('severity', new FormControl('', [Validators.required]));
      } else {
        this.bulkActionForm.removeControl('severity');
      }
    });

    this.bulkActionModalRef = this.modalService.show(this.bulkActionRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  } 

  confirmBulkAction() {
    if (this.bulkActionForm.invalid) {
      this.bulkActionFormErrors = this.utilService.validateForm(this.bulkActionForm, this.bulkActionFormValidationMessages, this.bulkActionFormErrors);
      this.bulkActionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.bulkActionFormErrors = this.utilService.validateForm(this.bulkActionForm, this.bulkActionFormValidationMessages, this.bulkActionFormErrors); });
    } else {
      this.spinner.start('main');
      this.alertService.bulkActionAlert(this.bulkActionForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        this.manageAlertView(this.selectedAlertsView);
        this.bulkActionModalRef.hide();
        this.spinner.stop('main');
        if (this.bulkActionForm.get('action').value == 'acknowledge') {
          this.notification.success(new Notification('Selected alerts acknowledged'));
        } else if (this.bulkActionForm.get('action').value == 'change_severity') {
          this.notification.success(new Notification(`Selected alerts' severity changed`));
        } else {
          this.notification.success(new Notification('Selected alerts closed '));
        }
        this.selectedIds = new Set<number>();
      }, err => {
        this.bulkActionModalRef.hide();
        this.spinner.stop('main');
        this.notification.error(new Notification(err.error.detail));
        this.selectedIds = new Set<number>();
      });
    }
  }

  acknowledge(view: UnityAlertsViewdata) {
    if (!view.isAcknowledgeEnabled) {
      return;
    }
    this.selectedAlert = _clone(view);
    this.acknowledgeForm = this.alertService.buildAcknowledgeForm(view.alert);
    this.acknowledgeFormErrors = this.alertService.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.alertService.acknowledgeFormValidationMessages;

    this.acknowledgeModalRef = this.modalService.show(this.acknowledgeRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors); });
    } else {
      this.alertService.acknowledgeAlert(this.selectedAlert.id, this.acknowledgeForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        this.manageAlertView(this.selectedAlertsView);
        this.acknowledgeModalRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Alert acknowledged'));
      }, err => {
        this.acknowledgeModalRef.hide();
        this.spinner.stop('main');
        this.notification.error(new Notification(err.error.detail));
      });
    }
  }

  changeSeverity(view: UnityAlertsViewdata) {
    if (!view.isChangeSeverityEnabled) {
      return;
    }
    this.selectedAlert = _clone(view);
    this.changeSeverityForm = this.alertService.buildChangeSeverityForm(view);
    this.changeSeverityFormErrors = this.alertService.resetChangeSeverityFormErrors();
    this.changeSeverityFormValidationMessages = this.alertService.changeSeverityFormValidationMessages;

    this.changeSeverityModalRef = this.modalService.show(this.changeSeverityRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmChangeSeverity() {
    if (this.changeSeverityForm.invalid) {
      this.changeSeverityFormErrors = this.utilService.validateForm(this.changeSeverityForm, this.changeSeverityFormValidationMessages, this.changeSeverityFormErrors);
      this.changeSeverityForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.changeSeverityFormErrors = this.utilService.validateForm(this.changeSeverityForm, this.changeSeverityFormValidationMessages, this.changeSeverityFormErrors); });
    } else {
      let obj = this.changeSeverityForm.getRawValue();
      if (this.selectedAlert.severity == obj.severity) {
        this.notification.warning(new Notification('Severity is not changed'));
        return;
      }
      this.alertService.changeAlertSeverity(this.selectedAlert.id, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        this.manageAlertView(this.selectedAlertsView);
        this.changeSeverityModalRef.hide();
        this.notification.success(new Notification('Alert severity changed'));
        this.spinner.stop('main');
      }, err => {
        this.changeSeverityModalRef.hide();
        this.spinner.stop('main');
        this.notification.error(new Notification(err.error.detail));
      });
    }
  }

  closeProblem(view: UnityAlertsViewdata) {
    if (!view.isCloseProblemEnabled) {
      return;
    }
    this.selectedAlert = _clone(view);
    console.log(this.selectedAlert)
    this.closeProblemForm = this.alertService.buildCloseProblemForm(view.alert);
    this.closeProblemFormErrors = this.alertService.resetCloseProblemFormErrors();
    this.closeProblemFormValidationMessages = this.alertService.closeProblemFormValidationMessages;

    this.closeProblemModalRef = this.modalService.show(this.closeProblemRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmCloseProblem() {
    if (this.closeProblemForm.invalid) {
      this.closeProblemFormErrors = this.utilService.validateForm(this.closeProblemForm, this.closeProblemFormValidationMessages, this.closeProblemFormErrors);
      this.closeProblemForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.closeProblemFormErrors = this.utilService.validateForm(this.closeProblemForm, this.closeProblemFormValidationMessages, this.closeProblemFormErrors); });
    } else {
      this.alertService.closeProblem(this.selectedAlert.id, this.closeProblemForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        this.manageAlertView(this.selectedAlertsView);
        this.closeProblemModalRef.hide();
        this.notification.success(new Notification('Alert closed'));
        this.spinner.stop('main');
      }, err => {
        this.closeProblemModalRef.hide();
        this.spinner.stop('main');
        this.notification.error(new Notification(err.error.detail));
      });
    }
  }

  consoleNewTab(view: UnityAlertsViewdata) {
    if (!view.isNewTabEnabled || !view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.alertService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog(view.deviceType, view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
  }

  createTicket(view: UnityAlertsViewdata) {
    if (!view.isCreateTicketEnabled) {
      return;
    }
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.deviceName, view.alert), metadata: ALERT_TICKET_METADATA(view.deviceName, view.alert)
    });
  }
}
