import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ChartNames, ExecutionsOverviewViewData, ExecutionsSummaryViewData, OrchestrationSummaryService, RecentFailureViewModel, TaskWidgetViewData, UpccomingExecutionViewModel, WorkflowWidgetViewData } from './orchestration-summary.service';
import { UnityChatbotService } from 'src/app/unity-chatbot/unity-chatbot.service';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'orchestration-summary',
  templateUrl: './orchestration-summary.component.html',
  styleUrls: ['./orchestration-summary.component.scss'],
  providers: [OrchestrationSummaryService]
})
export class OrchestrationSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  taskWidget: TaskWidgetViewData = new TaskWidgetViewData();
  workflowWidget: WorkflowWidgetViewData = new WorkflowWidgetViewData();
  executionSummaryWidget: ExecutionsSummaryViewData;
  executionsOverviewViewData: ExecutionsOverviewViewData;

  recentFailureViewData: RecentFailureViewModel[] = [];
  upcomingExecutionViewData: UpccomingExecutionViewModel[] = [];

  constructor(private svc: OrchestrationSummaryService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private aiService: UnityChatbotService,
    private userInfoService: UserInfoService) {
  }

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
    console.log(this.executionsOverviewViewData.formData, 'ljajsa');
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
    console.log('option.targetEntity : ', option.targetEntity);
    console.log('option.chartName : ', option.chartName);
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
        this.router.navigate(['tasks'], { queryParams: { status: params.name }, relativeTo: this.route.parent });
        break;
      case ChartNames.TASKS_BY_TARGET:
        this.router.navigate(['tasks'], { queryParams: { target: params.name }, relativeTo: this.route.parent });
        break;
      case ChartNames.TASKS_BY_TYPE:
        this.router.navigate(['tasks'], { queryParams: { scriptType: params.name }, relativeTo: this.route.parent });
        break;
      default:
        this.router.navigate(['tasks'], { relativeTo: this.route.parent });
    }
  }

  goToWorkflows(chartName?: string, params?: any) {
    switch (chartName) {
      case ChartNames.WORKFLOWS_BY_STATUS:
        this.router.navigate(['workflows'], { queryParams: { workflow_status: params.name }, relativeTo: this.route.parent });
        break;
      case ChartNames.WORKFLOWS_BY_CATEGORY:
        this.router.navigate(['workflows'], { queryParams: { category: params.name }, relativeTo: this.route.parent });
        break;
      default:
        this.router.navigate(['workflows'], { relativeTo: this.route.parent });
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
    if (data.type == "Task") {
      this.router.navigate(['tasks', data.taskOrWorkflowId, data.targetType, 'execute'], { relativeTo: this.route.parent });
    } else {
      this.router.navigate(['workflows', data.taskOrWorkflowId, 'execute'], { relativeTo: this.route.parent });
    }
  }

  schedule(data: UpccomingExecutionViewModel) {
    if (data.type == "Task") {
      this.router.navigate(['tasks', data.taskOrWorkflowId, data.targetType, 'scheduleTasks'], { relativeTo: this.route.parent });
    } else {
      this.router.navigate(['workflows', data.taskOrWorkflowId, data.targetType, 'scheduleWorkflow'], { relativeTo: this.route.parent });
    }
  }

  redirectToTaskOrWorkflowEdit(data: any) {
    if (data.type == "Task") {
      this.router.navigate(['tasks', data.taskOrWorkflowId, 'edit'], { relativeTo: this.route.parent });
    } else {
      this.router.navigate(['workflows', data.taskOrWorkflowId, 'edit'], { relativeTo: this.route.parent });
    }
  }

  redirectToExecutionPage(data: RecentFailureViewModel) {
    if (data.type == "Task") {
      this.router.navigate(['executions', data.uuid, data.id, 'tasklogs'], { relativeTo: this.route.parent });
    } else {
      this.router.navigate(['executions', data.uuid, 'workflow-logs'], { relativeTo: this.route.parent, queryParams: { isAgentic: data.isAgentic } });
    }
  }

  getInsight() {
    this.aiService.onDevopsFilterChange(this.executionSummaryWidget?.formData?.from, this.executionSummaryWidget?.formData?.to);
  }
} 