import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnityDeviceTypeList, UsiManageEngineCrudService } from './usi-manage-engine-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { isString } from 'lodash-es';
import { ManageEngineInstanceType, ManageEngineInstanceUnityOneDeviceType, ManageEngineResourceType } from '../usi-manage-engine.type';
import { UnityResourceType } from '../../usi-servicenow/usi-servicenow.type';
import { AWSAccountType, AwsResourceDetailsType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { AzureManageAccountsType, AzureResourceDetailsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';

@Component({
  selector: 'usi-manage-engine-crud',
  templateUrl: './usi-manage-engine-crud.component.html',
  styleUrls: ['./usi-manage-engine-crud.component.scss'],
  providers: [UsiManageEngineCrudService]
})
export class UsiManageEngineCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  instanceId: string;
  instanceData: ManageEngineInstanceType;

  integrationForm: FormGroup;
  integrationFormErrors: any;
  integrationFormValidationMessages: any;

  configurationForm: FormGroup;
  configurationFormErrors: any;
  configurationFormValidationMessages: any;
  activeForm: string = 'integrationForm';
  nonFieldErr: string = '';

  unityDeviceTypes: ManageEngineInstanceUnityOneDeviceType[] = UnityDeviceTypeList;
  manageEngineResources: ManageEngineResourceType[] = [];
  awsAccountData: AWSAccountType[] = [];
  AwsResourceTypeData: AwsResourceDetailsType[] = [];
  azureAccountData: AzureManageAccountsType[] = [];
  azureResourceTypeData: AzureResourceDetailsType[] = [];
  allAwsResourceTypeData: AwsResourceDetailsType[][] = [];
  allAzureResourceTypeData: AzureResourceDetailsType[][] = [];

  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  removeButton: FormArray;
  resourceTypesLength: number = 0;
  onAttrubuteAdd: boolean = false;
  sectionOpenStates: boolean[] = [false];
  resourceTypeValues: string[] = [];

  constructor(private svc: UsiManageEngineCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private builder: FormBuilder,
    private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getUnityAttributesByDeviceType();
    this.getAwsAccounts();
    this.getAzureAccounts();
    if (this.instanceId) {
      this.getInstanceDetails();
      this.getManageEngineResourceList(this.instanceId);
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
    this.svc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instanceData = res;
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

  getManageEngineResourceList(instanceId: string) {
    if (!this.instanceId) {
      this.spinner.start('main');
    }
    this.svc.getManageEngineResourceList(instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.manageEngineResources = res;
      } else {
        this.manageEngineResources = [];
      }
      this.loadConfigForm();
    }, err => {
      this.manageEngineResources = [];
      this.loadConfigForm();
    });
  }

  getUnityAttributesByDeviceType() {
    from(this.unityDeviceTypes).pipe(
      mergeMap((dt) => this.svc.getUnityAttributesByDeviceType(dt)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
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
        if ((this.instanceId || this.instanceData?.uuid) && this.integrationForm.value.is_inbound && this.configurationForm?.valid) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          if (!this.configurationForm) {
            this.notification.warning(new Notification('Please fill in the Integration, Configuration and move to Inbound Schedule'));
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
              this.getManageEngineResourceList(this.instanceData.uuid);
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

  manageForm(formName: string) {
    const integrationFormObj = this.integrationForm.getRawValue();
    if ((formName == 'configurationForm' && integrationFormObj.is_cmdb) || (formName == 'scheduleForm' && integrationFormObj.is_inbound)) {
      this.manageActiveForm(formName);
    }
    return;
  }

  //---------------------------------Manage Active Form End-------------------------------------


  //---------------------------------Integration Form-------------------------------------

  buildIntegrationForm(instance?: any) {
    this.nonFieldErr = '';
    this.integrationForm = this.svc.buildIntegrationForm(instance);
    this.integrationFormErrors = this.svc.resetIntegrationFormErrors();
    this.integrationFormValidationMessages = this.svc.integrationFormValidationMessages;
    this.integrationForm.get('is_cmdb').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!val) {
        this.integrationForm.removeControl('is_inbound');
        this.integrationForm.removeControl('is_outbound');
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
        this.integrationFormErrors.account_for = 'Atleast one of Workflow or CMDB should be selected';
      }
      this.integrationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors);
        if (this.integrationForm.errors && this.integrationForm.errors.atLeastOneRequired) {
          this.integrationFormErrors.account_for = 'Atleast one of Workflow or CMDB should be selected';
        }
      });
      return;
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, <any>this.integrationForm.getRawValue());
      if (this.instanceId) {
        this.svc.saveIntegrationForm(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('Manage Engine account updated successfully.'));
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
        this.svc.saveIntegrationForm(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('Manage Engine account added successfully.'));
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
    this.integrationFormErrors = this.svc.resetIntegrationFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
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

  //---------------------------------Integration form end-------------------------------------

  //---------------------------------Configuration Form-------------------------------------

  loadConfigForm() {
    if (this.instanceId) {
      /*
      * loads in edit flow only
      * Both this.instanceData and this.manageEngineResources will have some value before calling this method
      * Getting ManageEngineAttributes for a pre-selected ResourceTypes before building form
      */
      if (this.instanceData?.config_resources?.resource_types) {
        this.instanceData?.config_resources?.resource_types.map((rst, i) => {
          this.getCloudResourceNameData(rst.unity_device, i);
          const isResourceTypeValueExist: boolean = this.resourceTypeValues.includes(rst.resource_type);
          if (i == this.instanceData?.config_resources?.resource_types.length - 1) {
            if (!isResourceTypeValueExist) {
              this.resourceTypeValues.push(rst.resource_type);
            }
            this.getManageEngineAttributesByResourceType(rst.resource_type, i, true);
          } else if (!isResourceTypeValueExist) {
            this.resourceTypeValues.push(rst.resource_type);
            this.getManageEngineAttributesByResourceType(rst.resource_type, i);
          }
        })
      }
    } else {
      /*
      * loads in create flow only
      * Both this.instanceData and this.manageEngineResources will have some value before calling this method
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

  getManageEngineAttributesByResourceType(resourceTypeValue: string, resourceTypeIndex: number, isLast?: boolean) {
    let instanceId = this.instanceId ? this.instanceId : (this.instanceData ? this.instanceData.uuid : null);
    let idx = this.manageEngineResources.findIndex((r: ManageEngineResourceType) => r.value == resourceTypeValue);
    if (idx != -1) {
      this.svc.getManageEngineAttributesByResource(instanceId, this.manageEngineResources[idx]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        if (this.configurationForm) {
          this.patchManageEngineAttributes(resourceTypeIndex, res);
        }
        if (isLast) {
          this.patchForm();
        }
      }, err => {
        this.spinner.stop('main');
      });
    }
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

  buildConfigurationForm(instance?: ManageEngineInstanceType) {
    this.nonFieldErr = '';
    this.configurationForm = this.svc.buildConfigurationForm(instance, this.unityDeviceTypes, this.manageEngineResources, this.allAwsResourceTypeData, this.allAzureResourceTypeData);
    this.configurationFormErrors = this.svc.resetConfigurationFormErrors();
    this.configurationFormValidationMessages = this.svc.configurationFormValidationMessages;

    if (this.instanceId) {
      for (let i = 0; i < this.resourceTypes?.controls?.length; i++) {
        this.configurationFormErrors.resource_types.push(this.svc.getResourceTypeErrors());
        let resource = this.manageEngineResources.find(r => r?.name == this.resourceTypes?.controls[i]?.get('resource_type')?.value?.name);
        let attrControls = this.resourceTypes?.controls[i]?.get('attribute_mapping') as FormArray;
        for (let j = 0; j < attrControls?.controls?.length; j++) {
          let manageAttr = resource?.attrs?.find(ra => ra.value == attrControls?.controls[j]?.get('manage_attr')?.value);
          attrControls.controls[j]?.get('manage_attr').setValue(manageAttr);
          if (manageAttr && manageAttr.defaultValues && manageAttr.defaultValues.length) {
            attrControls.controls[j]?.get('default').setValue(manageAttr.defaultValues.find(d => d.name == attrControls.controls[j]?.get('default').value.name));
          }
          this.configurationFormErrors.resource_types[i].attribute_mapping.push(this.svc.getAttributeMappingErrors());
          (attrControls?.at(j) as FormGroup)?.get('inbound')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
            (attrControls.at(j) as FormGroup)?.get('unity_attr')?.setValue('');
          });
        }
      }
      this.configurationForm.updateValueAndValidity();
    } else {
      ((this.resourceTypes?.at(0)?.get('attribute_mapping') as FormArray).at(0) as FormGroup).
        get('inbound')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          ((this.resourceTypes?.at(0)?.get('attribute_mapping') as FormArray)?.at(0) as FormGroup)?.get('unity_attr')?.setValue('');
        })
    }
  }

  patchManageEngineAttributes(rtIndex: number, manageEngineResource: ManageEngineResourceType) {
    let fg = this.resourceTypes.at(rtIndex) as FormGroup;
    const resourceTypePatchVal = this.manageEngineResources.find(r => r.name == manageEngineResource.name)
    fg.get('resource_type').patchValue(resourceTypePatchVal);
    fg.get('attribute_mapping')?.value?.forEach((attr, index) => {
      const manageAttrPatchVal = this.instanceData.config_resources.resource_types[rtIndex].attribute_mapping[index].manage_attr;
      if (manageEngineResource.attrs) {
        const val = manageEngineResource.attrs.find(a => a.value == manageAttrPatchVal);
        if (val) {
          ((fg.get('attribute_mapping') as FormArray).at(index) as FormGroup).get('manage_attr').patchValue(val);
          if (val?.defaultValues?.length) {
            const defaultVal = val.defaultValues.find(d => d.name == this.instanceData.config_resources.resource_types[rtIndex].attribute_mapping[index].default.name);
            ((fg.get('attribute_mapping') as FormArray).at(index) as FormGroup).get('default').patchValue(defaultVal ? defaultVal : '');
          } else {
            const dv = this.instanceData.config_resources.resource_types[rtIndex].attribute_mapping[index].default;
            ((fg.get('attribute_mapping') as FormArray).at(index) as FormGroup).get('default')
              .patchValue(dv ? dv : '');
          }
        }
      }
    });
  }

  patchForm() {
    this.instanceData?.config_resources?.resource_types.map((rst, i) => {
      const patchVal = this.manageEngineResources.find(r => r.value == rst.resource_type);
      if (this.configurationForm && patchVal) {
        this.patchManageEngineAttributes(i, patchVal);
      }
    });
  }

  get resourceTypes(): FormArray {
    return this.configurationForm.get('resource_types') as FormArray;
  }

  get attributeArray(): FormArray {
    const length = this.onAttrubuteAdd ? this.resourceTypesLength : this.resourceTypes.length - 1;
    return (this.configurationForm.get('resource_types') as FormArray).at(length).get('attribute_mapping') as FormArray;
  }

  onSelectUnityDeviceType(index: number, event: any) {
    const selectedUnityDeviceType = this.resourceTypes.at(index).get('unity_device').value;
    let fg = <FormGroup>this.resourceTypes.at(index);
    (fg.get('attribute_mapping') as FormArray).clear();
    this.addAttributeMapping(index, 0, true); if (selectedUnityDeviceType.value == 'aws_resource') {
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

  onSelectManageEngineResourceType(index: number, event: any) {
    const selectedResourceType = (this.configurationForm.get('resource_types') as FormArray).at(index).get('resource_type').value;
    const isResourceTypeValueExist: boolean = this.resourceTypeValues.includes(selectedResourceType.value);
    let instanceId = this.instanceId ? this.instanceId : (this.instanceData ? this.instanceData.uuid : null);
    let fg = <FormGroup>this.resourceTypes.at(index);
    (fg.get('attribute_mapping') as FormArray).clear();
    this.addAttributeMapping(index, 0, true);
    if (!isResourceTypeValueExist) {
      this.resourceTypeValues.push(selectedResourceType.value);
      this.svc.getManageEngineAttributesByResource(instanceId, selectedResourceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
      });
    }
  }

  onSelectManageEngineAttributeMapping(i: number, j: number) {
    let attrControls = this.resourceTypes?.controls[i]?.get('attribute_mapping') as FormArray;
    attrControls.controls[j]?.get('default').setValue('');
  }

  toggleResourceTypeMappingOpenOrClose(index: number) {
    this.sectionOpenStates[index] = !this.sectionOpenStates[index];
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
        'manage_attr': ['', [Validators.required]],
        'default': ['', []],
        'inbound': [false]
      });
      const addAttributeButton = (this.configurationForm.get('resource_types') as FormArray).at(i).get('attribute_mapping') as FormArray;
      this.configurationFormErrors.resource_types[i].attribute_mapping.push(this.svc.getAttributeMappingErrors());
      addAttributeButton.push(unitAttributesControl);
      (addAttributeButton.at(addAttributeButton.value.length - 1) as FormGroup).get('inbound').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        (addAttributeButton.at(addAttributeButton.value.length - 1) as FormGroup).get('unity_attr').setValue('');
      });
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
            'unity_attr': ['', [Validators.required]],
            'manage_attr': ['', [Validators.required]],
            'default': ['', []],
            'inbound': [false]
          })
        ])
      });
      const formArray = this.configurationForm.get('resource_types') as FormArray;
      this.configurationFormErrors.resource_types.push(this.svc.getResourceTypeErrors());
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
      this.svc.saveConfigurationForm(this.configurationForm.getRawValue(), this.instanceData, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        const msg = this.instanceData.config_resources ? 'updated' : 'added';
        this.notification.success(new Notification(`Manage Engine account configuration ${msg} successfully.`));
        this.spinner.stop('main');
        if (<ManageEngineInstanceType>this.integrationForm.getRawValue().is_inbound) {
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
    this.configurationFormErrors = this.svc.resetConfigurationFormErrors();
    this.onAttrubuteAdd = true;
    for (let index = 0; index < this.resourceTypes.length; index++) {
      this.resourceTypesLength = index;
      if (index < this.resourceTypes.length - 1) {
        this.configurationFormErrors.resource_types.push(this.svc.getResourceTypeErrors());
      }
      for (let i = 0; i < this.attributeArray.length - 1; i++) {
        this.resourceTypesLength = index;
        this.onAttrubuteAdd = true;
        this.configurationFormErrors.resource_types[index].attribute_mapping.push(this.svc.getAttributeMappingErrors());
      }
    }

    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
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

  //---------------------------------Configuration Form end-------------------------------------

  //---------------------------------Schedule Form-----------------------------------------------

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
      this.notification.success(new Notification('Manage Engine account inbound schedule successfully'));
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
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
