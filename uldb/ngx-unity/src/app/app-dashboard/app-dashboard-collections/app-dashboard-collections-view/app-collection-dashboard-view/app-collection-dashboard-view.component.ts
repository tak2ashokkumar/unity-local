import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PersonaDashboard } from '../../../app-persona-dashboards/app-persona-dashboards.type';
import { CollectionDetailResponse, DashboardItem } from '../../app-dashboard-collections-crud/app-dashboard-collections-crud.type';
import { AppDashboardCollectionsViewService } from '../app-dashboard-collections-view.service';

@Component({
  selector: 'app-collection-dashboard-view',
  templateUrl: './app-collection-dashboard-view.component.html',
  styleUrls: ['./app-collection-dashboard-view.component.scss'],
  providers: [AppDashboardCollectionsViewService]
})
export class AppCollectionDashboardViewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  collectionId: string;
  dashboardId: string;
  collection: CollectionDetailResponse;
  dashboards: DashboardItem[] = [];
  selectedDashboard: DashboardItem | null = null;

  constructor(
    private svc: AppDashboardCollectionsViewService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.collectionId = params.get('collectionId');
      this.dashboardId = params.get('dashboardId');
      this.loadDashboard();
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get activePersonalDashboard(): PersonaDashboard {
    return this.selectedDashboard as any;
  }

  get defaultDashboardRoute(): string {
    return this.selectedDashboard?.defaultDashboardRoute || '';
  }

  loadDashboard() {
    if (!this.collectionId || !this.dashboardId) {
      return;
    }

    this.spinner.start('main');
    forkJoin({
      collection: this.svc.getCollection(this.collectionId),
      defaults: this.svc.getDefaultDashboards().pipe(catchError(() => of([]))),
      myDash: this.svc.getMyDashboards().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ collection, defaults, myDash }) => {
      if (!collection) {
        this.spinner.stop('main');
        this.notification.error(new Notification('Collection details not found.'));
        this.goBack();
        return;
      }

      this.collection = collection;
      this.dashboards = this.svc.getSelectedDashboards(collection, [...defaults, ...myDash]);
      this.selectedDashboard = this.dashboards.find(dashboard => dashboard.uuid === this.dashboardId) || null;
      this.spinner.stop('main');

      if (!this.selectedDashboard) {
        this.notification.error(new Notification('Dashboard is not part of this Collection.'));
        this.goBack();
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Collection dashboard. Try again later.'));
    });
  }

  goBack() {
    this.router.navigate(['/app-dashboard', 'collections', this.collectionId]);
  }
}
