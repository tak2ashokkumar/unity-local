import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DATA_CENTERS,
  GET_REPORT_FIELDS_BY_TYPE,
} from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ManageReportDatacenterType } from '../../report-management.type';
import { Period, ReportFormData } from '../report-management-crud.service';
import {
  AgentInstalled,
  AllCloud,
  Devices,
  Monitoring,
  opList1,
  opList2,
  opList3,
  opList4,
  OtherDevices,
  PrivateCloud,
  PublicCloud,
  Regions,
  ScriptType,
  Services,
  Status,
  StatusType,
  TargetType,
} from './attribute-options.type';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management Cloud Inventory Crud.
 */
@Injectable()
export class ReportManagementCloudInventoryCrudService {
  constructor(private http: HttpClient, private builder: FormBuilder) {}

  /**
   * Loads or returns filter data for the current workflow.
   *
   * @param reportType - Report Type value used by this method.
   * @param cloudType - Cloud Type value used by this method.
   * @param executionType - Execution Type value used by this method.
   * @param tableUuid - Table Uuid value used by this method.
   * @returns The requested API observable or computed data.
   */
  getFilterData(
    reportType: string,
    cloudType: string,
    executionType?: string,
    tableUuid?: string
  ): Observable<AttributeDataType[]> {
    //Need to fetch from API
    // Most report types use local attribute catalogs; UnityOne fields are table-driven.
    switch (reportType) {
      case ReportTypesMapping.CLOUDINVENTORY:
        let attrArr =
          cloudType == 'Private'
            ? PrivateCloudInventoryAttr
            : PublicCloudInventoryAttr;
        return of(attrArr);
      case ReportTypesMapping.DCINVENTORY:
        return of(DcInventoryAttr);
      case ReportTypesMapping.COSTANALYSIS:
        return of(CostAnalysisAttr);
      case ReportTypesMapping.SUSTAINABILITY:
        return of(SustainabilityAttr);
      case ReportTypesMapping.DEVOPSAUTOMATION:
        if (executionType === 'Workflow') {
          return of(DevopsAutomationWorkflowAttr);
        } else if (executionType === 'Workflow Integration') {
          return of(DevopsAutomationWorkflowIntegAttr);
        } else {
          return of(DevopsAutomationAttr);
        }
      case ReportTypesMapping.UNITYONEITSM:
        return this.getUnityOneAttributes(tableUuid);
      default:
        return of([]);
    }
  }

  /**
   * Loads or returns unity one attributes for the current workflow.
   *
   * @param tableUuid - Table Uuid value used by this method.
   * @returns The requested API observable or computed data.
   */
  getUnityOneAttributes(tableUuid: string): Observable<AttributeDataType[]> {
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableUuid}/`).pipe(
      map((res) => {
        const apiAttrs = this.mapUnityOneFields(res.fields || []);
        return [...UnityOneITSMInventoryAttr, ...apiAttrs];
      })
    );
  }

  /**
   * Fetches additional reference options data for the current workflow.
   *
   * @param attr - Attr value used by this method.
   * @param reference_table - Reference Table value used by this method.
   * @returns The requested API observable or computed data.
   */
  fetchReferenceOptions(attr: any, reference_table: string): Observable<any[]> {
    // Mutate the attribute option list used by the open form row after reference records load.
    return this.http
      .get<{ results: any[] }>(
        `/rest/unity_itsm/tables/${reference_table}/records/`
      )
      .pipe(
        map((res) => {
          attr.options = (res.results || []).map((r) => ({
            name: r.ticket_id,
            uuid: r.ticket_id,
          }));
          return attr.options;
        })
      );
  }

  // UNITYONEITSM
  /**
   * Maps unity one fields into the expected format.
   *
   * @param fields - Fields value used by this method.
   * @returns The normalized data structure expected by the caller.
   */
  mapUnityOneFields(fields: any[]): AttributeDataType[] {
    return fields
      .filter((f) => f.field_type !== 'COMMENTS')
      .map((field) => ({
        name: field.label,
        value: field.field_name,
        field_type: field.field_type,
        reference_table: field?.reference_table,
        operators: this.resolveOperators(field),
        value_type: this.resolveValueType(field),
        options: this.resolveOptions(field),
      }));
  }

  // UNITYONEITSM
  /**
   * Executes the resolve options workflow for Report Management Cloud Inventory Crud Service.
   *
   * @param field - Field value used by this method.
   * @returns The value produced by the workflow.
   */
  resolveOptions(field: any): any[] {
    switch (field.field_type) {
      case 'BOOLEAN':
        return [
          { name: 'True', uuid: true },
          { name: 'False', uuid: false },
        ];

      case 'DROPDOWN':
        return (field.options || []).map((opt) => ({
          name: opt,
          uuid: opt,
        }));

      case 'REFERENCE':
        return [];

      default:
        return [];
    }
  }

  // UNITYONEITSM
  /**
   * Executes the resolve operators workflow for Report Management Cloud Inventory Crud Service.
   *
   * @param field - Field value used by this method.
   * @returns The value produced by the workflow.
   */
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
  /**
   * Executes the resolve value type workflow for Report Management Cloud Inventory Crud Service.
   *
   * @param field - Field value used by this method.
   * @returns The value produced by the workflow.
   */
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
        return 'number';
      default:
        return 'input';
    }
  }

  /**
   * Loads or returns datacenter options for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getDatacenterOptions() {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), {
      params: { page_size: '0' },
    });
  }

  /**
   * Loads or returns cabinet options for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getCabinetOptions() {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), {
      params: { page_size: '0' },
    });
  }

  /**
   * Loads or returns category options for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getCategoryOptions() {
    return this.http.get<CategoryData>(
      `/orchestration/category/all_categories/`
    );
  }

  /**
   * Loads or returns users for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getUsers() {
    return this.http.get<any>(`/customer/organizationusers/`, {
      params: { page_size: '0' },
    });
  }

  /**
   * Loads or returns ostypes for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getOSTypes() {
    return this.http.get<OsDataType[]>(`/rest/os/`, {
      params: { page_size: '0' },
    });
  }

  /**
   * Loads or returns osversions for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getOSVersions() {
    return this.http.get<OsDataType[]>(`/rest/os/`, {
      params: { page_size: '0' },
    });
  }

  /**
   * Loads or returns resourc types options for the current workflow.
   *
   * @param _cloud - Cloud value used by this method.
   * @returns The requested API observable or computed data.
   */
  getResourcTypesOptions(_cloud: string) {
    const aws = this.http.get<string[]>(`/customer/aws/services/`);
    const azure = this.http.get<string[]>(
      `/customer/azure/resources_type/providers/`
    );
    const oci = this.http.get<string[]>(
      '/customer/managed/oci/resource_types/services/'
    );
    return forkJoin([aws, azure, oci]);
  }

  /**
   * Loads or returns location options for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getLocationOptions() {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), {
      params: { page_size: '0' },
    });
  }

  /**
   * Loads or returns manufacturer options for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getManufacturerOptions() {
    return this.http.get<ManufacturesData[]>(
      `/rest/manufacturer/?page_size=0`,
      { params: { page_size: '0' } }
    );
  }

  /**
   * Loads or returns cloud attribute options for the current workflow.
   *
   * @param _cloud - Cloud value used by this method.
   * @returns The requested API observable or computed data.
   */
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

  /**
   * Loads or returns fields data for the current workflow.
   *
   * @param type - Type value used by this method.
   * @param uuid - Identifier used to target the uuid.
   * @param workflowInteg - Workflow Integ value used by this method.
   * @param tableUuid - Table Uuid value used by this method.
   * @returns The requested API observable or computed data.
   */
  getFieldsData(
    type: string,
    uuid: string,
    workflowInteg?: string,
    tableUuid?: string
  ) {
    let params: HttpParams = new HttpParams();
    params = params.append('type', type);
    if (uuid) {
      params = params.append('uuid', uuid);
    }
    if (workflowInteg) {
      params = params.append('integration', workflowInteg);
    }
    if (tableUuid) {
      params = params.append('table_uuid', tableUuid);
    }
    return this.http.get<FieldsDataType>(GET_REPORT_FIELDS_BY_TYPE(), {
      params: params,
    });
  }

  /**
   * Builds form used by the current workflow.
   *
   * @param report - Report value used by this method.
   * @returns The constructed form, payload, or API observable.
   */
  buildForm(report: ReportFormData): FormGroup {
    let reportData = report?.report_meta;
    let filtersArray = this.createFiltersArray(reportData?.filters);
    // Fields are required for every report type handled by this reusable child.
    let form = this.builder.group({
      filter_match: [
        reportData?.filter_match || 'all',
        [Validators.required, NoWhitespaceValidator],
      ],
      filters: filtersArray,
      fields: [null, [Validators.required]],
    });

    if (
      reportData &&
      (report.feature === 'Cost Analysis' ||
        report.feature === 'sustainability')
    ) {
      form.addControl('period', this.getPeriodFormControls(reportData.period));
    }
    return form;
  }

  private createFiltersArray(filters?: any[]): FormArray {
    if (filters && filters.length > 0) {
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
            value: [filter.value, [Validators.required]],
          })
        )
      );
    } else {
      return this.builder.array([
        this.builder.group({
          attribute: ['', [Validators.required, NoWhitespaceValidator]],
          operator: ['', [Validators.required, NoWhitespaceValidator]],
          value: ['', [Validators.required]],
        }),
      ]);
    }
  }

  /**
   * Loads or returns period form controls for the current workflow.
   *
   * @param period - Period value used by this method.
   * @returns The requested API observable or computed data.
   */
  getPeriodFormControls(period: Period) {
    let period_type = period?.period_type ? period.period_type : 'last';
    let form = this.builder.group({
      period_type: [period_type, [Validators.required, NoWhitespaceValidator]],
    });
    if (period_type == 'current' || period_type == 'last') {
      form.addControl(
        'range',
        new FormControl(period?.range ? period.range : '', [
          Validators.required,
          NoWhitespaceValidator,
        ])
      );
      form.addControl(
        'counter',
        new FormControl(period?.counter ? period.counter : '', [
          Validators.required,
          NoWhitespaceValidator,
        ])
      );
    }
    if (period_type == 'custom') {
      form.addControl(
        'start_date',
        new FormControl(
          period?.start_date
            ? moment(period.start_date).format('YYYY-MM-DD')
            : '',
          [Validators.required, NoWhitespaceValidator]
        )
      );
      form.addControl(
        'end_date',
        new FormControl(
          period?.end_date ? moment(period.end_date).format('YYYY-MM-DD') : '',
          [Validators.required, NoWhitespaceValidator]
        )
      );
    }
    return form;
  }

  /**
   * Executes the format moment time workflow for Report Management Cloud Inventory Crud Service.
   *
   * @param obj - Obj value used by this method.
   * @returns The value produced by the workflow.
   */
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
      formattedObj.period.start_date = moment(obj.start_date).format(
        'YYYY-MM-DD'
      );
      formattedObj.period.end_date = moment(obj.end_date).format('YYYY-MM-DD');

      // Remove top-level period, start_date, and end_date keys
      delete formattedObj.schedule;
      delete formattedObj.start_date;
      delete formattedObj.end_date;
    }

    return formattedObj;
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
   * Loads or returns period errors for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getPeriodErrors() {
    return {
      period_type: '',
      counter: '',
      range: '',
      start_date: '',
      end_date: '',
    };
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
      period: this.getPeriodErrors(),
      fields: '',
    };
    return formErrors;
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
    period: {
      period_type: {
        required: 'Period type selection is required',
      },
      range: {
        required: 'Range selection is required',
      },
      counter: {
        required: 'Counter selection is required',
      },
      start_date: {
        required: 'Start Date selection is required',
      },
      end_date: {
        required: 'End Date selection is required',
      },
    },
    fields: {
      required: 'Field selection is required',
    },
  };

  /**
   * Converts fields into the view or API format expected by the workflow.
   *
   * @param fields - Fields value used by this method.
   * @returns The normalized data structure expected by the caller.
   */
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

  /**
   * Converts selected fields into the view or API format expected by the workflow.
   *
   * @param fields - Fields value used by this method.
   * @returns The normalized data structure expected by the caller.
   */
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

/**
 * Lists supported report types mapping values for Unity Reports.
 */
export enum ReportTypesMapping {
  CLOUDINVENTORY = 'Cloud Inventory',
  DCINVENTORY = 'DC Inventory',
  COSTANALYSIS = 'Cost Analysis',
  SUSTAINABILITY = 'sustainability',
  DEVOPSAUTOMATION = 'DevOps Automation',
  UNITYONEITSM = 'UnityOne ITSM',
}

const PublicCloudInventoryAttr = [
  {
    name: 'Resource Name',
    value: 'Resource Name',
    operators: opList3,
    value_type: 'input',
  },
  {
    name: 'Account Name',
    value: 'Account Name',
    operators: opList1,
    value_type: 'input',
  },
  {
    name: 'Region',
    value: 'Region',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Regions,
  },
  {
    name: 'Resource Type',
    value: 'Resource Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: [],
  },
  {
    name: 'Status',
    value: 'Status',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Status,
  },
  {
    name: 'Cloud Type',
    value: 'Cloud Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: PublicCloud,
  },
  // { name: "Services Name", value: "Services Name", operators: opList1, value_type: "multi-select-simple", options: [] },
  // { name: "Location", value: "Location", operators: opList1, value_type: "multi-select-simple", options: [] },
  // { name: "Host Name", value: "Host Name", operators: opList3, value_type: "input"},
  // { name: "First Discovered", value: "First Discovered", operators: opList2, value_type: "date" },
  // { name: "Last Discovered", value: "Last Discovered", operators: opList2, value_type: "date" },
];

const PrivateCloudInventoryAttr = [
  { name: 'Name', value: 'Name', operators: opList3, value_type: 'input' },
  { name: 'IP', value: 'IP', operators: opList3, value_type: 'input' },
  {
    name: 'Status',
    value: 'Status',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Status,
  },
  {
    name: 'First Discovered',
    value: 'First Discovered',
    operators: opList2,
    value_type: 'date',
  },
  {
    name: 'Last Discovered',
    value: 'Last Discovered',
    operators: opList2,
    value_type: 'date',
  },
  {
    name: 'Discovery Method',
    value: 'Discovery Method',
    operators: opList1,
    value_type: 'input',
  },
  {
    name: 'Device Type',
    value: 'Device Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Devices,
  },
  {
    name: 'Location',
    value: 'Location',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: [],
  },
];

const DcInventoryAttr = [
  { name: 'Name', value: 'Name', operators: opList3, value_type: 'input' },
  {
    name: 'Device Type',
    value: 'Device Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: OtherDevices,
  },
  { name: 'IP', value: 'IP', operators: opList1, value_type: 'input' },
  {
    name: 'Status',
    value: 'Status',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Status,
  },
  {
    name: 'Agent Installed',
    value: 'Agent Installed',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: AgentInstalled,
  },
  {
    name: 'Monitoring',
    value: 'Monitoring',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Monitoring,
  },
  {
    name: 'OS Name',
    value: 'OS Type',
    operators: opList3,
    value_type: 'input',
  },
  // { name: "OS Version", value: "OS Version", operators: opList3, value_type: "input"  },
  {
    name: 'Discovery Method',
    value: 'Discovery Method',
    operators: opList1,
    value_type: 'input',
  },
  { name: 'Tag', value: 'Tag', operators: opList3, value_type: 'input' },
  {
    name: 'First Discovered',
    value: 'First Discovered',
    operators: opList1,
    value_type: 'date',
  },
  {
    name: 'Last Discovered',
    value: 'Last Discovered',
    operators: opList1,
    value_type: 'date',
  },
  {
    name: 'Cabinet',
    value: 'Cabinet',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
  {
    name: 'Manufacturer',
    value: 'Manufacturer',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: [],
  },
  { name: 'Model', value: 'Model', operators: opList3, value_type: 'input' },
  {
    name: 'Datacenter',
    value: 'Datacenter',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
];

const CostAnalysisAttr = [
  {
    name: 'Datacenter',
    value: 'Datacenter',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
  {
    name: 'Cloud',
    value: 'Cloud',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: AllCloud,
  },
  {
    name: 'Region',
    value: 'Region',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Regions,
  },
  {
    name: 'Services',
    value: 'Services',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Services,
  },
  { name: 'Tag', value: 'Tag', operators: opList3, value_type: 'input' },
];

const SustainabilityAttr = [
  {
    name: 'Datacenter',
    value: 'Datacenter',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
  {
    name: 'Cloud',
    value: 'Cloud',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: AllCloud,
  },
  {
    name: 'Account Name',
    value: 'Account Name',
    operators: opList1,
    value_type: 'input',
  },
  { name: 'Tag', value: 'Tag', operators: opList3, value_type: 'input' },
  {
    name: 'Device Type',
    value: 'Device Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: Devices,
  },
  // { name: "Devices", value: "Devices", operators: opList3, value_type: "multi-select-simple", options: Devices },
  // { name: "Projects", value: "Projects", operators: opList1, value_type: "input"  }
  {
    name: 'Cabinet',
    value: 'Cabinet',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
];

const DevopsAutomationAttr = [
  {
    name: 'Script Type',
    value: 'Script Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: ScriptType,
  },
  {
    name: 'Target Type',
    value: 'Target Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: TargetType,
  },
  {
    name: 'Template Name',
    value: 'Template Name',
    operators: opList3,
    value_type: 'input',
  },
  {
    name: 'Category',
    value: 'Category',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: [],
  },
  {
    name: 'Start Time',
    value: 'Start Time',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'End Time',
    value: 'End Time',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'Duration',
    value: 'Duration',
    operators: opList2,
    value_type: 'input',
  },
  {
    name: 'Status',
    value: 'Status',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: StatusType,
  },
  {
    name: 'Executed By',
    value: 'Executed By',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
];

const DevopsAutomationWorkflowAttr = [
  {
    name: 'Target Type',
    value: 'Target Type',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: TargetType,
  },
  {
    name: 'Template Name',
    value: 'Template Name',
    operators: opList3,
    value_type: 'input',
  },
  {
    name: 'Category',
    value: 'Category',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: [],
  },
  {
    name: 'Start Time',
    value: 'Start Time',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'End Time',
    value: 'End Time',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'Duration',
    value: 'Duration',
    operators: opList2,
    value_type: 'input',
  },
  {
    name: 'Status',
    value: 'Status',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: StatusType,
  },
  {
    name: 'Executed By',
    value: 'Executed By',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
];

const DevopsAutomationWorkflowIntegAttr = [
  {
    name: 'Request ID',
    value: 'Request ID',
    operators: opList3,
    value_type: 'input',
  },
  {
    name: 'External Request ID',
    value: 'External Request ID',
    operators: opList3,
    value_type: 'input',
  },
  {
    name: 'Requested on',
    value: 'Requested on',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'Started on',
    value: 'Started on',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'Completed on',
    value: 'Completed on',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'Status',
    value: 'Status',
    operators: opList1,
    value_type: 'multi-select-simple',
    options: StatusType,
  },
];

const UnityOneITSMInventoryAttr = [
  { name: 'Uuid', value: 'uuid', operators: opList3, value_type: 'input' },
  {
    name: 'Ticket ID',
    value: 'ticket_id',
    operators: opList3,
    value_type: 'input',
  },
  {
    name: 'Created At',
    value: 'created_at',
    operators: opList4,
    value_type: 'date',
  },
  {
    name: 'Created By',
    value: 'created_by',
    operators: opList1,
    value_type: 'multi-select',
    options: [],
  },
];

/**
 * Describes the Attribute Data Type data contract used by Unity Reports.
 */
export interface AttributeDataType {
  /**
   * Describes the name value in the Attribute Data Type contract.
   */
  name: string;
  /**
   * Describes the value value in the Attribute Data Type contract.
   */
  value: string;
  /**
   * Describes the operators value in the Attribute Data Type contract.
   */
  operators: operatorsDataType[];
  /**
   * Describes the value type value in the Attribute Data Type contract.
   */
  value_type: string;
  /**
   * Describes the options value in the Attribute Data Type contract.
   */
  options?: any[];
  /**
   * Describes the field type value in the Attribute Data Type contract.
   */
  field_type?: string;
  /**
   * Describes the reference table value in the Attribute Data Type contract.
   */
  reference_table?: string;
}

/**
 * Describes the Operators Data Type data contract used by Unity Reports.
 */
interface operatorsDataType {
  /**
   * Describes the key value in the Operators Data Type contract.
   */
  key: string;
  /**
   * Describes the value value in the Operators Data Type contract.
   */
  value: string;
}

/**
 * Describes the Fields Data Type data contract used by Unity Reports.
 */
export interface FieldsDataType {
  /**
   * Describes the status value in the Fields Data Type contract.
   */
  status: boolean;
  /**
   * Describes the data value in the Fields Data Type contract.
   */
  data: DataType;
}
/**
 * Describes the Data Type data contract used by Unity Reports.
 */
export interface DataType extends DataListType {
  /**
   * Describes the public value in the Data Type contract.
   */
  Public: DataListType;
  /**
   * Describes the private value in the Data Type contract.
   */
  Private: DataListType;
}
/**
 * Describes the Data List Type data contract used by Unity Reports.
 */
export interface DataListType {
  // Default: any;
  // All: any;
  /**
   * Describes the unselected value in the Data List Type contract.
   */
  Unselected: any;
  /**
   * Describes the selected value in the Data List Type contract.
   */
  Selected: any;
}

/**
 * Describes the Fields Type data contract used by Unity Reports.
 */
export interface FieldsType {
  /**
   * Describes the key value in the Fields Type contract.
   */
  key: string;
  /**
   * Describes the value value in the Fields Type contract.
   */
  value: string;
  /**
   * Describes the checked value in the Fields Type contract.
   */
  checked: boolean;
}

/**
 * Represents normalized view data consumed by Unity Reports templates.
 */
export class FieldsViewData {
  constructor() {}
  /**
   * Stores the key value used by Fields View Data.
   */
  key: string;
  /**
   * Stores the value value used by Fields View Data.
   */
  value: string;
  /**
   * Stores the checked value used by Fields View Data.
   */
  checked: boolean;
}

/**
 * Describes the Manufactures Data data contract used by Unity Reports.
 */
interface ManufacturesData {
  /**
   * Describes the url value in the Manufactures Data contract.
   */
  url: string;
  /**
   * Describes the id value in the Manufactures Data contract.
   */
  id: number;
  /**
   * Describes the name value in the Manufactures Data contract.
   */
  name: string;
}
/**
 * Describes the Category Data data contract used by Unity Reports.
 */
interface CategoryData {
  /**
   * Describes the task value in the Category Data contract.
   */
  Task: CategoryItem[];
  /**
   * Describes the worklfow value in the Category Data contract.
   */
  Worklfow: CategoryItem[];
}

/**
 * Describes the Category Item data contract used by Unity Reports.
 */
interface CategoryItem {
  /**
   * Describes the category value in the Category Item contract.
   */
  category: string;
}
/**
 * Describes the Os Data Type data contract used by Unity Reports.
 */
export interface OsDataType {
  /**
   * Describes the url value in the Os Data Type contract.
   */
  url: string;
  /**
   * Describes the id value in the Os Data Type contract.
   */
  id: number;
  /**
   * Describes the name value in the Os Data Type contract.
   */
  name: string;
  /**
   * Describes the version value in the Os Data Type contract.
   */
  version: string;
  /**
   * Describes the full name value in the Os Data Type contract.
   */
  full_name: string;
  /**
   * Describes the platform type value in the Os Data Type contract.
   */
  platform_type: string;
}
