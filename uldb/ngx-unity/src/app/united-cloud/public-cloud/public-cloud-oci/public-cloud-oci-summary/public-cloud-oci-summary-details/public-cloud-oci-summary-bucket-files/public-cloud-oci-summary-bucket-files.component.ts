import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PublicCloudOCIBucketFileView, PublicCloudOciSummaryBucketFileService } from './public-cloud-oci-summary-bucket-file.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'public-cloud-oci-summary-bucket-files',
  templateUrl: './public-cloud-oci-summary-bucket-files.component.html',
  styleUrls: ['./public-cloud-oci-summary-bucket-files.component.scss'],
  providers: [PublicCloudOciSummaryBucketFileService]
})
export class PublicCloudOciSummaryBucketFilesComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  accountId: string;
  bucketName: string;
  count: number = 0;

  viewData: PublicCloudOCIBucketFileView[] = [];
  filteredViewData: PublicCloudOCIBucketFileView[] = [];
  fieldsToFilterOn: string[] = ['fileName'];
  pagedViewData: PublicCloudOCIBucketFileView[] = [];
  selcetedView: PublicCloudOCIBucketFileView;
  currentCriteria: SearchCriteria;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('uploadFile') uploadFile: ElementRef;
  uploadFileModalRef: BsModalRef;
  fileToUpload: File = null;

  constructor(private fileService: PublicCloudOciSummaryBucketFileService,
    private route: ActivatedRoute,
    private router: Router,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private spinnerService: AppSpinnerService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.bucketName = params.get('bucketName');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.getFiles();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedViewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedViewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedViewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getFiles();
  }

  getFiles() {
    this.spinnerService.start('main');
    this.fileService.getBucketfiles(this.accountId, this.bucketName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.length;
      this.viewData = this.fileService.convertToViewData(data);
      this.filterAndPage();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
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

  confirmUploadFile() {
    this.spinnerService.start('main');
    this.uploadFileModalRef.hide();
    this.fileService.uploadFileToBucket(this.accountId, this.bucketName, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getFiles();
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('File uploaded to bucket'));
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Failed to upload File to bucket. Please try again later.'));
    })
  }

  deleteFile(view: any) {
    this.selcetedView = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinnerService.start('main');
    this.fileService.deleteFile(this.accountId, this.bucketName, this.selcetedView.fileName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.getFiles();
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('File deleted successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
    });
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

}
