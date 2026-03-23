import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppDashboardService } from './app-dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './app-dashboard.component.html',
  styleUrls: ['./app-dashboard.component.scss'],
  providers: [AppDashboardService]
})
export class AppDashboardComponent implements OnInit, OnDestroy {
  subscr: Subscription;

  constructor(private svc: AppDashboardService,
    private router: Router,
    private route: ActivatedRoute,) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // console.log('event : ', event.url);
        if (event.url === '/app-dashboard') {
          this.router.navigate(['/app-dashboard/default/']);
        }
        else {

        }
      }
    });
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    // this.getDashboardList();
  }

  ngOnDestroy(): void {
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
  }
}

export const WIDGET_DATA_LOAD_ERROR: string = 'Failed to load latest data.';
export const SYNC_IN_PROGRESS_MSG: string = '*Lastest data is being loaded.';

