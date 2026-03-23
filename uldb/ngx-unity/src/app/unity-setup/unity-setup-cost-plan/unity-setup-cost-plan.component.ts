import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'unity-setup-cost-plan',
  templateUrl: './unity-setup-cost-plan.component.html',
  styleUrls: ['./unity-setup-cost-plan.component.scss']
})
export class UnitySetupCostPlanComponent implements OnInit, OnDestroy {
  
  subscr: Subscription;
  tabItems: TabData[] = tabData;
  private ngUnsubscribe = new Subject();

  constructor( private router: Router,
    private route: ActivatedRoute,) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/setup/cost-plan') {
          this.router.navigate([this.tabItems[1].url], { relativeTo: this.route });
        }
      }
    });
  }

  ngOnInit(): void {
  }
  
  ngOnDestroy() {
    this.subscr.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}

const tabData: TabData[] = [
  {
    name: 'Cost Model',
    url: '/setup/cost-plan/cost-model',
  },
  {
    name: 'Resource Model',
    url: '/setup/cost-plan/resource-model',
  },
];