import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsiPublicCloudAwsCrudService } from './usi-public-cloud-aws-crud.service';
import { Subject } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { UsiEventIngestionAttribute, UsiEventIngestionParams } from '../../unity-setup-integration.service';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'usi-public-cloud-aws-crud',
  templateUrl: './usi-public-cloud-aws-crud.component.html',
  styleUrls: ['./usi-public-cloud-aws-crud.component.scss'],
  providers: [UsiPublicCloudAwsCrudService]
})
export class UsiPublicCloudAwsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  instanceId: string;
  instance: any;

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;
  credentialFormData: any;

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;
  filterFormData: any;
  serviceSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  nonFieldErr: string = '';
  activeForm: string = 'credentialForm';
  services: string[] = [];

  paramList: Array<UsiEventIngestionParams> = [];
  eventIngestionForm: FormGroup;
  eventIngestionFormErrors: any;
  eventIngestionFormValidationMessages: any;
  scheduleFormData: any;
  credFormButtonName = 'Save';
  defaultEventIngestionValues: UsiEventIngestionAttribute[] = [];

  constructor(private svc: UsiPublicCloudAwsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private scheduleSvc: UnityScheduleService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.instanceId) {
      this.getInstanceDetails();
    } else {
      // this.manageActiveForm();
      this.getParams();
    }
    this.getServices();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get additionalAttribute() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute') as FormGroup);
  }

  getParams() {
    this.paramList = [];
    this.defaultEventIngestionValues = [];
    this.svc.getEventIngestionParams().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.paramList = data.meta_data;
      this.defaultEventIngestionValues = data.attribute_map;
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get instance details. Please try again.'));
      this.spinner.stop('main');
    })
  }

  getInstanceDetails() {
    this.svc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      this.getParams();
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.instance = null;
      this.manageActiveForm();
    })
  }

  getServices() {
    this.svc.getServices().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.services = res;
    }, (err: HttpErrorResponse) => {
      this.services = [];
    })
  }

  onFormUpdate(event: { form: FormGroup, formErrors: any, formValidationMessages: any }) {
    this.eventIngestionForm = event.form;
    this.eventIngestionFormErrors = event.formErrors;
    this.eventIngestionFormValidationMessages = event.formValidationMessages;
    // Now you have the updated form in the parent component
  }

  // manageActiveForm(formName?: string) {
  //   switch (formName) {
  //     case 'credentialForm':
  //       this.activeForm = formName;
  //       break;
  //     case 'filterForm':
  //       if (this.credentialForm.valid) {
  //         this.activeForm = formName;
  //         this.buildFilterForm();
  //       } else {
  //         this.onSubmitCredentialForm();
  //       }
  //       break;
  //     case 'scheduleForm':
  //       if (this.credentialForm.value.ingest_event && !this.credentialForm.value.discover_resources) {
  //         this.activeForm = formName;
  //         this.buildScheduleForm();
  //       } else {
  //         if (!this.filterForm) {
  //           this.notification.warning(new Notification('Please fill in the Credentials, Filters and move to Schedule'));
  //           return;
  //         }
  //         if (this.filterForm.valid) {
  //           this.activeForm = formName;
  //           this.buildScheduleForm();
  //         } else {
  //           this.onSubmitFilterForm();
  //         }
  //       }
  //       break;
  //     default:
  //       this.activeForm = 'credentialForm';
  //       this.buildCredentialsForm();
  //       if (this.instanceId) {
  //         this.buildFilterForm();
  //       }
  //   }
  //   this.spinner.stop('main');
  // }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'credentialForm':
        this.activeForm = formName;
        break;
      case 'filterForm':
        if (this.credentialForm && this.credentialForm.valid) {
          this.activeForm = formName;
          this.buildFilterForm();
        } else {
          this.onSubmitCredentialForm();
        }
        break;
      case 'scheduleForm':
        if (this.credentialForm.value.ingest_event && !this.credentialForm.value.discover_resources) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          if (this.credentialForm.value.discover_resources && !this.filterForm) {
            this.notification.warning(new Notification('Please fill in the Credentials, Filters and move to Schedule'));
            return;
          }
          if (this.filterForm) {
            if (this.filterForm.valid) {
              if (this.credentialForm.value.discover_resources) {
                this.activeForm = formName;
                this.buildScheduleForm();
              }
            } else {
              this.onSubmitFilterForm();
            }
          } else {
            if (this.credentialForm.value.discover_resources) {
              this.activeForm = formName;
              this.buildScheduleForm();
            }
          }
        }
        break;
      default:
        this.activeForm = 'credentialForm';
        this.buildCredentialsForm();
        if (this.instanceId) {
          this.buildFilterForm();
        }
    }
    this.spinner.stop('main');
  }

  buildCredentialsForm() {
    this.credentialForm = this.svc.buildCredentialForm(this.instance);
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.svc.credentialFormValidationMessages;
    this.credentialFormData = this.credentialForm.getRawValue();
    this.manageCredentialForm();
  }

  manageCredentialForm() {
    if (this.instanceId) {
      if (this.instance.discover_resources) {
        this.credentialForm.get('access_key').setValidators([Validators.required, NoWhitespaceValidator]);
        this.credentialForm.get('access_key').updateValueAndValidity();
        this.credentialForm.get('secret_key').setValidators([Validators.required, NoWhitespaceValidator]);
        this.credentialForm.get('secret_key').updateValueAndValidity();
        this.credFormButtonName = 'Next';
      } else {
        this.credFormButtonName = 'Save';
      }
    }
    this.credentialForm.get('discover_resources').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.credentialForm.get('is_managed').enable();
        this.credentialForm.get('cost_analysis').enable();
        // this.credentialForm.get('azure_ad_integ').enable();
        this.credentialForm.get('access_key').setValidators([Validators.required, NoWhitespaceValidator]);
        this.credentialForm.get('access_key').updateValueAndValidity();
        this.credentialForm.get('secret_key').setValidators([Validators.required, NoWhitespaceValidator]);
        this.credentialForm.get('secret_key').updateValueAndValidity();
        this.credFormButtonName = 'Next';
      } else {
        // this.resourceForm = null;
        // this.resourceFormErrors = null;
        // this.resourceFormValidationMessages = null;
        this.credentialForm.get('is_managed').setValue(false);
        this.credentialForm.get('cost_analysis').setValue(false);
        // this.credentialForm.get('azure_ad_integ').setValue(false);
        this.credentialForm.get('is_managed').disable();
        this.credentialForm.get('cost_analysis').disable();
        // this.credentialForm.get('azure_ad_integ').disable();
        this.credentialForm.get('access_key').setValue('');
        this.credentialForm.get('access_key').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.credentialForm.get('access_key').updateValueAndValidity();
        this.credentialForm.get('secret_key').setValue('');
        this.credentialForm.get('secret_key').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.credentialForm.get('secret_key').updateValueAndValidity();
        this.credFormButtonName = 'Save';
      }
    });
    // if (this.azureADAttributeArray) {
    //   for (let i = 0; i < this.azureADAttributeArray?.controls?.length; i++) {
    //     this.credentialFormErrors.attributes_map.push(this.svc.getAttributeMappingErrors());
    //   }
    // }
    // this.credentialForm.get('azure_ad_integ').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
    //   if (val) {
    //     this.credentialForm.addControl('resource_type', new FormControl('', [Validators.required]));
    //     this.credentialForm.addControl('attributes_map', this.svc.buildResourceMappingArray());
    //   } else {
    //     this.credentialForm.removeControl('resource_type');
    //     this.credentialForm.removeControl('attributes_map');
    //   }
    // });
  }

  // onSubmitCredentialForm() {
  //   if (this.credentialForm.value.ingest_event) {
  //     this.callSaveAPi();
  //   } else {
  //     if (this.credentialForm.invalid) {
  //       this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
  //       this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
  //         .subscribe((data: any) => {
  //           this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
  //         });
  //     } else {
  //       this.callSaveAPi();
  //     }
  //   }
  // }

  onSubmitCredentialForm() {
    let isValid: boolean = true;
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
        });
      isValid = false;
    }
    if (this.eventIngestionForm && this.credentialForm.get('ingest_event').value) {
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
    if (isValid) {
      this.callSaveAPi();
    }
  }

  // callSaveAPi() {
  //   let isChanged = false;
  //   if (_clone(this.credentialFormData) != _clone(this.credentialForm.getRawValue())) {
  //     isChanged = true;
  //   } else if (this.eventIngestionForm) {
  //     if (_clone(this.eventIngestionForm) != _clone(this.eventIngestionForm.getRawValue())) {
  //       isChanged = true;
  //     }
  //   }
  //   let isValid: boolean = true;
  //   if (!isChanged) {
  //     if (this.credentialForm.value.ingest_event && !this.credentialForm.value.discover_resources) {
  //       this.manageActiveForm('scheduleForm')
  //     } else {
  //       this.manageActiveForm('filterForm');
  //     }
  //   } else {
  //     if (this.instanceId) {
  //       let obj = Object.assign({}, this.instance, this.credentialForm.getRawValue(), { name: this.credentialForm.getRawValue().account_name });
  //       if (this.credentialForm.value.ingest_event && this.eventIngestionForm) {
  //         let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
  //         eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
  //         delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
  //         delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
  //         eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((att, index) => {
  //           eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
  //           delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
  //           eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((ch, choiceIndex) => {
  //             delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
  //           })
  //           obj = Object.assign({}, obj, eventIngestionFormData);
  //         });
  //       }
  //       this.svc.saveInstance(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //         this.instance = res;
  //         if (isValid && !this.credentialForm.value.discover_resources) {
  //           this.manageActiveForm('scheduleForm');
  //         } else {
  //           this.manageActiveForm('filterForm');
  //         }
  //         this.spinner.stop('main');
  //       }, (err: HttpErrorResponse) => {
  //         this.handleError(err.error);
  //       })
  //     } else {
  //       let obj = Object.assign({}, this.credentialForm.getRawValue(), { name: this.credentialForm.getRawValue().account_name });
  //       if (this.credentialForm.value.ingest_event && this.eventIngestionForm) {
  //         let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
  //         eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
  //         delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
  //         delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
  //         eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((att, index) => {
  //           eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
  //           delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
  //           eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((ch, choiceIndex) => {
  //             delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
  //           })
  //           obj = Object.assign({}, obj, eventIngestionFormData);
  //         });
  //       }
  //       // if (isValid && !this.credentialForm.value.discover_resources) {
  //       //   this.manageActiveForm('scheduleForm');
  //       // } else {
  //       //   this.manageActiveForm('filterForm');
  //       // }
  //       this.svc.saveInstance(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //         this.instance = res;
  //         if (isValid && !this.credentialForm.value.discover_resources) {
  //           this.manageActiveForm('scheduleForm');
  //         } else {
  //           this.manageActiveForm('filterForm');
  //         }
  //         this.spinner.stop('main');
  //       }, (err: HttpErrorResponse) => {
  //         this.handleError(err.error);
  //       })
  //     }
  //     if (this.eventIngestionForm) {
  //       this.additionalAttribute.get('unity_attribute').removeValidators([Validators.required]);
  //       this.additionalAttribute.get('unity_attribute').updateValueAndValidity();
  //       if (this.additionalAttribute.get('unity_attribute').value) {
  //         this.additionalAttribute.get('mapped_attribute_expression').removeValidators([Validators.required]);
  //         this.additionalAttribute.get('mapped_attribute_expression').updateValueAndValidity();
  //       }
  //       if (this.eventIngestionForm.invalid) {
  //         this.eventIngestionFormErrors = this.utilService.validateForm(this.eventIngestionForm, this.eventIngestionFormValidationMessages, this.eventIngestionFormErrors)
  //         this.eventIngestionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //           this.eventIngestionFormErrors = this.utilService.validateForm(this.eventIngestionForm, this.eventIngestionFormValidationMessages, this.eventIngestionFormErrors)
  //         });
  //         isValid = false;
  //       }
  //     }
  //   }
  // }

  callSaveAPi() {
    let isChanged = false;
    if (_clone(this.credentialFormData) != _clone(this.credentialForm.getRawValue())) {
      isChanged = true;
    } else if (this.eventIngestionForm) {
      if (_clone(this.eventIngestionForm) != _clone(this.eventIngestionForm.getRawValue())) {
        isChanged = true;
      }
    }
    if (!isChanged) {
      if (this.credentialForm.value.discover_resources) {
        this.manageActiveForm('filterForm')
      } else {
        this.manageActiveForm('scheduleForm');
      }
    } else {
      if (this.instanceId) {
        let obj = Object.assign({}, this.instance, this.credentialForm.getRawValue());
        if (this.credentialForm.value.ingest_event && this.eventIngestionForm) {
          let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
          eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
          delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
          delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
          eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((att, index) => {
            eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
            delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
            eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((ch, choiceIndex) => {
              delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
            })
            obj = Object.assign({}, obj, eventIngestionFormData);
          });
        }
        this.svc.saveInstance(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.instance = res;
          if (this.credentialForm.value.discover_resources) {
            this.manageActiveForm('filterForm');
          } else {
            // this.manageActiveForm('scheduleForm');
            this.goBack();
          }
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        })
      } else {
        let obj = Object.assign({}, this.credentialForm.getRawValue());
        if (this.credentialForm.value.ingest_event && this.eventIngestionForm) {
          let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
          eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
          delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
          delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
          eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((att, index) => {
            eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
            delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
            eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((ch, choiceIndex) => {
              delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
            })
            obj = Object.assign({}, obj, eventIngestionFormData);
          });
        }
        this.svc.saveInstance(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.instance = res;
          if (this.credentialForm.value.discover_resources) {
            this.manageActiveForm('filterForm');
          } else {
            // this.manageActiveForm('scheduleForm');
            this.goBack();
          }
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        })
      }
    }
  }


  buildFilterForm() {
    this.filterForm = this.svc.buildFilterForm(this.instance);
    this.filterFormErrors = this.svc.resetFilterFormErrors();
    this.filterFormValidationMessages = this.svc.filterFormValidationMessages;
    this.filterFormData = this.filterForm.getRawValue();
    this.filterForm.get('discover_services').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.filterForm.get('services').patchValue([]);
      if (val == 'Custom') {
        this.filterForm.get('services').setValidators([Validators.required]);
        this.filterForm.get('services').enable();
      } else {
        this.filterForm.get('services').disable();
        this.filterForm.get('services').clearValidators();
      }
    })
  }

  onSubmitFilterForm() {
    if (this.filterForm.invalid) {
      this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
      this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
        });
    } else {
      let isChanged = JSON.stringify(this.filterFormData) != JSON.stringify(this.filterForm.getRawValue());
      if (!isChanged) {
        this.manageActiveForm('scheduleForm');
      } else {
        this.spinner.start('main');
        let instanceId = this.instanceId ? this.instanceId : this.instance ? this.instance.uuid : null;
        let obj = Object.assign({}, this.instance, this.filterForm.getRawValue());
        if (this.eventIngestionForm && this.credentialForm.value.ingest_event) {
          let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
          eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
          delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
          delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
          eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((att, index) => {
            eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
            delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
            eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((ch, choiceIndex) => {
              delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
            })
            obj = Object.assign({}, obj, eventIngestionFormData);
          });
        } else {
          obj = Object.assign({}, obj, { 'event_inbound_webhook': null, 'event_inbound_api': null })
        }
        // this.manageActiveForm('scheduleForm');
        this.svc.saveInstance(obj, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.instance = res;
          this.manageActiveForm('scheduleForm');
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        })
      }
      // this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm() {
    if (this.instanceId) {
      this.scheduleSvc.addOrEdit(this.instance.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
    this.scheduleFormData = this.scheduleSvc.getFormValue();
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveInstance(runNowFlag);
    }
  }

  saveInstance(runNowFlag: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.instance, this.scheduleSvc.getFormValue(runNowFlag));
    if (this.credentialForm.value.ingest_event && this.eventIngestionForm) {
      let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
      eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
      delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
      delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
      eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((att, index) => {
        eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
        delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
        eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((ch, choiceIndex) => {
          delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
        })
      });
      obj = Object.assign({}, obj, eventIngestionFormData);
    } else {
      obj = Object.assign({}, obj, { 'event_inbound_webhook': null, 'event_inbound_api': null })
    }
    let isChanged = JSON.stringify(this.scheduleFormData) != JSON.stringify(this.scheduleSvc.getFormValue());
    if (!isChanged) {
      if (runNowFlag) {
        this.spinner.start('main');
        let instanceId = this.instanceId ? this.instanceId : this.instance ? this.instance.uuid : null;
        this.svc.saveInstance(obj, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.goBack();
          this.notification.success(new Notification('AWS discovery initiated.'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        })
      } else {
        this.goBack();
      }
    } else {
      this.spinner.start('main');
      let instanceId = this.instanceId ? this.instanceId : this.instance ? this.instance.uuid : null;
      this.svc.saveInstance(obj, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('AWS account details updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      })
    }
    // this.credentialFormData = this.credentialForm.getRawValue();
    // let obj = Object.assign({}, this.credentialForm.getRawValue(), this.filterForm.getRawValue(),
    //   this.scheduleSvc.getFormValue(runNowFlag), { aws_user: this.credentialFormData.name },
    //   { name: this.credentialFormData.name });
    // if (this.instanceId) {
    //   this.svc.saveInstance(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //     // this.goToList();
    //     this.goBack();
    //     this.notification.success(new Notification('Aws account details updated successfully'));
    //     this.spinner.stop('main');
    //   }, (err: HttpErrorResponse) => {
    //     this.handleError(err.error);
    //   })
    // } else {
    //   this.svc.saveInstance(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //     // this.goToList();
    //     this.goBack();
    //     this.notification.success(new Notification('Aws account added successfully.'));
    //     this.spinner.stop('main');
    //   }, (err: HttpErrorResponse) => {
    //     this.handleError(err.error);
    //   })
    // }
  }

  // handleError(err: any) {
  //   this.credentialFormErrors = this.svc.resetCredentialFormErrors();
  //   this.filterFormErrors = this.svc.resetFilterFormErrors();
  //   if (err.non_field_errors) {
  //     this.nonFieldErr = err.non_field_errors[0];
  //   } else if (err.detail) {
  //     this.nonFieldErr = err.detail;
  //   } else if (err) {
  //     for (const field in err) {
  //       if (field in this.credentialForm.controls) {
  //         this.activeForm = 'credentialForm';
  //         this.credentialFormErrors[field] = err[field][0];
  //       } else if (field in this.filterForm.controls) {
  //         this.activeForm = 'filterForm';
  //         this.filterFormErrors[field] = err[field][0];
  //       } else {
  //         this.scheduleSvc.handleError(err);
  //       }
  //     }
  //   } else {
  //     this.notification.error(new Notification('Something went wrong!! Please try again.'));
  //   }
  //   this.spinner.stop('main');
  // }

  // goToList() {
  //   this.router.navigate(['aws/instances'], { relativeTo: this.route.parent });
  // }

  handleError(err: any) {
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.filterFormErrors = this.svc.resetFilterFormErrors();
    if (err) {
      if (err.non_field_errors) {
        this.nonFieldErr = err.non_field_errors[0];
      } else if (err.detail) {
        this.nonFieldErr = err.detail;
      } else if (err && typeof err === 'object' && err !== null) {
        for (const field in err) {
          if (field in this.credentialForm.controls) {
            this.activeForm = 'credentialForm';
            this.credentialFormErrors[field] = err[field][0];
          } else if (this.filterForm) {
            if (field in this.filterForm.controls) {
              this.activeForm = 'filterForm';
              this.filterFormErrors[field] = err[field][0];
            }
          } else {
            this.scheduleSvc.handleError(err);
          }
        }
      } else {
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      }
      this.spinner.stop('main');
    }
  }


  goBack() {
    const currentUrl = this.router.url;

    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../instances'], { relativeTo: this.route });
    }
  }

}
