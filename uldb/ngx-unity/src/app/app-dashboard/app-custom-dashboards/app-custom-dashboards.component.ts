import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppCustomDashboardsService, CustomDashboardViewData } from './app-custom-dashboards.service';
import { CustomDashboard } from './app-custom-dashboards.type';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again!!';

@Component({
  selector: 'app-custom-dashboards',
  templateUrl: './app-custom-dashboards.component.html',
  styleUrls: ['./app-custom-dashboards.component.scss'],
  providers: [AppCustomDashboardsService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCustomDashboardsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  currentCriteria: SearchCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

  count: number = 0;
  viewData: CustomDashboardViewData[] = [];

  selectedView: CustomDashboardViewData;

  @ViewChild('confirmStatus') confirmStatus: TemplateRef<void>;
  confirmStatusModalRef: BsModalRef;

  @ViewChild('confirmDelete') confirmDelete: TemplateRef<void>;
  confirmDeleteModalRef: BsModalRef;

  constructor(private svc: AppCustomDashboardsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.spinnerSvc.start('main');
    this.getDashboards();
  }

  ngOnDestroy(): void {
    this.confirmStatusModalRef?.hide();
    this.confirmDeleteModalRef?.hide();
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDashboards();
  }

  pageChange(pageNo: number): void {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinnerSvc.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getDashboards();
    }
  }

  pageSizeChange(pageSize: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDashboards();
  }

  refreshData(pageNo: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDashboards();
  }

  getDashboards(): void {
    this.svc.getDashboards(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe((data: PaginatedResult<CustomDashboard>) => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewData(data.results);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to fetch dashboards.'));
      });
  }

  goToCreate(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToView(view: CustomDashboardViewData): void {
    this.router.navigate([view.uuid, 'view'], { relativeTo: this.route });
  }

  goToEdit(view: CustomDashboardViewData): void {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  confirmStatusChange(view: CustomDashboardViewData, publish: boolean): void {
    if (view.isPublished === publish) {
      return;
    }
    this.selectedView = view;
    this.confirmStatusModalRef = this.modalSvc.show(this.confirmStatus, CONFIRM_MODAL_CONFIG);
  }

  changeStatus(): void {
    this.confirmStatusModalRef.hide();
    const publish: boolean = !this.selectedView.isPublished;
    const request$: Observable<CustomDashboard> = publish
      ? this.svc.publishDashboard(this.selectedView.uuid, this.selectedView.version)
      : this.svc.moveToDraft(this.selectedView.uuid, this.selectedView.version);
    this.spinnerSvc.start('main');
    request$
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe((res: CustomDashboard) => {
        const updated: CustomDashboardViewData = this.svc.convert(res);
        this.viewData = this.viewData.map(v => v.uuid === updated.uuid ? updated : v);
        if (updated.isPublished === publish) {
          this.notificationSvc.success(new Notification(`Dashboard ${publish ? 'published' : 'moved to draft'} successfully.`));
        } else {
          this.notificationSvc.error(new Notification('Status was not changed by the server.'));
        }
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification(this.svc.getStatusChangeErrorMessage(err, publish)));
      });
  }

  confirmDeleteDashboard(view: CustomDashboardViewData): void {
    this.selectedView = view;
    this.confirmDeleteModalRef = this.modalSvc.show(this.confirmDelete, CONFIRM_MODAL_CONFIG);
  }

  deleteDashboard(): void {
    this.confirmDeleteModalRef.hide();
    this.spinnerSvc.start('main');
    this.svc.deleteDashboard(this.selectedView.uuid, this.selectedView.version)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Dashboard deleted successfully.'));
        this.getDashboards();
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  trackByDashboard(_index: number, view: CustomDashboardViewData): string {
    return view.uuid;
  }

  private stopSpinnerAndMarkForCheck(): void {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
