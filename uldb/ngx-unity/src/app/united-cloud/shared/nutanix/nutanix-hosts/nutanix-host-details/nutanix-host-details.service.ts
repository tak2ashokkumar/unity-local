import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { NutanixHostDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class NutanixHostDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDeviceDetails(hostId: string, pcId: string): Observable<NutanixHostDetailsType> {
    return this.http.get<NutanixHostDetailsType>(`customer/nutanix/${pcId}/hosts/${hostId}/`);
  }

  buildDetailForm(d: NutanixHostDetailsType): FormGroup {
    return this.builder.group({
      'name': [d.name, [Validators.required]],
      'uuid': [d.uuid, [Validators.required]],
      'host_ip': [d.host_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'cvm_ip': [d.cvm_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'memory_capacity': [d.memory_capacity, [Validators.required, NoWhitespaceValidator]],
      'cpu_usage': [d.cpu_usage, [Validators.required, NoWhitespaceValidator]],
      'memory_usage': [d.memory_usage, [Validators.required, NoWhitespaceValidator]],
      'cpu_cores': [d.cpu_cores, [Validators.required, NoWhitespaceValidator]],
      'cpu_capacity': [d.cpu_capacity, [Validators.required, NoWhitespaceValidator]],
      'disk_io_latency': [d.disk_io_latency, [Validators.required, NoWhitespaceValidator]],
      'disk_iops': [d.disk_iops, [Validators.required, NoWhitespaceValidator]],
      'disk_io_bandwidth': [d.disk_io_bandwidth, [Validators.required, NoWhitespaceValidator]],
      'used_storage': [d.used_storage, [Validators.required, NoWhitespaceValidator]],
      'free_storage_pct': [d.free_storage_pct, [Validators.required, NoWhitespaceValidator]],
      'storage_capacity': [d.total_storage, [Validators.required, NoWhitespaceValidator]],
      'hypervisor': [d.hypervisor, [Validators.required, NoWhitespaceValidator]],    
      'host_type': [d.host_type, [Validators.required, NoWhitespaceValidator]],
      'ipmi_ip': [d.ipmi_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'node_serial': [d.node_serial, [Validators.required, NoWhitespaceValidator]],
      'block_serial': [d.block_serial, [Validators.required, NoWhitespaceValidator]],
      'block_model': [d.block_model, [Validators.required, NoWhitespaceValidator]],
      'disks': [d.disks, [Validators.required, NoWhitespaceValidator]],
      'cpu_model': [d.cpu_model, [Validators.required, NoWhitespaceValidator]],
      'sockets': [d.sockets, [Validators.required, NoWhitespaceValidator]],
      'vms': [d.vms, [Validators.required, NoWhitespaceValidator]],
      'oplog_disk_pct': [d.oplog_disk_pct, [Validators.required, NoWhitespaceValidator]],
      'oplog_disk_size': [d.oplog_disk_size, [Validators.required, NoWhitespaceValidator]],
      'monitored': [d.monitored, []],
      'hypervisor_full_name': [d.hypervisor_full_name, [Validators.required, NoWhitespaceValidator]],
      'secure_boot_enabled': [d.secure_boot_enabled, [Validators.required, NoWhitespaceValidator]]
    });
  }

  resetDetailFormErrors() {
    return {
      'name': '',
      'uuid': '',
      'host_ip': '',
      'cvm_ip': '',
      'memory_capacity': '',
      'cpu_usage': '',
      'memory_usage': '',
      'cpu_cores': '',
      'cpu_capacity': '',
      'disk_io_latency': '',
      'disk_iops': '',
      'disk_io_bandwidth': '',
      'total_disk_usage': '',
      'total_disk_usage_pct': '',
      'hypervisor': '',
      'host_type': '',
      'ipmi_ip': '',
      'node_serial': '',
      'block_serial': '',
      'block_model': '',
      'storage_capacity': '',
      'disks': '',
      'cpu_model': '',
      'sockets': '',
      'vms': '',
      'oplog_disk_pct': '',
      'oplog_disk_size': '',
      'monitored': '',
      'hypervisor_full_name': '',
      'secure_boot_enabled': ''
    };
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'uuid': {
      'required': 'UUID is required'
    },
    'host_ip': {
      'required': 'Host IP is required',
      'ip': 'Invalid IP'
    },
    'cvm_ip': {
      'ip': 'Invalid IP'
    },
    'memory_capacity': {
      'required': 'Memory Capacity is required'
    },
    'cpu_usage': {
      'required': 'CPU Usage is required'
    },
    'memory_usage': {
      'required': 'Memory Usage is required'
    },
    'cpu_cores': {
      'required': 'CPU Cores is required'
    },
    'cpu_capacity': {
      'required': 'CPU Capacity is required'
    },
    'disk_io_latency': {
      'required': 'Disk IO Latency is required'
    },
    'disk_iops': {
      'required': 'Disk IOPS is required'
    },
    'disk_io_bandwidth': {
      'required': 'Disk IO Bandwidth is required'
    },
    'total_disk_usage': {
      'required': 'Total Disk Usage is required'
    },
    'total_disk_usage_pct': {
      'required': 'Total Disk Usage Percentage is required'
    },
    'hypervisor': {
      'required': 'Hypervisor is required'
    },
    'host_type': {
      'required': 'Host Type is required'
    },
    'ipmi_ip': {
      'ip': 'Invalid IP'
    },
    'node_serial': {
      'required': 'Node Serial is required'
    },
    'block_serial': {
      'required': 'Block Serial is required'
    },
    'block_model': {
      'required': 'Block Model is required'
    },
    'storage_capacity': {
      'required': 'Storage Capacity is required'
    },
    'disks': {
      'required': 'Disks is required'
    },
    'cpu_model': {
      'required': 'CPU Model is required'
    },
    'sockets': {
      'required': 'Sockets is required'
    },
    'vms': {
      'required': 'VMs is required'
    },
    'oplog_disk_pct': {
      'required': 'Oplog Disk Percentage is required'
    },
    'oplog_disk_size': {
      'required': 'Oplog Disk Size is required'
    },
    'monitored': {
      'required': 'Monitored is required'
    },
    'hypervisor_full_name': {
      'required': 'Hypervisor Full Name is required'
    },
    'secure_boot_enabled': {
      'required': 'Secure Boot Enabled is required'
    }
  };
}