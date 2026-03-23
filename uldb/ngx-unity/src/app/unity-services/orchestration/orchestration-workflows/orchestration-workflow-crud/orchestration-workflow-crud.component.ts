import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { OrchestrationWorkflowCrudService, UnityWorkflowTasksViewData, UnityWorkflowViewData, unityWorkflowTaskTypes } from './orchestration-workflow-crud.service';

import { DOCUMENT } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import 'leader-line';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { OrchestrationTaskCategoryDataType, OrchestrationTaskType, OrchestrationWorkflowMetadata } from '../../orchestration.type';
import { OrchestrationWorkflowCrudUtilsService, conditionOperators } from './orchestration-workflow-crud.utils.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
declare let LeaderLine: any;

@Component({
  selector: 'orchestration-workflow-crud',
  templateUrl: './orchestration-workflow-crud.component.html',
  styleUrls: ['./orchestration-workflow-crud.component.scss'],
  providers: [OrchestrationWorkflowCrudService]
})
export class OrchestrationWorkflowCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  workFlowId: string;

  @ViewChild('workflowDetailsFormRef') workflowDetailsFormRef: ElementRef;
  workflowDetailsForm: FormGroup;
  workflowDetailsFormErrors: any;
  workflowDetailsFormValidationMessages: any;
  taskInputTemplates: inputTemplateType[] = [];

  @ViewChild('integrationFormRef') integrationFormRef: ElementRef;
  integrationForm: FormGroup;
  integrationFormErrors: any;
  integrationFormValidationMessages: any;

  @ViewChild('workflowFormRef') workflowFormRef: ElementRef;
  workflowForm: FormGroup;
  workflowFormErrors: any;
  workflowFormValidationMessages: any;

  @ViewChild('taskFormRef') taskFormRef: ElementRef;
  taskForm: FormGroup;
  taskFormErrors: any;
  taskFormValidationMessages: any;
  taskCategories: OrchestrationTaskCategoryDataType[] = [];
  tasks: OrchestrationTaskType[] = [];
  availableTasks: OrchestrationTaskType[] = [];

  @ViewChild('conditionFormRef') conditionFormRef: ElementRef;
  conditionForm: FormGroup;
  conditionFormErrors: any;
  conditionFormValidationMessages: any;
  conditionOperators: Array<{ label: string, value: string }> = conditionOperators;
  conditionTargetTasks: UnityWorkflowTasksViewData[] = [];

  @ViewChild('confirmDeleteTaskRef') confirmDeleteTaskRef: ElementRef;
  @ViewChild('confirmDeleteConditionRef') confirmDeleteConditionRef: ElementRef;
  modalRef: BsModalRef;

  viewData: UnityWorkflowViewData = new UnityWorkflowViewData();
  taskTypes = unityWorkflowTaskTypes;
  workflowMetadata: OrchestrationWorkflowMetadata;
  widgetAddMenuStyle = { top: '0px', right: '0px', botton: '0px', left: '0px' };
  showTaskDetails: boolean = false;
  selectedTaskIndex: { i: number, k: number };
  selectedTask: UnityWorkflowTasksViewData;
  addNewTaskAtIndex: number = 0;
  nonFieldErr: string;
  workflowsInProgress: EntityTaskRelation[] = [];

  constructor(private svc: OrchestrationWorkflowCrudService,
    private crudSvc: OrchestrationWorkflowCrudUtilsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private renderer: Renderer2,
    private utilSvc: AppUtilityService,
    private notification: AppNotificationService,
    @Inject(DOCUMENT) private document,
    private modalService: BsModalService,
    private storage: StorageService,
    private builder: FormBuilder) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workFlowId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.workflowsInProgress = this.storage.getByKey('workflowsInProgress', StorageType.SESSIONSTORAGE);
    if (!this.workflowsInProgress) {
      this.workflowsInProgress = [];
    }
    this.getMetadata();
    this.getTaskInputTemplates();
    this.getTaskCategories();
    this.minimizeLeftPanel();
    if (this.workFlowId) {
      this.getWorkflowDetails();
    } else {
      this.manageWorkflowDetails();
    }
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

  ngOnDestroy(): void {
    this.spinner.stop('main');
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.maximizeLeftPanel();
    this.resetConnectors();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMetadata() {
    this.svc.getMetadata().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workflowMetadata = res;
    }, (err: HttpErrorResponse) => {
      this.workflowMetadata = null;
    })
  }

  getTaskInputTemplates() {
    this.taskInputTemplates = [];
    this.svc.getTaskInputTemplates().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.taskInputTemplates = res;
      if (this.viewData && this.viewData.multiLevelTasks && this.viewData.multiLevelTasks.length) {
        for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
          for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
            let tasksWithNoParams = this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.START ||
              this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.END ||
              this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.CONDITION;
            if (tasksWithNoParams) {
              continue;
            }
            this.updateTaskParams(i, k);
          }
        }
      }
    })
  }

  getTaskCategories() {
    this.svc.getTaskCategories().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.taskCategories = res.results;
    }, (err: HttpErrorResponse) => {
      this.taskCategories = [];
    })
  }

  getWorkflowDetails() {
    this.svc.getWorkflowDetails(this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res);
      // console.log('this.viewData : ', this.viewData);
      for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
        for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
          let tasksWithNoParams = this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.START ||
            this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.END ||
            this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.CONDITION;
          if (tasksWithNoParams) {
            continue;
          }
          this.updateTaskParams(i, k);
        }
      }
      setTimeout(() => {
        this.setConnectors();
        this.spinner.stop('main');
      }, 1000)
    }, (err: HttpErrorResponse) => {
      this.viewData = this.svc.convertToViewData();
      this.setConnectors();
      this.spinner.stop('main');
    })
  }

  manageWorkflowDetails() {
    this.workflowDetailsForm = this.crudSvc.buildWorkflowDetailsForm(this.viewData);
    this.workflowDetailsFormErrors = this.crudSvc.resetWorkflowDetailsFormErrors();
    this.workflowDetailsFormValidationMessages = this.crudSvc.workflowDetailsFormValidationMessages;
    setTimeout(() => {
      this.modalRef = this.modalService.show(this.workflowDetailsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, 100);
    this.workflowDetailsForm.get('target_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Cloud') {
        this.workflowDetailsForm.addControl('cloud', new FormControl('', [Validators.required]))
      } else {
        this.workflowDetailsForm.removeControl('cloud');
      }
    })
    this.spinner.stop('main');
  }

  onSubmitWorkflowDetails() {
    if (this.workflowDetailsForm.invalid) {
      this.workflowDetailsFormErrors = this.utilSvc.validateForm(this.workflowDetailsForm, this.workflowDetailsFormValidationMessages, this.workflowDetailsFormErrors);
      this.workflowDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.workflowDetailsFormErrors = this.utilSvc.validateForm(this.workflowDetailsForm, this.workflowDetailsFormValidationMessages, this.workflowDetailsFormErrors); });
    } else {
      // this.spinner.start('main');
      if (this.viewData?.workflow_name) {
        let wd = _clone(this.workflowDetailsForm.getRawValue());
        if (this.viewData.workflow_name != wd.workflow_name) {
          this.viewData.workflow_name = wd.workflow_name;
        }
        if (this.viewData.description != wd.description) {
          this.viewData.description = wd.description;
        }
        if (this.viewData.category != wd.category) {
          this.viewData.category = wd.category;
        }
        if (this.viewData.target_type != wd.target_type) {
          this.viewData.target_type = wd.target_type;
        }
        if (this.viewData.cloud != wd.cloud) {
          this.viewData.cloud = wd.cloud;
        }
      } else {
        this.viewData = this.svc.convertToViewData(this.workflowDetailsForm.getRawValue());
        this.setConnectors();
      }
      this.modalRef.hide();
      // this.spinner.stop('main');
    }
  }

  onCloseWorkFlowDetails() {
    if (this.workFlowId) {
      this.modalRef.hide();
    } else {
      if (this.viewData && this.viewData.workflow_name) {
        this.modalRef.hide();
      } else {
        this.modalRef.hide();
        this.goBack();
      }
    }
  }

  setConnectors() {
    // console.log('this.viewdata : ', _clone(this.viewData));
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
    // console.log(`adding connector from ${task.name_id} to ${target} at index ${index}`);
    if (!target) {
      return;
    }
    let ll = new LeaderLine(
      this.document.getElementById(task.name_id),
      this.document.getElementById(target),
      {
        path: 'grid', color: '#5e9ada', size: 1,
        startPlug: 'disc', startPlugSize: 2, endPlug: 'arrow2', endPlugSize: 3,
        middleLabel: LeaderLine.captionLabel('+'),
      }
    );
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
    // console.log(`for task ${task.name_id} taskIndex is ${taskIndex} and targetIndex is ${targetIndex}`);
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
    // console.log('cdn : ', cdn);
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
    // console.log(`removing connector from ${task.name_id} to ${target}`);
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
      this.renderer.listen(elem, 'click', (event) => {
        if (elem.classList.contains('active')) {
          this.showWidgetAddMenu(elem);
        } else {
          for (let index = 0; index < lines.length; index++) {
            this.renderer.removeClass(lines.item(index), `active`);
          }
          this.renderer.addClass(elem, `active`);
          let textElement = elem.children.item(2);
          this.widgetAddMenuStyle.top = `calc(${textElement.attributes.y.value} - 25px)`;
          this.widgetAddMenuStyle.left = `calc(${textElement.attributes.x.value} - 50px)`;
          this.showWidgetAddMenu(lines.item(i));
        }
      })
    }
  }

  isOpen: boolean = false;
  showWidgetAddMenu(line: any) {
    setTimeout(() => {
      // console.log('this.viewData.multiLevelTasks : ', _clone(this.viewData.multiLevelTasks));
      let prevPosition = _clone(this.getPrevTaskCoordinates());
      console.log('prevPosition : ', prevPosition);
      let nextPosition = _clone(this.getNextTaskCoordinates());
      console.log('nextPosition : ', nextPosition);
      let show = Number.isInteger(prevPosition.i) && Number.isInteger(prevPosition.k) &&
        Number.isInteger(nextPosition.i) && Number.isInteger(nextPosition.k)
      if (show) {
        this.isOpen = true;
      }
    }, 200)
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    this.isOpen = false;
  }

  get activeLinePosition(): number {
    let activeLine = this.document.getElementsByClassName('leader-line active');
    return activeLine.item(0).classList[1].split('-').getLast();
  }

  get linesTopArray() {
    let lines = this.document.getElementsByClassName('leader-line');
    // console.log('lines : ', _clone(lines.length));

    let topArray = [];
    for (let i = 0; i < lines.length; i++) {
      let elem = lines.item(i);
      // console.log('elem : ', _clone(elem));

      let viewBoxArr = elem.attributes.viewBox.nodeValue.split(' ');
      let lineTop = Number(viewBoxArr[1]);
      // let lineHeight = viewBoxArr[4];
      topArray.push(lineTop);
    }
    // console.log('topArray : ', _clone(topArray));
    topArray.sort((a, b) => a - b);
    // console.log('topArray after sort: ', _clone(topArray));
    topArray = topArray.filter((value, index) => topArray.indexOf(value) === index);
    // topArray.reduce((a, b) => a.indexOf(b) < 0 ? a : b);
    // console.log('topArray after unique: ', _clone(topArray));
    return topArray;
  }

  get baseLinePositionStats() {
    let baseLine = this.document.getElementsByClassName('leader-line-1');
    let baseLineViewBoxArr = baseLine.item(0).attributes.viewBox.nodeValue.split(' ');
    return {
      left: Number(baseLineViewBoxArr[0]), top: Number(baseLineViewBoxArr[1]), width: Number(baseLineViewBoxArr[2]), height: Number(baseLineViewBoxArr[3])
    }
  }

  get activeLinePositionStats() {
    let baseLine = this.document.getElementsByClassName('leader-line active');
    let baseLineViewBoxArr = baseLine.item(0).attributes.viewBox.nodeValue.split(' ');
    return {
      left: Number(baseLineViewBoxArr[0]), top: Number(baseLineViewBoxArr[1]), width: Number(baseLineViewBoxArr[2]), height: Number(baseLineViewBoxArr[3])
    }
  }

  prevElem: any;
  prevTaskPositionStats: { x: number, y: number };
  getPrevTaskCoordinates() {
    // console.log('linesTopArray in getPrevTaskCoordinates: ', this.linesTopArray);
    let activeLine = this.document.getElementsByClassName('leader-line active');
    // console.log('activeLine : ', activeLine);
    let viewBoxArr = activeLine.item(0).attributes.viewBox.nodeValue.split(' ');
    // console.log('viewBoxArr : ', viewBoxArr);
    let left = Number(viewBoxArr[0]); let top = Number(viewBoxArr[1]); let width = Number(viewBoxArr[2]); let height = Number(viewBoxArr[3]);
    let x: number; let y: number;
    if (height > 12) {
      //for now checking with base line, where as in general we have to check with source elem Line
      // before coming here we should find a way to get source elem
      // console.log('this.baseLinePositionStats : ', this.baseLinePositionStats);

      let isSourceBelow = this.baseLinePositionStats.top > top ? true : false;
      // console.log('isSourceBelow : ', isSourceBelow);
      if (isSourceBelow) {
        x = left; y = top + height;
      } else {
        x = left; y = top - height;
      }
    } else {
      x = left; y = top;
    }
    let elements = this.document.elementsFromPoint(x, y);
    // console.log('elements : ', elements);

    let mainTaskDiv = elements.find(elem => elem.classList && elem.classList.value && elem.classList.value.includes('main_task'));
    if (!mainTaskDiv) {
      let taskWrapperDiv = elements.find(elem => elem.id == 'task_wrapper_div');
      // console.log('taskWrapperDiv : ', _clone(taskWrapperDiv));
      if (taskWrapperDiv) {
        mainTaskDiv = taskWrapperDiv.childNodes[0];
      } else {
        console.log('handle not availability of both mainTaskDiv and taskWrapperDiv for PREV');
      }
    }

    // console.log('mainTaskDiv.id for PREV ********************************************** : ', mainTaskDiv?.id);
    if (mainTaskDiv && mainTaskDiv.id) {
      for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
        for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
          if (this.viewData.multiLevelTasks[i][k].name_id == mainTaskDiv.id) {
            this.prevElem = _clone(this.viewData.multiLevelTasks[i][k]);
            this.prevTaskPositionStats = { x: x, y: y };
            return { i: i, k: k }
          }
        }
      }
    }
    this.prevElem = null;
    this.prevTaskPositionStats = { x: null, y: null };
    return { i: null, k: null };
  }

  nextElem: any;
  nextTaskPositionStats: { x: number, y: number };
  getNextTaskCoordinates() {
    // console.log('linesTopArray in getNextTaskCoordinates: ', this.linesTopArray);
    let activeLine = this.document.getElementsByClassName('leader-line active');
    // console.log('activeLine : ', activeLine);
    let viewBoxArr = activeLine.item(0).attributes.viewBox.nodeValue.split(' ');
    // console.log('viewBoxArr : ', viewBoxArr);
    let left = Number(viewBoxArr[0]); let top = Number(viewBoxArr[1]); let width = Number(viewBoxArr[2]); let height = Number(viewBoxArr[3]);
    let x: number; let y: number;
    if (height > 12) {
      //for now checking with base line, where as in general we have to check with target elem Line
      // before coming here we should find a way to get target elem other than below.
      let isSourceBelow = this.baseLinePositionStats.top > top ? true : false;
      // console.log('isSourceBelow : ', isSourceBelow);
      if (isSourceBelow) {
        x = left + width; y = top + height;
      } else {
        x = left + width; y = top - height;
      }
    } else {
      x = left + width; y = top;
    }
    // console.log('x : ', x);
    // console.log('y : ', y);

    let elements = this.document.elementsFromPoint(x, y);
    // console.log('elements : ', elements);

    let mainTaskDiv = elements.find(elem => elem.classList && elem.classList.value && elem.classList.value.includes('main_task'));
    if (!mainTaskDiv) {
      let taskWrapperDiv = elements.find(elem => elem.id == 'task_wrapper_div');
      // console.log('taskWrapperDiv : ', _clone(taskWrapperDiv));
      if (taskWrapperDiv) {
        mainTaskDiv = taskWrapperDiv.childNodes[0];
      } else {
        console.log('handle not availability of both mainTaskDiv and taskWrapperDiv for NEXT');
      }
    }

    // console.log('mainTaskDiv.id for NEXT ********************************************** : ', mainTaskDiv?.id);

    if (mainTaskDiv && mainTaskDiv.id) {
      for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
        for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
          if (this.viewData.multiLevelTasks[i][k].name_id == mainTaskDiv.id) {
            this.nextElem = _clone(this.viewData.multiLevelTasks[i][k]);
            this.nextTaskPositionStats = { x: x, y: y };
            return { i: i, k: k }
          }
        }
      }
    }
    this.nextElem = null;
    this.nextTaskPositionStats = { x: null, y: null };
    return { i: null, k: null };
  }

  addIntegration() {
    this.integrationForm = this.crudSvc.buildIntegrationForm();
    this.integrationFormErrors = this.crudSvc.resetIntegrationFormErrors();
    this.integrationFormValidationMessages = this.crudSvc.integrationFormValidationMessages;
    this.modalRef = this.modalService.show(this.integrationFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmIntegrationAdd() {
    if (this.integrationForm.invalid) {
      this.integrationFormErrors = this.utilSvc.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors);
      this.integrationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.integrationFormErrors = this.utilSvc.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors); });
    } else {
      this.spinner.start('main');
      let activeLine = this.document.getElementsByClassName('leader-line active');
      let activeLineClasses = activeLine.item(0).classList;
      let position = activeLineClasses[1].split('-').getLast();
      this.viewData.tasks[position - 1].targets = this.viewData.tasks[position - 1].targets.filter(t => t != this.viewData.tasks[position]?.name_id);
      this.viewData.tasks.splice(position, 0, this.svc.convertToIntegrationWidgetViewData(this.integrationForm.getRawValue(), this.viewData.tasks[position - 1], this.viewData.tasks[position]))
      this.viewData.tasks[position - 1].targets.push(this.viewData.tasks[position]?.name_id);
      this.modalRef.hide();
      this.spinner.stop('main');
    }
  }

  addWorkFlow() {
    this.workflowForm = this.crudSvc.buildWorkflowForm();
    this.workflowFormErrors = this.crudSvc.resetWorkflowFormErrors();
    this.workflowFormValidationMessages = this.crudSvc.workflowFormValidationMessages;
    this.modalRef = this.modalService.show(this.workflowFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmWorkFlowAdd() {
    if (this.workflowForm.invalid) {
      this.workflowFormErrors = this.utilSvc.validateForm(this.workflowForm, this.workflowFormValidationMessages, this.workflowFormErrors);
      this.workflowForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.workflowFormErrors = this.utilSvc.validateForm(this.workflowForm, this.workflowFormValidationMessages, this.workflowFormErrors); });
    } else {
      this.spinner.start('main');
      let activeLine = this.document.getElementsByClassName('leader-line active');
      let activeLineClasses = activeLine.item(0).classList;
      let position = activeLineClasses[1].split('-').getLast();
      this.viewData.tasks[position - 1].targets = this.viewData.tasks[position - 1].targets.filter(t => t != this.viewData.tasks[position]?.name_id);
      this.viewData.tasks.splice(position, 0, this.svc.convertToWorkflowWidgetViewData(this.workflowForm.getRawValue(), this.viewData.tasks[position - 1], this.viewData.tasks[position]))
      this.viewData.tasks[position - 1].targets.push(this.viewData.tasks[position]?.name_id);
      this.modalRef.hide();
      this.spinner.stop('main');
    }
  }

  addTaskWidget() {
    // console.log('linesTopArray : ', this.linesTopArray);
    this.closeTaskDetails();
    this.taskForm = this.crudSvc.buildTaskForm();
    this.taskFormErrors = this.crudSvc.resetTaskFormErrors();
    this.taskFormValidationMessages = this.crudSvc.taskFormValidationMessages;
    this.modalRef = this.modalService.show(this.taskFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.taskForm.get('task_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.getTasksByCategory(val);
    })
  }

  getTasksByCategory(category: string) {
    this.spinner.start('main');
    this.svc.getTasksByCategory(category).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tasks = res;
      this.availableTasks = _clone(this.tasks);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.tasks = [];
      this.spinner.stop('main');
    })
  }

  editTask(i: number, k: number) {
    this.selectedTaskIndex = { i: i, k: k };
    this.selectedTask = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k];
    if (this.selectedTask.category) {
      this.getTasksByCategory(this.selectedTask.category)
    }
    this.taskForm = this.crudSvc.buildTaskForm(_clone(this.selectedTask));
    this.taskFormErrors = this.crudSvc.resetTaskFormErrors();
    this.taskFormValidationMessages = this.crudSvc.taskFormValidationMessages;
    this.modalRef = this.modalService.show(this.taskFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.taskForm.get('task_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.getTasksByCategory(val);
    })
  }

  checkForTaskExists() {
    let isSelectedTaskExists: boolean = false;
    this.viewData.multiLevelTasks.map(mlt => {
      mlt.map(t => {
        if (t.task == this.taskForm?.getRawValue()?.task?.uuid) {
          isSelectedTaskExists = true;
        }
      })
    })
    return isSelectedTaskExists;
  }

  onSubmitSelectedTask() {
    let taskExists = this.checkForTaskExists();
    if (this.taskForm.invalid || taskExists) {
      this.taskFormErrors = this.utilSvc.validateForm(this.taskForm, this.taskFormValidationMessages, this.taskFormErrors);
      if (taskExists) {
        this.nonFieldErr = 'Selected task is already a part of current workflow. Please select an other one';
      }
      this.taskForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.nonFieldErr = null;
          this.taskFormErrors = this.utilSvc.validateForm(this.taskForm, this.taskFormValidationMessages, this.taskFormErrors);
        });
    } else {
      if (this.selectedTask) {
        this.resetConnectors();
        let existingTask = _clone(this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k]);
        let taskWidget = this.svc.convertToTaskWidgetViewData(this.taskForm.getRawValue());
        if (taskWidget) {
          taskWidget.dependencies = _clone(existingTask.dependencies);
          taskWidget.targets = _clone(existingTask.targets);
          this.viewData.multiLevelTasks.forEach((mlt, i) => {
            mlt.forEach((t, k) => {
              let depIndex = t.dependencies.findIndex(dep => dep == existingTask.name_id);
              if (depIndex != -1) {
                t.dependencies.splice(depIndex, 1, taskWidget.name_id);
              }

              let tgtIndex = t.targets.findIndex(tgt => tgt == existingTask.name_id);
              if (tgtIndex != -1) {
                t.targets.splice(tgtIndex, 1, taskWidget.name_id);
              }
            })
          })
          this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k] = _clone(taskWidget);
          this.updateTaskParams(this.selectedTaskIndex.i, this.selectedTaskIndex.k);
          setTimeout(() => {
            this.setConnectors();
            this.modalRef.hide();
            this.closeAddorEditTask();
          }, 200)
        }
      } else {
        // console.log('this.viewData.multiLevelTasks : ', _clone(this.viewData.multiLevelTasks));
        let prevPosition = _clone(this.getPrevTaskCoordinates());
        // console.log('prevPosition : ', prevPosition);
        let nextPosition = _clone(this.getNextTaskCoordinates());
        // console.log('nextPosition : ', nextPosition);

        let prev = this.viewData.multiLevelTasks[prevPosition.i][prevPosition.k];
        let next = this.viewData.multiLevelTasks[nextPosition.i][nextPosition.k];
        let activeLinePositionStats = _clone(this.activeLinePositionStats);
        let linesTopArray = _clone(this.linesTopArray);
        // console.log('linesTopArray : ', _clone(linesTopArray));
        // console.log('prev : ', _clone(prev));
        // console.log('next : ', _clone(next));

        let taskWidget = this.svc.convertToTaskWidgetViewData(this.taskForm.getRawValue(), prev, next);
        // console.log('taskWidget : ', _clone(taskWidget));

        if (taskWidget) {
          this.resetConnectors();
          prev.targets = prev.targets.filter(t => t != next?.name_id);
          prev.targets.push(taskWidget.name_id);
          // console.log('prev.targets : ', _clone(prev.targets));
          next.dependencies = next.dependencies.filter(t => t != prev?.name_id);
          next.dependencies.push(taskWidget.name_id);
          // console.log('next.dependencies : ', _clone(next.dependencies));

          if (activeLinePositionStats.top < this.prevTaskPositionStats.y && activeLinePositionStats.top < this.nextTaskPositionStats.y) {
            // console.log('linesTopArray : ', linesTopArray);
            if (linesTopArray.length > this.viewData.multiLevelTasks.length) {
              let lineTopIndex = linesTopArray.findIndex(ta => ta == activeLinePositionStats.top);
              this.viewData.multiLevelTasks.splice(lineTopIndex, 0, [].concat(taskWidget));
              this.updateTaskParams(lineTopIndex, 0);
            } else {
              this.viewData.multiLevelTasks[prevPosition.i].splice(prevPosition.k + 1, 0, taskWidget);
              this.updateTaskParams(prevPosition.i, prevPosition.k + 1);
            }
          } else if (activeLinePositionStats.top > this.prevTaskPositionStats.y && activeLinePositionStats.top > this.nextTaskPositionStats.y) {
            if (linesTopArray.length > this.viewData.multiLevelTasks.length) {
              let lineTopIndex = linesTopArray.findIndex(ta => ta == activeLinePositionStats.top);
              this.viewData.multiLevelTasks.splice(lineTopIndex, 0, [].concat(taskWidget));
              this.updateTaskParams(lineTopIndex, 0);
            } else {
              this.viewData.multiLevelTasks[prevPosition.i].splice(prevPosition.k + 1, 0, taskWidget);
              this.updateTaskParams(prevPosition.i, prevPosition.k + 1);
            }
          } else {
            this.viewData.multiLevelTasks[prevPosition.i].splice(prevPosition.k + 1, 0, taskWidget);
            this.updateTaskParams(prevPosition.i, prevPosition.k + 1);
          }

          setTimeout(() => {
            this.setConnectors();
            this.modalRef.hide();
          }, 200)
        }
        // console.log('this.viewData.multiLevelTasks : ', _clone(this.viewData.multiLevelTasks));
      }
    }
  }

  closeAddorEditTask() {
    this.selectedTaskIndex = null;
    this.selectedTask = null;
    this.modalRef.hide();
  }

  updateTaskParams(i: number, k?: number) {
    if (!this.viewData.multiLevelTasks[i][k].inputs) {
      this.viewData.multiLevelTasks[i][k].inputs = [];
    }
    if (!this.viewData.multiLevelTasks[i][k].outputs) {
      this.viewData.multiLevelTasks[i][k].outputs = [];
    }
    this.viewData.multiLevelTasks[i][k].inputForm = this.crudSvc.buildTaskInputForm(_clone(this.viewData.multiLevelTasks[i][k]), _clone(this.taskInputTemplates));
    this.viewData.multiLevelTasks[i][k].outputForm = this.crudSvc.buildTaskOutputForm(_clone(this.viewData.multiLevelTasks[i][k]));
  }

  deleteTask(i: number, k: number) {
    this.selectedTaskIndex = { i: i, k: k };
    this.selectedTask = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k];
    this.modalRef = this.modalService.show(this.confirmDeleteTaskRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmTaskDelete() {
    this.resetConnectors();
    this.viewData.multiLevelTasks[this.selectedTaskIndex.i].splice(this.selectedTaskIndex.k, 1);

    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        let tgi = this.viewData.multiLevelTasks[i][k].targets.findIndex(t => t == this.selectedTask.name_id)
        if (tgi != -1) {
          this.viewData.multiLevelTasks[i][k].targets.splice(tgi, 1);
          this.viewData.multiLevelTasks[i][k].targets = this.viewData.multiLevelTasks[i][k].targets.concat(this.selectedTask.targets);
        }
      }
    }

    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        let dpi = this.viewData.multiLevelTasks[i][k].dependencies.findIndex(d => d == this.selectedTask.name_id)
        if (dpi != -1) {
          this.viewData.multiLevelTasks[i][k].dependencies.splice(dpi, 1);
          this.viewData.multiLevelTasks[i][k].dependencies = this.viewData.multiLevelTasks[i][k].dependencies.concat(this.selectedTask.dependencies);
        }
      }
    }

    // console.log('this.viewData.multiLevelTasks : ', this.viewData.multiLevelTasks);
    setTimeout(() => {
      this.setConnectors();
      this.modalRef.hide();
      this.selectedTaskIndex = null;
      this.selectedTask = null;
    }, 100)
  }

  closeDeleteTask() {
    this.selectedTaskIndex = null;
    this.selectedTask = null;
    this.modalRef.hide();
  }

  viewTaskDetails(i: number, k: number) {
    this.showTaskDetails = true;
    this.selectedTaskIndex = { i: i, k: k };
    this.selectedTask = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k];
    // console.log('this.selectedTask : ', _clone(this.selectedTask));
    console.log('form : ', this.selectedTask.inputForm.getRawValue())
    setTimeout(() => {
      let ele = document.getElementById('task-details-card');
      if (ele) {
        this.renderer.setStyle(ele, "width", '20vw');
        this.renderer.setStyle(ele, "min-height", '60vh');
        this.renderer.setStyle(ele, "background-color", '#fffff');
      }
    }, 100);
  }

  closeTaskDetails() {
    let ele = document.getElementById('task-details-card');
    if (ele) {
      this.renderer.setStyle(ele, "width", '0%');
    }
    this.showTaskDetails = false;
    this.selectedTaskIndex = null;
    this.selectedTask = null;
  }

  saveTaskDetails() {
    // console.log(_clone(this.selectedTask));
    let formInputValue = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k].inputForm.getRawValue();
    let inputs = formInputValue.inputs && formInputValue.inputs.length ? formInputValue.inputs : [];
    for (let i = 0; i < inputs?.length; i++) {
      if (inputs[i] && inputs[i].default_value) {
        let inpIndex = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k].inputs.findIndex(inp => inp.param_name == inputs[i].name);
        if (inpIndex != -1) {
          this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k].inputs[inpIndex].default_value = inputs[i].default_value;
        }
      }
    }

    let formOutputValue = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k].outputForm.getRawValue();
    if (formOutputValue.value) {
      this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k].outputs.push(formOutputValue);
    }
    // console.log('task before : ', _clone(this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k]));
    this.closeTaskDetails();
  }

  addConditionWidget() {
    this.viewData.tasks = _clone([].concat(...this.viewData.multiLevelTasks));
    this.conditionTargetTasks = _clone(this.viewData.tasks);

    let prevPosition = _clone(this.getPrevTaskCoordinates());
    // console.log('prevPosition : ', prevPosition);

    // console.log('prevPosition : ', prevPosition);
    let nextPosition = _clone(this.getNextTaskCoordinates());
    // console.log('nextPosition : ', nextPosition);

    // console.log('nextPosition : ', nextPosition);
    let prev = this.viewData.multiLevelTasks[prevPosition.i][prevPosition.k];
    // console.log('prev : ', prev);
    let next = this.viewData.multiLevelTasks[nextPosition.i][nextPosition.k];
    // console.log('next : ', next);

    this.conditionForm = this.crudSvc.buildConditionForm(prev, next, _clone(this.viewData.tasks));
    this.conditionFormErrors = this.crudSvc.resetConditionFormErrors();
    this.conditionFormValidationMessages = this.crudSvc.conditionFormValidationMessages;
    if (this.conditions?.controls?.length) {
      for (let cI = 0; cI < this.conditions?.controls?.length; cI++) {
        this.conditionFormErrors.conditions.push(this.crudSvc.resetConditionErrors());
        this.subscribeToCondition(this.conditions[cI], cI);
      }
    }
    this.modalRef = this.modalService.show(this.conditionFormRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  get conditions(): FormArray {
    return this.conditionForm.get('conditions') as FormArray;
  }

  addCondition(cI: number) {
    let condition = <FormGroup>this.conditions.at(cI);
    if (condition.invalid) {
      this.conditionFormErrors.conditions[cI] = this.utilSvc.validateForm(condition, this.conditionFormValidationMessages.conditions, this.conditionFormErrors.conditions[cI]);
      condition.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.conditionFormErrors.conditions[cI] = this.utilSvc.validateForm(condition, this.conditionFormValidationMessages.conditions, this.conditionFormErrors.conditions[cI]);
      });
    } else {
      let prevPosition = _clone(this.getPrevTaskCoordinates());
      let sourceTask = this.viewData.multiLevelTasks[prevPosition.i][prevPosition.k];
      let newCondition = this.builder.group({
        'source_task': [{ value: sourceTask ? sourceTask.name_id : '', disabled: true }, [Validators.required]],
        'output_parameter': [''],
        'operator': ['', [Validators.required]],
        'value': ['', [Validators.required]],
        'target_task': [null, [Validators.required]],
        'condition_new_task': [null]
      })
      this.conditionFormErrors.conditions.push(this.crudSvc.resetConditionErrors());
      this.conditions.push(newCondition);
      this.subscribeToCondition(newCondition, cI + 1);
    }
  }

  subscribeToCondition(condition: FormGroup, conditionIndex: number) {
    if (condition) {
      condition.get('target_task').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        if (val == 'new__task') {
          this.taskForm = this.crudSvc.buildTaskForm();
          this.taskFormErrors = this.crudSvc.resetTaskFormErrors();
          this.taskFormValidationMessages = this.crudSvc.taskFormValidationMessages;
          this.taskForm.get('task_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
            this.getTasksByCategory(val);
          })
          this.addNewTaskAtIndex = conditionIndex;
        } else {
          // called when any other is selected aprt from new task
          this.cancelNewTask();
        }
      });
    }
  }

  updatedConditionTargetTasks(index: number) {
    let conditions = _clone(this.conditions.getRawValue());
    let arr2 = [];
    arr2.push('start');
    arr2.push(conditions[0].source_task);
    for (let i = 0; i < conditions.length; i++) {
      if (i == index) {
        continue;
      } else {
        arr2.push(conditions[i].target_task);
      }
    }
    // console.log('arr2 : ', arr2);
    let unique1 = this.conditionTargetTasks.filter((o) => arr2.indexOf(o.name_id) === -1);
    return unique1;
  }

  cancelNewTask() {
    this.addNewTaskAtIndex = 0;
    this.taskForm = null;
    this.taskFormErrors = null;
    this.taskFormValidationMessages = null;
  }

  addNewTaskToCondition() {
    if (this.taskForm.invalid) {
      this.taskFormErrors = this.utilSvc.validateForm(this.taskForm, this.taskFormValidationMessages, this.taskFormErrors);
      this.taskForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.taskFormErrors = this.utilSvc.validateForm(this.taskForm, this.taskFormValidationMessages, this.taskFormErrors); });
    } else {
      if (this.addNewTaskAtIndex) {
        let addNewTaskAtIndex = _clone(this.addNewTaskAtIndex);
        let newTask = this.svc.convertToTaskWidgetViewData(this.taskForm.getRawValue());
        // console.log('newTask : ', newTask);
        if (newTask) {
          this.conditions.at(addNewTaskAtIndex).get('condition_new_task').setValue(_clone(newTask));
          // console.log('this.addNewTaskAtIndex before append1: ', addNewTaskAtIndex);
          this.conditions.at(addNewTaskAtIndex).get('target_task').setValue(newTask.name_id, {});
          // console.log('this.addNewTaskAtIndex before append2: ', addNewTaskAtIndex);
          this.conditionTargetTasks.push(newTask);
        }
        this.cancelNewTask();
      }
      // console.log('this.conditions? value : ', this.conditions?.getRawValue());
    }
  }

  removeCondition(i: number) {
    this.conditions.removeAt(i);
    this.conditionFormErrors.conditions.splice(i, 1);
  }

  onSubmitSelectedCondition() {
    if (this.conditionForm.invalid) {
      this.conditionFormErrors = this.utilSvc.validateForm(this.conditionForm, this.conditionFormValidationMessages, this.conditionFormErrors);
      this.conditionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.conditionFormErrors = this.utilSvc.validateForm(this.conditionForm, this.conditionFormValidationMessages, this.conditionFormErrors); });
    } else {
      // console.log('this.viewData.multiLevelTasks : ', _clone(this.viewData.multiLevelTasks));
      let prevPosition = _clone(this.getPrevTaskCoordinates());
      // console.log('prevPosition : ', prevPosition);
      let nextPosition = _clone(this.getNextTaskCoordinates());
      // console.log('nextPosition : ', nextPosition);
      let prev = this.viewData.multiLevelTasks[prevPosition.i][prevPosition.k];
      // console.log('prev : ', prev);
      let next = this.viewData.multiLevelTasks[nextPosition.i][nextPosition.k];
      // console.log('next : ', next);
      let conditionWidget = this.svc.convertToConditionWidgetViewData(this.conditionForm.getRawValue(), prev, next);
      // console.log('conditionWidget : ', conditionWidget);
      if (conditionWidget) {
        this.resetConnectors();
        //adding condition
        // Removing Targets & Dependencies for before and after tasks
        prev.targets = prev.targets.filter(t => t != next?.name_id);
        prev.targets.push(conditionWidget.name_id);
        next.dependencies = next.dependencies.filter(t => t != prev?.name_id);
        next.dependencies.push(conditionWidget.name_id);
        //Pushing new task
        this.viewData.multiLevelTasks[prevPosition.i].splice(prevPosition.k + 1, 0, conditionWidget);

        //adding new tasks from condition array to viewdata tasks array
        for (let i = 0; i < this.conditions?.length; i++) {
          // console.log('******************************** at index : ', i);
          let condition = this.conditions.at(i);
          // console.log('condition : ', condition.get('condition_new_task').value);

          if (i) {
            let newTask = <UnityWorkflowTasksViewData>condition.get('condition_new_task').value;
            // console.log('newTask : ', _clone(newTask));

            if (newTask) {
              newTask.dependencies.push(conditionWidget.name_id);
              newTask.targets.push(conditionWidget.targets.getFirst());

              //add dependancy in newtask's target node
              for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
                for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
                  if (this.viewData.multiLevelTasks[i][k].name_id == conditionWidget.targets.getFirst()) {
                    this.viewData.multiLevelTasks[i][k].dependencies.push(newTask.name_id);
                  }
                }
              }

              if (i == 1) {
                this.viewData.multiLevelTasks.splice(0, 0, [].concat(newTask))
              } else if (i == 2) {
                this.viewData.multiLevelTasks.splice(this.viewData.multiLevelTasks.length, 0, [].concat(newTask))
              }
            } else {
              this.viewData.multiLevelTasks.forEach(mlt => {
                let existingTargetTaskIndex = mlt.findIndex(t => t.name_id == condition.get('target_task').value);
                if (existingTargetTaskIndex != -1) {
                  mlt[existingTargetTaskIndex].dependencies.push(conditionWidget.name_id);
                }
              })
            }
          }
        }
        // console.log('this.viewData.multiLevelTasks : ', _clone(this.viewData.multiLevelTasks));

        setTimeout(() => {
          this.setConnectors();
          this.modalRef.hide();
        }, 1000)
      }
    }
  }

  deleteCondition(i: number, k: number) {
    this.selectedTaskIndex = { i: i, k: k };
    this.selectedTask = this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k];
    this.modalRef = this.modalService.show(this.confirmDeleteConditionRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  getTaskIndexInViewData(taskNameId: string) {
    let mltIndex: { i: number, k: number } = { i: - 1, k: -1 };
    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        if (this.viewData.multiLevelTasks[i][k].name_id == taskNameId) {
          mltIndex = { i: i, k: k };
        }
      }
    }
    return mltIndex;
  }

  removeSelectedTargetFromAllNodes(targetName: string) {
    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        this.viewData.multiLevelTasks[i][k].targets = this.viewData.multiLevelTasks[i][k].targets.filter(t => t != targetName);
      }
    }
  }

  removeSelectedDependencyFromAllNodes(dependencyName: string) {
    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        this.viewData.multiLevelTasks[i][k].dependencies = this.viewData.multiLevelTasks[i][k].dependencies.filter(t => t != dependencyName);
      }
    }
  }

  isSoletarget(targetName: string) {
    for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
      for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
        let targetExists = this.viewData.multiLevelTasks[i][k].targets.find(t => t == targetName);
        if (targetExists) {
          return false;
        }
      }
    }
    return true;
  }

  currentTargetNode: UnityWorkflowTasksViewData;
  manageCurrentNodeRemoved(taskNameId: string) {
    // console.log('in manageCurrentNodeRemoved with taskNameId : ', taskNameId);
    let targetNodeIndex = this.getTaskIndexInViewData(taskNameId);
    if (targetNodeIndex.i != -1 && targetNodeIndex.k != -1) {
      let targetNode = this.viewData.multiLevelTasks[targetNodeIndex.i][targetNodeIndex.k];
      if (targetNode.type == unityWorkflowTaskTypes.CONDITION) {
        this.currentTargetNode = _clone(targetNode);
        this.conditionsInPath.push(targetNode);
        this.manageConditionsInpath(targetNodeIndex);
      } else {
        if (targetNode.dependencies.length == 1) {
          this.currentTargetNode = _clone(targetNode);
          this.viewData.multiLevelTasks[targetNodeIndex.i].splice(targetNodeIndex.k, 1);
          this.removeSelectedTargetFromAllNodes(targetNode.name_id);
          this.removeSelectedDependencyFromAllNodes(targetNode.name_id);
          // console.log(`after internal delete : `, _clone(this.viewData));
          if (this.currentTargetNode.targets.length) {
            // Generally every task will have only one target
            if (this.isSoletarget(this.currentTargetNode.targets.getFirst())) {
              this.manageCurrentNodeRemoved(this.currentTargetNode.targets.getFirst());
            }
          }
        } else {
          targetNode.dependencies = targetNode.dependencies.filter(d => d != this.currentTargetNode.name_id);
          // console.log(`after internal update of dependancies : `, _clone(this.viewData));

          if (targetNode.targets.length) {
            // Generally every task will have only one target
            this.manageCurrentNodeRemoved(this.currentTargetNode.targets.getFirst());
          }
        }
      }
    }
  }

  conditionsInPath: UnityWorkflowTasksViewData[] = [];
  manageConditionsInpath(index: { i: number, k: number }) {
    let currentCondition = this.conditionsInPath.getLast();
    this.currentTargetNode = _clone(currentCondition);
    for (let i = 0; i < currentCondition.conditions.length; i++) {
      // console.log('i ********************************************** : ', i);
      if (i) {
        // console.log('calling manageCurrentNodeRemoved with : ', currentCondition.conditions[i].execute);
        this.manageCurrentNodeRemoved(currentCondition.conditions[i].execute);
        // console.log(`after ${i}th condition manage : `, _clone(this.viewData));
      } else {
        // console.log('managing 0th condition');
        let currentConditionSourceNameId = currentCondition.conditions[i].expression.key.split('.')[1];
        let currentConditionTargetNameId = currentCondition.conditions[i].execute;
        let sourceTaskIndex = this.getTaskIndexInViewData(currentConditionSourceNameId);
        let targetTaskIndex = this.getTaskIndexInViewData(currentConditionTargetNameId);

        if (sourceTaskIndex.i != -1 && sourceTaskIndex.k != -1) {
          let currentConditionTargetIndex = this.viewData.multiLevelTasks[sourceTaskIndex.i][sourceTaskIndex.k].targets.findIndex(t => t == currentCondition.name_id);
          if (currentConditionTargetIndex != -1) {
            this.viewData.multiLevelTasks[sourceTaskIndex.i][sourceTaskIndex.k].targets.splice(currentConditionTargetIndex, 1, currentConditionTargetNameId);
          }
        }

        if (targetTaskIndex.i != -1 && targetTaskIndex.k != -1) {
          let currentConditionDepIndex = this.viewData.multiLevelTasks[targetTaskIndex.i][targetTaskIndex.k].dependencies.findIndex(d => d == currentCondition.name_id);
          if (currentConditionDepIndex != -1) {
            this.viewData.multiLevelTasks[targetTaskIndex.i][targetTaskIndex.k].dependencies.splice(currentConditionDepIndex, 1, currentConditionSourceNameId);
          }
        }
        // console.log('after 0th condition manage : ', _clone(this.viewData));
      }
    }
    this.viewData.multiLevelTasks[index.i].splice(index.k, 1);
  }

  confirmConditionDelete() {
    this.resetConnectors();
    let currentCondition = _clone(this.viewData.multiLevelTasks[this.selectedTaskIndex.i][this.selectedTaskIndex.k]);
    this.conditionsInPath.push(currentCondition);
    this.manageConditionsInpath(_clone(this.selectedTaskIndex));

    // console.log('final after delete : ', _clone(this.viewData.multiLevelTasks));
    setTimeout(() => {
      this.setConnectors();
      this.modalRef.hide();
      this.selectedTaskIndex = null;
      this.selectedTask = null;
    }, 100)
  }

  closeDeleteCondition() {
    this.selectedTaskIndex = null;
    this.selectedTask = null;
    this.modalRef.hide();
  }

  saveWorkFlow() {
    // this.notification.success(new Notification('Workflow save Initiated.'));
    let workFlowId = this.workFlowId || (this.viewData && this.viewData.id)
    // console.log('workFlowId : ', workFlowId);
    let obj = _clone(this.viewData);
    obj.tasks = [].concat(...obj.multiLevelTasks);
    if (obj.tasks.length < 3) {
      this.notification.warning(new Notification('None of the tasks added to the workflow.'));
      return;
    }
    if (workFlowId) {
      this.svc.saveWorkFlow(obj, workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData.isInProgress = true;
        this.manageCeleryTaskData(workFlowId, this.viewData.workflow_name, res.task_id);
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to save workflow. Tryagain later.'));
      });
    } else {
      this.svc.saveWorkFlow(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData.isInProgress = true;
        this.manageCeleryTaskData(workFlowId, this.viewData.workflow_name, res.task_id);
      }, (err: HttpErrorResponse) => {
        // console.log('err : ', err);
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to save workflow. Tryagain later.'));
      });
    }
  }

  manageCeleryTaskData(workFlowId: string, workFlowName: string, taskId: string) {
    let workFlowInProgress = this.svc.convertToEntityTaskRelation(workFlowId, workFlowName, taskId);
    if (workFlowInProgress) {
      let workflowTaskIndex = this.workflowsInProgress.findIndex(wp => wp.taskId == workFlowInProgress.taskId);
      if (workflowTaskIndex == -1) {
        this.workflowsInProgress.push(workFlowInProgress);
      }
      // else {
      //   this.workflowsInProgress.splice(workflowTaskIndex, 1, workFlowInProgress);
      // }
      // console.log('before save this.workflowsInProgress : ', this.workflowsInProgress);
      this.storage.put('workflowsInProgress', _clone(this.workflowsInProgress), StorageType.SESSIONSTORAGE);
    }
    this.goBack();
  }

  pollToSaveWorkflow(workFlowId: string, workFlowName: string, taskId: string) {
    this.svc.pollByTaskId(_clone(taskId)).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let workflowTaskIndex = this.workflowsInProgress.findIndex(wp => wp.taskId == taskId);
      this.viewData.isInProgress = false;
      if (workflowTaskIndex != -1) {
        this.workflowsInProgress.splice(workflowTaskIndex, 1);
      }
      this.storage.put('workflowsInProgress', _clone(this.workflowsInProgress), StorageType.SESSIONSTORAGE);
      this.resetConnectors();
      // this.viewData = this.svc.convertToViewData(res);
      for (let i = 0; i < this.viewData.multiLevelTasks.length; i++) {
        for (let k = 0; k < this.viewData.multiLevelTasks[i].length; k++) {
          let tasksWithNoParams = this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.START ||
            this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.END ||
            this.viewData.multiLevelTasks[i][k].type == unityWorkflowTaskTypes.CONDITION;
          if (tasksWithNoParams) {
            continue;
          }
          this.updateTaskParams(i, k);
        }
      }
      this.setConnectors();
      this.notification.success(new Notification('Workflow saved.'));
    }, (err: HttpErrorResponse) => {
      console.log('err : ', err);
      this.viewData.isInProgress = false;
      this.notification.error(new Notification('Failed to save workflow. Tryagain later.'));
    })
  }

  goBack() {
    if (this.workFlowId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
