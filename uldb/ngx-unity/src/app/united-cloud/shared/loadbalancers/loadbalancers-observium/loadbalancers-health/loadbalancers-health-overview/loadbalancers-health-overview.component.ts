import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { LOADBALANCER_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/loadbalancer-graph.const';

@Component({
  selector: 'loadbalancers-health-overview',
  templateUrl: './loadbalancers-health-overview.component.html',
  styleUrls: ['./loadbalancers-health-overview.component.scss']
})
export class LoadbalancersHealthOverviewComponent implements OnInit {
  graphConfig: DeviceGraphType[] = LOADBALANCER_OBSERVIUM_GRAPH.HEALTHGRAPHS['OVERVIEW'];
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