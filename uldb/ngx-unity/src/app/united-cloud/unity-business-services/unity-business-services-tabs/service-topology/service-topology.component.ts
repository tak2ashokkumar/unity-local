import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StatusSummary } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { BUCostCenterApplications, BULicenceCostCenter, BusinessUnits } from '../../unity-business-services.type';
import { AppCommonTopologyService } from './app-common-topology/app-common-topology.service';
import { ConnectedLink, ConnectedNode, ConnectedNodesResponse } from './app-common-topology/app-common-topology.type';
import { ServiceTopologyService, UnityTopologyViewType } from './service-topology.service';

@Component({
  selector: 'service-topology',
  templateUrl: './service-topology.component.html',
  styleUrls: ['./service-topology.component.scss'],
  providers: [AppCommonTopologyService]
})
export class ServiceTopologyComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  buId: string;

  businessUnits: BusinessUnits[] = [];
  licenseCostCenters: BULicenceCostCenter[] = [];
  selectedLCCs: number[] = [];
  applications: BUCostCenterApplications[] = [];
  selectedApps: number[] = [];
  form: FormGroup;
  nodeStatusFilterForm: FormGroup;

  tabs = tabs;
  selectedTab = 0;
  selectedTabIndex = 0;
  selectedView = this.tabs[0].name;
  pageTitle: String = 'All Applications';
  hideInactive = false;
  hideUnconnected = false;
  viewTypes: UnityTopologyViewType[] = [];
  firstLoad: Boolean = false;
  // statusSummary: StatusSummary;
  activeSummary: StatusSummary;
  selectedNodeStatus: string = "all";

  // Elongated Lane Topology State (Dynatrace Smartscape)
  isElongated: boolean = false;
  selectedDrilldownNode: any = null;
  laneNodesByLayer: { [layer: string]: ConnectedNode[] } = {};
  laneLinks: ConnectedLink[] = [];
  drilldownStack: { node: any; laneNodes: { [layer: string]: ConnectedNode[] }; links: any[] }[] = [];
  elongatedLoading: boolean = false;

  constructor(private svc: ServiceTopologyService,
    private commonTopologySvc: AppCommonTopologyService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private cdr: ChangeDetectorRef) {
    this.route.parent?.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.firstLoad = true;
      this.buId = params.get('businessId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getBusinessUnits();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getBusinessUnits() {
    this.businessUnits = [];
    this.svc.getBusinessUnits().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.businessUnits = data;
        this.getLicenseCostCenters(this.buId);
      } else {
        this.businessUnits = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.businessUnits = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Business Unit Data'));
    });
  }

  getLicenseCostCenters(buId: string) {
    this.licenseCostCenters = [];
    this.svc.getLisenceCostCenters(buId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.licenseCostCenters = data;
        this.selectedLCCs = [...this.licenseCostCenters.map(lcc => lcc.license_centre_id)];
        this.getApplications(buId, this.selectedLCCs);
      } else {
        this.licenseCostCenters = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.licenseCostCenters = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch License Cost Data'));
    });
  }

  getApplications(businessUnitId: string, costCenterIds: number[]) {
    this.applications = [];
    this.svc.getApplications(businessUnitId, costCenterIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.applications = data;
        this.selectedApps = this.applications.map(app => app.app_name_id);
        this.buildFilterForm();
      } else {
        this.applications = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.applications = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Application Data'));
    });
  }

  buildFilterForm() {
    this.form = this.svc.buildForm(this.buId);
    this.nodeStatusFilterForm = this.svc.buildNodeStatusFilterForm();
    // this.getWidgetsData();

    this.form.get('licenseCostCenter')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(lcc => {
      this.resetSmartscapeIfOpen();
      if (lcc === 'all') {
        this.selectedLCCs = this.licenseCostCenters.map(lcc => lcc.license_centre_id);
        // this.getWidgetsData();
      } else {
        this.selectedLCCs = [lcc];
      }
      this.onChangeLCCFilter();
    });

    this.form.get('application')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(app => {
      this.resetSmartscapeIfOpen();
      if (app === 'all') {
        this.selectedApps = this.applications.map(app => app.app_name_id);
      } else {
        this.selectedApps = [app];
      }
      // this.getWidgetsData();
    });

    this.nodeStatusFilterForm.get('nodeStatus')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.resetSmartscapeIfOpen();
      this.selectedNodeStatus = status;
    });

    this.spinner.stop('main');
  }

  async onChangeLCCFilter() {
    this.applications = await this.svc.getApplications(this.buId, this.selectedLCCs).toPromise();
    this.form.get('application')?.setValue('all', { emitEvent: true });
  }

  selectTab(i: number) {
    this.selectedTabIndex = i;
    this.selectedView = this.tabs[i].name;   // pass the tab value
  }

  setTopologyLayerByName(layer: string) {
    const tabIndex = this.tabs.findIndex(tab => tab.name === layer);
    if (tabIndex === -1) return;

    this.selectedTabIndex = tabIndex;
    this.selectedView = layer;
  }

  onTabRowClick(i: number) {
    if (this.isElongated) {
      this.collapseElongatedPanel();
    }
    this.selectTab(i);
  }

  handleStatusSummary(summary: StatusSummary) {
    this.activeSummary = summary;
    // Now you can bind this to your legends or anywhere in parent
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isElongated) {
      this.recalculateLinkPaths();
    }
  }

  onTopologyNodeClicked(event: any) {
    if (!event) return;
    const node = event.node || event;
    const localNodes: any[] = event.localNodes || [];
    const localLinks: any[] = event.localLinks || [];

    this.selectedDrilldownNode = node;
    this.isElongated = true;
    this.elongatedLoading = true;

    // Immediately display clicked node and locally connected nodes/links from graph
    const initialLocalNodes = localNodes.length > 0 ? localNodes : [node];
    this.populateLanes({ nodes: initialLocalNodes, links: localLinks }, node);

    const serviceId = node.monitored_id;

    this.commonTopologySvc.getNodeMap(serviceId, node.uuid).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.elongatedLoading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.recalculateLinkPaths(), 100);
      })
    ).subscribe(
      (res: ConnectedNodesResponse) => {
        this.mergeAndPopulateLanes(res, localNodes, localLinks, node);
      },
      (err) => {
        this.populateLanes({ nodes: initialLocalNodes, links: localLinks }, node);
      }
    );
  }

  mergeAndPopulateLanes(res: ConnectedNodesResponse, localNodes: any[], localLinks: any[], clickedNode: any) {
    const nodeMap = new Map<string, any>();
    nodeMap.set(clickedNode.uuid, clickedNode);

    (localNodes || []).forEach(n => {
      if (n && n.uuid) nodeMap.set(n.uuid, n);
    });

    (res?.nodes || []).forEach(n => {
      if (n && n.uuid) {
        const existing = nodeMap.get(n.uuid);
        nodeMap.set(n.uuid, { ...(existing || {}), ...n });
      }
    });

    const linkMap = new Map<string, ConnectedLink>();
    (localLinks || []).forEach(l => {
      const src = l.source_uuid || l.source;
      const tgt = l.target_uuid || l.target;
      if (src && tgt) {
        linkMap.set(`${src}->${tgt}`, { source_uuid: src, target_uuid: tgt });
      }
    });
    (res?.links || []).forEach(l => {
      const src = l.source_uuid || l.source;
      const tgt = l.target_uuid || l.target;
      if (src && tgt) {
        linkMap.set(`${src}->${tgt}`, { source_uuid: src, target_uuid: tgt });
      }
    });

    this.populateLanes({
      nodes: Array.from(nodeMap.values()),
      links: Array.from(linkMap.values())
    }, clickedNode);
  }

  populateLanes(res: ConnectedNodesResponse, clickedNode: any) {
    const rawNodes = res?.nodes ? [...res.nodes] : [];
    if (!rawNodes.some(n => n.uuid === clickedNode.uuid)) {
      rawNodes.unshift(clickedNode);
    }

    this.laneNodesByLayer = {
      application: [],
      service: [],
      component: [],
      process: [],
      database: [],
      host: [],
      physical_layer: []
    };

    rawNodes.forEach(node => {
      const isRoot = node.uuid === clickedNode.uuid;
      const nodeWithRoot: ConnectedNode = { ...node, isRoot };
      const layer = this.mapToTabLayer(node.layer, node.type, isRoot);
      if (this.laneNodesByLayer[layer]) {
        this.laneNodesByLayer[layer].push(nodeWithRoot);
      } else {
        this.laneNodesByLayer['service'].push(nodeWithRoot);
      }
    });

    const links = res?.links ? [...res.links] : [];
    if (links.length === 0) {
      rawNodes.forEach(n => {
        if (n.uuid !== clickedNode.uuid) {
          links.push({
            source_uuid: clickedNode.uuid,
            target_uuid: n.uuid
          });
        }
      });
    }

    this.laneLinks = links;
    this.cdr.markForCheck();
    setTimeout(() => this.recalculateLinkPaths(), 60);
    setTimeout(() => this.recalculateLinkPaths(), 250);
  }

  mapToTabLayer(rawLayer: string, rawType?: string, isRootNode?: boolean): string {
    const layerStr = (rawLayer || '').toLowerCase().trim();
    const typeStr = (rawType || '').toLowerCase().trim();

    // Check specific layer or type keywords
    if (layerStr.includes('component') || typeStr.includes('component')) {
      return 'component';
    }
    if (layerStr.includes('process') || typeStr.includes('process')) {
      return 'process';
    }
    if (layerStr.includes('database') || layerStr.includes('db') || layerStr.includes('messaging') ||
      typeStr.includes('database') || typeStr.includes('db') || typeStr.includes('messaging') ||
      layerStr.includes('redis') || layerStr.includes('kafka') || layerStr.includes('sql')) {
      return 'database';
    }
    if (layerStr.includes('host') || layerStr.includes('infra') || layerStr.includes('server') ||
      typeStr.includes('host') || typeStr.includes('infra') || typeStr.includes('server') ||
      layerStr.includes('bmserver') || layerStr.includes('vm')) {
      return 'host';
    }
    if (layerStr.includes('cloud') || layerStr.includes('datacenter') || layerStr.includes('data center') ||
      layerStr.includes('data_center') || layerStr.includes('physical') ||
      typeStr.includes('cloud') || typeStr.includes('datacenter')) {
      return 'physical_layer';
    }
    if (layerStr.includes('service') || typeStr.includes('service')) {
      return 'service';
    }
    if (layerStr.includes('application') || typeStr.includes('application')) {
      return 'application'
    }

    if (isRootNode && this.selectedView) {
      return this.selectedView;
    }

    return 'service';
  }

  onLaneNodeClick(node: ConnectedNode) {
    if (node.uuid === this.selectedDrilldownNode?.uuid) return;
    const layer = this.mapToTabLayer(node.layer, node.type, true);
    this.setTopologyLayerByName(layer);
    this.drilldownStack.push({
      node: this.selectedDrilldownNode,
      laneNodes: { ...this.laneNodesByLayer },
      links: [...this.laneLinks]
    });
    this.onTopologyNodeClicked(node);
  }

  navigateBackDrilldown() {
    if (this.drilldownStack.length > 0) {
      const prev = this.drilldownStack.pop();
      if (prev) {
        this.selectedDrilldownNode = prev.node;
        const layer = this.mapToTabLayer(prev.node?.layer, prev.node?.type, true);
        this.setTopologyLayerByName(layer);
        this.laneNodesByLayer = prev.laneNodes;
        this.laneLinks = prev.links;
        this.cdr.markForCheck();
        setTimeout(() => this.recalculateLinkPaths(), 150);
      }
    } else {
      this.collapseElongatedPanel();
    }
  }

  resetSmartscapeIfOpen() {
    if (this.isElongated) {
      this.collapseElongatedPanel();
    }
  }

  collapseElongatedPanel() {
    this.isElongated = false;
    this.selectedDrilldownNode = null;
    this.laneNodesByLayer = {};
    this.laneLinks = [];
    this.drilldownStack = [];
    this.cdr.markForCheck();
  }

  recalculateLinkPaths() {
    const container = document.getElementById('lane-topology-container');
    if (!container || !this.laneLinks || this.laneLinks.length === 0) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const updatedLinks = [];

    for (const link of this.laneLinks) {
      const srcId = link.source_uuid || (link as any).source;
      const tgtId = link.target_uuid || (link as any).target;

      const srcEl = document.getElementById('lane-node-' + srcId);
      const tgtEl = document.getElementById('lane-node-' + tgtId);

      if (srcEl && tgtEl) {
        const srcRect = srcEl.getBoundingClientRect();
        const tgtRect = tgtEl.getBoundingClientRect();

        let x1: number, y1: number, x2: number, y2: number, pathD: string;

        if (Math.abs(srcRect.top - tgtRect.top) < 20) {
          x1 = srcRect.right - containerRect.left;
          y1 = srcRect.top + srcRect.height / 2 - containerRect.top;
          x2 = tgtRect.left - containerRect.left;
          y2 = tgtRect.top + tgtRect.height / 2 - containerRect.top;
          const cx = (x1 + x2) / 2;
          pathD = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
        } else if (srcRect.top < tgtRect.top) {
          x1 = srcRect.left + srcRect.width / 2 - containerRect.left;
          y1 = srcRect.bottom - containerRect.top;
          x2 = tgtRect.left + tgtRect.width / 2 - containerRect.left;
          y2 = tgtRect.top - containerRect.top;
          const cy = (y1 + y2) / 2;
          pathD = `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
        } else {
          x1 = srcRect.left + srcRect.width / 2 - containerRect.left;
          y1 = srcRect.top - containerRect.top;
          x2 = tgtRect.left + tgtRect.width / 2 - containerRect.left;
          y2 = tgtRect.bottom - containerRect.top;
          const cy = (y1 + y2) / 2;
          pathD = `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
        }

        updatedLinks.push({
          source_uuid: srcId,
          target_uuid: tgtId,
          pathD
        });
      }
    }

    this.laneLinks = updatedLinks;
    this.cdr.markForCheck();
  }

  getNodeStatusClass(status: number | string): string {
    const s = Number(status);
    if (s === 1) return 'healthy';
    if (s === 0) return 'down';
    return 'unknown';
  }

  getNodeIconClass(node: ConnectedNode): string {
    const layer = (node.layer || '').toLowerCase();
    const type = (node.type || '').toLowerCase();
    const icon = (node.icon || '').toLowerCase();

    if (layer.includes('component') || type.includes('component')) return 'fa fa-puzzle-piece text-secondary';
    if (layer.includes('process') || type.includes('process')) return 'fa fa-microchip text-warning';
    if (layer.includes('database') || type.includes('database') || type.includes('db') || icon.includes('database')) return 'fa fa-database text-danger';
    if (layer.includes('host') || type.includes('host') || type.includes('server') || layer.includes('infra')) return 'fa fa-server text-dark';
    if (layer.includes('cloud') || layer.includes('data') || type.includes('cloud') || type.includes('datacenter')) return 'fa fa-cloud text-info';
    if (layer.includes('service') || type.includes('service')) return 'fa fa-cogs text-info';
    if (layer.includes('application') || type.includes('application')) return 'fa fa-cog text-info';
    return 'fa fa-circle text-muted';
  }

  goToApplication(node: any) {
    if (!node) return;
    if (node.type === 'service' && node.app_id && node.monitored_id) {
      this.router.navigate(['/unitycloud/applications', node.app_id, 'services', node.monitored_id, 'details']);
    } else {
      this.router.navigate(['/unitycloud/devices']);
    }
  }

  trackByNodeUuid(index: number, node: ConnectedNode): string {
    return node?.uuid || String(index);
  }

  trackByLink(index: number, link: ConnectedLink): string {
    return `${link?.source_uuid || ''}-${link?.target_uuid || ''}-${index}`;
  }

  trackByTabName(index: number, tab: any): string {
    return tab?.name || String(index);
  }

}

export const tabs = [
  { label: 'Applications', name: 'application', icon: 'fa fa-cog' },
  { label: 'App Services', name: 'service', icon: 'fa fa-cogs' },
  { label: 'App Components', name: 'component', icon: 'fa fa-puzzle-piece' },
  { label: 'App Processes', name: 'process', icon: 'fa fa-microchip' },
  { label: 'Data Messaging Services', name: 'database', icon: 'fa fa-database' },
  { label: 'Host', name: 'host', icon: 'fa fa-server' },
  { label: 'Physical & Cloud Infrastructure', name: 'physical_layer', icon: 'fa fa-cloud' }
];
