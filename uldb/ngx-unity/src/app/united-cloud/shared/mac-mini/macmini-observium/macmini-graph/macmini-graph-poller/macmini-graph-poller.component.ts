import { Component, OnInit } from '@angular/core';
import { MAC_MINI_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/macmini-graph.const';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'macmini-graph-poller',
  templateUrl: './macmini-graph-poller.component.html',
  styleUrls: ['./macmini-graph-poller.component.scss']
})
export class MacminiGraphPollerComponent implements OnInit {

  graphConfig: DeviceGraphType[] = MAC_MINI_OBSERVIUM_GRAPH.GRAPH['POLLER'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.MAC_MINI;
    });
  }

}
