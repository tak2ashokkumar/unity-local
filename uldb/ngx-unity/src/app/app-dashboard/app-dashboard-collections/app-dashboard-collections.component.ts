import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { COLLECTION_STATUS_OPTIONS } from './app-dashboard-collections.const';
import { DashboardItem } from './app-dashboard-collections-crud/app-dashboard-collections-crud.type';
import { AppDashboardCollectionsService } from './app-dashboard-collections.service';
import { CuratedCollectionViewData } from './app-dashboard-collections.type';

@Component({
  selector: 'app-dashboard-collections',
  templateUrl: './app-dashboard-collections.component.html',
  styleUrls: ['./app-dashboard-collections.component.scss'],
  providers: [AppDashboardCollectionsService]
})
export class AppDashboardCollectionsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  count: number = 0;
  currentCriteria: SearchCriteria;
  viewData: CuratedCollectionViewData[] = [];
  selectedView: CuratedCollectionViewData;
  selectedStatusFilter: string = '';
  statusOptions = COLLECTION_STATUS_OPTIONS;
  popOverList: string[] = [];
  defaultDashboards: DashboardItem[] = [];
  myDashboards: DashboardItem[] = [];
  modalSelectedDashboards: DashboardItem[] = [];
  defaultSearch = '';
  mySearch = '';
  selectedSearch = '';

  @ViewChild('confirmDeleteRef') confirmDeleteRef: ElementRef;
  @ViewChild('confirmStatusChangeRef') confirmStatusChangeRef: ElementRef;
  @ViewChild('dashboardPickerRef') dashboardPickerRef: TemplateRef<any>;
  modalRef: BsModalRef;

  get filteredDefault(): DashboardItem[] {
    const q = this.defaultSearch.trim().toLowerCase();
    const dashboards = this.availableDefaultDashboards;
    return q ? dashboards.filter(d => d.name.toLowerCase().includes(q)) : dashboards;
  }

  get filteredMy(): DashboardItem[] {
    const q = this.mySearch.trim().toLowerCase();
    const dashboards = this.availableMyDashboards;
    return q ? dashboards.filter(d => d.name.toLowerCase().includes(q)) : dashboards;
  }

  get filteredSelected(): DashboardItem[] {
    const q = this.selectedSearch.trim().toLowerCase();
    return q ? this.modalSelectedDashboards.filter(d => d.name.toLowerCase().includes(q)) : this.modalSelectedDashboards;
  }

  get availableDefaultDashboards(): DashboardItem[] {
    return this.defaultDashboards.filter(dashboard => !this.isDashboardInModalSelection(dashboard));
  }

  get availableMyDashboards(): DashboardItem[] {
    return this.myDashboards.filter(dashboard => !this.isDashboardInModalSelection(dashboard));
  }

  get dashboardsToBeSelectedCount(): number {
    return [
      ...this.availableDefaultDashboards,
      ...this.availableMyDashboards
    ].filter(dashboard => dashboard.checked).length;
  }

  get dashboardsToBeRemovedCount(): number {
    return this.modalSelectedDashboards.filter(dashboard => dashboard.checked).length;
  }

  constructor(
    private svc: AppDashboardCollectionsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
  ) {
    this.currentCriteria = {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [{}]
    };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCollections();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getCollections();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCollections();
  }

  onStatusFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.params = [{ status: this.selectedStatusFilter }];
    this.currentCriteria.pageNo = 1;
    this.getCollections();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCollections();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCollections();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.selectedStatusFilter = '';
    this.currentCriteria = {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: pageNo,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [{}]
    };
    this.getCollections();
  }

  getCollections() {
    this.svc.getCollections(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.count = res.count;
        this.viewData = this.svc.convertToViewData(res.results);
        this.spinner.stop('main');
      }, (error: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to fetch Collections. Try again later.'));
        this.spinner.stop('main');
      });
  }

  showRoles(view: CuratedCollectionViewData) {
    this.popOverList = view.userRoles;
  }

  showGroups(view: CuratedCollectionViewData) {
    this.popOverList = view.userGroups;
  }

  toggleStatus(view: CuratedCollectionViewData, isDraft: boolean) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirmStatusChangeRef,
      Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggleStatus() {
    this.modalRef.hide();
    const newStatus = this.selectedView.status === 'draft' ? 'published' : 'draft';
    this.svc.saveStatus(this.selectedView.collectionId, newStatus)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.notification.success(new Notification('Status updated successfully.'));
        this.getCollections();
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to update status.'));
      });
  }

  add() {
    this.router.navigate(['collections/create'], { relativeTo: this.route.parent });
  }

  viewCollection(view: CuratedCollectionViewData) {
    this.router.navigate(['collections', view.collectionId, 'view'], { relativeTo: this.route.parent });
  }

  edit(view: CuratedCollectionViewData) {
    this.router.navigate(['collections', view.collectionId, 'update'], { relativeTo: this.route.parent });
  }

  openDashboardModal(view: CuratedCollectionViewData) {
    this.spinner.start('main');
    this.selectedView = view;
    this.defaultSearch = '';
    this.mySearch = '';
    this.selectedSearch = '';
    forkJoin({
      collection: this.svc.getCollection(view.collectionId),
      defaults: this.svc.getDefaultDashboards().pipe(catchError(() => of([]))),
      myDash: this.svc.getMyDashboards().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ collection, defaults, myDash }) => {
      if (!collection) {
        this.spinner.stop('main');
        this.notification.error(new Notification('Collection details not found.'));
        return;
      }
      this.defaultDashboards = defaults;
      this.myDashboards = myDash;
      this.modalSelectedDashboards = this.svc.getSelectedDashboards(collection, [...defaults, ...myDash]);
      this.clearSourceSelections();
      this.spinner.stop('main');
      this.modalRef = this.modalService.show(this.dashboardPickerRef,
        Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Collection dashboards. Try again later.'));
    });
  }

  moveToSelected() {
    const checked = [
      ...this.availableDefaultDashboards.filter(d => d.checked),
      ...this.availableMyDashboards.filter(d => d.checked)
    ];
    checked.forEach(item => {
      if (!this.modalSelectedDashboards.some(s => s.uuid === item.uuid)) {
        this.modalSelectedDashboards = [...this.modalSelectedDashboards, { ...item, checked: false }];
      }
      item.checked = false;
    });
  }

  moveFromSelected() {
    this.modalSelectedDashboards = this.modalSelectedDashboards.filter(dashboard => !dashboard.checked);
  }

  updateCollectionDashboards() {
    this.spinner.start('main');
    this.svc.updateCollectionDashboards(this.selectedView.collectionId, this.modalSelectedDashboards)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.modalRef.hide();
        this.notification.success(new Notification('Collection dashboards updated successfully.'));
        this.getCollections();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update Collection dashboards. Try again later.'));
      });
  }

  isDashboardInModalSelection(item: DashboardItem): boolean {
    return this.modalSelectedDashboards.some(dashboard => dashboard.uuid === item.uuid);
  }

  delete(view: CuratedCollectionViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirmDeleteRef,
      Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.selectedView.collectionId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Collection deleted successfully.'));
        this.getCollections();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to delete Collection. Try again later.'));
      });
  }

  private clearSourceSelections() {
    [...this.defaultDashboards, ...this.myDashboards].forEach(dashboard => dashboard.checked = false);
  }
}
