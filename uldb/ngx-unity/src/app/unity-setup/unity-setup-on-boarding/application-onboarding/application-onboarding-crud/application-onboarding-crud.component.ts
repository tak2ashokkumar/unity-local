import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { isString } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';
import { ApmTag, RuntimeOption } from '../application-onboarding.type';
import { ApplicationOnboardingCrudService } from './application-onboarding-crud.service';

interface WizardStep {
  label: string;
  icon: string;
}

@Component({
  selector: 'application-onboarding-crud',
  templateUrl: './application-onboarding-crud.component.html',
  styleUrls: ['./application-onboarding-crud.component.scss'],
  providers: [ApplicationOnboardingCrudService]
})
export class ApplicationOnboardingCrudComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  applicationId: string;
  // Loaded record (edit) - used to preserve server-managed fields on save.
  instanceData: any;

  wizardSteps: WizardStep[] = [
    { label: 'Application', icon: 'fas fa-cog' },
    { label: 'Host Config', icon: 'fas fa-wrench' },
    { label: 'Configuration', icon: 'fas fa-clipboard-check' },
    { label: 'Review', icon: 'fas fa-file-alt' }
  ];
  activeStepIndex: number = 0;

  applicationForm: FormGroup;
  applicationFormErrors: any;
  applicationFormValidationMessages: any;
  private applicationRevalidateBound = false;

  hostConfigForm: FormGroup;
  hostConfigFormErrors: any;
  hostConfigFormValidationMessages: any;
  private hostConfigRevalidateBound = false;

  configurationForm: FormGroup;
  configurationFormErrors: any;
  configurationFormValidationMessages: any;
  private configRevalidateBound = false;

  nonFieldErr: string = '';

  runtimeOptions: RuntimeOption[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  credentials: DeviceDiscoveryCredentials[] = [];
  tags: ApmTag[] = [];

  // Runtime multi-select renders as a single-line dropdown; control holds the
  // selected `value` strings (e.g. ['java','php']).
  runtimeSettings: IMultiSelectSettings = {
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block text-left',
    dynamicTitleMaxItems: 5,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    keyToSelect: 'value',
    lableToDisplay: 'label'
  };
  runtimeTexts: IMultiSelectTexts = { defaultTitle: 'Select Runtime', allSelected: 'All Runtimes' };

  // Tags multi-select; control holds the selected tag ids (e.g. [3]).
  tagsSettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block text-left',
    dynamicTitleMaxItems: 3,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    keyToSelect: 'id',
    lableToDisplay: 'tag_name'
  };
  tagsTexts: IMultiSelectTexts = { defaultTitle: 'Select Tags', allSelected: 'All Tags' };

  activeInstructionLang: string;
  @ViewChild('instructionModal') instructionModal: TemplateRef<void>;
  instructionModalRef: BsModalRef;

  constructor(private svc: ApplicationOnboardingCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService,
    private appUtilitySvc: AppUtilityService) { }

  ngOnInit(): void {
    this.spinnerSvc.start('main');
    this.runtimeOptions = this.svc.runtimeOptions;
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.applicationId = params.get('id');
    });
    this.getCollectors();
    this.getCredentials();
    this.getTags();
    if (this.applicationId) {
      this.getApplication();
    } else {
      this.buildForms();
      this.spinnerSvc.stop('main');
    }
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // ---------------------------------- Metadata ----------------------------------

  getCollectors(): void {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    }, () => {
      this.collectors = [];
    });
  }

  getCredentials(): void {
    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.credentials = res;
    }, () => {
      this.credentials = [];
    });
  }

  getTags(): void {
    this.svc.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tags = res;
    }, () => {
      this.tags = [];
    });
  }

  getApplication(): void {
    this.svc.getApplication(this.applicationId)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe(res => {
        this.instanceData = res;
        this.buildForms(res);
      }, () => {
        this.instanceData = null;
        this.buildForms();
        this.notificationSvc.error(new Notification('Unable to load application details.'));
      });
  }

  // ---------------------------------- Build forms ----------------------------------

  private buildForms(record?: any): void {
    this.nonFieldErr = '';

    this.applicationForm = this.svc.buildApplicationForm(record);
    this.applicationFormErrors = this.svc.resetApplicationFormErrors();
    this.applicationFormValidationMessages = this.svc.applicationFormValidationMessages;

    this.hostConfigForm = this.svc.buildHostConfigForm(record);
    this.hostConfigFormErrors = this.svc.resetHostConfigFormErrors();
    this.hostConfigFormValidationMessages = this.svc.hostConfigFormValidationMessages;
    this.bindCredentialTypeToggle();

    this.configurationForm = this.svc.buildConfigurationForm(record);
    this.configurationFormErrors = this.svc.resetConfigurationFormErrors();
    this.configurationFormValidationMessages = this.svc.configurationFormValidationMessages;
  }

  // Every field of a SELECTED runtime's section is mandatory; sections that are
  // not selected have their validators cleared so hidden controls never block.
  private applyConfigurationValidators(): void {
    const runtimes: string[] = this.applicationForm.value.runtime || [];
    const requiredControls: { [key: string]: string[] } = {
      java: ['agent_dir', 'tool_option', 'service_name'],
      dotnet: ['runtime_dir', 'service_name'],
      python: ['service_name'],
      php: ['service_name'],
      cpp: ['service_name']
    };
    Object.keys(requiredControls).forEach(section => {
      const group = this.configurationForm.get(section) as FormGroup;
      const selected = runtimes.indexOf(section) !== -1;
      requiredControls[section].forEach(name => {
        const control = group.get(name);
        if (selected) {
          control.setValidators([Validators.required, NoWhitespaceValidator]);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  // Add/remove the credential controls when the Local / My Credential radio changes.
  private bindCredentialTypeToggle(): void {
    this.hostConfigForm.get('credential_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type: string) => {
      if (type === 'my_credential') {
        this.hostConfigForm.removeControl('credentials');
        this.hostConfigForm.addControl('username', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        this.hostConfigForm.addControl('password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        this.hostConfigForm.removeControl('username');
        this.hostConfigForm.removeControl('password');
        this.hostConfigForm.addControl('credentials', new FormControl(null, [Validators.required]));
      }
    });
  }

  // ---------------------------------- Step navigation ----------------------------------

  next(): void {
    if (this.activeStepIndex === 0 && this.applicationForm.invalid) {
      this.applicationFormErrors = this.appUtilitySvc.validateForm(this.applicationForm, this.applicationFormValidationMessages, this.applicationFormErrors);
      this.bindApplicationRevalidation();
      return;
    }
    if (this.activeStepIndex === 1 && this.hostConfigForm.invalid) {
      this.hostConfigFormErrors = this.appUtilitySvc.validateForm(this.hostConfigForm, this.hostConfigFormValidationMessages, this.hostConfigFormErrors);
      this.bindHostConfigRevalidation();
      return;
    }
    if (this.activeStepIndex === 2) {
      this.applyConfigurationValidators();
      if (this.configurationForm.invalid) {
        this.configurationFormErrors = this.appUtilitySvc.validateForm(this.configurationForm, this.configurationFormValidationMessages, this.configurationFormErrors);
        this.bindConfigRevalidation();
        return;
      }
    }
    if (this.activeStepIndex < this.wizardSteps.length - 1) {
      this.activeStepIndex++;
    }
  }

  back(): void {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
    }
  }

  // Allow jumping back to an already-completed step; forward moves must go through Next.
  goToStep(index: number): void {
    if (index < this.activeStepIndex) {
      this.activeStepIndex = index;
    }
  }

  stepClass(index: number): string {
    if (index < this.activeStepIndex) {
      return 'success';
    }
    if (index === this.activeStepIndex) {
      return 'active';
    }
    return '';
  }

  // Re-validate on every change once submit has been attempted. Bound once so
  // repeated invalid Next clicks do not stack subscriptions.
  private bindApplicationRevalidation(): void {
    if (this.applicationRevalidateBound) {
      return;
    }
    this.applicationRevalidateBound = true;
    this.applicationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.applicationFormErrors = this.appUtilitySvc.validateForm(this.applicationForm, this.applicationFormValidationMessages, this.applicationFormErrors);
    });
  }

  private bindHostConfigRevalidation(): void {
    if (this.hostConfigRevalidateBound) {
      return;
    }
    this.hostConfigRevalidateBound = true;
    this.hostConfigForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.hostConfigFormErrors = this.appUtilitySvc.validateForm(this.hostConfigForm, this.hostConfigFormValidationMessages, this.hostConfigFormErrors);
    });
  }

  private bindConfigRevalidation(): void {
    if (this.configRevalidateBound) {
      return;
    }
    this.configRevalidateBound = true;
    this.configurationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.configurationFormErrors = this.appUtilitySvc.validateForm(this.configurationForm, this.configurationFormValidationMessages, this.configurationFormErrors);
    });
  }

  // ---------------------------------- Runtime helpers ----------------------------------

  // True when the given runtime/language is selected in the Application step.
  hasRuntime(value: string): boolean {
    const selected: string[] = this.applicationForm ? this.applicationForm.value.runtime : [];
    return !!selected && selected.indexOf(value) !== -1;
  }

  // ---------------------------------- Instruction popup ----------------------------------

  openInstruction(language: string): void {
    this.activeInstructionLang = language;
    this.instructionModalRef = this.modalSvc.show(this.instructionModal, CONFIRM_MODAL_CONFIG);
  }

  // ---------------------------------- Review helpers ----------------------------------

  getRuntimeLabels(): string {
    const selected: string[] = this.applicationForm.value.runtime || [];
    return this.runtimeOptions.filter(r => selected.indexOf(r.value) !== -1).map(r => r.label).join(', ');
  }

  getCollectorName(id: number): string {
    const collector = this.collectors.find(c => c.id === id);
    return collector ? collector.name : (id != null ? String(id) : '');
  }

  getCredentialName(id: number): string {
    const credential = this.credentials.find(c => c.id === id);
    return credential ? credential.name : (id != null ? String(id) : '');
  }

  getTagNames(): string {
    const selected: number[] = this.applicationForm.value.tags || [];
    return this.tags.filter(t => selected.indexOf(t.id) !== -1).map(t => t.tag_name).join(', ');
  }

  // The API keeps a single service_name; report it from the first selected
  // runtime's section that has a value.
  getServiceName(): string {
    const c = this.configurationForm.value;
    const runtimes: string[] = this.applicationForm.value.runtime || [];
    const serviceByRuntime: { [key: string]: string } = {
      java: c.java.service_name,
      dotnet: c.dotnet.service_name,
      python: c.python.service_name,
      php: c.php.service_name,
      cpp: c.cpp.service_name
    };
    for (const runtime of runtimes) {
      if (serviceByRuntime[runtime]) {
        return serviceByRuntime[runtime];
      }
    }
    return '';
  }

  // ---------------------------------- Submit ----------------------------------

  submit(): void {
    const payload = this.svc.buildPayload(this.applicationForm, this.hostConfigForm, this.configurationForm, this.instanceData);
    this.spinnerSvc.start('main');
    this.svc.save(payload, this.applicationId)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe(() => {
        this.notificationSvc.success(new Notification(this.applicationId ? 'Application updated successfully' : 'Application onboarded successfully'));
        this.goBack();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
  }

  handleError(err: any): void {
    this.applicationFormErrors = this.svc.resetApplicationFormErrors();
    this.hostConfigFormErrors = this.svc.resetHostConfigFormErrors();
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
        if (this.applicationForm.get(field)) {
          this.applicationFormErrors[field] = err[field][0];
        } else if (this.hostConfigForm.get(field)) {
          this.hostConfigFormErrors[field] = err[field][0];
        }
      }
    }
  }

  cancel(): void {
    this.goBack();
  }

  goBack(): void {
    this.router.navigate([this.applicationId ? '../../' : '../'], { relativeTo: this.route });
  }
}
