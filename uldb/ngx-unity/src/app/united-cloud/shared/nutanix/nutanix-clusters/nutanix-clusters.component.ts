import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { NutanixClusterViewData, NutanixClustersService } from './nutanix-clusters.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CLUSTER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';

@Component({
  selector: 'nutanix-clusters',
  templateUrl: './nutanix-clusters.component.html',
  styleUrls: ['./nutanix-clusters.component.scss'],
  providers: [NutanixClustersService]
})
export class NutanixClustersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: NutanixClusterViewData[] = [];
  constructor(private svc: NutanixClustersService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getClusterData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getClusterData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getClusterData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getClusterData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getClusterData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getClusterData();
  }

  getClusterData(){
    this.svc.getClusters(this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.converToViewData(res.results);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
    });
  }
  
  getPercentage(value: string): number{
    const freeSpace = value?.replace('%','')?.trim();
    const val = freeSpace ? (100 - Number(freeSpace))  : 0;
    return val;
  }

  getProgressClass(value: string): string {
    const val = this.getPercentage(value);
    return val < 65 ? 'bg-success' : val >= 65 && val < 85 ? 'bg-warning' : 'bg-danger';
  }

  goToDetails(view: NutanixClusterViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.CLUSTER}, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'details'], { relativeTo: this.route });
  }

  createTicket(data: NutanixClusterViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.CLUSTER, data.name), 
      metadata: CLUSTER_TICKET_METADATA(DeviceMapping.CLUSTER, data.name)
    }, DeviceMapping.CLUSTER);
  }

}
