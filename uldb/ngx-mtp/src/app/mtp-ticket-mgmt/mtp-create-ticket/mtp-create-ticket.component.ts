import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { MtpCreateTicketService } from './mtp-create-ticket.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { ITSMTypeOption, MTPServiceNowTicketContext, MTPTicketInstance, MTPTicketPriorityType, MTPTicketType, ServiceNowChoices, TicketPriorityOption, TicketTypeOption } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantListDataItem } from 'src/app/shared/SharedEntityTypes/tenants.type';
import { cloneDeep as _clone } from 'lodash-es';
import { MTPServiceNowEditTicketViewData } from './mtp-create-ticket.service';

@Component({
  selector: 'mtp-create-ticket',
  templateUrl: './mtp-create-ticket.component.html',
  styleUrls: ['./mtp-create-ticket.component.scss'],
  providers: [MtpCreateTicketService]
})
export class MtpCreateTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private readonly serviceNowTicketSessionKey = 'mtpServiceNowTicketContext';
  ticketTypeList: Array<MTPTicketType | TicketTypeOption> = [];
  ticketPriorityList: TicketPriorityOption[] = [];
  dynamicCRMTicketTypeList: MTPTicketType[] = [];
  dynamicCRMTicketPriorityList: MTPTicketPriorityType[] = [];
  itsmTypeOptions: ITSMTypeOption[] = [];
  serviceNowTicketTypeOptions: TicketTypeOption[] = [
    { label: 'Incident', value: 'incident' },
    { label: 'Problem', value: 'problem' },
    { label: 'Change Request', value: 'change_request' }
  ];

  tenants: TenantListDataItem[] = [];
  ticketForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  attachmentForm: FormGroup;;
  isEditFlow = false;
  itsmType = '';
  serviceNowTicketContext: MTPServiceNowTicketContext = null;
  serviceNowEditTicketData: MTPServiceNowEditTicketViewData = null;
  constructor(private svc: MtpCreateTicketService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {
    this.initializeEditFlow();
  }

  ngOnInit(): void {
    this.buildForm();
    this.getInstance();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  instance: MTPTicketInstance;
  getInstance() {
    this.spinner.start('main');
    this.svc.getInstance().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.instance = res.getFirst();
        this.getDropdownData();
      } else {
        this.instance = null;
      }
      this.spinner.stop('main');
    }, err => {
      this.instance = null;
      this.spinner.stop('main');
    });
  }

  getDropdownData() {
    this.svc.getDropdownData(this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ tenants, types, priorities }) => {
      if (tenants) {
        this.tenants = _clone(tenants);
        this.updateITSMTypeOptions(this.ticketForm.get('tenant').value);
      } else {
        this.tenants = [];
        this.notification.error(new Notification("Error while fetching tenant list"));
      }

      if (types) {
        this.dynamicCRMTicketTypeList = _clone(types);
      } else {
        this.dynamicCRMTicketTypeList = [];
        this.notification.error(new Notification("Error while fetching issue types"));
      }

      if (priorities) {
        this.dynamicCRMTicketPriorityList = _clone(priorities);
      } else {
        this.dynamicCRMTicketPriorityList = [];
        this.notification.error(new Notification("Error while fetching priorities list"));
      }

      if (this.isEditFlow && this.itsmType == 'servicenow') {
        this.initializeServiceNowEditForm();
        return;
      }

      this.handleITSMTypeChange(this.ticketForm.get('itsm_type').value);
    });
  }

  buildForm() {
    this.ticketForm = this.svc.buildForm();
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages;
    this.ticketTypeList = [];
    this.ticketPriorityList = [];
    this.itsmTypeOptions = [];
    this.ticketForm.get('type').disable({ emitEvent: false });
    this.ticketForm.get('priority').disable({ emitEvent: false });
    this.ticketForm.get('tenant').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((tenantUuid: string) => {
      this.updateITSMTypeOptions(tenantUuid);
    });
    this.ticketForm.get('itsm_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((itsmType: string) => {
      this.handleITSMTypeChange(itsmType);
    });
    this.ticketForm.get('type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      if (this.isServiceNowSelected()) {
        this.getServiceNowPriorities();
      }
    });

    this.attachmentForm = this.svc.buildAttachmentForm();
  }

  updateITSMTypeOptions(tenantUuid: string) {
    const itsmTypeControl = this.ticketForm.get('itsm_type');
    const tenant = this.tenants.find(t => t.uuid == tenantUuid);
    const options: ITSMTypeOption[] = [];

    if (tenant) {
      if (tenant.is_servicenow_integrated) {
        options.push({ label: 'ServiceNow', value: 'servicenow' });
      }
      if (tenant.is_dynamics_crm_integrated) {
        options.push({ label: 'Dynamic CRM', value: 'dynamic_crm' });
      }
    }

    this.itsmTypeOptions = options;

    if (!options.length) {
      itsmTypeControl.patchValue('', { emitEvent: false });
      itsmTypeControl.disable({ emitEvent: false });
      this.handleITSMTypeChange('');
      return;
    }

    itsmTypeControl.enable({ emitEvent: false });

    if (this.isServiceNowEditFlow() && options.find(option => option.value == this.itsmType)) {
      itsmTypeControl.patchValue(this.itsmType, { emitEvent: false });
      return;
    }

    if (options.length === 1) {
      itsmTypeControl.patchValue(options[0].value, { emitEvent: false });
      this.handleITSMTypeChange(options[0].value);
      return;
    }

    itsmTypeControl.patchValue('', { emitEvent: false });
    this.handleITSMTypeChange('');
  }

  handleITSMTypeChange(itsmType: string) {
    const typeControl = this.ticketForm.get('type');
    const priorityControl = this.ticketForm.get('priority');

    this.ticketTypeList = [];
    this.ticketPriorityList = [];
    typeControl.patchValue('', { emitEvent: false });
    priorityControl.patchValue('', { emitEvent: false });
    typeControl.disable({ emitEvent: false });
    priorityControl.disable({ emitEvent: false });

    if (!itsmType) {
      return;
    }

    typeControl.enable({ emitEvent: false });

    if (itsmType == 'servicenow') {
      this.ticketTypeList = _clone(this.serviceNowTicketTypeOptions);
      return;
    }

    this.ticketTypeList = _clone(this.dynamicCRMTicketTypeList);
    this.ticketPriorityList = _clone(this.dynamicCRMTicketPriorityList);

    if (this.ticketTypeList.length) {
      typeControl.patchValue((this.ticketTypeList[0] as MTPTicketType).value, { emitEvent: false });
    }

    if (this.ticketPriorityList.length) {
      const normalPriority = this.dynamicCRMTicketPriorityList.find((priority) => priority.display_name == 'Normal');
      priorityControl.enable({ emitEvent: false });
      priorityControl.patchValue(normalPriority ? normalPriority.value : this.dynamicCRMTicketPriorityList[0].value, { emitEvent: false });
    }
  }

  getServiceNowPriorities() {
    const tenantUuid = this.ticketForm.get('tenant').value;
    const ticketType = this.ticketForm.get('type').value;
    const priorityControl = this.ticketForm.get('priority');

    this.ticketPriorityList = [];
    priorityControl.patchValue('', { emitEvent: false });
    priorityControl.disable({ emitEvent: false });

    if (!tenantUuid || !ticketType) {
      return;
    }

    this.svc.getServiceNowTicketPriorities(tenantUuid, ticketType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketPriorityList = _clone(res);
      if (this.ticketPriorityList.length) {
        priorityControl.enable({ emitEvent: false });
        if (this.isServiceNowEditFlow() && this.serviceNowEditTicketData && this.serviceNowEditTicketData.priority) {
          priorityControl.patchValue(this.serviceNowEditTicketData.priority, { emitEvent: false });
        }
      }
    }, err => {
      this.ticketPriorityList = [];
      priorityControl.disable({ emitEvent: false });
      this.notification.error(new Notification('Error while fetching priorities list'));
    });
  }

  getTicketTypeLabel(ticketType: MTPTicketType | TicketTypeOption): string {
    if (this.isServiceNowSelected()) {
      return (ticketType as TicketTypeOption).label;
    }
    return (ticketType as MTPTicketType).display_name;
  }

  getTicketPriorityLabel(priority: TicketPriorityOption): string {
    if (this.isServiceNowSelected()) {
      return (priority as ServiceNowChoices).label;
    }
    return (priority as MTPTicketPriorityType).display_name;
  }

  isServiceNowSelected() {
    return this.ticketForm && this.ticketForm.get('itsm_type').value == 'servicenow';
  }

  isServiceNowEditFlow() {
    return this.isEditFlow && this.itsmType == 'servicenow' && !!this.serviceNowTicketContext;
  }

  get attachments() {
    return Object.keys(this.attachmentForm.controls);
  }

  detectFiles(files: FileList) {
    for (let index = 0; index < files.length; index++) {
      if (this.attachments.includes(files.item(index).name)) {
        continue;
      } else {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.attachmentForm.addControl(files.item(index).name, new FormControl(e.target.result));
        }
        reader.readAsDataURL(files.item(index));
      }
    }
  }

  removeFiles(attachment: string) {
    this.attachmentForm.removeControl(attachment);
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.ticketForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  onSubmit() {
    if (this.ticketForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      if (this.isEditFlow && !this.isServiceNowEditFlow()) {
        this.notification.error(new Notification('ServiceNow ticket context is missing.'));
        return;
      }

      this.spinner.start('main');
      this.formErrors = this.svc.resetFormErrors();
      const formData = this.ticketForm.getRawValue();
      const dynamicCRMFormData = {
        subject: formData.subject,
        collaborators: formData.collaborators,
        type: formData.type,
        priority: formData.priority,
        description: formData.description,
        tenant: formData.tenant
      };
      const serviceNowFormData = this.svc.toFormData({
        subject: formData.subject,
        description: formData.description,
        collaborators: formData.collaborators,
        priority: formData.priority
      }, this.attachmentForm.getRawValue());
      const serviceNowCreateFormData = this.svc.toFormData({
        subject: formData.subject,
        description: formData.description,
        collaborators: formData.collaborators
      }, this.attachmentForm.getRawValue());
      const data = this.isServiceNowSelected() ? serviceNowCreateFormData : this.svc.toFormData(dynamicCRMFormData, this.attachmentForm.getRawValue());
      const request = this.isServiceNowEditFlow()
        ? this.svc.updateServiceNowTicket(this.serviceNowTicketContext.tenantId, this.serviceNowTicketContext.ticketType, this.serviceNowTicketContext.sysId, serviceNowFormData)
        : this.isServiceNowSelected()
          ? this.svc.saveServiceNowTicket(formData.tenant, formData.type, data)
          : this.svc.saveTicket(this.instance.uuid, data);
      const successMessage = this.isServiceNowEditFlow()
        ? 'Ticket updated successfully.'
        : 'Ticket submitted successfully, it will be visible in portal in few minutes. Our Support team will soon contact you.';
      const failureMessage = this.isServiceNowEditFlow() ? 'Failed to update ticket.' : 'Failed to creating ticket.';

      request.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.notification.success(new Notification(successMessage));
        this.goBack();
      }, err => {
        this.handleError(err);
        this.spinner.stop('main');
        this.notification.error(new Notification(failureMessage));
      });
    }
  }

  reset() {
    this.buildForm();
    if (this.isServiceNowEditFlow()) {
      this.initializeServiceNowEditForm();
    }
  }

  goBack() {
    this.router.navigate(['ticketmgmt']);
  }

  private initializeServiceNowEditForm() {
    if (!this.serviceNowTicketContext) {
      this.notification.error(new Notification('ServiceNow ticket context is missing.'));
      return;
    }

    this.ticketForm.patchValue({
      tenant: this.serviceNowTicketContext.tenantId,
      itsm_type: this.itsmType
    }, { emitEvent: false });

    this.updateITSMTypeOptions(this.serviceNowTicketContext.tenantId);
    this.handleITSMTypeChange(this.itsmType);
    this.ticketForm.patchValue({
      tenant: this.serviceNowTicketContext.tenantId,
      itsm_type: this.itsmType,
      type: this.serviceNowTicketContext.ticketType
    }, { emitEvent: false });
    this.disableServiceNowEditFields();
    this.getServiceNowPriorities();
    this.getServiceNowTicketDataForEdit();
  }

  private initializeEditFlow() {
    this.isEditFlow = this.router.url.includes('/edit/');

    if (!this.isEditFlow) {
      this.itsmType = '';
      this.serviceNowTicketContext = null;
      return;
    }

    this.itsmType = this.route.snapshot.paramMap.get('itsmType') || '';
    this.serviceNowTicketContext = this.getServiceNowTicketContextFromSessionStorage();
  }

  private getServiceNowTicketContextFromSessionStorage(): MTPServiceNowTicketContext {
    const storedTicketContext = sessionStorage.getItem(this.serviceNowTicketSessionKey);

    if (!storedTicketContext) {
      return null;
    }

    try {
      return JSON.parse(storedTicketContext);
    } catch (error) {
      return null;
    }
  }

  private getServiceNowTicketDataForEdit() {
    this.spinner.start('main');
    this.svc.getServiceNowTicketData(this.serviceNowTicketContext.tenantId, this.serviceNowTicketContext.sysId, this.serviceNowTicketContext.ticketType)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.serviceNowEditTicketData = this.svc.convertServiceNowTicketToEditViewData(res);
        this.ticketForm.patchValue({
          subject: this.serviceNowEditTicketData.subject,
          collaborators: this.serviceNowEditTicketData.collaborators,
          type: this.serviceNowTicketContext.ticketType,
          priority: this.serviceNowEditTicketData.priority,
          description: this.serviceNowEditTicketData.description,
          tenant: this.serviceNowTicketContext.tenantId,
          itsm_type: this.itsmType
        }, { emitEvent: false });
        this.disableServiceNowEditFields();
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while fetching ticket details.'));
      });
  }

  private disableServiceNowEditFields() {
    if (!this.isServiceNowEditFlow()) {
      return;
    }

    this.ticketForm.get('description').disable({ emitEvent: false });
    this.ticketForm.get('itsm_type').disable({ emitEvent: false });
    this.ticketForm.get('tenant').disable({ emitEvent: false });
  }
}
