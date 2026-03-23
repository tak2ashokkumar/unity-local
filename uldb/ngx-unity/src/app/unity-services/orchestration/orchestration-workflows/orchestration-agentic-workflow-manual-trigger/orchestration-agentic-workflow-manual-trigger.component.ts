import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrchestrationAgenticWorkflowManualTriggerService } from './orchestration-agentic-workflow-manual-trigger.service';
import { FormArray, FormGroup } from '@angular/forms';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { catchError, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'orchestration-agentic-workflow-manual-trigger',
  templateUrl: './orchestration-agentic-workflow-manual-trigger.component.html',
  styleUrls: ['./orchestration-agentic-workflow-manual-trigger.component.scss'],
  providers: [OrchestrationAgenticWorkflowManualTriggerService]
})
export class OrchestrationAgenticWorkflowManualTriggerComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  manualForm: FormGroup;
  manualFormErrors: any;
  manualFormValidationMessage: any;

  workflowId: string;
  cloudAccount: any;
  credentials: any;
  workflowName: string;

  constructor(private svc: OrchestrationAgenticWorkflowManualTriggerService,
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
    this.svc.getManualTriggerDetails(this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.workflowName = param.name;
      this.buildManualForm(param);
    }, err => {
      this.notification.error(new Notification('Error while fetching Manual Trigger Inputs. Please try again!!'));
    });
  }

  buildManualForm(param: any) {
    this.manualForm = this.svc.buildManualTriggerForm(param);
    this.manualFormErrors = this.svc.resetManualFormErrors();
    this.manualFormValidationMessage = this.svc.manualFormValidationMessages;
    this.spinner.stop('main');
  }

  updateManualFormErrors() {
    this.manualFormErrors.inputs = {};
    const inputs = this.manualForm.get('inputs') as FormArray;
    inputs.controls.forEach((group, i) => {
      this.manualFormErrors.inputs[i] = {};
      const defaultValueControl = group.get('default_value');
      if (defaultValueControl) {
        if (defaultValueControl.errors?.['required']) {
          console.log(this.manualFormValidationMessage.inputs.default_value, "default value")
          this.manualFormErrors.inputs[i].default_value = this.manualFormValidationMessage.inputs.default_value;
        }
        defaultValueControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
          if (value) {
            this.manualFormErrors.inputs[i].default_value = "";
          }
        });
      }
    });
  }


  get inputs(): FormArray {
    return this.manualForm.get('inputs') as FormArray;
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

  compareAccounts(a: any, b: any): boolean {
    console.log(a, b, "compare")
    return a && b ? a.uuid === b.uuid : a === b;
  }

  formatParamName(name: string): string {
    if (!name) return '';
    return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  onSubmit() {
    if (this.manualForm.invalid) {
      this.updateManualFormErrors();
      return;
    } else {
      this.spinner.start('main');
      const obj = this.manualForm.getRawValue();
      this.svc.sendManualTriggerDetails(this.workflowId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Manual trigger execution started successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Manual trigger execution failed'));
      });
    }
  }


}
