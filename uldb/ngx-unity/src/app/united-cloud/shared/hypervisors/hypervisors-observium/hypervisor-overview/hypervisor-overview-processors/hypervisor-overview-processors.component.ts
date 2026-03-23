import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HypervisorOverviewService } from '../hypervisor-overview.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceGraphData } from '../../../../entities/device-graph.type';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'hypervisor-overview-processors',
  templateUrl: './hypervisor-overview-processors.component.html',
  styleUrls: ['./hypervisor-overview-processors.component.scss']
})
export class HypervisorOverviewProcessorsComponent implements OnInit, OnDestroy {
  @Input() deviceId: string;
  graph: DeviceGraphData;
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private overviewService: HypervisorOverviewService,
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
    this.spinnerService.start('hyopr');
    this.overviewService.getProcessorGraph(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceGraphData) => {
      this.spinnerService.stop('hyopr');
      this.graph = res;
    }, err => {
      this.spinnerService.stop('hyopr');
    });
  }

}
