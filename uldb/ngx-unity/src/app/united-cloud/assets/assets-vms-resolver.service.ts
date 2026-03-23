import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PRIVATE_CLOUDS, PUBLIC_CLOUDS_FAST } from 'src/app/shared/api-endpoint.const';
import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { TabData } from 'src/app/shared/tabdata';
import { cloneDeep as _clone } from 'lodash-es';
import { PublicCloudFast } from 'src/app/shared/SharedEntityTypes/public-cloud.type';

@Injectable()
export class AssetsVmsResolverService implements Resolve<TabData[]> {

  tabItems = _clone(tabItems);
  privateCloudTabItems = _clone(privateCloudTabItems);
  publicCloudTabItems = _clone(publicCloudTabItems);

  constructor(private http: HttpClient,) { }

  getPlatFormTypeToURLMapping(platformType: string): string {
    switch (platformType) {
      case 'VMware': return 'vmware';
      case 'vCloud Director': return 'vcloud';
      case 'OpenStack': return 'openstack';
      case 'ESXi': return 'esxi';
      case 'Hyperv': return 'hyperv';
      case 'Proxmox': return 'proxmox';
      case 'G3KVM': return 'g3kvm';
      case 'Custom': return 'custom';
      case 'AWS': return 'aws';
      case 'Azure': return 'azure';
      case 'GCP': return 'gcp';
      case 'Oracle': return 'oracle';
      case 'Nutanix': return 'nutanix';      
      default: return null;
    }
  }

  isPrivateCloudTypeExists(pclouds: PrivateClouds[], tabType: string) {
    let isExists: boolean = false;
    for (let i = 0; i < pclouds.length; i++) {
      if (pclouds[i].vms && tabType == this.getPlatFormTypeToURLMapping(pclouds[i].platform_type)) {
        isExists = true;
        break;
      }
    }
    return isExists;
  }

  getPrivateClouds(): Observable<TabData[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<PrivateClouds[]>(PRIVATE_CLOUDS(), { params: params })
      .pipe(map((data: PrivateClouds[]) => {
        let pcTabs: TabData[] = [];
        if (data.length) {
          this.privateCloudTabItems.forEach((pcTabItem, index) => {
            const isExists: boolean = this.isPrivateCloudTypeExists(_clone(data), pcTabItem.url);
            if (isExists) {
              pcTabs.push(pcTabItem);
            }
          })
        }
        return pcTabs;
      }));
  }

  isPublicCloudTypeExists(pclouds: PublicCloudFast[], tabType: string) {
    let isExists: boolean = false;
    for (let i = 0; i < pclouds.length; i++) {
      if (pclouds[i].vms && tabType == this.getPlatFormTypeToURLMapping(pclouds[i].cloud_type)) {
        isExists = true;
        break;
      }
    }
    return isExists;
  }

  getPublicClouds(): Observable<TabData[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<PublicCloudFast[]>(PUBLIC_CLOUDS_FAST(), { params: params })
      .pipe(map((data: PublicCloudFast[]) => {
        let pcTabs: TabData[] = [];
        if (data.length) {
          this.publicCloudTabItems.forEach((pcTabItem, index) => {
            const isExists: boolean = this.isPublicCloudTypeExists(_clone(data), pcTabItem.url);
            if (isExists) {
              pcTabs.push(pcTabItem);
            }
          })
        }
        return pcTabs;
      }));
  }

  async getCloudTabs() {
    let pcTabs: TabData[] = [];
    pcTabs.push(this.tabItems[0]);
    let privateCloudTabs = [];
    let publicCloudTabs = [];
    try {
      privateCloudTabs = await this.getPrivateClouds().toPromise();
    } catch (error) {
      privateCloudTabs = [];
    }
    try {
      publicCloudTabs = await this.getPublicClouds().toPromise();
    } catch (error) {
      publicCloudTabs = [];
    }
    return pcTabs.concat(privateCloudTabs).concat(publicCloudTabs);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<TabData[]> {
    return this.getCloudTabs();
  }
}

const privateCloudTabItems: TabData[] = [
  {
    name: 'VMware VMs',
    url: 'vmware'
  },
  {
    name: 'vCloud VMs',
    url: 'vcloud'
  },
  {
    name: 'OpenStack VMs',
    url: 'openstack'
  },
  {
    name: 'ESXi VMs',
    url: 'esxi'
  },
  {
    name: 'Hyper-V VMs',
    url: 'hyperv'
  },
  {
    name: 'Custom VMs',
    url: 'custom'
  },
  {
    name: 'Proxmox VMs',
    url: 'proxmox'
  },
  {
    name: 'G3 KVM VMs',
    url: 'g3kvm'
  },
  {
    name: 'Nutanix VMs',
    url: 'nutanix'
  },
];

const publicCloudTabItems: TabData[] = [
  {
    name: 'AWS VMs',
    url: 'aws'
  },
  {
    name: 'Azure VMs',
    url: 'azure'
  },
  {
    name: 'GCP VMs',
    url: 'gcp'
  },
  {
    name: 'Oracle VMs',
    url: 'oracle'
  }
]

const tabItems: TabData[] = [
  {
    name: 'All VMs',
    url: 'allvms'
  },
];
