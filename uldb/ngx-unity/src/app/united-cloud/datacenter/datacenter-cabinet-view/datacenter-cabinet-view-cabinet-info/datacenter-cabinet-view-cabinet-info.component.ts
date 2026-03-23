import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CABINET_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { PduRecycleService } from 'src/app/united-cloud/shared/pdu-recycle/pdu-recycle.service';
import { DatacenterCabinetUnitDevice, DatacenterCabinetViewData } from '../datacenter-cabinet-viewdata.type';

@Component({
  selector: 'datacenter-cabinet-view-cabinet-info',
  templateUrl: './datacenter-cabinet-view-cabinet-info.component.html',
  styleUrls: ['./datacenter-cabinet-view-cabinet-info.component.scss']
})
export class DatacenterCabinetViewCabinetInfoComponent implements OnInit, OnDestroy {
  @Input() cabinetInfo: DatacenterCabinetViewData;
  @Input() showBriefInfo: boolean;

  private ngUnsubscribe = new Subject();
  pdus: DatacenterCabinetUnitDevice[] = [];
  greenITEnabled: boolean = false;
  constructor(private pduRecycleService: PduRecycleService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,
    private user: UserInfoService, ) {
    this.greenITEnabled = this.user.isGreenITEnabled;
  }

  ngOnInit() {
    this.pdus = this.cabinetInfo.allDevices.filter(device => device.isPDU);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  createTicket() {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Cabinet', this.cabinetInfo.name), metadata: CABINET_TICKET_METADATA(this.cabinetInfo.name, this.cabinetInfo.model, this.cabinetInfo.unitCapacity, this.cabinetInfo.availableUnits.toString())
    }, DeviceMapping.CABINET_VIZ);
  }

  recyclePDU(pdu: DatacenterCabinetUnitDevice) {
    if (!pdu.recycle.isEnabled) {
      return;
    }
    this.pduRecycleService.recyclePDU(pdu.uuid, pdu.managementIP, pdu.sockets);
  }

  goToStats(pdu: DatacenterCabinetUnitDevice) {
    if (!pdu.observiumStats.isEnabled) {
      return;
    }
    this.storageService.put('device', { name: pdu.name, deviceType: DeviceMapping.PDU, configured: pdu.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (pdu.monitoring.observium) {
      if (pdu.monitoring.configured) {
        this.router.navigate(['pdu', pdu.uuid, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate(['pdu', pdu.uuid, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (pdu.monitoring.configured) {
        this.router.navigate(['pdu', pdu.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate(['pdu', pdu.uuid, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

}
