import { Component, OnDestroy, OnInit } from '@angular/core';
import { NutanixDiskViewData, NutanixDisksService } from './nutanix-disks.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DISK_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';

@Component({
  selector: 'nutanix-disks',
  templateUrl: './nutanix-disks.component.html',
  styleUrls: ['./nutanix-disks.component.scss'],
  providers: [NutanixDisksService]
})
export class NutanixDisksComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: NutanixDiskViewData[] = [];
  constructor(private svc: NutanixDisksService,
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
    this.getDisks();
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
    this.getDisks();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDisks();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDisks();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDisks();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDisks();
  }

  getDisks(){
    this.svc.getDisks(this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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

  goToDetails(view: NutanixDiskViewData) {
    this.storageService.put('device', { name: view.hostName, deviceType: DeviceMapping.DISK}, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'details'], { relativeTo: this.route });
  }

  createTicket(data: NutanixDiskViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.DISK, data.hostName), metadata: DISK_TICKET_METADATA(DeviceMapping.DISK, data.hostName, data.storageUsage.toString())
    }, DeviceMapping.DISK);
  }

}
