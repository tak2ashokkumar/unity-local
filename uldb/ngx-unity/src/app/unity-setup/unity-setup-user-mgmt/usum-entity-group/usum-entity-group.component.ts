import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EntityGroupViewData, UsumEntityGroupService } from './usum-entity-group.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usum-entity-group',
  templateUrl: './usum-entity-group.component.html',
  styleUrls: ['./usum-entity-group.component.scss'],
  providers: [UsumEntityGroupService]
})
export class UsumEntityGroupComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: EntityGroupViewData[] = [];
  entityObjectsList: string[] = [];
  toggleEntityGroupData: EntityGroupViewData;    
  @ViewChild('toggleConfirmEntityGroup') toggleConfirmEntityGroup: ElementRef;
  toggleConfirmEntityGroupModalRef: BsModalRef;
  selectedView: EntityGroupViewData;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  constructor(private svc: UsumEntityGroupService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getEntityGroups();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getEntityGroups();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEntityGroups();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEntityGroups();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getEntityGroups();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEntityGroups();
  }

  getEntityGroups() {
    this.svc.getEntityGroups(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Entity Groups.'));
    })
  }

  showEntityResources(view: EntityGroupViewData) {
    this.entityObjectsList = view.entityObjectsList;
  }

  toggleEntityGroup(view: EntityGroupViewData) {
    if (view.isDefault) {
      return;
    }
    this.toggleEntityGroupData = view;
    this.toggleConfirmEntityGroupModalRef = this.modalService.show(this.toggleConfirmEntityGroup, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmToggleEntityGroup() {
    this.spinner.start('main');
    this.toggleConfirmEntityGroupModalRef.hide();
    this.svc.toggleEntityGroup(this.toggleEntityGroupData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification(`Permission Set ${this.toggleEntityGroupData.toggleTootipMsg} successfully`));
      this.getEntityGroups();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
      this.spinner.stop('main');
    });
  }  

  deleteEntityGroup(view: EntityGroupViewData) {    
    if (view.isDefault) {
      return;
    }
    this.selectedView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteEntityGroup() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deleteEntityGroup(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEntityGroups();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Entity Group. Please try again later.'));
    })
  }

  goToCreateEntityGroup() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditEntityGroup(view: EntityGroupViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

}
