import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { OrchestrationExecutionsWorkflowLogsService, WorkflowDetailsViewData, WorkflowLogsViewData, WorkflowOutputViewData, WorkflowTaskViewData } from './orchestration-executions-workflow-logs.service';
import { DOCUMENT } from '@angular/common';
import { WorkflowLogDetails } from './orchestration-executions-workflow-logs.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'orchestration-executions-workflow-logs',
  templateUrl: './orchestration-executions-workflow-logs.component.html',
  styleUrls: ['./orchestration-executions-workflow-logs.component.scss'],
  providers: [OrchestrationExecutionsWorkflowLogsService]
})

export class OrchestrationExecutionsWorkflowLogsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  workflowId: string = '';
  workflowDetails: WorkflowLogDetails;
  workflowDetailsViewData: WorkflowDetailsViewData = new WorkflowDetailsViewData();
  workflowLogsViewData: WorkflowLogsViewData = new WorkflowLogsViewData();
  workflowOutputViewData: WorkflowOutputViewData[] = [];
  workflowTaskListViewData: WorkflowTaskViewData[] = [];
  isAdvanced: boolean = false;
  isAgentic: boolean = false;
  selectedTask;
  barChartData;
  pieChartData;
  lineChartData;
  AreaChartData;
  showWorkflowWidget = true;

  @ViewChild('copyContent', { static: false }) contentToCopy: ElementRef;
  constructor(private workflowLogsService: OrchestrationExecutionsWorkflowLogsService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    @Inject(DOCUMENT) private document,
    private renderer: Renderer2,) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workflowId = params.get('workflowId');
    });
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        if (params['isAdvanced'] !== undefined) {
          this.isAdvanced = JSON.parse(params['isAdvanced']);
          this.isAgentic = false;
        } else if (params['isAgentic'] !== undefined) {
          this.isAgentic = JSON.parse(params['isAgentic']);
          this.isAdvanced = false;
          console.log(this.isAgentic);
        } else {
          // default case if neither query param is present
          this.isAdvanced = false;
          this.isAgentic = false;
        }
      });

  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.reloadPageData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.maximizeLeftPanel();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo) {
    this.spinner.start('main');
    this.showWorkflowWidget = false;
    setTimeout(() => {
      this.reloadPageData();
      this.showWorkflowWidget = true;
    });
  }


  reloadPageData() {
    this.minimizeLeftPanel();
    this.getWorkflowDetails();
    this.getWorkflowExecutionLogs();
    this.getOutputDetails();
  }


  minimizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (!isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'none');
      sidebar_minimizer.click();
    }
  }

  maximizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'unset');
      sidebar_minimizer.click();
    }
  }

  getWorkflowDetails() {
    this.workflowLogsService.getWorkflowDetails(this.workflowId, this.isAgentic).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.workflowDetails = _clone(data);
      if (this.isAgentic) {
        this.workflowDetailsViewData = this.workflowLogsService.converToAgenticWorkflowDetailsViewData(data);
        this.workflowTaskListViewData = this.workflowLogsService.convertToAgenticWorkflowTaskViewList(data);
        this.selectedTask = this.workflowTaskListViewData[0];
      } else {
        this.workflowDetailsViewData = this.workflowLogsService.converToWorkflowDetailsViewData(data);
        this.workflowTaskListViewData = this.workflowLogsService.convertToWorkflowTaskViewList(data);
        this.selectedTask = this.workflowTaskListViewData[2];
      }

    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get workflow details'));
    });
  }

  getWorkflowExecutionLogs() {
    this.workflowLogsService.getExecutionLogs(this.workflowId, this.isAgentic).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.workflowLogsViewData = this.workflowLogsService.convertToExecutionLogViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get execution logs for this workflow'));
    });
  }

  getOutputDetails() {
    this.workflowLogsService.getOutputDetails(this.workflowId, this.isAgentic).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      console.log(data);
      this.workflowOutputViewData = this.workflowLogsService.covertToOutputViewData(data);
      console.log(this.workflowOutputViewData, this.workflowTaskListViewData);

      // this.selectedTask = this.workflowTaskListViewData[0];
      if (this.workflowTaskListViewData?.length && this.workflowOutputViewData?.length) {
        console.log(this.workflowTaskListViewData, "wf task list")
        console.log(this.workflowOutputViewData, "wf output list")
        const taskWithOutput = this.workflowTaskListViewData.find(task =>
          this.workflowOutputViewData.some(output => output.id === task.nodeId)
        );
        this.selectedTask = taskWithOutput || this.workflowTaskListViewData[0];
        console.log(this.selectedTask, "selected Task")
      }
      this.workflowOutputViewData.forEach(val => {
        if (val.type === 'Chart Task') {
          val.output = JSON.parse(val.output.replaceAll("'", "\""));
          if (val.output.chart_type === 'Pie') {
            this.pieChartData = this.workflowLogsService.convertToPieChartData(val.output);
          } else if (val.output.chart_type === 'Bar') {
            this.barChartData = this.workflowLogsService.convertToBarChartData(val.output);
          } else if (val.output.chart_type === 'Line') {
            this.lineChartData = this.workflowLogsService.convertToLineChartData(val.output);
          } else if (val.output.chart_type === 'Area') {
            this.AreaChartData = this.workflowLogsService.convertToAreaChartData(val.output);
          }
        }
      });
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get output details'));
    });
  }
  showTaskDetails(task) {
    this.selectedTask = { ...task };
  }

  copyOutput() {
    const content = this.contentToCopy.nativeElement.innerText;
    const el = document.createElement('textarea');
    el.value = content;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy'); // this is deprecated need to discuss.
    document.body.removeChild(el);
    this.notification.success(new Notification('Output Copied'));
  }

  getColor(value: string) {
    if (value == 'Success') {
      return 'text-success';
    } else if (value == 'Failed') {
      return 'text-danger';
    } else {
      return 'text-primary';
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-light-green';
      case 'failed': return 'bg-light-red';
      case 'pending': return 'bg-secondary';
      case 'cancelled': return 'bg-light-red';
      case 'skipped': return 'bg-skipped';
      case 'queued': return 'bg-queued';
      case 'running': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  filterName(name: string): string {
    if (!name) return '';
    const formatted = name.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
