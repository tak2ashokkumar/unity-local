import { HttpErrorResponse } from '@angular/common/http';
import { Directive, Injectable, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportAnIssueService } from 'src/app/app-breadcrumb/report-an-issue/report-an-issue.service';
import { DYNAMICCRM_FEEDBACK_TICKETS_REPORT_DOWNLOAD, DYNAMICCRM_TICKETS_REPORT_DOWNLOAD } from '../api-endpoint.const';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { RandColorGeneratorService } from '../rand-color-generator.service';
import { SharedCreateTicketService } from '../shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { UserInfoService } from '../user-info.service';
import { MSDynamicsTicketViewData, SharedMsDynamicsTcktMgmtService } from './shared-ms-dynamics-tckt-mgmt.service';
import { clone as _clone } from 'lodash-es';

@Directive()
@Injectable()
export class SharedMsDynamicsTcktMgmtComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentCriteria: SearchCriteria;
  @Input() spinnerName: string;
  public ngUnsubscribe = new Subject();
  public viewData: MSDynamicsTicketViewData[] = [];
  count: number = 0;
  feedback: boolean = false;
  filterForm: FormGroup;
  poll: boolean = false;
  public instanceId: string;
  downloadUrl: string;

  constructor(public spinnerService: AppSpinnerService,
    public notification: AppNotificationService,
    public userInfo: UserInfoService,
    public router: Router,
    public route: ActivatedRoute,
    public colorSvc: RandColorGeneratorService,
    public ticketService: SharedMsDynamicsTcktMgmtService,
    public createTicketService: SharedCreateTicketService,
    private issueService: ReportAnIssueService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      if (params.get('tmId')) {
        this.instanceId = params.get('tmId')
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start(this.spinnerName);
    }, 0);
    if (!this.instanceId) {
      setTimeout(() => {
        this.instanceId = this.currentCriteria.params[0]['instanceId'] ? this.currentCriteria.params[0]['instanceId'] : null;
        this.getTickets();
      }, 0);
    } else {
      this.getTickets();
    }
    this.createTicketService.ticketCreated$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: string) => {
      this.spinnerService.start(this.spinnerName);
      this.currentCriteria.pageNo = 1;
      this.getTickets();
    });
    this.issueService.ticketCreated$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: string) => {
      this.spinnerService.start(this.spinnerName);
      this.currentCriteria.pageNo = 1;
      this.getTickets();
    });
  }

  ngOnDestroy() {
    this.spinnerService.stop(this.spinnerName);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.currentCriteria.isFirstChange()) {
      this.getTickets();
    }
  }

  buildFilterForm(isFeedback: boolean) {
    this.filterForm = this.ticketService.buildFilterForm(isFeedback);
  }

  onSorted($event: SearchCriteria) {
    this.spinnerService.start(this.spinnerName);
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTickets();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start(this.spinnerName);
    this.currentCriteria.pageNo = pageNo;
    this.getTickets();
  }

  refresh(pageNo: number) {
    this.spinnerService.start(this.spinnerName);
    this.currentCriteria.pageNo = pageNo;
    this.getTickets();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start(this.spinnerName);
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTickets();
  }

  getFilteredTickets() {
    this.spinnerService.start(this.spinnerName);
    this.currentCriteria.pageNo = 1;
    this.getTickets();
  }

  getTickets() {
    this.feedback = this.currentCriteria.params[0]['unity_feedback'] ? true : false;
    this.ticketService.getTicketsByType(this.instanceId, this.currentCriteria, this.feedback).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.ticketService.converToViewData(this.instanceId, res.results, this.feedback);
      this.spinnerService.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop(this.spinnerName);
      this.notification.error(new Notification(err.error.error ? err.error.error : 'Failed to load CRM tickets. Tryagain later.'));
    });
  }

  downloadReport() {
    if (!this.viewData.length) {
      return;
    }
    this.spinnerService.start('main');
    this.feedback = this.currentCriteria.params[0]['unity_feedback'] ? true : false;
    this.ticketService.downloadReport(this.instanceId, this.currentCriteria, this.feedback).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      let ele = document.getElementById('file-downloader');
      if (this.feedback) {
        ele.setAttribute('href', `${DYNAMICCRM_FEEDBACK_TICKETS_REPORT_DOWNLOAD()}?file_name=${data.data}`);
      } else {
        ele.setAttribute('href', `${DYNAMICCRM_TICKETS_REPORT_DOWNLOAD(this.instanceId)}?file_name=${data.data}`);
      }
      ele.click();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }
}
