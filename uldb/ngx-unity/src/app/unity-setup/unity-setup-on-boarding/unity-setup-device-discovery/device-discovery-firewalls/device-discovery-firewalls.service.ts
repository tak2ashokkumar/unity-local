import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable } from 'rxjs';
import { CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_DISCOVERY_SCAN_OP, FIREWALL_MANUFACTURERS, FIREWALL_MODELS, FIREWALL_PRIVATE_CLOUD_FAST } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { FirewallCRUDManufacturer, FirewallCRUDModel, FirewallCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/firewall-crud.type';
import { Firewall } from 'src/app/united-cloud/shared/entities/firewall.type';
import { DeviceDiscoveryScanOp } from '../device-discovery-scan-op.type';

@Injectable()
export class DeviceDiscoveryFirewallsService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getFirewalls(): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.get<DeviceDiscoveryScanOp[]>(DEVICE_DISCOVERY_SCAN_OP(DeviceMapping.FIREWALL));
  }

  getDropdownData() {
    const manufacturers = this.http.get<FirewallCRUDManufacturer[]>(FIREWALL_MANUFACTURERS());
    const cabinets = this.http.get<CabinetFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.CABINET_VIZ));
    const privatecloud = this.http.get<FirewallCRUDPrivateCloudFast[]>(FIREWALL_PRIVATE_CLOUD_FAST());
    return forkJoin([manufacturers, cabinets, privatecloud]);
  }

  getModels(manufacturer: string): Observable<Array<FirewallCRUDModel>> {
    return this.http.get<Array<FirewallCRUDModel>>(FIREWALL_MODELS(manufacturer));
  }

  convertToViewData(ops: DeviceDiscoveryScanOp[]): DevDisFireWallViewdata[] {
    let viewData: DevDisFireWallViewdata[] = [];
    ops.map((op: DeviceDiscoveryScanOp, index: number) => {
      let data = new DevDisFireWallViewdata();
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

      data.form = this.createFirewallForm(op);
      data.formErrors = this.resetFirewallFormErrors();
      data.validationMessages = this.firewallValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createFirewallForm(fireWall: DeviceDiscoveryScanOp): FormGroup {
    this.resetFirewallFormErrors();
    return this.builder.group({
      'unique_id': [fireWall.unique_id, [Validators.required, NoWhitespaceValidator]],
      'name': [fireWall.hostname ? fireWall.hostname : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': ['', [Validators.required, NoWhitespaceValidator]],
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'cabinet': this.builder.group({
        'id': ['', [NoWhitespaceValidator]]
      }),
      'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
      'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'management_ip': [{ value: fireWall.ip_address ? fireWall.ip_address : '', disabled: fireWall.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'cloud': [[], []],
      'observium_id': [{ value: fireWall.observium_id, disabled: true }]
    });
  }

  resetFirewallFormErrors() {
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
      'asset_tag': '',
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

  saveAll(data: DeviceDiscoveryFirewallFormData[]): Observable<Firewall[]> {
    return this.http.post<Firewall[]>(CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE(DeviceMapping.FIREWALL), data);
  }
}

export class DevDisFireWallViewdata {
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
  models: FirewallCRUDModel[];
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
  cloud: PrivateCLoudFast[];
}