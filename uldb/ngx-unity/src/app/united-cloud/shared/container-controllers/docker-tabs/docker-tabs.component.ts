import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, UrlSegment, NavigationEnd } from '@angular/router';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';

@Component({
  selector: 'docker-tabs',
  templateUrl: './docker-tabs.component.html',
  styleUrls: ['./docker-tabs.component.scss']
})
export class DockerTabsComponent implements OnInit {
  controllerId: string;
  tabData: TabData[] = tabData;
  subscr: Subscription;
  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/devices/docker') {
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
      this.router.navigate(['/unitycloud/devices/docker', tab.url]);
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}

const tabData: TabData[] = [
  {
    name: 'Nodes',
    url: 'dockernodes',
  },
  {
    name: 'Containers',
    url: 'dockercontainers',
  },
];

