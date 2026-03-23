import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService, AuthLevelMapping, SNMPVersionMapping } from '../app-utility/app-utility.service';
import { UnityDevicesMonitoringCrudService } from './unity-devices-monitoring-crud.service';
import { MonitoringTemplate } from '../SharedEntityTypes/monitoring-templates.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { UserInfoService } from '../user-info.service';
import { AUTH_ALGOS, CRYPTO_ALGOS } from 'src/app/app-constants';

@Component({
  selector: 'unity-devices-monitoring-crud',
  templateUrl: './unity-devices-monitoring-crud.component.html',
  styleUrls: ['./unity-devices-monitoring-crud.component.scss']
})
export class UnityDevicesMonitoringCrudComponent implements OnInit, OnDestroy {
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

  isTenantOrg: boolean = false;
  templates: MonitoringTemplate[] = [];
  filteredTemplates: MonitoringTemplate[] = [];
  fieldsToFilterOn: string[] = ['template_name'];
  selectedTemplates: MonitoringTemplate[] = [];
  searchValue: string = '';
  constructor(private mcSvc: UnityDevicesMonitoringCrudService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private userInfo: UserInfoService,) {
    this.mcSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.mcSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
  }

  ngOnInit(): void {
    this.isTenantOrg = this.userInfo.isTenantOrg;
    this.getTemplates();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  monitoringFormCheck() {
    this.monitoringEnabled = this.mcSvc.monitoringFormCheck();
  }

  getTemplates() {
    // this.spinner.start('main');
    this.mcSvc.getTemplates().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.templates = res;
      this.filteredTemplates = res;
      this.buildForm();
      // this.spinner.stop('main');
    }, err => {
      this.templates = [];
      this.filteredTemplates = [];
      this.buildForm();
      // this.spinner.stop('main');
    });
  }

  buildForm() {
    this.form = this.mcSvc.form;
    this.monitoringEnabled = this.mcSvc.monitoringEnabled;
    this.formErrors = this.mcSvc.resetFormErrors();
    this.formValidationMessages = this.mcSvc.switchValidationMessages;
    let templates = <number[]>this.form.get('mtp_templates')?.value;
    if (templates?.length) {
      templates.map(tId => {
        let template = this.filteredTemplates.find(tmpl => tmpl.template_id == tId);
        if (template) {
          template.isSelected = true;
          this.selectedTemplates.push(template);
        }
      })
    }
    this.subscribeToSnmpVerionChanges();
  }

  subscribeToSnmpVerionChanges() {
    if (this.form.get('snmp_version')) {
      this.form.get('snmp_version').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res == SNMPVersionMapping.V3) {
          this.form = this.mcSvc.setV3Fields();
          this.subscr = this.form.get('snmp_authlevel').valueChanges.subscribe(res => {
            if (res == AuthLevelMapping.NoAuthNoPriv) {
              this.form = this.mcSvc.setNoAuthNoPrivFields();
            } else if (res == AuthLevelMapping.AuthNoPriv) {
              this.form = this.mcSvc.setAtuhNoPrivFields();
            } else {
              this.form = this.mcSvc.setAuthPrivFields();
            }
            this.form.updateValueAndValidity();
          });
        } else {
          this.form = this.mcSvc.setV1_V2Fields();
          if (this.subscr && !this.subscr.closed) {
            this.subscr.unsubscribe();
          }
        }
        this.form.updateValueAndValidity();
      });
    }
  }

  selectTemplate(i: number) {
    if (this.filteredTemplates[i].isSelected) {
      this.filteredTemplates[i].isSelected = false;
    } else {
      this.filteredTemplates[i].isSelected = true;
    }
  }

  updateSelectedTemplates() {
    this.selectedTemplates = this.filteredTemplates.filter(tmpl => tmpl.isSelected);
    this.form.get('mtp_templates').setValue(this.selectedTemplates.map(t => t.template_id));
  }

  unSelectTemplate(i: number) {
    let tmplIndex = this.filteredTemplates.findIndex(tmpl => tmpl.template_id == this.selectedTemplates[i].template_id);
    if (tmplIndex != -1) {
      this.filteredTemplates[tmplIndex].isSelected = false;
    }
    this.selectedTemplates.splice(i, 1);
    this.form.get('mtp_templates').setValue(this.selectedTemplates.map(t => t.template_id));
  }

  submit() {
    if (this.monitoringEnabled) {
      if (this.isTenantOrg) {
        let templatesSelected = this.selectedTemplates?.map(t => t.template_id);
        this.form.get('mtp_templates')?.setValue(templatesSelected);
        this.form.get('mtp_templates')?.setValidators([Validators.required]);
      } else {
        this.form.removeControl('mtp_templates');
      }
    } else {
      this.mcSvc.removeDefaultFeilds();
    }
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    }
  }

  handleError(err: any) {
    this.formErrors = this.mcSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

}
