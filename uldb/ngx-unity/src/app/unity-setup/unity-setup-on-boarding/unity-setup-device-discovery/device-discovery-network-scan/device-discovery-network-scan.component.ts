import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DeviceDiscoveryNetworkScanService, DeviceDiscoveryNetworkScanViewdata, NetworkScanStatus } from './device-discovery-network-scan.service';
import { Subject, timer } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FormGroup } from '@angular/forms';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil, switchMap, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'device-discovery-network-scan',
  templateUrl: './device-discovery-network-scan.component.html',
  styleUrls: ['./device-discovery-network-scan.component.scss'],
  providers: [DeviceDiscoveryNetworkScanService]
})
export class DeviceDiscoveryNetworkScanComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private nwScanStop = new Subject();

  scanForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('confirmCancelRef') confirmCancelRef: ElementRef;
  confirmModalRef: BsModalRef;
  viewData: DeviceDiscoveryNetworkScanViewdata[] = [];
  selectedScan: DeviceDiscoveryNetworkScanViewdata;

  constructor(private nwScanSvc: DeviceDiscoveryNetworkScanService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {

  }

  ngOnInit() {
    this.buildForm();
    this.getnwScan();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.destroyNetworkScan();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  destroyNetworkScan() {
    this.nwScanStop.next();
    this.nwScanStop.complete();
  }

  refreshData($event: number) {
    this.getnwScan();
  }

  getnwScan() {
    this.spinner.start('main');
    this.destroyNetworkScan();
    timer(0, 300000).pipe(switchMap(() => this.nwScanSvc.getnwScan()), retry(), takeUntil(this.nwScanStop)).subscribe(res => {
      this.viewData = this.nwScanSvc.convertToViewData(res);
      this.spinner.stop('main');

      if (!this.viewData.filter(nw => nw.scanStatus == NetworkScanStatus.IN_PROGRESS).length) {
        this.destroyNetworkScan();
      }
    }, err => {
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.scanForm = this.nwScanSvc.buildForm();
    this.formErrors = this.nwScanSvc.resetFormErrors();
    this.validationMessages = this.nwScanSvc.validationMessages;
  }

  handleError(err: any) {
    this.formErrors = this.nwScanSvc.resetFormErrors();
    if ('non_field_errors' in err) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.scanForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  startScan() {
    if (this.scanForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.scanForm, this.validationMessages, this.formErrors);
      this.scanForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.scanForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.nwScanSvc.startScan(this.scanForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.notificationService.success(new Notification('Scan initiated successfully.'));
        this.buildForm();
        this.getnwScan();
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        this.spinner.stop('main');
      });
    }
  }

  delete(view: DeviceDiscoveryNetworkScanViewdata) {
    this.selectedScan = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.nwScanSvc.deleteScan(this.selectedScan.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getnwScan();
      this.confirmModalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      this.confirmModalRef.hide();
      this.spinner.stop('main');
    });
  }

  cancel(view: DeviceDiscoveryNetworkScanViewdata) {
    this.selectedScan = view;
    this.confirmModalRef = this.modalService.show(this.confirmCancelRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmCancel() {
    this.spinner.start('main');
    this.nwScanSvc.cancelScan(this.selectedScan.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getnwScan();
      this.confirmModalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      this.confirmModalRef.hide();
      this.spinner.stop('main');
    });
  }


}
