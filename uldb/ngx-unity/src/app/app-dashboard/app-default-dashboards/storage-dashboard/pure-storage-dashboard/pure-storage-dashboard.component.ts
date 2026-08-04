import { Component, Input } from '@angular/core';
import { StorageDashboardFilterCriteria } from '../storage-dashboard.type';

@Component({
  selector: 'pure-storage-dashboard',
  templateUrl: './pure-storage-dashboard.component.html',
  styleUrls: ['./pure-storage-dashboard.component.scss']
})
export class PureStorageDashboardComponent {
  @Input() filters: StorageDashboardFilterCriteria;
  @Input() refreshToken = 0;

  constructor() { }

  trackByRow(_: number, row: { name: string }): string {
    return row.name;
  }
}
