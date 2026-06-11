import { NgModule } from '@angular/core';
import { ResizableModule } from 'angular-resizable-element';
import { ChartsModule } from 'ng2-charts';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CookieService } from 'ngx-cookie-service';
import { AppCoreModule } from '../app-core/app-core.module';
import { FormControlNameDateFormatterDirective } from './app-directives/form-control-name-date-formatter.directive';
import { AppMainTabComponent } from './app-main-tab/app-main-tab.component';
import { IconDirective } from './app-main-tab/icon-host.directive';
import { AppNotificationComponent } from './app-notification/app-notification.component';
import { AppSpinnerComponent } from './app-spinner/app-spinner.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { CustomPasswordFieldComponent } from './custom-password-field/custom-password-field.component';
import { DataRefreshBtnComponent } from './data-refresh-btn/data-refresh-btn.component';
import { FileDndDirective } from './file-dnd.directive';
import { HideForNonAdminDirective } from './hide-for-non-admin.directive';
import { MinHeighFullDirective } from './min-heigh-full.directive';
import { MultiselectDropdownComponent, MultiSelectSearchFilter } from './multiselect-dropdown/multiselect-dropdown.component';
import { AppSecToDaysPipe, BandWidthPipe, FileSizePipe } from './pipes';
import { ScrollableTabComponent } from './scrollable-tab/scrollable-tab.component';
import { SharedDeviceStatusComponent } from './shared-device-status/shared-device-status.component';
import { ClientSideSearchPipe } from './table-functionality/client-side-search.pipe';
import { SortableColumnComponent } from './table-functionality/sortable-column/sortable-column.component';
import { SortableTableDirective } from './table-functionality/sortable-column/sortable-table.directive';
import { TableEntriesComponent, TablePageSizeComponent } from './table-functionality/table-page-size/table-page-size.component';
import { TablePagerComponent } from './table-functionality/table-pager/table-pager.component';
import { TableSeachBoxDirective } from './table-functionality/table-seach-box/table-seach-box.directive';
import { TableSearchBoxComponent } from './table-functionality/table-search-box/table-search-box.component';
import { TableStickyScrollDirective } from './table-sticky-scroll.directive';
import { TextWrapperComponent } from './text-wrapper/text-wrapper.component';
import { TooltipForWrappedTextDirective } from './text-wrapper/tooltip-for-wrapped-text.directive';
import { ElementTooltipDirective, SetColumnWidthDirective, TruncateTextDirective } from './truncate-text.directive';
import { UnityRoundedTabComponent } from './unity-rounded-tab/unity-rounded-tab.component';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { QueryInputDirective } from './query-builder/query-input.directive';
import { QueryOperatorDirective } from './query-builder/query-operator.directive';
import { QueryFieldDirective } from './query-builder/query-field.directive';
import { QueryEntityDirective } from './query-builder/query-entity.directive';
import { QueryButtonGroupDirective } from './query-builder/query-button-group.directive';
import { QuerySwitchGroupDirective } from './query-builder/query-switch-group.directive';
import { QueryRemoveButtonDirective } from './query-builder/query-remove-button.directive';
import { QueryEmptyWarningDirective } from './query-builder/query-empty-warning.directive';
import { QueryArrowIconDirective } from './query-builder/query-arrow-icon.directive';
import { AccessControlDirective } from './app-directives/access-control.directive';
import { SharedScheduleFormComponent } from './shared-schedule-form/shared-schedule-form.component';
import { SearchBoxComponent } from './table-functionality/search-box/search-box.component';
import { MtpAimlEventDetailsComponent } from './mtp-aiml-event-details/mtp-aiml-event-details.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [AppCoreModule, ChartsModule, ResizableModule,
    TypeaheadModule.forRoot(),CommonModule],
  exports: [
    AppMainTabComponent,
    ComingSoonComponent,
    SortableColumnComponent,
    SortableTableDirective,
    TableSeachBoxDirective,
    ScrollableTabComponent,
    AppNotificationComponent,
    AppSpinnerComponent,
    AppSecToDaysPipe,
    BandWidthPipe,
    ClientSideSearchPipe,
    TextWrapperComponent,
    IconDirective,
    MultiselectDropdownComponent,
    MultiSelectSearchFilter,
    HideForNonAdminDirective,
    TruncateTextDirective,
    SetColumnWidthDirective,
    ElementTooltipDirective,
    SharedDeviceStatusComponent,
    DataRefreshBtnComponent,
    TablePagerComponent,
    TablePageSizeComponent,
    TableEntriesComponent,
    FileSizePipe,
    TableStickyScrollDirective,
    TableSearchBoxComponent,
    UnityRoundedTabComponent,
    TooltipForWrappedTextDirective,
    FileDndDirective,
    FormControlNameDateFormatterDirective,
    CustomPasswordFieldComponent,
    MinHeighFullDirective,
    QueryBuilderComponent,
    QueryInputDirective,
    QueryOperatorDirective,
    QueryFieldDirective,
    QueryEntityDirective,
    QueryButtonGroupDirective,
    QuerySwitchGroupDirective,
    QueryRemoveButtonDirective,
    QueryEmptyWarningDirective,
    QueryArrowIconDirective,
    AccessControlDirective,
    SharedScheduleFormComponent,
    SearchBoxComponent,
    MtpAimlEventDetailsComponent
  ],
  declarations: [
    AppMainTabComponent,
    ComingSoonComponent,
    SortableColumnComponent,
    SortableTableDirective,
    TableSeachBoxDirective,
    ScrollableTabComponent,
    AppNotificationComponent,
    AppSpinnerComponent,
    AppSecToDaysPipe,
    BandWidthPipe,
    ClientSideSearchPipe,
    TextWrapperComponent,
    IconDirective,
    MultiselectDropdownComponent,
    MultiSelectSearchFilter,
    HideForNonAdminDirective,
    TruncateTextDirective,
    SetColumnWidthDirective,
    ElementTooltipDirective,
    SharedDeviceStatusComponent,
    DataRefreshBtnComponent,
    TablePagerComponent,
    TablePageSizeComponent,
    TableEntriesComponent,
    FileSizePipe,
    TableStickyScrollDirective,
    TableSearchBoxComponent,
    UnityRoundedTabComponent,
    TooltipForWrappedTextDirective,
    FileDndDirective,
    FormControlNameDateFormatterDirective,
    CustomPasswordFieldComponent,
    MinHeighFullDirective,
    QueryBuilderComponent,
    QueryInputDirective,
    QueryOperatorDirective,
    QueryFieldDirective,
    QueryEntityDirective,
    QueryButtonGroupDirective,
    QuerySwitchGroupDirective,
    QueryRemoveButtonDirective,
    QueryEmptyWarningDirective,
    QueryArrowIconDirective,
    AccessControlDirective,
    SharedScheduleFormComponent,
    SearchBoxComponent,
    MtpAimlEventDetailsComponent,
  ],
  providers: [AppSecToDaysPipe, BandWidthPipe, FileSizePipe, CookieService]
})
export class SharedModule {
}
