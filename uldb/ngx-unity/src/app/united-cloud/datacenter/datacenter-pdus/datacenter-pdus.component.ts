import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PDU_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { PduCrudService } from 'src/app/app-shared-crud/pdu-crud/pdu-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DevicePopoverData } from 'src/app/united-cloud/shared/devices-popover/device-popover-data';
import { environment } from 'src/environments/environment';
import { PduRecycleService } from '../../shared/pdu-recycle/pdu-recycle.service';
import { DatacenterPdusService, Device, PDUViewData } from './datacenter-pdus.service';

@Component({
  selector: 'datacenter-pdus',
  templateUrl: './datacenter-pdus.component.html',
  styleUrls: ['./datacenter-pdus.component.scss'],
  providers: [DatacenterPdusService]
})
export class DatacenterPdusComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  private dcId: string;
  viewData: PDUViewData[] = [];
  private ngUnsubscribe = new Subject();
  inDatacenterPage: boolean;
  addDatacenterEnabled: boolean;

  @ViewChild('pduinfo') deviceinfo: ElementRef;
  @ViewChild('socketMapping') socketMapping: ElementRef;
  @ViewChild('pduRecycle') pduRecycle: ElementRef;
  modalRef: BsModalRef;
  info: PDUViewData;
  smForm: FormGroup;
  data: FormArray;
  deviceList: Device[] = [];
  duplicateMapping: string = null;
  poll: boolean = false;
  currentCriteria: SearchCriteria;
  count: number = 0;

  selectedPDU: PDUViewData = new PDUViewData();
  pduRecycleAuthForm: FormGroup;
  pduRecycleSocketForm: FormGroup;
  formErrors: any;
  authFormErrors: any;
  socketFormErrors: any;
  validationMessages: any;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private pduService: DatacenterPdusService,
    private pduRecycleService: PduRecycleService,
    private crudService: PduCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.dcId = params.get('dcId');
      this.inDatacenterPage = this.dcId ? false : true;
      this.addDatacenterEnabled = this.dcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    });
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getPDUs());
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getPDUs();
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
    this.getPDUs();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getPDUs();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getPDUs();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getPDUs();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinner.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getPDUs();
    }
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getPDUs();
  }

  getPDUs() {
    this.pduService.getPdus(this.dcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.pduService.convertToViewData(res.results);
      this.count = res.count;
      this.spinner.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinner.stop('main');
    })
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.pduService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  goToDetails(view: PDUViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.PDU, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.pduId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: PDUViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.PDU, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured) {
        this.router.navigate([view.pduId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.pduId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured) {
        this.router.navigate([view.pduId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.pduId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  showInfo(view: PDUViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.deviceinfo, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  mapSocket(view: PDUViewData) {
    this.spinner.start('main');
    this.pduService.mapSocketData(view).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceList = res[0];
      this.smForm = res[1];
      this.data = this.smForm.get('data') as FormArray;
      this.spinner.stop('main');
      this.modalRef = this.modalService.show(this.socketMapping, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
    });
  }

  hasDuplicate(arr: string[]) {
    arr = arr.filter(ele => ele !== null);
    const set = new Set(arr);
    return set.size !== arr.length;
  }

  onSubmit() {
    // if (this.hasDuplicate(<string[]>this.smForm.getRawValue().data)) {
    //   this.duplicateMapping = 'Same device cannot be attached to more than 1 socket';
    // } else {
    // }
    this.duplicateMapping = null;
    this.pduService.updateSocketMapping(this.smForm.getRawValue(), this.deviceList).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notificationService.success(new Notification('Socket mappings updated successfully'));
      this.modalRef.hide();
    }, err => {
      this.modalRef.hide();
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  createTicket(data: PDUViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('PDU', data.name), metadata: PDU_TICKET_METADATA(data.name, data.pduType, data.socketsCount, data.size)
    }, DeviceMapping.PDU);
  }

  showRecycleDetails(pdu: PDUViewData) {
    if (!pdu.recycleIconEnabled) {
      return;
    }
    this.pduRecycleService.recyclePDU(pdu.pduId + '', pdu.ip, pdu.socketsCount);
  }

  addPdu() {
    this.crudService.addOrEditPDU(null, this.dcId);
  }

  notifyPDU(view: PDUViewData) {
    this.zabbixAlertConfig.notify(view.pduId, DeviceMapping.PDU);
  }

  editPDU(view: PDUViewData) {
    this.crudService.addOrEditPDU(view.pduId, this.dcId);
  }

  deletePDU(view: PDUViewData) {
    this.crudService.deletePDU(view.pduId)
  }

}
