import { Component, OnInit, ElementRef, ViewChild, Renderer2, HostListener, OnDestroy } from '@angular/core';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { IstioVisNetworkService } from './istio-vis-network.service';
import { DataSet, Node, Edge, Data, Network, Options } from 'vis-network/standalone';
import { Id } from 'vis-data/declarations/data-interface';
import { DevicePopoverData } from 'src/app/united-cloud/shared/devices-popover/device-popover-data';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'istio-vis-network',
  templateUrl: './istio-vis-network.component.html',
  styleUrls: ['./istio-vis-network.component.scss'],
  providers: [IstioVisNetworkService]
})
export class IstioVisNetworkComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  accountId: string;
  gateway: string;
  namespace: string;

  @ViewChild("visGraph", { static: true }) visGraph: ElementRef;
  @ViewChild("hostHeight") hostHeight: ElementRef;

  @ViewChild("popTemplate") popTemplate: ElementRef;
  @ViewChild("test") test: ElementRef;
  @ViewChild("visPop") visPop: PopoverDirective;
  private remInPx: number;

  popOverData: DevicePopoverData;
  notEnabled: string = 'Monitoring not enabled';
  dateFormat: string = environment.unityDateFormat;
  nodes: DataSet<Node> = null;
  edges: DataSet<Edge> = null;
  data: Data = null;

  network: Network;
  constructor(private renderer: Renderer2,
    public userInfo: UserInfoService,
    private router: Router,
    private route: ActivatedRoute,
    private visService: IstioVisNetworkService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('meshId');
      this.namespace = params.get('namespace');
      this.gateway = params.get('gateway');
    });
  }


  options: Options = {
    layout: {
      hierarchical: {
        // enabled: true,
        sortMethod: 'directed',
        direction: 'UD'
      }
    },
    edges: {
      arrows: "to",
      smooth: false
    },
    nodes: {
      shape: 'box'
    },
    interaction: {
      dragNodes: false,
      hover: true,
      hoverConnectedEdges: false,
      navigationButtons: true,
      zoomView: false
    },
    physics: {
      enabled: true,
      hierarchicalRepulsion: {
        avoidOverlap: 1
      },
      wind: { x: 0, y: 0 }
    }
  };

  ngOnInit() {
    this.spinner.start('main');
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    setTimeout(() => {
      this.setHeight();
      this.getNodes();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getNodes() {
    this.visService.getNetworkData(this.accountId, this.namespace, this.gateway).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.nodes = new DataSet<Node>(this.visService.convertToNodeViewData(res.nodes));
      this.edges = new DataSet<Edge>(this.visService.convertToEdgeViewData(res.edges));
      this.data = { nodes: this.nodes, edges: this.edges };
        this.drawNetwork();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again'));
    });
  }

  drawNetwork() {
    this.network = new Network(this.visGraph.nativeElement, this.data, this.options);
    this.network.once('afterDrawing', (r: CanvasRenderingContext2D) => {
      this.setHeight();
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
    });
    // this.network.on('hoverNode', this.toggleTooltip.bind(this));
    // this.network.on('blurNode', this.toggleTooltip.bind(this));
  }

  toggleTooltip(p) {
    if (this.visPop.isOpen) {
      this.visPop.hide();
      this.popOverData = null;
    } else {
      this.popOverData = { "uptime": "24799562", "lastreboot": "1567584205000", "status": "1" };
      const pos = this.network.canvasToDOM(this.network.getPosition(<Id>p.node));
      const y = this.remInPx + pos.y;
      const x = this.remInPx + pos.x;
      this.renderer.setStyle(this.test.nativeElement, 'top', y + 'px');
      this.renderer.setStyle(this.test.nativeElement, 'left', x + 'px');
      this.visPop.show();
    }
  }

  @HostListener('window:resize')
  setHeight() {
    const height = Math.floor(window.innerHeight) - Math.floor(this.visGraph.nativeElement.getBoundingClientRect().top) - (Math.floor(this.remInPx) * 3);
    this.renderer.setStyle(this.visGraph.nativeElement, 'height', height + 'px');
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
}
