import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, map, switchMap, takeUntil } from 'rxjs/operators';

import { WfDynamicLeftService } from './wf-dynamic-left.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

import { CategoriesViewData, WorkflowGroup, WorkflowItem } from './wf-dynamic-left.type';
import {
  NodeDetails,
  nodeTypes
} from '../wf-dynamic-container/wf-dynamic-container.type';
import { WfDynamicContainerService } from '../wf-dynamic-container/wf-dynamic-container.service';

@Component({
  selector: 'wf-dynamic-left',
  templateUrl: './wf-dynamic-left.component.html',
  styleUrls: ['./wf-dynamic-left.component.scss'],
  // providers: [WfDynamicLeftService]
})
export class WfDynamicLeftComponent
  implements OnInit, OnChanges, OnDestroy {

  @Output() dragStart = new EventEmitter<any>();
  @Input() emptyCanvas = false;

  private ngUnsubscribe = new Subject<void>();

  currentCriteria: SearchCriteria = { searchValue: '', pageSize: 0 };

  menuType = 'main';
  searchQuery = '';

  // categoryList: CategoriesViewData[] = [];
  // sourceCategoryList: CategoriesViewData[] = [];
  // actionCategoryList: CategoriesViewData[] = [];

  // filteredCategoryList: CategoriesViewData[] = [];
  // filteredSourceCategoryList: CategoriesViewData[] = [];
  // filteredActionCategoryList: CategoriesViewData[] = [];

  globalSearchResults: any[] = [];

  isOpenTasks: { [key: string]: boolean } = {};
  autoOpenTasks: { [key: string]: boolean } = {};
  @Input() workflowGroups: WorkflowGroup[] = [];

  // mainMenu = menu;
  // triggerMenu = triggersMenu;
  // conditionList = conditionList;
  // outputList = outputList;
  // llmList = ai;
  // unityItsm = unityITSM;

  // workflowGroups: WorkflowGroup[] = [];
  mainMenu: WorkflowGroup[] = [];
  selectedGroup: WorkflowGroup | null = null;

  constructor(
    private svc: WfDynamicLeftService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private containerSvc: WfDynamicContainerService,
  ) { }

  ngOnInit(): void {
    // this.getWorkflowGroups();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes.emptyCanvas?.previousValue === true &&
      changes.emptyCanvas.currentValue === false &&
      this.selectedGroup?.key === 'trigger'
    ) {
      this.backToMainMenu();
    }

    if (changes.workflowGroups?.currentValue?.length) {

      this.mainMenu = [...this.workflowGroups];

      const triggerGroup = this.workflowGroups.find(
        group => group.key === 'trigger'
      );

      if (triggerGroup && this.emptyCanvas) {
        this.selectedGroup = triggerGroup;
        this.menuType = 'dynamic-submenu';
      }
    }
  }

  ngOnDestroy(): void {
    // this.svc.clearWorkflowGroupsCache();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getWorkflowGroups(): void {
    const cachedData = this.svc.getWorkflowGroupsCache();

    // USE CACHE
    if (cachedData) {
      this.workflowGroups = cachedData;
      this.mainMenu = [...cachedData];

      const triggerGroup = this.workflowGroups.find(group => group.key === 'trigger');

      if (triggerGroup && this.emptyCanvas) {
        this.selectedGroup = triggerGroup;
        this.menuType = 'dynamic-submenu';
      }
      return;
    }
    setTimeout(() => {
      this.spinner.start('left-panel');
      this.svc.getWorkflowGroups().pipe(takeUntil(this.ngUnsubscribe), switchMap((response) => {
        this.workflowGroups = response.groups || [];
        const dynamicGroups = this.workflowGroups.filter(group => group.group_type?.toLowerCase() === 'dynamic' && group.endpoint);
        if (!dynamicGroups.length) {
          return of([]);
        }
        const requests = dynamicGroups.map(group =>
          this.svc.getDynamicGroupItems(group.endpoint).pipe(takeUntil(this.ngUnsubscribe), map((apiResponse) => ({
            groupKey: group.key,
            data: apiResponse || []
          })),
            catchError(() => {
              this.notification.error(new Notification(`Failed to load ${group.name}`));
              return of({ groupKey: group.key, data: [] });
            })
          )
        );
        return forkJoin(requests);
      }), finalize(() => {
        this.spinner.stop('left-panel');
      })
      ).subscribe({
        next: (dynamicResponses: any[]) => {
          dynamicResponses.forEach(response => {
            const group = this.workflowGroups.find(g => g.key === response.groupKey);
            if (!group) return;
            group.categories = response.data;
            group.isCategorized = true;
          });
          this.svc.setWorkflowGroupsCache(this.workflowGroups);
          this.mainMenu = [...this.workflowGroups];
          const triggerGroup = this.workflowGroups.find(group => group.key === 'trigger'
          );
          if (triggerGroup && this.emptyCanvas) {
            this.selectedGroup = triggerGroup;
            this.menuType = 'dynamic-submenu';
          }
        },
        error: () => {
          this.notification.error(new Notification('Failed to load workflow nodes'));
        }
      });
    });
  }

  getIconPath(icon: string): string {
    return this.containerSvc.getNewCenterImageUrl(icon);
  }

  mapDynamicItems(categories: any[] = []): WorkflowItem[] {
    return categories.flatMap(category =>
      category.items.map((item: WorkflowItem) => ({
        ...item,
        category: category.category
      }))
    );
  }

  /* ------------------------------
     MENU NAVIGATION
  ------------------------------ */
  goToSubMenu(menu: any): void {
    this.selectedGroup = menu;
    this.menuType = 'dynamic-submenu';
  }

  backToMainMenu(): void {
    this.selectedGroup = null;
    this.menuType = 'main';
  }

  toggleTaskAccordion(category: string): void {
    this.isOpenTasks[category] = !this.isOpenTasks[category];
  }

  /* ------------------------------
     DRAG EVENT
  ------------------------------ */

  onDynamicDragStart(event: DragEvent, item: WorkflowItem): void {
    this.dragStart.emit({
      dragEvent: event,
      details: {
        node_type: item.node_type,
        name: item.name,
        category: this.selectedGroup?.name,
        image: this.getIconPath(item.icon_path),
        icon_path: item.icon_path,
        endpoint: item.endpoint,
        key: item?.key,
        as_tool: item?.as_tool,
      }
    });
  }

  /* ------------------------------
     SEARCH
  ------------------------------ */

  onSearched(event: string): void {
    this.searchQuery = event?.trim() || '';
    this.menuType = this.searchQuery ? 'Search' : 'main';
    this.filterAllItems();
  }

  // filterAllItems(): void {
  //   const query = this.searchQuery.toLowerCase();
  //   this.globalSearchResults = [];

  //   if (!query) {
  //     return;
  //   }

  //   this.addCategoryResults(this.categoryList, query, 'task');
  //   this.addCategoryResults(this.sourceCategoryList, query, 'source task');
  //   this.addCategoryResults(this.actionCategoryList, query, 'action task');

  //   this.addFlatListResults(this.conditionList, query);
  //   this.addFlatListResults(this.outputList, query);
  //   this.addFlatListResults(this.llmList, query);
  //   this.addFlatListResults(this.triggerMenu, query);
  //   this.addFlatListResults(this.unityItsm, query);
  // }

  filterAllItems(): void {
    const query = this.searchQuery.toLowerCase();
    this.globalSearchResults = [];
    if (!query) {
      return;
    }
    this.workflowGroups.forEach(group => {
      if (group.items?.length) {
        group.items.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          group.name.toLowerCase().includes(query)
        )
          .forEach(item => {
            this.globalSearchResults.push({
              ...item, category: group.name, nodeType: group.key
            });
          });
      }

      if (group.categories?.length) {
        group.categories.forEach(category => {
          category.items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            category.category.toLowerCase().includes(query)
          ).forEach(item => {
            this.globalSearchResults.push({
              ...item, category: category.category, nodeType: group.key
            });
          });
        });
      }
    });
  }

  highlightMatch(text: string): string {
    if (!this.searchQuery) {
      return text;
    }
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, `<span class="font-weight-bold">$1</span>`);
  }


  // private addCategoryResults(
  //   categories: CategoriesViewData[],
  //   query: string,
  //   nodeType: string
  // ): void {
  //   categories?.forEach(category => {
  //     category.tasks
  //       .filter(task =>
  //         task.name.toLowerCase().includes(query) ||
  //         category.category.toLowerCase().includes(query)
  //       )
  //       .forEach(task => {
  //         this.globalSearchResults.push({
  //           name: task.name,
  //           category: category.category,
  //           image: task.image,
  //           type: task.type,
  //           uuid: task.uuid,
  //           nodeType
  //         });
  //       });
  //   });
  // }

  // private addFlatListResults(list: any[], query: string): void {
  //   list?.forEach(item => {
  //     if (item.name.toLowerCase().includes(query)) {
  //       this.globalSearchResults.push(item);
  //     }
  //   });
  // }


  /* ------------------------------
     API CALLS
  ------------------------------ */
  // getTaskData(): void {
  //   this.svc.getData(this.currentCriteria)
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe(
  //       data => {
  //         this.categoryList = this.svc.convertToViewData(data);
  //         this.filteredCategoryList = [...this.categoryList];
  //         this.combineTools();
  //         this.spinner.stop('main');
  //       },
  //       (err: HttpErrorResponse) => {
  //         this.spinner.stop('main');
  //         this.notification.error(new Notification('Failed to get Tasks'));
  //       }
  //     );
  // }

  // getSourceTasksByCategory(): void {
  //   this.svc.getSourcetaskByCategory()
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe(
  //       data => {
  //         this.sourceCategoryList = this.svc.convertToSourceTaskViewData(data);
  //         this.filteredSourceCategoryList = [...this.sourceCategoryList];
  //         this.combineTools();
  //         this.spinner.stop('main');
  //       },
  //       (err: HttpErrorResponse) => {
  //         this.spinner.stop('main');
  //         this.notification.error(new Notification('Failed to get Source Tasks'));
  //       }
  //     );
  // }

  // getActionTasks(): void {
  //   this.svc.getActionsTask()
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe(
  //       data => {
  //         this.actionCategoryList = this.svc.convertToActionTaskViewData(data);
  //         this.filteredActionCategoryList = [...this.actionCategoryList];
  //         this.combineTools();
  //         this.spinner.stop('main');
  //       },
  //       (err: HttpErrorResponse) => {
  //         this.spinner.stop('main');
  //         this.notification.error(new Notification('Failed to get Action Tasks'));
  //       }
  //     );
  // }

  // private combineTools(): void {
  //   const tasks = this.categoryList?.flatMap(c => c.tasks) || [];
  //   const sourceTasks = this.sourceCategoryList?.flatMap(c => c.tasks) || [];
  //   const actionTasks = this.actionCategoryList?.flatMap(c => c.tasks) || [];

  //   this.containerSvc.toolsList = [
  //     ...tasks,
  //     ...sourceTasks,
  //     ...actionTasks
  //   ];
  // }

  // Dynamic Added (Pushed on 22 may )


  // getWorkflowGroups(): void {
  //   this.svc.getWorkflowGroups().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
  //     next: (response) => {
  //       this.workflowGroups = response.groups || [];
  //       this.mainMenu = this.workflowGroups;
  //     }, error: () => {
  //       this.notification.error(
  //         new Notification('Failed to load workflow groups')
  //       );
  //     }
  //   });
  // }


  // goToSubMenu(menu: WorkflowGroup): void {
  //   this.selectedGroup = menu;
  //   this.menuType = menu.name;
  // }

}

/* -----------------------------------
   CONSTANTS
----------------------------------- */

// const menu = [
//   {
//     name: "Trigger",
//     description: "Start workflows manually, on a schedule, or when a chat message arrives.",
//     icon: `${environment.assetsUrl}external-brand/workflow/Trigger.svg`
//   },
//   {
//     name: "Advanced AI",
//     description: "Add intelligent processing using AI models for reasoning, automation and analysis",
//     icon: `${environment.assetsUrl}external-brand/workflow/AdvancedAI.svg`
//   },
//   {
//     name: "Task",
//     description: "Use a predefined automation task from the Task module within the workflow.",
//     icon: `${environment.assetsUrl}external-brand/workflow/Task.svg`
//   },
//   {
//     name: "Flow Controls",
//     description: "Evaluate a condition and execute different branches based on outcomes.",
//     icon: `${environment.assetsUrl}external-brand/workflow/Condition.svg`
//   },
//   {
//     name: "Output",
//     description: "Send results through email or display them as charts in the workflow logs.",
//     icon: `${environment.assetsUrl}external-brand/workflow/Output.svg`
//   },
//   {
//     name: "Sources",
//     description: "Fetch data from APIs, systems, or external services to use in your workflow.",
//     icon: `${environment.assetsUrl}external-brand/workflow/Source.svg`
//   },
//   {
//     name: "Actions",
//     description: "Perform actions on APIs, systems, or external services using workflow data.",
//     icon: `${environment.assetsUrl}external-brand/workflow/actions_task.svg`
//   },
//   {
//     name: "UnityOne ITSM",
//     description: "Actions to manage ITSM tickets within the UnityOne ITSM platform.",
//     icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`
//   },
// ];


// const triggersMenu = [
//   {
//     name: "Manual",
//     description: "Start the workflow manually whenever you choose, with a single click.",
//     icon: `${environment.assetsUrl}external-brand/workflow/Manual.svg`,
//     type: nodeTypes.ManualTrigger
//   },
//   {
//     name: "Schedule",
//     description: "Automatically run the workflow at specific times or intervals you define.",
//     icon: `${environment.assetsUrl}external-brand/workflow/Schedule.svg`,
//     type: nodeTypes.ScheduleTrigger
//   },
//   {
//     name: "On Chat Message",
//     description: "Trigger the workflow whenever a new chat message is received.",
//     icon: `${environment.assetsUrl}external-brand/workflow/onChatMassage.svg`,
//     type: nodeTypes.OnChatMessageTrigger
//   },
//   {
//     name: "Webhook",
//     description: "Initiates the workflow when an external system sends a webhook request to the configured endpoint.",
//     icon: `${environment.assetsUrl}external-brand/workflow/webhook-trigger-new.svg`,
//     type: nodeTypes.WebhookTrigger
//   },
//   {
//     name: "ITSM Event",
//     description: "Trigger the workflow when a selected ITSM event occurs, based on table and event type.",
//     icon: `${environment.assetsUrl}external-brand/workflow/ITSM-Event-Trigger-4.svg`,
//     type: nodeTypes.ItsmTrigger,
//   },
//   {
//     name: "AIML Event",
//     description: "Trigger the workflow based on an Event, Alert or Condition.",
//     icon: `${environment.assetsUrl}external-brand/workflow/aiml-event-trigger1.svg`,
//     type: nodeTypes.AimlEventTrigger,
//   },
// ];


// const conditionList = [
//   {
//     name: 'If Else',
//     icon: `${environment.assetsUrl}external-brand/workflow/IfElse.svg`,
//     description: 'Use if-else logic to control workflow execution and routing.',
//     type: nodeTypes.IfElse
//   },
//   {
//     name: 'Switch Case',
//     icon: `${environment.assetsUrl}external-brand/workflow/Switch.svg`,
//     description: 'Check multiple matching conditions and trigger specific action for each.',
//     type: nodeTypes.Switch
//   },
//   {
//     name: 'Wait',
//     icon: `${environment.assetsUrl}external-brand/workflow/wait.svg`,
//     description: 'Wait for a specified time before an action to control workflow execution.',
//     type: nodeTypes.Wait
//   },
//   {
//     name: 'Loop',
//     icon: `${environment.assetsUrl}external-brand/workflow/Loop.svg`,
//     description: 'Repeat workflow steps for each item or until a condition is met.',
//     type: nodeTypes.Loop
//   },
//   {
//     name: 'Transform',
//     icon: `${environment.assetsUrl}external-brand/workflow/Transform.svg`,
//     description: 'Modify and reshape input data using common transformation operations.',
//     type: nodeTypes.Transform
//   }
// ];

// const outputList = [
//   {
//     name: 'Email',
//     icon: 'fas fa-envelope',
//     description: 'Send an email to specified recipients with subject and message content.',
//     type: nodeTypes.Email
//   },
//   {
//     name: 'Chart',
//     icon: 'fas fa-chart-pie',
//     description: 'Generate a visual chart to represent data insights or workflow results.',
//     type: nodeTypes.Chart
//   }
// ];

// const ai = [
//   {
//     name: 'AI Agent',
//     icon: `${environment.assetsUrl}external-brand/workflow/AIAgent.svg`,
//     description: 'An autonomous decision-maker that plans and executes tasks using tools.',
//     type: nodeTypes.AIAgent
//   },
//   {
//     name: 'LLM',
//     icon: `${environment.assetsUrl}external-brand/workflow/LLM.svg`,
//     description: 'Use LLM to analyze text, generate content, or extract insights.',
//     type: nodeTypes.LLM
//   }
// ];

// const unityITSM = [
//   {
//     name: 'Create Ticket',
//     icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
//     description: 'Creates a new ITSM ticket with the provided details and initial information.',
//     type: nodeTypes.CreateITSMTicket
//   },
//   {
//     name: 'Update Ticket',
//     icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
//     description: 'Updates an existing ITSM ticket with new or modified information.',
//     type: nodeTypes.UpdateITSMTicket
//   },
//   {
//     name: 'Add Comment in Ticket',
//     icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
//     description: 'Adds a comment or note to an existing ITSM ticket for tracking or communication.',
//     type: nodeTypes.CommentInITSMTicket
//   },
//   {
//     name: 'Get Ticket',
//     icon: `${environment.assetsUrl}external-brand/workflow/ITSM.svg`,
//     description: 'Retrieves details of an ITSM ticket based on the specified identifier.',
//     type: nodeTypes.GetITSMTicket
//   }
// ];
