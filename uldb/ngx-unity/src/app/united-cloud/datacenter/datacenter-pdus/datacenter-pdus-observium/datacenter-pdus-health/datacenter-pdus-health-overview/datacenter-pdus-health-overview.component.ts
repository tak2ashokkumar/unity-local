import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PDU_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/pdu-graphs.const';

@Component({
  selector: 'datacenter-pdus-health-overview',
  templateUrl: './datacenter-pdus-health-overview.component.html',
  styleUrls: ['./datacenter-pdus-health-overview.component.scss']
})
export class DatacenterPdusHealthOverviewComponent implements OnInit {
  graphConfig: DeviceGraphType[] = PDU_OBSERVIUM_GRAPH.HEALTHGRAPHS['OVERVIEW'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.PDU;
    });
  }
}