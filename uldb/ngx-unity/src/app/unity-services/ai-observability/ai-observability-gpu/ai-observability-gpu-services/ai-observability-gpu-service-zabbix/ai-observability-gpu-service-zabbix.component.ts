import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';

@Component({
  selector: 'ai-observability-gpu-service-zabbix',
  templateUrl: './ai-observability-gpu-service-zabbix.component.html',
  styleUrls: ['./ai-observability-gpu-service-zabbix.component.scss']
})
export class AiObservabilityGpuServiceZabbixComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,) { }

  ngOnInit(): void {
    this.loadTabs();
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('Id'));
    this.tabData.forEach(tab => {
      if (!tab.alwaysEnable && !this.device.configured) {
        tab.enabled = false;
      } else {
        tab.enabled = true;
      }
    });
  }

  goTo(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
  }

  isActive(tab: TabData) {
    if (this.router.url.match(this.currentRouteUrl.concat(tab.url))) {
      return 'text-success';
    }
    return '';
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}

const tabData: TabData[] = [
  {
    name: 'Details',
    url: 'details',
    alwaysEnable: true
  },
  {
    name: 'Graphs',
    url: 'monitoring-graphs',
  },
  {
    name: 'Create Graph',
    url: 'manage-graphs',
  },
  {
    name: 'Metrices',
    url: 'metrics'
  },
]
