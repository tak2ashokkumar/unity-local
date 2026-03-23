import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { CPUWidgetApiResponse, CPUWidgetType, FansWidgetApiResponse, FansWidgetType, MemoryWidgetApiResponse, PhysicalDiskWidgetApiResponse, PowerStatsWidgetApiResponse, serverHealthType, serverInfoType, TemperatureWidgetApiResponse, TemperatureWidgetType, VirtualDiskType } from './device-overview.type';
import { HttpClient } from '@angular/common/http';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { EChartsOption, SeriesOption } from 'echarts';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DEVICE_OVERVIEW_BY_CPU_DATA, DEVICE_OVERVIEW_BY_FAN_DATA, DEVICE_OVERVIEW_BY_HEALTH_SERVERS, DEVICE_OVERVIEW_BY_MEMORY_DATA, DEVICE_OVERVIEW_BY_PHYSICAL_DISKS_DATA, DEVICE_OVERVIEW_BY_POWER_STATS, DEVICE_OVERVIEW_BY_SERVER_INFO, DEVICE_OVERVIEW_BY_SYNC_CPU_DATA, DEVICE_OVERVIEW_BY_SYNC_FAN_DATA, DEVICE_OVERVIEW_BY_SYNC_MEMORY_DATA, DEVICE_OVERVIEW_BY_SYNC_PHYSICAL_DISKS_DATA, DEVICE_OVERVIEW_BY_SYNC_POWER_STATS, DEVICE_OVERVIEW_BY_SYNC_SERVER_INFO, DEVICE_OVERVIEW_BY_SYNC_TEMPERATURE_DATA, DEVICE_OVERVIEW_BY_SYNC_VIRTUAL_DISKS_DATA, DEVICE_OVERVIEW_BY_TEMPERATURE_DATA, DEVICE_OVERVIEW_BY_VIRTUAL_DISKS_DATA, SYNC_REDFISH_SYSTEM } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class DeviceOverviewService {

  constructor(private http: HttpClient, private chartConfigSvc: UnityChartConfigService, private tableService: TableApiServiceService) { }

  syncRedfishSystem(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(SYNC_REDFISH_SYSTEM(deviceType, deviceId));
  }

  getServerHealthtDetails(deviceType: DeviceMapping, deviceId: string): Observable<serverHealthType[]> {
    return this.http.get<serverHealthType[]>(DEVICE_OVERVIEW_BY_HEALTH_SERVERS(deviceType, deviceId));
  }

  getSyncServerInfo(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_SERVER_INFO(deviceType, deviceId));
  }

  getServerInfoDetails(deviceType: DeviceMapping, deviceId: string): Observable<serverInfoType[]> {
    return this.http.get<serverInfoType[]>(DEVICE_OVERVIEW_BY_SERVER_INFO(deviceType, deviceId));
  }

  getSyncFans(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_FAN_DATA(deviceType, deviceId));
  }

  getFanData(deviceType: DeviceMapping, deviceId: string): Observable<FansWidgetApiResponse> {
    return this.http.get<FansWidgetApiResponse>(DEVICE_OVERVIEW_BY_FAN_DATA(deviceType, deviceId));
  }

  getSyncPowerStatsData(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_POWER_STATS(deviceType, deviceId));
  }


  getPowerStatsData(deviceType: DeviceMapping, deviceId: string): Observable<PowerStatsWidgetApiResponse> {
    return this.http.get<PowerStatsWidgetApiResponse>(DEVICE_OVERVIEW_BY_POWER_STATS(deviceType, deviceId));
  }

  getSyncCPUData(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_CPU_DATA(deviceType, deviceId));
  }

  getCPUData(deviceType: DeviceMapping, deviceId: string): Observable<CPUWidgetApiResponse> {
    return this.http.get<CPUWidgetApiResponse>(DEVICE_OVERVIEW_BY_CPU_DATA(deviceType, deviceId));
  }

  getSyncMemoryData(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_MEMORY_DATA(deviceType, deviceId));
  }

  getMemoryData(deviceType: DeviceMapping, deviceId: string): Observable<MemoryWidgetApiResponse> {
    return this.http.get<MemoryWidgetApiResponse>(DEVICE_OVERVIEW_BY_MEMORY_DATA(deviceType, deviceId));
  }

  getSyncTemperatureData(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_TEMPERATURE_DATA(deviceType, deviceId));
  }

  getTemperatureData(deviceType: DeviceMapping, deviceId: string): Observable<TemperatureWidgetApiResponse> {
    return this.http.get<TemperatureWidgetApiResponse>(DEVICE_OVERVIEW_BY_TEMPERATURE_DATA(deviceType, deviceId));
  }

  getSyncPhysicalDiskData(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_PHYSICAL_DISKS_DATA(deviceType, deviceId));
  }

  getPhysicalDiskData(deviceType: DeviceMapping, deviceId: string): Observable<PhysicalDiskWidgetApiResponse> {
    return this.http.get<PhysicalDiskWidgetApiResponse>(DEVICE_OVERVIEW_BY_PHYSICAL_DISKS_DATA(deviceType, deviceId));
  }

  getSyncVirtualDiskData(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_VIRTUAL_DISKS_DATA(deviceType, deviceId));
  }

  getVirtualDiskData(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<VirtualDiskType>> {
    return this.tableService.getData<PaginatedResult<VirtualDiskType>>(DEVICE_OVERVIEW_BY_VIRTUAL_DISKS_DATA(deviceType, deviceId), criteria);
  }

  convertServerHealthListToViewData(data: serverHealthType[]) {
    let viewServerHealthData: serverHealthViewData[] = [];
    data.map(a => {
      let cvd: serverHealthViewData = new serverHealthViewData();
      // cvd.logo = a.logo && a.logo != '' ? `${environment.assetsUrl}${a.logo}` : null;
      cvd.name = a.name.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
      cvd.warning = a.warning;
      cvd.critical = a.critical;
      cvd.ok = a.ok;
      viewServerHealthData.push(cvd);
    });
    return viewServerHealthData;
  }

  convertServerInfoListToViewData(data: serverInfoType[]) {
    let viewServerInfoData: serverInfoViewData[] = [];
    data.map(a => {
      let cvd: serverInfoViewData = new serverInfoViewData();
      cvd.name = a.name ? a.name : 'N/A'
      cvd.status = a.status ? a.status : 'N/A'
      cvd.state = a.state ? a.state : 'N/A'
      cvd.manufacturer = a.manufacturer ? a.manufacturer : 'N/A'
      cvd.model = a.model ? a.model : 'N/A'
      cvd.biosVersion = a.bios_version ? a.bios_version : 'N/A'
      cvd.assetTag = a.asset_tag ? a.asset_tag : 'N/A'
      cvd.partNumber = a.part_number ? a.part_number : 'N/A'
      cvd.sku = a.sku ? a.sku : 'N/A'
      cvd.serialNumber = a.serial_number ? a.serial_number : 'N/A'
      cvd.systemType = a.system_type ? a.system_type : 'N/A'
      cvd.powerState = a.power_state ? a.power_state : 'N/A'
      viewServerInfoData.push(cvd);
    });
    return viewServerInfoData;
  }

  convertToFanReadingChartData(fanData: any[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();

    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.options.targetEntity = 'Fan';
    view.options.chartName = 'Fan Stats';
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const colors = ['#376DF7', '#53B997', '#6750AA', '#FFB020', '#FF4C61', '#18A0FB', '#F78410', '#7B61FF'];

    const data: UnityChartDataType[] = fanData.map((fan, index) => ({
      name: fan.name || `Fan ${index + 1}`,
      value: fan.reading ?? 0,
      color: colors[index % colors.length]
    }));

    data.sort((a, b) => Number(b.value) - Number(a.value));

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
    };

    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value} RPM`;
      }
    };

    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b}: {c} RPM ({d}%)',
    };

    return view;
  }

  convertToPowerStatsChartData(results: any[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    view.options = this.getLineChartOptions();

    if (results?.length) {
      const names: string[] = results.map(item => item.name);
      const values: number[][] = results.map(item => [item.output_wattage]);

      const chartSeries: SeriesOption[] = results.map(item => ({
        name: item.name,
        type: 'line',
        data: [item.output_wattage],
        smooth: true
      }));

      view.options.series = chartSeries;
      view.options.legend = {
        data: names,
        bottom: 0
      };
    }

    return view;
  }

  getLineChartOptions(): EChartsOption {
    return {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        // data: last7Days,
        axisLabel: {
          alignMaxLabel: 'right'
        }
      },
      yAxis: {
        type: 'value'
      },
      grid: {
        left: '1%',
        right: '3%',
        top: '5%',
        bottom: '10%',
        containLabel: true
      },
      series: [],
      legend: {}
    };
  }

  convertToCpuStatsBarChartData(cpuData: CPUWidgetType[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = {
      ...this.chartConfigSvc.getStackedBarChartOption(),
      barCategoryGap: '0%',
      barGap: '0%'
    };
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const names = cpuData.map(cpu => cpu.name);
    const speeds = cpuData.map(cpu => cpu.max_speed);
    const coreCounts = cpuData.map(cpu => cpu.total_core);

    view.options.xAxis = [
      {
        type: 'category',
        data: names,
        axisLabel: { color: '#333' },
      }
    ];

    view.options.yAxis = [
      {
        type: 'value',
        name: 'Speed (MHz)',
        position: 'left',
        axisLabel: {
          formatter: '{value}',
          color: '#333'
        }
      },
      {
        type: 'value',
        name: 'Core Count',
        position: 'right',
        axisLabel: {
          formatter: '{value}',
          color: '#007bff'
        }
      }
    ];

    view.options.series = [
      {
        name: 'Speed (MHz)',
        type: 'bar',
        data: speeds,
        barMaxWidth: '20%',
        yAxisIndex: 0,
        itemStyle: {
          color: '#66b3ff'
        }
      },
      {
        name: 'Total Cores',
        type: 'bar',
        data: coreCounts,
        barMaxWidth: '20%',
        yAxisIndex: 1,
        itemStyle: {
          color: '#007bff'
        }
      }
    ];

    view.options.tooltip = {
      trigger: 'item',
      formatter: '{a}<br/>{b}: {c}'
    };
    return view;
  }

  convertToMemoryChartData(MemoryData: any[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();

    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.options.targetEntity = 'Memory';
    view.options.chartName = 'Memory Attribute';
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const colors = ['#376DF7', '#53B997', '#6750AA', '#FFB020', '#FF4C61', '#18A0FB', '#F78410', '#7B61FF', '#2EC4B6', '#FF6B6B', '#FFD166', '#8338EC', '#3A86FF', '#06D6A0'];

    const data: UnityChartDataType[] = MemoryData.map((memory, index) => ({
      name: memory.name || `Memory ${index + 1}`,
      value: memory.speed ?? 0,
      color: colors[index % colors.length]
    }));

    data.sort((a, b) => Number(b.value) - Number(a.value));

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
    };

    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value} MHz (${params.percent}%)`;
      }
    };

    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b}: {c} MHz ({d}%)',
    };

    return view;
  }

  convertToTempStatsBarChartData(cpuData: TemperatureWidgetType[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = {
      ...this.chartConfigSvc.getStackedBarChartOption(),
      barCategoryGap: '0%',
      barGap: '0%'
    };
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const names = cpuData.map(cpu => cpu.name);
    const reading = cpuData.map(cpu => cpu.reading_celsius);
    const upperThresholdCritical = cpuData.map(cpu => cpu.upper_threshold_critical);
    const lowerThresholdWarning = cpuData.map(cpu => cpu.lower_threshold_warning);

    // Calculate max value across all three data arrays
    const maxVal = Math.max(
      ...reading,
      ...upperThresholdCritical,
      ...lowerThresholdWarning
    );

    view.options.xAxis = [
      {
        type: 'category',
        data: names,
        axisLabel: {
          color: '#333',
          interval: 0,
          rotate: 30,
          formatter: (value: string) => value.length > 10 ? value.slice(0, 10) + '…' : value // truncate long names
        }
      }
    ];

    view.options.yAxis = [
      {
        type: 'value',
        name: 'Temperature (°C)',
        position: 'left',
        axisLabel: {
          formatter: '{value}',
          color: '#333'
        },
        max: Math.ceil(maxVal / 10) * 10
      }
    ];

    view.options.series = [
      {
        name: 'Upper Threshold Critical',
        type: 'bar',
        data: upperThresholdCritical,
        barMaxWidth: '20%',
        yAxisIndex: 0,
        itemStyle: {
          color: '#fc8d07'
        }
      },
      {
        name: 'Current',
        type: 'bar',
        data: reading,
        barMaxWidth: '20%',
        yAxisIndex: 0,
        itemStyle: {
          color: '#0cbb74'
        }
      },
      {
        name: 'Lower Threshold Warning',
        type: 'bar',
        data: lowerThresholdWarning,
        barMaxWidth: '20%',
        yAxisIndex: 0,
        itemStyle: {
          color: '#d4041c'
        }
      }
    ];

    view.options.tooltip = {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}',
      axisPointer: {
        type: 'shadow'
      }
    };
    return view;
  }

  convertToPhysicalDiskChartData(MemoryData: any[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();

    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.options.targetEntity = 'Physical Disk';
    view.options.chartName = 'Physical Disk';
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const colors = ['#376DF7', '#53B997', '#6750AA', '#FFB020', '#FF4C61', '#18A0FB', '#F78410', '#7B61FF', '#2EC4B6', '#FF6B6B', '#FFD166', '#8338EC', '#3A86FF', '#06D6A0'];

    const data: UnityChartDataType[] = MemoryData.map((memory, index) => ({
      name: memory.name || `Physical Disk ${index + 1}`,
      value: memory.size ?? 0,
      color: colors[index % colors.length]
    }));

    data.sort((a, b) => Number(b.value) - Number(a.value));

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
    };

    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value} GB (${params.percent}%)`;
      }
    };

    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b}: {c} GB ({d}%)',
    };

    return view;
  }

  convertVirtualDiskListToViewData(data: VirtualDiskType[]) {
    let viewServerHealthData: virtualDiskViewData[] = [];
    data.forEach(a => {
      let cvd: virtualDiskViewData = new virtualDiskViewData();
      cvd.name = a.name ? a.name : 'N/A';
      cvd.state = a.state;
      cvd.status = a.status;
      cvd.diskType = a.disk_type;
      cvd.statusTooltip = a.status;
      cvd.stateTooltip = a.state;
      switch (a.status) {
        case 'OK':
          cvd.statusIcon = { icon: 'fa fa-info-circle', color: 'text-info' };
          break;
        case 'WARNING':
          cvd.statusIcon = { icon: 'fa fa-triangle-exclamation', color: 'text-warning' };
          break;
        case 'CRITICAL':
          cvd.statusIcon = { icon: 'fa fa-circle-exclamation', color: 'text-danger' };
          break;
      }

      switch (a.state) {
        case 'Enabled':
          cvd.stateIcon = { icon: 'fa fa-circle', color: 'text-success' };
          break;
        case 'Disabled':
          cvd.stateIcon = { icon: 'fa fa-circle', color: 'text-danger' };
          break;
      }
      viewServerHealthData.push(cvd);
    });
    return viewServerHealthData;
  }

}

export class serverHealthViewData {
  constructor() { }
  loader: 'serverHealthViewData';
  name: string;
  warning: number;
  critical: number;
  ok: number;
}

export class serverInfoViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
  odataId: string;
  status: string;
  state: string;
  deviceId: number;
  manufacturer: string;
  model: string;
  biosVersion: string | null;
  assetTag: string | null;
  partNumber: string;
  sku: string;
  serialNumber: string;
  systemType: string;
  powerState: string;
  contentType: number;
}

export class fansViewData {
  loader: string = 'fansWidgetLoader';
  count: number = 0;
  fanTypeChartData: UnityChartDetails;
}

export class powerStatsViewData {
  loader: string = 'powerStatsWidgetLoader';
  count: number = 0;
  fanTypeChartData: UnityChartDetails;
}

export class cpuStatsViewData {
  loader: string = 'cpuStatsWidgetLoader';
  count: number = 0;
  fanTypeChartData: UnityChartDetails;
}
export class memoryStatsViewData {
  loader: string = 'memoryStatsWidgetLoader';
  count: number = 0;
  fanTypeChartData: UnityChartDetails;
}
export class tempStatsViewData {
  loader: string = 'tempStatsWidgetLoader';
  count: number = 0;
  fanTypeChartData: UnityChartDetails;
}
export class physicalDiskStatsViewData {
  loader: string = 'physicalDiskStatsWidgetLoader';
  count: number = 0;
  fanTypeChartData: UnityChartDetails;
}
export class virtualDiskViewData {
  constructor() { }
  name: string;
  status: string;
  state: string;
  diskType: string;
  statusIcon?: { icon: string, color: string };
  stateIcon?: { icon: string, color: string };
  statusTooltip?: string;
  stateTooltip?: string;
}




