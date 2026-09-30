import { FormEvent, useState } from 'react';
import { api, ApiError } from '../../data/apiClient';
import { ApiRecord } from '../../data/types';
import { RowAction } from '../../config/fieldTypes';
import { fkText, scalarize } from '../../utils/format';
import { Button } from '../ui/primitives';
import { FormModal } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

/*
 * Rotate the stored credential on one record.
 *
 * Ported from the legacy `changePasswordContoller` (controllers/types.js:790) and
 * templates/change_password.html, which four lists opened from a per-row action:
 *   Observium instance  -> observium/instance/change_password
 *   Zabbix instance     -> zabbix/instance/change_password
 *   OpenStack account   -> openstack/controller/change_password
 *   vCenter API account -> vmware/vcenter/change_password
 *
 * Contract: POST { password, confirm_password, entity_id }. The response is either
 * a plain message or { task_id } for an async rotation that has to be polled -
 * the legacy controller ran it through TaskService2 and only then reported
 * success, so a wrong credential surfaced as a failure rather than a false OK.
 */
const POLL_INTERVAL_MS = 1200;
const POLL_LIMIT = 25; // ~30s, then we stop claiming to know the outcome

interface TaskState {
  state?: string;
  result?: unknown;
}

async function awaitTask(taskId: string): Promise<'SUCCESS' | 'FAILURE' | 'TIMEOUT'> {
  for (let i = 0; i < POLL_LIMIT; i += 1) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    try {
      const t = await api.rawGet<TaskState>(`/task/${taskId}`);
      if (t?.state === 'SUCCESS') return 'SUCCESS';
      if (t?.state === 'FAILURE') return 'FAILURE';
    } catch {
      return 'FAILURE';
    }
  }
  return 'TIMEOUT';
}

export function ChangeEntityPasswordModal({
  action,
  row,
  idField,
  onClose,
}: {
  action: RowAction;
  row: ApiRecord;
  idField: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /*
   * First non-empty human-readable field, falling back through the record's
   * relations before the bare id. This matters on real data: vCenter account 488
   * has hostname AND username null, so a shorter chain showed the operator "488"
   * and no clue which account was about to be rotated - it is the vCenter for the
   * private cloud "upc", which is what they actually recognise.
   */
  const label =
    ['name', 'account_name', 'hostname', 'username', 'email', 'title']
      .map((k) => scalarize(row[k]))
      .find((v) => v.trim()) ||
    ['private_cloud', 'customer', 'org', 'cloud', 'server']
      .map((k) => fkText(row[k]))
      .find((v) => v.trim()) ||
    scalarize(row[idField] ?? row.id);

  // Same three rules and wording as the legacy controller.
  const validate = () => {
    const errs: { password?: string; confirm?: string } = {};
    if (!password.trim()) errs.password = 'This field is required';
    if (!confirm.trim()) errs.confirm = 'This field is required';
    else if (password !== confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);
    setBanner(null);
    const entityId = row[action.entityIdField || idField] ?? row.id ?? row.uuid;

    try {
      const res = await api.create<ApiRecord>(action.uri || '', {
        password,
        confirm_password: confirm,
        entity_id: entityId,
      });

      const taskId = res && typeof res === 'object' ? (res as ApiRecord).task_id : undefined;
      if (taskId) {
        const outcome = await awaitTask(String(taskId));
        if (outcome === 'FAILURE') {
          setBanner('Invalid credential.');
          setBusy(false);
          return;
        }
        if (outcome === 'TIMEOUT') {
          toast.info(`Password change for ${label} is still running. Check the record shortly.`, 'Still running');
          onClose();
          return;
        }
      }

      toast.success(`Password updated for ${label}.`, 'Password updated');
      onClose();
    } catch (err) {
      const body = err instanceof ApiError ? err.body : null;
      const msg =
        typeof body === 'string' && body.trim()
          ? body.trim()
          : body && typeof body === 'object'
          ? String((body as ApiRecord).detail || 'Error occurred while updating the password.')
          : 'Error occurred while updating the password.';
      setBanner(msg);
      setBusy(false);
    }
  };

  return (
    <FormModal title={action.label} subtitle={label} onClose={onClose}>
      <form onSubmit={submit} className="record-form">
        <div className="form-grid">
          {banner && <div className="form-banner">{banner}</div>}
          <div className="field">
            <label>
              New Password<span className="req">*</span>
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className={errors.password ? 'invalid' : ''}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className="field-err">{errors.password}</div>}
          </div>
          <div className="field">
            <label>
              Confirm Password<span className="req">*</span>
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className={errors.confirm ? 'invalid' : ''}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errors.confirm && <div className="field-err">{errors.confirm}</div>}
          </div>
        </div>
        <div className="form-actions">
          <Button type="button" variant="default" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={busy} icon="key">
            Change Password
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
