import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationAuthModalService {

  constructor(private http: HttpClient,) { }

  getTab(tab: 'same' | 'new', conversationId: string, host: string, shell?: string, connection?: { connection_type?: string; engine?: string; database?: string }) {
    let params = new HttpParams()
      .set('tab_type', tab)
      .set('conversation_id', conversationId)
      .set('host', host);

    if (shell) {
      params = params.set('shell', shell);
    }
    if (connection?.connection_type) {
      params = params.set('connection_type', connection.connection_type);
    }
    if (connection?.engine) {
      params = params.set('engine', connection.engine);
    }
    if (connection?.database) {
      params = params.set('database', connection.database);
    }
    return this.http.get(`/mcp/cli_audit_logs/get_free_sessions/`, { params: params });
  }

  getDefaultDevice(conditionId: string | number, conversationId: string) {
    const conversationParam = conversationId ? `${conversationId}` : '';
    const params = new HttpParams()
      .set('condition_id', `${conditionId}`)
      .set('conversation_id', conversationParam);
    return this.http.get(`/mcp/cli_default_devices/by_condition/`, { params });
  }

  saveDefaultDevice(payload: any) {
    return this.http.post(`/mcp/cli_default_devices/save_for_condition/`, payload);
  }
}
