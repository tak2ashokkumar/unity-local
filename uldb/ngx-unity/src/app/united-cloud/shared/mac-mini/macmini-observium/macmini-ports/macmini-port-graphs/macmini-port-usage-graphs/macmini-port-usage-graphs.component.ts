import { Component, OnInit } from '@angular/core';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { OBSERVIUM_PORTS_GRAPH } from 'src/app/shared/observium-graph-util/ports-graph-util';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'macmini-port-usage-graphs',
  templateUrl: './macmini-port-usage-graphs.component.html',
  styleUrls: ['./macmini-port-usage-graphs.component.scss']
})
export class MacminiPortUsageGraphsComponent implements OnInit {
  graphConfig: DeviceGraphType[] = OBSERVIUM_PORTS_GRAPH;
  deviceId: string;
  portId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.portId = params.get('portId');
    });
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.MAC_MINI;
      config.portId = this.portId;
    });
  }

}
