import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnityAssistantChatHistory } from '../uc-history.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormBuilder } from '@angular/forms';
import { SupportedLLMConfig, SupportedLLMConfigData } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.type';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { ChatDocuments } from '../../unity-chatbot.type';

@Injectable()
export class UchChatService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getChats(criteria: SearchCriteria): Observable<PaginatedResult<UnityAssistantChatHistory>> {
    return this.tableService.getData<PaginatedResult<UnityAssistantChatHistory>>(`customer/network_agent/conversations/list_by_org_get/`, criteria);
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

  buildForm() {
    return this.builder.group({
      'chat': ['']
    });
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
    return this.http.post(`${environment.ChatbotDocumentUploadUrl}mcp/documents/upload/`, formData);
  }
  deleteDocument(docId: string, conversationId: string) {
    const postData = { conversation_id: conversationId, document_id: docId }
    return this.http.post(`${environment.ChatbotDocumentUploadUrl}mcp/documents/delete/`, postData);
  }
}
