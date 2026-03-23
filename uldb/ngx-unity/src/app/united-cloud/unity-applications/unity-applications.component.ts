import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ApplicationViewData, UnityApplicationsService } from './unity-applications.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'unity-applications',
  templateUrl: './unity-applications.component.html',
  styleUrls: ['./unity-applications.component.scss'],
  providers: [UnityApplicationsService]
})
export class UnityApplicationsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number;
  viewData: ApplicationViewData[];
  constructor(private svc: UnityApplicationsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private notification: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getApplicationList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getApplicationList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getApplicationList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getApplicationList();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getApplicationList();
  }

  getApplicationList() {
    this.svc.getApplicationList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get application list'));
    });
  }

  goToDetails(view: ApplicationViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.APP_DEVICE, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.id, 'details'], { relativeTo: this.route });
  }

  loadComponents(view: ApplicationViewData) {
    this.storageService.put('app-data', { appId: view.id, customerId: view.customerId }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.id, 'services'], { relativeTo: this.route });
  }

}
