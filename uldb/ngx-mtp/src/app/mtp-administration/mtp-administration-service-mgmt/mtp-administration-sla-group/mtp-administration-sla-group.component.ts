import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MtpAdministrationSlaCRMInstance, MtpAdministrationSlaCRMTenants } from './mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.type';
import { MtpAdministrationSlaGroupService, SlaGroupViewdata } from './mtp-administration-sla-group.service';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'mtp-administration-sla-group',
  templateUrl: './mtp-administration-sla-group.component.html',
  styleUrls: ['./mtp-administration-sla-group.component.scss'],
  providers: [MtpAdministrationSlaGroupService]
})
export class MtpAdministrationSlaGroupComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  tenants: MtpAdministrationSlaCRMTenants[] = [];
  viewData: SlaGroupViewdata[] = [];
  selectedView: SlaGroupViewdata;
  popOverList: string[];
  count: number;

  form: FormGroup;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  tenantSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "account_uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private groupSvc: MtpAdministrationSlaGroupService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { tenant: [] }
    };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getSlaGroups();
    this.getTenants();
    this.filterForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { tenant: [] } };
    this.getSlaGroups();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getSlaGroups();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { tenant: [] } };
    this.getSlaGroups();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSlaGroups();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSlaGroups();
  }

  filterForm() {
    this.form = this.groupSvc.buildFilterForm();
  }

  tenantFilterChanged() {
    let res = <string[]>this.form.get('tenants').value;
    // let arr = this.tenants.filter(t => res.includes(t.account_uuid));
    // if (arr.length == this.currentCriteria.multiValueParam['tenant'].length) {
    //   return;
    // }
    this.currentCriteria.multiValueParam = Object.assign(this.currentCriteria.multiValueParam, { tenant: res });
    this.currentCriteria.pageNo = 1;
    this.spinner.start('main');
    this.getSlaGroups();
  }

  getTenants() {
    this.groupSvc.getTenants(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenants = res;
      // this.form.get('tenants').setValue(this.tenants.map(t => t.account_uuid));
    }, err => {
      // this.notification.error(new Notification('Error while fetching CRM tenants'));
    });
  }

  getSlaGroups() {
    this.groupSvc.getSlaGroups(this.user.crmInstanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.groupSvc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching SLA groups'));
      this.spinner.stop('main');
    });
  }

  showTenants(view: SlaGroupViewdata) {
    this.popOverList = view.tenants;
  }

  createGroup() {
    this.router.navigate(['crud'], { relativeTo: this.route });
  }

  goToItems(view?: SlaGroupViewdata) {
    if (view) {
      this.router.navigate(['../', 'items'], { queryParams: { groupId: view.slaId }, relativeTo: this.route });
    } else {
      this.router.navigate(['../', 'items'], { queryParams: null, relativeTo: this.route });
    }
    // let gId = view ? { groupId: view.uuid } : null;
  }

  addItemToGroup(view: SlaGroupViewdata) {
    this.router.navigate(['../', 'items', 'crud'], { queryParams: { groupId: view.uuid }, relativeTo: this.route });
  }

  editGroup(view: SlaGroupViewdata) {
    this.router.navigate(['crud'], { queryParams: { groupId: view.uuid }, relativeTo: this.route });
  }

  deleteGroup(view: SlaGroupViewdata) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.groupSvc.deleteGroup(this.user.crmInstanceId, this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSlaGroups();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching SLA group'));
      this.spinner.stop('main');
    });
  }

}
