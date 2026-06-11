import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserType } from 'src/app/mtp-administration/mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { attributeList, EmailBodyViewData, MtpAdministrationNotificationEmailService } from './mtp-administration-notification-email.service';
import { NotificationEmailType } from './mtp-administration-notification-email.type';

@Component({
  selector: 'mtp-administration-notification-email',
  templateUrl: './mtp-administration-notification-email.component.html',
  styleUrls: ['./mtp-administration-notification-email.component.scss'],
  providers: [MtpAdministrationNotificationEmailService]
})
export class MtpAdministrationNotificationEmailComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  eventId: string;
  emailData: NotificationEmailType;
  attributes: EmailBodyViewData[] = [];
  filteredAttributes: EmailBodyViewData[] = [];
  selectedAttributes: EmailBodyViewData[] = [];
  emails: EmailBodyViewData[] = [];
  filteredEmails: EmailBodyViewData[] = [];
  selectedEmails: EmailBodyViewData[] = [];
  userList: Array<UserType> = [];
  selectedUsers: UserType[] = [];
  noUsers: boolean = false;
  nonFieldErr: string = '';
  searchValue: string = '';
  fieldsToFilterOn: string[] = ['name'];
  searchEmailBodyValue: string = '';

  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private emailService: MtpAdministrationNotificationEmailService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private userInfo: UserInfoService) {
    this.route.paramMap.subscribe(params => this.eventId = params.get('eventId'));

  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getEmailData();
    this.getAttributes();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.searchValue = event;
    this.filteredAttributes = this.clientSideSearchPipe.transform(this.attributes, event, this.fieldsToFilterOn);
  }

  onEmailBodySearched(event: string) {
    this.searchEmailBodyValue = event;
    this.filteredEmails = this.clientSideSearchPipe.transform(this.emails, event, this.fieldsToFilterOn)
  }

  getEmailData() {
    this.emailService.getEmailData(this.eventId, this.userInfo.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.emailData = res;
      this.buildForm(this.emailData);
      this.getUsers();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('main');
    });
  }

  getAttributes() {
    this.attributes = [...attributeList];
    this.filteredAttributes = [...attributeList];
    this.emails = [...attributeList];
    this.filteredEmails = [...attributeList];
  }

  getUsers() {
    this.userList = [];
    this.emailService.getUsers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.userList = data;
      let users = <string[]>this.emailData.email_list;
      if (users.length) {
        this.form.get('email_list').setValidators([]);
        this.form.get('email_list').updateValueAndValidity();
        users.forEach(user => {
          let obj = this.userList.find(u => u.email == user);
          if (obj) {
            this.selectedUsers.push(obj);
          }
        });
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get users.'));
      this.spinner.stop('main');
    });
  }

  buildForm(data: NotificationEmailType) {
    this.selectedAttributes = [];
    this.selectedEmails = [];
    this.selectedUsers = [];
    this.form = this.emailService.buildForm(data, this.eventId);
    this.formErrors = this.emailService.resetFormErrors();
    this.validationMessages = this.emailService.validationMessages;
    if (this.form.get('custom_message').value) {
      if (!this.form.get('custom_message').value.length) {
        this.form.get('custom_message').disable();
      } else {
        this.form.get('flag').setValue(true);
      }
    } else {
      this.form.get('custom_message').disable();
    }
    this.form.get('flag').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      if (value) {
        this.form.get('custom_message').enable();
      } else {
        this.form.get('custom_message').disable();
        this.form.get('custom_message').setValue('');
      }
    });
    if (data) {
      let attributes = <string[]>this.form.get('subject_list').value;
      if (attributes.length) {
        attributes.forEach(attribute => {
          let attributeObj = this.filteredAttributes.find(a => a.name == attribute);
          attributeObj.isSelected = true;
          if (attributeObj) {
            this.selectedAttributes.push(attributeObj);
          }
        });
      }
      let emails = <string[]>this.form.get('email_content').value;
      if (emails.length) {
        emails.forEach(email => {
          let emailObj = this.filteredEmails.find(a => a.name == email);
          emailObj.isSelected = true;
          if (emailObj) {
            this.selectedEmails.push(emailObj);
          }
        });
      }
    }
  }

  setUserFieldValidation() {
    if (this.selectedUsers.length) {
      this.form.get('email_list').setValidators([]);
    } else {
      this.form.get('email_list').setValidators([Validators.required, NoWhitespaceValidator]);
    }
    this.form.get('email_list').updateValueAndValidity();
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.form.get('email_list').setValue([]);
    if (this.selectedUsers.filter(user => user.email == e.item.email).length) {
      return;
    }
    this.selectedUsers.push(e.item);
    this.setUserFieldValidation();
  }

  typeaheadNoResults(event: boolean): void {
    this.noUsers = event;
  }

  manageSelectedUsers(index: number) {
    this.selectedUsers.splice(index, 1);
    this.setUserFieldValidation();
  }

  selectAttribute(i: number) {
    if (this.filteredAttributes[i].isSelected) {
      this.filteredAttributes[i].isSelected = false;
    } else {
      this.filteredAttributes[i].isSelected = true;
    }
  }

  updateSelectedAttributes() {
    this.selectedAttributes = this.filteredAttributes.filter(attribute => attribute.isSelected);
    this.form.get('subject_list').setValue(this.selectedAttributes.map(t => t.name));
  }

  unSelectAttribute(i: number) {
    let attributeIndex = this.filteredAttributes.findIndex(attribute => attribute.name == this.selectedAttributes[i].name);
    if (attributeIndex != -1) {
      this.filteredAttributes[attributeIndex].isSelected = false;
    }
    this.selectedAttributes.splice(i, 1);
    this.form.get('subject_list').setValue(this.selectedAttributes.map(a => a.name));
  }

  selectEmail(i: number) {
    if (this.filteredEmails[i].isSelected) {
      this.filteredEmails[i].isSelected = false;
    } else {
      this.filteredEmails[i].isSelected = true;
    }
  }

  updateSelectedEmails() {
    this.selectedEmails = this.filteredEmails.filter(email => email.isSelected);
    this.form.get('email_content').setValue(this.selectedEmails.map(t => t.name));
  }

  unSelectEmail(i: number) {
    let emailIndex = this.filteredEmails.findIndex(email => email.name == this.selectedEmails[i].name);
    if (emailIndex != -1) {
      this.filteredEmails[emailIndex].isSelected = false;
    }
    this.selectedEmails.splice(i, 1);
    this.form.get('email_content').setValue(this.selectedEmails.map(a => a.name));
  }

  handleError(err: any) {
    this.formErrors = this.emailService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    } else {
      if (this.emailData) {
        this.spinner.start('main');
        const data = this.form.getRawValue();
        data.email_list = this.selectedUsers.map(user => user.email);
        this.emailService.updateEmail(data, this.eventId, this.userInfo.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Email customized successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}

