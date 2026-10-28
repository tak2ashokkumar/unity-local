import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UsiVergeioVmMonitoringService } from './usi-vergeio-vm-monitoring.service';
import {
  VERGEIO_MONITORING_CONNECTION_TYPES,
  VergeIOVmMonitoringConfig,
  VergeIOVmMonitoringMetrics
} from './usi-vergeio-vm-monitoring.type';

@Component({
  selector: 'usi-vergeio-vm-monitoring',
  templateUrl: './usi-vergeio-vm-monitoring.component.html',
  styleUrls: ['./usi-vergeio-vm-monitoring.component.scss'],
  providers: [UsiVergeioVmMonitoringService]
})
export class UsiVergeioVmMonitoringComponent implements OnInit, OnDestroy {
  @Input() vmId: string;
  @Input() vmName: string;
  @Output() close = new EventEmitter<void>();
  private readonly ngUnsubscribe = new Subject<void>();

  connectionTypes = VERGEIO_MONITORING_CONNECTION_TYPES;
  loading: boolean = false;
  config: VergeIOVmMonitoringConfig;
  metrics: VergeIOVmMonitoringMetrics;
  alertCount: number = 0;

  configForm: FormGroup;
  configFormErrors: any;
  configFormValidationMessages: any;
  revalidationBound: boolean = false;

  constructor(private svc: UsiVergeioVmMonitoringService,
    private utilSvc: AppUtilityService,
    private notificationSvc: AppNotificationService) { }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadConfig() {
    this.loading = true;
    this.svc.getConfig(this.vmId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.loading = false))
      .subscribe(res => {
        this.config = res;
        this.buildConfigForm();
        if (res && res.configured) {
          this.loadMetrics();
          this.loadAlerts();
        }
      }, (err: HttpErrorResponse) => {
        this.config = null;
        this.buildConfigForm();
      });
  }

  buildConfigForm() {
    this.configForm = this.svc.buildConfigForm(this.config);
    this.configFormErrors = this.svc.resetConfigFormErrors();
    this.configFormValidationMessages = this.svc.configFormValidationMessages;
    this.revalidationBound = false;
  }

  loadMetrics() {
    this.svc.getMetrics(this.vmId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.metrics = res;
    }, () => {
      this.metrics = null;
    });
  }

  loadAlerts() {
    this.svc.getAlerts(this.vmId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertCount = Array.isArray(res) ? res.length : 0;
    }, () => {
      this.alertCount = 0;
    });
  }

  save() {
    if (this.configForm.invalid) {
      this.configFormErrors = this.utilSvc.validateForm(this.configForm, this.configFormValidationMessages, this.configFormErrors);
      this.bindRevalidationOnChanges();
      return;
    }
    const raw = this.configForm.getRawValue();
    const payload = {
      connection_type: raw.connection_type,
      ip_address: raw.ip_address,
      mtp_templates: this.svc.parseTemplates(raw.mtp_templates),
    };
    this.loading = true;
    this.svc.configure(this.vmId, payload).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.loading = false))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Monitoring configured successfully.'));
        this.loadConfig();
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to configure monitoring. Please try again.'));
      });
  }

  startMonitoring() {
    this.loading = true;
    this.svc.start(this.vmId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.loading = false))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Monitoring started.'));
        this.loadConfig();
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to start monitoring. Please try again.'));
      });
  }

  stopMonitoring() {
    this.loading = true;
    this.svc.stop(this.vmId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.loading = false))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Monitoring stopped.'));
        this.loadConfig();
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to stop monitoring. Please try again.'));
      });
  }

  deleteConfig() {
    this.loading = true;
    this.svc.deleteConfig(this.vmId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.loading = false))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Monitoring configuration removed.'));
        this.config = null;
        this.metrics = null;
        this.alertCount = 0;
        this.buildConfigForm();
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to remove monitoring configuration. Please try again.'));
      });
  }

  onClose() {
    this.close.emit();
  }

  private bindRevalidationOnChanges() {
    if (this.revalidationBound) {
      return;
    }
    this.revalidationBound = true;
    this.configForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.configFormErrors = this.utilSvc.validateForm(this.configForm, this.configFormValidationMessages, this.configFormErrors);
    });
  }
}
