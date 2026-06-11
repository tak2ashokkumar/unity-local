import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TabData } from 'src/app/shared/tabdata';
import { MtpTenantInfoViewData, MtpTenantMgmtOverviewService } from './mtp-tenant-mgmt-overview.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { MtpTenantsMgmtService } from '../mtp-tenants-mgmt.service';

@Component({
  selector: 'mtp-tenant-mgmt-overview',
  templateUrl: './mtp-tenant-mgmt-overview.component.html',
  styleUrls: ['./mtp-tenant-mgmt-overview.component.scss'],
  providers: [MtpTenantMgmtOverviewService]
})
export class MtpTenantMgmtOverviewComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabData;
  private ngUnsubscribe = new Subject();
  tenantInfo: MtpTenantInfoViewData = new MtpTenantInfoViewData();
  tennantToggleInfo: MtpTenantInfoViewData = new MtpTenantInfoViewData();

  @ViewChild('deleteConfirmTenant') deleteConfirmTenant: ElementRef;
  deleteTenantModalRef: BsModalRef;

  @ViewChild('toggleConfirmTenant') toggleConfirmTenant: ElementRef;
  toggleTenantModalRef: BsModalRef;
  tenantId: string;
  groupTenantId: string;
  tenantName: string;
  tenantUuid: string;
  toggleMessage: string;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private MtpTenantmgmtOverviewSvc: MtpTenantMgmtOverviewService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private mtpTenantMgmtSvc: MtpTenantsMgmtService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.groupTenantId = params.get('groupId');
      this.tenantId = params.get('tenantId');
      this.getTenantInfo();
    });
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    // this.getTenantInfo();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  isActive(tab: TabData) {
    if (this.router.url.match(tab.url)) {
      return 'active-tab text-primary';
    }
  }

  goTo(tab: TabData) {
    this.router.navigate([tab.url], { relativeTo: this.route });
  }

  toggleTenant(tenant: MtpTenantInfoViewData) {
    // this.tenantName = tenant.name;
    // this.toggleMessage = tenant.toggleTootipMsg;
    this.tennantToggleInfo = tenant;
    this.toggleTenantModalRef = this.modalService.show(this.toggleConfirmTenant, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmToggleTennat() {
    this.spinner.start('main');
    this.toggleTenantModalRef.hide();
    this.mtpTenantMgmtSvc.tenantToggleAnnounce(this.tenantId);
    this.MtpTenantmgmtOverviewSvc.toggleTennat(this.tennantToggleInfo).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notificationService.success(new Notification(`Tenant ${this.tennantToggleInfo.toggleTootipMsg} successfully`));
      this.spinner.stop('main');
      this.getTenantInfo();
    }, (err) => {
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  goToEditTenant(tenant: MtpTenantInfoViewData) {
    this.router.navigate([this.groupTenantId, tenant.uuid, 'update',], { relativeTo: this.route.parent.parent })
  }

  getTenantInfo() {
    this.spinner.start('main');
    this.MtpTenantmgmtOverviewSvc.getTenantInfo(this.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenantInfo = this.MtpTenantmgmtOverviewSvc.convertToViewdata(res);
      this.spinner.stop('main');
      this.mtpTenantMgmtSvc.tenantDetailsLoadedAnnounce();
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while fetching Tenant Info. Please try again'));
    });
  }

  deleteTenant(tenant: MtpTenantInfoViewData) {
    this.tenantName = tenant.name;
    this.tenantUuid = tenant.uuid;
    this.deleteTenantModalRef = this.modalService.show(this.deleteConfirmTenant, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmDelete() {
    this.spinner.start('main');
    this.deleteTenantModalRef.hide();
    this.MtpTenantmgmtOverviewSvc.deleteTenant(this.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // this.getTenantInfo();
      this.mtpTenantMgmtSvc.deleteAnnounce();
      this.router.navigate(['../../'], { relativeTo: this.route });
      this.notificationService.success(new Notification(`Tenant ${this.tenantName} deleted successfully`));
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while deleting tenant. Please try again'));
    });
  };

}

const tabData: TabData[] = [
  {
    name: 'Details of Tenant',
    url: 'details'
  },
  {
    name: 'Activity Logs',
    url: 'activitylog'
  }
];