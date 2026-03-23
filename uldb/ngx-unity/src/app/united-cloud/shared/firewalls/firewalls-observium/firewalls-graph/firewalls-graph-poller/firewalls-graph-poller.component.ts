import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { FIREWALL_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/firewall-graph.const';

@Component({
  selector: 'firewalls-graph-poller',
  templateUrl: './firewalls-graph-poller.component.html',
  styleUrls: ['./firewalls-graph-poller.component.scss']
})
export class FirewallsGraphPollerComponent implements OnInit {

  graphConfig: DeviceGraphType[] = FIREWALL_OBSERVIUM_GRAPH.GRAPH['POLLER'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.FIREWALL;
    });
  }
}