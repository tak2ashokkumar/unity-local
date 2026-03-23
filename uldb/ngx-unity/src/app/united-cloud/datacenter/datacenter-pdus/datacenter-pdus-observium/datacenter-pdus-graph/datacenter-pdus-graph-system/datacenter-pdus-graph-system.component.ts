import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PDU_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/pdu-graphs.const';

@Component({
  selector: 'datacenter-pdus-graph-system',
  templateUrl: './datacenter-pdus-graph-system.component.html',
  styleUrls: ['./datacenter-pdus-graph-system.component.scss']
})
export class DatacenterPdusGraphSystemComponent implements OnInit {
  graphConfig: DeviceGraphType[] = PDU_OBSERVIUM_GRAPH.GRAPH['SYSTEM'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.PDU;
    });
  }
}