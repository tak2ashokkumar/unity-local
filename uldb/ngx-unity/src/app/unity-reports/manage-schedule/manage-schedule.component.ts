import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType, } from 'src/app/shared/app-storage/storage.service';
import { PAGE_SIZES, SearchCriteria, } from 'src/app/shared/table-functionality/search-criteria';
import { RoundedTabDataType } from 'src/app/shared/unity-rounded-tab/unity-rounded-tab.component';
import { ManageReportSummaryCountDataType } from '../report-management/report-management.type';
import { ManageScheduleService, ManageScheduleViewData, } from './manage-schedule.service';

interface ScheduleFeatureOption {
  label: string;
  value: string;
  countKey: keyof ManageReportSummaryCountDataType;
  count: number;
  active: boolean;
}

const DEFAULT_SCHEDULE_FEATURE = 'Cloud Inventory';
const SELECTED_ICON_CLASS = 'fa-check-square';
const UNSELECTED_ICON_CLASS = 'fa-square';

/**
 * Coordinates the Manage Schedule screen state, template bindings, and user actions.
 */
@Component({
  selector: 'manage-schedule',
  templateUrl: './manage-schedule.component.html',
  styleUrls: ['./manage-schedule.component.scss'],
  providers: [ManageScheduleService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageScheduleComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly modalConfig = { class: '', keyboard: true, ignoreBackdropClick: true, };
  private selectedScheduleId: string;

  /**
   * Defines the report/schedule tab navigation rendered by the header.
   */
  readonly tabItems: RoundedTabDataType[] = [
    { name: 'Manage Report', url: '/reports/manage-reports' },
    { name: 'Manage Schedule', url: '/reports/manage-schedules' },
  ];

  /**
   * Stores the confirmation modal template used for single delete.
   */
  @ViewChild('confirm', { static: true }) confirm: TemplateRef<void>;

  /**
   * Stores the confirmation modal template used for bulk delete.
   */
  @ViewChild('multiconfirm', { static: true }) multiconfirm: TemplateRef<void>;

  /**
   * Holds the currently opened confirmation modal reference.
   */
  modalRef: BsModalRef;

  /**
   * Stores the active table search, sort, and paging criteria.
   */
  currentCriteria: SearchCriteria = this.createDefaultCriteria();

  /**
   * Stores feature-level schedule counts for the left navigation.
   */
  scheduleReportSummaryData: ManageReportSummaryCountDataType;

  /**
   * Stores the currently selected report feature name.
   */
  feature = DEFAULT_SCHEDULE_FEATURE;

  /**
   * Stores feature navigation options with resolved counts and selected state.
   */
  featureOptions: ScheduleFeatureOption[] = this.buildFeatureOptions();

  /**
   * Stores the table-ready rows rendered by the template.
   */
  viewData: ManageScheduleViewData[] = [];

  /**
   * Stores schedule identifiers selected for bulk actions.
   */
  selectedScheduleIds: string[] = [];

  /**
   * Tracks whether all visible rows are selected for bulk actions.
   */
  selectedAll = false;

  /**
   * Tracks whether the bulk action toolbar should be displayed.
   */
  hasBulkSelection = false;

  /**
   * Stores the icon class for the select-all control.
   */
  selectAllIconClass = UNSELECTED_ICON_CLASS;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private scheduleSvc: ManageScheduleService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Initializes Manage Schedule Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    const storedFeature = this.storageService.getByKey(
      'feature',
      StorageType.SESSIONSTORAGE
    );

    this.selectFeature(storedFeature || DEFAULT_SCHEDULE_FEATURE);
    this.getManageSchedulesCount();
  }

  /**
   * Releases Manage Schedule Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles the searched event from the template.
   *
   * @param searchValue - Search text emitted by the search control.
   * @returns Nothing.
   */
  onSearched(searchValue: string): void {
    this.currentCriteria.searchValue = searchValue;
    this.currentCriteria.pageNo = 1;
    this.getSchedules();
  }

  /**
   * Loads schedule counts used by the feature navigation.
   *
   * @returns Nothing.
   */
  getManageSchedulesCount(): void {
    this.spinner.start('main');
    this.scheduleSvc.getManageSchedulesCount()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      ).subscribe((response) => {
        this.scheduleReportSummaryData = response.schedules;
        this.featureOptions = this.buildFeatureOptions(response.schedules);
      }, () => {
        this.notification.error(
          new Notification(
            'Error while fetching schedule summary!! Please try again.'
          )
        );
      }
      );
  }

  /**
   * Selects the feature used to scope schedule APIs and routes.
   *
   * @param feature - Report feature name selected by the user.
   * @returns Nothing.
   */
  selectFeature(feature: string): void {
    this.feature = feature;
    this.updateFeatureOptionsState();
    this.storageService.put('feature', feature, StorageType.SESSIONSTORAGE);
    this.getSchedules();
    this.clearSelection();
  }

  /**
   * Loads schedules for the selected feature and active search criteria.
   *
   * @returns Nothing.
   */
  getSchedules(): void {
    this.spinner.start('main');
    this.scheduleSvc.getSchedules(this.feature, this.currentCriteria)
      .pipe(takeUntil(this.destroy$), finalize(() => this.stopSpinnerAndMarkForCheck())).subscribe((schedules) => {
        this.viewData = this.scheduleSvc.convertToViewData(schedules);
        this.updateSelectionState();
      }, () => {
        this.notification.error(
          new Notification(
            'Error while fetching schedule!! Please try again.'
          )
        );
      }
      );
  }

  /**
   * Navigates to the schedule create route for the selected feature.
   *
   * @returns Nothing.
   */
  goToCreate(): void {
    this.router.navigate([this.feature, 'create'], { relativeTo: this.route });
  }

  /**
   * Navigates to the schedule edit route.
   *
   * @param view - Table row selected by the user.
   * @returns Nothing.
   */
  goToEdit(view: ManageScheduleViewData): void {
    this.router.navigate([this.feature, view.uuid, 'update'], {
      relativeTo: this.route,
    });
  }

  /**
   * Opens the delete confirmation dialog for a single schedule.
   *
   * @param view - Table row selected by the user.
   * @returns Nothing.
   */
  deleteSchedule(view: ManageScheduleViewData): void {
    this.selectedScheduleId = view.uuid;
    this.modalRef = this.modalService.show(this.confirm, this.modalConfig);
  }

  /**
   * Deletes the selected schedule after confirmation.
   *
   * @returns Nothing.
   */
  confirmDelete(): void {
    this.spinner.start('main');
    this.closeModal();
    this.scheduleSvc.delete(this.selectedScheduleId)
      .pipe(takeUntil(this.destroy$), finalize(() => this.stopSpinnerAndMarkForCheck())).subscribe(() => {
        this.getSchedules();
        this.getManageSchedulesCount();
        this.notification.success(
          new Notification('Schedule Deleted successfully')
        );
      }, () => {
        this.notification.error(
          new Notification('Schedule could not be Deleted')
        );
      }
      );
  }

  /**
   * Toggles selection for all currently visible schedules.
   *
   * @returns Nothing.
   */
  selectAll(): void {
    if (!this.viewData.length) {
      this.clearSelection();
      return;
    }

    const shouldSelect = !this.selectedAll;
    this.viewData.forEach((view) =>
      this.setScheduleSelection(view, shouldSelect)
    );
    this.selectedScheduleIds = shouldSelect ? this.viewData.map((view) => view.uuid) : [];
    this.updateSelectionState();
  }

  /**
   * Toggles a single schedule row selection.
   *
   * @param view - Table row selected by the user.
   * @returns Nothing.
   */
  select(view: ManageScheduleViewData): void {
    this.setScheduleSelection(view, !view.isSelected);
    this.selectedScheduleIds = this.viewData.filter((schedule) => schedule.isSelected).map((schedule) => schedule.uuid);
    this.updateSelectionState();
  }

  /**
   * Opens the bulk delete confirmation dialog.
   *
   * @returns Nothing.
   */
  multipleDelete(): void {
    this.modalRef = this.modalService.show(this.multiconfirm, this.modalConfig);
  }

  /**
   * Deletes all selected schedules after confirmation.
   *
   * @returns Nothing.
   */
  confirmMultipleDelete(): void {
    this.spinner.start('main');
    this.closeModal();
    this.scheduleSvc.multipleScheduleDelete(this.selectedScheduleIds)
      .pipe(takeUntil(this.destroy$), finalize(() => this.stopSpinnerAndMarkForCheck())).subscribe(() => {
        this.getSchedules();
        this.getManageSchedulesCount();
        this.clearSelection();
        this.notification.success(
          new Notification('Schedule Deleted successfully')
        );
      }, () => {
        this.clearSelection();
        this.notification.error(
          new Notification('Schedule could not be Deleted')
        );
      }
      );
  }

  /**
   * Closes the active modal when present.
   *
   * @returns Nothing.
   */
  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  /**
   * Returns a stable identity for feature rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param featureOption - Feature option rendered by ngFor.
   * @returns A stable identity value for Angular change detection.
   */
  trackByFeature(_index: number, featureOption: ScheduleFeatureOption): string {
    return featureOption.value;
  }

  /**
   * Returns a stable identity for schedule rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param schedule - Schedule row rendered by ngFor.
   * @returns A stable identity value for Angular change detection.
   */
  trackBySchedule(_index: number, schedule: ManageScheduleViewData): string {
    return schedule.uuid;
  }

  private createDefaultCriteria(): SearchCriteria {
    return {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.ZERO,
    };
  }

  private buildFeatureOptions(counts?: ManageReportSummaryCountDataType): ScheduleFeatureOption[] {
    const options: Array<Omit<ScheduleFeatureOption, 'count' | 'active'>> = [
      {
        label: 'Cloud Inventory',
        value: 'Cloud Inventory',
        countKey: 'cloudInventory',
      },
      { label: 'DC Inventory', value: 'DC Inventory', countKey: 'DCInventory' },
      {
        label: 'Cost Analysis',
        value: 'Cost Analysis',
        countKey: 'costAnalysis',
      },
      {
        label: 'Sustainability',
        value: 'sustainability',
        countKey: 'sustainability',
      },
      { label: 'Performance', value: 'Performance', countKey: 'Performance' },
      {
        label: 'DevOps Automation',
        value: 'DevOps Automation',
        countKey: 'DevOpsAutomation',
      },
      {
        label: 'UnityOne ITSM',
        value: 'UnityOne ITSM',
        countKey: 'UnityOneITSM',
      },
    ];

    return options.map((featureOption) => ({
      ...featureOption,
      count: counts ? counts[featureOption.countKey] || 0 : 0,
      active: featureOption.value === this.feature,
    }));
  }

  private updateFeatureOptionsState(): void {
    this.featureOptions = this.featureOptions.map((featureOption) => ({
      ...featureOption,
      active: featureOption.value === this.feature,
    }));
  }

  private clearSelection(): void {
    this.viewData.forEach((view) => this.setScheduleSelection(view, false));
    this.selectedScheduleIds = [];
    this.updateSelectionState();
  }

  private setScheduleSelection(view: ManageScheduleViewData, isSelected: boolean): void {
    view.isSelected = isSelected;
    view.selectionIconClass = isSelected ? SELECTED_ICON_CLASS : UNSELECTED_ICON_CLASS;
  }

  private updateSelectionState(): void {
    this.selectedAll = this.viewData.length > 0 && this.selectedScheduleIds.length === this.viewData.length;
    this.hasBulkSelection = this.selectedScheduleIds.length > 0;
    this.selectAllIconClass = this.selectedAll ? SELECTED_ICON_CLASS : UNSELECTED_ICON_CLASS;
    this.cdr.markForCheck();
  }

  private stopSpinnerAndMarkForCheck(): void {
    this.spinner.stop('main');
    this.cdr.markForCheck();
  }
}
