import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SdwanDevice } from 'src/app/united-cloud/shared/entities/sdwan-devices.type';
import { SdwanDeviceDetails } from 'src/app/unity-setup/unity-setup-integration/usi-others/usio-sdwan/usio-sdwan.type';

@Injectable()
export class ZabbixSdwanDeviceDetailsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getDeviceDetails(deviceId: string): Observable<SdwanDeviceDetails> {
    return this.http.get<SdwanDeviceDetails>(DEVICE_BY_ID(DeviceMapping.SDWAN_DEVICES, deviceId));
  }

  buildDetailForm(d: SdwanDeviceDetails): FormGroup {
    return this.builder.group({
      'hostname': [{ value: d.name ? d.name : 'N/A', disabled: true }],
      'device_type': [{ value: d.device_type ? d.device_type : 'N/A', disabled: true }],
      'domain_id': [{ value: d.domain_id ? d.domain_id : 'N/A', disabled: true }],
      'last_updated': [{ value: d.last_updated ? this.utilSvc.toUnityOneDateFormat(d.uptime) : 'N/A', disabled: true }],
      'site_id': [{ value: d.site_id ? d.site_id : 'N/A', disabled: true }],
      'device_model': [{ value: d.device_model ? d.device_model : 'N/A', disabled: true }],
      'system_ip': [{ value: d.system_ip ? d.system_ip : 'N/A', disabled: true }],
      'local_system_ip': [{ value: d.local_system_ip ? d.local_system_ip : 'N/A', disabled: true }],
      'reachability': [{ value: d.reachability ? d.reachability : 'N/A', disabled: true }],
      'health': [{ value: d.health ? d.health : 'N/A', disabled: true }],
      'state_description': [{ value: d.state_description ? d.state_description : 'N/A', disabled: true }],
      'bfd': [{ value: d.bfd ? d.bfd : 'N/A', disabled: true }],
      'vsmart_control': [{ value: d.vsmart_control ? d.vsmart_control : 'N/A', disabled: true }],
      'uptime': [{ value: d.uptime ? this.utilSvc.toUnityOneDateFormat(d.uptime) : 'N/A', disabled: true }],
    })
  }

  buildMetaDataForm(d: SdwanDeviceDetails): FormGroup {
    return this.builder.group({
      'chassis_number': [{ value: d.chassis_number ? d.chassis_number : 'N/A', disabled: true }],
      'board_serial_number': [{ value: d.board_serial_number ? d.board_serial_number : 'N/A', disabled: true }],
      'latitude': [{ value: d.latitude ? d.latitude : 'N/A', disabled: true }],
      'longitude': [{ value: d.longitude ? d.longitude : 'N/A', disabled: true }],
      'total_cpu_count': [{ value: d.total_cpu_count ? d.total_cpu_count : 'N/A', disabled: true }],
      'cpu_available': [{ value: d.cpu_load?.available ? d.cpu_load?.available : 'N/A', disabled: true }],
      'memory_available': [{ value: d.memory_utilization?.available ? d.memory_utilization?.available : 'N/A', disabled: true }],
      'software_version': [{ value: d.software_version ? d.software_version : 'N/A', disabled: true }],
    })
  }

  buildCertificateForm(d: SdwanDeviceDetails): FormGroup {
    return this.builder.group({
      'certificate_validity': [{ value: d.certificate_validity ? d.certificate_validity : 'N/A', disabled: true }],
      'validity': [{ value: d.validity ? d.validity : 'N/A', disabled: true }],
      'expiration_date': [{ value: d.certificate_expiration_date ? d.certificate_expiration_date : 'N/A', disabled: true }],
      'expiration_status': [{ value: d.certificate_expiration_status ? d.certificate_expiration_status : 'N/A', disabled: true }],
    })
  }

  resetDetailFormErrors() {
    return {
      'hostname': '',
      'device_groups': '',
      'domain_id': '',
      'last_updated': '',
      'latitude': '',
      'longitude': '',
      'personality': '',
      'site_id': '',
      'timezone': '',
      'device_model': '',
      'system_ip': '',
      'controller_type': '',
      'expiration_date': '',
      'expiration_status': '',
    }
  }

  resetMetaDataFormErrors() {
    return {
      'chassis_number': '',
      'board_serial_number': '',
      'latitude': '',
      'longitude': '',
      'total_cpu_count': '',
      'cpu_available': '',
      'memory_available': '',
      'software_version': '',
    }
  }

  resetCertificateFormErrors() {
    return {
      'certificate_validity': '',
      'validity': '',
      'expiration_date': '',
      'expiration_status': '',
    }
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
    },
    'model': {
      'id': {
        'required': 'Model is required'
      }
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }

  getInterfaceDetails() {

  }
}
