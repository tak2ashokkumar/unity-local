import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable } from 'rxjs';
import { CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_DISCOVERY_SCAN_OP, LOAD_BALANCER_MANUFACTURERS, LOAD_BALANCER_MODELS, LOAD_BALANCER_PRIVATE_CLOUD_FAST } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { LoadBalancerCRUDManufacturer, LoadBalancerCRUDModel, LoadBalancerCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/loadbalancer-crud.type';
import { LoadBalancer } from 'src/app/united-cloud/shared/entities/loadbalancer.type';
import { DeviceDiscoveryScanOp } from '../device-discovery-scan-op.type';

@Injectable()
export class DeviceDiscoveryLoadbalancersService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getLoadBalancers(): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.get<DeviceDiscoveryScanOp[]>(DEVICE_DISCOVERY_SCAN_OP(DeviceMapping.LOAD_BALANCER));
  }

  getDropdownData() {
    const manufacturers = this.http.get<LoadBalancerCRUDManufacturer[]>(LOAD_BALANCER_MANUFACTURERS());
    const cabinets = this.http.get<CabinetFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.CABINET_VIZ));
    const pcCloud = this.http.get<LoadBalancerCRUDPrivateCloudFast[]>(LOAD_BALANCER_PRIVATE_CLOUD_FAST());
    return forkJoin([manufacturers, cabinets, pcCloud]);
  }

  getModels(manufacturer: string): Observable<Array<LoadBalancerCRUDModel>> {
    return this.http.get<Array<LoadBalancerCRUDModel>>(LOAD_BALANCER_MODELS(manufacturer));
  }

  convertToViewData(ops: DeviceDiscoveryScanOp[]): DevDisLoadBalancerViewdata[] {
    let viewData: DevDisLoadBalancerViewdata[] = [];
    ops.map((op: DeviceDiscoveryScanOp, index: number) => {
      let data = new DevDisLoadBalancerViewdata();
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

      data.form = this.createLoadBalancerForm(op);
      data.formErrors = this.resetLoadBalancerFormErrors();
      data.validationMessages = this.loadBalancerValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createLoadBalancerForm(lb: DeviceDiscoveryScanOp): FormGroup {
    this.resetLoadBalancerFormErrors();
    return this.builder.group({
      'unique_id': [lb.unique_id, [Validators.required, NoWhitespaceValidator]],
      'name': [lb.hostname ? lb.hostname : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': ['', [Validators.required, NoWhitespaceValidator]],
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'cabinet': this.builder.group({
        'id': ['', [NoWhitespaceValidator]]
      }),
      'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
      'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'management_ip': [{ value: lb.ip_address ? lb.ip_address : '', disabled: lb.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'observium_id': [{ value: lb.observium_id, disabled: true }],
      'cloud': [[], []]
    });
  }

  resetLoadBalancerFormErrors() {
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

  saveAll(data: DeviceDiscoveryLoadBalancerFormData[]): Observable<LoadBalancer[]> {
    return this.http.post<LoadBalancer[]>(CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER), data);
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

  index: number;
  isOpen: boolean;
  openEnabled: boolean;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: LoadBalancerCRUDModel[];
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
  cloud: PrivateCLoudFast[]
}
