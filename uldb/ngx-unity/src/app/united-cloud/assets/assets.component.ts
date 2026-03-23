import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabData;
  subscr: Subscription;
  constructor(private router: Router,
    private storageService: StorageService
  ) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/devices') {
          this.router.navigate([this.tabItems[0].url]);
        } else if (event.url === '/unitycloud/devices/vms') {
          this.router.navigate(['/unitycloud/devices/vms/allvms']);
        }
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
    this.storageService.removeByKey('criteria', StorageType.SESSIONSTORAGE);
  }
}

const tabData: TabData[] = [
  {
    name: 'Switches',
    url: '/unitycloud/devices/switches',
    icon: FaIconMapping.SWITCH
  },
  {
    name: 'Firewalls',
    url: '/unitycloud/devices/firewalls',
    icon: FaIconMapping.FIREWALL
  },
  {
    name: 'Load Balancers',
    url: '/unitycloud/devices/loadbalancers',
    icon: FaIconMapping.LOAD_BALANCER
  },
  {
    name: 'SD-WANs',
    url: '/unitycloud/devices/network-controllers',
    icon: FaIconMapping.NETWORK_CONTROLLERS
  },
  // {
  //   name: 'SD WAN',
  //   url: '/unitycloud/devices/sdwans',
  //   icon: FaIconMapping.SDWAN
  // },
  {
    name: 'Hypervisors',
    url: '/unitycloud/devices/hypervisors',
    icon: FaIconMapping.HYPERVISOR
  },
  {
    name: 'Bare Metal Servers',
    url: '/unitycloud/devices/bmservers',
    icon: FaIconMapping.BARE_METAL_SERVER
  },
  {
    name: 'MAC Mini',
    url: '/unitycloud/devices/macdevices',
    icon: FaIconMapping.MAC_MINI
  },
  {
    name: 'Virtual Machines',
    url: '/unitycloud/devices/vms',
    icon: FaIconMapping.VIRTUAL_MACHINE
  },
  {
    name: 'Containers',
    url: '/unitycloud/devices/kubernetes',
    icon: FaIconMapping.KUBERNETES
  },
  {
    name: 'Storage',
    url: '/unitycloud/devices/storagedevices',
    icon: FaIconMapping.SAN
  },
  // {
  //   name: 'S3',
  //   url: '/unitycloud/devices/s3account',
  //   icon: FaIconMapping.S3_BUCKET
  // },
  {
    name: 'Cloud Controllers',
    url: '/unitycloud/devices/cloudcontrollers',
    icon: FaIconMapping.CLOUD_CONTROLLER
  },
  {
    name: 'Mobile Devices',
    url: '/unitycloud/devices/mobiledevices',
    icon: FaIconMapping.MOBILE_DEVICE
  },
  {
    name: 'Databases',
    url: '/unitycloud/devices/databases',
    icon: FaIconMapping.DATABASE
  },
  {
    name: 'IOT Devices',
    url: '/unitycloud/devices/iot-devices',
    icon: FaIconMapping.IOT_DEVICES
  },
  {
    name: 'Other Devices',
    url: '/unitycloud/devices/otherdevices',
    icon: FaIconMapping.OTHER_DEVICES
  }
];