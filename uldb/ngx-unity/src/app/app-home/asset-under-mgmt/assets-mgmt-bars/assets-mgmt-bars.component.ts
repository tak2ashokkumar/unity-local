import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ViewStats, AssetUnderMgmtService, PercentData } from '../asset-under-mgmt.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'assets-mgmt-bars',
  templateUrl: './assets-mgmt-bars.component.html',
  styleUrls: ['./assets-mgmt-bars.component.scss']
})
export class AssetsMgmtBarsComponent implements OnInit, OnDestroy {
  @Input() barData: ViewStats;
  public percentData: PercentData = new PercentData();
  private ngUnsubscribe = new Subject();
  constructor(private assetsUnderMgmtService: AssetUnderMgmtService) {
    this.assetsUnderMgmtService.statsChange$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.calculatePercent();
    })
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  calculatePercent() {
    this.percentData = this.assetsUnderMgmtService.calculateGraphPercentage(this.barData);
  }

}
