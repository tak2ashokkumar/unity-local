import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { RemoteAccessService } from 'src/app/shared/remote-access/remote-access.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FirewallManagementCenterAccountViewData, UsioFirewallManagementCenterService } from './usio-firewall-management-center.service';

@Component({
  selector: 'usio-firewall-management-center',
  templateUrl: './usio-firewall-management-center.component.html',
  styleUrls: ['./usio-firewall-management-center.component.scss'],
  providers: [UsioFirewallManagementCenterService]
})
export class UsioFirewallManagementCenterComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: FirewallManagementCenterAccountViewData[] = [];
  selectedView: FirewallManagementCenterAccountViewData | null = null;
  remoteWebLaunching: boolean = false;

  @ViewChild('deleteConfirm') deleteConfirm!: ElementRef;
  deleteModalRef: BsModalRef | null = null;

  constructor(private svc: UsioFirewallManagementCenterService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private remoteAccess: RemoteAccessService,
    private modalSvc: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getAccounts();
  }

  ngOnDestroy(): void {
    this.deleteModalRef?.hide();
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string): void {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  pageChange(pageNo: number): void {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getAccounts();
    }
  }

  pageSizeChange(pageSize: number): void {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  refreshData(pageNo: number): void {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  getAccounts(): void {
    this.svc.getAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Firewall Management Center accounts. Please try again.'));
    });
  }

  remoteWebAccessNewTab(view: FirewallManagementCenterAccountViewData): void {
    if (!view?.showRemoteWebAccessButton || this.remoteWebLaunching) {
      return;
    }
    const resourceId = view.remoteWebAccess?.resource_id || view.accountId;
    if (!resourceId) {
      this.notification.error(new Notification('Unable to open Firewall Management Center web console. Resource identifier is missing.'));
      return;
    }
    const viewerWindow = this.openIsolatedViewerTab();
    if (!viewerWindow) {
      this.notification.error(new Notification('Popup blocked. Allow popups for UnityOne and try opening the web console again.'));
      return;
    }

    this.remoteWebLaunching = true;
    const resourceType = view.remoteWebAccess?.resource_type || 'fmc';
    this.remoteAccess.createWebLaunch(resourceId, resourceType)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.remoteWebLaunching = false)
      )
      .subscribe(launch => {
        if (!launch.viewerUrl) {
          viewerWindow.close();
          this.notification.error(new Notification('Remote web viewer URL was not returned by UnityOne.'));
          return;
        }
        this.appService.updateActivityLog('firewall_management_center', view.accountId);
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

  goToAddAccount(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditAccount(view: FirewallManagementCenterAccountViewData): void {
    this.selectedView = view;
    this.router.navigate([view.accountId, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(view: FirewallManagementCenterAccountViewData): void {
    this.selectedView = view;
    this.deleteModalRef = this.modalSvc.show(this.deleteConfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete(): void {
    this.spinner.start('main');
    if (!this.selectedView) {
      this.spinner.stop('main');
      return;
    }
    this.svc.deleteAccount(this.selectedView.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deleteModalRef?.hide();
      this.getAccounts();
    }, (err: HttpErrorResponse) => {
      this.deleteModalRef?.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Firewall Management Center account. Please try again.'));
    });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
