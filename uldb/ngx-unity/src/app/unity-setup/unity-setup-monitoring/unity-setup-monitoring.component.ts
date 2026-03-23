import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'unity-setup-monitoring',
  templateUrl: './unity-setup-monitoring.component.html',
  styleUrls: ['./unity-setup-monitoring.component.scss']
})
export class UnitySetupMonitoringComponent implements OnInit, OnDestroy {
  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute) {
    /**
   * This is to load private cloud when clicked on left panel
   * as there is no reload:true option in angular
   */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/setup/monitoring') {
          this.router.navigate(['anomaly-detection'], { relativeTo: this.route });
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
