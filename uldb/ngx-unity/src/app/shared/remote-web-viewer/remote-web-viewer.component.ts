import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  RemoteAccessService,
  RemoteWebCapabilities,
  RemoteWebTransport,
  RemoteWebViewerSession
} from '../remote-access/remote-access.service';

type RemoteWebViewerState =
  'authorizing' |
  'waiting_collector' |
  'starting_browser' |
  'connecting_target' |
  'active' |
  'reconnecting' |
  'terminating' |
  'terminated' |
  'expired' |
  'failed' |
  'access_denied';

@Component({
  selector: 'remote-web-viewer',
  templateUrl: './remote-web-viewer.component.html',
  styleUrls: ['./remote-web-viewer.component.scss']
})
export class RemoteWebViewerComponent implements OnInit, OnDestroy {
  @ViewChild('viewport', { static: false }) viewport: ElementRef<HTMLDivElement>;

  sessionId = '';
  state: RemoteWebViewerState = 'authorizing';
  statusLabel = 'Authorizing';
  errorMessage = '';
  frameUrl = '';
  textFrame = '';
  connectionStatus = 'Disconnected';
  durationLabel = '00:00';
  idleWarningMessage = '';
  reconnectMessage = '';
  sourceProduct = 'unityone';
  transport: RemoteWebTransport = 'websocket';
  capabilities: RemoteWebCapabilities = this.defaultCapabilities();
  isConnected = false;
  isClosing = false;
  isFullscreen = false;

  private ws: WebSocket;
  private session: RemoteWebViewerSession;
  private sessionSub: Subscription;
  private closeSub: Subscription;
  private resizeTimer: any;
  private durationTimer: any;
  private idleTimer: any;
  private heartbeatTimer: any;
  private reconnectTimer: any;
  private objectUrl = '';
  private createdAtMs = Date.now();
  private expiresAtMs = 0;
  private lastInputAtMs = Date.now();
  private reconnectDeadlineMs = 0;
  private manualDisconnect = false;
  private destroyed = false;

  constructor(
    private route: ActivatedRoute,
    private remoteAccess: RemoteAccessService
  ) { }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    if (!this.sessionId) {
      this.fail('Remote web session is missing.');
      return;
    }
    this.authorizeAndAttach(false);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearTimers();
    this.releaseObjectUrl();
    this.unsubscribeSession();
    this.unsubscribeClose();
    this.sendCloseFrame('viewer_unloaded');
    this.closeSocket();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.sendCloseFrame('viewer_unloaded');
    this.closeSocket();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.sendViewportResize(), 150);
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement;
    setTimeout(() => this.sendViewportResize(), 0);
  }

  get canSendInput(): boolean {
    return this.state === 'active' && this.ws && this.ws.readyState === WebSocket.OPEN && !this.isClosing;
  }

  get canSendControl(): boolean {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN && !this.isClosing && !this.terminalState);
  }

  get terminalState(): boolean {
    return this.state === 'terminated' || this.state === 'expired' || this.state === 'failed' || this.state === 'access_denied';
  }

  get returnLabel(): string {
    return this.sourceProduct === 'lumi' ? 'Return to LUMI' : 'Return to UnityOne';
  }

  authorizeAndAttach(isReconnect: boolean): void {
    if (this.destroyed) {
      return;
    }
    this.unsubscribeSession();
    this.errorMessage = '';
    this.reconnectMessage = '';
    this.setState(isReconnect ? 'reconnecting' : 'authorizing');
    this.connectionStatus = isReconnect ? 'Revalidating session' : 'Validating session';

    this.sessionSub = this.remoteAccess.getRemoteWebViewerSession(this.sessionId)
      .subscribe((session: RemoteWebViewerSession) => {
        if (this.destroyed) {
          return;
        }
        this.applySession(session);
        if (!this.sessionIsAccessible(session)) {
          return;
        }
        this.attachTransport();
      }, error => this.handleAuthorizationError(error));
  }

  retry(): void {
    if (this.isClosing) {
      return;
    }
    this.manualDisconnect = true;
    this.closeSocket();
    this.manualDisconnect = false;
    this.authorizeAndAttach(true);
  }

  endSession(): void {
    if (this.isClosing || this.state === 'terminated') {
      return;
    }
    this.isClosing = true;
    this.manualDisconnect = true;
    this.setState('terminating');
    this.connectionStatus = 'Ending session';
    this.sendCloseFrame('viewer_closed');
    this.unsubscribeClose();
    this.closeSub = this.remoteAccess.terminateRemoteWebViewerSession(this.sessionId, 'viewer_closed')
      .subscribe(() => {
        this.setState('terminated');
        this.connectionStatus = 'Terminated';
        this.closeSocket();
      }, () => {
        this.setState('failed');
        this.errorMessage = 'Unable to terminate the remote web session. Please refresh status or contact support.';
        this.connectionStatus = 'Termination failed';
        this.closeSocket();
      });
  }

  toggleFullscreen(): void {
    const element = document.querySelector('.remote-web-viewer') as HTMLElement;
    if (!document.fullscreenElement && element && element.requestFullscreen) {
      element.requestFullscreen();
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  returnToSource(): void {
    if (this.sourceProduct === 'lumi') {
      window.close();
      return;
    }
    window.location.href = '/main#/default';
  }

  onKeyboardEvent(event: KeyboardEvent, eventType: string): void {
    if (!this.canSendInput) {
      return;
    }
    this.markInputActivity();
    this.sendInput({
      type: 'keyboard',
      event: eventType,
      key: event.key,
      code: event.code,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      repeat: event.repeat
    });
    event.preventDefault();
  }

  onMouseEvent(event: MouseEvent, eventType: string): void {
    if (!this.canSendInput || !this.viewport) {
      return;
    }
    const rect = this.viewport.nativeElement.getBoundingClientRect();
    this.markInputActivity();
    this.sendInput({
      type: 'mouse',
      event: eventType,
      x: this.clamp(Math.round(event.clientX - rect.left), 0, Math.round(rect.width)),
      y: this.clamp(Math.round(event.clientY - rect.top), 0, Math.round(rect.height)),
      button: event.button,
      buttons: event.buttons,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey
    });
    this.focusViewport();
    event.preventDefault();
  }

  onWheel(event: WheelEvent): void {
    if (!this.canSendInput || !this.viewport) {
      return;
    }
    const rect = this.viewport.nativeElement.getBoundingClientRect();
    this.markInputActivity();
    this.sendInput({
      type: 'wheel',
      x: this.clamp(Math.round(event.clientX - rect.left), 0, Math.round(rect.width)),
      y: this.clamp(Math.round(event.clientY - rect.top), 0, Math.round(rect.height)),
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    });
    event.preventDefault();
  }

  capabilityEnabled(name: keyof RemoteWebCapabilities): boolean {
    return !!(this.capabilities && this.capabilities[name]);
  }

  private attachTransport(): void {
    if (this.transport === 'websocket') {
      this.connectWebSocket();
      return;
    }
    if (this.transport === 'webrtc') {
      this.fail('WebRTC remote web display transport is not enabled in this UnityOne frontend build.');
      return;
    }
    if (this.transport === 'novnc') {
      this.fail('noVNC-compatible remote web display transport is not enabled in this UnityOne frontend build.');
      return;
    }
    this.fail('Remote web display transport is not supported.');
  }

  private connectWebSocket(): void {
    this.manualDisconnect = false;
    this.closeSocket();
    this.connectionStatus = 'Opening secure viewer channel';
    this.setState(this.state === 'reconnecting' ? 'reconnecting' : 'waiting_collector');

    this.ws = new WebSocket(this.remoteAccess.remoteWebSocketUrl(this.session && this.session.websocket_path));
    this.ws.binaryType = 'blob';

    this.ws.onopen = () => {
      this.isConnected = true;
      this.connectionStatus = 'Secure channel connected';
      this.setState('starting_browser');
      this.startViewerHeartbeat();
      this.sendViewportResize();
      setTimeout(() => this.focusViewport(), 0);
    };

    this.ws.onmessage = (event: MessageEvent) => this.handleMessage(event.data);

    this.ws.onerror = () => {
      if (!this.terminalState) {
        this.connectionStatus = 'Connection error';
        this.scheduleReconnect('Remote web viewer connection interrupted.');
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      if (!this.manualDisconnect && !this.terminalState && !this.destroyed) {
        this.scheduleReconnect('Remote web viewer disconnected.');
      }
    };
  }

  private applySession(session: RemoteWebViewerSession): void {
    this.session = session;
    this.sourceProduct = session.source_product || 'unityone';
    this.transport = session.transport || 'websocket';
    this.capabilities = Object.assign(this.defaultCapabilities(), session.capabilities || {});
    this.createdAtMs = this.toEpochMs(session.created_at) || Date.now();
    this.expiresAtMs = this.toEpochMs(session.expires_at);
    this.lastInputAtMs = Date.now();
    this.startTimers();
  }

  private sessionIsAccessible(session: RemoteWebViewerSession): boolean {
    if (!session || session.session_id !== this.sessionId || session.protocol !== 'web') {
      this.fail('Remote web session is not valid for this viewer.');
      return false;
    }
    const mappedState = this.stateFromBackendStatus(session.status, session.closed_reason || session.failure_reason);
    if (mappedState === 'terminated' || mappedState === 'expired' || mappedState === 'failed') {
      this.setState(mappedState);
      this.errorMessage = session.closed_reason || session.failure_reason || '';
      this.connectionStatus = this.statusLabel;
      return false;
    }
    this.setState(mappedState);
    return true;
  }

  private handleAuthorizationError(error: any): void {
    const statusCode = error && error.status;
    const serverMessage = error && error.error && (error.error.error || error.error.detail);
    if (statusCode === 401 || statusCode === 403) {
      this.setState('access_denied');
      this.errorMessage = serverMessage || 'You are not authorized to access this remote web session.';
      this.connectionStatus = 'Access denied';
      return;
    }
    if (statusCode === 404) {
      this.setState('failed');
      this.errorMessage = serverMessage || 'Remote web session was not found.';
      this.connectionStatus = 'Missing session';
      return;
    }
    if (statusCode === 410) {
      this.setState('expired');
      this.errorMessage = serverMessage || 'Remote web session expired.';
      this.connectionStatus = 'Expired';
      return;
    }
    this.fail(serverMessage || 'Unable to validate the remote web session.');
  }

  private handleMessage(data: any): void {
    if (data instanceof Blob) {
      this.setBlobFrame(data);
      this.setState('active');
      return;
    }
    if (data instanceof ArrayBuffer) {
      this.setBlobFrame(new Blob([data]));
      this.setState('active');
      return;
    }
    if (typeof data !== 'string') {
      return;
    }

    let payload: any;
    try {
      payload = JSON.parse(data);
    } catch (e) {
      this.textFrame = data;
      this.setState('active');
      return;
    }

    if (payload.type === 'vcenter_web_status') {
      this.handleStatusMessage(payload);
      return;
    }

    if (payload.type === 'vcenter_web_close' || payload.type === 'ra_close' || payload.type === 'session_failed') {
      this.handleCloseMessage(payload);
      return;
    }

    const nested = payload.payload || {};
    const frame = payload.data_b64 || payload.image_b64 || nested.data_b64 || nested.image_b64;
    if (frame) {
      const mimeType = payload.mime_type || payload.content_type || nested.mime_type || nested.content_type || 'image/jpeg';
      this.setBase64Frame(frame, mimeType);
      this.setState('active');
      return;
    }

    if (nested.text || payload.data) {
      this.textFrame = nested.text || payload.data;
      this.setState('active');
    }
  }

  private handleStatusMessage(payload: any): void {
    const state = this.stateFromCollectorStatus(payload.status || payload.stage, payload.reason || payload.error || payload.error_code);
    this.setState(state);
    this.connectionStatus = payload.message || this.statusLabel;
    if (payload.reason || payload.error) {
      this.errorMessage = payload.reason || payload.error;
    } else if (state !== 'failed' && state !== 'access_denied') {
      this.errorMessage = '';
    }
  }

  private handleCloseMessage(payload: any): void {
    const reason = payload.reason || payload.error || payload.error_code || '';
    const state = this.closeReasonState(reason, payload.type);
    this.setState(state);
    this.errorMessage = reason;
    this.connectionStatus = this.statusLabel;
    this.manualDisconnect = true;
    this.closeSocket();
  }

  private sendViewportResize(): void {
    if (!this.canSendControl || !this.viewport) {
      return;
    }
    const rect = this.viewport.nativeElement.getBoundingClientRect();
    this.ws.send(JSON.stringify({
      type: 'browser_resize',
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    }));
  }

  private sendInput(payload: any): void {
    if (!this.canSendInput) {
      return;
    }
    this.ws.send(JSON.stringify(payload));
  }

  private sendCloseFrame(reason: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'vcenter_web_close', reason }));
    }
  }

  private scheduleReconnect(message: string): void {
    if (this.isClosing || this.terminalState || this.destroyed) {
      return;
    }
    if (!this.reconnectDeadlineMs) {
      const grace = this.session && this.session.reconnect_grace_seconds ? this.session.reconnect_grace_seconds : 60;
      this.reconnectDeadlineMs = Date.now() + (grace * 1000);
    }
    if (Date.now() > this.reconnectDeadlineMs) {
      this.fail('Remote web viewer could not reconnect before the session grace period ended.');
      return;
    }
    this.setState('reconnecting');
    this.connectionStatus = message;
    const seconds = Math.max(1, Math.ceil((this.reconnectDeadlineMs - Date.now()) / 1000));
    this.reconnectMessage = 'Reconnecting. Grace period remaining ' + seconds + 's.';
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.authorizeAndAttach(true), 2000);
  }

  private startTimers(): void {
    clearInterval(this.durationTimer);
    clearInterval(this.idleTimer);
    this.updateDuration();
    this.updateIdleWarning();
    this.durationTimer = setInterval(() => this.updateDuration(), 1000);
    this.idleTimer = setInterval(() => this.updateIdleWarning(), 1000);
  }

  private updateDuration(): void {
    const elapsed = Math.max(0, Math.floor((Date.now() - this.createdAtMs) / 1000));
    this.durationLabel = this.formatDuration(elapsed);
    if (this.expiresAtMs && Date.now() >= this.expiresAtMs && !this.terminalState) {
      this.setState('expired');
      this.connectionStatus = 'Expired';
      this.errorMessage = 'Remote web session expired.';
      this.closeSocket();
    }
  }

  private updateIdleWarning(): void {
    const timeout = this.session && this.session.idle_timeout_seconds ? this.session.idle_timeout_seconds : 0;
    if (!timeout || this.terminalState) {
      this.idleWarningMessage = '';
      return;
    }
    const elapsed = Math.floor((Date.now() - this.lastInputAtMs) / 1000);
    const remaining = timeout - elapsed;
    this.idleWarningMessage = remaining > 0 && remaining <= 60
      ? 'Idle timeout in ' + remaining + 's'
      : '';
  }

  private markInputActivity(): void {
    this.lastInputAtMs = Date.now();
  }

  private setBlobFrame(blob: Blob): void {
    this.releaseObjectUrl();
    this.objectUrl = URL.createObjectURL(blob);
    this.frameUrl = this.objectUrl;
    this.textFrame = '';
    this.connectionStatus = 'Display active';
    this.reconnectDeadlineMs = 0;
    this.reconnectMessage = '';
  }

  private setBase64Frame(data: string, mimeType: string): void {
    this.releaseObjectUrl();
    this.frameUrl = 'data:' + mimeType + ';base64,' + data;
    this.textFrame = '';
    this.connectionStatus = 'Display active';
    this.reconnectDeadlineMs = 0;
    this.reconnectMessage = '';
  }

  private setState(state: RemoteWebViewerState): void {
    this.state = state;
    this.statusLabel = this.labelForState(state);
  }

  private fail(message: string): void {
    this.setState('failed');
    this.errorMessage = message;
    this.connectionStatus = 'Failed';
    this.closeSocket();
  }

  private closeSocket(): void {
    clearInterval(this.heartbeatTimer);
    if (this.ws) {
      const socket = this.ws;
      this.ws = null;
      try {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      } catch (e) { }
    }
    this.isConnected = false;
  }

  private clearTimers(): void {
    clearTimeout(this.resizeTimer);
    clearTimeout(this.reconnectTimer);
    clearInterval(this.durationTimer);
    clearInterval(this.idleTimer);
    clearInterval(this.heartbeatTimer);
  }

  private releaseObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = '';
    }
  }

  private unsubscribeSession(): void {
    if (this.sessionSub) {
      this.sessionSub.unsubscribe();
      this.sessionSub = null;
    }
  }

  private unsubscribeClose(): void {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
      this.closeSub = null;
    }
  }

  private focusViewport(): void {
    if (this.viewport) {
      this.viewport.nativeElement.focus();
    }
  }

  private startViewerHeartbeat(): void {
    clearInterval(this.heartbeatTimer);
    this.sendViewerHeartbeat();
    this.heartbeatTimer = setInterval(() => this.sendViewerHeartbeat(), 20000);
  }

  private sendViewerHeartbeat(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.terminalState && !this.isClosing) {
      this.ws.send(JSON.stringify({ type: 'viewer_heartbeat' }));
    }
  }

  private defaultCapabilities(): RemoteWebCapabilities {
    return {
      clipboard: false,
      upload: false,
      download: false,
      printing: false,
      recording: false
    };
  }

  private labelForState(state: RemoteWebViewerState): string {
    const labels = {
      authorizing: 'Authorizing',
      waiting_collector: 'Waiting for Collector',
      starting_browser: 'Starting browser',
      connecting_target: 'Connecting to target',
      active: 'Active',
      reconnecting: 'Reconnecting',
      terminating: 'Terminating',
      terminated: 'Terminated',
      expired: 'Expired',
      failed: 'Failed',
      access_denied: 'Access denied'
    };
    return labels[state] || 'Unknown';
  }

  private stateFromBackendStatus(status: string, reason?: string): RemoteWebViewerState {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'requested') {
      return 'waiting_collector';
    }
    if (normalized === 'active') {
      return 'starting_browser';
    }
    if (normalized === 'connected') {
      return 'active';
    }
    if (normalized === 'viewer_disconnected') {
      return 'reconnecting';
    }
    if (normalized === 'closed') {
      return this.closeReasonState(reason || '', 'closed');
    }
    if (normalized === 'failed') {
      return 'failed';
    }
    return 'waiting_collector';
  }

  private stateFromCollectorStatus(status: string, reason?: string): RemoteWebViewerState {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'waiting_collector' || normalized === 'collector_wait' || normalized === 'queued') {
      return 'waiting_collector';
    }
    if (normalized === 'starting_browser' || normalized === 'browser_starting' || normalized === 'active') {
      return 'starting_browser';
    }
    if (normalized === 'connecting_target' || normalized === 'target_connecting') {
      return 'connecting_target';
    }
    if (normalized === 'connected' || normalized === 'ready' || normalized === 'streaming') {
      return 'active';
    }
    if (normalized === 'reconnecting') {
      return 'reconnecting';
    }
    if (normalized === 'closed' || normalized === 'terminated') {
      return this.closeReasonState(reason || '', 'closed');
    }
    if (normalized === 'expired') {
      return 'expired';
    }
    if (normalized === 'access_denied' || normalized === 'unauthorized') {
      return 'access_denied';
    }
    if (normalized === 'failed' || normalized === 'error') {
      return this.closeReasonState(reason || '', 'failed');
    }
    return this.state;
  }

  private closeReasonState(reason: string, type: string): RemoteWebViewerState {
    const normalized = String(reason || '').toLowerCase();
    if (normalized.indexOf('expired') !== -1 || normalized.indexOf('timeout') !== -1) {
      return 'expired';
    }
    if (normalized.indexOf('unauthorized') !== -1 || normalized.indexOf('denied') !== -1 || normalized.indexOf('forbidden') !== -1) {
      return 'access_denied';
    }
    if (type === 'session_failed' || normalized.indexOf('tls') !== -1 || normalized.indexOf('failed') !== -1 || normalized.indexOf('error') !== -1) {
      return 'failed';
    }
    return 'terminated';
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const padded = (value: number) => value < 10 ? '0' + value : String(value);
    return hours > 0
      ? hours + ':' + padded(minutes) + ':' + padded(secs)
      : padded(minutes) + ':' + padded(secs);
  }

  private toEpochMs(value: number | string): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    if (typeof value === 'number') {
      return value > 9999999999 ? value : value * 1000;
    }
    const parsedNumber = Number(value);
    if (!isNaN(parsedNumber)) {
      return parsedNumber > 9999999999 ? parsedNumber : parsedNumber * 1000;
    }
    const parsedDate = Date.parse(value);
    return isNaN(parsedDate) ? 0 : parsedDate;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
