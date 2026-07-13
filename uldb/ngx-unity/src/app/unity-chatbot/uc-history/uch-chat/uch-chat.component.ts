import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { UnityAssistantChatHistory, UnityAssistantHistory } from '../uc-history.type';
import { UchChatService } from './uch-chat.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { takeUntil } from 'rxjs/operators';
import { IPageInfo, VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { FormGroup } from '@angular/forms';
import { ChatDocument, ChatHistoryData, TokenUsage, UnityChatBot } from '../../unity-chatbot.type';
import { HttpErrorResponse } from '@angular/common/http';
import { SupportedLLMConfigData } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.type';
import { Router } from '@angular/router';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { TokenUsageViewData, UnityChatbotService } from '../../unity-chatbot.service';
import { getTokenMultiplier, getTokenMultiplierTooltip, hasTokenMultiplier } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.util';
// import { EventEmitter } from 'stream';

type ChatInputMode = 'auto' | 'pro';

interface ChatInputModePayload {
  chat_mode: ChatInputMode;
  session_model_uuid: string;
}

@Component({
  selector: 'uch-chat',
  templateUrl: './uch-chat.component.html',
  styleUrls: ['./uch-chat.component.scss'],
  providers: [UchChatService]
})
export class UchChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  private ngUnsubscribe = new Subject();

  @Input() selectedHistory: UnityAssistantHistory;
  @Output() goBack = new EventEmitter();
  @Output() newChat = new EventEmitter();

  chatCurrentCriteria: SearchCriteria;
  chats: UnityAssistantChatHistory[] = [];
  infiniteChats: UnityAssistantChatHistory[] = []

  @ViewChild('scroll') virtualScroller!: VirtualScrollerComponent;
  isLoadingChats = false;
  hasMoreChats = true;
  isFirstLoad = true;
  allowFetch: boolean = false;
  waitingForScrollAway: boolean = false;

  form: FormGroup;
  isTyping: boolean = false;
  chatHistoryData: Array<ChatHistoryData> = [];
  shouldScrollToBottom = false;
  shouldScroll: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.active-ai-modal-model-selector')) {
      this.showModelDropdown = false;
    }
  }

  showModelDropdown = false;
  activeModel: SupportedLLMConfigData;
  selectedChatInputModel: SupportedLLMConfigData;
  llmModels: SupportedLLMConfigData[] = [];
  readonly chatInputModeStorageKey = 'unity_assistant_chat_input_mode_payload';
  chatInputModePayload: ChatInputModePayload = {
    chat_mode: 'auto',
    session_model_uuid: ''
  };
  enableProModeModalVisible: boolean = false;
  typingQueue: string[] = [];
  showStopButton: boolean = false;
  isStreaming: boolean = false;
  typingInterval: any;
  hasReachedTop: boolean = false;
  doneData: any;

  @ViewChild('fileInput') fileInput: ElementRef;
  fileUploadLoader: boolean = false;
  attachedFiles: ChatDocument[] = [];
  fileUploadErrorMessage: string = '';

  @Input() isExpanded: boolean;
  constructor(private service: UchChatService,
    private userService: UserInfoService,
    private router: Router,
    private ucService: UnityChatbotService) {
    this.chatCurrentCriteria = {
      searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TEN,
      params: [{
        'org_id': userService.userOrgId,
        'user_id': userService.userDetails.id,
        'application': 'assistant',
        'conversation_id': ''
      }]
    }
  }

  ngOnInit(): void {
    this.resetChatInputModePayload();
    this.getDocuments();
    this.getAIModels();
    this.buildForm();
    this.chatCurrentCriteria.params[0].conversation_id = this.selectedHistory.conversation_id;
    this.getChats();
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

  @ViewChild('chatContainer') chatContainer: ElementRef;
  onScroll() {
    const el = this.chatContainer.nativeElement;
    if (el.scrollTop <= 40 && !this.isLoadingChats && this.hasMoreChats) {
      this.chatCurrentCriteria.pageNo++;
      this.getChats();
    }
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  getChats() {
    this.isLoadingChats = true;
    this.service.getChats(this.chatCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const el = this.chatContainer.nativeElement;
      const prevScrollHeight = el.scrollHeight;
      const reversed = [...res.results].reverse();
      if (this.isFirstLoad) {
        this.infiniteChats = reversed;
        this.chatHistoryData = this.mapToChatHistory(this.infiniteChats);
        this.isFirstLoad = false;
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        });
      } else {
        this.infiniteChats = [...reversed, ...this.infiniteChats];
        this.chatHistoryData = this.mapToChatHistory(this.infiniteChats);
        setTimeout(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop += newScrollHeight - prevScrollHeight;
        });
      }
      this.hasMoreChats = this.infiniteChats.length < res.count;
      this.isLoadingChats = false;
    });
  }

  trackByMessage(index: number, item: any) {
    return item.id;
  }

  mapToChatHistory(chats: UnityAssistantChatHistory[]) {
    return chats.map(chat => ({
      user: (chat.role === 'user' ? 'user' : 'bot') as 'user' | 'bot',
      message: chat.content,
      type: 'text'
    }));
  }

  getResponse(chat: string, isDefault?: boolean) {
    this.isTyping = true;
    let postData = { conversation_id: this.selectedHistory.conversation_id, query: chat, org_id: this.userService.userOrgId }
    this.startWaitMessages();
    this.service.getResponse(postData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: UnityChatBot) => {
      this.isTyping = false;
      this.manageResponse(res);
      this.cleanup();
    }, (err: HttpErrorResponse) => {
      this.isTyping = false;
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
      this.cleanup();
    });
  }

  manageResponse(res: UnityChatBot) {
    if (res.response) {
      this.chatHistoryData.push({ user: 'bot', message: (res.response.answer as string), type: 'text' });
      if (res.response?.suggested_questions?.length) {
        this.chatHistoryData.getLast()['suggestedPrompt'] = res.response.suggested_questions[0];
      }
    } else {
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    }
    const el = this.chatContainer.nativeElement;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    })
  }

  buildForm() {
    this.form = this.service.buildForm();
  }

  onSubmit() {
    if (this.isTyping) {
      // this.shouldScroll = false;
      return;
    }
    // this.resetThread = false;
    if (this.form.get('chat').value.trim()) {
      this.chatHistoryData.push({ user: 'user', message: this.form.get('chat').value, type: 'text' });
      const el = this.chatContainer.nativeElement;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      })
      this.getStreamingResponse(this.form.get('chat').value);
      this.form.get('chat').setValue('');
    }
  }

  private timerSub: Subscription;
  waitMessage: string = 'Thinking';
  startWaitMessages() {
    this.cleanup();
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

  getAIModels() {
    this.service.getSupportedLLMModelList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.llmModels = res;
      this.llmModels.forEach(m => {
        if (m.active_for_applications?.includes('assistant')) {
          this.activeModel = m;
        }
      })
    }, err => {
      this.llmModels = [];
      this.activeModel = null;
      this.selectedChatInputModel = null;
    })
  }

  chatId: string = '';
  getStreamingResponse(chat: string) {
    this.attachedFiles = [];
    this.isTyping = true;
    this.isStreaming = true;
    this.showStopButton = true;
    this.doneData = null;
    let postData = {
      conversation_id: this.selectedHistory.conversation_id,
      query: chat,
      org_id: this.userService.userOrgId,
      chat_mode: this.chatInputModePayload.chat_mode,
      session_model_uuid: this.chatInputModePayload.chat_mode === 'auto' ? '' : this.chatInputModePayload.session_model_uuid
    };
    this.startWaitMessages();

    this.chatHistoryData.push({ user: 'bot', message: '', type: 'text' });
    const lastIndex = this.chatHistoryData.length - 1;

    this.service.getStreamingResponse(postData).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: ({ event, data }) => {
        if (event === 'start') {
          // this.conversationId = data.conversation_id;
          this.cleanup();

        } else if (event === 'chunk') {
          this.typingQueue.push(data.delta);
          if (!this.typingInterval) {
            this.startTypingEffect();
          }

        } else if (event === 'done') {
          this.doneData = data;
          this.tokenUsageData = this.ucService.convertToTokenUsageViewData(this.doneData.token_usage.org);
          // this.chatId = data.chat_message_id ?? '';
          // this.conversationId = data.conversation_id;
          // this.chatHistoryData[lastIndex]['suggestedPrompt'] = data.suggested_questions?.length ? data.suggested_questions[0] : '';
          this.chatHistoryData[lastIndex]['liked'] = false;
          this.chatHistoryData[lastIndex]['disliked'] = false;
          this.chatHistoryData[lastIndex]['comment'] = false;
          this.chatHistoryData[lastIndex]['feedbackSubmitted'] = false;
          // this.chatHistoryData[lastIndex]['botResponseId'] = data.chat_message_id ?? '';
          this.chatHistoryData[lastIndex]['feedbackIconTooltip'] = 'Feedback';
          // if (!(this.chatHistoryData[lastIndex].message as string).length) {
          //   this.chatHistoryData[lastIndex].message = 'Sorry, I am having trouble right now.';
          //   this.showStopButton = false;
          // }
        } else if (event === 'error') {
          if (!(this.chatHistoryData[lastIndex].message as string).length) {
            this.chatHistoryData[lastIndex].message = 'Sorry, I am having trouble right now.';
            this.showStopButton = false;
          }
        }
      },
      error: (err) => {
        this.showStopButton = false;
        this.isTyping = false;
        this.isStreaming = false;
        this.chatHistoryData[lastIndex].message = 'Sorry, I am having trouble right now.';
        // this.resetThread = true;
        this.shouldScroll = false;
        clearInterval(this.typingInterval);
        this.typingInterval = null;
        this.cleanup();
      },
      complete: () => {
        // this.showStopButton = false;
        this.isTyping = false;
        this.isStreaming = false;
      }
    });
  }

  startTypingEffect() {
    this.typingInterval = setInterval(() => {
      if (this.typingQueue.length > 0) {
        const char = this.typingQueue.shift();
        this.chatHistoryData[this.chatHistoryData.length - 1].message += char;
        this.isTyping = false;
        this.cleanup();
        if (!this.hasReachedTop) {
          this.shouldScroll = true;
        }
      } else {
        if (this.showStopButton) {
          this.showStopButton && (this.chatHistoryData.getLast().botResponseId = this.chatId);
          this.chatHistoryData.getLast()['suggestedPrompt'] = this.doneData.suggested_questions?.length ? this.doneData.suggested_questions[0] : '';
        }
        this.showStopButton = false;
        this.cleanup();
        clearInterval(this.typingInterval);
        this.typingInterval = null;
        this.shouldScroll = false;
      }
    }, 100);
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
      if (this.activeModel) {
        this.activeModel.active_for_applications = this.activeModel.active_for_applications.filter(app => app != 'assistant');
      }
      model.active_for_applications.push('assistant');
      this.changeActiveModelToSelected(model);
    } else {
      // this.goToConfig(model);
    }

  }

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

  submitQuery(query: string) {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    if (query.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: query, type: 'text' });
      this.getStreamingResponse(query);
    }
  }

  cleanup() {
    this.timerSub?.unsubscribe();
    this.waitMessage = '';
  }

  backToHistoryList(): void {
    this.goBack.emit(null);
  }

  onNewChat() {
    this.newChat.emit();
  }

  stopResponse() {
    this.chatHistoryData.getLast().botResponseId = this.chatId;
    clearInterval(this.typingInterval);
    this.typingInterval = null;
    this.showStopButton = false;
    this.isTyping = false;
    this.cleanup();
    this.typingQueue = [];
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.shouldScroll = false;
  }

  getDocuments() {
    this.service.getDocuments(this.selectedHistory.conversation_id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.attachedFiles = res.documents;
    })
  }

  onFilesSelected(event: Event) {
    this.fileUploadErrorMessage = '';
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const files = Array.from(input.files);
    input.value = '';
    const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024);
    const oversized = files.filter(file => file.size > 2 * 1024 * 1024);

    if (oversized.length) {
      this.fileUploadErrorMessage = `${oversized.length} file(s) exceed 2MB and were skipped.`;
    }

    if (validFiles.length) {
      this.uploadDocuments(validFiles);
    }
  }

  uploadDocuments(files: File[]) {
    this.fileUploadLoader = true;
    this.service.uploadDocument(files, this.selectedHistory.conversation_id, this.userService.userOrgId, this.userService.userDetails.id)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res) => {
          // this.conversationId = res.conversation_id;
          this.fileUploadLoader = false;
          this.getDocuments();
          // this.conversationId && this.getDocuments();
        },
        error: (error: HttpErrorResponse) => {
          // this.fileUploadErrorMessage = 'Failed to upload file, please try agin.';
          this.fileUploadLoader = false;
        }
      });
  }

  removeFile(file: any) {
    // this.attachedFiles = this.attachedFiles.filter(f => f !== file);
    this.service.deleteDocument(file.document_id, this.selectedHistory.conversation_id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDocuments();
    })
  }

  showTokenUsage: boolean = false;
  tokenUsageData: TokenUsageViewData;
  tokenIconChart: UnityChartDetails;
  tokenPopupChart: UnityChartDetails;
  tokenUsageLoader: boolean = false;


  getTokenUsage() {
    this.tokenUsageLoader = true;
    this.ucService.getTokenUsage(this.userService.userOrgId, this.userService.userDetails.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: TokenUsage) => {
      // this.tokenUsageData = res;
      // this.tokenIconChart = this.ucService.convertToTokenUsageChartData(res, false);
      // this.tokenPopupChart = this.ucService.convertToTokenUsageChartData(res, true);
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
