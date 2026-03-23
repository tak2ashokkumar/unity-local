import { HttpErrorResponse } from '@angular/common/http';
import { Directive, Injectable, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from '../SharedEntityTypes/paginated.type';
import { TicketViewData } from '../SharedEntityTypes/ticket-view.type';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppUtilityService } from '../app-utility/app-utility.service';
import { Priority } from '../create-ticket/create-ticket.service';
import { SharedCreateTicketService } from '../shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { SharedTcktMgmtService } from './shared-tckt-mgmt.service';
import { UserInfoService } from '../user-info.service';

@Directive()
@Injectable()
export class SharedTcktMgmtComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentCriteria: SearchCriteria;
  @Input() spinnerName: string;
  public ngUnsubscribe = new Subject();
  public viewData: TicketViewData[] = [];
  count: number = 0;
  feedback: boolean = false;
  PriorityEnum = Priority;
  filterForm: FormGroup;
  poll: boolean = false;
  public instanceId: string;

  constructor(private spinnerService: AppSpinnerService,
    public router: Router,
    public route: ActivatedRoute,
    public userInfo: UserInfoService,
    public utilSvc: AppUtilityService,
    private notification: AppNotificationService,
    public ticketService: SharedTcktMgmtService,
    public createTicketService: SharedCreateTicketService) {
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

  buildFilterForm() {
    this.filterForm = this.ticketService.buildFilterForm();
  }

  onSorted($event: SearchCriteria) {
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

  refreshData(pageNo: number) {
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
    this.getTickets();
  }

  getTickets() {
    this.feedback = this.currentCriteria.params[0]['unity_feedback'] ? true : false;
    this.ticketService.getTicketsByType(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<Ticket>) => {
      this.count = data.count;
      this.viewData = this.ticketService.converToViewData(this.instanceId, data.results, this.feedback);
      if (data.results.length) {
        this.getTicketMetrics(data.results);
      }
      this.spinnerService.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop(this.spinnerName);
      this.notification.error(new Notification(err.error.error));
    });
  }

  getTicketMetrics(tickets: Ticket[]) {
    this.ticketService.getTicketMetrics(tickets).pipe(takeUntil(this.ngUnsubscribe)).subscribe((ticketMetrics: TicketMetric) => {
      this.viewData.map((ticket: TicketViewData) => {
        const metric = ticketMetrics[ticket.id];
        if (metric) {
          ticket.assignedOn = metric.initially_assigned_at ? this.utilSvc.toUnityOneDateFormat(metric.initially_assigned_at) : 'N/A';
          ticket.resolvedOn = metric.solved_at ? this.utilSvc.toUnityOneDateFormat(metric.solved_at) : 'Open';
          ticket.metricsAvailable = true;
        }
      });
    }, err => { });
  }
}
