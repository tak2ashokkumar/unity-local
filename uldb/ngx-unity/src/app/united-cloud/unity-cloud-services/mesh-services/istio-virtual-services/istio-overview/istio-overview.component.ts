import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'istio-overview',
  templateUrl: './istio-overview.component.html',
  styleUrls: ['./istio-overview.component.scss']
})
export class IstioOverviewComponent implements OnInit {
  tabData: TabData[] = tabData;
  constructor(private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  goTo(tab: TabData) {
    if (!this.router.url.match(tab.url)) {
      this.router.navigate([tab.url], { relativeTo: this.route });
    }
  }

  isActive(tab: TabData) {
    if (this.router.url.match(tab.url)) {
      return 'active text-success';
    }
  }

}
const tabData: TabData[] = [
  {
    name: 'Services',
    url: 'iservices'
  },
  {
    name: 'Destination Rules',
    url: 'drules'
  }
];