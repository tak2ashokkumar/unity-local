import { Component, ElementRef, HostListener, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NodeDataModel, OrchestrationWorkflowMetadata, UnityWorkflowViewData } from '../orchestration-workflow-poc/orchestration-workflow-poc.type';
import { Subject } from 'rxjs';
import Drawflow from 'drawflow';
import { cloneDeep as _clone, has } from 'lodash-es';
import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { OrchestrationAgenticWorkflowContainerService } from './orchestration-agentic-workflow-container.service';
import { environment } from 'src/environments/environment';
import { DrawflowNode, NodeDetails, NodeDetailsArrayModel, nodeTypes, ParsedJinja, TaskDetailsModel } from './orchestration-agentic-workflow-container.type';
import { OrchestrationAgenticWorkflowParamsComponent } from '../orchestration-agentic-workflow-params/orchestration-agentic-workflow-params.component';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { OrchestrationAgenticWorkflowVariablesComponent } from '../orchestration-agentic-workflow-variables/orchestration-agentic-workflow-variables.component';
import { WorkflowLogsViewData } from '../../orchestration-executions/orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.service';
import { OnChatExecution } from '../orchestration-workflow-execute/orchestration-workflow-execute.service';

type AccessType = "dot" | "bracket";

@Component({
  selector: 'orchestration-agentic-workflow-container',
  templateUrl: './orchestration-agentic-workflow-container.component.html',
  styleUrls: ['./orchestration-agentic-workflow-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrchestrationAgenticWorkflowContainerComponent implements OnInit {

  chatUpdates$ = new Subject<OnChatExecution>();
  noOfOutputNode: number;
  private ngUnsubscribe = new Subject();
  editor: Drawflow;
  currentCriteria: SearchCriteria;
  workFlowId: string;
  selectedCategory: any;
  latestDroppedTask: { type: string; name: any; category: any; image: any; uuid: any; playbook: any; pos_x: number; pos_y: number; };
  selectedSourceCategory: any;
  latestDroppedSourceTask: { type: string; name: any; category: any; image: any; uuid: any; playbook: any; pos_x: number; pos_y: number; };
  conditionList: any;
  latestDroppedCondition: { type: string; name: any; image: any; pos_x: number; pos_y: number; };
  latestDroppedOutput: { type: string; name: any; image: any; pos_x: number; pos_y: number; };
  latestDroppedLLM: { type: string; name: any; image: any; pos_x: number; pos_y: number; };
  currentNodeId: number;
  connectionList = [];
  selectedNodeId: number;
  positionX: any;
  positionY: any;
  workFlowViewData: any;
  workflowMetadata: OrchestrationWorkflowMetadata;
  @ViewChild('workflowDetailsFormRef') workflowDetailsFormRef: ElementRef;
  workflowDetailsForm: FormGroup;
  workflowDetailsFormErrors: any;
  workflowDetailsFormValidationMessages: any;
  modalRef: BsModalRef;
  imgUrlTrigger = `${environment.assetsUrl}external-brand/workflow/OrangeTrigger.svg`;
  imgUrlSchedule = `${environment.assetsUrl}external-brand/workflow/Schedule.svg`;
  nodes = [];  // this will store all node details to send to api
  latestDroppedNode: NodeDetails;
  tasksByCategory: TaskDetailsModel;
  selectedNode;
  nodeDetailsArr: NodeDetailsArrayModel[] = [];
  connectedNodeDetails: NodeDetailsArrayModel[] = [];
  taskDetails;
  workflowsInProgress: EntityTaskRelation[] = [];
  workFlowData;
  formattedTask = [];
  editWorkflow = false;
  isLeftCollapsed = false;
  editWorkflowFlag = false;
  @ViewChild('confirmreturn') confirmreturn: ElementRef;
  workflowReturnModalRef: BsModalRef;
  emptyCanvas = true;
  showHelpPanel = false;
  workflowVarsData;
  isDropdownOpen = false;
  showBeginner = false;
  @ViewChild('dropdown', { static: false }) dropdown!: ElementRef;
  triggerData: any;
  realTimeDetails;
  realTimeNodeDetails;
  generatedUUid;
  runNodeID = false;
  executionMode;
  triggerNode;
  currentSessionId: string;
  clickedNodeId: number;
  showExecutionLogsFlag = false;
  workflowLogsViewData: WorkflowLogsViewData = new WorkflowLogsViewData();
  workflowStatus: string;
  isBottomCollapsed = true;
  resumeBtn: boolean = false;
  hasNode = false;
  logsHeight = 250;
  headerHeight = 40;
  minLogsHeight = 150;
  maxLogsHeight = 400;
  private resizing = false;
  isWorkflowExecuting: boolean = false;
  droppedAsTool = false;
  toolsArr = [];
  currentAgentNodeId: number | null = null;

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
    private svc: OrchestrationAgenticWorkflowContainerService
  ) {
    this.currentCriteria = { searchValue: '', pageSize: 0 };
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workFlowId = params.get('id');
    });
  }

  ngOnInit(): void {
    document.addEventListener('click', (event) => this.closeDropdown(event));
    this.minimizeLeftPanel();
    const container = document.getElementById('agentic-drawflow') as HTMLElement;
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


    this.editor.force_first_input = true;
    this.getMetadata();
    this.manageWorkflowDetails();

    // Attach global function so raw HTML can call it
    // (window as any).onPlusClick = (nodeId: string, slotIndex: number, ev?: Event) => {
    //   console.log('Clicked slot-row:', { nodeId, slotIndex });
    //   if (ev) {
    //     ev.stopPropagation();
    //     ev.stopImmediatePropagation();
    //   }
    //   this.handlePlusClick(nodeId, slotIndex);
    // };


    (window as any).handleAgentDrop = (event: DragEvent, agentNodeId: number) => {
      this.onAgentDrop(event, agentNodeId);
    };

    (window as any).toggleMemoryIcon = (nodeId, el: HTMLImageElement) => {
      const isEnabled = el.getAttribute('data-enabled') === 'true';

      const newState = !isEnabled;

      const node = this.nodeDetailsArr.find(n => n.node_id === nodeId);
      if (node) {
        node.config = {
          ...node.config,
          enable_memory: newState
        };
      }

      //Update UI
      el.src = newState
        ? `${environment.assetsUrl}external-brand/workflow/memory_enabled.svg`
        : `${environment.assetsUrl}external-brand/workflow/memory_disabled.svg`;

      el.setAttribute('data-enabled', newState.toString());
    };

    (window as any).onModelChange = (nodeId, el: HTMLSelectElement, ev?: Event) => {
      const selectedValue = el.value;

      const node = this.nodeDetailsArr.find(n => n.node_id === nodeId);
      if (node) {
        node.config = {
          ...node.config,
          model: {
            ...node.config?.model,
            llm_integ: selectedValue
          }
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

    if (this.workFlowId) {
      this.getWorkflowDetails();
    }
  }

  ngOnDestroy() {
    this.maximizeLeftPanel();
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onAgentDrop(event: DragEvent, agentNodeId: number) {
    event.preventDefault();

    console.log('Tool dropped into AI Agent:', agentNodeId);

    this.currentAgentNodeId = agentNodeId;
    this.droppedAsTool = true;
  }

  getBottomPanelStyle() {
    const leftWidth = this.isLeftCollapsed ? '0px' : '25%';
    const rightWidth =
      this.showHelpPanel || this.showBeginner ? '25%' : '0px';

    return {
      left: leftWidth,
      right: rightWidth
    };
  }

  toggleLogs() {
    this.isBottomCollapsed = !this.isBottomCollapsed;
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    this.resizing = true;

    const startY = event.clientY;
    const startHeight = this.logsHeight;

    const mouseMove = (e: MouseEvent) => {
      if (!this.resizing) return;

      const diff = startY - e.clientY; // dragging UP = positive
      let nextHeight = startHeight + diff;

      nextHeight = Math.max(this.minLogsHeight, nextHeight);
      nextHeight = Math.min(this.maxLogsHeight, nextHeight);

      this.logsHeight = nextHeight;
    };

    const mouseUp = () => {
      this.resizing = false;
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  }


  minimizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (!isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'none');
      sidebar_minimizer.click();
    }

    let footer = this.document.getElementsByClassName('app-footer').item(0);
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

    let footer = this.document.getElementsByClassName('app-footer').item(0);
    this.renderer.setStyle(footer, 'display', 'flex');
    footer.click();
  }

  /*
  - Below method is used to drag a Task,Condition or Output node.
  - This is the event when we drag a node until we release the click and drop it.
*/
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

  /*
    - Below method stores the gets the data for the dropped node.
    - It calculates the posionX and positionY of the dropped node.
    - It passes the data along with the coordinates to the respective methods for Task, Conition and Output nodes.
  */
  drop(event): void {
    event.preventDefault();
    const nodeData = event.dataTransfer?.getData('value');
    const data = nodeData ? JSON.parse(nodeData) : null;
    if (data) {
      let positionX = event.clientX * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)));
      let positionY = event.clientY * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)));
      this.selectedCategory = data.category;
      let row = {
        nodeType: data.nodeType,
        type: data.type,
        name: data.name,
        category: data.category,
        image: data.image,
        uuid: data.uuid,
        pos_x: positionX,
        pos_y: positionY
      }
      this.latestDroppedNode = row;
      this.addNode(row, positionX, positionY);
    }
  }

  addNode(node: NodeDataModel, positionX: number, positionY: number): void {
    console.log(node)
    if (node.type === nodeTypes.Loop) {
      const loopNodeExist = this.nodeDetailsArr.find(n => n.node_type === nodeTypes.Loop);
      if (loopNodeExist) {
        this.notification.error(new Notification('Multiple Loop Nodes not allowed at the moment.'));
        return;
      }
    }
    this.noOfOutputNode = (node.type === nodeTypes.IfElse || node.type === nodeTypes.Loop) ? 2 : 1;
    let noOfInputNode = node.type === nodeTypes.Loop ? 2 : 1;
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


  /*
    - This method calls the API to get all the metadata.
    - Also handles drawflow events.
  */
  getMetadata() {
    this.svc.getMetadata().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        this.hasNode = true;
        this.workflowMetadata = res;
        // this.buildAssitantForm();
        setTimeout(() => {
          if (!this.workFlowId) {
            // this.addDefaultNodes();
          }
          setTimeout(() => {
            if (!this.editor) {
              return;
            }

            this.latestDroppedNode = null;

            // Handle node creation (Only runs once globally)
            this.editor.on('nodeCreated', (id: number) => {
              this.currentNodeId = id;
              if (this.latestDroppedNode) {
                this.updateNodeDetails(id, this.latestDroppedNode);
                if (this.latestDroppedNode.nodeType === 'task') {
                  this.droppedAsTool ? this.getTemplateDetailsByTask(this.latestDroppedNode, `tool-${id}`) :
                    this.getTemplateDetailsByTask(this.latestDroppedNode, id);
                } else if (this.latestDroppedNode.nodeType === 'source task') {
                  this.droppedAsTool ? this.getDetailsOfSelectedSourceTask(this.latestDroppedNode, `tool-${id}`) :
                    this.getDetailsOfSelectedSourceTask(this.latestDroppedNode, id);
                } else if (this.latestDroppedNode.nodeType === 'action task') {
                  this.droppedAsTool ? this.getDetailsOfSelectedSourceTask(this.latestDroppedNode, `tool-${id}`) :
                    this.getDetailsOfSelectedSourceTask(this.latestDroppedNode, id);
                  // this.getDetailsOfSelectedSourceTask(this.latestDroppedNode, id);
                } else if ((this.latestDroppedNode.type === nodeTypes.IfElse) ||
                  (this.latestDroppedNode.type === nodeTypes.Switch)) {
                  this.adjustNodeOutputs(id);
                  this.setNodeDetails(this.latestDroppedNode, id);
                  this.selectedNode = this.nodeDetailsArr.find(n => n.node_id === Number(id));
                  this.getConnectedNodeDetails(Number(id));
                  this.openNodeModal(Number(id));
                } else if (this.latestDroppedNode.type === nodeTypes.Loop) {
                  const loopNodeExist = this.nodeDetailsArr.find(n => n.node_type === nodeTypes.Loop);
                  if (loopNodeExist) {
                    this.notification.error(new Notification('Multiple Loop Nodes not allowed at the moment.'));
                    return;
                  }
                  this.adjustNodeInputs(id);
                  this.adjustNodeOutputs(id);
                  this.setNodeDetails(this.latestDroppedNode, id);
                  this.selectedNode = this.nodeDetailsArr.find(n => n.node_id === Number(id));
                  this.getConnectedNodeDetails(Number(id));
                  this.openNodeModal(Number(id));
                  this.droppedAsTool ? this.getDetailsOfSelectedSourceTask(this.latestDroppedNode, `tool-${id}`) :
                    this.getDetailsOfSelectedSourceTask(this.latestDroppedNode, id);
                } else {
                  const lastToolId = this.getLatestNodeIdForAITools();
                  let nodeId: any = id;
                  this.droppedAsTool && this.workFlowData ? nodeId = lastToolId ? `tool-${lastToolId + 1}` : `tool-${nodeId}` : nodeId = id;
                  this.droppedAsTool ? this.setNodeDetails(this.latestDroppedNode, nodeId.split('-')[1]) : this.setNodeDetails(this.latestDroppedNode, nodeId);
                  this.selectedNode = this.toolsArr
                    .flatMap(t => t?.data || [])
                    .find(n => (n?.tool_id === nodeId || n?.tool_id === nodeId) ||
                      (n?.node_id === nodeId || n?.node_id === nodeId))
                    || this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId));
                  const isTool = this.toolsArr.find(t =>
                    t?.data?.some(n =>
                      n?.tool_id === `tool-${id}` ||
                      n?.node_id === `tool-${id}`
                    )
                  );
                  isTool ? this.getConnectedNodeDetails(nodeId) : this.getConnectedNodeDetails(Number(nodeId));
                  isTool ? this.openNodeModal(nodeId) : !this.droppedAsTool ? this.openNodeModal((Number(nodeId))) : '';
                }
                this.latestDroppedNode = null; // Reset after assigning
              }

              const container = document.getElementById('agentic-drawflow') as HTMLElement;
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
                  this.selectedNode = this.nodeDetailsArr.find(n => n.node_id === id);
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
                  const clickedNode = this.nodeDetailsArr.find(n => `node-${n.node_id}` === nodeId);

                  if (!clickedNode) return;
                  this.clickedNodeId = Number(clickedNode.node_id);
                  const hasErrors = this.hasAnyErrors(clickedNode.formErrors);
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
                    this.showBeginner = true;
                    this.showHelpPanel = false;
                    return;
                  }
                  if (triggerNode && isConnected && (!triggerStatus || triggerStatus === 'Failed')) {
                    this.triggerNode = triggerNode;
                    this.showBeginner = true;
                    this.showHelpPanel = false;
                    return;
                  }
                  this.pollForRealTimeExecution();
                });
              }
            });

            // Handle node removal (Only runs once globally)
            this.editor.on('nodeRemoved', (id: number) => {
              const container = document.getElementById('agentic-drawflow') as HTMLElement;
              if (container.querySelector('.agentic-default-node')) {
                this.emptyCanvas = false;
              } else {
                this.emptyCanvas = true;
              }
              this.handleNodeRemove(id);
            });

            this.editor.on('connectionCreated', (connection) => {
              this.connectionList.push(connection);
              console.log('created>>>>>', this.connectionList);
              // this.addMiddleArrows();
            });

            // Remove when a connection is deleted in the canvas
            this.editor.on('connectionRemoved', (conn) => {
              console.log('conn removed>>>', this.connectionList, conn)
              this.connectionList = this.connectionList.filter(c =>
                !(
                  Number(c.output_id) === Number(conn.output_id) &&
                  Number(c.input_id) === Number(conn.input_id)
                )
              );
            });

            // this.editor.on('nodeMoved', () => this.addMiddleArrows());

          }, 0);
        }, 0);
      },
      (err: HttpErrorResponse) => {
        this.workflowMetadata = null;
      }
    );
  }

  //  addMiddleArrows(): void {
  //   const marker = document.querySelector<SVGMarkerElement>('#arrow');
  //   if (!marker) {
  //     console.error('Arrow marker (#arrow) not found in SVG defs.');
  //     return;
  //   }

  //   // Get the first shape inside the marker (path, polygon, etc.)
  //   const arrowShape = marker.querySelector('path, polygon, polyline');
  //   if (!arrowShape) {
  //     console.error('No shape found inside #arrow marker.');
  //     return;
  //   }

  //   const refX = parseFloat(marker.getAttribute('refX') || '0');
  //   const refY = parseFloat(marker.getAttribute('refY') || '0');

  //   // Clone the shape and modify it to be outline-only
  //   const arrowClone = arrowShape.cloneNode(true) as SVGElement;
  //   arrowClone.removeAttribute('fill'); // remove fill
  //   arrowClone.setAttribute('stroke', '#000'); // outline color
  //   arrowClone.setAttribute('stroke-width', '1.5'); // outline thickness

  //   const arrowShapeHTML = arrowClone.outerHTML;

  //   const paths = document.querySelectorAll<SVGPathElement>('.drawflow .connection path');

  //   paths.forEach(path => {
  //     const parentEl = path.parentNode as Element;

  //     // Remove old middle arrows
  //     const oldArrow = parentEl.querySelector('.middle-arrow');
  //     if (oldArrow) oldArrow.remove();

  //     const length = path.getTotalLength();
  //     const midpoint = path.getPointAtLength(length / 2);
  //     const beforeMid = path.getPointAtLength(length / 2 - 1);

  //     const angle = Math.atan2(midpoint.y - beforeMid.y, midpoint.x - beforeMid.x) * 180 / Math.PI;

  //     const gHTML = `
  //       <g class="middle-arrow"
  //          transform="translate(${midpoint.x},${midpoint.y}) rotate(${angle}) translate(${-refX},${-refY})">
  //         ${arrowShapeHTML}
  //       </g>
  //     `;

  //     parentEl.insertAdjacentHTML('beforeend', gHTML);
  //   });
  // }



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



  getConnectedNodeDetails(nodeId: any) {
    const visited = new Set<number>();
    const connectedNodeIds: number[] = [];

    const toolGroup = this.toolsArr.find(t =>
      t?.data?.some(n =>
        `tool-${n?.tool_id}` === nodeId ||
        `tool-${n?.node_id}` === nodeId
      )
    );

    const effectiveNodeId = toolGroup?.aiNodeId || nodeId;

    const findParents = (currentId: number) => {
      this.connectionList
        .filter(conn => Number(conn.input_id) === currentId) // connections leading into this node
        .forEach(conn => {
          const parentId = Number(conn.output_id);
          if (!visited.has(parentId)) {
            visited.add(parentId);
            connectedNodeIds.push(parentId);
            findParents(parentId); // recurse upward
          }
        });
    };

    findParents(effectiveNodeId);

    // map them to nodeDetails
    this.connectedNodeDetails = connectedNodeIds
      .map(id => this.nodeDetailsArr.find(n => n.node_id === id))
      .filter((n): n is NodeDetailsArrayModel => !!n);
  }

  setNodeDetails(nodeDetails: NodeDataModel, nodeId: any) {
    let config: any = {};

    switch (nodeDetails.type) {
      case nodeTypes.ScheduleTrigger:
        config = { schedule_meta: null, settings: { retries: 0, timeout: 3600 } };
        break;

      case nodeTypes.OnChatMessageTrigger:
        config = { welcome_message: '', settings: { retries: 0, timeout: 3600 } };
        break;

      case nodeTypes.ItsmTrigger:
        config = { itsm_table: '', event_type: '' };
        break;

      case nodeTypes.WebhookTrigger:
        config = { webhook_url: '', payload: '' };
        break;

      case nodeTypes.CreateITSMTicket:
        config = {
          itsm_table: '',
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.Email:
        config = {
          to: '',
          subject: '',
          body: '',
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.Chart:
        config = {
          chart_type: '',
          x_label: '',
          y_label: '',
          x_values: [],
          y_values: [],
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.Source:
        config = {
          task: nodeDetails.uuid,
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.Action:
        config = {
          task: nodeDetails.uuid,
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.LLM:
        config = {
          prompt: '',
          model: { llm_integ: '' },
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.AIAgent:
        config = {
          user_prompt: '',
          system_prompt: '',
          model: { llm_integ: '' },
          enable_memory: false,
          tools: [],
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.AnsibleBook:
      case nodeTypes.TerraformScript:
      case nodeTypes.PythonScript:
      case nodeTypes.BashScript:
      case nodeTypes.PowershellScript:
      case nodeTypes.RestApi:
        config = {
          task: nodeDetails.uuid,
          target_type: '',
          target: '',
          credential: '',
          package_requirements: '',
          cloud_type: '',
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.IfElse:
        config = {
          condition_key: '',
          operator: '',
          condition_value: '',
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      case nodeTypes.Switch:
        config = {
          conditions: [],
          settings: { retries: 0, timeout: 3600 }
        };
        break;

      default:
        config = {};
    }

    let row = {
      name: nodeDetails.name,
      node_id: nodeId,
      node_type: nodeDetails.type,
      type_version: 1,
      pos_x: nodeDetails.pos_x,
      pos_y: nodeDetails.pos_y,
      config,
      inputs: [],
      outputs: []
    };
    if (this.droppedAsTool && this.currentAgentNodeId !== null) {
      if (this.isValidTool(nodeDetails)) {
        let toolrow = {
          name: nodeDetails.name,
          node_id: `tool-${nodeId}`,
          node_type: nodeDetails.type,
          type_version: 1,
          pos_x: nodeDetails.pos_x,
          pos_y: nodeDetails.pos_y,
          config,
          inputs: [],
          outputs: []
        };
        const existing = this.toolsArr.find(
          t => t.aiNodeId === this.currentAgentNodeId
        );

        if (existing) {
          existing.data.push({ ...toolrow, isTool: true });
        } else {
          this.toolsArr.push({
            aiNodeId: this.currentAgentNodeId,
            data: [{ ...toolrow, isTool: true }]
          });
        }

        this.updateAgentTools(this.currentAgentNodeId, this.getToolsForAgent(this.currentAgentNodeId) || []);
      } else {
        return;
      }
      this.droppedAsTool = false;
      this.currentAgentNodeId = null;
    } else {
      this.nodeDetailsArr.push(row);
    }

    console.log('tools  arr>>>', this.toolsArr)
    console.log('nodes  arr>>>', this.nodeDetailsArr)

  }

  isValidTool(nodeDetails: NodeDataModel) {
    if (!this.svc.isOrcPlayBook(nodeDetails?.type) && !this.svc.isSourceTaskOrAction(nodeDetails?.type)) {
      return false;
    } else {
      return true;
    }
  }

  getToolsForAgent(aiNodeId: number) {
    const group = this.toolsArr.find(t => t.aiNodeId === aiNodeId);
    return group?.data?.filter(t => t && t.node_id) || [];
  }

  openNodeModal(nodeId: any, modalName?: string) {
    console.log('tools>>>', this.toolsArr, nodeId)

    this.selectedNode = this.toolsArr
      .flatMap(t => t?.data || [])
      .find(n => (n?.tool_id === nodeId || `tool-${n?.tool_id}` === nodeId) ||
        (n?.node_id === nodeId || `tool-${n?.node_id}` === nodeId))
      || this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId));
    this.modalRef = this.modalService.show(OrchestrationAgenticWorkflowParamsComponent, {
      class: 'custom-agentic-modal-lg',
      backdrop: true,                 // show dimmed backdrop
      ignoreBackdropClick: true,      // DO NOT close on outside click
      keyboard: false,                // optional: prevent ESC from closing
      initialState: {
        nodeData: this.toolsArr
          .flatMap(t => t?.data || [])
          .find(n => (n?.tool_id === nodeId || `tool-${n?.tool_id}` === nodeId) ||
            (n?.node_id === nodeId || `tool-${n?.node_id}` === nodeId))
          || this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId)) || {},
        realTimeData: this.realTimeNodeDetails ? this.realTimeNodeDetails.nodes.find(n => n.node_id === nodeId) : {},
        connectedNodes: _clone(this.connectedNodeDetails),
        modalName: modalName,
        workflowId: this.workFlowId,
        workflowVarsData: this.workflowVarsData,
        onClose: (formDatas: any, modalState: any) => {
          // retain in memory, update node data
          if (this.selectedNode?.node_type === nodeTypes.Switch) {
            this.updateNodeOutputs(nodeId, formDatas);
          }
          this.updateNodeName(formDatas, nodeId);
          const mergedErrors = {
            inputs: [
              ...(formDatas.triggerFormErrors?.inputs || []),
              ...(formDatas.scheduleTriggerFormErrors?.inputs || []),
              ...(formDatas.onChatFormErrors?.inputs || []),
              ...(formDatas.createTicketFormErrors?.inputs || []),
              ...(formDatas.updateTicketFormErrors?.inputs || []),
              ...(formDatas.commentInTicketFormErrors?.inputs || []),
              ...(formDatas.getTicketFormErrors?.inputs || []),
            ],
            outputs: [
              ...(formDatas.propertiesFormErrors?.outputs || []),
            ],
            ...formDatas.itsmFormErrors,
            ...formDatas.webhookFormErrors,
            ...formDatas.aimlFormErrors,
            ...formDatas.triggerFormErrors,
            ...formDatas.scheduleTriggerFormErrors,
            ...formDatas.onChatFormErrors,
            ...formDatas.propertyFormErrors,
            ...formDatas.createTicketFormErrors,
            ...formDatas.updateTicketFormErrors,
            ...formDatas.getTicketFormErrors,
            ...formDatas.commentInTicketFormErrors
          };

          const getId = (val: any) =>
            val?.includes?.('-') ? val : `tool-${val}`;

          const isTool = this.toolsArr.find(t =>
            t?.data?.some(n =>
              getId(n?.tool_id) === nodeId ||
              getId(n?.node_id) === nodeId
            )
          );

          console.log('istool>>>>>>', isTool)

          let hasErrors;
          let tooltip;

          hasErrors = this.hasAnyErrors(mergedErrors);
          tooltip = this.buildErrorTooltip(mergedErrors);

          // resolve inputs and deep clone them to plain data
          const resolvedInputs =
            formDatas?.propertyForm?.inputs ??
            formDatas?.triggerForm?.inputs ??
            formDatas?.scheduleTriggerForm?.inputs ??
            formDatas?.createTicketForm?.inputs ??
            formDatas?.updateTicketForm?.inputs ??
            // formDatas?.commentInTicketForm?.inputs ??
            formDatas?.getTicketForm?.inputs ??
            formDatas?.onChatMessageForm?.inputs ?? [];

          const resolvedOutputs =
            formDatas?.propertyForm?.outputs ??
            formDatas?.createTicketForm?.outputs ??
            formDatas?.updateTicketForm?.outputs ??
            formDatas?.getTicketForm?.outputs ?? [];

          const safeInputs = resolvedInputs ? _clone(resolvedInputs) : [];
          const safeOutputs = resolvedOutputs ? _clone(resolvedOutputs) : [];


          if (isTool) {
            console.log('Inputs>>>>', safeInputs)
            console.log('before toolsArr>>>>>', this.toolsArr)


            this.toolsArr = this.toolsArr.map(group => ({
              ...group,
              data: group.data.map(node =>
                getId(node?.node_id) === getId(nodeId)
                  ? {
                    ...node,
                    ...formDatas?.propertyForm,
                    human_approval: formDatas?.human_approval,
                    outputs: safeOutputs,
                    inputs: safeInputs,
                    name: formDatas.propertyForm?.name || node.name,
                    target: formDatas.propertyForm?.target,
                    credential: formDatas.propertyForm?.credential,
                    // config: this.buildConfig(node, formDatas),
                    formErrors: mergedErrors,
                    formValidationMessages: {
                      ...(formDatas.propertyFormValidationMessages || {}),
                      ...(formDatas.outputValidationMessage || {})
                    },
                    hasErrors,
                    node_id: getId(node?.node_id)
                  }
                  : node
              ),
            }));

            console.log('after toolsArr>>>>>', this.toolsArr)

            // this.nodeDetailsArr = this.nodeDetailsArr.map(node => {
            //   if (node?.node_type === nodeTypes.AIAgent) {

            //     const group = this.toolsArr.find(t => t.aiNodeId === node.node_id);

            //     return {
            //       ...node,
            //       config: {
            //         ...node.config,
            //         tools: (group?.data || []).map(tool =>
            //           this.getToolsConfig({ ...tool }) // clone here
            //         ),
            //       }
            //     };
            //   }

            //   return node;
            // });
            this.syncAgentToolsToNodes();
          } else {

            this.nodeDetailsArr = this.nodeDetailsArr.map(node =>
              node.node_id === nodeId
                ? {
                  ...node,
                  outputs: safeOutputs,
                  inputs: safeInputs,
                  name:
                    formDatas.propertyForm?.name ||
                    formDatas.triggerForm?.name ||
                    formDatas?.scheduleTriggerForm?.name ||
                    formDatas?.onChatMessageForm?.name ||
                    formDatas?.itsmForm?.name ||
                    formDatas?.webhookForm?.name ||
                    formDatas?.aimlForm?.name ||
                    formDatas?.createTicketForm?.name ||
                    formDatas?.updateTicketForm?.name ||
                    formDatas?.commentInTicketForm?.name ||
                    formDatas?.getTicketForm?.name,
                  target: formDatas.propertyForm?.target,
                  credential: formDatas.propertyForm?.credential,
                  config: this.buildConfig(node, formDatas),
                  formErrors: mergedErrors,
                  formValidationMessages: {
                    ...(formDatas.propertyFormValidationMessages || {}),
                    ...(formDatas.triggerFormValidationMessages || {}),
                    ...(formDatas.scheduleFormValidationMessages || {}),
                    ...(formDatas.onChatFormValidationMessages || {}),
                    ...(formDatas.itsmFormValidationMessages || {}),
                    ...(formDatas.webhookFormValidationMessages || {}),
                    ...(formDatas.aimlFormValidationMessages || {}),
                    ...(formDatas.createTicketFormValidationMessages || {}),
                    ...(formDatas.updateTicketFormValidationMessages || {}),
                    ...(formDatas.commentInTicketFormValidationMessages || {}),
                    ...(formDatas.getTicketFormValidationMessages || {}),
                    ...(formDatas.outputValidationMessage || {})
                  },
                  hasErrors
                }
                : node
            );

          }

          console.log('tools>>>>', this.toolsArr)
          console.log('nodes>>>>', this.nodeDetailsArr)


          this.selectedNode = this.toolsArr
            .flatMap(t => t?.data || [])
            .find(n => (n?.tool_id === nodeId || `tool-${n?.tool_id}` === nodeId) ||
              (n?.node_id === nodeId || `tool-${n?.node_id}` === nodeId))
            || this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId))
          // const currentData = this.editor.getNodeFromId(nodeId).data;
          // const nodeData = this.editor.drawflow.drawflow.Home.data[nodeId];
          console.log('Form Errors Passed:', this.selectedNode?.formErrors, this.selectedNode?.formValidationMessages);
          if (!isTool && (this.selectedNode?.formErrors?.approver_groups || this.selectedNode?.formErrors?.approver_users
            || this.selectedNode?.formErrors?.channels || this.selectedNode?.formErrors?.mode
            || this.selectedNode?.formErrors?.on_timeout)) {
            return;
          } else {
            this.updateNodeStatusIcon(nodeId, hasErrors, tooltip);
          }
          if (modalState) {
            modalState.connectedNodes = [];
          }
          if (modalState?.action === 'test') {
            // const nodeType = this.selectedNode?.node_type;

            const clickedNode = this.nodeDetailsArr.find(
              n => n.node_id === nodeId
            );

            this.handleNodeExecution(clickedNode);
          }
        },
      }
    });
    // const modalInstance = this.modalRef.content as OrchestrationAgenticWorkflowParamsComponent;
    // modalInstance.onTest = (payload: any) => {
    //   this.handleTestFromModal(payload);
    // };
  }

  syncAgentToolsToNodes() {
    this.nodeDetailsArr = this.nodeDetailsArr.map(node => {

      if (node?.node_type !== nodeTypes.AIAgent) return node;

      const group = this.toolsArr.find(
        t => t.aiNodeId === node.node_id
      );

      return {
        ...node,
        config: {
          ...node.config,
          tools: (group?.data || []).map(tool =>
            this.getToolsConfig({ ...tool }) // clone to avoid ref issues
          )
        }
      };
    });
  }



  updateToolInNodeDetails(aiNodeId, toolData) {
    const aiNode = this.nodeDetailsArr.find(n => n.node_id === aiNodeId);

    if (!aiNode) return;

    if (!aiNode.config) aiNode.config = {};
    if (!aiNode.config.tools) aiNode.config.tools = [];

    const index = aiNode.config.tools.findIndex(t => t.id === toolData.id);

    if (index > -1) {
      aiNode.config.tools[index] = toolData; // update
    } else {
      aiNode.config.tools.push(toolData); // add
    }
  }

  findNodeById(nodes: Record<string, any>, nodeId: number): any | undefined {
    return Object.values(nodes).find(
      node => node.node_id === nodeId
    );
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
        if (holder) holder.setAttribute('data-tip', titleText); // persists tooltip [web:242][web:219]
        dfNode.html = temp.innerHTML;
      }
    }
  }


  private hasAnyErrors(err: any): boolean {
    if (!err || typeof err !== 'object') return false;

    // Check top-level scalar fields (e.g., name, model, system_prompt, timeouts, retries, user_prompt)
    for (const [k, v] of Object.entries(err)) {
      if (typeof v === 'string' && v.trim().length > 0) return true;
    }

    // Check inputs array if present: any item with any non-empty field
    if (Array.isArray(err.inputs)) {
      const anyInputError = err.inputs.some(item =>
        item && Object.values(item).some(val => typeof val === 'string' && val.trim().length > 0)
      );
      if (anyInputError) return true;
    }

    // Check outputs array if present (structure from outputFormErrors)
    if (Array.isArray(err.outputs)) {
      const anyOutputError = err.outputs.some(item =>
        item && Object.values(item).some(val => typeof val === 'string' && val.trim().length > 0)
      );
      if (anyOutputError) return true;
    }

    return false;
  }

  private buildErrorTooltip(err: any): string {
    if (!err || typeof err !== 'object') return '';
    const parts: string[] = [];

    // top-level scalar fields
    for (const [k, v] of Object.entries(err)) {
      if (typeof v === 'string' && v.trim().length > 0) {
        parts.push(v.trim());
      }
    }

    // inputs array items
    if (Array.isArray(err.inputs)) {
      err.inputs.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          Object.values(item).forEach((val: any) => {
            if (typeof val === 'string' && val.trim().length > 0) {
              parts.push(val.trim());
            }
          });
        }
      });
    }

    // outputs array items
    if (Array.isArray(err.outputs)) {
      err.outputs.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          Object.values(item).forEach((val: any) => {
            if (typeof val === 'string' && val.trim().length > 0) {
              parts.push(val.trim());
            }
          });
        }
      });
    }

    // join with newlines so native title shows multiple lines
    return parts.join('\n');
  }


  updateNodeName(formData, nodeId) {
    const currentName = formData.propertyForm?.name || formData.triggerForm?.name || formData?.scheduleTriggerForm?.name
      || formData?.onChatMessageForm?.name || formData?.itsmForm?.name || formData?.webhookForm?.name ||
      formData?.aimlForm?.name || formData?.createTicketForm?.name || formData?.updateTicketForm?.name ||
      formData?.commentInTicketForm?.name || formData?.getTicketForm?.name
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
      const headerElement = nodeElement.querySelector('.node-label') as HTMLElement;
      // const currentData = this.editor.getNodeFromId(nodeId).data;
      const nodeData = this.editor.drawflow.drawflow.Home.data[nodeId];

      nodeData.name = currentName;

      const updatedTask = {
        type: this.selectedNode.node_type,
        name: currentName,
        image: this.svc.getCenterImageUrl(this.selectedNode.node_type),
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
        const htmlString = this.editor.drawflow.drawflow.Home.data[nodeId].html as string;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString.trim();
        const headerEl = tempDiv.querySelector('.node-label') as HTMLElement;
        if (headerEl) {
          headerEl.innerText = currentName;
        }
        this.editor.drawflow.drawflow.Home.data[nodeId].html = tempDiv.innerHTML;
      }
    }
  }


  updateNodeOutputs(nodeId: number, formValue): void {
    const currentNode = this.editor.getNodeFromId(nodeId);
    const currentOutputCount = Object.keys(currentNode.outputs).length;
    const requiredOutputCount = formValue?.propertyForm?.switchConditions.length;
    let outputsToAdd;
    if (requiredOutputCount > currentOutputCount) {
      // Add missing outputs
      for (let i = 0; i < requiredOutputCount - currentOutputCount; i++) {
        this.editor.addNodeOutput(nodeId);
      }
    } else if (requiredOutputCount < currentOutputCount) {
      // Remove extra outputs
      const outputKeys = Object.keys(currentNode.outputs);
      for (let i = currentOutputCount - 1; i >= requiredOutputCount; i--) {
        this.editor.removeNodeOutput(nodeId, outputKeys[i]);
      }
    }
    this.adjustNodeOutputs(nodeId);
  }

  buildConfig(node: any, formDatas: any) {
    const propertyForm = formDatas.propertyForm || {};
    console.log(propertyForm, " property Form")

    switch (node.node_type) {
      case nodeTypes.ManualTrigger:
        return { settings: { retries: 0, timeout: 3600 } }

      case nodeTypes.ScheduleTrigger:
        return { schedule_meta: formDatas?.scheduleTriggerForm?.config?.schedule_meta }

      case nodeTypes.OnChatMessageTrigger:
        return { welcome_message: formDatas?.onChatMessageForm?.config?.welcome_message }

      case nodeTypes.ItsmTrigger:
        return {
          itsm_table: formDatas?.itsmForm?.itsm_table,
          event_type: formDatas?.itsmForm?.event_type,
          skip_workflow_event: formDatas?.itsmForm?.skip_workflow_event
        }

      case nodeTypes.WebhookTrigger:
        return { webhook_url: formDatas?.webhookForm?.webhook_url, payload: formDatas?.webhookForm?.payload }

      case nodeTypes.AimlEventTrigger:
        return {
          aiml_type: formDatas?.aimlForm?.aiml_type,
          event_type: formDatas?.aimlForm?.event_type,
          filter: _clone(formDatas?.aimlForm?.filter),
          description: formDatas?.aimlForm?.description,
        }

      case nodeTypes.CreateITSMTicket:
        return {
          itsm_table: formDatas?.createTicketForm?.itsm_table,
          settings: {
            retries: formDatas?.createTicketForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: formDatas?.createTicketForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.createTicketForm?.continue_on_failure ?? formDatas?.createTicketForm?.continue_on_failure ?? false
          }
        }

      case nodeTypes.UpdateITSMTicket:
        return {
          itsm_table: formDatas?.updateTicketForm?.itsm_table,
          ticket_id: formDatas?.updateTicketForm?.ticket_id,
          settings: {
            retries: formDatas?.updateTicketForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: formDatas?.updateTicketForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.updateTicketForm?.continue_on_failure ?? formDatas?.updateTicketForm?.continue_on_failure ?? false
          }
        }

      case nodeTypes.CommentInITSMTicket:
        return {
          itsm_table: formDatas?.commentInTicketForm?.itsm_table,
          ticket_id: formDatas?.commentInTicketForm?.ticket_id,
          field_name: formDatas?.commentInTicketForm?.field_name,
          comment: formDatas?.commentInTicketForm?.comment,
          settings: {
            retries: formDatas?.commentInTicketForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: formDatas?.commentInTicketForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.commentInTicketForm?.continue_on_failure ?? formDatas?.commentInTicketForm?.continue_on_failure ?? false
          }
        }
      case nodeTypes.GetITSMTicket:
        return {
          itsm_table: formDatas?.getTicketForm?.itsm_table,
          filters: [...formDatas?.getTicketForm?.filters],
          settings: {
            retries: formDatas?.getTicketForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: formDatas?.getTicketForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.getTicketForm?.continue_on_failure ?? formDatas?.getTicketForm?.continue_on_failure ?? false
          }
        }

      case nodeTypes.Wait:
        return {
          duration_value: propertyForm?.duration_value,
          duration_unit: propertyForm?.duration_unit,
        }

      case nodeTypes.Transform:
        return this.prepareConfig(propertyForm)

      case nodeTypes.Email:
        return {
          to: propertyForm?.to || '',
          subject: propertyForm?.subject || '',
          body: propertyForm?.body || '',
          settings: {
            retries: propertyForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: propertyForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.propertyForm?.continue_on_failure ?? formDatas?.propertyForm?.continue_on_failure ?? false
          }
        };

      case nodeTypes.Chart:
        return {
          chart_type: propertyForm?.chart_type || '',
          x_label: propertyForm?.x_label || '',
          y_label: propertyForm?.y_label || '',
          x_values: propertyForm?.x_values || '',
          y_values: propertyForm?.y_values || '',
        };

      case nodeTypes.Source:
        return {
          task: propertyForm?.task || node.config?.task,
          settings: {
            retries: propertyForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: propertyForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.propertyForm?.continue_on_failure ?? formDatas?.propertyForm?.continue_on_failure ?? false
          }
        };

      case nodeTypes.Action:
        return {
          task: propertyForm?.task || node.config?.task,
          settings: {
            retries: propertyForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: propertyForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.propertyForm?.continue_on_failure ?? formDatas?.propertyForm?.continue_on_failure ?? false
          }
        };

      case nodeTypes.LLM:
        return {
          prompt: propertyForm?.prompt || '',
          model: { llm_integ: node?.config?.model?.llm_integ || '' },
          settings: {
            retries: propertyForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: propertyForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.propertyForm?.continue_on_failure ?? formDatas?.propertyForm?.continue_on_failure ?? false
          }
        };

      case nodeTypes.AIAgent:
        console.log('ai node>>>', node)
        return {
          user_prompt: propertyForm?.user_prompt || '',
          system_prompt: propertyForm?.system_prompt || '',
          model: { llm_integ: node?.config?.model?.llm_integ || '' },
          enable_memory: node?.config?.enable_memory || false,
          tools: node?.config?.tools,
          settings: {
            retries: propertyForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: propertyForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.propertyForm?.continue_on_failure ?? formDatas?.propertyForm?.continue_on_failure ?? false
          }
        };

      case nodeTypes.AnsibleBook:
      case nodeTypes.TerraformScript:
      case nodeTypes.PythonScript:
      case nodeTypes.BashScript:
      case nodeTypes.PowershellScript:
      case nodeTypes.RestApi:
        return {
          task: propertyForm?.task || node.config?.task,
          target_type: propertyForm?.target_type || node.config?.target_type,
          target: propertyForm?.target || '',
          credential: propertyForm?.credential || '',
          package_requirements: propertyForm?.package_requirements || node.config?.package_requirements,
          cloud_type: propertyForm?.cloud_type || node.config?.cloud_type,
          settings: {
            retries: propertyForm?.retries ?? node.config?.settings?.retries ?? 0,
            timeout: propertyForm?.timeouts ?? node.config?.settings?.timeout ?? 3600,
            continue_on_failure: formDatas?.propertyForm?.continue_on_failure ?? formDatas?.propertyForm?.continue_on_failure ?? false
          }
        };

      case nodeTypes.IfElse:
        return {
          condition_key: propertyForm?.condition_key || '',
          operator: propertyForm?.operator || '',
          condition_value: propertyForm?.condition_value || '',
        };

      case nodeTypes.Switch:
        return {
          conditions: Array.isArray(propertyForm?.switchConditions) ? propertyForm.switchConditions : []
        };

      case nodeTypes.Loop:
        return {
          conditions: propertyForm?.mode === 'WHILE' && Array.isArray(propertyForm?.conditions) ? propertyForm?.conditions : [],
          mode: propertyForm?.mode,
          items: _clone(propertyForm?.items),
          max_iterations: propertyForm?.mode === 'WHILE' ? propertyForm?.max_iterations : 0,
        }

      default:
        return node.config || {};
    }
  }

  prepareConfig(propertyForm) {
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


  getToolsConfig(tool) {
    // const toPrefixedId = (prefix: string, id: any) => {
    //   if (!id) return '';

    //   const str = String(id);
    //   const numeric = str.includes('-') ? str.split('-')[1] : str;

    //   return `${prefix}-${numeric}`;
    // };

    const rawId = tool?.tool_id || tool?.node_id;

    return {
      tool_id: rawId,
      name: tool?.name,
      type: tool?.node_type,

      task: tool?.config?.task || '',
      target_type: tool?.config?.target_type || '',
      target: tool?.config?.target || tool?.target,
      credential: tool?.config?.credential || tool?.credential,
      cloud_type: tool?.config?.cloud_type || '',

      description: tool?.description || tool?.desc || '',

      inputs: _clone(tool?.inputs),

      human_approval: !!tool?.human_approval,

      approval_config: tool?.human_approval
        ? {
          mode: tool?.mode ?? tool?.approval_config?.mode,
          channels: _clone(tool?.channels ?? tool?.approval_config?.channels),
          approver_groups: _clone(tool?.approver_groups ?? tool?.approval_config?.approver_groups),
          approver_users: _clone(tool?.approver_users ?? tool?.approval_config?.approver_users),
          timeout: tool?.timeout ?? tool?.approval_config?.timeout
        }
        : {}
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
      this.modalRef = this.modalService.show(this.workflowDetailsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
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
    // setTimeout(() => {
    //   if (node.type === nodeTypes.IfElse) {
    //     this.adjustNodeOutputs(nodeId);
    //   }
    // }, 0);

  }

  getLatestNodeIdForAITools() {
    let ids = [];
    if (this.workFlowData) {
      this.workFlowData?.nodes?.forEach(node => {
        if (node?.node_type === nodeTypes.AIAgent && node?.config?.tools?.length) {
          node?.config?.tools?.forEach(t => {
            ids.push(Number(t?.tool_id?.split('-')[1]))
          });
        }
      });
      if (this.toolsArr?.length) {
        this.toolsArr.flatMap(tgroup => tgroup.data || [])?.forEach(tool => {
          ids.push(Number(tool?.tool_id?.split('-')[1]) || Number(tool?.node_id?.split('-')[1]))
        });
      }
    }
    // FIX: remove NaN + duplicates + proper numeric max
    ids = ids.filter(id => !isNaN(id));
    const uniqueIds = [...new Set(ids)];

    return uniqueIds.length ? Math.max(...uniqueIds) : 0;
  }

  getTemplateDetailsByTask(node: NodeDataModel, nodeId?: any) {
    const isToolId = typeof nodeId === 'string';
    const lastToolId = this.getLatestNodeIdForAITools();

    if (isToolId && this.workFlowData) {
      nodeId = lastToolId ? `tool-${lastToolId + 1}` : nodeId;
    }

    console.log('??????????????????', lastToolId, nodeId);

    this.spinner.start('main');

    this.svc.getTemplatesByTaskId(node.uuid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.taskDetails = res;

        console.log('tools in task>>>>', this.toolsArr, nodeId);
        console.log('nodes in task>>>>', this.nodeDetailsArr, nodeId);

        const nodeExistsInNodes = this.nodeDetailsArr.some(n => n.node_id === nodeId);
        const nodeExistsInTools = this.toolsArr.some(t =>
          t?.data?.some(n => n?.tool_id === nodeId || n?.node_id === nodeId)
        );

        if (!nodeExistsInNodes && !nodeExistsInTools) {
          if (isToolId) {
            this.setNodeDetails(node, nodeId.split('-')[1]);
          } else {
            this.setNodeDetails(node, nodeId);
          }

          console.log('tools in task>>>>', this.toolsArr, nodeId);

          const allToolNodes = this.toolsArr.flatMap(t => t?.data || []);

          const currentNode =
            allToolNodes.find(n => n?.tool_id === nodeId || n?.node_id === nodeId) ||
            this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId));

          if (currentNode) {
            currentNode.inputs = _clone(this.taskDetails.inputs);
            currentNode.config.target_type = this.taskDetails.target_type;

            if (this.taskDetails.target_type === 'Cloud') {
              currentNode.config.cloud_type = this.taskDetails?.config?.cloud_type;
            }

            if (this.taskDetails.target_type === 'Host') {
              // currentNode.config.target = '';
              // currentNode.config.credential = '';
            }

            currentNode.description = this.taskDetails?.description;
          }
        }

        const allToolNodes = this.toolsArr.flatMap(t => t?.data || []);

        this.selectedNode =
          allToolNodes.find(n =>
            (n?.tool_id === nodeId || `tool-${n?.tool_id}` === nodeId) ||
            (n?.node_id === nodeId || `tool-${n?.node_id}` === nodeId)
          ) ||
          this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId));

        this.getConnectedNodeDetails(nodeId);
        this.openNodeModal(nodeId);
        this.spinner.stop('main');

      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
      });
  }


  getDetailsOfSelectedSourceTask(node: NodeDataModel, nodeId?: any) {
    const isToolId = typeof nodeId === 'string' ? true : false;
    const lastToolId = this.getLatestNodeIdForAITools();

    if (isToolId && this.workFlowData) {
      nodeId = lastToolId ? `tool-${lastToolId + 1}` : `tool-${nodeId}`;
    }

    this.spinner.start('main');

    this.svc.getSourceTaskDetails(node.uuid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {

        const nodeExistsInNodes = this.nodeDetailsArr.some(n => n.node_id === nodeId);
        const nodeExistsInTools = this.toolsArr.some(t =>
          t?.data?.some(n => n?.tool_id === nodeId || n?.node_id === nodeId)
        );

        if (!nodeExistsInNodes && !nodeExistsInTools) {
          if (isToolId) {
            this.setNodeDetails(node, nodeId.split('-')[1]);
          } else {
            this.setNodeDetails(node, nodeId);
          }

          const allToolNodes = this.toolsArr.flatMap(t => t?.data || []);

          const currentNode =
            allToolNodes.find(n => n?.tool_id === nodeId || n?.node_id === nodeId) ||
            this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId));

          if (currentNode) {
            currentNode.inputs = _clone(res?.inputs);
            currentNode.description = res?.description;
          }
        }

        const allToolNodes = this.toolsArr.flatMap(t => t?.data || []);

        this.selectedNode =
          allToolNodes.find(n =>
            (n?.tool_id === nodeId || `tool-${n?.tool_id}` === nodeId) ||
            (n?.node_id === nodeId || `tool-${n?.node_id}` === nodeId)
          ) ||
          this.nodeDetailsArr.find(n => Number(n.node_id) === Number(nodeId));

        this.getConnectedNodeDetails(nodeId);
        this.openNodeModal(nodeId);
        this.spinner.stop('main');

      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
      });
  }

  handleNodeRemove(nodeId: number) {
    const nodeIndex = this.nodeDetailsArr.findIndex(n => n.node_id === Number(nodeId));
    if (nodeIndex !== -1) {
      this.nodeDetailsArr.splice(nodeIndex, 1);
    }
  }

  saveWorkFlow() {
    const hasNodeErrors  = this.nodeDetailsArr?.some(node => this.hasAnyErrors(node.formErrors)) ?? false;
    const hasToolErrors = this.toolsArr?.some(group => group?.data?.some(tool => tool?.hasErrors )) ?? false;
    console.log(this.toolsArr, "Tools Arr")
    if (hasNodeErrors  || hasToolErrors) {
      this.notification.error(new Notification('Workflow cannot be saved due to configuration errors in one or more nodes.'));
      return
    }
    if (!this.validateAgentTimeouts()) return;
    console.log('Drawflow data', this.editor.export());
    const workflowPayload = this.buildWorkflowPayload(
      this.workflowDetailsForm.getRawValue(),
      this.nodeDetailsArr,
      this.mapConnectionsForApi(this.connectionList)
    );
    const workflowId = this.workFlowId ? this.workFlowId : '';

    if (this.workFlowId) {
      this.svc.saveWorkFlow(workflowPayload, this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.manageCeleryTaskData(workflowId, this.workflowDetailsForm.get('name').value, res.task_id);
        this.router.navigate(['../../../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update Workflow'));
      });
    } else {
      this.svc.saveWorkFlow(workflowPayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.manageCeleryTaskData(workflowId, this.workflowDetailsForm.get('name').value, res.task_id);
        this.router.navigate(['../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to create Workflow'));
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
      this.storage.put('workflowsInProgress', _clone(this.workflowsInProgress), StorageType.SESSIONSTORAGE);
    }
    if (!this.workFlowId) {
      this.notification.success(new Notification('Workflow creation in progress..'));
    } else {
      this.notification.success(new Notification('Workflow updation in progress..'));
    }
    this.goBack();
  }

  buildWorkflowPayload(workflowMeta: any, nodeDetailsArr: any[], connections: any[]) {
    this.nodeDetailsArr.forEach(node => {
      const drawflowNode = this.editor.getNodeFromId(node.node_id);
      node.pos_x = drawflowNode.pos_x;
      node.pos_y = drawflowNode.pos_y;
      if (node.node_type === nodeTypes.Loop) {
        this.buildLoopNodeAllConnectedChildren(node.node_id, 2);
      }
    });

    console.log('node Details after loop>>>>>>>>>', this.nodeDetailsArr)

    return {
      name: workflowMeta?.name || "",
      description: workflowMeta?.description || "",
      enabled: true,
      version: 1,
      ...this.workflowVarsData,
      // Nodes transformation
      nodes: nodeDetailsArr.map(node => ({
        name: node.name,
        node_id: node.node_id,
        node_type: node.node_type,
        type_version: 1,
        pos_x: node?.pos_x,
        pos_y: node?.pos_y,
        config: node.config || {},

        // Inputs & Outputs
        inputs: (node.inputs || []).map(input => ({
          param_name: input.param_name ?? input.field_name,
          default_value: input.default_value,
          param_type: input.param_type
        })),
        outputs: (node.outputs || []).map(output => ({
          param_name: output.param_name,
          expression_type: output.expression_type,
          expression: output.expression
        })),

        // ...(node.node_type === nodeTypes.Loop && {
        //   children: this.formatChildren(node)
        // })
      })),

      // Connections transformation
      connections: connections.map(conn => ({
        source_node_id: conn.source_node_id,
        source_output: conn.source_output,
        target_node_id: conn.target_node_id,
        target_input: conn.target_input
      }))
    };
  }

  // formatChildren(loopNode) {
  //   let formattedChildren = loopNode?.children?.map(ln => ({
  //     name: ln.name,
  //     node_id: ln.node_id,
  //     node_type: ln.node_type,
  //     type_version: 1,
  //     pos_x: ln?.pos_x,
  //     pos_y: ln?.pos_y,
  //     config: ln.config || {},

  //     // Inputs & Outputs
  //     inputs: (ln.inputs || []).map(input => ({
  //       param_name: input.param_name ?? input.field_name,
  //       default_value: input.default_value,
  //       param_type: input.param_type
  //     })),
  //     outputs: (ln.outputs || []).map(output => ({
  //       param_name: output.param_name,
  //       expression_type: output.expression_type,
  //       expression: output.expression
  //     })),

  //     ...(ln.node_type === nodeTypes.Loop && {
  //       children: ln.children || []
  //     })
  //   }));

  //   return formattedChildren;
  // }


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
      output_id: Number(conn.source_node_id),   // Drawflow output node ID
      output_class: conn.source_output,         // output slot
      input_id: Number(conn.target_node_id),    // Drawflow input node ID
      input_class: conn.target_input            // input slot
    }));
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

  getHtmlForNodes(node: any, nodeId?: number): string {
    // const statusFa = node?.hasErrors ? 'fas fa-exclamation-circle text-danger' : 'fas fa-check-circle text-success'; // [web:39][web:193]
    // const statusName = node?.hasErrors ? 'Validation errors' : 'OK'; // [web:39]
    const isTriggerNode =
      node.type === nodeTypes.ManualTrigger ||
      node.type === nodeTypes.ScheduleTrigger ||
      node.type === nodeTypes.OnChatMessageTrigger ||
      node.type === nodeTypes.ItsmTrigger || node.type === nodeTypes.WebhookTrigger ||
      node.type === nodeTypes.AimlEventTrigger;

    const boxClass = node.type === nodeTypes.Switch
      ? 'node-box switch-case'
      : node.type === nodeTypes.LLM
        ? 'node-box llm'
        : node.type === nodeTypes.AIAgent
          ? 'node-box aiagent'
          : node.type === nodeTypes.Loop ? 'node-box loop' : 'node-box';

    const iconClass = node.type === nodeTypes.LLM ? 'node-center-icon-llm' : 'node-center-icon-ai';
    const statusFa = this.hasRealTimeData ? this.getStatusFaClass(node.status) : '';

    if (this.droppedAsTool) {
      const createdNodeId = nodeId;

      setTimeout(() => {
        this.editor.removeNodeId(`node-${createdNodeId}`);
      }, 0);

      return ''; // prevent rendering tool node
    }

    // --- AI / LLM nodes logic (as in my previous message) ---
    if (node.type === nodeTypes.AIAgent || node.type === nodeTypes.LLM) {
      const modelValue = node?.config?.model?.llm_integ || '';
      const memoryEnabled = node?.config?.enable_memory === true;
      if (node.type === nodeTypes.AIAgent) {
        return `
        <div class="agentic-custom-node" id="node-${nodeId}">
          <div class="node-actions-agentic"
               onclick="event.stopPropagation();"
               onmousedown="event.stopPropagation();"
               onmouseup="event.stopPropagation();">
             <i class="fas fa-play action test"
               title="Test"></i>
             <i class="fas fa-pen action edit"
               title="Edit"></i>
             <i class="fas fa-trash action delete"
               title="Delete"></i>
          </div>
          <div class="node-box ainode">
            <!-- Header -->
            <div class="node-header">
                <div class="node-center-icon-ai">
                    <img src="static/assets/images/external-brand/workflow/AIAgent.svg">
                </div>
                <span class="node-title">AI Agent</span>
                ${statusFa ? `
                <span class="status-icon">
                  ${statusFa.includes('fa-spinner') ? `<i class="${statusFa}" style="float: right"></i>` : ''}
                  ${!statusFa.includes('fa-spinner') ? `<i class="${statusFa} pr-1 pt-1" style="float: right"></i>` : ''}
                </span>
                ` : ''}
              <div class="node-status-right">
                <span class="node-status" title="${node.hasErrors ? 'Validation errors' : 'All required fields are filled up!'}">
                  <i class="${node.hasErrors ? 'fas fa-exclamation-triangle text-warning' : ''}"></i>
                </span>
              </div>
            </div>

            <!-- Config Row -->
            <div class="row">

                <div class="col-8">
                    <span class="config-label">Model</span>
                    <select class="form-control text-dark model-select"
                        style="border-radius: 20px"
                        onchange="window.onModelChange(${nodeId}, this)">
                        <option value="">Select Model</option>
                        <option value="UnityOne AI" ${modelValue === 'UnityOne AI' ? 'selected' : ''}>
                          UnityOne AI
                        </option>
                      </select>
                </div>

                <div class="col-4 memory-col">
                    <span class="config-label">Memory</span>
                    <img class="memory-icon"
                        data-enabled="${memoryEnabled}"
                        onclick="window.toggleMemoryIcon(${nodeId}, this)"
                        src="${memoryEnabled ? environment.assetsUrl + 'external-brand/workflow/memory_enabled.svg'
            : environment.assetsUrl + 'external-brand/workflow/memory_disabled.svg'}"/>
                </div>

            </div>

            <!-- Tools Section -->
            <div class="tools-container"></div>

            <!-- Drop Zone -->
            <div class="drop-zone"
                id="agent-drop-zone"
                ondragover="event.preventDefault()"
                ondrop="window.handleAgentDrop(event, ${nodeId})">
                Drop tools here
            </div>

          </div>
        </div>`;
      }

      if (node.type === nodeTypes.LLM) {
        return `
        <div class="agentic-custom-node" id="node-${nodeId}">
          <div class="node-actions-llm"
              onclick="event.stopPropagation();"
              onmousedown="event.stopPropagation();"
              onmouseup="event.stopPropagation();">
            <i class="fas fa-play action test"
              title="Test"></i>
            <i class="fas fa-pen action edit"
              title="Edit"></i>
            <i class="fas fa-trash action delete"
              title="Delete"></i>
          </div>
          <div class="node-box llm">
            <div class="icon-and-title">
              <div class="${iconClass}">
                <img src="${this.svc.getCenterImageUrl(node.type)}" loading="eager"/>
              </div>
              <span> LLM </span>
              ${statusFa ? `
              <span class="status-icon">
                ${statusFa.includes('fa-spinner') ? `<i class="${statusFa}" style="float: right"></i>` : ''}
                ${!statusFa.includes('fa-spinner') ? `<i class="${statusFa} pr-1 pt-1" style="float: right"></i>` : ''}
              </span>
              ` : ''}
              <div class="node-status-right">
                <span class="node-status" title="${node.hasErrors ? 'Validation errors' : 'All required fields are filled up!'}">
                  <i class="${node.hasErrors ? 'fas fa-exclamation-triangle text-warning' : ''}"></i>
                </span>
              </div>
            </div>  
            <div class="row m-0 p-0 mt-2">              
              <div class="col-12">
                      <span class="config-label">Model</span>
                      <select class="form-control text-dark model-select"
                          style="border-radius: 20px"
                          onchange="window.onModelChange(${nodeId}, this)">
                          <option value="">Select Model</option>
                          <option value="UnityOne AI" ${modelValue === 'UnityOne AI' ? 'selected' : ''}>
                            UnityOne AI
                          </option>
                        </select>
              </div>
            </div>
          </div>
          <div class="node-label">${node.name}</div>
        </div>
      `;
      }
    }

    // --- Other nodes (Triggers, Switch, Normal) ---
    return `
    <div class="${isTriggerNode ? 'agentic-custom-node type-trigger' : 'agentic-custom-node'}" id="node-${nodeId}">
      <div class="node-actions"
          onclick="event.stopPropagation();"
          onmousedown="event.stopPropagation();"
          onmouseup="event.stopPropagation();">
        <i class="fas fa-play action test"
            title="Test"></i>
        <i class="fas fa-pen action edit"
          title="Edit"></i>
        <i class="fas fa-trash action delete"
          title="Delete"></i>
      </div>
    <div class="node-wrapper">
        <div class="${boxClass}">
          ${isTriggerNode ? `
            <div class="node-left-icon">
              <img src="${environment.assetsUrl}external-brand/workflow/OrangeTrigger.svg" loading="eager"/>
            </div>` : ''
      }
          ${statusFa ? `
            <span>
              ${statusFa.includes('fa-spinner') ? `<i class="${statusFa}" style="float: right"></i>` : ''}
              ${!statusFa.includes('fa-spinner') ? `<i class="${statusFa} pr-1 pt-1" style="float: right"></i>` : ''}
            </span>
            ` : ''}
          <div class="node-status-right">
            <span class="node-status" title="${node.hasErrors ? 'Validation errors' : 'All required fields are filled up!'}">
              <i class="${node.hasErrors ? 'fas fa-exclamation-triangle text-warning' : ''}"></i>
            </span>
          </div>
          <div class="node-center-icon">
            <img src="${this.svc.getCenterImageUrl(node.type)}" loading="eager" />
          </div>
        </div>
      </div>
      <div class="node-label">${node.name}</div>
    </div>
  `;

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
            <img src="${this.svc.getCenterImageUrl(tool.node_type || tool.type)}" loading="eager" />
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
  }

  removeTool(toolId: number, agentNodeId: number) {

    const getId = (val: any) =>
      val?.includes?.('-') ? val : `tool-${val}`;

    const toolKey = `tool-${toolId}`;

    // Remove tool ONLY from the matching agent group
    this.toolsArr.forEach(group => {

      if (group.aiNodeId !== agentNodeId) return;

      group.data = (group.data || []).filter(n =>
        getId(n.node_id) !== toolKey &&
        getId(n.tool_id) !== toolKey
      );
    });

    // Update tools for this agent only
    const currentGroup = this.toolsArr.find(g => g.aiNodeId === agentNodeId);
    const toolsToPass = currentGroup?.data || [];

    this.updateAgentTools(agentNodeId, toolsToPass);

    console.log('after removal >>>', this.toolsArr);

    // Remove from nodeDetailsArr ONLY for this agent node
    this.nodeDetailsArr.forEach(node => {

      if (node.node_id !== agentNodeId) return;

      if (node?.config?.tools) {
        node.config.tools = node.config.tools.filter(t =>
          t.node_id !== toolKey &&
          t.tool_id !== toolKey
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
        const isEnabled = !!config?.enable_memory;

        if (node) {
          node.config = {
            ...node.config,
            enable_memory: isEnabled
          };
        }

        memoryEl.src = isEnabled
          ? `${environment.assetsUrl}external-brand/workflow/memory_enabled.svg`
          : `${environment.assetsUrl}external-brand/workflow/memory_disabled.svg`;

        memoryEl.setAttribute('data-enabled', isEnabled.toString());
      }

      this.updateAgentTools(nodeId, _clone(config?.tools)) //pass this.toolsArr m aybe

    }

    //  MODEL
    const selectEl = root.querySelector('.model-select') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = config?.model?.llm_integ || '';

      if (node) {
        node.config = {
          ...node.config,
          model: {
            ...node.config?.model,
            llm_integ: config?.model?.llm_integ
          }
        };
      }
    }
  }

  /* when plus is clicked you open modal — keep mapping nodes if you need a local view */
  handlePlusClick(nodeId: string, slotIndex: number) {
    let modalToOpen = slotIndex === 0 ? 'model' : slotIndex === 1 ? 'memory' : 'tools';
    // keep your nodes array in sync with drawflow (optional)
    this.nodes = Object.values(this.editor.drawflow.drawflow.Home.data).map((n: any) => ({
      id: n.id,
      type: n?.data?.label?.type,
      name: n?.data?.label?.name,
      plusSlots: n?.data?.label?.plusSlots || []
    }));

    this.openNodeModal(Number(nodeId), modalToOpen);
  }

  fillSlot(nodeId: number, slotIndex: number, value: string | number) {
    const node = this.nodes.find(n => Number(n.id) === Number(nodeId));
    if (node) {
      node.plusSlots = node.plusSlots || [];
      if (typeof value === 'number') {
        node.plusSlots[slotIndex] = { ...node.plusSlots[slotIndex], filled: true, count: value };
      } else {
        node.plusSlots[slotIndex] = { ...node.plusSlots[slotIndex], filled: true, iconUrl: value };
      }
    }

    const nodeDetails = this.nodeDetailsArr.find(n => n.node_id === Number(nodeId));
    if (nodeDetails) {
      // nodeDetails.config = nodeDetails.config || {};
      nodeDetails.config.plusSlots = nodeDetails.config.plusSlots || [];
      if (typeof value === 'number') {
        nodeDetails.config.plusSlots[slotIndex] = { filled: true, count: value };
      } else {
        nodeDetails.config.plusSlots[slotIndex] = { filled: true, iconUrl: value };
      }
    }

    try {
      const df = this.editor.drawflow.drawflow.Home.data;
      if (df && df[nodeId]) {
        df[nodeId].data = df[nodeId].data || {};
        df[nodeId].data.label = df[nodeId].data.label || {};
        df[nodeId].data.label.plusSlots = node?.plusSlots || nodeDetails?.config?.plusSlots || [];
      }
    } catch (err) {
      console.warn('Could not sync to drawflow data:', err);
    }

    this.redrawNode(node || nodeDetails, nodeId);
  }


  redrawNode(node: any, nodeId: number) {
    // find node wrapper
    const root = this.document.getElementById(`node-${nodeId}`);
    if (!root) {
      // DOM not ready yet → retry after next tick
      setTimeout(() => this.redrawNode(node, nodeId), 0);
      return;
    }

    // for each slot update DOM
    (node?.plusSlots || []).forEach((slot: any, i: number) => {
      const slotEl = root.querySelector(`#slot-${nodeId}-${i}`) as HTMLElement;
      if (!slotEl) return;

      const existingImg = slotEl.querySelector('.slot-icon') as HTMLImageElement;
      const existingPlus = slotEl.querySelector('.plus-btn') as HTMLElement;

      if (slot.filled) {
        // remove plus button if present
        if (existingPlus) existingPlus.remove();

        // check if wrapper div already exists
        let wrapper = slotEl.querySelector('.slot-wrapper') as HTMLElement;
        if (!wrapper) {
          wrapper = this.document.createElement('div');
          wrapper.className = 'slot-wrapper';
          slotEl.appendChild(wrapper);
        } else {
          wrapper.innerHTML = ''; // clear old content if needed
        }

        if (slot.iconUrl) {
          // add or update image inside wrapper
          const img = this.document.createElement('img');
          img.className = 'slot-icon';
          img.src = slot.iconUrl;
          wrapper.appendChild(img);
        } else if (typeof slot.count === 'number') {
          // render number badge
          const badge = this.document.createElement('div');
          badge.className = 'slot-count';
          badge.textContent = String(slot.count);
          wrapper.appendChild(badge);
        }

      } else {
        // remove wrapper (and image inside) if present
        const wrapper = slotEl.querySelector('.slot-wrapper');
        if (wrapper) wrapper.remove();

        // render plus if not present
        if (!existingPlus) {
          const plus = this.document.createElement('div');
          plus.className = 'plus-btn';
          plus.textContent = '+';
          slotEl.appendChild(plus);
        }
      }
    });
  }

  hasRealTimeData(): boolean {
    return !!this.realTimeDetails?.nodes && Object.keys(this.realTimeDetails?.nodes).length > 0;
  }

  getWorkflowDetails() {
    this.spinner.start('main');
    const getId = (val: any) =>
      val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);
    this.svc.getWorkflowDetails(this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.workFlowData = res;
      this.emptyCanvas = false;
      this.toolsArr = [];

      this.workFlowData?.nodes?.forEach(n => {
        this.nodeDetailsArr.push(_clone(n));
        if (n?.node_type === nodeTypes.AIAgent) {

          this.syncNodeUI(getId(n?.node_id));

          const tools = _clone(n?.config?.tools);

          if (Array.isArray(tools) && tools.length > 0) {

            const updatedTools = tools.map(tool =>
              this.mapToolToNode(tool)
            );

            this.toolsArr.push({
              aiNodeId: n?.node_id,
              data: _clone(updatedTools)
            });
          }
        }
        if (n?.node_type === nodeTypes.LLM) {
          setTimeout(() => {
            this.nodeDetailsArr.forEach(n => {
              this.syncNodeUI(n?.node_id);
            });
          }, 0);
        }
      });
      this.workflowVarsData = {
        variables: [...this.workFlowData?.variables]
      };
      this.connectionList = this.mapConnectionsForEditApi(_clone(this.workFlowData?.connections));
      const drawflowData = this.generateDrawflowStructureEdit(this.workFlowData);
      if (this.editor) {
        this.waitForEditorAndImport(drawflowData);
        this.editor.on('import', () => {
          const getId = (val: any) =>
            val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);

          this.nodeDetailsArr.forEach(n => {
            this.syncNodeUI(getId(n?.node_id));
          });

          // Important: fix connection positions AFTER UI is applied
          requestAnimationFrame(() => {
            this.nodeDetailsArr.forEach(n => {
              this.editor.updateConnectionNodes(`node-${n.node_id}`);
            });
          });
        });
      }
      this.workflowDetailsForm.patchValue({
        name: res.name,
        description: res.description
      });
      this.workFlowViewData = this.svc.convertToWorkflowPopupViewData(res);
    });
  }

  mapToolToNode(tool) {
    return {
      name: tool.name,
      node_id: tool?.tool_id,
      node_type: tool.type,

      config: {
        task: tool.task || '',
        target_type: tool.target_type || '',
        target: tool.target || '',
        credential: tool.credential || '',
        cloud_type: tool.cloud_type || '',
      },

      inputs: tool.inputs || [],
      outputs: [],

      isTool: true,

      // keep approval OUTSIDE config
      human_approval: tool.human_approval ?? true,
      mode: tool.approval_config?.mode,
      channels: tool.approval_config?.channels || [],
      approver_groups: tool.approval_config?.approver_groups || [],
      approver_users: tool.approval_config?.approver_users || [],
      timeout: tool.approval_config?.timeout,
      description: tool?.description
    };
  }

  handleNodeExecution(clickedNode: any) {
    if (!clickedNode) return;

    this.executionMode = 'run_node';
    this.runNodeID = true;
    this.clickedNodeId = clickedNode.node_id;

    const triggerNode = this.getTriggerNode();
    const triggerStatus = this.getTriggerExecutionStatus();
    // const isConnected = this.isTriggerConnectedToNode(clickedNode.node_id);

    if (this.svc.isTriggerNode(clickedNode.node_type)) {
      this.triggerNode = clickedNode;
      this.showBeginner = true;
      this.showHelpPanel = false;
      return;
    }
    if (triggerNode && (!triggerStatus || triggerStatus === 'Failed')) {
      this.triggerNode = triggerNode;
      this.showBeginner = true;
      this.showHelpPanel = false;
      return;
    }

    this.pollForRealTimeExecution();
  }


  waitForEditorAndImport(drawflowData: any) {
    const container = document.getElementById('agentic-drawflow');

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
          Object.keys(drawflowData.drawflow.Home.data).forEach(id => {
            const nodeEl = document.getElementById(`node-${id}`);
            if (nodeEl) {
              nodeEl.addEventListener('dblclick', () => {
                this.selectedNode = this.nodeDetailsArr.find(n => n.node_id === Number(id));
                this.getConnectedNodeDetails(Number(id));
                this.openNodeModal(Number(id));
              });
            }

            // Add edit button click
            const editBtn = nodeEl.querySelector('.action.edit');
            if (editBtn) {
              editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.selectedNode = this.nodeDetailsArr.find(n => n.node_id === Number(id));
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
                const hasErrors = this.hasAnyErrors(clickedNode.formErrors);

                if (hasErrors) {
                  this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
                  return;
                }
                const triggerNode = this.getTriggerNode();
                const triggerStatus = this.getTriggerExecutionStatus();
                const isConnected = this.isTriggerConnectedToNode(clickedNode.node_id);
                if (this.svc.isTriggerNode(clickedNode.node_type)) {
                  this.triggerNode = clickedNode;
                  this.showBeginner = true;
                  this.showHelpPanel = false;
                  return;
                }
                if (triggerNode && isConnected && (!triggerStatus || triggerStatus === 'Failed')) {
                  this.triggerNode = triggerNode;
                  this.showBeginner = true;
                  this.showHelpPanel = false;
                  return;
                }
                this.pollForRealTimeExecution();
              });
            }
          });
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

  updateHasNode(): void {
    const data = this.editor?.drawflow?.drawflow?.Home?.data || {}
    this.hasNode = Object.keys(data).length > 0;
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
        status: node?.status,
        duration: node?.duration,
        outputs: [], // will be populated later
        data: {
          uniqueNodeId: node.node_id,
          label: {
            type: node.node_type,
            name: node.name,
            image: this.svc.getCenterImageUrl(node.node_type),
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
        .filter(c => c.source_node_id === node.node_id)
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
        .filter(c => c.target_node_id === node.node_id)
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

      // 4️⃣ Build Drawflow node
      const drawflowNode: DrawflowNode = {
        id: node.node_id,
        name: node.name,
        inputs,
        outputs,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
        html: this.getHtmlForNodes(node, node.node_id),
        typenode: false,
        class: 'agentic-default-node',
        data: {
          uniqueNodeId: node.node_id,
          label: {
            type: node.type,
            name: node.name,
            image: this.svc.getCenterImageUrl(node.type),
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

  openWorkflowVarModal() {
    this.modalRef = this.modalService.show(OrchestrationAgenticWorkflowVariablesComponent, {
      class: 'custom-agentic-workflow-modal-md',
      backdrop: true,                 // show dimmed backdrop
      ignoreBackdropClick: true,      // DO NOT close on outside click
      keyboard: false,
      initialState: {
        // optional: prevent ESC from closing
        workflowVarData: this.workflowVarsData,
        onClose: (formDatas: any, modalState: any) => {
          this.workflowVarsData = formDatas?.workflowVarsForm;
        }
      }
    });
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

  onFromBeginning() {
    const hasErrors = this.nodeDetailsArr?.some(node => this.hasAnyErrors(node.formErrors)) ?? false;
    console.log(hasErrors, "hasError")
    if (hasErrors) {
      this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
      return
    }
    this.executionMode = 'from_start';
    this.triggerNode = this.nodeDetailsArr.find(n => this.svc.isTriggerNode(n.node_type));
    this.showBeginner = true;
    this.showHelpPanel = false;
    this.isDropdownOpen = false;
  }

  onResume() {
    const hasErrors = this.nodeDetailsArr?.some(node => this.hasAnyErrors(node.formErrors)) ?? false;
    if (hasErrors) {
      this.notification.error(new Notification('Workflow cannot be executed due to configuration errors in one or more nodes.'));
      return
    }
    if (!this.currentSessionId) {
      this.notification.error(new Notification('No previous execution found to resume'));
      return;
    }

    this.executionMode = 'resume';

    // If trigger data needs to be updated, open panel
    const triggerExec = this.realTimeDetails?.nodes?.find(n =>
      this.svc.isTriggerNode(n.node_type)
    );

    if (triggerExec?.status === 'Failed') {
      this.triggerNode = this.nodeDetailsArr.find(n => n.node_id === triggerExec.node_id);
      this.showBeginner = true;
      this.showHelpPanel = false;
      return;
    }

    this.pollForRealTimeExecution();
  }

  pollForRealTimeExecution() {
    this.isWorkflowExecuting = true;
    this.workflowStatus = 'Started';
    const sessionId = this.currentSessionId || this.generateUUID();
    let finalPayload = this.buildRealTimePayload(this.nodeDetailsArr, this.mapConnectionsForApi(this.connectionList), sessionId);

    this.svc.postRealTimeWorkflow(finalPayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.currentSessionId = res.session_id || sessionId;
      //In case of success call  polling API with the genrated uuid.
      this.callPollingApi(this.currentSessionId);
    }, error => {
      this.isWorkflowExecuting = false;
      this.workflowStatus = 'Failed';
      this.notification.error(
        new Notification('Failed to start execution.')
      );
    });

  }


  buildRealTimePayload(nodeDetailsArr: any[], connections: any[], uuid) {
    this.nodeDetailsArr.forEach(node => {
      const drawflowNode = this.editor.getNodeFromId(node.node_id);
      node.pos_x = drawflowNode.pos_x;
      node.pos_y = drawflowNode.pos_y;
    });

    console.log('realtime connections>>>>', connections)


    return {
      // Nodes transformation
      nodes: nodeDetailsArr.map(node => ({
        name: node.name,
        node_id: node.node_id,
        node_type: node.node_type,
        type_version: 1,
        pos_x: node?.pos_x,
        pos_y: node?.pos_y,
        config: node.config || {},

        // Inputs & Outputs
        inputs: (node.inputs || []).map(input => ({
          param_name: input.param_name ?? input.field_name,
          default_value: input.default_value,
          param_type: input.param_type,
        })),
        outputs: (node.outputs || []).map(output => ({
          param_name: output.param_name,
          expression_type: output.expression_type,
          expression: output.expression
        }))
      })),


      // Connections transformation
      connections: connections.map(conn => ({
        source_node_id: conn.source_node_id,
        source_output: conn.source_output,
        target_node_id: conn.target_node_id,
        target_input: conn.target_input
      })),
      mode: this.executionMode, // add "from_start | resume | run_node",
      ...(this.runNodeID && { run_node_id: Number(this.clickedNodeId) }), // only for run_node test mode need to get the node_id on click
      session_id: uuid, // replace with generated UUid this.generatedUuid
      ...this.triggerData,
      name: this.workFlowViewData?.name,
      description: this.workFlowViewData?.description,
      ...this.workflowVarsData,
    };
  }

  callPollingApi(uuid) {
    // use the genrated uuid.
    // const req = ''I
    const getId = (val: any) =>
      val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);
    this.currentSessionId = uuid || this.currentSessionId;
    this.svc.pollRealTimeWorkflow(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data) {
        const chatUpdate: OnChatExecution = {
          status: data.status === 'Running' ? 'Running' : data.status,
          chat_response: data?.chat_response ?? ''
        };
        this.chatUpdates$.next(chatUpdate);
        this.workflowStatus = data?.status;
        if (data?.status === 'Failed') {
          this.resumeBtn = true;
        }
        if (data?.status === 'Success') {
          this.resumeBtn = false;
        }
        if (data?.status === 'Success' || data?.status === 'Failed') {
          this.isWorkflowExecuting = false
          this.getWorkflowExecutionLogs();
        } else {
          this.showExecutionLogsFlag = false;
        }
        this.realTimeDetails = _clone(data);
        let finalNodes = [];


        this.realTimeDetails.nodes.forEach(node => {
          this.nodeDetailsArr.forEach(n => {
            if (node.node_id === n.node_id) {
              finalNodes.push({
                ...n,
                status: node.status,
                duration: this.svc.formatDuration(node.duration),
                output_data: { ...node.output_data }
              });
            }
          });
        });


        // this.realTimeDetails?.nodes?.forEach(rn => {
        //   if (rn?.node_type === nodeTypes.AIAgent) {
        //     setTimeout(() => {
        //       finalNodes.forEach(n => {
        //         this.syncNodeUI(getId(n?.node_id));
        //         const tools = _clone(n?.config?.tools);

        //         // Only push if tools exist and not empty
        //         if (Array.isArray(tools) && tools.length > 0) {
        //           const updatedTools = tools.map(tool => this.mapToolToNode(tool));

        //           this.toolsArr.push({
        //             aiNodeId: n?.node_id,
        //             data: _clone(updatedTools)
        //           });

        //         }
        //       });
        //     }, 50);
        //   }
        //   if (rn?.node_type === nodeTypes.LLM) {
        //     setTimeout(() => {
        //       finalNodes.forEach(n => {
        //         this.syncNodeUI(n?.node_id);
        //       });
        //     }, 0);
        //   }
        // });





        // this.connectionList = this.mapConnectionsForApi(_clone(this.connectionList));
        this.realTimeNodeDetails = {
          connections: this.mapConnectionsForApi(this.connectionList),
          nodes: [...finalNodes]
        }

        console.log('realTime>>>', ...finalNodes)
        const drawflowData = this.generateDrawflowStructureEdit(this.realTimeNodeDetails);
        if (this.editor) {
          this.waitForEditorAndImport(drawflowData);
          // this.editor.off('import'); // prevent duplicate listeners

          this.editor.on('import', () => {
            const getId = (val: any) =>
              val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);

            finalNodes.forEach(n => {
              this.syncNodeUI(getId(n?.node_id));

              if (n?.node_type === nodeTypes.AIAgent) {
                const tools = _clone(n?.config?.tools);

                if (Array.isArray(tools) && tools.length > 0) {
                  const updatedTools = tools.map(tool => this.mapToolToNode(tool));

                  const existingIndex = this.toolsArr.findIndex(
                    t => t.aiNodeId === n.node_id
                  );

                  if (existingIndex !== -1) {
                    this.toolsArr[existingIndex].data = _clone(updatedTools);
                  } else {
                    this.toolsArr.push({
                      aiNodeId: n.node_id,
                      data: _clone(updatedTools)
                    });
                  }
                }
              }
            });
          });
        }
      }
    }, (error) => {
      this.isWorkflowExecuting = false;
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
    this.svc.getExecutionLogs(this.currentSessionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.workflowLogsViewData = this.svc.convertToExecutionLogViewData(data);
      this.showExecutionLogsFlag = true;
      this.isBottomCollapsed = false;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get execution logs for this workflow'));
    });
  }

  returnWorkflow() {
    if (this.nodeDetailsArr.length) {
      this.workflowReturnModalRef = this.modalService.show(this.confirmreturn, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    } else {
      this.goBack();
    }
  }

  confirmReturn() {
    this.workflowReturnModalRef.hide();
    this.goBack();
  }

  goBack() {
    if (this.workFlowId) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  changeZoom(direction: number) {
    if (direction === 1) {
      this.editor.zoom_in();
    } else {
      this.editor.zoom_out();
    }
  }

  resetZoom() {
    this.editor.zoom_reset();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(event: Event) {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  onTriggerSubmit(data: any) {
    this.triggerData = data;
    if (this.triggerData) {
      this.pollForRealTimeExecution();
    }
  }

  handleTestFromModal(payload: any) {
    const { nodeId, nodeType, formData } = payload;

    this.updateNodeData(nodeId, formData);

    this.executionMode = 'run_node';
    this.runNodeID = true;
    this.clickedNodeId = nodeId;

    if (this.svc.isTriggerNode(nodeType)) {
      this.triggerNode = this.nodeDetailsArr.find(n => n.node_id === nodeId);
      this.showBeginner = true;
      this.showHelpPanel = false;
      this.modalRef?.hide();
      return;
    }

    // this.modalRef?.hide();
    this.pollForRealTimeExecution();
  }


  updateNodeData(nodeId: number, formData: any) {
    const nodeIndex = this.nodeDetailsArr.findIndex(
      n => n.node_id === nodeId
    );

    if (nodeIndex > -1) {
      this.nodeDetailsArr[nodeIndex] = {
        ...this.nodeDetailsArr[nodeIndex],
        ...formData
      };
    }
  }

  stopPolling() {
    this.ngUnsubscribe.next();
    this.isWorkflowExecuting = false;
    this.showBeginner = false;
    this.workflowStatus = 'Stopped';
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
}

