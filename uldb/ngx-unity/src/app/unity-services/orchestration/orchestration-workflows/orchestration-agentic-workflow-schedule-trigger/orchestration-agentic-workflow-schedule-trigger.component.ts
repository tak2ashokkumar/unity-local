import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { catchError, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { OrchestrationAgenticWorkflowScheduleTriggerService } from './orchestration-agentic-workflow-schedule-trigger.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';

@Component({
  selector: 'orchestration-agentic-workflow-schedule-trigger',
  templateUrl: './orchestration-agentic-workflow-schedule-trigger.component.html',
  styleUrls: ['./orchestration-agentic-workflow-schedule-trigger.component.scss'],
  providers: [OrchestrationAgenticWorkflowScheduleTriggerService]
})
export class OrchestrationAgenticWorkflowScheduleTriggerComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  scheduleForm: FormGroup;
  scheduleFormErrors: any;
  scheduleFormValidationMessage: any;

  workflowId: string;
  cloudAccount: any;
  credentials: any;
  workflowName: string;

  constructor(private svc: OrchestrationAgenticWorkflowScheduleTriggerService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private router: Router,
    private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workflowId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.getParameterDetails();
    this.getCloudAccount();
    this.getCredentials();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getParameterDetails() {
    this.spinner.start('main');
    this.svc.getScheduleTriggerDetails(this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.workflowName = param.name;
      this.buildScheduleForm(param);
      this.scheduleSvc.addOrEdit(param?.config?.schedule_meta);
    }, err => {
      this.notification.error(new Notification('Error while fetching Schedule Trigger Inputs. Please try again!!'));
    });
  }

  buildScheduleForm(param: any) {
    this.scheduleForm = this.svc.buildScheduleTriggerForm(param);
    this.scheduleFormErrors = this.svc.resetScheduleFormErrors();
    this.scheduleFormValidationMessage = this.svc.scheduleFormValidationMessages;
    this.spinner.stop('main');
  }

  updateManualFormErrors() {
    this.scheduleFormErrors.inputs = {};
    const inputs = this.scheduleForm.get('inputs') as FormArray;
    inputs.controls.forEach((group, i) => {
      this.scheduleFormErrors.inputs[i] = {};
      const defaultValueControl = group.get('default_value');
      if (defaultValueControl) {
        if (defaultValueControl.errors?.['required']) {
          console.log(this.scheduleFormValidationMessage.inputs.default_value, "default value")
          this.scheduleFormErrors.inputs[i].default_value = this.scheduleFormValidationMessage.inputs.default_value;
        }
        defaultValueControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
          if (value) {
            this.scheduleFormErrors.inputs[i].default_value = "";
          }
        });
      }
    });
  }

  get inputs(): FormArray {
    return this.scheduleForm.get('inputs') as FormArray;
  }

  getCloudAccount() {
    this.svc.getAllCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.cloudAccount = accounts;
    })
  }

  getCredentials() {
    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.credentials = accounts;
    })
  }

  searchTargets = (query: string): Observable<any[]> => {
    return this.svc.getHost(query).pipe(catchError(err => {
      this.notification.error(new Notification('Failed to fetch targets. Please try again later.'));
      return of([]);
    }));
  };

  formatParamName(name: string): string {
    if (!name) return '';
    return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  onSubmit() {
    if (this.scheduleForm.invalid) {
      this.updateManualFormErrors();
      return;
    } else {
      this.spinner.start('main');
      // const obj = { ...this.scheduleForm?.getRawValue(), config: { ...this.scheduleSvc.getFormValue() } }
      const rawValue = this.scheduleForm.getRawValue();
      const formConfig = this.scheduleSvc.getFormValue(); // contains schedule_meta

      const obj = { ...rawValue, config: { schedule_meta: { ...formConfig.schedule_meta, run_now: false } } };
      this.svc.sendScheduleTriggerDetails(this.workflowId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Schedule trigger execution started successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Schedule trigger execution failed'));
      });
    }
  }
}
