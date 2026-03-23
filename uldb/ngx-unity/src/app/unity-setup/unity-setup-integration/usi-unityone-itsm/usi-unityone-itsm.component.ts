import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UnityOneITSMView, UsiUnityoneItsmService } from './usi-unityone-itsm.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usi-unityone-itsm',
  templateUrl: './usi-unityone-itsm.component.html',
  styleUrls: ['./usi-unityone-itsm.component.scss'],
  providers: [UsiUnityoneItsmService]
})
export class UsiUnityoneItsmComponent implements OnInit {

  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: UnityOneITSMView[] = [];
  count: number;
  isPageSizeAll: boolean = true;
  @ViewChild('edit') edit: ElementRef;
  editModelRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteModalRef: BsModalRef;
  unityOneItsmId: string;

  constructor(private svc: UsiUnityoneItsmService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getUnityOneITSM();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getUnityOneITSM();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getUnityOneITSM();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getUnityOneITSM();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getUnityOneITSM();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUnityOneITSM();
  }

  getUnityOneITSM() {
    this.svc.getUnityOneITSMData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get UnityOne ITSM Data'));
    });
  }

  createUnityOneITSM() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editUnityOneITSM(view: UnityOneITSMView) {
    this.unityOneItsmId = view.uuid;
    this.editModelRef = this.modalService.show(this.edit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEdit() {
    this.editModelRef.hide();
    this.router.navigate([this.unityOneItsmId, 'edit'], { relativeTo: this.route });
  }

  deleteUnityOneITSM(uuid: string) {
    this.unityOneItsmId = uuid;
    this.deleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  toggleStatus(status: boolean, view: UnityOneITSMView) {
    this.spinner.start('main');
    if (status === true) {
      view['status'] = true;
    } else {
      view['status'] = false;
    }
    this.svc.toggleStatus(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to change status'));
    });
  }

  confirmUnityOneITSMDelete() {
    this.deleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteUnityOneITSM(this.unityOneItsmId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('UnityOne ITSM deleted successfully.'));
      this.getUnityOneITSM();
    }, err => {
      this.notification.error(new Notification('UnityOne ITSM can not be deleted!! Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
