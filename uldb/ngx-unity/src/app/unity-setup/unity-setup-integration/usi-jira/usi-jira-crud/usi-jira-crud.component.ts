import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isString } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { JiraInstanceProjectViewdata, UsiJiraCrudService } from './usi-jira-crud.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { JiraInstance, JiraInstanceProject } from 'src/app/shared/SharedEntityTypes/jira.type';

@Component({
  selector: 'usi-jira-crud',
  templateUrl: './usi-jira-crud.component.html',
  styleUrls: ['./usi-jira-crud.component.scss']
})
export class UsiJiraCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();

  isAddOrEdit: boolean = false;
  instanceId: string;
  instance: JiraInstance;

  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('instanceProjectList') instanceProjectList: ElementRef;
  projects: JiraInstanceProjectViewdata[] = [];
  selectedProjects: JiraInstanceProjectViewdata[] = [];

  actionMessage: string;
  activeForm: string = 'integrationForm';

  nonFieldErr: string = '';
  integrationForm: FormGroup;
  integrationFormErrors: any;
  integrationFormValidationMessages: any;

  constructor(private crudSvc: UsiJiraCrudService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    public userService: UserInfoService,
    private route: ActivatedRoute,
    private router: Router) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
      this.actionMessage = this.instanceId ? 'Edit' : 'Add';
    });
    this.crudSvc.showProjectsAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uuid => {
      this.spinner.start('main');
      this.actionMessage = null;
      this.instanceId = uuid;
      this.getInstanceDetails(uuid);
    })
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uuid => {
      this.actionMessage = 'Delete';
      this.instanceId = uuid;
      this.delete(uuid);
    })
  }

  ngOnInit(): void {
    this.isAddOrEdit = this.router.url == '/setup/integration/jira' || this.router.url.includes('create') || this.router.url.includes('edit');
    if (this.isAddOrEdit) {
      this.spinner.start('main');
      if (this.instanceId) {
        this.getInstanceDetails(this.instanceId);
      } else {
        this.manageSteps('integrationForm');
      }
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInstanceDetails(instanceId: string) {
    this.crudSvc.getInstanceDetails(instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      if (this.actionMessage == 'Edit') {
        this.edit(this.instance)
      } else {
        this.showProjects(this.instance);
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch instance details. Tryagain later.'))
    });
  }

  manageSteps(formName?: string, isSpinnerNotRequired?: boolean) {
    switch (formName) {
      case 'integrationForm':
        if (this.instanceId && this.instance) {
          this.buildForm(this.instance);
        } else {
          this.buildForm(null);
        }
        this.activeForm = formName;
        break;
      default:
        if (!this.integrationForm) {
          this.notification.warning(new Notification('Please fill in the Integration and move to Project'));
          return;
        }
        if (this.integrationForm.valid) {
          this.showProjects(this.instance);
          this.activeForm = formName;
        } else {
          this.onIntegrationFormSubmit();
        }
        break;
    }
    if (!isSpinnerNotRequired) {
      this.spinner.stop('main');
    }
  }

  edit(instance: JiraInstance) {
    this.instanceId = instance.uuid;
    this.actionMessage = 'Edit';
    this.manageSteps('integrationForm');
  }

  buildForm(instance: JiraInstance) {
    this.integrationForm = this.crudSvc.buildIntegrationForm(instance);
    this.integrationFormErrors = this.crudSvc.resetIntegrationFormErrors();
    this.integrationFormValidationMessages = this.crudSvc.integrationFormvalidationMessages;
  }

  onIntegrationFormSubmit() {
    if (this.integrationForm.invalid) {
      this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors);
      this.integrationForm.valueChanges
        .subscribe((data: any) => { this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      if (this.instance) {
        this.crudSvc.save(this.integrationForm.getRawValue(), this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.notification.success(new Notification('JIRA instance updated successfully'));
          this.manageSteps('projectSelection', true);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.save(this.integrationForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.instance = res;
          this.instanceId = res.uuid;
          this.notification.success(new Notification('JIRA instance added successfully'));
          this.manageSteps('projectSelection', true);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    this.integrationFormErrors = this.crudSvc.resetIntegrationFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.integrationForm.controls) {
          this.integrationFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  showProjects(view: JiraInstance) {
    this.crudSvc.getProjects(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.projects = this.crudSvc.convertToProjectViewData(res);
      if (!this.actionMessage) {
        this.modalRef = this.modalService.show(this.instanceProjectList, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to list projects. Try again later.'));
    });
  }

  selectProject(view: JiraInstanceProjectViewdata) {
    view.isSelected = !view.isSelected;
  }

  onSubmitProjects() {
    this.spinner.start('main');
    let selectedProjects = this.projects.filter(p => p.isSelected);
    this.instance.project_details = [];
    selectedProjects.forEach(sp => {
      let a: JiraInstanceProject = {
        project_name: sp.name,
        project_id: sp.id,
        serviceDeskId: sp.serviceDeskId,
        project_key: sp.projectKey,
      }
      this.instance.project_details.push(a);
    })
    let obj = Object.assign({}, this.instance);
    this.crudSvc.save(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (!this.isAddOrEdit) {
        this.modalRef.hide();
      }
      this.notification.success(new Notification('JIRA instance updated successfully'));
      this.spinner.stop('main');
      if (!this.isAddOrEdit) {
        this.onCrud.emit(CRUDActionTypes.UPDATE);
      }
      if (this.isAddOrEdit) {
        this.goBack();
      }
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  delete(instanceId: string) {
    this.instanceId = instanceId;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.crudSvc.delete(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('Instance deleted successfully'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.notification.error(new Notification('Instance could not be deleted'));
    });
  }

  goBack() {
    if (this.actionMessage == 'Edit') {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
