import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AIMLEventMgmtDateRangeParams, AimlEventMgmtService, AIMLEventMgmtViewData } from './aiml-event-mgmt.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { CustomDateFilterChange, CustomDateFilterOption, CustomDateFilterPeriod } from 'src/app/shared/custom-date-filter/custom-date-filter.type';

@Component({
  selector: 'aiml-event-mgmt',
  templateUrl: './aiml-event-mgmt.component.html',
  styleUrls: ['./aiml-event-mgmt.component.scss'],
  providers: [AimlEventMgmtService]
})
export class AimlEventMgmtComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  currentPath: string;

  viewData: AIMLEventMgmtViewData = new AIMLEventMgmtViewData();
  readonly dateRangeDefault: CustomDateFilterPeriod = CustomDateFilterPeriod.THIRTY_DAYS;
  readonly dateRangeOptions: CustomDateFilterOption[] = [
    { label: '24H', value: CustomDateFilterPeriod.LAST_24_HR },
    { label: '7D', value: CustomDateFilterPeriod.SEVEN_DAYS },
    { label: '30D', value: CustomDateFilterPeriod.THIRTY_DAYS },
    { label: 'ALL', value: CustomDateFilterPeriod.ALL },
    { label: 'CUSTOM', value: CustomDateFilterPeriod.CUSTOM }
  ];

  constructor(private aimlMgmtSvc: AimlEventMgmtService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.refreshData();
        this.currentPath = event.url.split('/').pop();
        if (event.url === '/services/aiml-event-mgmt') {
          this.router.navigate(['/services/aiml/summary']);
        }
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.getConditionsSummary();
  }

  refreshData() {
    this.getConditionsSummary();
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getConditionsSummary() {
    this.aimlMgmtSvc.getConditionsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.aimlMgmtSvc.convertToViewData(res);
    });
  }

  onDateRangeChange(event: CustomDateFilterChange): void {
    const dateRangeParams: AIMLEventMgmtDateRangeParams = {
      startDate: event?.from || null,
      endDate: event?.to || null
    };
    this.aimlMgmtSvc.setDateRangeParams(dateRangeParams);
    this.refreshData();
  }

  goTo(target: string) {
    switch (target) {
      case 'rules': this.router.navigate(['aiml/rules', 'firstresponsepolicies'], { relativeTo: this.route.parent }); break;
      case 'summary': this.router.navigate(['aiml', 'summary'], { relativeTo: this.route.parent }); break;
      case 'analytics': this.router.navigate(['aiml', 'analytics'], { relativeTo: this.route.parent }); break;
      default: this.router.navigate([target], { relativeTo: this.route }); break;
    }
  }
}
