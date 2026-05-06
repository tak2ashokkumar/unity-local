import { Routes } from "@angular/router";
import { AiAgentsComponent } from "./ai-agents.component";
import { AiAgentsNetworkAgentComponent } from "./ai-agents-network-agent/ai-agents-network-agent.component";
import { AiAgentsFinopsAgentComponent } from "./ai-agents-finops-agent/ai-agents-finops-agent.component";
import { AiAgentsItsmAgentComponent } from "./ai-agents-itsm-agent/ai-agents-itsm-agent.component";
import { AiAgentsNetworkAgentDashboardComponent } from "./ai-agents-network-agent/ai-agents-network-agent-dashboard/ai-agents-network-agent-dashboard.component";
import { AiAgentsNetworkAgentNetworkAgentHubComponent } from "./ai-agents-network-agent/ai-agents-network-agent-network-agent-hub/ai-agents-network-agent-network-agent-hub.component";
import { NetworkAgentConditionsComponent } from "./ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-conditions.component";
import { NetworkAgentEventsComponent } from "./ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-events/network-agent-events.component";
import { NetworkAgentAlertsComponent } from "./ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-alerts/network-agent-alerts.component";
import { NetworkAgentConditionInvestigationComponent } from "./ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/network-agent-condition-investigation.component";
import { AiAgentsGuard } from "./ai-agents.guard";

export const AI_AGENTS_ROUTES: Routes = [
    {
        path: 'ops-co-pilot',
        component: AiAgentsComponent,
        canActivate: [AiAgentsGuard],
        canActivateChild: [AiAgentsGuard],
        data: {
            breadcrumb: {
                title: 'Ops Co-Pilot',
                stepbackCount: 0
            },
        },
        children: [
            {
                path: 'network-ai-agent',
                component: AiAgentsNetworkAgentComponent,
                data: {
                    breadcrumb: {
                        title: 'Network AI Agent',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'dashboard',
                        component: AiAgentsNetworkAgentDashboardComponent,
                        data: {
                            breadcrumb: {
                                title: 'Dashboard',
                                stepbackCount: 0
                            }
                        },
                        children: [
                            {
                                path: 'events',
                                component: NetworkAgentEventsComponent,
                                data: {
                                    breadcrumb: {
                                        title: 'Events',
                                        stepbackCount: 0
                                    }
                                }
                            },
                            {
                                path: 'alerts',
                                component: NetworkAgentAlertsComponent,
                                data: {
                                    breadcrumb: {
                                        title: 'Alerts',
                                        stepbackCount: 0
                                    }
                                }
                            },
                            {
                                path: 'conditions',
                                component: NetworkAgentConditionsComponent,
                                data: {
                                    breadcrumb: {
                                        title: 'Conditions',
                                        stepbackCount: 0
                                    }
                                }
                            },
                        ]
                    },
                    {
                        path: 'network-agent-hub',
                        component: AiAgentsNetworkAgentNetworkAgentHubComponent,
                        data: {
                            breadcrumb: {
                                title: 'Network Agent Hub',
                                stepbackCount: 0
                            }
                        }
                    },
                ]
            },
            {
                path: 'network-ai-agent/conditions/:conditionId/:conditionUuid/investigate',
                component: NetworkAgentConditionInvestigationComponent,
                data: {
                    breadcrumb: {
                        title: 'Investigate',
                        stepbackCount: 0
                    }
                },
            },
            {
                path: 'finops-ai-agent',
                component: AiAgentsFinopsAgentComponent,
                data: {
                    breadcrumb: {
                        title: 'Finops AI Agent',
                        stepbackCount: 0
                    }
                },
            },
            {
                path: 'itsm-ai-agent',
                component: AiAgentsItsmAgentComponent,
                data: {
                    breadcrumb: {
                        title: 'ITSM AI Agent',
                        stepbackCount: 0
                    }
                },
            }
        ]
    },
]