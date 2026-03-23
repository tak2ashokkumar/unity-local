import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CustomDashboardWidgetsService } from './custom-dashboard-widgets.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WidgetViewData } from '../custom-dashboard.service';

@Component({
  selector: 'custom-dashboard-widgets',
  templateUrl: './custom-dashboard-widgets.component.html',
  styleUrls: ['./custom-dashboard-widgets.component.scss'],
  providers: [CustomDashboardWidgetsService]
})
export class CustomDashboardWidgetsComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  viewData: WidgetViewData[] = [];
  selectedView: WidgetViewData;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;
  constructor(private svc: CustomDashboardWidgetsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,params:[{ 'status': null }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getWidgets();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getWidgets();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getWidgets();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getWidgets();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getWidgets();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getWidgets();
  }

  OnFilterChange(event: any) {
    this.spinner.start('main');
    this.currentCriteria.params[0].status = event?.target?.value;
    this.currentCriteria.pageNo = 1;
    this.getWidgets();
  }

  getWidgets() {
    this.viewData = [];
    this.svc.getWidgetsList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  addWidget() {
    this.router.navigate(['../widget/add'], { relativeTo: this.route });
  }

  edit(view: WidgetViewData) {
    this.router.navigate(['../widget/edit',view.uuid], { relativeTo: this.route });
  }
  
  toggleWidget(view: WidgetViewData, enable: boolean){
    if(view.status == enable){
      return;
    }
    this.svc.togglewidget(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      view.status = res.status;
    }, err => {
      this.notification.error(new Notification(`Failed to ${view.status ? 'Enable' : 'Disable'} Widget!! Please try again.`));
    });
  }

  deleteWidget(view: WidgetViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.svc.deleteWidget(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(1);
      this.notification.success(new Notification('Widget deleted successfully.'));
    }, err => {
      this.notification.error(new Notification('Failed to delete Widget!! Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
