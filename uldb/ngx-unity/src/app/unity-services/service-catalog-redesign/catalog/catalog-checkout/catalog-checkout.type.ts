export interface CatalogInfo {
  uuid: string;
  name: string;
  description: string;
  logo?: string;
  category: string;
  platform: string;
  service: string;
}

export interface Configuration {
  hostname?: string;
  cpu?: number;
  vcpu?: number;
  memory?: number;
  storage?: number;
  os_version?: string;
  [key: string]: any;
}

export interface Pricing {
  billing_model: string;
  frequency: string;
  currency: string;
  rate: string;
  amount: string;
}

export interface CostBreakdown {
  key: string;
  label: string;
  unit: string;
  usage: string;
  rate: string;
  amount: string;
}

export interface Sla {
  provisioning_time: string;
  uptime_sla: string;
  response_time: string;
  support_level: string;
}

export interface CartItem {
  uuid: string;
  catalog: CatalogInfo;
  quantity: number;
  pricing: Pricing;
  sla: Sla;
  require_approval: boolean;
  cost_breakdown: CostBreakdown[];
}

export interface CartCheckoutResponse {
  cart_uuid: string;
  total_items: number;
  currency: string;
  subtotal: string;
  tax: string;
  grand_total: string;
  items: CartItem[];
}

export interface CheckoutSubmitPayload {
  purpose: string;
  notes: string;
  priority: string;
}

export interface CartItemUpdatePayload {
  quantity?: number;
  configuration?: Configuration;
}

export interface ApprovalStep {
  label: string;
  state: 'done' | 'current' | 'pending';
}
