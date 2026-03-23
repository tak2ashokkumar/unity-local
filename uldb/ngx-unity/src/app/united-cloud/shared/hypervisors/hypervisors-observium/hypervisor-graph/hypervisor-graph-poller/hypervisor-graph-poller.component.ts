import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { HYPERVISOR_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/hypervisor-graph.const';

@Component({
  selector: 'hypervisor-graph-poller',
  templateUrl: './hypervisor-graph-poller.component.html',
  styleUrls: ['./hypervisor-graph-poller.component.scss']
})
export class HypervisorGraphPollerComponent implements OnInit {
  graphConfig: DeviceGraphType[] = HYPERVISOR_OBSERVIUM_GRAPH.GRAPH['POLLER'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.HYPERVISOR;
    });
  }
}