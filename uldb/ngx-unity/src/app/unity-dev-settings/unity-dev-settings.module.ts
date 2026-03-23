import { NgModule } from '@angular/core';

import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { NagiosSettingsComponent } from './nagios-settings/nagios-settings.component';
import { UnityDevSettingsRoutingModule } from './unity-dev-settings-routing.module';
import { EventTypeSettingsComponent } from './event-type-settings/event-type-settings.component';


@NgModule({
  declarations: [
    NagiosSettingsComponent,
    EventTypeSettingsComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnityDevSettingsRoutingModule
  ]
})
export class UnityDevSettingsModule { }
