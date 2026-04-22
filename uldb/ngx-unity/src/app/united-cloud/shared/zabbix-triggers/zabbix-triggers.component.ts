import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { ZabbixTriggersService, ZabbixTriggerViewdata } from './zabbix-triggers.service';

@Component({
  selector: 'zabbix-triggers',
  templateUrl: './zabbix-triggers.component.html',
  styleUrls: ['./zabbix-triggers.component.scss'],
  providers: [ZabbixTriggersService]
})
export class ZabbixTriggersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;
  device: DeviceTabData;

  viewData: ZabbixTriggerViewdata[] = [];
  fieldsToFilterOn: string[] = ['name', 'severity', 'status', 'mode'];
  filteredViewData: ZabbixTriggerViewdata[] = [];
  pagedviewData: ZabbixTriggerViewdata[] = [];
  currentCriteria: SearchCriteria;
  seletedTriggerId: string;

  @ViewChild('triggerFormRef') triggerFormRef: ElementRef;
  triggerModelRef: BsModalRef;
  triggerForm: FormGroup;
  triggerErrors: any;
  triggerFormValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private triggerService: ZabbixTriggersService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private modalService: BsModalService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId ? this.deviceId : this.pcId;
    setTimeout(() => {
      this.getTriggers();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getTriggers();
  }

  getTriggers() {
    this.triggerService.getTriggers(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.triggerService.convertToViewdata(res);
      this.filterAndPage();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Triggers. Please try again later.'));
    })
  }

  createTrigger() {
    this.router.navigate(['crud'], { relativeTo: this.route });
  }

  editTrigger(view: ZabbixTriggerViewdata) {
    if (!view.canEdit) {
      return;
    }
    this.router.navigate(['crud', { triggerId: view.id }], { relativeTo: this.route });
  }

  switchTriggerStatus(view: ZabbixTriggerViewdata) {
    this.spinner.start('main');
    if (view.isDisabled) {
      this.triggerService.enableTrigger(this.device, view.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Trigger enabled successfully.'));
        this.getTriggers();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable trigger. Please try again later.'));
      });
    } else {
      this.triggerService.disableTrigger(this.device, view.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Trigger disabled successfully.'));
        this.getTriggers();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable trigger. Please try again later.'));
      });
    }
  }

  deleteTrigger(view: ZabbixTriggerViewdata) {
    if (!view.canDelete) {
      return;
    }
    this.seletedTriggerId = view.id;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.triggerService.deleteTrigger(this.device, this.seletedTriggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getTriggers();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Trigger. Please try again later.'));
    })
  }

}
