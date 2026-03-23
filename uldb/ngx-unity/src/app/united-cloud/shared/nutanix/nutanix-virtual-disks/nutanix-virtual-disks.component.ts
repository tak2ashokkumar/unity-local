import { Component, OnDestroy, OnInit } from '@angular/core';
import { NutanixVirtualDiskViewData, NutanixVirtualDisksService } from './nutanix-virtual-disks.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TICKET_SUBJECT, VDISK_TICKET_METADATA } from 'src/app/shared/create-ticket.const';

@Component({
  selector: 'nutanix-virtual-disks',
  templateUrl: './nutanix-virtual-disks.component.html',
  styleUrls: ['./nutanix-virtual-disks.component.scss'],
  providers:[NutanixVirtualDisksService]
})
export class NutanixVirtualDisksComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: NutanixVirtualDiskViewData[] = [];
  constructor(private svc: NutanixVirtualDisksService,
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
    this.getVirtualDisks();
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
    this.getVirtualDisks();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVirtualDisks();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVirtualDisks();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVirtualDisks();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVirtualDisks();
  }

  getVirtualDisks(){
    this.svc.getVirtualDisks(this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.converToViewData(res.results);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
    });
  }

  // getPercentage(value: string): number{
  //   const freeSpace = value?.replace('%','')?.trim();
  //   const val = freeSpace ? (100 - Number(freeSpace))  : 0;
  //   return val;
  // }

  // getProgressClass(value: string): string {
  //   const val = this.getPercentage(value);
  //   return val < 65 ? 'bg-success' : val >= 65 && val < 85 ? 'bg-warning' : 'bg-danger';
  // }

  goToDetails(view: any) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.VDISK }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'details'], { relativeTo: this.route });
  }

  createTicket(data: NutanixVirtualDiskViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.VDISK, data.name), metadata: VDISK_TICKET_METADATA(DeviceMapping.VDISK, data.name, data.totalCapacity.toString())
    }, DeviceMapping.VDISK);
  }
}