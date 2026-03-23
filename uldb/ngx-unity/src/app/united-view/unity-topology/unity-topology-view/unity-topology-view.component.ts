import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { clone as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { UnityViewNetworkTopologyLink, UnityViewNetworkTopologyNode } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { Data, DataSet, Edge, Network, Node, Options } from 'vis-network/standalone';
import { UnityTopologyViewType } from '../unity-topology.service';
import { UnityTopologyoptionsService } from '../unity-topologyoptions.service';
import { UnityNetworkTopologyViewData, UnityNetworkTopologyViewType, UnityTopologyViewService } from './unity-topology-view.service';


@Component({
  selector: 'unity-topology-view',
  templateUrl: './unity-topology-view.component.html',
  styleUrls: ['./unity-topology-view.component.scss'],
  providers: [UnityTopologyViewService, UnityTopologyoptionsService]
})
export class UnityTopologyViewComponent implements OnInit, OnDestroy {
  @Input() viewType: UnityTopologyViewType;
  @Output() toggleShowMultiselect = new EventEmitter<{ show: boolean, dcId: string }>();
  private ngUnsubscribe = new Subject();

  networkViewData: UnityNetworkTopologyViewData = new UnityNetworkTopologyViewData();
  networkTopologyData: UnityNetworkTopologyViewData;
  isLayeredNetwork: boolean = true;
  showAllLayers: boolean = false;
  isCompleteNetwork: boolean = false;
  isNetworkStable: boolean = false;

  nodeDetailsRef: any;
  hoveredNode: UnityViewNetworkTopologyNode;
  showNodeInfo: boolean = false;
  selectedNode: UnityViewNetworkTopologyNode;
  selectedNodes: UnityViewNetworkTopologyNode[] = [];
  selectedActiveNodes: UnityViewNetworkTopologyNode[] = [];

  @ViewChild("visGraph", { static: true }) visGraph: ElementRef;
  network: Network;
  options: Options;
  private remInPx: number;
  constructor(private svc: UnityTopologyViewService,
    private optionService: UnityTopologyoptionsService,
    private router: Router,
    private renderer: Renderer2,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,) { }

  ngOnInit(): void {
    this.options = this.optionService.getOptions();
    setTimeout(() => {
      this.spinner.start('unity-topology');
      if (this.viewType.view == 'colocloud') {
        this.nodeDetailsRef = document.getElementById('dc-node-details-wrapper');
      } else {
        this.nodeDetailsRef = document.getElementById('pc-node-details-wrapper');
      }
    }, 0);
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.getDeviceNetwork();
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
    if (this.network && this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
  }

  refreshData() {
    this.spinner.start('unity-topology');
    this.getDeviceNetwork();
  }

  getDeviceNetwork() {
    this.svc.getDeviceNetwork(this.viewType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.destroyNetwork();
      let networkData: UnityNetworkTopologyViewData = this.svc.convertToViewData(res);
      if (networkData.nodes && networkData.nodes.length) {
        this.networkViewData = networkData;
        this.selectedNode = networkData.nodes[0];
        this.selectedNodes.push(networkData.nodes[0]);
        this.selectedActiveNodes.push(networkData.nodes[0]);
        this.drawNetwork();
      } else {
        setTimeout(() => {
          this.spinner.stop('unity-topology');
        }, 0)
      }
    }, err => {
      setTimeout(() => {
        this.spinner.stop('unity-topology');
      }, 0)
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  @HostListener('window:resize')
  setHeight() {
    const height = Math.floor(window.innerHeight) - Math.floor(this.visGraph.nativeElement.getBoundingClientRect().top) - Math.floor(this.remInPx);
    this.renderer.setStyle(this.visGraph.nativeElement, 'height', height + 'px');
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

  drawNetwork() {
    this.destroyNetwork();
    this.updateNetworkPhysics();
    this.network = new Network(this.visGraph.nativeElement, <Data>this.networkViewData.data, _clone(this.options));

    this.network.once('beforeDrawing', (r: CanvasRenderingContext2D) => {
      this.renderer.setStyle((<HTMLElement>this.visGraph.nativeElement).firstChild, 'outline', 'none');
      const nav = (<HTMLElement>(<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-navigation')[0]).getElementsByClassName('vis-button');
      for (let i = 0; i < nav.length; i++) {
        const element = nav[i];
        this.renderer.addClass(element, 'action-icons');
        this.renderer.addClass(element, 'fa');
      }
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomIn')[0], 'fa-plus-circle');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomIn')[0], 'mb-5');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomOut')[0], 'fa-minus-circle');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomOut')[0], 'mb-5');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'fa-life-ring');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'mb-5');
      this.renderer.setProperty((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'id', 'zoomExtendsBtn');
    });

    this.network.once('afterDrawing', (r: CanvasRenderingContext2D) => {
      this.setHeight();
      this.network.releaseNode();
      this.network.unselectAll();
      setTimeout(() => {
        this.network.fit({ animation: true });
      }, 500);
    });

    this.network.on('hoverNode', (elem: any) => {
      this.hoveredNode = this.networkViewData.nodes.find(n => n.uuid == elem.node);
      this.renderer.setStyle(this.nodeDetailsRef, "left", `${elem.pointer.DOM.x + 10}px`);
      this.renderer.setStyle(this.nodeDetailsRef, "top", `${elem.pointer.DOM.y - 20}px`);
      this.showNodeInfo = true;
    });

    this.network.on('blurNode', (elem: any) => {
      this.showNodeInfo = false;
    });

    this.network.on('dragStart', (elem: any) => {
      this.network.setOptions({
        physics: {
          enabled: false
        }
      });
    })

    this.network.on('selectNode', (elem: any) => {
      this.showNodeInfo = false;
      let node = this.networkViewData.nodes.find(n => n.uuid == elem.nodes[0]);
      if ((this.viewType.view == 'private_cloud' && node.device_type == 'colocloud') || node.uuid == this.selectedNode.uuid || this.isCompleteNetwork) {
        return;
      }
      this.selectedNode = _clone(node);
      switch (this.selectedNode.device_type) {
        case 'organization': this.viewType.node = 'org'; break;
        case 'colocloud': this.viewType.node = 'dc'; break;
        case 'private_cloud':
          this.viewType.node = 'pc';
          const fromNodeId = <string>this.network.getConnectedNodes(this.selectedNode.uuid, 'from')[0];
          this.selectedNodes.push(this.networkViewData.nodes.find(n => n.uuid == fromNodeId));
          break;
        default: this.viewType.node = 'device';
      }
      this.viewType.nodeId = this.selectedNode.uuid;
      this.getConnectedNetwork();
    });

    this.network.on('stabilized', (nwk: any) => {
      this.isNetworkStable = true;
      setTimeout(() => {
        this.spinner.stop('unity-topology');
      }, 200)
    });
  }

  getConnectedNetwork() {
    this.spinner.start('unity-topology');
    this.svc.getDeviceNetwork(_clone(this.viewType)).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let networkData: UnityNetworkTopologyViewData = this.svc.convertToViewData(res);
      if (networkData.nodes && networkData.nodes.length && networkData.nodes.length > 1) {
        this.destroyNetwork();
        this.selectedNodes.push(networkData.nodes.find(nd => nd.uuid == this.selectedNode.uuid));
        this.selectedActiveNodes.push(networkData.nodes.find(nd => nd.uuid == this.selectedNode.uuid));
        this.networkViewData = networkData;
        this.drawNetwork();
        if (this.viewType?.node) {
          if (this.viewType.node == 'dc') {
            this.toggleShowMultiselect.emit({ show: true, dcId: this.viewType.nodeId });
          }else{
            this.toggleShowMultiselect.emit({ show: false, dcId: this.viewType.nodeId });
          }
        }
      } else {
        this.notification.warning(new Notification(`No inventory available for selected ${this.selectedNode.displayType}`));
        setTimeout(() => {
          this.spinner.stop('unity-topology');
        }, 0)
      }
    }, err => {
      setTimeout(() => {
        this.spinner.stop('unity-topology');
      }, 0)
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  isActive(node: UnityViewNetworkTopologyNode) {
    if (node && this.selectedNode && node.uuid == this.selectedNode.uuid && !this.isCompleteNetwork) {
      return 'active';
    }
  }

  goToNodeTopology(node: UnityViewNetworkTopologyNode, index: number) {
    if (!this.isCompleteNetwork && index == this.selectedActiveNodes.length - 1) {
      return;
    }
    this.isCompleteNetwork = false;
    this.selectedNode = _clone(node);
    switch (this.selectedNode.device_type) {
      case 'organization': this.viewType.node = 'org'; break;
      case 'colocloud': this.viewType.node = 'dc'; break;
      case 'private_cloud': this.viewType.node = 'pc'; break;
      default: this.viewType.node = 'device';
    }
    this.viewType.nodeId = this.selectedNode.uuid;
    this.network.releaseNode();
    this.network.unselectAll();

    this.selectedActiveNodes.splice(index, (this.selectedActiveNodes.length - index));
    let selectedNodeIndex = this.selectedNodes.findIndex(n => n.uuid == node.uuid);
    this.selectedNodes.splice(selectedNodeIndex, (this.selectedNodes.length - selectedNodeIndex));
    this.getConnectedNetwork();
  }

  showNodeTreeTopology() {
    if (this.selectedActiveNodes.length <= 1) {
      this.changeView(this.viewType);
      return;
    }

    if (this.isCompleteNetwork) {
      this.networkViewData = this.networkTopologyData;
    }

    this.network.releaseNode();
    this.network.unselectAll();
    this.network.enableEditMode();

    let nodes = this.selectedNodes.filter(an => an.uuid != this.selectedNode.uuid);
    let edges: UnityViewNetworkTopologyLink[] = [];
    this.selectedNodes.map((n, index) => {
      if (index != (this.selectedNodes.length - 1)) {
        let edge: UnityViewNetworkTopologyLink = { source_uuid: this.selectedNodes[index].uuid, target_uuid: this.selectedNodes[index + 1].uuid };
        edges.push(edge);
      }
    })

    this.networkViewData.nodes = nodes.concat(this.networkViewData.nodes);
    this.networkViewData.nodes = this.networkViewData.nodes.filter((value, index, self) =>
      index === self.findIndex((t) => (t.uuid === value.uuid))
    )
    this.networkViewData.edges = edges.concat(this.networkViewData.edges);
    let nodesFinal = this.svc.getNodes(this.networkViewData.nodes);
    nodesFinal.map((n, index) => {
      if (index) {
        n.x = 50 * index;
        n.y = 50;
      }
    })
    this.networkViewData.nodeDataset = new DataSet<Node>(nodesFinal);
    this.networkViewData.edgeDataset = new DataSet<Edge>(this.svc.getEdges(this.networkViewData.edges));
    this.networkViewData.data = { nodes: this.networkViewData.nodeDataset, edges: this.networkViewData.edgeDataset };
    this.isCompleteNetwork = true;
    this.drawNetwork();
  }

  showCompleteTopology() {
    this.spinner.stop('unity-topology');
    this.ngUnsubscribe.next();
    this.showNodeInfo = false;
    this.isNetworkStable = false;
    this.isCompleteNetwork = true;
    this.getComplateNetwork();
  }

  getComplateNetwork() {
    this.spinner.start('unity-topology');
    let viewType = _clone(this.viewType);
    viewType.view = 'default';
    if (this.viewType.view == 'colocloud') {
      viewType.node = 'dc';
    } else {
      viewType.node = 'pc';
    }
    this.svc.getDeviceNetwork(_clone(viewType)).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let networkData: UnityNetworkTopologyViewData = this.svc.convertToViewData(res);
      if (networkData.nodes && networkData.nodes.length && networkData.nodes.length > 1) {
        this.networkTopologyData = _clone(this.networkViewData);
        this.destroyNetwork();
        this.networkViewData = networkData;
        this.drawNetwork();
      } else {
        this.notification.warning(new Notification(`No inventory available for selected ${this.selectedNode.displayType}`));
        setTimeout(() => {
          this.spinner.stop('unity-topology');
        }, 0)
      }
    }, err => {
      setTimeout(() => {
        this.spinner.stop('unity-topology');
      }, 0)
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  goTo(node: UnityViewNetworkTopologyNode) {
    if (!node.redirectLink) {
      return;
    }
    this.storageService.put('device', { name: node.name, deviceType: node.deviceMapping, configured: node.configured, os: node.os, uuid: node.uuid }, StorageType.SESSIONSTORAGE);
    this.router.navigate([node.redirectLink]);
  }

}
