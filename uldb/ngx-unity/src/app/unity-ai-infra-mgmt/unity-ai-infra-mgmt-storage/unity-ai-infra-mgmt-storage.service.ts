import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY } from 'src/app/app-constants';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DATA_GROWTH_TREND, IO_OPERATION_DATA, STORAGE_BY_TENANT_DATA, STORAGE_POOL_CARDS, STORAGE_POOL_INVENTORY, STORAGE_SUMMARY_KPIS, StoragePoolCard, StoragePoolInventoryItem, StorageSummaryKpi } from './unity-ai-infra-mgmt-storage.constants';

@Injectable()
export class UnityAiInfraMgmtStorageService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  // ── Summary KPIs ─────────────────────────
  getSummaryKpis(): StorageSummaryKpi[] {
    return STORAGE_SUMMARY_KPIS;
  }

  // ── Storage Pool Cards ───────────────────
  getStoragePoolCards(): StoragePoolCard[] {
    return STORAGE_POOL_CARDS;
  }

  // ── I/O Operation Line Chart ─────────────
  getIoOperationChartData(): UnityChartDetails {
    const raw = IO_OPERATION_DATA;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.grid = {
      left: 55,
      right: 20,
      top: 20,
      bottom: 40
    };
    view.options.tooltip = {
      trigger: 'axis',
    };
    view.options.legend = {
      show: false,
    };
    view.options.xAxis = {
      type: 'category',
      boundaryGap: false,
      data: raw.categories,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999',
        fontSize: 11
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#d9d9d9' }
      }
    };
    view.options.yAxis = {
      type: 'value',
      min: 0,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999',
        formatter: function (value: number) {
          if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
          return value.toString();
        }
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#d9d9d9' }
      }
    };
    view.options.series = raw.series.map(s => ({
      name: s.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: s.color, width: 1.5 },
      itemStyle: {
        color: s.color,
        borderWidth: 4,
        borderColor: s.color + '4D'
      },
      data: s.data
    }));

    return view;
  }

  // ── Storage by Tenant Horizontal Bar Chart ─
  getStorageByTenantChartData(): UnityChartDetails {
    const raw = STORAGE_BY_TENANT_DATA;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options.grid = {
      left: 90,
      right: 20,
      top: 10,
      bottom: 30
    };
    view.options.tooltip = {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    };
    view.options.legend = { show: true, bottom: 0, textStyle: { color: '#666', fontSize: 11, fontFamily: UNITY_FONT_FAMILY() }, icon: 'rect', itemWidth: 10, itemHeight: 10 };
    view.options.xAxis = {
      type: 'value',
      max: 450,
      position: 'top',
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999',
        fontSize: 11
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#d9d9d9' }
      }
    };
    view.options.yAxis = {
      type: 'category',
      inverse: true,
      data: raw.map(d => d.name),
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#666',
        fontSize: 11
      },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#d9d9d9' }
      }
    };
    view.options.series = [
      {
        name: '2023',
        type: 'bar',
        barWidth: '60%',
        showBackground: true,
        backgroundStyle: { color: '#EEF2FF' },
        itemStyle: {
          color: '#8eaafb',
          borderRadius: 0
        },
        data: raw.map(d => d.value)
      }
    ];

    return view;
  }

  // ── Data Growth Trend — Line Chart ───────
  getDataGrowthTrendChartData(): UnityChartDetails {
    const raw = DATA_GROWTH_TREND;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.grid = {
      left: 55,
      right: 20,
      top: 20,
      bottom: 40
    };
    view.options.tooltip = {
      trigger: 'axis',
      valueFormatter: (v: any) => `${v} PB`,
    };
    view.options.legend = { show: false };
    view.options.xAxis = {
      type: 'category',
      boundaryGap: false,
      data: raw.categories,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#666',
        fontSize: 10
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#ccc' }
      }
    };
    view.options.yAxis = {
      type: 'value',
      min: 0,
      max: 10,
      interval: 2,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#666',
        fontSize: 10,
        formatter: '{value}PB'
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#ccc' }
      }
    };
    view.options.series = [
      {
        name: 'Data Growth',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#8eaafb', width: 1.5 },
        itemStyle: {
          color: '#8eaafb',
          borderWidth: 4,
          borderColor: '#8eaafb4D'
        },
        data: raw.data
      }
    ];

    return view;
  }

  // ── Storage Pool Inventory Table ─────────
  getStoragePoolInventory(): StoragePoolInventoryItem[] {
    return STORAGE_POOL_INVENTORY;
  }
}
