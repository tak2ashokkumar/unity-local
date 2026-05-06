import { NgModule } from '@angular/core';
import { ResizableModule } from 'angular-resizable-element';
import { ChartsModule } from 'ng2-charts';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CookieService } from 'ngx-cookie-service';
import { AppCoreModule } from '../app-core/app-core.module';
import { AppMainTabComponent } from './app-main-tab/app-main-tab.component';
import { AppNotificationComponent } from './app-notification/app-notification.component';
import { AppSearchComponent } from './app-search/app-search.component';
import { AppSpinnerComponent } from './app-spinner/app-spinner.component';
import { AppXtermComponent } from './app-xterm/app-xterm.component';
import { AssetOnboardingStatusComponent } from './asset-onboarding-status/asset-onboarding-status.component';
import { CheckAuthComponent } from './check-auth/check-auth.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { ConsoleAccessComponent } from './console-access/console-access.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { CustomPasswordFieldComponent } from './custom-password-field/custom-password-field.component';
import { DataRefreshBtnComponent } from './data-refresh-btn/data-refresh-btn.component';
import { DeviceZabbixEmailNotificationComponent } from './device-zabbix-email-notification/device-zabbix-email-notification.component';
import { FloatingTerminalComponent } from './floating-terminal/floating-terminal.component';
import { TeminalItemComponent } from './floating-terminal/teminal-item/teminal-item.component';
import { MultiselectDropdownComponent, MultiSelectSearchFilter } from './multiselect-dropdown/multiselect-dropdown.component';
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
import { SortableColumnComponent } from './table-functionality/sortable-column/sortable-column.component';
import { SortableTableDirective } from './table-functionality/sortable-column/sortable-table.directive';
import { TableEntriesComponent, TablePageSizeComponent } from './table-functionality/table-page-size/table-page-size.component';
import { TablePagerComponent } from './table-functionality/table-pager/table-pager.component';
import { TableSeachBoxDirective } from './table-functionality/table-seach-box/table-seach-box.directive';
import { TableSearchBoxComponent } from './table-functionality/table-search-box/table-search-box.component';
import { TextWrapperComponent } from './text-wrapper/text-wrapper.component';
import { TooltipForWrappedTextDirective } from './text-wrapper/tooltip-for-wrapped-text.directive';
import { UnityRoundedTabComponent } from './unity-rounded-tab/unity-rounded-tab.component';
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
import { QueryArrowIconDirective } from './query-builder/query-arrow-icon.directive';
import { QueryButtonGroupDirective } from './query-builder/query-button-group.directive';
import { QueryEmptyWarningDirective } from './query-builder/query-empty-warning.directive';
import { QueryEntityDirective } from './query-builder/query-entity.directive';
import { QueryFieldDirective } from './query-builder/query-field.directive';
import { QueryInputDirective } from './query-builder/query-input.directive';
import { QueryOperatorDirective } from './query-builder/query-operator.directive';
import { QueryRemoveButtonDirective } from './query-builder/query-remove-button.directive';
import { QuerySwitchGroupDirective } from './query-builder/query-switch-group.directive';
import { SearchBoxComponent } from './table-functionality/search-box/search-box.component';
import { SharedScheduleFormComponent } from './shared-schedule-form/shared-schedule-form.component';
import { UnityScheduleComponent } from './unity-schedule/unity-schedule.component';
import { AimlAlertDetailsComponent } from './aiml-alert-details/aiml-alert-details.component';
import { AimlEventDetailsComponent } from './aiml-event-details/aiml-event-details.component';
import { UnityLeaderLineComponent } from './unity-leader-line/unity-leader-line.component';
import { SharedInterfaceDetailsComponent } from './shared-interface-details/shared-interface-details.component';
import { ImageDropdownComponent } from './image-dropdown/image-dropdown.component';
import { UnitySelectDropdownComponent } from './unity-select-dropdown/unity-select-dropdown.component';
import { JsonComparisonComponent } from './json-comparison/json-comparison.component';
import { CustomDateDropdownComponent } from './custom-date-dropdown/custom-date-dropdown.component';
import { VmBackupHistoryComponent } from './vm-backup-history/vm-backup-history.component';
import { UnityCodeEditorComponent } from './unity-code-editor/unity-code-editor.component';
import { SearchDropdownComponent } from './search-dropdown/search-dropdown.component';
import { UnitedCloudSharedService } from '../united-cloud/shared/united-cloud-shared.service';
import { NowEnhancedTicketDetailsComponent } from './shared-service-now-mgmt/now-enhanced-ticket-details/now-enhanced-ticket-details.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AceEditorComponent } from './ace-editor/ace-editor.component';
import { PyodideEditorComponent } from './pyodide-editor/pyodide-editor.component';
import { AutoCompleteMultiComponent } from './auto-complete-multi/auto-complete-multi.component';
import { DevicesFileUploadComponent } from './devices-file-upload/devices-file-upload.component';
import { SharedApplicationTopologyComponent } from './shared-application-topology/shared-application-topology.component';
import { AppDirectivesModule } from '../app-directives/app-directives.module';
import { AppFiltersModule } from '../app-filters/app-filters.module';
import { AppSharedCrudModule } from '../app-shared-crud/app-shared-crud.module';
import { ConditionInvestigationComponent } from './condition-investigation/condition-investigation.component';
import { ConditionInvestigationChatbotComponent } from './condition-investigation/condition-investigation-chatbot/condition-investigation-chatbot.component';
import { ConditionInvestigationZabbixGraphsComponent } from './condition-investigation/condition-investigation-zabbix-graphs/condition-investigation-zabbix-graphs.component';
import { ConditionInvestigationNetworkTopologyComponent } from './condition-investigation/condition-investigation-network-topology/condition-investigation-network-topology.component';
import { MarkdownModule } from 'ngx-markdown';
import { ConditionInvestigationAuthModalComponent } from './condition-investigation/condition-investigation-auth-modal/condition-investigation-auth-modal.component';
import { ConditionInvestigationNewTerminalComponent } from './condition-investigation/condition-investigation-new-terminal/condition-investigation-new-terminal.component';
import { ConditionInvestigationTerminalNewTabComponent } from './condition-investigation/condition-investigation-terminal-new-tab/condition-investigation-terminal-new-tab.component';
import { ConditionInvestigationFloatingTerminalComponent } from './condition-investigation/condition-investigation-floating-terminal/condition-investigation-floating-terminal.component';
import { ConditionInvestigationFloatingTerminalItemComponent } from './condition-investigation/condition-investigation-floating-terminal/condition-investigation-floating-terminal-item/condition-investigation-floating-terminal-item.component';

@NgModule({
  imports: [AppCoreModule, ChartsModule, ResizableModule, PerfectScrollbarModule,
    TypeaheadModule.forRoot(), AppDirectivesModule, AppFiltersModule, AppSharedCrudModule, MarkdownModule],
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
    CreateTicketComponent,
    TextWrapperComponent,
    MultiselectDropdownComponent,
    ImageDropdownComponent,
    MultiSelectSearchFilter,
    DashboardSharedTcktMgmtComponent,
    TcktMgmtComponent,
    FloatingTerminalComponent,
    AssetOnboardingStatusComponent,
    SharedDeviceStatusComponent,
    SelfHelpPopupComponent,
    DataRefreshBtnComponent,
    TablePagerComponent,
    TablePageSizeComponent,
    TableEntriesComponent,
    NowTcktMgmtComponent,
    NowDashboardTcktMgmtComponent,
    AppSearchComponent,
    MsDynamicsTcktMgmtComponent,
    MsDynamicsDashboardTcktMgmtComponent,
    DeviceZabbixEmailNotificationComponent,
    TableSearchBoxComponent,
    UnityRoundedTabComponent,
    TooltipForWrappedTextDirective,
    CustomPasswordFieldComponent,
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
    SearchBoxComponent,
    SharedScheduleFormComponent,
    UnityScheduleComponent,
    AimlAlertDetailsComponent,
    AimlEventDetailsComponent,
    SharedInterfaceDetailsComponent,
    UnitySelectDropdownComponent,
    JsonComparisonComponent,
    CustomDateDropdownComponent,
    VmBackupHistoryComponent,
    SearchDropdownComponent,
    NowEnhancedTicketDetailsComponent,
    AutoCompleteMultiComponent,
    DevicesFileUploadComponent,
    SharedApplicationTopologyComponent,
    AppDirectivesModule,
    AppFiltersModule,
    AppSharedCrudModule
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
    ReportIssueComponent,
    CreateTicketComponent,
    TextWrapperComponent,
    MultiselectDropdownComponent,
    ImageDropdownComponent,
    MultiSelectSearchFilter,
    DashboardSharedTcktMgmtComponent,
    TcktMgmtComponent,
    TicketDetailsComponent,
    FloatingTerminalComponent,
    AssetOnboardingStatusComponent,
    SharedDeviceStatusComponent,
    SelfHelpPopupComponent,
    TeminalItemComponent,
    DataRefreshBtnComponent,
    TablePagerComponent,
    TablePageSizeComponent,
    TableEntriesComponent,
    NowTcktMgmtComponent,
    NowDashboardTcktMgmtComponent,
    NowTicketDetailsComponent,
    AppSearchComponent,
    MsDynamicsTcktMgmtComponent,
    MsDynamicsDashboardTcktMgmtComponent,
    MsDynamicsTcktDetailsComponent,
    DeviceZabbixEmailNotificationComponent,
    TableSearchBoxComponent,
    UnityRoundedTabComponent,
    TooltipForWrappedTextDirective,
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
    SearchBoxComponent,
    SharedScheduleFormComponent,
    UnityScheduleComponent,
    AimlAlertDetailsComponent,
    AimlEventDetailsComponent,
    UnityLeaderLineComponent,
    SharedInterfaceDetailsComponent,
    ImageDropdownComponent,
    UnitySelectDropdownComponent,
    JsonComparisonComponent,
    UnityCodeEditorComponent,
    SearchDropdownComponent,
    NowEnhancedTicketDetailsComponent,
    AutoCompleteMultiComponent,
    AceEditorComponent,
    PyodideEditorComponent,
    DevicesFileUploadComponent,
    SharedApplicationTopologyComponent,
    CustomPasswordFieldComponent,
    CustomDateDropdownComponent,
    VmBackupHistoryComponent,
    ConditionInvestigationComponent,
    ConditionInvestigationChatbotComponent,
    ConditionInvestigationZabbixGraphsComponent,
    ConditionInvestigationNetworkTopologyComponent,
    ConditionInvestigationAuthModalComponent,
    ConditionInvestigationNewTerminalComponent,
    ConditionInvestigationTerminalNewTabComponent,
    ConditionInvestigationFloatingTerminalComponent,
    ConditionInvestigationFloatingTerminalItemComponent,
  ],
  providers: [
    CookieService,
    UnitedCloudSharedService
  ]
})
export class SharedModule {
}
