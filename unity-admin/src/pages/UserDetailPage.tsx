import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError, buildUrl } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { FieldDef } from '../config/fieldTypes';
import { formatDate, scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { useToast } from '../components/ui/Toast';

/*
 * User detail - ports UserDetailController (controllers/generic.js:4467) and
 * templates/user_detail.html. The generic detail page rendered a flat field dump and
 * lost every action on this screen:
 *
 *   GET    user/{id}/get_audit_data/         login audit trail
 *   POST   user/{id}/send_email_invitation/  (re)send the portal invitation
 *   POST   <invitation url>rescind/          cancel a pending invitation
 *   PUT    user/{id}/                        change details / access / enable / disable
 *   DELETE user/{id}/
 *
 * Invitation URLs arrive from the API as absolute links to the backend host, which the
 * browser cannot call cross-origin - only the pathname is kept so the request goes back
 * through the local proxy.
 */

interface AuditEntry extends ApiRecord {
  last_activity?: string;
  expire_date?: string;
  ip?: string;
  user_agent?: string;
}

interface Invitation extends ApiRecord {
  url?: string;
  created_at?: string;
  created_date?: string;
  pending?: boolean;
}

const DETAIL_FIELDS: FieldDef[] = [
  { name: 'first_name', label: 'First Name', cell: 'text', required: true },
  { name: 'last_name', label: 'Last Name', cell: 'text', required: true },
  { name: 'email', label: 'Email', cell: 'text', input: 'email', required: true },
  {
    name: 'org',
    label: 'Organization',
    cell: 'fk',
    input: 'typeahead',
    lookupUri: 'fast/org',
    lookupIdProp: 'id',
    subfield: 'name',
  },
  { name: 'salesforce_id', label: 'Salesforce ID', cell: 'text' },
];

const ACCESS_FIELDS: FieldDef[] = [
  {
    name: 'access_types',
    label: 'Access Types',
    cell: 'multiple',
    input: 'multiple',
    lookupUri: 'access_type',
    lookupIdProp: 'id',
    subfield: 'name',
    sortable: false,
  },
];

function localPath(absolute: string | undefined): string | null {
  if (!absolute) return null;
  try {
    return new URL(absolute, window.location.origin).pathname;
  } catch {
    return null;
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

export function UserDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState<ApiRecord | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<'details' | 'access' | null>(null);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [confirm, setConfirm] = useState<'disable' | 'enable' | 'delete' | null>(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rec = await api.detail<ApiRecord>('user', id);
      setUser(rec);
      // The audit endpoint is optional - a user who has never logged in 404s on
      // some deployments, and that must not blank the whole page.
      const rows = await api.get<unknown>(`user/${id}/get_audit_data`).catch(() => []);
      setAudit(Array.isArray(rows) ? (rows as AuditEntry[]) : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this user.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const invitations: Invitation[] = Array.isArray(user?.invitations) ? (user!.invitations as Invitation[]) : [];
  const lastInvite = invitations.length ? invitations[invitations.length - 1] : null;
  const pending = invitations.some((i) => i.pending === true);

  const saveUser = async (patch: ApiRecord, label: string) => {
    if (!user) return;
    setSaving(true);
    try {
      // Legacy PUTs the whole resource object with the edits merged in.
      const res = await api.update<ApiRecord>('user', id, { ...user, ...patch });
      setUser({ ...user, ...patch, ...res });
      toast.success(`Updated ${scalarize(user.email)}`, label);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Could not update this user.`);
    } finally {
      setSaving(false);
    }
  };

  const sendInvitation = async () => {
    if (!user) return;
    setInviting(true);
    try {
      const res = await api.rawPost<ApiRecord>(buildUrl(`user/${id}/send_email_invitation`));
      if (res && Array.isArray(res.invitations)) setUser({ ...user, invitations: res.invitations });
      else await load();
      toast.success(`Invitation email sent to ${scalarize(user.email)}`, 'Invited');
    } catch {
      toast.error('Could not send the email. Check the server logs for details.');
    } finally {
      setInviting(false);
    }
  };

  const rescind = async (invite: Invitation) => {
    const path = localPath(invite.url);
    if (!path) {
      toast.error('This invitation has no address to cancel.');
      return;
    }
    try {
      await api.rawPost(`${path}rescind`);
      toast.success('Updated invitation.', 'Rescinded');
      load();
    } catch {
      toast.error('Could not rescind this invitation.');
    }
  };

  const runConfirm = async () => {
    if (!user || !confirm) return;
    setWorking(true);
    try {
      if (confirm === 'delete') {
        await api.remove('user', id);
        toast.success(`Deleted ${scalarize(user.email)}`, 'Removed');
        navigate('/user');
      } else {
        const isActive = confirm === 'enable';
        const res = await api.update<ApiRecord>('user', id, { ...user, is_active: isActive });
        setUser({ ...user, is_active: isActive, ...res });
        toast.success(`${isActive ? 'Enabled' : 'Disabled'} ${scalarize(user.email)}`, 'Saved');
      }
      setConfirm(null);
    } catch {
      toast.error(confirm === 'delete' ? 'Could not delete this user.' : 'Could not change the user state.');
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="content-fade">
        <Card>
          <LoadingBlock label="Loading user..." />
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="content-fade">
        <Card>
          <EmptyState
            icon="alert-triangle"
            title="User not found"
            message={error || 'This user could not be loaded.'}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  /* The legacy template binds result.roles, but this API has no `roles` key at all -
     the populated field is `user_roles` (verified live: user 905 carries
     user_roles:[Administrator] and no roles), so that panel was blank in the old
     panel too. Read user_roles first and keep roles as a fallback. */
  const roles = Array.isArray(user.user_roles)
    ? (user.user_roles as ApiRecord[])
    : Array.isArray(user.roles)
    ? (user.roles as ApiRecord[])
    : [];
  const groups = Array.isArray(user.groups) ? (user.groups as ApiRecord[]) : [];
  const accessTypes = Array.isArray(user.access_types) ? (user.access_types as ApiRecord[]) : [];

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/user')}>
          Back to Users
        </Button>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <Card style={{ marginBottom: 18 }}>
            <CardHead
              title={scalarize(user.email) || 'User'}
              icon="user"
              action={user.is_active ? <Badge tone="success" dot>Active</Badge> : <Badge tone="danger" dot>Disabled</Badge>}
            />
            <div>
              <Row label="UUID">
                <span className="mono">{scalarize(user.uuid) || '-'}</span>
              </Row>
              <Row label="First Name">{scalarize(user.first_name) || '-'}</Row>
              <Row label="Last Name">{scalarize(user.last_name) || '-'}</Row>
              <Row label="Organization">{scalarize((user.org as ApiRecord)?.name ?? user.org) || '-'}</Row>
              <Row label="Salesforce ID">{scalarize(user.salesforce_id) || '-'}</Row>
              <Row label="Customer Admin">
                {user.is_customer_admin ? <Badge tone="brand">Yes</Badge> : <Badge tone="neutral">No</Badge>}
              </Row>
            </div>
            <div className="card-foot">
              <Button variant="primary" size="sm" icon="pencil" onClick={() => setEditing('details')}>
                Change Details
              </Button>
            </div>
          </Card>

          <Card style={{ marginBottom: 18 }}>
            <CardHead title="Roles and Groups" icon="shield" />
            <div>
              <Row label="Roles">
                {roles.length ? roles.map((r, i) => <span className="chip" key={i}>{scalarize(r.name)}</span>) : '-'}
              </Row>
              <Row label="Groups">
                {groups.length ? groups.map((g, i) => <span className="chip" key={i}>{scalarize(g.name)}</span>) : '-'}
              </Row>
            </div>
          </Card>

          <Card>
            <CardHead title="Access Types" icon="key" />
            {accessTypes.length === 0 ? (
              <EmptyState icon="key" title="No access types" message="This user has no access types assigned." />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Access Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessTypes.map((a, i) => (
                      <tr key={String(a.id ?? i)}>
                        <td>{scalarize(a.name)}</td>
                        <td>{scalarize(a.description) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="card-foot">
              <Button variant="primary" size="sm" icon="pencil" onClick={() => setEditing('access')}>
                Change Access
              </Button>
            </div>
          </Card>
        </div>

        <div className="detail-col">
          <Card style={{ marginBottom: 18 }}>
            <CardHead title="Invitation Status" icon="mail" />
            <div>
              <Row label="Invitation Sent">
                {invitations.length > 0 ? <Badge tone="success">Yes</Badge> : <Badge tone="neutral">No</Badge>}
              </Row>
              <Row label="Last Invitation">
                {lastInvite ? formatDate(lastInvite.created_date ?? lastInvite.created_at) : '-'}
              </Row>
              <Row label="Pending Acceptance">
                {pending ? <Badge tone="warning">Yes</Badge> : <Badge tone="neutral">No</Badge>}
              </Row>
            </div>
            <div className="card-foot">
              <Button variant="primary" size="sm" icon="send" loading={inviting} onClick={sendInvitation}>
                Send Email Invitation
              </Button>
            </div>
          </Card>

          <Card>
            <CardHead title="All Invitations" icon="mails" action={<Badge tone="brand">{invitations.length}</Badge>} />
            {invitations.length === 0 ? (
              <EmptyState icon="mails" title="No invitations" message="No invitation has been sent to this user yet." />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invitation Date</th>
                      <th className="col-center">Pending</th>
                      <th className="col-actions">Cancel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv, i) => (
                      <tr key={String(inv.id ?? i)}>
                        <td className="cell-mono">{formatDate(inv.created_at ?? inv.created_date) || '-'}</td>
                        <td className="col-center">
                          {inv.pending ? <Badge tone="warning">Yes</Badge> : <Badge tone="neutral">No</Badge>}
                        </td>
                        <td className="col-actions">
                          <Button variant="default" size="sm" disabled={!inv.pending} onClick={() => rescind(inv)}>
                            Rescind
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card style={{ marginTop: 18 }}>
        <CardHead title="Logins" icon="history" action={<Badge tone="brand">{audit.length}</Badge>} />
        {audit.length === 0 ? (
          <EmptyState icon="history" title="No audit data" message="This user has never logged in." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Last Activity</th>
                  <th>Expire Date</th>
                  <th>IP</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((entry, i) => (
                  <tr key={i}>
                    <td className="cell-mono">{formatDate(entry.last_activity) || '-'}</td>
                    <td className="cell-mono">{formatDate(entry.expire_date) || '-'}</td>
                    <td className="cell-mono">{scalarize(entry.ip) || '-'}</td>
                    <td>{scalarize(entry.user_agent) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 18 }} className="card-danger">
        <CardHead title="Advanced Options" icon="alert-triangle" />
        <div style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 1.75 }}>
          <p style={{ margin: '0 0 10px' }}>
            Disabling a user prevents portal and API access and destroys the session immediately. The user stays
            assigned to any objects they already own.
          </p>
          <p style={{ margin: 0 }}>
            Deleting removes the user from the database entirely. All audit information is destroyed and cannot be
            recovered without a backup.
          </p>
        </div>
        <div className="card-foot">
          {user.is_active ? (
            <Button variant="danger" size="sm" icon="user-x" onClick={() => setConfirm('disable')}>
              Disable User
            </Button>
          ) : (
            <Button variant="primary" size="sm" icon="user-check" onClick={() => setConfirm('enable')}>
              Enable User
            </Button>
          )}
          <Button variant="danger" size="sm" icon="trash-2" onClick={() => setConfirm('delete')}>
            Delete User
          </Button>
        </div>
      </Card>

      {editing && (
        <FormModal
          title={editing === 'details' ? 'Edit Details' : 'Edit Access'}
          subtitle={scalarize(user.email)}
          onClose={() => setEditing(null)}
        >
          <RecordForm
            fields={editing === 'details' ? DETAIL_FIELDS : ACCESS_FIELDS}
            method="Edit"
            initial={user}
            submitting={saving}
            onSubmit={(values) => saveUser(values, editing === 'details' ? 'Details saved' : 'Access saved')}
            onCancel={() => setEditing(null)}
          />
        </FormModal>
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm === 'delete' ? 'Delete user?' : confirm === 'disable' ? 'Disable user?' : 'Enable user?'
          }
          message={
            confirm === 'delete' ? (
              <>
                Delete <strong>{scalarize(user.email)}</strong> entirely? All audit information is destroyed and
                cannot be recovered.
              </>
            ) : confirm === 'disable' ? (
              <>
                Disable <strong>{scalarize(user.email)}</strong>? Portal and API access stop immediately and the
                session is destroyed.
              </>
            ) : (
              <>
                Enable <strong>{scalarize(user.email)}</strong>? Portal and API access are restored.
              </>
            )
          }
          loading={working}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
