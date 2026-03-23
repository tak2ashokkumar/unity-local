import { DOCUMENT } from '@angular/common';
import { Component, AfterViewInit, ViewEncapsulation, Inject, Renderer2, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import Drawflow from 'drawflow';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { CategoryViewData, ConditionArrayModel, DrawflowNode, InputParamsType, NodeDataModel, OrchestrationTaskType, OrchestrationWorkflowMetadata, OutputArrayModel, SourceTaskArrayModel, SourceTaskDetailsViewData, TaskArrayModel, TaskDetailsModel, TaskDetailsViewData, TaskNode, UnityWorkflowViewData } from './orchestration-workflow-poc.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { conditionOperators, OrchestrationWorkflowCrudUtilsService } from '../orchestration-workflow-crud/orchestration-workflow-crud.utils.service';
import { ActivatedRoute, ParamMap, Route, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { config } from 'process';
import { inputTemplateType } from '../../orchestration-tasks/orchestration-tasks-crud/orchestration-tasks-crud.type';
import { EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { playbookTypes } from '../../orchestration-tasks/orchestration-tasks.service';
import { OrchestrationWorkflowPocService, scriptParamDataTypes } from './orchestration-workflow-poc.service';
import { EventsFilterFormData } from 'src/app/unity-services/aiml-event-mgmt/aiml-events/aiml-events.service';
import { ChatHistoryData } from 'src/app/unity-chatbot/unity-chatbot.type';
import { dependencies } from 'echarts';

@Component({
  selector: 'orchestration-workflow-poc',
  templateUrl: './orchestration-workflow-poc.component.html',
  styleUrls: ['./orchestration-workflow-poc.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrchestrationWorkflowPocComponent implements OnInit, OnDestroy {


  //**** Left Panel Variables Start *****//

  isOpen = false;
  isOpenTasks: { [key: string]: boolean } = {};
  isOpenCondition = false;
  isOpenOutput = false;
  isOpenLLM = false;
  autoOpenTasks: { [key: string]: boolean } = {};
  autoOpenCondition: boolean = false;
  autoOpenOutput: boolean = false;
  autoOpenLLM: boolean = false;
  categoryList: CategoryViewData[];
  conditionList = [
    { condition: 'If Else', icon: `${environment.assetsUrl}external-brand/logos/If_else.svg` },
    { condition: 'Switch Case', icon: `${environment.assetsUrl}external-brand/logos/switch.svg` }
  ];
  outputList = [
    { output: 'Email', icon: 'fas fa-envelope' },
    { output: 'Chart', icon: 'fas fa-chart-pie' }
  ]; j
  llmList = [
    { block: 'LLM', icon: `${environment.assetsUrl}external-brand/logos/stars.svg` }
  ]
  askAIIcon = `${environment.assetsUrl}Ask_AI.svg`;
  searchQuery: string = ''
  filteredCategoryList = [];
  filteredConditionList = [];
  filteredOutputList = [];
  filteredLLMList = [];
  filteredSourceTaskList = [];

  isOpenSource = false;
  isOpenSourceTasks: { [key: string]: boolean } = {};
  autoOpenSourceTasks: { [key: string]: boolean } = {};
  //**** Left Panel Variables End *****//


  //******* Workflow Variables Start ******* //

  workFlowViewData: UnityWorkflowViewData;
  workflowMetadata: OrchestrationWorkflowMetadata;
  @ViewChild('workflowDetailsFormRef') workflowDetailsFormRef: ElementRef;
  workflowDetailsForm: FormGroup;
  workflowDetailsFormErrors: any;
  workflowDetailsFormValidationMessages: any;
  workflowParamsForm: FormGroup;
  showWorkFlowParams: boolean = false;
  isOpenWorkflowParamDetails: boolean = false;
  isOpenWorkflowParameters: boolean = false;

  showWorkParams = false;

  //******* Workflow Variables End  ******* //

  private ngUnsubscribe = new Subject();
  editor: Drawflow;
  isRightSidebarOpen = false;
  currentCriteria: SearchCriteria;
  viewData: TaskDetailsViewData[];
  modalRef: BsModalRef;
  zoomOptions = [
    { label: '200%', value: 2 },
    { label: '175%', value: 1.75 },
    { label: '150%', value: 1.5 },
    { label: '125%', value: 1.25 },
    { label: '100%', value: 1 },
    { label: '75%', value: 0.75 },
    { label: '50%', value: 0.5 },
    { label: '25%', value: 0.25 }
  ];
  zoomLevel: number = 100; // Default zoom level
  canvasScale: number = 1; // Actual scale for transformations
  showTaskDetails: boolean = false;
  tasksByCategory: TaskDetailsModel;
  selectedCategory: string;
  selectedTask: TaskArrayModel;
  selectedTaskImg: string;
  // taskFormGroup: FormGroup;
  isOpenTaskName: boolean = false;
  isOpenIfConditionName: boolean = false;
  isOpenSwitchConditionName: boolean = false;
  isOpenInputParam: boolean = false;
  isOpenOutputParam: boolean = false;
  isOpenTriggerRule: boolean = false;
  isOpenConfiguration: boolean = false;
  taskInputTemplates = [];
  triggerRules = [
    {
      name: 'All Success',
      value: 'all_success'
    },
    {
      name: 'All Failed',
      value: 'all_failed'
    },
    {
      name: 'All Done',
      value: 'all_done'
    },
    {
      name: 'All Skipped',
      value: 'all_skipped'
    },
    {
      name: 'One Failed',
      value: 'one_failed'
    },
    {
      name: 'One Success',
      value: 'one_success'
    },
    {
      name: 'One Done',
      value: 'one_done'
    },
    {
      name: 'None Failed',
      value: 'none_failed'
    },
    {
      name: 'None Failed Min One Success',
      value: 'none_failed_min_one_success'
    }, {
      name: 'None Skipped',
      value: 'none_skipped'
    },
    {
      name: 'Always',
      value: 'always'
    }
  ];
  saveDrawflowData: any;
  private selectedNode: HTMLElement | null = null;
  private selectedIfConditionNode: HTMLElement | null = null;
  private selectedSwitchConditionNode: HTMLElement | null = null;
  private selectedEmailNode: HTMLElement | null = null;
  private selectedLLMNode: HTMLElement | null = null;
  private selectedChartNode: HTMLElement | null = null;
  taskCounter = 1;
  conditionCounter = 1;
  outputCounter = 2;
  nodeCounter = 0;
  taskDetailsArr = [];
  latestDroppedTask = null;
  latestDroppedCondition = null;
  latestDroppedOutput = null;
  latestDroppedLLM = null;
  conditionArr = [];
  selectedCondition;
  showIfConditionDetails: boolean = false;
  showSwitchConditionDetails: boolean = false;
  isOpenConditions: boolean = false;
  conditionOperators: Array<{ label: string, value: string }> = conditionOperators;
  paramDropList = [];
  connectionList = [];
  workFlowId: string;
  workFlowData;
  noOfOutputNode: number;
  suggestions = []; // Example suggestions
  filteredSuggestions: string[] = [];
  showDropdownIndex: number | null = null;
  dropdownPositions = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
  ];
  positionX;
  positionY;
  selectedNodeId;
  paramDataTypes: string[] = scriptParamDataTypes;
  attributeList: string[][] = [[]];
  formErrors: any;
  dropdownPosition = { top: '0px', left: '0px', right: '0px' };
  workflowsInProgress: EntityTaskRelation[] = [];
  targetTypeOptions: string[] = [];
  outputArr = [];
  selectedOutput;
  showEmailOutputDetails: boolean = false;
  isOpenEmailName: boolean = false;
  isOpenEmailDetails: boolean = false;
  showChartOutputDetails: boolean = false;
  isOpenChartName: boolean = false;
  isOpenChartDetails: boolean = false;

  sourceCategoryList: CategoryViewData[];
  filteredSourceCategoryList = [];
  private selectedSourceTaskNode: HTMLElement | null = null;
  selectedSourceCategory: string;
  selectedSourceTask: SourceTaskArrayModel;
  selectedSourceTaskImg: string;
  // taskFormGroup: FormGroup;
  isOpenSourceTaskName: boolean = false;
  isOpenSourceTaskInputParam: boolean = false;
  isOpenSourceTaskOutputParam: boolean = false;
  isOpenSourceTaskTriggerRule: boolean = false;
  isOpenSourceTaskConfiguration: boolean = false;
  sourceTaskDetailsArr = [];
  showSourceTaskDetails: boolean = false;
  selectedSourceTaskDetails: TaskDetailsModel;
  latestDroppedSourceTask = null;


  llmArr = [];
  selectedLLM;
  showLLMDetails: boolean = false;
  isOpenLLMName: boolean = false;
  isOpenLLMProperties: boolean = false;
  isOpenLLMOutputParam: boolean = false;

  newTaskId = 2;
  formattedTask = [];

  currentNodeId: number;
  assistantImageURL: string = `${environment.assetsUrl}external-brand/logos/Chatbot_Logo.svg`;
  queries = ['What is the average execution time of tasks?', 'What are the most recent failed executions?'];
  assistantForm: FormGroup;
  isTyping: boolean = false;
  shouldScroll: boolean = false;
  resetThread: boolean = false;
  chatHistoryData: Array<ChatHistoryData> = [];
  showWorkflowAssistant = false;

  // llmResponse = {
  //   "status": "success",
  //   "message": "This workflow provisions a VM in Azure, checks the OS type, installs the appropriate Zabbix agent based on the OS, and sends an email with the results.",
  //   "tasks": [
  //     {
  //       "id": "task-1",
  //       "uuid": "fb416c99-6153-43c2-ae4f-589c91c80329",
  //       "name": "Azure Windows VM Provisioning",
  //       "type": "Terraform Script",
  //       "next": "task-2"
  //     },
  //     {
  //       "id": "task-2",
  //       "type": "Switch Case",
  //       "name": "Switch 1",
  //       "config": [
  //         { "case": "Windows", "next": "task-3" },
  //         { "case": "Ubuntu", "next": "task-4" },
  //         { "case": "CentOS", "next": "task-5" }
  //       ]
  //     },
  //     {
  //       "id": "task-3",
  //       "uuid": "9e0466ed-4d4d-4b39-b258-1a1b68e56ac0",
  //       "name": "Install Zabbix Agent - Windows",
  //       "type": "Ansible Playbook",
  //       "next": "task-6"
  //     },
  //     {
  //       "id": "task-4",
  //       "uuid": "d4529b45-e21d-436e-a967-06ac1a8cc30e",
  //       "name": "Install Zabbix Agent - Ubuntu",
  //       "type": "Ansible Playbook",
  //       "next": "task-6"
  //     },
  //     {
  //       "id": "task-5",
  //       "name": "Charts 2",
  //       "type": "Chart Task",
  //       "next": "task-6"
  //     },
  //     {
  //       "id": "task-6",
  //       "name": "Send Results LLM",
  //       "type": "LLM Task",
  //       "next": null
  //     }
  //   ]
  // }

  llmResponse;
  tasksResp = [];

  constructor(
    @Inject(DOCUMENT) private document,
    private renderer: Renderer2,
    private svc: OrchestrationWorkflowPocService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService,
    private modalService: BsModalService,
    private crudSvc: OrchestrationWorkflowCrudUtilsService,
    private router: Router,
    private route: ActivatedRoute,
    private builder: FormBuilder,
    private storage: StorageService,
  ) {
    this.currentCriteria = { searchValue: '', pageSize: 0 };
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workFlowId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.minimizeLeftPanel();
    const container = document.getElementById('drawflow') as HTMLElement;
    this.editor = new Drawflow(container);
    this.editor.removeNodeId = function (id) {
      if (id === 'node-1' || id === 'node-2') {
        return;
      }
      this.removeConnectionNodeId(id);
      var moduleName = this.getModuleFromNodeId(id.slice(5))
      if (this.module === moduleName) {
        document.getElementById(id).remove();
      }
      delete this.drawflow.drawflow[moduleName].data[id.slice(5)];
      this.dispatch('nodeRemoved', id.slice(5));
    }
    this.editor.start();
    this.editor.curvature = 0.5;
    // this.editor.reroute_curvature_start_end = 0;
    // this.editor.reroute_curvature = 0;
    // this.editor.createCurvature = function (start_pos_x, start_pos_y, end_pos_x, end_pos_y, curvature_value) {
    //   var center_x = ((end_pos_x - start_pos_x) / 2) + start_pos_x;
    //   return ' M ' + start_pos_x + ' ' + start_pos_y + ' L ' + center_x + ' ' + start_pos_y + ' L ' + center_x + ' ' + end_pos_y + ' L ' + end_pos_x + ' ' + end_pos_y;
    // };
    this.editor.force_first_input = true;
    this.getMetadata();
    this.getTaskInputTemplates();
    this.getTaskData();
    this.getSourceTasksByCategory();
    this.manageWorkflowDetails();
    if (this.workFlowId && this.taskInputTemplates) {
      this.getWorkflowDetails();

      // Load your flowchart
      // const drawflowData = this.generateDrawflowStructure(this.formattedTask); // from previous function
      // this.editor.import(drawflowData);
    }
  }

  ngOnDestroy() {
    this.maximizeLeftPanel();
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }



  // ******************************************** Left Side panel code Start ************************************************ //
  /*
    - Used to toggle Categories
  */
  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  /*
    - Used to toggle Tasks inside each category
  */
  toggleTaskAccordion(category: string) {
    this.isOpenTasks[category] = !this.isOpenTasks[category];
    this.autoOpenTasks[category] = !this.autoOpenTasks[category];
  }

  toggleRightPanelInsideConditionsAccordion() {
    this.isOpenConditions = !this.isOpenConditions;
  }

  /*
    - Used to toggle Conditions
  */
  toggleConditionAccordion() {
    this.isOpenCondition = !this.isOpenCondition;
    this.autoOpenCondition = !this.autoOpenCondition;
  }

  /*
    - Used to toggle Outputs
  */
  toggleOutputAccordion() {
    this.isOpenOutput = !this.isOpenOutput;
  }

  /*
    - Used to toggle LLM
  */
  toggleLLMAccordion() {
    this.isOpenLLM = !this.isOpenLLM;
  }

  /*
    - Below method gets the categorywise tasks for the left Panel.
    - The conditionList and OutputList are hard-coded and initialized in class level at the top.
    - The filteredCategoryList, filteredConditionList and filteredOutputList are secondary variables 
      used to store the filtered list after search.
  */
  getTaskData() {
    this.svc.getData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.categoryList = this.svc.convertToViewData(data);
      this.filteredCategoryList = [...this.categoryList];
      this.filteredConditionList = [...this.conditionList];
      this.filteredOutputList = [...this.outputList];
      this.filteredLLMList = [...this.llmList];
      this.spinner.stop('main');

    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  getSourceTasksByCategory() {
    this.svc.getSourcetaskByCategory().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.sourceCategoryList = this.svc.convertToSourceTaskViewData(data);
      this.filteredSourceCategoryList = [...this.sourceCategoryList];
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  /*
    - Used to toggle Sources accordion
  */
  toggleSourcesAccordion() {
    this.isOpenSource = !this.isOpenSource;
  }

  /*
    - Used to toggle Source Tasks inside each category
  */
  toggleSourceTaskAccordion(category: string) {
    this.isOpenSourceTasks[category] = !this.isOpenSourceTasks[category];
    this.autoOpenSourceTasks[category] = !this.autoOpenSourceTasks[category];
  }

  /*
    Below method is triggered when we type something in the search box.
  */
  onSearched(event: string) {
    this.searchQuery = event;
    this.filterItems();
  }

  /*
    - Below method is used to filter the Tasks, Conditions and Outputs based on the seaech value.
    - If we need to add another new Category (e.g. Source) like the above 3, we need to add another filteredList
      for it and repeat similar code for it.
  */
  filterItems() {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredCategoryList = [...this.categoryList];
      this.filteredConditionList = [...this.conditionList];
      this.filteredOutputList = [...this.outputList];
      this.filteredLLMList = [...this.llmList];

      // Reset Auto-Open Accordion
      this.autoOpenTasks = {};
      this.isOpenTasks = {};
      this.autoOpenCondition = false;
      this.autoOpenOutput = false;
      this.autoOpenSourceTasks = {};
      this.isOpenSourceTasks = {};
      return;
    }

    let shouldExpandTasks = false;
    let shouldExpandSourceTasks = false;

    // Filter Category List
    this.filteredCategoryList = this.categoryList
      .map(category => {
        const filteredTasks = category.tasks.filter(task => task.taskName.toLowerCase().includes(query));
        const matchCategory = category.category.toLowerCase().includes(query);

        if (filteredTasks.length > 0 || matchCategory) {
          this.autoOpenTasks[category.category] = true;
          this.isOpenTasks[category.category] = true;
          shouldExpandTasks = true;
        } else {
          this.autoOpenTasks[category.category] = false;
        }

        return { ...category, tasks: filteredTasks };
      })
      .filter(category => category.tasks.length > 0 || category.category.toLowerCase().includes(query));

    this.isOpen = shouldExpandTasks;

    // Filter Condition List
    this.filteredConditionList = this.conditionList.filter(condition => {
      const match = condition.condition.toLowerCase().includes(query);
      if (match) this.autoOpenCondition = true;
      return match;
    });

    // Filter Output List
    this.filteredOutputList = this.outputList.filter(output => {
      const match = output.output.toLowerCase().includes(query);
      if (match) this.autoOpenOutput = true;
      return match;
    });

    this.isOpenCondition = this.autoOpenCondition;
    this.isOpenOutput = this.autoOpenOutput;

    // Filter LLM List
    this.filteredLLMList = this.llmList.filter(llm => {
      const match = llm.block.toLowerCase().includes(query);
      if (match) this.autoOpenLLM = true;
      return match;
    });

    this.isOpenLLM = this.autoOpenLLM;

    // Filter Category List
    this.filteredSourceCategoryList = this.sourceCategoryList
      .map(category => {
        const filteredTasks = category.tasks.filter(task => task.taskName.toLowerCase().includes(query));
        const matchCategory = category.category.toLowerCase().includes(query);

        if (filteredTasks.length > 0 || matchCategory) {
          this.autoOpenSourceTasks[category.category] = true;
          this.isOpenSourceTasks[category.category] = true;
          shouldExpandSourceTasks = true;
        } else {
          this.autoOpenSourceTasks[category.category] = false;
        }

        return { ...category, tasks: filteredTasks };
      })
      .filter(category => category.tasks.length > 0 || category.category.toLowerCase().includes(query));

    this.isOpenSource = shouldExpandSourceTasks;
  }

  /*
    Below method highlights the matched value.
  */
  highlightMatch(text: string) {
    if (!this.searchQuery) {
      return text;
    }
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, `<span class="highlight">$1</span>`);
  }

  /*
    - Below method is used to drag a Task,Condition or Output node.
    - This is the event when we drag a node until we release the click and drop it.
  */
  dragStart(event: DragEvent, category: any, value: any, nodeType?: string): void {

    let data;
    if (nodeType === 'Source') {
      data = {
        category: category.category,
        sourceTask: value
      }
    } else {
      data = {
        category: category.category,
        task: value
      };
    }

    if (value) {
      event.dataTransfer?.setData('value', JSON.stringify(data));
    } else {
      event.dataTransfer?.setData('value', JSON.stringify(category));
    }

    // ---- Custom Drag Image Start ----
    const dragIcon = document.createElement('div');
    dragIcon.style.position = 'absolute';
    dragIcon.style.top = '-1000px'; // hide it offscreen
    dragIcon.style.left = '-1000px';
    dragIcon.style.padding = '2px 8px';
    dragIcon.style.background = '#ffffff';
    dragIcon.style.border = '1px solid #ccc';
    dragIcon.style.borderRadius = '4px';
    dragIcon.style.fontSize = '12px';
    dragIcon.style.color = '#000';
    dragIcon.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    if (value) {
      dragIcon.innerText = data.sourceTask ? data.sourceTask.taskName : data.task.taskName;
    } else if (category?.condition) {
      dragIcon.innerText = category?.condition;
    } else if (category?.block) {
      dragIcon.innerText = category?.block;
    } else {
      dragIcon.innerText = category?.output;
    }
    document.body.appendChild(dragIcon);

    event.dataTransfer?.setDragImage(dragIcon, 0, 0);


    setTimeout(() => {
      document.body.removeChild(dragIcon);
    }, 0);
    // ---- Custom Drag Image End ----
  }

  // ************************************************* Left Side Panel Code End ************************************ //


  //********************************************* Drawflow Plot Start ***************************************************//

  /*
    - This method handles click events on the drawflow container in general.
  */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideInput = event.target instanceof HTMLElement &&
      event.target.closest('input');
    const clickedInsideDropdown = event.target instanceof HTMLElement &&
      event.target.closest('.suggestion-drop');
    const clickedInsideNodeHeader = event.target instanceof HTMLElement &&
      event.target.closest('.node-header');
    const clickedInsideRightPanel = event.target instanceof HTMLElement &&
      event.target.closest('.right-sidebar');
    const clickedWorkFlowParamIcon = event.target instanceof HTMLElement &&
      event.target.closest('.workflow-icon');

    if (!clickedInsideInput && !clickedInsideDropdown) {
      this.showDropdownIndex = null;
    }

    if (!clickedInsideNodeHeader && !clickedInsideRightPanel && !clickedInsideDropdown && !clickedWorkFlowParamIcon) {
      this.closeTaskDetails();
      this.closeConditionDetails();
      this.closeOutputDetails();
      this.closeSourceTaskDetails();
      this.closeWorkflowParams();
      this.closeLLMDetails();
    }
  }

  /*
    - This method calls the API to get all the metadata.
    - Also handles drawflow events.
  */
  getMetadata() {
    this.svc.getMetadata().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        this.workflowMetadata = res;
        this.buildAssitantForm();
        setTimeout(() => {
          if (!this.workFlowId) {
            this.addDefaultNodes();
          }
          setTimeout(() => {
            if (!this.editor) {
              return;
            }

            this.latestDroppedTask = null;
            this.latestDroppedCondition = null;
            this.latestDroppedOutput = null;
            this.latestDroppedSourceTask = null;


            // Handle node creation (Only runs once globally)
            this.editor.on('nodeCreated', (id: number) => {
              this.currentNodeId = id;
              if (this.latestDroppedTask) {
                // let uniqueTaskId = `node_${this.nodeCounter}`;
                // let uniqueTaskId = id;
                const { pos_x, pos_y } = this.latestDroppedTask;
                // this.addTaskNode(this.latestDroppedTask, pos_x, pos_y, id);555
                this.updateNodeDetails(id, this.latestDroppedTask);
                this.getTemplateDetailsByTask(this.latestDroppedTask, `node_${id}`);
                this.latestDroppedTask = null; // Reset after assigning
              }

              if (this.latestDroppedCondition) {
                // let uniqueConditionId = `node_${this.nodeCounter}`;
                const { pos_x, pos_y } = this.latestDroppedCondition;
                this.updateNodeDetails(id, this.latestDroppedCondition);
                this.setCondtions(this.latestDroppedCondition, `node_${id}`);
                this.latestDroppedCondition = null;
              }

              if (this.latestDroppedOutput) {
                // let uniqueOutputId = `node_${this.nodeCounter}`;
                const { pos_x, pos_y } = this.latestDroppedOutput;
                this.updateNodeDetails(id, this.latestDroppedOutput);
                this.setOutputs(this.latestDroppedOutput, `node_${id}`);
                this.latestDroppedOutput = null;
              }

              if (this.latestDroppedSourceTask) {
                // let uniqueTaskId = `node_${this.nodeCounter}`;
                const { pos_x, pos_y } = this.latestDroppedSourceTask;
                this.updateNodeDetails(id, this.latestDroppedSourceTask);
                this.getDetailsOfSelectedSourceTask(this.latestDroppedSourceTask, `node_${id}`);
                this.latestDroppedSourceTask = null; // Reset after assigning
              }

              if (this.latestDroppedLLM) {
                // let uniqueOutputId = `node_${this.nodeCounter}`;
                const { pos_x, pos_y } = this.latestDroppedLLM;
                this.updateNodeDetails(id, this.latestDroppedLLM);
                this.setLLM(this.latestDroppedLLM, `node_${id}`);
                this.latestDroppedLLM = null;
              }
            });

            // Handle node removal (Only runs once globally)
            this.editor.on('nodeRemoved', (id: number) => {
              this.handleNodeRemove(id);
            });

            this.editor.on('connectionCreated', (connection) => {
              this.connectionList.push(connection);
            });

            this.editor.on('nodeSelected', (id: number) => {
              this.selectedNodeId = id;
              const nodeData = this.editor.getNodeFromId(id);
              if (nodeData) {
                this.positionX = nodeData.pos_x;
                this.positionY = nodeData.pos_y;
              }
            });

            this.editor.on("nodeMoved", (id: number) => {
              if (id === 1 || id === 2) {
                document.documentElement.style.setProperty('--dfDeleteDisplay', 'none');
              }
            });

            // this.editor.on('clickEnd', (e) => {
            //   if (e?.target?.classList?.contains('drawflow')) {
            //     this.editor.editor_selected = true;
            //   } else {
            //     this.editor.editor_selected = false;
            //   }
            // });

          }, 0);
        }, 0);
      },
      (err: HttpErrorResponse) => {
        this.workflowMetadata = null;
      }
    );
  }


  updateNodeDetails(nodeId: number, node?: NodeDataModel) {
    let uniqueNodeId = `node_${nodeId}`;
    this.editor.updateNodeDataFromId(nodeId, {
      label: node,
      uniqueNodeId: uniqueNodeId
    });

    const nodeEl = document.getElementById(`node-${nodeId}`);
    let iconHtml = '';

    if (node.type === 'condition' || node.type === 'llm') {
      iconHtml = `<img src="${node.image}" height="30" width="30"/>`;
    } else if (node.type === 'output' || node.type === 'source task') {
      iconHtml = `<i class="${node.image} pt-2" style="color: grey;"></i>`;
    } else {
      iconHtml = `<img src="${node.image}" alt="Icon" />`;
    }
    if (nodeEl) {
      const content = `
      <div class="custom-node" id="${uniqueNodeId}">
        <div class="node-header text-truncate">${node.name}</div>
        <div class="node-image">
           ${iconHtml}
        </div>
      </div>
    `;

      if (nodeEl) {
        const contentNode = nodeEl.querySelector('.drawflow_content_node');
        if (contentNode) {
          contentNode.innerHTML = content;
        }
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content.trim();
      this.editor.drawflow.drawflow.Home.data[nodeId].html = tempDiv.innerHTML;

      this.editor.drawflow.drawflow.Home.data[nodeId].data = {
        ...this.editor.drawflow.drawflow.Home.data[nodeId].data,
        label: node,
        uniqueNodeId,
      };
    }

    setTimeout(() => {
      const nodeElement = document.getElementById(`${uniqueNodeId}`);
      if (nodeElement) {
        const headerElement = nodeElement.querySelector('.node-header');
        this.renderer.listen(headerElement, 'click', () => {
          if (headerElement) {
            if (this.selectedNode) {
              const prevHeader = this.selectedNode.querySelector('.node-header');
              if (prevHeader) {
                prevHeader.classList.remove('node-header-active');
              }
            }
            if (this.selectedIfConditionNode) {
              const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
              if (prevHeader) {
                prevHeader.classList.remove('node-header-active');
              }
            }
            if (this.selectedSwitchConditionNode) {
              const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
              if (prevHeader) {
                prevHeader.classList.remove('node-header-active');
              }
            }
            if (this.selectedEmailNode) {
              const prevHeader = this.selectedEmailNode.querySelector('.node-header');
              if (prevHeader) {
                prevHeader.classList.remove('node-header-active');
              }
            }
            if (this.selectedChartNode) {
              const prevHeader = this.selectedChartNode.querySelector('.node-header');
              if (prevHeader) {
                prevHeader.classList.remove('node-header-active');
              }
            }
            if (this.selectedSourceTaskNode) {
              const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
              if (prevHeader) {
                prevHeader.classList.remove('node-header-active');
              }
            }
            if (this.selectedLLMNode) {
              const prevHeader = this.selectedLLMNode.querySelector('.node-header');
              if (prevHeader) {
                prevHeader.classList.remove('node-header-active');
              }
            }
            headerElement.classList.add('node-header-active');
          }

          switch (node.type) {
            case 'task':
              this.selectedNode = nodeElement;
              this.viewTaskDetails(node, uniqueNodeId);
              break;
            case 'condition':
              if (node.name === 'If Else') {
                this.selectedIfConditionNode = nodeElement;
              }
              if (node.name === 'Switch Case') {
                this.selectedSwitchConditionNode = nodeElement;
              }
              this.viewConditionDetails(uniqueNodeId);
              break;
            case 'output':
              if (node.name === 'Email') {
                this.selectedEmailNode = nodeElement;
              }
              if (node.name === 'Chart') {
                this.selectedChartNode = nodeElement;
              }
              this.viewOutputDetails(uniqueNodeId);
              break;
            case 'source task':
              this.selectedSourceTaskNode = nodeElement;
              this.viewSourceTaskDetails(node, uniqueNodeId);
              break;
            case 'llm':
              this.selectedLLMNode = nodeElement;
              this.viewLLMDetails(uniqueNodeId);
              break;
          }
        });
      }
    }, 100);
  }

  /*
    - Below method is used to add the default nodes, i.e. Start and End nodes.
  */
  addDefaultNodes(): void {
    // Start node
    this.editor.addNode(
      'Start',
      0, // No inputs
      1, // One output
      100,
      100,
      'start-node',
      { label: 'Start', undeletable: true },
      `<div>
         <strong style="font-size: 12px">Start</strong>
       </div>`
    );

    // End node
    this.editor.addNode(
      'End',
      1, // One input
      0, // No outputs
      900,
      100,
      'end-node',
      { label: 'End', undeletable: true },
      `<div>
         <strong style="font-size: 12px">End</strong>
       </div>`
    );

    this.nodeCounter = this.nodeCounter + 2;
    // this.taskCounter = this.taskCounter + 2;
    // this.conditionCounter = this.conditionCounter + 2;
  }

  /* Below method is used to allow User to drop a dragged node on the Canvas */
  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  /*
    - Below method stores the gets the data for the dropped node.
    - It calculates the posionX and positionY of the dropped node.
    - It passes the data along with the coordinates to the respective methods for Task, Conition and Output nodes.
  */
  drop(event: DragEvent): void {
    event.preventDefault();
    const taskData = event.dataTransfer?.getData('value');
    const data = taskData ? JSON.parse(taskData) : null;
    if (data) {
      let positionX = event.clientX * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)));
      let positionY = event.clientY * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)));
      if (data.task) {
        const { category, task } = data;
        // task.pos_x = positionX;
        // task.pos_y = positionY;
        this.selectedCategory = category;
        // this.latestDroppedTask = task;
        let row = {
          type: 'task',
          name: task.taskName,
          category: task.category,
          image: task.image,
          uuid: task.taskUuid,
          playbook: task.playbookType,
          pos_x: positionX,
          pos_y: positionY
        }
        this.latestDroppedTask = row;
        // this.addTaskNode(row, positionX, positionY);
        this.addNode(row, positionX, positionY);
      } else if (data.sourceTask) {
        const { category, sourceTask } = data;
        // sourceTask.pos_x = positionX;
        // sourceTask.pos_y = positionY;
        this.selectedSourceCategory = category;
        // this.latestDroppedSourceTask = sourceTask;
        let row = {
          type: 'source task',
          name: sourceTask.taskName,
          category: category,
          image: sourceTask.icon,
          uuid: sourceTask.taskUuid,
          playbook: sourceTask.playbookType,
          pos_x: positionX,
          pos_y: positionY
        }
        this.latestDroppedSourceTask = row;
        this.addNode(row, positionX, positionY);
        // this.addSourceTaskNode(sourceTask, positionX, positionY);
      } else {
        if (this.conditionList.some(condition => condition.condition === data.condition)) {
          // data.pos_x = positionX;
          // data.pos_y = positionY;
          // this.latestDroppedCondition = data;
          let row = {
            type: 'condition',
            name: data.condition,
            image: data.icon,
            pos_x: positionX,
            pos_y: positionY
          }
          this.latestDroppedCondition = row;
          this.addNode(row, positionX, positionY);
          // this.addConditionNode(data, positionX, positionY);
        } else if (Object.keys(data).includes('output')) {
          // data.pos_x = positionX;
          // data.pos_y = positionY;
          // this.latestDroppedOutput = data;
          let row = {
            type: 'output',
            name: data.output,
            image: data.icon,
            pos_x: positionX,
            pos_y: positionY
          }
          this.latestDroppedOutput = row;
          this.addNode(row, positionX, positionY);
          // this.addOutputs(data, positionX, positionY);
        } else if (Object.keys(data).includes('block')) {
          // data.pos_x = positionX;
          // data.pos_y = positionY;
          // this.latestDroppedLLM = data;
          let row = {
            type: 'llm',
            name: data.block,
            image: data.icon,
            pos_x: positionX,
            pos_y: positionY
          }
          this.latestDroppedLLM = row;
          this.addNode(row, positionX, positionY);
          // this.addLLM(data, positionX, positionY);
        }
      }
    }
  }

  addNode(node: NodeDataModel, positionX: number, positionY: number): void {
    this.noOfOutputNode = node.name === 'If Else' ? 2 : 1;
    this.editor.addNode(
      node.name,
      1, // One input
      this.noOfOutputNode, // One output
      positionX,
      positionY,
      'default-node',
      `<div class="custom-node">
          <div class="node-header">...</div>
      </div>
      `
    );
  }

  /*
    - Below function addes a Task node.
    - It handles the header click event of each task node.
    - Generates unique id for each task node.
    - It calls a method to view the task details in the right panel.
  */
  // addTaskNode(node: NodeDataModel, positionX: number, positionY: number): void {
  //   // if (this.workFlowId) {
  //   //   // this.nodeCounter = this.workFlowData.tasks.length;
  //   //   const nodes = this.editor.export().drawflow.Home.data;
  //   //   const lastId = Object.keys(nodes)
  //   //     .map(id => parseInt(id, 10))
  //   //     .reduce((max, id) => Math.max(max, id), -1);
  //   //   this.nodeCounter = lastId;
  //   // }
  //   // this.nodeCounter++;
  //   // let uniqueNodeId = this.selectedTask ? this.selectedTask?.name_id : `task_${this.nodeCounter - 1}`;
  //   // let uniqueNodeId = id;


  //   // this.editor.addNode(
  //   //   task.taskName,
  //   //   1, // One input
  //   //   1, // One output
  //   //   positionX,
  //   //   positionY,
  //   //   'default-node',
  //   //   { label: task, uniqueNodeId },
  //   //   `<div class="custom-node" id="${uniqueNodeId}">
  //   //       <div class="node-header text-truncate">${task.taskName}</div>
  //   //       <div class="node-image">
  //   //         <img src="${task.image}" alt="Icon" />
  //   //       </div>
  //   //     </div>
  //   //   `
  //   // );

  //   this.editor.addNode(
  //     node.name,
  //     1, // One input
  //     1, // One output
  //     positionX,
  //     positionY,
  //     'default-node',
  //     // { label: task, uniqueNodeId },5
  //     // `<div class="custom-node">
  //     //     <div class="node-header text-truncate">${node.name}</div>
  //     //     <div class="node-image">
  //     //       <img src="${node.image}" alt="Icon" />
  //     //     </div>
  //     //   </div>
  //     // `
  //     `<div class="custom-node">
  //         <div class="node-header">...</div>
  //     </div>
  //     `
  //   );
  //   // setTimeout(() => {
  //   //   const nodeElement = document.getElementById(`${uniqueNodeId}`);
  //   //   if (nodeElement) {
  //   //     const headerElement = nodeElement.querySelector('.node-header');
  //   //     this.renderer.listen(headerElement, 'click', () => {
  //   //       if (headerElement) {
  //   //         if (this.selectedNode) {
  //   //           const prevHeader = this.selectedNode.querySelector('.node-header');
  //   //           if (prevHeader) {
  //   //             prevHeader.classList.remove('node-header-active');
  //   //           }
  //   //         }
  //   //         if (this.selectedIfConditionNode) {
  //   //           const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
  //   //           if (prevHeader) {
  //   //             prevHeader.classList.remove('node-header-active');
  //   //           }
  //   //         }
  //   //         if (this.selectedSwitchConditionNode) {
  //   //           const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
  //   //           if (prevHeader) {
  //   //             prevHeader.classList.remove('node-header-active');
  //   //           }
  //   //         }
  //   //         if (this.selectedEmailNode) {
  //   //           const prevHeader = this.selectedEmailNode.querySelector('.node-header');
  //   //           if (prevHeader) {
  //   //             prevHeader.classList.remove('node-header-active');
  //   //           }
  //   //         }
  //   //         if (this.selectedChartNode) {
  //   //           const prevHeader = this.selectedChartNode.querySelector('.node-header');
  //   //           if (prevHeader) {
  //   //             prevHeader.classList.remove('node-header-active');
  //   //           }
  //   //         }
  //   //         if (this.selectedSourceTaskNode) {
  //   //           const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
  //   //           if (prevHeader) {
  //   //             prevHeader.classList.remove('node-header-active');
  //   //           }
  //   //         }
  //   //         if (this.selectedLLMNode) {
  //   //           const prevHeader = this.selectedLLMNode.querySelector('.node-header');
  //   //           if (prevHeader) {
  //   //             prevHeader.classList.remove('node-header-active');
  //   //           }
  //   //         }
  //   //         headerElement.classList.add('node-header-active');
  //   //       }
  //   //       this.selectedNode = nodeElement;
  //   //       this.viewTaskDetails(task, uniqueNodeId);
  //   //     });
  //   //   }
  //   // }, 100);
  // }

  // /*
  //   - Below function addes a Condition node.
  //   - It handles the header click event of each condition node.
  //   - Handels the diffence between If else and Switch nodes.
  //   - Generates unique id for each condition node.
  //   - It calls a method to view the condition details in the right panel.
  // */
  //   addConditionNode(condition: { condition: string, icon: string }, positionX: number, positionY: number): void {
  //     this.noOfOutputNode = condition.condition === 'If Else' ? 2 : 1;
  //     // this.conditionCounter++;
  //     if (this.workFlowId) {
  //       // this.nodeCounter = this.workFlowData.tasks.length;
  //       const nodes = this.editor.export().drawflow.Home.data;
  //       const lastId = Object.keys(nodes)
  //         .map(id => parseInt(id, 10))
  //         .reduce((max, id) => Math.max(max, id), -1);
  //       this.nodeCounter = lastId;
  //     }
  //     this.nodeCounter++;
  //     let uniqueNodeId = `node_${this.nodeCounter}`;
  //     this.editor.addNode(
  //       condition.condition,
  //       1,
  //       this.noOfOutputNode,
  //       positionX,
  //       positionY,
  //       'default-node',
  //       { label: condition, uniqueNodeId },
  //       `<div class="custom-node" id="${uniqueNodeId}">
  //           <div class="node-header text-truncate">${condition.condition}</div>
  //           <div class="node-image">
  //           <img src="${condition.icon}" height="30" width="30"/>
  //           </div>
  //         </div>
  //       `
  //     );
  //     setTimeout(() => {
  //       const nodeElement = document.getElementById(uniqueNodeId);
  //       if (nodeElement) {
  //         if (condition.condition === 'Switch Case') {
  //           (nodeElement as HTMLElement).style.height = '100px';
  //         }
  //         const headerElement = nodeElement.querySelector('.node-header');
  //         if (condition.condition === 'If Else') {
  //           this.renderer.listen(headerElement, 'click', () => {
  //             if (headerElement) {
  //               if (this.selectedSwitchConditionNode) {
  //                 const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedIfConditionNode) {
  //                 const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedNode) {
  //                 const prevHeader = this.selectedNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedEmailNode) {
  //                 const prevHeader = this.selectedEmailNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedChartNode) {
  //                 const prevHeader = this.selectedChartNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedSourceTaskNode) {
  //                 const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedLLMNode) {
  //                 const prevHeader = this.selectedLLMNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               headerElement.classList.add('node-header-active');
  //             }
  //             this.selectedIfConditionNode = nodeElement;

  //             const drawflowData = this.editor.export().drawflow.Home.data;
  //             let drawflowId: string | null = null;

  //             Object.entries(drawflowData).forEach(([id, node]: any) => {
  //               if (node.data.uniqueNodeId === uniqueNodeId) {
  //                 drawflowId = id; // Found the Drawflow-generated ID
  //               }
  //             });

  //             // if (drawflowId) {
  //             //   if (this.workFlowId) {
  //             //     this.viewConditionDetails(`node_${this.nodeCounter}`, `node_${drawflowId}`);
  //             //   } else {
  //             //     this.viewConditionDetails(`node_${drawflowId}`, uniqueNodeId);
  //             //   }
  //             // }
  //             this.viewConditionDetails(`node_${drawflowId}`, uniqueNodeId);
  //           });
  //         } else {
  //           this.renderer.listen(headerElement, 'click', () => {
  //             if (headerElement) {
  //               if (this.selectedIfConditionNode) {
  //                 const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedSwitchConditionNode) {
  //                 const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedNode) {
  //                 const prevHeader = this.selectedNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedEmailNode) {
  //                 const prevHeader = this.selectedEmailNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedChartNode) {
  //                 const prevHeader = this.selectedChartNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedSourceTaskNode) {
  //                 const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedLLMNode) {
  //                 const prevHeader = this.selectedLLMNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               headerElement.classList.add('node-header-active');
  //             }
  //             this.selectedSwitchConditionNode = nodeElement;

  //             const drawflowData = this.editor.export().drawflow.Home.data;
  //             let drawflowId: string | null = null;

  //             Object.entries(drawflowData).forEach(([id, node]: any) => {
  //               if (node.data.uniqueNodeId === uniqueNodeId) {
  //                 drawflowId = id; // Found the Drawflow-generated ID
  //               }
  //             });

  //             if (drawflowId) {
  //               if (this.workFlowId) {
  //                 this.viewConditionDetails(`node_${this.nodeCounter}`, `node_${drawflowId}`);
  //               } else {
  //                 this.viewConditionDetails(`node_${drawflowId}`, uniqueNodeId);
  //               }
  //             }
  //           });
  //         }

  //       }
  //     }, 100);
  //   }

  //   /*
  //     - Below function addes a Output node.
  //     - It handles the header click event of each output node.
  //     - Generates unique id for each output node.
  //     - It calls a method to view the output details in the right panel.
  //   */
  //   addOutputs(output: any, positionX: number, positionY: number): void {
  //     // this.outputCounter++;
  //     if (this.workFlowId) {
  //       // this.nodeCounter = this.workFlowData.tasks.length;
  //       const nodes = this.editor.export().drawflow.Home.data;
  //       const lastId = Object.keys(nodes)
  //         .map(id => parseInt(id, 10))
  //         .reduce((max, id) => Math.max(max, id), -1);
  //       this.nodeCounter = lastId + 1;
  //     }
  //     this.nodeCounter++;
  //     let uniqueNodeId = `node_${this.nodeCounter}`;
  //     this.editor.addNode(
  //       output.output,
  //       1,
  //       1,
  //       positionX,
  //       positionY,
  //       'default-node',
  //       { label: output, uniqueNodeId },
  //       `<div class="custom-node" id="${uniqueNodeId}">
  //           <div class="node-header text-truncate">${output.output}</div>
  //           <div class="node-image">
  //             <i class="${output.icon} pt-2" style="color: grey;"></i>
  //           </div>
  //         </div>
  //       `
  //     );

  //     setTimeout(() => {
  //       const nodeElement = document.getElementById(uniqueNodeId);
  //       if (nodeElement) {
  //         const headerElement = nodeElement.querySelector('.node-header');
  //         if (output.output === 'Email') {

  //           this.renderer.listen(headerElement, 'click', (event: MouseEvent) => {
  //             const clickedElement = event.target as HTMLElement;
  //             const nodeDiv = clickedElement.offsetParent as HTMLElement;
  //             const nodeId = nodeDiv?.id;
  //             console.log(nodeId)
  //             if (headerElement) {
  //               if (this.selectedSwitchConditionNode) {
  //                 const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedIfConditionNode) {
  //                 const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedNode) {
  //                 const prevHeader = this.selectedNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedSourceTaskNode) {
  //                 const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedLLMNode) {
  //                 const prevHeader = this.selectedLLMNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedChartNode) {
  //                 const prevHeader = this.selectedChartNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedEmailNode) {
  //                 const prevHeader = this.selectedEmailNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               headerElement.classList.add('node-header-active');
  //             }
  //             this.selectedEmailNode = nodeElement;

  //             const drawflowData = this.editor.export().drawflow.Home.data;
  //             let drawflowId: string | null = null;

  //             Object.entries(drawflowData).forEach(([id, node]: any) => {
  //               if (node.data.uniqueNodeId === uniqueNodeId) {
  //                 drawflowId = id; // Found the Drawflow-generated ID
  //               }
  //             });
  //             if (drawflowId) {
  //               if (this.workFlowId) {
  //                 this.viewOutputDetails(`node_${this.nodeCounter}`, `node_${drawflowId}`, 'Email');
  //                 // this.viewOutputDetails(`node_${nodeId.split('-')[1]}`, `node_${drawflowId}`);
  //               } else {
  //                 this.viewOutputDetails(`node_${drawflowId}`);
  //               }
  //             }
  //           });
  //         }
  //         if (output.output === 'Chart') {
  //           this.renderer.listen(headerElement, 'click', (event: MouseEvent) => {
  //             const clickedElement = event.target as HTMLElement;
  //             const nodeDiv = clickedElement.offsetParent as HTMLElement;
  //             const nodeId = nodeDiv?.id;
  //             if (headerElement) {
  //               if (this.selectedSwitchConditionNode) {
  //                 const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedIfConditionNode) {
  //                 const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedNode) {
  //                 const prevHeader = this.selectedNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedSourceTaskNode) {
  //                 const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedLLMNode) {
  //                 const prevHeader = this.selectedLLMNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedEmailNode) {
  //                 const prevHeader = this.selectedEmailNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedChartNode) {
  //                 const prevHeader = this.selectedChartNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               headerElement.classList.add('node-header-active');
  //             }
  //             this.selectedChartNode = nodeElement;

  //             const drawflowData = this.editor.export().drawflow.Home.data;
  //             let drawflowId: string | null = null;

  //             Object.entries(drawflowData).forEach(([id, node]: any) => {
  //               if (node.data.uniqueNodeId === uniqueNodeId) {
  //                 drawflowId = id; // Found the Drawflow-generated ID
  //               }
  //             });
  //             if (drawflowId) {
  //               if (this.workFlowId) {
  //                 // const hasNotification = this.outputArr.some(item => item.type === 'Notification Task');
  //                 // const hasChart = this.outputArr.some(item => item.type === 'Chart Task');
  //                 // if (hasChart && hasNotification) {
  //                 //   this.viewOutputDetails(`node_${nodeId.split('-')[1]}`, `node_${drawflowId}`);
  //                 // } else {
  //                 this.viewOutputDetails(`node_${this.nodeCounter}`, `node_${drawflowId}`);
  //                 // }
  //               } else {
  //                 this.viewOutputDetails(`node_${drawflowId}`);
  //               }
  //             }
  //           });
  //         }
  //       }
  //     })
  //   }


  //   /*
  //   - Below function addes a Source Task node.
  //   - It handles the header click event of each task node.
  //   - Generates unique id for each task node.
  //   - It calls a method to view the task details in the right panel.
  // */
  //   addSourceTaskNode(sourceTask: SourceTaskDetailsViewData, positionX: number, positionY: number): void {
  //     if (this.workFlowId) {
  //       const nodes = this.editor.export().drawflow.Home.data;
  //       const lastId = Object.keys(nodes)
  //         .map(id => parseInt(id, 10))
  //         .reduce((max, id) => Math.max(max, id), -1);
  //       this.nodeCounter = lastId;
  //     }
  //     this.nodeCounter++;
  //     let uniqueNodeId = `node_${this.nodeCounter}`;
  //     this.editor.addNode(
  //       sourceTask.taskName,
  //       1, // One input
  //       1, // One output
  //       positionX,
  //       positionY,
  //       'default-node',
  //       { label: sourceTask, uniqueNodeId },
  //       `<div class="custom-node" id="${uniqueNodeId}">
  //             <div class="node-header text-truncate">${sourceTask.taskName}</div>
  //             <div class="node-image">
  //               <i class="${sourceTask.icon} pt-2" style="color: grey;"></i>
  //             </div>
  //           </div>
  //         `
  //     );
  //     setTimeout(() => {
  //       const nodeElement = document.getElementById(uniqueNodeId);
  //       if (nodeElement) {
  //         const headerElement = nodeElement.querySelector('.node-header');
  //         this.renderer.listen(headerElement, 'click', () => {
  //           if (headerElement) {
  //             if (this.selectedNode) {
  //               const prevHeader = this.selectedNode.querySelector('.node-header');
  //               if (prevHeader) {
  //                 prevHeader.classList.remove('node-header-active');
  //               }
  //             }
  //             if (this.selectedIfConditionNode) {
  //               const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
  //               if (prevHeader) {
  //                 prevHeader.classList.remove('node-header-active');
  //               }
  //             }
  //             if (this.selectedSwitchConditionNode) {
  //               const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
  //               if (prevHeader) {
  //                 prevHeader.classList.remove('node-header-active');
  //               }
  //             }
  //             if (this.selectedEmailNode) {
  //               const prevHeader = this.selectedEmailNode.querySelector('.node-header');
  //               if (prevHeader) {
  //                 prevHeader.classList.remove('node-header-active');
  //               }
  //             }
  //             if (this.selectedLLMNode) {
  //               const prevHeader = this.selectedLLMNode.querySelector('.node-header');
  //               if (prevHeader) {
  //                 prevHeader.classList.remove('node-header-active');
  //               }
  //             }
  //             if (this.selectedChartNode) {
  //               const prevHeader = this.selectedChartNode.querySelector('.node-header');
  //               if (prevHeader) {
  //                 prevHeader.classList.remove('node-header-active');
  //               }
  //             }
  //             if (this.selectedSourceTaskNode) {
  //               const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
  //               if (prevHeader) {
  //                 prevHeader.classList.remove('node-header-active');
  //               }
  //             }
  //             headerElement.classList.add('node-header-active');
  //           }
  //           this.selectedSourceTaskNode = nodeElement;
  //           this.viewSourceTaskDetails(sourceTask, uniqueNodeId);
  //         });
  //       }
  //     }, 100);
  //   }

  //   /*
  //   - Below function addes a Output node.
  //   - It handles the header click event of each output node.
  //   - Generates unique id for each output node.
  //   - It calls a method to view the output details in the right panel.
  // */
  //   addLLM(llm: any, positionX: number, positionY: number): void {
  //     // this.outputCounter++;
  //     if (this.workFlowId) {
  //       // this.nodeCounter = this.workFlowData.tasks.length;
  //       const nodes = this.editor.export().drawflow.Home.data;
  //       const lastId = Object.keys(nodes)
  //         .map(id => parseInt(id, 10))
  //         .reduce((max, id) => Math.max(max, id), -1);
  //       this.nodeCounter = lastId;
  //     }
  //     this.nodeCounter++;
  //     let uniqueNodeId = `node_${this.nodeCounter}`;
  //     this.editor.addNode(
  //       llm.block,
  //       1,
  //       1,
  //       positionX,
  //       positionY,
  //       'default-node',
  //       { label: llm, uniqueNodeId },
  //       `<div class="custom-node" id="${uniqueNodeId}">
  //           <div class="node-header text-truncate">${llm.block}</div>
  //           <div class="node-image">
  //             <img src="${llm.icon}" height="30" width="30"/>
  //           </div>
  //         </div>
  //       `
  //     );

  //     setTimeout(() => {
  //       const nodeElement = document.getElementById(uniqueNodeId);
  //       if (nodeElement) {
  //         const headerElement = nodeElement.querySelector('.node-header');
  //         if (llm.block === 'LLM') {
  //           this.renderer.listen(headerElement, 'click', () => {
  //             if (headerElement) {
  //               if (this.selectedSwitchConditionNode) {
  //                 const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedIfConditionNode) {
  //                 const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedNode) {
  //                 const prevHeader = this.selectedNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedSourceTaskNode) {
  //                 const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedChartNode) {
  //                 const prevHeader = this.selectedChartNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedEmailNode) {
  //                 const prevHeader = this.selectedEmailNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               if (this.selectedLLMNode) {
  //                 const prevHeader = this.selectedLLMNode.querySelector('.node-header');
  //                 if (prevHeader) {
  //                   prevHeader.classList.remove('node-header-active');
  //                 }
  //               }
  //               headerElement.classList.add('node-header-active');
  //             }
  //             this.selectedLLMNode = nodeElement;
  //             const drawflowData = this.editor.export().drawflow.Home.data;
  //             let drawflowId: string | null = null;

  //             Object.entries(drawflowData).forEach(([id, node]: any) => {
  //               if (node.data.uniqueNodeId === uniqueNodeId) {
  //                 drawflowId = id; // Found the Drawflow-generated ID
  //               }
  //             });
  //             if (drawflowId) {
  //               if (this.workFlowId) {
  //                 this.viewLLMDetails(`node_${this.nodeCounter}`, `node_${drawflowId}`);
  //               } else {
  //                 this.viewLLMDetails(`node_${drawflowId}`);
  //               }
  //             }
  //           });
  //         }
  //       }
  //     })
  //   }

  /*
    - Below function opens sets the data and set the flags to show the details of selected output in right panel.
    - If there is some issue with name sync or view details, check outputId in detail.
  */
  viewOutputDetails(nodeId: string) {
    if (this.workFlowId) {
      // if (type === 'Email') {
      this.selectedOutput = this.outputArr.find(o => o.name_id === nodeId);
      // } else {
      //   this.selectedOutput = this.outputArr.find(o => o.name_id === nodeId);
      // }
    } else {
      this.selectedOutput = this.outputArr.find(o => o.name_id === nodeId);
    }
    if (this.selectedOutput.type === 'Notification Task' || this.selectedOutput.type === 'Email') {
      this.selectedTaskImg = this.crudSvc.getSelectedNodeImage('Email');
      this.showEmailOutputDetails = true;
    }
    if (this.selectedOutput.type === 'Chart Task' || this.selectedOutput.type === 'Chart') {
      this.selectedTaskImg = this.crudSvc.getSelectedNodeImage('Chart');
      this.showChartOutputDetails = true;
    }
    this.showIfConditionDetails = false;
    this.showSwitchConditionDetails = false;
    this.showWorkFlowParams = false;
    this.showTaskDetails = false;
    this.showSourceTaskDetails = false;
    this.showLLMDetails = false;
    this.showWorkflowAssistant = false;
    this.selectedOutput.outputForm.get('name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const nodeElement = document.getElementById(nodeId);
      if (nodeElement) {
        const headerElement = nodeElement.querySelector('.node-header') as HTMLElement;
        // const nodeIdNum = Number(nodeId.split('_')[1]);
        let nodeIdNum: number = nodeId ? Number(nodeId.split('_')[1]) : Number(nodeId.split('_')[1]);
        const currentData = this.editor.getNodeFromId(nodeIdNum).data;
        const nodeData = this.editor.drawflow.drawflow.Home.data[nodeIdNum];

        nodeData.name = val;

        const updatedOutput = {
          icon: currentData.icon,
          output: val
        };

        this.editor.updateNodeDataFromId(nodeIdNum, {
          label: updatedOutput,
          uniqueNodeId: nodeId
        });

        if (headerElement) {
          headerElement.innerText = val;
          const htmlString = this.editor.drawflow.drawflow.Home.data[nodeIdNum].html as string;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlString.trim();
          const headerEl = tempDiv.querySelector('.node-header') as HTMLElement;
          if (headerEl) {
            headerEl.innerText = val;
          }
          this.editor.drawflow.drawflow.Home.data[nodeIdNum].html = tempDiv.innerHTML;
        }
      }
    });
  }

  /* - Handles node remove event of all the nodes. */
  handleNodeRemove(id) {
    if (id === 1 || id === 2) {
      return;
    }
    // const taskIndex = this.taskDetailsArr.findIndex(task => task.name_id === `task_${id}`);
    // const conditionIndex = this.conditionArr.findIndex(c => c.name_id === `condition_${id}`);
    // const outputIndex = this.outputArr.findIndex(o => o.name_id === `output_node_${id}`);
    // const sourceTaskIndex = this.sourceTaskDetailsArr.findIndex(st => st.name_id === `source_task_${id}`);
    const taskIndex = this.taskDetailsArr.findIndex(task => task.name_id === `node_${id}` && Object.values(playbookTypes).includes(task.type));
    const conditionIndex = this.conditionArr.findIndex(c => c.name_id === `node_${id}` && c.type === 'Condition Task');
    const outputIndex = this.outputArr.findIndex(o => o.name_id === `node_${id}` && (o.type === 'Notification Task' || o.type === 'Chart Task'));
    const sourceTaskIndex = this.sourceTaskDetailsArr.findIndex(st => st.name_id === `node_${id}` && st.type === 'Source Task');
    const llmIndex = this.llmArr.findIndex(llm => llm.name_id === `node_${id}` && llm.type === 'LLM Task');

    if (taskIndex !== -1) {
      this.taskDetailsArr.splice(taskIndex, 1);
    }
    if (conditionIndex !== -1) {
      this.conditionArr.splice(conditionIndex, 1);
    }
    if (outputIndex !== -1) {
      this.outputArr.splice(outputIndex, 1);
    }
    if (sourceTaskIndex !== -1) {
      this.sourceTaskDetailsArr.splice(sourceTaskIndex, 1);
    }
    if (llmIndex !== -1) {
      this.llmArr.splice(llmIndex, 1);
    }

    if (this.selectedCondition) {
      this.connectionList.forEach(connection => {
        if (this.selectedCondition.name_id === `node_${connection.output_id}` && connection.input_id === id) {
          if (this.selectedCondition.data.condition === 'If Else') {
            if (connection.output_class === 'output_1') {
              this.selectedCondition?.ifConditionForm.get('executeIf')?.setValue('');
            }
            if (connection.output_class === 'output_2') {
              this.selectedCondition?.ifConditionForm.get('executeElse')?.setValue('');
            }
          }
          if (this.selectedCondition.data.condition === 'Switch Case') {
            const switchArray = this.selectedCondition?.switchConditionForm.get('switchConditions') as FormArray;
            if (switchArray && switchArray.length > 0) {
              for (let i = 0; i < switchArray.length; i++) {
                const executeControl = switchArray.at(i).get('execute');
                if (executeControl && executeControl.value === `node_${id}`) {
                  executeControl.setValue('');
                }
              }
            }
            this.svc.buildSwitchForm(this.selectedCondition, id).reset();
          }
        }
      });
    }
  }
  //********************************************* Drawflow Plot End ***************************************************//


  //************************************ Workflow Modal popup and Param Code Start **********************************************//
  /*
    - Below method is triggered when we click on Start in the Model Popup
    - This initialize workflowDetailsForm for Modal popup
    - Handles valuechanges events.
  */
  onSubmitWorkflowDetails() {
    if (this.workflowDetailsForm.invalid) {
      this.workflowDetailsFormErrors = this.utilSvc.validateForm(this.workflowDetailsForm, this.workflowDetailsFormValidationMessages, this.workflowDetailsFormErrors);
      this.workflowDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.workflowDetailsFormErrors = this.utilSvc.validateForm(this.workflowDetailsForm, this.workflowDetailsFormValidationMessages, this.workflowDetailsFormErrors); });
    } else {
      this.workFlowViewData = this.svc.convertToWorkflowPopupViewData(this.workflowDetailsForm.getRawValue());
      this.initializeWorkflowParamsForm();
      this.modalRef.hide();
    }
  }
  /*
    - Below method is triggered when we click on Start in the Model Popup
    - This initialize workflowParamsForm in Right Panel
    - Handles valuechanges events.
  */
  initializeWorkflowParamsForm() {
    this.workflowParamsForm = this.svc.buildWorkflowParamForm(this.workFlowViewData);
    this.workflowParamsForm.patchValue({
      workflow_name: this.workFlowViewData.workflow_name,
      description: this.workFlowViewData.description,
      category: this.workFlowViewData.category,
      target_type: this.workFlowViewData.target_type
    })
    const paramGroups = this.parameters.controls as FormGroup[];
    paramGroups.forEach(control => {
      control.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
        if (type !== 'Input Template') {
          control.removeControl('template');
          control.removeControl('attribute');
        } else {
          control.addControl('template', new FormControl(''));
          control.addControl('attribute', new FormControl(''));
        }
      })
    });

    this.workflowParamsForm.get('category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cat => {
      switch (cat) {
        case 'Provisioning':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => type === 'Cloud');
          this.workflowParamsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        case 'Operational':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => ['Host', 'Local'].includes(type));
          this.workflowParamsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        case 'Integration':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => type === 'Local');
          this.workflowParamsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        default:
          this.targetTypeOptions = this.workflowMetadata.target_type;
      }
    });

    this.workflowParamsForm.get('target_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Cloud') {
        this.workflowParamsForm.addControl('cloud', new FormControl('', [Validators.required]))
      } else {
        this.workflowParamsForm.removeControl('cloud');
      }
    });
    this.formErrors = {};
    this.formErrors['parameters'] = [];
    this.formErrors.parameters.push(this.svc.getParameterErrors());
  }
  /* -When we close the modal popup on create */
  onCloseWorkFlowDetails() {
    this.modalRef.hide();
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  /* - Below method is used to manage workflow Details form and Workflow Params Form Value changes. */
  manageWorkflowDetails() {
    this.workflowDetailsForm = this.svc.buildWorkflowDetailsForm(this.workFlowViewData);
    this.workflowDetailsFormErrors = this.svc.resetWorkflowDetailsFormErrors();
    this.workflowDetailsFormValidationMessages = this.svc.workflowDetailsFormValidationMessages;
    if (!this.workFlowId) {
      setTimeout(() => {
        this.modalRef = this.modalService.show(this.workflowDetailsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
      }, 100);
    }
    this.workflowDetailsForm.get('category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cat => {
      switch (cat) {
        case 'Provisioning':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => type === 'Cloud');
          this.workflowDetailsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        case 'Operational':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => ['Host', 'Local'].includes(type));
          this.workflowDetailsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        case 'Integration':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => type === 'Local');
          this.workflowDetailsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        default:
          this.targetTypeOptions = this.workflowMetadata.target_type;
      }
    });
    this.workflowDetailsForm.get('target_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Cloud') {
        this.workflowDetailsForm.addControl('cloud', new FormControl('', [Validators.required]))
      } else {
        this.workflowDetailsForm.removeControl('cloud');
      }
    });
    this.spinner.stop('main');
  }
  /* - Used to load the Workflow Parameters FormArray. */
  get parameters(): FormArray {
    return this.workflowParamsForm.get('parameters') as FormArray;
  }
  /* - Below method adds new Form from for workflow Parameters in right panel.*/
  addWorkflowParams(): void {
    const group = this.builder.group({
      "param_name": ['', [Validators.required]],
      "param_type": ['', [Validators.required]],
      "template": ['', [Validators.required]],
      "attribute": ['', [Validators.required]],
      "default_value": ['', [Validators.required]],
    });
    this.parameters.push(group);
  }
  /* - To toggle Workflow Detais Accordion */
  toggleWorkflowParamDetails() {
    this.isOpenWorkflowParamDetails = !this.isOpenWorkflowParamDetails;
  }
  /* - To toggle Workflow Parameters Accordion */
  toggleWorkflowParameters() {
    this.isOpenWorkflowParameters = !this.isOpenWorkflowParameters;
  }
  /* - Open Workflow Param Form in right panel and close others */
  openWorkflowParams() {
    this.showWorkFlowParams = true;
    this.showTaskDetails = false;
    this.showIfConditionDetails = false;
    this.showSwitchConditionDetails = false;
    this.showSourceTaskDetails = false;
    this.showEmailOutputDetails = false;
    this.showChartOutputDetails = false;
    this.showLLMDetails = false;
  }

  openWorkParams() {
    this.showWorkParams = true;
  }

  /* - Check if workflow parameters are empty */
  hasEmptyValues(): boolean {
    return this.parameters.controls.some(control => !control.value?.param_name.trim());
  }

  /* - Close Workflow Param Form in the right panel */
  closeWorkflowParams() {
    this.showWorkFlowParams = false;
  }
  //***************************************** Workflow Modal popup and Param Code End **********************************//


  //****************************************** Get Input Templates Start **********************************************//
  /* - API call to get all input templates. */
  getTaskInputTemplates() {
    this.taskInputTemplates = [];
    this.svc.getTaskInputTemplates().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.taskInputTemplates = res;
    });
  }

  /* - API call to get template details like input parameters for a specific task using task id */
  getTemplateDetailsByTask(node: NodeDataModel, uniqueTaskId?: string) {
    this.spinner.start('main');
    this.svc.getTemplatesByTaskId(node.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tasksByCategory = res;
      if (!this.taskDetailsArr.some(task => task.name_id === uniqueTaskId)) {
        this.setTaskDetails(node, node.pos_x, node.pos_y, uniqueTaskId);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  /* - This method adds attribute based on a selected Input template.*/
  onSelectTemplate(index: number) {
    let fg = <FormGroup>this.parameters.at(index);
    if (fg.get('template')?.value && this.taskInputTemplates) {
      const templateVal = fg.get('template').value;
      const selectedTemplate = this.taskInputTemplates.find(template => template.uuid === templateVal);
      this.attributeList[index] = selectedTemplate ? selectedTemplate.attributes : [];
      if (this.attributeList[index] && this.attributeList[index].length > 0) {
        fg.addControl('attribute', new FormControl('', [Validators.required]));
      } else {
        fg.removeControl('attribute');
      }
    }
  }
  //********************************************* Get Input Templates End **************************************************//


  //********************************************* Task Right Panel Start *************************************************************//

  /* - Below method sets the task details array as per API format.*/
  setTaskDetails(node: NodeDataModel, pos_x?: number, pos_y?: number, uniqueTaskId?: string) {
    let taskRow: TaskArrayModel = {
      category: this.categoryList.filter(cat => cat.tasks.some(task => task.taskUuid === node.uuid))[0].category,
      config: [],
      dependencies: [],
      targets: [],
      inputs: [...this.tasksByCategory.inputs],
      name: node.name,
      name_id: uniqueTaskId,
      pos_x: pos_x,
      pos_y: pos_y,
      outputs: [],
      task: node.uuid,
      taskImage: node.image,
      type: this.categoryList.find(cat =>
        cat.tasks.some(task => task.taskUuid === node.uuid)
      )?.tasks.find(task => task.taskUuid === node.uuid)?.playbookType || '',
      timeout: 3600,
      retries: 0,
      trigger_rule: 'all_success',
      inputForm: this.svc.buildSelectedTaskForm(this.tasksByCategory, uniqueTaskId)
    }
    this.taskDetailsArr.push(taskRow);
  }

  /* - Toggle task name accordion in right panel */
  toggleTaskNameAccordion() {
    this.isOpenTaskName = !this.isOpenTaskName;
  }

  /* - Toggle Input parameter Accordion */
  toggleInputParamAccordion() {
    this.isOpenInputParam = !this.isOpenInputParam;
  }

  /* - Toggle Output parameter Accordion */
  toggleOutputParamAccordion() {
    this.isOpenOutputParam = !this.isOpenOutputParam;
  }

  /* - Toggle Trigger Rule Accordion */
  toggleTriggerRule() {
    this.isOpenTriggerRule = !this.isOpenTriggerRule;
  }

  /* - Toggle Configulation Accordion */
  toggleConfiguration() {
    this.isOpenConfiguration = !this.isOpenConfiguration;
  }

  /* - Close the right panel and remove the highlight class from the node heeader */
  closeTaskDetails() {
    this.showTaskDetails = false;
    if (this.selectedNode) {
      const prevHeader = this.selectedNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedIfConditionNode) {
      const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSwitchConditionNode) {
      const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedEmailNode) {
      const prevHeader = this.selectedEmailNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSourceTaskNode) {
      const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedChartNode) {
      const prevHeader = this.selectedChartNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedLLMNode) {
      const prevHeader = this.selectedLLMNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
  }

  /* - Save the details enetered in the form to the taskDetailsArr to be sent the payload. */
  saveTaskDetails(taskForm: FormGroup) {
    const inputFormValue = taskForm.getRawValue();
    this.taskDetailsArr.forEach(task => {
      if (task.name_id === inputFormValue.name_id) {
        task.name = inputFormValue.task_name;
        task.outputs = [inputFormValue.outputs];
        task.trigger_rule = inputFormValue.triggerRule;
        task.timeout = inputFormValue.timeouts;
        task.retries = inputFormValue.retries;
        task.inputs.forEach((inp, index) => {
          inputFormValue.inputs.forEach(formInp => {
            if (inp.param_name === formInp.param_name) {
              task.inputs[index] = _clone(formInp);
            }
          })
        })
      }
    });
    this.closeTaskDetails();
  }

  /*
    - Below function opens sets the data and set the flags to show t6he details of selected task in right panel.
    - This also syncs the Task name with the Form Control "task_name" and adds the changes to drawflow structure.
  */
  viewTaskDetails(node: NodeDataModel, nodeId?: string) {
    let nodeIdNum;
    nodeIdNum = nodeId.split('_')[1];
    if (this.workFlowId && this.taskDetailsArr.some(task => task.uuid === node.uuid)) {
      this.selectedTask = this.taskDetailsArr.find(t => (t.uuid === node.uuid && t.name_id === nodeId));
    }
    if (!this.workFlowId || (this.workFlowId && !this.taskDetailsArr.some(task => task.uuid === node.uuid))) {
      this.selectedTask = this.taskDetailsArr.find(t => ((t.task === node.uuid || t.uuid === node.uuid) && t.name_id === nodeId));
    }
    this.selectedTaskImg = this.crudSvc.getTaskTargetImage(this.selectedTask?.type);
    this.selectedTask.inputForm.get('task_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const nodeElement = document.getElementById(nodeId);
      if (nodeElement) {
        const headerElement = nodeElement.querySelector('.node-header') as HTMLElement;
        const currentData = this.editor.getNodeFromId(nodeIdNum).data;
        const nodeData = this.editor.drawflow.drawflow.Home.data[nodeIdNum];

        nodeData.name = val;

        const updatedTask = {
          type: 'task',
          name: currentData.label.name,
          image: this.getNodeImage(currentData.label),
          uuid: currentData.label.uuid,
          playbook: currentData.label.type,
        };

        this.editor.updateNodeDataFromId(nodeIdNum, {
          label: updatedTask,
          uniqueNodeId: nodeId
        });

        if (headerElement) {
          headerElement.innerText = val;
          const htmlString = this.editor.drawflow.drawflow.Home.data[nodeIdNum].html as string;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlString.trim();
          const headerEl = tempDiv.querySelector('.node-header') as HTMLElement;
          if (headerEl) {
            headerEl.innerText = val;
          }
          this.editor.drawflow.drawflow.Home.data[nodeIdNum].html = tempDiv.innerHTML;
        }
      }
    });
    this.showWorkflowAssistant = false;
    this.showIfConditionDetails = false;
    this.showSwitchConditionDetails = false;
    this.showWorkFlowParams = false;
    this.showEmailOutputDetails = false;
    this.showSourceTaskDetails = false;
    this.showLLMDetails = false;
    this.showTaskDetails = true;
    this.showChartOutputDetails = false;
    if (this.selectedTask?.inputForm) {
      this.workflowDetailsForm.patchValue(this.selectedTask.inputForm.getRawValue());
    }
  }
  //********************************************* Task Right Panel End *************************************************************//


  //******************************************* Conditions Right Panel Start *******************************************************//
  /* - Below method sets the conditions array as required in the payload. */
  setCondtions(node: NodeDataModel, nodeId?: string) {
    if (!this.conditionArr.some(c => c.condition_id === nodeId)) {

      let ifConditionForm: FormGroup;
      let switchConditionForm: FormGroup;

      if (node.name === "If Else") {
        ifConditionForm = this.svc.buildIfElseForm(this.selectedCondition, nodeId);
      } else {
        switchConditionForm = this.svc.buildSwitchForm(this.selectedCondition, nodeId);
      }

      let conditionRow: ConditionArrayModel = {
        data: node,
        category: null,
        config: [],
        dependencies: [],
        targets: [],
        inputs: [],
        name: '',
        name_id: nodeId,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
        outputs: [],
        task: null,
        taskImage: null,
        type: "Condition Task",
        timeout: 0,
        retries: 0,
        trigger_rule: null,
        ifConditionForm: ifConditionForm,
        switchConditionForm: switchConditionForm
      }
      this.conditionArr.push(conditionRow);
    }
  }

  /*
    - Below function opens sets the data and set the flags to show the details of selected condition in right panel.
    - This also syncs the condition name with the Form Control "name" and adds the changes to drawflow structure.
  */
  viewConditionDetails(gnodeId: string, finalClickFlag?: boolean) {
    this.paramDropList = [];
    this.selectedCondition = this.conditionArr.find(c => c.name_id === gnodeId);
    // if (this.workFlowId) {
    //   uniqueNodeId = conditionId;
    // }
    const nodes = Object.values(this.editor.export().drawflow.Home.data);
    let node: any;
    if (this.workFlowId) {
      node = nodes.find((d: any) => d.data.uniqueNodeId === gnodeId);
    } else {
      node = nodes.find((d: any) => `node_${d.id}` === gnodeId);
    }
    if (node) {
      const nodeId = node.inputs?.input_1?.connections?.[0]?.node;
      const inputTask: any = nodes.find((node: any) => node.id === Number(nodeId));
      this.paramDropList = [{ key: inputTask?.name, value: `node_${inputTask?.id}` }];
      this.showTaskDetails = false;
      this.showWorkFlowParams = false;
      this.showEmailOutputDetails = false;
      this.showSourceTaskDetails = false;
      this.showLLMDetails = false;
      this.showChartOutputDetails = false;
      this.showWorkflowAssistant = false;


      if (this.selectedCondition && (this.selectedCondition?.data?.name === 'If Else' || this.selectedCondition.type === 'If Else')) {
        this.selectedTaskImg = this.crudSvc.getSelectedNodeImage('If Else');
        this.handleIfCondition(gnodeId);
      } else if (this.selectedCondition && this.selectedCondition?.data?.name === 'Switch Case' || this.selectedCondition.type === 'Switch Case') {
        this.selectedTaskImg = this.crudSvc.getSelectedNodeImage('Switch Case');
        this.handleSwitchCondition(gnodeId, finalClickFlag);
      }
    }
  }

  /*
    - Sync the form name with node header and drawflow for If Condition Node.
    - Generate key needed in the payload.
  */
  handleIfCondition(nodeId: string) {
    this.showIfConditionDetails = true;
    this.showSwitchConditionDetails = false;
    this.selectedCondition.ifConditionForm.get('name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const nodeElement = document.getElementById(nodeId);
      const nodeIdNum = Number(nodeId?.split('_')[1]);
      // let nodeIdNum: number = nodeId ? Number(nodeId.split('_')[1]) : Number(nodeId.split('_')[1]);
      const currentData = this.editor.getNodeFromId(nodeIdNum).data;
      const nodeData = this.editor.drawflow.drawflow.Home.data[nodeIdNum];

      if (nodeElement) {
        const headerElement = nodeElement.querySelector('.node-header') as HTMLElement;
        nodeData.name = val;

        const updatedCondition = {
          icon: currentData.icon,
          condition: val
        };

        this.editor.updateNodeDataFromId(nodeIdNum, {
          label: updatedCondition,
          uniqueNodeId: nodeId
        });

        if (headerElement) {
          headerElement.innerText = val;
          const htmlString = this.editor.drawflow.drawflow.Home.data[nodeIdNum].html as string;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlString.trim();
          const headerEl = tempDiv.querySelector('.node-header') as HTMLElement;
          if (headerEl) {
            headerEl.innerText = val;
          }
          this.editor.drawflow.drawflow.Home.data[nodeIdNum].html = tempDiv.innerHTML;
        }
      }
    });
    this.generateKeyForIfPayload();
  }

  /* - Generate key needed in the payload for If.]*/
  generateKeyForIfPayload() {
    this.connectionList.forEach(connection => {
      if (this.selectedCondition.name_id === `node_${connection.output_id}`) {
        if (connection.output_class === 'output_1') {
          const dynamicValue = {
            key: this.taskDetailsArr.find(t => t.name_id === `node_${connection.input_id}`)?.name,
            value: `node_${connection.input_id}`
          };
          this.selectedCondition?.ifConditionForm.get('executeIf').setValue(dynamicValue.value);
        }
        if (connection.output_class === 'output_2') {
          const dynamicValue = {
            key: this.taskDetailsArr.find(t => t.name_id === `node_${connection.input_id}`)?.name,
            value: `node_${connection.input_id}`
          };
          this.selectedCondition?.ifConditionForm.get('executeElse').setValue(dynamicValue.value);
        }
      }
    })
  }

  /*
    - Sync the form name with node header and drawflow for Switch Condition Node.
    - Generate key needed in the payload.
  */
  handleSwitchCondition(nodeId: string, finalClickFlag?: boolean) {
    if (!finalClickFlag) {
      this.showSwitchConditionDetails = true;
    }
    this.showIfConditionDetails = false;
    // Store multiple outputs dynamically
    let executeValues: any = {};
    let outputCount = 1;

    this.selectedCondition.switchConditionForm.get('name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const nodeElement = document.getElementById(nodeId);
      const nodeIdNum = Number(nodeId?.split('_')[1]);
      // console.log(nodeId, conditionId)
      // let nodeIdNum: number = nodeId ? Number(nodeId.split('_')[1]) : Number(conditionId.split('_')[1]);
      const currentData = this.editor.getNodeFromId(nodeIdNum).data;
      const nodeData = this.editor.drawflow.drawflow.Home.data[nodeIdNum];

      if (nodeElement) {
        const headerElement = nodeElement.querySelector('.node-header') as HTMLElement;
        nodeData.name = val;

        const updatedCondition = {
          icon: currentData.icon,
          condition: val
        };

        this.editor.updateNodeDataFromId(nodeIdNum, {
          label: updatedCondition,
          uniqueNodeId: nodeId
        });

        if (headerElement) {
          headerElement.innerText = val;
          const htmlString = this.editor.drawflow.drawflow.Home.data[nodeIdNum].html as string;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlString.trim();
          const headerEl = tempDiv.querySelector('.node-header') as HTMLElement;
          if (headerEl) {
            headerEl.innerText = val;
          }
          this.editor.drawflow.drawflow.Home.data[nodeIdNum].html = tempDiv.innerHTML;
        }
      }
    });

    this.generateKeyForSwitchPayload(executeValues, outputCount);
  }

  /*- Generate key needed in the payload for Switch.*/
  generateKeyForSwitchPayload(executeValues: any, outputCount: number) {
    this.connectionList.forEach(connection => {
      if (this.selectedCondition.name_id === `node_${connection.output_id}`) {
        const dynamicValue = {
          key: this.taskDetailsArr.find(t => t.name_id === `node_${connection.input_id}`)?.name,
          value: `node_${connection.input_id}`
        };

        const outputClass = connection.output_class;
        executeValues[outputClass] = dynamicValue.value;
        outputCount++;
      }
    });

    this.noOfOutputNode = outputCount;

    // Set all dynamic values in conditionForm
    const switchArray = this.selectedCondition?.switchConditionForm.get('switchConditions') as FormArray;
    if (switchArray) {
      const executeVals = Object.values(executeValues);
      for (let i = 0; i < switchArray.length && i < executeVals.length; i++) {
        switchArray.at(i).get('execute')?.setValue(executeVals[i]);
      }
    }
  }

  /* - Save details of both If and Switch conditions as per payload format. */
  saveConditionDetails(conditionForm: FormGroup) {
    const conditionFormValue = conditionForm?.getRawValue();
    const condition = this.selectedCondition?.data?.name || this.selectedCondition?.type;
    if (condition === 'Switch Case') {
      this.updateNodeOutputs(this.selectedCondition.name_id, this.noOfOutputNode);
    }
    if (!conditionFormValue.switchConditions) {
      this.conditionArr.forEach(condition => {
        if (condition.name_id === conditionFormValue.name_id) {
          condition.name = conditionFormValue.name;
          let configRow = {
            execute_if: conditionFormValue.executeIf,
            execute_else: conditionFormValue.executeElse,
            expression: {
              operator: conditionFormValue.operator,
              value: conditionFormValue.updatedValue,
              key: conditionFormValue.ifKey
            }
          }
          if (Array.isArray(condition.config)) {
            let configIndex = condition.config.findIndex(c => c.execute_if === conditionFormValue.executeIf && c.execute_else === conditionFormValue.executeElse);

            if (configIndex !== -1) {
              condition.config[configIndex] = configRow;
            } else {
              condition.config.push(configRow);
            }
          } else {
            condition.config[0] = configRow;
          }
        }
      });
    } else {
      const switchArray = conditionForm.get('switchConditions') as FormArray;
      // Update output count based on saved switch conditions
      this.noOfOutputNode = switchArray.length;
      this.conditionArr.forEach(condition => {
        if (condition.name_id === conditionFormValue.name_id) {
          condition.name = conditionFormValue.name;
          conditionFormValue.switchConditions.forEach((switchCondition: any) => {
            if (!switchCondition.execute) return;
            let configRow = {
              execute: switchCondition.execute,
              expression: {
                operator: switchCondition.operator,
                value: switchCondition.updatedValue,
                key: switchCondition.switchKey
              }
            };
            let configIndex = condition.config.findIndex(c => c.execute === switchCondition.execute);
            if (configIndex !== -1) {
              condition.config[configIndex] = configRow;
            } else {
              condition.config.push(configRow);
            }
          });
        }
      });
    }
    this.closeConditionDetails();
  }

  /* - Adds output nodes based on the number of Form Groups added by the user in Switch Form Array */
  updateNodeOutputs(nodeId: string, outputCount: number): void {
    const uniqueNodeId = Number(nodeId.split('_')[1]);
    const currentNode = this.editor.getNodeFromId(uniqueNodeId);
    const currentOutputCount = Object.keys(currentNode.outputs).length;
    const requiredOutputCount = this.switchConditions.length;
    const outputsToAdd = requiredOutputCount - currentOutputCount;
    for (let i = 0; i < outputsToAdd; i++) {
      this.editor.addNodeOutput(uniqueNodeId);
    }
  }

  /* - Toggle If condition Accordion */
  toggleIfConditionNameAccordion() {
    this.isOpenIfConditionName = !this.isOpenIfConditionName;
  }

  /* - Toggle Switch condition Accordion */
  toggleSwitchConditionNameAccordion() {
    this.isOpenSwitchConditionName = !this.isOpenSwitchConditionName;
  }

  /* - Get Switch Condition Form Array */
  get switchConditions(): FormArray {
    return this.selectedCondition?.switchConditionForm.get('switchConditions') as FormArray;
  }

  /* - Add a new row of form controls for Switch Form Array */
  addSwitchCondition(): void {
    const switchGroup = this.builder.group({
      // param: [''],
      // output: [''],
      switchKey: [''],
      operator: [''],
      updatedValue: [''],
      execute: [{ value: '', disabled: true }]
    });
    this.switchConditions.push(switchGroup);
  }

  /* - Remove output from the Switch Node, when we remove a FormGroup from Switch Form Array */
  removeNodeFromSwitch(index: number) {
    this.editor.removeNodeOutput(this.selectedCondition.name_id.split('_')[1], `output_${index + 1}`);
  }

  /* - Close Conditions Right Panel and remove highlight styles from all the nodes. */
  closeConditionDetails() {
    this.showIfConditionDetails = false;
    this.showSwitchConditionDetails = false;
    if (this.selectedNode) {
      const prevHeader = this.selectedNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedIfConditionNode) {
      const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSwitchConditionNode) {
      const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedEmailNode) {
      const prevHeader = this.selectedEmailNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSourceTaskNode) {
      const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedChartNode) {
      const prevHeader = this.selectedChartNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedLLMNode) {
      const prevHeader = this.selectedLLMNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
  }
  //******************************************* Conditions Right Panel End *******************************************************//

  //******************************************* Output Right Panel Start *******************************************************//


  //******************************************* Output Right Panel End *******************************************************//
  /* - This method is used to make the array of output as required in the payload */
  setOutputs(node: NodeDataModel, nodeId?: string) {
    // outputId = `output_node_${Number((outputId).split('_')[2]) + 1}`;
    if (!this.outputArr.some(o => o.name_id === nodeId)) {
      // this.selectedOutput.emailForm.reset();
      let outputForm = null;

      if (node.name === "Email") {
        if (!this.workFlowId) {
          this.selectedOutput = undefined;
        }
        outputForm = this.svc.buildEmailForm(this.selectedOutput, nodeId);
      }

      if (node.name === "Chart") {
        if (!this.workFlowId) {
          this.selectedOutput = undefined;
        }
        outputForm = this.svc.buildChartForm(this.selectedOutput, nodeId);
        outputForm.get('chart_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
          if (type === 'Pie') {
            // outputForm.removeControl('x_label');
            // outputForm.removeControl('y_label');
            outputForm.removeControl('x_values');
            outputForm.removeControl('y_values');
            // outputForm.addControl('pie_values', new FormControl(''));
            // outputForm.addControl('pie_labels', new FormControl(''));
          } else {
            outputForm.addControl('x_label', new FormControl(''));
            outputForm.addControl('y_label', new FormControl(''));
            outputForm.addControl('x_values', new FormControl(''));
            outputForm.addControl('y_values', new FormControl(''));
            // outputForm.removeControl('pie_values');
            // outputForm.removeControl('pie_labels');
          }
        })
      }

      let outputRow: OutputArrayModel = {
        data: node,
        category: null,
        config: [],
        dependencies: [],
        targets: [],
        inputs: [],
        name: '',
        name_id: nodeId,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
        outputs: [],
        task: null,
        taskImage: null,
        type: node.name === "Chart" ? "Chart Task" : "Notification Task",
        timeout: 3600,
        retries: 0,
        trigger_rule: 'all_success',
        outputForm: outputForm,
      }
      this.outputArr.push(outputRow);
    }
  }

  /* - Save the modified values as per payload */
  saveOutputDetails(outputForm: FormGroup) {
    const outputFormValue = outputForm.getRawValue();
    this.outputArr.forEach(output => {
      if (output.name_id === outputFormValue.name_id) {
        let configRow = {};
        output.name = outputFormValue.name;
        if (output.type === 'Notification Task' || output.type === 'Email') {
          configRow = {
            to: outputFormValue.to,
            subject: outputFormValue.subject,
            body: outputFormValue.body
          }
        }
        if (output.type === 'Chart Task' || output.type === 'Chart') {
          if (outputFormValue.chart_type === 'Pie') {
            configRow = {
              chart_type: outputFormValue.chart_type,
              x_values: outputFormValue.x_values,
              y_values: outputFormValue.y_values
            }
          } else {
            configRow = {
              chart_type: outputFormValue.chart_type,
              x_label: outputFormValue.x_label,
              y_label: outputFormValue.y_label,
              x_values: outputFormValue.x_values,
              y_values: outputFormValue.y_values
            }
          }
        }

        output.timeout = outputFormValue.timeouts;
        output.retries = outputFormValue.retries;

        let configIndex = (output.config.findIndex(o => o.to === outputFormValue.to && o.subject === outputFormValue.subject && o.body === outputFormValue.body));
        if (configIndex !== -1) {
          output.config[configIndex] = configRow;
        } else {
          output.config.push(configRow);
        }
      }
    });
    this.closeOutputDetails();
  }

  /* - Close the right panel and remove highlight from all the nodes. */
  closeOutputDetails() {
    this.showEmailOutputDetails = false;
    this.showChartOutputDetails = false;
    if (this.selectedNode) {
      const prevHeader = this.selectedNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedIfConditionNode) {
      const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSwitchConditionNode) {
      const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedEmailNode) {
      const prevHeader = this.selectedEmailNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedChartNode) {
      const prevHeader = this.selectedChartNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSourceTaskNode) {
      const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
  }


  waitForEditorAndImport(drawflowData: any) {
    const container = document.getElementById('drawflow');

    const tryImport = () => {
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        try {
          this.editor.clear();
          this.editor.import(drawflowData);
          console.log('Successfully imported into Drawflow');
        } catch (err) {
          console.error('Error during editor.import():', err);
        }
      } else {
        // Wait one more frame
        requestAnimationFrame(tryImport);
      }
    };

    requestAnimationFrame(tryImport);
  }


  //******************************************* Edit Scenario Start *******************************************************//
  /*
    - Get the workflow details from the API.
    - Plot the drawflow based on design_data value from API.
    - Use the response values to build different forms and display data.
  */
  getWorkflowDetails() {
    this.svc.getWorkflowDetails(this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workFlowData = res;
      this.getStartNodeEdit(res.tasks.find(t => t.name_id === 'node_1' || t.name_id === 'task_1'));
      this.getFormattedTaskListEdit(res.tasks.filter(t => (t.name_id !== 'node_1' && t.name_id !== 'task_1') && (t.name_id !== 'node_2' && t.name_id !== 'task_2')));
      this.getEndNodeEdit(res.tasks.find(t => t.name_id === 'node_2' || t.name_id === 'task_2'));
      const drawflowData = this.generateDrawflowStructureEdit(this.formattedTask);
      if (this.editor) {
        this.editor.import(res.design_data);
        // this.editor.import(drawflowData);
        this.waitForEditorAndImport(drawflowData);
      }
      this.workflowDetailsForm.patchValue({
        workflow_name: res.workflow_name,
        description: res.description,
        category: res.category,
        target_type: res?.target_type,
        cloud: res.cloud ? res.cloud : ''
      });
      this.workFlowViewData = this.svc.convertToWorkflowPopupViewData(this.workflowDetailsForm.getRawValue());
      this.handleWorkflowParamsFormEdit();
      res.tasks.forEach(val => {
        let isConditionTask = val.type === 'Condition Task';
        let isRegularTask = Object.values(playbookTypes).includes(val.type as playbookTypes) ? true : false;
        let isEmailTask = val.type === 'Notification Task';
        let isChartTask = val.type === 'Chart Task';
        let isSourceTask = val.type === 'Source Task';
        let isLLMTask = val.type === 'LLM Task';
        let nodeRow = val;

        if (isConditionTask) {
          const config = val?.config?.[0];
          if (config?.execute_if) {
            nodeRow['ifConditionForm'] = this.svc.buildIfElseForm(val, val.name_id);
            nodeRow['data'] = { name: 'If Else' };
            this.conditionArr.push(nodeRow);
          } else if (config?.execute) {
            nodeRow['switchConditionForm'] = this.svc.buildSwitchForm(val, val.name_id);
            nodeRow['data'] = { name: 'Switch Case' };
            this.conditionArr.push(nodeRow);
          }
        } else if (isRegularTask) {
          nodeRow['inputForm'] = this.svc.buildSelectedTaskForm(val, val.name_id);
          this.taskDetailsArr.push(nodeRow);
        } else if (isEmailTask) {
          nodeRow['outputForm'] = this.svc.buildEmailForm(val, val.name_id);
          this.outputArr.push(nodeRow);
        } else if (isChartTask) {
          nodeRow['outputForm'] = this.svc.buildChartForm(val, val.name_id);
          this.outputArr.push(nodeRow);
        } else if (isSourceTask) {
          nodeRow['sourceTaskForm'] = this.svc.buildSelectedSourceTaskForm(val, val.name_id);
          this.sourceTaskDetailsArr.push(nodeRow);
        }
        else if (isLLMTask) {
          nodeRow['llmForm'] = this.svc.buildLLMForm(val, val.name_id);
          this.llmArr.push(nodeRow);
        }

        setTimeout(() => {
          Object.values(this.editor.drawflow.drawflow.Home.data).forEach((node: any) => {
            const nodeElement = document.getElementById(node.data.uniqueNodeId);
            if (nodeElement) {
              const headerElement = nodeElement.querySelector('.node-header');
              let nodeType = '';
              if (this.conditionArr.some(cond => cond.type === 'Condition Task')) {
                nodeType = 'condition';
              }
              if (this.taskDetailsArr.some(task => Object.values(playbookTypes).includes(task.type))) {
                nodeType = 'task';
              }
              if (this.outputArr.some(o => o.type === 'Notification Task' || o.type === 'Chart Task')) {
                nodeType = 'output';
              }
              if (this.sourceTaskDetailsArr.some(st => st.type === 'Source Task')) {
                nodeType = 'source';
              }
              if (this.llmArr.some(st => st.type === 'LLM Task')) {
                nodeType = 'LLM';
              }

              nodeElement.setAttribute('data-node-type', nodeType);
              if (!nodeElement.dataset.listenerAttached) {
                nodeElement.dataset.listenerAttached = "true";

                this.renderer.listen(headerElement, 'click', (event: MouseEvent) => {
                  const clickedElement = event.target as HTMLElement;
                  const nodeDiv = clickedElement.offsetParent as HTMLElement;
                  const nodeId = nodeDiv?.id;
                  let selectedNodeData = this.workFlowData.tasks.find(val => {
                    if (val.name_id.includes('output') || val.name_id.includes('source')) {
                      if (val.name_id.split('_')[2] === nodeId.split('-')[1]) {
                        return val;
                      }
                    } else {
                      if (val.name_id.split('_')[1] === nodeId.split('-')[1]) {
                        return val;
                      }
                    }
                  });

                  const config = selectedNodeData?.config?.[0];
                  const clickedNodeType = (selectedNodeData?.switchConditionForm || selectedNodeData?.ifConditionForm)
                    ? 'condition' : selectedNodeData?.outputForm ? 'output' : selectedNodeData?.sourceTaskForm ? 'source' :
                      selectedNodeData?.llmForm ? 'LLM' : 'task';
                  if (clickedNodeType === 'condition') {
                    this.handleConditionEdit(nodeId, config, headerElement, nodeElement);
                  } else if (clickedNodeType === 'task') {
                    this.handleTaskEdit(nodeId, headerElement, nodeElement);
                  } else if (clickedNodeType === 'output') {
                    if (isChartTask) {
                      this.handleOutputEdit(nodeId, headerElement, nodeElement, 'Chart Task');
                    } else {
                      this.handleOutputEdit(nodeId, headerElement, nodeElement, 'Notification Task');
                    }
                  } else if (clickedNodeType === 'source') {
                    this.handleSourceTaskEdit(nodeId, headerElement, nodeElement);
                  } else if (clickedNodeType === 'LLM') {
                    this.handleLLMEdit(nodeId, headerElement, nodeElement);
                  }
                });
              }
            }
          });
        }, 200);
      });
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  /* - Used to view existing Workflow Params form in right Panel on click of info icon. */
  handleWorkflowParamsFormEdit() {
    this.workflowParamsForm = this.svc.buildWorkflowParamForm(this.workFlowViewData);
    this.workflowParamsForm.patchValue({
      workflow_name: this.workFlowViewData.workflow_name,
      description: this.workFlowViewData.description,
      category: this.workFlowViewData.category,
      target_type: this.workFlowViewData?.target_type,
    });
    const paramArray = this.workflowParamsForm.get('parameters') as FormArray;
    paramArray.clear();
    this.workFlowData.parameters.forEach((param, index) => {
      paramArray.push(this.svc.getParameterForm(param));
      this.onSelectTemplate(index);
    });
    const paramGroups = this.parameters.controls as FormGroup[];
    paramGroups.forEach(control => {
      control.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
        if (type !== 'Input Template') {
          control.removeControl('template');
          control.removeControl('attribute');
        } else {
          control.addControl('template', new FormControl(''));
          control.addControl('attribute', new FormControl(''));
        }
      })
    });

    this.workflowParamsForm.get('category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cat => {
      switch (cat) {
        case 'Provisioning':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => type === 'Cloud');
          this.workflowParamsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        case 'Operational':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => ['Host', 'Local'].includes(type));
          this.workflowParamsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        case 'Integration':
          this.targetTypeOptions = this.workflowMetadata.target_type.filter(type => type === 'Local');
          this.workflowParamsForm.get('target_type').setValue(this.targetTypeOptions[0]);
          break;
        default:
          this.targetTypeOptions = this.workflowMetadata.target_type;
      }
    });

    this.workflowParamsForm.get('target_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Cloud') {
        this.workflowParamsForm.addControl('cloud', new FormControl(this.workFlowViewData.cloud, [Validators.required]))
      } else {
        this.workflowParamsForm.removeControl('cloud');
      }
    });

    this.formErrors = {};
    this.formErrors['parameters'] = [];
    this.formErrors.parameters.push(this.svc.getParameterErrors());
  }

  /* - Used to view existing Conditions form in right Panel on click of any condition Node */
  handleConditionEdit(nodeId, config, headerElement, nodeElement) {
    if (config?.execute_if || config?.next_if) {
      if (this.selectedIfConditionNode) {
        this.selectedIfConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedSwitchConditionNode) {
        this.selectedSwitchConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedNode) {
        this.selectedNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedEmailNode) {
        this.selectedEmailNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedChartNode) {
        this.selectedChartNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedLLMNode) {
        this.selectedLLMNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      headerElement.classList.add('node-header-active');
      this.selectedIfConditionNode = nodeElement;
    } else {
      if (this.selectedSwitchConditionNode) {
        this.selectedSwitchConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedIfConditionNode) {
        this.selectedIfConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedNode) {
        this.selectedNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedEmailNode) {
        this.selectedEmailNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedChartNode) {
        this.selectedChartNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      if (this.selectedLLMNode) {
        this.selectedLLMNode.querySelector('.node-header')?.classList.remove('node-header-active');
      }
      headerElement.classList.add('node-header-active');
      this.selectedSwitchConditionNode = nodeElement;
    }
    const selectedConditionData = this.conditionArr.find(con => (con.name_id === `node_${nodeId.split('-')[1]}`) || (con.name_id === nodeId));
    this.viewConditionDetails(selectedConditionData.name_id);
  }

  /* - Used to view existing Tasks form in right Panel on click of any task Node */
  handleTaskEdit(nodeId, headerElement, nodeElement) {
    if (this.selectedNode) {
      this.selectedNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedIfConditionNode) {
      this.selectedIfConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedSwitchConditionNode) {
      this.selectedSwitchConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedEmailNode) {
      this.selectedEmailNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedChartNode) {
      this.selectedChartNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedLLMNode) {
      this.selectedLLMNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    headerElement.classList.add('node-header-active');
    this.selectedNode = nodeElement;
    const selectedTaskData = this.taskDetailsArr.find(task => (task.name_id === `node_${nodeId.split('-')[1]}`) || (task.name_id === nodeId));
    this.viewTaskDetails({ name: selectedTaskData?.name, uuid: selectedTaskData?.uuid, type: 'task' }, selectedTaskData.name_id);
  }

  /* - Used to view existing Outputs form in right Panel on click of any output Node */
  handleOutputEdit(nodeId, headerElement, nodeElement, type?: string) {
    if (this.selectedEmailNode) {
      this.selectedEmailNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedChartNode) {
      this.selectedChartNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedNode) {
      this.selectedNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedIfConditionNode) {
      this.selectedIfConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedSwitchConditionNode) {
      this.selectedSwitchConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedLLMNode) {
      this.selectedLLMNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    // this.taskCounter = this.taskDetailsArr.length;
    headerElement.classList.add('node-header-active');
    if (type === 'Chart Task') {
      this.selectedChartNode = nodeElement;
    }
    if (type === 'Notification Task' || type === 'Email') {
      this.selectedEmailNode = nodeElement;
    }
    const selectedOutputData = this.outputArr.find(op => (op.name_id === `node_${nodeId.split('-')[1]}`) || (op.name_id === nodeId));
    this.viewOutputDetails(selectedOutputData.name_id);
  }
  /* - Used to view existing Tasks form in right Panel on click of any task Node */
  handleSourceTaskEdit(nodeId, headerElement, nodeElement) {
    if (this.selectedNode) {
      this.selectedNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedIfConditionNode) {
      this.selectedIfConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedSwitchConditionNode) {
      this.selectedSwitchConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedEmailNode) {
      this.selectedEmailNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedChartNode) {
      this.selectedChartNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedSourceTaskNode) {
      this.selectedSourceTaskNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }

    headerElement.classList.add('node-header-active');
    this.selectedSourceTaskNode = nodeElement;
    const selectedSourceTaskData = this.sourceTaskDetailsArr.find(task => (task.name_id === `node_${nodeId.split('-')[1]}`) || (task.name_id === nodeId));
    this.viewSourceTaskDetails({ name: selectedSourceTaskData?.name, uuid: selectedSourceTaskData?.uuid, type: 'source task' }, selectedSourceTaskData.name_id);
  }

  /* - Used to view existing Tasks form in right Panel on click of any task Node */
  handleLLMEdit(nodeId, headerElement, nodeElement) {
    if (this.selectedNode) {
      this.selectedNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedIfConditionNode) {
      this.selectedIfConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedSwitchConditionNode) {
      this.selectedSwitchConditionNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedEmailNode) {
      this.selectedEmailNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedSourceTaskNode) {
      this.selectedSourceTaskNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedChartNode) {
      this.selectedChartNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    if (this.selectedLLMNode) {
      this.selectedLLMNode.querySelector('.node-header')?.classList.remove('node-header-active');
    }
    headerElement.classList.add('node-header-active');
    this.selectedLLMNode = nodeElement;
    this.viewLLMDetails(`node_${nodeId.split('-')[1] || nodeId.split('_')[1]}`);
  }
  //******************************************* Edit Scenario End *******************************************************//

  //******************************************* Source Task Start *******************************************************//
  /* - Below method sets the task details array as per API format.*/
  setSourceTaskDetails(node: NodeDataModel, pos_x: number, pos_y: number, nodeId?: string) {
    let taskRow: SourceTaskArrayModel = {
      category: this.sourceCategoryList.filter(cat => cat.tasks.some(task => task.taskUuid === node.uuid))[0].category,
      config: [],
      dependencies: [],
      targets: [],
      inputs: [...this.selectedSourceTaskDetails.inputs],
      name: node.name,
      name_id: nodeId,
      pos_x: pos_x,
      pos_y: pos_y,
      outputs: [...this.selectedSourceTaskDetails.outputs],
      source_task: node.uuid,
      taskImage: node.image,
      type: 'Source Task',
      timeout: 3600,
      retries: 0,
      trigger_rule: 'all_success',
      sourceTaskForm: this.svc.buildSelectedSourceTaskForm(this.selectedSourceTaskDetails, nodeId)
    }
    this.sourceTaskDetailsArr.push(taskRow);
  }

  viewSourceTaskDetails(node: NodeDataModel, nodeId?: string) {
    if (this.workFlowId && this.sourceTaskDetailsArr.some(task => task.uuid === node.uuid)) {
      this.selectedSourceTask = this.sourceTaskDetailsArr.find(t => t.uuid === node.uuid && t.name_id === nodeId);
    }
    if (!this.workFlowId || (this.workFlowId && !this.sourceTaskDetailsArr.some(task => task.uuid === node.uuid))) {
      this.selectedSourceTask = this.sourceTaskDetailsArr.find(t => t.source_task === node.uuid && t.name_id === nodeId);
    }
    this.selectedTaskImg = this.crudSvc.getSelectedNodeImage(this.selectedSourceTask?.type);
    this.selectedSourceTask.sourceTaskForm.get('task_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const nodeElement = document.getElementById(nodeId);
      if (nodeElement) {
        const headerElement = nodeElement.querySelector('.node-header') as HTMLElement;
        const nodeIdNum = nodeId.split('_')[1];
        const currentData = this.editor.getNodeFromId(nodeIdNum).data;
        const nodeData = this.editor.drawflow.drawflow.Home.data[nodeIdNum];

        nodeData.name = val;

        const updatedSourceTask: SourceTaskDetailsViewData = {
          icon: currentData.icon,
          taskName: val,
          taskUuid: currentData.taskUuid
        };

        this.editor.updateNodeDataFromId(nodeIdNum, {
          label: updatedSourceTask,
          uniqueNodeId: nodeId
        });

        if (headerElement) {
          headerElement.innerText = val;
          const htmlString = this.editor.drawflow.drawflow.Home.data[nodeIdNum].html as string;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlString.trim();
          const headerEl = tempDiv.querySelector('.node-header') as HTMLElement;
          if (headerEl) {
            headerEl.innerText = val;
          }
          this.editor.drawflow.drawflow.Home.data[nodeIdNum].html = tempDiv.innerHTML;
        }
      }
    });
    this.showIfConditionDetails = false;
    this.showSwitchConditionDetails = false;
    this.showWorkFlowParams = false;
    this.showEmailOutputDetails = false;
    this.showTaskDetails = false;
    this.showLLMDetails = false;
    this.showSourceTaskDetails = true;
    this.showChartOutputDetails = false;
    this.showWorkflowAssistant = false;
  }

  /* - API call to get template details like input parameters for a specific source task using task id */
  getDetailsOfSelectedSourceTask(node: NodeDataModel, nodeId?: string) {
    this.spinner.start('main');
    this.svc.getSourceTaskDetails(node.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedSourceTaskDetails = res;
      if (!this.sourceTaskDetailsArr.some(task => task.name_id === nodeId)) {
        this.setSourceTaskDetails(node, node.pos_x, node.pos_y, nodeId);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  /* - Toggle task name accordion in right panel */
  toggleSourceTaskNameAccordion() {
    this.isOpenSourceTaskName = !this.isOpenSourceTaskName;
  }

  /* - Toggle Input parameter Accordion */
  toggleSourceTaskInputParamAccordion() {
    this.isOpenSourceTaskInputParam = !this.isOpenSourceTaskInputParam;
  }

  /* - Toggle Output parameter Accordion */
  toggleSourceTaskOutputParamAccordion() {
    this.isOpenSourceTaskOutputParam = !this.isOpenSourceTaskOutputParam;
  }

  /* - Toggle Trigger Rule Accordion */
  toggleSourceTaskTriggerRule() {
    this.isOpenSourceTaskTriggerRule = !this.isOpenSourceTaskTriggerRule;
  }

  /* - Toggle Configulation Accordion */
  toggleSourceTaskConfiguration() {
    this.isOpenSourceTaskConfiguration = !this.isOpenSourceTaskConfiguration;
  }

  /* - Close the right panel and remove the highlight class from the node header */
  closeSourceTaskDetails() {
    this.showSourceTaskDetails = false;
    if (this.selectedNode) {
      const prevHeader = this.selectedNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedIfConditionNode) {
      const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSwitchConditionNode) {
      const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedEmailNode) {
      const prevHeader = this.selectedEmailNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSourceTaskNode) {
      const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedChartNode) {
      const prevHeader = this.selectedChartNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedLLMNode) {
      const prevHeader = this.selectedLLMNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
  }

  /* - Save the details enetered in the form to the sourceTaskDetailsArr to be sent the payload. */
  saveSourceTaskDetails(sourceTaskForm: FormGroup) {
    const sourceTaskFormValue = sourceTaskForm.getRawValue();
    this.sourceTaskDetailsArr.forEach(sourceTask => {
      if (sourceTask.name_id === sourceTaskFormValue.name_id) {
        sourceTask.name = sourceTaskFormValue.task_name;
        sourceTask.outputs.forEach((op, index) => {
          sourceTaskFormValue.outputs.forEach(formInp => {
            if (op.param_name === formInp.param_name) {
              sourceTask.outputs[index] = _clone(formInp);
            }
          });
        });
        sourceTask.trigger_rule = sourceTaskFormValue.triggerRule;
        sourceTask.timeout = sourceTaskFormValue.timeouts;
        sourceTask.retries = sourceTaskFormValue.retries;
        sourceTask.inputs.forEach((inp, index) => {
          sourceTaskFormValue.inputs.forEach(formInp => {
            if (inp.param_name === formInp.param_name) {
              sourceTask.inputs[index] = _clone(formInp);
            }
          });
        });
      }
    });
    this.closeSourceTaskDetails();
  }


  //******************************************* Source Task End *******************************************************//

  //********************************************* LLM Right Panel Start *************************************************************//

  /* - Below method sets the task details array as per API format.*/
  setLLM(node: NodeDataModel, nodeId?: string) {
    // llmId = `output_node_${Number((llmId).split('_')[2]) + 1}`;
    if (!this.llmArr.some(o => o.name_id === nodeId)) {
      // this.selectedOutput.emailForm.reset();
      let llmForm = null;

      if (node.name === "LLM") {
        if (!this.workFlowId) {
          this.selectedLLM = undefined;
        }
        llmForm = this.svc.buildLLMForm(this.selectedLLM, nodeId);
      }

      let llmRow = {
        // data: data,
        category: null,
        config: [],
        dependencies: [],
        targets: [],
        inputs: [],
        name: '',
        name_id: nodeId,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
        outputs: [llmForm.get('outputs') as FormArray],
        task: null,
        taskImage: null,
        type: "LLM Task",
        timeout: 3600,
        retries: 0,
        trigger_rule: 'all_success',
        llmForm: llmForm,
      }
      this.llmArr.push(llmRow);
    }
  }

  /* - Toggle task name accordion in right panel */
  toggleLLMNameAccordion() {
    this.isOpenLLMName = !this.isOpenLLMName;
  }

  /* - Toggle Input parameter Accordion */
  toggleLLMPropertiesAccordion() {
    this.isOpenLLMProperties = !this.isOpenLLMProperties;
  }

  /* - Toggle Output parameter Accordion */
  toggleLLMOutputParamAccordion() {
    this.isOpenLLMOutputParam = !this.isOpenLLMOutputParam;
  }



  /* - Close the right panel and remove the highlight class from the node heeader */
  closeLLMDetails() {
    this.showLLMDetails = false;
    if (this.selectedNode) {
      const prevHeader = this.selectedNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedIfConditionNode) {
      const prevHeader = this.selectedIfConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSwitchConditionNode) {
      const prevHeader = this.selectedSwitchConditionNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedEmailNode) {
      const prevHeader = this.selectedEmailNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedSourceTaskNode) {
      const prevHeader = this.selectedSourceTaskNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedChartNode) {
      const prevHeader = this.selectedChartNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
    if (this.selectedLLMNode) {
      const prevHeader = this.selectedLLMNode.querySelector('.node-header');
      if (prevHeader) {
        prevHeader.classList.remove('node-header-active');
      }
    }
  }

  /* - Save the details enetered in the form to the taskDetailsArr to be sent the payload. */
  saveLLMDetails(llmForm: FormGroup) {
    const llmFormValue = llmForm.getRawValue();
    this.llmArr.forEach(llm => {
      if (llm.name_id === llmFormValue.name_id) {
        llm.name = llmFormValue.name;
        llm.timeout = llmFormValue.timeouts;
        llm.retries = llmFormValue.retries;
        llm.outputs.forEach((op, index) => {
          llmFormValue.outputs.forEach(formInp => {
            if (op.param_name === formInp.param_name) {
              llm.outputs[index] = _clone(formInp);
            }
          });
        });
        const normalize = (str: string) =>
          str.replace(/\s/g, ''); // removes spaces, tabs, newlines, etc.
        let configRow = {
          user_prompt: llmFormValue.user_prompt,
          output_type: llmFormValue.output_type
        }
        // let configIndex = (llm.config.findIndex(o => normalize(o.user_prompt) === normalize(llmFormValue.user_prompt) && o.output_type === llmFormValue.output_type));
        // if (configIndex !== -1) {
        llm.config[0] = configRow;
        // } else {
        //   llm.config.push(configRow);
        // }
      }
    });
    this.closeLLMDetails();
  }

  /*
    - Below function opens sets the data and set the flags to show the details of selected task in right panel.
    - This also syncs the Task name with the Form Control "task_name" and adds the changes to drawflow structure.
  */
  viewLLMDetails(nodeId: string) {
    this.selectedLLM = this.llmArr.find(llm => llm.name_id === nodeId);
    this.selectedTaskImg = this.crudSvc.getSelectedNodeImage('LLM');
    this.selectedLLM.llmForm.get('name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const nodeElement = document.getElementById(nodeId);
      if (nodeElement) {
        const headerElement = nodeElement.querySelector('.node-header') as HTMLElement;
        let nodeIdNum: number = Number(nodeId.split('_')[1]);
        const currentData = this.editor.getNodeFromId(nodeIdNum).data;
        const nodeData = this.editor.drawflow.drawflow.Home.data[nodeIdNum];

        nodeData.name = val;

        const updatedOutput = {
          icon: currentData.icon,
          output: val
        };

        this.editor.updateNodeDataFromId(nodeIdNum, {
          label: updatedOutput,
          uniqueNodeId: nodeId
        });

        if (headerElement) {
          headerElement.innerText = val;
          const htmlString = this.editor.drawflow.drawflow.Home.data[nodeIdNum].html as string;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlString.trim();
          const headerEl = tempDiv.querySelector('.node-header') as HTMLElement;
          if (headerEl) {
            headerEl.innerText = val;
          }
          this.editor.drawflow.drawflow.Home.data[nodeIdNum].html = tempDiv.innerHTML;
        }
      }
    });
    this.showLLMDetails = true;
    this.showEmailOutputDetails = false;
    this.showIfConditionDetails = false;
    this.showSwitchConditionDetails = false;
    this.showWorkFlowParams = false;
    this.showTaskDetails = false;
    this.showSourceTaskDetails = false;
    this.showChartOutputDetails = false;
    this.showWorkflowAssistant = false;
  }
  //********************************************* LLM Right Panel End *************************************************************//
  //******************************************* Suggestion Dropdown Start *******************************************************//
  /* - This function is triggered when an input is clicked */
  onInputClick(event: MouseEvent, inputField: HTMLElement, index: number) {
    this.showDropdownIndex = index;
    const offsetTop = inputField.offsetTop;
    const inputHeight = inputField.offsetHeight;
    this.dropdownPosition = {
      top: `${offsetTop + inputHeight}px`,
      left: 'auto',
      right: 'auto'
    };
  }
  /* - Handle keyup for suggestions */
  onKeyUp(event: KeyboardEvent, inputIndex: number, type?: string) {
    const input = (event.target as HTMLInputElement).value;
    const ignoredKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'];
    let selectedTaskId;
    if (ignoredKeys.includes(event.key)) {
      return;
    }
    // if (type === 'if' || type === 'switch') {
    //   selectedTaskId = this.selectedCondition.name_id.split('_')[1];
    // } else if (type?.includes('email') || type?.includes('x_values') || type?.includes('y_values')) {
    //   selectedTaskId = this.selectedOutput.name_id.split('_')[1];
    // } else if (type === 'source') {
    //   selectedTaskId = this.selectedSourceTask.name_id.split('_')[1];
    // } else {
    //   selectedTaskId = this.selectedTask.name_id.split('_')[1];
    // }

    if (type === 'if' || type === 'switch') {
      selectedTaskId = this.selectedCondition.name_id || this.selectedCondition.data.uniqueNodeId;
    } else if (type?.includes('email') || type?.includes('x_values') || type?.includes('y_values')) {
      selectedTaskId = this.selectedOutput.name_id || this.selectedOutput.data.uniqueNodeId;
    } else if (type === 'source') {
      selectedTaskId = this.selectedSourceTask.name_id;
    } else {
      selectedTaskId = this.selectedTask.name_id || this.selectedTask.data.uniqueNodeId;
    }
    let dependentNodes = [];
    const nodes = this.editor.export().drawflow.Home.data;
    this.suggestions = this.checkForDependentNodes(selectedTaskId, dependentNodes, nodes);
    this.filteredSuggestions = this.suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(input.toLowerCase())
    );
    if (this.parameters?.controls.length > 0 && !this.hasEmptyValues()) {
      this.parameters.controls.forEach(control => {
        this.filteredSuggestions.push(`"\${params.${control['controls'].param_name.value}}"`.replace(/^"|"$/g, ''));
      });
    }
    this.showDropdownIndex = inputIndex;
  }
  /* - Check for dependent nodes and generate Array off Suggestions */
  checkForDependentNodes(selectedTaskId, dependentNodes, nodes) {
    let taskId = Number(selectedTaskId.split('_')[1]);
    if (nodes[taskId].id === taskId) {
      Object.values(nodes[taskId]?.inputs).forEach((input: any) => {
        input.connections.forEach((connection: any) => {
          if (connection.node !== 1) {
            dependentNodes.push(`"\${task.node_${connection.node}.outputs}"`.replace(/^"|"$/g, ''))
            dependentNodes.push(`"\${task.node_${connection.node}.outputs.<key>}"`.replace(/^"|"$/g, ''));
            this.checkForDependentNodes(`node_${connection.node}`, dependentNodes, nodes)
          }
        });
      });
    }
    return dependentNodes;
  }
  /* - Show the seleected Suggestion and allow modification. */
  selectSuggestion(inputIndex: number, suggestion: string, type?: string) {
    const inputElement = (document.querySelector(`#input-${inputIndex}`) as HTMLInputElement);
    if (inputElement) {
      inputElement.value = suggestion;
    }
    if (type === 'task') {
      const inputParamArray = this.selectedTask?.inputForm.get('inputs') as FormArray;
      inputParamArray.controls[inputIndex].get('default_value').setValue(suggestion);
    }
    if (type === 'if') {
      this.selectedCondition.ifConditionForm.get('ifKey').setValue(suggestion);
    }
    if (type === 'switch') {
      const switchArray = this.selectedCondition?.switchConditionForm.get('switchConditions') as FormArray;
      switchArray.controls[inputIndex].get('switchKey').setValue(suggestion);
    }
    if (type == 'emailTo') {
      this.selectedOutput.outputForm.get('to').setValue(suggestion);
    }
    if (type == 'emailSubject') {
      this.selectedOutput.outputForm.get('subject').setValue(suggestion);
    }
    if (type == 'x_values') {
      this.selectedOutput.outputForm.get('x_values').setValue(suggestion);
    }
    if (type == 'y_values') {
      this.selectedOutput.outputForm.get('y_values').setValue(suggestion);
    }
    // if (type == 'pie_labels') {
    //   this.selectedOutput.outputForm.get('x_value').setValue(suggestion);
    // }
    // if (type == 'pie_values') {
    //   this.selectedOutput.outputForm.get('y_value').setValue(suggestion);
    // }
    if (type == 'source') {
      const inputParamArray = this.selectedSourceTask.sourceTaskForm.get('inputs') as FormArray;
      inputParamArray.controls[inputIndex].get('default_value').setValue(suggestion);
    }
    this.showDropdownIndex = null;
  }
  /* - Hides the suggestion dropdown */
  hideDropdown() {
    setTimeout(() => {
      this.showDropdownIndex = null;
    }, 200);
  }
  //******************************************* Suggestion Dropdown End *******************************************************//


  //******************************************* Common Code Start **************************************************************/

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
  toggleEmailNameAccordion() {
    this.isOpenEmailName = !this.isOpenEmailName;
  }

  toggleEmailDetailsAccordion() {
    this.isOpenEmailDetails = !this.isOpenEmailDetails;
  }

  toggleChartNameAccordion() {
    this.isOpenChartName = !this.isOpenChartName;
  }

  toggleChartDetailsAccordion() {
    this.isOpenChartDetails = !this.isOpenChartDetails;
  }

  // Change zoom level with plus and minus buttons
  changeZoom(direction: number) {
    if (direction === 1) {
      this.editor.zoom_in();
    } else {
      this.editor.zoom_out();
    }
  }


  saveWorkFlow() {
    const drawflowData = this.editor.export();
    this.saveDrawflowData = drawflowData;

    if (this.conditionArr.some(con => con.switchConditionForm)) {
      this.conditionArr.forEach(con => {
        if (con.switchConditionForm) {
          this.viewConditionDetails(con.name_id, true)
          this.saveConditionDetails(con.switchConditionForm)
        }
      })
    }

    if (drawflowData?.drawflow?.Home?.data) {
      const nodes = drawflowData.drawflow.Home.data;
      if (!this.workFlowId) {
        Object.values(nodes).forEach((node: any) => {
          if (node.id === 1 || node.id === 2) {
            let taskRow: TaskArrayModel = {
              category: null,
              config: [],
              dependencies: [],
              targets: [],
              inputs: [],
              name: node.name,
              name_id: `node_${node.id}`,
              pos_x: node.id === 1 ? 100 : 900,
              pos_y: 100,
              outputs: [],
              task: '',
              taskImage: '',
              type: node.id === 1 ? 'Start Task' : 'End Task',
              timeout: 0,
              retries: 0,
              trigger_rule: node.name === 'Start' || node.name === 'End' ? null : '',
            }
            if (this.taskDetailsArr.findIndex(t => t.name_id === taskRow.name_id) === -1) {
              this.taskDetailsArr.push(taskRow);
            }
          }
        });
      } else {
        this.workFlowData.tasks.forEach(t => {
          if (['node_1', 'node_2', 'task_1', 'task_2'].includes(t.name_id) && !this.taskDetailsArr.some(task => task.name_id === t.name_id)) {
            this.taskDetailsArr.push(t);
          }
        });
      }
      this.getTaskDependencies(nodes);
      this.getConditionDependencies(nodes);
      this.getOutputDependencies(nodes);
      this.getSourceTaskDependencies(nodes);
      this.getLLMDependencies(nodes);
    }

    if (this.parameters?.length > 0) {
      if (this.hasEmptyValues()) {
        this.workflowParamsForm.removeControl('parameters');
      }
    }

    const modifiedTaskDetailsArr = this.taskDetailsArr.map(({ inputForm, ...task }) => task);
    const modifiedConditionArr = this.conditionArr.map(({ switchConditionForm, data, ...condition }) => condition);
    const modifiedConditionArr2 = modifiedConditionArr.map(({ ifConditionForm, data, ...condition }) => condition);
    const modifiedOutputDetailsArr = this.outputArr.map(({ outputForm, data, ...email }) => email);
    const modifiedSourceTaskDetailsArr = this.sourceTaskDetailsArr.map(({ sourceTaskForm, ...source_task }) => source_task);
    const modifiedLLMDetailsArr = this.llmArr.map(({ llmForm, ...llm }) => {
      return {
        ...llm,
        outputs: (llmForm.get('outputs') as FormArray)?.value
      };
    });
    const mergedArr = modifiedTaskDetailsArr.concat(modifiedConditionArr2).concat(modifiedOutputDetailsArr).concat(modifiedSourceTaskDetailsArr).concat(modifiedLLMDetailsArr);
    const workflowPayload = {
      uuid: this.workFlowId,
      design_data: this.editor.export(),
      isInProgress: false,
      tasks: _clone(mergedArr),
      ...this.workflowParamsForm.value,
      ...(this.workFlowId ? { uuid: this.workFlowId } : {}
      ),
      is_advanced: true
    }

    const workflowId = this.workFlowId ? this.workFlowId : '';

    if (this.workFlowId) {
      this.svc.saveWorkFlow(workflowPayload, this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.manageCeleryTaskData(workflowId, this.workflowDetailsForm.get('workflow_name').value, res.task_id);
        this.router.navigate(['../../../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update Workflow'));
      });
    } else {
      this.svc.saveWorkFlow(workflowPayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.manageCeleryTaskData(workflowId, this.workflowDetailsForm.get('workflow_name').value, res.task_id);
        this.router.navigate(['../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to create Workflow'));
      });
    }
  }

  getTaskDependencies(nodes) {
    let connectedTaskInputNodes: string[] = [];
    let connectedTaskOutputNodes: string[] = [];
    this.taskDetailsArr.forEach(task => {
      connectedTaskInputNodes = [];
      connectedTaskOutputNodes = [];
      Object.values(nodes).forEach((node: any) => {
        if (`node_${node.id}` === task.name_id) {
          task.pos_x = node.pos_x;
          task.pos_y = node.pos_y;
        }
        Object.values(node?.inputs).forEach((input: any) => {
          input.connections.forEach((connection: any) => {
            if (`node_${node.id}` === task.name_id) {
              connectedTaskInputNodes.push(`node_${connection.node}`);
            }
          });
        });
        if (node.outputs) {
          Object.values(node.outputs).forEach((output: any) => {
            output.connections.forEach((connection: any) => {
              if (`node_${node.id}` === task.name_id) {
                connectedTaskOutputNodes.push(`node_${connection.node}`);
              }
            });
          });
        }
      });
      task.dependencies = _clone(connectedTaskInputNodes);
      task.targets = _clone(connectedTaskOutputNodes);
    });
  }

  getConditionDependencies(nodes) {
    let connectedConditionInputNodes: string[] = [];
    let connectedConditionOutputNodes: string[] = [];
    this.conditionArr.forEach(condition => {
      connectedConditionInputNodes = [];
      connectedConditionOutputNodes = [];
      Object.values(nodes).forEach((node: any) => {
        if (`node_${node.id}` === condition.name_id) {
          condition.pos_x = node.pos_x;
          condition.pos_y = node.pos_y;
        }
        if (node.inputs) {
          Object.values(node.inputs).forEach((input: any) => {
            input.connections.forEach((connection: any) => {
              if (`node_${node.id}` === condition.name_id) {
                connectedConditionInputNodes.push(`node_${connection.node}`);
              }
            });
          });
        }
        if (node.outputs) {
          Object.values(node.outputs).forEach((output: any) => {
            output.connections.forEach((connection: any) => {
              if (`node_${node.id}` === condition.name_id) {
                connectedConditionOutputNodes.push(`node_${connection.node}`);
              }
            });
          });
        }
      });
      condition.dependencies = _clone(connectedConditionInputNodes);
      condition.targets = _clone(connectedConditionOutputNodes);
      condition.type = (condition.type === 'If Else' || condition.type === 'Switch Case') ? 'Condition Task' : 'Condition Task';
      let conditionFormValue;
      if (condition.config.next_if || condition.config.next_else) {
        conditionFormValue = condition.ifConditionForm.getRawValue();
        condition.name = conditionFormValue.name;
        let configRow = {
          execute_if: conditionFormValue.executeIf ? conditionFormValue.executeIf?.includes('-') ? `node_${conditionFormValue.executeIf.split('-')[1]}` : '' : null,
          execute_else: conditionFormValue.executeElse ? conditionFormValue.executeElse?.includes('-') ? `node_${conditionFormValue.executeElse.split('-')[1]}` : '' : null,
          expression: {
            operator: conditionFormValue.operator,
            value: conditionFormValue.updatedValue,
            key: conditionFormValue.ifKey
          }
        }
        if (Array.isArray(condition.config)) {
          let configIndex = condition.config.findIndex(c => c.execute_if === conditionFormValue.executeIf && c.execute_else === conditionFormValue.executeElse);

          if (configIndex !== -1) {
            condition.config[configIndex] = configRow;
          } else {
            condition.config.push(configRow);
          }
        } else {
          condition.config[0] = configRow;
        }
      } else {
        conditionFormValue = condition.switchConditionForm.getRawValue();
        const switchArray = condition.switchConditionForm.get('switchConditions') as FormArray;
        // Update output count based on saved switch conditions
        this.noOfOutputNode = switchArray.length;
        condition.name = conditionFormValue.name;
        conditionFormValue.switchConditions.forEach((switchCondition: any) => {
          if (!switchCondition.execute) return;
          let configRow = {
            execute: switchCondition.execute ? switchCondition.execute.includes('-') ? `node_${switchCondition.execute.split('-')[1]}` : '' : null,
            expression: {
              operator: switchCondition.operator,
              value: switchCondition.updatedValue,
              key: switchCondition.switchKey
            }
          };
          let configIndex = condition.config.findIndex(c => c.execute === switchCondition.execute);
          if (configIndex !== -1) {
            condition.config[configIndex] = configRow;
          } else {
            condition.config.push(configRow);
          }
        });
      }
    });
  }

  getOutputDependencies(nodes) {
    let connectedOpInputNodes: string[] = [];
    let connectedOpOutputNodes: string[] = [];
    this.outputArr.forEach(op => {
      connectedOpInputNodes = [];
      connectedOpOutputNodes = [];
      Object.values(nodes).forEach((node: any) => {
        if (`node_${node.id}` === op.name_id) {
          op.pos_x = node.pos_x;
          op.pos_y = node.pos_y;
        }
        Object.values(node?.inputs).forEach((input: any) => {
          input.connections.forEach((connection: any) => {
            if (`node_${node.id}` === op.name_id) {
              connectedOpInputNodes.push(`node_${connection.node}`);
            }
          });
        });
        if (node.outputs) {
          Object.values(node.outputs).forEach((output: any) => {
            output.connections.forEach((connection: any) => {
              if (`node_${node.id}` === op.name_id) {
                connectedOpOutputNodes.push(`node_${connection.node}`);
              }
            });
          });
        }
      });
      op.dependencies = _clone(connectedOpInputNodes);
      op.targets = _clone(connectedOpOutputNodes);
    });

  }

  getSourceTaskDependencies(nodes) {
    let connectedSourceTaskInputNodes: string[] = [];
    let connectedSourceTaskOutputNodes: string[] = [];
    this.sourceTaskDetailsArr.forEach(sourceTask => {
      connectedSourceTaskInputNodes = [];
      connectedSourceTaskOutputNodes = [];
      Object.values(nodes).forEach((node: any) => {
        if (`node_${node.id}` === sourceTask.name_id) {
          sourceTask.pos_x = node.pos_x;
          sourceTask.pos_y = node.pos_y;
        }
        Object.values(node?.inputs).forEach((input: any) => {
          input.connections.forEach((connection: any) => {
            if (`node_${node.id}` === sourceTask.name_id) {
              connectedSourceTaskInputNodes.push(`node_${connection.node}`);
            }
          });
        });
        if (node.outputs) {
          Object.values(node.outputs).forEach((output: any) => {
            output.connections.forEach((connection: any) => {
              if (`node_${node.id}` === sourceTask.name_id) {
                connectedSourceTaskOutputNodes.push(`node_${connection.node}`);
              }
            });
          });
        }
      });
      sourceTask.dependencies = _clone(connectedSourceTaskInputNodes);
      sourceTask.targets = _clone(connectedSourceTaskOutputNodes);
    });
  }

  getLLMDependencies(nodes) {
    let connectedLLMInputNodes: string[] = [];
    let connectedLLMOutputNodes: string[] = [];
    this.llmArr.forEach(llm => {
      connectedLLMInputNodes = [];
      connectedLLMOutputNodes = [];
      Object.values(nodes).forEach((node: any) => {
        if (`node_${node.id}` === llm.name_id) {
          llm.pos_x = node.pos_x;
          llm.pos_y = node.pos_y;
        }
        Object.values(node?.inputs).forEach((input: any) => {
          input.connections.forEach((connection: any) => {
            if (`node_${node.id}` === llm.name_id) {
              connectedLLMInputNodes.push(`node_${connection.node}`);
            }
          });
        });
        if (node.outputs) {
          Object.values(node.outputs).forEach((output: any) => {
            output.connections.forEach((connection: any) => {
              if (`node_${node.id}` === llm.name_id) {
                connectedLLMOutputNodes.push(`node_${connection.node}`);
              }
            });
          });
        }
      });
      llm.dependencies = _clone(connectedLLMInputNodes);
      llm.targets = _clone(connectedLLMOutputNodes);
    });
  }

  manageCeleryTaskData(workFlowId: string, workFlowName: string, taskId: string) {
    let workFlowInProgress = this.svc.convertToEntityTaskRelation(workFlowId, workFlowName, taskId);
    if (workFlowInProgress) {
      // let workflowTaskIndex = this.workflowsInProgress.findIndex(wp => wp.taskId == workFlowInProgress.taskId);
      // if (workflowTaskIndex == -1) {
      //   this.workflowsInProgress.push(workFlowInProgress);
      // }
      // else {
      //   this.workflowsInProgress.splice(workflowTaskIndex, 1, workFlowInProgress);
      // }
      this.storage.put('workflowsInProgress', _clone(this.workflowsInProgress), StorageType.SESSIONSTORAGE);
    }
    this.goBack();
  }

  goBack() {
    if (this.workFlowId) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }


  //******************************************* Common Code Start **************************************************************/



  // ****************************************** Auto generate nodes ************************************************//
  increaseTaskIds(data: any): any {
    const regex = /^task-(\d+)$/;

    const transform = (obj: any): any => {
      if (Array.isArray(obj)) {
        // Keep it an array
        return obj.map(item => transform(item));
      } else if (obj !== null && typeof obj === 'object') {
        // Keep it an object
        const newObj: any = {};
        for (const key of Object.keys(obj)) {
          const value = obj[key];
          if (typeof value === 'string' && regex.test(value)) {
            // Replace task-{n} with task-{n+2}
            newObj[key] = value.replace(regex, (_, num) => `task-${+num + 2}`);
          } else {
            newObj[key] = transform(value);
          }
        }
        return newObj;
      }
      return obj;
    };

    // Return the transformed data without losing array structure
    return transform(data);
  }


  getFormattedTaskList(tasks): TaskNode[] {
    console.log('>>>>>>>>>>', tasks)
    if (tasks) {
      tasks.forEach(task => {
        let outputIds: number[] = [];
        let taskId = Number(task.id?.split('-')[1]);
        const conf = task.config;

        if (task.type === 'If Else') {
          const ifNode = conf?.next_if ? Number(conf?.next_if?.split('-')[1]) : null;
          const elseNode = conf?.next_else ? Number(conf?.next_else?.split('-')[1]) : null;
          if (ifNode) outputIds.push(ifNode);
          if (elseNode) outputIds.push(elseNode);

        } else if (task.type === 'Switch Case') {
          task.config.forEach(c => {
            const node = c?.next ? Number(c?.next?.split('-')[1]) : null;
            if (node) outputIds.push(node);
          });

        } else {
          if (task.next !== null) {
            const node = Number(task?.next?.split('-')[1]);
            if (node) outputIds.push(node);
          } else {
            outputIds.push(2);
          }
        }

        let taskObj: any = {
          id: taskId,
          name: task.type === 'If Else' ? task.config.condition : task.name,
          type: task.type,
          outputs: _clone(outputIds),
          data: {
            uniqueNodeId: this.getNodeId(task, taskId),
            label: {
              type: task.type,
              name: task.name,
              image: this.getNodeImage(task),
              uuid: task.uuid,
              playbook: task.playbook
            }
          }
        }

        if ((task.type === 'If Else' || task.type === 'Switch Case') && task.config) {
          taskObj.config = _clone(task.config);
        }

        this.formattedTask.push(taskObj);

      });

      return this.formattedTask;
    }
  }

  generateDrawflowStructure(tasks): any {
    const nodeMap = new Map<number, DrawflowNode>();
    const placed = new Set<number>();
    let x = 100;
    let y = 100;

    // Iterate tasks in the exact order they come from API
    for (const task of tasks) {
      const outputs = {};
      const inputs = {};

      // Build outputs object with proper connections
      if (task.outputs && task.outputs.length > 0) {
        const validConnections = [];
        const conf = task.config;
        if ((task.type === 'If Else' || task.type === 'Condition Task') && (conf?.next_if || conf?.next_else)) {
          // It's an IF-ELSE block
          const ifTargetId = conf?.next_if ? Number(conf.next_if.split('-')[1]) : null;
          const elseTargetId = conf?.next_else ? Number(conf.next_else.split('-')[1]) : null;
          outputs['output_1'] = {
            connections: []
          };
          outputs['output_2'] = {
            connections: []
          };
          outputs['output_1'] = {
            connections: ifTargetId ? [{ node: ifTargetId, output: 'input_1' }] : []
          };
          outputs['output_2'] = {
            connections: elseTargetId ? [{ node: elseTargetId, output: 'input_1' }] : []
          };
        } else if ((task.type === 'Switch Case' || task.type === 'Condition Task') && Array.isArray(conf)) {
          // It's a SWITCH-CASE block
          conf.forEach((caseConf, index) => {
            const caseTargetId = Number(caseConf?.next?.split('-')[1]);

            // Skip invalid/missing target nodes
            const targetExists = tasks.some(t => t.id === caseTargetId);
            if (!targetExists) {
              console.warn(`Skipping missing switch-case target: node_${caseTargetId}`);
              return;
            }

            outputs[`output_${index + 1}`] = {
              connections: [{ node: caseTargetId, output: 'input_1' }]
            };
          });
        } else {
          console.log('>>>>>>>>>>', task.type)
          // Default Task (not condition type) - each target gets its own numbered output
          task.outputs.forEach((targetIdStr, index) => {
            const targetId = Number(targetIdStr);
            const targetExists = tasks.some(t => t.id === targetId);
            if (!targetExists) {
              console.warn(`Skipping connection to missing node: ${targetId}`);
              return;
            }

            outputs[`output_${index + 1}`] = {
              connections: [{
                node: targetId,
                output: 'input_1'
              }]
            };
          });

          if (validConnections.length > 0) {
            outputs['output_1'] = {
              connections: validConnections
            };
          }
        }
      }

      // Build inputs object by looking for tasks that point to current task
      tasks.forEach(source => {
        if (!source.outputs.length) return;

        source.outputs.forEach((targetIdStr, outputIdx) => {
          const targetId = Number(targetIdStr);
          if (targetId !== task.id) return;

          const inputKey = 'input_1';
          let outputKey = 'output_1'; // Default
          const conf = source.config;

          if (source.type === 'If Else') {
            // const baseX = source.pos_x || 0;
            const baseY = source.pos_y || 0;

            if (conf.next_if === `task-${task.id}`) {
              outputKey = 'output_1';
              // x = baseX + 300;
              y = baseY; // same line
            }
            else if (conf.next_else === `task-${task.id}`) {
              outputKey = 'output_2';
              // x = baseX + 300;
              y = baseY + 200; // below IF
            }

          } else if (source.type === 'Switch Case') {
            const baseX = source.pos_x || 0;
            const baseY = source.pos_y || 0;
            const switchIndex = conf.findIndex(c => c.next === `task-${task.id}`);

            if (switchIndex !== -1) {
              outputKey = `output_${switchIndex + 1}`;
              // x = baseX + 300;
              y = baseY + (switchIndex * 200); // each case spaced down
            }
          }

          if (source.type === 'End') {
            const lastNode = this.llmResponse.tasks.find(task => task.next === null);
            if (lastNode) {
              x = x + 200;
            }
          }



          if (!inputs[inputKey]) {
            inputs[inputKey] = { connections: [] };
          }

          inputs[inputKey].connections.push({
            node: source.id,
            input: outputKey
          });
        });
      });

      const drawflowNode: DrawflowNode = {
        id: task.id,
        name: task.name,
        inputs,
        outputs,
        pos_x: x,
        pos_y: y,
        html: this.getHtmlForTask(task),
        typenode: false,
        class: this.getClassForTask(task),
        data: task.data ? task.data : ''
      };

      nodeMap.set(task.id, drawflowNode);
      placed.add(task.id);
      x += 300; // Shift X for the next
    }

    console.log({
      drawflow: {
        Home: {
          data: Object.fromEntries(
            // IMPORTANT: convert Map to object preserving insertion order
            [...nodeMap.entries()]
          )
        }
      }
    })
    return {
      drawflow: {
        Home: {
          data: Object.fromEntries(
            // IMPORTANT: convert Map to object preserving insertion order
            [...nodeMap.entries()]
          )
        }
      }
    };
  }


  getStartNode() {
    let startRow = {
      id: 1,
      name: 'Start',
      type: 'Start',
      outputs: [3],
      data: {
        undeletable: true,
        label: 'Start'
      },
      pos_x: 0,
      pos_y: 300
    };
    this.formattedTask.push(startRow);
  }

  getEndNode() {
    let endRow = {
      id: 2,
      name: 'End',
      type: 'End',
      outputs: [],
      data: {
        undeletable: true,
        label: 'End'
      }
    }
    this.formattedTask.push(endRow);
  }

  getHtmlForTask(task): string {
    if (task.name === 'Start') {
      return `<div>
                <strong style="font-size: 12px">Start</strong>
              </div>`
    }
    if (task.name === 'End') {
      return `<div>
                <strong style="font-size: 12px">End</strong>
              </div>`
    }
    let iconHtml = '';
    let img = this.getNodeImage(task);
    if (task.type === 'Condition Task' || task.type === 'LLM Task' || task.type === 'Switch Case' || task.type === 'If Else') {
      iconHtml = `<img src="${img}" height="30" width="30"/>`
    } else if (task.type === 'Notification Task' || task.type === 'Chart Task' ||
      task.type === 'Source Task' || task.type === 'Email') {
      iconHtml = `<i class="${img} pt-2" style="color: grey;"></i>`;
    } else {
      iconHtml = `<img src="${img}" alt="Icon" />`;
    }
    return `<div class="custom-node" id="node_${task.id}">
      <div class="node-header text-truncate">${task.name}</div>
      <div class="node-image">
      ${iconHtml}
      </div>
    </div>`;
  }

  getClassForTask(task: TaskNode): string {
    if (task.name === 'Start') return 'start-node';
    if (task.name === 'End') return 'end-node';
    return 'default-node';
  }

  getStartNodeEdit(task) {
    let outputIds = [];
    this.workFlowData.tasks.sort((a, b) => {
      const idA = parseInt(a.name_id.split('_')[1], 10);
      const idB = parseInt(b.name_id.split('_')[1], 10);
      return idA - idB;
    });
    this.workFlowData.tasks.forEach(t => {
      if (t.dependencies.includes('node_1') || t.dependencies.includes('task_1')) {
        outputIds.push(Number(t.name_id.split('_')[1]));
      }
    });
    let startRow = {
      id: 1,
      name: 'Start',
      type: 'Start',
      outputs: _clone(outputIds),
      data: {
        undeletable: true,
        label: 'Start'
      },
      pos_x: task.pos_x,
      pos_y: task.pos_y
    };
    this.formattedTask.push(startRow);
  }

  getEndNodeEdit(task) {
    let endRow = {
      id: 2,
      name: 'End',
      type: 'End',
      outputs: [],
      data: {
        undeletable: true,
        label: 'End'
      },
      pos_x: task.pos_x,
      pos_y: task.pos_y
    }
    this.formattedTask.push(endRow);
  }

  getFormattedTaskListEdit(tasks): any[] {
    console.log('>>>>>>>>>>', tasks)
    // Sort the tasks array by numeric part of name_id
    tasks.sort((a, b) => {
      const idA = parseInt(a.name_id.split('_')[1], 10);
      const idB = parseInt(b.name_id.split('_')[1], 10);
      return idA - idB;
    });
    if (tasks) {
      const connectedToEnd = this.workFlowData.tasks.find(t => (t.name_id === 'node_2' || t.name_id === 'task_2'))?.dependencies;
      tasks.forEach((task, index) => {
        // const isLast = index === tasks.length - 1;

        let outputIds = [];
        if ((task.name_id === 'node_1' || task.name_id === 'task_1') || (task.name_id === 'node_2' || task.name_id === 'task_2')) {
          return;
        }

        let taskId = Number(task.name_id.split('_')[1]);
        // this.newTaskId++;
        if (task.type === 'Condition Task') {
          if (task.config[0].execute_if && task.config[0].execute_else) {
            const conf = task.config[0];
            const ifNode = conf.execute_if.split('_')[1];
            const elseNode = conf.execute_else.split('_')[1];
            if (ifNode) outputIds.push(ifNode);
            if (elseNode) outputIds.push(elseNode);
          }
          if (task.config[0].execute) {
            const conf = task.config;
            if (conf.every(c => c.execute)) {
              conf.forEach(c => {
                const node = Number(c.execute.split('_')[1]);
                if (node) outputIds.push(node);
              });
            }
          }
          if (connectedToEnd.includes(task.name_id)) {
            outputIds = [2];
          }
        } else {
          // outputIds = [isLast ? 2 : this.newTaskId + 1];
          if (connectedToEnd.includes(task.name_id)) {
            outputIds = [2];
          }
          this.workFlowData.tasks.forEach(t => {
            if (t.dependencies.includes(task.name_id)) {
              outputIds.push(Number(t.name_id.split('_')[1]));
            }
          });
        }

        let row = {
          id: taskId,
          name: task.name,
          type: task.type,
          pos_x: task.pos_x,
          pos_y: task.pos_y,
          outputs: _clone(outputIds),
          data: {
            uniqueNodeId: this.getNodeId(task, taskId),
            label: {
              type: task.type,
              name: task.name,
              image: this.getNodeImage(task),
              uuid: task.uuid,
              playbook: task.playbook,
              pos_x: task.pos_x,
              pos_y: task.pos_y,
            }
          },
          config: _clone(task.config),
          dependencies: _clone(task.dependencies)
        }
        this.formattedTask.push(row);
      });
      return this.formattedTask;
    }
  }

  sanitizeDrawflowData(data: any) {
    for (const pageName in data.drawflow) {
      const page = data.drawflow[pageName];
      for (const nodeId in page.data) {
        const node = page.data[nodeId];
        if (!node.inputs) node.inputs = {};
        if (!node.outputs) node.outputs = {};
        // Replace any "undefined" string in html img src with empty string
        node.html = node.html.replace(/src="undefined"/g, 'src=""');
      }
    }
    return data;
  }

  generateDrawflowStructureEdit(tasks): any {
    const nodeMap = new Map<number, DrawflowNode>();
    const placed = new Set<number>();

    // Iterate tasks in the exact order they come from API
    for (const task of tasks) {
      const outputs = {};
      const inputs = {};

      // Build outputs object with proper connections
      if (task.outputs && task.outputs.length > 0) {
        const validConnections = [];

        if (task.type === 'Condition Task') {
          const conf = task.config;

          if (conf?.[0]?.execute_if && conf?.[0]?.execute_else) {
            // It's an IF-ELSE block
            const ifTargetId = Number(conf[0].execute_if.split('_')[1]);
            const elseTargetId = Number(conf[0].execute_else.split('_')[1]);

            outputs['output_1'] = {
              connections: [{ node: ifTargetId, output: 'input_1' }]
            };
            outputs['output_2'] = {
              connections: [{ node: elseTargetId, output: 'input_1' }]
            };
          } else if (Array.isArray(conf) && conf.every(c => c.execute)) {
            // It's a SWITCH-CASE block
            conf.forEach((caseConf, index) => {
              const caseTargetId = Number(caseConf.execute.split('_')[1]);

              // Skip invalid/missing target nodes
              const targetExists = tasks.some(t => t.id === caseTargetId);
              if (!targetExists) {
                console.warn(`Skipping missing switch-case target: node_${caseTargetId}`);
                return;
              }

              outputs[`output_${index + 1}`] = {
                connections: [{ node: caseTargetId, output: 'input_1' }]
              };
            });
          }
        } else {
          // Default Task (not condition type) with multiple outputs
          task.outputs.forEach(targetIdStr => {
            const targetId = Number(targetIdStr);
            const targetExists = tasks.some(t => t.id === targetId);
            if (!targetExists) {
              console.warn(`Skipping connection to missing node: ${targetId}`);
              return;
            }

            validConnections.push({
              node: targetId,
              output: 'input_1'
            });
          });

          if (validConnections.length > 0) {
            outputs['output_1'] = {
              connections: validConnections
            };
          }
        }
      }



      // Build inputs object by looking for tasks that point to current task
      tasks.forEach(source => {
        if (!source.outputs) return;

        source.outputs.forEach((targetIdStr, outputIdx) => {
          const targetId = Number(targetIdStr);
          if (targetId !== task.id) return;

          const inputKey = 'input_1';
          let outputKey = 'output_1'; // Default

          if (source.type === 'Condition Task') {
            const conf = source.config;

            if (conf?.[0]?.execute_if && conf?.[0]?.execute_else) {
              // It's an IF-ELSE block
              if (conf[0].execute_if === `node_${task.id}`) {
                outputKey = 'output_1'; // IF → output_1
              } else if (conf[0].execute_else === `node_${task.id}`) {
                outputKey = 'output_2'; // ELSE → output_2
              }
            } else if (Array.isArray(conf) && conf.every(c => c.execute)) {
              // It's a SWITCH-CASE block
              const switchIndex = conf.findIndex(c => c.execute === `node_${task.id}`);
              if (switchIndex !== -1) {
                outputKey = `output_${switchIndex + 1}`; // Each case gets its own output
              }
            }
          }

          if (!inputs[inputKey]) {
            inputs[inputKey] = { connections: [] };
          }

          inputs[inputKey].connections.push({
            node: source.id,
            input: outputKey
          });
        });
      });

      const drawflowNode: DrawflowNode = {
        id: task.id,
        name: task.name,
        inputs,
        outputs,
        pos_x: task.pos_x,
        pos_y: task.pos_y,
        html: this.getHtmlForTask(task),
        typenode: false,
        data: task.data,
        class: this.getClassForTask(task)
      };
      nodeMap.set(task.id, drawflowNode);
      placed.add(task.id);
    }

    console.log({
      drawflow: {
        Home: {
          data: Object.fromEntries(
            // IMPORTANT: convert Map to object preserving insertion order
            [...nodeMap.entries()]
          )
        }
      }
    })

    return {
      drawflow: {
        Home: {
          data: Object.fromEntries(
            // IMPORTANT: convert Map to object preserving insertion order
            [...nodeMap.entries()]
          )
        }
      }
    };
  }






  getNodeId(task, id) {
    return `node_${id}`
  }

  getNodeImage(task) {
    if (Object.values(playbookTypes).includes(task.type)) {
      return this.crudSvc.getTaskTargetImage(task.type);
    }
    if (task.type === 'Notification Task' || task.type === 'Email') {
      return this.crudSvc.getSelectedNodeImage('Email');
    }
    if (task.type === 'Chart Task') {
      return this.crudSvc.getSelectedNodeImage('Chart');
    }
    if (task.type === 'If Else' || task.type === 'Switch Case' || task.type === 'Condition Task') {
      if (task.config[0]?.execute_if || task.config?.next_if) {
        return this.crudSvc.getSelectedNodeImage('If Else');
      } else {
        return this.crudSvc.getSelectedNodeImage('Switch Case');
      }
    }
    if (task.type === 'Source Task') {
      return this.crudSvc.getSelectedNodeImage('Source Task');
    }
    if (task.type === 'LLM Task') {
      return this.crudSvc.getSelectedNodeImage('LLM');
    }
  }

  buildAssitantForm() {
    this.assistantForm = this.svc.buildAssistantForm();
  }
  openWorkflowAssistant() {
    this.showWorkflowAssistant = true;
    this.showWorkFlowParams = false;
    this.showTaskDetails = false;
    this.showIfConditionDetails = false;
    this.showSwitchConditionDetails = false;
    this.showSourceTaskDetails = false;
    this.showEmailOutputDetails = false;
    this.showChartOutputDetails = false;
    this.showLLMDetails = false;
  }
  sumbitQuery(query: string) {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    // this.isHovered = false;
    this.resetThread = false;
    if (query.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: query, type: 'text' });
      // this.getResponse(query, true);
      if (this.chatHistoryData.length) {
        // this.modules.forEach(m => m.isActive = false);
        this.queries = [];
      }
    }
  }

  onSubmit() {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    this.resetThread = false;
    if (this.assistantForm.get('chat').value.trim()) {
      // this.shouldScroll = true;
      this.isTyping = true;
      this.getLLMResponse(this.assistantForm.get('chat').value.trim());
      this.chatHistoryData.push({ user: 'user', message: this.assistantForm.get('chat').value, type: 'text' });
      // this.getResponse(this.assistantForm.get('chat').value);
      this.assistantForm.get('chat').setValue('');
    }
  }

  closeWorkflowAssistant() {
    this.showWorkflowAssistant = false;
  }
  callAPIsForTasks() {
    this.svc.callApisForTasks(this.llmResponse.tasks).subscribe({
      next: (responses) => {
        console.log('API responses for tasks:', responses);
        this.spinner.stop('main');
        this.tasksResp = responses;
        this.handleClickEvent(this.formattedTask);
      },
      error: (err) => {
        console.error('Error fetching API data:', err);
      }
    });
  }

  getLLMResponse(query) {
    let req = {
      query: query,
      tasks: this.getTasksForPrompt()
    }
    this.llmResponse = null;
    this.formattedTask = [];
    let tasks = [];
    this.svc.getLLMResponse(req).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.llmResponse = res;
      this.chatHistoryData.push({ user: 'bot', message: this.llmResponse?.message, type: 'text' });
      if (this.llmResponse.status === 'success') {
        this.callAPIsForTasks();
        this.getStartNode();
        tasks = this.increaseTaskIds(this.llmResponse.tasks);
        this.getFormattedTaskList(tasks);
        this.getEndNode();
        const drawflowData = this.generateDrawflowStructure(this.formattedTask);
        this.waitForEditorAndImport(this.sanitizeDrawflowData(drawflowData));
        this.isTyping = false;
        this.llmResponse.tasks.forEach(t => {
          if (!Object.values(playbookTypes).includes(t.type as playbookTypes)) {
            this.handleClickEvent(this.formattedTask);
          }
        })
      } else {
        this.isTyping = false;
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get LLM Response'));
      this.isTyping = false;
    });
  }

  getTasksForPrompt() {
    let tasksToSend = [];
    this.formattedTask?.forEach(t => {
      if (t.id !== 1 && t.id !== 2) {
        let row = {
          name: t.name,
          type: t.type,
          uuid: t?.data?.label?.uuid
        }
        tasksToSend.push(row);
      }
    });
    return tasksToSend ? tasksToSend : [];
  }

  handleClickEvent(tasks) {
    // Clear old arrays
    this.conditionArr = [];
    this.taskDetailsArr = [];
    this.outputArr = [];
    this.sourceTaskDetailsArr = [];
    this.llmArr = [];

    // STEP 1 — Build row objects
    tasks.forEach(val => {
      const name_id = `node_${val.id}`;
      const row = {
        category: !(val.id === 1 || val.id === 2)
          ? this.categoryList.find(cat =>
            cat.tasks.some(task => task.taskUuid === val?.data?.label?.uuid)
          )?.category || ''
          : '',
        config: val?.config ?? [],
        dependencies: [],
        targets: [],
        inputs: [],
        name: val.name,
        name_id: val?.data?.uniqueNodeId,
        outputs: [],
        task: val?.data?.label?.uuid,
        taskImage: val?.data?.label?.image,
        type: val?.type,
        timeout: 3600,
        retries: 0,
        trigger_rule: 'all_success'
      };

      const isConditionTask = ['Condition Task', 'Switch Case', 'If Else'].includes(val.type);
      const isRegularTask = Object.values(playbookTypes).includes(val.type as playbookTypes);
      const isEmailTask = ['Notification Task', 'Email'].includes(val.type);
      const isChartTask = val.type === 'Chart Task';
      const isSourceTask = val.type === 'Source Task';
      const isLLMTask = val.type === 'LLM Task';

      if (isConditionTask) {
        if (val?.config?.next_if) {
          row['ifConditionForm'] = this.svc.buildIfElseForm(val, name_id);
          this.conditionArr.push(row);
        } else if (val?.config?.execute) {
          row['switchConditionForm'] = this.svc.buildSwitchForm(val, name_id);
          this.conditionArr.push(row);
        }
      } else if (isRegularTask) {
        row['inputs'] = _clone(this.tasksResp?.find(t => t.task_name === val.name)?.inputs);
        row['inputForm'] = this.svc.buildSelectedTaskForm(row, name_id);
        this.taskDetailsArr.push(row);
      } else if (isEmailTask) {
        row['outputForm'] = this.svc.buildEmailForm(val, name_id);
        this.outputArr.push(row);
      } else if (isChartTask) {
        row['outputForm'] = this.svc.buildChartForm(val, name_id);
        this.outputArr.push(row);
      } else if (isSourceTask) {
        row['sourceTaskForm'] = this.svc.buildSelectedSourceTaskForm(val, name_id);
        this.sourceTaskDetailsArr.push(row);
      } else if (isLLMTask) {
        row['llmForm'] = this.svc.buildLLMForm(val, name_id);
        this.llmArr.push(row);
      }
    });

    // STEP 2 — Attach listeners ONCE
    setTimeout(() => {
      Object.values(this.editor.drawflow.drawflow.Home.data).forEach((node: any) => {
        const nodeElement = document.getElementById(node.data.uniqueNodeId);
        if (!nodeElement) return;

        const headerElement = nodeElement.querySelector('.node-header');
        let nodeType = '';
        if (this.conditionArr.some(c => c.name_id === node.data.uniqueNodeId)) nodeType = 'condition';
        else if (this.taskDetailsArr.some(t => t.name_id === node.data.uniqueNodeId)) nodeType = 'task';
        else if (this.outputArr.some(o => o.name_id === node.data.uniqueNodeId)) nodeType = 'output';
        else if (this.sourceTaskDetailsArr.some(s => s.name_id === node.data.uniqueNodeId)) nodeType = 'source';
        else if (this.llmArr.some(l => l.name_id === node.data.uniqueNodeId)) nodeType = 'LLM';

        nodeElement.setAttribute('data-node-type', nodeType);

        if (!nodeElement.dataset.listenerAttached) {
          nodeElement.dataset.listenerAttached = "true";

          this.renderer.listen(headerElement, 'click', () => {
            let selectedNodeData = [
              ...this.conditionArr,
              ...this.taskDetailsArr,
              ...this.outputArr,
              ...this.sourceTaskDetailsArr,
              ...this.llmArr
            ].find(row => row.name_id === node.data.uniqueNodeId);

            let nodeId = `node_${node.id}`;

            if (!selectedNodeData) return;

            if (nodeType === 'condition') this.handleConditionEdit(nodeId, selectedNodeData.config, headerElement, nodeElement);
            else if (nodeType === 'task') this.handleTaskEdit(nodeId, headerElement, nodeElement);
            else if (nodeType === 'output') this.handleOutputEdit(nodeId, headerElement, nodeElement, selectedNodeData.type);
            else if (nodeType === 'source') this.handleSourceTaskEdit(nodeId, headerElement, nodeElement);
            else if (nodeType === 'LLM') this.handleLLMEdit(nodeId, headerElement, nodeElement);
          });
        }
      });
    }, 200);
  }

}
