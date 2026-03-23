import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { LLMServiceDetails } from 'src/app/shared/SharedEntityTypes/ai-observability.type';

@Injectable()
export class AiObservabilityLlmDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getDeviceDetails(deviceId: string): Observable<LLMServiceDetails> {
    return this.http.get<LLMServiceDetails>(DEVICE_BY_ID(DeviceMapping.LLM_SERVICE, deviceId));
  }

  buildForm(d: LLMServiceDetails): FormGroup {
    return this.builder.group({
      'name': [{ value: d.name, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'service_type': [{ value: d.service_type, disabled: true }, [NoWhitespaceValidator]],
      'tokens_usage': [{ value: d.tokens_usage, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'total_prompt_tokens': [{ value: d.total_prompt_tokens, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'total_completion_tokens': [{ value: d.total_completion_tokens, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'average_response_time': [{ value: d.average_response_time, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'average_request_temperature': [{ value: d.average_request_temperature, disabled: true }, [NoWhitespaceValidator]],
      'last_prompt': [{ value: d.last_prompt, disabled: true }, [NoWhitespaceValidator]],
      'server_addresses': [{ value: d.server_addresses, disabled: true }, [NoWhitespaceValidator]],
      'server_ports': [{ value: d.server_ports, disabled: true }, [NoWhitespaceValidator]],
      'created_at': [{ value: d.created_at, disabled: true }, [NoWhitespaceValidator]],
      'updated_at': [{ value: d.updated_at, disabled: true }, [NoWhitespaceValidator]],
    })
  }

  resetFormErrors() {
    return {
      'name': '',
      'service_type': '',
      'created_at': '',
      'updated_at': '',
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Service name is required'
    },
    'service_type': {
      'required': 'Service type is required'
    },
    'created_at': {
      'required': 'Created date is required'
    },
    'updated_at': {
      'required': 'Updated date is required'
    },
  }
}
