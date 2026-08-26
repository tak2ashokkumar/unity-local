export interface OrdersResponse {
  results: Order[];
}

export interface CatalogOrdersApiResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: CatalogOrderApi[];
}

export interface CatalogOrderApi {
  uuid: string;
  order_number: string;
  catalog_item: string;
  configuration: { [key: string]: any };
  quantity: number;
  catalog_name: string;
  catalog_snapshot: CatalogSnapshot;
  pricing_snapshot: PricingSnapshot;
  cost_breakdown: CostMappingEntry[];
  currency: string;
  price: string;
  tax_amount: string;
  total_amount: string;
  status: string;
  error_message: string;
  rejection_reason: string;
  priority: string;
  requested_by: string;
  approval_meta: ApprovalMeta;
  created_at: string;
}

export interface Order extends CatalogOrderApi {
}

export interface CatalogSla {
  provisioning_time?: string;
  uptime_sla?: string;
  response_time?: string;
  support_level?: string;
}

export interface CatalogSnapshot {
  category?: string;
  key_features?: string[];
  service?: string;
  description?: string;
  platform?: string;
  use_cases?: string[];
  require_approval?: boolean;
  sla?: CatalogSla;
}

export interface PricingSnapshot {
  finops_block?: string;
  frequency?: string;
  billing_model?: string;
}

export interface CostMappingEntry {
  count: number | null;
  base_quantity: number;
  subtitle: string;
  mapping_type: string;
  sentence: string;
  price: number;
  rate_frequency: string;
  label: string;
  source: string;
  rate: number;
  config_key: string;
  key: string;
  unit: string;
  usage: string;
  amount: number;
}

export interface ApprovalMeta {
  ritm?: string;
  request?: string;
  status?: string;
}
