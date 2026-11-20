import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  CUSTOM_DASHBOARD_DEVICES, CUSTOM_DASHBOARD_DEVICE_TYPES, CUSTOM_DASHBOARD_ITEMS, CUSTOM_DASHBOARD_PUBLIC_CLOUD_ACCOUNTS,
  CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCES, CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCE_ITEMS, CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCE_TYPES,
  CUSTOM_DASHBOARD_SCOPES
} from '../app-custom-dashboards-endpoint.const';
import {
  CUSTOM_DASHBOARD_METADATA_MAX_PAGES, CUSTOM_DASHBOARD_METADATA_PAGE_SIZE, CUSTOM_DASHBOARD_NUMERIC_VALUE_TYPES,
  CUSTOM_DASHBOARD_PUBLIC_CLOUD_AGGREGATIONS, CUSTOM_DASHBOARD_PUBLIC_CLOUD_PROVIDERS, getCustomDashboardMetricKey,
  getCustomDashboardPublicCloudDeviceType, parseCustomDashboardPublicCloudDeviceType
} from '../app-custom-dashboards.const';
import {
  CustomDashboardDevice, CustomDashboardDeviceType, CustomDashboardDeviceTypesResponse, CustomDashboardItem, CustomDashboardListResponse,
  CustomDashboardMetric, CustomDashboardMetricGroup, CustomDashboardMetricOption, CustomDashboardPagedResults, CustomDashboardPublicCloudAccount,
  CustomDashboardPublicCloudItem, CustomDashboardPublicCloudResource, CustomDashboardPublicCloudResourceType, CustomDashboardScope,
  CustomDashboardScopeGroup, CustomDashboardScopesResponse, CustomDashboardSelectedDevice, CustomDashboardSelectedDeviceType
} from '../app-custom-dashboards.type';

@Injectable()
export class AppCustomDashboardDataScopeService {

  constructor(private http: HttpClient) { }

  // ---------- Metadata (Data Center / Private Cloud) ----------

  getScopes(kind: string): Observable<CustomDashboardPagedResults<CustomDashboardScope>> {
    return this.getAllPages<CustomDashboardScope>(page => {
      const params: HttpParams = new HttpParams()
        .set('kind', kind)
        .set('page', page)
        .set('page_size', CUSTOM_DASHBOARD_METADATA_PAGE_SIZE);
      return this.http.get<CustomDashboardScopesResponse>(CUSTOM_DASHBOARD_SCOPES(), { params });
    });
  }

  getDeviceTypes(kind: string, scopeId: string): Observable<CustomDashboardDeviceTypesResponse> {
    const params: HttpParams = new HttpParams().set('kind', kind).set('scope_id', scopeId);
    return this.http.get<CustomDashboardDeviceTypesResponse>(CUSTOM_DASHBOARD_DEVICE_TYPES(), { params });
  }

  // Grouped listing: one entry per selected device type (contract: at most 2 sources).
  getDevices(sources: { kind: string, device_type: string, scope_ids: string[] }[]): Observable<CustomDashboardPagedResults<CustomDashboardDevice>> {
    return this.getAllPages<CustomDashboardDevice>(page => {
      const params: HttpParams = new HttpParams()
        .set('sources', JSON.stringify(sources))
        .set('selection', 'all')
        .set('page', page)
        .set('page_size', CUSTOM_DASHBOARD_METADATA_PAGE_SIZE);
      return this.http.get<CustomDashboardListResponse<CustomDashboardDevice>>(CUSTOM_DASHBOARD_DEVICES(), { params });
    });
  }

  // Multi-device listing (contract: at most 20 devices).
  getItems(devices: CustomDashboardSelectedDevice[]): Observable<CustomDashboardPagedResults<CustomDashboardItem>> {
    const targets = devices.map(d => ({ device_type: d.device_type, device_id: d.device_id }));
    return this.getAllPages<CustomDashboardItem>(page => {
      const params: HttpParams = new HttpParams()
        .set('devices', JSON.stringify(targets))
        .set('page', page)
        .set('page_size', CUSTOM_DASHBOARD_METADATA_PAGE_SIZE);
      return this.http.get<CustomDashboardListResponse<CustomDashboardItem>>(CUSTOM_DASHBOARD_ITEMS(), { params });
    });
  }

  // ---------- Public Cloud (existing /customer/managed/<provider>/ APIs) ----------

  isPublicCloudDeviceType(deviceType: string): boolean {
    return !!parseCustomDashboardPublicCloudDeviceType(deviceType);
  }

  getPublicCloudProviderLabel(provider: string): string {
    const option = CUSTOM_DASHBOARD_PUBLIC_CLOUD_PROVIDERS.find(p => p.value === provider);
    return option ? option.label : provider;
  }

  // Accounts of every provider become the Public Cloud scopes. A provider whose call
  // fails is left out (and the list is marked incomplete); all failing is an error.
  getPublicCloudScopes(): Observable<CustomDashboardPagedResults<CustomDashboardScope>> {
    const requests = CUSTOM_DASHBOARD_PUBLIC_CLOUD_PROVIDERS.map(provider => {
      const params: HttpParams = new HttpParams().set('page_size', 0);
      return this.http.get<CustomDashboardPublicCloudAccount[] | CustomDashboardListResponse<CustomDashboardPublicCloudAccount>>(
        CUSTOM_DASHBOARD_PUBLIC_CLOUD_ACCOUNTS(provider.value), { params }).pipe(
          map(res => this.toList(res).map(account => this.toPublicCloudScope(account, provider.value))),
          catchError(() => of(null)));
    });
    return forkJoin(requests).pipe(switchMap((lists: CustomDashboardScope[][]) => {
      const loaded = lists.filter(list => list);
      if (!loaded.length) {
        return throwError('Failed to fetch public cloud accounts.');
      }
      const results = loaded.reduce((all, list) => all.concat(list), [] as CustomDashboardScope[]);
      return of({ results, count: results.length, truncated: loaded.length < lists.length });
    }));
  }

  // Resource types of a provider (resource_count_by_type) as Data Scope device types.
  getPublicCloudDeviceTypes(provider: string): Observable<CustomDashboardDeviceType[]> {
    return this.http.get<CustomDashboardPublicCloudResourceType[] | CustomDashboardListResponse<CustomDashboardPublicCloudResourceType>>(
      CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCE_TYPES(provider)).pipe(
        map(res => this.toList(res).filter(t => t.resource_count > 0).map(t => ({
          device_type: getCustomDashboardPublicCloudDeviceType(provider, t.id),
          inventory_device_type: t.name,
          category: this.getPublicCloudProviderLabel(provider),
          available: true,
          reason: null,
          status: null,
          label: t.displayname || t.display_name || (t.service ? `${t.service} ${t.name}` : t.name)
        }))));
  }

  // Resources of one resource type in the given accounts, as Data Scope devices.
  getPublicCloudDevices(deviceType: string, accountIds: string[]): Observable<CustomDashboardPagedResults<CustomDashboardDevice>> {
    const parsed = parseCustomDashboardPublicCloudDeviceType(deviceType);
    return this.getAllPages<CustomDashboardPublicCloudResource>(page => {
      let params: HttpParams = new HttpParams()
        .set('resource_type', parsed.resourceTypeId)
        .set('page', page)
        .set('page_size', CUSTOM_DASHBOARD_METADATA_PAGE_SIZE);
      accountIds.forEach(id => params = params.append('account_uuid', id));
      return this.http.get<CustomDashboardListResponse<CustomDashboardPublicCloudResource>>(CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCES(parsed.provider), { params });
    }).pipe(map(res => ({ ...res, results: res.results.map(r => this.toPublicCloudDevice(r, deviceType, parsed.provider)) })));
  }

  // Zabbix items of one resource, in the same shape as the metadata items.
  getPublicCloudItems(device: CustomDashboardSelectedDevice): Observable<CustomDashboardPagedResults<CustomDashboardItem>> {
    const parsed = parseCustomDashboardPublicCloudDeviceType(device.device_type);
    return this.http.get<CustomDashboardPublicCloudItem[] | CustomDashboardListResponse<CustomDashboardPublicCloudItem>>(
      CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCE_ITEMS(parsed.provider, device.device_id)).pipe(
        map(res => {
          const results = this.toList(res).map(item => this.toPublicCloudItem(item, device));
          return { results, count: results.length, truncated: false };
        }));
  }

  // Joins the results of several list calls; a failed call (null) marks the list incomplete.
  // Returns null when every call failed.
  mergePagedResults<T>(lists: CustomDashboardPagedResults<T>[]): CustomDashboardPagedResults<T> {
    const loaded = lists.filter(list => list);
    if (lists.length && !loaded.length) {
      return null;
    }
    return {
      results: loaded.reduce((all, list) => all.concat(list.results), [] as T[]),
      count: loaded.reduce((total, list) => total + list.count, 0),
      truncated: loaded.length < lists.length || loaded.some(list => list.truncated)
    };
  }

  // ---------- View models ----------

  // Private / Public Cloud scopes are grouped by provider (VMware, Nutanix, AWS, Azure, ...);
  // Data Center scopes are flat.
  getScopeGroups(kind: string, scopes: CustomDashboardScope[]): CustomDashboardScopeGroup[] {
    if (kind === 'datacenter') {
      return scopes.length ? [{ label: '', scopes }] : [];
    }
    const groups: CustomDashboardScopeGroup[] = [];
    scopes.forEach(scope => {
      const label = scope.provider && scope.provider.name ? scope.provider.name : 'Other';
      let group = groups.find(g => g.label === label);
      if (!group) {
        group = { label, scopes: [] };
        groups.push(group);
      }
      group.scopes.push(scope);
    });
    return groups;
  }

  isScopeSelectable(scope: CustomDashboardScope): boolean {
    return scope.available && scope.device_catalog_available !== false;
  }

  // "vmware_vm" -> "Vmware VM", "baremetal" -> "Baremetal". Public Cloud resource types get
  // their real names from resource_count_by_type; until then "AWS type 818".
  getDeviceTypeLabel(deviceType: string): string {
    const publicCloud = parseCustomDashboardPublicCloudDeviceType(deviceType);
    if (publicCloud) {
      return `${this.getPublicCloudProviderLabel(publicCloud.provider)} type ${publicCloud.resourceTypeId}`;
    }
    return (deviceType || '').split('_').filter(w => w)
      .map(w => w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  getDeviceTypeKey(deviceType: CustomDashboardSelectedDeviceType): string {
    return `${deviceType.kind}|${deviceType.device_type}`;
  }

  getMetricGroupKey(item: { device_type: string, key: string }): string {
    return `${item.device_type}|${item.key}`;
  }

  // Items of every selected device, merged by device type + item key.
  buildMetricGroups(items: CustomDashboardItem[]): CustomDashboardMetricGroup[] {
    const groups: { [key: string]: CustomDashboardMetricGroup } = {};
    items.forEach(item => {
      const key = this.getMetricGroupKey(item);
      if (!groups[key]) {
        groups[key] = {
          key,
          device_type: item.device_type,
          itemKey: item.key,
          name: item.name,
          unit: item.unit,
          value_type: item.value_type,
          aggregations: [],
          selectable: false,
          dataAvailable: false,
          items: []
        };
      }
      const group = groups[key];
      group.items.push(item);
      group.selectable = group.selectable || item.selectable !== false;
      group.dataAvailable = group.dataAvailable || !!item.data_available;
      (item.aggregations || []).filter(a => !group.aggregations.includes(a)).forEach(a => group.aggregations.push(a));
    });
    return Object.keys(groups).map(k => groups[k]).sort((a, b) => a.name.localeCompare(b.name));
  }

  getDefaultAggregation(aggregations: string[]): string {
    return (aggregations || []).includes('avg') ? 'avg' : ((aggregations || [])[0] || 'avg');
  }

  toMetricOption(item: CustomDashboardItem, deviceName: string, aggregation: string, groupKey: string): CustomDashboardMetricOption {
    const metric: CustomDashboardMetric = {
      device_type: item.device_type,
      device_id: item.device_id,
      item_id: item.item_id,
      aggregation,
      monitoring: item.monitoring
    };
    return {
      key: getCustomDashboardMetricKey(metric),
      metric,
      deviceName,
      itemName: item.name,
      unit: item.unit,
      aggregations: item.aggregations || [],
      groupKey
    };
  }

  // ---------- private helpers ----------

  // The Public Cloud APIs return a plain array for page_size=0 and a page otherwise.
  private toList<T>(res: T[] | CustomDashboardListResponse<T>): T[] {
    if (Array.isArray(res)) {
      return res;
    }
    return res && res.results ? res.results : [];
  }

  private toPublicCloudScope(account: CustomDashboardPublicCloudAccount, provider: string): CustomDashboardScope {
    return {
      kind: 'public_cloud',
      id: account.uuid,
      name: account.name,
      parent: null,
      provider: { id: provider, name: this.getPublicCloudProviderLabel(provider), source: 'public_cloud_accounts' },
      available: true,
      device_catalog_available: true,
      device_catalog_reason: null
    };
  }

  // A resource counts as monitored once monitoring is configured (and not disabled).
  private toPublicCloudDevice(resource: CustomDashboardPublicCloudResource, deviceType: string, provider: string): CustomDashboardDevice {
    const monitored = !!resource.monitoring && resource.monitoring.configured && resource.monitoring.enabled !== false;
    return {
      device_type: deviceType,
      device_id: resource.uuid,
      name: resource.name,
      category: this.getPublicCloudProviderLabel(provider),
      status: monitored ? 'monitored' : 'not',
      status_source: 'public_cloud_monitoring',
      monitoring_health: null,
      inventory_state: null,
      scope: { kind: 'public_cloud', id: resource.account_uuid, name: resource.account_name || '' }
    };
  }

  // Zabbix items carry no unit or aggregation list; only numeric items can be charted.
  private toPublicCloudItem(item: CustomDashboardPublicCloudItem, device: CustomDashboardSelectedDevice): CustomDashboardItem {
    const valueType = Number(item.value_type);
    const numeric = CUSTOM_DASHBOARD_NUMERIC_VALUE_TYPES.includes(valueType);
    return {
      device_type: device.device_type,
      device_id: device.device_id,
      item_id: Number(item.item_id),
      name: item.name,
      key: item.key,
      unit: '',
      value_type: valueType,
      enabled: true,
      supported: true,
      selectable: numeric,
      aggregations: numeric ? [...CUSTOM_DASHBOARD_PUBLIC_CLOUD_AGGREGATIONS] : [],
      data_available: false,
      monitoring: { instance_id: null, host_id: null }
    };
  }

  // Reads page 1, then the remaining pages in parallel (up to the page limit).
  private getAllPages<T>(request: (page: number) => Observable<CustomDashboardListResponse<T>>): Observable<CustomDashboardPagedResults<T>> {
    return request(1).pipe(switchMap(first => {
      const total = first.count || 0;
      const pageCount = Math.min(Math.ceil(total / CUSTOM_DASHBOARD_METADATA_PAGE_SIZE), CUSTOM_DASHBOARD_METADATA_MAX_PAGES);
      const rest: Observable<CustomDashboardListResponse<T>>[] = [];
      for (let page = 2; page <= pageCount; page++) {
        rest.push(request(page));
      }
      const rest$: Observable<CustomDashboardListResponse<T>[]> = rest.length ? forkJoin(rest) : of([]);
      return rest$.pipe(map(pages => {
        const results = pages.reduce((list, page) => list.concat(page.results || []), [...(first.results || [])]);
        return { results, count: Math.max(total, results.length), truncated: results.length < total };
      }));
    }));
  }
}
