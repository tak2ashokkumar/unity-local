import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'public-cloud-cost-analysis',
  templateUrl: './public-cloud-cost-analysis.component.html',
  styleUrls: ['./public-cloud-cost-analysis.component.scss']
})
export class PublicCloudCostAnalysisComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabData;
  subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/cost-analysis/public-cloud') {
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

const tabData: TabData[] = [
  {
    name: 'Summary',
    url: '/cost-analysis/public-cloud/summary',
    icon: 'fa fa-clipboard'
  },
  {
    name: 'AWS',
    url: '/cost-analysis/public-cloud/aws',
    icon: 'fab fa-aws'
  },
  {
    name: 'Azure',
    url: '/cost-analysis/public-cloud/azure',
    icon: 'cfa-azure'
  },
  {
    name: 'GCP',
    url: '/cost-analysis/public-cloud/gcp',
    icon: 'cfa-gcp'
  },
  {
    name: 'Oracle',
    url: '/cost-analysis/public-cloud/oci',
    icon: 'cfa-oci'
  }
];
