import { Component, ElementRef, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { UsiWorkflowIntegrationService, workflowIntegrationViewData } from './usi-workflow-integration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { workflowIntegration } from './usi-workflow-integration.type';


@Component({
  selector: 'usi-workflow-integration',
  templateUrl: './usi-workflow-integration.component.html',
  styleUrls: ['./usi-workflow-integration.component.scss'],
  providers: [UsiWorkflowIntegrationService]
})
export class UsiWorkflowIntegrationComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  viewData: workflowIntegrationViewData[] = [];
  @ViewChild('edit') edit: ElementRef;
  editModelRef: BsModalRef;
  wfId: string;
  @Output() copyUrl = new EventEmitter<string>();

  deleteWorkflowIntegrationModalRef: BsModalRef;
  @ViewChild('deleteIntegration') deleteIntegration: ElementRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UsiWorkflowIntegrationService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,params: [{ type: '', status: '' }] };
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    this.getWorkflowIntegrations();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,params: [{ type: '', status: '' }] };
    this.getWorkflowIntegrations();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getWorkflowIntegrations();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getWorkflowIntegrations();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getWorkflowIntegrations();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getWorkflowIntegrations();
  }

  onFilterChange(){
    this.getWorkflowIntegrations();
  }

  cpyUrl(url: string) {
    // this.copyUrl.emit(url);
    try {
      navigator.clipboard.writeText(url).then(() => {
          this.notificationService.success(new Notification('Link is copied to clipboard.'));
        })
    } catch (err) {
      this.notificationService.error(new Notification('Failed to copy key. Please try again later.'));
    }
  }

  toggleStatus(status: boolean, view: workflowIntegrationViewData) {
    if (status === true) {
      view['enabled'] = true;
    } else {
      view['enabled'] = false;
    }
    this.svc.toggleStatus(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Failed to change status'));
    });
  }

  getWorkflowIntegrations() {
    // this.spinner.start('main');
    this.svc.getWorkflowIntegrations(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<workflowIntegration>) => {
      this.spinner.stop('main');
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  integrateWorkflow(){
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToHistory(view: workflowIntegrationViewData){
    this.router.navigate([view.uuid, 'history'], { relativeTo: this.route });
  }

  editWorkflowIntegration(view: workflowIntegrationViewData){
    this.wfId = view.uuid;
    this.editModelRef = this.modalService.show(this.edit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEdit() {
    this.editModelRef.hide();
    this.router.navigate([this.wfId, 'edit'], { relativeTo: this.route });
  }

  deleteWorkflowIntegration(uuid: string) {
    this.wfId = uuid;
    this.deleteWorkflowIntegrationModalRef = this.modalService.show(this.deleteIntegration, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmWorkflowIntegrationDelete() {
    this.deleteWorkflowIntegrationModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteWorkflowIntegration(this.wfId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Workflow Integration deleted successfully.'));
      this.getWorkflowIntegrations();
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Unable to delete Workflow Integration.Please try again Later.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
