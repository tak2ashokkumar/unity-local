import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppCoreModule } from '../app-core/app-core.module';
import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';
import {
  AppHtmlAttrDirective,
  BrandMinimizeDirective,
  MobileSidebarToggleDirective,
  SidebarDropdownToggleDirective,
  SidebarMinimizeDirective,
  SidebarOffCanvasCloseDirective,
  SidebarToggleDirective
} from './sidebar.directives';

@NgModule({
  declarations: [
    AppSidebarComponent,
    AppHtmlAttrDirective,
    BrandMinimizeDirective,
    MobileSidebarToggleDirective,
    SidebarDropdownToggleDirective,
    SidebarMinimizeDirective,
    SidebarOffCanvasCloseDirective,
    SidebarToggleDirective
  ],
  imports: [
    AppCoreModule,
    PerfectScrollbarModule,
    RouterModule
  ],
  exports: [
    AppSidebarComponent,
    AppHtmlAttrDirective,
    BrandMinimizeDirective,
    MobileSidebarToggleDirective,
    SidebarDropdownToggleDirective,
    SidebarMinimizeDirective,
    SidebarOffCanvasCloseDirective,
    SidebarToggleDirective
  ]
})
export class SidebarModule { }
