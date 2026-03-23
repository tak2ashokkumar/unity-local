import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CLOUD_CONTROLLER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { CloudControllerViewData, CloudControllersService } from './assets-cloud-controllers.service';

@Component({
  selector: 'assets-cloud-controllers',
  templateUrl: './assets-cloud-controllers.component.html',
  styleUrls: ['./assets-cloud-controllers.component.scss'],
  providers: [CloudControllersService],
})
export class AssetsCloudControllersComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  viewData: CloudControllerViewData[] = [];
  constructor(
    private cloudControllerService: CloudControllersService,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private appService: AppLevelService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getCloudControllers();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCloudControllers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCloudControllers();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCloudControllers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCloudControllers();
  }

  getCloudControllers() {
    this.cloudControllerService.getCloudControllers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<CloudController>) => {
      this.count = data.count;
      this.viewData = this.cloudControllerService.convertToViewData(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  webAccessSameTab(view: CloudControllerViewData) {
    if (!view.sameTabWebAccessUrl) {
      return;
    }
    this.storageService.put('url', view.sameTabWebAccessUrl, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'webaccess'], { relativeTo: this.route });
  }

  webAccessNewTab(view: CloudControllerViewData) {
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog('private_cloud', view.uuid);
    window.open(view.newTabWebAccessUrl);
  }

  createTicket(data: CloudControllerViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.CLOUD_CONTROLLER, data.name), metadata: CLOUD_CONTROLLER_TICKET_METADATA(data.name, data.platformType)
    });
  }
}


