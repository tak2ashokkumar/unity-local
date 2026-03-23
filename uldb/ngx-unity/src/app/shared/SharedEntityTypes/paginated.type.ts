export class PaginatedResult<T> {
    count?: number;
    next?: string;
    previous?: string;
    last_sync?: string;
    sync?: boolean;
    sync_url?: string;
    results: Array<T> = [];
}

export class SyncResult {
    sync: boolean;
    lastSync: string;
    url: string;
    inProgress?: boolean = false;
}