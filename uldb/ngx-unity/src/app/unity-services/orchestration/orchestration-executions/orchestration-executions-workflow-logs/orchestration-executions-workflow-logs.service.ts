import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ORCHESTRATION_AGENTIC_EXECUTION_WORKFLOWS, ORCHESTRATION_AGENTIC_EXECUTION_WORKFLOW_LOGS, ORCHESTRATION_EXECUTION_AGENTIC_WORKFLOW_OUTPUT, ORCHESTRATION_EXECUTION_WORKFLOWS, ORCHESTRATION_EXECUTION_WORKFLOW_LOGS, ORCHESTRATION_EXECUTION_WORKFLOW_OUTPUT } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AgenticWorkflowLogDetails, WorkflowLogDetails, WorkflowLogs, WorkflowOutputResponse } from './orchestration-executions-workflow-logs.type';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { ChartNames } from '../../orchestration-summary/orchestration-summary.service';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { TitleCasePipe } from '@angular/common';

@Injectable()
export class OrchestrationExecutionsWorkflowLogsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private titleCasePipe: TitleCasePipe
  ) { }

  getWorkflowDetails(workflowId: string, isAgentic: boolean): Observable<any> {
    if (isAgentic) {
      return this.http.get<any>(ORCHESTRATION_AGENTIC_EXECUTION_WORKFLOWS(workflowId));
    } else {
      return this.http.get<WorkflowLogDetails>(ORCHESTRATION_EXECUTION_WORKFLOWS(workflowId));
    }
  }

  converToWorkflowDetailsViewData(data: WorkflowLogDetails): WorkflowDetailsViewData {
    let viewData: WorkflowDetailsViewData = new WorkflowDetailsViewData();
    viewData.templateName = data.workflow_name;
    viewData.type = 'Workflow';
    viewData.startTime = data.start_time ? this.utilSvc.toUnityOneDateFormat(data.start_time) : 'NA';
    viewData.startDate = data.start_time ? data.start_time.split('T')[0] : '';
    viewData.endTime = data.end_time ? this.utilSvc.toUnityOneDateFormat(data.end_time) : 'NA';
    viewData.startedBy = data.user;
    viewData.duration = data.duration ? this.formatDuration(data.duration) : 'NA';
    viewData.status = data.execution_status;
    viewData.target = data.target_type;
    viewData.id = data.run_id;
    viewData.inputs = data.execution_inputs;
    return viewData;
  }

  converToAgenticWorkflowDetailsViewData(data: AgenticWorkflowLogDetails): WorkflowDetailsViewData {
    let viewData: WorkflowDetailsViewData = new WorkflowDetailsViewData();
    console.log('data', data)
    viewData.templateName = data.workflow_name;
    viewData.type = 'Workflow';
    viewData.startTime = data.start_time ? this.utilSvc.toUnityOneDateFormat(data.start_time) : 'NA';
    viewData.startDate = data.start_time ? data.start_time.split('T')[0] : '';
    viewData.endTime = data.end_time ? this.utilSvc.toUnityOneDateFormat(data.end_time) : 'NA';
    viewData.startedBy = data.executed_by;
    viewData.duration = data.duration ? this.formatDuration(data.duration) : 'NA';
    viewData.id = data.run_id;
    viewData.status = data.status;
    // viewData.target = data.target_type;
    // viewData.inputs = data.execution_inputs;
    return viewData;
  }

  convertToWorkflowTaskViewList(data: WorkflowLogDetails): WorkflowTaskViewData[] {
    const tasks = data.tasks_execution || [];

    // Filter out Start (task_1) and End (task_2) tasks
    const filteredTasks = tasks.filter(task =>
      task.name_id !== 'task_1' && task.name_id !== 'task_2'
    );

    // Sort by numeric value extracted from 'task_3', 'task_4', etc.
    filteredTasks.sort((a, b) => {
      const numA = parseInt(a.name_id.replace('task_', ''), 10);
      const numB = parseInt(b.name_id.replace('task_', ''), 10);
      return numA - numB;
    });

    // Map to view model
    return filteredTasks.map(task => {
      const viewItem = new WorkflowTaskViewData();
      viewItem.name = task.name;
      viewItem.status = task.execution_status;
      viewItem.startTime = task.start_time ? this.utilSvc.toUnityOneDateFormat(task.start_time) : 'NA';
      viewItem.startDate = task.start_time ? task.start_time.split('T')[0] : '';
      viewItem.endTime = task.end_time ? this.utilSvc.toUnityOneDateFormat(task.end_time) : 'NA';
      viewItem.endDate = task.end_time ? task.end_time.split('T')[0] : '';
      viewItem.duration = task.duration ? this.formatDuration(task.duration) : 'NA';
      viewItem.inputs = task.execution_inputs;
      // viewItem.statusColor = task.execution_status == 'Success' ? 'text-success' : 'text-danger';
      if (task.execution_status === 'Success') {
        viewItem.statusColor = 'text-success';
      } else if (task.execution_status === 'Queued') {
        viewItem.statusColor = 'text-muted';
      } else {
        viewItem.statusColor = 'text-danger';
      }
      return viewItem;
    });
  }

  convertToAgenticWorkflowTaskViewList(data: AgenticWorkflowLogDetails): WorkflowTaskViewData[] {
    const nodes = data.nodes_execution || [];

    // Sort by node_id (numeric, so direct compare is fine)
    nodes.sort((a, b) => a.node_id - b.node_id);

    // Map to view model
    return nodes.map(node => {
      const viewItem = new WorkflowTaskViewData();
      viewItem.name = node.name;
      viewItem.status = node.status;
      viewItem.startTime = node.start_time ? this.utilSvc.toUnityOneDateFormat(node.start_time) : 'NA';
      viewItem.startDate = node.start_time ? node.start_time.split('T')[0] : '';
      viewItem.endTime = node.end_time ? this.utilSvc.toUnityOneDateFormat(node.end_time) : 'NA';
      viewItem.endDate = node.end_time ? node.end_time.split('T')[0] : '';
      viewItem.duration = node.duration ? this.formatDuration(node.duration) : 'NA';
      viewItem.inputs = node.inputs;
      viewItem.nodeId = node.node_id;

      // Status colors like non-agentic
      if (node.status === 'Success') {
        viewItem.statusColor = 'text-success';
      } else if (node.status === 'Queued') {
        viewItem.statusColor = 'text-muted';
      } else if (node.status === 'Running') {
        viewItem.statusColor = 'text-primary';
      } else if (node.status === 'Skipped') {
        viewItem.statusColor = 'text-warning';
      } else {
        viewItem.statusColor = 'text-danger';
      }

      return viewItem;
    });
  }



  formatDuration(dur: string) {
    let modifiedDuration;
    let initialDuration = dur?.split('.')[0];
    let initialDurArr = initialDuration?.split(':');
    if (initialDurArr[0] === '00' && initialDurArr[1] === '00') {
      modifiedDuration = `${initialDurArr[2]} secs`;
    } else if (initialDurArr[0] === '00' && (initialDurArr[1] !== '00' && initialDurArr[2] !== '00')) {
      modifiedDuration = `${initialDurArr[1]} min ${initialDurArr[2]} secs`;
    } else if (initialDurArr[0] !== '00' && (initialDurArr[1] === '00' && initialDurArr[2] === '00')) {
      modifiedDuration = `${initialDurArr[0]} hours`;
    } else if (initialDurArr[0] !== '00' && (initialDurArr[1] !== '00' && initialDurArr[2] === '00')) {
      modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins`;
    } else {
      modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins ${initialDurArr[2]} secs`;
    }
    return modifiedDuration;
  }

  getExecutionLogs(workflowId: string, is_agentic: boolean): Observable<WorkflowLogs> {
    if (is_agentic) {
      return this.http.get<WorkflowLogs>(ORCHESTRATION_AGENTIC_EXECUTION_WORKFLOW_LOGS(workflowId));
    } else {
      return this.http.get<WorkflowLogs>(ORCHESTRATION_EXECUTION_WORKFLOW_LOGS(workflowId));
    }
  }

  convertToExecutionLogViewData(data: WorkflowLogs): WorkflowLogsViewData {
    let viewData: WorkflowLogsViewData = new WorkflowLogsViewData();
    viewData.executionLog = data.execution_log;
    return viewData;
  }

  getOutputDetails(workflowId: string, isAgentic: boolean): Observable<WorkflowOutputResponse[]> {
    if (isAgentic) {
      return this.http.get<WorkflowOutputResponse[]>(ORCHESTRATION_EXECUTION_AGENTIC_WORKFLOW_OUTPUT(workflowId));
    } else {
      return this.http.get<WorkflowOutputResponse[]>(ORCHESTRATION_EXECUTION_WORKFLOW_OUTPUT(workflowId));
    }
  }

  covertToOutputViewData(data: WorkflowOutputResponse[]): WorkflowOutputViewData[] {
    let viewData: WorkflowOutputViewData[] = [];
    data.forEach(d => {
      let view: WorkflowOutputViewData = new WorkflowOutputViewData()
      view.executionStatus = d?.execution_status;
      // if (d.type === 'Chart Task') {
      //   view.output = JSON.parse(d.output.replaceAll("'", "\""));
      // } else {
      view.output = d.output;
      // }
      view.taskName = d.task_name;
      view.type = d.type;
      view.id = d.id;
      viewData.push(view);
    });
    return viewData;
  }

  convertToBarChartData(data) {
    if (!data.execution_by_type || !data.execution_by_type.data || !data.execution_by_type.data.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    let xAxisData = data.x_values;
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getStackedBarChartOption();
    view.options.targetEntity = 'Execution';
    // view.options.chartName = 'User'
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      // text: ChartNames.EXECUTIONS_BY_TYPE,
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
      name: data.x_label,
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
        name: data.y_label,
        type: 'bar',
        stack: 'one',
        data: data.y_values,
        barMaxWidth: 25,
        itemStyle: {
          color: '#4DB4F6'
        }
      },
    ];
    return view;
  }

  convertToPieChartData(graphData) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.options.targetEntity = 'Workflow';
    view.options.chartName = ChartNames.WORKFLOWS_BY_CATEGORY;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData.x_values.forEach((x, i) => {
      // graphData.y_values.forEach(y, => {
      data.push({ name: x, value: graphData.y_values[i] });
      // });
    });
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.title = {
      // text: 'Workflows By Category',
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

  convertToLineChartData(graphData) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.getLineChartOptions();
    view.options.targetEntity = 'Workflow';
    view.options.chartName = ChartNames.WORKFLOWS_BY_CATEGORY;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const xAxisData = graphData.x_values;
    const seriesData = graphData.y_values;

    const xLabel = graphData.x_label;
    const yLabel = graphData.y_label;

    view.options.xAxis = {
      type: 'category',
      data: xAxisData,
      name: xLabel,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      },
      nameTextStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };

    view.options.yAxis = {
      type: 'value',
      name: yLabel,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      },
      nameTextStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };

    view.options.series = [{
      name: xLabel,
      type: 'line',
      data: seriesData,
      smooth: true,
      lineStyle: {
        width: 2
      },
      itemStyle: {
        color: '#3398DB'
      }
    }];

    view.options.tooltip = {
      trigger: 'axis',
      formatter: `{b} <br/> ${yLabel}: {c}`
    };

    view.options.legend = {
      show: true,
      top: 'bottom',
      data: yLabel,
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };

    return view;
  }

  convertToAreaChartData(graphData) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.getLineChartOptions();
    view.options.targetEntity = 'Workflow';
    view.options.chartName = ChartNames.WORKFLOWS_BY_CATEGORY;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const xAxisData = graphData.x_values;
    const seriesData = graphData.y_values;
    const xLabel = graphData.x_label;
    const yLabel = graphData.y_label;

    view.options.xAxis = {
      type: 'category',
      data: xAxisData,
      name: xLabel,
      nameLocation: 'middle',
      nameGap: 30,
      boundaryGap: false,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      },
      nameTextStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };

    view.options.yAxis = {
      type: 'value',
      name: yLabel,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      },
      nameTextStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };

    view.options.series = [{
      name: xLabel,
      type: 'line',
      data: seriesData,
      smooth: true,
      lineStyle: {
        width: 2
      },
      areaStyle: {
        opacity: 0.4
      },
      itemStyle: {
        color: '#3398DB'
      }
    }];

    view.options.tooltip = {
      trigger: 'axis',
      formatter: `{b} <br/> ${yLabel}: {c}`
    };

    view.options.legend = {
      show: true,
      top: 'bottom',
      data: [yLabel],
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };

    return view;
  }

  getLineChartOptions(): any {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Line Chart',
        },
      },
    };
  }
}

export class WorkflowDetailsViewData {
  constructor() { }
  templateName: string;
  type: string;
  startTime: string;
  startDate: string;
  endTime: string;
  startedBy: string | number;
  duration: string;
  status: string;
  target: string;
  id: string;
  inputs?: any;
}

export class WorkflowLogsViewData {
  constructor() { }
  executionLog: string;
}

export class WorkflowOutputViewData {
  constructor() { }
  executionStatus: string;
  output: any;
  taskName: string;
  type: string;
  id: number;
}

export class WorkflowTaskViewData {
  constructor() { }
  name!: string;
  status!: string;
  startTime: string;
  endTime: string;
  duration: string;
  statusColor: string;
  inputs?: any;
  startDate: string;
  endDate: string;
  nodeId: number;
}
