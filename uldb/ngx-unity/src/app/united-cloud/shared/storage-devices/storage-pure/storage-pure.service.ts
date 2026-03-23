import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { FileSizeConversionPipe } from 'src/app/shared/pipes';
import { PureStorageArray, PureStorageGraphData, PureStorageGraphDataAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { ECHARTCOLORS, UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class StoragePureService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private fileSize: FileSizeConversionPipe,
    private appService: AppLevelService,) { }

  getDeviceSummary(deviceId: string): Observable<PureStorageGraphData> {
    return this.http.get<PureStorageGraphData>(`/customer/pure_storage/${deviceId}/graph_data/`);
  }

  convertToSummaryChartData(data: PureStorageGraphData): UnityChartDetails {
    if (!data) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultDonutChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.legend = { show: false };
    view.options.tooltip = Object.assign(view.options.tooltip, { formatter: '{b} : {c} ({d}%)' })

    let volumes = Number(this.fileSize.transform(data.volumes, 'TB').split(' ')[0]);
    let snapshots = Number(this.fileSize.transform(data.snapshots, 'TB').split(' ')[0]);
    let shared = Number(this.fileSize.transform(data.shared, 'TB').split(' ')[0]);
    let system = Number(this.fileSize.transform(data.system, 'TB').split(' ')[0]);
    let empty = Number(this.fileSize.transform(data.empty, 'TB').split(' ')[0]);

    let seriesData = [];
    seriesData.push({ name: 'Volumes', value: volumes ? volumes : 0, itemStyle: { color: ComponentColor.VOLUMES } });
    seriesData.push({ name: 'Snapshots', value: snapshots ? snapshots : 0, itemStyle: { color: ComponentColor.SNAPSHOTS } });
    seriesData.push({ name: 'Shared', value: shared ? shared : 0, itemStyle: { color: ComponentColor.SHARED } });
    seriesData.push({ name: 'System', value: system ? system : 0, itemStyle: { color: ComponentColor.SYSTEM } });
    seriesData.push({ name: 'Empty', value: empty ? empty : 0, itemStyle: { color: ComponentColor.EMPTY } });
    seriesData.sort((a, b) => a.value - b.value);
    view.options.series = this.chartConfigSvc.setSeriesByChartType(UnityChartTypes.NIGHTINGALE);
    view.options.series = Object.assign(view.options.series, { radius: ['50%', '80%'] }, { label: { show: false } }, { data: seriesData });
    view.options.graphic = {
      type: 'text',
      left: 'center',
      top: '40%',
      style: {
        text: `${data.used_perc}%`,
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#333',
      },
    };
    return view;
  }

  getArrayData(deviceId: string): Observable<PureStorageArray[]> {
    return this.http.get<PureStorageArray[]>(`/customer/pure_storage/${deviceId}/array/`);
  }

  getArrayComponentChartData(data: PureStorageGraphDataAttr) {
    if (!data) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultDonutChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.tooltip = Object.assign(view.options.tooltip, { formatter: '{b} : {d}%' });

    let seriesData = [];
    seriesData.push({ name: 'Volumes', value: data.components?.volumes_perc, itemStyle: { color: ComponentColor.VOLUMES }, label: { show: data.components?.volumes_perc ? true : false }, });
    seriesData.push({ name: 'Snapshots', value: data.components?.snapshots_perc, itemStyle: { color: ComponentColor.SNAPSHOTS }, label: { show: data.components?.snapshots_perc ? true : false }, });
    seriesData.push({ name: 'Shared', value: data.components?.shared_perc, itemStyle: { color: ComponentColor.SHARED }, label: { show: data.components?.shared_perc ? true : false }, });
    seriesData.push({ name: 'System', value: data.components?.system_perc, itemStyle: { color: ComponentColor.SYSTEM }, label: { show: data.components?.system_perc ? true : false }, });
    seriesData.push({ name: 'Empty', value: data.free_perc, itemStyle: { color: ComponentColor.EMPTY }, label: { show: data.free_perc ? true : false }, });
    seriesData.sort((a, b) => a.value - b.value);
    view.options.series = this.chartConfigSvc.setSeriesByChartType(UnityChartTypes.NIGHTINGALE);
    view.options.series = Object.assign(view.options.series, { radius: [60, 110] }, { data: seriesData }, { label: { formatter: `{d}%` } });
    view.options.graphic = {
      type: 'text',
      left: 'center',
      top: '40%',
      style: {
        text: `Used \n ${data.occupied_perc}%`,
        fontSize: 20,
        fontWeight: 'bold',
        fill: '#333',
      },
    };
    return view;
  }
}

export class SummaryData {
  size: string;
  volume: string;
  shared: string;
  total: string;
  datareduction: string;
  snapshots: string;
  system: string;
  chartData: UnityChartDetails;
}

export enum ComponentColor {
  VOLUMES = '#378ADB',
  SNAPSHOTS = '#004581',
  SHARED = '#0CBB70',
  SYSTEM = '#EDCE3E',
  EMPTY = '#CC0000'
}
