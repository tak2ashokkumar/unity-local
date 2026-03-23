import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';

@Component({
  selector: 'bm-servers-stats-tab',
  templateUrl: './bm-servers-stats-tab.component.html',
  styleUrls: ['./bm-servers-stats-tab.component.scss']
})
export class BmServersStatsTabComponent implements OnInit, OnDestroy {
  statsUrl: string;
  tooltipMessage: string;

  private ngUnsubscribe = new Subject();
  constructor(private router: Router,
    private route: ActivatedRoute,
    private user: UserInfoService,
    private storage: StorageService) {
  }

  ngOnInit() {
    // this.statsUrl = this.storage.getByKey('statsurl', StorageType.SESSIONSTORAGE);
    this.setTooltipMessaage();
  }

  setTooltipMessaage() {
    if (this.user.isManagementEnabled) {
      if (this.statsUrl) {
        this.tooltipMessage = 'Open console in new tab';
      } else {
        this.tooltipMessage = 'Console not available';
      }
    } else {
      this.tooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('statsurl', StorageType.SESSIONSTORAGE);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}