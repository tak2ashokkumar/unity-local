import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceGraphType } from 'src/app/united-cloud/shared/device-graphs/device-graph-config';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { VMS_OBSERVIUM_GRAPH } from 'src/app/shared/observium-graph-util/vms-graph.const';

@Component({
  selector: 'vms-graph-system',
  templateUrl: './vms-graph-system.component.html',
  styleUrls: ['./vms-graph-system.component.scss']
})
export class VmsGraphSystemComponent implements OnInit {

  graphConfig: DeviceGraphType[] = VMS_OBSERVIUM_GRAPH.GRAPH['SYSTEM'];
  deviceId: string;
  deviceType: DeviceMapping;
  constructor(private route: ActivatedRoute,
    private storage: StorageService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.deviceType = this.storage.getByKey('device', StorageType.SESSIONSTORAGE)['deviceType'];
  }

  ngOnInit() {
    this.graphConfig.forEach(config => {
      config.deviceId = this.deviceId;
      config.deviceType = this.deviceType;
    });
  }
}