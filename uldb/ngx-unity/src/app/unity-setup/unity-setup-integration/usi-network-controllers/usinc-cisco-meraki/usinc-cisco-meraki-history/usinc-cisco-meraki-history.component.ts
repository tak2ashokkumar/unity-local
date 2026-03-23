import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MirakiHistoryViewData, UsincCiscoMerakiHistoyService } from './usinc-cisco-meraki-histoy.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'usinc-cisco-meraki-history',
  templateUrl: './usinc-cisco-meraki-history.component.html',
  styleUrls: ['./usinc-cisco-meraki-history.component.scss'],
  providers: [UsincCiscoMerakiHistoyService]
})
export class UsincCiscoMerakiHistoryComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: MirakiHistoryViewData[] = [];
  count: number;
  merakiId: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UsincCiscoMerakiHistoyService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.merakiId = params.get('merakiId');
    })
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getScheduleHistory();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchQuery = event;
    this.currentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getScheduleHistory();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  refreshData($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getScheduleHistory();
  }

  getScheduleHistory() {
    this.svc.getScheduleHistory(this.currentCriteria, this.merakiId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results); this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
