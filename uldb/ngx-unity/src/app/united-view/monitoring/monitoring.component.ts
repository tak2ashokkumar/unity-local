import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { tabItems } from './tabs';


@Component({
  selector: 'monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = [];
  currentUrl: string;
  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private user: UserInfoService,) {
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unityview/monitoring') {
          this.tabItems = this.user.isDashboardOnlyUser ? tabItems.slice(0, 2) : tabItems;
          if (this.tabItems.length) {
            this.router.navigate([this.tabItems[0].url], { relativeTo: this.route });
          }
        } else {
          this.tabItems = this.user.isDashboardOnlyUser ? tabItems.slice(0, 2) : tabItems;;
        }

        if (this.user.selfBrandedOrgName) {
          const itemIndex = this.tabItems.findIndex(n => n.name == 'Configuration');
          if (itemIndex >= 0) this.tabItems.splice(itemIndex, 1);
        }
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }
}