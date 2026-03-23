import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DataNodeViewData, FinOpsAlertsViewData, FinOpsCostElementsViewData, FinOpsInfraElementsViewData, UnityServiceTopologyService } from './unity-service-topology.service';
import { TabDirective } from 'ngx-bootstrap/tabs';

declare var LeaderLine: any;

@Component({
  selector: 'unity-service-topology',
  templateUrl: './unity-service-topology.component.html',
  styleUrls: ['./unity-service-topology.component.scss'],
  providers: [UnityServiceTopologyService]
})
export class UnityServiceTopologyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: DataNodeViewData;
  private nodeConnections: any[] = [];

  activeView: string = 'overview';
  infraElements: FinOpsInfraElementsViewData[] = [];
  alerts: FinOpsAlertsViewData[] = [];
  costElements: FinOpsCostElementsViewData[] = [];
  constructor(private svc: UnityServiceTopologyService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private zone: NgZone) {
    this.currentCriteria = { pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerSvc.start('main');
    setTimeout(() => {
      this.getTopologyData();
      this.getInfrastructureElements();
    })
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.nodeConnections?.forEach(line => {
      if (line) {
        line.remove();
      }
    });
    this.nodeConnections = [];
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshServiceTopology() {
    this.spinnerSvc.start('main');
    this.getTopologyData();
    this.switchView();
  }

  getTopologyData() {
    this.svc.getData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      let vd = this.svc.convertToNodesViewData(data);
      this.viewData = vd.getFirst();
      this.getSharedResources();
      this.spinnerSvc.stop('main');
    }, error => {
      this.spinnerSvc.stop('main');
      this.notificationSvc.error(error);
    });
  }

  getSharedResources() {
    this.svc.getSharedResources().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData.sharedResources = this.svc.convertToNodesViewData(data);
      this.spinnerSvc.stop('main');
      this.setUpLines();
    }, error => {
      this.spinnerSvc.stop('main');
      this.notificationSvc.error(error);
    });
  }

  setUpLines() {
    this.zone.runOutsideAngular(() => {
      this.viewData.sharedResources?.forEach(node => {
        node?.connectedFrom?.forEach(n => {
          setTimeout(() => {
            const startElem = document.getElementById(n);
            const endElem = document.getElementById(node.uuid);
            if (startElem && endElem) {
              const line = new LeaderLine(startElem, endElem, this.svc.getLeaderLineOptions(node.status));
              this.nodeConnections.push(line);
            }
          }, 500)
        })

        // node?.connectedTo?.forEach(n => {
        //   setTimeout(() => {
        //     const startElem = document.getElementById(node.uuid);
        //     const endElem = document.getElementById(n);
        //     const color = n.status === 'OK' ? 'green' : 'red';
        //     if (startElem && endElem) {
        //       const line = new LeaderLine(startElem, endElem, this.svc.getLeaderLineOptions(n.status));
        //       this.nodeConnections.push(line);
        //     }
        //   }, 500)
        // })
      })
    });
  }

  onNodeClick(node: Node): void {
    console.log('Node clicked:', node);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTopologyData();
  }

  pageChange(pageNo: number) {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTopologyData();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTopologyData();
  }

  switchView(data?: TabDirective): void {
    if (data) {
      if (data.id == this.activeView) {
        return;
      }
      this.activeView = data.id;
    }
    if (this.activeView) {
      setTimeout(() => {
        switch (this.activeView) {
          case 'overview':
            this.getInfrastructureElements();
            break;
          case 'alerts':
            this.getAlerts();
            break;
          case 'cost':
            this.getCostDetails();
            break;
        }
      })
    }
  }

  getInfrastructureElements() {
    this.spinnerSvc.start('infraElementsLoader');
    this.svc.getInfrastructureElements().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.infraElements = this.svc.convertToInfraElementsViewData(data);
      this.spinnerSvc.stop('infraElementsLoader');
    }, error => {
      this.spinnerSvc.stop('infraElementsLoader');
      this.infraElements = [];
      this.notificationSvc.error(error);
    });
  }

  getAlerts() {
    this.spinnerSvc.start('alertsLoader');
    this.svc.getAlerts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.alerts = this.svc.convertToAlertsViewData(data);
      this.spinnerSvc.stop('alertsLoader');
    }, error => {
      this.spinnerSvc.stop('alertsLoader');
      this.alerts = [];
      this.notificationSvc.error(error);
    });
  }

  getCostDetails() {
    this.spinnerSvc.start('costElementsLoader');
    this.svc.getCostDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.costElements = this.svc.convertToCostDetailsViewData(data);
      this.spinnerSvc.stop('costElementsLoader');
    }, error => {
      this.spinnerSvc.stop('costElementsLoader');
      this.costElements = [];
      this.notificationSvc.error(error);
    });
  }
}
