export interface UnityNavRouteAccess {
    aliases?: string[];
}

export const UNITY_ROUTE_ACCESS = {
    SETUP_COST_PLAN_RESOURCE_MODEL: {
        aliases: ['/setup/cost-plan/resource-mapping']
    },
    SUPPORT_DOCUMENTATION_USERGUIDE: {
        aliases: ['/support/documentation']
    },
    REPORTS_MANAGE_NEW_REPORTS: {
        aliases: ['/reports/manage']
    },
    SERVICES_AIML: {
        aliases: ['/services/aiml-summary', '/services/aiml-event-mgmt']
    },
    SERVICES_SUSTAINABILITY: {
        aliases: ['/services/greeenIT']
    }
};
