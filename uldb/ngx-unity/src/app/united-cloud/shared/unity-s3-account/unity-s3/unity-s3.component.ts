import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { UnityS3Service, ULS3ViewData } from './unity-s3.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject, interval } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { tap, switchMap, takeWhile, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { FileSizePipe } from 'src/app/app-filters/pipes';
import { TaskError } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'unity-s3',
  templateUrl: './unity-s3.component.html',
  styleUrls: ['./unity-s3.component.scss'],
  providers: [UnityS3Service, FileSizePipe]
})
export class UnityS3Component implements OnInit, OnDestroy {
  accountId: string;
  accountAccessKey: string;
  viewData: ULS3ViewData[] = [];
  filteredViewData: ULS3ViewData[] = [];
  pagedviewData: ULS3ViewData[] = [];
  bucketName: string;
  bucketUUID: string;
  regions: Region[] = [];
  currentCriteria: SearchCriteria;
  poll: boolean = false;
  syncInProgress: boolean = false;
  fieldsToFilterOn: string[] = ['bucketName'];

  private ngUnsubscribe = new Subject();

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('deleteBucketTemplate') deleteBucketTemplate: ElementRef;
  authFormErrors: any;
  authFormValidationMessages: any;
  authForm: FormGroup;
  deleteBucketModalRef: BsModalRef;
  nonFieldErr: string = '';

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  createFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;

  @ViewChild('uploadFile') uploadFile: ElementRef;
  uploadFileModalRef: BsModalRef;
  fileToUpload: File = null;

  @ViewChild('fileList') fileList: ElementRef;
  filesUploadedModalRef: BsModalRef;
  filesUploaded: any[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private s3Service: UnityS3Service,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
    });
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getS3Buckets()
      });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getS3Buckets();
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
    this.getS3Buckets();
  }

  private convert(data: AWSS3[]) {
    this.viewData = this.s3Service.convertToViewData(data);
    this.filterAndPage();
  }

  getS3Buckets() {
    if (this.syncInProgress) {
      this.spinner.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.s3Service.getBuckets(this.accountId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status.result) {
          this.accountAccessKey = status.result.access_key;
          this.convert(status.result.data);
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



  createBucket() {
    this.createFormErrors = this.s3Service.resetFormErrors();
    this.createValidationMessages = this.s3Service.validationMessages;
    this.createForm = this.s3Service.createForm();
    this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmCreate() {
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors); });
    } else {
      this.createModalRef.hide();
      this.spinner.start('main');
      const data = this.createForm.getRawValue();
      this.syncInProgress = true;
      this.s3Service.createBucket(this.accountId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.notificationService.success(new Notification('S3 Bucket created successfully'));
        this.spinner.stop('main');
        if (status.result) {
          this.convert(status.result.data);
        }
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: HttpErrorResponse) => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        if (err.message.includes('BucketAlreadyExists')) {
          this.notificationService.error(new Notification('The requested bucket name is not available, Please select a different name and try again!!'));
        } else {
          this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.spinner.stop('main');
      });
    }
  }

  uploadFiletoS3(view: ULS3ViewData) {
    this.fileToUpload = null;
    this.bucketName = view.bucketName;
    this.bucketUUID = view.uuid;
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
    this.s3Service.uploadFileToS3(this.accountId, this.bucketName, this.bucketUUID, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notificationService.success(new Notification('File uploaded to S3 bucket'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to upload File to S3 bucket. Please try again later.'));
    });
  }

  getFileUploadHistory(view: ULS3ViewData) {
    this.filesUploaded = [];
    this.spinner.start('main');
    this.s3Service.getFileUploadHistory(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.filesUploaded = this.s3Service.convertFileHistoryViewData(data.results);
      this.spinner.stop('main');
      this.filesUploadedModalRef = this.modalService.show(this.fileList, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to list uploaded files. Please try again later.'))
    })
  }

  deleteBucket(bucketId: string) {
    this.nonFieldErr = '';
    this.authFormErrors = this.s3Service.resetFormErrors();
    this.authFormValidationMessages = this.s3Service.validationMessages;
    this.authForm = this.s3Service.createAuthForm(bucketId, this.accountAccessKey);
    this.deleteBucketModalRef = this.modalService.show(this.deleteBucketTemplate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
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
      if (error.message.includes('(BucketNotEmpty)')) {
        this.notificationService.error(new Notification('Bucket deletion failed as only empty buckets can be deleted!!'));
      } else {
        this.notificationService.error(new Notification('Bucket could not be deleted!!'));
      }
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
      this.s3Service.deleteBucket(this.accountId, this.authForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.spinner.stop('main');
        this.deleteBucketModalRef.hide();
        if (status.result) {
          this.convert(status.result.data);
        }
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.notificationService.success(new Notification('Bucket deleted successfully'));
      }, err => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.handleError(err);
      });
    }
  }

  goToInventory(view: ULS3ViewData) {
    this.router.navigate([view.uuid, 'files'], { relativeTo: this.route });
  }
}