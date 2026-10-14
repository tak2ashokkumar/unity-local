import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { from, Subject } from 'rxjs';
import { Categories, HistoryViewData, ListSummaryViewModel, OrchestrationWorkflowsService, WorkflowViewData } from './orchestration-workflows.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ListSummaryResModel, RelatedServiceCatalog, UnityWorkflow } from './orchestration-workflows.type';
import { CeleryTask, EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { OrchestrationWorkflowCrudComponent } from './orchestration-workflow-crud/orchestration-workflow-crud.component';
import { OrchestrationWorkflowCrudService } from './orchestration-workflow-crud/orchestration-workflow-crud.service';
import { cloneDeep as _clone } from 'lodash-es';
import { AppMainService } from 'src/app/app-main/app-main.service';
import { UnityChatbotService } from 'src/app/unity-chatbot/unity-chatbot.service';
import { environment } from 'src/environments/environment';
import { FilterConfig, HeaderAction, SelectedFilters, SortDirection, SortEvent, StatusToggleEvent, TableColumn } from 'src/app/shared/app-generic-table/app-generic-table.type';

@Component({
  selector: 'orchestration-workflows',
  templateUrl: './orchestration-workflows.component.html',
  styleUrls: ['./orchestration-workflows.component.scss'],
  providers: [OrchestrationWorkflowCrudService]
})
export class OrchestrationWorkflowsComponent implements OnInit, OnDestroy {

  headerActions: HeaderAction[] = [
    { id: 'workflow', label: 'Workflow', icon: 'fas fa-plus', btnClass: 'ct-btn-primary' }
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', widthClass: 'tdw-25', sortable: true, sortField: 'name', locked: true },
    { key: 'categoryName', label: 'Category', widthClass: 'tdw-15', sortable: true, sortField: 'category' },
    { key: 'trigger_type', label: 'Trigger Type', widthClass: 'tdw-15', sortable: true, sortField: 'trigger_type' },
    { key: 'totalTask', label: 'Total Tasks', widthClass: 'tdw-10' },
    { key: 'createdAt', label: 'Created On', widthClass: 'tdw-20' },
    {
      key: 'workflowStatus', label: 'Status', align: 'center', cellClass: 'status-toggle-column',
      statusToggle: {
        activeValue: 'Enabled',
        inactiveValue: 'Disabled',
        activeLabel: 'Enable',
        inactiveLabel: 'Disable',
        disabledField: 'taskId'
      }
    },
    { key: 'actions', label: 'Actions', align: 'center', locked: true, cellClass: 'action-icons-column' }
  ];

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;

  summaryViewData: ListSummaryViewModel;
  viewData: WorkflowViewData[] = [];
  workflowUuid: string;
  taskModalRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  workflowDeleteModalRef: BsModalRef;
  relatedServiceCatalogs: RelatedServiceCatalog[] = [];
  @ViewChild('history') history: ElementRef;
  viewHistoryData: HistoryViewData[] = [];
  @ViewChild('procsessworkflow') procsessworkflow: ElementRef;
  processWorkflowModalRef: BsModalRef;
  popOverList: Categories[] = [];
  workflowsInProgress: EntityTaskRelation[] = [];
  jsonParseError: string;
  editProcessWorkflowId: string;
  jsonValue: UnityWorkflow;
  finalJson: string;
  resetJsonValue: string;
  is_agentic = false;
  isAgentic = false;
  isDropdownOpen = false;
  @ViewChild('dropdown', { static: false }) dropdown!: ElementRef;
  agenticIcon = `${environment.assetsUrl}external-brand/workflow/AIAgent.svg`;
  workflowIcon = `${environment.assetsUrl}external-brand/workflow/Non-agentic-black.svg`;
  globalReadOnlyUser = false;
  activeSortField: string | null = null;
  activeSortDirection: SortDirection = null;

  constructor(private svc: OrchestrationWorkflowsService,
    private crudSvc: OrchestrationWorkflowCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storage: StorageService,
    private modalService: BsModalService,
    private appService: AppMainService,
    private chatbotSvc: UnityChatbotService
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ category: null, workflow_status: null }] };
  }

  get filterConfig(): FilterConfig[] {
    const filters: FilterConfig[] = [
      {
        key: 'workflow_status', label: 'Status', options: [
          { label: 'Enabled', value: 'Enabled' },
          { label: 'Disabled', value: 'Disabled' }
        ]
      }
    ];
    // if (this.viewData.length && !this.isAgentic) {
    //   filters.unshift({
    //     key: 'category', label: 'Category', options: [
    //       { label: 'Provisioning', value: 'Provisioning' },
    //       { label: 'Integration', value: 'Integration' }
    //     ]
    //   });
    // }
    return filters;
  }

  get selectedFiltersForTable(): SelectedFilters {
    const result: SelectedFilters = {};
    const params = this.currentCriteria.params[0];
    if (params.category) result['category'] = String(params.category).split(',');
    if (params.workflow_status) result['workflow_status'] = String(params.workflow_status).split(',');
    return result;
  }

  ngOnInit(): void {
    this.spinner.start('main');
    document.addEventListener('click', (event) => this.closeDropdown(event));
    this.workflowsInProgress = this.storage.getByKey('workflowsInProgress', StorageType.SESSIONSTORAGE);
    const roles = this.storage.getByKey('user', StorageType.SESSIONSTORAGE)?.active_rbac_roles;
    this.globalReadOnlyUser = !!roles?.length && roles.every(r => r === 'Global Read-Only');
    this.headerActions = [
      { id: 'workflow', label: this.globalReadOnlyUser ? 'Try Agentic Workflow' : 'Workflow', icon: 'fas fa-plus', btnClass: 'ct-btn-primary' }
    ];

    this.restoreCriteria();

    this.jsonValue = {
      "workflow_name": "",
      "description": "",
      "category": "Integration",
      "target_type": "",
      "cloud": "",
      "tasks": [{
        "name": "Start",
        "name_id": "start",
        "type": "Start Task",
        "category": null,
        "target_type": null,
        "task": null,
        "inputs": [],
        "outputs": [],
        "config": [],
        "dependencies": [],
        "timeout": null,
        "retries": 0
      }, {
        "name": "End",
        "name_id": "end",
        "type": "End Task",
        "category": null,
        "target_type": null,
        "task": null,
        "inputs": [],
        "outputs": [],
        "config": [],
        "dependencies": ["start"],
        "timeout": null,
        "retries": 0
      }]
    };
    this.finalJson = JSON.stringify(this.jsonValue, null, 2);
    if (!this.workflowsInProgress) {
      this.workflowsInProgress = [];
    }
    this.resetJsonValue = this.finalJson;
    this.getSummary();
    this.getWorkflowList();
  }

  private restoreCriteria(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.applyQueryParamsToCriteria(qp);
  }

  private applyQueryParamsToCriteria(qp: ParamMap): void {
    this.currentCriteria.params[0].category = qp.get('category') || null;
    this.currentCriteria.params[0].workflow_status = qp.get('workflow_status') || null;
    this.currentCriteria.searchValue = qp.get('search') || '';

    this.currentCriteria.sortColumn = qp.get('sortColumn') || '';
    this.currentCriteria.sortDirection = (qp.get('sortDirection') as '' | 'asc' | 'desc') || '';
    this.activeSortField = this.currentCriteria.sortColumn || null;
    this.activeSortDirection = (this.currentCriteria.sortDirection || null) as SortDirection;

    const pageNo = qp.get('pageNo');
    const pageSize = qp.get('pageSize');
    this.currentCriteria.pageNo = pageNo ? +pageNo : 1;
    this.currentCriteria.pageSize = pageSize ? +pageSize : PAGE_SIZES.DEFAULT_PAGE_SIZE;
  }

  private syncCriteriaToQueryParams(): void {
    const params = this.currentCriteria.params[0];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: params.category || null,
        workflow_status: params.workflow_status || null,
        search: this.currentCriteria.searchValue || null,
        sortColumn: this.currentCriteria.sortColumn || null,
        sortDirection: this.currentCriteria.sortDirection || null,
        pageNo: this.currentCriteria.pageNo !== 1 ? this.currentCriteria.pageNo : null,
        pageSize: this.currentCriteria.pageSize !== PAGE_SIZES.DEFAULT_PAGE_SIZE ? this.currentCriteria.pageSize : null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onHeaderAction(id: string) {
    if (id === 'workflow') {
      this.openDynamicAgentic();
    }
  }

  onStatusToggle(event: StatusToggleEvent) {
    this.toggleStatus(event.index, event.value);
  }

  ngOnDestroy(): void {
    this.processWorkflowModalRef?.hide();
    this.taskModalRef?.hide();
    this.workflowDeleteModalRef?.hide();
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFiltersApplied(filters: SelectedFilters) {
    this.currentCriteria.params[0].category = filters['category']?.length ? filters['category'].join(',') : null;
    this.currentCriteria.params[0].workflow_status = filters['workflow_status']?.length ? filters['workflow_status'].join(',') : null;
    this.currentCriteria.pageNo = 1;
    this.onFilterChange();
  }

  refreshData() {
    this.spinner.start('main');
    this.getWorkflowList();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getWorkflowList();
  }

  onSortChanged(event: SortEvent) {
    this.spinner.start('main');
    this.activeSortField = event.direction ? event.field : null;
    this.activeSortDirection = event.direction;
    this.currentCriteria.sortColumn = event.direction ? event.field : '';
    this.currentCriteria.sortDirection = event.direction || '';
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getWorkflowList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getWorkflowList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.syncCriteriaToQueryParams();
    this.getWorkflowList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getWorkflowList();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.syncCriteriaToQueryParams();
    this.getWorkflowList();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(event: Event) {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  getSummary() {
    this.svc.getSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: ListSummaryResModel) => {
      this.summaryViewData = this.svc.convertToSummaryViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Workflow Summary'));
      this.spinner.stop('main');
    });
  }

  getWorkflowList() {
    this.svc.getWorkflowList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.isAgentic = this.viewData.some(v => v.is_agentic);
      if (this.workflowsInProgress.length) {
        this.viewData.forEach(vd => {
          let workflowTaskInProgress = this.workflowsInProgress.find(wip => wip.entityId ? (wip.entityId == vd.uuid) : (wip.entityName == vd.name));
          if (workflowTaskInProgress) {
            vd.taskId = workflowTaskInProgress.taskId;
          }
        })
        this.viewData.forEach(vd => {
          if (vd.taskId) {
            this.pollToSaveWorkflow(vd.taskId);
          }
        })
      } else {
        this.storage.removeByKey('workflowsInProgress', StorageType.SESSIONSTORAGE);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  pollToSaveWorkflow(taskId: string) {
    this.svc.pollByTaskId(taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let workflowTaskIndex = this.workflowsInProgress.findIndex(wp => wp.taskId == taskId);
      if (workflowTaskIndex != -1) {
        this.workflowsInProgress.splice(workflowTaskIndex, 1);
      }

      let workflowTaskIndexByViewData = this.viewData.findIndex(vd => vd.taskId == taskId);
      if (workflowTaskIndexByViewData === -1) {
        this.viewData[workflowTaskIndexByViewData].taskId = null;
      }

      if (this.workflowsInProgress.length) {
        this.storage.put('workflowsInProgress', this.workflowsInProgress, StorageType.SESSIONSTORAGE);
      } else {
        this.storage.removeByKey('workflowsInProgress', StorageType.SESSIONSTORAGE);
      }
      this.notification.success(new Notification('Workflow saved.'));
      this.svc.getWorkflowList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewData(data.results);
      });
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  addWorkflow() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  newWorkflow() {
    this.router.navigate(['new-workflow'], { relativeTo: this.route });
  }

  openAgentic() {
    if (!this.globalReadOnlyUser) {
      this.router.navigate(['agentic-workflow'], { relativeTo: this.route })
    } else {
      this.router.navigate(['agentic-workflow', 'view'], { relativeTo: this.route });
    }
  }

  openDynamicAgentic() {
    this.router.navigate(['dynamic-workflow'], { relativeTo: this.route, state: { workflowReturnUrl: this.router.url } })
  }

  toggleStatus(index: number, status: boolean) {
    if (status === true) {
      this.viewData[index]['workflowStatus'] = 'Enabled';
    } else {
      this.viewData[index]['workflowStatus'] = 'Disabled';
    }
    this.svc.toggleStatus(this.viewData[index].uuid, this.viewData[index].is_agentic).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getSummary();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      if (status === true) {
        this.viewData[index]['workflowStatus'] = 'Disabled';
      } else {
        this.viewData[index]['workflowStatus'] = 'Enabled';
      }
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to change workflow status'));
    });
  }

  executeWorkflow(view: WorkflowViewData) {
    if (view.is_agentic && view.trigger_type === "Chat Trigger") {
      this.chatbotSvc.onChatTrigger$.next(true);
      this.appService.$assistantData.next({ sourceName: 'workflow', apiUrl: `/api/orchestration/v1/dynamic_workflows/${view.uuid}/execute/`, entityId: view.uuid, entity: view.name });
    } else if (view.is_agentic) {
      this.router.navigate([view.uuid, 'trigger-execute', view.trigger_type], { relativeTo: this.route });
    }
    else {
      this.router.navigate([view.uuid, 'execute'], { relativeTo: this.route });
    }
  }

  editWorkflow(task: WorkflowViewData) {
    if (task.categoryName == "Integration") {
      this.editProcessWorkflowId = task.uuid;
      this.processWorkflowModalRef = this.modalService.show(this.procsessworkflow, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
      this.crudSvc.getWorkflowDetails(task.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.finalJson = JSON.stringify(res, null, 2);
      });
    } else if (task.isAdvanced) {
      this.router.navigate(['new-workflow', task.uuid, 'edit'], { relativeTo: this.route });
    } else if (task.is_agentic) {
      this.router.navigate(['dynamic-workflow', task.uuid, 'edit'], { relativeTo: this.route, state: { workflowReturnUrl: this.router.url } });
    } else {
      this.router.navigate([task.uuid, 'edit'], { relativeTo: this.route });
    }
  }

  goToviewDetails(task: WorkflowViewData) {
    this.router.navigate([
      task.is_agentic ? 'dynamic-workflow' : 'agentic-workflow', task.uuid, 'view'
    ], { relativeTo: this.route, state: { workflowReturnUrl: this.router.url } });
  }

  scheduleWorkflow(view: WorkflowViewData) {
    this.router.navigate([view.uuid, view.trigger_type, 'scheduleWorkflow'], { relativeTo: this.route });
  }

  getHistoryData(uuid: string, is_agentic: boolean) {
    this.svc.getHistoryData(uuid, is_agentic).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewHistoryData = this.svc.convertToHistoryViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get History'));
    });
  }

  viewHistory(uuid: string, is_agentic: boolean) {
    this.getHistoryData(uuid, is_agentic);
    this.taskModalRef = this.modalService.show(this.history, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteWorkflow(UUID: string, is_agentic: boolean) {
    this.workflowUuid = UUID;
    this.is_agentic = is_agentic;
    this.relatedServiceCatalogs = [];
    this.spinner.start('main');
    this.svc.getRelatedServiceCatalogs(UUID, is_agentic).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.relatedServiceCatalogs = Array.isArray(data) ? data : [];
      this.spinner.stop('main');
      this.workflowDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to check linked service catalogs. Please try again.'));
    });
  }

  confirmDelete() {
    this.workflowDeleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteWorkflow(this.workflowUuid, this.is_agentic).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSummary();
      this.getWorkflowList();
      this.spinner.stop('main');
      this.notification.success(new Notification('Workflow deleted successfully.'));
    }, err => {
      this.notification.error(new Notification(' Workflow has more than one reference. So it can not be deleted!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  addProcessWorkflow() {
    this.finalJson = this.resetJsonValue;
    this.editProcessWorkflowId = "";
    this.processWorkflowModalRef = this.modalService.show(this.procsessworkflow, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmProcessWorkflowCreate() {
    this.spinner.start('main');
    try {
      const parsedJson = JSON.parse(this.finalJson);
      this.jsonParseError = '';
      if (this.editProcessWorkflowId) {
        this.svc.updateProcessWorkflow(this.editProcessWorkflowId, parsedJson).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: CeleryTask) => {
          this.spinner.stop('main')
          this.processWorkflowModalRef.hide();
          this.manageCeleryTaskData(this.editProcessWorkflowId, parsedJson.workflow_name, res.task_id);
          this.getWorkflowList();
        }, err => {
          this.notification.error(new Notification(`Couldn't create Process Workflow.Please Try again later.`));
          this.spinner.stop('main');
        });
      } else {
        this.svc.postProcessWorkflow(parsedJson).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: CeleryTask) => {
          this.spinner.stop('main')
          this.processWorkflowModalRef.hide();
          this.manageCeleryTaskData("", parsedJson.workflow_name, res.task_id);
          this.getWorkflowList();
        }, (err) => {
          this.spinner.stop('main')
          this.jsonParseError = 'Invalid JSON: ' + JSON.stringify(err.error);
        });
      }
    } catch (error) {
      this.spinner.stop('main')
      this.jsonParseError = 'Invalid JSON: ' + (error as Error).message;
    }
  }

  manageCeleryTaskData(workFlowId: string, workFlowName: string, taskId: string) {
    let workFlowInProgress = this.crudSvc.convertToEntityTaskRelation('', workFlowName, taskId);
    if (workFlowInProgress) {
      let workflowTaskIndex = this.workflowsInProgress.findIndex(wp => wp.taskId == workFlowInProgress.taskId);
      if (workflowTaskIndex == -1) {
        this.workflowsInProgress.push(workFlowInProgress);
      }
      this.storage.put('workflowsInProgress', _clone(this.workflowsInProgress), StorageType.SESSIONSTORAGE);
    }
  }

  getStatusClass(item: { name: string }): string {
    return {
      'Success': 'text-success',
      'Failed': 'text-danger',
      'In Progress': 'text-primary'
    }[item.name];
  }
}

