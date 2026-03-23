import { Component, Input, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
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
      const drawflowData = this.generateDrawflowStructureEdit(this.workflowDetails);
      console.log('<<<<<<<<<<<<<', this.editor)
      console.log('<<<<<<<<<<<<<&&&&&&&&&&&&&', drawflowData)

      if (this.editor) {
        this.waitForEditorAndImport(drawflowData);
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
          : 'node-box';

    const iconClass = node.type === nodeTypes.LLM ? 'node-center-icon-llm' : 'node-center-icon-ai';

    const statusFa = this.getStatusFaClass(node.status);
    const statusName = node.status;
    // --- AI / LLM nodes logic (as in my previous message) ---
    if (node.type === nodeTypes.AIAgent || node.type === nodeTypes.LLM) {
      if (!node.plusSlots) {
        if (node.type === nodeTypes.AIAgent) {
          node.plusSlots = [
            { name: 'Model', filled: false, iconUrl: '' },
            { name: 'Memory', filled: false, iconUrl: '' },
            { name: 'Tools', filled: false, iconUrl: '' }
          ];
        } else {
          node.plusSlots = [{ name: 'Model', filled: false, iconUrl: '' }];
        }
      }

      const plusButtonsHtml = node.plusSlots.map((slot, index) => {
        const slotId = `slot-${nodeId}-${index}`;
        // if (!slot.filled) {
        //   return `
        //   <div class="slot-row" id="${slotId}" onclick="event.stopPropagation(); onPlusClick('${nodeId}', ${index}, event)">
        //     <span class="slot-name">${slot.name}</span>
        //     <div class="plus-btn">+</div>
        //   </div>
        // `;
        // } else {
        //   let content = '';
        //   if (slot.iconUrl) {
        //     content = `<img class="slot-icon" src="${slot.iconUrl}" />`;
        //   } else if (slot.count !== undefined) {
        //     content = `<span class="slot-count">${slot.count}</span>`;
        //   }
        //   return `
        //   <div class="slot-row" id="${slotId}" onclick="event.stopPropagation(); onPlusClick('${nodeId}', ${index}, event)">
        //     <span class="slot-name">${slot.name}</span>
        //     ${content}
        //   </div>
        // `;
        // }
        if (!slot.filled) {
          return `
            <div class="slot-row" id="${slotId}">
              <span class="slot-name">${slot.name}</span>
              <div class="plus-btn">+</div>
            </div>
          `;
        } else {
          let content = '';
          if (slot.iconUrl) {
            content = `<img class="slot-icon" src="${slot.iconUrl}" />`;
          } else if (slot.count !== undefined) {
            content = `<span class="slot-count">${slot.count}</span>`;
          }
          return `
            <div class="slot-row" id="${slotId}">
              <span class="slot-name">${slot.name}</span>
              ${content}
            </div>
          `;
        }
      }).join('');

      return `
        <div class="agentic-custom-node" id="node-${nodeId}">
          <div class="${boxClass}">
            <div class="icon-and-title">
              <div class="${iconClass}">
                <img src="${this.containerSvc.getCenterImageUrl(node.type)}" />
              </div>
              <span>${node.type === nodeTypes.AIAgent ? 'AI Agent' : 'LLM'}</span>
              <span><i class="${statusFa}" title="${statusName}"></i></span>
            </div>
            <div class="plus-buttons">
              ${plusButtonsHtml}
            </div>
          </div>
          <div class="node-label">${node.name}</div>
        </div>
      `;
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
