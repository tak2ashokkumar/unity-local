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
  totalTokens = 0;
  allUsers: string[] = [];
  selectedUsers: string[] = [];
}

interface LangfusePercentileMetric {
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  unit: string;
}

interface LangfuseCostMetric {
  total_cost_usd: number;
  from_timestamp: string;
  metric: string;
  source: string;
  to_timestamp: string;
  unit: string;
}

interface LangfuseTokenCost {
  tokens: number;
  cost_usd: number;
  cost_per_1k_tokens_usd: number;
}

interface LangfuseRateValue {
  source: string;
  sample_count: number;
  value: number;
}

export interface LangfuseMetricsResponse {
  time_window: TimeWindow;
  end_to_end_response_time: LangfusePercentileMetric & { request_count: number };
  agent_cost_per_task: LangfuseCostMetric & {
    agent_tags: string[];
    average_cost_per_task_usd: number;
    task_count: number;
  };
  cost_per_1k_tokens: {
    from_timestamp: string;
    metric: string;
    source: string;
    to_timestamp: string;
    input: LangfuseTokenCost;
    output: LangfuseTokenCost;
    unit: string;
  };
  time_to_first_token: LangfusePercentileMetric & { observation_count: number };
  number_of_llm_calls: { count: number };
  steps_per_task: {
    distribution?: number[];
    by_session?: Array<{ steps: number; session_id: string }>;
    task_count: number;
    avg_steps: number;
  };
  cost_per_request: LangfuseCostMetric & {
    request_count: number;
    average_cost_per_request_usd: number;
  };
  source: string;
  latency_percentiles: LangfusePercentileMetric & {
    observation_count: number;
    p75_ms: number;
    p90_ms: number;
    min_ms: number;
    avg_ms: number;
    max_ms: number;
  };
  tokens_per_request: {
    input_tokens: { avg: number; p95: number };
    output_tokens: { avg: number; p95: number };
    request_count: number;
  };
  tool_call_latency: Array<{
    tool: string;
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    avg_ms: number;
  }>;
  token_consumption_by_llm_response: Array<{
    raw_models: string[];
    input_tokens: number;
    response_count: number;
    model: string;
    total_tokens: number;
    output_tokens: number;
  }>;
  throughput: {
    tokens_per_second: number;
    total_tokens: number;
    window_seconds: number;
    requests_per_second: number;
    request_count: number;
  };
  inter_token_latency: {
    values_ms: number[];
    observation_count: number;
    avg_ms: number;
    unit: string;
  };
  expensive_users_vs_token_consumption: Array<{
    user_id: string;
    input_tokens: number;
    total_cost_usd: number;
    llm_call_count: number;
    total_tokens: number;
    user_tag: string;
    output_tokens: number;
  }>;
  expensive_llm_calls_vs_token_consumption: Array<{
    input_tokens: number;
    output_tokens: number;
    total_cost_usd: number;
    call_name: string;
    model: string;
    total_tokens: number;
    llm_call_count: number;
  }>;
  cost_per_successful_completion?: {
    total_generation_cost_usd: number;
    cost_per_successful_completion_usd: number;
    successful_completion_count: number;
    unit: string;
  };
  ab_model_comparison?: LangfuseScoreMetric;
  trace_success_failure_rates?: {
    successful_trace_count: number;
    failed_trace_count: number;
    trace_count: number;
    success_rate: LangfuseRateValue;
    failure_rate: LangfuseRateValue;
  };
  total_token_consumption?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    generation_count: number;
  };
  cost_per_user?: {
    user_count: number;
    users: Array<{
      total_cost_usd: number;
      user_id: string;
      generation_count: number;
    }>;
    calculation_truncated: boolean;
    unit: string;
  };
  embedding_drift_centroid?: LangfuseScoreMetric;
  span_kind_operation_count?: {
    span_kind: string;
    operations: Array<{
      span_kind: string;
      count: number;
      operation: string;
    }>;
    operation_count: number;
  };
  task_completion_rate?: {
    completed_task_count: number;
    failed_task_count: number;
    task_count: number;
    completion_rate: LangfuseRateValue;
  };
  monthly_llm_spend?: {
    spend_usd: number;
    budget_usd: number;
    remaining_budget_usd: number;
    over_budget_usd: number;
    budget_utilization_percentage: number;
    within_budget: boolean;
    generation_count: number;
    unit: string;
  };
  inference_error_rate?: {
    error_rate: LangfuseRateValue;
    inference_count: number;
    error_count: number;
  };
  cache_hit_rate?: {
    sample_count: number;
    truncated: boolean;
    value: number;
    cached_input_tokens: number;
    cacheable_input_tokens: number;
    generation_count: number;
  };
  semantic_cache_hit_rate?: {
    sample_count: number;
    truncated: boolean;
    value: number | null;
    semantic_cache_hit_count: number;
    semantic_cache_lookup_count: number;
  };
  token_waste_ratio?: {
    sample_count: number;
    truncated: boolean;
    value: number;
    wasted_tokens: number;
    total_tokens: number;
    generation_count: number;
  };
}

interface LangfuseScoreMetric {
  min_score: number;
  average_score: number;
  sample_count: number;
  metric: string;
  artificial: boolean;
  score_type: 'boolean' | 'numeric';
  source: string;
  from_date: string;
  to_date: string;
  percentage: number;
  max_score: number;
}

export interface LangfuseLlmJudgeMetricsResponse {
  data_leakage_sensitive_output_rate?: LangfuseScoreMetric;
  agent_loop_stuck_detection?: LangfuseScoreMetric;
  hallucination_rate?: LangfuseScoreMetric;
  factual_accuracy_score?: LangfuseScoreMetric;
  relevance_score?: LangfuseScoreMetric;
  faithfulness_score?: LangfuseScoreMetric;
  answer_completeness?: LangfuseScoreMetric;
  regression_rate_post_update?: LangfuseScoreMetric;
  answer_relevancy_trend?: LangfuseScoreMetric;
  format_compliance_rate?: LangfuseScoreMetric;
  error_recovery_self_correction_rate?: LangfuseScoreMetric;
  source: string;
  time_window: {
    from_date: string;
    to_date: string;
  };
}

export interface LangfuseGuardrailMetricsResponse {
  time_window: {
    from_date: string;
    to_date: string;
  };
  block_rate?: {
    input?: LangfuseScoreMetric;
    output?: LangfuseScoreMetric;
    cumulative?: LangfuseScoreMetric;
  };
  mcp_arguments_pii_exposure_rate?: LangfuseScoreMetric;
  mcp_unauthorized_blocked_call_rate?: LangfuseScoreMetric;
  input_harmful_or_unauthorized_request_rate?: LangfuseScoreMetric;
  input_toxicity_harmful_content_rate?: LangfuseScoreMetric;
  sentiment_shift?: LangfuseScoreMetric;
  refusal_rate?: LangfuseScoreMetric;
  harmful_output_rate?: LangfuseScoreMetric;
  output_sensitive_data_leakage_rate?: LangfuseScoreMetric;
  jailbreak_prompt_injection_rate?: LangfuseScoreMetric;
  bias_fairness_score?: LangfuseScoreMetric;
  source?: string;
}

interface LangfuseMcpRateMetric {
  source: string;
  sample_count: number;
  value: number;
}

export interface LangfuseMcpMetricsResponse {
  time_window: {
    from_date: string;
    to_date: string;
  };
  mcp_tool_cost_per_call: {
    total_cost_usd: number;
    cost_per_tool_call_usd: number;
    metric: string;
    source: string;
    from_date: string;
    to_date: string;
    tool_call_count: number;
    unit: string;
  };
  mcp_tool_call_latency: {
    p99: number;
    avg: number;
    sample_count: number;
    min: number;
    max: number;
    p95: number;
    total: number;
    p50: number;
    unit: string;
  };
  mcp_tool_call_success_rate: LangfuseMcpRateMetric & {
    failed_call_count: number;
    successful_call_count: number;
  };
  mcp_result_correctness: LangfuseMcpRateMetric;
  mcp_argument_schema_validity_rate: LangfuseMcpRateMetric;
  mcp_tool_retry_rate: LangfuseMcpRateMetric & { retry_count: number };
  mcp_server_availability_uptime: LangfuseMcpRateMetric & { note: string };
  mcp_redundant_unnecessary_call_rate: LangfuseMcpRateMetric & { redundant_call_count: number };
  mcp_tool_selection_accuracy: LangfuseMcpRateMetric & { correct_selection_score_total: number };
  mcp_tool_coverage_utilization: {
    coverage: {
      registered_tool_count: number;
      used_tool_count: number;
      value: number;
    };
    utilization: Array<{
      tool: string;
      percentage: number;
      calls: number;
    }>;
  };
  mcp_tool_call_error_rate: LangfuseMcpRateMetric & {
    by_type: { [key: string]: number };
  };
}
