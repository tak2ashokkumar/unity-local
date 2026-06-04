import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DOWNLOAD_COLLECTOR_BUNDLE, REQUEST_COLLECTOR_ACCESS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import {
  AdvancedDiscoveryConnectivityRequest,
  AdvancedDiscoveryConnectivityRequestCommand,
  AdvancedDiscoveryConnectivityRequestCreatePayload,
  AdvancedDiscoveryConnectivityRequestCreateResponse
} from './advanced-discovery-connectivity-request.type';

@Injectable()
export class AdvancedDiscoveryConnectivityRequestService {
  constructor(private http: HttpClient, private builder: FormBuilder) { }

  validationMessages() {
    return {
      cert_host_name: {
        required: 'Collector Host Name is required'
      },
      ip_address: {
        required: 'Host IP Address is required'
      },
      cert_ttl: {
        required: 'TTL in Days is required',
        min: 'TTL in Days should be greater than 0'
      }
    };
  }

  buildForm() {
    return this.builder.group({
      cert_host_name: ['', [Validators.required, NoWhitespaceValidator]],
      ip_address: ['', [Validators.required, NoWhitespaceValidator]],
      cert_ttl: [30, [Validators.required, Validators.min(1)]]
    });
  }

  resetFormErrors() {
    return {
      cert_host_name: '',
      ip_address: '',
      cert_ttl: ''
    };
  }

  getFormPayload(form: FormGroup): AdvancedDiscoveryConnectivityRequestCreatePayload {
    const formValue = form.getRawValue();
    return {
      ip_address: formValue.ip_address,
      cert_host_name: formValue.cert_host_name,
      cert_ttl: Number(formValue.cert_ttl)
    };
  }

  saveCollectorDetails(payload: AdvancedDiscoveryConnectivityRequestCreatePayload): Observable<AdvancedDiscoveryConnectivityRequest> {
    return this.http.post<AdvancedDiscoveryConnectivityRequest>(REQUEST_COLLECTOR_ACCESS(), payload);
  }

  downloadCollectorBundle(uuid: string): Observable<HttpEvent<Blob>> {
    return this.http.get(DOWNLOAD_COLLECTOR_BUNDLE(uuid), {
      responseType: 'blob',
      observe: 'events',
      reportProgress: true
    });
  }

  saveCollectorFile(response: HttpResponse<Blob>) {
    const blob = response.body;
    if (!blob) {
      return;
    }
    const fileName = this.getFileName(response) || 'unityone-zero-touch-collector.run';
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  getCommands(): AdvancedDiscoveryConnectivityRequestCommand[] {
    return [
      { command: 'scp unityone-collector.zip user@<server-ip>:/opt/' },
      { command: `cd /opt && unzip unityone-collector.zip` },
      { command: `cd /opt/unityone-collector` },
      { command: 'bash init-collector.sh' }
    ];
  }

  getCollectorRequestUuid(res: AdvancedDiscoveryConnectivityRequestCreateResponse) {
    return res && (res.uuid || res.id || (res.data && (res.data.uuid || res.data.id)));
  }

  applyCreateErrors(err: any, formErrors: any) {
    const nextErrors: any = this.resetFormErrors();
    let nonFieldErr = '';

    if (err && err.non_field_errors) {
      nonFieldErr = err.non_field_errors[0];
    } else if (err && err.error && typeof err.error == 'string') {
      nonFieldErr = err.error;
    } else if (typeof err === 'string') {
      nonFieldErr = err;
    } else if (err) {
      for (const field in err) {
        if (field in formErrors) {
          nextErrors[field] = Array.isArray(err[field]) ? err[field][0] : err[field];
        }
      }
      const hasFieldError = Object.keys(nextErrors).some(field => nextErrors[field]);
      if (!hasFieldError && (err.detail || err.message)) {
        nonFieldErr = err.detail || err.message;
      } else if (!hasFieldError) {
        nonFieldErr = 'Something went wrong!! Please try again.';
      }
    } else {
      nonFieldErr = 'Something went wrong!! Please try again.';
    }

    return { formErrors: nextErrors, nonFieldErr };
  }

  private getFileName(response: HttpResponse<Blob>) {
    const contentDisposition = response.headers.get('content-disposition');
    if (!contentDisposition) {
      return null;
    }
    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    return fileNameMatch ? fileNameMatch[1] : null;
  }
}
