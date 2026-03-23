import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { JiraInstanceProject, JiraTicketQueueType, JiraTicketRequestType, JiraTicketRequestTypeField } from '../../SharedEntityTypes/jira.type';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { Notification } from '../../app-notification/notification.type';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from '../../app-utility/app-utility.service';
import { DeviceServiceCatalog } from '../../create-ticket/device-service-catalog.type';
import { DeviceServiceCatalogTermView, UnityTicketInput } from '../shared-create-ticket.service';
import { CreateJiraTicketService } from './create-jira-ticket.service';

@Component({
  selector: 'create-jira-ticket',
  templateUrl: './create-jira-ticket.component.html',
  styleUrls: ['./create-jira-ticket.component.scss'],
  // providers: [CreateJiraTicketService]
})
export class CreateJiraTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  metadata: UnityTicketInput;
  deviceMapping: DeviceMapping;
  ticketTypeList = [];
  ticketPriorityList = [];
  instanceId: string;
  projectId: string;
  // queueId: string;

  ticketForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  projects: JiraInstanceProject[] = [];
  // queues: JiraTicketQueueType[] = [];
  requestTypes: JiraTicketRequestType[] = [];
  requestTypeFields: JiraTicketRequestTypeField[] = [];

  svcCategories: string[] = [];
  showSvcCategory: boolean;
  svcCatalog: DeviceServiceCatalog[] = [];
  selectedService: string = '';
  svcCatalogTerms: DeviceServiceCatalogTermView[] = [];
  selectedTerm: DeviceServiceCatalogTermView = new DeviceServiceCatalogTermView();

  constructor(private ticketSvc: CreateJiraTicketService,
    public route: ActivatedRoute,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {
    this.ticketSvc.jiraTicketAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.metadata = param.input;
      this.instanceId = param.instanceId;
      this.projectId = param.input && param.input.projectId ? param.input.projectId : null;
      // this.queueId = param.input && param.input.queueId ? param.input.queueId : null;
      this.deviceMapping = param.deviceMapping ? param.deviceMapping : null;

      //Category dropdown should be shown only for service request.
      //commented to check for problem type in Jira
      // this.showSvcCategory = param.input.type == SERVICE_NOW_TICKET_TYPE.PROBLEM && !param.input.webaccess && !param.input.aiops;

      //check for device web access ticketvf
      if (!param.input.webaccess) {
        this.svcCatalog = [];
        this.selectedService = '';
        this.getServiceCatalog();
      }
      this.buildForm();
      this.getProjects();
    });
    this.ticketSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.ticketSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.ticketForm = this.ticketSvc.buildForm(this.metadata);
    this.formErrors = this.ticketSvc.resetFormErrors();
    this.validationMessages = this.ticketSvc.validationMessages;
    this.ticketForm.get('project').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDropdownData(res);
    })
    this.ticketForm.get('request_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(requestTypeId => {
      let project = <JiraInstanceProject>this.ticketForm.get('project').value;
      if (this.instanceId && project && project.serviceDeskId && requestTypeId) {
        this.getRequestTypeFields(this.instanceId, project.serviceDeskId, requestTypeId);
      }
    })
  }

  getProjects() {
    this.ticketSvc.getProjects(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.projects = res.projects_selected;
      if (this.projectId) {
        let project = this.projects.find(p => p.project_id == this.projectId);
        if (project) {
          this.ticketForm.get('project').patchValue(project);
          this.ticketForm.get('project').disable({ emitEvent: false });
        } else {
          this.ticketForm.get('project').patchValue(this.projects[0]);
        }
      } else {
        this.ticketForm.get('project').patchValue(this.projects[0]);
      }
    }, (err: HttpErrorResponse) => {
      this.projects = [];
      this.ticketTypeList = [];
      this.ticketPriorityList = [];
    })
  }

  getDropdownData(project: JiraInstanceProject) {
    this.ticketTypeList = [];
    this.ticketPriorityList = [];
    this.ticketSvc.getDropdownData(this.instanceId, project.project_id, project.serviceDeskId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ issues, priorities, requestTypes }) => {
        if (issues) {
          this.ticketTypeList = _clone(issues);
          this.ticketForm.get('issuetype').patchValue(issues[0].id);
        } else {
          this.ticketTypeList = [];
          this.notification.error(new Notification("Error while fetching issue types"));
        }

        if (priorities) {
          this.ticketPriorityList = _clone(priorities);
          this.ticketForm.get('priority').patchValue(priorities[0].id);
        } else {
          this.ticketPriorityList = [];
          this.notification.error(new Notification("Error while fetching priorities list"));
        }

        if (requestTypes) {
          this.requestTypes = _clone(requestTypes);
          this.ticketForm.get('request_type').patchValue(requestTypes[0].id);
        } else {
          this.requestTypes = [];
          this.notification.error(new Notification("Error while fetching request types"));
        }
      });
  }

  customFieldsForm: FormGroup;
  customFieldsFormErrors: any;
  customFieldsFormValidationMessages: any;
  getRequestTypeFields(instanceId: string, serviceDeskId: string, requestTypeId: string) {
    this.requestTypeFields = [];
    this.customFieldsForm = null;
    this.customFieldsFormErrors = null;
    this.customFieldsFormValidationMessages = null;
    this.ticketSvc.getRequestTypeFields(instanceId, serviceDeskId, requestTypeId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.length) {
        let requestTypeFields = res.filter(rf => rf.jiraSchema.custom && rf.required);
        if (requestTypeFields.length) {
          requestTypeFields.forEach(rf => rf.fieldType = rf.jiraSchema.custom.split(':').getLast())
          this.customFieldsForm = this.ticketSvc.buildCustomForm(requestTypeFields);
          this.customFieldsFormErrors = this.ticketSvc.resetCustomFieldFormErrors(requestTypeFields);
          this.customFieldsFormValidationMessages = this.ticketSvc.customFieldFormValidationMessages(requestTypeFields);
          this.requestTypeFields = requestTypeFields;
        }
      }
    }, err => {
      this.notification.error(new Notification('Error while fetching service category.'));
    });
  }

  getReadableTicketType(issuetype: string) {
    return issuetype ? issuetype.split('_').join(" ") : null;
  }

  getServiceCategory() {
    this.ticketSvc.getServiceCategory().pipe(take(1)).subscribe(res => {
      this.svcCategories = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching service category.'));
    });
  }

  getServiceCatalog() {
    if (this.deviceMapping) {
      this.ticketSvc.getServiceCatalog(this.deviceMapping).pipe(take(1)).subscribe(res => {
        this.svcCatalog = res;
      }, err => {
        this.notification.error(new Notification('Error while fetching service catalog.'));
      });
    }
  }

  handleError(err: any) {
    this.formErrors = this.ticketSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.ticketForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  submit() {
    this.ticketSvc.updateForm(this.ticketForm, this.customFieldsForm);
    if (this.ticketForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors); });
      return;
    } else if (this.customFieldsForm && this.customFieldsForm.invalid) {
      this.customFieldsFormErrors = this.utilService.validateForm(this.customFieldsForm, this.customFieldsFormValidationMessages, this.customFieldsFormErrors);
      this.customFieldsForm.valueChanges
        .subscribe((data: any) => { this.customFieldsFormErrors = this.utilService.validateForm(this.customFieldsForm, this.customFieldsFormValidationMessages, this.customFieldsFormErrors); });
      return;
    } else {
      this.formErrors = this.ticketSvc.resetFormErrors();
      if (this.customFieldsForm) {
        this.customFieldsFormErrors = this.ticketSvc.resetCustomFieldFormErrors(this.requestTypeFields);
      }
      const data = this.ticketSvc.toFormData(this.ticketForm.getRawValue(), this.customFieldsForm ? this.customFieldsForm.getRawValue() : null, this.requestTypeFields);
      if (this.selectedService) {
        let metadata = data.get('metadata').toString().concat('\n').concat(`Service : ${this.selectedService}`);
        if (this.selectedTerm) {
          metadata = metadata.concat(` - Term : ${this.selectedTerm.displayName} - Charge : ${this.selectedTerm.charge}`);
        }
        data.set('metadata', metadata);
      }
      this.ticketSvc.updateForm(this.ticketForm, this.customFieldsForm);
      this.ticketSvc.setFormData(data);
    }

  }
}
