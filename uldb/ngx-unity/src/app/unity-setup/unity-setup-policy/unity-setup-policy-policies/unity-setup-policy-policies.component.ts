import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PolicyDataItemViewData, UnitySetupPolicyService } from '../unity-setup-policy.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnitySetupPolicyPoliciesService } from './unity-setup-policy-policies.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'unity-setup-policy-policies',
  templateUrl: './unity-setup-policy-policies.component.html',
  styleUrls: ['./unity-setup-policy-policies.component.scss'],
  providers: [UnitySetupPolicyPoliciesService]
})
export class UnitySetupPolicyPoliciesComponent implements OnInit {

  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  count: number;
  policyViewData: PolicyDataItemViewData[] = [];
  policyUuid: string;
  policyDeleteModalRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  subscr: Subscription;

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private svc: UnitySetupPolicyPoliciesService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService) {
    //initialize current criteria
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ is_enabled: '' }] };


  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.policyList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ is_enabled: '' }] };
    this.policyList();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.policyList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.policyList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.policyList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.policyList();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.policyList();
  }

  policyList() {
    this.svc.getPolicy(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.policyViewData = this.svc.convertToPolicyViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Policies'));
    });
  }

  toggleStatus(index: number, status: boolean) {
    this.spinner.start('main');
    this.svc.toggleStatus(this.policyViewData[index].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.policyList();
      this.spinner.stop('main');
      this.notification.success(new Notification('Succesfully changed policy status'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to change policy status'));
    });
  }

  deletePolicy(policyUuid: string) {
    this.policyUuid = policyUuid;
    this.policyDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  editPolicy(view: PolicyDataItemViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  confirmBudgetDelete() {
    this.policyDeleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deletePolicy(this.policyUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Policy deleted successfully.'));
      this.policyList();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Policy can not be deleted!! Please try again.'));
    });
  }

  createBudget() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }
}


