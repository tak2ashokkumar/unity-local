import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClusterDetailsViewData, ClusterSummaryViewData, StorageOntapSummaryService } from './storage-ontap-summary.service';
import { UnityChartData } from 'src/app/shared/chart-config.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { StorageOntapCluster } from '../storage-ontap.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'storage-ontap-summary',
  templateUrl: './storage-ontap-summary.component.html',
  styleUrls: ['./storage-ontap-summary.component.scss'],
  providers: [StorageOntapSummaryService]
})
export class StorageOntapSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;

  cluster: StorageOntapCluster = null;
  view: ClusterDetailsViewData = new ClusterDetailsViewData();

  @ViewChild('customAttributes') element: ElementRef;
  modalRef: BsModalRef;
  deviceType: DeviceMapping = DeviceMapping.ONTAP_STORAGE_CLUSTER;

  constructor(private svc: StorageOntapSummaryService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,
    private modalService: BsModalService,
    private caSvc: UnityDevicesCustomAttributesCrudService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    setTimeout(() => {
      this.getClusterDetails();
      // this.getEventChartData();
      this.getTopUsedAggragates();
      this.getTopUsedVolumes();
      this.getTopUsedLUNs();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getClusterDetails();
    // this.getEventChartData();
    this.getTopUsedAggragates();
    this.getTopUsedVolumes();
    this.getTopUsedLUNs();
  }

  getClusterDetails() {
    this.spinner.start('cluster_details');
    this.spinner.start('cluster_storage_details');
    this.svc.getClusterDetails(this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = this.svc.convertToClusterDetailsViewData(res);
      this.cluster = res;
      this.spinner.stop('cluster_details');
      this.spinner.stop('cluster_storage_details');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('cluster_details');
      this.spinner.stop('cluster_storage_details');
      this.notification.error(new Notification('Failed to fetch cluster details'));
    })
  }

  eventChartData: UnityChartData;
  getEventChartData() {
    this.eventChartData = this.svc.convertToEventsChartData();
  }

  aggregateChartData: UnityChartData;
  getTopUsedAggragates() {
    this.spinner.start('top_aggregates');
    this.svc.getTopUsedAggragates(this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.aggregateChartData = this.svc.convertToAggragateChartData(res);
      }
      this.spinner.stop('top_aggregates');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('top_aggregates');
    })
  }

  volumeChartData: UnityChartData;
  getTopUsedVolumes() {
    this.spinner.start('top_volumes');
    this.svc.getTopUsedVolumes(this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.volumeChartData = this.svc.convertToVolumesChartData(res);
      }
      this.spinner.stop('top_volumes');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('top_volumes');
    })
  }

  lunChartData: UnityChartData;
  getTopUsedLUNs() {
    this.spinner.start('top_luns');
    this.svc.getTopUsedLUNs(this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.lunChartData = this.svc.convertToLUNsChartData(res);
      }
      this.spinner.stop('top_luns');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('top_luns');
    })
  }

  onCustomAttributesEdit() {
    const length = Object.keys(this.cluster?.custom_attribute_data || {}).length;
    let modalClass = '';

    if (length > 3) {
      modalClass = 'modal-lg';
    }

    this.modalRef = this.modalService.show(this.element, Object.assign({}, { class: modalClass, keyboard: true, ignoreBackdropClick: true }));
  }

  submitCustomAttributesForm() {
    this.caSvc.submit();
    const data = Object.assign({}, { 'custom_attribute_data': this.caSvc.getFormData() });
    if (!this.caSvc.isInvalid()) {
      this.svc.submitCustomAttributesForm(this.clusterId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getClusterDetails();
        this.modalRef.hide();
        this.notification.success(new Notification('Custom Attributes updated successfully.'));
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to update Custom Attributes.'));
      })
    }
  }

  getClusterDetailsWidthClass(): string {
  return (this.view?.subsystems?.length || this.cluster?.custom_attribute_data) ? 'w-45' : 'w-100';
}

  goTo(path: string) {
    this.router.navigate([path], { relativeTo: this.route.parent })
  }
}
