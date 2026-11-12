import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RemoteFileCredentials, RemoteFileListing, RemoteFileSession, RemoteFileTransfer } from './remote-file.type';

const BASE = '/api/v1/remote-files';

/** resource_type values the backend accepts (remote_files/resources.py). */
export enum RemoteFileResourceType {
  VMWARE_VM = 'vmware_vm',
  NUTANIX_VM = 'nutanix_vm',
  PROXMOX_VM = 'proxmox_vm',
  G3_KVM_VM = 'g3_kvm_vm',
  BM_SERVER = 'bm_server',
  HYPERV_VM = 'hyperv_vm',
  OPENSTACK_VM = 'openstack_vm',
  VCLOUD_VM = 'vcloud_vm',
  CUSTOM_VM = 'custom_vm',
}

export const REMOTE_FILE_MANAGER_URL = (resourceType: RemoteFileResourceType, resourceId: string) =>
  `${window.location.origin}/main#/remote-files/${resourceType}/${resourceId}`;

@Injectable({
  providedIn: 'root'
})
export class RemoteFileService {

  constructor(private http: HttpClient) { }

  /** Opens the File Manager for a device in a new tab; the tab creates the session itself. */
  openFileManager(resourceType: RemoteFileResourceType, resourceId: string) {
    const tab = window.open(REMOTE_FILE_MANAGER_URL(resourceType, resourceId), '_blank');
    if (tab) {
      tab.opener = null;
    }
    return tab;
  }

  createSession(resourceType: string, resourceId: string, credentials?: RemoteFileCredentials): Observable<RemoteFileSession> {
    return this.http.post<RemoteFileSession>(`${BASE}/sessions/`, Object.assign({ resource_type: resourceType, resource_id: resourceId }, credentials || {}));
  }

  closeSession(sessionId: string): Observable<any> {
    return this.http.delete(`${BASE}/sessions/${sessionId}/`);
  }

  /** Best-effort close when the tab is closing; HttpClient requests are cancelled on unload. */
  closeSessionOnUnload(sessionId: string) {
    const token = (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || '';
    try {
      fetch(`${BASE}/sessions/${sessionId}/`, { method: 'DELETE', keepalive: true, credentials: 'same-origin', headers: { 'X-CSRFToken': token } });
    } catch (e) { }
  }

  list(sessionId: string, path?: string): Observable<RemoteFileListing> {
    const params: any = path ? { path } : {};
    return this.http.get<RemoteFileListing>(`${BASE}/sessions/${sessionId}/entries/`, { params });
  }

  mkdir(sessionId: string, path: string): Observable<any> {
    return this.http.post(`${BASE}/sessions/${sessionId}/directories/`, { path });
  }

  rename(sessionId: string, path: string, newPath: string): Observable<any> {
    return this.http.patch(`${BASE}/sessions/${sessionId}/entries/`, { path, new_path: newPath });
  }

  remove(sessionId: string, path: string, recursive: boolean): Observable<any> {
    return this.http.request('delete', `${BASE}/sessions/${sessionId}/entries/`, { body: { path, recursive } });
  }

  createUpload(sessionId: string, path: string, size: number, overwrite: boolean): Observable<RemoteFileTransfer> {
    return this.http.post<RemoteFileTransfer>(`${BASE}/transfers/`, { session_id: sessionId, direction: 'upload', entry_type: 'file', path, size_bytes: size, overwrite });
  }

  createFolderUpload(sessionId: string, path: string, manifest: { directories: string[], files: { path: string, size: number }[] }, overwrite: boolean): Observable<RemoteFileTransfer> {
    return this.http.post<RemoteFileTransfer>(`${BASE}/transfers/`, { session_id: sessionId, direction: 'upload', entry_type: 'folder', path, manifest, overwrite });
  }

  createDownload(sessionId: string, path: string, entryType: 'file' | 'folder'): Observable<RemoteFileTransfer> {
    return this.http.post<RemoteFileTransfer>(`${BASE}/transfers/`, { session_id: sessionId, direction: 'download', entry_type: entryType, path });
  }

  uploadChunk(transfer: RemoteFileTransfer, offset: number, chunk: Blob): Observable<{ committed_offset: number }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/octet-stream', 'Upload-Offset': String(offset) });
    return this.http.put<{ committed_offset: number }>(transfer.upload_url, chunk, { headers });
  }

  completeTransfer(transferId: string): Observable<RemoteFileTransfer> {
    return this.http.post<RemoteFileTransfer>(`${BASE}/transfers/${transferId}/complete/`, {});
  }

  cancelTransfer(transferId: string): Observable<RemoteFileTransfer> {
    return this.http.post<RemoteFileTransfer>(`${BASE}/transfers/${transferId}/cancel/`, {});
  }

  errorMessage(err: any, fallback: string): string {
    return err?.error?.detail || err?.error?.error || err?.message || fallback;
  }
}
