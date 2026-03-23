import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServiceCatalogProvisioningCrudService } from './service-catalog-provisioning-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TerraFormParams } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-task-execute/orchestration-task-execute.service';
import { WorkflowDetails, WorkflowInput } from 'src/app/unity-services/orchestration/orchestration-workflows/orchestration-workflow-execution/orchestration-workflow-execution.type';
import { WorkflowDetailsViewData } from 'src/app/unity-services/orchestration/orchestration-workflows/orchestration-workflow-execution/orchestration-workflow-execution.service';
import { Catalog } from '../service-catalog-provisioning-type';

@Component({
  selector: 'service-catalog-provisioning-crud',
  templateUrl: './service-catalog-provisioning-crud.component.html',
  styleUrls: ['./service-catalog-provisioning-crud.component.scss'],
  providers: [ServiceCatalogProvisioningCrudService]
})
export class ServiceCatalogProvisioningCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  catalogId: string;
  action: string;
  catalogData: Catalog;
  catalogType: string = 'Task'
  taskList: any[] = [];
  workflowList: any[] = [];
  fileToUpload: File;
  logoList: string[] = [];
  nonFieldErr: string;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  metaData: any; // need to change 
  imageList = [];
  selectedCloudType: string;
  inputLengthZeroSingle: boolean = false;
  inputLengthZero: boolean[][] = [];

  taskInput: TerraFormParams[];
  workflowInput: WorkflowInput[];
  workflow: WorkflowDetails = null;
  workflowDetailsData: WorkflowDetailsViewData[]
  matchingCloud: { iamge: string, text: string };

  constructor(private svc: ServiceCatalogProvisioningCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.catalogId = params.get('catalogId');
      this.action = this.catalogId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    this.getDropdownData();
    this.getMetaData();
    if (this.catalogId) {
      this.getCatalogDataById();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMetaData() {
    this.svc.getMetaData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.metaData = data;
      this.metaData?.cloud.forEach((val: any) => {
        val.image = `${environment.assetsUrl + val.image}`;
        val.text = val.text;
        this.imageList.push(val);
      });
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Couldn't fetch Meta Data"));
    });
  }

  getDropdownValue(event: any) {
    this.form.get('cloud_type').setValue(event.text);
  }

  getCatalogDataById() {
    this.svc.getCatalogDataById(this.catalogId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.catalogData = data;
      this.selectedCloudType = data.cloud_type;
      setTimeout(() => {
        this.buildForm()
      }, 1000)
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Couldn't fetch Task List"));
    });
  }

  getDropdownData() {
    this.svc.getTaskList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.taskList = data;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Couldn't fetch Task List"));
    });
    this.svc.getWorkflowList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.workflowList = data;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Couldn't fetch Workflow List"));
    });
  }

  buildForm() {
    this.form = this.svc.buildForm(this.catalogData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    if (this.catalogData) {
      this.svc.getCatalogDataById(this.catalogData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((result) => {
        this.catalogType = this.catalogData.catalog_type;
        this.form.get('catalog_type').setValue(this.catalogType);
        if (this.catalogData?.catalog_type == 'Task') {
          this.taskInput = result.inputs;
          if (Array.isArray(this.taskInput)) {
            JSON.stringify(this.taskInput) !== '{}' ? (this.taskInput as TerraFormParams[]).forEach(p => {
              if (p.param_type === 'Input Template') {
                (this.form.get('inputs') as FormGroup).addControl(p.param_name, new FormGroup({
                  template_name: new FormControl({ value: p.template_name, disabled: false }),
                  attribute: new FormControl({ value: p.attribute, disabled: false }),
                  param_type: new FormControl({ value: p.param_type, disabled: false }),
                  default_value: new FormControl({ value: p.default_value, disabled: false }),
                  template: new FormControl({ value: p.template, disabled: false })
                }));
              } else {
                const defaultValueGroup = new FormGroup({
                  default_value: new FormControl(p.default_value)
                });
                (this.form.get('inputs') as FormGroup).addControl(p.param_name, defaultValueGroup);
              }
            }) : '';
          }
        } else {
          this.workflowDetailsData = this.svc.converToViewDataWorkflowEdit(this.catalogData);
          if (this.workflowDetailsData.length) {
            this.workflowDetailsData.forEach(data => {
              if (this.workflowDetailsData.length == 1) {
                if (data.inputs.length == 0) {
                  this.inputLengthZeroSingle = true;
                }
              }
            })
          }
          if (this.workflowDetailsData.length) {
            this.workflowDetailsData.forEach((data, index) => {
              this.inputLengthZero[index] = [];
              this.inputLengthZero[index].push(data.inputs.length === 0);
            });
          }
        }
      });
    }
    if (this.catalogData) {
      if (this.selectedCloudType && this.imageList.length > 0) {
        this.matchingCloud = this.imageList.find(cloud => cloud.text === this.selectedCloudType);
        // if (matchingCloud) {
        //   const basePath = '/static/assets/images/';
        //   const startIndex = matchingCloud.image.indexOf(basePath) + basePath.length;
        //   const relativeImagePath = matchingCloud.image.substring(startIndex);
        //   this.form.get('cloud_type').setValue(relativeImagePath);
        // }
      }
    }
    this.getInputs();
    this.form.get('category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'Provisioning') {
        this.form.addControl('cloud_type', new FormControl('', Validators.required));
        this.form.removeControl('logo');
      } else {
        this.form.addControl('logo', new FormControl('', Validators.required));
        this.form.removeControl('cloud_type');
      }
    });
  }

  getInputs() {
    if (this.form.contains('task')) {
      this.form.get('task').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((taskUUID: string) => {
        this.taskInput = [];
        const inputsFormGroup = this.form.get('inputs') as FormGroup;
        Object.keys(inputsFormGroup.controls).forEach(key => {
          inputsFormGroup.removeControl(key);
        });
        this.svc.getTaskData(taskUUID).subscribe((result) => {
          this.taskInput = result.inputs;
          if (Array.isArray(this.taskInput)) {
            JSON.stringify(this.taskInput) !== '{}' ? (this.taskInput as TerraFormParams[]).forEach(p => {
              if (p.param_type === 'Input Template') {
                (this.form.get('inputs') as FormGroup).addControl(p.param_name, new FormGroup({
                  template_name: new FormControl({ value: p.template_name, disabled: false }),
                  attribute: new FormControl({ value: p.attribute, disabled: false }),
                  param_type: new FormControl({ value: p.param_type, disabled: false }),
                  default_value: new FormControl({ value: p.default_value, disabled: false }),
                  template: new FormControl({ value: p.template, disabled: false })
                }));
              } else {
                const defaultValueGroup = new FormGroup({
                  default_value: new FormControl(p.default_value)
                });
                (this.form.get('inputs') as FormGroup).addControl(p.param_name, defaultValueGroup);
              }
            }) : '';
          }
        });
      });
    }
    else {
      this.form.get('workflow').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((workflowUUID: string) => {
        this.svc.getWorkflowDetails(workflowUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.workflow = res;
          this.workflowDetailsData = this.svc.converToViewData(res);
          if (this.workflowDetailsData.length) {
            this.workflowDetailsData.forEach(data => {
              if (this.workflowDetailsData.length == 1) {
                if (data.inputs.length == 0) {
                  this.inputLengthZeroSingle = true;
                }
              }
            })
          }
          if (this.workflowDetailsData.length) {
            this.workflowDetailsData.forEach((data, index) => {
              this.inputLengthZero[index] = [];
              this.inputLengthZero[index].push(data.inputs.length === 0);
            });
          }
        });
      });
    }
  }

  toggleStatus(catalogType: string) {
    this.catalogType = catalogType;
    this.form.get('catalog_type').setValue(this.catalogType);
    if (catalogType == 'Task') {
      this.form.removeControl('task');
      this.form.removeControl('workflow');
      this.form.addControl('task', new FormControl('', [Validators.required]));
      this.taskInput = [];
      this.getInputs();
    } else {
      this.form.removeControl('task');
      this.form.removeControl('workflow');
      this.form.addControl('workflow', new FormControl('', [Validators.required]));
      this.workflowDetailsData = []
      this.getInputs();
    }
  }

  playbookFile(files: FileList | null): void {
    if (!files || files.length === 0) {
      return;
    }

    const file = files.item(0);
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

    if (!file || !validImageTypes.includes(file.type)) {
      this.form.controls['logo'].setErrors({ 'incorrectFileType': true });
      this.formErrors.logo = 'Please upload a valid image file (PNG, JPEG, JPG, SVG).';
      return;
    }

    const fileName = file.name;
    this.logoList.push(fileName);
    this.form.controls['logo'].setValue(fileName);
    this.form.controls['logo'].setErrors(null);
    this.fileToUpload = files.item(0);
  }

  confirmCatalogCreate() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      const rawValues = this.form.getRawValue();
      let obj = { ...rawValues };
      if (rawValues.task) {
        const inputsArray = Object.keys(rawValues.inputs).map(key => {
          const input = rawValues.inputs[key];
          const paramType = this.taskInput.find(p => p.param_name === key)?.param_type;
          return {
            param_name: key,
            param_type: paramType,
            default_value: input.default_value ? input.default_value : '',
            attribute: input.attribute ? input.attribute : '',
            template: input.template ? input.template : '',
            template_name: input.template_name ? input.template_name : ''
          };
        });
        obj.inputs = inputsArray;
      } else {
        obj.inputs = [];
        if (this.workflowDetailsData.length) {
          this.workflowDetailsData.forEach(data => {
            let taskObj = Object.assign({}, data.taskForm.getRawValue());
            taskObj.inputs = [];
            const inputs = data.taskForm.get('inputs') as FormGroup;
            if (inputs) {
              Object.keys(inputs.controls).forEach(key => {
                let inputControl = inputs.get(key) as FormGroup;
                let inputObj = {
                  param_name: key,
                  param_type: inputControl?.get('param_type')?.value || 'String',
                  default_value: inputControl?.get('default_value')?.value || '',
                  attribute: inputControl?.get('attribute')?.value || '',
                  template: inputControl?.get('template')?.value || '',
                  template_name: inputControl?.get('template_name')?.value || ''
                };
                taskObj.inputs.push(inputObj);
              });
            }
            obj.inputs.push(taskObj);
          });
        }
      }
      if (this.catalogId) {
        if (this.fileToUpload) {
          this.svc.updateCatalog(this.catalogId, obj, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.spinner.stop('main');
            this.notification.success(new Notification('Catalog updated Successfully.'));
            this.goBack();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
        } else {
          this.svc.updateCatalog(this.catalogId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.spinner.stop('main');
            this.notification.success(new Notification('Catalog updated Successfully.'));
            this.goBack();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
        }
      } else {
        this.svc.createCatalog(obj, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Catalog Created Successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }


  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    this.spinner.stop('main');
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.notification.error(new Notification('Something went wrong!! Please try again.'));
    this.spinner.stop('main');
  }


  goBack() {
    if (this.catalogId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
