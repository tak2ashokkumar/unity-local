import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DeviceSensor, verticalPDUNames } from '../datacenter-cabinet-viewdata.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'datacenter-cabinet-view-device-sensors',
  templateUrl: './datacenter-cabinet-view-device-sensors.component.html',
  styleUrls: ['./datacenter-cabinet-view-device-sensors.component.scss']
})
export class DatacenterCabinetViewDeviceSensorsComponent implements OnInit {
  @Input() showHeatMapLayer: boolean;
  @Input() sensor: DeviceSensor;

  pduBarName: string;
  pduCurrentReadingTooltipMessage: string;
  constructor(private decimalPipe: DecimalPipe) { }

  ngOnInit() { }

}
