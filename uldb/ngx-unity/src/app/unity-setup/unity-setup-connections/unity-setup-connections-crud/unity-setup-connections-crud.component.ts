import { Component, OnDestroy, OnInit } from '@angular/core';
import { API_KEY_METHOD_CHOICES, AUTH_TYPE_CHOICES, OAUTH2_GRANT_CHOICES, UnitySetupConnectionsCrudService } from './unity-setup-connections-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectionConfigType } from './unity-setup-connections.type';

@Component({
  selector: 'unity-setup-connections-crud',
  templateUrl: './unity-setup-connections-crud.component.html',
  styleUrls: ['./unity-setup-connections-crud.component.scss'],
  providers: [UnitySetupConnectionsCrudService]
})
export class UnitySetupConnectionsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  action: 'Create' | 'Update';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string;
  connectionId: string;
  connectionData: ConnectionConfigType;

  authList: { key: string; value: string; }[] = AUTH_TYPE_CHOICES;
  methodList: { key: string; value: string; }[] = API_KEY_METHOD_CHOICES;
  grantList: { key: string; value: string; }[] = OAUTH2_GRANT_CHOICES;

  constructor(private svc: UnitySetupConnectionsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder,
    private storage: StorageService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.connectionId = params.get('connectionId');
      this.action = this.connectionId ? 'Update' : 'Create';
    });
    // this.connectionId = '58bcd3a2-3a47-462d-8c4b-83a401df82ef';
  }

  ngOnInit(): void {
    if (this.connectionId) {
      this.getConnectionDataById();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getConnectionDataById() {
    this.spinner.start('main');
    this.svc.getConnectionDataById(this.connectionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.connectionData = data;
      this.buildForm(this.connectionData);
      // this.goBack();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.handleError(err.error);
    });
  }

  buildForm(connectionData?: any) {
    this.form = this.svc.buildForm(connectionData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    this.manageAuthSubscriptons();
    if (this.connectionId) {
      this.manageOathSubscriptions();
    }
  }

  manageAuthSubscriptons() {
    this.form.get('auth_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value == 'BASIC') {
        this.form.removeControl('api_key');
        this.form.removeControl('api_key_field');
        this.form.removeControl('api_key_method');
        this.form.removeControl('oauth2_grant');
        this.form.removeControl('username');
        this.form.removeControl('password');
        this.form.removeControl('client_id');
        this.form.removeControl('client_secret');
        this.form.removeControl('token_url');
        this.form.removeControl('scope');
        this.form.addControl('username', new FormControl('', [Validators.required]));
        this.form.addControl('password', new FormControl('', [Validators.required]));
      } else if (value == 'API_KEY') {
        this.form.addControl('api_key', new FormControl('', [Validators.required]));
        this.form.addControl('api_key_field', new FormControl('', [Validators.required]));
        this.form.addControl('api_key_method', new FormControl('', [Validators.required]));
        this.form.removeControl('username');
        this.form.removeControl('password');
        this.form.removeControl('oauth2_grant');
        this.form.removeControl('client_id');
        this.form.removeControl('client_secret');
        this.form.removeControl('token_url');
        this.form.removeControl('scope');
      } else if (value == 'OAUTH2') {
        this.form.addControl('oauth2_grant', new FormControl('CLIENT_CREDENTIALS', [Validators.required]));
        this.form.addControl('token_url', new FormControl('', [Validators.required, RxwebValidators.url()]));
        this.form.addControl('client_id', new FormControl('', [Validators.required]));
        this.form.addControl('client_secret', new FormControl('', [Validators.required]));
        this.form.addControl('scope', new FormControl(''));
        this.form.removeControl('username');
        this.form.removeControl('password');
        this.form.removeControl('api_key');
        this.form.removeControl('api_key_field');
        this.form.removeControl('api_key_method');
        this.manageOathSubscriptions()
      } else {
        this.form.removeControl('username');
        this.form.removeControl('password');
        this.form.removeControl('api_key');
        this.form.removeControl('api_key_field');
        this.form.removeControl('api_key_method');
        this.form.removeControl('oauth2_grant');
        this.form.removeControl('client_id');
        this.form.removeControl('client_secret');
        this.form.removeControl('token_url');
        this.form.removeControl('scope');
      }
    });
  }

  manageOathSubscriptions() {
    this.form.get('oauth2_grant')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value == 'CLIENT_CREDENTIALS') {
        this.form.removeControl('password');
        this.form.addControl('token_url', new FormControl('', [Validators.required, RxwebValidators.url()]));
        this.form.addControl('client_id', new FormControl('', [Validators.required]));
        this.form.addControl('client_secret', new FormControl('', [Validators.required]));
        this.form.addControl('scope', new FormControl(''));
      } else if (value == 'PASSWORD') {
        this.form.removeControl('token_url');
        this.form.removeControl('client_id');
        this.form.removeControl('client_secret');
        this.form.removeControl('scope');
        this.form.addControl('token_url', new FormControl('', [Validators.required, RxwebValidators.url()]));
        this.form.addControl('client_id', new FormControl('', [Validators.required]));
        this.form.addControl('client_secret', new FormControl('', [Validators.required]));
        this.form.addControl('scope', new FormControl(''));
        this.form.addControl('username', new FormControl('', [Validators.required]));
        this.form.addControl('password', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('token_url');
        this.form.removeControl('client_id');
        this.form.removeControl('client_secret');
        this.form.removeControl('scope');
        this.form.addControl('token_url', new FormControl('', [Validators.required, RxwebValidators.url()]));
        this.form.addControl('client_id', new FormControl('', [Validators.required]));
        this.form.addControl('client_secret', new FormControl('', [Validators.required]));
        this.form.addControl('scope', new FormControl(''));
        this.form.addControl('username', new FormControl('', [Validators.required]));
        this.form.addControl('password', new FormControl('', [Validators.required]));
      }
    });
  }

  ConfirmConnectionCreate() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      let obj = this.form.getRawValue();
      if (this.connectionId) {
        this.svc.updateConnection(this.connectionId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Connection Updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      } else {
        this.svc.createConnection(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Connection created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    // this.formErrors = this.svc.resetFormErrors();
    this.spinner.stop('main');
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.notification.error(new Notification('Something went wrong!! Please try again.'));
    this.spinner.stop('main');
  }


  goBack() {
    if (this.connectionId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }


}
