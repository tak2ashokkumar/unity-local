import { Component, OnInit, Input } from '@angular/core';
import { AppUtilityService, DeviceStatusMapping } from '../app-utility/app-utility.service';

@Component({
  selector: 'shared-device-status',
  templateUrl: './shared-device-status.component.html',
  styleUrls: ['./shared-device-status.component.scss']
})
export class SharedDeviceStatusComponent implements OnInit {
  @Input() status: string;
  @Input() hideTooltip?: boolean;

  displayStatus: string;
  constructor(private utilSvc: AppUtilityService) { }

  ngOnInit() {
    if (this.status) {
      this.displayStatus = this.utilSvc.camelCaseToTitleCase(this.status);
    }
  }

  get statusIcon() {
    switch (this.status) {
      case DeviceStatusMapping.BGP_PEER_ESTABLISHED:
      case DeviceStatusMapping.UP:
      case DeviceStatusMapping.up: return 'fa-circle text-success';
      case DeviceStatusMapping.BGP_PEER_IDLE:
      case DeviceStatusMapping.BGP_PEER_CONNECT:
      case DeviceStatusMapping.BGP_PEER_ACTIVE:
      case DeviceStatusMapping.BGP_PEER_OPEN_SENT:
      case DeviceStatusMapping.BGP_PEER_OPEN_CONFIRM:
      case DeviceStatusMapping.DOWN:
      case DeviceStatusMapping.down: return 'fa-circle text-danger';
      case DeviceStatusMapping.unKnown:
      case DeviceStatusMapping.UNKNOWN: return 'fa-circle text-muted';
      case DeviceStatusMapping.DEGRADED: return 'fa-circle text-warning';
      case DeviceStatusMapping.NOT_PRESENT: return 'fa-ban text-secondary';
      case DeviceStatusMapping.MONITORING_DISABLED: return 'fa-exclamation-circle text-secondary';
      default: return 'fa-exclamation-circle text-warning';
    }
  }
}
