import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsfComponentsService {

  private computeSubmitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.computeSubmitAnnouncedSource.asObservable();

  form: FormGroup;
  customDropdownData: any = {};

  constructor(private builder: FormBuilder) { }

  submit() {
    this.computeSubmitAnnouncedSource.next();
  }

  buildForm(data: any) {
    this.form = this.builder.group({
      'sub_categories': [data?.sub_categories ?? ['CPU']],
    });
    (data?.sub_categories ?? ['CPU']).includes('CPU') && this.form.addControl('cpu', this.buildCpuGroup(data?.cpu));
    (data?.sub_categories ?? ['CPU']).includes('RAM') && this.form.addControl('ram', this.buildRamGroup(data?.ram));
    (data?.sub_categories ?? ['CPU']).includes('Storage') && this.form.addControl('storage', this.buildStorageGroup(data?.storage));
    (data?.sub_categories ?? ['CPU']).includes('Network') && this.form.addControl('network', this.buildNetworkGroup(data?.network));
    (data?.sub_categories ?? ['CPU']).includes('Backup') && this.form.addControl('backup', this.buildBackupGroup(data?.backup));
    (data?.sub_categories ?? ['CPU']).includes('OS Configuration') && this.form.addControl('os', this.buildOsGroup(data?.os));
    (data?.sub_categories ?? ['CPU']).includes('Operational') && this.form.addControl('operational', this.buildOperationalGroup(data?.operational));
    (data?.sub_categories ?? ['CPU']).includes('Fixed') && this.form.addControl('fixed', this.buildFixedGroup(data?.fixed));
    (data?.sub_categories ?? ['CPU']).includes('Management') && this.form.addControl('management', this.buildManagementGroup(data?.management));
  }

  buildCpuGroup(data: any): FormGroup {
    return this.builder.group({
      'cpu_count': [data?.cpu_count ?? null, [Validators.required, Validators.min(0)]],
      'cpu_type': [data?.cpu_type ?? null, [Validators.required]],
      'cpu_metric_type': [data?.cpu_metric_type ?? '', [Validators.required]],
      'cpu_metric_unit': [data?.cpu_metric_unit ?? '', [Validators.required]],
      'cpu_rate_value': [data?.cpu_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'cpu_rate_frequency': [data?.cpu_rate_frequency ?? '', [Validators.required]]
    });
  }

  buildRamGroup(data: any): FormGroup {
    return this.builder.group({
      'ram_size': [data?.ram_size ?? null, [Validators.required, Validators.min(0)]],
      'ram_metric_type': [data?.ram_metric_type ?? '', [Validators.required]],
      'ram_metric_unit': [data?.ram_metric_unit ?? '', [Validators.required]],
      'ram_rate_value': [data?.ram_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'ram_rate_frequency': [data?.ram_rate_frequency ?? '', [Validators.required]],
    });
  }

  buildStorageGroup(data: any): FormGroup {
    return this.builder.group({
      'storage_count': [data?.storage_count ?? null, [Validators.required, Validators.min(0)]],
      'storage_allocated_capacity': [data?.storage_allocated_capacity ?? null, [Validators.required, Validators.min(0)]],
      'storage_type': [data?.storage_type ?? null, [Validators.required]],
      'storage_rate_value': [data?.storage_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'storage_rate_frequency': [data?.storage_rate_frequency ?? '', [Validators.required]],
    });
  }

  buildNetworkGroup(data?: any): FormGroup {
    let nwGroup = this.builder.group({
      'network_resource_type': [data?.network_resource_type ?? []],
      'network_type': [data?.network_type ?? '', [Validators.required]],
      'network_dns_metric_type': [data?.network_dns_metric_type ?? '', [Validators.required]],
      'network_dns_metric_unit': [data?.network_dns_metric_unit ?? '', [Validators.required]],
      'network_dns_rate_value': [data?.network_dns_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'network_dns_rate_frequency': [data?.network_dns_rate_frequency ?? '', [Validators.required]],
      'network_port_metric_type': [data?.network_port_metric_type ?? '', [Validators.required]],
      'network_port_metric_unit': [data?.network_port_metric_unit ?? '', [Validators.required]],
      'network_port_rate_value': [data?.network_port_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'network_port_rate_frequency': [data?.network_port_rate_frequency ?? '', [Validators.required]],
    });

    if (!data?.network_resource_type) {
      nwGroup.get('network_dns_metric_type')?.disable();
      nwGroup.get('network_dns_metric_unit')?.disable();
      nwGroup.get('network_dns_rate_value')?.disable();
      nwGroup.get('network_dns_rate_frequency')?.disable();
      nwGroup.get('network_port_metric_type')?.disable();
      nwGroup.get('network_port_metric_unit')?.disable();
      nwGroup.get('network_port_rate_value')?.disable();
      nwGroup.get('network_port_rate_frequency')?.disable();
    } else {
      if (!data?.network_resource_type.includes('Network DNS')) {
        nwGroup.get('network_dns_metric_type')?.disable();
        nwGroup.get('network_dns_metric_unit')?.disable();
        nwGroup.get('network_dns_rate_value')?.disable();
        nwGroup.get('network_dns_rate_frequency')?.disable();
      }
      if (!data?.network_resource_type.includes('Network Port')) {
        nwGroup.get('network_port_metric_type')?.disable();
        nwGroup.get('network_port_metric_unit')?.disable();
        nwGroup.get('network_port_rate_value')?.disable();
        nwGroup.get('network_port_rate_frequency')?.disable();
      }
    }
    return nwGroup;
  }

  buildBackupGroup(data?: any): FormGroup {
    return this.builder.group({
      'backup_type': [data?.backup_type ?? null, [Validators.required]],
      'backup_metric_type': [data?.backup_metric_type ?? null, [Validators.required]],
      'backup_metric_unit': [data?.backup_metric_unit ?? null, [Validators.required]],
      'backup_rate_value': [data?.backup_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'backup_rate_frequency': [data?.backup_rate_frequency ?? '', [Validators.required]]
    });
  }

  buildOsGroup(data?: any): FormGroup {
    return this.builder.group({
      'os_type': [data?.os_type ?? null, [Validators.required]],
      'os_vendor': [data?.os_vendor ?? null, [Validators.required]],
      'os_distribution': [data?.os_distribution ?? null, [Validators.required]],
      'os_support_contract': [data?.os_support_contract ?? '', [Validators.required]],
      'os_metric_type': [data?.os_metric_type ?? '', [Validators.required]],
      'os_metric_unit': [data?.os_metric_unit ?? '', [Validators.required]],
      'os_rate_value': [data?.os_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'os_rate_frequency': [data?.backup_rate_frequency ?? '', [Validators.required]]
    });
  }

  buildOperationalGroup(data?: any): FormGroup {
    return this.builder.group({
      'operational_usage_metric': [data?.operational_usage_metric ?? null, [Validators.required]],
      'operational_metric_unit': [data?.operational_metric_unit ?? null, [Validators.required]],
      'operational_rate_value': [data?.operational_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'operational_rate_frequency': [data?.operational_rate_frequency ?? '', [Validators.required]]
    });
  }

  buildFixedGroup(data?: any): FormGroup {
    return this.builder.group({
      'fixed_usage_metric': [data?.fixed_usage_metric ?? null, [Validators.required]],
      'fixed_metric_unit': [data?.fixed_metric_unit ?? null, [Validators.required]],
      'fixed_rate_value': [data?.fixed_rate_value ?? null, [Validators.required, Validators.min(0)]],
      'fixed_rate_frequency': [data?.fixed_rate_frequency ?? '', [Validators.required]]
    });
  }

buildManagementGroup(data?: any): FormGroup {
  const mGroup = this.builder.group({
    management_tools: [data?.management_tools ?? []],
  });

  if (data?.management_tools?.length) {
    const detailsArray = this.builder.array([]);
    data.details.forEach(detail => {
      detailsArray.push(
        this.builder.group({
          name: [detail.name],
          metric: [detail.metric ?? ''],
          rate: [detail.rate ?? '']
        })
      );
    });
    mGroup.addControl('details', detailsArray);
  }

  return mGroup;
}

  resetFormErrors() {
    return {
      'cpu': {
        'cpu_count': '',
        'cpu_type': '',
        'cpu_metric_type': '',
        'cpu_metric_unit': '',
        'cpu_rate_value': '',
        'cpu_rate_frequency': ''
      },
      'ram': {
        'ram_size': '',
        'ram_metric_type': '',
        'ram_metric_unit': '',
        'ram_rate_value': '',
        'ram_rate_frequency': ''
      },
      'storage': {
        'storage_count': '',
        'storage_allocated_capacity': '',
        'storage_type': '',
        'storage_rate_value': '',
        'storage_rate_frequency': ''
      },
      'network': {
        'network_resource_type': '',
        'network_type': '',
        'network_dns_metric_type': '',
        'network_dns_metric_unit': '',
        'network_dns_rate_value': '',
        'network_dns_rate_frequency': '',
        'network_port_metric_type': '',
        'network_port_metric_unit': '',
        'network_port_rate_value': '',
        'network_port_rate_frequency': ''
      },
      'fixed': {
        'fixed_usage_metric': '',
        'fixed_metric_unit': '',
        'fixed_rate_value': '',
        'fixed_rate_frequency': ''
      },
      'operational': {
        'operational_usage_metric': '',
        'operational_metric_unit': '',
        'operational_rate_value': '',
        'operational_rate_frequency': '',
      },
      'backup': {
        'backup_type': '',
        'backup_metric_type': '',
        'backup_metric_unit': '',
        'backup_rate_value': '',
        'backup_rate_frequency': ''
      },
      'os': {
        'os_type': '',
        'os_vendor': '',
        'os_distribution': '',
        'os_support_contract': '',
        'os_metric_type': '',
        'os_metric_unit': '',
        'os_rate_value': '',
        'os_rate_frequency': ''
      },
      'management': {

      }
    }
  }

  validationMessages = {
    'cpu': {
      'cpu_count': {
        'required': 'CPU count is required.',
        'min': 'Invalid CPU count.'
      },
      'cpu_type': {
        'required': 'CPU type is required.'
      },
      'cpu_metric_type': {
        'required': 'CPU metric type is required.'
      },
      'cpu_metric_unit': {
        'required': 'CPU metric type is required.'
      },
      'cpu_rate_value': {
        'required': 'CPU rate value is required.',
        'min': 'Invalid CPU rate value.'
      },
      'cpu_rate_frequency': {
        'required': 'CPU rate frequency is required.'
      },
    },
    'ram': {
      'ram_size': {
        'required': 'RAM size is required.',
        'min': 'Invalid RAM size.'
      },
      'ram_metric_type': {
        'required': 'RAM metric type is required.'
      },
      'ram_metric_unit': {
        'required': 'RAM metric unit is required.'
      },
      'ram_rate_value': {
        'required': 'RAM rate value is required.',
        'min': 'Invalid RAM rate value.'
      },
      'ram_rate_frequency': {
        'required': 'RAM rate frequency is required.'
      },
    },
    'storage': {
      'storage_count': {
        'required': 'Storage count is required.',
        'min': 'Invalid storage count.'
      },
      'storage_allocated_capacity': {
        'required': 'Storage total size is required.',
        'min': 'Invalid storage size.'
      },
      'storage_type': {
        'required': 'Storage type is required.'
      },
      'storage_rate_value': {
        'required': 'Storage rate is required.',
        'min': 'Invalid storage rate value.'
      },
      'storage_rate_frequency': {
        'required': 'Storage rate frequency is required.'
      },
    },
    'network': {
      'network_resource_type': {
        'required': 'Network resource type is required.'
      },
      'network_type': {
        'required': 'Network type is required.'
      },
      'network_dns_metric_type': {
        'required': 'DNS metric type is required.'
      },
      'network_dns_metric_unit': {
        'required': 'DNS metric unit is required.'
      },
      'network_dns_rate_value': {
        'required': 'DNS rate value is required.',
        'min': 'Invalid DNS rate value.'
      },
      'network_dns_rate_frequency': {
        'required': 'DNS rate frequency is required.'
      },
      'network_port_metric_type': {
        'required': 'Port metric type is required.'
      },
      'network_port_metric_unit': {
        'required': 'Port metric unit is required.'
      },
      'network_port_rate_value': {
        'required': 'Port rate value is required.',
        'min': 'Invalid port rate value.'
      },
      'network_port_rate_frequency': {
        'required': 'Port rate frequency is required.'
      }
    },
    'fixed': {
      'fixed_usage_metric': {
        'required': 'Fixed usage metric is required.'
      },
      'fixed_metric_unit': {
        'required': 'Fixed metric unit is required.'
      },
      'fixed_rate_value': {
        'required': 'Fixed rate value is required.',
        'min': 'Invalid rate value.'
      },
      'fixed_rate_frequency': {
        'required': 'Fixed rate frequency is required.'
      }
    },
    'operational': {
      'operational_usage_metric': {
        'required': 'Operational usage metric is required.'
      },
      'operational_metric_unit': {
        'required': 'Operational metric unit is required.'
      },
      'operational_rate_value': {
        'required': 'Operational rate value is required.',
        'min': 'Invalid rate value.'
      },
      'operational_rate_frequency': {
        'required': 'Operational rate frequency is required.'
      }
    },
    'backup': {
      'backup_type': {
        'required': 'Backup type is required.'
      },
      'backup_metric_type': {
        'required': 'Backup metric type is required.'
      },
      'backup_metric_unit': {
        'required': 'Backup metric unit is required.'
      },
      'backup_rate_value': {
        'required': 'Backup rate value is required.',
        'min': 'Invalid rate value.'
      },
      'backup_rate_frequency': {
        'required': 'Backup rate frequency is required.'
      }
    },
    'os': {
      'os_type': {
        'required': 'OS type is required.'
      },
      'os_vendor': {
        'required': 'OS vendor is required.'
      },
      'os_distribution': {
        'required': 'OS distribution is required.'
      },
      'os_support_contract': {
        'required': 'OS support contract is required.'
      },
      'os_metric_type': {
        'required': 'OS metric type is required.'
      },
      'os_metric_unit': {
        'required': 'OS metric unit is required.'
      },
      'os_rate_value': {
        'required': 'OS rate value is required.',
        'min': 'Invalid OS rate value.'
      },
      'os_rate_frequency': {
        'required': 'OS rate frequency is required.',
      }
    },
    'management': {
      'details': {
        'metric': {
          'required': 'Metric is required'
        },
        'rate': {
          'required': 'Rate is required'
        }
      }
    }
  }

  getForm() {
    return this.form.getRawValue();
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  updateDropdownData(data: NgSelectOptions) {
    this.customDropdownData = data;
  }

  getCustomDropdownData() {
    return this.customDropdownData;
  }
}

export interface NgSelectOptions {
  [key: string]: string[];
}

export const Categories = [
  { 'name': 'CPU', 'isSelected': true },
  { 'name': 'RAM', 'isSelected': false },
  { 'name': 'Storage', 'isSelected': false },
  { 'name': 'Network', 'isSelected': false },
  { 'name': 'Backup', 'isSelected': false },
  { 'name': 'OS', 'isSelected': false },
  { 'name': 'Operational', 'isSelected': false },
  { 'name': 'Fixed', 'isSelected': false },
  { 'name': 'Management', 'isSelected': false },
]

export const SectionStates = {
  cpu: false,
  ram: false,
  storage: false,
  network: false,
  backup: false,
  software: false,
  operational: false,
  fixed: false,
}