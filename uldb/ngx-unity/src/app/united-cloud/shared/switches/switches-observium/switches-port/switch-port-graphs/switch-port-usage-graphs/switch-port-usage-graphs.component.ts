import { Component, OnInit } from '@angular/core';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { OBSERVIUM_PORTS_GRAPH } from 'src/app/shared/observium-graph-util/ports-graph-util';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'switch-port-usage-graphs',
  templateUrl: './switch-port-usage-graphs.component.html',
  styleUrls: ['./switch-port-usage-graphs.component.scss']
})
export class SwitchPortUsageGraphsComponent implements OnInit {
  graphConfig: DeviceGraphType[] = OBSERVIUM_PORTS_GRAPH;
  deviceId: string;
  portId: string;
  constructor(private route: ActivatedRoute, private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.portId = params.get('portId');
    });
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
  }

  private get deviceType(): DeviceMapping {
    return this.storageService.extractByKey('device', StorageType.SESSIONSTORAGE)?.deviceType || DeviceMapping.SWITCHES;
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = this.deviceType;
      config.portId = this.portId;
    });
  }

}
