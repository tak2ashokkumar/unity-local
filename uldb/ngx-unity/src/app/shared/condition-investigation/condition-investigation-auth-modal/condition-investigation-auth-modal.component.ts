import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { GET_AGENT_CONFIGURATIONS } from '../../api-endpoint.const';

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

  constructor(private modalService: BsModalService,
    private fb: FormBuilder,
    private http: HttpClient,
    private terminalService: ConditionInvestigationNewTerminalService
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
        console.log('Received conversationId:', id);
        this.conversationId = id;
      });
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
      conversation_id: conversationId,
      collector_uuid: payload.collector.uuid
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
