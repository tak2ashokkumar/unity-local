import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnityAiLifecycleStorageService } from './unity-ai-lifecycle-storage.service';
import { StoragePoolCard, StoragePoolInventoryItem, StorageSummaryKpi } from './unity-ai-lifecycle-storage.constants';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'unity-ai-lifecycle-storage',
  templateUrl: './unity-ai-lifecycle-storage.component.html',
  styleUrls: ['./unity-ai-lifecycle-storage.component.scss'],
  providers: [UnityAiLifecycleStorageService]
})
export class UnityAiLifecycleStorageComponent implements OnInit, OnDestroy {

  summaryKpis: StorageSummaryKpi[] = [];
  storagePoolCards: StoragePoolCard[] = [];
  ioOperationChart: UnityChartDetails;
  storageByTenantChart: UnityChartDetails;
  dataGrowthTrendChart: UnityChartDetails;
  storagePoolInventory: StoragePoolInventoryItem[] = [];

  constructor(private svc: UnityAiLifecycleStorageService) { }

  ngOnInit(): void {
    this.loadData()
  }

  ngOnDestroy(): void {
    
  }

  private loadData(): void {
    this.summaryKpis = this.svc.getSummaryKpis();
    this.storagePoolCards = this.svc.getStoragePoolCards();
    this.ioOperationChart = this.svc.getIoOperationChartData();
    this.storageByTenantChart = this.svc.getStorageByTenantChartData();
    this.dataGrowthTrendChart = this.svc.getDataGrowthTrendChartData();
    this.storagePoolInventory = this.svc.getStoragePoolInventory();
  }

}
