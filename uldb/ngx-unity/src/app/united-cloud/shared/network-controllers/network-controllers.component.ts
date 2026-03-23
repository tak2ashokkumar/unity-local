import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NetworkControllersService, NetworkControllerViewData, ServerSideNetworkControllerTypeMapping, statusList } from './network-controllers.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { from, Subject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppLevelService } from 'src/app/app-level.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppBreadcrumbService } from 'src/app/app-breadcrumb/app-breadcrumb.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { MERAKI_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT, VIPTELA_ACCOUNT_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'network-controllers',
  templateUrl: './network-controllers.component.html',
  styleUrls: ['./network-controllers.component.scss'],
  providers: [NetworkControllersService]
})
export class NetworkControllersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  count: number;
  viewData: NetworkControllerViewData[] = [];
  view: NetworkControllerViewData;

  statusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  statusTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Status',
  };

  statusList: LabelValueType[] = statusList;

  @ViewChild('tagsFormRef') tagsFormRef: ElementRef;
  tagsFormModelRef: BsModalRef;
  tagsForm: FormGroup;
  tagsFormErrors: any;
  tagsFormValidationMessages: any;
  nonFieldErr: string = '';
  tagsAutocompleteItems: string[] = [];
  inputView: NetworkControllerViewData;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  breadcrumbs: string[] = [];
  breadcrumbsPath: string = '';
  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: NetworkControllersService,
    private spinner: AppSpinnerService,
    private appService: AppLevelService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    public breadcrumbSvc: AppBreadcrumbService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'status': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.breadcrumbSvc.breadcrumbs.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.breadcrumbs = (<{ label: string, url: string }[]>param).map(p => p.label);
      this.breadcrumbsPath = this.svc.formatBreadCrumb(this.breadcrumbs);
    });
    this.getNetworkControllers();
    this.getTags();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getNetworkControllers();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getNetworkControllers();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getNetworkControllers();
  }


  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getNetworkControllers();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getNetworkControllers();
  }

  getNetworkControllers() {
    this.svc.getNetworkControllers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.getDeviceData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.svc.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  viewDeviceDetials(view: NetworkControllerViewData) {
    if (view.accountType == 'viptela') {
      this.storageService.put('viptela', { name: view.name, deviceType: this.svc.getDeviceType(view.accountType) }, StorageType.SESSIONSTORAGE);
      this.router.navigate([`${view.controllerId}/viptela-components`], { relativeTo: this.route });
    } else {
      this.storageService.put('meraki', { name: view.name, deviceType: this.svc.getDeviceType(view.accountType) }, StorageType.SESSIONSTORAGE);
      this.router.navigate([`cisco-meraki/${view.controllerId}/organizations`], { relativeTo: this.route });
    }
  }

  webAccessNewTab(view: NetworkControllerViewData) {
    if (!view.proxyUrl) {
      return;
    }
    window.open(view.proxyUrl);
  }

  goToEdit(view: NetworkControllerViewData) {
    if (view.accountType == ServerSideNetworkControllerTypeMapping.VIPTELA) {
      return this.router.navigate([view.controllerId, 'viptela-edit'], { relativeTo: this.route });
    } else {
      return this.router.navigate([view.controllerId, 'meraki-edit'], { relativeTo: this.route });
    }
  }

  goToStats(view: NetworkControllerViewData) {
    this.storageService.put('device', {
      name: view.name, deviceType: this.svc.getDeviceType(view.accountType), configured: view.monitoring.configured
    }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.controllerId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.controllerId, 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  syncNow(view: NetworkControllerViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.controllerId, view.accountType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  updateTags(view: NetworkControllerViewData) {
    this.inputView = view;
    this.tagsForm = this.svc.createTagsForm(view.tags);
    this.tagsFormErrors = this.svc.resetTagsFormErrors();
    this.tagsFormValidationMessages = this.svc.tagsFormValidationMessages;
    this.tagsFormModelRef = this.modalService.show(this.tagsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  submitTags() {
    this.spinner.start('main');
    this.svc.updateTags(<{ tags: string[] }>this.tagsForm.getRawValue(), this.inputView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tagsFormModelRef.hide();
      this.getNetworkControllers();
      this.spinner.stop('main');
      this.notification.success(new Notification('Tags updated successfully.'));
    }, (err: HttpErrorResponse) => {
      this.tagsFormModelRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to update tags. Please try again later.'));
    });
  }

  delete(view: NetworkControllerViewData) {
    this.view = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.svc.delete(this.view).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.getNetworkControllers();
      this.notification.success(new Notification('Account deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Account could not be deleted!!'));
    });
  }

  createTicket(view: NetworkControllerViewData) {
    const metaData: string = view.accountType == 'Viptela' ? VIPTELA_ACCOUNT_TICKET_METADATA(view.name, view.accountType, view.accountUrl, this.breadcrumbsPath) : MERAKI_ACCOUNT_TICKET_METADATA(view.name, view.accountType, view.accountUrl, this.breadcrumbsPath)
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.name, view.name), metadata: metaData
    });
  }
}
