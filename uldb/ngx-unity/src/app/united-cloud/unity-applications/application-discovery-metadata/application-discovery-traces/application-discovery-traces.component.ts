import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ApplicationDiscoveryTracesService, TraceRecordViewData } from './application-discovery-traces.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppLevelService } from 'src/app/app-level.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'application-discovery-traces',
  templateUrl: './application-discovery-traces.component.html',
  styleUrls: ['./application-discovery-traces.component.scss'],
  providers: [ApplicationDiscoveryTracesService]
})
export class ApplicationDiscoveryTracesComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  viewData: TraceRecordViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  deviceId: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: ApplicationDiscoveryTracesService,
    private spinner: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceId');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getApplicationTraces();
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'status': null }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getApplicationTraces();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getApplicationTraces();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getApplicationTraces();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getApplicationTraces();
  }

  getApplicationTraces() {
    this.svc.getApplicationTraces(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

}
