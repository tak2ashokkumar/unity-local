import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { isString } from 'lodash-es';
import { Subject, Subscription, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ServiceNowAttribute, ServiceNowResourceType, ServicenowAccount, ServicenowAccountUnityOneDeviceType, UnityResourceType } from '../usi-servicenow.type';
import { UnityDeviceTypeList, UsiServicenowCrudService } from './usi-servicenow-crud.service';
import { AWSAccountType, AwsResourceDetailsType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { AzureManageAccountsType, AzureResourceDetailsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { add } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'usi-servicenow-crud',
  templateUrl: './usi-servicenow-crud.component.html',
  styleUrls: ['./usi-servicenow-crud.component.scss'],
})
export class UsiServicenowCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  instanceId: string;
  instanceData: ServicenowAccount;

  integrationForm: FormGroup;
  integrationFormErrors: any;
  integrationFormValidationMessages: any;

  configurationForm: FormGroup;
  configurationFormErrors: any;
  configurationFormValidationMessages: any;
  activeForm: string = 'integrationForm';
  nonFieldErr: string = '';

  unityDeviceTypes: ServicenowAccountUnityOneDeviceType[] = UnityDeviceTypeList;
  publicCloudServices: UnityResourceType[] = UnityDeviceTypeList;
  serviceNowResources: ServiceNowResourceType[] = [];
  awsAccountData: AWSAccountType[] = [];
  AwsResourceTypeData: AwsResourceDetailsType[] = [];
  azureAccountData: AzureManageAccountsType[] = [];
  azureResourceTypeData: AzureResourceDetailsType[] = [];
  allAwsResourceTypeData: AwsResourceDetailsType[][] = [];
  allAzureResourceTypeData: AzureResourceDetailsType[][] = [];

  removeButton: FormArray;
  resourceTypesLength: number = 0;
  onAttrubuteAdd: boolean = false;
  sectionOpenStates: boolean[] = [false];

  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  constructor(private crudSvc: UsiServicenowCrudService,
    private svc: UsiServicenowCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private builder: FormBuilder,
    private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('snId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getUnityAttributesByDeviceType();
    this.getAwsAccounts();
    this.getAzureAccounts();
    if (this.instanceId) {
      this.getInstanceDetails();
    } else {
      this.manageActiveForm('integrationForm');
    }
    this.getCollectors();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInstanceDetails() {
    this.crudSvc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instanceData = res;
      this.getServiceNowResourceList(this.instanceId);
      this.manageActiveForm('integrationForm');
    }, err => {
      this.instanceData = null;
      this.manageActiveForm();
    });
  }

  getCollectors() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    }, err => {
      this.collectors = [];
    });
  }

  //---------------------------------Manage Active Form-------------------------------------

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'integrationForm':
        if (this.instanceId && this.instanceData) {
          this.buildIntegrationForm(this.instanceData);
        } else {
          this.buildIntegrationForm();
        }
        this.activeForm = formName;
        break;
      case 'scheduleForm':
        if ((this.instanceId || this.instanceData?.uuid) && (this.integrationForm.value.is_inbound || this.integrationForm.value.is_outbound) && this.configurationForm?.valid) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          if (!this.configurationForm) {
            this.notification.warning(new Notification('Please fill in the Integration, Configuration and move to Schedule'));
            return;
          }
          if (this.configurationForm.invalid) {
            this.buildConfigurationForm();
          }
        }
        break;
      default:
        if (this.integrationForm && this.integrationForm.valid) {
          if (this.instanceId && this.instanceData) {
            // edit flow
            this.buildConfigurationForm(this.instanceData);
            this.activeForm = formName;
          } else {
            // add flow
            if (this.instanceData) {
              this.getServiceNowResourceList(this.instanceData.uuid);
              this.activeForm = formName;
            } else {
              this.notification.error(new Notification('Failed to get instance details. Please try again.'));
            }
          }
        } else {
          this.onSubmitIntegrationForm();
        }
        break;
    }
    this.spinner.stop('main');
  }

  getCssClassesForDividerLine() {
    let integrationForm = <ServicenowAccount>this.integrationForm?.getRawValue();
    if (!integrationForm?.is_cmdb || (!integrationForm?.is_inbound && !integrationForm?.is_outbound)) {
      return 'disabled';
    } else {
      return 'active';
    }
  }

  manageForm(formName: string) {
    const integrationFormObj = this.integrationForm.getRawValue();
    if ((formName == 'configurationForm' && integrationFormObj.is_cmdb) || (formName == 'scheduleForm' && (integrationFormObj.is_inbound || integrationFormObj.is_outbound))) {
      this.manageActiveForm(formName);
    }
    return;
  }

  //---------------------------------Manage Active Form End-------------------------------------

  //---------------------------------Integration Form-------------------------------------

  buildIntegrationForm(instance?: ServicenowAccount) {
    this.nonFieldErr = '';
    this.integrationForm = this.svc.buildIntegrationForm(instance);
    this.integrationFormErrors = this.svc.resetIntegrationFormErrors();
    this.integrationFormValidationMessages = this.svc.integrationFormValidationMessages;
    this.integrationForm.get('is_cmdb').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!val) {
        this.integrationForm.removeControl('is_inbound');
        this.integrationForm.removeControl('is_outbound');
        this.integrationForm.get('is_ire').setValue(false);
        this.integrationForm.get('allow_delete').setValue(false);
      } else {
        this.integrationForm.addControl('is_inbound', new FormControl(false));
        this.integrationForm.addControl('is_outbound', new FormControl(true));
      }
    });
    this.integrationForm.get('url_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value === 'public') {
        this.integrationForm.get('collector')?.get('uuid')?.setValue(null);
        this.integrationForm.get('collector')?.get('uuid')?.clearValidators();
        this.integrationForm.get('collector')?.get('uuid')?.updateValueAndValidity();
      } else if (value === 'private') {
        this.integrationForm.get('collector')?.get('uuid')?.setValue('');
        this.integrationForm.get('collector')?.get('uuid')?.setValidators([Validators.required]);
        this.integrationForm.get('collector')?.get('uuid')?.updateValueAndValidity();
      }
      this.integrationForm.get('collector_proxy')?.setValue(value === 'private');
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
      let obj = Object.assign({}, <ServicenowAccount>this.integrationForm.getRawValue());
      if (this.instanceId) {
        this.crudSvc.saveIntegrationForm(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('ServiceNow account updated successfully.'));
          this.instanceData = res;
          if (obj.is_cmdb) {
            this.manageActiveForm('configurationForm');
          } else {
            this.goBack();
            this.spinner.stop('main');
          }
        }, (err: HttpErrorResponse) => {
          this.handleIntegrtionFormErrors(err.error);
        });
      } else {
        this.crudSvc.saveIntegrationForm(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('ServiceNow account added successfully.'));
          this.instanceData = res;
          if (obj.is_cmdb) {
            this.manageActiveForm('configurationForm');
          } else {
            this.goBack();
            this.spinner.stop('main');
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

  //---------------------------------Configuration Form-------------------------------------

  getServiceNowResourceList(instanceId: string) {
    if (!this.instanceId) {
      this.spinner.start('main');
    }
    this.svc.getServiceNowResourceList(instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.serviceNowResources = res;
      } else {
        this.serviceNowResources = [];
      }
      this.loadConfigForm();
    }, err => {
      this.serviceNowResources = [];
      this.loadConfigForm();
    });
  }

  getAwsAccounts() {
    this.svc.getAwsAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.awsAccountData = data;
      this.getAwsServiceAndResourceDetails(this.awsAccountData);
    }, (err: HttpErrorResponse) => {
      this.awsAccountData = [];
      this.notification.error(new Notification("Failed to Load Aws Account Details"));
    });
  }

  getAwsServiceAndResourceDetails(awsAccount: AWSAccountType[]) {
    this.svc.getAwsServiceAndResourceDetails(awsAccount).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.AwsResourceTypeData = data;
    }, (err: HttpErrorResponse) => {
      this.AwsResourceTypeData = [];
      this.notification.error(new Notification("Failed to Load Aws Services and Resources Details"));
    });
  }

  getAzureAccounts() {
    this.svc.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureAccountData = data;
      this.getAzureServiceAndResourceDetails(this.azureAccountData);
    }, (err: HttpErrorResponse) => {
      this.azureAccountData = [];
      this.notification.error(new Notification("Failed to Load Azure Account Details"));
    });
  }

  getAzureServiceAndResourceDetails(azureaccount: AzureManageAccountsType[]) {
    this.svc.getAzureServiceAndResourceDetails(azureaccount).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureResourceTypeData = data;
    }, (err: HttpErrorResponse) => {
      this.azureResourceTypeData = [];
      this.notification.error(new Notification("Failed to Load Azure Services and Resources  Details"));
    })
  }

  onSelectUnityDeviceType(index: number, event: any) {
    const selectedUnityDeviceType = this.resourceTypes.at(index).get('unity_device').value;
    let fg = <FormGroup>this.resourceTypes.at(index);
    (fg.get('attribute_mapping') as FormArray).clear();
    this.addAttributeMapping(index, 0, true);
    if (selectedUnityDeviceType.value == 'aws_resource') {
      this.allAzureResourceTypeData[index] = null;
      this.allAwsResourceTypeData[index] = this.AwsResourceTypeData;
      fg.get('cloud_resource_name') ? null : fg.addControl('cloud_resource_name', new FormControl('', [Validators.required]));
    } else if (selectedUnityDeviceType.value == 'azure_resource') {
      this.allAwsResourceTypeData[index] = null;
      this.allAzureResourceTypeData[index] = this.azureResourceTypeData;
      fg.get('cloud_resource_name') ? null : fg.addControl('cloud_resource_name', new FormControl('', [Validators.required]));
    } else {
      fg.get('cloud_resource_name') ? fg.removeControl('cloud_resource_name') : null;
    }
  }

  loadConfigForm() {
    if (this.instanceId) {
      /*
      * loads in edit flow only
      * Both this.instanceData and this.serviceNowResources will have some value before calling this method
      * Getting ServiceNowAttributes for a pre-selected ResourceTypes before building form
      */
      if (this.instanceData.resource_types) {
        this.instanceData.resource_types.map((rst, i) => {
          this.getCloudResourceNameData(rst.unity_device, i);
          this.getServiceNowAttributesByResourceType(rst.resource_type, i);
        })
      }
    } else {
      /*
      * loads in create flow only
      * Both this.instanceData and this.serviceNowResources will have some value before calling this method
      */
      this.buildConfigurationForm(this.instanceData);
      this.spinner.stop('main');
    }
  }

  getCloudResourceNameData(unityDeviceValue: string, index: number) {
    let unityDeviceData = unityDeviceValue.split('_');
    if (unityDeviceData[0] == 'aws') {
      this.allAwsResourceTypeData[index] = this.AwsResourceTypeData;
    } else if (unityDeviceData[0] == 'azure') {
      this.allAzureResourceTypeData[index] = this.azureResourceTypeData;
    }
  }

  getServiceNowAttributesByResourceType(resourceTypeValue: string, resourceTypeIndex?: number) {
    let instanceId = this.instanceId ? this.instanceId : (this.instanceData ? this.instanceData.uuid : null);
    let idx = this.serviceNowResources.findIndex((r: ServiceNowResourceType) => r.value == resourceTypeValue);
    if (idx != -1 && !(this.serviceNowResources[idx].attrs && this.serviceNowResources[idx].attrs.length)) {
      this.svc.getServiceNowAttributesByResource(instanceId, this.serviceNowResources[idx]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        if (this.configurationForm) {
          // this.patchConfigurationForm((this.configurationForm.get('resource_types') as FormArray).at(resourceTypeIndex) as FormGroup, resourceTypeIndex);
        }
      }, err => {
        this.spinner.stop('main');
      });
    }
  }

  buildConfigurationForm(instance?: ServicenowAccount) {
    this.nonFieldErr = '';
    this.configurationForm = this.svc.buildConfigurationForm(instance, this.unityDeviceTypes, this.serviceNowResources, this.allAwsResourceTypeData, this.allAzureResourceTypeData);
    this.configurationFormErrors = this.svc.resetConfigurationFormErrors();
    this.configurationFormValidationMessages = this.svc.configurationFormValidationMessages;
    if (this.instanceId) {
      for (let index = 0; index < this.resourceTypes.length; index++) {
        this.configurationFormErrors.resource_types.push(this.svc.getResourceTypeErrors());
        const attributeMapArray = ((this.configurationForm.get('resource_types') as FormArray).at(index) as FormGroup).get('attribute_mapping') as FormArray;
        for (let i = 0; i < attributeMapArray.value.length; i++) {
          this.configurationFormErrors.resource_types[index].attribute_mapping.push(this.svc.getAttributeMappingErrors());
          (attributeMapArray.at(i) as FormGroup).get('inbound').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
            (attributeMapArray.at(i) as FormGroup).get('unity_attr').setValue('');
          });
        }
      }
    } else {
      ((((this.configurationForm.get('resource_types') as FormArray).at(0) as FormGroup).get('attribute_mapping') as FormArray)
        .at(0) as FormGroup).get('inbound').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          ((((this.configurationForm.get('resource_types') as FormArray).at(0) as FormGroup).get('attribute_mapping') as FormArray)
            .at(0) as FormGroup).get('unity_attr').setValue('');
        })
    }
  }

  patchConfigurationForm(fg: FormGroup, rtIndex: number) {
    fg.get('attribute_mapping').value.forEach((attr, index) => {
      const patchVal = this.instanceData.resource_types[rtIndex].attribute_mapping[index].servicenow_attr;
      ((fg.get('attribute_mapping') as FormArray).at(index) as FormGroup).get('servicenow_attr').setValue(patchVal);
    });
  }

  get resourceTypes(): FormArray {
    return this.configurationForm.get('resource_types') as FormArray;
  }

  get attributeArray(): FormArray {
    const length = this.onAttrubuteAdd ? this.resourceTypesLength : this.resourceTypes.length - 1;
    return (this.configurationForm.get('resource_types') as FormArray).at(length).get('attribute_mapping') as FormArray;
  }

  getUnityAttributesByDeviceType() {
    from(this.unityDeviceTypes).pipe(
      mergeMap((dt) => this.svc.getUnityAttributesByDeviceType(dt)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getPublicCloudServicesByCloudType() {
    from(this.unityDeviceTypes).pipe(
      mergeMap((dt) => this.svc.getUnityAttributesByDeviceType(dt)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  onSelectServiceNowResourceType(index: number, event: any) {
    let  resourceType = (this.configurationForm.get('resource_types') as FormArray).at(index).get('resource_type').value;
    let fg = <FormGroup>this.resourceTypes.at(index);
    (fg.get('attribute_mapping') as FormArray).clear();
    this.addAttributeMapping(index, 0, true);
    
    let selectedResourceType = this.serviceNowResources.find(sr => sr.value == resourceType.value)
    if(!(selectedResourceType.attrs && selectedResourceType.attrs.length)){
      let instanceId = this.instanceId ? this.instanceId : (this.instanceData ? this.instanceData.uuid : null);
      this.svc.getServiceNowAttributesByResource(instanceId, selectedResourceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
      });
    }
  }

  toggleResourceTypeMappingOpenOrClose(index: number) {
    this.sectionOpenStates[index] = !this.sectionOpenStates[index];
  }

  getEditSnAttribute(formData: any) {
    for (const resourceTypeObj of formData.value.resource_types) {
      const resourceType = resourceTypeObj.resource_type;
      this.getServiceNowAttributesByResourceType(resourceType);
    }
  }

  addAttributeMapping(i: number, j: number, isValid?: boolean) {
    this.resourceTypesLength = i;
    this.onAttrubuteAdd = true;
    let attrFormGroup = <FormGroup>this.attributeArray.at(j);
    if (!isValid && attrFormGroup.invalid) {
      this.configurationFormErrors.resource_types[i].attribute_mapping[j] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[i].attribute_mapping[j]);
      attrFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.configurationFormErrors.resource_types[i].attribute_mapping[j] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[i].attribute_mapping[j]);
        });
    } else {
      const unitAttributesControl = this.builder.group({
        'unity_attr': ['', [Validators.required]],
        'servicenow_attr': ['', [Validators.required]],
        'inbound': [false]
      });
      const attributeMap = (this.configurationForm.get('resource_types') as FormArray).at(i).get('attribute_mapping') as FormArray;
      this.configurationFormErrors.resource_types[i].attribute_mapping.push(this.crudSvc.getAttributeMappingErrors());
      attributeMap.push(unitAttributesControl);
      this.markConfigurationFormAsDirty();
      (attributeMap.at(attributeMap.value.length - 1) as FormGroup).get('inbound').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        (attributeMap.at(attributeMap.value.length - 1) as FormGroup).get('unity_attr').setValue('');
      });
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
            'unity_attr': ['', [Validators.required]],
            'servicenow_attr': ['', [Validators.required]],
            'inbound': [false]
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
      const instanceId = this.instanceId ? this.instanceId : this.instanceData ? this.instanceData.uuid : null;
      this.crudSvc.saveConfigurationForm(this.configurationForm.getRawValue(), this.instanceData, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        const msg = this.instanceData.resource_types ? 'updated' : 'added';
        this.notification.success(new Notification(`ServiceNow account configuration ${msg} successfully.`));
        this.spinner.stop('main');
        const integrationForm = <ServicenowAccount>this.integrationForm.getRawValue();
        if (integrationForm.is_inbound || integrationForm.is_outbound) {
          this.manageActiveForm('scheduleForm');
        } else {
          this.goBack();
        }
      }, (err: HttpErrorResponse) => {
        this.handleConfigFormErrors(err.error);
      });
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
        this.deleteCloudResourceNameData(index);
        formArray.removeAt(index);
        this.sectionOpenStates.splice(index, 1);
      }
    }
    this.configurationFormErrors.resource_types.splice(index, 1);
    this.markConfigurationFormAsDirty();
  }

  deleteCloudResourceNameData(index: number) {
    let unityDeviceValue: string = this.resourceTypes.at(index).get('unity_device').value.value;
    if (unityDeviceValue == 'aws_resource' || unityDeviceValue == 'azure_resource') {
      this.allAwsResourceTypeData.splice(index, 1);
      this.allAzureResourceTypeData.splice(index, 1);
    } else {
      if (this.allAwsResourceTypeData[index] == null) {
        this.allAwsResourceTypeData.splice(index, 1);
      } else {
        if (!(index in this.allAwsResourceTypeData)) {
          this.allAwsResourceTypeData.splice(index, 1);
        }
      }
      if (this.allAzureResourceTypeData[index] == null) {
        this.allAzureResourceTypeData.splice(index, 1);
      } else {
        if (!(index in this.allAzureResourceTypeData)) {
          this.allAzureResourceTypeData.splice(index, 1);
        }
      }
    }
  }

  markConfigurationFormAsDirty() {
    this.configurationForm.markAsDirty(); //For quick fix
  }

  goToIRERules() {
    if (this.instanceId) {
      this.router.navigate(['servicenow', 'instances', this.instanceId, 'IRERules'], { relativeTo: this.route.parent });
    } else if (this.router.url.includes('instances')) {
      this.router.navigate(['servicenow', 'instances', this.instanceData.uuid, 'IRERules'], { relativeTo: this.route.parent });
    } else {
      this.router.navigate(['servicenow', this.instanceData.uuid, 'IRERules'], { relativeTo: this.route.parent });
    }
  }

  //---------------------------------Configuration form end -------------------------------------

  //---------------------------------Schedule Form-----------------------------------------------


  getCssClassesForScheduleForm() {
    const integrationForm = <ServicenowAccount>this.integrationForm?.getRawValue();
    if (this.activeForm == 'scheduleForm') {
      return 'active';
    } else if (!integrationForm?.is_inbound && !integrationForm?.is_outbound) {
      return 'disabled';
    } else {
      return '';
    }
  }

  buildScheduleForm() {
    this.nonFieldErr = '';
    if (this.instanceId) {
      this.scheduleSvc.addOrEdit(this.instanceData.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveScheduleForm(runNowFlag);
    }
  }

  saveScheduleForm(runNowFlag: boolean) {
    this.spinner.start('main');
    const obj = Object.assign({}, this.scheduleSvc.getFormValue(runNowFlag));
    const instanceId = this.instanceId ? this.instanceId : this.instanceData ? this.instanceData.uuid : null;
    this.svc.saveScheduleForm(obj, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('ServiceNow account schedule successfully'));
      this.spinner.stop('main');
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleScheduleFormErrors(err.error);
    })
  }

  handleScheduleFormErrors(err: any) {
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      this.scheduleSvc.handleError(err);
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  //---------------------------------Schedule Form end-----------------------------------------------

  goBack() {
    let lastSegmentOfUrl = this.router.url.split('/').pop();
    if (this.instanceId && this.router.url.includes('instances')) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else if (!(lastSegmentOfUrl == 'servicenow') && !this.router.url.includes('instances')) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
