import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatacenterService } from './datacenter.service';
import { Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
import { DataCenterTabs } from './tabs';
import { Subscription, Subject } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { CRUDActionTypes, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { take, takeUntil } from 'rxjs/operators';
import { DcCrudService } from 'src/app/app-shared-crud/dc-crud/dc-crud.service';
import { DatacenterDeviceTabDefinition, DatacenterDeviceTabIcon, DatacenterDeviceTabResponse } from './entities/datacenter-device-tab.type';

@Component({
  selector: 'datacenter',
  templateUrl: './datacenter.component.html',
  styleUrls: ['./datacenter.component.scss']
})
export class DatacenterComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  tabItems: DataCenterTabs[] = [];
  dcId: string;
  subscr: Subscription;
  tabData: TabData[] = [];
  isResourceDetailView: boolean = false;

  constructor(private dcService: DatacenterService,
    private spinnerService: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: DcCrudService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.dcId = params.get('dcId'));
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isResourceDetailView = /\/containercontrollers\/(kubernetes|docker)\//.test(event.url);
        if (event.url === '/unitycloud/datacenter' || event.url === '/unitycloud/datacenter/' + this.dcId) {
          this.route.data.pipe(take(1)).subscribe((data: { tabItems: DataCenterTabs[] }) => {
            this.tabItems = data.tabItems;
            if (this.tabItems.length) {
              if (this.dcId === null) {
                this.router.navigate([this.tabItems[0].url, 'cabinets']);
              } else {
                this.router.navigate(['/unitycloud/datacenter/', this.dcId, 'cabinets']);
              }
            }
          });
        } else {
          this.tabData = [...tabData];
          this.route.data.pipe(take(1)).subscribe((data: { tabItems: DataCenterTabs[] }) => {
            this.tabItems = data.tabItems;
            this.loadDatacenterDeviceTabs();
          });
        }
      }
    });
  }

  ngOnInit() {
    this.isResourceDetailView = /\/containercontrollers\/(kubernetes|docker)\//.test(this.router.url);
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.subscr.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  goTo(tab: TabData) {
    if (tab.url) {
      this.router.navigate(['/unitycloud/datacenter/', this.dcId, ...tab.url.split('/')]);
    }
  }

  isActive(tab: TabData) {
    if (tab.url && this.router.url.match('/unitycloud/datacenter/' + this.dcId + '/' + tab.url)) {
      return 'active text-success';
    }
  }

  onCrud(event: { type: CRUDActionTypes, dcId?: string }) {
    if (event.type == CRUDActionTypes.DELETE) {
      this.router.navigate(['/unitycloud/datacenter/']);
    } else {
      if (event.type == CRUDActionTypes.ADD) {
        this.router.navigate(['/unitycloud/datacenter/', event.dcId]);
      } else {
        this.reloadDatacenter();
      }
    }
  }

  addDatacenter() {
    this.crudSvc.addOrEditDataCenter(null);
  }

  editDatacenter() {
    this.crudSvc.addOrEditDataCenter(this.dcId);
  }

  deleteDatacenter() {
    this.crudSvc.deleteDataCenter(this.dcId);
  }

  reloadDatacenter() {
    this.dcService.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tabItems = res;
      this.loadDatacenterDeviceTabs();
    });
  }

  private loadDatacenterDeviceTabs() {
    this.tabData = [...tabData];
    if (!this.dcId) {
      return;
    }
    this.dcService.getDatacenterDeviceTabs(this.dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: DatacenterDeviceTabResponse[]) => {
      this.tabData = this.buildTabData(data);
    }, err => {
      this.tabData = [...tabData];
    });
  }

  private buildTabData(data: DatacenterDeviceTabResponse[]): TabData[] {
    const deviceTabs = data
      .filter((item: DatacenterDeviceTabResponse) => item.count > 0)
      .map((item: DatacenterDeviceTabResponse) => this.mapDeviceTab(item))
      .filter((item: TabData | null): item is TabData => item !== null);
    return [...tabData, ...deviceTabs];
  }

  private mapDeviceTab(item: DatacenterDeviceTabResponse): TabData | null {
    const tab = datacenterDeviceTabDefinitions.find((definition: DatacenterDeviceTabDefinition) => definition.apiDeviceName === item.device);
    if (!tab) {
      return null;
    }
    return {
      name: tab.name,
      url: tab.url,
      icon: this.getTabIcon(item.device)
    };
  }

  private getTabIcon(deviceName: string): string | undefined {
    const tab = tabIcons.find((item: DatacenterDeviceTabIcon) => item.name === deviceName);
    return tab ? tab.icon : undefined;
  }
}

const tabData: TabData[] = [
  {
    name: 'Cabinets',
    url: 'cabinets',
    icon: 'fa-cube'
  },
  {
    name: 'PDUs',
    url: 'pdus',
    icon: 'fa-plug'
  },
  {
    name: 'Private Cloud',
    url: 'pccloud',
    icon: 'cfa-private-cloud'
  }
];

const datacenterDeviceTabDefinitions: DatacenterDeviceTabDefinition[] = [
  {
    apiDeviceName: 'Switch',
    name: 'Switches',
    url: 'devices/switches'
  },
  {
    apiDeviceName: 'Firewall',
    name: 'Firewalls',
    url: 'devices/firewalls'
  },
  {
    apiDeviceName: 'Load Balancer',
    name: 'Load Balancers',
    url: 'devices/loadbalancers'
  },
  {
    apiDeviceName: 'Hypervisor',
    name: 'Hypervisors',
    url: 'devices/hypervisors'
  },
  {
    apiDeviceName: 'Bare Metal Server',
    name: 'Bare Metal Servers',
    url: 'devices/bmservers'
  },
  {
    apiDeviceName: 'Storage Device',
    name: 'Storage Devices',
    url: 'devices/storagedevices'
  }
];

const tabIcons: DatacenterDeviceTabIcon[] = [
  {
    name: 'Switch',
    icon: FaIconMapping.SWITCH
  },
  {
    name: 'Firewall',
    icon: FaIconMapping.FIREWALL
  },
  {
    name: 'Load Balancer',
    icon: FaIconMapping.LOAD_BALANCER
  },
  {
    name: 'SD WAN',
    icon: FaIconMapping.SDWAN
  },
  {
    name: 'Hypervisor',
    icon: FaIconMapping.HYPERVISOR
  },
  {
    name: 'Bare Metal Server',
    icon: FaIconMapping.BARE_METAL_SERVER
  },
  {
    name: 'MAC Mini',
    icon: FaIconMapping.MAC_MINI
  },
  {
    name: 'Virtual Machine',
    icon: FaIconMapping.VIRTUAL_MACHINE
  },
  {
    name: 'Container',
    icon: FaIconMapping.KUBERNETES
  },
  {
    name: 'Storage',
    icon: FaIconMapping.SAN
  },
  {
    name: 'Storage Device',
    icon: FaIconMapping.SAN
  },
  // {
  //   name: 'S3',
  //   icon: FaIconMapping.S3_BUCKET
  // },
  {
    name: 'Cloud Controller',
    icon: FaIconMapping.CLOUD_CONTROLLER
  },
  {
    name: 'Mobile Device',
    icon: FaIconMapping.MOBILE_DEVICE
  },
  {
    name: 'Database',
    icon: FaIconMapping.DATABASE
  },
  {
    name: 'IOT Device',
    icon: FaIconMapping.IOT_DEVICES
  },
  {
    name: 'Other Device',
    icon: FaIconMapping.OTHER_DEVICES
  }
];
