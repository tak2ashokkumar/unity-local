import { Injectable } from '@angular/core';
import { WizardStepType } from './unity-setup-device-discovery.type';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnitySetupDeviceDiscoveryService {
  private nextPrevAnnouncedSource = new ReplaySubject<{ prevUrl: string, nextUrl: string }>(1);
  nextPrevAnnounced$ = this.nextPrevAnnouncedSource.asObservable();
  constructor() { }

  nextPrev(data: { prevUrl: string, nextUrl: string }) {
    this.nextPrevAnnouncedSource.next(data);
  }
}

export const WIZARD_STEPS: WizardStepType[] = [
  {
    icon: 'fas fa-search',
    stepName: 'Network Scan',
    url: 'nwscan',
    active: false
  },
  {
    icon: 'fas fa-poll',
    stepName: 'Scan Result',
    url: 'scanop',
    active: false
  },
  {
    icon: 'fa cfa-datacenter',
    stepName: 'Datacenter',
    url: 'datacenters',
    active: false
  },
  {
    icon: 'fa fa-cube',
    stepName: 'Cabinet',
    url: 'cabinets',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.PDU}`,
    stepName: 'PDU',
    url: 'pdus',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.FIREWALL}`,
    stepName: 'Firewall',
    url: 'firewalls',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.SWITCH}`,
    stepName: 'Switch',
    url: 'switches',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.LOAD_BALANCER}`,
    stepName: 'Loadbalancer',
    url: 'loadbalancers',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.BARE_METAL_SERVER}`,
    stepName: 'Server',
    url: 'servers',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.HYPERVISOR}`,
    stepName: 'Hypervisor',
    url: 'hypervisors',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.MAC_MINI}`,
    stepName: 'MAC Mini',
    url: 'mac',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.STORAGE_DEVICE}`,
    stepName: 'Storage',
    url: 'storage',
    active: false
  },
  {
    icon: 'fa fa-clipboard',
    stepName: 'Summary',
    url: 'summary',
    active: false
  }
]