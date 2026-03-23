import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { PublicCloudOciStorageServicesService, PublicCloudOciBucketsView } from './public-cloud-oci-storage-services.service';
import { Subject } from 'rxjs';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'public-cloud-oci-storage-services',
  templateUrl: './public-cloud-oci-storage-services.component.html',
  styleUrls: ['./public-cloud-oci-storage-services.component.scss'],
  providers: [PublicCloudOciStorageServicesService]
})
export class PublicCloudOciStorageServicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  accountId: string;
  count: number = 0;
  viewData: PublicCloudOciBucketsView[] = [];
  filteredviewData: PublicCloudOciBucketsView[] = [];
  fieldsToFilterOn: string[] = ['name', 'namespace'];
  pagedviewData: PublicCloudOciBucketsView[] = [];
  selcetedView: PublicCloudOciBucketsView;
  currentCriteria: SearchCriteria;

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  createFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('uploadFile') uploadFile: ElementRef;
  uploadFileModalRef: BsModalRef;
  fileToUpload: File = null;

  @ViewChild('fileList') fileList: ElementRef;
  filesUploadedModalRef: BsModalRef;
  filesUploaded: any[] = [];

  constructor(private bucketService: PublicCloudOciStorageServicesService,
    private route: ActivatedRoute,
    private router: Router,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private spinnerService: AppSpinnerService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.getBuckets();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredviewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredviewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredviewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredviewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getBuckets();
  }

  getBuckets() {
    this.spinnerService.start('main');
    this.bucketService.getBuckets(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.length;
      this.viewData = this.bucketService.convertToViewData(data);
      this.filterAndPage();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  createBucket() {
    this.createFormErrors = this.bucketService.resetFormErrors();
    this.createValidationMessages = this.bucketService.validationMessages;
    this.createForm = this.bucketService.createForm();
    this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmCreate() {
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors); });
    } else {
      this.createModalRef.hide();
      this.spinnerService.start('main');
      this.bucketService.createBucket(this.accountId, this.createForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.getBuckets();
        this.notificationService.success(new Notification('Bucket created successfully'));
        this.spinnerService.stop('main');
      }, (err: HttpErrorResponse) => {
        if (err.error.error == 'BucketAlreadyExists') {
          this.notificationService.error(new Notification('The requested bucket name is not available, Please select a different name and try again!!'));
        } else if (err.error.error == 'InvalidBucketName') {
          this.notificationService.error(new Notification('Bucket name should contain only letters, numbers, dashes and underscores'));
        } else {
          this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.spinnerService.stop('main');
      });
    }
  }

  deleteBucket(view: PublicCloudOciBucketsView) {
    this.selcetedView = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinnerService.start('main');
    this.bucketService.deleteBucket(this.accountId, this.selcetedView.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.getBuckets();
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('Bucket deleted successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      if (err.error.error == 'BucketNotEmpty') {
        this.notificationService.error(new Notification('Bucket deletion failed as only empty buckets can be deleted!!'));
      } else {
        this.notificationService.error(new Notification('Bucket could not be deleted!!'));
      }
    });
  }

  uploadFileToBucket(view: PublicCloudOciBucketsView) {
    this.fileToUpload = null;
    this.selcetedView = view;
    this.uploadFileModalRef = this.modalService.show(this.uploadFile, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  detectFileChange(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
  }

  confirmUploadFile() {
    this.spinnerService.start('main');
    this.uploadFileModalRef.hide();
    this.bucketService.uploadFileToBucket(this.accountId, this.selcetedView.name, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('File uploaded to bucket'));
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Failed to upload File to bucket. Please try again later.'));
    })
  }

  goToInventory(view: PublicCloudOciBucketsView) {
    this.router.navigate([view.name, 'files'], { relativeTo: this.route });
  }



}
