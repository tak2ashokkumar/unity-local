// Self-contained navigation model, ported from tools/admin-server/menu.json (the
// static port of AdminMenuFactory). Legacy hash hrefs like "#/servers" become
// app routes "/servers". Each leaf carries a `resource` key (generic list) or a
// `kind` ('dashboard' | 'custom' | 'placeholder') so the router can resolve it.

// 'custom' = backed by a bespoke page component registered in App.tsx CUSTOM_PAGES.
export type LeafKind = 'list' | 'dashboard' | 'custom' | 'placeholder';

export interface NavItem {
  label: string;
  to?: string;
  icon?: string;
  resource?: string;   // resource registry key for list leaves
  kind?: LeafKind;     // default 'list' when `to` + `resource` present
  disabled?: boolean;
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  icon: string;
  children: NavItem[];
}

const listLeaf = (label: string, to: string, resource: string, icon?: string): NavItem => ({
  label,
  to,
  resource,
  icon,
  kind: 'list',
});

const page = (label: string, to: string, kind: LeafKind, icon?: string): NavItem => ({
  label,
  to,
  kind,
  icon,
});

export const MENU: NavSection[] = [
  {
    label: 'UnitedView',
    icon: 'home',
    children: [
      page('Dashboard', '/dashboard', 'dashboard', 'layout-dashboard'),
      {
        label: 'System Monitoring',
        icon: 'activity',
        children: [
          listLeaf('Networking', '/integ/net', 'integ/net', 'radio'),
          // The two CHART tabs of the legacy Networking page (networking.js:39).
          page('Customer Utilization', '/integ/net/utilization', 'custom', 'bar-chart-3'),
        ],
      },
      listLeaf('Activity Log', '/activity/logs', 'activity/logs', 'scroll-text'),
    ],
  },
  {
    label: 'UnitedCloud',
    icon: 'cloud',
    children: [
      listLeaf('Private Cloud', '/cloud', 'cloud', 'cloud'),
      {
        label: 'Public Cloud',
        icon: 'cloud',
        children: [
          listLeaf('AWS', '/aws-dashboard', 'aws-dashboard', 'box'),
          listLeaf('Azure', '/azure-dashboard', 'azure-dashboard', 'monitor'),
        ],
      },
      {
        label: 'Devices',
        icon: 'hard-drive',
        children: [
          listLeaf('Servers', '/servers', 'server', 'server'),
          listLeaf('Virtual Machines', '/vm', 'vm', 'cloud'),
          listLeaf('SANs', '/sans', 'sans', 'database'),
          listLeaf('Switches', '/switch', 'switch', 'network'),
          listLeaf('Firewalls', '/firewall', 'firewall', 'flame'),
          listLeaf('Load Balancers', '/loadbalancer', 'loadbalancer', 'scale'),
          listLeaf('Terminal Servers', '/terminalserver', 'terminalserver', 'terminal'),
          listLeaf('Other Device', '/customdevice', 'customdevice', 'box'),
        ],
      },
      {
        label: 'IP Management',
        icon: 'network',
        children: [
          listLeaf('Public IPv4', '/ipv4_public/assignments', 'ipv4_public_assignments'),
          listLeaf('Private IPv4', '/ipv4_private/assignments', 'ipv4_private_assignments'),
          listLeaf('IPv6', '/ipv6blocks', 'ipv6blocks'),
          listLeaf('VLANs', '/vlan', 'vlan'),
        ],
      },
      {
        label: 'Colo',
        icon: 'building-2',
        children: [
          listLeaf('Cabinets', '/cabinet', 'cabinet', 'columns'),
          listLeaf('PDUs', '/pdu', 'pdu', 'plug'),
          listLeaf('Cages', '/cage', 'cage', 'square-stack'),
          listLeaf('Power Circuits', '/powercircuit', 'powercircuit', 'plug-zap'),
          listLeaf('Colocation Cloud', '/colo_cloud', 'colo_cloud', 'cloud'),
        ],
      },
      {
        label: 'UnityConnect',
        icon: 'cable',
        children: [
          // Legacy routes are spelled "unitedconnect", not "unityconnect".
          listLeaf('UnityConnect', '/unitedconnect', 'unitedconnect', 'cable'),
          listLeaf('UCPort', '/manage_unitedconnect', 'manage_unitedconnect', 'plug'),
          // The VXC route is a purchase wizard (POSTs to /rest/vxc/), not a list.
          page('VXC', '/manage_unitedconnect/vxc', 'custom', 'arrow-left-right'),
        ],
      },
    ],
  },
  {
    label: 'UnitedServices',
    icon: 'rocket',
    children: [
      {
        label: 'DevOps-as-a-Service',
        icon: 'settings-2',
        children: [
          listLeaf('DevOps Scripts', '/services/devops-scripts', 'services/devops-scripts', 'file-code'),
          page('Terraform', '/services/terraform', 'custom', 'boxes'),
          page('VM Migration', '/services/vm_migration', 'custom', 'move'),
          page('VM Backup', '/services/vm_backup', 'custom', 'save'),
          page('DB Instance', '/services/db_instance', 'custom', 'database'),
        ],
      },
    ],
  },
  {
    label: 'Support',
    icon: 'life-buoy',
    children: [
      listLeaf('Maintenance', '/maintenance-schedules', 'maintenance-schedules', 'calendar'),
    ],
  },
  {
    label: 'UnitedSetup',
    icon: 'wrench',
    children: [
      {
        label: 'Tenant Management',
        icon: 'users',
        children: [
          listLeaf('Organizations', '/organization', 'organization', 'building'),
          listLeaf('Users', '/user', 'user', 'user'),
          listLeaf('Storage', '/storage_management', 'storage_management', 'hard-drive'),
        ],
      },
      {
        label: 'Billing & Invoicing',
        icon: 'credit-card',
        children: [
          listLeaf('Products', '/sf_product2', 'sf_product2', 'list'),
          listLeaf('Opportunities', '/sf_opportunity', 'sf_opportunity', 'copy'),
          listLeaf('Service Contracts', '/service_contract', 'service_contract', 'file-text'),
          listLeaf('Import Opportunities', '/sf_import_oppty', 'sf_import_oppty', 'upload'),
        ],
      },
      {
        label: 'Server Components',
        icon: 'briefcase',
        children: [
          listLeaf('CPUs', '/cpu', 'cpu', 'cpu'),
          listLeaf('Memory', '/memory', 'memory', 'memory-stick'),
          listLeaf('Disks', '/disk', 'disk', 'hard-drive'),
          listLeaf('Motherboard', '/motherboard', 'motherboard', 'circuit-board'),
          listLeaf('NICs', '/nic', 'nic', 'ethernet-port'),
          listLeaf('IPMI', '/ipmi', 'ipmi', 'server-cog'),
          listLeaf('Operating Systems', '/os', 'os', 'disc'),
        ],
      },
      {
        label: 'Cloud Setup',
        icon: 'cloud-cog',
        children: [
          listLeaf('Private Cloud', '/cloud_setup/private_cloud', 'cloud_setup/private_cloud', 'cloud'),
          {
            label: 'VMware',
            icon: 'server',
            children: [
              listLeaf('vCenter API Account', '/vmware-dashboard', 'vmware-dashboard', 'cloud'),
              listLeaf('vCenter Config', '/vmware-config', 'vmware-config', 'settings'),
              listLeaf('vCenter Proxy', '/vmware-vcenter', 'vmware-vcenter', 'cloud'),
              listLeaf('VMware ESXi Proxy', '/vmware-esxi', 'vmware-esxi', 'cloud'),
            ],
          },
          {
            label: 'OpenStack',
            icon: 'server',
            children: [
              listLeaf('OpenStack API Account', '/openstack-dashboard', 'openstack-dashboard', 'cloud'),
              listLeaf('OpenStack Proxy', '/openstack-proxy', 'openstack-proxy', 'cloud'),
            ],
          },
          {
            label: 'Networking',
            icon: 'network',
            children: [
              listLeaf('Switches', '/switch', 'switch', 'network'),
              listLeaf('Firewalls', '/firewall', 'firewall', 'flame'),
              listLeaf('Load Balancers', '/loadbalancer', 'loadbalancer', 'scale'),
            ],
          },
        ],
      },
      {
        label: 'Supported Hardware',
        icon: 'cog',
        children: [
          {
            label: 'Manufacturers',
            children: [
              listLeaf('PDU', '/pdu_manufacturers', 'pdu_manufacturer'),
              listLeaf('Storage', '/storage_manufacturers', 'storage_manufacturer'),
              listLeaf('Mobile', '/mobile_manufacturers', 'mobile_manufacturer'),
              listLeaf('System', '/system_manufacturers', 'system_manufacturers'),
              listLeaf('Manufacturers', '/manufacturers', 'manufacturer'),
            ],
          },
          {
            label: 'Models',
            children: [
              listLeaf('PDU', '/pdumodel', 'pdumodel'),
              listLeaf('Switch', '/switchmodel', 'switchmodel'),
              listLeaf('Firewall', '/firewallmodel', 'firewallmodel'),
              listLeaf('Load Balancer', '/loadbalancermodel', 'loadbalancermodel'),
              listLeaf('Server', '/server_model', 'server_model'),
              listLeaf('Storage', '/storage_model', 'storage_model'),
              listLeaf('Mobile', '/mobile_model', 'mobile_model'),
              listLeaf('Motherboard', '/motherboardmodel', 'motherboardmodel'),
              listLeaf('CPU', '/cputype', 'cputype'),
              listLeaf('Memory', '/memorytype', 'memorytype'),
              listLeaf('Disk', '/disktype', 'disktype'),
              listLeaf('NIC', '/nictype', 'nictype'),
              listLeaf('IPMI', '/ipmi_model', 'ipmi_model'),
              listLeaf('Terminal Server', '/terminalservermodel', 'terminalservermodel'),
            ],
          },
          {
            label: 'Controller Types',
            children: [
              listLeaf('SAS', '/sascontrollertype', 'sascontrollertype'),
              listLeaf('Disk', '/diskcontrollertype', 'diskcontrollertype'),
              listLeaf('RAID', '/raidcontrollertype', 'raidcontrollertype'),
            ],
          },
          {
            label: 'Miscellaneous',
            children: [
              listLeaf('Product Types', '/producttype', 'producttype'),
              listLeaf('Chassis', '/chassistype', 'chassistype'),
              listLeaf('Peripheral Types', '/peripheraltype', 'peripheraltype'),
              listLeaf('Cluster Types', '/clustertype', 'clustertype'),
              listLeaf('Cloud Types', '/cloudtype', 'cloudtype'),
            ],
          },
        ],
      },
      {
        label: 'Facilities Config',
        icon: 'globe',
        children: [
          listLeaf('Datacenters', '/datacenter', 'datacenter'),
          listLeaf('Locations', '/location', 'location'),
          listLeaf('Cabinet Types', '/cabinettype', 'cabinettype'),
          listLeaf('Cabinet Options', '/cabinetoption', 'cabinetoption'),
          listLeaf('Circuit Options', '/circuitoption', 'circuitoption'),
          listLeaf('Voltage Types', '/voltagetype', 'voltagetype'),
          listLeaf('Amp Types', '/ampstype', 'ampstype'),
          listLeaf('Outlet Types', '/outlettype', 'outlettype'),
          listLeaf('Electrical Panels', '/electricalpanel', 'electricalpanel'),
          listLeaf('Electrical Circuits', '/electricalcircuit', 'electricalcircuit'),
        ],
      },
      {
        label: 'IP Config',
        icon: 'wrench',
        children: [
          listLeaf('IPv4 ARIN Allocations', '/ipv4_public/allocations', 'ipv4_public_allocations'),
          listLeaf('IPv6 Allocations', '/ipv6alloc', 'ipv6alloc'),
          listLeaf('Private Allocations', '/ipv4_private/allocations', 'ipv4_private_allocations'),
        ],
      },
      {
        label: 'Monitoring',
        icon: 'line-chart',
        children: [
          listLeaf('Configuration', '/monitoring/configure', 'monitoring/configure', 'settings'),
          {
            label: 'Zabbix',
            icon: 'bar-chart-3',
            children: [
              listLeaf('Instance', '/zabbix/instance', 'zabbix/instance'),
              listLeaf('Customer Map', '/zabbix/customer_instance_map', 'zabbix/customer_instance_map'),
              listLeaf('Template Definition', '/zabbix/template_definition', 'zabbix/template_definition'),
              listLeaf('Template Mapping', '/zabbix/template_mapping', 'zabbix/template_mapping'),
              listLeaf('Device Map', '/zabbix/device_map', 'zabbix/device_map'),
              listLeaf('Agent Details', '/zabbix/agent_details', 'zabbix/agent_details'),
            ],
          },
          {
            label: 'Observium',
            icon: 'line-chart',
            children: [
              listLeaf('Instance', '/observium/instance', 'observium/instance'),
              listLeaf('Device Map', '/observium/device_map', 'observium/device_map'),
              listLeaf('Bill Map', '/observium/billing_map', 'observium/billing_map'),
              listLeaf('Port Map', '/observium/switch_ports', 'observium/switch_ports'),
            ],
          },
        ],
      },
      {
        label: 'AIOPS',
        icon: 'bell',
        children: [listLeaf('Sources', '/aiops/sources', 'aiops/sources', 'building')],
      },
      {
        label: 'Discovery',
        icon: 'radar',
        children: [listLeaf('OpenAudit', '/discovery/open_audit', 'discovery/open_audit', 'settings')],
      },
      listLeaf('AWS AMI', '/aws_amis', 'aws_amis', 'save'),
      listLeaf('Device Reports', '/device_reports', 'device_reports', 'bar-chart-3'),
      listLeaf('Service Catalogues', '/service_catalogue', 'service_catalogue', 'list'),
      {
        label: 'Advanced',
        icon: 'rocket',
        children: [
          page('Import Tool', '/import2', 'custom', 'upload'),
          page('Impersonate User', '/hijack', 'custom', 'eye-off'),
          page('Celery Jobs', '/integ/celery_monitor', 'custom', 'list-checks'),
          page('Developer Options', '/101010', 'custom', 'save'),
          page('Proxy Cookies', '/proxy-cookies-1', 'custom', 'cookie'),
          listLeaf('Release Notes', '/release', 'release', 'sticky-note'),
        ],
      },
    ],
  },
];

// Flatten all leaves (items with a `to`) for route generation.
export function flattenLeaves(sections: NavSection[]): NavItem[] {
  const out: NavItem[] = [];
  const walk = (items: NavItem[]) => {
    items.forEach((it) => {
      if (it.to) out.push(it);
      if (it.children) walk(it.children);
    });
  };
  sections.forEach((s) => walk(s.children));
  return out;
}

// Find the breadcrumb trail (section label + item labels) leading to a route path.
export function findTrail(path: string): { section: string; labels: string[]; leaf?: NavItem } | null {
  for (const section of MENU) {
    const stack: NavItem[] = [];
    let found: NavItem | null = null;
    const walk = (items: NavItem[]): boolean => {
      for (const it of items) {
        stack.push(it);
        if (it.to === path) {
          found = it;
          return true;
        }
        if (it.children && walk(it.children)) return true;
        stack.pop();
      }
      return false;
    };
    if (walk(section.children)) {
      return { section: section.label, labels: stack.map((s) => s.label), leaf: found || undefined };
    }
  }
  return null;
}
