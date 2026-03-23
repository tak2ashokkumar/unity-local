import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BusinessServicesService, BusinessViewData } from './business-services.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'business-services',
  templateUrl: './business-services.component.html',
  styleUrls: ['./business-services.component.scss'],
  providers: [BusinessServicesService]
})
export class BusinessServicesComponent implements OnInit {

  currentCriteria: SearchCriteria;
  viewData: BusinessViewData[] = [];
  selectedView: BusinessViewData;
  private ngUnsubscribe = new Subject();
  count: number = 0;
  popOverLccList: any;
  popOverAppList: any;
  popOverAppTypeList: any;
  popOverBCList: any;
  backendResult: any;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;


  constructor(private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private svc: BusinessServicesService,
    private modalService: BsModalService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ is_active: '' }] };
  }


  ngOnInit(): void {
    this.spinner.start('main');
    this.getBusinessServiceList();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ is_active: '' }] };
    this.getBusinessServiceList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getBusinessServiceList();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getBusinessServiceList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getBusinessServiceList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getBusinessServiceList();
  }


  getBusinessServiceList() {
    this.svc.getBusinessServiceList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.backendResult = data.results;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Business Services'));
    });
  }


  showLccList(view: any) {
    this.popOverLccList = view.restLicenseCenters;
  }
  showAppList(view: any) {
    this.popOverAppList = view.restApplications;
  }
  showAppTypeList(view: any) {
    this.popOverAppTypeList = view.restApplicationTypes;
  }
  showBCList(view: any) {
    this.popOverBCList = view.restBusinessCriticalities;
  }


  edit(view: BusinessViewData) {
    this.router.navigate([view.id, 'edit'], { relativeTo: this.route });
  }

  delete(view: BusinessViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.selectedView.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Business Service deleted successfully'));
      this.getBusinessServiceList();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      if (err?.status != 500) {
        let msg = err.error?.msg ? err.error.msg : err.error;
        this.notification.error(new Notification(msg));
      } else {
        this.notification.error(new Notification('Failed to delete Business Service '));
      }
    })
  }

  addBusinessService() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToTopology(view: BusinessViewData) {
    this.router.navigate([view.id, 'summary'], { relativeTo: this.route });
  }

  switchServiceStatus(view: BusinessViewData) {
    const matchedObj = this.backendResult.find(item => item.id === view.id);

    if (!matchedObj) return;

    // Map business_name to business_service_name
    matchedObj['business_service'] = matchedObj['business'];
    delete matchedObj['business'];

    // Fix typo if exists
    if (matchedObj['visbility']) {
      matchedObj['visibility'] = matchedObj['visbility'];
      delete matchedObj['visbility'];
    }

    // Flatten license_cost_centers to match second payload style
    const flattenedLicenseCostCenters = matchedObj.license_cost_centers.map((lc: any) => ({
      license_centre_id: lc.license_centre_id,
      license_centre: lc.name || lc.license_centre || '', // pick name if exists
      building_block_code_id: lc.building_block_code_id,
      building_block_code: lc.building_block_code,
      app_name_id: lc.app_name_id,
      app_name: lc.app_name,
      business_criticality: lc.business_criticality,
      type_of_app: lc.type_of_app,
      cloud_types: lc.cloud_types,
      env: lc.env,
      deployment_model: lc.deployment_model
    }));

    matchedObj.license_cost_centers = flattenedLicenseCostCenters;

    // Toggle status
    matchedObj.status = matchedObj.status === 'ENABLE' ? 'DISABLE' : 'ENABLE';
    view.status = matchedObj.status;

    this.svc.toggleStatus(matchedObj, matchedObj.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // this.spinner.stop('main');
      this.notification.success(new Notification('Service enabled successfully.'));
      this.getBusinessServiceList();
    }, (err: HttpErrorResponse) => {
      this.getBusinessServiceList();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to enable Service. Please try again later.'));
    });
  }
}
