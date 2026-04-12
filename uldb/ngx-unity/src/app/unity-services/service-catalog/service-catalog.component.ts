import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { PermissionService } from 'src/app/shared/permissions/permission.service';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'service-catalog',
  templateUrl: './service-catalog.component.html',
  styleUrls: ['./service-catalog.component.scss']
})
export class ServiceCatalogComponent implements OnInit, OnDestroy {

  tabItems: TabData[] = tabData;
  subscr: Subscription;

  constructor(private router: Router,
    private permissionService: PermissionService) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/service-catalog') {
          this.router.navigate([this.tabItems[0].url]);
        }
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

  setTabItems() {
    let tabItems: TabData[] = [];
    let modulePermSet = this.permissionService.getPermissionSet(UnityModules.SERVICE_CATALOGUE);
    tabData.forEach(td => {
      if (td.task) {
        modulePermSet.subTaskViewPermission = td.task;
        if (modulePermSet.subTaskView) {
          tabItems.push(td);
        }
      } else {
        tabItems.push(td);
      }
    })
    this.tabItems = tabItems;
  }

}

const tabData: TabData[] = [
  {
    name: 'Catalog',
    url: '/services/service-catalog/catalog'
  },
  {
    name: 'Orders',
    url: '/services/service-catalog/orders',
    task: 'Order Catalog',
    permission: 'Order Catalog'
  },
];
