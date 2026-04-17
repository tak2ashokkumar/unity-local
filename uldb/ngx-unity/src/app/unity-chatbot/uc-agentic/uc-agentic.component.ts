import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChatHistoryData, UcAgenticService, WorkflowType } from './uc-agentic.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ExecutionStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { cloneDeep as _clone } from 'lodash-es';
@Component({
  selector: 'uc-agentic',
  templateUrl: './uc-agentic.component.html',
  styleUrls: ['./uc-agentic.component.scss']
})
export class UcAgenticComponent implements OnInit {

  @Input() chatbotData;
  private ngUnsubscribe = new Subject<void>();
  workflowName = '';
  welcomeMessage = '';
  sessionId = '';
  isTyping = true;
  firstMessage = '';
  newMessage = '';
  chatHistoryData: ChatHistoryData[] = [];
  // @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;
  @ViewChild('messagesContainer') chatBody?: ElementRef<HTMLDivElement>;
  workflowNames: WorkflowType[];
  showHotKeys = true;
  botData = {
    entityId: '',
    entity: '',
    apiUrl: ''
  }
  moduleSpinner: boolean = false;

  constructor(
    private svc: UcAgenticService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService
  ) { }


  ngOnInit(): void {
    // initial boot using current chatbotData
    this.applyChatbotData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatbotData'] && !changes['chatbotData'].firstChange) {
      // respond to new input after init
      this.applyChatbotData();
      // if OnPush and the change originates outside Angular zone, consider:
      // this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private applyChatbotData(): void {
    if (this.chatbotData?.entityId) {
      this.showHotKeys = false;
      // reset state before loading chat for new entity
      this.chatHistoryData = [];
      this.newMessage = '';
      this.isTyping = false;
      this.sessionId = '';
      this.workflowName = '';
      this.welcomeMessage = '';
      this.getStartingChat();
    } else {
      this.showHotKeys = true;
      // load workflows when no entity selected
      this.chatHistoryData = [];
      this.newMessage = '';
      this.isTyping = false;
      this.sessionId = '';
      this.workflowName = '';
      this.welcomeMessage = '';
      this.getWorkflowList();
    }
  }

  getWorkflowList() {
    this.moduleSpinner = true;
    this.svc.getWorkflowList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.workflowNames = data;
      this.moduleSpinner = false;
    }, (err: HttpErrorResponse) => {
      this.moduleSpinner = false;
    });
  }

  getStartingChat() {
    this.showHotKeys = false;
    this.svc.getStartingChat(this.chatbotData?.apiUrl).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        this.welcomeMessage = res?.welcome_message ?? 'Hello! How can I assist you today?';
        this.workflowName = res?.name ?? this.workflowName;
        this.sessionId = res?.session_id ?? this.sessionId;
        this.chatHistoryData.push({ sender: 'bot', message: this.welcomeMessage });
      },
      (err: HttpErrorResponse) => {
        this.welcomeMessage = 'Hello! How can I assist you today?';
        // this.notification.error(new Notification('Failed to get Workflow Chat Details.'));
      }
    );
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
    this.chatHistoryData.push({ sender: 'user', message: text });

    if (message === this.firstMessage) this.firstMessage = '';
    if (message === this.newMessage) this.newMessage = '';
    this.scrollToBottom('auto', true);

    setTimeout(() => this.scrollToBottom('smooth'), 60);

    const req = { query: text, session_id: this.sessionId };
    let runningMessageIndex: number | null = null;

    this.svc.getExecutionId(req, this.chatbotData?.entityId).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (status: ExecutionStatus) => {
        if (status.status === 'Running') {
          this.isTyping = false;
          if (runningMessageIndex === null) {
            runningMessageIndex = this.chatHistoryData.push({
              sender: 'bot',
              message: status.output,
              status: 'Running'
            }) - 1;
          } else {
            this.chatHistoryData[runningMessageIndex].message = status.output;
            this.chatHistoryData[runningMessageIndex].status = 'Running';
          }
        } else {
          // terminal status: Success or Failed
          if (runningMessageIndex !== null) {
            this.chatHistoryData[runningMessageIndex].message = status.output;
            this.chatHistoryData[runningMessageIndex].status = status.status;
          } else {
            this.chatHistoryData.push({
              sender: 'bot',
              message: status.output,
              status: status.status
            });
          }
          runningMessageIndex = null;
          this.isTyping = false;
        }
        this.scrollToBottom('smooth');
      },
      error: (err: any) => {
        this.isTyping = false;
        this.chatHistoryData.push({
          sender: 'bot',
          message: 'An error occurred while processing your request. Please try again later.',
          status: 'Failed'
        });

        this.scrollToBottom('smooth');
      },
      complete: () => { this.isTyping = false; }
    });
  }


  // private scrollToBottom(behavior: 'smooth' | 'auto' = 'auto') {
  //   try {
  //     const el = this.chatBody?.nativeElement;
  //     if (el) {
  //       setTimeout(() => {
  //         try {
  //           el.scrollTo({ top: el.scrollHeight, behavior });
  //         } catch (e) {
  //           el.scrollTop = el.scrollHeight;
  //         }
  //       }, 10);
  //     } else {
  //       try {
  //         window.scrollTo({ top: document.body.scrollHeight, behavior });
  //       } catch (e) {
  //       }
  //     }
  //   } catch (e) {
  //   }
  // }

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

  selectHotKey(wf) {
    this.chatbotData = {
      entityId: wf.uuid,
      apiUrl: `/rest/orchestration/agentic_workflow/${wf.uuid}/chat/`,
      entity: wf.name
    };

    // Reset state
    this.chatHistoryData = [];
    this.newMessage = '';
    this.isTyping = false;
    this.sessionId = '';
    this.workflowName = '';
    this.welcomeMessage = '';

    this.getStartingChat();
  }
  returnAgentic() {
    this.chatbotData = { entityId: '', apiUrl: '', entity: '' };
    this.chatHistoryData = [];
    this.newMessage = '';
    this.isTyping = false;
    this.sessionId = '';
    this.workflowName = '';
    this.welcomeMessage = '';
    this.showHotKeys = true;
    this.getWorkflowList();
  }
}
