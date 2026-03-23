import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DatabaseServer, DatabaseType } from '../../../entities/database-servers.type';

@Injectable()
export class DatabaseZabbixDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,) { }

  getDeviceDetails(deviceId: string): Observable<DatabaseServer> {
    return this.http.get<DatabaseServer>(DEVICE_BY_ID(DeviceMapping.DB_SERVER, deviceId));
  }

  private getServerType(server: DatabaseServer): DeviceMapping {
    if (server.server_type == 'VMS') {
      if (server.device_object && server.device_object.cloud_type) {
        switch (server.device_object.cloud_type) {
          case 'vmware': return DeviceMapping.VMWARE_VIRTUAL_MACHINE;
          case 'OpenStack': return DeviceMapping.OPENSTACK_VIRTUAL_MACHINE;
          case 'vCloud Director': return DeviceMapping.VCLOUD;
          case 'Proxmox': return DeviceMapping.PROXMOX;
          case 'G3 KVM': return DeviceMapping.G3_KVM;
          case 'Custom': return DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
          default: return null;
        }
      } else {
        return null;
      }
    } else {
      return DeviceMapping.BARE_METAL_SERVER;
    }
  }

  buildDetailForm(d: DatabaseServer): FormGroup {
    return this.builder.group({
      'instance_id': [d.uuid, [Validators.required, NoWhitespaceValidator]],
      'instance_name': [d.db_instance_name, [Validators.required, NoWhitespaceValidator]],
      'type': [d.db_type ? d.db_type.name : '', [Validators.required, NoWhitespaceValidator]],
      'port': [d.port, [Validators.required, NoWhitespaceValidator]],
      'cloud': [d.private_cloud ? d.private_cloud.name : '', [Validators.required, NoWhitespaceValidator]],
      'cloud_type': [d.device_object ? d.device_object.cloud_type : null, [Validators.required, NoWhitespaceValidator]],
      'server_id': [d.device_object ? d.device_object.device_id : null, [Validators.required, NoWhitespaceValidator]],
      'server_uuid': [d.device_object ? d.device_object.device_uuid : null, [Validators.required, NoWhitespaceValidator]],
      'server_type': [this.getServerType(d), [Validators.required, NoWhitespaceValidator]],
      'server_name': [d.device_object?.name ? d.device_object.name : '', [Validators.required, NoWhitespaceValidator]],
      'management_ip': [d.device_object?.management_ip ? d.device_object.management_ip : '', [Validators.required, NoWhitespaceValidator]],
      'os': [d.device_object?.os ? d.device_object.os : '', [Validators.required, NoWhitespaceValidator]],
      'os_type': [d.device_object?.os_type ? d.device_object.os_type : '', [Validators.required, NoWhitespaceValidator]],         
      'life_cycle_stage': [d.life_cycle_stage ? d.life_cycle_stage : 'Operational', [NoWhitespaceValidator]],
      'life_cycle_stage_status': [d.life_cycle_stage_status ? d.life_cycle_stage_status : 'In Use', [NoWhitespaceValidator]]
    })
  }


  resetDetailFormErrors() {
    return {
      'instance_id': '',
      'instance_name': '',
      'type': '',
      'port': '',
      'cloud': '',
      'cloud_type': '',
      'server_id': '',
      'server_uuid': '',
      'server_type': '',
      'server_name': '',
      'management_ip': '',
      'os': '',
      'os_type': '',
      'monitoring': '',      
      'life_cycle_stage': '',
      'life_cycle_stage_status': '',
    }
  }

  detailFormValidationMessages = {
    // 'instance_name': {
    //   'required': 'Name is required'
    // },
    // 'management_ip': {
    //   'ip': 'Invalid IP'
    // }      
    'life_cycle_stage': {
      'required': 'Life Cycle Stage is required'
    },
    'life_cycle_stage_status': {
      'required': 'Life Cycle Stage Status is required'
    },
  }

}