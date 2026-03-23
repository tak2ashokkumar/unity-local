import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnitySetupMonitoringRoutingModule } from './unity-setup-monitoring-routing.module';
import { UnitySetupMonitoringComponent } from './unity-setup-monitoring.component';
import { UsmAnomalyDetectionComponent } from './usm-anomaly-detection/usm-anomaly-detection.component';
import { UsmAnomalyDetectionCrudComponent } from './usm-anomaly-detection/usm-anomaly-detection-crud/usm-anomaly-detection-crud.component';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AutoRemediationComponent } from './auto-remediation/auto-remediation.component';
import { AutoRemediationCrudComponent } from './auto-remediation/auto-remediation-crud/auto-remediation-crud.component';
import { AutoRemediationHistoryComponent } from './auto-remediation/auto-remediation-history/auto-remediation-history.component';
import { ForecastComponent } from './forecast/forecast.component';
import { ForecastCrudComponent } from './forecast/forecast-crud/forecast-crud.component';
import { ForecastGraphsComponent } from './forecast/forecast-graphs/forecast-graphs.component';
import { ForecastHistoryComponent } from './forecast/forecast-history/forecast-history.component';


@NgModule({
  declarations: [
    UnitySetupMonitoringComponent,
    UsmAnomalyDetectionComponent,
    UsmAnomalyDetectionCrudComponent,
    AutoRemediationComponent,
    AutoRemediationCrudComponent,
    AutoRemediationHistoryComponent,
    ForecastComponent,
    ForecastCrudComponent,
    ForecastGraphsComponent,
    ForecastHistoryComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    CommonModule,
    UnitySetupMonitoringRoutingModule
  ]
})
export class UnitySetupMonitoringModule { }
