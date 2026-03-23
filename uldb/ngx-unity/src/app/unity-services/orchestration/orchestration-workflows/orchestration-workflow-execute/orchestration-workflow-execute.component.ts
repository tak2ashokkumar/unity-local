import { Component, ElementRef, EventEmitter, HostBinding, Inject, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { OnChatExecution, OrchestrationWorkflowExecuteService } from './orchestration-workflow-execute.service';
import { catchError, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ChatHistoryData } from '../orchestration-workflows.type';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'orchestration-workflow-execute',
  templateUrl: './orchestration-workflow-execute.component.html',
  styleUrls: ['./orchestration-workflow-execute.component.scss'],
  providers: [OrchestrationWorkflowExecuteService]
})
export class OrchestrationWorkflowExecuteComponent implements OnInit {
  @Output() closeSidebar = new EventEmitter<void>();
  private ngUnsubscribe = new Subject();
  @Input() selectedNode: any;
  @Input() workFlowData: any;
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;
  @Output() triggerSubmit = new EventEmitter<any>();
  @Input() chatUpdates$!: Observable<OnChatExecution>;

  workflowId: string;
  cloudAccount: any;
  credentials: any;
  workflowName: string;

  //manualTrigger
  manualForm: FormGroup;
  manualFormErrors: any;
  manualFormValidationMessage: any;

  //scheduleTrigger 
  scheduleForm: FormGroup;
  scheduleFormErrors: any;
  scheduleFormValidationMessage: any;

  //webhookTrigger
  webhookTriggerForm: FormGroup;
  webhookTriggerFormErrors: any;
  webhookTriggerFormValidationMessage: any;

  //OnchatTrigger
  welcomeMessage = '';
  sessionId = '';
  isTyping = false;
  firstMessage = '';
  newMessage = '';
  chatHistoryData: ChatHistoryData[] = [];
  triggerData: any;

  //itsmTrigger
  itsmTriggerForm: FormGroup;
  itsmTriggerFormErrors: any;
  itsmTriggerFormValidationMessage: any;
  itsmData: any;
  commentData: any

  //aimlTrigger
  aimlTriggerForm: FormGroup;
  aimlTriggerFormErrors: any;
  aimlTriggerFormValidationMessage: any;
  aimlData: any;

  //Resizing
  @HostBinding('style.width.px')
  hostWidth = 430;

  @HostBinding('style.position')
  hostPosition = 'absolute';

  @HostBinding('style.right.px')
  right = 0;

  @HostBinding('style.top.px')
  top = 0;

  @HostBinding('style.height')
  height = '100%';

  minWidth = 300;
  maxWidth = 700;

  private isResizing = false;
  private removeMouseMove?: () => void;
  private removeMouseUp?: () => void;

  constructor(private svc: OrchestrationWorkflowExecuteService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    console.log(this.selectedNode, "selectedNode");
    console.log(this.workFlowData, "workflowdata");

    const manualNode = this.getManualTriggerNode();
    const scheduleNode = this.getScheduleTriggerNode();
    const webhookNode = this.getWebhookTriggerNode();
    const chatNode = this.getChatTriggerNode();
    const itsmNode = this.getItsmTriggerNode();
    const aimlNode = this.getAIMLTriggerNode();

    if (manualNode) {
      this.workflowName = manualNode.name;
      this.buildManualForm(manualNode);
    }
    else if (scheduleNode) {
      this.workflowName = scheduleNode.name;
      this.buildScheduleForm(scheduleNode);
    } else if (webhookNode) {
      this.workflowName = webhookNode.name;
      this.buildWebhookForm(webhookNode);
    } else if (chatNode) {
      this.chatUpdates$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => this.updateBotMessage(status));
      this.workflowName = chatNode.name;
      this.buildChatTrigger(chatNode);
    } else if (itsmNode) {
      this.workflowName = itsmNode.name;
      this.buildITSMForm(itsmNode);
    } else if (aimlNode) {
      this.workflowName = aimlNode.name;
      this.buildAIMLForm(aimlNode);
    }
    if (!chatNode || !itsmNode || !webhookNode) {
      this.getCloudAccount();
      this.getCredentials();
    }
    if (itsmNode) {
      this.getUnityOneITSM();
    }
    if (aimlNode) {
      this.getAIMLData();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getManualTriggerNode(): any {
    if (this.selectedNode?.node_type === 'Manual Trigger') {
      return this.selectedNode;
    }
    return this.workFlowData?.nodes?.find((node: any) => node.node_type === 'Manual Trigger');
  }

  getScheduleTriggerNode(): any {
    if (this.selectedNode?.node_type === 'Schedule Trigger') {
      return this.selectedNode;
    }
    return this.workFlowData?.nodes?.find((node: any) => node.node_type === 'Schedule Trigger');
  }

  getWebhookTriggerNode(): any {
    if (this.selectedNode?.node_type === 'Webhook Trigger') {
      return this.selectedNode;
    }
    return this.workFlowData?.nodes?.find((node: any) => node.node_type === 'Webhook Trigger');
  }

  getChatTriggerNode(): any {
    if (this.selectedNode?.node_type === 'Chat Trigger') {
      return this.selectedNode;
    }
    return this.workFlowData?.nodes?.find((node: any) => node.node_type === 'Chat Trigger');
  }

  getItsmTriggerNode(): any {
    if (this.selectedNode?.node_type === 'ITSM Event Trigger') {
      return this.selectedNode;
    }
    return this.workFlowData?.nodes?.find((node: any) => node.node_type === 'ITSM Event Trigger');
  }

  getAIMLTriggerNode(): any {
    if (this.selectedNode?.node_type === 'AIML Event Trigger') {
      return this.selectedNode;
    }
    return this.workFlowData?.nodes?.find((node: any) => node.node_type === 'AIML Event Trigger');
  }

  buildManualForm(param: any) {
    this.manualForm = this.svc.buildManualTriggerForm(param);
    this.manualFormErrors = this.svc.resetManualFormErrors();
    this.manualFormValidationMessage = this.svc.manualFormValidationMessages;
    this.spinner.stop('main');
  }

  buildScheduleForm(param: any) {
    this.scheduleForm = this.svc.buildScheduleTriggerForm(param);
    this.scheduleFormErrors = this.svc.resetScheduleFormErrors();
    this.scheduleFormValidationMessage = this.svc.scheduleFormValidationMessages;
    this.spinner.stop('main');
  }

  buildWebhookForm(param: any) {
    this.webhookTriggerForm = this.svc.buildWebhookTriggerForm(param);
    this.webhookTriggerFormErrors = this.svc.resetWebhookFormErrors();
    this.webhookTriggerFormValidationMessage = this.svc.webhookFormValidationMessages;
    this.spinner.stop('main');
  }

  buildITSMForm(param: any) {
    this.itsmTriggerForm = this.svc.buildITSMTriggerForm(param);
    this.itsmTriggerFormErrors = this.svc.resetITSMFormErrors();
    this.itsmTriggerFormValidationMessage = this.svc.itsmFormValidationMessages;
    this.spinner.stop('main');
  }

  buildAIMLForm(param: any) {
    this.aimlTriggerForm = this.svc.buildAIMLTriggerForm(param);
    this.aimlTriggerFormErrors = this.svc.resetAIMLFormErrors();
    this.aimlTriggerFormValidationMessage = this.svc.aimlFormValidationMessages;
    this.spinner.stop('main');
  }

  buildChatTrigger(node: any) {
    this.welcomeMessage = node?.config?.welcome_message || 'Hi, How can I assist you today?';
    this.chatHistoryData = [];
    this.newMessage = '';
    this.firstMessage = '';
    this.isTyping = false;
    this.chatHistoryData.push({
      sender: 'bot',
      message: this.welcomeMessage,
      status: 'Success'
    });
    setTimeout(() => this.scrollToBottom('auto'), 50);
  }

  get manualInputs(): FormArray {
    return this.manualForm?.get('inputs') as FormArray;
  }

  get scheduleInputs(): FormArray {
    return this.scheduleForm?.get('inputs') as FormArray;
  }

  getCloudAccount() {
    this.svc.getAllCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.cloudAccount = accounts;
    })
  }

  getCredentials() {
    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.credentials = accounts;
    })
  }

  searchTargets = (query: string): Observable<any[]> => {
    return this.svc.getHost(query).pipe(catchError(err => {
      this.notification.error(new Notification('Failed to fetch targets. Please try again later.'));
      return of([]);
    }));
  };

  compareAccounts(a: any, b: any): boolean {
    console.log(a, b, "compare")
    return a && b ? a.uuid === b.uuid : a === b;
  }

  formatParamName(name: string): string {
    if (!name) return '';
    return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  formatActivityType(type: string): string {
    if (!type) return '';
    return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getUnityOneITSM() {
    let tableId = '';
    if (this.selectedNode?.node_type === 'ITSM Event Trigger') {
      tableId = this.selectedNode.config.itsm_table;
    } else {
      const itsmNode = this.workFlowData?.nodes?.find((node: any) => node.node_type === 'ITSM Event Trigger');
      tableId = itsmNode?.config?.itsm_table || '';
    }
    this.svc.getUnityOneITSMData(tableId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.itsmData = res.results;
      this.recordUuidChange();
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load ITSM Table data'));
    });
  }

  recordUuidChange() {
    const itsmNode = this.getItsmTriggerNode();
    this.itsmTriggerForm.get('record_uuid')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((recordUuid: string) => {
      const tableId = itsmNode.config.itsm_table;
      const activityType = itsmNode.config.event_type.join(',');
      this.callCommentActivity(tableId, recordUuid, activityType);
    });
  }

  callCommentActivity(tableId: string, recordUuid: string, activityType: string) {
    this.svc.getCommentActivity(tableId, recordUuid, activityType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.commentData = res;
    }, () => {
      this.notification.error(new Notification('Failed to load comment activity'));
    });
  }

  getAIMLData() {
    if (this.selectedNode?.node_type === 'AIML Event Trigger') {
      const obj = { aiml_type: this.selectedNode.config.aiml_type, event_type: this.selectedNode.config.event_type, filter: this.selectedNode.config.filter }
      this.svc.getAIMLData(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.aimlData = res.results.map(item => ({
          ...item,
          status: item.status === 0 ? "Open" : item.status === 1 ? "Resolved" : item.status
        }));
        this.spinner.stop('main');
      }, () => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to load AIML Data'));
      });
    }
  }

  updateManualFormErrors() {
    this.manualFormErrors.inputs = {};
    const inputs = this.manualForm.get('inputs') as FormArray;
    inputs.controls.forEach((group, i) => {
      this.manualFormErrors.inputs[i] = {};
      const defaultValueControl = group.get('default_value');
      if (defaultValueControl) {
        if (defaultValueControl.errors?.['required']) {
          console.log(this.manualFormValidationMessage.inputs.default_value, "default value")
          this.manualFormErrors.inputs[i].default_value = this.manualFormValidationMessage.inputs.default_value;
        }
        defaultValueControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
          if (value) {
            this.manualFormErrors.inputs[i].default_value = "";
          }
        });
      }
    });
  }

  updateScheduleFormErrors() {
    this.scheduleFormErrors.inputs = {};
    const inputs = this.scheduleForm.get('inputs') as FormArray;
    inputs.controls.forEach((group, i) => {
      this.scheduleFormErrors.inputs[i] = {};
      const defaultValueControl = group.get('default_value');
      if (defaultValueControl) {
        if (defaultValueControl.errors?.['required']) {
          console.log(this.scheduleFormValidationMessage.inputs.default_value, "default value")
          this.scheduleFormErrors.inputs[i].default_value = this.scheduleFormValidationMessage.inputs.default_value;
        }
        defaultValueControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
          if (value) {
            this.scheduleFormErrors.inputs[i].default_value = "";
          }
        });
      }
    });
  }


  onSubmit() {
    const manualNode = this.getManualTriggerNode();
    const scheduleNode = this.getScheduleTriggerNode();
    const webhookNode = this.getWebhookTriggerNode();
    const itsmNode = this.getItsmTriggerNode();
    const aimlNode = this.getAIMLTriggerNode();

    if (manualNode) {
      if (this.manualForm.invalid) {
        this.updateManualFormErrors();
        return;
      } else {
        this.triggerData = this.manualForm.getRawValue();
      }
    } else if (scheduleNode) {
      if (this.scheduleForm.invalid) {
        this.updateScheduleFormErrors();
        return;
      } else {
        this.triggerData = this.scheduleForm.getRawValue();
      }
    } else if (webhookNode) {
      if (this.webhookTriggerForm.invalid) {
        this.webhookTriggerFormErrors = this.utilService.validateForm(this.webhookTriggerForm, this.webhookTriggerFormValidationMessage, this.webhookTriggerFormErrors);
        this.webhookTriggerForm.valueChanges.subscribe((data: any) => { this.webhookTriggerFormErrors = this.utilService.validateForm(this.webhookTriggerForm, this.webhookTriggerFormValidationMessage, this.webhookTriggerFormErrors); });
        return;
      } else {
        const rawWebhookData = this.webhookTriggerForm.getRawValue();
        this.triggerData = { ...rawWebhookData, payload: rawWebhookData.payload ? JSON.parse(rawWebhookData.payload) : {} };
      }
    } else if (itsmNode) {
      if (this.itsmTriggerForm.invalid) {
        this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors);
        this.itsmTriggerForm.valueChanges.subscribe((data: any) => { this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors); });
        return;
      } else {
        const itsmPayload = this.itsmTriggerForm.getRawValue();
        this.triggerData = { itsm_data: itsmPayload };
      }
    } else if (aimlNode) {
      if (this.aimlTriggerForm.invalid) {
        this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors);
        this.aimlTriggerForm.valueChanges.subscribe((data: any) => { this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors); });
        return;
      } else {
        const aimlPayload = this.aimlTriggerForm.getRawValue();
        this.triggerData = { aiml_data: { ...aimlPayload, aiml_type: this.selectedNode.config.aiml_type } };
      }
    }
    this.triggerSubmit.emit(this.triggerData);
    this.onClose();
  }

  onClose() {
    this.closeSidebar.emit();
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

  updateBotMessage(status: OnChatExecution) {
    let runningIndex = this.chatHistoryData.findIndex(
      m => m.sender === 'bot' && m.status === 'Running'
    );

    if (runningIndex === -1) {
      runningIndex = this.chatHistoryData.push({
        sender: 'bot',
        message: status.chat_response,
        status: status.status
      }) - 1;
    } else {
      this.chatHistoryData[runningIndex].message = status.chat_response;
      this.chatHistoryData[runningIndex].status = status.status;
    }

    if (status.chat_response) {
      this.isTyping = false;
    }

    if (status.status !== 'Running') {
      this.isTyping = false;
    }


    this.scrollToBottom('smooth');
  }

  onEnter(event: KeyboardEvent) {
    if (event.shiftKey) {
      // allow newline
      return;
    }
    event.preventDefault(); // prevent newline
    this.send(this.newMessage); // send message
  }

  send(message: string | undefined) {
    const text = (message ?? '').trim();
    if (!text || this.isTyping) return;
    this.isTyping = true;

    this.chatHistoryData.push({
      sender: 'user',
      message: text
    });
    if (message === this.firstMessage) this.firstMessage = '';
    if (message === this.newMessage) this.newMessage = '';

    setTimeout(() => this.scrollToBottom('smooth'), 60);
    const req = { query: text };

    const chatNode = this.getChatTriggerNode();
    if (chatNode) {
      this.triggerData = req;
    }

    this.triggerSubmit.emit(this.triggerData);
  }

  private scrollToBottom(behavior: 'smooth' | 'auto' = 'auto') {
    try {
      const el = this.chatBody?.nativeElement;
      if (el) {
        // small delay to allow DOM updates
        setTimeout(() => {
          try {
            el.scrollTo({ top: el.scrollHeight, behavior });
          } catch (e) {
            el.scrollTop = el.scrollHeight;
          }
        }, 10);
      } else {
        // fallback
        try {
          window.scrollTo({ top: document.body.scrollHeight, behavior });
        } catch (e) {
          /* ignore */
        }
      }
    } catch (e) {
      // ignore
    }
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;

    this.removeMouseMove = this.renderer.listen(
      this.document,
      'mousemove',
      (e: MouseEvent) => this.onResize(e)
    );

    this.removeMouseUp = this.renderer.listen(
      this.document,
      'mouseup',
      () => this.stopResize()
    );
  }

  onResize(event: MouseEvent) {
    if (!this.isResizing) return;

    const newWidth = window.innerWidth - event.clientX;

    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.hostWidth = newWidth;
    }
  }

  stopResize() {
    this.isResizing = false;
    this.removeMouseMove?.();
    this.removeMouseUp?.();
  }

}
