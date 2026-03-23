import { Component, OnInit } from '@angular/core';
import { ListSummaryModel, ListSummaryViewModel, OrchestrationExecutionsService, SummaryResultsModel, TableDataResponseModel, TableViewModel } from './orchestration-executions.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'orchestration-executions',
  templateUrl: './orchestration-executions.component.html',
  styleUrls: ['./orchestration-executions.component.scss']
})
export class OrchestrationExecutionsComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  listSummaryViewData: ListSummaryViewModel;J
  tableData: TableViewModel[] = [];
  currentCriteria: SearchCriteria
  count: number;
  isPageSizeAll: boolean = false;


  constructor(
    private orchestrationExecutionService: OrchestrationExecutionsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getListSummary();
    this.getFullList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getFullList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getFullList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getFullList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getFullList();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
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
      console.log('>>>>>>>>>', tableData)
      if (tableData.is_agentic) {
        this.router.navigate([tableData.uuid, 'workflow-logs'], { queryParams: { isAgentic: tableData.is_agentic }, relativeTo: this.route });
      } else {
        this.router.navigate([tableData.uuid, 'workflow-logs'], { queryParams: { isAdvanced: tableData.is_advanced }, relativeTo: this.route });
      }
    }
  }
}
