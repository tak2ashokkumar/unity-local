import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { APP_MESH_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PublicCloudService } from 'src/app/united-cloud/public-cloud/public-cloud.service';
import { environment } from 'src/environments/environment';
import { AwsMeshViewData, AwsMeshesService } from './aws-meshes.service';

@Component({
  selector: 'aws-meshes',
  templateUrl: './aws-meshes.component.html',
  styleUrls: ['./aws-meshes.component.scss'],
  providers: [AwsMeshesService]
})
export class AwsMeshesComponent implements OnInit, OnDestroy {
  accountId: string;
  regionId: string;
  selectedRegionId: string;
  fieldsToFilterOn: string[] = ['name', 'status', 'virtualRoutersCount', 'virtualNodesCount', 'virtualServicesCount'];
  currentCriteria: SearchCriteria;

  viewData: AwsMeshViewData[] = [];
  filteredViewData: AwsMeshViewData[] = [];
  pagedviewData: AwsMeshViewData[] = [];
  poll: boolean = false;
  regions: Region[] = [];
  private ngUnsubscribe = new Subject();


  constructor(private route: ActivatedRoute,
    private publicCloudService: PublicCloudService,
    private awsMeshService: AwsMeshesService,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private notification: AppNotificationService,
    private router: Router,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('meshId');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.regionId = params.get('regionId');
      this.selectedRegionId = this.regionId;
      this.spinnerService.start('main');
      this.getAwsMesh();
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getAwsMesh());
  }

  ngOnInit() {
    this.getRegions();
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
    this.getAwsMesh();
  }

  getAwsMesh() {
    this.awsMeshService.getAwsMesh(this.accountId, this.regionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.awsMeshService.convertToViewData(res);
      this.filterAndPage();
      this.spinnerService.stop('main');
    }, (err: Error) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching app mesh list'));
    });
  }

  getRegions() {
    this.publicCloudService.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regions = res;
    });
  }

  changeRegion() {
    this.router.navigate(['../', this.selectedRegionId], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  goTo(view: AwsMeshViewData) {
    this.router.navigate([view.name, 'vservices'], { relativeTo: this.route });
  }

  goToGraph(view: AwsMeshViewData) {
    this.router.navigate([view.name, 'tree'], { relativeTo: this.route });
  }

  createTicket(data: AwsMeshViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('App Mesh', data.name), metadata: APP_MESH_TICKET_METADATA('App Mesh', data.name, data.status, data.virtualNodesCount, data.virtualRoutersCount, data.virtualServicesCount)
    });
  }

}