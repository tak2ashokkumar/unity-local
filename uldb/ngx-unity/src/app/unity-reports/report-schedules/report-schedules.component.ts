import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { REPORT_SCHEDULER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { TabData } from 'src/app/shared/tabdata';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ReportSchedulesCrudService } from '../report-schedules-crud/report-schedules-crud.service';
import { ReportSchedule } from './report-schedule.type';
import { ReportScheduleViewdata, ReportSchedulesService } from './report-schedules.service';

@Component({
  selector: 'report-schedules',
  templateUrl: './report-schedules.component.html',
  styleUrls: ['./report-schedules.component.scss'],
  providers: [ReportSchedulesService]
})
export class ReportSchedulesComponent implements OnInit {
  tabItems: TabData[] = tabData;
  subscr: Subscription;

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  schedules: ReportScheduleViewdata[] = [];
  count: number;
  selectedSchedule: ReportScheduleViewdata;

  @ViewChild('confirmToggleTemplate') confirmToggleTemplate: ElementRef;
  confirmToggleModalRef: BsModalRef;

  constructor(private spinner: AppSpinnerService,
    private crudSvc: ReportSchedulesCrudService,
    private router: Router,
    private modalService: BsModalService,
    private scheduleSvc: ReportSchedulesService,
    private ticketService: SharedCreateTicketService,
    private notification: AppNotificationService) {

    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getSchedule();
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
    this.getSchedule();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSchedule();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSchedule();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSchedule();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinner.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getSchedule();
    }
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSchedule();
  }

  getSchedule() {
    this.scheduleSvc.getSchedules(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<ReportSchedule>) => {
      this.count = data.count;
      this.schedules = this.scheduleSvc.convertToViewdata(data.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  goToSchedule(view: ReportScheduleViewdata) {
    this.router.navigate([view.report_url, view.uuid]);
  }

  createReport() {
    this.router.navigate(['reports/inventory']);
  }

  editSchedule(view: ReportScheduleViewdata) {
    this.crudSvc.addOrEdit(view.uuid, null);
  }

  deleteSchedule(view: ReportScheduleViewdata) {
    this.crudSvc.deleteSchedule(view.uuid);
  }

  toggle(view: ReportScheduleViewdata) {
    this.selectedSchedule = view;
    this.confirmToggleModalRef = this.modalService.show(this.confirmToggleTemplate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.spinner.start('main');
    this.scheduleSvc.toggle(this.selectedSchedule.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<ReportSchedule>) => {
      this.getSchedule();
      this.notification.success(new Notification(`Schedule ${this.selectedSchedule.toggleTootipMsg}d successfully`));
      this.confirmToggleModalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.confirmToggleModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification(`Could not ${this.selectedSchedule.toggleTootipMsg} schedule!! Please try again`))
    });
  }

  createTicket(view: ReportScheduleViewdata) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Scheduler', view.name), metadata: REPORT_SCHEDULER_TICKET_METADATA(view.name, view.frequency, view.active)
    });
  }
}


const tabData: TabData[] = [
  {
    name: 'Reports',
    url: '/reports/schedules'
  }
];
