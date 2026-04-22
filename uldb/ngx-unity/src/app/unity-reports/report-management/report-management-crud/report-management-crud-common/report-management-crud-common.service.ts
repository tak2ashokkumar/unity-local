import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import {
  QueryBuilderConfig,
  Rule,
  RuleSet,
} from 'src/app/shared/query-builder/query-builder.interfaces';
import { ReportFormData } from '../report-management-crud.service';
import {
  ChoicesDataType,
  DynamicReportsFieldMeta,
} from './report-crud-common.type';
/**
 * Provides API access, form construction, and data mapping helpers for Report Management Crud Common.
 */
@Injectable()
export class ReportManagementCrudCommonService {
  constructor(private http: HttpClient, private builder: FormBuilder) { }

  // For query builder
  private valueToSQL(value) {
    switch (typeof value) {
      case 'string':
        return "'" + value + "'";
      case 'boolean':
        return value ? '1' : '0';
      case 'number':
        if (isFinite(value)) return value;
    }
  }

  private isDefined(value) {
    return value !== undefined;
  }

  /**
   * Executes the basic ruleset to sql workflow for Report Management Crud Common Service.
   *
   * @param ruleset - Ruleset value used by this method.
   * @returns The value produced by the workflow.
   */
  basicRulesetToSQL(ruleset: RuleSet) {
    if (!ruleset) {
      return '';
    }
    return ruleset.rules
      .map((rule) => {
        if ((rule as RuleSet).rules) {
          return `(${this.basicRulesetToSQL(rule as RuleSet)})`;
        }
        rule = rule as Rule;
        var column = rule.field,
          operator,
          value;

        switch (rule.operator) {
          case 'is null':
          case 'is not null':
            operator = rule.operator;
            value = '';
            break;
          case 'in':
          case 'not in':
            operator = rule.operator;
            if (Array.isArray(rule.value) && rule.value.length) {
              value = `(${rule.value
                .map(this.valueToSQL)
                .filter(this.isDefined)
                .join(', ')})`;
            }
            break;
          default:
            operator = rule.operator;
            value = this.valueToSQL(rule.value);
            break;
        }

        if (this.isDefined(column) && this.isDefined(operator)) {
          return `(${column} ${operator} ${value})`.trim();
        }
      })
      .filter(this.isDefined)
      .join(` ${ruleset.condition} `);
  }

  //for getting dynamic report filetrs meta data
  /**
   * Loads or returns dynamic report filter meta data for the current workflow.
   *
   * @param module - Module value used by this method.
   * @param model - Model value used by this method.
   * @returns The requested API observable or computed data.
   */
  getDynamicReportFilterMetaData(
    module: string,
    model: string
  ): Observable<DynamicReportsFieldMeta[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('module', module);
    params = params.append('model', model);
    params = params.append('query', true);
    return this.http.get<DynamicReportsFieldMeta[]>(
      `/customer/reporting/master/field_meta/`,
      { params: params }
    );
  }

  //for getting dynamic report fields meta data
  /**
   * Loads or returns dynamic report field meta data for the current workflow.
   *
   * @param module - Module value used by this method.
   * @param model - Model value used by this method.
   * @returns The requested API observable or computed data.
   */
  getDynamicReportFieldMetaData(
    module: string,
    model: string
  ): Observable<DynamicReportsFieldMeta[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('module', module);
    params = params.append('model', model);
    params = params.append('query', 'all');
    return this.http.get<DynamicReportsFieldMeta[]>(
      `/customer/reporting/master/field_meta/`,
      { params: params }
    );
  }

  /**
   * Loads or returns data processing function data for the current workflow.
   *
   * @param fieldName - Field Name value used by this method.
   * @returns The requested API observable or computed data.
   */
  getDataProcessingFunctionData(fieldName?: string): Observable<string[]> {
    let params: HttpParams = new HttpParams();
    if (fieldName) {
      params = params.append('field', fieldName);
    }
    return this.http.get<string[]>(
      `/customer/reporting/master/data_processing_functions/`,
      { params: params }
    );
  }

  // getDataSummaryFunctionData(fieldName?:string): Observable<string[]> {
  //   let params: HttpParams = new HttpParams();
  //   if(fieldName){
  //     params = params.append('field', fieldName);
  //   }
  //   return this.http.get<string[]>(`/customer/reporting/master/summary_processing_functions/`, { params: params })
  // }

  /**
   * Updates choices for the current workflow.
   *
   * @param data - Source data returned by the API or child form.
   * @returns The value produced by the workflow.
   */
  updateChoices(
    data: DynamicReportsFieldMeta[]
  ): Observable<DynamicReportsFieldMeta[]> {
    // ForeignKey fields need their choice labels before query-builder config can be created.
    const choiceRequests = data.map((field) => {
      if (field.type === 'ForeignKey') {
        return this.fetchChoices(field.url).pipe(
          map((res) => {
            let choices = res.map((r) => [r.id, r.name]);
            field.choices = choices?.length ? choices : [];
            return field;
          })
        );
      }
      return of(field);
    });
    return forkJoin(choiceRequests);
  }

  /**
   * Fetches additional choices data for the current workflow.
   *
   * @param url - Url value used by this method.
   * @returns The requested API observable or computed data.
   */
  fetchChoices(url: string): Observable<ChoicesDataType[]> {
    const param = new HttpParams().set('page_size', '0');
    return this.http.get<ChoicesDataType[]>(url, { params: param });
  }

  /**
   * Converts  into the view or API format expected by the workflow.
   *
   * @param data - Source data returned by the API or child form.
   * @returns The normalized data structure expected by the caller.
   */
  convert(data: DynamicReportsFieldMeta[]): QueryBuilderConfig {
    // Convert backend metadata into the format expected by shared query-builder.
    let fieldMeta: QueryBuilderConfig = { fields: {} };
    data.forEach((field) => {
      fieldMeta.fields[field.name] = {
        name: field.display_name,
        type: field.choices.length ? 'category' : 'string',
        // operators: field.choices.length ? ['is', 'in'] : ['is', 'contains'],
        operators: field.operators?.length ? field.operators : ['is', 'in'],
        defaultOperator: field.operators?.length ? field.operators[0] : 'is',
        options: field.choices.length
          ? field.choices.map((choice) => {
            return { name: choice[1], value: choice[0] };
            // return { name: choice.name, value: choice.uuid }
          })
          : [],
        defaultValue: field.choices.length ? field.choices[0][0] : '',
        // defaultValue: field.choices.length ? field.choices[0].uuid : '',
        value: field.name,
      };
    });
    return fieldMeta;
  }

  /**
   * Builds form used by the current workflow.
   *
   * @param report - Report value used by this method.
   * @returns The constructed form, payload, or API observable.
   */
  buildForm(report: ReportFormData): FormGroup {
    let reportData = report?.report_meta;
    let selectFieldsArray = this.createSelectFieldsArray(
      reportData?.select_fields
    );
    // Dynamic reports save both query rules and output field definitions.
    let form = this.builder.group({
      query_meta: reportData?.query_meta ? [reportData.query_meta] : [null],
      select_fields: selectFieldsArray,
    });

    return form;
  }

  /**
   * Creates select fields array for the current workflow.
   *
   * @param fields - Fields value used by this method.
   * @returns The constructed form, payload, or API observable.
   */
  createSelectFieldsArray(fields?: any[]): FormArray {
    if (fields && fields.length > 0) {
      return this.builder.array(
        fields.map((field) =>
          this.builder.group({
            name: [field.name, [Validators.required, NoWhitespaceValidator]],
            show_as: [
              field.show_as,
              [Validators.required, NoWhitespaceValidator],
            ],
            data_processing_fn: [field.data_processing_fn],
            summary_fn: [field.summary_fn],
          })
        )
      );
    } else {
      return this.builder.array([
        this.builder.group({
          name: ['', [Validators.required, NoWhitespaceValidator]],
          show_as: ['', [Validators.required, NoWhitespaceValidator]],
          data_processing_fn: [[]],
          summary_fn: [[]],
        }),
      ]);
    }
  }

  /**
   * Loads or returns select fields errors for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getSelectFieldsErrors() {
    return {
      name: '',
      show_as: '',
      data_processing_fn: '',
      summary_fn: '',
    };
  }

  /**
   * Resets form errors to its default state.
   *
   * @returns The value produced by the workflow.
   */
  resetFormErrors(): any {
    let formErrors = {
      select_fields: [this.getSelectFieldsErrors()],
      query_meta: '',
    };
    return formErrors;
  }

  /**
   * Defines validation message text used by form validation helpers.
   */
  validationMessages = {
    select_fields: {
      name: {
        required: 'Name is required',
      },
      show_as: {
        required: 'Show as value is required',
      },
      data_processing_fn: {
        required: 'Data processing funtion is required',
      },
      summary_fn: {
        required: 'summary function is required',
      },
    },
  };
}

// this needs to be moved to main parent comoponent
/**
 * Lists supported report types mapping values for Unity Reports.
 */
export enum ReportTypesMapping {
  CLOUDINVENTORY = 'Cloud Inventory',
  DCINVENTORY = 'DC Inventory',
  COSTANALYSIS = 'Cost Analysis',
  SUSTAINABILITY = 'sustainability',
  PERFORMANCE = 'Performance',
  DEVOPSAUTOMATION = 'DevOps Automation',
  UNITYONEITSM = 'UnityOne ITSM',
  DYNAMIC = 'Dynamic',
}
