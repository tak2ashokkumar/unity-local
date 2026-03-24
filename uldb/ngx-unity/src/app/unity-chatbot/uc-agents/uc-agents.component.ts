import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatHistoryData, UnityChatBot, UntiyChatBotExploreMenu } from '../unity-chatbot.type';
import { ModuleIcons, StaticModules, UcAgentsService } from './uc-agents.service';
import { Router } from '@angular/router';
import { AIAgentsModule, NetworkAgent } from './uc-agents.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'uc-agents',
  templateUrl: './uc-agents.component.html',
  styleUrls: ['./uc-agents.component.scss'],
  providers: [UcAgentsService],
  host: {
    'class': 'd-flex flex-column h-100'
  }
})
export class UcAgentsComponent implements OnInit, OnDestroy, AfterViewChecked {

  private ngUnsubscribe = new Subject();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  form: FormGroup;
  resetThread: boolean = false;
  chatHistoryData: Array<ChatHistoryData> = [];
  previousResponse: UnityChatBot;
  isTyping: boolean = false;
  shouldScroll: boolean = false;
  modules: AIAgentsModule[] = [];
  queries: string[] = [];
  currentRouteUrl: string = ''
  showCommonQueries: boolean = true;
  commonQueries: string[] = [];
  zIndex: string = '2155';
  isHovered: boolean = false;
  activeModule: UntiyChatBotExploreMenu;
  feedbackForm: FormGroup;
  threadId: string = '';
  accessToken: string = '';
  moduleSpinner: boolean = false;
  comingSoon: boolean = false;
  apiUrl: string = '';

  constructor(private service: UcAgentsService,
    private router: Router,
    private userInforService: UserInfoService) { }

  ngOnInit(): void {
    this.buildForm();
    this.getModuleNames();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  getResponse(chat: string, isDefault?: boolean) {
    this.isTyping = true;
    // const prevQueryMetaData = !this.previousResponse || this.previousResponse?.reset_thread ? {} : { 'prev_query_id': this.previousResponse?.query_id, 'prev_chat': this.previousResponse?.messages }
    // let postData = { query: chat, is_new: !this.previousResponse || this.previousResponse?.reset_thread, order: this.previousResponse?.order, prev_query_metadata: prevQueryMetaData, source_page: this.router.url }
    // postData['is_default'] = isDefault ?? false;
    // postData['module'] = this.modules.find(m => m.isActive)?.name ?? this.activeModule?.module_name ?? '';
    let postData = { customer_id: this.userInforService.userOrgId, query: chat };
    // const isFirst = this.chatHistoryData.length > 1 ? false : true;
    this.service.getResponse(postData, this.accessToken, this.apiUrl).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: NetworkAgent) => {
      // this.previousResponse = res;
      this.isTyping = false;
      this.manageResponse(res);
      // this.chatHistoryData.push({ user: 'bot', message: res.response });
      // this.resetThread = res.reset_thread;
      this.shouldScroll = false;
      // if (this.resetThread) {
      //   setTimeout(() => this.scrollToBottom(), 0);
      // }
      // this.threadId = res.thread_id;
    }, (err: HttpErrorResponse) => {
      this.isTyping = false;
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
      // this.resetThread = true;
      this.shouldScroll = false;
    });
  }

  getModuleNames() {
    this.moduleSpinner = true;
    this.service.getModuleNames().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modules = [...res, ...StaticModules].map(module => ({
        ...module,
        isActive: false,
        icon: ModuleIcons[module.name] || ""
      }));
      this.manageActiveModule(this.modules.getFirst());
      this.moduleSpinner = false;
    }, (err: HttpErrorResponse) => {
      this.moduleSpinner = false;
    });
  }

  manageActiveModule(module: AIAgentsModule, unCheck?: boolean) {
    if (module.isActive && module.isActive == this.modules.find(m => m.name == module.name).isActive) {
      if (unCheck) {
        this.queries = [];
        module.isActive = !module.isActive;
      }
      return;
    }

    this.apiUrl = module.url;
    this.accessToken = module.access_token;
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
            if (!module.queries.length) {
              this.comingSoon = true;
            } else {
              this.comingSoon = false;
            }
          }, 10);
        }, 600);
      } else {
        this.queries = this.modules.find(m => m.isActive)?.queries || [];
        defQ.style.maxHeight = `${60 * this.queries.length}px`;
        defQ.classList.add("show");
        if (!module.queries.length) {
          this.comingSoon = true;
        } else {
          this.comingSoon = false;
        }
      }
    } else {
      this.queries = this.modules.find(m => m.isActive)?.queries || [];
    }
  }

  manageResponse(res: NetworkAgent) {
    if (res.response) {
      this.chatHistoryData.push({ user: 'bot', message: (res.response as string), type: 'text' });
    } else {
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    }
    // if (res.response.length && res.response.length == 1) {
    //   if (res.response[0].type == 'text') {
    //     this.chatHistoryData.push({ user: 'bot', message: (res.response[0].data as string), type: 'text' });
    //   }
    //  else if (res.response[0].type == 'table') {
    //   const tableData = this.tableService.convertToTableViewData(res.response[0].data as UnityChatBotResponseTableData);
    //   this.chatHistoryData.push({ user: 'bot', message: (tableData as ChatbotTableViewData), type: 'table' });
    // } else if (res.response[0].type == 'pie_chart') {
    //   const chartData = this.chartService.convertToPieChartViewData(res.response[0].data as UnityChatBotResponseChartData);
    //   this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    // } else if (res.response[0].type == 'bar_chart') {
    //   const chartData = this.chartService.convertToBarChartViewData(res.response[0].data as UnityChatBotResponseChartData);
    //   this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    // } else if (res.response[0].type == 'donut_chart') {
    //   const chartData = this.chartService.convertToPieChartViewData(res.response[0].data as UnityChatBotResponseChartData, res.response[0].type);
    //   this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    // }
    //   else {
    //     this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    //   }
    // } else if (res.response.length && res.response.length > 1) {
    //   let responseArray = res.response;
    //   responseArray = res.response.sort((a, b) => a.order - b.order);
    //   responseArray.forEach(r => {
    //     if (r.type == 'text') {
    //       this.chatHistoryData.push({ user: 'bot', message: (r.data as string), type: 'text' });
    //     }
    //     // else if (r.type == 'table') {
    //     //   const tableData = this.tableService.convertToTableViewData(r.data as UnityChatBotResponseTableData);
    //     //   this.chatHistoryData.push({ user: 'bot', message: (tableData as ChatbotTableViewData), type: 'table' });
    //     // } else if (r.type == 'pie_chart') {
    //     //   const chartData = this.chartService.convertToPieChartViewData(r.data as UnityChatBotResponseChartData);
    //     //   this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //     // } else if (r.type == 'bar_chart') {
    //     //   const chartData = this.chartService.convertToBarChartViewData(r.data as UnityChatBotResponseChartData);
    //     //   this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //     // } else if (r.type == 'donut_chart') {
    //     //   const chartData = this.chartService.convertToPieChartViewData(r.data as UnityChatBotResponseChartData, r.type);
    //     //   this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
    //     // }
    //   })
    // } else {
    //   this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    // }
    // this.chatHistoryData.getLast()['liked'] = false;
    // this.chatHistoryData.getLast()['disliked'] = false;
    // this.chatHistoryData.getLast()['comment'] = false;
    // this.chatHistoryData.getLast()['feedbackSubmitted'] = false;
    // this.chatHistoryData.getLast()['botResponseId'] = res.query_id;
    // this.chatHistoryData.getLast()['feedbackIconTooltip'] = 'Feedback';
  }

  buildForm() {
    this.form = this.service.buildForm();
  }

  sumbitQuery(query: string) {
    if (this.isTyping) {
      this.shouldScroll = false;
      return;
    }
    this.isHovered = false;
    this.resetThread = false;
    if (query.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: query, type: 'text' });
      this.getResponse(query, true);
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
      this.getResponse(this.form.get('chat').value);
      this.form.get('chat').setValue('');
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

  onIconHover(module: AIAgentsModule) {
    this.modules.forEach(m => m.isActive = false);
    module.isActive = !module.isActive;
    if (module.name == 'ITSM Agent' || module.name == 'FinOps Agent') {
      this.comingSoon = true;
    } else {
      this.comingSoon = false;
    }
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

  onLike(index: number) {
    this.chatHistoryData[index].liked = !this.chatHistoryData[index].liked
    this.chatHistoryData[index].liked && (this.chatHistoryData[index].disliked = false);
    this.chatHistoryData[index].liked && this.submitReaction({ reaction: 'like' }, this.chatHistoryData[index].botResponseId);
    this.chatHistoryData[index].liked || this.submitReaction({ reaction: 'none' }, this.chatHistoryData[index].botResponseId);
  }

  onDislike(index: number) {
    this.chatHistoryData[index].disliked = !this.chatHistoryData[index].disliked
    this.chatHistoryData[index].disliked && (this.chatHistoryData[index].liked = false);
    this.chatHistoryData[index].disliked && this.submitReaction({ reaction: 'dislike' }, this.chatHistoryData[index].botResponseId);
    this.chatHistoryData[index].disliked || this.submitReaction({ reaction: 'none' }, this.chatHistoryData[index].botResponseId);
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

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }
}
