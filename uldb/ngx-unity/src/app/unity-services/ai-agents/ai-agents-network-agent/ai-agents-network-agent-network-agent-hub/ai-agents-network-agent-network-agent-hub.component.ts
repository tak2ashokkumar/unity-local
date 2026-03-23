import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AiAgentsNetworkAgentNetworkAgentHubService, AlertsViewData, AnalysisLogos, ConditionsViewData, SummaryWidgetsViewData } from './ai-agents-network-agent-network-agent-hub.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ai-agents-network-agent-network-agent-hub',
  templateUrl: './ai-agents-network-agent-network-agent-hub.component.html',
  styleUrls: ['./ai-agents-network-agent-network-agent-hub.component.scss'],
  providers: [AiAgentsNetworkAgentNetworkAgentHubService]
})
export class AiAgentsNetworkAgentNetworkAgentHubComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  summaryWidgetsViewData: SummaryWidgetsViewData = new SummaryWidgetsViewData();

  // 'Anomaly' option commented for now
  categoryData = ['Alerts', 'Conditions'];
  currentCategory: string = 'Alerts';
  currentCriteria: SearchCriteria;
  viewData: ConditionsViewData[] | AlertsViewData[] = [];
  selectedView: ConditionsViewData | AlertsViewData;
  count: number = 0;
  @ViewChild('details') details: ElementRef;
  detailsModalRef: BsModalRef;

  @ViewChild('viewRca') viewRca: ElementRef;
  viewRcaModalRef: BsModalRef;
  analysisLogos = AnalysisLogos;

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalSvc: BsModalService,
    private router: Router,
    private svc: AiAgentsNetworkAgentNetworkAgentHubService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.geSummary();
    this.getAlerts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = '';
    this.currentCriteria.pageNo = 1;
    this.currentCategory = 'Alerts';
    this.geSummary();
    this.getAlerts();
    // if (this.currentCategory === 'Anomaly') {
    //   this.getAnomaly();
    // } else if (this.currentCategory === 'Alerts') {
    //   this.getAlerts();
    // } else if (this.currentCategory === 'Conditions') {
    //   this.getConditions();
    // }
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    if (this.currentCategory === 'Anomaly') {
      this.getAnomaly();
    } else if (this.currentCategory === 'Alerts') {
      this.getAlerts();
    } else if (this.currentCategory === 'Conditions') {
      this.getConditions();
    }
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    if (this.currentCategory === 'Anomaly') {
      this.getAnomaly();
    } else if (this.currentCategory === 'Alerts') {
      this.getAlerts();
    } else if (this.currentCategory === 'Conditions') {
      this.getConditions();
    }
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      if (this.currentCategory === 'Anomaly') {
        this.getAnomaly();
      } else if (this.currentCategory === 'Alerts') {
        this.getAlerts();
      } else if (this.currentCategory === 'Conditions') {
        this.getConditions();
      }
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    if (this.currentCategory === 'Anomaly') {
      this.getAnomaly();
    } else if (this.currentCategory === 'Alerts') {
      this.getAlerts();
    } else if (this.currentCategory === 'Conditions') {
      this.getConditions();
    }
  }

  onCategroyChange(category: string) {
    this.currentCriteria.searchValue = '';
    this.currentCriteria.pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE;
    this.currentCriteria.pageNo = 1;
    if (this.currentCategory !== category) {
      this.spinner.start('main');
      this.currentCategory = category;
      if (category === 'Anomaly') {
        this.getAnomaly();
      } else if (category === 'Alerts') {
        this.getAlerts();
      } else if (category === 'Conditions') {
        this.getConditions();
      }
    }
  }

  geSummary() {
    this.svc.getSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryWidgetsViewData = this.svc.convertToSummaryWidgetsViewData(res);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Summary data. Please try again later'));
    })
  }

  getAnomaly() {
    this.svc.getAnomalyDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      // this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Anomaly'));
    });
  }

  getAlerts() {
    this.viewData = [];
    this.svc.getAlertDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertoToAlertsViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Alerts'));
    });
  }

  getConditions() {
    this.viewData = [];
    this.svc.getConditionDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToConditionsViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Conditions'));
    });
  }

  viewDetails(view: AlertsViewData) {
    this.selectedView = null;
    this.detailsModalRef = this.modalSvc.show(this.details, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }));
    setTimeout(() => {
      this.spinner.start('AgentAnalysisForAlertPopupLoader');
    }, 2);
    setTimeout(() => {
      this.selectedView = view;
      this.spinner.stop('AgentAnalysisForAlertPopupLoader');
    }, 4250);
  }

  viewRcaDetails(view: ConditionsViewData) {
    this.selectedView = null;
    this.viewRcaModalRef = this.modalSvc.show(this.viewRca, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }));
    setTimeout(() => {
      this.spinner.start('AgentAnalysisForConditionPopupLoader');
    }, 2);
    setTimeout(() => {
      this.selectedView = view;
      this.spinner.stop('AgentAnalysisForConditionPopupLoader');
    }, 4440);
  }

}
