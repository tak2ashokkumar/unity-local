import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { LOADBALANCER_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/loadbalancer-graph.const';

@Component({
  selector: 'loadbalancers-graph-netstats',
  templateUrl: './loadbalancers-graph-netstats.component.html',
  styleUrls: ['./loadbalancers-graph-netstats.component.scss']
})
export class LoadbalancersGraphNetstatsComponent implements OnInit {
  graphConfig: DeviceGraphType[] =  LOADBALANCER_OBSERVIUM_GRAPH.GRAPH['NETSTAT'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.LOAD_BALANCER;
    });
  }
}