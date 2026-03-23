import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cloneDeep as _clone } from 'lodash-es';
import { AppLevelService } from 'src/app/app-level.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { OrchestrationWorkflowCrudUtilsService } from '../orchestration-workflow-crud/orchestration-workflow-crud.utils.service';
import { CategoriesData, CategoriesViewData, SourceTaskViewData, TaskViewData } from './orchestration-workflow-agentic-left-menu.type';
import { environment } from 'src/environments/environment';

@Injectable()
export class OrchestrationWorkflowAgenticLeftMenuService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient, private crudSvc: OrchestrationWorkflowCrudUtilsService,

    private appService: AppLevelService) { }


  getData(criteria: SearchCriteria): Observable<CategoriesData[]> {
    return this.tableService.getData<CategoriesData[]>('orchestration/tasks/by_category/', criteria);
  }

  getSourcetaskByCategory(): Observable<CategoriesData[]> {
    return this.http.get<CategoriesData[]>('/rest/orchestration/service_operation/sources/');
  }

  getActionsTask(): Observable<CategoriesData[]> {
    return this.http.get<CategoriesData[]>('/rest/orchestration/service_operation/actions/');
  }

  /*
    - This method is used to convert the category data to UI format.
  */
  convertToViewData(data: CategoriesData[]): CategoriesViewData[] {
    let categoryViewData: CategoriesViewData[] = [];
    data.forEach(cat => {
      let c = new CategoriesViewData();
      let taskViewData: TaskViewData[] = [];
      cat.tasks.forEach(task => {
        let t = new TaskViewData()
        t.name = task.name;
        t.image = this.crudSvc.getTaskTargetImage(task.playbook_type);
        t.uuid = task.uuid;
        t.type = task.playbook_type;
        t.nodeType = 'task';
        t.category = cat.category;
        taskViewData.push(t);
      });
      c.category = cat.category;
      c.tasks = _clone(taskViewData);
      categoryViewData.push(c);
    });
    return categoryViewData;
  }

  convertToSourceTaskViewData(data: CategoriesData[]): CategoriesViewData[] {
    let sourceCategoryViewData: CategoriesViewData[] = [];
    data.forEach(cat => {
      let c = new CategoriesViewData();
      let sourceTaskViewData: SourceTaskViewData[] = [];
      cat.tasks.forEach(task => {
        let t = new SourceTaskViewData()
        t.name = task.name;
        t.image = `${environment.assetsUrl}external-brand/workflow/Source.svg`;
        t.uuid = task.uuid;
        t.type = 'Source Task',
          t.nodeType = 'source task';
        t.category = cat.category,
          sourceTaskViewData.push(t);
      });
      c.category = cat.category;
      c.tasks = _clone(sourceTaskViewData);
      sourceCategoryViewData.push(c);
    });
    return sourceCategoryViewData;
  }

  convertToActionTaskViewData(data: CategoriesData[]): CategoriesViewData[] {
    let sourceCategoryViewData: CategoriesViewData[] = [];
    data.forEach(cat => {
      let c = new CategoriesViewData();
      let sourceTaskViewData: SourceTaskViewData[] = [];
      cat.tasks.forEach(task => {
        let t = new SourceTaskViewData()
        t.name = task.name;
        t.image = `${environment.assetsUrl}external-brand/workflow/actions_task.svg`;
        t.uuid = task.uuid;
        t.type = 'Action Task',
          t.nodeType = 'action task';
        t.category = cat.category,
          sourceTaskViewData.push(t);
      });
      c.category = cat.category;
      c.tasks = _clone(sourceTaskViewData);
      sourceCategoryViewData.push(c);
    });
    return sourceCategoryViewData;
  }
}
