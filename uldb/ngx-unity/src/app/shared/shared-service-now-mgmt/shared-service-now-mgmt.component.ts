import { HttpErrorResponse } from '@angular/common/http';
import { Directive, Injectable, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from '../SharedEntityTypes/paginated.type';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { RandColorGeneratorService } from '../rand-color-generator.service';
import { SharedCreateTicketService } from '../shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { UserInfoService } from '../user-info.service';
import { ServiceNowTicketType } from './service-now-ticket-type';
import { ServiceNowTicketViewData, SharedServiceNowMgmtService } from './shared-service-now-mgmt.service';
import { StorageService } from '../app-storage/storage.service';

@Directive()
@Injectable()
export class SharedServiceNowMgmtComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentCriteria: SearchCriteria;
  @Input() spinnerName: string;
  public ngUnsubscribe = new Subject();
  public viewData: ServiceNowTicketViewData[] = [];
  count: number = 0;
  feedback: boolean = false;
  filterForm: FormGroup;
  poll: boolean = false;
  public instanceId: string;

  constructor(private spinnerService: AppSpinnerService,
    public notification: AppNotificationService,
    public userInfo: UserInfoService,
    public router: Router,
    public route: ActivatedRoute,
    public colorSvc: RandColorGeneratorService,
    public ticketService: SharedServiceNowMgmtService,
    public createTicketService: SharedCreateTicketService,
    public storage: StorageService) {
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

  buildFilterForm(titcketType: string) {
    this.filterForm = this.ticketService.buildFilterForm(titcketType);
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

  /**
   * For service now pageNo is set as `sysparm_offset` (sysparm_offset=0)
   * @param pageNo 
   */
  getTickets() {
    this.currentCriteria.params[0]['offset'] = `${(this.currentCriteria.pageNo - 1) * this.currentCriteria.pageSize}`;
    this.ticketService.getTicketsByType(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<ServiceNowTicketType>) => {
      this.count = data.count;
      this.viewData = this.ticketService.converToViewData(this.instanceId, data.results, this.currentCriteria.params[0]['ticket_type']);
      this.spinnerService.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop(this.spinnerName);
      this.notification.error(new Notification(err.error.error));
    });
  }

}
