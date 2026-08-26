import { Injectable } from '@angular/core';
import { AddToCartPayload, CartResponse, CartViewData, CatalogDetail, CatalogFilterChoices, CatalogItem, CategoryOption, ConfigurationViewData, ExploreTab, FilterCategory, ModalTab, OverviewViewData, PricingViewData, RequirementsViewData, SlaViewData } from './catalog.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private tableService: TableApiServiceService, private http: HttpClient) { }

  readonly categories: CategoryOption[] = [
    { key: 'all', label: 'All' },
    { key: 'Compute', label: 'Compute' },
    { key: 'Database', label: 'Database' },
    { key: 'Network', label: 'Network' },
    { key: 'Storage', label: 'Storage' },
    { key: 'Operations', label: 'Operations' }
  ];

  readonly filterCategories: FilterCategory[] = [
    { id: 'compute', label: 'Compute', count: 14 },
    { id: 'on-prem', label: 'On-Prem', count: 8 },
    { id: 'azure', label: 'Azure', count: 12 },
    { id: 'aws', label: 'AWS', count: 15 },
    { id: 'gcp', label: 'GCP', count: 7 },
    { id: 'oci', label: 'OCI', count: 3 },
    { id: 'database', label: 'Database', count: 6 },
    { id: 'network', label: 'Network', count: 9 },
    { id: 'storage', label: 'Storage', count: 11 },
    { id: 'backup_recovery', label: 'Backup & Recovery', count: 4 },
    { id: 'security', label: 'Security', count: 5 },
    { id: 'operational', label: 'Operational', count: 10 }
  ];

  readonly modalTabs: ModalTab[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'pricing', label: 'Pricing & Cost Breakdown' },
    { key: 'sla', label: 'SLA & Policies' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'configuration', label: 'Configuration' }
  ];

  convertCatalogListToViewData(data: CatalogItem[]): catalogListViewData[] {
    return data.map(item => {
      const cvd = new catalogListViewData();
      cvd.name = item.name;
      cvd.uuid = item.uuid;
      cvd.logo = this.resolveLogoUrl(item.logo || item.logo_url);
      cvd.cloudName = item.name;
      cvd.description = item.description;
      cvd.category = item.category;
      cvd.cloudType = item.cloud_type;
      cvd.catalogType = item.catalog_type;
      cvd.price = item.price;
      cvd.currency = item.currency || CatalogService.DEFAULT_CURRENCY;
      cvd.provisioningTime = this.resolveProvisioningTime(item.sla);
      cvd.frequency = item.frequency || '';
      cvd.platform = item.platform;
      return cvd;
    });
  }

  private resolveProvisioningTime(sla: any): number | string {
    // sla can arrive as [] (no SLA configured) or as an object with provisioning_time
    if (!sla || Array.isArray(sla)) { return 0; }
    return sla.provisioning_time || 0;
  }

  private static readonly FREQUENCY_SUFFIX: { [key: string]: string } = {
    'Monthly': '/mo',
    'Daily': '/day',
    'Hourly': '/hr'
  };

  frequencySuffix(frequency: string): string {
    return CatalogService.FREQUENCY_SUFFIX[frequency] || (frequency ? `/${frequency.toLowerCase()}` : '');
  }
  private resolveLogoUrl(logo: string | null | undefined): string | null {
    if (!logo) {
      return null;
    }

    // Uploaded media is returned as an absolute URL. Older API responses may
    // still contain an asset-relative logo_url, so retain support for both.
    return /^(?:https?:)?\/\//i.test(logo) || /^(?:data|blob):/i.test(logo)
      ? logo
      : `${environment.assetsUrl}${logo.replace(/^\/+/, '')}`;
  }

  convertToOverviewData(detail: CatalogDetail): OverviewViewData {
    return {
      description: detail.description,
      useCases: detail.use_cases || [],
      features: detail.key_features || [],
      quickInfo: [
        { label: 'Category', value: detail.category },
        { label: 'Platform', value: detail.platform || '—' },
        { label: 'Price', value: `${this.getCurrencySymbol(detail.currency)}${detail.price}` },
        { label: 'SLA', value: detail.sla?.provisioning_time ? `${detail.sla.provisioning_time} min` : '—' },
        { label: 'Availability', value: detail.sla?.uptime_sla ? `${detail.sla.uptime_sla}%` : '—' },
        { label: 'Support', value: detail.sla?.support_level || '—' }
      ]
    };
  }

  convertToPricingData(detail: CatalogDetail): PricingViewData {
    return {
      billingModel: detail.billing_model,
      frequency: detail.frequency,
      currency: detail.currency || CatalogService.DEFAULT_CURRENCY,
      basis: detail.pricing_basis,
      estimatedCost: `${this.getCurrencySymbol(detail.currency)}${detail.price}`,
      costComponents: (detail.cost_mapping || []).map(c => ({
        name: c.label,
        unit: this.formatUnit(c, detail),
        rate: `${c?.price}`,
        frequency: detail?.frequency
      }))
    };
  }

  formatUnit(cost, detail) {
    if (cost?.source === 'Config') {
      const conf = detail?.configuration.find(c => c.key === cost?.config_key);
      return conf ? `${conf.default} ${cost?.unit?.toUpperCase()}` : '-';
    }
    if (cost?.source === 'Fixed') {
      return '-';
    }
    if (cost?.source === 'Static') {
      return `${cost?.count} ${cost?.unit?.toUpperCase()}`;
    }
  }

  private frequencyAbbrev(freq: string): string {
    switch ((freq || '').toLowerCase()) {
      case 'monthly': return 'mo';
      case 'daily': return 'day';
      case 'hourly': return 'hr';
      default: return freq || '';
    }
  }

  deleteCartItem(itemUuid: string): Observable<void> {
    return this.http.delete<void>(`/api/service_catalog/v1/cart_items/${itemUuid}/`);
  }

  convertToSlaData(detail: CatalogDetail): SlaViewData {
    const sla = detail.sla;
    return {
      stats: [
        { icon: 'fa fa-stopwatch', value: sla?.provisioning_time ? `${sla.provisioning_time} min` : '—', label: 'Provisioning Time' },
        { icon: 'fa fa-chart-line', value: sla?.uptime_sla ? `${sla.uptime_sla}%` : '—', label: 'Uptime SLA' },
        { icon: 'fa fa-headset', value: sla?.support_level || '—', label: 'Support' },
        { icon: 'fa fa-bolt', value: sla?.response_time ? `${sla.response_time} min` : '—', label: 'Response Time' }
      ],
      policies: (detail.policies || []).map(p => ({
        name: p.policy,
        desc: p.description,
        type: p.type
      }))
    };
  }

  convertToRequirementsData(detail: CatalogDetail): RequirementsViewData {
    const r = detail.requirements;
    return {
      functional: r?.functional || [],
      technical: r?.technical || [],
      access: r?.access_permissions || [],
      included: r?.included || [],
      notIncluded: r?.not_included || []
    };
  }

  convertToCartViewData(cart: CartResponse): CartViewData {
    return {
      totalItems: cart.total_items || 0,
      subtotal: cart.subtotal || 0,
      tax: cart.tax || 0,
      grandTotal: cart.grand_total || 0,
      currency: cart.currency || CatalogService.DEFAULT_CURRENCY,
      lines: (cart.items || []).map(item => ({
        uuid: item.uuid,
        catalogUuid: item.catalog_item?.uuid,
        name: item.catalog_item?.name,
        category: item.catalog_item?.category,
        platform: item.catalog_item?.platform,
        quantity: item.quantity,
        unitPrice: Number(item.rate),
        lineTotal: item.amount
      }))
    };
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>('/api/service_catalog/v1/cart/');
  }

  convertToConfigurationData(detail: CatalogDetail): ConfigurationViewData {
    return { fields: detail.configuration || [] };
  }

  addToCart(payload: AddToCartPayload): Observable<any> {
    return this.http.post<any>('/api/service_catalog/v1/cart_items/', payload);
  }

  getCatalogs(criteria: SearchCriteria): Observable<PaginatedResult<CatalogItem>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<CatalogItem>>('api/service_catalog/v1/catalogs/', { params: params });
  }

  getCatalogFilterChoices(): Observable<CatalogFilterChoices> {
    return this.http.get<CatalogFilterChoices>('/api/service_catalog/v1/catalogs/filter_options/');
  }

  getCatalogDetail(uuid: string): Observable<CatalogDetail> {
    return this.http.get<CatalogDetail>(`/api/service_catalog/v1/catalogs/${uuid}/`);
  }

  deleteCatalog(catalogId: string): Observable<any> {
    return this.http.delete<any>(`/api/service_catalog/v1/catalogs/${catalogId}/`);
  }

  private static readonly CURRENCY_SYMBOLS: { [key: string]: string } = {
    'EUR': '€',
    'USD': '$'
  };

  private static readonly DEFAULT_CURRENCY = 'EUR';

  getCurrencySymbol(currencyCode: string | null | undefined): string {
    const code = (currencyCode || CatalogService.DEFAULT_CURRENCY).toUpperCase();
    return CatalogService.CURRENCY_SYMBOLS[code] || code; // fall back to the raw code if unmapped
  }
}

export class catalogListViewData {
  constructor() { }
  name: string;
  uuid: string;
  logo: string | null;
  category: string;
  cloudName: string;
  description: string;
  cloudType: string;
  catalogType: string;
  price: string;
  currency: string;
  slaPolicy: number;
  platform: string;
  provisioningTime: number | string;
  frequency: string;
}
