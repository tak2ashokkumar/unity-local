import { Component, OnInit } from '@angular/core';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { MAC_MINI_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/macmini-graph.const';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'macmini-graph-system',
  templateUrl: './macmini-graph-system.component.html',
  styleUrls: ['./macmini-graph-system.component.scss']
})
export class MacminiGraphSystemComponent implements OnInit {
  graphConfig: DeviceGraphType[] = MAC_MINI_OBSERVIUM_GRAPH.GRAPH['SYSTEM'];
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
