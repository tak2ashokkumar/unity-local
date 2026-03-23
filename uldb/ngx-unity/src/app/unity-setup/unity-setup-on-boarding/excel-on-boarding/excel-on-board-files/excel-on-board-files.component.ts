import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardFilesService, ExcelOnboardingFilesViewdata } from './excel-on-board-files.service';

@Component({
  selector: 'excel-on-board-files',
  templateUrl: './excel-on-board-files.component.html',
  styleUrls: ['./excel-on-board-files.component.scss'],
  providers: [ExcelOnBoardFilesService]
})
export class ExcelOnBoardFilesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnboardingFilesViewdata[] = [];
  excelFilePath: string;
  fileToUpload: File = null;
  invalidFileSize: string = null;
  indexToDelete: number;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  nextDisabled: boolean = true;
  selectedAll: boolean = false;

  constructor(private nxtPrvSvc: ExcelOnBoardingNextPrevService,
    private filesSvc: ExcelOnBoardFilesService,
    private notification: AppNotificationService,
    private storage: StorageService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,) {
    this.nxtPrvSvc.excelSaveCurrentAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.nxtPrvSvc.continueNextPrev();
    });
  }

  ngOnInit() {
    this.getFiles();
    this.getExcelFilePath();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private setSelected() {
    if (!this.viewData.length) {
      this.storage.removeByKey('fileId', StorageType.SESSIONSTORAGE);
      this.selectedAll = false;
    }
    let fileIds = <string[]>this.storage.getByKey('fileId', StorageType.SESSIONSTORAGE);

    if (!fileIds || fileIds.length == 0) {
      this.nextDisabled = true;
    } else {
      this.nextDisabled = false;
    }

    if (fileIds && fileIds.length) {
      this.viewData.forEach(view => {
        view.isSelected = fileIds.includes(view.uuid) ? true : false;
      });
      this.selectedAll = fileIds.length == this.viewData.length;
    }
  }

  getFiles() {
    this.spinner.start('main');
    this.filesSvc.getFiles().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.filesSvc.convertToViewdata(res.results);
      this.setSelected();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  getExcelFilePath() {
    this.filesSvc.getExcelOnboardingFile().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.excelFilePath = res.file_path;
    }, err => {
    });
  }

  onFileDropped($event: FileList) {
    this.detectFiles($event);
  }

  detectFiles(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
    this.validateFileSize();
  }

  removeFile() {
    this.fileToUpload = null;
  }

  formatBytes(bytes: number, decimals: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  validateFileSize() {
    const size = this.fileToUpload.size / 1000000;
    if (size > 1) {
      this.invalidFileSize = `File too large (Uploaded ${size}MB : Max allowed 1MB)`;
      return;
    }
    this.invalidFileSize = null;
  }

  uploadFile() {
    if (this.invalidFileSize) {
      return;
    }
    this.spinner.start('main');
    this.filesSvc.uploadFile(this.fileToUpload, 'onboarding_file').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.fileToUpload = null;
      this.getFiles();
      this.notification.success(new Notification('All the assets have been successfully added.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error occured while adding devices. Please check the excel file for details.'));
    });
  }

  deleteFile(index: number) {
    this.indexToDelete = index;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.filesSvc.deleteFile(this.viewData[this.indexToDelete].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.getFiles();
      this.notification.success(new Notification('File deleted successfully.'));
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.notification.error(new Notification('File could not be deleted!!'));
    });
  }

  selectAll() {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }

    this.selectedAll = !this.selectedAll;
    let fileIds = [];
    if (this.selectedAll) {
      this.viewData.forEach(view => {
        view.isSelected = true;
        fileIds.push(view.uuid);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      fileIds = [];
    }
    this.nextDisabled = fileIds.length == 0;
    this.storage.put('fileId', fileIds, StorageType.SESSIONSTORAGE);
  }

  select(view: ExcelOnboardingFilesViewdata) {
    view.isSelected = !view.isSelected;
    let fileIds = <string[]>this.storage.getByKey('fileId', StorageType.SESSIONSTORAGE);
    if (fileIds == null) {
      fileIds = [];
    }
    if (!fileIds.length) {
      fileIds = [view.uuid];
    } else {
      if (!view.isSelected) {
        fileIds.splice(fileIds.indexOf(view.uuid), 1);
      } else {
        fileIds.push(view.uuid);
      }
    }
    this.selectedAll = fileIds.length == this.viewData.length;
    this.nextDisabled = fileIds.length == 0;
    this.storage.put('fileId', fileIds, StorageType.SESSIONSTORAGE);
  }

  downloadTemplateFile() {
    if(!this.excelFilePath){
      return;
    }
    let ele = document.getElementById('file-downloader');
    ele.setAttribute('href', this.excelFilePath);
    ele.click();
  }

  downloadFile(index: number) {
    let ele = document.getElementById('file-downloader');
    ele.setAttribute('href', this.viewData[index].filePath);
    ele.click();
  }

  goNext() {
    if (this.nextDisabled) {
      return;
    }
    this.nxtPrvSvc.saveNextPrev('next');
  }
}
