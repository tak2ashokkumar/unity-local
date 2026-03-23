import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'application-discovery-data',
  templateUrl: './application-discovery-data.component.html',
  styleUrls: ['./application-discovery-data.component.scss']
})
export class ApplicationDiscoveryDataComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  appId: string;
  tabItems: TabData[] = _clone(tabData);
  subscr: Subscription;
  constructor(private router: Router,
    private route: ActivatedRoute,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.appId = params.get('appId');
      this.tabItems.forEach(tab => {
        let tabUrl = `/unitycloud/applications/${this.appId}/`;
        tab.url = tabUrl.concat(tab.url);
      })
    });

    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let isNotAValidRoute = event.url == `/unitycloud/applications/${this.appId}/`
          || event.url == `/unitycloud/applications/${this.appId}/`;
        if (isNotAValidRoute) {
          this.router.navigate(['unitycloud/applications', this.appId, 'services']);
        }
      }
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.subscr.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  isActive(tab: TabData) {
    if (this.router.url.match('unitycloud/applications' + this.appId + tab.url)) {
      return 'active text-success';
    }
  }

  goTo(tab: TabData) {
    this.router.navigate(['unitycloud/applications', this.appId, tab.url]);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}

const tabData: TabData[] = [
  {
    name: 'Services',
    url: 'services',
  },
  {
    name: 'Failures',
    url: 'failures',
  },
  {
    name: 'Problems',
    url: 'problems',
  },
  {
    name: 'Ai Health Analysis',
    url: 'ai-health-analysis',
  },
]
