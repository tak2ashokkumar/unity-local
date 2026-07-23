import { Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { ConditionDetailsViewData, ConditionInvestigationService, PromptResultViewData } from './condition-investigation.service';
import { FormGroup } from '@angular/forms';
import { PAGE_SIZES, SearchCriteria } from '../table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DOCUMENT } from '@angular/common';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService, DeviceMapping, SERVICE_NOW_TICKET_TYPE, TICKET_MGMT_TYPE, TICKET_TYPE } from '../app-utility/app-utility.service';
import { StorageService, StorageType } from '../app-storage/storage.service';
import { SharedCreateTicketService } from '../shared-create-ticket/shared-create-ticket.service';
import { FloatingTerminalService } from '../floating-terminal/floating-terminal.service';
import { AppLevelService } from 'src/app/app-level.service';
import { environment } from 'src/environments/environment';
import { DEVICE_WEB_ACCESS_SUBJECT, SWITCH_TICKET_METADATA } from '../create-ticket.const';
import { Notification } from '../app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { NetworkAgentsChatResponseType } from './condition-investigation-chatbot/condition-investigation-chatbot.type';
import { ConditionInvestigationNewTerminalService } from './condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { ConditionInvestigationFloatingTerminalService } from './condition-investigation-floating-terminal/condition-investigation-floating-terminal.service';
import { ConditionInvestigationTerminalWindowRegistryService } from './condition-investigation-new-terminal/condition-investigation-terminal-window-registry.service';
import { ConditionInvestigationCliCommandService } from './condition-investigation-cli-command.service';
import { ConditionInvestigationAuthModalService } from './condition-investigation-auth-modal/condition-investigation-auth-modal.service';
import { DATABASE_AGENT_APPLICATION } from './condition-investigation-db-connection.const';

@Component({
  selector: 'condition-investigation',
  templateUrl: './condition-investigation.component.html',
  styleUrls: ['./condition-investigation.component.scss']
})
export class ConditionInvestigationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private scrollMode: 'none' | 'toBottom' | 'preserve' = 'none';
  private prevScrollTopBeforeHistoryPrepend: number | null = null;
  private prevScrollHeightBeforeHistoryPrepend: number | null = null;

  conditionId: string;
  conditionUuid: string;
  conditionDetailsViewData: ConditionDetailsViewData;
  conditionOverviewViewData: any;

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  analysisLogos = AnalysisLogos;

  activitiesCount: number;
  activityCurrentCriteria: SearchCriteria;
  activityVerticalWizardViewData: any;

  chatResponse: any;
  chatResponseHistoryData: any[] = [];

  private registryChannel = new BroadcastChannel('terminal-tabs');
  lastOpenedWindow: any;

  isTerminalReady = false;

  @ViewChild('chatResponsHistoryScrollContainer') chatResponsHistoryScrollContainer: ElementRef;
  @ViewChild('chatResponseHistoryCardBody') chatResponseHistoryCardBody: ElementRef;
  @ViewChildren('chatResponseHistory') chatResponseHistory: QueryList<ElementRef>;

  initialChatResponseData: any[] = [];
  isAnyStepDataPresent: boolean = false;

  dynamicSteps: {
    stageKey: string;
    componentType: string;
    chatResponse: NetworkAgentsChatResponseType;
  }[] = [];

  showPromptTuning = false;
  promptText: string = '';
  promptCurrentCriteria: SearchCriteria;
  promptViewData: PromptResultViewData[] = [];
  selectedPrompt: PromptResultViewData;

  @ViewChild('confirmSaveAs') confirmSaveAs: ElementRef;
  confirmSaveAsModalRef: BsModalRef;
  promptName: string = '';

  private timerSub: Subscription;
  waitMessage: string = '';

  readonly dots = [
    { color: '#7F77DD', delay: '0ms' },
    { color: '#1D9E75', delay: '160ms' },
    { color: '#378ADD', delay: '320ms' },
    { color: '#EF9F27', delay: '480ms' },
  ];

  conversationId: string = '';
  conversationIdByQueryParam: string = null;
  loadHistory: string;
  isInitialChatResponseHistoryLoad: boolean = false;
  loadChatHistory: boolean = false;
  hasMoreChats: boolean = false;
  isUserScrolling: boolean = false;
  userScrollTimer: ReturnType<typeof setTimeout> | null = null;
  loadedChatsHistoryCount: number = 0;
  private scrollResizeObserver: ResizeObserver | null = null;
  private scrollResizeTimer: ReturnType<typeof setTimeout> | null = null;
  isProgrammaticScroll: boolean = false;

  @ViewChild('executeCommand') executeCommand: ElementRef;
  confirmExecutionModalRef: BsModalRef;
  command: string = '';
  hasDefaultDeviceForCommand = false;
  commandDefaultDevice: any = null;

  constructor(private svc: ConditionInvestigationService,
    @Inject(DOCUMENT) private document,
    private renderer: Renderer2,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    public storage: StorageService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private appService: AppLevelService,
    private newTerminalService: ConditionInvestigationNewTerminalService,
    private floatingTerminalService: ConditionInvestigationFloatingTerminalService,
    private windowRegistry: ConditionInvestigationTerminalWindowRegistryService,
    private cliCommandService: ConditionInvestigationCliCommandService,
    private authApi: ConditionInvestigationAuthModalService,) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.conditionId = params.get('conditionId');
      this.conditionUuid = params.get('conditionUuid');
    });
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.conversationIdByQueryParam = params['conversation_id'] || null;
      this.loadHistory = params['load_history'] || 'false';
    });
    this.activityCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.promptCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.registryChannel.onmessage = (e) => {
      if (e.data.type === 'REGISTER') {
        if (this.lastOpenedWindow) {
          this.windowRegistry.register(e.data.tabId, this.lastOpenedWindow);
          this.lastOpenedWindow = null;
        }
        this.registryChannel.postMessage({ type: 'REGISTER_ACK', tabId: e.data.tabId });
      }
    };
  }

  ngOnInit(): void {
    this.minimizeLeftPanel();
    if (this.loadHistory == 'false') {
      this.startWaitMessages();
    } else {
      setTimeout(() => {
        this.spinner.start('conditionInitialHistoryLoadSpinner');
      }, 0)
    }
    this.getConditionDetails();
    // this.getActivities();
  }

  ngAfterViewInit() {
    this.chatResponseHistory.changes.pipe(takeUntil(this.ngUnsubscribe)).subscribe((change) => {
      if (!this.chatResponseHistory?.length) {
        return;
      }
      if (this.scrollMode === 'toBottom') {
        this.scrollToLastChatResponseHistory();
      } else if (this.scrollMode === 'preserve') {
        this.restoreScrollPositionAfterHistoryPrepend();
      }
    });
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    clearTimeout(this.userScrollTimer);
    this.cleanupScrollPositionTracking();
    this.maximizeLeftPanel();
    this.cleanupWaitMessages();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  startWaitMessages() {
    this.timerSub = timer(0, 1000).subscribe(sec => {
      if (sec < 15) {
        this.waitMessage = 'Preparing Investigation Plan';
      } else if (sec < 30) {
        this.waitMessage = 'Making Plan Ready';
      } else {
        this.waitMessage = 'Please hold it is taking longer than usual';
      }
    });
  }

  cleanupWaitMessages() {
    this.timerSub?.unsubscribe();
    this.waitMessage = '';
  }

  private scrollToLastChatResponseHistory() {
    setTimeout(() => {
      const parent = this.chatResponsHistoryScrollContainer.nativeElement;
      const last = this.chatResponseHistory.last?.nativeElement;
      if (!parent || !last) {
        this.scrollMode = 'none';
        return;
      }
      // added gap=100, When scrolling to the last chat history response,it will leave 100px space above it in the viewport(visible container of workspace chats), so some part of previous chat response history also show
      const gap = 100;
      // parent.scrollTop += (last.getBoundingClientRect().top - parent.getBoundingClientRect().top) - gap;
      parent.scrollTop = last.offsetTop - gap;
      this.scrollMode = 'none';

      if (this.loadHistory == 'true' && this.isInitialChatResponseHistoryLoad) {
        this.preserveScrollPositionOnResize(parent, 'anchorToLast');
      }
    }, 2);
  }

  private restoreScrollPositionAfterHistoryPrepend() {
    setTimeout(() => {
      const parent = this.chatResponsHistoryScrollContainer?.nativeElement;
      if (!parent || this.prevScrollTopBeforeHistoryPrepend == null || this.prevScrollHeightBeforeHistoryPrepend == null) {
        this.scrollMode = 'none';
        this.prevScrollTopBeforeHistoryPrepend = null;
        this.prevScrollHeightBeforeHistoryPrepend = null;
        return;
      }
      const newScrollHeight = parent.scrollHeight;
      const heightDelta = newScrollHeight - this.prevScrollHeightBeforeHistoryPrepend;
      parent.scrollTop = this.prevScrollTopBeforeHistoryPrepend + heightDelta;
      this.scrollMode = 'none';
      this.prevScrollTopBeforeHistoryPrepend = null;
      this.prevScrollHeightBeforeHistoryPrepend = null;

      this.preserveScrollPositionOnResize(parent, 'preserve');
    }, 0);
  }

  private preserveScrollPositionOnResize(parent: HTMLElement, mode: 'preserve' | 'anchorToLast') {
    this.cleanupScrollPositionTracking();

    const last = this.chatResponseHistory.last?.nativeElement;
    let parentLastScrollHeight = parent.scrollHeight;

    let lastItemOffsetTop = last?.offsetTop ?? 0;

    this.scrollResizeObserver = new ResizeObserver(() => {
      const delta = parent.scrollHeight - parentLastScrollHeight;
      parentLastScrollHeight = parent.scrollHeight;
      if (delta <= 0 || this.isUserScrolling) return;
      if (mode == 'anchorToLast') {
        // anchor to last item — track its offsetTop
        const currentOffsetTop = last?.offsetTop ?? 0;
        const itemDelta = currentOffsetTop - lastItemOffsetTop;
        lastItemOffsetTop = currentOffsetTop;
        if (itemDelta > 0) {
          this.isProgrammaticScroll = true;
          parent.scrollTop += itemDelta;
          requestAnimationFrame(() => {
            this.isProgrammaticScroll = false;
          });
        }
      } else {
        // anchor current viewport — growth above
        this.isProgrammaticScroll = true;
        parent.scrollTop += delta;
        requestAnimationFrame(() => {
          this.isProgrammaticScroll = false;
        });
      }
    });

    this.scrollResizeObserver.observe(this.chatResponseHistoryCardBody.nativeElement);

    this.scrollResizeTimer = setTimeout(() => {
      this.cleanupScrollPositionTracking()
    }, 10000);
  }

  private cleanupScrollPositionTracking() {
    this.scrollResizeObserver?.disconnect();
    this.scrollResizeObserver = null;
    clearTimeout(this.scrollResizeTimer);
    this.scrollResizeTimer = null;
  }

  minimizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (!isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'none');
      sidebar_minimizer.click();
    }
  }

  maximizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'unset');
      sidebar_minimizer.click();
    }
  }

  getConditionDetails() {
    this.svc.getConditionDetails(this.conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.conditionDetailsViewData = this.svc.convertToConditionDetailsViewdata(res);
      // this.spinner.stop('conditionDetailsSpinner');
    }, (err: HttpErrorResponse) => {
      // this.spinner.stop('conditionDetailsSpinner');
      this.notification.error(new Notification('Error whlie getting condition details'));
    });
  }

  goToTicketDetails(view: ConditionDetailsViewData) {
    switch (view.ticketingSystem) {
      case TICKET_MGMT_TYPE.CRM:
        if (view.accountId && view.ticketUuid) {
          this.router.navigate(['/support/ticketmgmt', view.accountId, 'dynamics-crm-tickets', view.ticketUuid, 'details']);
        } else {
          if (!view.accountId) {
            this.notification.error(new Notification('CRM account is not linked to UnityOne'));
          } else if (!view.ticketUuid) {
            this.notification.error(new Notification('Ticket not found in linked CRM account'));
          }
        }
        break;
      case TICKET_MGMT_TYPE.SERVICENOW:
        if (view.accountId && view.ticketUuid) {
          if (view.ticketId && (view.ticketType == SERVICE_NOW_TICKET_TYPE.INCIDENT || view.ticketType == SERVICE_NOW_TICKET_TYPE.PROBLEM)) {
            this.storage.put('selectedTicketSysId', view.ticketUuid, StorageType.SESSIONSTORAGE);
            this.router.navigate(['/support/ticketmgmt', view.accountId, 'nowtickets', view.ticketId, 'enhanced-details']);
          } else if (view.ticketType == SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST) {
            this.router.navigate(['/support/ticketmgmt', view.accountId, 'nowtickets', view.ticketUuid, 'details']);
          }
        } else {
          if (!view.accountId) {
            this.notification.error(new Notification('ServiceNow account is not linked to UnityOne'));
          } else if (!view.ticketUuid) {
            this.notification.error(new Notification('Ticket not found in linked ServiceNow account'));
          }
        }
        break;
      case TICKET_MGMT_TYPE.JIRA:
        if (view.accountId && view.projectId && view.ticketId) {
          this.router.navigate(['/support/ticketmgmt', view.accountId, 'jira', 'projects', view.projectId, view.ticketId, 'details']);
        } else {
          if (!view.accountId) {
            this.notification.error(new Notification('JIRA account is not linked to UnityOne'));
          } else if (!view.projectId) {
            this.notification.error(new Notification('Project not found in linked JIRA account'));
          } else if (!view.ticketId) {
            this.notification.error(new Notification('Ticket not found in linked JIRA account'));
          }
        }
        break;
      default: return;
    }
  }

  createTicket(conditionUuid: string) {
    this.spinner.start('main');
    this.svc.createTicket(conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.notification.success(new Notification('Ticket Created Successfully.'));
      this.spinner.stop('main');
      this.getConditionDetails();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to create a ticket. Please try again later.'));
    });
  }

  conditionAcknowledge() {
    this.acknowledgeForm = this.svc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
    this.handleAcknowledgementFormSubscriptions();
  }

  handleAcknowledgementFormSubscriptions() {
    this.acknowledgeForm.get('ack_comment').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value && value.length > 512) {
        this.acknowledgeForm.get('ack_comment').setValue(value.slice(0, 512), { emitEvent: false });
      }
    });
  }

  onConditionAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      });
    } else {
      let obj = Object.assign({}, this.acknowledgeForm.getRawValue());
      this.onCloseConditionAcknowledge();
      this.conditionDetailsViewData.isAcknowledged = true;
      this.svc.onConditionAcknowledge(this.conditionUuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.conditionDetailsViewData.isAcknowledged = res.is_acknowledged;
        this.conditionDetailsViewData.acknowledgedTime = res.acknowledged_time;
        this.conditionDetailsViewData.acknowledgedComment = res.acknowledged_comment;
        this.conditionDetailsViewData.acknowledgedBy = res.acknowledged_by;
        this.conditionDetailsViewData.acknowledgedTooltipMsg = `Ack by: ${res.acknowledged_by}<br>` + `Ack Msg: ${res.acknowledged_comment}<br>` + `Ack at: ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.conditionDetailsViewData.isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an events'));
      });
    }
  }

  onCloseConditionAcknowledge() {
    let element: HTMLElement = document.getElementById('event-severity') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
  }

  resolveCondtion() {
    if (this.conditionDetailsViewData.isStatusResolved || this.conditionDetailsViewData.resolveInProgress) {
      return;
    }
    this.conditionDetailsViewData.resolveInProgress = true;
    this.svc.resolveCondition(this.conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.conditionDetailsViewData.resolveInProgress = false;
      this.getConditionDetails();
      this.notification.success(new Notification(`Request to resolve Condition ID: ${this.conditionDetailsViewData.id} processed successfully`));
    }, (err: HttpErrorResponse) => {
      this.conditionDetailsViewData.resolveInProgress = false;
      this.notification.error(new Notification(`Request to resolve Condition ID: ${this.conditionDetailsViewData.id} failed. Please try again.`));
      this.spinner.stop('main');
    });
  }

  // getActivities() {
  //   this.activityVerticalWizardViewData = [];
  //   this.svc.getActivityDetails(this.conditionUuid, this.activityCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
  //     this.activitiesCount = res.count;
  //     this.activityVerticalWizardViewData = this.svc.convertToActivityWizardViewData(res.results);
  //   }, (err: HttpErrorResponse) => {
  //     this.notification.error(new Notification('Failed to get Activity details. Please try again later.'));
  //   })
  // }

  // activityPageChange(pageNo: number) {
  //   if (this.activityCurrentCriteria.pageNo !== pageNo) {
  //     // this.spinner.start('main');
  //     this.activityCurrentCriteria.pageNo = pageNo;
  //     this.getActivities();
  //   }
  // }

  // private resolveStep(res: NetworkAgentsChatResponseType) {
  //   const phase = res?.answer?.phase;
  //   const stageTitle = res?.answer?.stage_title;

  //   if (phase !== 'Verify and Audit') {
  //     return {
  //       stageKey: phase,
  //       componentType: 'Basic CLI Check'
  //     }
  //   }

  //   return {
  //     stageKey: stageTitle,
  //     componentType: stageTitle
  //   }
  // }

  onScroll() {
    if (this.isProgrammaticScroll) {
      return;
    }

    const el = this.chatResponsHistoryScrollContainer.nativeElement;

    this.isUserScrolling = true;
    clearTimeout(this.userScrollTimer);
    this.userScrollTimer = setTimeout(() => {
      this.isUserScrolling = false;
    }, 10);

    if (el.scrollTop <= 40 && !this.loadChatHistory && this.hasMoreChats) {
      this.prevScrollTopBeforeHistoryPrepend = el.scrollTop;
      this.prevScrollHeightBeforeHistoryPrepend = el.scrollHeight;
      setTimeout(() => {
        this.loadChatHistory = true;
      }, 0);
    }
  }

  handleChatResponse(res: any | null) {
    if (this.initialChatResponseData?.length == 0) {
      this.initialChatResponseData.push(res);
      this.cleanupWaitMessages();
    }
    // if (res == null || res?.answer?.phase == 'General') { return; }
    if (res == null) { return; }
    this.isTerminalReady = true;
    if (res?.meta?.filters_used?.conversation_id) {
      this.conversationId = res?.meta?.filters_used?.conversation_id;
      this.newTerminalService.setConversationId(res?.meta?.filters_used?.conversation_id);
    }
    this.isAnyStepDataPresent = res?.answer ? true : this.isAnyStepDataPresent;
    const workSpaceData = res?.answer?.split('sectionBreak')[1];
    if (!workSpaceData && !res?.meta?.device_data?.monitoring_type) {
      return;
    }
    const modifiedRes = { ...res, workSpaceData: workSpaceData };
    this.scrollMode = 'toBottom';
    this.isInitialChatResponseHistoryLoad = false;
    this.chatResponseHistoryData.push(modifiedRes);

    // const { stageKey, componentType } = this.resolveStep(res);
    // const existingStep = this.dynamicSteps.find(
    //   step => step.stageKey === stageKey
    // );
    // if (existingStep) {
    //   existingStep.chatResponse = res;
    // } else {
    //   this.dynamicSteps.push({
    //     stageKey,
    //     componentType,
    //     chatResponse: res
    //   });
    // }
    // this.dynamicSteps = [...this.dynamicSteps];
    // this.chatResponse = res;
    // if (res?.answer?.stage == "Stage 0") {
    //   this.conditionOverviewViewData = this.svc.convertToConditionOverviewData(res.answer);
    // }
  }

  handleChatHistoryResponse(res: any | null) {
    this.loadChatHistory = false;

    if (this.initialChatResponseData?.length == 0) {
      this.initialChatResponseData.push(res);
      this.spinner.stop('conditionInitialHistoryLoadSpinner');
    }

    if (res == null) { return; }

    this.isTerminalReady = true;
    if (this.conversationIdByQueryParam) {
      this.conversationId = this.conversationIdByQueryParam;
      this.newTerminalService.setConversationId(this.conversationId);
    }

    const reversed = [...res.results].reverse();
    const hadExistingWorkspaceHistory = this.chatResponseHistoryData.length > 0;
    const parent = this.chatResponsHistoryScrollContainer?.nativeElement;
    if (hadExistingWorkspaceHistory && parent && this.prevScrollTopBeforeHistoryPrepend == null && this.prevScrollHeightBeforeHistoryPrepend == null) {
      this.prevScrollTopBeforeHistoryPrepend = parent.scrollTop;
      this.prevScrollHeightBeforeHistoryPrepend = parent.scrollHeight;
    }
    let historyData = [];
    // convert the backend api data to UI structure as like in streaming api structure for storing inside this.chatResponseHistoryData.
    for (let result of reversed) {
      if (result.role == 'Assistant') {
        let obj: any = {};
        let workSpaceData: string;

        obj.answer = result.content;
        obj.meta = result.metadata;
        obj.meta.message_info = {
          id: result.id,
          chat_message_id: result.chat_message_id,
          created_at: result.created_at,
        }
        workSpaceData = result?.content?.split('sectionBreak')[1];
        if (!workSpaceData && !obj?.meta?.device_data?.monitoring_type) {
          continue;
        }
        const modifiedRes = { ...obj, workSpaceData: workSpaceData };
        historyData.push(modifiedRes);
      }
    }
    this.loadedChatsHistoryCount = this.loadedChatsHistoryCount + res.results.length;
    this.hasMoreChats = this.loadedChatsHistoryCount < res.count;

    if (!historyData.length) {
      this.scrollMode = 'none';
      this.prevScrollTopBeforeHistoryPrepend = null;
      this.prevScrollHeightBeforeHistoryPrepend = null;
      return;
    }

    if (hadExistingWorkspaceHistory) {
      this.isInitialChatResponseHistoryLoad = false;
      this.scrollMode = 'preserve';
    } else {
      this.isInitialChatResponseHistoryLoad = true;
      this.scrollMode = 'toBottom';
    }
    this.chatResponseHistoryData = [...historyData, ...this.chatResponseHistoryData];
  }

  trackByChatId(index: number, item: any) {
    return item.meta?.message_info?.chat_message_id;
  }

  togglePromptTuning() {
    this.showPromptTuning = !this.showPromptTuning;
    if (this.showPromptTuning) {
      this.getAllPrompts();
    }
  }

  getAllPrompts() {
    this.svc.getAllPrompts(this.promptCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.promptViewData = this.svc.convertToPromptViewData(res.results);
      this.initializePromptSelection();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Prompt details. Please try again later.'));
    })
  }

  initializePromptSelection() {
    if (!this.promptViewData || this.promptViewData.length === 0) return;
    const active = this.promptViewData.find(p => p.isActive);
    this.selectedPrompt = active || this.promptViewData[0];
    this.promptText = this.selectedPrompt.prompt;
  }

  onCancel() {
    this.showPromptTuning = false;
  }

  onSave() {
    const savePrompt = this.selectedPrompt;
    savePrompt.prompt = this.promptText;
    this.svc.promptSave(savePrompt).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.getAllPrompts();
      this.notification.success(new Notification('Version is Saved.'));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to Save Prompt. Please try again later.'));
    })

  }

  onPromptChange() {
    if (this.selectedPrompt) {
      this.promptText = this.selectedPrompt.prompt;
    }
  }

  onToggleActive(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.selectedPrompt) return;
    if (checked && !this.selectedPrompt.isActive) {
      this.svc.activateVersion(this.selectedPrompt).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        this.getAllPrompts();
        this.notification.success(new Notification('Version Activated Successfully.'));
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to Activate Version. Please try again later.'));
      })
    }
  }

  onSaveAs() {
    this.confirmSaveAsModalRef = this.modalService.show(this.confirmSaveAs, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmSaveAsModal() {
    if (!this.promptName || !this.promptName.trim()) {
      this.notification.error(new Notification('Please enter a valid prompt name.'));
      return;
    }
    const saveAsPrompt = {
      ...this.selectedPrompt,
      prompt: this.promptText,
      promptName: this.promptName
    }
    this.svc.promptSaveAs(saveAsPrompt).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.confirmSaveAsModalRef.hide();
      this.getAllPrompts();
      this.notification.success(new Notification('New Prompt Version is created.'));
    }, (err: HttpErrorResponse) => {
      this.confirmSaveAsModalRef.hide();
      this.notification.error(new Notification('Failed to Save As Version. Please try again later.'));
    })
  }

  requestWebAccess(view: any) {
    this.ticketService.createTicket({
      subject: DEVICE_WEB_ACCESS_SUBJECT(DeviceMapping.SWITCHES, view.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.SWITCHES, view.name, view.deviceStatus, view.model, view.type, view.managementIp),
      type: TICKET_TYPE.PROBLEM,
      webaccess: true
    }, DeviceMapping.SWITCHES);
  }

  webAccessNewTab(view: any) {
    // this.appService.updateActivityLog('switches', 'sdrgg');
    window.open('/main#/unityterminal/');
  }

  consoleNewTab(view: any) {
    if (!this.isTerminalReady) return;
    this.newTerminalService.setBackendTabId(null);
    this.newTerminalService.setPendingTabType('newTab');
    this.newTerminalService.setConversationId(this.conversationId);
    this.newTerminalService.openTerminal(this.buildTerminalContext('newTab'));
  }

  consoleSameTab(view: any) {
    if (!this.isTerminalReady) return;
    this.newTerminalService.setBackendTabId(null);
    this.newTerminalService.setPendingTabType('sameTab');
    this.newTerminalService.setConversationId(this.conversationId);
    this.newTerminalService.openTerminal(this.buildTerminalContext('sameTab'));
  }

  onMarkdownClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const codeEl = target.closest('code');
    if (codeEl) {
      this.command = codeEl.textContent?.trim();
      if (this.command) {
        this.openCommandExecutionModal(this.command);
      }
    }

  }

  // confirmExecuteModal(tabType: 'sameTab' | 'newTab') {
  //   this.confirmExecutionModalRef.hide();

  //   const tabParam = tabType === 'sameTab' ? 'same' : 'new';

  //   this.svc.getTab(tabParam, this.conversationId).subscribe((res: any) => {

  //     const backendTabId = res?.tab_id;
  //     this.newTerminalService.setBackendTabId(backendTabId || null);
  //     localStorage.setItem('terminal_command', this.command);
  //     // CASE 1: backend returned an existing free tab
  //     if (backendTabId) {

  //       if (tabType === 'sameTab') {
  //         const exists = this.floatingTerminalService.hasTerminal(backendTabId);
  //         if (exists) {
  //           this.newTerminalService.openTerminal();
  //           // this.floatingTerminalService.executeInTerminal(backendTabId, this.command, tabType);
  //           // this.floatingTerminalService.switchToTab(backendTabId);
  //           return;
  //         }
  //         this.newTerminalService.setPendingTabType(tabType);
  //         this.newTerminalService.setConversationId(this.conversationId);
  //         this.newTerminalService.openTerminal();
  //         return;

  //       } else {
  //         //  Backend guarantees this tab is alive and free
  //         // Just focus it and execute the command — no PING needed

  //         const focused = this.windowRegistry.focus(backendTabId);

  //         // Post PING so the existing tab executes the command
  //         this.registryChannel.postMessage({ type: 'PING', tabId: backendTabId });
  //         return;
  //       }
  //     }

  //     // CASE 2: backend returned {} — no free tab, open a fresh one
  //     this.newTerminalService.setPendingTabType(tabType);
  //     this.newTerminalService.setConversationId(this.conversationId);

  //     if (tabType === 'sameTab') {
  //       this.newTerminalService.openTerminal();

  //     } else {
  //       const newWin = window.open(
  //         `/main#/terminal-new-tab?conversationId=${this.conversationId}`,
  //         '_blank'
  //       );
  //       if (newWin) {
  //         this.lastOpenedWindow = newWin;
  //       }
  //     }
  //   });
  // }

  confirmExecuteModal(tabType: 'sameTab' | 'newTab', forceDeviceChange: boolean = false) {
    this.confirmExecutionModalRef.hide();
    this.executeCliCommand(this.command, forceDeviceChange, tabType);
  }

  executeCliCommand(command: string, forceDeviceChange: boolean = false, tabType: 'sameTab' | 'newTab' = 'sameTab') {
    const cleanCommand = `${command || ''}`.trim();
    if (!cleanCommand) {
      return;
    }
    const application = this.getApplicationByRouteData();
    this.cliCommandService.executeCommandFlow({
      command: cleanCommand,
      conditionId: this.conditionId,
      conversationId: this.conversationId,
      tabType,
      application,
      title: this.conditionDetailsViewData?.description,
      commandDetails: { source: 'workspace_markdown' },
      device: forceDeviceChange ? this.commandDefaultDevice : undefined,
    }, forceDeviceChange).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => { }, () => {
      this.notification.error(new Notification('Unable to start command execution.'));
    });
  }

  private buildTerminalContext(tabType: 'sameTab' | 'newTab') {
    return {
      command: '',
      conditionId: this.conditionId,
      conversationId: this.conversationId,
      tabType,
      application: this.getApplicationByRouteData(),
      title: this.conditionDetailsViewData?.description,
    };
  }

  private getApplicationByRouteData(): string {
    switch (this.route.snapshot.data.aiAgentType) {
      case 'computeAgent': return 'Compute Agent';
      case 'databaseAgent': return DATABASE_AGENT_APPLICATION;
      case 'storageAgent': return 'Storage Agent';
      case 'networkAgent':
      default: return 'Network Agent';
    }
  }

  openCommandExecutionModal(command: string) {
    this.command = command;
    this.hasDefaultDeviceForCommand = false;
    this.commandDefaultDevice = null;
    this.authApi.getDefaultDevice(this.conditionId, this.conversationId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((device: any) => {
        this.commandDefaultDevice = device?.id ? device : null;
        this.hasDefaultDeviceForCommand = !!this.commandDefaultDevice;
      }, () => {
        this.commandDefaultDevice = null;
        this.hasDefaultDeviceForCommand = false;
      });
    this.confirmExecutionModalRef = this.modalService.show(this.executeCommand, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

}


const AnalysisLogos = {
  'UnityOne': {
    'imageURL': `${environment.assetsUrl}brand/unity-logo-old.png`,
  },
}
