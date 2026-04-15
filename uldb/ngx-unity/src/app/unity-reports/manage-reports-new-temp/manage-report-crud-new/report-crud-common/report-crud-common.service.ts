import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ReportFormData } from 'src/app/unity-reports/manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.service';
import { map } from 'rxjs/operators';
import { QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { ChoicesDataType, DynamicReportsFieldMeta } from './report-crud-common.type';
@Injectable()
export class ReportCrudCommonService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

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

  basicRulesetToSQL(ruleset: RuleSet) {
    if (!ruleset) {
      return '';
    }
    return ruleset.rules.map((rule) => {
      if ((rule as RuleSet).rules) {
        return `(${this.basicRulesetToSQL(rule as RuleSet)})`;
      }
      rule = (rule as Rule);
      var column = rule.field,
        operator, value;

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
            value = `(${rule.value.map(this.valueToSQL).filter(this.isDefined).join(', ')})`;
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
    }).filter(this.isDefined).join(` ${ruleset.condition} `);
  }

  //for getting dynamic report filetrs meta data
  getDynamicReportFilterMetaData(module: string, model: string): Observable<DynamicReportsFieldMeta[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('module', module);
    params = params.append('model', model);
    params = params.append('query', true);
    return this.http.get<DynamicReportsFieldMeta[]>(`/customer/reporting/master/field_meta/`, { params: params });
  }

  //for getting dynamic report fields meta data
  getDynamicReportFieldMetaData(module: string, model: string): Observable<DynamicReportsFieldMeta[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('module', module);
    params = params.append('model', model);
    params = params.append('query', 'all');
    return this.http.get<DynamicReportsFieldMeta[]>(`/customer/reporting/master/field_meta/`, { params: params })
  }

  getDataProcessingFunctionData(fieldName?:string): Observable<string[]> {
    let params: HttpParams = new HttpParams();
    if(fieldName){
      params = params.append('field', fieldName);
    }
    return this.http.get<string[]>(`/customer/reporting/master/data_processing_functions/`, { params: params })
  }

  // getDataSummaryFunctionData(fieldName?:string): Observable<string[]> {
  //   let params: HttpParams = new HttpParams();
  //   if(fieldName){
  //     params = params.append('field', fieldName);
  //   }
  //   return this.http.get<string[]>(`/customer/reporting/master/summary_processing_functions/`, { params: params })
  // }

  updateChoices(data: DynamicReportsFieldMeta[]): Observable<DynamicReportsFieldMeta[]> {
    const choiceRequests = data.map(field => {
      if (field.type === 'ForeignKey') {
        return this.fetchChoices(field.url).pipe(
          map(res => {
            let choices = res.map(r => [r.uuid, r.name])
            field.choices = choices?.length ? choices : [];
            return field;
          })
        );
      }
      return of(field)
    });
    return forkJoin(choiceRequests);
  }

  fetchChoices(url: string): Observable<ChoicesDataType[]> {
    const param = new HttpParams().set('page_size', '0');
    return this.http.get<ChoicesDataType[]>(url, { params: param });
  }

  convert(data: DynamicReportsFieldMeta[]): QueryBuilderConfig {
    let fieldMeta: QueryBuilderConfig = { fields: {} }
    data.forEach(field => {
      fieldMeta.fields[field.name] = {
        name: field.display_name,
        type: field.choices.length ? 'category' : 'string',
        // operators: field.choices.length ? ['is', 'in'] : ['is', 'contains'],
        operators: field.operators?.length ? field.operators : ['is', 'in'],
        defaultOperator: field.operators?.length ? field.operators[0] : 'is',
        options: field.choices.length ? field.choices.map(choice => {
          return { name: choice[1], value: choice[0] }
          // return { name: choice.name, value: choice.uuid }
        }) : [],
        defaultValue: field.choices.length ? field.choices[0][0] : '',
        // defaultValue: field.choices.length ? field.choices[0].uuid : '',
        value: field.name
      }
    });
    return fieldMeta;
  }

  buildForm(report: ReportFormData): FormGroup {
    let reportData = report?.report_meta;
    let selectFieldsArray = this.createSelectFieldsArray(reportData?.select_fields);
    let form = this.builder.group({
      'query_meta': reportData?.query_meta ? [reportData.query_meta] : [null],
      'select_fields': selectFieldsArray,
    });

    return form;
  }

  createSelectFieldsArray(fields?: any[]): FormArray {
    if (fields && fields.length > 0) {
      return this.builder.array(
        fields.map(field => this.builder.group({
          'name': [field.name, [Validators.required, NoWhitespaceValidator]],
          'show_as': [field.show_as, [Validators.required, NoWhitespaceValidator]],
          'data_processing_fn': [field.data_processing_fn],
          'summary_fn': [field.summary_fn],
        }))
      );
    } else {
      return this.builder.array([
        this.builder.group({
          'name': ['', [Validators.required, NoWhitespaceValidator]],
          'show_as': ['', [Validators.required, NoWhitespaceValidator]],
          'data_processing_fn': [[]],
          'summary_fn': [[]],
        })
      ]);
    }
  }

  getSelectFieldsErrors() {
    return {
      'name': '',
      'show_as': '',
      'data_processing_fn': '',
      'summary_fn': ''
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'select_fields': [this.getSelectFieldsErrors()],
      'query_meta': ''
    };
    return formErrors;
  }

  validationMessages = {
    'select_fields': {
      'name': {
        'required': 'Name is required'
      },
      'show_as': {
        'required': 'Show as value is required'
      },
      'data_processing_fn': {
        'required': 'Data processing funtion is required'
      },
      'summary_fn': {
        'required': 'summary function is required'
      },
    },
  };

}


// this needs to be moved to main parent comoponent
export enum ReportTypesMapping {
  CLOUDINVENTORY = 'Cloud Inventory',
  DCINVENTORY = 'DC Inventory',
  COSTANALYSIS = 'Cost Analysis',
  SUSTAINABILITY = 'sustainability',
  PERFORMANCE = 'Performance',
  DEVOPSAUTOMATION = 'DevOps Automation',
  UNITYONEITSM = 'UnityOne ITSM',
  DYNAMIC = 'Dynamic'
}
