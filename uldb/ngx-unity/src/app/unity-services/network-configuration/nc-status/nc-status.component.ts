import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FirewallCRUDManufacturer } from 'src/app/united-cloud/shared/entities/firewall-crud.type';
import { SwitchCRUDModel } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { ManageReportDatacenterType } from 'src/app/unity-reports/report-management/report-management.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { NCMConfigDetailsViewData, NCMDeviceViewData, NcStatusService, statusOptions } from './nc-status.service';
import { NCMDeviceType, NetworkConfigurationDeviceType } from './nc-status.type';

@Component({
  selector: 'nc-status',
  templateUrl: './nc-status.component.html',
  styleUrls: ['./nc-status.component.scss'],
  providers: [NcStatusService]
})
export class NcStatusComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  credentialsForm: FormGroup;
  credentialsFormErrors: any;
  credentialsformValidationMessages: any;
  datacenters: ManageReportDatacenterType[] = [];
  manufacturers: FirewallCRUDManufacturer[] = [];
  currentCriteria: SearchCriteria;
  summaryData: any;
  models: Array<SwitchCRUDModel> = [];
  ncmDevicesViewData: NCMDeviceViewData[] = [];
  count: number;
  manufacturerFilterValue: string[] = [];
  deviceTypeCheck: string;
  manufacturerCheck: string;
  ncmRunningConfigDetails: NCMConfigDetailsViewData;
  ncmStartupConfigDetails: NCMConfigDetailsViewData;
  selectedNCMConfig: NCMDeviceViewData;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  selectedNCMDeviceView: NCMDeviceViewData
  nonFieldErr: string = '';

  ValidatedRecords: string[] = [];

  @ViewChild('credentialForm') credentialForm: ElementRef;
  credentialFormModalRef: BsModalRef;

  @ViewChild('openRunningConfigDetails') openRunningConfigDetails: ElementRef;
  openRunningConfigDetailsModalRef: BsModalRef;

  @ViewChild('openStartupConfigDetails') openStartupConfigDetails: ElementRef;
  openStartupConfigDetailsModalRef: BsModalRef;

  statusOptions: LabelValueType[] = statusOptions;

  statusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  dcSettings: IMultiSelectSettings = {
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
    appendToBody: true
  };

  modelSettings: IMultiSelectSettings = {
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

  manufacturerSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: true,
    appendToBody: true,
    selectionLimit: 1
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: NcStatusService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder,
    private modalService: BsModalService,
    private storageService: StorageService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ device_type: '', manufacturer: '', collector: '' }], multiValueParam: { datacenter: [], model: [], status: this.statusOptions.map(option => option.value) } };
  }

  ngOnInit(): void {
    this.getDropdownData();
    this.getNCMSummaryData();
    this.getNCMDevices();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    // this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getNCMDevices();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getNCMDevices();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      // this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getNCMDevices();
    }
  }

  pageSizeChange(pageSize: number) {
    // this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getNCMDevices();
  }

  getDropdownData() {
    this.svc.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.datacenters = res;
      } else {
        this.datacenters = [];
      }
    });
    this.svc.getManufacturers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.manufacturers = res;
      } else {
        this.manufacturers = [];
      }
    });
    this.statusOptions.map(option => option.value)
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.collectors = res;
      } else {
        this.collectors = [];
      }
    });
  }

  getNCMSummaryData() {
    this.svc.getNCMSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = res;
    });
  }

  getNCMDevices() {
    this.spinner.start('main');
    this.svc.getNCMDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: PaginatedResult<NCMDeviceType>) => {
      this.spinner.stop('main');
      if (res) {
        this.count = res.count;
        this.ncmDevicesViewData = this.svc.convertToViewData(res.results);
      }
      this.handleViewValidations();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Get Data. Please try again'));
    });
  }

  handleViewValidations() {
    this.ncmDevicesViewData.forEach(view => {
      if (this.ValidatedRecords.includes(view.uuid)) {
        view.isValidated = true;
      }
    })
  }

  onManufacturerFilterChange() {
    if (this.currentCriteria.params[0].manufacturer && this.currentCriteria.params[0].device_type) {
      this.currentCriteria.multiValueParam.model = [];
      this.svc.getModels(this.currentCriteria.params[0].manufacturer, this.currentCriteria.params[0].device_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.models = res;
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to Fetch Models. Please try again'));
      });
    }
  }

  onModelFilterChange() {
    if (this.currentCriteria.multiValueParam.model.length) {
      this.manufacturerCheck = '';
    }
  }

  applyFilters() {
    this.currentCriteria.pageNo = 1;
    if (this.currentCriteria.params[0].manufacturer && !this.currentCriteria.multiValueParam.model.length) {
      this.manufacturerCheck = 'Please select Device Type & Model';
    } else {
      this.manufacturerCheck = '';
      this.getNCMDevices();
      this.getNCMSummaryData();
    }
  }

  buildCredentialsForm() {
    this.credentialsForm = this.svc.buildCredentialsForm();
    this.credentialsFormErrors = this.svc.resetCredentialsFormErrors();
    this.credentialsformValidationMessages = this.svc.credentialsFormValdiationMessages;
  }

  handleError(err: any) {
    this.credentialsFormErrors = this.svc.resetCredentialsFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.credentialsForm.controls) {
          this.credentialsFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.credentialFormModalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitCredentialsForm() {
    if (this.credentialsForm.invalid) {
      this.credentialsFormErrors = this.utilService.validateForm(this.credentialsForm, this.credentialsformValidationMessages, this.credentialsFormErrors);
      this.credentialsForm.valueChanges
        .subscribe((data: any) => { this.credentialsFormErrors = this.utilService.validateForm(this.credentialsForm, this.credentialsformValidationMessages, this.credentialsFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.credentialsForm.getRawValue(), { 'device_type': this.selectedNCMDeviceView.deviceType, 'uuid': this.selectedNCMDeviceView.uuid });
      this.svc.validateCredentials(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.ValidatedRecords.push(this.selectedNCMDeviceView.uuid);
        this.notification.success(new Notification('Credential Validated successfully.'));
        this.credentialFormModalRef.hide();
        this.handleValidateCredentialSuccessful();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      });
    }
  }

  handleValidateCredentialSuccessful() {
    this.selectedNCMDeviceView.isValidated = true;
    switch (this.selectedNCMDeviceView.activeActionBtn) {
      case 'startupConfig':
        this.openStartupConfig(this.selectedNCMDeviceView, true);
        break;
      case 'runningConfig':
        this.openRunningConfig(this.selectedNCMDeviceView, true);
        break;
      case 'history':
        this.goToHistory(this.selectedNCMDeviceView);
        break;
      default:
        break;
    }
  }

  goToDetails(view: NCMDeviceViewData) {
    switch (view.deviceType) {
      case NetworkConfigurationDeviceType.SWITCH:
        this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.SWITCHES, configured: true }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['switch', view.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case NetworkConfigurationDeviceType.FIREWALL:
        this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.FIREWALL, configured: true }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['firewalls', view.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case NetworkConfigurationDeviceType.LOAD_BALANCER:
        this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: true }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['load-balancers', view.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      default:
        break;
    }
  }

  openStartupConfig(view: NCMDeviceViewData, isSpinnerNotRequired?: boolean) {
    this.selectedNCMDeviceView = view;
    this.selectedNCMDeviceView.activeActionBtn = 'startupConfig';
    if (!this.selectedNCMDeviceView.hasStartupConfig) {
      return;
    }
    if (!this.handleCredentialsValidation()) {
      return;
    }
    if (!isSpinnerNotRequired) {
      this.spinner.start('main');
    }
    this.getStartupConfigDetails();
    this.openStartupConfigDetailsModalRef = this.modalService.show(this.openStartupConfigDetails, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  handleCredentialsValidation() {
    if (!this.selectedNCMDeviceView.isValidated) {
      this.buildCredentialsForm();
      this.credentialFormModalRef = this.modalService.show(this.credentialForm, Object.assign({}, { class: 'second', keyboard: true, ignoreBackdropClick: true }));
      return false;
    }
    return true;
  }

  getStartupConfigDetails() {
    this.svc.getStartupConfigDetails(this.selectedNCMDeviceView.deviceType, this.selectedNCMDeviceView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ncmStartupConfigDetails = this.svc.convertToConfigDetails(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Startup Configuration Details. Please try again'));
    });
  }

  openRunningConfig(view: NCMDeviceViewData, isSpinnerNotRequired?: boolean) {
    this.selectedNCMDeviceView = view;
    this.selectedNCMDeviceView.activeActionBtn = 'runningConfig';
    if (this.selectedNCMDeviceView.isRunningConfigEncrypted) {
      return;
    }
    if (!this.handleCredentialsValidation()) {
      return;
    }
    if (!isSpinnerNotRequired) {
      this.spinner.start('main');
    }
    this.getRunningConfigDetails();
    this.openRunningConfigDetailsModalRef = this.modalService.show(this.openRunningConfigDetails, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  getRunningConfigDetails() {
    this.svc.getRunningConfigDetails(this.selectedNCMDeviceView.deviceType, this.selectedNCMDeviceView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ncmRunningConfigDetails = this.svc.convertToConfigDetails(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Running Configuration Details. Please try again'));
    });
  }

  goToHistory(view: NCMDeviceViewData) {
    this.selectedNCMDeviceView = view;
    this.selectedNCMDeviceView.activeActionBtn = 'history';
    if (!this.handleCredentialsValidation()) {
      return;
    }
    this.router.navigate([view.deviceTypeForURL, view.uuid, 'history'], { relativeTo: this.route });
  }

}
