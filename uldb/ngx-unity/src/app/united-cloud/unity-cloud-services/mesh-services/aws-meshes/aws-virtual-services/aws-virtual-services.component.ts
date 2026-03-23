import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { APP_MESH_VIRTUAL_SERVICE_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AwsBackendVirtualNodeViewdata, AwsVirtualServicesService, AwsVirtualserviceViewData } from './aws-virtual-services.service';

@Component({
  selector: 'aws-virtual-services',
  templateUrl: './aws-virtual-services.component.html',
  styleUrls: ['./aws-virtual-services.component.scss'],
  providers: [AwsVirtualServicesService]
})
export class AwsVirtualServicesComponent implements OnInit, OnDestroy {
  accountId: string;
  regionId: string;
  meshName: string;
  fieldsToFilterOn: string[] = ['virtualRouterName', 'virtualServiceName', 'virtualRouterStatus', 'meshName'];
  currentCriteria: SearchCriteria;

  viewData: AwsVirtualserviceViewData[] = [];
  filteredViewData: AwsVirtualserviceViewData[] = [];
  pagedviewData: AwsVirtualserviceViewData[] = [];
  poll: boolean = false;
  @ViewChild('nodeinfo') nodeinfo: ElementRef;
  modalRef: BsModalRef;
  info: AwsBackendVirtualNodeViewdata;

  regions: Region[] = [];
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private virtualService: AwsVirtualServicesService,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private router: Router,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('meshId');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.regionId = params.get('regionId');
      this.meshName = params.get('meshName');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getVirtualServices());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getVirtualServices();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
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

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVirtualServices();
  }

  getVirtualServices() {
    this.virtualService.getVirtualServices(this.accountId, this.regionId, this.meshName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.virtualService.convertToViewData(res);
      this.filterAndPage();
      this.spinnerService.stop('main');
    }, (err: Error) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching virtual services'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  showInfo(nodeName: string) {
    this.spinnerService.start('main');
    this.virtualService.getBackendNodeInfo(this.accountId, this.regionId, this.meshName, nodeName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.info = this.virtualService.convertToNodeViewData(res);
      this.spinnerService.stop('main');
      this.modalRef = this.modalService.show(this.nodeinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, (err: Error) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching virtual node details'));
    });
  }

  goTo(view: AwsVirtualserviceViewData) {
    this.router.navigate([view.virtualRouterName, 'vroutes'], { relativeTo: this.route });
  }

  createTicket(view: AwsVirtualserviceViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('AWS Virtual Services', view.virtualServiceName), metadata: APP_MESH_VIRTUAL_SERVICE_TICKET_METADATA('AWS Virtual Services', view.virtualServiceName, view.virtualRouterStatus, view.virtualRouterName, view.meshName)
    });
  }
}
