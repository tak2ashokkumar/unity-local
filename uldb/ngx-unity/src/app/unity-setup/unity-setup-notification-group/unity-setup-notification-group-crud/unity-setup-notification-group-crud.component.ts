import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, EmailValidator, NoWhitespaceValidator, presentInListValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { deviceTypes, queryBuilderClassNames, queryBuilderConfig, typesOptions, UnitySetupNotificationGroupCrudService } from './unity-setup-notification-group-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { QueryBuilderClassNames, QueryBuilderConfig, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { AimlRulesService } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.service';
import { AppLevelService } from 'src/app/app-level.service';
import { cloneDeep as _clone } from 'lodash-es';
import { AlertTypeListDataType, DevicesListDataType, TriggersListDataType, UnitySetupNotificationGroupType } from '../unity-setup-notification-group.service';

@Component({
  selector: 'unity-setup-notification-group-crud',
  templateUrl: './unity-setup-notification-group-crud.component.html',
  styleUrls: ['./unity-setup-notification-group-crud.component.scss'],
  providers: [UnitySetupNotificationGroupCrudService, AimlRulesService]

})
export class UnitySetupNotificationGroupCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  addEdit: 'Add' | 'Edit' = 'Add';
  nonFieldErr: string = '';

  groupId: string;
  currentGroup: UnitySetupNotificationGroupType;

  createFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;

  userList: UnitySetupUser[] = [];
  selectedUsers: UnitySetupUser[] = [];
  noUsers = false;
  selectedActionAll: string;
  enabledCount: number = 0;
  popOverList: string[] = [];

  alertTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'value',
    // disableOptionsOfDifferentTypes: true
  };

  modeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: false,
    checkedStyle: 'none',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    selectAsObject: false,
    keyToSelect: 'value',
    mandatoryLimit: 1,
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true,
  };

  modeOptions = [{
    label: 'Email',
    value: 'email'
  },
  {
    label: 'SMS',
    value: 'sms'
  }, {

    label: 'Microsoft Teams',
    value: 'ms_teams'
  },];

  typeOptions = [
    { label: 'Information', value: 'information' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' }
  ];

  devopsAlertOptions = [
    { label: 'Execution Success', value: 'success' },
    { label: 'Execution Failed', value: 'failed' }
  ];

  moduleOptions = [{
    label: 'AIML',
    value: 'aiml'
  },
  {
    label: 'Deprecation',
    value: 'deprecation'
  }, {
    label: 'Devops Automation',
    value: 'devops_automation'
  },
  ]

  depricationOptions = [
    {
      label: 'End of Support',
      value: 'end_of_support',
      type: 'Life Cycle',
      isDisabled: false
    },
    {
      label: 'End of Life',
      value: 'end_of_life',
      type: 'Life Cycle',
      isDisabled: false
    }
  ];



  // typeOptions: AlertTypeListDataType[] = [];
  hasAlertTypeSelected: boolean = false;
  isLifeCycleRelatedAlertTypeSelected: boolean = false;

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  // for filters
  sources: AIMLSourceData[] = [];
  eventTypes: string[] = [];
  eventCategories: string[] = [];

  tagsAutocompleteItems: string[] = [];
  currentRuleSetValue: RuleSet;

  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

  public allowRuleset: boolean = true;
  public allowCollapse: boolean = false;
  public persistValueOnFieldChange: boolean = false;

  // for custom
  deviceTypes = deviceTypes;
  devicesList: DevicesListDataType[] = [];
  triggerList: TriggersListDataType[] = [];

  devicesTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
    mandatoryLimit: 1
  };

  devicesListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    // keyToSelect: "name",
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
    mandatoryLimit: 1
  };

  usersArr: string[] = [];
  taskListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
    mandatoryLimit: 1
  };

  workflowListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "w_name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
    mandatoryLimit: 1
  };

  // usersArr: string[] = [];
  taskData: any;
  workflowData: any;

  constructor(private notifGrpSvc: UnitySetupNotificationGroupCrudService,
    private ruleSvc: AimlRulesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private builder: FormBuilder) {
    // for edit
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.groupId = params.get('groupId') ? params.get('groupId') : null;
      this.addEdit = this.groupId ? 'Edit' : 'Add';
    });
  }

  ngOnInit(): void {
    this.typeOptions = _clone(typesOptions);
    this.spinner.start('main');
    this.getUserList();
    // this.getDropdownData();
    this.getDropdownFields();
    this.getTags();
    this.nonFieldErr = '';
    this.selectedUsers = [];
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUserList() {
    this.notifGrpSvc.getUserList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userList = res;
      if (this.usersArr.length) {
        this.setUsersList();
      }
    }, err => {
      this.userList = [];
    });
  }

  getDevicesList(deviceTypes: string[]) {
    if (!deviceTypes?.length) return;
    this.notifGrpSvc.getDevicesList(deviceTypes, this.isLifeCycleRelatedAlertTypeSelected).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DevicesListDataType[]) => {
      this.devicesList = res;
      //to bind the Device list dropdown value
      if (this.groupId && this.customFilterFg) {
        let uuids = (<DevicesListDataType[]>this.customFilterFg.get('device_list').value).map(t => t.uuid);
        this.customFilterFg.get('device_list').setValue(this.devicesList.filter(t => uuids.includes(t.uuid)));
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get devices list!! Try again later.'));
    })
  }

  getTriggersList(devices: DevicesListDataType[]) {
    if (!devices?.length || this.isLifeCycleRelatedAlertTypeSelected) return;
    this.notifGrpSvc.getTriggersList(devices).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: TriggersListDataType[]) => {
      this.triggerList = res;
      //to bind the trigger dropdown value
      if (this.groupId && this.customFilterFg) {
        let triggerIds = (<TriggersListDataType[]>this.customFilterFg.get('triggers')?.value)?.map(t => t.trigger_id);
        this.customFilterFg.get('triggers')?.setValue(this.triggerList.filter(t => triggerIds.includes(t.trigger_id)));
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get triggers list!! Try again later.'));
    });
  }

  setUserFieldValidation() {
    if (this.selectedUsers?.length) {
      this.createForm.get('users')?.setValidators([]);
    } else {
      this.createForm.get('users')?.setValidators([Validators.required, EmailValidator]);
    }
    this.createForm.get('users')?.updateValueAndValidity();
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.createForm.get('users').setValue('');
    if (this.selectedUsers?.filter(user => user.email == e.item.email).length) {
      return;
    }
    this.selectedUsers.push(e.item);
    this.setUserFieldValidation();
  }

  typeaheadNoResults(event: boolean): void {
    this.noUsers = event;
    this.createForm.get('users')?.setValidators([EmailValidator, presentInListValidator(this.userList)]);
  }

  manageSelectedUsers(index: number) {
    this.selectedUsers.splice(index, 1);
    this.setUserFieldValidation();
  }

  manageCustomFilterSubscription() {
    this.customFilterFg?.get('device_types')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string[]) => {
      this.getDevicesList(val);
    });
    this.customFilterFg?.get('device_list')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: DevicesListDataType[]) => {
      this.getTriggersList(val);
    });
  }

  manageFormsubscription() {
    this.createForm.get('mode').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val.includes('email') || val.includes('sms')) {
        // if (val ==='email' || val === 'sms') {
        this.createForm.addControl('users', new FormControl('', [Validators.required, EmailValidator]));
        this.createForm.get('users').updateValueAndValidity();
      }
      if (val.includes('ms_teams')) {
        // if (val === 'ms_teams') {
        this.createForm.removeControl('webhook_url');
        if (!this.createForm.get('users')) {
          this.createForm.addControl('users', new FormControl('', [Validators.required, EmailValidator])
          );
        }
      }
      if (val.includes('ms_teams')) {
        this.createForm.removeControl('users');
        this.createForm.addControl('webhook_url', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        this.createForm.get('webhook_url').updateValueAndValidity();
      }
    });

    // this.createForm.get('alert_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string[]) => {
    // if (val.includes('end_of_life') || val.includes('end_of_support')) {
    //   this.createForm.get('notify') ? null : this.createForm.addControl('notify', new FormControl('', [Validators.required, Validators.min(1), Validators.max(999)]));
    //   this.isLifeCycleRelatedAlertTypeSelected = true;
    // } else {
    //   this.createForm.get('notify') ? this.createForm.removeControl('notify') : null;
    //   this.isLifeCycleRelatedAlertTypeSelected = false;
    // }
    // if (val.length) {
    //   this.hasAlertTypeSelected = true;
    // } else {
    //   this.createForm.get('filter_type').setValue('all');
    //   this.hasAlertTypeSelected = false;
    // }
    // })

    this.createForm.get('module').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.createForm.get('filter_type').setValue('all');
      if (val === 'deprecation') {
        this.isLifeCycleRelatedAlertTypeSelected = true;
        this.hasAlertTypeSelected = true;
        this.createForm.get('alert_type')?.setValue([]);
        this.createForm.addControl('notify', new FormControl('', [Validators.required, Validators.min(1), Validators.max(999)]))
      } else if (val === 'aiml') {
        this.isLifeCycleRelatedAlertTypeSelected = false;
        this.hasAlertTypeSelected = true;
        this.createForm.get('alert_type')?.setValue([]);
        this.createForm.removeControl('notify');
      }
    })

    this.aimlFilter();

    this.currentRuleSetValue = this.createForm.get('filter_rule_meta')?.value;
    this.createForm.get('filter_rule_meta')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
      this.currentRuleSetValue = val;
      this.createForm.get('description')?.setValue(this.notifGrpSvc.basicRulesetToSQL(val));
    });

    this.createForm.get('module')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((moduleValue) => {
      this.createForm.get('alert_type')?.setValue([]);
      this.createForm.get('filter_type')?.setValue('all');

      if (moduleValue === 'devops_automation') {
        this.hasAlertTypeSelected = true;
        this.createForm.addControl('alert_type', new FormControl([], [Validators.required]));
        this.createForm.removeControl('notify');
        this.devopsFilter();
      } else {
        this.createForm.addControl('alert_type', new FormControl([], [Validators.required]));
        // this.createForm.removeControl('devops_type');
        this.aimlFilter();
      }
    });

    this.createForm.get('module')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((moduleValue) => {
      const currentFilter = this.createForm.get('filter_type')?.value;
      if (moduleValue === 'devops_automation' && currentFilter === 'filters') {
        this.createForm.get('filter_type')?.setValue('');
      }
    });
  }

  get customMeta(): FormGroup | null {
    return this.createForm.get('custom_filter_meta') as FormGroup;
  }

  aimlFilter() {
    this.createForm.get('filter_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.createForm.removeControl('custom_filter_meta');
      this.createForm.removeControl('filter_rule_meta');
      this.createForm.removeControl('description');
      if (val === 'custom') {
        this.devicesList = [];
        this.triggerList = [];
        const alertTypes: string[] = this.createForm.get('alert_type')?.value;
        const isTriggersRequired: boolean = this.createForm.get('module')?.value === 'aiml';
        // this.createForm.addControl('custom_filter_meta', this.notifGrpSvc.getCustomFormGroup(null, isTriggersRequired));
        this.createForm.addControl('custom_filter_meta', this.notifGrpSvc.getCustomFormGroup('aiml', null, isTriggersRequired));
        this.createForm.get('custom_filter_meta').updateValueAndValidity();
        this.manageCustomFilterSubscription();
      }
      if (val === 'filters') {
        this.createForm.addControl('filter_rule_meta', new FormControl(null));
        this.createForm.get('filter_rule_meta').updateValueAndValidity();
        this.createForm.addControl('description', new FormControl({ value: '', disabled: true }));
        this.createForm.get('description').updateValueAndValidity();
        this.createForm.get('filter_rule_meta').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
          this.currentRuleSetValue = val;
          this.createForm.get('description').setValue(this.notifGrpSvc.basicRulesetToSQL(val));
        });
        //to force the querybuilder emit default value
        setTimeout(() => {
          if (!this.createForm.contains('uuid') || !this.createForm.get('description')?.value) {
            this.createForm.get('filter_rule_meta').setValue(null);
          }
        }, 50);
      }
    });

    this.currentRuleSetValue = this.createForm.get('filter_rule_meta')?.value;
    this.createForm.get('filter_rule_meta')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
      this.currentRuleSetValue = val;
      this.createForm.get('description').setValue(this.notifGrpSvc.basicRulesetToSQL(val));
    });
  }

  devopsFilter() {
    setTimeout(() => {
      this.createForm.get('filter_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.createForm.removeControl('custom_filter_meta');

        if (val === 'custom') {
          const customGroup = this.notifGrpSvc.getCustomFormGroup('devops_automation');
          this.createForm.addControl('custom_filter_meta', customGroup);

          customGroup.get('execution_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
            customGroup?.get('scope')?.setValue('');
            if (type) {
              customGroup.addControl('scope', this.builder.control('', Validators.required));
            }

            customGroup.get('scope')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((scopeVal) => {
              const executionType = customGroup.get('execution_type')?.value;
              if (scopeVal === 'specific') {
                if (executionType === 'task') {
                  this.getTaskData();
                  customGroup.removeControl('workflows');
                  customGroup.addControl('tasks', this.builder.control([], Validators.required));
                }
                if (executionType === 'workflow') {
                  this.getWorkflowData();
                  customGroup.removeControl('tasks');
                  customGroup.addControl('workflows', this.builder.control([], Validators.required));
                }
              } else {
                customGroup.removeControl('workflows');
                customGroup.removeControl('tasks');
              }
            });
          });
        }
      });
    })
  }

  buildForm() {
    // this.createForm = this.notifGrpSvc.createForm(data);
    this.createFormErrors = this.notifGrpSvc.resetFormErrors();
    this.createValidationMessages = this.notifGrpSvc.validationMessages;
    this.notifGrpSvc.createForm(this.groupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.createForm = res;
      this.spinner.stop('main');
      //Edit case
      if (this.groupId) {
        // const selectedAlertTypes = this.createForm.get('alert_type').value;
        // if (selectedAlertTypes.length) {
        //   const selectedAlertType = this.typeOptions.find(to => to.value == selectedAlertTypes[0]);
        //   console.log(selectedAlertType,"selected alert type")
        //   this.typeOptions.filter(to => to.type != selectedAlertType?.type).forEach(o => {
        //     console.log(o,"o")
        //     o.isDisabled = true;
        //   });
        //   this.isLifeCycleRelatedAlertTypeSelected = selectedAlertType.type == 'Life Cycle';
        //   this.hasAlertTypeSelected = true;
        // } else {
        //   this.hasAlertTypeSelected = false;
        // }
        this.hasAlertTypeSelected = true;

        const users = this.createForm.get('users')?.value;
        // setting user data
        if (users?.length) {
          this.usersArr = this.createForm.get('users')?.value;
          this.createForm.get('users')?.setValue('');
          this.setUsersList();
        }
        //fetching devices and triggers list
        if (this.customFilterFg && this.createForm.get('module')?.value === 'aiml' || this.createForm.get('module')?.value === 'deprecation') {
          this.getDevicesList(this.customFilterFg?.get('device_types')?.value);
          this.getTriggersList(this.customFilterFg?.get('device_list')?.value);
        }

        if (this.createForm.get('module')?.value === 'devops_automation') {
          // this.getTaskData();
          // this.getWorkflowData();
          const customGroup = this.createForm.get('custom_filter_meta') as FormGroup;
          setTimeout(() => {
            const scopeValue = customGroup?.get('scope')?.value;
            if (scopeValue) {
              customGroup.get('scope')?.setValue(scopeValue);
            }
          });
          if (customGroup?.get('tasks')) {
            this.getTaskData();
          }
          if (customGroup?.get('workflows')) {
            this.getWorkflowData();
          }
          if (customGroup) {
            customGroup.get('execution_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
              customGroup.get('scope')?.setValue('');
              customGroup.removeControl('tasks');
              customGroup.removeControl('workflows');
            });

            customGroup.get('scope')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(scope => {
              const type = customGroup.get('execution_type')?.value;
              if (scope === 'specific') {
                if (type === 'task') {
                  this.getTaskData();
                  customGroup.removeControl('workflows');
                  customGroup.addControl('tasks', this.builder.control([], Validators.required));
                }
                if (type === 'workflow') {
                  this.getWorkflowData();
                  customGroup.removeControl('tasks');
                  customGroup.addControl('workflows', this.builder.control([], Validators.required));
                }
              } else {
                customGroup.removeControl('workflows');
                customGroup.removeControl('tasks');
              }
            });
          }
          this.devopsFilter();
        }
      }
      this.manageFormsubscription();
      this.manageCustomFilterSubscription();
    });
  }

  getTaskData() {
    this.notifGrpSvc.getTaskData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.taskData = data;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  getWorkflowData() {
    this.notifGrpSvc.getWorkflowData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.workflowData = data;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Workflows'));
    });
  }


  setUsersList() {
    this.selectedUsers = this.userList.filter(user => {
      return this.usersArr.indexOf(user.email) >= 0;
    });
    this.setUserFieldValidation();
  }

  handleError(err: any) {
    this.createFormErrors = this.notifGrpSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.createForm.controls) {
          this.createFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submitForm() {
    console.log(this.createForm, "create form")
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors); });
    } else {
      this.spinner.start('main');
      if (this.createForm.get('filter_type').value === 'filters') {
        this.queryBuilder.submit();
      }
      const data = this.createForm.getRawValue();
      data.mode = data.mode[0];
      if (this.selectedUsers?.length) {
        data.users = this.selectedUsers.map(u => u.email);
      }
      else {
        data.users = [];
      }
      if (this.addEdit == 'Add') {
        this.notifGrpSvc.createGroup(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
          this.notification.success(new Notification('Group created successfully.'));
          this.spinner.stop('main');
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
      else {
        this.notifGrpSvc.updateGroup(data.uuid, data)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => {
            this.spinner.stop('main');
            this.goBack();
            this.notification.success(new Notification('Group updated successfully'));
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.handleError(err.error);
          });
      }
    }
  }

  get customFilterFg(): FormGroup {
    return this.createForm.get('custom_filter_meta') ? this.createForm.get('custom_filter_meta') as FormGroup : null;
  }

  onDeviceTypeClose() {
    this.customFilterFg?.get('device_list')?.setValue([]);
    this.customFilterFg?.get('device_list')?.setValidators([Validators.required]);
    this.customFilterFg?.get('device_list')?.updateValueAndValidity();
  }

  onDevicesSelectionClose() {
    this.customFilterFg?.get('triggers')?.setValue([]);
    this.customFilterFg?.get('triggers')?.updateValueAndValidity();
  }

  //For Query filters
  reset() {
    this.createFormErrors = null;
    this.createValidationMessages = null;
    this.createForm = null;
    this.buildForm();
  }

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
        setTimeout(() => {
          this.buildForm();
          // this.spinner.stop('main');
        }, 100);
      });
  }

  getDropdownFields() {
    this.ruleSvc.getDropdownFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.queryBuilderConfig = this.notifGrpSvc.convert(res);
      }
      this.buildForm();
      // this.spinner.stop('main');
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
    this.createForm.get('description').setValue(this.notifGrpSvc.basicRulesetToSQL(this.createForm.get('filter_rule_meta').value));
  }

  goBack() {
    if (this.groupId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}