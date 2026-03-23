import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnityChatbotComponent } from './unity-chatbot.component';
import { UcTableComponent } from './uc-table/uc-table.component';
import { UcChartsComponent } from './uc-charts/uc-charts.component';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { UnitySetupRoutingModule } from '../unity-setup/unity-setup-routing.module';
import { ChartsModule } from 'ng2-charts';
import { EchartsxModule } from 'echarts-for-angular';
import { SequentialWorkflowDesignerModule } from 'sequential-workflow-designer-angular';
import { UnitedCloudSharedModule } from '../united-cloud/shared/united-cloud-shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { UcAgenticComponent } from './uc-agentic/uc-agentic.component';
import { UcAssistantComponent } from './uc-assistant/uc-assistant.component';
import { UcAgentsComponent } from './uc-agents/uc-agents.component';
import { UcHistoryComponent } from './uc-history/uc-history.component';
import { UchChatComponent } from './uc-history/uch-chat/uch-chat.component';


@NgModule({
    declarations: [
        UnityChatbotComponent,
        UcTableComponent,
        UcChartsComponent,
        UcAgenticComponent,
        UcAssistantComponent,
        UcAgentsComponent,
        UcHistoryComponent,
        UchChatComponent,
    ],
    imports: [
        CommonModule,
        AppCoreModule,
        SharedModule,
        ChartsModule,
        EchartsxModule,
        UnitedCloudSharedModule,
        MarkdownModule
    ],
    exports: [
        UnityChatbotComponent,
        UcTableComponent,
        UcChartsComponent
    ]
})
export class UnityChatbotModule { }