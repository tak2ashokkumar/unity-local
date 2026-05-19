import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NaciNewTerminalService } from '../naci-new-terminal/naci-new-terminal.service';
import { GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';

@Component({
  selector: 'naci-auth-modal',
  templateUrl: './naci-auth-modal.component.html',
  styleUrls: ['./naci-auth-modal.component.scss']
})
export class NaciAuthModalComponent implements OnInit {

  @ViewChild('authModal') authModal: TemplateRef<any>;
  modalRef: BsModalRef;

  authForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  conversationId: string;
  collectors: any[] = [];

  private ngUnsubscribe = new Subject();
  private registerChannel: BroadcastChannel;

  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    private http: HttpClient,
    private terminalService: NaciNewTerminalService
  ) { }

  ngOnInit() {
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
        console.log('Received conversationId:', id);
        this.conversationId = id;
      });
    const saved = localStorage.getItem('last_credentials');
    if (saved) {
      this.authForm.patchValue(JSON.parse(saved));
    }
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
      host: ['', Validators.required],
      port: [22, [Validators.required, Validators.min(1)]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      collector: this.fb.group({
        uuid: ['', Validators.required]
      })
    });
    this.formErrors = {
      host: '', port: '', username: '', password: '', invalidCred: '', collector: { uuid: '' }
    };

    this.validationMessages = {
      host: { required: 'Host is required' },
      port: { required: 'Port is required', min: 'Min 1' },
      username: { required: 'Username required' },
      password: { required: 'Password required' },
      collector: {
        uuid: 'Collector is required'
      }
    };
  }

  // onSubmit() {
  //   const payload = this.authForm.getRawValue();
  //   localStorage.setItem('last_credentials', JSON.stringify(payload));
  //   const conversationId = this.terminalService.getConversationId();
  //   const pendingType = this.terminalService.getPendingTabType();
  //   const backendTabId = this.terminalService.getBackendTabId();
  //   console.log(backendTabId, 'backend tab id after submit');
  //   const input = {
  //     tabId: backendTabId || this.generateTabId(),
  //     deviceName: payload.host,
  //     // managementIp: payload.host,
  //     // port: payload.port,
  //     // userName: payload.username
  //   };

  //   const auth = {
  //     host: payload.host,
  //     port: payload.port,
  //     username: payload.username,
  //     password: payload.password,
  //     conversation_id: conversationId,
  //     tab_type: pendingType === 'sameTab' ? 'same' : 'new',
  //     collector_uuid: payload.collector.uuid
  //   };

  //   this.modalRef.hide();
  //   if (pendingType != 'sameTab') {
  //     const currentUrl = window.location.href;
  //     const [base, hash] = currentUrl.split('#');
  //     if (hash) {
  //       const [path, query] = hash.split('?');
  //       const params = new URLSearchParams(query || '');

  //       // only update URL if tabId wasn't already there
  //       if (!params.get('tabId')) {
  //         params.set('tabId', input.tabId);
  //         const newHash = `${path}?${params.toString()}`;
  //         window.history.replaceState({}, '', `${base}#${newHash}`);
  //       }
  //     }
  //   }
  //   const channel = new BroadcastChannel('terminal-tabs');
  //   channel.postMessage({ type: 'REGISTER', tabId: input.tabId });
  //   console.log(input, 'input and ', auth, ' auth before connecting');
  //   this.terminalService.openTerminalDirect(input, auth);
  // }

  // onSubmit() {
  //   if (this.authForm.invalid) return;

  //   const payload = this.authForm.getRawValue();

  //   // this.http.post('ws://10.192.11.57:8006/ws/terminal/tab-igd3zlz', payload)
  //   //   .pipe(takeUntil(this.ngUnsubscribe))
  //   //   .subscribe(
  //   //     (res: any) => {

  //   //       const config = {
  //   //         ...payload,
  //   //         agent_id: res.agent_id,
  //   //         org_id: res.org_id
  //   //       };

  //   //       this.modalRef.hide();
  //   //       this.terminalService.openTerminalWithConfig(config);
  //   //     },
  //   //     err => {
  //   //       this.formErrors.invalidCred = 'Invalid credentials';
  //   //     }
  //   //   );

  //   const config = {
  //     ...payload
  //   };

  //   const auth = { host: payload.host, port: payload.port, username: payload.username, password: payload.password };
  //   this.modalRef.hide();
  //   this.terminalService.openTerminalWithConfig(config);
  // }

  onSubmit() {
    const payload = this.authForm.getRawValue();
    localStorage.setItem('last_credentials', JSON.stringify(payload));
    const conversationId = this.terminalService.getConversationId();
    const pendingType = this.terminalService.getPendingTabType();
    const backendTabId = this.terminalService.getBackendTabId();
    console.log(backendTabId, 'backend tab id after submit');

    const tabId = backendTabId || this.generateTabId();

    const input = {
      tabId,
      deviceName: payload.host,
    };

    const auth = {
      host: payload.host,
      port: payload.port,
      username: payload.username,
      password: payload.password,
      conversation_id: conversationId,
      tab_type: pendingType === 'sameTab' ? 'same' : 'new',
      collector_uuid: payload.collector.uuid
    };

    this.modalRef.hide();

    if (pendingType !== 'sameTab') {
      const currentUrl = window.location.href;
      const [base, hash] = currentUrl.split('#');
      if (hash) {
        const [path, query] = hash.split('?');
        const params = new URLSearchParams(query || '');
        if (!params.get('tabId')) {
          params.set('tabId', tabId);
          const newHash = `${path}?${params.toString()}`;
          window.history.replaceState({}, '', `${base}#${newHash}`);
        }
      }
      this.registerChannel = new BroadcastChannel('terminal-tabs');
      let registered = false;

      this.registerChannel.onmessage = (e) => {
        if (e.data.type === 'REGISTER_ACK' && e.data.tabId === tabId) {
          console.log('REGISTER_ACK received in auth component for:', tabId);
          registered = true;
          this.registerChannel.close(); // cleanup once ACK'd
        }
      };

      // Broadcast immediately, then retry every 300ms
      const broadcastRegister = () => {
        console.log('broadcasting REGISTER from auth for tabId:', tabId);
        this.registerChannel.postMessage({ type: 'REGISTER', tabId });
      };

      broadcastRegister(); // immediate

      const interval = setInterval(() => {
        if (registered) {
          clearInterval(interval);
          return;
        }
        broadcastRegister();
      }, 300);

      // Stop after 2s regardless
      setTimeout(() => {
        clearInterval(interval);
        if (!registered) {
          console.warn('REGISTER never ACKd for tabId:', tabId);
        }
      }, 2000);
    }

    console.log(input, 'input and ', auth, ' auth before connecting');
    this.terminalService.openTerminalDirect(input, auth);
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
