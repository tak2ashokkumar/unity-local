import { Component, Input, OnInit } from '@angular/core';
import { DevicesFileUploadService } from './devices-file-upload.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { DeviceMapping } from '../app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'devices-file-upload',
  templateUrl: './devices-file-upload.component.html',
  styleUrls: ['./devices-file-upload.component.scss'],
  providers: [DevicesFileUploadService]
})
export class DevicesFileUploadComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  @Input("deviceType") deviceType: string;
  @Input("uuids") uuids: string[];
  fileToUpload: File = null;
  invalidFileSize: string = null;

  constructor(private svc: DevicesFileUploadService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
  }

  downlaodCSV(number: number) {
    const selectedUUIDs = number === 1 ? this.uuids : null;
    this.svc.downloadCSV(this.deviceType, selectedUUIDs).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const path  = `/customer/onboard_excel_data/download_bulk_upload_file/?file_path=${res.file_path}`
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', path);
      ele.click();
    }, err => {
      this.notification.error(new Notification('Error while downloading the excel file.'));
    });
  }

  detectFiles(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
    // this.validateFileSize();
  }

  removeFile() {
    this.fileToUpload = null;
  }

  // formatBytes(bytes: number, decimals: number) {
  //   if (bytes === 0) {
  //     return '0 Bytes';
  //   }
  //   const k = 1024;
  //   const dm = decimals <= 0 ? 0 : decimals || 2;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  // }

  // validateFileSize() {
  //   const size = this.fileToUpload.size / 1000000;
  //   if (size > 1) {
  //     this.invalidFileSize = `File too large (Uploaded ${size}MB : Max allowed 1MB)`;
  //     return;
  //   }
  //   this.invalidFileSize = null;
  // }

  uploadFile() {
    if (!this.fileToUpload) {
      return;
    }
    this.spinnerService.start('main');
    this.svc.uploadFile(this.fileToUpload, this.deviceType, 'device_bulkupdate_file').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.fileToUpload = null;
      this.notification.success(new Notification('Device details has been successfully updated.'));
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error occured while updating devices. Please check the excel file.'));
    });
  }
}
