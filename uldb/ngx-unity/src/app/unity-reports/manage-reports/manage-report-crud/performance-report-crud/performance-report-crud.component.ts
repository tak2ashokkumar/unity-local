import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ManageReportCrudNewService, ReportFormData } from 'src/app/unity-reports/manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.service';
import { DevicesByDeviceTypeViewData, MetricsByDevice, PerformanceReportCrudService } from './performance-report-crud.service';
import { IPageInfo } from 'ngx-virtual-scroller';

@Component({
  selector: 'performance-report-crud',
  templateUrl: './performance-report-crud.component.html',
  styleUrls: ['./performance-report-crud.component.scss'],
  providers: [PerformanceReportCrudService]
})
export class PerformanceReportCrudComponent implements OnInit, OnDestroy {
  @Input('reporttype') reportType: string;
  @Input('reportdata') reportdata: ReportFormData;
  @Output('formdata') formData = new EventEmitter<any>();
  private ngUnsubscribe = new Subject();
  reportId: string = null;
  devicesCriteria: SearchCriteria;
  metricsCriteria: SearchCriteria;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  attributeList: any[] = [];
  operatorList: any[] = [];
  optionType: string[] = [];
  optionList: any[] = [];

  isMetrcisOptionSelected: boolean;

  simpleOptionSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
  };

  optionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'uuid'
  };

  constructor(private svc: PerformanceReportCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private crudSvc: ManageReportCrudNewService,
    private builder: FormBuilder,
    private utilService: AppUtilityService) {
    this.crudSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.crudSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(err => {
      this.handleError(err);
    });
    this.devicesCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.metricsCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'device_type': '', 'device_uuid': '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.reportdata) {
      this.reportId = this.reportdata.uuid;
    }
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.attributeList = this.svc.getFilterData();
    this.form = this.svc.buildForm(this.reportdata);
    this.formErrors = this.svc.resetFormErrors();
    if (this.filters) {
      for (let index = 0; index < this.filters.length - 1; index++) {
        this.formErrors.filters.push(this.svc.getFilterErrors());
      }
    }
    if (this.reportdata && this.reportdata.report_meta && this.reportdata.report_meta.hosts?.length) {
      this.selectedDevicesWithMetrics = this.reportdata.report_meta.hosts;
    }

    if (this.reportdata && this.reportdata.report_meta && this.reportdata.report_meta.filters?.length) {
      for (let i = 0; i < this.reportdata.report_meta.filters?.length; i++) {
        let attribute = this.attributeList.find(a => a.value == this.reportdata.report_meta.filters[i].attribute);
        if (attribute) {
          this.operatorList[i] = attribute.operators;
          this.optionType[i] = attribute.value_type;
          this.optionList[i] = attribute.options;
        }
      }
      this.isMetrcisOptionSelected = this.filters?.getRawValue()?.some(filter => filter.attribute == 'Metrics');
      if (!this.isMetrcisOptionSelected) {
        this.getDevicesByFilters();
      }
    }

    this.validationMessages = this.svc.validationMessages;
    this.spinner.stop('main');
  }

  get filters(): FormArray {
    return this.form.get("filters") as FormArray;
  }

  addFilter(i: number) {
    let fg = <FormGroup>this.filters.at(i);
    if (fg.invalid) {
      this.formErrors.filters[i] = this.utilService.validateForm(fg, this.validationMessages.filters, this.formErrors.filters[i]);
      fg.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.filters[i] = this.utilService.validateForm(fg, this.validationMessages.filters, this.formErrors.filters[i]);
      });
    } else {
      let newFilterFG = this.builder.group({
        attribute: ['', [Validators.required, NoWhitespaceValidator]],
        operator: ['', [Validators.required, NoWhitespaceValidator]],
        value: ['', [Validators.required, NoWhitespaceValidator]],
      })
      this.formErrors.filters.push(this.svc.getFilterErrors());
      this.filters.push(newFilterFG);
    }
  }

  updateFilterOptions(attr: string, i: number) {
    let attribute = this.attributeList.filter(i => i.value == attr)[0];
    let formGroup = <FormGroup>this.filters.at(i);
    formGroup.get('operator').setValue('');
    if (attribute.value_type == 'multi-select' || attribute.value_type == 'multi-select-simple') {
      formGroup.get('value').removeValidators([NoWhitespaceValidator]);
      formGroup.get('value').patchValue([]);
    } else {
      formGroup.get('value').setValue('');
      formGroup.get('value').setValidators([Validators.required, NoWhitespaceValidator]);
    }
    this.operatorList[i] = attribute.operators;
    this.optionType[i] = attribute.value_type;
    this.optionList[i] = attribute.options;
    formGroup.get('value').updateValueAndValidity();
    this.manageMetricsOptionSeletion();
  }

  manageMetricsOptionSeletion() {
    this.isMetrcisOptionSelected = this.filters?.getRawValue()?.some(filter => filter.attribute == 'Metrics');
    if (this.isMetrcisOptionSelected) {
      this.form.get('hosts') ? this.form.removeControl('hosts') : null;
      this.deviceCount = 0;
      this.devices = [];
      this.selectedDevice = null;
      this.devicesToBeSelected = [];
      this.selectedDevicesWithMetrics = [];
      this.metricsCount = 0;
      this.metrics = [];
      this.metricsToBeSelected = [];
      this.metricsToBeRemoved = [];
    } else {
      this.form.get('hosts') ? null : this.form.addControl('hosts', new FormControl(null, [Validators.required]));
    }
  }

  removeFilter(i: number) {
    let filters = this.form.get('filters') as FormArray;
    if (filters.length > 1) {
      filters.removeAt(i);
      this.formErrors.filters.splice(i, 1);
    }
    this.operatorList.splice(i, 1);
    this.optionType.splice(i, 1);
    this.optionList.splice(i, 1);
    setTimeout(() => {
      this.manageMetricsOptionSeletion();
    }, 0);
  }

  appliedFilters: any;
  applyFilters() {
    let filters = this.form.get('filters') as FormArray;
    if (filters.valid) {
      this.devicesCriteria.pageNo = 1;
      this.getDevicesByFilters();
    } else {
      for (let i = 0; i < filters.length; i++) {
        let fg = <FormGroup>this.filters.at(i);
        if (fg.invalid) {
          this.formErrors.filters[i] = this.utilService.validateForm(fg, this.validationMessages.filters, this.formErrors.filters[i]);
          fg.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
            this.formErrors.filters[i] = this.utilService.validateForm(fg, this.validationMessages.filters, this.formErrors.filters[i]);
          });
        }
      }
    }
  }

  deviceCount: number = 0;
  devices: DevicesByDeviceTypeViewData[] = [];
  selectedDevice: DevicesByDeviceTypeViewData;
  devicesToBeSelected: DevicesByDeviceTypeViewData[] = [];
  selectedDevicesWithMetrics: DevicesByDeviceTypeViewData[] = [];
  devicesLoading: boolean = false;
  getDevicesByFilters() {
    this.spinner.start('devicesList');
    this.appliedFilters = _clone(this.filters.getRawValue());
    this.svc.getDevicesByDeviceType(this.appliedFilters, this.devicesCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devices = this.svc.convertToViewData(res.results);
      setTimeout(() => {
        this.deviceCount = res.count;
        this.spinner.stop('devicesList');
      }, 500)
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('devicesList');
    })
  }

  fetchMoreDevices(event: IPageInfo) {
    let returnCondition = !this.devices.length || this.devicesLoading ||
      this.deviceCount <= this.devices.length ||
      (this.devices.length % this.devicesCriteria.pageSize) != 0 ||
      event.endIndex != (this.devices.length - 1);

    if (returnCondition) {
      return;
    }

    this.devicesLoading = true;
    this.devicesCriteria.pageNo = Math.ceil(this.devices.length / this.devicesCriteria.pageSize + 1);
    this.svc.getDevicesByDeviceType(this.appliedFilters, this.devicesCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devices = this.devices.concat(this.svc.convertToViewData(res.results));
      this.devicesLoading = false;
      this.deviceCount = res.count;
    }, (err: HttpErrorResponse) => {
      this.devicesLoading = false
    })
  }

  onDeviceSearched(event: string) {
    this.devicesCriteria.searchValue = event;
    this.devicesCriteria.pageNo = 1;
    this.getDevicesByFilters();
  }

  devicePageChange(pageNo: number) {
    this.spinner.start('main');
    this.devicesCriteria.pageNo = pageNo;
    this.getDevicesByFilters();
  }

  onSelectDevice(d: DevicesByDeviceTypeViewData) {
    if (this.selectedDevice && this.selectedDevice.uuid == d.uuid) {
      return;
    }
    this.selectedDevice = _clone(d);
    this.metricsCount = 0;
    this.metrics = [];
    this.metricsToBeSelected = [];
    this.metricsCriteria.pageNo = 1;
    this.getMetricsByDevice();
  }

  metricsCount: number = 0;
  metrics: MetricsByDevice[] = [];
  metricsToBeSelected: MetricsByDevice[] = [];
  metricsToBeRemoved: MetricsByDevice[] = [];
  metricsLoading: boolean = false;
  getMetricsByDevice() {
    this.spinner.start('metricsList');
    if (this.selectedDevice) {
      this.metricsCriteria.params = [{ 'device_type': this.selectedDevice.device_type, 'device_uuid': this.selectedDevice.uuid }];
      if (this.selectedDevice.platform_type) {
        this.metricsCriteria.params[0].platform_type = _clone(this.selectedDevice.platform_type);
      }
    } else {
      delete this.metricsCriteria.params;
    }
    this.svc.getMetricsByDevice(this.metricsCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.metrics = res.results;
      setTimeout(() => {
        this.metricsCount = res.count;
        this.spinner.stop('metricsList');
      }, 100)
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('metricsList');
    })
  }

  fetchMoreMetrics(event: IPageInfo) {
    let returnCondition = !this.metrics.length || this.metricsLoading ||
      this.metricsCount <= this.metrics.length ||
      (this.metrics.length % this.metricsCriteria.pageSize) != 0 ||
      event.endIndex != (this.metrics.length - 1);

    if (returnCondition) {
      return;
    }

    this.metricsLoading = true;
    this.metricsCriteria.pageNo = this.metrics.length / this.metricsCriteria.pageSize + 1;
    if (this.selectedDevice) {
      this.metricsCriteria.params = [{ 'device_type': this.selectedDevice.device_type, 'device_uuid': this.selectedDevice.uuid }];
      if (this.selectedDevice.platform_type) {
        this.metricsCriteria.params[0].platform_type = _clone(this.selectedDevice.platform_type);
      }
    } else {
      delete this.metricsCriteria.params;
    }
    this.svc.getMetricsByDevice(this.metricsCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.metrics = this.metrics.concat(res.results);
      this.metricsLoading = false;
      this.metricsCount = res.count;
    }, (err: HttpErrorResponse) => {
      this.metricsLoading = false
    })
  }

  onMetricsSearched(event: string) {
    this.metricsCriteria.searchValue = event;
    this.metricsCriteria.pageNo = 1;
    this.getMetricsByDevice();
  }

  metricsPageChange(pageNo: number) {
    this.spinner.start('main');
    this.metricsCriteria.pageNo = pageNo;
    this.getMetricsByDevice();
  }

  onClickToSelectMetric(m: MetricsByDevice) {
    if (this.devicesToBeSelected.length) {
      let deviceExistsInIndex = this.devicesToBeSelected.findIndex(d => d.uuid == this.selectedDevice.uuid);
      if (deviceExistsInIndex == -1) {
        let d = _clone(this.selectedDevice);
        d.metrices = Array(1).fill(_clone(m));
        this.devicesToBeSelected.push(d);
      } else {
        let metricsExistsInIndex = this.devicesToBeSelected[deviceExistsInIndex].metrices.findIndex(sm => sm.item_id == m.item_id);
        if (metricsExistsInIndex == -1) {
          this.devicesToBeSelected[deviceExistsInIndex].metrices.push(m);
        } else {
          this.devicesToBeSelected[deviceExistsInIndex].metrices.splice(metricsExistsInIndex, 1);
        }
      }
    } else {
      let d = _clone(this.selectedDevice);
      d.metrices = Array(1).fill(_clone(m));
      this.devicesToBeSelected.push(d);
    }
  }

  metricsSelectedClass(m: MetricsByDevice) {
    if (!this.devicesToBeSelected.length && !this.selectedDevicesWithMetrics.length) {
      return `far fa-square`;
    }
    for (let i = 0; i < this.devicesToBeSelected.length; i++) {
      let metric = this.devicesToBeSelected[i].metrices.find(dm => dm.item_id == m.item_id);
      if (metric) {
        return "fas fa-check-square";
      }
    }
    for (let i = 0; i < this.selectedDevicesWithMetrics.length; i++) {
      let metric = this.selectedDevicesWithMetrics[i].metrices.find(dm => dm.item_id == m.item_id);
      if (metric) {
        return "fas fa-check-square";
      }
    }
    return "far fa-square";
  }

  isMetricInSelectedList(m: MetricsByDevice) {
    for (let i = 0; i < this.selectedDevicesWithMetrics?.length; i++) {
      let metric = this.selectedDevicesWithMetrics[i].metrices.find(dm => dm.item_id == m.item_id);
      if (metric) {
        return true;
      }
    }
    return false;
  }

  getMetricesToBeSelectedCount() {
    let count = 0;
    this.devicesToBeSelected.forEach(d => {
      count = count + d.metrices?.length;
    })
    return count;
  }

  selectDevicesWithMetrics() {
    if (this.selectedDevicesWithMetrics.length) {
      for (let i = 0; i < this.devicesToBeSelected.length; i++) {
        let deviceExistsInIndex = this.selectedDevicesWithMetrics.findIndex(d => d.uuid == this.devicesToBeSelected[i].uuid);
        if (deviceExistsInIndex == -1) {
          this.selectedDevicesWithMetrics.push(_clone(this.devicesToBeSelected[i]));
        } else {
          for (let k = 0; k < this.devicesToBeSelected[i].metrices.length; k++) {
            this.selectedDevicesWithMetrics[deviceExistsInIndex].metrices.push(_clone(this.devicesToBeSelected[i].metrices[k]));
          }
        }
      }
    } else {
      this.selectedDevicesWithMetrics = this.selectedDevicesWithMetrics.concat(this.devicesToBeSelected);
    }
    this.devicesToBeSelected = [];
  }

  getSelectedMetricsCount() {
    let count = 0;
    this.selectedDevicesWithMetrics.forEach(d => {
      count = count + d.metrices?.length;
    })
    return count;
  }

  onSelectedSearch() {

  }

  showSelectedMetricsByDevice(d: DevicesByDeviceTypeViewData) {
    d.showMetrices = !d.showMetrices;
    this.selectedDevicesWithMetrics.forEach(sd => {
      if (sd.uuid != d.uuid) {
        sd.showMetrices = false;
      }
    })
  }

  removeDeviceAndMetricsFromSelection(d: DevicesByDeviceTypeViewData) {
    if (d.toBeRemoved) {
      for (let i = 0; i < d.metrices?.length; i++) {
        d.metrices[i].toBeRemoved = false;
        let metricIndex = this.metricsToBeRemoved.findIndex(m => m.item_id == d.metrices[i].item_id);
        if (metricIndex != -1) {
          this.metricsToBeRemoved.splice(metricIndex, 1);
        }
      }
      d.toBeRemoved = false;
    } else {
      d.toBeRemoved = true;
      for (let i = 0; i < d.metrices?.length; i++) {
        d.metrices[i].toBeRemoved = true;
        let metricIndex = this.metricsToBeRemoved.findIndex(m => m.item_id == d.metrices[i].item_id);
        if (metricIndex == -1) {
          this.metricsToBeRemoved.push(_clone(d.metrices[i]));
        }
      }
    }
  }

  removeMetricsFromSelection(d: DevicesByDeviceTypeViewData, m: MetricsByDevice) {
    if (m.toBeRemoved) {
      m.toBeRemoved = false;
      d.toBeRemoved = false;
      let metricIndex = this.metricsToBeRemoved.findIndex(mr => mr.item_id == m.item_id);
      if (metricIndex != -1) {
        this.metricsToBeRemoved.splice(metricIndex, 1);
      }
    } else {
      m.toBeRemoved = true;
      let allSelectedToRemoveMetrices = d.metrices.filter(dm => dm.toBeRemoved == true);
      if (d.metrices?.length == allSelectedToRemoveMetrices.length) {
        d.toBeRemoved = true;
      }

      let metricIndex = this.metricsToBeRemoved.findIndex(mr => mr.item_id == m.item_id);
      if (metricIndex == -1) {
        this.metricsToBeRemoved.push(_clone(m));
      }
    }
  }

  deleteRemovedMetrices() {
    this.selectedDevicesWithMetrics = this.selectedDevicesWithMetrics.filter(sd => !sd.toBeRemoved);
    for (let i = 0; i < this.selectedDevicesWithMetrics.length; i++) {
      this.selectedDevicesWithMetrics[i].metrices = this.selectedDevicesWithMetrics[i].metrices.filter(sdm => !sdm.toBeRemoved);
    }

    this.metricsToBeRemoved = [];
  }

  updateHostsControl() {
    if (this.selectedDevicesWithMetrics.length) {
      this.form?.get('hosts')?.setValue(_clone(this.selectedDevicesWithMetrics));
    } else {
      this.form?.get('hosts')?.setValue(null);
    }
    return null;
  }

  submit() {
    if (this.form.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    } else {
      let form = this.form.getRawValue();
      const obj = Object.assign({}, form);
      this.formData.emit(obj);
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

}
