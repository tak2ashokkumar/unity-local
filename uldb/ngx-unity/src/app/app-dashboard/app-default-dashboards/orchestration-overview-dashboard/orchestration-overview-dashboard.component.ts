import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartNames, ExecutionsOverviewViewData, ExecutionsSummaryViewData, OrchestrationOverviewDashboardService, RecentFailureViewModel, TaskWidgetViewData, UpccomingExecutionViewModel, WorkflowWidgetViewData } from './orchestration-overview-dashboard.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnityChatbotService } from 'src/app/unity-chatbot/unity-chatbot.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'orchestration-overview-dashboard',
  templateUrl: './orchestration-overview-dashboard.component.html',
  styleUrls: ['./orchestration-overview-dashboard.component.scss'],
  providers: [OrchestrationOverviewDashboardService]
})
export class OrchestrationOverviewDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  taskWidget: TaskWidgetViewData = new TaskWidgetViewData();
  workflowWidget: WorkflowWidgetViewData = new WorkflowWidgetViewData();
  executionSummaryWidget: ExecutionsSummaryViewData;
  executionsOverviewViewData: ExecutionsOverviewViewData;

  recentFailureViewData: RecentFailureViewModel[] = [];
  upcomingExecutionViewData: UpccomingExecutionViewModel[] = [];


  constructor(private svc: OrchestrationOverviewDashboardService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private aiService: UnityChatbotService,
    private userInfoService: UserInfoService) { }

  ngOnInit(): void {
    this.executionSummaryWidget = this.svc.executionSummaryWidgetData();
    this.executionsOverviewViewData = this.svc.executionsOverviewViewData();
    this.getTaskWidgetData();
    this.getWorkflowWidgetData();
    this.getRecentFailureData();
    this.getUpcomingExecutionData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTaskWidgetData() {
    this.spinner.start(this.taskWidget.loader);
    this.taskWidget.byStatusChartData = null;
    this.taskWidget.byTargetChartData = null;
    this.taskWidget.byScriptTypeChartData = null;
    this.svc.getTaskWidgetData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.taskWidget.count = res ? res.total : 0;
      if (this.taskWidget.count) {
        this.taskWidget.byStatusChartData = this.svc.convertToTaskByStatusChartsData(res.status);
        this.taskWidget.byTargetChartData = this.svc.convertToTaskByTargetTypeChartsData(res.target_type);
        this.taskWidget.byScriptTypeChartData = this.svc.convertToTaskByScriptTypeChartData(res.type);
      }
      this.spinner.stop(this.taskWidget.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.taskWidget.loader);
      this.notification.error(new Notification('Failed to get Task Details'));
    });
  }

  getWorkflowWidgetData() {
    this.spinner.start(this.workflowWidget.loader);
    this.workflowWidget.byStatusChartData = null;
    this.workflowWidget.byCategoryChartData = null;
    this.svc.getWorkflowWidgetData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workflowWidget.count = res ? res.total : 0;
      if (this.workflowWidget.count) {
        this.workflowWidget.byStatusChartData = this.svc.convertToWorkflowByStatusChartsData(res.status);
        this.workflowWidget.byTargetTypeChartData = this.svc.convertToWorkflowByTargetTypeChartsData(res.target_type);
        this.workflowWidget.byCategoryChartData = this.svc.convertToWorkflowByCategoryChartData(res.categories);
      }
      this.spinner.stop(this.workflowWidget.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.workflowWidget.loader);
      this.notification.error(new Notification('Failed to get Workflow Details'));
    });
  }

  onExecutionSummaryWidgetFormChanged(event: any) {
    this.executionSummaryWidget.formData = event;
    this.getExecutionSummaryWidgetData();
    this.userInfoService.isInsightsEnabled && this.getInsight();
  }

  getExecutionSummaryWidgetData() {
    this.spinner.start(this.executionSummaryWidget.loader);
    this.executionSummaryWidget.counts = null;
    this.executionSummaryWidget.byTypeChartData = null;
    this.executionSummaryWidget.avgExecutionTimeViewData = null;
    this.executionSummaryWidget.byUserChartData = null;
    this.svc.getExecutionSummaryWidgetData(this.executionSummaryWidget?.formData?.from, this.executionSummaryWidget?.formData?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.executionSummaryWidget.counts = this.svc.convertToExecutionByCounts(res.exec_count_summary);
      this.executionSummaryWidget.byTypeChartData = this.svc.convertToExecutionByTypeChartData(res);
      this.executionSummaryWidget.avgExecutionTimeViewData = this.svc.convertToAvgExecutionTimeData(res);
      this.executionSummaryWidget.byUserChartData = this.svc.convertToExecutionByUserChartData(res.execution_by_user);
      this.spinner.stop(this.executionSummaryWidget.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.executionSummaryWidget.loader);
      this.notification.error(new Notification('Failed to get Execution Summary Details'));
    });
  }

  onExecutionsOverviewWidgetFormChanged(event: any) {
    this.executionsOverviewViewData.formData = event;
    this.svc.dateRange = this.executionsOverviewViewData.formData;
    this.getExecutionsOverviewData();
  }

  getExecutionsOverviewData() {
    this.spinner.start(this.executionsOverviewViewData.loader);
    this.executionsOverviewViewData.successRateChartData = null;
    this.executionsOverviewViewData.efficiencyChartData = null;
    this.svc.getExecutionsOverviewData(this.executionsOverviewViewData?.formData?.from, this.executionsOverviewViewData?.formData?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.executionsOverviewViewData.successRateChartData = this.svc.convertToExecutionsBySuccessRateChartData(this.executionsOverviewViewData.formData, res.execution_success_rate);
      this.executionsOverviewViewData.efficiencyChartData = this.svc.convertToExecutionsByEfficiencyChartData(this.executionsOverviewViewData.formData, res.execution_efficiency);
      this.spinner.stop(this.executionsOverviewViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.executionsOverviewViewData.loader);
      this.notification.error(new Notification('Failed to get Executions Details'));
    });
  }

  getRecentFailureData() {
    this.svc.getRecentFailureData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.recentFailureViewData = this.svc.convertToRecentFailureViewData(res);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Recent Failures'));
    });
  }

  getUpcomingExecutionData() {
    this.svc.getUpcomingExecutionData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.upcomingExecutionViewData = this.svc.convertToUpcomingExecutionViewData(res);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Upcoming Executions'));
    });
  }

  onChartClick(chartInstance: any) {
    chartInstance.on('click', (params: any) => {
      this.goTo(chartInstance.getOption(), params)
    });
  }

  goTo(option: EChartsOption, params: any) {
    switch (option.targetEntity) {
      case 'Task': this.goToTasks(<string>option.chartName, params); break;
      case 'Workflow': this.goToWorkflows(<string>option.chartName, params); break;
      case 'Execution': this.goToExecutions(<string>option.chartName, params); break;
      default: return;
    }
  }

  goToTasks(chartName?: string, params?: any) {
    switch (chartName) {
      case ChartNames.TASKS_BY_STATUS:
        this.router.navigate(['/services/orchestration/tasks'], { queryParams: { status: params.name } });
        break;
      case ChartNames.TASKS_BY_TARGET:
        this.router.navigate(['/services/orchestration/tasks'], { queryParams: { target: params.name } });
        break;
      case ChartNames.TASKS_BY_TYPE:
        this.router.navigate(['/services/orchestration/tasks'], { queryParams: { scriptType: params.name } });
        break;
      default:
        this.router.navigate(['/services/orchestration/tasks']);
    }
  }

  goToWorkflows(chartName?: string, params?: any) {
    switch (chartName) {
      case ChartNames.WORKFLOWS_BY_STATUS:
        this.router.navigate(['/services/orchestration/workflows'], { queryParams: { workflow_status: params.name } });
        break;
      case ChartNames.WORKFLOWS_BY_CATEGORY:
        this.router.navigate(['/services/orchestration/workflows'], { queryParams: { category: params.name } });
        break;
      default:
        this.router.navigate(['/services/orchestration/workflows']);
    }
  }

  goToExecutions(chartName?: string, params?: any) {
    switch (chartName) {
      case ChartNames.EXECUTIONS_BY_TYPE:
        break;
      case ChartNames.EXECUTIONS_BY_USER:
        break;
      case ChartNames.EXECUTIONS_BY_SUCCESS_RATE:
        break;
      case ChartNames.EXECUTIONS_BY_EFFICIENCY:
        break;
      default:
    }
  }

  execute(data: any) {
    if (data.type === "Task") {
      this.router.navigate(['/services/orchestration/tasks', data.taskOrWorkflowId, data.targetType, 'execute']);
    } else {
      this.router.navigate(['/services/orchestration/workflows', data.taskOrWorkflowId, 'execute']);
    }
  }

  schedule(data: UpccomingExecutionViewModel) {
    if (data.type === "Task") {
      this.router.navigate(['/services/orchestration/tasks', data.taskOrWorkflowId, data.targetType, 'scheduleTasks']);
    } else {
      this.router.navigate(['/services/orchestration/workflows', data.taskOrWorkflowId, data.targetType, 'scheduleWorkflow']);
    }
  }

  redirectToTaskOrWorkflowEdit(data: any) {
    if (data.type === "Task") {
      this.router.navigate(['/services/orchestration/tasks', data.taskOrWorkflowId, 'edit']);
    } else {
      this.router.navigate(['/services/orchestration/workflows', data.taskOrWorkflowId, 'edit']);
    }
  }

  redirectToExecutionPage(data: RecentFailureViewModel) {
    if (data.type == "Task") {
      this.router.navigate(['/services/orchestration/executions', data.uuid, data.id, 'tasklogs']);
    } else {
      this.router.navigate(['/services/orchestration/executions', data.uuid, 'workflow-logs'], { queryParams: { isAdvanced: data.isAdvanced } });
    }
  }

  getInsight() {
    this.aiService.onDevopsFilterChange(this.executionSummaryWidget?.formData?.from, this.executionSummaryWidget?.formData?.to);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
