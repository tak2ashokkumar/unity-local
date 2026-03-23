import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { BMS_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/bms-graph.const';

@Component({
  selector: 'bm-servers-graph-system',
  templateUrl: './bm-servers-graph-system.component.html',
  styleUrls: ['./bm-servers-graph-system.component.scss']
})
export class BmServersGraphSystemComponent implements OnInit {
  graphConfig: DeviceGraphType[] = BMS_OBSERVIUM_GRAPH.GRAPH['SYSTEM'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.BARE_METAL_SERVER;
    });
  }
}