import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { UnitySupportScheduledMaintenanceCrudService, UserAndGroupViewData, deviceTypes, queryBuilderClassNames, queryBuilderConfig } from './unity-support-scheduled-maintenance-crud.service';
import { DatacenterFast, DeviceDataType, MaintenanceType, PrivateCloudFast, TenantUserGroupType, TiggerDataType, UserType } from './unity-support-scheduled-maintenance-crud.type';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { QueryBuilderClassNames, QueryBuilderConfig, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { AppLevelService } from 'src/app/app-level.service';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { cloneDeep as _clone } from 'lodash-es';
import { AimlRulesService } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.service';
import { UnityScheduleDailyType, UnityScheduleMonthlyType, UnityScheduleType, UnityScheduleWeeklyType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import moment from 'moment';
import { UnityScheduleDataType } from 'src/app/shared/unity-schedule/unity-schedule.servicedata';


@Component({
  selector: 'unity-support-scheduled-maintenance-crud',
  templateUrl: './unity-support-scheduled-maintenance-crud.component.html',
  styleUrls: ['./unity-support-scheduled-maintenance-crud.component.scss'],
  providers: [UnitySupportScheduledMaintenanceCrudService, AimlRulesService],
})
export class UnitySupportScheduledMaintenanceCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  scrollStrategy: ScrollStrategy;

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

  devicesListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    // keyToSelect: "name",
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };


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

  weekdayOptions: UnityScheduleDataType[] = [];
  monthOptions: UnityScheduleDataType[] = [];
  dayOptions: UnityScheduleDataType[] = [];
  weekOptions: UnityScheduleDataType[] = [];

  devicesList: DeviceDataType[][] = [];
  triggerList: TiggerDataType[][] = [];

  currentRuleSetValue: RuleSet;
  sources: AIMLSourceData[] = [];
  eventTypes: string[] = [];
  eventCategories: string[] = [];
  tagsAutocompleteItems: string[] = [];

  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

  public allowRuleset: boolean = true;
  public allowCollapse: boolean = false;
  public persistValueOnFieldChange: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudService: UnitySupportScheduledMaintenanceCrudService,
    private builder: FormBuilder,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private appService: AppLevelService,
    private ruleSvc: AimlRulesService,
    private readonly sso: ScrollStrategyOptions) {
    this.route.paramMap.subscribe(params => this.smId = params.get('smId'));
    this.weekdayOptions = this.crudService.getWeekdayOptions();
    this.monthOptions = this.crudService.getMonthOptions();
    this.dayOptions = this.crudService.getDayOptions();
    this.weekOptions = this.crudService.getWeekOptions();


    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.timeZoneList = this.utilService.getTimezones();

    this.getDropdownFields();
    this.getTags();

    if (this.smId) {
      this.getMaintenance();
      this.actionMessage = 'Edit';
    } else {
      this.loadAccessories();
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

  loadAccessories() {
    this.getUserDropdownData();
    this.getDatacenters();
    this.getPrivateClouds();
  }

  getDatacenters() {
    this.datacenterList = [];
    this.crudService.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterList = res;
      if (this.infrastructures) {
        for (let index = 0; index < this.infrastructures.length; index++) {
          if (this.maintenance.infrastructure[index]?.infrastructure_level == 'datacenter') {
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
    this.crudService.getPrivateClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateCLoudList = res;
      if (this.infrastructures) {
        for (let index = 0; index < this.infrastructures.length; index++) {
          if (this.maintenance.infrastructure[index]?.infrastructure_level == 'private cloud') {
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

  getUserDropdownData() {
    this.crudService.getUserDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.userList = res;
        this.userAndGroupList = this.userList.map(user => ({ name: user.email, isSelected: false }));
        this.filteredUserAndGroupList = this.userList.map(user => ({ name: user.email, isSelected: false }));
        if (this.smId) {
          if (this.maintenance.users_and_user_groups) {
            let userAndUserGroups = this.maintenance.users_and_user_groups;
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
        this.userList = [];
        this.notification.error(new Notification('Failed to get users. Try again later.'));
      }
    });
  }

  getDevicesList(formGroup: FormGroup, deviceTypes: string[], index: number) {
    this.crudService.getDevicesList(deviceTypes).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceDataType[]) => {
      if (this.infrastructures) {
        this.devicesList[index] = res;
        if (this.smId) {
          let devices = (<DeviceDataType[]>formGroup.get('device_list').value).map(d => d.uuid)
          formGroup.get('device_list').setValue(this.devicesList[index].filter(d => devices.includes(d.uuid)));
        }
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get devices list!! Try again later.'));
    });
  }

  getTriggersList(formGroup: FormGroup, devices: DeviceDataType[], index: number) {
    this.crudService.getTriggersList(devices).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: TiggerDataType[]) => {
      if (this.infrastructures) {
        this.triggerList[index] = res;
        if (this.smId) {
          let trigger = (<TiggerDataType[]>formGroup.get('triggers').value).map(d => d.trigger_id)
          formGroup.get('triggers').setValue(this.triggerList[index].filter(t => trigger.includes(t.trigger_id)));
        }
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get triggers list!! Try again later.'));
    });
  }

  getMaintenance() {
    this.crudService.getMaintenanceData(this.smId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.maintenance = data;
      this.loadAccessories();
      this.buildForm(data);
      this.editActionFlow();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    });
  }

  get infrastructures(): FormArray {
    return this.form.get('infrastructure') as FormArray;
  }

  editActionFlow() {
    if (!this.maintenance.has_alerts) {
      this.form.removeControl('has_notification');
      this.form.removeControl('has_auto_ticketing');
      this.form.removeControl('correlate_all_alerts');
    }
  }


  getDropdownFields() {
    this.ruleSvc.getDropdownFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        console.log(res, 'res')
        this.queryBuilderConfig = this.crudService.convert(res);
        console.log(this.queryBuilderConfig, 'qbc')
      }
      this.spinner.stop('main');
    })
  }

  setEventSources(config: any) {
    let sources = [];
    if (this.sources.length) {
      for (var i = 0; i < this.sources.length; i++) {
        let src = this.sources[i].source;
        let obj = { name: src.name, value: src.id };
        sources.push(obj);
      }
      config.fields['Event Source'].options = sources;
      config.fields['Event Source'].defaultValue = sources[0].value;
    } else {
      config.fields['Event Source'].options = [];
      config.fields['Event Source'].defaultValue = null;
    }
  }


  buildForm(data: MaintenanceType) {
    this.form = this.crudService.buildForm(data);
    this.formErrors = this.crudService.resetFormErrors();

    this.validationMessages = this.crudService.validationMessages;
    console.log(this.validationMessages);
    if (data) {
      if (!data.users_and_user_groups) {
        this.form.removeControl('users_and_user_groups');
        this.form.removeControl('additional_emails');
      }
    }
    this.manageForm();
  }

  manageForm() {

    this.manageBasics();
    this.manageFilterSubscription();
    this.manageNotification();
    this.manageSchedule();
  }

  manageBasics() {
    if (this.smId == '') {
      this.form.get('users_and_user_groups').setValue('');
      this.selectedUserAndGroups = [];

      this.getDropdownFields();
      this.getDatacenters();
      this.getPrivateClouds();
    }
  }


  manageFilterSubscription() {
    const ctrl = this.form.get('filter_rule_meta');
    if (!ctrl) return;

    // seed once
    const val = ctrl.value;
    if (val) {
      this.form.get('description')
        .setValue(this.crudService.basicRulesetToSQL(val));
    }

    ctrl.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(val => {
        this.form.get('description')
          .setValue(this.crudService.basicRulesetToSQL(val));
      });
  }

  addControls(formGroup: FormGroup, controlName: string, value: any = []) {
    const control = formGroup.get(controlName);
    if (!control) {
      formGroup.addControl(controlName, new FormControl(value));
    } else {
      control.setValue(value);
    }
  };



  enableFilter() {
    this.form.get('filter_enabled').setValue(true);
  }

  disableFilter() {
    this.form.get('filter_enabled').setValue(false);
  }


  onDeviceTypeClose(index: number) {
    const type = this.infrastructures.at(index).get('infrastructure_level').value;
    const devices = this.infrastructures.at(index).get('infra_level_types').value;
    const fg = this.infrastructures.at(index) as FormGroup;
    if (type == 'devices') {
      this.getDevicesList(fg, devices, index);
      this.addControls(fg, 'device_list');
      this.addControls(fg, 'triggers');
    }
    else {
      fg.removeControl('device_list');
      fg.removeControl('triggers');
    }
  }

  onDevicesSelectionClose(index: number) {
    const devices = this.infrastructures.at(index).get('device_list').value;
    const fg = this.infrastructures.at(index) as FormGroup;
    this.getTriggersList(fg, devices, index);
  }


  manageNotification() {
    this.form.get('send_notification').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!val) {
        this.form.get('notify_after_window').setValue(false);
        this.form.get('notify_before_window').setValue(false);
        this.form.removeControl('users_and_user_groups');
        this.form.removeControl('additional_emails');
      } else {
        this.form.addControl('users_and_user_groups', new FormControl('', [Validators.required]));
        this.form.addControl('additional_emails', new FormControl(''));
      }
    });
  }

  manageSchedule() {
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (!meta) return;
    if (this.smId) {
      this.handleFormFieldsByScheduleType(this.maintenance.schedule_meta);
      this.subscribeToStartDateEndDatepart()
      this.subscribeToMonthlyPart()
    }
    meta.get('schedule_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      console.log('manageSchedule')
      this.handleFormFieldsByScheduleType(meta.getRawValue())
      this.subscribeToStartDateEndDatepart()
      this.subscribeToMonthlyPart()
    });
  }
  private endDateSubscr: Subscription;

  subscribeToStartDateEndDatepart() {
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (!meta) return;

    if (meta.controls.end_date_status) {
      this.endDateSubscr = meta.get('end_date_status').valueChanges.subscribe(val => {
        if (val == 'never') {
          meta.get('end_date').patchValue('');
          meta.get('end_date').clearValidators();
          meta.get('end_date').disable();
        } else {
          console.log('subscribeToStartDateEndDatepart else')
          meta.get('end_date').enable();
          meta.get('end_date').setValidators([Validators.required, NoWhitespaceValidator]);
        }
        meta.get('end_date').updateValueAndValidity();
      });
    } else {
      if (this.endDateSubscr && !this.endDateSubscr.closed) {
        this.endDateSubscr.unsubscribe();
      }
    }
  }


  handleFormFieldsByScheduleType(obj: any): void {

    console.log(obj)
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (!meta) return;
    const scheduleType = meta.get('schedule_type')?.value;

    const endDateStatusCtrl = meta.get('end_date_status');
    const endDateCtrl = meta.get('end_date');

    /* ---------------- ONETIME ---------------- */
    if (scheduleType === 'onetime') {

      // Control exists but hidden in UI
      endDateStatusCtrl?.setValue('on', { emitEvent: false });
      endDateStatusCtrl?.disable({ emitEvent: false });

      endDateCtrl?.enable({ emitEvent: false });

      this.removeDailyFileds();
      this.removeWeeklyFileds();
      this.removeMonthlyFileds();

    } else {

      /* -------------- NON-ONETIME -------------- */
      endDateStatusCtrl?.enable({ emitEvent: false });

      const status = obj.end_date_status ?? 'never';
      endDateStatusCtrl?.setValue(status, { emitEvent: false });

      if (status === 'on') {
        endDateCtrl?.enable({ emitEvent: false });
        endDateCtrl?.setValue(obj.end_date ?? '', { emitEvent: false });
      } else {
        endDateCtrl?.reset('', { emitEvent: false });
        endDateCtrl?.disable({ emitEvent: false });
      }
    }

    this.handleDailyFields(obj);
    this.handleWeeklyFields(obj);
    this.handleMonthlyFields(obj);
  }



  /*
  * Handle Daily fields of the Schedule
  * Adding and deleting of daily fields
  */
  handleDailyFields(obj: any) {
    const scheduleType = obj?.schedule_type;
    if (scheduleType == 'daily') {
      console.log(obj.daily, 'obj.dailty')
      this.addDailyFields(obj.daily);
    } else {
      this.removeDailyFileds();
    }
  }

  addDailyFields(data: any) {
    console.log(data)
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (!meta) return;
    meta.addControl('daily', this.builder.group({}));
    let group = <FormGroup>this.form.get('schedule_meta.daily');
    group.addControl('days_interval', new FormControl(data ? data.days_interval : '1', [Validators.required, NoWhitespaceValidator]));
    group.addControl('at', new FormControl(data ? data.at : '', [Validators.required, NoWhitespaceValidator]));
  }

  removeDailyFileds() {
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (meta?.contains('daily')) {
      meta.removeControl('daily');
    }
  }

  /*
  * Handle Weekly fields of the Schedule
  * Adding and deleting of weekly fields
  */
  handleWeeklyFields(obj: any) {
    const scheduleType = obj?.schedule_type;
    if (scheduleType == 'weekly') {
      this.addWeeklyFields(obj.weekly);
      console.log('addeeklyFields')

    } else {
      this.removeWeeklyFileds();
    }
  }

  addWeeklyFields(data: any) {
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (!meta) return;
    meta.addControl('weekly', this.builder.group({}));
    let group = <FormGroup>this.form.get('schedule_meta.weekly');
    group.addControl('week_days', new FormControl(data ? data.week_days : [], [Validators.required]));
    group.addControl('at', new FormControl(data?.at ? data.at : '', [Validators.required, NoWhitespaceValidator]));
  }


  removeWeeklyFileds() {
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (meta?.contains('weekly')) {
      meta.removeControl('weekly');
    }
    // this.form.get('schedule_meta.weekly') ? this.form.removeControl('schedule_meta.weekly') : null;
  }

  /*
  * Handle Monthly fields of the Schedule
  * Adding and deleting of monthly fields
  */
  handleMonthlyFields(obj: any) {
    const scheduleType = obj?.schedule_type;
    if (scheduleType == 'monthly') {
      this.addMonthlyFields(obj.monthly);
      console.log('addMonthlyFields')
    } else {
      this.removeMonthlyFileds();
    }
  }

  addMonthlyFields(data: any) {
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (!meta) return;
    meta.addControl('monthly', this.builder.group({}));
    let group = <FormGroup>this.form.get('schedule_meta.monthly');
    group.addControl('monthly_type', new FormControl(data ? data.monthly_type : 'by_week_days', [Validators.required]));
    if (data && data.monthly_type == 'by_days') {
      group.addControl('days', new FormControl(data ? data.days : ['1'], [Validators.required]));
      group.addControl('months', new FormControl(data ? data.months : this.crudService.getEveryMonthValues(), [Validators.required]));
      group.addControl('weeks', new FormControl({ value: [], disabled: true }));
      group.addControl('week_days', new FormControl({ value: [], disabled: true }));
      group.addControl('every_months', new FormControl({ value: [], disabled: true }));
      group.addControl('at', new FormControl({ value: '', disabled: true }));
    } else {
      group.addControl('weeks', new FormControl(data ? data.weeks : ['first'], [Validators.required]));
      group.addControl('week_days', new FormControl(data ? data.week_days : ['sun'], [Validators.required]));
      group.addControl('every_months', new FormControl(data ? data.every_months : this.crudService.getEveryMonthValues(), [Validators.required]));
      group.addControl('at', new FormControl(data ? data.at : '', [Validators.required, NoWhitespaceValidator]));
      group.addControl('days', new FormControl({ value: [], disabled: true }));
      group.addControl('months', new FormControl({ value: [], disabled: true }));
    }
  }

  removeMonthlyFileds() {
    const meta = this.form.get('schedule_meta') as FormGroup;
    if (meta?.contains('monthly')) {
      meta.removeControl('monthly');
    }
  }

  private monthlyTypeSubscr: Subscription;


  subscribeToMonthlyPart() {
    const meta = this.form.get('schedule_meta') as FormGroup;
    let group = <FormGroup>meta.get('monthly');
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
    group.get('every_months').setValue(this.crudService.getEveryMonthValues());

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
    group.get('months').setValue(this.crudService.getEveryMonthValues());

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
    this.form.get('users_and_user_groups').setValue(this.selectedUserAndGroups.map(t => t.name));
  }

  unSelectUserAndUserGroup(i: number) {
    let userIndex = this.filteredUserAndGroupList.findIndex(user => user.name == this.selectedUserAndGroups[i].name);
    if (userIndex != -1) {
      this.filteredUserAndGroupList[userIndex].isSelected = false;
    }
    this.selectedUserAndGroups.splice(i, 1);
    this.form.get('users_and_user_groups').setValue(this.selectedUserAndGroups.map(a => a.name));
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

  // addInfrastructure(index: number) {
  //   let formGroup = <FormGroup>this.infrastructures.at(index);
  //   if (formGroup.invalid) {
  //     this.formErrors.infrastructure[index] = this.utilService.validateForm(formGroup, this.validationMessages.infrastructure, this.formErrors.infrastructure[index]);
  //     formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
  //       .subscribe((data: any) => {
  //         this.formErrors.infrastructure[index] = this.utilService.validateForm(formGroup, this.validationMessages.infrastructure, this.formErrors.infrastructure[index]);
  //       });
  //   }
  //   else {
  //     const mg = this.builder.group({
  //       'infrastructure_level': ['', [Validators.required]],
  //     });
  //     this.manageInfrastructureFormArray(mg);
  //     this.formErrors.infrastructure.push(this.crudService.resetInfrastructureErrors());
  //     this.infrastructures.push(mg);
  //     this.infraList.push([]);
  //     this.excludeList.push([]);
  //   }
  // }

  // removeInfrastructure(index: number) {
  //   this.infrastructures.removeAt(index);
  //   this.formErrors.infrastructure.splice(index, 1);
  //   this.infraList.splice(index, 1);
  //   this.excludeList.splice(index, 1);
  // }

  //For filters
  // getDropdownData() {
  //   this.sources = [];
  //   this.eventTypes = [];
  //   this.eventCategories = [];
  //   let config = queryBuilderConfig;
  //   this.ruleSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe(({ sources, eventTypes, eventCategories }) => {
  //       if (sources) {
  //         this.sources = _clone(sources);
  //       } else {
  //         this.sources = [];
  //         this.notification.error(new Notification("Error while fetching event sources"));
  //       }
  //       this.setEventSources(config);

  //       if (eventTypes) {
  //         this.eventTypes = _clone(eventTypes);
  //       } else {
  //         this.eventTypes = [];
  //         this.notification.error(new Notification("Error while fetching event types"));
  //       }
  //       this.setEventTypes(config);

  //       if (eventCategories) {
  //         this.eventCategories = _clone(eventCategories);
  //       } else {
  //         this.eventCategories = [];
  //         this.notification.error(new Notification("Error while fetching event categories"));
  //       }
  //       this.setEventCategories(config);
  //       this.queryBuilderConfig = config;
  //       // setTimeout(() => {
  //       //   this.buildForm(this.maintenance);
  //       //   this.spinner.stop('main');
  //       // }, 100);
  //     });
  // }


  setEventTypes(config: any) {
    let types = [];
    if (this.eventTypes.length) {
      for (var i = 0; i < this.eventTypes.length; i++) {
        let type = this.eventTypes[i];
        let obj = { name: type, value: type };
        types.push(obj);
      }
      config.fields['Event Type'].options = types;
      config.fields['Event Type'].defaultValue = types[0].value;
    } else {
      config.fields['Event Type'].options = [];
      config.fields['Event Type'].defaultValue = null;
    }
  }


  setEventCategories(config: any) {
    let categories = [];
    if (this.eventCategories.length) {
      for (var i = 0; i < this.eventCategories.length; i++) {
        let category = this.eventCategories[i];
        let obj = { name: category, value: category };
        categories.push(obj);
      }
      config.fields['Event Category'].options = categories;
      config.fields['Event Category'].defaultValue = categories[0].value;
    } else {
      config.fields['Event Category'].options = [];
      config.fields['Event Category'].defaultValue = null;
    }
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  onTagInputChange(newValue: any) {
    this.form.get('description').setValue(this.crudService.basicRulesetToSQL(this.form.get('filter_rule_meta').value));
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
      console.log(this.formErrors)
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((val: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
    } else {
      this.queryBuilder?.submit();
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
        console.log(this.form.getRawValue())
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
