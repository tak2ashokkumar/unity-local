import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SWITCH_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/switch-graph.const';

@Component({
  selector: 'switches-graph-poller',
  templateUrl: './switches-graph-poller.component.html',
  styleUrls: ['./switches-graph-poller.component.scss']
})
export class SwitchesGraphPollerComponent implements OnInit {
  graphConfig: DeviceGraphType[] = SWITCH_OBSERVIUM_GRAPH.GRAPH['POLLER'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.SWITCHES;
    });
  }
}