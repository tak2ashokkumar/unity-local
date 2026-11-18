import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping, FaIconMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PcCrudService } from 'src/app/app-shared-crud/pc-crud/pc-crud.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { UsageData, UsageStatsPercent } from '../entities/usage-data.type';
import { VergeioAccountSummary, VergeioComponentSummary, VergeioIconViewData, VergeioService, VergeioUsageViewData } from './vergeio.service';

@Component({
  selector: 'vergeio',
  templateUrl: './vergeio.component.html',
  styleUrls: ['./vergeio.component.scss'],
  providers: [VergeioService]
})
export class VergeioComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  pcId: string;
  activeCloud: PrivateCLoudFast;

  account: VergeioAccountSummary;
  view: VergeioIconViewData;
  summary: VergeioComponentSummary;
  iconMapping = FaIconMapping;

  showStastics: boolean = true;
  usageData: VergeioUsageViewData = null;
  statsPercent: UsageStatsPercent = { vcpuPercent: 0, ramPercent: 0, storageDiskPercent: 0 };

  constructor(private svc: VergeioService,
    private route: ActivatedRoute,
    private router: Router,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private crudSvc: PcCrudService,
    private storageSvc: StorageService,
    private ticketSvc: SharedCreateTicketService) {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.route.parent.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.activeCloud = data.tabItems ? data.tabItems.find((ti: PrivateCLoudFast) => ti.uuid == this.pcId) : null;
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getData();
  }

  getData() {
    this.spinnerService.start('main');
    this.svc.getAccount(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.account = res;
      this.view = this.svc.getActionIconViewData(res);
    }, () => { });
    this.svc.getComponentSummary(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summary = res;
      this.spinnerService.stop('main');
    }, () => {
      this.spinnerService.stop('main');
    });
    this.getUsageData();
  }

  getUsageData() {
    this.svc.getUsageData(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: UsageData) => {
      this.usageData = this.svc.convertToUsageViewData(data);
      this.statsPercent = this.utilService.getStatsPercent(data);
    }, (err: HttpErrorResponse) => {
      this.showStastics = false;
    });
  }

  get totalResources(): number {
    if (!this.summary) {
      return 0;
    }
    return (this.summary.vm || 0) + (this.summary.cluster || 0) + (this.summary.host || 0)
      + (this.summary.datastore || 0) + (this.summary.network || 0);
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  goTo(url: string) {
    this.router.navigate(['../', url], { relativeTo: this.route });
  }

  editPrivateCloud() {
    this.router.navigate(['setup/integration/vergeio', this.pcId, 'edit']);
  }

  deletePrivateCloud() {
    this.crudSvc.delete(this.pcId, 'vergeio');
  }

  goToStats(view: VergeioIconViewData) {
    this.storageSvc.put('device', { name: view.name, deviceType: DeviceMapping.VERGEIO_ACCOUNT, configured: view.monitoring?.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring?.configured && view.monitoring?.enabled) {
      this.router.navigate(['vergeio', 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate(['vergeio', 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  createTicket() {
    this.ticketSvc.createTicket({
      subject: TICKET_SUBJECT(PlatFormMapping.VERGEIO, this.account?.name),
      metadata: SUMMARY_TICKET_METADATA(PlatFormMapping.VERGEIO, this.account?.name)
    });
  }
}
