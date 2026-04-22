import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PDU } from 'src/app/united-cloud/datacenter/entities/pdus.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICE_LIST_BY_DEVICE_TYPE, DEVICE_MODELS, GET_AGENT_CONFIGURATIONS, PDU_DELETE, PDU_MANUFACTURERS, PDU_POWER_CIRCUITS, PDU_UPDATE } from '../../shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator, PDUTypes } from '../../shared/app-utility/app-utility.service';
import { PDUCRUDCabinet, PDUCRUDManufacturer, PDUCRUDModel, PDUCRUDPowerCircuit } from './pdu-crud.type';
import { UserInfoService } from '../../shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable({
  providedIn: 'root'
})
export class PduCrudService {
  private addOrEditAnnouncedSource = new Subject<{ pduId: string, dcId: string, isBillingCrud: boolean }>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder, private http: HttpClient, private userInfo: UserInfoService) { }

  addOrEditPDU(pduId: string, dcId: string, isBillingCrud?: boolean) {
    this.addOrEditAnnouncedSource.next({ pduId: pduId, dcId: dcId, isBillingCrud: isBillingCrud });
  }

  deletePDU(dcPduId: string) {
    this.deleteAnnouncedSource.next(dcPduId);
  }

  getManufacturers() {
    return this.http.get<PDUCRUDManufacturer[]>(PDU_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<PDUCRUDModel[]> {
    return this.http.get<PDUCRUDModel[]>(DEVICE_MODELS(DeviceMapping.PDU, manufacturer));
  }

  getCabinets(dcId: string): Observable<PDUCRUDCabinet[]> {
    return this.http.get<PDUCRUDCabinet[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPowerCircuits(): Observable<PDUCRUDPowerCircuit[]> {
    return this.http.get<PDUCRUDPowerCircuit[]>(PDU_POWER_CIRCUITS());
  }

  createPdu(data: PDUCrudFormData): Observable<PDU[]> {
    return this.http.post<PDU[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.PDU), data);
  }

  deletePdu(dcPduId: string): Observable<any> {
    return this.http.delete(PDU_DELETE(dcPduId));
  }

  updatePdu(data: PDUCrudFormData, uuid: string): Observable<PDU[]> {
    return this.http.put<PDU[]>(PDU_UPDATE(uuid), data);
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  createPDUForm(dcPduId: string, isBillingCRUD: boolean): Observable<FormGroup> {
    if (dcPduId) {
      return this.http.get<PDU>(PDU_UPDATE(dcPduId)).pipe(
        map(pd => {
          let form = this.builder.group({
            'name': [{ value: pd.name, disabled: isBillingCRUD }, [Validators.required, NoWhitespaceValidator]],
            'asset_tag': [{ value: pd.asset_tag, disabled: isBillingCRUD }, [NoWhitespaceValidator]],
            'manufacturer': this.builder.group({
              'id': [{ value: pd.manufacturer ? pd.manufacturer.id : '', disabled: isBillingCRUD }, [Validators.required, NoWhitespaceValidator]]
            }),
            'model': this.builder.group({
              'id': [{ value: pd.model_id, disabled: isBillingCRUD }, [Validators.required, NoWhitespaceValidator]]
            }),
            'pdu_type': [{ value: pd.pdu_type, disabled: true }, [Validators.required, NoWhitespaceValidator]],
            'cabinet': this.builder.group({
              'id': [{ value: pd.cabinet ? pd.cabinet.id : '', disabled: isBillingCRUD }, [Validators.required, NoWhitespaceValidator]]
            }),
            'power_circuit': this.builder.group({
              'id': [{ value: pd.power_circuit_id, disabled: isBillingCRUD }, [Validators.required, NoWhitespaceValidator]]
            }),
            'position': [{ value: pd.cabinet ? pd.position : '', disabled: (pd.cabinet ? false : true) || isBillingCRUD }, [Validators.min(0), NoWhitespaceValidator]],
            'size': [{ value: pd.size, disabled: isBillingCRUD }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'sockets': [{ value: pd.sockets, disabled: isBillingCRUD }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'management_ip': [{ value: pd.management_ip, disabled: isBillingCRUD }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'cost': [pd.cost, [Validators.min(0)]],
            'annual_escalation': [pd.annual_escalation, [Validators.min(0), Validators.max(100)]],
            'tags': [pd.tags.filter(tg => tg)]
          });
          if (pd.pdu_type == PDUTypes.VERTICAL) {
            form.get('size').disable();
          }
          // if (pd.snmp_community) {
          //   form.addControl('snmp_community', new FormControl({ value: pd.snmp_community, disabled: isBillingCRUD }, [NoWhitespaceValidator, Validators.required]));
          //   form.addControl('ip_address', new FormControl({ value: pd.ip_address, disabled: isBillingCRUD }, [NoWhitespaceValidator]));
          // }
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [pd.collector ? pd.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
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
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'cost': [null, [Validators.min(0)]],
        'annual_escalation': [null, [Validators.min(0), Validators.max(100)]],
        'tags': [[]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));;
    }
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
      'cost': '',
      'annual_escalation': '',
      'collector': {
        'uuid': ''
      }
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
        'required': 'Model is required'
      }
    },
    'pdu_type': {
      'required': 'PDU Type is required'
    },
    'power_circuit': {
      'id': {
        'required': 'Power Circuit is required'
      }
    },
    'cabinet': {
      'id': {
        'required': 'Cabinet is required'
      }
    },
    'position': {
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
    },
    'cost': {
      'min': 'Cost should be in positive values'
    },
    'annual_escalation': {
      'min': 'Percentage should be in positive values',
      'max': 'Percentage can be maximum of 100'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }
}

export class PDUCrudFormData {
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
  collector: {
    uuid: string;
  }
  constructor() { }
}