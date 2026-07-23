import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, UrlSegment, NavigationEnd } from '@angular/router';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kubernetes-tabs',
  templateUrl: './kubernetes-tabs.component.html',
  styleUrls: ['./kubernetes-tabs.component.scss']
})
export class KubernetesTabsComponent implements OnInit {
  controllerId: string;
  tabData: TabData[] = tabData;
  subscr: Subscription;
  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/devices/kubernetes') {
          this.router.navigate([event.url, this.tabData[0].url]);
        }
      }
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
    });
  }

  ngOnInit() { }

  isActive(tab: TabData) {
    if (this.controllerId) {
      return this.router.url.match(tab.url) ? 'text-success' : '';
    } else {
      return this.router.url.match(tab.url) ? 'active text-success' : '';
    }
  }

  goTo(tab: TabData) {
    if (this.controllerId) {
      this.router.navigate([tab.url], { relativeTo: this.route });
    } else {
      this.router.navigate(['/unitycloud/devices/kubernetes', tab.url]);
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}

const tabData: TabData[] = [
  {
    name: 'Nodes',
    url: 'nodes',
  },
  {
    name: 'Pods',
    url: 'pods',
  }
];

