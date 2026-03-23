import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetCrudService } from 'src/app/shared/cabinet-crud/cabinet-crud.service';
import { CABINET_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DataCenterCabinet } from '../../shared/entities/datacenter-cabinet.type';
import { CabinetPanelDevicesViewData, CabinetViewData, DatacenterCabinetsService } from './datacenter-cabinets.service';

@Component({
  selector: 'datacenter-cabinets',
  templateUrl: './datacenter-cabinets.component.html',
  styleUrls: ['./datacenter-cabinets.component.scss'],
  providers: [DatacenterCabinetsService]
})
export class DatacenterCabinetsComponent implements OnInit, OnDestroy {
  private dcId: string;
  cabinets: DataCenterCabinet[];
  viewData: CabinetViewData[] = [];
  private ngUnsubscribe = new Subject();
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('create') create: ElementRef;
  actionMessage: 'Add' | 'Edit';
  modalRef: BsModalRef;
  cabinetForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  cabinetRef: CabinetViewData;
  nonFieldErr: string = '';
  poll: boolean = false;
  currentCriteria: SearchCriteria;
  count: number = 0;

  @ViewChild('createPanel') createPanel: ElementRef;
  @ViewChild('panelDevicesView') panelDevicesView: ElementRef;
  @ViewChild('panelDeviceConfirm') panelDeviceConfirm: ElementRef;
  panelModalRef: BsModalRef;
  panelForm: FormGroup;
  panelFormErrors: any;
  panelValidationMessages: any;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private cabinetService: DatacenterCabinetsService,
    private termService: FloatingTerminalService,
    private crudSvc: CabinetCrudService,
    private renderer: Renderer2) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.dcId = params.get('dcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getCabinets());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getCabinets();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getCabinets();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCabinets();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCabinets();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCabinets();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.getCabinets();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getCabinets();
    }
  }

  getCabinets() {
    this.cabinetService.getCabinets(this.dcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res.results;
      this.count = res.count;
      this.viewData = this.cabinetService.convertToViewData(this.cabinets);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  add() {
    this.crudSvc.addOrEditCabinet(null, this.dcId);
  }

  edit(index: number) {
    this.crudSvc.addOrEditCabinet(this.cabinets[index], this.dcId);
  }

  delete(view: CabinetViewData) {
    this.crudSvc.deleteCabinet(view.cabinetId);
  }

  cabinetDetails(view: CabinetViewData) {
    this.router.navigate([view.cabinetId, 'view'], { relativeTo: this.route });
    // this.spinnerService.start('main');
    // this.cabinetService.getCabinetDetails(view.cabinetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: CabinetDetailsResponse) => {
    //   this.spinnerService.stop('main');
    // }, (err: HttpErrorResponse) => {
    //   this.spinnerService.stop('main');
    //   this.notificationService.error(new Notification('Unable to fetch Cabinet Details. Please contact Administrator (support@unityonecloud.com)'));
    // })
  }

  createTicket(data: CabinetViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Cabinet', data.name), metadata: CABINET_TICKET_METADATA(data.name, data.model, data.capacity, data.available_size)
    }, DeviceMapping.CABINET_VIZ);
  }

  panelDevices: CabinetPanelDevicesViewData[] = [];
  selectedPanelDeviceIndex: number;
  getPaneldevices(view?: CabinetViewData) {
    this.spinnerService.start('main');
    this.cabinetRef = view ? view : this.cabinetRef;
    this.actionMessage = null;
    this.cabinetService.getPaneldevices(this.cabinetRef.cabinetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.clearPanelForm();
      this.panelDevices = this.cabinetService.convertToPanelDevicesViewData(data);
      this.spinnerService.stop('main');
      if (view) {
        this.panelModalRef = this.modalService.show(this.panelDevicesView, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      }
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    })
  }

  buildPanelForm(index?: number) {
    this.nonFieldErr = '';
    if (index || (index == 0)) {
      this.panelForm = this.cabinetService.buildPanelForm(this.cabinetRef, this.panelDevices[index]);
      this.actionMessage = 'Edit';
      this.selectedPanelDeviceIndex = index;
    } else {
      this.panelForm = this.cabinetService.buildPanelForm(this.cabinetRef);
      this.actionMessage = 'Add';
      this.selectedPanelDeviceIndex = null;
    }
    this.panelFormErrors = this.cabinetService.resetPanelFormErrors();
    this.panelValidationMessages = this.cabinetService.panelValidationMessages(this.cabinetRef);
  }

  handlePanelError(err: any) {
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.panelForm.controls) {
          this.panelFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.panelModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  addPanelFrom() {
    this.clearPanelForm();
    this.nonFieldErr = '';

    this.actionMessage = 'Add';
    this.selectedPanelDeviceIndex = null;

    this.panelForm = this.cabinetService.buildPanelForm(this.cabinetRef);
    this.panelFormErrors = this.cabinetService.resetPanelFormErrors();
    this.panelValidationMessages = this.cabinetService.panelValidationMessages(this.cabinetRef);
  }

  updatePanelDeviceForm(index: number) {
    this.clearPanelForm();
    this.nonFieldErr = '';

    this.actionMessage = 'Edit';
    this.selectedPanelDeviceIndex = index;
    this.panelDevices[index].isEditing = true;

    this.panelForm = this.cabinetService.buildPanelForm(this.cabinetRef, this.panelDevices[index]);
    this.panelFormErrors = this.cabinetService.resetPanelFormErrors();
    this.panelValidationMessages = this.cabinetService.panelValidationMessages(this.cabinetRef);
  }

  clearPanelForm() {
    if (this.panelDevices[this.selectedPanelDeviceIndex]) {
      this.panelDevices[this.selectedPanelDeviceIndex].isEditing = false;
      this.panelDevices[this.selectedPanelDeviceIndex].isDeleting = false;
    }
    if (this.selectedPanelDeviceIndex || this.selectedPanelDeviceIndex == 0) {
      this.selectedPanelDeviceIndex = null;
    }
    this.actionMessage = null;
    this.panelForm = this.cabinetService.buildPanelForm();
    this.panelFormErrors = this.cabinetService.resetPanelFormErrors();
    this.panelValidationMessages = this.cabinetService.panelValidationMessages(this.cabinetRef);
  }

  onSubmitPanel() {
    if (this.panelForm.invalid) {
      this.panelFormErrors = this.utilService.validateForm(this.panelForm, this.panelValidationMessages, this.panelFormErrors);
      this.panelForm.valueChanges
        .subscribe((data: any) => { this.panelFormErrors = this.utilService.validateForm(this.panelForm, this.panelValidationMessages, this.panelFormErrors); });
      return;
    } else {
      this.spinnerService.start('main');
      if (this.actionMessage === 'Add') {
        this.cabinetService.addPanelDevice(this.panelForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.clearPanelForm();
          this.panelDevices = this.cabinetService.convertToPanelDevicesViewData(res);
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Panel device added successfully'));
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.notificationService.error(new Notification('Failed to add Panel device. Tryagain later.'));
          this.handlePanelError(err.error);
        });
      } else {
        this.cabinetService.updatePanelDevice(this.panelDevices[this.selectedPanelDeviceIndex].deviceId, this.panelForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.clearPanelForm();
          this.panelDevices = this.cabinetService.convertToPanelDevicesViewData(res);
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Panel device updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.notificationService.error(new Notification('Failed to update Panel device. Tryagain later.'));
          this.handlePanelError(err.error);
        });
      }
    }
  }

  deletePanelDevice(index: number) {
    this.selectedPanelDeviceIndex = index;
    this.panelDevices[index].isDeleting = true;
    this.modalRef = this.modalService.show(this.panelDeviceConfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmPanelDeviceDelete() {
    this.modalRef.hide();
    this.spinnerService.start('main');
    this.cabinetService.deletePanelDevice(this.panelDevices[this.selectedPanelDeviceIndex].deviceId, this.cabinetRef.cabinetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.clearPanelForm();
      this.panelDevices = this.cabinetService.convertToPanelDevicesViewData(data);
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('Panel device deleted succesfully'));
    }, err => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Error while deleting Panel device'));
    });
  }
}