import { Component, OnInit, OnDestroy } from '@angular/core';
import { DevicesCrudMonitoringService } from './devices-crud-monitoring.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { SNMPVersionMapping, AuthLevelMapping, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AUTH_ALGOS, CRYPTO_ALGOS } from 'src/app/app-constants';

@Component({
  selector: 'devices-crud-monitoring',
  templateUrl: './devices-crud-monitoring.component.html',
  styleUrls: ['./devices-crud-monitoring.component.scss']
})
export class DevicesCrudMonitoringComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;
  monitoringEnabled: boolean;
  SNMPVersionMapping = SNMPVersionMapping;
  AuthLevelMapping = AuthLevelMapping;
  authAlgos = AUTH_ALGOS;
  cryptoAlgos = CRYPTO_ALGOS;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  constructor(private crudMonitoringSvc: DevicesCrudMonitoringService,
    private utilService: AppUtilityService) {
    this.crudMonitoringSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.crudMonitoringSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
  }

  ngOnInit() {
    this.form = this.crudMonitoringSvc.form;
    this.monitoringEnabled = this.crudMonitoringSvc.monitoringEnabled;
    this.formErrors = this.crudMonitoringSvc.resetFormErrors();
    this.formValidationMessages = this.crudMonitoringSvc.switchValidationMessages;
    this.form.get('snmp_version').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res == SNMPVersionMapping.V3) {
        this.form = this.crudMonitoringSvc.setV3Fields();
        this.subscr = this.form.get('snmp_authlevel').valueChanges.subscribe(res => {
          if (res == AuthLevelMapping.NoAuthNoPriv) {
            this.form = this.crudMonitoringSvc.setNoAuthNoPrivFields();
          } else if (res == AuthLevelMapping.AuthNoPriv) {
            this.form = this.crudMonitoringSvc.setAtuhNoPrivFields();
          } else {
            this.form = this.crudMonitoringSvc.setAuthPrivFields();
          }
          this.form.updateValueAndValidity();
        });
      } else {
        this.form = this.crudMonitoringSvc.setV1_V2Fields();
        if (this.subscr && !this.subscr.closed) {
          this.subscr.unsubscribe();
        }
      }
      this.form.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  monitoringFormCheck() {
    this.monitoringEnabled = this.crudMonitoringSvc.monitoringFormCheck();
  }

  handleError(err: any) {
    this.formErrors = this.crudMonitoringSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    }
  }
}
