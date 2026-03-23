import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppLevelService } from 'src/app/app-level.service';
import { forkJoin, Observable, of } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DATA_CENTERS, GET_CABINETS, GET_REPORT_FIELDS_BY_TYPE } from 'src/app/shared/api-endpoint.const';
import moment from 'moment';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { DataCenterCabinet } from 'src/app/united-cloud/shared/entities/datacenter-cabinet.type';
import { ManageReportDatacenterType } from '../datacenter-report-crud/datacenter-report-crud.type';
import { Period, ReportFormData } from 'src/app/unity-reports/manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.service';
import { AgentInstalled, AllCloud, Devices, Monitoring, OtherDevices, PrivateCloud, PublicCloud, Regions, ScriptType, Services, Status, StatusType, TargetType, opList1, opList2, opList3, opList4 } from './attribute-options.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { map } from 'rxjs/operators';

@Injectable()
export class CloudInventoryReportCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilService: AppUtilityService,
    private appService: AppLevelService) { }

  getFilterData(reportType: string, cloudType: string, executionType?: string, tableUuid?: string): Observable<AttributeDataType[]> { //Need to fetch from API
    switch (reportType) {
      case ReportTypesMapping.CLOUDINVENTORY:
        let attrArr = (cloudType == 'Private') ? PrivateCloudInventoryAttr : PublicCloudInventoryAttr;
        return of(attrArr);
      case ReportTypesMapping.DCINVENTORY: return of(DcInventoryAttr);
      case ReportTypesMapping.COSTANALYSIS: return of(CostAnalysisAttr);
      case ReportTypesMapping.SUSTAINABILITY: return of(SustainabilityAttr);
      case ReportTypesMapping.DEVOPSAUTOMATION:
        if (executionType === 'Workflow') {
          return of(DevopsAutomationWorkflowAttr);
        } else if (executionType === 'Workflow Integration') {
          return of(DevopsAutomationWorkflowIntegAttr);
        } else {
          return of(DevopsAutomationAttr);
        }
      case ReportTypesMapping.UNITYONEITSM: return this.getUnityOneAttributes(tableUuid);
      default: return of([]);
    }
  };

  getUnityOneAttributes(tableUuid: string): Observable<AttributeDataType[]> {
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableUuid}/`).pipe(
      map(res => {
        const apiAttrs = this.mapUnityOneFields(res.fields || []);
        return [
          ...UnityOneITSMInventoryAttr,
          ...apiAttrs
        ];
      })
    );
  }


  fetchReferenceOptions(attr: any, reference_table: string): void {
    this.http.get<{ results: any[] }>(`/rest/unity_itsm/tables/${reference_table}/records/`).subscribe(res => {
      attr.options = (res.results || []).map(r => ({
        name: r.ticket_id,
        uuid: r.ticket_id
      }));
    });
  }

  // UNITYONEITSM
  mapUnityOneFields(fields: any[]): AttributeDataType[] {
    return fields.filter(f => f.field_type !== 'COMMENTS')
      .map(field => ({
        name: field.label,
        value: field.field_name,
        field_type: field.field_type,
        reference_table: field?.reference_table,
        operators: this.resolveOperators(field),
        value_type: this.resolveValueType(field),
        options: this.resolveOptions(field)
      }));
  }

  // UNITYONEITSM
  resolveOptions(field: any): any[] {
    switch (field.field_type) {

      case 'BOOLEAN':
        return [
          { name: 'True', uuid: true },
          { name: 'False', uuid: false }
        ];

      case 'DROPDOWN':
        return (field.options || []).map(opt => ({
          name: opt,
          uuid: opt
        }));

      case 'REFERENCE':
        return [];

      default:
        return [];
    }
  }

  // UNITYONEITSM
  resolveOperators(field: any): operatorsDataType[] {
    switch (field.field_type) {
      case 'TEXT':
      case 'TEXTAREA':
      case 'JSON':
        return opList3;
      case 'NUMBER':
        return opList2;
      default:
        return opList1;
    }
  }

  // UNITYONEITSM
  resolveValueType(field: any): string {
    switch (field.field_type) {
      case 'DROPDOWN':
      case 'REFERENCE':
      case 'BOOLEAN':
        return 'multi-select';
      case 'DATE':
        return 'date';
      case 'DATETIME':
        return 'date-time';
      case 'NUMBER':
        return 'number'
      default:
        return 'input';
    }
  }

  getDatacenterOptions() {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
  }

  getCabinetOptions() {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
  }

  getCategoryOptions() {
    return this.http.get<CategoryData>(`/orchestration/category/all_categories/`);
  }

  getUsers() {
    return this.http.get<any>(`/customer/organizationusers/`, { params: { 'page_size': '0' } })
  }

  getOSTypes() {
    return this.http.get<OsDataType[]>(`/rest/os/`, { params: { 'page_size': '0' } })
  }

  getOSVersions() {
    return this.http.get<OsDataType[]>(`/rest/os/`, { params: { 'page_size': '0' } })
  }

  getResourcTypesOptions(cloud: string) {
    const aws = this.http.get<string[]>(`/customer/aws/services/`);
    const azure = this.http.get<string[]>(`/customer/azure/resources_type/providers/`);
    const oci = this.http.get<string[]>('/customer/managed/oci/resource_types/services/');
    return forkJoin([aws, azure, oci]);
  }

  getLocationOptions() {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
  }

  getManufacturerOptions() {
    return this.http.get<ManufacturesData[]>(`/rest/manufacturer/?page_size=0`, { params: { 'page_size': '0' } });
  }

  getCloudAttributeOptions(cloud: string) {
    let opt = [];
    if (cloud == 'Public') {
      opt = PublicCloud;
    }
    if (cloud == 'Private') {
      opt = PrivateCloud;
    }
    if (cloud == 'All') {
      opt = AllCloud;
    }
    return opt;
  }

  getFieldsData(type: string, uuid: string, workflowInteg?: string, tableUuid?: string) {
    let params: HttpParams = new HttpParams();
    params = params.append('type', type);
    if (uuid) {
      params = params.append('uuid', uuid);
    }
    if (workflowInteg) {
      params = params.append('integration', workflowInteg);
    }
    if (tableUuid) {
      params = params.append('table_uuid', tableUuid)
    }
    return this.http.get<FieldsDataType>(GET_REPORT_FIELDS_BY_TYPE(), { params: params });
  }

  buildForm(report: ReportFormData): FormGroup {
    let reportData = report?.report_meta;
    let filtersArray = this.createFiltersArray(reportData?.filters);
    let form = this.builder.group({
      'filter_match': [reportData?.filter_match || 'all', [Validators.required, NoWhitespaceValidator]],
      'filters': filtersArray,
      'fields': [null, [Validators.required]]
    });

    if (reportData && (report.feature === "Cost Analysis" || report.feature === "sustainability")) {
      form.addControl('period', this.getPeriodFormControls(reportData.period));
    }
    return form;
  }

  private createFiltersArray(filters?: any[]): FormArray {
    if (filters && filters.length > 0) {
      return this.builder.array(
        filters.map(filter => this.builder.group({
          'attribute': [filter.attribute, [Validators.required, NoWhitespaceValidator]],
          'operator': [filter.operator, [Validators.required, NoWhitespaceValidator]],
          'value': [filter.value, [Validators.required]],
        }))
      );
    } else {
      return this.builder.array([
        this.builder.group({
          'attribute': ['', [Validators.required, NoWhitespaceValidator]],
          'operator': ['', [Validators.required, NoWhitespaceValidator]],
          'value': ['', [Validators.required]],
        })
      ]);
    }
  }

  getPeriodFormControls(period: Period) {
    let period_type = period?.period_type ? period.period_type : 'last';
    let form = this.builder.group({
      'period_type': [period_type, [Validators.required, NoWhitespaceValidator]],
    });
    if (period_type == 'current' || period_type == 'last') {
      form.addControl('range', new FormControl(period?.range ? period.range : '', [Validators.required, NoWhitespaceValidator]));
      form.addControl('counter', new FormControl(period?.counter ? period.counter : '', [Validators.required, NoWhitespaceValidator]))
    }
    if (period_type == 'custom') {
      form.addControl('start_date', new FormControl(period?.start_date ? moment(period.start_date).format('YYYY-MM-DD') : '', [Validators.required, NoWhitespaceValidator]));
      form.addControl('end_date', new FormControl(period?.end_date ? moment(period.end_date).format('YYYY-MM-DD') : '', [Validators.required, NoWhitespaceValidator]));
    }
    return form;
  }

  formatMomentTime(obj: any): any {
    let formattedObj: any = { ...obj, period: {} };

    if (obj.schedule === 'current' || obj.schedule === 'last') {
      formattedObj.period.period_type = obj.schedule;
      formattedObj.period.range = obj.range;
      formattedObj.period.counter = obj.counter;

      // Remove top-level period, range, and counter keys
      delete formattedObj.schedule;
      delete formattedObj.range;
      delete formattedObj.counter;

    } else if (obj.schedule === 'custom') {
      formattedObj.period.period_type = 'custom';
      formattedObj.period.start_date = moment(obj.start_date).format('YYYY-MM-DD');
      formattedObj.period.end_date = moment(obj.end_date).format('YYYY-MM-DD');

      // Remove top-level period, start_date, and end_date keys
      delete formattedObj.schedule;
      delete formattedObj.start_date;
      delete formattedObj.end_date;
    }

    return formattedObj;
  }

  getFilterErrors() {
    return {
      'attribute': '',
      'operator': '',
      'value': '',
    }
  }

  getPeriodErrors() {
    return {
      'period_type': '',
      'counter': '',
      'range': '',
      'start_date': '',
      'end_date': '',
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'filter_match': '',
      'filters': [this.getFilterErrors()],
      'period': this.getPeriodErrors(),
      'fields': ''
    };
    return formErrors;
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
    'period': {
      'period_type': {
        'required': 'Period type selection is required'
      },
      'range': {
        'required': 'Range selection is required'
      },
      'counter': {
        'required': 'Counter selection is required'
      },
      'start_date': {
        'required': 'Start Date selection is required'
      },
      'end_date': {
        'required': 'End Date selection is required'
      },
    },
    'fields': {
      'required': 'Field selection is required'
    },
  };

  convertFields(fields: any) {
    let fieldsArr = [];
    for (const [key, value] of Object.entries(fields)) {
      let field = new FieldsViewData();
      field.key = key;
      field.value = <string>value;
      field.checked = false;
      fieldsArr.push(field);
    }
    return fieldsArr;
  }

  convertSelectedFields(fields: any) {
    let fieldsArr = {};
    for (let field of fields) {
      let obj = {};
      obj[field.key] = field.value;
      fieldsArr = Object.assign(fieldsArr, obj);
    }
    return fieldsArr;
  }
}

export enum ReportTypesMapping {
  CLOUDINVENTORY = 'Cloud Inventory',
  DCINVENTORY = 'DC Inventory',
  COSTANALYSIS = 'Cost Analysis',
  SUSTAINABILITY = 'sustainability',
  DEVOPSAUTOMATION = 'DevOps Automation',
  UNITYONEITSM = 'UnityOne ITSM'
}

const PublicCloudInventoryAttr = [
  { name: "Resource Name", value: "Resource Name", operators: opList3, value_type: "input" },
  { name: "Account Name", value: "Account Name", operators: opList1, value_type: "input" },
  { name: "Region", value: "Region", operators: opList1, value_type: "multi-select-simple", options: Regions },
  { name: "Resource Type", value: "Resource Type", operators: opList1, value_type: "multi-select-simple", options: [] },
  { name: "Status", value: "Status", operators: opList1, value_type: "multi-select-simple", options: Status },
  { name: "Cloud Type", value: "Cloud Type", operators: opList1, value_type: "multi-select-simple", options: PublicCloud },
  // { name: "Services Name", value: "Services Name", operators: opList1, value_type: "multi-select-simple", options: [] },
  // { name: "Location", value: "Location", operators: opList1, value_type: "multi-select-simple", options: [] },
  // { name: "Host Name", value: "Host Name", operators: opList3, value_type: "input"},
  // { name: "First Discovered", value: "First Discovered", operators: opList2, value_type: "date" },
  // { name: "Last Discovered", value: "Last Discovered", operators: opList2, value_type: "date" },
];

const PrivateCloudInventoryAttr = [
  { name: "Name", value: "Name", operators: opList3, value_type: "input" },
  { name: "IP", value: "IP", operators: opList3, value_type: "input" },
  { name: "Status", value: "Status", operators: opList1, value_type: "multi-select-simple", options: Status },
  { name: "First Discovered", value: "First Discovered", operators: opList2, value_type: "date" },
  { name: "Last Discovered", value: "Last Discovered", operators: opList2, value_type: "date" },
  { name: "Discovery Method", value: "Discovery Method", operators: opList1, value_type: "input" },
  { name: "Device Type", value: "Device Type", operators: opList1, value_type: "multi-select-simple", options: Devices },
  { name: "Location", value: "Location", operators: opList1, value_type: "multi-select-simple", options: [] },
];

const DcInventoryAttr = [
  { name: "Name", value: "Name", operators: opList3, value_type: "input" },
  { name: "Device Type", value: "Device Type", operators: opList1, value_type: "multi-select-simple", options: OtherDevices },
  { name: "IP", value: "IP", operators: opList1, value_type: "input" },
  { name: "Status", value: "Status", operators: opList1, value_type: "multi-select-simple", options: Status },
  { name: "Agent Installed", value: "Agent Installed", operators: opList1, value_type: "multi-select-simple", options: AgentInstalled },
  { name: "Monitoring", value: "Monitoring", operators: opList1, value_type: "multi-select-simple", options: Monitoring },
  { name: "OS Name", value: "OS Type", operators: opList3, value_type: "input" },
  // { name: "OS Version", value: "OS Version", operators: opList3, value_type: "input"  },
  { name: "Discovery Method", value: "Discovery Method", operators: opList1, value_type: "input" },
  { name: "Tag", value: "Tag", operators: opList3, value_type: "input" },
  { name: "First Discovered", value: "First Discovered", operators: opList1, value_type: "date" },
  { name: "Last Discovered", value: "Last Discovered", operators: opList1, value_type: "date" },
  { name: "Cabinet", value: "Cabinet", operators: opList1, value_type: "multi-select", options: [] },
  { name: "Manufacturer", value: "Manufacturer", operators: opList1, value_type: "multi-select-simple", options: [] },
  { name: "Model", value: "Model", operators: opList3, value_type: "input" },
  { name: "Datacenter", value: "Datacenter", operators: opList1, value_type: "multi-select", options: [] },
];

const CostAnalysisAttr = [
  { name: "Datacenter", value: "Datacenter", operators: opList1, value_type: "multi-select", options: [] },
  { name: "Cloud", value: "Cloud", operators: opList1, value_type: "multi-select-simple", options: AllCloud },
  { name: "Region", value: "Region", operators: opList1, value_type: "multi-select-simple", options: Regions },
  { name: "Services", value: "Services", operators: opList1, value_type: "multi-select-simple", options: Services },
  { name: "Tag", value: "Tag", operators: opList3, value_type: "input" },
];

const SustainabilityAttr = [
  { name: "Datacenter", value: "Datacenter", operators: opList1, value_type: "multi-select", options: [] },
  { name: "Cloud", value: "Cloud", operators: opList1, value_type: "multi-select-simple", options: AllCloud },
  { name: "Account Name", value: "Account Name", operators: opList1, value_type: "input" },
  { name: "Tag", value: "Tag", operators: opList3, value_type: "input" },
  { name: "Device Type", value: "Device Type", operators: opList1, value_type: "multi-select-simple", options: Devices },
  // { name: "Devices", value: "Devices", operators: opList3, value_type: "multi-select-simple", options: Devices },
  // { name: "Projects", value: "Projects", operators: opList1, value_type: "input"  }
  { name: "Cabinet", value: "Cabinet", operators: opList1, value_type: "multi-select", options: [] },
];

const DevopsAutomationAttr = [
  { name: "Script Type", value: "Script Type", operators: opList1, value_type: "multi-select-simple", options: ScriptType },
  { name: "Target Type", value: "Target Type", operators: opList1, value_type: "multi-select-simple", options: TargetType },
  { name: "Template Name", value: "Template Name", operators: opList3, value_type: "input" },
  { name: "Category", value: "Category", operators: opList1, value_type: "multi-select-simple", options: [] },
  { name: "Start Time", value: "Start Time", operators: opList4, value_type: "date" },
  { name: "End Time", value: "End Time", operators: opList4, value_type: "date" },
  { name: "Duration", value: "Duration", operators: opList2, value_type: "input" },
  { name: "Status", value: "Status", operators: opList1, value_type: "multi-select-simple", options: StatusType },
  { name: "Executed By", value: "Executed By", operators: opList1, value_type: "multi-select", options: [] },
];

const DevopsAutomationWorkflowAttr = [
  { name: "Target Type", value: "Target Type", operators: opList1, value_type: "multi-select-simple", options: TargetType },
  { name: "Template Name", value: "Template Name", operators: opList3, value_type: "input" },
  { name: "Category", value: "Category", operators: opList1, value_type: "multi-select-simple", options: [] },
  { name: "Start Time", value: "Start Time", operators: opList4, value_type: "date" },
  { name: "End Time", value: "End Time", operators: opList4, value_type: "date" },
  { name: "Duration", value: "Duration", operators: opList2, value_type: "input" },
  { name: "Status", value: "Status", operators: opList1, value_type: "multi-select-simple", options: StatusType },
  { name: "Executed By", value: "Executed By", operators: opList1, value_type: "multi-select", options: [] },
];

const DevopsAutomationWorkflowIntegAttr = [
  { name: "Request ID", value: "Request ID", operators: opList3, value_type: "input" },
  { name: "External Request ID", value: "External Request ID", operators: opList3, value_type: "input" },
  { name: "Requested on", value: "Requested on", operators: opList4, value_type: "date" },
  { name: "Started on", value: "Started on", operators: opList4, value_type: "date" },
  { name: "Completed on", value: "Completed on", operators: opList4, value_type: "date" },
  { name: "Status", value: "Status", operators: opList1, value_type: "multi-select-simple", options: StatusType }
];

const UnityOneITSMInventoryAttr = [
  { name: "Uuid", value: "uuid", operators: opList3, value_type: "input" },
  { name: "Ticket ID", value: "ticket_id", operators: opList3, value_type: "input" },
  { name: "Created At", value: "created_at", operators: opList4, value_type: "date" },
  { name: "Created By", value: "created_by", operators: opList1, value_type: "multi-select", options: [] },
];

export interface AttributeDataType {
  name: string;
  value: string;
  operators: operatorsDataType[];
  value_type: string;
  options?: any[];
  field_type?: string;
  reference_table?: string;
}

interface operatorsDataType {
  key: string;
  value: string;
}

export interface FieldsDataType {
  status: boolean;
  data: DataType;
}
export interface DataType extends DataListType {
  Public: DataListType;
  Private: DataListType;
}
export interface DataListType {
  // Default: any;
  // All: any;
  Unselected: any;
  Selected: any;
}

export interface FieldsType {
  key: string;
  value: string;
  checked: boolean;
}

export class FieldsViewData {
  constructor() { }
  key: string;
  value: string;
  checked: boolean;
}

interface ManufacturesData {
  url: string;
  id: number;
  name: string;
}
interface CategoryData {
  Task: CategoryItem[];
  Worklfow: CategoryItem[];
}

interface CategoryItem {
  category: string;
}
export interface OsDataType {
  url: string;
  id: number;
  name: string;
  version: string;
  full_name: string;
  platform_type: string;
}