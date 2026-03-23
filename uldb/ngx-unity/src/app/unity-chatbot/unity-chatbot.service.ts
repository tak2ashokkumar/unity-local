import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AssistedInsights, UntiyChatBotExploreMenu, UrlData } from './unity-chatbot.type';

@Injectable({
  providedIn: 'root'
})
export class UnityChatbotService {

  onFilterChangeSource = new Subject<{ from: string, to: string }>();
  onFilterChangeAnnounced$ = this.onFilterChangeSource.asObservable();
  onChatTrigger$ = new BehaviorSubject<Boolean>(false);

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getResponse(data: any) {
    return this.http.post(`mcp/query/`, data);
  }

  getModuleNames(): Observable<UntiyChatBotExploreMenu[]> {
    return this.http.get<UntiyChatBotExploreMenu[]>(`chatbot/menu/`);
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

  submitReaction(data: any, queryId: number) {
    return this.http.post(`chatbot/reaction/${queryId}/`, data);
  }

  submitFeedback(data: any, queryId: number) {
    return this.http.post(`chatbot/feedback/${queryId}/`, data);
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
  {name:'Assistant', isSelected: true},
  {name:'Agentic Workflows', isSelected: false},
  {name:'AI Agents', isSelected: false},
]