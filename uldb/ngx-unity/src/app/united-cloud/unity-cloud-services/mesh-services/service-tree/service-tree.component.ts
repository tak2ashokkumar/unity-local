import { Component, OnInit, ElementRef, ViewChild, Renderer2, HostListener, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { DataSet, Node, Edge, Data, Network, Options, DataSetNodes } from 'vis-network/standalone';
import { Id } from 'vis-data/declarations/data-interface';
import { DevicePopoverData } from 'src/app/united-cloud/shared/devices-popover/device-popover-data';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'service-tree',
  templateUrl: './service-tree.component.html',
  styleUrls: ['./service-tree.component.scss']
})
export class ServiceTreeComponent implements OnInit {
  @ViewChild("visGraph", { static: true }) visGraph: ElementRef;
  @ViewChild("hostHeight") hostHeight: ElementRef;

  @ViewChild("popTemplate") popTemplate: ElementRef;
  @ViewChild("test") test: ElementRef;
  @ViewChild("visPop") visPop: PopoverDirective;
  private remInPx: number;

  popOverData: DevicePopoverData;
  notEnabled: string = 'Monitoring not enabled';
  dateFormat: string = environment.unityDateFormat;

  network: Network;
  constructor(private renderer: Renderer2,
    public userInfo: UserInfoService) { }

  nodes = new DataSet<Node>([
    { id: 1, label: "Node 1", fixed: true },
    { id: 2, label: "Node 2" },
    { id: 3, label: "Node 3" },
    { id: 4, label: "Node 4" },
    { id: 5, label: "Node 5" },
    { id: 6, label: "Node 6" }
  ]);

  edges = new DataSet<Edge>([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 6 }
  ]);

  data: Data = {
    nodes: this.nodes,
    edges: this.edges
  };
  options: Options = {
    layout: {
      hierarchical: {
        direction: "LR"
      }
    },
    edges: {
      arrows: "to"
    },
    interaction: {
      dragNodes: false,
      hover: true,
      hoverConnectedEdges: false
    },
    physics: {
      enabled: true,
      wind: { x: 1, y: 0 }
    }
  };

  ngOnInit() {
    this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.setHeight();
    this.drawNetwork();
  }

  drawNetwork() {
    this.network = new Network(this.visGraph.nativeElement, this.data, this.options);
    this.network.once('afterDrawing', (r: CanvasRenderingContext2D) => {
      this.renderer.setStyle((<HTMLElement>this.visGraph.nativeElement).firstChild, 'outline', 'none');
    });
    this.network.on('hoverNode', this.toggleTooltip.bind(this));
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

}
