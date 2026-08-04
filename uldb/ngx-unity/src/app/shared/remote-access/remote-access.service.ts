import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface RemoteWebAccessState {
  supported: boolean;
  resource_type: string;
  resource_id: string;
  web_access_enabled: boolean;
  has_permission: boolean;
  collector_associated: boolean;
  collector_state: string;
  collector_state_allows_session: boolean;
  can_create_session: boolean;
  message: string;
}

export interface RemoteWebSessionResponse {
  grant: string;
  grant_id: string;
  session_id: string;
  resource_id: string;
  resource_type: string;
  source_product?: string;
  expires_at: number;
  grant_expires_at: number;
  grant_ttl_seconds: number;
  session_ttl_seconds: number;
  cookie_exchange_path: string;
  websocket_path: string;
  viewer_path: string;
  viewer_url: string;
}

export type RemoteWebTransport = 'websocket' | 'webrtc' | 'novnc';

export interface RemoteWebCapabilities {
  clipboard: boolean;
  upload: boolean;
  download: boolean;
  printing: boolean;
  recording: boolean;
}

export interface RemoteWebViewerSession {
  session_id: string;
  resource_id: string;
  resource_type: string;
  protocol: string;
  source_product: string;
  status: string;
  expires_at: number | string;
  created_at: number | string;
  closed_reason?: string;
  failure_reason?: string;
  websocket_path: string;
  transport: RemoteWebTransport;
  capabilities: RemoteWebCapabilities;
  idle_timeout_seconds: number;
  reconnect_grace_seconds: number;
  session_ttl_seconds: number;
}

export interface RemoteCookieExchangeResponse {
  session_id: string;
  protocol: string;
  expires_in: number;
  viewer_path?: string;
  viewer_url?: string;
}

export interface RemoteWebSessionLaunch {
  session: RemoteWebSessionResponse;
  cookie: RemoteCookieExchangeResponse;
  viewerUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteAccessService {
  private readonly vcenterWebSessionsPath = '/api/remote-access/vcenter-web-sessions/';
  private readonly viewerWebSessionsPath = '/remote-access/web-sessions/';
  private readonly defaultCookieExchangePath = '/api/remote-access/cookie-exchange/';
  private readonly defaultWebsocketPath = '/remote-access/ws';

  constructor(private http: HttpClient) { }

  createVCenterWebSession(resourceId: string): Observable<RemoteWebSessionResponse> {
    return this.http.post<RemoteWebSessionResponse>(
      this.vcenterWebSessionsPath,
      { resource_id: resourceId },
      { withCredentials: true }
    );
  }

  exchangeRemoteAccessCookie(grant: string, cookieExchangePath?: string): Observable<RemoteCookieExchangeResponse> {
    return this.http.post<RemoteCookieExchangeResponse>(
      cookieExchangePath || this.defaultCookieExchangePath,
      { grant },
      { withCredentials: true }
    );
  }

  createVCenterWebLaunch(resourceId: string): Observable<RemoteWebSessionLaunch> {
    return this.createVCenterWebSession(resourceId).pipe(
      switchMap((session: RemoteWebSessionResponse) => {
        return this.exchangeRemoteAccessCookie(session.grant, session.cookie_exchange_path).pipe(
          map((cookie: RemoteCookieExchangeResponse) => {
            const viewerLocation = session.viewer_url || session.viewer_path || cookie.viewer_url || cookie.viewer_path || `/main#/remote-access/web-viewer/${session.session_id}`;
            return {
              session,
              cookie,
              viewerUrl: this.absoluteUrl(viewerLocation)
            };
          })
        );
      })
    );
  }

  getVCenterWebSession(sessionId: string): Observable<any> {
    return this.http.get(`${this.vcenterWebSessionsPath}${sessionId}/`, { withCredentials: true });
  }

  getRemoteWebViewerSession(sessionId: string): Observable<RemoteWebViewerSession> {
    return this.http.get<RemoteWebViewerSession>(
      `${this.viewerWebSessionsPath}${sessionId}/viewer/`,
      { withCredentials: true }
    );
  }

  terminateVCenterWebSession(sessionId: string, reason: string = 'viewer_closed'): Observable<any> {
    return this.http.delete(`${this.vcenterWebSessionsPath}${sessionId}/`, {
      body: { reason },
      withCredentials: true
    });
  }

  terminateRemoteWebViewerSession(sessionId: string, reason: string = 'viewer_closed'): Observable<any> {
    return this.http.delete(`${this.viewerWebSessionsPath}${sessionId}/viewer/`, {
      body: { reason },
      withCredentials: true
    });
  }

  remoteWebSocketUrl(websocketPath?: string): string {
    const path = websocketPath || this.defaultWebsocketPath;
    if (/^wss?:\/\//i.test(path)) {
      return path;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${protocol}//${window.location.host}${normalizedPath}`;
  }

  absoluteUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    return url;
  }
}
