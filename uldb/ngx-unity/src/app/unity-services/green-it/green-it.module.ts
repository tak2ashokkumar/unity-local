import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GreenITRoutingModule } from './green-it-routing.module';
import { GreenITComponent } from './green-it.component';
import { GreenItDashboardComponent } from './green-it-dashboard/green-it-dashboard.component';
import { GreenItEmissionDetailsComponent } from './green-it-emission-details/green-it-emission-details.component';
import { GreenItUsageComponent } from './green-it-usage/green-it-usage.component';
import { ChartsModule } from 'ng2-charts';
import { GreenItSubscribeComponent } from './green-it-subscribe/green-it-subscribe.component';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS } from '@busacca/ng-pick-datetime';
import { SustainabilityMapComponent } from './green-it-dashboard/sustainability-map/sustainability-map.component';


/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [
    GreenITComponent,
    GreenItDashboardComponent,
    GreenItEmissionDetailsComponent,
    GreenItUsageComponent,
    GreenItSubscribeComponent,
    SustainabilityMapComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    GreenITRoutingModule,
    ChartsModule
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ]
})
export class GreenITModule { }
