import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SwitchPort } from './switch-ports.type';
import { PortsViewData, UnityconnectBandwidthService } from './unityconnect-bandwidth.service';

@Component({
  selector: 'unityconnect-bandwidth',
  templateUrl: './unityconnect-bandwidth.component.html',
  styleUrls: ['./unityconnect-bandwidth.component.scss'],
  providers: [UnityconnectBandwidthService]
})
export class UnityconnectBandwidthComponent implements OnInit, OnDestroy {
  viewData: PortsViewData[] = []
  private ngUnsubscribe = new Subject();

  constructor(private bandwidthService: UnityconnectBandwidthService,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    public sanitizer: DomSanitizer) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('main');
    }, 0);
    this.getSwitchPorts();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.viewData = [];
    this.spinnerService.start('main');
    this.getSwitchPorts();
  }

  async getSwitchPorts() {
    let switchPorts: SwitchPort[] = await this.bandwidthService.getSwitchPorts().pipe(takeUntil(this.ngUnsubscribe)).toPromise();
    let count = 0;
    from(switchPorts).pipe(tap(() => count++),
      mergeMap(sw => this.bandwidthService.getPortDetails(sw)), takeUntil(this.ngUnsubscribe)
    ).subscribe(res => {
      let key: string = res.keys().next().value;
      let port: PortsObj = res.values().next().value;
      count--;
      if (port) {
        const switchPortName = switchPorts.find(s => s.device_uuid == key).name;
        const switchPortData = this.bandwidthService.convertToPortsViewData(key, switchPortName, port);
        this.viewData = this.viewData.concat(switchPortData);
      }
      if (count == 0) {
        this.spinnerService.stop('main');
      }
    }, err => {
      this.spinnerService.stop('main');
    }, () => this.spinnerService.stop('main'));
  }

  goToStats(view: PortsViewData) {
    this.storageService.put('device', { name: view.entityName, deviceType: DeviceMapping.SWITCHES }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.switchId, view.portId, 'usage'], { relativeTo: this.route });
  }

}
