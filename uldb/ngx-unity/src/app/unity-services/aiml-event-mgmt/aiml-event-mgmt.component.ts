import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AimlEventMgmtService, AIMLEventMgmtViewData } from './aiml-event-mgmt.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

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
  }

  getConditionsSummary() {
    this.aimlMgmtSvc.getConditionsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.aimlMgmtSvc.convertToViewData(res);
    });
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
