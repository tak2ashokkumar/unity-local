import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UsiImportSustainabilityDataService } from './usi-import-sustainability-data.service';
import { takeUntil } from 'rxjs/operators';
import { UsiImportDataCrudService } from '../usi-import-data-crud.service';

@Component({
  selector: 'usi-import-sustainability-data',
  templateUrl: './usi-import-sustainability-data.component.html',
  styleUrls: ['./usi-import-sustainability-data.component.scss'],
  providers: [UsiImportSustainabilityDataService]
})
export class UsiImportSustainabilityDataComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Output('formData') formData = new EventEmitter<any>();
  sustainibilityForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  cloudType: string = '';

  constructor(private sustainabilitySvc: UsiImportSustainabilityDataService,
    private utilService: AppUtilityService,
    private crudSvc: UsiImportDataCrudService) {
    this.crudSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.crudSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(err => {
      this.handleError(err);
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  childFormData($event: any) {
    let childFormData = $event;
    if (this.sustainibilityForm.valid) {
      let fd = Object.assign({}, this.sustainibilityForm.getRawValue(), childFormData);
      this.formData.emit(fd);
    }
  }

  buildForm() {
    this.sustainibilityForm = this.sustainabilitySvc.buildForm();
    this.formErrors = this.sustainabilitySvc.resetFormErrors();
    this.validationMessages = this.sustainabilitySvc.validationMessages;
    this.sustainibilityForm.get('cloud_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
      this.cloudType = type;
    });
    this.sustainibilityForm.get('cloud_type').setValue('AWS');
  }

  handleError(err: any) {
    this.formErrors = this.sustainabilitySvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.sustainibilityForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  submit() {
    if (this.sustainibilityForm.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(this.sustainibilityForm, this.validationMessages, this.formErrors);
      this.sustainibilityForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.sustainibilityForm, this.validationMessages, this.formErrors); });
    }
  }

}
