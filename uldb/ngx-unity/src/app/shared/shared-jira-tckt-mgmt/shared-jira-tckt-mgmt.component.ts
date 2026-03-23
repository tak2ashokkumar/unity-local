import { HttpErrorResponse } from '@angular/common/http';
import { Directive, Injectable, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportAnIssueService } from 'src/app/app-breadcrumb/report-an-issue/report-an-issue.service';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { RandColorGeneratorService } from '../rand-color-generator.service';
import { SharedCreateTicketService } from '../shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { UserInfoService } from '../user-info.service';
import { JiraTicketViewData, SharedJiraTcktMgmtService } from './shared-jira-tckt-mgmt.service';

@Directive()
@Injectable()
export class SharedJiraTcktMgmtComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentCriteria: SearchCriteria;
  @Input() spinnerName: string;
  instanceId: string;
  projectId: string;

  public ngUnsubscribe = new Subject();
  public viewData: JiraTicketViewData[] = [];
  count: number = 0;
  feedback: boolean = false;
  filterForm: FormGroup;
  poll: boolean = false;
  downloadUrl: string;

  constructor(protected spinnerService: AppSpinnerService,
    public notification: AppNotificationService,
    public userInfo: UserInfoService,
    public router: Router,
    public route: ActivatedRoute,
    public colorSvc: RandColorGeneratorService,
    public ticketService: SharedJiraTcktMgmtService,
    public createTicketService: SharedCreateTicketService,
    private issueService: ReportAnIssueService,) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      if (params.get('tmId')) {
        this.instanceId = params.get('tmId')
      }
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.get('projectId')) {
        this.projectId = params.get('projectId')
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start(this.spinnerName);
    }, 0)
    if (this.instanceId && this.projectId) {
      this.getTickets();
    } else {
      setTimeout(() => {
        this.instanceId = this.currentCriteria.params[0]['instanceId'] ? this.currentCriteria.params[0]['instanceId'] : null;
        this.projectId = this.currentCriteria.params[0]['project_id'] ? this.currentCriteria.params[0]['project_id'] : null;
        this.getTickets();
      }, 0);
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
      this.spinnerService.start(this.spinnerName);
      this.getTickets();
    }
  }

  buildFilterForm(queue: string) {
    this.filterForm = this.ticketService.buildFilterForm(queue);
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
    this.ticketService.getTickets(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.ticketService.converToViewData(this.instanceId, this.projectId, res.results);
      this.spinnerService.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop(this.spinnerName);
      this.notification.error(new Notification(err.error.error ? err.error.error : 'Failed to load JIRA tickets. Tryagain later.'));
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
      ele.setAttribute('href', `/customer/jira/instances/get_report/?file_name=${data.data}`);
      ele.click();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }



}
