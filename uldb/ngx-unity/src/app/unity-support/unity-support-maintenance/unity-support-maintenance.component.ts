import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MaintenanceInstanceViewData, UnitySupportMaintenanceService } from './unity-support-maintenance.service';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'unity-support-maintenance',
  templateUrl: './unity-support-maintenance.component.html',
  styleUrls: ['./unity-support-maintenance.component.scss'],
  providers: [UnitySupportMaintenanceService]
})

export class UnitySupportMaintenanceComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  count: number = 0;
  currentCriteria: SearchCriteria;
  viewData: MaintenanceInstanceViewData[] = [];
  selectedView: MaintenanceInstanceViewData;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;


  public logDateRange: Array<string> = [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')];
  endDate: string = moment(this.logDateRange[1]).format('YYYY-MM-DD');
  startDate: string = moment(this.logDateRange[0]).format('YYYY-MM-DD');
  // maxDate: string = moment().format('YYYY-MM-DD');


  tenantListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  tenantSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select tenants',
  };


  dcSettings: IMultiSelectSettings = {
    keyToSelect: "id",
    lableToDisplay: "name",
    enableSearch: true,
    selectionLimit: 1,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    autoUnselect: true,
    closeOnSelect: true
  };

  constructor(private spinner: AppSpinnerService, private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private svc: UnitySupportMaintenanceService,
    private modalService: BsModalService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '', status: '' }], multiValueParam: { tenant: [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getInstances()
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '', status: '' }], multiValueParam: { tenant: [] } };
    this.getInstances();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  getInstances() {
    this.svc.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Schedules.'));
    });
  }

  addMaintenance() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  toggleSettings(view: MaintenanceInstanceViewData, status: boolean) {
    if (view.maintenanceStatus == status) {
      return;
    }
    let setStatus: string;
    if (status == true) setStatus = 'enable'
    else setStatus = 'disable'

    this.svc.saveSettings(view.uuid, setStatus).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getInstances()
      this.spinner.stop('main');
      this.notification.success(new Notification(`Status settings updated successfully.`));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Failed to update status settings.`));
    });

  }

  edit(view: MaintenanceInstanceViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  delete(view: MaintenanceInstanceViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Maintenance instance deleted successfully.'));
      this.getInstances();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to delete maintenance instance. Please try again.'));
    })
  }

  setDates() {
    this.startDate = moment(this.logDateRange[0]).format('YYYY-MM-DD');
    this.endDate = moment(this.logDateRange[1]).format('YYYY-MM-DD');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.params = [{ 'startDate': this.startDate, 'endDate': this.endDate }];

    this.getInstances();
  }


}
