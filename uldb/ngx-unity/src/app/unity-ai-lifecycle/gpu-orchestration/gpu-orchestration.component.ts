import { Component, OnInit } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'gpu-orchestration',
  templateUrl: './gpu-orchestration.component.html',
  styleUrls: ['./gpu-orchestration.component.scss']
})
export class GpuOrchestrationComponent implements OnInit {
  public count: number = 0;
  public currentCriteria: SearchCriteria;
  public allData: GpuContainer[] = [
    { id: 'cnt-8x4v-90k', status: 'Running', clusterName: 'Neural-Nexus-Beta', cpuModel: 'AMD Radeon 7900 XTX', nodeCount: 1, utilization: 39 },
    { id: 'cnt-2m9p-11a', status: 'Scaling', clusterName: 'Neural-Nexus-Gamma', cpuModel: 'Intel Xe Graphics', nodeCount: 2, utilization: 71 },
    { id: 'cnt-5q2r-88v', status: 'Down', clusterName: 'Neural-Nexus-Delta', cpuModel: 'NVIDIA A40', nodeCount: 3, utilization: 94 },
    { id: 'cnt-8x4v-90k', status: 'Running', clusterName: 'Neural-Nexus-Epsilon', cpuModel: 'AMD RX 6800', nodeCount: 4, utilization: 39 },
    { id: 'cnt-2m9p-11a', status: 'Scaling', clusterName: 'Neural-Nexus-Zeta', cpuModel: 'NVIDIA RTX 4090', nodeCount: 5, utilization: 71 },
    { id: 'cnt-5q2r-88v', status: 'Down', clusterName: 'Neural-Nexus-Eta', cpuModel: 'Google TPU v4', nodeCount: 6, utilization: 94 },
    { id: 'cnt-8x4v-90k', status: 'Running', clusterName: 'Neural-Nexus-Theta', cpuModel: 'Apple M2 Pro', nodeCount: 7, utilization: 39 },
    { id: 'cnt-2m9p-11a', status: 'Scaling', clusterName: 'Neural-Nexus-Iota', cpuModel: 'Qualcomm Adreno 730', nodeCount: 8, utilization: 71 },
    { id: 'cnt-5q2r-88v', status: 'Down', clusterName: 'Neural-Nexus-Kappa', cpuModel: 'NVIDIA V100', nodeCount: 9, utilization: 94 },
    { id: 'cnt-8x4v-90k', status: 'Scaling', clusterName: 'Neural-Nexus-Lambda', cpuModel: 'Intel Iris Xe', nodeCount: 10, utilization: 94 },
  ];
  public viewData: GpuContainer[] = [];

  constructor() {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  public onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.applyFilters();
  }

  public onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.applyFilters();
  }

  public pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.currentCriteria.pageNo = pageNo;
      this.applyFilters();
    }
  }

  public pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.applyFilters();
  }

  public refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.allData];
    if (this.currentCriteria.searchValue) {
      const search = this.currentCriteria.searchValue.toLowerCase();
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(search) ||
        item.clusterName.toLowerCase().includes(search) ||
        item.cpuModel.toLowerCase().includes(search) ||
        item.status.toLowerCase().includes(search)
      );
    }

    this.count = filtered.length;
    const startIndex = (this.currentCriteria.pageNo - 1) * this.currentCriteria.pageSize;
    this.viewData = filtered.slice(startIndex, startIndex + this.currentCriteria.pageSize);
  }

  public getStatusClass(status: string): string {
    switch (status) {
      case 'Running': return 'text-success';
      case 'Scaling': return 'text-warning';
      case 'Down': return 'text-danger';
      default: return '';
    }
  }

  public getStatusIcon(status: string): string {
    switch (status) {
      case 'Running': return 'fa fa-check-circle';
      case 'Scaling': return 'fa fa-exclamation-circle';
      case 'Down': return 'fa fa-exclamation-triangle';
      default: return '';
    }
  }

  public getUtilizationColor(utilization: number): string {
    if (utilization < 50) return '#20c997'; // green
    if (utilization < 80) return '#fd7e14'; // orange
    return '#f86c6b'; // red
  }

}

export interface GpuContainer {
  id: string;
  status: 'Running' | 'Scaling' | 'Down';
  clusterName: string;
  cpuModel: string;
  nodeCount: number;
  utilization: number;
}
