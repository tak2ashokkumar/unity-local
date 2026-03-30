import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { jsonOutput, NtVerifyAndAuditStepService, UnityNetworkTopologyViewData } from './nt-verify-and-audit-step.service';
import { Subject } from 'rxjs';
import { NaciNetworkTopologyStepsService } from '../naci-network-topology-steps.service';
import { takeUntil } from 'rxjs/operators';
import { UnityViewNetworkTopologyNode } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { Data, Network, Options } from 'vis-network';
import { Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { clone as _clone } from 'lodash-es';
import { NaciCliCheckStepsService } from '../../naci-cli-check-steps/naci-cli-check-steps.service';

@Component({
  selector: 'nt-verify-and-audit-step',
  templateUrl: './nt-verify-and-audit-step.component.html',
  styleUrls: ['./nt-verify-and-audit-step.component.scss'],
  providers: [NtVerifyAndAuditStepService]
})
export class NtVerifyAndAuditStepComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input() chatResponse!: any;
  isVerifyAndAuditOpen: boolean = false;
  verifyAuditViewData: any;

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
  constructor(private svc: NtVerifyAndAuditStepService,
    private ntSvc: NaciNetworkTopologyStepsService,
    // private optionService: UnityTopologyoptionsService,
    private cliSvc: NaciCliCheckStepsService,
    private router: Router,
    private renderer: Renderer2,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,) {
    this.ntSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      this.isVerifyAndAuditOpen = StepName == 'verfiyAndAudit' ? !this.isVerifyAndAuditOpen : false;
    })
  }

  ngOnInit(): void {
    this.options = this.getInitialOptions();
    setTimeout(() => {
      this.spinner.start('unity-topology');
      this.nodeDetailsRef = document.getElementById('dc-node-details-wrapper');
    }, 0);
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.getDeviceNetwork();
  }

  getInitialOptions() {
    let options: Options = {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      edges: {
        width: 0.5,
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      physics: {
        barnesHut: {
          theta: 0.1,
          gravitationalConstant: -10000,
          avoidOverlap: 0.5,
          springConstant: 0.04,
        },
        stabilization: {
          fit: true
        },
      },
      layout: {
        randomSeed: 20,
        improvedLayout: true
      }
    }
    return options;
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

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage != 'Stage 1') {
      return;
    }
    this.toggleVerifyAndAuditAccordion();
    this.verifyAudit();
  }

  destroyNetwork() {
    this.isNetworkStable = false;
    if (this.network && this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
  }

  verifyAudit() {
    this.verifyAuditViewData = this.chatResponse.answer;
    // this.verifyAuditViewData = jsonOutput;
    // this.verifyAuditViewData = this.svc.convertToVerifyAndAuditViewData(this.chatResponse?.answer);
    // console.log(this.verifyAuditViewData, 'vf & avd')
    this.getDeviceNetwork();

  }

  refreshData() {
    this.spinner.start('unity-topology');
    this.getDeviceNetwork();
  }

  getDeviceNetwork() {
    this.destroyNetwork();
    let networkData: UnityNetworkTopologyViewData = this.svc.convertToViewData(this.verifyAuditViewData.data);
    if (networkData.nodes && networkData.nodes.length) {
      this.spinner.stop('unity-topology');
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
  }

  @HostListener('window:resize')
  setHeight() {
    const height = Math.floor(window.innerHeight) - Math.floor(this.visGraph.nativeElement.getBoundingClientRect().top) - Math.floor(this.remInPx);
    this.renderer.setStyle(this.visGraph.nativeElement, 'height', height + 'px');
  }

  updateNetworkPhysics() {
    let subOptions = this.getInitialLayoutSubOptions();
    // this.options.physics = subOptions.physics;
    // this.options.layout = subOptions.layout;
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

  getInitialLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 20,
        improvedLayout: true
      },
      physics: {
        barnesHut: {
          theta: 0.1,
          gravitationalConstant: -10000,
          avoidOverlap: 0.5,
          springConstant: 0.04,
          centralGravity: 0.1,
        },
        stabilization: {
          fit: true
        },
      }
    }
  }

  drawNetwork() {
    this.destroyNetwork();
    // this.updateNetworkPhysics();
    this.network = new Network(this.visGraph.nativeElement, <Data>this.networkViewData.data, _clone(this.options));
    this.handleStabilization();

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

    // this.network.on('selectNode', (elem: any) => {
    //   this.showNodeInfo = false;
    //   let node = this.networkViewData.nodes.find(n => n.uuid == elem.nodes[0]);
    //   if (node.uuid == this.selectedNode.uuid || this.isCompleteNetwork) {
    //     return;
    //   }
    //   this.selectedNode = _clone(node);
    //   switch (this.selectedNode.device_type) {
    //     case 'organization': this.viewType.node = 'org'; break;
    //     case 'colocloud': this.viewType.node = 'dc'; break;
    //     case 'private_cloud':
    //       this.viewType.node = 'pc';
    //       const fromNodeId = <string>this.network.getConnectedNodes(this.selectedNode.uuid, 'from')[0];
    //       this.selectedNodes.push(this.networkViewData.nodes.find(n => n.uuid == fromNodeId));
    //       break;
    //     default: this.viewType.node = 'device';
    //   }
    //   this.viewType.nodeId = this.selectedNode.uuid;
    //   this.getConnectedNetwork();
    // });

    this.network.on('stabilized', (nwk: any) => {
      this.isNetworkStable = true;
      setTimeout(() => {
        this.spinner.stop('unity-topology');
      }, 200)
    });
  }

  handleStabilization() {
    const nodeCount = this.networkViewData.nodes.length;
    this.network.setOptions({
      physics: {
        stabilization: {
          enabled: true,
          iterations: nodeCount > 200 ? 1000 : 300,
          updateInterval: 25
        }
      }
    });
    this.network.stabilize();
    this.network.once('stabilized', () => {
      this.network.setOptions({
        physics: false
      });
      this.network.fit({ animation: true });
      this.spinner.stop('unity-topology');
    });
  }



  toggleVerifyAndAuditAccordion() {
    if (!this.isVerifyAndAuditOpen) {
      this.cliSvc.toggle('');
    }
    this.ntSvc.toggle('verfiyAndAudit');
  }

}
