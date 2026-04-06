import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { LifecycleInstance, LifecycleSummaryKpi } from './lifecycle-management.constants';
import { LifecycleManagementService } from './lifecycle-management.service';

@Component({
  selector: 'lifecycle-management',
  templateUrl: './lifecycle-management.component.html',
  styleUrls: ['./lifecycle-management.component.scss'],
  providers: [LifecycleManagementService]
})
export class LifecycleManagementComponent implements OnInit, OnDestroy {

  summaryKpis: LifecycleSummaryKpi[] = [];
  memoryUsageChart: UnityChartDetails;
  gpuThermalChart: UnityChartDetails;
  cpuLoadChart: UnityChartDetails;

  allInstances: LifecycleInstance[] = [];
  viewInstances: LifecycleInstance[] = [];
  count: number = 0;
  pageNo: number = 1;
  pageSize: number = 10;

  constructor(private svc: LifecycleManagementService) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void { }

  private loadData(): void {
    this.summaryKpis = this.svc.getSummaryKpis();
    this.memoryUsageChart = this.svc.getMemoryUsageChartData();
    this.gpuThermalChart = this.svc.getGpuThermalChartData();
    this.cpuLoadChart = this.svc.getCpuLoadChartData();
    this.allInstances = this.svc.getInstances();
    this.count = this.allInstances.length;
    this.applyPagination();
  }

  private applyPagination(): void {
    const start = (this.pageNo - 1) * this.pageSize;
    this.viewInstances = this.allInstances.slice(start, start + this.pageSize);
  }

  pageChange(pageNo: number): void {
    if (this.pageNo !== pageNo) {
      this.pageNo = pageNo;
      this.applyPagination();
    }
  }

  pageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageNo = 1;
    this.applyPagination();
  }

  getStatusClass(instance: LifecycleInstance): string {
    return instance.status === 'Active' ? 'text-success' : 'text-danger';
  }

  getUsedPercent(instance: LifecycleInstance): number {
    return 100 - instance.freePercent;
  }

  getUsedBarColor(freePercent: number): string {
    if (freePercent >= 40) return '#28a745';
    if (freePercent >= 20) return '#fd7e14';
    return '#dc3545';
  }

}
