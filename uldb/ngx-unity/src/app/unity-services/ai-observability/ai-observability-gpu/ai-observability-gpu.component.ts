import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'ai-observability-gpu',
  templateUrl: './ai-observability-gpu.component.html',
  styleUrls: ['./ai-observability-gpu.component.scss']
})
export class AiObservabilityGpuComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = gpuTabData;
  subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/ai-observability/gpu') {
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

const gpuTabData: TabData[] = [
  {
    name: 'Summary',
    url: '/services/ai-observability/gpu/summary',
  },
  {
    name: 'Services',
    url: '/services/ai-observability/gpu/services',
  }
]