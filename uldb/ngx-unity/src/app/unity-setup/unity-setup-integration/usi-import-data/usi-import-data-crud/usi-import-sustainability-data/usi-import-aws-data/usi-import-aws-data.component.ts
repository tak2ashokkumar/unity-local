import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UsiImportDataCrudService } from '../../usi-import-data-crud.service';
import { UsiImportAwsDataService } from './usi-import-aws-data.service';
@Component({
  selector: 'usi-import-aws-data',
  templateUrl: './usi-import-aws-data.component.html',
  styleUrls: ['./usi-import-aws-data.component.scss'],
  providers: [UsiImportAwsDataService]
})
export class UsiImportAwsDataComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Output('formData') formData = new EventEmitter<any>();
  awsForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  accounts: any;
  accountIds: string[];
  uploadedFileName: string;

  constructor(private awsSvc: UsiImportAwsDataService,
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
    this.getAccounts();
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.awsForm = this.awsSvc.buildForm();
    this.formErrors = this.awsSvc.resetFormErrors();
    this.validationMessages = this.awsSvc.validationMessages;
    this.awsForm.get('account_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(name => {
      if (name == 'newaccount') {
        this.awsForm.addControl('new_account_name', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        this.awsForm.get('account_id').setValue('newaccountid');
      } else {
        this.awsForm.removeControl('new_account_name');
        this.awsForm.get('account_id').setValue('');
      }
    });
    this.awsForm.get('account_id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(id => {
      if (id == 'newaccountid') {
        this.awsForm.addControl('new_account_id', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        this.awsForm.removeControl('new_account_id');
      }
    });
  }

  handleError(err: any) {
    this.formErrors = this.awsSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.awsForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  getAccounts() {
    this.awsSvc.getAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.accounts = this.awsSvc.convertToAccountViewData(accounts);
    })
  }

  onAccountNameChange(accountName: string) {
    this.accountIds = this.accounts
      .filter(account => account.accountName == accountName)
      .map(account => account.accountId)[0];
  }

  onFileChange(files: FileList) {
    if (!files.length) {
      return;
    }
    this.awsForm.get(`aws_file`).setValue(files.item(0));
    this.uploadedFileName = files.item(0).name;
  }

  submit() {
    if (this.awsForm.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(this.awsForm, this.validationMessages, this.formErrors);
      this.awsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.awsForm, this.validationMessages, this.formErrors); });
    } else {
      this.formData.emit(this.awsForm.getRawValue())
    }
  }
}
