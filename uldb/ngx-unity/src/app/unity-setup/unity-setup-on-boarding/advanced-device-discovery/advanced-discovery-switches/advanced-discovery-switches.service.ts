import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE, SWITCH_MANUFACTURERS, SWITCH_MODELS, SWITCH_PRIVATE_CLOUD_FAST } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { SwitchCRUDManufacturer, SwitchCRUDModel, SwitchCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvanceAdvancedDiscoveryScanOpRes, AdvancedDiscoveryScanOp, AdvancedDiscoveryScanOpInterface } from '../advanced-discovery-scan-op.type';

@Injectable()
export class AdvancedDiscoverySwitchesService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getSwitches(): Observable<AdvanceAdvancedDiscoveryScanOpRes> {
    return this.http.get<AdvanceAdvancedDiscoveryScanOpRes>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId(), DeviceMapping.SWITCHES));
  }

  getDropdownData() {
    const manufacturers = this.http.get<SwitchCRUDManufacturer[]>(SWITCH_MANUFACTURERS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([manufacturers, dc]);
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getModels(manufacturer: string): Observable<Array<SwitchCRUDModel>> {
    return this.http.get<Array<SwitchCRUDModel>>(SWITCH_MODELS(manufacturer));
  }

  convertToViewData(ops: AdvancedDiscoveryScanOp[]): DevDisSwitchViewdata[] {
    let viewData: DevDisSwitchViewdata[] = [];
    console.log(ops);
    ops.map((op: AdvancedDiscoveryScanOp, index: number) => {
      let data = new DevDisSwitchViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.uuid?.toString();
      data.hostname = op.name;
      data.manufaturer = op.manufacturer;
      data.model = op.model;
      data.os = op.os;
      data.version = op.version;
      data.ip = op.ip_address;
      data.observiumId = op.observium_id;
      data.cabinet = '';
      data.uptime = op.uptime;
      data.index = index;
      data.isOpen = false;
      data.openEnabled = op.onboarded_status ? false : true;
      data.form = this.createSwitchForm(op);
      data.formErrors = this.resetSwitchFormErrors();
      data.validationMessages = this.switchValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createSwitchForm(switchObj?: AdvancedDiscoveryScanOp): FormGroup {
    this.resetSwitchFormErrors();
    return this.builder.group({
      'unique_id': [switchObj.uuid, [Validators.required, NoWhitespaceValidator]],
      'name': [switchObj.name ? switchObj.name : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': ['', [Validators.required, NoWhitespaceValidator]],
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'datacenter': this.builder.group({
        'uuid': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'cabinet': this.builder.group({
        'id': ['', [NoWhitespaceValidator]]
      }),
      'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
      'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'management_ip': [{ value: switchObj.ip_address ? switchObj.ip_address : '', disabled: switchObj.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'observium_id': [{ value: switchObj.observium_id, disabled: true }],
      'cloud': [[], []],
      'os_type': [{ value: switchObj.OStype, disabled: true }],
      'serial_number': [switchObj.serial_number ? switchObj.serial_number : '', [Validators.required, NoWhitespaceValidator]],
      'mac_address': [{ value: switchObj.MacAddress, disabled: true }],
      'version_number': [{ value: switchObj.version, disabled: true }],
      'discovery_method': [{ value: switchObj.discovery_method, disabled: true }],
      'first_discovered': [{ value: switchObj.first_discovered, disabled: true }],
      'last_discovered': [{ value: switchObj.last_discovered, disabled: true }],
      'uptime': [switchObj.uptime],
      'interfaces': [switchObj.Interfaces],
      'collector': [switchObj.collector]
    });
  }

  resetSwitchFormErrors() {
    return {
      'name': '',
      'manufacturer': '',
      'model': {
        'id': ''
      },
      'datacenter': {
        'uuid': ''
      },
      'cabinet': {
        'id': ''
      },
      'position': '',
      'size': '',
      'management_ip': '',
      'asset_tag': '',
      'serial_number': ''
    };
  }

  switchValidationMessages = {
    'name': {
      'required': 'Switch name is required'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
    },
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
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
    },
    'serial_number': {
      'required': 'Serial Number is required'
    }
  }

  saveAll(data: DeviceDiscoverySwitchFormData[]): Observable<AdvancedDiscoveryScanOp[]> {
    return this.http.post<AdvancedDiscoveryScanOp[]>(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE('','',DeviceMapping.SWITCHES), data);
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
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: SwitchCRUDModel[];
  cabinets: CabinetFast[];
  uptime: string;
  clouds: DeviceCRUDPrivateCloudFast[];
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
  serial_number: string;
  cloud: PrivateCLoudFast[];
  interfaces: AdvancedDiscoveryScanOpInterface;
}
