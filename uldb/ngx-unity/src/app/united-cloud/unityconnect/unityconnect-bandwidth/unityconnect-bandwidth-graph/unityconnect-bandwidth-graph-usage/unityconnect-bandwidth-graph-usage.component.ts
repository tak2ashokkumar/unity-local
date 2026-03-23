import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, ParamMap } from '@angular/router';
import { OBSERVIUM_PORTS_GRAPH } from 'src/app/shared/observium-graph-util/ports-graph-util';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';

@Component({
  selector: 'unityconnect-bandwidth-graph-usage',
  templateUrl: './unityconnect-bandwidth-graph-usage.component.html',
  styleUrls: ['./unityconnect-bandwidth-graph-usage.component.scss']
})
export class UnityconnectBandwidthGraphUsageComponent implements OnInit {
  graphConfig: DeviceGraphType[] = OBSERVIUM_PORTS_GRAPH;
  deviceId: string;
  portId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceId');
      this.portId = params.get('portId');
    });
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.SWITCHES;
      config.portId = this.portId;
    });
  }

}