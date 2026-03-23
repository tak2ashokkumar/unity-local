import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UsiImportDataCrudService } from './usi-import-data-crud/usi-import-data-crud.service';
import { AwsCo2ViewData, UsiImportDataService } from './usi-import-data.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'usi-import-data',
  templateUrl: './usi-import-data.component.html',
  styleUrls: ['./usi-import-data.component.scss'],
  providers: [UsiImportDataService]
})

export class UsiImportDataComponent implements OnInit {

  public tabItems: TabData[] = [{
    name: 'Import Data',
    url: '/setup/integration/import-data'
  }];

  private ngUnsubscribe = new Subject();

  @ViewChild('confirm') confirm: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  currentCriteria: SearchCriteria;
  indexToDelete: number;
  count: number;
  viewData: AwsCo2ViewData[] = [];

  constructor(private usiImportDataSvc: UsiImportDataService,
    private spinnerService: AppSpinnerService,
    public userService: UserInfoService,
    private usiImportDataCrudSvc: UsiImportDataCrudService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getSustanabilityData();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSustanabilityData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSustanabilityData();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSustanabilityData();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSustanabilityData();
  }

  getSustanabilityData() {
    this.usiImportDataSvc.getSustanabilityData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.usiImportDataSvc.convertToListData(data.results);
      this.count = data.count;
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  downloadFile(index: number) {
    let ele = document.getElementById('file-downloader');
    ele.setAttribute('href', this.viewData[index].filePath);
    ele.click();
  }

  deleteFile(index: number) {
    this.indexToDelete = index;
    this.confirmDeleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.usiImportDataSvc.delete(this.viewData[this.indexToDelete].id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.getSustanabilityData();
      this.notification.success(new Notification('File deleted successfully.'));
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.notification.error(new Notification('File could not be deleted!!'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}