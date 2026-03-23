import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'unity-cloud-services',
  templateUrl: './unity-cloud-services.component.html',
  styleUrls: ['./unity-cloud-services.component.scss']
})
export class UnityCloudServicesComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabData;
  subscr: Subscription;
  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/services') {
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
    name: 'Mesh Managers',
    url: '/unitycloud/services/mesh'
  },
  // {
  //   name: 'Applications',
  //   url: '/unitycloud/services/applications'
  // }
];