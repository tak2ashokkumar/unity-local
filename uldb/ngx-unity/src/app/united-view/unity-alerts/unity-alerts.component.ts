import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertsTabData } from './tabs';

@Component({
  selector: 'unity-alerts',
  templateUrl: './unity-alerts.component.html',
  styleUrls: ['./unity-alerts.component.scss']
})
export class UnityAlertsComponent implements OnInit, OnDestroy {
  public tabItems: AlertsTabData[];
  subscr: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,) {
    this.route.data.subscribe((data: { tabItems: any }) => {
      this.tabItems = data.tabItems;
    });
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unityview/alerts') {
          this.router.navigate([this.tabItems[0].url]);
        } else if (event.url.includes('/unityview/alerts')) {
          let alertTab: AlertsTabData = this.tabItems.find(tab => tab.url == event.url);
          if (alertTab) {
            this.router.navigate([alertTab.url]);
          } else {
            this.router.navigate([this.tabItems[0].url]);
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