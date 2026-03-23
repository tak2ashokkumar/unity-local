import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AzureAccount } from 'src/app/shared/SharedEntityTypes/azure.type';
import { GCPAccountType } from 'src/app/shared/SharedEntityTypes/gcp.type';
import { UnityBorderDevices } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { OCIAccount } from 'src/app/shared/SharedEntityTypes/oci.type';
import { GET_AZURE_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { Firewall } from 'src/app/united-cloud/shared/entities/firewall.type';
import { Switch } from 'src/app/united-cloud/shared/entities/switch.type';

@Injectable()
export class UnityTopologyService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getAzureAccounts(): Observable<AzureAccount[]> {
    return this.http.get<AzureAccount[]>(`/customer/managed/azure/accounts/`, { params: { page_size: 0, discover_dependency: true } });
  }

  getOciAccounts(): Observable<OCIAccount[]> {
    return this.http.get<OCIAccount[]>(`/customer/managed/oci/account/`, { params: { page_size: 0, discover_dependency: true } });
  }

  getGcpAccounts(): Observable<GCPAccountType[]> {
    return this.http.get<GCPAccountType[]>(`/customer/managed/gcp/accounts/`, { params: { page_size: 0, discover_dependency: true } });
  }

  getAllRootDevices(dcId: string): Observable<UnityBorderDevices[]> {
    return this.http.get<UnityBorderDevices[]>(`/rca/root_devices/?datacenter=${dcId}`);
  }

  sendBorderDevices(payload: UnityBorderDevices[]): Observable<any> {
    return this.http.post<any>(`/rca/root_devices/`, payload);
  }

  buildBorderDevicesForm(data?: UnityBorderDevices[]): FormGroup {
    let rootDevices = data.filter(d => d.is_root_device);
    let form = this.builder.group({
      'allDevices': [rootDevices],
    })
    return form;
  }

  buildForm(target?: string): FormGroup {
    let form: FormGroup;
    switch (target) {
      case 'private_cloud':
        form = this.builder.group({
          'view': [viewTypes[1], [Validators.required]]
        })
        break;
      case 'public_cloud':
        form = this.builder.group({
          'view': [viewTypes[2], [Validators.required]],
          'cloudtype': ['', [Validators.required]],
          'account': ['', [Validators.required]],
        })
        break;
      default:
        form = this.builder.group({
          'view': [viewTypes[0], [Validators.required]]
        })
    }
    return form;
  }

  resetFormErrors() {
    return {
      'view': '',
      'cloudtype': '',
      'account': ''
    }
  }

  validationMessages = {
    'view': {
      'required': 'Type is required'
    },
    'cloudtype': {
      'required': 'Cloud Type is required'
    },
    'account': {
      'required': 'Account selection is required'
    },
  }
}

export class UnityTopologyViewType {
  constructor() { }
  view: string;
  viewToRender: string;
  node?: string;
  nodeId?: string;
  showCompleteTopology: boolean;
}

export const viewTypes: UnityTopologyViewType[] = [
  { viewToRender: 'Datacenter', view: 'colocloud', node: "org", showCompleteTopology: false },
  { viewToRender: 'Private Cloud', view: 'private_cloud', node: "org", showCompleteTopology: false },
  { viewToRender: 'Public Cloud', view: 'public_cloud', node: "account", showCompleteTopology: false },
];