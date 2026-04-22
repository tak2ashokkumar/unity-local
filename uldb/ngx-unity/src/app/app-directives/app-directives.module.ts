import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessControlDirective } from './access-control.directive';
import { FileDndDirective } from './file-dnd.directive';
import { FormControlNameDateFormatterDirective } from './form-control-name-date-formatter.directive';
import { HideForNonAdminDirective, HideForReadOnlyDirective, DisableForReadOnlyDirective } from './hide-for-non-admin.directive';
import { LazyLoadImagesDirective } from './lazy-load-images.directive';
import { MaskedFormControlsDirective } from './masked-form-controls.directive';
import { MinHeighFullDirective } from './min-heigh-full.directive';
import { TableStickyScrollDirective } from './table-sticky-scroll.directive';
import { AppWidgetLazyLoaderDirective } from './app-widget-lazy-load.directive';
import { WidgetLazyLoaderDirective } from './widget-lazy-loader.directive';
import { IconDirective } from '../shared/app-main-tab/icon-host.directive';
import { TruncateTextDirective, SetColumnWidthDirective, ElementTooltipDirective, NodeTooltipDirective } from './truncate-text.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    AccessControlDirective,
    FileDndDirective,
    FormControlNameDateFormatterDirective,
    HideForNonAdminDirective,
    HideForReadOnlyDirective,
    DisableForReadOnlyDirective,
    LazyLoadImagesDirective,
    MaskedFormControlsDirective,
    MinHeighFullDirective,
    TableStickyScrollDirective,
    AppWidgetLazyLoaderDirective,
    WidgetLazyLoaderDirective,
    IconDirective,
    TruncateTextDirective,
    SetColumnWidthDirective,
    ElementTooltipDirective,
    NodeTooltipDirective
  ],
  exports: [
    AccessControlDirective,
    FileDndDirective,
    FormControlNameDateFormatterDirective,
    HideForNonAdminDirective,
    HideForReadOnlyDirective,
    DisableForReadOnlyDirective,
    LazyLoadImagesDirective,
    MaskedFormControlsDirective,
    MinHeighFullDirective,
    TableStickyScrollDirective,
    AppWidgetLazyLoaderDirective,
    WidgetLazyLoaderDirective,
    IconDirective,
    TruncateTextDirective,
    SetColumnWidthDirective,
    ElementTooltipDirective,
    NodeTooltipDirective
  ]
})
export class AppDirectivesModule {}