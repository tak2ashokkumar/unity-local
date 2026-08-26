import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { catchError, delay, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ChatHistoryData } from '../orchestration-workflows.type';
import { DOCUMENT } from '@angular/common';
import { OrchestrationWorkflowExecuteService } from '../orchestration-workflow-execute/orchestration-workflow-execute.service';
import { OnChatExecution, WfDynamicRightExecuteService } from './wf-dynamic-right-execute.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'wf-dynamic-right-execute',
  templateUrl: './wf-dynamic-right-execute.component.html',
  styleUrls: ['./wf-dynamic-right-execute.component.scss'],
  providers: [WfDynamicRightExecuteService]
})
export class WfDynamicRightExecuteComponent implements OnInit {
  @Output() closeSidebar = new EventEmitter<void>();
  private ngUnsubscribe = new Subject();
  @Input() selectedNode: any;
  @Input() workFlowData: any;
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;
  @Output() triggerSubmit = new EventEmitter<any>();
  @Input() chatUpdates$!: Observable<OnChatExecution>;
  @Input() isRunning: boolean = false;

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
  aimlData: any[] = [];
  isDropdownOpen = false;
  isLoading = false;
  hasNextPage = true;
  page = 1;
  pageSize = 10;
  selectedItem: any;

  dynamicForm!: FormGroup;
  dynamicFields: any[] = [];
  fieldOptions: Record<string, any[]> = {};

  @Input() rightExecuteData: any;

  constructor(private svc: WfDynamicRightExecuteService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private eRef: ElementRef,
    private builder: FormBuilder,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadRightExecuteForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadRightExecuteForm(): void {
    const nodeType = this.rightExecuteData?.nodeType;
    const values = this.rightExecuteData?.values || {};

    switch (nodeType) {
      case 'Manual Trigger':
        this.buildManualForm(values);
        break;

      case 'Schedule Trigger':
        this.buildScheduleForm(values);
        break;

      case 'Webhook Trigger':
        this.buildWebhookForm(values);
        break;

      case 'ITSM Event Trigger':
        this.buildITSMForm(values);
        this.getUnityOneITSM();
        break;

      case 'AIML Event Trigger':
        this.buildAIMLForm(values);
        this.getAIMLData();
        break;

      case 'Chat Trigger':
        this.chatUpdates$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => this.updateBotMessage(status));
        this.buildChatTrigger(values);
        break;

      default:
        console.warn('Unsupported trigger type:', nodeType);
    }
  }


  getTriggerNode(type: string): any {
    return this.rightExecuteData?.nodeType === type
      ? this.rightExecuteData
      : null;
  }

  buildManualForm(values: any) {

    this.manualForm = this.svc.buildManualTriggerForm({
      inputs: values?.['input_params'] || []
    });
    this.manualFormErrors = this.svc.formErrors().manual;
    this.manualFormValidationMessage = this.svc.validationMessages;

    this.getCloudAccount();
    this.getCredentials();
  }

  buildScheduleForm(values: any) {

    this.scheduleForm = this.svc.buildScheduleTriggerForm({
      inputs: values?.['input_params'] || []
    });
    this.scheduleFormErrors = this.svc.formErrors().schedule;
    this.scheduleFormValidationMessage = this.svc.validationMessages;

    this.getCloudAccount();
    this.getCredentials();
  }

  buildWebhookForm(values: any) {
    this.webhookTriggerForm = this.svc.buildWebhookTriggerForm(values);
    this.webhookTriggerFormErrors = this.svc.formErrors().webhook;
    this.webhookTriggerFormValidationMessage = this.svc.validationMessages;
  }

  buildITSMForm(values: any) {
    this.itsmTriggerForm = this.svc.buildITSMTriggerForm(values);
    this.itsmTriggerFormErrors = this.svc.formErrors().itsm;
    this.itsmTriggerFormValidationMessage = this.svc.validationMessages;
  }

  buildAIMLForm(values: any) {
    this.aimlTriggerForm = this.svc.buildAIMLTriggerForm();
    this.aimlTriggerFormErrors = this.svc.formErrors().aiml;
    this.aimlTriggerFormValidationMessage = this.svc.validationMessages;
  }

  buildChatTrigger(node: any) {
    this.welcomeMessage = this.rightExecuteData?.values?.welcome_message || 'Hi, How can I assist you today?';
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
    console.log(this.rightExecuteData?.values, "itsm values")
    const values = this.rightExecuteData?.values || {};
    const tableId = values.itsm_table || '';
    if (!tableId) return;
    this.svc.getUnityOneITSMData(tableId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.itsmData = res.results;
      this.recordUuidChange();
      this.spinner.stop('main');
    },
      () => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to load ITSM Table data'));
      }
    );
  }

  recordUuidChange() {
    const values = this.rightExecuteData?.values || {}
    this.itsmTriggerForm.get('record_uuid')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((recordUuid: string) => {
      const tableId = values.itsm_table;
      const activityType = (values.event_type || []).join(',');
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
    if (this.isLoading || !this.hasNextPage) {
      return;
    }
    this.isLoading = true;
    const values = this.rightExecuteData?.values || {};
    console.log(values, "values aiml")
    const obj = {
      aiml_type: values.aiml_type,
      event_type: values.event_type,
      filter: values.condition
    };

    this.svc.getAIMLData(this.page, this.pageSize, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        const newData = res.results.map(item => ({
          ...item,
          status:
            values.status === 'Open' ? 0 : values.status === 'Resolved' ? 1 : values.status
        }));

        this.aimlData = [
          ...(this.aimlData || []),
          ...newData
        ];

        this.hasNextPage = !!res.next;
        this.page++;
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onScroll(event: any) {
    const element = event.target;

    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

    if (atBottom) {
      this.getAIMLData();
    }
  }

  openDropdown() {
    this.page = 1;
    this.hasNextPage = true;
    this.aimlData = [];

    this.getAIMLData();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;

    // load data when opening first time
    if (this.isDropdownOpen && this.aimlData.length === 0) {
      this.openDropdown();
    }
  }

  selectItem(item: any) {
    this.selectedItem = item;
    this.aimlTriggerForm.patchValue({ id: item.id });
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  updateInputFormErrors(
    form: FormGroup,
    formErrors: any,
    validationMessages: any
  ) {
    formErrors.inputs = {};

    const inputs = form.get('inputs') as FormArray;

    inputs.controls.forEach((group, i) => {
      formErrors.inputs[i] = {};

      const control = group.get('default_value');

      if (control?.errors?.['required']) {
        formErrors.inputs[i].default_value =
          validationMessages.inputs.default_value;
      }

      control?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(value => {
          if (value) {
            formErrors.inputs[i].default_value = '';
          }
        });
    });
  }

  onSubmit() {
    const manualNode = this.getTriggerNode('Manual Trigger');
    const scheduleNode = this.getTriggerNode('Schedule Trigger');
    const webhookNode = this.getTriggerNode('Webhook Trigger');
    const itsmNode = this.getTriggerNode('ITSM Event Trigger');
    const aimlNode = this.getTriggerNode('AIML Event Trigger');

    if (manualNode) {
      if (this.manualForm.invalid) {
        this.updateInputFormErrors(
          this.manualForm,
          this.manualFormErrors,
          this.manualFormValidationMessage
        );
        return;
      } else {
        this.triggerData = this.manualForm.getRawValue();
      }
    } else if (scheduleNode) {
      if (this.scheduleForm.invalid) {
        this.updateInputFormErrors(
          this.scheduleForm,
          this.scheduleFormErrors,
          this.scheduleFormValidationMessage
        );
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
        this.triggerData = { inputs: { ...rawWebhookData, payload: rawWebhookData.payload ? JSON.parse(rawWebhookData.payload) : {} } };
      }
    } else if (itsmNode) {
      if (this.itsmTriggerForm.invalid) {
        this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors);
        this.itsmTriggerForm.valueChanges.subscribe((data: any) => { this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors); });
        return;
      } else {
        this.triggerData = { inputs: { ...this.itsmTriggerForm.getRawValue() } };
      }
    } else if (aimlNode) {
      if (this.aimlTriggerForm.invalid) {
        this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors);
        this.aimlTriggerForm.valueChanges.subscribe((data: any) => { this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors); });
        return;
      } else {
        this.triggerData = { inputs: { ...this.aimlTriggerForm.getRawValue(), aiml_type: this.rightExecuteData.config.aiml_type } };
      }
    }
    this.triggerSubmit.emit(this.triggerData);
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

    const isFailed = status.status === 'Failed';
    const message = isFailed
      ? 'Your request could not be processed. Please try again.'
      : status.chat_response;

    if (runningIndex === -1) {
      runningIndex = this.chatHistoryData.push({
        sender: 'bot',
        message: message,
        status: status.status
      }) - 1;
    } else {
      this.chatHistoryData[runningIndex].message = message;
      this.chatHistoryData[runningIndex].status = status.status;
    }

    this.isTyping = false;
    this.scrollToBottom('smooth');
  }

  handleExecutionStartFailure() {
    this.isTyping = false;

    const runningIndex = this.chatHistoryData.findIndex(
      m => m.sender === 'bot' && m.status === 'Running'
    );

    const failMsg: ChatHistoryData = {
      sender: 'bot',
      message: 'Your request could not be processed. Please try again.',
      status: 'Failed'
    };

    if (runningIndex === -1) {
      this.chatHistoryData.push(failMsg);
    } else {
      this.chatHistoryData[runningIndex] = failMsg;
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
    this.scrollToBottom('auto', true);

    setTimeout(() => this.scrollToBottom('smooth'), 60);
    const req = {
      inputs: {
        query: text,
      }
    };

    const chatNode = this.getTriggerNode("Chat Trigger");
    if (chatNode) {
      this.triggerData = req;
    }

    this.triggerSubmit.emit(this.triggerData);
  }

  private scrollToBottom(behavior: 'smooth' | 'auto' = 'auto', force: boolean = false): void {
    try {
      // Get the chat container
      const el = this.chatBody?.nativeElement;
      if (!el) return;

      // Check if user is near the bottom (tolerance of 5px)
      const isNearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 15;

      // Only scroll if the user is already at the bottom
      if (force || isNearBottom) {
        // Delay slightly to ensure new messages are rendered
        setTimeout(() => {
          try {
            el.scrollTo({ top: el.scrollHeight, behavior });
          } catch (e) {
            // fallback for older browsers
            el.scrollTop = el.scrollHeight;
          }
        }, 10);
      }
    } catch (err) {
      console.error('Failed to scroll chat container:', err);
    }
  }
}

