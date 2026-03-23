import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators, IpVersion } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { NutanixVMDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
@Injectable()
export class NutanixVmsDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDeviceDetails(vmId: string, pcID: string): Observable<NutanixVMDetailsType> {
    return this.http.get<NutanixVMDetailsType>(`customer/nutanix/${pcID}/vms/${vmId}/`);
  }

  getDeviceDetailsById(vmId: string): Observable<NutanixVMDetailsType> {
    return this.http.get<NutanixVMDetailsType>(`customer/nutanix-devices/virtual_machines/${vmId}/`);
  }

  buildForm(data: NutanixVMDetailsType): FormGroup {
    return this.builder.group({
      'name': [data.name, [Validators.required]],
      'uuid': [data.uuid, [Validators.required]],
      'cluster': [data.cluster, [Validators.required]],
      'power_state': [data.power_state, [Validators.required]],
      'host_name': [data.host_name, [Validators.required]],
      'host_uuid': [data.host_uuid, [Validators.required]],
      'ip_address': [data.ip_address[0] ? data.ip_address[0] :'' , [Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'cores': [data.cores, [Validators.required]],
      'memory_capacity': [data.memory_capacity, [Validators.required]],
      'total_storage': [data.total_storage, [Validators.required]],
      'used_storage': [data.used_storage, [Validators.required]],
      'cpu_usage': [data.cpu_usage, [Validators.required]],
      'memory_usage': [data.memory_usage, [Validators.required]],
      'controller_read_iops': [data.controller_read_iops, [Validators.required]],
      'controller_write_iops': [data.controller_write_iops, [Validators.required]],
      'controller_bandwidth': [data.controller_bandwidth, [Validators.required]],
      'controller_avg_latency': [data.controller_avg_latency, [Validators.required]],
      'flash_mode': [data.flash_mode, [Validators.required]],
      'description': [data.description, [Validators.required]],
      'storage_container_uuid': [data.storage_container_uuid?.length > 0 ? data.storage_container_uuid[0] : '', [Validators.required]],
      'virtual_disks': [data.virtual_disks, [Validators.required]],
      'ngt_enabled': [data.ngt_enabled, [Validators.required]],
      'ngt_mounted': [data.ngt_mounted, [Validators.required]],
      'vm_id': [data.vm_id, [Validators.required]],
      'protection_status': [data.protection_status, [Validators.required]],
      'network_adapters': [data.network_adapters, [Validators.required]],
      'cluster_uuid': [data.cluster_uuid, [Validators.required]]
    });
  }

  resetDetailFormErrors(): any {
    return {
      'name': '',
      'uuid': '',
      'power_state': '',
      'cluster': '',
      'host_name': '',
      'host_uuid': '',
      'cores': '',
      'memory_capacity': '',
      'total_storage': '',
      'used_storage': '',
      'cpu_usage': '',
      'memory_usage': '',
      'controller_write_iops': '',
      'controller_bandwidth': '',
      'controller_avg_latency': '',
      'flash_mode': '',
      'description': '',
      'virtual_disks': '',
      'ngt_enabled': '',
      'ngt_mounted': '',
      'vm_id': '',
      'protection_status': '',
      'network_adapters': '',
      'cluster_uuid': '',
      'ip_address': '',
      'controller_read_iops': '',
    };
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'uuid': {
      'required': 'UUID is required'
    },
    'power_state': {
      'required': 'Power State is required'
    },
    'host_name': {
      'required': 'Host Name is required'
    },
    'host_uuid': {
      'required': 'Host UUID is required'
    },
    'cores': {
      'required': 'Cores is required'
    },
    'memory_capacity': {
      'required': 'Memory Capacity is required'
    },
    'total_storage': {
      'required': 'Total Storage is required'
    },
    'used_storage': {
      'required': 'Used Storage is required'
    },
    'cpu_usage': {
      'required': 'CPU Usage is required'
    },
    'memory_usage': {
      'required': 'Memory Usage is required'
    },
    'controller_write_iops': {
      'required': 'Controller Write IOPS is required'
    },
    'controller_bandwidth': {
      'required': 'Controller Bandwidth is required'
    },
    'controller_avg_latency': {
      'required': 'Controller Avg Latency is required'
    },
    'flash_mode': {
      'required': 'Flash Mode is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'virtual_disks': {
      'required': 'Virtual Disks is required'
    },
    'ngt_enabled': {
      'required': 'NGT Enabled is required'
    },
    'ngt_mounted': {
      'required': 'NGT Mounted is required'
    },
    'vm_id': {
      'required': 'VM ID is required'
    },
    'protection_status': {
      'required': 'Protection Status is required'
    },
    'network_adapters': {
      'required': 'Network Adapters is required'
    },
    'cluster_uuid': {
      'required': 'Cluster UUID is required'
    }
  };
}
