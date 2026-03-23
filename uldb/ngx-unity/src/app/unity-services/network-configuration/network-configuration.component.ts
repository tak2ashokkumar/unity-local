import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'network-configuration',
  templateUrl: './network-configuration.component.html',
  styleUrls: ['./network-configuration.component.scss']
})
export class NetworkConfigurationComponent implements OnInit, OnDestroy {

  tabItems: TabData[] = tabData;
  subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/network-configuration') {
          this.router.navigate([this.tabItems[0].url]);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscr.unsubscribe();
  }

}

const tabData: TabData[] = [
  {
    name: 'NCM Status',
    url: '/services/network-configuration/status'
  },
  {
    name: 'Configure',
    url: '/services/network-configuration/configure'
  },
  {
    name: 'Device Groups',
    url: '/services/network-configuration/device-groups'
  },
  // {
  //   name: 'History',
  //   url: '/services/network-configuration/history'
  // },
  // {
  //   name: 'Compare',
  //   url: '/services/network-configuration/compare'
  // }
];
