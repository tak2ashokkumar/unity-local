import { Component, OnDestroy, OnInit } from '@angular/core';
import { ListSummaryModel, ListSummaryViewModel, OrchestrationExecutionsService, TableViewModel } from './orchestration-executions.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FilterConfig, SelectedFilters, SortDirection, SortEvent, TableColumn } from 'src/app/shared/app-generic-table/app-generic-table.type';

@Component({
  selector: 'orchestration-executions',
  templateUrl: './orchestration-executions.component.html',
  styleUrls: ['./orchestration-executions.component.scss']
})
export class OrchestrationExecutionsComponent implements OnInit, OnDestroy {

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', widthClass: 'tdw-15', sortable: true, sortField: 'id', locked: true },
    { key: 'templateName', label: 'Template Name', widthClass: 'tdw-20', sortable: true, sortField: 'template_name', locked: true },
    { key: 'type', label: 'Type', widthClass: 'tdw-10', sortable: true, sortField: 'type' },
    { key: 'category', label: 'Category', widthClass: 'tdw-10', sortable: true, sortField: 'category' },
    { key: 'startTime', label: 'Started On', widthClass: 'tdw-15' },
    { key: 'createdBy', label: 'Executed By', widthClass: 'tdw-10', sortable: true, sortField: 'created_by' },
    { key: 'duration', label: 'Duration', widthClass: 'tdw-10' },
    { key: 'statusIcon', label: 'Status', align: 'center' },
  ];

  private ngUnsubscribe = new Subject();
  listSummaryViewData: ListSummaryViewModel;
  tableData: TableViewModel[] = [];
  currentCriteria: SearchCriteria;
  count: number;
  activeSortField: string | null = null;
  activeSortDirection: SortDirection = null;

  get filterConfig(): FilterConfig[] {
    return [
      {
        key: 'type', label: 'Type', options: [
          { label: 'Task', value: 'task' },
          { label: 'Agentic', value: 'agentic' }
        ]
      }
    ];
  }

  get selectedFiltersForTable(): SelectedFilters {
    const result: SelectedFilters = {};
    const params = this.currentCriteria.params[0];
    if (params.type) result['type'] = String(params.type).split(',');
    return result;
  }

  constructor(
    private orchestrationExecutionService: OrchestrationExecutionsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: null }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.restoreCriteria();
    this.getListSummary();
    this.getFullList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private restoreCriteria(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.applyQueryParamsToCriteria(qp);
  }

  private applyQueryParamsToCriteria(qp: ParamMap): void {
    this.currentCriteria.params[0].type = qp.get('type') || null;
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
        type: params.type || null,
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

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getFullList();
  }

  onFiltersApplied(filters: SelectedFilters) {
    this.currentCriteria.params[0].type = filters['type']?.length ? filters['type'].join(',') : null;
    this.currentCriteria.pageNo = 1;
    this.onFilterChange();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.syncCriteriaToQueryParams();
    this.getFullList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.syncCriteriaToQueryParams();
    this.getFullList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getFullList();
  }

  refreshData() {
    this.spinner.start('main');
    this.getFullList();
  }

  onSortChanged(event: SortEvent) {
    this.spinner.start('main');
    this.activeSortField = event.direction ? event.field : null;
    this.activeSortDirection = event.direction;
    this.currentCriteria.sortColumn = event.direction ? event.field : '';
    this.currentCriteria.sortDirection = event.direction || '';
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getFullList();
  }


  getListSummary() {
    this.orchestrationExecutionService.getListSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: ListSummaryModel) => {
      this.listSummaryViewData = this.orchestrationExecutionService.convertToListSummaryViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  getFullList() {
    this.orchestrationExecutionService.getFullList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.tableData = this.orchestrationExecutionService.convertToTableViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  navigateToLogs(tableData: TableViewModel) {
    if (tableData.type === 'Task') {
      this.router.navigate([tableData.uuid, tableData.id, 'tasklogs'], { relativeTo: this.route });
    } else if (tableData.type === 'Workflow' || tableData.type === 'Agentic') {
      if (tableData.is_agentic) {
        this.router.navigate([tableData.uuid, 'workflow-logs'], { queryParams: { isAgentic: tableData.is_agentic }, relativeTo: this.route });
      } else {
        this.router.navigate([tableData.uuid, 'workflow-logs'], { queryParams: { isAdvanced: tableData.is_advanced }, relativeTo: this.route });
      }
    }

    this.navigateToWorkflow(tableData, true);
  }

  navigateToWorkflow(tableData: TableViewModel, execution = false) {
    if (tableData.type !== 'Workflow' && tableData.type !== 'Agentic') return;
    if (tableData.is_agentic && execution) {
      this.router.navigate(
        ['/services/orchestration/workflows/dynamic-workflow', tableData.uuid, 'execute'],
        { state: { workflowReturnUrl: this.router.url } }
      );
      return;
    }

    this.orchestrationExecutionService.getExecutionWorkflow(tableData.uuid, tableData.is_agentic)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.router.navigate([
          '../workflows',
          tableData.is_agentic ? 'dynamic-workflow' : 'agentic-workflow',
          data.workflow,
          'view'
        ], { relativeTo: this.route, state: { workflowReturnUrl: this.router.url } });
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get workflow details'));
      });
  }

  getStatusClass(item: { name: string }): string {
    return {
      'Success': 'text-success',
      'Failed': 'text-danger',
      'In Progress': 'text-primary'
    }[item.name];
  }

  get popoverCategories(): any[] {
    const d = this.listSummaryViewData;
    return [...(d?.categories || []).slice(2), ...(d?.remainingCategories || [])];
  }
}
