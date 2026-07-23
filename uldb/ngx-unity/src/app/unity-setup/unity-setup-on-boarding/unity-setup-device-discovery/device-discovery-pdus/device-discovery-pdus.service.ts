import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { DeviceDiscoveryScanOp } from '../device-discovery-scan-op.type';
import { DEVICE_DISCOVERY_SCAN_OP, PDU_MODELS, CABINETS_BY_DATACENTER_ID, PDU_POWER_CIRCUITS, FIREWALL_CABINETS, CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PDUCRUDModel, PDUCRUDCabinet, PDUCRUDPowerCircuit } from 'src/app/united-cloud/datacenter/entities/pdus-crud.type';
import { RxwebValidators, IpVersion } from '@rxweb/reactive-form-validators';
import { PDU } from 'src/app/united-cloud/datacenter/entities/pdus.type';

@Injectable()
export class DeviceDiscoveryPdusService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getPdus(): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.get<DeviceDiscoveryScanOp[]>(DEVICE_DISCOVERY_SCAN_OP(DeviceMapping.PDU));
  }

  convertToViewData(ops: DeviceDiscoveryScanOp[]): DevDisPDUViewdata[] {
    let viewData: DevDisPDUViewdata[] = [];
    ops.map((op: DeviceDiscoveryScanOp, index: number) => {
      let data = new DevDisPDUViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.unique_id;
      data.hostname = op.hostname;
      data.manufaturer = op.manufaturer;
      data.model = op.model;
      data.os = op.os;
      data.version = op.version;
      data.ip = op.ip_address;
      data.observiumId = op.observium_id;
      data.cabinet = '';

      data.index = index;
      data.isOpen = false;
      data.openEnabled = op.db_pk ? false : true;

      data.form = this.createPduForm(op);
      data.formErrors = this.resetPduFormErrors();
      data.validationMessages = this.pduValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  getDropdownData() {
    const models = this.http.get<PDUCRUDModel[]>(PDU_MODELS());
    const cabinets = this.http.get<PDUCRUDCabinet[]>(FIREWALL_CABINETS());
    const pc = this.http.get<PDUCRUDPowerCircuit[]>(PDU_POWER_CIRCUITS());
    return forkJoin([models, cabinets, pc]);
  }

  createPduForm(pdu: DeviceDiscoveryScanOp): FormGroup {
    this.resetPduFormErrors();
    return this.builder.group({
      'unique_id': [pdu.unique_id, [Validators.required, NoWhitespaceValidator]],
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
      'observium_id': [{ value: pdu.observium_id, disabled: true }]
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
        'required': 'PDU Model is required'
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
    return this.http.post<PDU[]>(CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE(DeviceMapping.PDU), data);
  }
}

export class DevDisPDUViewdata {
  deviceType: string;
  uniqueId: string;
  hostname: string;
  manufaturer: string;
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