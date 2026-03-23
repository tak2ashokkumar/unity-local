import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UsffComputeService } from './usff-compute.service';

@Component({
  selector: 'usff-compute',
  templateUrl: './usff-compute.component.html',
  styleUrls: ['./usff-compute.component.scss'],
  providers: [UsffComputeService]
})
export class UsffComputeComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  sectionOpenStates: boolean[] = [false];
  disableValueChanges: boolean = false;

  constructor(private service: UsffComputeService,
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

  get computeArray(): FormArray {
    return this.form.get('compute') as FormArray;
  }

  toggleComputeOpenOrClose(index: number) {
    this.sectionOpenStates[index] = !this.sectionOpenStates[index];
  }

  addCompute(index: number) {
    if (this.computeArray.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      if (this.computeArray.value.length < 2) {
        this.computeArray.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
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
      this.formErrors.compute.push(this.service.resetComputeFormErrors());
      this.computeArray.push(newCompute);
      this.disableValueChanges = false;
    }
  }

  deleteCompute(index: number) {
    if (index >= 0 && index < this.computeArray.length) {
      if (this.computeArray.length > 1) {
        this.disableValueChanges = true;
        this.computeArray?.removeAt(index);
        this.disableValueChanges = false;

        this.sectionOpenStates?.splice(index, 1);
      }
    }
    this.formErrors.resource_types?.splice(index, 1);
  }

  updateForm() {
    this.service.updateForm(this.form);
  }

  submit() {
    this.updateForm();
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
    } else {
      console.log('SUbmit', this.form.getRawValue);
    }
  }
}
