import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ApplicationOnboardingService, ApplicationViewData } from './application-onboarding.service';
import { OnboardedApplication } from './application-onboarding.type';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again!!';

@Component({
  selector: 'application-onboarding',
  templateUrl: './application-onboarding.component.html',
  styleUrls: ['./application-onboarding.component.scss'],
  providers: [ApplicationOnboardingService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationOnboardingComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  viewData: ApplicationViewData[] = [];
  count: number = 0;
  currentCriteria: SearchCriteria;

  selectedApplicationId: number;

  @ViewChild('confirmDelete') confirmDelete: TemplateRef<void>;
  confirmDeleteModalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: ApplicationOnboardingService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService,
    private cdr: ChangeDetectorRef) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerSvc.start('main');
    this.getApplications();
  }

  ngOnDestroy(): void {
    this.confirmDeleteModalRef?.hide();
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getApplications();
  }

  pageChange(pageNo: number): void {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinnerSvc.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getApplications();
    }
  }

  pageSizeChange(pageSize: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getApplications();
  }

  refreshData(pageNo: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getApplications();
  }

  getApplications(): void {
    this.svc.getApplications(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe((data: PaginatedResult<OnboardedApplication>) => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewData(data.results);
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  onboard(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(application: ApplicationViewData): void {
    this.router.navigate([application.id, 'edit'], { relativeTo: this.route });
  }

  viewHistory(application: ApplicationViewData): void {
    // History drill-down is optional and depends on the backend contract.
  }

  confirmDeleteApplication(application: ApplicationViewData): void {
    this.selectedApplicationId = application.id;
    this.confirmDeleteModalRef = this.modalSvc.show(this.confirmDelete, CONFIRM_MODAL_CONFIG);
  }

  deleteApplication(): void {
    this.confirmDeleteModalRef.hide();
    this.spinnerSvc.start('main');
    this.svc.delete(this.selectedApplicationId)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Application deleted successfully'));
        this.getApplications();
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  goBack(): void {
    this.router.navigate(['../connectivity'], { relativeTo: this.route });
  }

  trackByApplication(_index: number, application: ApplicationViewData): number {
    return application.id;
  }

  private stopSpinnerAndMarkForCheck(): void {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
