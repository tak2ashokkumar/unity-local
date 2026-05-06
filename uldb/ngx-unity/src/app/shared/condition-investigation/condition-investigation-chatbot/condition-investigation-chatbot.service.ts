import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SupportedLLMConfig, SupportedLLMConfigData } from '../../SharedEntityTypes/ai-chatbot/llm-model.type';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class ConditionInvestigationChatbotService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getResponse(data: any) {
    return this.http.post(`${environment.networkAgentHostUrl}v1/investigate/`, data);
  }

  getStreamingResponse(data: any): Observable<any> {
    return new Observable(observer => {
      fetch(`${environment.networkAgentHostUrl}v1/investigate/chat_sse_new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';
        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop();
            parts.forEach(part => {
              const lines = part.split('\n');
              let dataStr = '';
              lines.forEach(line => {
                if (line.startsWith('event:')) {
                  currentEvent = line.replace('event:', '').trim();
                } else if (line.startsWith('data:')) {
                  dataStr += line.replace('data:', '').trim();
                }
              });
              if (!dataStr) return;
              try {
                const parsed = JSON.parse(dataStr);
                observer.next({ event: currentEvent, data: parsed });
              } catch {
                console.log('chatbot svc', dataStr)
                observer.next({ event: currentEvent, data: dataStr });
              }
            });
            read();
          }).catch(err => observer.error(err));
        };
        read();
      }).catch(err => observer.error(err));
    });
    // return new Observable(observer => {
    //   fetch(`${environment.networkAgentHostUrl}v1/investigate/chat_sse_new`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data)
    //   }).then(response => {
    //     const reader = response.body.getReader();
    //     const decoder = new TextDecoder();
    //     const read = () => {
    //       reader.read().then(({ done, value }) => {
    //         if (done) {
    //           observer.complete();
    //           return;
    //         }
    //         const chunk = decoder.decode(value, { stream: true });
    //         const lines = chunk.split('\n');
    //         let currentEvent = '';
    //         lines.forEach(line => {
    //           if (line.startsWith('event:')) {
    //             currentEvent = line.replace('event:', '').trim();
    //           } else if (line.startsWith('data:')) {
    //             const data = line.replace('data:', '').trim();
    //             try {
    //               const parsed = JSON.parse(data);
    //               observer.next({ event: currentEvent, data: parsed });
    //             } catch {
    //               observer.next({ event: currentEvent, data });
    //             }
    //           }
    //         });
    //         read();
    //       }).catch(err => observer.error(err));
    //     };
    //     read();
    //   }).catch(err => observer.error(err));
    // });
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
}
