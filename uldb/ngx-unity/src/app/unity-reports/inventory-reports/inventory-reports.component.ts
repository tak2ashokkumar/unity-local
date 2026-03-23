import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'inventory-reports',
  templateUrl: './inventory-reports.component.html',
  styleUrls: ['./inventory-reports.component.scss']
})
export class InventoryReportsComponent implements OnInit {
  tabItems: TabData[] = tabData;
  subscr: Subscription;
  
  constructor(private router: Router) { 
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/reports/inventory') {
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
    name: 'Cloud Inventory',
    url: '/reports/inventory/cloud',
    icon: 'fa-cloud'
  },
  {
    name: 'Datacenter Inventory',
    url: '/reports/inventory/datacenter',
    icon: 'cfa-datacenter'
  }
];
