import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AssignedCloudsViewData, UscpResourcePvtcloudMappingService } from './uscp-resource-pvtcloud-mapping.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UscpResourceModelDataType } from '../uscp-resource-model/uscp-resource-model.type';

@Component({
  selector: 'uscp-resource-pvtcloud-mapping',
  templateUrl: './uscp-resource-pvtcloud-mapping.component.html',
  styleUrls: ['./uscp-resource-pvtcloud-mapping.component.scss'],
  providers: [UscpResourcePvtcloudMappingService]
})
export class UscpResourcePvtcloudMappingComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  resourceId: string;
  count: number = 0;
  currentCriteria: SearchCriteria;
  viewData: AssignedCloudsViewData[] = [];
  selectedView: AssignedCloudsViewData;
  resourceData: UscpResourceModelDataType;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  constructor(private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private svc: UscpResourcePvtcloudMappingService,
    private modalService: BsModalService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE , params: [{ resource: '' }] };
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('resourceId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getResourceDetails();
    this.getAssignedClouds();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE , params: [{ resource: this.resourceId }] };
    this.getAssignedClouds();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAssignedClouds();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAssignedClouds();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAssignedClouds();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAssignedClouds();
  }

  getResourceDetails() {
    this.svc.getResourceDetails(this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourceData = res;
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification("Failed to get resource data"));
      this.spinner.stop('main');
    });
  }

  getAssignedClouds() {
    this.currentCriteria.params[0].resource = this.resourceId;
    this.svc.getAssignedClouds(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get mapped clouds'));
    });
  }

  assignCloud() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  toggleStatus(view: AssignedCloudsViewData, status: boolean) {
    if (view.isActive == status) {
      return;
    }
    this.svc.updateStatus(view.uuid, status.toString()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      view.isActive = status;
      this.notification.success(new Notification(`Status ${status ? 'enabled' : 'disabled'} successfully`));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(`Failed to ${status ? 'enable' : 'disable'} the status`));
    });
  }

  goBack() {
    this.router.navigate(['setup/cost-plan/resource-model']);
  }

  goToHistory(view: AssignedCloudsViewData) {
    this.router.navigate(['history', view.uuid], { relativeTo: this.route });
  }

  deleteCloud(view: AssignedCloudsViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getAssignedClouds();
      this.spinner.stop('main');
      this.notification.success(new Notification('Cloud removed from resource model successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to remove the cloud from resource model'));
    })
  }

}