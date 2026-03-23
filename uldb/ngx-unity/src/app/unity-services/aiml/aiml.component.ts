import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeviceMapping, UnityDeviceType } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'aiml',
  templateUrl: './aiml.component.html',
  styleUrls: ['./aiml.component.scss']
})
export class AimlComponent implements OnInit {
  tabItems: TabData[] = tabData;
  subscr: Subscription;
  constructor(private router: Router) { 
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/aiml') {
          this.router.navigate([this.tabItems[0].url]);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

}

const tabData: TabData[] = [
  {
    name: 'Summary',
    url: '/services/aiml/summary'
  },
  {
    name: 'Analytics',
    url: '/services/aiml/analytics'
  },
];

export const AIOPS_DEVICE_TYPES: UnityDeviceType[] = [
  { type: 'Switch', mapping: DeviceMapping.SWITCHES, key: 'switch' },
  { type: 'Firewall', mapping: DeviceMapping.FIREWALL, key: 'firewall' },
  { type: 'Load Balancer', mapping: DeviceMapping.LOAD_BALANCER, key: 'load_balancer' },
  { type: 'Hypervisor', mapping: DeviceMapping.HYPERVISOR, key: 'hypervisor' },
  { type: 'Bare Metal Server', mapping: DeviceMapping.BARE_METAL_SERVER, key: 'bms' },
  { type: 'Storage Device', mapping: DeviceMapping.STORAGE_DEVICES, key: 'storage' },
  { type: 'MAC Device', mapping: DeviceMapping.MAC_MINI, key: 'mac_device' },
  { type: 'Database Server', mapping: DeviceMapping.DB_SERVER, key: 'database' },
  { type: 'PDU', mapping: DeviceMapping.PDU, key: 'pdu' },
  { type: 'Virtual Machine', mapping: DeviceMapping.VIRTUAL_MACHINE, key: 'vm' },
];