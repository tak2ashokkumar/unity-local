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
import { AppSearchComponent } from './app-search/app-search.component';
import { AppSpinnerComponent } from './app-spinner/app-spinner.component';
import { AppXtermComponent } from './app-xterm/app-xterm.component';
import { AssetOnboardingStatusComponent } from './asset-onboarding-status/asset-onboarding-status.component';
import { CabinetCrudComponent } from './cabinet-crud/cabinet-crud.component';
import { CheckAuthComponent } from './check-auth/check-auth.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { ConsoleAccessComponent } from './console-access/console-access.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { CustomPasswordFieldComponent } from './custom-password-field/custom-password-field.component';
import { DataRefreshBtnComponent } from './data-refresh-btn/data-refresh-btn.component';
import { DcCrudComponent } from './dc-crud/dc-crud.component';
import { DeviceZabbixEmailNotificationComponent } from './device-zabbix-email-notification/device-zabbix-email-notification.component';
import { FileDndDirective } from './app-directives/file-dnd.directive';
import { FloatingTerminalComponent } from './floating-terminal/floating-terminal.component';
import { TeminalItemComponent } from './floating-terminal/teminal-item/teminal-item.component';
import { HideForNonAdminDirective, HideForReadOnlyDirective, DisableForReadOnlyDirective } from './app-directives/hide-for-non-admin.directive';
import { MinHeighFullDirective } from './app-directives/min-heigh-full.directive';
import { MultiselectDropdownComponent, MultiSelectSearchFilter } from './multiselect-dropdown/multiselect-dropdown.component';
import { PcCrudComponent } from './pc-crud/pc-crud.component';
import { PduCrudComponent } from './pdu-crud/pdu-crud.component';
import { AppSecToDaysPipe, BandWidthPipe, ControlRequiredPipe, FileSizeConversionPipe, FileSizePipe } from './pipes';
import { PublicCloudAwsCrudComponent } from './public-cloud-aws-crud/public-cloud-aws-crud.component';
import { PublicCloudAzureCrudComponent } from './public-cloud-azure-crud/public-cloud-azure-crud.component';
import { PublicCloudGcpCrudComponent } from './public-cloud-gcp-crud/public-cloud-gcp-crud.component';
import { PublicCloudOciCrudComponent } from './public-cloud-oci-crud/public-cloud-oci-crud.component';
import { QueryArrowIconDirective } from './query-builder/query-arrow-icon.directive';
import { QueryButtonGroupDirective } from './query-builder/query-button-group.directive';
import { QueryEmptyWarningDirective } from './query-builder/query-empty-warning.directive';
import { QueryEntityDirective } from './query-builder/query-entity.directive';
import { QueryFieldDirective } from './query-builder/query-field.directive';
import { QueryInputDirective } from './query-builder/query-input.directive';
import { QueryOperatorDirective } from './query-builder/query-operator.directive';
import { QueryRemoveButtonDirective } from './query-builder/query-remove-button.directive';
import { QuerySwitchGroupDirective } from './query-builder/query-switch-group.directive';
import { ReportIssueComponent } from './report-issue/report-issue.component';
import { ScrollableTabComponent } from './scrollable-tab/scrollable-tab.component';
import { SelfHelpPopupComponent } from './self-help-popup/self-help-popup.component';
import { SharedDeviceStatusComponent } from './shared-device-status/shared-device-status.component';
import { MsDynamicsDashboardTcktMgmtComponent } from './shared-ms-dynamics-tckt-mgmt/ms-dynamics-dashboard-tckt-mgmt/ms-dynamics-dashboard-tckt-mgmt.component';
import { MsDynamicsTcktDetailsComponent } from './shared-ms-dynamics-tckt-mgmt/ms-dynamics-tckt-details/ms-dynamics-tckt-details.component';
import { MsDynamicsTcktMgmtComponent } from './shared-ms-dynamics-tckt-mgmt/ms-dynamics-tckt-mgmt/ms-dynamics-tckt-mgmt.component';
import { NowDashboardTcktMgmtComponent } from './shared-service-now-mgmt/now-dashboard-tckt-mgmt/now-dashboard-tckt-mgmt.component';
import { NowTcktMgmtComponent } from './shared-service-now-mgmt/now-tckt-mgmt/now-tckt-mgmt.component';
import { NowTicketDetailsComponent } from './shared-service-now-mgmt/now-ticket-details/now-ticket-details.component';
import { DashboardSharedTcktMgmtComponent } from './shared-tckt-mgmt/dashboard-shared-tckt-mgmt/dashboard-shared-tckt-mgmt.component';
import { TcktMgmtComponent } from './shared-tckt-mgmt/tckt-mgmt/tckt-mgmt.component';
import { TicketDetailsComponent } from './shared-tckt-mgmt/ticket-details/ticket-details.component';
import { ClientSideSearchPipe } from './table-functionality/client-side-search.pipe';
import { SortableColumnComponent } from './table-functionality/sortable-column/sortable-column.component';
import { SortableTableDirective } from './table-functionality/sortable-column/sortable-table.directive';
import { TableEntriesComponent, TablePageSizeComponent } from './table-functionality/table-page-size/table-page-size.component';
import { TablePagerComponent } from './table-functionality/table-pager/table-pager.component';
import { TableSeachBoxDirective } from './table-functionality/table-seach-box/table-seach-box.directive';
import { TableSearchBoxComponent } from './table-functionality/table-search-box/table-search-box.component';
import { TableStickyScrollDirective } from './app-directives/table-sticky-scroll.directive';
import { TextWrapperComponent } from './text-wrapper/text-wrapper.component';
import { TooltipForWrappedTextDirective } from './text-wrapper/tooltip-for-wrapped-text.directive';
import { ElementTooltipDirective, NodeTooltipDirective, SetColumnWidthDirective, TruncateTextDirective } from './app-directives/truncate-text.directive';
import { UnityRoundedTabComponent } from './unity-rounded-tab/unity-rounded-tab.component';
import { UnitySetupLdapCrudComponent } from './unity-setup-ldap-crud/unity-setup-ldap-crud.component';
import { JiraTcktMgmtComponent } from './shared-jira-tckt-mgmt/jira-tckt-mgmt/jira-tckt-mgmt.component';
import { SharedCreateTicketComponent } from './shared-create-ticket/shared-create-ticket.component';
import { CreateJiraTicketComponent } from './shared-create-ticket/create-jira-ticket/create-jira-ticket.component';
import { CreateCrmTicketComponent } from './shared-create-ticket/create-crm-ticket/create-crm-ticket.component';
import { CreateServiceNowTicketComponent } from './shared-create-ticket/create-service-now-ticket/create-service-now-ticket.component';
import { CreateFeedbackTicketComponent } from './shared-create-ticket/create-feedback-ticket/create-feedback-ticket.component';
import { JiraTicketDetailsComponent } from './shared-jira-tckt-mgmt/jira-ticket-details/jira-ticket-details.component';
import { CreateZendeskTicketComponent } from './shared-create-ticket/create-zendesk-ticket/create-zendesk-ticket.component';
import { JiraDashboardTcktMgmtComponent } from './shared-jira-tckt-mgmt/jira-dashboard-tckt-mgmt/jira-dashboard-tckt-mgmt.component';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { UsiOntapCrudComponent } from './usi-ontap-crud/usi-ontap-crud.component';
import { UsiPureStorageCrudComponent } from './usi-pure-storage-crud/usi-pure-storage-crud.component';
import { SearchBoxComponent } from './table-functionality/search-box/search-box.component';
import { SharedScheduleFormComponent } from './shared-schedule-form/shared-schedule-form.component';
import { UnityScheduleComponent } from './unity-schedule/unity-schedule.component';
import { UnityDevicesMonitoringCrudComponent } from './unity-devices-monitoring-crud/unity-devices-monitoring-crud.component';
import { LazyLoadImagesDirective } from './app-directives/lazy-load-images.directive';
import { AimlAlertDetailsComponent } from './aiml-alert-details/aiml-alert-details.component';
import { AimlEventDetailsComponent } from './aiml-event-details/aiml-event-details.component';
import { SharedGraphComponent } from './shared-graph/shared-graph.component';
import { UnityLeaderLineComponent } from './unity-leader-line/unity-leader-line.component';
import { DeviceInterfaceCrudComponent } from './device-interface-crud/device-interface-crud.component';
import { SharedInterfaceDetailsComponent } from './shared-interface-details/shared-interface-details.component';
import { OnLoadMaskedFormControlsDirective } from './app-directives/masked-form-controls.directive';
import { ImageDropdownComponent } from './image-dropdown/image-dropdown.component';
import { UnitySelectDropdownComponent } from './unity-select-dropdown/unity-select-dropdown.component';
import { JsonComparisonComponent } from './json-comparison/json-comparison.component';
import { AccessControlDirective } from './app-directives/access-control.directive';
import { UnityDevicesCustomAttributesCrudComponent } from './unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.component';
import { CustomDateDropdownComponent } from './custom-date-dropdown/custom-date-dropdown.component';
import { VmBackupHistoryComponent } from './vm-backup-history/vm-backup-history.component';
import { UnityCodeEditorComponent } from './unity-code-editor/unity-code-editor.component';
import { SearchDropdownComponent } from './search-dropdown/search-dropdown.component';
import { UnitedCloudSharedService } from '../united-cloud/shared/united-cloud-shared.service';
import { NowEnhancedTicketDetailsComponent } from './shared-service-now-mgmt/now-enhanced-ticket-details/now-enhanced-ticket-details.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UsiOntapCrudNewComponent } from './usi-ontap-crud-new/usi-ontap-crud-new.component';
import { AutoCompleteMultiComponent } from './auto-complete-multi/auto-complete-multi.component';
import { AceEditorComponent } from './ace-editor/ace-editor.component';
import { PyodideEditorComponent } from './pyodide-editor/pyodide-editor.component';
import { DevicesFileUploadComponent } from './devices-file-upload/devices-file-upload.component';
import { AppWidgetLazyLoaderDirective } from './app-directives/app-widget-lazy-load.directive';
import { WidgetLazyLoaderDirective } from './app-directives/widget-lazy-loader.directive';
import { SharedApplicationTopologyComponent } from './shared-application-topology/shared-application-topology.component';

@NgModule({
  imports: [AppCoreModule, ChartsModule, ResizableModule, PerfectScrollbarModule,
    TypeaheadModule.forRoot(),],
  exports: [
    AppMainTabComponent,
    ComingSoonComponent,
    SortableColumnComponent,
    SortableTableDirective,
    TableSeachBoxDirective,
    ScrollableTabComponent,
    AppNotificationComponent,
    AppSpinnerComponent,
    AppXtermComponent,
    CheckAuthComponent,
    ConsoleAccessComponent,
    AppSecToDaysPipe,
    BandWidthPipe,
    CreateTicketComponent,
    ClientSideSearchPipe,
    TextWrapperComponent,
    IconDirective,
    MultiselectDropdownComponent,
    ImageDropdownComponent,
    MultiSelectSearchFilter,
    DashboardSharedTcktMgmtComponent,
    TcktMgmtComponent,
    FloatingTerminalComponent,
    AssetOnboardingStatusComponent,
    HideForNonAdminDirective,
    HideForReadOnlyDirective,
    DisableForReadOnlyDirective,
    TruncateTextDirective,
    SetColumnWidthDirective,
    ElementTooltipDirective,
    NodeTooltipDirective,
    SharedDeviceStatusComponent,
    SelfHelpPopupComponent,
    DataRefreshBtnComponent,
    TablePagerComponent,
    DcCrudComponent,
    CabinetCrudComponent,
    TablePageSizeComponent,
    TableEntriesComponent,
    FileSizePipe,
    NowTcktMgmtComponent,
    NowDashboardTcktMgmtComponent,
    PduCrudComponent,
    AppSearchComponent,
    MsDynamicsTcktMgmtComponent,
    MsDynamicsDashboardTcktMgmtComponent,
    DeviceZabbixEmailNotificationComponent,
    TableStickyScrollDirective,
    TableSearchBoxComponent,
    UnityRoundedTabComponent,
    TooltipForWrappedTextDirective,
    FileDndDirective,
    FormControlNameDateFormatterDirective,
    PublicCloudAwsCrudComponent,
    PcCrudComponent,
    PublicCloudAzureCrudComponent,
    PublicCloudGcpCrudComponent,
    PublicCloudOciCrudComponent,
    UnitySetupLdapCrudComponent,
    CustomPasswordFieldComponent,
    MinHeighFullDirective,
    JiraTcktMgmtComponent,
    SharedCreateTicketComponent,
    JiraDashboardTcktMgmtComponent,
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
    UsiOntapCrudComponent,
    UsiPureStorageCrudComponent,
    SearchBoxComponent,
    SharedScheduleFormComponent,
    UnityScheduleComponent,
    UnityDevicesMonitoringCrudComponent,
    LazyLoadImagesDirective,
    AimlAlertDetailsComponent,
    AimlEventDetailsComponent,
    SharedGraphComponent,
    DeviceInterfaceCrudComponent,
    OnLoadMaskedFormControlsDirective,
    JsonComparisonComponent,
    ControlRequiredPipe,
    AccessControlDirective,
    UnityDevicesCustomAttributesCrudComponent,
    CustomDateDropdownComponent,
    FileSizeConversionPipe,
    VmBackupHistoryComponent,
    SearchDropdownComponent,
    AutoCompleteMultiComponent,
    DevicesFileUploadComponent,
    AppWidgetLazyLoaderDirective,
    WidgetLazyLoaderDirective,
    SharedApplicationTopologyComponent
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
    AppXtermComponent,
    CheckAuthComponent,
    ConsoleAccessComponent,
    AppSecToDaysPipe,
    BandWidthPipe,
    ReportIssueComponent,
    CreateTicketComponent,
    ClientSideSearchPipe,
    TextWrapperComponent,
    IconDirective,
    MultiselectDropdownComponent,
    ImageDropdownComponent,
    MultiSelectSearchFilter,
    DashboardSharedTcktMgmtComponent,
    TcktMgmtComponent,
    TicketDetailsComponent,
    FloatingTerminalComponent,
    AssetOnboardingStatusComponent,
    HideForNonAdminDirective,
    HideForReadOnlyDirective,
    DisableForReadOnlyDirective,
    TruncateTextDirective,
    SetColumnWidthDirective,
    ElementTooltipDirective,
    NodeTooltipDirective,
    SharedDeviceStatusComponent,
    SelfHelpPopupComponent,
    TeminalItemComponent,
    DataRefreshBtnComponent,
    TablePagerComponent,
    DcCrudComponent,
    CabinetCrudComponent,
    TablePageSizeComponent,
    TableEntriesComponent,
    FileSizePipe,
    NowTcktMgmtComponent,
    NowDashboardTcktMgmtComponent,
    NowTicketDetailsComponent,
    PduCrudComponent,
    AppSearchComponent,
    MsDynamicsTcktMgmtComponent,
    MsDynamicsDashboardTcktMgmtComponent,
    MsDynamicsTcktDetailsComponent,
    DeviceZabbixEmailNotificationComponent,
    TableStickyScrollDirective,
    TableSearchBoxComponent,
    UnityRoundedTabComponent,
    TooltipForWrappedTextDirective,
    FileDndDirective,
    FormControlNameDateFormatterDirective,
    PublicCloudAwsCrudComponent,
    PcCrudComponent,
    PublicCloudAzureCrudComponent,
    PublicCloudGcpCrudComponent,
    PublicCloudOciCrudComponent,
    UnitySetupLdapCrudComponent,
    CustomPasswordFieldComponent,
    MinHeighFullDirective,
    JiraTcktMgmtComponent,
    SharedCreateTicketComponent,
    CreateJiraTicketComponent,
    CreateCrmTicketComponent,
    CreateServiceNowTicketComponent,
    CreateFeedbackTicketComponent,
    JiraTicketDetailsComponent,
    CreateZendeskTicketComponent,
    JiraDashboardTcktMgmtComponent,
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
    UsiOntapCrudComponent,
    UsiPureStorageCrudComponent,
    SearchBoxComponent,
    SharedScheduleFormComponent,
    UnityScheduleComponent,
    UnityDevicesMonitoringCrudComponent,
    LazyLoadImagesDirective,
    AimlAlertDetailsComponent,
    AimlEventDetailsComponent,
    SharedGraphComponent,
    UnityLeaderLineComponent,
    DeviceInterfaceCrudComponent,
    SharedInterfaceDetailsComponent,
    OnLoadMaskedFormControlsDirective,
    ImageDropdownComponent,
    UnitySelectDropdownComponent,
    JsonComparisonComponent,
    ControlRequiredPipe,
    AccessControlDirective,
    UnityDevicesCustomAttributesCrudComponent,
    CustomDateDropdownComponent,
    VmBackupHistoryComponent,
    FileSizeConversionPipe,
    UnityCodeEditorComponent,
    SearchDropdownComponent,
    NowEnhancedTicketDetailsComponent,
    UsiOntapCrudNewComponent,
    AutoCompleteMultiComponent,
    AceEditorComponent,
    PyodideEditorComponent,
    DevicesFileUploadComponent,
    AppWidgetLazyLoaderDirective,
    WidgetLazyLoaderDirective,
    SharedApplicationTopologyComponent
  ],
  providers: [
    AppSecToDaysPipe,
    BandWidthPipe,
    FileSizePipe,
    ControlRequiredPipe,
    CookieService,
    FileSizeConversionPipe,
    UnitedCloudSharedService
  ]
})
export class SharedModule {
}
