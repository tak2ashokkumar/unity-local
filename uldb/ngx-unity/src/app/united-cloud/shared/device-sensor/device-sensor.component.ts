import { Component, OnInit, Input } from '@angular/core';
import { DeviceSensors } from '../entities/device-sensor.type';

@Component({
  selector: 'device-sensor',
  templateUrl: './device-sensor.component.html',
  styleUrls: ['./device-sensor.component.scss']
})
export class DeviceSensorComponent implements OnInit {
  @Input() input: DeviceSensors;
  constructor() { }

  ngOnInit() {
  }

}
