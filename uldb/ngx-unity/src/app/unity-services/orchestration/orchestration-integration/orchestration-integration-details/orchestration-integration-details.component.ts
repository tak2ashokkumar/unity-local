import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DOWNLOAD_URL, ListSummaryViewModel, OrchestrationIntegrationDetailsService, PlaybooksViewData, SCRIPT_CHOICES, ScriptViewDataType } from './orchestration-integration-details.service';
import { TabData } from 'src/app/shared/tabdata';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { OrchestrationViewDetailDataType } from './orchestration-integration-details.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'orchestration-integration-details',
  templateUrl: './orchestration-integration-details.component.html',
  styleUrls: ['./orchestration-integration-details.component.scss'],
  providers: [OrchestrationIntegrationDetailsService]
})
export class OrchestrationIntegrationDetailsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  repoId: string;
  subscr: Subscription;
  // tabItems: TabData[] = tabData;
  viewData: any;
  currentCriteria: SearchCriteria;
  count: number = 0;

  repo: OrchestrationViewDetailDataType;
  listSummaryViewData: ListSummaryViewModel;

  @ViewChild('viewPlaybook') view: ElementRef;
  playbookViewModalRef: BsModalRef;
  detailsForm: FormGroup;
  taskModalRef: BsModalRef;
  playbookViewData: PlaybooksViewData[] = [];
  playbookUUID: string;
  playbook: PlaybooksViewData;
  scriptChoices = SCRIPT_CHOICES;

  cloneModalRef: BsModalRef;
  @ViewChild('clone') clone: ElementRef;
  scriptName: string;
  scriptUUID: string;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  downloadUrl: string;

  constructor(
    private orchestrationIntegrationDetailsService: OrchestrationIntegrationDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.route.paramMap.subscribe(params => this.repoId = params.get('repoId'));
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '', script_type: '' }] };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getSummaryDetails();
    this.getDetailsData();
  }

  ngOnDestroy() {
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDetailsData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDetailsData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getDetailsData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDetailsData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDetailsData();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getDetailsData();
  }

  getDetailsData() {
    this.orchestrationIntegrationDetailsService.getDetails(this.repoId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.orchestrationIntegrationDetailsService.convertToViewData(data.results);
      // this.buildDetailsForm(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Details'));
    });
  }

  getSummaryDetails() {
    this.orchestrationIntegrationDetailsService.getSummaryDetails(this.repoId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.listSummaryViewData = this.orchestrationIntegrationDetailsService.convertToListSummaryViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Details'));
    });
  }

  goToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  editScript(data: any) {
    this.router.navigate(['edit', data.uuid], { relativeTo: this.route });
  }

  goToActivityLogs(data: any) {
    this.router.navigate(['activitylog', data.uuid], { relativeTo: this.route });
  }

  cloneScript(scriptName: string, uuid: string) {
    this.scriptName = `Copy-${scriptName}`;
    this.scriptUUID = uuid;
    this.cloneModalRef = this.modalService.show(this.clone, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  viewDetails(data: ScriptViewDataType) {
    this.buildDeatilsForm(data);
    this.playbookViewModalRef = this.modalService.show(this.view, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  buildDeatilsForm(data: ScriptViewDataType) {
    this.detailsForm = this.orchestrationIntegrationDetailsService.buildDetailsForm(data);
  }

  confirmClone() {
    this.spinner.start('main');
    this.orchestrationIntegrationDetailsService.cloneData(this.scriptUUID, this.scriptName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // this.getTaskData();
      this.getSummaryDetails();
      this.getDetailsData();
      this.spinner.stop('main');
      this.notification.success(new Notification('Script cloned successfully'));
      this.cloneModalRef.hide();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to clone Script'));
      this.cloneModalRef.hide();
    });
  }

  deleteScript(UUID: string) {
    this.scriptUUID = UUID;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmScriptDelete() {
    this.confirmDeleteModalRef.hide();
    this.spinner.start('main');
    this.orchestrationIntegrationDetailsService.deleteScript(this.scriptUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Script deleted successfully.'));
      // this.getTaskData();
      this.getDetailsData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to delete Script. Please try again.'));
    });
  }

  downloadScript(uuid: string) {
    const matchedItem = this.viewData.find(item => item.uuid === uuid);
    if (matchedItem) {
      let ele = document.getElementById('file-downloader') as HTMLAnchorElement;
      ele.setAttribute('href', `/orchestration/scripts/${uuid}/download/`);
      ele.setAttribute('target', '_blank');
      ele.click();
      this.notification.success(new Notification('Script downloaded successfully.'));
    } else {
      this.notification.error(new Notification('Failed to download script. Try again later..'));
    }
  }
}
