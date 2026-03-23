import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { WizardStepType } from './advanced-device-discovery.type';

@Injectable({
  providedIn: 'root'
})
export class AdvancedDeviceDiscoveryService {
  private advNextPrevAnnouncedSource = new ReplaySubject<{ prevUrl: string, nextUrl: string }>(1);
  advNextPrevAnnounced$ = this.advNextPrevAnnouncedSource.asObservable();
  constructor(private storage: StorageService) { }

  advNextPrev(data: { prevUrl: string, nextUrl: string }) {
    this.advNextPrevAnnouncedSource.next(data);
  }

  getSelectedDiscoveryId() {
    return this.storage.getByKey('discoveryId', StorageType.SESSIONSTORAGE);
  }
}

export const WIZARD_STEPS: WizardStepType[] = [
  // {
  //   icon: 'fas fa-link',
  //   stepName: 'Credentials',
  //   url: 'credentials',
  //   active: false,
  //   disabled: false
  // },
  {
    icon: 'fas fa-search',
    stepName: 'Network Scan',
    url: 'nwscan',
    active: false,
    disabled: false
  },
  {
    icon: 'fas fa-poll',
    stepName: 'Scan Result',
    url: 'scanop',
    active: false,
    disabled: true
  },
  {
    icon: 'fa cfa-datacenter',
    stepName: 'Datacenter',
    url: 'datacenters',
    active: false,
    disabled: true
  },
  {
    icon: 'fa fa-cube',
    stepName: 'Cabinet',
    url: 'cabinets',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.PDU}`,
    stepName: 'PDU',
    url: 'pdus',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.FIREWALL}`,
    stepName: 'Firewall',
    url: 'firewalls',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.SWITCH}`,
    stepName: 'Switch',
    url: 'switches',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.LOAD_BALANCER}`,
    stepName: 'Loadbalancer',
    url: 'loadbalancers',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.BARE_METAL_SERVER}`,
    stepName: 'Server',
    url: 'servers',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.HYPERVISOR}`,
    stepName: 'Hypervisor',
    url: 'hypervisors',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.MAC_MINI}`,
    stepName: 'MAC devices',
    url: 'macdevices',
    active: false,
    disabled: true
  },
  {
    icon: `fa ${FaIconMapping.STORAGE_DEVICE}`,
    stepName: 'Storage',
    url: 'storage',
    active: false,
    disabled: true
  },
  {
    icon: 'fa fa-clipboard',
    stepName: 'Summary',
    url: 'summary',
    active: false,
    disabled: true
  }
]
