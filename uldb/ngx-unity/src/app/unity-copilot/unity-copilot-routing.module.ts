import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnityCopilotComponent } from './unity-copilot.component';
import { ItsmAiAgentComponent } from './itsm-ai-agent/itsm-ai-agent.component';
import { FinopsAiAgentComponent } from './finops-ai-agent/finops-ai-agent.component';
import { ConditionInvestigationComponent } from '../shared/condition-investigation/condition-investigation.component';
import { NetworkAiAgentDashboardConditionsComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard-conditions/network-ai-agent-dashboard-conditions.component';
import { NetworkAiAgentDashboardAlertsComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard-alerts/network-ai-agent-dashboard-alerts.component';
import { NetworkAiAgentDashboardEventsComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard-events/network-ai-agent-dashboard-events.component';
import { NetworkAiAgentDashboardComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard.component';
import { NetworkAiAgentComponent } from './network-ai-agent/network-ai-agent.component';

const routes: Routes = [
  {
    path: '',
    component: UnityCopilotComponent,
    data: {
      breadcrumb: {
        title: '',
      },
    },
    children: [
      {
        path: 'network-ai-agent',
        component: NetworkAiAgentComponent,
        data: {
          breadcrumb: {
            title: 'Network AI Agent',
            stepbackCount: 0
          }
        },
        children: [
          {
            path: 'dashboard',
            component: NetworkAiAgentDashboardComponent,
            data: {
              breadcrumb: {
                title: 'Dashboard',
                stepbackCount: 0
              }
            },
            children: [
              {
                path: 'events',
                component: NetworkAiAgentDashboardEventsComponent,
                data: {
                  breadcrumb: {
                    title: 'Events',
                    stepbackCount: 0
                  }
                }
              },
              {
                path: 'alerts',
                component: NetworkAiAgentDashboardAlertsComponent,
                data: {
                  breadcrumb: {
                    title: 'Alerts',
                    stepbackCount: 0
                  }
                }
              },
              {
                path: 'conditions',
                component: NetworkAiAgentDashboardConditionsComponent,
                data: {
                  breadcrumb: {
                    title: 'Conditions',
                    stepbackCount: 0
                  }
                }
              },
            ]
          },
        ]
      },
      {
        path: 'network-ai-agent/conditions/:conditionId/:conditionUuid/investigate',
        component: ConditionInvestigationComponent,
        data: {
          breadcrumb: {
            title: 'Investigate',
            stepbackCount: 0
          }
        },
      },
      {
        path: 'finops-ai-agent',
        component: FinopsAiAgentComponent,
        data: {
          breadcrumb: {
            title: 'Finops AI Agent',
            stepbackCount: 0
          }
        },
      },
      {
        path: 'itsm-ai-agent',
        component: ItsmAiAgentComponent,
        data: {
          breadcrumb: {
            title: 'ITSM AI Agent',
            stepbackCount: 0
          }
        },
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityCopilotRoutingModule { }
