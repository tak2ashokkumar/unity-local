import { NgModule } from '@angular/core';

import { ChartsModule } from 'ng2-charts';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { MtpDashboardActivityComponent } from './mtp-dashboard-activity/mtp-dashboard-activity.component';
import { MtpDashboardAlertsComponent } from './mtp-dashboard-alerts/mtp-dashboard-alerts.component';
import { MtpDashboardAssetsComponent } from './mtp-dashboard-assets/mtp-dashboard-assets.component';
import { MtpDashboardMapComponent } from './mtp-dashboard-map/mtp-dashboard-map.component';
import { MtpDashboardRecentAlertsComponent } from './mtp-dashboard-recent-alerts/mtp-dashboard-recent-alerts.component';
import { MtpDashboardRoutingModule } from './mtp-dashboard-routing.module';
import { MtpDashboardSubscriptionsComponent } from './mtp-dashboard-subscriptions/mtp-dashboard-subscriptions.component';
import { MtpDashboardTicketsComponent } from './mtp-dashboard-tickets/mtp-dashboard-tickets.component';
import { MtpDashboardComponent } from './mtp-dashboard.component';


@NgModule({
  declarations: [
    MtpDashboardComponent,
    MtpDashboardMapComponent,
    MtpDashboardAssetsComponent,
    MtpDashboardAlertsComponent,
    MtpDashboardSubscriptionsComponent,
    MtpDashboardRecentAlertsComponent,
    MtpDashboardActivityComponent,
    MtpDashboardTicketsComponent
  ],
  imports: [
    SharedModule,
    AppCoreModule,
    ChartsModule,
    MtpDashboardRoutingModule
  ]
})
export class MtpDashboardModule { }
