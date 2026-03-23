import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';
import { AdvancedDiscoveryNetworkScanService, AdvancedDiscoveryNetworkScanViewData, AdvancedDiscoveryScheduleHistoryViewData, AdvancedNetworkDiscoveredDevicesViewData, DiscoveryType } from './advanced-discovery-network-scan.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

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
  selector: 'advanced-discovery-network-scan',
  templateUrl: './advanced-discovery-network-scan.component.html',
  styleUrls: ['./advanced-discovery-network-scan.component.scss'],
  providers: [AdvancedDiscoveryNetworkScanService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})
export class AdvancedDiscoveryNetworkScanComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: AdvancedDiscoveryNetworkScanViewData[] = [];
  selectedView: AdvancedDiscoveryNetworkScanViewData;
  showDiscoveredDevices: boolean = false;
  discoveredDevices: AdvancedNetworkDiscoveredDevicesViewData[] = [];
  enable: string;
  @Output() toggleModal: EventEmitter<string> = new EventEmitter<string>();
  modalRef: BsModalRef;
  discoveryForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  currentCriteria: SearchCriteria;
  @ViewChild('discoveryCRUD') discoveryCRUD: ElementRef;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  @ViewChild('confirmToggleTemplate') confirmToggleTemplate: ElementRef;
  confirmToggleModalRef: BsModalRef;
  credentialSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
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
  credentialList: DeviceDiscoveryCredentials[] = [];
  filteredCredentialList: DeviceDiscoveryCredentials[] = [];
  collectorList: DeviceDiscoveryAgentConfigurationType[] = [];
  scheduleHistory: AdvancedDiscoveryScheduleHistoryViewData[] = [];
  dates: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  discoveryType = DiscoveryType;
  editTemplateID: string;
  count: number;
  @ViewChild('clone') clone: ElementRef;
  cloneModalRef: BsModalRef;
  cloneForm: FormGroup;
  cloneFormErrors: any;
  cloneValidationMessages: any;
  popOverList: string[] = [];
  popOverListIp: string[] = [];
  discoveryTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  discoveryTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Discovery Type',
  };
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: AdvancedDiscoveryNetworkScanViewData;
  scheduleHistoryCount: number;

  constructor(private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private discoveryService: AdvancedDiscoveryNetworkScanService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService) {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ schedule_status: '', execution_status: '', network_type: '' }], multiValueParam: { discover_methods: [] }
    };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getDiscoveries();
    this.getCredentials();
    this.getConfigurations();
    this.buildCloneForm();
  }

  ngOnDestroy() {
    // this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData($event: number) {
    this.spinner.start('main');
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ schedule_status: '', execution_status: '', network_type: '' }], multiValueParam: { discover_methods: [] }
    };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
    this.getDiscoveries();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDiscoveries();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getDiscoveries();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDiscoveries();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDiscoveries();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getDiscoveries();
  }

  onSearchedSchedule(event: string) {
    this.scheduleHistoryCurrentCriteria.searchQuery = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChangeSchedule(pageNo: number) {
    this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
    this.getScheduleHistory();
  }

  pageSizeChangeSchedule(pageSize: number) {
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  getSelectedDiscovery() {
    if (this.viewData.length) {
      let discoveryId: string = this.storage.getByKey('discoveryId', StorageType.SESSIONSTORAGE);
      if (discoveryId) {
        for (let i = 0; i < this.viewData.length; i++) {
          if (this.viewData[i].uuid == discoveryId) {
            this.viewData[i].selected = true;
          }
        }
      } else {
        this.viewData[0].selected = true;
        this.storage.put('discoveryId', this.viewData[0].uuid, StorageType.SESSIONSTORAGE);
      }
    } else {
      this.storage.removeByKey('discoveryId', StorageType.SESSIONSTORAGE);
    }
  }

  getDiscoveries() {
    // this.spinner.start('main');
    this.discoveryService.getDiscoveries(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.discoveryService.convertToViewData(res.results);
      this.getSelectedDiscovery();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while fetching discovery. Please try again!!'));
    });
  }

  selectDiscovery(view: AdvancedDiscoveryNetworkScanViewData) {
    this.viewData.map(v => v.selected = false);
    view.selected = true;
    this.storage.put('discoveryId', view.uuid, StorageType.SESSIONSTORAGE);
  }

  getCredentials() {
    this.discoveryService.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.credentialList = res;
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Error while fetching credentials. Please try again!!'));
    });
  }

  getConfigurations() {
    this.discoveryService.getConfigurations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectorList = res;
    }, err => {
      this.notificationService.error(new Notification('Error while fetching collectors. Please try again!!'));
    });
  }

  discovery_type: string = 'subnet';
  createForm() {
    this.toggleModal.emit();
    this.nonFieldErr = '';
    this.discoveryForm = this.discoveryService.buildForm(this.selectedView);
    this.formErrors = this.discoveryService.resetFormErrors();
    this.validationMessages = this.discoveryService.validationMessages;
    this.modalRef = this.modalService.show(this.discoveryCRUD, { class: 'second', keyboard: true, ignoreBackdropClick: true });
    if (this.discoveryForm.get('collector')) {
      if (this.action == 'Add') {
        if (this.collectorList.length == 1) {
          this.discoveryForm.get('collector').setValue(this.collectorList[0]);
          this.discoveryForm.get('collector').updateValueAndValidity();
        }
      } else {
        for (let i = 0; i < this.collectorList.length; i++) {
          const element = this.collectorList[i];
          if (this.discoveryForm.get('collector').value == element.name) {
            this.discoveryForm.get('collector').setValue(element);
            break;
          }
        }
      }
    }

    if (this.discoveryForm.get('type')) {
      if (this.discoveryForm.get('type').value == 'active directory') {
        this.discovery_type = 'active_directory';
        this.filteredCredentialList = this.credentialList.filter(cred => cred.type == 'Active Directory');
      } else {
        this.filteredCredentialList = this.credentialList.filter(cred => cred.type !== 'Active Directory');
      }
      if (this.action == 'Edit') {
        let credentials = <{ id: number, uuid: string, name: string }[]>this.discoveryForm.get('credentials').value;
        let selectedCred = [];
        credentials.forEach(cred => {
          let s = this.filteredCredentialList.find(credential => credential.uuid == cred.uuid);
          if (s) {
            selectedCred.push(s);
          }
        });
        this.discoveryForm.get('credentials').patchValue(selectedCred);
        this.discoveryForm.get('credentials').updateValueAndValidity();
      }
      this.discoveryForm.get('type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == 'active directory') {
          this.filteredCredentialList = this.credentialList.filter(cred => cred.type == 'Active Directory');
          this.discovery_type = 'active_directory';
          this.discoveryForm.get('subnet').setValue("");
          this.discoveryForm.get('subnet').disable();
          this.discoveryForm.get('subnet').setValidators([]);
          this.discoveryForm.get('subnet').updateValueAndValidity();
        } else {
          this.filteredCredentialList = this.credentialList.filter(cred => cred.type !== 'Active Directory');
          this.discovery_type = 'subnet';
          this.discoveryForm.get('subnet').enable();
          this.discoveryForm.get('subnet').setValidators([Validators.required, NoWhitespaceValidator]);
          this.discoveryForm.get('subnet').updateValueAndValidity();
        }
      });
    }
    this.discoveryForm.get('schedule_scan').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val) {
        this.discoveryForm.get('schedule').setValue('');
        this.discoveryForm.get('schedule').enable();
        this.discoveryForm.get('schedule').setValidators([Validators.required, NoWhitespaceValidator]);
        this.discoveryForm.get('schedule').updateValueAndValidity();

        this.discoveryForm.get('schedule_time').setValue(null);
        this.discoveryForm.get('schedule_time').enable();
        this.discoveryForm.get('schedule_time').setValidators([Validators.required, NoWhitespaceValidator]);
        this.discoveryForm.get('schedule_time').updateValueAndValidity();
      } else {
        this.discoveryForm.get('schedule').setValue('');
        this.discoveryForm.get('schedule').disable();
        this.discoveryForm.get('schedule').setValidators([]);
        this.discoveryForm.get('schedule').updateValueAndValidity();

        this.discoveryForm.get('schedule_time').setValue(null);
        this.discoveryForm.get('schedule_time').disable();
        this.discoveryForm.get('schedule_time').setValidators([]);
        this.discoveryForm.get('schedule_time').updateValueAndValidity();
      }
    });

    //On edit case
    this.updateScheduleFields(this.discoveryForm.get('schedule_scan').value);


    this.discoveryForm.get('schedule').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.discoveryForm.get('schedule_time').setValue(null);
      if (val == 'weekly') {
        this.discoveryForm.addControl('scheduled_day', new FormControl('Sunday'));
      } else if (val == 'monthly') {
        this.discoveryForm.addControl('scheduled_date', new FormControl(1));
      } else {
        if (this.discoveryForm.get('scheduled_day')) {
          this.discoveryForm.removeControl('scheduled_day');
        } else if (this.discoveryForm.get('scheduled_date')) {
          this.discoveryForm.removeControl('scheduled_date');
        }
      }
    });
  }

  updateScheduleFields(val: string) {
    if (val) {
      this.discoveryForm.get('schedule').enable();
      this.discoveryForm.get('schedule').setValidators([Validators.required, NoWhitespaceValidator]);

      this.discoveryForm.get('schedule_time').enable();
      this.discoveryForm.get('schedule_time').setValidators([Validators.required, NoWhitespaceValidator]);
    } else {
      this.discoveryForm.get('schedule').disable();
      this.discoveryForm.get('schedule').setValidators([]);

      this.discoveryForm.get('schedule_time').disable();
      this.discoveryForm.get('schedule_time').setValidators([]);
    }
  }

  addDiscovery() {
    this.selectedView = null;
    this.action = 'Add';
    this.createForm();
  }

  editDiscovery(task: AdvancedDiscoveryNetworkScanViewData) {
    console.log(task.uuid, "UUID")
    this.router.navigate(['discovery-policy/../../', task.uuid, 'edit'], { relativeTo: this.route });
  }

  handleError(err: any) {
    this.formErrors = this.discoveryService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.discoveryForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.closeAddModal();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  checkValid() {
    if (this.selectedView || this.discoveryForm.get('run_now').value || this.discoveryForm.get('schedule_scan').value) {
      return false;
    } else {
      return true;
    }
  }

  submit() {
    if (this.discoveryForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.discoveryForm, this.validationMessages, this.formErrors);
      this.discoveryForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.discoveryForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      if (this.selectedView) {
        this.discoveryService.updateDiscovery(this.selectedView.uuid, this.discoveryForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getDiscoveries();
          this.closeAddModal();
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Network updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      } else {
        this.discoveryService.addDiscovery(this.discoveryForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getDiscoveries();
          this.closeAddModal();
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Network added successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  closeAddModal() {
    this.toggleModal.emit();
    this.modalRef.hide();
  }

  deleteDiscovery(view: AdvancedDiscoveryNetworkScanViewData) {
    this.selectedView = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: 'second', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinner.start('main');
    this.discoveryService.deleteDiscovery(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (this.selectedView.selected) {
        this.storage.removeByKey('discoveryId', StorageType.SESSIONSTORAGE);
      }
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Network Deleted sucessfully'));
      this.getDiscoveries();
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while deleting. Please try again!!'));
    });
  }

  executeDiscovery(view: AdvancedDiscoveryNetworkScanViewData) {
    this.spinner.start('main');
    this.discoveryService.executeDiscovery(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDiscoveries();
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Discovery started successfully'));
    }, err => {
      this.getDiscoveries();
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while executing discovery. Please try again!!'));
    });
  }

  getDiscoveredDevices(view: AdvancedDiscoveryNetworkScanViewData, template: TemplateRef<any>) {
    this.spinner.start('main');
    this.discoveryService.getDiscoveredDevices(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.discoveredDevices = this.discoveryService.convertToDevicesViewData(res);
      this.spinner.stop('main');
      this.showDiscoveredDevices = true;
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while getting devices. Please try again!!'));
    });
  }

  getScheduleHistory(view?: AdvancedDiscoveryNetworkScanViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.discoveryService.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count;
      this.scheduleHistory = this.discoveryService.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if (view) {
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

  goToScan(view: AdvancedDiscoveryNetworkScanViewData) {
    this.storage.put('discoveryId', view.uuid, StorageType.SESSIONSTORAGE);
    this.router.navigate(['scanop'], { relativeTo: this.route.parent });
  }

  goBack() {
    this.showDiscoveredDevices = false;
  }

  showUsers(view: AdvancedDiscoveryNetworkScanViewData) {
    this.popOverList = view.extraUsersList;
  }

  showUsersDiscoveryIp(view: AdvancedDiscoveryNetworkScanViewData) {
    this.popOverListIp = view.extraUsersListIp;
  }

  cancelDiscovery(view: AdvancedDiscoveryNetworkScanViewData) {
    this.spinner.start('main');
    this.discoveryService.cancelDiscovery(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDiscoveries();
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Discovery execution cancelled.'));
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while cancelling discovery execution. Please try again!!'));
    });
  }

  getNetworkTopology(view: AdvancedDiscoveryNetworkScanViewData) {
    // return;
    this.router.navigate([view.uuid, 'network'], { relativeTo: this.route });
  }

  toggle(view: AdvancedDiscoveryNetworkScanViewData) {
    if (!view.toggleBtnEnabled) {
      return;
    }
    this.selectedView = view;
    this.enable = view.toggleTootipMsg;
    this.confirmToggleModalRef = this.modalService.show(this.confirmToggleTemplate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.spinner.start('main');
    this.discoveryService.toggle(this.selectedView.uuid, this.enable).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: boolean) => {
      this.getDiscoveries();
      this.notificationService.success(new Notification(`Schedule ${this.selectedView.toggleTootipMsg}d successfully`));
      this.confirmToggleModalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.confirmToggleModalRef.hide();
      this.spinner.stop('main');
      this.notificationService.error(new Notification(`Could not ${this.selectedView.toggleTootipMsg} schedule!! Please try again`))
    });
  }

  buildCloneForm() {
    this.cloneForm = this.discoveryService.buildCloneForm();
    this.cloneFormErrors = this.discoveryService.resetCloneFormErrors();
    this.cloneValidationMessages = this.discoveryService.cloneValidationMessages;
  }

  cloneTemplate(templateID: string) {
    this.editTemplateID = templateID;
    this.cloneModalRef = this.modalService.show(this.clone, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  onSubmit() {
    if (this.cloneForm.invalid) {
      this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors);
      this.cloneForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors); });
      return;
    }
    else {
      this.spinner.start('main');
      this.discoveryService.update(this.editTemplateID, this.cloneForm.getRawValue()).pipe((takeUntil(this.ngUnsubscribe))).subscribe(res => {
        this.cloneModalRef.hide();
        this.cloneForm.reset()
        this.notificationService.success(new Notification('Template cloned successfully'));
        this.spinner.stop('main');
        this.getDiscoveries();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        this.spinner.stop('main');
        this.notificationService.error(new Notification(' Failed to clone template. Please try again.'));
      });
    }
  }

  addPolicy() {
    this.router.navigate(['../../discovery-policy'], { relativeTo: this.route });
  }

}
