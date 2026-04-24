import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CloudWidgetViewData, PrivateCloudService } from '../private-cloud.service';
import { PCFastData } from '../pc-fast.type';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { takeUntil } from 'rxjs/operators';
import { WIDGET_DATA_ERROR } from '../../infra-as-a-service.constants';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { ClusterDataType, ClusterViewData, PrivateCloudWidgetClustersService, TopUsageItem } from './private-cloud-widget-clusters.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'private-cloud-widget-clusters',
  templateUrl: './private-cloud-widget-clusters.component.html',
  styleUrls: ['./private-cloud-widget-clusters.component.scss'],
  providers: [PrivateCloudService, PrivateCloudWidgetClustersService]
})
export class PrivateCloudWidgetClustersComponent implements OnInit, OnDestroy {
  @Input() pcData: PCFastData;
  @Input() showCost?: boolean = true;
  private ngUnsubscribe = new Subject();
  view: ClusterViewData = new ClusterViewData();
  dataError: string = null;
  popOverList: string[];
  constructor(private pcService: PrivateCloudService,
    private pcWidgetClustersService: PrivateCloudWidgetClustersService,
    private router: Router,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService,
    private storageService: StorageService) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.getCloudAllocations();
    this.pollForCloudsUpdate();
  }

  getCloudAllocations() {
    this.spinnerService.start(this.pcData.uuid);
    this.pcWidgetClustersService.getClusterAllocations(this.pcData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.view = this.pcWidgetClustersService.convertToPCWidgetViewData(this.pcData, data);
      this.spinnerService.stop(this.pcData.uuid);
    }, err => {
      this.dataError = WIDGET_DATA_ERROR;
      const msg = 'Problem ocurred in fetching allocations for Private Cloud ' + this.pcData.name + '. Please try again later.';
      this.notification.error(new Notification(msg));
      this.spinnerService.stop(this.pcData.uuid);
    })
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  pollForCloudsUpdate() {
    this.pcService.pollForCloudsUpdate(this.pcData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.getCloudAllocations();
    }, (err: HttpErrorResponse) => {
    });
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }

  showHighestHosts(view: ClusterViewData) {
    this.popOverList = view.extraHighestHosts;
  }

  goToClusterDetails(cluster: TopUsageItem){
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.storageService.put('cluster', { name: this.pcData.name, deviceType: DeviceMapping.CLUSTER, configured: true }, StorageType.SESSIONSTORAGE);    
    this.router.navigate(['/unitycloud/pccloud',this.pcData.uuid,'vcclusters',cluster.uuid,'hypervisors']);
  }

}