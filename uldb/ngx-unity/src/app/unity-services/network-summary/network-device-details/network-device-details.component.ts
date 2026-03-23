import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';

@Component({
  selector: 'network-device-details',
  templateUrl: './network-device-details.component.html',
  styleUrls: ['./network-device-details.component.scss']
})
export class NetworkDeviceDetailsComponent implements OnInit {

  device: DeviceTabData = { name: '', deviceType: null };
  subscr: Subscription;

  constructor(private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.split('/').pop() == 'zbx') {
          this.router.navigate(['details'], { relativeTo: this.route });
        }
      }
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
  }
}
