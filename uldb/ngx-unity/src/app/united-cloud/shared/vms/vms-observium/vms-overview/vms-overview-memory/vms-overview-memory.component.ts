import { Component, OnInit, Input } from '@angular/core';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { VmsOverviewService } from '../vms-overview.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceGraphData } from 'src/app/united-cloud/shared/entities/device-graph.type';

@Component({
  selector: 'vms-overview-memory',
  templateUrl: './vms-overview-memory.component.html',
  styleUrls: ['./vms-overview-memory.component.scss']
})
export class VmsOverviewMemoryComponent implements OnInit {

  @Input() deviceId: string;
  @Input() deviceType: DeviceMapping;
  graph: DeviceGraphData;
  private ngUnsubscribe = new Subject();

  constructor(private spinnerService: AppSpinnerService,
    private overviewService: VmsOverviewService,
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
    this.spinnerService.start('vmsom');
    this.overviewService.getMemoryGraph(this.deviceId, this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceGraphData) => {
      this.spinnerService.stop('vmsom');
      this.graph = res;
    }, err => {
      this.spinnerService.stop('vmsom');
    });
  }
}
