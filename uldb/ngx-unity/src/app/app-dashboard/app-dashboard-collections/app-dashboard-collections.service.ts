import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { CollectionDashboardPayload, CollectionDetailResponse, DashboardItem } from './app-dashboard-collections-crud/app-dashboard-collections-crud.type';
import { CuratedCollection, CuratedCollectionViewData } from './app-dashboard-collections.type';

@Injectable()
export class AppDashboardCollectionsService {
  private readonly collectionEndpoint = '/customer/collections/';

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getCollections(criteria: SearchCriteria): Observable<PaginatedResult<CuratedCollection>> {
    return this.tableService.getData<PaginatedResult<CuratedCollection>>(this.collectionEndpoint, criteria);
  }

  convertToViewData(data: CuratedCollection[]): CuratedCollectionViewData[] {
    return data.map(d => {
      const view = new CuratedCollectionViewData();
      const updatedAt = d.updated_at || d.modified_at;
      view.collectionId = (d.uuid || d.id || '').toString();
      view.name = d.name;
      view.userRoles = this.getNames(this.getFirstFilledList(d.user_roles, d.roles));
      view.primaryRole = view.userRoles[0] || 'NA';
      view.extraRolesCount = view.userRoles.length > 1 ? view.userRoles.length - 1 : 0;
      view.userGroups = this.getNames(this.getFirstFilledList(d.user_groups, d.groups));
      view.primaryGroup = view.userGroups[0] || 'NA';
      view.extraGroupsCount = view.userGroups.length > 1 ? view.userGroups.length - 1 : 0;
      view.createdBy = this.getName(d.created_by);
      view.lastModified = updatedAt ? this.utilSvc.toUnityOneDateFormat(updatedAt) : 'NA';
      view.status = d.status;
      view.applicableModulePermissions = d.applicable_module_permissions || [];
      return view;
    });
  }

  saveStatus(collectionId: string, status: string): Observable<any> {
    return this.http.patch(`${this.collectionEndpoint}${collectionId}/`, { status });
  }

  delete(collectionId: string): Observable<any> {
    return this.http.delete(`${this.collectionEndpoint}${collectionId}/`);
  }

  getCollection(uuid: string): Observable<CollectionDetailResponse | null> {
    return this.http.get<CollectionDetailResponse>(`${this.collectionEndpoint}${uuid}/`);
  }

  getDefaultDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/dashboards/?type=preset&page_size=0`).pipe(
      map(res => (res || []).map((d: any) => ({
        id: d.id, uuid: d.uuid, name: d.name, source: 'default' as const, checked: false
      })))
    );
  }

  getMyDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/persona/dashboards/?page_size=0`).pipe(
      map(res => (res || [])
        .filter((d: any) => d.status === 'published')
        .map((d: any) => ({
          id: d.id, uuid: d.uuid, name: d.name, source: 'personal' as const, checked: false
        }))
      )
    );
  }

  updateCollectionDashboards(uuid: string, dashboards: DashboardItem[]): Observable<any> {
    return this.http.patch(`${this.collectionEndpoint}${uuid}/`, {
      dashboards: this.convertToDashboardPayload(dashboards)
    });
  }

  convertToDashboardPayload(dashboards: DashboardItem[]): CollectionDashboardPayload[] {
    return (dashboards || []).map((dashboard, index) => ({
      id: dashboard.id,
      order: index
    }));
  }

  getSelectedDashboards(collection: CollectionDetailResponse, dashboards: DashboardItem[]): DashboardItem[] {
    const selectedItems = this.getSelectedCollectionItems(collection, 'dashboards', 'dashboard_ids');
    return this.getSelectedOptions(dashboards || [], selectedItems)
      .map((dashboard, index) => ({
        dashboard,
        order: this.getSelectedItemOrder(dashboard, selectedItems, index)
      }))
      .sort((a, b) => a.order - b.order)
      .map(item => ({ ...item.dashboard, checked: false }));
  }

  private getNames(data?: any[]): string[] {
    return (data || [])
      .map(item => this.getName(item))
      .filter(name => name && name !== 'NA');
  }

  private getFirstFilledList(primary?: any[], fallback?: any[]): any[] {
    return primary && primary.length ? primary : fallback || [];
  }

  private getName(data: any): string {
    if (!data) {
      return 'NA';
    }
    if (typeof data === 'string' || typeof data === 'number') {
      return data.toString();
    }
    return data.name || data.username || data.email || data.full_name || 'NA';
  }

  private getSelectedCollectionItems(collection: CollectionDetailResponse, apiKey: string, legacyKey: string): any[] {
    const source = collection as any;
    return source?.[apiKey] || source?.[legacyKey] || [];
  }

  private getSelectedOptions(options: DashboardItem[], selectedItems: any[]): DashboardItem[] {
    return (options || []).filter(option => this.isOptionSelected(option, selectedItems));
  }

  private isOptionSelected(option: DashboardItem, selectedItems: any[]): boolean {
    const optionValues = this.getOptionCompareValues(option);
    return (selectedItems || []).some(item => {
      return this.getSelectedItemCompareValues(item).some(value => optionValues.indexOf(value) !== -1);
    });
  }

  private getSelectedItemOrder(option: DashboardItem, selectedItems: any[], fallbackOrder: number): number {
    const selectedItem = (selectedItems || []).find(item => this.isOptionSelected(option, [item]));
    const order = Number(selectedItem?.order);
    return isNaN(order) ? 999999 + fallbackOrder : order;
  }

  private getOptionCompareValues(option: DashboardItem): string[] {
    return [option.uuid, option.id, option.name]
      .filter(value => value !== undefined && value !== null)
      .map(value => value.toString());
  }

  private getSelectedItemCompareValues(item: any): string[] {
    if (typeof item === 'string' || typeof item === 'number') {
      return [item.toString()];
    }

    const values = [
      item?.uuid,
      item?.id,
      item?.name,
      item?.dashboard_id,
      item?.dashboard_uuid,
      item?.dashboard?.uuid,
      item?.dashboard?.id,
      item?.dashboard?.name
    ];

    return values
      .filter(value => value !== undefined && value !== null)
      .map(value => value.toString());
  }
}
