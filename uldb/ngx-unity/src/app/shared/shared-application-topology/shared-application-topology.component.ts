import { Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { clone as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { Data, Network, Options } from 'vis-network';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { ApplicationNetworkTopology, ApplicationNetworkTopologyNode } from '../SharedEntityTypes/unity-application-topology.type';
import { UnityAplicationTopologyViewData, UnityApplicationTopologyConfigService } from '../unity-application-topology-config.service';


@Component({
  selector: 'shared-application-topology',
  templateUrl: './shared-application-topology.component.html',
  styleUrls: ['./shared-application-topology.component.scss']
})
export class SharedApplicationTopologyComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe = new Subject()
  @Input() data: ApplicationNetworkTopology;

  @ViewChild("visGraph", { static: true }) visGraph: ElementRef;
  network: Network;
  options: Options;
  isNetworkStable: boolean = false;
  private remInPx: number;
  networkViewData: UnityAplicationTopologyViewData = new UnityAplicationTopologyViewData();
  nodeDetailsRef: any;
  hoveredNode: ApplicationNetworkTopologyNode;
  showNodeInfo: boolean = false;
  constructor(private svc: UnityApplicationTopologyConfigService,
    private spinner: AppSpinnerService,
    private renderer: Renderer2,) {
    this.nodeDetailsRef = document.getElementById('node-details-wrapper');
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.start('topologyLoader');
    }, 0)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data) {
      let networkData = this.svc.convertToViewData(this.data);
      if (networkData.nodes && networkData.nodes.length) {
        this.options = Object.assign({}, this.svc.getOptions(networkData.nodes.length));
        this.networkViewData = networkData;
        console.log('networkViewData : ', this.networkViewData.data);
        this.drawNetwork();
      } else {
        setTimeout(() => {
          this.spinner.stop('topologyLoader');
        }, 0)
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyNetwork();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  destroyNetwork() {
    this.nodeDetailsRef = null;
    this.hoveredNode = null;
    this.showNodeInfo = false;
    this.isNetworkStable = false;
    if (this.network && this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
  }

  @HostListener('window:resize')
  setHeight() {
    const height = Math.floor(window.innerHeight) - Math.floor(this.visGraph.nativeElement.parentElement.getBoundingClientRect().top);
    // console.log('window.innerHeight : ', window.innerHeight);
    // console.log('this.visGraph.nativeElement.parentElement.getBoundingClientRect().top : ', this.visGraph.nativeElement.parentElement.getBoundingClientRect().top);
    // console.log('this.remInPx : ', this.remInPx);
    
    // console.log('height : ', height);
    if (height > 250) {
      this.renderer.setStyle(this.visGraph.nativeElement, 'height', '250px');
    } else {
      this.renderer.setStyle(this.visGraph.nativeElement, 'height', height + 'px');
    }
  }

  drawNetwork() {
    this.destroyNetwork();
    this.network = new Network(this.visGraph.nativeElement, <Data>this.networkViewData.data, _clone(this.options));
    this.nodeDetailsRef = document.getElementById('node-details-wrapper');

    this.network.once('beforeDrawing', (r: CanvasRenderingContext2D) => {
      this.renderer.setStyle((<HTMLElement>this.visGraph.nativeElement).firstChild, 'outline', 'none');
      const nav = (<HTMLElement>(<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-navigation')[0]).getElementsByClassName('vis-button');
      for (let i = 0; i < nav.length; i++) {
        const element = nav[i];
        this.renderer.addClass(element, 'action-icons');
        this.renderer.addClass(element, 'fa');
      }
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomIn')[0], 'fa-plus-circle');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomIn')[0], 'mb-2');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomOut')[0], 'fa-minus-circle');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomOut')[0], 'mb-2');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'fa-life-ring');
      this.renderer.addClass((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'mb-2');
      this.renderer.setProperty((<HTMLElement>this.visGraph.nativeElement).getElementsByClassName('vis-button vis-zoomExtends')[0], 'id', 'zoomExtendsBtn');
    });

    this.network.once('afterDrawing', (r: CanvasRenderingContext2D) => {
      this.network.releaseNode();
      this.network.unselectAll();
      setTimeout(() => {
        this.setHeight();
        this.network.fit({ animation: true });
        this.spinner.stop('topologyLoader');
      }, 100);
    });

    this.network.on('hoverNode', (elem: any) => {
      this.hoveredNode = this.networkViewData.nodes.find(n => n.uuid == elem.node);
      this.renderer.setStyle(this.nodeDetailsRef, "left", `${elem.pointer.DOM.x + 10}px`);
      this.renderer.setStyle(this.nodeDetailsRef, "top", `${elem.pointer.DOM.y + 25}px`);
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

    this.network.on('stabilized', (nwk: any) => {
      setTimeout(() => {
        this.spinner.stop('topologyLoader');
      }, 500)
    });
  }

}
