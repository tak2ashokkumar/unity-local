import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'mtp-aiml-rules',
  templateUrl: './mtp-aiml-rules.component.html',
  styleUrls: ['./mtp-aiml-rules.component.scss']
})
export class MtpAimlRulesComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = tabItems;
  currentUrl: string;
  subscr: Subscription;
  constructor(private router: Router,
    private route: ActivatedRoute,) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/aiml/rules') {
          this.router.navigate([this.tabItems[0].url], { relativeTo: this.route });
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscr.unsubscribe();
  }

  goBack() {
    this.router.navigate(['aiml', 'summary']);
  }

}

export const tabItems: TabData[] = [
  {
    name: 'Suppression Rules',
    url: '/aiml/rules/suppressionrules',
  },
  {
    name: 'Correlation Rules',
    url: '/aiml/rules/correlationrules',
  },
];
