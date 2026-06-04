import { HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaderResponse, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AdvancedDiscoveryConnectivityRequestService } from './advanced-discovery-connectivity-request.service';
import {
  AdvancedDiscoveryConnectivityRequestCommand,
  AdvancedDiscoveryConnectivityRequestCreatePayload,
  AdvancedDiscoveryConnectivityRequestCreateResponse,
  AdvancedDiscoveryConnectivityRequestStep,
  AdvancedDiscoveryConnectivityRequestStepId
} from './advanced-discovery-connectivity-request.type';
import { DOWNLOAD_COLLECTOR_BUNDLE } from 'src/app/shared/api-endpoint.const';

@Component({
  selector: 'advanced-discovery-connectivity-request',
  templateUrl: './advanced-discovery-connectivity-request.component.html',
  styleUrls: ['./advanced-discovery-connectivity-request.component.scss'],
  providers: [AdvancedDiscoveryConnectivityRequestService]
})
export class AdvancedDiscoveryConnectivityRequestComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  activeStep: AdvancedDiscoveryConnectivityRequestStepId = 'collectorDetails';

  collectorForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  downloadProgress: number = 0;
  isDownloading: boolean = false;
  downloadTriggered: boolean = false;
  isDownloaded: boolean = false;

  commands: AdvancedDiscoveryConnectivityRequestCommand[] = [];
  private collectorDetails: any = '';
  private isValidationSubscriptionAdded = false;
  nonFieldErr: string = '';

  steps: AdvancedDiscoveryConnectivityRequestStep[] = [
    { id: 'collectorDetails', label: 'Collector Details', icon: 'fas fa-link' },
    { id: 'downloadFile', label: 'Download File', icon: 'fas fa-download' },
    { id: 'runCommand', label: 'Run Command', icon: 'fas fa-code' }
  ];

  constructor(
    private svc: AdvancedDiscoveryConnectivityRequestService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.collectorForm = this.svc.buildForm();
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get activeStepIndex() {
    return this.steps.findIndex(step => step.id === this.activeStep);
  }

  get formPayload(): AdvancedDiscoveryConnectivityRequestCreatePayload {
    return this.svc.getFormPayload(this.collectorForm);
  }

  getStepClass(step: AdvancedDiscoveryConnectivityRequestStep) {
    const stepIndex = this.steps.findIndex(item => item.id === step.id);
    if (step.id === this.activeStep) {
      return 'active';
    }
    if (stepIndex < this.activeStepIndex) {
      return 'success';
    }
    return 'disabled';
  }

  saveCollectorDetails() {
    this.nonFieldErr = '';
    if (!this.validateCollectorDetails()) {
      return;
    }
    this.spinner.start('main');
    this.svc.saveCollectorDetails(this.formPayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectorDetails = res;
      if (!this.collectorDetails || !this.collectorDetails.uuid) {
        this.nonFieldErr = 'Something went wrong!! Please try again.';
        this.spinner.stop('main');
        return;
      }
      this.moveToDownloadStep();
    }, (err: HttpErrorResponse) => {
      this.handleCreateCollectorError(err);
    });
  }

  private subscribeForValidation() {
    if (this.isValidationSubscriptionAdded) {
      return;
    }
    this.isValidationSubscriptionAdded = true;
    this.collectorForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.formErrors = this.utilService.validateForm(this.collectorForm, this.validationMessages, this.formErrors);
    });
  }

  private validateCollectorDetails() {
    if (this.collectorForm.valid) {
      return true;
    }
    this.formErrors = this.utilService.validateForm(this.collectorForm, this.validationMessages, this.formErrors);
    this.subscribeForValidation();
    return false;
  }

  private moveToDownloadStep() {
    this.commands = this.svc.getCommands();
    this.resetDownloadState();
    this.activeStep = 'downloadFile';
    this.spinner.stop('main');
  }

  private handleCreateCollectorError(err: HttpErrorResponse) {
    // TODO: Restore this error handling once the create API is ready for this flow.
    const errors = this.svc.applyCreateErrors(err.error, this.formErrors);
    this.formErrors = errors.formErrors;
    this.nonFieldErr = errors.nonFieldErr;
    this.subscribeForValidation();
    this.spinner.stop('main');
    // this.moveToDownloadStep();
  }

  // Download Stage Code
  private resetDownloadState() {
    this.downloadProgress = 0;
    this.downloadTriggered = false;
    this.isDownloaded = false;
    this.isDownloading = false;
  }

  saveCollectorBundle(): void {
    if (this.isDownloading) {
      return;
    }
    this.downloadTriggered = true;
    this.isDownloading = false;
    const url = DOWNLOAD_COLLECTOR_BUNDLE(this.collectorDetails.uuid);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'collector-bundle.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      this.downloadTriggered = false;
      this.isDownloading = true;
      setTimeout(() => {
        this.isDownloading = false;
        this.isDownloaded = true;
      }, 20000)
    }, 20000)
  }

  // downloadCollectorBundle() {
  //   if (this.isDownloading) {
  //     return;
  //   }
  //   this.isDownloading = true;
  //   this.downloadProgress = 0;
  //   // this.spinner.start('main');

  //   this.svc.downloadCollectorBundle(this.collectorDetails.uuid).subscribe({
  //     next: (event: any) => {
  //       console.log('event : ', event);
  //       if (event.type === HttpEventType.DownloadProgress) {
  //         console.log('event.total : ', event.total);
  //         if (event.total) {
  //           this.downloadProgress = Math.round((event.loaded / event.total) * 100);
  //         }
  //       }

  //       if (event.type === HttpEventType.Response) {
  //         console.log('event.type === HttpEventType.Response')
  //         this.isDownloaded = true;
  //         this.isDownloading = false;
  //         this.downloadProgress = 100;

  //         const blob = new Blob([event.body], { type: 'application/zip' });

  //         const a = document.createElement('a');
  //         const objectUrl = window.URL.createObjectURL(blob);

  //         a.href = objectUrl;
  //         a.download = "collector-bundle.zip";
  //         a.click();
  //         window.URL.revokeObjectURL(objectUrl);
  //       }
  //     },
  //     error: (err) => {
  //       this.isDownloading = false;
  //       console.error("Download failed", err);
  //     }
  //   });
  // }

  // downloadCollectorBundle(): void {
  //   if (this.isDownloading) {
  //     return;
  //   }

  //   this.isDownloading = true;
  //   this.isDownloaded = false;
  //   this.downloadProgress = 0;

  //   let totalSize = 0;
  //   let fileName = 'collector-bundle.zip';

  //   this.svc.downloadCollectorBundle(this.collectorDetails.uuid).subscribe({
  //     next: (event: HttpEvent<Blob>) => {
  //       console.log('event : ', event);
  //       if (event.type === HttpEventType.ResponseHeader) {
  //         console.log('in ResponseHeader event')
  //         const headerEvent = event as HttpHeaderResponse;

  //         const xFileSize = headerEvent.headers.get('X-File-Size');
  //         if (xFileSize) {
  //           totalSize = Number(xFileSize);
  //         }

  //         const contentDisposition = headerEvent.headers.get('Content-Disposition');
  //         const extractedFileName = this.getFileNameFromContentDisposition(contentDisposition);

  //         if (extractedFileName) {
  //           fileName = extractedFileName;
  //         }
  //       }

  //       if (event.type === HttpEventType.DownloadProgress) {
  //         // console.log('in DownloadProgress event with event.loaded : ', event.loaded)
  //         // console.log('in DownloadProgress event with event.total : ', event.total)
  //         // console.log('in DownloadProgress event with totalSize : ', totalSize)


  //         const effectiveTotal = event.total || totalSize;

  //         if (effectiveTotal > 0) {
  //           this.downloadProgress = Math.round((event.loaded / effectiveTotal) * 100);
  //         } else {
  //           // Unknown total size. Show indeterminate progress in UI.
  //           this.downloadProgress = 0;
  //         }
  //       }

  //       if (event.type === HttpEventType.Response) {
  //         console.log('in Response event')
  //         const response = event as HttpResponse<Blob>;

  //         this.isDownloaded = true;
  //         this.isDownloading = false;
  //         this.downloadProgress = 100;

  //         const blob = response.body;

  //         if (!blob) {
  //           console.error('Download completed but response body is empty.');
  //           return;
  //         }

  //         const objectUrl = window.URL.createObjectURL(blob);
  //         const a = document.createElement('a');

  //         a.href = objectUrl;
  //         a.download = fileName;
  //         document.body.appendChild(a);
  //         a.click();

  //         document.body.removeChild(a);
  //         window.URL.revokeObjectURL(objectUrl);
  //       }
  //     },

  //     error: (err) => {
  //       this.isDownloading = false;
  //       this.downloadProgress = 0;
  //       console.error('Download failed', err);
  //     }
  //   });
  // }

  // private getFileNameFromContentDisposition(contentDisposition: string | null): string | null {
  //   if (!contentDisposition) {
  //     return null;
  //   }

  //   const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

  //   return fileNameMatch && fileNameMatch[1]
  //     ? fileNameMatch[1]
  //     : null;
  // }

  async downloadCollectorBundle(): Promise<void> {
    if (this.isDownloading) {
      return;
    }

    const url = DOWNLOAD_COLLECTOR_BUNDLE(this.collectorDetails.uuid);
    const fileName = 'collector-bundle.zip';

    this.isDownloading = true;
    this.isDownloaded = false;
    this.downloadProgress = 0;

    try {
      if (this.canUseStreamDownloadToDisk()) {
        await this.downloadWithProgressToDisk(url, fileName);

        this.downloadProgress = 100;
        this.isDownloaded = true;
        this.isDownloading = false;

        return;
      }

      // Fallback for Firefox / Safari / unsupported browsers
      this.startNativeBrowserDownload(url, fileName);

      // Important:
      // This means download was triggered, not completed.
      this.isDownloaded = true;
      this.isDownloading = false;
    } catch (error: any) {
      this.isDownloading = false;
      this.isDownloaded = false;
      this.downloadProgress = 0;

      if (error && error.name === 'AbortError') {
        console.warn('Download cancelled by user.');
        return;
      }

      console.error('Download failed:', error);
    }
  }

  private canUseStreamDownloadToDisk(): boolean {
    const win = window as any;

    return (
      typeof win.showSaveFilePicker === 'function' &&
      typeof fetch === 'function' &&
      typeof ReadableStream !== 'undefined'
    );
  }

  private async downloadWithProgressToDisk(url: string, defaultFileName: string): Promise<void> {
    const win = window as any;

    const fileHandle = await win.showSaveFilePicker({
      suggestedName: defaultFileName,
      types: [
        {
          description: 'ZIP Archive',
          accept: {
            'application/zip': ['.zip']
          }
        }
      ]
    });

    const writable = await fileHandle.createWritable();

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      await this.safeAbortWritable(writable);
      throw error;
    }

    if (!response.ok) {
      await this.safeAbortWritable(writable);
      throw new Error('Download failed with status ' + response.status);
    }

    if (!response.body) {
      await this.safeAbortWritable(writable);
      throw new Error('Readable stream is not available in this browser.');
    }

    const totalSize = this.getDownloadSizeFromResponse(response);
    const reader = response.body.getReader();

    let downloadedSize = 0;

    try {
      while (true) {
        const result = await reader.read();

        if (result.done) {
          break;
        }

        const chunk = result.value;

        if (!chunk) {
          continue;
        }

        downloadedSize += chunk.length;

        await writable.write(chunk);

        if (totalSize > 0) {
          this.downloadProgress = Math.min(
            99,
            Math.round((downloadedSize / totalSize) * 100)
          );
        }
      }

      await writable.close();
    } catch (error) {
      await this.safeAbortWritable(writable);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  private getDownloadSizeFromResponse(response: Response): number {
    const contentLength = response.headers.get('Content-Length');
    const xFileSize = response.headers.get('X-File-Size');

    const size = Number(contentLength || xFileSize || 0);

    return isNaN(size) ? 0 : size;
  }

  private async safeAbortWritable(writable: any): Promise<void> {
    try {
      if (writable && typeof writable.abort === 'function') {
        await writable.abort();
      }
    } catch (error) {
      console.warn('Failed to abort writable stream:', error);
    }
  }

  private startNativeBrowserDownload(url: string, fileName: string): void {
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  goToRunCommand() {
    this.commands = this.svc.getCommands();
    this.activeStep = 'runCommand';
  }

  submit() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  copyCommand(command: string) {
    navigator.clipboard.writeText(command).then(() => {
      this.notification.success(new Notification('Command copied to clipboard.'));
    }, () => {
      this.notification.error(new Notification('Failed to copy command. Please try again.'));
    });
  }

  goBack() {
    if (this.activeStep === 'collectorDetails') {
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }
    this.activeStep = this.activeStep === 'runCommand' ? 'downloadFile' : 'collectorDetails';
  }
}
