import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, buildUrl } from '../data/apiClient';
import { awaitTask } from '../data/task';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { FieldDef } from '../config/fieldTypes';
import { Badge, Button, Card, CardHead, EmptyState, IconAction, LoadingBlock } from '../components/ui/primitives';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { useToast } from '../components/ui/Toast';

/*
 * AWS region inventory - the page the whole AWS area hangs off, and the single biggest
 * gap in the port. Legacy drove ten resource tables plus the EC2 lifecycle actions from
 * one controller (controllers/v3/aws/awscontroller.js); the React panel had none of it.
 *
 * Columns are the legacy TableHeaders verbatim (constants/v3/api_paths.js:301-432), not
 * invented, so each table matches the old portal field for field.
 *
 * Every read is GET /rest/v3/aws/{account}/region/{region}/<resource>/ and may answer
 * either with the rows directly or with { celery_task: { task_id } } to poll - the
 * legacy controller handled both, and so does readRegion() below.
 *
 * Actions (all POST to a sub-path of the instance):
 *   start_instance / stop_instance / terminate_instance / create_image
 *   attach_asg / attach_network_interface / attach_loadbalancer
 *   snapshot/{id}/copy_snapshots
 */

type TabKey =
  | 'instance'
  | 'snapshot'
  | 'volume'
  | 'list_available_volume'
  | 'list_network_interface'
  | 'user'
  | 'load_balancer'
  | 'list_policies'
  | 'list_auto_scaling_group'
  | 'security_group';

interface TabDef {
  key: TabKey;
  label: string;
  icon: string;
  columns: FieldDef[];
}

const t = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  cell: 'text',
  ...extra,
});
const m = (name: string, label: string): FieldDef => ({ name, label, cell: 'mono' });
const n = (name: string, label: string): FieldDef => ({ name, label, cell: 'number', align: 'right' });
const b = (name: string, label: string): FieldDef => ({ name, label, cell: 'boolean' });
const d = (name: string, label: string): FieldDef => ({ name, label, cell: 'datetime' });

/* aws_volume_list_headers / aws_available_volume_list_headers are identical. */
const VOLUME_COLUMNS: FieldDef[] = [
  t('availability_zone', 'Availability Zone'),
  b('encrypted', 'Encrypted'),
  t('volume_type', 'Volume Type'),
  n('volume_size', 'Size (GiB)'),
  t('state', 'State'),
  n('iops', 'IOPS'),
  d('create_time', 'Created Time'),
  t('tags', 'Tags'),
];

const TABS: TabDef[] = [
  {
    key: 'instance',
    label: 'Instances',
    icon: 'server',
    columns: [
      t('instance_type', 'Type'),
      m('public_ip', 'Public IP'),
      t('availability_zone', 'Availability Zone'),
      { name: 'instance_state', label: 'Power State', cell: 'badge', badgeMap: { running: 'success', stopped: 'neutral', terminated: 'danger', pending: 'warning' } },
      d('launch_time', 'Launch Time'),
    ],
  },
  {
    key: 'snapshot',
    label: 'Snapshots',
    icon: 'camera',
    columns: [
      t('Description', 'Description'),
      n('VolumeSize', 'Size (GiB)'),
      t('State', 'Status'),
      b('Encrypted', 'Encrypted'),
      d('StartTime', 'Start Time'),
      t('Progress', 'Progress'),
    ],
  },
  { key: 'volume', label: 'Volumes', icon: 'hard-drive', columns: VOLUME_COLUMNS },
  { key: 'list_available_volume', label: 'Available Volumes', icon: 'hard-drive', columns: VOLUME_COLUMNS },
  {
    key: 'list_network_interface',
    label: 'Network Interfaces',
    icon: 'network',
    columns: [
      m('network_interface_id', 'Network Interface Id'),
      t('availability_zone', 'Availability Zone'),
      t('status', 'Status'),
      m('mac_address', 'MAC Address'),
      m('private_ip_address', 'Private IP Address'),
      t('private_dns_name', 'Private DNS Name'),
    ],
  },
  {
    key: 'user',
    label: 'IAM Users',
    icon: 'users',
    columns: [t('UserName', 'User Name'), d('CreateDate', 'Created Date'), m('Arn', 'ARN')],
  },
  {
    key: 'load_balancer',
    label: 'Load Balancers',
    icon: 'scale',
    columns: [
      t('LoadBalancerName', 'Name'),
      t('Subnets', 'Subnets'),
      t('SourceSecurityGroup', 'Source Security Group'),
      t('SecurityGroups', 'Security Groups'),
      d('CreatedTime', 'Created Time'),
      t('AvailabilityZones', 'Availability Zones'),
    ],
  },
  {
    key: 'list_policies',
    label: 'Policies',
    icon: 'shield',
    columns: [t('PolicyName', 'Policy Name'), m('Arn', 'ARN'), n('AttachmentCount', 'Attachments')],
  },
  {
    key: 'list_auto_scaling_group',
    label: 'Auto Scaling Groups',
    icon: 'boxes',
    columns: [
      t('name', 'Name'),
      { name: 'instances', label: 'Instances', cell: 'number', align: 'right', format: (_v, row) => String(Array.isArray(row.instances) ? row.instances.length : 0) },
      { name: 'availability_zone', label: 'Availability Zone', cell: 'text', format: (_v, row) => (Array.isArray(row.availability_zone) ? row.availability_zone.join(', ') : scalarize(row.availability_zone)) },
      n('min_size', 'Min Size'),
      n('max_size', 'Max Size'),
      n('desired_capacity', 'Desired Capacity'),
    ],
  },
  {
    key: 'security_group',
    label: 'Security Groups',
    icon: 'lock',
    columns: [
      t('group_name', 'Security Group Name'),
      m('group_id', 'Security Group Id'),
      t('description', 'Description'),
      m('vpc_id', 'Vpc Id'),
      m('owner_id', 'Owner Id'),
    ],
  },
];

/* Instance lifecycle + attach actions, from the legacy controller. `needs` names the
   dropdown endpoint an attach action must read before it can be submitted. */
const INSTANCE_ACTIONS: { key: string; label: string; icon: string; danger?: boolean; needs?: string; field?: string; optionLabel?: string }[] = [
  { key: 'start_instance', label: 'Start', icon: 'play' },
  { key: 'stop_instance', label: 'Stop', icon: 'square' },
  { key: 'terminate_instance', label: 'Terminate', icon: 'trash-2', danger: true },
  { key: 'create_image', label: 'Create Image', icon: 'camera' },
  { key: 'attach_asg', label: 'Attach ASG', icon: 'boxes', needs: 'asg_dropdown', field: 'name', optionLabel: 'name' },
  { key: 'attach_network_interface', label: 'Attach NIC', icon: 'network', needs: 'network_interface_dropdown', field: 'network_interface_id', optionLabel: 'network_interface_id' },
  { key: 'attach_loadbalancer', label: 'Attach LB', icon: 'scale', needs: 'loadbalancer_dropdown', field: 'LoadBalancerName', optionLabel: 'LoadBalancerName' },
];

const asRows = (v: unknown): ApiRecord[] => {
  if (Array.isArray(v)) return v as ApiRecord[];
  if (v && typeof v === 'object') {
    const o = v as ApiRecord;
    for (const k of ['results', 'data', 'result']) {
      if (Array.isArray(o[k])) return o[k] as ApiRecord[];
    }
  }
  return [];
};

export function AwsRegionPage() {
  const { accountId = '', region = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState<TabKey>('instance');
  const [rows, setRows] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<ApiRecord | null>(null);
  const [detailFor, setDetailFor] = useState<string | null>(null);
  const [entities, setEntities] = useState<ApiRecord | null>(null);
  const [iam, setIam] = useState<{ user: string; groups: ApiRecord[]; details: ApiRecord[] } | null>(null);

  const [confirmAction, setConfirmAction] = useState<{ row: ApiRecord; action: typeof INSTANCE_ACTIONS[number] } | null>(null);
  const [attach, setAttach] = useState<{ row: ApiRecord; action: typeof INSTANCE_ACTIONS[number]; options: ApiRecord[] } | null>(null);
  const [copyFrom, setCopyFrom] = useState<ApiRecord | null>(null);
  const [launchOpen, setLaunchOpen] = useState(false);
  const [launchData, setLaunchData] = useState<ApiRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const base = `v3/aws/${accountId}/region/${region}`;

  /* Legacy accepted both a direct payload and a celery envelope on every one of these
     reads, so both are handled in one place. */
  const readRegion = useCallback(async (suffix: string): Promise<unknown> => {
    const res = await api.get<unknown>(`${base}/${suffix}`);
    const envelope = res && typeof res === 'object' ? (res as ApiRecord) : null;
    const celery = envelope ? (envelope.celery_task as ApiRecord | undefined) : undefined;
    const taskId = celery?.task_id ?? envelope?.task_id;
    if (taskId) return awaitTask(String(taskId));
    return res;
  }, [base]);

  const loadTab = useCallback(async (key: TabKey) => {
    setLoading(true);
    setError(null);
    setRows([]);
    try {
      setRows(asRows(await readRegion(key)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this resource.');
    } finally {
      setLoading(false);
    }
  }, [readRegion]);

  useEffect(() => {
    loadTab(tab);
  }, [tab, loadTab]);

  const activeTab = useMemo(() => TABS.find((x) => x.key === tab)!, [tab]);
  const idOf = (row: ApiRecord) =>
    String(row.instance_id ?? row.InstanceId ?? row.SnapshotId ?? row.volume_id ?? row.UserName ?? row.id ?? '');

  // ---- instance actions -------------------------------------------------------
  const runInstanceAction = async (row: ApiRecord, action: typeof INSTANCE_ACTIONS[number], payload: ApiRecord = {}) => {
    setBusy(true);
    try {
      const res = await api.rawPost<ApiRecord>(
        buildUrl(`${base}/instance/${idOf(row)}/${action.key}`),
        payload
      );
      const celery = res?.celery_task as ApiRecord | undefined;
      const taskId = celery?.task_id ?? res?.task_id;
      if (taskId) await awaitTask(String(taskId));
      toast.success(`${action.label} submitted.`, 'AWS');
      setConfirmAction(null);
      setAttach(null);
      loadTab(tab);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${action.label} failed.`);
    } finally {
      setBusy(false);
    }
  };

  const openAction = async (row: ApiRecord, action: typeof INSTANCE_ACTIONS[number]) => {
    if (!action.needs) {
      setConfirmAction({ row, action });
      return;
    }
    try {
      const opts = asRows(await readRegion(`instance/${idOf(row)}/${action.needs}`));
      setAttach({ row, action, options: opts });
    } catch {
      toast.error('Could not load the options for this action.');
    }
  };

  // ---- drill-downs ------------------------------------------------------------
  const openInstanceDetail = async (row: ApiRecord) => {
    const id = idOf(row);
    setDetailFor(id);
    setDetail(null);
    try {
      const res = asRows(await readRegion(`instance/${id}/instance_detail`));
      setDetail(res[0] || null);
    } catch {
      toast.error('Could not load the instance details.');
      setDetailFor(null);
    }
  };

  const openIam = async (row: ApiRecord) => {
    const user = scalarize(row.UserName);
    try {
      const [groups, details] = await Promise.all([
        readRegion(`user/${user}/user_group`),
        readRegion(`user/${user}/user_details`),
      ]);
      setIam({ user, groups: asRows(groups), details: asRows(details) });
    } catch {
      toast.error('Could not load this IAM user.');
    }
  };

  const openEntities = async (row: ApiRecord) => {
    try {
      const res = await api.rawPost<ApiRecord>(buildUrl(`${base}/list_entity`), { policy_arn: row.Arn });
      const celery = res?.celery_task as ApiRecord | undefined;
      const taskId = celery?.task_id ?? res?.task_id;
      setEntities(taskId ? ((await awaitTask(String(taskId))) as ApiRecord) : res);
    } catch {
      toast.error('Could not load the policy entities.');
    }
  };

  const openLaunch = async () => {
    try {
      const [images, data] = await Promise.all([readRegion('images'), readRegion('instance_launch_data')]);
      const bag = (data && typeof data === 'object' ? data : {}) as ApiRecord;
      setLaunchData({ ...bag, images: asRows(images) });
      setLaunchOpen(true);
    } catch {
      toast.error('Could not load the launch options.');
    }
  };

  const submitLaunch = async (values: ApiRecord) => {
    setBusy(true);
    try {
      await api.rawPost(buildUrl(`${base}/instance`), values);
      toast.success('Launch requested.', 'AWS');
      setLaunchOpen(false);
      setTab('instance');
      loadTab('instance');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Launch failed.');
    } finally {
      setBusy(false);
    }
  };

  const copySnapshot = async (values: ApiRecord) => {
    if (!copyFrom) return;
    setBusy(true);
    try {
      await api.rawPost(
        buildUrl(`${base}/snapshot/${scalarize(copyFrom.SnapshotId)}/copy_snapshots`),
        values
      );
      toast.success('Copy requested.', 'Snapshot');
      setCopyFrom(null);
      loadTab('snapshot');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Copy failed.');
    } finally {
      setBusy(false);
    }
  };

  const launchFields: FieldDef[] = [
    {
      name: 'image_id',
      label: 'Image (AMI)',
      cell: 'text',
      input: 'obj_choices',
      required: true,
      objChoices: asRows(launchData?.images).map((i) => ({
        value: String(i.ImageId),
        label: `${scalarize(i.Name)} (${scalarize(i.ImageId)})`,
      })),
    },
    {
      name: 'instance_type',
      label: 'Instance Type',
      cell: 'text',
      input: 'choices',
      required: true,
      choices: Array.isArray(launchData?.instance_types) ? (launchData!.instance_types as string[]) : [],
    },
    { name: 'name', label: 'Name', cell: 'text', required: true },
    { name: 'count', label: 'Count', cell: 'number', input: 'number' },
  ];

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/aws-dashboard')}>
          Back to AWS Accounts
        </Button>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title={`Region ${region}`}
          icon="cloud"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge tone="neutral">account {accountId}</Badge>
              <Button variant="primary" size="sm" icon="plus" onClick={openLaunch}>
                Launch Instance
              </Button>
            </div>
          }
        />
      </Card>

      <div className="page-tabs">
        {TABS.map((x) => (
          <button
            key={x.key}
            type="button"
            className={`tab-btn${x.key === tab ? ' active' : ''}`}
            onClick={() => setTab(x.key)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHead title={activeTab.label} icon={activeTab.icon} action={<Badge tone="brand">{rows.length}</Badge>} />
        {loading ? (
          <LoadingBlock label={`Loading ${activeTab.label.toLowerCase()}...`} />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Could not load"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={() => loadTab(tab)}>
                Retry
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={activeTab.icon} title={`No ${activeTab.label.toLowerCase()}`} message="Nothing in this region." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {tab === 'instance' && <th>Instance</th>}
                  {activeTab.columns.map((c) => (
                    <th key={c.name} className={c.align === 'right' ? 'col-num' : undefined}>
                      {c.label}
                    </th>
                  ))}
                  {(tab === 'instance' || tab === 'snapshot' || tab === 'user' || tab === 'list_policies') && (
                    <th className="col-actions">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={idOf(row) || i}>
                    {tab === 'instance' && (
                      <td>
                        <button type="button" className="cell-link linkish" onClick={() => openInstanceDetail(row)}>
                          {scalarize(row.name) || idOf(row)}
                        </button>
                      </td>
                    )}
                    {activeTab.columns.map((c) => {
                      const raw = row[c.name];
                      const text = c.format
                        ? c.format(raw, row)
                        : c.cell === 'datetime'
                        ? formatDate(raw) || '-'
                        : c.cell === 'boolean'
                        ? raw
                          ? 'Yes'
                          : 'No'
                        : scalarize(raw) || '-';
                      return (
                        <td
                          key={c.name}
                          className={[c.cell === 'mono' ? 'cell-mono' : '', c.align === 'right' ? 'col-num' : ''].filter(Boolean).join(' ')}
                        >
                          {c.cell === 'badge' ? (
                            <Badge tone={(c.badgeMap?.[String(raw)] as 'success') || 'neutral'} dot>
                              {scalarize(raw) || '-'}
                            </Badge>
                          ) : (
                            text
                          )}
                        </td>
                      );
                    })}
                    {tab === 'instance' && (
                      <td className="col-actions">
                        <span className="row-actions" style={{ opacity: 1 }}>
                          {INSTANCE_ACTIONS.map((a) => (
                            <IconAction
                              key={a.key}
                              icon={a.icon}
                              title={a.label}
                              danger={a.danger}
                              onClick={() => openAction(row, a)}
                            />
                          ))}
                        </span>
                      </td>
                    )}
                    {tab === 'snapshot' && (
                      <td className="col-actions">
                        <span className="row-actions" style={{ opacity: 1 }}>
                          <IconAction icon="copy" title="Copy Snapshot" onClick={() => setCopyFrom(row)} />
                        </span>
                      </td>
                    )}
                    {tab === 'user' && (
                      <td className="col-actions">
                        <span className="row-actions" style={{ opacity: 1 }}>
                          <IconAction icon="eye" title="User groups and details" onClick={() => openIam(row)} />
                        </span>
                      </td>
                    )}
                    {tab === 'list_policies' && (
                      <td className="col-actions">
                        <span className="row-actions" style={{ opacity: 1 }}>
                          <IconAction icon="eye" title="Show Entities" onClick={() => openEntities(row)} />
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---- instance detail (19 fields) ---- */}
      {detailFor && (
        <FormModal title="Instance Details" subtitle={detailFor} onClose={() => setDetailFor(null)}>
          {!detail ? (
            <LoadingBlock label="Loading details..." />
          ) : (
            <div className="record-form">
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {Object.entries(detail).map(([k, v]) => (
                  <div className="kv-row" key={k}>
                    <div className="kv-label">{k.replace(/([a-z])([A-Z])/g, '$1 $2')}</div>
                    <div className="kv-value">{scalarize(v) || '-'}</div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <Button variant="default" onClick={() => setDetailFor(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </FormModal>
      )}

      {/* ---- IAM user drill-down ---- */}
      {iam && (
        <FormModal title="IAM User" subtitle={iam.user} onClose={() => setIam(null)}>
          <div className="record-form">
            <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '4px 0' }}>
              <h4 style={{ margin: '10px 20px 6px', fontSize: 'var(--fs-sm)' }}>User Details</h4>
              {iam.details.length === 0
                ? <p style={{ margin: '0 20px 12px', color: 'var(--text-muted)' }}>No details returned.</p>
                : Object.entries(iam.details[0]).map(([k, v]) => (
                    <div className="kv-row" key={k}>
                      <div className="kv-label">{k}</div>
                      <div className="kv-value">{scalarize(v) || '-'}</div>
                    </div>
                  ))}
              <h4 style={{ margin: '16px 20px 6px', fontSize: 'var(--fs-sm)' }}>Groups</h4>
              {iam.groups.length === 0 ? (
                <p style={{ margin: '0 20px 12px', color: 'var(--text-muted)' }}>This user belongs to no groups.</p>
              ) : (
                iam.groups.map((g, i) => (
                  <div className="kv-row" key={i}>
                    <div className="kv-label">{scalarize(g.GroupName)}</div>
                    <div className="kv-value mono">{scalarize(g.Arn)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="form-actions">
              <Button variant="default" onClick={() => setIam(null)}>
                Close
              </Button>
            </div>
          </div>
        </FormModal>
      )}

      {/* ---- policy Show Entities ---- */}
      {entities && (
        <FormModal title="Policy Entities" onClose={() => setEntities(null)}>
          <div className="record-form">
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {([['PolicyGroups', 'GroupName', 'Groups'], ['PolicyUsers', 'UserName', 'Users'], ['PolicyRoles', 'RoleName', 'Roles']] as const).map(
                ([key, prop, label]) => {
                  const list = asRows(entities[key]);
                  return (
                    <div key={key}>
                      <h4 style={{ margin: '14px 20px 6px', fontSize: 'var(--fs-sm)' }}>{label}</h4>
                      {list.length === 0 ? (
                        <p style={{ margin: '0 20px', color: 'var(--text-muted)' }}>None attached.</p>
                      ) : (
                        list.map((r, i) => (
                          <div className="kv-row" key={i}>
                            <div className="kv-label">{label.slice(0, -1)}</div>
                            <div className="kv-value">{scalarize(r[prop])}</div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                }
              )}
            </div>
            <div className="form-actions">
              <Button variant="default" onClick={() => setEntities(null)}>
                Close
              </Button>
            </div>
          </div>
        </FormModal>
      )}

      {/* ---- attach actions ---- */}
      {attach && (
        <FormModal
          title={attach.action.label}
          subtitle={scalarize(attach.row.name) || idOf(attach.row)}
          onClose={() => setAttach(null)}
        >
          <RecordForm
            fields={[
              {
                name: attach.action.field || 'value',
                label: attach.action.label.replace('Attach ', ''),
                cell: 'text',
                input: 'obj_choices',
                required: true,
                objChoices: attach.options.map((o) => ({
                  value: String(o[attach.action.optionLabel || 'name']),
                  label: String(o[attach.action.optionLabel || 'name']),
                })),
              },
            ]}
            method="Add"
            submitting={busy}
            onSubmit={(values) => runInstanceAction(attach.row, attach.action, values)}
            onCancel={() => setAttach(null)}
          />
        </FormModal>
      )}

      {/* ---- Launch Instance ---- */}
      {launchOpen && (
        <FormModal title="Launch Instance" subtitle={`${region} - account ${accountId}`} onClose={() => setLaunchOpen(false)}>
          <RecordForm
            fields={launchFields}
            method="Add"
            submitting={busy}
            onSubmit={submitLaunch}
            onCancel={() => setLaunchOpen(false)}
          />
        </FormModal>
      )}

      {/* ---- Copy Snapshot ---- */}
      {copyFrom && (
        <FormModal title="Copy Snapshot" subtitle={scalarize(copyFrom.SnapshotId)} onClose={() => setCopyFrom(null)}>
          <RecordForm
            fields={[
              { name: 'destination_region', label: 'Destination Region', cell: 'text', required: true },
              { name: 'description', label: 'Description', cell: 'text' },
            ]}
            method="Add"
            submitting={busy}
            onSubmit={copySnapshot}
            onCancel={() => setCopyFrom(null)}
          />
        </FormModal>
      )}

      {/* ---- lifecycle confirmations ---- */}
      {confirmAction && (
        <ConfirmDialog
          title={`${confirmAction.action.label} instance?`}
          message={
            <>
              {confirmAction.action.label}{' '}
              <strong>{scalarize(confirmAction.row.name) || idOf(confirmAction.row)}</strong>
              {confirmAction.action.danger ? ' — this cannot be undone.' : '?'}
            </>
          }
          loading={busy}
          onConfirm={() => runInstanceAction(confirmAction.row, confirmAction.action)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
