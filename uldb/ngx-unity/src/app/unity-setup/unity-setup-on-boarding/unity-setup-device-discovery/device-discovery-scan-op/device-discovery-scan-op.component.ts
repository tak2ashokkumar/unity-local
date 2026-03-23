import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DeviceDiscoveryScanOpService, DeviceDiscoveryScanOpViewdata } from './device-discovery-scan-op.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DOWNLOAD_SCAN_RESULT } from 'src/app/shared/api-endpoint.const';

@Component({
  selector: 'device-discovery-scan-op',
  templateUrl: './device-discovery-scan-op.component.html',
  styleUrls: ['./device-discovery-scan-op.component.scss'],
  providers: [DeviceDiscoveryScanOpService]
})
export class DeviceDiscoveryScanOpComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  viewData: DeviceDiscoveryScanOpViewdata[] = [];
  count: number = 0;
  @ViewChild('confirmchange') confirmchange: ElementRef;
  confirmChangeModalRef: BsModalRef;
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  private selectedIndex: number;
  private selectedType: string;
  downloadScanResultUrl: string = DOWNLOAD_SCAN_RESULT();
  constructor(private scanOpService: DeviceDiscoveryScanOpService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getScanOp();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getScanOp() {
    this.scanOpService.getDeviceDiscoveryScanOp().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.scanOpService.convertToViewData(res);
      this.count = this.viewData.length;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  onDeviceTypeChange(type: string, i: number) {
    this.selectedIndex = i;
    this.selectedType = type;
    const obj = { unique_id: this.viewData[this.selectedIndex].uniqueId, device_type: this.selectedType };
    this.scanOpService.updateDeviceType(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[this.selectedIndex].deviceType = this.selectedType;
      // this.confirmChangeModalRef.hide();
    }, err => {

    });
    // this.confirmChangeModalRef = this.modalService.show(this.confirmchange, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeviceTypeChange() {
    const obj = { unique_id: this.viewData[this.selectedIndex].uniqueId, device_type: this.selectedType };
    this.scanOpService.updateDeviceType(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[this.selectedIndex].deviceType = this.selectedType;
      this.confirmChangeModalRef.hide();
    }, err => {

    });
  }

  cancelDeviceTypeChange() {
    this.viewData[this.selectedIndex].deviceType = this.viewData[this.selectedIndex].lastType;
    this.confirmChangeModalRef.hide();
  }

  onScanOpDelete(index: number) {
    this.selectedIndex = index;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.scanOpService.deleteDevice(this.viewData[this.selectedIndex].uniqueId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getScanOp();
      this.confirmModalRef.hide();
      this.notificationService.success(new Notification('Device deleted successfully.'));
    }, err => {
      this.confirmModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }
}