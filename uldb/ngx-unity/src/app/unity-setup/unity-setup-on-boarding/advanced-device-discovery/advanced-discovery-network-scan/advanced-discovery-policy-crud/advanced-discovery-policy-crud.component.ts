import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdvancedDiscoveryPolicyCrudService, queryBuilderClassNames, queryBuilderConfig } from './advanced-discovery-policy-crud.service';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeviceDiscoveryAgentConfigurationType } from '../../../advanced-discovery-connectivity/agent-config.type';
import { ManageReportDatacenterCabinetView, ManageReportDatacenterView } from 'src/app/unity-reports/manage-reports/manage-report-crud/datacenter-report-crud/datacenter-report-crud.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { QueryBuilderClassNames, QueryBuilderConfig, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { AppLevelService } from 'src/app/app-level.service';
import { AimlRulesService } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.service';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { cloneDeep as _clone } from 'lodash-es';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { SwitchCRUDManufacturer } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { HypervisorCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/hypervisor-crud.type';
import { ManageReportDatacenterType } from 'src/app/unity-reports/manage-reports/manage-report-crud/datacenter-report-crud/datacenter-report-crud.type';
import { templateType } from './advanced-discovery-policy-crud.type';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}

@Component({
  selector: 'advanced-discovery-policy-crud',
  templateUrl: './advanced-discovery-policy-crud.component.html',
  styleUrls: ['./advanced-discovery-policy-crud.component.scss'],
  providers: [AdvancedDiscoveryPolicyCrudService, AimlRulesService, { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ]
})
export class AdvancedDiscoveryPolicyCrudComponent implements OnInit, OnDestroy {

  searchValue: string = '';
  private ngUnsubscribe = new Subject();

  datacenters: ManageReportDatacenterType[] = [];
  credentials: DeviceDiscoveryCredentials[] = [];
  manufacturers: any[] = [];
  operatingSystems: HypervisorCRUDOperatingSystem[] = [];
  templates: templateType[] = [];
  selectedDCIds: number;
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  datacenterCabinets: ManageReportDatacenterCabinetView[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  uuid: string;
  policyId: string;
  discoveryPolicyEditdata: any;
  objSchedule: any;

  sources: AIMLSourceData[] = [];
  eventTypes: string[] = [];
  eventCategories: string[] = [];

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';

  tagsAutocompleteItems: string[] = [];
  discoveryMethods: string[] = [];
  allManufacturers: string[][] = [];

  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

  public allowRuleset: boolean = true;
  public allowCollapse: boolean = false;
  public persistValueOnFieldChange: boolean = false;

  discoveryType = [
    {
      name: 'ICMP',
      value: 'ICMP'
    },
    {
      name: 'SSH',
      value: 'SSH'
    },
    {
      name: 'SNMP',
      value: 'SNMP'
    },
    {
      name: 'WMI',
      value: 'WMI'
    },
    {
      name: 'Active Directory',
      value: 'AD'
    },
    {
      name: 'OSPF',
      value: 'OSPF'
    },
    {
      name: 'CDP',
      value: 'CDP'
    },
    {
      name: 'LLDP',
      value: 'LLDP'
    },
    {
      name: 'REDFISH',
      value: 'REDFISH'
    },
    {
      name: 'Database',
      value: 'DATABASE'
    }
  ];


  discoveryTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  }

  credentialsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-sm btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  }

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  cabinetSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'id',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  templateSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'template_name',
    keyToSelect: 'id',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-sm btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
    selectionLimit: 1,
    enableTooltip: true,
    autoUnselect: true,
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: AdvancedDiscoveryPolicyCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private scheduleSvc: UnityScheduleService,
    private ruleSvc: AimlRulesService,
    private appService: AppLevelService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.policyId = params.get('policyId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDropdownData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getDropdownData() {
    let config = queryBuilderConfig;
    this.queryBuilderConfig = config;
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.datacenters) {
        this.datacenters = res.datacenters;
      } else {
        this.datacenters = [];
      }
      if (res.collectors) {
        this.collectors = res.collectors;
      } else {
        this.collectors = [];
      }
      if (res.operatingSystems) {
        this.operatingSystems = res.operatingSystems;
      } else {
        this.operatingSystems = [];
      }
      if (res.templates) {
        this.templates = res.templates;
      } else {
        this.templates = [];
      }
      setTimeout(() => {
        this.buildForm();
        this.spinner.stop('main');
      }, 100)
    })
  }

  buildForm() {
    if (this.policyId) {
      this.svc.getDiscoveryDetails(this.policyId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.discoveryPolicyEditdata = data;
        this.scheduleSvc.addOrEdit(this.discoveryPolicyEditdata.schedule_meta);
        this.form = this.svc.buildForm(this.discoveryPolicyEditdata);
        this.formErrors = this.svc.resetFormErrors();
        this.formValidationMessages = this.svc.formValidationMessages;
        this.formErrors['monitoring_templates'] = [];
        if (this.form.get('activate_monitoring').value) {
          for (let index = 0; index < this.filter.length; index++) {
            this.formErrors.monitoring_templates.push(this.svc.getResetFilterFormErrors());
          }
        }
        this.credentials = [];
        this.discoveryMethods = this.form.get('discovery_methods').value;
        this.svc.getCredentails(this.discoveryMethods).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.credentials = data;
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
        if (this.form.get('activate_monitoring').value) {
          // this.allManufacturers = [];
          for (let i = 0; i < this.filter.length; i++) {
            let fg = <FormGroup>this.filter.at(i);
            const templateData = this.templates.find(template => template.id == this.discoveryPolicyEditdata.monitoring_templates[i].template);
            fg.get('template').setValue([this.discoveryPolicyEditdata.monitoring_templates[i].template])
            if (fg.get('type').value == 'manufacturers') {
              this.svc.getManufacturers(this.discoveryPolicyEditdata.monitoring_templates[i].device_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                fg.get('manufacturers').enable();
                this.allManufacturers[i] = data;
                fg.get('manufacturers').setValue(this.discoveryPolicyEditdata.monitoring_templates[i].manufacturers);
              }, (err: HttpErrorResponse) => {
                this.manufacturers = [];
              });
            }
            if (fg.get('type').value == 'operatingsystems') {
              fg.get('operatingsystems').setValue(this.discoveryPolicyEditdata.monitoring_templates[i].operatingsystems);
            }
          }
        }
        this.handleFormSubscriptions();
        this.dcChange();
        // this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.scheduleSvc.addOrEdit(null);
      this.form = this.svc.buildForm();
      this.formErrors = this.svc.resetFormErrors();
      this.formValidationMessages = this.svc.formValidationMessages;
      this.formErrors['monitoring_templates'] = [];
      if (this.form.get('activate_monitoring').value) {
        for (let index = 0; index < this.filter.length; index++) {
          this.formErrors.monitoring_templates.push(this.svc.getResetFilterFormErrors());
        }
      }
      this.handleFormSubscriptions();
      this.dcChange();
    }
  }

  handleFormSubscriptions() {
    this.handleNetworkTypeSubscription();
    this.handleUpdateLocationSubscription();
    this.form.get('discovery_methods').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
      this.credentials = [];
      this.discoveryMethods = this.form.get('discovery_methods').value;
      this.svc.getCredentails(this.discoveryMethods).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.credentials = data;
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    });
    this.form.get('filter_enabled').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      setTimeout(() => {
        this.form.get('filter_rule_meta').setValue(null);
        this.form.get('filter_rule_meta').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
          this.form.get('description').setValue(this.svc.basicRulesetToSQL(val));
        });
      }, 50);
    });
    if (this.form.get('filter_enabled').value) {
      this.form.get('filter_rule_meta').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
        this.form.get('description').setValue(this.svc.basicRulesetToSQL(val));
      });
    }
    this.form.get('activate_monitoring').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        this.allManufacturers = [];
        this.form.addControl('monitoring_templates', this.builder.array([this.svc.buildFilter()]));
        this.formErrors['monitoring_templates'] = [];
        for (let i = 0; i < this.filter.length; i++) {
          let formGroup = <FormGroup>this.filter.at(i);
          this.handleMonitoringSubscriptions(formGroup);
          this.formErrors.monitoring_templates.push(this.svc.getResetFilterFormErrors());
        }
      } else {
        this.form.removeControl('monitoring_templates');
      }
    })
    if (this.form.get('activate_monitoring').value) {
      for (let i = 0; i < this.filter.length; i++) {
        let formGroup = <FormGroup>this.filter.at(i);
        this.handleMonitoringSubscriptions(formGroup);
        // this.onSelectDeviceType(i);
      }
    }
  }

  handleMonitoringSubscriptions(fg: FormGroup) {
    fg.get('type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
      if (val == 'manufacturers') {
        fg.removeControl('operatingsystems');
        fg.addControl('device_type', new FormControl([], [Validators.required, NoWhitespaceValidator]))
        fg.addControl('manufacturers', new FormControl({ value: [], disabled: true }));
      }
      if (val == 'operatingsystems') {
        fg.removeControl('device_type');
        fg.removeControl('manufacturers');
        fg.addControl('operatingsystems', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      }
    });
    // fg.get('device_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
    //   this.svc.getManufacturers(val).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
    //     fg.get('manufacturers').enable();
    //     this.manufacturers = data;
    //   }, (err: HttpErrorResponse) => {
    //     this.manufacturers = [];
    //   });
    // })
  }

  onSelectDeviceType(index: number, event?: any) {
    let fg = <FormGroup>this.filter.at(index);
    this.svc.getManufacturers(fg.get('device_type')?.value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      fg.get('manufacturers').enable();
      this.allManufacturers[index] = data;
    }, (err: HttpErrorResponse) => {
      this.allManufacturers[index] = [];
    });
  }

  handleNetworkTypeSubscription() {
    this.form.get('network_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'ip_range') {
        this.form.addControl('ip_range_from', new FormControl('', [Validators.required]));
        this.form.addControl('ip_range_to', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('ip_range_from');
        this.form.removeControl('ip_range_to');
      }
      if (val == 'subnet' || val == 'ip') {
        this.form.addControl('discover_ips', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('discover_ips');
      }
    })
  }

  handleUpdateLocationSubscription() {
    this.form.get('update_location').valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.form.addControl('default_datacenter', new FormControl([]));
        this.form.addControl('default_cabinet', new FormControl([]));
      } else {
        this.form.removeControl('default_datacenter');
        this.form.removeControl('default_cabinet');
      }
    })
  }

  addFilter(index: number) {
    let formGroup = <FormGroup>this.filter.at(index);
    if (formGroup.invalid) {
      this.formErrors.monitoring_templates[index] = this.utilService.validateForm(formGroup, this.formValidationMessages.monitoring_templates, this.formErrors.monitoring_templates[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors.monitoring_templates[index] = this.utilService.validateForm(formGroup, this.formValidationMessages.monitoring_templates, this.formErrors.monitoring_templates[index]);
        });
    }
    else {
      let fg = this.svc.buildFilter();
      this.filter.push(fg);
      this.formErrors.monitoring_templates.push(this.svc.getResetFilterFormErrors());
      this.handleMonitoringSubscriptions(fg);
      // this.onSelectDeviceType(index);
    }
  }

  removeFilter(index: number) {
    this.filter.removeAt(index);
    this.formErrors.monitoring_templates.splice(index, 1);
  }

  get filter(): FormArray {
    if (this.form.get('activate_monitoring').value) {
      return this.form.get('monitoring_templates') as FormArray;
    }
  }

  dcChange() {
    if (this.form.get('default_datacenter')?.value) {
      let selectedDCIds = this.form.get('default_datacenter').value;
      if (selectedDCIds == this.selectedDCIds) {
        return;
      }
      this.selectedDCIds = selectedDCIds;
      if (selectedDCIds) {
        this.form.get('default_cabinet').reset();
        let dcCabinets = [];
        const numericDcId = parseInt(selectedDCIds, 10);
        const dcData = this.datacenters.find(dc => dc.id == numericDcId);
        dcCabinets = dcData.cabinets;
        this.datacenterCabinets = dcCabinets;
        if (this.policyId) {
          this.form.get('default_cabinet').setValue(this.discoveryPolicyEditdata.default_cabinet.id);
        }
      } else {
        this.datacenterCabinets = [];
      }
    }
  }

  enableFilter() {
    this.form.get('filter_enabled').setValue(true);
  }

  disableFilter() {
    this.form.get('filter_enabled').setValue(false);
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    for (let index = 0; index < this.filter.length - 1; index++) {
      this.formErrors.filter.push(this.svc.getResetFilterFormErrors());
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

  onSubmitCreateForm(runNow?: boolean) {
    if (this.form.get('filter_enabled').value) {
      this.queryBuilder.submit();
    }
    if (this.scheduleSvc.form.invalid) {
      this.scheduleSvc.submit();
      return;
    }
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      if (this.form.errors && this.form.errors.invalidRange) {
        this.formErrors.ip_range_from = 'The Ip range is invalid';
        this.formErrors.ip_range_to = 'The Ip range is invalid';
      }
      if (this.form.errors && this.form.errors.invalidExcludeIpsRange) {
        this.formErrors.exclude_ips = 'The excluded ips should be within the ip range';
      }
      if (this.form.errors && this.form.errors.invalidSubnetRange) {
        this.formErrors.discover_ips = "Invalid subnet Range";
      }
      if (this.form.errors && this.form.errors.invalidIpFormat) {
        this.formErrors.discover_ips = "Invalid IP Format";
      }
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
        });
      if (this.form.errors && this.form.errors.invalidRange) {
        this.formErrors.ip_range_from = 'The Ip range is invalid';
        this.formErrors.ip_range_to = 'The Ip range is invalid';
      }
      if (this.form.errors && this.form.errors.invalidExcludeIpsRange) {
        this.formErrors.exclude_ips = 'The excluded ips should be within the ip range';
      }
      if (this.form.errors && this.form.errors.invalidSubnetRange) {
        this.formErrors.discover_ips = "Invalid subnet Range";
      }
      if (this.form.errors && this.form.errors.invalidIpFormat) {
        this.formErrors.discover_ips = "Invalid IP Format";
      }
    } else {
      if (this.policyId) {
        this.spinner.start('main');
        let obj = this.form.getRawValue();
        let newCredential = this.form.get('credentials').value;
        const transformedList = newCredential.map(num => {
          return { "id": num };
        });
        obj.credentials = transformedList;
        if (this.form.get('update_location').value) {
          let defaultDatacenter = { id: parseInt(this.form.get('default_datacenter').value, 10) };
          obj.default_datacenter = defaultDatacenter;
          let defaultCabinet = { id: parseInt(this.form.get('default_cabinet').value, 10) };
          obj.default_cabinet = defaultCabinet;
        }

        if (this.form.get('network_type').value == 'ip_range') {
          const discoverIpsArray = [
            this.form.get('ip_range_from').value,
            this.form.get('ip_range_to').value
          ];
          obj.discover_ips = discoverIpsArray;
        }
        if (this.form.get('network_type').value == 'ip') {
          const discoverIpsValue = this.form.get('discover_ips').value;
          const discoverIpsValueArray = discoverIpsValue.split(',');
          obj.discover_ips = discoverIpsValueArray;
        }
        if (this.form.get('network_type').value == 'subnet') {
          const discoverIpsValue = this.form.get('discover_ips').value;
          this.form.get('discover_ips').setValue([discoverIpsValue]);
          obj.discover_ips = [discoverIpsValue];
        }
        const newexcludeValue = this.form.get('exclude_ips').value;
        if (typeof newexcludeValue === 'string') {
          const newexcludeValueArray = newexcludeValue.split(',');
          obj.exclude_ips = newexcludeValueArray;
        }
        if (!this.form.get('exclude_ips').value) {
          obj.exclude_ips = null;
        }
        if (obj.activate_monitoring) {
          if (obj.monitoring_templates.length > 0) {
            obj.monitoring_templates.map(moni_template => {
              moni_template.template = moni_template.template[0]
            })
          }
        }
        this.objSchedule = this.scheduleSvc.getFormValue();
        if (runNow) {
          this.objSchedule.schedule_meta['run_now'] = true;
        } else {
          this.objSchedule.schedule_meta['run_now'] = false;
        }
        const fd = Object.assign({}, obj, this.objSchedule);
        this.svc.edit(this.policyId, fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Discovery Policy updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.spinner.start('main');
        let obj = this.form.getRawValue();
        let newCredential = this.form.get('credentials').value;
        const transformedList = newCredential.map(num => {
          return { "id": num };
        });
        obj.credentials = transformedList;
        if (this.form.get('update_location').value) {
          let defaultDatacenter = { id: parseInt(this.form.get('default_datacenter').value, 10) };
          obj.default_datacenter = defaultDatacenter;
          let defaultCabinet = { id: parseInt(this.form.get('default_cabinet').value, 10) };
          obj.default_cabinet = defaultCabinet;
        }

        if (this.form.get('network_type').value == 'ip_range') {
          const discoverIpsArray = [
            this.form.get('ip_range_from').value,
            this.form.get('ip_range_to').value
          ];
          obj.discover_ips = discoverIpsArray;
        }
        if (this.form.get('network_type').value == 'ip') {
          const discoverIpsValue = this.form.get('discover_ips').value;
          const discoverIpsValueArray = discoverIpsValue.split(',');
          obj.discover_ips = discoverIpsValueArray;
        }
        if (this.form.get('network_type').value == 'subnet') {
          const discoverIpsValue = this.form.get('discover_ips').value;
          this.form.get('discover_ips').setValue([discoverIpsValue]);
          obj.discover_ips = [discoverIpsValue];
        }
        const newexcludeValue = this.form.get('exclude_ips').value;
        if (typeof newexcludeValue === 'string') {
          const newexcludeValueArray = newexcludeValue.split(',');
          obj.exclude_ips = newexcludeValueArray;
        }
        if (!this.form.get('exclude_ips').value) {
          obj.exclude_ips = null;
        }
        if (obj.activate_monitoring) {
          if (obj.monitoring_templates.length > 0) {
            obj.monitoring_templates.map(moni_template => {
              moni_template.template = moni_template.template[0]
            })
          }
        }
        this.objSchedule = this.scheduleSvc.getFormValue();
        if (runNow) {
          this.objSchedule.schedule_meta['run_now'] = true;
        } else {
          this.objSchedule.schedule_meta['run_now'] = false;
        }
        const fd = Object.assign({}, obj, this.objSchedule);
        this.svc.add(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Discovery Policy created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  goBack() {
    if (this.uuid) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['advanced-discovery', 'nwscan'], { relativeTo: this.route.parent });
    }
  }

}
