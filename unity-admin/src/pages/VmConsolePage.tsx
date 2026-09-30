import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, buildUrl } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { loadScriptsInOrder, loadStylesheet } from '../utils/loadExternal';
import { FieldDef } from '../config/fieldTypes';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';

/*
 * VM web console - a real SSH terminal, ported from the legacy panel
 * (TerraformWebConsoleController, controllers/cloud.js:2376, and its VMware/OpenStack
 * siblings).
 *
 *   GET  <base>/{id}/webconsole/   -> { vm_name, vm_id }   opens the session
 *   POST <base>/check_auth/        -> credentials, when the VM asks for them
 *   ws(s)://<host>/webterminal/{vm_id}/
 *        send { tp: 'init',   data: { rows, cols, ...credentials } }
 *        send { tp: 'client', data: '<keystrokes>' }
 *        receive server output as text
 *
 * The proxy had no WebSocket support at all, so this needed an upgrade handler added to
 * tools/proxy/server.js before it could work locally.
 *
 * TERMINAL: xterm 2.x, loaded on demand from the Django static tree
 * (/static/lib/xterm.js + /static/lib/fit.js + /static/css/xterm.css) - the very
 * library the legacy console used, already vendored in this repo. It is a UMD global
 * with NO jQuery dependency, so it drops straight into a ref'd div, and loading it
 * lazily keeps 149KB out of the main bundle for a screen most sessions never open.
 *
 * The terminal is deliberately NOT React state: xterm owns the DOM inside its host node
 * and repaints itself, so it lives in a ref and React only manages mount and teardown
 * around it. Nothing may be rendered as a child of that node.
 */

const XTERM_JS = '/static/lib/xterm.js';
const XTERM_FIT = '/static/lib/fit.js';
const XTERM_CSS = '/static/css/xterm.css';

const AUTH_FIELDS: FieldDef[] = [
  { name: 'username', label: 'Username', cell: 'text', required: true },
  { name: 'password', label: 'Password', cell: 'text', input: 'password', required: true },
];

/* xterm 2.x is a browser global and ships no types, so the surface used here is
   declared locally rather than pulling in a dependency just for typings. */
interface XtermTerminal {
  open(parent: HTMLElement, focus?: boolean): void;
  write(data: string): void;
  writeln(data: string): void;
  on(event: string, handler: (data: string) => void): void;
  destroy(): void;
  focus(): void;
  fit?: () => void;
  cols: number;
  rows: number;
}

type TerminalCtor = new (opts: Record<string, unknown>) => XtermTerminal;

type Status = 'idle' | 'loading' | 'connecting' | 'open' | 'closed';

export function VmConsolePage({ base = 'terraform' }: { base?: string }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [authOpen, setAuthOpen] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XtermTerminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSession(await api.get<ApiRecord>(`${base}/${id}/webconsole`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open a console session for this VM.');
    } finally {
      setLoading(false);
    }
  }, [base, id]);

  useEffect(() => {
    load();
  }, [load]);

  /* Tear the socket and the terminal down together - either can outlive the component
     otherwise, and a live socket writing into a destroyed terminal throws. */
  const teardown = useCallback(() => {
    const ws = socketRef.current;
    socketRef.current = null;
    if (ws) {
      ws.onclose = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.close();
    }
    const term = termRef.current;
    termRef.current = null;
    if (term) {
      try {
        term.destroy();
      } catch {
        /* xterm 2.x can throw if it is already detached; nothing useful to do. */
      }
    }
  }, []);

  useEffect(() => teardown, [teardown]);

  const connect = useCallback(
    async (credentials: ApiRecord = {}) => {
      // Captured before the awaits below: narrowing on a ref's .current does not
      // survive them, and the node could in principle be gone by the time we resume.
      const host = hostRef.current;
      if (!session || !host) return;
      setStatus('loading');
      setError(null);
      try {
        // fit.js reads window.Terminal as it evaluates, so the order matters.
        await loadStylesheet(XTERM_CSS);
        await loadScriptsInOrder([XTERM_JS, XTERM_FIT]);
      } catch {
        setStatus('idle');
        setError(
          'Could not load the terminal library from /static/lib/xterm.js. Check that the ' +
            'admin static server is running and serving the shared /static tree.'
        );
        return;
      }

      const Ctor = (window as unknown as { Terminal?: TerminalCtor }).Terminal;
      if (!Ctor) {
        setStatus('idle');
        setError('The terminal library loaded but did not register itself.');
        return;
      }

      teardown();
      // Options match the legacy console (cloud.js:2475).
      const term = new Ctor({ screenKeys: true, useStyle: true, cursorBlink: true });
      term.open(host);
      if (typeof term.fit === 'function') term.fit();
      termRef.current = term;
      term.focus();

      const vmId = scalarize(session.vm_id) || id;
      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const url = `${proto}${window.location.host}/webterminal/${vmId}/`;

      setStatus('connecting');
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        setStatus('closed');
        setError('This browser could not open a WebSocket to the console.');
        return;
      }
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('open');
        ws.send(
          JSON.stringify({ tp: 'init', data: { rows: term.rows, cols: term.cols, ...credentials } })
        );
      };
      // Raw write - xterm interprets the escape sequences, which is the whole point.
      ws.onmessage = (evt) => {
        if (typeof evt.data === 'string') term.write(evt.data);
      };
      ws.onerror = () => term.writeln('\r\n[connection error]');
      ws.onclose = () => {
        setStatus('closed');
        term.writeln('\r\n[session closed]');
      };

      // Every keystroke, control sequences included, goes straight through.
      term.on('data', (data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ tp: 'client', data }));
        }
      });
    },
    [session, id, teardown]
  );

  // Keep the terminal sized to its container.
  useEffect(() => {
    const onResize = () => {
      const term = termRef.current;
      if (term && typeof term.fit === 'function') term.fit();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const authenticate = async (values: ApiRecord) => {
    try {
      await api.rawPost(buildUrl(`${base}/check_auth`), { vm_id: id, ...values }).catch(() => null);
    } finally {
      setAuthOpen(false);
      connect(values);
    }
  };

  const disconnect = () => {
    teardown();
    setStatus('closed');
  };

  const busy = status === 'loading' || status === 'connecting';

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Card>
        <CardHead
          title={`Console: ${scalarize(session?.vm_name) || id}`}
          icon="terminal"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge tone={status === 'open' ? 'success' : busy ? 'info' : 'neutral'} dot>
                {status}
              </Badge>
              {status === 'open' ? (
                <Button variant="danger" size="sm" icon="square" onClick={disconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon="play"
                  disabled={!session || busy}
                  loading={busy}
                  onClick={() => setAuthOpen(true)}
                >
                  Connect
                </Button>
              )}
            </div>
          }
        />

        {loading ? (
          <LoadingBlock label="Opening the console session..." />
        ) : error && status === 'idle' ? (
          <EmptyState
            icon="alert-triangle"
            title="Console unavailable"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : (
          <>
            {/* xterm owns everything inside this node - React must not render children
                into it, or the two will fight over the same DOM. */}
            <div ref={hostRef} className="vm-console" />
            <div className="card-foot" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)' }}>
              {status === 'open'
                ? 'Click the terminal to focus it. Full VT100 emulation - curses programs paint correctly.'
                : 'Press Connect to open a session.'}
            </div>
          </>
        )}
      </Card>

      {authOpen && (
        <FormModal
          title="VM Authenticate"
          subtitle={scalarize(session?.vm_name) || id}
          onClose={() => setAuthOpen(false)}
        >
          <RecordForm
            fields={AUTH_FIELDS}
            method="Add"
            onSubmit={authenticate}
            onCancel={() => setAuthOpen(false)}
          />
        </FormModal>
      )}
    </div>
  );
}
