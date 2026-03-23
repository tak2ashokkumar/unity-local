import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  conditionOperators,
  FieldsType,
  NodeDetailsArrayModel,
  nodeTypes,
} from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.type';
import { environment } from 'src/environments/environment';
import {
  cloudAttributes,
  OrchestrationAgenticWorkflowParamsService,
  paramNameValidator,
  TOOLTIP_MESSAGES,
} from './orchestration-agentic-workflow-params.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { catchError, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { OrchestrationAgenticWorkflowContainerService } from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  StorageService,
  StorageType,
} from 'src/app/shared/app-storage/storage.service';
import { cloneDeep as _clone } from 'lodash-es';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { QueryBuilderClassNames, QueryBuilderConfig, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { queryBuilderClassNames } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-correlation-rule-crud/aiml-correlation-rule-crud.service';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { AimlRulesService } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.service';
import { AppLevelService } from 'src/app/app-level.service';


@Component({
  selector: 'orchestration-agentic-workflow-params',
  templateUrl: './orchestration-agentic-workflow-params.component.html',
  styleUrls: ['./orchestration-agentic-workflow-params.component.scss'],
  providers: [OrchestrationAgenticWorkflowParamsService, AimlRulesService],
})

export class OrchestrationAgenticWorkflowParamsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  paramForm!: FormGroup;
  contextVarHeader: boolean = false;
  workflowParamsHeader: boolean = true;
  middlePanelLogo: string = '';
  pillValue: boolean = true;
  form: FormGroup;
  onClose!: (data: any, modalState?: { action?: 'save' | 'test' }) => void;

  // outputForm!: FormGroup;
  // outputFormErrors: any;
  // outputValidationMessage: any;
  updatedOutputData: any;

  updatedFormDatas: any;
  triggerForm!: FormGroup;
  triggerFormErrors: any;
  triggerValidationMessage: any;
  updatedInputData: any;

  scheduleTriggerForm!: any;
  scheduleTriggerFormErrors: any;
  scheduleTriggerValidationMessage: any;
  updatedScheduleInputData: any;

  cloudAccount: any;
  credentials: any;

  onChatMessageForm!: FormGroup;
  onChatMessageFormErrors: any;
  onChatMessageValidationMessage: any;
  updatedOnChatInputData: any;

  itsmForm!: FormGroup;
  itsmFormErrors: any;
  itsmFormValidationMessage: any;

  webhookForm!: FormGroup;
  webhookFormErrors: any;
  webhookFormValidationMessage: any;

  createTicketForm!: FormGroup;
  createTicketFormErrors: any;
  createTicketFormValidationMessage: any;

  updateTicketForm!: FormGroup;
  updateTicketFormErrors: any;
  updateTicketFormValidationMessage: any;

  commentInTicketForm!: FormGroup;
  commentInTicketFormErrors: any;
  commentInTicketFormValidationMessage: any;

  getTicketForm!: FormGroup;
  getTicketFormErrors: any;
  getTicketFormValidationMessage: any;
  testClicked: boolean = false;

  aimlForm!: FormGroup;
  aimlFormErrors: any;
  aimlFormValidationMessage: any;

  contextVars = [
    { key: 'workflow_id', value: '{{ workflow_id }}' },
    { key: 'workflow_name', value: '{{ workflow_name }}' },
    { key: 'execution_id', value: '{{ execution_id }}' },
    { key: 'execution_user', value: '{{ execution_user }}' },
    { key: 'now', value: "{{ now | strftime('%Y-%m-%d %H:%M:%S') }}" },
    { key: 'today', value: "{{ today | strftime('%Y-%m-%d') }}" },
    {
      key: 'yesterday',
      value: "{{ (today - timedelta(days=1)) | strftime('%Y-%m-%d') }}",
    },
  ];

  activeTab;
  nodeId: number;
  nodeData: NodeDetailsArrayModel;
  connectedNodes = [];
  modalName: string;
  accordionState: { [nodeId: number]: boolean } = {};
  isOrcTasks = false;
  propertiesForm: FormGroup;
  propertiesFormErrors: any;
  propertiesFormValidationMessages: any;
  conditionOperators: Array<{ label: string; value: string }> = conditionOperators;
  toolsList = [];
  workflowId: string;
  aiIcon = `${environment.assetsUrl}external-brand/workflow/LLM.svg`;
  tooltip = TOOLTIP_MESSAGES;
  oldNames: { [key: string]: string } = {};
  isPromptExpanded = false;
  expandedLabel;
  expandedFormControlName;
  tableListOptions = [];
  eventTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'value'
  };
  eventTypes = [
    { name: 'Ticket Created', value: 'TICKET_CREATED' },
    { name: 'Ticket Updated', value: 'TICKET_UPDATED' },
    { name: 'Comment Added', value: 'COMMENT_ADDED' }
  ];
  getTicketKeyList = [];
  commentFieldsList = [];
  updateTicketList = [];
  fieldList = [];
  workFlowId;
  itsmFieldCache: Record<string, any[]> = {};
  realTimeData;
  nodeOutput;
  private triggerFieldsInitialized = new Set<string>();
  workflowVarsData;
  workflowVarHeader: boolean = false;
  aimlTypes = ['Event', 'Alert', 'Condition'];
  aimlEventTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'value'
  };
  aimlEventTypes = [
    { name: 'Open', value: 0 },
    { name: 'Resolved', value: 1 }
  ];
  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;
  tagsAutocompleteItems: string[] = [];
  currentRuleSetValue: RuleSet;
  allowRuleset: boolean = true;
  allowCollapse: boolean = false;
  persistValueOnFieldChange: boolean = false;
  aimlData;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private svc: OrchestrationAgenticWorkflowParamsService,
    private utilService: AppUtilityService,
    private containerSvc: OrchestrationAgenticWorkflowContainerService,
    private notification: AppNotificationService,
    private scheduleSvc: UnityScheduleService,
    private spinner: AppSpinnerService,
    private el: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private titleCasePipe: TitleCasePipe,
    private route: ActivatedRoute,
    private aimlRuleSvc: AimlRulesService,
    private appService: AppLevelService
  ) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workFlowId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.nodeId = this.nodeData.node_id;
    this.toolsList = [
      ...this.containerSvc.toolsList.map((t) => ({
        name: t.name,
        image: this.containerSvc.getCenterImageUrl(t.type),
        uuid: t.uuid,
        type: t.type,
      })),
    ];
    if (this.nodeData.node_type === nodeTypes.CreateITSMTicket || this.nodeData.node_type === nodeTypes.UpdateITSMTicket
      || this.nodeData.node_type === nodeTypes.CommentInITSMTicket || this.nodeData.node_type === nodeTypes.GetITSMTicket
      || this.nodeData.node_type === nodeTypes.ItsmTrigger
    ) {
      this.getTableList();
    }
    console.log(this.workflowVarsData)
    this.getConnectedNodes();
    this.middlePanelLogo = this.containerSvc.getCenterImageUrl(
      this.nodeData.node_type
    );
    this.isOrcTasks = this.containerSvc.isPlaybookType(this.nodeData.node_type);
    console.log('>>>>>>>>>>>', this.nodeData);
    console.log('*****************real  time*********', this.realTimeData)
    this.buildForms();
    this.getCloudAccount();
    this.getCredentials();
    this.changeTab(this.modalName ? this.modalName : 'properties');
    // console.log('Cond>>>>>>>>>>>>>>', this.realTimeData, Object.keys(this.realTimeData).length !== 0)
    // if (this.hasRealTimeData()) {
    this.getOutputOfNode();
    // }
  }

  changeTab(val: string) {
    this.activeTab = val;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.connectedNodes = [];
  }

  ngAfterViewInit() {
    const host = this.el.nativeElement;
    const left = host.querySelector(
      'unity-schedule .col-2-w'
    ) as HTMLElement | null;
    const right = host.querySelector(
      'unity-schedule .col-8-w'
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

  getTableList() {
    this.spinner.start('main');
    this.svc.getTableList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tableListOptions = res.results;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }
  getConnectedNodes() {
    if (this.connectedNodes.length) {
      this.connectedNodes = this.connectedNodes.map((node) => {
        if (
          node.node_type !== nodeTypes.ManualTrigger &&
          node.node_type !== nodeTypes.ScheduleTrigger &&
          node.node_type !== nodeTypes.OnChatMessageTrigger
        ) {
          const outputNode = {
            param_name: 'outputs',
            children: node.outputs || [],
          };
          const statusNode = {
            param_name: 'status',
            expression_type: 'String',
            expression: '',
          };
          const rawOutputNode = {
            param_name: 'raw_output',
            expression_type: 'String',
            expression: '',
          };

          if (node.node_type === nodeTypes.WebhookTrigger) {
            const webhookNode = {
              param_name: 'payload',
              children: this.getNestedKeys(node?.config?.payload) || [],
            };
            return {
              ...node,
              outputs: [webhookNode]
            }
          }

          if (node.node_type === nodeTypes.ItsmTrigger) {
            const tableUuid = node?.config?.itsm_table;
            const nodeCopy = { ...node };
            console.log(nodeCopy, " itsm node copy")

            if (tableUuid) {
              this.svc.getTableDetails(tableUuid)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                  res => {
                    this.spinner.stop('main');
                    nodeCopy.outputs = [
                      {
                        param_name: 'event_type',
                        children: []
                      },
                      {
                        param_name: 'data',
                        children: [
                          'uuid',
                          'ticket_id',
                          ...res.fields.map(f => f.field_name)
                        ]
                      }
                    ];
                  },
                  () => this.spinner.stop('main')
                );
              console.log('<><>>>>>>>>>>>>>>>>>>>>', nodeCopy)
              return nodeCopy;
            }
          }

          if (node.node_type === nodeTypes.AimlEventTrigger) {
            const aiml_type = node?.config?.aiml_type;

            if (aiml_type === 'Event') {
              this.aimlData = [...this.getEventContext()];
            }
            if (aiml_type === 'Alert') {
              this.aimlData = [...this.getAlertContext()];

            }
            if (aiml_type === 'Condition') {
              this.aimlData = [...this.getConditionContext()];

            }
            const nodeCopy = { ...node };
            nodeCopy.outputs = [
              {
                param_name: 'event_type',
                children: []
              },
              {
                param_name: 'data',
                children: [...this.aimlData]
              }
            ];

            return nodeCopy;
          }

          if (node.node_type === nodeTypes.CommentInITSMTicket) {
            return {
              ...node,
              outputs: [statusNode]
            }
          }

          if (node.node_type === nodeTypes.GetITSMTicket) {
            const outputNodeGet = {
              param_name: 'outputs.0',
              children: node.outputs || [],
            };
            return {
              ...node,
              outputs: [rawOutputNode, outputNodeGet, statusNode]
            }
          }

          return {
            ...node,
            outputs: [rawOutputNode, outputNode, statusNode],
          };
        } else if (
          node.node_type === nodeTypes.ManualTrigger ||
          node.node_type === nodeTypes.ScheduleTrigger ||
          node.node_type === nodeTypes.OnChatMessageTrigger
        ) {
          const inputNode = {
            param_name: 'output',
            children: node.inputs || [],
          };
          return {
            ...node,
            outputs: [inputNode],
          };
        } else {
          return {
            ...node,
          };
        }
      });
    }
  }

  getNestedKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj).flatMap(key => {
      const value = obj[key];
      return value && typeof value === "object" && !Array.isArray(value)
        ? [key, ...this.getNestedKeys(value)]
        : [key];
    });
  }

  // waitForFieldList(cb: () => void) {
  //   if (this.fieldList && this.fieldList.length) {
  //     cb();
  //   } else {
  //     setTimeout(() => cb(), 50);
  //   }
  // }

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
    this.nodeOutput = this.realTimeData ? this.realTimeData?.output_data : '';
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



    // ✅ Check that it's actually a FormArray
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


  buildForms() {
    switch (this.nodeData.node_type) {
      case nodeTypes.ManualTrigger:
        this.triggerForm = this.createTriggerForm(this.nodeData, this.nodeId);
        break;
      case nodeTypes.ScheduleTrigger:
        this.scheduleTriggerForm = this.createScheduleTriggerForm(
          this.nodeData,
          this.nodeId
        );
        break;
      case nodeTypes.OnChatMessageTrigger:
        this.onChatMessageForm = this.onChatCreateMessageForm(
          this.nodeData,
          this.nodeId
        );
        break;
      case nodeTypes.ItsmTrigger:
        this.itsmForm = this.svc.createItsmTriggerForm(this.nodeData, this.nodeId);
        this.itsmFormErrors = this.svc.itsmTriggerFormErrors(this.nodeData, this.nodeId);
        this.itsmFormValidationMessage = this.svc.itsmTriggerValidationMessage;
        if (this.itsmForm.get('itsm_table').value) {
          this.getTableDetails(this.itsmForm.get('itsm_table').value, nodeTypes.ItsmTrigger, this.itsmForm);
        }
        this.itsmForm.get('itsm_table').valueChanges
          .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
          .subscribe((val) => {
            this.getTableDetails(val, nodeTypes.ItsmTrigger, this.itsmForm);
          });
        break;
      case nodeTypes.WebhookTrigger:
        this.webhookForm = this.svc.createWebhookTriggerForm(this.nodeData, this.nodeId);
        this.webhookFormErrors = this.svc.webhookTriggerFormErrors;
        this.webhookFormValidationMessage = this.svc.webhookTriggerValidationMessage;
        this.webhookForm.get('payload').valueChanges.subscribe(val => {
          try {
            JSON.parse(val);
            this.webhookFormErrors.payload = null;   // valid JSON
          } catch (e) {
            this.webhookFormErrors.payload = 'Invalid JSON format';
          }
        });
        break;
      case nodeTypes.AimlEventTrigger:
        this.getDropdownFields();
        this.getTags();
        break;
      case nodeTypes.CreateITSMTicket:
        this.createTicketForm = this.svc.createTicketForm(this.nodeData, this.nodeId);
        this.createTicketForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.createTicketFormErrors = this.svc.createTicketFormErrors(this.nodeData, this.nodeId);
        this.createTicketFormValidationMessage = this.svc.createTicketValidationMessage;
        if (this.workflowId) {
          this.getTableDetailsCreate(
            this.createTicketForm.get('itsm_table')?.value,
            nodeTypes.CreateITSMTicket,
            this.createTicketForm
          );
        }
        this.createTicketForm.get('itsm_table').valueChanges
          .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
          .subscribe((val) => {
            this.getTableDetailsCreate(val, nodeTypes.CreateITSMTicket, this.createTicketForm);
          });
        break;
      case nodeTypes.UpdateITSMTicket:
        this.updateTicketForm = this.svc.updateTicketForm(this.nodeData, this.nodeId);
        this.updateTicketForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.updateTicketFormErrors = this.svc.updateTicketFormErrors(this.nodeData, this.nodeId);
        this.updateTicketFormValidationMessage = this.svc.updateTicketValidationMessage;
        this.getTableDetails(this.nodeData.config.itsm_table, nodeTypes.UpdateITSMTicket, this.updateTicketForm, this.nodeId);
        this.updateTicketForm.get('itsm_table').valueChanges
          .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
          .subscribe((val) => {
            this.getTableDetails(val, nodeTypes.UpdateITSMTicket, this.updateTicketForm);
          });
        break;
      case nodeTypes.CommentInITSMTicket:
        this.commentInTicketForm = this.svc.commentInTicketForm(this.nodeData, this.nodeId);
        this.commentInTicketFormErrors = this.svc.commentInTicketFormErrors(this.nodeData, this.nodeId);
        this.commentInTicketFormValidationMessage = this.svc.commentInTicketFormValidationMessage;

        if (this.commentInTicketForm.get('itsm_table').value) {
          this.getTableDetails(this.commentInTicketForm.get('itsm_table').value, nodeTypes.CommentInITSMTicket, this.commentInTicketForm);
        }
        this.commentInTicketForm.get('itsm_table').valueChanges
          .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
          .subscribe((val) => {
            this.getTableDetails(val, nodeTypes.CommentInITSMTicket, this.commentInTicketForm);
          });
        break;
      case nodeTypes.GetITSMTicket:
        this.getTicketForm = this.svc.getTicketForm(this.nodeData, this.nodeId);
        this.getTicketForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.getTicketFormErrors = this.svc.resetgetTicketForm(this.nodeData, this.nodeId);
        this.getTicketFormValidationMessage = this.svc.getTicketFormValidationMessage;
        if (this.getTicketForm.get('itsm_table').value) {
          this.getTableDetails(this.getTicketForm.get('itsm_table').value, nodeTypes.CommentInITSMTicket, this.getTicketForm, this.nodeId);
        }
        this.getTicketForm.get('itsm_table').valueChanges
          .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
          .subscribe((val) => {
            this.getTableDetails(val, nodeTypes.CommentInITSMTicket, this.getTicketForm);
          });
        // this.processRealTimeData(this.getTicketForm);
        break;
      case nodeTypes.Email:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildEmailForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetEmailForm();
        this.propertiesFormValidationMessages =
          this.svc.emailFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.Chart:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildChartForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetChartForm();
        this.propertiesFormValidationMessages =
          this.svc.chartFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.IfElse:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildIfElseForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetIfElseForm();
        this.propertiesFormValidationMessages =
          this.svc.ifElseFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.Switch:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildSwitchForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetSwitchForm();
        this.propertiesFormValidationMessages =
          this.svc.switchFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.Wait:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.createWaitForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetWaitForm();
        this.propertiesFormValidationMessages =
          this.svc.waitFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.Source:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildSourceTaskForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetSourceTaskForm();
        this.propertiesFormValidationMessages =
          this.svc.sourceTaskFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.Action:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildActionTaskForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetActionTaskForm();
        this.propertiesFormValidationMessages =
          this.svc.actionTaskFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.LLM:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildLLMForm(this.nodeData, this.nodeId);
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetLLMForm();
        this.propertiesFormValidationMessages =
          this.svc.llmFormValidationMessage;
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      case nodeTypes.AIAgent:
        this.oldNames['propertiesForm'] = this.nodeData?.name || '';
        this.propertiesForm = this.svc.buildAIAgentForm(
          this.nodeData,
          this.nodeId
        );
        this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
        this.propertiesFormErrors = this.svc.resetAIAgentForm();
        this.propertiesFormValidationMessages =
          this.svc.aiAgentFormValidationMessage;
        this.nodeData.config.tools.forEach((tool, index) => {
          this.getToolsDropdown(tool, index);
        });
        if (this.nodeData?.formErrors) {
          this.propertiesFormErrors = this.nodeData?.formErrors;
          this.propertiesForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.clearPropertiesFormErrors();
            });
        }
        break;
      default:
        // handle dynamic group like playbookTypes
        if (this.isOrcPlayBook(this.nodeData.node_type)) {
          this.oldNames['propertiesForm'] = this.nodeData?.name || '';
          this.propertiesForm = this.svc.buildTaskForm(
            this.nodeData,
            this.nodeId
          );
          this.propertiesForm.addControl('outputs', this.svc.creteOutputArray(this.nodeData));
          this.propertiesFormErrors = this.svc.resetTaskForm();
          this.propertiesFormValidationMessages =
            this.svc.taskFormValidationMessage;
          if (this.nodeData?.formErrors) {
            this.propertiesFormErrors = this.nodeData?.formErrors;
            this.propertiesForm.valueChanges
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe(() => {
                this.clearPropertiesFormErrors();
              });
          }
          break;
        }
        return '';
    }
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


  getTableDetails(uuid: string, type?: string, form?: FormGroup, nodeId?: number) {

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


  clearPropertiesFormErrors() {
    if (!this.propertiesFormErrors) return;

    Object.keys(this.propertiesForm.controls).forEach((field) => {
      const control = this.propertiesForm.get(field);

      //  For top-level simple controls
      if (control instanceof FormControl) {
        if (control.valid && this.propertiesFormErrors[field]) {
          this.propertiesFormErrors[field] = '';
        }
      }

      // For FormArray (like switchConditions)
      else if (control instanceof FormArray) {
        const formArray = control as FormArray;
        const arrayErrors = this.propertiesFormErrors[field] as any[];

        if (Array.isArray(arrayErrors)) {
          formArray.controls.forEach((group: FormGroup, index: number) => {
            const groupErrors = arrayErrors[index];

            if (group instanceof FormGroup && groupErrors) {
              Object.keys(group.controls).forEach((innerField) => {
                const innerControl = group.get(innerField);
                if (innerControl?.valid && groupErrors[innerField]) {
                  groupErrors[innerField] = '';
                }
              });
            }
          });
        }
      }
    });
  }

  confirmPropertiesCreate() {
    if (this.propertiesForm.invalid) {
      this.propertiesFormErrors = this.utilService.validateForm(
        this.propertiesForm,
        this.propertiesFormValidationMessages,
        this.propertiesFormErrors
      );
      this.propertiesForm.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.propertiesFormErrors = this.utilService.validateForm(
            this.propertiesForm,
            this.propertiesFormValidationMessages,
            this.propertiesFormErrors
          );
        });
    } else {
    }
  }

  /* - Get Switch Condition Form Array */
  get filters(): FormArray {
    return this.getTicketForm.get('filters') as FormArray;
  }

  addGetTicketForm(): void {
    const getTicketArray = this.getTicketForm.get(
      'filters'
    ) as FormArray;

    if (getTicketArray.length > 0) {
      const lastCondition = getTicketArray.at(getTicketArray.length - 1) as FormGroup;
      if (lastCondition.invalid) {
        this.getTicketFormErrors['filters'][getTicketArray.length - 1] =
          this.utilService.validateForm(
            lastCondition,
            this.getTicketFormValidationMessage['filters'],
            this.getTicketFormErrors['filters'][
            getTicketArray.length - 1
            ]
          );
        lastCondition.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.getTicketFormErrors['filters'][
              getTicketArray.length - 1
            ] = this.utilService.validateForm(
              lastCondition,
              this.getTicketFormValidationMessage['filters'],
              this.getTicketFormErrors['filters'][
              getTicketArray.length - 1
              ]
            );
          });
        return;
      }
    }

    const getTicketGroup = this.fb.group({
      condition_key: ['', Validators.required],
      operator: ['', Validators.required],
      condition_value: ['', Validators.required],
    });

    getTicketArray.push(getTicketGroup);

    if (!this.getTicketFormErrors.filters) {
      this.getTicketFormErrors.filters = [];
    }
    this.getTicketFormErrors.filters.push({
      condition_key: '',
      operator: '',
      condition_value: '',
    });
  }

  removeGetTicketForm(index: number): void {
    this.filters.removeAt(index);
  }

  get inputsForUpdate(): FormArray {
    return this.updateTicketForm.get('inputs') as FormArray;
  }

  addUpdateTicketForm(): void {
    const updateTicketArray = this.updateTicketForm.get(
      'inputs'
    ) as FormArray;

    if (updateTicketArray.length > 0) {
      const lastCondition = updateTicketArray.at(updateTicketArray.length - 1) as FormGroup;
      if (lastCondition.invalid) {
        this.updateTicketFormErrors['inputs'][updateTicketArray.length - 1] =
          this.utilService.validateForm(
            lastCondition,
            this.updateTicketFormValidationMessage['inputs'],
            this.updateTicketFormErrors['inputs'][
            updateTicketArray.length - 1
            ]
          );
        lastCondition.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.updateTicketFormErrors['inputs'][
              updateTicketArray.length - 1
            ] = this.utilService.validateForm(
              lastCondition,
              this.updateTicketFormValidationMessage['inputs'],
              this.updateTicketFormErrors['inputs'][
              updateTicketArray.length - 1
              ]
            );
          });
        return;
      }
    }

    const updateTicketGroup = this.fb.group({
      param_name: ['', Validators.required],
      default_value: ['', Validators.required],
      is_required: [''],
    });

    updateTicketArray.push(updateTicketGroup);

    if (!this.updateTicketFormErrors.inputs) {
      this.updateTicketFormErrors.inputs = [];
    }
    this.updateTicketFormErrors.inputs.push({
      param_name: '',
      default_value: '',
      is_required: ''
    });
  }

  removeUpdateTicketForm(index: number): void {
    this.inputsForUpdate.removeAt(index);
  }


  /* - Get Switch Condition Form Array */
  get switchConditions(): FormArray {
    return this.propertiesForm.get('switchConditions') as FormArray;
  }

  addSwitchForm(): void {
    const switchArray = this.propertiesForm.get(
      'switchConditions'
    ) as FormArray;

    if (switchArray.length > 0) {
      const lastCondition = switchArray.at(switchArray.length - 1) as FormGroup;
      if (lastCondition.invalid) {
        this.propertiesFormErrors['switchConditions'][switchArray.length - 1] =
          this.utilService.validateForm(
            lastCondition,
            this.propertiesFormValidationMessages['switchConditions'],
            this.propertiesFormErrors['switchConditions'][
            switchArray.length - 1
            ]
          );
        lastCondition.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.propertiesFormErrors['switchConditions'][
              switchArray.length - 1
            ] = this.utilService.validateForm(
              lastCondition,
              this.propertiesFormValidationMessages['switchConditions'],
              this.propertiesFormErrors['switchConditions'][
              switchArray.length - 1
              ]
            );
          });
        return;
      }
    }

    const switchGroup = this.fb.group({
      condition_key: ['', Validators.required],
      operator: ['', Validators.required],
      condition_value: ['', Validators.required],
    });

    switchArray.push(switchGroup);

    if (!this.propertiesFormErrors.switchConditions) {
      this.propertiesFormErrors.switchConditions = [];
    }
    this.propertiesFormErrors.switchConditions.push({
      condition_key: '',
      operator: '',
      condition_value: '',
    });
  }

  removeSwitchForm(index: number): void {
    this.switchConditions.removeAt(index);
  }

  get tools(): FormArray {
    return this.propertiesForm.get('tools') as FormArray;
  }

  addTool() {
    const toolsArray = this.tools;
    if (toolsArray.length > 0) {
      const lastTool = toolsArray.at(toolsArray.length - 1) as FormGroup;
      const nameControl = lastTool.get('name');
      if (nameControl.invalid) {
        this.propertiesFormErrors['tools'][toolsArray.length - 1] =
          this.utilService.validateForm(
            lastTool,
            this.propertiesFormValidationMessages,
            this.propertiesFormErrors['tools'][toolsArray.length - 1]
          );
        lastTool.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.propertiesFormErrors['tools'][toolsArray.length - 1] =
              this.utilService.validateForm(
                lastTool,
                this.propertiesFormValidationMessages,
                this.propertiesFormErrors['tools'][toolsArray.length - 1]
              );
          });
        return;
      }
    }

    this.tools.push(
      this.svc.createToolsGroup({
        name: '',
        type: '',
        target: '',
        credential: '',
        cloud_type: null,
        inputs: [],
      })
    );

    if (!this.propertiesFormErrors.tools) {
      this.propertiesFormErrors.tools = [];
    }
    this.propertiesFormErrors.tools.push({
      name: '',
      type: '',
      target: '',
      target_type: '',
      credential: '',
      cloud_type: null,
      inputs: [],
      task: '',
    });
    this.cdr.detectChanges();
  }

  removeTool(index: number): void {
    this.tools.removeAt(index);
  }

  getToolsDropdown(event, index: number, ent?: string): void {
    const toolGroup = this.tools.at(index) as FormGroup;
    toolGroup.patchValue({
      name: event?.name,
      type: event?.type,
      target: event?.target,
      target_type: event?.target_type || '',
      credential: event?.credential || '',
      cloud_type: event?.cloud_type ?? event?.config?.cloud_type ?? null,
      task: event?.task,
    });

    if (event?.target === 'AI INPUT') {
      toolGroup.get('target')?.disable({ emitEvent: false });
    } else {
      toolGroup.get('target')?.enable({ emitEvent: false });
    }

    if (event?.credential === 'AI INPUT') {
      toolGroup.get('credential')?.disable({ emitEvent: false });
    } else {
      toolGroup.get('credential')?.enable({ emitEvent: false });
    }

    const inputsFormArray = toolGroup.get('inputs') as FormArray;
    inputsFormArray.clear();

    // Always call API for fresh data (unless you intentionally want to skip)
    if (event?.uuid) {
      if (event.type === nodeTypes.Source) {
        this.getDetailsOfSelectedSourceTask(event, index);
      } else {
        this.getTemplateDetailsByTask(event, index);
      }
    } else if (event?.inputs?.length) {
      // fallback if API not required
      event.inputs.forEach((input) => {
        const inputGroup = this.svc.createInputParamGroup(input);
        if (input?.default_value === 'AI INPUT') {
          inputGroup.disable({ emitEvent: false });
        }
        inputsFormArray.push(inputGroup);
      });
    }
  }

  getTemplateDetailsByTask(tool, index?: number) {
    this.spinner.start('main');
    const toolGroup = this.tools.at(index) as FormGroup;
    const taskId = tool?.uuid || toolGroup.get('task').value;
    this.containerSvc
      .getTemplatesByTaskId(taskId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          const toolGroup = this.tools.at(index) as FormGroup;

          toolGroup.patchValue({
            name: res?.name,
            target: '',
            target_type: res?.target_type || '',
            credential: '',
            cloud_type: res?.cloud_type ?? res?.config?.cloud_type ?? null,
            task: res?.uuid,
          });

          // Update inputs array
          const inputsFormArray = toolGroup.get('inputs') as FormArray;
          inputsFormArray.clear(); // Remove old inputs

          res.inputs.forEach((input) => {
            inputsFormArray.push(this.svc.createInputParamGroup(input));
          });
          this.spinner.stop('main');
          this.cdr.detectChanges();
        },
        (err: HttpErrorResponse) => {
          this.spinner.stop('main');
        }
      );
  }

  getDetailsOfSelectedSourceTask(tool, index?: number) {
    this.spinner.start('main');
    this.containerSvc
      .getSourceTaskDetails(tool.uuid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          const toolGroup = this.tools.at(index) as FormGroup;

          toolGroup.patchValue({
            name: res?.name,
            target: '',
            target_type: res?.target_type || '',
            credential: '',
            cloud_type: res?.cloud_type ?? res?.config?.cloud_type ?? null,
            task: res?.uuid,
          });

          // Update inputs array
          const inputsFormArray = toolGroup.get('inputs') as FormArray;
          inputsFormArray.clear(); // Remove old inputs

          res.inputs.forEach((input) => {
            inputsFormArray.push(this.svc.createInputParamGroup(input));
          });
          this.spinner.stop('main');
          this.cdr.detectChanges();
        },
        (err: HttpErrorResponse) => {
          this.spinner.stop('main');
        }
      );
  }

  // --- Drag & Drop handlers ---
  // 2. Drag start handler
  onDragStart(event: DragEvent, nodeData: any, variable: any, child?: any) {
    event.dataTransfer?.setData(
      'text/plain',
      this.getDragText(event, nodeData, variable, child)
    );
    const WEBHOOK_TEMPLATE = {
      status: "Success",
      raw_output: "RAW OUTPUT",
      outputs: []
    };
    // const parsed = this.parseJinjaPath(this.getDragText(event, nodeData, variable, child));

    // const json = this.buildJsonFromJinja(
    //   parsed,
    //   WEBHOOK_TEMPLATE,
    //   0 // inject template at "Webhook"
    // );

    // console.log(JSON.stringify(json, null, 2));
  }

  getDragText(event: DragEvent, nodeData: any, variable: any, childData?: any): string {
    // special case for global context -> leave as is
    if (nodeData === 'context') {
      return variable.value;
    }
    if (nodeData === 'workflow') {
      const varKey = variable?.param_name;
      // Handle child case
      if (childData) {
        const childKey =
          typeof childData === 'string' ? childData : childData?.param_name;
        // {{ vars['Node Name'].varKey.childKey }}
        return `{{ vars.${varKey}.${childKey} }}`;
      }
      return `{{ vars.${varKey} }}`;
    }
    const taskRef = `{{ task['${nodeData.name}']`;
    const varKey = variable?.param_name;
    // Handle child case
    if (childData) {
      const childKey =
        typeof childData === 'string' ? childData : childData?.param_name;
      // {{ task['Node Name'].varKey.childKey }}
      return `${taskRef}.${varKey}.${childKey} }}`;
    }
    // Handle special case for raw_output
    if (varKey === 'raw_output' || varKey === 'raw_output') {
      return `${taskRef}.raw_output }}`;
    }
    // Parent case -> {{ task['Node Name'].param_name }}
    return `${taskRef}.${varKey} }}`;
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
    if (key === 'name') return;
    const input = event.target as HTMLInputElement;
    input.classList.remove('drag-highlight');
  }

  save() {
    this.bsModalRef.hide();
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

  autoSaveProperties() {
    this.updatedFormDatas = {
      // outputForm: this.updatedOutputData,
      propertyForm: this.propertiesForm?.getRawValue(),
      triggerForm: this.updatedInputData,
      scheduleTriggerForm: this.updatedScheduleInputData,
      onChatMessageForm: this.updatedOnChatInputData,
      itsmForm: this.itsmForm?.getRawValue(),
      webhookForm: this.getWebhookForm(),
      aimlForm: this.aimlForm?.getRawValue(),
      createTicketForm: this.createTicketForm?.getRawValue(),
      updateTicketForm: this.updateTicketForm?.getRawValue(),
      commentInTicketForm: this.commentInTicketForm?.getRawValue(),
      getTicketForm: this.getTicketForm?.getRawValue(),
      propertyFormErrors: this.propertiesFormErrors,
      triggerFormErrors: this.triggerFormErrors,
      scheduleTriggerFormErrors: this.scheduleTriggerFormErrors,
      onChatFormErrors: this.onChatMessageFormErrors,
      itsmFormErrors: this.itsmFormErrors,
      webhookFormErrors: this.webhookFormErrors,
      aimlFormErrors: this.aimlFormErrors,
      createTicketFormErrors: this.createTicketFormErrors,
      updateTicketFormErrors: this.updateTicketFormErrors,
      getTicketFormErrors: this.getTicketFormErrors,
      commentInTicketFormErrors: this.commentInTicketFormErrors,
      // outputFormErrors: this.outputFormErrors,
      propertyFormValidationMessages: this.propertiesFormValidationMessages,
      triggerFormValidationMessages: this.triggerValidationMessage,
      scheduleFormValidationMessages: this.scheduleTriggerValidationMessage,
      onChatFormValidationMessages: this.onChatMessageValidationMessage,
      itsmFormValidationMessages: this.itsmFormValidationMessage,
      webhookFormValidationMessages: this.webhookFormValidationMessage,
      aimlFormValidationMessages: this.aimlFormValidationMessage,
      createTicketFormValidationMessages: this.createTicketFormValidationMessage,
      updateTicketFormValidationMessages: this.updateTicketFormValidationMessage,
      getTicketFormValidationMessages: this.getTicketFormValidationMessage,
      commentInTicketFormValidationmessages: this.commentInTicketFormValidationMessage,
      // outputValidationMessage: this.outputValidationMessage,
    };
  }

  getWebhookForm() {
    if (!this.webhookForm) {
      return null; // or {}
    }

    const raw = this.webhookForm.getRawValue();

    // If payload is missing, return raw as-is
    if (!raw?.payload) {
      return raw;
    }

    try {
      raw.payload = JSON.parse(raw.payload);
    } catch (e) {
      console.warn("Webhook payload contains invalid JSON. Keeping original string.");
      // keep raw.payload unchanged
    }

    return raw;
  }

  private hasErrorsForTest(): boolean {
    const errorSources = [
      this.propertiesFormErrors,
      this.triggerFormErrors,
      this.scheduleTriggerFormErrors,
      this.onChatMessageFormErrors,
      this.itsmFormErrors,
      this.webhookFormErrors,
      this.createTicketFormErrors,
      this.updateTicketFormErrors,
      this.commentInTicketFormErrors,
      this.getTicketFormErrors
    ];

    return errorSources.some(err => this.containsRealError(err));
  }

  containsRealError(err: any): boolean {
    if (!err) return false;

    for (const [key, value] of Object.entries(err)) {

      if (key === 'inputs' && Array.isArray(value)) {
        return value.some(input =>
          input?.param_name?.trim() ||
          input?.param_type?.trim() ||
          input?.default_value?.trim()
        );
      }

      if (key === 'outputs' && Array.isArray(value)) {
        return value.some(v =>
          v !== null &&
          typeof v === 'object' &&
          Object.keys(v).length > 0
        );
      }

      if (key === 'tools' && Array.isArray(value)) {
        return value.length > 0;
      }

      if (typeof value === 'string') {
        if (value.trim() !== '') {
          return true;
        }
        continue;
      }

      if (value !== null && value !== undefined) {
        return true;
      }
    }

    return false;
  }

  closeModal(action?: 'save' | 'test') {
    if (action === 'save' || action === 'test') {
      this.restoreOldNamesIfBlank();
      this.formErrors();
      // this.autoSaveOutput();
      this.autoSaveInputs();
      this.autoSaveScheduleInputs();
      this.autoSaveOnChatInputs();
      this.autoSaveProperties();
      if (action === 'test' && this.hasErrorsForTest()) {
        return;
      }
      if (this.onClose) {
        this.onClose(this.updatedFormDatas, { action }); // send back to parent
        this.bsModalRef.hide();
      }
    } else {
      this.bsModalRef.hide();
    }
  }

  restoreOldNamesIfBlank() {
    const formsMap = {
      triggerForm: this.triggerForm,
      scheduleTriggerForm: this.scheduleTriggerForm,
      onChatMessageForm: this.onChatMessageForm,
      propertiesForm: this.propertiesForm,
    };

    Object.keys(formsMap).forEach((formKey) => {
      const form = formsMap[formKey];
      const oldName = this.oldNames[formKey];

      if (form && oldName !== undefined) {
        const nameControl = form.get('name');
        const currentName = nameControl?.value?.trim();

        if (!currentName) {
          nameControl?.setValue(oldName);
        }
      }
    });
  }

  formErrors() {
    if (this.triggerForm) {
      this.triggerFormErrors = this.utilService.validateForm(
        this.triggerForm,
        this.triggerValidationMessage,
        this.triggerFormErrors
      );
      const inputsArray = this.triggerForm.get('inputs') as FormArray;

      if (inputsArray && inputsArray.length) {

        this.triggerFormErrors.inputs = inputsArray.controls.map(
          (ctrl: FormGroup) => {

            const groupErrors: any = {};

            const paramNameCtrl = ctrl.get('param_name');
            const paramTypeCtrl = ctrl.get('param_type');

            if (paramNameCtrl?.invalid) {
              const firstError = Object.keys(paramNameCtrl.errors || {})[0];
              groupErrors['param_name'] =
                this.triggerValidationMessage.inputs.param_name[firstError];
            }

            if (paramTypeCtrl?.invalid) {
              const firstError = Object.keys(paramTypeCtrl.errors || {})[0];
              groupErrors['param_type'] =
                this.triggerValidationMessage.inputs.param_type[firstError];
            }

            return Object.keys(groupErrors).length ? groupErrors : {};
          }
        );
      }
    }
    if (this.scheduleTriggerForm) {
      this.scheduleTriggerFormErrors = this.utilService.validateForm(
        this.scheduleTriggerForm,
        this.scheduleTriggerValidationMessage,
        this.scheduleTriggerFormErrors
      );
      const inputsArray = this.scheduleTriggerForm.get('inputs') as FormArray;

      if (inputsArray && inputsArray.length) {

        this.scheduleTriggerFormErrors.inputs = inputsArray.controls.map(
          (ctrl: FormGroup) => {

            const groupErrors: any = {};

            const paramNameCtrl = ctrl.get('param_name');
            const paramTypeCtrl = ctrl.get('param_type');
            const defaultValueCtrl = ctrl.get('default_value');

            if (paramNameCtrl?.invalid) {
              const firstError = Object.keys(paramNameCtrl.errors || {})[0];
              groupErrors['param_name'] =
                this.scheduleTriggerValidationMessage.inputs.param_name[firstError];
            }

            if (paramTypeCtrl?.invalid) {
              const firstError = Object.keys(paramTypeCtrl.errors || {})[0];
              groupErrors['param_type'] =
                this.scheduleTriggerValidationMessage.inputs.param_type[firstError];
            }

            if (defaultValueCtrl?.invalid) {
              const firstError = Object.keys(defaultValueCtrl.errors || {})[0];
              groupErrors['default_value'] =
                this.scheduleTriggerValidationMessage.inputs.default_value[firstError];
            }

            return Object.keys(groupErrors).length ? groupErrors : {};
          }
        );
      }
    }
    if (this.onChatMessageForm) {
      this.onChatMessageFormErrors = this.utilService.validateForm(
        this.onChatMessageForm,
        this.onChatMessageValidationMessage,
        this.onChatMessageFormErrors
      );
      const inputsArray = this.onChatMessageForm.get('inputs') as FormArray;

      if (inputsArray && inputsArray.length) {

        this.onChatMessageFormErrors.inputs = inputsArray.controls.map(
          (ctrl: FormGroup) => {

            const groupErrors: any = {};

            const paramNameCtrl = ctrl.get('param_name');
            const paramTypeCtrl = ctrl.get('param_type');
            const defaultValueCtrl = ctrl.get('default_value');

            if (paramNameCtrl?.invalid) {
              const firstError = Object.keys(paramNameCtrl.errors || {})[0];
              groupErrors['param_name'] =
                this.onChatMessageValidationMessage.inputs.param_name[firstError];
            }

            if (paramTypeCtrl?.invalid) {
              const firstError = Object.keys(paramTypeCtrl.errors || {})[0];
              groupErrors['param_type'] =
                this.onChatMessageValidationMessage.inputs.param_type[firstError];
            }

            if (defaultValueCtrl?.invalid) {
              const firstError = Object.keys(defaultValueCtrl.errors || {})[0];
              groupErrors['default_value'] =
                this.onChatMessageValidationMessage.inputs.default_value[firstError];
            }

            return Object.keys(groupErrors).length ? groupErrors : {};
          }
        );
      }
    }
    if (this.itsmForm) {
      this.itsmFormErrors = this.utilService.validateForm(
        this.itsmForm,
        this.itsmFormValidationMessage,
        this.itsmFormErrors
      );
    }
    if (this.webhookForm) {
      this.webhookFormErrors = this.utilService.validateForm(
        this.webhookForm,
        this.webhookFormValidationMessage,
        this.webhookFormErrors
      );
    }
    if (this.aimlForm) {
      this.itsmFormErrors = this.utilService.validateForm(
        this.aimlForm,
        this.aimlFormValidationMessage,
        this.aimlFormErrors
      );
    }
    if (this.propertiesForm) {
      this.propertiesFormErrors = this.utilService.validateForm(
        this.propertiesForm,
        this.propertiesFormValidationMessages,
        this.propertiesFormErrors
      );
    }

    // if (this.propertiesForm) {
    //   this.outputFormErrors = this.utilService.validateForm(
    //     this.propertiesForm,
    //     this.outputValidationMessage,
    //     this.outputFormErrors
    //   );
    // }

    if (this.createTicketForm) {
      this.createTicketFormErrors = this.utilService.validateForm(
        this.createTicketForm,
        this.createTicketFormValidationMessage,
        this.createTicketFormErrors
      );
      const inputsArray = this.createTicketForm.get('inputs') as FormArray;

      if (inputsArray && inputsArray.length) {

        this.createTicketFormErrors.inputs = inputsArray.controls.map(
          (ctrl: FormGroup) => {

            const groupErrors: any = {};

            const isRequired = ctrl.get('is_required')?.value;
            const defaultValueCtrl = ctrl.get('default_value');

            // Only validate if required
            if (isRequired && defaultValueCtrl?.invalid) {

              const firstError = Object.keys(defaultValueCtrl.errors || {})[0];

              groupErrors['default_value'] =
                this.createTicketFormValidationMessage.inputs.default_value[firstError];
            }
            return Object.keys(groupErrors).length ? groupErrors : {};
          }
        );
      }
    }
    if (this.updateTicketForm) {
      this.updateTicketFormErrors = this.utilService.validateForm(
        this.updateTicketForm,
        this.updateTicketFormValidationMessage,
        this.updateTicketFormErrors
      );
      const inputsArray = this.updateTicketForm.get('inputs') as FormArray;

      if (inputsArray && inputsArray.length) {

        this.updateTicketFormErrors.inputs = inputsArray.controls.map(
          (ctrl: FormGroup) => {

            const groupErrors: any = {};

            const paramNameCtrl = ctrl.get('param_name');
            const defaultValueCtrl = ctrl.get('default_value');
            const isRequired = ctrl.get('is_required')?.value;

            if (paramNameCtrl?.invalid) {
              const firstError = Object.keys(paramNameCtrl.errors || {})[0];
              groupErrors['param_name'] =
                this.updateTicketFormValidationMessage.inputs.param_name[firstError];
            }

            if (isRequired && defaultValueCtrl?.invalid) {
              const firstError = Object.keys(defaultValueCtrl.errors || {})[0];
              groupErrors['default_value'] =
                this.updateTicketFormValidationMessage.inputs.default_value[firstError];
            }

            return Object.keys(groupErrors).length ? groupErrors : {};
          }
        );
      }
    }
    if (this.getTicketForm) {
      this.getTicketFormErrors = this.utilService.validateForm(
        this.getTicketForm,
        this.getTicketFormValidationMessage,
        this.getTicketFormErrors
      );
      this.getTicketFormError();
    }
    if (this.commentInTicketForm) {
      this.commentInTicketFormErrors = this.utilService.validateForm(
        this.commentInTicketForm,
        this.commentInTicketFormValidationMessage,
        this.commentInTicketFormErrors
      );
      if (this.commentFieldsList.length === 0) {
        const fieldNameCtrl = this.commentInTicketForm.get('field_name');
        const commentCtrl = this.commentInTicketForm.get('comment');

        // Always enforce required validators
        fieldNameCtrl?.setValidators([Validators.required]);
        commentCtrl?.setValidators([Validators.required]);

        if (this.commentFieldsList.length === 0) {
          // ❌ No COMMENT fields available
          fieldNameCtrl?.setErrors({ required: true });
          commentCtrl?.setErrors({ required: true });

        }
        fieldNameCtrl?.updateValueAndValidity({ emitEvent: false });
        commentCtrl?.updateValueAndValidity({ emitEvent: false });
      }
    }

    this.inputFormErrors();
    this.SwitchFormErrors();
    this.toolInputFormErrors();
  }

  // For INPUTS Array Validation
  inputFormErrors() {
    if (
      this.nodeData.node_type === 'Source Task' || this.nodeData.node_type === 'Action Task' ||
      this.isOrcPlayBook(this.nodeData.node_type)
    ) {
      const inputsArray = this.propertiesForm.get('inputs') as FormArray;

      if (inputsArray && inputsArray.length) {
        this.propertiesFormErrors.inputs = inputsArray.controls.map(
          (ctrl: FormGroup, idx: number) => {
            const groupErrors: any = {};

            Object.keys(ctrl.controls).forEach((controlName) => {
              const control = ctrl.get(controlName);

              const validationMessages =
                this.propertiesFormValidationMessages.inputs?.[controlName] ||
                this.propertiesFormValidationMessages.inputs?.[idx]?.[
                controlName
                ] ||
                this.propertiesFormValidationMessages.inputs?.[0]?.[
                controlName
                ];

              if (control?.invalid && validationMessages?.required) {
                groupErrors[controlName] = validationMessages.required;
              }
            });

            return Object.keys(groupErrors).length ? groupErrors : {};
          }
        );
      }
    }
  }

  toolInputFormErrors() {
    if (this.nodeData.node_type === 'AI Agent') {
      const toolsArray = this.propertiesForm.get('tools') as FormArray;

      if (toolsArray && toolsArray.length) {
        if (!this.propertiesFormErrors.tools) {
          this.propertiesFormErrors.tools = [];
        }

        toolsArray.controls.forEach(
          (toolCtrl: FormGroup, toolIndex: number) => {
            this.propertiesFormErrors.tools[toolIndex] =
              this.propertiesFormErrors.tools[toolIndex] || {};

            const inputsArray = toolCtrl.get('inputs') as FormArray;
            if (inputsArray && inputsArray.length) {
              this.propertiesFormErrors.tools[toolIndex].inputs = [];

              inputsArray.controls.forEach(
                (inputCtrl: FormGroup, inputIndex: number) => {
                  const inputErrors: any = {};

                  Object.keys(inputCtrl.controls).forEach((controlName) => {
                    const control = inputCtrl.get(controlName);

                    const validationMessages =
                      this.propertiesFormValidationMessages.tools?.inputs?.[
                      controlName
                      ] ||
                      this.propertiesFormValidationMessages.tools?.inputs?.[
                      inputIndex
                      ]?.[controlName];

                    if (control?.invalid && validationMessages?.required) {
                      inputErrors[controlName] = validationMessages.required;
                    }
                  });

                  this.propertiesFormErrors.tools[toolIndex].inputs[
                    inputIndex
                  ] = inputErrors;
                }
              );
            }
          }
        );
      }
    }
  }

  // For SWITCH Array Validation
  SwitchFormErrors() {
    if (this.nodeData.node_type === 'Switch Case') {
      const switchConditionsArray = this.propertiesForm.get(
        'switchConditions'
      ) as FormArray;
      if (switchConditionsArray && switchConditionsArray.length) {
        this.propertiesFormErrors.switchConditions =
          switchConditionsArray.controls.map((ctrl: FormGroup) => {
            const groupErrors: any = {};

            Object.keys(ctrl.controls).forEach((controlName) => {
              const control = ctrl.get(controlName);
              const validationMessage =
                this.propertiesFormValidationMessages.switchConditions[
                controlName
                ];

              if (control?.invalid && validationMessage) {
                groupErrors[controlName] = {
                  required: validationMessage.required,
                };
              }
            });
            return Object.keys(groupErrors).length ? groupErrors : null;
          });
      }
    }
  }

  getTicketFormError() {
    const filtersArray = this.getTicketForm.get('filters') as FormArray;

    if (filtersArray && filtersArray.length) {

      this.getTicketFormErrors.filters = filtersArray.controls.map(
        (ctrl: FormGroup) => {

          const groupErrors: any = {};

          Object.keys(ctrl.controls).forEach((controlName) => {
            const control = ctrl.get(controlName);

            const validationMessage =
              this.getTicketFormValidationMessage.filters[controlName];

            if (control?.invalid && validationMessage) {
              const firstError = Object.keys(control.errors || {})[0];

              groupErrors[controlName] =
                validationMessage[firstError];
            }
          });
          return Object.keys(groupErrors).length ? groupErrors : {};
        }
      );
    }
  }

  // OUTPUT START

  createOutputForm() {
    this.propertiesForm = this.svc.createOuputForm();
    this.propertiesFormErrors = this.svc.outputFormErrors();
    this.propertiesFormValidationMessages = this.svc.outputValidationMessage;
    // this.svc.addOutput(this.outputForm);

    this.propertiesForm = this.fb.group({
      outputs: this.fb.array(
        (this.nodeData?.outputs || []).map((out: any) =>
          this.fb.group({
            param_name: [out.param_name || ''],
            expression_type: [out.expression_type || ''],
            expression: [out.expression || ''],
          })
        )
      ),
    });
    console.log(this.propertiesForm, "prop form")

    if (
      this.nodeData?.formErrors &&
      typeof this.nodeData.formErrors === 'object'
    ) {
      this.propertiesFormErrors = this.nodeData.formErrors;
    }

    const outputsArray = this.propertiesForm.get('outputs') as FormArray;

    if (!this.propertiesFormErrors.outputs) {
      this.propertiesFormErrors.outputs = [];
    }

    outputsArray.controls.forEach((control: FormGroup, index: number) => {
      control.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        const newErrors = this.utilService.validateForm(
          control,
          this.propertiesFormValidationMessages,
          this.propertiesFormErrors.outputs[index]
        );
        this.propertiesFormErrors.outputs[index] = {
          ...this.propertiesFormErrors.outputs[index],
          ...newErrors,
        };
      });
    });

    return this.propertiesForm;
  }

  autoSaveOutput() {
    this.updatedOutputData = this.propertiesForm.getRawValue();
  }

  get outputs(): FormArray {
    return this.svc.getOutputs(this.propertiesForm);
  }

  get createOutputs(): FormArray {
    return this.svc.getOutputs(this.createTicketForm);
  }

  get updateOutputs(): FormArray {
    return this.svc.getOutputs(this.updateTicketForm);
  }

  get getTicketOutputs(): FormArray {
    return this.svc.getOutputs(this.getTicketForm);
  }

  addOutputData() {
    const outputsArray = this.outputs;

    if (outputsArray.length > 0) {
      const lastOutput = outputsArray.at(outputsArray.length - 1) as FormGroup;

      if (lastOutput.invalid) {
        this.propertiesFormErrors['outputs'][outputsArray.length - 1] =
          this.utilService.validateForm(
            lastOutput,
            this.propertiesFormValidationMessages['outputs'],
            this.propertiesFormErrors['outputs'][outputsArray.length - 1]
          );
        lastOutput.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.propertiesFormErrors['outputs'][outputsArray.length - 1] =
              this.utilService.validateForm(
                lastOutput,
                this.propertiesFormValidationMessages['outputs'],
                this.propertiesFormErrors['outputs'][outputsArray.length - 1]
              );
          });
        return;
      }
    }

    this.svc.addOutput(this.propertiesForm);
    this.propertiesFormErrors?.outputs?.push({
      param_name: '',
      expression_type: '',
      expression: '',
    });
  }

  removeOutput(index: number): void {
    this.svc.removeOutput(this.propertiesForm, index);
  }

  isOrcPlayBook(type: string) {
    return this.containerSvc.isPlaybookType(type);
  }
  // OUTPUT END

  // ===================== TRIGGER FORM =====================
  createTriggerForm(nodeData, nodeId) {
    this.oldNames['triggerForm'] = nodeData?.name || '';
    this.triggerForm = this.svc.createTriggerForm(nodeData, nodeId);
    this.triggerFormErrors = this.svc.triggerFormErrors(nodeData, nodeId);
    this.triggerValidationMessage = this.svc.triggerValidationMessage;

    const inputsArray =
      this.nodeData?.inputs?.map((out) =>
        this.fb.group({
          param_name: [
            out.param_name || '',
            [Validators.required, paramNameValidator],
          ],
          param_type: [out.param_type || '', [Validators.required]],
          default_value: [out.default_value || ''],
        })
      ) || [];

    this.triggerForm = this.fb.group({
      name: this.fb.control(nodeData.name, [Validators.required]),
      inputs: this.fb.array(inputsArray),
    });

    const firstParam = (this.triggerForm.get('inputs') as FormArray)?.at(
      0
    ) as FormGroup;
    if (firstParam) {
      firstParam
        .get('param_type')
        ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => firstParam.get('default_value')?.reset(''));
    }

    if (nodeData?.formErrors?.inputs?.length) {
      this.triggerFormErrors = nodeData.formErrors;
    }

    return this.triggerForm;
  }

  get inputs(): FormArray {
    return this.svc.getTriggers(this.triggerForm);
  }

  addParam(): void {
    const inputsArray = this.inputs;

    if (inputsArray.length > 0) {
      const lastInput = inputsArray.at(inputsArray.length - 1) as FormGroup;
      if (lastInput.invalid) {
        this.triggerFormErrors['inputs'][inputsArray.length - 1] =
          this.utilService.validateForm(
            lastInput,
            this.triggerValidationMessage['inputs'],
            this.triggerFormErrors['inputs'][inputsArray.length - 1]
          );
        lastInput.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.triggerFormErrors['inputs'][inputsArray.length - 1] =
              this.utilService.validateForm(
                lastInput,
                this.triggerValidationMessage['inputs'],
                this.triggerFormErrors['inputs'][inputsArray.length - 1]
              );
          });
        return;
      }
    }

    const newParam = this.svc.buildParameterForm(false);
    this.inputs.push(newParam);

    newParam.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      newParam.get('default_value')?.reset('');
    });

    this.triggerFormErrors.inputs.push({
      param_name: '',
      param_type: '',
      default_value: '',
    });
  }

  removeParam(index: number): void {
    this.inputs.removeAt(index);
    if (this.triggerFormErrors?.inputs?.length > index) {
      this.triggerFormErrors.inputs.splice(index, 1);
    }
  }

  autoSaveInputs() {
    this.updatedInputData = this.triggerForm?.getRawValue();
  }

  getCloudAccount() {
    this.svc
      .getAllCloud()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((accounts) => {
        this.cloudAccount = accounts;
      });
  }

  getAttributesForInput(input: any): string[] {
    if (input.param_type === 'Cloud Account') {
      const account = this.cloudAccount?.find(
        (acc) => acc.uuid === input.default_value.uuid
      );
      if (!account) {
        return [];
      }
      const attrConfig = cloudAttributes.find(
        (c) => c.cloudType === account.cloud_type
      );
      return attrConfig ? attrConfig.attributes : [];
    }

    if (input.param_type === 'Credential') {
      return ['username', 'password'];
    }

    return [];
  }

  getCredentials() {
    this.svc
      .getCredentials()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((accounts) => {
        this.credentials = accounts;
      });
  }

  searchTargets = (query: string): Observable<any[]> => {
    return this.svc.getHost(query).pipe(
      catchError((err) => {
        this.notification.error(
          new Notification('Failed to fetch targets. Please try again later.')
        );
        return of([]);
      })
    );
  };

  createScheduleTriggerForm(nodeData, nodeId) {
    this.oldNames['scheduleTriggerForm'] = nodeData?.name || '';
    this.scheduleTriggerForm = this.svc.createScheduleTriggerForm(
      nodeData,
      nodeId
    );
    this.scheduleTriggerFormErrors = this.svc.scheduleTriggerFormErrors(
      nodeData,
      nodeId
    );
    this.scheduleTriggerValidationMessage =
      this.svc.scheduleTriggerValidationMessage;

    const scheduleInputsArray =
      this.nodeData?.inputs?.map((out) =>
        this.fb.group({
          param_name: [
            out.param_name || '',
            [Validators.required, paramNameValidator],
          ],
          param_type: [out.param_type || '', [Validators.required]],
          default_value: [out.default_value || '', [Validators.required]],
        })
      ) || [];

    this.scheduleTriggerForm = this.fb.group({
      name: this.fb.control(nodeData.name),
      inputs: this.fb.array(scheduleInputsArray),
    });

    if (this.nodeData?.config?.schedule_meta) {
      this.scheduleSvc.addOrEdit(this.nodeData.config.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }

    this.scheduleTriggerFormErrors = {
      inputs: scheduleInputsArray.map(() => ({
        param_name: '',
        param_type: '',
        default_value: '',
      })),
    };

    if (nodeData?.formErrors?.inputs?.length) {
      this.scheduleTriggerFormErrors = nodeData.formErrors;
    }

    const firstParam = (
      this.scheduleTriggerForm.get('inputs') as FormArray
    )?.at(0) as FormGroup;
    if (firstParam) {
      firstParam
        .get('param_type')
        ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          firstParam.get('default_value')?.reset('');
        });
    }
    return this.scheduleTriggerForm;
  }

  // Getter for FormArray
  get scheduleInputs(): FormArray {
    return this.scheduleTriggerForm.get('inputs') as FormArray;
  }

  // Add param
  addScheduleParam(): void {
    const inputsArray = this.scheduleInputs;

    if (inputsArray.length > 0) {
      const lastInput = inputsArray.at(inputsArray.length - 1) as FormGroup;
      if (lastInput.invalid) {
        this.scheduleTriggerFormErrors['inputs'][inputsArray.length - 1] =
          this.utilService.validateForm(
            lastInput,
            this.scheduleTriggerValidationMessage['inputs'],
            this.scheduleTriggerFormErrors['inputs'][inputsArray.length - 1]
          );
        lastInput.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            this.scheduleTriggerFormErrors['inputs'][inputsArray.length - 1] =
              this.utilService.validateForm(
                lastInput,
                this.scheduleTriggerValidationMessage['inputs'],
                this.scheduleTriggerFormErrors['inputs'][inputsArray.length - 1]
              );
          });
        return;
      }
    }

    // this.scheduleInputs.push(this.svc.buildParameterForm(true));
    const newParam = this.svc.buildParameterForm(true);
    this.scheduleInputs.push(newParam);

    newParam.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      newParam.get('default_value')?.reset('');
    });
    this.scheduleTriggerFormErrors.inputs.push({
      param_name: '',
      param_type: '',
      default_value: '',
    });
  }

  removeScheduleParam(index: number): void {
    this.scheduleInputs.removeAt(index);
    if (this.scheduleTriggerFormErrors?.inputs?.length > index) {
      this.scheduleTriggerFormErrors.inputs.splice(index, 1);
    }
  }

  autoSaveScheduleInputs() {
    if (!this.scheduleTriggerForm) {
      this.updatedScheduleInputData = { config: { schedule_meta: null } };
      return;
    }

    const rawMeta = this.scheduleSvc?.getFormValue();
    const scheduleMeta = rawMeta?.schedule_meta
      ? { ...rawMeta.schedule_meta, run_now: false }
      : { ...rawMeta, run_now: false };

    this.updatedScheduleInputData = {
      config: { schedule_meta: scheduleMeta },
      ...this.scheduleTriggerForm.getRawValue(),
    };
  }

  compareAccounts(a: any, b: any): boolean {
    return a && b ? a.uuid === b.uuid : a === b;
  }

  /////////////////////////// ON CHAT MESSAGE ///////////////////////////////////////

  onChatCreateMessageForm(nodeData, nodeId) {
    this.oldNames['onChatMessageForm'] = nodeData?.name || '';
    this.onChatMessageForm = this.svc.buildOnChatForm(nodeData, nodeId);
    this.onChatMessageFormErrors = this.svc.onChatFormErrors(nodeData, nodeId);
    this.onChatMessageValidationMessage = this.svc.onChatValidationMessage;

    const savedMessage = nodeData?.config?.welcome_message;
    if (savedMessage) {
      this.onChatMessageForm.patchValue({ welcome_message: savedMessage });
    }

    if (nodeData?.inputs?.length) {
      const inputsArray = this.onChatInputs;
      nodeData.inputs.forEach((inp, index) => {
        const ctrl = inputsArray.at(index) as FormGroup;
        if (ctrl) {
          ctrl.patchValue({
            param_name: inp.param_name || '',
            param_type: inp.param_type || '',
            default_value: inp.default_value || '',
          });
        }
      });
    }

    if (nodeData?.formErrors?.inputs?.length) {
      this.onChatMessageFormErrors = nodeData.formErrors;
    }

    return this.onChatMessageForm;
  }

  get onChatInputs(): FormArray {
    return this.svc.getOnChat(this.onChatMessageForm);
  }

  addOnChatParam(): void {
    const inputsArray = this.onChatInputs;

    if (inputsArray.length > 0) {
      const lastInput = inputsArray.at(inputsArray.length - 1) as FormGroup;
      if (lastInput.invalid) {
        this.onChatMessageFormErrors.inputs[inputsArray.length - 1] =
          this.utilService.validateForm(
            lastInput,
            this.onChatMessageValidationMessage.inputs,
            this.onChatMessageFormErrors.inputs[inputsArray.length - 1]
          );
        lastInput.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.onChatMessageFormErrors.inputs[inputsArray.length - 1] =
              this.utilService.validateForm(
                lastInput,
                this.onChatMessageValidationMessage.inputs,
                this.onChatMessageFormErrors.inputs[inputsArray.length - 1]
              );
          });
        return;
      }
    }

    const newParam = this.svc.buildParameterForm(true);
    this.onChatInputs.push(newParam);

    newParam.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      newParam.get('default_value')?.reset('');
    });

    this.onChatMessageFormErrors.inputs.push({
      param_name: '',
      param_type: '',
      default_value: '',
    });
  }

  removeOnChatParam(index: number): void {
    this.onChatInputs.removeAt(index);
    this.onChatMessageFormErrors.inputs.splice(index, 1);
  }

  autoSaveOnChatInputs() {
    const onChatData = this.onChatMessageForm?.getRawValue();

    this.updatedOnChatInputData = {
      name: onChatData?.name,
      config: {
        welcome_message: onChatData?.welcome_message,
      },
      inputs: onChatData?.inputs || [],
    };
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

  get expandedPromptControl() {
    return this.expandedFormControlName
      ? this.propertiesForm.get(this.expandedFormControlName)
      : null;
  }

  getDropdownFields() {
    this.aimlFormErrors = this.svc.aimlEventTriggerFormErrors(this.nodeData);
    this.aimlFormValidationMessage = this.svc.aimlEventTriggerValidationMessage;

    this.svc.createAimlEventTriggerForm(this.nodeData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      console.log(res, "res")

      this.aimlForm = res;
      this.formSubscriptions();

      const aimlTypeControl = this.aimlForm.get("aiml_type");

      if (aimlTypeControl?.value) {
        this.loadDropdownFields(aimlTypeControl.value);
      }

      aimlTypeControl?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(aimlType => {

        this.aimlForm.patchValue({
          event_type: [],
          filter: null,
          description: null
        });

        this.aimlForm.get('filters')?.reset();

        this.loadDropdownFields(aimlType);
      });

      this.spinner.stop('main');
    });
  }

  loadDropdownFields(aimlType: string) {
    this.queryBuilderConfig = null;
    this.svc.getDropdownFields(aimlType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.length) {
        this.queryBuilderConfig = this.svc.convertQueryBuilderData(res);
      }
    });
  }

  formSubscriptions() {
    this.currentRuleSetValue = this.aimlForm.get('filter').value;
    if (this.currentRuleSetValue) {
      this.aimlForm.get('filter').setValue(this.currentRuleSetValue);
      this.aimlForm.get('description').setValue(this.svc.basicRulesetToSQL(this.currentRuleSetValue));
    }
    this.aimlForm.get('filter').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
      this.currentRuleSetValue = val;
      this.aimlForm.get('description').setValue(this.svc.basicRulesetToSQL(val));
    });
  }


  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  onTagInputChange() {
    this.aimlForm.get('description').setValue(this.svc.basicRulesetToSQL(this.aimlForm.get('filters').value));
  }
}

