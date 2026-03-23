import { Component, OnInit } from '@angular/core';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MAC_MINI_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/macmini-graph.const';

@Component({
  selector: 'macmini-graph-netstats',
  templateUrl: './macmini-graph-netstats.component.html',
  styleUrls: ['./macmini-graph-netstats.component.scss']
})
export class MacminiGraphNetstatsComponent implements OnInit {

  graphConfig: DeviceGraphType[] = MAC_MINI_OBSERVIUM_GRAPH.GRAPH['NETSTAT'];
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
