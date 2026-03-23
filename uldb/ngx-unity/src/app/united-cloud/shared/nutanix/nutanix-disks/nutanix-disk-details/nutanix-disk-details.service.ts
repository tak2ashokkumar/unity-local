import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { NutanixDiskType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class NutanixDiskDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDeviceDetails(deviceId: string, pcId: string): Observable<any> {
    return this.http.get<NutanixDiskType>(`customer/nutanix/${pcId}/disks/${deviceId}/`);
  }

  buildDetailForm(d: NutanixDiskType): FormGroup {
    return this.builder.group({
      'disk_id': [d.disk_id, [Validators.required, NoWhitespaceValidator]],
      'uuid': [d.uuid, [NoWhitespaceValidator]],
      'serial_number': [d.serial_number, [Validators.required, NoWhitespaceValidator]],
      'host_name': [d.host_name, [NoWhitespaceValidator]],
      'hypervisor_ip': [d.hypervisor_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'tier': [d.tier, [NoWhitespaceValidator]],
      'status': [d.status, []],
      'storage_capacity': [d.storage_capacity, [Validators.required, NoWhitespaceValidator]],
      'storage_usage': [d.storage_usage, [NoWhitespaceValidator]],
      'storage_usage_pct': [d.storage_usage_pct, [NoWhitespaceValidator]],
      'disk_io_bandwidth': [d.disk_io_bandwidth, [NoWhitespaceValidator]],
      'disk_avg_io_latency': [d.disk_avg_io_latency, [NoWhitespaceValidator]],
      'disk_iops': [d.disk_iops, [NoWhitespaceValidator]],
      'model_name': [d.model_name, [Validators.required, NoWhitespaceValidator]],
    })
  }

  resetDetailFormErrors() {
    return {
      'host_name': '',
      'serial_number': '',
      'tier': '',
      'model_name': '',
      'hypervisor_ip': '',
      'status': '',
      'storage_capacity': '',
      'storage_usage': '',
      'storage_usage_pct': '',
      'disk_io_bandwidth': '',
      'disk_avg_io_latency': '',
      'disk_iops': '',
    }
  }

  detailFormValidationMessages = {
    'host_name': {
      'required': 'Name is required'
    },
    'serial_number': {
      'required': 'OS is required'
    },
    'tier': {
      'required': 'Manufacturer is required'
    },
    'model_name': {
      'required': 'Model is required'
    },
    'hypervisor_ip': {
      'ip': 'Invalid IP'
    },
    'disk_iops': {
      'required': 'Disk IOPS is required'
    },
    'disk_avg_io_latency': {
      'required': 'Disk Avg IO Latency is required'
    },
    'disk_io_bandwidth': {
      'required': 'Disk IO Bandwith is required'
    },
    'storage_usage_pct': {
      'required': 'Storage Usage PCT is required'
    },
    'storage_usage': {
      'required': 'Storage Usage is required'
    },
    'storage_capacity': {
      'required': 'Storage Capacity is required'
    }
  }
}