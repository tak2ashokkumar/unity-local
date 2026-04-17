import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { IPageInfo } from 'ngx-virtual-scroller';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  AppUtilityService,
  NoWhitespaceValidator,
} from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import {
  PAGE_SIZES,
  SearchCriteria,
} from 'src/app/shared/table-functionality/search-criteria';
import {
  ReportFormData,
  ReportManagementCrudService,
} from '../report-management-crud.service';
import {
  DevicesByDeviceTypeViewData,
  MetricsByDevice,
  ReportManagementPerformanceCrudService,
} from './performance-report-crud.service';

/**
 * Coordinates the Report Management Performance Crud screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-performance-crud',
  templateUrl: './performance-report-crud.component.html',
  styleUrls: ['./performance-report-crud.component.scss'],
  providers: [ReportManagementPerformanceCrudService],
})
export class ReportManagementPerformanceCrudComponent
  implements OnInit, OnDestroy
{
  /**
   * Stores the selected report type used to configure report metadata.
   */
  @Input('reporttype') reportType: string;
  /**
   * Receives report data from the parent CRUD component for edit mode.
   */
  @Input('reportdata') reportdata: ReportFormData;
  /**
   * Emits child form data back to the parent report CRUD component.
   */
  @Output('formdata') formData = new EventEmitter<any>();
  private ngUnsubscribe = new Subject<void>();
  private formChangesUnsubscribe = new Subject<void>();
  private formValueChangesBound = false;
  private filterValidationControls: FormGroup[] = [];
  /**
   * Stores the active report identifier from the current route or row action.
   */
  reportId: string = null;
  /**
   * Stores table criteria for devices queries.
   */
  devicesCriteria: SearchCriteria;
  /**
   * Stores table criteria for metrics queries.
   */
  metricsCriteria: SearchCriteria;

  /**
   * Holds the reactive form used by the current report workflow.
   */
  form: FormGroup;
  /**
   * Stores validation errors displayed by the report form template.
   */
  formErrors: any;
  /**
   * Defines validation message text used by form validation helpers.
   */
  validationMessages: any;
  /**
   * Stores API validation errors that are not tied to a single form control.
   */
  nonFieldErr: string = '';

  /**
   * Stores the attribute list collection used by the template or payload builder.
   */
  attributeList: any[] = [];
  /**
   * Stores the operator list collection used by the template or payload builder.
   */
  operatorList: any[] = [];
  /**
   * Stores the option type value used by Report Management Performance Crud Component.
   */
  optionType: string[] = [];
  /**
   * Stores the option list collection used by the template or payload builder.
   */
  optionList: any[] = [];

  /**
   * Tracks whether metrcis option selected is enabled for the current workflow.
   */
  isMetrcisOptionSelected: boolean;

  /**
   * Configures the simple option UI behavior.
   */
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

  /**
   * Configures the option UI behavior.
   */
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
    keyToSelect: 'uuid',
  };

  constructor(
    private svc: ReportManagementPerformanceCrudService,
    private spinner: AppSpinnerService,
    private crudSvc: ReportManagementCrudService,
    private builder: FormBuilder,
    private utilService: AppUtilityService
  ) {
    this.crudSvc.submitAnnounced$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.submit();
      });
    this.crudSvc.errorAnnounced$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((err) => {
        this.handleError(err);
      });
    this.devicesCriteria = {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
    };
    this.metricsCriteria = {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [{ device_type: '', device_uuid: '' }],
    };
  }

  /**
   * Initializes Report Management Performance Crud Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.spinner.start('main');
    if (this.reportdata) {
      this.reportId = this.reportdata.uuid;
    }
    this.buildForm();
  }

  /**
   * Releases Report Management Performance Crud Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.formChangesUnsubscribe.next();
    this.formChangesUnsubscribe.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Builds form used by the current workflow.
   *
   * @returns Nothing.
   */
  buildForm() {
    // Performance form is rebuilt from saved report_meta and owns its own validation lifecycle.
    this.formChangesUnsubscribe.next();
    this.formValueChangesBound = false;
    this.filterValidationControls = [];
    this.attributeList = this.svc.getFilterData();
    this.form = this.svc.buildForm(this.reportdata);
    this.formErrors = this.svc.resetFormErrors();
    if (this.filters) {
      for (let index = 0; index < this.filters.length - 1; index++) {
        this.formErrors.filters.push(this.svc.getFilterErrors());
      }
    }
    if (
      this.reportdata &&
      this.reportdata.report_meta &&
      this.reportdata.report_meta.hosts?.length
    ) {
      this.selectedDevicesWithMetrics = this.reportdata.report_meta.hosts;
    }

    if (
      this.reportdata &&
      this.reportdata.report_meta &&
      this.reportdata.report_meta.filters?.length
    ) {
      for (let i = 0; i < this.reportdata.report_meta.filters?.length; i++) {
        let attribute = this.attributeList.find(
          (a) => a.value == this.reportdata.report_meta.filters[i].attribute
        );
        if (attribute) {
          this.operatorList[i] = attribute.operators;
          this.optionType[i] = attribute.value_type;
          this.optionList[i] = attribute.options;
        }
      }
      this.isMetrcisOptionSelected = this.filters
        ?.getRawValue()
        ?.some((filter) => filter.attribute == 'Metrics');
      if (!this.isMetrcisOptionSelected) {
        this.getDevicesByFilters();
      }
    }

    this.validationMessages = this.svc.validationMessages;
    this.updateHostsControl();
    this.spinner.stop('main');
  }

  /**
   * Returns the filters value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get filters(): FormArray {
    return this.form.get('filters') as FormArray;
  }

  /**
   * Adds filter to the current workflow.
   *
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  addFilter(i: number) {
    let fg = <FormGroup>this.filters.at(i);
    if (fg.invalid) {
      this.formErrors.filters[i] = this.utilService.validateForm(
        fg,
        this.validationMessages.filters,
        this.formErrors.filters[i]
      );
      this.bindFilterValidation(fg, i);
    } else {
      let newFilterFG = this.builder.group({
        attribute: ['', [Validators.required, NoWhitespaceValidator]],
        operator: ['', [Validators.required, NoWhitespaceValidator]],
        value: ['', [Validators.required, NoWhitespaceValidator]],
      });
      this.formErrors.filters.push(this.svc.getFilterErrors());
      this.filters.push(newFilterFG);
    }
  }

  /**
   * Updates filter options for the current workflow.
   *
   * @param attr - Attr value used by this method.
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  updateFilterOptions(attr: string, i: number) {
    let attribute = this.attributeList.filter((i) => i.value == attr)[0];
    let formGroup = <FormGroup>this.filters.at(i);
    formGroup.get('operator').setValue('');
    if (
      attribute.value_type == 'multi-select' ||
      attribute.value_type == 'multi-select-simple'
    ) {
      formGroup.get('value').removeValidators([NoWhitespaceValidator]);
      formGroup.get('value').patchValue([]);
    } else {
      formGroup.get('value').setValue('');
      formGroup
        .get('value')
        .setValidators([Validators.required, NoWhitespaceValidator]);
    }
    this.operatorList[i] = attribute.operators;
    this.optionType[i] = attribute.value_type;
    this.optionList[i] = attribute.options;
    formGroup.get('value').updateValueAndValidity();
    this.manageMetricsOptionSeletion();
  }

  /**
   * Executes the manage metrics option seletion workflow for Report Management Performance Crud Component.
   *
   * @returns Nothing.
   */
  manageMetricsOptionSeletion() {
    // Choosing Metrics as a filter means the report is metric-driven and no host selection payload is required.
    this.isMetrcisOptionSelected = this.filters
      ?.getRawValue()
      ?.some((filter) => filter.attribute == 'Metrics');
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
      this.form.get('hosts')
        ? null
        : this.form.addControl(
            'hosts',
            new FormControl(null, [Validators.required])
          );
    }
    this.updateHostsControl();
  }

  /**
   * Removes filter from the current workflow.
   *
   * @param i - I value used by this method.
   * @returns Nothing.
   */
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

  /**
   * Stores the applied filters value used by Report Management Performance Crud Component.
   */
  appliedFilters: any;
  /**
   * Executes the apply filters workflow for Report Management Performance Crud Component.
   *
   * @returns Nothing.
   */
  applyFilters() {
    let filters = this.form.get('filters') as FormArray;
    if (filters.valid) {
      this.devicesCriteria.pageNo = 1;
      this.getDevicesByFilters();
    } else {
      for (let i = 0; i < filters.length; i++) {
        let fg = <FormGroup>this.filters.at(i);
        if (fg.invalid) {
          this.formErrors.filters[i] = this.utilService.validateForm(
            fg,
            this.validationMessages.filters,
            this.formErrors.filters[i]
          );
          this.bindFilterValidation(fg, i);
        }
      }
    }
  }

  /**
   * Stores the device count value used by Report Management Performance Crud Component.
   */
  deviceCount: number = 0;
  /**
   * Stores the devices value used by Report Management Performance Crud Component.
   */
  devices: DevicesByDeviceTypeViewData[] = [];
  /**
   * Stores the selected device value used by Report Management Performance Crud Component.
   */
  selectedDevice: DevicesByDeviceTypeViewData;
  /**
   * Stores the devices to be selected value used by Report Management Performance Crud Component.
   */
  devicesToBeSelected: DevicesByDeviceTypeViewData[] = [];
  /**
   * Stores the selected devices with metrics value used by Report Management Performance Crud Component.
   */
  selectedDevicesWithMetrics: DevicesByDeviceTypeViewData[] = [];
  /**
   * Tracks whether devices data is currently loading.
   */
  devicesLoading: boolean = false;
  /**
   * Loads or returns devices by filters for the current workflow.
   *
   * @returns Nothing.
   */
  getDevicesByFilters() {
    this.spinner.start('devicesList');
    // Preserve the applied filter snapshot so virtual-scroll pagination uses the same criteria.
    this.appliedFilters = _clone(this.filters.getRawValue());
    this.svc
      .getDevicesByDeviceType(this.appliedFilters, this.devicesCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.devices = this.svc.convertToViewData(res.results);
          setTimeout((res) => {
            this.deviceCount = res.count;
            this.spinner.stop('devicesList');
          }, 500);
        },
        () => {
          this.spinner.stop('devicesList');
        }
      );
  }

  /**
   * Fetches additional more devices data for the current workflow.
   *
   * @param event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  fetchMoreDevices(event: IPageInfo) {
    let returnCondition =
      !this.devices.length ||
      this.devicesLoading ||
      this.deviceCount <= this.devices.length ||
      this.devices.length % this.devicesCriteria.pageSize != 0 ||
      event.endIndex != this.devices.length - 1;

    if (returnCondition) {
      return;
    }

    this.devicesLoading = true;
    this.devicesCriteria.pageNo = Math.ceil(
      this.devices.length / this.devicesCriteria.pageSize + 1
    );
    this.svc
      .getDevicesByDeviceType(this.appliedFilters, this.devicesCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.devices = this.devices.concat(
            this.svc.convertToViewData(res.results)
          );
          this.devicesLoading = false;
          this.deviceCount = res.count;
        },
        () => {
          this.devicesLoading = false;
        }
      );
  }

  /**
   * Handles the device searched event from the template.
   *
   * @param event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  onDeviceSearched(event: string) {
    this.devicesCriteria.searchValue = event;
    this.devicesCriteria.pageNo = 1;
    this.getDevicesByFilters();
  }

  /**
   * Executes the device page change workflow for Report Management Performance Crud Component.
   *
   * @param pageNo - Page No value used by this method.
   * @returns Nothing.
   */
  devicePageChange(pageNo: number) {
    this.spinner.start('main');
    this.devicesCriteria.pageNo = pageNo;
    this.getDevicesByFilters();
  }

  /**
   * Handles the select device event from the template.
   *
   * @param d - D value used by this method.
   * @returns Nothing.
   */
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

  /**
   * Stores the metrics count value used by Report Management Performance Crud Component.
   */
  metricsCount: number = 0;
  /**
   * Stores the metrics value used by Report Management Performance Crud Component.
   */
  metrics: MetricsByDevice[] = [];
  /**
   * Stores the metrics to be selected value used by Report Management Performance Crud Component.
   */
  metricsToBeSelected: MetricsByDevice[] = [];
  /**
   * Stores the metrics to be removed value used by Report Management Performance Crud Component.
   */
  metricsToBeRemoved: MetricsByDevice[] = [];
  /**
   * Tracks whether metrics data is currently loading.
   */
  metricsLoading: boolean = false;
  /**
   * Loads or returns metrics by device for the current workflow.
   *
   * @returns Nothing.
   */
  getMetricsByDevice() {
    this.spinner.start('metricsList');
    if (this.selectedDevice) {
      this.metricsCriteria.params = [
        {
          device_type: this.selectedDevice.device_type,
          device_uuid: this.selectedDevice.uuid,
        },
      ];
      if (this.selectedDevice.platform_type) {
        this.metricsCriteria.params[0].platform_type = _clone(
          this.selectedDevice.platform_type
        );
      }
    } else {
      delete this.metricsCriteria.params;
    }
    this.svc
      .getMetricsByDevice(this.metricsCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.metrics = res.results;
          setTimeout((res) => {
            this.metricsCount = res.count;
            this.spinner.stop('metricsList');
          }, 100);
        },
        () => {
          this.spinner.stop('metricsList');
        }
      );
  }

  /**
   * Fetches additional more metrics data for the current workflow.
   *
   * @param event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  fetchMoreMetrics(event: IPageInfo) {
    let returnCondition =
      !this.metrics.length ||
      this.metricsLoading ||
      this.metricsCount <= this.metrics.length ||
      this.metrics.length % this.metricsCriteria.pageSize != 0 ||
      event.endIndex != this.metrics.length - 1;

    if (returnCondition) {
      return;
    }

    this.metricsLoading = true;
    this.metricsCriteria.pageNo =
      this.metrics.length / this.metricsCriteria.pageSize + 1;
    if (this.selectedDevice) {
      this.metricsCriteria.params = [
        {
          device_type: this.selectedDevice.device_type,
          device_uuid: this.selectedDevice.uuid,
        },
      ];
      if (this.selectedDevice.platform_type) {
        this.metricsCriteria.params[0].platform_type = _clone(
          this.selectedDevice.platform_type
        );
      }
    } else {
      delete this.metricsCriteria.params;
    }
    this.svc
      .getMetricsByDevice(this.metricsCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.metrics = this.metrics.concat(res.results);
          this.metricsLoading = false;
          this.metricsCount = res.count;
        },
        () => {
          this.metricsLoading = false;
        }
      );
  }

  /**
   * Handles the metrics searched event from the template.
   *
   * @param event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  onMetricsSearched(event: string) {
    this.metricsCriteria.searchValue = event;
    this.metricsCriteria.pageNo = 1;
    this.getMetricsByDevice();
  }

  /**
   * Executes the metrics page change workflow for Report Management Performance Crud Component.
   *
   * @param pageNo - Page No value used by this method.
   * @returns Nothing.
   */
  metricsPageChange(pageNo: number) {
    this.spinner.start('main');
    this.metricsCriteria.pageNo = pageNo;
    this.getMetricsByDevice();
  }

  /**
   * Handles the click to select metric event from the template.
   *
   * @param m - M value used by this method.
   * @returns Nothing.
   */
  onClickToSelectMetric(m: MetricsByDevice) {
    if (!this.selectedDevice) {
      return;
    }
    if (this.devicesToBeSelected.length) {
      let deviceExistsInIndex = this.devicesToBeSelected.findIndex(
        (d) => d.uuid == this.selectedDevice.uuid
      );
      if (deviceExistsInIndex == -1) {
        let d = _clone(this.selectedDevice);
        d.metrices = Array(1).fill(_clone(m));
        this.devicesToBeSelected.push(d);
      } else {
        let metricsExistsInIndex = this.devicesToBeSelected[
          deviceExistsInIndex
        ].metrices.findIndex((sm) => sm.item_id == m.item_id);
        if (metricsExistsInIndex == -1) {
          this.devicesToBeSelected[deviceExistsInIndex].metrices.push(m);
        } else {
          this.devicesToBeSelected[deviceExistsInIndex].metrices.splice(
            metricsExistsInIndex,
            1
          );
        }
      }
    } else {
      let d = _clone(this.selectedDevice);
      d.metrices = Array(1).fill(_clone(m));
      this.devicesToBeSelected.push(d);
    }
  }

  /**
   * Executes the metrics selected class workflow for Report Management Performance Crud Component.
   *
   * @param m - M value used by this method.
   * @returns The value produced by the workflow.
   */
  metricsSelectedClass(m: MetricsByDevice) {
    // Metric ids are evaluated within the currently selected device to avoid cross-device false positives.
    if (
      !this.selectedDevice ||
      (!this.devicesToBeSelected.length &&
        !this.selectedDevicesWithMetrics.length)
    ) {
      return `far fa-square`;
    }
    if (
      this.hasMetricForDevice(
        this.devicesToBeSelected,
        this.selectedDevice.uuid,
        m.item_id
      ) ||
      this.hasMetricForDevice(
        this.selectedDevicesWithMetrics,
        this.selectedDevice.uuid,
        m.item_id
      )
    ) {
      return 'fas fa-check-square';
    }
    return 'far fa-square';
  }

  /**
   * Returns whether metric in selected list applies to the current state.
   *
   * @param m - M value used by this method.
   * @returns True when the condition is satisfied; otherwise false.
   */
  isMetricInSelectedList(m: MetricsByDevice) {
    return this.selectedDevice
      ? this.hasMetricForDevice(
          this.selectedDevicesWithMetrics,
          this.selectedDevice.uuid,
          m.item_id
        )
      : false;
  }

  /**
   * Loads or returns metrices to be selected count for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getMetricesToBeSelectedCount() {
    let count = 0;
    this.devicesToBeSelected.forEach((d) => {
      count = count + d.metrices?.length;
    });
    return count;
  }

  /**
   * Selects devices with metrics for the current workflow.
   *
   * @returns Nothing.
   */
  selectDevicesWithMetrics() {
    // Merge pending metrics into the selected device list without duplicating metric ids for that device.
    if (this.selectedDevicesWithMetrics.length) {
      for (let i = 0; i < this.devicesToBeSelected.length; i++) {
        let deviceExistsInIndex = this.selectedDevicesWithMetrics.findIndex(
          (d) => d.uuid == this.devicesToBeSelected[i].uuid
        );
        if (deviceExistsInIndex == -1) {
          this.selectedDevicesWithMetrics.push(
            _clone(this.devicesToBeSelected[i])
          );
        } else {
          for (
            let k = 0;
            k < this.devicesToBeSelected[i].metrices.length;
            k++
          ) {
            const metric = this.devicesToBeSelected[i].metrices[k];
            const metricExists = this.selectedDevicesWithMetrics[
              deviceExistsInIndex
            ].metrices.some(
              (selectedMetric) => selectedMetric.item_id == metric.item_id
            );
            if (!metricExists) {
              this.selectedDevicesWithMetrics[
                deviceExistsInIndex
              ].metrices.push(_clone(metric));
            }
          }
        }
      }
    } else {
      this.selectedDevicesWithMetrics = this.selectedDevicesWithMetrics.concat(
        this.devicesToBeSelected
      );
    }
    this.devicesToBeSelected = [];
    this.updateHostsControl();
  }

  /**
   * Loads or returns selected metrics count for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getSelectedMetricsCount() {
    let count = 0;
    this.selectedDevicesWithMetrics.forEach((d) => {
      count = count + d.metrices?.length;
    });
    return count;
  }

  /**
   * Handles the selected search event from the template.
   *
   * @returns Nothing.
   */
  onSelectedSearch() {}

  /**
   * Executes the show selected metrics by device workflow for Report Management Performance Crud Component.
   *
   * @param d - D value used by this method.
   * @returns Nothing.
   */
  showSelectedMetricsByDevice(d: DevicesByDeviceTypeViewData) {
    d.showMetrices = !d.showMetrices;
    this.selectedDevicesWithMetrics.forEach((sd) => {
      if (sd.uuid != d.uuid) {
        sd.showMetrices = false;
      }
    });
  }

  /**
   * Removes device and metrics from selection from the current workflow.
   *
   * @param d - D value used by this method.
   * @returns Nothing.
   */
  removeDeviceAndMetricsFromSelection(d: DevicesByDeviceTypeViewData) {
    if (d.toBeRemoved) {
      for (let i = 0; i < d.metrices?.length; i++) {
        d.metrices[i].toBeRemoved = false;
        let metricIndex = this.metricsToBeRemoved.findIndex(
          (m) => m.item_id == d.metrices[i].item_id
        );
        if (metricIndex != -1) {
          this.metricsToBeRemoved.splice(metricIndex, 1);
        }
      }
      d.toBeRemoved = false;
    } else {
      d.toBeRemoved = true;
      for (let i = 0; i < d.metrices?.length; i++) {
        d.metrices[i].toBeRemoved = true;
        let metricIndex = this.metricsToBeRemoved.findIndex(
          (m) => m.item_id == d.metrices[i].item_id
        );
        if (metricIndex == -1) {
          this.metricsToBeRemoved.push(_clone(d.metrices[i]));
        }
      }
    }
  }

  /**
   * Removes metrics from selection from the current workflow.
   *
   * @param d - D value used by this method.
   * @param m - M value used by this method.
   * @returns Nothing.
   */
  removeMetricsFromSelection(
    d: DevicesByDeviceTypeViewData,
    m: MetricsByDevice
  ) {
    if (m.toBeRemoved) {
      m.toBeRemoved = false;
      d.toBeRemoved = false;
      let metricIndex = this.metricsToBeRemoved.findIndex(
        (mr) => mr.item_id == m.item_id
      );
      if (metricIndex != -1) {
        this.metricsToBeRemoved.splice(metricIndex, 1);
      }
    } else {
      m.toBeRemoved = true;
      let allSelectedToRemoveMetrices = d.metrices.filter(
        (dm) => dm.toBeRemoved == true
      );
      if (d.metrices?.length == allSelectedToRemoveMetrices.length) {
        d.toBeRemoved = true;
      }

      let metricIndex = this.metricsToBeRemoved.findIndex(
        (mr) => mr.item_id == m.item_id
      );
      if (metricIndex == -1) {
        this.metricsToBeRemoved.push(_clone(m));
      }
    }
  }

  /**
   * Executes the delete removed metrices workflow for Report Management Performance Crud Component.
   *
   * @returns Nothing.
   */
  deleteRemovedMetrices() {
    this.selectedDevicesWithMetrics = this.selectedDevicesWithMetrics.filter(
      (sd) => !sd.toBeRemoved
    );
    for (let i = 0; i < this.selectedDevicesWithMetrics.length; i++) {
      this.selectedDevicesWithMetrics[i].metrices =
        this.selectedDevicesWithMetrics[i].metrices.filter(
          (sdm) => !sdm.toBeRemoved
        );
    }

    this.metricsToBeRemoved = [];
    this.updateHostsControl();
  }

  /**
   * Updates hosts control for the current workflow.
   *
   * @returns Nothing.
   */
  updateHostsControl() {
    // The backend expects selected devices and metrics under report_meta.hosts.
    if (this.selectedDevicesWithMetrics.length) {
      this.form
        ?.get('hosts')
        ?.setValue(_clone(this.selectedDevicesWithMetrics));
    } else {
      this.form?.get('hosts')?.setValue(null);
    }
  }

  /**
   * Executes the submit workflow for Report Management Performance Crud Component.
   *
   * @returns Nothing.
   */
  submit() {
    this.updateHostsControl();
    if (this.form.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(
        this.form,
        this.validationMessages,
        this.formErrors
      );
      this.bindFormValidation();
    } else {
      let form = this.form.getRawValue();
      const obj = Object.assign({}, form);
      this.formData.emit(obj);
    }
  }

  /**
   * Handles error for the current workflow.
   *
   * @param err - HTTP or validation error returned by the API.
   * @returns Nothing.
   */
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

  private bindFilterValidation(
    filterFormGroup: FormGroup,
    index: number
  ): void {
    // Repeated invalid add/apply attempts should not register duplicate row subscriptions.
    if (this.filterValidationControls.indexOf(filterFormGroup) >= 0) {
      return;
    }
    this.filterValidationControls.push(filterFormGroup);
    filterFormGroup.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.formChangesUnsubscribe)
      )
      .subscribe(() => {
        this.formErrors.filters[index] = this.utilService.validateForm(
          filterFormGroup,
          this.validationMessages.filters,
          this.formErrors.filters[index]
        );
      });
  }

  private bindFormValidation(): void {
    // Whole-form validation should be subscribed once per form instance.
    if (this.formValueChangesBound) {
      return;
    }
    this.formValueChangesBound = true;
    this.form.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.formChangesUnsubscribe)
      )
      .subscribe(() => {
        this.formErrors = this.utilService.validateForm(
          this.form,
          this.validationMessages,
          this.formErrors
        );
      });
  }

  /**
   * Returns a stable identity for control rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param control - Control value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByControl(_index: number, control: AbstractControl): AbstractControl {
    return control;
  }

  /**
   * Returns a stable identity for device rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param device - Device value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByDevice(index: number, device: DevicesByDeviceTypeViewData): string {
    return device?.uuid || `${index}`;
  }

  /**
   * Returns a stable identity for metric rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param metric - Metric value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByMetric(index: number, metric: MetricsByDevice): number | string {
    return metric?.item_id || `${index}`;
  }

  private hasMetricForDevice(
    devices: DevicesByDeviceTypeViewData[],
    deviceUuid: string,
    itemId: number
  ): boolean {
    const device = devices?.find((d) => d.uuid == deviceUuid);
    return !!device?.metrices?.some((metric) => metric.item_id == itemId);
  }
}
