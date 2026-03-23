import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { CatalogSummary, TaskCatalog, catalogCloudList } from './service-catalog-provisioning-type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SERVICE_CATALOG } from 'src/app/shared/api-endpoint.const';
import { environment } from 'src/environments/environment';

@Injectable()
export class ServiceCatalogProvisioningService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private tableService: TableApiServiceService,) { }

  getCatalogDetails(orderedCatalogs?: string, criteria?: SearchCriteria): Observable<TaskCatalog[]> {
    if (orderedCatalogs && criteria) {
      if (orderedCatalogs == 'ordered') {
        return this.tableService.getData<TaskCatalog[]>(`${SERVICE_CATALOG()}?filter=ordered`, criteria);
      } else {
        return this.tableService.getData<TaskCatalog[]>(SERVICE_CATALOG(), criteria);
      }
    } else {
      return this.tableService.getData<TaskCatalog[]>(SERVICE_CATALOG(), criteria);
    }
  }

  deleteCatalog(catalogId: string): Observable<any> {
    return this.http.delete<any>(SERVICE_CATALOG(catalogId));
  }

  getCloudListDetails(criteria?: SearchCriteria): Observable<catalogCloudList[]> {
    return this.http.get<catalogCloudList[]>(`${SERVICE_CATALOG()}cloud_groups/`);
  }

  getCatalogSummaryDetails(): Observable<CatalogSummary> {
    return this.http.get<CatalogSummary>(`${SERVICE_CATALOG()}list_summary/`);
  }

  convertCloudListToViewData(data: catalogCloudList[]) {
    let viewCloudListData: catalogCloudListViewData[] = [];
    data.map(a => {
      let cvd: catalogCloudListViewData = new catalogCloudListViewData();
      cvd.logo = a.logo && a.logo != '' ? `${environment.assetsUrl}${a.logo}` : null;
      cvd.cloudName = a.group_name;
      cvd.orderCount = a.catalog_count;
      viewCloudListData.push(cvd);
    });
    return viewCloudListData;
  }

  convertCatalogSummaryViewData(data: CatalogSummary): CatalogSummaryViewData {
    let summary: CatalogSummaryViewData = new CatalogSummaryViewData();
    summary.ordersInProgress = data.orders_in_progress;
    summary.total = data.total_catalogs;
    summary.catalogType = data.catalog_type;
    summary.cloud = data.cloud.map(c => {
      return {
        cloudName: c.cloud_name,
        cloudImage: c.cloud_image && c.cloud_image !== '' ? `${environment.assetsUrl}${c.cloud_image}` : null,
        count: c.count
      } as Cloud;
    });
    return summary;
  }

  convertToViewData(data: TaskCatalog[]) {
    let viewCatalogData: TaskCatalogViewData[] = [];
    data.map(a => {
      let cvd: TaskCatalogViewData = new TaskCatalogViewData();
      cvd.uuid = a.uuid;
      cvd.name = a.name ? a.name : 'NA';
      cvd.description = a.description;
      cvd.logo = a.logo;
      cvd.catalogType = a.catalog_type;
      cvd.ordersCount = a.orders_count;
      cvd.draftOrdersCount = a.drafts_count;
      cvd.task = a.task;
      cvd.workflow = a.workflow;
      cvd.price = a.price;
      cvd.workflow = a.workflow;
      cvd.createdBy = a.created_by;
      cvd.autoApproval = a.auto_approval;
      cvd.editedBy = a.edited_by;
      cvd.cloud = a.cloud_type;
      cvd.logoUrl = a.logo_url;
      viewCatalogData.push(cvd);
    });
    return viewCatalogData;
  }
}

export class TaskCatalogViewData {
  constructor() { };
  uuid: string;
  name: string;
  description: string;
  logo: null | string;
  catalogType: string;
  ordersCount: number;
  draftOrdersCount: number;
  relatedObject: string;
  task: string;
  workflow: string;
  price: string;
  autoApproval: boolean;
  editedBy: string;
  createdBy: number;
  cloud: string;
  logoUrl: string;
  altLogoUrl: string = `${environment.assetsUrl}alt-image.png`
}

export class catalogCloudListViewData {
  constructor() { }
  logo: string;
  cloudName: string;
  orderCount: number;
}

export class Cloud {
  constructor() { }
  count: number;
  cloudImage: null | string;
  cloudName: string;
}

export class CatalogType {
  constructor() { }
  Task: number;
  Workflow: number;
}

export class CatalogSummaryViewData {
  constructor() { }
  ordersInProgress: number;
  total: number;
  catalogType: CatalogType;
  cloud: Cloud[];
}