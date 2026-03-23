import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ManageReportDatacenterFormData } from '../manage-report-crud/datacenter-report-crud/datacenter-report-crud.service';
import { ManageReportPrivateCloudFormData } from '../manage-report-crud/private-cloud-report-crud/private-cloud-report-crud.service';
import { ManageReportPublicCloudFormData } from '../manage-report-crud/public-cloud-report-crud/public-cloud-report-crud.service';
import { ManageReportEventFormData } from '../manage-report-crud/event-mgmt-report-crud/event-mgmt-report-crud.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { ManageReportCrudService, ManageReportFormData } from './manage-report-crud.service';

@Component({
  selector: 'manage-report-crud',
  templateUrl: './manage-report-crud.component.html',
  styleUrls: ['./manage-report-crud.component.scss']
})

export class ManageReportCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  //@Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  reportId: string = null;
  action: 'Create' | 'Update';
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  invalidForms: boolean = false;

  selectedReport: ManageReportFormData;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudSvc: ManageReportCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.reportId = params.get('reportId');
    });
    this.crudSvc.invalidAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.invalidForms = true;
    });
  }

  ngOnInit(): void {
    // console.log(this.storageService.extractByKey('feature', StorageType.SESSIONSTORAGE))
    this.selectedReport = null;
    if (this.reportId) {
      this.action = 'Update';
      this.getReportById();
    } else {
      this.action = 'Create';
      this.buildForm();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getReportById() {
    this.crudSvc.getReportById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedReport = res;
      this.buildForm();
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
    });
  }

  childFormData($event: ManageReportDatacenterFormData | ManageReportPrivateCloudFormData | ManageReportPublicCloudFormData | ManageReportEventFormData) {
    let childFormData = $event;
    if (this.form.valid) {
      this.invalidForms = false;
      let fd = <ManageReportFormData>this.form.getRawValue();
      fd.report_meta = childFormData;
      this.submitFinalFormData(fd);
    }
  }

  submitFinalFormData(fd: ManageReportFormData) {
    this.spinner.start('main');
    if (this.reportId) {
      this.crudSvc.updateReport(this.reportId, fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Report updated successfully.'));
        //this.onCrud.emit(CRUDActionTypes.ADD);
        this.router.navigate(['../../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification('Error while updating Report. Please try again'));
        this.handleError(err);
      });
    } else {
      this.crudSvc.createReport(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Report created successfully.'));
        //this.onCrud.emit(CRUDActionTypes.ADD);
        this.router.navigate(['../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification('Error while creating Report. Please try again'));
        this.handleError(err);
      });
    }
  };

  buildForm() {
    this.spinner.start('main');
    this.form = this.crudSvc.buildForm(this.selectedReport);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.validationMessages = this.crudSvc.validationMessages;
    this.spinner.stop('main');
  }


  handleError(err: any) {
    this.crudSvc.announceHandleError(err);
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    this.crudSvc.annouceSubmit();
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors); });
    }
  }

  goBack() {
    if (this.reportId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
