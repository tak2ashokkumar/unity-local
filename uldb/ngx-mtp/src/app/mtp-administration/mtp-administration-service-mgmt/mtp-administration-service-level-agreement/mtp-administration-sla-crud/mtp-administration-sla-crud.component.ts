import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MtpAdministrationSlaGroupType } from '../../mtp-administration-sla-group/mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.type';
import { MtpAdministrationSlaCrudService } from './mtp-administration-sla-crud.service';
import { MtpAdministrationSlaItemType, MtpCrmContactsType, MtpKpiType } from './mtp-administration-sla-crud.type';
import { MTPTicketPriorityType, MTPTicketStatusType, MTPTicketType } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'mtp-administration-sla-crud',
  templateUrl: './mtp-administration-sla-crud.component.html',
  styleUrls: ['./mtp-administration-sla-crud.component.scss'],
  providers: [MtpAdministrationSlaCrudService]
})
export class MtpAdministrationSlaCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  groupId: string;
  groupSLAId: string;
  itemId: string;
  action: 'Edit' | 'Create';

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';

  userList: MtpCrmContactsType[] = [];
  slaGroups: MtpAdministrationSlaGroupType[] = [];
  requestTypesList: MTPTicketType[] = [];
  kpisList: MtpKpiType[] = [];
  responseSlaKpiList: MtpKpiType[] = [];
  resolutionSlaKpiList: MtpKpiType[] = [];
  responseSuccessConditionList: MTPTicketStatusType[] = [];
  resolutionSuccessConditionList: MTPTicketStatusType[] = [];
  slaPriorities: MTPTicketPriorityType[] = [];
  // initialSlaPriorities: MTPTicketPriorityType[] = [];
  selectedResponseUsers: MtpCrmContactsType[] = [];
  selectedResolutionUsers: MtpCrmContactsType[] = [];
  noUsers = false;

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  resolutionSuccessConditionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'display_name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  resolutionSuccessConditionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Resolution Success Condition',
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudSvc: MtpAdministrationSlaCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.groupId = params.get('groupId');
      this.groupSLAId = params.get('groupSLAId');
      this.itemId = params.get('itemId');
      this.action = this.itemId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    if (this.user.crmInstanceId) {
      this.spinner.start('main');
      this.getDropdownData();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownData() {
    this.crudSvc.getDropdownData(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ slaGroups, types, kpis, status, slaPriorities }) => {
      if (slaGroups) {
        this.slaGroups = _clone(slaGroups);
      } else {
        this.slaGroups = [];
        this.notification.error(new Notification("Error while fetching sla groups list"));
      }

      if (types) {
        this.requestTypesList = _clone(types);
      } else {
        this.requestTypesList = [];
        this.notification.error(new Notification("Error while fetching issue types"));
      }

      if (kpis) {
        this.responseSlaKpiList = _clone(kpis);
        this.resolutionSlaKpiList = _clone(kpis);
      } else {
        this.responseSlaKpiList = [];
        this.resolutionSlaKpiList = [];
        this.notification.error(new Notification("Error while fetching kpis list"));
      }

      if (status) {
        this.responseSuccessConditionList = _clone(status);
        this.resolutionSuccessConditionList = _clone(status);
      } else {
        this.responseSuccessConditionList = [];
        this.resolutionSuccessConditionList = [];
        this.notification.error(new Notification("Error while fetching status list"));
      }

      if (slaPriorities) {
        this.slaPriorities = _clone(slaPriorities);
        // this.initialSlaPriorities = _clone(slaPriorities);
      } else {
        this.slaPriorities = [];
        // this.initialSlaPriorities = [];
        this.notification.error(new Notification("Error while fetching priorities list"));
      }

      this.buildForm();
    });
  }

  buildForm() {
    let obj = this.itemId ? { itemId: this.itemId, instanceId: this.user.crmInstanceId } : null;
    this.crudSvc.createForm(obj, this.responseSlaKpiList, this.resolutionSlaKpiList, this.responseSuccessConditionList).pipe(take(1)).subscribe(res => {
      this.form = res;
      if (this.groupId) {
        let grp = this.slaGroups.find(grp => grp.uuid == this.groupId);
        if (grp) {
          this.form.get('sla_group').setValue(grp.id);
          this.form.get('sla_group').disable();
          this.getCrmContacts(grp.tenants);
        }
      }
      if (this.groupSLAId) {
        let grp = this.slaGroups.find(grp => grp.sla_id == this.groupSLAId);
        if (grp) {
          this.form.get('sla_group').setValue(grp.id);
          this.form.get('sla_group').disable();
          this.getCrmContacts(grp.tenants);
        }
      }
      if (this.itemId && !this.groupSLAId && !this.groupId) {
        let grpId = this.form.get('sla_group').value;
        let grp = this.slaGroups.find(grp => grp.id == grpId);
        if (grp) {
          this.form.get('sla_group').setValue(grp.id);
          this.form.get('sla_group').disable();
          this.getCrmContacts(grp.tenants);
        }
      }
      this.formErrors = this.crudSvc.resetFormErrors();
      this.formValidationMessages = this.crudSvc.validationMessages;
      this.subscribeToForm();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while creating form'));
      this.spinner.stop('main');
    });
  }

  subscribeToForm() {
    this.form.get('sla_group').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        let grp = this.slaGroups.find(grp => grp.id == val);
        if (grp) {
          this.getCrmContacts(grp.tenants);
        } else {
          this.userList = [];
        }
      }
    })

    // this.form.get('request_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
    //   if (val == 'incident') {
    //     this.slaPriorities = this.initialSlaPriorities;
    //   } else {
    //     this.slaPriorities = [this.initialSlaPriorities.find((priority) => priority.display_name = 'Low')];
    //   }
    // })
  }

  getCrmContacts(tenants?: string[]) {
    this.userList = [];
    this.crudSvc.getCrmContacts(this.user.crmInstanceId, tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userList = res;
      if (this.action == 'Edit') {
        this.setResponseAndResolutionEmails();
      }
    }, (err: HttpErrorResponse) => {
      this.userList = [];
      if (this.action == 'Edit') {
        this.setResponseAndResolutionEmails();
      }
    })
  }

  setResponseAndResolutionEmails() {
    let existingUser = this.form.get('response_emails').value;
    this.selectedResponseUsers = this.userList.filter(user => {
      return existingUser.indexOf(user.contact_email) >= 0;
    });
    this.form.get('response_emails').setValue('');
    this.setResponseUserFieldValidation();

    existingUser = this.form.get('resolution_emails').value;
    this.selectedResolutionUsers = this.userList.filter(user => {
      return existingUser.indexOf(user.contact_email) >= 0;
    });
    this.form.get('resolution_emails').setValue('');
    this.setResolutionUserFieldValidation();
  }

  //Response users
  setResponseUserFieldValidation() {
    if (this.selectedResponseUsers.length) {
      this.form.get('response_emails').setValidators([]);
    } else {
      // this.form.get('response_emails').setValidators([Validators.required]);
    }
    this.form.get('response_emails').updateValueAndValidity();
  }

  typeaheadOnSelectResponseUser(e: TypeaheadMatch): void {
    this.form.get('response_emails').setValue('');
    if (this.selectedResponseUsers.filter(user => user == e.item.email).length) {
      return;
    }
    this.selectedResponseUsers.push(e.item);
    this.setResponseUserFieldValidation();
  }

  typeaheadNoResults(event: boolean): void {
    this.noUsers = event;
  }

  manageSelectedResponseUsers(index: number) {
    this.selectedResponseUsers.splice(index, 1);
    this.setResponseUserFieldValidation();
  }

  //Resolition users
  setResolutionUserFieldValidation() {
    if (this.selectedResolutionUsers.length) {
      this.form.get('resolution_emails').setValidators([]);
    } else {
      // this.form.get('resolution_emails').setValidators([Validators.required]);
    }
    this.form.get('resolution_emails').updateValueAndValidity();
  }

  typeaheadOnSelectResolutionUser(e: TypeaheadMatch): void {
    this.form.get('resolution_emails').setValue('');
    if (this.selectedResolutionUsers.filter(user => user == e.item.email).length) {
      return;
    }
    this.selectedResolutionUsers.push(e.item);
    this.setResolutionUserFieldValidation();
  }

  manageSelectedResolutionUsers(index: number) {
    this.selectedResolutionUsers.splice(index, 1);
    this.setResolutionUserFieldValidation();
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      let obj = <MtpAdministrationSlaItemType>Object.assign({}, this.form.getRawValue());
      obj.response_emails = this.selectedResponseUsers.map(u => u.contact_email);
      obj.resolution_emails = this.selectedResolutionUsers.map(u => u.contact_email);
      this.spinner.start('main');
      if (this.itemId) {
        this.crudSvc.updateItem(this.user.crmInstanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('SLA Item updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createItem(this.user.crmInstanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('SLA Item Created successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.groupId) {
      this.router.navigate(['group'], { relativeTo: this.route.parent });
    } else if (this.groupSLAId) {
      this.router.navigate(['../'], { queryParams: { groupId: this.groupSLAId }, relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
