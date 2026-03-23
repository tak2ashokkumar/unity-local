import { Component, OnDestroy, OnInit } from '@angular/core';
import { NutanixStoragePoolViewData, NutanixStoragePoolsService } from './nutanix-storage-pools.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { STORAGE_POOLS_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';

@Component({
  selector: 'nutanix-storage-pools',
  templateUrl: './nutanix-storage-pools.component.html',
  styleUrls: ['./nutanix-storage-pools.component.scss'],
  providers:[NutanixStoragePoolsService]
})
export class NutanixStoragePoolsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: NutanixStoragePoolViewData[] = [];
  constructor(private svc: NutanixStoragePoolsService,
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
    this.getStoragePools();
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
    this.getStoragePools();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getStoragePools();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getStoragePools();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getStoragePools();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getStoragePools();
  }

  getStoragePools(){
    this.svc.getStoragePools(this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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

  goToDetails(view: NutanixStoragePoolViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.STORAGE_POOLS}, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'details'], { relativeTo: this.route });
  }

  createTicket(data: NutanixStoragePoolViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.STORAGE_POOLS, data.name), metadata: STORAGE_POOLS_TICKET_METADATA(DeviceMapping.STORAGE_POOLS, data.name)
    }, DeviceMapping.STORAGE_POOLS);
  }

}
