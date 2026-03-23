import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'ai-observability-vector-db',
  templateUrl: './ai-observability-vector-db.component.html',
  styleUrls: ['./ai-observability-vector-db.component.scss'],
})
export class AiObservabilityVectorDbComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = vectorDbTabData;
  subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/ai-observability/vector-db') {
          this.router.navigate([this.tabItems[0].url]);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscr.unsubscribe();
  }
}

const vectorDbTabData: TabData[] = [
  {
    name: 'Summary',
    url: '/services/ai-observability/vector-db/summary',
  },
  {
    name: 'Services',
    url: '/services/ai-observability/vector-db/services',
  }
]