import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin } from 'rxjs';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICE_BY_ID, DEVICE_MANUFACTURERS, DEVICE_MODELS, DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE, DEVICE_UPTIME_BY_DEVICE_ID, GET_AGENT_CONFIGURATIONS, PDU_POWER_CIRCUITS, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PDUCRUDManufacturer, PDUCRUDModel, PDUCRUDPowerCircuit } from 'src/app/shared/pdu-crud/pdu-crud.type';
import { PDU } from '../../../entities/pdus.type';
import { DataCenter } from '../../../tabs';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ZabbixDcPduDetailsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getDropdownData(dcId: string) {
    const manufacturers = this.http.get<PDUCRUDManufacturer[]>(DEVICE_MANUFACTURERS(DeviceMapping.PDU));
    const datacenter = this.http.get<DataCenter>(DEVICE_BY_ID(DeviceMapping.DC_VIZ, dcId))
    const cabinets = this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
    const powerCircuits = this.http.get<PDUCRUDPowerCircuit[]>(PDU_POWER_CIRCUITS());
    return forkJoin([manufacturers, datacenter, cabinets, powerCircuits]);
  }

  getDeviceDetails(deviceId: string): Observable<PDU> {
    return this.http.get<PDU>(DEVICE_BY_ID(DeviceMapping.PDU, deviceId));
  }

  getModels(manufacturer: string): Observable<Array<PDUCRUDModel>> {
    return this.http.get<Array<PDUCRUDModel>>(DEVICE_MODELS(DeviceMapping.PDU, manufacturer));
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  buildDetailForm(d: PDU): FormGroup {
    return this.builder.group({
      'name': [d.name, [Validators.required, NoWhitespaceValidator]],
      'dns_name': [d.dns_name, [NoWhitespaceValidator]],
      'management_ip': [d.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'domain': [d.domain, [NoWhitespaceValidator]],
      'environment': [d.environment, [NoWhitespaceValidator]],
      'serial_number': [d.serial_number, [NoWhitespaceValidator]],
      'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': [d.manufacturer ? d.manufacturer.id : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'model': this.builder.group({
        'id': [d.model_id, [Validators.required, NoWhitespaceValidator]]
      }),
      'power_circuit': this.builder.group({
        'id': [d.power_circuit_id, [Validators.required, NoWhitespaceValidator]]
      }),
      'availability_status': [d.status, []],
      'os_type': [d.os_type, [NoWhitespaceValidator]],
      'os_name': [d.os_name, [NoWhitespaceValidator]],
      'collector': this.builder.group({
        'uuid': [d.collector ? d.collector.uuid : '', [Validators.required]]
      }),
      'discovery_method': [d.discovery_method, [NoWhitespaceValidator]],
      'first_discovered': [d.first_discovered, [NoWhitespaceValidator]],
      'last_discovered': [d.last_discovered, [NoWhitespaceValidator]],
      'uptime': [{ value: d.uptime, disabled: true }, [NoWhitespaceValidator]],
      'last_rebooted': [d.last_rebooted, [NoWhitespaceValidator]],
      'end_of_life': [d.end_of_life, [NoWhitespaceValidator]],
      'end_of_support': [d.end_of_support, [NoWhitespaceValidator]],
      'end_of_service': [d.end_of_service, [NoWhitespaceValidator]],
      'pdu_type': [d.pdu_type, [Validators.required, NoWhitespaceValidator]],
      'description': [d.description, [NoWhitespaceValidator]],
      'note': [d.note, [NoWhitespaceValidator]],
    })
  }

  resetDetailFormErrors() {
    return {
      'name': '',
      'dns_name': '',
      'management_ip': '',
      'environment': '',
      'serial_number': '',
      'asset_tag': '',
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
      'os_type': '',
      'os_name': '',
      'power_circuit': {
        'id': ''
      },
      'collector': {
        'uuid': ''
      },
      'discovery_method': '',
      'first_discovered': '',
      'last_discovered': '',
      'uptime': '',
      'last_rebooted': '',
      'pdu_type': '',
      'description': '',
      'note': '',
    }
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'manufacturer': {
      'id': {
        'required': 'Manufacturer is required'
      }
    },
    'model': {
      'id': {
        'required': 'Model is required'
      }
    },
    'power_circuit': {
      'id': {
        'required': 'Power Circuit is required'
      }
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
    'pdu_type': {
      'required': 'PDU Type is required'
    },
  }

  buildLocationForm(d: PDU, dc: DataCenter): FormGroup {
    return this.builder.group({
      'datacenter': [dc.name, [Validators.required, NoWhitespaceValidator]],
      'cabinet': this.builder.group({
        'id': [d.cabinet ? d.cabinet.id : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'position': [d.cabinet ? d.position : '', [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'size': [d.size, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
    })
  }

  resetLocationFormErrors() {
    return {
      'datacenter': '',
      'cabinet': {
        'id': ''
      },
      'position': '',
      'size': '',
    }
  }

  locationFormValidationMessages = {
    'datacenter': {
      'required': 'Datacenter is required'
    },
    'cabinet': {
      'id': {
        'required': 'Cabinet is required'
      }
    },
    'position': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be greater than or equal to 1'
    },
  }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.PDU, deviceId));
  }

  updateDevice(uuid: string, data: any): Observable<PDU> {
    return this.http.put<PDU>(DEVICE_BY_ID(DeviceMapping.PDU, uuid), data);
  }

  syncUptime(uuid: string): Observable<any> {
    return this.http.get<any>(DEVICE_UPTIME_BY_DEVICE_ID(DeviceMapping.PDU, uuid));
  }

  syncSerialNumber(uuid: string): Observable<string> {
    return this.http.get<string>(DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE(DeviceMapping.PDU, uuid));
  }
}
