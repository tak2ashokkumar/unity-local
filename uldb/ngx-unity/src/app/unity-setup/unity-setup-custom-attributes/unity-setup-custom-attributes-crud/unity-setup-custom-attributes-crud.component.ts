import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { UnitySetupCustomAttributesCrudService } from './unity-setup-custom-attributes-crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UnityResourceType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UnityDeviceTypeList } from '../unity-setup-custom-attributes.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'unity-setup-custom-attributes-crud',
  templateUrl: './unity-setup-custom-attributes-crud.component.html',
  styleUrls: ['./unity-setup-custom-attributes-crud.component.scss'],
  providers: [UnitySetupCustomAttributesCrudService]
})
export class UnitySetupCustomAttributesCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  attrId: string;
  action: 'Create' | 'Edit';
  view: any;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  unityDeviceTypes: UnityResourceType[] = UnityDeviceTypeList;
  nonFieldErr: string;

  constructor(private svc: UnitySetupCustomAttributesCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private builder: FormBuilder,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.attrId = params.get('attrId');
      this.action == this.attrId ? 'Edit' : 'Create';
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.attrId) {
      this.getAttributeDetails();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAttributeDetails() {
    this.svc.getAttributeDetails(this.attrId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
      this.buildForm();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get custom attribute details. Tryagain later.'))
    })
  }

  buildForm() {
    this.form = this.svc.buildForm(this.view);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages();
    this.form.get('value_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
      this.form.get('default_value').setValue('');
      if (type == 'Choice') {
        this.form.get('default_value').clearValidators();
        this.form.addControl('choice_values', new FormArray([]));
        this.addValueField();
      } else {
        this.form.removeControl('choice_values');
        if (type == 'Integer') {
          this.form.get('default_value').setValidators([RxwebValidators.numeric({ allowDecimal: false }), NoWhitespaceValidator]);
        } else if (type == 'Char') {
          this.form.get('default_value').setValidators([Validators.pattern(/^[\s\S]+$/), NoWhitespaceValidator]);
        } else {
          this.form.get('default_value').clearValidators();
        }
      }
      setTimeout(() => {
        this.form.updateValueAndValidity();
      }, 0)
    })
    this.spinner.stop('main');
  }

  get choiceValues(): FormArray {
    return this.form.get('choice_values') as FormArray;
  }

  addValueField(index?: number) {
    let addAt: number = 0;
    if (index || index == 0) {
      addAt++;
    }
    let ctrl = <FormControl>this.choiceValues.at(index);
    if (ctrl && ctrl.invalid) {
      this.formErrors.choice_values[index] = ctrl.invalid ? 'Enter valid input' : '';
      return;
    } else {
      this.formValidationMessages.choice_values[addAt] = {
        'required': 'Enter valid Input'
      };
      if (!(this.formErrors.choice_values instanceof Array)) {
        this.formErrors.choice_values = [];
      }
      this.formErrors.choice_values[addAt] = '';
      setTimeout(() => {
        this.choiceValues.push(new FormControl('', [Validators.required, NoWhitespaceValidator]));
      }, 0)
    }
  }

  removeValueField(index: number) {
    this.choiceValues.removeAt(index);
    this.formErrors.choice_values.splice(index, 1);
    this.formValidationMessages.choice_values.splice(index, 1);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.form.getRawValue());
      if (this.attrId) {
        this.svc.save(obj, this.attrId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Attribute updated successfully'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        })
      } else {
        this.svc.save(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Attribute created successfully'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        })
      }
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      if (this.attrId) {
        this.notification.error(new Notification('Failed to update attribute. Tryagain later.'));
      } else {
        this.notification.error(new Notification('Failed to create attribute. Tryagain later.'));
      }
    }
    this.spinner.stop('main');
  }

  goBack() {
    if (this.attrId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
