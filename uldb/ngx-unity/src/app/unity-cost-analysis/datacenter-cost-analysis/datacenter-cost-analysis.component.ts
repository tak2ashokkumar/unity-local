import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'datacenter-cost-analysis',
  templateUrl: './datacenter-cost-analysis.component.html',
  styleUrls: ['./datacenter-cost-analysis.component.scss']
})
export class DatacenterCostAnalysisComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabItems;
  subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/cost-analysis/datacenter') {
          this.router.navigate([this.tabItems[0].url]);
        }
      }
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }
}

export const tabItems: TabData[] = [
  {
    name: 'Summary',
    url: '/cost-analysis/datacenter/summary',
  },
  {
    name: 'Bill Details',
    url: '/cost-analysis/datacenter/billdetails',
  },
];
