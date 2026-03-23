import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { OrchestrationAgenticWorkflowWebhookTriggerService } from './orchestration-agentic-workflow-webhook-trigger.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'orchestration-agentic-workflow-webhook-trigger',
  templateUrl: './orchestration-agentic-workflow-webhook-trigger.component.html',
  styleUrls: ['./orchestration-agentic-workflow-webhook-trigger.component.scss'],
  providers: [OrchestrationAgenticWorkflowWebhookTriggerService]
})
export class OrchestrationAgenticWorkflowWebhookTriggerComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  webhookTriggerForm: FormGroup;
  webhookTriggerFormErrors: any;
  webhookTriggerFormValidationMessage: any;
  workflowId: string;
  workflowName: string;

  constructor(private svc: OrchestrationAgenticWorkflowWebhookTriggerService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private router: Router) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workflowId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.getWebhookDetails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getWebhookDetails() {
    this.spinner.start('main');
    this.svc.getWebhookTriggerDetails(this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.workflowName = param.name;
      this.buildWebhookForm(param);
    }, err => {
      this.notification.error(new Notification('Error while fetching Webhook Trigger Inputs. Please try again!!'));
    });
  }

  buildWebhookForm(param: any) {
    this.webhookTriggerForm = this.svc.buildWebhookTriggerForm(param);
    this.webhookTriggerFormErrors = this.svc.resetManualFormErrors();
    this.webhookTriggerFormValidationMessage = this.svc.manualFormValidationMessages;
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.webhookTriggerForm.invalid) {
      this.webhookTriggerFormErrors = this.utilService.validateForm(this.webhookTriggerForm, this.webhookTriggerFormValidationMessage, this.webhookTriggerFormErrors);
      this.webhookTriggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.webhookTriggerFormErrors = this.utilService.validateForm(this.webhookTriggerForm, this.webhookTriggerFormValidationMessage, this.webhookTriggerFormErrors);
      });
      return;
    } else {
      this.spinner.start('main');
      const raw = this.webhookTriggerForm.getRawValue();
      const obj = { ...raw, payload: JSON.parse(raw.payload) }
      this.svc.sendWebhookTriggerDetails(this.workflowId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Webhook trigger execution started successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Webhook trigger execution failed'));
      });
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
