import { TitleCasePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { XAXisOption, YAXisOption } from 'echarts/types/dist/shared';
import moment from 'moment';
import * as echarts from 'echarts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { ExecutionsByEfficiency, ExecutionsBySuccessRate, ExecutionsOverview, OrchestrationExecutionCountSummary, OrchestrationRecentFailureExecutionsType, OrchestrationSummaryAverageExecutionTimeType, OrchestrationSummaryExecutionsByUserType, OrchestrationSummaryExecutionType, OrchestrationSummaryTaskWidgetScriptsType, OrchestrationSummaryTaskWidgetStatusType, OrchestrationSummaryTaskWidgetTargetType, OrchestrationSummaryTaskWidgetType, OrchestrationSummaryWorkflowWidgetCategoryType, OrchestrationSummaryWorkflowWidgetStatusType, OrchestrationSummaryWorkflowWidgetTargetType, OrchestrationSummaryWorkflowWidgetType, OrchestrationUpcomingExecutionsType } from 'src/app/shared/SharedEntityTypes/dashboard/orchestration-overview-dashboard.type';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class OrchestrationOverviewDashboardService {
  dateRange: DateRange;

  constructor(
    private chartConfigSvc: UnityChartConfigService,
    private http: HttpClient,
    private utilSvc: AppUtilityService,
    private titleCasePipe: TitleCasePipe) { }

  getTaskWidgetData(): Observable<OrchestrationSummaryTaskWidgetType> {
    return this.http.get<OrchestrationSummaryTaskWidgetType>('/orchestration/summary/task_summary/');
  }

  convertToTaskByStatusChartsData(graphData: OrchestrationSummaryTaskWidgetStatusType) {
    let view: UnityChartDetails = new UnityChartDetails();
    let colors = [
      { name: 'Enabled', color: '#378AD8' },
      { name: 'Disabled', color: '#FF8800' }
    ];
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultHalfDonutChartOptions();
    view.options.targetEntity = 'Task';
    view.options.chartName = ChartNames.TASKS_BY_STATUS;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    colors.forEach(col => {
      Object.keys(graphData).forEach(key => {
        if (col.name.toLowerCase() === key.toLowerCase()) {
          graphData[key.toLowerCase()] ? data.push({ name: this.titleCasePipe.transform(key), value: graphData[key.toLowerCase()], color: col.color }) : '';
        }
      })
    })
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`;
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  convertToTaskByTargetTypeChartsData(graphData: OrchestrationSummaryTaskWidgetTargetType) {
    let view: UnityChartDetails = new UnityChartDetails();
    let colors = [
      { name: 'host', color: '#378AD8' },
      { name: 'cloud', color: '#FF8800' },
      { name: 'local', color: '#6750AA' }
    ];
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultHalfDonutChartOptions();
    view.options.targetEntity = 'Task';
    view.options.chartName = ChartNames.TASKS_BY_TARGET;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    colors.forEach(col => {
      Object.keys(graphData).forEach(key => {
        if (col.name.toLowerCase() === key.toLowerCase()) {
          graphData[key.toLowerCase()] ? data.push({ name: this.titleCasePipe.transform(key), value: graphData[key.toLowerCase()], color: col.color }) : '';
        }
      })
    })
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  convertToTaskByScriptTypeChartData(graphData: OrchestrationSummaryTaskWidgetScriptsType[]) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.options.targetEntity = 'Task';
    view.options.chartName = ChartNames.TASKS_BY_TYPE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    let colors = [
      { name: PlaybookName.ANSIBLE, color: '#376DF7' },
      { name: PlaybookName.TERRAFORM, color: '#53B997' },
      { name: PlaybookName.BASH, color: '#6750AA' },
      { name: PlaybookName.PYTHON, color: '#F8C541' },
      { name: PlaybookName.POWERSHELL, color: '#294680' },
      { name: PlaybookName.REST, color: '#68B2FF' }
    ];
    colors.forEach(val => {
      graphData?.forEach(d => {
        if (d.count !== 0) {
          if (d.name === val.name) {
            data.push({ name: d.name, value: d.count, color: val.color });
          }
        }
      });
    });
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.title = {
      text: 'Tasks By Type',
      left: 'center',
      top: '5%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`;
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  getWorkflowWidgetData(): Observable<OrchestrationSummaryWorkflowWidgetType> {
    return this.http.get<OrchestrationSummaryWorkflowWidgetType>('/orchestration/summary/workflow_summary/');
  }

  convertToWorkflowByStatusChartsData(graphData: OrchestrationSummaryWorkflowWidgetStatusType) {
    let view: UnityChartDetails = new UnityChartDetails();
    let colors = [
      { name: 'Enabled', color: '#378AD8' },
      { name: 'Disabled', color: '#FF8800' }
    ];
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultHalfDonutChartOptions();
    view.options.chartName = ChartNames.WORKFLOWS_BY_STATUS;
    view.options.targetEntity = 'Workflow';
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    colors.forEach(col => {
      Object.keys(graphData).forEach(key => {
        if (col.name.toLowerCase() === key.toLowerCase()) {
          graphData[key.toLowerCase()] ? data.push({ name: this.titleCasePipe.transform(key), value: graphData[key.toLowerCase()], color: col.color }) : '';
        }
      })
    })
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  convertToWorkflowByTargetTypeChartsData(graphData: OrchestrationSummaryWorkflowWidgetTargetType) {
    let view: UnityChartDetails = new UnityChartDetails();
    let colors = [
      { name: 'host', color: '#378AD8' },
      { name: 'cloud', color: '#FF8800' },
      { name: 'local', color: '#6750AA' }
    ];
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultHalfDonutChartOptions();
    view.options.chartName = ChartNames.WORKFLOWS_BY_STATUS;
    view.options.targetEntity = 'Workflow';
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    colors.forEach(col => {
      Object.keys(graphData).forEach(key => {
        if (col.name.toLowerCase() === key.toLowerCase()) {
          graphData[key.toLowerCase()] ? data.push({ name: this.titleCasePipe.transform(key), value: graphData[key.toLowerCase()], color: col.color }) : '';
        }
      })
    })
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  convertToWorkflowByCategoryChartData(graphData: OrchestrationSummaryWorkflowWidgetCategoryType) {
    let view: UnityChartDetails = new UnityChartDetails();
    let colors = [
      { name: WorkflowCategory.PROVISIONING, color: '#376DF7' },
      { name: WorkflowCategory.OPERATIONAL, color: '#53B997' },
      { name: WorkflowCategory.INTEGRATION, color: '#6750AA' },
      { name: WorkflowCategory.AGENTIC, color: '#AA50A7' }
    ];
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.options.targetEntity = 'Workflow';
    view.options.chartName = ChartNames.WORKFLOWS_BY_CATEGORY;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    colors.forEach(col => {
      Object.keys(graphData).forEach(key => {
        if (graphData[key.toLowerCase()] !== 0) {
          if (col.name.toLowerCase() === key.toLowerCase()) {
            data.push({ name: this.titleCasePipe.transform(key), value: graphData[key.toLowerCase()], color: col.color });
          }
        }
      })
    })
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.title = {
      text: 'Workflows By Category',
      left: 'center',
      top: '5%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  executionSummaryWidgetData(): ExecutionsSummaryViewData {
    let view = new ExecutionsSummaryViewData();
    view.dropdownOptions = [
      { label: 'Last 7 Days', value: 'last_7_days' },
      { label: 'Last 30 Days', value: 'last_30_days' },
      { label: 'Last 60 Days', value: 'last_60_days' },
      { label: 'Last 90 Days', value: 'last_90_days' },
    ];
    view.defaultSelected = view.dropdownOptions.find(opt => opt.value == 'last_7_days').value;
    return view;
  }

  getExecutionSummaryWidgetData(from: string, to: string): Observable<OrchestrationSummaryExecutionType> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<OrchestrationSummaryExecutionType>('/orchestration/summary/execution_summary/', { params: params });
  }

  convertToExecutionByCounts(data: OrchestrationExecutionCountSummary): ExecutionsCountByStatusViewData {
    let view = new ExecutionsCountByStatusViewData();

    if (data.total) {
      view.successful = data.total.Success ? data.total.Success : 0;
      view.failed = data.total.Failed ? data.total.Failed : 0;
      view.inProgress = data.total['In Progress'] ? data.total['In Progress'] : 0;
      view.total = view.successful + view.failed + view.inProgress;
    }

    if (data.task) {
      view.successfulTasks = data.task.Success ? data.task.Success : 0;
      view.failedTasks = data.task.Failed ? data.task.Failed : 0;
      view.inProgressTasks = data.task['In Progress'] ? data.task['In Progress'] : 0;
      view.tasks = view.successfulTasks + view.failedTasks + view.inProgressTasks;
    }

    if (data.workflow) {
      view.successfulWorkflows = data.workflow.Success ? data.workflow.Success : 0;
      view.failedWorkflows = data.workflow.Failed ? data.workflow.Failed : 0;
      view.inProgressWorkflows = data.workflow['In Progress'] ? data.workflow['In Progress'] : 0;
      view.workflows = view.successfulWorkflows + view.failedWorkflows + view.inProgressWorkflows;
    }
    return view;
  }

  convertToExecutionByTypeChartData(data: OrchestrationSummaryExecutionType) {
    if (!data.execution_by_type || !data.execution_by_type.data || !data.execution_by_type.data.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    let xAxisData = this.getXAxisValueBasedOnFilter(data.execution_by_type.grouping);
    let data1: number[] = [];
    let data2: number[] = [];
    if (data.execution_by_type.data) {
      for (let i = 0; i < data.execution_by_type.data.length; i++) {
        for (let j = 0; j < xAxisData.length; j++) {
          let indexToPush = xAxisData.findIndex(ind => ind === data.execution_by_type.data[i].range);
          data1[indexToPush] = data.execution_by_type.data[i].task_counts;
          data2[indexToPush] = data.execution_by_type.data[i].workflow_counts;
        }
      }
    }
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getStackedBarChartOption();
    view.options.targetEntity = 'Execution';
    view.options.chartName = ChartNames.EXECUTIONS_BY_TYPE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      text: ChartNames.EXECUTIONS_BY_TYPE,
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.grid = {
      top: '15%'
    };
    view.options.xAxis = {
      data: xAxisData,
      axisLabel: {
        interval: 0,
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 10,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      },
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      }
    }
    view.options.series = [
      {
        name: 'Task',
        type: 'bar',
        stack: 'one',
        data: data1,
        barMaxWidth: 25,
        itemStyle: {
          color: '#4DB4F6'
        }
      },
      {
        name: 'Workflow',
        type: 'bar',
        stack: 'one',
        data: data2,
        barMaxWidth: 25,
        itemStyle: {
          color: '#7353D8'
        }
      }
    ];
    return view;
  }

  convertToAvgExecutionTimeData(d: OrchestrationSummaryExecutionType) {
    if (!d.execution_by_user || !d.execution_by_user.length) {
      return;
    }
    let data = d.average_workflow_percentage;
    let avgExecTimeViewData: OrchestrationSummaryAverageExecutionTimeType = {
      average_taskflow: { ...data.average_taskflow },
      average_workflow: { ...data.average_workflow }
    };
    avgExecTimeViewData.average_taskflow.avg_exec_time = this.formatDuration(data.average_taskflow.avg_exec_time);
    avgExecTimeViewData.average_workflow.avg_exec_time = this.formatDuration(data.average_workflow.avg_exec_time);
    return avgExecTimeViewData;
  }

  convertToExecutionByUserChartData(data: OrchestrationSummaryExecutionsByUserType[]) {
    if (!data || !data.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    let colors = ['#294680', '#00827F', '#376DF7', '#53B997', '#E883B9', '#F8C41', '#68B2FF', '#7A4388', '#6750AA', '#FC7E7E'];
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.options.targetEntity = 'Execution';
    view.options.chartName = ChartNames.EXECUTIONS_BY_USER;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let chartData: UnityChartDataType[] = [];
    data?.forEach((d, index1) => {
      if (d.count !== 0) {
        colors.forEach((val, index2) => {
          if (index1 === index2) {
            chartData.push({ name: d.username, value: d.count, color: val });
          }
        });
      }
    });
    chartData.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = chartData.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.title = {
      text: 'Executions by User',
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  executionsOverviewViewData(): ExecutionsOverviewViewData {
    let view = new ExecutionsOverviewViewData();
    view.dropdownOptions = [
      { label: 'Last 7 Days', value: 'last_7_days' },
      { label: 'Last 30 Days', value: 'last_30_days' },
      { label: 'Last 60 Days', value: 'last_60_days' },
      { label: 'Last 90 Days', value: 'last_90_days' },
    ];
    view.defaultSelected = view.dropdownOptions.find(opt => opt.value == 'last_7_days').value;
    return view;
  }

  getExecutionsOverviewData(from: string, to: string): Observable<ExecutionsOverview> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get(`/orchestration/summary/get_execution_bubble_data/`, { params: params }).pipe(
      map((res: ExecutionsOverview) => {
        res.execution_success_rate.success_data = res.execution_success_rate.success_data.filter(sd => sd.execution_duration >= 0);
        res.execution_success_rate.failure_data = res.execution_success_rate.failure_data.filter(sd => sd.execution_duration >= 0);
        res.execution_success_rate.success_data.sort((b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        res.execution_success_rate.failure_data.sort((b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        res.execution_efficiency.task_data = res.execution_efficiency.task_data.filter(td => td.avg_execution_duration >= 0);
        res.execution_efficiency.workflow_data = res.execution_efficiency.workflow_data.filter(td => td.avg_execution_duration >= 0);
        return res;
      }));
  }

  getBubbleSize(size: number) {
    if (size > 50) {
      return 50;
    } else if (size < 4) {
      return 15;
    }
  }

  secondsToTime(seconds: number): string {
    if (!seconds || seconds === 0) {
      return `0 secs`;
    }

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let timecode = '';

    if (days > 0) {
      timecode += `${days} ${days === 1 ? 'day' : 'days'}, `;
    }
    if (hours > 0 || days > 0) { // show hours if any days or hours
      timecode += `${hours} ${hours === 1 ? 'hr' : 'hrs'}, `;
    }
    if (minutes > 0 || hours > 0 || days > 0) { // show mins if any bigger unit exists or mins > 0
      timecode += `${minutes} ${minutes === 1 ? 'min' : 'mins'}, `;
    }

    timecode += `${seconds} ${seconds === 1 ? 'sec' : 'secs'}`;

    return timecode.trim();
  }



  convertToExecutionsBySuccessRateChartData(formData: any, data: ExecutionsBySuccessRate) {
    if (!data.success_data.length && !data.failure_data.length) {
      return null;
    }
    let successData: any[] = [];
    let failureData: any[] = [];
    data.success_data.map(d => {
      let sd: any[] = [];
      sd.push(d.created_at);
      sd.push(d.execution_duration);
      sd.push(d.host_size);
      sd.push(d.execution_id);
      sd.push('Success');
      successData.push(sd);
    })
    data.failure_data.map(d => {
      let fd: any[] = [];
      fd.push(d.created_at);
      fd.push(d.execution_duration);
      fd.push(d.host_size);
      fd.push(d.execution_id);
      fd.push('Failure');
      failureData.push(fd);
    })

    let view = new UnityChartDetails();
    view.options = this.chartConfigSvc.getScatterChartOptions();
    view.options.targetEntity = 'Execution';
    view.options.chartName = ChartNames.EXECUTIONS_BY_SUCCESS_RATE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.SCATTER);
    let title = 'Execution Success Rate';
    let subTitle = 'Execution Time (x-axis) Vs Execution Duration (y-axis) with Targets as bubble size';
    view.options.title = this.chartConfigSvc.setTitle(title, subTitle);
    view.options.title.left = null;

    view.options.grid = { top: '20%', bottom: '30%' };

    view.options.legend = <echarts.LegendComponentOption>view.options.legend;
    view.options.legend.left = null;
    view.options.legend.top = '5%';
    view.options.legend.right = '5%';
    view.options.legend.textStyle.fontSize = 13;

    view.options.xAxis = <XAXisOption>{
      type: 'time',
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 10,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR(),
        rotate: 45,
        hideOverlap: true,
        padding: [20, 0, 0, 0],
        formatter: function (value) {
          return echarts.time.format(value, '{MMM} {dd}, {yyyy}', false);
        },
      },
    }
    view.options.yAxis = <YAXisOption>view.options.yAxis;
    view.options.yAxis.axisLabel = {
      fontFamily: UNITY_FONT_FAMILY(),
      fontSize: 10,
      fontWeight: 500,
      color: UNITY_TEXT_DEFAULT_COLOR(),
      hideOverlap: true,
      formatter: function (value: number) {
        if (value > 86400) {
          const days = Math.floor(value / 86400); // Get the integer part of days
          return `${days} ${days == 1 ? 'day' : 'days'}`;
        } else if (value > 3600) {
          const hours = Math.floor(value / 3600); // Get the integer part of hours
          return `${hours} ${hours == 1 ? 'hr' : 'hrs'}`;
        } else if (value > 60) {
          const minutes = Math.floor(value / 60); //Get the integer part of minutes
          return `${minutes} ${minutes == 1 ? 'min' : 'mins'}`;
        } else {
          return `${value} secs`;
        }
      },
    }

    view.options.series = [
      {
        name: 'Success',
        type: 'scatter',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: successData,
        symbolSize: function (data) {
          return data[2] < 20 ? 20 : (data[2] > 50 ? 50 : data[2]);
        },
        itemStyle: {
          color: '#B7DD8D'
        },
        emphasis: {
          focus: 'series',
        },
      },
      {
        name: 'Failure',
        type: 'scatter',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: failureData,
        symbolSize: function (data) {
          return data[2] < 20 ? 20 : (data[2] > 50 ? 50 : data[2]);
        },
        itemStyle: {
          color: '#F7939F'
        },
        emphasis: {
          focus: 'series',
        },
      }
    ];

    view.options.dataZoom = this.chartConfigSvc.setDataZoom('both', 'right');
    view.options.dataZoom[0] = {
      ...view.options.dataZoom[0],
      labelFormatter: function (value, valueStr) {
        return echarts.time.format(value, '{MMM} {dd}, {yyyy}', false);
      }
    }
    view.options.dataZoom[1] = {
      ...view.options.dataZoom[1],
      labelFormatter: function (value, valueStr) {
        if (value > 86400) {
          const days = Math.floor(value / 86400); // Get the integer part of days
          return `${days} ${days == 1 ? 'day' : 'days'}`;
        } else if (value > 3600) {
          const hours = Math.floor(value / 3600); // Get the integer part of hours
          return `${hours} ${hours == 1 ? 'hr' : 'hrs'}`;
        } else if (value > 60) {
          const minutes = Math.floor(value / 60); //Get the integer part of minutes
          return `${minutes} ${minutes == 1 ? 'min' : 'mins'}`;
        } else {
          return `${value} secs`;
        }
      }
    }

    view.options.tooltip = {
      formatter: (params: any) => {
        return `${params.value[3]}<br>Status: ${params.value[4]}<br>Executed On: ${this.utilSvc.toUnityOneDateFormat(params.value[0])}<br>Duration: ${this.secondsToTime(params.value[1])}`;
      }
    };
    return view;
  }

  convertToExecutionsByEfficiencyChartData(formData: any, data: ExecutionsByEfficiency) {
    if (!data.task_data.length && !data.workflow_data.length) {
      return null;
    }
    let taskData: any[] = [];
    let workflowData: any[] = [];
    data.task_data.map(d => {
      let td: any[] = [];
      td.push(d.success_rate);
      td.push(d.avg_execution_duration);
      td.push(d.number_of_executions);
      td.push(d.name);
      td.push('Task');
      taskData.push(td);
    })
    data.workflow_data.map(d => {
      let td: any[] = [];
      td.push(d.success_rate);
      td.push(d.avg_execution_duration);
      td.push(d.number_of_executions);
      td.push(d.name);
      td.push('Workflow');
      workflowData.push(td);
    })

    let view = new UnityChartDetails();
    view.options = this.chartConfigSvc.getScatterChartOptions();
    view.options.targetEntity = 'Execution';
    view.options.chartName = ChartNames.EXECUTIONS_BY_EFFICIENCY;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.SCATTER);
    let title = 'Task/Workflow Efficiency';
    let subTitle = 'Success Rate (x-axis) Vs Avg Execution Duration (y-axis) with Executions Count as bubble size';
    view.options.title = this.chartConfigSvc.setTitle(title, subTitle);
    view.options.title.left = null;

    view.options.grid = { top: '20%' };

    view.options.legend = <echarts.LegendComponentOption>view.options.legend;
    view.options.legend.left = null;
    view.options.legend.top = '5%';
    view.options.legend.right = '5%';
    view.options.legend.textStyle.fontSize = 13;

    view.options.yAxis = <YAXisOption>view.options.yAxis;
    view.options.yAxis.axisLabel = {
      fontFamily: UNITY_FONT_FAMILY(),
      fontSize: 10,
      fontWeight: 500,
      color: UNITY_TEXT_DEFAULT_COLOR(),
      hideOverlap: true,
      formatter: function (value: number) {
        if (value > 86400) {
          const days = Math.floor(value / 86400); // Get the integer part of days
          return `${days} ${days == 1 ? 'day' : 'days'}`;
        } else if (value > 3600) {
          const hours = Math.floor(value / 3600); // Get the integer part of hours
          return `${hours} ${hours == 1 ? 'hr' : 'hrs'}`;
        } else if (value > 60) {
          const minutes = Math.floor(value / 60); //Get the integer part of minutes
          return `${minutes} ${minutes == 1 ? 'min' : 'mins'}`;
        } else {
          return `${value} secs`;
        }
      },
    }

    view.options.series = [
      {
        name: 'Task',
        type: 'scatter',
        data: taskData,
        symbolSize: function (data: number) {
          return data[2] < 20 ? 20 : (data[2] > 50 ? 50 : data[2]);
        },
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            {
              offset: 0,
              color: '#4DB4F6'
            },
            {
              offset: 1,
              color: '#4DB4F6'
            }
          ])
        },
        emphasis: {
          focus: 'series',
        },
      },
      {
        name: 'Workflow',
        type: 'scatter',
        data: workflowData,
        symbolSize: function (data) {
          return data[2] < 20 ? 20 : (data[2] > 50 ? 50 : data[2]);
        },
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            {
              offset: 0,
              color: '#7353D8'
            },
            {
              offset: 1,
              color: '#7353D8'
            }
          ])
        },
        emphasis: {
          focus: 'series',
        },
      }
    ]

    view.options.dataZoom = this.chartConfigSvc.setDataZoom('both', 'right');
    view.options.dataZoom[1] = {
      ...view.options.dataZoom[1],
      labelFormatter: function (value, valueStr) {
        if (value > 86400) {
          const days = Math.floor(value / 86400); // Get the integer part of days
          return `${days} ${days == 1 ? 'day' : 'days'}`;
        } else if (value > 3600) {
          const hours = Math.floor(value / 3600); // Get the integer part of hours
          return `${hours} ${hours == 1 ? 'hr' : 'hrs'}`;
        } else if (value > 60) {
          const minutes = Math.floor(value / 60); //Get the integer part of minutes
          return `${minutes} ${minutes == 1 ? 'min' : 'mins'}`;
        } else {
          return `${value} secs`;
        }
      }
    }

    view.options.tooltip = {
      formatter: (params: any) => {
        return `${params.value[4]} Name: ${params.value[3]}<br>Number of Executions: ${params.value[2]}<br>Avg Execution Time: ${this.secondsToTime(params.value[1])}<br>Success Rate: ${params.value[0]}`;
      }
    };
    return view;
  }

  getRecentFailureData(): Observable<OrchestrationRecentFailureExecutionsType[]> {
    return this.http.get<OrchestrationRecentFailureExecutionsType[]>('/orchestration/summary/get_failure_executions/');
  }

  convertToRecentFailureViewData(data: OrchestrationRecentFailureExecutionsType[]) {
    let viewData: RecentFailureViewModel[] = [];
    data.map(val => {
      let rf: RecentFailureViewModel = new RecentFailureViewModel();
      rf.id = val.run_id;
      rf.uuid = val.uuid;
      rf.target = val.target;
      rf.name = val.template_name;
      rf.type = val.type;
      rf.startedOn = val.start_time ? this.utilSvc.toUnityOneDateFormat(val.start_time) : 'NA';
      rf.executedBy = val.user;
      rf.taskOrWorkflowId = val.template_id;
      rf.targetType = val.target_type;
      rf.isAdvanced = val.is_advanced;
      viewData.push(rf);
    });
    return viewData;
  }

  getUpcomingExecutionData(): Observable<OrchestrationUpcomingExecutionsType[]> {
    return this.http.get<OrchestrationUpcomingExecutionsType[]>('/orchestration/summary/get_upcoming_executions/');
  }

  convertToUpcomingExecutionViewData(data: OrchestrationUpcomingExecutionsType[]) {
    let viewData: UpccomingExecutionViewModel[] = [];
    data.map(val => {
      let ue: UpccomingExecutionViewModel = new UpccomingExecutionViewModel();
      ue.name = val.name;
      ue.target = val.target;
      ue.category = val.category;
      ue.nextExecution = val.next_exec ? this.utilSvc.toUnityOneDateFormat(val.next_exec) : 'NA';
      ue.lastExecution = val.last_exec ? this.utilSvc.toUnityOneDateFormat(val.last_exec) : 'NA';
      ue.frequency = val.frequency;
      ue.taskOrWorkflowId = val.template_id;
      ue.type = val.type;
      ue.targetType = val.target_type;
      viewData.push(ue);
    });
    return viewData;
  }

  getXAxisValueBasedOnFilter(grouping: string) {
    if (grouping === 'month') {
      return this.chartConfigSvc.getMonths();
    } else if (grouping === 'days' || grouping === 'day') {
      return this.chartConfigSvc.getDays();
    } else if (grouping === 'week') {
      return this.chartConfigSvc.getweeksOfMonth();
    } else if (grouping === 'quarter') {
      let fromYear = this.dateRange?.from?.toString().split(' ')[3];
      let toYear = this.dateRange?.to?.toString().split(' ')[3];
      let quarterArr = [];
      if (Number(fromYear) === Number(toYear)) {
        this.chartConfigSvc.getQuarters().forEach(quarter => {
          quarterArr.push(`${quarter}-${fromYear}`);
        });
      } else {
        this.chartConfigSvc.getQuarters().forEach(quarter => {
          quarterArr.push(`${quarter}-${fromYear}`);
        });
        this.chartConfigSvc.getQuarters().forEach(quarter => {
          quarterArr.push(`${quarter}-${toYear}`);
        });
      }
      return quarterArr;
    }
  }

  formatDuration(dur: string) {
    let modifiedDuration;
    let initialDuration = dur?.split('.')[0];
    let initialDurArr = initialDuration?.split(':');
    if ((initialDurArr[0] === '00' || initialDurArr[0] === '0') && (initialDurArr[1] === '00' || initialDurArr[1] === '0')) {
      modifiedDuration = `${initialDurArr[2]}secs`;
    } else if ((initialDurArr[0] === '00' || initialDurArr[0] === '0') && (initialDurArr[1] !== '00' && initialDurArr[2] !== '00')) {
      modifiedDuration = `${initialDurArr[1]}min ${initialDurArr[2]}secs`;
    } else if ((initialDurArr[0] === '00' || initialDurArr[0] === '0') && (initialDurArr[1] === '00' && initialDurArr[2] === '00')) {
      modifiedDuration = `${initialDurArr[0]}hrs`;
    } else {
      modifiedDuration = `${initialDurArr[0]}hrs ${initialDurArr[1]}mins`;
    }
    return modifiedDuration;
  }
}

export class TaskWidgetViewData {
  loader: string = 'taskWidgetLoader';
  count: number = 0;
  byStatusChartData: UnityChartDetails;
  byTargetChartData: UnityChartDetails;
  byScriptTypeChartData: UnityChartDetails;
}

export class WorkflowWidgetViewData {
  loader: string = 'workflowWidgetLoader';
  count: number = 0;
  byStatusChartData: UnityChartDetails;
  byCategoryChartData: UnityChartDetails;
  byTargetTypeChartData: UnityChartDetails;
}

export class ExecutionsSummaryViewData {
  loader: string = 'executionSummaryWidgetLoader';
  dropdownOptions: CustomDateRangeType[];
  defaultSelected: string;
  formData: any;
  counts: ExecutionsCountByStatusViewData;
  avgExecutionTimeViewData: OrchestrationSummaryAverageExecutionTimeType;
  byTypeChartData?: UnityChartDetails;
  byUserChartData?: UnityChartDetails;
}
export class ExecutionsCountByStatusViewData {
  total: number = 0;
  successful: number = 0;
  failed: number = 0;
  inProgress: number = 0;

  tasks: number = 0;
  successfulTasks: number = 0;
  failedTasks: number = 0;
  inProgressTasks: number = 0;

  workflows: number = 0;
  successfulWorkflows: number = 0;
  failedWorkflows: number = 0;
  inProgressWorkflows: number = 0;
}

export class ExecutionsOverviewViewData {
  loader: string = 'executionsOverviewWidgetLoader';
  dropdownOptions: CustomDateRangeType[];
  defaultSelected: string;
  formData: any;
  successRateChartData?: UnityChartDetails;
  efficiencyChartData?: UnityChartDetails;
}

export class RecentFailureViewModel {
  id: string;
  uuid: string;
  target: string;
  name: string;
  type: string;
  startedOn: string;
  executedBy: string;
  taskOrWorkflowId: string;
  targetType: string;
  isAdvanced: boolean;
}

export class UpccomingExecutionViewModel {
  name: string;
  target: string;
  category: string;
  nextExecution: string;
  lastExecution: string;
  frequency: string;
  taskOrWorkflowId: string;
  type: string;
  targetType: string;
}

export enum PlaybookName {
  ANSIBLE = 'Ansible Playbook',
  TERRAFORM = 'Terraform Script',
  BASH = 'Bash Script',
  PYTHON = 'Python Script',
  POWERSHELL = 'Powershell Script',
  REST = 'Rest API'
}

export enum WorkflowCategory {
  PROVISIONING = 'Provisioning',
  OPERATIONAL = 'Operational',
  INTEGRATION = 'Integration',
  AGENTIC = 'Agentic'
}

export enum ChartNames {
  TASKS_BY_STATUS = 'Tasks By Status',
  TASKS_BY_TARGET = 'Tasks By Target',
  TASKS_BY_TYPE = 'Tasks By Type',
  WORKFLOWS_BY_STATUS = 'Workflows By Type',
  WORKFLOWS_BY_CATEGORY = 'Workflows By Category',
  EXECUTIONS_BY_TYPE = 'Executions By Type',
  EXECUTIONS_BY_USER = 'Executions By User',
  EXECUTIONS_BY_SUCCESS_RATE = 'Executions By Success Rate',
  EXECUTIONS_BY_EFFICIENCY = 'Executions By Efficiency',
}