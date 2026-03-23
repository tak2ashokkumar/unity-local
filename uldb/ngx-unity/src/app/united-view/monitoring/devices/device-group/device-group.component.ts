import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceMonitoringAlertsViewData, DeviceService } from '../device.service';
import { DevicesCrudService } from '../devices-crud/devices-crud.service';
import { DeviceMonitoringStatus, DeviceMonitoringStatusViewData } from '../entities/device-monitoring-status.type';

@Component({
  selector: 'device-group',
  templateUrl: './device-group.component.html',
  styleUrls: ['./device-group.component.scss']
})
export class DeviceGroupComponent implements OnInit, OnDestroy {
  @Input() group: DeviceGroup;
  @Input() groupIds: string[];
  @Input() editModeOn: boolean;
  private ngUnsubscribe = new Subject();
  devices: DeviceMonitoringStatusViewData[] = [];
  maxChar: number = 10;
  pageNo: number = 1;
  private pageSize: number = 6;
  loading: boolean = false;

  @ViewChild('deviceAlertsRef') deviceAlertsRef: ElementRef;
  alerts: DeviceMonitoringAlertsViewData[] = [];
  deviceAlertsModalRef: BsModalRef;

  constructor(private deviceService: DeviceService,
    private crudService: DevicesCrudService,
    private router: Router,
    private user: UserInfoService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.getDeviceMonitoringStatus();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceMonitoringStatus() {
    this.loading = true;
    this.deviceService.getDeviceMonitoringStatus(this.group.uuid, this.pageSize, this.pageNo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.devices = this.devices.concat(this.deviceService.convertToViewData(res.results));
        if (this.devices.length !== res.count) {
          this.pageNo++;
          this.getDeviceMonitoringStatus();
        } else {
          this.loading = false;
        }
      }, err => { this.loading = false; });
  }

  dropStatus(event: CdkDragDrop<DeviceMonitoringStatusViewData[]>) {
    if (event.previousContainer !== event.container) {
      const item = event.previousContainer.data[event.previousIndex];
      for (const status of event.container.data) {
        if (status.device_name === item.device_name) {
          this.notification.error(new Notification('Device ' + item.device_name + ' already exist in ' + this.group.name));
          return;
        }
      }
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      let data: { id: string, devices: DeviceMonitoringStatusViewData[] }[] =
        [{ id: event.previousContainer.id, devices: event.previousContainer.data },
        { id: event.container.id, devices: event.container.data }];
      this.deviceService.updateDeviceStaus(data);
    }
  }

  getDeviceIcon(device: DeviceMonitoringStatusViewData) {
    switch (device.device_category) {
      case 'switch': return `${FaIconMapping.SWITCH} switches`;
      case 'firewall': return `${FaIconMapping.FIREWALL} firewalls`;
      case 'load_balancer': return `${FaIconMapping.LOAD_BALANCER} lbs`;
      case 'hypervisor':
      case 'server': return `${FaIconMapping.HYPERVISOR} hypervisor`;
      case 'bm_server': return `${FaIconMapping.BARE_METAL_SERVER} bms`;
      case 'storage_device': return `${FaIconMapping.STORAGE_DEVICE} storage`;
      case 'mac_device': return `${FaIconMapping.MAC_MINI}`;
      case 'customdevice': return `${FaIconMapping.OTHER_DEVICES} otherdev`;
      case 'vmware':
      case 'vcloud':
      case 'openstack':
      case 'esxi':
      case 'hyperv':
      case 'proxmox':
      case 'g3_kvm':
      case 'custom_vm': return `${FaIconMapping.VIRTUAL_MACHINE} vms`;
    }
  }

  goTo(device: DeviceMonitoringStatusViewData) {
    if (this.editModeOn || this.user.isDashboardOnlyUser) {
      return;
    }
    switch (device.device_category) {
      case 'firewall':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.FIREWALL, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
        if (device.monitoring.observium) {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'firewalls', device.device_uuid, 'obs', 'overview']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'firewalls', device.device_uuid, 'obs', 'configure']);
          }
        } else {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'firewalls', device.device_uuid, 'zbx', 'monitoring-graphs']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'firewalls', device.device_uuid, 'zbx', 'configure']);
          }
        }
        return;
      case 'load_balancer':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.LOAD_BALANCER, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
        if (device.monitoring.observium) {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'loadbalancers', device.device_uuid, 'obs', 'overview']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'loadbalancers', device.device_uuid, 'obs', 'configure']);
          }
        } else {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'loadbalancers', device.device_uuid, 'zbx', 'monitoring-graphs']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'loadbalancers', device.device_uuid, 'zbx', 'configure']);
          }
        }
        return;
      case 'switch':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.SWITCHES, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
        if (device.monitoring.observium) {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'switches', device.device_uuid, 'obs', 'overview']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'switches', device.device_uuid, 'obs', 'configure']);
          }
        } else {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'switches', device.device_uuid, 'zbx', 'monitoring-graphs']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'switches', device.device_uuid, 'zbx', 'configure']);
          }
        }
        return;
      case 'servers':
        if (device.server_type == 'hypervisor') {
          this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.HYPERVISOR, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
          if (device.monitoring.observium) {
            if (device.monitoring.configured) {
              this.router.navigate(['unitycloud', 'devices', 'hypervisors', device.device_uuid, 'obs', 'overview']);
            } else {
              this.router.navigate(['unitycloud', 'devices', 'hypervisors', device.device_uuid, 'obs', 'configure']);
            }
          } else {
            if (device.monitoring.configured) {
              this.router.navigate(['unitycloud', 'devices', 'hypervisors', device.device_uuid, 'zbx', 'monitoring-graphs']);
            } else {
              this.router.navigate(['unitycloud', 'devices', 'hypervisors', device.device_uuid, 'zbx', 'configure']);
            }
          }
          return;
        } else {
          this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.BARE_METAL_SERVER, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
          if (device.monitoring.observium) {
            if (device.monitoring.configured) {
              this.router.navigate(['unitycloud', 'devices', 'bmservers', device.device_uuid, 'obs', 'overview']);
            } else {
              this.router.navigate(['unitycloud', 'devices', 'bmservers', device.device_uuid, 'obs', 'configure']);
            }
          } else {
            if (device.monitoring.configured) {
              this.router.navigate(['unitycloud', 'devices', 'bmservers', device.device_uuid, 'zbx', 'monitoring-graphs']);
            } else {
              this.router.navigate(['unitycloud', 'devices', 'bmservers', device.device_uuid, 'zbx', 'configure']);
            }
          }
        }
        return;
      case 'vmware':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
        if (device.monitoring.observium) {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vmware', device.device_uuid, 'obs', 'overview']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vmware', device.device_uuid, 'obs', 'configure']);
          }
        } else {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vmware', device.device_uuid, 'zbx', 'monitoring-graphs']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vmware', device.device_uuid, 'zbx', 'configure']);
          }
        }
        return;
      case 'vcloud':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.VCLOUD, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
        if (device.monitoring.observium) {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vcloud', device.device_uuid, 'obs', 'overview']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vcloud', device.device_uuid, 'obs', 'configure']);
          }
        } else {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vcloud', device.device_uuid, 'zbx', 'monitoring-graphs']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'vms', 'vcloud', device.device_uuid, 'zbx', 'configure']);
          }
        }
        return;
      case 'openstack':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['unitycloud', 'devices', 'vms', 'openstack', device.device_uuid, 'overview']);
        return;
      case 'storage_device':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: device.monitoring.configured }, StorageType.SESSIONSTORAGE);
        if (device.monitoring.observium) {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'storagedevices', device.device_uuid, 'obs', 'overview']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'storagedevices', device.device_uuid, 'obs', 'configure']);
          }
        } else {
          if (device.monitoring.configured) {
            this.router.navigate(['unitycloud', 'devices', 'storagedevices', device.device_uuid, 'zbx', 'monitoring-graphs']);
          } else {
            this.router.navigate(['unitycloud', 'devices', 'storagedevices', device.device_uuid, 'zbx', 'configure']);
          }
        }
        return;
      case 'mac_device':
        this.storageService.put('device', { name: device.device_name, deviceType: DeviceMapping.MAC_MINI }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['unitycloud', 'devices', 'macdevices', device.device_uuid, 'overview']);
        return;
      case 'custom_vm':
        return;
      case 'customdevice':
        // this.router.navigate(['unitycloud', 'devices', 'otherdevices', device.device_uuid, 'overview']);
        return;
    }
  }

  editGroup(group: DeviceGroup) {
    this.crudService.addOrEdit(group);
  }

  deleteGroup(group: DeviceGroup) {
    this.crudService.deleteGroup(group);
  }

  addDevice() {
    const ids: string[] = this.devices.map(d => d.device_uuid);
    this.crudService.addDevice(this.group.uuid, ids).pipe(take(1)).subscribe((res: DeviceMonitoringStatus[]) => {
      this.devices = this.devices.concat(this.deviceService.convertToViewData(res));
    });
  }

  deleteDevice(deviceId: string) {
    this.crudService.deleteDevice(deviceId, this.group.uuid).pipe(take(1)).subscribe(res => {
      this.devices.map((device, i) => {
        if (device.uuid == deviceId) {
          this.devices.splice(i, 1);
        }
      })
    });
  }

  showAlerts(device: DeviceMonitoringStatusViewData) {
    if (device.failed_alerts == 'N/A' || (Number.parseInt(device.failed_alerts) == 0) || !device.monitoring.configured) {
      return;
    }
    this.spinner.start('main');
    if (device.monitoring.observium) {
      this.deviceService.getAlertsByDeviceTypeAndDeviceId(device.deviceType, device.device_uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.alerts = this.deviceService.convertToAlertsViewData(res);
        this.deviceAlertsModalRef = this.modalService.show(this.deviceAlertsRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
        this.notification.error(new Notification(`Failed to fetch ${device.deviceType} alerts. Please try again later.`));
      });

    } else if (device.monitoring.zabbix) {
      this.deviceService.getZabbixAlertsByDeviceTypeAndDeviceId(device.deviceType, device.device_uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.alerts = this.deviceService.convertToAlertsViewData(res);
        this.deviceAlertsModalRef = this.modalService.show(this.deviceAlertsRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification(`Failed to fetch ${device.deviceType} alerts. Please try again later.`));
      });
    } else {
      this.spinner.stop('main');
      return;
    }
  }
}