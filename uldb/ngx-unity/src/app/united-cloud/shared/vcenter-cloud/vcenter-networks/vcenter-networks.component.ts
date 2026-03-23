import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DistributedPortGroupsViewdata, DistributedSwitchesViewdata, NetworksSummaryViewdata, NetworksViewdata, VcenterNetworksService } from './vcenter-networks.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UnitedCloudSharedService } from '../../united-cloud-shared.service';

@Component({
  selector: 'vcenter-networks',
  templateUrl: './vcenter-networks.component.html',
  styleUrls: ['./vcenter-networks.component.scss'],
  providers: [VcenterNetworksService]
})
export class VcenterNetworksComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  activeCloud: PrivateCLoudFast;
  cloudAPIType: string;
  currentCriteria: SearchCriteria;
  selectedView: string = 'networks';

  networksSummaryViewData: NetworksSummaryViewdata = new NetworksSummaryViewdata();
  networksCount: number = 0;
  networksViewData: NetworksViewdata[] = [];
  distributedSwitchesCount: number = 0;
  distributedSwitchesViewData: DistributedSwitchesViewdata[] = [];
  distributedPortGroupsCount: number = 0;
  distributedPortGroupsViewData: DistributedPortGroupsViewdata[] = [];

  clusterId: string;
  constructor(private notificationService: AppNotificationService,
    private svc: VcenterNetworksService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private sharedSvc: UnitedCloudSharedService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      if (params.has('pcId')) {
        this.pcId = params.get('pcId');
        this.route.parent.data.subscribe((data) => {
          if (this.pcId) {
            this.activeCloud = data.tabItems.find((ti: PrivateCLoudFast) => ti.uuid == this.pcId);
            if (this.activeCloud) {
              this.cloudAPIType = this.sharedSvc.getCloudNameForEndpoint(this.activeCloud.platform_type);
            }
          }
        });
      } else if (params.has('clusterId')) {
        this.clusterId = params.get('clusterId');
        this.route.parent.parent.paramMap.subscribe((pms: ParamMap) => {
          if (pms.has('pcId')) {
            this.pcId = pms.get('pcId');
            this.route.parent.parent.data.subscribe((data) => {
              if (this.pcId) {
                this.activeCloud = data.tabItems.find((ti: PrivateCLoudFast) => ti.uuid == this.pcId);
                if (this.activeCloud) {
                  this.cloudAPIType = this.sharedSvc.getCloudNameForEndpoint(this.activeCloud.platform_type);
                }
              }
            });
          }
        })
      }
    });

  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getNetworksSummary();
    this.getNetworks();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.manageAPICallBasedOnView(this.selectedView);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.manageAPICallBasedOnView(this.selectedView);
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.manageAPICallBasedOnView(this.selectedView);
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.manageAPICallBasedOnView(this.selectedView);
  }

  getSelectedView(view: string) {
    if (this.selectedView != view) {
      this.spinner.start('main');
      this.selectedView = view;
      this.currentCriteria.pageNo = 1;
      this.manageAPICallBasedOnView(this.selectedView);
    }
  }

  manageAPICallBasedOnView(view: string) {
    switch (view) {
      case 'networks':
        this.getNetworks();
        break;
      case 'distributedSwitches':
        this.getDistributedSwitches();
        break;
      case 'distributedPortGroups':
        this.getDistributedPortGroups();
        break;
      default:
        break;
    }
  }

  getNetworksSummary() {
    this.svc.getNetworksSummary(this.pcId, this.cloudAPIType, this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.networksSummaryViewData = this.svc.convertToNetworksSummaryViewData(res);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to fetch networks summary. Please try again.'));
    });
  }

  getNetworks() {
    this.svc.getNetworks(this.currentCriteria, this.pcId, this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.networksCount = res.count;
      this.networksViewData = this.svc.convertToNetworksViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to fetch networks. Please try again.'));
    });
  }

  getDistributedSwitches() {
    this.svc.getDistributedSwitches(this.currentCriteria, this.pcId, this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.distributedSwitchesCount = res.count;
      this.distributedSwitchesViewData = this.svc.convertToDistributedSwitchesViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to fetch distributed switches. Please try again.'));
    });
  }

  getDistributedPortGroups() {
    this.svc.getDistributedPortGroups(this.currentCriteria, this.pcId, this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.distributedPortGroupsCount = res.count;
      this.distributedPortGroupsViewData = this.svc.convertToDistributedPortGroupsViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to fetch distributed port groups. Please try again.'));
    });
  }

}
