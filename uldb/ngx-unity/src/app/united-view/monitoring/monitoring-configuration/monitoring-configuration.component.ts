import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AuthLevelMapping, SNMPVersionMapping, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { MonitoringConfigurationDeviceSummaryViewData, MonitoringConfigurationDeviceViewData, MonitoringConfigurationDeviceViewDataFilter, MonitoringConfigurationService, MonitoringConfigurationActionFailureViewData } from './monitoring-configuration.service';
import { cloneDeep as _clone } from 'lodash-es';
import { AUTH_ALGOS, CRYPTO_ALGOS } from 'src/app/app-constants';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'monitoring-configuration',
  templateUrl: './monitoring-configuration.component.html',
  styleUrls: ['./monitoring-configuration.component.scss'],
  providers: [MonitoringConfigurationService]
})
export class MonitoringConfigurationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;
  currentCriteria: SearchCriteria;
  count: number;

  @ViewChild('lastColumn') lastColumn!: ElementRef;

  summaryData: MonitoringConfigurationDeviceSummaryViewData = new MonitoringConfigurationDeviceSummaryViewData();
  viewData: MonitoringConfigurationDeviceViewData[] = [];
  selectedView: MonitoringConfigurationDeviceViewData = null;
  selectedViewData: MonitoringConfigurationDeviceViewData[] = [];
  isBulkSelected: boolean = false;
  isAfterEdit: boolean = false;
  selectedAll: boolean = false;
  authAlgos = AUTH_ALGOS;
  cryptoAlgos = CRYPTO_ALGOS;

  errorViewData: MonitoringConfigurationActionFailureViewData = new MonitoringConfigurationActionFailureViewData();
  selectedErrorView: MonitoringConfigurationDeviceViewData = null;
  selectedBulkErrorView: MonitoringConfigurationDeviceViewData[] = [];
  isBulkErrorsSelected: boolean = false;

  SNMPVersionMapping = SNMPVersionMapping;
  AuthLevelMapping = AuthLevelMapping;

  filterForm: FormGroup;
  viewDataFilters: MonitoringConfigurationDeviceViewDataFilter = new MonitoringConfigurationDeviceViewDataFilter();

  @ViewChild('editConfigFormRef') editConfigFormRef: ElementRef;
  editConfigModelRef: BsModalRef;
  editConfigForm: FormGroup;
  editConfigFormErrors: any;
  editConfigFormValidationMessages: any;
  nonFieldErr: string;
  actionSource: string;

  @ViewChild('confirmActivateRef') confirmActivateRef: ElementRef;
  confirmActivateModalRef: BsModalRef;

  @ViewChild('confirmEnableRef') confirmEnableRef: ElementRef;
  confirmEnableModalRef: BsModalRef;

  @ViewChild('confirmDisableRef') confirmDisableRef: ElementRef;
  confirmDisableModalRef: BsModalRef;

  @ViewChild('confirmDeleteRef') confirmDeleteRef: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private configService: MonitoringConfigurationService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'device_type': null, 'snmp_version': null, 'search': null, 'status': null }] };
  }

  ngOnInit() {
    setTimeout(() => {
      this.viewDataFilters.status = 'all';
      this.getDevices();
      this.getDevicesSummary();
      this.buildFilterForm(this.viewDataFilters.status);
    }, 0)
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calculateColLength();
    }, 1000);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.currentCriteria.pageNo = pageNo;
      this.getDevices();
    }
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDevices();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    let temp = _clone(this.viewDataFilters.status);
    this.viewDataFilters = new MonitoringConfigurationDeviceViewDataFilter();
    this.viewDataFilters.status = temp;
    this.isBulkSelected = false;
    this.selectedAll = false;
    this.getDevices();
    this.getDevicesSummary();
    this.buildFilterForm(this.viewDataFilters.status);
  }

  getDevices() {
    this.spinner.start('main');
    this.configService.getAllDevices(this.viewDataFilters, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.configService.convertToViewData(res.results);
      this.selectViewDataFromArray();
      this.IsAllSelected();
      setTimeout(() => {
        this.calculateColLength();
      }, 1000);
      this.isAfterEdit = false;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get data. Try again later.'))
    })
  }

  selectViewDataFromArray() {
    this.viewData.forEach((view, index) => {
      let sdIndex = this.selectedViewData.findIndex(sd => sd.deviceId == view.deviceId);
      if (sdIndex != -1) {
        view.isSelected = true;
      }
    });
  }

  IsAllSelected() {
    this.selectedAll = this.viewData.length > 0 && this.viewData.every(v => v.isSelected);
  }

  getDevicesSummary() {
    this.configService.getDevicesSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = <MonitoringConfigurationDeviceSummaryViewData>res;
      this.isAfterEdit = false;
    }, (err: HttpErrorResponse) => {

    })
  }

  buildFilterForm(status: string) {
    this.filterForm = this.configService.buildFilterForm(status);
  }

  updateViewDataFilters(status: string) {
    this.viewDataFilters = new MonitoringConfigurationDeviceViewDataFilter();
    this.viewDataFilters.status = status;
    this.viewDataFilters.device_type = this.filterForm.get('device_type').value;
    this.viewDataFilters.snmp_version = this.filterForm.get('snmp_version').value;
    this.viewDataFilters.search = this.filterForm.get('search').value;
  }

  filterData(status?: string) {
    this.currentCriteria.pageNo = 1;
    this.selectedAll = false;
    this.isBulkSelected = false;
    this.updateViewDataFilters(status);
    this.selectedView = null;
    this.selectedViewData = [];
    this.getDevices();
  }

  selectAll() {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }

    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.viewData.forEach((view, index) => {
        let sdIndex = this.selectedViewData.findIndex(sd => sd.deviceId == view.deviceId);
        if (sdIndex != -1) {
          this.selectedViewData.splice(sdIndex, 1);
        }
        view.isSelected = false;
        this.select(view, index);
      });
    } else {
      this.viewData.forEach((view, index) => {
        view.isSelected = true;
        this.select(view, index);
      });
    }
  }

  select(view: MonitoringConfigurationDeviceViewData, index: number) {
    this.isAfterEdit = false;
    view.isSelected = !view.isSelected;
    if (view.isSelected) {
      this.selectedViewData.push(view);
    } else {
      let sdIndex = this.selectedViewData.findIndex(sd => sd.deviceId == view.deviceId);
      if (sdIndex != -1) {
        this.selectedViewData.splice(sdIndex, 1);
        this.selectedAll = false;
      }
    }

    if (this.selectedViewData.length > 1) {
      this.isBulkSelected = true;
    } else {
      this.isBulkSelected = false;
    }
  }

  manageBulkActionIcons(action: string, input: boolean) {
    switch (action) {
      case 'activate':
        if (input) {
          let devices = this.selectedViewData.length > 1 ? this.selectedViewData.filter(svd => svd.canActivate) : [];
          return devices.length ? true : false;
        }
        return input;
      case 'delete':
        if (input) {
          let devices = this.selectedViewData.length > 1 ? this.selectedViewData.filter(svd => svd.canDelete) : [];
          return devices.length ? true : false;
        }
        return input;
      case 'enable':
        if (input) {
          let disabledDevices = this.selectedViewData.length > 1 ? this.selectedViewData.filter(svd => svd.monitoringStatus == 'Disabled') : [];
          return disabledDevices.length ? true : false;
        }
        return input;
      case 'disable':
        if (input) {
          let enabledDevices = this.selectedViewData.length > 1 ? this.selectedViewData.filter(svd => svd.monitoringStatus == 'Enabled') : [];
          return enabledDevices.length ? true : false;
        }
        return input;
      default: return input;
    }
  }

  checkToActivateAfterEdit(selectedDeviceIds: { [key: string]: string }, viewData: MonitoringConfigurationDeviceViewData[]) {
    let keys: string[] = Object.keys(selectedDeviceIds).filter(k => selectedDeviceIds[k] == 'Success');

    let notConfiguredDevices: MonitoringConfigurationDeviceViewData[] = [];
    keys.map(key => {
      let device = viewData.find(vd => vd.deviceId == key);
      if (device && device.monitoring && !device.monitoring.configured) {
        notConfiguredDevices.push(device);
      }
    })

    if (notConfiguredDevices.length) {
      this.actionSource = 'main';
      this.selectedViewData = _clone(notConfiguredDevices);
      this.selectedView = null;
      this.bulkActivate();
    }
  }

  manageReturnedViewData(action: string, res: { [key: string]: string }) {
    if (res) {
      let arr: MonitoringConfigurationDeviceViewData[] = [];
      let viewData = _clone(this.viewData);
      viewData.map(d => d.isSelected = false);

      Object.keys(res).forEach((key, index) => {
        if (res[key] == 'Failure') {
          arr.push(viewData.find(d => d.deviceId == key));
        }
      });
      if (arr.length) {
        this.errorViewData.action = action;
        switch (action) {
          case 'edit':
            this.errorViewData.errorMsg = ' Failed to edit configuration for the below devices. Continue from here to perform the action again.';
            break;
          case 'activate':
            this.errorViewData.errorMsg = ' Failed to activate monitoring for the below devices. Continue from here to perform the action again.';
            break;
          case 'enable':
            this.errorViewData.errorMsg = ' Failed to enable monitoring for the below devices. Continue from here to perform the action again.';
            break;
          case 'disable':
            this.errorViewData.errorMsg = ' Failed to disable monitoring for the below devices. Continue from here to perform the action again.';
            break;
          case 'delete':
            this.errorViewData.errorMsg = ' Failed to delete monitoring for the below devices. Continue from here to perform the action again.';
            break;
        }
        this.errorViewData.data = arr;
      }

      if (this.isAfterEdit) {
        this.checkToActivateAfterEdit(res, viewData);
      } else {
        this.getDevices();
        this.getDevicesSummary();
      }
    } else {
      this.getDevices();
      this.getDevicesSummary();
    }

    if (this.actionSource == 'main') {
      this.viewData.map(d => d.isSelected = false);
      this.isBulkSelected = false;
      this.selectedView = null;
      if (!this.isAfterEdit) {
        this.selectedViewData = [];
      }
    } else {
      this.errorViewData.data.map(d => d.isSelected = false);
      this.isBulkErrorsSelected = false;
      this.selectedBulkErrorView = [];
      this.selectedErrorView = null;
    }
  }

  editSelectRecord(view: MonitoringConfigurationDeviceViewData) {
    if (this.isBulkSelected) {
      return;
    }
    this.actionSource = 'main';
    this.viewData.map(d => d.isSelected = false);
    this.selectedView = view;
    this.edit(view);
  }

  bulkEdit() {
    if (this.selectedView) {
      return;
    }
    this.actionSource = 'main';
    this.edit()
  }

  edit(view?: MonitoringConfigurationDeviceViewData) {
    this.nonFieldErr = '';
    this.editConfigForm = this.configService.buildForm(view ? view.form.getRawValue() : null);
    this.editConfigFormErrors = this.configService.resetFormErrors();
    this.editConfigFormValidationMessages = this.configService.switchValidationMessages;
    if (this.editConfigForm.get('snmp_version')) {
      this.editConfigForm.get('snmp_version').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res == SNMPVersionMapping.V3) {
          this.editConfigForm = this.configService.setV3Fields();
          this.subscr = this.editConfigForm.get('snmp_authlevel').valueChanges.subscribe(res => {
            if (res == AuthLevelMapping.NoAuthNoPriv) {
              this.editConfigForm = this.configService.setNoAuthNoPrivFields();
            } else if (res == AuthLevelMapping.AuthNoPriv) {
              this.editConfigForm = this.configService.setAtuhNoPrivFields();
            } else {
              this.editConfigForm = this.configService.setAuthPrivFields();
            }
            this.editConfigForm.updateValueAndValidity();
          });
        } else {
          this.editConfigForm = this.configService.setV1_V2Fields();
          if (this.subscr && !this.subscr.closed) {
            this.subscr.unsubscribe();
          }
        }
        this.editConfigForm.updateValueAndValidity();
      });
    }
    this.editConfigModelRef = this.modalService.show(this.editConfigFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.editConfigFormErrors = this.configService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.editConfigForm.controls) {
          this.editConfigFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmEdit() {
    this.nonFieldErr = null;
    if (this.editConfigForm.invalid) {
      this.editConfigFormErrors = this.utilService.validateForm(this.editConfigForm, this.editConfigFormValidationMessages, this.editConfigFormErrors);
      this.editConfigForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.editConfigFormErrors = this.utilService.validateForm(this.editConfigForm, this.editConfigFormValidationMessages, this.editConfigFormErrors); });
    } else {
      this.spinner.start('main');
      let selected = [];
      if (this.actionSource == 'main') {
        selected = this.selectedViewData.length ? this.selectedViewData : new Array(this.selectedView);
      } else {
        selected = this.selectedBulkErrorView.length ? this.selectedBulkErrorView : new Array(this.selectedErrorView);
      }
      this.configService.editConfiguration(selected, this.editConfigForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.isAfterEdit = true;
        this.manageReturnedViewData('edit', <{ [key: string]: string }>res);
        this.editConfigModelRef.hide();
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.editConfigModelRef.hide();
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to edit configuration. Tryagain later.'));
      })
    }
  }

  closeEdit() {
    if (this.actionSource == 'main') {
      this.viewData.map(d => d.isSelected = false);
      this.selectedViewData = [];
      this.selectedView = null;
      this.selectedAll = false;
    } else {
      this.errorViewData.data.map(d => d.isSelected = false);
      this.selectedBulkErrorView = [];
      this.selectedErrorView = null;
      this.selectedAll = false;
    }
    this.editConfigModelRef.hide();
  }

  activateSelectRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canActivate || this.isBulkSelected) {
      return;
    }
    this.actionSource = 'main';
    this.viewData.map(d => d.isSelected = false);
    this.selectedView = view;
    this.confirmActivateModalRef = this.modalService.show(this.confirmActivateRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkActivate() {
    if (!this.viewDataFilters.canActivate || this.selectedView) {
      return;
    }
    this.actionSource = 'main';
    this.confirmActivateModalRef = this.modalService.show(this.confirmActivateRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmActivate() {
    if (!this.selectedView && !this.selectedViewData.length) {
      this.confirmActivateModalRef.hide();
      this.notification.error(new Notification('No records selected to activate monitoring'));
      return;
    }

    this.spinner.start('main');
    let selected = [];
    if (this.actionSource == 'main') {
      selected = this.selectedViewData.length ? this.selectedViewData : new Array(this.selectedView);
    } else {
      selected = this.selectedBulkErrorView.length ? this.selectedBulkErrorView : new Array(this.selectedErrorView);
    }
    this.configService.activateMonitoring(selected).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.isAfterEdit = false;
      this.confirmActivateModalRef.hide();
      this.manageReturnedViewData('activate', <{ [key: string]: string }>res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.isAfterEdit = false;
      this.confirmActivateModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to activate monitoring. Tryagain later.'));
    })
  }

  closeActivate() {
    if (this.actionSource == 'main') {
      this.viewData.map(d => d.isSelected = false);
      this.selectedViewData = [];
      this.selectedView = null;
      this.selectedAll = false;
    } else {
      this.errorViewData.data.map(d => d.isSelected = false);
      this.selectedBulkErrorView = [];
      this.selectedErrorView = null;
      this.selectedAll = false;
    }
    if (this.isAfterEdit) {
      this.getDevices();
      this.getDevicesSummary();
    }
    this.confirmActivateModalRef.hide();
  }

  enableSelectRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canEnable || this.isBulkSelected) {
      return;
    }
    this.actionSource = 'main';
    this.viewData.map(d => d.isSelected = false);
    this.selectedView = view;
    this.confirmEnableModalRef = this.modalService.show(this.confirmEnableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkEnable() {
    if (!this.viewDataFilters.canEnable || this.selectedView) {
      return;
    }
    this.actionSource = 'main';
    this.confirmEnableModalRef = this.modalService.show(this.confirmEnableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEnable() {
    this.spinner.start('main');
    let selected = [];
    if (this.actionSource == 'main') {
      selected = this.selectedViewData.length ? this.selectedViewData : new Array(this.selectedView);
    } else {
      selected = this.selectedBulkErrorView.length ? this.selectedBulkErrorView : new Array(this.selectedErrorView);
    }
    this.configService.enableMonitoring(selected).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manageReturnedViewData('enable', <{ [key: string]: string }>res);
      this.confirmEnableModalRef.hide();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.confirmEnableModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to enable monitoring. Tryagain later.'));
    })
  }

  closeEnable() {
    if (this.actionSource == 'main') {
      this.viewData.map(d => d.isSelected = false);
      this.selectedViewData = [];
      this.selectedView = null;
    } else {
      this.errorViewData.data.map(d => d.isSelected = false);
      this.selectedBulkErrorView = [];
      this.selectedErrorView = null;
    }
    this.confirmEnableModalRef.hide();
  }

  disableSelectRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canDisable || this.isBulkSelected) {
      return;
    }
    this.actionSource = 'main';
    this.viewData.map(d => d.isSelected = false);
    this.selectedView = view;
    this.confirmDisableModalRef = this.modalService.show(this.confirmDisableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkDisable() {
    if (!this.viewDataFilters.canDisable || this.selectedView) {
      return;
    }
    this.actionSource = 'main';
    this.confirmDisableModalRef = this.modalService.show(this.confirmDisableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDisable() {
    this.spinner.start('main');
    let selected = [];
    if (this.actionSource == 'main') {
      selected = this.selectedViewData.length ? this.selectedViewData : new Array(this.selectedView);
    } else {
      selected = this.selectedBulkErrorView.length ? this.selectedBulkErrorView : new Array(this.selectedErrorView);
    }
    this.configService.disableMonitoring(selected).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manageReturnedViewData('disable', <{ [key: string]: string }>res);
      this.confirmDisableModalRef.hide();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.confirmDisableModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to disable monitoring. Tryagain later.'))
    })
  }

  closeDisable() {
    if (this.actionSource == 'main') {
      this.viewData.map(d => d.isSelected = false);
      this.selectedViewData = [];
      this.selectedView = null;
    } else {
      this.errorViewData.data.map(d => d.isSelected = false);
      this.selectedBulkErrorView = [];
      this.selectedErrorView = null;
    }
    this.confirmDisableModalRef.hide();
  }

  deleteSelectRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canDelete || this.selectedViewData.length) {
      return;
    }
    this.actionSource = 'main';
    this.viewData.map(d => d.isSelected = false);
    this.selectedView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkDelete() {
    if (!this.viewDataFilters.canDelete || this.selectedView) {
      return;
    }
    this.actionSource = 'main';
    this.confirmDeleteModalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    let selected = [];
    if (this.actionSource == 'main') {
      selected = this.selectedViewData.length ? this.selectedViewData : new Array(this.selectedView);
    } else {
      selected = this.selectedBulkErrorView.length ? this.selectedBulkErrorView : new Array(this.selectedErrorView);
    }
    this.configService.deleteConfiguration(selected).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manageReturnedViewData('delete', <{ [key: string]: string }>res);
      this.selectedView = null;
      this.selectedViewData = [];
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.confirmDeleteModalRef.hide();
      this.selectedView = null;
      this.selectedViewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete configuration. Tryagain later.'))
    })
  }

  closeDelete() {
    if (this.actionSource == 'main') {
      this.viewData.map(d => d.isSelected = false);
      this.selectedViewData = [];
      this.selectedView = null;
      this.selectedAll = false;
    } else {
      this.errorViewData.data.map(d => d.isSelected = false);
      this.selectedBulkErrorView = [];
      this.selectedErrorView = null;
      this.selectedAll = false;
    }
    this.confirmDeleteModalRef.hide();
  }

  selectErrorRecords(view: MonitoringConfigurationDeviceViewData, index: number) {
    view.isSelected = !view.isSelected;
    if (view.isSelected) {
      this.selectedBulkErrorView.push(view);
    } else {
      this.selectedBulkErrorView.splice(index, 1);
    }

    if (this.selectedBulkErrorView.length > 1) {
      this.isBulkErrorsSelected = true;
    } else {
      this.isBulkErrorsSelected = false;
    }
  }

  editSelectedErrorRecord(view: MonitoringConfigurationDeviceViewData) {
    if (this.isBulkErrorsSelected) {
      return;
    }
    this.actionSource = 'error';
    this.errorViewData.data.map(d => d.isSelected = false);
    this.selectedErrorView = view;

    this.edit(view);
  }

  bulkErrorRecordEdit() {
    if (this.selectedView) {
      return;
    }
    this.actionSource = 'error';
    this.edit()
  }

  activateSelectedErrorRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canActivate || this.isBulkErrorsSelected) {
      return;
    }
    this.actionSource = 'error'
    this.errorViewData.data.map(d => d.isSelected = false);
    this.selectedErrorView = view;
    this.confirmActivateModalRef = this.modalService.show(this.confirmActivateRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkErrorRecordActivate() {
    if (this.selectedErrorView) {
      return;
    }
    this.actionSource = 'error'
    this.confirmActivateModalRef = this.modalService.show(this.confirmActivateRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  enableSelectedErrorRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canEnable || this.isBulkErrorsSelected) {
      return;
    }
    this.actionSource = 'error'
    this.errorViewData.data.map(d => d.isSelected = false);
    this.selectedErrorView = view;
    this.confirmEnableModalRef = this.modalService.show(this.confirmEnableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkErrorRecordEnable() {
    if (this.selectedErrorView) {
      return;
    }
    this.actionSource = 'error'
    this.confirmEnableModalRef = this.modalService.show(this.confirmEnableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  disableSelectedErrorRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canDisable || this.isBulkErrorsSelected) {
      return;
    }
    this.actionSource = 'error'
    this.errorViewData.data.map(d => d.isSelected = false);
    this.selectedErrorView = view;
    this.confirmDisableModalRef = this.modalService.show(this.confirmDisableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkErrorRecordDisable() {
    if (this.selectedErrorView) {
      return;
    }
    this.actionSource = 'error'
    this.confirmDisableModalRef = this.modalService.show(this.confirmDisableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteSelectedErrorRecord(view: MonitoringConfigurationDeviceViewData) {
    if (!view.canDelete || this.isBulkErrorsSelected) {
      return;
    }
    this.actionSource = 'error'
    this.errorViewData.data.map(d => d.isSelected = false);
    this.selectedErrorView = view;
    this.confirmDisableModalRef = this.modalService.show(this.confirmDisableRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkErrorRecordDelete() {
    if (this.selectedErrorView) {
      return;
    }
    this.actionSource = 'error'
    this.confirmDeleteModalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  closeErrorTable() {
    this.isBulkErrorsSelected = false;
    this.selectedBulkErrorView = [];
    this.selectedErrorView = null;
    this.errorViewData = new MonitoringConfigurationActionFailureViewData();
  }

  bulkUnselect() {
    this.viewData.forEach((view, index) => {
      let sdIndex = this.selectedViewData.findIndex(sd => sd.deviceId == view.deviceId);
      if (sdIndex != -1) {
        view.isSelected = false;
      }
    });
    this.selectedViewData = [];
  }

  calculateColLength() {
    const lastColWidth = this.lastColumn?.nativeElement?.offsetWidth;
    if (lastColWidth) {
      document.documentElement.style.setProperty('--last-col-width', `${lastColWidth}px`);
    }
  }

}
