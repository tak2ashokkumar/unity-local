import { Injectable } from '@angular/core';
import { DataZoomComponentOption, EChartsOption, LegendComponentOption } from 'echarts';
import { BarChart, BoxplotChart, CandlestickChart, CustomChart, EffectScatterChart, FunnelChart, GaugeChart, GraphChart, HeatmapChart, LineChart, LinesChart, MapChart, ParallelChart, PictorialBarChart, PieChart, RadarChart, SankeyChart, ScatterChart, SunburstChart, ThemeRiverChart, TreeChart, TreemapChart } from "echarts/charts";
import { GraphicComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { TitleOption } from 'echarts/types/dist/shared';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from '../app-constants';

@Injectable({
  providedIn: 'root'
})
export class UnityChartConfigService {

  private readonly days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly weeksOfMonth: string[] = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  private readonly months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private readonly quarters: string[] = ['Q1', 'Q2', 'Q3', 'Q4'];

  constructor() { }

  getDays() {
    return this.days;
  }
  getweeksOfMonth() {
    return this.weeksOfMonth;
  }
  getMonths() {
    return this.months;
  }
  getQuarters() {
    return this.quarters;
  }
  getCommonChartExtensions() {
    return [TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent];
  }
  getChartExtensions(type?: string) {
    let chartExt: any;
    switch (type) {
      case UnityChartTypes.LINE: chartExt = LineChart; break;
      case UnityChartTypes.LINES: chartExt = LinesChart; break;
      case UnityChartTypes.BAR: chartExt = BarChart; break;
      case UnityChartTypes.PICTORIAL_BAR: chartExt = PictorialBarChart; break;
      case UnityChartTypes.PIE: chartExt = PieChart; break;
      case UnityChartTypes.MAP: chartExt = MapChart; break;
      case UnityChartTypes.HEAT_MAP: chartExt = HeatmapChart; break;
      case UnityChartTypes.RADAR: chartExt = RadarChart; break;
      case UnityChartTypes.TREE: chartExt = TreeChart; break;
      case UnityChartTypes.TREE_MAP: chartExt = TreemapChart; break;
      case UnityChartTypes.FUNNEL: chartExt = FunnelChart; break;
      case UnityChartTypes.GRAPH: chartExt = GraphChart; break;
      case UnityChartTypes.SCATTER: chartExt = ScatterChart; break;
      case UnityChartTypes.EFFECT_SCATTER: chartExt = EffectScatterChart; break;
      case UnityChartTypes.GUAGE: chartExt = GaugeChart; break;
      case UnityChartTypes.SANKEY: chartExt = SankeyChart; break;
      case UnityChartTypes.BOX_PLOT: chartExt = BoxplotChart; break;
      case UnityChartTypes.SUN_BURST: chartExt = SunburstChart; break;
      case UnityChartTypes.PARALLEL: chartExt = ParallelChart; break;
      case UnityChartTypes.CANDLE_STICK: chartExt = CandlestickChart; break;
      case UnityChartTypes.CUSTOM: chartExt = CustomChart; break;
      case UnityChartTypes.THEME_RIVER: chartExt = ThemeRiverChart; break;
      default: chartExt = BarChart;
    }
    return [...this.getCommonChartExtensions(), ...[chartExt]];
  }

  getDefaultLineChartOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "3%",
        containLabel: true
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        type: 'value'
      },
    };
  }

  getDefaultVerticalBarChartOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "3%",
        containLabel: true
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        type: 'value'
      },
    };
  }

  getStackedBarChartOption(): EChartsOption {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {
        orient: 'horizontal',
        icon: 'circle',
        left: 'center',
        bottom: '0',
        width: '98%',
        itemHeight: 8, // Adjusts the marker height
        itemWidth: 8, // Adjusts the marker width
        selectedMode: false,
        textStyle: {
          padding: [10, 0, 0, 0],
          overflow: "truncate" // "break"
        },
        itemGap: 10,
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: [],
        axisLabel: {
          interval: 0,
          rotate: 60,
          fontSize: '10px',
        },
      }],
      yAxis: [{
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#666'
        },
      }],
      color: ECHARTCOLORS,
      series: [],
    };
  }

  getDefaultHorizantalBarChartOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "8%",
        top: "3%",
        containLabel: true
      },
      xAxis: {
        type: "value"
      },
      yAxis: {
        type: "category",
        data: ["sat", "sun", "mon", "tue", "wed", "thu", "fri"],
        axisLabel: {
          interval: 0,
          rotate: 15
        }
      },
      legend: {
        bottom: 0
      },
      series: []
    };
  }

  getDefaultPieChartOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  getPieChartWithVerticalLegendsOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        borderWidth: 0
      },
      legend: {
        orient: 'vertical',
        icon: 'circle',
        top: 'middle',
        right: '0',
        height: '90%',
        width: '40%',
        textStyle: {
          overflow: "truncate" // "break"
        },
        // type: 'scroll',
        selectedMode: false,
        itemHeight: 8,
      },
      // grid: {
      //   left: "3%",
      //   right: "40%",
      //   bottom: "3%",
      //   top: "3%",
      //   containLabel: true
      // },
      series: [
        {
          name: 'Cost',
          type: 'pie',
          radius: ['40%', '60%'],
          center: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          labelLine: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          color: ECHARTCOLORS,
          data: []
        }
      ],
    };
  }

  getDefaultDonutChartOptions(): EChartsOption {
    return {
      grid: {
        left: "3%",
        right: "3%",
        bottom: "0%",
        top: "3%",
        containLabel: true
      },
      legend: {
        orient: 'horizontal',
        icon: 'circle',
        left: 'center',
        bottom: '0',
        width: '98%',
        itemHeight: 8, // Adjusts the marker height
        itemWidth: 8, // Adjusts the marker width
        selectedMode: false,
        textStyle: {
          padding: [10, 0, 0, 0],
          overflow: "truncate" // "break"
        },
        itemGap: 10,
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        borderWidth: 0
      },
    };
  }

  getDefaultHalfDonutChartOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'horizontal',
        icon: 'circle',
        bottom: '0',
        left: 'center',
        width: '98%',
        itemHeight: 8, // Adjusts the marker height
        itemWidth: 8, // Adjusts the marker width
        selectedMode: false,
        textStyle: {
          padding: [10, 0, 0, 0],
          overflow: "truncate" // "break"
        },
        itemGap: 10,
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['60%', '110%'],
          center: ['50%', '75%'],
          // adjust the start and end angle
          startAngle: 180,
          endAngle: 360,
          itemStyle: {
            borderRadius: 0
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            length: 10,
            length2: 10,
          },
          label: {
            color: "rgb(115 129 143)",
            fontSize: '12',
            overflow: 'truncate'
          },
          data: []
        }
      ]
    };
  }

  getNightingalePieChartOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        borderWidth: 0
      },
      legend: {
        orient: 'horizontal',
        icon: 'circle',
        left: 'center',
        bottom: '0',
        width: '98%',
        itemHeight: 8, // Adjusts the marker height
        itemWidth: 8, // Adjusts the marker width
        selectedMode: false,
        textStyle: {
          padding: [10, 0, 0, 0],
          overflow: "truncate" // "break"
        },
        itemGap: 10,
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "0%",
        top: "3%",
        containLabel: true
      },
    }
  }

  getNightingalePieChartWithHorizontalLegendsOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        borderWidth: 0
      },
      legend: {
        orient: 'horizontal',
        icon: 'circle',
        left: 'center',
        bottom: '0',
        width: '98%',
        itemHeight: 8, // Adjusts the marker height
        itemWidth: 8, // Adjusts the marker width
        selectedMode: false,
        textStyle: {
          padding: [10, 0, 0, 0],
          overflow: "truncate" // "break"
        },
        itemGap: 10,
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "0%",
        top: "3%",
        containLabel: true
      },
      series: [
        {
          name: 'Cost',
          type: 'pie',
          radius: [40, 70],
          center: ['50%', '45%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 0
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            color: "rgb(115 129 143)",
            fontSize: '12',
            overflow: 'truncate'
          },
          color: ECHARTCOLORS,
          minAngle: 1,
          data: []
        }
      ],
    };
  }

  getScatterChartOptions(): EChartsOption {
    return {
      grid: { top: '5%' },
      xAxis: {
        type: 'value',
        axisLine: { show: true },
        splitLine: {
          show: false
        },
        axisLabel: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 10,
          fontWeight: 500,
          color: UNITY_TEXT_DEFAULT_COLOR(),
          hideOverlap: true,
          padding: [10, 0, 0, 0],
        },
        scale: true
      },
      yAxis: {
        axisLine: { show: true },
        splitLine: {
          lineStyle: { type: 'dashed' }
        },
        axisLabel: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 10,
          fontWeight: 500,
          color: UNITY_TEXT_DEFAULT_COLOR(),
          hideOverlap: true,
          padding: [0, 0, 0, 20],
        },
        scale: true
      },
      legend: {
        orient: 'horizontal',
        icon: 'circle',
        left: 'center',
        bottom: '5%',
        width: '98%',
        itemHeight: 8, // Adjusts the marker height
        itemWidth: 8, // Adjusts the marker width
        selectedMode: false,
        textStyle: {
          fontFamily: UNITY_FONT_FAMILY(),
          padding: [10, 0, 0, 0],
          overflow: "truncate" // "break"
        },
        itemGap: 10,
      },
      tooltip: {
        trigger: 'item'
      },
      dataZoom: [

      ]
    };
  }

  getDefaultPictorialBarChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Pictorial Bar Chart',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      xAxis: {
        type: 'category',
        data: [],
        axisTick: { show: false },
        axisLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { show: false }
      },
      series: [
        {
          type: 'pictorialBar',
          symbol: 'roundRect', // You can change this to 'image://your-image-url' for custom icons
          symbolSize: [30, 10],
          symbolRepeat: 'fixed',
          symbolMargin: 2,
          data: [],
        }
      ],
      grid: {
        left: '10%',
        right: '10%',
        bottom: '10%',
        containLabel: true
      }
    };
  }

  getDefaultHeatMapChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Heat Map Chart',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        position: 'top',
      },
      xAxis: {
        type: 'category',
        data: [],
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: [],
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '10%',
      },
      series: [
        {
          type: 'heatmap',
          data: [],
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  getDefaultRadarChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Radar Chart',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      tooltip: {},
      radar: {
        indicator: [],
      },
      series: [
        {
          type: 'radar',
          data: [],
        },
      ],
    };
  }

  getDefaultTreeChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Tree Chart',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'tree',
          data: [],
          top: '5%',
          left: '7%',
          bottom: '5%',
          right: '20%',
          symbolSize: 10,
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 12,
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left',
            },
          },
          emphasis: {
            focus: 'descendant',
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  }

  getDefaultTreeMapChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Treemap Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      legend: { show: true, bottom: 10 },
      series: [
        {
          type: 'treemap',
          data: [],
          label: {
            show: true
          }
        }
      ]
    };
  }

  getDefaultFunnelChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Funnel Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      legend: { bottom: 10 },
      series: [
        {
          type: 'funnel',
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          width: '80%',
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside'
          },
          data: []
        }
      ]
    };
  }

  getDefaultEffectScatterChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Effect Scatter Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: { bottom: 10 },
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'effectScatter',
          symbolSize: 20,
          rippleEffect: {
            scale: 2.5,
            brushType: 'stroke'
          },
          data: []
        }
      ]
    };
  }

  getDefaultGaugeChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Gauge Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        formatter: '{b} : {c}%'
      },
      series: [
        {
          type: 'gauge',
          detail: { formatter: '{value}%' },
          data: []
        }
      ]
    };
  }

  getDefaultSankeyChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Sankey Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'sankey',
          emphasis: {
            focus: 'adjacency'
          },
          data: [],
          links: []
        }
      ]
    };
  }

  getDefaultBoxPlotChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Box Plot Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: { bottom: 10, data: ['BoxPlot'] },
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'boxplot',
          data: []
        }
      ]
    };
  }

  getDefaultSunburstChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Sunburst Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      series: [
        {
          type: 'sunburst',
          data: [],
          label: {
            show: true
          }
        }
      ]
    };
  }

  getDefaultParallelChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Parallel Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      legend: { bottom: 10, data: ['Dataset 1'] },
      parallelAxis: [],
      series: [
        {
          type: 'parallel',
          data: []
        }
      ]
    };
  }

  getDefaultCandlestickChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Candlestick Chart',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      legend: { bottom: 10, data: ['Candlestick'] },
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'candlestick',
          data: []
        }
      ]
    };
  }

  getDefaultThemeRiverChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Theme River Chart',
        left: 'center',
        top: 10,
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(0,0,0,0.2)',
            width: 1,
            type: 'solid'
          }
        }
      },
      legend: {
        data: [],
        bottom: 10
      },
      singleAxis: {
        top: 50,
        bottom: 80,
        axisTick: {},
        axisLabel: {},
        type: 'time',
        axisPointer: {
          animation: true,
          label: {
            show: true
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.2
          }
        }
      },
      series: [
        {
          type: 'themeRiver',
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.8)'
            }
          },
          data: []
        }
      ]
    };
  }



  setTitle(title: string, subTitle?: string): TitleOption {
    return {
      text: title,
      subtext: subTitle ? subTitle : '',
      left: 'center',
      top: '3%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      },
      subtextStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 10,
        fontWeight: 500,
        verticalAlign: 'top',
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    }
  }

  setLegend(data?: string[], fontSize?: number): LegendComponentOption {
    let legend: LegendComponentOption = {
      orient: 'horizontal',
      icon: 'circle',
      left: 'center',
      bottom: '5%',
      width: '98%',
      itemHeight: 8, // Adjusts the marker height
      itemWidth: 8, // Adjusts the marker width
      selectedMode: false,
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        padding: [10, 0, 0, 0],
        overflow: "truncate" // "break"
      },
      itemGap: 10,
    }
    if (data && data.length) {
      legend.data = data;
    }
    if (fontSize) {
      legend.textStyle.fontSize = fontSize;
    }
    return legend;
  }

  setDataZoom(orient: string, position?: string): DataZoomComponentOption[] {
    let filters: DataZoomComponentOption[] = [];
    switch (orient) {
      case 'horizontal':
        filters.push(this.setHorizontalDataZoom(position));
        return filters;
      case 'vertical':
        filters.push(this.setVerticalDataZoom(position));
        return filters;
      default:
        filters.push(this.setHorizontalDataZoom(position));
        filters.push(this.setVerticalDataZoom(position));
        return filters;
    }
  }

  setHorizontalDataZoom(position?: string): DataZoomComponentOption {
    let filter: DataZoomComponentOption = {
      type: 'slider',
      xAxisIndex: [0],
      height: 25,
      width: '60%',
      left: 'center',
      handleSize: '100%',
      showDataShadow: true,
      filterMode: 'empty',
      realtime: false,
    }
    if (position == 'top') {
      filter.top = '3%';
    } else {
      filter.bottom = '5%';
    }
    return filter;
  }

  setVerticalDataZoom(position?: string): DataZoomComponentOption {
    let filter: DataZoomComponentOption = {
      type: 'slider',
      orient: 'vertical',
      yAxisIndex: [0],
      height: '60%',
      width: 25,
      bottom: 'center',
      handleSize: '100%',
      showDataShadow: true,
      filterMode: 'empty',
      realtime: false
    }
    if (position == 'right') {
      filter.right = '1%';
    } else {
      filter.left = '0%';
    }
    return filter;
  }

  setSeriesByChartType(chartType: string, seriesName?: string) {
    switch (chartType) {
      case UnityChartTypes.PIE:
        if (seriesName) {
          return Object.assign(this.getPieChartSeries(), { name: seriesName });
        } else {
          return this.getPieChartSeries();
        }
      case UnityChartTypes.DONUT:
        return Object.assign(this.setSeriesByChartType(UnityChartTypes.PIE), { radius: [40, 70] });
      case UnityChartTypes.NIGHTINGALE:
        return Object.assign(this.setSeriesByChartType(UnityChartTypes.DONUT), { roseType: 'radius' });
      default: return Object.assign(this.getPieChartSeries(), { type: 'bar' });
    }
  }

  getBarChartSeries() {
    return {
      type: 'bar',
      itemStyle: {
        borderRadius: 0
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        color: "rgb(115 129 143)",
        fontSize: '12',
        overflow: 'truncate'
      },
      color: ECHARTCOLORS
    }
  }

  getPieChartSeries() {
    return {
      type: 'pie',
      radius: '80%',
      center: ['50%', '45%'],
      itemStyle: {
        borderRadius: 0
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        color: "rgb(115 129 143)",
        fontSize: '12',
        overflow: 'truncate'
      },
      color: ECHARTCOLORS
    }
  }

  getPieChartCenterDataGraphicOptions(centerWords: string[], seriesCenterSpacing: string[],) {
    if (!centerWords || !centerWords.length || !seriesCenterSpacing || !seriesCenterSpacing.length) {
      return;
    }
    let obj = {
      elements: []
    };
    centerWords.forEach((word, index) => {
      let leftSpacingPercentage = <number><unknown>seriesCenterSpacing[0].split('%')[0]; // get number from percentage
      let topSpacingNumber = <number><unknown>seriesCenterSpacing[0].split('%')[0]; // get number from percentage
      obj.elements.push({
        type: 'text',
        left: `${leftSpacingPercentage - 3}%`,
        top: centerWords.length == 1 ? '45%' : (centerWords.length == 2 ? (index == 0 ? '41%' : '50%') : (index == 0 ? '35%' : index == 0 ? '44%' : '53%')),   // push a bit higher
        style: {
          text: word,
          fontSize: 15,
          fill: '#666',
        }
      })
    });
    return obj;
  }
}



export class UnityChartDetails {
  constructor() { }
  type: string;
  options: EChartsOption;
  extensions: any[];
}

export class UnityChartDataType {
  constructor() { }
  id?: string | number;
  name?: string | number;
  groupId?: string | number;
  childGroupId?: string | number;
  value?: number[] | number;
  selected?: boolean;
  color?: string;
}

export enum UnityChartTypes {
  LINE = 'LineChart',
  LINES = 'LinesChart',
  BAR = 'BarChart',
  PICTORIAL_BAR = 'PictorialBarChart',
  PIE = 'PieChart',
  DONUT = 'DonutChart',
  NIGHTINGALE = 'NightingaleChart',
  MAP = 'MapChart',
  HEAT_MAP = 'HeatmapChart',
  RADAR = 'RadarChart',
  TREE = 'TreeChart',
  TREE_MAP = 'TreemapChart',
  GRAPH = 'GraphChart',
  FUNNEL = 'FunnelChart',
  SCATTER = 'Scatter',
  EFFECT_SCATTER = 'EffectScatterChart',
  GUAGE = 'GaugeChart',
  SANKEY = 'SankeyChart',
  BOX_PLOT = 'BoxplotChart',
  SUN_BURST = 'SunburstChart',
  PARALLEL = 'ParallelChart',
  CANDLE_STICK = 'CandlestickChart',
  CUSTOM = 'CustomChart',
  THEME_RIVER = 'ThemeRiverChart',
}

export const ECHARTCOLORS = [
  '#266352',
  '#53b997',
  '#376df7',
  '#294680',
  '#6750aa',
  '#68b2ff',
  '#78128d',
  '#8F45A9',
  '#C63C51',
  '#134B70',
  '#3282B8',
  '#F8C541',
  '#67C090',
  '#468A9A',
  '#BBDCE5',
  '#33A1E0',
  '#7ADAA5',
  '#799EFF',
  '#93DA97',
  '#77BEF0',
  '#A3DC9A',
  '#FFBF78',
  '#8DBCC7',
  '#FFE3A9',
  '#8DD8FF',
  '#6DE1D2',
  '#60B5FF',
  '#8CCDEB',
  '#4DA1A9',
  '#80C4E9',
  '#608BC1',
  '#7AB2D3',
  '#B1D690',
  '#73C7C7',
  '#9ACBD0',
  '#98D8EF',
  '#81BFDA',
  '#78B3CE',
  '#FDE7BB',
  '#9ECAD6',
  '#91C8E4',
  '#4E71FF',
  '#90D1CA',
  '#129990',
  '#B2C6D5',
  '#FFB22C',
  '#578FCA',
  '#3D90D7',
  '#1C6EA4',
  '#239BA7',
  '#8ABB6C'
];