import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import Drawflow from 'drawflow';
import * as dagre from 'dagre';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DrawflowNode, NodeDataModel, NodeDetails, NodeDetailsArrayModel, nodeTypes, WorkflowLogsViewData } from './wf-dynamic-container.type';
import { OnChatExecution, WfDynamicContainerService } from './wf-dynamic-container.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { catchError, delay, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { environment } from 'src/environments/environment';
import { forkJoin, of, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { cloneDeep as _clone, has } from 'lodash-es';
import { OrchestrationAgenticWorkflowVariablesComponent } from '../orchestration-agentic-workflow-variables/orchestration-agentic-workflow-variables.component';
import { WfDynamicParamsComponent } from '../wf-dynamic-params/wf-dynamic-params.component';
import { EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { WfDynamicLeftService } from '../wf-dynamic-left/wf-dynamic-left.service';
import { WfDynamicRightExecuteComponent } from '../wf-dynamic-right-execute/wf-dynamic-right-execute.component';
import { WorkflowGroup } from '../wf-dynamic-left/wf-dynamic-left.type';
import { FormGroup } from '@angular/forms';

type ConnectorShape = 'rounded' | 'right-angle' | 'curved' | 'straight';

interface SelectedConnection {
  output_id: number;
  input_id: number;
  output_class: string;
  input_class: string;
}


@Component({
  selector: 'wf-dynamic-container',
  templateUrl: './wf-dynamic-container.component.html',
  styleUrls: ['./wf-dynamic-container.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class WfDynamicContainerComponent implements OnInit, AfterViewInit {


  @ViewChild('drawflowContainer') drawflowContainer!: ElementRef<HTMLElement>;
  @ViewChild('leftPanel') leftPanel!: ElementRef;
  @ViewChild('rightPanel') rightPanel!: ElementRef;
  @ViewChild('bottomPanel') bottomPanel!: ElementRef;
  @ViewChild('workflowNameInput') workflowNameInput!: ElementRef<HTMLInputElement>;

  @ViewChild('leftResizer') leftResizer!: ElementRef;
  @ViewChild('rightResizer') rightResizer!: ElementRef;
  @ViewChild('bottomResizer') bottomResizer!: ElementRef;

  wfName: string = 'Untitled';
  isEditingWorkflowName = false;
  private workflowNameBeforeEdit = this.wfName;
  editWorkflow = false;
  showHelpPanel = false;
  showBeginner = true;

  leftWidth = 340;
  rightWidth = 340;
  bottomHeight = 350;

  /* Saved sizes before collapse */
  previousLeftWidth = 340;
  previousRightWidth = 340;
  previousBottomHeight = 250;

  /* Collapse states */
  isLeftCollapsed = true;
  isRightCollapsed = true;
  isBottomCollapsed = true;


  /* Resize state */
  private resizingPanel: 'left' | 'right' | 'bottom' | null = null;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;


  private ngUnsubscribe = new Subject();
  emptyCanvas = true;
  editor: Drawflow;
  currentCriteria: SearchCriteria;
  workFlowId: string;
  selectedCategory: any; // add interface
  latestDroppedNode: NodeDetails;
  realTimeDetails;
  currentAgentNodeId: number | null = null;
  selectedNode; // add interface
  taskDetails; // add interface
  droppedAsTool = false;
  workFlowData; // add interface
  toolsArr = []; // add interface
  nodeDetailsArr: NodeDetailsArrayModel[] = [];
  connectedNodeDetails: NodeDetailsArrayModel[] = [];
  noOfOutputNode: number;
  hasNode = false;
  connectionList = []; // add interface
  modalRef: BsModalRef;
  realTimeNodeDetails;  // add interface
  workflowVarsData; // add interface
  executionMode: string;
  runNodeID = false;
  clickedNodeId: number;
  triggerNode: NodeDetailsArrayModel;
  currentSessionId: string;
  workflowLogsViewData: WorkflowLogsViewData = new WorkflowLogsViewData();
  showExecutionLogsFlag = false;
  isLoadingExecutionLogs = false;
  isDropdownOpen = false; //change variable name
  isWorkflowExecuting: boolean = false;
  workflowStatus: string;
  triggerData: any; // add interface
  workFlowViewData: any; // add type
  chatUpdates$ = new Subject<OnChatExecution>();
  resumeBtn: boolean = false;
  formattedTask = []; // add interface
  isRunning = false;
  existingFormData: any = {};
  tabbedFormData = [];
  rightExecuteData: any = null;
  bottomActiveTab: 'variables' | 'logs' = 'logs';   // default tab
  workflowsInProgress: EntityTaskRelation[] = [];
  savedWorkflowVarsData: any;
  isSavingWorkflow = false;
  isWorkflowSaved = false;
  isLoadingWorkflow = true;
  private workflowGroupsLoadComplete = false;
  private workflowDetailsLoadComplete = false;
  private workflowDrawflowRendered = false;
  private nodeConfigurationLoading = new Set<string>();
  backModalRef: BsModalRef;
  @ViewChild('confirmBack') confirmBack: ElementRef;
  selectedConnection: SelectedConnection | null = null;
  selectedConnectionShape: ConnectorShape = 'rounded';
  showBulkConnectorShapeAction = false;
  connectionMenuPosition = { x: 0, y: 0 };
  readonly connectorShapeOptions: Array<{
    value: ConnectorShape;
    label: string;
    previewPath: string;
  }> = [
      { value: 'rounded', label: 'Rounded', previewPath: 'M 2 15 L 15 15 Q 20 15 20 10 L 20 6 Q 20 2 25 2 L 38 2' },
      { value: 'right-angle', label: 'Right angled', previewPath: 'M 2 15 L 20 15 L 20 2 L 38 2' },
      { value: 'curved', label: 'Curvy', previewPath: 'M 2 15 C 15 15 25 2 38 2' },
      { value: 'straight', label: 'Straight', previewPath: 'M 2 15 L 38 2' }
    ];
  private lastCanvasPointerEvent: MouseEvent | null = null;

  showRunHeading: boolean = true;   // controls "Run Workflow" heading vs status+stop
  private pollingUnsubscribe$ = new Subject<void>();
  // isRunning: boolean = false;
  // resumeBtn: boolean = false;
  @ViewChild(WfDynamicRightExecuteComponent) chatbotRef!: WfDynamicRightExecuteComponent;
  workflowGroups: WorkflowGroup[] = [];
  loadingLeftPanel = false;
  isViewMode = false;
  @ViewChild('workflowDetailsFormRef') workflowDetailsFormRef: ElementRef;
  workflowDetailsForm: FormGroup;
  workflowDetailsFormErrors: any;
  workflowDetailsFormValidationMessages: any;
  editWorkflowFlag = false;

  constructor(
    @Inject(DOCUMENT) private document,
    private renderer: Renderer2,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService,
    private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private svc: WfDynamicContainerService,
    private leftPanelSvc: WfDynamicLeftService,
  ) {
    this.currentCriteria = { searchValue: '', pageSize: 0 };
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workFlowId = params.get('id');
    });
    this.isViewMode = this.router.url.includes('view');
  }

  ngOnInit(): void {
    this.workflowDetailsLoadComplete = !this.workFlowId;
    this.manageWorkflowDetails();
    this.loadWorkflowGroups();
    this.minimizeLeftPanel();
    document.body.classList.add('wf-page');
    this.addWindowEventsForNodes();
  }

  ngAfterViewInit(): void {
    this.initializeDrawflow();
    if (this.workFlowId) {
      this.getWorkflowDetails();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.leftPanelSvc.clearWorkflowGroupsCache();
    this.maximizeLeftPanel();
    document.body.classList.remove('wf-page');
    this.pollingUnsubscribe$.next();
    this.pollingUnsubscribe$.complete();
  }

  loadWorkflowGroups(): void {
    this.loadingLeftPanel = true;
    this.leftPanelSvc.getWorkflowGroups().pipe(takeUntil(this.ngUnsubscribe), switchMap((response) => {
      const workflowGroups = response.groups || [];
      const dynamicGroups = workflowGroups.filter(
        group =>
          group.group_type?.toLowerCase() === 'dynamic' &&
          group.endpoint
      );
      if (!dynamicGroups.length) {
        return of({
          workflowGroups, dynamicResponses: []
        });
      }

      const requests = dynamicGroups.map(group =>
        this.leftPanelSvc.getDynamicGroupItems(group.endpoint).pipe(map(apiResponse => ({
          groupKey: group.key,
          data: apiResponse || []
        })),
          catchError(() => {
            this.notification.error(
              new Notification(`Failed to load ${group.name}`)
            );

            return of({
              groupKey: group.key,
              data: []
            });
          })
        )
      );

      return forkJoin(requests).pipe(
        map(dynamicResponses => ({
          workflowGroups,
          dynamicResponses
        }))
      );
    }),

      finalize(() => {
        this.loadingLeftPanel = false;
        this.workflowGroupsLoadComplete = true;
        this.updateInitialLoadingState();
      })
    )
      .subscribe({
        next: ({ workflowGroups, dynamicResponses }: any) => {
          dynamicResponses.forEach(response => {
            const group = workflowGroups.find(
              g => g.key === response.groupKey
            );

            if (!group) {
              return;
            }

            group.categories = response.data;
            group.isCategorized = true;
          });

          this.workflowGroups = workflowGroups;
        },

        error: () => {
          this.notification.error(
            new Notification('Failed to load workflow nodes')
          );
        }
      });
  }

  private updateInitialLoadingState(): void {
    this.isLoadingWorkflow = !(
      this.workflowGroupsLoadComplete && this.workflowDetailsLoadComplete
    );

    if (!this.isLoadingWorkflow && this.workFlowId) {
      this.renderLoadedWorkflow();
      this.validateAgentToolConfigurations();
    }
  }

  private renderLoadedWorkflow(): void {
    if (
      this.workflowDrawflowRendered ||
      !this.workflowGroupsLoadComplete ||
      !this.workflowDetailsLoadComplete ||
      !this.workFlowData ||
      !this.editor
    ) {
      return;
    }

    this.workflowDrawflowRendered = true;
    this.workFlowData.nodes = (this.workFlowData.nodes || []).map(node => ({
      ...node,
      icon_path: this.getNodeIconPath(node)
    }));
    this.nodeDetailsArr.forEach(node => {
      node.icon_path = this.getNodeIconPath(node);
    });
    this.toolsArr.forEach(group => {
      (group?.data || []).forEach(tool => {
        tool.icon_path = this.getNodeIconPath(tool);
        tool.endpoint = this.getNodeConfigurationEndpoint(tool);
      });
    });

    const getId = (value: any) =>
      value?.includes?.('-') ? Number(value.split('-')[1]) : Number(value);
    const drawflowData = this.generateDrawflowStructureEdit(this.workFlowData);

    this.triggerNode = this.nodeDetailsArr.find(node =>
      this.svc.isTriggerNode(node.node_type)
    );
    this.rightExecuteData = this.prepareRightExecuteData(
      this.triggerNode,
      this.triggerNode?.config?.properties || {}
    );

    this.waitForEditorAndImport(drawflowData, true);
    this.editor.on('import', () => {
      this.nodeDetailsArr.forEach(node => {
        this.syncNodeUI(getId(node?.node_id));
      });
      this.updateHasNode();
      requestAnimationFrame(() => {
        this.nodeDetailsArr.forEach(node => {
          this.editor.updateConnectionNodes(`node-${node.node_id}`);
        });
      });
    });
  }

  private validateAgentToolConfigurations(): void {
    this.toolsArr
      .flatMap(group => group?.data || [])
      .forEach(tool => {
        const endpoint = this.getNodeConfigurationEndpoint(tool);
        const numericToolId = Number(String(tool?.tool_id ?? tool?.node_id).replace(/^tool-/, ''));

        if (!endpoint || !Number.isFinite(numericToolId)) return;

        tool.endpoint = endpoint;
        this.loadNodeConfiguration(tool, numericToolId, false, true);
      });
  }

  minimizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (!isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'none');
      sidebar_minimizer.click();
    }

    let footer = this.document.getElementsByClassName('unity-app-footer').item(0);
    this.renderer.setStyle(footer, 'display', 'none');
    footer.click();
  }

  maximizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'unset');
      sidebar_minimizer.click();
    }

    let footer = this.document.getElementsByClassName('unity-app-footer').item(0);
    this.renderer.setStyle(footer, 'display', 'flex');
    footer.click();
  }

  /* =========================
   TOGGLE PANELS
========================= */

  /* LEFT PANEL */
  toggleLeftPanel(): void {
    if (this.isLeftCollapsed) {
      this.leftWidth = this.previousLeftWidth || 340;
    } else {
      this.previousLeftWidth = this.leftWidth;
      this.leftWidth = 0; // collapsed visible strip
    }

    this.isLeftCollapsed = !this.isLeftCollapsed;
  }

  /* RIGHT PANEL */
  toggleRightPanel(): void {
    if (this.isRightCollapsed) {
      this.rightWidth = this.previousRightWidth || 340;
    } else {
      this.previousRightWidth = this.rightWidth;
      this.rightWidth = 0;
    }

    this.isRightCollapsed = !this.isRightCollapsed;
  }

  /* BOTTOM PANEL */
  toggleBottomPanel(): void {
    if (this.isBottomCollapsed) {
      this.bottomHeight = this.previousBottomHeight || 250;
    } else {
      this.previousBottomHeight = this.bottomHeight;
      this.bottomHeight = 0;
    }

    this.isBottomCollapsed = !this.isBottomCollapsed;
  }

  /* =========================
     RESIZE STARTERS
  ========================= */

  startLeftResize(event: MouseEvent): void {
    if (this.isLeftCollapsed) return;

    event.preventDefault();
    this.resizingPanel = 'left';
    this.startX = event.clientX;
    this.startWidth = this.leftWidth;

    this.attachResizeListeners();
  }

  startRightResize(event: MouseEvent): void {
    if (this.isRightCollapsed) return;

    event.preventDefault();
    this.resizingPanel = 'right';
    this.startX = event.clientX;
    this.startWidth = this.rightWidth;

    this.attachResizeListeners();
  }

  startBottomResize(event: MouseEvent): void {
    if (this.isBottomCollapsed) return;

    event.preventDefault();
    this.resizingPanel = 'bottom';
    this.startY = event.clientY;
    this.startHeight = this.bottomHeight;

    this.attachResizeListeners();
  }

  /* =========================
     RESIZE EVENTS
  ========================= */

  attachResizeListeners(): void {
    document.body.classList.add('resizing-panel');

    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);
  }

  onResize = (event: MouseEvent): void => {
    if (!this.resizingPanel) return;

    if (this.resizingPanel === 'left') {
      const newWidth = this.startWidth + (event.clientX - this.startX);
      this.leftWidth = Math.min(400, Math.max(340, newWidth));
    }

    if (this.resizingPanel === 'right') {
      const newWidth = this.startWidth - (event.clientX - this.startX);
      this.rightWidth = Math.min(450, Math.max(340, newWidth));
    }

    if (this.resizingPanel === 'bottom') {
      const newHeight = this.startHeight - (event.clientY - this.startY);
      this.bottomHeight = Math.min(
        window.innerHeight * 0.7,
        Math.max(180, newHeight)
      );
    }
  };
  /* =========================
     STOP RESIZE
  ========================= */

  stopResize = (): void => {
    this.resizingPanel = null;
    this.document.body.classList.remove('resizing-panel');
    this.document.removeEventListener('mousemove', this.onResize);
    this.document.removeEventListener('mouseup', this.stopResize);
  };
  addWindowEventsForNodes() {
    (window as any).handleAgentDrop = (event: DragEvent, agentNodeId: number) => {
      this.onAgentDrop(event, agentNodeId);
    };

    (window as any).toggleMemoryIcon = (nodeId, el: HTMLImageElement) => {
      const isEnabled = el.getAttribute('data-enabled') === 'true';
      const newState = !isEnabled;

      const node = this.nodeDetailsArr.find(n => n.node_id === nodeId);
      if (node) {
        node.enable_memory = newState;  // direct on node, not node.config
      }

      el.setAttribute('data-enabled', newState.toString());
    };

    (window as any).onModelChange = (nodeId, el: HTMLSelectElement, ev?: Event) => {
      const selectedValue = el.value;

      const node = this.nodeDetailsArr.find(n => n.node_id === nodeId);
      if (node) {
        node.model = {
          ...node.model,
          llm_integ: selectedValue
        };
        if (!node.formErrors) node.formErrors = {};
        node.formErrors.model = selectedValue ? '' : 'Model is required';
        const hasErrors = this.hasAnyErrors(node.formErrors);
        this.updateNodeStatusIcon(
          nodeId,
          hasErrors,
          hasErrors ? 'Validation errors' : 'All required fields are filled up!'
        );
      }
    };
  }

  // onAgentDrop(event: DragEvent, agentNodeId: number) {
  //   event.preventDefault();

  //   console.log('Tool dropped into AI Agent:', agentNodeId);

  //   this.currentAgentNodeId = agentNodeId;
  //   this.droppedAsTool = true;
  // }

  onAgentDrop(event: DragEvent, agentNodeId: number): void {
    event.preventDefault();
    event.stopPropagation();

    console.log('Tool dropped into AI Agent:', agentNodeId); // kept, unchanged

    this.currentAgentNodeId = agentNodeId;
    this.droppedAsTool = true;
    const nodeData = event.dataTransfer?.getData('value');
    const data = nodeData ? JSON.parse(nodeData) : null;
    if (!data) {
      return;
    }

    const positionX = event.clientX * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)));
    const positionY = event.clientY * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)));

    this.selectedCategory = data.category;

    const row = {
      node_type: data.node_type,
      name: data.name,
      category: data.category,
      image: data.image,
      icon_path: data.icon_path,
      key: data.key,
      pos_x: positionX,
      pos_y: positionY,
      endpoint: data.endpoint,
      as_tool: data?.as_tool,
      droppedAsTool: true
    };

    this.latestDroppedNode = row;
    // Drawflow only advances its counter from canvas nodes. Tools are stored
    // inside AI Agent nodes, so an imported workflow can otherwise reuse an
    // existing tool id when a new tool is dropped.
    this.editor.nodeId = Math.max(
      Number(this.editor.nodeId) || 1,
      this.getLatestNodeIdForAITools() + 1
    );
    this.addNode(row, positionX, positionY);
  }

  initializeDrawflow() {
    const container = this.drawflowContainer.nativeElement;
    if (container.querySelector('.agentic-default-node')) {
      this.emptyCanvas = false;
    } else {
      this.emptyCanvas = true;
    }
    this.editor = new Drawflow(container);
    this.editor.removeNodeId = function (id) {
      if (!id) return;

      const nodeId = id.slice(5);
      const moduleName = this.getModuleFromNodeId(nodeId);

      if (!moduleName || !this.drawflow?.drawflow?.[moduleName]) {
        return;
      }

      this.removeConnectionNodeId(id);

      if (this.module === moduleName) {
        const el = document.getElementById(id);
        if (el) el.remove();
      }

      if (this.drawflow.drawflow[moduleName].data[nodeId]) {
        delete this.drawflow.drawflow[moduleName].data[nodeId];
      }

      this.dispatch('nodeRemoved', nodeId);
    };
    this.editor.start();
    this.editor.curvature = 0.5;
    this.editor.zoom_min = 0.1;

    this.editor.createCurvature = function (
      start_pos_x,
      start_pos_y,
      end_pos_x,
      end_pos_y
    ) {
      const offsetX = 120;
      const clearanceY = 80;

      // adaptive radius (prevents sharp breaks on short segments)
      const getRadius = (len: number) => Math.min(12, Math.abs(len) / 2);

      const isForward = end_pos_x >= start_pos_x;

      if (isForward) {
        const mid_x = start_pos_x + (end_pos_x - start_pos_x) / 2;

        const dx = mid_x - start_pos_x;
        const dyTotal = end_pos_y - start_pos_y;

        const rX = getRadius(dx);
        const rY = getRadius(dyTotal);

        const dy = dyTotal > 0 ? rY : -rY;

        return `
          M ${start_pos_x} ${start_pos_y}
          L ${mid_x - rX} ${start_pos_y}
          Q ${mid_x} ${start_pos_y} ${mid_x} ${start_pos_y + dy}
          L ${mid_x} ${end_pos_y - dy}
          Q ${mid_x} ${end_pos_y} ${mid_x + rX} ${end_pos_y}
          L ${end_pos_x} ${end_pos_y}
        `;
      } else {
        const mid_x1 = start_pos_x + offsetX;
        const mid_x2 = end_pos_x - offsetX;
        const drop_y = Math.max(start_pos_y, end_pos_y) + clearanceY;

        const dx1 = mid_x1 - start_pos_x;
        const dx2 = mid_x2 - end_pos_x;
        const dy1 = drop_y - start_pos_y;
        const dy2 = drop_y - end_pos_y;

        const r1 = getRadius(dx1);
        const r2 = getRadius(dx2);
        const rY1 = getRadius(dy1);
        const rY2 = getRadius(dy2);

        const dirY1 = dy1 > 0 ? rY1 : -rY1;
        const dirY2 = dy2 > 0 ? -rY2 : rY2;

        return `
          M ${start_pos_x} ${start_pos_y}
          L ${mid_x1 - r1} ${start_pos_y}
          Q ${mid_x1} ${start_pos_y} ${mid_x1} ${start_pos_y + dirY1}
    
          L ${mid_x1} ${drop_y - dirY1}
          Q ${mid_x1} ${drop_y} ${mid_x1 - r1} ${drop_y}
    
          L ${mid_x2 + r2} ${drop_y}
          Q ${mid_x2} ${drop_y} ${mid_x2} ${drop_y + dirY2}
    
          L ${mid_x2} ${end_pos_y - dirY2}
          Q ${mid_x2} ${end_pos_y} ${mid_x2 + r2} ${end_pos_y}
    
          L ${end_pos_x} ${end_pos_y}
        `;
      }
    };

    const updateConnectionNodes = this.editor.updateConnectionNodes.bind(this.editor);
    this.editor.updateConnectionNodes = (nodeId: string) => {
      updateConnectionNodes(nodeId);
      this.applyConnectionShapes();
    };

    this.editor.force_first_input = true;

    this.captureDrawflowEvents();
  }

  captureDrawflowEvents() {
    setTimeout(() => {
      if (!this.editor) {
        return;
      }

      this.latestDroppedNode = null;

      this.editor.on('click', (event: MouseEvent) => {
        this.lastCanvasPointerEvent = event;
      });

      this.editor.on('connectionSelected', (connection: SelectedConnection) => {
        this.openConnectionEditor(connection);
      });

      this.editor.on('connectionUnselected', () => {
        this.closeConnectionEditor();
      });

      this.editor.on('nodeSelected', () => {
        this.closeConnectionEditor();
      });

      this.editor.on('translate', () => {
        this.closeConnectionEditor();
      });

      this.editor.on('zoom', () => {
        this.closeConnectionEditor();
      });

      // Handle node creation (Only runs once globally)
      this.editor.on('nodeCreated', (id: number) => {
        if (this.latestDroppedNode) {
          const isTool = !!(this.latestDroppedNode.as_tool || this.droppedAsTool);
          this.updateNodeDetails(id, this.latestDroppedNode);
          if ((this.latestDroppedNode.node_type === nodeTypes.IfElse) ||
            (this.latestDroppedNode.node_type === nodeTypes.Switch)) {
            this.adjustNodeOutputs(id);
            this.getConnectedNodeDetails(Number(id));
          } else if (this.latestDroppedNode.node_type === nodeTypes.Loop) {
            this.adjustNodeInputs(id);
            this.adjustNodeOutputs(id);
            this.getConnectedNodeDetails(Number(id));
          }
          this.setNodeDetails(this.latestDroppedNode, id);
          this.loadNodeConfiguration(this.latestDroppedNode, id, false, isTool);
          this.latestDroppedNode = null;
        }

        const container = document.getElementById('dynamic-drawflow') as HTMLElement;
        if (container.querySelector('.agentic-default-node')) {
          this.emptyCanvas = false;
        }


        const nodeEl = document.getElementById(`node-${id}`);
        if (nodeEl) {
          nodeEl.addEventListener('dblclick', (event: Event) => {
            this.getConnectedNodeDetails(id);
            this.openNodeModal(id);
          });
        }
        // Add edit button click
        const editBtn = nodeEl.querySelector('.action.edit');
        if (editBtn) {
          editBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            this.getConnectedNodeDetails(id);
            this.openNodeModal(id);
          });
        }

        // Add delete button click
        const deleteBtn = nodeEl.querySelector('.action.delete');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            this.editor.removeNodeId(`node-${id}`);
            this.updateHasNode();
          });
        }


        // Add test button click
        const testBtn = nodeEl.querySelector('.action.test');
        if (testBtn) {
          testBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            this.executionMode = 'run_node';
            this.runNodeID = true;
            const nodeId = nodeEl.id;
            console.log(this.nodeDetailsArr, "nodeDetaillsssssssssssssss")
            const clickedNode = this.nodeDetailsArr.find(n => `node-${n.node_id}` === nodeId);

            if (!clickedNode) return;
            this.clickedNodeId = Number(clickedNode.node_id);
            const hasErrors = this.hasNodeOrAgentToolErrors(clickedNode);
            console.log(hasErrors, "has Errors")
            console.log(hasErrors, clickedNode, "hasErrors 1")

            if (hasErrors) {
              this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
              return
            }

            const triggerNode = this.getTriggerNode();
            const triggerStatus = this.getTriggerExecutionStatus();
            const isConnected = this.isTriggerConnectedToNode(Number(clickedNode.node_id));

            if (this.svc.isTriggerNode(clickedNode.node_type)) {
              this.triggerNode = clickedNode;
              this.openExecutionPanel();
              return;
            }
            if (triggerNode && isConnected && (!triggerStatus || triggerStatus === 'Failed')) {
              this.triggerNode = triggerNode;
              this.openExecutionPanel();
              return;
            }
            this.pollForRealTimeExecution();
          });
        }
      });

      // Handle node removal (Only runs once globally)
      this.editor.on('nodeRemoved', (id: number) => {
        const container = document.getElementById('dynamic-drawflow') as HTMLElement;
        if (container.querySelector('.agentic-default-node')) {
          this.emptyCanvas = false;
        } else {
          this.emptyCanvas = true;
        }
        this.handleNodeRemove(id);
      });

      this.editor.on('connectionCreated', (connection) => {
        this.connectionList.push({
          ...connection,
          connector_shape: 'rounded'
        });
        console.log('created>>>>>', this.connectionList);
        this.applyConnectionShapes();
      });

      // Remove when a connection is deleted in the canvas
      this.editor.on('connectionRemoved', (conn) => {
        console.log('conn removed>>>', this.connectionList, conn)
        this.connectionList = this.connectionList.filter(c =>
          !(
            Number(c.output_id) === Number(conn.output_id) &&
            Number(c.input_id) === Number(conn.input_id) &&
            c.output_class === conn.output_class &&
            c.input_class === conn.input_class
          )
        );
        this.closeConnectionEditor();
      });

      this.editor.on('nodeMoved', (id: number) => {
        const drawflowNode = this.editor.getNodeFromId(id);
        const node = this.nodeDetailsArr.find(
          item => Number(item.node_id) === Number(id)
        );

        if (!drawflowNode || !node) {
          return;
        }

        node.pos_x = drawflowNode.pos_x;
        node.pos_y = drawflowNode.pos_y;

        const realTimeNode = this.realTimeNodeDetails?.nodes?.find(
          (item: any) => Number(item.node_id) === Number(id)
        );
        if (realTimeNode) {
          realTimeNode.pos_x = drawflowNode.pos_x;
          realTimeNode.pos_y = drawflowNode.pos_y;
        }
        this.closeConnectionEditor();
      });

    }, 0);
  }

  setSelectedConnectionShape(shape: ConnectorShape): void {
    if (!this.selectedConnection) return;

    const connection = this.findConnection(this.selectedConnection);
    if (!connection || connection.connector_shape === shape) return;

    connection.connector_shape = shape;
    this.selectedConnectionShape = shape;
    this.showBulkConnectorShapeAction = this.connectionList.length > 1;
    this.refreshConnectionShapes([this.selectedConnection.output_id]);
  }

  applySelectedConnectionShapeToAll(): void {
    if (!this.selectedConnection) return;

    this.connectionList.forEach(connection => {
      connection.connector_shape = this.selectedConnectionShape;
    });

    const sourceNodeIds = Array.from(new Set(
      this.connectionList.map(connection => Number(connection.output_id))
    ));
    this.refreshConnectionShapes(sourceNodeIds);
    this.showBulkConnectorShapeAction = false;
    this.notification.success(new Notification(
      `${this.connectionList.length} connections updated.`
    ));
  }

  deleteSelectedConnection(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.selectedConnection) return;

    const { output_id, input_id, output_class, input_class } = this.selectedConnection;
    this.editor.removeSingleConnection(
      String(output_id),
      String(input_id),
      output_class,
      input_class
    );
    this.closeConnectionEditor();
  }

  closeConnectionEditor(): void {
    this.selectedConnection = null;
    this.showBulkConnectorShapeAction = false;
  }

  private openConnectionEditor(connection: SelectedConnection): void {
    if (this.lastCanvasPointerEvent && this.lastCanvasPointerEvent.button !== 0) {
      this.closeConnectionEditor();
      return;
    }

    const normalizedConnection: SelectedConnection = {
      ...connection,
      output_id: Number(connection.output_id),
      input_id: Number(connection.input_id)
    };
    const storedConnection = this.findConnection(normalizedConnection);
    this.selectedConnection = normalizedConnection;
    this.selectedConnectionShape = this.normalizeConnectorShape(storedConnection?.connector_shape);
    this.showBulkConnectorShapeAction = false;

    const container = document.getElementById('dynamic-drawflow');
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    const pointerX = this.lastCanvasPointerEvent?.clientX ?? bounds.left + (bounds.width / 2);
    const pointerY = this.lastCanvasPointerEvent?.clientY ?? bounds.top + (bounds.height / 2);
    const menuWidth = 312;
    const menuHeight = 154;
    this.connectionMenuPosition = {
      x: Math.max(8, Math.min(pointerX - bounds.left + 12, bounds.width - menuWidth - 8)),
      y: Math.max(8, Math.min(pointerY - bounds.top + 12, bounds.height - menuHeight - 8))
    };
  }

  private findConnection(connection: SelectedConnection): any {
    return this.connectionList.find(item =>
      Number(item.output_id) === Number(connection.output_id) &&
      Number(item.input_id) === Number(connection.input_id) &&
      item.output_class === connection.output_class &&
      item.input_class === connection.input_class
    );
  }

  private normalizeConnectorShape(shape: string): ConnectorShape {
    return this.connectorShapeOptions.some(option => option.value === shape)
      ? shape as ConnectorShape
      : 'rounded';
  }

  private refreshConnectionShapes(nodeIds: number[]): void {
    nodeIds.forEach(nodeId => this.editor.updateConnectionNodes(`node-${nodeId}`));
    this.applyConnectionShapes();
  }

  private applyConnectionShapes(): void {
    const container = document.getElementById('dynamic-drawflow');
    if (!container) return;

    container.querySelectorAll<SVGElement>('.drawflow .connection').forEach(connectionElement => {
      const classes = Array.from(connectionElement.classList);
      const inputNodeClass = classes.find(className => className.startsWith('node_in_node-'));
      const outputNodeClass = classes.find(className => className.startsWith('node_out_node-'));
      const outputClass = classes.find(className => className.startsWith('output_'));
      const inputClass = classes.find(className => className.startsWith('input_'));
      if (!inputNodeClass || !outputNodeClass || !outputClass || !inputClass) return;

      const connection = this.connectionList.find(item =>
        Number(item.output_id) === Number(outputNodeClass.slice('node_out_node-'.length)) &&
        Number(item.input_id) === Number(inputNodeClass.slice('node_in_node-'.length)) &&
        item.output_class === outputClass &&
        item.input_class === inputClass
      );
      const shape = this.normalizeConnectorShape(connection?.connector_shape);
      connectionElement.setAttribute('data-connector-shape', shape);

      connectionElement.querySelectorAll<SVGPathElement>('.main-path').forEach(path => {
        const points = (path.getAttribute('d') || '').match(/-?\d*\.?\d+/g)?.map(Number);
        if (!points || points.length < 4 || shape === 'rounded') return;

        const [startX, startY] = points;
        const endX = points[points.length - 2];
        const endY = points[points.length - 1];
        const middleX = startX + ((endX - startX) / 2);
        const isBackwardConnection = endX < startX;
        let pathData: string;

        switch (shape) {
          case 'right-angle':
            pathData = isBackwardConnection
              ? this.createBackwardConnectionPath(startX, startY, endX, endY, shape)
              : `M ${startX} ${startY} L ${middleX} ${startY} L ${middleX} ${endY} L ${endX} ${endY}`;
            break;
          case 'curved': {
            if (isBackwardConnection) {
              pathData = this.createBackwardConnectionPath(startX, startY, endX, endY, shape);
              break;
            }
            const controlOffset = Math.max(45, Math.abs(endX - startX) * 0.5);
            pathData = `M ${startX} ${startY} C ${startX + controlOffset} ${startY} ${endX - controlOffset} ${endY} ${endX} ${endY}`;
            break;
          }
          case 'straight':
            pathData = isBackwardConnection
              ? this.createBackwardConnectionPath(startX, startY, endX, endY, shape)
              : `M ${startX} ${startY} L ${endX} ${endY}`;
            break;
          default:
            return;
        }

        path.setAttribute('d', pathData);
      });
    });
  }

  private createBackwardConnectionPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    shape: Exclude<ConnectorShape, 'rounded'>
  ): string {
    // Feedback connections (notably a Loop body's return connection) must be
    // routed outside the nodes. A direct path is hidden underneath the nodes,
    // even though Drawflow still retains it and rejects a duplicate reconnect.
    const horizontalClearance = 120;
    const verticalClearance = 80;
    const startTurnX = startX + horizontalClearance;
    const endTurnX = endX - horizontalClearance;
    const returnY = Math.max(startY, endY) + verticalClearance;

    if (shape === 'curved') {
      return `
        M ${startX} ${startY}
        C ${startTurnX} ${startY} ${startTurnX} ${startY} ${startTurnX} ${returnY}
        C ${startTurnX} ${returnY} ${endTurnX} ${returnY} ${endTurnX} ${returnY}
        C ${endTurnX} ${returnY} ${endTurnX} ${endY} ${endX} ${endY}
      `;
    }

    if (shape === 'straight') {
      return `M ${startX} ${startY} L ${startTurnX} ${returnY} L ${endTurnX} ${returnY} L ${endX} ${endY}`;
    }

    return `
      M ${startX} ${startY}
      L ${startTurnX} ${startY}
      L ${startTurnX} ${returnY}
      L ${endTurnX} ${returnY}
      L ${endTurnX} ${endY}
      L ${endX} ${endY}
    `;
  }


  loadNodeConfiguration(node: NodeDetails, id: number | string, openModal: boolean = false, isTool: boolean = this.droppedAsTool): void {
    if (!node?.endpoint) {
      return;
    }
    const requestKey = this.getNodeConfigurationRequestKey(id, isTool);
    if (this.nodeConfigurationLoading.has(requestKey)) {
      return;
    }
    this.nodeConfigurationLoading.add(requestKey);

    let endpoint = node.endpoint;
    if (isTool) {
      endpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}as_tool=true`
    }
    this.svc.getNodeConfiguration(endpoint).pipe(
      takeUntil(this.ngUnsubscribe),
      catchError(() => {
        this.notification.error(new Notification(`Failed to load ${node.name} data`));
        return of(null);
      }),
      finalize(() => this.nodeConfigurationLoading.delete(requestKey))
    ).subscribe((response) => {
      if (!response) {
        this.showOpenNodeModalConfigurationError(id, isTool);
        return;
      }

      // Normalize schema
      response.tabs = (response.tabs || []).map((tab: any) => ({
        ...tab,
        fields: (tab.fields || []).map((field: any) => ({
          ...field,
          control_name: field.key,
          controlLabel: field.label,
          type: field.type === 'textarea' ? 'text-area' : field.type,
          default_value: field.default ?? '',
          value: field.default ?? ''
        }))
      }));
      // this.updateNodeById(id, response, openModal);
      const existingNode = isTool
        ? this.toolsArr
          .flatMap(group => group?.data || [])
          .find(tool =>
            this.normalizeToolId(tool?.tool_id ?? tool?.node_id) ===
            this.normalizeToolId(id)
          )
        : this.nodeDetailsArr.find(
          n => Number(n.node_id) === Number(id)
        );


      const mergedConfig = {
        ...response,
        ...existingNode?.config
      };

      this.updateNodeById(
        isTool ? this.normalizeToolId(id) : id,
        mergedConfig,
        openModal
      );

      // NEW: validate mandatory fields right after config is set
      const valuesMap = this.getNodeInitialValues({ config: mergedConfig });
      const { errors, hasErrors } = this.validateMandatoryFields(mergedConfig, valuesMap);
      const tooltip = this.buildErrorTooltip(errors);

      if (isTool) {
        const toolKey = this.normalizeToolId(id);
        this.toolsArr = this.toolsArr.map(group => ({
          ...group,
          data: (group.data || []).map(tool =>
            this.normalizeToolId(tool?.tool_id ?? tool?.node_id) === toolKey
              ? { ...tool, formErrors: errors, hasErrors }
              : tool
          )
        }));
      } else {
        this.nodeDetailsArr = this.nodeDetailsArr.map(n =>
          Number(n.node_id) === Number(id)
            ? { ...n, formErrors: errors, hasErrors }
            : n
        );

        this.updateNodeStatusIcon(
          Number(id),
          hasErrors,
          hasErrors ? tooltip : 'All required fields are filled up!'
        );
      }

      this.hydrateOpenNodeModal(id, isTool);
    });
  }

  private getNodeConfigurationRequestKey(id: number | string, isTool: boolean): string {
    return `${isTool ? 'tool' : 'node'}:${isTool ? this.normalizeToolId(id) : Number(id)}`;
  }

  private hydrateOpenNodeModal(id: number | string, isTool: boolean): void {
    if (this.modalService.getModalsCount() === 0) return;

    const modal = this.modalRef?.content as WfDynamicParamsComponent;
    if (!modal?.isSchemaLoading || !this.isModalForNode(modal, id, isTool)) return;

    const updatedNode = this.getSelectedNode(isTool ? this.normalizeToolId(id) : Number(id));
    if (!updatedNode) return;

    this.selectedNode = updatedNode;
    modal.applyNodeConfiguration(updatedNode, this.getNodeInitialValues(updatedNode));
  }

  private showOpenNodeModalConfigurationError(id: number | string, isTool: boolean): void {
    if (this.modalService.getModalsCount() === 0) return;

    const modal = this.modalRef?.content as WfDynamicParamsComponent;
    if (modal?.isSchemaLoading && this.isModalForNode(modal, id, isTool)) {
      modal.showSchemaLoadError();
    }
  }

  private isModalForNode(modal: WfDynamicParamsComponent, id: number | string, isTool: boolean): boolean {
    return isTool
      ? this.normalizeToolId(modal.nodeData?.tool_id ?? modal.nodeData?.node_id) === this.normalizeToolId(id)
      : Number(modal.nodeData?.node_id) === Number(id);
  }

  validateMandatoryFields(schema: any, valuesMap: Record<string, any>): { errors: Record<string, any>; hasErrors: boolean } {
    const isEmpty = (v: any) =>
      v === undefined || v === null ||
      (typeof v === 'string' && v.trim() === '') ||
      (Array.isArray(v) && v.length === 0);

    const noValueOperators = new Set([
      'IS_TRUE',
      'IS_FALSE',
      'IS_NULL',
      'IS_NOT_NULL',
      'IS_EMPTY',
      'IS_NOT_EMPTY'
    ]);

    const countConditionRules = (condition: any): number => {
      if (!condition) return 0;
      if (Array.isArray(condition.children)) {
        return condition.children.reduce(
          (count: number, child: any) => count + countConditionRules(child),
          0
        );
      }
      return condition.field !== undefined ? 1 : 0;
    };

    const isConditionComplete = (condition: any): boolean => {
      if (!condition) return false;
      if (Array.isArray(condition.children)) {
        return condition.children.length > 0 && condition.children.every(isConditionComplete);
      }

      const operator = String(condition.operator || '').toUpperCase();
      const dataType = String(condition.data_type ?? condition.dataType ?? '').toUpperCase();
      const requiresValue = !noValueOperators.has(operator) &&
        dataType !== 'BOOLEAN' &&
        dataType !== 'NULL_EMPTY';

      return !isEmpty(condition.field) &&
        !isEmpty(dataType) &&
        !isEmpty(operator) &&
        (!requiresValue || !isEmpty(condition.value));
    };

    const isVisible = (field: any, values: Record<string, any>): boolean => {
      if (!field?.visible_when) return true;

      const conditions = Array.isArray(field.visible_when)
        ? field.visible_when
        : [field.visible_when];
      const logic = Array.isArray(field.visible_when)
        ? (conditions.find((condition: any) => condition?.logic)?.logic ?? 'all')
        : (field.visible_when.logic ?? 'all');

      const results = conditions.map((condition: any) => {
        const key = condition.field ?? condition.control_name;
        const controlValue = values?.[key];
        const expectedValue = condition.value;

        if (condition.operator === 'neq' || condition.not_value !== undefined) {
          const excludedValue = condition.not_value ?? expectedValue;
          return Array.isArray(excludedValue)
            ? !excludedValue.includes(controlValue)
            : controlValue !== excludedValue;
        }

        if (condition.operator === 'nin') {
          return !Array.isArray(expectedValue) || !expectedValue.includes(controlValue);
        }

        if (expectedValue !== undefined) {
          return Array.isArray(expectedValue)
            ? expectedValue.includes(controlValue)
            : controlValue === expectedValue;
        }

        return true;
      });

      return logic === 'any' ? results.some(Boolean) : results.every(Boolean);
    };

    const validateFields = (fields: any[] = [], values: Record<string, any> = {}): Record<string, any> => {
      const fieldErrors: Record<string, any> = {};

      fields.forEach((field: any) => {
        if (!isVisible(field, values)) return;

        const key = field.key ?? field.control_name;
        if (!key) return;

        const value = values?.[key];
        const fieldType = field.type;
        const isArray = fieldType === 'form_array' || fieldType === 'form-array' || fieldType === 'array';
        const isGroup = fieldType === 'form_group' || fieldType === 'form-group' || fieldType === 'group';
        const isCondition = fieldType === 'condition';

        if (isCondition) {
          const minimumRules = field.min_conditions ?? 1;
          const ruleCount = countConditionRules(value);
          fieldErrors[key] = ruleCount < minimumRules
            ? `At least ${minimumRules} rule${minimumRules === 1 ? ' is' : 's are'} required`
            : (isConditionComplete(value) ? '' : 'Complete all required condition fields');
          return;
        }

        if (isArray) {
          const items = Array.isArray(value) ? value : [];
          const itemsToValidate = [...items];
          while (itemsToValidate.length < (field.min_items || 0)) {
            itemsToValidate.push({});
          }
          fieldErrors[key] = itemsToValidate.map(item =>
            validateFields(field.fields || [], item && typeof item === 'object' ? item : {})
          );
          return;
        }

        if (isGroup) {
          fieldErrors[key] = validateFields(
            field.fields || [],
            value && typeof value === 'object' ? value : {}
          );
          return;
        }

        const validators = Array.isArray(field.validators)
          ? field.validators
          : Object.keys(field.validators || {})
            .filter(type => field.validators[type])
            .map(type => ({ type }));
        const isRequired = field.required === true ||
          validators.some((validator: any) => validator.type === 'required');
        const defaultValue = field.default ?? field.default_value;

        if (isRequired && isEmpty(value) && isEmpty(defaultValue)) {
          fieldErrors[key] = `${field.label || key} is required`;
        }
      });

      return fieldErrors;
    };

    const errors = (schema?.tabs || []).reduce(
      (allErrors: Record<string, any>, tab: any) => ({
        ...allErrors,
        ...validateFields(tab.fields || [], valuesMap)
      }),
      {}
    );

    return { errors, hasErrors: this.hasAnyErrors(errors) };
  }

  updateNodeById(id: number | string, response: any, openModal: boolean = false): void {
    const selected = this.getSelectedNode(id);
    if (!selected) return;

    const triggerNodes = [
      'Manual Trigger',
      'Schedule Trigger',
      'Chat Trigger',
      'Webhook Trigger',
      'ITSM Event Trigger',
      'AIML Event Trigger'
    ];

    const isTool = !!selected.tool_id;

    if (isTool) {
      const toolKey = this.normalizeToolId(id);
      const toolArr = this.toolsArr.find(t =>
        t?.data?.some(n =>
          this.normalizeToolId(n?.tool_id ?? n?.node_id) === toolKey
        )
      );
      const toolIndex = toolArr?.data?.findIndex(n =>
        this.normalizeToolId(n?.tool_id ?? n?.node_id) === toolKey
      ) ?? -1;
      if (toolArr && toolIndex > -1) {
        const updatedNode = { ...toolArr.data[toolIndex], config: response };
        toolArr.data[toolIndex] = updatedNode;
        if (triggerNodes.includes(updatedNode.node_type)) {
          this.rightExecuteData = this.prepareRightExecuteData(updatedNode, this.existingFormData);
          console.log('RIGHT EXECUTE DATA', this.rightExecuteData);
        }
        this.toolsArr = [...this.toolsArr];
        if (openModal) {
          this.selectedNode = updatedNode;
          this.getConnectedNodeDetails(this.normalizeToolId(id));
          this.openNodeModal(this.normalizeToolId(id));
        }
      }
    } else {
      const index = this.nodeDetailsArr.findIndex(n => Number(n.node_id) === Number(id));
      if (index === -1) return;
      const updatedNode = { ...this.nodeDetailsArr[index], config: response };
      this.nodeDetailsArr[index] = updatedNode;
      this.nodeDetailsArr = [...this.nodeDetailsArr];
      if (openModal) {
        this.selectedNode = updatedNode;
        this.getConnectedNodeDetails(Number(id));
        this.openNodeModal(Number(id));
      }
    }
  }

  prepareRightExecuteData(node: any, values?: any): any {
    return {
      nodeId: node?.node_id,
      nodeType: node?.node_type,
      nodeName: node?.name,
      config: node?.config || {},
      values: values || {}
    };
  }

  onDragStart(event: { dragEvent: DragEvent, details: NodeDetails }): void {
    event.dragEvent.dataTransfer?.setData('value', JSON.stringify(event.details));

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
    dragIcon.innerText = event.details?.name;
    document.body.appendChild(dragIcon);
    event.dragEvent.dataTransfer?.setDragImage(dragIcon, 0, 0);

    setTimeout(() => {
      document.body.removeChild(dragIcon);
    }, 0);
    // ---- Custom Drag Image End ----
  }


  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  drop(event): void {
    event.preventDefault();
    const nodeData = event.dataTransfer?.getData('value');
    const data = nodeData ? JSON.parse(nodeData) : null;
    if (data) {
      let positionX = event.clientX * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)));
      let positionY = event.clientY * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)));
      this.selectedCategory = data.category;
      let row = {
        node_type: data.node_type,
        name: data.name,
        category: data.category,
        image: data.image,
        icon_path: data.icon_path,
        key: data.key,
        pos_x: positionX,
        pos_y: positionY,
        endpoint: data.endpoint,
        as_tool: data?.as_tool,
        ...(data.endpoint
          ? {
            formErrors: {
              configuration: 'Configuration has not been validated'
            },
            hasErrors: true
          }
          : {})
      }

      this.latestDroppedNode = row;
      this.addNode(row, positionX, positionY);
    }
  }

  addNode(node: NodeDataModel, positionX: number, positionY: number): void {
    console.log(node)
    if (node.node_type === nodeTypes.Loop) {
      const hasLoopWithOutput2 = this.connectionList.some(conn => {
        const sourceNode = this.nodeDetailsArr.find(
          n => Number(n.node_id) === Number(conn.source)
        );

        return (
          sourceNode?.node_type === nodeTypes.Loop &&
          conn.output_class === 'output_2'
        );
      });

      if (hasLoopWithOutput2) {
        this.notification.error(
          new Notification('Nested loops are not allowed at the moment.')
        );
        return;
      }
    }
    this.noOfOutputNode = (node.node_type === nodeTypes.IfElse || node.node_type === nodeTypes.Loop) ? 2 : 1;
    let noOfInputNode = node.node_type === nodeTypes.Loop ? 2 : 1;
    this.editor.addNode(
      node.name,
      noOfInputNode,
      this.noOfOutputNode, // One output
      positionX,
      positionY,
      'agentic-default-node',
      `<div class="agentic-custom-node">
              <div class="node-header">...</div>
          </div>
          `
    );
    this.updateHasNode();
  }

  updateHasNode(): void {
    const drawflowData = this.editor?.drawflow?.drawflow?.Home?.data || {};
    this.hasNode = Object.keys(drawflowData).length > 0
      || (this.workFlowData?.nodes?.length ?? 0) > 0;
  }

  updateNodeDetails(nodeId: number, node?: NodeDetails) {
    this.editor.updateNodeDataFromId(nodeId, {
      label: node,
      uniqueNodeId: nodeId
    });

    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) {
      if (nodeEl) {
        const contentNode = nodeEl.querySelector('.drawflow_content_node');
        if (contentNode) {
          contentNode.innerHTML = this.getHtmlForNodes(node, nodeId);
        }
      }
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.getHtmlForNodes(node, nodeId).trim();
      this.editor.drawflow.drawflow.Home.data[nodeId].html = tempDiv.innerHTML;

      this.editor.drawflow.drawflow.Home.data[nodeId].data = {
        ...this.editor.drawflow.drawflow.Home.data[nodeId].data,
        label: node,
        nodeId,
      };
    }

  }

  private escapeNodeName(value: any): string {
    const characters: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return String(value ?? '').replace(/[&<>"']/g, character => characters[character]);
  }

  private getNodeIconPath(node: any): string {
    const matchingItem = this.findWorkflowCatalogItem(node);

    // Prefer the current catalog path so older workflows do not retain stale
    // icon paths, while still supporting custom nodes absent from the catalog.
    return matchingItem?.icon_path || node?.icon_path || this.getDefaultTaskIconPath(node);
  }

  private getDefaultTaskIconPath(node: any): string {
    switch (node?.node_type || node?.type) {
      case nodeTypes.Source:
        return 'external-brand/workflow/Sources.svg';
      case nodeTypes.OrchestrationTask:
        return 'external-brand/workflow/Task.svg';
      case nodeTypes.Action:
        return 'external-brand/workflow/Actions.svg';
      default:
        return '';
    }
  }

  private getWorkflowCatalogItems(): any[] {
    return (this.workflowGroups || []).flatMap(group => [
      ...(group?.items || []),
      ...(group?.categories || []).flatMap(category => category?.items || [])
    ]);
  }

  private findWorkflowCatalogItem(node: any): any {
    const items = this.getWorkflowCatalogItems();
    const key = String(node?.key ?? node?.task ?? '').trim();
    const nodeType = node?.node_type || node?.type;
    const nodeName = node?.name;

    if (key) {
      const keyMatch = items.find(item => String(item?.key ?? '').trim() === key);
      if (keyMatch) return keyMatch;
    }

    const typeAndNameMatch = items.find(item =>
      nodeType && nodeName &&
      item?.node_type === nodeType && item?.name === nodeName
    );
    if (typeAndNameMatch) return typeAndNameMatch;

    const nameMatch = items.find(item => nodeName && item?.name === nodeName);
    if (nameMatch) return nameMatch;

    const typeMatches = items.filter(item => nodeType && item?.node_type === nodeType);
    return typeMatches.length === 1 ? typeMatches[0] : undefined;
  }

  private getNodeIconUrl(node: any): string {
    return this.svc.getNewCenterImageUrl(this.getNodeIconPath(node));
  }

  getHtmlForNodes(node: any, nodeId?: number): string {
    const nodeName = this.escapeNodeName(node?.name || node?.node_type || 'Node');
    const isTriggerNode =
      node.node_type === nodeTypes.ManualTrigger ||
      node.node_type === nodeTypes.ScheduleTrigger ||
      node.node_type === nodeTypes.OnChatMessageTrigger ||
      node.node_type === nodeTypes.ItsmTrigger ||
      node.node_type === nodeTypes.WebhookTrigger ||
      node.node_type === nodeTypes.AimlEventTrigger;

    const boxClass =
      node.node_type === nodeTypes.Switch ? 'node-box switch-case' :
        node.node_type === nodeTypes.LLM ? 'node-box llm' :
          node.node_type === nodeTypes.AIAgent ? 'node-box aiagent' :
            node.node_type === nodeTypes.Loop ? 'node-box loop' : 'node-box';

    const iconClass = node.node_type === nodeTypes.LLM ? 'node-center-icon-llm' : 'node-center-icon-ai';
    const statusFa = this.hasRealTimeData ? this.getStatusFaClass(node.status) : '';
    const hasErrors = node.hasErrors;
    const errorTitle = hasErrors ? 'Validation errors' : 'All required fields are filled up!';
    const errorIcon = `<i class="${hasErrors ? 'fas fa-exclamation-triangle text-warning' : ''}" style="font-size:11px;"></i>`;

    const statusHtml = statusFa
      ? `<span class="status-icon mt-1 mr-1" style="float:right;">
       <i class="${statusFa}"></i>
     </span>`
      : '';

    const statusBadge = `
      <div class="node-status-right">
        <span class="node-status" title="${errorTitle}">${errorIcon}</span>
      </div>`;

    if (this.droppedAsTool) {
      const createdNodeId = nodeId;
      setTimeout(() => { this.editor.removeNodeId(`node-${createdNodeId}`); }, 0);
      return '';
    }

    // ─── AI Agent ─────────────────────────────────────────────────────────────
    if (node.node_type === nodeTypes.AIAgent) {
      const modelValue = node?.model?.llm_integ ?? node?.config?.model?.llm_integ ?? '';
      const memoryEnabled = (node?.enable_memory ?? node?.config?.enable_memory) === true;

      return `
        <div class="agentic-custom-node" id="node-${nodeId}">
          <div class="node-actions-agentic"
               onclick="event.stopPropagation();"
               onmousedown="event.stopPropagation();"
               onmouseup="event.stopPropagation();">
            ${!this.isViewMode ? `<i class="fas fa-play action test" title="Test"></i>` : ''}
            <i class="fas fa-pen action edit"    title="Edit"></i>
            <i class="fas fa-trash action delete" title="Delete"></i>
          </div>

          <div class="node-box ainode">

            <!-- Header -->
            <div class="node-header"  style="display: flex; align-items: center; justify-content: center; gap: 0px;">
              <div class="${iconClass}">
                <img src="${this.getNodeIconUrl(node)}" loading="eager"/>
              </div>
              <span class="node-title" title="${nodeName}">${nodeName}</span>
              ${statusHtml}
              ${statusBadge}
            </div>

            <!-- Config Row -->
            <div class="row m-0 p-0">
              <div class="col-8 p-0 pr-1">
                <span class="config-label">Model</span>
                <select class="form-control text-dark model-select"
                    onchange="window.onModelChange(${nodeId}, this)">
                  <option value="">Select Model</option>
                  <option value="UnityOne AI" ${modelValue === 'UnityOne AI' ? 'selected' : ''}>UnityOne AI</option>
                </select>
              </div>

              <div class="col-4 p-0 memory-col d-flex flex-column align-items-center">
                <span class="config-label">Memory</span>
                <img class="memory-icon memory-brain-icon"
                    data-enabled="${memoryEnabled}"
                    onclick="window.toggleMemoryIcon(${nodeId}, this)"
                    src="${environment.assetsUrl}external-brand/workflow/dynamic/Brain.svg"
                    loading="eager"/>
              </div>
            </div>

            <!-- Tools -->
            <div class="tools-container"></div>

            <!-- Drop Zone -->
            <div class="drop-zone"
                id="agent-drop-zone"
                ondragover="event.preventDefault()"
                ondrop="window.handleAgentDrop(event, ${nodeId})">
              <i class="fas fa-plus-circle mr-1" style="font-size:11px;opacity:0.5;"></i>
              Drop tools here
            </div>

          </div>
        </div>`;
    }

    // ─── LLM ──────────────────────────────────────────────────────────────────
    if (node.node_type === nodeTypes.LLM) {
      const modelValue = node?.model?.llm_integ ?? node?.config?.model?.llm_integ ?? '';

      return `
        <div class="agentic-custom-node" id="node-${nodeId}">
          <div class="node-actions-llm"
              onclick="event.stopPropagation();"
              onmousedown="event.stopPropagation();"
              onmouseup="event.stopPropagation();">
            ${!this.isViewMode ? `<i class="fas fa-play action test" title="Test"></i>` : ''}
            <i class="fas fa-pen action edit"     title="Edit"></i>
            <i class="fas fa-trash action delete" title="Delete"></i>
          </div>

          <div class="node-box llm">
            <div class="icon-and-title" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <div class="${iconClass}">
                <img src="${this.getNodeIconUrl(node)}" loading="eager"/>
              </div>
              <span class="node-title" title="${nodeName}">${nodeName}</span>
              ${statusHtml}
              ${statusBadge}
            </div>

            <div class="row m-0 p-0 mt-2">
              <div class="col-12 p-2">
                <span class="config-label">Model</span>
                <select class="form-control text-dark model-select"
                    onchange="window.onModelChange(${nodeId}, this)">
                  <option value="">Select Model</option>
                  <option value="UnityOne AI" ${modelValue === 'UnityOne AI' ? 'selected' : ''}>UnityOne AI</option>
                </select>
              </div>
            </div>
          </div>
        </div>`;
    }

    // ─── All other nodes (Triggers, Switch, Normal) ────────────────────────────
    return `
      <div class="${isTriggerNode ? 'agentic-custom-node type-trigger' : 'agentic-custom-node'}" id="node-${nodeId}">

        <div class="node-actions"
            onclick="event.stopPropagation();"
            onmousedown="event.stopPropagation();"
            onmouseup="event.stopPropagation();">
          ${!this.isViewMode ? `<i class="fas fa-play action test" title="Test"></i>` : ''}
          <i class="fas fa-pen action edit"     title="Edit"></i>
          <i class="fas fa-trash action delete" title="Delete"></i>
        </div>

        <div class="node-wrapper">
          <div class="${boxClass}">
            ${isTriggerNode ? `
              <div class="node-left-icon">
                <img src="${environment.assetsUrl}external-brand/workflow/OrangeTrigger.svg" loading="eager"/>
              </div>` : ''}

            ${statusHtml}
            ${statusBadge}

            <div class="node-center-icon">
              <img src="${this.getNodeIconUrl(node)}" loading="eager" />
            </div>

          </div>
        </div>

        <div class="node-label" title="${nodeName}">${nodeName}</div>
      </div>`;
  }

  getStatusFaClass(status?: string): string {
    switch (status) {
      case 'Success': return 'fas fa-check-circle text-success';
      case 'Failed': return 'fas fa-exclamation-circle text-danger';
      case 'Stopped': return 'fas fa-exclamation-circle text-danger';
      case 'Skipped': return 'fas fa-clock text-warning';
      case 'Queued': return 'fas fa-clock text-muted';
      // case 'Started': return 'fas fa-check-circle text-success';
      case 'Canceled': return 'fas fa-exclamation-circle text-danger';
      case 'Running': return 'fas fa-spinner fa-spin text-primary';
      case 'Started': return 'fas fa-spinner fa-spin text-primary';
      default: return ''; // neutral dot
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'Success': return 'Success';
      case 'Failed': return 'Failed';
      case 'Stopped': return 'Stopped';
      case 'Skipped': return 'Skipped';
      case 'Queued': return 'Queued';
      case 'Canceled': return 'Canceled';
      case 'Running': return 'Running';
      case 'Started': return 'Started';
      default: return '';
    }
  }

  hasRealTimeData(): boolean {
    return !!this.realTimeDetails?.nodes && Object.keys(this.realTimeDetails?.nodes).length > 0;
  }

  handleNodeRemove(nodeId: number) {
    const nodeIndex = this.nodeDetailsArr.findIndex(n => n.node_id === Number(nodeId));
    if (nodeIndex !== -1) {
      this.nodeDetailsArr.splice(nodeIndex, 1);
      this.existingFormData = {};
    }
  }

  getLatestNodeIdForAITools() {
    let ids = [];

    const addToolIds = (tools: any[] = []) => {
      tools.forEach(tool => {
        const rawId = tool?.tool_id ?? tool?.node_id;
        const numericId = Number(String(rawId ?? '').replace(/^tool-/, ''));
        if (Number.isFinite(numericId)) {
          ids.push(numericId);
        }
      });
    };

    this.workFlowData?.nodes?.forEach(node => {
      addToolIds(
        node?.node_meta?.tools ??
        node?.tools ??
        node?.config?.tools ??
        []
      );
    });
    this.toolsArr?.forEach(toolGroup => addToolIds(toolGroup?.data || []));

    const uniqueIds = [...new Set(ids)];

    return uniqueIds.length ? Math.max(...uniqueIds) : 0;
  }

  setNodeDetails(nodeDetails: NodeDetails, nodeId: any) {
    let config: any = {};

    const buildRow = (isTool: boolean = false) => {
      return {
        name: nodeDetails.name,
        [isTool ? 'tool_id' : 'node_id']: isTool ? `tool-${nodeId}` : nodeId,
        node_type: nodeDetails.node_type,
        type_version: 1,
        pos_x: nodeDetails.pos_x,
        pos_y: nodeDetails.pos_y,
        config,
        inputs: [],
        outputs: [],
        endpoint: nodeDetails.endpoint,
        key: nodeDetails.key,
        icon_path: nodeDetails.icon_path,
        formErrors: nodeDetails.formErrors ?? {},
        hasErrors: nodeDetails.hasErrors ?? this.hasAnyErrors(nodeDetails.formErrors),
        ...(isTool ? { isTool: true } : {})
      };
    };

    const row = buildRow();

    if (this.droppedAsTool && this.currentAgentNodeId !== null) {
      // if (!this.isValidTool(nodeDetails)) {
      //   return;
      // }

      const toolRow = buildRow(true);

      const existingToolGroup = this.toolsArr.find(
        item =>
          this.normalizeAgentNodeId(item.aiNodeId) ===
          this.normalizeAgentNodeId(this.currentAgentNodeId)
      );

      if (existingToolGroup) {
        existingToolGroup.data.push(toolRow);
      } else {
        this.toolsArr.push({
          aiNodeId: this.currentAgentNodeId,
          data: [toolRow]
        });
      }

      this.updateAgentTools(
        this.currentAgentNodeId,
        this.getToolsForAgent(this.currentAgentNodeId) || []
      );

      this.droppedAsTool = false;
      this.currentAgentNodeId = null;

    } else {
      this.nodeDetailsArr.push(row);
    }

    console.log('tools arr>>>', this.toolsArr);
    console.log('nodes arr>>>', this.nodeDetailsArr);
  }

  isValidTool(nodeDetails: NodeDetails) {
    if (nodeDetails?.as_tool) {
      return true;
    } else {
      return false;
    }
  }

  private normalizeAgentNodeId(value: any): number {
    return Number(String(value ?? '').replace(/^node-/, ''));
  }

  private normalizeToolId(value: any): string {
    const id = String(value ?? '').replace(/^tool-/, '');
    return id ? `tool-${id}` : '';
  }

  getToolsForAgent(aiNodeId: number) {
    const normalizedAgentId = this.normalizeAgentNodeId(aiNodeId);
    const group = this.toolsArr.find(
      t => this.normalizeAgentNodeId(t.aiNodeId) === normalizedAgentId
    );
    return group?.data?.filter(t => t && (t.tool_id || t.node_id)) || [];
  }


  updateAgentTools(nodeId: number, tools: any[]) {

    const getId = (val: any) =>
      val?.includes?.('-') ? val.split('-')[1] : val;

    const safeTools = (tools || []).filter(t => t && (t?.node_id || t?.tool_id));

    const toolsHTML = safeTools.map(tool => {
      const id = Number(getId(tool?.node_id || tool?.tool_id));

      return `<div class="tool-chip" data-node-id="${id}"  title="${tool?.name}">
            <div class="tool-delete-icon">×</div>
  
            <div class="tool-icon">
              <img src="${this.getNodeIconUrl(tool)}" loading="eager" />
            </div>
  
            <span class="tool-name">${tool.name}</span>
          </div>`;
    }).join('');


    // ${tool?.human_approval ?
    //   '<div class="human-in-loop-icon"> <i class="fas fa-user-check" title="Human in the Loop"></i></div>'
    //   : ''}

    /* ---------- Update Live DOM ---------- */

    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) {
      const toolsContainer = nodeEl.querySelector('.drawflow_content_node .tools-container') as HTMLElement | null;
      if (toolsContainer) {
        toolsContainer.innerHTML = toolsHTML;
      } else {
        console.warn('Tools container not found for node', nodeId);
      }
    }

    /* ---------- Update Stored HTML ---------- */

    const dfNode = this.editor.drawflow.drawflow.Home.data[nodeId];
    const htmlString = String(dfNode?.html || '');

    if (htmlString) {
      const temp = document.createElement('div');
      temp.innerHTML = htmlString.trim();

      const toolsContainer = temp.querySelector('.drawflow_content_node .tools-container') as HTMLElement | null;

      if (toolsContainer) {
        toolsContainer.innerHTML = toolsHTML;
        dfNode.html = temp.innerHTML;
      }
    }

    /* ---------- STEP 3: Attach Double Click Handlers ---------- */

    const toolElements = nodeEl.querySelectorAll('.tool-chip');

    toolElements.forEach((toolEl: HTMLElement) => {

      const toolNodeId = toolEl.getAttribute('data-node-id');

      toolEl.ondblclick = (event: any) => {

        event.stopPropagation();
        const id = `tool-${toolNodeId}`;

        this.getConnectedNodeDetails(id);
        this.openNodeModal(id);

      };

      toolEl.oncontextmenu = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        // remove from all tools
        nodeEl.querySelectorAll('.tool-chip')
          .forEach(el => el.classList.remove('show-delete'));

        // add only to clicked tool
        toolEl.classList.add('show-delete');
      };

      // CLICK DELETE ICON
      const deleteIcon = toolEl.querySelector('.tool-delete-icon');

      deleteIcon?.addEventListener('click', (event: any) => {
        event.stopPropagation();

        const toolId = Number(toolEl.getAttribute('data-node-id'));

        this.removeTool(toolId, nodeId);
      });

    });

    // Tool chips change the AI Agent's height. Recalculate the SVG endpoints
    // after the browser has applied the new layout instead of waiting for a
    // later node move/drag event to correct the connection.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.editor?.updateConnectionNodes(`node-${nodeId}`);
      });
    });
  }

  removeTool(toolId: number, agentNodeId: number) {
    const normalizedAgentId = this.normalizeAgentNodeId(agentNodeId);
    const toolKey = this.normalizeToolId(toolId);

    // Remove tool ONLY from the matching agent group
    this.toolsArr.forEach(group => {

      if (this.normalizeAgentNodeId(group.aiNodeId) !== normalizedAgentId) return;

      group.data = (group.data || []).filter(n =>
        this.normalizeToolId(n.node_id) !== toolKey &&
        this.normalizeToolId(n.tool_id) !== toolKey
      );
    });

    // Update tools for this agent only
    const currentGroup = this.toolsArr.find(
      g => this.normalizeAgentNodeId(g.aiNodeId) === normalizedAgentId
    );
    if (!currentGroup) {
      return;
    }

    this.updateAgentTools(normalizedAgentId, currentGroup.data || []);

    console.log('after removal >>>', this.toolsArr);

    // Remove from nodeDetailsArr ONLY for this agent node
    this.nodeDetailsArr.forEach(node => {

      if (this.normalizeAgentNodeId(node.node_id) !== normalizedAgentId) return;

      if (node?.config?.tools) {
        node.config.tools = node.config.tools.filter(t =>
          this.normalizeToolId(t.node_id) !== toolKey &&
          this.normalizeToolId(t.tool_id) !== toolKey
        );
      }

      if (node?.tools) {
        node.tools = node.tools.filter(t =>
          this.normalizeToolId(t.node_id) !== toolKey &&
          this.normalizeToolId(t.tool_id) !== toolKey
        );
      }

      if (node?.node_meta?.tools) {
        node.node_meta.tools = node.node_meta.tools.filter(t =>
          this.normalizeToolId(t.node_id) !== toolKey &&
          this.normalizeToolId(t.tool_id) !== toolKey
        );
      }
    });
  }

  syncNodeUI(nodeId: number) {
    const root = this.document.getElementById(`node-${nodeId}`);
    if (!root) {
      setTimeout(() => this.syncNodeUI(nodeId), 0);
      return;
    }

    const node = this.nodeDetailsArr.find(n => n.node_id === Number(nodeId));
    const config = node?.config || {};


    if (node?.node_type === nodeTypes.AIAgent) {
      //  MEMORY
      const memoryEl = root.querySelector('.memory-icon') as HTMLImageElement;
      if (memoryEl) {
        const isEnabled = (node?.enable_memory ?? config?.enable_memory) === true;
        node.enable_memory = isEnabled;

        memoryEl.src = `${environment.assetsUrl}external-brand/workflow/dynamic/Brain.svg`;

        memoryEl.setAttribute('data-enabled', isEnabled.toString());
      }

      this.updateAgentTools(nodeId, _clone(this.getToolsForAgent(nodeId)));

    }

    //  MODEL
    const selectEl = root.querySelector('.model-select') as HTMLSelectElement;
    if (selectEl) {
      const modelValue = node?.model?.llm_integ ?? config?.model?.llm_integ ?? '';
      selectEl.value = modelValue;
      node.model = {
        ...node.model,
        llm_integ: modelValue
      };
    }
  }

  getConnectedNodeDetails(nodeId: any) {
    const visited = new Set<number>();
    const connectedNodeIds: number[] = [];

    const getNumericId = (value: any): number =>
      Number(String(value ?? '').replace(/^(?:node|tool)-/, ''));
    const requestedId = getNumericId(nodeId);
    const requestedAsTool = String(nodeId).startsWith('tool-');

    const toolGroup = requestedAsTool
      ? this.toolsArr.find(t =>
        t?.data?.some(n =>
          getNumericId(n?.tool_id ?? n?.node_id) === requestedId
        )
      )
      : undefined;

    // Tools do not have their own canvas connections. Resolve them through
    // their owning AI Agent so both modals receive the same upstream nodes in
    // the left-side context panel.
    const effectiveNodeId = getNumericId(toolGroup?.aiNodeId ?? nodeId);

    // In edit mode Drawflow owns the current graph after import. Keep it as a
    // fallback because connectionList can temporarily contain only the saved
    // API connections while a newly added connection already exists on canvas.
    const editorNodes =
      this.editor?.drawflow?.drawflow?.Home?.data ?? {};
    const editorConnections: any[] = [];

    Object.entries(editorNodes).forEach(([targetId, editorNode]: [string, any]) => {
      Object.values(editorNode?.inputs ?? {}).forEach((input: any) => {
        (input?.connections ?? []).forEach((connection: any) => {
          editorConnections.push({
            output_id: connection?.node,
            input_id: targetId
          });
        });
      });
    });

    const currentConnections = [
      ...(this.connectionList ?? []),
      ...editorConnections
    ];

    const findParents = (currentId: number) => {
      currentConnections
        .filter(conn =>
          getNumericId(conn?.input_id ?? conn?.target_node_id) === currentId
        ) // connections leading into this node
        .forEach(conn => {
          const parentId = getNumericId(conn?.output_id ?? conn?.source_node_id);
          if (!Number.isFinite(parentId)) {
            return;
          }
          if (!visited.has(parentId)) {
            visited.add(parentId);
            connectedNodeIds.push(parentId);
            findParents(parentId); // recurse upward
          }
        });
    };

    findParents(effectiveNodeId);

    console.log('connected realtime>>>>', this.realTimeNodeDetails)

    // map them to nodeDetails
    this.connectedNodeDetails = connectedNodeIds
      .map(id => this.nodeDetailsArr.find(n => getNumericId(n.node_id) === id))
      .filter((n): n is NodeDetailsArrayModel => !!n);

    console.log('[getConnectedNodeDetails]', {
      requestedNodeId: nodeId,
      requestedAsTool,
      effectiveNodeId,
      connectedNodeIds,
      connectedNodes: this.connectedNodeDetails.map(node => ({
        node_id: node.node_id,
        node_type: node.node_type,
        name: node.name
      })),
      connectionList: this.connectionList,
      editorConnections
    });

    // if realTimeNodeDetails has nodes, map output_data into connectedNodeDetails outputs

    this.connectedNodeDetails = this.connectedNodeDetails.map(node => {
      const realTimeNode = this.realTimeNodeDetails?.nodes?.find(
        (rn: any) => getNumericId(rn.node_id) === getNumericId(node.node_id)
      );

      return realTimeNode?.output_data !== undefined
        ? { ...node, output_data: realTimeNode.output_data }
        : node;
    });
  }

  openNodeModal(nodeId: any, modalName?: string) {
    const requestedAsTool = this.droppedAsTool || String(nodeId).startsWith('tool-');
    const numericNodeId = requestedAsTool
      ? Number(String(nodeId).replace('tool-', ''))
      : nodeId;
    const triggerNodes = [
      'Manual Trigger',
      'Schedule Trigger',
      'Chat Trigger',
      'Webhook Trigger',
      'ITSM Event Trigger',
      'AIML Event Trigger'
    ];

    console.log('tools>>>', this.toolsArr, nodeId);

    this.selectedNode = this.getSelectedNode(
      requestedAsTool ? this.normalizeToolId(numericNodeId) : numericNodeId
    );
    const isTool = requestedAsTool || !!this.selectedNode?.tool_id || this.selectedNode?.isTool === true;
    const configurationEndpoint = this.getNodeConfigurationEndpoint(this.selectedNode);
    const isSchemaLoading = !!configurationEndpoint && !this.selectedNode?.config?.tabs?.length;

    if (isSchemaLoading) {
      this.selectedNode.endpoint = configurationEndpoint;
      this.loadNodeConfiguration(this.selectedNode, numericNodeId, false, isTool);
    } else if (isTool && !this.selectedNode?.config?.tabs?.length) {
      this.notification.error(
        new Notification(`Failed to load ${this.selectedNode?.name || 'tool'} configuration`)
      );
      return;
    }

    const currentNodeInitialValues = this.getNodeInitialValues(this.selectedNode);
    console.log('>>>>', this.selectedNode);

    if (this.modalService.getModalsCount() > 0) {
      return;
    }

    this.modalRef = this.modalService.show(
      WfDynamicParamsComponent,
      {
        class: 'custom-dynamic-agentic-modal-lg',
        backdrop: true,
        ignoreBackdropClick: true,
        keyboard: false,
        initialState: {
          nodeData: this.selectedNode || {},
          realTimeData: this.realTimeNodeDetails
            ? this.realTimeNodeDetails.nodes.find(n => n.node_id === numericNodeId)
            : {},
          connectedNodes: _clone(this.connectedNodeDetails),
          modalName: modalName,
          workflowId: this.workFlowId,
          isViewMode: this.isViewMode,
          workflowVarsData: this.workflowVarsData,
          initialValues: currentNodeInitialValues,
          isSchemaLoading,
          onSave: (formDatas: any, modalState: any) => {
            console.log('formDatas>>', formDatas);
            console.log(modalState, "modalState")
            console.log('[onSave] fired', { numericNodeId, isTool, modalState });

            if (!modalState.success) return;

            this.tabbedFormData = formDatas;
            const currentExistingFormData = Object.values(formDatas).reduce(
              (acc: any, tabData: any) => ({ ...acc, ...tabData }),
              {}
            );

            this.tabbedFormData = formDatas;

            // this.rightExecuteData = this.prepareRightExecuteData(
            //   this.selectedNode,
            //   currentExistingFormData
            // );

            // console.log(
            //   'RIGHT EXECUTE DATA',
            //   this.rightExecuteData
            // );
            console.log(this.selectedNode, "selected node")

            if (triggerNodes.includes(this.selectedNode.node_type)) {
              this.rightExecuteData = this.prepareRightExecuteData(
                this.selectedNode,
                currentExistingFormData
              );

              console.log('RIGHT EXECUTE DATA', this.rightExecuteData);
            }

            if (!isTool && this.selectedNode?.node_type === nodeTypes.Switch) {
              this.updateNodeOutputs(numericNodeId, currentExistingFormData);
            }

            if (!isTool) {
              this.updateNodeName(modalState.updateNodeName, numericNodeId);
            }
            const nodeFormErrors = { ...(modalState.errors ?? {}) };

            if (
              (this.selectedNode?.node_type === nodeTypes.AIAgent || this.selectedNode?.node_type === nodeTypes.LLM) &&
              !this.selectedNode?.model?.llm_integ
            ) {
              nodeFormErrors.model = 'Model is required';
            } else {
              delete nodeFormErrors.model;
            }
            const hasErrors = this.hasAnyErrors(nodeFormErrors);
            const tooltip = this.buildErrorTooltip(nodeFormErrors);

            if (isTool) {
              const toolKey = this.normalizeToolId(numericNodeId);
              this.toolsArr = this.toolsArr.map(group => ({
                ...group,
                data: group.data.map(tool =>
                  this.normalizeToolId(tool?.tool_id ?? tool?.node_id) === toolKey
                    ? {
                      ...tool,
                      formData: _clone(formDatas),
                      formErrors: nodeFormErrors,
                      hasErrors,
                      name: modalState.updateNodeName ?? tool.name,
                    }
                    : tool
                ),
              }));
              this.syncAgentToolsToNodes();
              const ownerGroup = this.toolsArr.find(group =>
                group?.data?.some(tool =>
                  this.normalizeToolId(tool?.tool_id ?? tool?.node_id) === toolKey
                )
              );
              if (ownerGroup) {
                this.updateAgentTools(
                  this.normalizeAgentNodeId(ownerGroup.aiNodeId),
                  ownerGroup.data
                );
              }
            } else {
              this.nodeDetailsArr = this.nodeDetailsArr.map(node =>
                node.node_id === numericNodeId
                  ? {
                    ...node,
                    outputs: [],
                    inputs: [],
                    name: modalState.updateNodeName ?? node.name,
                    formData: _clone(formDatas),
                    formErrors: nodeFormErrors,
                    hasErrors,
                  }
                  : node
              );

              this.updateNodeStatusIcon(
                numericNodeId,
                hasErrors,
                hasErrors ? tooltip : 'All required fields are filled up!'
              );
            }

            console.log('tools ->', this.toolsArr);
            console.log('nodes ->', this.nodeDetailsArr);

            this.droppedAsTool = false;
            this.currentAgentNodeId = null;
            console.log(modalState, "modalState")
            if (modalState?.action === 'test') {
              if (hasErrors) {
                this.notification.error(
                  new Notification('This node has validation errors. Please fix them before running.')
                );
                return;
              }
              const clickedNode = this.nodeDetailsArr.find(n => n.node_id === nodeId);
              this.handleNodeExecution(clickedNode);
            }
          }
        }
      }
    );
  }

  private getNodeConfigurationEndpoint(node: any): string {
    const matchingItem = this.findWorkflowCatalogItem(node);

    // Catalog endpoints take precedence because migrated workflows may contain
    // a legacy or incorrectly classified endpoint.
    return matchingItem?.endpoint || node?.endpoint || '';
  }

  private getNodeInitialValues(node: any): any {
    const formData = _clone(node?.formData) || {};
    const config = _clone(node?.config) || {};

    const source =
      formData?.properties || formData?.settings
        ? formData
        : config?.properties || config?.settings
          ? config
          : config?.config?.properties || config?.config?.settings
            ? config.config
            : {};

    const tabValues = Object.values(source).reduce<Record<string, any>>(
      (values: Record<string, any>, tabData: any) =>
        tabData && typeof tabData === 'object' && !Array.isArray(tabData)
          ? { ...values, ...tabData }
          : values,
      {}
    );

    // Older saved tools keep approval settings outside the tabbed form config.
    // Use them as fallbacks, while allowing newer tabbed form data to win.
    const legacyApprovalValues = {
      ...(node?.human_approval !== undefined
        ? { human_approval: node.human_approval }
        : {}),
      ...(node?.mode !== undefined ? { approval_mode: node.mode } : {}),
      ...(node?.channels !== undefined ? { channels: node.channels } : {}),
      ...(node?.approver_groups !== undefined
        ? { approver_groups: node.approver_groups }
        : {}),
      ...(node?.approver_users !== undefined
        ? { approver_users: node.approver_users }
        : {}),
      ...(node?.timeout !== undefined
        ? { approval_timeout: node.timeout }
        : {})
    };

    return {
      ...legacyApprovalValues,
      ...tabValues
    };
  }

  getSelectedNode(nodeId: number | string): any {
    const requestedAsTool = String(nodeId).startsWith('tool-');
    const toolKey = this.normalizeToolId(nodeId);
    const toolNode = this.toolsArr
      .flatMap(t => t?.data || [])
      .find(n => this.normalizeToolId(n?.tool_id ?? n?.node_id) === toolKey);
    const workflowNode = this.nodeDetailsArr.find(
      n => Number(n.node_id) === Number(nodeId)
    );

    return requestedAsTool ? toolNode : workflowNode;
  }

  updateNodeOutputs(nodeId: number, formValue: any): void {
    const currentNode = this.editor.getNodeFromId(nodeId);
    const currentOutputCount = Object.keys(currentNode.outputs).length;

    const requiredOutputCount = formValue?.conditions?.length ?? 0;

    if (requiredOutputCount > currentOutputCount) {
      for (let i = 0; i < requiredOutputCount - currentOutputCount; i++) {
        this.editor.addNodeOutput(nodeId);
      }
    } else if (requiredOutputCount < currentOutputCount) {
      const outputKeys = Object.keys(currentNode.outputs);
      for (let i = currentOutputCount - 1; i >= requiredOutputCount; i--) {
        this.editor.removeNodeOutput(nodeId, outputKeys[i]);
      }
    }

    this.adjustNodeOutputs(nodeId);
  }

  updateNodeName(updatedNodeName, nodeId) {
    const currentName = updatedNodeName;
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
      const headerElement = nodeElement.querySelector('.node-label, .node-title') as HTMLElement;
      // const currentData = this.editor.getNodeFromId(nodeId).data;
      const nodeData = this.editor.drawflow.drawflow.Home.data[nodeId];

      nodeData.name = currentName;

      const updatedTask = {
        type: this.selectedNode.node_type,
        name: currentName,
        image: this.getNodeIconUrl(this.selectedNode),
        uuid: this.selectedNode.uuid,
        playbook: this.selectedNode.type,
        pos_x: this.selectedNode.pos_x,
        pos_y: this.selectedNode.pos_y,
      };

      this.editor.updateNodeDataFromId(nodeId, {
        label: updatedTask,
        uniqueNodeId: nodeId
      });

      if (headerElement) {
        headerElement.innerText = currentName;
        headerElement.title = currentName;
        const htmlString = this.editor.drawflow.drawflow.Home.data[nodeId].html as string;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString.trim();
        const headerEl = tempDiv.querySelector('.node-label, .node-title') as HTMLElement;
        if (headerEl) {
          headerEl.innerText = currentName;
          headerEl.title = currentName;
        }
        this.editor.drawflow.drawflow.Home.data[nodeId].html = tempDiv.innerHTML;
      }
    }
  }

  syncAgentToolsToNodes() {
    this.nodeDetailsArr = this.nodeDetailsArr.map(node => {

      if (node?.node_type !== nodeTypes.AIAgent) return node;

      const group = this.toolsArr.find(
        t => this.normalizeAgentNodeId(t.aiNodeId) === this.normalizeAgentNodeId(node.node_id)
      );

      return {
        ...node,
        config: {
          ...node.config,
        },
        tools: (group?.data || []).map(tool =>
          this.getToolsConfig({ ...tool }) // clone to avoid ref issues
        )
      };
    });
  }


  getToolsConfig(tool) {
    return {
      tool_id: tool?.tool_id,
      name: tool?.name,
      node_type: tool?.node_type,
      inputs: [],
      config: {
        ...tool.formData
      }
    };
  }

  prepareTransformConfig(propertyForm) {
    const form = propertyForm;

    const config: any = {
      input: form.input,
      operation: form.operation
    };

    switch (form.operation) {
      case 'SELECT_FIELDS':
      case 'DROP_FIELDS':
      case 'RENAME_FIELDS':
      case 'ADD_FIELDS':
        config.fields = form.fields;
        break;

      case 'FILTER_ITEMS':
        config.field = form.field;
        config.operator = form.operator;
        config.value = form.value;
        break;

      case 'SORT_ITEMS':
        config.field = form.field;
        config.order = form.order;
        break;

      case 'SLICE_ITEMS':
        config.limit = form.limit;
        config.offset = form.offset;
        break;
    }

    return config;
  }

  adjustNodeOutputs(nodeId: number) {
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (!nodeEl) return;

    const outputs: NodeListOf<HTMLElement> = nodeEl.querySelectorAll('.output');
    const total = outputs.length;

    outputs.forEach((output: HTMLElement, index: number) => {
      const spacing = 70 / (total + 1);  // divide height evenly
      this.renderer.setStyle(output, 'top', `${spacing * (index + 1)}%`);
      this.renderer.setStyle(output, 'right', '-6px');
      this.renderer.setStyle(output, 'transform', 'translateY(-50%)');
    });
  }

  adjustNodeInputs(nodeId: number) {
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (!nodeEl) return;

    const inputs: NodeListOf<HTMLElement> = nodeEl.querySelectorAll('.input');
    const total = inputs.length;
    const spacing = 70 / (total + 1);

    inputs.forEach((input: HTMLElement, index: number) => {
      const hasInput1 = input.classList.contains('input_1');

      this.renderer.setStyle(input, 'top', `${spacing * (index + 1)}%`);
      this.renderer.setStyle(input, 'right', '-6px');
      this.renderer.setStyle(
        input,
        'transform',
        hasInput1 ? 'translateY(-50%)' : 'translateY(55%)'
      );
    });
  }

  handleNodeExecution(clickedNode: any) {
    if (!clickedNode) return;
    if (this.hasNodeOrAgentToolErrors(clickedNode)) {
      this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
      return;
    }

    this.executionMode = 'run_node';
    this.runNodeID = true;
    this.clickedNodeId = clickedNode.node_id;

    const triggerNode = this.getTriggerNode();
    const triggerStatus = this.getTriggerExecutionStatus();
    // const isConnected = this.isTriggerConnectedToNode(clickedNode.node_id);

    if (this.svc.isTriggerNode(clickedNode.node_type)) {
      this.triggerNode = clickedNode;
      this.openExecutionPanel();
      return;
    }
    if (triggerNode && (!triggerStatus || triggerStatus === 'Failed')) {
      this.triggerNode = triggerNode;
      this.openExecutionPanel();
      return;
    }

    this.pollForRealTimeExecution();
  }

  get erroredNodesCount(): number {
    const nodeErrors = this.nodeDetailsArr?.filter(n => this.hasAnyErrors(n?.formErrors))?.length ?? 0;
    const toolErrors = this.toolsArr?.reduce(
      (count, group) => count + (group?.data?.filter(t => this.hasAnyErrors(t?.formErrors))?.length ?? 0),
      0
    ) ?? 0;
    return nodeErrors + toolErrors;
  }
  get erroredNodesTooltip(): string {
    const n = this.erroredNodesCount;
    return n === 1 ? '1 node has errors' : `${n} nodes have errors`;
  }

  generateUUID(): string {
    if (crypto && 'randomUUID' in crypto) {
      return (crypto as any).randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  run() {
    const hasErrors = this.nodeDetailsArr?.some(node => this.hasAnyErrors(node.formErrors)) ?? false;
    const hasToolErrors = this.toolsArr?.some(group =>
      group?.data?.some(tool => tool?.hasErrors === true || this.hasAnyErrors(tool?.formErrors))
    ) ?? false;
    console.log(hasErrors || hasToolErrors, "has Errors")
    if (hasErrors || hasToolErrors) {
      this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
      return;
    }
    this.executionMode = 'from_start';
    this.workflowStatus = '';
    this.isRunning = false;
    this.resumeBtn = false;
    this.showRunHeading = true;   // fresh panel open -> show heading, not status
    this.triggerNode = this.nodeDetailsArr.find(n => this.svc.isTriggerNode(n.node_type));
    this.openExecutionPanel();
  }

  viewExecution() {
    this.showRunHeading = false;  // we're viewing status/result, not a fresh run form
    this.triggerNode = this.nodeDetailsArr.find(n => this.svc.isTriggerNode(n.node_type));
    this.openExecutionPanel(); // reuse the same panel-opening/state-prep logic as run()
  }

  onResume() {
    const hasErrors = this.nodeDetailsArr?.some(node => this.hasAnyErrors(node.formErrors)) ?? false;
    const hasToolErrors = this.toolsArr?.some(group =>
      group?.data?.some(tool => tool?.hasErrors === true || this.hasAnyErrors(tool?.formErrors))
    ) ?? false;
    if (hasErrors || hasToolErrors) {
      this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
      return;
    }
    if (!this.currentSessionId) {
      this.notification.error(new Notification('No previous execution found to resume'));
      return;
    }
    this.executionMode = 'resume';
    const triggerExec = this.realTimeDetails?.nodes?.find(n => this.svc.isTriggerNode(n.node_type));
    if (triggerExec?.status === 'Failed') {
      this.triggerNode = this.nodeDetailsArr.find(n => n.node_id === triggerExec.node_id);
      this.showRunHeading = true;      // needs trigger data again -> show heading
      this.openExecutionPanel();
      return;
    }
    this.pollForRealTimeExecution();   // no trigger update needed -> straight to running state
  }

  stopPolling() {
    this.ngUnsubscribe.next();
    this.isWorkflowExecuting = false;
    this.showBeginner = false;
    this.workflowStatus = 'Stopped';
  }

  stop(): void {
    this.ngUnsubscribe.next();
    this.isWorkflowExecuting = false;
    this.setExecutionState('Stopped');
  }

  // Single place all execution-state transitions go through
  setExecutionState(status: string): void {
    const normalized = (status || '').toLowerCase();
    this.workflowStatus = status;

    switch (normalized) {
      case 'running':
      case 'started':
        this.isRunning = true;
        this.resumeBtn = false;
        this.showRunHeading = false;
        break;
      case 'failed':
      case 'stopped':
        this.isRunning = false;
        this.resumeBtn = true;
        this.showRunHeading = false;
        break;
      case 'success':
        this.isRunning = false;
        this.resumeBtn = false;
        this.showRunHeading = false;
        break;
      default:
        // unknown/empty status - don't clobber existing flags
        break;
    }
  }

  pollForRealTimeExecution() {
    this.isWorkflowExecuting = true;
    this.setExecutionState('Started');
    this.pollingUnsubscribe$ = new Subject<void>();

    const sessionId = this.currentSessionId || this.generateUUID();
    let finalPayload = this.buildDynamicRealTimePayload(this.nodeDetailsArr, this.mapConnectionsForApi(this.connectionList), sessionId);
    this.currentSessionId = sessionId;
    console.log(this.currentSessionId, "current Session Id")
    this.svc.postRealTimeWorkflow(finalPayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.currentSessionId = res.session_id || sessionId;
      this.callPollingApi(this.currentSessionId);
    }, error => {
      this.isWorkflowExecuting = false;
      this.setExecutionState('Failed');
      this.notification.error(new Notification('Failed to start execution.'));
      this.chatbotRef?.handleExecutionStartFailure();
    });
  }

  buildDynamicRealTimePayload(nodeDetailsArr: any[], connections: any[], uuid: string) {
    this.nodeDetailsArr.forEach(node => {
      const drawflowNode = this.editor.getNodeFromId(node.node_id);
      node.pos_x = drawflowNode.pos_x;
      node.pos_y = drawflowNode.pos_y;
    });

    const isChatTrigger = nodeDetailsArr.some(
      node => node.node_type === nodeTypes.OnChatMessageTrigger
    );

    return {
      nodes: nodeDetailsArr.map(node => {
        const baseNode = {
          name: node.name,
          node_id: node.node_id,
          node_type: node.node_type,
          type_version: 1,
          pos_x: node?.pos_x,
          pos_y: node?.pos_y,
          config: this.getFinalNodeConfig(node),
          inputs: [],
          outputs: [],
          endpoint: node.endpoint,
          key: node.key,
          icon_path: this.getNodeIconPath(node)
        };

        if (node.node_type === nodeTypes.AIAgent) {
          const matchedGroup = this.toolsArr.find(
            group => this.normalizeAgentNodeId(group.aiNodeId) === this.normalizeAgentNodeId(node.node_id)
          );
          return {
            ...baseNode,
            node_meta: {
              tools: matchedGroup
                ? matchedGroup.data.map(tool => ({
                  tool_id: tool.tool_id ?? tool.node_id,
                  name: tool.name,
                  node_type: tool.node_type,
                  key: tool?.key,
                  endpoint: this.getNodeConfigurationEndpoint(tool),
                  icon_path: this.getNodeIconPath(tool),
                  config: _clone(tool.formData ?? tool.config ?? {}),
                }))
                : [],
              model: node.model || {},
              enable_memory: node.enable_memory ?? false,
            }
          };
        }

        if (node.node_type === nodeTypes.LLM) {
          return {
            ...baseNode,
            node_meta: {
              model: node.model || {},
            }
          }
        }

        return baseNode;
      }),

      connections: connections.map(conn => ({
        source_node_id: conn.source_node_id,
        source_output: conn.source_output,
        target_node_id: conn.target_node_id,
        target_input: conn.target_input
      })),

      mode: this.executionMode,
      variables: [],
      ...(this.runNodeID && { run_node_id: Number(this.clickedNodeId) }),
      session_id: uuid,
      ...this.triggerData,
      ...(isChatTrigger && {
        inputs: {
          ...(this.triggerData?.inputs ?? {}),
          session_id: uuid
        }
      }),
      name: this.wfName,
      ...this.workflowVarsData,
      description: "Description"
    };
  }

  callPollingApi(uuid) {
    const getId = (val: any) =>
      val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);

    this.currentSessionId = uuid || this.currentSessionId;
    console.log(this.currentSessionId, "current session id")

    this.svc.pollRealTimeWorkflow(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      console.log(data, "data")
      if (data) {
        const chatUpdate: OnChatExecution = {
          status: data.status === 'Running' ? 'Running' : data.status,
          chat_response: data?.chat_response ?? ''
        };
        this.chatUpdates$.next(chatUpdate);

        // Single source of truth for isRunning / resumeBtn / showRunHeading / workflowStatus
        this.setExecutionState(data?.status);

        if (data?.status === 'Success' || data?.status === 'Failed') {
          this.isWorkflowExecuting = false;
          this.getWorkflowExecutionLogs();
        } else {
          this.showExecutionLogsFlag = false;
        }

        this.realTimeDetails = _clone(data);
        const executionNodes = this.realTimeDetails?.nodes ?? [];
        const finalNodes = this.nodeDetailsArr.map(n => {
          const executionNode = executionNodes.find(
            node => Number(node.node_id) === Number(n.node_id)
          );

          if (!executionNode) {
            return { ...n };
          }

          return {
            ...n,
            status: executionNode.status,
            duration: this.svc.formatDuration(executionNode.duration),
            output_data: { ...executionNode.output }
          };
        });

        this.realTimeNodeDetails = {
          connections: this.mapConnectionsForApi(this.connectionList),
          nodes: [...finalNodes]
        };

        console.log('realTime>>>', ...finalNodes);
        const drawflowData = this.generateDrawflowStructureEdit(this.realTimeNodeDetails);

        if (this.editor) {
          this.waitForEditorAndImport(drawflowData);

          this.editor.on('import', () => {
            const getId = (val: any) =>
              val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);

            finalNodes.forEach(n => {
              this.syncNodeUI(getId(n?.node_id));
            });
          });
        }

        // Stop polling once we hit a terminal state, using a dedicated subject
        // so this doesn't interfere with the ngUnsubscribe used by the Stop button.
        if (data?.status === 'Success' || data?.status === 'Failed') {
          this.pollingUnsubscribe$.next();
        }
      }
    }, (error) => {
      this.isWorkflowExecuting = false;
      this.setExecutionState('Failed');
      this.notification.error(
        new Notification('Failed to Execute. Please try again.')
      );
    });
  }

  getTriggerNode() {
    return this.nodeDetailsArr.find(n =>
      this.svc.isTriggerNode(n.node_type)
    );
  }

  isTriggerConnectedToNode(clickedNodeId: number): boolean {
    const trigger = this.getTriggerNode();
    if (!trigger) return false;

    return this.connectionList.some(conn =>
      Number(conn.output_id) === Number(trigger.node_id) &&
      Number(conn.input_id) === Number(clickedNodeId)
    );
  }


  getTriggerExecutionStatus(): string | null {
    const trigger = this.getTriggerNode();
    if (!trigger || !this.realTimeNodeDetails?.nodes) return null;

    const executedTrigger = this.realTimeNodeDetails.nodes.find(
      n => n.node_id === trigger.node_id
    );

    return executedTrigger?.status || null;
  }


  getWorkflowExecutionLogs() {
    if (!this.currentSessionId || this.isLoadingExecutionLogs) {
      return;
    }

    this.isLoadingExecutionLogs = true;
    this.svc.getExecutionLogs(this.currentSessionId).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.isLoadingExecutionLogs = false;
        this.spinner.stop('main');
      })
    ).subscribe((data: any) => {
      this.workflowLogsViewData = this.svc.convertToExecutionLogViewData(data);
      this.showExecutionLogsFlag = true;
      if (this.isBottomCollapsed) {
        this.bottomHeight = this.previousBottomHeight || 250;
      }
      this.isBottomCollapsed = false;
      if (this.workflowLogsViewData?.executionLog?.trim()) {
        this.bottomActiveTab = 'logs';
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get execution logs for this workflow'));
    });
  }

  mapConnectionsForApi(connectionList: any[]) {
    return connectionList.map(conn => ({
      source_node_id: Number(conn.output_id),   // Drawflow output node ID
      source_output: conn.output_class,         // output slot
      target_node_id: Number(conn.input_id),    // Drawflow input node ID
      target_input: conn.input_class            // input slot
    }));
  }

  mapConnectionsForEditApi(connectionList: any[]) {
    return connectionList.map(conn => ({
      output_id: String(conn.source_node_id),   // Drawflow output node ID
      output_class: conn.source_output,         // output slot
      input_id: Number(conn.target_node_id),    // Drawflow input node ID
      input_class: conn.target_input,            // input slot
      connector_shape: 'rounded' as ConnectorShape
    }));
  }

  private syncCanvasLayoutForSave(): void {
    const drawflowNodes = this.editor?.drawflow?.drawflow?.Home?.data || {};
    const savedShapes = new Map<string, ConnectorShape>();
    const connectionKey = (
      outputId: any,
      outputClass: string,
      inputId: any,
      inputClass: string
    ): string => `${Number(outputId)}:${outputClass}:${Number(inputId)}:${inputClass}`;

    this.connectionList.forEach(connection => {
      savedShapes.set(
        connectionKey(
          connection.output_id,
          connection.output_class,
          connection.input_id,
          connection.input_class
        ),
        this.normalizeConnectorShape(connection.connector_shape)
      );
    });

    const canvasConnections: any[] = [];
    Object.keys(drawflowNodes).forEach(nodeId => {
      const drawflowNode = drawflowNodes[nodeId];
      const node = this.nodeDetailsArr.find(
        item => Number(item.node_id) === Number(nodeId)
      );
      if (node) {
        node.pos_x = drawflowNode.pos_x;
        node.pos_y = drawflowNode.pos_y;
      }

      const realTimeNode = this.realTimeNodeDetails?.nodes?.find(
        item => Number(item.node_id) === Number(nodeId)
      );
      if (realTimeNode) {
        realTimeNode.pos_x = drawflowNode.pos_x;
        realTimeNode.pos_y = drawflowNode.pos_y;
      }

      Object.entries(drawflowNode.outputs || {}).forEach(
        ([outputClass, output]: [string, any]) => {
          (output?.connections || []).forEach(connection => {
            const inputClass = connection.output;
            const key = connectionKey(
              nodeId,
              outputClass,
              connection.node,
              inputClass
            );
            canvasConnections.push({
              output_id: String(nodeId),
              output_class: outputClass,
              input_id: Number(connection.node),
              input_class: inputClass,
              connector_shape: savedShapes.get(key) || 'rounded'
            });
          });
        }
      );
    });

    this.connectionList = canvasConnections;
  }

  getFormattedTaskListEdit(workflowData): any[] {
    this.formattedTask = workflowData.nodes.map(node => {
      return {
        id: node.node_id,
        name: node.name,
        type: node.node_type,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
        node_id: node.node_id,
        key: node.key,
        icon_path: node.icon_path,
        endpoint: node.endpoint,
        uuid: node.uuid,
        status: node?.status,
        duration: node?.duration,
        config: node?.config,
        model: node?.model,
        enable_memory: node?.enable_memory,
        outputs: [], // will be populated later
        data: {
          uniqueNodeId: node.node_id,
          label: {
            type: node.node_type,
            name: node.name,
            image: this.getNodeIconUrl(node),
            uuid: node.uuid,
            nodeType: node.node_type,
            pos_x: node.pos_x,
            pos_y: node.pos_y,
          }
        },
      };
    });

    return this.formattedTask;
  }

  generateDrawflowStructureEdit(workflowData): any {
    const connections = workflowData.connections;
    const nodes = this.getFormattedTaskListEdit(workflowData);
    const nodeMap = new Map<number, DrawflowNode>();

    nodes.forEach(node => {
      const outputs: any = {};
      const inputs: any = {};

      // Always add a default output_1
      if (node.type === 'If Else') {
        outputs['output_1'] = { connections: [] };
        outputs['output_2'] = { connections: [] };
      } else {
        outputs['output_1'] = { connections: [] };
      }

      inputs['input_1'] = { connections: [] };

      // Attach actual outputs from connections
      connections
        .filter(c => Number(c.source_node_id) === Number(node.node_id))
        .forEach(c => {
          if (!outputs[c.source_output]) {
            outputs[c.source_output] = { connections: [] };
          }
          outputs[c.source_output].connections.push({
            node: `${c.target_node_id}`,
            output: c.target_input
          });
        });

      // Build inputs from connections
      connections
        .filter(c => Number(c.target_node_id) === Number(node.node_id))
        .forEach(c => {
          if (!inputs[c.target_input]) {
            inputs[c.target_input] = { connections: [] };
          }
          inputs[c.target_input].connections.push({
            node: `${c.source_node_id}`,
            input: c.source_output
          });
        });

      console.log(node.pos_x, node.pos_y)

      const nodeForHTML = {
        ...node,
        node_type: node?.node_type ?? node?.type
      }

      // 4️⃣ Build Drawflow node
      const drawflowNode: DrawflowNode = {
        id: node.node_id,
        name: node.name,
        inputs,
        outputs,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
        html: this.getHtmlForNodes(nodeForHTML, node.node_id),
        typenode: false,
        class: 'agentic-default-node',
        data: {
          uniqueNodeId: node.node_id,
          label: {
            type: node.type,
            name: node.name,
            image: this.getNodeIconUrl(node),
            uuid: node.uuid,
            nodeType: node.nodeType,
          }
        }
      };

      nodeMap.set(node.node_id, drawflowNode);
    });

    return {
      drawflow: {
        Home: {
          data: Object.fromEntries([...nodeMap.entries()])
        }
      }
    };
  }

  waitForEditorAndImport(drawflowData: any, fitAfterImport: boolean = false) {
    const container = this.drawflowContainer?.nativeElement;
    console.log(container, "container")

    const tryImport = () => {
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        try {
          this.editor.clear();
          this.editor.on('import', () => {
            Object.keys(drawflowData.drawflow.Home.data).forEach(nodeId => {
              this.adjustNodeOutputs(Number(nodeId));
              this.editor.updateConnectionNodes(`node-${Number(nodeId)}`);
            });
          });
          this.editor.import(drawflowData);
          const importedNodeIds = Object.keys(drawflowData.drawflow.Home.data);
          importedNodeIds.forEach(id => {
            const nodeEl = document.getElementById(`node-${id}`);
            if (nodeEl) {
              nodeEl.addEventListener('dblclick', () => {
                this.selectedNode = this.getSelectedNode(id);
                this.getConnectedNodeDetails(Number(id));
                this.openNodeModal(Number(id));
              });
            }

            // Add edit button click
            const editBtn = nodeEl.querySelector('.action.edit');
            if (editBtn) {
              editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.selectedNode = this.getSelectedNode(id);
                this.getConnectedNodeDetails(Number(id));
                this.openNodeModal(Number(id));
              });
            }

            // Add delete button click
            const deleteBtn = nodeEl.querySelector('.action.delete');
            if (deleteBtn) {
              deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.editor.removeNodeId(`node-${id}`);
                this.updateHasNode();
              });
            }

            const testBtn = nodeEl.querySelector('.action.test');
            if (testBtn) {
              testBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.executionMode = 'run_node';
                this.runNodeID = true;
                const nodeId = nodeEl.id;
                const clickedNode = this.nodeDetailsArr.find(n => `node-${n.node_id}` === nodeId);
                if (!clickedNode) return;
                this.clickedNodeId = clickedNode.node_id;
                const hasErrors = this.hasNodeOrAgentToolErrors(clickedNode);

                if (hasErrors) {
                  this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
                  return;
                }
                const triggerNode = this.getTriggerNode();
                const triggerStatus = this.getTriggerExecutionStatus();
                const isConnected = this.isTriggerConnectedToNode(clickedNode.node_id);
                if (this.svc.isTriggerNode(clickedNode.node_type)) {
                  this.triggerNode = clickedNode;
                  this.openExecutionPanel();
                  return;
                }
                if (triggerNode && isConnected && (!triggerStatus || triggerStatus === 'Failed')) {
                  this.triggerNode = triggerNode;
                  this.openExecutionPanel();
                  return;
                }
                this.pollForRealTimeExecution();
              });
            }
          });

          if (fitAfterImport) {
            // Drawflow does not persist its canvas translation or zoom. Dagre
            // layouts start close to the canvas origin, so restoring only the
            // saved node coordinates otherwise places the workflow at the
            // upper-left. Drawflow creates the imported elements synchronously,
            // so fit in this frame before the browser can paint that transient
            // position. Reading offset sizes in the fit method ensures layout
            // is calculated without exposing an intermediate canvas state.
            this.fitWorkflowToViewport(importedNodeIds);
          }
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

  mapToolToNode(tool) {
    const legacyConfig = {
      task: tool?.task || '',
      target_type: tool?.target_type || '',
      target: tool?.target || '',
      credential: tool?.credential || '',
      cloud_type: tool?.cloud_type || '',
    };
    const savedConfig = tool?.config ?? tool?.formData;
    const config = _clone(savedConfig ?? legacyConfig);
    const toolId = tool?.tool_id ?? tool?.['tool-id'] ?? tool?.node_id;
    const key = tool?.key ?? tool?.task;
    const legacyNodeType = tool?.node_type ?? tool?.type;
    const orchestrationTaskTypes = new Set([
      nodeTypes.AnsibleBook,
      nodeTypes.TerraformScript,
      nodeTypes.PythonScript,
      nodeTypes.BashScript,
      nodeTypes.PowershellScript,
      nodeTypes.RestApi
    ]);
    const nodeType = orchestrationTaskTypes.has(legacyNodeType)
      ? nodeTypes.OrchestrationTask
      : legacyNodeType;
    const approvalForm = config?.human_approval || {};

    return {
      name: tool.name,
      node_id: toolId,
      tool_id: toolId,
      node_type: nodeType,
      key,
      endpoint: tool?.endpoint,
      icon_path: tool?.icon_path,
      config: _clone(config),
      formData: _clone(config),

      inputs: tool.inputs || [],
      outputs: [],

      isTool: true,

      // keep approval OUTSIDE config
      human_approval: tool.human_approval ?? approvalForm.human_approval ?? false,
      mode: tool.approval_config?.mode ?? approvalForm.approval_mode,
      channels: tool.approval_config?.channels ?? approvalForm.channels ?? [],
      approver_groups: tool.approval_config?.approver_groups ?? approvalForm.approver_groups ?? [],
      approver_users: tool.approval_config?.approver_users ?? approvalForm.approver_users ?? [],
      timeout: tool.approval_config?.timeout ?? approvalForm.approval_timeout,
      description: tool?.description
    };
  }

  private normalizeNodeForEdit(node: any): any {
    const normalizedNode = _clone(node);
    const nodeMeta = normalizedNode?.node_meta || {};

    if (normalizedNode?.node_type === nodeTypes.AIAgent) {
      normalizedNode.model = _clone(
        nodeMeta?.model ?? normalizedNode?.model ?? normalizedNode?.config?.model ?? {}
      );
      normalizedNode.enable_memory =
        nodeMeta?.enable_memory ??
        normalizedNode?.enable_memory ??
        normalizedNode?.config?.enable_memory ??
        false;
      normalizedNode.tools = _clone(
        nodeMeta?.tools ?? normalizedNode?.tools ?? normalizedNode?.config?.tools ?? []
      );
    }

    if (normalizedNode?.node_type === nodeTypes.LLM) {
      normalizedNode.model = _clone(
        nodeMeta?.model ?? normalizedNode?.model ?? normalizedNode?.config?.model ?? {}
      );
    }

    return normalizedNode;
  }

  getWorkflowDetails() {
    this.svc.getWorkflowDetails(this.workFlowId).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.workflowDetailsLoadComplete = true;
        this.updateInitialLoadingState();
      })
    ).subscribe(res => {
      this.workflowDetailsForm.patchValue({
        name: res.name,
        description: res.description
      });
      this.workFlowViewData = this.svc.convertToWorkflowPopupViewData(res);
      this.workFlowData = {
        ...res,
        nodes: (res?.nodes || []).map(node => this.normalizeNodeForEdit(node))
      };
      this.emptyCanvas = false;
      this.nodeDetailsArr = [];
      this.toolsArr = [];

      this.workFlowData?.nodes?.forEach(n => {
        const nodeClone = _clone(n);

        if (n?.node_type === nodeTypes.AIAgent) {
          // Tools are kept separately so they can be edited inside the agent node.
          const tools = _clone(n?.tools);
          if (Array.isArray(tools) && tools.length > 0) {
            const updatedTools = tools.map(tool => this.mapToolToNode(tool));
            this.toolsArr.push({
              aiNodeId: n?.node_id,
              data: _clone(updatedTools)
            });
          } else {
            // Push empty group so agent node always has an entry in toolsArr
            this.toolsArr.push({
              aiNodeId: n?.node_id,
              data: []
            });
          }

          this.nodeDetailsArr.push(nodeClone);
          this.loadNodeConfiguration(
            nodeClone,
            Number(nodeClone.node_id),
            false
          );
          this.syncNodeUI(Number(String(n?.node_id ?? '').replace(/^node-/, '')));
          return;
        }

        if (n?.node_type === nodeTypes.LLM) {
          this.nodeDetailsArr.push(nodeClone);
          this.loadNodeConfiguration(
            nodeClone,
            Number(nodeClone.node_id),
            false
          );
          setTimeout(() => {
            this.nodeDetailsArr.forEach(nd => {
              this.syncNodeUI(nd?.node_id);
            });
          }, 0);
          return;
        }

        this.nodeDetailsArr.push(nodeClone);
        this.loadNodeConfiguration(
          nodeClone,
          Number(nodeClone.node_id),
          false
        )
        console.log(this.nodeDetailsArr, " Node detaills")
      });

      this.setWorkflowVarsData({
        variables: [...(this.workFlowData?.variables ?? [])]
      });

      this.connectionList = this.mapConnectionsForEditApi(_clone(this.workFlowData?.connections));
    });
  }
  private updateNodeStatusIcon(nodeId: number, hasErrors: boolean, tooltip?: string) {
    const okCls = 'fas fa-check-circle text-success';
    const errCls = 'fas fa-exclamation-triangle text-warning';
    const titleText = tooltip && tooltip.trim().length ? tooltip.trim()
      : (hasErrors ? 'Validation errors' : 'OK');

    // live DOM
    const nodeEl = document.getElementById(`node-${nodeId}`);
    console.log(nodeId, "nodeId")
    if (nodeEl) {
      // const iconEl = nodeEl.querySelector('.node-header .node-status i') ?? nodeEl.querySelector('.icon-and-title .node-status i .') ?? nodeEl.querySelector('.node-wrapper .node-status i') as HTMLElement | null;
      const iconEl = nodeEl.querySelector(
        '.node-header .node-status i, .node-wrapper .node-status i, .icon-and-title .node-status i'
      ) as HTMLElement | null;
      console.log(iconEl, "iconEL")
      if (iconEl) {
        iconEl.className = hasErrors ? errCls : '';
        const holder = iconEl.parentElement as HTMLElement | null;
        if (holder) holder.title = titleText; // native tooltip [web:242][web:240]
      }
    }

    // stored HTML
    const dfNode = this.editor.drawflow.drawflow.Home.data[nodeId];
    const htmlString = String(dfNode?.html || '');
    if (htmlString) {
      const temp = document.createElement('div');
      temp.innerHTML = htmlString.trim();
      // const iconEl =
      // temp.querySelector('.icon-and-title .node-status i') ?? temp.querySelector('.node-header .node-status i') ?? temp.querySelector('.node-wrapper .node-status i') as HTMLElement | null;
      const iconEl = temp.querySelector(
        '.node-header .node-status i, .node-wrapper .node-status i, .icon-and-title .node-status i'
      ) as HTMLElement | null;


      if (iconEl) {
        iconEl.className = hasErrors ? errCls : '';
        const holder = iconEl.parentElement as HTMLElement | null;
        if (holder) holder.title = titleText;  // persists tooltip [web:242][web:219]
        dfNode.html = temp.innerHTML;
      }
    }
  }


  private hasNodeOrAgentToolErrors(node: any): boolean {
    if (this.hasAnyErrors(node?.formErrors)) {
      return true;
    }
    if (node?.node_type !== nodeTypes.AIAgent) {
      return false;
    }

    const toolGroup = this.toolsArr.find(group =>
      this.normalizeAgentNodeId(group?.aiNodeId) === this.normalizeAgentNodeId(node?.node_id)
    );
    return toolGroup?.data?.some(tool =>
      tool?.hasErrors === true || this.hasAnyErrors(tool?.formErrors)
    ) ?? false;
  }


  private hasAnyErrors(err: any): boolean {
    if (err == null) return false;

    if (typeof err === 'string') {
      return err.trim().length > 0;
    }

    if (Array.isArray(err)) {
      return err.some(item => this.hasAnyErrors(item));
    }

    if (typeof err === 'object') {
      return Object.values(err).some(val => this.hasAnyErrors(val));
    }

    return false;
  }

  private buildErrorTooltip(err: any): string {
    const parts: string[] = [];

    const walk = (val: any) => {
      if (val == null) return;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.length) parts.push(trimmed);
        return;
      }
      if (Array.isArray(val)) {
        val.forEach(walk);
        return;
      }
      if (typeof val === 'object') {
        Object.values(val).forEach(walk);
      }
    };

    walk(err);

    return Array.from(new Set(parts)).join('\n');
  }


  saveWorkFlow() {
    if (this.isSavingWorkflow || this.isWorkflowSaved) return;

    // Auto-layout updates Drawflow immediately. Copy its final node positions
    // and source/target ports before both create and edit payloads are built.
    this.syncCanvasLayoutForSave();

    const hasNodeErrors = this.nodeDetailsArr?.some(node => this.hasAnyErrors(node.formErrors)) ?? false;
    const hasToolErrors = this.toolsArr?.some(group =>
      group?.data?.some(tool => tool?.hasErrors === true || this.hasAnyErrors(tool?.formErrors))
    ) ?? false;
    if (this.hasNestedLoopConnectionOnSave()) {
      this.notification.error(
        new Notification('Nested Loop nodes are not applicable at the moment. Please remove the connection.')
      );
      return;
    }
    if (hasToolErrors) {
      this.notification.error(
        new Notification('Workflow cannot be saved because one or more tools have missing required properties.')
      );
      return;
    }
    if (hasNodeErrors) {
      this.notification.error(new Notification('Workflow cannot be saved due to configuration errors in one or more nodes.'));
      return;
    }
    if (!this.validateAgentTimeouts()) return;
    console.log('Drawflow data', this.editor.export());
    const workflowPayload = this.buildWorkflowPayload(
      this.workflowDetailsForm.getRawValue(),
      this.nodeDetailsArr,
      this.mapConnectionsForApi(this.connectionList)
    );
    const workflowId = this.workFlowId ? this.workFlowId : '';

    console.log('wf payload>>>>>', workflowPayload);
    this.isWorkflowSaved = false;
    this.isSavingWorkflow = true;

    if (this.workFlowId) {
      this.svc.saveWorkFlow(workflowPayload, this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        // this.manageCeleryTaskData(workflowId, this.wfName, res.task_id);
        this.isSavingWorkflow = false;
        this.isWorkflowSaved = true;
        setTimeout(() => {
          this.isWorkflowSaved = false;
          // this.router.navigate(['../../../'], { relativeTo: this.route }).catch(() => {
          //   this.isWorkflowSaved = false;
          // });
        }, 2000);
      }, (err: HttpErrorResponse) => {
        this.isSavingWorkflow = false;
        this.notification.error(new Notification('Failed to update Workflow'));
      });
    } else {
      this.svc.saveWorkFlow(workflowPayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        const savedWorkflowId = typeof res === 'string' ? res : res?.uuid;
        this.isSavingWorkflow = false;

        if (!savedWorkflowId) {
          this.notification.error(new Notification('Workflow was created, but its identifier was not returned.'));
          return;
        }

        this.workFlowId = savedWorkflowId;
        this.isWorkflowSaved = true;

        this.router.navigate([savedWorkflowId, 'edit'], { relativeTo: this.route }).catch(() => {
          this.isWorkflowSaved = false;
          this.notification.error(new Notification('Workflow was created, but the edit view could not be loaded.'));
        });
      }, (err: HttpErrorResponse) => {
        this.isSavingWorkflow = false;
        this.notification.error(new Notification('Failed to create Workflow'));
      });
    }
  }

  private hasNestedLoopConnectionOnSave(): boolean {
    return this.connectionList.some(connection =>
      this.isNestedLoopConnection(connection)
    );
  }

  private isNestedLoopConnection(connection: any): boolean {
    const inputNode = this.nodeDetailsArr.find(
      n => Number(n.node_id) === Number(connection.input_id)
    );
    if (
      inputNode?.node_type !== nodeTypes.Loop ||
      connection.input_class !== 'input_1'
    ) {
      return false;
    }
    return this.hasUpstreamLoopOutput2(
      Number(connection.output_id),
      new Set<number>(),
      Number(connection.output_id) // exclude this node's own loop body from upstream walk
    );
  }

  private hasUpstreamLoopOutput2(nodeId: number, visited = new Set<number>(), selfLoopNodeId: number): boolean {
    if (visited.has(nodeId)) {
      return false;
    }
    visited.add(nodeId);

    const incomingConnections = this.connectionList.filter(
      conn => Number(conn.input_id) === Number(nodeId)
    );

    for (const conn of incomingConnections) {
      const outputNode = this.nodeDetailsArr.find(
        n => Number(n.node_id) === Number(conn.output_id)
      );

      // Don't treat the starting Loop node's own output_2 (its own loop body
      // feedback) as "upstream" — that's just the loop closing on itself.
      if (Number(conn.output_id) === selfLoopNodeId && conn.output_class === 'output_2') {
        continue;
      }

      if (
        outputNode?.node_type === nodeTypes.Loop &&
        conn.output_class === 'output_2'
      ) {
        return true;
      }

      if (this.hasUpstreamLoopOutput2(Number(conn.output_id), visited, selfLoopNodeId)) {
        return true;
      }
    }
    return false;
  }


  cancelWorkflowNameEdit(event: Event): void {
    event.preventDefault();
    this.wfName = this.workflowNameBeforeEdit;
    this.isEditingWorkflowName = false;
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
      this.storage.put('workflowsInProgress', _clone(this.workflowsInProgress), StorageType.SESSIONSTORAGE);
    }
    if (!this.workFlowId) {
      this.notification.success(new Notification('Workflow creation in progress..'));
    } else {
      this.notification.success(new Notification('Workflow updation in progress..'));
    }
    this.returnToList();
  }

  validateAgentTimeouts(): boolean {
    for (const node of this.nodeDetailsArr) {

      if (node.node_type !== nodeTypes.AIAgent) continue;

      const agentTimeout = Number(node?.config?.settings?.timeout || 0);
      const tools = node?.config?.tools || [];

      for (const tool of tools) {

        const toolTimeout = Number(tool?.settings?.timeout || 0);
        const humanTimeout = tool?.human_approval
          ? Number(tool?.approval_config?.timeout || 0)
          : 0;

        const combinedTimeout = toolTimeout + humanTimeout;

        if (combinedTimeout > agentTimeout) {
          this.notification.error(
            new Notification(
              `Tool timeout cannot exceed AI Agent timeout.`
            )
          );
          return false;
        }
      }
    }

    return true;
  }

  buildWorkflowPayload(workflowMeta: { name: string, description: string }, nodeDetailsArr: any[], connections: any[]) {
    console.log(nodeDetailsArr, "node details arr build ")
    console.log(this.savedWorkflowVarsData)
    this.nodeDetailsArr.forEach(node => {
      const drawflowNode = this.editor.getNodeFromId(node.node_id);
      node.pos_x = drawflowNode.pos_x;
      node.pos_y = drawflowNode.pos_y;
      if (node.node_type === nodeTypes.Loop) {
        this.buildLoopNodeAllConnectedChildren(node.node_id, 2);
      }
    });

    return {
      name: workflowMeta?.name || "",
      description: workflowMeta?.description || "",
      enabled: true,
      version: 1,
      ...this.workflowVarsData,
      // variables: [],
      ...this.savedWorkflowVarsData?.workflowVarsForm,

      nodes: nodeDetailsArr.map(node => {
        const baseNode = {
          name: node.name,
          node_id: node.node_id,
          node_type: node.node_type,
          type_version: 1,
          pos_x: node?.pos_x,
          pos_y: node?.pos_y,
          config: this.getFinalNodeConfig(node),
          inputs: [],
          outputs: [],
          endpoint: node.endpoint,
          key: node.key,
          icon_path: this.getNodeIconPath(node)
        };

        if (node.node_type === nodeTypes.AIAgent) {
          const matchedGroup = this.toolsArr.find(
            group => this.normalizeAgentNodeId(group.aiNodeId) === this.normalizeAgentNodeId(node.node_id)
          );
          return {
            ...baseNode,
            node_meta: {
              tools: matchedGroup
                ? matchedGroup.data.map(tool => ({
                  tool_id: tool.tool_id ?? tool.node_id,
                  name: tool.name,
                  node_type: tool.node_type,
                  key: tool?.key,
                  endpoint: this.getNodeConfigurationEndpoint(tool),
                  icon_path: this.getNodeIconPath(tool),
                  config: _clone(tool.formData ?? tool.config ?? {}),
                }))
                : [],
              model: node.model || {},
              enable_memory: node.enable_memory ?? false,
            }
          };
        }

        if (node.node_type === nodeTypes.LLM) {
          return {
            ...baseNode,
            node_meta: {
              model: node.model || {},
            }
          }
        }

        return baseNode;
      }),

      connections: connections.map(conn => ({
        source_node_id: conn.source_node_id,
        source_output: conn.source_output,
        target_node_id: conn.target_node_id,
        target_input: conn.target_input
      }))
    };
  }

  private getFinalNodeConfig(node: any): any {
    const nodeConfig = _clone(node?.config) || {};
    const formData = _clone(node?.formData) || {};

    // Case 1: formData has saved values — highest priority
    if (formData?.properties || formData?.settings) {
      const finalConfig: any = {};
      if (formData.properties) {
        finalConfig.properties = formData.properties;
      }
      if (formData.settings) {
        finalConfig.settings = formData.settings;
      }
      return finalConfig;
    }

    // Case 2: node.config has nested config
    if (nodeConfig?.config?.properties || nodeConfig?.config?.settings) {
      const finalConfig: any = {};
      if (nodeConfig.config.properties) {
        finalConfig.properties = nodeConfig.config.properties;
      }
      if (nodeConfig.config.settings) {
        finalConfig.settings = nodeConfig.config.settings;
      }
      return finalConfig;
    }

    // Case 3: fallback to node.config top-level
    if (nodeConfig?.properties || nodeConfig?.settings) {
      const finalConfig: any = {};
      if (nodeConfig.properties) {
        finalConfig.properties = nodeConfig.properties;
      }
      if (nodeConfig.settings) {
        finalConfig.settings = nodeConfig.settings;
      }
      return finalConfig;
    }

    // A newly dropped node only has its form schema until the configuration
    // modal is saved. Persist schema defaults as its initial configuration so
    // required defaults (notably Chat Trigger's welcome_message) are not lost.
    return this.getDefaultConfigFromSchema(nodeConfig);
  }

  private getDefaultConfigFromSchema(schema: any): any {
    return (schema?.tabs || []).reduce((config: Record<string, any>, tab: any) => {
      if (!tab?.id) return config;

      const tabDefaults = (tab.fields || []).reduce(
        (values: Record<string, any>, field: any) => {
          const key = field?.key ?? field?.control_name;
          // loadNodeConfiguration adds default_value: '' for rendering even
          // when the API schema did not declare a default. Only materialize
          // actual schema defaults here.
          const hasSchemaDefault = Object.prototype.hasOwnProperty.call(field || {}, 'default');

          if (key && hasSchemaDefault && field.default !== undefined) {
            values[key] = _clone(field.default);
          }
          return values;
        },
        {}
      );

      if (Object.keys(tabDefaults).length) {
        config[tab.id] = tabDefaults;
      }
      return config;
    }, {});
  }


  buildLoopNodeAllConnectedChildren(loopNodeId: number, outputId: number) {
    const visited = new Set<number>();
    const collectedChildren: NodeDetailsArrayModel[] = [];

    // Recursive DFS to collect all connected nodes
    const collectChildren = (parentId: number) => {
      this.connectionList
        .filter(conn => Number(conn.output_id) === parentId)
        .forEach(conn => {
          const childId = Number(conn.input_id);
          if (visited.has(childId)) return; // Avoid duplicates
          visited.add(childId);

          const childNode = this.nodeDetailsArr.find(n => n.node_id === childId);
          if (childNode) {
            collectedChildren.push(childNode);
            collectChildren(childId); // Keep going to indirect connections
          }
        });
    };

    // Find the loop node
    const loopNode = this.nodeDetailsArr.find(n => n.node_id === loopNodeId);
    if (!loopNode) {
      console.error(`Loop node with ID ${loopNodeId} not found`);
      return;
    }

    // Start only from the given output of the loop node
    this.connectionList
      .filter(conn => {
        const matchesNode = Number(conn.output_id) === loopNodeId;
        return matchesNode && conn.output_class?.includes(`output_${outputId}`);
      })
      .forEach(conn => {
        const childId = Number(conn.input_id);
        if (!visited.has(childId)) {
          visited.add(childId);
          const childNode = this.nodeDetailsArr.find(n => n.node_id === childId);
          if (childNode) {
            collectedChildren.push(childNode);
            collectChildren(childId); // Get indirect connections too
          }
        }
      });

    // Assign flat list to loop node
    loopNode['children'] = collectedChildren;
  }

  changeZoom(direction: number, event: Event) {
    event.stopPropagation();
    if (direction === 1) {
      this.editor.zoom_in();
    } else {
      this.editor.zoom_out();
    }
  }

  resetZoom(event: Event) {
    event.stopPropagation();
    this.editor.zoom_reset();
  }

  autoLayoutAndFit(event?: Event): void {
    event?.stopPropagation();

    const drawflowNodes = this.editor?.drawflow?.drawflow?.Home?.data || {};
    const nodeIds = Object.keys(drawflowNodes);
    if (!nodeIds.length) return;

    const graph = new dagre.graphlib.Graph({ multigraph: true });
    graph.setGraph({
      rankdir: 'LR',
      ranksep: 50,
      nodesep: 50,
      edgesep: 30,
      marginx: 40,
      marginy: 40
    });
    graph.setDefaultEdgeLabel(() => ({}));

    nodeIds.forEach(nodeId => {
      const nodeElement = document.getElementById(`node-${nodeId}`);
      graph.setNode(nodeId, {
        width: nodeElement?.offsetWidth || 180,
        height: nodeElement?.offsetHeight || 100
      });
    });

    const incomingCount = new Map<string, number>(
      nodeIds.map(nodeId => [nodeId, 0])
    );
    const outgoingCount = new Map<string, number>(
      nodeIds.map(nodeId => [nodeId, 0])
    );
    const layoutEdges: Array<{
      sourceId: string;
      targetId: string;
      outputName: string;
      inputName: string;
    }> = [];

    nodeIds.forEach(sourceId => {
      const outputs = drawflowNodes[sourceId]?.outputs || {};
      Object.keys(outputs).forEach(outputName => {
        (outputs[outputName]?.connections || []).forEach((connection, index) => {
          const targetId = String(connection.node);
          if (graph.hasNode(targetId)) {
            graph.setEdge(
              sourceId,
              targetId,
              {},
              `${sourceId}-${outputName}-${targetId}-${index}`
            );
            incomingCount.set(targetId, (incomingCount.get(targetId) || 0) + 1);
            outgoingCount.set(sourceId, (outgoingCount.get(sourceId) || 0) + 1);
            layoutEdges.push({
              sourceId,
              targetId,
              outputName,
              inputName: connection.output
            });
          }
        });
      });
    });

    // Never align a connector that enters or leaves a branch/merge node. Build
    // independent maximal linear segments from the remaining connections so a
    // newly added branch does not prevent an older straight chain from aligning.
    const isBranchOrMergeNode = (nodeId: string): boolean =>
      (incomingCount.get(nodeId) || 0) > 1 ||
      (outgoingCount.get(nodeId) || 0) > 1;
    const linearEdges = layoutEdges.filter(edge =>
      !isBranchOrMergeNode(edge.sourceId) &&
      !isBranchOrMergeNode(edge.targetId)
    );
    const linearNeighbours = new Map<string, Set<string>>();
    linearEdges.forEach(edge => {
      if (!linearNeighbours.has(edge.sourceId)) {
        linearNeighbours.set(edge.sourceId, new Set<string>());
      }
      if (!linearNeighbours.has(edge.targetId)) {
        linearNeighbours.set(edge.targetId, new Set<string>());
      }
      linearNeighbours.get(edge.sourceId)?.add(edge.targetId);
      linearNeighbours.get(edge.targetId)?.add(edge.sourceId);
    });

    const linearComponents: string[][] = [];
    const visited = new Set<string>();
    linearNeighbours.forEach((_neighbours, nodeId) => {
      if (visited.has(nodeId)) return;

      const component: string[] = [];
      const pending = [nodeId];
      while (pending.length) {
        const currentId = pending.pop();
        if (!currentId || visited.has(currentId)) continue;

        visited.add(currentId);
        component.push(currentId);
        linearNeighbours.get(currentId)?.forEach(neighbourId => {
          if (!visited.has(neighbourId)) pending.push(neighbourId);
        });
      }

      if (component.length > 1) {
        linearComponents.push(component);
      }
    });

    dagre.layout(graph);

    nodeIds.forEach(nodeId => {
      const layoutNode = graph.node(nodeId);
      const drawflowNode = drawflowNodes[nodeId];
      const posX = layoutNode.x - layoutNode.width / 2;
      const posY = layoutNode.y - layoutNode.height / 2;

      drawflowNode.pos_x = posX;
      drawflowNode.pos_y = posY;

      const nodeElement = document.getElementById(`node-${nodeId}`);
      if (nodeElement) {
        nodeElement.style.left = `${posX}px`;
        nodeElement.style.top = `${posY}px`;
      }

      const nodeDetails = this.nodeDetailsArr.find(
        node => Number(node.node_id) === Number(nodeId)
      );
      if (nodeDetails) {
        nodeDetails.pos_x = posX;
        nodeDetails.pos_y = posY;
      }

      const realTimeNode = this.realTimeNodeDetails?.nodes?.find(
        node => Number(node.node_id) === Number(nodeId)
      );
      if (realTimeNode) {
        realTimeNode.pos_x = posX;
        realTimeNode.pos_y = posY;
      }
    });

    requestAnimationFrame(() => {
      const zoom = Number(this.editor.zoom) || 1;
      const getPortOffsetY = (
        nodeId: string,
        portGroup: 'inputs' | 'outputs',
        portName: string
      ): number | null => {
        const nodeElement = document.getElementById(`node-${nodeId}`);
        const port = nodeElement?.querySelector(
          `.${portGroup} > .${portName}`
        ) as HTMLElement | null;
        if (!nodeElement || !port) return null;

        const nodeBounds = nodeElement.getBoundingClientRect();
        const portBounds = port.getBoundingClientRect();
        return (
          portBounds.top + (portBounds.height / 2) - nodeBounds.top
        ) / zoom;
      };
      const setNodeY = (nodeId: string, posY: number): void => {
        const roundedY = Math.round(posY * 100) / 100;
        const drawflowNode = drawflowNodes[nodeId];
        drawflowNode.pos_y = roundedY;

        const nodeElement = document.getElementById(`node-${nodeId}`);
        if (nodeElement) nodeElement.style.top = `${roundedY}px`;

        const nodeDetails = this.nodeDetailsArr.find(
          node => Number(node.node_id) === Number(nodeId)
        );
        if (nodeDetails) nodeDetails.pos_y = roundedY;

        const realTimeNode = this.realTimeNodeDetails?.nodes?.find(
          node => Number(node.node_id) === Number(nodeId)
        );
        if (realTimeNode) realTimeNode.pos_y = roundedY;
      };

      linearComponents.forEach(component => {
        const componentIds = new Set(component);
        const componentEdges = linearEdges.filter(edge =>
          componentIds.has(edge.sourceId) && componentIds.has(edge.targetId)
        );
        const outgoingEdges = new Map<string, typeof componentEdges>();
        componentEdges.forEach(edge => {
          outgoingEdges.set(edge.sourceId, [
            ...(outgoingEdges.get(edge.sourceId) || []),
            edge
          ]);
        });

        const rootId = component.find(id =>
          !componentEdges.some(edge => edge.targetId === id)
        ) || component[0];
        const aligned = new Set<string>([rootId]);
        const pending = [rootId];
        while (pending.length) {
          const sourceId = pending.shift();
          if (!sourceId) continue;

          (outgoingEdges.get(sourceId) || []).forEach(edge => {
            if (aligned.has(edge.targetId)) return;
            const outputOffset = getPortOffsetY(
              edge.sourceId,
              'outputs',
              edge.outputName
            );
            const inputOffset = getPortOffsetY(
              edge.targetId,
              'inputs',
              edge.inputName
            );
            if (outputOffset === null || inputOffset === null) return;

            setNodeY(
              edge.targetId,
              drawflowNodes[edge.sourceId].pos_y + outputOffset - inputOffset
            );
            aligned.add(edge.targetId);
            pending.push(edge.targetId);
          });
        }
      });

      nodeIds.forEach(nodeId => {
        this.editor.updateConnectionNodes(`node-${nodeId}`);
      });

      requestAnimationFrame(() => this.fitWorkflowToViewport(nodeIds));
    });
  }

  private fitWorkflowToViewport(nodeIds: string[]): void {
    const container = document.getElementById('dynamic-drawflow');
    if (!container || !this.editor?.precanvas) return;

    const bounds = nodeIds.reduce((current, nodeId) => {
      const node = this.editor.drawflow.drawflow.Home.data[nodeId];
      const element = document.getElementById(`node-${nodeId}`);
      if (!node || !element) return current;

      return {
        minX: Math.min(current.minX, node.pos_x),
        minY: Math.min(current.minY, node.pos_y),
        maxX: Math.max(current.maxX, node.pos_x + element.offsetWidth),
        maxY: Math.max(current.maxY, node.pos_y + element.offsetHeight)
      };
    }, {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    });

    if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY)) return;

    const padding = 32;
    const leftInset = this.isLeftCollapsed ? 0 : this.leftWidth;
    const rightInset = this.isRightCollapsed ? 0 : this.rightWidth;
    const bottomInset = this.isBottomCollapsed ? 40 : this.bottomHeight;
    const availableWidth = Math.max(
      1,
      container.clientWidth - leftInset - rightInset - padding * 2
    );
    const availableHeight = Math.max(
      1,
      container.clientHeight - bottomInset - padding * 2
    );
    const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
    const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
    const zoom = Math.max(
      this.editor.zoom_min,
      Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight)
    );
    const transformOrigin = getComputedStyle(this.editor.precanvas)
      .transformOrigin
      .split(' ');
    const originX = Number.parseFloat(transformOrigin[0]) || 0;
    const originY = Number.parseFloat(transformOrigin[1]) || 0;
    const translateX = leftInset + padding
      + (availableWidth - contentWidth * zoom) / 2
      - bounds.minX * zoom
      - originX * (1 - zoom);
    const translateY = padding
      + (availableHeight - contentHeight * zoom) / 2
      - bounds.minY * zoom
      - originY * (1 - zoom);

    this.editor.zoom = zoom;
    this.editor.zoom_last_value = zoom;
    this.editor.canvas_x = translateX;
    this.editor.canvas_y = translateY;
    this.editor.precanvas.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
  }

  openWorkflowVarModal(event: Event) {
    event.stopPropagation();
    this.modalRef = this.modalService.show(OrchestrationAgenticWorkflowVariablesComponent, {
      class: 'custom-agentic-workflow-modal-md',
      backdrop: true,                 // show dimmed backdrop
      ignoreBackdropClick: true,      // DO NOT close on outside click
      keyboard: false,
      initialState: {
        // optional: prevent ESC from closing
        workflowVarData: this.workflowVarsData,
        onClose: (formDatas: any, modalState: any) => {
          this.setWorkflowVarsData(formDatas?.workflowVarsForm);
        }
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onTriggerSubmit(data: any) {
    this.triggerData = data;
    if (this.triggerData) {
      this.pollForRealTimeExecution();
    }
  }

  openHelpPanel(): void {
    this.isRightCollapsed = false;

    this.showHelpPanel = true;
    this.showBeginner = false;
  }

  openExecutionPanel(): void {
    if (this.triggerNode) {
      this.rightExecuteData = this.prepareRightExecuteData(
        this.triggerNode,
        this.getNodeInitialValues(this.triggerNode)
      );
    }

    this.isRightCollapsed = false;

    this.showBeginner = true;
    this.showHelpPanel = false;
  }

  closeRightPanel(): void {
    this.isRightCollapsed = true;

    this.showBeginner = false;
    this.showHelpPanel = false;
  }

  /**
 * Switch tab without toggling the panel open/closed.
 * Called from the tab buttons inside the EXPANDED panel.
 */
  setBottomTab(tab: 'variables' | 'logs', event?: MouseEvent): void {
    event?.stopPropagation();          // prevent panel toggle from firing
    this.bottomActiveTab = tab;
  }

  /**
   * Open the panel (if collapsed) and jump straight to the chosen tab.
   * Called from the collapsed-bar pill buttons.
   */
  openBottomPanel(tab: 'variables' | 'logs', event?: MouseEvent): void {
    event?.stopPropagation();
    this.bottomActiveTab = tab;
    if (this.isBottomCollapsed) {
      this.bottomHeight = this.previousBottomHeight || 250;
      this.isBottomCollapsed = false;  // expand
    }
  }

  onWorkflowVarsChange(data: any) {
    this.setWorkflowVarsData(data?.workflowVarsForm ?? data);
  }

  private setWorkflowVarsData(workflowVarsData: any) {
    this.workflowVarsData = workflowVarsData;
    this.savedWorkflowVarsData = {
      workflowVarsForm: workflowVarsData
    };
  }

  manageWorkflowDetails() {
    this.workflowDetailsForm = this.svc.buildWorkflowDetailsForm(this.workFlowViewData);
    this.workflowDetailsFormErrors = this.svc.resetWorkflowDetailsFormErrors();
    this.workflowDetailsFormValidationMessages = this.svc.workflowDetailsFormValidationMessages;
    if (!this.workFlowId) {
      this.openWorkflowModal();
    }
  }

  openWorkflowModal(action?: string) {
    action === 'edit' ? this.editWorkflowFlag = true : this.editWorkflowFlag = false;
    setTimeout(() => {
      this.modalRef = this.modalService.show(this.workflowDetailsFormRef, Object.assign({}, {
        class: '',
        keyboard: true,
        ignoreBackdropClick: true
      }));
    }, 100);
  }

  onSubmitWorkflowDetails() {
    if (this.workflowDetailsForm.invalid) {
      this.workflowDetailsFormErrors = this.utilSvc.validateForm(this.workflowDetailsForm, this.workflowDetailsFormValidationMessages, this.workflowDetailsFormErrors);
      this.workflowDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.workflowDetailsFormErrors = this.utilSvc.validateForm(this.workflowDetailsForm, this.workflowDetailsFormValidationMessages, this.workflowDetailsFormErrors); });
    } else {
      if (this.workFlowId) {
        let payload = {
          workflow_data: this.workflowDetailsForm.getRawValue(),
          update_meta: true
        }
        this.svc.saveWorkFlow(payload, this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to create Workflow'));
        });
      }
      this.workFlowViewData = this.svc.convertToWorkflowPopupViewData(this.workflowDetailsForm.getRawValue());
      // this.initializeWorkflowParamsForm();
      this.modalRef.hide();
    }
  }

  /* -When we close the modal popup on create */
  onCloseWorkFlowDetails() {
    this.modalRef.hide();
    if (!this.editWorkflowFlag) {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }


  backWorkflow() {
    const canvasNodes = this.editor?.drawflow?.drawflow?.Home?.data || {};
    if (Object.keys(canvasNodes).length === 0) {
      this.navigateToWorkflowList();
      return;
    }

    this.backModalRef = this.modalService.show(this.confirmBack, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  returnToList() {
    this.backModalRef?.hide();
    this.navigateToWorkflowList();
  }

  private navigateToWorkflowList(): void {
    if (this.workFlowId) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else if (this.isViewMode) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }


}
