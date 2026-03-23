import { Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { UnityAzureTopologyViewData, UnityAzureTopologyViewService } from './unity-azure-topology-view.service';
import { UnityTopologyoptionsService } from '../unity-topologyoptions.service';
import { UnityTopologyViewType } from '../unity-topology.service';
import { Subject } from 'rxjs';
import { AzureAccountResource } from 'src/app/shared/SharedEntityTypes/azure.type';
import { Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Data, DataSet, Edge, Network, Node, Options } from 'vis-network/standalone';
import { clone as _clone } from 'lodash-es';

@Component({
  selector: 'unity-azure-topology-view',
  templateUrl: './unity-azure-topology-view.component.html',
  styleUrls: ['./unity-azure-topology-view.component.scss'],
  providers: [UnityAzureTopologyViewService, UnityTopologyoptionsService]
})
export class UnityAzureTopologyViewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() viewType: UnityTopologyViewType;
  private ngUnsubscribe = new Subject();

  networkViewData: UnityAzureTopologyViewData = new UnityAzureTopologyViewData();
  networkTopologyData: UnityAzureTopologyViewData;
  isLayeredNetwork: boolean = true;
  showAllLayers: boolean = false;
  isCompleteNetwork: boolean = false;
  isNetworkStable: boolean = false;

  nodeDetailsRef: any;
  hoveredNode: AzureAccountResource;
  showNodeInfo: boolean = false;
  selectedNode: AzureAccountResource;
  selectedNodes: AzureAccountResource[] = [];
  selectedActiveNodes: AzureAccountResource[] = [];

  @ViewChild("visGraph", { static: true }) visGraph: ElementRef;
  network: Network;
  options: Options;
  private remInPx: number;

  constructor(private svc: UnityAzureTopologyViewService,
    private optionService: UnityTopologyoptionsService,
    private router: Router,
    private renderer: Renderer2,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,) { }

  ngOnInit(): void {
    this.options = this.optionService.getOptions();
    this.nodeDetailsRef = document.getElementById('azure-node-details-wrapper');
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (!this.viewType.nodeId) {
      return;
    }
    setTimeout(() => {
      this.spinner.start('unity-topology');
    }, 0);
    this.getDeviceNetwork();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.viewType?.firstChange) {
      if (!changes?.viewType?.currentValue?.nodeId) {
        return;
      }
      this.spinner.stop('unity-topology');
      this.ngUnsubscribe.next();
      this.viewType = changes?.viewType?.currentValue;
      this.spinner.start('unity-topology');
      this.getDeviceNetwork();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('unity-topology');
    this.destroyNetwork();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    this.svc.getDeviceNetwork(this.viewType.nodeId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.destroyNetwork();
      let networkData: UnityAzureTopologyViewData = this.svc.convertToViewData(res);
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

  drawNetwork() {
    this.destroyNetwork();
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

    this.network.on('stabilized', (nwk: any) => {
      this.isNetworkStable = true;
      setTimeout(() => {
        this.spinner.stop('unity-topology');
      }, 200)
    });
  }

}
