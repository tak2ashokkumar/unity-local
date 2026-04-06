import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { UnityThemeService } from 'src/app/shared/unity-theme.service';
import { ACTIVE_JOBS_DATA, ActiveJob, GPU_ALLOCATION_DATA, GPU_ALLOCATION_TOTAL, GPU_CLUSTER_LEGEND, GPU_CLUSTER_MAP_DATA, GpuClusterCell, RESOURCE_UTILIZATION_DATA, SCHEDULING_THROUGHPUT_DATA, WORKLOAD_SUMMARY_KPIS, WorkloadSummaryKpi } from './workload-management.constants';

@Injectable()
export class WorkloadManagementService {

  constructor(
    private chartConfigSvc: UnityChartConfigService,
    private themeSvc: UnityThemeService
  ) { }

  // ── Summary KPIs ─────────────────────────
  getSummaryKpis(): WorkloadSummaryKpi[] {
    return WORKLOAD_SUMMARY_KPIS;
  }

  // ── GPU Utilization by Job Type — Daily Multi-Line Chart ──────
  getResourceUtilizationChartData(): UnityChartDetails {
    const raw = RESOURCE_UTILIZATION_DATA;
    const isDark = this.themeSvc.isDark();

    // Theme-adaptive colors
    const axisColor     = isDark ? '#8a8ea0' : '#888888';
    const gridColor     = isDark ? '#2e3145' : '#e5e5e5';
    const markLineColor = isDark ? '#4a4f62' : '#c8ced3';
    const bgColor       = isDark ? 'rgba(35,39,47,0.85)' : 'rgba(255,255,255,0.9)';
    const tooltipTxt    = isDark ? '#ebedef' : '#23282c';
    const font          = UNITY_FONT_FAMILY();

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.grid = {
      left: 50,
      right: 15,    // no right legend — reclaim full width
      top: 15,
      bottom: 108   // rotated labels (~52px) + axis name (~20px) + legend (~28px) + gaps
    };

    view.options.tooltip = {
      trigger: 'axis',
      confine: true,
      backgroundColor: bgColor,
      borderColor: markLineColor,
      borderWidth: 1,
      textStyle: { color: tooltipTxt, fontFamily: font, fontSize: 12 },
      formatter: (params: any[]) => {
        if (!params || params.length === 0) { return ''; }
        let html = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color}"></span>
            <span>${p.seriesName}</span>
            <span style="margin-left:auto;font-weight:600">${p.value}</span>
          </div>`;
        });
        return html;
      }
    };

    // Horizontal legend at the bottom
    // Pass series names only — ECharts auto-maps colors from the series definitions
    view.options.legend = {
      type: 'plain',
      orient: 'horizontal',
      bottom: 5,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 18,
      itemHeight: 6,
      itemGap: 20,
      textStyle: { fontFamily: font, fontSize: 12, color: axisColor },
      data: raw.series.map(s => s.name)
    };

    view.options.xAxis = {
      type: 'category',
      boundaryGap: true,
      data: raw.categories,
      name: 'Date',
      nameLocation: 'middle',
      nameGap: 62,   // rotated labels ≈52px tall → name sits just below them
      nameTextStyle: { color: axisColor, fontFamily: font, fontSize: 12 },
      axisLabel: {
        fontFamily: font,
        color: axisColor,
        rotate: 90,
        fontSize: 10,
        interval: 0           // show all 60 date labels
      },
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { lineStyle: { color: gridColor } },
      splitLine: { show: false }
    };

    view.options.yAxis = {
      type: 'value',
      min: 0,
      max: 12,
      interval: 2,
      name: 'No of GPUs',
      nameLocation: 'middle',
      nameGap: 48,
      nameTextStyle: { color: axisColor, fontFamily: font, fontSize: 12 },
      axisLabel: { fontFamily: font, color: axisColor },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: gridColor }
      }
    };

    view.options.series = raw.series.map((s) => {
      const isIdle = s.name === 'Idle';
      const seriesObj: any = {
        name: s.name,
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: isIdle ? 3 : 5,
        lineStyle: { color: s.color, width: isIdle ? 1 : 2 },
        itemStyle: { color: s.color },
        // Show value labels for Inference, Streaming, Training; hide for Idle (60 zeros = clutter)
        label: {
          show: !isIdle,
          position: 'top',
          fontSize: 9,
          fontFamily: font,
          color: s.color
        },
        data: s.data
      };

      // Add month-boundary vertical lines on the Training series (last series)
      if (s.name === 'Training') {
        seriesObj.markLine = {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', color: markLineColor, width: 1.5, opacity: 0.9 },
          label: {
            show: true,
            position: 'insideStartTop',
            formatter: '{b}',
            color: axisColor,
            fontFamily: font,
            fontSize: 11,
            fontWeight: 600
          },
          data: [
            { xAxis: '01-Mar', name: 'Mar' },
            { xAxis: '01-Apr', name: 'Apr' }
          ]
        };
      }

      return seriesObj;
    });

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
