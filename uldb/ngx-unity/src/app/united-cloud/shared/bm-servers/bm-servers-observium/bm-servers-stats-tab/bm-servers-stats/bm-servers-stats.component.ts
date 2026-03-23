import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { BmServersStatsService, BmServerStats } from '../bm-servers-stats.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'bm-servers-stats',
  templateUrl: './bm-servers-stats.component.html',
  styleUrls: ['./bm-servers-stats.component.scss']
})
export class BmServersStatsComponent implements OnInit, OnDestroy {
  deviceId: string;
  private ngUnsubscribe = new Subject();
  stats: BmServerStats[];
  constructor(private route: ActivatedRoute,
    private statsService: BmServersStatsService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getStats();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.getStats();
    }, 0);
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getStats() {
    this.spinner.start('bmsstats');
    this.statsService.getSensorStats(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BmServerStats[]) => {
      this.stats = res;
      this.spinner.stop('bmsstats');
    }, err => {
      this.spinner.stop('bmsstats');
    });
  }
}