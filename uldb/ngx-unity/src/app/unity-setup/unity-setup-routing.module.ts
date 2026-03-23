import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitySetupLdapCrudComponent } from '../shared/unity-setup-ldap-crud/unity-setup-ldap-crud.component';
import { DiscoveryCredentialsComponent } from './discovery-credentials/discovery-credentials.component';
import { UnitySetupBudgetCrudComponent } from './unity-setup-budget/unity-setup-budget-crud/unity-setup-budget-crud.component';
import { UnitySetupBudgetDetailsComponent } from './unity-setup-budget/unity-setup-budget-details/unity-setup-budget-details.component';
import { UnitySetupBudgetComponent } from './unity-setup-budget/unity-setup-budget.component';
import { UnitySetupConnectionsCrudComponent } from './unity-setup-connections/unity-setup-connections-crud/unity-setup-connections-crud.component';
import { UnitySetupConnectionsComponent } from './unity-setup-connections/unity-setup-connections.component';
import { UscpCostModelCrudComponent } from './unity-setup-cost-plan/uscp-cost-model/uscp-cost-model-crud/uscp-cost-model-crud.component';
import { UscpCostModelHistoryComponent } from './unity-setup-cost-plan/uscp-cost-model/uscp-cost-model-history/uscp-cost-model-history.component';
import { UscpCostModelComponent } from './unity-setup-cost-plan/uscp-cost-model/uscp-cost-model.component';
import { UscpResourceModelCrudComponent } from './unity-setup-cost-plan/uscp-resource-model/uscp-resource-model-crud/uscp-resource-model-crud.component';
import { UscpResourceModelHistoryComponent } from './unity-setup-cost-plan/uscp-resource-model/uscp-resource-model-history/uscp-resource-model-history.component';
import { UscpResourceModelComponent } from './unity-setup-cost-plan/uscp-resource-model/uscp-resource-model.component';
import { UscpResourcePvtcloudMappingCrudComponent } from './unity-setup-cost-plan/uscp-resource-pvtcloud-mapping/uscp-resource-pvtcloud-mapping-crud/uscp-resource-pvtcloud-mapping-crud.component';
import { UscpResourcePvtcloudMappingHistoryComponent } from './unity-setup-cost-plan/uscp-resource-pvtcloud-mapping/uscp-resource-pvtcloud-mapping-history/uscp-resource-pvtcloud-mapping-history.component';
import { UscpResourcePvtcloudMappingComponent } from './unity-setup-cost-plan/uscp-resource-pvtcloud-mapping/uscp-resource-pvtcloud-mapping.component';
import { UnitySetupCustomAttributesCrudComponent } from './unity-setup-custom-attributes/unity-setup-custom-attributes-crud/unity-setup-custom-attributes-crud.component';
import { UnitySetupCustomAttributesComponent } from './unity-setup-custom-attributes/unity-setup-custom-attributes.component';
import { UnitySetupLdapConfigComponent } from './unity-setup-ldap-config/unity-setup-ldap-config.component';
import { UnitySetupLdapUserImportComponent } from './unity-setup-ldap-config/unity-setup-ldap-user-import/unity-setup-ldap-user-import.component';
import { UnitySetupNotificationGroupComponent } from './unity-setup-notification-group/unity-setup-notification-group.component';
import { UNITY_SETUP_USER_MGMT_ROUTES } from './unity-setup-user-mgmt/unity-setup-user-mgmt-routing.const';
import { UnitySetupUserMgmtComponent } from './unity-setup-user-mgmt/unity-setup-user-mgmt.component';
import { UNITY_SETUP_CREDENTIALS_ROUTES } from './unity-setup-credentials/unity-setup-credentials-routing.const';
import { UnitySetupFinopsComponent } from './unity-setup-finops/unity-setup-finops.component';
import { UsfCrudComponent } from './unity-setup-finops/usf-crud/usf-crud.component';
import { UsfDeviceMappingComponent } from './unity-setup-finops/usf-device-mapping/usf-device-mapping.component';
import { UnitySetupQueryStatisticsComponent } from './unity-setup-query-statistics/unity-setup-query-statistics.component';
import { UnitySetupPolicyComponent } from './unity-setup-policy/unity-setup-policy.component';
import { UnitySetupPolicyCrudComponent } from './unity-setup-policy/unity-setup-policy-crud/unity-setup-policy-crud.component';
import { UnitySetupPolicyEvaluationsComponent } from './unity-setup-policy/unity-setup-policy-evaluations/unity-setup-policy-evaluations.component';
import { UnitySetupPolicyPoliciesComponent } from './unity-setup-policy/unity-setup-policy-policies/unity-setup-policy-policies.component';
import { UnitySetupPolicyPoliciesCrudComponent } from './unity-setup-policy/unity-setup-policy-policies/unity-setup-policy-policies-crud/unity-setup-policy-policies-crud.component';
import { UnitySetupNotificationGroupCrudComponent } from './unity-setup-notification-group/unity-setup-notification-group-crud/unity-setup-notification-group-crud.component';

const routes: Routes = [
  // {
  //   path: 'users',
  //   component: UnitySetupUserMgmtComponent,
  //   data: {
  //     breadcrumb: {
  //       title: 'Users'
  //     }
  //   }
  // },
  {
    path: 'user-mgmt',
    component: UnitySetupUserMgmtComponent,
    data: {
      breadcrumb: {
        title: 'User Management'
      }
    },
    children: [
      ...UNITY_SETUP_USER_MGMT_ROUTES
    ]
  },
  {
    path: 'devices',
    data: {
      breadcrumb: {
        title: ''
      }
    },
    loadChildren: () => import('src/app/unity-setup/unity-setup-on-boarding/unity-setup-on-boarding.module').then(m => m.UnitySetupOnBoardingModule)
  },
  // {
  //   path: 'importuser',
  //   component: UnitySetupImportUserComponent,
  //   data: {
  //     breadcrumb: {
  //       title: 'Import User'
  //     }
  //   }
  // },
  {
    path: 'ldap-config',
    component: UnitySetupLdapConfigComponent,
    data: {
      breadcrumb: {
        title: 'LDAP Config'
      }
    }
  },
  {
    path: 'ldap-config/create',
    component: UnitySetupLdapCrudComponent,
    data: {
      breadcrumb: {
        title: 'LDAP Config Create'
      }
    }
  },
  {
    path: 'ldap-config/:ldapConfigId/edit',
    component: UnitySetupLdapCrudComponent,
    data: {
      breadcrumb: {
        title: 'LDAP Config Edit'
      }
    }
  },
  {
    path: 'ldap-config/:ldapConfigId/ldap-user-import',
    component: UnitySetupLdapUserImportComponent,
    data: {
      breadcrumb: {
        title: 'LDAP User Import'
      }
    }
  },
  {
    path: 'integration',
    data: {
      breadcrumb: {
        title: ''
      }
    },
    loadChildren: () => import('src/app/unity-setup/unity-setup-integration/unity-setup-integration.module').then(m => m.UnitySetupIntegrationModule)
  },
  {
    path: 'monitoring',
    data: {
      breadcrumb: {
        title: ''
      }
    },
    loadChildren: () => import('src/app/unity-setup/unity-setup-monitoring/unity-setup-monitoring.module').then(m => m.UnitySetupMonitoringModule)
  },
  {
    path: 'notificationgroups',
    component: UnitySetupNotificationGroupComponent,
    data: {
      breadcrumb: {
        title: 'Alert Notification'
      }
    }
  },
  {
    path: 'notificationgroups/add',
    component: UnitySetupNotificationGroupCrudComponent,
    data: {
      breadcrumb: {
        title: 'Add Alert Notification'
      }
    }
  },
  {
    path: 'notificationgroups/:groupId/edit',
    component: UnitySetupNotificationGroupCrudComponent,
    data: {
      breadcrumb: {
        title: 'Edit Alert Notification'
      }
    }
  },
  ...UNITY_SETUP_CREDENTIALS_ROUTES,
  {
    path: 'credential',
    component: DiscoveryCredentialsComponent,
    data: {
      breadcrumb: {
        title: 'Credentials'
      }
    }
  },
  {
    path: 'credentials',
    component: DiscoveryCredentialsComponent,
    data: {
      breadcrumb: {
        title: 'Credentials'
      }
    }
  },
  {
    path: 'cost-plan/cost-model',
    component: UscpCostModelComponent,
    data: {
      breadcrumb: {
        title: 'Cost Model'
      }
    }
  },
  {
    path: 'cost-plan/cost-model/create',
    component: UscpCostModelCrudComponent,
    data: {
      breadcrumb: {
        title: 'Cost Model Create'
      }
    }
  },
  {
    path: 'cost-plan/cost-model/:costModelId/edit',
    component: UscpCostModelCrudComponent,
    data: {
      breadcrumb: {
        title: 'Cost Model Update'
      }
    }
  },
  {
    path: 'cost-plan/cost-model/:costModelId/history',
    component: UscpCostModelHistoryComponent,
    data: {
      breadcrumb: {
        title: 'Cost Model History'
      }
    }
  },
  {
    path: 'cost-plan/resource-model',
    component: UscpResourceModelComponent,
    data: {
      breadcrumb: {
        title: 'Resource Model'
      }
    }
  },
  {
    path: 'cost-plan/resource-model/create',
    component: UscpResourceModelCrudComponent,
    data: {
      breadcrumb: {
        title: 'Resource Model Create'
      }
    }
  },
  {
    path: 'cost-plan/resource-model/:resourceId/edit',
    component: UscpResourceModelCrudComponent,
    data: {
      breadcrumb: {
        title: 'Resource Model Update'
      }
    }
  },
  {
    path: 'cost-plan/resource-model/:resourceId/history',
    component: UscpResourceModelHistoryComponent,
    data: {
      breadcrumb: {
        title: 'Resource Model History'
      }
    }
  },
  {
    path: 'cost-plan/resource-mapping/:resourceId',
    component: UscpResourcePvtcloudMappingComponent,
    data: {
      breadcrumb: {
        title: 'Resource Mapped'
      }
    }
  },
  {
    path: 'cost-plan/resource-mapping/:resourceId/create',
    component: UscpResourcePvtcloudMappingCrudComponent,
    data: {
      breadcrumb: {
        title: 'Create Resource Mapping'
      }
    }
  },
  {
    path: 'cost-plan/resource-mapping/:resourceId/history/:mapingId',
    component: UscpResourcePvtcloudMappingHistoryComponent,
    data: {
      breadcrumb: {
        title: 'Create Resource Mapping'
      }
    }
  },
  // {
  //   path: 'cost-plan/resource-mapping/:resourceId/edit',
  //   component: UscpResourcePvtcloudMappingCrudComponent,
  //   data: {
  //     breadcrumb: {
  //       title: 'Update Resource Mapping'
  //     }
  //   }
  // },
  {
    path: 'budget',
    data: {
      breadcrumb: {
      }
    },
    children: [
      {
        path: '',
        component: UnitySetupBudgetComponent,
        data: {
          breadcrumb: {
            title: 'Budget'
          }
        }
      },
      {
        path: 'create',
        component: UnitySetupBudgetCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create Budget'
          }
        }
      },
      {
        path: ':budgetId/edit',
        component: UnitySetupBudgetCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit Budget'
          }
        }
      },
      {
        path: ':budgetId/details',
        component: UnitySetupBudgetDetailsComponent,
        data: {
          breadcrumb: {
            title: 'Budget Details'
          }
        }
      }
    ]
  },
  {
    path: 'connections',
    component: UnitySetupConnectionsComponent,
    data: {
      breadcrumb: {
        title: 'Connections'
      }
    }
  },
  {
    path: 'connections/create',
    component: UnitySetupConnectionsCrudComponent,
    data: {
      breadcrumb: {
        title: 'Connections'
      }
    }
  },
  {
    path: 'connections/:connectionId/update',
    component: UnitySetupConnectionsCrudComponent,
    data: {
      breadcrumb: {
        title: 'Connections'
      }
    }
  },
  {
    path: 'custom-attributes',
    component: UnitySetupCustomAttributesComponent,
    data: {
      breadcrumb: {
        title: 'Custom Attributes'
      }
    }
  },
  {
    path: 'custom-attributes/create',
    component: UnitySetupCustomAttributesCrudComponent,
    data: {
      breadcrumb: {
        title: 'Custom Attribute Create'
      }
    }
  },
  {
    path: 'custom-attributes/:attrId/edit',
    component: UnitySetupCustomAttributesCrudComponent,
    data: {
      breadcrumb: {
        title: 'Custom Attribute Update'
      }
    }
  },
  //added for finops routing
  {
    path: 'finops',
    data: {
      breadcrumb: {
        title: 'FinOps'
      }
    },
    loadChildren: () => import('src/app/unity-setup/unity-setup-finops/unity-setup-finops.module').then(m => m.UnitySetupFinopsModule)
  },
  {
    path: 'query-statistics',
    component: UnitySetupQueryStatisticsComponent,
    data: {
      breadcrumb: {
        title: 'Query Statistics'
      }
    }
  },
  {
    path: 'policy',
    component: UnitySetupPolicyComponent,
    data: {
      breadcrumb: {
        title: 'Policy'
      }
    },
    children: [
      {
        path: 'policies',
        component: UnitySetupPolicyPoliciesComponent,
        data: {
          breadcrumb: {
            title: 'Policies'
          }
        }
      },
      {
        path: 'policies/create',
        component: UnitySetupPolicyPoliciesCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create Policy'
          }
        }
      },
      {
        path: 'policies/:policyId/edit',
        component: UnitySetupPolicyPoliciesCrudComponent,
        data: {
          breadcrumb: {
            title: 'Edit Policy'
          }
        }
      },
      {
        path: 'evaluations',
        component: UnitySetupPolicyEvaluationsComponent,
        data: {
          breadcrumb: {
            title: 'Evaluations'
          }
        }
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitySetupRoutingModule { }
