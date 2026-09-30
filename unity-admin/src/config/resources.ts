import { FieldDef, ResourceConfig, ResourceTab, RowAction } from './fieldTypes';
import { ApiRecord } from '../data/types';

/*
 * Resource registry - ported from the legacy AngularJS admin panel.
 *
 * SOURCE OF TRUTH for every column set below:
 *   uldb/static/rest/app/api/uldb-service.js   - one `_f` field array per resource
 *   uldb/static/rest/app/api/uldb-utils.js     - FieldProvider (shared relation fields)
 *   uldb/static/rest/app/controllers/*.js      - `shownFields` narrows the list view
 *
 * The legacy list template renders the resource's fields IN REGISTRY ORDER. When a
 * controller declares `shownFields` the field array is filtered by it (directives.js
 * line 308) - which keeps registry order, it does NOT reorder to match shownFields.
 * Only two controllers do this today: SANController and the server controller.
 *
 * Endpoint `uri` values are NOT taken from the legacy source - they were verified at
 * runtime against the live panel and must stay as they are. Only columns are ported.
 *
 * `required` is deliberately NOT a 1:1 port: legacy marks nearly every field
 * `required: true`, including descriptions and optional metadata, which would make
 * these forms unsubmittable. It is set here only on genuine identity fields.
 */

// Turn a snake/uri key into a Title Case label ("cabinet_type" -> "Cabinet Type").
export function humanize(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bIp\b/g, 'IP')
    .replace(/\bId\b/g, 'ID')
    .replace(/\bCpu\b/g, 'CPU')
    .replace(/\bOs\b/g, 'OS')
    .replace(/\bVm\b/g, 'VM')
    .replace(/\bPdu\b/g, 'PDU')
    .replace(/\bNic\b/g, 'NIC')
    .replace(/\bSan\b/g, 'SAN')
    .replace(/\bIpmi\b/g, 'IPMI')
    .replace(/\bUrl\b/g, 'URL')
    .replace(/\bAws\b/g, 'AWS')
    .trim();
}

// ---- Small field builders (keep the registry terse) ----
const text = (name: string, label?: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label: label || humanize(name),
  cell: 'text',
  ...extra,
});

const mono = (name: string, label?: string, extra: Partial<FieldDef> = {}): FieldDef =>
  text(name, label, { cell: 'mono', ...extra });

const num = (name: string, label?: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label: label || humanize(name),
  cell: 'number',
  input: 'number',
  align: 'right',
  ...extra,
});

const bool = (name: string, label?: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label: label || humanize(name),
  cell: 'boolean',
  input: 'boolean',
  ...extra,
});

const date = (name: string, label?: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label: label || humanize(name),
  cell: 'datetime',
  ...extra,
});

const choice = (name: string, label: string, choices: (string | number | boolean)[], extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  cell: 'choice',
  input: 'choices',
  choices,
  ...extra,
});

const badge = (name: string, label: string, badgeMap: FieldDef['badgeMap'], extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  cell: 'badge',
  badgeMap,
  ...extra,
});

// Inline FK object {url,id,name} -> show subfield, edit via typeahead against lookupUri.
const fk = (name: string, label: string, lookupUri: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  cell: 'fk',
  input: 'typeahead',
  subfield: 'name',
  lookupUri,
  lookupAccessor: 'name',
  ...extra,
});

// Self/relation link column.
const link = (name: string, label: string, uriPrefix: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  cell: 'link',
  uriPrefix,
  idField: 'id',
  ...extra,
});

// Array-of-objects column rendered as chips (legacy m2m fields: customers, templates).
const multi = (name: string, label: string, subfield = 'name', extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  cell: 'multiple',
  subfield,
  sortable: false,
  hideInForm: true,
  ...extra,
});

/* EDITABLE many-to-many. The legacy Add/Edit modal rendered a searchable
   multiselect for every field declared inputMethod {type:'multiple'}
   (templates/modal/master_modal.html:52), and several were required there -
   customers on customdevice/cabinet/switch/firewall/loadbalancer, unity_modules
   on organization. multi() above hard-codes hideInForm, which made all of them
   view-only; use this wherever the option source is known. */
const multiEdit = (name: string, label: string, lookupUri: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  cell: 'multiple',
  subfield: 'name',
  sortable: false,
  input: 'multiple',
  lookupUri,
  lookupIdProp: 'id',
  ...extra,
});

// Secrets the legacy field arrays include but that must never render in a table.
const secret = (name: string, label?: string): FieldDef => ({
  name,
  label: label || humanize(name),
  cell: 'text',
  input: 'password',
  hideInList: true,
});

/* ---- FieldProvider parity (uldb-utils.js:246) ----
 * These mirror the shared relation fields the legacy registry composes from, so a
 * ported field array reads the same way its source does. */
const customerField = (name = 'customer', label = 'Customer'): FieldDef =>
  fk(name, label, 'fast/org', { uriPrefix: '/organization/' });

const cabinetField = (): FieldDef => fk('cabinet', 'Cabinet', 'cabinet');

const osField = (): FieldDef => ({
  name: 'os',
  label: 'Operating System',
  cell: 'fk',
  subfield: 'full_name',
  input: 'typeahead',
  lookupUri: 'os',
  lookupAccessor: 'full_name',
});

const serverField = (): FieldDef => fk('server', 'Server', 'server', { uriPrefix: '/server/' });

const motherboardField = (): FieldDef =>
  fk('motherboard', 'Motherboard', 'motherboard', { subfield: 'asset_tag', lookupAccessor: 'asset_tag' });

const locationField = (): FieldDef => fk('location', 'Location', 'location');

const manufacturerField = (lookupUri = 'manufacturer'): FieldDef => fk('manufacturer', 'Manufacturer', lookupUri);

const salesforceIdField = (): FieldDef => mono('salesforce_id', 'Salesforce ID');

/* The credential-rotation row action four lists exposed in the legacy panel.
   Callers: controllers/tools.js:753 (observium), :954 (zabbix),
   controllers/types.js:691 (openstack), :740 (vmware vcenter). */
const changePasswordAction = (uri: string): RowAction => ({
  kind: 'change-password',
  label: 'Change Password',
  icon: 'key',
  uri,
});

/* IANA timezone list for the user form. Legacy embedded the full pytz list; the
   browser exposes the same set, with a small fallback for older engines. */
const TIMEZONES: string[] = (() => {
  const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
  try {
    if (typeof intl.supportedValuesOf === 'function') return intl.supportedValuesOf('timeZone');
  } catch {
    /* fall through */
  }
  return ['UTC', 'US/Pacific', 'US/Mountain', 'US/Central', 'US/Eastern', 'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Singapore', 'Australia/Sydney'];
})();

// The eleven regions the legacy AWS onboarding form offered as a <select>
// (controllers/v3/aws/awsdashboardcontroller.js:75). Stored as the short code.
const AWS_REGIONS = [
  'us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1',
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'sa-east-1',
];

// The "proxy" device pages (vCenter / ESXi / OpenStack / F5 / Cisco / Juniper / Citrix)
// all share one legacy shape: name, the device it fronts, proxy hostname, backend URL,
// customers. Only the device relation differs.
const proxyFields = (deviceName: string, deviceLabel: string, deviceLookup: string): FieldDef[] => [
  text('name', 'Name', { required: true }),
  fk(deviceName, deviceLabel, deviceLookup),
  mono('proxy_url', 'Proxy Hostname'),
  mono('proxy_fqdn', 'Proxy URL'),
  mono('backend_url', 'Backend URL'),
  /* Editable, not a read-only chip list. `customers` decides which tenants can
     reach this proxy, and the legacy form made it a REQUIRED multi-select
     (api/uldb-service.js:3272 vcenter, :3339 esxi). The generic multi() helper
     hard-codes hideInForm, so the port had no way to grant access at all. */
  multiEdit('customers', 'Customer', 'fast/org', { required: true }),
];

// Observium device-map tabs: instance + observium device id + the mapped device.
const observiumMapFields = (
  deviceName: string,
  deviceLabel: string,
  deviceLookup: string,
  accessor = 'name'
): FieldDef[] => [
  {
    name: 'observium_instance',
    label: 'Observium Instance',
    cell: 'fk',
    subfield: 'account_name',
    input: 'typeahead',
    lookupUri: 'observium/instance',
    lookupAccessor: 'account_name',
  },
  mono('device_id', 'Observium Device ID'),
  /* The mapped device is REQUIRED in the legacy registry and was a typeahead over
     the matching *Fast resource (uldb-service.js observium_switch:3886 and its 15
     siblings). It was display-only here, so a mapping could never be created. */
  fk(deviceName, deviceLabel, deviceLookup, { required: true, subfield: accessor, lookupAccessor: accessor }),
];

// Zabbix device-map tabs: customer/instance pair + the mapped device + templates.
const zabbixMapFields = (
  deviceName: string,
  deviceLabel: string,
  deviceLookup: string,
  accessor = 'name'
): FieldDef[] => [
  {
    name: 'zabbix_customer',
    label: 'Customer/Instance',
    cell: 'text',
    sortable: false,
    input: 'typeahead',
    lookupUri: 'zabbix/zabbix_customers',
    lookupAccessor: 'account_name',
    /* Records here carry `customer` and `zabbix_instance` objects and NO flat
       name field, so both the cell and the picker compose the label the way the
       legacy search did: "<customer> - <instance>". */
    lookupLabel: (o) => {
      const c = o.customer as Record<string, unknown> | undefined;
      const i = o.zabbix_instance as Record<string, unknown> | undefined;
      return [c && c.name, i && i.account_name].filter(Boolean).join(' - ');
    },
    format: (value) => {
      const cu = value as Record<string, unknown> | null;
      if (!cu) return '-';
      const c = cu.customer as Record<string, unknown> | undefined;
      const i = cu.zabbix_instance as Record<string, unknown> | undefined;
      return [c && c.name, i && i.account_name].filter(Boolean).join(' - ') || '-';
    },
  },
  fk(deviceName, deviceLabel, deviceLookup, { required: true, subfield: accessor, lookupAccessor: accessor }),
  /* Host Id was missing from the port entirely - the legacy deviceMapping modal
     has it as a required input alongside the device. */
  mono('host_id', 'Host Id', { required: true }),
  /* Templates are scoped to the instance behind the selected Customer/Instance
     pair, exactly as the legacy modal did:
       controllers/tools.js:1630  GET rest/zabbix/instance/{item.zabbix_instance.id}/zabbix_templates/
     Picking a different customer clears this field (RecordForm), so a template
     from another instance can never be attached. */
  /*
   * The record field is `zabbix_templates` (not `templates`) and it holds PLAIN
   * TEMPLATE NAMES - verified on live data: 99 of 164 switch mappings carry
   * e.g. ["Unity_Cisco_IOS_by_SNMP"]. The lookup, by contrast, returns objects
   * ({ template_id, template_name }), so the two are bridged here: identity is the
   * template NAME, toInput wraps stored strings into option-shaped stubs, and
   * fromInput unwraps the selection back to the strings the API stores.
   */
  {
    name: 'zabbix_templates',
    label: 'Templates',
    cell: 'multiple',
    subfield: 'template_name',
    sortable: false,
    input: 'multiple',
    lookupIdProp: 'template_name',
    dependsOn: 'zabbix_customer',
    lookupUriFrom: (customer) => {
      const c = customer as Record<string, unknown> | null;
      const instance = c && (c.zabbix_instance as Record<string, unknown> | undefined);
      const id = instance && instance.id;
      return id ? `zabbix/instance/${id}/zabbix_templates` : null;
    },
    toInput: (value) =>
      Array.isArray(value)
        ? value.map((t) => (typeof t === 'string' ? { template_name: t } : t))
        : [],
    fromInput: (value) =>
      Array.isArray(value)
        ? value.map((o) =>
            o && typeof o === 'object' ? (o as Record<string, unknown>).template_name : o
          )
        : [],
  },
];

// IP block/allocation pages all share the ARIN block shape.
const ipBlockFields = (): FieldDef[] => [
  text('name', 'Name', { required: true }),
  text('arin_handle', 'ARIN Handle'),
  text('description', 'Description'),
  mono('prefix', 'Prefix'),
  num('prefixlen', 'Prefix Length'),
];

// The four "<x> Model" catalogs share a manufacturer + lifecycle tail.
const modelLifecycle = (): FieldDef[] => [
  num('power_consumption', 'Power Consumption', { required: false }),
  /* Legacy declares inputMethod: { type: 'datetime' } on both (uldb-service.js:1675),
     so they are editable in the model catalogs. The port hid them from the form, which
     left no way to record a model's lifecycle dates at all. The form engine now renders
     a real day-granularity date picker for cell='datetime'. */
  date('end_of_life', 'End Of Life'),
  date('end_of_service', 'End Of Service'),
];

// ---- Resource registry (ported from uldb-service.js, in registry order) ----
export const RESOURCES: Record<string, ResourceConfig> = {
  /* uldb-service.js `server` + controllers/system.js:17 shownFields */
  server: {
    key: 'server',
    uri: 'server',
    title: 'Servers',
    titleSingular: 'Server',
    icon: 'server',
    defaultSort: 'name',
    fields: [
      // Columns follow controllers/system.js:17 shownFields:
      // ['name','asset_tag','manufacturer','num_cores','memory_mb','capacity_gb','salesforce_id']
      // The rest stay in the form but are hidden from the table.
      link('name', 'Name', '/server/', { required: true }),
      fk('private_cloud', 'Cloud', 'v3.1/private_cloud', { idField: 'uuid', hideInList: true }),
      { ...cabinetField(), hideInList: true },
      text('asset_tag', 'Asset Tag'),
      num('num_cores', 'Cores'),
      num('memory_mb', 'Memory (MB)'),
      num('capacity_gb', 'Disk Capacity (GB)'),
      manufacturerField('server_manufacturer'),
      mono('serial_number', 'Serial Number', { hideInList: true }),
      { ...customerField('customer', 'Customer'), hideInList: true },
      fk('chassis', 'Chassis', 'chassis', { hideInList: true }),
      salesforceIdField(),
      text('description', 'Description', { hideInList: true }),
    ],
  },

  /* uldb-service.js `san` + controllers/storageserver.js:12 shownFields:
   * ['name','asset_tag','capacity_gb','manufacturer','salesforce_id','customer','cabinet'] */
  sans: {
    key: 'sans',
    uri: 'san',
    title: 'SANs',
    titleSingular: 'SAN',
    icon: 'database',
    defaultSort: 'name',
    fields: [
      link('name', 'Name', '/sans/', { required: true }),
      text('asset_tag', 'Asset Tag'),
      num('num_cores', 'Cores', { hideInList: true }),
      num('memory_mb', 'Memory (MB)', { hideInList: true }),
      num('capacity_gb', 'Disk Capacity (GB)'),
      manufacturerField('storage_manufacturer'),
      mono('serial_number', 'Serial Number', { hideInList: true }),
      { ...osField(), hideInList: true },
      salesforceIdField(),
      text('description', 'Description', { hideInList: true }),
      customerField('customer', 'Customer'),
      cabinetField(),
    ],
  },

  vlan: {
    key: 'vlan',
    uri: 'vlan',
    title: 'VLANs',
    titleSingular: 'VLAN',
    icon: 'network',
    defaultSort: 'vlan_number',
    fields: [
      num('vlan_number', 'VLAN ID', { required: true }),
      fk('region', 'Location', 'location'),
      bool('verified', 'Verified'),
      text('ulid', 'ULID'),
      customerField('customer', 'Customer'),
    ],
  },

  cloud: {
    key: 'cloud',
    uri: 'v3.1/private_cloud',
    title: 'Private Clouds',
    titleSingular: 'Private Cloud',
    description: 'Private cloud platforms onboarded to Unity.',
    icon: 'cloud',
    idField: 'uuid',
    defaultSort: 'name',
    fields: [
      text('name', 'Cloud Name', { required: true }),
      customerField(),
      fk('colocation_cloud', 'Datacenter', 'colo_cloud'),
      text('platform_type', 'Platform Type'),
      num('vcpu', 'vCPUs'),
      num('memory', 'RAM in GB'),
      num('storage', 'Storage in TB'),
      multi('firewall', 'Firewalls'),
      multi('switch', 'Switches'),
      multi('load_balancer', 'LoadBalancers'),
      multi('customdevice', 'CustomDevices'),
    ],
  },

  colo_cloud: {
    key: 'colo_cloud',
    uri: 'colo_cloud',
    title: 'Colocation Cloud',
    titleSingular: 'Colocation Cloud',
    icon: 'cloud',
    defaultSort: 'name',
    fields: [
      text('name', 'Cloud Name', { required: true }),
      customerField(),
      fk('location', 'Location', 'location'),
      multi('cabinets', 'Cabinets'),
    ],
  },

  'discovery/open_audit': {
    key: 'discovery/open_audit',
    uri: 'collector_map',
    title: 'OpenAudit Collectors',
    titleSingular: 'Collector Mapping',
    icon: 'radar',
    fields: [customerField(), mono('collector_id', 'Collector ID', { required: true })],
  },

  vm: {
    key: 'vm',
    uri: 'vm',
    title: 'Virtual Machines',
    titleSingular: 'Virtual Machine',
    icon: 'cloud',
    canCreate: false,
    defaultSort: 'name',
    fields: [
      link('name', 'Name', '/vm/', { required: true }),
      mono('uuid', 'UUID', { hideInList: true, hideInForm: true }),
      num('num_cores', 'Cores'),
      num('memory_mb', 'Memory (MB)'),
      num('capacity_gb', 'Disk Capacity (GB)'),
      num('ethports', 'NICs'),
      fk('server', 'Hypervisor', 'server', { uriPrefix: '/server/' }),
      customerField(),
    ],
  },

  sf_opportunity: {
    key: 'sf_opportunity',
    uri: 'v3.1/billing/salesforce_opportunity',
    title: 'Opportunities',
    titleSingular: 'Opportunity',
    icon: 'copy',
    idField: 'uuid',
    defaultSort: 'name',
    fields: [
      // Opens the opportunity's invoices.
      link('name', 'Name', '/sf_opportunity/', { required: true }),
      { ...customerField(), required: true },
      text('account_name', 'SFDC Account', { required: true }),
      text('owner_name', 'Owner', { required: true }),
      num('mrc', 'MRC', { required: true }),
      num('nrc', 'NRC', { required: true }),
      text('stage_name', 'Stage', { required: true }),
    ],
  },

  pdu: {
    key: 'pdu',
    uri: 'pdu',
    title: 'PDUs',
    titleSingular: 'PDU',
    icon: 'plug',
    defaultSort: 'name',

    fields: [
      text('name', 'Name', { required: true }),
      text('pdu_type', 'PDU Type'),
      manufacturerField('pdu_manufacturer'),
      fk('model', 'Model', 'pdumodel', { subfield: 'model_number', lookupAccessor: 'model_number' }),
      fk('power_circuit', 'Power Circuit', 'powercircuit'),
      mono('serialnumber', 'Serial Number'),
      cabinetField(),
      customerField(),
      text('user', 'User Name'),
      secret('password', 'Password'),
      salesforceIdField(),
      mono('ip_address', 'IP Address'),
      text('assettag', 'Asset Tag'),
    ],
  },

  cage: {
    key: 'cage',
    uri: 'cage',
    title: 'Cages',
    titleSingular: 'Cage',
    icon: 'square-stack',
    defaultSort: 'name',
    fields: [
      text('name', 'Name', { required: true }),
      fk('datacenter', 'Datacenter', 'datacenter'),
      customerField(),
      salesforceIdField(),
    ],
  },

  powercircuit: {
    key: 'powercircuit',
    uri: 'powercircuit',
    title: 'Power Circuits',
    titleSingular: 'Power Circuit',
    icon: 'plug-zap',
    defaultSort: 'name',
    fields: [
      text('name', 'Name', { required: true }),
      text('assettag', 'Assettag'),
      fk('panel', 'Panel', 'panel'),
      fk('circuit', 'Electric Circuit', 'electricalcircuit'),
      fk('voltagetype', 'Voltage Type', 'voltagetype', { subfield: 'voltage_type', lookupAccessor: 'voltage_type' }),
      fk('ampstype', 'AMPs Type', 'ampstype', { subfield: 'amps_type', lookupAccessor: 'amps_type' }),
      fk('outlettype', 'Outlet Type', 'outlettype', { subfield: 'outlet_type', lookupAccessor: 'outlet_type' }),
      fk('datacenter', 'Datacenter', 'datacenter'),
      customerField(),
      salesforceIdField(),
    ],
  },

  cputype: {
    key: 'cputype',
    uri: 'cpumodel',
    title: 'CPU Models',
    titleSingular: 'CPU Model',
    icon: 'cpu',
    defaultSort: 'name',
    fields: [
      manufacturerField(),
      text('name', 'Model Name', { required: true }),
      num('cores', 'Cores'),
      num('threads_per_core', 'Threads Per Core'),
      num('clock_speed_mhz', 'Clock Speed (MHz)'),
      num('turbo_clock_speed_mhz', 'Turbo Clock Speed (MHz)'),
      num('perf_index', 'Performance Rank'),
    ],
  },

  cpu: {
    key: 'cpu',
    uri: 'cpu',
    title: 'CPUs',
    titleSingular: 'CPU',
    description: 'CPUs installed in servers.',
    icon: 'cpu',
    fields: [
      fk('model', 'CPU Model', 'cpumodel', { required: true }),
      serverField(),
      motherboardField(),
    ],
  },

  memorytype: {
    key: 'memorytype',
    uri: 'memorytype',
    title: 'Memory Models',
    titleSingular: 'Memory Model',
    icon: 'memory-stick',
    defaultSort: 'name',
    fields: [
      text('asset_tag', 'Asset Tag'),
      manufacturerField(),
      text('name', 'Model Name', { required: true }),
      num('memory_mb', 'Memory (MB)'),
      text('ddr_generation', 'DDR Generation'),
      text('ddr_clock_speed', 'Speed'),
      bool('buffered', 'Buffered'),
      bool('ecc', 'ECC'),
      salesforceIdField(),
    ],
  },

  memory: {
    key: 'memory',
    uri: 'memory',
    title: 'Memory',
    titleSingular: 'Memory Module',
    description: 'Memory modules installed in servers.',
    icon: 'memory-stick',
    fields: [
      fk('model', 'Model', 'memorytype', { required: true }),
      mono('serial_number', 'Serial Number'),
      serverField(),
      motherboardField(),
    ],
  },

  disk: {
    key: 'disk',
    uri: 'disk',
    title: 'Disks',
    titleSingular: 'Disk',
    description: 'Physical disks installed in servers.',
    icon: 'hard-drive',
    fields: [mono('serial_number', 'Serial Number'), fk('model', 'Model', 'disktype', { required: true })],
  },

  disktype: {
    key: 'disktype',
    uri: 'disktype',
    title: 'Disk Models',
    titleSingular: 'Disk Model',
    icon: 'hard-drive',
    idField: 'uuid',
    defaultSort: 'name',
    fields: [
      text('name', 'Model Name', { required: true }),
      text('interface', 'Interface'),
      num('rpm', 'RPM'),
      num('seq_read_mbyte_per_sec', 'Seq. Read (MB/s)'),
      num('seq_write_mbyte_per_sec', 'Seq. Write (MB/s)'),
      num('random_iops', 'IOPS Rating'),
      text('form_factor', 'Form Factor'),
      num('capacity_gb', 'Capacity (GB)'),
      text('media_type', 'Media Type'),
      manufacturerField(),
    ],
  },

  nic: {
    key: 'nic',
    uri: 'nic',
    title: 'NICs',
    titleSingular: 'NIC',
    description: 'Network interface cards installed in servers.',
    icon: 'ethernet-port',
    fields: [
      text('assettag', 'Asset Tag'),
      mono('serialnumber', 'Serial Number'),
      fk('nic_model', 'Controller', 'nictype', { subfield: 'controller', lookupAccessor: 'controller' }),
      mono('mac_address', 'MAC Address'),
    ],
  },

  nictype: {
    key: 'nictype',
    uri: 'nictype',
    title: 'NIC Models',
    titleSingular: 'NIC Model',
    icon: 'ethernet-port',
    idField: 'uuid',
    defaultSort: 'controller',
    fields: [
      text('controller', 'NIC Controller', { required: true }),
      num('nic_speed_mbps', 'Speed (Mbit/s)'),
      text('chipset', 'Chipset'),
      salesforceIdField(),
      manufacturerField(),
    ],
  },

  ipmi: {
    key: 'ipmi',
    uri: 'ipmi',
    title: 'IPMI',
    titleSingular: 'IPMI Card',
    description: 'Out-of-band management controllers.',
    icon: 'server-cog',
    fields: [
      fk('model', 'Model', 'ipmitype', { subfield: 'controller', lookupAccessor: 'controller' }),
      serverField(),
      mono('ip_address', 'IP Address'),
      mono('mac_address', 'MAC Address'),
      text('username', 'Username'),
    ],
  },

  ipmi_model: {
    key: 'ipmi_model',
    uri: 'ipmitype',
    title: 'IPMI Models',
    titleSingular: 'IPMI Model',
    icon: 'server-cog',
    defaultSort: 'controller',
    fields: [text('version', 'Version'), text('controller', 'Controller', { required: true }), manufacturerField()],
  },

  ipv4_public_assignments: {
    key: 'ipv4_public_assignments',
    uri: 'public_ipv4_assignments',
    title: 'Public IPv4',
    titleSingular: 'Public IPv4 Assignment',
    icon: 'network',
    idField: 'prefix',
    defaultSort: 'prefix',
    /* Block operations, from services/DjangoService.js:241 - POST to split/ or
       aggregate/ on the row's own url. Split is offered only when the API flags the
       block `splittable`, exactly as the legacy template gated the button. */
    rowActions: [
      {
        kind: 'row-post',
        label: 'Split',
        icon: 'scissors',
        uri: 'split',
        enabledField: 'splittable',
        confirm: 'Split this block into two child blocks? The current block is replaced.',
      },
      {
        kind: 'row-post',
        label: 'Aggregate',
        icon: 'combine',
        uri: 'aggregate',
        confirm: 'Aggregate this block with its sibling back into the parent block?',
      },
    ],
    fields: [
      // The prefix opens the block's individual addresses.
      link('prefix', 'Prefix', '/ipv4-block/', { required: true, idField: 'prefix', cell: 'link' }),
      num('prefixlen', 'Prefix Length'),
      num('num_hosts_int', 'Num Hosts'),
      customerField(),
      text('name', 'Block Name'),
      text('description', 'Description'),
    ],
  },

  ipv4_private_assignments: {
    key: 'ipv4_private_assignments',
    uri: 'private_ipv4_assignments',
    title: 'Private IPv4',
    titleSingular: 'Private IPv4 Assignment',
    icon: 'network',
    idField: 'prefix',
    defaultSort: 'prefix',
    /* Block operations, from services/DjangoService.js:241 - POST to split/ or
       aggregate/ on the row's own url. Split is offered only when the API flags the
       block `splittable`, exactly as the legacy template gated the button. */
    rowActions: [
      {
        kind: 'row-post',
        label: 'Split',
        icon: 'scissors',
        uri: 'split',
        enabledField: 'splittable',
        confirm: 'Split this block into two child blocks? The current block is replaced.',
      },
      {
        kind: 'row-post',
        label: 'Aggregate',
        icon: 'combine',
        uri: 'aggregate',
        confirm: 'Aggregate this block with its sibling back into the parent block?',
      },
    ],
    fields: [
      // The prefix opens the block's individual addresses.
      link('prefix', 'Prefix', '/ipv4-block-private/', { required: true, idField: 'prefix', cell: 'link' }),
      num('prefixlen', 'Prefix Length'),
      num('num_hosts_int', 'Num Hosts'),
      customerField(),
      text('name', 'Block Name'),
      text('description', 'Description'),
    ],
  },

  ipv4_public_allocations: {
    key: 'ipv4_public_allocations',
    uri: 'public_ipv4_allocations',
    title: 'IPv4 ARIN Allocations',
    titleSingular: 'IPv4 Allocation',
    icon: 'wrench',
    idField: 'prefix',
    defaultSort: 'name',
    fields: ipBlockFields(),
  },

  ipv4_private_allocations: {
    key: 'ipv4_private_allocations',
    uri: 'private_ipv4_allocations',
    title: 'Private Allocations',
    titleSingular: 'Private Allocation',
    icon: 'wrench',
    idField: 'prefix',
    defaultSort: 'name',
    fields: ipBlockFields(),
  },

  ipv6alloc: {
    key: 'ipv6alloc',
    uri: 'ipv6_allocations',
    title: 'IPv6 Allocations',
    titleSingular: 'IPv6 Allocation',
    icon: 'wrench',
    idField: 'uuid',
    defaultSort: 'name',
    fields: ipBlockFields(),
  },

  ipv6blocks: {
    key: 'ipv6blocks',
    uri: 'ipv6_blocks',
    title: 'IPv6 Blocks',
    titleSingular: 'IPv6 Block',
    icon: 'network',
    idField: 'uuid',
    defaultSort: 'name',
    fields: [...ipBlockFields(), customerField()],
  },

  customdevice: {
    key: 'customdevice',
    uri: 'customdevice',
    title: 'Other Devices',
    titleSingular: 'Other Device',
    icon: 'box',
    defaultSort: 'name',
    fields: [
      text('name', 'Name', { required: true }),
      cabinetField(),
      multiEdit('customers', 'Customers', 'fast/org'),
    ],
  },

  terminalserver: {
    key: 'terminalserver',
    uri: 'terminalserver',
    title: 'Terminal Servers',
    titleSingular: 'Terminal Server',
    icon: 'terminal',
    defaultSort: 'name',
    fields: [
      text('name', 'Name', { required: true }),
      fk('model', 'Model', 'terminalservermodel'),
      cabinetField(),
      customerField(),
      bool('is_allocated', 'Is Allocated'),
      text('status', 'Status'),
    ],
  },

  cabinet: {
    key: 'cabinet',
    uri: 'cabinet',
    title: 'Cabinets',
    titleSingular: 'Cabinet',
    icon: 'columns',
    defaultSort: 'name',
    fields: [
      text('name', 'Name', { required: true }),
      text('model', 'Model'),
      num('size', 'Size'),
      fk('cabinet_type', 'Type', 'cabinettype', { subfield: 'cabinet_type', lookupAccessor: 'cabinet_type' }),
      fk('cage', 'Cage', 'cage'),
      multiEdit('customers', 'Customers', 'fast/org'),
      salesforceIdField(),
    ],
  },

  server_model: {
    key: 'server_model',
    uri: 'server_model',
    title: 'Server Models',
    titleSingular: 'Server Model',
    icon: 'server',
    defaultSort: 'name',
    fields: [manufacturerField('server_manufacturer'), text('name', 'Name', { required: true }), ...modelLifecycle()],
  },

  mobile_model: {
    key: 'mobile_model',
    uri: 'mobile_model',
    title: 'Mobile Models',
    titleSingular: 'Mobile Model',
    icon: 'smartphone',
    defaultSort: 'name',
    fields: [manufacturerField('mobile_manufacturer'), text('name', 'Name', { required: true }), ...modelLifecycle()],
  },

  storage_model: {
    key: 'storage_model',
    uri: 'storage_model',
    title: 'Storage Models',
    titleSingular: 'Storage Model',
    icon: 'database',
    defaultSort: 'name',
    fields: [manufacturerField('storage_manufacturer'), text('name', 'Name', { required: true }), ...modelLifecycle()],
  },

  motherboard: {
    key: 'motherboard',
    uri: 'motherboard',
    title: 'Motherboards',
    titleSingular: 'Motherboard',
    description: 'Motherboards installed in servers.',
    icon: 'circuit-board',
    defaultSort: 'asset_tag',
    fields: [
      text('asset_tag', 'Asset Tag', { required: true }),
      mono('serial_number', 'Serial Number'),
      fk('model', 'Motherboard Model', 'motherboardmodel'),
    ],
  },

  motherboardmodel: {
    key: 'motherboardmodel',
    uri: 'motherboardmodel',
    title: 'Motherboard Models',
    titleSingular: 'Motherboard Model',
    icon: 'circuit-board',
    defaultSort: 'name',
    fields: [
      text('name', 'Model Name', { required: true }),
      num('num_cpu_sockets', 'Total CPU'),
      num('num_dimm_slots', 'Total Memory Slots'),
      num('num_sata_ports', 'Total SATA Ports'),
      num('num_sas_ports', 'Total SAS Ports'),
      num('num_nic_ports', 'Total NIC Ports'),
      num('max_memory_capacity_gb', 'Memory Capacity'),
      fk('cpu_socket_type', 'CPU Socket Type', 'cpusockettype'),
      fk('nic_model', 'NIC Model', 'nictype', { subfield: 'controller', lookupAccessor: 'controller' }),
      fk('ipmi_controller', 'IPMI Controller', 'ipmitype', { subfield: 'controller', lookupAccessor: 'controller' }),
      manufacturerField(),
    ],
  },

  switchmodel: {
    key: 'switchmodel',
    uri: 'switchmodel',
    title: 'Switch Models',
    titleSingular: 'Switch Model',
    icon: 'network',
    defaultSort: 'name',
    fields: [
      manufacturerField(),
      text('name', 'Model Name', { required: true }),
      num('num_ports', 'Ports'),
      num('num_uplink_ports', 'Uplink Ports'),
      num('port_speed_mbps', 'Port Speed'),
      num('uplink_port_speed_mbps', 'Uplink Port Speed'),
      text('port_phy', 'Port Phy'),
      text('uplink_port_phy', 'Uplink Port Phy'),
      ...modelLifecycle(),
    ],
  },

  loadbalancermodel: {
    key: 'loadbalancermodel',
    uri: 'loadbalancermodel',
    title: 'Load Balancer Models',
    titleSingular: 'Load Balancer Model',
    icon: 'scale',
    defaultSort: 'name',
    fields: [
      manufacturerField(),
      text('name', 'Model Name', { required: true }),
      text('operating_system', 'Operating System'),
      num('num_ports', 'Ports'),
      num('num_uplink_ports', 'Uplink Ports'),
      ...modelLifecycle(),
    ],
  },

  firewallmodel: {
    key: 'firewallmodel',
    uri: 'firewallmodel',
    title: 'Firewall Models',
    titleSingular: 'Firewall Model',
    icon: 'flame',
    defaultSort: 'name',
    fields: [
      manufacturerField(),
      text('name', 'Model Name', { required: true }),
      text('operating_system', 'Operating System'),
      num('num_ports', 'Ports'),
      num('num_uplink_ports', 'Uplink Ports'),
      ...modelLifecycle(),
    ],
  },

  pdumodel: {
    key: 'pdumodel',
    uri: 'pdumodel',
    title: 'PDU Models',
    titleSingular: 'PDU Model',
    icon: 'plug',
    defaultSort: 'model_number',
    fields: [
      manufacturerField('pdu_manufacturer'),
      text('model_number', 'Model Number', { required: true }),
      num('max_amps', 'MAX AMPS'),
      num('num_outlets', 'Number of Outlets'),
      text('outlet_type', 'Outlet Type'),
      num('input_voltage', 'Input Voltage'),
      num('output_voltage', 'Output Voltage'),
      ...modelLifecycle(),
    ],
  },

  terminalservermodel: {
    key: 'terminalservermodel',
    uri: 'terminalservermodel',
    title: 'Terminal Server Models',
    titleSingular: 'Terminal Server Model',
    icon: 'terminal',
    defaultSort: 'name',
    fields: [text('name', 'Model', { required: true }), num('num_ports', 'Total Ports'), manufacturerField()],
  },

  electricalpanel: {
    key: 'electricalpanel',
    uri: 'panel',
    title: 'Electrical Panels',
    titleSingular: 'Electrical Panel',
    icon: 'plug-zap',
    defaultSort: 'name',
    fields: [text('name', 'Name', { required: true }), num('max_num_breakers', 'Max Num Of Breakers')],
  },

  electricalcircuit: {
    key: 'electricalcircuit',
    uri: 'electricalcircuit',
    title: 'Electrical Circuits',
    titleSingular: 'Electrical Circuit',
    icon: 'plug-zap',
    defaultSort: 'name',
    fields: [text('name', 'Name', { required: true }), fk('panel', 'Panel', 'panel')],
  },

  os: {
    key: 'os',
    uri: 'os',
    title: 'Operating Systems',
    titleSingular: 'Operating System',
    icon: 'disc',
    defaultSort: 'name',
    fields: [
      text('name', 'Name', { required: true }),
      text('version', 'Version', { required: true }),
      choice('platform_type', 'Platform Type', ['ESXi', 'Linux', 'Nimble', 'Windows', 'Hypervisor', 'MacOS'], {
        cell: 'badge',
        badgeMap: { ESXi: 'brand', Linux: 'info', Windows: 'info', MacOS: 'neutral', Hypervisor: 'warning', Nimble: 'neutral' },
      }),
    ],
  },

  raidcontrollertype: {
    key: 'raidcontrollertype',
    uri: 'raidcontroller',
    title: 'RAID Controller Types',
    titleSingular: 'RAID Controller Type',
    defaultSort: 'controller',
    fields: [
      text('controller', 'Controller', { required: true }),
      text('assettag', 'Assettag'),
      mono('serialnumber', 'Serial Number'),
      text('raid_support', 'RAID Support'),
      bool('is_allocated', 'Is Allocated'),
      manufacturerField(),
    ],
  },

  sascontrollertype: {
    key: 'sascontrollertype',
    uri: 'sascontroller',
    title: 'SAS Controller Types',
    titleSingular: 'SAS Controller Type',
    defaultSort: 'sascontroller_type',
    fields: [
      text('sascontroller_type', 'Type', { required: true }),
      text('sas_raid_support', 'RAID Support'),
    ],
  },

  chassistype: {
    key: 'chassistype',
    uri: 'chassis',
    title: 'Chassis Types',
    titleSingular: 'Chassis Type',
    defaultSort: 'model_name',
    fields: [
      text('model_name', 'Model Name', { required: true }),
      num('num_psu_slots', 'Total Power Supply Slots'),
      num('num_drive_bays', 'Total Disk Bays'),
      text('drive_bay_width', 'Disk Bay Width'),
      num('num_fan_slots', 'Total Fan Slots'),
      text('dimensions', 'Size'),
      manufacturerField(),
    ],
  },

  cloudtype: {
    key: 'cloudtype',
    uri: 'cloudtype',
    title: 'Cloud Types',
    titleSingular: 'Cloud Type',
    defaultSort: 'cloud_type',
    fields: [
      text('cloud_type', 'Cloud Type', { required: true }),
      num('vcpu', 'VCPU'),
      num('ethports', 'ETH Ports'),
      num('disksize', 'Disk Size'),
      text('disk_measuretype', 'Disk Measure Type'),
      num('memorysize', 'Memory Size'),
      text('memory_measuretype', 'Memory Measure Type'),
    ],
  },

  circuitoption: {
    key: 'circuitoption',
    uri: 'circuitoption',
    title: 'Circuit Options',
    titleSingular: 'Circuit Option',
    defaultSort: 'circuits',
    fields: [
      text('circuits', 'Circuits', { required: true }),
      text('power_type', 'Power Type'),
      text('power_size', 'Power Size'),
      text('power_configuration', 'Configuration'),
    ],
  },

  datacenter: {
    key: 'datacenter',
    uri: 'datacenter',
    title: 'Datacenters',
    titleSingular: 'Datacenter',
    icon: 'database',
    defaultSort: 'name',
    fields: [
      link('name', 'Datacenter Name', '/datacenter/', { required: true }),
      locationField(),
      mono('latitude', 'Latitude'),
      mono('longitude', 'Longitude'),
    ],
  },

  location: {
    key: 'location',
    uri: 'location',
    title: 'Locations',
    titleSingular: 'Location',
    defaultSort: 'name',
    fields: [
      text('name', 'Location Name', { required: true }),
      mono('longitude', 'Longitude'),
      mono('latitude', 'Latitude'),
    ],
  },

  release: {
    key: 'release',
    uri: 'release',
    title: 'Release Notes',
    titleSingular: 'Release',
    icon: 'sticky-note',
    defaultSort: 'version',
    fields: [
      text('name', 'Name', { required: true }),
      bool('is_active', 'Active'),
      text('version', 'Version'),
      text('description', 'Description'),
      mono('file_url', 'File URL'),
      date('release_date', 'Release Date'),
    ],
  },

  user: {
    key: 'user',
    uri: 'user',
    title: 'Users',
    titleSingular: 'User',
    description: 'Platform and tenant user accounts.',
    icon: 'user',
    defaultSort: 'first_name',
    fields: [
      text('first_name', 'First Name', { required: true }),
      text('last_name', 'Last Name', { required: true }),
      link('email', 'Email', '/user/', { required: true, input: 'email' }),
      customerField('org', 'Organization'),
      /* NOTE: the legacy panel scoped these two to the selected organization via
         GET /rest/org/{id}/get_groups_roles/ -> { roles, groups }
         (api/admin-api.js:1221, getGroupssByOrg in controllers/generic.js:4141).
         That endpoint NO LONGER EXISTS on this backend - /rest/org/355/get_groups_roles/
         returns 404 (also checked: /rest/organization/{id}/..., /rest/org/{id}/groups_roles/,
         /rest/fast/org/{id}/...). So these stay global lookups; wiring the cascade
         would leave both fields permanently empty, which is worse than unscoped.
         The form engine now supports cascades (dependsOn/lookupUriFrom) - flip these
         two over the moment the backend exposes the org-scoped endpoint again. */
      {
        name: 'user_roles',
        label: 'User Role',
        cell: 'multiple',
        subfield: 'name',
        input: 'multiple',
        lookupUri: 'role',
        sortable: false,
      },
      {
        name: 'access_types',
        label: 'Access Types',
        cell: 'multiple',
        subfield: 'name',
        input: 'multiple',
        lookupUri: 'access_type',
        sortable: false,
      },
      {
        name: 'ticket_group',
        label: 'Groups',
        cell: 'multiple',
        subfield: 'name',
        input: 'multiple',
        lookupUri: 'fast/ticket_group',
        sortable: false,
      },
      // Legacy offered the full pytz list; the browser's own IANA list is equivalent.
      { name: 'timezone', label: 'Timezone', cell: 'text', input: 'choices', required: true, choices: TIMEZONES },
      bool('is_staff', 'Is Staff'),
      bool('is_active', 'Is Active'),
      /* A real column in the legacy user list (UserController.$scope.rows,
         generic.js:2001) that the port dropped, so there was no way to see or set
         which accounts are customer administrators. */
      bool('is_customer_admin', 'Is Customer Admin'),
      salesforceIdField(),
    ],
  },

  organization: {
    key: 'organization',
    uri: 'org',
    title: 'Organizations',
    titleSingular: 'Organization',
    description: 'Tenants and customers onboarded to the Unity platform.',
    icon: 'building',
    defaultSort: 'name',
    fields: [
      link('name', 'Name', '/organization/', { required: true }),
      text('email', 'Email', { required: true, input: 'email' }),
      choice('organization_type', 'Type', ['INTERNAL', 'EXTERNAL', 'PARTNER', 'DEMO'], {
        cell: 'badge',
        badgeMap: { INTERNAL: 'brand', EXTERNAL: 'info', PARTNER: 'warning', DEMO: 'neutral' },
      }),
      /* Legacy rendered this as inputMethod.type === 'logo' - an ngf-select file
         button capped at 700KB (templates/modal/master_modal.html:150). The port had
         a plain text box, so a logo could not actually be uploaded. Sending it as a
         multipart part named `logo` is what the DRF ImageField on this model expects;
         the legacy controller bound the File into a JSON $resource.update, which
         cannot carry a file at all. */
      {
        name: 'logo',
        label: 'Logo',
        cell: 'text',
        input: 'file',
        accept: 'image/*',
        maxSizeKb: 700,
        hideInList: true,
      },
      bool('is_active', 'Is Active'),
      text('phone', 'Phone', { sortable: false }),
      text('address1', 'Address1', { hideInList: true }),
      text('address2', 'Address2', { hideInList: true }),
      text('city', 'City', { hideInList: true }),
      text('state', 'State', { hideInList: true }),
      text('country', 'Country', { hideInList: true }),
      text('postal_code', 'Postal Code', { hideInList: true }),
      text('domain', 'Domain', { hideInList: true }),
      text('ulid', 'ULID', { hideInList: true }),
      /* Stored as an integer code (live org records carry region: 22). Legacy used an
         obj_choices select over these two values; free text let any string through. */
      {
        name: 'region',
        label: 'Region',
        cell: 'text',
        input: 'obj_choices',
        hideInList: true,
        objChoices: [
          { value: 22, label: 'USA' },
          { value: 11, label: 'Europe' },
        ],
      },
      choice('customer_type', 'Customer Type', ['UL', 'EXT']),
      bool('vpn_status', 'VPN Status', { hideInList: true }),
      multiEdit('unity_modules', 'Unity Modules', 'unity_modules', { hideInList: true }),
      bool('is_management_enabled', 'Management Enabled', { hideInList: true }),
      bool('advanced_discovery', 'Advanced Discovery', { hideInList: true }),
      text('default_snmp_community', 'SNMP Community', { hideInList: true }),
      text('default_snmp_version', 'SNMP Version', { hideInList: true }),
      salesforceIdField(),
      num('storage', 'Storage in TB', { hideInList: true }),
      text('onboarding_status', 'Onboarding Status', { hideInList: true }),
      text('monitor_by', 'Monitor By', { hideInList: true }),
    ],
  },

  /* Editable again. The legacy page (controllers/tools.js:1005 +
     templates/monitor/configuration.html) had Add / Edit / Delete, and each device
     class was a required choice of observium|zabbix. The port made the whole page
     read-only because the stored value is a nested {zabbix, observium} object -
     that is now handled by the field-level toInput/fromInput transforms instead of
     by disabling the page. */
  'monitoring/configure': {
    key: 'monitoring/configure',
    uri: 'org_monitoring_config',
    title: 'Monitoring Configuration',
    titleSingular: 'Monitoring Configuration',
    description: 'Per-organization monitoring coverage across Zabbix and Observium.',
    icon: 'settings',
    fields: [], // populated below, after monitoringToolField is defined
  },

  storage_management: {
    key: 'storage_management',
    uri: 'org_storage',
    title: 'Storage',
    titleSingular: 'Storage Record',
    icon: 'hard-drive',
    fields: [
      customerField('org', 'Organization'),
      fk('datacenter', 'Datacenter', 'datacenter'),
      text('label', 'Label'),
      num('storage', 'Storage in TB'),
      text('storage_type', 'Storage Type'),
    ],
  },

  service_catalogue: {
    key: 'service_catalogue',
    uri: 'service_catalogue',
    title: 'Service Catalogues',
    titleSingular: 'Service Catalogue',
    icon: 'list',
    defaultSort: 'device_type',
    /* Each catalogue entry carries three pricing terms behind a separate endpoint
       (service_term). The legacy list exposed them through a Manage Term icon; the
       port had no way to see or set a price at all. */
    rowActions: [{ kind: 'manage-terms', label: 'Manage Term', icon: 'dollar-sign' }],
    fields: [
      // The eleven values the legacy select offered (uldb-service.js:3014).
      choice('device_type', 'Device Type', [
        'Firewall', 'Load Balancer', 'Switch', 'Hypervisor', 'Virtual Machine', 'Storage',
        'Cloud Controller', 'BM Server', 'Cabinet', 'PDU', 'Mac Device',
      ], { required: true }),
      text('description', 'Catalogue Description'),
      text('provider', 'Provider'),
      text('support_email', 'Support Email'),
      multiEdit('customers', 'Customer', 'fast/org'),
    ],
  },

  service_contract: {
    key: 'service_contract',
    uri: 'v3.1/billing/service_contract',
    title: 'Service Contracts',
    titleSingular: 'Service Contract',
    icon: 'file-text',
    defaultSort: 'number',
    fields: [
      mono('number', 'Contract Number', { required: true }),
      text('vendor', 'Vendor', { required: true }),
      text('type', 'Type', { required: true }),
      mono('product_number', 'Product Number', { required: true }),
      mono('site_id', 'Site ID', { required: true }),
      text('level', 'Level', { required: true }),
      date('start', 'Start Date', { required: true }),
      date('end', 'End Date', { required: true }),
    ],
  },

  aws_amis: {
    key: 'aws_amis',
    uri: 'aws_amis',
    title: 'AWS AMIs',
    titleSingular: 'AWS AMI',
    icon: 'save',
    defaultSort: 'ami_id',
    fields: [
      mono('ami_id', 'Ami_id', { required: true }),
      text('description', 'Description', { required: true }),
      /* GET /rest/aws_ami_regions/ returns a BARE ARRAY OF STRINGS (18 regions),
         so the option label is the value itself. Legacy loaded the same list into a
         required <select>; the port had free text and never called the endpoint. */
      {
        name: 'region',
        label: 'Region',
        cell: 'text',
        input: 'typeahead',
        required: true,
        lookupUri: 'aws_ami_regions',
        lookupLabel: (o) => String(o),
      },
    ],
  },

  'maintenance-schedules': {
    key: 'maintenance-schedules',
    uri: 'v3/mschedules',
    title: 'Maintenance Schedules',
    titleSingular: 'Maintenance Schedule',
    icon: 'calendar',
    defaultSort: 'start_date',
    fields: [
      text('description', 'Description', { required: true }),
      badge('status', 'Status', { F: 'info', O: 'warning', C: 'success' }),
      fk('colo_cloud', 'Datacenter', 'colo_cloud'),
      date('start_date', 'Start Date'),
      date('end_date', 'End Date'),
    ],
  },

  'observium/switch_ports': {
    key: 'observium/switch_ports',
    uri: 'switchport',
    title: 'Switch Port Map',
    titleSingular: 'Port Mapping',
    icon: 'ethernet-port',
    defaultSort: 'name',
    fields: [
      customerField('customer', 'Customer'),
      fk('switch', 'Switch', 'switch'),
      multi('ports', 'Ports'),
      text('name', 'Port Name', { required: true }),
    ],
  },

  /* DevOpsScriptsController (cloud.js:1827). The script body is UPLOADED as a file
     part named `script_file` - Add posts multipart, Edit PATCHes (multipart only when
     a new file is picked), and the eye icon shows the stored `content` read-only.
     Without the upload field no script could be created at all. */
  'services/devops-scripts': {
    key: 'services/devops-scripts',
    uri: 'orchestration/admin_scripts',
    title: 'DevOps Scripts',
    titleSingular: 'Script',
    description: 'Ansible playbooks and Terraform scripts available to the orchestration engine.',
    icon: 'file-code',
    idField: 'uuid',
    defaultSort: 'name',
    rowActions: [
      { kind: 'view-content', label: 'View Script', icon: 'eye', contentField: 'content' },
    ],
    fields: [
      text('name', 'Name', { required: true }),
      { ...text('description', 'Description'), input: 'textarea' },
      choice(
        'script_type',
        'Script type',
        ['Ansible Playbook', 'Terraform Script', 'Bash Script', 'Python Script', 'Powershell Script'],
        {
          cell: 'badge',
          badgeMap: {
            'Ansible Playbook': 'info',
            'Terraform Script': 'brand',
            'Bash Script': 'neutral',
            'Python Script': 'warning',
            'Powershell Script': 'neutral',
          },
        }
      ),
      {
        name: 'script_file',
        label: 'Upload Script',
        cell: 'text',
        input: 'file',
        required: true,
        hideInList: true,
        help: 'Required when adding. Leave empty when editing to keep the current script.',
      },
      // The stored body, shown by the View action - never a column, never a field.
      { name: 'content', label: 'Content', cell: 'text', hideInList: true, hideInForm: true },
      date('created_at', 'Created On', { hideInForm: true }),
      date('updated_at', 'Updated On', { hideInForm: true }),
      text('edited_by', 'Updated By', { hideInForm: true }),
      mono('file_name', 'File', { hideInList: true, hideInForm: true }),
    ],
  },

  'openstack-dashboard': {
    key: 'openstack-dashboard',
    uri: 'openstack/controller',
    title: 'OpenStack API Accounts',
    titleSingular: 'OpenStack Account',
    icon: 'cloud',
    defaultSort: 'hostname',
    rowActions: [changePasswordAction('openstack/controller/change_password')],
    fields: [
      mono('hostname', 'Auth URL', { required: true }),
      text('username', 'Username', { required: true }),
      // required on Add, as in the legacy form (uldb-service.js:5642). Blank on
      // Edit is now stripped before submit, so it no longer wipes the credential.
      { ...secret('password', 'Password'), required: true },
      text('project', 'Project Name'),
      text('user_domain', 'User Domain'),
      text('project_domain', 'Project Domain'),
      fk('private_cloud', 'Cloud', 'v3.1/private_cloud', { idField: 'uuid' }),
    ],
  },

  'vmware-dashboard': {
    key: 'vmware-dashboard',
    uri: 'vmware/vcenter',
    title: 'vCenter API Accounts',
    titleSingular: 'vCenter Account',
    icon: 'cloud',
    defaultSort: 'hostname',
    rowActions: [changePasswordAction('vmware/vcenter/change_password')],
    fields: [
      mono('hostname', 'Vcenter Host', { required: true }),
      text('username', 'Username', { required: true }),
      { ...secret('password', 'Password'), required: true },
      num('port', 'Port'),
      fk('private_cloud', 'Cloud', 'v3.1/private_cloud', { idField: 'uuid' }),
    ],
  },

  /* The fourth VMware tab in the legacy panel (/vmware-config ->
     VMwareVcenterConfigController). It had no React route at all. Field list matches a
     live /rest/vmware/vcenter_config/ record. */
  'vmware-config': {
    key: 'vmware-config',
    uri: 'vmware/vcenter_config',
    title: 'vCenter Config',
    titleSingular: 'vCenter Config',
    icon: 'settings',
    defaultSort: 'network_name',
    fields: [
      text('network_name', 'Network Name', { required: true }),
      text('network_type', 'Platform Type', { required: true }),
      mono('ip_network_cidr', 'IP Network CIDR', { required: true }),
      mono('gateway', 'Gateway', { required: true }),
      text('datacenter_name', 'Datacenter Name', { required: true }),
      text('cluster_name', 'Cluster Name', { required: true }),
      text('datastore_name', 'Datastore Name', { required: true }),
      fk('vcenter', 'vCenter', 'vmware/vcenter', { subfield: 'hostname', lookupAccessor: 'hostname' }),
      date('created_at', 'Created', { hideInForm: true, hideInList: true }),
      date('updated_at', 'Updated', { hideInForm: true, hideInList: true }),
    ],
  },

  'vmware-vcenter': {
    key: 'vmware-vcenter',
    uri: 'vcenter',
    title: 'vCenter Proxies',
    titleSingular: 'vCenter Proxy',
    icon: 'cloud',
    defaultSort: 'name',
    /* The device's own web UI, behind the reverse proxy (legacy 'Load in iframe'). */
    rowActions: [{ kind: 'open-proxy', label: 'Load in iframe', icon: 'monitor', contentField: 'proxy_fqdn' }],
    fields: [...proxyFields('account', 'vCenter API', 'vmware/vcenter')],
  },

  'vmware-esxi': {
    key: 'vmware-esxi',
    uri: 'esxi',
    title: 'VMware ESXi Proxies',
    titleSingular: 'ESXi Proxy',
    icon: 'cloud',
    defaultSort: 'name',
    /* The device's own web UI, behind the reverse proxy (legacy 'Load in iframe'). */
    rowActions: [{ kind: 'open-proxy', label: 'Load in iframe', icon: 'monitor', contentField: 'proxy_fqdn' }],
    fields: proxyFields('server', 'Server', 'server'),
  },

  'openstack-proxy': {
    key: 'openstack-proxy',
    uri: 'openstack_proxy',
    title: 'OpenStack Proxies',
    titleSingular: 'OpenStack Proxy',
    icon: 'cloud',
    defaultSort: 'name',
    /* The device's own web UI, behind the reverse proxy (legacy 'Load in iframe'). */
    rowActions: [{ kind: 'open-proxy', label: 'Load in iframe', icon: 'monitor', contentField: 'proxy_fqdn' }],
    fields: proxyFields('cloud', 'Cloud', 'v3.1/private_cloud'),
  },

  /* ---- Public cloud account inventories ----
   * Field sets are the legacy onboarding contracts, NOT invented ones. The earlier
   * port guessed at account_name/account_id/customer/status, none of which the API
   * accepts, so an AWS or Azure account could never actually be onboarded.
   *   AWS   controllers/v3/aws/awsdashboardcontroller.js:156  add  = user, email,
   *         access_key, secret_key, region;  edit = user, email, region (the keys
   *         rotate through the separate Change API Keys action, so both are
   *         hideOnEdit here - otherwise an edit would blank them).
   *   Azure controllers/v3/azure/azuredashboardcontroller.js:105 = account_name,
   *         user, user_name, secret_key, subscription_id - all required.
   */
  'aws-dashboard': {
    key: 'aws-dashboard',
    uri: 'v3/aws',
    title: 'AWS Accounts',
    titleSingular: 'AWS Account',
    description: 'Amazon Web Services accounts onboarded to Unity.',
    icon: 'box',
    defaultSort: 'user',
    /* The four account actions from awsdashboardcontroller.js. Show Inventory and
       Virtual Machines both open the region inventory - legacy landed on the same page
       with a different default table, which the region page's tabs now cover.
       Change API Keys reuses the shared credential-rotation modal. */
    rowActions: [
      { kind: 'row-link', label: 'Show Inventory', icon: 'layers', to: '/aws/{id}/region/{region}' },
      { kind: 'row-link', label: 'Virtual Machines', icon: 'server', to: '/aws/{id}/region/{region}' },
      changePasswordAction('v3/aws/change_password'),
    ],
    fields: [
      fk('user', 'User', 'fast/user', { subfield: 'email', lookupAccessor: 'email', required: true }),
      text('email', 'Email', { input: 'email' }),
      mono('access_key', 'Access Key', { required: true, hideInList: true, hideOnEdit: true }),
      { ...secret('secret_key', 'Secret Key'), required: true, hideOnEdit: true },
      choice('region', 'Region', AWS_REGIONS, { required: true }),
      num('instance_count', 'Instances', { hideInForm: true }),
      badge('status', 'Status', { ACTIVE: 'success', SYNCING: 'info', ERROR: 'danger' }, { hideInForm: true }),
    ],
  },

  'azure-dashboard': {
    key: 'azure-dashboard',
    uri: 'v3/azure',
    title: 'Azure Accounts',
    titleSingular: 'Azure Account',
    description: 'Microsoft Azure subscriptions onboarded to Unity.',
    icon: 'monitor',
    defaultSort: 'account_name',
    /* The subscription's resource groups, and the resources and VMs inside them. */
    rowActions: [
      { kind: 'row-link', label: 'Resource Groups', icon: 'boxes', to: '/azure/{id}/resource-groups' },
    ],
    fields: [
      text('account_name', 'Account Name', { required: true }),
      fk('user', 'User', 'fast/user', { subfield: 'email', lookupAccessor: 'email', required: true }),
      text('user_name', 'User Name', { required: true }),
      { ...secret('secret_key', 'Password'), required: true },
      mono('subscription_id', 'Subscription ID', { required: true }),
      num('instance_count', 'Instances', { hideInForm: true }),
      badge('status', 'Status', { ACTIVE: 'success', SYNCING: 'info', ERROR: 'danger' }, { hideInForm: true }),
    ],
  },

  'cloud_setup/private_cloud': {
    key: 'cloud_setup/private_cloud',
    uri: 'v3.1/private_cloud',
    title: 'Private Clouds',
    titleSingular: 'Private Cloud',
    icon: 'cloud',
    idField: 'uuid',
    defaultSort: 'name',
    fields: [
      text('name', 'Cloud Name', { required: true }),
      customerField(),
      fk('colocation_cloud', 'Datacenter', 'colo_cloud'),
      text('platform_type', 'Platform Type'),
      num('vcpu', 'vCPUs'),
      num('memory', 'RAM in GB'),
      num('storage', 'Storage in TB'),
    ],
  },

  // ---- Tabbed network device pages (legacy master_list_tab.html) ----
  switch: {
    key: 'switch',
    uri: 'switch',
    title: 'Switches',
    titleSingular: 'Switch',
    icon: 'network',
    tabs: [
      {
        label: 'All Switches',
        uri: 'switch',
        titleSingular: 'Switch',
        fields: [
          link('name', 'Name', '/switch/', { required: true }),
          text('asset_tag', 'Asset Tag'),
          fk('model', 'Model', 'switchmodel'),
          cabinetField(),
          text('user', 'User Name'),
          mono('serial_number', 'Serial Number'),
          multiEdit('customers', 'Customers', 'fast/org'),
          bool('is_shared', 'Shared'),
          bool('is_unitedconnect', 'UnitedConnect'),
        ],
      },
      { label: 'Cisco', uri: 'cisco_switch', titleSingular: 'Cisco Switch', fields: proxyFields('switch', 'Switch', 'switch') },
      { label: 'Juniper', uri: 'juniper_switch', titleSingular: 'Juniper Switch', fields: proxyFields('switch', 'Switch', 'switch') },
    ],
  },

  firewall: {
    key: 'firewall',
    uri: 'firewall',
    title: 'Firewalls',
    titleSingular: 'Firewall',
    icon: 'flame',
    tabs: [
      {
        label: 'All Firewalls',
        uri: 'firewall',
        titleSingular: 'Firewall',
        fields: [
          link('name', 'Name', '/firewall/', { required: true }),
          text('asset_tag', 'Asset Tag'),
          fk('model', 'Model', 'firewallmodel'),
          cabinetField(),
          mono('serial_number', 'Serial Number'),
          multiEdit('customers', 'Customers', 'fast/org'),
          bool('is_shared', 'Shared'),
        ],
      },
      { label: 'Cisco', uri: 'cisco_firewall', titleSingular: 'Cisco Firewall', fields: proxyFields('firewall', 'Firewall', 'firewall') },
      { label: 'Juniper', uri: 'juniper_firewall', titleSingular: 'Juniper Firewall', fields: proxyFields('firewall', 'Firewall', 'firewall') },
    ],
  },

  loadbalancer: {
    key: 'loadbalancer',
    uri: 'loadbalancer',
    title: 'Load Balancers',
    titleSingular: 'Load Balancer',
    icon: 'scale',
    tabs: [
      {
        label: 'All Load Balancers',
        uri: 'loadbalancer',
        titleSingular: 'Load Balancer',
        fields: [
          link('name', 'Name', '/loadbalancer/', { required: true }),
          text('asset_tag', 'Asset Tag'),
          fk('model', 'Model', 'loadbalancermodel'),
          cabinetField(),
          mono('serial_number', 'Serial Number'),
          multiEdit('customers', 'Customers', 'fast/org'),
          bool('is_shared', 'Shared'),
        ],
      },
      {
        label: 'Virtual',
        uri: 'virtual_load_balancer',
        titleSingular: 'Virtual Load Balancer',
        fields: [
          text('name', 'Name', { required: true }),
          fk('model', 'Model', 'loadbalancermodel'),
          customerField(),
        ],
      },
      {
        label: 'Citrix VPX',
        uri: 'citrix_vpx_device',
        titleSingular: 'Citrix VPX',
        fields: proxyFields('load_balancer', 'Load Balancer', 'loadbalancer'),
        rowActions: [{ kind: 'open-proxy', label: 'Load in iframe', icon: 'monitor', contentField: 'proxy_fqdn' }],
      },
      {
        label: 'F5',
        uri: 'f5loadbalancer',
        titleSingular: 'F5 Load Balancer',
        fields: proxyFields('load_balancer', 'Load Balancer', 'loadbalancer'),
        rowActions: [{ kind: 'open-proxy', label: 'Load in iframe', icon: 'monitor', contentField: 'proxy_fqdn' }],
      },
    ],
  },

  // ---- UnityConnect (Megaport) ----
  unitedconnect: {
    key: 'unitedconnect',
    uri: 'unitedconnect',
    title: 'UnityConnect',
    titleSingular: 'UnityConnect Port',
    description: 'Megaport-backed ports and virtual cross connects.',
    icon: 'cable',
    defaultSort: 'name',
    tabs: [
      { label: 'Ports', uri: 'unitedconnect', titleSingular: 'Port' },
      { label: 'VXCs', uri: 'vxc', titleSingular: 'VXC' },
    ],
  },

  manage_unitedconnect: {
    key: 'manage_unitedconnect',
    uri: 'unitedconnect/megaport_location',
    title: 'UCPort Locations',
    titleSingular: 'Location',
    description: 'Megaport locations available for UnityConnect ports.',
    icon: 'plug',
    tabs: [
      { label: 'UC Locations', uri: 'unitedconnect/megaport_location', titleSingular: 'Location' },
      { label: 'UC Partner Locations', uri: 'unitedconnect/megaport_partner_location', titleSingular: 'Partner Location' },
    ],
  },

  // System Monitoring > Networking: one page over three network inventories.
  'integ/net': {
    key: 'integ/net',
    uri: 'observium_host',
    title: 'Networking',
    titleSingular: 'Network Object',
    icon: 'radio',
    tabs: [
      {
        label: 'Observium Hosts',
        uri: 'observium_host',
        titleSingular: 'Observium Host',
        fields: [
          // Opens the host's interface table.
          link('hostname', 'Name', '/observium_host/', { required: true }),
          text('location', 'Location'),
          text('os', 'OS'),
          mono('serial', 'Serial'),
          text('type', 'Type'),
          num('uptime', 'Uptime'),
          text('uptime_human', 'Uptime (Human)'),
          text('version', 'Version'),
        ],
      },
      {
        label: 'Transit Ports',
        uri: 'transit_port',
        titleSingular: 'Transit Port',
        fields: [
          fk('datacenter', 'Datacenter', 'datacenter'),
          fk('switch', 'Switch', 'switch'),
          text('interface_name', 'Interface Name', { required: true }),
        ],
      },
      {
        label: 'Graphed Ports',
        uri: 'graphed_port',
        titleSingular: 'Graphed Port',
        fields: [
          fk('switch', 'Switch', 'switch'),
          text('interface_name', 'Interface Name', { required: true }),
          customerField('organization', 'Organization'),
        ],
      },
    ],
  },


  sf_import_oppty: {
    key: 'sf_import_oppty',
    uri: 'v3.1/billing/salesforce_opportunity',
    title: 'Import Opportunities',
    titleSingular: 'Opportunity',
    description: 'Salesforce opportunities available to import into Unity.',
    icon: 'upload',
    defaultSort: 'name',
    canCreate: false,
    fields: [
      text('name', 'Oppty. Name', { required: true }),
      text('owner_name', 'Account Owner'),
      badge('stage_name', 'Stage Name', {
        'Closed Won': 'success',
        'Closed Lost': 'danger',
        Negotiation: 'warning',
        Prospecting: 'info',
      }),
      customerField(),
      num('mrc', 'MRC'),
      num('nrc', 'NRC'),
    ],
  },

  'aiops/sources': {
    key: 'aiops/sources',
    uri: 'aiops/event-source',
    title: 'AIOPS Sources',
    titleSingular: 'AIOPS Source',
    icon: 'bell',
    idField: 'uuid',
    fields: [
      /* The source catalog is /rest/monitoring-tool/ ({id,name}) - the port pointed
         this lookup at the mapping list itself, so no valid source could be picked.
         Customer was a raw numeric id box instead of an organization picker. */
      fk('source', 'Source', 'monitoring-tool', { required: true }),
      /* `customer` is stored as a bare organization ID (live rows carry e.g. 251), not
         an object - so the picker submits the id while the column stays honest about
         showing one. Legacy did the same: a <select> over /rest/org/ bound with
         `c.id as c.name`. */
      {
        ...customerField('customer', 'Customer ID'),
        required: true,
        toInput: (value) => (value && typeof value === 'object' ? value : value ? { id: value } : null),
        fromInput: (value) => {
          const v = value as Record<string, unknown> | null;
          return v && typeof v === 'object' ? v.id : v;
        },
      },
      num('source_account_count', 'Accounts', { hideInForm: true }),
      text('categorizing_field', 'Categorizing Field'),
      text('type_identifying_field', 'Type Field'),
      mono('uuid', 'UUID', { hideInList: true, hideInForm: true }),
    ],
  },

  'activity/logs': {
    key: 'activity/logs',
    uri: 'activity_logs',
    title: 'Activity Log',
    titleSingular: 'Activity',
    icon: 'scroll-text',
    canCreate: false,
    canEdit: false,
    canDelete: false,
    defaultSort: 'created_at',
  },

  /* A parameterised REPORT, not a CRUD list: the legacy page took an organization
     and a date range and called GET /rest/devicereport/get_device_report/, with an
     Export button on /rest/devicereport/download/. Offering Create/Edit/Delete on
     it was wrong. NOTE: uri 'device_reports' does not exist (verified: GET
     /rest/device_reports/ -> 404); the report page itself is tracked separately. */
  device_reports: {
    key: 'device_reports',
    uri: 'device_reports',
    title: 'Device Reports',
    titleSingular: 'Device Report',
    description: 'Per-organization device counts (read-only report).',
    icon: 'bar-chart-3',
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },

  /* Salesforce Product2 is a READ-ONLY passthrough to Salesforce - the legacy page
     (controllers/billing.js:6 + templates/salesforce/product2.html) had no Add,
     Edit or Delete, only a search box. The generic engine was offering all three.
     NOTE: uri 'sf_product' does not exist on the backend (verified: GET
     /rest/sf_product/ -> 404). The real source is /salesforce/products/, which
     lives OUTSIDE /rest and needs its own proxy prefix - tracked separately. */
  sf_product2: {
    key: 'sf_product2',
    uri: 'sf_product',
    title: 'Products',
    titleSingular: 'Product',
    description: 'Salesforce Product2 catalogue (read-only).',
    icon: 'list',
    canCreate: false,
    canEdit: false,
    canDelete: false,
    defaultSort: 'Name',
    fields: [
      mono('Id', 'Id'),
      text('Name', 'Name'),
      text('ProductCode', 'Product Code'),
      bool('IsActive', 'Active'),
      text('Description', 'Description'),
    ],
  },
};

/* ---- Monitoring configuration (nested {zabbix, observium} toggle matrix) ---- */
// Renders a {zabbix, observium} toggle object as the list of enabled tools.
const monitoringTools = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '-';
  const v = value as Record<string, unknown>;
  const on = ['zabbix', 'observium'].filter((k) => v[k] === true).map((k) => (k === 'zabbix' ? 'Zabbix' : 'Observium'));
  return on.length ? on.join(' + ') : 'Off';
};

/*
 * One device class. Stored as { zabbix: bool, observium: bool }; edited as a single
 * choice, exactly as the legacy form did (its orgMonitoringConfigToolNameFilter
 * flattened the object to the selected key). toInput/fromInput bridge the two.
 */
const monitoringToolField = (name: string, label: string, hideInList = false): FieldDef => ({
  name,
  label,
  cell: 'text',
  sortable: false,
  hideInList,
  format: monitoringTools,
  input: 'choices',
  choices: ['zabbix', 'observium'],
  toInput: (value) => {
    if (!value || typeof value !== 'object') return '';
    const v = value as Record<string, unknown>;
    if (v.zabbix === true) return 'zabbix';
    if (v.observium === true) return 'observium';
    return '';
  },
});

/* The ten classes the legacy page showed, kept as visible columns... */
const MONITORING_CLASSES: Array<[string, string]> = [
  ['switch', 'Switch'],
  ['firewall', 'Firewall'],
  ['load_balancer', 'Load Balancer'],
  ['hypervisor', 'Hypervisor'],
  ['baremetal', 'Bare Metal Server'],
  ['mac_device', 'MAC Devices'],
  ['vm', 'Virtual Machines'],
  ['storage', 'Storage'],
  ['database', 'Databases'],
  ['pdu', 'PDU'],
];

/* ...and the classes the live API also stores but the port never surfaced at all
   (verified on a real org_monitoring_config record). Form-only: 23 visible columns
   would make the table unreadable, but an admin still needs to set them. */
const MONITORING_CLASSES_EXTRA: Array<[string, string]> = [
  ['container', 'Containers'],
  ['custom', 'Custom'],
  ['azure_resource', 'Azure Resources'],
  ['meraki', 'Meraki'],
  ['meraki_device', 'Meraki Devices'],
  ['meraki_organization', 'Meraki Organizations'],
  ['viptela', 'Viptela'],
  ['viptela_device', 'Viptela Devices'],
  ['veeam', 'Veeam'],
  ['VMware', 'VMware'],
  ['smart_pdu', 'Smart PDU'],
  ['sensor', 'Sensors'],
  ['rfid_reader', 'RFID Readers'],
];

RESOURCES['monitoring/configure'].fields = [
  customerField('org', 'Organization'),
  ...MONITORING_CLASSES.map(([n, l]) => monitoringToolField(n, l)),
  ...MONITORING_CLASSES_EXTRA.map(([n, l]) => monitoringToolField(n, l, true)),
];

/* ---- Manufacturer family: single-name lookup tables ---- */
const MANUFACTURERS: Array<[string, string, string, string]> = [
  ['manufacturer', 'manufacturer', 'Manufacturers', 'Manufacturer'],
  ['system_manufacturers', 'server_manufacturer', 'System Manufacturers', 'System Manufacturer'],
  ['storage_manufacturer', 'storage_manufacturer', 'Storage Manufacturers', 'Storage Manufacturer'],
  ['pdu_manufacturer', 'pdu_manufacturer', 'PDU Manufacturers', 'PDU Manufacturer'],
  ['mobile_manufacturer', 'mobile_manufacturer', 'Mobile Manufacturers', 'Mobile Manufacturer'],
];
MANUFACTURERS.forEach(([key, uri, title, titleSingular]) => {
  RESOURCES[key] = {
    key,
    uri,
    title,
    titleSingular,
    icon: 'factory',
    defaultSort: 'name',
    fields: [text('name', 'Name', { required: true })],
  };
});

/* ---- Single-column type/option tables (uldb-service.js: the field name is NOT
 * always "name" - producttype stores `product_type`, cabinettype `cabinet_type`,
 * and so on, which is why each row carries its own column key). ---- */
const SINGLE_COLUMN_TYPES: Array<[string, string, string, string, string, string]> = [
  // [routeKey, uri, plural, singular, columnKey, columnLabel]
  ['producttype', 'producttype', 'Product Types', 'Product Type', 'product_type', 'Product Type'],
  ['peripheraltype', 'peripheraltype', 'Peripheral Types', 'Peripheral Type', 'peripheral_type', 'Peripheral Type'],
  ['clustertype', 'clustertype', 'Cluster Types', 'Cluster Type', 'name', 'Cluster Type'],
  ['cabinettype', 'cabinettype', 'Cabinet Types', 'Cabinet Type', 'cabinet_type', 'Cabinet Type'],
  ['cabinetoption', 'cabinetoption', 'Cabinet Options', 'Cabinet Option', 'cabinet_options', 'Cabinet Options'],
  ['voltagetype', 'voltagetype', 'Voltage Types', 'Voltage Type', 'voltage_type', 'Voltage Type'],
  ['ampstype', 'ampstype', 'Amp Types', 'Amp Type', 'amps_type', 'AMPS Type'],
  ['outlettype', 'outlettype', 'Outlet Types', 'Outlet Type', 'outlet_type', 'Outlet Type'],
  ['diskcontrollertype', 'diskcontroller', 'Disk Controller Types', 'Disk Controller Type', 'controller', 'Controller'],
];
SINGLE_COLUMN_TYPES.forEach(([key, uri, title, titleSingular, columnKey, columnLabel]) => {
  RESOURCES[key] = {
    key,
    uri,
    title,
    titleSingular,
    defaultSort: columnKey,
    fields: [text(columnKey, columnLabel, { required: true })],
  };
});

/* ---- Monitoring: Zabbix ---- */
RESOURCES['zabbix/instance'] = {
  key: 'zabbix/instance',
  uri: 'zabbix/instance',
  title: 'Zabbix Instances',
  titleSingular: 'Zabbix Instance',
  icon: 'bar-chart-3',
  defaultSort: 'account_name',
  rowActions: [changePasswordAction('zabbix/instance/change_password')],
  fields: [
    text('account_name', 'Account Name', { required: true }),
    mono('hostname', 'Hostname', { required: true }),
    text('username', 'Username', { required: true }),
    secret('password', 'Password'),
    multiEdit('customers', 'Customers', 'fast/org'),
    text('version', 'Version'),
  ],
};

RESOURCES['zabbix/customer_instance_map'] = {
  key: 'zabbix/customer_instance_map',
  uri: 'zabbix/zabbix_customers',
  title: 'Zabbix Customer Map',
  titleSingular: 'Customer Mapping',
  icon: 'building',
  fields: [
    customerField('customer', 'Customer'),
    {
      name: 'zabbix_instance',
      label: 'Zabbix Instance',
      cell: 'fk',
      subfield: 'account_name',
      input: 'typeahead',
      lookupUri: 'zabbix/instance',
      lookupAccessor: 'account_name',
    },
    text('account_name', 'Instance'),
  ],
};

/*
 * Zabbix Template Definition (ZabbixTemplateDefinitionController, tools.js:1039).
 *
 * Two things were missing. The template was a free-text name plus a hand-typed numeric
 * id, when legacy picked it from GET rest/zabbix/instance/{id}/templates/ - so the
 * instance -> template cascade is what supplies both the id and the name. And the
 * twelve `item_key` metric keys, which are the entire point of a definition (they tell
 * the collector which Zabbix item to read for status, power, CPU, memory and so on),
 * had no fields and no columns at all.
 */
const ZABBIX_ITEM_KEYS: Array<[string, string]> = [
  ['status', 'Status'],
  ['power', 'Power'],
  ['temperature', 'Temperature'],
  ['uptime', 'UpTime'],
  ['voltage', 'Voltage'],
  ['current', 'Current'],
  ['storage_total', 'Storage Total'],
  ['storage_used', 'Storage Used'],
  ['cpu', 'CPU'],
  ['cpu_count', 'CPU Count'],
  ['memory', 'Memory'],
  ['total_memory', 'Total Memory'],
];

const zabbixItemKeyField = ([name, label]: [string, string]): FieldDef => ({
  name,
  label: `${label} key`,
  cell: 'mono',
  group: 'item_key',
  sortable: false,
  // The column reads out of the nested object; the form edits it flat.
  format: (_v, row) => {
    const bag = row.item_key as ApiRecord | undefined;
    const v = bag ? bag[name] : undefined;
    return v == null || v === '' ? '-' : String(v);
  },
  toInput: (_v, row) => {
    const bag = row.item_key as ApiRecord | undefined;
    return bag && bag[name] != null ? bag[name] : '';
  },
});

RESOURCES['zabbix/template_definition'] = {
  key: 'zabbix/template_definition',
  uri: 'zabbix/zabbix_templates',
  title: 'Zabbix Template Definitions',
  titleSingular: 'Template Definition',
  icon: 'file-text',
  defaultSort: 'template_name',
  fields: [
    {
      name: 'zabbix_instance',
      label: 'Instance',
      cell: 'fk',
      subfield: 'account_name',
      input: 'typeahead',
      required: true,
      lookupUri: 'zabbix/instance',
      lookupAccessor: 'account_name',
    },
    /* Picking a template fills BOTH template_id and template_name, exactly as
       onSubmit() did in the legacy controller. Note the endpoint here is
       .../templates/ (the instance's raw Zabbix templates), NOT the
       .../zabbix_templates/ used by Template Mapping, and its option label is
       `name` rather than `template_name`. */
    {
      name: 'template_id',
      label: 'Templates',
      cell: 'number',
      input: 'typeahead',
      required: true,
      dependsOn: 'zabbix_instance',
      lookupUriFrom: (inst) => {
        const id = inst && typeof inst === 'object' ? (inst as ApiRecord).id : inst;
        return id === undefined || id === null ? null : `zabbix/instance/${String(id)}/templates`;
      },
      lookupAccessor: 'name',
      sortable: false,
      hideInList: true,
      // Stored flat as the id; edited as the whole option so the label can show.
      toInput: (_v, row) =>
        row.template_id == null ? null : { template_id: row.template_id, name: row.template_name },
      fromInput: (v) => (v && typeof v === 'object' ? (v as ApiRecord).template_id : v),
    },
    /* Derived from the picked template - a column, never typed. fromInput reads the
       whole form so it can take the name off whatever template_id holds, which is
       what the legacy onSubmit() did before POSTing. */
    {
      name: 'template_name',
      label: 'Template',
      cell: 'text',
      hideInForm: true,
      fromInput: (_v, values) => {
        const picked = values.template_id;
        return picked && typeof picked === 'object' ? (picked as ApiRecord).name : undefined;
      },
    },
    ...ZABBIX_ITEM_KEYS.map(zabbixItemKeyField),
  ],
};

// [tab label, endpoint suffix, mapped-device field name, mapped-device label]
// [tab label, endpoint suffix, device field, device label, device lookup, display prop]
const ZABBIX_DEVICE_TABS: Array<[string, string, string, string, string, string]> = [
  ['Switches', 'switch', 'switch', 'Switch', 'fast/switch', 'name'],
  ['Firewalls', 'firewall', 'firewall', 'Firewall', 'fast/firewall', 'name'],
  ['Load Balancers', 'loadbalancer', 'loadbalancer', 'Loadbalancer', 'fast/load_balancer', 'name'],
  ['PDUs', 'pdu', 'pdu', 'PDU', 'fast/pdu', 'name'],
  ['Storage', 'storagedevice', 'storagedevice', 'Storage', 'fast/storagedevice', 'name'],
  ['Servers', 'server', 'server', 'Server', 'fast/server', 'name'],
  ['BM Servers', 'bm_server', 'server', 'Server', 'fast/server', 'name'],
  ['Database Servers', 'databaseserver', 'database_server', 'Database Server', 'fast/database_server', 'name'],
  ['Custom VMs', 'customvm', 'customvm', 'Custom VirtualMachine', 'fast/vm', 'display_name'],
  ['ESXi VMs', 'esxivm', 'esxivm', 'ESXI VirtualMachine', 'fast/esxi_vm', 'display_name'],
  ['HyperV VMs', 'hypervvm', 'hypervvm', 'Hyper-V VirtualMachine', 'fast/hyperv_vm', 'display_name'],
  ['OpenStack VMs', 'openstackvm', 'openstackvm', 'OpenStack VirtualMachine', 'fast/openstack_vm', 'display_name'],
  ['vCloud VMs', 'vcloudvm', 'vcloudvm', 'Vcloud VirtualMachine', 'fast/vcloud_vm', 'display_name'],
  ['VMware VMs', 'vmwarevm', 'vmwarevm', 'VMware VirtualMachine', 'fast/vmware_vm', 'display_name'],
  ['Mac Devices', 'macdevice', 'macdevice', 'Mac devices', 'fast/macdevice', 'name'],
];

RESOURCES['zabbix/device_map'] = {
  key: 'zabbix/device_map',
  uri: 'zabbix/switch',
  title: 'Zabbix Device Map',
  titleSingular: 'Device Mapping',
  icon: 'network',
  tabs: ZABBIX_DEVICE_TABS.map(
    ([label, uri, deviceName, deviceLabel, lookup, accessor]): ResourceTab => ({
      label,
      uri: `zabbix/${uri}`,
      titleSingular: 'Device Mapping',
      fields: zabbixMapFields(deviceName, deviceLabel, lookup, accessor),
    })
  ),
};

/*
 * Zabbix Template Mapping (ZabbixTemplateMappingController, controllers/tools.js:1139).
 *
 * Every tab is the same form over a different endpoint: pick a Zabbix instance, pick a
 * template FROM that instance, optionally pick an interface type, then pick the thing
 * being mapped - which is either a static list or another resource, and for server
 * manufacturers a second, dependent Server Model select.
 *
 * The port declared the ten tabs but gave them no fields at all, so Add and Edit opened
 * an empty form and no mapping could be created or corrected.
 */
const ZABBIX_OS_TYPES = ['ESXi', 'Hypervisor', 'Linux', 'MacOS', 'Nimble', 'Windows'];

const ZABBIX_PUBLIC_CLOUD_TYPES = [
  { value: 'aws', label: 'Amazon Web Services (AWS)' },
  { value: 'azure', label: 'Microsoft Azure' },
  { value: 'gcp', label: 'Google Cloud Platform (GCP)' },
  { value: 'oci', label: 'Oracle Cloud Infrastructure (OCI)' },
];

const ZABBIX_PRIVATE_CLOUD_TYPES = [
  { value: 'VMware', label: 'Vmware Vcenter' },
  { value: 'United Private Cloud vCenter', label: 'United Private Cloud vCenter' },
];

const ZABBIX_CONTROLLER_TYPES = [{ value: 'docker', label: 'Docker' }];

const ZABBIX_INTEG_ACCOUNT_TYPES = [
  { value: 'veeam', label: 'Veeam' },
  { value: 'viptela', label: 'Viptela' },
  { value: 'meraki', label: 'Cisco Meraki' },
];

/* The instance picker, and the template picker that depends on it. Templates come from
   GET rest/zabbix/instance/{id}/zabbix_templates/ - a BARE ARRAY of
   { template_id, template_name } - so the whole object is stored, as legacy did
   (ng-options="tmpl as tmpl.template_name ... track by tmpl.template_id"). */
const zabbixInstanceField = (): FieldDef => ({
  name: 'zabbix_instance',
  label: 'Instance',
  cell: 'fk',
  subfield: 'account_name',
  input: 'typeahead',
  required: true,
  lookupUri: 'zabbix/instance',
  lookupAccessor: 'account_name',
});

const zabbixTemplateField = (): FieldDef => ({
  name: 'zabbix_template',
  label: 'Templates',
  cell: 'fk',
  subfield: 'template_name',
  input: 'typeahead',
  required: true,
  dependsOn: 'zabbix_instance',
  lookupUriFrom: (inst) => {
    const id = inst && typeof inst === 'object' ? (inst as ApiRecord).id : inst;
    return id === undefined || id === null ? null : `zabbix/instance/${String(id)}/zabbix_templates`;
  },
  lookupAccessor: 'template_name',
  sortable: false,
});

const zabbixInterfaceField = (types: string[]): FieldDef =>
  choice('interface_type', 'Interface Type', types, { required: true });

/* [label, endpoint suffix, interface types (empty = tab has none), the mapped item] */
interface ZabbixTabSpec {
  label: string;
  uri: string;
  interfaceTypes?: string[];
  item?: FieldDef;
  subItem?: FieldDef;
}

const ZABBIX_TEMPLATE_TABS: ZabbixTabSpec[] = [
  {
    label: 'Manufacturer',
    uri: 'manufacturer_templates',
    interfaceTypes: ['Agent', 'SNMP'],
    item: fk('manufacturer', 'Manufacturer', 'manufacturer', { required: true }),
  },
  {
    label: 'Server Manufacturer',
    uri: 'servermanufacturer_templates',
    interfaceTypes: ['Agent', 'SNMP'],
    item: fk('server_manufacturer', 'Server Manufacturer', 'server_manufacturer', { required: true }),
    // Legacy narrowed the models with ?manufacturer=<id>&page_size=0.
    subItem: {
      name: 'server_model',
      label: 'Server Model',
      cell: 'fk',
      subfield: 'name',
      input: 'typeahead',
      required: true,
      dependsOn: 'server_manufacturer',
      lookupUriFrom: (man) => {
        const id = man && typeof man === 'object' ? (man as ApiRecord).id : man;
        return id === undefined || id === null ? null : `server_model?manufacturer=${String(id)}`;
      },
      sortable: false,
    },
  },
  {
    label: 'Storage Manufacturer',
    uri: 'storagemanufacturer_templates',
    interfaceTypes: ['API', 'Agent', 'SNMP'],
    item: fk('storage_manufacturer', 'Storage Manufacturer', 'storage_manufacturer', { required: true }),
  },
  {
    label: 'PDU',
    uri: 'pdu_templates',
    interfaceTypes: ['SNMP'],
    item: fk('pdu_manufacturer', 'PDU Manufacturer', 'pdu_manufacturer', { required: true }),
  },
  {
    label: 'Database',
    uri: 'database_templates',
    interfaceTypes: ['Agent', 'ODBC'],
    item: fk('database_type', 'Database Type', 'database_type', { required: true }),
  },
  {
    label: 'Operating System',
    uri: 'os_templates',
    interfaceTypes: ['Agent', 'SNMP'],
    item: choice('os_type', 'Operating System Type', ZABBIX_OS_TYPES, { required: true }),
  },
  {
    label: 'Public Cloud',
    uri: 'public_cloud_templates',
    item: {
      name: 'type',
      label: 'Public Cloud Type',
      cell: 'text',
      input: 'obj_choices',
      required: true,
      objChoices: ZABBIX_PUBLIC_CLOUD_TYPES,
    },
  },
  {
    label: 'Private Cloud',
    uri: 'private_cloud_templates',
    item: {
      name: 'type',
      label: 'Private Cloud Type',
      cell: 'text',
      input: 'obj_choices',
      required: true,
      objChoices: ZABBIX_PRIVATE_CLOUD_TYPES,
    },
  },
  {
    label: 'Controller',
    uri: 'container_templates',
    interfaceTypes: ['Agent'],
    item: {
      name: 'controller_type',
      label: 'Controller Type',
      cell: 'text',
      input: 'obj_choices',
      required: true,
      objChoices: ZABBIX_CONTROLLER_TYPES,
    },
  },
  {
    label: 'Integration Account',
    uri: 'integ_account_template',
    item: {
      name: 'account_type',
      label: 'Account Type',
      cell: 'text',
      input: 'obj_choices',
      required: true,
      objChoices: ZABBIX_INTEG_ACCOUNT_TYPES,
    },
  },
];

const zabbixTabFields = (spec: ZabbixTabSpec): FieldDef[] => {
  const out: FieldDef[] = [zabbixInstanceField()];
  if (spec.interfaceTypes) out.push(zabbixInterfaceField(spec.interfaceTypes));
  out.push(zabbixTemplateField());
  if (spec.item) out.push(spec.item);
  if (spec.subItem) out.push(spec.subItem);
  return out;
};

RESOURCES['zabbix/template_mapping'] = {
  key: 'zabbix/template_mapping',
  uri: 'zabbix/os_templates',
  title: 'Zabbix Template Mappings',
  titleSingular: 'Template Mapping',
  icon: 'git-branch',
  tabs: ZABBIX_TEMPLATE_TABS.map(
    (spec): ResourceTab => ({
      label: spec.label,
      uri: `zabbix/${spec.uri}`,
      titleSingular: 'Template Mapping',
      fields: zabbixTabFields(spec),
    })
  ),
};

RESOURCES['zabbix/agent_details'] = {
  key: 'zabbix/agent_details',
  uri: 'zabbix_agent_map',
  title: 'Zabbix Agent Details',
  titleSingular: 'Agent Build',
  icon: 'download',
  defaultSort: 'os_distribution',
  fields: [
    text('os_distribution', 'OS Distribution', { required: true }),
    text('os_version', 'OS Version', { required: true }),
    text('hardware', 'Hardware'),
    text('zabbix_version', 'Agent Version'),
    mono('file_path', 'Package'),
    text('encryption', 'Encryption'),
    text('packaging', 'Packaging'),
  ],
};

/* ---- Monitoring: Observium ---- */
RESOURCES['observium/instance'] = {
  key: 'observium/instance',
  uri: 'observium/instance',
  title: 'Observium Instances',
  titleSingular: 'Observium Instance',
  icon: 'line-chart',
  defaultSort: 'account_name',
  rowActions: [changePasswordAction('observium/instance/change_password')],
  fields: [
    text('account_name', 'Observium Account Name', { required: true }),
    mono('hostname', 'Observium Hostname', { required: true }),
    text('username', 'Observium Username', { required: true }),
    secret('password', 'Observium Password'),
    bool('is_provider', 'Is Default ?'),
    multiEdit('customers', 'Customers', 'fast/org'),
  ],
};

// [tab label, endpoint suffix, device field, device label, device lookup, display prop]
const OBSERVIUM_DEVICE_TABS: Array<[string, string, string, string, string, string]> = [
  ['Switches', 'switch', 'switch', 'Switch', 'fast/switch', 'name'],
  ['Firewalls', 'firewall', 'firewall', 'Firewall', 'fast/firewall', 'name'],
  ['Load Balancers', 'load_balancer', 'load_balancer', 'LoadBalancer', 'fast/load_balancer', 'name'],
  ['PDUs', 'pdu', 'pdu', 'PDU', 'fast/pdu', 'name'],
  ['Storage', 'storagedevice', 'storage_device', 'Storage', 'fast/storagedevice', 'name'],
  ['Servers', 'server', 'server', 'Server', 'fast/server', 'name'],
  ['AWS Instances', 'aws_instance', 'instance', 'AWS Instance', 'fast/aws_instance', 'display_name'],
  ['Custom VMs', 'custom_vm', 'instance', 'Custom Cloud VirtualMachine', 'fast/vm', 'display_name'],
  ['ESXi VMs', 'esxi_vm', 'instance', 'ESXI VirtualMachine', 'fast/esxi_vm', 'display_name'],
  ['G3KVM VMs', 'g3kvm_vm', 'instance', 'G3 KVM VirtualMachine', 'fast/g3kvm_vm', 'display_name'],
  ['HyperV VMs', 'hyperv_vm', 'instance', 'HyperV VirtualMachine', 'fast/hyperv_vm', 'display_name'],
  ['OpenStack VMs', 'openstack_vm', 'instance', 'OpenStack VirtualMachine', 'fast/openstack_vm', 'display_name'],
  ['Proxmox VMs', 'proxmox_vm', 'instance', 'Proxmox VirtualMachine', 'fast/proxmox_vm', 'display_name'],
  ['vCloud VMs', 'vcloud_vm', 'instance', 'Vcloud VirtualMachine', 'fast/vcloud_vm', 'display_name'],
  ['VMware VMs', 'vmware_vm', 'instance', 'VMware VirtualMachine', 'fast/vmware_vm', 'display_name'],
  ['Mac Devices', 'macdevice', 'mac_device', 'Mac Device', 'fast/macdevice', 'name'],
];

RESOURCES['observium/device_map'] = {
  key: 'observium/device_map',
  uri: 'observium/switch',
  title: 'Observium Device Map',
  titleSingular: 'Device Mapping',
  icon: 'network',
  tabs: OBSERVIUM_DEVICE_TABS.map(
    ([label, uri, deviceName, deviceLabel, lookup, accessor]): ResourceTab => ({
      label,
      uri: `observium/${uri}`,
      titleSingular: 'Device Mapping',
      fields: observiumMapFields(deviceName, deviceLabel, lookup, accessor),
    })
  ),
};

RESOURCES['observium/billing_map'] = {
  key: 'observium/billing_map',
  uri: 'observium/billing',
  title: 'Observium Bill Map',
  titleSingular: 'Bill Mapping',
  icon: 'credit-card',
  fields: [
    {
      name: 'observium_instance',
      label: 'Observium Instance',
      cell: 'fk',
      subfield: 'account_name',
      input: 'typeahead',
      lookupUri: 'observium/instance',
      lookupAccessor: 'account_name',
    },
    num('billing_id', 'Observium Bill ID', { required: true }),
    customerField('customer', 'Customer'),
    text('bill_rate', 'Bill Rate'),
  ],
};

// Resolve a resource config by key; synthesize a generic one if unregistered so
// every route lands on a working (auto-derived) list page.
export function getResource(key: string): ResourceConfig {
  if (RESOURCES[key]) return RESOURCES[key];
  const uri = key.replace(/^#\//, '');
  return {
    key,
    uri,
    title: humanize(key),
    titleSingular: humanize(key).replace(/s$/, ''),
    defaultSort: 'name',
  };
}
