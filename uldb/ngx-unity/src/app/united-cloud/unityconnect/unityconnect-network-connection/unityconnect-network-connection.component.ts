import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnityconnectNetworkConnectionService, deviceTypes, UnityConnectPortsViewData } from './unityconnect-network-connection.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceType, DeviceFast } from 'src/app/shared/SharedEntityTypes/device-response.type';

@Component({
  selector: 'unityconnect-network-connection',
  templateUrl: './unityconnect-network-connection.component.html',
  styleUrls: ['./unityconnect-network-connection.component.scss'],
  providers: [UnityconnectNetworkConnectionService]
})
export class UnityconnectNetworkConnectionComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  viewData: UnityConnectPortsViewData[] = [];
  selectedView: UnityConnectPortsViewData = new UnityConnectPortsViewData();

  @ViewChild('portFormRef') portFormRef: ElementRef;
  portForm: FormGroup;
  portFormErrors: any;
  portFormValidationMessages: any;
  portFormModalRef: BsModalRef;

  action: string;
  nonFieldErr: string;
  deviceTypes: DeviceType[] = deviceTypes;
  devices: DeviceFast[];
  devicePorts: any[];

  @ViewChild('confirmDeleteRef') confirmDeleteRef: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private networkService: UnityconnectNetworkConnectionService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    public sanitizer: DomSanitizer,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute, ) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getPorts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getPorts();
  }

  getPorts() {
    this.networkService.getPorts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.networkService.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  getDevicesByDeviceType(deviceType: DeviceMapping) {
    this.networkService.getDevicesByDeviceType(deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devices = res.filter(res => res.monitoring.configured && res.monitoring.zabbix);
    }, (err: HttpErrorResponse) => {
    })
  }

  getPortsByDevice(deviceType: string, device: DeviceFast) {
    this.networkService.getPortsByDevice(deviceType, device.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devicePorts = res;
    }, (err: HttpErrorResponse) => {
    })
  }

  addOrEditPort(view?: any) {
    if (view) {
      this.selectedView = view;
      this.action = 'Edit';
    } else {
      this.selectedView = null;
      this.action = 'Add';
    }

    this.portForm = this.networkService.buildPortForm(view);
    this.portFormErrors = this.networkService.resetPortFormErrors();
    this.portFormValidationMessages = this.networkService.portFormValidataionMessages;

    this.portForm.get('device_type').valueChanges.subscribe(val => {
      this.getDevicesByDeviceType(val.mapping);
    })

    this.portForm.get('device').valueChanges.subscribe(val => {
      this.getPortsByDevice(this.portForm.get('device_type').value.apiMapping, val);
    })

    this.portFormModalRef = this.modalService.show(this.portFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAddOrEditPort() {
    if (this.portForm.invalid) {
      this.portFormErrors = this.utilService.validateForm(this.portForm, this.portFormValidationMessages, this.portFormErrors);
      this.portForm.valueChanges
        .subscribe((data: any) => { this.portFormErrors = this.utilService.validateForm(this.portForm, this.portFormValidationMessages, this.portFormErrors); })
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.portForm.getRawValue());
      obj.snmp_index = obj.port.snmp_index;
      obj.port_name = obj.port.port_name;
      delete obj.port;
      // delete obj.device;
      // delete obj.device_type
      if (this.selectedView) {
        this.networkService.updatePort(this.selectedView.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getPorts();
          this.portFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Port updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.portFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to update port. Please tryagain later.'));
        })
      } else {
        this.networkService.addPort(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getPorts();
          this.portFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Port added successfully'));
        }, (err: HttpErrorResponse) => {
          this.portFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to add port. Please tryagain later.'));
        })
      }
    }
  }

  deletePort(view: UnityConnectPortsViewData) {
    this.selectedView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.networkService.deletePort(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getPorts();
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Port deleted successfully'));
    }, (err: HttpErrorResponse) => {
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete port. Please tryagain later.'));
    })
  }

  goToStats(view: any) {
    this.storageService.put('device', { name: view.entityName, deviceType: DeviceMapping.SWITCHES }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.switchId, view.portId, 'usage'], { relativeTo: this.route });
  }

  goToGraph(view: UnityConnectPortsViewData) {
    this.router.navigate(['ports', view.uuid], { relativeTo: this.route });
  }
}
