import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { GpuContainer } from './gpu-orchestration.constants';
import { GpuOrchestrationService } from './gpu-orchestration.service';

@Component({
  selector: 'gpu-orchestration',
  templateUrl: './gpu-orchestration.component.html',
  styleUrls: ['./gpu-orchestration.component.scss'],
  providers: [GpuOrchestrationService]
})
export class GpuOrchestrationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  public count: number = 0;
  public currentCriteria: SearchCriteria;
  private allData: GpuContainer[] = [];
  public viewData: GpuContainer[] = [];
  public selectedItem: GpuContainer | null = null;

  constructor(private svc: GpuOrchestrationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.svc.getContainers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.allData = data;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.applyFilters();
  }

  public pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.currentCriteria.pageNo = pageNo;
      this.applyFilters();
    }
  }

  public pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.applyFilters();
  }

  public openDetail(item: GpuContainer) {
    this.selectedItem = item;
  }

  public closeDetail() {
    this.selectedItem = null;
  }

  private applyFilters() {
    let filtered = [...this.allData];
    if (this.currentCriteria.searchValue) {
      const search = this.currentCriteria.searchValue.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search) ||
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
      case 'Running': return 'fas fa-check-circle';
      case 'Scaling': return 'fas fa-circle-notch fa-spin';
      case 'Down': return 'fas fa-exclamation-triangle';
      default: return '';
    }
  }

  public getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Running': return 'detail-badge-running';
      case 'Scaling': return 'detail-badge-scaling';
      case 'Down': return 'detail-badge-down';
      default: return '';
    }
  }

  public getUtilizationColor(utilization: number): string {
    if (utilization < 50) return '#20c997';
    if (utilization < 80) return '#fd7e14';
    return '#f86c6b';
  }
}
