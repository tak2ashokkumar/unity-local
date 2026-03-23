import { Component, OnInit, Input } from '@angular/core';
import { DeviceStatus } from '../entities/device-status.type';

@Component({
  selector: 'device-status',
  templateUrl: './device-status.component.html',
  styleUrls: ['./device-status.component.scss']
})
export class DeviceStatusComponent implements OnInit {
  @Input() input: DeviceStatus;
  constructor() { }

  ngOnInit() {
  }

}
