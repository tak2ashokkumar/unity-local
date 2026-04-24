import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SupportedLLMConfig, SupportedLLMConfigData } from '../shared/SharedEntityTypes/ai-chatbot/llm-model.type';
import { AssistedInsights, ChatDocuments, UntiyChatBotExploreMenu, UrlData } from './unity-chatbot.type';

@Injectable({
  providedIn: 'root'
})
export class UnityChatbotService {

  onFilterChangeSource = new Subject<{ from: string, to: string }>();
  onFilterChangeAnnounced$ = this.onFilterChangeSource.asObservable();
  onChatTrigger$ = new BehaviorSubject<Boolean>(false);

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  // get enhanced llm object
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

  changeActiveModel(selectedApplication: string, model: SupportedLLMConfigData) {
    let app: string;
    switch (selectedApplication) {
      case 'Assistant': app = 'assistant'; break;
      case 'Network Agent': app = 'network_agent'; break;
      case 'Workflow Agent': app = 'workflow_agent'; break;
      default: app = 'assistant';
    }
    let data = { 'active_model': model.id, 'application': app };
    return this.http.post(`mcp/user-session-config/`, data);

    // return of(null);
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
    const data = { conversation_id: conversationId};
    return this.http.post<ChatDocuments>('mcp/get_conversation_document_ids/', data)
  }

  uploadDocument(file: File, conversationId: string, orgId: any, userId: any) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('conversation_id', conversationId);
    formData.append('org_id', orgId);
    formData.append('user_id', userId);
    return this.http.post(`${environment.ChatbotDocumentUploadUrl}documents/upload`, formData);
  }

  deleteDocument(docId: string, conversationId: string) {
    const postData = { conversation_id: conversationId, document_id: docId }
    return this.http.post(`${environment.ChatbotDocumentUploadUrl}documents/delete`, postData);
  }
}

export enum ModuleIcons {
  "Unity View" = "fa cfa-unity-view",
  "Unity Cloud" = "fa fa-cloud",
  "Unity Services" = "fa cfa-unity-services",
  "Cost Analysis" = "fa-money-check-alt fas",
  "Support" = "fa-life-ring far",
  "Unity Setup" = "fa fa-cogs"
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
  { name: 'AI Agents', isSelected: false },
]