import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceSensor } from './datacenter-cabinet-viewdata.service';

export class DatacenterCabinetViewDevices {
  allDevices: DatacenterCabinetUnitDevice[] = [];
  cabinetUnits: DatacenterCabinetUnitDevice[] = [];
  bucketDevices: DatacenterCabinetUnitDevice[] = [];
  allPDUs: DatacenterCabinetUnitDevice[] = [];
  verticalLPDUs: DatacenterCabinetUnitDevice[];
  verticalRPDUs: DatacenterCabinetUnitDevice[];

  get isBucketEmpty() {
    return this.bucketDevices.filter(d => !d.isMACdevice).length == 0 ? true : false;
  }

  get pduList() {
    return this.allDevices.filter(device => device.isPDU);
  }

  get pduMonitoringTool() {
    let pdu = this.pduList.getFirst();
    return pdu && pdu.monitoring ? (pdu.monitoring.observium ? 'observium' : pdu.monitoring.zabbix ? 'zabbix' : null) : null;
  }

  get monitoringConfiguredPDUs() {
    if (this.pduList.length) {
      return this.pduList.filter(device => device.monitoring && device.monitoring.configured);
    }
    return [];
  }

  get observiumConfiguredPDUs() {
    return this.monitoringConfiguredPDUs.filter(device => device.monitoring.observium);
  }

  get zabbixConfiguredPDUs() {
    return this.monitoringConfiguredPDUs.filter(device => device.monitoring.zabbix);
  }

  get pdusWithGraphs() {
    if (this.pduMonitoringTool == 'observium') {
      if (this.observiumConfiguredPDUs.length) {
        return this.observiumConfiguredPDUs.filter(device => device.graphs.length);
      }
    } else if (this.pduMonitoringTool == 'zabbix') {
      if (this.zabbixConfiguredPDUs.length) {
        return this.zabbixConfiguredPDUs.filter(device => device.graphs.length);
      }
    }
    return [];
  }

  constructor() { }
}

export class DatacenterCabinetViewData extends DatacenterCabinetViewDevices {
  cabinetId: string;
  name: string;
  type: string;
  model: string;
  unitCapacity: number;
  availableUnits: number;
  spaceOnTop: number;
  cabinetClass: string;
  carbonFootPrint: string;

  cabinetTopImgURL: string;
  cabinetUnitLeftCellImgURL: string;
  cabinetUnitRightCellImgURL: string;
  cabinetBottomImgURL: string;

  createTicket: CabinetViewActionProperties;
  constructor() {
    super()
  }
}

export class DatacenterCabinetUnitDeviceSensors {
  temperature?: string;
  temperatureUnit?: string;
  heatMapState: string;
  current?: string;
  currentUnit?: string;
  constructor() { }
}

export class DatacenterCabinetUnitDeviceStatus {
  status: string;
  uptime: string = 'NA';
  lastRebooted: string = 'NA';
  constructor() { }
}

export class CabinetViewActionProperties {
  isEnabled: boolean;
  tooltipText: string;
  constructor() { }
}

export class CabinetViewDeviceMonitoring {
  configured: boolean = true;
  observium: boolean = false;
  enabled: boolean = false;
  zabbix: boolean = false;
}

export class DatacenterCabinetViewDevice {
  id: number;
  uuid: string;
  name: string;
  type: string;
  displayType: DeviceMapping;
  model: string;
  size: number;
  position: string | number;
  manufacturer?: string;
  managementIP?: string;
  virtualizationType?: string;
  os?: string;
  pduType?: string;
  sockets?: number;
  maxCurrent?: string;
  sshID?: string;
  username?: string;
  monitoring?: CabinetViewDeviceMonitoring;
  isShared?: boolean;

  get isDevice() {
    return this.name ? true : false;
  }

  get isBucketDevice() {
    return this.isDevice && this.position == 0;
  }

  get isCabinetDevice() {
    return this.isDevice && !this.isBucketDevice && typeof this.position == 'number';
  }

  get isServer() {
    return this.isDevice && this.type == DatacenterCabinetDeviceName.SERVERS;
  }

  get isHypervisor() {
    return this.isDevice && this.isServer && this.displayType == DeviceMapping.HYPERVISOR;
  }

  get isStorageDevice() {
    return this.isDevice && this.type == DatacenterCabinetDeviceName.STORAGE;
  }

  get isOtherDevice() {
    return this.isDevice && this.type == DatacenterCabinetDeviceName.OTHERDEVICES;
  }

  get isPanelDevice() {
    return this.isDevice && this.type == DatacenterCabinetDeviceName.PANELDEVICES;
  }

  get isPDU() {
    return this.isDevice && this.type == DatacenterCabinetDeviceName.PDUS;
  }

  get isHorizontalPDU() {
    return this.isPDU && this.pduType == DatacenterCabinetViewPDUPositionType.HORIZONTAL;
  }

  get isVerticalPDU() {
    return this.isPDU && this.pduType == DatacenterCabinetViewPDUPositionType.VERTICAL;
  }

  get isVerticalLeftPDU() {
    return this.isVerticalPDU && (this.position == 'A' || this.position == 'C');
  }

  get isVerticalRightPDU() {
    return this.isVerticalPDU && (this.position == 'B' || this.position == 'D');
  }

  get isMACdevice() {
    return this.isDevice && this.type == DatacenterCabinetDeviceName.MAC_MINI;
  }

  get isStatusExistsForDevice() {
    return this.isDevice && !this.isMACdevice && !this.isPanelDevice;
  }

  get isSensorExistsForDevice() {
    return this.isDevice && !this.isStorageDevice && !this.isMACdevice && !this.isOtherDevice && !this.isPanelDevice;
  }

  constructor() { }
}

export class DatacenterCabinetUnitDevice extends DatacenterCabinetViewDevice {
  faIconClass: string;
  unitOccupied: boolean = false;
  unitOccupiedClass: string;

  frontView: string;
  rearView: string;
  hPDUStartImgURL?: string;
  hPDUSingleSocketImgURL?: string;
  hPDUSingleSocketArray: number[] = []; // to show pdu's based on device socket number
  hPDUEndImgURL?: string;
  vPDUStartImgURL?: string;
  vPDUSingleSocketImgURL?: string;
  vPDUEndImgURL?: string;

  pduSockets?: DatacenterCabinetViewPDUSocket[] = []; // for device connection to pdu sockets
  status: DatacenterCabinetUnitDeviceStatus = new DatacenterCabinetUnitDeviceStatus();
  sensor: DeviceSensor;
  graphs: DatacenterCabinetViewMonitoringGraph[];

  createTicket?: CabinetViewActionProperties;
  sshSameTab?: CabinetViewActionProperties;
  sshNewTab?: CabinetViewActionProperties;
  blinker?: CabinetViewActionProperties;
  recycle?: CabinetViewActionProperties;

  get showSensorOnCabinetDevice() {
    return this.isSensorExistsForDevice && this.sensor ? true : false;
  }

  get observiumStats() {
    if (!this.isDevice || this.isPanelDevice || this.isOtherDevice) {
      return null;
    }
    let p: CabinetViewActionProperties = new CabinetViewActionProperties();
    p.isEnabled = this.status ? this.status.status == 'Not Configured' ? false : true : false;;
    p.tooltipText = p.isEnabled ? 'Show Statistics' : 'Monitoring not enabled';
    return p;
  }

  get monitoringStatus() {
    if (!this.isDevice || this.isPanelDevice || this.isOtherDevice) {
      return null;
    }

    let p: CabinetViewActionProperties = new CabinetViewActionProperties();

    if (this.isShared) {
      p.isEnabled = false;
      p.tooltipText = 'Non Manageable Shared Device';
      return p;
    }

    if (this.monitoring) {
      p.isEnabled = true;
      if (this.monitoring.configured) {
        p.tooltipText = 'Show Statistics';
      } else {
        p.tooltipText = 'Configure Monitoring';
      }
    } else {
      p.isEnabled = this.status ? this.status.status == 'Not Configured' ? false : true : false;;
      p.tooltipText = p.isEnabled ? 'Show Statistics' : 'Monitoring not enabled';
    }

    return p;
  }
  constructor() {
    super();
  }
}

export class DatacenterCabinetEmptyUnit {
  constructor() { }
}

export class DatacenterCabinetViewPDUSocket {
  deviceType: string;
  deviceName: string;
  deviceUUId: string;
  socketNumber: number;
  socketId: number;

  pduName: string;
  pduId: number;
  pduUUID: string;
  pduType: string;
  pduPosition: string;
  pduIPAddress: string;
  pduStatus: DatacenterCabinetUnitDeviceStatus = new DatacenterCabinetUnitDeviceStatus()
  pduRecycle: CabinetViewActionProperties;
  constructor() { }
}

export class DatacenterCabinetViewMonitoringGraph {
  name: string;
  graph: string;
  observium: boolean = false;
  zabbix: boolean = false;
}

export class DeviceConnectedPDUSocket {
  socketNumber: number;
  socketId: number;
  constructor() { }
}
export class DeviceConnectedPDU {
  deviceType: string;
  deviceName: string;
  deviceUUId: string;
  pduName: string;
  pduId: number;
  pduUUID: string;
  pduType: string;
  pduPosition: string;
  pduIPAddress: string;
  sockets: number[];
  pduStatus: DatacenterCabinetUnitDeviceStatus = new DatacenterCabinetUnitDeviceStatus()
  pduRecycle: CabinetViewActionProperties;

  get observiumStats() {
    let p: CabinetViewActionProperties = new CabinetViewActionProperties();
    p.isEnabled = this.pduStatus ? this.pduStatus.status == 'Not Configured' ? false : true : false;;
    p.tooltipText = p.isEnabled ? 'Show Statistics' : 'Monitoring not enabled';
    return p;
  }
  constructor() { }
}

export enum DatacenterCabinetDeviceIconClass {
  FIREWALL = 'fa fa-fire firewalls',
  SWITCH = 'fa fa-sitemap switches',
  LOADBALANCER = 'fa fa-balance-scale lbs',
  HYPERVISOR = 'fa fa-server hypervisor',
  BAREMETAL = 'fa fa-laptop bms',
  PDU = 'fa fa-plug pdus',
  OTHERDEVICES = 'fas fa-sliders-h otherdev',
  PANELDEVICES = '',
  STORAGE = 'fas fa-hdd',
  DATABASE = 'fa fa-database',
  MAC_MINI = 'fab fa-apple fa-lg'
}

export enum DatacenterCabinetDeviceName {
  FIREWALLS = 'firewalls',
  SWITCHES = 'switches',
  LOADBALANCERS = 'load_balancers',
  SERVERS = 'servers',
  PDUS = 'pdus',
  OTHERDEVICES = 'custom_devices',
  PANELDEVICES = 'panel_devices',
  STORAGE = 'storage_devices',
  MAC_MINI = 'mac_devices'
}

export enum DatacenterCabinetViewPDUPositionType {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}

export const datacenterCabinetViewInfoTabData: TabData[] = [
  {
    name: 'Monitoring',
    url: 'monitoring',
    icon: 'fa-chart-line',
  },
  {
    name: 'Available Devices',
    url: 'bucket',
    icon: 'fa-cloud',
  }
];

export enum DatacenterCabinetViewDevicePosition {
  CABINET = 'cabinet',
  VERTICALLPDU = 'lpdu',
  VERTICALRPDU = 'rpdu',
  BUCKET = 'bucket'
}

export enum DatacenterCabinetViewTypes {
  FRONT = 'Front View',
  REAR = 'Rear View',
  FRONT_AND_REAR = 'Front and Rear View',
}

export const datacenterCabinetViewTypes: Array<string> = [
  DatacenterCabinetViewTypes.FRONT, DatacenterCabinetViewTypes.REAR, DatacenterCabinetViewTypes.FRONT_AND_REAR
];

export enum DatacenterCabinetViewCommonImages {
  CABINET_TOP = 'cabinets/cabinet-top.png',
  CABINET_BOTTOM = 'cabinets/cabinet-bottom.png',
  CABINET_LEFT_CELL = 'cabinets/cabinet-cell-left-side.png',
  CABINET_RIGHT_CELL = 'cabinets/cabinet-cell-right-side.png',
  VPDU_START = 'cabinets/vpdu_start.png',
  VPDU_END = 'cabinets/vpdu_end.png',
  VPDU_SINGLE_SOCKET = 'cabinets/vpdu_single_socket.png',
  VPDU_SELECTED_SOCKET = 'cabinets/vpdu_selected_socket.png',
  HPDU_START = 'cabinets/hpdu_start.png',
  HPDU_END = 'cabinets/hpdu_end.png',
  HPDU_SINGLE_SOCKET = 'cabinets/hpdu_single_socket.png',
  HPDU_SELECTED_SOCKET = 'cabinets/hpdu_selected_socket.png',
}

export enum DatacenterCabinetFrontViewImagePaths {
  SWITCH = 'cabinets/device-front-view/switch.jpg',
  FIREWALL = 'cabinets/device-front-view/firewall.jpg',
  LOAD_BALANCER = 'cabinets/device-front-view/loadbalancer.jpg',
  SERVER = 'cabinets/device-front-view/server.jpg',
  STORAGE = 'cabinets/device-front-view/storage.jpg',
  PDU = 'cabinets/device-front-view/PDU.png',
  OTHER_DEVICE = 'cabinets/device-front-view/other_device.png',
  BLANK_PANEL = 'cabinets/device-front-view/blank_panel.png',
  CABLE_ORGANISER = 'cabinets/device-front-view/cable_organiser.jpg',
  PATCH_PANEL = 'cabinets/device-front-view/patch_panel.png',
}

export enum DatacenterCabinetRearViewImagePaths {
  SWITCH = 'cabinets/device-rear-view/switch.jpg',
  FIREWALL = 'cabinets/device-rear-view/firewall.jpg',
  LOAD_BALANCER = 'cabinets/device-rear-view/loadbalancer.jpg',
  SERVER = 'cabinets/device-rear-view/server.jpg',
  STORAGE = 'cabinets/device-rear-view/storage_new.jpg',
  PDU = 'cabinets/device-rear-view/PDU.png',
  OTHER_DEVICE = 'cabinets/device-rear-view/other_device.png',
  BLANK_PANEL = 'cabinets/device-rear-view/blank_panel.png',
  CABLE_ORGANISER = 'cabinets/device-rear-view/cable_organiser.jpg',
  PATCH_PANEL = 'cabinets/device-rear-view/patch_panel.png',
}