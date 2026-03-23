import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageOntapClusterNodeDetailsViewData, StorageOntapNodeDetailsService } from './storage-ontap-node-details.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { UnityChartData } from 'src/app/shared/chart-config.service';
import { StorageOntapClusterNodeDetails } from '../storage-ontap.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/shared/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'storage-ontap-node-details',
  templateUrl: './storage-ontap-node-details.component.html',
  styleUrls: ['./storage-ontap-node-details.component.scss'],
  providers: [StorageOntapNodeDetailsService]
})
export class StorageOntapNodeDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  nodeId: string;

  node: StorageOntapClusterNodeDetails = null;

  @ViewChild('customAttributes') element: ElementRef;
  modalRef: BsModalRef;
  deviceType: DeviceMapping = DeviceMapping.ONTAP_STORAGE_NODE;

  view: StorageOntapClusterNodeDetailsViewData = new StorageOntapClusterNodeDetailsViewData();
  cpuChartData: UnityChartData;
  aggregateChartData: UnityChartData;
  volumeChartData: UnityChartData;
  lunChartData: UnityChartData;
  constructor(private svc: StorageOntapNodeDetailsService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,
    private modalService: BsModalService,
    private caSvc: UnityDevicesCustomAttributesCrudService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.nodeId = params.get('id'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));

    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getDetails();
      this.getCPUChartData();
      this.getTopEntities();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDetails();
    this.getCPUChartData();
    this.getTopEntities();
  }

  getDetails() {
    this.spinner.start('main');
    this.svc.getDetails(this.clusterId, this.nodeId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = this.svc.convertToViewData(res);
      this.node = res;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.view = null;
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

  getCPUChartData() {
    this.spinner.start('processor_utilization');
    this.svc.getCPUChartData(this.clusterId, this.nodeId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cpuChartData = this.svc.convertToCPUChartData(res);
      this.spinner.stop('processor_utilization');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('processor_utilization');
    })
  }

  getTopEntities() {
    this.spinner.start('top_aggregates');
    this.spinner.start('top_volumes');
    this.spinner.start('top_luns');
    this.svc.getTopEntities(this.clusterId, this.nodeId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.aggregateChartData = this.svc.convertToTopNChartData(res.aggregates);
      this.volumeChartData = this.svc.convertToTopNChartData(res.volumes);
      this.lunChartData = this.svc.convertToTopNChartData(res.luns);
      this.spinner.stop('top_aggregates');
      this.spinner.stop('top_volumes');
      this.spinner.stop('top_luns');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('top_aggregates');
      this.spinner.stop('top_volumes');
      this.spinner.stop('top_luns');
      // this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

  onCustomAttributesEdit() {
    const length = Object.keys(this.node?.custom_attribute_data || {}).length;
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
      this.svc.submitCustomAttributesForm(this.clusterId,this.nodeId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getDetails();
        this.modalRef.hide();
        this.notification.success(new Notification('Custom Attributes updated successfully.'));
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to update Custom Attributes.'));
      })
    }
  }

  getClusterDetailsWidthClass(): string {
    return (this.node?.custom_attribute_data) ? 'w-65' : 'w-100';
  }

}
