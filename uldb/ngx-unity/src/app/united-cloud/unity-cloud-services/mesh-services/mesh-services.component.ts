import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { MESH_SERVICE_MANAGER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { MeshServiceManagerService, MeshServiceViewData } from './mesh-service-manager.service';
import { MeshServicesCrudService } from './mesh-services-crud/mesh-services-crud.service';
@Component({
  selector: 'mesh-services',
  templateUrl: './mesh-services.component.html',
  styleUrls: ['./mesh-services.component.scss'],
  providers: [MeshServiceManagerService]
})
export class MeshServicesComponent implements OnInit, OnDestroy {
  fieldsToFilterOn: string[] = ['name', 'displayType'];
  currentCriteria: SearchCriteria;

  viewData: MeshServiceViewData[] = [];
  filteredViewData: MeshServiceViewData[] = [];
  pagedviewData: MeshServiceViewData[] = [];
  private ngUnsubscribe = new Subject();
  poll: boolean = false;

  @ViewChild('addEditController') create: ElementRef;
  createModalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private managerService: MeshServiceManagerService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private crudService: MeshServicesCrudService,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getServiceManagers());
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getServiceManagers();
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

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getServiceManagers();
  }

  onCrud(uuid: string) {
    this.spinner.start('main');
    this.getServiceManagers();
  }

  getServiceManagers() {
    this.managerService.getMeshServices().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.managerService.convertToViewData(res);
      this.filterAndPage();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Problem in getting mesh service. Please tryagain later.'));
      this.spinner.stop('main');
    });
  }

  addService() {
    this.crudService.addOrEdit(null, null);
  }

  editService(data: MeshServiceViewData) {
    this.crudService.addOrEdit(data.serviceId, data.serviceType);
  }

  deleteService(data: MeshServiceViewData) {
    this.crudService.deleteMeshService(data.serviceId, data.serviceType);
  }

  goTo(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
  }

  changePassword(data: MeshServiceViewData) {
    this.crudService.changePassword(data.serviceId, data.serviceType);
  }

  createTicket(data: MeshServiceViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Mesh Service Manager', data.name), metadata: MESH_SERVICE_MANAGER_TICKET_METADATA('Mesh Service Manager', data.name, data.displayType)
    });
  }
}