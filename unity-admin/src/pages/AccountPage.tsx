import { FormEvent, ReactNode, useState } from 'react';
import { ApiRecord } from '../data/types';
import { api, ApiError } from '../data/apiClient';
import { useProfile, profileName, profileEmail, profileOrg, initialsOf } from '../data/useProfile';
import { formatDate, fkText, scalarize } from '../utils/format';
import { Card, CardHead, LoadingBlock, Badge, Button, EmptyState } from '../components/ui/primitives';
import { FormModal } from '../components/ui/Overlay';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

/*
 * Account.
 *
 * Two of the controls here mirror the old portal (uldb/ngx-unity) rather than
 * inventing a new flow:
 *
 *  - Change password  -> POST customer/uldbusers/change_own_password/ with
 *    { old_pass, pass1, pass2 }. Same field names and the same validation as
 *    user-profile-settings.service.ts (old required; new/confirm required, min 8,
 *    and confirm must equal new). The endpoint answers with PLAIN TEXT, which is
 *    why it goes through api.postTextResponse instead of the JSON client.
 *
 *  - Two-factor auth -> the wizard is Django's own `account/two_factor` page. The
 *    old portal embeds that exact URL in an iframe (two-factor-auth.component.ts);
 *    here it opens in a new tab, which gives the identical enable/disable wizard
 *    without depending on the backend's X-Frame-Options.
 */
const CHANGE_PASSWORD_URI = '/customer/uldbusers/change_own_password';
const TWO_FACTOR_URL = '/account/two_factor/';

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--divider)' }}>
      <div
        style={{
          fontSize: 'var(--fs-2xs)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>{value || <span className="u-faint">-</span>}</div>
    </div>
  );
}

interface PasswordFields {
  old_pass: string;
  pass1: string;
  pass2: string;
}

const EMPTY_PASSWORDS: PasswordFields = { old_pass: '', pass1: '', pass2: '' };

// Mirrors changePasswordValidationMessages in the old portal's profile service.
function validatePasswords(v: PasswordFields): Partial<Record<keyof PasswordFields, string>> {
  const errs: Partial<Record<keyof PasswordFields, string>> = {};
  if (!v.old_pass.trim()) errs.old_pass = 'Old Password is required';
  if (!v.pass1.trim()) errs.pass1 = 'New Password is required';
  else if (v.pass1.length < 8) errs.pass1 = 'Must be at least 8 characters long';
  if (!v.pass2.trim()) errs.pass2 = 'Confirm Password is required';
  else if (v.pass2.length < 8) errs.pass2 = 'Must be at least 8 characters long';
  else if (v.pass1 && v.pass1 !== v.pass2) errs.pass2 = 'Passwords must match';
  return errs;
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState<PasswordFields>(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFields, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (name: keyof PasswordFields, val: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: val };
      // Re-validate live once the user has been shown errors, like the old
      // portal's valueChanges subscription after a failed submit.
      setErrors((cur) => (Object.keys(cur).length ? validatePasswords(next) : cur));
      return next;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validatePasswords(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await api.postTextResponse(CHANGE_PASSWORD_URI, { ...values });
      // Django rotates the session auth hash when a password is set, so the
      // cookie this tab is holding stops working. The old portal handles that by
      // logging out; unity-admin has no login route of its own (the session comes
      // from the proxy), so the honest thing is to say the session has ended.
      toast.success(
        'Password changed. Your current session has ended - sign in again with the new password.',
        'Password updated'
      );
      onClose();
    } catch (err) {
      // This endpoint reports failures as a plain string (e.g. a wrong old password).
      const body = err instanceof ApiError ? err.body : null;
      const msg =
        typeof body === 'string' && body.trim()
          ? body.trim()
          : body && typeof body === 'object'
          ? String((body as ApiRecord).detail || 'Could not change the password.')
          : 'Could not change the password.';
      setServerError(msg);
      setSubmitting(false);
    }
  };

  const field = (name: keyof PasswordFields, label: string, placeholder: string) => (
    <div className="field" key={name}>
      <label>
        {label}
        <span className="req">*</span>
      </label>
      <input
        type="password"
        autoComplete={name === 'old_pass' ? 'current-password' : 'new-password'}
        className={errors[name] ? 'invalid' : ''}
        placeholder={placeholder}
        value={values[name]}
        onChange={(e) => set(name, e.target.value)}
      />
      {errors[name] && <div className="field-err">{errors[name]}</div>}
    </div>
  );

  return (
    <FormModal title="Change Password" subtitle="Choose a new password for your account" onClose={onClose}>
      <form onSubmit={submit} className="record-form">
        <div className="form-grid">
          {serverError && <div className="form-banner">{serverError}</div>}
          {field('old_pass', 'Old Password', 'Current password')}
          <div className="field field-full" style={{ paddingTop: 2 }}>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              New password must be at least 8 characters long.
            </div>
          </div>
          {field('pass1', 'New Password', 'New password')}
          {field('pass2', 'Confirm Password', 'Repeat new password')}
        </div>
        <div className="form-actions">
          <Button type="button" variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} icon="check">
            Change Password
          </Button>
        </div>
      </form>
    </FormModal>
  );
}

export function AccountPage() {
  const { profile, loading, error, refresh } = useProfile();
  const [changingPassword, setChangingPassword] = useState(false);

  const openTwoFactor = () => {
    window.open(TWO_FACTOR_URL, '_blank', 'noopener');
    // The wizard finishes in that other tab, so re-read the profile when the
    // user comes back here - otherwise this card keeps showing the stale state.
    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      refresh();
    };
    window.addEventListener('focus', onFocus);
  };

  if (loading) {
    return (
      <div className="content-fade">
        <Card>
          <LoadingBlock label="Loading account..." />
        </Card>
      </div>
    );
  }

  if (error || !profile?.user) {
    return (
      <div className="content-fade">
        <Card className="card-pad">
          <EmptyState
            icon="alert-triangle"
            title="Failed to load account profile"
            message={error || 'Profile data could not be retrieved from the backend.'}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={refresh}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const user = (profile?.user || {}) as ApiRecord;
  const org = (profile?.customer || {}) as ApiRecord;
  const access = (profile?.user_accesslist || []) as ApiRecord[];
  const roles = (user.user_roles || []) as ApiRecord[];
  const name = profileName(profile);
  const twoFactorOn = !!profile?.has_two_factor;

  return (
    <div className="content-fade">
      {/* Identity banner - also owns the two-factor control. */}
      <Card className="card-pad" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 62,
            height: 62,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-400), var(--green-600))',
            color: '#fff',
            fontSize: 'var(--fs-xl)',
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          {initialsOf(name)}
        </div>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 600, color: 'var(--text-strong)' }}>{name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 2 }}>{profileEmail(profile)}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Badge tone="brand" dot>
              {profileOrg(profile)}
            </Badge>
            {user.is_staff === true && <Badge tone="info">Staff</Badge>}
            {user.is_active === true ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
          </div>
        </div>

        {/* Two-factor authentication.
            Tinted by state rather than the near-white --bg-subtle, which vanished
            against the white card. Given a fixed flex basis so it reads as a
            proper panel instead of shrink-wrapping around its text. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: twoFactorOn ? 'var(--success-soft)' : 'var(--warning-soft)',
            boxShadow: 'var(--shadow-xs)',
            flex: '0 1 440px',
            minWidth: 320,
          }}
        >
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-md)',
              /* White chip: a same-tint chip disappeared once the panel itself
                 became tinted. */
              background: 'var(--bg-elevated)',
              color: twoFactorOn ? 'var(--success)' : 'var(--warning)',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0,
            }}
          >
            <Icon name={twoFactorOn ? 'shield-check' : 'shield'} size={22} />
          </span>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ fontSize: 'var(--fs-md)', fontWeight: 600, color: 'var(--text-strong)' }}>
              Two-Factor Authentication
            </div>
            {/* Current state as plain text, with the action sitting right next to
                it so the status and the thing that changes it read as one unit. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 'var(--fs-md)',
                  fontWeight: 700,
                  color: twoFactorOn ? 'var(--success)' : 'var(--warning)',
                }}
              >
                {twoFactorOn ? 'Enabled' : 'Disabled'}
              </span>
              <Button
                variant={twoFactorOn ? 'default' : 'primary'}
                size="sm"
                icon={twoFactorOn ? 'settings' : 'shield'}
                onClick={openTwoFactor}
                title={
                  twoFactorOn
                    ? 'Manage or disable two-factor authentication'
                    : 'Set up two-factor authentication'
                }
              >
                {twoFactorOn ? 'Manage' : 'Enable'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <Card>
          <CardHead
            title="Profile"
            icon="user"
            action={
              <Button variant="default" size="sm" icon="key-round" onClick={() => setChangingPassword(true)}>
                Change Password
              </Button>
            }
          />
          {/* Identity first, then session context, then preferences/permissions.
              No "Email" row: the identity card above already shows profileEmail().
              "Signed in as" (user_id) stays because that one is NOT up there. */}
          <Row label="Full name" value={name} />
          <Row label="Signed in as" value={scalarize(profile?.user_id)} />
          <Row label="Last login" value={formatDate(profile?.last_login)} />
          <Row label="Timezone" value={scalarize(user.timezone)} />
          <Row label="User type" value={scalarize(user.user_type)} />
          <Row label="Roles" value={roles.length ? roles.map((r, i) => <span className="chip" key={i}>{fkText(r)}</span>) : null} />
        </Card>

        <Card>
          <CardHead title="Access" icon="shield" action={<Badge tone="neutral">{access.length}</Badge>} />
          {access.length === 0 ? (
            <div className="dash-table-empty" style={{ padding: 28 }}>
              No access types assigned.
            </div>
          ) : (
            access.map((a, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--divider)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--text-strong)' }}>
                  <span style={{ color: 'var(--brand)', display: 'inline-flex' }}>
                    <Icon name="check-circle-2" size={15} />
                  </span>
                  {scalarize(a.name)}
                </div>
                {a.description ? (
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 3, paddingLeft: 23 }}>
                    {scalarize(a.description)}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </Card>

        <Card>
          <CardHead title="Organization" icon="building" />
          <Row label="Name" value={scalarize(org.name)} />
          <Row label="Type" value={scalarize(org.organization_type)} />
          <Row label="Email" value={scalarize(org.email)} />
          <Row label="Phone" value={scalarize(org.phone)} />
          <Row
            label="Address"
            value={[org.address1, org.city, org.state, org.postal_code, org.country].filter(Boolean).map(String).join(', ')}
          />
          <Row label="Domain" value={scalarize(org.domain)} />
        </Card>
      </div>

      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
    </div>
  );
}
