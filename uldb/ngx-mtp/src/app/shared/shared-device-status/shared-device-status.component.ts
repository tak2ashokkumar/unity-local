import { Component, OnInit, Input } from '@angular/core';
import { DeviceStatusMapping } from '../app-utility/app-utility.service';

@Component({
  selector: 'shared-device-status',
  templateUrl: './shared-device-status.component.html',
  styleUrls: ['./shared-device-status.component.scss']
})
export class SharedDeviceStatusComponent implements OnInit {
  @Input() status: string;

  constructor() { }

  ngOnInit() { }

  get statusIcon() {
    switch (this.status) {
      case DeviceStatusMapping.UP:
      case DeviceStatusMapping.up: return 'fa-circle text-success';
      case DeviceStatusMapping.DOWN:
      case DeviceStatusMapping.down: return 'fa-circle text-danger';
      case DeviceStatusMapping.unKnown:
      case DeviceStatusMapping.UNKNOWN: return 'fa-exclamation-circle text-muted';
      case DeviceStatusMapping.NOT_PRESENT: return 'fa-ban text-secondary';
      case DeviceStatusMapping.MONITORING_DISABLED: return 'fa-exclamation-circle text-secondary';
      default: return 'fa-exclamation-circle text-warning';
    }
  }
}
