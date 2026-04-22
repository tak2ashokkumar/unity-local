import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NaciNewTerminalService } from '../naci-new-terminal/naci-new-terminal.service';

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

  private ngUnsubscribe = new Subject();

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
        this.modalRef = this.modalService.show(this.authModal, { class: 'modal-md', ignoreBackdropClick: true });
      });

    this.terminalService.conversationId$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(id => {
        console.log('Received conversationId:', id);
        this.conversationId = id;
      });
  }

  buildForm() {
    this.authForm = this.fb.group({
      host: ['', Validators.required],
      port: [22, [Validators.required, Validators.min(1)]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.formErrors = {
      host: '', port: '', username: '', password: '', invalidCred: ''
    };

    this.validationMessages = {
      host: { required: 'Host is required' },
      port: { required: 'Port is required', min: 'Min 1' },
      username: { required: 'Username required' },
      password: { required: 'Password required' }
    };
  }

  onSubmit() {
    const payload = this.authForm.getRawValue();
    const conversationId = this.terminalService.getConversationId();
    const input = {
      deviceId: this.generateTabId(),
      deviceName: payload.host,
      managementIp: payload.host,
      port: payload.port,
      userName: payload.username
    };

    const auth = {
      host: payload.host,
      port: payload.port,
      username: payload.username,
      password: payload.password,
      conversation_id: conversationId
    };

    this.modalRef.hide();

    this.terminalService.openTerminalDirect(input, auth);
  }

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
