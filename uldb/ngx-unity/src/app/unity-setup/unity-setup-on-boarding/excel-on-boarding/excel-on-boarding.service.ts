import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { OnBoardingWizardStepType } from './excel-on-boarding.type';

@Injectable({
  providedIn: 'root'
})
export class ExcelOnBoardingService {
  private excelSetNextPrevAnnouncedSource = new ReplaySubject<{ prevUrl: string, nextUrl: string }>(1);
  excelSetNextPrevAnnounced$ = this.excelSetNextPrevAnnouncedSource.asObservable();
  constructor() { }

  setNextPrev(data: { prevUrl: string, nextUrl: string }) {
    this.excelSetNextPrevAnnouncedSource.next(data);
  }
}

export const WIZARD_STEPS: OnBoardingWizardStepType[] = [
  {
    icon: 'fas fa-link',
    stepName: 'Upload/Download',
    url: 'files',
    active: false
  },
  {
    icon: 'fas fa-poll',
    stepName: 'Inventory',
    url: 'inventory',
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
    url: 'bms',
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
    stepName: 'MAC devices',
    url: 'mac',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.STORAGE_DEVICE}`,
    stepName: 'Storage',
    url: 'storages',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.MOBILE_DEVICE}`,
    stepName: 'Mobiles',
    url: 'mobiles',
    active: false
  },
  {
    icon: `fa ${FaIconMapping.DATABASE}`,
    stepName: 'Database',
    url: 'database',
    active: false
  },
  {
    icon: 'fa fa-clipboard',
    stepName: 'Summary',
    url: 'summary',
    active: false
  }
]
