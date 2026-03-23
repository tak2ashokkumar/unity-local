import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZABBIX_FIREWALLS_ROUTES } from '../united-cloud/shared/firewalls/firewalls-zabbix/firewalls-zabbix-routing.const';
import { FirewallsZabbixComponent } from '../united-cloud/shared/firewalls/firewalls-zabbix/firewalls-zabbix.component';
import { ZABBIX_LOADBALANCERS_ROUTES } from '../united-cloud/shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix-routing.const';
import { LoadbalancersZabbixComponent } from '../united-cloud/shared/loadbalancers/loadbalancers-zabbix/loadbalancers-zabbix.component';
import { ZABBIX_SWITCH_ROUTES } from '../united-cloud/shared/switches/switches-zabbix/switches-zabbix-routing.const';
import { SwitchesZabbixComponent } from '../united-cloud/shared/switches/switches-zabbix/switches-zabbix.component';
import { AI_AGENTS_ROUTES } from './ai-agents/ai-agents-routing.const';
import { AI_OBSERVABILITY_ROUTES } from './ai-observability/ai-observability-routing.const';
import { AimlAlertsComponent } from './aiml-event-mgmt/aiml-alerts/aiml-alerts.component';
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
import { NcCompareComponent } from './network-configuration/nc-compare/nc-compare.component';
import { NcConfigureComponent } from './network-configuration/nc-configure/nc-configure.component';
import { NcDeviceGroupsCrudComponent } from './network-configuration/nc-device-groups/nc-device-groups-crud/nc-device-groups-crud.component';
import { NcDeviceGroupsComponent } from './network-configuration/nc-device-groups/nc-device-groups.component';
import { NcHistoryComponent } from './network-configuration/nc-history/nc-history.component';
import { NcStatusComponent } from './network-configuration/nc-status/nc-status.component';
import { NetworkConfigurationComponent } from './network-configuration/network-configuration.component';
import { NetworkDeviceDetailsComponent } from './network-summary/network-device-details/network-device-details.component';
import { NetworkInterfaceComponent } from './network-summary/network-interface/network-interface.component';
import { NetworkSummaryComponent } from './network-summary/network-summary.component';
import { ORCHESTRATION_ROUTES } from './orchestration/orchestration-routing.const';
import { CATALOG_ROUTES } from './service-catalog/service-catalog-routing.const';
import { ServiceCatalogComponent } from './service-catalog/service-catalog.component';
import { UnityLogMgmtServicesComponent } from './unity-log-mgmt-services/unity-log-mgmt-services.component';
import { UnityNtaServicesComponent } from './unity-nta-services/unity-nta-services.component';
import { VmBackupComponent } from './vm-backup/vm-backup.component';
import { VmMigrationComponent } from './vm-migration/vm-migration.component';

const routes: Routes = [
  {
    path: 'devopscontroller',
    component: DevopsAsServicesComponent,
    data: {
      breadcrumb: {
        title: 'Devops Controller',
      },
    },
  },
  ...ORCHESTRATION_ROUTES,
  {
    path: 'vmmigration',
    component: VmMigrationComponent,
    data: {
      breadcrumb: {
        title: 'VM Migration',
      },
    },
  },
  {
    path: 'vmbackup',
    component: VmBackupComponent,
    data: {
      breadcrumb: {
        title: 'VM Backup',
      },
    },
  },
  // {
  //   path: 'catalog',
  //   component: ServiceCatalogueComponent,
  //   data: {
  //     breadcrumb: {
  //       title: 'Service Catalog',
  //     },
  //   },
  //   children: [
  //     {
  //       path: 'subscribed',
  //       component: SubscribedCatalogueServicesComponent,
  //       data: {
  //         breadcrumb: {
  //           title: 'Subscribed Services',
  //           stepbackCount: 0,
  //         },
  //       },
  //     },
  //     {
  //       path: 'all',
  //       component: AllCatalogueServicesComponent,
  //       data: {
  //         breadcrumb: {
  //           title: 'All Services',
  //           stepbackCount: 0,
  //         },
  //       },
  //     },
  //   ],
  // },
  {
    path: 'service-catalog',
    component: ServiceCatalogComponent,
    data: {
      breadcrumb: {
        title: 'Service Catalog',
      },
    },
  },
  ...CATALOG_ROUTES,
  {
    path: 'aiml',
    component: AimlComponent,
    data: {
      breadcrumb: {
        title: 'AIML',
      },
    },
    children: [
      {
        path: 'summary',
        component: AimlSummaryComponent,
        data: {
          breadcrumb: {
            title: 'Summary',
          },
        },
      },
      {
        path: 'analytics',
        component: AimlAnalyticsComponent,
        data: {
          breadcrumb: {
            title: 'Analytics',
          },
        },
      },
      {
        path: 'analytics/event-analytics',
        component: AimlAnalyticsEventsComponent,
        data: {
          breadcrumb: {
            title: 'Event Analytics',
          },
        },
      },
      {
        path: 'analytics/noisy-events',
        component: AimlNoisyEventsComponent,
        data: {
          breadcrumb: {
            title: 'Noisy Events',
          },
        },
      },
    ],
  },
  {
    path: 'aiml-summary',
    component: AimlSummaryComponent,
    data: {
      breadcrumb: {
        title: 'AIML Event Management Summary',
      },
    },
  },
  {
    path: 'aiml-event-mgmt',
    component: AimlEventMgmtComponent,
    data: {
      breadcrumb: {
        title: 'AIML',
      },
    },
    children: [
      {
        path: 'events',
        component: AimlEventsComponent,
        data: {
          breadcrumb: {
            title: 'Events',
          },
        },
      },
      {
        path: 'alerts',
        component: AimlAlertsComponent,
        data: {
          breadcrumb: {
            title: 'Alerts',
          },
        },
      },
      {
        path: 'conditions',
        component: AimlConditionsComponent,
        data: {
          breadcrumb: {
            title: 'Alerts',
          },
        },
      },
      {
        path: 'conditions/:id',
        component: AimlConditionsComponent,
        data: {
          breadcrumb: {
            title: 'Alerts',
          },
        },
      },
    ],
  },
  {
    path: 'aiml/rules',
    component: AimlRulesComponent,
    children: [
      {
        path: 'suppressionrules',
        component: AimlSuppressionRulesComponent,
        data: {
          breadcrumb: {
            title: 'Suppression Rules',
          },
        },
      },
      {
        path: 'suppressionrules/create',
        component: AimlSuppressionRuleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'suppressionrules/:ruleId',
        component: AimlSuppressionRuleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Update',
          },
        },
      },
      {
        path: 'firstresponsepolicies',
        component: FirstResponsePolicyComponent,
        data: {
          breadcrumb: {
            title: 'First Response Policies',
          },
        },
      },
      {
        path: 'firstresponsepolicies/create',
        component: FirstResponsePolicyCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'firstresponsepolicies/:policyId',
        component: FirstResponsePolicyCrudComponent,
        data: {
          breadcrumb: {
            title: 'Update',
          },
        },
      },
      {
        path: 'correlationrules',
        component: AimlCorrelationRulesComponent,
        data: {
          breadcrumb: {
            title: 'Correlation Rules',
          },
        },
      },
      {
        path: 'correlationrules/create',
        component: AimlCorrelationRuleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'correlationrules/:ruleId',
        component: AimlCorrelationRuleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'event-types',
        component: SourceEventTypesComponent,
        data: {
          breadcrumb: {
            title: 'Event Types',
          },
        },
      },
      {
        path: 'event-categories',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Event Categories',
          },
        },
      },
      {
        path: 'nagios',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Nagios',
          },
        },
      },
      {
        path: 'azure',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Azure',
          },
        },
      },
      {
        path: 'zabbix',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Zabbix',
          },
        },
      },
      {
        path: 'gcp',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Gcp',
          },
        },
      },
      {
        path: 'aws',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Aws',
          },
        },
      },
      {
        path: 'oci',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Oci',
          },
        },
      },
      {
        path: 'opsramp',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'OpsRamp',
          },
        },
      },
      {
        path: 'solarwinds',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'SolarWinds',
          },
        },
      },
      {
        path: 'appdynamics',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'AppDynamics',
          },
        },
      },
      {
        path: 'logicmonitor',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'LogicMonitor',
          },
        },
      },
      {
        path: 'dynatrace',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'Dynatrace',
          },
        },
      },
      {
        path: 'new-relic',
        component: SourceEventCategoriesComponent,
        data: {
          breadcrumb: {
            title: 'NewRelic',
          },
        },
      }
    ],
  },
  {
    path: 'network-infrastructure',
    component: NetworkSummaryComponent,
    data: {
      breadcrumb: {
        title: 'Network Infrastructure Summary',
      },
    },
  },
  {
    path: 'network-infrastructure/:nsId/interface',
    component: NetworkInterfaceComponent,
    data: {
      breadcrumb: {
        title: 'Interface',
      },
    },
  },
  {
    path: 'network-infrastructure/switches/:deviceid/zbx',
    component: NetworkDeviceDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Device Details',
      },
    },
    children: ZABBIX_SWITCH_ROUTES
  },
  {
    path: 'network-infrastructure/firewalls/:deviceid/zbx',
    component: NetworkDeviceDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Device Details',
      },
    },
    children: ZABBIX_FIREWALLS_ROUTES
  },
  {
    path: 'network-infrastructure/load-balancers/:deviceid/zbx',
    component: NetworkDeviceDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Device Details',
      },
    },
    children: ZABBIX_LOADBALANCERS_ROUTES
  },
  {
    path: 'network-configuration',
    component: NetworkConfigurationComponent,
    data: {
      breadcrumb: {
        title: 'Network Configuration',
      },
    },
    children: [
      {
        path: 'status',
        component: NcStatusComponent,
        data: {
          breadcrumb: {
            title: 'Status',
          },
        },
      },
      {
        path: 'status/switch/:deviceid/zbx',
        component: SwitchesZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Switches',
            stepbackCount: 3
          }
        },
        children: ZABBIX_SWITCH_ROUTES
      },
      {
        path: 'status/firewalls/:deviceid/zbx',
        component: FirewallsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Firewalls',
            stepbackCount: 3
          }
        },
        children: ZABBIX_FIREWALLS_ROUTES
      },
      {
        path: 'status/load-balancers/:deviceid/zbx',
        component: LoadbalancersZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Load Balancers',
            stepbackCount: 3
          }
        },
        children: ZABBIX_LOADBALANCERS_ROUTES
      },
      {
        path: 'status/:deviceType/:deviceId/history',
        component: NcHistoryComponent,
        data: {
          breadcrumb: {
            title: 'History',
          },
        },
      },
      {
        path: 'status/:deviceType/:deviceId/history/:historyId/compare',
        component: NcCompareComponent,
        data: {
          breadcrumb: {
            title: 'History',
          },
        },
      },
      {
        path: 'configure',
        component: NcConfigureComponent,
        data: {
          breadcrumb: {
            title: 'Configure',
          },
        },
      },
      {
        path: 'device-groups',
        component: NcDeviceGroupsComponent,
        data: {
          breadcrumb: {
            title: 'Device Groups',
          },
        }
      },
      {
        path: 'device-groups/add',
        component: NcDeviceGroupsCrudComponent,
        data: {
          breadcrumb: {
            title: 'Add',
          },
        }
      },
      {
        path: 'device-groups/:device-groupId/edit',
        component: NcDeviceGroupsCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit',
          },
        }
      },
      {
        path: 'history',
        component: NcHistoryComponent,
        data: {
          breadcrumb: {
            title: 'History',
          },
        },
      },
      {
        path: 'compare',
        component: NcCompareComponent,
        data: {
          breadcrumb: {
            title: 'Compare',
          },
        },
      },
    ]
  },
  ...AI_OBSERVABILITY_ROUTES,
  {
    path: 'knowledge-management',
    data: {
      breadcrumb: {
        title: 'Knowledge Management',
        stepbackCount: 0,
      }
    },
    loadChildren: () =>
      import('./knowledge-management/knowledge-management.module').then(m => m.KnowledgeManagementModule)

  },
  ...AI_AGENTS_ROUTES,
  {
    path: 'nta',
    component: UnityNtaServicesComponent,
    data: {
      breadcrumb: {
        title: 'Network Traffic Analyzer',
      },
    },
  },
  {
    path: 'log-management',
    component: UnityLogMgmtServicesComponent,
    data: {
      breadcrumb: {
        title: 'Log Management',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnityServicesRoutingModule { }
