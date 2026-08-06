import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NetworkAgentsChatResponseType } from './condition-investigation-chatbot.type';
import { ChatHistoryData, TokenUsage } from 'src/app/unity-chatbot/unity-chatbot.type';
import { FormGroup } from '@angular/forms';
import { ConditionInvestigationChatbotService } from './condition-investigation-chatbot.service';
import { UserInfoService } from '../../user-info.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportedLLMConfigData } from '../../SharedEntityTypes/ai-chatbot/llm-model.type';
import { getTokenMultiplier, getTokenMultiplierTooltip, hasTokenMultiplier } from '../../SharedEntityTypes/ai-chatbot/llm-model.util';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { UnityAssistantChatHistory } from 'src/app/unity-chatbot/uc-history/uc-history.type';
import { PAGE_SIZES, SearchCriteria } from '../../table-functionality/search-criteria';
import { PaginatedResult } from '../../SharedEntityTypes/paginated.type';
import { TokenUsageViewData, UnityChatbotService } from 'src/app/unity-chatbot/unity-chatbot.service';
import { UnityChartDetails } from '../../unity-chart-config.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CliCommandContext, ConditionInvestigationCliCommandService } from '../condition-investigation-cli-command.service';
import { CliTerminalLifecycleEvent, ConditionInvestigationFloatingTerminalService } from '../condition-investigation-floating-terminal/condition-investigation-floating-terminal.service';
import { ConditionInvestigationAuthModalService } from '../condition-investigation-auth-modal/condition-investigation-auth-modal.service';

type ChatInputMode = 'auto' | 'pro';

interface ChatInputModePayload {
  chat_mode: ChatInputMode;
  session_model_uuid: string;
}

@Component({
  selector: 'condition-investigation-chatbot',
  templateUrl: './condition-investigation-chatbot.component.html',
  styleUrls: ['./condition-investigation-chatbot.component.scss'],
  providers: [ConditionInvestigationChatbotService]
})
export class ConditionInvestigationChatbotComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {

  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Chatbot_Logo.svg`;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @Input() conditionId: string;
  @Output() chatResponse = new EventEmitter<NetworkAgentsChatResponseType>();
  @Output() chatHistory = new EventEmitter<PaginatedResult<UnityAssistantChatHistory>>();

  aiAgentType: string;
  application: string;

  chatHistoryData: Array<ChatHistoryData> = [];
  form: FormGroup;
  isTyping: boolean = false;
  waitMessage: string = 'Thinking'
  private timerSub: Subscription;
  shouldScroll: boolean = false;
  conversationId: string = null;
  title: string;

  command: string = '';
  commandDetails: any = null;
  activeCommandContext: CliCommandContext | null = null;
  readonly proModeBannerMessage = "You're currently in Pro mode, which may result in higher token usage. For lower token usage, switch to Auto mode.";
  commandExecutionStatusMessage: string = '';
  commandExecutionError: string = '';
  commandExecutionState: 'idle' | 'pending' | 'executing' | 'analyzing' | 'failed' = 'idle';
  proModeBannerDismissed = false;
  hasDefaultDeviceForCommand = false;
  commandDefaultDevice: any = null;

  @ViewChild('executeCommand') executeCommand: ElementRef;
  confirmExecutionModalRef: BsModalRef;
  enableProModeModalVisible: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.active-ai-modal-model-selector')) {
      this.showModelDropdown = false;
    }
  }

  loadHistory: any;
  constructor(private service: ConditionInvestigationChatbotService,
    private userInfoService: UserInfoService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private newTerminalService: ConditionInvestigationNewTerminalService,
    private ucService: UnityChatbotService,
    private cliCommandService: ConditionInvestigationCliCommandService,
    private floatingTerminalService: ConditionInvestigationFloatingTerminalService,
    private authApi: ConditionInvestigationAuthModalService) {
    this.route.queryParams.subscribe(params => {
      this.loadHistory = params['load_history'] || 'false';
      this.conversationId = this.loadHistory == 'true' ? params['conversation_id'] : null;
      this.title = params['title'] || '';
    });
    this.aiAgentType = this.route.snapshot.data.aiAgentType;
    this.application = this.service.getApplicationByRouteData(this.aiAgentType);
    this.chatCurrentCriteria = {
      searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TEN,
      params: [{
        'org_id': userInfoService.userOrgId,
        'user_id': userInfoService.userDetails.id,
        'application': `${this.application}`,
        'conversation_id': this.conversationId
      }]
    }
  }

  ngOnInit(): void {
    this.getTokenUsage();
    this.resetChatInputModePayload();
    if (this.loadHistory == 'true') {
      this.clearCommandExecutionState();
    }
    this.subscribeToCliCommandFlow();
    this.getAIModels(() => this.startInitialConversation());
    // this.getResponse(firstQuery);
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.confirmExecutionModalRef?.hide();
    this.resetChatInputModePayload();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loadChatHistory'] && changes['loadChatHistory'].currentValue === true && this.loadHistory != 'true') {
      if (!this.isLoadingChats && this.hasMoreChats) {
        this.chatCurrentCriteria.pageNo++;
        this.getChats();
      }
    }
  }

  chatCurrentCriteria: SearchCriteria;
  isLoadingChats = false;
  hasMoreChats = true;
  isFirstLoad = true;
  @Input() loadChatHistory: boolean;
  onScroll() {
    if (this.loadHistory != 'true') {
      return
    }
    const el = this.messagesContainer.nativeElement;
    if (el.scrollTop <= 40 && !this.isLoadingChats && this.hasMoreChats) {
      this.chatCurrentCriteria.pageNo++;
      this.getChats();
    }
  }

  infiniteChats: UnityAssistantChatHistory[] = [];
  getChats() {
    this.isLoadingChats = true;
    this.service.getChats(this.chatCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const el = this.messagesContainer.nativeElement;
      const prevScrollHeight = el.scrollHeight;
      // reverse since API returns newest first
      const reversed = [...res.results].reverse();
      if (this.isFirstLoad) {
        this.infiniteChats = reversed;
        this.chatHistoryData = this.mapToChatHistory(this.infiniteChats);
        this.isFirstLoad = false;
        this.hasMoreChats = this.infiniteChats.length < res.count;
        this.isLoadingChats = false;
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        });
      } else {
        this.infiniteChats = [...reversed, ...this.infiniteChats];
        this.chatHistoryData = this.mapToChatHistory(this.infiniteChats);
        this.hasMoreChats = this.infiniteChats.length < res.count;
        this.isLoadingChats = false;
        setTimeout(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop += newScrollHeight - prevScrollHeight;
        });
      }
      this.chatHistory.emit(res);
    }, err => {
      this.isLoadingChats = false;
      this.chatHistory.emit(null);
    });
  }

  mapToChatHistory(chats: any[]) {
    return chats.map(chat => {
      let message = chat.content;
      // split on sectionBreak and take only the part before it
      if (message.includes('sectionBreak')) {
        message = message.split('sectionBreak')[0].trimEnd();
      }
      return {
        user: (chat.role === 'User' ? 'user' : 'bot') as 'user' | 'bot',
        message: message,
        type: 'text',
        actions: chat.metadata?.recommended_actions?.map((a: any) => this.toRecommendedAction(a)) || [],
        showAction: chat.metadata?.recommended_actions?.length > 0,
        lastCommand: chat.metadata?.last_command,
        lastCommandType: chat.metadata?.last_command_type,
        showLastCommandPrompt: chat.role !== 'User' && !!chat.metadata?.last_command && chat.metadata?.command_execute === true,
        botResponseId: chat.chat_message_id
      };
    });
  }

  // getResponse(chat: string) {
  //   setTimeout(() => { this.scrollToBottom(); });
  //   this.isTyping = true;
  //   let postData = {
  //     query: chat,
  //     org_id: this.userInfoService.userOrgId,
  //     user_id: `${this.userInfoService.userDetails.id}`,
  //     application: 'Network Agent',
  //     count: 0,
  //     conversation_id: this.conversationId,
  //     role: 'User',
  //     streaming: false,
  //     title: this.title
  //   }
  //   this.startWaitMessages();
  //   if (chat.includes('Exit')) {
  //     this.goBack();
  //     return;
  //   }
  //   this.service.getResponse(postData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
  //     this.isTyping = false;
  //     this.manageResponse(res);
  //     this.conversationId = res.conversation_id;
  //     if (res.answer.recommended_actions && this.chatHistoryData.length > 1) {
  //       setTimeout(() => {
  //         this.scrollToBottom();
  //         this.shouldScroll = false;
  //       }
  //       );
  //     } else {
  //       this.shouldScroll = false;
  //     }
  //     this.cleanup();
  //     this.chatResponse.emit(res);
  //   }, (err: HttpErrorResponse) => {
  //     this.chatResponse.emit(null);
  //     this.isTyping = false;
  //     this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
  //     this.shouldScroll = false;
  //     this.cleanup();
  //   });
  // }

  hasReachedTop: boolean = false;
  showModelDropdown = false;
  activeModel: SupportedLLMConfigData;
  selectedChatInputModel: SupportedLLMConfigData;
  llmModels: SupportedLLMConfigData[] = [];
  readonly chatInputModeStorageKey = 'chat_input_mode_payload';
  chatInputModePayload: ChatInputModePayload = {
    chat_mode: 'auto',
    session_model_uuid: ''
  };
  typingQueue: string[] = [];
  showStopButton: boolean = false;
  typingInterval: any = null;
  isStreaming = false;
  doneData: any = null;
  sectionBreakReached = false;

  getResponse(chat: string, isDefault?: boolean, extraPayload: any = {}, onComplete?: () => void) {
    if (chat.includes('Exit')) {
      this.goBack();
      return;
    }
    if (this.isTyping) {
      return
    }
    this.isTyping = true;
    this.isStreaming = true;
    this.showStopButton = true;
    this.sectionBreakReached = false;
    this.typingQueue = [];
    let postData = {
      query: chat,
      org_id: this.userInfoService.userOrgId,
      user_id: `${this.userInfoService.userDetails.id}`,
      condition_id: Number(this.conditionId),
      application: `${this.application}`,
      count: 0,
      conversation_id: this.conversationId,
      role: 'User',
      streaming: false,
      title: this.title,
      chat_mode: this.chatInputModePayload.chat_mode,
      session_model_uuid: this.chatInputModePayload.chat_mode === 'auto' ? '' : this.chatInputModePayload.session_model_uuid
    }
    postData = { ...postData, ...extraPayload };
    this.chatHistoryData.push({ user: 'bot', message: '', type: 'text' });
    this.chatHistoryData.getLast()['showAction'] = false;
    const lastIndex = this.chatHistoryData.length - 1;
    this.startWaitMessages();
    this.doneData = null;
    this.service.getStreamingResponse(postData).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: ({ event, data }) => {
        if (event === 'start') {
          this.conversationId = data.conversation_id;
        } else if (event === 'chunk') {
          if (!this.typingQueue.includes('sectionBreak')) {
            this.typingQueue.push(data.delta);
            if (!this.typingInterval) {
              this.startTypingEffect();
            }
          }
        } else if (event === 'complete') {
          if (typeof data == 'string') {
            this.doneData = JSON.parse(data);
          } else {
            this.doneData = data;
          }
          this.tokenUsageData = this.ucService.convertToTokenUsageViewData(this.doneData.meta.token_usage.org);
          this.chatResponse.emit(this.doneData);
          if (this.sectionBreakReached) {
            this.attachLastCommandPrompt(this.doneData);
            if (this.doneData?.meta?.recommended_actions?.length) {
              this.chatHistoryData.getLast()['actions'] = this.doneData.meta.recommended_actions.map(ra => this.toRecommendedAction(ra));
              setTimeout(() => {
                this.scrollToBottom();
              });
            }
          }
        }
      },
      error: (err) => {
        this.typingQueue = [];
        this.chatResponse.emit(null);
        this.isTyping = false;
        this.isStreaming = false;
        this.showStopButton = false;
        this.chatHistoryData[lastIndex].message = 'Sorry, I am having trouble right now.';
        this.shouldScroll = false;
        clearInterval(this.typingInterval);
        this.typingInterval = null;
        this.typingQueue = [];
        this.cleanup();
        onComplete && onComplete();
      },
      complete: () => {
        this.sectionBreakReached && (this.typingQueue = []);
        // this.sectionBreakReached = false;
        this.isTyping = false;
        this.isStreaming = false;
        this.attachLastCommandPrompt(this.doneData);
        if (this.doneData?.meta?.recommended_actions?.length) {
          this.chatHistoryData.getLast()['actions'] = this.doneData.meta.recommended_actions.map(ra => this.toRecommendedAction(ra));
        }
        onComplete && onComplete();
      }
    });
  }

  startTypingEffect() {
    this.isTyping = false;
    this.cleanup();
    this.typingInterval = setInterval(() => {
      if (this.typingQueue.length > 0) {
        const char = this.typingQueue.shift();
        if (char === 'sectionBreak') {
          const last = this.chatHistoryData[this.chatHistoryData.length - 1];
          last.showAction = true;
          last.message = (last.message as string).trimEnd();
          this.sectionBreakReached = true;
          this.showStopButton = false;
          this.shouldScroll = false;
          return;
        }
        if (!this.sectionBreakReached) {
          this.chatHistoryData[this.chatHistoryData.length - 1].message += char;
          if (!this.hasReachedTop) {
            this.shouldScroll = true;
          }
        }
      } else {
        if (this.sectionBreakReached || !this.isStreaming) {
          if (this.doneData) {
            this.attachLastCommandPrompt(this.doneData);
            const last = this.chatHistoryData[this.chatHistoryData.length - 1];
            if (this.doneData?.meta?.recommended_actions?.length) {
              last['actions'] = this.doneData.meta.recommended_actions.map(ra => this.toRecommendedAction(ra));
              setTimeout(() => {
                this.scrollToBottom();
              });
            }
            this.doneData = null;
          }
          this.showStopButton = false;
          clearInterval(this.typingInterval);
          this.typingInterval = null;
          this.shouldScroll = false;
        }
      }
    }, 100);
  }

  private attachLastCommandPrompt(doneData: any) {
    const lastCommand = doneData?.meta?.last_command;
    const shouldShow = doneData?.meta?.command_execute === true;

    if (!lastCommand || !shouldShow) {
      return;
    }

    const last = this.chatHistoryData.getLast();
    last['lastCommand'] = lastCommand;
    last['lastCommandType'] = doneData?.meta?.last_command_type;
    last['showLastCommandPrompt'] = true;
  }

  // manageResponse(res: any) {
  //   if (res.answer.answer) {
  //     this.chatHistoryData.push({ user: 'bot', message: (res.answer.answer as string), type: 'text' });
  //     this.chatHistoryData.getLast()['actions'] = res.answer.recommended_actions.map(ra => {
  //       return {
  //         name: ra,
  //         isDisabled: false
  //       }
  //     });
  //   } else {
  //     this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
  //   }
  // }

  buildForm() {
    this.form = this.service.buildForm();
  }

  onSubmit() {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    if (!this.canSubmitQuery()) {
      return;
    }
    if (this.form.get('chat').value.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: this.form.get('chat').value, type: 'text' });
      this.getResponse(this.form.get('chat').value);
      this.form.get('chat').setValue('');
    }
  }

  submitQuery(query: string) {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    if (!this.canSubmitQuery()) {
      return;
    }
    if (query.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: query, type: 'text' });
      this.getResponse(query);
    }
  }

  startWaitMessages() {
    this.timerSub = timer(0, 1000).subscribe(sec => {
      if (sec < 2) {
        this.waitMessage = 'Thinking';
      } else if (sec < 6) {
        this.waitMessage = 'Processing';
      } else {
        this.waitMessage = 'Still working, almost there';
      }
    });
  }

  cleanup() {
    this.timerSub?.unsubscribe();
    this.waitMessage = '';
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  goBack() {
    this.router.navigate(['../../../../', 'dashboard', 'conditions'], { relativeTo: this.route })
  }

  getAIModels(onComplete?: () => void) {
    this.service.getSupportedLLMModelList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.llmModels = res;
      this.llmModels.forEach(m => {
        if (m.active_for_applications?.includes(this.service.serverSideApplicationMapping(this.application))) {
          this.activeModel = m;
        }
      });
      if (this.chatInputModePayload.chat_mode === 'pro' && !this.selectedChatInputModel) {
        this.selectMostCostEffectiveConfiguredModel();
      }
      onComplete && onComplete();
    }, err => {
      this.llmModels = [];
      this.activeModel = null;
      this.selectedChatInputModel = null;
      onComplete && onComplete();
    })
  }

  toggleDropdown() {
    if (this.chatInputModePayload.chat_mode === 'auto') {
      this.showModelDropdown = false;
      return;
    }
    this.showModelDropdown = !this.showModelDropdown;
  }

  changeActiveModel(model: SupportedLLMConfigData) {
    if (this.chatInputModePayload.chat_mode === 'auto') {
      this.showModelDropdown = false;
      this.persistChatInputModePayload('auto', '');
      return;
    }
    if (this.activeModel?.id === model.id) {
      this.showModelDropdown = false;
      this.selectedChatInputModel = model;
      this.persistChatInputModePayload('pro', this.getModelUuid(model));
      return;
    }

    if (model.is_user_owned) {
      const serversideAppName: string = this.service.serverSideApplicationMapping(this.application);
      if (this.activeModel) {
        this.activeModel.active_for_applications = this.activeModel.active_for_applications.filter(app => app != serversideAppName);
      }
      model.active_for_applications.push(serversideAppName);
      this.changeActiveModelToSelected(model);
    } else {
      // this.goToConfig(model);
    }

  }

  // changeActiveModelToSelected(model: SupportedLLMConfigData) {
  //   this.showModelDropdown = false;
  //   this.service.changeActiveModel(this.application, model).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.activeModel = model;
  //   }, err => { })
  //   this.selectedChatInputModel = model;
  //   this.persistChatInputModePayload('pro', this.getModelUuid(model));
  //   this.activeModel = model;
  // }

  changeActiveModelToSelected(model: SupportedLLMConfigData) {
    this.showModelDropdown = false;
    this.selectedChatInputModel = model;
    this.persistChatInputModePayload('pro', this.getModelUuid(model));
    this.activeModel = model;
  }

  goToConfig(model?: SupportedLLMConfigData) {
    // this.togglePopUp();
    this.router.navigate(['/settings/profile/add-model']);
  }

  getModelItemClass(model: SupportedLLMConfigData) {
    return {
      'active-model-item': model.active_for_applications?.includes('assistant'),
      'bg-light text-muted': !model.is_user_owned
    }
  }

  hasModelTokenMultiplier(model: SupportedLLMConfigData): boolean {
    return hasTokenMultiplier(model);
  }

  getModelTokenMultiplier(model: SupportedLLMConfigData): string | null {
    return getTokenMultiplier(model);
  }

  getModelTokenMultiplierTooltip(model: SupportedLLMConfigData): string {
    return getTokenMultiplierTooltip(model);
  }

  setChatInputMode(mode: ChatInputMode) {
    if (mode === 'auto') {
      this.showModelDropdown = false;
      this.selectedChatInputModel = null;
      this.persistChatInputModePayload('auto', '');
      return;
    }
    this.showModelDropdown = false;
    if (this.shouldShowEnableProModeModal()) {
      this.selectedChatInputModel = null;
      this.persistChatInputModePayload('auto', '');
      this.showEnableProModeModal();
      return;
    }
    this.selectMostCostEffectiveConfiguredModel();
    this.showProModeBanner();
  }

  showEnableProModeModal() {
    this.enableProModeModalVisible = true;
  }

  closeEnableProModeModal() {
    this.enableProModeModalVisible = false;
    this.showModelDropdown = false;
    this.selectedChatInputModel = null;
    this.persistChatInputModePayload('auto', '');
  }

  configureModelFromProModal() {
    this.enableProModeModalVisible = false;
    this.goToConfig();
  }

  private resetChatInputModePayload() {
    this.showModelDropdown = false;
    this.selectedChatInputModel = null;
    this.persistChatInputModePayload('auto', '');
  }

  private startInitialConversation() {
    if (this.loadHistory == 'true') {
      this.getChats();
      return;
    }

    this.applyAiAgentDefaultMode(() => {
      const firstQuery = `Create an investigation plan to resolve the condition ${this.conditionId}`;
      this.getResponse(firstQuery);
    });
  }

  private applyAiAgentDefaultMode(onComplete: () => void) {
    if (!this.application) {
      onComplete();
      return;
    }

    this.service.getAiAgentProModeDefault().pipe(takeUntil(this.ngUnsubscribe)).subscribe(enabled => {
      if (enabled && this.getConfiguredModels().length) {
        this.selectMostCostEffectiveConfiguredModel();
        this.showProModeBanner();
      }
      onComplete();
    }, err => {
      onComplete();
    });
  }

  private persistChatInputModePayload(chatMode: ChatInputMode, sessionModelUuid: string) {
    this.chatInputModePayload = {
      chat_mode: chatMode,
      session_model_uuid: chatMode === 'auto' ? '' : sessionModelUuid
    };
    localStorage.setItem(this.chatInputModeStorageKey, JSON.stringify(this.chatInputModePayload));
  }

  private getModelUuid(model: SupportedLLMConfigData): string {
    return `${model?.uuid || model?.id || ''}`;
  }

  private selectMostCostEffectiveConfiguredModel() {
    const selectedModel = this.getMostCostEffectiveConfiguredModel();
    this.selectedChatInputModel = selectedModel;
    this.activeModel = selectedModel || this.activeModel;
    this.persistChatInputModePayload('pro', this.getModelUuid(selectedModel));
  }

  private showProModeBanner() {
    this.proModeBannerDismissed = false;
    this.commandExecutionStatusMessage = this.proModeBannerMessage;
  }

  private canSubmitQuery(): boolean {
    return this.chatInputModePayload.chat_mode !== 'pro' || !!this.selectedChatInputModel;
  }

  private getConfiguredModels(): SupportedLLMConfigData[] {
    return this.llmModels.filter(model => model?.is_user_owned);
  }

  private shouldShowEnableProModeModal(): boolean {
    return this.getConfiguredModels().length === 0;
  }

  private getMostCostEffectiveConfiguredModel(): SupportedLLMConfigData {
    const configuredModels = this.getConfiguredModels();
    if (!configuredModels.length) {
      return null;
    }
    if (configuredModels.length === 1) {
      return configuredModels[0];
    }
    return configuredModels.reduce((bestModel, currentModel) => {
      return this.getMultiplierValue(currentModel) < this.getMultiplierValue(bestModel) ? currentModel : bestModel;
    });
  }

  private getMultiplierValue(model: SupportedLLMConfigData): number {
    const multiplier = getTokenMultiplier(model);
    if (!multiplier) {
      return Number.POSITIVE_INFINITY;
    }
    const value = Number.parseFloat(`${multiplier}`.replace(/x$/i, ''));
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  }

  stopResponse() {
    // this.chatResponse.emit(this.doneData ? this.doneData : null)
    // this.sectionBreakReached = false;
    clearInterval(this.typingInterval);
    this.typingInterval = null;
    this.showStopButton = false;
    this.isTyping = false;
    this.isStreaming = false;
    this.typingQueue = [];
    this.doneData = null;
    this.cleanup();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe = new Subject();
    this.shouldScroll = false;
  }

  onMarkdownClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const codeEl = target.closest('code');
    if (codeEl) {
      this.command = codeEl.textContent?.trim();
      const classes = Array.from(codeEl.classList);
      const commandType = classes.find(name => name.startsWith('commandType-'))
        ?.replace('commandType-', '');
      const shellType = classes.find(name => name.startsWith('shellType-'))
        ?.replace('shellType-', '');
      const dbEngine = classes.find(name => name.startsWith('dbEngine-'))
        ?.replace('dbEngine-', '');
      if (this.command) {
        this.openCommandExecutionModal(this.command, {
          source: 'markdown_code',
          commandType: commandType || null,
          shellType: shellType || null,
          dbEngine: dbEngine || null
        });
      }
    }
  }

  confirmExecuteModal(tabType: 'sameTab' | 'newTab', forceDeviceChange: boolean = false) {
    this.confirmExecutionModalRef.hide();
    this.runCliCommand(this.command, forceDeviceChange, this.commandDetails || { source: 'confirm_modal' }, tabType);
  }

  handleRecommendedAction(action: any) {
    if (this.isCommandExecutionBusy || action?.isDisabled) {
      return;
    }
    const actionCommand = this.getActionCommand(action);
    if (actionCommand) {
      this.openCommandExecutionModal(actionCommand, action);
      return;
    }
    const actionName = this.getActionName(action);
    if (!actionName) {
      return;
    }
    this.submitQuery(actionName);
  }

  get isCommandExecutionBusy(): boolean {
    return ['pending', 'executing', 'analyzing'].includes(this.commandExecutionState);
  }

  get isProModeBannerMessage(): boolean {
    return this.commandExecutionStatusMessage === this.proModeBannerMessage;
  }

  get shouldShowProModeBanner(): boolean {
    return this.chatInputModePayload.chat_mode === 'pro' &&
      this.isProModeBannerMessage &&
      !this.proModeBannerDismissed;
  }

  dismissCommandExecutionNotification() {
    if (this.isProModeBannerMessage) {
      this.proModeBannerDismissed = true;
    }
    this.commandExecutionStatusMessage = '';
    this.commandExecutionError = '';
  }

  openCommandExecutionModal(command: string, commandDetails?: any) {
    const cleanCommand = `${command || ''}`.trim();
    if (!cleanCommand) {
      return;
    }
    this.command = cleanCommand;
    this.commandDetails = commandDetails;
    this.getDefaultDevice();
    this.confirmExecutionModalRef = this.modalService.show(this.executeCommand, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  getDefaultDevice() {
    this.commandDefaultDevice = null;
    this.hasDefaultDeviceForCommand = false;
    this.authApi.getDefaultDevice(this.conditionId, this.conversationId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((device: any) => {
        this.commandDefaultDevice = device?.id ? device : null;
        this.hasDefaultDeviceForCommand = !!this.commandDefaultDevice;
      }, () => {
        this.commandDefaultDevice = null;
        this.hasDefaultDeviceForCommand = false;
      });
  }

  runCliCommand(command: string, forceDeviceChange: boolean = false, commandDetails?: any, tabType: 'sameTab' | 'newTab' = 'sameTab') {
    if (this.isCommandExecutionBusy) {
      return;
    }
    const cleanCommand = `${command || ''}`.trim();
    if (!cleanCommand) {
      return;
    }

    this.commandExecutionState = 'pending';
    this.commandExecutionStatusMessage = forceDeviceChange ? 'Waiting for device credentials...' : 'Preparing terminal...';
    this.commandExecutionError = '';

    this.cliCommandService.executeCommandFlow({
      command: cleanCommand,
      conditionId: this.conditionId,
      conversationId: this.conversationId,
      tabType,
      application: this.application,
      title: this.title,
      commandDetails,
      device: forceDeviceChange ? this.commandDefaultDevice : undefined,
    }, forceDeviceChange).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => { }, (err) => {
      this.commandExecutionState = 'failed';
      this.commandExecutionStatusMessage = '';
      this.commandExecutionError = 'Unable to start command execution.';
    });
  }

  private subscribeToCliCommandFlow() {
    this.cliCommandService.activeCommandContext$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((context: CliCommandContext | null) => {
        if (!context) {
          if (this.commandExecutionState === 'pending') {
            this.clearCommandExecutionState();
          }
          return;
        }
        if (context.conversationId && this.conversationId && context.conversationId !== this.conversationId) {
          return;
        }
        this.activeCommandContext = context;
        if (this.commandExecutionState === 'idle' || this.commandExecutionState === 'failed') {
          this.commandExecutionState = 'pending';
          this.commandExecutionStatusMessage = context.forceDeviceChange ? 'Waiting for device credentials...' : 'Preparing terminal...';
          this.commandExecutionError = '';
        }
      });

    this.floatingTerminalService.commandLifecycle$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((event: CliTerminalLifecycleEvent) => {
        if (!this.isLifecycleEventForActiveCommand(event)) {
          return;
        }
        if (event.type === 'command_started') {
          this.commandExecutionState = 'executing';
          this.commandExecutionStatusMessage = 'Executing command...';
          this.commandExecutionError = '';
        } else if (event.type === 'command_completed') {
          this.commandExecutionState = 'analyzing';
          this.commandExecutionStatusMessage = 'Analyzing command output...';
          this.commandExecutionError = '';
          this.analyzeCliCommandOutput(event);
        } else if (event.type === 'command_failed') {
          if (event.payload?.reason === 'terminal_closed') {
            this.clearCommandExecutionState();
            return;
          }
          this.commandExecutionState = 'analyzing';
          this.commandExecutionStatusMessage = 'Analyzing command output...';
          this.commandExecutionError = '';
          this.analyzeCliCommandOutput(event);
        }
      });
  }

  private analyzeCliCommandOutput(event: CliTerminalLifecycleEvent) {
    const context = this.activeCommandContext;
    if (!context) {
      this.clearCommandExecutionState();
      return;
    }

    const executedCommand = event.command || context.command;
    const cliAuditLogId = event.cli_audit_log_id || event.payload?.cli_audit_log_id || event.payload?.audit_log_id;
    const query = `Analyze the CLI output for command: ${executedCommand}`;
    this.chatHistoryData.push({ user: 'user', message: query, type: 'text' });

    this.getResponse(query, false, {
      condition_id: Number(this.conditionId),
      conversation_id: this.conversationId,
      cli_audit_log_id: cliAuditLogId,
      executed_command: executedCommand,
      executed_command_details: {
        ...context.commandDetails,
        command: executedCommand,
        tab_id: event.tabId,
        terminal_event: event.payload,
        device: context.device,
      },
    }, () => this.clearCommandExecutionState());
  }

  private clearCommandExecutionState() {
    this.commandExecutionState = 'idle';
    this.commandExecutionStatusMessage = '';
    this.commandExecutionError = '';
    this.activeCommandContext = null;
    this.cliCommandService.setActiveCommandContext(null);
  }

  private isLifecycleEventForActiveCommand(event: CliTerminalLifecycleEvent): boolean {
    if (!this.activeCommandContext) {
      return false;
    }
    if (event.conversationId && this.activeCommandContext.conversationId && event.conversationId !== this.activeCommandContext.conversationId) {
      return false;
    }
    if (this.activeCommandContext.tabId && event.tabId === this.activeCommandContext.tabId) {
      return true;
    }
    if (event.command && event.command === this.activeCommandContext.command) {
      return true;
    }
    return !this.activeCommandContext.tabId;
  }

  private toRecommendedAction(action: any) {
    if (typeof action === 'string') {
      return { name: action, isDisabled: false };
    }
    return {
      ...action,
      name: action?.name || action?.label || action?.title || action?.command || '',
      command: action?.command,
      isDisabled: !!action?.isDisabled,
    };
  }

  private getActionName(action: any): string {
    return typeof action === 'string' ? action : (action?.name || action?.label || action?.title || '');
  }

  private getActionCommand(action: any): string {
    return typeof action === 'string' ? '' : `${action?.command || action?.cli_command || action?.command_text || ''}`.trim();
  }

  showTokenUsage: boolean = false;
  tokenUsageData: TokenUsageViewData;
  tokenIconChart: UnityChartDetails;
  tokenPopupChart: UnityChartDetails;
  tokenUsageLoader: boolean = false;

  getTokenUsage() {
    this.tokenUsageLoader = true;
    this.ucService.getTokenUsage(this.userInfoService.userOrgId, this.userInfoService.userDetails.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: TokenUsage) => {
      // this.tokenUsageData = res;
      this.tokenUsageData = this.ucService.convertToTokenUsageViewData(res);
      this.tokenUsageLoader = false;
    }, (err: HttpErrorResponse) => {
      this.tokenUsageData = null;
      this.tokenIconChart = null;
      this.tokenPopupChart = null;
      this.tokenUsageLoader = false;
    });
  }

  toggleTokenUsageDropdown() {
    this.showTokenUsage = !this.showTokenUsage
    this.getTokenUsage();
  }

  executeLastCommand(chat: any) {
    chat.showLastCommandPrompt = false;
    this.openCommandExecutionModal(chat.lastCommand, {
      source: 'last_command',
      commandType: chat.lastCommandType || null
    });
  }

  declineLastCommand(chat: any) {
    chat.showLastCommandPrompt = false;
    this.submitQuery(`No, do not execute ${chat.lastCommand}`);
  }
}
