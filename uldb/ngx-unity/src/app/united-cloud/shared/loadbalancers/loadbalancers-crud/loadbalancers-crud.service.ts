import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, LOAD_BALANCER_DELETE, LOAD_BALANCER_MANUFACTURERS, LOAD_BALANCER_MODELS, LOAD_BALANCER_UPDATE, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { LoadBalancerCRUDManufacturer, LoadBalancerCRUDModel } from '../../entities/loadbalancer-crud.type';
import { LoadBalancer } from '../../entities/loadbalancer.type';
import { SNMPCrudTypeClass } from '../../entities/snmp-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable()
export class LoadbalancersCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();
  l
  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private userInfo: UserInfoService) { }

  addOrEditLoadbalancer(loadBalancerId: string) {
    this.addOrEditAnnouncedSource.next(loadBalancerId);
  }

  deleteLoadbalancer(loadBalancerId: string) {
    this.deleteAnnouncedSource.next(loadBalancerId);
  }

  getManufacturers() {
    return this.http.get<LoadBalancerCRUDManufacturer[]>(LOAD_BALANCER_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<Array<LoadBalancerCRUDModel>> {
    return this.http.get<Array<LoadBalancerCRUDModel>>(LOAD_BALANCER_MODELS(manufacturer));
  }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateCloud(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  createLoadBalancer(data: LoadBalancerCRUDFormData): Observable<LoadBalancer[]> {
    return this.http.post<LoadBalancer[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER), data);
  }

  deleteLoadBalanecer(loadBalancerId: string): Observable<any> {
    return this.http.delete(LOAD_BALANCER_DELETE(loadBalancerId));
  }

  updateLoadBalancer(data: LoadBalancerCRUDFormData, uuid: string): Observable<LoadBalancer[]> {
    return this.http.put<LoadBalancer[]>(LOAD_BALANCER_UPDATE(uuid), data);
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  createLoadBalancerForm(loadBalancerId?: string): Observable<FormGroup> {
    if (loadBalancerId) {
      return this.http.get<LoadBalancer>(LOAD_BALANCER_UPDATE(loadBalancerId)).pipe(
        map(lb => {
          let form = this.builder.group({
            'name': [lb.name, [Validators.required, NoWhitespaceValidator]],
            'manufacturer': [lb.manufacturer_id, [Validators.required, NoWhitespaceValidator]],
            'model': this.builder.group({
              'id': [lb.model_id, [Validators.required, NoWhitespaceValidator]]
            }),
            'datacenter': this.builder.group({
              'uuid': [lb.datacenter ? lb.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'cabinet': this.builder.group({
              'id': [lb.cabinet ? lb.cabinet.id : '', [NoWhitespaceValidator]]
            }),
            'position': [{ value: lb.cabinet ? lb.position : '', disabled: lb.cabinet ? false : true }, [Validators.min(0), NoWhitespaceValidator]],
            'size': [lb.size, [NoWhitespaceValidator, Validators.min(1)]],
            'management_ip': [lb.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'asset_tag': [lb.asset_tag, [NoWhitespaceValidator]],
            'cloud': [lb.cloud, []],
            'tags': [lb.tags.filter(tg => tg)],
            'custom_attribute_data': [lb.custom_attribute_data],
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [lb.collector ? lb.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
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
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'asset_tag': ['', [NoWhitespaceValidator]],
        'cloud': [[], []],
        'tags': [[]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    }
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
      'collector': {
        'uuid': ''
      }
    }
  }

  loadBalancerValidationMessages = {
    'name': {
      'required': 'Load Balancer name is required'
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
      'ip': 'Invalid IP address'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }
}

export class LoadBalancerCRUDFormData extends SNMPCrudTypeClass {
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
  cloud: PrivateCLoudFast[];
  collector: {
    uuid: string;
  }
  tags: string[];
}