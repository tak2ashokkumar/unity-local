import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { isString } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicenowAccount } from 'src/app/shared/SharedEntityTypes/servicenow.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { OnboardingTabStepType, ServiceNowAttribute, ServiceNowType, ServicenowCrudService, Tenants, UnityDeviceType } from './servicenow-crud.service';

@Component({
  selector: 'servicenow-crud',
  templateUrl: './servicenow-crud.component.html',
  styleUrls: ['./servicenow-crud.component.scss'],
  providers: [ServicenowCrudService]
})
export class ServicenowCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  steps: OnboardingTabStepType[] = [];
  instanceId: string;
  nonFieldErr: string = '';
  action: string;

  instanceData: ServicenowAccount;
  tenants: Tenants[] = [];
  integrationForm: FormGroup;
  integrationFormErrors: any;
  integrationFormValidationMessages: any;

  status: string = 'Integration';

  serviceNowResourceList: any;
  serviceNowAttrList: ServiceNowAttribute[][] = [];
  unityAttrList: any[][] = [];
  configurationForm: FormGroup;
  configurationFormErrors: any;
  configurationFormValidationMessages: any;

  UnityDeviceType = UnityDeviceType;
  removeButton: FormArray;
  resourceTypesLength: number = 0;
  onAttrubuteAdd: boolean = false;
  sectionOpenStates: boolean[] = [false];

  tenantSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'id',
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: ServicenowCrudService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.steps = [steps[0], steps[1]];
    this.setActive();
    this.loadForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setActive() {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (this.status == step.stepName) {
        step.active = true;
        step.className = 'btn-primary';
      } else {
        step.active = false;
        step.className = 'btn-secondary';
      }
      if (this.status == 'Configuration' && step.stepName == 'Configuration') {
        this.steps[0].className = 'btn-success';
        this.steps[0].active = true;
      }
    }
  }

  loadForm() {
    if (this.instanceId) {
      this.action = 'edit';
      this.getInstanceDetails();
      this.getTenants();
    } else {
      this.action = 'add';
      this.getTenants();
    }
  }

  getInstanceDetails() {
    this.crudSvc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instanceData = res;
    }, err => {
      this.instanceData = null;
    });
  }

  //---------------------------------Integration Form-------------------------------------

  getTenants() {
    this.spinner.start('main');
    this.crudSvc.getTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenants = res;
      this.buildIntegrationForm();
      this.spinner.stop('main');
    }, err => {
      this.tenants = [];
      this.buildIntegrationForm();
      this.spinner.stop('main');
    });
  }

  buildIntegrationForm() {
    this.nonFieldErr = '';
    this.crudSvc.buildIntegrationForm(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((form) => {
      this.integrationForm = form;
      this.integrationFormErrors = this.crudSvc.resetIntegrationFormErrors();
      this.integrationFormValidationMessages = this.crudSvc.integrationFormValidationMessages;
    });
  }

  onSubmitIntegrationForm() {
    if (this.integrationForm.invalid) {
      this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors);
      if (this.integrationForm.errors && this.integrationForm.errors.atLeastOneRequired) {
        this.integrationFormErrors.account_for = 'Atleast one of ITSM or CMDB should be selected';
      }
      this.integrationForm.valueChanges.subscribe((data: any) => {
        this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors);
        if (this.integrationForm.errors && this.integrationForm.errors.atLeastOneRequired) {
          this.integrationFormErrors.account_for = 'Atleast one of ITSM or CMDB should be selected';
        }
      });
      return;
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, <ServiceNowType>this.integrationForm.getRawValue());
      if (this.instanceId) {
        this.crudSvc.saveIntegrationForm(this.instanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.spinner.stop('main');
          if (obj.is_cmdb) {
            this.loadConfigurationForm();
          } else {
            this.goBack();
          }
        }, (err: HttpErrorResponse) => {
          this.handleIntegrtionFormErrors(err.error);
        });
      } else {
        this.crudSvc.saveIntegrationForm(null, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.instanceId = res.uuid;
          this.spinner.stop('main');
          if (obj.is_cmdb) {
            this.loadConfigurationForm();
          } else {
            this.goBack();
          }
        }, (err: HttpErrorResponse) => {
          this.handleIntegrtionFormErrors(err.error);
        });
      }
    }
  }

  handleIntegrtionFormErrors(err: any) {
    this.integrationFormErrors = this.crudSvc.resetIntegrationFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.integrationForm.controls) {
          this.integrationFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  //---------------------------------Integration form end -------------------------------------

  //---------------------------------Redirection between forms -------------------------------------

  loadIntegrationForm() {
    this.status = 'Integration';
    this.setActive();
    this.buildIntegrationForm();
  }

  loadConfigurationForm() {
    if (this.integrationForm.get('is_cmdb')?.value) {
      this.getSnResourceList(this.instanceId);
      this.status = 'Configuration';
      this.setActive();
    } else {
      this.notification.warning(new Notification('CMDB is not selected for instance'));
    }
  }

  goTo(step: OnboardingTabStepType) {
    if (step.stepName == "Configuration") {
      if (this.instanceId) {
        this.loadConfigurationForm();
      } else {
        this.notification.warning(new Notification('Servicenow Instance details has be provided to configure CMDB'));
      }
    } else {
      this.loadIntegrationForm();
    }
  }

  //---------------------------------Redirection between forms end-------------------------------------

  //---------------------------------Configuration Form-------------------------------------

  getSnResourceList(id: string) {
    this.spinner.start('main');
    this.crudSvc.getSnResourceList(id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.serviceNowResourceList = res;
      } else {
        this.serviceNowResourceList = null;
      }
      this.buildConfigurationForm();
      this.spinner.stop('main');
    }, err => {
      this.buildConfigurationForm();
      this.spinner.stop('main');
    });
  }

  buildConfigurationForm() {
    this.crudSvc.buildConfigurationForm(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((form) => {
      this.configurationForm = form;
      this.configurationFormErrors = this.crudSvc.resetConfigurationFormErrors();
      this.configurationFormValidationMessages = this.crudSvc.configurationFormValidationMessages;
      if (this.action == 'edit') {
        this.onAttrubuteAdd = true;
        for (let index = 0; index < this.resourceTypes.length; index++) {
          this.resourceTypesLength = index;
          if (index < this.resourceTypes.length - 1) {
            this.configurationFormErrors.resource_types.push(this.crudSvc.getResourceTypeErrors());
          }
          for (let i = 0; i < this.attributeArray.length - 1; i++) {
            this.resourceTypesLength = index;
            this.onAttrubuteAdd = true;
            this.configurationFormErrors.resource_types[index].attribute_mapping.push(this.crudSvc.getAttributeMappingErrors());
          }
        }
        this.getEditUnityAttribute(form);
        this.getEditSnAttribute(form);
      }
    });
  }

  toggleSection(index: number) {
    this.sectionOpenStates[index] = !this.sectionOpenStates[index];
  }

  get resourceTypes(): FormArray {
    return this.configurationForm.get('resource_types') as FormArray;
  }

  get attributeArray(): FormArray {
    const length = this.onAttrubuteAdd ? this.resourceTypesLength : this.resourceTypes.length - 1;
    return (this.configurationForm.get('resource_types') as FormArray).at(length).get('attribute_mapping') as FormArray;
  }

  getSnAttributeList(index: number, resource: string) {
    this.serviceNowAttrList[index] = [];
    this.crudSvc.getSnAttributeList(this.instanceId, resource).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        // Check if the array for this index already exists, if not, create it
        if (!this.serviceNowAttrList[index]) {
          this.serviceNowAttrList[index] = [];
        }
        this.serviceNowAttrList[index] = res[0].attributes;
      } else {
        this.serviceNowAttrList[index] = [];
      }
      this.spinner.stop('main');
    }, err => {
      this.serviceNowAttrList[index] = [];
      this.spinner.stop('main');
    });
  }

  getUnityAttributeList(index: number, resource: string) {
    this.unityAttrList[index] = [];
    this.crudSvc.getUnityAttributeList(resource).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        // Check if the array for this index already exists, if not, create it
        if (!this.unityAttrList[index]) {
          this.unityAttrList[index] = [];
        }
        this.unityAttrList[index] = res;
      } else {
        this.unityAttrList[index] = [];
      }
      this.spinner.stop('main');
    }, err => {
      this.unityAttrList[index] = [];
      this.spinner.stop('main');
    });
  }

  getEditSnAttribute(formData: any) {
    for (const resourceTypeObj of formData.value.resource_types) {
      const resourceType = resourceTypeObj.resource_type;
      this.crudSvc.getSnAttributeList(this.instanceId, resourceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.serviceNowAttrList.push(res[0].attributes)
      })
    }
  }

  getEditUnityAttribute(formData: any) {
    for (const resourceTypeObj of formData.value.resource_types) {
      const attrType = resourceTypeObj.unity_device;
      this.crudSvc.getUnityAttributeList(attrType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.unityAttrList.push(res)
      })
    }
  }

  changeFn(index: number) {
    const selectedResourceType = (this.configurationForm.get('resource_types') as FormArray).at(index).get('resource_type').value;
    this.getSnAttributeList(index, selectedResourceType);
    this.emptyAttributeMapping(index);
  }

  changeUnityAttrFn(index: number) {
    const selectedResourceType = (this.configurationForm.get('resource_types') as FormArray).at(index).get('unity_device').value;
    this.getUnityAttributeList(index, selectedResourceType);
    this.emptyAttributeMapping(index);
  }

  emptyAttributeMapping(index: number) {
    ((this.configurationForm.get('resource_types') as FormArray).at(index) as FormGroup).removeControl('attribute_mapping');
    this.configurationFormErrors.attribute_mapping = [this.crudSvc.getAttributeMappingErrors()];
    ((this.configurationForm.get('resource_types') as FormArray).at(index) as FormGroup).addControl('attribute_mapping', this.builder.array([
      this.builder.group({
        "unity_attr": ['', [Validators.required]],
        "servicenow_attr": ['', [Validators.required]]
      })
    ]));

  }

  addAttributeMapping(i: number, j: number) {
    this.resourceTypesLength = i;
    this.onAttrubuteAdd = true;
    let attrFormGroup = <FormGroup>this.attributeArray.at(j);
    if (attrFormGroup.invalid) {
      this.configurationFormErrors.resource_types[i].attribute_mapping[j] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[i].attribute_mapping[j]);
      attrFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.configurationFormErrors.resource_types[i].attribute_mapping[j] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[i].attribute_mapping[j]);
        });
    } else {
      const unitAttributesControl = this.builder.group({
        "unity_attr": ['', [Validators.required]],
        "servicenow_attr": ['', [Validators.required]]
      });
      const addAttributeButton = (this.configurationForm.get('resource_types') as FormArray).at(i).get('attribute_mapping') as FormArray;
      this.configurationFormErrors.resource_types[i].attribute_mapping.push(this.crudSvc.getAttributeMappingErrors());
      addAttributeButton.push(unitAttributesControl);
      this.markConfigurationFormAsDirty();
    }
  }

  removeAttributeMapping(i: number, j: number) {
    this.removeButton = (this.configurationForm.get('resource_types') as FormArray).at(i).get('attribute_mapping') as FormArray;
    if (this.removeButton.length > 1) {
      this.removeButton.removeAt(j);
    }
    this.configurationFormErrors.resource_types[i].attribute_mapping.splice(j, 1);
    this.markConfigurationFormAsDirty();
  }

  addResourceType() {
    this.onAttrubuteAdd = false;
    const index = this.resourceTypes.length - 1;
    let formGroup = <FormGroup>this.resourceTypes.at(this.resourceTypes.length - 1);
    let attrFormGroup = <FormGroup>this.attributeArray.at(this.attributeArray.length - 1);
    if (formGroup.invalid) {
      this.configurationFormErrors.resource_types[index] = this.utilService.validateForm(formGroup, this.configurationFormValidationMessages.resource_types, this.configurationFormErrors.resource_types[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.configurationFormErrors.resource_types[index] = this.utilService.validateForm(formGroup, this.configurationFormValidationMessages.resource_types, this.configurationFormErrors.resource_types[index]);
      });
    } else if (attrFormGroup.invalid) {
      this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1]);
      attrFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1]);
      });
    } else {
      const newResourceTypeForm = this.builder.group({
        'unity_device': ['', [Validators.required]],
        'resource_type': ['', [Validators.required]],
        'attribute_mapping': this.builder.array([
          this.builder.group({
            "unity_attr": ['', [Validators.required]],
            "servicenow_attr": ['', [Validators.required]]
          })
        ])
      });
      const formArray = this.configurationForm.get('resource_types') as FormArray;
      this.configurationFormErrors.resource_types.push(this.crudSvc.getResourceTypeErrors());
      formArray.push(newResourceTypeForm);
      this.sectionOpenStates.push(false);
      this.markConfigurationFormAsDirty()
    }
  }

  onSubmitConfigurationForm() {
    if (this.configurationForm.invalid) {
      this.configurationFormErrors = this.utilService.validateForm(this.configurationForm, this.configurationFormValidationMessages, this.configurationFormErrors);
      this.configurationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.configurationFormErrors = this.utilService.validateForm(this.configurationForm, this.configurationFormValidationMessages, this.configurationFormErrors);
      });
    } else {
      this.spinner.start('main');
      if (this.action == 'add') {
        this.crudSvc.postResourceType(this.configurationForm.getRawValue(), this.instanceId, this.action).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('Configuration added successfully.'));
          this.spinner.stop('main');
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleConfigFormErrors(err.error);
        });
      } else {
        this.crudSvc.postResourceType(this.configurationForm.getRawValue(), this.instanceId, this.action).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('Configuration updated successfully.'));
          this.spinner.stop('main');
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleConfigFormErrors(err.error);
        });
      }
    }
  }

  handleConfigFormErrors(err: any) {
    this.configurationFormErrors = this.crudSvc.resetConfigurationFormErrors();
    this.onAttrubuteAdd = true;
    for (let index = 0; index < this.resourceTypes.length; index++) {
      this.resourceTypesLength = index;
      if (index < this.resourceTypes.length - 1) {
        this.configurationFormErrors.resource_types.push(this.crudSvc.getResourceTypeErrors());
      }
      for (let i = 0; i < this.attributeArray.length - 1; i++) {
        this.resourceTypesLength = index;
        this.onAttrubuteAdd = true;
        this.configurationFormErrors.resource_types[index].attribute_mapping.push(this.crudSvc.getAttributeMappingErrors());
      }
    }

    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.configurationForm.controls) {
          this.configurationFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  deleteResourceType(index: number) {
    const formArray = this.configurationForm.get('resource_types') as FormArray;
    if (index >= 0 && index < formArray.length) {
      if (formArray.length > 1) {
        formArray.removeAt(index);
        this.sectionOpenStates.splice(index, 1);
      }
    }
    this.configurationFormErrors.resource_types.splice(index, 1);
    this.markConfigurationFormAsDirty();
  }

  markConfigurationFormAsDirty() {
    this.configurationForm.markAsDirty(); //For quick fix
  }

  goToIRERules() {
    if (this.instanceId) {
      this.router.navigate(['integration', 'servicenow', this.instanceId, 'IRERules'], { relativeTo: this.route.parent });
    } else {
      this.router.navigate(['integration', 'servicenow', this.instanceData.id, 'IRERules'], { relativeTo: this.route.parent });
    }
  }

  goBack() {
    this.router.navigate(['../../', 'servicenow'], { relativeTo: this.route })
  }

  goToIntegration() {
    this.router.navigate(['../../../', 'integration'], { relativeTo: this.route })
  }
}

const steps: OnboardingTabStepType[] = [
  {
    stepName: 'Integration',
    icon: 'fas fa-signal ',
    url: 'connectivity',
    active: false,
    className: 'btn-secondary'
  },
  {
    stepName: 'Configuration',
    icon: 'fas fa-solid fa-link',
    url: 'onboarding',
    active: false,
    className: 'btn-secondary'
  }
];
