import type { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { MENU, flattenLeaves, NavItem } from './config/menu';
import { GenericListPage } from './pages/GenericListPage';
import { GenericDetailPage } from './pages/GenericDetailPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { SwitchDetailPage } from './pages/SwitchDetailPage';
import { ServerDetailPage } from './pages/ServerDetailPage';
import { PrivateCloudDetailPage } from './pages/PrivateCloudDetailPage';
import { DatacenterDetailPage } from './pages/DatacenterDetailPage';
import { VmDetailPage } from './pages/VmDetailPage';
import { Ipv4BlockPage } from './pages/Ipv4BlockPage';
import { NetworkUtilizationPage } from './pages/NetworkUtilizationPage';
import { AwsRegionPage } from './pages/AwsRegionPage';
import { SalesforceImportPage } from './pages/SalesforceImportPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { AzureResourceGroupPage } from './pages/AzureResourceGroupPage';
import { OrganizationDetailPage } from './pages/OrganizationDetailPage';
import { ScopedRollupPage } from './pages/ScopedRollupPage';
import { VmTransferPage } from './pages/VmTransferPage';
import { ObserviumHostDetailPage } from './pages/ObserviumHostDetailPage';
import { CloudVmListPage } from './pages/CloudVmListPage';
import { VmConsolePage } from './pages/VmConsolePage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountPage } from './pages/AccountPage';
import { CeleryMonitorPage } from './pages/CeleryMonitorPage';
import { DeveloperOptionsPage } from './pages/DeveloperOptionsPage';
import { OrgScopedToolPage } from './pages/OrgScopedToolPage';
import { HijackPage } from './pages/HijackPage';
import { ImporterPage } from './pages/ImporterPage';
import { ProxyCookiesPage } from './pages/ProxyCookiesPage';
import { ReleasePage } from './pages/ReleasePage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { VxcPage } from './pages/VxcPage';
import { DeviceReportsPage } from './pages/DeviceReportsPage';
import { Ipv6AllocationsPage } from './pages/Ipv6AllocationsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FieldDef } from './config/fieldTypes';

/* db-instance.html columns and createDbInstance.html fields. IP fields keep the
   legacy dotted-quad hint; the backend does the real validation. */
const DB_INSTANCE_COLUMNS: FieldDef[] = [
  { name: 'vm_name', label: 'Virtual Machine Name', cell: 'text' },
  { name: 'ram_size', label: 'RAM Size (MB)', cell: 'number', align: 'right' },
  { name: 'cpus', label: 'CPUs', cell: 'number', align: 'right' },
  { name: 'hostname', label: 'Hostname', cell: 'mono' },
  { name: 'internal_ip', label: 'Internal IP', cell: 'mono' },
  { name: 'routable_ip', label: 'Private IP', cell: 'mono' },
  { name: 'database', label: 'Database', cell: 'text' },
  { name: 'created_at', label: 'Creation Date', cell: 'datetime' },
];

const DB_INSTANCE_FORM: FieldDef[] = [
  { name: 'database', label: 'Database Type', cell: 'text', input: 'choices', choices: ['MYSQL'], required: true },
  { name: 'vm_name', label: 'VM Name', cell: 'text', required: true, placeholder: 'Virtual Machine Name' },
  { name: 'hostname', label: 'Host Name', cell: 'text', required: true, placeholder: 'Host Name' },
  { name: 'ram_size', label: 'RAM Size', cell: 'number', input: 'number', required: true, placeholder: 'RAM Size in GB' },
  { name: 'cpus', label: 'CPUs', cell: 'number', input: 'number', required: true, placeholder: 'No. of CPU Cores' },
  { name: 'internal_ip', label: 'Internal IP', cell: 'mono', placeholder: 'Ex : 192.168.254.60' },
  { name: 'routable_ip', label: 'Private IP', cell: 'mono', placeholder: 'Ex : 209.237.238.90' },
];

/* Terraform VM columns and forms - controllers/cloud.js:2020 field list. cloud_type
   and cloud are marked hidden there, so they are not edited by hand. */
const TERRAFORM_COLUMNS: FieldDef[] = [
  { name: 'vm_name', label: 'VM Name', cell: 'text' },
  { name: 'hostname', label: 'Hostname', cell: 'mono' },
  { name: 'ram_size', label: 'RAM Size (MB)', cell: 'number', align: 'right' },
  { name: 'cpus', label: 'CPUs', cell: 'number', align: 'right' },
  { name: 'internal_ip', label: 'Internal IP', cell: 'mono' },
  { name: 'routable_ip', label: 'Routable IP', cell: 'mono' },
  { name: 'ssh_usr', label: 'SSH Username', cell: 'text' },
  { name: 'status', label: 'Power State', cell: 'text' },
];

const TERRAFORM_FORM: FieldDef[] = [
  { name: 'vm_name', label: 'VM Name', cell: 'text', required: true },
  { name: 'hostname', label: 'Hostname', cell: 'text', required: true },
  { name: 'ram_size', label: 'RAM Size (MB)', cell: 'number', input: 'number' },
  { name: 'cpus', label: 'CPUs', cell: 'number', input: 'number' },
  { name: 'internal_ip', label: 'Internal IP', cell: 'mono' },
  { name: 'routable_ip', label: 'Routable IP', cell: 'mono' },
  { name: 'ssh_usr', label: 'SSH Username', cell: 'text' },
];

/* Legacy's Modify Password action edited exactly one field. It is a password input, so
   RecordForm's blank-secret guard keeps an untouched field out of the payload. */
const TERRAFORM_PASSWORD_FORM: FieldDef[] = [
  { name: 'ssh_pwd', label: 'New Password', cell: 'text', input: 'password', required: true },
];

// Routes backed by a bespoke page component instead of the generic list engine.
const CUSTOM_PAGES: Record<string, JSX.Element> = {
  '/integ/celery_monitor': <CeleryMonitorPage />,
  '/101010': <DeveloperOptionsPage />,
  '/import2': <ImporterPage />,
  '/hijack': <HijackPage />,
  '/proxy-cookies-1': <ProxyCookiesPage />,
  // About: current-release summary strip above the release-notes table.
  '/release': <ReleasePage />,
  // Filtered audit report - the generic list hangs on this endpoint unfiltered.
  '/activity/logs': <ActivityLogPage />,
  '/manage_unitedconnect/vxc': <VxcPage />,
  /* Device Reports is an org + date-range query with an Export, not a CRUD list. */
  '/device_reports': <DeviceReportsPage />,
  /* IPv6 allocations own a locations sub-table that a flat list cannot express. */
  '/ipv6alloc': <Ipv6AllocationsPage />,
  /* The two chart tabs of System Monitoring > Networking; the three inventory tabs stay
     on /integ/net as a generic tabbed list. */
  '/integ/net/utilization': <NetworkUtilizationPage />,
  /* Import Opportunities is a Salesforce-vs-Unity reconciliation screen, not a list of
     what is already imported (controllers/billing.js:125). */
  '/sf_import_oppty': <SalesforceImportPage />,
  /* Terraform (TerraformController, controllers/cloud.js:1972). The port listed the
     provisioned VMs read-only; legacy could also edit one, delete one and rotate its
     SSH password. Those three are restored here against /rest/terraform/ (verified
     live: 200 with a record carrying hostname, ssh_usr, ssh_port, status).

     The web SSH console is at /services/terraform/console/{id} - see VmConsolePage for
     what it does and does not emulate. */
  '/services/terraform': (
    <OrgScopedToolPage
      title="Terraform"
      description="List the Terraform-provisioned virtual machines belonging to an organization."
      icon="boxes"
      actionLabel="Get Terraform VMs"
      scope="org"
      resultUri="terraform/virtual_machines"
      emptyLabel="Terraform VMs"
      columns={TERRAFORM_COLUMNS}
      rowUri="terraform"
      rowIdField="id"
      editFields={TERRAFORM_FORM}
      secondaryLabel="Modify Password"
      secondaryIcon="key"
      secondaryFields={TERRAFORM_PASSWORD_FORM}
      rowLinkLabel="Web Console"
      rowLinkIcon="terminal"
      rowLinkTo="/services/terraform/console/{id}"
    />
  ),
  /* VM Migration and VM Backup are the same flow with a different verb - both lost
     their action and their history in the port (controllers/cloud.js:947 / :1211). */
  '/services/vm_migration': (
    <VmTransferPage
      mode="migrate"
      title="VM Migration"
      description="Move a powered-off virtual machine from a tenant cloud into an AWS or Azure account."
      icon="move"
    />
  ),
  '/services/vm_backup': (
    <VmTransferPage
      mode="backup"
      title="VM Backup"
      description="Back a powered-off virtual machine up to AWS S3 or Azure Blob storage, and review past backups."
      icon="archive"
    />
  ),
  /* DB Instance (DBInstanceController, controllers/cloud.js:1664). Two things the
     port had dropped: the populate step that refreshes the table from vCenter before
     the list is read, and the Create action. Legacy also supports VMware clouds only
     and says so rather than showing an empty table. */
  '/services/db_instance': (
    <OrgScopedToolPage
      title="DB Instance"
      description="Select a tenant cloud to list its managed database instances."
      icon="database"
      actionLabel="Get Clouds"
      scope="cloud"
      resultUri="vmware/db_instance"
      populateUri="vmware/db_instance/populate_database_instance_list"
      platformTypes={['VMware']}
      emptyLabel="Database Instances"
      columns={DB_INSTANCE_COLUMNS}
      addUri="vmware/db_instance"
      addFields={DB_INSTANCE_FORM}
      addScopeKey="cloud"
      addTitle="DB Instance"
    />
  ),
};

// Build a unique route list from the navigation leaves (some routes, e.g. /switch,
// appear under more than one menu branch).
function uniqueLeaves(): NavItem[] {
  const seen = new Set<string>();
  const out: NavItem[] = [];
  for (const leaf of flattenLeaves(MENU)) {
    if (!leaf.to || seen.has(leaf.to)) continue;
    seen.add(leaf.to);
    out.push(leaf);
  }
  return out;
}

function elementFor(leaf: NavItem) {
  if (leaf.to && CUSTOM_PAGES[leaf.to]) return CUSTOM_PAGES[leaf.to];
  if (leaf.kind === 'dashboard') return <DashboardPage />;
  if (leaf.kind === 'placeholder') return <PlaceholderPage />;
  const rk = leaf.resource || (leaf.to || '').replace(/^\//, '');
  // key by resource so switching list routes remounts with fresh search/sort/page state.
  return <GenericListPage key={rk} resourceKey={rk} />;
}

export default function App() {
  const leaves = uniqueLeaves();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        {leaves.map((leaf) => (
          <Route key={leaf.to} path={(leaf.to || '').replace(/^\//, '')} element={elementFor(leaf)} />
        ))}
        {/* Account / profile shortcut from the user menu */}
        <Route path="account" element={<AccountPage />} />
        {/* Generic read-only detail view for any resource: /:resource/:id */}
        {/* Bespoke detail screens must be declared before the generic catch-all. */}
        <Route path="user/:id" element={<UserDetailPage />} />
        <Route path="switch/:id" element={<SwitchDetailPage />} />
        <Route path="server/:id" element={<ServerDetailPage />} />
        <Route path="datacenter/:id" element={<DatacenterDetailPage />} />
        <Route path="vm/:id" element={<VmDetailPage />} />
        <Route path="aws/:accountId/region/:region" element={<AwsRegionPage />} />
        <Route path="sf_opportunity/:id" element={<OpportunityDetailPage />} />
        <Route path="azure/:accountId/resource-groups" element={<AzureResourceGroupPage />} />
        {/* Both spellings reach the same organization: legacy used /org, the menu /organization. */}
        {/* The two scoped health roll-ups behind the dashboard KPI cards. */}
        <Route path="customer-dashboard/:id" element={<ScopedRollupPage scope="customer" />} />
        <Route path="datacenter-rollup/:id" element={<ScopedRollupPage scope="datacenter" />} />
        <Route path="observium_host/:id" element={<ObserviumHostDetailPage />} />
        <Route path="cloud-vm-list/:id" element={<CloudVmListPage />} />
        {/* Web SSH console. `base` selects which backend opens the session. */}
        <Route path="services/terraform/console/:id" element={<VmConsolePage base="terraform" />} />
        <Route path="vmware-vm/console/:id" element={<VmConsolePage base="vmware_vms" />} />
        <Route path="openstack-vm/console/:id" element={<VmConsolePage base="openstack/migration" />} />
        <Route path="org/:id" element={<OrganizationDetailPage />} />
        <Route path="organization/:id" element={<OrganizationDetailPage />} />
        {/* A prefix contains a slash, so it is URL-encoded into one segment. */}
        <Route path="ipv4-block/:prefix" element={<Ipv4BlockPage scope="public" />} />
        <Route path="ipv4-block-private/:prefix" element={<Ipv4BlockPage scope="private" />} />
        <Route path="cloud/:id" element={<PrivateCloudDetailPage />} />
        <Route path="cloud_setup/private_cloud/:id" element={<PrivateCloudDetailPage />} />
        <Route path=":resourceKey/:id" element={<GenericDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
