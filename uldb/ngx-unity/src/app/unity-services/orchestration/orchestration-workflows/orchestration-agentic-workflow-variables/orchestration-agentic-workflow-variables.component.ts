import { Component, OnInit } from '@angular/core';
import { OrchestrationAgenticWorkflowVariablesService, paramNameValidator } from './orchestration-agentic-workflow-variables.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Observable, of, Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { cloudAttributes, OrchestrationAgenticWorkflowParamsService } from '../orchestration-agentic-workflow-params/orchestration-agentic-workflow-params.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'orchestration-agentic-workflow-variables',
  templateUrl: './orchestration-agentic-workflow-variables.component.html',
  styleUrls: ['./orchestration-agentic-workflow-variables.component.scss'],
  providers: [OrchestrationAgenticWorkflowParamsService]
})
export class OrchestrationAgenticWorkflowVariablesComponent implements OnInit {

  workflowVarsForm: FormGroup;
  workflowVarsFormErrors;
  workflowVarsFormValidationMessages;

  workflowVarData;
  private ngUnsubscribe = new Subject();

  onClose!: (data: any) => void;
  updatedFormDatas: any;
  cloudAccount: any;
  credentials: any;

  constructor(
    private svc: OrchestrationAgenticWorkflowVariablesService,
    private utilService: AppUtilityService,
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private paramsCompSvc: OrchestrationAgenticWorkflowParamsService,
    private notification: AppNotificationService,
  ) { }

  ngOnInit(): void {

    this.getCloudAccount();
    this.getCredentials();
    this.buildForm();
  }

  buildForm(): void {
    this.workflowVarsForm = this.svc.createWorkflowVarsForm();
    this.workflowVarsFormErrors = this.svc.workflowVarFormErrors();
    this.workflowVarsFormValidationMessages = this.svc.workflowVarFormValidationMessage;

    const array = this.variables;
    array.clear();

    // Clear error array as well
    this.workflowVarsFormErrors.variables = [];

    (this.workflowVarData?.variables ?? []).forEach(v => {
      const group = this.svc.createWorkflowVarGroup(v);

      group.get('param_type')!
        .valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => group.get('default_value')!.reset(''));

      array.push(group);

      // Add matching error object
      this.workflowVarsFormErrors.variables.push({
        param_name: '',
        param_type: '',
        default_value: ''
      });
    });

    // Ensure at least one row exists
    // if (!array.length) {
    //   array.push(this.svc.createWorkflowVarGroup());

    //   this.workflowVarsFormErrors.variables.push({
    //     param_name: '',
    //     param_type: '',
    //     default_value: ''
    //   });
    // }
  }


  createWorkflowVarsForm() {
    this.workflowVarsForm = this.svc.createWorkflowVarsForm();
    this.workflowVarsFormErrors = this.svc.workflowVarFormErrors();
    this.workflowVarsFormValidationMessages = this.svc.workflowVarFormValidationMessage;

    const workflowVarsArray =
      this.workflowVarData?.variables?.map((v) =>
        this.fb.group({
          param_name: [
            v.param_name ?? '',
            [Validators.required, paramNameValidator],
          ],
          param_type: [v.param_type ?? '', [Validators.required]],
          default_value: [v.default_value ?? '', [Validators.required]],
        })
      ) ?? [];

    this.workflowVarsForm = this.fb.group({
      variables: this.fb.array(workflowVarsArray),
    });

    const firstParam = (this.workflowVarsForm.get('variables') as FormArray)?.at(
      0
    ) as FormGroup;
    if (firstParam) {
      firstParam
        .get('param_type')
        ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => firstParam.get('default_value')?.reset(''));
    }

    if (this.workflowVarData?.formErrors?.inputs?.length) {
      this.workflowVarsFormErrors = this.workflowVarData.formErrors;
    }

    return this.workflowVarsForm;
  }

  get variables(): FormArray {
    return this.workflowVarsForm.get('variables') as FormArray;
  }

  addVariable(): void {
    const variablesArray = this.variables;

    if (variablesArray.length > 0) {
      const lastInput = variablesArray.at(variablesArray.length - 1) as FormGroup;
      if (lastInput.invalid) {
        this.workflowVarsFormErrors['variables'][variablesArray.length - 1] =
          this.utilService.validateForm(
            lastInput,
            this.workflowVarsFormValidationMessages['variables'],
            this.workflowVarsFormErrors['variables'][variablesArray.length - 1]
          );
        lastInput.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.workflowVarsFormErrors['variables'][variablesArray.length - 1] =
              this.utilService.validateForm(
                lastInput,
                this.workflowVarsFormValidationMessages['variables'],
                this.workflowVarsFormErrors['variables'][variablesArray.length - 1]
              );
          });
        return;
      }
    }

    console.log('>>>>>', this.workflowVarsFormErrors)

    // Create new variable
    const newVar = this.svc.createWorkflowVarGroup();

    // Reset default value when param type changes
    newVar.get('param_type')!
      .valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => newVar.get('default_value')!.reset(''));

    //Push to form
    variablesArray.push(newVar);

    // Push empty error object
    this.workflowVarsFormErrors?.variables?.push({
      param_name: '',
      param_type: '',
      default_value: ''
    });
  }

  validateForm() {

  }

  removeVariable(index: number): void {
    this.variables.removeAt(index);
    if (this.workflowVarsFormErrors?.variables?.length > index) {
      this.workflowVarsFormErrors.variables.splice(index, 1);
    }
  }

  getCloudAccount() {
    this.paramsCompSvc
      .getAllCloud()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((accounts) => {
        this.cloudAccount = accounts;
      });
  }

  getAttributesForInput(input: any): string[] {
    if (input.param_type === 'Cloud Account') {
      const account = this.cloudAccount?.find(
        (acc) => acc.uuid === input.default_value.uuid
      );
      if (!account) {
        return [];
      }
      const attrConfig = cloudAttributes.find(
        (c) => c.cloudType === account.cloud_type
      );
      return attrConfig ? attrConfig.attributes : [];
    }

    if (input.param_type === 'Credential') {
      return ['username', 'password'];
    }

    return [];
  }


  getCredentials() {
    this.paramsCompSvc
      .getCredentials()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((accounts) => {
        this.credentials = accounts;
      });
  }

  searchTargets = (query: string): Observable<any[]> => {
    return this.paramsCompSvc.getHost(query).pipe(
      catchError((err) => {
        this.notification.error(
          new Notification('Failed to fetch targets. Please try again later.')
        );
        return of([]);
      })
    );
  };

  compareAccounts(a: any, b: any): boolean {
    return a && b ? a.uuid === b.uuid : a === b;
  }

  autoSaveProperties() {
    this.updatedFormDatas = {
      workflowVarsForm: this.workflowVarsForm.getRawValue(),
      // workflowVarsFormErrors: this.workflowVarsFormErrors,
      // workflowVarsFormValidationMessages: this.workflowVarsFormValidationMessages,
    };
  }

  closeModal(action?: string) {
    if (action === 'save') {
      const variablesArray = this.variables;

      let hasError = false;

      variablesArray.controls.forEach((control: AbstractControl, index: number) => {
        const formGroup = control as FormGroup;

        if (formGroup.invalid) {
          hasError = true;

          this.workflowVarsFormErrors['variables'][index] =
            this.utilService.validateForm(
              formGroup,
              this.workflowVarsFormValidationMessages['variables'],
              this.workflowVarsFormErrors['variables'][index]
            );

          formGroup.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.workflowVarsFormErrors['variables'][index] =
                this.utilService.validateForm(
                  formGroup,
                  this.workflowVarsFormValidationMessages['variables'],
                  this.workflowVarsFormErrors['variables'][index]
                );
            });
        }
      });

      if (hasError) {
        return;
      }

      if (this.onClose) {
        this.autoSaveProperties();
        this.onClose(this.updatedFormDatas);
        this.bsModalRef.hide();
      }

    } else {
      this.bsModalRef.hide();
    }
  }

}
