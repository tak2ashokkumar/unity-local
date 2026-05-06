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
    conversation_id: string;
    collector_uuid?: string;
}

export class WSSHClient {

    private connection: WebSocket;
    private wsOptions: WSOption;

    private openEvent = new Subject<any>();
    onOpen: Observable<any> = this.openEvent.asObservable();

    private closeEvent = new Subject<any>();
    onClose: Observable<any> = this.closeEvent.asObservable();

    private errorEvent = new Subject<any>();
    onError: Observable<any> = this.errorEvent.asObservable();

    private messageEvent = new Subject<any>();
    onMessage: Observable<any> = this.messageEvent.asObservable();

    private _commandSent = false;

    constructor(options: WSOption) {
        this.wsOptions = options;
    }

    isShellReady(data: string): boolean {
        return data.includes('$') || data.includes('#');
    }

    getHostUrl(): string {
        if (environment.production) {
            return window.location.host;
        } else {
            return window.location.host.split(':')[0] + ':8080';
        }
    }

    getEndpoint(): string {
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        return `${protocol}${environment.cliNetworkAgentUrl}/${this.wsOptions.uuid}`;
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
            this.openEvent.next();
        };

        this.connection.onmessage = (evt: MessageEvent) => {
            const data = evt.data;
            this.messageEvent.next(data);
            if (!this._commandSent && this.isShellReady(data)) {
                this._commandSent = true;
                const raw = localStorage.getItem('terminal_command');
                if (raw) {

                    this.sendClientData(raw + '\n');
                    localStorage.removeItem('terminal_command');
                }
            }
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

    // sendInitData() {
    //     this.connection.send(JSON.stringify({ tp: 'init', data: this.wsOptions }));
    // }

    sendInitData() {
        this.connection.send(JSON.stringify({
            type: 'init',
            host: this.wsOptions.hostname,
            port: this.wsOptions.port,
            username: this.wsOptions.username,
            password: this.wsOptions.password,
            conversation_id: this.wsOptions.conversation_id,
            collector_uuid: this.wsOptions.collector_uuid,
        }));
    }

    sendResizeData(data: any) {
        this.connection.send(JSON.stringify({ tp: 'resize', data: data }));
    }

    // sendClientData(data: any) {
    //     this.connection.send(JSON.stringify({ tp: 'client', data: data }));
    // }

    sendClientData(data: any) {
        this.connection.send(JSON.stringify({
            type: 'input',
            data: data,
            conversation_id: this.wsOptions.conversation_id,
            collector_uuid: this.wsOptions.collector_uuid,
        }));
    }

    close() {
        this.connection.close();
    }
}