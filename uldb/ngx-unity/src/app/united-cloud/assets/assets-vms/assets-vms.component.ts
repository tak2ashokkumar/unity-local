import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'assets-vms',
  templateUrl: './assets-vms.component.html',
  styleUrls: ['./assets-vms.component.scss']
})
export class AssetsVmsComponent implements OnInit, OnDestroy {
  tabData: TabData[] = [];
  subscr: Subscription;
  constructor(private router: Router,
    private route: ActivatedRoute, ) {
    this.route.data.pipe(take(1)).subscribe((data: { tabItems: TabData[] }) => {
      this.tabData = data.tabItems;
    });
    this.subscr = this.router.events.subscribe(event => {
      // if (event instanceof NavigationEnd) {
      //   if (event.url === '/unitycloud/devices/vms') {
      //     // this.router.navigate([event.url, this.tabData[0].url]);
      //   }
      // }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

  goTo(tab: TabData) {
    this.router.navigate(['/unitycloud/devices/vms', tab.url]);
  }

  isActive(tab: TabData) {
    if (this.router.url.match(tab.url)) {
      return 'active text-success';
    }
  }
}