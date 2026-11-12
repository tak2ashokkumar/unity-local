import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RemoteFileService } from './remote-file.service';
import { RemoteFileCredentials, RemoteFileEntry, RemoteFileSession, RemoteFileTransfer, TransferJob } from './remote-file.type';

type PageState = 'connecting' | 'credentials' | 'ready' | 'closed' | 'failed';
type PromptKind = 'mkdir' | 'rename' | 'delete' | 'overwrite';

const MAX_PARALLEL_UPLOADS = 2;

@Component({
  selector: 'remote-file-manager',
  templateUrl: './remote-file-manager.component.html',
  styleUrls: ['./remote-file-manager.component.scss']
})
export class RemoteFileManagerComponent implements OnInit, OnDestroy {
  @ViewChild('promptModal') promptModal: TemplateRef<any>;

  private ngUnsubscribe = new Subject();
  private resourceType: string;
  private resourceId: string;

  state: PageState = 'connecting';
  errorMessage = '';
  session: RemoteFileSession;
  credentials: RemoteFileCredentials = { username: '', password: '', private_key: '', port: 22 };
  useKey = false;
  connecting = false;

  path = '/';
  pathInput = '/';
  entries: RemoteFileEntry[] = [];
  loading = false;
  dragOver = false;

  jobs: TransferJob[] = [];
  private uploadQueue: (() => Promise<void>)[] = [];
  private runningUploads = 0;

  modalRef: BsModalRef;
  prompt: { kind: PromptKind, title: string, message?: string, value?: string, entry?: RemoteFileEntry, resolve?: (ok: boolean) => void } = null;

  constructor(private route: ActivatedRoute,
    private fileService: RemoteFileService,
    private modalService: BsModalService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.resourceType = params.get('resourceType');
      this.resourceId = params.get('resourceId');
      this.connect();
    });
  }

  ngOnDestroy(): void {
    this.closeSession();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('window:beforeunload')
  onUnload() {
    if (this.session && this.state == 'ready') {
      this.fileService.closeSessionOnUnload(this.session.session_id);
      this.state = 'closed';
    }
  }

  // ---------------------------------------------------------------- session

  connect(credentials?: RemoteFileCredentials) {
    this.connecting = true;
    this.errorMessage = '';
    this.fileService.createSession(this.resourceType, this.resourceId, credentials).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(session => {
        this.connecting = false;
        this.session = session;
        this.state = 'ready';
        document.title = `File Manager - ${session.device_name}`;
        this.open(session.root || '/');
      }, err => {
        this.connecting = false;
        if (err?.status == 409 && err?.error?.code == 'credentials_required') {
          this.state = 'credentials';
          this.errorMessage = credentials ? this.fileService.errorMessage(err, 'Login failed.') : '';
          return;
        }
        this.state = 'failed';
        this.errorMessage = this.fileService.errorMessage(err, 'Unable to open the file manager.');
      });
  }

  submitCredentials() {
    const creds: RemoteFileCredentials = { username: this.credentials.username, port: this.credentials.port || 22 };
    if (this.useKey) {
      creds.private_key = this.credentials.private_key;
    } else {
      creds.password = this.credentials.password;
    }
    this.connect(creds);
    this.credentials.password = '';
  }

  closeSession() {
    if (this.session && this.state == 'ready') {
      this.state = 'closed';
      this.fileService.closeSession(this.session.session_id).subscribe(() => { }, () => { });
    }
  }

  // ---------------------------------------------------------------- browsing

  open(path: string) {
    this.loading = true;
    this.fileService.list(this.session.session_id, path).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.loading = false;
        this.path = res.path;
        this.pathInput = res.path;
        this.entries = res.entries;
      }, err => {
        this.loading = false;
        this.pathInput = this.path;
        this.handleError(err, 'Unable to list the folder.');
      });
  }

  refresh() {
    this.open(this.path);
  }

  goUp() {
    if (this.path != '/') {
      this.open(this.path.replace(/\/[^\/]+\/?$/, '') || '/');
    }
  }

  get breadcrumbs(): { name: string, path: string }[] {
    const crumbs = [{ name: '/', path: '/' }];
    let current = '';
    this.path.split('/').filter(p => p).forEach(part => {
      current += '/' + part;
      crumbs.push({ name: part, path: current });
    });
    return crumbs;
  }

  onRowOpen(entry: RemoteFileEntry) {
    if (entry.type == 'dir') {
      this.open(entry.path);
    }
  }

  childPath(name: string): string {
    return (this.path == '/' ? '' : this.path) + '/' + name;
  }

  // ---------------------------------------------------------------- dialogs

  private ask(prompt: RemoteFileManagerComponent['prompt']): Promise<boolean> {
    return new Promise(resolve => {
      this.prompt = Object.assign(prompt, { resolve });
      this.modalRef = this.modalService.show(this.promptModal, { class: 'modal-dialog-centered', keyboard: true, ignoreBackdropClick: true });
    });
  }

  closePrompt(ok: boolean) {
    this.modalRef?.hide();
    const prompt = this.prompt;
    this.prompt = null;
    prompt?.resolve(ok && (prompt.kind == 'delete' || prompt.kind == 'overwrite' || !!(prompt.value || '').trim()));
  }

  async newFolder() {
    const prompt = { kind: 'mkdir' as PromptKind, title: 'New Folder', value: '' };
    if (!await this.ask(prompt)) {
      return;
    }
    this.fileService.mkdir(this.session.session_id, this.childPath(prompt.value.trim()))
      .subscribe(() => this.refresh(), err => this.handleError(err, 'Unable to create the folder.'));
  }

  async rename(entry: RemoteFileEntry) {
    const prompt = { kind: 'rename' as PromptKind, title: 'Rename', value: entry.name, entry };
    if (!await this.ask(prompt) || prompt.value.trim() == entry.name) {
      return;
    }
    this.fileService.rename(this.session.session_id, entry.path, this.childPath(prompt.value.trim()))
      .subscribe(() => this.refresh(), err => this.handleError(err, 'Unable to rename.'));
  }

  async remove(entry: RemoteFileEntry) {
    const message = entry.type == 'dir' ? `Delete folder "${entry.name}" and everything inside it?` : `Delete "${entry.name}"?`;
    if (!await this.ask({ kind: 'delete', title: 'Delete', message, entry })) {
      return;
    }
    this.fileService.remove(this.session.session_id, entry.path, entry.type == 'dir')
      .subscribe(() => this.refresh(), err => this.handleError(err, 'Unable to delete.'));
  }

  // ---------------------------------------------------------------- downloads

  download(entry: RemoteFileEntry) {
    const entryType = entry.type == 'dir' ? 'folder' : 'file';
    const job = new TransferJob(entry.name + (entryType == 'folder' ? '.zip' : ''), 'download', 0);
    this.jobs.unshift(job);
    this.fileService.createDownload(this.session.session_id, entry.path, entryType).subscribe(transfer => {
      job.id = transfer.transfer_id;
      job.status = 'completed';
      // The browser streams the file to disk itself; nothing is buffered in the page.
      const link = document.createElement('a');
      link.href = transfer.download_url;
      link.download = job.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, err => {
      job.status = 'failed';
      job.error = this.fileService.errorMessage(err, 'Download failed.');
    });
  }

  // ---------------------------------------------------------------- uploads

  onFilesSelected(input: HTMLInputElement) {
    const files = Array.from(input.files || []);
    input.value = '';
    this.uploadFiles(files);
  }

  onFolderSelected(input: HTMLInputElement) {
    const files = Array.from(input.files || []);
    input.value = '';
    if (files.length) {
      this.uploadFolder(files);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    if (this.state == 'ready') {
      event.preventDefault();
      this.dragOver = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    this.dragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    if (this.state != 'ready' || !event.dataTransfer) {
      return;
    }
    // Only plain files are taken from a drop; folders go through "Upload Folder", which keeps their structure.
    const items = Array.from(event.dataTransfer.items || []);
    const files = items.length
      ? items.filter(item => item.kind == 'file' && (item as any).webkitGetAsEntry?.()?.isFile !== false).map(item => item.getAsFile()).filter(f => !!f)
      : Array.from(event.dataTransfer.files || []);
    if (files.length < (items.length || files.length)) {
      this.errorMessage = 'Folders cannot be dropped. Use "Upload Folder" to upload a folder.';
    }
    this.uploadFiles(files);
  }

  private async confirmOverwrite(names: string[]): Promise<boolean> {
    const existing = names.filter(n => this.entries.some(e => e.name == n));
    if (!existing.length) {
      return false;
    }
    const ok = await this.ask({ kind: 'overwrite', title: 'Replace existing?', message: `${existing.join(', ')} already exist${existing.length == 1 ? 's' : ''} in this folder. Replace?` });
    if (!ok) {
      throw new Error('cancelled');
    }
    return true;
  }

  async uploadFiles(files: File[]) {
    if (!files.length) {
      return;
    }
    let overwrite: boolean;
    try {
      overwrite = await this.confirmOverwrite(files.map(f => f.name));
    } catch (e) {
      return;
    }
    const folder = this.path;
    files.forEach(file => {
      const job = new TransferJob(file.name, 'upload', file.size);
      this.jobs.unshift(job);
      this.enqueue(async () => {
        if (job.cancelRequested) {
          return;
        }
        try {
          const transfer = await this.fileService.createUpload(this.session.session_id,
            (folder == '/' ? '' : folder) + '/' + file.name, file.size, overwrite).toPromise();
          job.id = transfer.transfer_id;
          job.status = 'running';
          const sent = await this.sendFile(transfer, file, bytes => job.doneBytes = bytes, () => job.cancelRequested);
          if (sent) {
            await this.fileService.completeTransfer(transfer.transfer_id).toPromise();
            job.status = 'completed';
          } else {
            job.status = 'cancelled';
          }
        } catch (err) {
          this.failJob(job, err);
        }
        if (folder == this.path) {
          this.refresh();
        }
      });
    });
  }

  async uploadFolder(files: File[]) {
    const top = (files[0] as any).webkitRelativePath.split('/')[0];
    let overwrite: boolean;
    try {
      overwrite = await this.confirmOverwrite([top]);
    } catch (e) {
      return;
    }
    const byPath: { [path: string]: File } = {};
    const directories = new Set<string>();
    files.forEach(file => {
      const relative = (file as any).webkitRelativePath.split('/').slice(1).join('/');
      byPath[relative] = file;
      const parts = relative.split('/');
      for (let i = 1; i < parts.length; i++) {
        directories.add(parts.slice(0, i).join('/'));
      }
    });
    const total = files.reduce((sum, f) => sum + f.size, 0);
    const job = new TransferJob(top + '/', 'upload', total);
    this.jobs.unshift(job);
    const manifest = {
      directories: Array.from(directories),
      files: Object.keys(byPath).map(path => ({ path, size: byPath[path].size }))
    };
    let folder: RemoteFileTransfer;
    try {
      folder = await this.fileService.createFolderUpload(this.session.session_id, this.childPath(top), manifest, overwrite).toPromise();
    } catch (err) {
      this.failJob(job, err);
      return;
    }
    job.id = folder.transfer_id;
    job.status = 'running';
    let remaining = folder.files.length;
    const sent: { [id: string]: number } = {};
    const finishFolder = async () => {
      try {
        const result = await this.fileService.completeTransfer(folder.transfer_id).toPromise();
        job.status = result.status == 'completed' ? 'completed' : 'failed';
        job.error = result.error_message || '';
      } catch (err) {
        this.failJob(job, err);
      }
      this.refresh();
    };
    if (!remaining) {
      return finishFolder();
    }
    // Each file of the folder reports its bytes into the one folder row.
    const progress = (id: string) => (bytes: number) => {
      sent[id] = bytes;
      job.doneBytes = Object.keys(sent).reduce((s, k) => s + sent[k], 0);
    };
    folder.files.forEach(child => {
      this.enqueue(async () => {
        try {
          if (!job.cancelRequested &&
            await this.sendFile(child, byPath[child.path], progress(child.transfer_id), () => job.cancelRequested)) {
            await this.fileService.completeTransfer(child.transfer_id).toPromise();
          }
        } catch (err) {
          job.error = this.fileService.errorMessage(err, 'Upload failed.');
        }
        if (--remaining == 0) {
          if (job.cancelRequested) {
            // Marks the folder and any files that never started as cancelled on the server.
            await this.fileService.cancelTransfer(folder.transfer_id).toPromise().catch(() => null);
            job.status = 'cancelled';
            this.refresh();
          } else {
            await finishFolder();
          }
        }
      });
    });
  }

  /**
   * Sends file in chunk_size pieces; the server acks each one after the target has written it.
   * Always sends at least one (possibly empty) chunk so empty files are created too.
   * Resolves false if cancelled.
   */
  private async sendFile(transfer: RemoteFileTransfer, file: File, onProgress: (bytes: number) => void, cancelled: () => boolean): Promise<boolean> {
    const chunkSize = transfer.chunk_size || this.session.chunk_size;
    let offset = transfer.committed_offset || 0;
    do {
      if (cancelled()) {
        await this.fileService.cancelTransfer(transfer.transfer_id).toPromise().catch(() => null);
        return false;
      }
      const res = await this.fileService.uploadChunk(transfer, offset, file.slice(offset, offset + chunkSize)).toPromise();
      offset = res.committed_offset;
      onProgress(offset);
    } while (offset < file.size);
    return true;
  }

  private enqueue(task: () => Promise<void>) {
    this.uploadQueue.push(task);
    this.pump();
  }

  private pump() {
    while (this.runningUploads < MAX_PARALLEL_UPLOADS && this.uploadQueue.length) {
      const task = this.uploadQueue.shift();
      this.runningUploads++;
      task().then(() => {
        this.runningUploads--;
        this.pump();
      });
    }
  }

  cancel(job: TransferJob) {
    job.cancelRequested = true;
    if (job.status == 'queued') {
      job.status = 'cancelled';
    }
  }

  clearFinished() {
    this.jobs = this.jobs.filter(j => j.status == 'queued' || j.status == 'running');
  }

  private failJob(job: TransferJob, err: any) {
    job.status = 'failed';
    job.error = this.fileService.errorMessage(err, 'Transfer failed.');
  }

  private handleError(err: any, fallback: string) {
    if (err?.status == 410) {
      this.state = 'closed';
      this.errorMessage = this.fileService.errorMessage(err, 'Session ended.');
      return;
    }
    this.errorMessage = this.fileService.errorMessage(err, fallback);
  }

  // ---------------------------------------------------------------- display

  formatSize(bytes: number): string {
    if (bytes == null) {
      return '';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return (i == 0 ? value : value.toFixed(1)) + ' ' + units[i];
  }

  icon(entry: RemoteFileEntry): string {
    if (entry.type == 'dir') {
      return 'fa-folder text-warning';
    }
    if (entry.type == 'link') {
      return 'fa-link text-muted';
    }
    return 'fa-file text-secondary';
  }
}
