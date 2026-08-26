import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  NodeDetailsArrayModel,
  nodeTypes,
} from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.type';
import {
  cloudAttributes,
  WfDynamicParamsService,
} from './wf-dynamic-params.service';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { cloneDeep as _clone } from 'lodash-es';
import { TitleCasePipe } from '@angular/common';
import { AimlRulesService } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.service';
import { UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { WfDynamicContainerService } from '../wf-dynamic-container/wf-dynamic-container.service';
import { aimlTriggerData, ApiField, ApiSchema, ApiTab, ApiValidator, ApiVisibleWhen, chatData, DynamicField, DynamicSchema, DynamicTab, DynamicValidator, DynamicVisibleWhen, itsmTriggerData, manualData, scheduleData, taskNodeData, webhookData } from './wf-dynamic-params.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { QueryBuilderConfig, QueryBuilderClassNames, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { queryBuilderClassNames } from 'src/app/unity-setup/unity-setup-notification-group/unity-setup-notification-group-crud/unity-setup-notification-group-crud.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CONDITION_SUB_FIELDS_CONFIG, CONDITION_VALIDATION_MESSAGES, DATA_TYPE_OPTIONS, DataType, DynamicFieldMeta, getDefaultOperator, getValueInputKind, isGroupComplete, normalizeDataType, OPERATORS_BY_DATA_TYPE, resolveEndpointTemplate, SelectOption } from './condition-builder.constants';
@Component({
  selector: 'wf-dynamic-params',
  templateUrl: './wf-dynamic-params.component.html',
  styleUrls: ['./wf-dynamic-params.component.scss'],
  providers: [WfDynamicParamsService, AimlRulesService],
})
export class WfDynamicParamsComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  contextVarHeader: boolean = false;
  middlePanelLogo: string = '';
  onClose!: (data: any, modalState?: { action?: 'save' | 'test' }) => void;
  updatedFormDatas: any;

  cloudAccount: any;
  credentials: any;

  createTicketForm!: FormGroup;

  updateTicketForm!: FormGroup;

  commentInTicketForm!: FormGroup;

  getTicketForm!: FormGroup;

  contextVars = [
    { key: 'workflow_id', value: '{{ sys.workflow_id }}' },
    { key: 'workflow_name', value: '{{ sys.workflow_name }}' },
    { key: 'execution_id', value: '{{ sys.execution_id }}' },
    { key: 'execution_user', value: '{{ sys.execution_user }}' },
    { key: 'now', value: "{{ now | strftime('%Y-%m-%d %H:%M:%S') }}" },
    { key: 'today', value: "{{ today | strftime('%Y-%m-%d') }}" },
    {
      key: 'yesterday',
      value: "{{ (today - timedelta(days=1)) | strftime('%Y-%m-%d') }}",
    },
  ];

  private readonly minSidePanelWidth = 240;
  private readonly defaultOutputPanelWidth = 360;
  private readonly maxSidePanelWidth = 540;
  private readonly minMiddlePanelWidth = 360;

  activeTab;
  nodeId: number;
  nodeData: NodeDetailsArrayModel;
  connectedNodes = [];
  modalName: string;
  accordionState: { [nodeId: number]: boolean } = {};
  propertiesForm: FormGroup;
  isPromptExpanded = false;
  inputPanelWidth = this.minSidePanelWidth;
  outputPanelWidth = this.defaultOutputPanelWidth;
  collapsedPanelWidth = 38;
  inputPanelCollapsed = false;
  outputPanelCollapsed = false;
  expandedLabel;
  expandedFormControlName;
  tableListOptions = [];
  getTicketKeyList = [];
  commentFieldsList = [];
  updateTicketList = [];
  realTimeData;
  nodeOutput;
  workflowVarsData;
  workflowVarHeader: boolean = false;
  aimlData;
  triggerTypes = [
    'Manual Trigger',
    'Schedule Trigger',
    'Chat Trigger',
    'ITSM Event Trigger',
    'Webhook Trigger',
    'AIML Event Trigger'
  ];

  userGroups: UserGroupType[] = [];
  userList: string[] = [];

  private resizingSidePanel: 'input' | 'output' | null = null;
  private resizeStartX = 0;
  private resizeStartWidth = 0;

  nodeForm: FormGroup = this.fb.group({});
  dynamicSchema: DynamicSchema = { tabs: [] };
  isSchemaLoading = false;
  schemaLoadError = '';

  formErrors: any = {};
  validationMessages: any = {};

  initialValues: Record<string, any> = {};
  private subscriptions: Subscription[] = [];
  dynamicOptionStore: Record<string, Array<{ label: string; value: any }>> = {};
  dynamicOptionLoading: Record<string, boolean> = {};

  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;
  tagsAutocompleteItems: string[] = [];
  currentRuleSetValue: RuleSet;
  allowRuleset: boolean = true;
  allowCollapse: boolean = false;
  persistValueOnFieldChange: boolean = false;
  onSave!: (data: any, modalState?: any) => void;

  @ViewChild('nameInput') nameInput!: ElementRef;
  expandedNodes = new Set<any>();
  isViewMode;
  isNameEditing = false;
  editName = '';
  fieldModes: Record<string, 'normal' | 'expression'> = {};
  fieldValues: Record<string, { normal?: any; expression?: string }> = {};
  private fieldFormIds = new WeakMap<FormGroup, string>();
  private dynamicOptionComparators = new WeakMap<DynamicField, (left: any, right: any) => boolean>();
  private nextFieldFormId = 0;

  //condition builder 
  conditionTree: any = {
    type: 'group',
    condition: 'AND',
    children: []
  };
  conditionFieldMetaStore: Record<string, DynamicFieldMeta[]> = {};
  //


  outputView: 'tree' | 'json' = 'tree';
  outputIsString = false;
  outputStringValue = '';
  outputTreeNodes: any[] = [];
  outputSchemaFields: any[] = [];
  outputTableCols: string[] = [];
  outputTableRows: any[] = [];

  multiselectProperties: IMultiSelectSettings = {
    "isSimpleArray": false,
    "lableToDisplay": 'label',
    "enableSearch": true,
    "checkedStyle": 'fontawesome',
    "buttonClasses": 'btn btn-default btn-block',
    "dynamicTitleMaxItems": 1,
    "displayAllSelectedText": true,
    "showCheckAll": true,
    "showUncheckAll": true,
    "selectAsObject": false,
    "keyToSelect": 'value',
  }

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private svc: WfDynamicParamsService,
    private containerSvc: WfDynamicContainerService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private el: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private titleCasePipe: TitleCasePipe,
    private http: HttpClient,
    private scheduleSvc: UnityScheduleService,
  ) { }

  ngOnInit(): void {
    console.log('INIT CONFIG', this.nodeData?.config);
    this.initializeDetails();
    const apiSchema = this.nodeData?.config;
    const initialValues = Object.keys(this.initialValues || {}).length > 0 ? this.initialValues : this.extractInitialValues(this.nodeData?.config ?? {});
    console.log('INITIAL VALUES', initialValues);
    this.loadDynamicSchema(apiSchema, initialValues);
    this.getCloudAccount();
    this.getCredentials();
    this.nodeId = this.nodeData?.isTool ? this.nodeData?.tool_id.split('-')[1] : this.nodeData?.node_id;
    console.log(this.workflowVarsData)
    this.getConnectedNodes();
    this.middlePanelLogo = this.containerSvc.getNewCenterImageUrl(
      this.nodeData.icon_path
    );
    console.log('>>>>>>>>>>>', this.nodeData);
    console.log('*****************real  time*********', this.realTimeData)
    this.changeTab(this.modalName ? this.modalName : 'properties');
    this.getOutputOfNode();
  }

  private extractInitialValues(config: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const tabValues of Object.values(config ?? {})) {
      if (tabValues && typeof tabValues === 'object' && !Array.isArray(tabValues)) {
        Object.assign(result, tabValues);
      }
    }
    return result;
  }

  ngOnDestroy() {
    this.stopSidePanelResize();
    this.connectedNodes = [];
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  applyNodeConfiguration(nodeData: NodeDetailsArrayModel, initialValues: Record<string, any>): void {
    this.nodeData = nodeData;
    this.initialValues = initialValues || {};
    this.schemaLoadError = '';
    this.initializeDetails();
    this.loadDynamicSchema(this.nodeData?.config as ApiSchema, this.initialValues);
    this.isSchemaLoading = false;
    this.cdr.detectChanges();
  }

  showSchemaLoadError(): void {
    this.isSchemaLoading = false;
    this.schemaLoadError = 'Unable to load node properties. Close the modal and try again.';
    this.cdr.detectChanges();
  }

  closeOrSaveModal(): void {
    if (this.isSchemaLoading || this.schemaLoadError) {
      this.bsModalRef.hide();
      return;
    }
    this.save('save');
  }

  startEdit() {
    this.editName = this.nodeData?.name ?? '';
    this.isNameEditing = true;
    // focus after *ngIf renders the input
    setTimeout(() => this.nameInput.nativeElement.focus(), 0);
  }

  saveName() {
    if (this.editName.trim()) {
      this.nodeData!.name = this.editName.trim();
    }
    this.isNameEditing = false;
  }

  cancelEdit() {
    this.isNameEditing = false;
  }

  changeTab(val: string) {
    this.activeTab = val;
    this.cdr.detectChanges();
  }

  toggleInputPanel(): void {
    this.inputPanelCollapsed = !this.inputPanelCollapsed;
  }

  toggleOutputPanel(): void {
    this.outputPanelCollapsed = !this.outputPanelCollapsed;
  }

  startInputPanelResize(event: MouseEvent): void {
    if (this.inputPanelCollapsed) return;
    this.startSidePanelResize(event, 'input');
  }

  startOutputPanelResize(event: MouseEvent): void {
    if (this.outputPanelCollapsed) return;
    this.startSidePanelResize(event, 'output');
  }

  private startSidePanelResize(event: MouseEvent, panel: 'input' | 'output'): void {
    event.preventDefault();
    event.stopPropagation();

    this.resizingSidePanel = panel;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = panel === 'input' ? this.inputPanelWidth : this.outputPanelWidth;
    this.el.nativeElement.classList.add('panel-resizing');

    document.addEventListener('mousemove', this.resizeSidePanel);
    document.addEventListener('mouseup', this.stopSidePanelResize);
  }

  private resizeSidePanel = (event: MouseEvent): void => {
    if (!this.resizingSidePanel) return;

    const delta = event.clientX - this.resizeStartX;
    const nextWidth = this.resizingSidePanel === 'input'
      ? this.resizeStartWidth + delta
      : this.resizeStartWidth - delta;
    const width = this.clampSidePanelWidth(nextWidth);

    if (this.resizingSidePanel === 'input') {
      this.inputPanelWidth = width;
    } else {
      this.outputPanelWidth = width;
    }
  };

  private stopSidePanelResize = (): void => {
    this.resizingSidePanel = null;
    this.el.nativeElement.classList.remove('panel-resizing');
    document.removeEventListener('mousemove', this.resizeSidePanel);
    document.removeEventListener('mouseup', this.stopSidePanelResize);
  };

  private clampSidePanelWidth(width: number): number {
    const hostWidth = this.el.nativeElement.getBoundingClientRect().width || 750;
    const otherPanelWidth = this.resizingSidePanel === 'input'
      ? (this.isPromptExpanded ? 0 : this.outputPanelCollapsed ? this.collapsedPanelWidth : this.outputPanelWidth)
      : (this.inputPanelCollapsed ? this.collapsedPanelWidth : this.inputPanelWidth);
    const maxFromLayout = hostWidth - otherPanelWidth - this.minMiddlePanelWidth;
    const maxWidth = Math.max(this.minSidePanelWidth, Math.min(this.maxSidePanelWidth, maxFromLayout));

    return Math.max(this.minSidePanelWidth, Math.min(width, maxWidth));
  }

  ngAfterViewInit() {
    const host = this.el.nativeElement;
    const left = host.querySelector(
      'unity_schedule .col-2-w'
    ) as HTMLElement | null;
    const right = host.querySelector(
      'unity_schedule .col-8-w'
    ) as HTMLElement | null;

    if (left) {
      left.style.flex = '0 0 16%';
      left.style.maxWidth = '16%';
      left.style.width = '16%';
    }
    if (right) {
      right.style.flex = '0 0 84%';
      right.style.maxWidth = '84%';
      right.style.width = '84%';
    }
  }

  hasRealTimeData(): boolean {
    // return !!this.realTimeData && Object.keys(this.realTimeData).length > 0;
    return false;
  }

  initializeDetails() {
    this.editName = this.nodeData.name;
    const scheduleMeta =
      this.initialValues?.unity_schedule ??
      this.nodeData?.formData?.properties?.unity_schedule ??
      this.nodeData?.config?.properties?.unity_schedule ??
      this.nodeData?.config?.config?.properties?.unity_schedule ??
      this.nodeData?.config?.schedule_meta ??
      this.nodeData?.config?.config?.schedule_meta;

    this.scheduleSvc.addOrEdit(scheduleMeta ?? null);
  }

  getConnectedNodes() {
    console.log('connected nodes>>>', this.connectedNodes);
    if (!this.connectedNodes.length) return;

    this.connectedNodes =

      this.connectedNodes = this.connectedNodes.map((node) => {

        if (
          node.node_type === nodeTypes.ManualTrigger ||
          node.node_type === nodeTypes.ScheduleTrigger ||
          node.node_type === nodeTypes.OnChatMessageTrigger
        ) {
          const inputParams =
            node?.properties?.input_params ??
            node?.formData?.properties?.input_params ??
            node?.config?.properties?.input_params ??
            node?.config?.config?.properties?.input_params ??
            [];
          const outputParams: any[] = inputParams
            .filter((param: any) => param?.param_name)
            .map((param: any) => ({
              param_name: param.param_name,
              param_type: param.param_type,
              default_value: param.default_value,
              children: [],
            }));

          if (node.node_type === nodeTypes.OnChatMessageTrigger) {
            outputParams.unshift({
              param_name: 'query',
              children: [],
            });
          }

          return {
            ...node,
            outputTree: this.buildOutputTree({
              status: true,
              output: outputParams,
              error: true,
            }, ''),
          };
        }

        if (node.node_type === nodeTypes.WebhookTrigger) {
          const payload = this.getWebhookPayload(node);

          return {
            ...node,
            outputTree: this.buildOutputTree([
              { param_name: 'status', children: [] },
              {
                param_name: 'output',
                children: [{
                  param_name: 'payload',
                  children: payload,
                }],
              },
              { param_name: 'error', children: [] },
            ], ''),
          };
        }

        if (node.node_type === nodeTypes.ItsmTrigger) {
          const tableUuid = node?.config?.itsm_table;
          const nodeCopy = { ...node };
          const setItsmOutputTree = (fieldNames: string[] = []) => {
            nodeCopy.outputTree = this.buildOutputTree([
              { param_name: 'status', children: [] },
              {
                param_name: 'output',
                children: [
                  { param_name: 'event_type', children: [] },
                  {
                    param_name: 'data',
                    children: ['uuid', 'ticket_id', ...fieldNames].map((key: string) => ({
                      param_name: key,
                      children: [],
                    })),
                  },
                ],
              },
              { param_name: 'error', children: [] },
            ], '');
          };

          setItsmOutputTree();

          if (tableUuid) {
            this.svc.getTableDetails(tableUuid)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe(res => {
                setItsmOutputTree((res?.fields ?? []).map((field: any) => field.field_name));
              });
          }

          return nodeCopy;
        }

        if (node.node_type === nodeTypes.AimlEventTrigger) {
          const aimlType = node?.config?.aiml_type;
          let contextFields: string[] = [];

          if (aimlType === 'Event') contextFields = this.getEventContext();
          if (aimlType === 'Alert') contextFields = this.getAlertContext();
          if (aimlType === 'Condition') contextFields = this.getConditionContext();

          return {
            ...node,
            outputTree: this.buildOutputTree([
              { param_name: 'status', children: [] },
              {
                param_name: 'output',
                children: [
                  { param_name: 'event_type', children: [] },
                  {
                    param_name: 'data',
                    children: contextFields.map((key: string) => ({
                      param_name: key,
                      children: [],
                    })),
                  },
                ],
              },
              { param_name: 'error', children: [] },
            ], ''),
          };
        }

        if(node.node_type === nodeTypes.Loop){
           return {
            ...node,
            outputTree: [
              { param_name: 'item', path: "item", children: [] },
              { param_name: 'status', path: "status", children: [] },
              { param_name: 'output', path: "output", children: [] },
              { param_name: 'error', path: "error", children: [] },
            ],
          };
        }

        const outputData = node?.output_data;
        const hasExecuted = outputData !== null && outputData !== undefined && (
          typeof outputData !== 'object' || Object.keys(outputData).length > 0
        );

        const ticketNodeTypes = [
          nodeTypes.CreateITSMTicket,
          nodeTypes.GetITSMTicket,
          nodeTypes.UpdateITSMTicket,
          nodeTypes.CommentInITSMTicket,
        ];

        if (ticketNodeTypes.includes(node.node_type)) {
          const nodeCopy = { ...node };
          const declaredOutputNames = (node?.outputs ?? [])
            .map((output: any) => output?.param_name)
            .filter(Boolean);
          const actualOutputTree = hasExecuted
            ? this.buildOutputTree(outputData, '')
            : [];
          const setTicketOutputTree = (fieldNames: string[] = []) => {
            const outputNames = Array.from(new Set([
              'uuid',
              'ticket_id',
              ...declaredOutputNames,
              ...fieldNames,
            ]));

            const outputTree = actualOutputTree.length
              ? actualOutputTree
              : this.buildOutputTree([
                { param_name: 'status', children: [] },
                { param_name: 'output', children: [] },
                { param_name: 'error', children: [] },
              ], '');
            let outputNode = outputTree.find(item => item.param_name === 'output');
            if (!outputNode) {
              outputNode = { param_name: 'output', path: 'output', children: [] };
              outputTree.push(outputNode);
            }

            outputNames.forEach(param_name => {
              if (!outputNode.children.some(child => child.param_name === param_name)) {
                outputNode.children.push({
                  param_name,
                  path: `output['${param_name}']`,
                  children: [],
                });
              }
            });

            nodeCopy.outputTree = outputTree;
          };

          // UUID and ticket ID stay available for dragging before and after
          // execution, including while table metadata is still loading.
          setTicketOutputTree();

          const tableUuid = this.getConnectedNodeConfigValue(node, 'itsm_table');
          const exposesTableFields = node.node_type !== nodeTypes.CommentInITSMTicket;
          if (tableUuid && exposesTableFields) {
            this.svc.getTableDetails(tableUuid)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe(res => {
                const fieldNames = (res?.fields ?? [])
                  .filter((field: any) => field.field_type !== 'COMMENTS')
                  .map((field: any) => field.field_name)
                  .filter(Boolean);
                setTicketOutputTree(fieldNames);
              });
          }

          return nodeCopy;
        }

        if (!hasExecuted) {
          // Not executed yet: fixed flat skeleton, no nested children
          return {
            ...node,
            outputTree: [
              { param_name: 'status', path: "status", children: [] },
              { param_name: 'output', path: "output", children: [] },
              { param_name: 'error', path: "error", children: [] },
            ],
          };
        }

        // Executed: build real tree from the actual outputs object,
        // skipping any key whose value is null/undefined/empty string
        return {
          ...node,
          outputTree: this.buildOutputTree(node?.output_data, ''),
        };
      });
  }

  private getConnectedNodeConfigValue(node: any, key: string): any {
    return node?.formData?.properties?.[key] ??
      node?.formData?.settings?.[key] ??
      node?.config?.properties?.[key] ??
      node?.config?.settings?.[key] ??
      node?.config?.config?.properties?.[key] ??
      node?.config?.config?.settings?.[key] ??
      node?.config?.[key] ??
      node?.[key];
  }

  /**
   * Builds a generic drillable tree from any object/array.
   * - Skips keys whose value is null, undefined, or '' (per spec: don't show
   *   empty/null fields like error:null on a successful run).
   * - path starts with the root key and brackets nested keys, e.g.
   *   output['nested_key'].
   */
  buildOutputTree(value: any, path: string): any[] {
    if (value === null || value === undefined || value === '') return [];

    if (Array.isArray(value)) {
      return value
        .map((item: any, idx: number) => {
          if (item === null || item === undefined || item === '') return null;
          const key = item?.param_name ?? String(idx);
          const childPath = path ? `${path}['${key}']` : key;
          const children = (item && typeof item === 'object')
            ? this.buildOutputTree(item.children ?? item, childPath)
            : [];
          return {
            param_name: key, path: childPath, param_type: item?.param_type,
            default_value: item?.default_value, children
          };
        })
        .filter((n: any) => n !== null);
    }

    if (typeof value === 'object') {
      return Object.entries(value)
        .filter(([, val]) => val !== null && val !== undefined && val !== '')
        .map(([key, val]) => {
          const childPath = path ? `${path}['${key}']` : key;
          const children = (val && typeof val === 'object')
            ? this.buildOutputTree(val, childPath)
            : [];
          return { param_name: key, path: childPath, children };
        });
    }

    return [];
  }

  getNestedKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj).flatMap(key => {
      const value = obj[key];
      return value && typeof value === 'object' && !Array.isArray(value)
        ? [key, ...this.getNestedKeys(value)]
        : [key];
    });
  }

  private getWebhookPayload(node: any): any {
    const rawPayload =
      node?.formData?.properties?.payload ??
      node?.formData?.payload ??
      node?.properties?.payload ??
      node?.config?.properties?.payload ??
      node?.config?.config?.properties?.payload ??
      node?.config?.config?.payload ??
      node?.config?.payload ??
      node?.payload ??
      node?.output_data?.payload ??
      node?.output_data?.output?.payload;

    if (typeof rawPayload === 'string') {
      try {
        return JSON.parse(rawPayload);
      } catch {
        return {};
      }
    }

    return rawPayload && typeof rawPayload === 'object' ? rawPayload : {};
  }

  getEventContext() {
    return [
      "id", "uuid", "device_name", "device_type",
      "ip_address", "affected_component", "affected_component_type",
      "affected_component_name", "environment", "application_name",
      "event_metric", "severity", "operational_data", "description",
      "event_datetime", "recovered_datetime", "category", "event_type",
      "status", "source_account_name", "received_datetime",
    ]
  }

  getAlertContext() {
    return [
      "id", "uuid", "device_name", "device_type",
      "ip_address", "description", "severity", "status",
      "source_account_name", "event_count", "event_metric",
      "created_datetime", "recovered_datetime", "first_event_datetime",
      "last_event_datetime",
    ]
  }

  getConditionContext() {
    return [
      "id", "uuid", "description", "status",
      "severity", "alert_count", "event_count",
      "sources", "source_accounts", "created_datetime",
      "first_alert_datetime", "last_alert_datetime",
      "recovered_datetime", "ticket_id", "ticket_uuid",
    ]

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
      default: return ''; // neutral dot
    }
  }

  getOutputOfNode() {
    console.log(this.realTimeData, "realtime data parentI")
    this.nodeOutput = this.realTimeData ? this.realTimeData?.output_data : '';
    this.buildOutputViews(this.nodeOutput);
  }

  processRealTimeData(form: FormGroup): void {
    if (!form || !this.realTimeData) return;

    const flatRealTimeData = this.flattenObject(this.realTimeData);

    Object.keys(form.controls).forEach(key => {
      const value = flatRealTimeData[key];

      if (value !== undefined && value !== null && !form.contains(key + '_resolved')) {

        if (Array.isArray(value)) {
          // create FormArray of FormGroups
          const formArray = new FormArray(
            value.map(item => new FormGroup(
              Object.keys(item).reduce((acc, k) => {
                acc[k] = new FormControl(item[k]);
                return acc;
              }, {})
            ))
          );

          form.addControl(key + '_resolved', formArray);

        } else {
          // scalar field
          form.addControl(key + '_resolved', new FormControl(value));
        }
      }
    });
  }


  flattenObject(obj: any, result: any = {}): any {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const value = obj[key];

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        this.flattenObject(value, result);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  getResolvedValue(
    form: FormGroup,
    arrayName: string,
    index: number,
    fieldName: string
  ): any | null {
    if (!form || !arrayName || index === null || index === undefined) {
      return null;
    }

    const resolvedArrayControl = form.get(arrayName + '_resolved');



    //Check that it's actually a FormArray
    // if (!(resolvedArrayControl instanceof FormArray)) return null;

    const resolvedArray = resolvedArrayControl as FormArray;

    const control = resolvedArray.at(index)?.get(fieldName);
    return control ? control.value : null;
  }


  getResolvedControlValue(
    form: FormGroup,
    controlName: string
  ): any | null {
    if (!form || !controlName) return null;

    const resolvedControl = form.get(controlName + '_resolved');
    return resolvedControl ? resolvedControl.value : null;
  }

  getTableDetailsCreate(uuid: string, type: string, form: FormGroup) {
    console.log('<><><<', type, form)
    this.svc.getTableDetails(uuid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.spinner.stop('main');
          /* ---------- Create Ticket ---------- */
          if (type === nodeTypes.CreateITSMTicket && form) {
            const inputsArray = form.get('inputs') as FormArray;

            // Preserve defaults
            const defaultValueMap = new Map(
              (inputsArray.value ?? []).map(i => [i.param_name, i.default_value])
            );

            inputsArray.clear();

            res.fields.forEach(f => {
              if (f.field_type === 'COMMENTS') return;

              inputsArray.push(
                this.svc.itsmFieldsGroup({
                  ...f,
                  default_value: defaultValueMap.get(f.field_name) ?? ''
                })
              );
            });
            this.getOutputs(res, this.createTicketForm);
          }
        },
        () => this.spinner.stop('main')
      );
  }

  getCacheKey(uuid: string, type: string, nodeId?: number) {
    return `${uuid}_${type}_${nodeId ?? 'default'}`;
  }


  getTableDetails(uuid: string, form?: FormGroup) {

    this.spinner.start('main');

    this.svc.getTableDetails(uuid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.processResponse(res, uuid, this.nodeData.node_type, form);
          this.spinner.stop('main');
        },
        () => this.spinner.stop('main')
      );
  }



  processResponse(res: any, uuid: string, type?: string, form?: FormGroup) {
    console.log('<<<<<<<<<<<<<<<<<<<<<', res, uuid, type, form)

    /* ---------- Update Ticket ---------- */
    if (type === nodeTypes.UpdateITSMTicket) {
      this.updateTicketList = res.fields.map(f => f.field_name);
      this.getOutputs(res, this.updateTicketForm);
      return;
    }

    /* ---------- Get Ticket ---------- */
    if (type === nodeTypes.GetITSMTicket && form === this.getTicketForm) {
      this.getTicketKeyList = [
        'uuid',
        'ticket_id',
        ...res.fields.map(f => f.field_name)
      ];

      this.resetOutputsWithBaseFields(this.getTicketForm);

      const outputsArray = this.getTicketForm.get('outputs') as FormArray;

      res.fields.forEach(f => {
        if (f.field_type !== 'COMMENTS' &&
          f.field_name !== 'uuid' &&
          f.field_name !== 'ticket_id') {
          outputsArray.push(
            this.fb.group({
              param_name: f.field_name,
              expression_type: 'jmespath',
              expression: f.field_name
            })
          );
        }
      });
      return;
    }

    /* ---------- Comment ---------- */
    if (form === this.commentInTicketForm) {
      this.commentFieldsList = res.fields
        .filter(f => f.field_type === 'COMMENTS')
        .map(f => f.field_name);
      return;
    }
  }


  getOutputs(res, form) {
    const outputsArray = form.get('outputs') as FormArray;

    outputsArray.clear();

    outputsArray.push(
      this.svc.createOutput('uuid', 'jmespath', 'uuid')
    );

    outputsArray.push(
      this.svc.createOutput('ticket_id', 'jmespath', 'ticket_id')
    );
    // Avoid duplicate outputs
    const existingOutputParams = new Set(
      outputsArray.controls.map(c => c.get('param_name')?.value)
    );
    res.fields.forEach(f => {
      if (f.field_type === 'COMMENTS') return;
      // Outputs (unique)
      const paramName = f.field_name ?? f.param_name;
      if (
        paramName !== 'uuid' &&
        paramName !== 'ticket_id' &&
        !existingOutputParams.has(paramName)
      ) {
        outputsArray.push(
          this.fb.group({
            param_name: paramName,
            expression_type: 'jmespath',
            expression: paramName
          })
        );
        existingOutputParams.add(paramName);
      }
    });
  }


  resetOutputsWithBaseFields(form) {
    const outputsArray = form.get('outputs') as FormArray;

    // Clear all existing controls
    outputsArray.clear();

    // Always-required base outputs
    const baseOutputs = [
      { param_name: 'uuid', expression_type: 'jmespath', expression: 'uuid' },
      { param_name: 'ticket_id', expression_type: 'jmespath', expression: 'ticket_id' }
    ];

    baseOutputs.forEach(o => {
      outputsArray.push(this.fb.group(o));
    });
  }

  // --- Drag & Drop handlers ---
  // 2. Drag start handler
  onDragStart(event: DragEvent, nodeData: any, variable: any, child?: any) {
    event.dataTransfer?.setData(
      'text/plain',
      this.getDragText(nodeData, variable, child)
    );
  }

  getDragText(nodeData: any, variable: any, childData?: any): string {
    // special case for global context -> leave as is
    if (nodeData === 'context') {
      return `${variable.value}`;
    }

    if (nodeData === 'workflow') {
      const varKey = variable?.param_name;
      if (childData) {
        const childKey = typeof childData === 'string' ? childData : childData?.param_name;
        return `{{ vars.${varKey}.${childKey} }}`;
      }
      return `{{ vars.${varKey} }}`;
    }

    // Connected node case: variable.path starts with the root key and uses
    // brackets for nested keys, e.g. output['name'] or status.
    let path: string = variable?.path ?? `['${variable?.param_name}']`;
    if (childData) {
      const childKey = typeof childData === 'string' ? childData : childData?.param_name;
      path = `${path}['${childKey}']`;
    }
    return `{{ tasks.node_${nodeData.node_id}.${path} }}`;
  }

  onDrop(event: DragEvent, control: FormControl, key?: string) {
    if (key === 'name') {
      event.preventDefault();
      return;
    }
    event.preventDefault();

    const input = event.target as HTMLInputElement;
    input.classList.remove('drag-highlight');

    const cursorPos = input.selectionStart || 0;
    const draggedText = event.dataTransfer?.getData('text/plain') || '';

    const before = input.value.slice(0, cursorPos);
    const after = input.value.slice(cursorPos);
    const newValue = before + draggedText + after;

    control.setValue(newValue);

    input.value = newValue;
    input.focus();
    input.setSelectionRange(
      cursorPos + draggedText.length,
      cursorPos + draggedText.length
    );
  }

  onDragEnter(event: DragEvent, key: string) {
    if (key === 'name') return;
    const input = event.target as HTMLInputElement;
    input.focus();
    input.classList.add('drag-highlight');
  }

  onDragOver(event: DragEvent, key?: string) {
    if (key === 'name') {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'none';
      return;
    }
    event.preventDefault();

    const input = event.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Ensure font is monospace? (else approx calc)
    const relativePos = x / rect.width;
    const caretPos = Math.round(relativePos * input.value.length);

    input.setSelectionRange(caretPos, caretPos); // moves caret
  }

  onDragLeave(event: DragEvent, key?: string) {
    if (key === 'name') {
      return;
    }
    const input = event.target as HTMLInputElement;
    input.classList.remove('drag-highlight');
  }

  save(action: 'save' | 'test' = 'save') {
    console.log('final form>>>', this.nodeForm.getRawValue())
    const formDataByTabs = this.getFormDataByTabs();

    /////////////Schedule Unity/////////////////////
    if (this.nodeData?.node_type === 'Schedule Trigger') {
      const rawMeta = this.scheduleSvc?.getFormValue();
      const scheduleMeta = rawMeta?.schedule_meta
        ? { ...rawMeta.schedule_meta, run_now: false }
        : { ...rawMeta, run_now: false };
      if (formDataByTabs.properties) {
        formDataByTabs.properties.unity_schedule = scheduleMeta;
      }
    }
    /////////////Schedule Unity/////////////////////

    /////////////Condition Builder/////////////////////
    this.applyConditionPayloads(formDataByTabs);
    console.log('formDataByTabs with conditions>>>', formDataByTabs);
    /////////////Condition Builder/////////////////////

    this.markAllTouched(this.nodeForm);
    this.validateConditionFields();
    const hasErrors = this.hasAnyErrors(this.formErrors);
    if (action === 'save' || (action === 'test' && !hasErrors)) {
      this.bsModalRef.hide();
    }

    this.onSave(formDataByTabs, {
      success: true,
      updateNodeName: this.nodeData.name,
      errors: this.formErrors,
      validationMessages: this.getAllValidationMessages(),
      action: action,
    });
  }

  private hasAnyErrors(errors: any): boolean {
    if (errors === null || errors === undefined) {
      return false;
    }
    if (typeof errors === 'string') {
      return errors.trim().length > 0;
    }
    if (Array.isArray(errors)) {
      return errors.some(item => this.hasAnyErrors(item));
    }
    if (typeof errors === 'object') {
      return Object.values(errors).some(val => this.hasAnyErrors(val));
    }
    return false;
  }

  private applyConditionPayloads(formDataByTabs: Record<string, any>) {
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      const tabData = formDataByTabs[tab.id];
      if (!tabData) return;
      (tab.fields || []).forEach(field => {
        this.applyConditionPayloadsForField(field, tabData);
      });
    });
  }

  private applyConditionPayloadsForField(field: any, containerData: any) {
    const fieldKey = field.control_name || field.key;
    if (!fieldKey || !containerData || !Object.prototype.hasOwnProperty.call(containerData, fieldKey)) return;

    if (field.type === 'condition') {
      const tree = field._conditionTree || { type: 'group', condition: 'AND', children: [] };
      containerData[fieldKey] = this.buildConditionPayload(tree);
      return;
    }

    if (field.type === 'array') {
      const rows: any[] = containerData[fieldKey];
      if (!Array.isArray(rows)) return;

      const array = this.getDynamicFormArray(this.nodeForm, fieldKey) // adjust if array can be nested deeper than top-level form

      rows.forEach((rowData: any, i: number) => {
        const rowGroup = array?.at ? array.at(i) : array?.controls?.[i];
        const rowFields: any[] = (rowGroup as any)?._rowFields || field.fields || [];

        rowFields.forEach((childField: any) => {
          this.applyConditionPayloadsForField(childField, rowData);
        });
      });
      return;
    }

    // nested plain field group (non-array), if your schema supports it
    if (field.fields?.length && containerData[fieldKey]) {
      field.fields.forEach((childField: any) => {
        this.applyConditionPayloadsForField(childField, containerData[fieldKey]);
      });
    }
  }

  private getFormDataByTabs(): Record<string, any> {
    const result: Record<string, any> = {};
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      result[tab.id] = this.getVisibleFieldValues(this.nodeForm, tab.fields || []);
    });
    return result;
  }

  private getVisibleFieldValues(form: FormGroup, fields: DynamicField[]): Record<string, any> {
    const values: Record<string, any> = {};

    (fields || []).forEach(field => {
      const controlName = field.control_name;
      if (!controlName || !form.contains(controlName) || !this.evaluateVisibleWhen(field.visible_when, form)) {
        return;
      }

      const control = form.get(controlName);
      if (this.getDynamicFieldType(field) === 'array') {
        const formArray = control as FormArray;
        values[controlName] = (formArray?.controls || []).map(row =>
          this.getVisibleFieldValues(row as FormGroup, field.fields || [])
        );
        return;
      }

      if (this.getDynamicFieldType(field) === 'group') {
        values[controlName] = this.getVisibleFieldValues(
          control as FormGroup,
          field.fields || []
        );
        return;
      }

      values[controlName] = control?.value;
    });

    return values;
  }

  toggleContextVariables() {
    this.contextVarHeader = !this.contextVarHeader;
  }
  toggleWorkflowVariables() {
    this.workflowVarHeader = !this.workflowVarHeader;
  }
  toggleAccordion(nodeId: number) {
    this.accordionState[nodeId] = !this.accordionState[nodeId];
  }

  isAccordionOpen(nodeId: number): boolean {
    return !!this.accordionState[nodeId];
  }

  closeModal(action?: 'save' | 'test') {
    //need to add saveformData to this.updatedFormDatas
    if (action === 'save' || action === 'test') {
      if (this.onClose) {
        this.onClose(this.updatedFormDatas, { action }); // send back to parent
        this.bsModalRef.hide();
      }
      console.log(this.updatedFormDatas, "updated form data")
    } else {
      this.bsModalRef.hide();
    }
  }

  getCredentials(): void {
    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(credentials => {
      this.credentials = Array.isArray(credentials) ? credentials : (credentials as any)?.results ?? [];
    });
  }

  getCloudAccount() {
    this.svc.getAllCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe((accounts) => {
      this.cloudAccount = Array.isArray(accounts) ? accounts : accounts?.results ?? [];
    });
  }

  getAttributesForInput(input: any): string[] {
    const paramType = this.normalizeContextParamType(input?.param_type);

    if (paramType === 'CLOUD_ACCOUNT') {
      const defaultValue = input?.default_value;
      const accountId = typeof defaultValue === 'object'
        ? defaultValue?.uuid ?? defaultValue?.value
        : defaultValue;
      if (!accountId) {
        return [];
      }

      const account = this.cloudAccount?.find(
        (item) => String(item?.uuid) === String(accountId)
      );
      if (!account) {
        return [];
      }

      const cloudType = String(account.cloud_type ?? '').trim().toLowerCase();
      const resolvedCloudType = cloudType === 'united private cloud vcenter'
        ? 'vmware'
        : cloudType;
      const attrConfig = cloudAttributes.find(
        (config) => config.cloudType.toLowerCase() === resolvedCloudType
      );
      return attrConfig ? attrConfig.attributes : [];
    }

    if (paramType === 'CREDENTIAL') {
      const defaultValue = input?.default_value;
      const credentialId = typeof defaultValue === 'object'
        ? defaultValue?.uuid ?? defaultValue?.value
        : defaultValue;
      const credential = this.credentials?.find(
        (item) => String(item?.uuid) === String(credentialId)
      );
      return credential ? ['username', 'password', 'sudo_password'] : [];
    }

    if (paramType === 'TARGET') {
      const selectedTarget = Array.isArray(input?.default_value)
        ? input.default_value[0]
        : input?.default_value;
      return selectedTarget && typeof selectedTarget === 'object'
        ? ['uuid', 'name', 'ip_address', 'os']
        : [];
    }

    return [];
  }

  private normalizeContextParamType(paramType: any): string {
    return String(paramType ?? '')
      .trim()
      .replace(/[\s-]+/g, '_')
      .toUpperCase();
  }

  toggleExpand(node: any): void {
    if (this.expandedNodes.has(node)) {
      this.expandedNodes.delete(node);
    } else {
      this.expandedNodes.add(node);
    }
  }

  isExpanded(node: any): boolean {
    return this.expandedNodes.has(node);
  }

  hasExpandable(node: any): boolean {
    return !!(node.children?.length || this.getAttributesForInput(node).length);
  }

  getTypeLabel(node: any): string {
    const paramType = this.normalizeContextParamType(node?.param_type);
    if (paramType === 'CLOUD_ACCOUNT') {
      const accountId = typeof node.default_value === 'string'
        ? node.default_value
        : node.default_value?.uuid;
      const account = this.cloudAccount?.find(
        (item) => String(item?.uuid) === String(accountId)
      );
      return account?.cloud_type || 'Cloud Account';
    }
    if (paramType === 'CREDENTIAL') {
      return 'Credential';
    }
    if (paramType === 'TARGET') {
      return 'Target';
    }
    return '';
  }

  getDynamicSearchFn(field: DynamicField): (query: string) => Observable<any[]> {
    return (query: string): Observable<any[]> => {
      const endpoint = field.options_api?.endpoint;
      if (!endpoint) {
        return of([]);
      }
      return this.svc.getHostByEndpoint(endpoint, query).pipe(
        map(response => this.extractAndMapOptions(response, field)),
        catchError(() => {
          this.notification.error(
            new Notification('Failed to fetch results. Please try again later.')
          );
          return of([]);
        })
      );
    };
  }

  private extractAndMapOptions(response: any, field: DynamicField): any[] {
    const items = this.extractOptionItems(response, field.options_api?.data_path);
    // If no label_key/value_key defined, return raw items
    if (!field.options_api?.label_key && !field.options_api?.value_key) {
      return items;
    }
    return this.mapDynamicOptions(items, field);
  }

  getDropdownData() {
    this.spinner.start('main');
    this.userGroups = [];
    this.userList = [];
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ userGroups, userList }) => {
      if (userGroups) {
        this.userGroups = _clone(userGroups);
      } else {
        this.userGroups = [];
        this.notification.error(new Notification("Error while fetching User Groups"));
      }

      if (userList) {
        this.userList = _clone(userList);
      } else {
        this.userList = [];
        this.notification.error(new Notification("Error while fetching User List"));
      }
      this.spinner.stop('main');
    });
  }

  compareAccounts(a: any, b: any): boolean {
    return a && b ? a.uuid === b.uuid : a === b;
  }


  onAIiconClick(control) {
    if (control.disabled) {
      control.enable();
      control.setValue('');
    } else {
      control.setValue('AI INPUT');
      control.disable();
    }
  }

  expandPrompt(formControlName: string): void {
    this.expandedFormControlName = formControlName;
    this.expandedLabel =
      this.titleCasePipe.transform(formControlName.includes('_') ? formControlName.split('_').join(' ') : formControlName) || '';
    this.isPromptExpanded = true;
  }

  collapsePrompt(): void {
    this.isPromptExpanded = false;
  }


  loadDynamicSchema(apiSchema: ApiSchema, values: Record<string, any> = {}): void {
    this.dynamicOptionStore = {};
    this.dynamicOptionLoading = {};
    this.initialValues = values || {};
    this.dynamicSchema = this.normalizeSchema(apiSchema);

    this.nodeForm = this.fb.group({});
    this.formErrors = {};
    this.validationMessages = {};
    this.fieldModes = {};
    this.fieldValues = {};
    this.fieldFormIds = new WeakMap<FormGroup, string>();
    this.nextFieldFormId = 0;

    this.ensureControlsForSchema(this.nodeForm, this.dynamicSchema);
    this.initializeDynamicOptions();
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.walkFieldContexts(this.nodeForm, tab.fields || [], (field, form) => {
        if (field.type === 'filter' && field.form_api && !field.form_api.depends_on?.trim()) {
          this.loadFormApiForField(field, form); // ← console.logs field.form_data immediately
        }
      });
    });
    this.ensureActiveTab();
    this.bindFormErrorRefresh();
    const allFields = (this.dynamicSchema?.tabs || []).flatMap(tab => tab.fields || []);
    this.restoreFieldModes(this.nodeForm, allFields);
    this.markAllTouched(this.nodeForm);
    this.refreshFormErrors();
  }

  private bindFormErrorRefresh(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    this.subscriptions.push(
      this.nodeForm.valueChanges.subscribe(() => this.refreshFormErrors()),
      this.nodeForm.statusChanges.subscribe(() => this.refreshFormErrors())
    );
  }

  private normalizeSchema(schema: ApiSchema): DynamicSchema {
    return {
      tabs: (schema?.tabs || []).map((tab: ApiTab) => ({
        id: tab.id || 'properties',
        label: tab.label || 'Properties',
        fields: this.normalizeFields(tab.fields || [])
      }))
    };
  }

  private normalizeFields(fields: ApiField[]): DynamicField[] {
    const flatFields = ((fields || []) as any[]).flat(Infinity) as ApiField[];
    return flatFields.map((field: ApiField) => {
      const normalized: DynamicField = {
        control_name: field.key || '',
        type: this.normalizeFieldType(field.type, field.fields),
        label: field.label,
        placeholder: field.placeholder,
        helpText: field.help_text,
        maxlength: field.max_length,
        rows: field.rows,
        default: field.default,
        disabled: field.disabled,
        add_button_label: field.add_label,
        min_items: field.min_items,
        options: field.options || [],
        multiselect_properties: field.multiselect_properties,
        options_api: field.options_api || null,
        form_api: field.form_api || null,
        show_add_remove: field.show_add_remove ?? true,
        validators: this.normalizeValidators(field.validators),
        required: field.required === true,
        visible_when: this.normalizeVisibleWhen(field.visible_when),
        clear_on_hide: field.clear_on_hide ?? false,
        width: field.width ?? 'full',
        fields: field.fields?.length ? this.normalizeFields(field.fields) : undefined,
        condition_type: field.condition_type,   // <-- add
        min_conditions: field.min_conditions
      };
      return normalized;
    });
  }

  private normalizeFieldType(type?: string, childFields?: ApiField[]): string {
    if (type === 'textarea') {
      return 'text_area';
    }

    if (type === 'form_array' || type === 'form-array') {
      return 'array';
    }

    if (type === 'form_group' || type === 'form-group') {
      return 'group';
    }

    if (type) {
      return type;
    }

    return childFields?.length ? 'array' : 'text';
  }

  private normalizeValidators(validators: any): any {
    if (!Array.isArray(validators)) {
      return validators;
    }

    return validators.map((validator: ApiValidator) => ({
      ...validator,
      type: this.normalizeValidatorType(validator.type)
    }));
  }

  private normalizeValidatorType(type: string): string {
    switch (type) {
      case 'min_length':
        return 'minlength';
      case 'max_length':
        return 'maxlength';
      case 'minLength':
        return 'minlength';
      case 'maxLength':
        return 'maxlength';
      default:
        return type;
    }
  }

  private normalizeVisibleWhen(visibleWhen: any): any {
    if (!visibleWhen) {
      return null;
    }

    const normalizeOne = (condition: ApiVisibleWhen): DynamicVisibleWhen => {
      const controlName = condition.control_name || condition.field || '';
      const operator = condition.operator as string;

      if (operator === 'neq') {
        return {
          control_name: controlName,
          not_value: condition.value
        };
      }

      if (operator === 'nin') {
        return {
          control_name: controlName,
          not_value: condition.value // array → "not in this list"
        };
      }

      if (operator === 'in') {
        return {
          control_name: controlName,
          value: condition.value,
          is_in: true // array → "in this list" (distinguishes from plain eq)
        };
      }

      return {
        control_name: controlName,
        value: condition.value
      };
    };

    return Array.isArray(visibleWhen)
      ? visibleWhen.map(normalizeOne)
      : normalizeOne(visibleWhen);
  }

  get visibleTabs(): DynamicTab[] {
    return (this.dynamicSchema?.tabs || []).filter(tab => !!tab.fields?.length);
  }

  get activeFields(): DynamicField[] {
    const active = this.visibleTabs.find(tab => tab.id === this.activeTab) || this.visibleTabs[0];
    return active?.fields || [];
  }

  get hasNoConfigurableFields(): boolean {
    return this.activeFields.every(field => this.getDynamicFieldType(field) === 'hidden');
  }

  private ensureActiveTab(): void {
    const tabs = this.visibleTabs;
    if (!tabs.length) {
      this.activeTab = 'properties';
      return;
    }

    if (!tabs.some(tab => tab.id === this.activeTab)) {
      this.activeTab = tabs[0].id;
    }
  }

  private ensureControlsForSchema(form: FormGroup, schema: DynamicSchema): void {
    (schema?.tabs || []).forEach(tab => {
      (tab.fields || []).forEach(field => {
        this.ensureFieldControl(form, field);
        this.ensureFieldValidationState(field);
      });
    });
  }

  private ensureFieldControl(form: FormGroup, field: DynamicField): void {
    if (!field?.control_name) {
      return;
    }

    const type = this.getDynamicFieldType(field);

    if (type === 'array') {
      if (!form.get(field.control_name)) {
        const formArray = this.createInitialArray(field);
        form.addControl(field.control_name, formArray);
      }
      return;
    }

    if (type === 'group') {
      if (!form.get(field.control_name)) {
        const groupValue = this.initialValues?.[field.control_name];
        const group = this.createFieldGroup(field.fields || [], groupValue);
        if (field.disabled === true) {
          group.disable({ emitEvent: false });
        }
        form.addControl(field.control_name, group);
      }
      return;
    }

    if (!form.get(field.control_name)) {
      const initialValue = this.getInitialFieldValue(
        field,
        this.initialValues?.[field.control_name]
      );
      const disabled = field.disabled === true;

      form.addControl(
        field.control_name,
        this.fb.control(
          { value: initialValue, disabled },
          this.getValidatorsFromField(field)
        )
      );
    }
  }

  // private createInitialArray(field: DynamicField): FormArray {
  //   const existingItems = Array.isArray(this.initialValues?.[field.control_name]) ? this.initialValues[field.control_name] : Array.isArray(this.initialValues?.properties?.[field.control_name]) ? this.initialValues.properties[field.control_name] : [];

  //   const groups = existingItems.map((item: any) =>
  //     this.createArrayItemGroup(field.fields || [], item)
  //   );

  //   const minItems = field.min_items || 0;
  //   while (groups.length < minItems) {
  //     groups.push(this.createArrayItemGroup(field.fields || []));
  //   }


  //   return this.fb.array(groups, this.getArrayValidatorsFromField(field));
  // }

  private createInitialArray(field: DynamicField): FormArray {
    const existingItems = Array.isArray(this.initialValues?.[field.control_name]) ? this.initialValues[field.control_name] : Array.isArray(this.initialValues?.properties?.[field.control_name]) ? this.initialValues.properties[field.control_name] : [];
    const groups = existingItems.map((item: any) => {
      const clonedFields = JSON.parse(JSON.stringify(field.fields || []));
      clonedFields.forEach((childField: any) => {
        if (childField.type === 'condition') {
          const key = childField.control_name || childField.key;
          const savedCondition = item?.[key];
          if (savedCondition) {
            childField._conditionTree = this.parseConditionPayload(savedCondition);
          }
        }
      });
      const newGroup = this.createArrayItemGroup(clonedFields, item);
      (newGroup as any)._rowFields = clonedFields;
      return newGroup;
    });
    // Pad up to min_items with empty groups
    const minItems = field.min_items || 0;
    while (groups.length < minItems) {
      const clonedFields = JSON.parse(JSON.stringify(field.fields || []));
      const newGroup = this.createArrayItemGroup(clonedFields);
      (newGroup as any)._rowFields = clonedFields;
      groups.push(newGroup);
    }
    return this.fb.array(groups, this.getArrayValidatorsFromField(field));
  }

  private createNestedArray(field: DynamicField, existingValue: any): FormArray {
    const items = Array.isArray(existingValue) ? existingValue : [];

    const groups = items.map((item: any) =>
      this.createArrayItemGroup(field.fields || [], item)
    );

    return this.fb.array(groups, this.getArrayValidatorsFromField(field));
  }

  // addDynamicArrayItem(field: DynamicField, form: FormGroup): void {
  //   const array = this.getDynamicFormArray(form, field.control_name);
  //   if (!array) {
  //     return;
  //   }

  //   array.push(this.createArrayItemGroup(field.fields || []));
  //   this.refreshFormErrors();
  // }

  addDynamicArrayItem(field: DynamicField, form: FormGroup): void {
    const array = this.getDynamicFormArray(form, field.control_name);
    if (!array) {
      return;
    }
    const clonedFields = this.getFreshRowFields(field.fields || []);
    const newGroup = this.createArrayItemGroup(clonedFields);
    (newGroup as any)._rowFields = clonedFields;
    array.push(newGroup);
    this.refreshFormErrors();
  }

  private getFreshRowFields(fields: DynamicField[]): DynamicField[] {
    const cloned = JSON.parse(JSON.stringify(fields || []));
    this.stripRuntimeState(cloned);
    return cloned;
  }

  private stripRuntimeState(fields: any[]): void {
    fields.forEach(f => {
      delete f._conditionTree;
      delete f._dynamicOptions;
      delete f._dynamicOptionsLoading;
      delete f._dynamicOptionsLoadedFor;
      if (f.fields?.length) {
        this.stripRuntimeState(f.fields); // in case of further nesting
      }
    });
  }

  private createArrayItemGroup(fields: DynamicField[], itemValue: any = {}): FormGroup {
    return this.createFieldGroup(fields, itemValue);
  }

  private createFieldGroup(fields: DynamicField[], groupValue: any = {}): FormGroup {
    const group = this.fb.group({});
    const values = groupValue && typeof groupValue === 'object' && !Array.isArray(groupValue)
      ? groupValue
      : {};

    (fields || []).forEach(field => {
      if (!field.control_name) {
        return;
      }

      if (this.getDynamicFieldType(field) === 'array') {
        const nestedArray = this.createNestedArray(field, values[field.control_name]);
        group.addControl(field.control_name, nestedArray);
        return;
      }

      if (this.getDynamicFieldType(field) === 'group') {
        const nestedGroup = this.createFieldGroup(field.fields || [], values[field.control_name]);
        if (field.disabled === true) {
          nestedGroup.disable({ emitEvent: false });
        }
        group.addControl(field.control_name, nestedGroup);
        return;
      }

      if (!group.get(field.control_name)) {
        group.addControl(
          field.control_name,
          this.fb.control(
            {
              value: this.getInitialFieldValue(field, values[field.control_name]),
              disabled: field.disabled === true
            },
            this.getValidatorsFromField(field)
          )
        );
      }
    });

    return group;
  }

  private ensureFieldValidationState(field: DynamicField): void {
    if (!field?.control_name) {
      return;
    }

    const type = this.getDynamicFieldType(field);

    if (this.formErrors[field.control_name] === undefined) {
      this.formErrors[field.control_name] = type === 'array' ? [] : type === 'group' ? {} : '';
    }

    if (this.validationMessages[field.control_name] === undefined) {
      this.validationMessages[field.control_name] = this.getFieldValidationMessages(field);
    }

    if ((type === 'array' || type === 'group') && field.fields?.length) {
      this.validationMessages[field.control_name] = field.fields.reduce((acc: any, child) => {
        acc[child.control_name] = this.getFieldValidationMessages(child);
        return acc;
      }, {});

      field.fields.forEach(child => this.ensureFieldValidationState(child));
    }
  }

  private getInitialFieldValue(field: DynamicField, explicitValue: any): any {
    if (explicitValue !== undefined) {
      return explicitValue;
    }

    if (field.default !== undefined) {
      return field.default;
    }

    switch (field.type) {
      case 'checkbox':
        return false;
      case 'multiselect':
        return [];
      default:
        return '';
    }
  }

  private getValidatorsFromField(field: DynamicField): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (field.required === true) {
      validators.push(Validators.required);
    }
    if (field.maxlength) {
      validators.push(Validators.maxLength(field.maxlength));
    }
    if (Array.isArray(field.validators)) {
      field.validators.forEach((validator: DynamicValidator) => {
        switch (validator.type) {
          case 'required':
            validators.push(Validators.required);
            break;
          case 'pattern':
            validators.push(Validators.pattern(validator.value));
            break;
          case 'min':
            validators.push(Validators.min(validator.value));
            break;
          case 'max':
            validators.push(Validators.max(validator.value));
            break;
          case 'json':
            validators.push(this.jsonValidator());
            break;
        }
      });
      return validators;
    }
    if (field.validators?.required) {
      validators.push(Validators.required);
    }
    if (field.validators?.pattern) {
      validators.push(Validators.pattern(field.validators.pattern));
    }
    if (field.validators?.min !== undefined) {
      validators.push(Validators.min(field.validators.min));
    }
    if (field.validators?.max !== undefined) {
      validators.push(Validators.max(field.validators.max));
    }
    if (field.validators?.json) {
      validators.push(this.jsonValidator());
    }
    if (field.control_name === 'param_name') {
      validators.push(this.paramNameValidator());
    }
    return validators;
  }

  private getArrayValidatorsFromField(field: DynamicField): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (field.min_items) {
      validators.push(Validators.minLength(field.min_items));
    }
    const hasParamName = field.fields?.some(f => f.control_name === 'param_name');
    if (hasParamName) {
      validators.push(this.uniqueParamNameValidator('param_name'));
    }
    return validators;
  }

  private getFieldValidationMessages(field: DynamicField): any {
    const label = field.label || this.prettify(field.control_name);
    const messages: any = {
      required: `${label} is required.`,
      pattern: `${label} is invalid.`,
      min: `${label} is below the minimum allowed value.`,
      max: `${label} exceeds the maximum allowed value.`,
      json: `${label} must be valid JSON.`,
      paramName: `${label} must start with a letter or underscore, not a number or special character.`
    };
    if (Array.isArray(field.validators)) {
      field.validators.forEach((validator: DynamicValidator) => {
        if (validator.message) {
          messages[validator.type] = validator.message;
        }
      });
    }
    return messages;
  }
  private getAllValidationMessages(): string[] {
    const messages: string[] = [];
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.collectFieldMessages(this.nodeForm, tab.fields || [], messages);
    });
    return messages;
  }
  private paramNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const invalid = /^[^a-zA-Z_]/.test(control.value);
      return invalid ? { paramName: true } : null;
    };
  }

  private uniqueParamNameValidator(controlName: string): ValidatorFn {
    return (array: AbstractControl): ValidationErrors | null => {
      const formArray = array as FormArray;
      const values = formArray.controls
        .map(group => (group as FormGroup).get(controlName)?.value)
        .filter(v => !!v);
      const hasDuplicates = values.some((v, i) => values.indexOf(v) !== i);
      return hasDuplicates ? { uniqueParamName: true } : null;
    };
  }

  private jsonValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      try {
        JSON.parse(control.value);
        return null;
      } catch {
        return { json: true };
      }
    };
  }


  private collectFieldMessages(form: FormGroup, fields: DynamicField[], messages: string[], prefix: string = ''): void {
    fields.forEach(field => {
      if (!this.evaluateVisibleWhen(field.visible_when, form)) {
        return;
      }

      if (this.getDynamicFieldType(field) === 'array') {
        const formArray = form.get(field.control_name) as FormArray;
        if (formArray) {
          if (formArray.errors?.['uniqueParamName']) {
            messages.push(`${field.label || field.control_name}: param_name must be unique across all items.`);
          }
          formArray.controls.forEach((control, index) => {
            this.collectFieldMessages(
              control as FormGroup,
              field.fields || [],
              messages,
              `${field.label || field.control_name}[${index + 1}]`
            );
          });
        }
        return;
      }

      if (this.getDynamicFieldType(field) === 'group') {
        const nestedGroup = form.get(field.control_name) as FormGroup;
        if (nestedGroup) {
          this.collectFieldMessages(
            nestedGroup,
            field.fields || [],
            messages,
            `${prefix ? `${prefix} > ` : ''}${field.label || field.control_name}`
          );
        }
        return;
      }

      const control = form.get(field.control_name);
      if (control?.invalid && control.errors) {
        const fieldMessages = this.getFieldValidationMessages(field);
        Object.keys(control.errors).forEach(errorKey => {
          const message = fieldMessages[errorKey] || `${field.control_name} is invalid.`;
          messages.push(prefix ? `${prefix} > ${message}` : message);
        });
      }
    });
  }
  private prettify(value: string): string {
    return (value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());
  }

  getDynamicFieldType(field: DynamicField): string {
    return field?.type || (field?.fields?.length ? 'array' : 'text');
  }

  getDynamicControl(form: FormGroup, controlName: string): FormControl {
    return form.get(controlName) as FormControl;
  }

  getDynamicFormArray(form: FormGroup, controlName: string): FormArray {
    return form.get(controlName) as FormArray;
  }

  getDynamicFormGroup(form: FormGroup, controlName: string): FormGroup {
    return form.get(controlName) as FormGroup;
  }

  asDynamicFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  getDynamicOptions(field: DynamicField, form?: FormGroup): any[] {
    if (field.options_api && form) {
      const cacheKey = this.getDynamicOptionsCacheKey(field, form);
      return this.dynamicOptionStore[cacheKey] || [];
    }
    return Array.isArray(field?.options) ? field.options : [];
  }

  isDynamicOptionsLoading(field: DynamicField, form?: FormGroup): boolean {
    if (!field.options_api || !form) {
      return false;
    }

    const cacheKey = this.getDynamicOptionsCacheKey(field, form);
    return !!this.dynamicOptionLoading[cacheKey];
  }

  getDynamicOptionValue(option: any, field?: DynamicField): any {
    if (option === null || option === undefined || typeof option !== 'object') {
      return option;
    }

    if (field?.options_api) {
      const valueKey = field.options_api.value_key?.trim();
      if (!valueKey) {
        return option;
      }

      const val = this.readPath(option, valueKey);
      if (val !== undefined) return val;
    }

    return option.value ?? option.uuid ?? option.id ?? option.name ?? option;
  }

  getDynamicOptionLabel(option: any, field?: DynamicField): string {
    if (option === null || option === undefined || typeof option !== 'object') {
      return String(option);
    }

    // Use label_key from options_api if available
    if (field?.options_api?.label_key) {
      const val = this.readPath(option, field.options_api.label_key);
      if (val !== undefined) return String(val);
    }

    return option.label ?? option.name ?? option.display_name ?? option.account_name ?? String(option);
  }

  getDynamicOptionCompareWith(field: DynamicField): (left: any, right: any) => boolean {
    let comparator = this.dynamicOptionComparators.get(field);
    if (!comparator) {
      comparator = (left: any, right: any): boolean =>
        this.areDynamicOptionValuesEqual(left, right, field);
      this.dynamicOptionComparators.set(field, comparator);
    }
    return comparator;
  }

  getDynamicTooltip(field: DynamicField): string {
    return field?.helpText || '';
  }

  isDynamicFieldVisible(field: DynamicField, form: FormGroup): boolean {
    if (!field || !form) return false;
    const visible = this.evaluateVisibleWhen(field.visible_when, form);

    if (!visible && field.clear_on_hide !== false) {
      const control = form.get(field.control_name);
      if (control && this.hasDynamicValue(control.value)) {
        setTimeout(() => {
          control instanceof FormGroup || control instanceof FormArray
            ? control.reset()
            : control.setValue('');
          this.refreshFormErrors();
        });
      }
    }

    return visible;
  }

  private hasDynamicValue(value: any): boolean {
    if (Array.isArray(value)) {
      return value.some(item => this.hasDynamicValue(item));
    }
    if (value && typeof value === 'object') {
      return Object.values(value).some(item => this.hasDynamicValue(item));
    }
    return value !== '' && value !== null && value !== undefined && value !== false;
  }

  private initializeDynamicOptions(): void {
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.walkFieldContexts(this.nodeForm, tab.fields || [], (field, form) => {
        // target_search uses options_api only to configure its query endpoint.
        // Eager option loading/reconciliation can drop restored targets that are
        // not present in the initial API response, replacing the saved value
        // with an empty array when the node is opened again.
        if (!field.options_api || this.getDynamicFieldType(field) === 'target_search') {
          return;
        }

        if (!this.evaluateVisibleWhen(field.visible_when, form)) {
          return;
        }

        const cacheKey = this.getDynamicOptionsCacheKey(field, form);

        // ← If already in service cache, sync to local store and skip API
        const cached = this.containerSvc.getOptionCache(cacheKey);
        if (cached) {
          const options = this.mapDynamicOptions(cached, field);
          this.dynamicOptionStore[cacheKey] = options;
          this.reconcileDynamicOptionValue(field, form, options);
          return;
        }

        const dependsOn = field.options_api.depends_on;
        if (!dependsOn || dependsOn === '') {
          this.loadOptionsForField(field, form);
          return;
        }

        const dependsValue = form.get(dependsOn)?.value;
        if (dependsValue !== undefined && dependsValue !== null && dependsValue !== '') {
          this.loadOptionsForField(field, form);
        }
      });
    });
  }

  private loadDependentOptionsForFormGroup(targetForm: FormGroup, changedControlName: string): void {
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.walkFieldContexts(this.nodeForm, tab.fields || [], (field, form) => {
        if (form !== targetForm) {
          return;
        }
        if (field.type === 'select' && field.options_api?.depends_on === changedControlName) {
          const isVisible = this.evaluateVisibleWhen(field.visible_when, form);
          if (isVisible) {
            this.loadOptionsForField(field, form);
          }
        }
      });
    });
  }

  private walkFieldContexts(
    form: FormGroup,
    fields: DynamicField[],
    callback: (field: DynamicField, currentForm: FormGroup) => void
  ): void {
    (fields || []).forEach(field => {
      callback(field, form);

      if (this.getDynamicFieldType(field) === 'array') {
        const formArray = form.get(field.control_name) as FormArray;
        if (!formArray?.controls?.length) {
          return;
        }

        formArray.controls.forEach(control => {
          this.walkFieldContexts(control as FormGroup, field.fields || [], callback);
        });
      }

      if (this.getDynamicFieldType(field) === 'group') {
        const nestedGroup = form.get(field.control_name) as FormGroup;
        if (nestedGroup) {
          this.walkFieldContexts(nestedGroup, field.fields || [], callback);
        }
      }
    });
  }

  private loadOptionsForField(field: DynamicField, form: FormGroup): void {
    const endpoint = this.resolveDynamicEndpoint(field, form);
    const cacheKey = this.getDynamicOptionsCacheKey(field, form);
    const control = form.get(field.control_name);

    if (!endpoint) {
      this.containerSvc.setOptionCache(cacheKey, []);  // ← replace this.dynamicOptionStore[cacheKey] = []
      return;
    }

    // ← Check service cache first, skip API call if already loaded
    const cached = this.containerSvc.getOptionCache(cacheKey);
    if (cached) {
      const options = this.mapDynamicOptions(cached, field);
      this.dynamicOptionStore[cacheKey] = options;
      this.reconcileDynamicOptionValue(field, form, options);
      return;
    }

    if (this.dynamicOptionLoading[cacheKey]) {
      return;
    }

    this.dynamicOptionLoading[cacheKey] = true;
    const valueBeforeLoad = control?.value;

    this.fetchDynamicOptions(field, form, endpoint).subscribe({
      next: (items: any[]) => {
        this.containerSvc.setOptionCache(cacheKey, items);
        this.dynamicOptionStore[cacheKey] = items;
        this.dynamicOptionLoading[cacheKey] = false;
        this.reconcileDynamicOptionValue(field, form, items, valueBeforeLoad);
      },
      error: () => {
        this.containerSvc.setOptionCache(cacheKey, []);
        this.dynamicOptionStore[cacheKey] = [];
        this.dynamicOptionLoading[cacheKey] = false;
      }
    });
  }

  private resolveFormApiEndpoint(field: DynamicField, form: FormGroup): string {
    const config = field.form_api;
    if (!config?.endpoint) return '';

    const dependsOn = config.depends_on;
    if (!dependsOn || !dependsOn.trim()) {   // ← blank depends_on, no placeholder to fill
      return config.endpoint;
    }

    const dependsValue = form.get(dependsOn)?.value;
    return config.endpoint.replace(`{${dependsOn}}`, dependsValue ?? '');
  }

  private loadFormApiForField(field: DynamicField, form: FormGroup): void {
    const config = field.form_api;
    if (!config) return;

    const dependsOn = config.depends_on;

    // ← depends_on blank => use static form_data sitting next to form_api in JSON
    if (!dependsOn || !dependsOn.trim()) {
      console.log(`form_data (static) for ${field.control_name}:`, field.form_data);
      return;
    }

    const dependsValue = form.get(dependsOn)?.value;
    if (dependsValue === undefined || dependsValue === null || dependsValue === '') {
      return; // nothing selected yet, don't call
    }

    const endpoint = this.resolveFormApiEndpoint(field, form);
    if (!endpoint) return;

    this.http.get<any>(endpoint).subscribe({
      next: (response) => console.log(`form_api response for ${field.control_name}:`, response),
      error: (err) => console.error(`form_api error for ${field.control_name}:`, err)
    });
  }

  private loadDependentFormApiForFormGroup(targetForm: FormGroup, changedControlName: string): void {
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.walkFieldContexts(this.nodeForm, tab.fields || [], (field, form) => {
        if (form !== targetForm) return;
        if (field.type === 'filter' || field.type === 'condition' && field.form_api?.depends_on === changedControlName) {
          this.loadFormApiForField(field, form);   // ← itsm_table changed → fires this
        }
      });
    });
  }

  private fetchDynamicOptions(field: DynamicField, form: FormGroup, endpoint: string): Observable<any[]> {
    return this.http.get<any>(endpoint).pipe(
      map(response => this.extractAndMapOptions(response, field)),
      catchError(() => of([]))
    );
  }

  private resolveDynamicEndpoint(field: DynamicField, form: FormGroup): string {
    const config = field.options_api;
    if (!config) {
      return '';
    }

    const dependsValue = config.depends_on
      ? form.get(config.depends_on)?.value
      : undefined;
    const endpointByValue = config.endpoint_by_value;

    if (endpointByValue && dependsValue !== undefined && dependsValue !== null) {
      const exactEndpoint = endpointByValue[String(dependsValue)];
      if (exactEndpoint) {
        return exactEndpoint;
      }

      const normalizedDependency = String(dependsValue).trim().toUpperCase();
      const matchingKey = Object.keys(endpointByValue).find(
        key => key.trim().toUpperCase() === normalizedDependency
      );
      if (matchingKey) {
        return endpointByValue[matchingKey];
      }
    }

    if (endpointByValue && !config.depends_on?.trim()) {
      const endpoints = Object.values(endpointByValue).filter(Boolean);
      if (endpoints.length === 1) {
        return endpoints[0];
      }
    }

    return config.endpoint || '';
  }

  private reconcileDynamicOptionValue(
    field: DynamicField,
    form: FormGroup,
    options: any[],
    savedValue: any = form.get(field.control_name)?.value
  ): void {
    const control = form.get(field.control_name);
    if (!control || !field.options_api) {
      return;
    }

    const storesObject = !field.options_api.value_key?.trim();
    const optionValues = (options || []).map(option => ({
      identity: this.getDynamicOptionIdentity(option, field),
      value: storesObject ? option : this.getDynamicOptionValue(option, field)
    }));
    const findOptionValue = (value: any): any => {
      const comparableValue = this.getDynamicOptionIdentity(value, field);
      const match = optionValues.find(optionValue =>
        String(optionValue.identity) === String(comparableValue)
      );
      return match?.value;
    };

    if (Array.isArray(savedValue)) {
      const normalizedValues = savedValue
        .map(findOptionValue)
        .filter(value => value !== undefined);
      const isUnchanged = normalizedValues.length === savedValue.length &&
        normalizedValues.every((value, index) => value === savedValue[index]);
      if (!isUnchanged) {
        control.setValue(normalizedValues);
      }
      return;
    }

    if (savedValue === undefined || savedValue === null || savedValue === '') {
      return;
    }

    // A select can also contain an expression instead of a concrete option.
    // Loading its option list must not discard that saved expression.
    if (this.isExpressionValue(savedValue)) {
      return;
    }

    const normalizedValue = findOptionValue(savedValue);
    if (normalizedValue === undefined) {
      control.setValue('');
    } else if (normalizedValue !== savedValue) {
      // Use the fetched option value/instance so Angular can render a restored
      // selection whether the API config stores a scalar or the full object.
      control.setValue(normalizedValue);
    }
  }

  private getDynamicOptionIdentity(value: any, field?: DynamicField): any {
    if (value === null || value === undefined || typeof value !== 'object') {
      return value;
    }

    const valueKey = field?.options_api?.value_key?.trim();
    if (valueKey) {
      const configuredValue = this.readPath(value, valueKey);
      if (configuredValue !== undefined) {
        return configuredValue;
      }
    }

    const stableIdentity = value.uuid ?? value.id ?? value.value;
    if (stableIdentity !== undefined && stableIdentity !== null) {
      return stableIdentity;
    }

    const labelKey = field?.options_api?.label_key?.trim();
    if (labelKey) {
      const configuredLabel = this.readPath(value, labelKey);
      if (configuredLabel !== undefined && configuredLabel !== null) {
        return configuredLabel;
      }
    }

    return value.name ?? value.email ?? value.key ?? value.code ?? JSON.stringify(value);
  }

  private areDynamicOptionValuesEqual(left: any, right: any, field: DynamicField): boolean {
    if (left === right) {
      return true;
    }
    if (left === null || left === undefined || right === null || right === undefined) {
      return false;
    }

    const leftIdentity = this.getDynamicOptionIdentity(left, field);
    const rightIdentity = this.getDynamicOptionIdentity(right, field);
    if (typeof leftIdentity === 'object' || typeof rightIdentity === 'object') {
      return false;
    }

    return String(leftIdentity) === String(rightIdentity);
  }

  private getDynamicOptionsCacheKey(field: DynamicField, form: FormGroup): string {
    const endpoint = this.resolveDynamicEndpoint(field, form);
    const dependsValue = field.options_api?.depends_on
      ? form.get(field.options_api.depends_on)?.value
      : '';
    return `${field.control_name}__${endpoint}__${String(dependsValue ?? '')}`;
  }

  private extractOptionItems(response: any, dataPath?: string): any[] {
    if (!dataPath) {
      if (Array.isArray(response)) {
        return response;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response?.results)) {
        return response.results;
      }
      return [];
    }

    const value = this.readPath(response, dataPath);
    return Array.isArray(value) ? value : [];
  }

  private mapDynamicOptions(items: any[], field: DynamicField): any[] {
    const labelKey = field.options_api?.label_key || 'label';
    const valueKey = field.options_api?.value_key?.trim();

    // An empty value_key means the form value must be the complete API object.
    // Keep the raw items so the select's ngValue receives that object directly.
    if (!valueKey) {
      return items || [];
    }

    return (items || []).map(item => ({
      label:
        this.readPath(item, labelKey) ??
        item.label ??
        item.name ??
        item.account_name ??
        item.display_name ??
        String(item),
      value:
        this.readPath(item, valueKey) ??
        item.value ??
        item.uuid ??
        item.id ??
        item.name ??
        item
    }));
  }

  private readPath(obj: any, path: string): any {
    if (!obj || !path) {
      return undefined;
    }

    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  private evaluateVisibleWhen(visibleWhen: any, form: FormGroup): boolean {
    if (!visibleWhen) {
      return true;
    }

    const conditions = Array.isArray(visibleWhen) ? visibleWhen : [visibleWhen];

    // logic lives on the object, not the array — so read from original if object, default 'all' for arrays
    const logic = Array.isArray(visibleWhen)
      ? (visibleWhen.find(c => c.logic)?.logic ?? 'all')
      : (visibleWhen.logic ?? 'all');

    const results = conditions.map(condition => {
      const key = condition.field ?? condition.control_name;
      const controlValue = form.get(key)?.value;

      if (condition.operator === 'neq') {
        return Array.isArray(condition.value)
          ? !condition.value.includes(controlValue)
          : controlValue !== condition.value;
      }

      if (condition.value !== undefined) {
        return Array.isArray(condition.value)
          ? condition.value.includes(controlValue)
          : controlValue === condition.value;
      }

      if (condition.not_value !== undefined) {
        return Array.isArray(condition.not_value)
          ? !condition.not_value.includes(controlValue)
          : controlValue !== condition.not_value;
      }

      return true;
    });
    return logic === 'any' ? results.some(Boolean) : results.every(Boolean);
  }

  isDynamicFieldRequired(field: DynamicField): boolean {
    if (field?.required === true) {
      return true;
    }

    if (Array.isArray(field?.validators)) {
      return field.validators.some(v => v?.type === 'required');
    }

    return field?.validators?.required === true;
  }

  removeDynamicArrayItem(field: DynamicField, index: number, form: FormGroup): void {
    const array = this.getDynamicFormArray(form, field.control_name);
    if (!array) {
      return;
    }

    array.removeAt(index);
    this.refreshFormErrors();
  }

  onDynamicFieldChange(field: DynamicField, form?: FormGroup): void {
    const currentForm = form || this.nodeForm;
    this.loadDependentOptionsForFormGroup(currentForm, field.control_name);
    // A controlling field can make API-backed fields visible without being their
    // options_api dependency (for example, the human approval toggle).
    this.initializeDynamicOptions();
    this.loadDependentFormApiForFormGroup(currentForm, field.control_name);
    this.refreshFormErrors();
  }

  getDynamicError(
    errors: any,
    field: DynamicField,
    arrayName?: string,
    index?: number,
    controlName?: string
  ): string {
    const key = controlName || field?.control_name;

    if (!errors || !key) {
      return '';
    }

    if (arrayName !== undefined && index !== undefined) {
      const arrayErrors = errors?.[arrayName];
      if (Array.isArray(arrayErrors)) {
        return arrayErrors[index]?.[key] || '';
      }
      return '';
    }

    return errors?.[key] || '';
  }

  getDynamicArrayErrors(errors: any, arrayName: string, index: number): any {
    const arrayErrors = errors?.[arrayName];
    return Array.isArray(arrayErrors) ? (arrayErrors[index] || {}) : {};
  }

  getDynamicGroupErrors(errors: any, groupName: string): any {
    return errors?.[groupName] || {};
  }

  // private refreshFormErrors(): void {
  //   this.formErrors = this.buildErrorsForTabs(this.nodeForm, this.dynamicSchema.tabs || []);
  // }

  private refreshFormErrors(): void {
    this.formErrors = this.buildErrorsForTabs(this.nodeForm, this.dynamicSchema.tabs || []);
  }

  private buildErrorsForTabs(form: FormGroup, tabs: DynamicTab[]): any {
    const result: any = {};

    tabs.forEach(tab => {
      const tabErrors = this.buildErrorsForFields(form, tab.fields || []);
      Object.keys(tabErrors).forEach(key => {
        result[key] = tabErrors[key];
      });
    });

    return result;
  }

  private buildErrorsForFields(form: FormGroup, fields: DynamicField[]): any {
    const result: any = {};
    (fields || []).forEach(field => {
      if (!field.control_name || !this.evaluateVisibleWhen(field.visible_when, form)) {
        return;
      }
      if (this.getDynamicFieldType(field) === 'array') {
        const array = form.get(field.control_name) as FormArray;
        if (array?.errors?.['uniqueParamName']) {
          result[`${field.control_name}_error`] = `${field.label || field.control_name}: param_name must be unique across all items.`;
        }
        result[field.control_name] = Array.isArray(array?.controls)
          ? array.controls.map(ctrl => this.buildErrorsForFields(ctrl as FormGroup, field.fields || []))
          : [];
        return;
      }

      if (this.getDynamicFieldType(field) === 'group') {
        const nestedGroup = form.get(field.control_name) as FormGroup;
        result[field.control_name] = nestedGroup
          ? this.buildErrorsForFields(nestedGroup, field.fields || [])
          : {};
        return;
      }
      const control = form.get(field.control_name);
      result[field.control_name] = this.getControlErrorMessage(control, field);
    });
    return result;
  }

  private getControlErrorMessage(control: AbstractControl | null, field: DynamicField): string {
    if (!control || !control.errors || !(control.touched || control.dirty)) {
      return '';
    }
    const messages = this.validationMessages[field.control_name] || this.getFieldValidationMessages(field);
    const errorKeys = Object.keys(control.errors);
    if (!errorKeys.length) {
      return '';
    }
    return messages[errorKeys[0]] || `${field.label || field.control_name} is invalid.`;
  }

  onDateChange(event: { value: Date | null }, field: any, form: AbstractControl): void {
    const date = event.value;
    if (!date) {
      form.get(field.control_name)?.setValue(null, { emitEvent: true });
      return;
    }

    if (field.type === 'date') {
      // Store as ISO date string e.g. "2025-06-04"
      const iso = date.toISOString().split('T')[0];
      form.get(field.control_name)?.setValue(iso, { emitEvent: true });
    } else {
      // Store as full ISO string e.g. "2025-06-04T14:30:00.000Z"
      form.get(field.control_name)?.setValue(date.toISOString(), { emitEvent: true });
    }
  }

  private markAllTouched(control: AbstractControl): void {
    if (control instanceof FormControl) {
      control.markAsTouched();
      control.updateValueAndValidity();
      return;
    }

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(child => this.markAllTouched(child));
      return;
    }

    if (control instanceof FormArray) {
      control.controls.forEach(child => this.markAllTouched(child));
    }
  }

  getFieldMode(field: DynamicField, form: FormGroup): 'normal' | 'expression' {
    const key = this.getFieldStateKey(field, form);
    if (key in this.fieldModes) {
      return this.fieldModes[key];
    }
    // Default to normal. Only becomes expression if the raw value matches the token pattern.
    const raw = form.get(field.control_name)?.value;
    if (raw === null || raw === undefined || raw === '') {
      return 'normal';
    }
    return this.isExpressionValue(raw) ? 'expression' : 'normal';
  }

  setFieldMode(field: DynamicField, form: FormGroup, mode: 'normal' | 'expression'): void {
    const key = this.getFieldStateKey(field, form);
    const currentMode = this.getFieldMode(field, form);
    if (currentMode === mode) {
      return; // no-op, nothing to switch
    }
    const control = form.get(field.control_name);
    const currentVal = control?.value;
    const currentText = this.getDisplayText(currentVal);

    if (!this.fieldValues[key]) {
      this.fieldValues[key] = {};
    }
    // Preserve the native value for Value mode (number, boolean, object, etc.)
    // and the display text for Expr mode.
    this.fieldValues[key][currentMode] = currentMode === 'normal' ? currentVal : currentText;

    this.fieldModes[key] = mode;

    // Restore only the value previously entered in the destination mode.
    // Value and Expr are independent; an unvisited mode starts empty.
    const hasSavedValue = Object.prototype.hasOwnProperty.call(this.fieldValues[key], mode);
    const restoreValue = hasSavedValue
      ? this.fieldValues[key][mode]
      : '';
    this.fieldValues[key][mode] = restoreValue;
    control?.setValue(restoreValue);
    this.refreshFormErrors();
  }

  onNormalInput(event: Event, field: DynamicField, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    const text = input.value;
    const key = this.getFieldStateKey(field, form);

    form.get(field.control_name)?.setValue(text, { emitEvent: true });

    if (!this.fieldValues[key]) {
      this.fieldValues[key] = {};
    }

    // If what's typed/dropped into the normal field matches the token pattern,
    // auto-toggle over to expression mode.
    if (this.isExpressionValue(text)) {
      this.fieldModes[key] = 'expression';
      this.fieldValues[key].expression = text;
    } else {
      this.fieldValues[key].normal = text;
    }
  }

  onNumberDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onNumberDrop(event: DragEvent, field: DynamicField, form: FormGroup): void {
    event.preventDefault();
    event.stopPropagation();

    const expression = event.dataTransfer?.getData('text/plain') || '';
    if (!expression) {
      return;
    }

    const key = this.getFieldStateKey(field, form);
    const control = form.get(field.control_name);
    if (!this.fieldValues[key]) {
      this.fieldValues[key] = {};
    }

    // Keep the native number intact for Value mode and bypass the browser's
    // type="number" sanitizer, which otherwise turns a dropped token into a
    // fragment such as ".e14" before Angular receives it.
    this.fieldValues[key].normal = control?.value;
    this.fieldValues[key].expression = expression;
    this.fieldModes[key] = 'expression';
    control?.setValue(expression, { emitEvent: true });
    this.refreshFormErrors();
  }

  onExprInput(event: Event, field: DynamicField, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    const val = input.value;
    form.get(field.control_name)?.setValue(val, { emitEvent: true });
    const key = this.getFieldStateKey(field, form);
    if (!this.fieldValues[key]) {
      this.fieldValues[key] = {};
    }
    this.fieldModes[key] = 'expression';
    this.fieldValues[key].expression = val;
  }

  getDisplayValue(field: DynamicField, form: FormGroup): string {
    const raw = form.get(field.control_name)?.value;
    return typeof raw === 'string' ? raw : JSON.stringify(raw ?? '');
  }

  private restoreFieldModes(form: FormGroup, fields: DynamicField[]): void {
    fields.forEach(field => {
      const type = this.getDynamicFieldType(field);
      if (type === 'array' && field.fields?.length) {
        const formArray = form.get(field.control_name) as FormArray;
        formArray?.controls.forEach(ctrl => {
          this.restoreFieldModes(ctrl as FormGroup, field.fields!);
        });
      }
      if (type === 'group' && field.fields?.length) {
        const nestedGroup = form.get(field.control_name) as FormGroup;
        if (nestedGroup) {
          this.restoreFieldModes(nestedGroup, field.fields);
        }
      }
      if (!['text', 'text_area', 'number', 'checkbox', 'radio', 'select', 'password', 'multiselect', 'target_search'].includes(type)) return;

      const key = this.getFieldStateKey(field, form);
      const raw = form.get(field.control_name)?.value;

      const isEmpty = raw === null || raw === undefined || raw === '';
      const val: string = isEmpty ? '' : this.getDisplayText(raw);
      const isExpression = !isEmpty && this.isExpressionValue(val);

      this.fieldModes[key] = isExpression ? 'expression' : 'normal';

      this.fieldValues[key] = isExpression
        ? { expression: val }
        : { normal: raw };
    });
  }

  private getFieldStateKey(field: DynamicField, form: FormGroup): string {
    if (!this.fieldFormIds.has(form)) {
      this.fieldFormIds.set(form, `form_${++this.nextFieldFormId}`);
    }
    return `${this.fieldFormIds.get(form)}.${field.control_name}`;
  }

  private isExpressionValue(value: any): boolean {
    const text = this.getDisplayText(value).trim();
    return !!text && /\{\{[^{}]+\}\}/.test(text);
  }

  private getDisplayText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  /////////////////////////////////////////////////////////////// START CONDITION BUILDER ///////////////////////////////////////////////////////
  // Don't Add anything until you see End Condition builder comment

  getColClass(width: string) {
    switch (width) {
      case 'half':
        return 'col-md-6';
      case 'full':
        return 'col-md-12';
      case 'auto':
        return 'col-auto';
      default:
        return 'col-md-12';
    }
  }

  // component.ts — inside getConditionTree()
  getConditionTree(field: any): ConditionGroup {
    if (!field._conditionTree) {
      const savedValue = this.initialValues?.[field.control_name || field.key];
      if (savedValue && (savedValue.children?.length || savedValue.field !== undefined)) {
        field._conditionTree = this.parseConditionPayload(savedValue);
      } else {
        field._conditionTree = { type: 'group', condition: 'AND', children: [] };
        const minConditions = this.getMinConditions(field); // <-- fixed helper below
        for (let i = 0; i < minConditions; i++) {
          field._conditionTree.children.push(this.createRule());
        }
      }
    }
    if (field.condition_type === 'DYNAMIC') {
      const currentDependsOnValue = this.getDependsOnValue(field);
      const needsFetch = !field._dynamicOptionsLoading
        && field._dynamicOptionsLoadedFor !== currentDependsOnValue;
      if (needsFetch) {
        this.loadDynamicFieldOptions(field);
      }
    }
    return field._conditionTree;
  }

  private getMinConditions(field: any): number {
    return field?.min_conditions === undefined || field?.min_conditions === null
      ? 1
      : field.min_conditions;
  }

  private parseConditionPayload(node: any): ConditionRule | ConditionGroup {
    if (!node) {
      return { type: 'group', condition: 'AND', children: [] };
    }
    if (node.children) {
      return {
        type: 'group',
        condition: (node.logic || 'and').toUpperCase() as 'AND' | 'OR',
        children: (node.children || []).map((c: any) => this.parseConditionPayload(c))
      };
    }
    return {
      type: 'rule',
      field: node.field ?? '',
      // field_label: node.field_label ?? '',
      data_type: normalizeDataType(node.dataType || node.data_type),
      operator: (node.operator || 'EQUALS').toUpperCase(),
      value: node.value ?? '',
      ignoreCase: node.ignoreCase ?? false
    };
  }

  createRule(): ConditionRule {
    return {
      type: 'rule',
      field: '',
      // field_label: '',
      data_type: 'STRING',
      operator: 'EQUALS',
      value: '',
      ignoreCase: false
    };
  }

  getFieldValidationMessage(key: 'field' | 'data_type' | 'operator' | 'value'): string {
    return CONDITION_VALIDATION_MESSAGES[key];
  }

  isRuleInvalid(rule: ConditionRule, sub: 'field' | 'data_type' | 'operator' | 'value'): boolean {
    switch (sub) {
      case 'field':
        return !rule.field;
      case 'data_type':
        return !rule.data_type;
      case 'operator':
        return !rule.operator;
      case 'value': {
        const kind = this.getValueInputKind(null, rule);
        return kind !== 'none' && (rule.value === '' || rule.value === null || rule.value === undefined);
      }
    }
  }

  private isDependencySatisfied(field: any): boolean {
    if (field?.condition_type !== 'DYNAMIC') return true;
    const dependsOn = field.form_api?.depends_on;
    if (!dependsOn) return true; // dynamic but no dependency configured
    const value = this.getDependsOnValue(field);
    return value !== undefined && value !== null && value !== '';
  }

  canAddSibling(group: ConditionGroup, field?: any): boolean {
    if (!this.isDependencySatisfied(field)) return false;
    return isGroupComplete(group);
  }

  getAddDisabledReason(group: ConditionGroup, field: any): string {
    if (!this.isDependencySatisfied(field)) {
      return `Select "${field?.form_api?.depends_on}" first`;
    }
    if (!isGroupComplete(group)) {
      return 'Fill all fields in existing rules first';
    }
    return '';
  }

  addRule(group: ConditionGroup) {
    if (!this.canAddSibling(group)) {
      return;
    }
    group.children.push(this.createRule());
  }

  addGroup(group: ConditionGroup) {
    if (!this.canAddSibling(group)) {
      return;
    }
    group.children.push({
      type: 'group',
      condition: 'AND',
      children: [this.createRule()]
    });
  }

  removeChild(parentGroup: ConditionGroup, index: number, field: any) {
    parentGroup.children.splice(index, 1);
  }

  private countRules(node: any): number {
    if (!node) return 0;
    if (node.type === 'rule') return 1;
    return (node.children || []).reduce((sum: number, c: any) => sum + this.countRules(c), 0);
  }

  isConditionFieldValid(field: any): boolean {
    const tree = this.getConditionTree(field);
    const min = this.getMinConditions(field);
    const ruleCount = this.countRules(tree);

    if (ruleCount === 0) {
      // nothing added — only a problem if a minimum is actually required
      return min <= 0 ? true : false;
    }

    // something was added — regardless of min_conditions, it must be complete
    if (ruleCount < min) {
      return false;
    }
    return isGroupComplete(tree);
  }

  private validateConditionFields(): boolean {
    let allValid = true;
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      (tab.fields || []).forEach(field => {
        allValid = this.validateConditionFieldRecursive(field, this.nodeForm, this.formErrors) && allValid;
      });
    });
    return allValid;
  }

  private validateConditionFieldRecursive(field: any, form: FormGroup, errorsContainer: any): boolean {
    let valid = true;
    const key = field.control_name || field.key;

    // Conditional fields that are not rendered must not keep the node invalid.
    // In particular, a Loop in FOREACH mode hides the WHILE condition builder.
    if (!this.evaluateVisibleWhen(field.visible_when, form)) {
      if (errorsContainer && key) {
        delete errorsContainer[key];
      }
      return true;
    }

    if (field.type === 'condition') {
      valid = this.isConditionFieldValid(field);
      if (errorsContainer && key) {
        errorsContainer[key] = valid ? '' : this.getConditionValidationMessage(field);
      }
      return valid;
    }

    if (field.type === 'array' && field.fields?.length) {
      const array = this.getDynamicFormArray(form, key);
      // ensure the error container has one entry per row, array-shaped, matching ensureFieldValidationState's convention
      if (!Array.isArray(errorsContainer[key])) {
        errorsContainer[key] = [];
      }
      const rowCount = array?.length ?? array?.controls?.length ?? 0;
      for (let i = 0; i < rowCount; i++) {
        const rowGroup = array?.at ? array.at(i) : array?.controls?.[i];
        const rowFields: any[] = (rowGroup as any)?._rowFields || field.fields;
        if (!errorsContainer[key][i]) {
          errorsContainer[key][i] = {};
        }
        rowFields.forEach((childField: any) => {
          valid = this.validateConditionFieldRecursive(childField, rowGroup as FormGroup, errorsContainer[key][i]) && valid;
        });
      }
      return valid;
    }

    if (field.fields?.length && key) {
      const nestedForm = form.get(key) as FormGroup;
      if (!errorsContainer[key] || typeof errorsContainer[key] !== 'object') {
        errorsContainer[key] = {};
      }
      field.fields.forEach((childField: any) => {
        valid = this.validateConditionFieldRecursive(childField, nestedForm || form, errorsContainer[key]) && valid;
      });
      return valid;
    }

    return valid;
  }

  getConditionValidationMessage(field: any): string {
    const tree = this.getConditionTree(field);
    const min = this.getMinConditions(field);
    const ruleCount = this.countRules(tree);

    if (ruleCount === 0) {
      return min > 0 ? `At least ${min} rule${min > 1 ? 's are' : ' is'} required` : '';
    }
    if (ruleCount < min) {
      return `At least ${min} rule${min > 1 ? 's are' : ' is'} required`;
    }
    if (!isGroupComplete(tree)) {
      return 'Please fill all the fields'; // matches if-else's existing message
    }
    return '';
  }

  getSubFieldConfig(key: 'field' | 'data_type' | 'operator' | 'value') {
    return CONDITION_SUB_FIELDS_CONFIG[key];
  }

  getDataTypeOptions(): SelectOption[] {
    return DATA_TYPE_OPTIONS;
  }

  getOperatorOptions(field: any, rule: ConditionRule): SelectOption[] {
    return OPERATORS_BY_DATA_TYPE[rule.data_type] || [];
  }

  onDataTypeChange(field: any, rule: ConditionRule, value: string) {
    rule.data_type = normalizeDataType(value);
    rule.operator = getDefaultOperator(rule.data_type);
    rule.value = '';
    this.cdr.detectChanges();
  }

  onOperatorChange(rule: ConditionRule, value: string) {
    rule.operator = value;
    // clear value when the new operator needs none (e.g. IS_NULL, IS_TRUE)
    if (this.getValueInputKind(null, rule) === 'none') {
      rule.value = '';
    }
  }

  private getDependsOnValue(field: any): any {
    const dependsOn = field.form_api?.depends_on;
    if (!dependsOn) return undefined;
    const context = this.nodeForm?.value || this.initialValues || {};
    return context[dependsOn];
  }

  /* ------------------------------------------------------------------ */
  /* DYNAMIC mode: fetch field metadata from form_api                    */
  /* ------------------------------------------------------------------ */
  // if you have a reactive FormGroup under a different name:
  private loadDynamicFieldOptions(field: any) {
    const api = field.form_api;
    if (!api?.endpoint) {
      field._dynamicOptions = [];
      return;
    }

    const dependsOnValue = this.getDependsOnValue(field);

    // Requested: if this field depends on another field and that field has no value yet, don't call the API at all.
    if (api.depends_on && (dependsOnValue === undefined || dependsOnValue === null || dependsOnValue === '')) {
      field._dynamicOptions = [];
      field._dynamicOptionsLoadedFor = undefined;
      field._dynamicOptionsLoading = false;
      return;
    }

    // Already loading, or already loaded for this exact dependency value — skip, don't refire.
    if (field._dynamicOptionsLoading) {
      return;
    }
    if (field._dynamicOptionsLoadedFor === dependsOnValue && field._dynamicOptions) {
      return;
    }

    const storeKey = field.key;
    this.dynamicOptionLoading[storeKey] = true;
    field._dynamicOptionsLoading = true;
    field._dynamicOptionsLoadedFor = dependsOnValue; // <-- stamp BEFORE the call, synchronously — this is the actual fix

    const context = this.nodeForm?.value || this.initialValues || {};
    const url = resolveEndpointTemplate(api.endpoint, context);

    this.http.get<DynamicFieldMeta[]>(url)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          const list: DynamicFieldMeta[] = Array.isArray(res) ? res : (res?.results || res?.data || []);
          const normalized = list.map(item => ({
            label: item.label,
            value: item.value,
            data_type: normalizeDataType(item.data_type),
            options: item.options || []
          }));

          this.conditionFieldMetaStore[storeKey] = normalized;
          field._dynamicOptions = normalized;
          this.hydrateFieldOptions(field._conditionTree, normalized);

          this.dynamicOptionLoading[storeKey] = false;
          field._dynamicOptionsLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.conditionFieldMetaStore[storeKey] = [];
          field._dynamicOptions = [];
          this.dynamicOptionLoading[storeKey] = false;
          field._dynamicOptionsLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /** After dynamic field metadata loads, backfill _fieldOptions/_fieldHasOptions
  *  on any already-parsed rules (e.g. loaded from a saved condition tree) so
  *  their Value dropdowns can resolve the correct label. */
  private hydrateFieldOptions(node: any, metaList: DynamicFieldMeta[]) {
    if (!node) return;
    if (node.type === 'group') {
      (node.children || []).forEach((c: any) => this.hydrateFieldOptions(c, metaList));
      return;
    }
    // rule
    const meta = metaList.find(m => m.value === node.field);
    if (meta) {
      node._fieldHasOptions = !!(meta.options && meta.options.length);
      node._fieldOptions = meta.options || [];
      // if (!node.field_label) {
      //   node.field_label = meta.label; 
      // }
    }
  }

  /** Options for the Field dropdown in DYNAMIC mode */
  getDynamicFieldOptions(field: any): DynamicFieldMeta[] {
    return field._dynamicOptions || [];
  }

  isDynamicFieldLoading(field: any): boolean {
    return !!field._dynamicOptionsLoading;
  }

  private findDynamicFieldMeta(field: any, rule: ConditionRule): DynamicFieldMeta | undefined {
    return (field._dynamicOptions || []).find((o: DynamicFieldMeta) => o.value === rule.field);
  }

  /** Fired when the user picks a field from the DYNAMIC field dropdown */
  onConditionDynamicFieldChange(field: any, rule: ConditionRule, selectedValue: string) {
    rule.field = selectedValue;
    const meta = this.findDynamicFieldMeta(field, rule);

    if (!meta) {
      rule.data_type = 'STRING';
      rule._fieldHasOptions = false;
      rule._fieldOptions = [];
    } else {
      rule.data_type = meta.data_type as DataType;
      rule._fieldHasOptions = !!(meta.options && meta.options.length);
      rule._fieldOptions = meta.options || [];
    }

    rule.operator = getDefaultOperator(rule.data_type);
    rule.value = '';
    this.cdr.detectChanges();
  }

  /** Data Type select is locked whenever the chosen dynamic field ships its own option list */
  isDataTypeDisabled(field: any, rule: ConditionRule): boolean {
    return field.condition_type === 'DYNAMIC' && !!rule._fieldHasOptions;
  }

  /* ------------------------------------------------------------------ */
  /* Value control resolution                                            */
  /* ------------------------------------------------------------------ */
  /**
   * Returns 'dropdown' | 'text' | 'number' | 'datetime' | 'none'.
   * Dynamic fields with options always win as 'dropdown'; everything
   * else falls back to the data_type/operator lookup table.
   */
  getValueInputKind(field: any, rule: ConditionRule) {
    if (field?.condition_type === 'DYNAMIC' && rule._fieldHasOptions) {
      return 'dropdown';
    }
    return getValueInputKind(rule.data_type, rule.operator);
  }

  getValueOptions(field: any, rule: ConditionRule): SelectOption[] {
    return rule._fieldOptions || [];
  }

  getValuePlaceholder(kind: string) {
    return CONDITION_SUB_FIELDS_CONFIG.value.placeholders[kind] || CONDITION_SUB_FIELDS_CONFIG.value.placeholders.text;
  }

  // Generates a short random id like "6ranf", "vlqsv" etc.
  // private generateId(): string {
  //   return Math.random().toString(36).substring(2, 7);
  // }

  // Converts internal conditionTree (type/condition/data_type) 
  // into backend payload shape (logic/dataType, with ids)
  buildConditionPayload(node: any): any {
    if (!node) return null;

    if (node.type === 'group') {
      const children = (node.children || []).map((child: any) => this.buildConditionPayload(child)).filter((c: any) => c !== null);
      return {
        // id: this.generateId(),
        logic: (node.condition || 'AND').toUpperCase(),
        min_conditions: children.length,
        children: (node.children || [])
          .map((child: any) => this.buildConditionPayload(child))
          .filter((c: any) => c !== null)
      };
    }

    // rule
    return {
      // id: this.generateId(),
      field: node.field ?? '',
      // field_label: node.field_label ?? '',
      data_type: node.data_type ?? 'string',
      operator: node.operator ?? 'eq',
      value: node.value ?? ''
    };
  }
  /////////////////////////////////////////////////////////////// END CONDITION BUILDER ///////////////////////////////////////////////////////


  // ── Call this wherever you set nodeOutput ─────────────────
  // e.g. ngOnInit() { this.nodeOutput = this.MOCK_ARRAY; this.buildOutputViews(this.nodeOutput); }
  buildOutputViews(nodeOutput: any) {
    console.log(nodeOutput, "nodeoutput")
    const ro = nodeOutput?.raw_output ?? nodeOutput;
    if (typeof ro === 'string') {
      this.outputIsString = true;
      this.outputStringValue = ro;
      this.outputTreeNodes = [];
      return;
    }
    this.outputIsString = false;
    // const arr: any[] = Array.isArray(ro) ? ro
    //   : ro && typeof ro === 'object' ? [ro]
    //     : [];
    // this.outputTreeNodes = this.buildTree(arr, 'root');

    if (ro && typeof ro === 'object') {
      this.outputTreeNodes = this.buildTree(ro, 'root');
    } else {
      this.outputTreeNodes = [];
    }
  }

  // ── isTriggerNode helper (deduplicates long *ngIf) ────────
  isTriggerNode(): boolean {
    const types = [
      'Manual Trigger', 'Schedule Trigger', 'Chat Trigger',
      'ITSM Event Trigger', 'Webhook Trigger', 'AIML Event Trigger'
    ];
    return types.includes(this.nodeData?.node_type);
  }

  // ── Tree ──────────────────────────────────────────────────
  buildTree(data: any, path: string): any[] {
    const entries: [string, any][] = Array.isArray(data)
      ? data.map((v, i) => [String(i), v])
      : Object.entries(data || {});

    return entries.map(([k, v]) => {
      // Auto-descend through singleton-array wrappers, e.g. [[['vmware']]]
      let val = v;
      let wraps = 0;
      while (Array.isArray(val) && val.length === 1 && this.getType(val[0]) !== 'object') {
        val = val[0];
        wraps++;
      }
      const type = this.getType(val);
      const displayKey = wraps > 0 ? `${k}${'[0]'.repeat(wraps)}` : k;

      return {
        key: displayKey,
        value: val,
        type,
        path: `${path}.${k}`,
        collapsed: false,
        children: (type === 'object' || type === 'array')
          ? this.buildTree(val, `${path}.${k}`)
          : null
      };
    });
  }

  toggleTreeNode(node: any) { node.collapsed = !node.collapsed; }

  onTreeDrop(event: CdkDragDrop<any[]>, list: any[]) {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
  }

  typeLabelOf(node: any): string {
    if (node.type === 'array') return `array[${node.value?.length}]`;
    if (node.type === 'object') return `object{}`;
    return node.type;
  }

  // ── Shared ────────────────────────────────────────────────
  getType(v: any): string {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
  }

  setChildFieldValue(child: any, value: any): void {
    child.field = value;
  }

  previewValue(v: any): string {
    const t = this.getType(v);
    if (t === 'null') return 'null';
    if (t === 'array') return `[${v.length} items]`;
    if (t === 'object') return `{${Object.keys(v).length} keys}`;
    if (t === 'string') return `"${v}"`;
    return String(v);
  }

  fullPreviewValue(v: any): string {
    if (v === null || v === undefined) return 'null';
    const t = this.getType(v);
    if (t === 'object') return JSON.stringify(v, null, 2);
    if (t === 'array') return JSON.stringify(v, null, 2);
    return String(v);
  }
}

export interface ConditionRule {
  type: 'rule';
  field: string;
  data_type: DataType;
  operator: string;
  value: any;
  ignoreCase?: boolean;
  _fieldHasOptions?: boolean;
  _fieldOptions?: SelectOption[];
  // field_label: string;
}

export interface ConditionGroup {
  type: 'group';
  condition: 'AND' | 'OR';
  children: Array<ConditionRule | ConditionGroup>;
}
