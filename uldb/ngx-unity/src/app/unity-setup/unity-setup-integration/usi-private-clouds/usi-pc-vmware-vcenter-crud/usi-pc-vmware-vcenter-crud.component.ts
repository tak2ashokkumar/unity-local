import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { VMwareVCenterAccount, VMwareVCenterParams } from '../usi-private-clouds.type';
import { UsiPcVmwareVcenterCrudService } from './usi-pc-vmware-vcenter-crud.service';

@Component({
  selector: 'usi-pc-vmware-vcenter-crud',
  templateUrl: './usi-pc-vmware-vcenter-crud.component.html',
  styleUrls: ['./usi-pc-vmware-vcenter-crud.component.scss'],
  providers: [UsiPcVmwareVcenterCrudService]
})
export class UsiPcVmwareVcenterCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  instanceId: string;

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;

  resourceForm: FormGroup;
  resourceFormErrors: any;
  resourceFormValidationMessages: any;

  eventIngestionForm: FormGroup;
  eventIngestionFormErrors: any;
  eventIngestionFormValidationMessages: any;

  nonFieldErr: string = '';
  activeForm: string = 'credentialForm';
  datacenterList: Array<DatacenterFast> = [];
  collectorList: Array<DeviceDiscoveryAgentConfigurationType> = [];
  paramList: Array<VMwareVCenterParams> = [];
  mandatoryParamList: Array<VMwareVCenterParams> = [];
  nonMandatoryParamList: Array<VMwareVCenterParams> = [];
  instance: VMwareVCenterAccount;
  cloudNameForEndpoint: string;
  cloudNameForDisplay: string;


  constructor(private crudService: UsiPcVmwareVcenterCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private scheduleSvc: UnityScheduleService,
    private builder: FormBuilder) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => { this.instanceId = params.get('instanceId') });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCloudName();
    this.getDiscoveryDropdownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDiscoveryDropdownData() {
    this.spinner.start('main');
    this.datacenterList = [];
    this.collectorList = [];
    this.crudService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ datacenters, collectors }) => {
      if (datacenters) {
        this.datacenterList = _clone(datacenters);
      } else {
        this.datacenterList = [];
      }

      if (collectors) {
        this.collectorList = _clone(collectors);
      } else {
        this.collectorList = [];
      }

      if (this.instanceId) {
        this.getDetails();
      } else {
        this.getEventIngestionParams();
        this.manageActiveForm();
      }
      this.spinner.stop('main');
    });
  }

  getCloudName() {
    let currentUrl = this.router.url;
    if (currentUrl.includes('vmware-vcenter')) {
      this.cloudNameForEndpoint = 'vcenter';
      this.cloudNameForDisplay = 'VMware Vcenter';
    } else if (currentUrl.includes('unity-vcenter')) {
      this.cloudNameForEndpoint = 'unity-vcenter';
      this.cloudNameForDisplay = 'United Private Cloud Vcenter';
    }
  }

  getDetails() {
    this.crudService.getDetails(this.instanceId, this.cloudNameForEndpoint).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      if (this.instance.event_inbound_webhook) {
        this.getEventIngestionParams();
      } else {
        this.getEventIngestionParams();
        this.manageActiveForm();
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(err.error.detail));
    })
  }

  getEventIngestionParams(isEventIngestion?: boolean) {
    this.paramList = [];
    this.mandatoryParamList = [];
    this.nonMandatoryParamList = [];
    this.crudService.getEventIngestionParams().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.paramList = data.meta_data;
      this.mandatoryParamList = this.paramList.filter(param => param.required == true);
      this.nonMandatoryParamList = this.paramList.filter(param => param.required == false);
      if (this.instanceId && !isEventIngestion) {
        this.manageActiveForm();
      }
      if (isEventIngestion) {
        this.buildEventIngestionForm();
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get instance details. Please try again.'));
      this.spinner.stop('main');
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'credentialForm':
        this.activeForm = formName;
        break;
      case 'scheduleForm':
        if (this.isValidIntegrationPageForms()) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          this.onSubmitCredentialForm();
        }
        break;
      default:
        this.activeForm = 'credentialForm';
        this.buildCredentialsForm();
    }
    this.spinner.stop('main');
  }

  buildCredentialsForm() {
    this.credentialForm = this.crudService.buildCredentialForm(this.instance);
    this.credentialFormErrors = this.crudService.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.crudService.credentialFormValidationMessages;
    this.manageCredentialForm();
  }

  manageCredentialForm() {
    if (this.instance) {
      if (this.instanceId && this.instance.discover_resources) {
        this.buildResourceForm();
      }
    }
    if (this.instance?.ingest_event) {
      this.buildEventIngestionForm();
    }
    this.credentialForm.get('discover_resources').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.buildResourceForm();
        this.credentialForm.get('discover_dependency').enable();
        this.credentialForm.get('is_managed').enable();
      } else {
        this.resourceForm = null;
        this.resourceFormErrors = null;
        this.resourceFormValidationMessages = null;
        this.credentialForm.get('discover_dependency').setValue(false);
        this.credentialForm.get('is_managed').setValue(false);
        this.credentialForm.get('discover_dependency').disable();
        this.credentialForm.get('is_managed').disable();
      }
    });
    this.credentialForm.get('ingest_event').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        if (this.instance?.event_inbound_webhook?.attribute_map?.length) {
          this.buildEventIngestionForm();
        } else {
          this.instanceId ? this.getEventIngestionParams(true) : this.buildEventIngestionForm();
        }
      } else {
        this.eventIngestionForm = null;
        this.eventIngestionFormErrors = null;
        this.eventIngestionFormValidationMessages = null;
      }
    });
  }

  buildResourceForm() {
    this.resourceForm = this.crudService.buildResourcesForm(this.instance);
    this.resourceFormErrors = this.crudService.resetResourcesFormErrors();
    this.resourceFormValidationMessages = this.crudService.resourcesFormValidationMessages;

    if (this.instance && this.instance.discover_resources && this.instance.colocation_cloud) {
      let selectedDC = this.datacenterList.find(dc => dc.uuid == this.instance.colocation_cloud.uuid);
      if (selectedDC) {
        this.resourceForm.get('colocation_cloud').setValue(selectedDC);
      }
    }

    if (this.instance && this.instance.discover_resources && this.instance.collector) {
      let selectedCollector = this.collectorList.find(c => c.uuid == this.instance.collector.uuid);
      if (selectedCollector) {
        this.resourceForm.get('collector').setValue(selectedCollector);
      }
    }
  }

  get attributes() {
    return (this.eventIngestionForm.get('event_inbound_webhook.attribute_map') as FormArray);
  }

  get additionalAttribute() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute') as FormGroup);
  }

  get additionalAttributeChoices() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute.choice_map') as FormArray);
  }

  get selectedAttributes() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute_map') as FormArray);
  }

  get selectedAttributeChoices() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute.choice_map') as FormArray);
  }

  choiceMapControls(index: number) {
    return (this.attributes.at(index).get('choice_map') as FormArray);
  }

  selectedChoiceMapControls(index: number) {
    return (this.selectedAttributes.at(index).get('choice_map') as FormArray);
  }

  buildEventIngestionForm() {
    this.eventIngestionForm = this.crudService.buildEventIngestionForm(this.paramList, this.instance);
    this.eventIngestionFormErrors = this.crudService.resetEventIngestionFormErrors();
    this.eventIngestionFormValidationMessages = this.crudService.eventIngestionValidationMessages;
    this.manageEventIngestionForm();
  }

  manageEventIngestionForm() {
    if (this.instance?.event_inbound_webhook?.attribute_map?.length) {
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.crudService.resetAdditionalresetAttributeErrors();
      this.eventIngestionFormErrors.event_inbound_webhook['attribute_map'] = [];
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute_map'] = [];
      this.instance.event_inbound_webhook.attribute_map.forEach(attribute => {
        const param = this.paramList.find(p => p.name == attribute.unity_attribute);
        const fg = <FormGroup>this.builder.group({
          'unity_attribute': [param.name],
          'display_name': [param.display_name],
          'mapped_attribute_expression': [attribute.mapped_attribute_expression, [Validators.required, NoWhitespaceValidator]],
          'expression_type': [attribute.expression_type],
          'regular_expression': [attribute.regular_expression],
          'choice_map': this.builder.array([]),
        });
        if (param.required) {
          this.eventIngestionFormErrors.event_inbound_webhook.attribute_map.push(this.crudService.resetAttributeErrors());
          if (param?.choices.length) {
            param.choices.forEach((c, choiceIndex) => {
              const choice = <FormGroup>this.builder.group({
                'unity_value': [c[0]],
                'display_value': [c[1]],
                'mapped_value': [attribute.choice_map[choiceIndex]?.mapped_value, [Validators.required, NoWhitespaceValidator]]
              });
              const index = this.eventIngestionFormErrors.event_inbound_webhook.attribute_map.length - 1;
              this.eventIngestionFormErrors.event_inbound_webhook.attribute_map[index].choice_map.push({ 'mapped_value': '' });
              (fg.get('choice_map') as FormArray).push(choice);
            });
          }
          this.attributes.push(fg);
        } else {
          this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map.push(this.crudService.resetAttributeErrors());
          if (param?.choices.length) {
            param.choices.forEach((c, choiceIndex) => {
              const choice = this.builder.group({
                'unity_value': [c[0]],
                'display_value': [c[1]],
                'mapped_value': [attribute.choice_map[choiceIndex]?.mapped_value, [Validators.required, NoWhitespaceValidator]]
              });
              const index = this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map.length - 1;
              this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map[index].choice_map.push({ 'mapped_value': '' });
              (fg.get('choice_map') as FormArray).push(choice);
            });
          }
          if (param.name === 'custom_data') {
            fg.addControl('custom_field', new FormControl(attribute.custom_field, [Validators.required]));
          }
          this.selectedAttributes.push(fg);
          this.nonMandatoryParamList = this.nonMandatoryParamList.filter(p => p != param);
        }
      });
      this.manageAdditionalAttribute();
    } else {
      if (this.mandatoryParamList && this.mandatoryParamList.length) {
        this.eventIngestionFormErrors.event_inbound_webhook['attribute_map'] = [];
        this.mandatoryParamList.forEach(param => {
          if (param.required) {
            this.eventIngestionFormErrors.event_inbound_webhook.attribute_map.push(this.crudService.resetAttributeErrors());
            if (param?.choices.length) {
              param.choices.forEach(c => {
                const index = this.eventIngestionFormErrors.event_inbound_webhook.attribute_map.length - 1;
                this.eventIngestionFormErrors.event_inbound_webhook.attribute_map[index].choice_map.push({ 'mapped_value': '' });
              });
            }
          }
        });
      }
      if (this.nonMandatoryParamList?.length) {
        this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.crudService.resetAdditionalresetAttributeErrors();
        this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute_map'] = [];
        this.manageAdditionalAttribute();
      }
    }
  }

  manageAdditionalAttribute() {
    this.additionalAttribute.get('unity_attribute').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.crudService.resetAdditionalresetAttributeErrors();
      if (val) {
        this.additionalAttribute.get('mapped_attribute_expression').setValidators([Validators.required, NoWhitespaceValidator]);
        this.additionalAttribute.get('mapped_attribute_expression').updateValueAndValidity();
        const param = this.nonMandatoryParamList.find(param => param.name == val);
        if (param?.choices.length) {
          param.choices.forEach(c => {
            const choice = this.builder.group({
              'unity_value': [c[0]],
              'display_value': [c[1]],
              'mapped_value': ['', [Validators.required, NoWhitespaceValidator]]
            });
            this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute.choice_map.push({ 'mapped_value': '' });
            this.additionalAttributeChoices.push(choice);
          })
        } else {
          this.additionalAttributeChoices.clear();
          this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute.choice_map = [];
        }
        if (val === 'custom_data') {
          this.additionalAttribute.addControl('custom_field', new FormControl('', [Validators.required]));
        } else {
          this.additionalAttribute.removeControl('custom_field');
        }
      } else {
        this.additionalAttribute.get('mapped_attribute_expression').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.additionalAttribute.get('mapped_attribute_expression').updateValueAndValidity();
      }
    });
  }

  addAttribute() {
    this.additionalAttribute.get('unity_attribute').addValidators([Validators.required]);
    this.additionalAttribute.get('unity_attribute').updateValueAndValidity();
    if (this.additionalAttribute.invalid) {
      this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute = this.utilService
        .validateForm(this.additionalAttribute, this.eventIngestionFormValidationMessages.event_inbound_webhook.additional_attribute, this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute);
      this.additionalAttribute.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute = this.utilService
          .validateForm(this.additionalAttribute, this.eventIngestionFormValidationMessages.event_inbound_webhook.additional_attribute, this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute);
      });
    } else {
      const selectedAttributeIndex = this.nonMandatoryParamList.findIndex(param => param.name == this.additionalAttribute.get('unity_attribute').value);
      if (selectedAttributeIndex != -1) {
        const displayName = this.nonMandatoryParamList[selectedAttributeIndex].display_name;
        this.additionalAttribute.get('display_name').setValue(displayName);
        this.nonMandatoryParamList.splice(selectedAttributeIndex, 1);
      }
      const additionalAttributeMapErrors = this.crudService.resetAttributeErrors();
      if (this.additionalAttribute.get('custom_field')) {
        additionalAttributeMapErrors['custom_field'] = '';
      }
      this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map.push(additionalAttributeMapErrors);
      if (this.additionalAttribute.get('choice_map').value.length) {
        this.additionalAttribute.get('choice_map').value.forEach(val => {
          const index = this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map.length - 1;
          this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map[index].choice_map.push({ 'mapped_value': '' });
        })
      }
      this.selectedAttributes.push(_clone(this.additionalAttribute));
      this.additionalAttributeChoices.clear();
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.crudService.resetAdditionalresetAttributeErrors();
      this.additionalAttribute.get('unity_attribute').removeValidators([Validators.required]);
      this.additionalAttribute.removeControl('custom_field');
      this.additionalAttribute.get('unity_attribute').setValue('');
      this.additionalAttribute.get('unity_attribute').updateValueAndValidity();
      this.additionalAttribute.get('expression_type').setValue('simple');
      this.additionalAttribute.get('mapped_attribute_expression').setValue('');
      this.additionalAttribute.get('regular_expression').setValue('');
      this.additionalAttribute.get('regular_expression').setValue('');
    }
  }

  removeAttribute(index: number) {
    const param = this.paramList.find(param => param.name == this.selectedAttributes.value[index].unity_attribute);
    this.nonMandatoryParamList.push(param);
    this.selectedAttributes.removeAt(index);
    this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map.splice(index, 1);
  }

  isValidIntegrationPageForms() {
    let isValid: boolean = true;
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      });
      isValid = false;
    }

    if (this.resourceForm && this.resourceForm.invalid) {
      this.resourceFormErrors = this.utilService.validateForm(this.resourceForm, this.resourceFormValidationMessages, this.resourceFormErrors)
      this.resourceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.resourceFormErrors = this.utilService.validateForm(this.resourceForm, this.resourceFormValidationMessages, this.resourceFormErrors)
      });
      isValid = false;
    }

    if (this.eventIngestionForm) {
      this.additionalAttribute.get('unity_attribute').removeValidators([Validators.required]);
      this.additionalAttribute.get('unity_attribute').updateValueAndValidity();
      if (this.additionalAttribute.get('unity_attribute').value) {
        this.additionalAttribute.get('mapped_attribute_expression').removeValidators([Validators.required]);
        this.additionalAttribute.get('mapped_attribute_expression').updateValueAndValidity();
      }
      if (this.eventIngestionForm.invalid) {
        this.eventIngestionFormErrors = this.utilService.validateForm(this.eventIngestionForm, this.eventIngestionFormValidationMessages, this.eventIngestionFormErrors)
        this.eventIngestionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.eventIngestionFormErrors = this.utilService.validateForm(this.eventIngestionForm, this.eventIngestionFormValidationMessages, this.eventIngestionFormErrors)
        });
        isValid = false;
      }
    }
    return isValid;
  }

  onSubmitCredentialForm() {
    if (this.isValidIntegrationPageForms()) {
      this.manageActiveForm('scheduleForm');
    } else {
      this.notification.warning(new Notification('Please fill in the details and then move to Schedule'));
    }
  }

  buildScheduleForm() {
    if (this.instanceId) {
      this.scheduleSvc.addOrEdit(this.instance.schedule_meta, this.instance.notification);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveInstance(runNowFlag);
    }
  }

  handleError(err: any) {
    this.credentialFormErrors = this.crudService.resetCredentialFormErrors();
    this.resourceFormErrors = this.crudService.resetResourcesFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.activeForm = 'credentialForm';
          this.credentialFormErrors[field] = err[field][0];
        }
        if (this.resourceForm && field in this.resourceForm.controls) {
          this.activeForm = 'credentialForm';
          this.resourceFormErrors[field] = err[field][0];
        }
        else {
          this.scheduleSvc.handleError(err);
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  saveInstance(runNowFlag: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.credentialForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    if (this.resourceForm) {
      let resourcesFormData = Object.assign({}, this.resourceForm.getRawValue());
      obj = Object.assign({}, obj, resourcesFormData)
    }

    if (this.eventIngestionForm) {
      let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
      eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
      delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
      delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
      eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((attribute, index) => {
        eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
        delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
        eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((choice, choiceIndex) => {
          delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
        })
      });
      obj = Object.assign({}, obj, eventIngestionFormData)
    } else {
      obj = Object.assign({}, obj, { 'event_inbound_webhook': null, 'event_inbound_api': null })
    }
    if (this.instanceId) {
      this.crudService.saveInstance(obj, this.cloudNameForEndpoint, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification(`${this.cloudNameForDisplay} account details updated successfully.`));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      })
    } else {
      this.crudService.saveInstance(obj, this.cloudNameForEndpoint).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification(`${this.cloudNameForDisplay} account added successfully.`));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      })
    }
  }

  copyToClipboard(key: string, displayName: string) {
    try {
      navigator.clipboard.writeText(this.eventIngestionForm.get(key).value)
        .then(() => {
          this.notification.success(new Notification(`${displayName} copied to clipboard.`));
        })
    } catch (err) {
      this.notification.error(new Notification(`Failed to copy ${displayName}. Please try again later.`));
    }
  }

  goBack() {
    const currentUrl: string = window.location.href;
    if (currentUrl.includes("summary")) {
      this.router.navigate(['../../../'], { relativeTo: this.route })
    }
    else if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }
}
