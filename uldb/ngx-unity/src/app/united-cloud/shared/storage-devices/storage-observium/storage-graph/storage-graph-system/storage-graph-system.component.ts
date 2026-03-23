import { Component, OnInit } from '@angular/core';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { STORAGEDEVICE_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/storagedevice-graph.const';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'storage-graph-system',
  templateUrl: './storage-graph-system.component.html',
  styleUrls: ['./storage-graph-system.component.scss']
})
export class StorageGraphSystemComponent implements OnInit {
  graphConfig: DeviceGraphType[] = STORAGEDEVICE_OBSERVIUM_GRAPH.GRAPH['SYSTEM'];
  deviceId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = DeviceMapping.STORAGE_DEVICES;
    });
  }

}
