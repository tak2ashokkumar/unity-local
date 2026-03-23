import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { AppUtilityService, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from '../multiselect-dropdown/types';
import { UserGroupType } from '../SharedEntityTypes/user-mgmt.type';
import { UnityScheduleService } from './unity-schedule.service';
import { UnityScheduleDataType } from './unity-schedule.servicedata';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'unity-schedule',
  templateUrl: './unity-schedule.component.html',
  styleUrls: ['./unity-schedule.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ]
})
export class UnityScheduleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  scrollStrategy: ScrollStrategy;
  private subscr: Subscription;
  private endDateSubscr: Subscription;
  private monthlyTypeSubscr: Subscription;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  dayOptions: UnityScheduleDataType[] = [];
  weekOptions: UnityScheduleDataType[] = [];
  weekdayOptions: UnityScheduleDataType[] = [];
  monthOptions: UnityScheduleDataType[] = [];

  daySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };

  dayTexts: IMultiSelectTexts = {
    checkAll: 'Every Day',
    uncheckAll: 'Uncheck all',
    checked: 'day',
    checkedPlural: 'days',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select',
    allSelected: 'Every Day',
  };

  weekSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };

  weekTexts: IMultiSelectTexts = {
    checkAll: 'Every Week',
    uncheckAll: 'Uncheck all',
    checked: 'week',
    checkedPlural: 'weeks',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select',
    allSelected: 'Every Week',
  };

  weekdaySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };

  weekdayTexts: IMultiSelectTexts = {
    checkAll: 'Every Day',
    uncheckAll: 'Uncheck all',
    checked: 'day',
    checkedPlural: 'days',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select',
    allSelected: 'Every Day',
  };

  monthSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: false,
    appendToBody: true,
  };

  monthTexts: IMultiSelectTexts = {
    checkAll: 'Every Month',
    uncheckAll: 'Uncheck all',
    checked: 'month',
    checkedPlural: 'months',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select',
    allSelected: 'Every Month',
  };

  userGroups: UserGroupType[] = [];
  userList: string[] = [];
  selectedUserList: string[] = [];
  notificationForm: FormGroup;
  notificationFormErrors: any;
  notificationFormValidationMessages: any;

  userGroupsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  userGroupTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Uncheck all',
    checked: 'Group',
    checkedPlural: 'Groups',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select User Groups',
    allSelected: 'All Groups',
  };

  userListSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  userTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Uncheck all',
    checked: 'User',
    checkedPlural: 'Users',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select Users',
    allSelected: 'All Users',
  };

  constructor(private scheduleSvc: UnityScheduleService,
    private router: Router,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private readonly sso: ScrollStrategyOptions) {
    this.dayOptions = this.scheduleSvc.getDayOptions();
    this.weekOptions = this.scheduleSvc.getWeekOptions();
    this.weekdayOptions = this.scheduleSvc.getWeekdayOptions();
    this.monthOptions = this.scheduleSvc.getMonthOptions();
    this.scheduleSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.scheduleSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    const url: string = this.router.url;
    const isNotificationFormRequired: boolean = url.includes('vmware-vcenter') || url.includes('unity-vcenter') || url.includes('device-groups');
    if (isNotificationFormRequired) {
      this.getDropdownData();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
    if (this.endDateSubscr && !this.endDateSubscr.closed) {
      this.endDateSubscr.unsubscribe();
    }
    if (this.monthlyTypeSubscr && !this.monthlyTypeSubscr.closed) {
      this.monthlyTypeSubscr.unsubscribe();
    }
  }

  getDropdownData() {
    this.spinner.start('main');
    this.userGroups = [];
    this.userList = [];
    this.scheduleSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ userGroups, userList }) => {
      if (userGroups) {
        this.userGroups = _clone(userGroups);
      } else {
        this.userGroups = [];
        this.notification.error(new Notification("Error while fetching User Groups"));
      }

      if (userList) {
        this.userList = _clone(userList);
      } else {
        this.userList = [];
        this.notification.error(new Notification("Error while fetching User List"));
      }
      this.buildForm();
      this.buildNotificationForm();
      this.spinner.stop('main');
    });
  }

  buildForm() {
    this.form = this.scheduleSvc.form;
    this.formErrors = this.scheduleSvc.resetFormErrors();
    this.formValidationMessages = this.scheduleSvc.formValidationMessages;
    this.subscribeToStartDateEndDatepart();
    this.subscribeToMonthlyPart();
    this.form.get('schedule_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (this.subscr && !this.subscr.closed) {
        this.subscr.unsubscribe();
      }
      this.scheduleSvc.handleFormFieldsByScheduleType(this.form.getRawValue());
      this.form = this.scheduleSvc.form;
      this.formErrors = this.scheduleSvc.resetFormErrors();
      this.subscribeToStartDateEndDatepart();
      this.subscribeToMonthlyPart();
    })
  }

  subscribeToStartDateEndDatepart() {
    if (this.form.controls.end_date_status) {
      this.endDateSubscr = this.form.get('end_date_status').valueChanges.subscribe(val => {
        if (val == 'never') {
          this.form.get('end_date').patchValue('');
          this.form.get('end_date').clearValidators();
          this.form.get('end_date').disable();
        } else {
          this.form.get('end_date').enable();
          this.form.get('end_date').setValidators([Validators.required, NoWhitespaceValidator]);
        }
        this.form.get('end_date').updateValueAndValidity();
      });
    } else {
      if (this.endDateSubscr && !this.endDateSubscr.closed) {
        this.endDateSubscr.unsubscribe();
      }
    }
  }

  subscribeToMonthlyPart() {
    let group = <FormGroup>this.form.get('monthly');
    if (group && group.get('monthly_type')) {
      this.monthlyTypeSubscr = group.get('monthly_type').valueChanges.subscribe(val => {
        if (val == 'by_week_days') {
          this.switchMonthlySchduleByWeekdays(group);
        } else {
          this.switchMonthlySchduleByDays(group);
        }
      });
    } else {
      if (this.monthlyTypeSubscr && !this.monthlyTypeSubscr.closed) {
        this.monthlyTypeSubscr.unsubscribe();
      }
    }
  }

  switchMonthlySchduleByWeekdays(group: FormGroup) {
    group.get('weeks').setValue(['first']);
    group.get('week_days').setValue(['sun']);
    group.get('every_months').setValue(this.scheduleSvc.getEveryMonthValues());

    group.get('days').setValue([]);
    group.get('months').setValue([]);

    group.get('weeks').enable();
    group.get('week_days').enable();
    group.get('every_months').enable();
    group.get('at').enable();
    group.get('days').disable();
    group.get('months').disable();

    group.get('weeks').setValidators([Validators.required]);
    group.get('week_days').setValidators([Validators.required]);;
    group.get('every_months').setValidators([Validators.required]);;
    group.get('at').setValidators([Validators.required, NoWhitespaceValidator]);
    group.get('days').clearValidators();
    group.get('months').clearValidators();
  }

  switchMonthlySchduleByDays(group: FormGroup) {
    group.get('days').setValue(['1']);
    group.get('months').setValue(this.scheduleSvc.getEveryMonthValues());

    group.get('weeks').setValue([]);
    group.get('week_days').setValue([]);
    group.get('every_months').setValue([]);
    group.get('at').setValue('');

    group.get('days').enable();
    group.get('months').enable();
    group.get('weeks').disable();
    group.get('week_days').disable();
    group.get('every_months').disable();
    group.get('at').disable();

    group.get('days').setValidators([Validators.required]);
    group.get('months').setValidators([Validators.required]);;
    group.get('weeks').clearValidators();
    group.get('week_days').clearValidators();
    group.get('every_months').clearValidators();
    group.get('at').clearValidators();
  }

  buildNotificationForm() {
    this.notificationForm = this.scheduleSvc.notificationForm;
    this.notificationFormErrors = this.scheduleSvc.resetFormErrors();
    this.notificationFormValidationMessages = this.scheduleSvc.formValidationMessages;
  }

  handleError(err: any) {
    this.formErrors = this.scheduleSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  submit() {
    this.scheduleSvc.updateForm(this.form);
    this.scheduleSvc.updateNotificationForm(this.notificationForm);
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.subscr = this.form.valueChanges.subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.formErrors = this.scheduleSvc.resetFormErrors();
      this.scheduleSvc.updateForm(this.form);
      this.scheduleSvc.updateNotificationForm(this.notificationForm);
    }
  }

}
