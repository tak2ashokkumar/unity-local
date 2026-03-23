import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, QueryList, Renderer2, SimpleChanges, ViewChildren } from '@angular/core';
import { CustomDashboardCrudService, chartDefaultColors, metricTypes } from 'src/app/united-view/custom-dashboard/custom-dashboard-crud/custom-dashboard-crud.service';
import { GraphViewData, MetricesMappingViewData, NetworkTrafficViewData } from 'src/app/united-view/custom-dashboard/custom-dashboard.service';
import { GraphDataType, WidgetDataType } from 'src/app/united-view/custom-dashboard/custom-dashboard.type';
import { FaIconMapping } from '../app-utility/app-utility.service';
import { UnityChartData } from '../chart-config.service';
import { SharedGraphService } from './shared-graph.service';

@Component({
  selector: 'shared-graph',
  templateUrl: './shared-graph.component.html',
  styleUrls: ['./shared-graph.component.scss'],
  providers: [SharedGraphService, CustomDashboardCrudService]
})
export class SharedGraphComponent implements OnInit, OnChanges, AfterViewInit {

  widgetFor: string = '';
  groupBy: string = '';
  graphData: any[] = [];
  previewWidgetType: string = '';
  chartViewData: UnityChartData = new UnityChartData();
  chartLengendData: GraphViewData[] | string[] = [];
  tableViewData: GraphViewData[] | NetworkTrafficViewData[] | MetricesMappingViewData[] = [];
  columns: string[] = [];
  utilizationTypeFilter: string = '';
  utilizationTypeList: string[] = [];
  isUtilization: boolean = false;
  chartColors = [...chartDefaultColors].reverse();
  dHeight: number = 210;

  @Input('data') widgetData: WidgetDataType;

  @ViewChildren('hideTooltip') hideTooltips: QueryList<ElementRef>;

  constructor(private crudService: CustomDashboardCrudService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.widgetFor = this.widgetData.widget_type;
    this.groupBy = this.widgetData.group_by;
    this.graphData = this.widgetData.data;
    this.createGraph();
    if (this.widgetData.period && this.widgetData.period == 'last' &&
      (this.widgetData.graph_type == 'cpu' || this.widgetData.graph_type == 'memory' || this.widgetData.graph_type == 'storage')) {
      this.getUtilizationTypes();
      this.isUtilization = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes != null) {
      this.widgetFor = this.widgetData.widget_type;
      this.groupBy = this.widgetData.group_by;
      this.graphData = this.widgetData.data;
      this.createGraph();
    }
  }

  ngAfterViewInit() {
    this.customTooltipHide();
  }

  customTooltipHide() {
    if (this.widgetData.data) {
      this.hideTooltips.forEach((tooltip: ElementRef) => {
        const nativeElement = tooltip.nativeElement;
        if (nativeElement.scrollWidth > nativeElement.clientWidth) {
          this.renderer.removeClass(nativeElement.parentNode, 'custom-tooltip-hide');
        } else {
          this.renderer.addClass(nativeElement.parentNode, 'custom-tooltip-hide');
        }
      });
    }
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  getUtilizationTypes() {
    if (this.widgetData.data.length) {
      this.utilizationTypeList = [...new Set(this.widgetData.data.map(data => data.type))];
      this.utilizationTypeFilter = this.utilizationTypeList.getFirst();
      this.graphData = (this.widgetData.data as GraphDataType[]).filter(data => data.type == this.utilizationTypeFilter);
      this.chartViewData = this.crudService.convertToLineChartData(this.graphData, false, this.widgetData.metrics_network_data);
    }
  }

  onFilterChange() {
    if (this.widgetData.data.length) {
      this.graphData = (this.widgetData.data as GraphDataType[]).filter(data => data.type == this.utilizationTypeFilter);
      this.chartViewData = this.crudService.convertToLineChartData(this.graphData, false, this.widgetData.metrics_network_data);
    }
  }

  createGraph() {
    this.chartViewData = null;
    this.chartLengendData = null;
    this.tableViewData = [];
    this.columns = [];
    this.previewWidgetType = '';
    switch (this.widgetFor) {
      case 'host_availability':
        this.createHostGraphs()
        break;
      case 'cloud':
        this.createCloudGraphs()
        break;
      case 'infra_summary':
        this.createInfrasummaryGraphs()
        break;
      case 'cloud_cost':
        this.createCloudCostGraphs()
        break;
      case 'alerts':
        this.createAlertsGraphs()
        break;
      case 'sustainability':
        this.createSustainabilityGraphs()
        break;
      case 'metrices':
        this.createMetricsGraphs()
        break;
      case 'device_by_os':
        this.createOsTypeGraphs()
        break;
    }
  }

  createHostGraphs() {
    switch (this.groupBy) {
      case 'device_type':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(this.graphData);
        this.chartLengendData = this.graphData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(this.graphData);
        this.chartLengendData = this.graphData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(this.graphData);
        this.chartLengendData = this.graphData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
      case 'status':
        this.chartViewData = this.crudService.convertHostAvailabilityStatusGraphData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'tags':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(this.graphData);
        this.chartLengendData = this.graphData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
    }
  }

  createCloudGraphs() {
    switch (this.groupBy) {
      case 'tags':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'locations':
        this.tableViewData = this.crudService.convertToTableData(this.graphData);
        this.previewWidgetType = 'table';
        this.columns = ['Location', 'Count'];
        break;
      case 'regions':
        this.tableViewData = this.crudService.convertToTableData(this.graphData);
        this.previewWidgetType = 'table';
        this.columns = ['Region Name', 'Resources'];
        break;
      case 'resource_types':
        this.tableViewData = this.crudService.convertToTableData(this.graphData);
        this.previewWidgetType = 'table';
        this.columns = ['Resource Name', 'Count'];
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
    }
  }

  createInfrasummaryGraphs() {
    switch (this.groupBy) {
      case 'device_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, null, 'doughnut', null, true);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'tags':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
    }
  }

  createCloudCostGraphs() {
    let unitConfig = { unit: '$', position: 'left' };
    switch (this.groupBy) {
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, unitConfig);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'account_name':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, unitConfig);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'regions':
        this.tableViewData = this.crudService.convertToTableData(this.graphData);
        this.previewWidgetType = 'table';
        this.columns = ['Region Name', 'Cost($)'];
        break;
      case 'service':
        this.tableViewData = this.crudService.convertToTableData(this.graphData);
        this.previewWidgetType = 'table';
        this.columns = ['Service Name', 'Cost($)'];
        break;
    }
  }

  createAlertsGraphs() {
    switch (this.groupBy) {
      case 'alert_source':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'severity':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, null, 'doughnut', true);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'device_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'status':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, null, 'pie');
        this.previewWidgetType = 'responsiveDonutChart';
        break;
    }
  }

  createSustainabilityGraphs() {
    let unitConfig = { unit: 'Tco2e', position: 'right' };
    switch (this.groupBy) {
      case 'device_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, unitConfig);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, unitConfig);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, unitConfig);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'tags':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData, unitConfig);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
    }
  }

  onDeviceSelect(index: number){
    (this.tableViewData[index] as MetricesMappingViewData).isSelected = !(this.tableViewData[index] as MetricesMappingViewData).isSelected;
    this.cdr.detectChanges();
    this.customTooltipHide();
  }

  createMetricsGraphs() {
    if (this.widgetData.period == 'latest') {
      switch (this.widgetData.graph_type) {
        case 'cpu':
          this.tableViewData = this.crudService.convertToTableData(this.graphData);
          this.previewWidgetType = 'metrices';
          this.columns = ['Host', 'Name', 'CPU Utilization'];
          break;
        case 'memory':
          this.tableViewData = this.crudService.convertToTableData(this.graphData);
          this.previewWidgetType = 'metrices';
          this.columns = ['Host', 'Name', 'Memory Utilization'];
          break;
        case 'storage':
          this.tableViewData = this.crudService.convertToTableData(this.graphData);
          this.previewWidgetType = 'storageMetric';
          this.columns = ['Host', 'Disk', 'Storage Utilization'];
          break;
        case 'network':
          if (this.widgetData.metrics_network_data && this.widgetData.network_group_by == 'interfaces') {
            this.tableViewData = this.crudService.convertToTrafficHostTableData(this.graphData, this.widgetData.network_group_by);
            this.previewWidgetType = 'networkInterfacesTable';
            this.columns = ['Interface Name', 'Host', metricTypes.find(m => m.name == this.widgetData.metrics_network_data).displayName];
          } else if (this.widgetData.metrics_network_data && this.widgetData.network_group_by == 'devices') {
            this.previewWidgetType = 'networkDevicesTable';
            if (this.widgetData.metrics_network_data == 'bandwidth') {
              this.tableViewData = this.crudService.convertToTrafficHostTableData(this.graphData, this.widgetData.network_group_by, true);
              this.previewWidgetType = 'bandwidthUtilization';
              this.columns = ['Name', 'Bandwidth Utilization'];
            } else {
              this.tableViewData = this.crudService.convertToTrafficHostTableData(this.graphData, this.widgetData.network_group_by);
              this.columns = ['Name', metricTypes.find(m => m.name == this.widgetData.metrics_network_data).displayName];
            }
          }
          break;
      }
      if (this.widgetData.filter_by == 'metric') {
        this.previewWidgetType = 'metricesMapping';
        this.tableViewData = this.crudService.convertToMetricesMappingData(this.widgetData.data, true);
      }
    } else if (this.widgetData.period == 'last') {
      switch (this.widgetData.graph_type) {
        case 'cpu':
          this.chartViewData = this.crudService.convertToLineChartData(this.graphData);
          this.previewWidgetType = 'metricesChart';
          break;
        case 'memory':
          this.chartViewData = this.crudService.convertToLineChartData(this.graphData);
          this.previewWidgetType = 'metricesChart';
          break;
        case 'storage':
          this.chartViewData = this.crudService.convertToLineChartData(this.graphData);
          this.previewWidgetType = 'metricesChart';
          break;
        case 'network':
          this.chartViewData = this.crudService.convertToLineChartData(this.graphData, false, this.widgetData.metrics_network_data);
          this.previewWidgetType = 'metricesChart';
          break;
      }
    }
  }

  createOsTypeGraphs() {
    switch (this.groupBy) {
      case 'os_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
      case 'os_version':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(this.graphData);
        this.previewWidgetType = 'responsiveDonutChart';
        break;
    }
  }

  getDeviceIcon(device: string) {
    switch (device) {
      case 'switch': return `${FaIconMapping.SWITCH} switches`;
      case 'firewall': return `${FaIconMapping.FIREWALL} firewalls`;
      case 'load_balancer': return `${FaIconMapping.LOAD_BALANCER} lbs`;
      case 'hypervisor': return `${FaIconMapping.HYPERVISOR} hypervisor`;
      case 'bm_server': return `${FaIconMapping.BARE_METAL_SERVER} bms`;
      case 'storage_device': return `${FaIconMapping.STORAGE_DEVICE} storage`;
      case 'mac_device': return `${FaIconMapping.MAC_MINI} mac devices`;
      case 'customdevice': return `${FaIconMapping.OTHER_DEVICES} otherdev`;
      case 'custom_vm': return `${FaIconMapping.VIRTUAL_MACHINE} vms`;
      case 'PDU': return `${FaIconMapping.PDU} pdus`;
      case 'URL': return `${FaIconMapping.URL} text-primary`;
      case 'VM': return `${FaIconMapping.VIRTUAL_MACHINE} vms`;
      case 'cabinet': return `${FaIconMapping.CABINET} cabinets`;
      case 'pod': return `${FaIconMapping.KUBERNETES}`;
      default: return '';
    }
  }

  getDevicDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'bm_server': return 'Bare Metal';
      case 'vm': return 'VM';
      case 'storage_device': return 'Storage';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      case 'pdu': return 'PDU';
      case 'cabinet': return 'Cabinet';
      default: return deviceType;
    }
  }

  getSize(len?: number) {
    return len < 6 ? 40 : len < 12 ? 80 : len < 20 ? 130 : 250;
  }

  getPercentageClass(value: number): string {
    return value < 65 ? 'text-success' : value >= 65 && value < 85 ? 'text-warning' : 'text-danger';
  }

  getMetricsLegendColor(index: number) {
    return this.chartColors[index];
  }
}