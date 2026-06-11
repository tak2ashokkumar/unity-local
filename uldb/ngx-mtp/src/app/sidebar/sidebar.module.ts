import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SidebarOffCanvasCloseDirective, BrandMinimizeDirective } from './app-sidebar-close.directive';
import { AppHtmlAttrDirective } from './app-html-attr.directive';
import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';
import { AppSidebarNavComponent } from './app-sidebar-nav/app-sidebar-nav.component';
import { AppSidebarNavItemComponent } from './app-sidebar-nav-item/app-sidebar-nav-item.component';
import { AppSidebarNavLinkComponent } from './app-sidebar-nav-link/app-sidebar-nav-link.component';
import { AppSidebarNavDropdownComponent } from './app-sidebar-nav-dropdown/app-sidebar-nav-dropdown.component';
import { AppSidebarNavTitleComponent } from './app-sidebar-nav-title/app-sidebar-nav-title.component';
import { AppNavDropdownDirective } from './app-nav-dropdown.directive';
import { AppNavDropdownToggleDirective } from './app-nav-dropdown-toggle.directive';
import { AppSidebarMinimizerComponent } from './app-sidebar-minimizer/app-sidebar-minimizer.component';
import { SidebarToggleDirective, SidebarMinimizeDirective, MobileSidebarToggleDirective } from './app-sidebar-toggler.directive';
import { AppCoreModule } from '../app-core/app-core.module';
import { HideMenuForNonAdminDirective } from './hide-menu-for-non-admin.directive';


@NgModule({
  declarations: [
    AppSidebarComponent,
    AppSidebarNavComponent,
    AppSidebarNavItemComponent,
    AppSidebarNavLinkComponent,
    AppSidebarNavDropdownComponent,
    AppSidebarNavTitleComponent,
    AppNavDropdownDirective,
    AppNavDropdownToggleDirective,
    AppSidebarMinimizerComponent,
    SidebarToggleDirective,
    SidebarMinimizeDirective,
    MobileSidebarToggleDirective,
    SidebarOffCanvasCloseDirective,
    AppHtmlAttrDirective,
    BrandMinimizeDirective,
    HideMenuForNonAdminDirective],
  imports: [
    AppCoreModule,
    RouterModule
  ],
  exports: [
    AppSidebarComponent,
    AppSidebarNavComponent,
    AppSidebarNavItemComponent,
    AppSidebarNavLinkComponent,
    AppSidebarNavDropdownComponent,
    AppSidebarNavTitleComponent,
    AppNavDropdownDirective,
    AppNavDropdownToggleDirective,
    AppSidebarMinimizerComponent,
    SidebarToggleDirective,
    SidebarMinimizeDirective,
    MobileSidebarToggleDirective,
    SidebarOffCanvasCloseDirective,
    AppHtmlAttrDirective,
    BrandMinimizeDirective]
})
export class SidebarModule { }
