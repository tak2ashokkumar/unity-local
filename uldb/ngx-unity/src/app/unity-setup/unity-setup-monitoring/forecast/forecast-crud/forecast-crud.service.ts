import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS, GET_CONFIGURED_DEVICES } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { devicesType, ZabbixAnomalyDetectionTriggerGraphItemsType } from '../../usm-anomaly-detection/usm-anomaly-detection-crud/usm-anomaly-detection-crud.type';

@Injectable()
export class ForecastCrudService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getForecastDetails(itemId: string,deviceId: string): Observable<any> {
    return this.http.get<any>(`/customer/alert_prediction/devices/${deviceId}/items/${itemId}/`);
  }

  // getTaskList(): Observable<any[]> {
  //   return this.http.get<any[]>(`/${ORCHESTRATION_GET_TASK()}?page_size=0`);
  // }

  getDevices(deviceTypes: string[]): Observable<devicesType[]> {
    let params: HttpParams = new HttpParams();
    deviceTypes.map((deviceType) => params = params.append('device_type', deviceType));
    return this.http.get<devicesType[]>(GET_CONFIGURED_DEVICES(), { params: params });
  }

  getGraphItems(mappedDevicesObj: { [key: string]: string[] }): Observable<ZabbixAnomalyDetectionTriggerGraphItemsType[]> {
    return this.http.post<ZabbixAnomalyDetectionTriggerGraphItemsType[]>(`/customer/fast/devices_metrics/`, mappedDevicesObj);
  }

  createForecast(rawValues: any, forecastId?: string): Observable<any> {
    if (forecastId) {
      return this.http.put<any>(`customer/forecasting/`, rawValues);
    } else {
      return this.http.post<any>(`customer/forecasting/`, rawValues);
    }
  }
  createForecastForm(forecastDetails: any): FormGroup {
    if (forecastDetails) {
      let form = this.builder.group({
        'name': [forecastDetails.name, Validators.required],
        'metric': ['', Validators.required],
        'operator': [forecastDetails.operator, Validators.required],
        'analysis_time_frame': ['', Validators.required],
        'analysis_time_unit': ['', Validators.required],
        'projection_period': ['', Validators.required],
        'projection_unit': ['', Validators.required],
        'alerting': [forecastDetails.alerting, Validators.required],
        'threshold': [forecastDetails.threshold, Validators.required],
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', Validators.required],
        'device_types': [[], Validators.required],
        'devices': [[], Validators.required],
        'metric': ['', Validators.required],
        'analysis_time_frame': ['', Validators.required],
        'analysis_time_unit': ['m', Validators.required],
        'projection_period': ['', Validators.required],
        'projection_unit': ['m', Validators.required],
        'alerting': [true, Validators.required],
        'operator': ['', Validators.required],
        'threshold': ['', Validators.required],
      });
      return form;
    }
  }

  resetForecastFormErrors() {
    return {
      'name': '',
      'device_types': '',
      'devices': '',
      'metric': '',
      'analysis_time_frame': '',
      'analysis_time_unit': '',
      'projection_period': '',
      'projection_unit': '',
      'alert_needed': '',
      'threshold': '',
      'operator': ''
    };
  }


  forecastFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'device_types': {
      'required': 'Device Type is required'
    },
    'devices': {
      'required': 'Device is required'
    },
    'metric': {
      'required': 'Metric is required',
    },
    'analysis_time_frame': {
      'required': 'Analysis Time Frame is required'
    },
    'analysis_time_unit': {
      'required': 'Analysis Time Unit is required'
    },
    'projection_period': {
      'required': 'Projection Period is required'
    },
    'projection_unit': {
      'required': 'Projection Unit is required'
    },
    'alert_needed': {
      'required': 'Alert Status is required'
    },
    'threshold': {
      'required': 'Threshold is required'
    },
    'operator': {
      'required': 'Operator is required'
    }
  };
}

export const OPERATORS = [
  { label: 'equals to', value: '=' },
  { label: 'less than or greater than', value: '<>' },
  { label: 'less than', value: '<' },
  { label: 'greater than', value: '>' },
  { label: 'less than or equals to', value: '<=' },
  { label: 'greater than or equals to', value: '>=' }
];
