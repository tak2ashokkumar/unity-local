import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  GET_REPORT_BY_ID,
  MANAGE_CREATE_REPORT,
  UPDATE_REPORT_BY_ID,
} from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management Crud.
 */
@Injectable()
export class ReportManagementCrudService {
  // Component-scoped event bus: parent footer triggers submit/error handling in whichever child is active.
  private submitAnnouncedSource = new Subject<string>();
  /**
   * Exposes submit requests as an observable for child report forms.
   */
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private invalidAnnouncedSource = new Subject<string>();
  /**
   * Exposes child invalid-state notifications to the parent form.
   */
  invalidAnnounced$ = this.invalidAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  /**
   * Exposes child API errors to the parent component.
   */
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  private reportTypeSource = new Subject<string>();
  /**
   * Exposes report type changes to child report forms.
   */
  reportType$ = this.reportTypeSource.asObservable();

  private dynamicModelSource = new Subject<boolean>();
  /**
   * Exposes dynamic report model reset events to child forms.
   */
  dynamicModel$ = this.dynamicModelSource.asObservable();

  constructor(private http: HttpClient, private builder: FormBuilder) {}

  /**
   * Executes the annouce submit workflow for Report Management Crud Service.
   *
   * @returns Nothing.
   */
  annouceSubmit() {
    this.submitAnnouncedSource.next();
  }

  /**
   * Executes the annouce invalid workflow for Report Management Crud Service.
   *
   * @returns Nothing.
   */
  annouceInvalid() {
    this.invalidAnnouncedSource.next();
  }

  /**
   * Executes the announce handle error workflow for Report Management Crud Service.
   *
   * @param err - HTTP or validation error returned by the API.
   * @returns Nothing.
   */
  announceHandleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  /**
   * Executes the set report type workflow for Report Management Crud Service.
   *
   * @param type - Type value used by this method.
   * @returns Nothing.
   */
  setReportType(type: string) {
    this.reportTypeSource.next(type);
  }

  /**
   * Resets dynamic filters and fields to its default state.
   *
   * @param reset - Reset value used by this method.
   * @returns Nothing.
   */
  resetDynamicFiltersAndFields(reset: boolean) {
    this.dynamicModelSource.next(reset);
  }

  /**
   * Loads or returns report by id for the current workflow.
   *
   * @param uuid - Identifier used to target the uuid.
   * @returns The requested API observable or computed data.
   */
  getReportById(uuid: string) {
    return this.http.get<ReportFormData>(GET_REPORT_BY_ID(uuid));
  }

  /**
   * Loads or returns workflow integration for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getWorkflowIntegration() {
    return this.http.get<any>(`/customer/workflow/integration/`);
  }

  /**
   * Loads or returns dynamic report modules for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getDynamicReportModules(): Observable<ReportModuleType[]> {
    return this.http.get<ReportModuleType[]>(
      `/customer/reporting/master/models/`
    );
  }

  /**
   * Builds form used by the current workflow.
   *
   * @param report - Report value used by this method.
   * @returns The constructed form, payload, or API observable.
   */
  buildForm(report: ReportFormData): FormGroup {
    let cloud = report?.report_meta?.cloud_type
      ? report.report_meta.cloud_type
      : null;
    // Base form owns only common report fields; feature-specific controls are added by the component.
    let form = this.builder.group({
      name: [
        report?.name ? report.name : '',
        [Validators.required, NoWhitespaceValidator],
      ],
      feature: [
        report?.feature ? report.feature : '',
        [Validators.required, NoWhitespaceValidator],
      ],
      visibility: [
        report?.visibility ? report.visibility : 'Private',
        [Validators.required, NoWhitespaceValidator],
      ],
      enable: [
        report ? report.enable : true,
        [Validators.required, NoWhitespaceValidator],
      ],
      report_meta: this.getCloudTypeControls(cloud),
    });
    if (report) {
      form.addControl('uuid', new FormControl(report.uuid));
      // form.addControl('default', new FormControl(report.default));
    }
    return form;
  }

  /**
   * Loads or returns cloud type controls for the current workflow.
   *
   * @param _cloud - Cloud value used by this method.
   * @returns The requested API observable or computed data.
   */
  getCloudTypeControls(cloud: string) {
    // Cloud Inventory edit data is the only report_meta value needed before feature-specific controls are configured.
    if (cloud) {
      return this.builder.group({
        cloud_type: [cloud, [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({});
    }
  }

  /**
   * Loads or returns cloud type errors for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getCloudTypeErrors() {
    return {
      cloud_type: '',
      sub_type: '',
      duration_type: '',
      hour: '',
      min: '',
      execution_type: '',
      workflow_integration: '',
      table: '',
      module_name: '',
      model_name: '',
    };
  }

  /**
   * Resets form errors to its default state.
   *
   * @returns The value produced by the workflow.
   */
  resetFormErrors(): any {
    let formErrors = {
      name: '',
      feature: '',
      // module: '',
      // model: '',
      // cloud_type: '',
      visibility: '',
      enable: '',
      report_meta: this.getCloudTypeErrors(),
    };
    return formErrors;
  }

  /**
   * Defines validation message text used by form validation helpers.
   */
  validationMessages = {
    name: {
      required: 'Report name is required',
    },
    feature: {
      required: 'Report type is required',
    },
    // module: {
    //   required: 'Module is required',
    // },
    // model: {
    //   required: 'Model is required',
    // },
    // cloud_type: {
    //   required: 'Cloud Type is required',
    // },
    visibility: {
      required: 'Visibility selection is required',
    },
    enable: {
      required: 'Status selection is required',
    },
    report_meta: {
      cloud_type: {
        required: 'Cloud Type is required',
      },
      sub_type: {
        required: 'Sub type is required',
      },
      duration_type: {
        required: 'Duration type is required',
      },
      hour: {
        required: 'Required',
        max: 'Invalid',
        min: 'Invalid',
      },
      min: {
        required: 'Required',
        max: 'Invalid',
        min: 'Invalid',
      },
      execution_type: {
        required: 'Execution type is required',
      },
      workflow_integration: {
        required: 'Workflow integration is required',
      },
      table: {
        required: 'Table is required',
      },
      module_name: {
        required: 'Module is required',
      },
      model_name: {
        required: 'Model is required',
      },
    },
  };

  /**
   * Creates report for the current workflow.
   *
   * @param fd - Raw form data to normalize before API submission.
   * @returns The constructed form, payload, or API observable.
   */
  createReport(fd: ReportFormData) {
    return this.http.post<ReportFormData>(MANAGE_CREATE_REPORT(), fd);
  }

  /**
   * Updates report for the current workflow.
   *
   * @param uuid - Identifier used to target the uuid.
   * @param fd - Raw form data to normalize before API submission.
   * @returns The value produced by the workflow.
   */
  updateReport(uuid: string, fd: ReportFormData) {
    return this.http.put<ReportFormData>(UPDATE_REPORT_BY_ID(uuid), fd);
  }

  /**
   * Loads or returns unity one itsmtable for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getUnityOneITSMTable() {
    return this.http.get<any>(`/rest/unity_itsm/tables/`);
  }
}

/**
 * Describes the Report Form Data data contract used by Unity Reports.
 */
export interface ReportFormData {
  /**
   * Describes the uuid value in the Report Form Data contract.
   */
  uuid?: string;
  /**
   * Describes the name value in the Report Form Data contract.
   */
  name: string;
  /**
   * Describes the feature value in the Report Form Data contract.
   */
  feature: string;
  // module_name: string;
  // model_name: string;
  // cloud_type: string;
  /**
   * Describes the report meta value in the Report Form Data contract.
   */
  report_meta: CloudInventoryMetaData;
  /**
   * Describes the visibility value in the Report Form Data contract.
   */
  visibility: string;
  /**
   * Describes the enable value in the Report Form Data contract.
   */
  enable: boolean;
  // select_fields: any;
  // query_meta: any;
}

/**
 * Describes the Cloud Inventory Meta Data data contract used by Unity Reports.
 */
export interface CloudInventoryMetaData {
  /**
   * Describes the cloud type value in the Cloud Inventory Meta Data contract.
   */
  cloud_type: string;
  /**
   * Describes the filter match value in the Cloud Inventory Meta Data contract.
   */
  filter_match: string;
  /**
   * Describes the filters value in the Cloud Inventory Meta Data contract.
   */
  filters: FiltersItem[];
  /**
   * Describes the fields value in the Cloud Inventory Meta Data contract.
   */
  fields: any;
  /**
   * Describes the hosts value in the Cloud Inventory Meta Data contract.
   */
  hosts: any;
  /**
   * Describes the visibility value in the Cloud Inventory Meta Data contract.
   */
  visibility: string;
  /**
   * Describes the enable value in the Cloud Inventory Meta Data contract.
   */
  enable: boolean;
  /**
   * Describes the period value in the Cloud Inventory Meta Data contract.
   */
  period: Period;
  /**
   * Describes the duration type value in the Cloud Inventory Meta Data contract.
   */
  duration_type: string;
  /**
   * Describes the duration values value in the Cloud Inventory Meta Data contract.
   */
  duration_values: ReportMetaDuration;
  /**
   * Describes the sub type value in the Cloud Inventory Meta Data contract.
   */
  sub_type: string;
  /**
   * Describes the execution type value in the Cloud Inventory Meta Data contract.
   */
  execution_type: string;
  /**
   * Describes the workflow integration value in the Cloud Inventory Meta Data contract.
   */
  workflow_integration: string;
  /**
   * Describes the table value in the Cloud Inventory Meta Data contract.
   */
  table: string;

  /**
   * Describes the selected fields value in the Cloud Inventory Meta Data contract.
   */
  selected_fields: FieldsArrayItem[];
  /**
   * Describes the filter rule meta value in the Cloud Inventory Meta Data contract.
   */
  filter_rule_meta: RuleSet;

  /**
   * Describes the module name value in the Cloud Inventory Meta Data contract.
   */
  module_name: string;
  /**
   * Describes the model name value in the Cloud Inventory Meta Data contract.
   */
  model_name: string;
  /**
   * Describes the select fields value in the Cloud Inventory Meta Data contract.
   */
  select_fields: any;
  /**
   * Describes the query meta value in the Cloud Inventory Meta Data contract.
   */
  query_meta: any;
}

/**
 * Describes the Filters Item data contract used by Unity Reports.
 */
export interface FiltersItem {
  /**
   * Describes the attribute value in the Filters Item contract.
   */
  attribute: string;
  /**
   * Describes the operator value in the Filters Item contract.
   */
  operator: string;
  /**
   * Describes the value value in the Filters Item contract.
   */
  value: string | string[];
}

/**
 * Describes the Fields Array Item data contract used by Unity Reports.
 */
export interface FieldsArrayItem {
  /**
   * Describes the name value in the Fields Array Item contract.
   */
  name: string;
  /**
   * Describes the show as value in the Fields Array Item contract.
   */
  show_as: string;
  /**
   * Describes the summary fn value in the Fields Array Item contract.
   */
  summary_fn: string[];
  /**
   * Describes the data processing fn value in the Fields Array Item contract.
   */
  data_processing_fn: string[];
}

/**
 * Describes the Period data contract used by Unity Reports.
 */
export interface Period {
  /**
   * Describes the period type value in the Period contract.
   */
  period_type: string;
  /**
   * Describes the range value in the Period contract.
   */
  range: string;
  /**
   * Describes the counter value in the Period contract.
   */
  counter: string;
  /**
   * Describes the start date value in the Period contract.
   */
  start_date: string;
  /**
   * Describes the end date value in the Period contract.
   */
  end_date: string;
}

/**
 * Describes the Report Meta Duration data contract used by Unity Reports.
 */
export interface ReportMetaDuration {
  /**
   * Describes the hour value in the Report Meta Duration contract.
   */
  hour?: number;
  /**
   * Describes the min value in the Report Meta Duration contract.
   */
  min?: number;
  /**
   * Describes the from duration value in the Report Meta Duration contract.
   */
  from_duration?: string;
  /**
   * Describes the to duration value in the Report Meta Duration contract.
   */
  to_duration?: string;
}

// export interface DynamicReportDataType {
//     [key: string]: ReportModuleType;
// }

/**
 * Describes the Report Module Type data contract used by Unity Reports.
 */
export interface ReportModuleType {
  /**
   * Describes the models value in the Report Module Type contract.
   */
  models: ReportModelType[];
  /**
   * Describes the module name value in the Report Module Type contract.
   */
  module_name: string;
  /**
   * Describes the module display name value in the Report Module Type contract.
   */
  module_display_name: string;
}

/**
 * Describes the Report Model Type data contract used by Unity Reports.
 */
export interface ReportModelType {
  /**
   * Describes the model display name value in the Report Model Type contract.
   */
  model_display_name: string;
  /**
   * Describes the model name value in the Report Model Type contract.
   */
  model_name: string;
}

/**
 * Describes the Module Arr Type data contract used by Unity Reports.
 */
export interface ModuleArrType {
  /**
   * Describes the name value in the Module Arr Type contract.
   */
  name: string;
  /**
   * Describes the display name value in the Module Arr Type contract.
   */
  display_name: string;
}
