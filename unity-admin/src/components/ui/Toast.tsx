import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Icon } from './Icon';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  title?: string;
  message: string;
}

interface ToastApi {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let seq = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string, title?: string) => {
      const id = seq++;
      setToasts((prev) => [...prev, { id, kind, message, title }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  /*
   * MUST be memoized. This provider wraps the whole app and re-renders on every push
   * AND again on every 4200ms auto-dismiss. An unstable context value hands every
   * useToast() consumer a new identity each time, and six pages put `toast` in a load
   * callback's dependency array - so a toast anywhere re-ran their whole data load,
   * twice. Worse, a page that reports its own load failure via toast.error fed itself:
   * fail -> toast -> new identity -> new load -> fail, network-paced and unterminating
   * (SwitchDetailPage:90, ServerDetailPage, Ipv6AllocationsPage, ZendeskIntegrationPage).
   * `push` depends on [remove] and `remove` on [], so this is stable for the app's life.
   */
  const api = useMemo<ToastApi>(
    () => ({
      success: (m, t) => push('success', m, t),
      error: (m, t) => push('error', m, t),
      info: (m, t) => push('info', m, t),
    }),
    [push]
  );

  const iconFor = (k: ToastKind) => (k === 'success' ? 'check-circle-2' : k === 'error' ? 'x-circle' : 'info');

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`} role="status">
            <span className="toast-ic">
              <Icon name={iconFor(t.kind)} size={18} />
            </span>
            <div className="toast-msg">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div>{t.message}</div>
            </div>
            <span className="toast-x" onClick={() => remove(t.id)}>
              <Icon name="x" size={15} />
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* Module constant, not a fresh object per call - returning a new one would reintroduce
   exactly the instability the memo above removes, for anything rendered outside the
   provider. */
const NO_OP_TOAST: ToastApi = {
  success: () => undefined,
  error: () => undefined,
  info: () => undefined,
};

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  // Safe no-op fallback so components never crash if used outside the provider.
  return ctx ?? NO_OP_TOAST;
}
