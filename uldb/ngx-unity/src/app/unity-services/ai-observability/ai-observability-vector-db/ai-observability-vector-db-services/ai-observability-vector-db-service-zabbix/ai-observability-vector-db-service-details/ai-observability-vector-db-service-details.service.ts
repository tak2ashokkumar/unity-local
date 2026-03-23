import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { VectorDBServiceDetails } from 'src/app/shared/SharedEntityTypes/ai-observability.type';

@Injectable()
export class AiObservabilityVectorDbServiceDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getDeviceDetails(deviceId: string): Observable<VectorDBServiceDetails> {
    return this.http.get<VectorDBServiceDetails>(DEVICE_BY_ID(DeviceMapping.VECTOR_DB_SERVICE, deviceId));
  }

  buildForm(d: VectorDBServiceDetails): FormGroup {
    return this.builder.group({
      'name': [{ value: d.name, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'service_type': [{ value: d.service_type, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'db_collection_names': [{ value: d.db_collection_names, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'db_operation_names': [{ value: d.db_operation_names, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'vector_db_types': [{ value: d.vector_db_types, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'server_addresses': [{ value: d.server_addresses, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'server_ports': [{ value: d.server_ports, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'total_db_vector_count': [{ value: d.total_db_vector_count, disabled: true }, [Validators.required, NoWhitespaceValidator]],
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
