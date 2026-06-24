import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AiAgentConfigMapType, AiAgentConfigType } from './ai-agent-events-alerts-conditions-dashboard.type';

/** This component is used for Network and Compute AI agents. */
@Component({
  selector: 'ai-agent-events-alerts-conditions-dashboard',
  templateUrl: './ai-agent-events-alerts-conditions-dashboard.component.html',
  styleUrls: ['./ai-agent-events-alerts-conditions-dashboard.component.scss']
})
export class AiAgentEventsAlertsConditionsDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;

  currentPath: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url == '/unity-copilot/network-ai-agent/dashboard' || event.url == '/unity-copilot/compute-ai-agent/dashboard') {
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
    this.router.navigate([target], { relativeTo: this.route });
  }

}


export const aiAgentConfigMap: AiAgentConfigMapType = {
  network: {
    title: 'Network AI Agent',
    aiAgentType: 'network',
    routeBase: '/unity-copilot/network-ai-agent',
    deviceTypesForApi: ['switch', 'firewall', 'load_balancer'],
  },
  compute: {
    title: 'Compute AI Agent',
    aiAgentType: 'compute',
    routeBase: '/unity-copilot/compute-ai-agent',
    deviceTypesForApi: ['baremetal', 'hypervisor', 'mac_device', 'vm'],
  },
};