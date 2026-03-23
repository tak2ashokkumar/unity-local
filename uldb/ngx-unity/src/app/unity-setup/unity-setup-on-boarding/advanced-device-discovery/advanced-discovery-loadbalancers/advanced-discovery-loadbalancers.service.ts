import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, LOAD_BALANCER_MANUFACTURERS, LOAD_BALANCER_MODELS, LOAD_BALANCER_PRIVATE_CLOUD_FAST, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { LoadBalancerCRUDManufacturer, LoadBalancerCRUDModel, LoadBalancerCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/loadbalancer-crud.type';
import { LoadBalancer } from 'src/app/united-cloud/shared/entities/loadbalancer.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvanceAdvancedDiscoveryScanOpRes, AdvancedDiscoveryScanOp, AdvancedDiscoveryScanOpInterface } from '../advanced-discovery-scan-op.type';

@Injectable()
export class AdvancedDiscoveryLoadbalancersService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getLoadBalancers(): Observable<AdvanceAdvancedDiscoveryScanOpRes> {
    return this.http.get<AdvanceAdvancedDiscoveryScanOpRes>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId(), DeviceMapping.LOAD_BALANCER));
  }

  getDropdownData() {
    const manufacturers = this.http.get<LoadBalancerCRUDManufacturer[]>(LOAD_BALANCER_MANUFACTURERS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([manufacturers, dc]);
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getModels(manufacturer: string): Observable<Array<LoadBalancerCRUDModel>> {
    return this.http.get<Array<LoadBalancerCRUDModel>>(LOAD_BALANCER_MODELS(manufacturer));
  }

  convertToViewData(ops: AdvancedDiscoveryScanOp[]): DevDisLoadBalancerViewdata[] {
    let viewData: DevDisLoadBalancerViewdata[] = [];
    ops.map((op: AdvancedDiscoveryScanOp, index: number) => {
      let data = new DevDisLoadBalancerViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.uuid;
      data.hostname = op.hostname;
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

      data.form = this.createLoadBalancerForm(op);
      data.formErrors = this.resetLoadBalancerFormErrors();
      data.validationMessages = this.loadBalancerValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createLoadBalancerForm(lb: AdvancedDiscoveryScanOp): FormGroup {
    this.resetLoadBalancerFormErrors();
    return this.builder.group({
      'unique_id': [lb.uuid, [Validators.required, NoWhitespaceValidator]],
      'name': [lb.hostname ? lb.hostname : '', [Validators.required, NoWhitespaceValidator]],
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
      'management_ip': [{ value: lb.ip_address ? lb.ip_address : '', disabled: lb.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'observium_id': [{ value: lb.observium_id, disabled: true }],
      'cloud': [[], []],
      'os_type': [{ value: lb.OStype, disabled: true }],
      'serial_number': [lb.SerialNumber ? lb.SerialNumber : '',[Validators.required, NoWhitespaceValidator]],
      'mac_address': [{ value: lb.MacAddress, disabled: true }],
      'version_number': [{ value: lb.version, disabled: true }],
      'discovery_method': [{ value: lb.discovery_method, disabled: true }],
      'first_discovered': [{ value: lb.first_discovered, disabled: true }],
      'last_discovered': [{ value: lb.last_discovered, disabled: true }],
      'uptime': [lb.uptime],
      'interfaces': [lb.Interfaces],
      'collector': [lb.collector]
    });
  }

  resetLoadBalancerFormErrors() {
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

  loadBalancerValidationMessages = {
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

  saveAll(data: DeviceDiscoveryLoadBalancerFormData[]): Observable<LoadBalancer[]> {
    return this.http.post<LoadBalancer[]>(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE('','',DeviceMapping.LOAD_BALANCER), data);
  }
}

export class DevDisLoadBalancerViewdata {
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
  uptime: string;

  index: number;
  isOpen: boolean;
  openEnabled: boolean;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: LoadBalancerCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];
}

export class DeviceDiscoveryLoadBalancerFormData {
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
