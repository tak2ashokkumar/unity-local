import { Component, OnDestroy, OnInit } from '@angular/core';
import { Edge, Node } from '@swimlane/ngx-graph';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityNetworkTopologyService } from './unity-network-topology.service';


@Component({
  selector: 'unity-network-topology',
  templateUrl: './unity-network-topology.component.html',
  styleUrls: ['./unity-network-topology.component.scss'],
  providers: [UnityNetworkTopologyService]
})
export class UnityNetworkTopologyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  view: string = 'overview';
  infraElements: any[] = [];
  alerts: any[] = [];
  costDetails: any[] = [];

  nodes: Node[] = [];
  links: Edge[] = [];

  constructor(private svc: UnityNetworkTopologyService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,) {
    this.currentCriteria = { pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.svc.getGraphData().subscribe(data => {
      this.nodes = data.nodes;
      this.links = data.links;
    });
  }

  ngOnDestroy() {
    this.spinnerSvc.stop('unity-topology');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  switchView(data: TabDirective): void {
    this.view = data.id;
  }

  refreshServiceTopology() {
  }

  refreshInfraElements() {
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getData();
  }

  pageChange(pageNo: number) {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getData();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getData();
  }

  getData() {

  }

  onNodeClick(node: Node): void {
    console.log('Node clicked:', node);
  }


}
