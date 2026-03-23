import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageOverviewService } from './storage-overview.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { StorageDeviceStorageData } from '../../../entities/storage-device.type';

@Component({
  selector: 'storage-overview',
  templateUrl: './storage-overview.component.html',
  styleUrls: ['./storage-overview.component.scss']
})
export class StorageOverviewComponent implements OnInit, OnDestroy {

  deviceId: string;
  deviceStorageDetails: StorageDeviceStorageData
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private overviewService: StorageOverviewService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService) {
    /**
     * This is to get parameters from parent route
     */
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getStorageData();
    });
  }

  ngOnInit() {
    this.getStorageData();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getStorageData() {
    this.overviewService.getStorageData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceStorageDetails = res;
    }, err => {

    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

}
