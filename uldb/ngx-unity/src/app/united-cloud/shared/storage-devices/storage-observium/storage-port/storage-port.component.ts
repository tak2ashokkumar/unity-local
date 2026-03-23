import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, from } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UnitedCloudSharedService } from '../../../united-cloud-shared.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil, mergeMap } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'storage-port',
  templateUrl: './storage-port.component.html',
  styleUrls: ['./storage-port.component.scss']
})
export class StoragePortComponent implements OnInit, OnDestroy {

  ports: PortResponse;
  deviceId: string;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cloudSharedService: UnitedCloudSharedService,
    private spinner: AppSpinnerService,
    public sanitizer: DomSanitizer,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getPorts();
    });
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
    this.spinner.start('storagedeviceports');
    this.cloudSharedService.getPortsByDeviceTypeAndDeviceId(DeviceMapping.STORAGE_DEVICES, this.deviceId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.ports = res;
        this.spinner.stop('storagedeviceports');
        this.getPortGraph();
      }, err => {
        this.spinner.stop('storagedeviceports');
      });
  }

  getPortGraph() {
    from(Object.keys(this.ports)).pipe(mergeMap(portId => this.cloudSharedService.getPortGraphByDeviceTypeDeviceIdAndPortId(DeviceMapping.STORAGE_DEVICES, this.deviceId, portId)),
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
