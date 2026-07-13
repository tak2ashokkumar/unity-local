import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

export interface ModelCostSeries {
  model: string;
  values: number[];
}

// ── API response shapes ──────────────────────────────────────────────────────

export interface TokenSummary {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
}

export interface ModelCost {
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
}

export interface ProviderUsage {
  provider: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
}

export interface CallTypeBreakdown {
  call_type: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
}

export interface RequestCall {
  call_type: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
}

export interface RequestBreakdown {
  query_name: string;
  query: string;
  request_id: string;
  conversation_id: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
  llm_call_count: number;
  calls: RequestCall[];
  isExpanded?: boolean;
}

export interface UsageTrend {
  timestamp: string;
  from_timestamp: string;
  to_timestamp: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
}

export interface TraceSummaryItem {
  name: string;
  count: number;
  total_tokens: number;
  total_cost_usd: number;
}

export interface TraceSummary {
  total_traces_tracked: number;
  items: TraceSummaryItem[];
}

export interface ApplicationUsage {
  application: string;
  display_name: string;
  tags?: string[];
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  observation_count: number;
}

export interface ApplicationUsageGraphResponse {
  source: string;
  period: string;
  org_id: number;
  user_id: number;
  from_timestamp: string;
  to_timestamp: string;
  applications: ApplicationUsage[];
}

export interface TimeWindow {
  from_timestamp: string;
  to_timestamp: string;
}

export interface ModelTimeSeries {
  labels: string[];
  token_series: any[];
  cost_series: any[];
}

// Per-user (per-entity) consumption time-series — backend contract for the
// User Consumption chart.
export interface UserConsumptionSeries {
  name: string;
  data: number[];
}

export interface UserTimeSeries {
  labels: string[];
  series: UserConsumptionSeries[];
}

export interface BillingModelCost {
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  billable_cost_usd: number;
  observation_count: number;
}

export interface Billing {
  billable_used_usd: number;
  remaining_credit_usd: number;
  monthly_credit_usd: number;
  model_costs?: BillingModelCost[];
}

export interface LangfuseDashboardResponse {
  token_summary: TokenSummary;
  billing?: Billing;
  model_costs: ModelCost[];
  provider_usage: ProviderUsage[];
  call_type_breakdown: CallTypeBreakdown[];
  request_breakdown: RequestBreakdown[];
  usage_trend: UsageTrend[];
  applications?: ApplicationUsage[];
  trace_summary: TraceSummary;
  time_window: TimeWindow;
  model_usage: any[];
  tracing_table: any[];
  model_time_series: ModelTimeSeries;
  user_time_series?: UserTimeSeries;
}

// ── Query params ─────────────────────────────────────────────────────────────

export interface TokenBillingParams {
  orgId: number | string;
  userId?: number | string;
  fromDate?: string;
  toDate?: string;
  resetSeconds?: number;
  tags?: string;
  trendBuckets?: number;
  tableLimit?: number;
}

// ── Time range option ─────────────────────────────────────────────────────────

export interface TimeRangeOption {
  label: string;
  value: number;
}

// ── ViewData classes (one per widget, carry loader id + resolved data) ────────

export class TokenSummaryWidgetData {
  loader = 'tbTokenSummaryLoader';
  totalTokens = 0;
  inputTokens = 0;
  outputTokens = 0;
  totalCostUsd = 0;
  observationCount = 0;
  donutChart: UnityChartDetails;
}

export class ModelCostWidgetData {
  loader = 'tbModelCostLoader';
  rows: ModelCost[] = [];
}

export class CreditSummaryWidgetData {
  loader = 'tbCreditSummaryLoader';
  usedCredit = 0;
  remainingCredit = 0;
  totalCredit = 0;
  donutChart: UnityChartDetails;
}

export class TokenTrendWidgetData {
  loader = 'tbTokenTrendLoader';
  chartData: UnityChartDetails;
}

export class UsageByAppWidgetData {
  loader = 'tbTracesByTimeLoader';
  chartData: UnityChartDetails;
  totalTracesTracked = 0;
}

export class ModelUsageWidgetData {
  loader = 'tbModelUsageLoader';
  chartData: UnityChartDetails;
  totalCostUsd = 0;
  allModels: string[] = [];
  selectedModels: string[] = [];
}

export class UserConsumptionWidgetData {
  loader = 'tbUserConsumptionLoader';
  chartData: UnityChartDetails;
  totalCostUsd = 0;
  allUsers: string[] = [];
  selectedUsers: string[] = [];
}
