import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { OnBoardAssetsService, OnboardCustomerVCenterViewData } from '../on-board-assets.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OnboaringCustomerVCenter } from '../customer-vcenter.type';

@Component({
  selector: 'devices-boarding',
  templateUrl: './devices-boarding.component.html',
  styleUrls: ['./devices-boarding.component.scss'],
  providers: [OnBoardAssetsService]
})
export class DevicesBoardingComponent implements OnInit, OnDestroy {
  @Output() emitToParent: EventEmitter<string> = new EventEmitter<string>();
  excelFilePath: string;
  assetsDownloadPath: string = '/customer/assets_download/';
  private ngUnsubscribe = new Subject();
  fileToUpload: File = null;
  invalidFileSize: string = null;
  viewData: OnboardCustomerVCenterViewData[] = [];
  vCenters: OnboaringCustomerVCenter[] = [];
  updatingVCenters: boolean = false;

  @ViewChild('vcenter') vcenter: ElementRef;
  vcenterModalRef: BsModalRef;

  constructor(private assetService: OnBoardAssetsService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.getExcelFilePath();
    this.getCustomerVCenters();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getExcelFilePath() {
    this.assetService.getExcelOnboardingFile().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.excelFilePath = res.file_path;
    }, err => {
    });
  }

  getCustomerVCenters() {
    this.assetService.getCustomerVCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vCenters = res.results;
    }, err => {

    });
  }

  validateFileSize() {
    const size = this.fileToUpload.size / 1000000;
    if (size > 1) {
      this.invalidFileSize = `File too large (Uploaded ${size}MB : Max allowed 1MB)`;
      return;
    }
    this.invalidFileSize = null;
  }

  detectFiles(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
    this.validateFileSize();
  }

  uploadFile() {
    this.spinner.start('main');
    this.assetService.uploadFile(this.fileToUpload, 'onboarding_file').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.emitToParent.emit();
      this.spinner.stop('main');
      this.notification.success(new Notification('All the assets have been successfully added.'));
    }, err => {
      this.spinner.stop('main');
      this.emitToParent.emit();
      this.notification.error(new Notification('Error occured while adding devices. Please check the excel file for details.'));
    });
  }

  updateVCenter() {
    this.viewData = this.assetService.convertToVCenterViewData(this.vCenters);
    this.updatingVCenters = false;
    this.vcenterModalRef = this.modalService.show(this.vcenter, Object.assign({}, { class: 'modal-lg second', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
  }

  private validateVCenter() {
    let valid = true;
    for (let i = 0; i < this.viewData.length; i++) {
      let vcenter = this.viewData[i];
      if (!vcenter.password) {
        vcenter.message = 'Please enter password';
        valid = false;
      } else {
        vcenter.message = '';
      }
    }
    return valid;
  }

  updatePassword() {
    if (!this.viewData.length) {
      return;
    }

    if (this.validateVCenter()) {
      this.updatingVCenters = true;
      this.assetService.updateVCenter(this.viewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        for (let i = 0; i < this.viewData.length; i++) {
          let element = this.viewData[i];
          if (element.id in res.errors) {
            element.message = res.errors[element.id];
            element.icon = 'fa-times text-danger';
          }
          if (element.id in res.success) {
            element.message = res.success[element.id];
            element.icon = 'fa-check text-success';
          }
        }
        this.updatingVCenters = false;
      }, err => {
        this.notification.error(new Notification(err.error.detail));
        // this.notification.error(new Notification('Something went wrong. Please try again!!'));
        this.vcenterModalRef.hide();
        this.updatingVCenters = false;
      });
    }
  }
}
