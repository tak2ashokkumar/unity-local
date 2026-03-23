import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceGraphData } from '../../../../entities/device-graph.type';
import { BmServersOverviewService } from '../bm-servers-overview.service';

@Component({
  selector: 'bm-server-overview-processors',
  templateUrl: './bm-server-overview-processors.component.html',
  styleUrls: ['./bm-server-overview-processors.component.scss']
})
export class BmServerOverviewProcessorsComponent implements OnInit, OnDestroy {
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
    this.spinnerService.start('bmsopr');
    this.overviewService.getProcessorGraph(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceGraphData) => {
      this.spinnerService.stop('bmsopr');
      this.graph = res;
    }, err => {
      this.spinnerService.stop('bmsopr');
    });
  }
}
