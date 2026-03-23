import { Component, OnDestroy, OnInit } from '@angular/core';
import { NutanixClusterComponentSummaryViewData, NutanixClusterControllerStatsViewData, NutanixClusterDetailsService, NutanixClusterUsageViewData, NutanixClusterVMSummaryViewData } from './nutanix-cluster-details.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { cloneDeep as _clone } from 'lodash-es';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { NutanixClusterDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';

@Component({
  selector: 'nutanix-cluster-details',
  templateUrl: './nutanix-cluster-details.component.html',
  styleUrls: ['./nutanix-cluster-details.component.scss'],
  providers: [NutanixClusterDetailsService]
})
export class NutanixClusterDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  clusterId: string;

  device: DeviceTabData = { name: '', deviceType: null };
  deviceStatusIcon: string = null;

  clusterDetails: NutanixClusterDetailsType;
  vmSummaryViewData = new NutanixClusterVMSummaryViewData();
  componentSummaryViewData = new NutanixClusterComponentSummaryViewData();
  clusterUsageViewData = new NutanixClusterUsageViewData();
  controllerStatsViewData = new NutanixClusterControllerStatsViewData();
  constructor(private svc: NutanixClusterDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.clusterId = params.get('clusterId');
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('clusterId'));
    this.getClusterDetails();
    this.getClusterGraphs();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getClusterDetails();
    this.getClusterGraphs();
  }

  getClusterDetails() {
    this.spinner.start(this.vmSummaryViewData.loader);
    this.spinner.start(this.componentSummaryViewData.loader);
    this.spinner.start(this.clusterUsageViewData.loader);
    this.clusterUsageViewData.form = _clone(this.svc.getForm('CPU'));
    this.svc.getClusterDetails(this.pcId, this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.clusterDetails = res;
      this.vmSummaryViewData.chartData = this.svc.convertToVMSummaryChartData(res);
      this.componentSummaryViewData.chartData = this.svc.convertToComponentSummaryChartData(res);
      this.clusterUsageViewData.chartData = this.svc.convertToClusterUsageChartData(this.clusterUsageViewData.options[0], res);
      this.spinner.stop(this.vmSummaryViewData.loader);
      this.spinner.stop(this.componentSummaryViewData.loader);
      this.spinner.stop(this.clusterUsageViewData.loader);
      this.subscribeToClusterUsageFormChanges();
    }, (err: HttpErrorResponse) => {
      this.clusterDetails = null;
      this.spinner.stop(this.vmSummaryViewData.loader);
      this.spinner.stop(this.componentSummaryViewData.loader);
      this.spinner.stop(this.clusterUsageViewData.loader);
    })
  }

  getUsedPercentage(value: string): number {
    const val = value ? value.replace('%', '').trim() : '0';
    return Number(100 - Number(val));
  }

  getProgressClass(value: string): string {
    const usedPercentage = this.getUsedPercentage(value);
    return usedPercentage < 65 ? 'bg-success' : usedPercentage >= 65 && usedPercentage < 85 ? 'bg-warning' : 'bg-danger';
  }

  subscribeToClusterUsageFormChanges() {
    this.clusterUsageViewData.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      switch (val) {
        case 'CPU':
          this.clusterUsageViewData.chartData = this.svc.convertToClusterUsageChartData(val, this.clusterDetails);
          break;
        default:
          this.clusterUsageViewData.chartData = this.svc.convertToClusterUsageChartData(val, this.clusterDetails);
          break;
      }
    })
  }

  getClusterGraphs() {
    this.spinner.start(this.controllerStatsViewData.loader);
    this.controllerStatsViewData.form = _clone(this.svc.getForm(this.controllerStatsViewData.options[0]));
    this.controllerStatsViewData.data = null;
    this.controllerStatsViewData.chartData = null;
    this.svc.getClusterGraphs(this.pcId, this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.controllerStatsViewData.data = res;
      this.controllerStatsViewData.chartData = this.svc.convertToControllerStatsChartData(this.controllerStatsViewData.options[0], res.controller_num_iops);
      this.spinner.stop(this.controllerStatsViewData.loader);
      this.subscribeToControllerStatsGraphChanges();
    }, (err: HttpErrorResponse) => {
      this.controllerStatsViewData.data = null;
      this.controllerStatsViewData.chartData = null;
      this.spinner.stop(this.controllerStatsViewData.loader);
    })
  }

  subscribeToControllerStatsGraphChanges() {
    this.controllerStatsViewData.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      switch (val) {
        case 'IOPS':
          this.controllerStatsViewData.chartData = this.svc.convertToControllerStatsChartData(val, this.controllerStatsViewData.data.controller_num_iops);
          break;
        case 'IO B/W':
          this.controllerStatsViewData.chartData = this.svc.convertToControllerStatsChartData(val, this.controllerStatsViewData.data.controller_io_bandwidth_kBps);
          break;
        default:
          this.controllerStatsViewData.chartData = this.svc.convertToControllerStatsChartData(val, this.controllerStatsViewData.data.controller_avg_io_latency_usecs);
          break;
      }
    })
  }

  getAlertSeverityClass(severity: string) {
    switch (severity) {
      case 'Critical': return 'fas fa-exclamation-triangle text-danger';
      case 'Warning': return 'fas fa-exclamation-circle text-warning fa-lg';
      case 'Information': return 'fas fa-info-circle text-primary fa-lg';
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
