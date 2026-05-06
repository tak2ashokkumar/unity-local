import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OrchestrationWorkflowAgenticLeftMenuService } from './orchestration-workflow-agentic-left-menu.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { CategoriesViewData } from './orchestration-workflow-agentic-left-menu.type';
import { NodeDetails, nodeTypes } from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.type';
import { OrchestrationAgenticWorkflowContainerService } from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.service';

@Component({
  selector: 'orchestration-workflow-agentic-left-menu',
  templateUrl: './orchestration-workflow-agentic-left-menu.component.html',
  styleUrls: ['./orchestration-workflow-agentic-left-menu.component.scss'],
  providers: [OrchestrationWorkflowAgenticLeftMenuService],
  // encapsulation: ViewEncapsulation.None

})
export class OrchestrationWorkflowAgenticLeftMenuComponent implements OnInit {
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  isOpen = false;
  menuType: string = 'main';
  filteredSourceCategoryList = [];
  filteredActionCategoryList = []
  sourceCategoryList: CategoriesViewData[];
  actionCategoryList: CategoriesViewData[];
  isOpenTasks: { [key: string]: boolean } = {};
  isOpenCondition = false;
  isOpenOutput = false;
  isOpenLLM = false;
  autoOpenTasks: { [key: string]: boolean } = {};
  autoOpenCondition: boolean = false;
  autoOpenOutput: boolean = false;
  autoOpenLLM: boolean = false;
  categoryList: CategoriesViewData[];
  conditionList = conditionList;
  outputList = outputList;
  llmList = ai;
  starLLMIcon = `${environment.assetsUrl}external-brand/logos/stars.svg`;
  searchQuery: string = ''
  filteredCategoryList = [];
  filteredConditionList = [];
  filteredOutputList = [];
  filteredLLMList = [];
  filteredSourceTaskList = [];

  isOpenSource = false;
  isOpenSourceTasks: { [key: string]: boolean } = {};
  autoOpenSourceTasks: { [key: string]: boolean } = {};
  mainMenu = menu;
  triggerMenu = triggersMenu;
  @Output() dragStart = new EventEmitter<any>();
  @Input() emptyCanvas = false;
  globalSearchResults: any[] = []; // one common flat list
  unityItsm = unityITSM;

  constructor(
    private svc: OrchestrationWorkflowAgenticLeftMenuService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private containerSvc: OrchestrationAgenticWorkflowContainerService
  ) { }

  ngOnInit(): void {
    console.log('hello')
    this.currentCriteria = { searchValue: '', pageSize: 0 };
    this.getTaskData()
    this.getSourceTasksByCategory()
    this.getActionTasks()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['emptyCanvas']) {
      if (this.emptyCanvas === true) {
        this.menuType = "Trigger"
      } else {
        this.menuType = 'main';
      }
    }
  }

  // Notify parent which task is being dragged
  onDragStart(event: DragEvent, node: NodeDetails) {
    let nodeDetails = {
      type: node.type,
      name: node.name,
      category: node.category,
      image: node.image,
      uuid: node.uuid,
      nodeType: node.nodeType,
    }
    let row = { dragEvent: event, details: nodeDetails }
    this.dragStart.emit(row);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  toggleSourcesAccordion() {
    this.isOpenSource = !this.isOpenSource;
  }

  // toggleLLMAccordion() {
  //   this.isOpenLLM = !this.isOpenLLM;
  // }

  goToSubMenu(menuTitle: string) {
    this.menuType = menuTitle;
    if (menuTitle === 'Task') {
      console.log(this.filteredCategoryList)
    }
    if (menuTitle === 'Sources') {
      console.log(this.filteredSourceCategoryList)
    }
  }

  backToMainMenu() {
    this.menuType = 'main';
  }

  toggleTaskAccordion(category: string) {
    this.isOpenTasks[category] = !this.isOpenTasks[category];
    // this.autoOpenTasks[category] = !this.autoOpenTasks[category];
  }


  toggleSourceAccordionCategory(category: string) {
    this.isOpenSourceTasks[category] = !this.isOpenSourceTasks[category];
    this.autoOpenSourceTasks[category] = !this.autoOpenSourceTasks[category];
  }


  onSearched(event: string) {
    this.searchQuery = event;
    this.filterAllItems();
    this.menuType = event ? 'Search' : 'main';
  }


  getTaskData() {
    console.log('getTaskData')
    this.svc.getData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.categoryList = this.svc.convertToViewData(data);
      console.log(this.categoryList)
      // this.containerSvc.toolsList = this.categoryList.flatMap(category => category.tasks);
      this.filteredCategoryList = [...this.categoryList];
      this.combineTools();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  getSourceTasksByCategory() {
    console.log('getSourceTasksByCategory')
    this.svc.getSourcetaskByCategory().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.sourceCategoryList = this.svc.convertToSourceTaskViewData(data);
      console.log(this.sourceCategoryList)
      // this.containerSvc.toolsList = [...this.containerSvc.toolsList, ...this.sourceCategoryList.flatMap(category => category.tasks)]
      this.filteredSourceCategoryList = [...this.sourceCategoryList];
      this.combineTools();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  getActionTasks() {
    this.svc.getActionsTask().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.actionCategoryList = this.svc.convertToActionTaskViewData(data);
      this.filteredActionCategoryList = [...this.actionCategoryList];
      this.combineTools();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Action Tasks'));
    });
  }


  private combineTools() {
    const tasks = this.categoryList?.flatMap(c => c.tasks) || [];
    const sourceTasks = this.sourceCategoryList?.flatMap(c => c.tasks) || [];
    this.containerSvc.toolsList = [...tasks, ...sourceTasks];
  }

  private combineActionTools() {
    const tasks = this.categoryList?.flatMap(c => c.tasks) || [];
    const sourceTasks = this.actionCategoryList?.flatMap(c => c.tasks) || [];
    this.containerSvc.toolsList = [...tasks, ...sourceTasks];
  }

  filterAllItems() {
    const query = this.searchQuery.toLowerCase().trim();
    this.globalSearchResults = [];

    if (!query) return; // reset if search is empty

    // 1️⃣ Search Tasks inside categoryList
    this.categoryList.forEach(category => {
      const filteredTasks = category.tasks.filter(task => task.name.toLowerCase().includes(query));
      const matchCategory = category.category.toLowerCase().includes(query);

      if (filteredTasks.length > 0 || matchCategory) {
        filteredTasks.forEach(task => {
          this.globalSearchResults.push({
            name: task.name,
            category: category.category,
            image: task.image || '',
            type: task.type,
            uuid: task.uuid,
            nodeType: 'task'
          });
        });
      }
    });

    // 2️⃣ Search Source Tasks inside sourceCategoryList
    this.sourceCategoryList.forEach(category => {
      const filteredSourceTasks = category.tasks.filter(task => task.name.toLowerCase().includes(query));
      const matchCategory = category.category.toLowerCase().includes(query);

      if (filteredSourceTasks.length > 0 || matchCategory) {
        filteredSourceTasks.forEach(task => {
          this.globalSearchResults.push({
            name: task.name,
            category: category.category,
            image: task.image,
            type: task.type,
            uuid: task.uuid,
            nodeType: 'source task'
          });
        });
      }
    });

    this.actionCategoryList.forEach(category => {
      const filteredSourceTasks = category.tasks.filter(task => task.name.toLowerCase().includes(query));
      const matchCategory = category.category.toLowerCase().includes(query);

      if (filteredSourceTasks.length > 0 || matchCategory) {
        filteredSourceTasks.forEach(task => {
          this.globalSearchResults.push({
            name: task.name,
            category: category.category,
            image: task.image,
            type: task.type,
            uuid: task.uuid,
            nodeType: 'action task'
          });
        });
      }
    });

    // 3️⃣ Search ConditionList
    this.conditionList.forEach(cond => {
      const match = cond.name.toLowerCase().includes(query);
      if (match) {
        this.globalSearchResults.push(cond);
      }
    });

    // 4️⃣ Search OutputList
    this.outputList.forEach(out => {
      const match = out.name.toLowerCase().includes(query);
      if (match) {
        this.globalSearchResults.push(out);
      }
    });

    // 5️⃣ Search LLM / AI list
    this.llmList.forEach(llm => {
      const match = llm.name.toLowerCase().includes(query);
      if (match) {
        this.globalSearchResults.push(llm);
      }
    });

    // 6️⃣ Search Trigger menu
    this.triggerMenu.forEach(trigger => {
      const match = trigger.name.toLowerCase().includes(query);
      if (match) {
        this.globalSearchResults.push(trigger);
      }
    });
  }


  /*
    Below method highlights the matched value.
  */
  highlightMatch(text: string) {
    if (!this.searchQuery) {
      return text;
    }
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, `<span class="font-weight-bold">$1</span>`);
  }



}


const menu = [
  {
    name: "Trigger",
    description: "Start workflows manually, on a schedule, or when a chat message arrives.",
    icon: `${environment.assetsUrl}external-brand/workflow/Trigger.svg`
  },
  {
    name: "Advanced AI",
    description: "Add intelligent processing using AI models for reasoning, automation and analysis",
    icon: `${environment.assetsUrl}external-brand/workflow/AdvancedAI.svg`
  },
  {
    name: "Task",
    description: "Use a predefined automation task from the Task module within the workflow.",
    icon: `${environment.assetsUrl}external-brand/workflow/Task.svg`
  },
  {
    name: "Flow Controls",
    description: "Evaluate a condition and execute different branches based on outcomes.",
    icon: `${environment.assetsUrl}external-brand/workflow/Condition.svg`
  },
  {
    name: "Output",
    description: "Send results through email or display them as charts in the workflow logs.",
    icon: `${environment.assetsUrl}external-brand/workflow/Output.svg`
  },
  {
    name: "Sources",
    description: "Fetch data from APIs, systems, or external services to use in your workflow.",
    icon: `${environment.assetsUrl}external-brand/workflow/Source.svg`
  },
  {
    name: "Actions",
    description: "Perform actions on APIs, systems, or external services using workflow data.",
    icon: `${environment.assetsUrl}external-brand/workflow/actions_task.svg`
  },
  {
    name: "UnityOne ITSM",
    description: "Actions to manage ITSM tickets within the UnityOne ITSM platform.",
    icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`
  },
];


const triggersMenu = [
  {
    name: "Manual",
    description: "Start the workflow manually whenever you choose, with a single click.",
    icon: `${environment.assetsUrl}external-brand/workflow/Manual.svg`,
    type: nodeTypes.ManualTrigger
  },
  {
    name: "Schedule",
    description: "Automatically run the workflow at specific times or intervals you define.",
    icon: `${environment.assetsUrl}external-brand/workflow/Schedule.svg`,
    type: nodeTypes.ScheduleTrigger
  },
  {
    name: "On Chat Message",
    description: "Trigger the workflow whenever a new chat message is received.",
    icon: `${environment.assetsUrl}external-brand/workflow/onChatMassage.svg`,
    type: nodeTypes.OnChatMessageTrigger
  },
  {
    name: "Webhook",
    description: "Initiates the workflow when an external system sends a webhook request to the configured endpoint.",
    icon: `${environment.assetsUrl}external-brand/workflow/webhook-trigger-new.svg`,
    type: nodeTypes.WebhookTrigger
  },
  {
    name: "ITSM Event",
    description: "Trigger the workflow when a selected ITSM event occurs, based on table and event type.",
    icon: `${environment.assetsUrl}external-brand/workflow/ITSM-Event-Trigger-4.svg`,
    type: nodeTypes.ItsmTrigger,
    // triggers: [
    //   {
    //     name: "ITSM",
    //     description: "Trigger the workflow when a selected ITSM event occurs, based on table and event type.",
    //     icon: `${environment.assetsUrl}external-brand/workflow/itsm-event.svg`,
    //     type: nodeTypes.ItsmTrigger,
    //   }
    // ]
  },
  {
    name: "AIML Event",
    description: "Trigger the workflow based on an Event, Alert or Condition.",
    icon: `${environment.assetsUrl}external-brand/workflow/aiml-event-trigger1.svg`,
    type: nodeTypes.AimlEventTrigger,
  },
];


const conditionList = [
  {
    name: 'If Else',
    icon: `${environment.assetsUrl}external-brand/workflow/IfElse.svg`,
    description: 'Use if-else logic to control workflow execution and routing.',
    type: nodeTypes.IfElse
  },
  {
    name: 'Switch Case',
    icon: `${environment.assetsUrl}external-brand/workflow/Switch.svg`,
    description: 'Check multiple matching conditions and trigger specific action for each.',
    type: nodeTypes.Switch
  },
  {
    name: 'Wait',
    icon: `${environment.assetsUrl}external-brand/workflow/wait.svg`,
    description: 'Wait for a specified time before an action to control workflow execution.',
    type: nodeTypes.Wait
  },
  {
    name: 'Loop',
    icon: `${environment.assetsUrl}external-brand/workflow/Loop.svg`,
    description: 'Repeat workflow steps for each item or until a condition is met.',
    type: nodeTypes.Loop
  },
  {
    name: 'Transform',
    icon: `${environment.assetsUrl}external-brand/workflow/Transform.svg`,
    description: 'Modify and reshape input data using common transformation operations.',
    type: nodeTypes.Transform
  }
];

const outputList = [
  {
    name: 'Email',
    icon: 'fas fa-envelope',
    description: 'Send an email to specified recipients with subject and message content.',
    type: nodeTypes.Email
  },
  {
    name: 'Chart',
    icon: 'fas fa-chart-pie',
    description: 'Generate a visual chart to represent data insights or workflow results.',
    type: nodeTypes.Chart
  }
];

const ai = [
  {
    name: 'AI Agent',
    icon: `${environment.assetsUrl}external-brand/workflow/AIAgent.svg`,
    description: 'An autonomous decision-maker that plans and executes tasks using tools.',
    type: nodeTypes.AIAgent
  },
  {
    name: 'LLM',
    icon: `${environment.assetsUrl}external-brand/workflow/LLM.svg`,
    description: 'Use LLM to analyze text, generate content, or extract insights.',
    type: nodeTypes.LLM
  }
];

const unityITSM = [
  {
    name: 'Create Ticket',
    icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
    description: 'Creates a new ITSM ticket with the provided details and initial information.',
    type: nodeTypes.CreateITSMTicket
  },
  {
    name: 'Update Ticket',
    icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
    description: 'Updates an existing ITSM ticket with new or modified information.',
    type: nodeTypes.UpdateITSMTicket
  },
  {
    name: 'Add Comment in Ticket',
    icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
    description: 'Adds a comment or note to an existing ITSM ticket for tracking or communication.',
    type: nodeTypes.CommentInITSMTicket
  },
  {
    name: 'Get Ticket',
    icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
    description: 'Retrieves details of an ITSM ticket based on the specified identifier.',
    type: nodeTypes.GetITSMTicket
  }
];

