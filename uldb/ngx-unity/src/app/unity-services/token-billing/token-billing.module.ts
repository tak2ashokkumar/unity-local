import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { EchartsxModule } from 'echarts-for-angular';
import { NgSelectModule } from '@ng-select/ng-select';

import { TokenBillingComponent } from './token-billing.component';
import { TokenBillingDashboardComponent } from './token-billing-dashboard/token-billing-dashboard.component';
import { TokenBillingDashboardService } from './token-billing-dashboard/token-billing-dashboard.service';
import { TokenBillingTracingComponent } from './token-billing-tracing/token-billing-tracing.component';
import { TokenBillingTracingService } from './token-billing-tracing/token-billing-tracing.service';

@NgModule({
  declarations: [
    TokenBillingComponent,
    TokenBillingDashboardComponent,
    TokenBillingTracingComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    EchartsxModule,
    NgSelectModule,
    RouterModule,
  ],
  providers: [
    TokenBillingDashboardService,
    TokenBillingTracingService,
  ],
})
export class TokenBillingModule { }
