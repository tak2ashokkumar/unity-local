import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntiyChatBotExploreMenu } from '../unity-chatbot.type';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AIAgentsModule } from './uc-agents.type';

@Injectable()
export class UcAgentsService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getResponse(data: any, accessToken: string, url: string) {
    const headers = new HttpHeaders().set('access_token', accessToken)
    // const params = new HttpParams().set('query', data);
    // if (isFirst) {
    //   return this.http.get(`${url}create_thread`, { headers, params });
    // } else {
    //   return this.http.get(`${url}${threadId}`, { headers, params });
    // }
    return this.http.post(`${url}chat`, data, { headers });
  }

  getModuleNames(): Observable<AIAgentsModule[]> {
    return this.http.get<AIAgentsModule[]>(`customer/agents_list/`, { params: new HttpParams().set('page_size', 0) });
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
  "Network Agent" = "fas fa-network-wired",
  "FinOps Agent" = "fas fa-comments-dollar",
  "ITSM Agent" = "fas fa-ticket-alt"
}

export const StaticModules = [
  {
    name: "ITSM Agent",
    url: "dummy",
    uuid: "dummy",
    access_token: "dummy",
    queries: []
  },
  {
    name: "FinOps Agent",
    url: "dummy",
    uuid: "dummy",
    access_token: "dummy",
    queries: []
  }
]