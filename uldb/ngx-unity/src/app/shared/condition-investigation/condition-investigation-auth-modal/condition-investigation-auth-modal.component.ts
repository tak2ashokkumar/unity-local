import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { GET_AGENT_CONFIGURATIONS } from '../../api-endpoint.const';
import { ConditionInvestigationFloatingTerminalService } from '../condition-investigation-floating-terminal/condition-investigation-floating-terminal.service';
import { ConditionInvestigationAuthModalService } from './condition-investigation-auth-modal.service';
import { ConditionInvestigationTerminalWindowRegistryService } from '../condition-investigation-new-terminal/condition-investigation-terminal-window-registry.service';
import { UserInfoService } from '../../user-info.service';

@Component({
  selector: 'condition-investigation-auth-modal',
  templateUrl: './condition-investigation-auth-modal.component.html',
  styleUrls: ['./condition-investigation-auth-modal.component.scss']
})
export class ConditionInvestigationAuthModalComponent implements OnInit, OnDestroy {

  @ViewChild('authModal') authModal: TemplateRef<any>;
  modalRef: BsModalRef;

  authForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  conversationId: string;
  collectors: any[] = [];

  private ngUnsubscribe = new Subject();
  private registerChannel: BroadcastChannel;

  constructor(private modalService: BsModalService,
    private fb: FormBuilder,
    private http: HttpClient,
    private terminalService: ConditionInvestigationNewTerminalService,
    private floatingTerminalService: ConditionInvestigationFloatingTerminalService,
    private svc: ConditionInvestigationAuthModalService,
    private windowRegistry: ConditionInvestigationTerminalWindowRegistryService,
    private userInfoService: UserInfoService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.terminalService.openModal$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.getCollectors();
        this.modalRef = this.modalService.show(this.authModal, { class: 'modal-md', ignoreBackdropClick: true });
      });

    this.terminalService.conversationId$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(id => {
        this.conversationId = id;
      });

    this.authForm.get('connection_type')!.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((connection_type: string) => {
      const port = connection_type === 'winrm' ? 5985 : 22;
      this.authForm.patchValue({ port }, { emitEvent: false });
    });
    const saved = localStorage.getItem('last_credentials');
    if (saved) {
      this.authForm.patchValue(JSON.parse(saved));
    }
  }

  get isWindows(): boolean {
    return this.authForm.get('connection_type')?.value === 'winrm';
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    this.http.get<any[]>(GET_AGENT_CONFIGURATIONS(), { params })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any[]) => {
        this.collectors = res || [];
        if (this.collectors.length) {
          this.authForm.patchValue({
            collector: {
              uuid: this.collectors[0].uuid
            }
          });
        }
      });
  }

  buildForm() {
    this.authForm = this.fb.group({
      connection_type: ['ssh', Validators.required],
      host: ['', Validators.required],
      port: [22, [Validators.required, Validators.min(1)]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      transport: ['ntlm'],
      shell: ['cmd'],
      collector: this.fb.group({
        uuid: ['', Validators.required]
      })
    });

    this.formErrors = {
      host: '', port: '', username: '', password: '', invalidCred: '',
      connection_type: '', transport: '', shell: '', collector: { uuid: '' }
    };

    this.validationMessages = {
      host: { required: 'Host is required' },
      port: { required: 'Port is required', min: 'Min 1' },
      username: { required: 'Username required' },
      password: { required: 'Password required' },
      connection_type: { required: 'OS is required' },
      collector: { uuid: 'Collector is required' }
    };
  }

  onSubmit() {
    const payload = this.authForm.getRawValue();
    localStorage.setItem('last_credentials', JSON.stringify(payload));
    const conversationId = this.terminalService.getConversationId();
    const pendingType = this.terminalService.getPendingTabType();
    const tabId = this.generateTabId();
    const input = { tabId, deviceName: payload.host };
    const auth = {
      host: payload.host,
      port: payload.port,
      username: payload.username,
      password: payload.password,
      conversation_id: conversationId,
      tab_type: pendingType === 'sameTab' ? 'same' : 'new',
      collector_uuid: payload.collector.uuid,
      org_id: this.userInfoService.userOrgId,
      user_id: `${this.userInfoService.userDetails.id}`,
      connection_type: payload.connection_type,
      ...(payload.connection_type === 'winrm' && {
        transport: payload.transport,
        shell: payload.shell,
      }),
    };

    this.modalRef.hide();

    const cmd = localStorage.getItem('terminal_command');

    // no command = came from icon buttons, skip API call, open fresh terminal
    if (!cmd) {
      if (pendingType === 'sameTab') {
        this.terminalService.openTerminalDirect(input, auth);
      } else {
        localStorage.setItem('new_tab_input', JSON.stringify(input));
        localStorage.setItem('new_tab_auth', JSON.stringify(auth));
        const newWin = window.open(
          `/main#/terminal-new-tab?conversationId=${conversationId}&tabId=${tabId}`,
          '_blank'
        );
        if (newWin) this.windowRegistry.register(tabId, newWin);
      }
      return;
    }

    // command exists = came from command execution, call API
    const tabParam = pendingType === 'sameTab' ? 'same' : 'new';
    const shell = payload.connection_type === 'winrm' ? payload.shell : '';
    this.svc.getTab(tabParam, conversationId, payload.host, shell).subscribe((res: any) => {
      console.log('getTab res', res);
      const backendTabId = res?.tab_id;

      if (backendTabId) {
        if (pendingType === 'sameTab') {
          this.floatingTerminalService.executeInTerminal(backendTabId, cmd, 'sameTab');
          this.floatingTerminalService.switchToTab(backendTabId);
          localStorage.removeItem('terminal_command');
        } else {
          this.windowRegistry.focus(backendTabId);
          const channel = new BroadcastChannel('terminal-tabs');
          channel.postMessage({ type: 'PING', tabId: backendTabId });
          setTimeout(() => channel.close(), 1000);
        }
        return;
      }

      // no existing tab — open fresh
      if (pendingType === 'sameTab') {
        this.terminalService.openTerminalDirect(input, auth);
      } else {
        localStorage.setItem('new_tab_input', JSON.stringify(input));
        localStorage.setItem('new_tab_auth', JSON.stringify(auth));
        const newWin = window.open(
          `/main#/terminal-new-tab?conversationId=${conversationId}&tabId=${tabId}`,
          '_blank'
        );
        if (newWin) this.windowRegistry.register(tabId, newWin);
      }
    });
  }

  generateTabId(): string {
    return 'tab-' + Math.random().toString(36).substring(2, 10);
  }

  close() {
    this.modalRef.hide();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
