import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './apiClient';
import { ApiRecord } from './types';

interface ListState<T> {
  items: T[];
  count: number;
  loading: boolean;
  error: string | null;
}

// Fetch a full collection once (the API returns the whole array without page params).
// The list page then does client-side search / sort / pagination for a snappy UX.
//
// api.list caches per URL, so a revisit or a tab flip back is served from memory
// instead of re-downloading the collection. `reload` asks for a fresh copy, which is
// what the Refresh button and post-write reloads want - without that flag Refresh
// would hand back the very bytes the user pressed the button to replace.
export function useList<T = ApiRecord>(uri: string | null, deps: unknown[] = []) {
  const [state, setState] = useState<ListState<T>>({ items: [], count: 0, loading: true, error: null });

  const fetchList = useCallback(
    async (fresh: boolean) => {
      if (!uri) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const { items, count } = await api.list<T>(uri, undefined, { fresh });
        setState({ items, count, loading: false, error: null });
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Failed to load data';
        setState({ items: [], count: 0, loading: false, error: msg });
      }
    },
    [uri]
  );

  // Mount / uri change: cache-first.
  const load = useCallback(() => fetchList(false), [fetchList]);
  // Explicit user-driven refresh: always go to the network.
  const reload = useCallback(() => fetchList(true), [fetchList]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, ...deps]);

  // Allow the page to patch local state after create/edit/delete (mock does not persist).
  const setItems = useCallback((updater: (prev: T[]) => T[]) => {
    setState((s) => {
      const items = updater(s.items);
      return { ...s, items, count: items.length };
    });
  }, []);

  return { ...state, reload, setItems };
}

export function useDetail<T = ApiRecord>(uri: string | null, id: string | number | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!uri || id == null) return;
    setLoading(true);
    setError(null);
    try {
      const d = await api.detail<T>(uri, id);
      setData(d);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load record');
    } finally {
      setLoading(false);
    }
  }, [uri, id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { data, loading, error, reload: fetchDetail };
}
