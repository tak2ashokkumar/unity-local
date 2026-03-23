import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GPUServiceDetails } from 'src/app/shared/SharedEntityTypes/ai-observability.type';

@Injectable()
export class AiObservabilityGpuServiceDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getDeviceDetails(deviceId: string): Observable<GPUServiceDetails> {
    return this.http.get<GPUServiceDetails>(DEVICE_BY_ID(DeviceMapping.GPU_SERVICE, deviceId));
  }

  buildForm(d: GPUServiceDetails): FormGroup {
    return this.builder.group({
      'name': [{ value: d.name, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'service_type': [{ value: d.service_type, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'gpu_uuid': [{ value: d.gpu_uuid, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'gpu_name': [{ value: d.gpu_name, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'gpu_utilization': [{ value: d.gpu_utilization, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'memory_usage': [{ value: d.memory_usage, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'temperature': [{ value: d.temperature, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'power_draw': [{ value: d.power_draw, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'power_limit': [{ value: d.power_limit, disabled: true }, [Validators.required, NoWhitespaceValidator]],
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
