import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ServiceCatalogOrdersService, ServiceCatalogOrderSummary, ServiceCatalogOrderViewData } from './service-catalog-orders.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'service-catalog-orders',
  templateUrl: './service-catalog-orders.component.html',
  styleUrls: ['./service-catalog-orders.component.scss'],
  providers: [ServiceCatalogOrdersService]
})
export class ServiceCatalogOrdersComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  orderSummaryViewData: ServiceCatalogOrderSummary = new ServiceCatalogOrderSummary();;
  orderViewData: ServiceCatalogOrderViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  catalogId: string;
  catalogType: string;
  orderId: string;

  constructor(private ordersService: ServiceCatalogOrdersService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ order_type: '' }] };
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.catalogId = params.get('catalogId');
      this.catalogType = params.get('catalogType');
    });
  }

  ngOnInit(): void {
    this.getOrdersSummary();
    this.getOrders();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getOrders();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getOrders();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getOrders();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getOrders();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getOrders();
  }

  getOrdersSummary() {
    this.orderViewData = [];
    this.spinner.start('OrdersInProgress');
    this.spinner.start('ByCategory');
    this.spinner.start('ByCloud');
    this.ordersService.getOrdersSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orderSummaryViewData = this.ordersService.convertToOrderSummaryViewData(res);
      this.spinner.stop('OrdersInProgress');
      this.spinner.stop('ByCategory');
      this.spinner.stop('ByCloud');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('OrdersInProgress');
      this.spinner.stop('ByCategory');
      this.spinner.stop('ByCloud');
      this.notification.error(new Notification('Failed to get order summary.'));
    });
  }

  getOrders() {
    this.orderViewData = [];
    this.count = null;
    this.spinner.start('OrdersList');
    if (this.catalogType) {
      if (this.catalogType == 'orders') {
        this.currentCriteria.params[0].order_type = 'Ordered';
      } else {
        this.currentCriteria.params[0].order_type = 'Draft';
      }
    }
    this.ordersService.getOrders(this.currentCriteria, this.catalogId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.orderViewData = this.ordersService.convertToViewData(res.results);
      this.spinner.stop('OrdersList');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('OrdersList');
      this.notification.error(new Notification('Failed to get orders'));
    });
  }

  goBack() {
    this.router.navigate(['../../catalog'], { relativeTo: this.route });
  }

  editOrder(order: ServiceCatalogOrderViewData) {
    if (!this.catalogId) {
      this.router.navigate(['../', 'catalog', order.catalog, 'orders', order.uuid, 'edit'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../', 'catalog', this.catalogId, 'orders', order.uuid, 'edit'], { relativeTo: this.route });
    }
  }
}
