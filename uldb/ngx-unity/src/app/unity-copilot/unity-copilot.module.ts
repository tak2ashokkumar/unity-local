import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnityCopilotRoutingModule } from './unity-copilot-routing.module';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { EchartsxModule } from 'echarts-for-angular';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { UnityCopilotComponent } from './unity-copilot.component';
import { NetworkAiAgentComponent } from './network-ai-agent/network-ai-agent.component';
import { ItsmAiAgentComponent } from './itsm-ai-agent/itsm-ai-agent.component';
import { FinopsAiAgentComponent } from './finops-ai-agent/finops-ai-agent.component';
import { NetworkAiAgentDashboardComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard.component';
import { NetworkAiAgentDashboardEventsComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard-events/network-ai-agent-dashboard-events.component';
import { NetworkAiAgentDashboardAlertsComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard-alerts/network-ai-agent-dashboard-alerts.component';
import { NetworkAiAgentDashboardConditionsComponent } from './network-ai-agent/network-ai-agent-dashboard/network-ai-agent-dashboard-conditions/network-ai-agent-dashboard-conditions.component';


@NgModule({
  declarations: [
    UnityCopilotComponent,
    NetworkAiAgentComponent,
    ItsmAiAgentComponent,
    FinopsAiAgentComponent,
    NetworkAiAgentDashboardComponent,
    NetworkAiAgentDashboardEventsComponent,
    NetworkAiAgentDashboardAlertsComponent,
    NetworkAiAgentDashboardConditionsComponent,
  ],
  imports: [
    // CommonModule,
    AppCoreModule,
    SharedModule,
    PerfectScrollbarModule,
    // ChartsModule,
    EchartsxModule,
    // MarkdownModule,
    CollapseModule,
    UnityCopilotRoutingModule
  ]
})
export class UnityCopilotModule { }
