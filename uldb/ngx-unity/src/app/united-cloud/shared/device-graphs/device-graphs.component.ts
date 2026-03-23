import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { GraphSetType } from './device-graph-config';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceGraphsService } from './device-graphs.service';
import { DeviceGraphDetailType } from '../graph-details/graph-details.service';
import { GraphRange } from 'src/app/shared/SharedEntityTypes/graph-range.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'device-graphs',
  templateUrl: './device-graphs.component.html',
  styleUrls: ['./device-graphs.component.scss'],
  providers: [DeviceGraphsService]
})
export class DeviceGraphsComponent implements OnInit, OnDestroy {
  @Input() data: DeviceGraphType;
  graphSet: GraphSetType;
  found: boolean = true;
  private ngUnsubscribe = new Subject();
  constructor(private router: Router, private route: ActivatedRoute, private storage: StorageService,
    private graphService: DeviceGraphsService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getGraphSet();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.getGraphSet();
    }, 0);
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  goToGraphDetail(param: GraphRange) {
    this.storage.put('graphdata', <DeviceGraphDetailType>Object.assign(this.data, { 'graphRange': param }), StorageType.SESSIONSTORAGE);
    this.router.navigate(['details'], { relativeTo: this.route });
  }

  getGraphSet() {
    this.spinner.start(this.data.graphType);
    this.graphService.getGraph(this.data).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: GraphSetType) => {
      this.spinner.stop(this.data.graphType);
      this.graphSet = res;
    }, err => {
      this.found = false;
      this.spinner.stop(this.data.graphType);
    });
  }
}