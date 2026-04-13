import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { UnityAssistantChatHistory, UnityAssistantHistory } from '../uc-history.type';
import { UchChatService } from './uch-chat.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { takeUntil } from 'rxjs/operators';
import { IPageInfo, VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { FormGroup } from '@angular/forms';
import { ChatHistoryData, UnityChatBot } from '../../unity-chatbot.type';
import { HttpErrorResponse } from '@angular/common/http';
import { SupportedLLMConfigData } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.type';
import { Router } from '@angular/router';
// import { EventEmitter } from 'stream';

@Component({
  selector: 'uch-chat',
  templateUrl: './uch-chat.component.html',
  styleUrls: ['./uch-chat.component.scss'],
  providers: [UchChatService]
})
export class UchChatComponent implements OnInit, OnDestroy {

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.active-ai-modal-model-selector')) {
      this.showModelDropdown = false;
    }
  }
  constructor(private service: UchChatService,
    private userService: UserInfoService,
    private router: Router) {
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
    this.getAIModels();
    this.buildForm();
    this.chatCurrentCriteria.params[0].conversation_id = this.selectedHistory.conversation_id;
    this.getChats();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // getChats() {
  //   this.isLoadingChats = true;
  //   this.service.getChats(this.chatCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     const reversed = [...res.results].reverse();
  //     if (this.isFirstLoad) {
  //       this.infiniteChats = reversed;
  //       this.chatHistoryData = this.mapToChatHistory(this.infiniteChats);
  //       this.isFirstLoad = false;
  //       // this.shouldScrollToBottom = true;
  //       setTimeout(() => {
  //         this.virtualScroller.scrollToIndex(this.infiniteChats.length - 1, false);
  //         // this.allowFetch = true;
  //       });

  //       setTimeout(() => {
  //         this.allowFetch = true;

  //       }, 300)
  //     } else {
  //       const firstVisibleIndex = this.virtualScroller.viewPortInfo.startIndex;

  //       const newItemsCount = reversed.length;

  //       this.infiniteChats = [...reversed, ...this.infiniteChats];
  //       this.chatHistoryData = this.mapToChatHistory(this.infiniteChats);

  //       setTimeout(() => {
  //         this.virtualScroller.scrollToIndex(firstVisibleIndex + newItemsCount, false);
  //         this.allowFetch = true;
  //       });
  //     }
  //     this.hasMoreChats = this.infiniteChats.length < res.count;
  //     this.isLoadingChats = false;
  //   });
  // }

  // fetchMoreChats(event: IPageInfo) {
  //   console.log('vsStart fired', {
  //     startIndex: event.startIndex,
  //     allowFetch: this.allowFetch,
  //     isLoadingChats: this.isLoadingChats,
  //     hasMoreChats: this.hasMoreChats,
  //     waitingForScrollAway: this.waitingForScrollAway
  //   });
  //   const startIndex = event.startIndex ?? 0;
  //   if (startIndex <= 0 && this.allowFetch && !this.isLoadingChats && this.hasMoreChats && !this.isFirstLoad
  //   ) {
  //     this.allowFetch = false;
  //     this.chatCurrentCriteria.pageNo++;
  //     this.getChats();
  //   }
  // }

  @ViewChild('chatContainer') chatContainer: ElementRef;
  onScroll() {
    const el = this.chatContainer.nativeElement;
    if (el.scrollTop <= 40 && !this.isLoadingChats && this.hasMoreChats) {
      this.chatCurrentCriteria.pageNo++;
      this.getChats();
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
      this.getResponse(this.form.get('chat').value);
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

  showModelDropdown = false;
  activeModel: SupportedLLMConfigData;
  llmModels: SupportedLLMConfigData[] = [];
  typingQueue: string[] = [];
  showStopButton: boolean = false;
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
    })
  }

  toggleDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
  }

  changeActiveModel(model: SupportedLLMConfigData) {
    if (this.activeModel?.id === model.id) {
      this.showModelDropdown = false;
      return;
    }

    if (model.is_user_owned) {
      this.activeModel.active_for_applications = this.activeModel.active_for_applications.filter(app => app != 'assistant');
      model.active_for_applications.push('assistant');
      this.changeActiveModelToSelected(model);
    } else {
      // this.goToConfig(model);
    }

  }

  changeActiveModelToSelected(model: SupportedLLMConfigData) {
    this.showModelDropdown = false;
    this.service.changeActiveModel('Assistant', model).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.activeModel = model;
    }, err => {

    })
  }

  goToConfig(model: SupportedLLMConfigData) {
    // this.togglePopUp();
    this.router.navigate(['/settings/profile/add-model']);
  }

  getModelItemClass(model: SupportedLLMConfigData) {
    return {
      'active-model-item': model.active_for_applications?.includes('assistant'),
      'bg-light text-muted': !model.is_user_owned
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
}
