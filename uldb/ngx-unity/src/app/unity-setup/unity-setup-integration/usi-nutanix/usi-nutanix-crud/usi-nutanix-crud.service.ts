import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DeviceMonitoringSNMPCrudTypeClass } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { NutanixAccount, PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DATA_CENTERS, DEVICES_FAST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, GET_CREDENTIALS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UnityDevicesMonitoringCrudService } from 'src/app/app-shared-crud/unity-devices-monitoring-crud/unity-devices-monitoring-crud.service';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class UsiNutanixCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private snmpCrudSvc: UnityDevicesMonitoringCrudService) { }

  getInstanceDetails(instanceId: string): Observable<PrivateCloudType> {
    return this.http.get<PrivateCloudType>(`customer/private_cloud/${instanceId}/`);
  }

  getDataCenters(): Observable<DataCenter[]> {
    return this.http.get<DataCenter[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
    return this.http.get<DataCenter[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  getCollectors() {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: { 'page_size': '0' } });
  }

  getCredentails(): Observable<DeviceDiscoveryCredentials[]> {
    return this.http.get<DeviceDiscoveryCredentials[]>(GET_CREDENTIALS(), { params: new HttpParams().set('page_size', '0') });
  }

  buildCredentialForm(d: PrivateCloudType): FormGroup {
    if (d && d.nutanix_details) {
      return this.builder.group({
        'platform_type': ['Nutanix', [Validators.required]],
        'name': [d.name ? d.name : '', [Validators.required]],
        'colocation_cloud': [d.colocation_cloud ? d.colocation_cloud.uuid : '', [Validators.required]],
        'hostname': [d.nutanix_details.hostname ? d.nutanix_details.hostname : '', [Validators.required]],
        'collector': [d.collector ? d.collector.uuid : '', [Validators.required]],
        'credentials': [d.nutanix_details.credentials ? d.nutanix_details.credentials.uuid : '', [Validators.required]],
        'protection_domain': [d.nutanix_details.protection_domain ? d.nutanix_details.protection_domain : ''],
      })
    } else {
      return this.builder.group({
        'platform_type': ['Nutanix', [Validators.required]],
        'name': ['', [Validators.required]],
        'colocation_cloud': ['', [Validators.required]],
        'hostname': ['', [Validators.required]],
        'collector': ['', [Validators.required]],
        'credentials': ['', [Validators.required]],
        'protection_domain': [''],
      })
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
      'colocation_cloud': '',
      'hostname': '',
      'collector': '',
      'credentials': ''
    }
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account name is required'
    },
    'colocation_cloud': {
      'required': 'Datacenter is required',
    },
    'hostname': {
      'required': 'HostName is required',
    },
    'collector': {
      'required': 'Collector is required'
    },
    'credentials': {
      'required': 'Credentials is required'
    }
  }

  saveCredentialsForm(data: NutanixAccount, instanceId?: string,): Observable<PrivateCloudType> {
    if (instanceId) {
      return this.http.patch<PrivateCloudType>(`customer/private_cloud/${instanceId}/`, data);
    } else {
      return this.http.post<PrivateCloudType>(`/customer/private_cloud/`, data);
    }
  }

  buildFilterForm(d: PrivateCloudType): FormGroup {
    if (d && d.nutanix_details && d.nutanix_details.components_to_discover?.length) {
      let form = this.builder.group({
        'components_to_discover': [d.nutanix_details.components_to_discover ? d.nutanix_details.components_to_discover : [], [Validators.required]],
        'onboard_devices': [d.nutanix_details.onboard ? true : false],
      })
      this.snmpCrudSvc.addOrEdit(d.nutanix_details);
      return form;
    } else {
      let form = this.builder.group({
        'components_to_discover': [[], [Validators.required]],
        'onboard_devices': [false],
        // 'activate_monitoring': [false],
      })
      this.snmpCrudSvc.addOrEdit(null);
      return form;
    }
  }

  resetFilterFormErrors() {
    return {
      'components_to_discover': '',
    }
  }

  filterFormValidationMessages = {
    'components_to_discover': {
      'required': 'Component selection is required'
    },
  }

  saveInstance(data: any, instanceId: string) {
    return this.http.put<PrivateCloudType>(`customer/private_cloud/${instanceId}/`, data);
  }
}

// export class CollectorData {
//   constructor() { }
//   uuid: string;
//   id: string;
//   name: string;
// }

export class NutanixInstanceCRUDFormData extends DeviceMonitoringSNMPCrudTypeClass {
  /*
  * CredentialsForm attributes type
  */
  name: string;
  colocation_cloud: DataCenter;
  hostname: string;
  collector: DeviceDiscoveryAgentConfigurationType;
  credentials: DeviceDiscoveryCredentials;
  protection_domain: string;

  /*
  * FilterForm attributes type
  * SNMPCrudTypeClass attributes also is part of this form
  */
  components_to_discover: string[] = [];
  onboard_devices?: boolean;
  activate_monitoring: boolean;
}

export const nutanixComponents: Array<{ value: string, label: string }> = [
  {
    label: 'Virtual Machine',
    value: "vm",
  },
  {
    label: "Cluster",
    value: "cluster",
  },
  {
    label: "Host",
    value: "host",
  },
  {
    label: "Storage Container",
    value: "sc",
  },
  {
    label: "Disk",
    value: "disk",
  },
  {
    label: "Storage Pool",
    value: "sp",
  },
  {
    label: "Virtual Disks",
    value: "vdisk",
  },
  // {
  //   label: "Storage",
  //   value: "storage",
  // },
  // {
  //   label: "Mac Device",
  //   value: "mac_device",
  // },
  // {
  //   label: "PDU",
  //   value: "pdu",
  // },
  // {
  //   label: "Mobile Device",
  //   value: "mobile",
  // },
  // {
  //   label: "Vmware Virtual Machine",
  //   value: "vmware",
  // },
];

