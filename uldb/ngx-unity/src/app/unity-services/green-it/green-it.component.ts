import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'green-it',
  templateUrl: './green-it.component.html',
  styleUrls: ['./green-it.component.scss']
})
export class GreenITComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabData;
  subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/greeenIT') {
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
}

const tabData: TabData[] = [
  {
    name: 'Dashboard',
    url: '/services/greeenIT/dashboard'
  },
  {
    name: 'Emission Details',
    url: '/services/greeenIT/emission-details'
  },
  {
    name: 'Usage',
    url: '/services/greeenIT/usage'
  }
];
