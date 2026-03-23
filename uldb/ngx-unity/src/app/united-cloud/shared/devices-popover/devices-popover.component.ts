import { Component, OnInit, Input } from '@angular/core';
import { DevicePopoverData } from './device-popover-data';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'devices-popover',
  templateUrl: './devices-popover.component.html',
  styleUrls: ['./devices-popover.component.scss']
})
export class DevicesPopoverComponent implements OnInit {
  @Input() data: DevicePopoverData;
  notEnabled: string = 'Monitoring not enabled';
  dateFormat: string = environment.unityDateFormat;
  constructor(public userInfo: UserInfoService) { }

  ngOnInit() {
  }

}
