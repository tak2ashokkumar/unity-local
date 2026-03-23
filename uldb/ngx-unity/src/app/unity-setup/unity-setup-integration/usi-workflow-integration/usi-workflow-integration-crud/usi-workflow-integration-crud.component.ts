import { Component, OnDestroy, OnInit } from '@angular/core';
import { CONDITIONAL_OPERATOR, ConditionalOperator, OUTPUT_TYPE, UsiWorkflowIntegrationCrudService } from './usi-workflow-integration-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { isString } from 'vis-util/esnext';

@Component({
  selector: 'usi-workflow-integration-crud',
  templateUrl: './usi-workflow-integration-crud.component.html',
  styleUrls: ['./usi-workflow-integration-crud.component.scss'],
  providers: [UsiWorkflowIntegrationCrudService]
})

export class UsiWorkflowIntegrationCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  action: string = 'Create';
  workFlowForm: FormGroup;
  workFlowFormErrors: any;
  workFlowFormValidationMessages: any;
  nonFieldErr: string = "";
  workFlowDetails: any;

  workFlowId: string;
  taskList: any;
  workflowList: any;
  taskAndWorkflowList2D: any[][] = [[]];
  prevIndex: number;

  conditionalOperator = CONDITIONAL_OPERATOR;
  outputType = OUTPUT_TYPE;

  // parameterMaps: any[] = [];

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private svc: UsiWorkflowIntegrationCrudService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.workFlowId = params.get('workflowId');
      this.action = this.workFlowId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    this.svc.getTaskList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.taskList = res;
    });
    this.svc.getWorkflowList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workflowList = res;
    });
    if (this.workFlowId) {
      setTimeout(() => {
        this.getWorkflow();
      }, 700)
    } else {
      setTimeout(() => {
        this.buildForm();
      }, 700)
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.workFlowForm = this.svc.buildWorkflowForm(this.workFlowDetails);
    this.workFlowFormErrors = this.svc.resetWorkflowFormErrors();
    this.workFlowFormValidationMessages = this.svc.workFlowValidationMessages;
    this.taskTypeChange();
  }

  getWorkflow() {
    this.svc.getWorkflowDetails(this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workFlowDetails = res;
      this.buildForm();
    });
  }

  get parameterMaps(): FormArray {
    return this.workFlowForm.get('parameter_maps') as FormArray;
  }

  taskTypeChange() {
    if (this.workFlowId) {
      const taskType = this.workFlowForm.get('task_type')?.value;
      if (taskType === 'TASK') {
        this.workFlowForm.addControl('task', new FormControl(this.workFlowDetails.task, [Validators.required]));
        this.workFlowForm.removeControl('workflow');
      }
      if (taskType == 'WORKFLOW') {
        this.workFlowForm.addControl('workflow', new FormControl(this.workFlowDetails.workflow, [Validators.required]));
        this.workFlowForm.removeControl('task');
      }
      const parameterMapFormArray = this.workFlowForm.get('parameter_maps') as FormArray;
      if (this.workFlowDetails.parameter_maps.length) {
        this.workFlowFormErrors = this.svc.resetWorkflowFormErrors(true);
      }
      this.workFlowDetails.parameter_maps.forEach((param, i) => {
        const paramFormGroup = this.builder.group({
          param_name: [param.param_name, Validators.required],
          request_attribute: [param.request_attribute, Validators.required],
          mapping_type: [param.mapping_type, Validators.required],
          default_value: [param.default_value],
          conditions: this.builder.array([])
        });
        if (!this.taskAndWorkflowList2D[i]) {
          this.taskAndWorkflowList2D[i] = [];
        }
        this.workFlowFormErrors.parameter_maps.push(this.svc.prameterMapsFormErrors());
        if (param.mapping_type === 'CONDITIONAL' && param.conditions.length > 0) {
          const conditionsArray = paramFormGroup.get('conditions') as FormArray;
          param.conditions.forEach((condition, j) => {
            this.workFlowFormErrors.parameter_maps[i].conditions.push(this.svc.getConditionsFormErrors());
            const singleCondition = this.builder.group({
              condition_operator: [condition.condition_operator, Validators.required],
              condition_value: [condition.condition_value, Validators.required],
              result_type: [condition.result_type, Validators.required],
              result_value: [condition.result_value, Validators.required]
            });
            if (condition.result_type == "TASK") {
              this.taskAndWorkflowList2D[i][j] = this.taskList;
            } else if (condition.result_type == "WORKFLOW") {
              this.taskAndWorkflowList2D[i][j] = this.workflowList;
            } else {
              this.taskAndWorkflowList2D[i][j] = "";
            }
            this.manageConditionsFormGroup(singleCondition, i, j);
            conditionsArray.push(singleCondition);
            this.prevIndex = j;
          });
        }
        paramFormGroup.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mappingType => {
          if (mappingType === 'CONDITIONAL') {
            console.log('yaha pe conditional', i);
            const conditionsArray = this.builder.array([]);
            const conditionsGroup = this.builder.group({
              condition_operator: ['', Validators.required],
              condition_value: ['', Validators.required],
              result_type: ['STRING', Validators.required],
              result_value: ['', Validators.required],
            });
            conditionsArray.push(conditionsGroup);
            this.workFlowFormErrors.parameter_maps[i].conditions.push(this.svc.getConditionsFormErrors());
            paramFormGroup.addControl('conditions', conditionsArray);
            this.manageParameterFormArray(paramFormGroup, i, 0);
            // parameterMapFormArray.insert(i, paramFormGroup);

          } else {
            if (paramFormGroup.get('conditions')) {
              paramFormGroup.removeControl('conditions');
            }
          }
        });
        this.manageParameterFormArray(paramFormGroup, i, 0);
        parameterMapFormArray.push(paramFormGroup);
      });
      this.spinner.stop('main');
      this.workFlowForm.get('task')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedTaskId) => {
        this.spinner.start('main');
        if (selectedTaskId) {
          this.svc.getTaskParameter(selectedTaskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(taskParameters => {
            if (taskParameters.inputs) {
              this.workFlowFormErrors = this.svc.resetWorkflowFormErrors(true);
              const parameterMaps = this.workFlowForm.get('parameter_maps') as FormArray;
              parameterMaps.clear();
              taskParameters.inputs.forEach((input, k) => {
                const paramGroup = this.svc.createParameterMaps([input]).controls[0] as FormGroup;
                parameterMaps.push(paramGroup);
                this.workFlowFormErrors.parameter_maps.push(this.svc.prameterMapsFormErrors());
                paramGroup.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mappingType => {
                  if (mappingType === 'CONDITIONAL') {
                    if (!paramGroup.get('conditions')) {
                      const conditionsArray = this.builder.array([]);
                      const conditionsGroup = this.builder.group({
                        condition_operator: ['', Validators.required],
                        condition_value: ['', Validators.required],
                        result_type: ['STRING', Validators.required],
                        result_value: ['', Validators.required],
                      });
                      conditionsArray.push(conditionsGroup);
                      this.workFlowFormErrors.parameter_maps[k].conditions.push(this.svc.getConditionsFormErrors());
                      paramGroup.addControl('conditions', conditionsArray);
                      if (!this.taskAndWorkflowList2D[k]) {
                        this.taskAndWorkflowList2D[k] = [];
                      }
                      if (this.taskAndWorkflowList2D[k][0] === undefined) {
                        this.taskAndWorkflowList2D[k][0] = "";
                      } else {
                        this.taskAndWorkflowList2D[k][0] = "";
                      }
                      conditionsGroup.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
                        conditionsGroup.get('result_value')?.setValue('');
                        if (res == "TASK") {
                          this.taskAndWorkflowList2D[k][0] = this.taskList;
                        } else if (res == "WORKFLOW") {
                          this.taskAndWorkflowList2D[k][0] = this.workflowList;
                        } else {
                          this.taskAndWorkflowList2D[k][0] = "";
                        }
                      });
                    }
                  } else {
                    if (paramGroup.get('conditions')) {
                      paramGroup.removeControl('conditions');
                    }
                  }
                });
              });
            }
          });
        }
        setTimeout(() => {
          this.spinner.stop('main');
        }, 1000)
      });
      this.workFlowForm.get('workflow')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedWorkflowId) => {
        this.spinner.start('main');
        if (selectedWorkflowId) {
          this.svc.getWorkflowParameter(selectedWorkflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(workFlowParameters => {
            if (workFlowParameters.tasks) {
              const parameterMaps = this.workFlowForm.get('parameter_maps') as FormArray;
              parameterMaps.clear();
              this.workFlowFormErrors = this.svc.resetWorkflowFormErrors(true);
              workFlowParameters.tasks.forEach(task => {
                task.inputs.forEach((input, k) => {
                  const paramGroup = this.svc.createParameterMaps([input]).controls[0] as FormGroup;
                  parameterMaps.push(paramGroup);
                  this.workFlowFormErrors.parameter_maps.push(this.svc.prameterMapsFormErrors());
                  paramGroup.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mappingType => {
                    if (mappingType === 'CONDITIONAL') {
                      if (!paramGroup.get('conditions')) {
                        const conditionsArray = this.builder.array([]);
                        const conditionsGroup = this.builder.group({
                          condition_operator: ['', Validators.required],
                          condition_value: ['', Validators.required],
                          result_type: ['STRING', Validators.required],
                          result_value: ['', Validators.required],
                        });
                        conditionsArray.push(conditionsGroup);
                        paramGroup.addControl('conditions', conditionsArray);
                        this.workFlowFormErrors.parameter_maps[k].conditions.push(this.svc.getConditionsFormErrors());
                        if (!this.taskAndWorkflowList2D[k]) {
                          this.taskAndWorkflowList2D[k] = [];
                        }
                        if (this.taskAndWorkflowList2D[k][0] === undefined) {
                          this.taskAndWorkflowList2D[k][0] = "";
                        } else {
                          this.taskAndWorkflowList2D[k][0] = "";
                        }
                        conditionsGroup.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
                          conditionsGroup.get('result_value')?.setValue('');
                          if (res == "TASK") {
                            this.taskAndWorkflowList2D[k][0] = this.taskList;
                          } else if (res == "WORKFLOW") {
                            this.taskAndWorkflowList2D[k][0] = this.workflowList;
                          } else {
                            this.taskAndWorkflowList2D[k][0] = "";
                          }
                        });
                      }
                    } else {
                      if (paramGroup.get('conditions')) {
                        paramGroup.removeControl('conditions');
                      }
                    }
                  });
                });
              });
            } else if (workFlowParameters.inputs) {
              const parameterMaps = this.workFlowForm.get('parameter_maps') as FormArray;
              parameterMaps.clear();
              this.workFlowFormErrors = this.svc.resetWorkflowFormErrors(true);
              workFlowParameters.inputs.forEach((input, k) => {
                const paramGroup = this.svc.createParameterMaps([input]).controls[0] as FormGroup;
                parameterMaps.push(paramGroup);
                this.workFlowFormErrors.parameter_maps.push(this.svc.prameterMapsFormErrors());
                paramGroup.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mappingType => {
                  if (mappingType === 'CONDITIONAL') {
                    if (!paramGroup.get('conditions')) {
                      const conditionsArray = this.builder.array([]);
                      const conditionsGroup = this.builder.group({
                        condition_operator: ['', Validators.required],
                        condition_value: ['', Validators.required],
                        result_type: ['STRING', Validators.required],
                        result_value: ['', Validators.required],
                      });
                      conditionsArray.push(conditionsGroup);
                      paramGroup.addControl('conditions', conditionsArray);
                      this.workFlowFormErrors.parameter_maps[k].conditions.push(this.svc.getConditionsFormErrors());
                      if (!this.taskAndWorkflowList2D[k]) {
                        this.taskAndWorkflowList2D[k] = [];
                      }
                      if (this.taskAndWorkflowList2D[k][0] === undefined) {
                        this.taskAndWorkflowList2D[k][0] = "";
                      } else {
                        this.taskAndWorkflowList2D[k][0] = "";
                      }
                      conditionsGroup.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
                        conditionsGroup.get('result_value')?.setValue('');
                        if (res == "TASK") {
                          this.taskAndWorkflowList2D[k][0] = this.taskList;
                        } else if (res == "WORKFLOW") {
                          this.taskAndWorkflowList2D[k][0] = this.workflowList;
                        } else {
                          this.taskAndWorkflowList2D[k][0] = "";
                        }
                      });
                    }
                  } else {
                    if (paramGroup.get('conditions')) {
                      paramGroup.removeControl('conditions');
                    }
                  }
                });
              });
            }
          });
        }
        setTimeout(() => {
          this.spinner.stop('main');
        }, 1000)
      });
    }
    this.workFlowForm.get('task_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedType) => {
      this.taskAndWorkflowList2D = [[]];
      if (selectedType === 'TASK') {
        this.workFlowForm.addControl('task', new FormControl('', [Validators.required]));
        this.workFlowForm.removeControl('workflow');
        this.workFlowForm.get('task')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedTaskId) => {
          this.spinner.start('main');
          if (selectedTaskId) {
            this.svc.getTaskParameter(selectedTaskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(taskParameters => {
              if (taskParameters.inputs) {
                this.workFlowFormErrors = this.svc.resetWorkflowFormErrors(true);
                const parameterMaps = this.workFlowForm.get('parameter_maps') as FormArray;
                parameterMaps.clear();
                taskParameters.inputs.forEach((input, k) => {
                  const paramGroup = this.svc.createParameterMaps([input]).controls[0] as FormGroup;
                  parameterMaps.push(paramGroup);
                  this.workFlowFormErrors.parameter_maps.push(this.svc.prameterMapsFormErrors());
                  paramGroup.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mappingType => {
                    if (mappingType === 'CONDITIONAL') {
                      if (!paramGroup.get('conditions')) {
                        const conditionsArray = this.builder.array([]);
                        const conditionsGroup = this.builder.group({
                          condition_operator: ['', Validators.required],
                          condition_value: ['', Validators.required],
                          result_type: ['STRING', Validators.required],
                          result_value: ['', Validators.required],
                        });
                        conditionsArray.push(conditionsGroup);
                        this.workFlowFormErrors.parameter_maps[k].conditions.push(this.svc.getConditionsFormErrors());
                        paramGroup.addControl('conditions', conditionsArray);
                        if (!this.taskAndWorkflowList2D[k]) {
                          this.taskAndWorkflowList2D[k] = [];
                        }
                        if (this.taskAndWorkflowList2D[k][0] === undefined) {
                          this.taskAndWorkflowList2D[k][0] = "";
                        } else {
                          this.taskAndWorkflowList2D[k][0] = "";
                        }
                        conditionsGroup.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
                          conditionsGroup.get('result_value')?.setValue('');
                          if (res == "TASK") {
                            this.taskAndWorkflowList2D[k][0] = this.taskList;
                          } else if (res == "WORKFLOW") {
                            this.taskAndWorkflowList2D[k][0] = this.workflowList;
                          } else {
                            this.taskAndWorkflowList2D[k][0] = "";
                          }
                        });
                      }
                    } else {
                      if (paramGroup.get('conditions')) {
                        paramGroup.removeControl('conditions');
                      }
                    }
                  });
                });
              }
            });
          }
          setTimeout(() => {
            this.spinner.stop('main');
          }, 1000)
        });
      }
      else {
        this.workFlowForm.addControl('workflow', new FormControl('', [Validators.required]));
        this.workFlowForm.removeControl('task');
        this.workFlowForm.get('workflow')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedWorkflowId) => {
          this.spinner.start('main');
          if (selectedWorkflowId) {
            this.svc.getWorkflowParameter(selectedWorkflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(workFlowParameters => {
              if (workFlowParameters.tasks) {
                const parameterMaps = this.workFlowForm.get('parameter_maps') as FormArray;
                parameterMaps.clear();
                this.workFlowFormErrors = this.svc.resetWorkflowFormErrors(true);
                workFlowParameters.tasks.forEach(task => {
                  task.inputs.forEach((input, k) => {
                    const paramGroup = this.svc.createParameterMaps([input]).controls[0] as FormGroup;
                    parameterMaps.push(paramGroup);
                    this.workFlowFormErrors.parameter_maps.push(this.svc.prameterMapsFormErrors());
                    paramGroup.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mappingType => {
                      if (mappingType === 'CONDITIONAL') {
                        if (!paramGroup.get('conditions')) {
                          const conditionsArray = this.builder.array([]);
                          const conditionsGroup = this.builder.group({
                            condition_operator: ['', Validators.required],
                            condition_value: ['', Validators.required],
                            result_type: ['STRING', Validators.required],
                            result_value: ['', Validators.required],
                          });
                          conditionsArray.push(conditionsGroup);
                          paramGroup.addControl('conditions', conditionsArray);
                          this.workFlowFormErrors.parameter_maps[k].conditions.push(this.svc.getConditionsFormErrors());
                          if (!this.taskAndWorkflowList2D[k]) {
                            this.taskAndWorkflowList2D[k] = [];
                          }
                          if (this.taskAndWorkflowList2D[k][0] === undefined) {
                            this.taskAndWorkflowList2D[k][0] = "";
                          } else {
                            this.taskAndWorkflowList2D[k][0] = "";
                          }
                          conditionsGroup.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
                            conditionsGroup.get('result_value')?.setValue('');
                            if (res == "TASK") {
                              this.taskAndWorkflowList2D[k][0] = this.taskList;
                            } else if (res == "WORKFLOW") {
                              this.taskAndWorkflowList2D[k][0] = this.workflowList;
                            } else {
                              this.taskAndWorkflowList2D[k][0] = "";
                            }
                          });
                        }
                      } else {
                        if (paramGroup.get('conditions')) {
                          paramGroup.removeControl('conditions');
                        }
                      }
                    });
                  });
                });
              } else if (workFlowParameters.inputs) {
                const parameterMaps = this.workFlowForm.get('parameter_maps') as FormArray;
                parameterMaps.clear();
                this.workFlowFormErrors = this.svc.resetWorkflowFormErrors(true);
                workFlowParameters.inputs.forEach((input, k) => {
                  const paramGroup = this.svc.createParameterMaps([input]).controls[0] as FormGroup;
                  parameterMaps.push(paramGroup);
                  this.workFlowFormErrors.parameter_maps.push(this.svc.prameterMapsFormErrors());
                  paramGroup.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mappingType => {
                    if (mappingType === 'CONDITIONAL') {
                      if (!paramGroup.get('conditions')) {
                        const conditionsArray = this.builder.array([]);
                        const conditionsGroup = this.builder.group({
                          condition_operator: ['', Validators.required],
                          condition_value: ['', Validators.required],
                          result_type: ['STRING', Validators.required],
                          result_value: ['', Validators.required],
                        });
                        conditionsArray.push(conditionsGroup);
                        paramGroup.addControl('conditions', conditionsArray);
                        this.workFlowFormErrors.parameter_maps[k].conditions.push(this.svc.getConditionsFormErrors());
                        if (!this.taskAndWorkflowList2D[k]) {
                          this.taskAndWorkflowList2D[k] = [];
                        }
                        if (this.taskAndWorkflowList2D[k][0] === undefined) {
                          this.taskAndWorkflowList2D[k][0] = "";
                        } else {
                          this.taskAndWorkflowList2D[k][0] = "";
                        }
                        conditionsGroup.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
                          conditionsGroup.get('result_value')?.setValue('');
                          if (res == "TASK") {
                            this.taskAndWorkflowList2D[k][0] = this.taskList;
                          } else if (res == "WORKFLOW") {
                            this.taskAndWorkflowList2D[k][0] = this.workflowList;
                          } else {
                            this.taskAndWorkflowList2D[k][0] = "";
                          }
                        });
                      }
                    } else {
                      if (paramGroup.get('conditions')) {
                        paramGroup.removeControl('conditions');
                      }
                    }
                  });
                });
              }
            });
          }
          setTimeout(() => {
            this.spinner.stop('main');
          }, 1000)
        });
      }
    });
  }

  manageConditionsFormGroup(paramArray: FormGroup, i: number, j: number) {
    paramArray.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      paramArray.get('result_value').setValue('');
      if (res === 'TASK') {
        if (this.taskAndWorkflowList2D[i][j] === undefined) {
          this.taskAndWorkflowList2D[i][j] = this.taskList;
        } else {
          this.taskAndWorkflowList2D[i][j] = this.taskList;
        }
      } else if (res === 'WORKFLOW') {
        if (this.taskAndWorkflowList2D[i][j] === undefined) {
          this.taskAndWorkflowList2D[i][j] = this.workflowList;
        } else {
          this.taskAndWorkflowList2D[i][j] = this.workflowList;
        }
      }
    });
  }

  manageParameterFormArray(paramArray: FormGroup, i: number, j: number) {
    paramArray.get('mapping_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res == "SIMPLE") {
        const formArray = paramArray.get('conditions') as FormArray;
        formArray.clear();
      } else {
        const singleCondition = this.builder.group({
          condition_operator: ['', Validators.required],
          condition_value: ['', Validators.required],
          result_type: ['STRING', Validators.required],
          result_value: ['', Validators.required]
        });
        this.manageConditionsFormGroup(singleCondition, i, 0);
        const conditionsArray = paramArray.get('conditions') as FormArray;
        conditionsArray.clear();
        conditionsArray.push(singleCondition);
      }
    });
  }

  addCondition(conditionsArray: FormArray, i: number, j: number) {
    let attrFormGroup = <FormGroup>conditionsArray.at(j)
    if (conditionsArray.invalid) {
      this.workFlowFormErrors.parameter_maps[i].conditions[j] = this.utilService.validateForm(attrFormGroup, this.workFlowFormValidationMessages.parameter_maps.conditions, this.workFlowFormErrors.parameter_maps[i].conditions[j]);
      conditionsArray.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.workFlowFormErrors.parameter_maps[i].conditions[j] = this.utilService.validateForm(attrFormGroup, this.workFlowFormValidationMessages.parameter_maps.conditions, this.workFlowFormErrors.parameter_maps[i].conditions[j]);
        });
      return;
    } else {
      const newCondition = this.builder.group({
        condition_operator: ['', Validators.required],
        condition_value: ['', Validators.required],
        result_type: ['STRING', Validators.required],
        result_value: ['', Validators.required],
      });
      this.workFlowFormErrors.parameter_maps[i].conditions.push(this.svc.getConditionsFormErrors());
      newCondition.get('result_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        newCondition.get('result_value').setValue('');
        const newConditonIndex = j + 1;
        if (res === 'TASK') {
          if (this.taskAndWorkflowList2D[i][newConditonIndex] === undefined) {
            this.taskAndWorkflowList2D[i][newConditonIndex] = this.taskList;
          } else {
            this.taskAndWorkflowList2D[i][newConditonIndex] = this.taskList;
          }
        } else if (res === 'WORKFLOW') {
          if (this.taskAndWorkflowList2D[i][newConditonIndex] === undefined) {
            this.taskAndWorkflowList2D[i][newConditonIndex] = this.workflowList;
          } else {
            this.taskAndWorkflowList2D[i][newConditonIndex] = this.workflowList;
          }
        }
      });
      conditionsArray.push(newCondition);
    }
  }

  removeCondition(conditionsArray: FormArray, i: number, j: number) {
    const conditionFormGroup = conditionsArray.at(j) as FormGroup;
    const resultType = conditionFormGroup.get('result_type')?.value;
    if (resultType === "TASK" || resultType === "WORKFLOW") {
      if (this.taskAndWorkflowList2D[i]) {
        this.taskAndWorkflowList2D[i].splice(j, 1);
      }
    }
    conditionsArray.removeAt(j);
  }

  handleError(err: any) {
    if (err.error.non_field_errors) {
      this.nonFieldErr = err.error.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.workFlowForm.controls) {
          this.workFlowFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  toggleStatus(state: boolean) {
    if (state) {
      this.workFlowForm.get('enabled').setValue(true);
    } else {
      this.workFlowForm.get('enabled').setValue(false);
    }
  }

  onSubmitWorkflow() {
    if (this.workFlowForm.invalid) {
      this.workFlowFormErrors = this.utilService.validateForm(this.workFlowForm, this.workFlowFormValidationMessages, this.workFlowFormErrors);
      this.workFlowForm.valueChanges.subscribe((data: any) => {
        this.workFlowFormErrors = this.utilService.validateForm(this.workFlowForm, this.workFlowFormValidationMessages, this.workFlowFormErrors);
      });
      return;
    } else {
      const rawFormValue = this.workFlowForm.getRawValue();
      this.spinner.start('main');
      if (this.workFlowId) {
        this.svc.updateWorkflow(rawFormValue, this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.router.navigate(['../../'], { relativeTo: this.route });
          this.notification.success(new Notification('Workflow Integrated updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err);
          this.spinner.stop('main');
          this.notification.error(new Notification('Workflow Integration updation failed'));
        });
      } else {
        this.svc.addWorkflow(rawFormValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.router.navigate(['../'], { relativeTo: this.route });
          this.notification.success(new Notification('Workflow Integrated successfully'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err);
          this.spinner.stop('main');
          this.notification.error(new Notification('Workflow Integration failed'));
        });
      }
    }
  }

  goBack() {
    if (this.workFlowId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  copyToClipboard(key: string, displayName: string) {
    try {
      navigator.clipboard.writeText(this.workFlowForm.get(key).value)
        .then(() => {
          this.notification.success(new Notification(`${displayName} copied to clipboard.`));
        })
    } catch (err) {
      this.notification.error(new Notification(`Failed to copy ${displayName}. Please try again later.`));
    }
  }

}
