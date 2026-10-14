import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { clone as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { UnityViewNetworkTopologyNode } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { UnityTopologyoptionsService } from 'src/app/united-view/unity-topology/unity-topologyoptions.service';
import { DataSet, Network, Options } from 'vis-network/standalone';
import { ServiceTopologyService } from '../service-topology.service';
import { AppCommonTopologyService, TopologyResponse, UnityNetworkTopologyViewData, UnityNetworkTopologyViewType } from './app-common-topology.service';
import { ConnectedNode, ConnectedNodesResponse, SmartscapeLane } from './app-common-topology.type';

@Component({
  selector: 'app-common-topology',
  templateUrl: './app-common-topology.component.html',
  styleUrls: ['./app-common-topology.component.scss'],
  providers: [AppCommonTopologyService, UnityTopologyoptionsService],
  encapsulation: ViewEncapsulation.None
})
export class AppCommonTopologyComponent implements OnInit, OnChanges, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  @Input() buId: string;
  @Input() appIds: string[];
  @Input() selectedView: string;
  @Input() selectedNodeStatus: string;
  @Input() isElongated: boolean = false;
  @Input() activeNodeId: string;
  @Output() statusSummaryChange = new EventEmitter<any>();
  @Output() nodeClicked = new EventEmitter<any>();

  @ViewChild('visGraphContainer', { static: true })
  visGraphContainer!: ElementRef;

  networkViewData: UnityNetworkTopologyViewData = new UnityNetworkTopologyViewData();
  networkTopologyData: UnityNetworkTopologyViewData;
  isLayeredNetwork: boolean = true;
  showAllLayers: boolean = false;
  isCompleteNetwork: boolean = false;
  isNetworkStable: boolean = false;
  showGraph: boolean = false;

  nodeDetailsRef: any;
  hoveredNode: any;
  showNodeInfo: boolean = false;
  viewDataList: UnityNetworkTopologyViewData[];
  selectedNode: UnityViewNetworkTopologyNode;
  selectedNodes: UnityViewNetworkTopologyNode[] = [];
  selectedActiveNodes: UnityViewNetworkTopologyNode[] = [];
  private nodeById = new Map<string, UnityViewNetworkTopologyNode>();
  private prevHighlightedNodeId: string | null = null;
  private networkNodesDataSet: DataSet<any> | null = null;

  networkViewDataList: UnityNetworkTopologyViewData[] = [];
  networks: Network[] = [];

  network: Network;
  options: Options;
  private remInPx: number;
  tooltipX = 0;
  tooltipY = 0;
  tooltipHovered: boolean = false;

  flattened: any;

  constructor(private svc: AppCommonTopologyService,
    private parentSvc: ServiceTopologyService,
    private optionService: UnityTopologyoptionsService,
    private router: Router,
    private renderer: Renderer2,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private refreshService: DataRefreshBtnService,
    private utilsvc: AppUtilityService,
    private cdr: ChangeDetectorRef) {
    this.options = this.optionService.getMediumViewOptions();
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    const shouldReload = changes.buId || changes.appIds || changes.selectedView;
    if (shouldReload && this.buId && this.appIds && this.selectedView) {
      this.getDeviceNetwork();
    }
    if (changes.isElongated && !changes.isElongated.firstChange) {
      setTimeout(() => {
        if (this.network) {
          if (this.activeNodeId && this.networkNodesDataSet?.get(this.activeNodeId)) {
            this.network.focus(this.activeNodeId, { scale: 1.15, animation: true });
          } else {
            this.network.fit({ animation: true });
          }
        }
      }, 380);
    }
    if (changes.activeNodeId) {
      this.highlightNodeOnGraph(this.activeNodeId);
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('unity-topology');
    this.destroyNetwork();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.nodeDetailsRef = null;
    this.selectedNode = null;
    this.selectedNodes = [];
    this.selectedActiveNodes = [];
    this.showNodeInfo = false;
    this.isCompleteNetwork = false;
  }

  changeView(view: UnityNetworkTopologyViewType) {
    this.selectedNode = null;
    this.selectedNodes = [];
    this.selectedActiveNodes = [];
    this.showNodeInfo = false;
    this.isNetworkStable = false;
    this.isCompleteNetwork = false;
    this.getDeviceNetwork();
  }

  destroyNetwork() {
    this.isNetworkStable = false;
    this.prevHighlightedNodeId = null;
    if (this.network && this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
    this.networkNodesDataSet = null;
  }

  refreshData() {
    this.getDeviceNetwork();
  }

  getDeviceNetwork() {
    this.spinner.start('unity-topology');
    this.svc.getDeviceNetwork(this.appIds, this.selectedView)?.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length == 0) {
        this.spinner.stop('unity-topology');
        this.showGraph = false;
        return;
      }
      this.showGraph = true;
      switch (this.selectedView) {
        case 'application':
          this.flattened = res.map(r => r.application).flat();
          break;
        case 'service':
          this.flattened = res.map(r => r.service).flat();
          break;
        case 'component':
          this.flattened = res.map(r => r.component).flat();
          break;
        case 'process':
          this.flattened = res.map(r => r.process).flat();
          break;
        case 'database':
          this.flattened = res.map(r => r.database).flat();
          break;
        case 'host':
          this.flattened = res.map(r => r.host).flat();
          break;
        case 'physical_layer':
          this.flattened = res.map(r => r.physical_layer).flat();
          break;
        default:
          console.log('no view selected');
      }

      this.statusSummaryChange.emit(this.flattened[0]?.status_summary);

      this.drawGraph();
    }, err => {
      this.spinner.stop('unity-topology');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  drawGraph() {
    let filteredResponse = this.flattened;
    switch (this.selectedNodeStatus) {
      case 'active':
        let activeNodes = this.flattened[0].nodes.filter((n: UnityViewNetworkTopologyNode) => Number(n.status) === 1);
        filteredResponse[0].nodes = _clone(activeNodes);
        break;
      case 'inactive':
        let inActiveNodes = this.flattened[0].nodes.filter((n: UnityViewNetworkTopologyNode) => Number(n.status) === 0);
        filteredResponse[0].nodes = _clone(inActiveNodes);
        break;
      case 'all':
        break;
    }

    this.viewDataList = this.svc.convertToViewData(filteredResponse);

    this.nodeById.clear();
    this.viewDataList.forEach(vd => vd.nodes.forEach(n => this.nodeById.set(n.uuid, n)));

    // 2. merge all networks into one
    const mergedData = this.mergeNetworks(this.viewDataList);

    // 3. cleanup old
    this.destroyNetwork();

    // 4. draw once
    const container = this.visGraphContainer.nativeElement;
    this.destroyNetwork();
    this.drawNetwork(container, mergedData);
    // this.updateNetworkPhysics();
    this.spinner.stop('unity-topology');
    if (this.activeNodeId) {
      this.highlightNodeOnGraph(this.activeNodeId);
    }
  }

  mergeNetworks(viewDataList: UnityNetworkTopologyViewData[]) {
    const allNodes: any[] = [];
    const allEdges: any[] = [];

    let clusterIndex = 0;
    const spacing = 600; // controls how far apart clusters are

    for (const vd of viewDataList) {
      const nodes = vd.nodeDataset.get();
      const edges = vd.edgeDataset.get();

      // Compute a grid offset (spread clusters in 2D instead of just X)
      const row = Math.floor(clusterIndex / 3);  // 3 clusters per row
      const col = clusterIndex % 3;
      const xOffset = col * spacing;
      const yOffset = row * spacing;

      nodes.forEach(n => {
        n.x = (n.x ?? 0) + xOffset;
        n.y = (n.y ?? 0) + yOffset;
        n.fixed = false; // let physics still arrange inside cluster
      });

      allNodes.push(...nodes);
      allEdges.push(...edges);

      clusterIndex++;
    }

    return {
      nodes: new DataSet(allNodes),
      edges: new DataSet(allEdges)
    };
  }


  @HostListener('window:resize')
  setHeight() {
  }

  updateNetworkPhysics() {
    let subOptions = this.optionService.getLayoutSubOptions(this.networkViewData.nodes.length);
    this.options.physics = subOptions.physics;
    this.options.layout = subOptions.layout;
    if (this.networkViewData.nodes.length > 500) {
      setTimeout(() => {
        this.network.stopSimulation();
        this.network.stabilize(20000);
      }, 15000)
    } else if (this.networkViewData.nodes.length > 100) {
      setTimeout(() => {
        this.network.stopSimulation();
        this.network.stabilize(20000);
      }, 7000)
    }
  }

  drawNetwork(container: HTMLElement, data: { nodes: DataSet<any>, edges: DataSet<any> }) {
    this.networkNodesDataSet = data.nodes;
    this.network = new Network(container, data, _clone(this.options));
    this.network?.fit({ animation: true });

    this.network.once('stabilized', (r: CanvasRenderingContext2D) => {
      // Remove outline from canvas
      this.network.setOptions({ physics: { enabled: false } });
      this.renderer.setStyle(container as HTMLElement, 'outline', 'none');

      // Style the navigation buttons
      const navigationContainer = container.querySelector('.vis-navigation') as HTMLElement;
      if (navigationContainer) {
        const buttons = navigationContainer.querySelectorAll('.vis-button');

        buttons.forEach((button: HTMLElement) => {
          this.renderer.addClass(button, 'action-icons');
          this.renderer.addClass(button, 'fa');
        });

        // Style specific buttons
        const zoomInBtn = container.querySelector('.vis-button.vis-zoomIn') as HTMLElement;
        const zoomOutBtn = container.querySelector('.vis-button.vis-zoomOut') as HTMLElement;
        const zoomFitBtn = container.querySelector('.vis-button.vis-zoomExtends') as HTMLElement;

        if (zoomInBtn) {
          this.renderer.addClass(zoomInBtn, 'fa-plus-circle');
          this.renderer.addClass(zoomInBtn, 'mb-2');
        }

        if (zoomFitBtn) {
          this.renderer.addClass(zoomFitBtn, 'fa-crosshairs');
          this.renderer.addClass(zoomFitBtn, 'mb-2');
          this.renderer.setProperty(zoomFitBtn, 'id', 'zoomExtendsBtn');
        }

        if (zoomOutBtn) {
          this.renderer.addClass(zoomOutBtn, 'fa-minus-circle');
          this.renderer.addClass(zoomOutBtn, 'mb-2');
        }

      }
    });
    this.network.on('hoverNode', (params: any) => {
      const hoveredNode = this.nodeById.get(params.node);
      if (!hoveredNode) return;

      this.hoveredNode = hoveredNode;
      this.showNodeInfo = true;

      setTimeout(() => {
        const tooltipElement = document.querySelector('.node-tooltip') as HTMLElement;
        if (!tooltipElement) return;
        const containerRect = this.visGraphContainer.nativeElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();

        let x = params.pointer.DOM.x + 12;
        let y = params.pointer.DOM.y - 12;

        // Adjust horizontal
        if (x + tooltipRect.width > containerRect.width) {
          x = containerRect.width - tooltipRect.width - 8;
        }
        if (x < 0) x = 0;

        // Adjust vertical
        if (y + tooltipRect.height > containerRect.height) {
          y = containerRect.height - tooltipRect.height - 8;
        }
        if (y < 0) y = 0;

        this.renderer.setStyle(tooltipElement, 'left', `${x}px`);
        this.renderer.setStyle(tooltipElement, 'top', `${y}px`);
        this.renderer.setStyle(tooltipElement, 'display', 'block');
      });
    });
    this.network.on('blurNode', () => {
      setTimeout(() => {
        if (!this.tooltipHovered) {
          this.showNodeInfo = false;
          this.hoveredNode = null;
        }
      }, 150);
    });

    this.network.on('dragStart', (elem: any) => {
      this.network.setOptions({
        physics: {
          enabled: false
        }
      });
    });

    this.network.on('click', (params: any) => {
      if (params.nodes && params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        const node = this.nodeById.get(clickedNodeId);
        if (node) {
          this.showNodeInfo = false;
          this.hoveredNode = null;
          this.highlightNodeOnGraph(clickedNodeId);
          const localInfo = this.getLocalConnections(clickedNodeId);
          this.nodeClicked.emit({ node, localNodes: localInfo.nodes, localLinks: localInfo.links });
        }
      }
    });
  }

  highlightNodeOnGraph(nodeId: string) {
    if (!this.network || !this.networkNodesDataSet) return;

    if (this.prevHighlightedNodeId && this.prevHighlightedNodeId !== nodeId) {
      const prevNode = this.networkNodesDataSet.get(this.prevHighlightedNodeId);
      if (prevNode) {
        this.networkNodesDataSet.update({
          id: this.prevHighlightedNodeId,
          shadow: false,
          size: 20,
          borderWidth: 1
        });
      }
    }

    if (!nodeId) {
      this.prevHighlightedNodeId = null;
      return;
    }

    const targetNode = this.networkNodesDataSet.get(nodeId);
    if (targetNode) {
      this.prevHighlightedNodeId = nodeId;
      this.networkNodesDataSet.update({
        id: nodeId,
        shadow: {
          enabled: true,
          color: '#007bff',
          size: 32,
          x: 0,
          y: 0
        },
        size: 32,
        borderWidth: 4,
        color: {
          border: '#007bff',
          background: '#e8f4fd',
          highlight: {
            border: '#0056b3',
            background: '#d0ebff'
          }
        }
      });

      try {
        this.network.focus(nodeId, {
          scale: 1.15,
          animation: {
            duration: 400,
            easingFunction: 'easeInOutQuad'
          }
        });
        this.network.selectNodes([nodeId]);
      } catch (e) { }
    }
  }

  getLocalConnections(nodeId: string): { nodes: any[]; links: any[] } {
    if (!this.flattened || !this.flattened[0]) {
      return { nodes: [], links: [] };
    }
    const allNodes: any[] = this.flattened[0].nodes || [];
    const allLinks: any[] = this.flattened[0].links || [];

    const nodeMap = new Map<string, any>();
    allNodes.forEach(n => {
      if (n && n.uuid) nodeMap.set(n.uuid, n);
    });

    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add(nodeId);

    const connectedLinks: any[] = [];
    const queue = [nodeId];
    let depth = 0;
    const maxDepth = 2;

    while (queue.length > 0 && depth < maxDepth) {
      const nextQueue: string[] = [];
      for (const currId of queue) {
        for (const link of allLinks) {
          const src = link.source_uuid || link.source;
          const tgt = link.target_uuid || link.target;
          if (src === currId && tgt && nodeMap.has(tgt)) {
            if (!connectedNodeIds.has(tgt)) {
              connectedNodeIds.add(tgt);
              nextQueue.push(tgt);
            }
            if (!connectedLinks.some(l => (l.source_uuid === src && l.target_uuid === tgt))) {
              connectedLinks.push({ source_uuid: src, target_uuid: tgt });
            }
          } else if (tgt === currId && src && nodeMap.has(src)) {
            if (!connectedNodeIds.has(src)) {
              connectedNodeIds.add(src);
              nextQueue.push(src);
            }
            if (!connectedLinks.some(l => (l.source_uuid === src && l.target_uuid === tgt))) {
              connectedLinks.push({ source_uuid: src, target_uuid: tgt });
            }
          }
        }
      }
      queue.length = 0;
      queue.push(...nextQueue);
      depth++;
    }

    const connectedNodes: any[] = [];
    connectedNodeIds.forEach(id => {
      const n = nodeMap.get(id);
      if (n) connectedNodes.push(n);
    });

    return { nodes: connectedNodes, links: connectedLinks };
  }

  isActive(node: UnityViewNetworkTopologyNode) {
    if (node && this.selectedNode && node.uuid == this.selectedNode.uuid && !this.isCompleteNetwork) {
      return 'active';
    }
  }

  goToApplication(hoveredNode: any) {
    if (this.selectedView == 'host' || this.selectedView == 'physical_layer') {
      let baseURL = this.getBaseURL(hoveredNode);
      let url = `/${hoveredNode.uuid}/zbx/details/`;
      let deviceMapping = this.utilsvc.getDeviceMappingByDeviceType(hoveredNode.device_type);
      this.router.navigateByUrl(baseURL).then(() => {
        if (baseURL.includes('devices') || baseURL.includes('datacenter')) {
          if (deviceMapping == DeviceMapping.DB_SERVER) {
            this.storageService.put('device', { name: hoveredNode.name, deviceType: deviceMapping, configured: true, monitoringEnabled: true }, StorageType.SESSIONSTORAGE);
          } else if (deviceMapping == DeviceMapping.BARE_METAL_SERVER) {
            this.storageService.put('device', { name: hoveredNode.name, deviceType: deviceMapping, configured: true, uuid: hoveredNode.uuid }, StorageType.SESSIONSTORAGE);
          } else {
            this.storageService.put('device', { name: hoveredNode.name, deviceType: deviceMapping, configured: true }, StorageType.SESSIONSTORAGE);
            if (deviceMapping == DeviceMapping.MERAKI_DEVICE) {
              this.storageService.put('meraki', { name: hoveredNode.name, deviceType: DeviceMapping.MERAKI_ACCOUNT }, StorageType.SESSIONSTORAGE);
              this.storageService.put('merakiOrganization', { name: hoveredNode.name, deviceType: DeviceMapping.MERAKI_ORG }, StorageType.SESSIONSTORAGE);
            } else if (deviceMapping == DeviceMapping.VIPTELA_DEVICE) {
              this.storageService.put('viptela', { name: hoveredNode.name, deviceType: DeviceMapping.VIPTELA_ACCOUNT }, StorageType.SESSIONSTORAGE);
            }
          }
        }
        this.router.navigate([`${baseURL}${url}`]);
      });
    } else {
      if (hoveredNode.type == 'application') {
        return;
      } else if (hoveredNode.type == 'service') {
        this.storageService.put('device', { name: hoveredNode.name, deviceType: "Application Devices", configured: true }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['/unitycloud/applications', hoveredNode.app_id, 'services', hoveredNode.monitored_id, 'details']);
      }
    }
  }

  getBaseURL(hoveredNode: any) {
    switch (hoveredNode.device_type) {
      case 'colocloud': return `unitycloud/datacenter/${hoveredNode.uuid}/cabinets`;
      case 'pccloud': return `unitycloud/pccloud/${hoveredNode.uuid}/summary`;
      case 'cabinet': return `unitycloud/datacenter/${hoveredNode.dc_uuid}/cabinets/${hoveredNode.uuid}/view`;
      case 'switch': return `/unitycloud/devices/switches`;
      case 'firewall': return `/unitycloud/devices/firewalls`;
      case 'load_balancer': return `/unitycloud/devices/loadbalancers`;
      case 'hypervisor': return `/unitycloud/devices/hypervisors`;
      case 'baremetal': return `/unitycloud/devices/bmservers`;
      case 'mac_device': return `/unitycloud/devices/macdevices`;
      case 'storage': return `/unitycloud/devices/storagedevices`;
      case 'pdu': return `unitycloud/datacenter/${hoveredNode.uuid}/pdus`;
      case 'database': return `/unitycloud/devices/databases`;
      case 'mobile': return `/unitycloud/devices/mobiledevices`;
      case 'vmware': return `/unitycloud/devices/vms/vmware`;
      case 'vcloud': return `/unitycloud/devices/vms/vcloud`;
      case 'open_stack': return `/unitycloud/devices/vms/openstack`;
      case 'esxi': return `/unitycloud/devices/vms/esxi`;
      case 'hyperv': return `/unitycloud/devices/vms/hyperv`;
      case 'proxmox': return `/unitycloud/devices/vms/proxmox/`;
      case 'g3_kvm': return `/unitycloud/devices/vms/g3kvm/`;
      case 'virtual_machine': return `/unitycloud/devices/vms/custom`;
      case 'instance': return `/unitycloud/devices/vms/aws`;
      case 'azurevirtualmachine': return `/unitycloud/devices/vms/azure/`;
      case 'gcpvirtualmachines': return `/unitycloud/devices/vms/gcp/`;
      case 'ocivirtualmachines': return `/unitycloud/devices/vms/oracle/`;
      case 'viptela_device': return `/unitycloud/devices/network-controllers/${hoveredNode.uuid}/viptela-components`;
      case 'meraki_device': return `/unitycloud/devices/network-controllers/cisco-meraki/${hoveredNode.uuid}/organizations/${hoveredNode.uuid}/devices`;
      default: return;
    }
  }

}
