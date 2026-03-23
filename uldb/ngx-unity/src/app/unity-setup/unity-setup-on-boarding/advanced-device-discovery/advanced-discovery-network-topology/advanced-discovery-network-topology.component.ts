import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { clone as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Data, Network, Options } from 'vis-network/standalone';
import { AdvancedDiscoveryNetworkTopologyService, DeviceDiscoveryNetworkViewdata } from './advanced-discovery-network-topology.service';
import { AdvancedDiscoveryTopology, AdvancedDiscoveryTopologyNode } from './advanced-discovery-network-topology.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';

@Component({
  selector: 'advanced-discovery-network-topology',
  templateUrl: './advanced-discovery-network-topology.component.html',
  styleUrls: ['./advanced-discovery-network-topology.component.scss'],
  providers: [AdvancedDiscoveryNetworkTopologyService]

})
export class AdvancedDiscoveryNetworkTopologyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  discoveryId: string;
  isSummaryNetwork: boolean = false;

  networkViewData: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
  networkViewDataCopy: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
  hoveredNode: AdvancedDiscoveryTopologyNode;
  @ViewChild("visGraph", { static: true }) visGraph: ElementRef;
  @ViewChild("nodeTitleRef") nodeTitle: ElementRef;
  network: Network;
  private remInPx: number;
  options: Options = {
    width: '100%',
    height: '100%',
    layout: { randomSeed: 2 },
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
      enabled: true,
      barnesHut: {
        gravitationalConstant: -5000,
        avoidOverlap: 0.3,
      },
      stabilization: {
        fit: true
      },
    },
  }
  nodeTitleElem: any;
  showNodeInfo: boolean = false;
  deviceInfoElem: any;
  @ViewChild("deviceInfoRef") deviceInfoRef: ElementRef;
  deviceInfoModalRef: BsModalRef;

  constructor(private networkService: AdvancedDiscoveryNetworkTopologyService,
    private discoverySvc: AdvancedDeviceDiscoveryService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.discoveryId = params.get('discoveryId');
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start('topology');
    }, 0)
    this.nodeTitleElem = document.getElementById('node-title-wrapper');
    this.deviceInfoElem = document.getElementById('device-details-wrapper');
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (!this.discoveryId) {
      this.isSummaryNetwork = true;
      this.discoveryId = this.discoverySvc.getSelectedDiscoveryId();
    }
    console.log('this.discoveryId : ', this.discoveryId);
    this.getDeviceNetwork();
  }

  ngOnDestroy() {
    this.spinner.stop('topology');
    this.destroyNetwork();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  destroyNetwork() {
    if (this.network && this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
    this.showNodeInfo = false;
    this.closeDeviceData();
  }

  refreshData() {
    this.spinner.start('topology');
    this.getDeviceNetwork();
  }

  handleNetworkData(res: AdvancedDiscoveryTopology) {
    this.destroyNetwork();
    let networkData: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
    networkData = this.networkService.convertToNetworkViewdata(res, this.discoveryId);
    console.log('networkData : ', networkData);
    if (networkData && networkData.nodes.length) {
      this.renderer.setStyle(this.visGraph.nativeElement, 'min-height', networkData.nodes.length > 20 ? `calc(100vh - 150px)` : `${networkData.nodes.length + 10}vh`);
      this.networkViewData = networkData;
      this.drawNetwork();
    } else {
      setTimeout(() => {
        this.spinner.stop('topology');
      }, 0)
    }
  }

  getDeviceNetwork() {
    this.networkService.getDeviceNetwork(this.discoveryId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleNetworkData(_clone(res));
    }, err => {
      setTimeout(() => {
        this.spinner.stop('topology');
      }, 0)
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  drawNetwork() {
    this.destroyNetwork();
    this.network = new Network(this.visGraph.nativeElement, <Data>this.networkViewData.data, this.options);
    this.network.once('beforeDrawing', (r: CanvasRenderingContext2D) => {
      this.renderer.setStyle((<HTMLElement>this.visGraph.nativeElement).firstChild, 'outline', 'none');
      const nav = (<HTMLElement>(<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-navigation')[0]).getElementsByClassName('vis-button');
      for (let i = 0; i < nav.length; i++) {
        const element = nav[i];
        this.renderer.addClass(element, 'action-icons');
        this.renderer.addClass(element, 'fa');
      }
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomIn')[0], 'fa-plus-circle');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomOut')[0], 'fa-minus-circle');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'fa-life-ring');
      this.renderer.setProperty((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'id', 'zoomExtendsBtn');
    });

    this.network.once('afterDrawing', (r: CanvasRenderingContext2D) => {
      this.setHeight();
      setTimeout(() => {
        this.network.fit({ animation: true })
      }, 500);
    });

    this.network.on('hoverNode', (elem: any) => {
      this.hoveredNode = this.networkViewData.nodes.find(n => n.id == elem.node);
      if (!this.deviceInfoModalRef) {
        this.renderer.setStyle(this.nodeTitleElem, "left", `${elem.pointer.DOM.x + 10}px`);
        this.renderer.setStyle(this.nodeTitleElem, "top", `${elem.pointer.DOM.y - 20}px`);
        this.showNodeInfo = true;
      }
    });

    this.network.on('blurNode', (elem: any) => {
      this.showNodeInfo = false;
    });

    this.network.on('stabilized', () => {
      setTimeout(() => {
        this.spinner.stop('topology');
      }, 1000)
    })
  }

  manageNetwork() {
    this.destroyNetwork();
    setTimeout(() => {
      this.drawNetwork();
    }, 100);
  }

  @HostListener('window:resize')
  setHeight() {
    const height = Math.floor(window.innerHeight) - Math.floor(this.visGraph.nativeElement.getBoundingClientRect().top) - (Math.floor(this.remInPx) * 5);
    this.renderer.setStyle(this.visGraph.nativeElement, 'height', height + 'px');
  }

  viewDeviceData() {
    this.showNodeInfo = false;
    this.deviceInfoModalRef = this.modalService.show(this.deviceInfoRef, Object.assign({}, { class: 'm-0 topology-modal', keyboard: true, ignoreBackdropClick: true }));
    this.renderer.setStyle(<HTMLElement>document.getElementsByTagName('modal-container')[0], 'left', '65%');
    this.renderer.setStyle(<HTMLElement>document.getElementsByTagName('modal-container')[0], 'top', '10%');
    this.renderer.removeClass(<HTMLElement>document.getElementsByTagName('bs-modal-backdrop')[0], 'modal-backdrop');
  }

  closeDeviceData() {
    if (this.deviceInfoModalRef) {
      this.deviceInfoModalRef.hide();
      this.deviceInfoModalRef = null;
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
