import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { startCase } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { TokenBillingDashboardService } from '../token-billing-dashboard/token-billing-dashboard.service';
import { LangfuseAgentMetrics, LangfuseAgentsMetricsResponse } from '../token-billing-dashboard/token-billing-dashboard.types';
import { TokenBillingAgentsService } from './token-billing-agents.service';

type AgentsRangeValue = 'last24h' | 'last7d' | 'last30d' | 'currentMonth' | 'custom';

const TIME_RANGE_OPTIONS = [
  { label: 'Last 24h', value: 'last24h' },
  { label: 'Last 7d', value: 'last7d' },
  { label: 'Last 30d', value: 'last30d' },
  { label: 'Current Month', value: 'currentMonth' },
  { label: 'Custom', value: 'custom' },
];

@Component({
  selector: 'token-billing-agents',
  templateUrl: './token-billing-agents.component.html',
  styleUrls: ['./token-billing-agents.component.scss'],
})
export class TokenBillingAgentsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  timeRangeOptions = TIME_RANGE_OPTIONS;
  selectedRange: AgentsRangeValue = 'last24h';
  customFromDate = '';
  customToDate = '';
  agentOptions: string[] = [];
  selectedAgent = 'compute_agent';
  formatAgentName = startCase;
  isLoading = true;
  agentMetricsData: LangfuseAgentMetrics = null;
  graphData: { [key: string]: UnityChartDetails } = {};
  loaders = {
    averageScores: 'agentsAverageScores',
    endToEndLatency: 'agentsEndToEndLatency',
    toolCallLatency: 'agentsToolCallLatency',
  };

  constructor(
    private svc: TokenBillingDashboardService,
    private agentsSvc: TokenBillingAgentsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private userInfo: UserInfoService,
  ) { }

  ngOnInit(): void {
    const today = this.toYmd(new Date());
    this.customFromDate = today;
    this.customToDate = today;
    setTimeout(() => this.getData());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onAgentChange(): void {
    this.getData();
  }

  onTimeRangeChange(): void {
    if (this.selectedRange !== 'custom') {
      const range = this.getSelectedDateRange();
      this.customFromDate = range.fromDate;
      this.customToDate = range.toDate;
      this.getData();
    }
  }

  onCustomDateChange(): void {
    if (this.selectedRange === 'custom' && this.customFromDate && this.customToDate) {
      this.getData();
    }
  }

  refreshData(): void {
    this.getData();
  }

  getData(): void {
    const range = this.getSelectedDateRange();
    if (!range.fromDate || !range.toDate) return;

    this.isLoading = true;
    this.agentMetricsData = null;
    this.graphData = {};
    Object.values(this.loaders).forEach(loader => this.spinner.start(loader));
    this.agentsSvc.getAgentsMetrics(this.userInfo.userOrgId, range.fromDate, range.toDate, this.selectedAgent)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.agentOptions = res.dropdown_menu || this.agentOptions;
          this.selectedAgent = this.selectedAgent || this.agentOptions[0] || Object.keys(res.agents || {})[0];
          this.manageAgentMetricsData(res);
          this.stopLoading();
        },
        (err: HttpErrorResponse) => {
          this.stopLoading();
          this.notification.error(new Notification('Failed to load agent metrics. Please try again.'));
        },
      );
  }

  manageAgentMetricsData(res: LangfuseAgentsMetricsResponse): void {
    this.agentMetricsData = res.agents?.[this.selectedAgent]
      || Object.values(res.agents || {})[0] || null;
    if (!this.agentMetricsData) return;

    const averageScores = [
      { name: 'Regression', value: this.agentMetricsData.regression_rate_post_update?.average_score },
      { name: 'Hallucination', value: this.agentMetricsData.hallucination_rate?.average_score },
      { name: 'Error Recovery', value: this.agentMetricsData.error_recovery_self_correction_rate?.average_score },
      { name: 'Agent Loop', value: this.agentMetricsData.agent_loop_stuck_detection?.average_score },
      { name: 'Faithfulness', value: this.agentMetricsData.faithfulness_score?.average_score },
      { name: 'Answer Completeness', value: this.agentMetricsData.answer_completeness?.average_score },
      { name: 'Factual Accuracy', value: this.agentMetricsData.factual_accuracy_score?.average_score },
      { name: 'Answer Relevancy', value: this.agentMetricsData.answer_relevancy_trend?.average_score },
      { name: 'Format Compliance', value: this.agentMetricsData.format_compliance_rate?.average_score },
      { name: 'Relevance', value: this.agentMetricsData.relevance_score?.average_score },
    ].filter(item => item.value !== undefined && item.value !== null);
    const latency = this.agentMetricsData.end_to_end_agent_latency;
    const latencyValues = latency ? Object.entries(latency).filter(([key]) => key.endsWith('_ms')) : [];
    const toolLatencies = this.agentMetricsData.tool_call_latency?.tool_latencies || [];
    const toolMetrics = toolLatencies.length
      ? Object.keys(toolLatencies[0]).filter(key => key.endsWith('_ms')) : [];

    this.graphData = {
      averageScores: averageScores.length ? this.svc.convertToHeatMapViewData(
        averageScores.map(item => item.name),
        averageScores.map(item => Number(item.value)),
      ) : null,
      endToEndLatency: latencyValues.length ? this.svc.convertToBarGraphViewData(
        latencyValues.map(([key]) => key),
        [latencyValues.map(([, value]) => Number(value))],
        ['Latency (ms)'],
      ) : null,
      toolCallLatency: toolLatencies.length ? this.svc.convertToBarGraphViewData(
        toolLatencies.map(item => item.tool),
        toolMetrics.map(key => toolLatencies.map(item => Number(item[key]))),
        toolMetrics,
        true,
      ) : null,
    };
  }

  stopLoading(): void {
    this.isLoading = false;
    Object.values(this.loaders).forEach(loader => this.spinner.stop(loader));
  }

  formatCost(value: number): string {
    return this.svc.formatCost(value);
  }

  getSelectedDateRange(): { fromDate: string; toDate: string } {
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

  toYmd(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

}
