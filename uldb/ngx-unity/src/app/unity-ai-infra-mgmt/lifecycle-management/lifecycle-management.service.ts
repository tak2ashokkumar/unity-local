import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY } from 'src/app/app-constants';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { CPU_LOAD_DATA, GPU_THERMAL_DATA, LIFECYCLE_INSTANCES, LIFECYCLE_SUMMARY_KPIS, LifecycleInstance, LifecycleSummaryKpi, MEMORY_USAGE_DATA } from './lifecycle-management.constants';

@Injectable()
export class LifecycleManagementService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  // ── Summary KPIs ─────────────────────────
  getSummaryKpis(): LifecycleSummaryKpi[] {
    return LIFECYCLE_SUMMARY_KPIS;
  }

  // ── Memory Usage — Donut Chart ───────────
  getMemoryUsageChartData(): UnityChartDetails {
    const raw = MEMORY_USAGE_DATA;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getPieChartWithVerticalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    view.options.legend = {
      bottom: 5,
      icon: 'circle',
      itemHeight: 8,
      itemWidth: 8,
      data: raw.map(d => d.name),
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 12,
        color: '#666'
      }
    };
    view.options.series = [
      {
        name: 'Memory Usage',
        type: 'pie',
        radius: '72%',
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 11,
          formatter: function (params: any) {
            const text = params.name === 'Success' ? 'Active' : 'In-Active';
            return text + '\n' + params.value + '%';
          }
        },
        labelLine: { show: true, length: 8, length2: 10 },
        data: raw.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ];

    return view;
  }

  // ── GPU Thermal — Bar Chart ──────────────
  getGpuThermalChartData(): UnityChartDetails {
    const raw = GPU_THERMAL_DATA;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options.grid = { left: 40, right: 15, top: 30, bottom: 55 };
    view.options.tooltip = {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params: any) {
        return params[0].name.replace('\n', ' ') + ': ' + params[0].value + '°C';
      }
    };
    view.options.legend = { show: false };
    view.options.xAxis = {
      type: 'category',
      data: raw.gpus,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#555',
        fontSize: 10,
        interval: 0,
        lineHeight: 14
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#ddd' } }
    };
    view.options.yAxis = {
      type: 'value',
      min: 0,
      max: 70,
      interval: 10,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999',
        fontSize: 10
      },
      splitLine: { show: true, lineStyle: { type: 'dashed', color: '#e0e0e0' } }
    };
    view.options.series = [
      {
        type: 'bar',
        barWidth: '55%',
        itemStyle: { color: '#1a5f7a', borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#333',
          formatter: '{c}°C'
        },
        data: raw.temps
      }
    ];

    return view;
  }

  // ── CPU Load — Bar Chart ─────────────────
  getCpuLoadChartData(): UnityChartDetails {
    const raw = CPU_LOAD_DATA;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options.grid = { left: 40, right: 15, top: 30, bottom: 55 };
    view.options.tooltip = {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params: any) {
        return params[0].name.replace('\n', ' ') + ': ' + params[0].value + '%';
      }
    };
    view.options.legend = { show: false };
    view.options.xAxis = {
      type: 'category',
      data: raw.instances,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#555',
        fontSize: 10,
        interval: 0,
        lineHeight: 14
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#ddd' } }
    };
    view.options.yAxis = {
      type: 'value',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999',
        fontSize: 10
      },
      splitLine: { show: true, lineStyle: { type: 'dashed', color: '#e0e0e0' } }
    };
    view.options.series = [
      {
        type: 'bar',
        barWidth: '55%',
        itemStyle: { color: '#5b9bd5', borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#333',
          formatter: '{c}%'
        },
        data: raw.loads
      }
    ];

    return view;
  }

  // ── Instance Table ───────────────────────
  getInstances(): LifecycleInstance[] {
    return LIFECYCLE_INSTANCES;
  }
}
