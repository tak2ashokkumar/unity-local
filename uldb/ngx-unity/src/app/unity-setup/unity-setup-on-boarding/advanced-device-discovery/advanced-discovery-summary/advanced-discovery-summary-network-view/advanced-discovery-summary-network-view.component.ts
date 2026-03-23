import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { clone as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnityDeviceNetworkNode, UnityNetworkTopology } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { Data, Network, Options } from 'vis-network/standalone';
import { AdvancedDiscoverySummaryNetworkViewService, DeviceDiscoveryNetworkViewdata } from './advanced-discovery-summary-network-view.service';


@Component({
  selector: 'advanced-discovery-summary-network-view',
  templateUrl: './advanced-discovery-summary-network-view.component.html',
  styleUrls: ['./advanced-discovery-summary-network-view.component.scss'],
  providers: [AdvancedDiscoverySummaryNetworkViewService]
})
export class AdvancedDiscoverySummaryNetworkViewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  networkViewData: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
  networkViewDataCopy: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
  selectedNode: UnityDeviceNetworkNode;
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
      dragNodes: false,
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

  constructor(private networkService: AdvancedDiscoverySummaryNetworkViewService,
    private renderer: Renderer2,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService, ) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start('summary-network');
    }, 0)
    this.nodeTitleElem = document.getElementById('node-title-wrapper');
    this.deviceInfoElem = document.getElementById('device-details-wrapper');
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.getDeviceNetwork();
  }

  ngOnDestroy() {
    this.spinner.stop('summary-network');
    this.destroyNetwork();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  destroyNetwork() {
    this.showNodeInfo = false;
    this.closeDeviceData();
    if (this.network && this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
  }

  refreshData() {
    this.spinner.start('summary-network');
    this.getDeviceNetwork();
  }

  getDeviceNetwork() {
    this.networkService.getDeviceNetwork().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleNetworkData(_clone(res));
    }, err => {
      setTimeout(() => {
        this.spinner.stop('summary-network');
      }, 0)
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  handleNetworkData(res: UnityNetworkTopology[]) {
    this.destroyNetwork();
    if (res && !Array.isArray(res)) {
      let temp = [];
      temp.push(res);
      res = temp;
    }
    let networkData: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
    if (res.length) {
      networkData = this.networkService.convertToNetworkViewdata(res);
    }
    if (networkData.nodes.length) {
      this.renderer.setStyle(this.visGraph.nativeElement, 'min-height', networkData.nodes.length > 15 ? `calc(100vh - 150px)` : `40vh`);
      this.networkViewData = networkData;
      this.drawNetwork();
    } else {
      setTimeout(() => {
        this.spinner.stop('summary-network');
      }, 0)
    }
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
      this.selectedNode = this.networkViewData.nodes.find(n => n.id == elem.node);
      if (!this.deviceInfoModalRef) {
      this.renderer.setStyle(this.nodeTitleElem, "left", `${elem.pointer.DOM.x + 10}px`);
      this.renderer.setStyle(this.nodeTitleElem, "top", `${elem.pointer.DOM.y + 10}px`);
        this.showNodeInfo = true;
      }
    });

    this.network.on('blurNode', (elem: any) => {
      this.showNodeInfo = false;
    });

    this.network.on('stabilized', () => {
      setTimeout(() => {
        this.spinner.stop('summary-network');
      }, 1000)
    })
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

  filterNodes(filter: string) {
    this.spinner.start('summary-network');
    this.destroyNetwork();
    this.networkViewData = this.networkService.getFilterNetworkData(_clone(this.networkViewData), filter);
    setTimeout(() => {
      this.drawNetwork();
      this.spinner.stop('summary-network');
    }, 100);
  }

}
