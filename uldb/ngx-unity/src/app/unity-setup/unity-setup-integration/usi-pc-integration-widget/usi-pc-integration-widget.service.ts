import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrivateCloudCountType, PrivateCLoudFastType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_PRIVATE_CLOUD_COUNT, GET_PRIVATE_CLOUD_FAST, VERGEIO_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { VergeIOAccount } from '../usi-vergeio/usi-vergeio.type';
import { environment } from 'src/environments/environment';

@Injectable()
export class UsiPcIntegrationWidgetService {

  constructor(private http: HttpClient) { }

  // getPrivateCloudFast(): Observable<Array<PrivateCLoudFastType>> {
  //   return this.http.get<Array<PrivateCLoudFastType>>(GET_PRIVATE_CLOUD_FAST(), { params: new HttpParams().set('page_size', '0') });
  // };

  getCloudCount():  Observable<Array<PrivateCloudCountType>> {
    return this.http.get<Array<PrivateCloudCountType>> (GET_PRIVATE_CLOUD_COUNT());
  };

  // VergeIO accounts live in their own namespace, so the shared cloud_count does
  // not include them - read the count from the VergeIO accounts list instead.
  getVergeioCount(): Observable<PaginatedResult<VergeIOAccount>> {
    return this.http.get<PaginatedResult<VergeIOAccount>>(VERGEIO_ACCOUNTS(), { params: new HttpParams().set('page_size', '1') });
  };
}

export const PrivateClouds = {
  'esxi': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/vmware-integ.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'vmwareCloud': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/VMware Cloud Director.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'hyperV': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/hyper-v.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'openstack': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/OpenStack-Logo-Horizontal 1.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'proxmox': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/proxmox-server-solutions 1.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'vmwareVcenter': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/V-Center.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'upcKvm': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/United Cloud_KVM.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'upcVcenter': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/United Cloud_Vcenter.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'nutanix': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/nutanix.svg`,
    'viewDisabled': true,
    'length': 0
  },
  'vergeio': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/vergeio.svg`,
    'viewDisabled': true,
    'length': 0
  }
}
