import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT } from 'src/app/app-constants';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { BM_SERVER_TICKET_METADATA, HYPERVISOR_TICKET_METADATA, PDU_TICKET_METADATA, SUMMARY_TICKET_METADATA, SWITCH_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { PduRecycleService } from 'src/app/united-cloud/shared/pdu-recycle/pdu-recycle.service';
import { DatacenterCabinetViewService } from '../datacenter-cabinet-view.service';
import { DatacenterCabinetDeviceName, DatacenterCabinetUnitDevice, DatacenterCabinetViewPDUSocket, DeviceConnectedPDU } from '../datacenter-cabinet-viewdata.type';

@Component({
  selector: 'datacenter-cabinet-view-device-info',
  templateUrl: './datacenter-cabinet-view-device-info.component.html',
  styleUrls: ['./datacenter-cabinet-view-device-info.component.scss']
})
export class DatacenterCabinetViewDeviceInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() deviceInfo: DatacenterCabinetUnitDevice;
  @Input() showBriefInfo: boolean;

  private ngUnsubscribe = new Subject();
  connectedPDUs: DeviceConnectedPDU[] = [];

  @ViewChild('IPMIAuth') IPMIAuth: ElementRef;
  modalRef: BsModalRef;
  IPMIAuthForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  sshSameTabTooltip: string = '';
  sshNewTabTooltip: string = '';
  blinkerIconTooltip: string = '';
  isBlinking: boolean = false;

  constructor(private cabinetViewService: DatacenterCabinetViewService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService,
    private pduRecycleService: PduRecycleService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService) { }

  ngOnInit() {
    if (!this.deviceInfo.isPDU) {
      this.getPDUSocketDetails();
    } else {
      this.connectedPDUs = [];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.deviceInfo && !changes.deviceInfo.isFirstChange()) {
      if (!this.deviceInfo.isPDU) {
        this.getPDUSocketDetails();
      } else {
        this.connectedPDUs = [];
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  consoleSameTab() {
    if (!this.deviceInfo.sshSameTab || (this.deviceInfo.sshSameTab && !this.deviceInfo.sshSameTab.isEnabled)) {
      return;
    }
    let obj: ConsoleAccessInput = this.cabinetViewService.getConsoleAccessInput(this.deviceInfo);
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.deviceId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab() {
    if (!this.deviceInfo.sshNewTab || (this.deviceInfo.sshNewTab && !this.deviceInfo.sshNewTab.isEnabled)) {
      return;
    }
    if (this.deviceInfo.os == 'Windows') {
      window.open(WINDOWS_CONSOLE_CLIENT(this.deviceInfo.managementIP), '_blank');
    } else {
      let obj: ConsoleAccessInput = this.cabinetViewService.getConsoleAccessInput(this.deviceInfo);
      this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
      window.open(VM_CONSOLE_CLIENT(), '_blank');
    }
  }

  buildForm() {
    this.IPMIAuthForm = this.cabinetViewService.buildForm(this.deviceInfo);
    this.formErrors = this.cabinetViewService.resetFormErrors();
    this.validationMessages = this.cabinetViewService.validationMessages;
  }

  showIPMIAuthModal() {
    if (!this.deviceInfo.blinker || (this.deviceInfo.blinker && !this.deviceInfo.blinker.isEnabled)) {
      return;
    }
    this.buildForm();
    this.modalRef = this.modalService.show(this.IPMIAuth, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  blinkServer() {
    this.cabinetViewService.blinkServer(this.deviceInfo).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.isBlinking = true;
      this.deviceInfo.blinker.tooltipText = 'Server blinking';
      setTimeout(() => {
        this.isBlinking = false;
        this.deviceInfo.blinker.tooltipText = 'blink server in datacenter';
      }, 30000);
      this.notification.success(new Notification(`Blinking ${this.deviceInfo.name} successfully. Please contact datacenter technician to verify`));
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    })
  }

  onSubmit() {
    if (this.IPMIAuthForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.IPMIAuthForm, this.validationMessages, this.formErrors);
      this.IPMIAuthForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.IPMIAuthForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.modalRef.hide();
      this.spinnerService.start('main');
      this.cabinetViewService.checkPassword(this.deviceInfo, this.IPMIAuthForm.getRawValue())
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.blinkServer();
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.notification.error(new Notification('Invalid Credentials'));
        });
    }
  }

  getMetaData(): string {
    switch (this.deviceInfo.type) {
      case DatacenterCabinetDeviceName.FIREWALLS:
        return SWITCH_TICKET_METADATA(this.deviceInfo.displayType, this.deviceInfo.name,
          this.deviceInfo.status.status, this.deviceInfo.model, this.deviceInfo.type, this.deviceInfo.managementIP,
        )
      case DatacenterCabinetDeviceName.SWITCHES:
        return SWITCH_TICKET_METADATA(this.deviceInfo.displayType, this.deviceInfo.name,
          this.deviceInfo.status.status, this.deviceInfo.model, this.deviceInfo.type, this.deviceInfo.managementIP,
        )
      case DatacenterCabinetDeviceName.LOADBALANCERS:
        return SWITCH_TICKET_METADATA(this.deviceInfo.displayType, this.deviceInfo.name,
          this.deviceInfo.status.status, this.deviceInfo.model, this.deviceInfo.type, this.deviceInfo.managementIP,
        )
      case DatacenterCabinetDeviceName.SERVERS:
        if (this.deviceInfo.displayType == DeviceMapping.HYPERVISOR) {
          return HYPERVISOR_TICKET_METADATA(this.deviceInfo.displayType, this.deviceInfo.name, this.deviceInfo.virtualizationType, this.deviceInfo.os, this.deviceInfo.managementIP)
        } else {
          return BM_SERVER_TICKET_METADATA(this.deviceInfo.displayType, this.deviceInfo.name, this.deviceInfo.status.status, this.deviceInfo.os, this.deviceInfo.managementIP)
        }
      case DatacenterCabinetDeviceName.STORAGE:
        return SUMMARY_TICKET_METADATA(DeviceMapping.STORAGE_DEVICES, this.deviceInfo.name)
      case DatacenterCabinetDeviceName.PDUS:
        return PDU_TICKET_METADATA(this.deviceInfo.name, this.deviceInfo.pduType, this.deviceInfo.sockets, this.deviceInfo.size)
      default: return '';
    }
  }

  createTicket() {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(this.deviceInfo.displayType, this.deviceInfo.name), metadata: this.getMetaData()
    }, this.deviceInfo.displayType);
  }

  getPDUSocketDetails() {
    let connectedPDUs: DeviceConnectedPDU[] = [];
    this.deviceInfo.pduSockets.map((pdu: DatacenterCabinetViewPDUSocket) => {
      let pduAddedIndex = connectedPDUs.map(data => data.pduUUID).indexOf(pdu.pduUUID);
      if (pduAddedIndex == -1) {
        let connectedPDU: DeviceConnectedPDU = new DeviceConnectedPDU();
        connectedPDU.pduName = pdu.pduName;
        connectedPDU.pduId = pdu.pduId;
        connectedPDU.pduUUID = pdu.pduUUID;
        connectedPDU.pduType = pdu.pduType;
        connectedPDU.pduPosition = pdu.pduPosition;
        connectedPDU.pduIPAddress = pdu.pduIPAddress;
        connectedPDU.deviceName = pdu.deviceName;
        connectedPDU.deviceUUId = pdu.deviceUUId;
        connectedPDU.deviceType = pdu.deviceType;

        connectedPDU.pduStatus = pdu.pduStatus;
        connectedPDU.pduRecycle = pdu.pduRecycle;

        let sockets: number[] = [];
        sockets.push(pdu.socketNumber);

        connectedPDU.sockets = sockets;
        connectedPDUs.push(connectedPDU);
      } else {
        if (this.isNewSocket(pdu, connectedPDUs)) {
          connectedPDUs[pduAddedIndex].sockets.push(pdu.socketNumber);
        }
      }
    })
    this.connectedPDUs = connectedPDUs;
  }

  isNewSocket(pdu: DatacenterCabinetViewPDUSocket, connectedPDUs: DeviceConnectedPDU[]): boolean {
    let isNewSocket: boolean = true;
    connectedPDUs.map(connectedPDU => {
      if (connectedPDU && connectedPDU.sockets.length) {
        if (connectedPDU.sockets.find(connectedPDUSocket => connectedPDUSocket == pdu.socketNumber)) {
          isNewSocket = false;
        }
      }
    });
    return isNewSocket;
  }

  recyclePDU() {
    this.pduRecycleService.recyclePDU(this.deviceInfo.uuid, this.deviceInfo.managementIP, this.deviceInfo.sockets);
  }

  recyclePDUSockets(pdu: DeviceConnectedPDU) {
    this.pduRecycleService.recycleSelectedSockets(pdu.pduUUID, pdu.pduIPAddress, pdu.sockets);
  }

  goToPDUStats(pdu: DeviceConnectedPDU) {
    this.storageService.put('device', { name: pdu.pduName, deviceType: DeviceMapping.PDU }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['pdu', pdu.pduUUID, 'overview'], { relativeTo: this.route });
  }

  navigate(deviceType: string) {
    if (this.deviceInfo.monitoring.observium) {
      if (this.deviceInfo.monitoring.configured) {
        this.router.navigate([deviceType, this.deviceInfo.uuid, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate([deviceType, this.deviceInfo.uuid, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (this.deviceInfo.monitoring.configured) {
        this.router.navigate([deviceType, this.deviceInfo.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([deviceType, this.deviceInfo.uuid, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  goToStats() {
    if (this.deviceInfo.isShared) {
      return;
    }
    switch (this.deviceInfo.displayType) {
      case DeviceMapping.SWITCHES:
        this.storageService.put('device', { name: this.deviceInfo.name, deviceType: DeviceMapping.SWITCHES, configured: this.deviceInfo.monitoring.configured }, StorageType.SESSIONSTORAGE);
        this.navigate('switch');
        break;
      case DeviceMapping.FIREWALL:
        this.storageService.put('device', { name: this.deviceInfo.name, deviceType: DeviceMapping.FIREWALL, configured: this.deviceInfo.monitoring.configured }, StorageType.SESSIONSTORAGE);
        this.navigate('firewall');
        break;
      case DeviceMapping.LOAD_BALANCER:
        this.storageService.put('device', { name: this.deviceInfo.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: this.deviceInfo.monitoring.configured }, StorageType.SESSIONSTORAGE);
        this.navigate('loadbalancer');
        break;
      case DeviceMapping.HYPERVISOR:
        this.storageService.put('device', { name: this.deviceInfo.name, deviceType: DeviceMapping.HYPERVISOR, configured: this.deviceInfo.monitoring.configured }, StorageType.SESSIONSTORAGE);
        this.navigate('hypervisor');
        break;
      case DeviceMapping.BARE_METAL_SERVER:
        this.storageService.put('device', { name: this.deviceInfo.name, deviceType: DeviceMapping.BARE_METAL_SERVER, configured: this.deviceInfo.monitoring.configured, uuid: this.deviceInfo.sshID }, StorageType.SESSIONSTORAGE);
        this.navigate('bmserver');
        break;
      case DeviceMapping.STORAGE_DEVICES:
        this.storageService.put('device', { name: this.deviceInfo.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: this.deviceInfo.monitoring.configured }, StorageType.SESSIONSTORAGE);
        this.navigate('storage');
        break;
      case DeviceMapping.PDU:
        this.storageService.put('device', { name: this.deviceInfo.name, deviceType: DeviceMapping.PDU, configured: this.deviceInfo.monitoring.configured }, StorageType.SESSIONSTORAGE);
        this.navigate('pdu');
        break;
      default:
        console.log('monitoring not available for this device');
    }
  }

}
