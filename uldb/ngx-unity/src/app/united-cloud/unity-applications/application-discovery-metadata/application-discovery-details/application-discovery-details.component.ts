import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { clone as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityViewNetworkTopologyNode } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { LayoutOptions, UnityNetworkTopologyViewData, UnityTopologyConfigService } from 'src/app/shared/unity-topology-config.service';
import { Data, Network, Options } from 'vis-network/standalone';
import { ApplicationDiscoveryDetailsService, DetailsWidgetGraphViewData, LatestMetricValueViewData, ServerUtilizationViewData, TopLogsAndTracesViewData, UtilizationOverviewViewData } from './application-discovery-details.service';
import { UnityAplicationTopologyViewData, UnityApplicationTopologyConfigService } from 'src/app/shared/unity-application-topology-config.service';
import { ApplicationNetworkTopologyNode, UnityApplicationTopology } from 'src/app/shared/SharedEntityTypes/unity-application-topology.type';


@Component({
  selector: 'application-discovery-details',
  templateUrl: './application-discovery-details.component.html',
  styleUrls: ['./application-discovery-details.component.scss'],
  providers: [ApplicationDiscoveryDetailsService]
})
export class ApplicationDiscoveryDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;

  serverInformationViewData: ServerUtilizationViewData;
  count: number;
  tracingCurrentCriteria: SearchCriteria;
  logsCurrentCriteria: SearchCriteria;
  MetricsData: any;
  logsAndTracesViewData: TopLogsAndTracesViewData;
  serverUtilizationViewData: any;
  utilizationTrend: DetailsWidgetGraphViewData = new DetailsWidgetGraphViewData();
  MetricsInfoViewData: LatestMetricValueViewData[] = [];
  utilizationOverviewViewData: UtilizationOverviewViewData;

  @ViewChild("visGraph", { static: true }) visGraph: ElementRef;
  network: Network;
  options: Options;
  isNetworkStable: boolean = false;
  private remInPx: number;
  networkViewData: UnityAplicationTopologyViewData = new UnityAplicationTopologyViewData();
  nodeDetailsRef: any;
  hoveredNode: ApplicationNetworkTopologyNode;
  showNodeInfo: boolean = false;

  constructor(private svc: ApplicationDiscoveryDetailsService,
    private topologySvc: UnityApplicationTopologyConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private renderer: Renderer2,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceId');
    });
  }

  ngOnInit(): void {
    this.utilizationOverviewViewData = this.svc.utilizationOverviewViewData();
    // this.nodeDetailsRef = document.getElementById('node-details-wrapper');
    setTimeout(() => {
      this.getServerInfo();
      this.getTopologyData();
      // this.getUtilizationOverviewData();
      this.getMetricsApplicationInfo();
      this.getRecentLogsAndTracesData();
    })
  }

  ngOnDestroy() {
    this.destroyNetwork();
    this.spinner.stop('main');
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

  getServerInfo() {
    this.spinner.start('serverInfoLoader');
    this.svc.getServerInfo(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.serverInformationViewData = this.svc.convertToServerUtilizationViewData(data);
      this.spinner.stop('serverInfoLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('serverInfoLoader');
      this.notification.error(new Notification('Failed to get Server Utilization Data'));
    });
  }

  topologyResponse : UnityApplicationTopology;
  getTopologyData() {
    // this.spinner.start('topologyLoader');
    // this.options = Object.assign({}, this.topologySvc.getOptions());
    // this.remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.svc.getTopologyData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.topologyResponse = data;
      // let networkData = this.topologySvc.convertToViewData(data.topology_data);
      // if (networkData.nodes && networkData.nodes.length) {
      //   this.networkViewData = networkData;
      //   this.drawNetwork();
      // } else {
      //   setTimeout(() => {
      //     this.spinner.stop('topologyLoader');
      //   }, 0)
      // }
    }, (err: HttpErrorResponse) => {
      // this.spinner.stop('topologyLoader');
      this.notification.error(new Notification('Failed to get topology data'));
    });
  }

  // @HostListener('window:resize')
  // setHeight() {
  //   const height = Math.floor(window.innerHeight) - Math.floor(this.visGraph.nativeElement.parentElement.getBoundingClientRect().top) - Math.floor(this.remInPx);
  //   if (height > 250) {
  //     this.renderer.setStyle(this.visGraph.nativeElement, 'height', '250px');
  //   } else {
  //     this.renderer.setStyle(this.visGraph.nativeElement, 'height', height + 'px');
  //   }
  // }

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
        // this.setHeight();
        this.network.fit({ animation: true });
        // this.spinner.stop('topologyLoader');
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

  getUtilizationOverviewData() {
    this.spinner.start('utilizationTrendLoader');
    this.utilizationOverviewViewData.utilizationRateChartData = null;
    this.svc.getUtilizationOverviewData(this.utilizationOverviewViewData?.formData?.from, this.utilizationOverviewViewData?.formData?.to, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.utilizationOverviewViewData.utilizationRateChartDataAndOthers = this.svc.convertToUtilizationChartViewData(res);
      this.utilizationOverviewViewData.utilizationRateChartData = this.svc.getUtilizationChartOptions(this.utilizationOverviewViewData.utilizationRateChartDataAndOthers);
      this.spinner.stop('utilizationTrendLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Utilization Graph Details'));
    });
  }

  onUtilizationWidgetFormChanged(event: any) {
    this.utilizationOverviewViewData.formData = event;
    this.getUtilizationOverviewData();
  }

  getMetricsApplicationInfo() {
    this.svc.getMetricsApplicationInfo(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.MetricsInfoViewData = this.svc.convertToMetricsApplicationViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get metrics data'));
    });
  }

  getRecentLogsAndTracesData() {
    this.svc.getRecentLogsAndTracesData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.logsAndTracesViewData = this.svc.convertToLogsAndTracesViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Recent Logs And Traces Data'));
    });
  }

  goToTraces() {
    this.router.navigate(['application-traces'], { relativeTo: this.route.parent })
  }

  goToLogs() {
    this.router.navigate(['application-log'], { relativeTo: this.route.parent })
  }

}
