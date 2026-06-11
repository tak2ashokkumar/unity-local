import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ServiceNowAccountsViewData, ServicenowDetailsService } from './servicenow-details.service';
import { takeUntil } from 'rxjs/operators';
import { ServicenowCrudService } from '../servicenow-crud/servicenow-crud.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';

@Component({
  selector: 'servicenow-details',
  templateUrl: './servicenow-details.component.html',
  styleUrls: ['./servicenow-details.component.scss'],
  providers: [ServicenowDetailsService, ServicenowCrudService]
})
export class ServicenowDetailsComponent implements OnInit {
  count: number = 0;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  form: FormGroup;
  viewData: ServiceNowAccountsViewData[] = [];
  popOverList: string[];
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;
  serviceNowId: string;





  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private spinnerService: AppSpinnerService,
    private crudService: ServicenowDetailsService,
    private modalService: BsModalService,
    public userService: UserInfoService,
    private snCrudSrv: ServicenowCrudService,
    private notification: AppNotificationService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getServiceNowInstances();
  }


  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getServiceNowInstances();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getServiceNowInstances();

  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getServiceNowInstances();

  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getServiceNowInstances();

  }

  getServiceNowInstances() {
    this.crudService.getServiceNowInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.crudService.convertToViewdata(res.results);
      this.count = res.count;
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  showTenants(view: ServiceNowAccountsViewData) {
    this.popOverList = view.extraTenantsList;
  }

  edit(data: ServiceNowAccountsViewData) {
    this.router.navigate(['../', 'servicenow', data.uuid], { relativeTo: this.route })
  }

  add() {
    this.router.navigate(['../', 'servicenow', 'add'], { relativeTo: this.route })
  }

  onServiceNowCrud(event: CRUDActionTypes) {
    this.getServiceNowInstances();
  }

  deleteItem(data: ServiceNowAccountsViewData) {
    // if (!this.userService.isUserAdmin) {
    //   return;
    // }
    // this.snCrudSrv.deleteAccount(data.uuid);
  }

  delete(data: ServiceNowAccountsViewData) {
    console.log(data.uuid)
    this.serviceNowId = data.uuid;
    this.modalRef = this.modalService.show(
      this.confirm,
      Object.assign(
        {},
        { class: '', keyboard: true, ignoreBackdropClick: true }
      )
    );
  }


  confirmDelete() {
    this.modalRef.hide();
    this.crudService
      .delete(this.serviceNowId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.notification.success(
            new Notification('ServiceNow disconnected successfully')
          );
          this.getServiceNowInstances();
        },
        (err) => {
          this.notification.error(
            new Notification('ServiceNow could not be disconnected')
          );
        }
      );
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  createItem() {
    // if (this.groupId) {
    //   this.router.navigate(['crud'], { queryParams: { groupSLAId: this.groupId }, relativeTo: this.route });
    // } else {
    //   this.router.navigate(['crud'], { relativeTo: this.route });
    // }
  }

}
