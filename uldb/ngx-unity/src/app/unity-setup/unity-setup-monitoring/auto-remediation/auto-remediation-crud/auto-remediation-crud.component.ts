import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { Subject } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AutoRemediationCrudService } from './auto-remediation-crud.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { devicesType, ZabbixAnomalyDetectionTriggerGraphItemsType } from '../../usm-anomaly-detection/usm-anomaly-detection-crud/usm-anomaly-detection-crud.type';
import { DeviceTypesOptionsType } from 'src/app/shared/SharedEntityTypes/device-interface.type';
import { deviceTypesOptions } from 'src/app/shared/device-interface-crud/device-interface-crud.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { IPAddress, Trigger } from './auto-remediation-crud.type';
import { OrchestrationTaskCrudDataType } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-tasks-crud/orchestration-tasks-crud.type';
import { TerraFormParams } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-task.type';
import { isString } from 'lodash-es';
// import { Trigger } from './auto-remediation-crud.type';

@Component({
  selector: 'auto-remediation-crud',
  templateUrl: './auto-remediation-crud.component.html',
  styleUrls: ['./auto-remediation-crud.component.scss'],
  providers: [AutoRemediationCrudService]
})
export class AutoRemediationCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  autoRemiForm: FormGroup;
  autoRemiFormErrors: any;
  autoRemiFormValidationMessages: any;
  action: string = 'Create';
  autoRemediationId: string;
  taskDetails: OrchestrationTaskCrudDataType[] = [];
  selectedTask: OrchestrationTaskCrudDataType;
  devices: devicesType[] = [];
  items: ZabbixAnomalyDetectionTriggerGraphItemsType[] = [];
  deviceTypes: Array<DeviceTypesOptionsType> = deviceTypesOptions;
  autoRemediationDetails: any;
  credentialList: DeviceDiscoveryCredentials[] = [];
  selectedDeviceTypes: string[] = [];
  triggers: any[] = [];
  ipAddress: IPAddress[];
  scripts: any[] = [];
  eventAttributes: any[][] = [];
  filteredDevices: any;
  nonFieldErr: string = "";
  eventAttribute: any[];
  uniqueIpAddressesString: string;
  filteredIpAddresses: any[];
  count: number = 0;

  deviceTypesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
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

  devicesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
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

  triggersSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
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


  remediationTasksSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
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

  taskSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: true,
    appendToBody: true,
    selectionLimit: 1,
  };

  scriptSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: true,
    appendToBody: true,
    selectionLimit: 1,
  };


  constructor(private autoRemiSvc: AutoRemediationCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private renderer: Renderer2,
    private element: ElementRef,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.autoRemediationId = params.get('autoRemediationId');
      this.action = this.autoRemediationId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    this.getMetadata();
    // this.buildForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMetadata() {
    this.getCredentials();
    this.getEventAttributes();
    this.getTaskDetails();
    if (this.autoRemediationId) {
      this.autoRemiSvc.getAutoRemediationDetails(this.autoRemediationId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        this.autoRemediationDetails = res;
        if (this.autoRemediationDetails.ip_addresses.length) {
          const uniqueIpAddressesSet = new Set(
            this.autoRemediationDetails.ip_addresses.map(device => device.ip_address).filter(ip => ip) // Ensure no empty values
          );

          // Convert Set to an array and then to a comma-separated string
          const uniqueIpAddressesArray = Array.from(uniqueIpAddressesSet);
          this.uniqueIpAddressesString = uniqueIpAddressesArray.join(',');
          this.autoRemiSvc.getIpAddress(this.uniqueIpAddressesString).subscribe(response => {
            if (response.length > 0) {
              this.ipAddress = response;
              this.filteredIpAddresses = this.ipAddress.filter((ip: IPAddress) =>
                ip.monitoring.configured &&
                ip.monitoring.enabled &&
                ip.monitoring.zabbix
              );
              // this.autoRemiSvc.getTriggers(this.filteredIpAddresses).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
              //   this.triggers = res.trigger_ids;
              // });
            } else {
              this.ipAddress = [];
            }
          });
        } else {
          this.getDevices(this.autoRemediationDetails.device_types);
          this.autoRemiSvc.getTriggers(this.autoRemediationDetails.devices).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
            this.triggers = res.trigger_ids;
          });
        }
      });
    }
  }

  getTaskDetails() {
    this.autoRemiSvc.getTaskList().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.taskDetails = res;
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to fetch Task data'));
      this.spinner.stop('main');
    });
  }

  getEventAttributes() {
    this.autoRemiSvc.getEventAttributes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.eventAttribute = param;
    }, err => {
      this.notification.error(new Notification('Error while fetching event attributes. Please try again!!'));
    });
  }

  getCredentials() {
    this.autoRemiSvc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.credentialList = param;
    }, err => {
      this.notification.error(new Notification('Error while fetching credentials. Please try again!!'));
    });
  }

  buildForm() {
    this.autoRemiForm = this.autoRemiSvc.createAutoRemiForm(this.autoRemediationDetails);
    this.autoRemiFormErrors = this.autoRemiSvc.resetAutoRemiFormErrors();
    this.autoRemiFormValidationMessages = this.autoRemiSvc.autoRemiFormValidationMessages;

    if (this.autoRemediationDetails) {
      if (this.autoRemediationDetails.task_type == "Remediation Task") {
        const selectedTasks = this.taskDetails.filter(task => task.uuid == this.autoRemediationDetails.remediation_task);
        this.autoRemiForm.get('remediation_task').setValue([selectedTasks[0].uuid]);
      } else {
        this.spinner.start('main');
        this.autoRemiSvc.getScripts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.scripts = res;
          const selectedscripts = this.scripts.filter(script => script.uuid == this.autoRemediationDetails.script);
          this.autoRemiForm.get('script').setValue([selectedscripts[0].uuid]);
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Failed to fetch Metrics data'));
          this.spinner.stop('main');
        })
      }
      if (this.autoRemediationDetails.ip_addresses.length) {
        this.autoRemiForm.get('ip_addresses').setValue(this.uniqueIpAddressesString);
        this.spinner.start('main');
        this.filteredIpAddresses = this.autoRemediationDetails.ip_addresses.filter((ip: IPAddress) =>
          ip.monitoring.configured &&
          ip.monitoring.enabled &&
          ip.monitoring.zabbix
        );
        this.autoRemiSvc.getTriggers(this.filteredIpAddresses).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.triggers = res.trigger_ids;
          let dcs = (<any[]>this.autoRemediationDetails.trigger_ids).map(dc => dc.name);
          this.autoRemiForm.get('trigger_ids').setValue(this.triggers.filter(dc => dcs.includes(dc.name)));
          this.spinner.stop('main');
        });
      } else {
        // this.autoRemiForm.get('devices').setValue(this.autoRemediationDetails.devices, { emitEvent: false });
        let dcs = (<any[]>this.autoRemediationDetails.trigger_ids).map(dc => dc.uuid);
        this.autoRemiForm.get('trigger_ids').setValue(this.triggers.filter(dc => dcs.includes(dc.uuid)));
      }
      if (this.autoRemediationDetails.task_type == "Remediation Task") {
        this.autoRemiForm.removeControl('parameter_mapping');
        this.autoRemiForm.addControl('parameter_mapping', new FormArray([]));

        this.selectedTask = this.taskDetails.find(task => task.uuid == this.autoRemediationDetails.remediation_task);
        this.autoRemiFormErrors['parameter_mapping'] = [];
        if (Array.isArray(this.autoRemediationDetails.parameter_mapping)) {
          JSON.stringify(this.autoRemediationDetails.parameter_mapping) !== '{}' ? (this.autoRemediationDetails.parameter_mapping as TerraFormParams[]).forEach((p, i) => {
            const formGroup = this.builder.group({
              param_name: new FormControl(p.param_name),
              mapping_type: [this.autoRemediationDetails.parameter_mapping[i].mapping_type, Validators.required]
            });
            if (this.autoRemediationDetails.parameter_mapping[i].mapping_type == "Event Attribute") {
              formGroup.addControl('event_attribute', new FormControl(this.autoRemediationDetails.parameter_mapping[i].event_attribute, [Validators.required]));
              this.eventAttributes[i] = this.eventAttribute;
            } else if (this.autoRemediationDetails.parameter_mapping[i].mapping_type == "Regular Expression") {
              this.eventAttributes[i] = this.eventAttribute;
              formGroup.addControl('event_attribute', new FormControl(this.autoRemediationDetails.parameter_mapping[i].event_attribute, [Validators.required]));
              formGroup.addControl('expression', new FormControl(this.autoRemediationDetails.parameter_mapping[i].expression, [Validators.required]));
            } else {
              formGroup.addControl('expression', new FormControl(this.autoRemediationDetails.parameter_mapping[i].expression, [Validators.required]));
            }
            this.autoRemiFormErrors.parameter_mapping.push(this.autoRemiSvc.getParameterErrors());
            this.getParametersArray().push(formGroup);
            this.handleSubscriptionToHostMapping(formGroup);
          }) : '';
        }
      }
      setTimeout(() => {
        const namesToFilter = new Set(this.autoRemediationDetails.devices.map(device => device.name));
        this.filteredDevices = this.devices.filter(device => namesToFilter.has(device.name));
        this.autoRemiForm.get('devices').setValue(this.filteredDevices);
      }, 3000);
    }
    this.autoRemiForm.get('ip_addresses').valueChanges.pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe)).subscribe((ip: string) => {
      if (!ip.length) {
        this.autoRemiForm.get('device_types').enable({ emitEvent: false });
        this.autoRemiForm.get('devices').enable({ emitEvent: false });
        this.autoRemiForm.get('trigger_ids').setValue([], { emitEvent: false });
      } else {
        this.autoRemiForm.get('device_types').setValue([], { emitEvent: false });
        this.autoRemiForm.get('devices').setValue([], { emitEvent: false });
        this.autoRemiForm.get('device_types').disable({ emitEvent: false });
        this.autoRemiForm.get('devices').disable({ emitEvent: false });
      }
      if (ip && ip.trim().length > 0) {
        this.autoRemiSvc.getIpAddress(ip).subscribe(response => {
          // this.ipAddress = response;
          if (response.length > 0) {
            this.autoRemiFormErrors.ip = '';
            this.ipAddress = response;
            this.filteredIpAddresses = this.ipAddress.filter((ip: IPAddress) =>
              ip.monitoring.configured &&
              ip.monitoring.enabled &&
              ip.monitoring.zabbix
            );
            this.autoRemiSvc.getTriggers(this.filteredIpAddresses).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
              this.triggers = res.trigger_ids;
              this.autoRemiForm.get('trigger_ids').enable();
            });
          } else {
            this.ipAddress = [];
            this.autoRemiFormErrors.ip = 'No host found for the provided IP address';
          }
        });
      } else {
        this.autoRemiFormErrors.ip = '';
        this.ipAddress = [];
      }
    });
    this.autoRemiForm.get('device_types').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((deviceTypes: string[]) => {
      if (deviceTypes.length) {
        this.autoRemiForm.get('ip_addresses').disable({ emitEvent: false });
        this.autoRemiForm.get('ip_addresses').setValue('', { emitEvent: false });
        this.selectedDeviceTypes = deviceTypes;
        this.devices = [];
        this.autoRemiForm.get('devices').setValue([], { emitEvent: false });
        this.autoRemiForm.get('trigger_ids').setValue([], { emitEvent: false });
        this.getDevices(deviceTypes);
      } else {
        this.autoRemiForm.get('ip_addresses').enable({ emitEvent: false });
        this.autoRemiForm.get('devices').setValue([], { emitEvent: false });
        this.autoRemiForm.get('trigger_ids').setValue([], { emitEvent: false });
      }
    });
    this.autoRemiForm.get('devices').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((devices: string[]) => {
      // this.triggers=this.autoRemiSvc.getTriggers(devices);
      if (devices.length) {
        this.autoRemiSvc.getTriggers(devices).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.autoRemiForm.get('trigger_ids').enable();
          this.triggers = res.trigger_ids;
          if (this.autoRemediationId && this.count == 0) {
            this.count++;
            const namesToFilter = new Set(this.autoRemediationDetails.trigger_ids.map(trigger => trigger.name));
            const filteredTrigger = this.triggers.filter(trigger => namesToFilter.has(trigger.name));
            this.autoRemiForm.get('trigger_ids').setValue(filteredTrigger);
          }
        });
      } else {
      }
    });
    this.autoRemiForm.get('trigger_ids').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
    });
    this.autoRemiForm.get('task_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: string) => {
      if (res == 'Remediation Task') {
        this.autoRemiForm.removeControl('script');
        this.autoRemiForm.addControl('remediation_task', new FormControl([], [Validators.required]));
        this.autoRemiForm.get('remediation_task').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
          if (val.length) {
            this.autoRemiForm.removeControl('parameter_mapping');
            this.autoRemiForm.addControl('parameter_mapping', new FormArray([]));
            this.selectedTask = this.taskDetails.find(task => task.uuid == val);
            this.autoRemiSvc.getSingleTaskList(this.selectedTask.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
              this.autoRemiFormErrors['parameter_mapping'] = [];
              if (Array.isArray(val.inputs)) {
                JSON.stringify(val.inputs) !== '{}' ? (val.inputs as TerraFormParams[]).forEach((p, i) => {
                  const formGroup = this.builder.group({
                    param_name: new FormControl(p.param_name),
                    mapping_type: ['', Validators.required]
                  });
                  this.eventAttributes[i] = this.eventAttribute;
                  this.autoRemiFormErrors.parameter_mapping.push(this.autoRemiSvc.getParameterErrors());
                  this.getParametersArray().push(formGroup);
                  this.handleSubscriptionToHostMapping(formGroup);
                }) : '';
              }
            })
          } else {
            this.autoRemiForm.removeControl('parameter_mapping');
            this.selectedTask = null;
          }
        });
      } else {
        this.autoRemiForm.removeControl('remediation_task');
        this.autoRemiForm.removeControl('parameter_mapping');
        this.eventAttributes = [];
        this.autoRemiForm.addControl('script', new FormControl([], [Validators.required]));
        this.spinner.start('main');
        this.autoRemiSvc.getScripts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.scripts = res;
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Failed to fetch Metrics data'));
          this.spinner.stop('main');
        })
      }
    });

    this.handleSubscriptionToHostMapping(<FormGroup>this.autoRemiForm.get('host_mapping'));
    this.autoRemiForm.get('remediation_task')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
      if (val.length) {
        this.autoRemiForm.removeControl('parameter_mapping');
        this.autoRemiForm.addControl('parameter_mapping', new FormArray([]));
        this.selectedTask = this.taskDetails.find(task => task.uuid == val);
        this.autoRemiSvc.getSingleTaskList(this.selectedTask.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
          this.autoRemiFormErrors['parameter_mapping'] = [];
          if (Array.isArray(val.inputs)) {
            JSON.stringify(val.inputs) !== '{}' ? (val.inputs as TerraFormParams[]).forEach((p, i) => {
              const formGroup = this.builder.group({
                param_name: new FormControl(p.param_name),
                mapping_type: ['', Validators.required]
              });
              this.eventAttributes[i] = this.eventAttribute;
              this.autoRemiFormErrors.parameter_mapping.push(this.autoRemiSvc.getParameterErrors());
              this.getParametersArray().push(formGroup);
              this.handleSubscriptionToHostMapping(formGroup);
            }) : '';
          }
        })
      } else {
        this.autoRemiForm.removeControl('parameter_mapping');
        this.selectedTask = null;
      }
    });
    this.autoRemiForm.get('cred_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'Local') {
        this.autoRemiForm.addControl('credentials', new FormControl('', Validators.required));
        this.autoRemiForm.removeControl('username');
        this.autoRemiForm.removeControl('password');
      } else {
        this.autoRemiForm.removeControl('credentials');
        this.autoRemiForm.addControl('username', new FormControl('', Validators.required));
        this.autoRemiForm.addControl('password', new FormControl('', Validators.required));
      }
    });
  }

  // manageSubscriptionParameterMapping(currentGroup) {

  // }

  handleSubscriptionToHostMapping(currentGroup: FormGroup) {
    currentGroup.get('mapping_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: string) => {
      if (res == 'Event Attribute') {
        currentGroup.addControl('event_attribute', new FormControl('', [Validators.required]));
        currentGroup.removeControl('expression');
      } else if (res == 'Regular Expression') {
        currentGroup.removeControl('expression');
        currentGroup.removeControl('event_attribute');
        currentGroup.addControl('event_attribute', new FormControl('', [Validators.required]));
        currentGroup.addControl('expression', new FormControl('', [Validators.required]));
      } else {
        currentGroup.removeControl('expression');
        currentGroup.addControl('expression', new FormControl('', [Validators.required]));
        currentGroup.removeControl('event_attribute');
      }
    });
  }

  getParametersArray(): FormArray {
    return this.autoRemiForm.get('parameter_mapping') as FormArray;
  }

  getDevices(deviceTypes: string[]) {
    this.spinner.start('main');
    this.autoRemiSvc.getDevices(deviceTypes).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.devices = res;
      this.spinner.stop('main');
    });
  }

  getItems(devices: devicesType[]) {
    let mappingDevicesObj: { [key: string]: string[] } = {};
    for (let d = 0; d < devices.length; d++) {
      if (devices[d].device_type in mappingDevicesObj) {
        mappingDevicesObj[devices[d].device_type].push(devices[d].uuid);
      } else {
        mappingDevicesObj[devices[d].device_type] = [];
        mappingDevicesObj[devices[d].device_type].push(devices[d].uuid);
      }
    }
  }

  toggleStatus(status: boolean) {
    if (status) {
      this.autoRemiForm.get('enabled').setValue(true);
    } else {
      this.autoRemiForm.get('enabled').setValue(false);
    }
  }

  confirmRemediationCreate() {
    if (this.autoRemiForm.invalid) {
      this.autoRemiFormErrors = this.utilService.validateForm(this.autoRemiForm, this.autoRemiFormValidationMessages, this.autoRemiFormErrors);
      if (this.autoRemiForm.errors && this.autoRemiForm.errors.atLeastOneRequired) {
        this.autoRemiFormErrors.device_types = 'IP Address or Device Type is required';
        this.autoRemiFormErrors.ip_addresses = 'IP Address or Device Type is required';
      }
      this.autoRemiForm.valueChanges
        .subscribe((data: any) => { this.autoRemiFormErrors = this.utilService.validateForm(this.autoRemiForm, this.autoRemiFormValidationMessages, this.autoRemiFormErrors); });
      if (this.autoRemiForm.errors && this.autoRemiForm.errors.atLeastOneRequired) {
        this.autoRemiFormErrors.device_types = 'IP Address or Device Type is required';
        this.autoRemiFormErrors.ip_addresses = 'IP Address or Device Type is required';
      }
      return;
    } else {
      // this.spinner.start('main');
      const rawValues = this.autoRemiForm.getRawValue();
      // rawValues.host_mapping = [rawValues.host_mapping];
      if (rawValues.device_types.length) {
        delete rawValues.ip_addresses;
      } else {
        delete rawValues.device_types;
        delete rawValues.devices;
        rawValues.ip_addresses = this.ipAddress;
      }
      if (rawValues.task_type == "Remediation Task") {
        rawValues.remediation_task = rawValues.remediation_task[0];
      } else {
        rawValues.script = rawValues.script[0];
      }
      // const obj = { ...rawValues, inputs: inputsArray };
      this.autoRemiSvc.createRemediation(rawValues, this.autoRemediationId).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.router.navigate(['../'], { relativeTo: this.route });
          if (this.autoRemediationId) {
            this.notification.success(new Notification('Auto Remediation Updated successfully'));
          } else {
            this.notification.success(new Notification('Auto Remediation Created successfully'));
          }
          this.goBack();
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.handleError(err);
          this.spinner.stop('main');
          if (this.autoRemediationId) {
            this.notification.error(new Notification('Auto Remediation Update Failed'));
          } else {
            this.notification.error(new Notification('Auto Remediation Create failed'));
          }
        });
    }
  }

  handleError(err: any) {
    if (err.error.non_field_errors) {
      this.nonFieldErr = err.error.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.autoRemiForm.controls) {
          this.autoRemiFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goBack() {
    if (this.autoRemediationId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}