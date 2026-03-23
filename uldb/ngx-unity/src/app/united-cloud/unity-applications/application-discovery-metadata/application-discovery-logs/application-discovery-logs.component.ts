import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ApplicationDiscoveryLogsService, LogViewData } from './application-discovery-logs.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppLevelService } from 'src/app/app-level.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'application-discovery-logs',
  templateUrl: './application-discovery-logs.component.html',
  styleUrls: ['./application-discovery-logs.component.scss'],
  providers: [ApplicationDiscoveryLogsService]
})
export class ApplicationDiscoveryLogsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  viewData: LogViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  deviceId: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: ApplicationDiscoveryLogsService,
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
      this.getApplicationLogs();
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getApplicationLogs();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getApplicationLogs();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getApplicationLogs();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getApplicationLogs();
  }

  getApplicationLogs() {
    this.svc.getApplicationLogs(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

}
