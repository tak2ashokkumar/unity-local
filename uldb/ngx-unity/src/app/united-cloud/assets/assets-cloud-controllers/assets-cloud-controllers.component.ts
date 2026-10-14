import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CLOUD_CONTROLLER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { RemoteAccessService } from 'src/app/shared/remote-access/remote-access.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { CloudController } from '../../shared/entities/cloud-controller.type';
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
  remoteWebLaunchingUuid: string = '';
  constructor(
    private cloudControllerService: CloudControllersService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private appService: AppLevelService,
    private remoteAccess: RemoteAccessService,
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
    if (this.isVCenterPlatform(view.platformType)) {
      this.openVCenterWebConsole(view);
      return;
    }
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog('private_cloud', view.uuid);
    window.open(view.newTabWebAccessUrl);
  }

  private openVCenterWebConsole(view: CloudControllerViewData): void {
    if (!view?.isNewTabEnabled || this.remoteWebLaunchingUuid === view.uuid) {
      return;
    }
    const resourceId = view.remoteWebAccess?.resource_id || view.uuid;
    if (!resourceId) {
      this.notification.error(new Notification('Unable to open vCenter web console. Resource identifier is missing.'));
      return;
    }
    const viewerWindow = this.openIsolatedViewerTab();
    if (!viewerWindow) {
      this.notification.error(new Notification('Popup blocked. Allow popups for UnityOne and try opening the web console again.'));
      return;
    }

    this.remoteWebLaunchingUuid = view.uuid;
    const resourceType = view.remoteWebAccess?.resource_type || 'vcenter';
    this.remoteAccess.createWebLaunch(resourceId, resourceType)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.remoteWebLaunchingUuid = '')
      )
      .subscribe(launch => {
        if (!launch.viewerUrl) {
          viewerWindow.close();
          this.notification.error(new Notification('Remote web viewer URL was not returned by UnityOne.'));
          return;
        }
        this.appService.updateActivityLog('vcenter', view.uuid);
        viewerWindow.location.replace(launch.viewerUrl);
      }, err => {
        viewerWindow.close();
        this.notification.error(new Notification(this.remoteWebErrorMessage(err)));
      });
  }

  private openIsolatedViewerTab(): Window | null {
    const viewerWindow = window.open('about:blank', '_blank');
    if (viewerWindow) {
      viewerWindow.opener = null;
      try {
        viewerWindow.document.title = 'Opening UnityOne Remote Web Viewer';
        viewerWindow.document.body.innerHTML = '<div style="font-family:Arial,sans-serif;padding:24px;">Opening UnityOne Remote Web Viewer...</div>';
      } catch (e) { }
    }
    return viewerWindow;
  }

  private remoteWebErrorMessage(err: any): string {
    return err?.error?.error || err?.error?.detail || err?.message || 'Unable to create remote web session. Please try again or contact support.';
  }

  private isVCenterPlatform(platformType: PlatFormMapping): boolean {
    return platformType === PlatFormMapping.VMWARE || platformType === PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER;
  }

  createTicket(data: CloudControllerViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.CLOUD_CONTROLLER, data.name), metadata: CLOUD_CONTROLLER_TICKET_METADATA(data.name, data.platformType)
    });
  }
}
