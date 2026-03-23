import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FEATURE_NOT_ENABLED_MESSAGE, MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { DEVICE_POWER_STATUS_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { BMServerPowerStatus, DeviceSensorData, DeviceSensorOutputItem, DeviceStatusData } from '../entities/cab-view-other-entities.type';
import { CabinetCustomDevices, CabinetDetailsResponse, CabinetFirewalls, CabinetLoadBalancers, CabinetMACDevices, CabinetPanelDeviceEntity, CabinetPdus, CabinetServersEntity, CabinetStorageDevices, CabinetSwitches } from '../entities/cabinet-view-device.type';
import { CabinetViewActionProperties, DatacenterCabinetDeviceIconClass, DatacenterCabinetDeviceName, DatacenterCabinetFrontViewImagePaths, DatacenterCabinetRearViewImagePaths, DatacenterCabinetUnitDevice, DatacenterCabinetUnitDeviceStatus, DatacenterCabinetViewCommonImages, DatacenterCabinetViewData, DatacenterCabinetViewDevices } from './datacenter-cabinet-viewdata.type';

@Injectable()
export class DatacenterCabinetViewdataService {
  assetsUrl: string = environment.assetsUrl;
  constructor(private user: UserInfoService,
    private http: HttpClient) { }

  private setCreateTicket() {
    let p: CabinetViewActionProperties = new CabinetViewActionProperties();
    p.isEnabled = true;
    p.tooltipText = 'Manage by creating support ticket';
    return p;
  }

  private setSSHNewTab(managementIP: string, isShared?: boolean) {
    let p: CabinetViewActionProperties = new CabinetViewActionProperties();
    if (isShared) {
      p.isEnabled = false;
      p.tooltipText = 'Non Manageable Shared Device';
      return p;
    }
    p.isEnabled = this.user.isManagementEnabled ? managementIP ? managementIP.match('N/A') ? false : true : false : false;
    p.tooltipText = this.user.isManagementEnabled ? managementIP ? 'Open In New Tab' : 'Device Not Configured' : MANAGEMENT_NOT_ENABLED_MESSAGE()
    return p;
  }

  private setSSHSameTab(managementIP: string, isShared?: boolean) {
    let p: CabinetViewActionProperties = new CabinetViewActionProperties();
    if (isShared) {
      p.isEnabled = false;
      p.tooltipText = 'Non Manageable Shared Device';
      return p;
    }
    p.isEnabled = this.user.isManagementEnabled ? managementIP ? managementIP.match('N/A') ? false : true : false : false;
    p.tooltipText = this.user.isManagementEnabled ? managementIP ? 'Open in same tab' : 'Device Not Configured' : MANAGEMENT_NOT_ENABLED_MESSAGE()
    return p;
  }

  private setBlinker(server: CabinetServersEntity) {
    let p: CabinetViewActionProperties = new CabinetViewActionProperties();
    p.isEnabled = true;
    p.tooltipText = 'Blink server in datacenter';
    this.getBMSPowerStatus(server.uuid).pipe(takeUntil(new Subject())).subscribe(res => {
      if (res.power_status != null) {
        p.isEnabled = this.user.isManagementEnabled ? true : false;
        p.tooltipText = this.user.isManagementEnabled ? 'Blink server in datacenter' : MANAGEMENT_NOT_ENABLED_MESSAGE();
      } else {
        p.isEnabled = false;
        p.tooltipText = this.user.isManagementEnabled ? 'Device not Configured with IPMI/DRAC' : MANAGEMENT_NOT_ENABLED_MESSAGE();
      }
    }, (err: HttpErrorResponse) => {
      p.isEnabled = false;
      p.tooltipText = this.user.isManagementEnabled ? 'Device not Configured with IPMI/DRAC' : MANAGEMENT_NOT_ENABLED_MESSAGE();
    })
    return p;
  }

  private getBMSPowerStatus(serverId: string): Observable<BMServerPowerStatus> {
    return this.http.get<BMServerPowerStatus>(DEVICE_POWER_STATUS_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, serverId))
  }

  private setRecycle(managementIP: string) {
    let p: CabinetViewActionProperties = new CabinetViewActionProperties();
    p.isEnabled = this.user.isManagementEnabled ? managementIP ? managementIP.match('N/A') ? false : true : false : false;
    p.tooltipText = p.isEnabled ? 'Recycle' : FEATURE_NOT_ENABLED_MESSAGE();
    return p;
  }

  addSwitches(switches: CabinetSwitches[]): DatacenterCabinetUnitDevice[] {
    let cabinetSwitches: DatacenterCabinetUnitDevice[] = [];
    switches.map((switchObj: CabinetSwitches) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = switchObj.id;
      d.uuid = switchObj.uuid;
      d.name = switchObj.name;
      d.type = DatacenterCabinetDeviceName.SWITCHES;
      d.displayType = DeviceMapping.SWITCHES;
      d.model = switchObj.model;
      d.manufacturer = switchObj.manufacturer;
      d.managementIP = switchObj.management_ip;
      d.position = switchObj.position;
      d.size = switchObj.size;
      d.isShared = switchObj.is_shared;

      d.unitOccupied = (switchObj.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${switchObj.size}`;
      d.faIconClass = DatacenterCabinetDeviceIconClass.SWITCH;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.SWITCH)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.SWITCH)}`;

      d.createTicket = this.setCreateTicket();
      d.sshSameTab = this.setSSHSameTab(switchObj.management_ip, switchObj.is_shared);
      d.sshNewTab = this.setSSHNewTab(switchObj.management_ip, switchObj.is_shared);
      d.monitoring = switchObj.monitoring;
      if (switchObj.status) {
        let ds = new DatacenterCabinetUnitDeviceStatus();
        ds.status = switchObj.status;
        d.status = ds;
      }
      cabinetSwitches.push(d);
    })
    return cabinetSwitches;
  }

  addFirewalls(firewalls: CabinetFirewalls[]): DatacenterCabinetUnitDevice[] {
    let cabinetFirewalls: DatacenterCabinetUnitDevice[] = [];
    firewalls.map((firewall: CabinetFirewalls) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = firewall.id;
      d.uuid = firewall.uuid;
      d.name = firewall.name;
      d.type = DatacenterCabinetDeviceName.FIREWALLS;
      d.displayType = DeviceMapping.FIREWALL;
      d.model = firewall.model;
      d.manufacturer = firewall.manufacturer;
      d.managementIP = firewall.management_ip;
      d.position = firewall.position;
      d.size = firewall.size;
      d.isShared = firewall.is_shared;

      d.unitOccupied = (firewall.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${firewall.size}`;
      d.faIconClass = DatacenterCabinetDeviceIconClass.FIREWALL;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.FIREWALL)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.FIREWALL)}`;

      d.createTicket = this.setCreateTicket();
      d.sshSameTab = this.setSSHSameTab(firewall.management_ip, firewall.is_shared);
      d.sshNewTab = this.setSSHNewTab(firewall.management_ip, firewall.is_shared);
      d.monitoring = firewall.monitoring;
      if (firewall.status) {
        let ds = new DatacenterCabinetUnitDeviceStatus();
        ds.status = firewall.status;
        d.status = ds;
      }
      cabinetFirewalls.push(d);
    });
    return cabinetFirewalls;
  }

  addLoadBalansers(lbs: CabinetLoadBalancers[]): DatacenterCabinetUnitDevice[] {
    let cabinetLBs: DatacenterCabinetUnitDevice[] = [];
    lbs.map((lb: CabinetLoadBalancers) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = lb.id;
      d.uuid = lb.uuid;
      d.name = lb.name;
      d.type = DatacenterCabinetDeviceName.LOADBALANCERS;
      d.displayType = DeviceMapping.LOAD_BALANCER;
      d.model = lb.model;
      d.manufacturer = lb.manufacturer;
      d.managementIP = lb.management_ip;
      d.position = lb.position;
      d.size = lb.size;
      d.isShared = lb.is_shared;

      d.unitOccupied = (lb.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${lb.size}`;
      d.faIconClass = DatacenterCabinetDeviceIconClass.LOADBALANCER;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.LOAD_BALANCER)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.LOAD_BALANCER)}`;

      d.createTicket = this.setCreateTicket();
      d.sshSameTab = this.setSSHSameTab(lb.management_ip, lb.is_shared);
      d.sshNewTab = this.setSSHNewTab(lb.management_ip, lb.is_shared);
      d.monitoring = lb.monitoring;
      if (lb.status) {
        let ds = new DatacenterCabinetUnitDeviceStatus();
        ds.status = lb.status;
        d.status = ds;
      }
      cabinetLBs.push(d);
    })
    return cabinetLBs;
  }

  addServers(servers: CabinetServersEntity[]): DatacenterCabinetUnitDevice[] {
    let cabinetServers: DatacenterCabinetUnitDevice[] = [];
    servers.map((server: CabinetServersEntity) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = server.id;
      d.uuid = server.uuid;
      d.name = server.name;
      d.type = DatacenterCabinetDeviceName.SERVERS;
      d.manufacturer = server.manufacturer ? server.manufacturer : 'N/A';
      d.model = server.model;
      d.managementIP = server.management_ip ? server.management_ip : 'N/A';
      d.position = server.position;
      d.size = server.size;
      d.username = server.username;

      d.unitOccupied = (server.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${server.size}`;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.SERVER)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.SERVER)}`;

      if (server.bm_server) {
        d.displayType = DeviceMapping.BARE_METAL_SERVER;
        d.os = server.bm_server.os ? server.bm_server.os.name : null;
        d.faIconClass = DatacenterCabinetDeviceIconClass.BAREMETAL;
        d.sshID = server.bm_server.uuid ? server.bm_server.uuid : null;
        d.blinker = server.bm_enabled ? this.setBlinker(server) : null;
      } else if (server.instance) {
        d.displayType = DeviceMapping.HYPERVISOR;
        d.os = server.instance.os ? server.instance.os.name : null;
        d.faIconClass = DatacenterCabinetDeviceIconClass.HYPERVISOR;
        d.sshID = server.instance.uuid ? server.instance.uuid : null;
        d.virtualizationType = server.instance.virtualization_type;
      } else {
        d.displayType = DeviceMapping.HYPERVISOR;
        d.os = null;
        d.faIconClass = DatacenterCabinetDeviceIconClass.HYPERVISOR;
        d.sshID = null;
        d.virtualizationType = null;
      }
      d.createTicket = this.setCreateTicket();
      d.sshSameTab = this.setSSHSameTab(server.management_ip);
      d.sshNewTab = this.setSSHNewTab(server.management_ip);
      d.monitoring = server.monitoring;
      if (server.status) {
        let ds = new DatacenterCabinetUnitDeviceStatus();
        ds.status = server.status;
        d.status = ds;
      }
      cabinetServers.push(d);
    })
    return cabinetServers;
  }

  addStorageDevices(storageDevices: CabinetStorageDevices[]): DatacenterCabinetUnitDevice[] {
    let cabinetStorageDevices: DatacenterCabinetUnitDevice[] = [];
    storageDevices.map((sd: CabinetStorageDevices) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = sd.id;
      d.uuid = sd.uuid;
      d.name = sd.name;
      d.type = DatacenterCabinetDeviceName.STORAGE;
      d.displayType = DeviceMapping.STORAGE_DEVICES;
      d.managementIP = sd.management_ip;
      d.position = sd.position;
      d.size = sd.size;
      d.model = sd.model;
      d.manufacturer = sd.manufacturer;

      d.unitOccupied = (sd.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${sd.size}`;
      d.faIconClass = DatacenterCabinetDeviceIconClass.STORAGE;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.STORAGE)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.STORAGE)}`;

      d.createTicket = this.setCreateTicket();
      d.sshSameTab = this.setSSHSameTab(sd.management_ip);
      d.sshNewTab = this.setSSHNewTab(sd.management_ip);
      d.monitoring = sd.monitoring;
      if (sd.status) {
        let ds = new DatacenterCabinetUnitDeviceStatus();
        ds.status = sd.status;
        d.status = ds;
      }
      cabinetStorageDevices.push(d);
    });
    return cabinetStorageDevices;
  }

  addPdus(pdus: CabinetPdus[]): DatacenterCabinetUnitDevice[] {
    let cabinetPDUs: DatacenterCabinetUnitDevice[] = [];
    pdus.map((pdu: CabinetPdus) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = pdu.id;
      d.uuid = pdu.uuid;
      d.name = pdu.name;
      d.type = DatacenterCabinetDeviceName.PDUS;
      d.displayType = DeviceMapping.PDU;
      d.pduType = pdu.pdu_type;
      d.model = pdu.model;
      d.manufacturer = pdu.manufacturer;
      d.managementIP = pdu.management_ip;
      d.position = Number.isInteger(Number(pdu.position)) ? Number(pdu.position) : pdu.position;
      d.size = pdu.size;
      d.sockets = pdu.sockets;
      d.monitoring = pdu.monitoring;
      Array(pdu.sockets).fill(0).map((e, i) => d.hPDUSingleSocketArray.push(80 / pdu.sockets));

      d.faIconClass = DatacenterCabinetDeviceIconClass.PDU;
      d.unitOccupied = (pdu.position != '0') ? true : false;
      d.unitOccupiedClass = `unit_${pdu.size}`;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.PDU)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.PDU)}`;
      d.hPDUStartImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_START)}`;
      d.hPDUSingleSocketImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_SINGLE_SOCKET)}`;
      d.hPDUEndImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_END)}`;
      d.vPDUStartImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_START)}`;
      d.vPDUSingleSocketImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_SINGLE_SOCKET)}`;
      d.vPDUEndImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_END)}`;
      d.graphs = [];

      d.createTicket = this.setCreateTicket();
      d.recycle = this.setRecycle(pdu.management_ip);
      if (pdu.status) {
        let ds = new DatacenterCabinetUnitDeviceStatus();
        ds.status = pdu.status;
        d.status = ds;
      }
      cabinetPDUs.push(d);
    });
    return cabinetPDUs;
  }

  addMACDevices(macdevices: CabinetMACDevices[]): DatacenterCabinetUnitDevice[] {
    let cabinetMACDevices: DatacenterCabinetUnitDevice[] = [];
    macdevices.map((md: CabinetMACDevices) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = md.id;
      d.uuid = md.uuid;
      d.name = md.name;
      d.type = DatacenterCabinetDeviceName.MAC_MINI;
      d.displayType = DeviceMapping.MAC_MINI;
      d.managementIP = md.management_ip;
      d.position = md.position;
      d.size = md.size;

      d.faIconClass = DatacenterCabinetDeviceIconClass.MAC_MINI;
      d.unitOccupied = (md.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${md.size}`;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.OTHER_DEVICE)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.OTHER_DEVICE)}`;

      cabinetMACDevices.push(d);
    });
    return cabinetMACDevices;
  }

  addOtherDevices(otherDevices: CabinetCustomDevices[]): DatacenterCabinetUnitDevice[] {
    let cabinetOtherDevices: DatacenterCabinetUnitDevice[] = [];
    otherDevices.map((od: CabinetCustomDevices) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = od.id;
      d.uuid = od.uuid;
      d.name = od.name;
      d.type = DatacenterCabinetDeviceName.OTHERDEVICES;
      d.displayType = DeviceMapping.OTHER_DEVICES;
      d.managementIP = od.management_ip;
      d.position = od.position;
      d.size = od.size;

      d.faIconClass = DatacenterCabinetDeviceIconClass.OTHERDEVICES;
      d.unitOccupied = (od.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${od.size}`;
      d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.OTHER_DEVICE)}`;
      d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.OTHER_DEVICE)}`;

      cabinetOtherDevices.push(d);
    });
    return cabinetOtherDevices;
  }

  addPanelDevices(panelDevices: CabinetPanelDeviceEntity[]): DatacenterCabinetUnitDevice[] {
    let cabinetPanelDevices: DatacenterCabinetUnitDevice[] = [];
    panelDevices.map((device: CabinetPanelDeviceEntity) => {
      let d: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
      d.id = device.id;
      d.uuid = device.uuid;
      d.name = device.name;
      d.type = DatacenterCabinetDeviceName.PANELDEVICES;
      d.displayType = (device.panel_type == 1) ? DeviceMapping.BLANK_PANEL : ((device.panel_type == 2) ? DeviceMapping.CABLE_ORGANISER : DeviceMapping.PATCH_PANEL);
      d.model = null;
      d.position = device.position;
      d.size = device.size;

      d.faIconClass = DatacenterCabinetDeviceIconClass.PANELDEVICES;
      d.unitOccupied = (device.position != 0) ? true : false;
      d.unitOccupiedClass = `unit_${device.size}`;
      switch (device.panel_type) {
        case 1:
          d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.BLANK_PANEL)}`;
          d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.BLANK_PANEL)}`;
          break;
        case 2:
          d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.CABLE_ORGANISER)}`;
          d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.CABLE_ORGANISER)}`;
          break;
        case 3:
          d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.PATCH_PANEL)}`;
          d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.PATCH_PANEL)}`;
          break;
        default:
          d.frontView = `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.BLANK_PANEL)}`;
          d.rearView = `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.BLANK_PANEL)}`;
      }
      cabinetPanelDevices.push(d);
    })
    return cabinetPanelDevices;
  }

  getCabinetDevices(cabinet: CabinetDetailsResponse): DatacenterCabinetUnitDevice[] {
    let devicesInCabinet: DatacenterCabinetUnitDevice[] = [];
    devicesInCabinet = devicesInCabinet.concat(this.addSwitches(cabinet[DatacenterCabinetDeviceName.SWITCHES]));
    devicesInCabinet = devicesInCabinet.concat(this.addFirewalls(cabinet[DatacenterCabinetDeviceName.FIREWALLS]));
    devicesInCabinet = devicesInCabinet.concat(this.addLoadBalansers(cabinet[DatacenterCabinetDeviceName.LOADBALANCERS]));
    devicesInCabinet = devicesInCabinet.concat(this.addServers(cabinet[DatacenterCabinetDeviceName.SERVERS]));
    devicesInCabinet = devicesInCabinet.concat(this.addStorageDevices(cabinet[DatacenterCabinetDeviceName.STORAGE]));
    devicesInCabinet = devicesInCabinet.concat(this.addPdus(cabinet[DatacenterCabinetDeviceName.PDUS]));
    devicesInCabinet = devicesInCabinet.concat(this.addOtherDevices(cabinet[DatacenterCabinetDeviceName.OTHERDEVICES]));
    devicesInCabinet = devicesInCabinet.concat(this.addPanelDevices(cabinet[DatacenterCabinetDeviceName.PANELDEVICES]));
    devicesInCabinet = devicesInCabinet.concat(this.addMACDevices(cabinet[DatacenterCabinetDeviceName.MAC_MINI]));
    return devicesInCabinet;
  }

  fillCabinet(cabinet: CabinetDetailsResponse): DatacenterCabinetViewDevices {
    let cabinetViewDevices: DatacenterCabinetViewDevices = new DatacenterCabinetViewDevices();
    Array(cabinet.capacity).fill(null).map((n, i) => cabinetViewDevices.cabinetUnits.push(new DatacenterCabinetUnitDevice()));

    let devices: DatacenterCabinetUnitDevice[] = this.getCabinetDevices(cabinet);
    let allPDUs: DatacenterCabinetUnitDevice[] = [];
    let verticalLPDUs: DatacenterCabinetUnitDevice[] = [];
    Array(2).fill(null).map((n, i) => verticalLPDUs.push(new DatacenterCabinetUnitDevice()));
    let verticalRPDUs: DatacenterCabinetUnitDevice[] = [];
    Array(2).fill(null).map((n, i) => verticalRPDUs.push(new DatacenterCabinetUnitDevice()));
    let bucketDevices: DatacenterCabinetUnitDevice[] = [];
    devices.map((device: DatacenterCabinetUnitDevice) => {
      cabinetViewDevices.allDevices.push(device);
      device.isPDU ? allPDUs.push(device) : '';
      if (device.isCabinetDevice) {
        cabinetViewDevices.cabinetUnits[Number(device.position) - 1] = device;
      } else if (device.isBucketDevice) {
        bucketDevices.push(device);
      } else if (device.isVerticalPDU) {
        switch (device.position) {
          case 'C':
            verticalLPDUs[0] = device;
            break;
          case 'A':
            verticalLPDUs[1] = device;
            break;
          case 'B':
            verticalRPDUs[0] = device;
            break;
          case 'D':
            verticalRPDUs[1] = device;
            break;
        }
      }
    })
    cabinetViewDevices.allPDUs = allPDUs;
    cabinetViewDevices.verticalLPDUs = verticalLPDUs;
    cabinetViewDevices.verticalRPDUs = verticalRPDUs;
    cabinetViewDevices.bucketDevices = bucketDevices;
    return cabinetViewDevices;
  }

  convertToViewData(cabinet: CabinetDetailsResponse): DatacenterCabinetViewData {
    let a: DatacenterCabinetViewData = new DatacenterCabinetViewData();
    a.cabinetId = cabinet.uuid;
    a.name = cabinet.name;
    a.type = cabinet.type;
    a.model = cabinet.model;
    a.unitCapacity = cabinet.capacity;
    a.availableUnits = Number(cabinet.available_size);
    a.cabinetClass = (cabinet.capacity > 42) ? '' : 'full-vh';

    a.createTicket = this.setCreateTicket();
    a.cabinetTopImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_TOP)}`;
    a.cabinetBottomImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_BOTTOM)}`;
    a.cabinetUnitLeftCellImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_LEFT_CELL)}`;
    a.cabinetUnitRightCellImgURL = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_RIGHT_CELL)}`;

    let cabinetDevices: DatacenterCabinetViewDevices = this.fillCabinet(cabinet);
    cabinetDevices.cabinetUnits = cabinetDevices.cabinetUnits.reverse();
    cabinetDevices.cabinetUnits.map((device, index) => {
      if (device.size > 1) {
        for (let j = (index - 1); j > index - device.size; j--) {
          cabinetDevices.cabinetUnits[j].unitOccupied = true;
        }
      }
    })
    a.cabinetUnits = cabinetDevices.cabinetUnits;
    a.verticalLPDUs = cabinetDevices.verticalLPDUs;
    a.verticalRPDUs = cabinetDevices.verticalRPDUs;
    a.allPDUs = cabinetDevices.allPDUs;
    a.bucketDevices = cabinetDevices.bucketDevices;
    a.allDevices = cabinetDevices.allDevices;

    a.spaceOnTop = (cabinetDevices.cabinetUnits.length >= 42) ? 0 : ((42 - cabinetDevices.cabinetUnits.length) * 13);
    return a;
  }

  convertStatusToViewData(statusData: DeviceStatusData, initialStatus?: DatacenterCabinetUnitDeviceStatus): DatacenterCabinetUnitDeviceStatus {
    let ds: DatacenterCabinetUnitDeviceStatus = new DatacenterCabinetUnitDeviceStatus();
    if (statusData) {
      if (initialStatus && initialStatus.status) {
        ds.status = initialStatus.status == '1' ? 'Up' : initialStatus.status == '0' ? 'Down' : 'Unknown';
      } else if (statusData.device_data.status) {
        ds.status = statusData.device_data.status == '1' ? 'Up' : statusData.device_data.status == '0' ? 'Down' : 'Unknown';
      } else {
        ds.status = 'Not Configured';
      }
      ds.uptime = statusData.device_data.uptime ? statusData.device_data.uptime : '0';
      ds.lastRebooted = statusData.device_data.last_rebooted ? statusData.device_data.last_rebooted.concat('000') : '0';
    } else {
      if (initialStatus && initialStatus.status) {
        ds.status = initialStatus.status == '1' ? 'Up' : initialStatus.status == '0' ? 'Down' : 'Unknown';
      } else {
        ds.status = 'Not Configured';
      }
      ds.uptime = '0';
      ds.lastRebooted = '0';
    }
    return ds;
  }

  getSensorState(sensorValue: string) {
    let value: number = Number(sensorValue);
    switch (true) {
      case (value < 10): return cabinetDeviceSensorStates.VERYLOW;
      case ((value >= 10) && (value <= 30)): return cabinetDeviceSensorStates.LOW;
      case ((value > 30) && (value <= 50)): return cabinetDeviceSensorStates.MODERATE;
      case ((value > 50) && (value <= 70)): return cabinetDeviceSensorStates.WARNING;
      case ((value > 70) && (value <= 90)): return cabinetDeviceSensorStates.HIGH;
      case (value > 90): return cabinetDeviceSensorStates.VERYHIGH;
      default: return cabinetDeviceSensorStates.MODERATE;
    }
  }

  convertToSensorData(device: DatacenterCabinetUnitDevice, sensorData: DeviceSensorData): DeviceSensor {
    if (sensorData) {
      let a: DeviceSensor = new DeviceSensor();
      if (sensorData.temperature) {
        a.deviceName = device.name;
        a.deviceType = device.type;
        a.sensorName = deviceSensorTypes.TEMPERATURE;
        a.sensorValue = '0';
        sensorData[deviceSensorTypes.TEMPERATURE].map((sensorValue: DeviceSensorOutputItem) => {
          Object.values(sensorValue).forEach(value => {
            a.sensorValue = (Number(a.sensorValue) < Number(value.sensor_value)) ? value.sensor_value : a.sensorValue;
            a.sensorUnit = `&#8451;`;
          })
        })
        a.sensorState = this.getSensorState(a.sensorValue);
        a.deviceSensorClass = device ? device.unitOccupiedClass : '';
      } else if (sensorData.current) {
        a.deviceName = device.name;
        a.deviceType = device.type;
        a.sensorName = deviceSensorTypes.CURRENT;
        a.sensorValue = '0';
        sensorData[deviceSensorTypes.CURRENT].map((sensorValue: DeviceSensorOutputItem) => {
          Object.values(sensorValue).forEach(value => {
            a.sensorValue = (Number(a.sensorValue) < Number(value.sensor_value)) ? value.sensor_value : a.sensorValue;
            a.sensorUnit = 'amps';
          })
        })
      }
      return a;
    }
    return null;
  }

}

export class DeviceSensor {
  deviceName: string;
  deviceType: string;
  deviceSensorClass?: string;
  sensorName: string;
  sensorValue: string;
  sensorUnit: string;
  sensorState?: string;
}

export enum deviceSensorTypes {
  TEMPERATURE = 'temperature',
  CURRENT = 'current'
}

enum cabinetDeviceSensorStates {
  VERYLOW = 'frozen',
  LOW = 'low',
  MODERATE = 'normal',
  WARNING = 'warning',
  HIGH = 'high',
  VERYHIGH = 'danger'
}

export enum verticalPDUNames {
  LEFTFIRST = 'A',
  LEFTSECOND = 'C',
  RIGHTFIRST = 'B',
  RIGHTSECOND = 'D'
}
