import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComponentColor, StoragePureService } from './storage-pure.service';
import { Subject } from 'rxjs';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { PureStorageArray, PureStorageGraphData } from 'src/app/shared/SharedEntityTypes/storage-pure.type';

@Component({
  selector: 'storage-pure',
  templateUrl: './storage-pure.component.html',
  styleUrls: ['./storage-pure.component.scss'],
  providers: [StoragePureService]
})
export class StoragePureComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  device: DeviceTabData = { name: '', deviceType: null };

  summaryData: PureStorageGraphData;
  chartData: UnityChartDetails;
  arrayData: PureStorageArray[] = [];
  selectedArray: PureStorageArray;
  componentColor = ComponentColor;
  constructor(private svc: StoragePureService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageSvc: StorageService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storageSvc.getByKey('device', StorageType.SESSIONSTORAGE);
    this.getArrayData();
    this.getDeviceSummary();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getArrayData() {
    this.svc.getArrayData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.arrayData = res;
        this.selectedArray = res[0];
        this.navigateTo(this.selectedArray.uuid, 'hosts');
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  getDeviceSummary() {
    this.svc.getDeviceSummary(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = res;
      this.chartData = this.svc.convertToSummaryChartData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  selectArray(view: PureStorageArray) {
    this.selectedArray = view;
  }

  navigateTo(arrayId: string, url: string) {
    this.router.navigate([arrayId, url], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
