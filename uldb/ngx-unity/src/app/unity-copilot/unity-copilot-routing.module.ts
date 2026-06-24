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
import { ComputeAiAgentComponent } from './compute-ai-agent/compute-ai-agent.component';
import { AiAgentEventsAlertsConditionsDashboardComponent } from './ai-agent-events-alerts-conditions-dashboard/ai-agent-events-alerts-conditions-dashboard.component';
import { AiAgentAlertsComponent } from './ai-agent-events-alerts-conditions-dashboard/ai-agent-alerts/ai-agent-alerts.component';
import { AiAgentEventsComponent } from './ai-agent-events-alerts-conditions-dashboard/ai-agent-events/ai-agent-events.component';
import { AiAgentConditionsComponent } from './ai-agent-events-alerts-conditions-dashboard/ai-agent-conditions/ai-agent-conditions.component';

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
            component: AiAgentEventsAlertsConditionsDashboardComponent,
            data: {
              breadcrumb: {
                title: 'Dashboard',
                stepbackCount: 0
              }
            },
            children: [
              {
                path: 'events',
                component: AiAgentEventsComponent,
                data: {
                  breadcrumb: {
                    title: 'Events',
                    stepbackCount: 0
                  },
                  aiAgentType: 'network'
                }
              },
              {
                path: 'alerts',
                component: AiAgentAlertsComponent,
                data: {
                  breadcrumb: {
                    title: 'Alerts',
                    stepbackCount: 0
                  },
                  aiAgentType: 'network'
                }
              },
              {
                path: 'conditions',
                component: AiAgentConditionsComponent,
                data: {
                  breadcrumb: {
                    title: 'Conditions',
                    stepbackCount: 0
                  },
                  aiAgentType: 'network'
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
          },
          aiAgentType: 'network'
        },
      },
      {
        path: 'compute-ai-agent',
        component: ComputeAiAgentComponent,
        data: {
          breadcrumb: {
            title: 'Compute AI Agent',
            stepbackCount: 0
          }
        },
        children: [
          {
            path: 'dashboard',
            component: AiAgentEventsAlertsConditionsDashboardComponent,
            data: {
              breadcrumb: {
                title: 'Dashboard',
                stepbackCount: 0
              }
            },
            children: [
              {
                path: 'events',
                component: AiAgentEventsComponent,
                data: {
                  breadcrumb: {
                    title: 'Events',
                    stepbackCount: 0
                  },
                  aiAgentType: 'compute'
                }
              },
              {
                path: 'alerts',
                component: AiAgentAlertsComponent,
                data: {
                  breadcrumb: {
                    title: 'Alerts',
                    stepbackCount: 0
                  },
                  aiAgentType: 'compute'
                }
              },
              {
                path: 'conditions',
                component: AiAgentConditionsComponent,
                data: {
                  breadcrumb: {
                    title: 'Conditions',
                    stepbackCount: 0
                  },
                  aiAgentType: 'compute'
                }
              },
            ]
          },
        ]
      },
      {
        path: 'compute-ai-agent/conditions/:conditionId/:conditionUuid/investigate',
        component: ConditionInvestigationComponent,
        data: {
          breadcrumb: {
            title: 'Investigate',
            stepbackCount: 0
          },
          aiAgentType: 'compute'
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
