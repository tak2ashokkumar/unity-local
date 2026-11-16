import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { VergeioResource, VergeioResourcesService } from './vergeio-resources.service';

@Component({
  selector: 'vergeio-resources',
  templateUrl: './vergeio-resources.component.html',
  styleUrls: ['./vergeio-resources.component.scss'],
  providers: [VergeioResourcesService]
})
export class VergeioResourcesComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  private pcId: string;
  resourceType: string;
  title: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: VergeioResource[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: VergeioResourcesService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.pcId = this.route.parent ? this.route.parent.snapshot.paramMap.get('pcId') : null;
    this.resourceType = this.route.snapshot.data.resourceType;
    this.title = this.route.snapshot.data.title;
    this.getResources();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getResources();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getResources();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getResources();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getResources();
  }

  getResources() {
    if (!this.pcId || !this.resourceType) {
      return;
    }
    this.viewData = [];
    this.spinnerSvc.start('main');
    this.svc.getResources(this.resourceType, this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe(res => {
        this.count = res.count;
        this.viewData = res.results ? res.results : [];
      }, (err: HttpErrorResponse) => {
        this.viewData = [];
        this.notificationSvc.error(new Notification(`Failed to load VergeIO ${this.title}.`));
      });
  }

  // Convert a byte count to a human-readable size for the datastore columns.
  formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    i = Math.min(i, units.length - 1);
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  trackByUuid(index: number, view: VergeioResource): string {
    return view.uuid;
  }
}
