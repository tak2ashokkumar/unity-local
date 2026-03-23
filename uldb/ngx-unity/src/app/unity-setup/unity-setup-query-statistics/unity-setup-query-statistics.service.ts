import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DashboardQueryLog, FeedbackTrend, QueryDetails, QueryStatisticsSummarySnake, TokenDetails, TopQueries } from './unity-setup-query-statistics.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Observable } from 'rxjs';
import { ChatbotTableViewData } from 'src/app/unity-chatbot/uc-table/uc-table.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { ChatHistoryData, UnityChatBotResponseChartData, UnityChatBotResponseTableData } from 'src/app/unity-chatbot/unity-chatbot.type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class UnitySetupQueryStatisticsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private userInfo: UserInfoService,
    private builder: FormBuilder) { }

  getqueryStatistics(criteria: SearchCriteria): Observable<PaginatedResult<DashboardQueryLog>> {
    return this.tableService.getData<PaginatedResult<DashboardQueryLog>>(`/chatbot/history/query/`, criteria);
  }

  getQueryDetails(view: DashboardQueryLogViewData): Observable<QueryDetails> {
    return this.http.get<QueryDetails>(`/chatbot/history/query/${view.queryId}/`);
  }

  getTopUsedQueries(): Observable<TopQueries[]> {
    return this.http.get<TopQueries[]>(`/chatbot/history/query/hot_queries/`);
  }

  getSummaryData(): Observable<QueryStatisticsSummarySnake> {
    return this.http.get<QueryStatisticsSummarySnake>(`/chatbot/history/query/summary/`);
  }

  getTokenUsed(): Observable<TokenDetails[]> {
    return this.http.get<TokenDetails[]>(`/chatbot/history/query/token_used/`);
  }

  getChatbotLikeDislikeTrend(): Observable<FeedbackTrend> {
    return this.http.get<FeedbackTrend>(`/chatbot/history/query/like_dislike_trend/`)
  }

  getQuerySuccessRatio(period: string): Observable<any> {
    return this.http.get<any>(`/chatbot/history/query/success_ratio_graph/?range=${period}`)
  }

  createWidgetFilterForm(): FormGroup {
    return this.builder.group({
      'filter_date': ['days', [Validators.required]],
    });
  }

  convertToQuerySuccessRatioChartdata(period: string, data: any): UnityChartDetails {
    const xAxisLabels = Object.keys(data).reverse(); // Ensures left-to-right ordering
    const successValues = xAxisLabels.map(label => data[label].success);
    const failedValues = xAxisLabels.map(label => data[label].failed);

    const view = new UnityChartDetails();
    view.options = {
      title: {
        text: `Query Success vs Failed (${period})`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Success', 'Failed'],
        bottom: 10
      },
      xAxis: {
        type: 'category',
        data: xAxisLabels,
        axisLabel: {
          ...(period === 'weeks' ? { rotate: 20 } : {})
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          data: successValues,
          itemStyle: {
            color: '#0cbb70' // Bootstrap green
          }
        },
        {
          name: 'Failed',
          type: 'bar',
          stack: 'total',
          data: failedValues,
          itemStyle: {
            color: '#cc0000' // Bootstrap red
          }
        }
      ]
    };

    return view;
  }

  convertToLikeDislikeTrendChartsData(data: FeedbackTrend): UnityChartDetails {
    const months = Object.keys(data).reverse();
    const avgData = months.map(month => data[month].average);
    const likeData = months.map(month => data[month].like);
    const dislikeData = months.map(month => data[month].dislike);

    const view = new UnityChartDetails();
    view.options = {
      // title: {
      //   text: 'Like vs Dislike vs Avg Trend',
      //   left: 'center'
      // },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['None', 'Like', 'Dislike'],
        bottom: 10
      },
      xAxis: {
        type: 'category',
        data: months
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'None',
          data: avgData,
          type: 'line',
          smooth: true,
          lineStyle: { width: 2 }
        },
        {
          name: 'Like',
          data: likeData,
          type: 'line',
          smooth: true,
          lineStyle: { width: 2 }
        },
        {
          name: 'Dislike',
          data: dislikeData,
          type: 'line',
          smooth: true,
          lineStyle: { width: 2 }
        }
      ]
    };

    return view;
  }


  convertToTokenUsedChartsdata(data: TokenDetails[]) {
    const view = new UnityChartDetails();
    const ids = data.map(point => point.id.toString());
    const tokens = data.map(point => point.tokens);

    view.options = {
      // title: {
      //   text: 'Token Used Graph',
      //   left: 'center'
      // },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const point = params[0];
          return `ID: ${point.name}<br/>Tokens: ${point.value}`;
        }
      },
      xAxis: {
        type: 'category',
        data: ids,
        axisTick: { alignWithLabel: true },
        // axisLabel: {
        //   rotate: 30
        // }
      },
      yAxis: {
        type: 'value',
        name: 'Tokens'
      },
      series: [
        {
          data: tokens,
          type: 'bar',
          itemStyle: {
            color: '#3398DB'
          },
          barWidth: '60%'
        }
      ]
    };
    return view;
  }

  convertToSummaryViewdata(data: QueryStatisticsSummarySnake): QueryStatisticsSummaryViewData {
    let viewData: QueryStatisticsSummaryViewData = new QueryStatisticsSummaryViewData();
    viewData.avgResponse = data.avg_response;
    viewData.fRatio = data.f_ratio;
    viewData.failed = data.failed;
    viewData.mCount = data.m_count;
    viewData.module = data.module;
    viewData.sRatio = data.s_ratio;
    viewData.successful = data.successful;
    viewData.total = data.total;

    return viewData;
  }

  convertToViewdata(data: DashboardQueryLog[]): DashboardQueryLogViewData[] {
    let viewData: DashboardQueryLogViewData[] = [];
    data.map(s => {
      let data: DashboardQueryLogViewData = new DashboardQueryLogViewData();
      data.queryId = s.id;
      data.user = s.user;
      data.query = s.query;
      data.module = s.module;
      data.tokens = s.tokens;
      data.responseTimeMs = s.response_time_ms;
      data.userReaction = s.user_reaction;
      if (s.is_successful) {
        data.statusIcon = 'fas fa-check-circle text-success font-xl';
        data.status = 'Success';
      } else if (!s.is_successful) {
        data.statusIcon = 'fas fa-exclamation-triangle text-danger font-xl';
        data.status = 'Failed';
      } else {
        data.status = 'None';
      }

      if (s.user_reaction == 'like') {
        data.userReactionIcon = 'fas fa-thumbs-up text-success';
      } else if (s.user_reaction == 'dislike') {
        data.userReactionIcon = 'fas fa-thumbs-down text-danger';
      } else {
        // data.userReactionIcon = '';
      }
      viewData.push(data);
    });
    return viewData;
  }

  convertToQueryDetailsViewdata(data: QueryDetails): QueryDetailsViewData {
    let view: QueryDetailsViewData = new QueryDetailsViewData();
    view.queryId = data.id;
    view.user = data.user ? data.user : 'N/A';
    view.query = data.query ? data.query : 'N/A';
    view.module = data.module ? data.module : 'N/A';
    view.tokens = data.tokens;
    view.responseTimeMs = data.response_time_ms;
    view.userReaction = data.user_reaction;
    view.isDefault = data.is_default;
    view.sourcePage = data.source_page ? data.source_page : 'N/A';
    view.prevQuery = data.prev_query ? data.prev_query : 'N/A';
    view.failureReason = data.failure_reason ? data.failure_reason : 'N/A';
    view.queryLength = data.query_length;
    view.userFeedback = data.user_feedback ? data.user_feedback : 'N/A';
    view.responseTimeMs = data.response_time_ms;
    view.responseCompleted = data.response_completed ? data.response_completed: 'N/A';
    // view.response = data.response;
    // this.manageResponse(data.response);
    // if(s.status == 'success'){
    //   data.statusIcon = 'fas fa-check-circle text-success font-xl'
    // }else if(s.status == 'failed'){
    //   data.statusIcon = 'fas fa-exclamation-triangle text-danger font-xl'
    // }else{

    // }

    if (data.user_reaction == 'like') {
      view.userReactionIcon = 'fas fa-thumbs-up text-success';
    } else if (data.user_reaction == 'dislike') {
      view.userReactionIcon = 'fas fa-thumbs-down text-danger';
    } else {
      // data.userReactionIcon = '';
    }
    return view;
  }

}

export class DashboardQueryLogViewData {
  constructor() { };
  queryId: number;
  user: string;
  query: string;
  module: string;
  tokens: number;
  responseTimeMs: number;
  userReaction: string;
  userReactionIcon: string;
  status: string;
  statusIcon: string;
}

export class QueryDetailsViewData {
  constructor() { };
  queryId: number;
  user: string;
  query: string;
  module: string;
  tokens: number;
  responseTimeMs: number;
  userReaction: string;
  isDefault: boolean;
  sourcePage: string;
  isSuccessful: boolean;
  failureReason: string;
  prevQuery: string | null;
  userFeedback: string | null;
  userReactionIcon: string;
  queryLength: number;
  type: string;
  responseCompleted: string;
  response: UnityChatBotResponse[];
  chatHistoryData: Array<ChatHistoryData> = [];
}

export interface UnityChatBotResponse {
  order: number;
  type: string;
  data: string | UnityChatBotResponseTableData | UnityChatBotResponseChartData;
}

export class QueryStatisticsSummaryViewData {
  constructor() { };
  failed: number;
  avgResponse: number;
  fRatio: number;
  successful: number;
  mCount: number;
  total: number;
  sRatio: number;
  module: string;
}

export const PERIOD_OPTIONS = [
  { label: 'Last 5 Days', value: 'days' },
  { label: 'Last 5 Weeks', value: 'weeks' },
  { label: 'Last 5 Months', value: 'months' },
];

export const MODULE_OPTIONS = [
  { label: 'Unity View', value: 'Unity View' },
  { label: 'Unity Cloud', value: 'Unity Cloud' },
  { label: 'Unity Services', value: 'Unity Services' },
  { label: 'Cost Analysis', value: 'Cost Analysis' },
  { label: 'Support', value: 'Support' },
  { label: 'Unity Setup', value: 'Unity Setup' }
];
