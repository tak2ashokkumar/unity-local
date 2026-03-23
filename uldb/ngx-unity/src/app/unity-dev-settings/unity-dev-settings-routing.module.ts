import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventTypeSettingsComponent } from './event-type-settings/event-type-settings.component';
import { NagiosSettingsComponent } from './nagios-settings/nagios-settings.component';

const routes: Routes = [
  {
    path: 'event-types',
    component: EventTypeSettingsComponent,
    data: {
      breadcrumb: {
        title: 'Event Types'
      }
    },
  },
  {
    path: 'nagios',
    component: NagiosSettingsComponent,
    data: {
      breadcrumb: {
        title: 'Nagios'
      }
    },
  },
  {
    path: '',
    redirectTo: 'event-types', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityDevSettingsRoutingModule { }
