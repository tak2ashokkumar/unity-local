import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { TokenBillingDashboardService } from './token-billing-dashboard.service';
import {
  CreditSummaryWidgetData,
  LangfuseDashboardResponse,
  LangfuseGuardrailMetricsResponse,
  LangfuseLlmJudgeMetricsResponse,
  LangfuseMcpMetricsResponse,
  LangfuseMetricsResponse,
  ModelCostWidgetData,
  ModelUsageWidgetData,
  TokenSummaryWidgetData,
  TokenTrendWidgetData,
  UsageByAppWidgetData,
  UserConsumptionWidgetData,
} from './token-billing-dashboard.types';

type BillingDashboardRangeValue = 'last24h' | 'last7d' | 'last30d' | 'currentMonth' | 'custom';
type GraphFilterDropdown = 'model' | 'user';

interface BillingDashboardRangeOption {
  label: string;
  value: BillingDashboardRangeValue;
}

const TIME_RANGE_OPTIONS: BillingDashboardRangeOption[] = [
  { label: 'Last 24h', value: 'last24h' },
  { label: 'Last 7d', value: 'last7d' },
  { label: 'Last 30d', value: 'last30d' },
  { label: 'Current Month', value: 'currentMonth' },
  { label: 'Custom', value: 'custom' },
];

@Component({
  selector: 'token-billing-dashboard',
  templateUrl: './token-billing-dashboard.component.html',
  styleUrls: ['./token-billing-dashboard.component.scss'],
})
export class TokenBillingDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @ViewChild('modelFilterDropdown') private modelFilterDropdown?: BsDropdownDirective;
  @ViewChild('userFilterDropdown') private userFilterDropdown?: BsDropdownDirective;

  timeRangeOptions: BillingDashboardRangeOption[] = TIME_RANGE_OPTIONS;
  selectedRange: BillingDashboardRangeValue = 'last24h';
  customFromDate = '';
  customToDate = '';

  tokenSummaryData = new TokenSummaryWidgetData();
  modelCostData = new ModelCostWidgetData();
  creditSummaryData = new CreditSummaryWidgetData();
  tokenTrendData = new TokenTrendWidgetData();
  usageByAppData = new UsageByAppWidgetData();
  modelUsageData = new ModelUsageWidgetData();
  modelTokenUsageData = new UserConsumptionWidgetData();
  isDashboardLoading = true;
  isLangfuseMetricsLoading = true;
  isLlmJudgeMetricsLoading = true;
  isGuardrailMetricsLoading = true;
  isMcpMetricsLoading = true;
  metricLoaders = {
    langfuse: {
      endToEndResponseTime: 'endToEndResponseTime',
      timeToFirstToken: 'timeToFirstToken',
      tokensPerRequest: 'tokensPerRequest',
      latencyPercentiles: 'latencyPercentiles',
      toolCallLatency: 'toolCallLatency',
      costPer1kTokens: 'costPer1kTokens',
      interTokenLatency: 'interTokenLatency',
      tokenConsumptionByLlmResponse: 'tokenConsumptionByLlmResponse',
      expensiveUsersVsTokenConsumption: 'expensiveUsersVsTokenConsumption',
      expensiveLlmCallsVsTokenConsumption: 'expensiveLlmCallsVsTokenConsumption',
      agentCostPerTask: 'agentCostPerTask',
      numberOfLlmCalls: 'numberOfLlmCalls',
      costPerRequest: 'costPerRequest',
      throughput: 'throughput',
      stepsBySession: 'stepsBySession',
      stepsPerTaskDistribution: 'stepsPerTaskDistribution',
      costPerSuccessfulCompletion: 'costPerSuccessfulCompletion',
      abModelComparison: 'abModelComparison',
      embeddingDriftCentroid: 'embeddingDriftCentroid',
      cacheHitRate: 'cacheHitRate',
      semanticCacheHitRate: 'semanticCacheHitRate',
      traceSuccessFailureRates: 'traceSuccessFailureRates',
      totalTokenConsumption: 'totalTokenConsumption',
      taskCompletionRate: 'taskCompletionRate',
      costPerUser: 'costPerUser',
      spanKindOperationCount: 'spanKindOperationCount',
      monthlyLlmSpend: 'monthlyLlmSpend',
      inferenceErrorRate: 'inferenceErrorRate',
      tokenWasteRatio: 'tokenWasteRatio',
    },
    llmJudge: { averageScores: 'llmJudgeAverageScores' },
    guardrail: { averageScores: 'guardrailAverageScores' },
    mcp: {
      toolCostPerCall: 'mcpToolCostPerCall',
      resultCorrectness: 'mcpResultCorrectness',
      argumentSchemaValidity: 'mcpArgumentSchemaValidity',
      toolRetryRate: 'mcpToolRetryRate',
      toolCallSuccessRate: 'mcpToolCallSuccessRate',
      toolCallLatency: 'mcpToolCallLatency',
      toolCoverage: 'mcpToolCoverage',
      toolUtilization: 'mcpToolUtilization',
      serverAvailability: 'mcpServerAvailability',
      redundantCallRate: 'mcpRedundantCallRate',
      toolSelectionAccuracy: 'mcpToolSelectionAccuracy',
      toolCallErrorRate: 'mcpToolCallErrorRate',
      fallback: 'mcpMetricsFallback',
    },
  };
  langfuseMetricsData: LangfuseMetricsResponse;
  langfuseLlmJudgeMetricsData: LangfuseLlmJudgeMetricsResponse;
  langfuseGuardrailMetricsData: LangfuseGuardrailMetricsResponse;
  langfuseMcpMetricsData: LangfuseMcpMetricsResponse;
  langfuseGraphData: { [key: string]: UnityChartDetails } = {};

  private lastDashboardData: LangfuseDashboardResponse = null;

  constructor(
    private svc: TokenBillingDashboardService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private userInfo: UserInfoService,
  ) { }

  ngOnInit(): void {
    const today = this.toYmd(new Date());
    this.customFromDate = today;
    this.customToDate = today;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadAll());
  }

  onTimeRangeChange(): void {
    this.closeFilterDropdowns();
    if (this.selectedRange !== 'custom') {
      const range = this.getSelectedDateRange();
      this.customFromDate = range.fromDate;
      this.customToDate = range.toDate;
      this.loadAll();
    }
  }

  onCustomDateChange(): void {
    this.closeFilterDropdowns();
    if (this.selectedRange === 'custom' && this.customFromDate && this.customToDate) {
      this.loadAll();
    }
  }

  refreshData(): void {
    this.closeFilterDropdowns();
    this.loadAll();
  }

  loadAll(): void {
    this.closeFilterDropdowns();
    const range = this.getSelectedDateRange();
    if (!range.fromDate || !range.toDate) return;
    this.langfuseGraphData = {};
    this.getLangfuseMetrics(range.fromDate, range.toDate);
    this.getLangfuseLlmJudgeMetrics(range.fromDate, range.toDate);
    this.getLangfuseGuardrailMetrics(range.fromDate, range.toDate);
    this.getLangfuseMcpMetrics(range.fromDate, range.toDate);

    const prevSelectedModels = this.modelUsageData.selectedModels.length ? this.modelUsageData.selectedModels : undefined;
    const prevSelectedUsers = this.modelTokenUsageData.selectedUsers.length ? this.modelTokenUsageData.selectedUsers : undefined;

    this.resetDashboardData(prevSelectedModels, prevSelectedUsers);
    this.isDashboardLoading = true;
    this.startAllSpinners();

    this.svc.getDashboardData({
      orgId: this.userInfo.userOrgId,
      userId: this.userInfo.userDetails.id,
      fromDate: range.fromDate,
      toDate: range.toDate,
    }).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          // const effective = this.svc.injectMockIfEmpty(res); // mock fallback — re-enable to demo with mock data
          const effective = res;
          this.lastDashboardData = effective;
          this.tokenSummaryData = this.svc.buildTokenSummaryWidgetData(effective);
          this.modelCostData = this.svc.buildModelCostWidgetData(effective);
          this.creditSummaryData = this.svc.buildCreditSummaryWidgetData(effective);
          this.tokenTrendData = this.svc.buildTokenTrendWidgetData(effective);
          this.usageByAppData = this.svc.buildUsageByAppWidgetData(effective);
          this.modelUsageData = this.svc.buildModelUsageWidgetData(effective, prevSelectedModels);
          this.modelTokenUsageData = this.svc.buildUserConsumptionWidgetData(effective, prevSelectedUsers);
          this.stopAllSpinners();
        },
        (_err: HttpErrorResponse) => {
          this.stopAllSpinners();
          this.notification.error(new Notification('Failed to load Token Billing data. Please try again.'));
        },
      );
  }

  isModelSelected(model: string): boolean {
    return this.modelUsageData.selectedModels.includes(model);
  }

  toggleModel(model: string): void {
    const idx = this.modelUsageData.selectedModels.indexOf(model);
    if (idx > -1) {
      this.modelUsageData.selectedModels.splice(idx, 1);
    } else {
      this.modelUsageData.selectedModels.push(model);
    }
    if (this.lastDashboardData) {
      const selected = [...this.modelUsageData.selectedModels];
      this.modelUsageData = this.svc.buildModelUsageWidgetData(this.lastDashboardData, selected);
      this.modelUsageData.selectedModels = selected;
      this.modelFilterDropdown?.show();
    }
  }

  isUserSelected(user: string): boolean {
    return this.modelTokenUsageData.selectedUsers.includes(user);
  }

  toggleUser(user: string): void {
    const idx = this.modelTokenUsageData.selectedUsers.indexOf(user);
    if (idx > -1) {
      this.modelTokenUsageData.selectedUsers.splice(idx, 1);
    } else {
      this.modelTokenUsageData.selectedUsers.push(user);
    }
    if (this.lastDashboardData) {
      const selected = [...this.modelTokenUsageData.selectedUsers];
      this.modelTokenUsageData = this.svc.buildUserConsumptionWidgetData(this.lastDashboardData, selected);
      this.modelTokenUsageData.selectedUsers = selected;
      this.userFilterDropdown?.show();
    }
  }

  onFilterDropdownOpenChange(dropdown: GraphFilterDropdown, isOpen: boolean): void {
    if (!isOpen) return;
    const otherDropdown = dropdown === 'model' ? this.userFilterDropdown : this.modelFilterDropdown;
    otherDropdown?.hide();
  }

  closeFilterDropdowns(): void {
    this.modelFilterDropdown?.hide();
    this.userFilterDropdown?.hide();
  }

  formatCost(val: number): string { return this.svc.formatCost(val); }
  formatCredit(val: number): string { return this.svc.formatCredit(val); }
  formatRowCost(val: number): string { return this.svc.formatRowCost(val); }
  formatTokens(val: number): string { return this.svc.formatTokens(val); }

  ngOnDestroy(): void {
    this.stopAllSpinners();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private resetDashboardData(selectedModels?: string[], selectedUsers?: string[]): void {
    this.tokenSummaryData = new TokenSummaryWidgetData();
    this.modelCostData = new ModelCostWidgetData();
    this.creditSummaryData = new CreditSummaryWidgetData();
    this.tokenTrendData = new TokenTrendWidgetData();
    this.usageByAppData = new UsageByAppWidgetData();
    this.modelUsageData = new ModelUsageWidgetData();
    this.modelTokenUsageData = new UserConsumptionWidgetData();
    this.modelUsageData.selectedModels = selectedModels ? [...selectedModels] : [];
    this.modelTokenUsageData.selectedUsers = selectedUsers ? [...selectedUsers] : [];
  }

  private startAllSpinners(): void {
    this.spinner.start(this.tokenSummaryData.loader);
    this.spinner.start(this.modelCostData.loader);
    this.spinner.start(this.creditSummaryData.loader);
    this.spinner.start(this.tokenTrendData.loader);
    this.spinner.start(this.modelUsageData.loader);
    this.spinner.start(this.usageByAppData.loader);
    this.spinner.start(this.modelTokenUsageData.loader);
  }

  private stopAllSpinners(): void {
    this.spinner.stop(this.tokenSummaryData.loader);
    this.spinner.stop(this.modelCostData.loader);
    this.spinner.stop(this.creditSummaryData.loader);
    this.spinner.stop(this.tokenTrendData.loader);
    this.spinner.stop(this.modelUsageData.loader);
    this.spinner.stop(this.usageByAppData.loader);
    this.spinner.stop(this.modelTokenUsageData.loader);
    this.isDashboardLoading = false;
  }

  private getSelectedDateRange(): { fromDate: string; toDate: string } {
    const today = new Date();
    if (this.selectedRange === 'custom') {
      return { fromDate: this.customFromDate, toDate: this.customToDate };
    }
    if (this.selectedRange === 'currentMonth') {
      return {
        fromDate: this.toYmd(new Date(today.getFullYear(), today.getMonth(), 1)),
        toDate: this.toYmd(today),
      };
    }
    const daysBack = this.selectedRange === 'last7d' ? 6 : this.selectedRange === 'last30d' ? 29 : 1;
    const from = new Date(today);
    from.setDate(today.getDate() - daysBack);
    return { fromDate: this.toYmd(from), toDate: this.toYmd(today) };
  }

  private toYmd(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  getLangfuseMetrics(fromDate: string, toDate: string): void {
    this.isLangfuseMetricsLoading = true;
    this.langfuseMetricsData = null;
    Object.values(this.metricLoaders.langfuse).forEach(loader => this.spinner.start(loader));
    this.svc.getLangfuseMetrics(this.userInfo.userOrgId, fromDate, toDate)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.isLangfuseMetricsLoading = false;
          Object.values(this.metricLoaders.langfuse).forEach(loader => this.spinner.stop(loader));
          this.manageMetricsData(res);
        },
        (err: HttpErrorResponse) => {
          this.isLangfuseMetricsLoading = false;
          Object.values(this.metricLoaders.langfuse).forEach(loader => this.spinner.stop(loader));
          this.langfuseMetricsData = null;
          this.notification.error(new Notification('Failed to load Langfuse metrics. Please try again.'));
        },
      );
  }

  manageMetricsData(res: LangfuseMetricsResponse): void {
    this.langfuseMetricsData = res;
    const metricGraph = (data: any, name: string) => {
      const entries = Object.entries(data).filter(([key]) => key.endsWith('_ms'));
      return this.svc.convertToBarGraphViewData(
        entries.map(([key]) => key), [entries.map(([, value]) => Number(value))], [name],
      );
    };
    const latencyPercentiles = Object.entries(res.latency_percentiles)
      .filter(([key]) => key.endsWith('_ms'));
    const tokenTypes = Object.keys(res.tokens_per_request).filter(key => key.endsWith('_tokens'));
    const toolMetrics = res.tool_call_latency.length
      ? Object.keys(res.tool_call_latency[0]).filter(key => key.endsWith('_ms')) : [];
    const costTypes = Object.keys(res.cost_per_1k_tokens)
      .filter(key => typeof (res.cost_per_1k_tokens as any)[key] === 'object');
    const llmTokenTypes = res.expensive_llm_calls_vs_token_consumption.length
      ? Object.keys(res.expensive_llm_calls_vs_token_consumption[0])
        .filter(key => key.endsWith('_tokens') && key !== 'total_tokens') : [];
    const stepsDistribution = res.steps_per_task.distribution || [];
    const stepsBySession = res.steps_per_task.by_session || [];
    const costPerUser = res.cost_per_user?.users || [];
    const spanOperations = res.span_kind_operation_count?.operations || [];
    const monthlySpend = res.monthly_llm_spend;
    const monthlySpendData = monthlySpend ? [
      { name: 'Spent', value: Math.min(monthlySpend.spend_usd, monthlySpend.budget_usd) },
      { name: 'Remaining', value: monthlySpend.remaining_budget_usd },
    ] : [];
    if (monthlySpend?.over_budget_usd) {
      monthlySpendData.push({ name: 'Over Budget', value: monthlySpend.over_budget_usd });
    }

    this.langfuseGraphData = {
      ...this.langfuseGraphData,
      endToEndResponseTime: metricGraph(res.end_to_end_response_time, 'Response Time'),
      timeToFirstToken: metricGraph(res.time_to_first_token, 'Time to First Token'),
      latencyPercentiles: latencyPercentiles.length ? this.svc.convertToHeatMapViewData(
        latencyPercentiles.map(([key]) => key),
        latencyPercentiles.map(([, value]) => Number(value)),
        'Latency (ms)',
        Math.max(...latencyPercentiles.map(([, value]) => Number(value))),
      ) : null,
      tokensPerRequest: this.svc.convertToBarGraphViewData(
        Object.keys(res.tokens_per_request.input_tokens),
        tokenTypes.map(key => Object.values((res.tokens_per_request as any)[key]).map(Number)), tokenTypes,
      ),
      toolCallLatency: res.tool_call_latency.length ? this.svc.convertToBarGraphViewData(
        res.tool_call_latency.map(item => item.tool),
        toolMetrics.map(key => res.tool_call_latency.map(item => Number((item as any)[key]))),
        toolMetrics, true,
      ) : null,
      costPer1kTokens: this.svc.convertToBarGraphViewData(
        costTypes,
        [costTypes.map(key => Number((res.cost_per_1k_tokens as any)[key].cost_per_1k_tokens_usd))],
        [res.cost_per_1k_tokens.unit],
      ),
      interTokenLatency: res.inter_token_latency.values_ms.length ? this.svc.convertToLineGraphViewData(
        res.inter_token_latency.values_ms.map((_value, index) => `${index + 1}`),
        [res.inter_token_latency.values_ms], [res.inter_token_latency.unit], true,
      ) : null,
      tokenConsumptionByLlmResponse: res.token_consumption_by_llm_response.length
        ? this.svc.convertToPieGraphViewData(
          res.token_consumption_by_llm_response.map(item => ({ name: item.model, value: item.total_tokens })),
          true, 'Token Consumption', 18, 4,
        ) : null,
      expensiveUsersVsTokenConsumption: res.expensive_users_vs_token_consumption.length
        ? this.svc.convertToBarGraphViewData(
          res.expensive_users_vs_token_consumption.map(item => item.user_tag),
          [res.expensive_users_vs_token_consumption.map(item => item.total_tokens)], ['Total Tokens'], true,
        ) : null,
      expensiveLlmCallsVsTokenConsumption: res.expensive_llm_calls_vs_token_consumption.length
        ? this.svc.convertToBarGraphViewData(
          res.expensive_llm_calls_vs_token_consumption.map(item => item.call_name),
          llmTokenTypes.map(key => res.expensive_llm_calls_vs_token_consumption.map(item => Number((item as any)[key]))),
          llmTokenTypes, true, true,
        ) : null,
      stepsPerTaskDistribution: stepsDistribution.length
        ? this.svc.convertToBarGraphViewData(
          stepsDistribution.map((_value, index) => `${index + 1}`),
          [stepsDistribution], ['Steps'],
        ) : null,
      stepsBySession: stepsBySession.length
        ? this.svc.convertToHeatMapViewData(
          stepsBySession.map(item => item.session_id),
          stepsBySession.map(item => item.steps),
          'Steps', Math.max(...stepsBySession.map(item => item.steps)), 16,
        ) : null,
      traceSuccessFailureRates: res.trace_success_failure_rates?.trace_count
        ? this.svc.convertToPieGraphViewData([
          { name: 'Successful', value: res.trace_success_failure_rates.successful_trace_count },
          { name: 'Failed', value: res.trace_success_failure_rates.failed_trace_count },
        ], true, 'Trace Status') : null,
      totalTokenConsumption: res.total_token_consumption?.total_tokens
        ? this.svc.convertToPieGraphViewData([
          { name: 'Input', value: res.total_token_consumption.input_tokens },
          { name: 'Output', value: res.total_token_consumption.output_tokens },
        ], true, 'Token Type') : null,
      taskCompletionRate: res.task_completion_rate?.task_count
        ? this.svc.convertToPieGraphViewData([
          { name: 'Completed', value: res.task_completion_rate.completed_task_count },
          { name: 'Failed', value: res.task_completion_rate.failed_task_count },
        ], true, 'Task Status') : null,
      costPerUser: costPerUser.length ? this.svc.convertToBarGraphViewData(
        costPerUser.map(item => item.user_id),
        [costPerUser.map(item => item.total_cost_usd)], ['Cost (USD)'], true,
      ) : null,
      spanKindOperationCount: spanOperations.length ? this.svc.convertToBarGraphViewData(
        spanOperations.map(item => item.operation),
        [spanOperations.map(item => item.count)], ['Count'], true,
      ) : null,
      monthlyLlmSpend: monthlySpendData.length
        ? this.svc.convertToPieGraphViewData(monthlySpendData, true, 'Budget') : null,
      inferenceErrorRate: res.inference_error_rate?.inference_count
        ? this.svc.convertToPieGraphViewData([
          { name: 'Errors', value: res.inference_error_rate.error_count },
          {
            name: 'Successful',
            value: res.inference_error_rate.inference_count - res.inference_error_rate.error_count,
          },
        ], true, 'Inference Status') : null,
      tokenWasteRatio: res.token_waste_ratio?.total_tokens
        ? this.svc.convertToPieGraphViewData([
          { name: 'Wasted', value: res.token_waste_ratio.wasted_tokens },
          { name: 'Useful', value: res.token_waste_ratio.total_tokens - res.token_waste_ratio.wasted_tokens },
        ], true, 'Token Type') : null,
    };
  }

  getLangfuseLlmJudgeMetrics(fromDate: string, toDate: string): void {
    this.isLlmJudgeMetricsLoading = true;
    this.langfuseLlmJudgeMetricsData = null;
    Object.values(this.metricLoaders.llmJudge).forEach(loader => this.spinner.start(loader));
    this.svc.getLangfuseLlmJudgeMetrics(this.userInfo.userOrgId, fromDate, toDate)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.isLlmJudgeMetricsLoading = false;
          Object.values(this.metricLoaders.llmJudge).forEach(loader => this.spinner.stop(loader));
          this.manageLlmJudgeMetricsData(res);
        },
        (err: HttpErrorResponse) => {
          this.isLlmJudgeMetricsLoading = false;
          Object.values(this.metricLoaders.llmJudge).forEach(loader => this.spinner.stop(loader));
          this.langfuseLlmJudgeMetricsData = null;
          this.notification.error(new Notification('Failed to load LLM Judge metrics. Please try again.'));
        },
      );
  }

  manageLlmJudgeMetricsData(res: LangfuseLlmJudgeMetricsResponse): void {
    this.langfuseLlmJudgeMetricsData = res;
    const averageScores = [
      { name: 'Data Leakage', value: res.data_leakage_sensitive_output_rate?.average_score },
      { name: 'Agent Loop', value: res.agent_loop_stuck_detection?.average_score },
      { name: 'Hallucination', value: res.hallucination_rate?.average_score },
      { name: 'Factual Accuracy', value: res.factual_accuracy_score?.average_score },
      { name: 'Relevance', value: res.relevance_score?.average_score },
      { name: 'Faithfulness', value: res.faithfulness_score?.average_score },
      { name: 'Answer Completeness', value: res.answer_completeness?.average_score },
      { name: 'Regression', value: res.regression_rate_post_update?.average_score },
      { name: 'Answer Relevancy', value: res.answer_relevancy_trend?.average_score },
      { name: 'Format Compliance', value: res.format_compliance_rate?.average_score },
      { name: 'Error Recovery', value: res.error_recovery_self_correction_rate?.average_score },
    ].filter(item => item.value !== undefined && item.value !== null);
    this.langfuseGraphData = {
      ...this.langfuseGraphData,
      llmJudgeAverageScores: averageScores.length ? this.svc.convertToHeatMapViewData(
        averageScores.map(item => item.name),
        averageScores.map(item => Number(item.value)),
      ) : null,
    };
  }

  getLangfuseGuardrailMetrics(fromDate: string, toDate: string): void {
    this.isGuardrailMetricsLoading = true;
    this.langfuseGuardrailMetricsData = null;
    Object.values(this.metricLoaders.guardrail).forEach(loader => this.spinner.start(loader));
    this.svc.getLangfuseGuardrailMetrics(this.userInfo.userOrgId, fromDate, toDate)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.isGuardrailMetricsLoading = false;
          Object.values(this.metricLoaders.guardrail).forEach(loader => this.spinner.stop(loader));
          this.manageGuardrailMetricsData(res);
        },
        (err: HttpErrorResponse) => {
          this.isGuardrailMetricsLoading = false;
          Object.values(this.metricLoaders.guardrail).forEach(loader => this.spinner.stop(loader));
          this.langfuseGuardrailMetricsData = null;
          this.notification.error(new Notification('Failed to load guardrail metrics. Please try again.'));
        },
      );
  }

  manageGuardrailMetricsData(res: LangfuseGuardrailMetricsResponse): void {
    this.langfuseGuardrailMetricsData = res;
    const averageScores = [
      { name: 'Input Block Rate', value: res.block_rate?.input?.average_score },
      { name: 'Output Block Rate', value: res.block_rate?.output?.average_score },
      { name: 'MCP Arguments PII Exposure', value: res.mcp_arguments_pii_exposure_rate?.average_score },
      { name: 'MCP Unauthorized Calls', value: res.mcp_unauthorized_blocked_call_rate?.average_score },
      { name: 'Harmful Input', value: res.input_harmful_or_unauthorized_request_rate?.average_score },
      { name: 'Input Toxicity', value: res.input_toxicity_harmful_content_rate?.average_score },
      { name: 'Sentiment Shift', value: res.sentiment_shift?.average_score },
      { name: 'Refusal Rate', value: res.refusal_rate?.average_score },
      { name: 'Harmful Output', value: res.harmful_output_rate?.average_score },
      { name: 'Sensitive Data Leakage', value: res.output_sensitive_data_leakage_rate?.average_score },
      { name: 'Jailbreak / Prompt Injection', value: res.jailbreak_prompt_injection_rate?.average_score },
      { name: 'Bias / Fairness', value: res.bias_fairness_score?.average_score },
    ].filter(item => item.value !== undefined && item.value !== null);

    this.langfuseGraphData = {
      ...this.langfuseGraphData,
      guardrailAverageScores: averageScores.length ? this.svc.convertToHeatMapViewData(
        averageScores.map(item => item.name),
        averageScores.map(item => Number(item.value)),
      ) : null,
    };
  }

  getLangfuseMcpMetrics(fromDate: string, toDate: string): void {
    this.isMcpMetricsLoading = true;
    Object.values(this.metricLoaders.mcp).forEach(loader => this.spinner.start(loader));
    this.svc.getLangfuseMcpMetrics(this.userInfo.userOrgId, fromDate, toDate)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.isMcpMetricsLoading = false;
          Object.values(this.metricLoaders.mcp).forEach(loader => this.spinner.stop(loader));
          this.manageMcpMetricsData(res);
        },
        (err: HttpErrorResponse) => {
          this.isMcpMetricsLoading = false;
          Object.values(this.metricLoaders.mcp).forEach(loader => this.spinner.stop(loader));
          this.langfuseMcpMetricsData = null;
          this.notification.error(new Notification('Failed to load MCP metrics. Please try again.'));
        },
      );
  }

  manageMcpMetricsData(res: LangfuseMcpMetricsResponse): void {
    this.langfuseMcpMetricsData = res;
    const coverage = res.mcp_tool_coverage_utilization.coverage;
    const utilization = res.mcp_tool_coverage_utilization.utilization || [];
    const utilizationGraph = utilization.length ? this.svc.convertToHeatMapViewData(
      utilization.map(item => item.tool),
      utilization.map(item => item.percentage),
      'Utilization (%)', 100,
    ) : null;

    if (utilizationGraph) {
      utilizationGraph.options.tooltip = {
        position: 'top',
        formatter: (params: any) => {
          const item = utilization[params.value[0]];
          return `${item.tool}<br/>Utilization: ${item.percentage}%<br/>Calls: ${item.calls}`;
        },
      };
    }

    this.langfuseGraphData = {
      ...this.langfuseGraphData,
      mcpToolCallSuccessRate: res.mcp_tool_call_success_rate.sample_count
        ? this.svc.convertToPieGraphViewData([
          { name: 'Successful', value: res.mcp_tool_call_success_rate.successful_call_count },
          { name: 'Failed', value: res.mcp_tool_call_success_rate.failed_call_count },
        ], true, 'Tool Call Status') : null,
      mcpToolCallLatency: this.svc.convertToBarGraphViewData(
        ['p50', 'p95', 'p99'],
        [[
          res.mcp_tool_call_latency.p50,
          res.mcp_tool_call_latency.p95,
          res.mcp_tool_call_latency.p99,
        ]],
        [res.mcp_tool_call_latency.unit],
      ),
      mcpToolCoverage: coverage.registered_tool_count ? this.svc.convertToPieGraphViewData([
        { name: 'Used', value: coverage.used_tool_count },
        { name: 'Unused', value: Math.max(coverage.registered_tool_count - coverage.used_tool_count, 0) },
      ], true, 'Tool Coverage') : null,
      mcpToolUtilization: utilizationGraph,
    };
  }
}
