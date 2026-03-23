import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getDeviceDetails(deviceId: string): Observable<any> {
    return this.http.get<any>(` /customer/meraki/organizations/${deviceId}/`);
  }

  buildDetailForm(d: any): FormGroup {
    return this.builder.group({
      'name': [{ value: d.name ? d.name : 'N/A', disabled: true }],
      'organization_id': [{ value: d.meraki_organization_id ? d.meraki_organization_id : 'N/A', disabled: true }],
      'region_host': [{ value: d.region_host ? d.region_host : 'N/A', disabled: true }],
      'region_name': [{ value: d.region_name ? d.region_name : 'N/A', disabled: true }],
      'licensing_model': [{ value: d.licensing_model, disabled: true }],
      'licenses': [{ value: d.license_count, disabled: true }],
      'network_count': [{ value: d.networks_count, disabled: true }],
      'devices_count': [{ value: d.devices_count, disabled: true }],
    })
  }

  buildLicenseDataForm(d: any): FormGroup {
    return this.builder.group({
      'expiry_date': [{ value: d.expiry_date ? this.utilSvc.toUnityOneDateFormat(d.expiry_date) : 'N/A', disabled: true }],
      'licensed_device_count': [{ value: d.devices_count, disabled: true }],
      'status': [{ value: d.license_status ? d.license_status : 'N/A', disabled: true }],
    })
  }

  buildLicenseStateForm(d: any): FormGroup {
    return this.builder.group({
      'active': [{ value: d.license_states.active, disabled: true }],
      'expired': [{ value: d.license_states.expired, disabled: true }],
      'expiring': [{ value: d.license_states.expiring, disabled: true }],
      'recently_queued': [{ value: d.license_states.recently_queued , disabled: true }],
      'unused': [{ value: d.license_states.unused, disabled: true }],
      'unused_active': [{ value: d.license_states.unused_active, disabled: true }],
    })
  }

  buildSystemManagerForm(d: any): FormGroup {
    return this.builder.group({
      'total_seats': [{ value: d.system_manager_data.total_seats, disabled: true }],
      'active_seats': [{ value: d.system_manager_data.active_seats, disabled: true }],
      'unassigned_seats': [{ value: d.system_manager_data.unassigned_seats, disabled: true }],
      'org_wise_enrolled_devices': [{ value: d.system_manager_data.orgwide_enrolled_devices, disabled: true }],
    })
  }

  resetDetailFormErrors() {
    return {
      'name': '',
      'organization_id': '',
      'region_host': '',
      'region_name': '',
      'licensing_model': '',
      'licenses': '',
      'network_count': '',
      'devices_count': '',
    }
  }

  resetLicenseDataFormErrors() {
    return {
      'expiry_date': '',
      'licensed_device_count': '',
      'status': '',
    }
  }

  resetLicenseStateFormErrors() {
    return {
      'active': '',
      'expired': '',
      'expiring': '',
      'recently_queued': '',
      'unused': '',
      'unused_active': '',
    }
  }

  resetSystemManagerFormErrors() {
    return {
      'total_seats': '',
      'active_seats': '',
      'unassigned_seats': '',
      'org_wise_enrolled_devices': '',
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
}
