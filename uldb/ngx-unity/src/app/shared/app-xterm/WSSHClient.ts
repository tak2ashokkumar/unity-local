import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

declare var MozWebSocket: {
    prototype: WebSocket;
    new(url: string, protocols?: string | string[]): WebSocket;
    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;
};

export interface WSOption {
    hostname: string;
    port: number;
    username: string;
    password: string;
    uuid: string;
    org_id: string;
    agent_id: string;
    rows?: number;
    cols?: number;
}

export class WSSHClient {

    private connection: WebSocket;
    private wsOptions: WSOption;
    private keepaliveInterval: any;
    private lastActivityAt = Date.now();
    private static readonly MAX_IDLE_MS = 15 * 60 * 1000;

    private openEvent = new Subject<any>();
    onOpen: Observable<any> = this.openEvent.asObservable();

    private closeEvent = new Subject<any>();
    onClose: Observable<any> = this.closeEvent.asObservable();

    private errorEvent = new Subject<any>();
    onError: Observable<any> = this.errorEvent.asObservable();

    private messageEvent = new Subject<any>();
    onMessage: Observable<any> = this.messageEvent.asObservable();

    private statsEvent = new Subject<any>();
    onStats: Observable<any> = this.statsEvent.asObservable();

    constructor(options: WSOption) {
        this.wsOptions = options;
    }

    getHostUrl(): string {
        if (environment.production) {
            return window.location.host;
        } else {
            return window.location.host.split(':')[0] + ':8080';
        }
    }

    getEndpoint(): string {
        if (window.location.protocol == 'https:') {
            var protocol = 'wss://';
        } else {
            var protocol = 'ws://';
        }
        environment
        return protocol + this.getHostUrl() + "/vmterminal/" + this.wsOptions.uuid + '/';
    }

    connect() {
        let endpoint: string = this.getEndpoint();
        if ('WebSocket' in window) {
            this.connection = new WebSocket(endpoint);
        } else if ('MozWebSocket' in window) {
            this.connection = new MozWebSocket(endpoint);
        }
        else {
            this.errorEvent.next('WebSocket Not Supported');
            return;
        }
        this.connection.onopen = (evt: Event) => {
            this.lastActivityAt = Date.now();
            this.keepaliveInterval = setInterval(() => {
                if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
                    return;
                }
                if (Date.now() - this.lastActivityAt >= WSSHClient.MAX_IDLE_MS) {
                    this.close();
                    return;
                }
                this.connection.send(JSON.stringify({ tp: 'ping' }));
            }, 30000);
            this.openEvent.next();
        };

        this.connection.onmessage = (evt: MessageEvent) => {
            try {
                const msg = JSON.parse(evt.data);
                if (msg.tp === 'pong') return;
                if (msg.tp === 'stats') {
                    this.statsEvent.next(msg);
                    return;
                }
            } catch (_) {}
            this.messageEvent.next(evt.data);
        };

        this.connection.onclose = (evt: CloseEvent) => {
            this.closeEvent.next(evt.reason);
        };

        this.connection.onerror = (evt: Event) => {
            this.errorEvent.next();
        }
    }

    isConnectionClosed(): boolean {
        return this.connection.readyState == this.connection.CLOSED;
    }

    isConnecting(): boolean {
        return this.connection.readyState == this.connection.CONNECTING;
    }

    send(data: any) {
        this.connection.send(JSON.stringify(data));
    }

    sendInitData() {
        this.connection.send(JSON.stringify({ tp: 'init', data: this.wsOptions }));
    }

    sendResizeData(data: any) {
        this.connection.send(JSON.stringify({ tp: 'resize', data: data }));
    }

    requestStats() {
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify({ tp: 'stats' }));
        }
    }

    sendClientData(data: any) {
        this.lastActivityAt = Date.now();
        this.connection.send(JSON.stringify({ tp: 'client', data: data }));
    }

    close() {
        if (this.keepaliveInterval) {
            clearInterval(this.keepaliveInterval);
            this.keepaliveInterval = null;
        }
        this.connection.close();
    }
}