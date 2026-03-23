import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
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
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.timeZoneList = this.utilService.getTimezones();

    this.getDropdownData();
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
          if (this.maintenance.user_and_user_group) {
            let userAndUserGroups = this.maintenance.user_and_user_group;
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

  getDevicesList(formGroup: FormGroup, deviceTypes: string[], index:number) {
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

  getTriggersList(formGroup: FormGroup, devices: DeviceDataType[], index:number) {
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

  buildForm(data: MaintenanceType) {
    this.form = this.crudService.buildForm(data);
    this.formErrors = this.crudService.resetFormErrors();
    if (this.infrastructures) {
      for (let index = 0; index < this.infrastructures.length; index++) {
        this.formErrors.infrastructure.push(this.crudService.resetInfrastructureErrors());
        const fg = this.infrastructures.at(index) as FormGroup;
        this.manageInfrastructure(fg);
        this.infraList.push([]);
        this.excludeList.push([]);
        this.devicesList.push([]);
        this.triggerList.push([]);
        if (this.maintenance.infrastructure[index]?.infrastructure_level == 'devices') {
          this.infraList[index] = this.deviceTypes;
          // this.excludeList[index] = this.deviceTypes;
          //For setting device lists for selected devices          
          const infraType = this.infrastructures.at(index).get('infra_level_types').value;
          const selectedDevices = this.infrastructures.at(index).get('device_list').value;
          fg.removeControl('exclude');
          this.getDevicesList(fg, infraType, index);
          this.getTriggersList(fg, selectedDevices, index);
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
        this.form.removeControl('filter_rule_meta');
      }
      if (data.infrastructure_type == 'Custom') {
        this.form.removeControl('filter_rule_meta');
      }
      if (data.infrastructure_type == 'Filter') {
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
    if (this.smId == '') {
      this.form.get('infrastructure_type').setValue('');
      this.form.get('user_and_user_group').setValue('');
      this.selectedUserAndGroups = [];
      this.formErrors.infrastructure = [];
      this.form.removeControl('infrastructure');
      this.form.removeControl('filter_rule_meta');      
      this.infraList = [];
      this.excludeList = [];
      this.devicesList = [];
      this.triggerList = [];
      this.getDropdownData();
      this.getDatacenters();
      this.getPrivateClouds();
    }
  }

  manageInfrastructure(formGroup: FormGroup) {
    this.form.get('infrastructure_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {  
      this.infraList = [];
      this.excludeList = [];
      this.devicesList = [];
      this.triggerList = [];
      this.formErrors.infrastructure = [];
      if (val == 'All') {
        this.form.removeControl('infrastructure');
        this.form.removeControl('filter_rule_meta');        
      } else if(val == 'Custom'){
        this.form.removeControl('filter_rule_meta');
        this.formErrors.infrastructure.push(this.crudService.resetInfrastructureErrors());
        this.form.addControl('infrastructure', this.builder.array([formGroup]));
        this.infrastructures?.at(0).get('infrastructure_level').setValue('');
      } else if(val == 'Filter'){
        this.form.removeControl('infrastructure');
        this.form.addControl('filter_rule_meta', new FormControl(null));
        this.manageFilterSubscription();   
      }
    });
    this.manageInfrastructureFormArray(formGroup);
  }
  
  manageFilterSubscription(){
    this.currentRuleSetValue = this.form.get('filter_rule_meta').value;
    this.form.get('filter_rule_meta')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
      this.currentRuleSetValue = val;
      this.form.get('description').setValue(this.crudService.basicRulesetToSQL(val));
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

  manageInfrastructureFormArray(formGroup: FormGroup) {
    formGroup.get('infrastructure_level').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      const index = this.infrastructures.controls.findIndex(fg => fg === formGroup);
      this.addControls(formGroup,'infra_level_types');
      if (val === 'datacenter' || val === 'private cloud') {
        this.addControls(formGroup, 'exclude');
        this.infraList[index] = val === 'datacenter' ? this.datacenterList : this.privateCLoudList;
        this.excludeList[index] = val === 'datacenter' ? this.datacenterList : this.privateCLoudList;
        return;
      }
      formGroup.removeControl('exclude');
      this.infraList[index] = this.deviceTypes;
    });
  }

  onDeviceTypeClose(index: number){
    const type = this.infrastructures.at(index).get('infrastructure_level').value;
    const devices = this.infrastructures.at(index).get('infra_level_types').value;
    const fg = this.infrastructures.at(index) as FormGroup;
    if(type == 'devices'){
      this.getDevicesList(fg, devices, index);
      this.addControls(fg, 'device_list');
      this.addControls(fg, 'triggers');
    }
    else{
      fg.removeControl('device_list');
      fg.removeControl('triggers');
    }
  }

  onDevicesSelectionClose(index: number){
    const devices = this.infrastructures.at(index).get('device_list').value;
    const fg = this.infrastructures.at(index) as FormGroup;
    this.getTriggersList(fg, devices, index);
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

  //For filters
  getDropdownData() {
    this.sources = [];
    this.eventTypes = [];
    this.eventCategories = [];
    let config = queryBuilderConfig;
    this.ruleSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ sources, eventTypes, eventCategories }) => {
        if (sources) {
          this.sources = _clone(sources);
        } else {
          this.sources = [];
          this.notification.error(new Notification("Error while fetching event sources"));
        }
        this.setEventSources(config);

        if (eventTypes) {
          this.eventTypes = _clone(eventTypes);
        } else {
          this.eventTypes = [];
          this.notification.error(new Notification("Error while fetching event types"));
        }
        this.setEventTypes(config);

        if (eventCategories) {
          this.eventCategories = _clone(eventCategories);
        } else {
          this.eventCategories = [];
          this.notification.error(new Notification("Error while fetching event categories"));
        }
        this.setEventCategories(config);
        this.queryBuilderConfig = config;
        // setTimeout(() => {
        //   this.buildForm(this.maintenance);
        //   this.spinner.stop('main');
        // }, 100);
      });
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
