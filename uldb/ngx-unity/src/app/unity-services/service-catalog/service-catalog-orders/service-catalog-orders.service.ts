import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';
import { ServiceCatalogOrder, ServiceCatalogSummary } from './service-catalog-orders.type';

@Injectable()
export class ServiceCatalogOrdersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getOrdersSummary(): Observable<ServiceCatalogSummary> {
    return this.http.get<ServiceCatalogSummary>(`service_catalog/orders/list_summary/`);
  }

  convertToOrderSummaryViewData(data: ServiceCatalogSummary): ServiceCatalogOrderSummary {
    let viewData: ServiceCatalogOrderSummary = new ServiceCatalogOrderSummary();
    viewData.ordersUp = data.orders_in_progress.success;
    viewData.ordersDown = data.orders_in_progress.failed;
    viewData.ordersInProgress = data.orders_in_progress.in_progress;
    viewData.categoryProvisioning = data.category.Provisioning;
    viewData.categoryOperational = data.category.Operational;
    data.cloud.forEach((c, index) => {
      let view: OrdersByCloudViewData = new OrdersByCloudViewData();
      view.count = c.count;
      view.image = c.cloud_image ? `${environment.assetsUrl + c.cloud_image}` : '';
      view.name = c.cloud_name;
      //7 is based on the width of the div element
      if (index < 7) {
        viewData.ordersByCloudViewData.push(view);
      } else {
        viewData.extraBadgeCount += 1;
        viewData.extraOrdersByCloudViewData.push(view);
      }
    });
    return viewData;
  }

  getOrders(criteria: SearchCriteria, catalogId: string): Observable<PaginatedResult<ServiceCatalogOrder>> {
    if (catalogId) {
      return this.tableService.getData<PaginatedResult<ServiceCatalogOrder>>(`service_catalog/orders/?catalog_id=${catalogId}`, criteria);
    } else {
      return this.tableService.getData<PaginatedResult<ServiceCatalogOrder>>(`service_catalog/orders/`, criteria);
    }
  }

  getIcon(type: string) {
    switch (type) {
      case 'Rejected': return 'fa-thumbs-down text-danger';
      case 'Approved': return 'fa-thumbs-up text-success';
      case 'In Progress': return 'fa-spinner fa-spin text-primary';
      case 'Completed': return 'fa-check-circle text-success';
      case 'Cancelled': return 'fa-exclamation-triangle text-danger';
      case 'Draft': return 'fa-history text-muted';
      case 'Ordered': return 'fa-check text-primary';
      case 'Pending Approval': return 'fa-clock text-warning';
      case 'Failed': return ' fa-exclamation-circle text-danger';
      default: return '';
    }
  }

  convertToViewData(data: ServiceCatalogOrder[]): ServiceCatalogOrderViewData[] {
    let viewData: ServiceCatalogOrderViewData[] = [];
    data.forEach(od => {
      let view: ServiceCatalogOrderViewData = new ServiceCatalogOrderViewData();
      view.uuid = od.uuid;
      view.orderId = od.order_id;
      view.catalogName = od.catalog_name;
      view.orderType = od.order_type;
      view.createdAt = od.created_at ? this.utilSvc.toUnityOneDateFormat(od.created_at) : 'N/A';
      view.orderedBy = od.ordered_by;
      view.price = od.price;
      view.status = od.order_status;
      view.catalog = od.catalog
      view.statusIcon = this.getIcon(od.order_status);
      viewData.push(view);
    })
    return viewData;
  }
}

export class ServiceCatalogOrderSummary {
  ordersUp: number;
  ordersDown: number;
  ordersInProgress: number;
  categoryProvisioning: number;
  categoryOperational: number;
  ordersByCloudViewData: OrdersByCloudViewData[] = [];
  extraBadgeCount: number = 0;
  extraOrdersByCloudViewData: OrdersByCloudViewData[] = [];
}

export class OrdersByCloudViewData {
  count: number;
  image: string;
  name: string;
}

export class ServiceCatalogOrderViewData {
  uuid: string;
  orderId: string;
  catalogName: string;
  orderType: string;
  createdAt: string;
  orderedBy: string;
  price: string;
  status: string;
  statusIcon: string;
  catalog: string;
}