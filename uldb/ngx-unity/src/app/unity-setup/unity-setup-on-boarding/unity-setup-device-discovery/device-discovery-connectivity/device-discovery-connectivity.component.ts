import { Component, OnInit, OnDestroy, TemplateRef, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DeviceDiscoveryConnectivityService, AgentConfigurationViewData } from './device-discovery-connectivity.service';

@Component({
  selector: 'device-discovery-connectivity',
  templateUrl: './device-discovery-connectivity.component.html',
  styleUrls: ['./device-discovery-connectivity.component.scss'],
  providers: [DeviceDiscoveryConnectivityService]
})
export class DeviceDiscoveryConnectivityComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: AgentConfigurationViewData[] = [];
  selectedAgent: string;
  @Output() toggleModal: EventEmitter<string> = new EventEmitter<string>();

  modalRef: BsModalRef;
  agentForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  editAgentForm: FormGroup;
  editFormErrors: any;
  editValidationMessages: any;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  constructor(private agentService: DeviceDiscoveryConnectivityService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.getConfigurations();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getConfigurations() {
    this.agentService.getConfigurations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.agentService.convertToViewData(res);
    }, err => {
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  addAgent(template: TemplateRef<any>) {
    this.toggleModal.emit();
    this.nonFieldErr = '';
    this.agentForm = this.agentService.buildForm();
    this.formErrors = this.agentService.resetFormErrors();
    this.validationMessages = this.agentService.validationMessages;
    this.modalRef = this.modalService.show(template, { class: 'second', keyboard: true, ignoreBackdropClick: true });
  }

  editAgentName(view: AgentConfigurationViewData) {
    this.nonFieldErr = '';
    view.updating = true;
    this.editAgentForm = this.agentService.buildForm(view);
    this.editFormErrors = this.agentService.resetFormErrors();
    this.editValidationMessages = this.agentService.validationMessages;
  }

  closeAddModal() {
    this.toggleModal.emit();
    this.modalRef.hide();
  }

  cancelEdit(view: AgentConfigurationViewData) {
    view.updating = false;
  }

  deleteConfig(view: AgentConfigurationViewData) {
    this.selectedAgent = view.uuid;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: 'second', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.agentService.deleteConfig(this.selectedAgent).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notificationService.success(new Notification('Collector Deleted sucessfully'));
      this.getConfigurations();
    }, err => {
      this.notificationService.error(new Notification('Error while deleting. Please try again!!'));
    });
  }

  handleError(err: any) {
    this.formErrors = this.agentService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.agentForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.closeAddModal();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitAgentForm() {
    if (this.agentForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.agentForm, this.validationMessages, this.formErrors);
      this.agentForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.agentForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.agentService.addConfigurations(this.agentForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getConfigurations();
        this.notificationService.success(new Notification('Collector Installation is complete.'));
        this.closeAddModal();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  submitUpdateAgentNameForm() {
    if (this.editAgentForm.invalid) {
      this.editFormErrors = this.utilService.validateForm(this.editAgentForm, this.editValidationMessages, this.editFormErrors);
      this.editAgentForm.valueChanges
        .subscribe((data: any) => { this.editFormErrors = this.utilService.validateForm(this.editAgentForm, this.editValidationMessages, this.editFormErrors); });
      return;
    } else {
      this.agentService.editConfigurations(this.editAgentForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getConfigurations();
        this.notificationService.success(new Notification('Collector Installation is complete.'));
        this.editAgentForm = null;
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }
}
