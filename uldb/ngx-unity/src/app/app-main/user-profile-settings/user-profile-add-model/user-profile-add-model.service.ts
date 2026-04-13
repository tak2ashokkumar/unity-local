import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AILLMModel, SupportedLLMConfig, SupportedLLMConfigData } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.type';

@Injectable()
export class UserProfileAddModelService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService,) { }

  getLLMModelData(llmId: string): Observable<AILLMModel> {
    return this.http.get<AILLMModel>(`mcp/user-llm-config/${llmId}/`)
  }

  getLLMModelList(): Observable<SupportedLLMConfigData[]> {
    return this.http.get<SupportedLLMConfig>(`/mcp/get-supported-llm-configs/`).pipe(
      map((res: SupportedLLMConfig) => {
        res.supported_llms.forEach(llm => {
          llm.text = `${llm.provider.toUpperCase()} ${llm.model_name}`;
          llm.type = `${llm.provider.toUpperCase()} ${llm.model_name}`;
          llm.image = providerImages[llm.provider];
        })
        return res && res.supported_llms ? res.supported_llms : [];
      })
    )
  }

  buildForm(data: AILLMModel, selectedModel?: SupportedLLMConfigData): FormGroup {
    if (data) {
      let form = this.builder.group({
        'model_and_provider': ['', [Validators.required]],
        'model_name': [data.model_name, [Validators.required, NoWhitespaceValidator]],
        'provider': [data.provider, [Validators.required]],
        'api_key': ['', []],
        'endpoint_url': [data.endpoint_url],
        'description': [data.description],
      });
      if (selectedModel) {
        form.get('model_and_provider').setValue(selectedModel);
        form.addControl('active_for_applications', new FormControl(data.active_for_applications, [Validators.required]));
      }
      return form;
    } else {
      let form = this.builder.group({
        'model_and_provider': ['', [Validators.required]],
        'model_name': ['', [Validators.required, NoWhitespaceValidator]],
        'provider': ['', [Validators.required, NoWhitespaceValidator]],
        'api_key': ['', [Validators.required, NoWhitespaceValidator]],
        'endpoint_url': [''],
        'description': [''],
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'model_and_provider': '',
      'model_name': '',
      'provider': '',
      'active_for_applications': '',
      'api_key': '',
      'endpoint_url': '',
    }
  }

  formValidationMessages = {
    'model_and_provider': {
      'required': 'Name and Provider is required'
    },
    'active_for_applications': {
      'required': 'Application selection is mandatory'
    },
    'api_key': {
      'required': 'API Key is required'
    },

  }

  addModel(obj: any): Observable<any> {
    obj.active_for
    return this.http.post(`mcp/user-llm-config/`, obj)
  }

  updateModel(obj: any, llmId: string): Observable<any> {
    return this.http.patch(`mcp/user-llm-config/${llmId}/`, obj)
  }
}

export class LLMModelFormObject {

}

const providerImages = {
  openai: 'static/assets/images/external-brand/ai-models/openai.svg',
  anthropic: 'static/assets/images/external-brand/ai-models/claude-color.svg',
  google: 'static/assets/images/external-brand/ai-models/gemini.svg',
  groq: 'static/assets/images/external-brand/ai-models/grok.svg'
};
