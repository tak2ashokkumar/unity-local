import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SupportedLLMConfig, SupportedLLMConfigData } from '../shared/SharedEntityTypes/ai-chatbot/llm-model.type';
import { AssistedInsights, ChatDocuments, TokenUsage, UntiyChatBotExploreMenu, UrlData } from './unity-chatbot.type';
import { UnityChartDetails } from '../shared/unity-chart-config.service';
import { EChartsOption } from 'echarts';
import { UNITY_ORG_SETTINGS } from '../shared/api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class UnityChatbotService {

  onFilterChangeSource = new Subject<{ from: string, to: string }>();
  onFilterChangeAnnounced$ = this.onFilterChangeSource.asObservable();
  onChatTrigger$ = new BehaviorSubject<Boolean>(false);
  private aiAgentProModeDefaultSource = new BehaviorSubject<boolean | null>(null);
  aiAgentProModeDefault$ = this.aiAgentProModeDefaultSource.asObservable();
  private sidebarExpanded = new Subject<void>();
  sidebarExpanded$ = this.sidebarExpanded.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  onSidebarExpand() {
    this.sidebarExpanded.next();
  }

  getSupportedLLMModelList(): Observable<SupportedLLMConfigData[]> {
    return this.http.get<SupportedLLMConfig>(`/mcp/get-supported-llm-configs/`).pipe(
      map((res: SupportedLLMConfig) => {
        res.supported_llms.forEach(llm => {
          llm.text = `${llm.model_name.toUpperCase()}`;
          llm.type = `${llm.provider.toUpperCase()} ${llm.model_name}`;
          switch (llm.provider) {
            case 'openai': llm.image = `${environment.assetsUrl}external-brand/ai-models/openai.svg`; break;
            case 'google': llm.image = `${environment.assetsUrl}external-brand/ai-models/gemini.svg`; break;
            case 'anthropic': llm.image = `${environment.assetsUrl}external-brand/ai-models/claude-color.svg`; break;
            case 'groq': llm.image = `${environment.assetsUrl}external-brand/ai-models/grok.svg`; break;
            default: llm.image = `${environment.assetsUrl}external-brand/ai-models/openai.svg`; break;
          }
        })
        return res && res.supported_llms ? res.supported_llms : [];
      })
    )
  }

  getAiAgentProModeDefault(): Observable<boolean> {
    return this.http.get<Array<{ is_pro_ai_enabled: boolean }>>(UNITY_ORG_SETTINGS()).pipe(
      map(res => !!res[0]?.is_pro_ai_enabled)
    );
  }

  setAiAgentProModeDefault(enabled: boolean) {
    this.aiAgentProModeDefaultSource.next(enabled);
  }

  getResponse(data: any) {
    return this.http.post(`mcp/query/`, data);
  }

  getStreamingResponse(data: any): Observable<any> {
    return new Observable(observer => {
      fetch(`mcp/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            let currentEvent = '';
            lines.forEach(line => {
              if (line.startsWith('event:')) {
                currentEvent = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                const data = line.replace('data:', '').trim();
                try {
                  const parsed = JSON.parse(data);
                  observer.next({ event: currentEvent, data: parsed });
                } catch {
                  observer.next({ event: currentEvent, data });
                }
              }
            });
            read();
          }).catch(err => observer.error(err));
        };
        read();
      }).catch(err => observer.error(err));
    });
  }

  getModuleNames(): Observable<UntiyChatBotExploreMenu[]> {
    return this.http.get<UntiyChatBotExploreMenu[]>(`chatbot/menu/?page_size=0`);
  }

  getInsights(apiUrl: string, params?: any): Observable<AssistedInsights> {
    return this.http.get<AssistedInsights>(apiUrl, { params: params });
  }

  onDevopsFilterChange(from: string, to: string) {
    this.onFilterChangeSource.next({ from, to });
  }

  buildForm() {
    return this.builder.group({
      'chat': ['']
    });
  }

  buildFeedbackForm() {
    return this.builder.group({
      'feedback': ['']
    });
  }

  submitReaction(data: any, queryId: string) {
    return this.http.patch(`customer/network_agent/chat-messages/${queryId}/reaction/`, data);
  }

  submitFeedback(data: any, queryId: string) {
    return this.http.patch(`customer/network_agent/chat-messages/${queryId}/feedback/`, data);
  }

  getDocuments(conversationId: string): Observable<ChatDocuments> {
    const data = { conversation_id: conversationId };
    return this.http.post<ChatDocuments>('mcp/get_conversation_document_ids/', data)
  }

  uploadDocument(files: File[], conversationId: string, orgId: any, userId: any): Observable<any> {
    const formData = new FormData();

    if (files.length === 1) {
      formData.append('file', files[0], files[0].name);
    } else {
      files.forEach(file => formData.append('files', file, file.name));
    }
    conversationId && formData.append('conversation_id', conversationId);
    formData.append('org_id', String(orgId));
    formData.append('user_id', String(userId));
    return this.http.post(`mcp/documents/upload/`, formData);
  }

  deleteDocument(docId: string, conversationId: string) {
    const postData = { conversation_id: conversationId, document_id: docId }
    return this.http.post(`mcp/documents/delete/`, postData);
  }

  getTokenUsage(orgId: any, userId: any): Observable<TokenUsage> {
    let params = new HttpParams()
      .set('org_id', orgId)
    //   .set('user_id', userId);
    return this.http.get<TokenUsage>(`mcp/token-usage/org/`, { params });
  }

  // convertToTokenUsageChartData(data: TokenUsage, showCenterText: boolean = false): UnityChartDetails {
  //   let view: UnityChartDetails = new UnityChartDetails();
  //   const used = data.tokens_used;
  //   const remaining = Math.max(data.token_limit - data.tokens_used, 0);
  //   const percent = Math.min(Math.round(data.usage_percent), 100);

  //   const options: EChartsOption = {
  //     series: [{
  //       type: 'pie',
  //       radius: ['55%', '80%'],
  //       avoidLabelOverlap: false,
  //       label: { show: false },
  //       labelLine: { show: false },
  //       data: [
  //         { value: used, name: 'Used', itemStyle: { color: '#0cbb70' } },
  //         { value: remaining, name: 'Remaining', itemStyle: { color: '#e8e8e8' } }
  //       ]
  //     }]
  //   };

  //   if (showCenterText) {
  //     options.graphic = [{
  //       type: 'text',
  //       left: 'center',
  //       top: 'center',
  //       style: {
  //         text: `${percent}%`,
  //         fontSize: 12,
  //         fontWeight: 'bold',
  //         fill: '#333'
  //       }
  //     }];
  //   }
  //   view.options = options;
  //   return view;
  // }
  convertToTokenUsageViewData(data: any): TokenUsageViewData {
    let view: TokenUsageViewData = new TokenUsageViewData();
    if (!data) return view;

    view.usedTokens = data.used_tokens ?? 0;
    view.inputTokens = data.input_tokens ?? 0;
    view.outputTokens = data.output_tokens ?? 0;
    view.limit = data.limit ?? 0;
    view.remainingTokens = data.remaining_tokens ?? 0;
    view.totalCostUsd = data.total_cost_usd ?? 0;
    view.usagePercent = data.limit ? Math.round((data.used_tokens / data.limit) * 100) : 0;
    view.windowStart = data.window_start ?? '';
    view.windowEnd = data.window_end ?? '';
    if (!data.used_tokens && !data.remaining_tokens) {
      const emptyChart: EChartsOption = {
        series: [{
          type: 'pie',
          radius: ['55%', '80%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: 1, name: 'No Data', itemStyle: { color: '#e8e8e8' } }
          ]
        }]
      };
      view.iconChartOptions = { ...emptyChart };
      view.popupChartOptions = { ...emptyChart };
      return view;
    }

    const chartBase: EChartsOption = {
      series: [{
        type: 'pie',
        radius: ['55%', '80%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: view.usedTokens, name: 'Used', itemStyle: { color: '#0cbb70' } },
          { value: view.remainingTokens > 0 ? view.remainingTokens : 0, name: 'Remaining', itemStyle: { color: '#e8e8e8' } }
        ]
      }]
    };

    view.iconChartOptions = { ...chartBase };
    view.popupChartOptions = {
      ...chartBase,
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${view.usagePercent}%`,
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#333'
        }
      }]
    };

    return view;
  }
}

export enum ModuleIcons {
  "Unity View" = "fa cfa-unity-view",
  "Unity Cloud" = "fa fa-cloud",
  "Unity Services" = "fa cfa-unity-services",
  "Cost Analysis" = "fa-money-check-alt fas",
  "Support" = "fa-life-ring far",
  "Unity Setup" = "fa fa-cogs",
  "Catalog Management" = "fas fa-layer-group"
}

export const moduleMapping: { [key: string]: string } = {
  'unityview': 'Unity View',
  'unitycloud': 'Unity Cloud',
  'services': 'Unity Services',
  'cost-analysis': 'Cost Analysis',
  'support': 'Support',
  'setup': 'Unity Setup'
};

export const DashboardApiMapping: { [key: string]: string } = {
  'services/orchestration/summary': 'api/dashboard/devops/',
  'app-dashboard/global': 'api/dashboard/insights/',
  'unitycloud/infrastructure': 'api/dashboard/infra/',
  'services/aiml/summary': 'api/dashboard/aiml/'
}

export const InsightsMapping: { [key: string]: UrlData } = {
  'services/orchestration/summary': {
    apiUrls: [
      { name: 'Execution by User', url: 'api/dashboard/devops_top_users/', params: {}, toBeskipped: true },
      { name: 'Average Execution Time', url: 'api/dashboard/devops_avg/', params: {}, toBeskipped: true },
      { name: 'Workflows', url: 'api/dashboard/devops_wf/', params: {} },
      { name: 'Tasks', url: 'api/dashboard/devops_task/', params: {} },
      { name: 'Upcoming Executions', url: 'api/dashboard/devops_upcoming/', params: {} },
      { name: 'Recent Failures', url: 'api/dashboard/devops_recentfail/', params: {} }
    ]
  },
  'unityview/root/dashboard': {
    apiUrls: [
      { name: 'Public Cloud', url: 'api/dashboard/public_summary/', params: {} },
      { name: 'Data Center', url: 'api/dashboard/datacenter_summary/', params: {} },
      { name: 'Devices under Management', url: 'api/dashboard/devices_under_management/', params: {} },
      { name: 'Private Cloud', url: 'api/dashboard/private_summary/', params: {} }
    ]
  },
  'unitycloud/infrastructure': {
    apiUrls: [
      { name: 'Alerts', url: 'api/dashboard/infra_alerts/', params: {} },
      { name: 'Datacenter', url: 'api/dashboard/infra_datacenter/', params: {} },
      { name: 'Cabinet', url: 'api/dashboard/infra_cabinet/', params: {} },
      { name: 'Resources', url: 'api/dashboard/infra_resources/', params: {} },
      { name: 'Total Devices', url: 'api/dashboard/infra_devices/', params: {} },
      { name: 'Top 10 Critical Alerts', url: 'api/dashboard/infra_critical_alerts/', params: {} },
      { name: 'Private Clouds', url: 'api/dashboard/infra_private_clouds/', params: {} },
      { name: 'Public Cloud & TTM Cost', url: 'api/dashboard/infra_public_cloud/', params: {} }
    ]
  },
  'services/aiml/summary': {
    apiUrls: [
      { name: 'Noisy Hosts', url: 'api/dashboard/aiml_noisy_hosts/', params: {} },
      { name: 'Events Trend - Device Type', url: 'api/dashboard/aiml_events_trend_device_type/', params: {} },
      { name: 'Noisy Events', url: 'api/dashboard/aiml_noisy_events/', params: {} },
      { name: 'Summary', url: 'api/dashboard/aiml_summary/', params: {} }
    ]
  },
};

export const TabNames = [
  { name: 'Assistant', isSelected: true },
  { name: 'Agentic Workflows', isSelected: false },
  // { name: 'AI Agents', isSelected: false },
]

export class TokenUsageViewData {
  usedTokens: number = 0;
  inputTokens: number = 0;
  outputTokens: number = 0;
  limit: number = 0;
  remainingTokens: number = 0;
  totalCostUsd: number = 0;
  usagePercent: number = 0;
  windowStart: string = '';
  windowEnd: string = '';
  iconChartOptions: EChartsOption = {};
  popupChartOptions: EChartsOption = {};
}
