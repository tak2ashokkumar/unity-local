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
import { ReportManagementService, ReportManagementViewData, } from './report-management.service';
import { ManageReportSummaryCountDataType } from './report-management.type';

type ReportTypeFilter = 'all' | 'default' | 'custom';

interface ReportFeatureOption {
  label: string;
  value: string;
  countKey: keyof ManageReportSummaryCountDataType;
  count: number;
  active: boolean;
}

const DEFAULT_REPORT_FEATURE = 'Cloud Inventory';
const SELECTED_ICON_CLASS = 'fa-check-square';
const UNSELECTED_ICON_CLASS = 'fa-square';

/**
 * Coordinates the report management list screen and user actions.
 */
@Component({
  selector: 'report-management',
  templateUrl: './report-management.component.html',
  styleUrls: ['./report-management.component.scss'],
  providers: [ReportManagementService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportManagementComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly modalConfig = { class: '', keyboard: true, ignoreBackdropClick: true, };

  readonly tabItems: RoundedTabDataType[] = [
    { name: 'Manage Report', url: '/reports/manage-reports' },
    { name: 'Manage Schedule', url: '/reports/manage-schedules' },
  ];

  readonly reportTypeFilterOptions: Array<{ label: string; value: ReportTypeFilter; }> = [
    { label: 'All', value: 'all' },
    { label: 'Default', value: 'default' },
    { label: 'Custom', value: 'custom' },
  ];

  readonly selectedIconClass = SELECTED_ICON_CLASS;
  readonly unselectedIconClass = UNSELECTED_ICON_CLASS;

  feature = DEFAULT_REPORT_FEATURE;
  selectedReportType: ReportTypeFilter = 'all';
  manageReportSummaryData: ManageReportSummaryCountDataType;
  featureOptions: ReportFeatureOption[] = this.buildFeatureOptions();
  viewData: ReportManagementViewData[] = [];
  modalRef: BsModalRef;
  currentCriteria: SearchCriteria = this.createDefaultCriteria();
  reportId: string;
  selectedReportIds: string[] = [];
  hasBulkSelection = false;
  selectedAll = false;
  selectAllIconClass = UNSELECTED_ICON_CLASS;

  @ViewChild('confirm', { static: true }) confirm: TemplateRef<void>;
  @ViewChild('multiconfirm', { static: true }) multiconfirm: TemplateRef<void>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reportSvc: ReportManagementService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const storedFeature = this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE);

    this.selectFeature(storedFeature || DEFAULT_REPORT_FEATURE);
    this.getManageReportsCount();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearched(searchValue: string): void {
    this.currentCriteria.searchValue = searchValue;
    this.currentCriteria.pageNo = 1;
    this.getReports();
  }

  onReportTypeChanged(reportType: ReportTypeFilter): void {
    this.selectedReportType = reportType;
    this.currentCriteria.params = [{ report_type: reportType }];
    this.currentCriteria.pageNo = 1;
    this.getReports();
  }

  getManageReportsCount(): void {
    this.spinner.start('main');
    this.reportSvc.getManageReportsCount()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      ).subscribe((response) => {
        this.manageReportSummaryData = response.reports;
        this.featureOptions = this.buildFeatureOptions(response.reports);
      }, () => {
        this.notification.error(
          new Notification(
            'Error while fetching report summary!! Please try again.'
          )
        );
      }
      );
  }

  selectFeature(feature: string): void {
    this.feature = feature;
    this.updateFeatureOptionsState();
    this.storageService.put('feature', feature, StorageType.SESSIONSTORAGE);
    this.getReports();
    this.clearSelection();
  }

  getReports(): void {
    this.spinner.start('main');
    this.reportSvc.getReports(this.feature, this.currentCriteria)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      ).subscribe((reports) => {
        this.viewData = this.reportSvc.convertToViewData(reports);
        this.updateSelectionState();
      }, () => {
        this.notification.error(
          new Notification('Error while fetching report!! Please try again.')
        );
      }
      );
  }

  goToCreate(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToPreview(view: ReportManagementViewData): void {
    this.router.navigate([this.feature, view.uuid, 'preview'], {
      relativeTo: this.route,
    });
  }

  goToSchedule(): void {
    this.router.navigate(['/reports', 'manage-schedules', this.feature, 'create',]);
  }

  goToEdit(view: ReportManagementViewData): void {
    this.router.navigate([view.uuid, 'update'], { relativeTo: this.route });
  }

  toggle(view: ReportManagementViewData): void {
    this.spinner.start('main');
    this.reportSvc.toggle(view.uuid)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      ).subscribe(() => {
        this.getReports();
        this.getManageReportsCount();
        this.notification.success(
          new Notification(`Report ${view.toggleTootipMsg}d successfully`)
        );
      }, () => {
        this.notification.error(
          new Notification(
            `Could not ${view.toggleTootipMsg} Report!! Please try again`
          )
        );
      }
      );
  }

  downloadFile(view: ReportManagementViewData): void {
    this.spinner.start('main');
    this.reportSvc.download(view.uuid)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      ).subscribe((response) => {
        const downloader = document.getElementById(
          'file-downloader'
        ) as HTMLAnchorElement;

        if (!downloader) {
          this.showDownloadFailure();
          return;
        }

        downloader.setAttribute('href', `customer/reports/get_report/?file_name=${response.data}`);
        downloader.click();
        this.notification.success(
          new Notification('Report downloaded successfully.')
        );
      }, () => this.showDownloadFailure()
      );
  }

  deleteReport(view: ReportManagementViewData): void {
    this.reportId = view.uuid;
    this.modalRef = this.modalService.show(this.confirm, this.modalConfig);
  }

  confirmDelete(): void {
    this.spinner.start('main');
    this.closeModal();
    this.reportSvc.delete(this.reportId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      ).subscribe(() => {
        this.getReports();
        this.getManageReportsCount();
        this.notification.success(
          new Notification('Report Deleted successfully')
        );
      }, () => {
        this.notification.error(
          new Notification('Report could not be Deleted')
        );
      }
      );
  }

  selectAll(): void {
    if (!this.viewData.length) {
      this.clearSelection();
      return;
    }

    const shouldSelect = !this.selectedAll;
    this.viewData.forEach((view) =>
      this.setReportSelection(view, shouldSelect)
    );
    this.selectedReportIds = shouldSelect ? this.viewData.map((view) => view.uuid) : [];
    this.updateSelectionState();
  }

  select(view: ReportManagementViewData): void {
    this.setReportSelection(view, !view.isSelected);
    this.selectedReportIds = this.viewData.filter((report) => report.isSelected).map((report) => report.uuid);
    this.updateSelectionState();
  }

  multipleDelete(): void {
    this.modalRef = this.modalService.show(this.multiconfirm, this.modalConfig);
  }

  confirmMultipleDelete(): void {
    this.spinner.start('main');
    this.closeModal();
    this.reportSvc.multipleReportDelete(this.selectedReportIds)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      ).subscribe(() => {
        this.getReports();
        this.getManageReportsCount();
        this.clearSelection();
        this.notification.success(
          new Notification('Report Deleted successfully')
        );
      }, () => {
        this.clearSelection();
        this.notification.error(
          new Notification('Report could not be Deleted')
        );
      }
      );
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  trackByFeature(_index: number, featureOption: ReportFeatureOption): string {
    return featureOption.value;
  }

  trackByReport(_index: number, report: ReportManagementViewData): string {
    return report.uuid;
  }

  private createDefaultCriteria(): SearchCriteria {
    return {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.ZERO,
      params: [{ report_type: this.selectedReportType }],
    };
  }

  private buildFeatureOptions(counts?: ManageReportSummaryCountDataType): ReportFeatureOption[] {
    const options: Array<Omit<ReportFeatureOption, 'count' | 'active'>> = [
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
      { label: 'Dynamic', value: 'Dynamic', countKey: 'Dynamic' },
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
    this.viewData.forEach((view) => this.setReportSelection(view, false));
    this.selectedReportIds = [];
    this.updateSelectionState();
  }

  private setReportSelection(view: ReportManagementViewData, isSelected: boolean): void {
    view.isSelected = isSelected;
    view.selectionIconClass = isSelected ? SELECTED_ICON_CLASS : UNSELECTED_ICON_CLASS;
  }

  private updateSelectionState(): void {
    this.selectedAll = this.viewData.length > 0 && this.selectedReportIds.length === this.viewData.length;
    this.hasBulkSelection = this.selectedReportIds.length > 0;
    this.selectAllIconClass = this.selectedAll ? SELECTED_ICON_CLASS : UNSELECTED_ICON_CLASS;
    this.cdr.markForCheck();
  }

  private stopSpinnerAndMarkForCheck(): void {
    this.spinner.stop('main');
    this.cdr.markForCheck();
  }

  private showDownloadFailure(): void {
    this.notification.error(
      new Notification('Failed to download report. Try again later.')
    );
  }
}
