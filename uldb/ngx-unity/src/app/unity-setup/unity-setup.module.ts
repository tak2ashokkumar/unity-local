import { NgModule } from '@angular/core';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { UnitySetupImportUserComponent } from './unity-setup-import-user/unity-setup-import-user.component';
import { UnitySetupNotificationGroupComponent } from './unity-setup-notification-group/unity-setup-notification-group.component';
import { UnitySetupRoutingModule } from './unity-setup-routing.module';
import { UnitySetupUserMgmtComponent } from './unity-setup-user-mgmt/unity-setup-user-mgmt.component';
import { DiscoveryCredentialsComponent } from './discovery-credentials/discovery-credentials.component';
import { UscpCostModelComponent } from './unity-setup-cost-plan/uscp-cost-model/uscp-cost-model.component';
import { UscpCostModelCrudComponent } from './unity-setup-cost-plan/uscp-cost-model/uscp-cost-model-crud/uscp-cost-model-crud.component';
import { UscpResourceModelComponent } from './unity-setup-cost-plan/uscp-resource-model/uscp-resource-model.component';
import { UscpResourceModelCrudComponent } from './unity-setup-cost-plan/uscp-resource-model/uscp-resource-model-crud/uscp-resource-model-crud.component';
import { UnitySetupCostPlanComponent } from './unity-setup-cost-plan/unity-setup-cost-plan.component';
import { UsumImportUsersComponent } from './unity-setup-user-mgmt/usum-import-users/usum-import-users.component';
import { UscpResourcePvtcloudMappingComponent } from './unity-setup-cost-plan/uscp-resource-pvtcloud-mapping/uscp-resource-pvtcloud-mapping.component';
import { UscpResourcePvtcloudMappingCrudComponent } from './unity-setup-cost-plan/uscp-resource-pvtcloud-mapping/uscp-resource-pvtcloud-mapping-crud/uscp-resource-pvtcloud-mapping-crud.component';
import { UscpResourceModelHistoryComponent } from './unity-setup-cost-plan/uscp-resource-model/uscp-resource-model-history/uscp-resource-model-history.component';
import { UscpCostModelHistoryComponent } from './unity-setup-cost-plan/uscp-cost-model/uscp-cost-model-history/uscp-cost-model-history.component';
import { UscpResourcePvtcloudMappingHistoryComponent } from './unity-setup-cost-plan/uscp-resource-pvtcloud-mapping/uscp-resource-pvtcloud-mapping-history/uscp-resource-pvtcloud-mapping-history.component';
import { UnitySetupConnectionsComponent } from './unity-setup-connections/unity-setup-connections.component';
import { UnitySetupConnectionsCrudComponent } from './unity-setup-connections/unity-setup-connections-crud/unity-setup-connections-crud.component';
import { UsumUsersComponent } from './unity-setup-user-mgmt/usum-users/usum-users.component';
import { UsumUsersCrudComponent } from './unity-setup-user-mgmt/usum-users/usum-users-crud/usum-users-crud.component';
import { UsumUserGroupsComponent } from './unity-setup-user-mgmt/usum-user-groups/usum-user-groups.component';
import { UsumUserGroupsCrudComponent } from './unity-setup-user-mgmt/usum-user-groups/usum-user-groups-crud/usum-user-groups-crud.component';
import { UsumRolesComponent } from './unity-setup-user-mgmt/usum-roles/usum-roles.component';
import { UsumRolesCrudComponent } from './unity-setup-user-mgmt/usum-roles/usum-roles-crud/usum-roles-crud.component';
import { UsumPermissionSetsComponent } from './unity-setup-user-mgmt/usum-permission-sets/usum-permission-sets.component';
import { UsumPermissionSetsCrudComponent } from './unity-setup-user-mgmt/usum-permission-sets/usum-permission-sets-crud/usum-permission-sets-crud.component';
import { UnitySetupLdapConfigComponent } from './unity-setup-ldap-config/unity-setup-ldap-config.component';
import { UnitySetupLdapUserImportComponent } from './unity-setup-ldap-config/unity-setup-ldap-user-import/unity-setup-ldap-user-import.component';
import { UnitySetupBudgetComponent } from './unity-setup-budget/unity-setup-budget.component';
import { UnitySetupBudgetCrudComponent } from './unity-setup-budget/unity-setup-budget-crud/unity-setup-budget-crud.component';
import { UnitySetupBudgetDetailsComponent } from './unity-setup-budget/unity-setup-budget-details/unity-setup-budget-details.component';
import { ChartsModule } from 'ng2-charts';
import { UnitySetupCustomAttributesComponent } from './unity-setup-custom-attributes/unity-setup-custom-attributes.component';
import { UnitySetupCustomAttributesCrudComponent } from './unity-setup-custom-attributes/unity-setup-custom-attributes-crud/unity-setup-custom-attributes-crud.component';
import { UnitySetupCredentialsComponent } from './unity-setup-credentials/unity-setup-credentials.component';
import { UnitySetupCredentialsCrudComponent } from './unity-setup-credentials/unity-setup-credentials-crud/unity-setup-credentials-crud.component';
import { UnitySetupQueryStatisticsComponent } from './unity-setup-query-statistics/unity-setup-query-statistics.component';
import { UnityChatbotModule } from '../unity-chatbot/unity-chatbot.module';
import { EchartsxModule } from 'echarts-for-angular';
import { MarkdownModule } from 'ngx-markdown';
import { UnitySetupPolicyComponent } from './unity-setup-policy/unity-setup-policy.component';
// import { UnitySetupPolicyCrudComponent } from './unity-setup-policy/unity-setup-policy-crud/unity-setup-policy-crud.component';
import { UnitySetupPolicyPoliciesComponent } from './unity-setup-policy/unity-setup-policy-policies/unity-setup-policy-policies.component';
import { UnitySetupPolicyEvaluationsComponent } from './unity-setup-policy/unity-setup-policy-evaluations/unity-setup-policy-evaluations.component';
import { UnitySetupPolicyPoliciesCrudComponent } from './unity-setup-policy/unity-setup-policy-policies/unity-setup-policy-policies-crud/unity-setup-policy-policies-crud.component';
import { UnitySetupNotificationGroupCrudComponent } from './unity-setup-notification-group/unity-setup-notification-group-crud/unity-setup-notification-group-crud.component';
import { UsumEntityGroupComponent } from './unity-setup-user-mgmt/usum-entity-group/usum-entity-group.component';
import { UsumEntityGroupCrudComponent } from './unity-setup-user-mgmt/usum-entity-group/usum-entity-group-crud/usum-entity-group-crud.component';

@NgModule({
  declarations: [
    UnitySetupUserMgmtComponent,
    UnitySetupImportUserComponent,
    UnitySetupNotificationGroupComponent,
    DiscoveryCredentialsComponent,
    UscpCostModelComponent,
    UscpCostModelCrudComponent,
    UscpResourceModelComponent,
    UscpResourceModelCrudComponent,
    UnitySetupCostPlanComponent,
    UsumImportUsersComponent,
    UscpResourcePvtcloudMappingComponent,
    UscpResourcePvtcloudMappingCrudComponent,
    UscpResourceModelHistoryComponent,
    UscpCostModelHistoryComponent,
    UscpResourcePvtcloudMappingHistoryComponent,
    UnitySetupConnectionsComponent,
    UnitySetupConnectionsCrudComponent,
    UsumUsersComponent,
    UsumUsersCrudComponent,
    UsumUserGroupsComponent,
    UsumUserGroupsCrudComponent,
    UsumRolesComponent,
    UsumRolesCrudComponent,
    UsumPermissionSetsComponent,
    UsumPermissionSetsCrudComponent,
    UnitySetupLdapConfigComponent,
    UnitySetupLdapUserImportComponent,
    UscpResourcePvtcloudMappingHistoryComponent,
    UnitySetupBudgetComponent,
    UnitySetupBudgetCrudComponent,
    UnitySetupBudgetDetailsComponent,
    UnitySetupCustomAttributesComponent,
    UnitySetupCustomAttributesCrudComponent,
    UnitySetupCredentialsComponent,
    UnitySetupCredentialsCrudComponent,
    UnitySetupQueryStatisticsComponent,
    UnitySetupPolicyComponent,
    // UnitySetupPolicyCrudComponent,
    UnitySetupPolicyPoliciesComponent,
    UnitySetupPolicyEvaluationsComponent,
    UnitySetupPolicyPoliciesCrudComponent,
    UnitySetupNotificationGroupCrudComponent,
    UsumEntityGroupComponent,
    UsumEntityGroupCrudComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnitySetupRoutingModule,
    ChartsModule,
    EchartsxModule,
    UnityChatbotModule,
    MarkdownModule,
    TypeaheadModule.forRoot(),
  ]
})
export class UnitySetupModule { }
