import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { StorageDashboardFilterCriteria } from '../storage-dashboard.type';
import { NetappStorageDashboardService } from './netapp-storage-dashboard.service';
import { NETAPP_STORAGE_CLUSTER_METRICS, NETAPP_STORAGE_TONE_CLASS } from './netapp-storage-dashboard.const';
import {
  NetappStorageChartCard,
  NetappStorageDashboardViewData,
  NetappStorageMetric,
  NetappStorageSection,
  NetappStorageTone,
  NetappStorageViewMode
} from './netapp-storage-dashboard.type';

@Component({
  selector: 'netapp-storage-dashboard',
  templateUrl: './netapp-storage-dashboard.component.html',
  styleUrls: ['./netapp-storage-dashboard.component.scss'],
  providers: [NetappStorageDashboardService]
})
export class NetappStorageDashboardComponent implements OnInit, OnChanges {
  @Input() filters: StorageDashboardFilterCriteria;
  @Input() refreshToken = 0;

  viewModes: Record<string, NetappStorageViewMode> = {};
  readonly data: NetappStorageDashboardViewData = {
    clusterOverview: {
      title: 'Cluster Overview',
      metrics: NETAPP_STORAGE_CLUSTER_METRICS
    }
  };

  clusterOverviewNote = 'Scope: All Clusters | Time Range: 30 Days';
  sections: NetappStorageSection[] = [];
  private allSections: NetappStorageSection[] = [];

  constructor(private svc: NetappStorageDashboardService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.filters || changes.refreshToken) && this.allSections.length) {
      this.applyFilterCriteria();
    }
  }

  ngOnInit(): void {
    this.allSections = [
      {
        key: 'node',
        title: 'Node Info & Metrics',
        metrics: [
          { label: 'Total Nodes', value: '5' }, { label: 'CPU Utilization(Avg)', value: '18%' },
          { label: 'Memory Utilization(Avg)', value: '32%', tone: 'primary' }, { label: 'Network Utilization(Avg)', value: '12%' },
          { label: 'Uptime', value: '45 Days' }
        ],
        columns: ['Cluster', 'Node Name', 'Model', 'OS Version', 'CPU Usage', 'Memory Usage', 'Net Throughput', 'IOPS (Read/Write)', 'Latency (Read/Write)', 'Uptime', 'Status'],
        rows: [['cluster-prod-01', 'node-01', 'AFF A400', 'ONTAP 9.14', '18%', '32%', '2.1 Gbps', '18K / 8K', '1.2 / 2.4 ms', '45 Days', 'Healthy'],
          ['cluster-prod-01', 'node-02', 'AFF A400', 'ONTAP 9.14', '21%', '35%', '2.4 Gbps', '20K / 9K', '1.4 / 2.7 ms', '44 Days', 'Healthy'],
          ['cluster-dr-01', 'node-03', 'AFF C800', 'ONTAP 9.13', '82%', '71%', '1.2 Gbps', '11K / 7K', '4.2 / 6.1 ms', '12 Days', 'Warning']],
        charts: [
          { title: 'CPU Usage Node Distribution', option: this.svc.makeBarOption(['node-01', 'node-02', 'node-03', 'node-04', 'node-05'], [18, 21, 82, 14, 25]) },
          { title: 'Memory Usage Node Distribution', option: this.svc.makeBarOption(['node-01', 'node-02', 'node-03', 'node-04', 'node-05'], [32, 35, 71, 28, 41], '#00b050') },
          { title: 'Top 10 Network Throughput (Gbps)', option: this.svc.makeBarOption(['node-03', 'node-02', 'node-01', 'node-05', 'node-04'], [9.1, 8.5, 7.8, 6.2, 5.7], '#fd7e14', true) },
          { title: 'Top 10 Read/Write IOPS by Node (K)', option: this.svc.makeBarOption(['node-03', 'node-02', 'node-01', 'node-05', 'node-04'], [26, 24, 22, 14, 12], '#378AD8', true) },
          { title: 'Top 10 Dev/Write Throughput', option: this.svc.makeLineOption(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [2.4, 2.7, 2.5, 3.1, 3.4], '#00b050') }
        ]
      },
      {
        key: 'agg',
        title: 'Aggregate Overview',
        metrics: [
          { label: 'Total Aggregates', value: '18' }, { label: 'Used Capacity(Avg)', value: '1.21 PB', tone: 'primary' },
          { label: 'Free Capacity(Avg)', value: '0.61 PB', tone: 'primary' }, { label: 'Overall Utilization', value: '66.5%' }
        ],
        columns: ['Cluster', 'Aggregate Name', 'Total Capacity', 'Used Capacity', 'Free Capacity', 'Utilization', 'Nodes', 'RAID Type', 'Aggregate State', 'Snapshot Used', 'Nearly Full', 'Status'],
        rows: [['cluster-prod-01', 'aggr0', '200 TB', '160 TB', '40 TB', '80%', '2', 'RAID-DP', 'Online', '12 TB', 'Yes', 'Healthy'],
          ['cluster-prod-01', 'aggr1', '180 TB', '118 TB', '62 TB', '66%', '2', 'RAID-DP', 'Online', '10 TB', 'No', 'Healthy'],
          ['cluster-dr-01', 'aggr2', '160 TB', '145 TB', '15 TB', '91%', '1', 'RAID-TEC', 'Online', '18 TB', 'Yes', 'Warning']],
        charts: [
          { title: 'Aggregate Capacity Distribution', option: this.svc.makePieOption(['Used', 'Free'], [1210, 610]) },
          { title: 'Aggregate Utilization (%)', option: this.svc.makeBarOption(['aggr0', 'aggr1', 'aggr2', 'aggr3', 'aggr4'], [80, 66, 91, 54, 71]) },
          { title: 'Top 10 Largest Aggregates (TB)', option: this.svc.makeBarOption(['aggr0', 'aggr1', 'aggr2'], [200, 180, 160], '#fd7e14', true) },
          { title: 'Aggregate Growth Trend (PB)', option: this.svc.makeLineOption(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [1.01, 1.06, 1.11, 1.15, 1.19, 1.21], '#378AD8') }
        ]
      },
      {
        key: 'svm',
        title: 'Storage Virtual Machine (SVM)',
        metrics: [{ label: 'Total SVMs', value: '12' }, { label: 'Capacity Used(Avg)', value: '1.21 PB', tone: 'primary' }, { label: 'Avg IOPS', value: '14.2K' }, { label: 'Avg Latency', value: '1.8 ms' }, { label: 'Throughput (Avg)', value: '4.8 GB/s' }],
        columns: ['Cluster', 'SVM Name', 'State', 'Volume Count', 'LUN Count', 'Capacity Used', 'IOPS (Read/Write)', 'Latency (Read/Write)', 'Throughput', 'Status'],
        rows: [['cluster-prod-01', 'svm-prod-01', 'Running', '24', '58', '220 TB', '9.8K / 4.4K', '1.2 / 2.4 ms', '4.8 GB/s', 'Healthy'], ['cluster-dr-01', 'svm-dev-01', 'Running', '18', '46', '140 TB', '7.1K / 3.0K', '1.5 / 2.8 ms', '3.9 GB/s', 'Healthy']],
        charts: [
          { title: 'Capacity by SVM (TB)', option: this.svc.makeBarOption(['svm-prod-01', 'svm-dev-01', 'svm-qa-01'], [220, 140, 94], '#378AD8', true) },
          { title: 'Volume Count by SVM', option: this.svc.makeBarOption(['svm-prod-01', 'svm-dev-01', 'svm-qa-01'], [24, 18, 12], '#00b050', true) },
          { title: 'LUN Count by SVM', option: this.svc.makeBarOption(['svm-prod-01', 'svm-dev-01', 'svm-qa-01'], [58, 46, 32], '#fd7e14', true) },
          { title: 'Throughput by SVM (GB/s)', option: this.svc.makeLineOption(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [3.8, 4.1, 4.2, 4.5, 4.8], '#00b050') },
          { title: 'Top 10 Capacity Consumers', option: this.svc.makeBarOption(['svm-prod-01', 'svm-dev-01', 'svm-qa-01'], [220, 140, 94], '#dc3545', true) },
          { title: 'Top Performing SVMs (IOPS)', option: this.svc.makeBarOption(['svm-prod-01', 'svm-dev-01', 'svm-qa-01'], [14.9, 12.7, 9.4], '#378AD8', true) }
        ]
      },
      {
        key: 'vol',
        title: 'Volume Overview',
        metrics: [{ label: 'Total Volumes', value: '128' }, { label: 'Used Capacity', value: '1.21 PB', tone: 'primary' }, { label: 'Avg Latency', value: '1.9 ms', tone: 'success' }, { label: 'Total IOPS', value: '58.4K' }, { label: 'Snapshot Reserve', value: '384 TB' }],
        columns: ['Cluster', 'Volume Name', 'SVM', 'Aggregate', 'State', 'Type', 'Total Space (TB)', 'Available Space (TB)'],
        rows: [['cluster-prod-01', 'vol_finance_01', 'svm-prod-01', 'aggr0', 'Online', 'RW', '26', '4'], ['cluster-prod-01', 'vol_backup_01', 'svm-prod-01', 'aggr1', 'Online', 'DP', '40', '12']],
        charts: [
          { title: 'Volume Utilization Distribution', option: this.svc.makePieOption(['0-50%', '51-80%', '81-100%'], [42, 51, 35]) },
          { title: 'Top 10 Largest Volumes (TB)', option: this.svc.makeBarOption(['vol_finance_01', 'vol_backup_01'], [26, 40], '#378AD8', true) },
          { title: 'Top 10 Used Volumes (%)', option: this.svc.makeBarOption(['vol_backup_01', 'vol_finance_01'], [87, 76], '#fd7e14', true) },
          { title: 'Volume IOPS Trend', option: this.svc.makeLineOption(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [48, 51, 53, 56, 58], '#00b050') },
          { title: 'Volume Read/Write Ratio', option: this.svc.makeBarOption(['vol_finance_01', 'vol_backup_01'], [1.8, 2.4]) },
          { title: 'Volume Read/Write Latency', option: this.svc.makeBarOption(['vol_finance_01', 'vol_backup_01'], [1.3, 2.1], '#dc3545', true) },
          { title: 'Snapshot Usage (TB)', option: this.svc.makeBarOption(['vol_finance_01', 'vol_backup_01'], [8, 12], '#fd7e14') }
        ]
      },
      {
        key: 'lun',
        title: 'LUN Overview',
        metrics: [{ label: 'Total LUNs', value: '324' }, { label: 'Avg Latency', value: '2.8 ms', tone: 'success' }, { label: 'Total IOPS', value: '58.4K' }],
        columns: ['Cluster', 'LUN Name', 'Volume Path', 'State', 'Space'],
        rows: [['cluster-prod-01', 'lun_fin_01', '/vol/finance/lun_fin_01', 'Online', '3.2 TB'], ['cluster-dr-01', 'lun_db_01', '/vol/db/lun_db_01', 'Online', '4.1 TB']],
        charts: [
          { title: 'LUN Health & Status', option: this.svc.makePieOption(['Healthy', 'Warning', 'Critical'], [318, 4, 2]) },
          { title: 'Top 10 LUNs by Usage (%)', option: this.svc.makeBarOption(['lun_db_01', 'lun_fin_01'], [91, 84], '#378AD8', true) },
          { title: 'LUN Growth (TB)', option: this.svc.makeLineOption(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [2.8, 2.9, 3.0, 3.1, 3.3, 3.4], '#fd7e14') },
          { title: 'Availability', option: this.svc.makeLineOption(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [99.96, 99.97, 99.96, 99.98, 99.97, 99.97], '#00b050') }
        ]
      },
      {
        key: 'perf',
        title: 'Performance Metrics',
        metrics: [{ label: 'Total IOPS', value: '58.4K' }, { label: 'Read IOPS', value: '35.6K', tone: 'primary' }, { label: 'Write IOPS', value: '22.8K', tone: 'success' }, { label: 'Throughput', value: '21.4 GB/s', tone: 'primary' }, { label: 'Read Latency', value: '1.8 ms', tone: 'success' }, { label: 'Write Latency', value: '2.3 ms', tone: 'warning' }],
        columns: ['Timestamp', 'IOPS (Read/Write)', 'Latency (Read/Write)', 'Throughput'],
        rows: [['10:00', '58K / 23K', '1.8 / 2.3 ms', '21.4 GB/s'], ['09:45', '56K / 22K', '1.7 / 2.2 ms', '20.8 GB/s']],
        charts: [
          { title: 'IOPS Real-time Trend (K)', option: this.svc.makeLineOption(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [52, 54, 55, 57, 58], '#378AD8') },
          { title: 'Throughput Real-time Trend (GB/s)', option: this.svc.makeLineOption(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [18.1, 19.5, 20.2, 20.9, 21.4], '#00b050') },
          { title: 'Latency Trend (ms)', option: this.svc.makeLineOption(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [2.2, 2.1, 2.0, 1.9, 1.8], '#fd7e14') },
          { title: 'IOPS Activity Breakdown', option: this.svc.makePieOption(['Read', 'Write'], [35600, 22800], ['#00b050', '#378AD8']) }
        ]
      },
      {
        key: 'capacity',
        title: 'Capacity Planning',
        metrics: [{ label: 'Used Capacity', value: '1.21 PB', tone: 'primary' }, { label: 'Free Capacity', value: '0.61 PB', tone: 'primary' }, { label: 'Usable Capacity', value: '1.82 PB' }, { label: 'Growth Rate', value: '6.2% / Mo', tone: 'warning' }, { label: 'Days Until Full', value: '182 Days', tone: 'danger' }, { label: 'Thin Provisioning', value: '72%' }],
        columns: ['Cluster', 'Total Capacity', 'Space Utilization', 'Growth Rate', 'Days Until Full', 'Data Reduction Ratio', 'Status'],
        rows: [['cluster-prod-01', '1.2 PB', '66%', '6.1%', '184', '4.4:1', 'Healthy'], ['cluster-dr-01', '620 TB', '71%', '6.4%', '177', '4.1:1', 'Warning']],
        charts: [
          { title: 'Capacity Growth Forecast (Jan - Dec)', option: this.svc.makeLineOption(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [1.01, 1.05, 1.09, 1.13, 1.17, 1.21], '#378AD8') },
          { title: 'Volume Utilization Distribution', option: this.svc.makePieOption(['0-50%', '51-80%', '81-100%'], [34, 58, 36]) },
          { title: 'Aggregate Utilization Distribution', option: this.svc.makePieOption(['0-50%', '51-80%', '81-100%'], [7, 8, 3]) },
          { title: 'Top 5 Capacity Consumers', option: this.svc.makeBarOption(['vol_backup_01', 'vol_finance_01'], [40, 26], '#dc3545', true) },
          { title: 'Capacity by SVM (TB)', option: this.svc.makeBarOption(['svm-prod-01', 'svm-dev-01'], [220, 140], '#00b050', true) },
          { title: 'Monthly Growth Increments (TB)', option: this.svc.makeLineOption(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [12, 15, 16, 18, 20, 21], '#fd7e14') }
        ]
      },
      {
        key: 'ports',
        title: 'Port Overview',
        metrics: [{ label: 'Total Ports', value: '50' }, { label: 'Ethernet Ports', value: '38' }, { label: 'FC Ports', value: '12' }],
        columns: ['Cluster', 'Node', 'Port Name', 'Port Type', 'Protocol', 'Admin Status', 'Link Status', 'Connected Device', 'Connected Port'],
        rows: [['cluster-prod-01', 'node-01', 'e0a', 'Ethernet', 'NFS', 'Up', 'Up', 'switch-1', 'eth1'], ['cluster-dr-01', 'node-03', 'fc1', 'FC', 'FCP', 'Up', 'Down', 'switch-4', 'fc7']],
        charts: [
          { title: 'Link Status Distribution', option: this.svc.makePieOption(['Up', 'Down'], [48, 2], ['#00b050', '#dc3545']) },
          { title: 'Port Type & Protocol', option: this.svc.makePieOption(['Ethernet', 'FC'], [38, 12], ['#378AD8', '#fd7e14']) },
          { title: 'Ports cabled by Node (Top 10)', option: this.svc.makeBarOption(['node-01', 'node-02', 'node-03'], [18, 16, 12], '#00b050', true) }
        ]
      },
      {
        key: 'alerts',
        title: 'Recent Alerts',
        metrics: [{ label: 'Total Alerts', value: '12' }, { label: 'Critical', value: '3', tone: 'danger' }, { label: 'Warning', value: '2', tone: 'warning' }, { label: 'Information', value: '2', tone: 'primary' }],
        columns: ['ID', 'Device Name', 'Count', 'Event Metric', 'Alert Time', 'Severity', 'Description', 'Status', 'Source'],
        rows: [['A-101', 'node-03', '4', 'Latency', '10:10', 'Critical', 'Latency spike on node-03', 'Open', 'ONTAP'], ['A-102', 'vol_backup_01', '2', 'Capacity', '09:40', 'Warning', 'Volume nearing threshold', 'Acknowledged', 'ONTAP']],
        charts: [
          { title: 'Alert Severity Distribution', option: this.svc.makePieOption(['Critical', 'Warning', 'Information'], [3, 2, 2], ['#dc3545', '#fd7e14', '#378AD8']) },
          { title: 'Alert Timeline (Count)', option: this.svc.makeLineOption(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [1, 2, 2, 3, 4], '#dc3545') }
        ]
      }
    ];

    this.allSections.forEach(section => this.viewModes[section.key] = 'chart');
    this.applyFilterCriteria();
  }

  toggleView(sectionKey: string, mode: NetappStorageViewMode): void {
    this.viewModes[sectionKey] = mode;
  }

  toneClass(tone?: NetappStorageTone): string | null {
    return tone ? NETAPP_STORAGE_TONE_CLASS[tone] : null;
  }

  trackByKey(_: number, item: NetappStorageSection): string {
    return item.key;
  }

  trackByMetric(_: number, metric: NetappStorageMetric): string {
    return metric.label;
  }

  trackByChart(_: number, chart: NetappStorageChartCard): string {
    return chart.title;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private applyFilterCriteria(): void {
    const selectedClusters = new Set(this.filters?.resourceIds || []);
    this.sections = this.allSections.map(section => {
      const clusterColumnIndex = section.columns.indexOf('Cluster');
      const rows = clusterColumnIndex < 0 || !this.filters
        ? section.rows
        : section.rows.filter(row => selectedClusters.has(row[clusterColumnIndex]));
      return { ...section, rows: [...rows] };
    });
    this.clusterOverviewNote = this.getClusterOverviewNote();
  }

  private getClusterOverviewNote(): string {
    if (!this.filters) {
      return 'Scope: All Clusters | Time Range: 30 Days';
    }
    const clusters = this.filters.resourceIds.length === 1
      ? this.filters.resourceIds[0]
      : `${this.filters.resourceIds.length} Clusters`;
    return `Scope: ${clusters} | Time Range: ${this.getTimeRangeLabel(this.filters.period)}`;
  }

  private getTimeRangeLabel(period: string): string {
    const labels: Record<string, string> = {
      last_24_hours: '24 Hours',
      last_7_days: '7 Days',
      last_30_days: '30 Days',
      last_60_days: '60 Days',
      last_90_days: '90 Days',
      custom: 'Custom Range'
    };
    return labels[period] || period;
  }
}
