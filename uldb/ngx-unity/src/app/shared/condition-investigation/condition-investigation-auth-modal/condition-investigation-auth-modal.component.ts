import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { GET_AGENT_CONFIGURATIONS } from '../../api-endpoint.const';
import { ConditionInvestigationFloatingTerminalService } from '../condition-investigation-floating-terminal/condition-investigation-floating-terminal.service';
import { ConditionInvestigationAuthModalService } from './condition-investigation-auth-modal.service';
import { ConditionInvestigationTerminalWindowRegistryService } from '../condition-investigation-new-terminal/condition-investigation-terminal-window-registry.service';
import { UserInfoService } from '../../user-info.service';
import { CliCommandContext, ConditionInvestigationCliCommandService } from '../condition-investigation-cli-command.service';
import { DATABASE_AGENT_APPLICATION, DATABASE_CONNECTION_TYPE, DATABASE_ENGINE_DEFAULT_PORTS, DATABASE_ENGINE_OPTIONS } from '../condition-investigation-db-connection.const';

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
  pendingCommandContext: CliCommandContext | null = null;
  showMakeDefaultCheckbox = false;
  readonly databaseConnectionType = DATABASE_CONNECTION_TYPE;
  readonly databaseEngineOptions = DATABASE_ENGINE_OPTIONS;

  private ngUnsubscribe = new Subject();

  constructor(private modalService: BsModalService,
    private fb: FormBuilder,
    private http: HttpClient,
    private terminalService: ConditionInvestigationNewTerminalService,
    private floatingTerminalService: ConditionInvestigationFloatingTerminalService,
    private svc: ConditionInvestigationAuthModalService,
    private windowRegistry: ConditionInvestigationTerminalWindowRegistryService,
    private userInfoService: UserInfoService,
    private cliCommandService: ConditionInvestigationCliCommandService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.terminalService.openModal$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((context: CliCommandContext | null) => {
        this.pendingCommandContext = context || this.terminalService.getPendingCommandContext();
        const savedDevice = this.pendingCommandContext?.device;
        this.showMakeDefaultCheckbox = !!(this.pendingCommandContext?.conditionId && this.pendingCommandContext?.command);
        this.prefillAuthForm(savedDevice);
        this.getCollectors(savedDevice?.collector_uuid);
        this.modalRef = this.modalService.show(this.authModal, { class: 'modal-md', ignoreBackdropClick: true });
      });

    this.terminalService.conversationId$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(id => {
        this.conversationId = id;
      });

    this.authForm.get('connection_type')!.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((connection_type: string) => {
      this.applyConnectionTypeRules(connection_type);
    });

    this.authForm.get('engine')!.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((engine: string) => {
      if (this.isDatabase && engine) {
        this.authForm.patchValue({ port: DATABASE_ENGINE_DEFAULT_PORTS[engine] }, { emitEvent: false });
      }
    });
  }

  get isWindows(): boolean {
    return this.authForm.get('connection_type')?.value === 'winrm';
  }

  get isDatabase(): boolean {
    return this.authForm.get('connection_type')?.value === DATABASE_CONNECTION_TYPE;
  }

  getCollectors(preferredCollectorUuid?: string) {
    const params = new HttpParams().set('page_size', '0');
    this.http.get<any[]>(GET_AGENT_CONFIGURATIONS(), { params })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any[]) => {
        this.collectors = res || [];
        const collectorUuid = preferredCollectorUuid || this.collectors[0]?.uuid;
        if (preferredCollectorUuid) {
          this.authForm.patchValue({
            collector: {
              uuid: collectorUuid
            }
          }, { emitEvent: false });
        }
      });
  }

  buildForm() {
    this.authForm = this.fb.group({
      connection_type: ['ssh', Validators.required],
      engine: [''],
      host: ['', Validators.required],
      port: [22, [Validators.required, Validators.min(1)]],
      database: [''],
      username: ['', Validators.required],
      password: ['', Validators.required],
      transport: ['ntlm'],
      shell: ['cmd'],
      collector: this.fb.group({
        uuid: ['']
      }),
      make_default_for_condition: [false]
    });

    this.formErrors = {
      host: '', port: '', username: '', password: '', invalidCred: '',
      connection_type: '', engine: '', database: '', transport: '', shell: '', collector: { uuid: '' }
    };

    this.validationMessages = {
      host: { required: 'Host is required' },
      port: { required: 'Port is required', min: 'Min 1' },
      database: { required: 'Database name is required' },
      username: { required: 'Username required' },
      password: { required: 'Password required' },
      connection_type: { required: 'OS/Connection Type is required' },
      engine: { required: 'DB Engine is required' },
      collector: { uuid: '' }
    };
  }

  onSubmit() {
    this.setFormErrors();
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.setFormErrors();
      return;
    }
    const payload = this.authForm.getRawValue();
    console.log(payload);
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
      ...(payload.connection_type === DATABASE_CONNECTION_TYPE && {
        engine: payload.engine,
        database: payload.database,
      }),
      ...(payload.connection_type === 'winrm' && {
        transport: payload.transport,
        shell: payload.shell,
      }),
    };

    this.modalRef.hide();

    const cmd = localStorage.getItem('terminal_command');
    const commandContext = this.pendingCommandContext || this.terminalService.getPendingCommandContext();

    if (commandContext?.command) {
      const device = {
        device_name: payload.host,
        host: payload.host,
        port: payload.port,
        username: payload.username,
        password: payload.password,
        collector_uuid: payload.collector.uuid,
        connection_type: payload.connection_type,
        engine: payload.connection_type === DATABASE_CONNECTION_TYPE ? payload.engine : null,
        database: payload.connection_type === DATABASE_CONNECTION_TYPE ? payload.database : null,
        transport: payload.connection_type === 'winrm' ? payload.transport : null,
        shell: payload.connection_type === 'winrm' ? payload.shell : null,
      };

      if (payload.make_default_for_condition) {
        this.cliCommandService.saveDefaultDevice(commandContext, device)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => { }, () => { });
      }

      this.cliCommandService.executeWithCredentials(commandContext, device)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.terminalService.clearPendingCommandContext();
          this.pendingCommandContext = null;
        }, () => {
          this.terminalService.clearPendingCommandContext();
          this.cliCommandService.setActiveCommandContext(null);
          this.pendingCommandContext = null;
        });
      return;
    }

    // no command = came from icon buttons, skip API call, open fresh terminal
    if (!cmd) {
      if (pendingType === 'sameTab') {
        this.terminalService.openTerminalDirect(input, auth);
      } else {
        const newWin = window.open(
          `/main#/terminal-new-tab?conversationId=${conversationId}&tabId=${tabId}`,
          '_blank'
        );
        if (newWin) {
          this.windowRegistry.register(tabId, newWin);
          this.sendTerminalDataToNewTab(tabId, input, auth);
        }
      }
      return;
    }

    // command exists = came from command execution, call API
    const tabParam = pendingType === 'sameTab' ? 'same' : 'new';
    const shell = payload.connection_type === 'winrm' ? payload.shell : '';
    this.svc.getTab(tabParam, conversationId, payload.host, shell, {
      connection_type: payload.connection_type === DATABASE_CONNECTION_TYPE ? payload.connection_type : undefined,
      engine: payload.connection_type === DATABASE_CONNECTION_TYPE ? payload.engine : undefined,
      database: payload.connection_type === DATABASE_CONNECTION_TYPE ? payload.database : undefined,
    }).subscribe((res: any) => {
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
        const newWin = window.open(
          `/main#/terminal-new-tab?conversationId=${conversationId}&tabId=${tabId}`,
          '_blank'
        );
        if (newWin) {
          this.windowRegistry.register(tabId, newWin);
          this.sendTerminalDataToNewTab(tabId, input, auth);
        }
      }
    });
  }

  prefillAuthForm(device?: any) {
    const host = device?.host || device?.device_ip_address || '';
    const connectionType = device?.connection_type || (this.pendingCommandContext?.application === DATABASE_AGENT_APPLICATION ? DATABASE_CONNECTION_TYPE : 'ssh');
    const engine = connectionType === DATABASE_CONNECTION_TYPE ? (device?.engine || 'postgres') : '';
    this.authForm.reset({
      connection_type: connectionType,
      engine,
      host,
      port: Number(device?.port || this.defaultPort(connectionType, engine)),
      database: connectionType === DATABASE_CONNECTION_TYPE ? (device?.database || device?.database_name || '') : '',
      username: device?.username || '',
      password: '',
      transport: device?.transport || 'ntlm',
      shell: device?.shell || 'cmd',
      collector: {
        uuid: device?.collector_uuid || ''
      },
      make_default_for_condition: false
    }, { emitEvent: false });
    this.applyConnectionTypeRules(connectionType, false);
    this.setFormErrors();
  }

  private applyConnectionTypeRules(connectionType: string, updatePort = true) {
    const engineControl = this.authForm.get('engine');
    const databaseControl = this.authForm.get('database');

    if (connectionType === DATABASE_CONNECTION_TYPE) {
      engineControl?.setValidators([Validators.required]);
      databaseControl?.setValidators([Validators.required]);
      if (!engineControl?.value) {
        engineControl?.setValue('postgres', { emitEvent: false });
      }
      if (updatePort) {
        this.authForm.patchValue({ port: DATABASE_ENGINE_DEFAULT_PORTS[engineControl?.value || 'postgres'] }, { emitEvent: false });
      }
    } else {
      engineControl?.clearValidators();
      databaseControl?.clearValidators();
      this.authForm.patchValue({
        engine: '',
        database: '',
        port: updatePort ? (connectionType === 'winrm' ? 5985 : 22) : this.authForm.get('port')?.value
      }, { emitEvent: false });
    }

    [engineControl, databaseControl].forEach(control => control?.updateValueAndValidity({ emitEvent: false }));
    this.setFormErrors();
  }

  private defaultPort(connectionType: string, engine?: string): number {
    if (connectionType === DATABASE_CONNECTION_TYPE) {
      return DATABASE_ENGINE_DEFAULT_PORTS[engine || 'postgres'];
    }
    return connectionType === 'winrm' ? 5985 : 22;
  }

  private setFormErrors() {
    if (!this.authForm || !this.formErrors) {
      return;
    }
    Object.keys(this.formErrors).forEach(field => {
      if (field === 'collector') {
        const collectorUuid = this.authForm.get('collector.uuid');
        this.formErrors.collector.uuid = this.controlError(collectorUuid, this.validationMessages.collector);
        return;
      }
      if (field === 'invalidCred') {
        return;
      }
      this.formErrors[field] = this.controlError(this.authForm.get(field), this.validationMessages[field]);
    });
  }

  private controlError(control: AbstractControl, messages: any): string {
    if (!control || !messages || !control.errors || !(control.touched || control.dirty)) {
      return '';
    }
    const key = Object.keys(control.errors)[0];
    return messages[key] || messages.uuid || '';
  }

  sendTerminalDataToNewTab(tabId: string, input: any, auth: any) {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }
    const channel = new BroadcastChannel('terminal-tabs');
    const payload = {
      type: 'OPEN_TERMINAL',
      tabId,
      terminalData: { input, auth },
    };
    let attempts = 0;
    let interval: any;
    const send = () => {
      channel.postMessage(payload);
      attempts++;
      if (attempts >= 10) {
        clearInterval(interval);
        channel.close();
      }
    };
    send();
    interval = setInterval(send, 250);
  }

  generateTabId(): string {
    return 'tab-' + Math.random().toString(36).substring(2, 10);
  }

  close() {
    this.modalRef.hide();
    if (this.pendingCommandContext?.command) {
      this.terminalService.clearPendingCommandContext();
      this.cliCommandService.setActiveCommandContext(null);
      this.pendingCommandContext = null;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
