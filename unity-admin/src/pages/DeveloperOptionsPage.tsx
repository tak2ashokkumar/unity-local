import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { Card, CardHead, Badge, Button, LoadingBlock, Spinner } from '../components/ui/primitives';
import { ConfirmDialog } from '../components/ui/Overlay';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

/*
 * Developer Options (legacy /101010 -> MiscToolsController, controllers/tools.js:80
 * + templates/tools.html).
 *
 * Six capabilities, and only two of them are reads:
 *   POST /func/refresh_nagios/             -> { task_id } -> poll /task/<id>/
 *   POST /func/refresh_observium_hosts/    -> { task_id } -> poll
 *   POST /func/refresh_observium_interfaces/ -> { task_id } -> poll
 *   POST /func/refresh_observium_stats/    -> { task_id } -> poll
 *   POST /func/update_proxy_configs/       -> raw response, NO polling
 *   GET  /func/get_tenable/                -> read-only panel
 *   GET  /rest/debug_mode/                 -> read-only panel
 *
 * TWO DELIBERATE DIFFERENCES FROM LEGACY:
 *
 * 1. Debug Mode is READ-ONLY here. The previous React page rendered it as a toggle
 *    that POSTed /rest/debug_mode/ - a write that does not exist anywhere in the
 *    legacy app (grep for debug_mode finds only GETs) and whose behaviour on the
 *    backend is unverified. In mock mode it appeared to "work" purely because the
 *    mock echoes any POST back as 201.
 *
 * 2. The five writes are confirmed before firing. Legacy ran them on a single
 *    click with no dialog, no spinner and no error surface - and each one mutates
 *    real infrastructure (regenerating Nagios config, re-syncing Observium,
 *    rewriting every device's proxy config). A confirm step is worth the extra
 *    click. They are also disabled entirely unless a live backend is attached,
 *    because the mock cannot mint a task_id for these paths.
 */
const POLL_INTERVAL_MS = 500;
const POLL_LIMIT = 20; // legacy TaskService2 budget: 20 attempts at 500ms (~10s)

interface ToolAction {
  key: string;
  label: string;
  description: string;
  url: string;
  polls: boolean;
  danger?: boolean;
}

const ACTIONS: ToolAction[] = [
  {
    key: 'nagios',
    label: 'Refresh Nagios',
    description: 'Regenerates Nagios monitoring configuration from the CMDB.',
    url: '/func/refresh_nagios',
    polls: true,
    danger: true,
  },
  {
    key: 'obs-hosts',
    label: 'Refresh Observium Hosts',
    description: 'Re-syncs the Observium host inventory against the CMDB.',
    url: '/func/refresh_observium_hosts',
    polls: true,
    danger: true,
  },
  {
    key: 'obs-interfaces',
    label: 'Refresh Observium Interfaces',
    description: 'Re-syncs Observium interface and port records. Usually the longest running.',
    url: '/func/refresh_observium_interfaces',
    polls: true,
  },
  {
    key: 'obs-stats',
    label: 'Refresh Observium Stats',
    description: 'Refreshes Observium statistics and graph data.',
    url: '/func/refresh_observium_stats',
    polls: true,
  },
  {
    key: 'proxy',
    label: 'Update Proxy Configuration',
    description: 'Regenerates the reverse-proxy configuration for every proxied device.',
    url: '/func/update_proxy_configs',
    polls: false,
    danger: true,
  },
];

interface TaskState {
  state?: string;
  result?: unknown;
}

async function awaitTask(taskId: string): Promise<unknown> {
  for (let i = 0; i < POLL_LIMIT; i += 1) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const t = await api.rawGet<TaskState>(`/task/${taskId}`);
    if (t?.state === 'SUCCESS') return t.result;
    if (t?.state === 'FAILURE') throw new Error(JSON.stringify(t.result ?? 'Task failed'));
  }
  // Legacy gave up here too - the celery job may well still be running.
  throw new Error('Task expired: still running after 10s. Check the backend for the outcome.');
}

function ResultBlock({ value }: { value: unknown }) {
  if (value === undefined) return null;
  return (
    <pre
      style={{
        margin: '12px 20px 18px',
        padding: '12px 14px',
        background: 'var(--bg-inset)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-xs)',
        color: 'var(--text)',
        maxHeight: 260,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
      }}
    >
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function DeveloperOptionsPage() {
  const toast = useToast();

  const [debugMode, setDebugMode] = useState<boolean | null>(null);
  const [debugLoading, setDebugLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  const [tenable, setTenable] = useState<unknown>(undefined);
  const [tenableLoading, setTenableLoading] = useState(true);
  const [tenableError, setTenableError] = useState<string | null>(null);

  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [confirming, setConfirming] = useState<ToolAction | null>(null);

  const loadDebug = useCallback(async () => {
    setDebugLoading(true);
    setDebugError(null);
    try {
      const r = await api.get<{ result?: boolean }>('debug_mode');
      setDebugMode(!!(r && r.result));
    } catch (err) {
      setDebugError(err instanceof Error ? err.message : 'Could not read debug mode');
      setDebugMode(null);
    } finally {
      setDebugLoading(false);
    }
  }, []);

  const loadTenable = useCallback(async () => {
    setTenableLoading(true);
    setTenableError(null);
    try {
      const r = await api.rawGet<unknown>('/func/get_tenable');
      setTenable(r);
    } catch (err) {
      setTenableError(err instanceof Error ? err.message : 'Could not read Tenable status');
    } finally {
      setTenableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDebug();
    loadTenable();
  }, [loadDebug, loadTenable]);

  const run = async (action: ToolAction) => {
    setConfirming(null);
    setRunning(action.key);
    setResults((prev) => ({ ...prev, [action.key]: undefined }));
    try {
      const res = await api.rawPost<ApiRecord>(action.url);
      const taskId = res && typeof res === 'object' ? res.task_id : undefined;
      const value = action.polls && taskId ? await awaitTask(String(taskId)) : res;
      setResults((prev) => ({ ...prev, [action.key]: value }));
      toast.success(`${action.label} finished.`, 'Done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed.';
      setResults((prev) => ({ ...prev, [action.key]: msg }));
      toast.error(`${action.label} failed.`);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Maintenance Actions"
          icon="settings-2"
          action={<Badge tone="danger" dot>Writes to infrastructure</Badge>}
        />
        {ACTIONS.map((a) => (
          <div key={a.key} style={{ borderBottom: '1px solid var(--divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{a.label}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{a.description}</div>
              </div>
              {running === a.key && <Spinner />}
              <Button
                variant={a.danger ? 'danger' : 'default'}
                size="sm"
                icon="play"
                disabled={running !== null}
                onClick={() => setConfirming(a)}
                title={`Run ${a.label}`}
              >
                Run
              </Button>
            </div>
            <ResultBlock value={results[a.key]} />
          </div>
        ))}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <Card>
          <CardHead
            title="Debug Mode"
            icon="bug"
            action={
              debugLoading ? undefined : debugError ? (
                <Badge tone="danger">Error</Badge>
              ) : (
                <Badge tone={debugMode ? 'warning' : 'neutral'} dot>
                  {debugMode ? 'TRUE' : 'FALSE'}
                </Badge>
              )
            }
          />
          {debugLoading ? (
            <LoadingBlock label="Reading setting..." />
          ) : debugError ? (
            <div style={{ padding: '14px 20px', fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
              {debugError}
            </div>
          ) : (
            <div style={{ padding: '14px 20px', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              Platform debug flag, read from <span className="mono">{API_BASE}/debug_mode/</span>. Read-only - the
              legacy panel exposes no way to change it.
            </div>
          )}
        </Card>

        <Card>
          <CardHead
            title="Tenable"
            icon="shield"
            action={
              tenableLoading ? undefined : tenableError ? (
                <Badge tone="danger">Error</Badge>
              ) : undefined
            }
          />
          {tenableLoading ? (
            <LoadingBlock label="Reading integration..." />
          ) : tenableError ? (
            <div style={{ padding: '14px 20px', fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
              {tenableError}
            </div>
          ) : (
            <ResultBlock value={tenable ?? null} />
          )}
        </Card>
      </div>

      {confirming && (
        <ConfirmDialog
          title={`Run ${confirming.label}?`}
          message={
            <>
              {confirming.description} This runs against the backend and changes real infrastructure.
            </>
          }
          confirmLabel="Run"
          danger={!!confirming.danger}
          onConfirm={() => run(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}
