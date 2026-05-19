import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationAuthModalService {

  constructor(private http: HttpClient,) { }

  getTab(tab: 'same' | 'new', conversationId: string, host: string) {
    return this.http.get(`/mcp/cli_audit_logs/get_free_sessions/?conversation_id=${conversationId}&tab_type=${tab}&host=${host}`);
  }
}
