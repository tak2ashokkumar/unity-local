import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PolicyEvaluationsItemViewData, UnitySetupPolicyEvaluationsService } from './unity-setup-policy-evaluations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'unity-setup-policy-evaluations',
  templateUrl: './unity-setup-policy-evaluations.component.html',
  styleUrls: ['./unity-setup-policy-evaluations.component.scss'],
  providers: [UnitySetupPolicyEvaluationsService]
})
export class UnitySetupPolicyEvaluationsComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  viewData: PolicyEvaluationsItemViewData[] = [];
  count: number;
  // workflowId: string;
  currentCriteria: SearchCriteria;
  @ViewChild('details') details: ElementRef;
  payloadModelRef: BsModalRef;
  payloadJson: any;
  policyData: any = [];
  tableData: any = [];
  message: string = '';
  popOverList: string[] = [];

  constructor(private svc: UnitySetupPolicyEvaluationsService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,) {

    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ policy: '' }] };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getEvaluationTableData();
    this.policyList();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getEvaluationTableData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEvaluationTableData();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEvaluationTableData();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getEvaluationTableData();
    }

  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEvaluationTableData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ policy: '' }] };
    this.getEvaluationTableData();
  }

  //update below function to use convertToviewdata fn 
  getEvaluationTableData() {
    this.svc.getEvaluationTableData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch History data.'));
    });
  }

  policyList() {
    this.svc.getPolicy().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.policyData = (data);
      // this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      // this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Policies'));
    });
  }

  viewDetails(view: any) {
    this.payloadModelRef = this.modalService.show(this.details, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.tableData = view.details;
    this.message = view.message;
  }

  showUsers(view: any) {
    console.log(view, "view")
    this.popOverList = view.extraScopeIdentifier;
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
