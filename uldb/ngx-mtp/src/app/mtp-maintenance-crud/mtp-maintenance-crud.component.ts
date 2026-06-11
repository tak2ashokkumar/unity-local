import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserType } from '../mtp-administration/mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { AppNotificationService } from '../shared/app-notification/app-notification.service';
import { Notification } from '../shared/app-notification/notification.type';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from '../shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from '../shared/multiselect-dropdown/types';
import { ClientSideSearchPipe } from '../shared/table-functionality/client-side-search.pipe';
import { MtpMaintenanceCrudService, UserAndGroupViewData, deviceTypes } from './mtp-maintenance-crud.service';
import { DatacenterFast, MaintenanceType, PrivateCloudFast, TenantType, TenantUserGroupType } from './mtp-maintenance-crud.type';


@Component({
  selector: 'mtp-maintenance-crud',
  templateUrl: './mtp-maintenance-crud.component.html',
  styleUrls: ['./mtp-maintenance-crud.component.scss'],
  providers: [MtpMaintenanceCrudService]
})
export class MtpMaintenanceCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  infraListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  excludeListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  tenantList: Array<TenantType> = [];
  datacenterList: Array<DatacenterFast> = [];
  privateCLoudList: Array<PrivateCloudFast> = [];
  userList: Array<UserType> = [];
  groupList: Array<TenantUserGroupType> = [];
  userAndGroupList: Array<UserAndGroupViewData> = [];
  filteredUserAndGroupList: Array<UserAndGroupViewData> = [];
  selectedUserAndGroups: Array<UserAndGroupViewData> = [];
  timeZoneList: string[] = [];
  infraList: any[][] = [];
  excludeList: any[][] = [];
  tenantUUID: string = '';
  tenantId: number = null;
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  deviceTypes = deviceTypes;
  nonFieldErr: string = '';
  smId: string = '';
  searchValue: string = '';
  fieldsToFilterOn: string[] = ['name'];
  actionMessage: 'Create' | 'Edit';
  maintenance: MaintenanceType;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudService: MtpMaintenanceCrudService,
    private builder: FormBuilder,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.route.paramMap.subscribe(params => this.smId = params.get('smId'));
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.timeZoneList = this.utilService.getTimezones();
    if (this.smId) {
      this.getMaintenance();
      this.actionMessage = 'Edit';
    } else {
      this.getTenants();
      this.buildForm(null);
      this.actionMessage = 'Create';
      this.spinner.stop('main');
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.searchValue = event;
    this.filteredUserAndGroupList = this.clientSideSearchPipe.transform(this.userAndGroupList, event, this.fieldsToFilterOn);
  }

  getTenants() {
    this.tenantList = [];
    this.crudService.getTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenantList = res;
      if (this.smId) {
        this.tenantUUID = this.tenantList.find(tenant => tenant.id == this.tenantId).uuid;
        this.getDropdownData();
        this.getDatacenters();
        this.getPrivateClouds();
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get teants!! Try again later.'));
    });
  }

  getDatacenters() {
    this.datacenterList = [];
    this.crudService.getDataCenters(this.tenantUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterList = res;
      if (this.infrastructures) {
        for (let index = 0; index < this.infrastructures.length; index++) {
          if (this.maintenance.infrastructure[index].infrastructure_level == 'datacenter') {
            this.infraList[index] = this.datacenterList;
            this.excludeList[index] = this.datacenterList;
          }
        }
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get datacenters!! Try again later.'));
    });
  }

  getPrivateClouds() {
    this.privateCLoudList = [];
    this.crudService.getPrivateClouds(this.tenantUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateCLoudList = res;
      if (this.infrastructures) {
        for (let index = 0; index < this.infrastructures.length; index++) {
          if (this.maintenance.infrastructure[index].infrastructure_level == 'private cloud') {
            this.infraList[index] = this.privateCLoudList;
            this.excludeList[index] = this.privateCLoudList;
          }
        }
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get private clouds!! Try again later.'));
    });
  }

  getDropdownData() {
    this.crudService.getDropdownData(this.tenantUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.users) {
        this.userList = res.users;
        this.userAndGroupList = this.userList.map(user => ({ name: user.email, isSelected: false }));
        this.filteredUserAndGroupList = this.userList.map(user => ({ name: user.email, isSelected: false }));
      } else {
        this.userList = [];
        this.notification.error(new Notification('Failed to get users. Try again later.'));
      }
      if (res.groups) {
        this.groupList = res.groups;
        this.userAndGroupList = this.userAndGroupList.concat(this.groupList.map(group => ({ name: group.name, isSelected: false })));
        this.filteredUserAndGroupList = this.userAndGroupList.concat(this.groupList.map(group => ({ name: group.name, isSelected: false })));
        if (this.smId) {
          if (this.form.get('user_and_user_group')) {
            let userAndUserGroups = <string[]>this.form.get('user_and_user_group').value;
            if (userAndUserGroups.length) {
              userAndUserGroups.forEach(user => {
                let obj = this.filteredUserAndGroupList.find(a => a.name == user);
                obj.isSelected = true;
                if (obj) {
                  this.selectedUserAndGroups.push(obj);
                }
              });
            }
          }
        }
      } else {
        this.groupList = [];
        this.notification.error(new Notification('Failed to get groups. Try again later.'));
      }
    });
  }

  getMaintenance() {
    this.crudService.getMaintenanceData(this.smId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tenantId = data.tenant;
      this.maintenance = data;
      this.getTenants();
      this.buildForm(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    });
  }

  get infrastructures(): FormArray {
    return this.form.get('infrastructure') as FormArray;
  }

  buildForm(data: MaintenanceType) {
    this.form = this.crudService.buildForm(data);
    this.formErrors = this.crudService.resetFormErrors();
    if (this.infrastructures) {
      for (let index = 0; index < this.infrastructures.length; index++) {
        this.formErrors.infrastructure.push(this.crudService.resetInfrastructureErrors());
        this.manageInfrastructure(this.infrastructures.at(index) as FormGroup);
        this.infraList.push([]);
        this.excludeList.push([]);
        if (this.maintenance.infrastructure[index].infrastructure_level == 'devices') {
          this.infraList[index] = this.deviceTypes;
          this.excludeList[index] = this.deviceTypes;
        }
      }
    }
    this.validationMessages = this.crudService.validationMessages;
    if (data) {
      if (!data.send_notification) {
        this.form.removeControl('user_and_user_group');
        this.form.removeControl('additional_email');
      }
      if (data.infrastructure_type == 'All') {
        this.form.removeControl('infrastructure');
      }
    }
    this.manageForm();
  }

  manageForm() {
    const mg = this.builder.group({
      'infrastructure_level': ['', [Validators.required]],
    });
    this.manageBasics();
    this.manageInfrastructure(mg);
    this.manageActions();
    this.manageNotification();
    this.manageSchedule();
  }

  manageBasics() {
    this.form.get('tenant').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.form.get('infrastructure_type').setValue('');
      this.form.get('user_and_user_group').setValue('');
      this.selectedUserAndGroups = [];
      this.formErrors.infrastructure = [];
      this.form.removeControl('infrastructure');
      this.infraList = [];
      this.excludeList = [];
      this.tenantUUID = this.tenantList.find(tenant => tenant.id == val).uuid;
      this.getDropdownData();
      this.getDatacenters();
      this.getPrivateClouds();
    });
  }

  manageInfrastructure(formGroup: FormGroup) {
    this.form.get('infrastructure_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'All') {
        this.formErrors.infrastructure = [];
        this.form.removeControl('infrastructure');
        this.infraList = [];
        this.excludeList = [];
      } else {
        this.formErrors.infrastructure = [];
        this.formErrors.infrastructure.push(this.crudService.resetInfrastructureErrors());
        this.form.addControl('infrastructure', this.builder.array([formGroup]));
        this.infrastructures.at(0).get('infrastructure_level').setValue('');
        this.infraList.push([]);
        this.excludeList.push([]);
      }
    });
    this.manageInfrastructureFormArray(formGroup);
  }

  manageInfrastructureFormArray(formGroup: FormGroup) {
    formGroup.get('infrastructure_level').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!formGroup.get('infra_level_types') && !formGroup.get('exclude')) {
        formGroup.addControl('infra_level_types', new FormControl([], [Validators.required]));
        formGroup.addControl('exclude', new FormControl([]));
      }
      const index = this.infrastructures.controls.findIndex(fg => fg == formGroup);
      if (val == 'datacenter') {
        formGroup.get('infra_level_types').setValue([]);
        formGroup.get('exclude').setValue([]);
        this.infraList[index] = this.datacenterList;
        this.excludeList[index] = this.datacenterList;
      } else if (val == 'private cloud') {
        formGroup.get('infra_level_types').setValue([]);
        formGroup.get('exclude').setValue([]);
        this.infraList[index] = this.privateCLoudList;
        this.excludeList[index] = this.privateCLoudList;
      } else {
        formGroup.get('infra_level_types').setValue([]);
        formGroup.get('exclude').setValue([]);
        this.infraList[index] = this.deviceTypes;
        this.excludeList[index] = this.deviceTypes;
      }
    });
  }

  manageActions() {
    this.form.get('has_alerts').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!val) {
        this.form.removeControl('has_notification');
        this.form.removeControl('has_auto_ticketing');
        this.form.removeControl('correlate_all_alerts');
      } else {
        this.form.addControl('has_notification', new FormControl(false));
        this.form.addControl('has_auto_ticketing', new FormControl(false));
        this.form.addControl('correlate_all_alerts', new FormControl(false));
      }
    });
  }

  manageNotification() {
    this.form.get('send_notification').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!val) {
        this.form.get('send_after_window').setValue(false);
        this.form.get('send_before_window').setValue(false);
        this.form.removeControl('user_and_user_group');
        this.form.removeControl('additional_email');
      } else {
        this.form.addControl('user_and_user_group', new FormControl('', [Validators.required]));
        this.form.addControl('additional_email', new FormControl(''));
      }
    });
  }

  manageSchedule() {
    if (this.smId) {
      if (this.form.get('schedule_type').value == 'Recurring') {
        this.form.get('recurrence_start_time_hr').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]);
        this.form.get('recurrence_start_time_min').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]);
        this.form.get('recurrence_start_time_hr').updateValueAndValidity();
        this.form.get('recurrence_start_time_min').updateValueAndValidity();
        if (this.form.get('daily_type').value == 'Every Custom Day') {
          this.form.get('every_day_count').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
          this.form.get('every_day_count').updateValueAndValidity();
        } else if (this.form.get('daily_type').value == 'Every Weekday') {
          this.form.get('every_day_count').setValue(null);
          this.form.get('every_day_count').disable()
        }
        if (this.form.get('monthly_type').value == 'Every Month') {
          this.form.get('every_month_count').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
          this.form.get('every_month_count').updateValueAndValidity();
          this.form.get('every_custom_month_day').setValue('');
          this.form.get('every_custom_month_day').disable();
          this.form.get('every_custom_month_weekday').setValue('');
          this.form.get('every_custom_month_weekday').disable();
        } else if (this.form.get('monthly_type').value == 'Every Custom Month Day') {
          this.form.get('every_custom_month_day').setValidators([Validators.required]);
          this.form.get('every_custom_month_weekday').setValidators([Validators.required]);
          this.form.get('every_custom_month_day').updateValueAndValidity();
          this.form.get('every_custom_month_weekday').updateValueAndValidity();
          this.form.get('every_month_count').setValue(null);
          this.form.get('every_month_count').disable();
        }
        if (this.form.get('ends_never').value) {
          this.form.get('end_date').removeValidators([Validators.required, NoWhitespaceValidator]);
          this.form.get('recurrence_end_time_hr').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]);
          this.form.get('recurrence_end_time_min').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]);
          this.form.get('end_date').updateValueAndValidity();
          this.form.get('recurrence_end_time_hr').updateValueAndValidity();
          this.form.get('recurrence_end_time_min').updateValueAndValidity();
        } else {
          this.form.get('recurrence_end_time_hr').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]);
          this.form.get('recurrence_end_time_min').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]);
          this.form.get('recurrence_end_time_hr').updateValueAndValidity();
          this.form.get('recurrence_end_time_min').updateValueAndValidity();
        }
      }
    }
    this.form.get('schedule_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Recurring') {
        this.form.get('recurrence_pattern').setValue('Daily');
        this.form.get('ends_never').setValidators([Validators.required]);
        this.form.get('ends_never').setValue(null);
        this.form.get('daily_type').setValidators([Validators.required]);
        this.form.get('recurrence_start_time_hr').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]);
        this.form.get('recurrence_start_time_min').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]);
        this.form.get('ends_never').updateValueAndValidity();
        this.form.get('end_date').updateValueAndValidity();
        this.form.get('daily_type').updateValueAndValidity();
        this.form.get('recurrence_start_time_hr').updateValueAndValidity();
        this.form.get('recurrence_start_time_min').updateValueAndValidity();
      } else if (val == 'One-time') {
        this.form.get('ends_never').removeValidators([Validators.required]);
        this.form.get('end_date').setValidators([Validators.required]);
        this.form.get('recurrence_start_time_hr').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.form.get('recurrence_start_time_min').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.form.get('recurrence_end_time_hr').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.form.get('recurrence_end_time_min').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.form.get('daily_type').removeValidators([Validators.required]);
        this.form.get('monthly_type').removeValidators([Validators.required]);
        this.form.get('weekday').removeValidators([Validators.required]);
        this.form.get('every_day_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_month_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_custom_month_day').removeValidators([Validators.required]);
        this.form.get('every_custom_month_weekday').removeValidators([Validators.required]);
        this.form.get('every_day_count').updateValueAndValidity();
        this.form.get('every_month_count').updateValueAndValidity();
        this.form.get('every_custom_month_day').updateValueAndValidity();
        this.form.get('every_custom_month_weekday').updateValueAndValidity();
        this.form.get('ends_never').updateValueAndValidity({ emitEvent: false });
        this.form.get('end_date').updateValueAndValidity();
        this.form.get('recurrence_start_time_hr').updateValueAndValidity();
        this.form.get('recurrence_start_time_min').updateValueAndValidity();
        this.form.get('recurrence_end_time_hr').updateValueAndValidity();
        this.form.get('recurrence_end_time_min').updateValueAndValidity();
        this.form.get('daily_type').updateValueAndValidity({ emitEvent: false });
        this.form.get('monthly_type').updateValueAndValidity({ emitEvent: false });
        this.form.get('weekday').updateValueAndValidity({ emitEvent: false });
      }
    });
    this.form.get('recurrence_pattern').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Daily') {
        this.form.get('daily_type').setValidators([Validators.required]);
        this.form.get('monthly_type').setValue(null);
        this.form.get('weekday').removeValidators([Validators.required]);
        this.form.get('monthly_type').removeValidators([Validators.required]);
        this.form.get('every_month_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_custom_month_day').removeValidators([Validators.required]);
        this.form.get('every_custom_month_weekday').removeValidators([Validators.required]);
        this.form.get('every_month_count').updateValueAndValidity();
        this.form.get('every_custom_month_day').updateValueAndValidity();
        this.form.get('every_custom_month_weekday').updateValueAndValidity();
        this.form.get('daily_type').updateValueAndValidity();
        this.form.get('weekday').updateValueAndValidity();
        this.form.get('monthly_type').updateValueAndValidity();
      } else if (val == 'Weekly') {
        this.form.get('weekday').setValue([]);
        this.form.get('monthly_type').setValue(null);
        this.form.get('daily_type').setValue(null);
        this.form.get('weekday').setValidators([Validators.required]);
        this.form.get('daily_type').removeValidators([Validators.required]);
        this.form.get('monthly_type').removeValidators([Validators.required]);
        this.form.get('every_day_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_month_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_custom_month_day').removeValidators([Validators.required]);
        this.form.get('every_custom_month_weekday').removeValidators([Validators.required]);
        this.form.get('every_day_count').updateValueAndValidity();
        this.form.get('every_month_count').updateValueAndValidity();
        this.form.get('every_custom_month_day').updateValueAndValidity();
        this.form.get('every_custom_month_weekday').updateValueAndValidity();
        this.form.get('weekday').updateValueAndValidity();
        this.form.get('daily_type').updateValueAndValidity();
        this.form.get('monthly_type').updateValueAndValidity();
      } else if (val == 'Monthly') {
        this.form.get('monthly_type').setValidators([Validators.required]);
        this.form.get('daily_type').setValue(null);
        this.form.get('daily_type').removeValidators([Validators.required]);
        this.form.get('weekday').removeValidators([Validators.required]);
        this.form.get('every_day_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_day_count').updateValueAndValidity();
        this.form.get('monthly_type').updateValueAndValidity();
        this.form.get('weekday').updateValueAndValidity();
        this.form.get('daily_type').updateValueAndValidity();
      }
    });
    this.form.get('ends_never').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!val) {
        this.form.get('end_date').setValidators([Validators.required, NoWhitespaceValidator]);
        this.form.get('recurrence_end_time_hr').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]);
        this.form.get('recurrence_end_time_min').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]);
        this.form.get('end_date').updateValueAndValidity();
        this.form.get('recurrence_end_time_hr').updateValueAndValidity();
        this.form.get('recurrence_end_time_min').updateValueAndValidity();
      } else if (val) {
        this.form.get('end_date').removeValidators([Validators.required, NoWhitespaceValidator]);
        this.form.get('recurrence_end_time_hr').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]);
        this.form.get('recurrence_end_time_min').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]);
        this.form.get('end_date').setValue('');
        this.form.get('recurrence_end_time_hr').setValue(null);
        this.form.get('recurrence_end_time_min').setValue(null);
        this.form.get('end_date').updateValueAndValidity();
        this.form.get('recurrence_end_time_hr').updateValueAndValidity();
        this.form.get('recurrence_end_time_min').updateValueAndValidity();
      }
    });
    this.form.get('daily_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Every Weekday') {
        this.form.get('every_day_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_day_count').updateValueAndValidity();
        this.form.get('every_day_count').setValue(null);
        this.form.get('every_day_count').disable()
      } else if (val == 'Every Custom Day') {
        this.form.get('every_day_count').enable()
        this.form.get('every_day_count').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_day_count').updateValueAndValidity();
      }
    });
    this.form.get('monthly_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Every Month') {
        this.form.get('every_month_count').setValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_custom_month_day').removeValidators([Validators.required]);
        this.form.get('every_custom_month_weekday').removeValidators([Validators.required]);
        this.form.get('every_month_count').updateValueAndValidity();
        this.form.get('every_custom_month_day').updateValueAndValidity();
        this.form.get('every_custom_month_weekday').updateValueAndValidity();
        this.form.get('every_month_count').enable();
        this.form.get('every_custom_month_day').setValue('');
        this.form.get('every_custom_month_day').disable();
        this.form.get('every_custom_month_weekday').setValue('');
        this.form.get('every_custom_month_weekday').disable();
      } else if (val == 'Every Custom Month Day') {
        this.form.get('every_custom_month_day').setValidators([Validators.required]);
        this.form.get('every_custom_month_weekday').setValidators([Validators.required]);
        this.form.get('every_month_count').removeValidators([Validators.required, NoWhitespaceValidator, Validators.min(0)]);
        this.form.get('every_custom_month_day').updateValueAndValidity();
        this.form.get('every_custom_month_weekday').updateValueAndValidity();
        this.form.get('every_month_count').updateValueAndValidity()
        this.form.get('every_custom_month_day').enable();
        this.form.get('every_custom_month_weekday').enable();
        this.form.get('every_month_count').setValue(null);
        this.form.get('every_month_count').disable();
      }
    })
  }

  selectUserAndUserGroup(i: number) {
    if (this.filteredUserAndGroupList[i].isSelected) {
      this.filteredUserAndGroupList[i].isSelected = false;
    } else {
      this.filteredUserAndGroupList[i].isSelected = true;
    }
  }

  updateSelectedUserAndUserGroups() {
    this.searchValue = '';
    this.onSearched('');
    this.selectedUserAndGroups = this.filteredUserAndGroupList.filter(user => user.isSelected);
    this.form.get('user_and_user_group').setValue(this.selectedUserAndGroups.map(t => t.name));
  }

  unSelectUserAndUserGroup(i: number) {
    let userIndex = this.filteredUserAndGroupList.findIndex(user => user.name == this.selectedUserAndGroups[i].name);
    if (userIndex != -1) {
      this.filteredUserAndGroupList[userIndex].isSelected = false;
    }
    this.selectedUserAndGroups.splice(i, 1);
    this.form.get('user_and_user_group').setValue(this.selectedUserAndGroups.map(a => a.name));
  }

  onCheckboxChange(weekday: string) {
    const weekdaysArray = this.form.get('weekday').value as string[];
    if (weekdaysArray.includes(weekday)) {
      weekdaysArray.splice(weekdaysArray.indexOf(weekday), 1);
    } else {
      weekdaysArray.push(weekday);
    }
    this.form.get('weekday').setValue(weekdaysArray);
  }

  addInfrastructure(index: number) {
    let formGroup = <FormGroup>this.infrastructures.at(index);
    if (formGroup.invalid) {
      this.formErrors.infrastructure[index] = this.utilService.validateForm(formGroup, this.validationMessages.infrastructure, this.formErrors.infrastructure[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors.infrastructure[index] = this.utilService.validateForm(formGroup, this.validationMessages.infrastructure, this.formErrors.infrastructure[index]);
        });
    }
    else {
      const mg = this.builder.group({
        'infrastructure_level': ['', [Validators.required]],
      });
      this.manageInfrastructureFormArray(mg);
      this.formErrors.infrastructure.push(this.crudService.resetInfrastructureErrors());
      this.infrastructures.push(mg);
      this.infraList.push([]);
      this.excludeList.push([]);
    }
  }

  removeInfrastructure(index: number) {
    this.infrastructures.removeAt(index);
    this.formErrors.infrastructure.splice(index, 1);
    this.infraList.splice(index, 1);
    this.excludeList.splice(index, 1);
  }

  handleError(err: any) {
    this.formErrors = this.crudService.resetFormErrors();
    if (this.infrastructures) {
      for (let index = 0; index < this.infrastructures.length - 1; index++) {
        this.formErrors.infrastructure.push(this.crudService.resetInfrastructureErrors());
      }
    }
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
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((val: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
    } else {
      if (this.smId) {
        this.spinner.start('main');
        this.crudService.updateSchedule(this.form.getRawValue(), this.smId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Schedule maintenance updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.spinner.start('main');
        this.crudService.createSchedule(this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Schedule maintenance created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }

    }
  }

  goBack() {
    if (this.smId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}