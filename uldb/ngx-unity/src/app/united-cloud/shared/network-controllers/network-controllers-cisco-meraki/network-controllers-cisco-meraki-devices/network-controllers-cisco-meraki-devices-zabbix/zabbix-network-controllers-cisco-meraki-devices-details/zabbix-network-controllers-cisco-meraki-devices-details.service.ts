import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { MerakiDeviceType } from 'src/app/united-cloud/shared/entities/cisco-meraki-device.type';

@Injectable()
export class ZabbixNetworkControllersCiscoMerakiDevicesDetailsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getDeviceDetails(deviceId: string): Observable<MerakiDeviceType> {
    return this.http.get<MerakiDeviceType>(DEVICE_BY_ID(DeviceMapping.MERAKI_DEVICE, deviceId));
  }

  buildDetailForm(d: MerakiDeviceType): FormGroup {
    return this.builder.group({
      'name': [{ value: d.name ? d.name : '', disabled: true }],
      'device_model': [{ value: d.device_model ? d.device_model : '', disabled: true }],
      'meraki_organization_name': [{ value: d.meraki_organization_name ? d.meraki_organization_name : '', disabled: true }],
      'meraki_network_name': [{ value: d.meraki_network_name ? d.meraki_network_name : '', disabled: true }],
      'device_serial': [{ value: d.device_serial ? d.device_serial : '', disabled: true }],
      'device_ip': [{ value: d.device_ip ? d.device_ip : '', disabled: true }],
      'device_product_type': [{ value: d.device_product_type ? d.device_product_type : '', disabled: true }],
    })
  }

  buildMetaDataForm(d: MerakiDeviceType): FormGroup {
    return this.builder.group({
      'configuration_updated_at': [{ value: d.configuration_updated_at ? d.configuration_updated_at : '', disabled: true }],
      'asset_tag': [{ value: d.asset_tag ? d.asset_tag : '', disabled: true }],
      'mac_address': [{ value: d.mac_address ? d.mac_address : '', disabled: true }],
      'address': [{ value: d.address ? d.address : '', disabled: true }],
      'latitude': [{ value: d.latitude ? d.latitude : '', disabled: true }],
      'longitude': [{ value: d.longitude ? d.longitude : '', disabled: true }],
      'firmware': [{ value: d.firmware ? d.firmware : '', disabled: true }],
    })
  }

}
