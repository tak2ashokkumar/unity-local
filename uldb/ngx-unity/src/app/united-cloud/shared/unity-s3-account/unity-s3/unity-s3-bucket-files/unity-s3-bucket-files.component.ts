import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject, interval } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { tap, takeWhile, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { UnityS3BucketFilesService, UnityS3BucketFilesViewData } from './unity-s3-bucket-files.service';
import { FileSizePipe } from 'src/app/shared/pipes';
import { ULS3BucketFiles } from '../../ul-s3-type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TaskError } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'unity-s3-bucket-files',
  templateUrl: './unity-s3-bucket-files.component.html',
  styleUrls: ['./unity-s3-bucket-files.component.scss'],
  providers: [UnityS3BucketFilesService, FileSizePipe]
})
export class UnityS3BucketFilesComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  accountId: string;
  bucketId: string;

  viewData: UnityS3BucketFilesViewData[] = [];
  filteredViewData: UnityS3BucketFilesViewData[] = [];
  pagedviewData: UnityS3BucketFilesViewData[] = [];

  currentCriteria: SearchCriteria;
  poll: boolean = false;
  syncInProgress: boolean = false;
  fieldsToFilterOn: string[] = ['fileName'];

  @ViewChild('deleteFileTemplate') deleteFileTemplate: ElementRef;
  authFormErrors: any;
  authFormValidationMessages: any;
  authForm: FormGroup;
  deleteFileModalRef: BsModalRef;
  nonFieldErr: string = '';

  @ViewChild('uploadFile') uploadFile: ElementRef;
  uploadFileModalRef: BsModalRef;
  fileToUpload: File = null;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private s3FileService: UnityS3BucketFilesService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.bucketId = params.get('bucketId');
    });
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getS3BucketFiles()
      });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getS3BucketFiles();
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
    this.getS3BucketFiles();
  }

  private convert(files: ULS3BucketFiles[]) {
    this.viewData = this.s3FileService.convertToViewData(files);
    this.filterAndPage();
  }

  getS3BucketFiles() {
    if (this.syncInProgress) {
      this.spinner.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.s3FileService.getBucketfiles(this.accountId, this.bucketId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        if (data.result) {
          this.convert(data.result.data);
          this.spinner.stop('main');
        }
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.spinner.stop('main');
        this.notificationService.error(new Notification('Error while fetching S3 Buckets'));
      });
  }

  uploadFileToBucket() {
    this.fileToUpload = null;
    this.uploadFileModalRef = this.modalService.show(this.uploadFile, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  detectFileChange(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
  }

  confirmUploadFileToS3() {
    this.spinner.start('main');
    this.uploadFileModalRef.hide();
    this.s3FileService.uploadFileToS3(this.accountId, this.bucketId, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notificationService.success(new Notification('File uploaded to S3 bucket'));
      if (res.result) {
        this.convert(res.result.data);
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to upload File to S3 bucket. Please try again later.'));
    });
  }

  deleteFile(view: UnityS3BucketFilesViewData) {
    this.nonFieldErr = '';
    this.authFormErrors = this.s3FileService.resetFormErrors();
    this.authFormValidationMessages = this.s3FileService.validationMessages;
    this.authForm = this.s3FileService.createForm(view);
    this.deleteFileModalRef = this.modalService.show(this.deleteFileTemplate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  private handleError(error: HttpErrorResponse | TaskError | Error) {
    this.nonFieldErr = '';
    this.spinner.stop('main');
    if (error instanceof HttpErrorResponse) {
      if (!error.error) {
        this.notificationService.error(new Notification('Something went wrong!!. Please tryagain later.'));
        return
      }
      let err = error.error;
      if (err.detail) {
        this.nonFieldErr = err.detail;
      }
    } else if (error instanceof TaskError) {
      this.notificationService.warning(new Notification('Request is taking longer than usual. Please refresh after sometime.'));
    } else {
      this.notificationService.error(new Notification('File could not be deleted!!'));
    }
  }

  confirmDelete() {
    if (this.authForm.invalid) {
      this.authFormErrors = this.utilService.validateForm(this.authForm, this.authFormValidationMessages, this.authFormErrors);
      this.authForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.authFormErrors = this.utilService.validateForm(this.authForm, this.authFormValidationMessages, this.authFormErrors); });
    } else {
      this.spinner.start('main');
      this.syncInProgress = true;
      this.s3FileService.deleteFile(this.accountId, this.bucketId, this.authForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.spinner.stop('main');
        this.deleteFileModalRef.hide();
        if (status.result) {
          this.convert(status.result.data);
        }
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.notificationService.success(new Notification('File deleted successfully'));
      }, err => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.handleError(err);
      });
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
