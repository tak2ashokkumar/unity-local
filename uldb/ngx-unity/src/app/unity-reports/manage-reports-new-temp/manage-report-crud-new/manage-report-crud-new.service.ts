import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { GET_REPORT_BY_ID, MANAGE_CREATE_REPORT, UPDATE_REPORT_BY_ID } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';

@Injectable()
export class ManageReportCrudNewService {
  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private invalidAnnouncedSource = new Subject<string>();
  invalidAnnounced$ = this.invalidAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  private reportTypeSource = new Subject<string>();
  reportType$ = this.reportTypeSource.asObservable();

  private dynamicModelSource = new Subject<boolean>();
  dynamicModel$ = this.dynamicModelSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService) { }

  annouceSubmit() {
    // console.log('annouceSubmit')
    this.submitAnnouncedSource.next();
  }

  annouceInvalid() {
    this.invalidAnnouncedSource.next();
  }

  announceHandleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  setReportType(type: string) {
    this.reportTypeSource.next(type);
  }

  resetDynamicFiltersAndFields(reset: boolean) {
    this.dynamicModelSource.next(reset);
  }

  getReportById(uuid: string) {
    return this.http.get<ReportFormData>(GET_REPORT_BY_ID(uuid));
  }

  getWorkflowIntegration() {
    return this.http.get<any>(`/customer/workflow/integration/`)
  }

  getDynamicReportModules(): Observable<ReportModuleType[]> {
    return this.http.get<ReportModuleType[]>(`/customer/reporting/master/models/`)
  }

  buildForm(report: ReportFormData): FormGroup {
    let cloud = report?.report_meta?.cloud_type ? report.report_meta.cloud_type : null;
    let form = this.builder.group({
      'name': [report?.name ? report.name : '', [Validators.required, NoWhitespaceValidator]],
      'feature': [report?.feature ? report.feature : '', [Validators.required, NoWhitespaceValidator]],
      'visibility': [report?.visibility ? report.visibility : 'Private', [Validators.required, NoWhitespaceValidator]],
      'enable': [report ? report.enable : true, [Validators.required, NoWhitespaceValidator]],
      'report_meta': this.getCloudTypeControls(cloud),
    });
    if (report) {
      form.addControl('uuid', new FormControl(report.uuid));
      // form.addControl('default', new FormControl(report.default));
    }
    return form;
  }

  getCloudTypeControls(cloud: string) {
    if (cloud) {
      return this.builder.group({
        'cloud_type': [cloud, [Validators.required, NoWhitespaceValidator]]
      });
    }
    else {
      return this.builder.group({});
    }
  }

  getCloudTypeErrors() {
    return {
      'cloud_type': '',
      'sub_type': '',
      'duration_type': '',
      'hour': '',
      'min': '',
      'execution_type': '',
      'workflow_integration': '',
      'table': '',
      'module_name':'',
      'model_name':'',
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      name: '',
      feature: '',
      // module: '',
      // model: '',
      // cloud_type: '',
      visibility: '',
      enable: '',
      report_meta: this.getCloudTypeErrors()
    };
    return formErrors;
  }

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
        min: 'Invalid'
      },
      min: {
        required: 'Required',
        max: 'Invalid',
        min: 'Invalid'
      },
      execution_type: {
        required: 'Execution type is required'
      },
      workflow_integration: {
        required: 'Workflow integration is required'
      },
      table: {
        required: 'Table is required'
      },
      module_name: {
        required: 'Module is required',
      },
      model_name: {
        required: 'Model is required',
      },
    },
  };

  createReport(fd: ReportFormData) {
    return this.http.post<ReportFormData>(MANAGE_CREATE_REPORT(), fd);
  }

  updateReport(uuid: string, fd: ReportFormData) {
    return this.http.put<ReportFormData>(UPDATE_REPORT_BY_ID(uuid), fd);
  }

  getUnityOneITSMTable() {
    return this.http.get<any>(`/rest/unity_itsm/tables/`)
  }
}

export interface ReportFormData {
  uuid?: string;
  name: string;
  feature: string;
  // module_name: string;
  // model_name: string;
  // cloud_type: string;
  report_meta: CloudInventoryMetaData;
  visibility: string;
  enable: boolean;
  // select_fields: any;
  // query_meta: any;
}

export interface CloudInventoryMetaData {
  cloud_type: string;
  filter_match: string;
  filters: FiltersItem[];
  fields: any;
  hosts: any;
  visibility: string;
  enable: boolean;
  period: Period;
  duration_type: string;
  duration_values: ReportMetaDuration;
  sub_type: string;
  execution_type: string;
  workflow_integration: string;
  table: string;

  selected_fields: FieldsArrayItem[];
  filter_rule_meta: RuleSet;

  module_name: string;
  model_name: string;
  select_fields: any;
  query_meta: any;
}

export interface FiltersItem {
  attribute: string;
  operator: string;
  value: string | string[];
}

export interface FieldsArrayItem {
  name: string;
  show_as: string;
  summary_fn: string[];
  data_processing_fn: string[];
}

export interface Period {
  period_type: string;
  range: string;
  counter: string;
  start_date: string;
  end_date: string;
}

export interface ReportMetaDuration {
  hour?: number;
  min?: number;
  from_duration?: string;
  to_duration?: string;
}


// export interface DynamicReportDataType {
//     [key: string]: ReportModuleType;
// }

export interface ReportModuleType {
    models: ReportModelType[];
    module_name: string;
    module_display_name: string;
}

export interface ReportModelType {
    model_display_name: string;
    model_name: string;
}

export interface ModuleArrType{
    name: string;
    display_name: string;
}
