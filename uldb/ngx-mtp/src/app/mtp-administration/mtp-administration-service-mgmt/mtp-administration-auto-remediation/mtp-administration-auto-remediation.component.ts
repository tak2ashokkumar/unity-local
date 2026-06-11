import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { MtpAdministrationAutoRemediationService, mtpAutoRemediationViewData } from './mtp-administration-auto-remediation.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TenantsInfoType, mtpAutoRemediationType } from './mtp-administration-auto-remediation.type';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'mtp-administration-auto-remediation',
  templateUrl: './mtp-administration-auto-remediation.component.html',
  styleUrls: ['./mtp-administration-auto-remediation.component.scss'],
  providers: [MtpAdministrationAutoRemediationService]
})
export class MtpAdministrationAutoRemediationComponent implements OnInit, OnDestroy {

  statusButton: string = 'disable';
  selectedAll: boolean = true;
  bulkautoRemediation: boolean = true;
  bulkSelection: boolean = false;
  manageButton: boolean = false;
  count: number;
  currentCriteria: SearchCriteria;
  viewData: mtpAutoRemediationViewData[] = [];
  tenants: TenantsInfoType[] = [];
  mtpUserSettings: mtpAutoRemediationType;
  selectedItems = [];
  private ngUnsubscribe = new Subject();
  params: HttpParams = new HttpParams();

  @ViewChild('manage') manage: ElementRef;
  modalRef: BsModalRef;

  tenantListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  tenantSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Tenants',
  };

  constructor(private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private mtpAdministrationAutoRemediationService: MtpAdministrationAutoRemediationService,
    private modalService: BsModalService
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ remediation_status: '' }], multiValueParam: { 'uuid': [] } };
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getTenantData();
    this.getTenants();
  }
  changeStatusView(status: string) {
    this.statusButton = status;
  }

  ngOnDestroy(){
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ remediation_status: '' }], multiValueParam: { 'uuid': [] } };
    this.getTenantData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTenantData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTenantData();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTenantData();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTenantData();
  }

  // this.currentCriteria.params = [{ 'start_date': this.start_date, 'end_date': this.end_date }];


  getTenantData() {
    this.mtpAdministrationAutoRemediationService.getAutoRem(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.count = data.count;
      this.mtpUserSettings = data[0];
      // console.log(data.results);
      this.viewData = this.mtpAdministrationAutoRemediationService.convertToViewData(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getTenants() {
    this.tenants = [];
    this.mtpAdministrationAutoRemediationService.getTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tenants = data;
      // console.log(this.tenants);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get tenants.'));
      this.spinnerService.stop('main');
    });
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getTenantData();
  }

  switchCategoryStatus(view: mtpAutoRemediationViewData) {
    this.spinnerService.start('main');
    view.autoRemediationEnabled = !view.autoRemediationEnabled;
    this.mtpAdministrationAutoRemediationService.getAutoRemData(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.mtpUserSettings = data;
      this.mtpUserSettings.auto_remediation_enabled = !this.mtpUserSettings.auto_remediation_enabled;
      this.toggleAutoRemediationSettings(data);
      this.spinnerService.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to enable Auto Remediation. Please try again later.'));
    });
  }

  toggleAutoRemediationSettings(view: mtpAutoRemediationType) {
    // console.log('inside toggleAutoRemediationSettings');
    this.mtpAdministrationAutoRemediationService.sendAutoRemData(this.mtpUserSettings, this.mtpUserSettings.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (view.auto_remediation_enabled) {
        this.notification.success(new Notification('Auto Remediation enabled successfully.'));
      }
      else {
        this.notification.success(new Notification('Auto Remediation disabled successfully.'));
      }
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to change Auto Remediation settings. Please try again later.'));
    });
  }

  manageStatus() {
    this.modalRef = this.modalService.show(this.manage, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkSelect() {
    if (!this.viewData.length) {
      this.bulkSelection = false;
      return;
    }
    this.bulkSelection = !this.bulkSelection;
    // console.log('Selected Items inside bulk select : ', this.selectedItems);
    if (this.bulkSelection) {
      this.manageButton = true;
    }
    // else {
    // //   this.manageButton =false;
    // // }
    if (this.bulkSelection) {
      this.viewData.forEach(view => {
        view.itemSelected = true;
        if (!this.selectedItems.includes(view.uuid)) {
          this.selectedItems.push(view.uuid);
        }
      });
    } else {
      this.viewData.forEach(view => {
        view.itemSelected = false;
      });
      this.selectedItems = [];
    }
    this.bulkSelection = this.selectedItems.length == this.viewData.length;

    // for (const item of this.viewData) {
    //   this.selectedItems.push(item.uuid);
    //   item.itemSelected = !item.itemSelected;
    // }
  }

  bulktoggleAutoRemediation(status: boolean) {
    this.bulkautoRemediation = status;

  }

  selectItems(view: mtpAutoRemediationViewData) {
    let index: number;
    view.itemSelected = !view.itemSelected;
    if (!view.itemSelected) {
      this.selectedItems.splice(this.selectedItems.indexOf(view.uuid), 1);
    } else {
      this.selectedItems.push(view.uuid);
    }
    this.bulkSelection = this.selectedItems.length == this.viewData.length;


    // if (view.itemSelected) {
    //   this.selectedItems.push(view.uuid);
    // }
    // else {
    //   index = this.selectedItems.indexOf(view.uuid);
    //   if (index !== -1) {
    //     this.selectedItems.splice(index, 1);
    //   }
    // }
    // if(this.selectedItems.length<=2){
    //   this.bulkSelection = !this.bulkSelection;
    // }
    // console.log(this.selectedItems);
  }

  toggleAutoRemiApply() {
    // console.log('clicked on bulktoggleAutoRemediation', this.bulkautoRemediation);
    // console.log(this.selectedItems);
    if (this.bulkautoRemediation) {
      this.selectedItems.forEach((item, index) => {
        // console.log('inside selectedItems array', item);
        // console.log(this.viewData);
        this.mtpAdministrationAutoRemediationService.getAutoRemData(item).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.mtpUserSettings = data;
          this.mtpUserSettings.auto_remediation_enabled = true;
          this.bulkToggleAutoRemediationSettings(data, index);
          this.bulkSelection = false;
          this.spinnerService.stop('main');
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.notification.error(new Notification('Failed to enable Auto Remediation. Please try again later.'));
          this.modalRef.hide();
        });
      });
    } else {
      this.selectedItems.forEach((item, index) => {
        // console.log('inside selectedItems array', item)
        this.mtpAdministrationAutoRemediationService.getAutoRemData(item).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.mtpUserSettings = data;
          this.mtpUserSettings.auto_remediation_enabled = false;
          this.bulkToggleAutoRemediationSettings(data, index);
          this.bulkSelection = false;
          this.spinnerService.stop('main');
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.notification.error(new Notification('Failed to disable Auto Remediation. Please try again later.'));
          this.modalRef.hide();
        });
      });
    }
    // this.getTenantData();
    // this.modalRef.hide();
  }

  bulkToggleAutoRemediationSettings(view: mtpAutoRemediationType, index: number) {
    // console.log('inside bulkToggleAutoRemediationSettings');
    this.mtpAdministrationAutoRemediationService.sendAutoRemData(this.mtpUserSettings, this.mtpUserSettings.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (index === this.selectedItems.length - 1) {
        this.selectedItems = [];
        // this.bulkSelect();
        if (view.auto_remediation_enabled == true) {
          this.notification.success(new Notification('Auto Remediation enabled successfully.'));
        } else {
          this.notification.success(new Notification('Auto Remediation disabled successfully.'));
        }
        this.getTenantData()
        this.modalRef.hide();
      }
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to enable Auto Remediation. Please try again later.'));
      this.modalRef.hide();
    });
  }

}