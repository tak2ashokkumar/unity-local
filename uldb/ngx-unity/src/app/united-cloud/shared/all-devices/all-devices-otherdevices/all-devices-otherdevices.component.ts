import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { OtherDevicePopoverData } from '../../devices-popover/device-popover-data';
import { OtherDevice } from '../../entities/other-device.type';
import { OtherDevicesViewData, OtherdevicesService } from '../../otherdevices/otherdevices.service';

@Component({
  selector: 'all-devices-otherdevices',
  templateUrl: './all-devices-otherdevices.component.html',
  styleUrls: ['./all-devices-otherdevices.component.scss']
})
export class AllDevicesOtherdevicesComponent implements OnInit, OnDestroy {
  popData: OtherDevicePopoverData;
  private pcId: string;
  viewData: OtherDevicesViewData[] = [];
  count: number;
  private currentCriteria: SearchCriteria;
  private scolled: boolean;
  private ngUnsubscribe = new Subject();
  @ViewChild('deviceinfo') deviceinfo: ElementRef;
  modalRef: BsModalRef;
  info: OtherDevicesViewData;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private otherService: OtherdevicesService,
    private spinnerService: AppSpinnerService,
    private modalService: BsModalService,
    private utilService: AppUtilityService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0, params: [{ 'uuid': this.pcId }] };
    });
  }

  ngOnInit() {
    this.spinnerService.start('allod');
    this.getDevices(false);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDevices(false);
  }

  getDevices(scrolled: boolean) {
    this.otherService.getAllOtherDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: OtherDevice[]) => {
      if (scrolled) {
        this.scolled = false;
        let temp = this.otherService.convertToViewData(data);
        temp.forEach(e => this.viewData.push(e));
      } else {
        this.count = data.length;
        this.viewData = this.otherService.convertToViewData(data);
      }
      this.spinnerService.stop('allod');
      this.getDeviceData();
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.otherService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  // getDeviceData(devices: OtherDevice[]) {
  //   from(devices).pipe(mergeMap(e => this.otherService.getDeviceUptime(e.uptime_robot_id, e.uuid)), takeUntil(this.ngUnsubscribe))
  //     .subscribe(
  //       res => {
  //         const key = res.keys().next().value;
  //         const index = this.viewData.map(data => data.deviceId).indexOf(key);
  //         if (res.get(key)) {
  //           const value = res.get(key);
  //           this.viewData[index].popOverDetails.uptime = value.up_since.toString();
  //           this.viewData[index].deviceStatus = value.status;
  //           this.viewData[index].friendlyName = value.friendly_name;
  //           this.viewData[index].popOverDetails.downtime = value.down_since.toString();
  //           this.viewData[index].upSince = this.viewData[index].popOverDetails.uptime;
  //           this.viewData[index].downSince = this.viewData[index].popOverDetails.downtime;
  //           this.viewData[index].pausedSince = value.paused_since.toString();
  //           this.viewData[index].avgResponseTime = value.average_response_time;
  //           this.viewData[index].customUptimeRatio = value.custom_uptime_ratio;
  //         } else {
  //           this.viewData[index].friendlyName = 'N/A';
  //           this.viewData[index].popOverDetails.uptime = '0';
  //           this.viewData[index].deviceStatus = 'Not Configured';
  //           this.viewData[index].popOverDetails.downtime = '0';
  //         }
  //       },
  //       err => console.log(err),
  //       () => {
  //         //Do anything after everything done
  //       }
  //     );
  // }

  showInfo(view: OtherDevicesViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.deviceinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }
}