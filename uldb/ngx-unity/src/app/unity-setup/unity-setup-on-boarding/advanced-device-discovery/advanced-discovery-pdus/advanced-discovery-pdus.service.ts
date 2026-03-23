import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable } from 'rxjs';
import { FIREWALL_CABINETS, GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, PDU_MODELS, PDU_POWER_CIRCUITS, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE, DEVICE_MODELS, PDU_MANUFACTURERS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
// import { PDUCRUDCabinet, PDUCRUDModel, PDUCRUDPowerCircuit } from 'src/app/united-cloud/datacenter/entities/pdus-crud.type';
import { PDU } from 'src/app/united-cloud/datacenter/entities/pdus.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvanceAdvancedDiscoveryScanOpRes, AdvancedDiscoveryScanOp } from '../advanced-discovery-scan-op.type';
import { PDUCRUDModel, PDUCRUDPowerCircuit, PDUCRUDCabinet, PDUCRUDManufacturer } from 'src/app/shared/pdu-crud/pdu-crud.type';

@Injectable()
export class AdvancedDiscoveryPdusService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getPdus(): Observable<AdvanceAdvancedDiscoveryScanOpRes> {
    return this.http.get<AdvanceAdvancedDiscoveryScanOpRes>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId(), DeviceMapping.PDU));
  }

  getDropdownData() {
    // const models = this.http.get<PDUCRUDModel[]>(PDU_MODELS());
    const manufacturers = this.http.get<PDUCRUDManufacturer[]>(PDU_MANUFACTURERS());
    const cabinets = this.http.get<PDUCRUDCabinet[]>(FIREWALL_CABINETS());
    const pc = this.http.get<PDUCRUDPowerCircuit[]>(PDU_POWER_CIRCUITS());
    return forkJoin([manufacturers, cabinets, pc]);
  }

  getModels(manufacturer: string): Observable<Array<PDUCRUDModel>> {
    return this.http.get<Array<PDUCRUDModel>>(DEVICE_MODELS(DeviceMapping.PDU, manufacturer));
  }

  convertToViewData(ops: AdvancedDiscoveryScanOp[]): DevDisPDUViewdata[] {
    let viewData: DevDisPDUViewdata[] = [];
    ops.map((op: AdvancedDiscoveryScanOp, index: number) => {
      let data = new DevDisPDUViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.uuid;
      data.hostname = op.hostname;
      data.manufacturer = op.manufacturer;
      data.model = op.model;
      data.os = op.os;
      data.version = op.version;
      data.ip = op.ip_address;
      data.observiumId = op.observium_id;
      data.cabinet = '';

      data.index = index;
      data.isOpen = false;
      data.openEnabled = op.onboarded_status ? false : true;

      data.form = this.createPduForm(op);
      data.formErrors = this.resetPduFormErrors();
      data.validationMessages = this.pduValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createPduForm(pdu: AdvancedDiscoveryScanOp): FormGroup {
    this.resetPduFormErrors();
    return this.builder.group({
      'unique_id': [pdu.uuid, [Validators.required, NoWhitespaceValidator]],
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'pdu_type': ['', [Validators.required, NoWhitespaceValidator]],
      'cabinet': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'power_circuit': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]],
      }),
      'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
      'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'sockets': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'management_ip': [{ value: pdu.ip_address ? pdu.ip_address : '', disabled: pdu.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'observium_id': [{ value: pdu.observium_id, disabled: true }],
      'os_type': [{ value: pdu.OStype, disabled: true }],
      // 'serial_number': [{ value: pdu.SerialNumber, disabled: true }],
      'mac_address': [{ value: pdu.MacAddress, disabled: true }],
      'version_number': [{ value: pdu.version, disabled: true }],
      'discovery_method': [{ value: pdu.discovery_method, disabled: true }],
      'first_discovered': [{ value: pdu.first_discovered, disabled: true }],
      'last_discovered': [{ value: pdu.last_discovered, disabled: true }],
      'collector': [pdu.collector]
    });
  }

  resetPduFormErrors() {
    return {
      'name': '',
      'asset_tag': '',
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
      'pdu_type': '',
      'cabinet': {
        'id': ''
      },
      'power_circuit': {
        'id': ''
      },
      'position': '',
      'size': '',
      'sockets': '',
      'management_ip': '',
    };
  }

  pduValidationMessages = {
    'name': {
      'required': 'PDU name is required'
    },
    'manufacturer': {
      'id': {
        'required': 'Manufacturer is required'
      }
    },
    'model': {
      'id': {
        'required': 'PDU Model is required'
      }
    },
    'pdu_type': {
      'required': 'PDU Type is required'
    },
    'cabinet': {
      'id': {
        'required': 'Cabinet is required'
      }
    },
    'power_circuit': {
      'id': {
        'required': 'Power Circuit is required'
      }
    },
    'position': {
      'required': 'Position is required',
      'min': 'Minimum value should be greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'sockets': {
      'required': 'Number of Sockets are required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  saveAll(data: DeviceDiscoveryPDUFormData[]): Observable<PDU[]> {
    return this.http.post<PDU[]>(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE('','',DeviceMapping.PDU), data);
  }
}

export class DevDisPDUViewdata {
  deviceType: string;
  uniqueId: string;
  hostname: string;
  manufacturer: string;
  model: string;
  os: string;
  version: string;
  ip: string;
  observiumId: string;
  cabinet: string;

  index: number;
  isOpen: boolean;
  openEnabled: boolean;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: PDUCRUDModel[];
}

export class DeviceDiscoveryPDUFormData {
  unique_id: string;
  name: string;
  asset_tag: string;
  manufacturer: {
    id: string;
  }
  model: {
    id: string;
  }
  pdu_type: string;
  cabinet: {
    id: string;
  }
  power_circuit: {
    id: string;
  }
  position: string;
  size: number;
  sockets: number;
  management_ip: string;
  observium_id: string;
}