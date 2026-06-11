import { NgModule } from '@angular/core';

import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppCoreModule } from '../app-core/app-core.module';
import { MY_NATIVE_FORMATS } from '../mtp-activity-logs/mtp-activity-logs.component';
import { SharedModule } from '../shared/shared.module';
import { MtpAimlAlertDetailsComponent } from './mtp-aiml-alert-details/mtp-aiml-alert-details.component';
import { MtpAimlAlertDetailsService } from './mtp-aiml-alert-details/mtp-aiml-alert-details.service';
import { MtpAimlAlertsComponent } from './mtp-aiml-alerts/mtp-aiml-alerts.component';
import { MtpAimlConditionsComponent } from './mtp-aiml-conditions/mtp-aiml-conditions.component';
// import { MtpAimlEventDetailsComponent } from '../shared/mtp-aiml-event-details/mtp-aiml-event-details.component';
// import { MtpAimlEventDetailsService } from '../shared/mtp-aiml-event-details/mtp-aiml-event-details.service';
import { MtpAimlEventsComponent } from './mtp-aiml-events/mtp-aiml-events.component';
import { MtpAimlMgmtRoutingModule } from './mtp-aiml-mgmt-routing.module';
import { MtpAimlMgmtComponent } from './mtp-aiml-mgmt.component';
import { MtpAimlCorrelationRulesComponent } from './mtp-aiml-rules/mtp-aiml-correlation-rules/mtp-aiml-correlation-rules.component';
import { MtpAimlRulesComponent } from './mtp-aiml-rules/mtp-aiml-rules.component';
import { MtpAimlSuppressionRulesComponent } from './mtp-aiml-rules/mtp-aiml-suppression-rules/mtp-aiml-suppression-rules.component';
import { MtpAimlSummaryComponent } from './mtp-aiml-summary/mtp-aiml-summary.component';
import { MtpAimlMgmtService } from './mtp-aiml-mgmt.service';
import { MtpAimlSuppressionRulesCrudComponent } from './mtp-aiml-rules/mtp-aiml-suppression-rules-crud/mtp-aiml-suppression-rules-crud.component';
import { MtpAimlCorrelationRulesCrudComponent } from './mtp-aiml-rules/mtp-aiml-correlation-rules-crud/mtp-aiml-correlation-rules-crud.component';

@NgModule({
  declarations: [
    MtpAimlMgmtComponent,
    MtpAimlSummaryComponent,
    MtpAimlEventsComponent,
    // MtpAimlEventDetailsComponent,
    MtpAimlAlertDetailsComponent,
    MtpAimlAlertsComponent,
    MtpAimlConditionsComponent,
    MtpAimlRulesComponent,
    MtpAimlSuppressionRulesComponent,
    MtpAimlCorrelationRulesComponent,
    MtpAimlSuppressionRulesCrudComponent,
    MtpAimlCorrelationRulesCrudComponent
  ],
  imports: [
    SharedModule,
    AppCoreModule,
    ChartsModule,
    PerfectScrollbarModule,
    MtpAimlMgmtRoutingModule,
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    // MtpAimlEventDetailsService,
    MtpAimlAlertDetailsService,
    MtpAimlMgmtService,
  ]

})
export class MtpAimlMgmtModule { }
