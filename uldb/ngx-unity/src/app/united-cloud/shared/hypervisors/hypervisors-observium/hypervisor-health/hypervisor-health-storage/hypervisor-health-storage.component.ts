import { Component, OnInit } from '@angular/core';
import { DeviceGraphType } from '../../../../device-graphs/device-graph-config';
import { HYPERVISOR_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/hypervisor-graph.const';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'hypervisor-health-storage',
  templateUrl: './hypervisor-health-storage.component.html',
  styleUrls: ['./hypervisor-health-storage.component.scss']
})
export class HypervisorHealthStorageComponent implements OnInit {
  
  graphConfig: DeviceGraphType[] = HYPERVISOR_OBSERVIUM_GRAPH.HEALTHGRAPHS['STORAGE'];
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
