import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription, timer } from 'rxjs';
import { ChatHistoryData } from 'src/app/unity-chatbot/unity-chatbot.type';
import { environment } from 'src/environments/environment';
import { NaciChatbotService } from './naci-chatbot.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { NetworkAgentsChatResponseType } from './naci-chatbot.type';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportedLLMConfigData } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.type';

@Component({
  selector: 'naci-chatbot',
  templateUrl: './naci-chatbot.component.html',
  styleUrls: ['./naci-chatbot.component.scss'],
  providers: [NaciChatbotService]
})
export class NaciChatbotComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Chatbot_Logo.svg`;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @Input() conditionId: string;
  @Output() chatResponse = new EventEmitter<NetworkAgentsChatResponseType>();

  chatHistoryData: Array<ChatHistoryData> = [];
  form: FormGroup;
  isTyping: boolean = false;
  waitMessage: string = 'Thinking'
  private timerSub: Subscription;
  shouldScroll: boolean = false;
  conversationId: string = null;
  title: string;

  constructor(private service: NaciChatbotService,
    private userInfoService: UserInfoService,
    private router: Router,
    private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.conversationId = params['conversation_id'] || null;
      this.title = params['title'] || '';
    });
  }

  ngOnInit(): void {
    this.getAIModels();
    const firstQuery = `Create a investigation plan and remediation steps along with RCA to resolve the condition ${this.conditionId}`
    this.getResponse(firstQuery);
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getResponse(chat: string) {
    setTimeout(() => { this.scrollToBottom(); });
    this.isTyping = true;
    let postData = {
      query: chat,
      org_id: this.userInfoService.userOrgId,
      user_id: `${this.userInfoService.userDetails.id}`,
      application: 'Network Agent',
      count: 0,
      conversation_id: this.conversationId,
      role: 'User',
      streaming: false,
      title: this.title
    }
    this.startWaitMessages();
    if (chat.includes('Exit')) {
      this.goBack();
      return;
    }
    this.service.getResponse(postData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isTyping = false;
      this.manageResponse(res);
      this.conversationId = res.conversation_id;
      if (res.answer.recommended_actions && this.chatHistoryData.length > 1) {
        setTimeout(() => {
          this.scrollToBottom();
          this.shouldScroll = false;
        }
        );
      } else {
        this.shouldScroll = false;
      }
      this.cleanup();
      this.chatResponse.emit(res);
    }, (err: HttpErrorResponse) => {
      this.chatResponse.emit(null);
      this.isTyping = false;
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
      this.shouldScroll = false;
      this.cleanup();
    });
  }

  manageResponse(res: any) {
    if (res.answer.answer) {
      this.chatHistoryData.push({ user: 'bot', message: (res.answer.answer as string), type: 'text' });
      this.chatHistoryData.getLast()['actions'] = res.answer.recommended_actions.map(ra => {
        return {
          name: ra,
          isDisabled: false
        }
      });
    } else {
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    }
  }

  buildForm() {
    this.form = this.service.buildForm();
  }

  onSubmit() {
    if (this.isTyping) {
      this.shouldScroll = false;
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
    if (query.trim()) {
      this.shouldScroll = true;
      this.chatHistoryData.push({ user: 'user', message: query, type: 'text' });
      this.getResponse(query + ' for ' + this.conditionId);
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
      console.log(this.showModelDropdown);
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
}
