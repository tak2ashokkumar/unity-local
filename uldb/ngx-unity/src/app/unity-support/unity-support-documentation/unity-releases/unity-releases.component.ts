import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'unity-releases',
  templateUrl: './unity-releases.component.html',
  styleUrls: ['./unity-releases.component.scss']
})
export class UnityReleasesComponent implements OnInit {

  subscr: Subscription;
  tabData: TabData[] = tabData;

  constructor(
    private router: Router) {
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/support/documentation/releases') {
          this.router.navigate(['/support/documentation/releases', this.tabData[0].url]);
        }
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }
  goTo(tab: TabData) {
    this.router.navigate(['/support/documentation/releases', tab.url]);
  }

  isActive(tab: TabData) {
    if (this.router.url.match('/support/documentation/releases' + '/' + tab.url)) {
      return 'active text-success';
    }
  }

}
const tabData: TabData[] = [
  {
    name: 'Current Release',
    url: 'current'
  },
  {
    name: 'Previous Release',
    url: 'archives'
  }
];