import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarDateFormatter, CalendarEvent } from 'angular-calendar';
import { MonthViewDay } from 'calendar-utils';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MaintenanceService, MSViewData } from './maintenance.service';
import { CustomDateFormatter } from './custom-date-formatter.provider';


@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
  providers: [
    MaintenanceService,
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]
})
export class MaintenanceComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  view: string = 'month';
  viewDate: Date = new Date();
  locale: string = 'en';
  clickedDate: Date;
  viewDateChange: EventEmitter<Date> = new EventEmitter();
  mSchedulesViewData: CalendarEvent<MSViewData>[] = [];
  @ViewChild('eventInfo') eventInfo: ElementRef;
  modalRef: BsModalRef;
  events: MSViewData[] = [];
  eventDetails: MSViewData = new MSViewData();
  showEvents: boolean = false;

  constructor(private maintenanceService: MaintenanceService,
    private router: Router,
    private user: UserInfoService,
    private spinnerservice: AppSpinnerService,
    private modalService: BsModalService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinnerservice.stop('dashboard_maintenance_widget');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.spinnerservice.start('dashboard_maintenance_widget');
    this.getMaintenanceSchedules();
  }

  getMaintenanceSchedules() {
    this.maintenanceService.getMaintenanceSchedules().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<MaintenanceSchedule>) => {
      this.mSchedulesViewData = this.maintenanceService.convertToViewData(data.results);
      this.spinnerservice.stop('dashboard_maintenance_widget');
    }, (err: HttpErrorResponse) => {
      this.spinnerservice.stop('dashboard_maintenance_widget');
    });
  }

  showCalendar() {
    this.showEvents = false;
  }

  dayClicked(day: MonthViewDay): void {
    this.showEvents = true;
    this.events = day.events;
  }

  showEventDetails(event: MSViewData) {
    this.eventDetails = event;
    this.modalRef = this.modalService.show(this.eventInfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  goTo() {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate(['/support/maintenance']);
  }
}
