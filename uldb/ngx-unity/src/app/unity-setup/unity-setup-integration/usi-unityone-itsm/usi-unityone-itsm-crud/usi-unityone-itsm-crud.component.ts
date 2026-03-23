import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UsiUnityoneItsmCrudService } from './usi-unityone-itsm-crud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usi-unityone-itsm-crud',
  templateUrl: './usi-unityone-itsm-crud.component.html',
  styleUrls: ['./usi-unityone-itsm-crud.component.scss']
})
export class UsiUnityoneItsmCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  unityOneData: any;
  refernce: any;
  unityOneId: string;
  action: 'Create' | 'Update';

  constructor(private svc: UsiUnityoneItsmCrudService,
    private builder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.unityOneId = params.get('id');
      this.action = this.unityOneId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    if (this.unityOneId) {
      this.getUnityOneData();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUnityOneData() {
    this.spinner.start('main');
    this.svc.getUnityOneData(this.unityOneId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.unityOneData = data;
      this.buildForm(this.unityOneData);
      this.spinner.stop('main');
    });
  }

  buildForm(task?: any) {
    this.form = this.svc.buildForm(task);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;

    if (task && Array.isArray(task.fields)) {
      this.initFieldsFromData(task.fields);
    }
  }

  initFieldsFromData(fields: any[]) {
    const fa = this.fields;

    fields.forEach((f, index) => {
      const fg = this.svc.createFieldGroup(f);

      const optsFA = fg.get('options') as FormArray;
      if (Array.isArray(f.options)) {
        f.options.forEach((val: string) => {
          optsFA.push(this.builder.control(val, [Validators.required, NoWhitespaceValidator]));
        });
      }

      fa.push(fg);

      this.formErrors.fields.push(this.svc.getFieldErrors());
      this.manageFieldFormSubscription(fg, index);

      this.subscribeToLabelChanges(fg);
      this.subscribeToFieldTypeChanges(fg);
    });
  }

  manageFieldFormSubscription(fieldGroup: FormGroup, index: number) {
    fieldGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.formErrors.fields[index] = this.utilService.validateForm(fieldGroup, this.formValidationMessages.fields, this.formErrors.fields[index]);
    });
  }

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  addField() {
    const lastIndex = this.fields.length - 1;

    if (lastIndex >= 0) {
      const lastFieldGroup = this.fields.at(lastIndex) as FormGroup;

      if (lastFieldGroup.invalid) {
        this.formErrors.fields[lastIndex] = this.utilService.validateForm(lastFieldGroup, this.formValidationMessages.fields, this.formErrors.fields[lastIndex]);
        return;
      }
    }

    const fg = this.svc.createFieldGroup(this.unityOneData);

    const opts = fg.get('options') as FormArray;
    opts.push(this.builder.control('', [Validators.required, NoWhitespaceValidator]));

    this.fields.push(fg);

    this.formErrors.fields.push(this.svc.getFieldErrors());
    const newIndex = this.fields.length - 1;
    this.manageFieldFormSubscription(fg, newIndex);

    this.subscribeToLabelChanges(fg);
    this.subscribeToFieldTypeChanges(fg);
  }


  removeField(index: number) {
    this.fields.removeAt(index);
  }

  optionsAt(fieldIndex: number): FormArray {
    return this.fields.at(fieldIndex).get('options') as FormArray;
  }

  // addOption(fieldIndex: number) {
  //   this.optionsAt(fieldIndex).push(this.builder.control(''));
  // }

  addOption(fieldIndex: number) {
    const optsFA = this.optionsAt(fieldIndex);
    const lastIndex = optsFA.length - 1;

    if (lastIndex >= 0) {
      const lastCtrl = optsFA.at(lastIndex) as FormControl;
      if (lastCtrl.invalid) {
        return;
      }
    }
    optsFA.push(this.builder.control('', [Validators.required, NoWhitespaceValidator]));
  }


  removeOption(fieldIndex: number, optionIndex: number) {
    this.optionsAt(fieldIndex).removeAt(optionIndex);
  }

  getFieldType(i: number): string {
    return this.fields.at(i).get('field_type').value;
  }

  subscribeToFieldTypeChanges(fieldGroup: FormGroup) {
    const fieldTypeCtrl = fieldGroup.get('field_type');
    const optionsFA = fieldGroup.get('options') as FormArray;
    const referenceCtrl = fieldGroup.get('reference_table');

    fieldTypeCtrl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      while (optionsFA.length) {
        optionsFA.removeAt(0);
      }
      referenceCtrl.setValue('', { emitEvent: false });

      if (value === 'DROPDOWN') {
        optionsFA.push(this.builder.control('', [Validators.required, NoWhitespaceValidator]));
      }

      if (value === 'REFERENCE') {
        this.getRefernce();
      }
    });

    if (fieldTypeCtrl.value === 'REFERENCE') {
      this.getRefernce();
    }
  }

  subscribeToLabelChanges(fieldGroup: FormGroup) {
    const labelCtrl = fieldGroup.get('label');
    const fieldNameCtrl = fieldGroup.get('field_name');

    labelCtrl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!val) {
        fieldNameCtrl.setValue('', { emitEvent: false });
        return;
      }

      const snake = val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      fieldNameCtrl.setValue(snake, { emitEvent: false });
    });
  }

  getRefernce() {
    this.svc.getReference().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.refernce = param.results;
    });
  }

  confirmTaskCreate() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      const obj = this.form.getRawValue();
      if (this.unityOneId) {
        console.log("here update")
        this.svc.updateUnityOne(obj, this.unityOneId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('UnityOne ITSM Table is updated.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          // this.handleError(err.error);
        });
      } else {
        this.svc.createUnityOne(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('UnityOne ITSM Table is created.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          // this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.unityOneId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
