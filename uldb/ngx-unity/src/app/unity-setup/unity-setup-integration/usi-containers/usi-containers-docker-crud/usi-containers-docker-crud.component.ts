import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { merge as _merge, isString } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { UsiContainersDockerCrudService } from './usi-containers-docker-crud.service';

@Component({
  selector: 'usi-containers-docker-crud',
  templateUrl: './usi-containers-docker-crud.component.html',
  styleUrls: ['./usi-containers-docker-crud.component.scss'],
  providers: [UsiContainersDockerCrudService]
})
export class UsiContainersDockerCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  controllerId: string;
  action: 'Add' | 'Edit';
  nonFieldErr: string = '';

  dockerForm: FormGroup;
  dockerFormErrors: any;
  dockerValidationMessages: any;

  attachmentForm: FormGroup;
  attachmentFormErrors: any;

  constructor(private svc: UsiContainersDockerCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private utilService: AppUtilityService,
    private notificationSvc: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
    });
  }

  ngOnInit(): void {
    this.action = this.controllerId ? 'Edit' : 'Add';
    this.spinnerSvc.start('main');
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.nonFieldErr = '';
    this.dockerFormErrors = this.svc.resetDockerFormErrors();
    this.dockerValidationMessages = this.svc.dockerFormMessages;
    this.attachmentForm = this.svc.buildAttachmentForm();
    this.attachmentFormErrors = this.svc.resetAttachmentFormErrors();
    this.svc.createDockerForm(this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.dockerForm = form;
      this.spinnerSvc.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinnerSvc.stop('main');
      this.notificationSvc.error(new Notification('Unable to fetch Docker Details'));
    });
  }

  validateAttachmentForm() {
    if (!this.attachmentForm.get('unity-cert')) {
      this.attachmentFormErrors['cert'] = 'Cert file is required';
    }
    if (!this.attachmentForm.get('unity-key')) {
      this.attachmentFormErrors['key'] = 'Key file is required';
    }
    if (!this.attachmentForm.get('unity-ca')) {
      this.attachmentFormErrors['ca'] = 'CA file is required';
    }
  }

  isAttachmentFormValid() {
    let valid = this.attachmentForm.get('unity-cert') && this.attachmentForm.get('unity-key') && this.attachmentForm.get('unity-ca');
    return valid != null || valid != undefined;
  }

  onSubmit() {
    if (this.dockerForm.invalid || !this.isAttachmentFormValid()) {
      this.dockerFormErrors = this.utilService.validateForm(this.dockerForm, this.dockerValidationMessages, this.dockerFormErrors);
      this.validateAttachmentForm();
      this.dockerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => { this.dockerFormErrors = this.utilService.validateForm(this.dockerForm, this.dockerValidationMessages, this.dockerFormErrors); });
      this.attachmentForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.validateAttachmentForm());
      return;
    }
    const data = this.svc.toFormData(_merge({}, { controller_type: CONTROLLER_TYPE_MAPPING.DOCKER }, this.dockerForm.getRawValue()), this.attachmentForm.getRawValue());
    this.submitFormData(data);
  }

  submitFormData(data: FormData) {
    this.nonFieldErr = '';
    this.spinnerSvc.start('main');
    if (this.controllerId) {
      this.svc.updateController(this.controllerId, data).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.spinnerSvc.stop('main');
          this.notificationSvc.success(new Notification('Controller updated successfully'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinnerSvc.stop('main');
          this.handleError(err.error);
        });
    } else {
      this.svc.addController(data).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.spinnerSvc.stop('main');
          this.notificationSvc.success(new Notification('Controller added successfully'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinnerSvc.stop('main');
          this.handleError(err.error);
        });
    }
  }

  handleError(err: any) {
    this.dockerFormErrors = this.svc.resetDockerFormErrors();
    this.attachmentFormErrors = this.svc.resetAttachmentFormErrors();
    if (!err) {
      this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
      return;
    }
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (isString(err)) {
      this.nonFieldErr = err;
    } else {
      for (const field in err) {
        if (field == 'cert' || field == 'key' || field == 'ca') {
          this.attachmentFormErrors[field] = err[field][0];
        } else if (field in this.dockerFormErrors) {
          this.dockerFormErrors[field] = err[field][0];
        }
      }
    }
  }

  handleCertFileInput(files: FileList) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.attachmentForm.addControl('unity-cert', new FormControl(e.target.result));
      this.attachmentFormErrors['cert'] = '';
    };
    reader.readAsDataURL(files.item(0));
  }

  handleKeyFileInput(files: FileList) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.attachmentForm.addControl('unity-key', new FormControl(e.target.result));
      this.attachmentFormErrors['key'] = '';
    };
    reader.readAsDataURL(files.item(0));
  }

  handleCaFileInput(files: FileList) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.attachmentForm.addControl('unity-ca', new FormControl(e.target.result));
      this.attachmentFormErrors['ca'] = '';
    };
    reader.readAsDataURL(files.item(0));
  }

  goBack() {
    if (this.controllerId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
