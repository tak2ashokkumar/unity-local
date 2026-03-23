import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { NavigationEnd, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'unity-support-documentation',
  templateUrl: './unity-support-documentation.component.html',
  styleUrls: ['./unity-support-documentation.component.scss']
})
export class UnitySupportDocumentationComponent implements OnInit, OnDestroy {

  tabItems: TabData[] = tabData;
  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/support/documentation') {
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
    name: 'User Guide',
    url: '/support/documentation/userguide'
  },
  // {
  //   name: 'Releases',
  //   url: '/support/documentation/releases'
  // }
];