import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BmServersOverviewService } from '../bm-servers-overview.service';
import { DeviceGraphData } from '../../../../entities/device-graph.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'bm-server-overview-memory',
  templateUrl: './bm-server-overview-memory.component.html',
  styleUrls: ['./bm-server-overview-memory.component.scss']
})
export class BmServerOverviewMemoryComponent implements OnInit, OnDestroy {
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
    this.spinnerService.start('bmsom');
    this.overviewService.getMemoryGraph(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceGraphData) => {
      this.spinnerService.stop('bmsom');
      this.graph = res;
    }, err => {
      this.spinnerService.stop('bmsom');
    });
  }

}
