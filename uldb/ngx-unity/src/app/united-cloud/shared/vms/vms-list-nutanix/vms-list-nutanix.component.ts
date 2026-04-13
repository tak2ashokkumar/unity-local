import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep as _clone } from 'lodash-es';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TICKET_SUBJECT, NUTANIX_VM_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { NutanixVMViewData, VmsListNutanixService } from './vms-list-nutanix.service';

@Component({
  selector: 'vms-list-nutanix',
  templateUrl: './vms-list-nutanix.component.html',
  styleUrls: ['./vms-list-nutanix.component.scss'],
  providers: [VmsListNutanixService]
})
export class VmsListNutanixComponent implements OnInit {

  private pcId: string;
  private ngUnsubscribe = new Subject();
  viewData: NutanixVMViewData[] = [];
  currentCriteria: SearchCriteria;

  count: number;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: VmsListNutanixService,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getVMData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getVMData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVMData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVMData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVMData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVMData();
  }

  getVMData() {
    if (this.pcId) {
      this.getVMdataByCloudId();
    }
    else {
      this.getNutanixVMdata();
    }
  }

  getVMdataByCloudId() {
    this.svc.getVMs(this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.converToViewData(res.results);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
    });
  }

  getNutanixVMdata() {
    this.svc.getAllNutanixVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.converToViewData(res.results);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
    });
  }

  getPercentage(value: string): number {
    const freeSpace = value?.replace('%', '')?.trim();
    const val = freeSpace ? (100 - Number(freeSpace)) : 0;
    return val;
  }

  getProgressClass(value: string): string {
    const val = this.getPercentage(value);
    return val < 65 ? 'bg-success' : val >= 65 && val < 85 ? 'bg-warning' : 'bg-danger';
  }

  goToDetails(view: NutanixVMViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.NUTANIX_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE);
    let id = this.pcId ? view.uuid : view.id;
    this.router.navigate([id, 'details'], { relativeTo: this.route });
  }

  // saveCriteria() {
  //   this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.OTHER_DEVICES }, StorageType.SESSIONSTORAGE);    
  // }

  createTicket(data: NutanixVMViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.NUTANIX_VIRTUAL_MACHINE, data.name),
      metadata: NUTANIX_VM_TICKET_METADATA(DeviceMapping.NUTANIX_VIRTUAL_MACHINE, data.name)
    }, DeviceMapping.NUTANIX_VIRTUAL_MACHINE);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}