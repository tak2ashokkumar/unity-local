import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { from, Subject } from 'rxjs';
import { Categories, HistoryViewData, ListSummaryViewModel, OrchestrationWorkflowsService, WorkflowViewData } from './orchestration-workflows.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ListSummaryResModel, UnityWorkflow } from './orchestration-workflows.type';
import { CeleryTask, EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { OrchestrationWorkflowCrudComponent } from './orchestration-workflow-crud/orchestration-workflow-crud.component';
import { OrchestrationWorkflowCrudService } from './orchestration-workflow-crud/orchestration-workflow-crud.service';
import { cloneDeep as _clone } from 'lodash-es';
import { AppMainService } from 'src/app/app-main/app-main.service';
import { UnityChatbotService } from 'src/app/unity-chatbot/unity-chatbot.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'orchestration-workflows',
  templateUrl: './orchestration-workflows.component.html',
  styleUrls: ['./orchestration-workflows.component.scss'],
  providers: [OrchestrationWorkflowsService, OrchestrationWorkflowCrudService]
})
export class OrchestrationWorkflowsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;

  summaryViewData: ListSummaryViewModel;
  viewData: WorkflowViewData[] = [];
  workflowUuid: string;
  taskModalRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  workflowDeleteModalRef: BsModalRef;
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

  ngOnInit(): void {
    this.spinner.start('main');
    document.addEventListener('click', (event) => this.closeDropdown(event));
    this.workflowsInProgress = this.storage.getByKey('workflowsInProgress', StorageType.SESSIONSTORAGE);
    console.log(this.workflowsInProgress, "workflow In progress")
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
    // console.log('in oninit this.workflowsInProgress : ', this.workflowsInProgress);
    this.getSummary();
    this.getWorkflowList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ category: null, workflow_status: null }] };
    this.getWorkflowList();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getWorkflowList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getWorkflowList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getWorkflowList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getWorkflowList();
  }

  onFilterChange() {
    this.spinner.start('main');
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
      // this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Workflow Summary'));
      this.spinner.stop('main');
    });
  }

  getWorkflowList() {
    this.svc.getWorkflowList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.isAgentic = this.viewData.some(v => v.is_agentic);
      // for (const d of this.viewData) {
      //   if (d.isCreated) {
      //     let workflowTaskIndex = this.workflowsInProgress.findIndex(wip => wip.entityId ? (wip.entityId == d.uuid) : (wip.entityName == d.name));
      //     if (workflowTaskIndex != -1) {
      //       this.workflowsInProgress.splice(workflowTaskIndex, 1);
      //     }
      //   }
      // }
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
      // if (this.workflowsInProgress.length) {
      //   this.storage.put('workflowsInProgress', this.workflowsInProgress, StorageType.SESSIONSTORAGE);
      //   for (const d of this.workflowsInProgress) {
      //     this.pollToSaveWorkflow(d.taskId);
      //   }
      // } else {
      //   this.storage.removeByKey('workflowsInProgress', StorageType.SESSIONSTORAGE);
      // }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to get Workflows'));
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
      console.log('>>>>>>>>>>>', this.viewData);
      this.notification.success(new Notification('Workflow saved.'));
      this.svc.getWorkflowList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewData(data.results);
      });
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to save workflow. Tryagain later.'));
    })
  }


  addWorkflow() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  newWorkflow() {
    this.router.navigate(['new-workflow'], { relativeTo: this.route });
  }

  openAgentic() {
    this.router.navigate(['agentic-workflow'], { relativeTo: this.route })
  }

  toggleStatus(index: number, status: boolean) {
    // this.spinner.start('main');
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
    // use view.is_agentic flag and view.trigger_type = "Manual Trigger" / "Schedule Trigger" / "Chat Trigger"
    // to route to different components else below execute route.
    if (view.is_agentic && view.trigger_type === "Manual Trigger") {
      this.router.navigate([view.uuid, 'manual-trigger'], { relativeTo: this.route });
    } else if (view.is_agentic && view.trigger_type === "Schedule Trigger") {
      this.router.navigate([view.uuid, 'schedule-trigger'], { relativeTo: this.route });
    } else if (view.is_agentic && view.trigger_type === "Chat Trigger") {
      this.chatbotSvc.onChatTrigger$.next(true);
      this.appService.$assistantData.next({ sourceName: 'workflow', apiUrl: `/rest/orchestration/agentic_workflow/${view.uuid}/chat/`, entityId: view.uuid, entity: view.name });
      // this.router.navigate([view.uuid, 'on-chat'], { relativeTo: this.route });
    } else if (view.is_agentic && view.trigger_type === "Webhook Trigger") {
      this.router.navigate([view.uuid, 'webhook-trigger'], { relativeTo: this.route });
    } else if (view.is_agentic && view.trigger_type === "ITSM Event Trigger") {
      this.router.navigate([view.uuid, 'itsm-trigger'], { relativeTo: this.route });
    } else if (view.is_agentic && view.trigger_type === "AIML Event Trigger") {
      this.router.navigate([view.uuid, 'aiml-trigger'], { relativeTo: this.route });
    } else {
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
      this.router.navigate(['agentic-workflow', task.uuid, 'edit'], { relativeTo: this.route });
    } else {
      this.router.navigate([task.uuid, 'edit'], { relativeTo: this.route });
    }
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
    this.workflowDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
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
      // else {
      //   this.workflowsInProgress.splice(workflowTaskIndex, 1, workFlowInProgress);
      // }
      // console.log('before save this.workflowsInProgress : ', this.workflowsInProgress);
      this.storage.put('workflowsInProgress', _clone(this.workflowsInProgress), StorageType.SESSIONSTORAGE);
    }
  }
}
