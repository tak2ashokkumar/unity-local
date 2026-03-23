import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { AdvancedDiscoveryScanOpService, AdvancedDeviceDiscoveryScanOpViewdata, AdvancedDeviceDiscoveryScanOpInterfaceViewdata, discoveryListColumnMapping } from './advanced-discovery-scan-op.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DOWNLOAD_ADVANCED_DISCOVERY_SCAN_RESULT } from 'src/app/shared/api-endpoint.const';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvancedDiscoveryNetworkScanService, AdvancedDiscoveryNetworkScanViewData, AdvancedDiscoveryScheduleHistoryViewData } from '../advanced-discovery-network-scan/advanced-discovery-network-scan.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AdvancedDiscoveryScanOpIpAddresses } from '../advanced-discovery-scan-op.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'advanced-discovery-scan-op',
  templateUrl: './advanced-discovery-scan-op.component.html',
  styleUrls: ['./advanced-discovery-scan-op.component.scss'],
  providers: [AdvancedDiscoveryScanOpService, AdvancedDiscoveryNetworkScanService]
})
export class AdvancedDiscoveryScanOpComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: AdvancedDeviceDiscoveryScanOpViewdata[] = [];
  viewDataInterface: AdvancedDeviceDiscoveryScanOpInterfaceViewdata[] = [];
  count: number = 0;
  @ViewChild('confirmchange') confirmchange: ElementRef;
  confirmChangeModalRef: BsModalRef;
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  @ViewChild('interfaceInfo') interfaceInfo: ElementRef;
  interfaceInfoModalRef: BsModalRef;
  @ViewChild('ipAddressesInfo') ipAddressesInfo: ElementRef;
  ipAddressesInfoModalRef: BsModalRef;
  viewDataIpAddresses: AdvancedDiscoveryScanOpIpAddresses[];
  private selectedIndex: number;
  private selectedType: string;
  downloadScanResultUrl: string = DOWNLOAD_ADVANCED_DISCOVERY_SCAN_RESULT();
  currentCriteria: SearchCriteria;
  interfaceUuid: string;
  discoveryId: string;
  selectedNetwork: AdvancedDiscoveryNetworkScanViewData;
  @ViewChild('confirmNetDelete') confirmNetDelete: ElementRef;
  confirmNetModalRef: BsModalRef;
  @ViewChild('cloneNet') cloneNet: ElementRef;
  cloneNetModalRef: BsModalRef;
  cloneForm: FormGroup;
  cloneFormErrors: any;
  cloneValidationMessages: any;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: AdvancedDiscoveryScheduleHistoryViewData[] = [];
  modalRef: BsModalRef;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: AdvancedDiscoveryNetworkScanViewData;
  scheduleHistoryCount: number;
  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];
  tableColumns: TableColumnMapping[] = discoveryListColumnMapping;

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 8,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false
  };

  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };


  constructor(private scanOpService: AdvancedDiscoveryScanOpService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService,
    private discoveryService: AdvancedDeviceDiscoveryService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private netscanService: AdvancedDiscoveryNetworkScanService) {
    this.downloadScanResultUrl = `${this.downloadScanResultUrl}${this.discoveryService.getSelectedDiscoveryId()}/download`;
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.getDiscoveryDetails();
    this.getScanOp();
    this.buildCloneForm();
    this.buildColumnForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getScanOp();
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

  buildCloneForm() {
    this.cloneForm = this.netscanService.buildCloneForm();
    this.cloneFormErrors = this.netscanService.resetCloneFormErrors();
    this.cloneValidationMessages = this.netscanService.cloneValidationMessages;
  }

  buildColumnForm() {
    this.columnForm = this.scanOpService.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  getScanOp() {
    this.scanOpService.getDeviceDiscoveryScanOp(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.scanOpService.convertToViewData(res);
      this.count = this.viewData.length;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getScanOpInterface(discovery: string, uuid: string) {
    this.spinner.start('interface');
    this.scanOpService.interfaceNetworkScan(discovery, uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewDataInterface = this.scanOpService.convertToViewDataInterface(res);
      this.spinner.stop('interface');
    }, err => {
      this.spinner.stop('interface');
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getScanOpIPAddresses(discovery: string, uuid: string) {
    this.spinner.start('ip-addresses');
    this.scanOpService.ipAddressesNetworkScan(discovery, uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewDataIpAddresses = res;
      this.spinner.stop('ip-addresses');
    }, err => {
      this.spinner.stop('ip-addresses');
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  onDeviceTypeChange(type: string, i: number) {
    this.selectedIndex = i;
    this.selectedType = type;
    const obj = { resource_type: this.selectedType };
    this.scanOpService.updateDeviceType(this.viewData[this.selectedIndex].discovery, this.viewData[this.selectedIndex].uniqueId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[this.selectedIndex].deviceType = this.selectedType;
      // this.confirmChangeModalRef.hide();
    }, err => {

    });
    // this.confirmChangeModalRef = this.modalService.show(this.confirmchange, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeviceTypeChange() {
    const obj = { resource_type: this.selectedType };
    this.scanOpService.updateDeviceType(this.viewData[this.selectedIndex].discovery, this.viewData[this.selectedIndex].uniqueId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[this.selectedIndex].deviceType = this.selectedType;
      this.confirmChangeModalRef.hide();
    }, err => {

    });
  }

  cancelDeviceTypeChange() {
    this.viewData[this.selectedIndex].deviceType = this.viewData[this.selectedIndex].lastType;
    this.confirmChangeModalRef.hide();
  }

  showInterfaces(discovery: string, uuid: string) {
    this.interfaceUuid = uuid;
    this.discoveryId = discovery;
    setTimeout(()=>{
      this.getScanOpInterface(this.discoveryId, this.interfaceUuid);
    },0);
    this.interfaceInfoModalRef = this.modalService.show(this.interfaceInfo, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  showIpAddresses(discovery: string, uuid: string) {
    this.interfaceUuid = uuid;
    this.discoveryId = discovery;
    setTimeout(()=>{
      this.getScanOpIPAddresses(this.discoveryId, this.interfaceUuid);
    },0)
    this.ipAddressesInfoModalRef = this.modalService.show(this.ipAddressesInfo, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  onScanOpDelete(index: number) {
    this.selectedIndex = index;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.scanOpService.deleteDevice(this.viewData[this.selectedIndex].discovery, this.viewData[this.selectedIndex].uniqueId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getScanOp();
      this.confirmModalRef.hide();
      this.notificationService.success(new Notification('Device deleted successfully.'));
    }, err => {
      this.confirmModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  onBoard(discovery: string, uuid: string, index: number) {
    this.viewData[index].isLoading = true;
    this.scanOpService.onBoard(discovery, uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.viewData[index].onboardedMsg = res.onboard_msg;
      this.viewData[index].isLoading = false;
      this.viewData[index].isOnboard = res.is_onboard;
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Device has onboarded successfully'));
    }, (err : HttpErrorResponse) => {
      this.viewData[index].isLoading = false;
      this.viewData[index].onboardedMsg = err.error?.onboard_msg;
      this.viewData[index].isOnboard = err.error?.is_onboard;
      this.spinner.stop('main');
      this.notificationService.error(new Notification(err.error?.onboard_msg));
    });
  }

  executeDiscovery(view: AdvancedDiscoveryNetworkScanViewData) {
    this.spinner.start('main');
    this.netscanService.executeDiscovery(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Discovery executed sucessfully'));
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while executing discovery. Please try again!!'));
    });
  }

  deleteDiscovery() {
    this.confirmNetModalRef = this.modalService.show(this.confirmNetDelete, Object.assign({}, { class: 'second', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
  }

  confirmNetworkDelete() {
    this.confirmNetModalRef.hide();
    this.spinner.start('main');
    this.netscanService.deleteDiscovery(this.selectedNetwork.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (this.selectedNetwork.selected) {
        this.storage.removeByKey('discoveryId', StorageType.SESSIONSTORAGE);
      }
      this.router.navigate(['../', 'nwscan'], { relativeTo: this.route });
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Network Deleted sucessfully'));
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while deleting. Please try again!!'));
    });
  }

  cancelDiscovery(view: AdvancedDiscoveryNetworkScanViewData) {
    this.spinner.start('main');
    this.netscanService.cancelDiscovery(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Discovery execution cancelled.'));
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while cancelling discovery execution. Please try again!!'));
    });
  }

  getNetworkTopology(view: AdvancedDiscoveryNetworkScanViewData) {
    this.router.navigate(['nwscan', view.uuid, 'network'], { relativeTo: this.route.parent });
  }

  editDiscovery(task: AdvancedDiscoveryNetworkScanViewData) {
    this.router.navigate(['discovery-policy/../../', task.uuid, 'edit'], { relativeTo: this.route });
  }

  cloneTemplate(templateID: string) {
    this.cloneNetModalRef = this.modalService.show(this.cloneNet, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmNetClone() {
    if (this.cloneForm.invalid) {
      this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors);
      this.cloneForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors); });
      return;
    }
    else {
      this.spinner.start('main');
      this.netscanService.update(this.selectedNetwork.uuid, this.cloneForm.getRawValue()).pipe((takeUntil(this.ngUnsubscribe))).subscribe(res => {
        this.cloneNetModalRef.hide();
        this.cloneForm.reset()
        this.notificationService.success(new Notification('Template cloned successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification(' Failed to clone template. Please try again.'));
      });
    }
  }

  getScheduleHistory(view?: AdvancedDiscoveryNetworkScanViewData) {
    // this.spinner.start('main');
    // this.netscanService.getScheduleHistory(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //   this.scheduleHistory = this.netscanService.convertToHistoryViewData(res);
    //   this.spinner.stop('main');
    //   this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
    // }, err => {
    //   this.spinner.stop('main');
    //   this.notificationService.error(new Notification('Error while getting history. Please try again!!'));
    // });
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.netscanService.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count;
      this.scheduleHistory = this.netscanService.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if (view) {
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

  getDiscoveryDetails() {
    this.scanOpService.getDiscoveryDetails(this.discoveryService.getSelectedDiscoveryId()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedNetwork = this.scanOpService.convertToNetworkView(data);
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Error while getting data. Please try again!!'));
    })
  }
}
