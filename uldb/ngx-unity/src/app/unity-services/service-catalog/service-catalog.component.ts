import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { PermissionService } from 'src/app/shared/unity-rbac-permissions/unity-rbac-permission.service';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'service-catalog',
  templateUrl: './service-catalog.component.html',
  styleUrls: ['./service-catalog.component.scss']
})
export class ServiceCatalogComponent implements OnInit, OnDestroy {

  tabItems: TabData[] = tabData;
  subscr: Subscription;
  isServiceCatalogOnlyUser: boolean = false;

  constructor(private router: Router,
    private permissionService: PermissionService,
    private userInfoSvc: UserInfoService) {
    this.isServiceCatalogOnlyUser = this.userInfoSvc.isServiceCatalogOnlyUser();
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
    name: 'Catalogs',
    url: '/services/service-catalog/redesign/catalog'
  },
  {
    name: 'Orders',
    url: '/services/service-catalog/redesign/orders',
    task: 'Order Catalog',
    permission: 'Order Catalog'
  },
];
