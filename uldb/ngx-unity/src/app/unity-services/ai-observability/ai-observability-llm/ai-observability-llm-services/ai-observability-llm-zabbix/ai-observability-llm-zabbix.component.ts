import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatbotTableViewData } from 'src/app/unity-chatbot/uc-table/uc-table.service';
import { TabData } from 'src/app/shared/tabdata';
import { Subject } from 'rxjs';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';


@Component({
  selector: 'ai-observability-llm-zabbix',
  templateUrl: './ai-observability-llm-zabbix.component.html',
  styleUrls: ['./ai-observability-llm-zabbix.component.scss']
})
export class AiObservabilityLlmZabbixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
  }

  ngOnInit(): void {
    this.loadTabs();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
  // {
  //   name: 'Graphs',
  //   url: 'monitoring-graphs',
  // },
  // {
  //   name: 'Create Graph',
  //   url: 'manage-graphs',
  // },
  {
    name: 'Traces',
    url: 'traces'
  },
]
