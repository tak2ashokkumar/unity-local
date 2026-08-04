import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GET_NETWORK_DASHBOARD_FILTERS,
  GET_NETWORK_DASHBOARD_OVERVIEW,
  GET_NETWORK_DASHBOARD_TOP_10_CONVERSATIONS,
  GET_NETWORK_DASHBOARD_TOP_BANDWIDTH_USAGE,
  GET_NETWORK_DASHBOARD_TOP_BITS_RECEIVED,
  GET_NETWORK_DASHBOARD_TOP_BITS_SENT,
  GET_NETWORK_DASHBOARD_PERFORMANCE_INSIGHTS,
  GET_NETWORK_DASHBOARD_CPU_VS_MEMORY_PERFORMANCE,
  GET_NETWORK_DASHBOARD_TRAFFIC_IN_VS_OUT,
  GET_NETWORK_DASHBOARD_INTERFACE_HEALTH_AND_METRICS,
  GET_NETWORK_DASHBOARD_INTERFACE_ERRORS_INBOUND,
  GET_NETWORK_DASHBOARD_INTERFACE_ERRORS_OUTBOUND,
  GET_NETWORK_DASHBOARD_INTERFACE_DISCARDS_INBOUND,
  GET_NETWORK_DASHBOARD_INTERFACE_DISCARDS_OUTBOUND,
  GET_NETWORK_DASHBOARD_NETWORK_DEVICE_AVAILIBILITY,
  GET_NETWORK_DASHBOARD_DEVICE_HEALTH_DISTRIBUTION,
  GET_NETWORK_DASHBOARD_DEVICE_TYPE_DISTRIBUTION,
  GET_NETWORK_DASHBOARD_MANUFACTURER_MODEL_BREAKDOWN,
  GET_NETWORK_DASHBOARD_DEVICES_BY_LOCATION,
  GET_NETWORK_DASHBOARD_AVERAGE_UPTIME_BY_DEVICE_TYPE,
  GET_NETWORK_DASHBOARD_LOWEST_AVAILIBILITY,
  GET_NETWORK_DASHBOARD_ENVIRONMENTAL_HEALTH_SUMMARY,
  GET_NETWORK_DASHBOARD_TOP_DEVICES_BY_HOTSPOT_TEMPERATURE,
  GET_NETWORK_DASHBOARD_AVERAGE_TEMPERATURE_BY_SENSOR_TYPE,
  GET_NETWORK_DASHBOARD_POWER_SUPPLY_STATUS_DISTRIBUTION,
  GET_NETWORK_DASHBOARD_FAN_HEALTH_BY_DEVICE,
  GET_NETWORK_DASHBOARD_ALERT_EVENTS_SUMMARY,
  GET_NETWORK_DASHBOARD_ALERTS_BY_SEVERITY,
  GET_NETWORK_DASHBOARD_ALERTS_BY_DEVICE_TYPE,
  GET_NETWORK_DASHBOARD_OPEN_ITSM_TICKETS_BY_DEVICE_TYPE,
  GET_NETWORK_DASHBOARD_ALERT_STATS,
  GET_NETWORK_DASHBOARD_TOP_10_CRITICAL_ALERTS,
  GET_NETWORK_DASHBOARD_AUTO_REMEDIATION_SUMMARY
} from 'src/app/shared/api-endpoint.const';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import {
  NETWORK_DASHBOARD_TIME_RANGE_DEFAULT,
  NETWORK_AVERAGE_TEMPERATURE_BY_SENSOR_TYPE_RESPONSE,
  NETWORK_ENVIRONMENTAL_HEALTH_SUMMARY_TABLE_RESPONSE,
  NETWORK_FAN_HEALTH_BY_DEVICE_RESPONSE,
  NETWORK_POWER_SUPPLY_STATUS_DISTRIBUTION_RESPONSE,
  NETWORK_TOP_DEVICES_BY_HOTSPOT_TEMPERATURE_RESPONSE
} from './network-dashboard.const';
import {
  NetworkAlertsByDeviceTypeApiItem,
  NetworkAlertsByDeviceTypeResponse,
  NetworkAlertsBySeverityApiItem,
  NetworkAlertsBySeverityResponse,
  NetworkAlertEventsSummaryResponse,
  NetworkAlertStatsResponse,
  NetworkAutoRemediationActionItem,
  NetworkAutoRemediationSummary,
  NetworkAutoRemediationSummaryMetrics,
  NetworkOpenItsmTicketsByDeviceTypeApiItem,
  NetworkOpenItsmTicketsByDeviceTypeResponse,
  NetworkTopCriticalAlertApiItem,
  NetworkTopCriticalAlertsResponse,
  NetworkBandwidthUsageItem,
  NetworkConversationMetricItem,
  NetworkDashboardFilterCriteria,
  NetworkDashboardFiltersResponse,
  NetworkDeviceAvailabilityItem,
  NetworkDeviceAvailabilityStatus,
  NetworkDeviceAvailabilityTableApiItem,
  NetworkDeviceAvailabilityTableResponse,
  NetworkDeviceAvailabilityUptime,
  NetworkDeviceHealthDistributionApiItem,
  NetworkDeviceHealthDistributionResponse,
  NetworkDeviceTypeDistributionApiItem,
  NetworkDeviceTypeDistributionResponse,
  NetworkManufacturerModelBreakdownApiItem,
  NetworkManufacturerModelBreakdownResponse,
  NetworkDevicesByLocationApiItem,
  NetworkDevicesByLocationResponse,
  NetworkAverageUptimeByDeviceTypeApiItem,
  NetworkAverageUptimeByDeviceTypeResponse,
  NetworkLowestAvailabilityApiItem,
  NetworkLowestAvailabilityResponse,
  NetworkEnvironmentalHealthSummaryItem,
  NetworkEnvironmentalHealthSummaryTableApiItem,
  NetworkEnvironmentalHealthSummaryTableResponse,
  NetworkTopDevicesByHotspotTemperatureApiItem,
  NetworkTopDevicesByHotspotTemperatureResponse,
  NetworkAverageTemperatureBySensorTypeApiItem,
  NetworkAverageTemperatureBySensorTypeResponse,
  NetworkPowerSupplyStatusDistributionApiItem,
  NetworkPowerSupplyStatusDistributionResponse,
  NetworkFanHealthByDeviceApiItem,
  NetworkFanHealthByDeviceResponse,
  NetworkStatusCodeLabel,
  NetworkInterfaceHealthMetricItem,
  NetworkInterfaceHealthMetricChartApiItem,
  NetworkInterfaceHealthMetricChartResponse,
  NetworkInterfaceHealthMetricsTableApiItem,
  NetworkInterfaceHealthMetricsTableResponse,
  NetworkMetricLegendItem,
  NetworkOverview,
  NetworkOverviewResponse,
  NetworkPerformanceInsightsTableApiItem,
  NetworkPerformanceInsightsTableResponse,
  NetworkPerformanceWorkloadInsightItem,
  NetworkCpuVsMemoryPerformanceApiItem,
  NetworkCpuVsMemoryPerformanceResponse,
  NetworkTrafficInVsOutApiItem,
  NetworkTrafficInVsOutResponse,
  NetworkTopBandwidthUsageApiItem,
  NetworkTopBandwidthUsageResponse,
  NetworkTopConversationMetricApiItem,
  NetworkTopConversationMetricResponse,
  NetworkTopConversationTableApiItem,
  NetworkTopConversationsTableResponse,
  NetworkValueWithUnit
} from './network-dashboard.type';

@Injectable()
export class NetworkDashboardService {
  private readonly manufacturerModelPalette = [
    '#5a74d8', '#8ecb72', '#ffc24a', '#ef6b77', '#69b4de',
    '#65c38e', '#ad86d9', '#90a4b7', '#ff8a5b', '#7bc96f',
    '#50b5ff', '#f2c14e', '#e76f51', '#6cc3d5', '#9b8cff',
    '#46b17b', '#ffb703', '#fb7185', '#4dabf7', '#84cc16',
    '#c084fc', '#f97316', '#38bdf8', '#f59e0b', '#10b981',
    '#a78bfa', '#f87171', '#22c55e', '#06b6d4', '#eab308'
  ];

  constructor(
    private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService
  ) { }

  getFilterOptions(): Observable<NetworkDashboardFiltersResponse> {
    return this.http.get<NetworkDashboardFiltersResponse>(GET_NETWORK_DASHBOARD_FILTERS());
  }

  getNetworkOverview(filters?: NetworkDashboardFilterCriteria): Observable<NetworkOverviewResponse> {
    const params = this.buildFilterParams(filters);
    return this.http.get<NetworkOverviewResponse>(GET_NETWORK_DASHBOARD_OVERVIEW(), { params });
  }

  getTopBitsReceived(filters?: NetworkDashboardFilterCriteria): Observable<NetworkTopConversationMetricResponse> {
    return this.http.get<NetworkTopConversationMetricResponse>(GET_NETWORK_DASHBOARD_TOP_BITS_RECEIVED(), {
      params: this.buildFilterParams(filters)
    });
  }

  getTopBitsSent(filters?: NetworkDashboardFilterCriteria): Observable<NetworkTopConversationMetricResponse> {
    return this.http.get<NetworkTopConversationMetricResponse>(GET_NETWORK_DASHBOARD_TOP_BITS_SENT(), {
      params: this.buildFilterParams(filters)
    });
  }

  getTopBandwidthUsage(filters?: NetworkDashboardFilterCriteria): Observable<NetworkTopBandwidthUsageResponse> {
    return this.http.get<NetworkTopBandwidthUsageResponse>(GET_NETWORK_DASHBOARD_TOP_BANDWIDTH_USAGE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getTopConversationsTable(
    filters?: NetworkDashboardFilterCriteria,
    ordering?: string,
    searchValue: string = ''
  ): Observable<NetworkTopConversationsTableResponse> {
    let params = this.buildFilterParams(filters);
    if (ordering) {
      params = params.set('ordering', ordering);
    }
    if (searchValue?.trim()) {
      params = params.set('search', searchValue.trim());
    }
    return this.http.get<NetworkTopConversationsTableResponse>(GET_NETWORK_DASHBOARD_TOP_10_CONVERSATIONS(), {
      params
    });
  }

  getPerformanceInsightsTable(
    filters?: NetworkDashboardFilterCriteria,
    ordering?: string,
    searchValue: string = ''
  ): Observable<NetworkPerformanceInsightsTableResponse> {
    let params = this.buildFilterParams(filters);
    if (ordering) {
      params = params.set('ordering', ordering);
    }
    if (searchValue?.trim()) {
      params = params.set('search', searchValue.trim());
    }
    return this.http.get<NetworkPerformanceInsightsTableResponse>(GET_NETWORK_DASHBOARD_PERFORMANCE_INSIGHTS(), {
      params
    });
  }

  getCpuVsMemoryPerformance(filters?: NetworkDashboardFilterCriteria): Observable<NetworkCpuVsMemoryPerformanceResponse> {
    return this.http.get<NetworkCpuVsMemoryPerformanceResponse>(GET_NETWORK_DASHBOARD_CPU_VS_MEMORY_PERFORMANCE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getTrafficInVsOut(filters?: NetworkDashboardFilterCriteria): Observable<NetworkTrafficInVsOutResponse> {
    return this.http.get<NetworkTrafficInVsOutResponse>(GET_NETWORK_DASHBOARD_TRAFFIC_IN_VS_OUT(), {
      params: this.buildFilterParams(filters)
    });
  }

  getInterfaceHealthMetricsTable(
    filters?: NetworkDashboardFilterCriteria,
    ordering?: string,
    searchValue: string = ''
  ): Observable<NetworkInterfaceHealthMetricsTableResponse> {
    let params = this.buildFilterParams(filters);
    if (ordering) {
      params = params.set('ordering', ordering);
    }
    if (searchValue?.trim()) {
      params = params.set('search', searchValue.trim());
    }
    return this.http.get<NetworkInterfaceHealthMetricsTableResponse>(GET_NETWORK_DASHBOARD_INTERFACE_HEALTH_AND_METRICS(), {
      params
    });
  }

  getInterfaceErrorsInbound(filters?: NetworkDashboardFilterCriteria): Observable<NetworkInterfaceHealthMetricChartResponse> {
    return this.http.get<NetworkInterfaceHealthMetricChartResponse>(GET_NETWORK_DASHBOARD_INTERFACE_ERRORS_INBOUND(), {
      params: this.buildFilterParams(filters)
    });
  }

  getInterfaceErrorsOutbound(filters?: NetworkDashboardFilterCriteria): Observable<NetworkInterfaceHealthMetricChartResponse> {
    return this.http.get<NetworkInterfaceHealthMetricChartResponse>(GET_NETWORK_DASHBOARD_INTERFACE_ERRORS_OUTBOUND(), {
      params: this.buildFilterParams(filters)
    });
  }

  getInterfaceDiscardsInbound(filters?: NetworkDashboardFilterCriteria): Observable<NetworkInterfaceHealthMetricChartResponse> {
    return this.http.get<NetworkInterfaceHealthMetricChartResponse>(GET_NETWORK_DASHBOARD_INTERFACE_DISCARDS_INBOUND(), {
      params: this.buildFilterParams(filters)
    });
  }

  getInterfaceDiscardsOutbound(filters?: NetworkDashboardFilterCriteria): Observable<NetworkInterfaceHealthMetricChartResponse> {
    return this.http.get<NetworkInterfaceHealthMetricChartResponse>(GET_NETWORK_DASHBOARD_INTERFACE_DISCARDS_OUTBOUND(), {
      params: this.buildFilterParams(filters)
    });
  }

  getNetworkDeviceAvailabilityTable(filters?: NetworkDashboardFilterCriteria): Observable<NetworkDeviceAvailabilityTableResponse> {
    return this.http.get<NetworkDeviceAvailabilityTableResponse>(GET_NETWORK_DASHBOARD_NETWORK_DEVICE_AVAILIBILITY(), {
      params: this.buildFilterParams(filters)
    });
  }

  getDeviceHealthDistribution(filters?: NetworkDashboardFilterCriteria): Observable<NetworkDeviceHealthDistributionResponse> {
    return this.http.get<NetworkDeviceHealthDistributionResponse>(GET_NETWORK_DASHBOARD_DEVICE_HEALTH_DISTRIBUTION(), {
      params: this.buildFilterParams(filters)
    });
  }

  getDeviceTypeDistribution(filters?: NetworkDashboardFilterCriteria): Observable<NetworkDeviceTypeDistributionResponse> {
    return this.http.get<NetworkDeviceTypeDistributionResponse>(GET_NETWORK_DASHBOARD_DEVICE_TYPE_DISTRIBUTION(), {
      params: this.buildFilterParams(filters)
    });
  }

  getManufacturerModelBreakdown(filters?: NetworkDashboardFilterCriteria): Observable<NetworkManufacturerModelBreakdownResponse> {
    return this.http.get<NetworkManufacturerModelBreakdownResponse>(GET_NETWORK_DASHBOARD_MANUFACTURER_MODEL_BREAKDOWN(), {
      params: this.buildFilterParams(filters)
    });
  }

  getDevicesByLocation(filters?: NetworkDashboardFilterCriteria): Observable<NetworkDevicesByLocationResponse> {
    return this.http.get<NetworkDevicesByLocationResponse>(GET_NETWORK_DASHBOARD_DEVICES_BY_LOCATION(), {
      params: this.buildFilterParams(filters)
    });
  }

  getAverageUptimeByDeviceType(filters?: NetworkDashboardFilterCriteria): Observable<NetworkAverageUptimeByDeviceTypeResponse> {
    return this.http.get<NetworkAverageUptimeByDeviceTypeResponse>(GET_NETWORK_DASHBOARD_AVERAGE_UPTIME_BY_DEVICE_TYPE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getLowestAvailability(filters?: NetworkDashboardFilterCriteria): Observable<NetworkLowestAvailabilityResponse> {
    return this.http.get<NetworkLowestAvailabilityResponse>(GET_NETWORK_DASHBOARD_LOWEST_AVAILIBILITY(), {
      params: this.buildFilterParams(filters)
    });
  }

  getEnvironmentalHealthSummaryTable(filters?: NetworkDashboardFilterCriteria): Observable<NetworkEnvironmentalHealthSummaryTableResponse> {
    return this.http.get<NetworkEnvironmentalHealthSummaryTableResponse>(GET_NETWORK_DASHBOARD_ENVIRONMENTAL_HEALTH_SUMMARY(), {
      params: this.buildFilterParams(filters)
    });
  }

  getTopDevicesByHotspotTemperature(filters?: NetworkDashboardFilterCriteria): Observable<NetworkTopDevicesByHotspotTemperatureResponse> {
    return this.http.get<NetworkTopDevicesByHotspotTemperatureResponse>(GET_NETWORK_DASHBOARD_TOP_DEVICES_BY_HOTSPOT_TEMPERATURE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getAverageTemperatureBySensorType(filters?: NetworkDashboardFilterCriteria): Observable<NetworkAverageTemperatureBySensorTypeResponse> {
    return this.http.get<NetworkAverageTemperatureBySensorTypeResponse>(GET_NETWORK_DASHBOARD_AVERAGE_TEMPERATURE_BY_SENSOR_TYPE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getPowerSupplyStatusDistribution(filters?: NetworkDashboardFilterCriteria): Observable<NetworkPowerSupplyStatusDistributionResponse> {
    return this.http.get<NetworkPowerSupplyStatusDistributionResponse>(GET_NETWORK_DASHBOARD_POWER_SUPPLY_STATUS_DISTRIBUTION(), {
      params: this.buildFilterParams(filters)
    });
  }

  getFanHealthByDevice(filters?: NetworkDashboardFilterCriteria): Observable<NetworkFanHealthByDeviceResponse> {
    return this.http.get<NetworkFanHealthByDeviceResponse>(GET_NETWORK_DASHBOARD_FAN_HEALTH_BY_DEVICE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getAlertEventsSummary(filters?: NetworkDashboardFilterCriteria): Observable<NetworkAlertEventsSummaryResponse> {
    return this.http.get<NetworkAlertEventsSummaryResponse>(GET_NETWORK_DASHBOARD_ALERT_EVENTS_SUMMARY(), {
      params: this.buildFilterParams(filters)
    });
  }

  getAlertsBySeverity(filters?: NetworkDashboardFilterCriteria): Observable<NetworkAlertsBySeverityResponse> {
    return this.http.get<NetworkAlertsBySeverityResponse>(GET_NETWORK_DASHBOARD_ALERTS_BY_SEVERITY(), {
      params: this.buildFilterParams(filters)
    });
  }

  getAlertsByDeviceType(filters?: NetworkDashboardFilterCriteria): Observable<NetworkAlertsByDeviceTypeResponse> {
    return this.http.get<NetworkAlertsByDeviceTypeResponse>(GET_NETWORK_DASHBOARD_ALERTS_BY_DEVICE_TYPE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getOpenItsmTicketsByDeviceType(filters?: NetworkDashboardFilterCriteria): Observable<NetworkOpenItsmTicketsByDeviceTypeResponse> {
    return this.http.get<NetworkOpenItsmTicketsByDeviceTypeResponse>(GET_NETWORK_DASHBOARD_OPEN_ITSM_TICKETS_BY_DEVICE_TYPE(), {
      params: this.buildFilterParams(filters)
    });
  }

  getAlertStats(filters?: NetworkDashboardFilterCriteria): Observable<NetworkAlertStatsResponse> {
    return this.http.get<NetworkAlertStatsResponse>(GET_NETWORK_DASHBOARD_ALERT_STATS(), {
      params: this.buildFilterParams(filters)
    });
  }

  getTopCriticalAlerts(filters?: NetworkDashboardFilterCriteria): Observable<NetworkTopCriticalAlertsResponse> {
    return this.http.get<NetworkTopCriticalAlertsResponse>(GET_NETWORK_DASHBOARD_TOP_10_CRITICAL_ALERTS(), {
      params: this.buildFilterParams(filters)
    });
  }

  getAutoRemediationSummary(filters?: NetworkDashboardFilterCriteria): Observable<NetworkAutoRemediationSummary> {
    return this.http.get<NetworkAutoRemediationSummary>(GET_NETWORK_DASHBOARD_AUTO_REMEDIATION_SUMMARY(), {
      params: this.buildFilterParams(filters)
    });
  }

  convertToNetworkOverviewViewData(data: NetworkOverviewResponse | NetworkOverview): NetworkOverviewViewData {
    const normalizedData = this.normalizeNetworkOverviewResponse(data);
    const view: NetworkOverviewViewData = new NetworkOverviewViewData();
    view.deviceAvailability = new DeviceAvailabilityViewData();
    view.deviceAvailability.percentage = normalizedData.device_availability?.percentage;
    view.deviceAvailability.online = normalizedData.device_availability?.online;
    view.deviceAvailability.total = normalizedData.device_availability?.total;
    view.discoveredDevices = normalizedData.discovered_devices;
    view.monitoredDevices = normalizedData.monitored_devices;
    view.deviceTypes = [];

    if (normalizedData.device_types && normalizedData.device_types.length) {
      normalizedData.device_types.forEach(item => {
        const deviceTypeView: DeviceTypesItemViewData = new DeviceTypesItemViewData();
        deviceTypeView.type = item.type;
        deviceTypeView.count = item.count;
        deviceTypeView.normal = item.normal;
        deviceTypeView.normalIconClass = 'fas fa-arrow-up';
        deviceTypeView.critical = item.critical;
        deviceTypeView.criticalIconClass = 'fas fa-arrow-down';
        deviceTypeView.unknown = item.unknown;
        deviceTypeView.unknownIconClass = 'fas fa-exclamation-circle';
        view.deviceTypes.push(deviceTypeView);
      });
    }

    return view;
  }

  private normalizeNetworkOverviewResponse(data: NetworkOverviewResponse | NetworkOverview): NetworkOverview {
    const normalizedData = (data as NetworkOverviewResponse)?.result?.data
      || (data as NetworkOverviewResponse)?.data
      || data
      || {};

    return {
      device_availability: normalizedData.device_availability,
      discovered_devices: normalizedData.discovered_devices,
      monitored_devices: normalizedData.monitored_devices,
      device_types: normalizedData.device_types || []
    };
  }

  private buildFilterParams(filters?: NetworkDashboardFilterCriteria): HttpParams {
    let params = new HttpParams();

    if (filters?.datacenterIds?.length) {
      params = params.set('datacenter_ids', filters.datacenterIds.join(','));
    }

    params = params.set('time_range', this.mapTimeRangeToApiValue(filters?.timeRange || NETWORK_DASHBOARD_TIME_RANGE_DEFAULT));
    if (filters?.startDate) {
      params = params.set('start_datetime', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('end_datetime', filters.endDate);
    }
    return params;
  }

  private mapTimeRangeToApiValue(value: string): string {
    switch (value) {
      case 'last_7_days':
        return 'last_week';
      case 'last_30_days':
        return 'last_month';
      default:
        return value;
    }
  }

  convertToTopConversationsChartViewData(
    topBitsReceived: NetworkTopConversationMetricResponse,
    topBitsSent: NetworkTopConversationMetricResponse,
    topBandwidthUsage: NetworkTopBandwidthUsageResponse
  ): TopConversationsWidgetViewData {
    const view = new TopConversationsWidgetViewData();
    if (!topBitsReceived && !topBitsSent && !topBandwidthUsage) {
      return view;
    }

    view.cards = [
      this.buildBitsConversationCard(
        'receive',
        'Top Bits Receive',
        this.convertTopBitsMetricItems(topBitsReceived?.data || [], 'received'),
        this.buildTopBitsReceivedLegends(topBitsReceived?.data || [])
      ),
      this.buildBitsConversationCard(
        'sent',
        'Top Bits Sent',
        this.convertTopBitsMetricItems(topBitsSent?.data || [], 'sent'),
        this.buildTopBitsSentLegends(topBitsSent?.data || [])
      ),
      this.buildBandwidthConversationCard(
        'bandwidth',
        'Top Bandwidth Usage',
        this.convertTopBandwidthUsageItems(topBandwidthUsage?.data || []),
        this.buildTopBandwidthUsageLegends(topBandwidthUsage?.data || [])
      )
    ];

    return view;
  }

  convertToTopConversationsViewDataFromTable(data: NetworkTopConversationsTableResponse): TopConversationsWidgetViewData {
    const view = new TopConversationsWidgetViewData();
    const items = data?.data || [];

    view.cards = [
      this.buildBitsConversationCard(
        'receive',
        'Top Bits Receive',
        this.convertTopBitsMetricItemsFromTable(items, 'received'),
        this.buildTopBitsLegendsFromTable(items, 'received')
      ),
      this.buildBitsConversationCard(
        'sent',
        'Top Bits Sent',
        this.convertTopBitsMetricItemsFromTable(items, 'sent'),
        this.buildTopBitsLegendsFromTable(items, 'sent')
      ),
      this.buildBandwidthConversationCard(
        'bandwidth',
        'Top Bandwidth Usage',
        this.convertTopBandwidthUsageItemsFromTable(items),
        this.buildTopBandwidthUsageLegendsFromTable(items)
      )
    ];

    return this.applyTopConversationsTableData(view, data);
  }

  applyTopConversationsTableData(
    view: TopConversationsWidgetViewData,
    data: NetworkTopConversationsTableResponse
  ): TopConversationsWidgetViewData {
    const nextView = view || new TopConversationsWidgetViewData();
    nextView.tableColumns = this.buildTopConversationsTableColumns();
    nextView.tableRows = (data?.data || []).map(item => this.buildTopConversationsTableRow(item));
    nextView.defaultSortColumn = 'bitsReceiveValue';
    nextView.defaultSortDirection = 'desc';
    return nextView;
  }

  sortTopConversationRows(rows: TopConversationsTableRowViewData[], sortColumn: string, sortDirection: string): TopConversationsTableRowViewData[] {
    return this.sortTableRows(rows, sortColumn, sortDirection);
  }

  convertToPerformanceWorkloadChartViewData(
    cpuVsMemory: NetworkCpuVsMemoryPerformanceResponse,
    trafficInVsOut: NetworkTrafficInVsOutResponse
  ): PerformanceWorkloadInsightsWidgetViewData {
    const view = new PerformanceWorkloadInsightsWidgetViewData();
    const cpuMemoryItems = this.convertCpuVsMemoryItems(cpuVsMemory?.data || []);
    const trafficItems = this.convertTrafficInVsOutItems(trafficInVsOut?.data || []);

    view.charts = [
      this.buildPerformanceScatterChart(
        'cpu-memory',
        'CPU Vs Memory Performance',
        this.formatAxisTitle(cpuVsMemory?.y_axis?.label, cpuVsMemory?.y_axis?.unit, 'CPU %'),
        this.formatAxisTitle(cpuVsMemory?.x_axis?.label, cpuVsMemory?.x_axis?.unit, 'Memory %'),
        cpuMemoryItems,
        item => item.memory_utilization_percent,
        item => item.cpu_utilization_percent,
        (item: NetworkPerformanceWorkloadInsightItem) => `Device: ${item.device_name}<br>CPU: ${item.cpu_utilization_percent}%<br>Memory: ${item.memory_utilization_percent}%`,
        30,
        100,
        10,
        30,
        100,
        10
      ),
      this.buildPerformanceScatterChart(
        'traffic',
        'Traffic In Vs Traffic Out',
        this.formatAxisTitle(trafficInVsOut?.y_axis?.label, trafficInVsOut?.y_axis?.unit, 'Traffic In'),
        this.formatAxisTitle(trafficInVsOut?.x_axis?.label, trafficInVsOut?.x_axis?.unit, 'Traffic Out'),
        trafficItems,
        item => item.interface_traffic_out_mbps,
        item => item.interface_traffic_in_mbps,
        (item: NetworkPerformanceWorkloadInsightItem) =>
          `Device: ${item.device_name}<br>Traffic In: ${item.interface_traffic_in_mbps} Mbps<br>Traffic Out: ${item.interface_traffic_out_mbps} Mbps`,
        0,
        this.getRoundedAxisMax(trafficItems.map(item => item.interface_traffic_out_mbps), 10, 10),
        50,
        30,
        this.getRoundedAxisMax(trafficItems.map(item => item.interface_traffic_in_mbps), 10, 10),
        50
      )
    ];
    return view;
  }

  convertToPerformanceWorkloadViewDataFromTable(
    data: NetworkPerformanceInsightsTableResponse
  ): PerformanceWorkloadInsightsWidgetViewData {
    const view = new PerformanceWorkloadInsightsWidgetViewData();
    const tableItems = data?.data || [];
    const chartItems = this.convertPerformanceTableItems(tableItems);

    view.charts = [
      this.buildPerformanceScatterChart(
        'cpu-memory',
        'CPU Vs Memory Performance',
        'CPU Utilization (%)',
        'Memory Utilization (%)',
        chartItems.filter(item => item.cpu_utilization_percent > 0 || item.memory_utilization_percent > 0),
        item => item.memory_utilization_percent,
        item => item.cpu_utilization_percent,
        (item: NetworkPerformanceWorkloadInsightItem) => `Device: ${item.device_name}<br>CPU: ${item.cpu_utilization_percent}%<br>Memory: ${item.memory_utilization_percent}%`,
        30,
        100,
        10,
        30,
        100,
        10
      ),
      this.buildPerformanceScatterChart(
        'traffic',
        'Traffic In Vs Traffic Out',
        'Traffic In (Mbps)',
        'Traffic Out (Mbps)',
        chartItems.filter(item => item.interface_traffic_in_mbps > 0 || item.interface_traffic_out_mbps > 0),
        item => item.interface_traffic_out_mbps,
        item => item.interface_traffic_in_mbps,
        (item: NetworkPerformanceWorkloadInsightItem) =>
          `Device: ${item.device_name}<br>Traffic In: ${item.interface_traffic_in_mbps} Mbps<br>Traffic Out: ${item.interface_traffic_out_mbps} Mbps`,
        0,
        this.getRoundedAxisMax(chartItems.map(item => item.interface_traffic_out_mbps), 10, 10),
        50,
        30,
        this.getRoundedAxisMax(chartItems.map(item => item.interface_traffic_in_mbps), 10, 10),
        50
      )
    ];

    return this.applyPerformanceWorkloadTableData(view, data);
  }

  applyPerformanceWorkloadTableData(
    view: PerformanceWorkloadInsightsWidgetViewData,
    data: NetworkPerformanceInsightsTableResponse
  ): PerformanceWorkloadInsightsWidgetViewData {
    const nextView = view || new PerformanceWorkloadInsightsWidgetViewData();
    nextView.tableColumns = this.buildPerformanceWorkloadTableColumns();
    nextView.tableRows = (data?.data || []).map(item => this.buildPerformanceWorkloadTableRow(item));
    return nextView;
  }

  sortPerformanceWorkloadRows(
    rows: PerformanceWorkloadTableRowViewData[],
    sortColumn: string,
    sortDirection: string
  ): PerformanceWorkloadTableRowViewData[] {
    return this.sortTableRows(rows, sortColumn, sortDirection);
  }

  convertToInterfaceHealthMetricsChartViewData(
    errorsInbound: NetworkInterfaceHealthMetricChartResponse,
    errorsOutbound: NetworkInterfaceHealthMetricChartResponse,
    discardsInbound: NetworkInterfaceHealthMetricChartResponse,
    discardsOutbound: NetworkInterfaceHealthMetricChartResponse
  ): InterfaceHealthMetricsWidgetViewData {
    const view = new InterfaceHealthMetricsWidgetViewData();
    view.charts = [
      this.buildInterfaceHealthMetricChart(
        'errors-in',
        'Interface Errors (Inbound)',
        'errors',
        'Errors (In)',
        this.convertInterfaceHealthChartItems(errorsInbound?.data || []),
        item => Number(item.metric_value || 0),
        this.getRoundedAxisMax((errorsInbound?.data || []).map(item => Number(item.value || 0)), 2, 2),
        2
      ),
      this.buildInterfaceHealthMetricChart(
        'errors-out',
        'Interface Errors (Outbound)',
        'errors',
        'Errors (Out)',
        this.convertInterfaceHealthChartItems(errorsOutbound?.data || []),
        item => Number(item.metric_value || 0),
        this.getRoundedAxisMax((errorsOutbound?.data || []).map(item => Number(item.value || 0)), 2, 2),
        2
      ),
      this.buildInterfaceHealthMetricChart(
        'discards-in',
        'Interface Discards (Inbound)',
        'discards',
        'Discards (In)',
        this.convertInterfaceHealthChartItems(discardsInbound?.data || []),
        item => Number(item.metric_value || 0),
        this.getRoundedAxisMax((discardsInbound?.data || []).map(item => Number(item.value || 0)), 2, 2),
        2
      ),
      this.buildInterfaceHealthMetricChart(
        'discards-out',
        'Interface Discards (Outbound)',
        'discards',
        'Discards (Out)',
        this.convertInterfaceHealthChartItems(discardsOutbound?.data || []),
        item => Number(item.metric_value || 0),
        this.getRoundedAxisMax((discardsOutbound?.data || []).map(item => Number(item.value || 0)), 2, 2),
        2
      )
    ];
    return view;
  }

  convertToInterfaceHealthMetricsViewDataFromTable(
    data: NetworkInterfaceHealthMetricsTableResponse
  ): InterfaceHealthMetricsWidgetViewData {
    const view = new InterfaceHealthMetricsWidgetViewData();
    const chartItems = this.convertInterfaceHealthTableItems(data?.data || []);

    view.charts = [
      this.buildInterfaceHealthMetricChart(
        'errors-in',
        'Interface Errors (Inbound)',
        'errors',
        'Errors (In)',
        this.getInterfaceHealthTopItems(chartItems, item => Number(item.errors_in_per_sec || 0)),
        item => Number(item.errors_in_per_sec || 0),
        this.getRoundedAxisMax(chartItems.map(item => Number(item.errors_in_per_sec || 0)), 2, 2),
        2
      ),
      this.buildInterfaceHealthMetricChart(
        'errors-out',
        'Interface Errors (Outbound)',
        'errors',
        'Errors (Out)',
        this.getInterfaceHealthTopItems(chartItems, item => Number(item.errors_out_per_sec || 0)),
        item => Number(item.errors_out_per_sec || 0),
        this.getRoundedAxisMax(chartItems.map(item => Number(item.errors_out_per_sec || 0)), 2, 2),
        2
      ),
      this.buildInterfaceHealthMetricChart(
        'discards-in',
        'Interface Discards (Inbound)',
        'discards',
        'Discards (In)',
        this.getInterfaceHealthTopItems(chartItems, item => Number(item.discards_in_per_sec || 0)),
        item => Number(item.discards_in_per_sec || 0),
        this.getRoundedAxisMax(chartItems.map(item => Number(item.discards_in_per_sec || 0)), 2, 2),
        2
      ),
      this.buildInterfaceHealthMetricChart(
        'discards-out',
        'Interface Discards (Outbound)',
        'discards',
        'Discards (Out)',
        this.getInterfaceHealthTopItems(chartItems, item => Number(item.discards_out_per_sec || 0)),
        item => Number(item.discards_out_per_sec || 0),
        this.getRoundedAxisMax(chartItems.map(item => Number(item.discards_out_per_sec || 0)), 2, 2),
        2
      )
    ];

    return this.applyInterfaceHealthMetricsTableData(view, data);
  }

  applyInterfaceHealthMetricsTableData(
    view: InterfaceHealthMetricsWidgetViewData,
    data: NetworkInterfaceHealthMetricsTableResponse
  ): InterfaceHealthMetricsWidgetViewData {
    const nextView = view || new InterfaceHealthMetricsWidgetViewData();
    nextView.tableColumns = this.buildInterfaceHealthMetricsTableColumns();
    nextView.tableRows = (data?.data || []).map(item => this.buildInterfaceHealthMetricsTableRow(item));
    return nextView;
  }

  sortInterfaceHealthMetricRows(
    rows: InterfaceHealthMetricsTableRowViewData[],
    sortColumn: string,
    sortDirection: string
  ): InterfaceHealthMetricsTableRowViewData[] {
    return this.sortTableRows(rows, sortColumn, sortDirection);
  }

  convertToNetworkDeviceAvailabilityChartViewData(
    deviceHealthDistribution: NetworkDeviceHealthDistributionResponse,
    deviceTypeDistribution: NetworkDeviceTypeDistributionResponse,
    manufacturerModelBreakdown: NetworkManufacturerModelBreakdownResponse,
    devicesByLocation: NetworkDevicesByLocationResponse,
    averageUptimeByDeviceType: NetworkAverageUptimeByDeviceTypeResponse,
    lowestAvailability: NetworkLowestAvailabilityResponse
  ): NetworkDeviceAvailabilityWidgetViewData {
    const view = new NetworkDeviceAvailabilityWidgetViewData();

    view.cards = [
      this.buildNetworkDeviceAvailabilityChartCard(
        'device-health-distribution',
        'Device Health Distribution',
        this.convertToDeviceHealthDistributionChartData(deviceHealthDistribution?.data || []),
        236,
        (deviceHealthDistribution?.data || []).length ? [
          this.buildNetworkDeviceAvailabilityLegendItem('Down', '#d10000'),
          this.buildNetworkDeviceAvailabilityLegendItem('Up', '#19bb73'),
          this.buildNetworkDeviceAvailabilityLegendItem('Unknown', '#a5b1bd')
        ] : [],
        'Device split by health state.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'device-type-distribution',
        'Device Type Distribution',
        this.convertToDeviceTypeDistributionChartData(deviceTypeDistribution?.data || []),
        236,
        this.buildWeightedLegendItems((deviceTypeDistribution?.data || []).map(item => item.type).filter(Boolean), label => this.getDeviceTypeColor(label)),
        'Distribution of devices by network device type.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'manufacturer-model-breakdown',
        'Manufacturer & Model Breakdown',
        this.convertToManufacturerModelBreakdownChartData(manufacturerModelBreakdown?.data || []),
        236,
        this.buildWeightedLegendItems(this.getManufacturerModels(manufacturerModelBreakdown?.data || []), label => this.getManufacturerModelColor(label)),
        'Device counts grouped by manufacturer and stacked by model.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'devices-by-location',
        'Devices by Location',
        this.convertToDevicesByLocationChartData(devicesByLocation?.data || []),
        236,
        this.buildWeightedLegendItems((devicesByLocation?.data || []).map(item => item.datacenter || item.location).filter(Boolean), label => this.getDeviceLocationColor(label)),
        'Distribution of monitored devices by location.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'average-uptime',
        'Average Uptime by Category',
        this.convertToAverageUptimeChartData(averageUptimeByDeviceType?.data || [], averageUptimeByDeviceType?.unit || 'days'),
        236,
        [],
        'Average uptime in days grouped by device category.'
      ),
      this.buildLowestAvailabilityCard(lowestAvailability?.data || [])
    ];
    return view;
  }

  convertToNetworkDeviceAvailabilityViewDataFromTable(
    data: NetworkDeviceAvailabilityTableResponse
  ): NetworkDeviceAvailabilityWidgetViewData {
    const items = data?.data || [];
    const view = new NetworkDeviceAvailabilityWidgetViewData();

    const deviceHealthDistribution = this.aggregateDeviceHealthDistribution(items);
    const deviceTypeDistribution = this.aggregateDeviceTypeDistribution(items);
    const manufacturerModelBreakdown = this.aggregateManufacturerModelBreakdown(items);
    const devicesByLocation = this.aggregateDevicesByLocation(items);
    const averageUptimeByDeviceType = this.aggregateAverageUptimeByDeviceType(items);
    const lowestAvailability = this.aggregateLowestAvailability(items);

    view.cards = [
      this.buildNetworkDeviceAvailabilityChartCard(
        'device-health-distribution',
        'Device Health Distribution',
        this.convertToDeviceHealthDistributionChartData(deviceHealthDistribution),
        236,
        deviceHealthDistribution.length ? [
          this.buildNetworkDeviceAvailabilityLegendItem('Down', '#d10000'),
          this.buildNetworkDeviceAvailabilityLegendItem('Up', '#19bb73'),
          this.buildNetworkDeviceAvailabilityLegendItem('Unknown', '#a5b1bd')
        ] : [],
        'Device split by health state.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'device-type-distribution',
        'Device Type Distribution',
        this.convertToDeviceTypeDistributionChartData(deviceTypeDistribution),
        236,
        this.buildWeightedLegendItems(deviceTypeDistribution.map(item => item.type).filter(Boolean), label => this.getDeviceTypeColor(label)),
        'Distribution of devices by network device type.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'manufacturer-model-breakdown',
        'Manufacturer & Model Breakdown',
        this.convertToManufacturerModelBreakdownChartData(manufacturerModelBreakdown),
        236,
        this.buildWeightedLegendItems(this.getManufacturerModels(manufacturerModelBreakdown), label => this.getManufacturerModelColor(label)),
        'Device counts grouped by manufacturer and stacked by model.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'devices-by-location',
        'Devices by Location',
        this.convertToDevicesByLocationChartData(devicesByLocation),
        236,
        this.buildWeightedLegendItems(devicesByLocation.map(item => item.datacenter || item.location).filter(Boolean), label => this.getDeviceLocationColor(label)),
        'Distribution of monitored devices by location.'
      ),
      this.buildNetworkDeviceAvailabilityChartCard(
        'average-uptime',
        'Average Uptime by Category',
        this.convertToAverageUptimeChartData(averageUptimeByDeviceType, 'days'),
        236,
        [],
        'Average uptime in days grouped by device category.'
      ),
      this.buildLowestAvailabilityCard(lowestAvailability)
    ];

    return this.applyNetworkDeviceAvailabilityTableData(view, data);
  }

  applyNetworkDeviceAvailabilityTableData(
    view: NetworkDeviceAvailabilityWidgetViewData,
    data: NetworkDeviceAvailabilityTableResponse
  ): NetworkDeviceAvailabilityWidgetViewData {
    const nextView = view || new NetworkDeviceAvailabilityWidgetViewData();
    nextView.tableColumns = this.buildNetworkDeviceAvailabilityTableColumns();
    nextView.tableRows = (data?.data || []).map(item => this.buildNetworkDeviceAvailabilityTableRow(item));
    return nextView;
  }

  sortNetworkDeviceAvailabilityRows(
    rows: NetworkDeviceAvailabilityTableRowViewData[],
    sortColumn: string,
    sortDirection: string
  ): NetworkDeviceAvailabilityTableRowViewData[] {
    return this.sortTableRows(rows, sortColumn, sortDirection);
  }

  convertToEnvironmentalHealthSummaryChartViewData(
    hotSpotTemperature: NetworkTopDevicesByHotspotTemperatureResponse,
    averageTemperature: NetworkAverageTemperatureBySensorTypeResponse,
    powerSupplyStatusDistribution: NetworkPowerSupplyStatusDistributionResponse,
    fanHealthByDevice: NetworkFanHealthByDeviceResponse
  ): EnvironmentalHealthSummaryWidgetViewData {
    const view = new EnvironmentalHealthSummaryWidgetViewData();
    view.charts = [
      this.buildEnvironmentalHealthChart(
        'hotspot-temperature',
        'Top 10 Devices by HotSpot Temperature',
        this.convertToHotSpotTemperatureChartData(hotSpotTemperature),
        248,
        this.buildHotSpotTemperatureInfoTooltip(hotSpotTemperature?.thresholds)
      ),
      this.buildEnvironmentalHealthChart(
        'average-temperature',
        'Average Temperature by Sensor Type',
        this.convertToAverageSensorTemperatureChartData(averageTemperature?.data || []),
        248,
        'Average temperature by sensor type with API thresholds.'
      ),
      this.buildEnvironmentalHealthChart(
        'power-supply-distribution',
        'Power Supply Status Distribution',
        this.convertToPowerSupplyStatusDistributionChartData(powerSupplyStatusDistribution?.data || []),
        248,
        'Normal, Warning, and Failed counts for both redundant power supplies.',
        this.buildPowerSupplyLegendItems(powerSupplyStatusDistribution?.data || [])
      ),
      this.buildEnvironmentalHealthChart(
        'fan-health',
        'Fan Health by Device',
        this.convertToFanHealthByDeviceChartData(fanHealthByDevice?.data || []),
        248,
        'Healthy fan count out of total fans for each device.'
      )
    ];
    return view;
  }

  applyEnvironmentalHealthSummaryTableData(
    view: EnvironmentalHealthSummaryWidgetViewData,
    data: NetworkEnvironmentalHealthSummaryTableResponse
  ): EnvironmentalHealthSummaryWidgetViewData {
    const nextView = view || new EnvironmentalHealthSummaryWidgetViewData();
    nextView.tableColumns = this.buildEnvironmentalHealthTableColumns();
    nextView.tableRows = (data?.data || []).map(item => this.buildEnvironmentalHealthTableRow(item));
    return nextView;
  }

  sortEnvironmentalHealthSummaryRows(
    rows: EnvironmentalHealthSummaryTableRowViewData[],
    sortColumn: string,
    sortDirection: string
  ): EnvironmentalHealthSummaryTableRowViewData[] {
    return this.sortTableRows(rows, sortColumn, sortDirection);
  }

  convertToAlertEventsViewData(
    summary: NetworkAlertEventsSummaryResponse,
    alertsBySeverity: NetworkAlertsBySeverityResponse,
    alertsByDeviceType: NetworkAlertsByDeviceTypeResponse,
    openItsmTickets: NetworkOpenItsmTicketsByDeviceTypeResponse,
    alertStats: NetworkAlertStatsResponse,
    topCriticalAlerts: NetworkTopCriticalAlertsResponse
  ): AlertEventsViewWidgetViewData {
    const view = new AlertEventsViewWidgetViewData();
    view.summaryMetrics = this.buildAlertEventsSummaryMetrics(summary);
    view.severityChart = this.buildAlertEventsChart(
      'severity',
      'Alerts by Severity',
      this.convertToAlertsBySeverityChartData(alertsBySeverity?.data || []),
      216,
      [
        this.buildAlertEventsLegendItem('Critical', '#d10000'),
        this.buildAlertEventsLegendItem('Warning', '#ff8d0a'),
        this.buildAlertEventsLegendItem('Info', '#3f8ad8')
      ]
    );
    view.deviceTypeChart = this.buildAlertEventsChart(
      'device-type',
      'Alerts by Device Type',
      this.convertToAlertsByDeviceTypeChartData(alertsByDeviceType?.data || []),
      216,
      [
        this.buildAlertEventsLegendItem('Critical', '#d10000'),
        this.buildAlertEventsLegendItem('Warning', '#ff8d0a'),
        this.buildAlertEventsLegendItem('Info', '#4a8fd6')
      ]
    );
    view.itsmTicketsChart = this.buildAlertEventsChart(
      'itsm-device-type',
      'Open ITSM Tickets by Device Type',
      this.convertToOpenItsmTicketsChartData(openItsmTickets?.data || []),
      216
    );
    view.statsCards = this.buildAlertEventsStatsCards(alertStats);
    view.tableColumns = this.buildAlertEventsTableColumns();
    view.tableRows = (topCriticalAlerts?.data || []).map(item => this.buildAlertEventsTableRow(item));
    return view;
  }

  sortAlertEventsRows(
    rows: AlertEventsTableRowViewData[],
    sortColumn: string,
    sortDirection: string
  ): AlertEventsTableRowViewData[] {
    return this.sortTableRows(rows, sortColumn, sortDirection);
  }

  convertToAutoRemediationSummaryViewData(data: NetworkAutoRemediationSummary): AutoRemediationSummaryWidgetViewData {
    const view = new AutoRemediationSummaryWidgetViewData();
    if (!data) {
      return view;
    }

    const summary = data.summary || {};
    const totalRuns = summary.total_runs || 0;
    const successPercent = summary.success_percent || 0;
    const failurePercent = summary.failed_percent || 0;
    const runningPercent = summary.running_percent || 0;
    const topAutoRemediations = data.top_auto_remediations || [];

    view.successFailureChart = this.buildAutoRemediationChart(
      'success-failure',
      '',
      this.convertToAutoRemediationSuccessFailureChartData(summary),
      148
    );
    view.topActionsChart = this.buildAutoRemediationChart(
      'top-actions',
      'Top Auto-Remediation Actions',
      this.convertToAutoRemediationTopActionsChartData(topAutoRemediations),
      168
    );
    view.legendItems = view.successFailureChart.chartData ? [
      this.buildAutoRemediationLegendItem(`Successful ${successPercent.toFixed(0)}%`, '#67a628'),
      this.buildAutoRemediationLegendItem(`Failed ${failurePercent.toFixed(0)}%`, '#e24a4a'),
      this.buildAutoRemediationLegendItem(`Running ${runningPercent.toFixed(0)}%`, '#f0ab2c')
    ] : [];
    view.totalRunsDisplay = totalRuns.toLocaleString();
    view.avgDurationDisplay = summary.avg_duration || '0 sec';
    view.metrics = [
      this.buildAutoRemediationMetric('Auto-Remediations', `${summary.auto_remediations || 0}`, 'success'),
      this.buildAutoRemediationMetric('Runbook Success', `${successPercent.toFixed(1)}%`, 'success'),
      this.buildAutoRemediationMetric('Running', `${runningPercent.toFixed(1)}%`, 'success'),
      this.buildAutoRemediationMetric('Runbook Failures', `${failurePercent.toFixed(1)}%`, 'danger')
    ];

    return view;
  }

  private sortTableRows<T extends { [key: string]: string | number }>(rows: T[], sortColumn: string, sortDirection: string): T[] {
    if (!rows?.length) {
      return [];
    }

    if (!sortColumn || !sortDirection) {
      return rows.slice();
    }

    const direction = sortDirection === 'desc' ? -1 : 1;
    return rows.slice().sort((left: T, right: T) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * direction;
      }

      return String(leftValue || '').localeCompare(String(rightValue || ''), undefined, {
        numeric: true,
        sensitivity: 'base'
      }) * direction;
    });
  }

  private buildBitsConversationCard(
    key: string,
    title: string,
    items: NetworkConversationMetricItem[],
    legends: NetworkMetricLegendItem[]
  ): TopConversationsCardViewData {
    const card = new TopConversationsCardViewData();
    card.key = key;
    card.title = title;
    card.chartKind = 'funnel';
    card.chartHeight = 252;
    card.chartData = items.length ? this.convertToConversationFunnelChartData(items) : null;
    card.legendItems = card.chartData ? legends.map(legend => this.buildLegendItem(legend)) : [];
    return card;
  }

  private buildBandwidthConversationCard(
    key: string,
    title: string,
    items: NetworkBandwidthUsageItem[],
    legends: NetworkMetricLegendItem[]
  ): TopConversationsCardViewData {
    const card = new TopConversationsCardViewData();
    card.key = key;
    card.title = title;
    card.chartKind = 'bar';
    card.chartHeight = 252;
    card.chartData = items.length ? this.convertToBandwidthUsageChartData(items) : null;
    card.legendItems = card.chartData ? legends.map(legend => this.buildLegendItem(legend)) : [];
    return card;
  }

  private buildTopConversationsTableColumns(): TopConversationsTableColumnViewData[] {
    return [
      {
        key: 'name',
        label: 'Name',
        sortKey: 'name',
        type: 'text',
        align: 'left'
      },
      {
        key: 'bitsReceiveDisplay',
        label: 'Bits Receive',
        sortKey: 'bitsReceiveValue',
        type: 'text',
        align: 'center'
      },
      {
        key: 'bitsSentDisplay',
        label: 'Bits Sent',
        sortKey: 'bitsSentValue',
        type: 'text',
        align: 'center'
      },
      {
        key: 'interfaceType',
        label: 'Interface Type',
        sortKey: 'interfaceType',
        type: 'text',
        align: 'center'
      },
      {
        key: 'operationalStatus',
        label: 'Operational Status',
        sortKey: 'operationalStatus',
        type: 'text',
        align: 'center'
      },
      {
        key: 'speedDisplay',
        label: 'Speed',
        sortKey: 'speedValue',
        type: 'text',
        align: 'center'
      },
      {
        key: 'bandwidthUsage',
        label: 'Bandwidth Usage',
        sortKey: 'bandwidthUsagePercent',
        type: 'bandwidth',
        align: 'center'
      }
    ];
  }

  private buildTopConversationsTableRow(item: NetworkTopConversationTableApiItem): TopConversationsTableRowViewData {
    const row = new TopConversationsTableRowViewData();
    row.name = item.name;
    row.bitsReceiveDisplay = this.formatValueWithUnit(item.bits_received);
    row.bitsReceiveValue = Number(item.bits_received_bps || 0);
    row.bitsSentDisplay = this.formatValueWithUnit(item.bits_sent);
    row.bitsSentValue = Number(item.bits_sent_bps || 0);
    row.interfaceType = item.interface_type;
    row.operationalStatus = item.operational_status;
    row.speedDisplay = this.formatValueWithUnit(item.speed);
    row.speedValue = Number(item.speed_bps || 0);
    row.bandwidthUsagePercent = this.normalizeBandwidthUsagePercent(item.bandwidth_usage);
    row.bandwidthUsageLabel = `${row.bandwidthUsagePercent}%`;
    row.bandwidthUsageTone = this.getBandwidthUsageTone(row.bandwidthUsagePercent);
    return row;
  }

  private convertTopBitsMetricItems(
    items: NetworkTopConversationMetricApiItem[],
    metric: 'received' | 'sent'
  ): NetworkConversationMetricItem[] {
    return (items || []).map(item => {
      const value = metric === 'received'
        ? Number(item.bits_received_bps || 0)
        : Number(item.bits_sent_bps || 0);
      const displayValue = this.formatValueWithUnit(metric === 'received' ? item.bits_received : item.bits_sent);
      const category = this.getTopBitsCategory(value, metric);

      return {
        conversation_name: item.name,
        value: value,
        display_value: displayValue,
        category: category,
        color: this.getTopBitsColor(category, metric)
      };
    });
  }

  private convertTopBitsMetricItemsFromTable(
    items: NetworkTopConversationTableApiItem[],
    metric: 'received' | 'sent'
  ): NetworkConversationMetricItem[] {
    return (items || [])
      .slice()
      .sort((left, right) => {
        const leftValue = metric === 'received' ? Number(left.bits_received_bps || 0) : Number(left.bits_sent_bps || 0);
        const rightValue = metric === 'received' ? Number(right.bits_received_bps || 0) : Number(right.bits_sent_bps || 0);
        return rightValue - leftValue;
      })
      .slice(0, 10)
      .map(item => {
        const value = metric === 'received'
          ? Number(item.bits_received_bps || 0)
          : Number(item.bits_sent_bps || 0);
        const displayValue = this.formatValueWithUnit(metric === 'received' ? item.bits_received : item.bits_sent);
        const category = this.getTopBitsCategory(value, metric);

        return {
          conversation_name: item.name,
          value,
          display_value: displayValue,
          category,
          color: this.getTopBitsColor(category, metric)
        };
      });
  }

  private convertTopBandwidthUsageItems(items: NetworkTopBandwidthUsageApiItem[]): NetworkBandwidthUsageItem[] {
    return (items || []).map(item => {
      const value = this.normalizeBandwidthUsagePercent(item.bandwidth_usage);
      const category = this.getBandwidthUsageTone(value);
      return {
        conversation_name: item.name,
        value: value,
        display_value: `${value}%`,
        category: category,
        color: this.getBandwidthUsageColor(category)
      };
    });
  }

  private convertTopBandwidthUsageItemsFromTable(items: NetworkTopConversationTableApiItem[]): NetworkBandwidthUsageItem[] {
    return (items || [])
      .slice()
      .sort((left, right) => this.normalizeBandwidthUsagePercent(right.bandwidth_usage) - this.normalizeBandwidthUsagePercent(left.bandwidth_usage))
      .slice(0, 10)
      .map(item => {
        const value = this.normalizeBandwidthUsagePercent(item.bandwidth_usage);
        const category = this.getBandwidthUsageTone(value);
        return {
          conversation_name: item.name,
          value,
          display_value: `${value}%`,
          category,
          color: this.getBandwidthUsageColor(category)
        };
      });
  }

  private buildTopBitsReceivedLegends(items: NetworkTopConversationMetricApiItem[]): NetworkMetricLegendItem[] {
    return this.buildTopBitsLegends((items || []).map(item => Number(item.bits_received_bps || 0)), 'received');
  }

  private buildTopBitsSentLegends(items: NetworkTopConversationMetricApiItem[]): NetworkMetricLegendItem[] {
    return this.buildTopBitsLegends((items || []).map(item => Number(item.bits_sent_bps || 0)), 'sent');
  }

  private buildTopBitsLegends(values: number[], metric: 'received' | 'sent'): NetworkMetricLegendItem[] {
    const highThreshold = metric === 'received' ? 300000 : 250000;
    const mediumThreshold = metric === 'received' ? 220000 : 180000;
    return [
      { label: `High (>${this.formatLegendValue(highThreshold)})`, category: 'high', color: this.getTopBitsColor('high', metric) },
      { label: `Medium (${this.formatLegendValue(mediumThreshold)}-${this.formatLegendValue(highThreshold)})`, category: 'medium', color: this.getTopBitsColor('medium', metric) },
      { label: `Low (<${this.formatLegendValue(mediumThreshold)})`, category: 'low', color: this.getTopBitsColor('low', metric) }
    ];
  }

  private buildTopBitsLegendsFromTable(
    items: NetworkTopConversationTableApiItem[],
    metric: 'received' | 'sent'
  ): NetworkMetricLegendItem[] {
    const values = (items || []).map(item => metric === 'received'
      ? Number(item.bits_received_bps || 0)
      : Number(item.bits_sent_bps || 0));
    return this.buildTopBitsLegends(values, metric);
  }

  private buildTopBandwidthUsageLegends(items: NetworkTopBandwidthUsageApiItem[]): NetworkMetricLegendItem[] {
    const values = (items || []).map(item => this.normalizeBandwidthUsagePercent(item.bandwidth_usage));
    const legends: NetworkMetricLegendItem[] = [];

    if (values.some(value => value > 70)) {
      legends.push({ label: 'Critical (>70%)', category: 'critical', color: this.getBandwidthUsageColor('critical') });
    }
    if (values.some(value => value > 40 && value <= 70)) {
      legends.push({ label: 'Warning (40%-70%)', category: 'warning', color: this.getBandwidthUsageColor('warning') });
    }
    if (values.some(value => value <= 40)) {
      legends.push({ label: 'Healthy (<40%)', category: 'healthy', color: this.getBandwidthUsageColor('healthy') });
    }

    return legends;
  }

  private buildTopBandwidthUsageLegendsFromTable(items: NetworkTopConversationTableApiItem[]): NetworkMetricLegendItem[] {
    const values = (items || []).map(item => this.normalizeBandwidthUsagePercent(item.bandwidth_usage));
    const legends: NetworkMetricLegendItem[] = [];

    if (values.some(value => value > 70)) {
      legends.push({ label: 'Critical (>70%)', category: 'critical', color: this.getBandwidthUsageColor('critical') });
    }
    if (values.some(value => value > 40 && value <= 70)) {
      legends.push({ label: 'Warning (40%-70%)', category: 'warning', color: this.getBandwidthUsageColor('warning') });
    }
    if (values.some(value => value <= 40)) {
      legends.push({ label: 'Healthy (<40%)', category: 'healthy', color: this.getBandwidthUsageColor('healthy') });
    }

    return legends;
  }

  private formatValueWithUnit(valueWithUnit?: NetworkValueWithUnit): string {
    const value = valueWithUnit?.value;
    const unit = valueWithUnit?.unit || '';

    if (value == null) {
      return '';
    }

    if (!unit) {
      return `${value}`;
    }

    return unit.length <= 1 ? `${value}${unit}` : `${value} ${unit}`;
  }

  private normalizeBandwidthUsagePercent(value?: number): number {
    const numericValue = Number(value || 0);
    const percentValue = numericValue <= 1 ? numericValue * 100 : numericValue;
    return Number(percentValue.toFixed(2));
  }

  private getTopBitsCategory(value: number, metric: 'received' | 'sent'): string {
    const highThreshold = metric === 'received' ? 300000 : 250000;
    const mediumThreshold = metric === 'received' ? 220000 : 180000;

    if (value > highThreshold) {
      return 'high';
    }

    if (value >= mediumThreshold) {
      return 'medium';
    }

    return 'low';
  }

  private getTopBitsColor(category: string, metric: 'received' | 'sent'): string {
    const palettes = metric === 'received'
      ? { high: '#156a3d', medium: '#2bc764', low: '#8be3b2' }
      : { high: '#28489d', medium: '#4d8af0', low: '#b8d3ff' };

    return palettes[category] || palettes.low;
  }

  private getBandwidthUsageColor(category: string): string {
    switch (category) {
      case 'critical':
        return '#e53845';
      case 'warning':
        return '#ff821c';
      default:
        return '#17b657';
    }
  }

  private formatLegendValue(value: number): string {
    if (value >= 1000000) {
      return `${Number((value / 1000000).toFixed(1))}M`;
    }

    if (value >= 1000) {
      return `${Number((value / 1000).toFixed(0))}K`;
    }

    return `${Math.round(value)}`;
  }

  private buildPerformanceWorkloadTableColumns(): PerformanceWorkloadTableColumnViewData[] {
    return [
      {
        key: 'deviceName',
        label: 'Device Name',
        sortKey: 'deviceName',
        align: 'left'
      },
      {
        key: 'cpuDisplay',
        label: 'CPU Utilization (%)',
        sortKey: 'cpuPercent',
        type: 'utilization',
        align: 'left'
      },
      {
        key: 'memoryDisplay',
        label: 'Memory Utilization (%)',
        sortKey: 'memoryPercent',
        type: 'utilization',
        align: 'left'
      },
      {
        key: 'interfaceTrafficInDisplay',
        label: 'Interface Traffic In (Mbps)',
        sortKey: 'interfaceTrafficInMbps',
        align: 'left'
      },
      {
        key: 'interfaceTrafficOutDisplay',
        label: 'Interface Traffic Out (Mbps)',
        sortKey: 'interfaceTrafficOutMbps',
        align: 'left'
      }
    ];
  }

  private buildPerformanceWorkloadTableRow(item: NetworkPerformanceWorkloadInsightItem | NetworkPerformanceInsightsTableApiItem): PerformanceWorkloadTableRowViewData {
    const row = new PerformanceWorkloadTableRowViewData();
    row.deviceName = item.device_name;
    row.cpuPercent = this.getPerformanceCpuUtilization(item);
    row.cpuDisplay = `${row.cpuPercent}%`;
    row.cpuTone = this.getPerformanceUtilizationTone(row.cpuPercent);
    row.memoryPercent = this.getPerformanceMemoryUtilization(item);
    row.memoryDisplay = `${row.memoryPercent}%`;
    row.memoryTone = this.getPerformanceUtilizationTone(row.memoryPercent);
    row.interfaceTrafficInMbps = this.getPerformanceTrafficIn(item);
    row.interfaceTrafficInDisplay = this.formatValueWithUnit((item as NetworkPerformanceInsightsTableApiItem).traffic_in) || `${row.interfaceTrafficInMbps} Mbps`;
    row.interfaceTrafficOutMbps = this.getPerformanceTrafficOut(item);
    row.interfaceTrafficOutDisplay = this.formatValueWithUnit((item as NetworkPerformanceInsightsTableApiItem).traffic_out) || `${row.interfaceTrafficOutMbps} Mbps`;
    row.tone = this.getPerformanceWorkloadTone(item);
    return row;
  }

  private convertCpuVsMemoryItems(items: NetworkCpuVsMemoryPerformanceApiItem[]): NetworkPerformanceWorkloadInsightItem[] {
    return (items || []).map(item => ({
      device_name: item.device_name,
      cpu_utilization_percent: Number(item.cpu_utilization || 0),
      memory_utilization_percent: Number(item.memory_utilization || 0),
      interface_traffic_in_mbps: 0,
      interface_traffic_out_mbps: 0
    }));
  }

  private convertTrafficInVsOutItems(items: NetworkTrafficInVsOutApiItem[]): NetworkPerformanceWorkloadInsightItem[] {
    return (items || []).map(item => ({
      device_name: item.device_name,
      cpu_utilization_percent: 0,
      memory_utilization_percent: 0,
      interface_traffic_in_mbps: Number(item.traffic_in || 0),
      interface_traffic_out_mbps: Number(item.traffic_out || 0)
    }));
  }

  private convertPerformanceTableItems(items: NetworkPerformanceInsightsTableApiItem[]): NetworkPerformanceWorkloadInsightItem[] {
    return (items || []).map(item => ({
      device_name: item.device_name,
      cpu_utilization_percent: Number(item.cpu_utilization || 0),
      memory_utilization_percent: Number(item.memory_utilization || 0),
      interface_traffic_in_mbps: Number(item.traffic_in?.value || 0),
      interface_traffic_out_mbps: Number(item.traffic_out?.value || 0)
    }));
  }

  private formatAxisTitle(label?: string, unit?: string, fallback?: string): string {
    if (label && unit) {
      return `${label} (${unit})`;
    }

    if (label) {
      return label;
    }

    return fallback || '';
  }

  private buildInterfaceHealthMetricChart(
    key: string,
    title: string,
    thresholdType: 'errors' | 'discards',
    tooltipMetricLabel: string,
    items: NetworkInterfaceHealthMetricItem[],
    getValue: (item: NetworkInterfaceHealthMetricItem) => number,
    xMax: number,
    xInterval: number
  ): InterfaceHealthMetricChartViewData {
    const chart = new InterfaceHealthMetricChartViewData();
    chart.key = key;
    chart.title = title;
    chart.infoTooltip = this.getInterfaceHealthInfoTooltip(thresholdType);
    chart.chartHeight = 220;
    chart.chartData = items.length ? this.convertToInterfaceHealthBarChartData(
      items,
      getValue,
      thresholdType,
      tooltipMetricLabel,
      Math.max(xInterval, xMax),
      xInterval
    ) : null;
    chart.legendItems = chart.chartData ? this.buildInterfaceHealthLegendItems(thresholdType) : [];
    return chart;
  }

  private buildInterfaceHealthMetricsTableColumns(): InterfaceHealthMetricsTableColumnViewData[] {
    return [
      {
        key: 'interfaceName',
        label: 'Interface',
        sortKey: 'interfaceName',
        align: 'left'
      },
      {
        key: 'deviceName',
        label: 'Device',
        sortKey: 'deviceName',
        align: 'left'
      },
      {
        key: 'errorsInDisplay',
        label: 'Errors (In)',
        sortKey: 'errorsInValue',
        align: 'left'
      },
      {
        key: 'errorsOutDisplay',
        label: 'Errors (Out)',
        sortKey: 'errorsOutValue',
        align: 'left'
      },
      {
        key: 'discardsInDisplay',
        label: 'Discards (In)',
        sortKey: 'discardsInValue',
        align: 'left'
      },
      {
        key: 'discardsOutDisplay',
        label: 'Discards (Out)',
        sortKey: 'discardsOutValue',
        align: 'left'
      }
    ];
  }

  private buildInterfaceHealthMetricsTableRow(item: NetworkInterfaceHealthMetricItem | NetworkInterfaceHealthMetricsTableApiItem): InterfaceHealthMetricsTableRowViewData {
    const row = new InterfaceHealthMetricsTableRowViewData();
    row.interfaceName = (item as NetworkInterfaceHealthMetricItem).interface_name || (item as NetworkInterfaceHealthMetricsTableApiItem).interface;
    row.deviceName = (item as NetworkInterfaceHealthMetricItem).device_name || (item as NetworkInterfaceHealthMetricsTableApiItem).device;
    row.errorsInValue = this.getInterfaceHealthErrorsInbound(item);
    row.errorsInDisplay = this.formatPerSecondValue(row.errorsInValue);
    row.errorsOutValue = this.getInterfaceHealthErrorsOutbound(item);
    row.errorsOutDisplay = this.formatPerSecondValue(row.errorsOutValue);
    row.discardsInValue = this.getInterfaceHealthDiscardsInbound(item);
    row.discardsInDisplay = this.formatPerSecondValue(row.discardsInValue);
    row.discardsOutValue = this.getInterfaceHealthDiscardsOutbound(item);
    row.discardsOutDisplay = this.formatPerSecondValue(row.discardsOutValue);
    return row;
  }

  private buildInterfaceHealthLegendItems(
    thresholdType: 'errors' | 'discards'
  ): InterfaceHealthMetricLegendItemViewData[] {
    if (thresholdType === 'errors') {
      return [
        this.buildInterfaceHealthLegendItem('Critical (>8/s)', '#ec6674'),
        this.buildInterfaceHealthLegendItem('Warning (4-8/s)', '#ffc233'),
        this.buildInterfaceHealthLegendItem('Healthy (<4/s)', '#41c774')
      ];
    }

    return [
      this.buildInterfaceHealthLegendItem('Critical (>5/s)', '#ec6674'),
      this.buildInterfaceHealthLegendItem('Warning (1.5-5/s)', '#ffc233'),
      this.buildInterfaceHealthLegendItem('Healthy (<1.5/s)', '#41c774')
    ];
  }

  private buildInterfaceHealthLegendItem(label: string, color: string): InterfaceHealthMetricLegendItemViewData {
    const item = new InterfaceHealthMetricLegendItemViewData();
    item.label = label;
    item.color = color;
    return item;
  }

  private getInterfaceHealthInfoTooltip(thresholdType: 'errors' | 'discards'): string {
    return thresholdType === 'errors'
      ? 'Critical (>8/s), Warning (4-8/s), Healthy (<4/s)'
      : 'Critical (>5/s), Warning (1.5-5/s), Healthy (<1.5/s)';
  }

  private buildNetworkDeviceAvailabilityChartCard(
    key: string,
    title: string,
    chartData: UnityChartDetails,
    chartHeight: number,
    legendItems: NetworkDeviceAvailabilityLegendItemViewData[],
    infoTooltip: string
  ): NetworkDeviceAvailabilityCardViewData {
    const card = new NetworkDeviceAvailabilityCardViewData();
    card.key = key;
    card.title = title;
    card.cardKind = 'chart';
    card.chartData = chartData;
    card.chartHeight = chartHeight;
    card.legendItems = card.chartData ? legendItems : [];
    card.infoTooltip = infoTooltip;
    return card;
  }

  private buildLowestAvailabilityCard(data: NetworkLowestAvailabilityApiItem[]): NetworkDeviceAvailabilityCardViewData {
    const card = new NetworkDeviceAvailabilityCardViewData();
    card.key = 'lowest-availability';
    card.title = 'Lowest Availability';
    card.cardKind = 'lowest-availability';
    card.lowestAvailabilityRows = data
      .slice()
      .sort((left, right) => Number(left.availability || 0) - Number(right.availability || 0))
      .slice(0, 5)
      .map(item => this.buildLowestAvailabilityRow(item));
    if (card.lowestAvailabilityRows.length) {
      card.badgeLabel = 'Low Availability';
      card.badgeTone = 'critical';
    }
    return card;
  }

  private aggregateLowestAvailability(items: NetworkDeviceAvailabilityTableApiItem[]): NetworkLowestAvailabilityApiItem[] {
    return (items || []).map(item => ({
      id: item.id,
      device: item.name,
      device_type: item.type,
      availability: Number(item.availability || 0),
      status: item.status,
      location: item.location,
      datacenter: item.datacenter
    }));
  }

  private buildLowestAvailabilityRow(item: NetworkLowestAvailabilityApiItem): NetworkDeviceAvailabilityLowestAvailabilityRowViewData {
    const row = new NetworkDeviceAvailabilityLowestAvailabilityRowViewData();
    row.name = item.device;
    row.availabilityValue = Number(item.availability || 0);
    row.availabilityDisplay = this.formatAvailabilityPercent(row.availabilityValue);
    row.statusLabel = this.getDeviceAvailabilityStatusLabel(item.status);
    row.statusTone = this.getDeviceAvailabilityStatusCode(item.status);
    return row;
  }

  private buildNetworkDeviceAvailabilityTableColumns(): NetworkDeviceAvailabilityTableColumnViewData[] {
    return [
      {
        key: 'name',
        label: 'Name',
        sortKey: 'name',
        type: 'text',
        align: 'left'
      },
      {
        key: 'type',
        label: 'Type',
        sortKey: 'type',
        type: 'text',
        align: 'left'
      },
      {
        key: 'manufacturer',
        label: 'Manufacturer',
        sortKey: 'manufacturer',
        type: 'text',
        align: 'left'
      },
      {
        key: 'model',
        label: 'Model',
        sortKey: 'model',
        type: 'text',
        align: 'left'
      },
      {
        key: 'location',
        label: 'Location',
        sortKey: 'location',
        type: 'text',
        align: 'left'
      },
      {
        key: 'uptimeDisplay',
        label: 'Uptime',
        sortKey: 'uptimeValue',
        type: 'text',
        align: 'left'
      },
      {
        key: 'availabilityDisplay',
        label: 'Availability',
        sortKey: 'availabilityValue',
        type: 'availability',
        align: 'left'
      },
      {
        key: 'statusLabel',
        label: 'Status',
        sortKey: 'statusRank',
        type: 'status',
        align: 'left'
      },
      {
        key: 'lastDiscovered',
        label: 'Last Discovered',
        sortKey: 'lastDiscovered',
        type: 'text',
        align: 'left'
      }
    ];
  }

  private buildNetworkDeviceAvailabilityTableRow(item: NetworkDeviceAvailabilityTableApiItem): NetworkDeviceAvailabilityTableRowViewData {
    const row = new NetworkDeviceAvailabilityTableRowViewData();
    const healthState = this.getNetworkDeviceAvailabilityHealthState(item);
    row.name = item.name;
    row.type = item.type || '';
    row.manufacturer = item.manufacturer || '';
    row.model = item.model || '';
    row.location = item.location || '';
    row.uptimeValue = Number(item.uptime?.value || 0);
    row.uptimeDisplay = item.uptime?.display || this.formatUptimeDays(row.uptimeValue, item.uptime?.unit || 'days');
    row.availabilityValue = Number(item.availability || 0);
    row.availabilityDisplay = this.formatAvailabilityPercent(row.availabilityValue);
    row.statusLabel = this.getHealthStateLabel(healthState);
    row.statusRank = this.getHealthStateRank(healthState);
    row.statusTone = this.getHealthStateTone(healthState);
    row.statusIconClass = this.getHealthStateIconClass(healthState);
    row.lastDiscovered = item.last_discovered || '';
    return row;
  }

  private aggregateDeviceHealthDistribution(items: NetworkDeviceAvailabilityTableApiItem[]): NetworkDeviceHealthDistributionApiItem[] {
    const counts = { Down: 0, Up: 0, Unknown: 0 };

    (items || []).forEach(item => {
      const state = this.getNetworkDeviceAvailabilityHealthState(item);
      if (state === 'down') {
        counts.Down += 1;
      } else if (state === 'up') {
        counts.Up += 1;
      } else {
        counts.Unknown += 1;
      }
    });

    return Object.keys(counts).map(status => ({
      status,
      count: counts[status]
    }));
  }

  private aggregateDeviceTypeDistribution(items: NetworkDeviceAvailabilityTableApiItem[]): NetworkDeviceTypeDistributionApiItem[] {
    const grouped = new Map<string, number>();

    (items || []).forEach(item => {
      const type = item.type || 'Unknown';
      grouped.set(type, (grouped.get(type) || 0) + 1);
    });

    return Array.from(grouped.entries()).map(([type, count]) => ({
      type,
      count
    }));
  }

  private aggregateManufacturerModelBreakdown(items: NetworkDeviceAvailabilityTableApiItem[]): NetworkManufacturerModelBreakdownApiItem[] {
    const manufacturers = new Map<string, Map<string, number>>();

    (items || []).forEach(item => {
      const manufacturer = item.manufacturer || 'Unknown';
      const model = item.model || 'Unknown';
      if (!manufacturers.has(manufacturer)) {
        manufacturers.set(manufacturer, new Map<string, number>());
      }
      const modelCounts = manufacturers.get(manufacturer);
      modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
    });

    return Array.from(manufacturers.entries()).map(([manufacturer, modelCounts]) => ({
      manufacturer,
      count: Array.from(modelCounts.values()).reduce((total, count) => total + count, 0),
      models: Array.from(modelCounts.entries()).map(([model, count]) => ({
        model,
        count
      }))
    }));
  }

  private aggregateDevicesByLocation(items: NetworkDeviceAvailabilityTableApiItem[]): NetworkDevicesByLocationApiItem[] {
    const grouped = new Map<string, NetworkDevicesByLocationApiItem>();

    (items || []).forEach(item => {
      const key = item.datacenter || item.location || 'Unknown';
      const existing = grouped.get(key) || {
        datacenter_id: item.datacenter_id,
        datacenter: item.datacenter || item.location || 'Unknown',
        location: item.location || item.datacenter || 'Unknown',
        count: 0
      };
      existing.count = Number(existing.count || 0) + 1;
      grouped.set(key, existing);
    });

    return Array.from(grouped.values());
  }

  private aggregateAverageUptimeByDeviceType(items: NetworkDeviceAvailabilityTableApiItem[]): NetworkAverageUptimeByDeviceTypeApiItem[] {
    const grouped = new Map<string, { totalDays: number; count: number }>();

    (items || []).forEach(item => {
      const type = item.type || 'Unknown';
      const uptimeDays = this.normalizeUptimeToDays(item.uptime);
      const current = grouped.get(type) || { totalDays: 0, count: 0 };
      current.totalDays += uptimeDays;
      current.count += 1;
      grouped.set(type, current);
    });

    return Array.from(grouped.entries()).map(([type, totals]) => ({
      type,
      average_uptime_days: totals.count ? Number((totals.totalDays / totals.count).toFixed(2)) : 0,
      monitored_devices: totals.count
    }));
  }

  private normalizeUptimeToDays(uptime?: NetworkDeviceAvailabilityUptime): number {
    if (uptime?.seconds != null) {
      return Number(uptime.seconds) / 86400;
    }

    const value = Number(uptime?.value || 0);
    const unit = String(uptime?.unit || 'days').toLowerCase();

    switch (unit) {
      case 'hour':
      case 'hours':
        return value / 24;
      case 'minute':
      case 'minutes':
        return value / 1440;
      case 'second':
      case 'seconds':
        return value / 86400;
      default:
        return value;
    }
  }

  private buildNetworkDeviceAvailabilityLegendItem(label: string, color: string): NetworkDeviceAvailabilityLegendItemViewData {
    const item = new NetworkDeviceAvailabilityLegendItemViewData();
    item.label = label;
    item.color = color;
    return item;
  }

  private buildWeightedLegendItems(values: string[], getColor: (label: string) => string): NetworkDeviceAvailabilityLegendItemViewData[] {
    return Array.from(new Set(values.filter(Boolean))).map(label => this.buildNetworkDeviceAvailabilityLegendItem(label, getColor(label)));
  }

  private convertToDeviceHealthDistributionChartData(items: { status?: string; count?: number }[]): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.PIE;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const order = ['Down', 'Up', 'Unknown'];
    const data = order
      .map(state => ({
        name: state,
        value: items
          .filter(item => item.status === state)
          .reduce((total, item) => total + Number(item.count || 0), 0),
        itemStyle: {
          color: this.getHealthStateColor(state)
        }
      }))
      .filter(item => item.value > 0);

    chart.options = this.buildDistributionDonutChartOptions(data, '68%', '40%');
    return chart;
  }

  private convertToDeviceTypeDistributionChartData(items: { type?: string; count?: number }[]): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.PIE;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const data = items.map(item => ({
      name: item.type,
      value: Number(item.count || 0),
      itemStyle: {
        color: this.getDeviceTypeColor(item.type)
      }
    }));

    chart.options = this.buildDistributionPieChartOptions(data);
    return chart;
  }

  private convertToManufacturerModelBreakdownChartData(items: NetworkManufacturerModelBreakdownResponse['data']): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const manufacturers = items.map(item => item.manufacturer || '');
    const models = this.getManufacturerModels(items);
    const totalsByManufacturer = manufacturers.map(manufacturer =>
      items
        .filter(item => item.manufacturer === manufacturer)
        .reduce((total, item) => total + Number(item.count || 0), 0)
    );
    const highestTotal = Math.max(...totalsByManufacturer, 0);
    const xMax = highestTotal <= 10
      ? Math.max(2, Math.ceil(highestTotal / 2) * 2)
      : this.getRoundedAxisMax(totalsByManufacturer, 10, 5);
    const xInterval = highestTotal <= 10
      ? Math.max(1, Math.ceil(xMax / 4))
      : Math.max(5, Math.ceil(xMax / 4 / 5) * 5);

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any[]) => {
          const lines = params
            .filter(item => item.value)
            .map(item => `${item.seriesName}: ${item.value.toLocaleString()}`);
          return `${params[0]?.name || ''}<br>${lines.join('<br>')}`;
        }
      },
      grid: {
        left: 78,
        right: 18,
        top: 14,
        bottom: 22,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: xMax,
        interval: xInterval,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7f8995',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: manufacturers,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          width: 68,
          overflow: 'truncate'
        }
      },
      series: models.map(model => ({
        name: model,
        type: 'bar',
        stack: 'devices',
        barWidth: 14,
        data: manufacturers.map(manufacturer => this.getWeightedManufacturerModelValue(items, manufacturer, model)),
        itemStyle: {
          color: this.getManufacturerModelColor(model)
        },
        emphasis: {
          focus: 'series'
        }
      }))
    };

    return chart;
  }

  private convertToDevicesByLocationChartData(items: NetworkDevicesByLocationResponse['data']): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.PIE;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const data = items.map(item => ({
      name: item.datacenter || item.location,
      value: Number(item.count || 0),
      itemStyle: {
        color: this.getDeviceLocationColor(item.datacenter || item.location)
      }
    }));

    chart.options = this.buildDistributionDonutChartOptions(data, '68%', '42%');
    return chart;
  }

  private convertToAverageUptimeChartData(items: NetworkAverageUptimeByDeviceTypeResponse['data'], unit: string): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const categories = this.getDeviceTypesByOrder(items);
    const values = categories.map(category => this.getAverageUptimeForCategory(items, category));
    const yMax = this.getRoundedAxisMax(values, 50, 25);
    const yInterval = Math.max(25, Math.ceil(yMax / 5 / 5) * 5);

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.name}<br>Average Uptime: ${params.value} ${unit}`
      },
      grid: {
        left: 50,
        right: 14,
        top: 14,
        bottom: 52,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#97a3b3'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 11,
          interval: 0,
          rotate: 28
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: yInterval,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          formatter: (value: number) => value === 0 ? `0 ${unit}` : `${value}`
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 34,
          data: values.map(value => ({
            value,
            itemStyle: {
              color: '#3f86d4'
            }
          }))
        }
      ]
    };

    return chart;
  }

  private buildDistributionDonutChartOptions(data: any[], outerRadius: string, innerRadius: string): any {
    return {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.name}: ${params.value.toLocaleString()}`
      },
      series: [
        {
          type: 'pie',
          radius: [innerRadius, outerRadius],
          center: ['50%', '47%'],
          startAngle: 90,
          minAngle: 4,
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#566373',
            fontSize: 11,
            formatter: (params: any) => params.value.toLocaleString()
          },
          labelLine: {
            length: 14,
            length2: 10,
            lineStyle: {
              color: '#95a2b0'
            }
          },
          data
        }
      ]
    };
  }

  private buildDistributionPieChartOptions(data: any[]): any {
    return {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.name}: ${params.value.toLocaleString()} (${params.percent}%)`
      },
      series: [
        {
          type: 'pie',
          radius: '68%',
          center: ['50%', '48%'],
          startAngle: 90,
          minAngle: 4,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#566373',
            fontSize: 10,
            formatter: (params: any) => `${params.percent}%`
          },
          labelLine: {
            length: 14,
            length2: 10,
            lineStyle: {
              color: '#95a2b0'
            }
          },
          data
        }
      ]
    };
  }

  private aggregateWeightedDeviceCounts(
    items: NetworkDeviceAvailabilityItem[],
    getKey: (item: NetworkDeviceAvailabilityItem) => string
  ): string[] {
    const totals = items.reduce((map, item) => {
      const key = getKey(item);
      map[key] = (map[key] || 0) + item.device_count_weight;
      return map;
    }, {} as { [key: string]: number });

    return Object.keys(totals).sort((left, right) => {
      const leftOrder = this.getDeviceTypeOrder(left);
      const rightOrder = this.getDeviceTypeOrder(right);
      const leftIsKnownDeviceType = leftOrder !== 99;
      const rightIsKnownDeviceType = rightOrder !== 99;

      if (leftIsKnownDeviceType && rightIsKnownDeviceType) {
        return leftOrder - rightOrder;
      }

      if (leftIsKnownDeviceType || rightIsKnownDeviceType) {
        return leftIsKnownDeviceType ? -1 : 1;
      }

      return totals[right] - totals[left];
    });
  }

  private getManufacturersByWeightedTotal(items: NetworkDeviceAvailabilityItem[]): string[] {
    const totals = items.reduce((map, item) => {
      map[item.manufacturer] = (map[item.manufacturer] || 0) + item.device_count_weight;
      return map;
    }, {} as { [key: string]: number });

    return Object.keys(totals).sort((left, right) => totals[right] - totals[left]);
  }

  private getManufacturerModels(items: { models?: { model?: string }[] }[]): string[] {
    return Array.from(new Set(items.reduce((models, item) => {
      (item.models || []).forEach(model => {
        if (model?.model) {
          models.push(model.model);
        }
      });
      return models;
    }, [] as string[]))).sort((left, right) => {
      return this.getManufacturerModelOrder(left) - this.getManufacturerModelOrder(right);
    });
  }

  private getWeightedManufacturerModelValue(
    items: { manufacturer?: string; models?: { model?: string; count?: number }[] }[],
    manufacturer: string,
    model: string
  ): number {
    return items
      .filter(item => item.manufacturer === manufacturer)
      .reduce((total, item) => {
        const matchedModel = (item.models || []).find(modelItem => modelItem.model === model);
        return total + Number(matchedModel?.count || 0);
      }, 0);
  }

  private getDeviceTypesByOrder(items: { type?: string }[]): string[] {
    return Array.from(new Set(items.map(item => item.type).filter(Boolean))).sort((left, right) => this.getDeviceTypeOrder(left) - this.getDeviceTypeOrder(right));
  }

  private getAverageUptimeForCategory(items: { type?: string; average_uptime_days?: number }[], category: string): number {
    const categoryItems = items.filter(item => item.type === category);
    if (!categoryItems.length) {
      return 0;
    }

    const total = categoryItems.reduce((sum, item) => sum + Number(item.average_uptime_days || 0), 0);
    return Number((total / categoryItems.length).toFixed(1));
  }

  private formatUptimeDays(days: number, unit: string = 'days'): string {
    return `${days} ${unit}`;
  }

  private formatAvailabilityPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  private getNetworkDeviceAvailabilityHealthState(item: NetworkDeviceAvailabilityTableApiItem): string {
    const rawStatus = typeof item?.status === 'string'
      ? item.status
      : item?.status?.label || item?.status?.code || item?.health_state || '';

    const normalizedStatus = String(rawStatus || '').trim().toLowerCase();

    if (normalizedStatus === 'up') {
      return 'up';
    }

    if (normalizedStatus === 'down') {
      return 'down';
    }

    return 'unknown';
  }

  private getDeviceAvailabilityStatusCode(
    status?: NetworkDeviceAvailabilityStatus | 'healthy' | 'warning' | 'critical' | 'Up' | 'Down' | 'Unknown' | 'up' | 'down' | 'unknown'
  ): 'healthy' | 'warning' | 'critical' {
    const code = typeof status === 'string' ? status : status?.code;
    if (code === 'critical' || code === 'warning' || code === 'down' || code === 'Down') {
      return code === 'warning' ? 'warning' : 'critical';
    }
    if (code === 'unknown' || code === 'Unknown') {
      return 'warning';
    }
    if (code === 'healthy' || code === 'up' || code === 'Up') {
      return 'healthy';
    }
    if (code === 'critical') {
      return code;
    }
    return 'healthy';
  }

  private getDeviceAvailabilityStatusRank(
    status?: NetworkDeviceAvailabilityStatus | 'healthy' | 'warning' | 'critical' | 'Up' | 'Down' | 'Unknown' | 'up' | 'down' | 'unknown'
  ): number {
    switch (this.getDeviceAvailabilityStatusCode(status)) {
      case 'critical':
        return 3;
      case 'warning':
        return 2;
      default:
        return 1;
    }
  }

  private getDeviceAvailabilityStatusLabel(
    status?: NetworkDeviceAvailabilityStatus | 'healthy' | 'warning' | 'critical' | 'Up' | 'Down' | 'Unknown' | 'up' | 'down' | 'unknown'
  ): string {
    if (typeof status !== 'string' && status?.label) {
      return status.label;
    }

    if (status === 'Up' || status === 'up') {
      return 'Up';
    }
    if (status === 'Down' || status === 'down') {
      return 'Down';
    }
    if (status === 'Unknown' || status === 'unknown') {
      return 'Unknown';
    }

    switch (this.getDeviceAvailabilityStatusCode(status)) {
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      default:
        return 'Healthy';
    }
  }

  private getDeviceAvailabilityStatusIconClass(
    status?: NetworkDeviceAvailabilityStatus | 'healthy' | 'warning' | 'critical' | 'Up' | 'Down' | 'Unknown' | 'up' | 'down' | 'unknown'
  ): string {
    switch (this.getDeviceAvailabilityStatusCode(status)) {
      case 'critical':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-check-circle';
    }
  }

  private getHealthStateLabel(state: string): string {
    switch (state) {
      case 'down':
        return 'Down';
      case 'up':
        return 'Up';
      default:
        return 'Unknown';
    }
  }

  private getHealthStateTone(state: string): 'critical' | 'healthy' | 'warning' {
    switch ((state || '').toLowerCase()) {
      case 'down':
        return 'critical';
      case 'up':
        return 'healthy';
      default:
        return 'warning';
    }
  }

  private getHealthStateRank(state: string): number {
    switch ((state || '').toLowerCase()) {
      case 'down':
        return 3;
      case 'unknown':
        return 2;
      default:
        return 1;
    }
  }

  private getHealthStateIconClass(state: string): string {
    switch ((state || '').toLowerCase()) {
      case 'down':
        return 'fas fa-times-circle';
      case 'up':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-exclamation-circle';
    }
  }

  private getHealthStateColor(state: string): string {
    switch ((state || '').toLowerCase()) {
      case 'down':
        return '#d10000';
      case 'up':
        return '#19bb73';
      default:
        return '#a5b1bd';
    }
  }

  private getDeviceTypeColor(type: string): string {
    switch (type) {
      case 'Router':
        return '#5a74d8';
      case 'Switch':
        return '#91ca73';
      case 'Firewall':
        return '#ffc54c';
      case 'Load Balancer':
        return '#eb6a79';
      case 'VPN Gateway':
        return '#63b6e4';
      default:
        return '#7bc67e';
    }
  }

  private getDeviceTypeOrder(type: string): number {
    switch (type) {
      case 'Router':
        return 1;
      case 'Switch':
        return 2;
      case 'Firewall':
        return 3;
      case 'Load Balancer':
        return 4;
      case 'VPN Gateway':
        return 5;
      case 'PDU':
        return 6;
      default:
        return 99;
    }
  }

  private getManufacturerModelColor(model: string): string {
    const paletteIndex = this.getManufacturerModelPaletteIndex(model);
    return this.manufacturerModelPalette[paletteIndex];
  }

  private getManufacturerModelOrder(model: string): number {
    switch (model) {
      case 'ASR 9000':
        return 1;
      case '7050SX':
        return 2;
      case 'PA-5250':
        return 3;
      case 'Nexus 9500':
        return 4;
      case 'Catalyst 9300':
        return 5;
      case 'FG-200F':
        return 6;
      case 'BIG-IP i5800':
        return 7;
      case 'ASA 5500':
        return 8;
      default:
        return 99;
    }
  }

  private getManufacturerModelPaletteIndex(model: string): number {
    const orderedIndex = this.getManufacturerModelOrder(model);
    if (orderedIndex !== 99) {
      return (orderedIndex - 1) % this.manufacturerModelPalette.length;
    }

    const normalized = String(model || '').trim().toLowerCase();
    let hash = 0;
    for (let index = 0; index < normalized.length; index++) {
      hash = ((hash << 5) - hash) + normalized.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash) % this.manufacturerModelPalette.length;
  }

  private getDeviceLocationColor(location: string): string {
    const normalized = String(location || '').trim().toLowerCase();
    let hash = 0;
    for (let index = 0; index < normalized.length; index++) {
      hash = ((hash << 5) - hash) + normalized.charCodeAt(index);
      hash |= 0;
    }

    return this.manufacturerModelPalette[Math.abs(hash) % this.manufacturerModelPalette.length];
  }

  private buildEnvironmentalHealthChart(
    key: string,
    title: string,
    chartData: UnityChartDetails,
    chartHeight: number,
    infoTooltip: string,
    legendItems: EnvironmentalHealthLegendItemViewData[] = []
  ): EnvironmentalHealthChartViewData {
    const chart = new EnvironmentalHealthChartViewData();
    chart.key = key;
    chart.title = title;
    chart.chartData = chartData;
    chart.chartHeight = chartHeight;
    chart.infoTooltip = infoTooltip;
    chart.legendItems = chart.chartData ? legendItems : [];
    return chart;
  }

  private buildEnvironmentalLegendItem(label: string, color: string): EnvironmentalHealthLegendItemViewData {
    const item = new EnvironmentalHealthLegendItemViewData();
    item.label = label;
    item.color = color;
    return item;
  }

  private buildEnvironmentalHealthTableColumns(): EnvironmentalHealthSummaryTableColumnViewData[] {
    return [
      {
        key: 'deviceName',
        label: 'Device Name',
        sortKey: 'deviceName',
        type: 'text',
        align: 'left'
      },
      {
        key: 'deviceType',
        label: 'Device Type',
        sortKey: 'deviceType',
        type: 'text',
        align: 'left'
      },
      {
        key: 'powerSupplyADisplay',
        label: 'Power Supply A',
        sortKey: 'powerSupplyAStatusRank',
        type: 'status',
        align: 'left'
      },
      {
        key: 'powerSupplyBDisplay',
        label: 'Power Supply B',
        sortKey: 'powerSupplyBStatusRank',
        type: 'status',
        align: 'left'
      },
      {
        key: 'fanStatusDisplay',
        label: 'Fan Status',
        sortKey: 'fanStatusRank',
        type: 'fan',
        align: 'left'
      },
      {
        key: 'inletTempDisplay',
        label: 'Inlet Temp',
        sortKey: 'inletTempValue',
        type: 'temperature',
        align: 'left'
      },
      {
        key: 'outletTempDisplay',
        label: 'Outlet Temp',
        sortKey: 'outletTempValue',
        type: 'temperature',
        align: 'left'
      },
      {
        key: 'hotSpotTempDisplay',
        label: 'HotSpot Temp',
        sortKey: 'hotSpotTempValue',
        type: 'temperature',
        align: 'left'
      }
    ];
  }

  private buildEnvironmentalHealthTableRow(item: NetworkEnvironmentalHealthSummaryItem | NetworkEnvironmentalHealthSummaryTableApiItem): EnvironmentalHealthSummaryTableRowViewData {
    const row = new EnvironmentalHealthSummaryTableRowViewData();
    row.deviceName = item.device_name;
    row.deviceType = item.device_type;
    row.powerSupplyADisplay = this.getPowerSupplyStatusLabel((item as NetworkEnvironmentalHealthSummaryTableApiItem).power_supply_a || (item as any).power_supply_a_status);
    row.powerSupplyAStatusTone = this.getPowerSupplyStatusCode((item as NetworkEnvironmentalHealthSummaryTableApiItem).power_supply_a || (item as any).power_supply_a_status);
    row.powerSupplyAStatusRank = this.getPowerSupplyStatusRank((item as NetworkEnvironmentalHealthSummaryTableApiItem).power_supply_a || (item as any).power_supply_a_status);
    row.powerSupplyBDisplay = this.getPowerSupplyStatusLabel((item as NetworkEnvironmentalHealthSummaryTableApiItem).power_supply_b || (item as any).power_supply_b_status);
    row.powerSupplyBStatusTone = this.getPowerSupplyStatusCode((item as NetworkEnvironmentalHealthSummaryTableApiItem).power_supply_b || (item as any).power_supply_b_status);
    row.powerSupplyBStatusRank = this.getPowerSupplyStatusRank((item as NetworkEnvironmentalHealthSummaryTableApiItem).power_supply_b || (item as any).power_supply_b_status);
    row.fanStatusDisplay = this.getEnvironmentalFanStatusLabel(item);
    row.fanStatusTone = this.getEnvironmentalFanStatusTone(item);
    row.fanStatusRank = this.getFanStatusRank(row.fanStatusTone as any);
    row.fanStatusMeta = this.getEnvironmentalFanStatusMeta(item);
    row.inletTempValue = this.getEnvironmentalTemperatureValue(item, 'inlet');
    row.inletTempDisplay = this.formatTemperature(row.inletTempValue, this.getEnvironmentalTemperatureUnit(item, 'inlet'));
    row.inletTempTone = this.getEnvironmentalTemperatureTone(item, 'inlet');
    row.outletTempValue = this.getEnvironmentalTemperatureValue(item, 'outlet');
    row.outletTempDisplay = this.formatTemperature(row.outletTempValue, this.getEnvironmentalTemperatureUnit(item, 'outlet'));
    row.outletTempTone = this.getEnvironmentalTemperatureTone(item, 'outlet');
    row.hotSpotTempValue = this.getEnvironmentalTemperatureValue(item, 'hotspot');
    row.hotSpotTempDisplay = this.formatTemperature(row.hotSpotTempValue, this.getEnvironmentalTemperatureUnit(item, 'hotspot'));
    row.hotSpotTempTone = this.getEnvironmentalTemperatureTone(item, 'hotspot');
    return row;
  }

  private convertToHotSpotTemperatureChartData(data: NetworkTopDevicesByHotspotTemperatureResponse): UnityChartDetails {
    const items = data?.data || [];
    if (!items.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const rankedItems = items.slice().sort((left, right) => Number(right.temperature || 0) - Number(left.temperature || 0)).slice(0, 10);
    const warningThreshold = Number(data?.thresholds?.warning || 40);
    const criticalThreshold = Number(data?.thresholds?.critical || 47);
    const unit = data?.thresholds?.unit || 'C';
    const xMax = Math.max(60, this.getRoundedAxisMax(rankedItems.map(item => Number(item.temperature || 0)).concat([criticalThreshold]), 5, 5));

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const item = params.data.item;
          return `Device: ${item.device_name}<br>HotSpot Temperature: ${this.formatTemperature(item.temperature, item.unit || unit)}`;
        }
      },
      grid: {
        left: 112,
        right: 36,
        top: 26,
        bottom: 38,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: xMax,
        interval: 10,
        name: 'Temp (°C)',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: {
          color: '#727d89',
          fontSize: 11
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rankedItems.map(item => item.device_name),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          width: 92,
          overflow: 'truncate'
        }
      },
      series: [
        {
          type: 'bar',
          name: 'Background',
          barWidth: 12,
          barGap: '-100%',
          silent: true,
          data: rankedItems.map(() => xMax),
          itemStyle: {
            color: '#eef3f7',
            borderRadius: 6
          },
          z: 1
        },
        {
          type: 'bar',
          barWidth: 12,
          data: rankedItems.map(item => ({
            value: Number(item.temperature || 0),
            item,
            itemStyle: {
              color: this.getHotSpotBarColor(Number(item.temperature || 0), warningThreshold, criticalThreshold),
              borderRadius: 6
            }
          })),
          label: {
            show: true,
            position: 'right',
            distance: 6,
            color: '#5f6975',
            fontSize: 10,
            formatter: (params: any) => `${params.value} ${unit}`
          },
          markLine: {
            symbol: 'none',
            silent: true,
            label: {
              show: true,
              position: 'start',
              distance: 6,
              color: '#6f7f8d',
              fontSize: 10,
              verticalAlign: 'top',
              formatter: (params: any) => params.data.name
            },
            lineStyle: {
              width: 1.5,
              type: 'dashed'
            },
            data: [
              {
                xAxis: warningThreshold,
                name: `${warningThreshold}${unit} Warning`,
                lineStyle: {
                  color: '#ffba08'
                }
              },
              {
                xAxis: criticalThreshold,
                name: `${criticalThreshold}${unit} Critical`,
                lineStyle: {
                  color: '#df3b4a'
                }
              }
            ]
          },
          z: 2
        }
      ]
    };

    return chart;
  }

  private convertToAverageSensorTemperatureChartData(items: NetworkAverageTemperatureBySensorTypeApiItem[]): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const sensorValues = items.map(item => ({
      name: String(item.label || '').replace(' ', '\n'),
      value: Number(item.average_temperature || 0),
      color: this.getAverageSensorColor(item.sensor_type),
      unit: item.unit || 'C',
      warning_threshold: Number(item.warning_threshold || 0),
      critical_threshold: Number(item.critical_threshold || 0),
      label: item.label || '',
      device_count: Number(item.device_count || 0)
    }));
    const warningThreshold = Math.max(...sensorValues.map(item => item.warning_threshold || 0), 0);
    const criticalThreshold = Math.max(...sensorValues.map(item => item.critical_threshold || 0), 0);
    const yMax = Math.max(60, this.getRoundedAxisMax(sensorValues.map(item => Math.max(item.value, item.critical_threshold)), 5, 5));

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const item = sensorValues[params.dataIndex];
          return `${item.label}: ${this.formatTemperature(params.value, item.unit)}<br>Devices: ${item.device_count}`;
        }
      },
      grid: {
        left: 48,
        right: 22,
        top: 22,
        bottom: 46,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: sensorValues.map(item => item.name),
        axisLine: {
          lineStyle: {
            color: '#97a3b3'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: 10,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 38,
          data: sensorValues.map(item => ({
            value: item.value,
            itemStyle: {
              color: item.color
            }
          })),
          label: {
            show: true,
            position: 'top',
            color: '#4b5562',
            fontSize: 11,
            fontWeight: 700,
            formatter: (params: any) => {
              const item = sensorValues[params.dataIndex];
              return `${params.value}${item.unit}`;
            }
          },
          markLine: {
            symbol: 'none',
            silent: true,
            label: {
              show: true,
              position: 'end',
              distance: 8,
              color: '#6f7f8d',
              fontSize: 10,
              formatter: (params: any) => params.data.name
            },
            data: [
              {
                yAxis: warningThreshold,
                name: `Warning ${warningThreshold}`,
                lineStyle: {
                  color: '#ffba08',
                  width: 1.5,
                  type: 'dashed'
                }
              },
              {
                yAxis: criticalThreshold,
                name: `Critical ${criticalThreshold}`,
                lineStyle: {
                  color: '#df3b4a',
                  width: 1.5,
                  type: 'dashed'
                }
              }
            ]
          }
        }
      ]
    };

    return chart;
  }

  private convertToPowerSupplyStatusDistributionChartData(items: NetworkPowerSupplyStatusDistributionApiItem[]): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const statuses: Array<'normal' | 'warning' | 'failed' | 'unknown'> = ['normal', 'warning', 'failed', 'unknown'];
    const activeStatuses = statuses.filter(status => (items || []).some(item => Number(item[status] || 0) > 0));
    const categories = (items || []).map(item => item.power_supply || '');

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any[]) => {
          const lines = params
            .map(item => `${item.seriesName}: ${item.value}`)
            .join('<br>');
          return `${params[0]?.axisValue}<br>${lines}`;
        }
      },
      grid: {
        left: 44,
        right: 20,
        top: 18,
        bottom: 38,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#97a3b3'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: Math.max(10, this.getRoundedAxisMax((items || []).map(item =>
          Number(item.normal || 0) + Number(item.warning || 0) + Number(item.failed || 0) + Number(item.unknown || 0)
        ), 5, 0)),
        interval: 5,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      series: activeStatuses.map(status => ({
        name: this.getPowerSupplyStatusLabel(status),
        type: 'bar',
        stack: 'power',
        barWidth: 48,
        data: (items || []).map(item => Number(item[status] || 0)),
        itemStyle: {
          color: this.getPowerSupplyStatusColor(status)
        },
        label: {
          show: true,
          color: status === 'warning' ? '#8b5a00' : '#ffffff',
          fontSize: 10,
          fontWeight: 600,
          formatter: (params: any) => params.value ? `${params.value}` : ''
        }
      }))
    };

    return chart;
  }

  private convertToFanHealthByDeviceChartData(items: NetworkFanHealthByDeviceApiItem[]): UnityChartDetails {
    if (!items?.length) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const rankedItems = items.slice(0, 10);
    const xMax = Math.max(5, Math.max(...rankedItems.map(item => Number(item.total_fans || 0)), 0) + 1);

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const item = params.data.item;
          return `Device: ${item.device_name}<br>Fan Status: ${item.status?.label || ''}<br>Healthy Fans: ${item.display || `${item.healthy_fans}/${item.total_fans}`}`;
        }
      },
      grid: {
        left: 98,
        right: 30,
        top: 14,
        bottom: 36,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: xMax,
        interval: 1,
        name: 'Healthy Fans',
        nameLocation: 'middle',
        nameGap: 26,
        nameTextStyle: {
          color: '#727d89',
          fontSize: 11
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rankedItems.map(item => item.device_name),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          width: 78,
          overflow: 'truncate'
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          barGap: '-100%',
          silent: true,
          data: rankedItems.map(item => Number(item.total_fans || 0)),
          itemStyle: {
            color: '#eef3f7',
            borderRadius: 6
          },
          z: 1
        },
        {
          type: 'bar',
          barWidth: 12,
          data: rankedItems.map(item => ({
            value: Number(item.healthy_fans || 0),
            item,
            itemStyle: {
              color: this.getFanHealthColor(this.getEnvironmentalFanHealthTone(item)),
              borderRadius: 6
            }
          })),
          label: {
            show: true,
            position: 'right',
            distance: 6,
            color: '#5f6975',
            fontSize: 10,
            formatter: (params: any) => {
              const item = params.data.item;
              return `${item.display || `${item.healthy_fans}/${item.total_fans}`}`;
            }
          },
          z: 2
        }
      ]
    };

    return chart;
  }

  private getPowerSupplyStatusCode(status?: NetworkStatusCodeLabel | 'normal' | 'warning' | 'failed' | 'unknown'): 'normal' | 'warning' | 'failed' | 'unknown' {
    const code = typeof status === 'string' ? status : status?.code;
    if (code === 'warning' || code === 'failed' || code === 'unknown') {
      return code;
    }
    return 'normal';
  }

  private getPowerSupplyStatusLabel(status?: NetworkStatusCodeLabel | 'normal' | 'warning' | 'failed' | 'unknown'): string {
    if (typeof status !== 'string' && status?.label) {
      return status.label;
    }

    switch (this.getPowerSupplyStatusCode(status)) {
      case 'warning':
        return 'Warning';
      case 'failed':
        return 'Failed';
      case 'unknown':
        return 'Unknown';
      default:
        return 'Normal';
    }
  }

  private getPowerSupplyStatusRank(status?: NetworkStatusCodeLabel | 'normal' | 'warning' | 'failed' | 'unknown'): number {
    switch (this.getPowerSupplyStatusCode(status)) {
      case 'failed':
        return 4;
      case 'warning':
        return 3;
      case 'unknown':
        return 2;
      default:
        return 1;
    }
  }

  private getPowerSupplyStatusColor(status?: NetworkStatusCodeLabel | 'normal' | 'warning' | 'failed' | 'unknown'): string {
    switch (this.getPowerSupplyStatusCode(status)) {
      case 'warning':
        return '#ffba08';
      case 'failed':
        return '#df3b4a';
      case 'unknown':
        return '#a5b1bd';
      default:
        return '#0db14b';
    }
  }

  private getFanStatusRank(tone: 'healthy' | 'warning' | 'critical'): number {
    switch (tone) {
      case 'critical':
        return 3;
      case 'warning':
        return 2;
      default:
        return 1;
    }
  }

  private getFanHealthColor(tone: 'healthy' | 'warning' | 'critical'): string {
    switch (tone) {
      case 'critical':
        return '#df3b4a';
      case 'warning':
        return '#ffba08';
      default:
        return '#0db14b';
    }
  }

  private getHotSpotBarColor(value: number, warningThreshold: number = 40, criticalThreshold: number = 45): string {
    if (value > criticalThreshold) {
      return '#df3b4a';
    }

    if (value > warningThreshold) {
      return '#ffba08';
    }

    return '#0db14b';
  }

  private getTemperatureTone(metric: 'inlet' | 'outlet' | 'hotspot', value: number): 'healthy' | 'warning' | 'critical' {
    if (metric === 'hotspot') {
      if (value > 45) {
        return 'critical';
      }

      if (value > 40) {
        return 'warning';
      }

      return 'healthy';
    }

    if (metric === 'outlet') {
      if (value >= 42) {
        return 'critical';
      }

      if (value >= 36) {
        return 'warning';
      }

      return 'healthy';
    }

    if (value >= 31) {
      return 'critical';
    }

    if (value >= 28) {
      return 'warning';
    }

    return 'healthy';
  }

  private formatTemperature(value: number, unit: string = 'C'): string {
    return `${Number(value || 0)}°${unit}`;
  }

  private buildHotSpotTemperatureInfoTooltip(thresholds?: { warning?: number; critical?: number; unit?: string }): string {
    const unit = thresholds?.unit || 'C';
    const warning = Number(thresholds?.warning || 40);
    const critical = Number(thresholds?.critical || 47);
    return `Warning: temperatures above ${warning}°${unit}. Critical: temperatures above ${critical}°${unit}.`;
  }

  private buildPowerSupplyLegendItems(items: NetworkPowerSupplyStatusDistributionApiItem[]): EnvironmentalHealthLegendItemViewData[] {
    const statuses: Array<'normal' | 'warning' | 'failed' | 'unknown'> = ['normal', 'warning', 'failed', 'unknown'];
    return statuses
      .filter(status => (items || []).some(item => Number(item[status] || 0) > 0))
      .map(status => this.buildEnvironmentalLegendItem(this.getPowerSupplyStatusLabel(status), this.getPowerSupplyStatusColor(status)));
  }

  private getAverageSensorColor(sensorType?: string): string {
    switch (sensorType) {
      case 'inlet_temperature':
        return '#0db14b';
      case 'outlet_temperature':
        return '#8653a5';
      default:
        return '#cf4ae8';
    }
  }

  private getEnvironmentalFanStatusLabel(item: NetworkEnvironmentalHealthSummaryItem | NetworkEnvironmentalHealthSummaryTableApiItem): string {
    const tableItem = item as NetworkEnvironmentalHealthSummaryTableApiItem;
    if (tableItem.fan_status?.status?.label) {
      return tableItem.fan_status.status.label;
    }
    return (item as NetworkEnvironmentalHealthSummaryItem).fan_status_label || '';
  }

  private getEnvironmentalFanStatusTone(item: NetworkEnvironmentalHealthSummaryItem | NetworkEnvironmentalHealthSummaryTableApiItem): 'healthy' | 'warning' | 'critical' {
    const tableItem = item as NetworkEnvironmentalHealthSummaryTableApiItem;
    const code = tableItem.fan_status?.status?.code;
    if (code === 'warning' || code === 'critical') {
      return code;
    }
    return (item as NetworkEnvironmentalHealthSummaryItem).fan_status_tone || 'healthy';
  }

  private getEnvironmentalFanHealthTone(item: NetworkFanHealthByDeviceApiItem): 'healthy' | 'warning' | 'critical' {
    const code = item.status?.code;
    if (code === 'warning' || code === 'critical') {
      return code;
    }
    return 'healthy';
  }

  private getEnvironmentalFanStatusMeta(item: NetworkEnvironmentalHealthSummaryItem | NetworkEnvironmentalHealthSummaryTableApiItem): string {
    const tableItem = item as NetworkEnvironmentalHealthSummaryTableApiItem;
    if (tableItem.fan_status) {
      return `(${Number(tableItem.fan_status.healthy || 0)}/${Number(tableItem.fan_status.total || 0)})`;
    }

    const legacyItem = item as NetworkEnvironmentalHealthSummaryItem;
    return `(${legacyItem.fan_healthy_count}/${legacyItem.fan_total_count})`;
  }

  private getEnvironmentalTemperatureValue(
    item: NetworkEnvironmentalHealthSummaryItem | NetworkEnvironmentalHealthSummaryTableApiItem,
    metric: 'inlet' | 'outlet' | 'hotspot'
  ): number {
    const tableItem = item as NetworkEnvironmentalHealthSummaryTableApiItem;
    if (metric === 'inlet') {
      return Number(tableItem.inlet_temperature?.value ?? (item as NetworkEnvironmentalHealthSummaryItem).inlet_temp_c ?? 0);
    }
    if (metric === 'outlet') {
      return Number(tableItem.outlet_temperature?.value ?? (item as NetworkEnvironmentalHealthSummaryItem).outlet_temp_c ?? 0);
    }
    return Number(tableItem.hotspot_temperature?.value ?? (item as NetworkEnvironmentalHealthSummaryItem).hotspot_temp_c ?? 0);
  }

  private getEnvironmentalTemperatureUnit(
    item: NetworkEnvironmentalHealthSummaryItem | NetworkEnvironmentalHealthSummaryTableApiItem,
    metric: 'inlet' | 'outlet' | 'hotspot'
  ): string {
    const tableItem = item as NetworkEnvironmentalHealthSummaryTableApiItem;
    if (metric === 'inlet') {
      return tableItem.inlet_temperature?.unit || 'C';
    }
    if (metric === 'outlet') {
      return tableItem.outlet_temperature?.unit || 'C';
    }
    return tableItem.hotspot_temperature?.unit || 'C';
  }

  private getEnvironmentalTemperatureTone(
    item: NetworkEnvironmentalHealthSummaryItem | NetworkEnvironmentalHealthSummaryTableApiItem,
    metric: 'inlet' | 'outlet' | 'hotspot'
  ): 'healthy' | 'warning' | 'critical' {
    const tableItem = item as NetworkEnvironmentalHealthSummaryTableApiItem;
    const status = metric === 'inlet'
      ? tableItem.inlet_temperature?.status?.code
      : metric === 'outlet'
        ? tableItem.outlet_temperature?.status?.code
        : tableItem.hotspot_temperature?.status?.code;

    if (status === 'warning' || status === 'critical') {
      return status;
    }

    if (status === 'normal' || status === 'healthy') {
      return 'healthy';
    }

    return this.getTemperatureTone(metric, this.getEnvironmentalTemperatureValue(item, metric));
  }

  private getRoundedAverage(values: number[]): number {
    if (!values?.length) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.round(total / values.length);
  }

  private buildAlertEventsSummaryMetrics(summary: NetworkAlertEventsSummaryResponse): AlertEventsSummaryMetricViewData[] {
    return [
      this.buildAlertEventsSummaryMetric('Critical Alerts', Number(summary?.critical_alerts || 0), 'critical'),
      this.buildAlertEventsSummaryMetric('Warning Alerts', Number(summary?.warning_alerts || 0), 'warning'),
      this.buildAlertEventsSummaryMetric('Open ITSM Tickets', Number(summary?.open_itsm_tickets || 0), 'info')
    ];
  }

  private buildAlertEventsSummaryMetric(
    label: string,
    value: number,
    tone: 'critical' | 'warning' | 'info'
  ): AlertEventsSummaryMetricViewData {
    const metric = new AlertEventsSummaryMetricViewData();
    metric.label = label;
    metric.value = value;
    metric.tone = tone;
    return metric;
  }

  private buildAlertEventsChart(
    key: string,
    title: string,
    chartData: UnityChartDetails,
    chartHeight: number,
    legendItems: AlertEventsLegendItemViewData[] = []
  ): AlertEventsChartViewData {
    const chart = new AlertEventsChartViewData();
    chart.key = key;
    chart.title = title;
    chart.chartData = chartData;
    chart.chartHeight = chartHeight;
    chart.legendItems = chartData ? legendItems : [];
    return chart;
  }

  private buildAlertEventsLegendItem(label: string, color: string): AlertEventsLegendItemViewData {
    const item = new AlertEventsLegendItemViewData();
    item.label = label;
    item.color = color;
    return item;
  }

  private buildAlertEventsStatsCards(alertStats: NetworkAlertStatsResponse): AlertEventsStatsCardViewData[] {
    return [
      this.buildAlertEventsStatsCard(
        'Event Processing',
        this.formatPercentValue(alertStats?.event_processing?.noise_reduction),
        [
          this.buildAlertEventsStatsMetric('Dedupe Events', alertStats?.event_processing?.dedupe_events),
          this.buildAlertEventsStatsMetric('Suppressed Events', alertStats?.event_processing?.suppressed_events),
          this.buildAlertEventsStatsMetric('Correlated', alertStats?.event_processing?.correlated)
        ]
      ),
      this.buildAlertEventsStatsCard(
        'Ticket Automation',
        this.formatPercentValue(alertStats?.ticket_automation?.first_response),
        [
          this.buildAlertEventsStatsMetric('Auto Cloned', alertStats?.ticket_automation?.auto_cloned),
          this.buildAlertEventsStatsMetric('Ticket Created', alertStats?.ticket_automation?.ticket_created),
          this.buildAlertEventsStatsMetric('Auto Closed', alertStats?.ticket_automation?.auto_closed)
        ]
      )
    ];
  }

  private buildAlertEventsStatsCard(
    title: string,
    highlightValue: string,
    metrics: AlertEventsStatsMetricViewData[]
  ): AlertEventsStatsCardViewData {
    const card = new AlertEventsStatsCardViewData();
    card.title = title;
    card.highlightValue = highlightValue;
    card.metrics = metrics;
    return card;
  }

  private buildAlertEventsStatsMetric(label: string, value: number): AlertEventsStatsMetricViewData {
    const metric = new AlertEventsStatsMetricViewData();
    metric.label = label;
    metric.value = Number(value || 0).toLocaleString();
    return metric;
  }

  private buildAlertEventsTableColumns(): AlertEventsTableColumnViewData[] {
    return [
      {
        key: 'id',
        label: 'ID',
        sortKey: 'idValue',
        type: 'text',
        align: 'left'
      },
      {
        key: 'deviceName',
        label: 'Device Name',
        sortKey: 'deviceName',
        type: 'text',
        align: 'left'
      },
      {
        key: 'severityLabel',
        label: 'Severity',
        sortKey: 'severityRank',
        type: 'severity',
        align: 'center'
      },
      {
        key: 'description',
        label: 'Description',
        sortKey: 'description',
        type: 'text',
        align: 'left'
      },
      {
        key: 'source',
        label: 'Source',
        sortKey: 'source',
        type: 'text',
        align: 'left'
      },
      {
        key: 'acknowledgedDisplay',
        label: 'Acknowledged',
        sortKey: 'acknowledgedRank',
        type: 'text',
        align: 'left'
      },
      {
        key: 'durationDisplay',
        label: 'Duration',
        sortKey: 'durationSeconds',
        type: 'text',
        align: 'left'
      }
    ];
  }

  private buildAlertEventsTableRow(item: NetworkTopCriticalAlertApiItem): AlertEventsTableRowViewData {
    const row = new AlertEventsTableRowViewData();
    const severity = this.getAlertEventsSeverityCode(item?.severity?.code || item?.severity?.label);
    row.id = String(item?.id || '');
    row.idValue = Number(item?.id || 0);
    row.uuid = item?.uuid || '';
    row.deviceName = item?.device_name || '';
    row.severityLabel = this.getAlertEventsSeverityLabel(severity);
    row.severityTone = severity;
    row.severityRank = this.getAlertEventsSeverityRank(severity);
    row.severityIconClass = this.getAlertEventsSeverityIconClass(severity);
    row.description = item?.description || '';
    row.source = item?.source || '';
    row.acknowledgedDisplay = item?.acknowledged ? 'Yes' : 'No';
    row.acknowledgedRank = item?.acknowledged ? 1 : 0;
    row.durationDisplay = item?.duration?.display || '';
    row.durationSeconds = Number(item?.duration?.seconds || 0);
    return row;
  }

  private convertToAlertsBySeverityChartData(items: NetworkAlertsBySeverityApiItem[]): UnityChartDetails {
    if (!items?.length || !items.some(item => Number(item?.count || 0) > 0)) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.PIE;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    chart.options = this.buildDistributionDonutChartOptions(
      items.map(item => ({
        name: this.getAlertEventsSeverityLegendLabel(this.getAlertEventsSeverityCategory(item?.severity)),
        value: Number(item?.count || 0),
        itemStyle: {
          color: this.getAlertEventsSeverityColor(this.getAlertEventsSeverityCategory(item?.severity))
        }
      })),
      '70%',
      '42%'
    );
    return chart;
  }

  private convertToAlertsByDeviceTypeChartData(items: NetworkAlertsByDeviceTypeApiItem[]): UnityChartDetails {
    if (!items?.length || !items.some(item =>
      Number(item?.critical || 0) > 0 || Number(item?.warning || 0) > 0 || Number(item?.information || 0) > 0
    )) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const totals = items.map(item => Number(item?.critical || 0) + Number(item?.warning || 0) + Number(item?.information || 0));
    const yMax = Math.max(1500, this.getRoundedAxisMax(totals, 300, 0));

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any[]) => {
          const lines = params.map(item => `${item.seriesName}: ${item.value}`).join('<br>');
          return `${params[0]?.axisValue}<br>${lines}`;
        }
      },
      grid: {
        left: 46,
        right: 12,
        top: 18,
        bottom: 40,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: items.map(item => item?.device_type || ''),
        axisLine: {
          lineStyle: {
            color: '#97a3b3'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 11,
          rotate: 26
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: 300,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          formatter: (value: number) => value.toLocaleString()
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      series: [
        {
          name: 'Critical',
          type: 'bar',
          stack: 'alerts',
          barWidth: 34,
          data: items.map(item => Number(item?.critical || 0)),
          itemStyle: {
            color: '#d10000'
          }
        },
        {
          name: 'Warning',
          type: 'bar',
          stack: 'alerts',
          barWidth: 34,
          data: items.map(item => Number(item?.warning || 0)),
          itemStyle: {
            color: '#ff8d0a'
          }
        },
        {
          name: 'Info',
          type: 'bar',
          stack: 'alerts',
          barWidth: 34,
          data: items.map(item => Number(item?.information || 0)),
          itemStyle: {
            color: '#4a8fd6'
          }
        }
      ]
    };

    return chart;
  }

  private convertToOpenItsmTicketsChartData(items: NetworkOpenItsmTicketsByDeviceTypeApiItem[]): UnityChartDetails {
    if (!items?.length || !items.some(item => Number(item?.count || 0) > 0)) {
      return null;
    }
    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const yMax = Math.max(1500, this.getRoundedAxisMax(items.map(item => Number(item?.count || 0)), 300, 0));

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.name}: ${params.value.toLocaleString()}`
      },
      grid: {
        left: 46,
        right: 12,
        top: 18,
        bottom: 40,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: items.map(item => item?.device_type || ''),
        axisLine: {
          lineStyle: {
            color: '#97a3b3'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 11,
          rotate: 26
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: 300,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          formatter: (value: number) => value.toLocaleString()
        },
        splitLine: {
          lineStyle: {
            color: '#e8edf3'
          }
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 34,
          data: items.map(item => ({
            value: Number(item?.count || 0),
            itemStyle: {
              color: '#4a8fd6'
            }
          }))
        }
      ]
    };

    return chart;
  }

  private formatPercentValue(metric?: { value?: number; unit?: string }): string {
    if (metric?.value === undefined || metric?.value === null) {
      return '0%';
    }
    return `${Number(metric.value).toFixed(1)}${metric.unit || '%'}`;
  }

  private getAlertEventsSeverityLegendLabel(severity: 'critical' | 'warning' | 'normal'): string {
    switch (severity) {
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      default:
        return 'Information';
    }
  }

  private getAlertEventsSeverityLabel(severity: 'critical' | 'warning'): string {
    return severity === 'critical' ? 'Critical' : 'Warning';
  }

  private getAlertEventsSeverityCategory(severity?: string): 'critical' | 'warning' | 'normal' {
    const normalized = String(severity || '').toLowerCase();
    if (normalized === 'critical') {
      return 'critical';
    }
    if (normalized === 'warning') {
      return 'warning';
    }
    return 'normal';
  }

  private getAlertEventsSeverityCode(severity?: string): 'critical' | 'warning' {
    return String(severity || '').toLowerCase() === 'warning' ? 'warning' : 'critical';
  }

  private getAlertEventsSeverityColor(severity: 'critical' | 'warning' | 'normal'): string {
    switch (severity) {
      case 'critical':
        return '#d10000';
      case 'warning':
        return '#ff8d0a';
      default:
        return '#3f8ad8';
    }
  }

  private getAlertEventsSeverityRank(severity: 'critical' | 'warning'): number {
    return severity === 'critical' ? 2 : 1;
  }

  private getAlertEventsSeverityIconClass(severity: 'critical' | 'warning'): string {
    return severity === 'critical' ? 'fas fa-exclamation-circle' : 'fas fa-exclamation-circle';
  }

  private buildAutoRemediationChart(
    key: string,
    title: string,
    chartData: UnityChartDetails,
    chartHeight: number
  ): AutoRemediationChartViewData {
    const chart = new AutoRemediationChartViewData();
    chart.key = key;
    chart.title = title;
    chart.chartData = chartData;
    chart.chartHeight = chartHeight;
    return chart;
  }

  private buildAutoRemediationLegendItem(label: string, color: string): AutoRemediationLegendItemViewData {
    const item = new AutoRemediationLegendItemViewData();
    item.label = label;
    item.color = color;
    return item;
  }

  private buildAutoRemediationMetric(
    label: string,
    value: string,
    tone: 'success' | 'danger'
  ): AutoRemediationMetricViewData {
    const metric = new AutoRemediationMetricViewData();
    metric.label = label;
    metric.value = value;
    metric.tone = tone;
    return metric;
  }

  private convertToAutoRemediationSuccessFailureChartData(data: NetworkAutoRemediationSummaryMetrics): UnityChartDetails {
    const successPercent = data?.success_percent || 0;
    const failedPercent = data?.failed_percent || 0;
    const runningPercent = data?.running_percent || 0;
    const totalPercent = successPercent + failedPercent + runningPercent;

    if (!totalPercent) {
      return null;
    }

    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.PIE;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.name}: ${params.value.toLocaleString()} (${params.percent}%)`
      },
      series: [
        {
          type: 'pie',
          radius: ['44%', '72%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          data: [
            {
              name: 'Successful',
              value: successPercent,
              itemStyle: {
                color: '#67a628'
              }
            },
            {
              name: 'Failed',
              value: failedPercent,
              itemStyle: {
                color: '#e24a4a'
              }
            },
            {
              name: 'Running',
              value: runningPercent,
              itemStyle: {
                color: '#f0ab2c'
              }
            }
          ]
        }
      ]
    };
    return chart;
  }

  private convertToAutoRemediationTopActionsChartData(items: NetworkAutoRemediationActionItem[]): UnityChartDetails {
    if (!items?.length) {
      return null;
    }

    const chart = new UnityChartDetails();
    chart.type = UnityChartTypes.BAR;
    chart.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const normalizedItems = items.map((item, index) => ({
      actionName: item.action_name || item.name || item.label || `Action ${index + 1}`,
      runs: item.runs ?? item.count ?? item.value ?? 0,
      color: item.color || this.manufacturerModelPalette[index % this.manufacturerModelPalette.length]
    }));

    const maxRuns = Math.max(...normalizedItems.map(item => item.runs), 0);
    const xMax = this.getRoundedAxisMax([maxRuns], 50, 40);

    chart.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.data.actionName}: ${params.data.value}`
      },
      grid: {
        left: 104,
        right: 34,
        top: 16,
        bottom: 10,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: xMax,
        show: false
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: normalizedItems.map(item => item.actionName),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#27313b',
          fontSize: 10,
          width: 96,
          overflow: 'truncate'
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 8,
          data: normalizedItems.map(item => ({
            value: item.runs,
            actionName: item.actionName,
            itemStyle: {
              color: item.color,
              borderRadius: 8
            }
          })),
          label: {
            show: true,
            position: 'right',
            distance: 8,
            color: '#27313b',
            fontSize: 10,
            formatter: (params: any) => `${params.value}`
          }
        }
      ]
    };

    return chart;
  }

  private buildPerformanceScatterChart(
    key: string,
    title: string,
    yAxisTitle: string,
    xAxisTitle: string,
    items: NetworkPerformanceWorkloadInsightItem[],
    getXValue: (item: NetworkPerformanceWorkloadInsightItem) => number,
    getYValue: (item: NetworkPerformanceWorkloadInsightItem) => number,
    getTooltip: (item: NetworkPerformanceWorkloadInsightItem) => string,
    xMin: number,
    xMax: number,
    xInterval: number,
    yMin: number,
    yMax: number,
    yInterval: number
  ): PerformanceWorkloadChartViewData {
    const chart = new PerformanceWorkloadChartViewData();
    chart.key = key;
    chart.title = title;
    chart.yAxisTitle = yAxisTitle;
    chart.chartHeight = 262;
    chart.chartData = this.convertToPerformanceScatterChartData(
      items,
      getXValue,
      getYValue,
      getTooltip,
      xAxisTitle,
      xMin,
      xMax,
      xInterval,
      yMin,
      yMax,
      yInterval
    );
    return chart;
  }

  private buildLegendItem(legend: NetworkMetricLegendItem): TopConversationsLegendItemViewData {
    const item = new TopConversationsLegendItemViewData();
    item.label = legend.label;
    item.color = legend.color;
    return item;
  }

  private convertToConversationFunnelChartData(items: NetworkConversationMetricItem[]): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.FUNNEL;
    view.options = this.chartConfigSvc.getDefaultFunnelChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.FUNNEL);

    const maxValue = Math.max(...items.map(item => item.value), 0) || 1;

    view.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.data.conversationName}: ${params.data.displayValue}`
      },
      series: [
        {
          type: 'funnel',
          left: '6%',
          top: 10,
          bottom: 8,
          width: '88%',
          min: 0,
          max: maxValue,
          minSize: '36%',
          maxSize: '100%',
          sort: 'descending',
          funnelAlign: 'center',
          gap: 4,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => `${this.truncateChartLabel(params.data.conversationName, 22)}: ${params.data.displayValue}`,
            color: '#f7fbff',
            fontSize: 9,
            fontWeight: 600
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2,
            borderRadius: 8
          },
          data: items.map(item => ({
            name: item.conversation_name,
            conversationName: item.conversation_name,
            value: item.value,
            displayValue: item.display_value,
            itemStyle: {
              color: item.color,
              borderColor: '#ffffff',
              borderWidth: 2,
              borderRadius: 8
            }
          }))
        } as any
      ]
    };

    return view;
  }

  private truncateChartLabel(value: string, maxLength: number): string {
    const normalizedValue = String(value || '');
    if (normalizedValue.length <= maxLength) {
      return normalizedValue;
    }

    return `${normalizedValue.slice(0, Math.max(maxLength - 3, 0))}...`;
  }

  private convertToBandwidthUsageChartData(items: NetworkBandwidthUsageItem[]): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params.data.conversationName}: ${params.data.displayValue}`
      },
      grid: {
        left: 96,
        right: 42,
        top: 14,
        bottom: 20,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10,
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: {
            color: '#e5ebf2'
          }
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: items.map(item => item.conversation_name),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8a949e',
          fontSize: 10,
          width: 90,
          overflow: 'truncate',
          margin: 8
        }
      },
      series: [
        {
          name: 'Background',
          type: 'bar',
          barWidth: 6,
          barGap: '-100%',
          silent: true,
          data: items.map(() => 100),
          itemStyle: {
            color: '#edf2f7',
            borderRadius: 6
          },
          z: 1
        },
        {
          name: 'Bandwidth Usage',
          type: 'bar',
          barWidth: 6,
          data: items.map(item => ({
            value: item.value,
            displayValue: item.display_value,
            conversationName: item.conversation_name,
            itemStyle: {
              color: item.color,
              borderRadius: 6
            }
          })),
          label: {
            show: true,
            position: 'right',
            distance: 6,
            color: '#5f6975',
            fontSize: 10,
            formatter: (params: any) => `${params.value}%`
          },
          z: 2
        }
      ]
    };

    return view;
  }

  private convertToPerformanceScatterChartData(
    items: NetworkPerformanceWorkloadInsightItem[],
    getXValue: (item: NetworkPerformanceWorkloadInsightItem) => number,
    getYValue: (item: NetworkPerformanceWorkloadInsightItem) => number,
    getTooltip: (item: NetworkPerformanceWorkloadInsightItem) => string,
    xAxisTitle: string,
    xMin: number,
    xMax: number,
    xInterval: number,
    yMin: number,
    yMax: number,
    yInterval: number
  ): UnityChartDetails {
    if (!items?.length) {
      return null;
    }

    const view = new UnityChartDetails();
    view.type = UnityChartTypes.SCATTER;
    view.options = this.chartConfigSvc.getScatterChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.SCATTER);
    view.options.animation = false;
    view.options.legend = {
      show: false
    };
    view.options.grid = {
      left: 46,
      right: 18,
      top: 10,
      bottom: 52,
      containLabel: false
    };
    view.options.xAxis = {
      type: 'value',
      min: xMin,
      max: xMax,
      interval: xInterval,
      name: xAxisTitle,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#727d89',
        fontSize: 11,
        fontWeight: 500
      },
      axisLine: {
        lineStyle: {
          color: '#97a3b3'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#7f8995',
        fontSize: 10,
        hideOverlap: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e8edf3'
        }
      },
      scale: false
    };
    view.options.yAxis = {
      type: 'value',
      min: yMin,
      max: yMax,
      interval: yInterval,
      axisLine: {
        lineStyle: {
          color: '#97a3b3'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#7f8995',
        fontSize: 10,
        hideOverlap: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e8edf3'
        }
      },
      scale: false
    };
    view.options.tooltip = {
      trigger: 'item',
      backgroundColor: 'rgba(33, 41, 52, 0.94)',
      borderWidth: 0,
      textStyle: {
        color: '#ffffff'
      },
      formatter: (params: any) => getTooltip(params.data.item)
    };
    view.options.series = [
      {
        type: 'scatter',
        symbolSize: 12,
        emphasis: {
          scale: true
        },
        label: {
          show: true,
          position: 'right',
          distance: 6,
          color: '#7b8692',
          fontSize: 10,
          formatter: (params: any) => params.data.name
        },
        data: items.map(item => ({
          name: item.device_name,
          value: [getXValue(item), getYValue(item)],
          item,
          itemStyle: {
            color: this.getPerformanceWorkloadColor(item),
            borderColor: '#ffffff',
            borderWidth: 1.5
          }
        }))
      }
    ];
    return view;
  }

  private convertToInterfaceHealthBarChartData(
    items: NetworkInterfaceHealthMetricItem[],
    getValue: (item: NetworkInterfaceHealthMetricItem) => number,
    thresholdType: 'errors' | 'discards',
    tooltipMetricLabel: string,
    xMax: number,
    xInterval: number
  ): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const item = params.data.item;
          return `Interface: ${item.interface_name}<br>Device: ${item.device_name}<br>${tooltipMetricLabel}: ${this.formatPerSecondValue(params.data.value)}`;
        }
      },
      grid: {
        left: 46,
        right: 14,
        top: 14,
        bottom: 18,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: xMax,
        interval: xInterval,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7d8793',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: '#e5ebf2'
          }
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: items.map(item => item.interface_name),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8a949e',
          fontSize: 10,
          width: 52,
          overflow: 'truncate',
          margin: 8
        }
      },
      series: [
        {
          name: 'Background',
          type: 'bar',
          barWidth: 4,
          barGap: '-100%',
          silent: true,
          data: items.map(() => xMax),
          itemStyle: {
            color: '#edf2f7',
            borderRadius: 4
          },
          z: 1
        },
        {
          name: tooltipMetricLabel,
          type: 'bar',
          barWidth: 4,
          data: items.map(item => ({
            value: getValue(item),
            item,
            itemStyle: {
              color: this.getInterfaceHealthMetricColor(getValue(item), thresholdType),
              borderRadius: 4
            }
          })),
          z: 2
        }
      ]
    };
    return view;
  }

  private getPerformanceWorkloadTone(item: NetworkPerformanceWorkloadInsightItem | NetworkPerformanceInsightsTableApiItem): string {
    const peakUtilization = Math.max(this.getPerformanceCpuUtilization(item), this.getPerformanceMemoryUtilization(item));

    return this.getPerformanceUtilizationTone(peakUtilization);
  }

  private getPerformanceUtilizationTone(value: number): string {
    if (value >= 90) {
      return 'danger';
    }

    if (value >= 72) {
      return 'warning';
    }

    return 'success';
  }

  private getPerformanceWorkloadColor(item: NetworkPerformanceWorkloadInsightItem | NetworkPerformanceInsightsTableApiItem): string {
    switch (this.getPerformanceWorkloadTone(item)) {
      case 'danger':
        return '#e66974';
      case 'warning':
        return '#ffbe2e';
      default:
        return '#43c178';
    }
  }

  private getPerformanceCpuUtilization(item: NetworkPerformanceWorkloadInsightItem | NetworkPerformanceInsightsTableApiItem): number {
    return Number((item as NetworkPerformanceWorkloadInsightItem).cpu_utilization_percent
      ?? (item as NetworkPerformanceInsightsTableApiItem).cpu_utilization
      ?? 0);
  }

  private getPerformanceMemoryUtilization(item: NetworkPerformanceWorkloadInsightItem | NetworkPerformanceInsightsTableApiItem): number {
    return Number((item as NetworkPerformanceWorkloadInsightItem).memory_utilization_percent
      ?? (item as NetworkPerformanceInsightsTableApiItem).memory_utilization
      ?? 0);
  }

  private getPerformanceTrafficIn(item: NetworkPerformanceWorkloadInsightItem | NetworkPerformanceInsightsTableApiItem): number {
    return Number((item as NetworkPerformanceWorkloadInsightItem).interface_traffic_in_mbps
      ?? (item as NetworkPerformanceInsightsTableApiItem).traffic_in?.value
      ?? 0);
  }

  private getPerformanceTrafficOut(item: NetworkPerformanceWorkloadInsightItem | NetworkPerformanceInsightsTableApiItem): number {
    return Number((item as NetworkPerformanceWorkloadInsightItem).interface_traffic_out_mbps
      ?? (item as NetworkPerformanceInsightsTableApiItem).traffic_out?.value
      ?? 0);
  }

  private convertInterfaceHealthChartItems(items: NetworkInterfaceHealthMetricChartApiItem[]): NetworkInterfaceHealthMetricItem[] {
    return (items || []).map(item => ({
      interface_name: item.interface,
      device_name: item.device,
      errors_in_per_sec: 0,
      errors_out_per_sec: 0,
      discards_in_per_sec: 0,
      discards_out_per_sec: 0,
      metric_value: Number(item.value || 0)
    }));
  }

  private convertInterfaceHealthTableItems(items: NetworkInterfaceHealthMetricsTableApiItem[]): NetworkInterfaceHealthMetricItem[] {
    return (items || []).map(item => ({
      interface_name: item.interface,
      device_name: item.device,
      errors_in_per_sec: Number(item.errors_inbound || 0),
      errors_out_per_sec: Number(item.errors_outbound || 0),
      discards_in_per_sec: Number(item.discards_inbound || 0),
      discards_out_per_sec: Number(item.discards_outbound || 0)
    }));
  }

  private getInterfaceHealthTopItems(
    items: NetworkInterfaceHealthMetricItem[],
    getValue: (item: NetworkInterfaceHealthMetricItem) => number
  ): NetworkInterfaceHealthMetricItem[] {
    return (items || [])
      .filter(item => getValue(item) > 0)
      .slice()
      .sort((left, right) => getValue(right) - getValue(left))
      .slice(0, 10);
  }

  private getInterfaceHealthErrorsInbound(item: NetworkInterfaceHealthMetricItem | NetworkInterfaceHealthMetricsTableApiItem): number {
    return Number((item as NetworkInterfaceHealthMetricItem).errors_in_per_sec
      ?? (item as NetworkInterfaceHealthMetricsTableApiItem).errors_inbound
      ?? 0);
  }

  private getInterfaceHealthErrorsOutbound(item: NetworkInterfaceHealthMetricItem | NetworkInterfaceHealthMetricsTableApiItem): number {
    return Number((item as NetworkInterfaceHealthMetricItem).errors_out_per_sec
      ?? (item as NetworkInterfaceHealthMetricsTableApiItem).errors_outbound
      ?? 0);
  }

  private getInterfaceHealthDiscardsInbound(item: NetworkInterfaceHealthMetricItem | NetworkInterfaceHealthMetricsTableApiItem): number {
    return Number((item as NetworkInterfaceHealthMetricItem).discards_in_per_sec
      ?? (item as NetworkInterfaceHealthMetricsTableApiItem).discards_inbound
      ?? 0);
  }

  private getInterfaceHealthDiscardsOutbound(item: NetworkInterfaceHealthMetricItem | NetworkInterfaceHealthMetricsTableApiItem): number {
    return Number((item as NetworkInterfaceHealthMetricItem).discards_out_per_sec
      ?? (item as NetworkInterfaceHealthMetricsTableApiItem).discards_outbound
      ?? 0);
  }

  private getRoundedAxisMax(values: number[], roundTo: number, padding: number): number {
    const maxValue = Math.max(...values, 0);
    return Math.ceil((maxValue + padding) / roundTo) * roundTo;
  }

  private getInterfaceHealthMetricColor(value: number, thresholdType: 'errors' | 'discards'): string {
    if (thresholdType === 'errors') {
      if (value > 8) {
        return '#ec6674';
      }

      if (value >= 4) {
        return '#ffc233';
      }

      return '#41c774';
    }

    if (value > 5) {
      return '#ec6674';
    }

    if (value >= 1.5) {
      return '#ffc233';
    }

    return '#41c774';
  }

  private formatPerSecondValue(value: number): string {
    return `${Number(value || 0).toFixed(1)}/s`;
  }

  private getBandwidthUsageTone(value: number): string {
    if (value < 65) {
      return 'success';
    }

    if (value < 85) {
      return 'warning';
    }

    return 'danger';
  }
}

export class NetworkOverviewViewData {
  deviceAvailability: DeviceAvailabilityViewData;
  discoveredDevices: number;
  monitoredDevices: number;
  deviceTypes: DeviceTypesItemViewData[];
}

export class DeviceAvailabilityViewData {
  percentage: number;
  online: number;
  total: number;
}

export class DeviceTypesItemViewData {
  type: string;
  count: number;
  normal: number;
  normalIconClass: string;
  critical: number;
  criticalIconClass: string;
  unknown: number;
  unknownIconClass: string;
}

export class TopConversationsWidgetViewData {
  cards: TopConversationsCardViewData[] = [];
  tableColumns: TopConversationsTableColumnViewData[] = [];
  tableRows: TopConversationsTableRowViewData[] = [];
  defaultSortColumn: string;
  defaultSortDirection: string;
}

export class TopConversationsCardViewData {
  key: string;
  title: string;
  chartKind: 'funnel' | 'bar';
  chartHeight: number;
  chartData: UnityChartDetails;
  legendItems: TopConversationsLegendItemViewData[] = [];
}

export class TopConversationsLegendItemViewData {
  label: string;
  color: string;
}

export class TopConversationsTableColumnViewData {
  key: string;
  label: string;
  sortKey: string;
  type: 'text' | 'bandwidth';
  align: 'left' | 'center' | 'right';
}

export class TopConversationsTableRowViewData {
  name: string;
  bitsReceiveDisplay: string;
  bitsReceiveValue: number;
  bitsSentDisplay: string;
  bitsSentValue: number;
  interfaceType: string;
  operationalStatus: string;
  speedDisplay: string;
  speedValue: number;
  bandwidthUsagePercent: number;
  bandwidthUsageLabel: string;
  bandwidthUsageTone: string;

  [key: string]: string | number;
}

export class PerformanceWorkloadInsightsWidgetViewData {
  charts: PerformanceWorkloadChartViewData[] = [];
  tableColumns: PerformanceWorkloadTableColumnViewData[] = [];
  tableRows: PerformanceWorkloadTableRowViewData[] = [];
  defaultSortColumn = '';
  defaultSortDirection = '';
}

export class PerformanceWorkloadChartViewData {
  key: string;
  title: string;
  yAxisTitle: string;
  chartHeight: number;
  chartData: UnityChartDetails;
}

export class PerformanceWorkloadTableColumnViewData {
  key: string;
  label: string;
  sortKey: string;
  type?: 'text' | 'utilization';
  align: 'left' | 'center' | 'right';
}

export class PerformanceWorkloadTableRowViewData {
  deviceName: string;
  cpuPercent: number;
  cpuDisplay: string;
  memoryPercent: number;
  memoryDisplay: string;
  interfaceTrafficInMbps: number;
  interfaceTrafficInDisplay: string;
  interfaceTrafficOutMbps: number;
  interfaceTrafficOutDisplay: string;
  tone: string;

  [key: string]: string | number;
}

export class InterfaceHealthMetricsWidgetViewData {
  charts: InterfaceHealthMetricChartViewData[] = [];
  tableColumns: InterfaceHealthMetricsTableColumnViewData[] = [];
  tableRows: InterfaceHealthMetricsTableRowViewData[] = [];
  defaultSortColumn = '';
  defaultSortDirection = '';
}

export class InterfaceHealthMetricChartViewData {
  key: string;
  title: string;
  infoTooltip: string;
  chartHeight: number;
  chartData: UnityChartDetails;
  legendItems: InterfaceHealthMetricLegendItemViewData[] = [];
}

export class InterfaceHealthMetricLegendItemViewData {
  label: string;
  color: string;
}

export class InterfaceHealthMetricsTableColumnViewData {
  key: string;
  label: string;
  sortKey: string;
  align: 'left' | 'center' | 'right';
}

export class InterfaceHealthMetricsTableRowViewData {
  interfaceName: string;
  deviceName: string;
  errorsInValue: number;
  errorsInDisplay: string;
  errorsOutValue: number;
  errorsOutDisplay: string;
  discardsInValue: number;
  discardsInDisplay: string;
  discardsOutValue: number;
  discardsOutDisplay: string;

  [key: string]: string | number;
}

export class NetworkDeviceAvailabilityWidgetViewData {
  cards: NetworkDeviceAvailabilityCardViewData[] = [];
  tableColumns: NetworkDeviceAvailabilityTableColumnViewData[] = [];
  tableRows: NetworkDeviceAvailabilityTableRowViewData[] = [];
  defaultSortColumn = '';
  defaultSortDirection = '';
}

export class NetworkDeviceAvailabilityCardViewData {
  key: string;
  title: string;
  cardKind: 'chart' | 'lowest-availability';
  chartHeight: number;
  chartData: UnityChartDetails;
  legendItems: NetworkDeviceAvailabilityLegendItemViewData[] = [];
  infoTooltip: string;
  badgeLabel: string;
  badgeTone: 'healthy' | 'warning' | 'critical';
  lowestAvailabilityRows: NetworkDeviceAvailabilityLowestAvailabilityRowViewData[] = [];
}

export class NetworkDeviceAvailabilityLegendItemViewData {
  label: string;
  color: string;
}

export class NetworkDeviceAvailabilityLowestAvailabilityRowViewData {
  name: string;
  availabilityValue: number;
  availabilityDisplay: string;
  statusLabel: string;
  statusTone: 'healthy' | 'warning' | 'critical';
}

export class NetworkDeviceAvailabilityTableColumnViewData {
  key: string;
  label: string;
  sortKey: string;
  type: 'text' | 'availability' | 'status';
  align: 'left' | 'center' | 'right';
}

export class NetworkDeviceAvailabilityTableRowViewData {
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  location: string;
  uptimeValue: number;
  uptimeDisplay: string;
  availabilityValue: number;
  availabilityDisplay: string;
  statusLabel: string;
  statusRank: number;
  statusTone: string;
  statusIconClass: string;
  lastDiscovered: string;

  [key: string]: string | number;
}

export class EnvironmentalHealthSummaryWidgetViewData {
  charts: EnvironmentalHealthChartViewData[] = [];
  tableColumns: EnvironmentalHealthSummaryTableColumnViewData[] = [];
  tableRows: EnvironmentalHealthSummaryTableRowViewData[] = [];
  defaultSortColumn = '';
  defaultSortDirection = '';
}

export class EnvironmentalHealthChartViewData {
  key: string;
  title: string;
  infoTooltip: string;
  chartHeight: number;
  chartData: UnityChartDetails;
  legendItems: EnvironmentalHealthLegendItemViewData[] = [];
}

export class EnvironmentalHealthLegendItemViewData {
  label: string;
  color: string;
}

export class EnvironmentalHealthSummaryTableColumnViewData {
  key: string;
  label: string;
  sortKey: string;
  type: 'text' | 'status' | 'fan' | 'temperature';
  align: 'left' | 'center' | 'right';
}

export class EnvironmentalHealthSummaryTableRowViewData {
  deviceName: string;
  deviceType: string;
  powerSupplyADisplay: string;
  powerSupplyAStatusTone: string;
  powerSupplyAStatusRank: number;
  powerSupplyBDisplay: string;
  powerSupplyBStatusTone: string;
  powerSupplyBStatusRank: number;
  fanStatusDisplay: string;
  fanStatusTone: string;
  fanStatusRank: number;
  fanStatusMeta: string;
  inletTempValue: number;
  inletTempDisplay: string;
  inletTempTone: string;
  outletTempValue: number;
  outletTempDisplay: string;
  outletTempTone: string;
  hotSpotTempValue: number;
  hotSpotTempDisplay: string;
  hotSpotTempTone: string;

  [key: string]: string | number;
}

export class AlertEventsViewWidgetViewData {
  summaryMetrics: AlertEventsSummaryMetricViewData[] = [];
  severityChart: AlertEventsChartViewData;
  deviceTypeChart: AlertEventsChartViewData;
  itsmTicketsChart: AlertEventsChartViewData;
  statsCards: AlertEventsStatsCardViewData[] = [];
  tableColumns: AlertEventsTableColumnViewData[] = [];
  tableRows: AlertEventsTableRowViewData[] = [];
  defaultSortColumn = '';
  defaultSortDirection = '';
}

export class AlertEventsSummaryMetricViewData {
  label: string;
  value: number;
  tone: 'critical' | 'warning' | 'info';
}

export class AlertEventsChartViewData {
  key: string;
  title: string;
  chartHeight: number;
  chartData: UnityChartDetails;
  legendItems: AlertEventsLegendItemViewData[] = [];
}

export class AlertEventsLegendItemViewData {
  label: string;
  color: string;
}

export class AlertEventsStatsCardViewData {
  title: string;
  highlightValue: string;
  metrics: AlertEventsStatsMetricViewData[] = [];
}

export class AlertEventsStatsMetricViewData {
  label: string;
  value: string;
}

export class AlertEventsTableColumnViewData {
  key: string;
  label: string;
  sortKey: string;
  type: 'text' | 'severity';
  align: 'left' | 'center' | 'right';
}

export class AlertEventsTableRowViewData {
  id: string;
  idValue: number;
  uuid: string;
  deviceName: string;
  severityLabel: string;
  severityTone: 'critical' | 'warning';
  severityRank: number;
  severityIconClass: string;
  description: string;
  source: string;
  acknowledgedDisplay: string;
  acknowledgedRank: number;
  durationDisplay: string;
  durationSeconds: number;

  [key: string]: string | number;
}

export class AutoRemediationSummaryWidgetViewData {
  successFailureChart: AutoRemediationChartViewData;
  topActionsChart: AutoRemediationChartViewData;
  legendItems: AutoRemediationLegendItemViewData[] = [];
  totalRunsDisplay: string;
  avgDurationDisplay: string;
  metrics: AutoRemediationMetricViewData[] = [];
}

export class AutoRemediationChartViewData {
  key: string;
  title: string;
  chartHeight: number;
  chartData: UnityChartDetails;
}

export class AutoRemediationLegendItemViewData {
  label: string;
  color: string;
}

export class AutoRemediationMetricViewData {
  label: string;
  value: string;
  tone: 'success' | 'danger';
}
