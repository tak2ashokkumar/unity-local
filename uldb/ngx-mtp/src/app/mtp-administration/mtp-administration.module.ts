import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';

import { MptAdministrationComponent } from './mpt-administration.component';
import { MonitoringTemplateComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/monitoring-template.component';
import { TemplateGraphsComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/template-graphs/template-graphs.component';
import { TemplateMetricsComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/template-metrics/template-metrics.component';
import { TemplateTriggersComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/template-triggers/template-triggers.component';
import { MonitoringTemplatesComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-templates.component';
import { MtpAdministrationMonitoringComponent } from './mtp-administration-monitoring/mtp-administration-monitoring.component';
import { MtpAdministrationRoutingModule } from './mtp-administration-routing.module';
import { MtpAdministrationAutoRemediationComponent } from './mtp-administration-service-mgmt/mtp-administration-auto-remediation/mtp-administration-auto-remediation.component';
import { MtpAdministrationAutoTicketComponent } from './mtp-administration-service-mgmt/mtp-administration-auto-ticket/mtp-administration-auto-ticket.component';
import { MtpAdministrationNotificationComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification.component';
import { MtpAdministrationServiceLevelAgreementComponent } from './mtp-administration-service-mgmt/mtp-administration-service-level-agreement/mtp-administration-service-level-agreement.component';
import { MtpAdministrationServiceMgmtComponent } from './mtp-administration-service-mgmt/mtp-administration-service-mgmt.component';
import { MtpAdministrationGroupCrudComponent } from './mtp-administration-user-mgmt/mtp-administration-group/mtp-administration-group-crud/mtp-administration-group-crud.component';
import { MtpAdministrationGroupComponent } from './mtp-administration-user-mgmt/mtp-administration-group/mtp-administration-group.component';
import { MtpAdministrationProfileComponent } from './mtp-administration-user-mgmt/mtp-administration-profile/mtp-administration-profile.component';
import { MtpAdministrationRolesComponent } from './mtp-administration-user-mgmt/mtp-administration-roles/mtp-administration-roles.component';
import { MtpAdministrationUserMgmtComponent } from './mtp-administration-user-mgmt/mtp-administration-user-mgmt.component';
import { MtpAdministrationUsersCrudComponent } from './mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.component';
import { MtpAdministrationUsersComponent } from './mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { MtpAdministrationIntegrationsComponent } from './mtp-administration-integrations/mtp-administration-integrations.component';
import { MtpAdministrationSlaGroupComponent } from './mtp-administration-service-mgmt/mtp-administration-sla-group/mtp-administration-sla-group.component';
import { MtpAdministrationSlaGroupCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-sla-group/mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.component';
import { MtpAdministrationSlaCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-service-level-agreement/mtp-administration-sla-crud/mtp-administration-sla-crud.component';
import { TemplateAllTriggersComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/template-all-triggers/template-all-triggers.component';
import { TriggerCrudComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/trigger-crud/trigger-crud.component';
import { MtpAdministrationNotificationGroupCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification-group-crud/mtp-administration-notification-group-crud.component';
import { AzureCrudComponent } from './mtp-administration-integrations/azure-crud/azure-crud.component';
import { AzureDetailsComponent } from './mtp-administration-integrations/azure-details/azure-details.component';
import { AzureCrudService } from './mtp-administration-integrations/azure-crud/azure-crud.service';
import { MtpAdministrationUsersImportComponent } from './mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users-import/mtp-administration-users-import.component';
import { MtpAdministrationNotificationEventCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification-event-crud/mtp-administration-notification-event-crud.component';
import { MtpAdministrationNotificationEmailComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification-email/mtp-administration-notification-email.component';
import { ServicenowCrudComponent } from './mtp-administration-integrations/servicenow-crud/servicenow-crud.component';
import { ServicenowDetailsComponent } from './mtp-administration-integrations/servicenow-details/servicenow-details.component';
import { ServicenowIreRulesComponent } from './mtp-administration-integrations/servicenow-ire-rules/servicenow-ire-rules.component';


@NgModule({
  declarations: [
    MptAdministrationComponent,
    MtpAdministrationUserMgmtComponent,
    MtpAdministrationUsersComponent,
    MtpAdministrationGroupComponent,
    MtpAdministrationRolesComponent,
    MtpAdministrationProfileComponent,
    MtpAdministrationUsersCrudComponent,
    MtpAdministrationGroupCrudComponent,
    MtpAdministrationServiceMgmtComponent,
    MtpAdministrationServiceLevelAgreementComponent,
    MtpAdministrationNotificationComponent,
    MtpAdministrationAutoTicketComponent,
    MtpAdministrationAutoRemediationComponent,
    MtpAdministrationMonitoringComponent,
    MonitoringTemplatesComponent,
    MonitoringTemplateComponent,
    TemplateMetricsComponent,
    TemplateTriggersComponent,
    TemplateGraphsComponent,
    MtpAdministrationIntegrationsComponent,
    MtpAdministrationSlaGroupComponent,
    MtpAdministrationSlaGroupCrudComponent,
    MtpAdministrationSlaCrudComponent,
    TemplateAllTriggersComponent,
    TriggerCrudComponent,
    MtpAdministrationNotificationGroupCrudComponent,
    AzureCrudComponent,
    AzureDetailsComponent,
    MtpAdministrationUsersImportComponent,
    MtpAdministrationNotificationEventCrudComponent,
    MtpAdministrationNotificationEmailComponent,
    ServicenowCrudComponent,
    ServicenowDetailsComponent,
    ServicenowIreRulesComponent
  ],
  imports: [
    CommonModule,
    MtpAdministrationRoutingModule,
    AppCoreModule,
    SharedModule,
    CollapseModule,
    TypeaheadModule.forRoot()
  ],
  providers:[AzureCrudService]
})
export class MtpAdministrationModule { }
