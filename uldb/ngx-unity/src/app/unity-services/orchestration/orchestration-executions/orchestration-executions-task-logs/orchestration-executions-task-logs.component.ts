import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LogsResponse, LogsViewData, OrchestrationExecutionsTaskLogsService, OutputResponse, OutputViewData, TaskDetailsModel, TaskDetailsViewModel } from './orchestration-executions-task-logs.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';


@Component({
  selector: 'orchestration-executions-task-logs',
  templateUrl: './orchestration-executions-task-logs.component.html',
  styleUrls: ['./orchestration-executions-task-logs.component.scss']
})
export class OrchestrationExecutionsTaskLogsComponent implements OnInit {

  uuid: string;
  id: string;
  taskDetails: TaskDetailsViewModel;
  executionLogsData: LogsViewData;
  outputData: OutputViewData;
  @ViewChild('copyContent', { static: false }) contentToCopy: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskLogsService: OrchestrationExecutionsTaskLogsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.uuid = params.get('taskId');
      this.id = params.get('id');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getTaskDetails();
    this.getTaskExecutionLogs();
    this.getOutputDetails();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getTaskDetails();
    this.getTaskExecutionLogs();
    this.getOutputDetails();
  }

  getTaskDetails() {
    this.taskLogsService.getTaskDetails(this.uuid).subscribe((data: TaskDetailsModel) => {
      this.taskDetails = this.taskLogsService.converToTaskDetailsViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get task details'));
    });
  }

  getTaskExecutionLogs() {
    this.taskLogsService.getExecutionLogs(this.uuid).subscribe((data: LogsResponse) => {
      this.executionLogsData = this.taskLogsService.convertToExecutionLogViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get execution logs for this task'));
    });
  }

  getOutputDetails() {
    this.taskLogsService.getOutputDetails(this.uuid).subscribe((data: OutputResponse) => {
      this.outputData = this.taskLogsService.covertToOutputViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get output details'));
    });
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

  get parametersArray() {
    return this.taskDetails?.parameters?.controls || [];
  }

  filterName(name: string): string {
    if (!name) return '';
    const formatted = name.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route })
  }

}
