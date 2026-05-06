import { Component, Inject, Input, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { OrchestrationWorkflowPocService } from '../../orchestration-workflows/orchestration-workflow-poc/orchestration-workflow-poc.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Drawflow from 'drawflow';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { OrchestrationWorkflowCrudUtilsService } from '../../orchestration-workflows/orchestration-workflow-crud/orchestration-workflow-crud.utils.service';
import { WorkflowLogDetails } from '../orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.type';
import { TaskArrayModel } from '../../orchestration-workflows/orchestration-workflow-poc/orchestration-workflow-poc.type';
import { DrawflowNode, NodeDetailsArrayModel, nodeTypes } from '../../orchestration-workflows/orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.type';
import { OrchestrationAgenticWorkflowContainerService } from '../../orchestration-workflows/orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.service';
import { environment } from 'src/environments/environment';
import { cloneDeep as _clone } from 'lodash-es';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'orchestration-execution-logs-new-workflow-widget',
  templateUrl: './orchestration-execution-logs-new-workflow-widget.component.html',
  styleUrls: ['./orchestration-execution-logs-new-workflow-widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrchestrationExecutionLogsNewWorkflowWidgetComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  editor: Drawflow;
  isRightSidebarOpen = false;
  isOpenTaskName: boolean = false;
  isOpenInputParam: boolean = false;
  isOpenOutputParam: boolean = false;
  isOpenTriggerRule: boolean = false;
  isOpenConfiguration: boolean = false;
  workFlowId: string;
  workFlowData;
  private selectedNode: HTMLElement | null = null;
  private selectedIfConditionNode: HTMLElement | null = null;
  private selectedSwitchConditionNode: HTMLElement | null = null;
  currentCriteria: SearchCriteria;
  conditionArr = [];
  taskDetailsArr = [];
  selectedCategory: string;
  selectedTask: TaskArrayModel;
  selectedTaskImg: string;
  paramDropList = [];
  connectionList = [];
  selectedCondition;
  showTaskDetails: boolean = false;
  showConditionDetails: boolean = false;
  @Input() workflowDetails: WorkflowLogDetails;
  taskCounter = 0;
  conditionCounter = 0;
  noOfOutputNode: number;
  showIfConditionDetails: boolean = false;
  showSwitchConditionDetails: boolean = false;
  formattedTask = [];
  isAgentic = false;
  nodeDetailsArr = [];
  dummyJson = {
    "uuid": "476cfa56-8e76-4e37-967c-d1d15db111bf",
    "workflow": "8577d68a-ecb9-4973-872e-556d4c9ca33f",
    "workflow_name": "GCP VM Provisioning (gpu_instance) - Create new user",
    "run_id": "UL-M2509100915552895",
    "start_time": "2025-09-10T02:15:55.229153-07:00",
    "end_time": "2025-09-10T02:18:34.260961-07:00",
    "duration": "00:02:39.031808",
    "status": "Success",
    "executed_by": "Virendra Sing",
    "nodes_execution": [
      {
        "name": "AI Agent",
        "node_id": 2,
        "node_type": "AI Agent",
        "type_version": 1,
        "pos_x": 440.100006103516,
        "pos_y": 119.625,
        status: "Success",
        "config": {
          "system_prompt": "rtg",
          "settings": {
            "retries": 0,
            "timeout": 3600
          },
          "memory": {
            "type": "Simple Memory"
          },
          "model": {
            "llm_integ": "default"
          },
          "tools": [
            {
              "credential": "6d827412-2d11-4d42-b53c-2bd811a15cea",
              "target_type": "Host",
              "type": "Ansible Playbook",
              "name": "13.Stop Service - Linux",
              "target": "ghbg"
            }
          ],
          "user_prompt": "gtgrt"
        },
        "inputs": [],
        "outputs": []
      },
      {
        "name": "Manual",
        "node_id": 1,
        "node_type": "Manual Trigger",
        "type_version": 1,
        "pos_x": 249.100006103516,
        "pos_y": 140.625,
        "config": {},
        status: "Failure",
        "inputs": [
          {
            "default_value": "gfhf",
            "param_name": "gfbf",
            "param_type": "Password"
          }
        ],
        "outputs": []
      }
    ],
    "connections": [
      {
        "source_node_id": 1,
        "source_output": "output_1",
        "target_node_id": 2,
        "target_input": "input_1"
      }
    ]
  };

  constructor(
    @Inject(DOCUMENT) private document,
    private svc: OrchestrationWorkflowPocService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private spinner: AppSpinnerService,
    private crudSvc: OrchestrationWorkflowCrudUtilsService,
    private containerSvc: OrchestrationAgenticWorkflowContainerService
  ) {
    this.currentCriteria = { searchValue: '', pageSize: 0 };
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workFlowId = params.get('id');
    });
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        if (params['isAgentic'] !== undefined) {
          this.isAgentic = JSON.parse(params['isAgentic']);
          console.log(this.isAgentic);
        }
      });

  }

  ngOnInit(): void {
    this.initializeDrawflow();
  }

  initializeDrawflow() {
    const container = document.getElementById('drawflow') as HTMLElement;
    this.editor = new Drawflow(container);
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
    this.editor.editor_mode = 'view';
    this.getWorkflowDetails();
  }

  getWorkflowDetails() {
    if (this.isAgentic) {
      // this.workflowDetails.nodes_execution.forEach(val => {
      //   this.nodeDetailsArr.push(val);
      // });
      // this.connectionList = this.mapConnectionsForEditApi(_clone(this.workFlowData?.connections));
      // this.workflowDetails = _clone(this.dummyJson)
      const getId = (val: any) =>
        val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);
      this.workflowDetails?.nodes_execution?.forEach((n: any) => {
        if (n?.node_type === nodeTypes.AIAgent) {
          setTimeout(() => {
            this.syncNodeUI(getId(n?.node_id));

          }, 0);
        }
        if (n?.node_type === nodeTypes.LLM) {
          setTimeout(() => {
            this.workflowDetails?.nodes_execution?.forEach((n: any) => {
              this.syncNodeUI(n?.node_id);
            });
          }, 0);
        }
      });
      const drawflowData = this.generateDrawflowStructureEdit(this.workflowDetails);
      console.log('<<<<<<<<<<<<<', this.editor)
      console.log('<<<<<<<<<<<<<&&&&&&&&&&&&&', drawflowData)

      if (this.editor) {
        this.waitForEditorAndImport(drawflowData);
        this.editor.on('import', () => {
          const getId = (val: any) =>
            val?.includes?.('-') ? Number(val.split('-')[1]) : Number(val);

          this.workflowDetails?.nodes_execution?.forEach((n: any) => {
            this.syncNodeUI(getId(n?.node_id));
          });

          // Important: fix connection positions AFTER UI is applied
          requestAnimationFrame(() => {
            this.workflowDetails?.nodes_execution?.forEach((n: any) => {
              this.editor.updateConnectionNodes(`node-${n.node_id}`);
            });
          });
        });
      }
    } else {
      this.editor.import(this.workflowDetails.design_data);
      this.workflowDetails.tasks_execution.forEach(val => {
        setTimeout(() => {
          // Object.values(this.editor.drawflow.drawflow.Home.data).forEach((node: any) => {
          if (val.name_id === 'task_1' || val.name_id === 'task_2') {
            return;
          } else {
            // const html = node.html;
            // const nodeDomId = this.extractIdFromHtml(html);
            const nodeElement = document.getElementById(val.name_id);
            if (nodeElement) {
              const headerElement = nodeElement.querySelector('.node-header') as HTMLElement;
              if (val.execution_status == 'Success') {
                headerElement.style.backgroundColor = '#83dfae';
                headerElement.style.color = '#29945b';
                nodeElement.style.border = '1px solid #29945b';
              } else if (val.execution_status == 'Failed' || val.execution_status == 'Cancelled') {
                headerElement.style.backgroundColor = '#ffa1a1';
                headerElement.style.color = '#b72525';
                nodeElement.style.border = '1px solid #b72525';
              } else if (val.execution_status == 'Skipped') {
                headerElement.style.backgroundColor = '#ffe9a1';
                headerElement.style.color = '#856404';
                nodeElement.style.border = '1px solid #856404';
              } else if (val.execution_status == 'Queued') {
                headerElement.style.backgroundColor = '#e0e0e0';
                headerElement.style.color = '#4a4a4a';
                nodeElement.style.border = '1px solid #a0a0a0';
              } else {
                headerElement.style.backgroundColor = '#a1c8ff';
                headerElement.style.color = '#256fb7';
                nodeElement.style.border = '1px solid #256fb7';
              }
            }
          }
        })
      }, 100)
    }

    // });

    this.spinner.stop('main');
  }

  waitForEditorAndImport(drawflowData: any) {
    const container = document.getElementById('drawflow');

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
      case 'Skipped': return 'fas fa-clock text-warning';
      case 'Queued': return 'fas fa-clock text-muted';
      case 'Started': return 'fas fa-check-circle text-success';
      case 'Canceled': return 'fas fa-exclamation-circle text-danger';
      case 'Running': return 'fas fa-spinner text-primary';
      default: return 'fas fa-circle text-primary'; // neutral dot
    }
  }

  getFormattedTaskListEdit(workflowData): any[] {
    console.log(workflowData)
    this.formattedTask = workflowData.nodes_execution.map(node => {
      return {
        id: node.node_id,
        name: node.name,
        type: node.node_type,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
        node_id: node.node_id,
        status: node.status,
        outputs: [], // will be populated later
        data: {
          uniqueNodeId: node.node_id,
          label: {
            type: node.node_type,
            name: node.name,
            image: this.containerSvc.getCenterImageUrl(node.node_type),
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

    console.log('>>>>>>>>>>', nodes);

    console.log('>>>>>>>>>><<<<<<<<', connections);


    nodes.forEach(node => {
      const outputs: any = {};
      const inputs: any = {};

      // Build outputs from connections
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
            image: this.containerSvc.getCenterImageUrl(node.type),
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

  getHtmlForNodes(node: any, nodeId?: number): string {
    const isTriggerNode =
      node.type === nodeTypes.ManualTrigger ||
      node.type === nodeTypes.ScheduleTrigger ||
      node.type === nodeTypes.OnChatMessageTrigger;

    const boxClass = node.type === nodeTypes.Switch
      ? 'node-box switch-case'
      : node.type === nodeTypes.LLM
        ? 'node-box llm'
        : node.type === nodeTypes.AIAgent
          ? 'node-box aiagent'
          : node.type === nodeTypes.Loop ? 'node-box loop' : 'node-box';

    const iconClass = node.type === nodeTypes.LLM ? 'node-center-icon-llm' : 'node-center-icon-ai';
    const statusFa = this.getStatusFaClass(node.status);
    const statusName = node.status;
    // --- AI / LLM nodes logic (as in my previous message) ---
    if (node.type === nodeTypes.AIAgent || node.type === nodeTypes.LLM) {

      // --- AI / LLM nodes logic (as in my previous message) ---
      if (node.type === nodeTypes.AIAgent || node.type === nodeTypes.LLM) {
        const modelValue = node?.config?.model?.llm_integ || '';
        const memoryEnabled = node?.config?.enable_memory === true;
        if (node.type === nodeTypes.AIAgent) {
          return `
        <div class="agentic-custom-node" id="node-${nodeId}">
          <div class="node-box ainode">
            <!-- Header -->
            <div class="node-header">
                <div class="node-center-icon-ai">
                    <img src="static/assets/images/external-brand/workflow/AIAgent.svg">
                </div>
                <span class="node-title">AI Agent</span>
                <span><i class="${statusFa}" title="${statusName}"></i></span>
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
                <img src="${this.containerSvc.getCenterImageUrl(node.type)}" loading="eager"/>
              </div>
              <span> LLM </span>
              <span><i class="${statusFa}" title="${statusName}"></i></span>
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
    }

    // --- Other nodes (Triggers, Switch, Normal) ---
    return `
      <div class="${isTriggerNode ? 'agentic-custom-node type-trigger' : 'agentic-custom-node'}" id="node-${nodeId}">
        <div class="node-wrapper">
          <div class="${boxClass}">
            ${isTriggerNode ? `
              <div class="node-left-icon">
                <img src="${environment.assetsUrl}external-brand/workflow/OrangeTrigger.svg" />
              </div>` : ''
      }
              <span><i class="${statusFa} pr-1 pt-1" style="float: right"></i></span>
            <div class="node-center-icon">
              <img src="${this.containerSvc.getCenterImageUrl(node.type)}" />
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

      return `<div class="tool-chip" data-node-id="${id}">
          <div class="tool-delete-icon">×</div>

          <div class="tool-icon">
            <img src="${this.containerSvc.getCenterImageUrl(tool.node_type || tool.type)}" loading="eager" />
          </div>

          <span class="tool-name">${tool.name}</span>
        </div>`;
    }).join('');

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


  }


  syncNodeUI(nodeId: number) {
    const root = this.document.getElementById(`node-${nodeId}`);
    if (!root) {
      setTimeout(() => this.syncNodeUI(nodeId), 0);
      return;
    }

    const node: any = this.workflowDetails?.nodes_execution?.find((n: any) => n.node_id === Number(nodeId));
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


  extractIdFromHtml(html: string): string | null {
    const match = html.match(/id="([^"]+)"/);
    return match ? match[1] : null;
  }

  closeTaskDetails() {
    this.renderer.setStyle(document.getElementById('task-details-card'), "width", '0%');
    this.showTaskDetails = false;
    this.selectedTask = null;
  }

  toggleTaskNameAccordion() {
    this.isOpenTaskName = !this.isOpenTaskName;
  }

  toggleInputParamAccordion() {
    this.isOpenInputParam = !this.isOpenInputParam;
  }

  toggleOutputParamAccordion() {
    this.isOpenOutputParam = !this.isOpenOutputParam;
  }

  toggleTriggerRule() {
    this.isOpenTriggerRule = !this.isOpenTriggerRule;
  }

  toggleConfiguration() {
    this.isOpenConfiguration = !this.isOpenConfiguration;
  }

  // toggleConditionsAccordion() {
  //   this.isOpenConditions = !this.isOpenConditions;
  // }

}
