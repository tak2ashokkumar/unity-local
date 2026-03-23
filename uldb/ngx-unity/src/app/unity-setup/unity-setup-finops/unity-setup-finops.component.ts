import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { UnitySetupFinopsService } from './unity-setup-finops.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BuildingBlockViewData } from './unity-setup-finops.type';

@Component({
  selector: 'unity-setup-finops',
  templateUrl: './unity-setup-finops.component.html',
  styleUrls: ['./unity-setup-finops.component.scss'],
  providers: [UnitySetupFinopsService]
})
export class UnitySetupFinopsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  count: number;
  viewData: BuildingBlockViewData[] = [];
  selectedView: BuildingBlockViewData;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;

  constructor(private svc: UnitySetupFinopsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getBuildingBlocks();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  
  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getBuildingBlocks();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getBuildingBlocks();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getBuildingBlocks();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getBuildingBlocks();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getBuildingBlocks();
  }

  getBuildingBlocks() {
    this.viewData = [];
    this.spinner.start('main');
    this.svc.getBuildingBlocks(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res?.count;
      this.viewData = this.svc.convertToViewData(res?.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Failed to get load Building Blocks.`));
    });
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  edit(view: BuildingBlockViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }
  
  gotoDeviceMapping(uuid: string){
    this.router.navigate(['devicemap', uuid], { relativeTo: this.route });
  }

  delete(view: BuildingBlockViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteModalRef.hide();
    this.svc.delete(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Building Block deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to delete Building Block. Please try again.'));
    });
  }

}
