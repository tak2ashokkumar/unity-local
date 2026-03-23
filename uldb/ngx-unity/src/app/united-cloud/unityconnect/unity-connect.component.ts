import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'unity-connect',
  templateUrl: './unity-connect.component.html',
  styleUrls: ['./unity-connect.component.scss']
})
export class UnityConnectComponent implements OnInit {
  tabItems: TabData[];
  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute, ) {
    this.route.data.subscribe((data: { tabItems: any }) => {
      this.tabItems = data.tabItems;
    });
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/connect') {
          this.router.navigate([this.tabItems[0].url]);
        } else if (event.url.includes('/unitycloud/connect')) {
          let tabData: TabData = this.tabItems.find(tab => tab.url == event.url);
          if (tabData) {
            this.router.navigate([tabData.url]);
          } else {
            let child: TabData = this.tabItems.find(tab => event.url.includes(tab.url));
            if (child) {
              this.router.navigate([event.url]);
            } else {
              this.router.navigate([this.tabItems[0].url]);
            }
          }
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