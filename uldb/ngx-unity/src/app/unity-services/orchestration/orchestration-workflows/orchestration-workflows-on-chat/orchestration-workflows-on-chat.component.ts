import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { OrchestrationWorkflowsOnChatService } from './orchestration-workflows-on-chat.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ChatHistoryData } from '../orchestration-workflows.type';
import { ExecutionStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'orchestration-workflows-on-chat',
  templateUrl: './orchestration-workflows-on-chat.component.html',
  styleUrls: ['./orchestration-workflows-on-chat.component.scss'], providers: [OrchestrationWorkflowsOnChatService]
})
export class OrchestrationWorkflowsOnChatComponent implements OnInit {

  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;

  // started = false;
  private ngUnsubscribe = new Subject<void>();
  workflowId: string | null = null;
  workflowName = '';
  welcomeMessage = '';
  sessionId = '';
  isTyping = false;

  firstMessage = '';
  newMessage = '';
  chatHistoryData: ChatHistoryData[] = [];
  sampleMsg = `**Follow these steps to create a new Task:**

1. Go to the Unitiy AI portal.  
2. **Navigate** to **UnityServices > DevOps Automation**.  
3. Click on the **'Task' tab'**.  
4. Click on the **'Create Task' button**.  
5. **Provide the required details:**  
   - **Name**  
   - **Description**  
   - **Category**  
   - **Target type**  
   - **Output type**  

Once all details are provided, click **'Submit'** to create the Task.
  `;
  constructor(
    private svc: OrchestrationWorkflowsOnChatService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService
  ) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workflowId = params.get('workflowId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getStartingChat();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getStartingChat() {
    this.svc.getStartingChat(this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        this.welcomeMessage = res?.welcome_message ?? 'Hello! How can I assist you today?';
        this.workflowName = res?.name ?? this.workflowName;
        this.sessionId = res?.session_id ?? this.sessionId;
        this.chatHistoryData.push({ sender: 'bot', message: this.welcomeMessage });
        this.spinner.stop('main');
      },
      (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.welcomeMessage = 'Hello! How can I assist you today?';
        this.notification.error(new Notification('Failed to get Workflow Chat Details.'));
      }
    );
  }

  // send(message: string | undefined) {
  //   const text = (message ?? '').trim();
  //   if (!text || this.isTyping) return;

  //   // mark started (will switch inputs)
  //   // this.started = true;
  //   this.isTyping = true;

  //   // add user message to UI
  //   this.chatHistoryData.push({ sender: 'user', message: text });

  //   // clear inputs that were used
  //   if (message === this.firstMessage) this.firstMessage = '';
  //   if (message === this.newMessage) this.newMessage = '';

  //   // ensure UI has switched to chat view before scrolling
  //   setTimeout(() => this.scrollToBottom('smooth'), 60);

  //   // backend call
  //   const req = { query: text, session_id: this.sessionId };
  //   this.svc.getExecutionId(req, this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
  //     res => {
  //       this.isTyping = false;
  //       console.log(res,'response')
  //       // this.svc.getOnChatResponse(req)
  //       // allow rendering
  //       setTimeout(() => this.scrollToBottom('smooth'), 60);
  //     },
  //     (err: HttpErrorResponse) => {
  //       this.isTyping = false;
  //       console.log(err.error,'response')
  //       this.spinner.stop('main');
  //       // this.notification.error(new Notification('Failed to get On Chat Response'));
  //       setTimeout(() => this.scrollToBottom('smooth'), 60);
  //     }

  //     // const botReply = res?.response ?? 'Sorry, I did not get a response.';
  //     // this.chatHistoryData.push({ sender: 'bot', message: botReply });
  //   );
  // }

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

    setTimeout(() => this.scrollToBottom('smooth'), 60);

    const req = { query: text, session_id: this.sessionId };
    let runningMessageIndex: number | null = null;

    this.svc.getExecutionId(req, this.workflowId).pipe(
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
      complete: () => { this.isTyping = false; }
    });
  }


  private scrollToBottom(behavior: 'smooth' | 'auto' = 'auto') {
    try {
      const el = this.chatBody?.nativeElement;
      if (el) {
        // small delay to allow DOM updates
        setTimeout(() => {
          try {
            el.scrollTo({ top: el.scrollHeight, behavior });
          } catch (e) {
            el.scrollTop = el.scrollHeight;
          }
        }, 10);
      } else {
        // fallback
        try {
          window.scrollTo({ top: document.body.scrollHeight, behavior });
        } catch (e) {
          /* ignore */
        }
      }
    } catch (e) {
      // ignore
    }
  }

  back() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
