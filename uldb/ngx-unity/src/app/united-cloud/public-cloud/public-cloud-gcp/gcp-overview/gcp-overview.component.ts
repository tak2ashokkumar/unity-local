import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { PublicCloudGCPDashboardService } from '../gcp-dashboard/gcp-dashboard.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'gcp-overview',
  templateUrl: './gcp-overview.component.html',
  styleUrls: ['./gcp-overview.component.scss'],
  providers: [PublicCloudGCPDashboardService]
})
export class GcpOverviewComponent implements OnInit {
  tabData: TabData[] = tabData;
  private ngUnsubscribe = new Subject();
  regions: Region[] = [];
  accountId: string;
  selectedRegionId: string;
  regionId: string;
  constructor(private router: Router,
    private dashboardService: PublicCloudGCPDashboardService,
    private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
      this.regionId = params.get('regionId');
      this.selectedRegionId = this.regionId;
    });
  }

  ngOnInit() {
    this.getRegions();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  goBack() {
    this.router.navigate(['/unitycloud/publiccloud/gcp'], { relativeTo: this.route });
  }

  goTo(tab: TabData) {
    this.router.navigate(['/unitycloud/publiccloud/gcp/overview/', this.accountId, this.regionId, tab.url]);
  }

  isActive(tab: TabData) {
    if (this.router.url.match('/unitycloud/publiccloud/gcp/overview/' + this.accountId + '/' + this.regionId + '/' + tab.url)) {
      return 'active text-success';
    }
  }

  getRegions() {
    this.dashboardService.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regions = res;
    });
  }

  changeRegion() {
    let element = null;
    for (let i = 0; i < this.tabData.length; i++) {
      if (this.router.url.match('/unitycloud/publiccloud/gcp/overview/' + this.accountId + '/' + this.regionId + '/' + this.tabData[i].url)) {
        element = this.tabData[i];
        break;
      }
    }
    this.router.navigate(['/unitycloud/publiccloud/gcp/overview/', this.accountId, this.selectedRegionId, element.url]);
  }
}


const tabData: TabData[] = [
  {
    name: 'Virtual Machines',
    url: 'vms'
  },
  {
    name: 'Snapshots',
    url: 'snapshots'
  },
  {
    name: 'Containers',
    url: 'containercontrollers'
  }
];