import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { MtpAdministrationServiceLevelAgreementService, SlaItemViewdata } from './mtp-administration-service-level-agreement.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MtpAdministrationSlaCRMInstance, MtpAdministrationSlaCRMTenants } from '../mtp-administration-sla-group/mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.type';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { SlaGroupViewdata } from '../mtp-administration-sla-group/mtp-administration-sla-group.service';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'mtp-administration-service-level-agreement',
  templateUrl: './mtp-administration-service-level-agreement.component.html',
  styleUrls: ['./mtp-administration-service-level-agreement.component.scss'],
  providers: [MtpAdministrationServiceLevelAgreementService]
})
export class MtpAdministrationServiceLevelAgreementComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  groupId: string;

  tenants: MtpAdministrationSlaCRMTenants[] = [];
  groupViewData: SlaGroupViewdata[] = [];
  viewData: SlaItemViewdata[] = [];
  selectedView: SlaItemViewdata;
  popOverList: string[] = [];
  count: number;

  form: FormGroup;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  groupSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "slaId",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  groupTexts: IMultiSelectTexts = {
    defaultTitle: 'Group',
    allSelected: 'All Group',
  };

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

  tenantTexts: IMultiSelectTexts = {
    defaultTitle: 'Tenant',
    allSelected: 'All Tenant',
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private itemSvc: MtpAdministrationServiceLevelAgreementService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { group: [], tenant: [] }, params: [{}]
    };
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.groupId = params.get('groupId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDropdownData();
    this.getSlaItems();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { group: [], tenant: [] }, params: [{}] };
    this.getSlaItems();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getSlaItems();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSlaItems();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSlaItems();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSlaItems();
  }

  getSlaItems() {
    this.itemSvc.getSlaItems(this.user.crmInstanceId, this.currentCriteria, this.groupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.itemSvc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching SLA items'));
      this.spinner.stop('main');
    });
  }

  getDropdownData() {
    this.itemSvc.getDropdownData(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.slaGroups) {
        this.groupViewData = this.itemSvc.convertToGroupViewdata(res.slaGroups);
      } else {
        this.groupViewData = [];
      }

      if (res.tenants) {
        this.tenants = res.tenants;
      } else {
        this.tenants = [];
      }
      this.filterForm();
    })
  }

  filterForm() {
    this.form = this.itemSvc.buildFilterForm();
    if (this.groupId) {
      let groups = this.form.get('group').value;
      groups.push(this.groupId);
      this.form.get('group').setValue(groups);
      this.currentCriteria.multiValueParam = Object.assign(this.currentCriteria.multiValueParam, { group: groups });
    }
    this.form.get('ticket_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.currentCriteria.params = [Object.assign(this.currentCriteria.params[0], { ticket_type: res })];
      this.spinner.start('main');
      this.getSlaItems();
    });
    this.form.get('status').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.currentCriteria.params = [Object.assign(this.currentCriteria.params[0], { status: res })];
      this.spinner.start('main');
      this.getSlaItems();
    });
  }

  groupFilterChanged() {
    let res = <string[]>this.form.get('group').value;
    // let arr = this.groupViewData.filter(t => res.includes(t.uuid));
    // if (arr.length == this.currentCriteria.multiValueParam['group'].length) {
    //   return;
    // }
    this.currentCriteria.multiValueParam = Object.assign(this.currentCriteria.multiValueParam, { group: res });
    this.spinner.start('main');
    this.getSlaItems();
  }

  tenantFilterChanged() {
    let res = <string[]>this.form.get('tenants').value;
    // let arr = this.tenants.filter(t => res.includes(t.account_uuid));
    // if (arr.length == this.currentCriteria.multiValueParam['tenant'].length) {
    //   return;
    // }
    this.currentCriteria.multiValueParam = Object.assign(this.currentCriteria.multiValueParam, { tenant: res });
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getSlaItems();
  }


  showTenants(view: SlaItemViewdata) {
    this.popOverList = view.tenants;
  }

  createItem() {
    if (this.groupId) {
      this.router.navigate(['crud'], { queryParams: { groupSLAId: this.groupId }, relativeTo: this.route });
    } else {
      this.router.navigate(['crud'], { relativeTo: this.route });
    }
  }

  goBack() {
    this.router.navigate(['../', 'group'], { relativeTo: this.route });
  }

  editItem(view: SlaItemViewdata) {
    if (this.groupId) {
      this.router.navigate(['crud'], { queryParams: { itemId: view.itemId, groupSLAId: this.groupId }, relativeTo: this.route });
    } else {
      this.router.navigate(['crud'], { queryParams: { itemId: view.itemId }, relativeTo: this.route });
    }
  }

  deleteItem(view: SlaItemViewdata) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.itemSvc.deleteItem(this.user.crmInstanceId, this.selectedView.itemId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSlaItems();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while deleting SLA item'));
      this.spinner.stop('main');
    });
  }

}
