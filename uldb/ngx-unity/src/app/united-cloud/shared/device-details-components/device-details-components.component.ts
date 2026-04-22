import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceInterfaceCrudService } from 'src/app/app-shared-crud/device-interface-crud/device-interface-crud.service';
import { DeviceBGPPeersType } from 'src/app/shared/SharedEntityTypes/device-bgp-peers.type';
import { InterfaceDetailsType, RemoteDevicesType } from 'src/app/shared/SharedEntityTypes/device-interface.type';
import { DeviceInterface } from 'src/app/shared/SharedEntityTypes/inventory-attributes.type';
import { UnityCustomObjType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { BatteriesViewData, BGPPeersSummaryViewData, ChassisViewData, DatabaseViewData, DateRange, DeviceDetailsComponentsService, EnclosuresViewData, EventsViewData, FansViewData, InterfaceSummaryViewData, ManagersViewData, MerakiDeviceEventViewData, PerformanceViewData, PhysicalAdapterViewData, PhysicalDiskViewData, PowerSupplyViewData, ProcessorsViewData, SdwanInterfaceStatsViewData, ServiceSummaryViewData, ServiceViewData, StorageAdapterViewData, StorageControllerViewData, StorageDevicesViewData, SystemFirewallViewData, TasksViewData, TemperatureViewData, TimeRange, TlocStatsViewData, TunnelStatsViewData, VirtualDiskViewData, VMKernelViewData, VoltageViewData, VSwitchesViewData } from './device-details-components.service';
import { FormGroup } from '@angular/forms';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'device-details-components',
  templateUrl: './device-details-components.component.html',
  styleUrls: ['./device-details-components.component.scss'],
  providers: [DeviceDetailsComponentsService]
})
export class DeviceDetailsComponentsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() deviceType: DeviceMapping;
  @Input() deviceId: string;
  @Input() deviceDetails?: any;
  @Input() serverName?: string;
  @ViewChild('tabHeaderContainer', { static: false }) tabHeaderContainer!: ElementRef;

  private ngUnsubscribe = new Subject();
  isNetworkDeviceType: boolean = false;
  currentCriteria: SearchCriteria;
  hypervisorCurrentCriteria: SearchCriteria;
  databaseCurrentCriteria: SearchCriteria;
  view: string = 'interfaces';
  scrollStrategy: ScrollStrategy;
  showScrollButtons = false;
  deviceMapping = DeviceMapping;

  hideOldInterfacesTab: boolean = false;
  deviceInterfaceSummary: InterfaceSummaryViewData = new InterfaceSummaryViewData();
  deviceInterfaces: DeviceInterface[] = [];
  selectedInterfaceStatus: UnityCustomObjType;

  showBGPPeers: boolean = false;
  showServices: boolean = false;
  showEvents: boolean = false;
  showTasks: boolean = false;
  showPerformanceOverview: boolean = false;
  showSystem: boolean = false;
  showStorage: boolean = true;
  showNetwork: boolean = true;
  showControlConnections: boolean = false;
  showTunnels: boolean = false;
  showTLOC: boolean = false;
  showViptelaInterfaces: boolean = false;
  showLicense: boolean = false;
  showMerakiNetwork: boolean = false;
  showMerakiEvents: boolean = false;
  showMerakiDeviceInterfaces: boolean = false;
  showMerakiDeviceEvents: boolean = false;
  showDatabases: boolean = false;

  networkTabSwitches: string = 'vswitches';
  selectedViewStorage: string = 'storageAdapters';
  networkCountData: number;
  systemFirewallCount: number;
  deviceBGPPeersSummary: BGPPeersSummaryViewData = new BGPPeersSummaryViewData();
  deviceBGPPeers: DeviceBGPPeersType[] = [];
  selectedBgpPeerStatus: UnityCustomObjType;
  deviceServices: ServiceViewData[] = [];
  deviceServicesSummary: ServiceSummaryViewData = new ServiceSummaryViewData();
  selectedServiceStatus: UnityCustomObjType;
  devicePerformanceOverview: PerformanceViewData = new PerformanceViewData();
  deviceEventsSyncInProgress: boolean = false;
  deviceEventsCount: number = 0;
  deviceEvents: EventsViewData[] = [];
  deviceTasksSyncInProgress: boolean = false;
  deviceTasksCount: number = 0;
  deviceTasks: TasksViewData[] = [];
  systemFirewallViewData: SystemFirewallViewData[] = [];
  vSwitchesViewData: VSwitchesViewData[] = [];
  vmKernelAdapterViewData: VMKernelViewData[] = [];
  physicalAdapterViewData: PhysicalAdapterViewData[] = [];
  storageAdapterViewData: StorageAdapterViewData[] = [];
  storageAdapterViewDataCount: number;
  storageDevicesViewData: StorageDevicesViewData[] = [];
  controlConnectionsViewDataCount: number;
  controlConnectionsViewData: any[] = [];
  sdwanInterfaceViewDataCount: number;
  sdwanInterfaceViewData: SdwanInterfaceStatsViewData[] = [];
  tlocViewDataCount: number;
  tlocViewData: TlocStatsViewData[] = [];
  tunnelViewDataCount: number;
  tunnelViewData: TunnelStatsViewData[] = [];
  licenseViewDataCount: number;
  licenseViewData: any[] = [];
  merakiNetworkViewDataCount: number;
  merakiNetworkViewData: any[] = [];
  merakiDeviceEventsCount: number = 0;
  merakiDeviceEventsViewData: MerakiDeviceEventViewData[] = [];

  eventsFilterForm: FormGroup;
  eventsFilterFormErrors: any;
  eventsFilterValidationMessages: any;
  eventsDateRange: DateRange;
  eventsTimeRange = TimeRange;

  tasksFilterForm: FormGroup;
  tasksFilterFormErrors: any;
  tasksFilterValidationMessages: any;
  tasksDateRange: DateRange;
  tasksTimeRange = TimeRange;

  fans: boolean = false;
  fansCount: number = 0;
  fansViewData: FansViewData[] = [];

  powerSupply: boolean = false;
  powerSupplyCount: number = 0;
  powerSupplyViewData: PowerSupplyViewData[] = [];

  chassis: boolean = false;
  chassisCount: number = 0;
  chassisViewData: ChassisViewData[] = [];

  temperature: boolean = false;
  temperatureCount: number = 0;
  temperatureViewData: TemperatureViewData[] = [];

  voltage: boolean = false;
  voltageCount: number = 0;
  voltageViewData: VoltageViewData[] = [];

  processors: boolean = false;
  processorsCount: number = 0;
  processorsViewData: ProcessorsViewData[] = [];

  virtualDisk: boolean = false;
  virtualDiskCount: number = 0;
  virtualDiskViewData: VirtualDiskViewData[] = [];

  physicalDisk: boolean = false;
  physicalDiskCount: number = 0;
  physicalDiskViewData: PhysicalDiskViewData[] = [];

  managers: boolean = false;
  managersCount: number = 0;
  managersViewData: ManagersViewData[] = [];

  storageControllers: boolean = false;
  storageControllersCount: number = 0;
  storageControllersViewData: StorageControllerViewData[] = [];

  enclosers: boolean = false;
  enclosersCount: number = 0;
  enclosersViewData: EnclosuresViewData[] = [];

  batteries: boolean = false;
  batteriesCount: number = 0;
  batteriesViewData: BatteriesViewData[] = [];

  redfishInteg: any;

  databasesCount: number = 0;
  databasesViewData: DatabaseViewData[] = [];
  selectedAll: boolean = false;
  selectedDbEntityIds: string[] = [];
  modalRef: BsModalRef;
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  constructor(private svc: DeviceDetailsComponentsService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService,
    private utilSvc: AppUtilityService,
    private interfaceCrudSvc: DeviceInterfaceCrudService,
    private readonly sso: ScrollStrategyOptions,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private modalService: BsModalService,
    private notification: AppNotificationService) {
    this.currentCriteria = { pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'device_type': null, 'device_type_plural': null, 'uuid': null, 'status': null }] };
    this.hypervisorCurrentCriteria = { pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.databaseCurrentCriteria = { pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    if (this.deviceType) {
      this.currentCriteria.params[0].device_type = this.utilSvc.getDeviceAPIMappingByDeviceMapping(this.deviceType);
      this.currentCriteria.params[0].device_type_plural = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(this.deviceType);
    } else {
      let device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
      this.currentCriteria.params[0].device_type = this.utilSvc.getDeviceAPIMappingByDeviceMapping(device.deviceType);
      this.currentCriteria.params[0].device_type_plural = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(device.deviceType);
    }

    if (this.deviceId) {
      this.currentCriteria.params[0].uuid = this.deviceId;
    } else {
      this.route.parent.paramMap.subscribe((params: ParamMap) => {
        this.currentCriteria.params[0].uuid = params.get('deviceid');
      })
    }

    this.isNetworkDeviceType = this.deviceType == DeviceMapping.SWITCHES || this.deviceType == DeviceMapping.FIREWALL
      || this.deviceType == DeviceMapping.LOAD_BALANCER;

    let supportBGPPeers: boolean = this.deviceType == DeviceMapping.SWITCHES || this.deviceType == DeviceMapping.FIREWALL
      || this.deviceType == DeviceMapping.LOAD_BALANCER;
    if (supportBGPPeers) {
      this.view = 'bgp_peers';
      this.showBGPPeers = true;
    } else {
      this.showBGPPeers = false;
    }

    this.redfishInteg = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
    let supportRedfish: boolean = this.deviceType == DeviceMapping.SWITCHES || this.deviceType == DeviceMapping.BARE_METAL_SERVER
      || this.deviceType == DeviceMapping.STORAGE_DEVICES;
    if (this.redfishInteg.redfish && supportRedfish) {

      if (!this.serverName) {
        this.serverName = 'Fans';
      }

      if (this.serverName === 'Fans') {
        this.view = 'Fans';
        this.fans = true;
      } else {
        this.fans = false;
      }

      if (this.serverName === 'Power supplies') {
        this.powerSupply = true;
        this.view = 'Power supplies';
      } else {
        this.powerSupply = false;
      }

      if (this.serverName === 'Chassis') {
        this.chassis = true;
        this.view = 'Chassis';
      } else {
        this.chassis = false;
      }

      if (this.serverName === 'Temperatures') {
        this.temperature = true;
        this.view = 'Temperatures';
      } else {
        this.temperature = false;
      }

      if (this.serverName === 'Voltages') {
        this.voltage = true;
        this.view = 'Voltages';

      } else {
        this.voltage = false;
      }

      if (this.serverName === 'Processors') {
        this.processors = true;
        this.view = 'Processors';

      } else {
        this.processors = false;
      }

      if (this.serverName === 'Virtual disks') {
        this.virtualDisk = true;
        this.view = 'Virtual disks';

      } else {
        this.virtualDisk = false;
      }

      if (this.serverName === 'Physical disks') {
        this.physicalDisk = true;
        this.view = 'Physical disks';

      } else {
        this.physicalDisk = false;
      }

      if (this.serverName === 'Managers') {
        this.managers = true;
        this.view = 'Managers';

      } else {
        this.managers = false;
      }

      if (this.serverName === 'Enclosures') {
        this.enclosers = true;
        this.view = 'Enclosures';

      } else {
        this.enclosers = false;
      }

      if (this.serverName === 'Storage controllers') {
        this.storageControllers = true;
        this.view = 'Storage controllers';

      } else {
        this.storageControllers = false;
      }

      if (this.serverName === 'Batteries') {
        this.batteries = true;
        this.view = 'Batteries';
      } else {
        this.batteries = false;
      }
    }

    if (this.deviceType == DeviceMapping.STORAGE_DEVICES && !this.redfishInteg.redfish) {
      this.view = 'ipAddress';
    }

    let supportServices: boolean = this.deviceType == DeviceMapping.HYPERVISOR || this.deviceType == DeviceMapping.BARE_METAL_SERVER
      || this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE || this.deviceType == DeviceMapping.CUSTOM_VIRTUAL_MACHINE
      || this.deviceType == DeviceMapping.ESXI || this.deviceType == DeviceMapping.HYPER_V;
    if (supportServices) {
      if (this.deviceType == DeviceMapping.BARE_METAL_SERVER || this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE) {
        this.view = 'services';
      }
      this.showServices = true;
    } else {
      this.showServices = false;
    }

    let supportPerformanceOverview: boolean = this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE;
    if (supportPerformanceOverview) {
      this.showPerformanceOverview = true;
    } else {
      this.showPerformanceOverview = false;
    }

    let supportEvents: boolean = this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE;
    if (supportEvents) {
      this.showEvents = true;
    } else {
      this.showEvents = false;
    }

    let supportTasks: boolean = this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE;
    if (supportTasks) {
      this.showTasks = true;
    } else {
      this.showTasks = false;
    }

    let supportSystem: boolean = this.deviceType == DeviceMapping.HYPERVISOR;
    if (supportSystem) {
      this.showSystem = true;
      this.showStorage = true;
      this.showNetwork = true;
    } else {
      this.showSystem = false;
      this.showStorage = false;
      this.showNetwork = false;
    }

    let supportControlConnections: boolean = this.deviceType == DeviceMapping.VIPTELA_DEVICE;
    if (supportControlConnections) {
      this.showViptelaInterfaces = true;
      this.showControlConnections = true;
      this.showTunnels = true;
      this.showTLOC = true;
    } else {
      this.showViptelaInterfaces = false;
      this.showControlConnections = false;
      this.showTunnels = false;
      this.showTLOC = false;
    }

    let supportMeraki: boolean = this.deviceType == DeviceMapping.MERAKI_ORG;
    if (supportMeraki) {
      this.showLicense = true;
      this.showMerakiNetwork = true;
      this.showMerakiEvents = true;
    } else {
      this.showLicense = false;
      this.showMerakiNetwork = false;
      this.showMerakiEvents = false;
    }

    let supportMerakiDeviceInterfaces: boolean = this.deviceType == DeviceMapping.MERAKI_DEVICE;
    if (supportMerakiDeviceInterfaces) {
      this.showMerakiDeviceInterfaces = true;
      this.showMerakiDeviceEvents = true;
    } else {
      this.showMerakiDeviceInterfaces = false;
      this.showMerakiDeviceEvents = false;
    }

    let supportDatabases: boolean = this.deviceType == DeviceMapping.DB_SERVER;
    if (supportDatabases) {
      this.showDatabases = true;
      this.view = 'databases'
    } else {
      this.showDatabases = false;
    }

    this.hideOldInterfacesTab = this.isNetworkDeviceType || this.deviceType == DeviceMapping.BARE_METAL_SERVER || this.deviceType == DeviceMapping.STORAGE_DEVICES || this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE;

    if (!supportMeraki && !supportDatabases && !this.hideOldInterfacesTab) {
      this.getInterfaceSummary();
      this.getInterfaceList();
    }

    if (!supportMeraki && !supportDatabases && !this.hideOldInterfacesTab) {
      this.syncInterfaceData();
    }

    if (this.showBGPPeers) {
      this.getBGPPeersSummary();
      this.getBGPPeersList();
      this.syncBGPPeersData();
    }

    if (this.showServices) {
      this.getServicesList();
      this.getServicesSummary();
      this.syncServicesData();
    }

    if (this.showPerformanceOverview) {
      this.devicePerformanceOverview = this.svc.convertToPerformanceViewData(this.deviceDetails);
    }

    if (this.showEvents) {
      this.buildEventsFilterForm();
    }

    if (this.showTasks) {
      this.buildTasksFilterForm();
    }

    if (this.showSystem) {
      this.getSystemFirewall();
    }

    if (this.showControlConnections) {
      this.getControlConnections();
    }

    if (this.showTunnels) {
      this.getTunnels();
    }

    if (this.showTLOC) {
      this.getTLOC();
    }

    if (this.showLicense) {
      this.getLicense();
    }

    if (this.showMerakiNetwork) {
      this.getMerakiNetwork();
    }

    // if(this.showMerakiEvents){
    //   this.getMerakiEvents();
    // }

    if (this.showMerakiDeviceEvents) {
      this.getMerakiDeviceEvents()
    }

    if (this.fans) {
      this.getFans();
    }
    if (this.powerSupply) {
      this.getPowerSupply();
    }
    if (this.chassis) {
      this.getChassis();
    }
    if (this.temperature) {
      this.getTemperature();
    }
    if (this.voltage) {
      this.getVoltage();
    }
    if (this.processors) {
      this.getProcessors();
    }
    if (this.virtualDisk) {
      this.getVirtualDisk();
    }
    if (this.physicalDisk) {
      this.getPhysicalDisk();
    }
    if (this.managers) {
      this.getManagers();
    }
    if (this.enclosers) {
      this.getEnclosures();
    }
    if (this.storageControllers) {
      this.getStorageControllers();
    }
    if (this.batteries) {
      this.getBatteries();
    }
    if (this.showDatabases) {
      this.getDatabasesList();
      this.getDeviceBulkEditFields();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes?.deviceDetails?.firstChange && this.showPerformanceOverview) {
      this.devicePerformanceOverview = this.svc.convertToPerformanceViewData(changes.deviceDetails.currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.checkTabOverflow();
    window.addEventListener('resize', this.checkTabOverflow.bind(this));
  }

  checkTabOverflow(): void {
    const container = this.tabHeaderContainer.nativeElement;
    const scrollWrapper = container.querySelector('.tab-scroll-wrapper');

    const shouldShow = scrollWrapper.scrollWidth > container.clientWidth;

    if (this.showScrollButtons !== shouldShow) {
      this.showScrollButtons = shouldShow;
      this.cdr.detectChanges();
    }
  }

  scrollTabs(direction: 'left' | 'right'): void {
    const scrollElement = this.tabHeaderContainer.nativeElement.querySelector('.tab-scroll-wrapper');
    const scrollAmount = 150;
    scrollElement.scrollLeft += direction === 'right' ? scrollAmount : -scrollAmount;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.spinner.stop('main')
  }

  pageSizeChange(pageSize: number) {
    this.hypervisorCurrentCriteria.pageSize = pageSize;
    this.hypervisorCurrentCriteria.pageNo = 1;
    this.manageAPICallBasedOnView(this.view);
  }

  refreshData() {
    if (!this.showLicense && !this.showDatabases) {
      this.getInterfaceSummary();
      this.getInterfaceList();
    }
    if (this.showServices) {
      this.getServicesList();
      this.syncServicesData();
      this.getServicesSummary();
    }
    if (this.showBGPPeers) {
      this.getBGPPeersSummary();
      this.getBGPPeersList();
    }
    if (this.showPerformanceOverview) {
      this.devicePerformanceOverview = this.svc.convertToPerformanceViewData(this.deviceDetails);
    }
    if (this.showEvents) {
      this.buildEventsFilterForm();
    }
    if (this.showTasks) {
      this.buildTasksFilterForm();
    }
    if (this.showControlConnections) {
      this.getTunnels();
      this.getTLOC();
      this.getControlConnections();
    }
    if (this.showLicense) {
      this.getLicense();
      this.getMerakiNetwork();
    }
    if (this.showMerakiDeviceEvents) {
      this.getMerakiDeviceEvents();
    }
    if (this.fans) {
      this.getFans();
    }
    if (this.powerSupply) {
      this.getPowerSupply();
    }
    if (this.chassis) {
      this.getChassis();
    }
    if (this.temperature) {
      this.getTemperature();
    }
    if (this.temperature) {
      this.getTemperature();
    }
    if (this.voltage) {
      this.getVoltage();
    }
    if (this.processors) {
      this.getProcessors();
    }
    if (this.virtualDisk) {
      this.getVirtualDisk();
    }
    if (this.physicalDisk) {
      this.getPhysicalDisk();
    }
    if (this.managers) {
      this.getManagers();
    }
    if (this.enclosers) {
      this.getEnclosures();
    }
    if (this.storageControllers) {
      this.getStorageControllers();
    }
    if (this.batteries) {
      this.getBatteries();
    }
    if (this.showDatabases) {
      this.getDatabasesList();
      this.getDeviceBulkEditFields();
    }
  }

  pageChange(pageNo: number) {
    // this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.hypervisorCurrentCriteria.pageNo = pageNo;
    this.databaseCurrentCriteria.pageNo = pageNo;
    this.manageAPICallBasedOnView(this.view);
  }

  onSearched(event: string) {
    if (this.view == 'services') {
      this.currentCriteria.searchValue = event;
      this.currentCriteria.pageNo = 1;
      this.getServicesSummary();
      this.getServicesByStatus(this.currentCriteria.params[0].status);
    } else if (this.view == 'events') {
      this.currentCriteria.searchValue = event;
      this.currentCriteria.pageNo = 1;
      this.getEvents();
    } else if (this.view == 'tasks') {
      this.currentCriteria.searchValue = event;
      this.currentCriteria.pageNo = 1;
      this.getTasks();
    } else if (this.view == 'storage') {
      this.hypervisorCurrentCriteria.searchValue = event;
      this.hypervisorCurrentCriteria.pageNo = 1;
      this.getSelectedViewStorage(this.selectedViewStorage);
    } else if (this.view == 'network') {
      this.hypervisorCurrentCriteria.searchValue = event;
      this.hypervisorCurrentCriteria.pageNo = 1;
      this.switchNetworkView(this.selectedViewStorage);
    } else if (this.view == 'system') {
      this.hypervisorCurrentCriteria.searchValue = event;
      this.hypervisorCurrentCriteria.pageNo = 1;
      this.getSystemFirewall();
    }
  }


  getInterfaceSummary() {
    this.svc.getInterfaceSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceInterfaceSummary = this.svc.convertToInterfaceSummaryViewData(data);
    }, (err: HttpErrorResponse) => {
      this.deviceInterfaceSummary = new InterfaceSummaryViewData();
    })
  }

  getInterfaceList() {
    this.svc.getInterfaceList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceInterfaces = data.results;
    }, (err: HttpErrorResponse) => {
      this.deviceInterfaces = [];
    })
  }

  syncInterfaceData() {
    this.svc.syncInterfaceData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInterfaceSummary();
      this.getInterfaceList();
    })
  }

  getInterfacesByStatus(status: string) {
    this.spinner.start('deviceInterfaceList');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.params[0].status = status;
    if (status) {
      this.selectedInterfaceStatus = { label: status, value: this.deviceInterfaceSummary ? this.deviceInterfaceSummary[status] : 0 };
    } else {
      this.selectedInterfaceStatus = null;
    }
    this.svc.getInterfaceList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceInterfaces = data.results;
      this.spinner.stop('deviceInterfaceList');
    }, (err: HttpErrorResponse) => {
      this.deviceInterfaces = [];
      this.spinner.stop('deviceInterfaceList');
    })
  }

  goToTargetDeviceDetails(remoteDevice: RemoteDevicesType) {
    if (!remoteDevice.target_device_type || !remoteDevice.target_device_uuid) {
      return;
    }
    let deviceMapping = this.utilSvc.getDeviceMappingByDeviceType(remoteDevice.target_device_type);
    let isMonitoringConfigured: boolean = remoteDevice.target_device_monitoring?.configured;
    let baseURL = this.utilSvc.getDeviceBaseURL(remoteDevice);
    let url = `/${remoteDevice.target_device_uuid}/zbx/details/`;

    this.router.navigateByUrl(baseURL, { skipLocationChange: true }).then(() => {
      if (baseURL.includes('devices') || baseURL.includes('datacenter')) {
        if (deviceMapping == DeviceMapping.DB_SERVER) {
          this.storage.put('device', { name: remoteDevice.target_device, deviceType: deviceMapping, configured: isMonitoringConfigured, monitoringEnabled: remoteDevice.target_device_monitoring.enabled }, StorageType.SESSIONSTORAGE);
        } else if (deviceMapping == DeviceMapping.BARE_METAL_SERVER) {
          this.storage.put('device', { name: remoteDevice.target_device, deviceType: deviceMapping, configured: isMonitoringConfigured, uuid: remoteDevice.target_device_uuid }, StorageType.SESSIONSTORAGE);
        } else {
          this.storage.put('device', { name: remoteDevice.target_device, deviceType: deviceMapping, configured: isMonitoringConfigured }, StorageType.SESSIONSTORAGE);
          if (deviceMapping == DeviceMapping.MERAKI_DEVICE) {
            this.storage.put('meraki', { name: remoteDevice.target_account_name, deviceType: DeviceMapping.MERAKI_ACCOUNT }, StorageType.SESSIONSTORAGE);
            this.storage.put('merakiOrganization', { name: remoteDevice.target_organization_name, deviceType: DeviceMapping.MERAKI_ORG }, StorageType.SESSIONSTORAGE);
          } else if (deviceMapping == DeviceMapping.VIPTELA_DEVICE) {
            this.storage.put('viptela', { name: remoteDevice.target_account_name, deviceType: DeviceMapping.VIPTELA_ACCOUNT }, StorageType.SESSIONSTORAGE);
          }
        }
      }
      this.router.navigate([`${baseURL}${url}`]);
    });
  }

  getTooltipMsgForAddTargetDevice(inf: DeviceInterface): string {
    if (!inf.name && !inf.description) {
      return `Interface Name and Description are required`;
    } else if (!inf.name) {
      return `Interface Name is required`;
    } else if (!inf.description) {
      return `Interface Description is required`;
    } else {
      return `Add Target Device`;
    }
  }

  addTargetDevice(inf: InterfaceDetailsType) {
    this.interfaceCrudSvc.addTargetDeviceForInterface({ uuid: this.deviceId, deviceType: this.deviceType, name: inf.name, description: inf.description });
  }

  onCrud(event: { type: CRUDActionTypes }) {
    if (event.type == CRUDActionTypes.ADD) {
      this.syncInterfaceData();
    }
  }

  goToInterfaceDetails(interfaceId: string) {
    this.router.navigate(['interface-details', interfaceId], { relativeTo: this.route });
  }

  switchView(data: TabDirective): void {
    this.redfishInteg = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
    if (this.redfishInteg.redfish) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { HealthServer: data.id },
        queryParamsHandling: 'merge',
      });
    }
    if (this.view == data.id) {
      return;
    } else {
      setTimeout(() => {
        this.view = data.id;
        this.currentCriteria.pageNo = 1;
        this.hypervisorCurrentCriteria.pageNo = 1;
        this.databaseCurrentCriteria.pageNo = 1;
        if (this.view == 'events' && this.eventsFilterForm.getRawValue().period != this.eventsTimeRange.LAST_24_HOURS) {
          this.buildEventsFilterForm();
        } else if (this.view == 'tasks' && this.tasksFilterForm.getRawValue().period != this.tasksTimeRange.LAST_24_HOURS) {
          this.buildTasksFilterForm();
        }
      }, 10)
    }
    if (data.id == 'network') {
      this.networkTabSwitches = 'vswitches';
      this.switchNetworkView(this.networkTabSwitches);
    }
    if (data.id == 'storage') {
      this.selectedViewStorage = 'storageAdapters';
      this.getSelectedViewStorage(this.selectedViewStorage);
    }
    if (data.id == 'Fans') {
      this.getFans();
    }
    if (data.id == 'Power supplies') {
      this.getPowerSupply();
    }
    if (data.id == 'Chassis') {
      this.getChassis();
    }
    if (data.id == 'Temperatures') {
      this.getTemperature();
    }
    if (data.id == 'Voltages') {
      this.getVoltage();
    }
    if (data.id == 'Processors') {
      this.getProcessors();
    }
    if (data.id == 'Virtual disks') {
      this.getVirtualDisk();
    }
    if (data.id == 'Physical disks') {
      this.getPhysicalDisk();
    }
    if (data.id == 'Managers') {
      this.getManagers();
    }
    if (data.id == 'Enclosures') {
      this.getEnclosures();
    }
    if (data.id == 'Storage controllers') {
      this.getStorageControllers();
    }
    if (data.id == 'Batteries') {
      this.getBatteries();
    }
    if (data.id == 'databases') {
      this.getDatabasesList();
      this.getDeviceBulkEditFields();
    }
  }

  manageAPICallBasedOnView(view: string) {
    switch (view) {
      case 'interfaces':
        this.getInterfaceList();
        break;
      case 'services':
        this.getServicesList();
        break;
      case 'bgp_peers':
        this.getBGPPeersList();
        break;
      case 'events':
        this.getEvents();
        break;
      case 'tasks':
        this.getTasks();
        break;
      case 'system':
        this.getSystemFirewall();
        break;
      case 'network':
        this.switchNetworkView(this.networkTabSwitches);
        break;
      case 'storage':
        this.getSelectedViewStorage(this.selectedViewStorage);
        break;
      case 'tunnels':
        this.getTunnels();
        break;
      case 'tloc':
        this.getTLOC();
        break;
      case 'controlConnections':
        this.getControlConnections();
        break;
      case 'merakiLicense':
        this.getLicense();
        break;
      case 'merakiOrgNetwork':
        this.getMerakiNetwork();
        break;
      case 'merakiDeviceEvents':
        this.getMerakiDeviceEvents();
        break;
      case 'Fans':
        this.getFans();
        break;
      case 'Power supplies':
        this.getPowerSupply();
        break;
      case 'Chassis':
        this.getChassis();
        break;
      case 'Temperatures':
        this.getTemperature();
        break;
      case 'Voltages':
        this.getVoltage();
        break;
      case 'Processors':
        this.getProcessors();
        break;
      case 'Virtual disks':
        this.getVirtualDisk();
        break;
      case 'Physical disks':
        this.getPhysicalDisk();
        break;
      case 'Managers':
        this.getManagers();
        break;
      case 'Enclosures':
        this.getEnclosures();
        break;
      case 'Storage controllers':
        this.getStorageControllers();
        break;
      case 'Batteries':
        this.getBatteries();
        break;
      case 'databases':
        this.getDatabasesList();
        this.getDeviceBulkEditFields();
        break;
      default:
        break;
    }
  }

  getBGPPeersSummary() {
    this.svc.getBGPPeersSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceBGPPeersSummary = this.svc.convertToBGPPeersSummaryViewData(data);
    }, (err: HttpErrorResponse) => {
      this.deviceBGPPeersSummary = new BGPPeersSummaryViewData();
    })
  }

  getBGPPeersList() {
    this.svc.getBGPPeersList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceBGPPeers = data.results;
    }, (err: HttpErrorResponse) => {
      this.deviceBGPPeers = [];
    })
  }

  syncBGPPeersData() {
    this.svc.syncBGPPeersData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getBGPPeersSummary();
      this.getBGPPeersList();
    })
  }

  getBGPPeersByStatus(status: string) {
    this.spinner.start('deviceBGPPeerList');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.params[0].status = status;
    if (status) {
      this.selectedBgpPeerStatus = { label: status, value: this.deviceBGPPeersSummary ? this.deviceBGPPeersSummary[status] : 0 };
    } else {
      this.selectedBgpPeerStatus = null;
    }
    this.svc.getBGPPeersList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceBGPPeers = data.results;
      this.spinner.stop('deviceBGPPeerList');
    }, (err: HttpErrorResponse) => {
      this.deviceBGPPeers = [];
      this.spinner.stop('deviceBGPPeerList');
    })
  }

  getServicesList() {
    this.deviceServices = [];
    this.svc.getServices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceServices = this.svc.convertToServicesViewData(data.results);
    }, (err: HttpErrorResponse) => {
    });
  }

  getServicesSummary() {
    this.svc.getServicesSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceServicesSummary = this.svc.convertToServicesSummaryViewData(data);
    }, (err: HttpErrorResponse) => {
      this.deviceServicesSummary = new ServiceSummaryViewData();
    })
  }

  syncServicesData() {
    this.svc.syncGServicesData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getServicesSummary();
      this.getServicesList();
    });
  }

  getLicense() {
    this.svc.getLicenseData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.licenseViewDataCount = data.count;
      this.licenseViewData = this.svc.convertToLicenseViewData(data.results);
    });
  }

  getMerakiNetwork() {
    this.svc.getMerakiNetworkData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.merakiNetworkViewDataCount = data.count;
      this.merakiNetworkViewData = this.svc.convertToMerakiNetworkViewData(data.results);
    });
  }

  // getMerakiEvents(){
  //   this.svc.getMerakiEventsData(this.currentCriteria,this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
  //     this.licenseViewData = convertToMerakiEventsViewData(data);
  //   });
  // }

  getServicesByStatus(status: string) {
    this.spinner.start('ServicesSpinner');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.params[0].status = status;
    if (status) {
      this.selectedServiceStatus = { label: status, value: this.deviceServicesSummary ? this.deviceServicesSummary[status] : 0 };
    } else {
      this.selectedServiceStatus = null;
    }
    this.svc.getServices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceServices = this.svc.convertToServicesViewData(data.results);
      this.spinner.stop('ServicesSpinner');
    }, (err: HttpErrorResponse) => {
      this.deviceServices = [];
      this.spinner.stop('ServicesSpinner');
    })
  }

  buildEventsFilterForm() {
    this.eventsDateRange = this.svc.getDateRangeByPeriod(this.eventsTimeRange.LAST_24_HOURS);
    this.eventsFilterForm = this.svc.buildFilterForm(this.eventsDateRange);
    this.eventsFilterFormErrors = this.svc.resetFilterFormErrors();
    this.eventsFilterValidationMessages = this.svc.filterFormValidationMessages;

    this.eventsFilterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: TimeRange) => {
      if (val == this.eventsTimeRange.CUSTOM) {
        this.eventsFilterForm.get('from').enable({ emitEvent: false });
        this.eventsFilterForm.get('to').enable({ emitEvent: false });
      } else {
        this.eventsDateRange = this.svc.getDateRangeByPeriod(val);
        if (this.eventsDateRange) {
          this.eventsFilterForm.get('from').patchValue(new Date(this.eventsDateRange.from))
          this.eventsFilterForm.get('to').patchValue(new Date(this.eventsDateRange.to))
        }
        this.eventsFilterForm.get('from').disable({ emitEvent: false });
        this.eventsFilterForm.get('to').disable({ emitEvent: false });
      }
    });
    this.onEventsFilterFormSubmit();
  }

  getEvents() {
    this.spinner.start('EventsSpinner');
    this.svc.getEvents(this.currentCriteria, this.eventsFilterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceEventsCount = data.count;
      this.deviceEvents = this.svc.convertToEventsViewData(data.results);
      this.spinner.stop('EventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.deviceEvents = [];
      this.spinner.stop('EventsSpinner');
    })
  }

  onEventsFilterFormSubmit() {
    if (this.eventsFilterForm.invalid) {
      this.eventsFilterFormErrors = this.utilSvc.validateForm(this.eventsFilterForm, this.eventsFilterValidationMessages, this.eventsFilterFormErrors);
      this.eventsFilterForm.valueChanges
        .subscribe((data: any) => { this.eventsFilterFormErrors = this.utilSvc.validateForm(this.eventsFilterForm, this.eventsFilterValidationMessages, this.eventsFilterFormErrors); });
      return;
    } else {
      this.eventsFilterFormErrors = this.svc.resetFilterFormErrors();
      this.getEvents();
    }
  }

  syncEvents() {
    if (this.deviceEventsSyncInProgress) {
      return;
    }
    this.deviceEventsSyncInProgress = true;
    this.svc.syncEvents(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceEventsSyncInProgress = false;
      if (this.eventsFilterForm.valid) {
        this.getEvents();
      }
    }, (err: HttpErrorResponse) => {
      this.deviceEventsSyncInProgress = false;
    });
  }

  buildTasksFilterForm() {
    this.tasksDateRange = this.svc.getDateRangeByPeriod(this.tasksTimeRange.LAST_24_HOURS);
    this.tasksFilterForm = this.svc.buildFilterForm(this.tasksDateRange);
    this.tasksFilterFormErrors = this.svc.resetFilterFormErrors();
    this.tasksFilterValidationMessages = this.svc.filterFormValidationMessages;

    this.tasksFilterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: TimeRange) => {
      if (val == this.tasksTimeRange.CUSTOM) {
        this.tasksFilterForm.get('from').enable({ emitEvent: false });
        this.tasksFilterForm.get('to').enable({ emitEvent: false });
      } else {
        this.tasksDateRange = this.svc.getDateRangeByPeriod(val);
        if (this.tasksDateRange) {
          this.tasksFilterForm.get('from').patchValue(new Date(this.tasksDateRange.from))
          this.tasksFilterForm.get('to').patchValue(new Date(this.tasksDateRange.to))
        }
        this.tasksFilterForm.get('from').disable({ emitEvent: false });
        this.tasksFilterForm.get('to').disable({ emitEvent: false });
      }
    });
    this.onTasksFilterFormSubmit();
  }

  getTasks() {
    this.spinner.start('TasksSpinner');
    this.svc.getTasks(this.currentCriteria, this.tasksFilterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceTasksCount = data.count;
      this.deviceTasks = this.svc.convertToTasksViewData(data.results);
      this.spinner.stop('TasksSpinner');
    }, (err: HttpErrorResponse) => {
      this.deviceTasks = [];
      this.spinner.stop('TasksSpinner');
    })
  }

  syncTasks() {
    if (this.deviceTasksSyncInProgress) {
      return;
    }
    this.deviceTasksSyncInProgress = true;
    this.svc.syncTasks(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceTasksSyncInProgress = false;
      if (this.tasksFilterForm.valid) {
        this.getTasks();
      }
    }, (err: HttpErrorResponse) => {
      this.deviceTasksSyncInProgress = false;
    });
  }

  onTasksFilterFormSubmit() {
    if (this.tasksFilterForm.invalid) {
      this.tasksFilterFormErrors = this.utilSvc.validateForm(this.tasksFilterForm, this.tasksFilterValidationMessages, this.tasksFilterFormErrors);
      this.tasksFilterForm.valueChanges
        .subscribe((data: any) => { this.tasksFilterFormErrors = this.utilSvc.validateForm(this.tasksFilterForm, this.tasksFilterValidationMessages, this.tasksFilterFormErrors); });
      return;
    } else {
      this.tasksFilterFormErrors = this.svc.resetFilterFormErrors();
      this.getTasks();
    }
  }

  getSystemFirewall() {
    this.spinner.start('FireWallSpinner');
    this.svc.getSystemFirewall(this.hypervisorCurrentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.systemFirewallCount = data.count;
      this.systemFirewallViewData = this.svc.convertToSystemFirewallViewData(data.results);
      this.spinner.stop('FireWallSpinner');
    }, (err: HttpErrorResponse) => {
      this.deviceServices = [];
      this.spinner.stop('FireWallSpinner');
    })
  }

  switchNetworkView(networkTabName: string) {
    this.networkTabSwitches = networkTabName;
    if (networkTabName == 'vswitches') {
      this.spinner.start('NetworkSpinner');
      this.svc.getNetworkSwitches(this.hypervisorCurrentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.networkCountData = data.count;
        this.vSwitchesViewData = this.svc.convertToVSwitcheslViewData(data.results);
        this.spinner.stop('NetworkSpinner');
      }, (err: HttpErrorResponse) => {
        this.deviceServices = [];
        this.spinner.stop('NetworkSpinner');
      })
    } else if (networkTabName == 'vmKernelAdp') {
      this.svc.getVmKernelAdapters(this.hypervisorCurrentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.networkCountData = data.count;
        this.vmKernelAdapterViewData = this.svc.convertToVMKernelViewData(data.results);
        this.spinner.stop('NetworkSpinner');
      }, (err: HttpErrorResponse) => {
        this.deviceServices = [];
        this.spinner.stop('NetworkSpinner');
      })
    } else {
      this.svc.getPhysicalAdapters(this.hypervisorCurrentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.networkCountData = data.count;
        this.physicalAdapterViewData = this.svc.convertToPhysicalAdaptersViewData(data.results);
        this.spinner.stop('NetworkSpinner');
      }, (err: HttpErrorResponse) => {
        this.deviceServices = [];
        this.spinner.stop('NetworkSpinner');
      })
    }
  }

  getSelectedViewStorage(networkTabName: string) {
    this.selectedViewStorage = networkTabName;
    if (networkTabName == 'storageAdapters') {
      this.spinner.start('StorageSpinner');
      this.svc.getStorageAdapter(this.hypervisorCurrentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.storageAdapterViewDataCount = data.count;
        this.storageAdapterViewData = this.svc.convertToStorageAdaptersViewData(data.results);
        this.spinner.stop('StorageSpinner');
      }, (err: HttpErrorResponse) => {
        this.deviceServices = [];
        this.spinner.stop('StorageSpinner');
      })
    } else {
      this.spinner.start('StorageSpinner');
      this.svc.getStorageDevices(this.hypervisorCurrentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.storageAdapterViewDataCount = data.count;
        this.storageDevicesViewData = this.svc.convertToStorageDevicesViewData(data.results);
        this.spinner.stop('StorageSpinner');
      }, (err: HttpErrorResponse) => {
        this.deviceServices = [];
        this.spinner.stop('StorageSpinner');
      })
    }
  }

  getControlConnections() {
    // this.spinner.start('ControlConnectionSpinner');
    this.svc.getControlConnections(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.controlConnectionsViewDataCount = data?.count;
      this.controlConnectionsViewData = this.svc.convertToControlConnectionsViewData(data.results);
      // this.spinner.stop('StorageSpinner');
    }, (err: HttpErrorResponse) => {
      this.controlConnectionsViewData = [];
      // this.spinner.stop('ControlConnectionSpinner');
    })
  }

  getTunnels() {
    // this.spinner.start('ControlConnectionSpinner');
    this.svc.getTunnels(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tunnelViewDataCount = data?.count;
      this.tunnelViewData = this.svc.convertToTunnelViewData(data.results);
      // this.spinner.stop('StorageSpinner');
    }, (err: HttpErrorResponse) => {
      this.tunnelViewData = [];
      // this.spinner.stop('ControlConnectionSpinner');
    })
  }

  getTLOC() {
    // this.spinner.start('ControlConnectionSpinner');
    this.svc.getTLOC(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tlocViewDataCount = data?.count;
      this.tlocViewData = this.svc.convertToTLOCViewData(data.results);
      // this.spinner.stop('StorageSpinner');
    }, (err: HttpErrorResponse) => {
      this.tlocViewData = [];
      // this.spinner.stop('ControlConnectionSpinner');
    })
  }

  getMerakiDeviceEvents() {
    this.spinner.start('MerakiDeviceEventsSpinner');
    this.svc.getMerakiDeviceEvents(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.merakiDeviceEventsCount = data.count;
      this.merakiDeviceEventsViewData = this.svc.convertToMerakiDeviceEventViewData(data.results);
      this.spinner.stop('MerakiDeviceEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.merakiDeviceEventsViewData = [];
      this.spinner.stop('MerakiDeviceEventsSpinner');
    })
  }

  openInNewTab(view: any) {
    if (view.clientUrl) {
      window.open(view.clientUrl, '_blank');
    }
  }

  getFans() {
    this.spinner.start('FansEventsSpinner');
    this.svc.getFans(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.fansCount = data.count;
      this.fansViewData = this.svc.convertToFansViewData(data.results);
      this.spinner.stop('FansEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.fansViewData = [];
      this.spinner.stop('FansEventsSpinner');
    })
  }

  getPowerSupply() {
    this.spinner.start('PowerSupplyEventsSpinner');
    this.svc.getPowerSupplyData(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.powerSupplyCount = data.count;
      this.powerSupplyViewData = this.svc.convertToPowerSupplyViewData(data.results);
      this.spinner.stop('PowerSupplyEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.powerSupplyViewData = [];
      this.spinner.stop('PowerSupplyEventsSpinner');
    })
  }

  getChassis() {
    this.spinner.start('ChassisEventsSpinner');
    this.svc.getChassis(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.chassisCount = data.count;
      this.chassisViewData = this.svc.convertToChassisViewData(data.results);
      this.spinner.stop('ChassisEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.chassisViewData = [];
      this.spinner.stop('ChassisEventsSpinner');
    })
  }

  getTemperature() {
    this.spinner.start('TemperatureEventsSpinner');
    this.svc.getTemperature(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.temperatureCount = data.count;
      this.temperatureViewData = this.svc.convertToTemperatureViewData(data.results);
      this.spinner.stop('TemperatureEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.temperatureViewData = [];
      this.spinner.stop('TemperatureEventsSpinner');
    })
  }

  getVoltage() {
    this.spinner.start('VoltageEventsSpinner');
    this.svc.getSyncVoltages(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getVoltage(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.voltageCount = data.count;
        this.voltageViewData = this.svc.convertToVoltageViewData(data.results);
        this.spinner.stop('VoltageEventsSpinner');
      }, (err: HttpErrorResponse) => {
        this.voltageViewData = [];
        this.spinner.stop('VoltageEventsSpinner');
      })
    });
  }

  getProcessors() {
    this.spinner.start('ProcessorsEventsSpinner');
    this.svc.getProcessors(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.processorsCount = data.count;
      this.processorsViewData = this.svc.convertToProcessorsViewData(data.results);
      this.spinner.stop('ProcessorsEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.processorsViewData = [];
      this.spinner.stop('ProcessorsEventsSpinner');
    })
  }

  getVirtualDisk() {
    this.spinner.start('VirtualDiskEventsSpinner');
    this.svc.getVirtualDisk(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.virtualDiskCount = data.count;
      this.virtualDiskViewData = this.svc.convertToVirtualDiskViewData(data.results);
      this.spinner.stop('VirtualDiskEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.virtualDiskViewData = [];
      this.spinner.stop('VirtualDiskEventsSpinner');
    })
  }

  getPhysicalDisk() {
    this.spinner.start('PhysicalDiskEventsSpinner');
    this.svc.getPhysicalDisk(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.physicalDiskCount = data.count;
      this.physicalDiskViewData = this.svc.convertToPhysicalDiskViewData(data.results);
      this.spinner.stop('PhysicalDiskEventsSpinner');
    }, (err: HttpErrorResponse) => {
      this.physicalDiskViewData = [];
      this.spinner.stop('PhysicalDiskEventsSpinner');
    })
  }

  getManagers() {
    this.spinner.start('ManagersEventsSpinner');
    this.svc.getSyncManagers(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getmanagers(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.managersCount = data.count;
        this.managersViewData = this.svc.convertToManagersViewData(data.results);
        this.spinner.stop('ManagersEventsSpinner');
      }, (err: HttpErrorResponse) => {
        this.managersViewData = [];
        this.spinner.stop('ManagersEventsSpinner');
      });
    });
  }

  getEnclosures() {
    this.spinner.start('EnclosuresEventsSpinner');
    this.svc.getSyncEnclosures(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getEnclosures(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.enclosersCount = data.count;
        this.enclosersViewData = this.svc.convertToEnclosuresViewData(data.results);
        this.spinner.stop('EnclosuresEventsSpinner');
      }, (err: HttpErrorResponse) => {
        this.enclosersViewData = [];
        this.spinner.stop('EnclosuresEventsSpinner');
      })
    });
  }

  getStorageControllers() {
    this.spinner.start('StorageEventsSpinner');
    this.svc.getSyncStorageControllers(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getStorageControllers(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.storageControllersCount = data.count;
        this.storageControllersViewData = this.svc.convertToStorageControllersViewData(data.results);
        this.spinner.stop('StorageEventsSpinner');
      }, (err: HttpErrorResponse) => {
        this.storageControllersViewData = [];
        this.spinner.stop('StorageEventsSpinner');
      })
    });
  }

  getBatteries() {
    this.spinner.start('BatteriesEventsSpinner');
    this.svc.getSyncBatteries(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getBatteries(this.deviceType, this.deviceId, this.hypervisorCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.batteriesCount = data.count;
        this.batteriesViewData = this.svc.convertToBatteriesViewData(data.results);
        this.spinner.stop('BatteriesEventsSpinner');
      }, (err: HttpErrorResponse) => {
        this.batteriesViewData = [];
        this.spinner.stop('BatteriesEventsSpinner');
      })
    });
  }

  getDatabasesList() {
    this.spinner.start('DatabaseEventSpinner');
    this.svc.getDatabasesList(this.deviceType, this.deviceId, this.databaseCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databasesCount = res?.count;
      this.databasesViewData = this.svc.convertToDatabasesViewData(res?.results);
      this.spinner.stop('DatabaseEventSpinner');
    }, (err: HttpErrorResponse) => {
      this.batteriesViewData = [];
      this.spinner.stop('DatabaseEventSpinner');
    });
  }

  goToDatabaseDetails(view: DatabaseViewData) {
    this.storageService.put('db-device', { name: view.name, deviceType: DeviceMapping.DB_ENTITY }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['database_details', view.uuid], { relativeTo: this.route });
  }

  getDeviceBulkEditFields() {
    this.svc.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  select(view: DatabaseViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedDbEntityIds.splice(this.selectedDbEntityIds.indexOf(view.uuid), 1);
    } else {
      this.selectedDbEntityIds.push(view.uuid);
    }
    this.selectedAll = this.selectedDbEntityIds.length == this.databasesViewData.length;
  }

  selectAll() {
    if (!this.databasesViewData.length) {
      this.selectedAll = false;
      return;
    }

    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.databasesViewData.forEach(view => {
        view.isSelected = true;
        this.selectedDbEntityIds.push(view.uuid);
      });
    } else {
      this.databasesViewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedDbEntityIds = [];
    }
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.svc.deleteMultipleDBEntities(this.selectedDbEntityIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedDbEntityIds = [];
      this.selectedAll = false;
      this.refreshData();
      this.notification.success(new Notification('Device Deleted successfully'));
      this.spinner.stop('main');
    }, err => {
      this.databasesViewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedDbEntityIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  cancelButton() {
    this.modalRef.hide()
    this.databasesViewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedDbEntityIds = [];
    this.selectedAll = false;
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  submit(obj: Record<string, any>) {
    this.spinner.start('main');
    this.modalRef.hide();
    this.svc.updateMultipleDBEntities(this.selectedDbEntityIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedDbEntityIds = [];
      this.selectedAll = false;
      this.refreshData();
      this.notification.success(new Notification('Database Updated successfully'));
      this.spinner.stop('main');
    }, err => {
      this.databasesViewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedDbEntityIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinner.stop('main');
    });
  }
}
