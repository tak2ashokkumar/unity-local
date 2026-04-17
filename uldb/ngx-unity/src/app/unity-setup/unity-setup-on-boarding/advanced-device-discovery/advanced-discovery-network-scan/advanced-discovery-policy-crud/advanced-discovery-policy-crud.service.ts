import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DATA_CENTERS, GET_AGENT_CONFIGURATIONS, GET_CREDENTIALS, HYPERVISOR_MANUFACTURERS, HYPERVISOR_OS, PDU_MANUFACTURERS, STORAGE_MANUFACTURERS, SWITCH_MANUFACTURERS, UPDATE_ADVANCED_DISCOVERY } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { QueryBuilderClassNames, QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { HypervisorCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/hypervisor-crud.type';
import { SwitchCRUDManufacturer } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { ManageReportDatacenterType } from 'src/app/unity-reports/report-management/report-management.type';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class AdvancedDiscoveryPolicyCrudService {
  servicefileForm: FormGroup;

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  private valueToSQL(value) {
    switch (typeof value) {
      case 'string':
        return "'" + value + "'";
      case 'boolean':
        return value ? '1' : '0';
      case 'number':
        if (isFinite(value)) return value;
    }
  }

  private isDefined(value) {
    return value !== undefined;
  }

  getDataCenters(): Observable<ManageReportDatacenterType[]> {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), { params: new HttpParams().set('page_size', '0') })
  }

  getCollectors() {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: new HttpParams().set('page_size', '0') });
  }

  getCredentails(discoveryMethods?: string[]): Observable<DeviceDiscoveryCredentials[]> {
    return this.http.get<DeviceDiscoveryCredentials[]>(GET_CREDENTIALS(), { params: new HttpParams().set('page_size', '0').set('discovery_methods', discoveryMethods?.join(',')) });
  }

  getManufacturers(data: string): Observable<any[]> {
    if (data == 'Switch' || data == 'Firewall' || data == 'Load Balancer') {
      return this.http.get<SwitchCRUDManufacturer[]>(SWITCH_MANUFACTURERS());
    } else if (data == 'Hypervisor' || data == 'Bare Metal' || data == 'Mac Device') {
      return this.http.get<any[]>(HYPERVISOR_MANUFACTURERS());
    } else if (data == 'Storage') {
      return this.http.get<any[]>(STORAGE_MANUFACTURERS());
    } else if (data == 'PDU') {
      return this.http.get<any[]>(PDU_MANUFACTURERS());
    } else {
      return of([]);
    }
  }

  getOperatingSystem() {
    return this.http.get<HypervisorCRUDOperatingSystem[]>(HYPERVISOR_OS());
  }

  getTemplateData() {
    return this.http.get<any[]>(`/customer/mtp/tenant-templates/?page_size=0`);
  }

  getDiscoveryDetails(uuid: string) {
    return this.http.get<any>(UPDATE_ADVANCED_DISCOVERY(uuid));
  }

  getDropdownData(): Observable<{ datacenters: ManageReportDatacenterType[], collectors: DeviceDiscoveryAgentConfigurationType[], credentials: DeviceDiscoveryCredentials[], operatingSystems: HypervisorCRUDOperatingSystem[], templates: any[] }> {
    return forkJoin({
      datacenters: this.getDataCenters().pipe(catchError(error => of(undefined))),
      collectors: this.getCollectors().pipe(catchError(error => of(undefined))),
      credentials: this.getCredentails().pipe(catchError(error => of(undefined))),
      operatingSystems: this.getOperatingSystem().pipe(catchError(error => of(undefined))),
      templates: this.getTemplateData().pipe(catchError(error => of(undefined))),
    });
  }

  buildForm(policyData?: any) {
    if (policyData) {
      let credential = policyData ? policyData.credentials.map(r => r.id) : [];
      let form = this.builder.group({
        'name': [policyData.name, [Validators.required, NoWhitespaceValidator]],
        'description': [{ value: policyData.description, disabled: true }],
        'collector': this.builder.group({
          'id': [policyData.collector ? policyData.collector.id : '', Validators.required]
        }),
        'credentials': [credential],
        'discovery_methods': [policyData.discovery_methods, [Validators.required]],
        'network_type': [policyData.network_type, [Validators.required]],
        'exclude_ips': [policyData.exclude_ips],
        'filter_enabled': [policyData.filter_enabled, [Validators.required]],
        'filter_rule_meta': [policyData.filter_rule_meta],
        'onboard_device': [policyData.onboard_device],
        'update_changes': [policyData.update_changes],
        'update_location': [policyData.update_location],
        'activate_monitoring': [policyData.activate_monitoring],
      })
      if (policyData.activate_monitoring) {
        form.addControl('monitoring_templates', this.builder.array(policyData.monitoring_templates.map(monitoring_template => this.getbuildFilterControls(monitoring_template))))
      }
      if (policyData.network_type == 'ip_range') {
        form.addControl('ip_range_from', new FormControl(policyData.discover_ips[0], [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
        form.addControl('ip_range_to', new FormControl(policyData.discover_ips[1], [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
      }
      if (policyData.network_type == 'subnet' || policyData.network_type == 'ip') {
        form.addControl('discover_ips', new FormControl(policyData.discover_ips[0]));
      }
      if (policyData.update_location) {
        form.addControl('default_datacenter', new FormControl(policyData.default_datacenter.id, [NoWhitespaceValidator, Validators.required]));
        form.addControl('default_cabinet', new FormControl(policyData.default_cabinet.id, [NoWhitespaceValidator, Validators.required]));
      }
      form.get('network_type')?.valueChanges.subscribe((networkType) => {
        const discoverIpsControl = form.get('discover_ips');
        if (networkType === 'subnet') {
          discoverIpsControl?.setValidators([Validators.required]);
          this.formValidationMessages.discover_ips.required = 'Subnet is required';
        } else if (networkType === 'ip') {
          discoverIpsControl?.setValidators([Validators.required]);
          this.formValidationMessages.discover_ips.required = 'IP is required';
        } else {
          discoverIpsControl?.clearValidators();
        }
      });
      // this.servicefileForm = form;
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [NoWhitespaceValidator, Validators.required]],
        'discovery_methods': [[], Validators.required],
        'network_type': ['ip_range'],
        'ip_range_from': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne }), Validators.required]],
        'ip_range_to': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne }), Validators.required]],
        'exclude_ips': [''],
        'collector': this.builder.group({
          'id': ['', [Validators.required]],
        }),
        'credentials': [[]],
        'filter_enabled': [false, [Validators.required]],
        'filter_rule_meta': [null],
        'description': [{ value: '', disabled: true }],
        'onboard_device': [true],
        'update_changes': [true],
        'update_location': [true],
        'default_datacenter': ['', [Validators.required]],
        'default_cabinet': ['', [Validators.required]],
        'activate_monitoring': [true],
        'monitoring_templates': this.builder.array([this.buildFilter()]),
      }, {
        validators: [ipRangeValidator(), anotherValidator()] // Using your custom validator for the form group
      })
      // this.servicefileForm = form;
      form.get('network_type')?.valueChanges.subscribe((networkType) => {
        const discoverIpsControl = form.get('discover_ips');
        if (networkType === 'subnet') {
          discoverIpsControl?.setValidators([Validators.required]);
          this.formValidationMessages.discover_ips.required = 'Subnet is required';
        } else if (networkType === 'ip') {
          discoverIpsControl?.setValidators([Validators.required]);
          this.formValidationMessages.discover_ips.required = 'IP is required';
        } else {
          discoverIpsControl?.clearValidators();
        }
        discoverIpsControl?.updateValueAndValidity();
      });
      return form;
    }
  }

  getbuildFilterControls(mt: any) {
    let group = this.builder.group({
      'type': [mt.type, [Validators.required]],
      'connection_type': [mt.connection_type, [Validators.required]],
      'template': [[], [Validators.required]],
    })
    if (mt.type == 'manufacturers') {
      group.addControl('manufacturers', new FormControl('', [Validators.required]));
      group.addControl('device_type', new FormControl(mt.device_type, [Validators.required]));
    }
    if (mt.type == 'operatingsystems') {
      group.addControl('operatingsystems', new FormControl('', [Validators.required]));
    }
    return group;
  }

  buildFilter() {
    let form = this.builder.group({
      'type': ['manufacturers', [Validators.required]],
      'device_type': ['', Validators.required],
      'manufacturers': [{ value: [], disabled: true }, [Validators.required]],
      'connection_type': ['', [Validators.required]],
      'template': [[], [Validators.required]],
    })
    return form;
  }

  resetFormErrors(additionalErrors?: any) {
    return {
      'name': '',
      'discovery_methods': [[]],
      'ip_range_from': '',
      'ip_range_to': '',
      'discover_ips': '',
      'default_datacenter': '',
      'default_cabinet': '',
      'exclude_ips': '',
      'credentials': [[]],
      'collector': {
        'id': ''
      }
      // 'monitoring_templates': [this.getResetFilterFormErrors()],
    }
  }

  getResetFilterFormErrors() {
    return {
      'type': '',
      'device_type': '',
      'manufacturers': '',
      'operatingsystems': '',
      'connection_type': '',
      'template': ''
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'discovery_methods': {
      'required': 'Discovery Type is required'
    },
    'ip_range_from': {
      'ip': 'Invalid IP',
      'required': 'Ip is required'
    },
    'ip_range_to': {
      'ip': 'Invalid IP',
      'required': 'Ip is required'
    },
    'discover_ips': {
      'required': ''
    },
    'collector': {
      'id': {
        'required': 'Collector is Required'
      }
    },
    'credentials': {
      'required': 'Credentials are required'
    },
    'default_datacenter': {
      'required': 'Datacenter is required'
    },
    'default_cabinet': {
      'required': 'Cabinet is required'
    },
    'monitoring_templates': {
      'type': {
        'required': 'Type is required'
      },
      'device_type': {
        'required': 'Device Type is required'
      },
      'operatingsystems': {
        'required': 'operating System is required'
      },
      'manufacturers': {
        'required': 'Manufacturers is required'
      },
      'connection_type': {
        'required': 'Monitoring Type is required'
      },
      'template': {
        'required': 'Template is required'
      }
    }
  }

  edit(uuid: string, data) {
    return this.http.put(`/customer/unity_discovery/discovery/${uuid}/`, data);
  }

  add(data) {
    return this.http.post(`/customer/unity_discovery/discovery/`, data);
  }

  ValidateName(form: FormGroup, field: any, formErrors: any, validationMessages: any,) {
    formErrors[field] = '';
    const control = form.get(field);
    if (control && !control.valid) {
      const messages = validationMessages[field];
      for (const key in control.errors) {
        if (key === 'whitespace') {
          formErrors[field] += 'Enter valid Input'
        } else {
          formErrors[field] += messages ? messages[key] : '' + ' ';
        }
        break;
      }
    }
    return formErrors;
  }

  basicRulesetToSQL(ruleset: RuleSet) {
    if (!ruleset) {
      return '';
    }
    return ruleset.rules.map((rule) => {
      if ((rule as RuleSet).rules) {
        return `(${this.basicRulesetToSQL(rule as RuleSet)})`;
      }
      rule = (rule as Rule);
      var column = rule.field,
        operator, value;

      switch (rule.operator) {
        case 'is null':
        case 'is not null':
          operator = rule.operator;
          value = '';
          break;
        case 'in':
        case 'not in':
          operator = rule.operator;
          if (Array.isArray(rule.value) && rule.value.length)
            value = `(${rule.value.map(this.valueToSQL).filter(this.isDefined).join(', ')})`;
          break;
        default:
          operator = rule.operator;
          value = this.valueToSQL(rule.value);
          break;
      }

      if (this.isDefined(column) && this.isDefined(operator)) {
        return `(${column} ${operator} ${value})`.trim();
      }
    }).filter(this.isDefined).join(` ${ruleset.condition} `);
  }

}

export const queryBuilderConfig: QueryBuilderConfig = {
  fields: {
    'host-name': {
      name: 'Hostname',
      type: 'string',
      operators: ['is', 'contains'],
      defaultOperator: 'is',
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Hostname is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
        return null;
      }
    },
    'ip-address': {
      name: 'IP',
      type: 'string',
      operators: ['is', 'contains'],
      defaultOperator: 'is',
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'IP is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
        return null;
      }
    },
    'manufacturer': {
      name: 'Manufacturer',
      type: 'string',
      operators: ['is', 'contains'],
      defaultOperator: 'is',
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Manufacturer is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
        return null;
      }
    },
    'model': {
      name: 'Model',
      type: 'string',
      operators: ['is', 'contains'],
      defaultOperator: 'is',
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Model is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
        return null;
      }
    },
    'os': {
      name: 'Operating System',
      type: 'string',
      operators: ['is', 'contains'],
      defaultOperator: 'is',
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Operating System is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
        return null;
      }
    },
    'device-type': {
      name: 'Device Type',
      type: 'category',
      operators: ['is', 'in'],
      defaultOperator: 'is',
      options: [
        { name: 'Switch', value: 'Switch' },
        { name: 'Firewall', value: 'Firewall' },
        { name: 'Load Balancer', value: 'Load Balancer' },
        { name: 'Hypervisor', value: 'Hypervisor' },
        { name: 'Bare Metal', value: 'Bare Metal' },
        { name: 'Mac Device', value: 'Mac Device' },
        { name: 'VM', value: 'VM' },
        { name: 'Storage', value: 'Storage' },
        { name: 'PDU', value: 'PDU' },
        { name: 'Mobile Device', value: 'Mobile Device' },
        { name: 'Custom Device', value: 'Custom Device' },
      ],
      defaultValue: 'Switch',
    },
    'Device Name': {
      name: 'Device Name',
      type: 'string',
      operators: ['is', 'contains'],
      defaultOperator: 'is',
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Device Name is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
        return null;
      }
    }
  }
}


export const queryBuilderClassNames: QueryBuilderClassNames = {
  removeIcon: 'fa fa-minus',
  addIcon: 'fa fa-plus',
  arrowIcon: 'fa fa-chevron-right px-2',
  button: 'btn',
  buttonGroup: 'btn-group ml-2',
  rightAlign: '',
  switchRow: 'd-flex px-2',
  switchGroup: 'd-flex align-items-center',
  ruleSetswitchRow: 'd-flex px-0',
  row: 'row align-items-center',
  rule: 'border p-2 bg-light',
  ruleSet: 'py-2 px-0',
  invalidRuleSet: '',
  emptyWarning: 'text-danger mx-auto',
  operatorControl: 'form-control form-control-sm',
  operatorControlSize: 'col-auto pr-0',
  fieldControl: 'form-control form-control-sm',
  fieldControlSize: 'col-auto pr-0',
  entityControl: 'form-control form-control-sm',
  entityControlSize: 'col-auto pr-0',
  inputControl: 'form-control form-control-sm',
  inputControlSize: 'col-auto'
}

export function custIpValidator(controlName1: string, controlName2: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const control1 = control.get(controlName1);
    const control2 = control.get(controlName2);
    return of(null);
  };
}

export function ipRangeValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.get('network_type').value == 'ip_range') {
      const ipFrom = control.get('ip_range_from')?.value;
      const ipTo = control.get('ip_range_to')?.value;

      // Split IP address parts
      if (ipFrom && ipTo) {
        if (ipFrom == ipTo) {
          return { 'invalidRange': true };
        }
        const ipFromParts = ipFrom?.split('.').map(part => parseInt(part, 10));
        const ipToParts = ipTo?.split('.').map(part => parseInt(part, 10));
        for (let i = 0; i < 4; i++) {
          if (ipFromParts[i] > ipToParts[i]) {
            return { 'invalidRange': true }; // Return error object indicating invalid range
          }
        }
      }
      // Check if IP from is less than or equal to IP to
      return null;
    } else {
      return null;
    }
  };
}

export function anotherValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const excludedIps = control.get('exclude_ips')?.value;
    if (control.get('network_type').value == 'ip_range') {
      const ipFrom = control.get('ip_range_from')?.value;
      const ipTo = control.get('ip_range_to')?.value;
      if (ipFrom && ipTo && excludedIps) {
        const ipFromParts = ipFrom?.split('.').map(part => parseInt(part, 10));
        const ipToParts = ipTo?.split('.').map(part => parseInt(part, 10));
        const excludedIpsArray = excludedIps.split(',').map(ip => ip.trim());
        for (const ip of excludedIpsArray) {
          const ipParts = ip.split('.').map(part => parseInt(part, 10));

          for (let i = 0; i < 4; i++) {
            if (ipParts[i] < ipFromParts[i] || ipParts[i] > ipToParts[i]) {
              return { invalidExcludeIpsRange: true };
            }
          }
        }
        return null;
      }
    }
    if (control.get('network_type').value == 'ip') {
      const ips = control.get('discover_ips')?.value;
      if (!ips) {
        return null;
      }
      else {
        if (!Array.isArray(ips)) {
          const ipsArray = ips.split(',').map(ip => ip.trim());
          for (const ip of ipsArray) {
            if (!isValidIp(ip)) {
              return { invalidIpFormat: true }; // Invalid IP format found, return error
            }
          }
          return null;
        }
      }
    }
    return null;
  };
}

function isValidIp(ip: string): boolean {
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipPattern);

  if (!match) {
    return false; // IP format doesn't match xxx.xxx.xxx.xxx
  }

  // Check each part of the IP address
  for (let i = 1; i <= 4; i++) {
    const part = parseInt(match[i], 10);
    if (isNaN(part) || part < 0 || part > 255) {
      return false; // Invalid part found
    }
  }

  return true; // IP format is valid
}