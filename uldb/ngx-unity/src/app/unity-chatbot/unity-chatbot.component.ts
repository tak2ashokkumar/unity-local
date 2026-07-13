import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import moment from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { from, Subject, Subscription, timer } from 'rxjs';
import { filter, mergeMap, skip, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DateRange } from '../shared/app-utility/app-utility.service';
import { SupportedLLMConfigData } from '../shared/SharedEntityTypes/ai-chatbot/llm-model.type';
import { UserInfoService } from '../shared/user-info.service';
import { UcChartsService } from './uc-charts/uc-charts.service';
import { UcTableService } from './uc-table/uc-table.service';
import { DashboardApiMapping, InsightsMapping, ModuleIcons, moduleMapping, TabNames, TokenUsageViewData, UnityChatbotService } from './unity-chatbot.service';
import { ChatHistoryData, ChatDocument, Insight, UnityChatBot, UntiyChatBotExploreMenu, TokenUsage } from './unity-chatbot.type';
import { UnityChartDetails } from '../shared/unity-chart-config.service';
import { getTokenMultiplier, getTokenMultiplierTooltip, hasTokenMultiplier } from '../shared/SharedEntityTypes/ai-chatbot/llm-model.util';

type ChatInputMode = 'auto' | 'pro';

interface ChatInputModePayload {
  chat_mode: ChatInputMode;
  session_model_uuid: string;
}

@Component({
  selector: 'unity-chatbot',
  templateUrl: './unity-chatbot.component.html',
  styleUrls: ['./unity-chatbot.component.scss'],
  providers: [UcChartsService, UcTableService]
})
export class UnityChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  private ngUnsubscribe = new Subject();
  private annoucedNgUnsubscribe = new Subject();

  isOpen: boolean = false;
  isExpanded: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @Output() chatbotStateChange = new EventEmitter<{ isOpen: boolean; isExpanded: boolean }>();

  imageURL: string = `${environment.assetsUrl}external-brand/logos/Chatbot_Logo.svg`
  form: FormGroup; botResponseId
  resetThread: boolean = false;
  chatHistoryData: Array<ChatHistoryData> = [];
  previousResponse: UnityChatBot;
  isTyping: boolean = false;
  shouldScroll: boolean = false;
  modules: UntiyChatBotExploreMenu[] = [];
  queries: string[] = [];
  currentRouteUrl: string = ''
  showCommonQueries: boolean = true;
  commonQueries: string[] = [];
  zIndex: string = '100';
  isHovered: boolean = false;
  activeModule: UntiyChatBotExploreMenu;
  feedbackForm: FormGroup;
  waitMessage: string = 'Thinking';

  insights: Insight[] = [];
  isInsightsOpen: boolean = false;
  showInsightsButton: boolean = false;
  assistedInsightImgUrl: string = `${environment.assetsUrl}external-brand/logos/insights.svg`;

  devopsFrom: string;
  devopsTo: string;

  tabs = TabNames;
  selectedTab: string = this.tabs[0].name;
  @Input() moduleLevelData;

  private timerSub: Subscription;
  conversationId: string = null;

  onHistory: boolean = false;

  showModelDropdown = false;
  llmModels: SupportedLLMConfigData[] = [];
  activeModel: SupportedLLMConfigData;
  selectedChatInputModel: SupportedLLMConfigData;
  readonly chatInputModeStorageKey = 'unity_assistant_chat_input_mode_payload';
  chatInputModePayload: ChatInputModePayload = {
    chat_mode: 'auto',
    session_model_uuid: ''
  };
  enableProModeModalVisible: boolean = false;

  chatId: string;

  @ViewChild('fileInput') fileInput: ElementRef;
  fileUploadLoader: boolean = false;
  attachedFiles: ChatDocument[] = [];
  get chatbotZIndex(): string {
    if (this.isExpanded) {
      return '3001';
    }
    return this.isOpen ? '100' : this.zIndex;
  }

  get backdropZIndex(): string {
    const zIndexNumber = Number(this.chatbotZIndex);
    return Number.isNaN(zIndexNumber) ? '3000' : `${zIndexNumber - 1}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.active-ai-modal-model-selector')) {
      this.showModelDropdown = false;
    }
    if (!target.closest('.token-usage-selector')) {
      this.showTokenUsage = false;
    }
  }

  fileUploadErrorMessage: string = '';

  constructor(private service: UnityChatbotService,
    private router: Router,
    private modalService: BsModalService,
    public userInfoService: UserInfoService,
    private chartService: UcChartsService,
    private tableService: UcTableService) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), skip(1)).subscribe((event: NavigationEnd) => {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
      if (this.isExpanded) {
        this.minimizeExpandedChatbot();
      }
      if (this.userInfoService.isInsightsEnabled) {
        this.insights = [];
        this.showInsightsButton = this.hasInsights();
        const popUpElement = document.getElementById('insightsPopUp');
        popUpElement?.classList.remove("open");
      }
      const buttonElement = document.getElementById('chatbotButton');
      const insightsbuttonElement = document.getElementById('insightsButton');
      if (!this.isOpen) {
        buttonElement && buttonElement?.classList.remove("hidden");
        insightsbuttonElement && insightsbuttonElement?.classList.remove("hidden");
      }
      this.userInfoService.isInsightsEnabled && this.isDashboard();
      this.disableChatbot();
    });
    if (this.userInfoService.isInsightsEnabled) {
      this.service.onFilterChangeAnnounced$.pipe(takeUntil(this.annoucedNgUnsubscribe)).subscribe(params => {
        this.onDevopsFilterChange(params);
      })
    }
    this.service.onChatTrigger$.subscribe(val => {
      if (val) {
        this.manageTabs(this.tabs[1]);
        if (!this.isOpen) {
          this.openChatbot();
        }
      }
    })
    this.service.sidebarExpanded$.subscribe(res => {
      console.log("toggle", this.isOpen)
      this.isOpen && this.togglePopUp();
    })
  }

  ngOnInit(): void {
    this.resetChatInputModePayload();
    this.getTokenUsage();
    this.isInsightsOpen = false;
    if (this.userInfoService.isInsightsEnabled) {
      this.showInsightsButton = this.hasInsights();
      this.isDashboard();
    }
    if (this.userInfoService.isChatbotEnabled) {
      this.getAIModels();
      this.buildForm();
      this.getModuleNames();
      this.modalService.onShown.subscribe(() => {
        this.zIndex = '2145';
      });
      this.modalService.onHidden.subscribe(() => {
        this.zIndex = '2155';
      });
    }
    setTimeout(() => {
      this.disableChatbot();
    }, 0);
  }

  ngOnDestroy(): void {
    this.resetChatInputModePayload();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.annoucedNgUnsubscribe.next();
    this.annoucedNgUnsubscribe.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  // getResponse(chat: string) {
  //   this.isTyping = true;
  //   let postData = { conversation_id: this.conversationId, query: chat, org_id: this.userInfoService.userOrgId }
  //   this.startWaitMessages();
  //   this.service.getResponse(postData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: UnityChatBot) => {
  //     this.previousResponse = res;
  //     this.isTyping = false;
  //     this.manageResponse(res);
  //     this.conversationId = res.conversation_id;
  //     setTimeout(() => {
  //       this.scrollToBottom();
  //       this.shouldScroll = false;
  //     });
  //     this.cleanup();
  //   }, (err: HttpErrorResponse) => {
  //     this.isTyping = false;
  //     this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
  //     this.resetThread = true;
  //     this.shouldScroll = false;
  //     this.cleanup();
  //   });
  // }

  isStreaming: boolean = false;
  typingInterval: any;
  typingQueue: string[] = [];
  hasReachedTop: boolean = false;
  showStopButton: boolean = false;
  doneData: any;
  getStreamingResponse(chat: string) {
    this.fileUploadErrorMessage = '';
    // this.attachedFiles = [];
    this.isTyping = true;
    this.isStreaming = true;
    this.showStopButton = true;
    this.doneData = null;
    let postData = {
      conversation_id: this.conversationId,
      query: chat,
      org_id: this.userInfoService.userOrgId,
      chat_mode: this.chatInputModePayload.chat_mode,
      session_model_uuid: this.chatInputModePayload.chat_mode === 'auto' ? '' : this.chatInputModePayload.session_model_uuid
    };
    this.startWaitMessages();

    this.chatHistoryData.push({ user: 'bot', message: '', type: 'text' });
    const lastIndex = this.chatHistoryData.length - 1;

    this.service.getStreamingResponse(postData).subscribe({
      next: ({ event, data }) => {
        if (event === 'start') {
          this.conversationId = data.conversation_id;
          this.cleanup();

        } else if (event === 'chunk') {
          this.typingQueue.push(data.delta);
          if (!this.typingInterval) {
            this.startTypingEffect();
          }

        } else if (event === 'done') {
          this.doneData = data;
          this.tokenUsageData = this.service.convertToTokenUsageViewData(this.doneData.token_usage.org);
          this.chatId = data.chat_message_id ?? '';
          this.conversationId = data.conversation_id;
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
        this.resetThread = true;
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

  getModuleNames() {
    this.service.getModuleNames().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.commonQueries = res.find(m => m.module_name == 'Common').queries;
      this.modules = res.filter(module => module.module_name != 'Common').map(module => ({
        ...module,
        isActive: false,
        module_display_name: this.getModuleDisplayName(module.module_name),
        icon: ModuleIcons[module.module_name] || ""
      }));
    }, (err: HttpErrorResponse) => {
    });
  }

  getModuleDisplayName(moduleName: string) {
    if (!moduleName) return moduleName;
    switch (moduleName) {
      case 'Unity Services': return 'Cloud Intelligence';
      case 'Unity View': return 'Observability';
      case 'Unity Setup': return 'UPC Administration';
      case 'Unity Cloud': return 'Cloud Mgmt';
      default: return moduleName;
    }
  }

  getInsights(key: string) {
    this.insights = [];
    let insightsToLoad = InsightsMapping[key].apiUrls;
    if (key == 'services/orchestration/summary') {
      insightsToLoad = InsightsMapping[key].apiUrls.filter(url => !url.toBeskipped);
    }
    from(insightsToLoad).pipe(mergeMap(widget => this.service.getInsights(widget.url)
      .pipe(takeUntil(this.ngUnsubscribe)))).subscribe(res => {
        this.insights = [...this.insights, ...(res.insights || [])];
      }, (err: HttpErrorResponse) => {
      });
  }

  hasChatbotAccess(): boolean {
    return this.userInfoService.isChatbotEnabled;
  }

  hasInsightsAccess(): boolean {
    return this.userInfoService.isInsightsEnabled;
  }

  hasInsights(): boolean {
    return Object.keys(DashboardApiMapping).some(route => this.router.url.includes(route));
  }

  isDashboard() {
    Object.entries(DashboardApiMapping).forEach(([key, apiUrl]) => {
      if (this.router.url.includes(key)) {
        this.getInsights(key);
        return;
      }
    })
  }

  disableChatbot() {
    if (this.router.url.includes('services/orchestration/workflows/new-workflow') ||
      this.router.url.includes('/investigate')) {
      const buttonElement = document.getElementById('chatbotButton');
      this.isOpen && this.togglePopUp();
      buttonElement && buttonElement.classList.add("hidden");
    }
  }

  manageResponse(res: UnityChatBot) {
    if (res.response) {
      this.chatHistoryData.push({ user: 'bot', message: (res.response.answer as string), type: 'text' });
      this.chatHistoryData.getLast()['suggestedPrompt'] = res.response?.suggested_questions?.length ? res.response?.suggested_questions[0] : '';
    } else {
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    }
    this.chatHistoryData.getLast()['liked'] = false;
    this.chatHistoryData.getLast()['disliked'] = false;
    this.chatHistoryData.getLast()['comment'] = false;
    this.chatHistoryData.getLast()['feedbackSubmitted'] = false;
    this.chatHistoryData.getLast()['botResponseId'] = res.response.chat_message_id ? res.response.chat_message_id : '';
    this.chatHistoryData.getLast()['feedbackIconTooltip'] = 'Feedback';
    // if (res.response.length && res.response.length == 1) {
    //   if (res.response[0].type == 'text') {
    //     this.chatHistoryData.push({ user: 'bot', message: (res.response[0].data as string), type: 'text' });
    //   } else if (res.response[0].type == 'table') {
    //     const tableData = this.tableService.convertToTableViewData(res.response[0].data as UnityChatBotResponseTableData);
    //     this.chatHistoryData.push({ user: 'bot', message: (tableData as ChatbotTableViewData), type: 'table' });
    //   } else if (res.response[0].type == 'pie_chart') {
    //     const chartData = this.chartService.convertToPieChartViewData(res.response[0].data as UnityChatBotResponseChartData);
    //     this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //   } else if (res.response[0].type == 'bar_chart') {
    //     const chartData = this.chartService.convertToBarChartViewData(res.response[0].data as UnityChatBotResponseChartData);
    //     this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //   } else if (res.response[0].type == 'donut_chart') {
    //     const chartData = this.chartService.convertToPieChartViewData(res.response[0].data as UnityChatBotResponseChartData, res.response[0].type);
    //     this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //   } else {
    //     this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    //   }
    // } else if (res.response.length && res.response.length > 1) {
    //   let responseArray = res.response;
    //   responseArray = res.response.sort((a, b) => a.order - b.order);
    //   responseArray.forEach(r => {
    //     if (r.type == 'text') {
    //       this.chatHistoryData.push({ user: 'bot', message: (r.data as string), type: 'text' });
    //     } else if (r.type == 'table') {
    //       const tableData = this.tableService.convertToTableViewData(r.data as UnityChatBotResponseTableData);
    //       this.chatHistoryData.push({ user: 'bot', message: (tableData as ChatbotTableViewData), type: 'table' });
    //     } else if (r.type == 'pie_chart') {
    //       const chartData = this.chartService.convertToPieChartViewData(r.data as UnityChatBotResponseChartData);
    //       this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //     } else if (r.type == 'bar_chart') {
    //       const chartData = this.chartService.convertToBarChartViewData(r.data as UnityChatBotResponseChartData);
    //       this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //     } else if (r.type == 'donut_chart') {
    //       const chartData = this.chartService.convertToPieChartViewData(r.data as UnityChatBotResponseChartData, r.type);
    //       this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //     }
    //   })
    // } else {
    //   this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    // }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  togglePopUp() {
    this.isOpen ? this.closeChatbot() : this.openChatbot();
  }

  openChatbot() {
    this.isOpen = true;
    this.isExpanded = false;
    const buttonElement = document.getElementById('chatbotButton');
    const insightsbuttonElement = document.getElementById('insightsButton');

    if (!this.llmModels.length) {
      this.getAIModels();
    }
    if (this.selectedTab === 'Assistant' && this.modules.length) {
      this.findCurrentModule();
    }
    buttonElement?.classList.add("hidden");
    insightsbuttonElement?.classList.add("hidden");
    this.emitChatbotState();
  }

  closeChatbot() {
    this.isOpen = false;
    this.isExpanded = false;
    const buttonElement = document.getElementById('chatbotButton');
    const insightsbuttonElement = document.getElementById('insightsButton');

    if (this.selectedTab === 'Assistant') {
      this.modules.forEach(m => m.isActive = false);
      const defQ = document.getElementById('defaultQueries');
      defQ && (defQ.style.maxHeight = `0px`);
    }

    buttonElement?.classList.remove("hidden");
    insightsbuttonElement?.classList.remove("hidden");
    this.emitChatbotState();
  }

  expandChatbot() {
    if (!this.isOpen) {
      return;
    }
    this.isExpanded = true;
    this.emitChatbotState();
  }

  minimizeExpandedChatbot() {
    this.isExpanded = false;
    this.emitChatbotState();
    this.expandDefaultQueries();
  }

  private emitChatbotState() {
    this.chatbotStateChange.emit({ isOpen: this.isOpen, isExpanded: this.isExpanded });
  }

  findCurrentModule() {
    const currentUrl = this.router.url;
    Object.entries(moduleMapping).forEach(([key, moduleName]) => {
      if (currentUrl.includes(key)) {
        this.activeModule = this.modules.find(module => module.module_name == moduleName);
        setTimeout(() => {
          this.manageActiveModule(this.modules.find(module => module.module_name == moduleName));
        })
        this.showCommonQueries = false;
        this.activeModule.inUrl = true;
      }
    });
    if (this.showCommonQueries) {
      this.queries = this.commonQueries;
      const defQ = document.getElementById('defaultQueries');
      if (defQ) {
        setTimeout(() => {
          defQ.style.maxHeight = `${60 * this.queries.length}px`;
          defQ.classList.add("show");
        }, 10);
      }
    }
  }

  onExploreMenuHover() {
    this.isHovered = true;
  }

  onExploreMenuLeave() {
    this.modules.forEach(m => m.isActive = false);
    const q = document.getElementById('queries');
    if (q) {
      q.classList.remove("show");
      setTimeout(() => {
        this.isHovered = false;
        this.queries = [];
      }, 600);
      // q.style.maxHeight = `0px`;
    }
  }

  onIconHover(module: UntiyChatBotExploreMenu) {
    this.modules.forEach(m => m.isActive = false);
    module.isActive = !module.isActive;
    const q = document.getElementById('queries');
    if (q) {
      if (this.queries.length) {
        this.queries = this.modules.find(m => m.isActive)?.queries || [];
      } else {
        q.classList.add("show");
        this.queries = this.modules.find(m => m.isActive)?.queries || [];
      }
    }
    this.queries.length && (setTimeout(() => { this.scrollToBottom() }, 0));
  }

  manageActiveModule(module: UntiyChatBotExploreMenu, unCheck?: boolean) {
    if (this.onHistory) {
      return //test
    }
    if (module.isActive && module.isActive == this.modules.find(m => m.module_name == module.module_name).isActive) {
      if (unCheck) {
        this.queries = [];
        module.isActive = !module.isActive;
      }
      return;
    }
    this.modules.forEach(m => m.isActive = false);
    module.isActive = !module.isActive;
    if (!this.chatHistoryData.length) {
      const defQ = document.getElementById('defaultQueries');

      if (this.queries.length) {
        defQ.classList.remove("show");
        defQ.style.maxHeight = `0px`;

        setTimeout(() => {
          this.queries = this.modules.find(m => m.isActive)?.queries || [];
          setTimeout(() => {
            defQ.style.maxHeight = `${60 * this.queries.length}px`;
            defQ.classList.add("show");
          }, 10);
        }, 600);
      } else {
        defQ.classList.add("show");
        this.queries = this.modules.find(m => m.isActive)?.queries || [];
      }
    } else {
      this.queries = this.modules.find(m => m.isActive)?.queries || [];
    }
  }

  buildForm() {
    this.form = this.service.buildForm();
  }

  submitQuery(query: string) {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    this.isHovered = false;
    this.resetThread = false;
    if (query.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: query, type: 'text' });
      this.getStreamingResponse(query);
      if (this.chatHistoryData.length) {
        this.modules.forEach(m => m.isActive = false);
        this.queries = [];
      }
    }
  }

  onSubmit() {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    this.resetThread = false;
    if (this.form.get('chat').value.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: this.form.get('chat').value, type: 'text' });
      this.getStreamingResponse(this.form.get('chat').value);
      this.form.get('chat').setValue('');
    }
  }

  onLike(index: number) {
    this.chatHistoryData[index].liked = !this.chatHistoryData[index].liked
    this.chatHistoryData[index].liked && (this.chatHistoryData[index].disliked = false);
    this.submitReaction({ action: 'like' }, this.chatHistoryData[index].botResponseId);
    // this.chatHistoryData[index].liked && this.submitReaction({ reaction: 'like' }, this.chatHistoryData[index].botResponseId);
    // this.chatHistoryData[index].liked || this.submitReaction({ reaction: 'none' }, this.chatHistoryData[index].botResponseId);
  }

  onDislike(index: number) {
    this.chatHistoryData[index].disliked = !this.chatHistoryData[index].disliked
    this.chatHistoryData[index].disliked && (this.chatHistoryData[index].liked = false);
    this.submitReaction({ action: 'dislike' }, this.chatHistoryData[index].botResponseId);
    // this.chatHistoryData[index].disliked && this.submitReaction({ reaction: 'dislike' }, this.chatHistoryData[index].botResponseId);
    // this.chatHistoryData[index].disliked || this.submitReaction({ reaction: 'none' }, this.chatHistoryData[index].botResponseId);
  }

  onComment(index: number) {
    if (this.chatHistoryData[index].feedbackSubmitted) {
      return;
    }
    this.chatHistoryData[index].comment = !this.chatHistoryData[index].comment;
    this.chatHistoryData.forEach(chat => {
      if (chat.botResponseId != this.chatHistoryData[index].botResponseId) {
        chat.comment = false;
      }
    });
    this.chatHistoryData[index].comment && this.buildFeedbackForm();
  }

  buildFeedbackForm() {
    this.feedbackForm = this.service.buildFeedbackForm();
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  submitReaction(data: any, queryId: string) {
    this.service.submitReaction(data, queryId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => { })
  }

  submitFeedBackForm(queryId: string, index: number) {
    this.service.submitFeedback(this.feedbackForm.getRawValue(), queryId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.chatHistoryData[index].comment = false;
      this.chatHistoryData[index].feedbackSubmitted = true;
      this.chatHistoryData[index].feedbackIconTooltip = 'Feedback Submitted';
    })
  }

  toggleInsightsPopUp() {
    this.isInsightsOpen = !this.isInsightsOpen;
    const popUpElement = document.getElementById('insightsPopUp');
    const buttonElement = document.getElementById('chatbotButton');
    const insightsbuttonElement = document.getElementById('insightsButton');
    if (this.isInsightsOpen) {
      popUpElement?.classList.add("open");
      buttonElement?.classList.add("hidden");
      insightsbuttonElement?.classList.add("hidden");
    } else {
      popUpElement?.classList.remove("open");
      buttonElement?.classList.remove("hidden");
      insightsbuttonElement?.classList.remove("hidden");
    }
  }

  submitQueryFromInsights(query: string) {
    const popUpElement = document.getElementById('insightsPopUp');
    popUpElement.classList.remove("open");
    this.togglePopUp();
    this.manageTabs(this.tabs.getFirst(), true);
    this.submitQuery(query);
  }

  onDevopsFilterChange(params: any) {
    const format = new DateRange().format;
    const insightParams = new HttpParams().set('from', moment(params.from).format(format)).set('to', moment(params.to).format(format));
    if (InsightsMapping['services/orchestration/summary'].apiUrls.find(url => url.name == 'Execution by User').params == insightParams) {
      return;
    } else {
      InsightsMapping['services/orchestration/summary'].apiUrls.find(url => url.name == 'Execution by User').params = insightParams;
      InsightsMapping['services/orchestration/summary'].apiUrls.find(url => url.name == 'Average Execution Time').params == insightParams;
    }
    this.insights = this.insights.filter(insight =>
      insight.category != 'Execution by User' &&
      insight.category != 'Average Execution Time'
    );
    const insightsToReload = InsightsMapping['services/orchestration/summary']
      .apiUrls.filter(widget =>
        widget.name == 'Execution by User' ||
        widget.name == 'Average Execution Time'
      );
    if (insightsToReload.length) {
      from(insightsToReload).pipe(mergeMap(widget => this.service.getInsights(widget.url, insightParams)
        .pipe(takeUntil(this.ngUnsubscribe)))).subscribe(res => {
          this.insights = [...this.insights, ...(res.insights || [])];
        }, (err: HttpErrorResponse) => {
        });
    }
  }

  manageTabs(tab: any, fromInsights?: boolean) {
    if (tab.name == this.selectedTab) {
      return;
    }
    this.selectedTab = tab.name;
    this.tabs.forEach(tab => tab.isSelected = false);
    tab.isSelected = true;
    !fromInsights && this.expandDefaultQueries();
  }

  expandDefaultQueries() {
    if (this.selectedTab == 'Assistant' && !this.chatHistoryData.length) {
      setTimeout(() => {
        const defQ = document.getElementById('defaultQueries');
        if (defQ) {
          setTimeout(() => {
            defQ.style.maxHeight = `${60 * this.queries.length}px`;
            defQ.classList.add("show");
          }, 10);
        }
      })
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

  toggleHistory() {
    this.onHistory = !this.onHistory;
    !this.onHistory && this.expandDefaultQueries();
  }

  onNewChat() {
    this.fileUploadErrorMessage = '';
    this.attachedFiles = [];
    this.onHistory = false;
    this.showStopButton = false;
    this.isTyping = false;
    this.cleanup();
    this.typingQueue = [];
    clearInterval(this.typingInterval);
    this.typingInterval = null;
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.conversationId = null;
    this.chatHistoryData = [];
    this.resetChatInputModePayload();
    this.expandDefaultQueries();
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
    this.togglePopUp();
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

  stopResponse() {
    this.fileUploadErrorMessage = '';
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
    this.service.getDocuments(this.conversationId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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
    this.service.uploadDocument(files, this.conversationId, this.userInfoService.userOrgId, this.userInfoService.userDetails.id)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res) => {
          this.conversationId = res.conversation_id;
          this.fileUploadLoader = false;
          this.conversationId && this.getDocuments();
        },
        error: (error: HttpErrorResponse) => {
          // this.fileUploadErrorMessage = 'Failed to upload file, please try agin.';
          this.fileUploadLoader = false;
        }
      });
  }

  removeFile(file: any) {
    // this.attachedFiles = this.attachedFiles.filter(f => f !== file);
    this.service.deleteDocument(file.document_id, this.conversationId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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
    this.service.getTokenUsage(this.userInfoService.userOrgId, this.userInfoService.userDetails.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: TokenUsage) => {
      // this.tokenUsageData = res;
      this.tokenUsageData = this.service.convertToTokenUsageViewData(res);
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
