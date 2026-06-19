import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientJsonpModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule } from 'ngx-bootstrap/alert';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppBreadcrumbModule } from './app-breadcrumb/app-breadcrumb.module';
import { AppCoreModule } from './app-core/app-core.module';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AppMainComponent } from './app-main/app-main.component';
import { TwoFactorAuthComponent } from './app-main/two-factor-auth/two-factor-auth.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapService } from './map.service';
import { MtpActivityLogsComponent } from './mtp-activity-logs/mtp-activity-logs.component';
import { StorageService, StorageType } from './shared/app-storage/storage.service';
import { SharedModule } from './shared/shared.module';
import { UserInfoService } from './shared/user-info.service';
import { SidebarModule } from './sidebar/sidebar.module';
import { MtpMaintenanceCrudComponent } from './mtp-maintenance-crud/mtp-maintenance-crud.component';
import { MtpMaintenanceComponent } from './mtp-maintenance/mtp-maintenance.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

export function useStorageFactory(service: StorageService) { return () => service.put('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone, StorageType.COOKIESTORAGE); }
export function useFactory(service: UserInfoService) { return () => service.loadUserData(); }
export function useMapFactory(service: MapService) { return () => service.loadMap(); }

@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    AppMainComponent,
    TwoFactorAuthComponent,
    MtpActivityLogsComponent,
    MtpMaintenanceCrudComponent,
    MtpMaintenanceComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PerfectScrollbarModule,
    AppCoreModule,
    HttpClientJsonpModule,
    SidebarModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    ProgressbarModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    CollapseModule.forRoot(),
    TypeaheadModule.forRoot(),
    AppRoutingModule,
    AppBreadcrumbModule,
    SharedModule,
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  },
  // {
  //   provide: APP_INITIALIZER,
  //   useFactory: useMapFactory,
  //   deps: [MapService],
  //   multi: true
  // },
  {
    provide: APP_INITIALIZER,
    useFactory: useStorageFactory,
    deps: [StorageService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: useFactory,
    deps: [UserInfoService],
    multi: true
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }