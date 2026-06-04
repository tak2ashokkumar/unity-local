import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationAuthModalService {

  constructor(private http: HttpClient,) { }

  getTab(tab: 'same' | 'new', conversationId: string, host: string, shell?: string) {
    let params = new HttpParams()
      .set('tab_type', tab)
      .set('conversation_id', conversationId)
      .set('host', host);

    if (shell) {
      params = params.set('shell', shell);
    }
    return this.http.get(`/mcp/cli_audit_logs/get_free_sessions/`, { params: params });
  }
}
