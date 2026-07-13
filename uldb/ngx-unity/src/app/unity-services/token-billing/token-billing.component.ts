import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'token-billing',
  templateUrl: './token-billing.component.html',
  styleUrls: ['./token-billing.component.scss']
})
export class TokenBillingComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = TOKEN_BILLING_TABS;
  private subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/token-billing') {
          this.router.navigate([this.tabItems[0].url]);
        }
      }
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.subscr.unsubscribe();
  }
}

const TOKEN_BILLING_TABS: TabData[] = [
  { name: 'Dashboard', url: '/services/token-billing/dashboard' },
  { name: 'Tracing',   url: '/services/token-billing/tracing' },
];
