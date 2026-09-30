import { useEffect, useState } from 'react';

// Which backend the server is proxying to. Served by static-server.js at
// /__admin_env. When `live` is true the screen is showing records from a real
// deployment and every edit/delete acts on that deployment, so the shell renders
// an unmissable warning strip.
export interface BackendEnv {
  apiTarget: string;
  live: boolean;
  authenticated: boolean;
}

let cached: BackendEnv | null = null;
let inflight: Promise<BackendEnv | null> | null = null;

function load(): Promise<BackendEnv | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/__admin_env', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((v: BackendEnv | null) => {
        cached = v;
        return v;
      })
      // The dev server does not serve this endpoint; absence simply means "local".
      .catch(() => null);
  }
  return inflight;
}

export function useBackendEnv(): BackendEnv | null {
  const [env, setEnv] = useState<BackendEnv | null>(cached);
  useEffect(() => {
    let active = true;
    load().then((v) => {
      if (active) setEnv(v);
    });
    return () => {
      active = false;
    };
  }, []);
  return env;
}
