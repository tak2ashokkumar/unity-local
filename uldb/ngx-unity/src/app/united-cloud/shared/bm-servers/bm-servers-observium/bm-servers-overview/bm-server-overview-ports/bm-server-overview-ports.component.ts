import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BmServersOverviewService } from '../bm-servers-overview.service';
import { DeviceGraphData } from '../../../../entities/device-graph.type';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'bm-server-overview-ports',
  templateUrl: './bm-server-overview-ports.component.html',
  styleUrls: ['./bm-server-overview-ports.component.scss']
})
export class BmServerOverviewPortsComponent implements OnInit, OnDestroy {
  @Input() deviceId: string;
  graph: DeviceGraphData;
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private overviewService: BmServersOverviewService,
    private refreshService: DataRefreshBtnService) {
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getGraph();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.getGraph();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getGraph() {
    this.spinnerService.start('bmsop');
    this.overviewService.getPortsGraph(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceGraphData) => {
      this.spinnerService.stop('bmsop');
      this.graph = res;
    }, err => {
      this.spinnerService.stop('bmsop');
    });
  }

}
