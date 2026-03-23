import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UsffOsConfigService } from './usff-os-config.service';

@Component({
  selector: 'usff-os-config',
  templateUrl: './usff-os-config.component.html',
  styleUrls: ['./usff-os-config.component.scss'],
  providers: [UsffOsConfigService]
})
export class UsffOsConfigComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  sectionOpenStates: boolean[] = [false];
  disableValueChanges: boolean = false;

  constructor(private service: UsffOsConfigService,
    private builder: FormBuilder,
    private utilService: AppUtilityService) {
    this.service.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
  }

  ngOnInit(): void {
    this.buildForm()
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.form = this.service.buildForm(null);
    this.formErrors = this.service.resetFormErrors();
    this.validationMessages = this.service.validationMessages;
  }

  get osArray(): FormArray {
    return this.form.get('os') as FormArray;
  }

  toggleComputeOpenOrClose(index: number) {
    this.sectionOpenStates[index] = !this.sectionOpenStates[index];
  }

  addCompute(index: number) {
    if (this.osArray.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      if (this.osArray.value.length < 2) {
        this.osArray.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          if (this.disableValueChanges) return;
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
      }
    } else {
      const newCompute = this.builder.group({
        'device': ['', [Validators.required]],
        'status': ['']
      })
      this.disableValueChanges = true;
      this.formErrors.os.push(this.service.resetComputeFormErrors());
      this.osArray.push(newCompute);
      this.disableValueChanges = false;
    }
  }

  deleteCompute(index: number) {
    if (index >= 0 && index < this.osArray.length) {
      if (this.osArray.length > 1) {
        this.disableValueChanges = true;
        this.osArray?.removeAt(index);
        this.disableValueChanges = false;

        this.sectionOpenStates?.splice(index, 1);
      }
    }
    this.formErrors.resource_types?.splice(index, 1);
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
    } else {
      console.log('SUbmit', this.form.getRawValue);
    }
  }
}
