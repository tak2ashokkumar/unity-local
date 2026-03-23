import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable } from 'rxjs';
import { CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_DISCOVERY_SCAN_OP, SWITCH_MANUFACTURERS, SWITCH_MODELS, SWITCH_PRIVATE_CLOUD_FAST } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { SwitchCRUDManufacturer, SwitchCRUDModel, SwitchCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { DeviceDiscoveryScanOp } from '../device-discovery-scan-op.type';

@Injectable()
export class DeviceDiscoverySwitchesService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getSwitches(): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.get<DeviceDiscoveryScanOp[]>(DEVICE_DISCOVERY_SCAN_OP(DeviceMapping.SWITCHES));
  }

  getDropdownData() {
    const manufacturers = this.http.get<SwitchCRUDManufacturer[]>(SWITCH_MANUFACTURERS());
    const cabinets = this.http.get<CabinetFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.CABINET_VIZ));
    const pcCloud = this.http.get<SwitchCRUDPrivateCloudFast[]>(SWITCH_PRIVATE_CLOUD_FAST());
    return forkJoin([manufacturers, cabinets, pcCloud]);
  }

  getModels(manufacturer: string): Observable<Array<SwitchCRUDModel>> {
    return this.http.get<Array<SwitchCRUDModel>>(SWITCH_MODELS(manufacturer));
  }

  convertToViewData(ops: DeviceDiscoveryScanOp[]): DevDisSwitchViewdata[] {
    let viewData: DevDisSwitchViewdata[] = [];
    ops.map((op: DeviceDiscoveryScanOp, index: number) => {
      let data = new DevDisSwitchViewdata();
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

      data.form = this.createSwitchForm(op);
      data.formErrors = this.resetSwitchFormErrors();
      data.validationMessages = this.switchValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createSwitchForm(switchObj?: DeviceDiscoveryScanOp): FormGroup {
    this.resetSwitchFormErrors();
    return this.builder.group({
      'unique_id': [switchObj.unique_id, [Validators.required, NoWhitespaceValidator]],
      'name': [switchObj.hostname ? switchObj.hostname : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': ['', [Validators.required, NoWhitespaceValidator]],
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'cabinet': this.builder.group({
        'id': ['', [NoWhitespaceValidator]]
      }),
      'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
      'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'management_ip': [{ value: switchObj.ip_address ? switchObj.ip_address : '', disabled: switchObj.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'observium_id': [{ value: switchObj.observium_id, disabled: true }],
      'cloud': [[], []]
    });
  }

  resetSwitchFormErrors() {
    return {
      'name': '',
      'manufacturer': '',
      'model': {
        'id': ''
      },
      'cabinet': {
        'id': ''
      },
      'position': '',
      'size': '',
      'management_ip': '',
      'asset_tag': ''
    };
  }

  switchValidationMessages = {
    'name': {
      'required': 'Switch name is required'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
    },
    'model': {
      'id': {
        'required': 'Model is required'
      }
    },
    'position': {
      'min': 'Minimum value should be greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  saveAll(data: DeviceDiscoverySwitchFormData[]): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.post<DeviceDiscoveryScanOp[]>(CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE(DeviceMapping.SWITCHES), data);
  }
}

export class DevDisSwitchViewdata {
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

  form: FormGroup
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: SwitchCRUDModel[];
}

export class DeviceDiscoverySwitchFormData {
  unique_id: string;
  name: string;
  manufacturer: string;
  model: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  position: number;
  size: number;
  management_ip: string;
  asset_tag: string;
  observium_id: string;
  cloud: PrivateCLoudFast[];
}