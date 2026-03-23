import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityWorkflowTasksViewData, UnityWorkflowViewData, unityWorkflowTaskTypes } from '../../orchestration-workflows/orchestration-workflow-crud/orchestration-workflow-crud.service';
import { OrchestrationWorkflowCrudUtilsService } from '../../orchestration-workflows/orchestration-workflow-crud/orchestration-workflow-crud.utils.service';
import { WorkflowLogDetails } from '../orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.type';
import { OrchestrationExecutionLogsWorkflowWidgetService } from './orchestration-execution-logs-workflow-widget.service';
declare let LeaderLine: any;


@Component({
  selector: 'orchestration-execution-logs-workflow-widget',
  templateUrl: './orchestration-execution-logs-workflow-widget.component.html',
  styleUrls: ['./orchestration-execution-logs-workflow-widget.component.scss'],
  providers: [OrchestrationExecutionLogsWorkflowWidgetService]
})
export class OrchestrationExecutionLogsWorkflowWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input() workflowDetails: WorkflowLogDetails;

  viewData: UnityWorkflowViewData = new UnityWorkflowViewData();
  selectedTaskIndex: { i: number, k: number };
  selectedTask: UnityWorkflowTasksViewData;
  taskTypes = unityWorkflowTaskTypes;
  showTaskDetails: boolean = false;

  constructor(private svc: OrchestrationExecutionLogsWorkflowWidgetService,
    private crudSvc: OrchestrationWorkflowCrudUtilsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private renderer: Renderer2,
    private utilSvc: AppUtilityService,
    private notification: AppNotificationService,
    @Inject(DOCUMENT) private document,
    private modalService: BsModalService,
    private builder: FormBuilder) { }


  ngOnInit(): void {
    this.spinner.start('main');
    this.viewData = this.svc.convertToViewData(this.workflowDetails);
    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        let tasksWithNoParams = this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.START ||
          this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.END ||
          this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.CONDITION;
        if (tasksWithNoParams) {
          continue;
        }
        if (this.viewData.multiLevelTasks[i][k].inputs) {
          this.viewData.multiLevelTasks[i][k].inputForm = this.svc.buildTaskInputForm(_clone(this.viewData.multiLevelTasks[i][k]));
          this.viewData.multiLevelTasks[i][k].outputForm = this.svc.buildTaskOutputForm(_clone(this.viewData.multiLevelTasks[i][k]));
        }
      }
    }
    setTimeout(() => {
      this.setConnectors();
      this.spinner.stop('main');
    }, 1000)
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    // this.maximizeLeftPanel();
    this.resetConnectors();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setConnectors() {
    setTimeout(() => {
      for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
        for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
          this.viewData.multiLevelTasks[i][k].targets?.forEach((target, index) => {
            this.addConnector(this.viewData.multiLevelTasks[i][k], target, index);
          })
        }
      }
      this.setClassesForLineSVGs();
    }, 100)
  }

  addConnector(task: UnityWorkflowTasksViewData, target: string, index?: number) {
    if (!target) {
      return;
    }
    let ll = new LeaderLine(
      this.document.getElementById(task.name_id),
      this.document.getElementById(target),
      {
        path: 'grid', size: 1,
        startPlug: 'disc', startPlugSize: 2, endPlug: 'arrow2', endPlugSize: 3,
        middleLabel: LeaderLine.captionLabel('+'),
      }
    );
    if (task.execution_status == 'Success') {
      ll.color = '#0cbb70';
    }if (task.execution_status == 'Failed') {
      ll.color = '#b72525';
    } else {
      ll.color = '#5e9ada';
    }
    let taskIndex = 0;
    let targetIndex = 0;
    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        if (this.viewData.multiLevelTasks[i][k].name_id == task.name_id) {
          taskIndex = i;
        }
        if (this.viewData.multiLevelTasks[i][k].name_id == target) {
          targetIndex = i;
        }
      }
    }
    if (taskIndex < targetIndex) {
      if (task.type == unityWorkflowTaskTypes.CONDITION) {
        ll.startSocket = 'bottom';
        ll.startSocketGravity = [0, 20];
      }
      ll.endSocket = 'top';
    } else if (taskIndex > targetIndex) {
      if (task.type == unityWorkflowTaskTypes.CONDITION) {
        ll.startSocket = 'top';
        ll.startSocketGravity = [0, -20];
      }
      ll.endSocket = 'bottom';
    } else {
      if (index == 1) {
        ll.startSocket = 'top';
        ll.endSocket = 'top';
        ll.startSocketGravity = [0, -20];
      } else if (index == 2) {
        ll.startSocket = 'bottom';
        ll.endSocket = 'bottom';
        ll.startSocketGravity = [0, 20];
      }
    }

    let cdn = task.conditions?.find(c => c.execute == target);
    if (cdn && cdn.expression && cdn.expression.key) {
      let exp = cdn.expression.key.split(' ');
      let kArr = exp[0].split('{');
      kArr = kArr.getLast().split('}');
      kArr = kArr.getFirst().split('outputs');
      kArr.splice(0, 1);

      let key: string;
      if (kArr[0].length) {
        key = `outputs${kArr[0]}`;
      } else {
        key = `outputs`;
      }

      let pathLabel = `${key} ${cdn.expression.operator} ${cdn.expression.value}`
      ll.startLabel = LeaderLine.pathLabel(pathLabel, { fontSize: 12 });
    }
    task.leaderLines.splice(index ? index : 0, 0, { 'to': target, line: ll });
    return ll;
  }

  removeConnector(task: UnityWorkflowTasksViewData, target: string) {
    let lineIndex = task.leaderLines.findIndex(l => l.to == target);
    if (lineIndex != -1) {
      task.leaderLines[lineIndex].line?.remove();
      task.leaderLines.splice(lineIndex, 1);
    }
  }

  resetConnectors() {
    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        this.viewData.multiLevelTasks[i][k].targets?.forEach((target) => {
          this.removeConnector(this.viewData.multiLevelTasks[i][k], target);
        })
      }
    }
  }

  setClassesForLineSVGs() {
    let lines = this.document.getElementsByClassName('leader-line');
    for (let i = 0; i < lines.length; i++) {
      let elem = lines.item(i);
      this.renderer.addClass(elem, `leader-line-${i + 1}`);
      // this.renderer.listen(elem, 'click', (event) => {
      //   if (elem.classList.contains('active')) {
      //     this.showWidgetAddMenu(elem);
      //   } else {
      //     for (let index = 0; index < lines.length; index++) {
      //       this.renderer.removeClass(lines.item(index), `active`);
      //     }
      //     this.renderer.addClass(elem, `active`);
      //     let textElement = elem.children.item(2);
      //     this.widgetAddMenuStyle.top = `calc(${textElement.attributes.y.value} - 25px)`;
      //     this.widgetAddMenuStyle.left = `calc(${textElement.attributes.x.value} - 50px)`;
      //     this.showWidgetAddMenu(lines.item(i));
      //   }
      // })
    }
  }

  viewTaskDetails(i: number, k: number) {
    this.showTaskDetails = true;
    this.selectedTaskIndex = { i: i, k: k };
    this.selectedTask = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k];
    setTimeout(() => {
      this.renderer.setStyle(document.getElementById('task-details-card'), "width", '20vw');
      this.renderer.setStyle(document.getElementById('task-details-card'), "min-height", '60vh');
      this.renderer.setStyle(document.getElementById('task-details-card'), "background-color", '#fffff');
    }, 100);
  }

  closeTaskDetails() {
    this.renderer.setStyle(document.getElementById('task-details-card'), "width", '0%');
    this.showTaskDetails = false;
    this.selectedTaskIndex = null;
    this.selectedTask = null;
  }

}
