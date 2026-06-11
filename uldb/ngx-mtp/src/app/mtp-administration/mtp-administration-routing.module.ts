import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MtpAdministrationIntegrationsComponent } from './mtp-administration-integrations/mtp-administration-integrations.component';
import { MonitoringTemplateComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/monitoring-template.component';
import { TemplateAllTriggersComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/template-all-triggers/template-all-triggers.component';
import { TemplateGraphsComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/template-graphs/template-graphs.component';
import { TemplateMetricsComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/template-metrics/template-metrics.component';
import { TriggerCrudComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-template/trigger-crud/trigger-crud.component';
import { MonitoringTemplatesComponent } from './mtp-administration-monitoring/monitoring-templates/monitoring-templates.component';
import { MtpAdministrationMonitoringComponent } from './mtp-administration-monitoring/mtp-administration-monitoring.component';
import { MtpAdministrationAutoRemediationComponent } from './mtp-administration-service-mgmt/mtp-administration-auto-remediation/mtp-administration-auto-remediation.component';
import { MtpAdministrationAutoTicketComponent } from './mtp-administration-service-mgmt/mtp-administration-auto-ticket/mtp-administration-auto-ticket.component';
import { MtpAdministrationNotificationGroupCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification-group-crud/mtp-administration-notification-group-crud.component';
import { MtpAdministrationNotificationComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification.component';
import { MtpAdministrationServiceLevelAgreementComponent } from './mtp-administration-service-mgmt/mtp-administration-service-level-agreement/mtp-administration-service-level-agreement.component';
import { MtpAdministrationSlaCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-service-level-agreement/mtp-administration-sla-crud/mtp-administration-sla-crud.component';
import { MtpAdministrationServiceMgmtComponent } from './mtp-administration-service-mgmt/mtp-administration-service-mgmt.component';
import { MtpAdministrationSlaGroupCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-sla-group/mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.component';
import { MtpAdministrationSlaGroupComponent } from './mtp-administration-service-mgmt/mtp-administration-sla-group/mtp-administration-sla-group.component';
import { MTP_ADMINISTRATION_GROUPS_ROUTES } from './mtp-administration-user-mgmt/mtp-administration-group/mtp-administration-group-routing.const';
import { MtpAdministrationProfileComponent } from './mtp-administration-user-mgmt/mtp-administration-profile/mtp-administration-profile.component';
import { MtpAdministrationRolesComponent } from './mtp-administration-user-mgmt/mtp-administration-roles/mtp-administration-roles.component';
import { MtpAdministrationUserMgmtComponent } from './mtp-administration-user-mgmt/mtp-administration-user-mgmt.component';
import { MTP_ADMINISTRATION_USERS_ROUTES } from './mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users-routing.const';
import { MTPModules } from '../app-level.service';
import { AzureDetailsComponent } from './mtp-administration-integrations/azure-details/azure-details.component';
import { MtpAdministrationNotificationEventCrudComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification-event-crud/mtp-administration-notification-event-crud.component';
import { MtpAdministrationNotificationEmailComponent } from './mtp-administration-service-mgmt/mtp-administration-notification/mtp-administration-notification-email/mtp-administration-notification-email.component';
import { ServicenowDetailsComponent } from './mtp-administration-integrations/servicenow-details/servicenow-details.component';
import { ServicenowCrudComponent } from './mtp-administration-integrations/servicenow-crud/servicenow-crud.component';
import { ServicenowIreRulesComponent } from './mtp-administration-integrations/servicenow-ire-rules/servicenow-ire-rules.component';


const routes: Routes = [
  {
    path: 'usermgmt',
    component: MtpAdministrationUserMgmtComponent,
    data: {
      breadcrumb: {
        title: 'User Management'
      },
      module: MTPModules.USER_MANAGEMENT
    },
    children: [
      ...MTP_ADMINISTRATION_USERS_ROUTES,
      ...MTP_ADMINISTRATION_GROUPS_ROUTES,
      {
        path: 'roles',
        component: MtpAdministrationRolesComponent
      },
      {
        path: 'profile',
        component: MtpAdministrationProfileComponent
      }
    ]
  },
  {
    path: 'servicemgmt',
    component: MtpAdministrationServiceMgmtComponent,
    data: {
      breadcrumb: {
        title: 'Service Management'
      },
      module: MTPModules.SERVICE_MANAGEMENT
    },
    children: [
      {
        path: 'sla',
        children: [
          {
            path: 'group',
            component: MtpAdministrationSlaGroupComponent
          },
          {
            path: 'group/crud',
            component: MtpAdministrationSlaGroupCrudComponent,
          },
          {
            path: 'items',
            component: MtpAdministrationServiceLevelAgreementComponent
          },
          {
            path: 'items/crud',
            component: MtpAdministrationSlaCrudComponent,
          }
        ]
      },
      {
        path: 'notification-group',
        component: MtpAdministrationNotificationComponent,
      },
      // {
      //   path: 'notification-group/create',
      //   component: MtpAdministrationNotificationGroupCrudComponent,
      // },
      // {
      //   path: 'notification-group/:groupId',
      //   component: MtpAdministrationNotificationGroupCrudComponent,
      // },
      {
        path: 'notification-group/create',
        component: MtpAdministrationNotificationEventCrudComponent,
      },
      {
        path: 'notification-group/:eventId',
        component: MtpAdministrationNotificationEventCrudComponent,
      },
      {
        path: 'notification-group/:eventId/email',
        component: MtpAdministrationNotificationEmailComponent,
      },
      {
        path: 'auto-ticketing',
        component: MtpAdministrationAutoTicketComponent,
      },
      {
        path: 'auto-remediation',
        component: MtpAdministrationAutoRemediationComponent,
      }
    ]
  },
  {
    path: 'monitoring',
    component: MtpAdministrationMonitoringComponent,
    data: {
      breadcrumb: {
        title: 'Monitoring'
      },
      module: MTPModules.MONITORING_MANAGEMENT
    },
    children: [
      {
        path: 'templates',
        component: MonitoringTemplatesComponent
      },
      {
        path: 'templates/:id',
        component: MonitoringTemplateComponent,
        children: [
          {
            path: 'metrics',
            component: TemplateMetricsComponent
          },
          {
            path: 'triggers',
            component: TemplateAllTriggersComponent
          },
          {
            path: 'triggers/create',
            component: TriggerCrudComponent
          },
          {
            path: 'triggers/:triggerId',
            component: TriggerCrudComponent
          },
          {
            path: 'graphs',
            component: TemplateGraphsComponent
          }
        ]
      },
      {
        path: 'templates/:id/component/:componentId',
        component: MonitoringTemplateComponent,
        children: [
          {
            path: 'metrics',
            component: TemplateMetricsComponent
          },
          {
            path: 'triggers',
            component: TemplateAllTriggersComponent
          },
          {
            path: 'triggers/create',
            component: TriggerCrudComponent
          },
          {
            path: 'triggers/:triggerId',
            component: TriggerCrudComponent
          },
          {
            path: 'graphs',
            component: TemplateGraphsComponent
          }
        ]
      },
    ]
  },
  {
    path: 'integration',
    component: MtpAdministrationIntegrationsComponent,
  },
  {
    path: 'integration/azure',
    component: AzureDetailsComponent
  },
  {
    path: 'integration/servicenow',
    component: ServicenowDetailsComponent
  },
  {
    path: 'integration/servicenow/add',
    component: ServicenowCrudComponent
  },
  {
    path: 'integration/servicenow/:id',
    component: ServicenowCrudComponent
  },
  {
    path: 'integration/servicenow/:id/IRERules',
    component: ServicenowIreRulesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MtpAdministrationRoutingModule { }
