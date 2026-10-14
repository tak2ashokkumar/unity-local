import { Location } from '@angular/common';
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
import { LinkedTask, OrchestrationViewDetailDataType } from './orchestration-integration-details.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FilterConfig, HeaderAction, SelectedFilters, SortDirection, SortEvent, TableColumn } from 'src/app/shared/app-generic-table/app-generic-table.type';

@Component({
  selector: 'orchestration-integration-details',
  templateUrl: './orchestration-integration-details.component.html',
  styleUrls: ['./orchestration-integration-details.component.scss']
  // OrchestrationIntegrationDetailsService is providedIn: 'root' — not listed here
})
export class OrchestrationIntegrationDetailsComponent implements OnInit, OnDestroy {

  headerActions: HeaderAction[] = [
    { id: 'script', label: 'Add Script', icon: 'fas fa-plus', btnClass: 'ct-btn-primary' }
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', widthClass: 'tdw-20', sortable: true, sortField: 'name', locked: true },
    { key: 'type', label: 'Type', widthClass: 'tdw-10', sortable: true, sortField: 'type' },
    { key: 'scriptType', label: 'Script Type', widthClass: 'tdw-15', sortable: true, sortField: 'script_type' },
    { key: 'description', label: 'Description', widthClass: 'tdw-15', sortable: true, sortField: 'description' },
    { key: 'createdAt', label: 'Created On', widthClass: 'tdw-10' },
    { key: 'createdByName', label: 'Created By', widthClass: 'tdw-10' },
    { key: 'actions', label: 'Actions', align: 'center', locked: true, cellClass: 'action-icons-column' }
  ];

  scriptChoices = SCRIPT_CHOICES;

  get filterConfig(): FilterConfig[] {
    return [
      {
        key: 'type', label: 'Type', options: [
          { label: 'Default', value: 'default' },
          { label: 'Custom', value: 'custom' }
        ]
      },
      { key: 'script_type', label: 'Script Type', options: this.scriptChoices.map(s => ({ label: s.label, value: s.value })) }
    ];
  }

  get selectedFiltersForTable(): SelectedFilters {
    const result: SelectedFilters = {};
    const params = this.currentCriteria.params[0];
    if (params.type) result['type'] = String(params.type).split(',');
    if (params.script_type) result['script_type'] = String(params.script_type).split(',');
    return result;
  }

  private ngUnsubscribe = new Subject();
  repoId: string;
  subscr: Subscription;
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

  cloneModalRef: BsModalRef;
  @ViewChild('clone') clone: ElementRef;
  scriptName: string;
  scriptUUID: string;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  linkedTasks: LinkedTask[] = [];
  showAllLinkedTasks = false;

  downloadUrl: string;
  activeSortField: string | null = null;
  activeSortDirection: SortDirection = null;

  private integrationReturnUrl: string;

  constructor(
    private location: Location,
    private orchestrationIntegrationDetailsService: OrchestrationIntegrationDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    const navigation = this.router.getCurrentNavigation();
    const navigationState = navigation ? navigation.extras.state : this.location.getState();
    this.integrationReturnUrl = navigationState?.['integrationReturnUrl'] || '/services/orchestration/integration';

    this.route.paramMap.subscribe(params => this.repoId = params.get('repoId'));
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '', script_type: '' }] };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.restoreCriteria();
    this.getSummaryDetails();
    this.getDetailsData();
  }

  ngOnDestroy() {
    this.cloneModalRef?.hide();
    this.playbookViewModalRef?.hide();
    this.confirmDeleteModalRef?.hide();
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private restoreCriteria(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.applyQueryParamsToCriteria(qp);
  }

  private applyQueryParamsToCriteria(qp: ParamMap): void {
    this.currentCriteria.params[0].type = qp.get('type') || '';
    this.currentCriteria.params[0].script_type = qp.get('script_type') || '';
    this.currentCriteria.searchValue = qp.get('search') || '';
    this.currentCriteria.sortColumn = qp.get('sortColumn') || '';
    this.currentCriteria.sortDirection = (qp.get('sortDirection') as '' | 'asc' | 'desc') || '';
    this.activeSortField = this.currentCriteria.sortColumn || null;
    this.activeSortDirection = (this.currentCriteria.sortDirection || null) as SortDirection;
    const pageNo = qp.get('pageNo');
    const pageSize = qp.get('pageSize');
    this.currentCriteria.pageNo = pageNo ? +pageNo : 1;
    this.currentCriteria.pageSize = pageSize ? +pageSize : PAGE_SIZES.DEFAULT_PAGE_SIZE;
  }

  private syncCriteriaToQueryParams(): void {
    const params = this.currentCriteria.params[0];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: params.type || null,
        script_type: params.script_type || null,
        search: this.currentCriteria.searchValue || null,
        sortColumn: this.currentCriteria.sortColumn || null,
        sortDirection: this.currentCriteria.sortDirection || null,
        pageNo: this.currentCriteria.pageNo !== 1 ? this.currentCriteria.pageNo : null,
        pageSize: this.currentCriteria.pageSize !== PAGE_SIZES.DEFAULT_PAGE_SIZE ? this.currentCriteria.pageSize : null
      },
      state: { integrationReturnUrl: this.integrationReturnUrl },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onHeaderAction(id: string) {
    if (id === 'script') this.goToCreate();
  }

  onFiltersApplied(filters: SelectedFilters) {
    this.currentCriteria.params[0].type = filters['type']?.length ? filters['type'].join(',') : '';
    this.currentCriteria.params[0].script_type = filters['script_type']?.length ? filters['script_type'].join(',') : '';
    this.currentCriteria.pageNo = 1;
    this.onFilterChange();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getDetailsData();
  }

  onSortChanged(event: SortEvent) {
    this.spinner.start('main');
    this.activeSortField = event.direction ? event.field : null;
    this.activeSortDirection = event.direction;
    this.currentCriteria.sortColumn = event.direction ? event.field : '';
    this.currentCriteria.sortDirection = event.direction || '';
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getDetailsData();
  }

  refreshData() {
    this.spinner.start('main');
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
    this.syncCriteriaToQueryParams();
    this.getDetailsData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getDetailsData();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getDetailsData();
  }

  getDetailsData() {
    this.orchestrationIntegrationDetailsService.getDetails(this.repoId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.orchestrationIntegrationDetailsService.convertToViewData(data.results);
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
    this.router.navigate(['create'], { relativeTo: this.route, state: { integrationDetailsReturnUrl: this.router.url, integrationReturnUrl: this.integrationReturnUrl } });
  }

  goBack() {
    this.router.navigateByUrl(this.integrationReturnUrl);
  }

  editScript(data: any) {
    this.router.navigate(['edit', data.uuid], { relativeTo: this.route, state: { integrationDetailsReturnUrl: this.router.url, integrationReturnUrl: this.integrationReturnUrl } });
  }

  goToActivityLogs(data: any) {
    this.router.navigate(['activitylog', data.uuid], { relativeTo: this.route, state: { integrationDetailsReturnUrl: this.router.url, integrationReturnUrl: this.integrationReturnUrl } });
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
    this.linkedTasks = [];
    this.showAllLinkedTasks = false;
    this.spinner.start('main');
    this.orchestrationIntegrationDetailsService.getRelatedItems(UUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.linkedTasks = Array.isArray(data) ? data : [];
      this.spinner.stop('main');
      this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to check linked tasks. Please try again.'));
    });
  }

  confirmScriptDelete() {
    this.confirmDeleteModalRef?.hide();
    this.performScriptDelete();
  }

  private performScriptDelete() {
    this.spinner.start('main');
    this.orchestrationIntegrationDetailsService.deleteScript(this.scriptUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Script deleted successfully.'));
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
