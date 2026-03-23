import { Component, OnInit } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AiObservabilityGpuServicesService, GpuModel } from './ai-observability-gpu-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'ai-observability-gpu-services',
  templateUrl: './ai-observability-gpu-services.component.html',
  styleUrls: ['./ai-observability-gpu-services.component.scss'],
  providers: [AiObservabilityGpuServicesService]
})
export class AiObservabilityGpuServicesComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  viewData: GpuModel[] = [];
  count: number;
  isPageSizeAll: boolean = true;

  constructor(
    private svc: AiObservabilityGpuServicesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getGpuList();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getGpuList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getGpuList();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getGpuList();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getGpuList();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getGpuList();
  }

  getGpuList() {
    this.svc.getGpuData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get GPU Data'));
    });
  }

  goToDetails(view: GpuModel) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.GPU_SERVICE, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'details'], { relativeTo: this.route });
  }

}
