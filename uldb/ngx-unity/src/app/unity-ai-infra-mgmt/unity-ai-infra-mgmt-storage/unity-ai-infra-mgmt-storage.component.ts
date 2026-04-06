import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnityAiInfraMgmtStorageService } from './unity-ai-infra-mgmt-storage.service';
import { StoragePoolCard, StoragePoolInventoryItem, StorageSummaryKpi } from './unity-ai-infra-mgmt-storage.constants';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'unity-ai-infra-mgmt-storage',
  templateUrl: './unity-ai-infra-mgmt-storage.component.html',
  styleUrls: ['./unity-ai-infra-mgmt-storage.component.scss'],
  providers: [UnityAiInfraMgmtStorageService]
})
export class UnityAiInfraMgmtStorageComponent implements OnInit, OnDestroy {

  summaryKpis: StorageSummaryKpi[] = [];
  storagePoolCards: StoragePoolCard[] = [];
  ioOperationChart: UnityChartDetails;
  storageByTenantChart: UnityChartDetails;
  dataGrowthTrendChart: UnityChartDetails;
  storagePoolInventory: StoragePoolInventoryItem[] = [];

  constructor(private svc: UnityAiInfraMgmtStorageService) { }

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
