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
    return this.http.post(`${url}chat`, data, { headers });
  }

  getStreamingResponse(data: any, url: string): Observable<string> {
    return new Observable(observer => {
      fetch(`${url}chat_sse`, {
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
                  currentEvent == 'token' && observer.next(parsed.content);
                } catch {
                  observer.next(data);
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

  submitReaction(data: any, queryId: string) {
    return this.http.post(`chatbot/reaction/${queryId}/`, data);
  }

  submitFeedback(data: any, queryId: string) {
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