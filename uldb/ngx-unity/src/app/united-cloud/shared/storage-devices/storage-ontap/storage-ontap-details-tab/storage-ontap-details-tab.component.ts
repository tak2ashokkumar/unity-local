import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'storage-ontap-details-tab',
  templateUrl: './storage-ontap-details-tab.component.html',
  styleUrls: ['./storage-ontap-details-tab.component.scss']
})
export class StorageOntapDetailsTabComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  entity: { name: string, type: string, state: string };
  currentRouteUrl: string = '';
  tabData: TabData[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageSvc: StorageService) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
      if (this.router.url.includes('nodes')) {
        this.tabData = [...tabData].concat([...nodePorts]);
      } else {
        this.tabData = [...tabData];
      }
    });
  }

  ngOnInit(): void {
    let entity = <{ name: string, type: string, state: string }>this.storageSvc.getByKey('ontap-entity', StorageType.SESSIONSTORAGE);
    this.entity = entity;
  }

  ngOnDestroy(): void {

  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
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
}

const tabData: TabData[] = [
  {
    name: 'Overview',
    url: 'overview'
  },
  {
    name: 'Events',
    url: 'events'
  },
  {
    name: 'Triggers',
    url: 'triggers'
  },
  {
    name: 'Statistics',
    url: 'statistics'
  }
]

const nodePorts: TabData[] = [
  {
    name: 'Ethernet Ports',
    url: 'ethernet-ports'
  },
  {
    name: 'FC Ports',
    url: 'fc-ports'
  },
]
