import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UsiWorkflowIntegrationHistoryService, WorkflowIntegratonHistoryViewData } from './usi-workflow-integration-history.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FormBuilder } from '@angular/forms';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'usi-workflow-integration-history',
  templateUrl: './usi-workflow-integration-history.component.html',
  styleUrls: ['./usi-workflow-integration-history.component.scss'],
  providers: [UsiWorkflowIntegrationHistoryService]
})
export class UsiWorkflowIntegrationHistoryComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  viewData: WorkflowIntegratonHistoryViewData[] = [];
  count: number;
  workflowId: string;
  currentCriteria: SearchCriteria;
  @ViewChild('payload') payload: ElementRef;
  payloadModelRef: BsModalRef;
  payloadJson: any;

  constructor(private svc: UsiWorkflowIntegrationHistoryService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.workflowId = params.get('workflowId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getHistoryTableData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getHistoryTableData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getHistoryTableData();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getHistoryTableData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getHistoryTableData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getHistoryTableData();
  }

  getHistoryTableData() {
    // this.spinner.start('main');
    this.svc.getHistoryTableData(this.currentCriteria, this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch History data.'));
    });
  }

  viewPayload(view: WorkflowIntegratonHistoryViewData) {
    this.payloadModelRef = this.modalService.show(this.payload, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.payloadJson = JSON.stringify(view.payload, null, 2);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
