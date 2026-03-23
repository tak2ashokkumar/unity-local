import { Component, OnDestroy, OnInit } from '@angular/core';
import { AiObservabilityVectorDbServiceTracesService, VectorDBTracesViewData } from './ai-observability-vector-db-service-traces.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'ai-observability-vector-db-service-traces',
  templateUrl: './ai-observability-vector-db-service-traces.component.html',
  styleUrls: ['./ai-observability-vector-db-service-traces.component.scss'],
  providers: [AiObservabilityVectorDbServiceTracesService]
})
export class AiObservabilityVectorDbServiceTracesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  device: DeviceTabData;
  scrollStrategy: ScrollStrategy;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: VectorDBTracesViewData[] = [];
  constructor(private svc: AiObservabilityVectorDbServiceTracesService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private readonly sso: ScrollStrategyOptions,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': null }] };
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('Id');
      if (this.deviceId) {
        this.spinner.start('main');
        this.getTraces();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getTraces();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTraces();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTraces();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTraces();
  }

  getTraces() {
    this.currentCriteria.params[0]['uuid'] = this.deviceId;
    this.svc.getTraces(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

}
