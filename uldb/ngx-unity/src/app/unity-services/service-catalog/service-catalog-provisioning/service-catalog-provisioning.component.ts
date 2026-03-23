import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { CatalogSummaryViewData, ServiceCatalogProvisioningService, TaskCatalogViewData, catalogCloudListViewData } from './service-catalog-provisioning.service';

@Component({
  selector: 'service-catalog-provisioning',
  templateUrl: './service-catalog-provisioning.component.html',
  styleUrls: ['./service-catalog-provisioning.component.scss'],
  providers: [ServiceCatalogProvisioningService]
})
export class ServiceCatalogProvisioningComponent implements OnInit, OnDestroy {
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  count: number;
  countCloud: number;
  viewData: TaskCatalogViewData[] = [];
  viewCloudData: catalogCloudListViewData[] = [];
  viewSummaryData: CatalogSummaryViewData;
  catalogSelected: string = 'all';

  cloudName: string = 'All';
  catalogUuid: string

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  taskDeleteModalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private svc: ServiceCatalogProvisioningService) {
    this.currentCriteria = { searchValue: '', pageSize: PAGE_SIZES.ZERO };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getCatalogSummaryDetails();
    this.filterByCloudType(this.cloudName);
    this.getCloudListDetails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    // this.currentCriteria.pageNo = 1;
    // this.getTaskData();
    this.getCatalogDetails();
  }

  getCatalogSummaryDetails() {
    this.svc.getCatalogSummaryDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewSummaryData = this.svc.convertCatalogSummaryViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Catalog Details'));
    });
  }

  getCatalogDetails() {
    this.svc.getCatalogDetails(this.catalogSelected, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.length;
      this.viewData = this.svc.convertToViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Catalog Details'));
    });
  }

  getCloudListDetails() {
    this.svc.getCloudListDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.countCloud = data.length;
      this.viewCloudData = this.svc.convertCloudListToViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get cloud Details'));
    });
  }

  getClass(index: number) {
    if (Number.isInteger(index / 3)) {
      return 'pl-0';
    } else if (Number.isInteger((index - 1) / 3)) {
      return 'px-0';
    } else {
      return 'pr-0';
    }
  }

  toggleStatus(orderedCatalog: string) {
    this.catalogSelected = orderedCatalog;
    this.getCatalogDetails();
  }

  addCatalog() {
    this.router.navigate(['crud'], { relativeTo: this.route });
  }
  editCatalog(catalogId: string) {
    this.router.navigate([`${catalogId}/crud`], { relativeTo: this.route });
  }

  filterByCloudType(cloudName?: string) {
    if (cloudName) {
      this.cloudName = cloudName;
      this.spinner.start('main');
      if (cloudName === "All") {
        this.currentCriteria.params = [{}];
      } else {
        const selectedResource = this.viewCloudData.find(resource => resource.cloudName === cloudName);
        if (selectedResource) {
          this.currentCriteria.params = [{ cloud: cloudName }];
        }
      }
    }
    this.getCatalogDetails();
  }

  navigateToCreateOrders(uuid: string) {
    this.router.navigate(['orders', uuid, 'crud'], { relativeTo: this.route });
  }

  deleteCatalog(uuid: string) {
    this.catalogUuid = uuid;
    this.taskDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmCatalogDelete() {
    this.taskDeleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteCatalog(this.catalogUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Catalog deleted successfully.'));
      this.getCatalogDetails();
      this.getCloudListDetails();
      this.getCatalogSummaryDetails();
    }, err => {
      this.notification.error(new Notification('Catalog can not be deleted!! Please try again.'));
    });
  }

  ordersPage(uuid: string, catalogType: string) {
    if (catalogType == 'orders') {
      this.router.navigate([uuid, 'orders'], { relativeTo: this.route.parent });
    }
    else {
      this.router.navigate([uuid, 'drafts'], { relativeTo: this.route.parent });
    }
  }

}
