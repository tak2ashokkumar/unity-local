import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone, isString, isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { UnityDevicesMonitoringCrudService } from 'src/app/shared/unity-devices-monitoring-crud/unity-devices-monitoring-crud.service';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { NutanixInstanceCRUDFormData, UsiNutanixCrudService, nutanixComponents } from './usi-nutanix-crud.service';


@Component({
  selector: 'usi-nutanix-crud',
  templateUrl: './usi-nutanix-crud.component.html',
  styleUrls: ['./usi-nutanix-crud.component.scss'],
  providers: [UsiNutanixCrudService]
})
export class UsiNutanixCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  instanceId: string;
  instance: PrivateCloudType;

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;
  credentialFormData: any;
  datacenters: DataCenter[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  credentials: DeviceDiscoveryCredentials[] = [];

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;
  filterFormData: any;
  activeForm: string = 'credentialForm';
  nonFieldErr: string = '';
  components: Array<{ value: string, label: string }> = [];

  componentSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    lableToDisplay: 'label',
    keyToSelect: 'value',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  constructor(
    private svc: UsiNutanixCrudService,
    private scheduleSvc: UnityScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private snmpCrudSvc: UnityDevicesMonitoringCrudService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.instanceId) {
      this.getInstanceDetails();
    } else {
      this.manageActiveForm('credentialForm');
      this.getDropdownData();
    }
    this.components = _clone(nutanixComponents);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInstanceDetails() {
    this.svc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      this.manageActiveForm('credentialForm');
      this.getDropdownData();
    }, (err: HttpErrorResponse) => {
      this.instance = null;
      this.manageActiveForm('credentialForm');
      this.getDropdownData();
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'credentialForm':
        this.buildCredentialsForm();
        this.activeForm = formName;
        if (this.instanceId) {
          this.buildFilterForm();
        }
        break;
      case 'filterForm':
        if (this.credentialForm && this.credentialForm.valid) {
          this.buildFilterForm();
          this.activeForm = formName;
        } else {
          this.onSubmitCredentialForm();
        }
        break;
      default:
        if (!this.filterForm) {
          this.notification.warning(new Notification('Please fill in the Credentials, Filters and move to Schedule'));
          return;
        }
        if (this.filterForm.valid) {
          this.buildScheduleForm();
          this.activeForm = formName;
        } else {
          this.onSubmitFilterForm();
        }
        break;
    }
    this.spinner.stop('main');
  }

  buildCredentialsForm() {
    this.credentialForm = this.svc.buildCredentialForm(this.instance);
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.svc.credentialFormValidationMessages;
    this.credentialFormData = this.credentialForm.getRawValue();
  }

  getDropdownData() {
    this.getDatacenters();
    this.getCollectors();
    this.getCredentails();
  }

  getDatacenters() {
    this.datacenters = [];
    this.svc.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
    });
  }

  getCollectors() {
    this.collectors = [];
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getCredentails() {
    this.credentials = [];
    this.svc.getCredentails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.credentials = res;
    });
  }

  onSubmitCredentialForm() {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
        });
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.credentialForm.getRawValue());
      obj.colocation_cloud = this.datacenters.find(dc => dc.uuid == obj.colocation_cloud);
      obj.collector = this.collectors.find(dc => dc.uuid == obj.collector);
      obj.credentials = this.credentials.find(cr => cr.uuid == obj.credentials);
      this.credentialFormData = _clone(obj);
      this.nonFieldErr = '';
      if (this.instanceId) {
        this.svc.saveCredentialsForm(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.spinner.stop('main');
          this.manageActiveForm('filterForm');
        }, (err: HttpErrorResponse) => {
          this.handleCredentialFormErrors(err.error);
        });
      } else {
        this.svc.saveCredentialsForm(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.instance = res;
          this.manageActiveForm('filterForm');
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleCredentialFormErrors(err.error);
        });
      }
    }
  }

  handleCredentialFormErrors(err: any) {
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.credentialFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  buildFilterForm() {
    this.filterForm = this.svc.buildFilterForm(this.instance);
    this.filterFormErrors = this.svc.resetFilterFormErrors();
    this.filterFormValidationMessages = this.svc.filterFormValidationMessages;
    this.filterFormData = this.filterForm.getRawValue();
  }

  onSubmitFilterForm() {
    this.snmpCrudSvc.submit();
    if (this.filterForm.invalid) {
      this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
      this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
        });
    } else {
      if (this.snmpCrudSvc.isInvalid()) {
        return;
      }
      this.nonFieldErr = '';
      this.spinner.start('main');
      let cObj = Object.assign({}, this.credentialForm.getRawValue());
      cObj.colocation_cloud = this.datacenters.find(dc => dc.uuid == cObj.colocation_cloud);
      cObj.collector = this.collectors.find(dc => dc.uuid == cObj.collector);
      cObj.credentials = this.credentials.find(cr => cr.uuid == cObj.credentials);
      this.credentialFormData = _clone(cObj);
      let obj = <NutanixInstanceCRUDFormData>Object.assign({}, this.credentialFormData, this.filterForm.getRawValue(), this.snmpCrudSvc.getFormData());
      this.filterFormData = _clone(obj);
      this.svc.saveInstance(obj, this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.instance = res;
        this.spinner.stop('main');
        this.manageActiveForm('scheduleForm');
      }, (err: HttpErrorResponse) => {
        this.handleFilterFormErrors(err.error);
      })
    }
  }

  handleFilterFormErrors(err: any) {
    this.snmpCrudSvc.handleError(err);
    this.filterFormErrors = this.svc.resetFilterFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.filterForm.controls) {
          this.filterFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  buildScheduleForm() {
    if (this.instanceId && this.instance.nutanix_details && this.instance.nutanix_details.schedule) {
      this.scheduleSvc.addOrEdit(this.instance.nutanix_details.schedule);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm() {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveInstance();
    }
  }

  saveInstance() {
    this.spinner.start('main');
    let cObj = Object.assign({}, this.credentialForm.getRawValue());
    cObj.colocation_cloud = this.datacenters.find(dc => dc.uuid == cObj.colocation_cloud);
    cObj.collector = this.collectors.find(dc => dc.uuid == cObj.collector);
    cObj.credentials = this.credentials.find(cr => cr.uuid == cObj.credentials);
    this.credentialFormData = _clone(cObj);
    let fObj = <NutanixInstanceCRUDFormData>Object.assign({}, this.filterForm.getRawValue(), this.snmpCrudSvc.getFormData());
    this.filterFormData = _clone(fObj);
    let obj = Object.assign({}, this.credentialFormData, this.filterFormData, this.scheduleSvc.getFormValue());
    obj.schedule = _clone(obj.schedule_meta);
    this.svc.saveInstance(obj, this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      this.spinner.stop('main');
      if (this.instanceId) {
        this.notification.success(new Notification('Nutanix account details updated successfully'));
        this.goBack();
      } else {
        this.notification.success(new Notification('Nutanix account added successfully.'));
        this.goToList();
      }
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    })
  }

  handleError(err: any) {
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.filterFormErrors = this.svc.resetFilterFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.activeForm = 'credentialForm';
          this.credentialFormErrors[field] = err[field][0];
        } else if (field in this.filterForm.controls) {
          this.activeForm = 'filterForm';
          this.filterFormErrors[field] = err[field][0];
        } else {
          this.scheduleSvc.handleError(err);
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }
}
