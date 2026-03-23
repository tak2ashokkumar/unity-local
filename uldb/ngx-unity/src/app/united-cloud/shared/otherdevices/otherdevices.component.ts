import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval } from 'rxjs';
import { filter, mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { OTHER_DEVICES_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { OtherDevice, OtherDeviceUrl } from '../entities/other-device.type';
import { OtherDevicesSummaryViewData, OtherDevicesViewData, OtherdevicesService } from './otherdevices.service';

@Component({
  selector: 'otherdevices',
  templateUrl: './otherdevices.component.html',
  styleUrls: ['./otherdevices.component.scss']
})
export class OtherdevicesComponent implements OnInit, OnDestroy {
  popUrlList: OtherDeviceUrl[];
  private pcId: string;
  viewData: OtherDevicesViewData[] = [];
  inputView: OtherDevicesViewData;
  count: number;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();

  @ViewChild('deviceinfo') deviceinfo: ElementRef;
  modalRef: BsModalRef;
  poll: boolean = false;

  @ViewChild('tagsFormRef') tagsFormRef: ElementRef;
  tagsFormModelRef: BsModalRef;
  tagsForm: FormGroup;
  tagsFormErrors: any;
  tagsFormValidationMessages: any;
  nonFieldErr: string = '';
  tagsAutocompleteItems: string[] = [];
  summaryData: OtherDevicesSummaryViewData;

  @ViewChild('deleteModel') deleteModel: ElementRef;
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  deviceId: string;
  selectedDeviceIds: string[] = [];
  selectedAll: boolean = false;
  isSelected: boolean = false;
  @ViewChild('bulkUpdateFormModel') bulkUpdateFormModel: ElementRef;
  bulkUpdateForm: FormGroup;
  bulkUpdateFormErrors: any;
  bulkUpdateFormValidationMessages: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private otherDevicesService: OtherdevicesService,
    private spinnerService: AppSpinnerService,
    private modalService: BsModalService,
    private appService: AppLevelService,
    private termService: FloatingTerminalService,
    private notification: AppNotificationService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private ticketService: SharedCreateTicketService,
  ) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getDevices());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    setTimeout(() => {
      this.getDevices();
      this.getCustomDevicesSummaryData();
      this.getTags();
    })
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getDevices();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDevices();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDevices();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDevices();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDevices();
    this.getCustomDevicesSummaryData();
    this.getTags();
  }

  startSpinner() {
    this.spinnerService.start('total');
    this.spinnerService.start('up');
    this.spinnerService.start('down');
    this.spinnerService.start('enabled');
    this.spinnerService.start('activated');
    this.spinnerService.start('alerts');
  }

  stopSpinner() {
    this.spinnerService.stop('total');
    this.spinnerService.stop('up');
    this.spinnerService.stop('down');
    this.spinnerService.stop('enabled');
    this.spinnerService.stop('activated');
    this.spinnerService.stop('alerts');
  }

  getDevices() {
    this.otherDevicesService.getOtherDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<OtherDevice>) => {
      this.count = data.count;
      this.viewData = this.otherDevicesService.convertToViewData(data.results);
      this.getDeviceData();
      this.getURLDeviceData();
      if (this.selectedDeviceIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedDeviceIds.includes(i.deviceId) })
      }
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(filter(device => device.type != 'URL'),
      mergeMap((e) => this.otherDevicesService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getURLDeviceData() {
    from(this.viewData).pipe(filter(device => device.type == 'URL'),
      mergeMap((e) => this.otherDevicesService.getURLDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getCustomDevicesSummaryData() {
    this.startSpinner();
    this.otherDevicesService.getCustomDevicesSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = this.otherDevicesService.convertOtherDevicesSummaryData(res.summary_data);
      this.stopSpinner();
    }, (err: HttpErrorResponse) => {
      this.stopSpinner();
    })
  }

  goToStats(view: OtherDevicesViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.OTHER_DEVICES, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.deviceId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.deviceId, 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  createTicket(data: OtherDevicesViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.OTHER_DEVICES, data.name), metadata: OTHER_DEVICES_TICKET_METADATA(DeviceMapping.OTHER_DEVICES, data.name, data.deviceStatus, data.isMonitoring, data.description)
    }, DeviceMapping.OTHER_DEVICES);
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.OTHER_DEVICES }, StorageType.SESSIONSTORAGE)
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  updateTags(view: OtherDevicesViewData) {
    this.inputView = view;
    this.tagsForm = this.otherDevicesService.createTagsForm(view.tags);
    this.tagsFormErrors = this.otherDevicesService.resetTagsFormErrors();
    this.tagsFormValidationMessages = this.otherDevicesService.tagsFormValidationMessages;
    this.tagsFormModelRef = this.modalService.show(this.tagsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  submitTags() {
    this.spinnerService.start('main');
    this.tagsFormModelRef.hide();
    this.otherDevicesService.updateTags(<{ tags: string[] }>this.tagsForm.getRawValue(), this.inputView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getDevices();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Tags updated successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Failed to update tags. Please try again later.'));
    });
  }

  addDevice() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editDevice(view: OtherDevicesViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.OTHER_DEVICES }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'edit'], { relativeTo: this.route });
  }

  deleteDevice(view: OtherDevicesViewData) {
    this.deviceId = view.deviceId;
    this.modalRef = this.modalService.show(this.deleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.otherDevicesService.delete(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getCustomDevicesSummaryData();
      this.getDevices();
      this.spinnerService.stop('main');
    }, err => {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.otherDevicesService.deleteMultipleDevices(this.selectedDeviceIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedDeviceIds = [];
      // this.selectedAll = false;
      this.getCustomDevicesSummaryData();
      this.getDevices();
      this.notification.success(new Notification('Device Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedDeviceIds = [];
      // this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

  bulkUpdate() {
    this.buildBulkUpdateForm();
    this.modalRef = this.modalService.show(this.bulkUpdateFormModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  buildBulkUpdateForm() {
    this.spinnerService.start('main');
    this.bulkUpdateFormErrors = this.otherDevicesService.resetbulkUpdateFormErrors();
    this.bulkUpdateFormValidationMessages = this.otherDevicesService.bulkUpdateFormValidationMessages;
    this.otherDevicesService.createBulkUpdateForm().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.bulkUpdateForm = res;
      this.spinnerService.stop('main');
    }, err => {
      this.bulkUpdateForm = null;
      this.spinnerService.stop('main');
    });
  }

  onUpdate() {
    if (this.bulkUpdateForm.invalid) {
      this.bulkUpdateFormErrors = this.utilService.validateForm(this.bulkUpdateForm, this.bulkUpdateFormValidationMessages, this.bulkUpdateFormErrors);
      this.bulkUpdateForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.bulkUpdateFormErrors = this.utilService.validateForm(this.bulkUpdateForm, this.bulkUpdateFormValidationMessages, this.bulkUpdateFormErrors);
        });
    } else {
      let obj = Object.assign({}, this.bulkUpdateForm.getRawValue());
      obj.polling_interval_min = obj.polling_interval_min || 0;
      obj.polling_interval_sec = obj.polling_interval_sec || 0;
      obj.uuids = [...this.selectedDeviceIds];
      this.spinnerService.start('main');
      this.otherDevicesService.update(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.selectedDeviceIds = [];
        // this.selectedAll = false;
        this.getCustomDevicesSummaryData();
        this.getDevices();
        this.modalRef.hide();
        this.notification.success(new Notification('Devices updated successfully.'));
      }, (err: HttpErrorResponse) => {
        // this.handleError(err.error);
        this.viewData.forEach(view => {
          view.isSelected = false;
        });
        this.selectedDeviceIds = [];
        // this.selectedAll = false;
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      });
    }
  }

  select(view: OtherDevicesViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedDeviceIds.splice(this.selectedDeviceIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedDeviceIds.push(view.deviceId);
    }
    // this.selectedAll = this.selectedDeviceIds.length == this.viewData.length;
  }

  // selectAll() {
  //   if (!this.viewData.length) {
  //     this.selectedAll = false;
  //     return;
  //   }

  //   this.selectedAll = !this.selectedAll;
  //   if (this.selectedAll) {
  //     this.viewData.forEach(view => {
  //       view.isSelected = true;
  //       this.selectedDeviceIds.push(view.deviceId);
  //     });
  //   } else {
  //     this.viewData.forEach(view => {
  //       view.isSelected = false;
  //     });
  //     this.selectedDeviceIds = [];
  //   }
  // }

  openRow(view: OtherDevicesViewData) {
    this.viewData.forEach(data => {
      if (data != view)
        data.isOpen = false;
    });
    view.isOpen = !view.isOpen;
  }

  goBack() {
    this.router.navigate(['../', 'otherdevices'], { relativeTo: this.route });
  }
}