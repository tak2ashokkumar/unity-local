import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import {
  VERGEIO_VM_MONITORING,
  VERGEIO_VM_MONITORING_ALERTS,
  VERGEIO_VM_MONITORING_METRICS,
  VERGEIO_VM_MONITORING_START,
  VERGEIO_VM_MONITORING_STATUS,
  VERGEIO_VM_MONITORING_STOP
} from 'src/app/shared/api-endpoint.const';
import { VergeIOVmMonitoringConfig, VergeIOVmMonitoringMetrics, VergeIOVmMonitoringPayload, VergeIOVmMonitoringStatus } from './usi-vergeio-vm-monitoring.type';

@Injectable()
export class UsiVergeioVmMonitoringService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getConfig(vmId: string): Observable<VergeIOVmMonitoringConfig> {
    return this.http.get<VergeIOVmMonitoringConfig>(VERGEIO_VM_MONITORING(vmId));
  }

  getStatus(vmId: string): Observable<VergeIOVmMonitoringStatus> {
    return this.http.get<VergeIOVmMonitoringStatus>(VERGEIO_VM_MONITORING_STATUS(vmId));
  }

  getMetrics(vmId: string): Observable<VergeIOVmMonitoringMetrics> {
    return this.http.get<VergeIOVmMonitoringMetrics>(VERGEIO_VM_MONITORING_METRICS(vmId));
  }

  getAlerts(vmId: string): Observable<any[]> {
    return this.http.get<any[]>(VERGEIO_VM_MONITORING_ALERTS(vmId));
  }

  configure(vmId: string, payload: VergeIOVmMonitoringPayload): Observable<boolean> {
    return this.http.post<boolean>(VERGEIO_VM_MONITORING(vmId), payload);
  }

  start(vmId: string): Observable<boolean> {
    return this.http.put<boolean>(VERGEIO_VM_MONITORING_START(vmId), {});
  }

  stop(vmId: string): Observable<boolean> {
    return this.http.put<boolean>(VERGEIO_VM_MONITORING_STOP(vmId), {});
  }

  deleteConfig(vmId: string): Observable<any> {
    return this.http.delete(VERGEIO_VM_MONITORING(vmId));
  }

  buildConfigForm(config: VergeIOVmMonitoringConfig): FormGroup {
    return this.builder.group({
      'connection_type': [config && config.connection_type ? config.connection_type : 'Agent', [Validators.required]],
      'ip_address': [config && config.ip_address ? config.ip_address : '', [Validators.required, NoWhitespaceValidator]],
      'mtp_templates': [config && config.mtp_templates && config.mtp_templates.length ? config.mtp_templates.join(', ') : ''],
    });
  }

  resetConfigFormErrors() {
    return {
      'connection_type': '',
      'ip_address': '',
    };
  }

  configFormValidationMessages = {
    'connection_type': {
      'required': 'Connection type is required'
    },
    'ip_address': {
      'required': 'IP address is required'
    }
  };

  // The template IDs are entered as a comma-separated string; convert to a number array.
  parseTemplates(value: string): number[] {
    if (!value) {
      return [];
    }
    return value.split(',')
      .map(part => Number(part.trim()))
      .filter(num => !Number.isNaN(num));
  }
}
