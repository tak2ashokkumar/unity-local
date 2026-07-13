import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollectionDashboardPayload, CollectionDetailResponse, DashboardItem } from '../app-dashboard-collections-crud/app-dashboard-collections-crud.type';

@Injectable()
export class AppDashboardCollectionsViewService {
  private readonly collectionEndpoint = '/customer/collections/';
  private readonly defaultDashboardImageBasePath = 'static/assets/images/default_dashboard_full_Images/';

  constructor(private http: HttpClient) { }

  getCollection(uuid: string): Observable<CollectionDetailResponse | null> {
    return this.http.get<CollectionDetailResponse>(`${this.collectionEndpoint}${uuid}/`);
  }

  getDefaultDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/dashboards/?type=preset&page_size=0`).pipe(
      map(res => (res || []).map((d: any) => {
        const defaultDashboardRoute = this.getDefaultDashboardRouteSegment(d.name);
        return {
          id: d.id,
          uuid: d.uuid,
          name: d.name,
          source: 'default' as const,
          checked: false,
          image_url: d.image_url || this.getDefaultDashboardImageUrl(defaultDashboardRoute),
          description: d.description,
          type: d.type,
          status: d.status,
          created_at: d.created_at,
          updated_at: d.updated_at,
          created_by: d.created_by,
          defaultDashboardRoute
        };
      }))
    );
  }

  getMyDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/persona/dashboards/?page_size=0`).pipe(
      map(res => (res || [])
        .filter((d: any) => d.status === 'published')
        .map((d: any) => ({
          id: d.id,
          uuid: d.uuid,
          name: d.name,
          source: 'personal' as const,
          checked: false,
          image_url: d.image_url,
          description: d.description,
          type: d.type,
          status: d.status,
          refresh_interval_in_sec: d.refresh_interval_in_sec,
          refresh: d.refresh,
          timeframe: d.timeframe,
          created_at: d.created_at,
          updated_at: d.updated_at,
          created_by: d.created_by,
          is_default: d.is_default
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

  getDefaultDashboardRouteSegment(name: string): string | undefined {
    switch ((name || '').trim().toLowerCase()) {
      case 'infrastructure overview':
        return 'infrastructure';
      case 'network overview':
        return 'network-devices';
      case 'iot device overview':
        return 'iot-devices';
      case 'cloud cost overview':
        return 'cloud-cost';
      case 'task and workflow overview':
        return 'orchestration';
      case 'application dashboard':
        return 'application';
      case 'private cloud compute dashboard':
        return 'private-cloud-compute';
      case 'discovery and cmdb':
        return 'discovery';
      case 'public cloud compute dashboard':
        return 'public-cloud-compute';
      case 'database dashboard':
        return 'database';
      case 'event analytics':
      case 'event analytics dashboard':
        return 'event-analytics';
      case 'navigator central':
      case 'unified aiops command center':
      case 'unified aiops command center dashboard':
      case 'unified aiops command centre':
      case 'unified aiops command centre dashboard':
        return 'unified-aiops-command-centre';
    }
  }

  private getDefaultDashboardImageUrl(defaultDashboardRoute: string | undefined): string | undefined {
    const imageName = this.getDefaultDashboardImageName(defaultDashboardRoute);
    return imageName ? `${this.defaultDashboardImageBasePath}${imageName}` : undefined;
  }

  private getDefaultDashboardImageName(defaultDashboardRoute: string | undefined): string | undefined {
    switch (defaultDashboardRoute) {
      case 'application':
        return 'application-default-main-section-fullpage.png';
      case 'cloud-cost':
        return 'cloud-cost-main-section-fullpage.png';
      case 'database':
        return 'database-main-section-fullpage.png';
      case 'infrastructure':
        return 'infrastructure-main-section-fullpage.png';
      case 'iot-devices':
        return 'iot-devices-main-section-fullpage.png';
      case 'network-devices':
        return 'network-devices-main-section-fullpage.png';
      case 'orchestration':
        return 'play-orchestration-main-section-fullpage.png';
      case 'private-cloud-compute':
        return 'private-cloud-compute-main-section-fullpage.png';
      case 'public-cloud-compute':
        return 'public-cloud-compute-main-section-fullpage.png';
      case 'navigator-central':
      case 'unified-aiops-command-centre':
        return 'unified-aiops-command-centre-main-section-fullpage.png';
    }
  }
}
