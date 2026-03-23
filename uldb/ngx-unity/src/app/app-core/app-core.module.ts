import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { httpInterceptorProviders } from '../app-http-interceptors.provider';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { TagInputModule } from 'ngx-chips';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

@NgModule({
  declarations: [],
  imports: [
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken',
    })
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    TooltipModule,
    PopoverModule,
    ModalModule,
    AlertModule,
    TabsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    HttpClientXsrfModule,
    ProgressbarModule,
    RxReactiveFormsModule,
    TagInputModule,
    BsDatepickerModule,
    VirtualScrollerModule
  ],
  providers: [httpInterceptorProviders]
})
export class AppCoreModule { }
