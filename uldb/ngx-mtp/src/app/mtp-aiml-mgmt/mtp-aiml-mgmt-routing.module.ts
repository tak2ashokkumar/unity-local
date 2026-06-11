import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MtpAimlMgmtComponent } from './mtp-aiml-mgmt.component';
import { MtpAimlSummaryComponent } from './mtp-aiml-summary/mtp-aiml-summary.component';
import { MtpAimlEventsComponent } from './mtp-aiml-events/mtp-aiml-events.component';
import { MtpAimlAlertsComponent } from './mtp-aiml-alerts/mtp-aiml-alerts.component';
import { MtpAimlConditionsComponent } from './mtp-aiml-conditions/mtp-aiml-conditions.component';
import { MtpAimlRulesComponent } from './mtp-aiml-rules/mtp-aiml-rules.component';
import { MtpAimlSuppressionRulesComponent } from './mtp-aiml-rules/mtp-aiml-suppression-rules/mtp-aiml-suppression-rules.component';
import { MtpAimlCorrelationRulesComponent } from './mtp-aiml-rules/mtp-aiml-correlation-rules/mtp-aiml-correlation-rules.component';
import { MtpAimlSuppressionRulesCrudComponent } from './mtp-aiml-rules/mtp-aiml-suppression-rules-crud/mtp-aiml-suppression-rules-crud.component';
import { MtpAimlCorrelationRulesCrudComponent } from './mtp-aiml-rules/mtp-aiml-correlation-rules-crud/mtp-aiml-correlation-rules-crud.component';

const routes: Routes = [
  {
    path: '',
    component: MtpAimlMgmtComponent,
    children: [
      {
        path: 'summary',
        component: MtpAimlSummaryComponent,
        data: {
          breadcrumb: {
            title: 'Summary',
          },
        },
      },
      {
        path: 'events',
        component: MtpAimlEventsComponent,
        data: {
          breadcrumb: {
            title: 'Events',
          },
        },
      },
      {
        path: 'alerts',
        component: MtpAimlAlertsComponent,
        data: {
          breadcrumb: {
            title: 'Alerts',
          },
        },
      },
      {
        path: 'conditions',
        component: MtpAimlConditionsComponent,
        data: {
          breadcrumb: {
            title: 'Conditions',
          },
        },
      },
      {
        path: 'conditions/:id',
        component: MtpAimlConditionsComponent,
        data: {
          breadcrumb: {
            title: 'Conditions',
          },
        },
      },
    ]
  },
  {
    path: 'rules',
    component: MtpAimlRulesComponent,
    children: [
      {
        path: 'suppressionrules',
        component: MtpAimlSuppressionRulesComponent,
        data: {
          breadcrumb: {
            title: 'Suppression Rules',
          },
        },
      },
      {
        path: 'suppressionrules/create',
        component: MtpAimlSuppressionRulesCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'suppressionrules/:ruleId',
        component: MtpAimlSuppressionRulesCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'correlationrules',
        component: MtpAimlCorrelationRulesComponent,
        data: {
          breadcrumb: {
            title: 'Correlation Rules',
          },
        },
      },
      {
        path: 'correlationrules/create',
        component: MtpAimlCorrelationRulesCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'correlationrules/:ruleId',
        component: MtpAimlCorrelationRulesCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MtpAimlMgmtRoutingModule { }
