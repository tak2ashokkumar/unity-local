import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_AGENT_CONFIGURATIONS, GET_PRIVATE_CLOUD_FAST } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PrivateCLoudFastType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { environment } from 'src/environments/environment';
import { veeamAccountType } from '../usio-veeam.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class UsioVeeamCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getPrivateClouds(platformType: string): Observable<PrivateCLoudFastType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0).set('platform_type', platformType);
    return this.http.get<PrivateCLoudFastType[]>(GET_PRIVATE_CLOUD_FAST(), { params: params });
  }

  getVeeamDetails(veeamId: string): Observable<veeamAccountType> {
    return this.http.get<veeamAccountType>(`/customer/veeam/accounts/${veeamId}`);
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }  

  buildCollectorsGroup(collector?: CollectorType) {
    return this.builder.group({
      'uuid': [collector ? collector.uuid : '', [Validators.required]],
    });
  }

  buildCredentialForm(data: veeamAccountType): FormGroup {
    if (data) {
      return this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'host_name': [data.host_name, [Validators.required, NoWhitespaceValidator]],
        'platform_type': [data.platform_type, [Validators.required, NoWhitespaceValidator]],
        'private_cloud': [data.private_cloud, [Validators.required]],
        'username': [data.username, [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'collector': this.buildCollectorsGroup(data.collector),
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'host_name': ['', [Validators.required, NoWhitespaceValidator]],
        'platform_type': ['', [Validators.required, NoWhitespaceValidator]],
        'private_cloud': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'collector': this.buildCollectorsGroup(),
      });
    }
  }

  resetCredentialFormErrors() {
    let credentialFormErrors = {
      'name': '',
      'host_name': '',
      'platform_type': '',
      'private_cloud': '',
      'username': '',
      'password': '',
      'collector': {
        'uuid': ''
      }
    };
    return credentialFormErrors;
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'host_name': {
      'required': 'Host name is required',
    },
    'platform_type': {
      'required': 'Private cloud type is required'
    },
    'private_cloud': {
      'required': 'Private cloud is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }

  createVeeam(data: veeamCrudFormDataType): Observable<veeamAccountType> {
    return this.http.post<veeamAccountType>(`/customer/veeam/accounts/`, data);
  }

  editVeeam(VeeamId: string, data: veeamCrudFormDataType): Observable<veeamAccountType> {
    return this.http.put<veeamAccountType>(`/customer/veeam/accounts/${VeeamId}/`, data);
  }

}

export interface veeamCrudFormDataType {
  name: string;
  host_name: string;
  private_cloud: string;
  username: string;
  password: string;
  schedule_meta: UnityScheduleType;
}

export interface privateCloudPlatformType {
  image: string;
  text: ServerSidePlatFormMapping;
}

export const privateCloudPlatformTypes: privateCloudPlatformType[] = [
  {
    text: ServerSidePlatFormMapping.VMWARE,
    image: `${environment.assetsUrl}external-brand/logos/V-Center.svg`
  },
  {
    text: ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER,
    image: `${environment.assetsUrl}external-brand/logos/United Cloud_Vcenter.svg`
  },
  // {
  //   text: ServerSidePlatFormMapping.OPENSTACK,
  //   image: `${environment.assetsUrl}external-brand/logos/OpenStack-Logo-Horizontal 1.svg`
  // },
  // {
  //   text: ServerSidePlatFormMapping.ESXI,
  //   image: `${environment.assetsUrl}external-brand/logos/vmware-integ.svg`
  // },
  // {
  //   text: ServerSidePlatFormMapping.VCLOUD,
  //   image: `${environment.assetsUrl}external-brand/logos/VMware Cloud Director.svg`
  // },
  // {
  //   text: ServerSidePlatFormMapping.G3_KVM,
  //   image: `${environment.assetsUrl}external-brand/logos/United Cloud_KVM.svg`
  // },
  // {
  //   text: ServerSidePlatFormMapping.HYPER_V,
  //   image: `${environment.assetsUrl}external-brand/logos/hyper-v.svg`
  // },
  // {
  //   text: ServerSidePlatFormMapping.NUTANIX,
  //   image: `${environment.assetsUrl}external-brand/logos/nutanix.svg`
  // },
  // {
  //   text: ServerSidePlatFormMapping.CUSTOM,
  //   image: ``
  // },
]