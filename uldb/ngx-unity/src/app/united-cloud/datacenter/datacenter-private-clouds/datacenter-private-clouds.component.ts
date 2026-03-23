import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppUtilityService, FaIconMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { PcCrudService } from '../../../shared/pc-crud/pc-crud.service';
import { DatacenterPrivateCloudService } from './datacenter-private-cloud.service';
import { PCTabs } from './tabs';
import { cloneDeep as _clone } from 'lodash-es';
import { PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';

@Component({
  selector: 'datacenter-private-clouds',
  templateUrl: './datacenter-private-clouds.component.html',
  styleUrls: ['./datacenter-private-clouds.component.scss']
})
export class DatacenterPrivateCloudsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  tabItems: PCTabs[] = [];
  dcId: string;
  pcId: string;
  subscr: Subscription;
  tabData: TabData[] = [];
  counter: number = 0;
  isRouterEventsElseCaseExecuted: boolean = false;

  constructor(private pcService: DatacenterPrivateCloudService,
    private router: Router,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private crudServie: PcCrudService,
    private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.dcId = params.get('dcId');
    });
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.counter++;
        if (event.url === '/unitycloud/datacenter/' + this.dcId + '/pccloud' || event.url === '/unitycloud/datacenter/' + this.dcId + '/pccloud/' + this.pcId) {
          this.route.data.subscribe((data: { tabItems: PCTabs[] }) => {
            this.tabItems = data.tabItems;
            if (this.tabItems.length) {
              if (this.pcId === null) {
                this.router.navigate([this.tabItems[0].url, 'summary']);
              } else {
                this.router.navigate(['/unitycloud/datacenter', this.dcId, 'pccloud', this.pcId, 'summary']);
              }
            }
          });
        } else {
          this.isRouterEventsElseCaseExecuted = true;
          this.route.data.pipe(take(1)).subscribe((data: { tabItems: PCTabs[] }) => {
            this.tabItems = data.tabItems;
            if (event.url == `/unitycloud/datacenter/${this.dcId}/pccloud/${this.pcId}/summary`) {
              this.tabData = [];
            }
            let subTabData = _clone(this.tabData);
            this.tabData = [];
            if (subTabData.length) {
              this.spinner.start('main');
              this.getPrivateCloudById();
            } else {
              let cloud = this.tabItems.find(ti => ti.uuid == this.pcId);
              if (cloud && (cloud.display_platform == PlatFormMapping.VMWARE || cloud.display_platform == PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER)) {
                this.spinner.start('main');
                this.getPrivateCloudById();
                this.updateHypervisorMappingsToVMS();
              } else {
                this.spinner.start('main');
                this.getPrivateCloudById();
              }
            }
          });
        }
      }
    });
  }

  ngOnInit() {

    /*
    * this block will be loaded when there is direct url with end file path
    */
    if (this.counter <= 1 && !this.isRouterEventsElseCaseExecuted) {
      this.route.data.pipe(take(1)).subscribe((data: { tabItems: PCTabs[] }) => {
        this.tabItems = data.tabItems;
        let subTabData = _clone(this.tabData);
        this.tabData = [];
        if (subTabData.length) {
          this.spinner.start('main');
          this.getPrivateCloudById();
        } else {
          let cloud = this.tabItems.find(ti => ti.uuid == this.pcId);
          if (cloud && (cloud.display_platform == PlatFormMapping.VMWARE || cloud.display_platform == PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER)) {
            this.spinner.start('main');
            this.getPrivateCloudById();
            this.updateHypervisorMappingsToVMS();
          } else {
            this.spinner.start('main');
            this.getPrivateCloudById();
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.tabData = [];
    this.subscr.unsubscribe();
  }

  showDeviceTab(tab: TabData, res: PrivateCloudType): boolean {
    switch (tab.url) {
      case 'alldevices': return res['nutanix'] ? false : true;
      case 'switches': return res['switch'] ? res['switch'].length ? true : false : false;
      case 'firewalls': return res['firewall'] ? res['firewall'].length ? true : false : false;
      case 'loadbalancers': return res['load_balancer'] ? res['load_balancer'].length ? true : false : false;
      case 'hypervisors': return res['hypervisors'] ? res['hypervisors'].length ? true : false : false;
      case 'bmservers': return res['bm_server'] ? res['bm_server'].length ? true : false : false;
      case 'macdevices': return res['mac_device'] ? res['mac_device'].length ? true : false : false;
      case 'containercontrollers': return this.isVcenterCloud(res) || res['nutanix'] ? false : true;
      case 'storagedevices': return res['storage_device'] ? res['storage_device'].length ? true : false : false;
      case 's3account': return this.isVcenterCloud(res) || res['nutanix'] ? false : true;
      case 'databases': return this.isVcenterCloud(res) || res['nutanix'] ? false : true;
      case 'otherdevices': return res['customdevice'] ? res['customdevice'].length ? true : false : false;
      case 'clusters': return res['nutanix'] ? res.nutanix.cluster?.total ? true : false : false;
      case 'vcclusters': return res['clusters'] ? res['clusters'].length ? true : false : false;
      case 'hosts': return res['nutanix'] ? res.nutanix.host?.total ? true : false : false;
      case 'disks': return res['nutanix'] ? res.nutanix.disk?.total ? true : false : false;
      case 'storagecontainers': return res['nutanix'] ? res.nutanix.storage_container?.total ? true : false : false;
      case 'storagepools': return res['nutanix'] ? res.nutanix.storage_pool?.total ? true : false : false;
      case 'virtualdisks': return res['nutanix'] ? res.nutanix.virtual_disks?.total ? true : false : false;
      case 'datastores': return res['datastores'] ? res['datastores'].length ? true : false : false;
      case 'networks': return this.isVcenterCloud(res) ? true : false;
      default: return true;
    }
  }

  isVcenterCloud(res: PrivateCloudType) {
    const cloudPlatform = this.utilService.getCloudTypeByPlatformType(res.platform_type);
    if (this.pcId == res.uuid && (cloudPlatform == PlatFormMapping.VMWARE || cloudPlatform == PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER)) {
      return true;
    }
  }

  manageTabs() {
    let isVcenterCloud = false;
    for (let i = 0; i < this.tabItems.length; i++) {
      const tab = this.tabItems[i];
      const cloudPlatform = this.utilService.getCloudTypeByPlatformType(tab.platform_type);
      if (this.pcId == tab.uuid && (cloudPlatform == PlatFormMapping.VMWARE || cloudPlatform == PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER)) {
        isVcenterCloud = true;
        break;
      }
    }
    let containerTabIndex = this.tabData.findIndex(td => td.url == 'containercontrollers');
    containerTabIndex = containerTabIndex !== -1 ? containerTabIndex : (this.tabData.length > 1 ? this.tabData.length - 1 : this.tabData.length);
    if (isVcenterCloud) {
      let tb = {
        name: 'Virtual Machines',
        url: 'vcenter',
        icon: FaIconMapping.VIRTUAL_MACHINE
      }
      if (!this.tabExists(tb)) {
        this.tabData.splice(this.tabData.length, 0, tb);
      }
    } else {
      let tb = {
        name: 'Virtual Machines',
        url: 'vms',
        icon: FaIconMapping.VIRTUAL_MACHINE
      }
      if (!this.tabExists(tb)) {
        this.tabData.splice(containerTabIndex, 0, tb);
      }
    }
  }

  tabExists(tb: TabData) {
    if (this.tabData.length) {
      let data: TabData = this.tabData.find(td => td.url == tb.url);
      return data ? true : false;
    } else {
      return false;
    }
  }

  updateHypervisorMappingsToVMS() {
    if (this.pcId) {
      this.pcService.polltoUpdateHypervisorMappingsToVMS(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getPrivateCloudById();
      }, err => {
        this.getPrivateCloudById();
      })
    }
  }

  getPrivateCloudById() {
    if (this.pcId) {
      this.pcService.getPrivateCloudById(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        _clone(tabData).map(tb => {
          let showTab = this.showDeviceTab(tb, res)
          if (showTab) {
            let tabAlreadyExists = this.tabExists(tb);
            if (!tabAlreadyExists) {
              this.tabData.push(tb);
            }
          }
        });
        this.manageTabs();
        this.spinner.stop('main');
      }, err => {
        this.tabData.push(_clone(tabData[0]));
        this.manageTabs();
        this.spinner.stop('main');
      })
    } else {
      this.tabData = _clone(tabData);
      this.manageTabs();
      this.spinner.stop('main');
    }
  }

  goToPCTab(tab: TabData) {
    this.router.navigate([tab.url, 'summary']);
  }

  isPCTabActive(tab: TabData) {
    if (this.router.url.match(tab.url)) {
      return 'text-success';
    }
  }

  addPrivateCloud() {
    // this.crudServie.addOrEdit(null, this.dcId);
    this.router.navigate(['summary',this.dcId,'add'], { relativeTo: this.route });
  }

  goTo(tab: TabData) {
    this.router.navigate(['/unitycloud/datacenter', this.dcId, 'pccloud', this.pcId, tab.url]);
  }

  isActive(tab: TabData) {
    if (this.router.url.match('/unitycloud/datacenter/' + this.dcId + '/pccloud/' + this.pcId + '/' + tab.url)) {
      return 'active text-success';
    }
  }

  onCrud(uuid: string) {
    if (uuid) {
      this.router.navigate(['/unitycloud/datacenter/' + this.dcId + '/pccloud/', uuid]);
    } else {
      this.router.navigate(['/unitycloud/datacenter/' + this.dcId + '/pccloud/']);
    }
  }
}

const tabData: TabData[] = [
  {
    name: 'Summary',
    url: 'summary',
    icon: 'fa-clipboard'
  },
  {
    name: 'All Devices',
    url: 'alldevices',
    icon: FaIconMapping.ALL_DEVICES
  },
  {
    name: 'Clusters',
    url: 'vcclusters',
    icon: FaIconMapping.CLUSTER,
  },
  {
    name: 'Switches',
    url: 'switches',
    icon: FaIconMapping.SWITCH
  },
  {
    name: 'Firewalls',
    url: 'firewalls',
    icon: FaIconMapping.FIREWALL
  },
  {
    name: 'Load Balancers',
    url: 'loadbalancers',
    icon: FaIconMapping.LOAD_BALANCER
  },
  {
    name: 'Hypervisors',
    url: 'hypervisors',
    icon: FaIconMapping.HYPERVISOR
  },
  {
    name: 'Bare Metal Servers',
    url: 'bmservers',
    icon: FaIconMapping.BARE_METAL_SERVER
  },
  {
    name: 'MAC Mini',
    url: 'macdevices',
    icon: FaIconMapping.MAC_MINI
  },
  {
    name: 'Containers',
    url: 'containercontrollers',
    icon: FaIconMapping.KUBERNETES
  },
  {
    name: 'Storage',
    url: 'storagedevices',
    icon: FaIconMapping.SAN
  },
  {
    name: 'S3',
    url: 's3account',
    icon: FaIconMapping.S3_BUCKET
  },
  {
    name: 'Databases',
    url: 'databases',
    icon: FaIconMapping.DATABASE
  },
  {
    name: 'Other Devices',
    url: 'otherdevices',
    icon: FaIconMapping.OTHER_DEVICES
  },
  {
    name: 'Clusters',
    url: 'clusters',
    icon: FaIconMapping.CLUSTER
  },
  {
    name: 'Hosts',
    url: 'hosts',
    icon: FaIconMapping.HOST
  },
  {
    name: 'Disks',
    url: 'disks',
    icon: FaIconMapping.DISK
  },
  {
    name: 'Storage Containers',
    url: 'storagecontainers',
    icon: FaIconMapping.STORAGE_CONTAINERS
  },
  {
    name: 'Storage Pools',
    url: 'storagepools',
    icon: FaIconMapping.STORAGE_POOLS
  },
  {
    name: 'Virtual Disks',
    url: 'virtualdisks',
    icon: FaIconMapping.DISK
  },
  {
    name: 'Datastores',
    url: 'datastores',
    icon: FaIconMapping.DATASTORE
  },
  {
    name: 'Networks',
    url: 'networks',
    icon: FaIconMapping.NETWORKS
  },
];