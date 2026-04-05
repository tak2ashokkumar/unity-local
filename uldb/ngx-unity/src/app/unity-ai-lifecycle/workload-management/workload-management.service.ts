import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { ACTIVE_JOBS_DATA, ActiveJob, GPU_ALLOCATION_DATA, GPU_ALLOCATION_TOTAL, GPU_CLUSTER_LEGEND, GPU_CLUSTER_MAP_DATA, GpuClusterCell, RESOURCE_UTILIZATION_DATA, SCHEDULING_THROUGHPUT_DATA, WORKLOAD_SUMMARY_KPIS, WorkloadSummaryKpi } from './workload-management.constants';

@Injectable()
export class WorkloadManagementService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  // ── Summary KPIs ─────────────────────────
  getSummaryKpis(): WorkloadSummaryKpi[] {
    return WORKLOAD_SUMMARY_KPIS;
  }

  // ── Resource Utilization Line Chart ──────
  getResourceUtilizationChartData(): UnityChartDetails {
    const raw = RESOURCE_UTILIZATION_DATA;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.grid = {
      left: 50,
      right: 20,
      top: 30,
      bottom: 60
    };
    view.options.tooltip = {
      trigger: 'axis',
    };
    view.options.legend = {
      bottom: 5,
      icon: 'roundRect',
      itemHeight: 3,
      itemWidth: 16,
      data: raw.series.map(s => s.name),
    };
    view.options.xAxis = {
      type: 'category',
      boundaryGap: false,
      data: raw.categories,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999'
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#d9d9d9' }
      }
    };
    view.options.yAxis = {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999'
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
      symbolSize: 7,
      lineStyle: { color: s.color, width: 1.5 },
      itemStyle: {
        color: '#fff',
        borderColor: s.color,
        borderWidth: 2
      },
      label: { show: true, position: 'top', fontSize: 10, color: s.color },
      data: s.data
    }));

    return view;
  }

  // ── GPU Allocation Donut Chart ───────────
  getGpuAllocationChartData(): UnityChartDetails {
    const raw = GPU_ALLOCATION_DATA;
    const total = GPU_ALLOCATION_TOTAL;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getPieChartWithVerticalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    view.options.legend = {
      orient: 'vertical',
      icon: 'circle',
      top: 'middle',
      right: '5%',
      itemHeight: 8,
      itemWidth: 8,
      selectedMode: false,
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 13,
      },
      formatter: function (name: string) {
        let item = raw.find(d => d.name === name);
        return `${name}: ${item ? item.value : ''}`;
      }
    };

    view.options.series = [
      {
        name: 'GPU Allocation',
        type: 'pie',
        radius: ['50%', '78%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: raw.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ];

    // Center "100" text
    view.options.graphic = {
      elements: [
        {
          type: 'text',
          left: '34%',
          top: '45%',
          style: {
            text: `${total}`,
            fontSize: 28,
            fontWeight: 'bold',
            fill: UNITY_TEXT_DEFAULT_COLOR(),
            fontFamily: UNITY_FONT_FAMILY(),
          }
        }
      ]
    };

    return view;
  }

  // ── Scheduling Throughput Bar Chart ──────
  getSchedulingThroughputChartData(): UnityChartDetails {
    const raw = SCHEDULING_THROUGHPUT_DATA;

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options.grid = {
      left: 50,
      right: 20,
      top: 25,
      bottom: 30
    };
    view.options.tooltip = {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    };
    view.options.legend = { show: false };
    view.options.xAxis = {
      type: 'category',
      data: raw.categories,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999'
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#d9d9d9' }
      }
    };
    view.options.yAxis = {
      type: 'value',
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: '#999'
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#d9d9d9' }
      }
    };
    view.options.series = raw.series.map(s => ({
      name: s.name,
      type: 'bar',
      barGap: '5%',
      barCategoryGap: '20%',
      itemStyle: {
        color: s.color,
      },
      data: s.data
    }));

    return view;
  }

  // ── Active Jobs Table ────────────────────
  getActiveJobs(): ActiveJob[] {
    return ACTIVE_JOBS_DATA;
  }

  // ── GPU Cluster Map ──────────────────────
  getGpuClusterMap(): GpuClusterCell[] {
    return GPU_CLUSTER_MAP_DATA;
  }

  getGpuClusterLegend() {
    return GPU_CLUSTER_LEGEND;
  }
}
