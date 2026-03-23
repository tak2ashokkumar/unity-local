import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, FIREWALL_MANUFACTURERS, FIREWALL_MODELS, FIREWALL_PRIVATE_CLOUD_FAST, GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { FirewallCRUDManufacturer, FirewallCRUDModel, FirewallCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/firewall-crud.type';
import { Firewall } from 'src/app/united-cloud/shared/entities/firewall.type';
import { AdvanceAdvancedDiscoveryScanOpRes, AdvancedDiscoveryScanOp, AdvancedDiscoveryScanOpInterface } from '../advanced-discovery-scan-op.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';

@Injectable()
export class AdvancedDiscoveryFirewallsService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getFirewalls(): Observable<AdvanceAdvancedDiscoveryScanOpRes> {
    return this.http.get<AdvanceAdvancedDiscoveryScanOpRes>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId(), DeviceMapping.FIREWALL));
  }

  getDropdownData() {
    const manufacturers = this.http.get<FirewallCRUDManufacturer[]>(FIREWALL_MANUFACTURERS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([manufacturers, dc]);
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getModels(manufacturer: string): Observable<Array<FirewallCRUDModel>> {
    return this.http.get<Array<FirewallCRUDModel>>(FIREWALL_MODELS(manufacturer));
  }

  convertToViewData(ops: AdvancedDiscoveryScanOp[]): DevDisFireWallViewdata[] {
    let viewData: DevDisFireWallViewdata[] = [];
    ops.map((op: AdvancedDiscoveryScanOp, index: number) => {
      let data = new DevDisFireWallViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.uuid;
      data.hostName = op.name;
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
      data.form = this.createFirewallForm(op);
      data.formErrors = this.resetFirewallFormErrors();
      data.validationMessages = this.firewallValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createFirewallForm(fireWall: AdvancedDiscoveryScanOp): FormGroup {
    this.resetFirewallFormErrors();
    return this.builder.group({
      'unique_id': [fireWall.uuid, [Validators.required, NoWhitespaceValidator]],
      'name': [fireWall.name ? fireWall.name : '', [Validators.required, NoWhitespaceValidator]],
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
      'management_ip': [{ value: fireWall.ip_address ? fireWall.ip_address : '', disabled: fireWall.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'cloud': [[], []],
      'observium_id': [{ value: fireWall.observium_id, disabled: true }],
      'os_type': [{ value: fireWall.OStype, disabled: true }],
      'serial_number': [fireWall.serial_number ? fireWall.serial_number : '', [Validators.required, NoWhitespaceValidator]],
      'mac_address': [{ value: fireWall.MacAddress, disabled: true }],
      'version_number': [{ value: fireWall.version, disabled: true }],
      'discovery_method': [{ value: fireWall.discovery_method, disabled: true }],
      'first_discovered': [{ value: fireWall.first_discovered, disabled: true }],
      'last_discovered': [{ value: fireWall.last_discovered, disabled: true }],
      'uptime': [fireWall.uptime],
      'interfaces': [fireWall.Interfaces],
      'collector': [fireWall.collector]
    });
  }

  resetFirewallFormErrors() {
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

  firewallValidationMessages = {
    'name': {
      'required': 'Firewall name is required'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
    },
    'model': {
      'id': {
        'required': 'Model is required'
      }
    },
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
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

  saveAll(data: DeviceDiscoveryFirewallFormData[]): Observable<Firewall[]> {
    return this.http.post<Firewall[]>(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE('','',DeviceMapping.FIREWALL), data);
  }
}

export class DevDisFireWallViewdata {
  deviceType: string;
  uniqueId: string;
  hostName: string;
  manufaturer: string;
  model: string;
  os: string;
  version: string;
  ip: string;
  observiumId: string;
  cabinet: string;
  uptime: string;
  index: number;
  isOpen: boolean;
  openEnabled: boolean;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: FirewallCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];
}

export class DeviceDiscoveryFirewallFormData {
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
