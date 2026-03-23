import { NgModule } from '@angular/core';
import { EchartsxModule } from 'echarts-for-angular';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { ApplicationDiscoveryDataComponent } from './application-discovery-data/application-discovery-data.component';
import { ApplicationDiscoveryFailuresComponent } from './application-discovery-data/application-discovery-failures/application-discovery-failures.component';
import { ApplicationDiscoveryProblemsComponent } from './application-discovery-data/application-discovery-problems/application-discovery-problems.component';
import { ApplicationDiscoveryServicesComponent } from './application-discovery-data/application-discovery-services/application-discovery-services.component';
import { ApplicationDiscoveryCreateGraphsComponent } from './application-discovery-metadata/application-discovery-create-graphs/application-discovery-create-graphs.component';
import { ApplicationDiscoveryDetailsComponent } from './application-discovery-metadata/application-discovery-details/application-discovery-details.component';
import { ApplicationDiscoveryGraphsComponent } from './application-discovery-metadata/application-discovery-graphs/application-discovery-graphs.component';
import { ApplicationDiscoveryLogsComponent } from './application-discovery-metadata/application-discovery-logs/application-discovery-logs.component';
import { ApplicationDiscoveryMetadataComponent } from './application-discovery-metadata/application-discovery-metadata.component';
import { ApplicationDiscoveryTracesComponent } from './application-discovery-metadata/application-discovery-traces/application-discovery-traces.component';
import { UnityApplicationsRoutingModule } from './unity-applications-routing.module';
import { UnityApplicationsComponent } from './unity-applications.component';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { TitleCasePipe } from '@angular/common';
import { ApplicationDiscoveryAiHealthAnalysisComponent } from './application-discovery-data/application-discovery-ai-health-analysis/application-discovery-ai-health-analysis.component';
import { ApplicationDiscoveryEventsComponent } from './application-discovery-metadata/application-discovery-events/application-discovery-events.component';
import { ApplicationDiscoveryProblemsImpactAnalysisComponent } from './application-discovery-data/application-discovery-problems/application-discovery-problems-impact-analysis/application-discovery-problems-impact-analysis.component';
/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [
    UnityApplicationsComponent,
    ApplicationDiscoveryMetadataComponent,
    ApplicationDiscoveryDetailsComponent,
    ApplicationDiscoveryTracesComponent,
    ApplicationDiscoveryLogsComponent,
    ApplicationDiscoveryCreateGraphsComponent,
    ApplicationDiscoveryGraphsComponent,
    ApplicationDiscoveryServicesComponent,
    ApplicationDiscoveryFailuresComponent,
    ApplicationDiscoveryProblemsComponent,
    ApplicationDiscoveryDataComponent,
    ApplicationDiscoveryAiHealthAnalysisComponent,
    ApplicationDiscoveryEventsComponent,
    ApplicationDiscoveryProblemsImpactAnalysisComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnityApplicationsRoutingModule,
    EchartsxModule,
    ChartsModule,
    PerfectScrollbarModule,
    UnitedCloudSharedModule
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    TitleCasePipe
  ]
})
export class UnityApplicationsModule { }
