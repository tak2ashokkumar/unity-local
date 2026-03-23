import { Component, OnInit } from '@angular/core';
import { OrchestrationIntegrationDetailsActivitylogsService } from './orchestration-integration-details-activitylogs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'orchestration-integration-details-activitylogs',
  templateUrl: './orchestration-integration-details-activitylogs.component.html',
  styleUrls: ['./orchestration-integration-details-activitylogs.component.scss'],
  providers: [OrchestrationIntegrationDetailsActivitylogsService]
})
export class OrchestrationIntegrationDetailsActivitylogsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  scriptId: string;
  viewData: any;
  currentCriteria: SearchCriteria;
  count: number = 0;

  constructor(private svc: OrchestrationIntegrationDetailsActivitylogsService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe(params => this.scriptId = params.get('scriptId'));
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getActivityLogData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getActivityLogData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  getActivityLogData(){
    this.svc.getActivityLogData(this.scriptId,this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      // this.buildDetailsForm(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Details'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
