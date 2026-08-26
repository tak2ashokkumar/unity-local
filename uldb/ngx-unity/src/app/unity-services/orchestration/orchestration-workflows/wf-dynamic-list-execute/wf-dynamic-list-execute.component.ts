import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { WfDynamicListExecuteService } from './wf-dynamic-list-execute.service';
import { nodeTypes } from '../wf-dynamic-container/wf-dynamic-container.type';

@Component({
  selector: 'wf-dynamic-list-execute',
  templateUrl: './wf-dynamic-list-execute.component.html',
  styleUrls: ['./wf-dynamic-list-execute.component.scss'],
  providers: [WfDynamicListExecuteService]
})
export class WfDynamicListExecuteComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  workflowId: string;
  workflowName: string;
  workflowData: any;
  triggerNode: any;
  nodeType: string;
  executionMode: 'dynamic' | 'agentic' = 'dynamic';
  isSubmitting = false;

  manualForm: FormGroup;
  manualFormErrors: any;
  manualFormValidationMessage: any;

  scheduleForm: FormGroup;
  scheduleFormErrors: any;
  scheduleFormValidationMessage: any;

  webhookTriggerForm: FormGroup;
  webhookTriggerFormErrors: any;
  webhookTriggerFormValidationMessage: any;

  itsmTriggerForm: FormGroup;
  itsmTriggerFormErrors: any;
  itsmTriggerFormValidationMessage: any;
  itsmData: any[] = [];
  commentData: any[] = [];

  aimlTriggerForm: FormGroup;
  aimlTriggerFormErrors: any;
  aimlTriggerFormValidationMessage: any;
  aimlData: any[] = [];
  isDropdownOpen = false;
  isLoading = false;
  hasNextPage = true;
  page = 1;
  pageSize = 10;
  selectedItem: any;

  cloudAccount: any[] = [];
  credentials: any[] = [];

  constructor(private svc: WfDynamicListExecuteService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private router: Router,
    private eRef: ElementRef,
    private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workflowId = params.get('id') || params.get('workflowId');
    });
  }

  ngOnInit(): void {
    this.workflowId = this.workflowId
      || this.route.snapshot.paramMap.get('id')
      || this.route.snapshot.paramMap.get('workflowId');
    this.nodeType = this.getNodeTypeFromRoute();
    this.loadExecuteForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get manualInputs(): FormArray {
    return this.manualForm?.get('inputs') as FormArray;
  }

  get scheduleInputs(): FormArray {
    return this.scheduleForm?.get('inputs') as FormArray;
  }

  loadExecuteForm(): void {
    if (!this.workflowId) {
      this.notification.error(new Notification('Workflow id is missing.'));
      return;
    }
    this.loadTriggerDetails(this.nodeType);
  }

  loadTriggerDetails(nodeType: string): void {
    this.executionMode = 'dynamic';
    this.spinner.start('main');
    this.svc.getTriggerDetails(this.workflowId, nodeType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.spinner.stop('main');
      this.workflowData = param;
      this.workflowName = param?.name || '';
      this.triggerNode = {
        ...param,
        node_type: this.normalizeNodeType(nodeType)
      };
      this.nodeType = this.triggerNode.node_type;
      this.buildFormForNode(this.triggerNode);
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Error while fetching ${nodeType} Inputs. Please try again!!`));
    });
  }

  buildFormForNode(node: any): void {
    const type = this.normalizeNodeType(node?.node_type);

    this.resetForms();

    if (type === 'Manual Trigger') {
      this.manualForm = this.svc.buildManualTriggerForm(node);
      this.manualFormErrors = this.svc.resetInputFormErrors();
      this.manualFormValidationMessage = this.svc.inputFormValidationMessages;
      this.getCloudAccount();
      this.getCredentials();
      return;
    }

    if (type === 'Schedule Trigger') {
      this.scheduleForm = this.svc.buildScheduleTriggerForm(node);
      this.scheduleFormErrors = this.svc.resetInputFormErrors();
      this.scheduleFormValidationMessage = this.svc.inputFormValidationMessages;
      this.scheduleSvc.addOrEdit(this.getScheduleMeta(node));
      this.getCloudAccount();
      this.getCredentials();
      return;
    }

    if (type === 'Webhook Trigger') {
      this.webhookTriggerForm = this.svc.buildWebhookTriggerForm(node);
      this.webhookTriggerFormErrors = this.svc.resetWebhookFormErrors();
      this.webhookTriggerFormValidationMessage = this.svc.webhookFormValidationMessages;
      return;
    }

    if (type === 'ITSM Event Trigger') {
      this.itsmTriggerForm = this.svc.buildITSMTriggerForm(node);
      this.itsmTriggerFormErrors = this.svc.resetITSMFormErrors();
      this.itsmTriggerFormValidationMessage = this.svc.itsmFormValidationMessages;
      this.getUnityOneITSM(node);
      return;
    }

    if (type === 'AIML Event Trigger') {
      this.aimlTriggerForm = this.svc.buildAIMLTriggerForm(node);
      this.aimlTriggerFormErrors = this.svc.resetAIMLFormErrors();
      this.aimlTriggerFormValidationMessage = this.svc.aimlFormValidationMessages;
      this.openDropdown();
    }
  }

  resetForms(): void {
    this.manualForm = null;
    this.scheduleForm = null;
    this.webhookTriggerForm = null;
    this.itsmTriggerForm = null;
    this.aimlTriggerForm = null;
    this.itsmData = [];
    this.commentData = [];
    this.aimlData = [];
    this.selectedItem = null;
    this.isDropdownOpen = false;
    this.page = 1;
    this.hasNextPage = true;
  }

  getCloudAccount(): void {
    this.svc.getAllCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.cloudAccount = accounts;
    });
  }

  getCredentials(): void {
    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(credentials => {
      this.credentials = credentials;
    });
  }

  searchTargets = (query: string): Observable<any[]> => {
    return this.svc.getHost(query).pipe(catchError(() => {
      this.notification.error(new Notification('Failed to fetch targets. Please try again later.'));
      return of([]);
    }));
  };

  getUnityOneITSM(node: any): void {
    const tableId = this.getResolvedConfig(node)?.itsm_table;

    if (!tableId) {
      return;
    }

    this.spinner.start('main');
    this.svc.getUnityOneITSMData(tableId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.itsmData = res?.results || [];
      this.recordUuidChange(node);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load ITSM Table data'));
    });
  }

  recordUuidChange(node: any): void {
    this.itsmTriggerForm.get('record_uuid')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((recordUuid: string) => {
      const config = this.getResolvedConfig(node);
      const tableId = config?.itsm_table;
      const activityType = Array.isArray(config?.event_type) ? config.event_type.join(',') : config?.event_type;

      if (tableId && recordUuid && activityType) {
        this.callCommentActivity(tableId, recordUuid, activityType);
      }
    });
  }

  callCommentActivity(tableId: string, recordUuid: string, activityType: string): void {
    this.svc.getCommentActivity(tableId, recordUuid, activityType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.commentData = res || [];
    }, () => {
      this.notification.error(new Notification('Failed to load comment activity'));
    });
  }

  getAIMLData(): void {
    if (this.isLoading || !this.hasNextPage) {
      return;
    }

    this.isLoading = true;
    const config = this.getResolvedConfig(this.triggerNode);
    const obj = {
      aiml_type: config?.aiml_type ?? config?.type,
      event_type: config?.event_type,
      filter: config?.filter ?? config?.filter_conditions
    };

    this.svc.getAIMLData(this.page, this.pageSize, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const newData = (res?.results || []).map(item => ({
        ...item,
        status: item.status === 0 ? 'Open' : item.status === 1 ? 'Resolved' : item.status
      }));

      this.aimlData = [...(this.aimlData || []), ...newData];
      this.hasNextPage = !!res?.next;
      this.page++;
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.notification.error(new Notification('Failed to load AIML Data'));
    });
  }

  onScroll(event: any): void {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

    if (atBottom) {
      this.getAIMLData();
    }
  }

  openDropdown(): void {
    this.page = 1;
    this.hasNextPage = true;
    this.aimlData = [];
    this.getAIMLData();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen && this.aimlData.length === 0) {
      this.openDropdown();
    }
  }

  selectItem(item: any): void {
    this.selectedItem = item;
    this.aimlTriggerForm.patchValue({ id: item.id });
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  onSubmit(): void {
    const triggerData = this.getTriggerData();

    if (!triggerData) {
      return;
    }

    this.isSubmitting = true;
    this.spinner.start('main');

    const request$ = this.svc.sendTriggerDetails(this.workflowId, this.nodeType, triggerData)

    request$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.spinner.stop('main');
      this.isSubmitting = false;
      this.notification.success(new Notification(`${this.nodeType} execution started successfully`));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.isSubmitting = false;
      this.notification.error(new Notification(`${this.nodeType} execution failed`));
    });
  }

  getTriggerData(): any {
    if (this.nodeType === 'Manual Trigger') {
      if (this.manualForm.invalid) {
        this.updateInputFormErrors(this.manualForm, this.manualFormErrors, this.manualFormValidationMessage);
        return null;
      }

      return this.manualForm.getRawValue();
    }

    if (this.nodeType === 'Schedule Trigger') {
      if (this.scheduleForm.invalid) {
        this.updateInputFormErrors(this.scheduleForm, this.scheduleFormErrors, this.scheduleFormValidationMessage);
        return null;
      }

      const rawValue = this.scheduleForm.getRawValue();
      const scheduleValue = this.scheduleSvc.getFormValue(false);

      return {
        ...rawValue,
        config: {
          schedule_meta: {
            ...scheduleValue.schedule_meta,
            run_now: false
          }
        }
      };
    }

    if (this.nodeType === 'Webhook Trigger') {
      if (this.webhookTriggerForm.invalid) {
        this.webhookTriggerFormErrors = this.utilService.validateForm(this.webhookTriggerForm, this.webhookTriggerFormValidationMessage, this.webhookTriggerFormErrors);
        this.webhookTriggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.webhookTriggerFormErrors = this.utilService.validateForm(this.webhookTriggerForm, this.webhookTriggerFormValidationMessage, this.webhookTriggerFormErrors);
        });
        return null;
      }

      const raw = this.webhookTriggerForm.getRawValue();
      const payload = raw.payload ? JSON.parse(raw.payload) : {};

      return { inputs: { payload } }
    }

    if (this.nodeType === 'ITSM Event Trigger') {
      if (this.itsmTriggerForm.invalid) {
        this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors);
        this.itsmTriggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors);
        });
        return null;
      }

      const itsmData = this.itsmTriggerForm.getRawValue();
      return { inputs: itsmData }
    }

    if (this.nodeType === 'AIML Event Trigger') {
      if (this.aimlTriggerForm.invalid) {
        this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors);
        this.aimlTriggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors);
        });
        return null;
      }

      const config = this.getResolvedConfig(this.triggerNode);
      const aimlData = {
        ...this.aimlTriggerForm.getRawValue(),
        aiml_type: config?.aiml_type ?? config?.type
      };

      return this.executionMode === 'dynamic'
        ? { inputs: { aiml_data: aimlData } }
        : { aiml_data: this.aimlTriggerForm.getRawValue() };
    }

    return null;
  }

  updateInputFormErrors(form: FormGroup, formErrors: any, validationMessages: any): void {
    formErrors.inputs = {};
    const inputs = form.get('inputs') as FormArray;

    inputs.controls.forEach((group, i) => {
      formErrors.inputs[i] = {};
      const defaultValueControl = group.get('default_value');

      if (defaultValueControl?.errors?.['required']) {
        formErrors.inputs[i].default_value = validationMessages.inputs.default_value;
      }

      defaultValueControl?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
        if (value) {
          formErrors.inputs[i].default_value = '';
        }
      });
    });
  }

  buildDynamicExecutionPayload(triggerData: any): any {
    const sessionId = this.generateUUID();

    return {
      name: this.workflowData?.name || this.workflowName,
      description: this.workflowData?.description || 'Description',
      version: this.workflowData?.version || 1,
      variables: this.workflowData?.variables || [],
      nodes: (this.workflowData?.nodes || []).map(node => this.buildDynamicNode(node)),
      connections: this.mapConnectionsForApi(this.workflowData?.connections || []),
      mode: 'from_start',
      session_id: sessionId,
      ...triggerData
    };
  }

  buildDynamicNode(node: any): any {
    const baseNode = {
      name: node.name,
      node_id: node.node_id,
      node_type: node.node_type,
      type_version: node.type_version || 1,
      pos_x: node?.pos_x,
      pos_y: node?.pos_y,
      config: this.getFinalNodeConfig(node),
      inputs: [],
      outputs: [],
      endpoint: node.endpoint,
      key: node.key
    };

    if (node.node_type === 'Schedule Trigger') {
      this.applyScheduleMeta(baseNode);
    }

    if (node.node_type === 'AI Agent') {
      const tools = node?.node_meta?.tools || node?.tools || [];
      return {
        ...baseNode,
        node_meta: {
          tools: tools.map(tool => ({
            tool_id: tool.tool_id,
            name: tool.name,
            node_type: tool.node_type || tool.type,
            key: tool?.key,
            config: this.clone(tool.config || tool.formData || {})
          })),
          model: node?.node_meta?.model || node?.model || {},
          enable_memory: node?.node_meta?.enable_memory ?? node?.enable_memory ?? false
        }
      };
    }

    if (node.node_type === 'LLM Chain') {
      return {
        ...baseNode,
        node_meta: {
          model: node?.node_meta?.model || node?.model || {}
        }
      };
    }

    return baseNode;
  }

  applyScheduleMeta(node: any): void {
    if (this.nodeType !== 'Schedule Trigger' || !this.scheduleForm) {
      return;
    }

    const scheduleValue = this.scheduleSvc.getFormValue(false);
    const scheduleMeta = {
      ...scheduleValue.schedule_meta,
      run_now: false
    };

    if (node.config?.properties) {
      node.config.properties.unity_schedule = scheduleMeta;
      return;
    }

    node.config = {
      ...(node.config || {}),
      unity_schedule: scheduleMeta
    };
  }

  getFinalNodeConfig(node: any): any {
    const nodeConfig = this.clone(node?.config) || {};
    const formData = this.clone(node?.formData) || {};

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

    return nodeConfig;
  }

  mapConnectionsForApi(connections: any[]): any[] {
    return connections.map(conn => ({
      source_node_id: Number(conn.source_node_id ?? conn.output_id),
      source_output: conn.source_output ?? conn.output_class,
      target_node_id: Number(conn.target_node_id ?? conn.input_id),
      target_input: conn.target_input ?? conn.input_class
    }));
  }

  getTriggerNode(nodes: any[], preferredNodeType?: string): any {
    const normalizedPreferred = this.normalizeNodeType(preferredNodeType);


    if (normalizedPreferred) {
      const preferredNode = nodes.find(node => this.normalizeNodeType(node?.node_type) === normalizedPreferred);

      if (preferredNode) {
        return preferredNode;
      }
    }
    return nodes
      .map(node => this.normalizeNodeType(node?.node_type))
      .find(type => Object.values(nodeTypes).includes(type as nodeTypes)) ?? null;
  }

  getNodeTypeFromRoute(): string {
    const query = this.route.snapshot.paramMap.get('nodeType');
    return this.normalizeNodeType(query);
  }


  normalizeNodeType(nodeType: string): string {
    const type = this.decodeRouteValue(nodeType)
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return type;
  }



  private decodeRouteValue(value: string): string {
    try {
      return decodeURIComponent((value || '').replace(/\+/g, ' '));
    } catch {
      return value || '';
    }
  }

  getResolvedConfig(node: any): any {
    return node?.config?.properties
      ?? node?.properties
      ?? node?.config
      ?? node
      ?? {};
  }

  getScheduleMeta(node: any): any {
    const config = this.getResolvedConfig(node);
    return config?.unity_schedule
      ?? config?.schedule_meta
      ?? node?.config?.schedule_meta
      ?? null;
  }

  getParamType(inputControl: any): string {
    return (inputControl.get('param_type')?.value || '')
      .toString()
      .replace(/[_-]/g, ' ')
      .trim()
      .toUpperCase();
  }

  compareAccounts(a: any, b: any): boolean {
    return a && b ? a.uuid === b.uuid : a === b;
  }

  formatParamName(name: string): string {
    if (!name) {
      return '';
    }

    return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  formatActivityType(type: string): string {
    if (!type) {
      return '';
    }

    return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  goBack(): void {
    this.router.navigate(['../../../'], { relativeTo: this.route });
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

  private clone(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    return JSON.parse(JSON.stringify(value));
  }
}
