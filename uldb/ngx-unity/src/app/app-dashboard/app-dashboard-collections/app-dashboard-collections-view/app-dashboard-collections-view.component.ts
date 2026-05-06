import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CollectionDetailResponse, DashboardItem } from '../app-dashboard-collections-crud/app-dashboard-collections-crud.type';
import { AppDashboardCollectionsViewService } from './app-dashboard-collections-view.service';

@Component({
  selector: 'app-dashboard-collections-view',
  templateUrl: './app-dashboard-collections-view.component.html',
  styleUrls: ['./app-dashboard-collections-view.component.scss'],
  providers: [AppDashboardCollectionsViewService]
})
export class AppDashboardCollectionsViewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  collectionId: string;
  collection: CollectionDetailResponse;

  defaultDashboards: DashboardItem[] = [];
  myDashboards: DashboardItem[] = [];
  selectedDashboards: DashboardItem[] = [];
  modalSelectedDashboards: DashboardItem[] = [];

  defaultSearch = '';
  mySearch = '';
  selectedSearch = '';
  dashboardName = '';
  dashboardImageName = '';
  selectedDashboard: DashboardItem | null = null;
  selectedDashboardImage: File | null = null;

  modalRef: BsModalRef;
  @ViewChild('dashboardPickerRef') dashboardPickerRef: TemplateRef<any>;
  @ViewChild('dashboardImageRef') dashboardImageRef: TemplateRef<any>;
  @ViewChild('collectionImageInput') collectionImageInput: ElementRef<HTMLInputElement>;
  @ViewChild('dashboardImageInput') dashboardImageInput: ElementRef<HTMLInputElement>;

  get collectionName(): string {
    return this.collection?.name || 'Collection';
  }

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
    private svc: AppDashboardCollectionsViewService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.collectionId = params.get('collectionId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadInitialData() {
    forkJoin({
      collection: this.svc.getCollection(this.collectionId),
      defaults: this.svc.getDefaultDashboards().pipe(catchError(() => of([]))),
      myDash: this.svc.getMyDashboards().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ collection, defaults, myDash }) => {
      if (!collection) {
        this.spinner.stop('main');
        this.notification.error(new Notification('Collection details not found.'));
        return;
      }
      this.collection = collection;
      this.defaultDashboards = defaults;
      this.myDashboards = myDash;
      this.selectedDashboards = this.svc.getSelectedDashboards(collection, [...defaults, ...myDash]);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Collection. Try again later.'));
    });
  }

  openDashboardModal() {
    this.defaultSearch = '';
    this.mySearch = '';
    this.selectedSearch = '';
    this.clearSourceSelections();
    this.modalSelectedDashboards = this.cloneDashboards(this.selectedDashboards);
    this.modalRef = this.modalService.show(this.dashboardPickerRef,
      Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
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
    this.svc.updateCollectionDashboards(this.collectionId, this.modalSelectedDashboards)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.selectedDashboards = this.cloneDashboards(this.modalSelectedDashboards);
        this.modalRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Collection dashboards updated successfully.'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update Collection dashboards. Try again later.'));
      });
  }

  openCollectionImageSelector() {
    this.collectionImageInput.nativeElement.click();
  }

  uploadCollectionImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file) {
      return;
    }

    this.spinner.start('main');
    this.svc.updateCollectionImage(this.collectionId, file)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((collection: CollectionDetailResponse) => {
        this.collection = {
          ...this.collection,
          image_url: collection && collection.image_url ? collection.image_url : this.collection.image_url
        };
        input.value = '';
        this.spinner.stop('main');
        this.notification.success(new Notification('Collection banner updated successfully.'));
      }, () => {
        input.value = '';
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update Collection banner. Try again later.'));
      });
  }

  openDashboardImageModal(dashboard: DashboardItem) {
    this.selectedDashboard = dashboard;
    this.dashboardName = dashboard.name;
    this.dashboardImageName = '';
    this.selectedDashboardImage = null;
    if (this.dashboardImageInput) {
      this.dashboardImageInput.nativeElement.value = '';
    }
    this.modalRef = this.modalService.show(this.dashboardImageRef,
      Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  onDashboardImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file) {
      return;
    }
    this.selectedDashboardImage = file;
    this.dashboardImageName = file.name;
  }

  updateDashboardImage() {
    if (!this.selectedDashboard) {
      return;
    }

    this.spinner.start('main');
    this.svc.updateDashboardImage(this.selectedDashboard, this.dashboardName, this.selectedDashboardImage)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((dashboard: any) => {
        const selectedDashboard = this.selectedDashboard as DashboardItem;
        const imageUrl = dashboard && dashboard.image_url ? dashboard.image_url : selectedDashboard.image_url;
        this.updateDashboardInLists(selectedDashboard.uuid, this.dashboardName, imageUrl);
        if (this.dashboardImageInput) {
          this.dashboardImageInput.nativeElement.value = '';
        }
        this.modalRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Dashboard thumbnail updated successfully.'));
      }, () => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update Dashboard thumbnail. Try again later.'));
      });
  }

  isDashboardInModalSelection(item: DashboardItem): boolean {
    return this.modalSelectedDashboards.some(dashboard => dashboard.uuid === item.uuid);
  }

  goBack() {
    this.router.navigate(['collections'], { relativeTo: this.route.parent });
  }

  private cloneDashboards(dashboards: DashboardItem[]): DashboardItem[] {
    return (dashboards || []).map(dashboard => ({ ...dashboard, checked: false }));
  }

  private clearSourceSelections() {
    [...this.defaultDashboards, ...this.myDashboards].forEach(dashboard => dashboard.checked = false);
  }

  private updateDashboardInLists(uuid: string, name: string, imageUrl: string | undefined) {
    [this.selectedDashboards, this.modalSelectedDashboards, this.defaultDashboards, this.myDashboards].forEach(list => {
      (list || []).forEach(dashboard => {
        if (dashboard.uuid === uuid) {
          dashboard.name = name;
          dashboard.image_url = imageUrl;
        }
      });
    });
  }
}
