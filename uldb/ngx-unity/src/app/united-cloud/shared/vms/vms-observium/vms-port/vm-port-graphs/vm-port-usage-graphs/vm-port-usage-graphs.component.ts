import { Component, OnInit } from '@angular/core';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { OBSERVIUM_PORTS_GRAPH } from 'src/app/shared/observium-graph-util/ports-graph-util';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'vm-port-usage-graphs',
  templateUrl: './vm-port-usage-graphs.component.html',
  styleUrls: ['./vm-port-usage-graphs.component.scss']
})
export class VmPortUsageGraphsComponent implements OnInit {
  graphConfig: DeviceGraphType[] = OBSERVIUM_PORTS_GRAPH;
  deviceType: DeviceMapping;
  deviceId: string;
  portId: string;
  constructor(private route: ActivatedRoute,
    private storage: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.portId = params.get('portId');
    });
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
    this.deviceType = this.storage.getByKey('device', StorageType.SESSIONSTORAGE)['deviceType'];
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = this.deviceType;
      config.portId = this.portId;
    });
  }

}
