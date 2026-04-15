import { NgModule } from '@angular/core';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { UnitedCloudSharedModule } from '../united-cloud/shared/united-cloud-shared.module';
import { AimlAlertsComponent } from './aiml-event-mgmt/aiml-alerts/aiml-alerts.component';
import { AimlConditionDetailsComponent } from './aiml-event-mgmt/aiml-condition-details/aiml-condition-details.component';
import { AimlConditionDetailsService } from './aiml-event-mgmt/aiml-condition-details/aiml-condition-details.service';
import { AimlConditionsComponent } from './aiml-event-mgmt/aiml-conditions/aiml-conditions.component';
import { AimlEventMgmtComponent } from './aiml-event-mgmt/aiml-event-mgmt.component';
import { AimlEventsComponent } from './aiml-event-mgmt/aiml-events/aiml-events.component';
import { AimlCorrelationRuleCrudComponent } from './aiml-event-mgmt/aiml-rules/aiml-correlation-rule-crud/aiml-correlation-rule-crud.component';
import { AimlCorrelationRulesComponent } from './aiml-event-mgmt/aiml-rules/aiml-correlation-rules/aiml-correlation-rules.component';
import { AimlRulesComponent } from './aiml-event-mgmt/aiml-rules/aiml-rules.component';
import { AimlSuppressionRuleCrudComponent } from './aiml-event-mgmt/aiml-rules/aiml-suppression-rule-crud/aiml-suppression-rule-crud.component';
import { AimlSuppressionRulesComponent } from './aiml-event-mgmt/aiml-rules/aiml-suppression-rules/aiml-suppression-rules.component';
import { FirstResponsePolicyCrudComponent } from './aiml-event-mgmt/aiml-rules/first-response-policy-crud/first-response-policy-crud.component';
import { FirstResponsePolicyComponent } from './aiml-event-mgmt/aiml-rules/first-response-policy/first-response-policy.component';
import { SourceEventCategoriesComponent } from './aiml-event-mgmt/aiml-rules/source-event-categories/source-event-categories.component';
import { SourceEventTypesComponent } from './aiml-event-mgmt/aiml-rules/source-event-types/source-event-types.component';
import { AimlSummaryComponent } from './aiml-summary/aiml-summary.component';
import { AimlAnalyticsEventsComponent } from './aiml/aiml-analytics-events/aiml-analytics-events.component';
import { AimlAnalyticsComponent } from './aiml/aiml-analytics/aiml-analytics.component';
import { AimlNoisyEventsComponent } from './aiml/aiml-noisy-events/aiml-noisy-events.component';
import { AimlComponent } from './aiml/aiml.component';
import { DevopsAsServicesComponent } from './devops-as-services/devops-as-services.component';
import { GreenITModule } from './green-it/green-it.module';
import { NetworkDeviceDetailsComponent } from './network-summary/network-device-details/network-device-details.component';
import { NetworkInterfaceComponent } from './network-summary/network-interface/network-interface.component';
import { NetworkSummaryComponent } from './network-summary/network-summary.component';
import { OrchestrationIntegrationDetailsHistoryComponent } from './orchestration/orchestration-integration/orchestration-integration-details/orchestration-integration-details-history/orchestration-integration-details-history.component';
import { OrchestrationIntegrationDetailsPlaybookComponent } from './orchestration/orchestration-integration/orchestration-integration-details/orchestration-integration-details-playbook/orchestration-integration-details-playbook.component';
import { OrchestrationIntegrationDetailsComponent } from './orchestration/orchestration-integration/orchestration-integration-details/orchestration-integration-details.component';
import { OrchestrationIntegrationComponent } from './orchestration/orchestration-integration/orchestration-integration.component';
import { OrchestrationTasksComponent } from './orchestration/orchestration-tasks/orchestration-tasks.component';
import { OrchestrationComponent } from './orchestration/orchestration.component';
import { PlatformNotSupportedComponent } from './platform-not-supported/platform-not-supported.component';
import { AllCatalogueServicesComponent } from './service-catalogue/all-catalogue-services/all-catalogue-services.component';
import { ServiceCatalogueComponent } from './service-catalogue/service-catalogue.component';
import { SubscribedCatalogueServicesComponent } from './service-catalogue/subscribed-catalogue-services/subscribed-catalogue-services.component';
import { UnityServicesRoutingModule } from './unity-services-routing.module';
import { UnityServicesComponent } from './unity-services.component';
import { OpenstackVmBackupComponent } from './vm-backup/openstack-vm-backup/openstack-vm-backup.component';
import { VmBackupComponent } from './vm-backup/vm-backup.component';
import { VmwareVmBackupComponent } from './vm-backup/vmware-vm-backup/vmware-vm-backup.component';
import { OpenstackVmMigrationComponent } from './vm-migration/openstack-vm-migration/openstack-vm-migration.component';
import { VmMigrationComponent } from './vm-migration/vm-migration.component';
import { VmwareVmMigrationComponent } from './vm-migration/vmware-vm-migration/vmware-vm-migration.component';
import { OrchestrationTasksCrudComponent } from './orchestration/orchestration-tasks/orchestration-tasks-crud/orchestration-tasks-crud.component';
import { OrchestrationTaskExecuteComponent } from './orchestration/orchestration-tasks/orchestration-task-execute/orchestration-task-execute.component';
import { OrchestrationWorkflowsComponent } from './orchestration/orchestration-workflows/orchestration-workflows.component';
import { OrchestrationWorkflowCrudComponent } from './orchestration/orchestration-workflows/orchestration-workflow-crud/orchestration-workflow-crud.component';
import { OrchestrationWorkflowExecutionComponent } from './orchestration/orchestration-workflows/orchestration-workflow-execution/orchestration-workflow-execution.component';
import { OrchestrationExecutionsComponent } from './orchestration/orchestration-executions/orchestration-executions.component';
import { OrchestrationExecutionsTaskLogsComponent } from './orchestration/orchestration-executions/orchestration-executions-task-logs/orchestration-executions-task-logs.component';
import { OrchestrationTasksScheduleComponent } from './orchestration/orchestration-tasks/orchestration-tasks-schedule/orchestration-tasks-schedule.component';
import { OrchestrationWorkflowCrudPocComponent } from './orchestration/orchestration-workflows/orchestration-workflow-crud-poc/orchestration-workflow-crud-poc.component';
import { SequentialWorkflowDesignerModule } from 'sequential-workflow-designer-angular';
import { OrchestrationExecutionsWorkflowLogsComponent } from './orchestration/orchestration-executions/orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.component';
import { OrchestrationExecutionLogsWorkflowWidgetComponent } from './orchestration/orchestration-executions/orchestration-execution-logs-workflow-widget/orchestration-execution-logs-workflow-widget.component';

import { OrchestrationWorkflowScheduleComponent } from './orchestration/orchestration-workflows/orchestration-workflow-schedule/orchestration-workflow-schedule.component';
import { OrchestrationInputTemplateComponent } from './orchestration/orchestration-input-template/orchestration-input-template.component';
import { OrchestrationInputCrudComponent } from './orchestration/orchestration-input-template/orchestration-input-crud/orchestration-input-crud.component';
import { ImageMappingComponent } from './orchestration/image-mapping/image-mapping.component';
import { ImageMappingCrudComponent } from './orchestration/image-mapping/image-mapping-crud/image-mapping-crud.component';
import { ServiceCatalogComponent } from './service-catalog/service-catalog.component';
import { ServiceCatalogProvisioningComponent } from './service-catalog/service-catalog-provisioning/service-catalog-provisioning.component';
import { ServiceCatalogProvisioningCrudComponent } from './service-catalog/service-catalog-provisioning/service-catalog-provisioning-crud/service-catalog-provisioning-crud.component';
import { ServiceCatalogProvisioningOrdersCrudComponent } from './service-catalog/service-catalog-provisioning/service-catalog-provisioning-orders-crud/service-catalog-provisioning-orders-crud.component';
import { ServiceCatalogOrdersComponent } from './service-catalog/service-catalog-orders/service-catalog-orders.component';
import { NetworkConfigurationComponent } from './network-configuration/network-configuration.component';
import { NcStatusComponent } from './network-configuration/nc-status/nc-status.component';
import { NcConfigureComponent } from './network-configuration/nc-configure/nc-configure.component';
import { NcHistoryComponent } from './network-configuration/nc-history/nc-history.component';
import { NcCompareComponent } from './network-configuration/nc-compare/nc-compare.component';
import { EchartsxModule } from 'echarts-for-angular';
import { OrchestrationSummaryComponent } from './orchestration/orchestration-summary/orchestration-summary.component';
import { OrchestrationIntegrationDetailsCrudComponent } from './orchestration/orchestration-integration/orchestration-integration-details/orchestration-integration-details-crud/orchestration-integration-details-crud.component';
import { OrchestrationIntegrationDetailsActivitylogsComponent } from './orchestration/orchestration-integration/orchestration-integration-details/orchestration-integration-details-activitylogs/orchestration-integration-details-activitylogs.component';
import { TitleCasePipe } from '@angular/common';
import { NcDeviceGroupsComponent } from './network-configuration/nc-device-groups/nc-device-groups.component';
import { NcDeviceGroupsCrudComponent } from './network-configuration/nc-device-groups/nc-device-groups-crud/nc-device-groups-crud.component';
import { AiObservabilityComponent } from './ai-observability/ai-observability.component';
import { AiObservabilityLlmComponent } from './ai-observability/ai-observability-llm/ai-observability-llm.component';
import { AiObservabilityGpuComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu.component';
import { AiObservabilityVectorDbComponent } from './ai-observability/ai-observability-vector-db/ai-observability-vector-db.component';
import { OrchestrationWorkflowPocComponent } from './orchestration/orchestration-workflows/orchestration-workflow-poc/orchestration-workflow-poc.component';
import { OrchestrationExecutionLogsNewWorkflowWidgetComponent } from './orchestration/orchestration-executions/orchestration-execution-logs-new-workflow-widget/orchestration-execution-logs-new-workflow-widget.component';
import { AiObservabilityLlmServicesComponent } from './ai-observability/ai-observability-llm/ai-observability-llm-services/ai-observability-llm-services.component';
import { AiObservabilityGpuServicesComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-services.component';
import { AiObservabilityVectorDbServicesComponent } from './ai-observability/ai-observability-vector-db/ai-observability-vector-db-services/ai-observability-vector-db-services.component';
import { AiObservabilityLlmZabbixComponent } from './ai-observability/ai-observability-llm/ai-observability-llm-services/ai-observability-llm-zabbix/ai-observability-llm-zabbix.component';
import { AiObservabilityLlmDetailsComponent } from './ai-observability/ai-observability-llm/ai-observability-llm-services/ai-observability-llm-zabbix/ai-observability-llm-details/ai-observability-llm-details.component';
import { AiObservabilityLlmTracesComponent } from './ai-observability/ai-observability-llm/ai-observability-llm-services/ai-observability-llm-zabbix/ai-observability-llm-traces/ai-observability-llm-traces.component';
import { AiObservabilityVectorDbServiceZabbixComponent } from './ai-observability/ai-observability-vector-db/ai-observability-vector-db-services/ai-observability-vector-db-service-zabbix/ai-observability-vector-db-service-zabbix.component';
import { AiObservabilityVectorDbServiceDetailsComponent } from './ai-observability/ai-observability-vector-db/ai-observability-vector-db-services/ai-observability-vector-db-service-zabbix/ai-observability-vector-db-service-details/ai-observability-vector-db-service-details.component';
import { AiObservabilityVectorDbServiceTracesComponent } from './ai-observability/ai-observability-vector-db/ai-observability-vector-db-services/ai-observability-vector-db-service-zabbix/ai-observability-vector-db-service-traces/ai-observability-vector-db-service-traces.component';
import { AiObservabilityGpuServiceZabbixComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-service-zabbix/ai-observability-gpu-service-zabbix.component';
import { AiObservabilityGpuServiceDetailsComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-service-zabbix/ai-observability-gpu-service-details/ai-observability-gpu-service-details.component';
import { AiObservabilityGpuServiceGraphsComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-service-zabbix/ai-observability-gpu-service-graphs/ai-observability-gpu-service-graphs.component';
import { AiObservabilityGpuServiceGraphsCrudComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-service-zabbix/ai-observability-gpu-service-graphs-crud/ai-observability-gpu-service-graphs-crud.component';
import { AiObservabilityVectorDbSummaryComponent } from './ai-observability/ai-observability-vector-db/ai-observability-vector-db-summary/ai-observability-vector-db-summary.component';
import { AiObservabilityLlmSummaryComponent } from './ai-observability/ai-observability-llm/ai-observability-llm-summary/ai-observability-llm-summary.component';
import { AiObservabilityGpuSummaryComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu-summary/ai-observability-gpu-summary.component';
import { AiObservabilityGpuServiceMetricesComponent } from './ai-observability/ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-service-zabbix/ai-observability-gpu-service-metrices/ai-observability-gpu-service-metrices.component';
import { OrchestrationAgenticWorkflowContainerComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.component';
import { OrchestrationAgenticWorkflowParamsComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-params/orchestration-agentic-workflow-params.component';
import { OrchestrationWorkflowAgenticLeftMenuComponent } from './orchestration/orchestration-workflows/orchestration-workflow-agentic-left-menu/orchestration-workflow-agentic-left-menu.component';
import { OrchestrationAgenticWorkflowManualTriggerComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-manual-trigger/orchestration-agentic-workflow-manual-trigger.component';
import { OrchestrationAgenticWorkflowScheduleTriggerComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-schedule-trigger/orchestration-agentic-workflow-schedule-trigger.component';
import { OrchestrationWorkflowsOnChatComponent } from './orchestration/orchestration-workflows/orchestration-workflows-on-chat/orchestration-workflows-on-chat.component';
import { MarkdownModule } from 'ngx-markdown';
import { AiAgentsComponent } from './ai-agents/ai-agents.component';
import { AiAgentsNetworkAgentComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent.component';
import { AiAgentsFinopsAgentComponent } from './ai-agents/ai-agents-finops-agent/ai-agents-finops-agent.component';
import { AiAgentsItsmAgentComponent } from './ai-agents/ai-agents-itsm-agent/ai-agents-itsm-agent.component';
import { AiAgentsNetworkAgentDashboardComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/ai-agents-network-agent-dashboard.component';
import { AiAgentsNetworkAgentNetworkAgentHubComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-network-agent-hub/ai-agents-network-agent-network-agent-hub.component';
import { OrchestrationWorkflowAgenticRightMenuComponent } from './orchestration/orchestration-workflows/orchestration-workflow-agentic-right-menu/orchestration-workflow-agentic-right-menu.component';
import { UnityNtaServicesComponent } from './unity-nta-services/unity-nta-services.component';
import { UnityLogMgmtServicesComponent } from './unity-log-mgmt-services/unity-log-mgmt-services.component';
import { OrchestrationAgenticWorkflowWebhookTriggerComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-webhook-trigger/orchestration-agentic-workflow-webhook-trigger.component';
import { OrchestrationAgenticWorkflowVariablesComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-variables/orchestration-agentic-workflow-variables.component';
import { OrchestrationWorkflowExecuteComponent } from './orchestration/orchestration-workflows/orchestration-workflow-execute/orchestration-workflow-execute.component';
import { OrchestrationAgenticWorkflowItsmTriggerComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-itsm-trigger/orchestration-agentic-workflow-itsm-trigger.component';
import { NetworkAgentConditionsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-conditions.component';
import { NetworkAgentEventsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-events/network-agent-events.component';
import { NetworkAgentAlertsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-alerts/network-agent-alerts.component';
import { NetworkAgentConditionInvestigationComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/network-agent-condition-investigation.component';
import { NaciChatbotComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-chatbot/naci-chatbot.component';
import { NaciCliCheckStepsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-cli-check-steps/naci-cli-check-steps.component';
import { CcsVerifyAndAuditStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-cli-check-steps/ccs-verify-and-audit-step/ccs-verify-and-audit-step.component';
import { CcsRootCauseAnalysisStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-cli-check-steps/ccs-root-cause-analysis-step/ccs-root-cause-analysis-step.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { CcsRemediationScriptStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-cli-check-steps/ccs-remediation-script-step/ccs-remediation-script-step.component';
import { CcsValidateFixStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-cli-check-steps/ccs-validate-fix-step/ccs-validate-fix-step.component';
import { CcsDocumentAndCloseStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-cli-check-steps/ccs-document-and-close-step/ccs-document-and-close-step.component';
import { OrchestrationAgenticWorkflowAimlTriggerComponent } from './orchestration/orchestration-workflows/orchestration-agentic-workflow-aiml-trigger/orchestration-agentic-workflow-aiml-trigger.component';
import { NaciResourceUtilizationStepsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-resource-utilization-steps/naci-resource-utilization-steps.component';
import { RusVerifyAndAuditStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-resource-utilization-steps/rus-verify-and-audit-step/rus-verify-and-audit-step.component';
import { RusRemediationScriptStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-resource-utilization-steps/rus-remediation-script-step/rus-remediation-script-step.component';
import { RusRootCauseAnalysisStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-resource-utilization-steps/rus-root-cause-analysis-step/rus-root-cause-analysis-step.component';
import { RusValidateFixStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-resource-utilization-steps/rus-validate-fix-step/rus-validate-fix-step.component';
import { RusDocumentAndCloseStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-resource-utilization-steps/rus-document-and-close-step/rus-document-and-close-step.component';
import { NaciMonitoringComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-monitoring/naci-monitoring.component';
import { MonitoringVerifyAndAuditStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-monitoring/monitoring-verify-and-audit-step/monitoring-verify-and-audit-step.component';
import { MonitoringValidateFixStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-monitoring/monitoring-validate-fix-step/monitoring-validate-fix-step.component';
import { MonitoringRemediationScriptStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-monitoring/monitoring-remediation-script-step/monitoring-remediation-script-step.component';
import { MonitoringRootCauseAnalysisStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-monitoring/monitoring-root-cause-analysis-step/monitoring-root-cause-analysis-step.component';
import { MonitoringDocumentAndCloseStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-monitoring/monitoring-document-and-close-step/monitoring-document-and-close-step.component';
import { NaciCheckDeviceHealthStepsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-check-device-health-steps/naci-check-device-health-steps.component';
import { CdhDocumentAndCloseStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-check-device-health-steps/cdh-document-and-close-step/cdh-document-and-close-step.component';
import { CdhRemediationScriptStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-check-device-health-steps/cdh-remediation-script-step/cdh-remediation-script-step.component';
import { CdhRootCauseAnalysisStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-check-device-health-steps/cdh-root-cause-analysis-step/cdh-root-cause-analysis-step.component';
import { CdhValidateFixStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-check-device-health-steps/cdh-validate-fix-step/cdh-validate-fix-step.component';
import { CdhVerifyAndAuditStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-check-device-health-steps/cdh-verify-and-audit-step/cdh-verify-and-audit-step.component';
import { NaciCentralizedLogsStepsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-centralized-logs-steps/naci-centralized-logs-steps.component';
import { ClsVerifyAndAuditStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-centralized-logs-steps/cls-verify-and-audit-step/cls-verify-and-audit-step.component';
import { ClsDocumentAndCloseStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-centralized-logs-steps/cls-document-and-close-step/cls-document-and-close-step.component';
import { ClsRemediationScriptStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-centralized-logs-steps/cls-remediation-script-step/cls-remediation-script-step.component';
import { ClsRootCauseAnalysisStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-centralized-logs-steps/cls-root-cause-analysis-step/cls-root-cause-analysis-step.component';
import { ClsValidateFixStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-centralized-logs-steps/cls-validate-fix-step/cls-validate-fix-step.component';
import { NaciNetworkTopologyStepsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-network-topology-steps/naci-network-topology-steps.component';
import { NtVerifyAndAuditStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-network-topology-steps/nt-verify-and-audit-step/nt-verify-and-audit-step.component';
import { NtDocumentAndCloseStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-network-topology-steps/nt-document-and-close-step/nt-document-and-close-step.component';
import { NtRemediationScriptStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-network-topology-steps/nt-remediation-script-step/nt-remediation-script-step.component';
import { NtRootCauseAnalysisStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-network-topology-steps/nt-root-cause-analysis-step/nt-root-cause-analysis-step.component';
import { NtValidateFixStepComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-network-topology-steps/nt-validate-fix-step/nt-validate-fix-step.component';
import { NaciCentralizedLogsStepsService } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-centralized-logs-steps/naci-centralized-logs-steps.service';
import { NaciResourceUtilizationStepsService } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-resource-utilization-steps/naci-resource-utilization-steps.service';
import { NaciMonitoringService } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-monitoring/naci-monitoring.service';
import { NaciNetworkTopologyStepsService } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-network-topology-steps/naci-network-topology-steps.service';
import { NaciCheckDeviceHealthStepsService } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-check-device-health-steps/naci-check-device-health-steps.service';
import { NaciCliCheckStepsService } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-cli-check-steps/naci-cli-check-steps.service';
import { NaciZabbixGraphsComponent } from './ai-agents/ai-agents-network-agent/ai-agents-network-agent-dashboard/network-agent-conditions/network-agent-condition-investigation/naci-zabbix-graphs/naci-zabbix-graphs.component';
/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};


@NgModule({
  declarations: [
    DevopsAsServicesComponent,
    UnityServicesComponent,
    VmMigrationComponent,
    VmwareVmMigrationComponent,
    OpenstackVmMigrationComponent,
    PlatformNotSupportedComponent,
    VmBackupComponent,
    VmwareVmBackupComponent,
    OpenstackVmBackupComponent,
    ServiceCatalogueComponent,
    SubscribedCatalogueServicesComponent,
    AllCatalogueServicesComponent,
    AimlEventMgmtComponent,
    AimlEventsComponent,
    AimlAlertsComponent,
    AimlConditionsComponent,
    AimlRulesComponent,
    AimlSuppressionRulesComponent,
    AimlCorrelationRulesComponent,
    AimlCorrelationRuleCrudComponent,
    AimlSuppressionRuleCrudComponent,
    AimlSummaryComponent,
    AimlConditionDetailsComponent,
    AimlComponent,
    AimlAnalyticsComponent,
    AimlAnalyticsEventsComponent,
    AimlNoisyEventsComponent,
    OrchestrationComponent,
    OrchestrationIntegrationComponent,
    OrchestrationTasksComponent,
    OrchestrationIntegrationDetailsComponent,
    OrchestrationIntegrationDetailsPlaybookComponent,
    OrchestrationIntegrationDetailsHistoryComponent,
    SourceEventTypesComponent,
    FirstResponsePolicyComponent,
    FirstResponsePolicyCrudComponent,
    SourceEventCategoriesComponent,
    NetworkSummaryComponent,
    NetworkInterfaceComponent,
    NetworkDeviceDetailsComponent,
    OrchestrationTasksCrudComponent,
    OrchestrationTaskExecuteComponent,
    OrchestrationWorkflowsComponent,
    OrchestrationWorkflowCrudComponent,
    OrchestrationWorkflowExecutionComponent,
    OrchestrationExecutionsComponent,
    OrchestrationExecutionsTaskLogsComponent,
    OrchestrationExecutionsComponent,
    OrchestrationTasksScheduleComponent,
    OrchestrationWorkflowCrudPocComponent,
    OrchestrationExecutionsWorkflowLogsComponent,
    OrchestrationExecutionLogsWorkflowWidgetComponent,
    OrchestrationWorkflowScheduleComponent,
    OrchestrationInputTemplateComponent,
    OrchestrationInputCrudComponent,
    ImageMappingComponent,
    ImageMappingCrudComponent,
    ServiceCatalogComponent,
    ServiceCatalogProvisioningComponent,
    ServiceCatalogProvisioningCrudComponent,
    ServiceCatalogProvisioningOrdersCrudComponent,
    ServiceCatalogOrdersComponent,
    NetworkConfigurationComponent,
    NcStatusComponent,
    NcConfigureComponent,
    NcHistoryComponent,
    NcCompareComponent,
    OrchestrationSummaryComponent,
    OrchestrationIntegrationDetailsCrudComponent,
    OrchestrationIntegrationDetailsActivitylogsComponent,
    NcDeviceGroupsComponent,
    NcDeviceGroupsCrudComponent,
    OrchestrationWorkflowPocComponent,
    OrchestrationExecutionLogsNewWorkflowWidgetComponent,
    AiObservabilityComponent,
    AiObservabilityLlmComponent,
    AiObservabilityGpuComponent,
    AiObservabilityVectorDbComponent,
    AiObservabilityLlmServicesComponent,
    AiObservabilityGpuServicesComponent,
    AiObservabilityVectorDbServicesComponent,
    AiObservabilityLlmZabbixComponent,
    AiObservabilityLlmDetailsComponent,
    AiObservabilityLlmTracesComponent,
    AiObservabilityVectorDbServiceZabbixComponent,
    AiObservabilityVectorDbServiceDetailsComponent,
    AiObservabilityVectorDbServiceTracesComponent,
    AiObservabilityGpuServiceZabbixComponent,
    AiObservabilityGpuServiceDetailsComponent,
    AiObservabilityGpuServiceGraphsComponent,
    AiObservabilityGpuServiceGraphsCrudComponent,
    AiObservabilityVectorDbSummaryComponent,
    AiObservabilityLlmSummaryComponent,
    AiObservabilityGpuSummaryComponent,
    AiObservabilityGpuServiceMetricesComponent,
    OrchestrationWorkflowPocComponent,
    OrchestrationExecutionLogsNewWorkflowWidgetComponent,
    OrchestrationAgenticWorkflowContainerComponent,
    OrchestrationAgenticWorkflowParamsComponent,
    OrchestrationWorkflowAgenticLeftMenuComponent,
    OrchestrationAgenticWorkflowManualTriggerComponent,
    OrchestrationAgenticWorkflowScheduleTriggerComponent,
    OrchestrationWorkflowsOnChatComponent,
    AiAgentsComponent,
    AiAgentsNetworkAgentComponent,
    AiAgentsFinopsAgentComponent,
    AiAgentsItsmAgentComponent,
    AiAgentsNetworkAgentDashboardComponent,
    AiAgentsNetworkAgentNetworkAgentHubComponent,
    AiAgentsNetworkAgentComponent,
    OrchestrationWorkflowAgenticRightMenuComponent,
    UnityNtaServicesComponent,
    UnityLogMgmtServicesComponent,
    OrchestrationAgenticWorkflowWebhookTriggerComponent,
    OrchestrationAgenticWorkflowVariablesComponent,
    OrchestrationWorkflowExecuteComponent,
    OrchestrationAgenticWorkflowItsmTriggerComponent,
    NetworkAgentConditionsComponent,
    NetworkAgentEventsComponent,
    NetworkAgentAlertsComponent,
    NetworkAgentConditionInvestigationComponent,
    NaciChatbotComponent,
    NaciCliCheckStepsComponent,
    CcsVerifyAndAuditStepComponent,
    CcsRootCauseAnalysisStepComponent,
    CcsRemediationScriptStepComponent,
    CcsValidateFixStepComponent,
    CcsDocumentAndCloseStepComponent,
    OrchestrationAgenticWorkflowAimlTriggerComponent,
    NaciResourceUtilizationStepsComponent,
    RusVerifyAndAuditStepComponent,
    RusRemediationScriptStepComponent,
    RusRootCauseAnalysisStepComponent,
    RusValidateFixStepComponent,
    RusDocumentAndCloseStepComponent,
    NaciMonitoringComponent,
    MonitoringVerifyAndAuditStepComponent,
    MonitoringValidateFixStepComponent,
    MonitoringRemediationScriptStepComponent,
    MonitoringRootCauseAnalysisStepComponent,
    MonitoringDocumentAndCloseStepComponent,
    NaciCheckDeviceHealthStepsComponent,
    CdhDocumentAndCloseStepComponent,
    CdhRemediationScriptStepComponent,
    CdhRootCauseAnalysisStepComponent,
    CdhValidateFixStepComponent,
    CdhVerifyAndAuditStepComponent,
    NaciCentralizedLogsStepsComponent,
    ClsVerifyAndAuditStepComponent,
    ClsDocumentAndCloseStepComponent,
    ClsRemediationScriptStepComponent,
    ClsRootCauseAnalysisStepComponent,
    ClsValidateFixStepComponent,
    NaciNetworkTopologyStepsComponent,
    NtVerifyAndAuditStepComponent,
    NtDocumentAndCloseStepComponent,
    NtRemediationScriptStepComponent,
    NtRootCauseAnalysisStepComponent,
    NtValidateFixStepComponent,
    NaciZabbixGraphsComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnityServicesRoutingModule,
    GreenITModule,
    PerfectScrollbarModule,
    ChartsModule,
    SequentialWorkflowDesignerModule,
    UnitedCloudSharedModule,
    EchartsxModule,
    MarkdownModule,
    CollapseModule,

  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    AimlConditionDetailsService,
    TitleCasePipe,
    NaciCliCheckStepsService,
    NaciCheckDeviceHealthStepsService,
    NaciNetworkTopologyStepsService,
    NaciMonitoringService,
    NaciCentralizedLogsStepsService,
    NaciResourceUtilizationStepsService
  ]
})
export class UnityServicesModule { }
