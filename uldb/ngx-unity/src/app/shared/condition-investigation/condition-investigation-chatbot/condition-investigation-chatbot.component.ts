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
    private ucService: UnityChatbotService) {
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
    this.getAIModels();
    const firstQuery = `Create an investigation plan to resolve the condition ${this.conditionId}`;
    if (this.loadHistory == 'true') {
      this.getChats();
    } else {
      this.getResponse(firstQuery);
    }
    // this.getResponse(firstQuery);
    this.buildForm();
  }

  ngOnDestroy(): void {
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
        actions: chat.metadata?.recommended_actions?.map((a: string) => ({ name: a })) || [],
        showAction: chat.metadata?.recommended_actions?.length > 0,
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

  getResponse(chat: string, isDefault?: boolean) {
    if (chat.includes('Exit')) {
      this.goBack();
      return;
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
    this.chatHistoryData.push({ user: 'bot', message: '', type: 'text' });
    this.chatHistoryData.getLast()['showAction'] = false;
    const lastIndex = this.chatHistoryData.length - 1;
    this.startWaitMessages();
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
            if (this.doneData?.meta?.recommended_actions?.length) {
              this.chatHistoryData.getLast()['actions'] = this.doneData.meta.recommended_actions.map(ra => {
                return {
                  name: ra,
                  isDisabled: false
                }
              });
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
      },
      complete: () => {
        this.sectionBreakReached && (this.typingQueue = []);
        // this.sectionBreakReached = false;
        this.isTyping = false;
        this.isStreaming = false;
        if (this.doneData?.meta?.recommended_actions?.length) {
          this.chatHistoryData.getLast()['actions'] = this.doneData.meta.recommended_actions.map(ra => {
            return {
              name: ra,
              isDisabled: false
            }
          });
        }
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
            const last = this.chatHistoryData[this.chatHistoryData.length - 1];
            if (this.doneData?.meta?.recommended_actions?.length) {
              last['actions'] = this.doneData.meta.recommended_actions.map(ra => {
                return {
                  name: ra,
                  isDisabled: false
                }
              });
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

  getAIModels() {
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
    }, err => {
      this.llmModels = [];
      this.activeModel = null;
      this.selectedChatInputModel = null;
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
      if (this.command) {
        this.confirmExecutionModalRef = this.modalService.show(this.executeCommand, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
      }
    }
  }

  confirmExecuteModal(tabType: 'sameTab' | 'newTab') {
    this.confirmExecutionModalRef.hide();
    localStorage.setItem('terminal_command', this.command);
    this.newTerminalService.setPendingTabType(tabType);
    this.newTerminalService.setConversationId(this.conversationId);
    this.newTerminalService.setBackendTabId(null);
    this.newTerminalService.openTerminal();
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
}
