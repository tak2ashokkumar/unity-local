export interface RemoteFileSession {
  session_id: string;
  device_type: string;
  device_id: string;
  device_name: string;
  collector_name: string;
  driver: 'ztc' | 'classic';
  protocol: string;
  host: string;
  root: string;
  status: string;
  expires_in: number;
  chunk_size: number;
  max_file_bytes: number;
  viewer_url?: string;
}

export interface RemoteFileEntry {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'link';
  size: number;
  modified: number;
  permissions: string;
}

export interface RemoteFileListing {
  path: string;
  entries: RemoteFileEntry[];
}

export interface RemoteFileTransfer {
  transfer_id: string;
  session_id: string;
  direction: 'upload' | 'download';
  entry_type: 'file' | 'folder';
  remote_path: string;
  size_bytes: number;
  committed_offset: number;
  status: string;
  chunk_size: number;
  upload_url?: string;
  download_url?: string;
  error_message?: string;
  path?: string;
  files?: RemoteFileTransfer[];
}

export interface RemoteFileCredentials {
  username: string;
  password?: string;
  private_key?: string;
  port?: number;
}

/** One row in the transfers panel. */
export class TransferJob {
  id: string;
  name: string;
  direction: 'upload' | 'download';
  totalBytes = 0;
  doneBytes = 0;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' = 'queued';
  error = '';
  cancelRequested = false;

  constructor(name: string, direction: 'upload' | 'download', totalBytes: number) {
    this.name = name;
    this.direction = direction;
    this.totalBytes = totalBytes;
  }

  get percent(): number {
    return this.totalBytes ? Math.min(100, Math.floor(this.doneBytes * 100 / this.totalBytes)) : (this.status == 'completed' ? 100 : 0);
  }
}
