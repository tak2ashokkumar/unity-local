import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollectionDashboardPayload, CollectionDetailResponse, DashboardItem } from '../app-dashboard-collections-crud/app-dashboard-collections-crud.type';

@Injectable()
export class AppDashboardCollectionsViewService {
  private readonly collectionEndpoint = '/customer/collections/';

  constructor(private http: HttpClient) { }

  getCollection(uuid: string): Observable<CollectionDetailResponse | null> {
    return this.http.get<CollectionDetailResponse>(`${this.collectionEndpoint}${uuid}/`);
  }

  getDefaultDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/dashboards/?type=preset&page_size=0`).pipe(
      map(res => (res || []).map((d: any) => ({
        id: d.id, uuid: d.uuid, name: d.name, source: 'default' as const, checked: false, image_url: d.image_url
      })))
    );
  }

  getMyDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/persona/dashboards/?page_size=0`).pipe(
      map(res => (res || [])
        .filter((d: any) => d.status === 'published')
        .map((d: any) => ({
          id: d.id, uuid: d.uuid, name: d.name, source: 'personal' as const, checked: false, image_url: d.image_url
        }))
      )
    );
  }

  updateCollectionDashboards(uuid: string, dashboards: DashboardItem[]): Observable<any> {
    return this.http.patch(`${this.collectionEndpoint}${uuid}/`, {
      dashboards: this.convertToDashboardPayload(dashboards)
    });
  }

  updateCollectionImage(uuid: string, file: File): Observable<CollectionDetailResponse> {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.patch<CollectionDetailResponse>(`${this.collectionEndpoint}${uuid}/`, formData);
  }

  updateDashboardImage(dashboard: DashboardItem, name: string, file?: File | null): Observable<any> {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.patch(`/customer/dashboards/${dashboard.uuid}/`, formData);
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
