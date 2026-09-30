import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './apiClient';
import { ApiRecord } from './types';

// Shape of GET /rest/user/profile/ (the signed-in admin's session context).
export interface AdminProfile {
  user?: ApiRecord;
  customer?: ApiRecord;
  user_accesslist?: ApiRecord[];
  user_id?: string;
  last_login?: string;
  release_version?: string;
  release_date?: string;
  has_two_factor?: boolean;
}

// Module-level cache: the profile is session-wide, so the header and the Account
// page share a single in-flight request instead of each fetching their own.
let cached: AdminProfile | null = null;
let inflight: Promise<AdminProfile> | null = null;
let lastError: string | null = null;

export function loadProfile(): Promise<AdminProfile> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    lastError = null;
    inflight = api
      .get<AdminProfile>('user/profile')
      .then((p) => {
        cached = p || {};
        lastError = null;
        return cached;
      })
      .catch((err) => {
        inflight = null;
        lastError = err instanceof Error ? err.message : 'Failed to load profile';
        return {};
      });
  }
  return inflight;
}

// Drop the cached session context so the next read hits the API again. Needed
// when something OUTSIDE this app changes the profile: the Django two-factor
// wizard runs in its own browser tab, so re-asking when the user comes back is
// the only way this UI can learn that 2FA was just enabled or disabled.
export function invalidateProfile(): void {
  cached = null;
  inflight = null;
  lastError = null;
}

export function useProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(lastError);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cached) {
      setProfile(cached);
      setLoading(false);
      setError(null);
      return () => {
        mounted.current = false;
      };
    }
    loadProfile().then((p) => {
      if (mounted.current) {
        setProfile(p);
        setError(lastError);
        setLoading(false);
      }
    });
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(() => {
    invalidateProfile();
    setLoading(true);
    setError(null);
    loadProfile().then((p) => {
      if (mounted.current) {
        setProfile(p);
        setError(lastError);
        setLoading(false);
      }
    });
  }, []);

  return { profile, loading, error, refresh };
}

// Display helpers used by the header and the Account page.
export function profileName(profile: AdminProfile | null): string {
  const u = profile?.user as ApiRecord | undefined;
  if (!u) return 'Admin';
  const full = u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ');
  return String(full || u.email || 'Admin').trim();
}

export function profileEmail(profile: AdminProfile | null): string {
  const u = profile?.user as ApiRecord | undefined;
  return String(u?.email || profile?.user_id || '');
}

export function profileOrg(profile: AdminProfile | null): string {
  const c = profile?.customer as ApiRecord | undefined;
  return String(c?.name || 'United Layer');
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'AD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
