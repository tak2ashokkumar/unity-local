import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { VmsOverviewService } from '../vms-overview.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceGraphData } from 'src/app/united-cloud/shared/entities/device-graph.type';

@Component({
  selector: 'vms-overview-processors',
  templateUrl: './vms-overview-processors.component.html',
  styleUrls: ['./vms-overview-processors.component.scss']
})
export class VmsOverviewProcessorsComponent implements OnInit, OnDestroy {
  @Input() deviceType: DeviceMapping;
  @Input() deviceId: string;
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
    this.spinnerService.start('vmsopr');
    this.overviewService.getProcessorGraph(this.deviceId, this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceGraphData) => {
      this.spinnerService.stop('vmsopr');
      this.graph = res;
    }, err => {
      this.spinnerService.stop('vmsopr');
    });
  }

}
