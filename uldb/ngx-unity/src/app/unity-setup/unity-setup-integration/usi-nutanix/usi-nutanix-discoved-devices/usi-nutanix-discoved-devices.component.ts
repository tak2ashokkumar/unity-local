import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TICKET_SUBJECT, NUTANIX_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { NutanixDeviceDataType } from 'src/app/united-cloud/shared/entities/nutanix.type';
import { TabData } from 'src/app/shared/tabdata';
import { NutanixViewData, UsiNutanixDiscovedDevicesService } from './usi-nutanix-discoved-devices.service';

@Component({
  selector: 'usi-nutanix-discoved-devices',
  templateUrl: './usi-nutanix-discoved-devices.component.html',
  styleUrls: ['./usi-nutanix-discoved-devices.component.scss'],
  providers: [UsiNutanixDiscovedDevicesService],
})
export class UsiNutanixDiscovedDevicesComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'Nutanix',
    url: '/setup/integration/'
  }];
  
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: NutanixViewData[] = [];
  constructor(
    private nutanixService: UsiNutanixDiscovedDevicesService,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private router: Router,
    private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('instanceId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getNutanixDevices();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getNutanixDevices();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getNutanixDevices();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getNutanixDevices();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getNutanixDevices();
  }

  getNutanixDevices() {
    this.nutanixService.getNutanixDevices(this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: NutanixDeviceDataType[]) => {
      this.count = data.length;
      this.viewData = this.nutanixService.convertToViewData(data);
      this.spinnerService.stop('main');
    }, () => {
      this.spinnerService.stop('main');
    });
  }

  showDetails(view: NutanixViewData) {
    //For future implementation #todo
  }

  createTicket(data: NutanixViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.CLOUD_CONTROLLER, data.name),
      metadata: NUTANIX_TICKET_METADATA(data.name, data.deviceType)
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}