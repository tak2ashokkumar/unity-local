import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, from } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UnitedCloudSharedService } from '../../../united-cloud-shared.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'switches-port',
  templateUrl: './switches-port.component.html',
  styleUrls: ['./switches-port.component.scss']
})
export class SwitchesPortComponent implements OnInit, OnDestroy {
  ports: PortResponse;
  deviceId: string;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cloudSharedService: UnitedCloudSharedService,
    private spinner: AppSpinnerService,
    public sanitizer: DomSanitizer,
    private refreshService: DataRefreshBtnService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getPorts();
    });
  }

  private get deviceType(): DeviceMapping {
    return this.storageService.extractByKey('device', StorageType.SESSIONSTORAGE)?.deviceType || DeviceMapping.SWITCHES;
  }

  ngOnInit() {
    setTimeout(() => {
      this.getPorts();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPorts() {
    this.spinner.start('swports');
    this.cloudSharedService.getPortsByDeviceTypeAndDeviceId(this.deviceType, this.deviceId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.ports = res;
        this.spinner.stop('swports');
        this.getPortGraph();
      }, err => {
        this.spinner.stop('swports');
      });
  }

  getPortGraph() {
    from(Object.keys(this.ports)).pipe(mergeMap(portId => this.cloudSharedService.getPortGraphByDeviceTypeDeviceIdAndPortId(this.deviceType, this.deviceId, portId)),
      takeUntil(this.ngUnsubscribe)).subscribe((res: Map<string, PortGraph>) => {
        const key = res.keys().next().value;
        this.ports[key].graph = res.get(key);
      }, err => {

      });
  }

  goToStats(port: PortResponse) {
    this.router.navigate([port.value.port_id, 'usage'], { relativeTo: this.route });
  }

}
