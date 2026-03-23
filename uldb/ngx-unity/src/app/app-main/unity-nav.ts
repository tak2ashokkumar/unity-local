import { AppLevelService } from "../app-level.service";
import { UnityModules, UnityPermissionSet } from "../app.component";
import { UserInfoService } from "../shared/user-info.service";

export interface UnityNavData {
    name: string;
    url: string;
    icon?: string;
    badge?: any;
    title?: boolean;
    children?: UnityNavData[];
    variant?: string;
    attributes?: object;
    divider?: boolean;
    class?: string;
}

const removeNavItem = (navItems: UnityNavData[], targetItemNames: string[]) => {
    targetItemNames.forEach(t => {
        const itemIndex = navItems.findIndex(n => n.name == t);
        if (itemIndex >= 0) navItems.splice(itemIndex, 1);
    })
    return navItems;
}

const filterRequiredNavItems = (navItem: UnityNavData, svc: AppLevelService) => {
    const moduleNameFromNavItem = navItem.attributes['module'];
    const modulePerms = svc.getAccess(moduleNameFromNavItem);
    if (moduleNameFromNavItem && modulePerms) {
        const viewPermissionName = `View ${moduleNameFromNavItem}`;
        const type = navItem.attributes['type'];

        if (type && type == 'exclude') {
            if (!modulePerms.includes(viewPermissionName)) {
                return navItem;
            }
        } else {
            if (modulePerms.includes(viewPermissionName)) {
                return navItem;
            }
        }
    }
    return;
}

const filterRequiredUnitedCloudNavItems = (navItem: UnityNavData, svc: AppLevelService) => {
    const moduleNameFromNavItem = navItem.attributes['module'];
    if (moduleNameFromNavItem) {
        if (moduleNameFromNavItem instanceof Array) {
            for (let i = 0; i < moduleNameFromNavItem.length; i++) {
                const modulePerms = svc.getAccess(moduleNameFromNavItem[i]);
                if (modulePerms) {
                    const access = navItem.attributes['access'];
                    let viewPermissionName = `${access} ${moduleNameFromNavItem[i]}`;
                    if (modulePerms.includes(viewPermissionName)) {
                        return navItem;
                    }
                }
            }
        } else {
            const modulePerms = svc.getAccess(moduleNameFromNavItem);
            if (modulePerms) {
                const access = navItem.attributes['access'];
                let viewPermissionName = `${access} ${moduleNameFromNavItem}`;
                if (modulePerms.includes(viewPermissionName)) {
                    return navItem;
                }
            }
        }
    }
    return;
}

const filterRequiredUnityCostAnalysisNavItems = (navItem: UnityNavData, svc: AppLevelService) => {
    const moduleNameFromNavItem = navItem.attributes['module'];
    const modulePerms = svc.getAccess(moduleNameFromNavItem);
    if (moduleNameFromNavItem && modulePerms) {
        if (navItem.attributes['permission']) {
            if (modulePerms.includes(navItem.attributes['permission'])) {
                return navItem;
            }
        } else {
            let permissionSet = new UnityPermissionSet(moduleNameFromNavItem);
            if (modulePerms.includes(permissionSet.moduleViewPermission)) {
                return navItem;
            }
        }
    }
    return;
}

const filterRequiredUnitySupportNavItems = (navItem: UnityNavData, svc: AppLevelService) => {
    const moduleNameFromNavItem = navItem.attributes['module'];
    const modulePerms = svc.getAccess(moduleNameFromNavItem);
    if (moduleNameFromNavItem && modulePerms) {
        let permissionSet = new UnityPermissionSet(moduleNameFromNavItem);
        if (modulePerms.includes(permissionSet.moduleViewPermission)) {
            return navItem;
        }
    }
    return;
}

const filterRequiredUnitySetupNavItems = (navItem: UnityNavData, svc: AppLevelService) => {
    const moduleNameFromNavItem = navItem.attributes['module'];
    if (moduleNameFromNavItem) {
        if (moduleNameFromNavItem instanceof Array) {
            for (let i = 0; i < moduleNameFromNavItem.length; i++) {
                const modulePerms = svc.getAccess(moduleNameFromNavItem[i]);
                if (modulePerms) {
                    const access = navItem.attributes['access'];
                    let viewPermissionName = `${access} ${moduleNameFromNavItem[i]}`;
                    if (modulePerms.includes(viewPermissionName)) {
                        return navItem;
                    }
                }
            }
        } else {
            const modulePerms = svc.getAccess(moduleNameFromNavItem);
            if (modulePerms) {
                const access = navItem.attributes['access'];
                let viewPermissionName = `${access} ${moduleNameFromNavItem}`;
                switch (moduleNameFromNavItem) {
                    case UnityModules.USER_MANAGEMENT:
                        viewPermissionName = `${access} Users`;
                        if (modulePerms.includes(viewPermissionName)) {
                            return navItem;
                        }
                        return;
                    default:
                        if (modulePerms.includes(viewPermissionName)) {
                            return navItem;
                        }
                }
            }
        }
    }
    return;
}

const UNITY_SETUP_COST_PLAN_NAV_ITEMS = () => {
    const navItems = [
        {
            name: 'Cost Model',
            url: '/setup/cost-plan/cost-model/',
            variant: 'branched',
        },
        {
            name: 'Resource Model',
            url: '/setup/cost-plan/resource-model/',
            variant: 'branched',
        }
    ]
    return navItems;
}
const UNITY_SETUP_MONITORING_NAV_ITEMS = () => {
    const navItems = [
        {
            name: 'Anomaly Detection',
            url: '/setup/monitoring/anomaly-detection',
            variant: 'branched',
        },
        {
            name: 'Auto Remediation',
            url: '/setup/monitoring/auto-remediation',
            variant: 'branched',
        },
        {
            name: 'Forecast',
            url: '/setup/monitoring/forecast',
            variant: 'branched',
        },
    ]
    return navItems;
}
const UNITY_SETUP_USER_MGMT_NAV_ITEMS = () => {
    const navItems = [
        {
            name: 'Users',
            url: '/setup/user-mgmt/users',
            variant: 'branched',
        },
        {
            name: 'User Groups',
            url: '/setup/user-mgmt/user-groups',
            variant: 'branched',
        },
        {
            name: 'Roles',
            url: '/setup/user-mgmt/roles',
            variant: 'branched',
        },
        {
            name: 'Permission Sets',
            url: '/setup/user-mgmt/permission-sets',
            variant: 'branched',
        },
        {
            name: 'Entity Group',
            url: '/setup/user-mgmt/entity-group',
            variant: 'branched',
        },
    ]
    return navItems;
}
const UNITY_SETUP_NAV_ITEMS = (svc: AppLevelService, orgName: string) => {
    let integrationsMenuName = orgName ? `Integration \u2605` : 'Integration';
    let credentialsMenuName = orgName ? `Secrets Management` : 'Credentials';

    let navItems: UnityNavData[] = [
        {
            name: 'User Management',
            url: '/setup/user-mgmt',
            icon: 'fa fa-users',
            variant: 'branched',
            children: UNITY_SETUP_USER_MGMT_NAV_ITEMS(),
            attributes: {
                module: UnityModules.USER_MANAGEMENT,
                access: 'View'
            }
        },
        {
            name: 'Onboarding',
            url: '/setup/devices',
            icon: 'far fa-file-excel',
            attributes: {
                module: [UnityModules.ONBOARDING, UnityModules.UNITY_COLLECTOR],
                access: 'View'
            }
        },
        {
            name: `${credentialsMenuName}`,
            url: '/setup/credentials',
            icon: 'fas fa-key',
            attributes: {
                module: UnityModules.CREDENTIALS,
                access: 'View'
            }
        },
        {
            name: 'Import LDAP User',
            url: '/setup/ldap-config',
            icon: 'fa fa-users',
            attributes: {
                module: UnityModules.USER_MANAGEMENT,
                access: 'View'
            }
        },
        {
            name: `${integrationsMenuName}`,
            url: '/setup/integration',
            icon: 'fas fa-tools',
            attributes: {
                module: UnityModules.INTEGRATIONS,
                access: 'View'
            }
        },
        {
            name: 'FinOps Building Blocks',
            url: '/setup/finops',
            icon: 'fa fa-users',
            // attributes: {
            //     module: UnityModules.FINOPS,
            //     access: 'Manage'
            // }
        },
        {
            name: 'Monitoring',
            url: '/setup/monitoring',
            icon: 'fas fa-check-double',
            variant: 'branched',
            children: UNITY_SETUP_MONITORING_NAV_ITEMS(),
            attributes: {
                module: UnityModules.MONITORING,
                access: 'Manage'
            }
        },
        {
            name: 'Cost Plan',
            url: '/setup/cost-plan',
            icon: 'fas fa-dollar-sign',
            variant: 'branched',
            children: UNITY_SETUP_COST_PLAN_NAV_ITEMS(),
            attributes: {
                module: UnityModules.COST_PLAN,
                access: 'View'
            }
        },
        {
            name: 'Budget',
            url: '/setup/budget',
            icon: 'fas fa-dollar-sign',
            attributes: {
                module: UnityModules.BUDGET,
                access: 'View'
            }
        },
        {
            name: 'Policy',
            url: '/setup/policy',
            icon: 'fas fa-file-alt',
            // attributes: {
            //     module: UnityModules.POLICY,
            //     access: 'View'
            // }
        },
        {
            name: 'Notification',
            url: '/setup/notificationgroups',
            icon: 'fa fa-bell',
            attributes: {
                module: UnityModules.NOTIFICATIONS,
                access: 'View'
            }
        },
        {
            name: 'Connections',
            url: '/setup/connections',
            icon: 'fas fa-shield-alt',
            attributes: {
                module: UnityModules.CONNECTIONS,
                access: 'View'
            }
        },
        {
            name: 'Custom Attributes',
            url: '/setup/custom-attributes',
            icon: 'fas fa-pen-alt',
            attributes: {
                module: UnityModules.CUSTOM_ATTRIBUTES,
                access: 'View'
            }
        },
        {
            name: 'Query Statistics',
            url: '/setup/query-statistics',
            icon: 'fas fa-poll-h'
        },
    ]
    if (orgName) {
        let removableItems: string[] = ['FinOps Building Blocks', 'Cost Plan', 'Budget', 'Custom Attributes', 'Query Statistics']
        navItems = removeNavItem(navItems, removableItems);
    }
    navItems = navItems.map(nav => nav.attributes ? filterRequiredUnitySetupNavItems(nav, svc) : nav)
    return navItems.filter(n => n);
}
const UNITY_SETUP_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    let menuName = orgName ? `${orgName} Administration` : 'UnitySetup';
    let navItems: UnityNavData = {
        name: `${menuName}`,
        url: '/setup',
        icon: 'fa fa-cogs',
        children: UNITY_SETUP_NAV_ITEMS(svc, orgName),
    }
    return navItems.children && navItems.children.length ? navItems : null;
}


const UNITY_SUPPORT_NAV_ITEMS = (svc: AppLevelService, selfBrandedOrgName: string) => {
    let menuName = selfBrandedOrgName ? `Feedback` : 'Unity Feedback';
    let navItems: UnityNavData[] = [
        {
            name: 'Ticket Management',
            url: '/support/ticketmgmt',
            icon: 'fas fa-ticket-alt',
            attributes: {
                module: UnityModules.TICKET_MANAGEMENT,
            }
        },
        {
            name: `${menuName}`,
            url: '/support/feedback',
            icon: 'fa fa-comments',
        },
        {
            name: 'Maintenance',
            url: '/support/maintenance',
            icon: 'fa cfa-maintenance-date',
            attributes: {
                module: UnityModules.MAINTENENCE,
            }
        },
    ]
    if (!selfBrandedOrgName) {
        navItems = [
            ...navItems,
            {
                name: 'Documentation',
                url: '/support/documentation/userguide',
                icon: 'fa cfa-document',
            }
        ];
    }
    navItems = navItems.map(nav => nav.attributes ? filterRequiredUnitySupportNavItems(nav, svc) : nav);
    return navItems.filter(n => n);
}
const UNITY_SUPPORT_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    let menuName = orgName ? `ITSM` : 'Support';
    const navItems = {
        name: `${menuName}`,
        url: '/support',
        icon: 'far fa-life-ring',
        children: UNITY_SUPPORT_NAV_ITEMS(svc, orgName),
    }
    return navItems.children && navItems.children.length ? navItems : null;
}

const UNITY_REPORT_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    let menuName = orgName ? `Reports` : 'UnityReports';
    const navItems = {
        name: `${menuName}`,
        url: '/reports/manage/new-reports',
        icon: 'far fa-newspaper',
        attributes: {
            module: UnityModules.UNITY_REPORT,
        }
    }
    return filterRequiredNavItems(navItems, svc);
}

const UNITY_COST_ANALYSIS_NAV_ITEMS = (svc: AppLevelService) => {
    let navItems: UnityNavData[] = [
        {
            name: 'Public Cloud',
            url: '/cost-analysis/public-cloud',
            icon: 'fa cfa-public-cloud',
        },
        {
            name: 'Datacenter',
            url: '/cost-analysis/datacenter',
            icon: 'fa cfa-datacenter',
        },
        {
            name: 'Cost Calculator',
            url: '/cost-analysis/cost-calculator',
            icon: 'fa cfa-cost-calculator',
            attributes: {
                module: UnityModules.COST_ANALYSIS,
                permission: 'Cost Calculator'
            }
        },
        {
            name: 'Cloud Overview',
            url: '/cost-analysis/cost-summary',
            icon: 'fa fa-file-excel'
        },
        {
            name: 'Cloud Intelligence',
            url: '/cost-analysis/cost-intelligence',
            icon: 'fas fa-magic',
            // attributes: {
            //     module: UnityModules.FINOPS
            // }
        }
    ]
    navItems = navItems.map(nav => nav.attributes ? filterRequiredUnityCostAnalysisNavItems(nav, svc) : nav);
    return navItems.filter(n => n);
}
const UNITY_COST_ANALYSIS_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    if (orgName) return null;
    let menuName = orgName ? `FINOPS` : 'Cost Analysis';
    const navItems = {
        name: `${menuName}`,
        url: '/cost-analysis',
        icon: 'fas fa-money-check-alt',
        children: UNITY_COST_ANALYSIS_NAV_ITEMS(svc),
        attributes: {
            module: UnityModules.COST_ANALYSIS,
        }
    }
    return filterRequiredUnityCostAnalysisNavItems(navItems, svc);
}

const UNITY_AI_AGENTS_NAV_ITEMS = (svc: AppLevelService, orgName: string) => {
    let finopsMenuName = orgName ? `Security Agent` : 'Finops Agent';
    let ITSMMenuName = orgName ? `NOC Agent` : 'ITSM Agent';
    const navItems = [
        {
            name: 'Network Agent',
            url: '/services/ai-agents/network-agent',
        },
        {
            name: `${finopsMenuName}`,
            url: '/services/ai-agents/finops-agent',
        },
        {
            name: `${ITSMMenuName}`,
            url: '/services/ai-agents/itsm-agent',
        },
    ]
    return navItems;
}

const UNITY_AI_AGENTS_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    let menuName = orgName ? `AI Agents Team` : 'AI Agents';
    const navItems = {
        name: `${menuName}`,
        url: '/services/ai-agents',
        icon: 'fas fa-exchange-alt',
        children: UNITY_AI_AGENTS_NAV_ITEMS(svc, orgName),
    }
    return navItems.children && navItems.children.length ? navItems : null;
}

const UNITY_AI_OBSERVABILITY_NAV_ITEMS = (svc: AppLevelService, orgName: string) => {
    let LLMMenuName = orgName ? `LLM Performance` : 'LLM';
    let VectorDBMenuName = orgName ? `Vector DB Performance` : 'Vector DB';
    let GPUMenuName = orgName ? `GPU Performance` : 'GPU';

    const navItems = [
        {
            name: `${LLMMenuName}`,
            url: '/services/ai-observability/llm',
            variant: 'branched',
        },
        {
            name: `${VectorDBMenuName}`,
            url: '/services/ai-observability/vector-db',
            variant: 'branched',
        },
        {
            name: `${GPUMenuName}`,
            url: '/services/ai-observability/gpu',
            variant: 'branched',
        },
    ]
    return navItems;
}
const UNITY_AI_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    let menuName = orgName ? `AI Performance` : 'AI Observability';
    const navItems = {
        name: `${menuName}`,
        url: '/services/ai-observability',
        icon: 'fas fa-robot',
        children: UNITY_AI_OBSERVABILITY_NAV_ITEMS(svc, orgName),
    }
    return navItems.children && navItems.children.length ? navItems : null;
}
const UNITY_SERVICES_NAV_ITEMS = (svc: AppLevelService, orgName: string, isTenantOrg: boolean) => {
    let orchestrationMenuName = orgName ? `Agentic Orchestration` : 'Devops Automation';
    let navItems: UnityNavData[] = [
        {
            name: 'AIML Event Management',
            url: '/services/aiml',
            icon: 'fas fa-greater-than-equal',
            attributes: {
                module: UnityModules.AIML_EVENT_MANAGEMENT,
            }
        },
        {
            name: `${orchestrationMenuName}`,
            url: '/services/orchestration',
            icon: 'fa cfa-devops-service',
            attributes: {
                module: UnityModules.DEVOPS_AUTOMATION,
            }
        },
        {
            name: 'Service Catalog',
            url: '/services/service-catalog',
            icon: 'fas fa-list',
            attributes: {
                module: UnityModules.SERVICE_CATALOGUE,
            }
        },
        {
            name: 'Sustainability',
            url: '/services/greeenIT/dashboard',
            icon: 'fas fa-leaf',
            attributes: {
                module: UnityModules.SUSTAINABILITY,
            }
        },
        {
            name: 'Network Configuration',
            url: '/services/network-configuration',
            icon: 'fab fa-connectdevelop',
            attributes: {
                module: UnityModules.NCM,
            }
        },
        {
            name: 'Network Traffic Analyzer',
            url: '/services/nta',
            icon: 'fas fa-diagnoses',
        },
        {
            name: 'Log Management',
            url: '/services/log-management',
            icon: 'fas fa-clipboard-list',
        },
    ]
    if (isTenantOrg) {
        navItems = [
            ...navItems,
            {
                name: 'Knowledge Management',
                url: '/services/knowledge-management',
                icon: 'fas fa-brain',
                // attributes: {
                //     module: ,
                // }
            },
        ];
    }
    if (orgName) {
        let removableItems: string[] = ['Sustainability', 'Network Configuration', 'Log Management', 'Knowledge Management']
        navItems = removeNavItem(navItems, removableItems);
    }
    navItems = navItems.map(nav => nav.attributes ? filterRequiredNavItems(nav, svc) : nav)
    return navItems.filter(n => n);
}
const UNITY_SERVICES_NAV_DATA = (svc: AppLevelService, orgName: string, isTenantOrg: boolean) => {
    let menuName = orgName ? `Cloud Intelligence` : 'UnityServices';
    const navItems = {
        name: `${menuName}`,
        url: '/services',
        icon: 'fa cfa-unity-services',
        children: UNITY_SERVICES_NAV_ITEMS(svc, orgName, isTenantOrg)
    }
    return navItems.children && navItems.children.length ? navItems : null;
}

const UNITED_CLOUD_NAV_ITEMS = (svc: AppLevelService, orgName: string) => {
    let publicCloudMenuName = orgName ? `Public Cloud \u2605` : 'Public Cloud';
    let menuName = orgName ? `UnitedConnect®` : 'UnityConnect';
    let navItems: UnityNavData[] = [
        {
            name: 'Private Cloud',
            url: '/unitycloud/pccloud',
            icon: 'fa cfa-private-cloud',
            attributes: {
                module: UnityModules.PRIVATE_CLOUD,
                access: 'View'
            }
        },
        {
            name: `${publicCloudMenuName}`,
            url: '/unitycloud/publiccloud',
            icon: 'fa cfa-public-cloud',
            attributes: {
                module: UnityModules.PUBLIC_CLOUD,
                access: 'View'
            }
        },
        {
            name: `Datacenter`,
            url: '/unitycloud/datacenter',
            icon: 'fa cfa-datacenter',
            attributes: {
                module: UnityModules.DATACENTER,
                access: 'View'
            }
        },
        {
            name: 'Devices',
            url: '/unitycloud/devices',
            icon: 'fa cfa-devices',
            attributes: {
                module: [UnityModules.DATACENTER, UnityModules.PRIVATE_CLOUD],
                access: 'View'
            }
        },
        // {
        //     name: 'Infrastructure',
        //     url: '/unitycloud/infrastructure',
        //     icon: 'fas fa-boxes',
        //     attributes: {
        //         module: [UnityModules.DATACENTER, UnityModules.PRIVATE_CLOUD, UnityModules.PUBLIC_CLOUD],
        //         access: 'View',
        //         isBeta: true
        //     },
        // },
        {
            name: 'Mesh Services',
            url: '/unitycloud/services',
            icon: 'fa fa-table',
            attributes: {
                module: UnityModules.SERVICES,
                access: 'View'
            }
        },
        {
            name: 'Applications',
            url: '/unitycloud/applications',
            icon: 'fa fas fa-cogs',
            attributes: {
                module: UnityModules.SERVICES,
                access: 'View'
            }
        },
        {
            name: 'Business Services',
            url: '/unitycloud/business-service',
            icon: 'fa fas fa-business-time',
            attributes: {
                module: UnityModules.SERVICES,
                access: 'View'
            }
        },
        {
            name: `${menuName}`,
            url: '/unitycloud/connect',
            icon: 'fa cfa-unity-connect',
            attributes: {
                module: UnityModules.UNITY_CONNECT,
                access: 'View'
            }
        },
    ];
    if (orgName) {
        let removableItems: string[] = ['Datacenter', 'Devices', 'Mesh Services'];
        navItems = removeNavItem(navItems, removableItems);
    }
    navItems = navItems.map(nav => nav.attributes ? filterRequiredUnitedCloudNavItems(nav, svc) : nav)
    return navItems.filter(n => n);
}
const UNITED_CLOUD_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    let menuName = orgName ? `Cloud Management` : 'UnityCloud';
    const navItems = {
        name: `${menuName}`,
        url: '/unitycloud',
        icon: 'fa fa-cloud',
        children: UNITED_CLOUD_NAV_ITEMS(svc, orgName)
    }
    return navItems.children && navItems.children.length ? navItems : null;
}

const UNITY_VIEW_NAV_ITEMS = (svc: AppLevelService) => {
    let navItems: UnityNavData[] = [
        // {
        //     name: 'Dashboard',
        //     url: '/unityview/root/dashboard',
        //     icon: 'fa cfa-dashboard',
        //     attributes: {
        //         module: UnityModules.DASHBOARD,
        //     }
        // },
        {
            name: 'Monitoring',
            url: '/unityview/monitoring',
            icon: 'fa cfa-monitoring',
            attributes: {
                module: UnityModules.MONITORING,
            }
        },
        {
            name: 'Activity Logs',
            url: '/unityview/activitylogs',
            icon: 'far fa-clipboard',
            attributes: {
                module: UnityModules.ACTIVITY_LOG,
            }
        },
        {
            name: 'Alerts',
            url: '/unityview/alerts',
            icon: 'fa fa-bell',
            attributes: {
                module: UnityModules.AIML_EVENT_MANAGEMENT,
                type: 'exclude'
            }
        },
        {
            name: 'Network Topology',
            url: '/unityview/topology',
            icon: 'fas fa-project-diagram',
            attributes: {
                module: UnityModules.NETWORK_TOPOLOGY,
            }
        },
        {
            name: 'Service Topology',
            url: '/unityview/service-topology',
            icon: 'fas fa-bezier-curve',
            attributes: {
                module: UnityModules.SERVICE_TOPOLOGY,
            }
        }
    ];
    navItems = navItems.map(nav => nav.attributes ? filterRequiredNavItems(nav, svc) : nav)
    return navItems.filter(n => n);
}
const UNITED_VIEW_NAV_DATA = (svc: AppLevelService, orgName: string) => {
    let menuName = orgName ? `Observability` : 'UnityView';
    const navItems = {
        name: `${menuName}`,
        url: '/unityview',
        icon: 'fa cfa-unity-view',
        children: UNITY_VIEW_NAV_ITEMS(svc)
    }
    return navItems.children && navItems.children.length ? navItems : null;
}

const DASBOARD_NAV_ITEMS = (svc: AppLevelService) => {
    let navItems: UnityNavData[] = [
        {
            name: 'Default',
            url: '/app-dashboard/default',
            icon: 'fas fa-th-large',
            attributes: {
                module: UnityModules.DASHBOARD,
            }
        },
        {
            name: 'My Dashboard',
            url: '/app-dashboard/my-dashboard',
            icon: 'fas fa-tachometer-alt',
            attributes: {
                module: UnityModules.DASHBOARD,
            }
        },
    ];
    navItems = navItems.map(nav => nav.attributes ? filterRequiredNavItems(nav, svc) : nav)
    return navItems.filter(n => n);
}

const DASHBOARD_NAV_DATA = (svc: AppLevelService) => {
    const navItems = {
        name: 'Dashboard',
        url: '/app-dashboard',
        icon: 'fa cfa-dashboard',
        children: DASBOARD_NAV_ITEMS(svc)
    }
    return navItems.children && navItems.children.length ? navItems : null;
}

const HOME_NAV_DATA = (svc: AppLevelService) => {
    const navItems = {
        name: 'Home',
        url: '/home',
        icon: 'fas fa-home',
        // children: DASBOARD_NAV_ITEMS(svc)
    }
    return navItems ? navItems : null;
}


export const GET_UNITY_NAV_DATA = (svc: AppLevelService, userSvc: UserInfoService,) => {
    let selfBrandedOrgName = userSvc.selfBrandedOrgName;
    let isTenantOrg = userSvc.isTenantOrg;
    let nav = [
        HOME_NAV_DATA(svc),
        DASHBOARD_NAV_DATA(svc),
        UNITED_VIEW_NAV_DATA(svc, selfBrandedOrgName),
        UNITED_CLOUD_NAV_DATA(svc, selfBrandedOrgName),
        UNITY_SERVICES_NAV_DATA(svc, selfBrandedOrgName, isTenantOrg),
        UNITY_AI_NAV_DATA(svc, selfBrandedOrgName),
        UNITY_COST_ANALYSIS_NAV_DATA(svc, selfBrandedOrgName),
        UNITY_REPORT_NAV_DATA(svc, selfBrandedOrgName),
        UNITY_SUPPORT_NAV_DATA(svc, selfBrandedOrgName),
        UNITY_SETUP_NAV_DATA(svc, selfBrandedOrgName),
    ];
    if (isTenantOrg) {
        nav.splice(5, 0, UNITY_AI_AGENTS_NAV_DATA(svc, selfBrandedOrgName));
    }
    return nav.filter(n => n);
}
