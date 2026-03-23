import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsmAnomalyDetectionComponent } from './usm-anomaly-detection/usm-anomaly-detection.component';
import { UsmAnomalyDetectionCrudComponent } from './usm-anomaly-detection/usm-anomaly-detection-crud/usm-anomaly-detection-crud.component';
import { UnitySetupMonitoringComponent } from './unity-setup-monitoring.component';
import { AutoRemediationComponent } from './auto-remediation/auto-remediation.component';
import { AutoRemediationCrudComponent } from './auto-remediation/auto-remediation-crud/auto-remediation-crud.component';
import { AutoRemediationHistoryComponent } from './auto-remediation/auto-remediation-history/auto-remediation-history.component';
import { ForecastComponent } from './forecast/forecast.component';
import { ForecastCrudComponent } from './forecast/forecast-crud/forecast-crud.component';
import { ForecastGraphsComponent } from './forecast/forecast-graphs/forecast-graphs.component';
import { ForecastHistoryComponent } from './forecast/forecast-history/forecast-history.component';

const routes: Routes = [
  {
    path: '',
    component: UnitySetupMonitoringComponent,
    data: {
      breadcrumb: {
        title: 'Monitoring'
      }
    },
    children: [
      {
        path: 'anomaly-detection',
        component: UsmAnomalyDetectionComponent,
        data: {
          breadcrumb: {
            title: 'Anomaly Detection',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'anomaly-detection/create',
        component: UsmAnomalyDetectionCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'anomaly-detection/:anomalyDetctionTriggerId/edit',
        component: UsmAnomalyDetectionCrudComponent,
        data: {
          breadcrumd: {
            title: 'Edit',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'auto-remediation',
        component: AutoRemediationComponent,
        data: {
          breadcrumb: {
            title: 'Auto Remediation',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'auto-remediation/create',
        component: AutoRemediationCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'auto-remediation/:autoRemediationId/edit',
        component: AutoRemediationCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'auto-remediation/:autoRemediationId/history',
        component: AutoRemediationHistoryComponent,
        data: {
          breadcrumb: {
            title: 'Create',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'forecast',
        component: ForecastComponent,
        data: {
          breadcrumb: {
            title: 'Forecast',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'forecast/add',
        component: ForecastCrudComponent,
        data: {
          breadcrumb: {
            title: 'Forecast',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'forecast/:itemId/edit',
        component: ForecastCrudComponent,
        data: {
          breadcrumb: {
            title: 'Forecast',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'forecast/:deviceId/graphs',
        component: ForecastGraphsComponent,
        data: {
          breadcrumb: {
            title: 'Forecast',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'forecast/:deviceId/history',
        component: ForecastHistoryComponent,
        data: {
          breadcrumb: {
            title: 'Forecast',
            stepbackCount: 0
          }
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitySetupMonitoringRoutingModule { }
