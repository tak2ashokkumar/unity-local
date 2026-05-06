import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';

@Component({
  selector: 'network-ai-agent-dashboard',
  templateUrl: './network-ai-agent-dashboard.component.html',
  styleUrls: ['./network-ai-agent-dashboard.component.scss']
})
export class NetworkAiAgentDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;

  currentPath: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unity-copilot/network-ai-agent/dashboard') {
          this.router.navigate(['conditions'], { relativeTo: this.route });
        }
        this.currentPath = event.url.split('/').pop();
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.subscr?.unsubscribe();
  }

  refreshData(pageNo: number) {
  }

  goTo(target: string) {
    switch (target) {
      case 'rules': this.router.navigate(['aiml/rules', 'firstresponsepolicies'], { relativeTo: this.route.parent }); break;
      case 'summary': this.router.navigate(['aiml', 'summary'], { relativeTo: this.route.parent }); break;
      case 'analytics': this.router.navigate(['aiml', 'analytics'], { relativeTo: this.route.parent }); break;
      default: this.router.navigate([target], { relativeTo: this.route }); break;
    }
  }

}
