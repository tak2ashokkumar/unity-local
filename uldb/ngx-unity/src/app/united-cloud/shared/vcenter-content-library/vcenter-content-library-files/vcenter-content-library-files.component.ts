import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, of, throwError } from 'rxjs';
import { catchError, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { VcenterContentLibraryChunkType, VcenterContentLibraryFilesService, VcenterContentLibraryFileViewdata } from './vcenter-content-library-files.service';

@Component({
  selector: 'vcenter-content-library-files',
  templateUrl: './vcenter-content-library-files.component.html',
  styleUrls: ['./vcenter-content-library-files.component.scss'],
  providers: [VcenterContentLibraryFilesService]
})
export class VcenterContentLibraryFilesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  libId: string;
  currentCriteria: SearchCriteria;
  viewData: VcenterContentLibraryFileViewdata[] = [];
  filteredViewData: VcenterContentLibraryFileViewdata[] = [];
  pagedviewData: VcenterContentLibraryFileViewdata[] = [];
  fieldsToFilterOn: string[] = ['name'];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  selectedFile: VcenterContentLibraryFileViewdata;

  nonFieldErr: string = '';
  @ViewChild('uploadFormRef') uploadFormRef: ElementRef;
  uploadModalRef: BsModalRef;
  uploadForm: FormGroup;
  uploadFormErrors: any;
  uploadFormValidationMessages: any;
  fileToUpload: File = null;
  maxFileSize: number = 1073741824; //1 GB
  chunkSize: number = 104857600; //100 MB
  // maxFileSize: number = 40;
  // chunkSize: number = 40;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private appService: AppLevelService,
    private fileSvc: VcenterContentLibraryFilesService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {
    this.route.parent.parent.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
      this.pcId = params.get('pcId');
      this.libId = params.get('libId');
    });
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.libId = params.get('libId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getFiles();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getFiles();
  }

  getFiles() {
    this.fileSvc.getFiles(this.pcId, this.libId).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.viewData = this.fileSvc.convertToViewdata(res.result.data);
      this.filterAndPage();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching files. Please try again!!'));
    });
    this.viewData = [];
  }

  deteleFile(view: VcenterContentLibraryFileViewdata) {
    this.selectedFile = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteFile() {
    this.fileSvc.deleteFiles(this.pcId, this.libId, this.selectedFile.fileId).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      this.confirmDeleteModalRef.hide();
      this.notification.success(new Notification('File is being deleted.'));
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('File deleted successfully. Latest files are being fetched Please wait'));
      this.getFiles();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification(err.error.detail));
      // this.notification.error(new Notification('Error while deleting files. Please try again!!'));
    });
  }

  goToSummary() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  uploadFile() {
    this.uploadForm = this.fileSvc.createForm();
    this.uploadFormErrors = this.fileSvc.resetfileFormErrors();
    this.uploadFormValidationMessages = this.fileSvc.fileValidationMessages;
    this.uploadModalRef = this.modalService.show(this.uploadFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  detectFileChange(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
    this.uploadForm.get('item').setValue(this.fileToUpload.name);
  }

  handleError(err: any) {
    this.uploadFormErrors = this.fileSvc.resetfileFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.uploadForm.controls) {
          this.uploadFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.uploadModalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmUploadFile() {
    if (this.uploadForm.invalid) {
      this.uploadFormErrors = this.utilService.validateForm(this.uploadForm, this.uploadFormValidationMessages, this.uploadFormErrors);
      this.uploadForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.uploadFormErrors = this.utilService.validateForm(this.uploadForm, this.uploadFormValidationMessages, this.uploadFormErrors); });
    } else {
      if (this.fileToUpload.size > this.maxFileSize) {
        this.saveFileInChunks(this.fileToUpload);
      } else {
        this.saveFile();
      }
    }
  }

  saveFile() {
    this.spinner.start('main');
    const formData = new FormData();
    formData.append('file_name', this.uploadForm.get('item_name').value);
    formData.append('file', this.fileToUpload);
    formData.append('library_id', this.libId);
    formData.append('item_type', this.fileToUpload.name.split('.').pop());
    this.fileSvc.saveFile(this.pcId, formData).pipe(catchError((e: HttpErrorResponse) => {
      this.spinner.stop('main');
      return throwError(e);
    }), switchMap(res => {
      this.uploadModalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('File is being uploaded.'));
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('File uploaded successfully. Latest files are being fetched Please wait'));
      if (res.result.data) {
        this.getFiles();
      }
    }, err => {
      this.spinner.stop('main');
      if (err instanceof Error) {
        this.notification.error(new Notification(err.message));
      } else {
        // this.notification.error(new Notification('Failed to upload File. Please try again later.'));
        this.notification.error(new Notification(err.error.detail));
      }
    });
  }

  saveFileInChunks(file: File) {
    this.spinner.start('main');
    const formData = new FormData();
    formData.append('file_name', this.uploadForm.get('item_name').value);
    formData.append('library_id', this.libId);
    this.fileSvc.saveFileInChunks(file, this.chunkSize, formData).then(res => {
      if (res && res.upload_id) {
        this.saveLargeFile(res);
      } else {
        this.notification.error(new Notification(`Failed to upload file ${file.name} with size ${file.size} to content library. Please tryagain later.`));
      }
    }).catch(() => {
      this.uploadModalRef.hide();
      this.notification.error(new Notification(`Failed to upload file ${file.name} with size ${file.size} to content library. Please tryagain later.`));
      this.spinner.stop('main');
    });

    setTimeout(() => {
      this.uploadModalRef.hide();
      this.notification.success(new Notification('File is being uploaded.'));
      this.spinner.stop('main');
    }, 1000);
  }

  async uploadFileInChunks(file: File) {
    this.spinner.start('main');
    const formData = new FormData();
    formData.append('file_name', this.uploadForm.get('item_name').value);
    formData.append('library_id', this.libId);
    let apiResponse: VcenterContentLibraryChunkType;
    for (let start = 0; start < file.size; start += this.chunkSize) {
      const chunkEnd = Math.min(start + this.chunkSize, file.size);
      const chunk: Blob = file.slice(start, chunkEnd);
      formData.set('file', chunk, file.name);
      formData.set('offset', (chunkEnd).toString());
      formData.set('contentRange', `bytes ${start}-${chunkEnd - 1}/${file.size}`);
      if (start > 0) {
        if (start == this.chunkSize) {
          this.uploadModalRef.hide();
          this.notification.success(new Notification('File is being uploaded.'));
          this.spinner.stop('main');
        }
        formData.set('upload_id', apiResponse.upload_id);
      }
      apiResponse = await this.fileSvc.uploadFileInChunks(formData).pipe(tap(apiResponse = null), takeUntil(this.ngUnsubscribe), catchError((e: HttpErrorResponse) => {
        this.uploadModalRef.hide();
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to upload file. Please tryagain later.'));
        return of(null);
      })).toPromise();

      if (!apiResponse || (apiResponse && !apiResponse.upload_id)) {
        break;
      }
    }
    this.saveLargeFile(apiResponse);
  }

  saveLargeFile(chunkUploadResponse: VcenterContentLibraryChunkType) {
    this.fileSvc.saveLargeFile(this.pcId, chunkUploadResponse.upload_id, this.libId, this.uploadForm.get('item_name').value, this.fileToUpload.name).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      this.uploadModalRef.hide();
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1)).subscribe(res => {
      this.notification.success(new Notification('File uploaded successfully. Latest files are being fetched Please wait.'));
      if (res.result.data) {
        this.getFiles();
      }
    }, err => {
      if (err instanceof Error) {
        this.notification.error(new Notification(err.message));
      } else {
        this.notification.error(new Notification(err.error.detail));
        // this.notification.error(new Notification('Failed to upload File. Please try again later.'));
      }
    });
  }
}