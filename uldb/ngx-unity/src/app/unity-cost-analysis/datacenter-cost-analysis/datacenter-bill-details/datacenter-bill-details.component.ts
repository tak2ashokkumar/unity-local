import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetCrudService } from 'src/app/shared/cabinet-crud/cabinet-crud.service';
import { CABINET_TICKET_METADATA, PDU_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { PduCrudService } from 'src/app/shared/pdu-crud/pdu-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PDU } from 'src/app/united-cloud/datacenter/entities/pdus.type';
import { DataCenterCabinet } from 'src/app/united-cloud/shared/entities/datacenter-cabinet.type';
import { CostAnalysisDCList } from '../datacenter-cost-analysis.type';
import { DCBillViewData, DatacenterBillDetailsService } from './datacenter-bill-details.service';

@Component({
  selector: 'datacenter-bill-details',
  templateUrl: './datacenter-bill-details.component.html',
  styleUrls: ['./datacenter-bill-details.component.scss'],
})
export class DatacenterBillDetailsComponent implements OnInit, OnDestroy {
  dcId: string;
  private ngUnsubscribe = new Subject();
  view: DCBillViewData = new DCBillViewData();

  datacenters: CostAnalysisDCList[] = [];
  cabinets: DataCenterCabinet[];
  pdus: PDU[];
  currentCriteria: SearchCriteria;

  constructor(private billService: DatacenterBillDetailsService,
    private cabinetCRUDSvc: CabinetCrudService,
    private pduCRUDSvc: PduCrudService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService) {
    this.dcId = <string>this.storageService.getByKey('dcId', StorageType.SESSIONSTORAGE);
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0 };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getDatacenters();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storageService.removeByKey('dcId', StorageType.SESSIONSTORAGE);
  }

  refreshData(){
    this.spinner.start('main');
    this.dcId = <string>this.storageService.getByKey('dcId', StorageType.SESSIONSTORAGE);
    this.getDatacenters();
  }

  getDatacenters() {
    this.billService.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenters = data;
      if (this.datacenters.length) {
        const dcId = this.dcId ? this.dcId : this.datacenters.getFirst().dc_uuid;
        this.getDCBill(dcId);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
      this.spinner.stop('main');
    })
  }

  getDCBill(dcId: string) {
    this.dcId = dcId;
    this.getDCBillDetails();
    this.getCabinets();
    this.getPdus();
  }

  getDCBillDetails() {
    this.billService.getDCBillDetails(this.dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.view.billData = this.billService.convertToBillView(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to show datacenter billing data. Please tryagain later.'));
    })
  }

  getCabinets() {
    this.spinner.start('cabinet-list');
    this.billService.getCabinets(this.dcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.cabinets = data;
      this.view.cabinets = this.billService.convertToDCCabinetViewData(data);
      this.spinner.stop('cabinet-list');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to show cabinets data. Please tryagain later.'));
      this.spinner.stop('cabinet-list');
    })
  }

  editCabinet(index: number) {
    this.cabinetCRUDSvc.addOrEditCabinet(this.cabinets[index], this.dcId, true);
  }

  onCrud(event: CRUDActionTypes) {
    this.getCabinets();
    this.getPdus();
  }

  createCabinetTicket(index: number) {
    const cab = this.cabinets[index];
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Cabinet', cab.name), metadata: CABINET_TICKET_METADATA(cab.name, cab.model, cab.capacity, cab.available_size)
    }, DeviceMapping.CABINET_VIZ);
  }

  getPdus() {
    this.spinner.start('pdu-list');
    this.billService.getPdus(this.dcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.pdus = data;
      this.view.pdus = this.billService.convertToDCPDUViewData(data);
      this.spinner.stop('pdu-list');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to show PDUs data. Please tryagain later.'));
      this.spinner.stop('pdu-list');
    })
  }

  createPDUTicket(index: number) {
    const data = this.pdus[index];
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('PDU', data.name), metadata: PDU_TICKET_METADATA(data.name, data.pdu_type, data.sockets, data.size)
    }, DeviceMapping.PDU);
  }

  editPDU(index: number) {
    this.pduCRUDSvc.addOrEditPDU(this.pdus[index].uuid, this.dcId, true);
  }
}
