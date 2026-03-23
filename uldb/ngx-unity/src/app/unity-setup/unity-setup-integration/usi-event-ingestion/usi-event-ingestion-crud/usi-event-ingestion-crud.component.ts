import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { eventIngestionChoiceMapType, UsiEventIngestionService } from './usi-event-ingestion-crud.service';
import { cloneDeep as _clone } from 'lodash-es';
import { UsiAccount, UsiEventIngestionParams } from '../../unity-setup-integration.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
@Component({
  selector: 'usi-event-ingestion-crud',
  templateUrl: './usi-event-ingestion-crud.component.html',
  styleUrls: ['./usi-event-ingestion-crud.component.scss']
})
export class UsiEventIngestionCrudComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  eventIngestionForm: FormGroup;
  eventIngestionFormErrors: any;
  eventIngestionFormValidationMessages: any;
  mandatoryParamList: Array<UsiEventIngestionParams> = [];
  nonMandatoryParamList: Array<UsiEventIngestionParams> = [];
  instanceId: string;
  isWebhookUrlAndKeyNotRequired: boolean = false;
  isMarginTopNotRequired: boolean = false;
  @Input() paramList: Array<UsiEventIngestionParams> = []; // response from the api for params list.
  @Input() instance: UsiAccount; // the instance we are of cloud from APi.
  @Input() eventIngestionCheck: boolean = false;
  @Input() eventAttribute: string;
  @Input() defaultEventIngestionValues?: any;
  @Output() formUpdate = new EventEmitter<{ form: FormGroup, formErrors: any, formValidationMessages: any }>();

  constructor(
    private svc: UsiEventIngestionService,
    private builder: FormBuilder,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private router: Router,
  ) { this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => { this.instanceId = params.get('instanceId') }); }

  ngOnInit(): void {

    /** to handle the  Webhook url and Key input boxes not show and to not add margin top CSS class*/
    const url: string = this.router.url;
    this.isWebhookUrlAndKeyNotRequired = url.includes('email');
    this.isMarginTopNotRequired = this.isWebhookUrlAndKeyNotRequired;

    this.buildEventIngestionForm();
    this.emitFormUpdate();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildEventIngestionForm();
    this.eventIngestionForm.valueChanges.subscribe(() => {
      this.emitFormUpdate();
    });
    if (changes) {
      this.mandatoryParamList = this.paramList.filter(param => param.required == true);
      this.nonMandatoryParamList = this.paramList.filter(param => param.required == false);
    }
    if (this.instanceId) {
      this.emitFormUpdate();
    }
    if (this.eventIngestionCheck) {
      this.buildEventIngestionForm();
      this.emitFormUpdate();
    } else {
      this.eventIngestionForm = null;
      this.eventIngestionFormErrors = null;
      this.eventIngestionFormValidationMessages = null;
      this.emitFormUpdate();
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

  emitFormUpdate() {
    // Emit the updated form to the parent component
    this.formUpdate.emit({ form: this.eventIngestionForm, formErrors: this.eventIngestionFormErrors, formValidationMessages: this.eventIngestionFormValidationMessages });
  }

  buildEventIngestionForm() {
    this.eventIngestionForm = this.svc.buildEventIngestionForm(this.paramList, this.instance);
    this.eventIngestionFormErrors = this.svc.resetEventIngestionFormErrors();
    this.eventIngestionFormValidationMessages = this.svc.eventIngestionValidationMessages;
    this.manageEventIngestionForm();
    this.mapDefaultValues();
  }

  manageEventIngestionForm() {
    if (this.instance?.event_inbound_webhook?.attribute_map?.length) {
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.svc.resetAdditionalresetAttributeErrors();
      this.eventIngestionFormErrors.event_inbound_webhook['attribute_map'] = [];
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute_map'] = [];
      this.instance.event_inbound_webhook.attribute_map.forEach(attribute => {
        const param = this.paramList.find(p => p.name == attribute.unity_attribute);
        if (param) {
          const fg = <FormGroup>this.builder.group({
            'unity_attribute': [param.name],
            'display_name': [param.display_name],
            'mapped_attribute_expression': [attribute.mapped_attribute_expression, [Validators.required, NoWhitespaceValidator]],
            'expression_type': [attribute.expression_type],
            'regular_expression': [attribute.regular_expression],
            'choice_map': this.builder.array([])
          });
          if (param.required) {
            this.eventIngestionFormErrors.event_inbound_webhook.attribute_map.push(this.svc.resetAttributeErrors());
            if (param?.choices.length) {
              param.choices.forEach((c, choiceIndex) => {
                const mappedValue: eventIngestionChoiceMapType = attribute.choice_map.find(cm => String(c[0]) == cm.unity_value);
                const choice = <FormGroup>this.builder.group({
                  'unity_value': [c[0]],
                  'display_value': [c[1]],
                  'mapped_value': [mappedValue?.mapped_value, [Validators.required, NoWhitespaceValidator]]
                });
                const index = this.eventIngestionFormErrors.event_inbound_webhook.attribute_map.length - 1;
                this.eventIngestionFormErrors.event_inbound_webhook.attribute_map[index].choice_map.push({ 'mapped_value': '' });
                (fg.get('choice_map') as FormArray).push(choice);
              });
            }
            this.attributes.push(fg);
          } else {
            this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map.push(this.svc.resetAttributeErrors());
            if (param?.choices.length) {
              param.choices.forEach((c, choiceIndex) => {
                const mappedValue: eventIngestionChoiceMapType = attribute.choice_map.find(cm => String(c[0]) == cm.unity_value);
                const choice = this.builder.group({
                  'unity_value': [c[0]],
                  'display_value': [c[1]],
                  'mapped_value': [mappedValue?.mapped_value, [Validators.required, NoWhitespaceValidator]]
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
            if (param.name !== 'custom_data') {
              this.nonMandatoryParamList = this.nonMandatoryParamList.filter(p => p != param);
            }
            // this.nonMandatoryParamList = this.nonMandatoryParamList.filter(p => p != param);
          }
        }
      });
      this.manageAdditionalAttribute();
    } else {
      if (this.mandatoryParamList && this.mandatoryParamList.length) {
        this.eventIngestionFormErrors.event_inbound_webhook['attribute_map'] = [];
        this.mandatoryParamList.forEach(param => {
          if (param.required) {
            this.eventIngestionFormErrors.event_inbound_webhook.attribute_map.push(this.svc.resetAttributeErrors());
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
        this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.svc.resetAdditionalresetAttributeErrors();
        this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute_map'] = [];
        this.manageAdditionalAttribute();
      }
    }
  }

  manageAdditionalAttribute() {
    this.additionalAttribute.get('unity_attribute').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.svc.resetAdditionalresetAttributeErrors();
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

  mapDefaultValues() {
    if (!this.instance?.event_inbound_webhook?.attribute_map?.length && this.eventIngestionForm && this.defaultEventIngestionValues?.length) {
      this.defaultEventIngestionValues.forEach(value => {

        const formGroup = this.attributes.controls.find(fg =>
          fg.get('unity_attribute')?.value == value.unity_attribute
        );

        if (formGroup) {
          formGroup.patchValue({
            'mapped_attribute_expression': value.mapped_attribute_expression || '',
            'regular_expression': value.regular_expression || '',
          })
          const choiceMapFormArray = formGroup.get('choice_map') as FormArray;
          value.choice_map.forEach(choice => {
            const choiceFormGroup = choiceMapFormArray.controls.find(cfg =>
              cfg.get('unity_value')?.value == choice.unity_value
            );

            if (choiceFormGroup) {
              choiceFormGroup.patchValue({
                'mapped_value': choice.mapped_value || ''
              })
            }
          });
        }

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
        if (displayName !== 'custom data') {
          this.nonMandatoryParamList.splice(selectedAttributeIndex, 1);
        }
      }
      const additionalAttributeMapErrors = this.svc.resetAttributeErrors();
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
      this.eventIngestionFormErrors.event_inbound_webhook['additional_attribute'] = this.svc.resetAdditionalresetAttributeErrors();
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
    if (param.display_name != 'custom data') {
      this.nonMandatoryParamList.push(param);
    }
    this.selectedAttributes.removeAt(index);
    this.eventIngestionFormErrors.event_inbound_webhook.additional_attribute_map.splice(index, 1);
  }

}
