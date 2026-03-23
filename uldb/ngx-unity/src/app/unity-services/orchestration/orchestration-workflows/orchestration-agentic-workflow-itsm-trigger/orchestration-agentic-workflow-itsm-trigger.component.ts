import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { OrchestrationAgenticWorkflowItsmTriggerService } from './orchestration-agentic-workflow-itsm-trigger.service';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'orchestration-agentic-workflow-itsm-trigger',
  templateUrl: './orchestration-agentic-workflow-itsm-trigger.component.html',
  styleUrls: ['./orchestration-agentic-workflow-itsm-trigger.component.scss'],
  providers: [OrchestrationAgenticWorkflowItsmTriggerService]
})
export class OrchestrationAgenticWorkflowItsmTriggerComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  itsmTriggerForm: FormGroup;
  itsmTriggerFormErrors: any;
  itsmTriggerFormValidationMessage: any;
  workflowId: string;
  workflowName: string;
  itsmData: any;
  commentData: any

  constructor(private svc: OrchestrationAgenticWorkflowItsmTriggerService,
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
    this.getItsmDetails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getUnityOneITSM(data) {
    console.log('>>>', data);
    this.svc.getUnityOneITSMData(data?.config?.itsm_table).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.itsmData = res.results;
      this.recordUuidChange(data);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load ITSM Table data'));
    });
  }

  recordUuidChange(data) {
    this.itsmTriggerForm.get('record_uuid')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((recordUuid: string) => {
      const tableId = data?.config?.itsm_table;
      const activityType = data?.config?.event_type.join(',');
      this.callCommentActivity(tableId, recordUuid, activityType);
    });
  }

  callCommentActivity(tableId: string, recordUuid: string, activityType: string) {
    this.svc.getCommentActivity(tableId, recordUuid, activityType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.commentData = res;
    }, () => {
      this.notification.error(new Notification('Failed to load comment activity'));
    });
  }

  formatActivityType(type: string): string {
    if (!type) return '';
    return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getItsmDetails() {
    this.spinner.start('main');
    this.svc.getITSMTriggerDetails(this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.workflowName = param.name;
      this.getUnityOneITSM(param);
      this.buildItsmForm(param);
    }, err => {
      this.notification.error(new Notification('Error while fetching ITSM Event Trigger Inputs. Please try again!!'));
    });
  }

  buildItsmForm(param: any) {
    this.itsmTriggerForm = this.svc.buildITSMTriggerForm(param);
    this.itsmTriggerFormErrors = this.svc.resetITSMFormErrors();
    this.itsmTriggerFormValidationMessage = this.svc.itsmFormValidationMessages;
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.itsmTriggerForm.invalid) {
      this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors);
      this.itsmTriggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.itsmTriggerFormErrors = this.utilService.validateForm(this.itsmTriggerForm, this.itsmTriggerFormValidationMessage, this.itsmTriggerFormErrors);
      });
      return;
    } else {
      this.spinner.start('main');
      const obj = { itsm_data: this.itsmTriggerForm.getRawValue() }
      this.svc.sendITSMTriggerDetails(this.workflowId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('ITSM event trigger execution started successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('ITSM event trigger execution failed'));
      });
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
