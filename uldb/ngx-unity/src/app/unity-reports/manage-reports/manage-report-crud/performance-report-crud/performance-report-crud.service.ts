import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ReportFormData } from 'src/app/unity-reports/manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.service';

@Injectable()
export class PerformanceReportCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableSvc: TableApiServiceService,
    private utilService: AppUtilityService) { }

  getFilterData() {
    return attributeList;
  };

  buildForm(report: ReportFormData): FormGroup {
    let reportData = report?.report_meta;
    let filtersArray = this.buildFiltersArray(reportData?.filters);
    let isMetrcisOptionSelected = reportData?.filters?.some(filter => filter.attribute == 'Metrics');
    let form = this.builder.group({
      'filter_match': [reportData?.filter_match || 'all', [Validators.required, NoWhitespaceValidator]],
      'filters': filtersArray,
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
        filters.map(filter => this.builder.group({
          'attribute': [filter.attribute, [Validators.required, NoWhitespaceValidator]],
          'operator': [filter.operator, [Validators.required, NoWhitespaceValidator]],
          'value': [filter.value, filter.attribute == 'Metrics' ? [Validators.required, NoWhitespaceValidator] : [Validators.required]],
        }))
      );
    } else {
      return this.builder.array([
        this.builder.group({
          'attribute': ['', [Validators.required, NoWhitespaceValidator]],
          'operator': ['', [Validators.required, NoWhitespaceValidator]],
          'value': ['', [Validators.required, NoWhitespaceValidator]],
        })
      ]);
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'filter_match': '',
      'filters': [this.getFilterErrors()],
      'hosts': ''
    };
    return formErrors;
  }
  getFilterErrors() {
    return {
      'attribute': '',
      'operator': '',
      'value': '',
    }
  }

  validationMessages = {
    'filter_match': {
      'required': 'Please select the match pattern'
    },
    'filters': {
      'attribute': {
        'required': 'Attribute selection is required'
      },
      'operator': {
        'required': 'Operator selection is required'
      },
      'value': {
        'required': 'Value selection is required'
      },
    },
    'hosts': {
      'required': 'Field selection is required'
    },
  };

  getDevicesByDeviceType(filters: any, criteria: SearchCriteria): Observable<PaginatedResult<DevicesByDeviceType>> {
    let data = { 'report_meta': { 'filters': filters } };
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.post<PaginatedResult<DevicesByDeviceType>>(`/customer/reporting/multireport/report_devices/`, data, { params: params });
  }

  convertToViewData(data: DevicesByDeviceType[]) {
    let viewData: DevicesByDeviceTypeViewData[] = [];
    data.map(d => {
      let a = new DevicesByDeviceTypeViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.device_type = d.device_type;
      a.ip_address = d.ip_address;
      a.status = d.status;
      a.displayStatus = this.utilService.getDeviceStatus(d.status);
      a.host_id = d.host_id;
      a.platform_type = d.platform_type;
      viewData.push(a);
    })
    return viewData;
  }

  getMetricsByDevice(criteria: SearchCriteria): Observable<PaginatedResult<MetricsByDevice>> {
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<MetricsByDevice>>(`/rest/zabbix/device_items/`, { params: params })
  }
}

export const deviceTypes = [
  "Switch",
  "Firewalls",
  "Load Balancers",
  "Hypervisor",
  "Baremetal",
  "Virtual Machines",
  "Macdevice",
  // "Containers",
  "Storage",
  // "S3",
  // "Mobile Device",
  "Databases",
  "Other Device"
]

export const operatorList1 = [
  { key: '=', value: 'equal' },
  { key: '!=', value: 'not equal' }
];
export const operatorList2 = [
  { key: '<', value: 'less than' },
  { key: '>', value: 'greater than' },
  { key: '=', value: 'equal' },
  { key: '!=', value: 'not equal' }
];
export const operatorList3 = [
  { key: '=', value: 'equal' },
  { key: '!=', value: 'not equal' },
  { key: 'Contains', value: 'contains' },
  { key: 'Starts with', value: 'startswith' },
  { key: 'Ends with', value: 'endswith' }
];

export const attributeList = [
  // { name: "Datacenter", value: "Datacenter", operators: operatorList1, value_type: "multi-select", options: [] },
  // { name: "Cabinet", value: "Cabinet", operators: operatorList1, value_type: "multi-select", options: [] },
  { name: "Device Type", value: "Device Type", operators: operatorList1, value_type: "multi-select-simple", options: deviceTypes },
  // { name: "Device Name", value: "Name", operators: operatorList3, value_type: "input" },
  { name: "Metrics", value: "Metrics", operators: operatorList1, value_type: "input", options: deviceTypes },

];

export interface DevicesByDeviceType {
  uuid: string;
  device_type: string;
  host_id: number;
  ip_address: string;
  status: string;
  name: string;
  platform_type: string;
}

export class DevicesByDeviceTypeViewData {
  uuid: string;
  name: string;
  device_type: string;
  ip_address: string;
  status: string;
  host_id: number;
  platform_type: string;

  displayStatus: string; // to display fa icon for shared-device-status
  metrices?: MetricsByDevice[]; // to add selected metrices for device level
  showMetrices: boolean; // to show or hide metrices from selected list.
  toBeRemoved: boolean; //to manage remove operation for selected list.
}

export interface MetricsByDevice {
  item_id: number;
  item_name: string;
  host_id: number;
  unit: string;

  //for ui purpose
  selected: boolean; // to manage select operation.
  toBeRemoved: boolean // to manage remove operation from selected list.
}
