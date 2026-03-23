import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ORCHESTRATION_EXECUTION_FULL_LIST, ORCHESTRATION_EXECUTION_LIST_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationExecutionsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }


  getListSummary() {
    return this.http.get(ORCHESTRATION_EXECUTION_LIST_SUMMARY());
  }

  getFullList(criteria: SearchCriteria): Observable<PaginatedResult<ResultsModel>> {
    return this.tableService.getData<PaginatedResult<ResultsModel>>(ORCHESTRATION_EXECUTION_FULL_LIST(), criteria);
  }

  convertToListSummaryViewData(data: SummaryResultsModel) {
    let totalArr: CountIconModel[] = [];
    let taskArr: CountIconModel[] = [];
    let workflowArr: CountIconModel[] = [];
    let categoriesArr: CategoriesViewModel[] = [];
    let categoriesStatusArr: CountIconModel[] = [];
    let remainingCategories: CategoriesViewModel[] = [];
    let finalListSummaryViewData;

    data.total.forEach(val => {
      let { icon, tooltipMessage } = this.getIcon(val.name);
      let row = { count: val.count, icon: icon, tooltipMessage: tooltipMessage };
      totalArr.push(row);
    });
    data.type.task.forEach(val => {
      let { icon, tooltipMessage } = this.getIcon(val.name);
      let row = { count: val.count, icon: icon, tooltipMessage: tooltipMessage };
      taskArr.push(row);
    });
    data.type.workflow.forEach(val => {
      let { icon, tooltipMessage } = this.getIcon(val.name);
      let row = { count: val.count, icon: icon, tooltipMessage: tooltipMessage };
      workflowArr.push(row);
    });
    data.categories.forEach(val => {
      categoriesStatusArr = [];
      val.status.forEach(stat => {
        let { icon, tooltipMessage } = this.getIcon(stat.name);
        let row = { count: stat.count, icon: icon, tooltipMessage: tooltipMessage };
        categoriesStatusArr.push(row);
      });
      let finalRow = { category: val.category, status: categoriesStatusArr };
      categoriesArr.push(finalRow);
    });

    if (categoriesArr.length > 4) {
      remainingCategories = [...categoriesArr.splice(3, categoriesArr.length - 1)];
    }

    finalListSummaryViewData = {
      total: totalArr,
      type: {
        task: taskArr,
        workflow: workflowArr
      },
      categories: categoriesArr,
      remainingCategories: remainingCategories
    };
    return finalListSummaryViewData;
  }

  getIcon(name) {
    let icon: string;
    let tooltipMessage: string;
    if (name === 'Success' || name === 'Completed') {
      icon = "fa-check-circle text-success";
      tooltipMessage = "Success";
    } else if (name === 'Failed') {
      icon = "fa-exclamation-circle text-danger";
      tooltipMessage = "Failed";
    } else {
      icon = "fas fa-spinner fa-spin fa-info-circle text-primary";
      tooltipMessage = "In Progress";
    }
    return { icon, tooltipMessage };
  }

  convertToTableViewData(data: ResultsModel[]): TableViewModel[] {
    let viewData: TableViewModel[] = [];
    data.forEach(val => {
      let tv: TableViewModel = new TableViewModel();
      tv.id = val.e_run_id;
      tv.templateName = val.e_name;
      tv.type = val.e_type;
      tv.category = val.e_category ? val.e_category : '';
      tv.startTime = val.e_start_time ? this.utilSvc.toUnityOneDateFormat(val.e_start_time) : 'NA';
      tv.startDate = val.e_start_time ? val.e_start_time.split('T')[0] : '';
      tv.createdBy = val.e_user;
      tv.duration = val.e_duration ? this.formatDuration(val.e_duration) : '';
      let { icon, tooltipMessage } = val.e_status ? this.getIcon(val.e_status) : { icon: '', tooltipMessage: '' };
      tv.statusIcon = icon;
      tv.tooltipMessage = tooltipMessage;
      tv.uuid = val.uuid;
      tv.is_advanced = val.e_is_advanced;
      tv.is_agentic = val.e_is_agentic;

      if (val.e_status == 'Success') {
        tv.tooltipMessage = "Success"
      } else if (val.e_status == 'Failed') {
        tv.tooltipMessage = "Failed"
      } else {
        tv.tooltipMessage = "In Progress"
      }
      viewData.push(tv);
    });
    return viewData;
  }

  formatDuration(dur: string) {
    let modifiedDuration;
    let initialDuration = dur?.split('.')[0];
    let initialDurArr = initialDuration?.split(':');
    if (initialDurArr[0] === '00' && initialDurArr[1] === '00') {
      modifiedDuration = `${initialDurArr[2]} secs`;
    } else if (initialDurArr[0] === '00' && (initialDurArr[1] !== '00' && initialDurArr[2] !== '00')) {
      modifiedDuration = `${initialDurArr[1]} min ${initialDurArr[2]} secs`;
    } else if (initialDurArr[0] !== '00' && (initialDurArr[1] === '00' && initialDurArr[2] === '00')) {
      modifiedDuration = `${initialDurArr[0]} hours`;
    } else if (initialDurArr[0] !== '00' && (initialDurArr[1] !== '00' && initialDurArr[2] === '00')) {
      modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins`;
    } else {
      modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins ${initialDurArr[2]} secs`;
    }
    return modifiedDuration;
  }
}

export interface ListSummaryViewModel {
  total: CountIconModel[];
  type: TypeViewModel;
  categories: CategoriesViewModel[];
  remainingCategories: CategoriesViewModel[];

}

export interface ListSummaryModel {
  results: SummaryResultsModel;
}

export interface SummaryResultsModel {
  total: CountNameModel[];
  type: TypeModel;
  categories: CategoriesModel[];
}

interface TypeModel {
  task: CountNameModel[];
  workflow: CountNameModel[];
}

interface CategoriesModel {
  category: string;
  status: CountNameModel[];
}

interface TypeViewModel {
  task: CountIconModel[];
  workflow: CountIconModel[];
}

interface CategoriesViewModel {
  category: string;
  status: CountIconModel[];
}

interface CountNameModel {
  count: number;
  name: string;
}

interface CountIconModel {
  count: number;
  icon: string;
}

export interface TableDataResponseModel {
  count: number;
  next: string;
  previous: string;
  results: ResultsModel[];
}

interface ResultsModel {
  uuid: string;
  e_name: string;
  e_type: string;
  e_start_time: string;
  e_duration: string;
  e_user: string;
  e_category?: string;
  e_run_id: string;
  e_status: string;
  e_created_by: string;
  e_is_advanced: boolean;
  e_is_agentic: boolean;
}

export class TableViewModel {
  templateName: string;
  type: string;
  startTime: string;
  startDate: string;
  duration: string;
  statusIcon: string;
  createdBy: string | number;
  category: string;
  id: string;
  tooltipMessage: string;
  uuid: string;
  is_advanced: boolean;
  is_agentic: boolean;
}