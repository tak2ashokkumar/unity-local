import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import {
  AppUtilityService,
  NoWhitespaceValidator,
} from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ReportFormData } from '../report-management-crud.service';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management Performance Crud.
 */
@Injectable()
export class ReportManagementPerformanceCrudService {
  constructor(
    private http: HttpClient,
    private builder: FormBuilder,
    private tableSvc: TableApiServiceService,
    private utilService: AppUtilityService
  ) {}

  /**
   * Loads or returns filter data for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getFilterData() {
    return attributeList;
  }

  /**
   * Builds form used by the current workflow.
   *
   * @param report - Report value used by this method.
   * @returns The constructed form, payload, or API observable.
   */
  buildForm(report: ReportFormData): FormGroup {
    let reportData = report?.report_meta;
    let filtersArray = this.buildFiltersArray(reportData?.filters);
    let isMetrcisOptionSelected = reportData?.filters?.some(
      (filter) => filter.attribute == 'Metrics'
    );
    // hosts is required only when the report is not directly filtered by Metrics.
    let form = this.builder.group({
      filter_match: [
        reportData?.filter_match || 'all',
        [Validators.required, NoWhitespaceValidator],
      ],
      filters: filtersArray,
      // 'hosts': [null, [Validators.required]],
      // 'sub_type': ['Latest']
    });
    if (!isMetrcisOptionSelected) {
      form.addControl('hosts', new FormControl(null, [Validators.required]));
    }
    return form;
  }

  private buildFiltersArray(filters?: any[]): FormArray {
    if (filters && filters.length) {
      return this.builder.array(
        filters.map((filter) =>
          this.builder.group({
            attribute: [
              filter.attribute,
              [Validators.required, NoWhitespaceValidator],
            ],
            operator: [
              filter.operator,
              [Validators.required, NoWhitespaceValidator],
            ],
            value: [
              filter.value,
              filter.attribute == 'Metrics'
                ? [Validators.required, NoWhitespaceValidator]
                : [Validators.required],
            ],
          })
        )
      );
    } else {
      return this.builder.array([
        this.builder.group({
          attribute: ['', [Validators.required, NoWhitespaceValidator]],
          operator: ['', [Validators.required, NoWhitespaceValidator]],
          value: ['', [Validators.required, NoWhitespaceValidator]],
        }),
      ]);
    }
  }

  /**
   * Resets form errors to its default state.
   *
   * @returns The value produced by the workflow.
   */
  resetFormErrors(): any {
    let formErrors = {
      filter_match: '',
      filters: [this.getFilterErrors()],
      hosts: '',
    };
    return formErrors;
  }
  /**
   * Loads or returns filter errors for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getFilterErrors() {
    return {
      attribute: '',
      operator: '',
      value: '',
    };
  }

  /**
   * Defines validation message text used by form validation helpers.
   */
  validationMessages = {
    filter_match: {
      required: 'Please select the match pattern',
    },
    filters: {
      attribute: {
        required: 'Attribute selection is required',
      },
      operator: {
        required: 'Operator selection is required',
      },
      value: {
        required: 'Value selection is required',
      },
    },
    hosts: {
      required: 'Field selection is required',
    },
  };

  /**
   * Loads or returns devices by device type for the current workflow.
   *
   * @param filters - Filters value used by this method.
   * @param criteria - Search, sort, and pagination criteria for the table request.
   * @returns The requested API observable or computed data.
   */
  getDevicesByDeviceType(
    filters: any,
    criteria: SearchCriteria
  ): Observable<PaginatedResult<DevicesByDeviceType>> {
    // Device search is based on the same filter payload that will be saved in report_meta.
    let data = { report_meta: { filters: filters } };
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.post<PaginatedResult<DevicesByDeviceType>>(
      `/customer/reporting/multireport/report_devices/`,
      data,
      { params: params }
    );
  }

  /**
   * Converts to view data into the view or API format expected by the workflow.
   *
   * @param data - Source data returned by the API or child form.
   * @returns The normalized data structure expected by the caller.
   */
  convertToViewData(data: DevicesByDeviceType[]) {
    // Add UI-only device status data without changing the API model.
    return data.map((d) => {
      let a = new DevicesByDeviceTypeViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.device_type = d.device_type;
      a.ip_address = d.ip_address;
      a.status = d.status;
      a.displayStatus = this.utilService.getDeviceStatus(d.status);
      a.host_id = d.host_id;
      a.platform_type = d.platform_type;
      return a;
    });
  }

  /**
   * Loads or returns metrics by device for the current workflow.
   *
   * @param criteria - Search, sort, and pagination criteria for the table request.
   * @returns The requested API observable or computed data.
   */
  getMetricsByDevice(
    criteria: SearchCriteria
  ): Observable<PaginatedResult<MetricsByDevice>> {
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<MetricsByDevice>>(
      `/rest/zabbix/device_items/`,
      { params: params }
    );
  }
}

export const deviceTypes = [
  'Switch',
  'Firewalls',
  'Load Balancers',
  'Hypervisor',
  'Baremetal',
  'Virtual Machines',
  'Macdevice',
  // "Containers",
  'Storage',
  // "S3",
  // "Mobile Device",
  'Databases',
  'Other Device',
];

export const operatorList1 = [
  { key: '=', value: 'equal' },
  { key: '!=', value: 'not equal' },
];
export const operatorList2 = [
  { key: '<', value: 'less than' },
  { key: '>', value: 'greater than' },
  { key: '=', value: 'equal' },
  { key: '!=', value: 'not equal' },
];
export const operatorList3 = [
  { key: '=', value: 'equal' },
  { key: '!=', value: 'not equal' },
  { key: 'Contains', value: 'contains' },
  { key: 'Starts with', value: 'startswith' },
  { key: 'Ends with', value: 'endswith' },
];

export const attributeList = [
  // { name: "Datacenter", value: "Datacenter", operators: operatorList1, value_type: "multi-select", options: [] },
  // { name: "Cabinet", value: "Cabinet", operators: operatorList1, value_type: "multi-select", options: [] },
  {
    name: 'Device Type',
    value: 'Device Type',
    operators: operatorList1,
    value_type: 'multi-select-simple',
    options: deviceTypes,
  },
  // { name: "Device Name", value: "Name", operators: operatorList3, value_type: "input" },
  {
    name: 'Metrics',
    value: 'Metrics',
    operators: operatorList1,
    value_type: 'input',
    options: deviceTypes,
  },
];

/**
 * Describes the Devices By Device Type data contract used by Unity Reports.
 */
export interface DevicesByDeviceType {
  /**
   * Describes the uuid value in the Devices By Device Type contract.
   */
  uuid: string;
  /**
   * Describes the device type value in the Devices By Device Type contract.
   */
  device_type: string;
  /**
   * Describes the host id value in the Devices By Device Type contract.
   */
  host_id: number;
  /**
   * Describes the ip address value in the Devices By Device Type contract.
   */
  ip_address: string;
  /**
   * Describes the status value in the Devices By Device Type contract.
   */
  status: string;
  /**
   * Describes the name value in the Devices By Device Type contract.
   */
  name: string;
  /**
   * Describes the platform type value in the Devices By Device Type contract.
   */
  platform_type: string;
}

/**
 * Represents normalized view data consumed by Unity Reports templates.
 */
export class DevicesByDeviceTypeViewData {
  /**
   * Stores the uuid value used by Devices By Device Type View Data.
   */
  uuid: string;
  /**
   * Stores the name value used by Devices By Device Type View Data.
   */
  name: string;
  /**
   * Stores the device type value used by Devices By Device Type View Data.
   */
  device_type: string;
  /**
   * Stores the ip address value used by Devices By Device Type View Data.
   */
  ip_address: string;
  /**
   * Stores the status value used by Devices By Device Type View Data.
   */
  status: string;
  /**
   * Stores the host id value used by Devices By Device Type View Data.
   */
  host_id: number;
  /**
   * Stores the platform type value used by Devices By Device Type View Data.
   */
  platform_type: string;

  /**
   * Stores the display status value used by Devices By Device Type View Data.
   */
  displayStatus: string; // to display fa icon for shared-device-status
  /**
   * Stores the metrices value used by Devices By Device Type View Data.
   */
  metrices?: MetricsByDevice[]; // to add selected metrices for device level
  /**
   * Stores the show metrices value used by Devices By Device Type View Data.
   */
  showMetrices: boolean; // to show or hide metrices from selected list.
  /**
   * Stores the to be removed value used by Devices By Device Type View Data.
   */
  toBeRemoved: boolean; //to manage remove operation for selected list.
}

/**
 * Describes the Metrics By Device data contract used by Unity Reports.
 */
export interface MetricsByDevice {
  /**
   * Describes the item id value in the Metrics By Device contract.
   */
  item_id: number;
  /**
   * Describes the item name value in the Metrics By Device contract.
   */
  item_name: string;
  /**
   * Describes the host id value in the Metrics By Device contract.
   */
  host_id: number;
  /**
   * Describes the unit value in the Metrics By Device contract.
   */
  unit: string;

  //for ui purpose
  /**
   * Describes the selected value in the Metrics By Device contract.
   */
  selected: boolean; // to manage select operation.
  /**
   * Describes the to be removed value in the Metrics By Device contract.
   */
  toBeRemoved: boolean; // to manage remove operation from selected list.
}
