export interface UnityNavRouteAccess {
    aliases?: string[];
}

export const UNITY_ROUTE_ACCESS = {
    // Custom Dashboard (new My Dashboards) is reachable by URL only until it replaces My Dashboards.
    DASHBOARD_MY_DASHBOARDS: {
        aliases: ['/app-dashboard/custom-dashboards']
    },
    SETUP_COST_PLAN_RESOURCE_MODEL: {
        aliases: ['/setup/cost-plan/resource-mapping']
    },
    SUPPORT_DOCUMENTATION_USERGUIDE: {
        aliases: ['/support/documentation']
    },
    REPORTS_MANAGE_NEW_REPORTS: {
        aliases: ['/reports/manage-reports', '/reports/manage-schedules', '/reports/manage']
    },
    SERVICES_AIML: {
        aliases: ['/services/aiml-summary', '/services/aiml-event-mgmt']
    },
    SERVICES_SUSTAINABILITY: {
        aliases: ['/services/greeenIT']
    },
    SERVICES_TOKEN_BILLING: {
        aliases: ['/services/token-billing']
    }
};
