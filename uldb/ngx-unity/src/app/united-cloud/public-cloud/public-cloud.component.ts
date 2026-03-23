import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'public-cloud',
  templateUrl: './public-cloud.component.html',
  styleUrls: ['./public-cloud.component.scss']
})
export class PublicCloudComponent implements OnInit {

  subscr: Subscription;
  tabItems: TabData[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute) {
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/publiccloud') {
          this.route.data.subscribe((data: { tabItems: TabData[] }) => {
            this.tabItems = data.tabItems;
            if (this.tabItems.length) {
              this.router.navigate([this.tabItems[0].url], { relativeTo: this.route });
            }
          });
        } else {
          this.route.data.subscribe((data: { tabItems: TabData[] }) => {
            this.tabItems = data.tabItems;
            if (this.tabItems.length && event.url === this.getCloudType(event.url)) {
              this.router.navigate([event.url], { relativeTo: this.route });
            }
          });
        }
      }
    });
  }

  getCloudType(url: string): string {
    let items = this.tabItems.filter((item: TabData) => item.url === url);
    return items.length ? items[0].url : '';
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

}
