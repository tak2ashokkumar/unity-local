import { AppLevelService, MTPModules } from '../app-level.service';

export interface NavData {
    name: string;
    url: string;
    icon?: string;
    badge?: any;
    title?: boolean;
    children?: NavData[];
    variant?: string;
    attributes?: object;
    divider?: boolean;
    class?: string;
}

const filterRequiredNavItems = (navItem: NavData, svc: AppLevelService) => {
    let moduleNameFromNavItem = navItem.attributes['module'];
    let module = svc.getAccess(moduleNameFromNavItem);
    if (moduleNameFromNavItem && module) {
        if (module.read) {
            return navItem;
        }
    } else if (!module) {
        return;
    } else {
        let items = [];
        if (navItem.children && navItem.children.length) {
            items.push(navItem.children.map(n => filterRequiredNavItems(n, svc)));
            if (items.length) {
                navItem.children = items;
                return navItem;
            }
        }
    }
    return;
}

const MAINTENANCE_MGMT_NAV_DATA = () => {
    return {
        name: 'Maintenance',
        url: '/maintenance',
        icon: 'fas fa-life-ring',
        attributes: {
            module: MTPModules.MAINTENANCE,
        }
    }
}


const TCKT_MGMT_NAV_DATA = () => {
    return {
        name: 'Ticket Management',
        url: '/ticketmgmt',
        icon: 'fas fa-ticket-alt',
        attributes: {
            module: MTPModules.TICKET_MANAGEMENT,
        }
    }
}

const AIML_MGMT_NAV_DATA = () => {
    return {
        name: 'AIML Event Managament',
        url: '/aiml/summary',
        icon: 'fa fa-bell',
        attributes: {
            module: MTPModules.EVENT_MANAGEMENT,
        }
    }
}

const INTEGRATION_MGMT_NAV_DATA = () => {
    return {
        name: 'Integration',
        url: '/administration/integration',
        icon: 'fas fa-tools',
        attributes: {
            module: MTPModules.INTEGRATION_MANAGEMENT,
        }
    }
}

const SERVICE_MGMT_NAV_DATA = () => {
    return {
        name: 'Service Management',
        url: '/administration/servicemgmt/sla/group',
        icon: 'fas fa-list',
        attributes: {
            module: MTPModules.SERVICE_MANAGEMENT,
        }
    }
}

const USER_MGMT_NAV_DATA = () => {
    return {
        name: 'User Management',
        url: '/administration/usermgmt',
        icon: 'fas fa-users',
        attributes: {
            module: MTPModules.USER_MANAGEMENT,
        }
    }
}

const MONITORING_MGMT_NAV_DATA = () => {
    return {
        name: 'Monitoring',
        url: '/administration/monitoring',
        icon: 'fas fa-tv',
        attributes: {
            module: MTPModules.MONITORING_MANAGEMENT,
        }
    }
}

const ADMINISTRATION_NAV_DATA = (svc: AppLevelService) => {
    let children = [
        filterRequiredNavItems(MONITORING_MGMT_NAV_DATA(), svc),
        filterRequiredNavItems(USER_MGMT_NAV_DATA(), svc),
        filterRequiredNavItems(SERVICE_MGMT_NAV_DATA(), svc),
        filterRequiredNavItems(INTEGRATION_MGMT_NAV_DATA(), svc),
    ];
    children = children.filter(nItem => nItem);
    if (children.length) {
        const navData = {
            name: 'Administration',
            url: '/administration',
            icon: 'fas fa-cog',
            children: children,
            attributes: {
                module: null,
            }
        }
        return navData;
    }
    return;
}

const TENANT_MGMT_NAV_DATA = () => {
    return {
        name: 'Tenants Management',
        url: '/tenantsmgmt',
        icon: 'fa fa-users',
        attributes: {
            module: MTPModules.TENANT_MANAGEMENT,
        }
    }
}

const DASHBOARD_NAV_DATA = () => {
    return {
        name: 'Dashboard',
        url: '/dashboard',
        icon: 'fa fa-chart-bar',
        attributes: {
            module: MTPModules.DASHBOARD,
        }
    }
}

export const GET_NAV_DATA = (svc: AppLevelService) => {
    let nav = [
        filterRequiredNavItems(DASHBOARD_NAV_DATA(), svc),
        filterRequiredNavItems(TENANT_MGMT_NAV_DATA(), svc),
        ADMINISTRATION_NAV_DATA(svc),
        filterRequiredNavItems(AIML_MGMT_NAV_DATA(), svc),
        filterRequiredNavItems(TCKT_MGMT_NAV_DATA(), svc),
        filterRequiredNavItems(MAINTENANCE_MGMT_NAV_DATA(), svc)
    ];
    return nav.filter(n => n);
}