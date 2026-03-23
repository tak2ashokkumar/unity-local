import { Component, OnDestroy, OnInit } from '@angular/core';
import { AIMLNoisyEventsViewData, AimlNoisyEventsService } from './aiml-noisy-events.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsFilterFormData } from '../aiml-analytics/aiml-analytics.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'aiml-noisy-events',
  templateUrl: './aiml-noisy-events.component.html',
  styleUrls: ['./aiml-noisy-events.component.scss'],
  providers: [AimlNoisyEventsService]
})
export class AimlNoisyEventsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  formData: AnalyticsFilterFormData;
  viewData: AIMLNoisyEventsViewData[] = [];
  constructor(private svc: AimlNoisyEventsService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private notification: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.formData = <AnalyticsFilterFormData>this.storageService.getByKey('analytics-formdata', StorageType.SESSIONSTORAGE);
    this.getNoisyEvents();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getNoisyEvents();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getNoisyEvents();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getNoisyEvents();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getNoisyEvents();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getNoisyEvents();
  }

  getNoisyEvents() {
    this.spinner.start('main');
    this.viewData = [];
    this.svc.getNoisyEvents(this.formData, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToNoisyEventsViewData(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching noisy events!!'));
    });
  }

  goTo(target: string) {
    switch (target) {
      case 'event-analytics': this.router.navigate(['analytics/event-analytics'], { relativeTo: this.route.parent }); break;
      default: this.router.navigate(['analytics'], { relativeTo: this.route.parent }); break;
    }
  }

}
