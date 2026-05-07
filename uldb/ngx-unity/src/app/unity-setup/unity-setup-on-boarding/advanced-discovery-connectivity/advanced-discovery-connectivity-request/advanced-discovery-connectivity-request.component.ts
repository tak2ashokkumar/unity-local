import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AdvancedDiscoveryConnectivityRequestService } from './advanced-discovery-connectivity-request.service';
import {
  AdvancedDiscoveryConnectivityRequestCommand,
  AdvancedDiscoveryConnectivityRequestCreatePayload,
  AdvancedDiscoveryConnectivityRequestCreateResponse,
  AdvancedDiscoveryConnectivityRequestStep,
  AdvancedDiscoveryConnectivityRequestStepId
} from './advanced-discovery-connectivity-request.type';

@Component({
  selector: 'advanced-discovery-connectivity-request',
  templateUrl: './advanced-discovery-connectivity-request.component.html',
  styleUrls: ['./advanced-discovery-connectivity-request.component.scss'],
  providers: [AdvancedDiscoveryConnectivityRequestService]
})
export class AdvancedDiscoveryConnectivityRequestComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  activeStep: AdvancedDiscoveryConnectivityRequestStepId = 'collectorDetails';

  collectorForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  
  downloadProgress = 0;
  isDownloading = false;
  isDownloaded = false;

  commands: AdvancedDiscoveryConnectivityRequestCommand[] = [];
  private collectorRequestUuid: string = '';
  private isValidationSubscriptionAdded = false;
  nonFieldErr: string = '';

  steps: AdvancedDiscoveryConnectivityRequestStep[] = [
    { id: 'collectorDetails', label: 'Collector Details', icon: 'fas fa-link' },
    { id: 'downloadFile', label: 'Download File', icon: 'fas fa-download' },
    { id: 'runCommand', label: 'Run Command', icon: 'fas fa-code' }
  ];

  constructor(
    private svc: AdvancedDiscoveryConnectivityRequestService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.collectorForm = this.svc.buildForm();
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get activeStepIndex() {
    return this.steps.findIndex(step => step.id === this.activeStep);
  }

  get formPayload(): AdvancedDiscoveryConnectivityRequestCreatePayload {
    return this.svc.getFormPayload(this.collectorForm);
  }

  getStepClass(step: AdvancedDiscoveryConnectivityRequestStep) {
    const stepIndex = this.steps.findIndex(item => item.id === step.id);
    if (step.id === this.activeStep) {
      return 'active';
    }
    if (stepIndex < this.activeStepIndex) {
      return 'success';
    }
    return 'disabled';
  }

  goBack() {
    if (this.activeStep === 'collectorDetails') {
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }
    this.activeStep = this.activeStep === 'runCommand' ? 'downloadFile' : 'collectorDetails';
  }

  goNextFromDetails() {
    this.nonFieldErr = '';
    if (!this.validateCollectorDetails()) {
      return;
    }
    this.spinner.start('main');
    this.svc.createCollectorRequest(this.formPayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleCreateCollectorSuccess(res);
    }, (err: HttpErrorResponse) => {
      this.handleCreateCollectorError(err);
    });
  }

  requestAccess() {
    if (this.isDownloading) {
      return;
    }
    if (!this.collectorRequestUuid) {
      this.notification.error(new Notification('Error while downloading collector file. Please try again.'));
      return;
    }
    this.isDownloading = true;
    this.downloadProgress = 0;
    this.spinner.start('main');
    this.svc.downloadCollectorBundle(this.collectorRequestUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.saveCollectorFile(res);
      this.commands = this.svc.getCommands(this.formPayload);
      this.downloadProgress = 100;
      this.isDownloaded = true;
      this.isDownloading = false;
      this.spinner.stop('main');
      this.notification.success(new Notification('Collector file downloaded successfully.'));
    }, (err: HttpErrorResponse) => {
      this.isDownloading = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while downloading collector file. Please try again.'));
    });
  }

  goToRunCommand() {
    this.commands = this.svc.getCommands(this.formPayload);
    this.activeStep = 'runCommand';
  }

  submit() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  copyCommand(command: string) {
    navigator.clipboard.writeText(command).then(() => {
      this.notification.success(new Notification('Command copied to clipboard.'));
    }, () => {
      this.notification.error(new Notification('Failed to copy command. Please try again.'));
    });
  }

  private subscribeForValidation() {
    if (this.isValidationSubscriptionAdded) {
      return;
    }
    this.isValidationSubscriptionAdded = true;
    this.collectorForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.formErrors = this.utilService.validateForm(this.collectorForm, this.validationMessages, this.formErrors);
    });
  }

  private validateCollectorDetails() {
    if (this.collectorForm.valid) {
      return true;
    }
    this.formErrors = this.utilService.validateForm(this.collectorForm, this.validationMessages, this.formErrors);
    this.subscribeForValidation();
    return false;
  }

  private handleCreateCollectorSuccess(res: AdvancedDiscoveryConnectivityRequestCreateResponse) {
    this.collectorRequestUuid = this.svc.getCollectorRequestUuid(res);
    // TODO: Enable this check once the create API response UUID shape is finalized.
    // if (!this.collectorRequestUuid) {
    //   this.nonFieldErr = 'Something went wrong!! Please try again.';
    //   this.spinner.stop('main');
    //   return;
    // }
    this.moveToDownloadStep();
  }

  private moveToDownloadStep() {
    this.commands = this.svc.getCommands(this.formPayload);
    this.resetDownloadState();
    this.activeStep = 'downloadFile';
    this.spinner.stop('main');
  }

  private handleCreateCollectorError(err: HttpErrorResponse) {
    // TODO: Restore this error handling once the create API is ready for this flow.
    // const errors = this.svc.applyCreateErrors(err.error, this.formErrors);
    // this.formErrors = errors.formErrors;
    // this.nonFieldErr = errors.nonFieldErr;
    // this.subscribeForValidation();
    this.moveToDownloadStep();
  }

  private resetDownloadState() {
    this.downloadProgress = 0;
    this.isDownloaded = false;
    this.isDownloading = false;
  }
}
