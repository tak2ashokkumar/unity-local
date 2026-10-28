import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { VergeIOAccount, VergeIOConnectionCheck } from '../usi-vergeio.type';
import { UsiVergeioCrudService } from './usi-vergeio-crud.service';

@Component({
  selector: 'usi-vergeio-crud',
  templateUrl: './usi-vergeio-crud.component.html',
  styleUrls: ['./usi-vergeio-crud.component.scss'],
  providers: [UsiVergeioCrudService]
})
export class UsiVergeioCrudComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  instanceId: string;
  action: 'Add' | 'Edit';

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;
  nonFieldErr: string = '';
  instance: VergeIOAccount;
  collectorList: DeviceDiscoveryAgentConfigurationType[] = [];
  revalidationBound: boolean = false;

  testing: boolean = false;
  connectionTested: boolean = false;
  testResult: { success: boolean, message: string } = null;

  constructor(private svc: UsiVergeioCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilSvc: AppUtilityService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId') ? params.get('instanceId') : null;
    });
  }

  ngOnInit(): void {
    this.action = this.instanceId ? 'Edit' : 'Add';
    this.getCollectors();
  }

  getCollectors() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectorList = res ? res : [];
      this.loadFormOrDetails();
    }, () => {
      this.collectorList = [];
      this.loadFormOrDetails();
    });
  }

  loadFormOrDetails() {
    if (this.instanceId) {
      this.getDetails();
    } else {
      this.buildCredentialForm();
    }
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDetails() {
    this.spinnerSvc.start('main');
    this.svc.getDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe(res => {
        this.instance = res;
        this.buildCredentialForm();
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to get VergeIO account details. Please try again.'));
      });
  }

  buildCredentialForm() {
    this.credentialForm = this.svc.buildCredentialForm(this.instance);
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.svc.credentialFormValidationMessages;
    // Angular selects compare by reference, so point the control at the matching
    // collector object from the loaded list.
    if (this.instance && this.instance.collector) {
      const selected = this.collectorList.find(c => c.uuid == this.instance.collector.uuid);
      if (selected) {
        this.credentialForm.get('collector').setValue(selected);
      }
    }
    // Any change to the connection details invalidates a prior successful test,
    // so the user must re-validate before saving.
    this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.connectionTested = false;
      this.testResult = null;
    });
  }

  testConnection() {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilSvc.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.bindRevalidationOnChanges();
      this.notificationSvc.warning(new Notification('Please fill in the connection details before testing.'));
      return;
    }
    this.testing = true;
    this.testResult = null;
    const payload = this.buildConnectionPayload();
    this.svc.checkConnection(payload, this.instanceId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.testing = false))
      .subscribe(res => {
        if (res && res.connected) {
          this.connectionTested = true;
          this.testResult = { success: true, message: 'Connection successful. You can now save the integration.' };
        } else {
          this.connectionTested = false;
          this.testResult = { success: false, message: 'Connection failed. Please verify the connection details and try again.' };
        }
      }, (err: HttpErrorResponse) => {
        this.connectionTested = false;
        this.testResult = { success: false, message: this.getConnectionErrorMessage(err) };
      });
  }

  onSubmit() {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilSvc.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.bindRevalidationOnChanges();
      return;
    }
    // The story requires the integration to be saved only after a successful
    // connection test.
    if (!this.connectionTested) {
      this.notificationSvc.warning(new Notification('Please run Test Connection successfully before saving.'));
      return;
    }
    this.saveInstance();
  }

  bindRevalidationOnChanges() {
    if (this.revalidationBound) {
      return;
    }
    this.revalidationBound = true;
    this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.credentialFormErrors = this.utilSvc.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
    });
  }

  saveInstance() {
    this.nonFieldErr = '';
    this.spinnerSvc.start('main');
    const payload = this.removeBlankPasswordFromEditPayload(this.credentialForm.getRawValue());
    this.svc.saveInstance(payload, this.instanceId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe(() => {
        this.notificationSvc.success(new Notification(`VergeIO account ${this.action === 'Edit' ? 'updated' : 'added'} successfully.`));
        this.goBack();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
  }

  handleError(err: any) {
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    if (!err) {
      this.nonFieldErr = 'Something went wrong!! Please try again.';
      this.notificationSvc.error(new Notification(this.nonFieldErr));
      return;
    }
    if (err.non_field_errors) {
      this.nonFieldErr = Array.isArray(err.non_field_errors) ? err.non_field_errors[0] : err.non_field_errors;
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else {
      for (const field in err) {
        if (field in this.credentialFormErrors) {
          this.credentialFormErrors[field] = Array.isArray(err[field]) ? err[field][0] : err[field];
        }
      }
    }
  }

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  private removeBlankPasswordFromEditPayload(data: any): any {
    if ('password' in data && (!data.password || !data.password.trim())) {
      delete data.password;
    }
    return data;
  }

  private buildConnectionPayload(): VergeIOConnectionCheck {
    const raw = this.credentialForm.getRawValue();
    const payload: VergeIOConnectionCheck = {
      hostname: raw.hostname,
      port: raw.port,
      username: raw.username,
      password: raw.password,
      verify_ssl: raw.verify_ssl,
      collector: raw.collector,
    };
    // On edit a blank password means "keep the stored one" - let the backend use it.
    if (!payload.password || !payload.password.trim()) {
      delete payload.password;
    }
    return payload;
  }

  private getConnectionErrorMessage(err: HttpErrorResponse): string {
    // Surface the backend's specific reason (invalid credentials, unreachable
    // endpoint, insufficient permissions, SSL error, timeout) when provided.
    const body = err ? err.error : null;
    if (body) {
      if (body.detail) {
        return Array.isArray(body.detail) ? body.detail[0] : body.detail;
      }
      if (body.message) {
        return body.message;
      }
      if (body.non_field_errors) {
        return Array.isArray(body.non_field_errors) ? body.non_field_errors[0] : body.non_field_errors;
      }
    }
    return 'Connection failed. Please verify the endpoint, credentials, port, and SSL settings.';
  }
}
